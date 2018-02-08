const debug = require('debug')('github-metrics:services:v1:column');

const Column = require('../../models/v1/column.v1.model');
const ColumnEvent = require('../../models/v1/column_event.v1.model');
const AuthService = require('../auth.service');
const ProjectService = require('./project.v1.service');

/**
 * @class ColumnService
 * @extends Column
 */
class ColumnService extends Column {
  /**
   * @param {Object} [obj = {}]
   * @return {Column}
   */
  static new(obj = {}) {
    return new Column(obj);
  }

  /**
   * @param {Object} [obj = {}]
   * @return {ColumnEvent}
   */
  static newEvent(obj = {}) {
    return new ColumnEvent(obj);
  }

  /**
   * @param column
   * @return {Promise<Column>}
   */
  static async saveOrUpdate(column) {
    if (!column) throw new Error('Trying to save an empty entity');

    debug('saving', JSON.stringify(column));

    if (column.project_url) await ProjectService.saveFromUrl(column.project_url);

    return new Column(column).save();
  }

  /**
   * @param {Object} event
   * @return {Promise.<ColumnEvent>}
   */
  static async saveEvent(event) {
    if (!event) throw new Error('Trying to save an empty entity');

    debug('saving event', JSON.stringify(event));

    const { project_column: column, action } = event;

    if (action === 'deleted') await ColumnService.delete(column.id);

    await ColumnService.saveFromUrl(column.url);
    return new ColumnEvent(event).save();
  }

  /**
   * @param {Number} id
   * @return {Promise<void>}
   */
  static async delete(id) {
    debug('marking as deleted', id);

    const column = await ColumnService.findOne({ id }).exec();
    if (column) {
      column.deleted = true;
      await column.save();
    }
  }

  /**
   * @param {String} url
   * @return {Promise<Column>}
   */
  static async saveFromUrl(url) {
    if (!url) throw new Error('Trying to resolve a reference without url');

    debug('saving from url', url);

    const old = await Column.findOne({ url }).exec() || {};

    try {
      const request = await AuthService.buildGitHubRequest();
      const req = await request.get(url);
      const ref = req.data;
      return ColumnService.saveOrUpdate(Object.assign(old, ref));
    } catch (ignore) {
      return old;
    }
  }
}

module.exports = ColumnService;
