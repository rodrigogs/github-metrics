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
   * @param order
   * @param visible
   * @return {Promise.<void>}
   */
  update: (id, order, visible) => {
    debug('updating column', id);

    return Column.update({ id }, { $set: { order, visible } });
  },

};

module.exports = ColumnService;
