const debug = require('debug')('github-metrics:services:v1:feed');

const Project = require('../../models/v1/project');
const Card = require('../../models/v1/card');
const Column = require('../../models/v1/column');
const Issue = require('../../models/v1/issue');
const CardEvent = require('../../models/v1/card_event');
const ColumnEvent = require('../../models/v1/column_event');
const ProjectEvent = require('../../models/v1/project_event');
const IssueEvent = require('../../models/v1/issue_event');
const AuthService = require('../auth');
const SummaryService = require('./summary');
const RedisProvider = require('../../providers/redis');
const logger = require('../../config/logger');

const _saveOrUpdate = Schema => (oldObj, newObj) => {
  debug('saving data for entity', Schema.modelName);
  if (oldObj) return Object.assign(oldObj, newObj).save();
  return new Schema(newObj).save();
};

const _validateDelivery = Schema => async (delivery) => {
  const old = await Schema.findOne({ delivery }).exec();
  return !old;
};

const _resolveReference = Schema => async (field, url) => {
  if (!url) return null;

  const query = {};
  query[field] = url;

  const old = await Schema.findOne(query);
  try {
    const request = await AuthService.buildGitHubRequest();
    const req = await request.get(url);
    const ref = req.data;
    await _saveOrUpdate(Schema)(old, ref);
    return ref;
  } catch (ignore) {
    return null;
  }
};

/**
 * @param payload
 * @return {Promise.<void>}
 * @private
 */
const _saveProject = async (payload) => {
  const { project, action, delivery } = payload;

  const valid = await _validateDelivery(ProjectEvent)(delivery);
  if (!valid) return Promise.resolve();

  const old = await Project.findOne({ id: project.id }).exec();
  if (action === 'deleted') project.deleted = true;

  await _saveOrUpdate(Project)(old, project);
  return ProjectEvent(payload).save();
};

/**
 * @param payload
 * @return {Promise.<void>}
 * @private
 */
const _saveCard = async (payload) => {
  const { project_card, action, delivery } = payload;

  const valid = await _validateDelivery(CardEvent)(delivery);
  if (!valid) return Promise.resolve();

  const old = await Card.findOne({ id: project_card.id }).exec();
  if (action === 'deleted') project_card.deleted = true;

  project_card.column = await _resolveReference(Column)('url', project_card.column_url);
  project_card.issue = await _resolveReference(Issue)('url', project_card.content_url);

  await _saveOrUpdate(Card)(old, project_card);
  return new CardEvent(payload).save();
};

/**
 * @param payload
 * @return {Promise.<void>}
 * @private
 */
const _saveColumn = async (payload) => {
  const { project_column, action, delivery } = payload;

  const valid = await _validateDelivery(ColumnEvent)(delivery);
  if (!valid) return Promise.resolve();

  const old = await Column.findOne({ id: project_column.id }).exec();
  if (action === 'deleted') project_column.deleted = true;

  project_column.project = _resolveReference(Project)('url', project_column.project_url);

  await _saveOrUpdate(Column)(old, project_column);
  return new ColumnEvent(payload).save();
};

/**
 * @param payload
 * @return {Promise.<void>}
 * @private
 */
const _saveIssue = async (payload) => {
  const { issue, delivery } = payload;

  const valid = await _validateDelivery(IssueEvent)(delivery);
  if (!valid) return Promise.resolve();

  const old = await Issue.findOne({ id: issue.id }).exec();

  await _saveOrUpdate(Issue)(old, issue);
  return new IssueEvent(payload).save();
};

const FeedService = {

  /**
   * @param code
   * @param type
   * @param delivery
   * @return {Promise.<void>}
   */
  update: async (code, type, delivery) => {
    let Schema;

    switch (type) {
      case 'project':
        Schema = ProjectEvent;
        break;
      case 'project_column':
        Schema = ColumnEvent;
        break;
      case 'project_card':
        Schema = CardEvent;
        break;
      case 'issues':
        Schema = IssueEvent;
        break;
      default:
        Schema = null;
    }

    if (!Schema) throw new Error('Invalid type');

    const old = await Schema.findOne({ delivery: code }).exec();

    if (!old) throw new Error('Delivery not found');

    return _saveOrUpdate(Schema)(old, delivery);
  },

  /**
   * @param provider
   * @param delivery
   * @param type
   * @param payload
   * @return {Promise.<void>}
   */
  schedule: async (provider, delivery, type, payload) => {
    RedisProvider.set(`schedule-${delivery}`, JSON.stringify({
      provider, delivery, type, payload,
    }));

    payload.delivery = delivery;

    try {
      await FeedService[provider](type, payload);
      logger.info('event saved', delivery);
    } catch (err) {
      setTimeout(async () => {
        logger.info('retrying to save payload', type);
        try {
          let conf = await RedisProvider.safeGet(`schedule-${delivery}`);
          conf = JSON.parse(conf);
          RedisProvider.del(`schedule-${delivery}`);
          await FeedService.schedule(conf.provider, conf.delivery, conf.type, conf.payload);
          logger.info('event saved with delay', delivery);
        } catch (err) {
          logger.error('not able to save an event', delivery, err);
        }
      }, 60 * 1000);

      logger.error('An error has occurred while trying to save an', type);
      logger.error(err);
      throw new Error('Failed to save payload information. The scheduler will try again later.', delivery, err);
    }
  },

  /**
   * @param {String} type
   * @param {Object} payload
   * @return {Promise}
   */
  github: (type, payload) => {
    debug('saving data for event', type);

    const promise = {
      project: _saveProject,
      project_card: _saveCard,
      project_column: _saveColumn,
      issues: _saveIssue,
    }[type](payload) || Promise.resolve();

    return promise.then(() => {
      SummaryService.summarize();
    });
  },

};

module.exports = FeedService;
