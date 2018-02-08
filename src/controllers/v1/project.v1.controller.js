const debug = require('debug')('github-metrics:controllers:v1:project');

const ProjectService = require('../../services/v1/project.v1.service');

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
      const projects = await ProjectService.find().sort('name').exec();
      res.status(200).send(projects);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @param req
   * @param res
   * @param next
   * @return {Promise.<void>}
   */
  update: async (req, res, next) => {
    debug('executing update action');

    let ignoreLabels = req.body.ignore_labels;
    if (typeof ignoreLabels === 'string') {
      ignoreLabels = ignoreLabels.split(',');
      ignoreLabels = ignoreLabels.map(Number);
    }

    try {
      const project = await ProjectService.update(req.params.id, ignoreLabels);
      res.status(200).send(project);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ReportController;
