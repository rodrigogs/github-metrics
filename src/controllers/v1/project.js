const debug = require('debug')('github-metrics:controllers:v1:project');

const ProjectService = require('../../services/v1/project');

const ReportController = {

  /**
   * @param req
   * @param res
   * @param next
   * @return {Promise.<void>}
   */
  find: async (req, res, next) => {
    debug('executing find action');

    try {
      const projects = await ProjectService.find();
      res.status(200).send(projects);
    } catch (err) {
      next(err);
    }
  },

};

module.exports = ReportController;
