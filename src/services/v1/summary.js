const debug = require('debug')('github-metrics:services:summary');

const Project = require('../../models/v1/project');
const Column = require('../../models/v1/column');
const Card = require('../../models/v1/card');
const CardEvent = require('../../models/v1/card_event');
const Issue = require('../../models/v1/issue');
const IssueEvent = require('../../models/v1/issue_event');
const Summary = require('../../models/v1/summary');
const Config = require('../../models/config');

/**
 * @param [date]
 * @return {Promise.<*>}
 * @private
 */
const _updateLastSummary = async (date = new Date(0)) => {
  debug('updating last summary date');

  let lastSummary = await Config.findOne({ key: Config.KEYS.LAST_SUMMARY }).exec();
  if (!lastSummary) {
    lastSummary = new Config({
      key: Config.KEYS.LAST_SUMMARY,
      value: date,
    });
  } else {
    lastSummary.value = date;
  }

  await lastSummary.save();
  return lastSummary;
};

/**
 * @param issue
 * @return {Array}
 * @private
 */
const _findRootCauses = (issue) => {
  debug('looking for root causes for issue', issue.id);

  if (!issue) return [];
  // TODO
  return [];
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
 * @param cardEvent
 * @param [summary]
 * @return {Promise.<*>}
 * @private
 */
const _buildCardSummary = async (cardEvent, summary = new Summary()) => {
  debug('building summary for card', cardEvent.project_card.id);

  summary.card = summary.card || await Card.findOne({ id: cardEvent.project_card.id }).exec();
  summary.project = summary.project || await Project
    .findOne({ url: summary.card.column.project_url }).exec();
  summary.issue = summary.issue || await Issue.findOne({ url: summary.card.content_url }).exec();
  summary.changes = summary.changes || [];
  summary.board_moves = summary.board_moves || [];
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

  summary.card = summary.card || await Card.findOne({ 'issue.id': issueEvent.issue.id }).exec();
  if (summary.card) {
    summary.project = summary.project || await Project
      .findOne({ url: summary.card.column.project_url }).exec();
  }
  summary.issue = summary.issue || await Issue.findOne({ id: issueEvent.issue.id }).exec();
  summary.changes = summary.changes || [];
  summary.board_moves = summary.board_moves || [];
  return summary;
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
    when: cardEvent.received_at,
  });

  if (cardEvent.changes &&
    cardEvent.changes.column_id &&
    cardEvent.changes.column_id.from) {
    const fromColumn = await Column.findOne({ id: cardEvent.changes.column_id.from }).exec();
    const toColumn = await Column.findOne({ id: cardEvent.project_card.column.id }).exec();

    summary.board_moves.push({
      from_column: fromColumn,
      to_column: toColumn,
      when: cardEvent.received_at,
    });
  }

  await summary.save();
  await _updateLastSummary(cardEvent.received_at);
  return summary;
};

/**
 * @param issueEvent
 * @return {Promise.<string>}
 * @private
 */
const _summarizeIssueEvent = async (issueEvent) => {
  debug('summarizing event for issue', issueEvent.issue.id);

  let summary = await Summary.findOne({ 'issue.id': issueEvent.issue.id }).exec();
  summary = await _buildIssueSummary(issueEvent, summary || undefined);

  const rootCauses = _findRootCauses(summary.issue);
  const customStatuses = _findCustomStatuses(summary.issue);

  if (rootCauses.length) {
    summary.root_causes.push({
      causes: rootCauses,
      when: issueEvent.received_at,
    });
  }

  if (customStatuses.length) {
    summary.custom_statuses.push({
      statuses: customStatuses,
      when: issueEvent.received_at,
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
    when: issueEvent.received_at,
  });

  await summary.save();
  await _updateLastSummary(issueEvent.received_at);
  return summary;
};

/**
 * @param lastSummary
 * @return {Promise.<*>}
 * @private
 */
const _getSummarizedCardEvents = async (lastSummary) => {
  const cardEvents = await CardEvent.find({ received_at: { $gt: lastSummary } }).exec();
  return Promise.mapSeries(cardEvents, _summarizeCardEvent);
};

/**
 * @param lastSummary
 * @return {Promise.<*>}
 * @private
 */
const _getSummarizedIssueEvents = async (lastSummary) => {
  const issueEvents = await IssueEvent.find({ received_at: { $gt: lastSummary } }).exec();
  return Promise.mapSeries(issueEvents, _summarizeIssueEvent);
};

const SummaryService = {

  /**
   * @return {Promise.<void>}
   */
  summarize: async () => {
    let lastSummary = await Config.findOne({ key: Config.KEYS.LAST_SUMMARY }).exec();
    if (!lastSummary) lastSummary = _updateLastSummary();

    await _getSummarizedCardEvents(lastSummary.value);
    await _getSummarizedIssueEvents(lastSummary.value);
  },

};

module.exports = SummaryService;
