const debug = require('debug')('github-metrics:controllers:v1:report');

const ReportService = require('../../services/v1/report');

const ReportController = {

  /**
   * @param req
   * @param res
   * @param next
   * @return {Promise.<void>}
   */
  cfd: async (req, res, next) => {
    debug('executing cfd action');

    const { project_id } = req.query;

    try {
      const report = await ReportService.cfd(project_id);
      res.status(200).send(report);
    } catch (err) {
      next(err);
    }
  },

};

module.exports = ReportController;
