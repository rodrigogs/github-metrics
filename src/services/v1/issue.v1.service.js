const debug = require('debug')('github-metrics:services:v1:issue');

const Issue = require('../../models/v1/issue.v1.model');
const IssueEvent = require('../../models/v1/issue_event.v1.model');
const AuthService = require('../auth.service');
const LabelService = require('./label.v1.service');

/**
 * @class IssueService
 * @extends Issue
 */
class IssueService extends Issue {
  /**
   * @param {Object} [obj = {}]
   * @return {Issue}
   */
  static new(obj = {}) {
    return new Issue(obj);
  }

  /**
   * @param {Object} [obj = {}]
   * @return {IssueEvent}
   */
  static newEvent(obj = {}) {
    return new IssueEvent(obj);
  }

  /**
   * @param issue
   * @return {Promise<Issue>}
   */
  static async saveOrUpdate(issue) {
    if (!issue) throw new Error('Trying to save an empty entity');

    debug('saving', JSON.stringify(issue));

    if (issue.labels && issue.labels.length) {
      await Promise.all(issue.labels.map(label => LabelService.saveFromUrl(label.url)));
    }

    return new Issue(issue).save();
  }

  /**
   * @param {Object} event
   * @return {Promise.<IssueEvent>}
   */
  static async saveEvent(event) {
    if (!event) throw new Error('Trying to save an empty entity');

    debug('saving event', JSON.stringify(event));

    const { issue, action } = event;

    if (action === 'deleted') await IssueService.delete(issue.id);

    await IssueService.saveFromUrl(issue.url);
    return IssueEvent(event).save();
  }

  /**
   * @param {Number} id
   * @return {Promise<void>}
   */
  static async delete(id) {
    debug('marking as deleted', id);

    const issue = await IssueService.findOne({ id }).exec();
    if (issue) {
      issue.deleted = true;
      await issue.save();
    }
  }

  /**
   * @param {String} url
   * @return {Promise<Issue>}
   */
  static async saveFromUrl(url) {
    if (!url) throw new Error('Trying to resolve a reference without url');

    debug('saving from url', url);

    const old = await Issue.findOne({ url }).exec() || {};

    try {
      const request = await AuthService.buildGitHubRequest();
      const req = await request.get(url);
      const ref = req.data;
      return IssueService.saveOrUpdate(Object.assign(old, ref));
    } catch (ignore) {
      return old;
    }
  }
}

module.exports = IssueService;
