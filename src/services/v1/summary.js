const debug = require('debug')('github-metrics:services:summary');

const Project = require('../../models/v1/project');
const Column = require('../../models/v1/column');
const Card = require('../../models/v1/card');
const CardEvent = require('../../models/v1/card_event');
const Issue = require('../../models/v1/issue');
const IssueEvent = require('../../models/v1/issue_event');
const Summary = require('../../models/v1/summary');
const RootCause = require('../../models/root_cause');
const AuthService = require('../../services/auth');
const logger = require('../../config/logger');

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

  const old = await Schema.findOne(query);
  try {
    const request = await AuthService.buildGitHubRequest();
    const req = await request.get(url);
    const ref = req.data;

    if (req.status !== 200) return old;

    await _saveOrUpdate(Schema)(old, ref);
    return ref;
  } catch (ignore) {
    return old;
  }
};

// /**
//  * @param summary
//  * @param cardEvent
//  * @return {Promise.<void>}
//  * @private
//  */
// const _mergeCardSummary = async (summary, cardEvent) => {
//   const issueSummary = await Summary
//      .findOne({ 'issue.id': cardEvent.project_card.issue.id }).exec();
//   if (!issueSummary) return summary;
//
//   await Summary.remove({ 'issue.id': cardEvent.project_card.issue.id });
//
//   summary.issue = issueSummary.issue;
//   summary.root_causes = issueSummary.root_causes;
//   summary.custom_statuses = issueSummary.custom_statuses;
//   summary.changes.push(...issueSummary.changes);
//   summary.generated_at = summary.isNew ? issueSummary.generated_at : summary.generated_at;
//   return summary;
// };
//
// /**
//  * @param summary
//  * @param issueEvent
//  * @return {Promise.<void>}
//  * @private
//  */
// const _mergeIssueSummary = async (summary, issueEvent) => {
//   const cardSummary = await Summary.findOne({ 'issue.id': issueEvent.issue.id }).exec();
//   if (!cardSummary) return summary;
//
//   summary.project = cardSummary.project;
//   summary.card = cardSummary.card;
//   summary.changes.push(...cardSummary.changes);
//   summary.generated_at = summary.isNew ? cardSummary.generated_at : summary.generated_at;
//   return summary;
// };

const _resolveColumnAndProject = async (summary, columnUrl) => {
  summary.card.column = await _resolveReference(Column)('url', columnUrl);
  if (!summary.card.column) {
    return logger.error(`Column not found for card ${summary.card.id}. The column was probably deleted.`);
  }

  summary.project = await _resolveReference(Project)('url', summary.card.column.project_url);
  if (summary.project) {
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
  summary.changes = summary.changes || [];
  summary.board_moves = summary.board_moves || [];
  summary.deliveries = summary.deliveries || [];
  return summary;
};

/**
 * @param issueEvent
 * @param summary
 * @return {Promise.<void>}
 * @private
 */
const _buildIssueSummary = async (issueEvent, summary = new Summary()) => {
  debug('building summary for issue', issueEvent.issue.id);

  summary.card = await Card.findOne({ 'issue.id': issueEvent.issue.id }).exec() || summary.card;
  if (summary.card) {
    await _resolveColumnAndProject(summary, summary.card.column_url);
  }
  summary.issue = summary.issue || await Issue.findOne({ id: issueEvent.issue.id }).exec();
  summary.changes = summary.changes || [];
  summary.board_moves = summary.board_moves || [];
  summary.deliveries = summary.deliveries || [];
  return summary;
};

/**
 * @param cardEvent
 * @return {Promise.<string>}
 * @private
 */
const _summarizeCardEvent = async (cardEvent) => {
  debug('summarizing event for card', cardEvent.project_card.id);

  let summary;
  if (cardEvent.project_card.issue) {
    summary = await Summary.findOne({ 'issue.id': cardEvent.project_card.issue.id }).exec();
  } else {
    summary = await Summary.findOne({ 'card.id': cardEvent.project_card.id }).exec();
  }
  summary = await _buildCardSummary(cardEvent, summary || undefined);

  summary.changes.sort((a, b) => {
    return a.when.getTime() - b.when.getTime();
  });

  const lastChange = summary.changes[summary.changes.length - 1] || {};

  summary.changes.push({
    origin: 'card',
    event: cardEvent.action,
    card_event: cardEvent,
    card_before: lastChange.card_after,
    card_after: cardEvent.project_card,
    when: cardEvent.project_card.updated_at,
  });

  if (cardEvent.changes &&
    cardEvent.changes.column_id &&
    cardEvent.changes.column_id.from) {
    const fromColumn = await Column.findOne({ id: cardEvent.changes.column_id.from }).exec();
    const toColumn = await Column.findOne({ id: cardEvent.project_card.column.id }).exec();

    summary.board_moves.push({
      from_column: fromColumn,
      to_column: toColumn,
      when: cardEvent.project_card.updated_at,
    });
  }

  summary.deliveries.push(cardEvent.delivery);

  await summary.save();
  return summary;
};

/**
 * @param issueEvent
 * @return {Promise.<string>}
 * @private
 */
const _summarizeIssueEvent = async (issueEvent) => {
  debug('summarizing event for issue', issueEvent.issue.id);

  let summary = await Summary.findOne({
    $or: [
      { 'issue.id': issueEvent.issue.id },
      { 'project_card.issue.id': issueEvent.issue.id },
    ],
  }).exec();
  summary = await _buildIssueSummary(issueEvent, summary || undefined);

  const rootCauses = _findRootCauses(summary.issue);
  const customStatuses = _findCustomStatuses(summary.issue);

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

  summary.changes.sort((a, b) => {
    return a.when.getTime() - b.when.getTime();
  });

  const lastChange = summary.changes[summary.changes.length - 1] || {};

  summary.changes.push({
    origin: 'issue',
    event: issueEvent.action,
    issue_event: issueEvent,
    issue_before: lastChange.issue_after,
    issue_after: issueEvent.issue,
    when: issueEvent.issue.updated_at,
  });

  summary.deliveries.push(issueEvent.delivery);

  await summary.save();
  return summary;
};

/**
 * @param processedDeliveries
 * @return {Promise.<*>}
 * @private
 */
const _getSummarizedCardEvents = async (processedDeliveries) => {
  const cardEvents = await CardEvent
    .find({ delivery: { $not: { $in: processedDeliveries } } }).exec();
  return Promise.mapSeries(cardEvents, _summarizeCardEvent);
};

/**
 * @param processedDeliveries
 * @return {Promise.<*>}
 * @private
 */
const _getSummarizedIssueEvents = async (processedDeliveries) => {
  const issueEvents = await IssueEvent
    .find({ delivery: { $not: { $in: processedDeliveries } } }).exec();
  return Promise.mapSeries(issueEvents, _summarizeIssueEvent);
};

let summarizing = false;

const SummaryService = {

  /**
   * @return {Promise.<void>}
   */
  summarize: async () => {
    if (summarizing) {
      debug('already summarizing');
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          SummaryService.summarize()
            .then(resolve)
            .catch(reject);
        }, 60 * 1000);

        debug('summarization delayed to 1 minute from now');
      });
    }

    try {
      summarizing = true;

      const summaries = await Summary.find({}, 'deliveries').exec();
      const processedDeliveries = [];
      summaries.forEach((summary) => {
        processedDeliveries.push(...summary.deliveries);
      });

      await _getSummarizedCardEvents(processedDeliveries);
      await _getSummarizedIssueEvents(processedDeliveries);
    } catch (err) {
      throw err;
    } finally {
      summarizing = false;
    }
  },

};

module.exports = SummaryService;
