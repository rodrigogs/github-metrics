const debug = require('debug')('github-metrics:controllers:v1:report');

const ReportService = require('../../services/v1/report');

const ReportController = {

  /**
   * @param req
   * @param res
   * @param next
   * @return {Promise.<void>}
   */
  summaries: async (req, res, next) => {
    debug('executing cfd action');

    try {
      const report = await ReportService.summaries(req.query);
      res.status(200).send(report);
    } catch (err) {
      next(err);
    }
  },

};

module.exports = ReportController;
