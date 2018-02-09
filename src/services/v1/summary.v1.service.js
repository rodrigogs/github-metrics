const debug = require('debug')('github-metrics:services:v1:summary');

const Project = require('../../models/v1/project.v1.model');
const Column = require('../../models/v1/column.v1.model');
const Card = require('../../models/v1/card.v1.model');
const CardEvent = require('../../models/v1/card_event.v1.model');
const Issue = require('../../models/v1/issue.v1.model');
const IssueEvent = require('../../models/v1/issue_event.v1.model');
const Summary = require('../../models/v1/summary.v1.model');
const RootCause = require('../../models/v1/root_cause.v1.model');
const Label = require('../../models/v1/label.v1.model');
const AuthService = require('../../services/auth.service');
const logger = require('../../config/logger');
const RedisProvider = require('../../providers/redis.provider');

/**
 * @param issue
 * @return {Promise.<Array>}
 * @private
 */
const _findRootCauses = async (issue) => {
  debug('looking for root causes for issue', issue.id);

  if (!issue) return [];
  const rootCauses = await RootCause.find({}).exec();
  return rootCauses.filter((cause) => {
    return issue.body.search(cause.pattern) !== -1;
  });
};

/**
 * @param issue
 * @return {Array}
 * @private
 */
const _findCustomStatuses = (issue) => {
  debug('looking for custom statuses for issue', issue.id);

  if (!issue) return [];
  return (issue.title.match(/\[(.*?)]/g) || []).map((match) => {
    return match.replace('[', '').replace(']', '');
  });
};

/**
 * @param Schema
 * @private
 */
const _saveOrUpdate = Schema => (oldObj, newObj) => {
  debug('saving data for entity', Schema.modelName);
  if (oldObj) return Object.assign(oldObj, newObj).save();
  return new Schema(newObj).save();
};

/**
 * @param Schema
 * @private
 */
const _resolveReference = Schema => async (field, url) => {
  if (!url) return null;

  const query = {};
  query[field] = url;

  const cached = await RedisProvider.safeGet(JSON.stringify(query));
  if (cached) return new Schema(JSON.parse(cached));

  const old = await Schema.findOne(query);
  try {
    const request = await AuthService.buildGitHubRequest();
    const req = await request.get(url);
    const ref = req.data;

    if (req.status !== 200) return old;

    await _saveOrUpdate(Schema)(old, ref);

    RedisProvider.set(JSON.stringify(query), JSON.stringify(old), 'EX', 60 * 5);
  } catch (err) {
    debug('error fetching data for', Schema.modelName, err.message);
  }

  return old;
};

const _resolveColumnAndProject = async (summary, columnUrl) => {
  summary.card.column = await _resolveReference(Column)('url', columnUrl);
  if (!summary.card.column) {
    return logger.error(`Column not found for card ${summary.card.id}. The column was probably deleted.`);
  }

  summary.project = await _resolveReference(Project)('url', summary.card.column.project_url);
  if (!summary.project) {
    logger.error(`Project not found for column ${summary.card.column.id}. The column was probably deleted.`);
  }
};

/**
 * @param cardEvent
 * @param [summary]
 * @return {Promise.<*>}
 * @private
 */
const _buildCardSummary = async (cardEvent, summary = new Summary()) => {
  debug('building summary for card', cardEvent.project_card.id);

  summary.card = await Card.findOne({ id: cardEvent.project_card.id }).exec() || summary.card;
  await _resolveColumnAndProject(summary, summary.card.column_url);
  summary.issue = await Issue.findOne({ url: summary.card.content_url }).exec() || summary.issue;
  if (summary.issue) {
    summary.issue.labels = await Promise.all(summary.issue.labels.map(label => _resolveReference(Label)('url', label.url)));
  }
  summary.changes = summary.changes || [];
  summary.board_moves = summary.board_moves || [];
  summary.deliveries = summary.deliveries || [];

  return summary;
};

/**
 * @param issueEvent
 * @private
 */
const _buildIssueSummaryForCard = issueEvent => async (card) => {
  const summary = await Summary.findOne({ 'card.id': card.id }).exec() || new Summary();

  summary.card = card;
  await _resolveColumnAndProject(summary, summary.card.column_url);
  if (!summary.issue) summary.issue = await Issue.findOne({ id: issueEvent.issue.id }).exec();
  if (summary.issue) {
    summary.issue.labels = await Promise.all(summary.issue.labels.map(label => _resolveReference(Label)('url', label.url)));
  }
  if (!summary.changes) summary.changes = [];
  if (!summary.board_moves) summary.board_moves = [];
  if (!summary.deliveries) summary.deliveries = [];

  return summary;
};

/**
 * @param issueEvent
 * @return {Promise.<Array>}
 * @private
 */
const _buildIssueSummaries = async (issueEvent) => {
  debug('building summaries for issue', issueEvent.issue.id);

  const cards = await Card.find({ content_url: issueEvent.issue.url }).exec();
  if (!cards.length) return [];

  return Promise.mapSeries(cards, _buildIssueSummaryForCard(issueEvent));
};

/**
 * @param cardEvent
 * @return {Promise.<string>}
 * @private
 */
const _summarizeCardEvent = async (cardEvent) => {
  debug('summarizing event for card', cardEvent.project_card.id);

  let summary = await Summary.findOne({ 'card.id': cardEvent.project_card.id }).exec();
  summary = await _buildCardSummary(cardEvent, summary || undefined);

  summary.changes.push({
    origin: 'card',
    event: cardEvent.action,
    card_event: cardEvent,
    card_snapshot: cardEvent.project_card,
    when: cardEvent.project_card.updated_at,
  });

  const hasColumnChange = (cardEvent.changes
    && cardEvent.changes.column_id
    && cardEvent.changes.column_id.from);

  const movedInsideColumn = (cardEvent.action === 'moved' && !hasColumnChange);

  if ((hasColumnChange || cardEvent.action === 'created') && !movedInsideColumn) {
    const fromColumn = (cardEvent.action === 'moved')
      ? await Column.findOne({ id: cardEvent.changes.column_id.from }).exec() : null;
    const toColumn = await Column.findOne({ url: cardEvent.project_card.column_url }).exec();

    summary.board_moves.push({
      card_event: cardEvent,
      from_column: fromColumn,
      to_column: toColumn,
      when: cardEvent.project_card.updated_at,
    });
  }

  summary.deliveries.push(cardEvent.delivery);

  await summary.save();
};

/**
 * @param issueEvent
 * @return {Promise.<void>}
 * @private
 */
const _processSummaryForIssue = issueEvent => async (summary) => {
  const rootCauses = _findRootCauses(summary.issue);
  const customStatuses = _findCustomStatuses(summary.issue);

  summary.issue = Issue.findOne({ id: issueEvent.issue.id });

  if (rootCauses.length) {
    summary.root_causes.push({
      causes: rootCauses,
      when: issueEvent.issue.updated_at,
    });
  }

  if (customStatuses.length) {
    summary.custom_statuses.push({
      statuses: customStatuses,
      when: issueEvent.issue.updated_at,
    });
  }

  summary.changes.push({
    origin: 'issue',
    event: issueEvent.action,
    issue_event: issueEvent,
    issue_snapshot: issueEvent.issue,
    when: issueEvent.issue.updated_at,
  });

  summary.deliveries.push(issueEvent.delivery);

  await (new Summary(summary, { versionKey: false })).save();
};

/**
 * @param issueEvent
 * @return {Promise.<string>}
 * @private
 */
const _summarizeIssueEvent = async (issueEvent) => {
  debug('summarizing event for issue', issueEvent.issue.id);

  const summaries = await _buildIssueSummaries(issueEvent);
  await Promise.each(summaries, _processSummaryForIssue(issueEvent));
};

const runGCIfNeeded = (() => {
  let i = 0;
  return function runGCIfNeeded() {
    // eslint-disable-next-line
    if (i++ > 200) {
      i = 0;

      if (global.gc) {
        global.gc();
      } else {
        logger.warn('Garbage collection unavailable. Pass --expose-gc when launching node to enable forced garbage collection.');
      }
    }
  };
})();

/**
 * @param processedDeliveries
 * @return {Promise.<*>}
 * @private
 */
const _summarizeCardEvents = async (processedDeliveries) => {
  const cardEvents = await CardEvent
    .find({ delivery: { $not: { $in: processedDeliveries } } }).exec();

  let cardsTodo = cardEvents.length;

  return Promise.each(cardEvents, async (event, index) => {
    await _summarizeCardEvent(event);
    cardEvents[index] = null;
    runGCIfNeeded();
    cardsTodo -= 1;

    debug(cardsTodo, 'card events to process');
  });
};

/**
 * @param processedDeliveries
 * @return {Promise.<*>}
 * @private
 */
const _summarizeIssueEvents = async (processedDeliveries) => {
  const issueEvents = await IssueEvent
    .find({ delivery: { $not: { $in: processedDeliveries } } }).exec();

  let issuesTodo = issueEvents.length;

  return Promise.each(issueEvents, async (event, index) => {
    await _summarizeIssueEvent(event);
    issueEvents[index] = null;
    runGCIfNeeded();
    issuesTodo -= 1;

    debug(issuesTodo, 'issue events to process');
  });
};

let summarizing = false;

/**
 * @class SummaryService
 * @extends Summary
 */
class SummaryService extends Summary {
  /**
   *
   */
  static async summarize() {
    if (summarizing) {
      return debug('already summarizing');
    }

    try {
      summarizing = true;

      const summaries = await Summary.find({}, 'deliveries').exec();
      const processedDeliveries = [];
      summaries.forEach((summary) => {
        processedDeliveries.push(...summary.deliveries);
      });

      await _summarizeCardEvents(processedDeliveries);
      await _summarizeIssueEvents(processedDeliveries);
    } catch (err) {
      throw err;
    } finally {
      summarizing = false;
    }
  }
}

// Schedule summarization to run every 5 minutes
setInterval(async () => {
  try {
    const startDate = new Date();
    await SummaryService.summarize();
    const endDate = new Date();

    const seconds = (endDate.getTime() - startDate.getTime()) / 1000;
    logger.info(`Summarization done in ${seconds} seconds`);
  } catch (err) {
    logger.error('Summarization failed', err);
  }
}, 5 * (60 * 1000));

module.exports = SummaryService;
