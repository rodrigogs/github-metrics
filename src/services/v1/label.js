const debug = require('debug')('github-metrics:services:v1:label');

const Label = require('../../models/v1/label');

const LabelService = {

  /**
   * @param query
   * @return {Promise.<void>}
   */
  find: (query = {}) => {
    debug('fetching labels');

    return Label.find(query).sort('name').exec();
  },

};

module.exports = LabelService;
