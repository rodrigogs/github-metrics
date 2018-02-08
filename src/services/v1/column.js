const debug = require('debug')('github-metrics:services:v1:column');

const Column = require('../../models/v1/column');

const ColumnService = {

  /**
   * @param query
   * @return {Promise.<void>}
   */
  find: (query = {}) => {
    debug('fetching columns');

    return Column.find(query).sort('name').exec();
  },

  /**
   * @param id
   * @param color
   * @param order
   * @param visible
   * @return {Promise.<void>}
   */
  update: (id, color, order, visible) => {
    debug('updating column', id);

    order = Number(order);
    visible = visible === 'true';

    return Column.update({ id }, { $set: { color, order, visible } });
  },

};

module.exports = ColumnService;
