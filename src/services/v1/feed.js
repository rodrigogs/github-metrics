const debug = require('debug')('github-metrics:services:feed');

const Project = require('../../models/v1/project');
const Card = require('../../models/v1/card');
const Column = require('../../models/v1/column');
const Issue = require('../../models/v1/issue');
const CardEvent = require('../../models/v1/card_event');
const ColumnEvent = require('../../models/v1/column_event');
const ProjectEvent = require('../../models/v1/project_event');
const IssueEvent = require('../../models/v1/issue_event');

const _saveOrUpdate = Schema => (oldObj, newObj) => {
  if (oldObj) return Object.assign(oldObj, newObj).save();
  return new Schema(newObj).save();
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
        return FeedService._saveProject(payload);
      case 'project_card':
        return FeedService._saveCard(payload);
      case 'project_column':
        return FeedService._saveColumn(payload);
      case 'issues':
        return FeedService._saveIssue(payload);
      default:
        return Promise.resolve();
    }
  },

  /**
   * @param {Object} payload
   * @return {Promise.<void>}
   * @private
   */
  _saveProject: async (payload) => {
    const { project, action } = payload;

    const old = await Project.findOne({ id: project.id }).exec();
    if (action === 'deleted') project.deleted = true;

    await _saveOrUpdate(Project)(old, project);
    return new ProjectEvent(payload).save();
  },

  /**
   * @param {Object} payload
   * @return {Promise.<void>}
   * @private
   */
  _saveCard: async (payload) => {
    const { project_card, action } = payload;

    const old = await Card.findOne({ id: project_card.id }).exec();
    if (action === 'deleted') project_card.deleted = true;

    await _saveOrUpdate(Card)(old, project_card);
    return new CardEvent(payload).save();
  },

  /**
   * @param {Object} payload
   * @return {Promise.<void>}
   * @private
   */
  _saveColumn: async (payload) => {
    const { project_column, action } = payload;

    const old = await Column.findOne({ id: project_column.id }).exec();
    if (action === 'deleted') project_column.deleted = true;

    await _saveOrUpdate(Column)(old, project_column);
    return new ColumnEvent(payload).save();
  },

  /**
   * @param {Object} payload
   * @return {Promise.<void>}
   * @private
   */
  _saveIssue: async (payload) => {
    const { issue } = payload;

    const old = await Issue.findOne({ id: issue.id }).exec();

    await _saveOrUpdate(Issue)(old, issue);
    return new IssueEvent(payload).save();
  },

};

module.exports = FeedService;
