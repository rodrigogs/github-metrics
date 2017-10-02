const debug = require('debug')('github-metrics:services:feed');
const axios = require('axios');

const Env = require('../../config/env');

const Project = require('../../models/v1/project');
const Card = require('../../models/v1/card');
const Column = require('../../models/v1/column');
const Issue = require('../../models/v1/issue');
const CardEvent = require('../../models/v1/card_event');
const ColumnEvent = require('../../models/v1/column_event');
const ProjectEvent = require('../../models/v1/project_event');
const IssueEvent = require('../../models/v1/issue_event');

let _gitHubRequest;

const _getGitHubRequest = () => {
  if (!_gitHubRequest) {
    _gitHubRequest = axios.create({
      headers: {
        Authorization: `token ${Env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.inertia-preview+json',
      },
    });
  }

  return _gitHubRequest;
};

const _saveOrUpdate = Schema => (oldObj, newObj) => {
  if (oldObj) return Object.assign(oldObj, newObj).save();
  return new Schema(newObj).save();
};

const _resolveReference = Schema => async (field, url) => {
  if (!url) return null;

  const query = {};
  query[field] = url;

  const old = await Schema.findOne(query);
  try {
    const req = await _getGitHubRequest().get(url);
    const ref = req.data;
    await _saveOrUpdate(Schema)(old, ref);
    return ref;
  } catch (ignore) {
    return null;
  }
};

/**
 * @param {Object} payload
 * @return {Promise.<void>}
 * @private
 */
const _saveProject = async (payload) => {
  const { project, action } = payload;

  const old = await Project.findOne({ id: project.id }).exec();
  if (action === 'deleted') project.deleted = true;

  await _saveOrUpdate(Project)(old, project);
  return ProjectEvent(payload).save();
};

/**
 * @param {Object} payload
 * @return {Promise.<void>}
 * @private
 */
const _saveCard = async (payload) => {
  const { project_card, action } = payload;

  const old = await Card.findOne({ id: project_card.id }).exec();
  if (action === 'deleted') project_card.deleted = true;

  project_card.column = await _resolveReference(Column)('url', project_card.column_url);
  project_card.issue = await _resolveReference(Issue)('url', project_card.content_url);

  await _saveOrUpdate(Card)(old, project_card);
  return new CardEvent(payload).save();
};

/**
 * @param {Object} payload
 * @return {Promise.<void>}
 * @private
 */
const _saveColumn = async (payload) => {
  const { project_column, action } = payload;

  const old = await Column.findOne({ id: project_column.id }).exec();
  if (action === 'deleted') project_column.deleted = true;

  project_column.project = _resolveReference(Project)('url', project_column.project_url);

  await _saveOrUpdate(Column)(old, project_column);
  return new ColumnEvent(payload).save();
};

/**
 * @param {Object} payload
 * @return {Promise.<void>}
 * @private
 */
const _saveIssue = async (payload) => {
  const { issue } = payload;

  const old = await Issue.findOne({ id: issue.id }).exec();

  await _saveOrUpdate(Issue)(old, issue);
  return new IssueEvent(payload).save();
};

const FeedService = {

  /**
   * @param {String} type
   * @param {Object} payload
   * @return {Promise}
   */
  github: (type, payload) => {
    debug('saving data for event', type);

    switch (type) {
      case 'project':
        return _saveProject(payload);
      case 'project_card':
        return _saveCard(payload);
      case 'project_column':
        return _saveColumn(payload);
      case 'issues':
        return _saveIssue(payload);
      default:
        return Promise.resolve();
    }
  },

};

module.exports = FeedService;
