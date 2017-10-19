const debug = require('debug')('github-metrics:services:v1:project');

const Project = require('../../models/v1/project');

const ProjectService = {

  /**
   * @return {Promise.<void>}
   */
  find: () => {
    debug('fetching projects');

    return Project.find().sort('name').exec();
  },

};

module.exports = ProjectService;
