const debug = require('debug')('github-metrics:controllers:v1:report');
const ReportService = require('../../services/v1/report.v1.service');

require('../../services/v1/summary.v1.service');

const ReportController = {

  /**
   * @param req
   * @param res
   * @param next
   * @return {Promise.<void>}
   */
  summaries: async (req, res, next) => {
    debug('executing summaries action');

    try {
      const report = await ReportService.summaries(req.query);
      res.status(200).send(report);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @param req
   * @param res
   * @param next
   * @return {Promise<void>}
   */
  cfd: async (req, res, next) => {
    debug('executing cfd action');

    const { project_id: projectId, from_date: from, to_date: to } = req.query;

    try {
      const report = await ReportService.getCfdData(projectId, from, to);
      res.status(200).send(report);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @param req
   * @param res
   * @param next
   * @return {Promise<void>}
   */
  wip: async (req, res, next) => {
    debug('executing wip action');

    const { project_id: projectId, from_date: from, to_date: to } = req.query;

    try {
      const report = await ReportService.getWipData(projectId, from, to);
      res.status(200).send(report);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @param req
   * @param res
   * @param next
   * @return {Promise<void>}
   */
  leadtime: async (req, res, next) => {
    debug('executing leadtime action');

    const { project_id: projectId, from_date: from, to_date: to } = req.query;

    try {
      const report = await ReportService.getLeadTimeData(projectId, from, to);
      res.status(200).send(report);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @param req
   * @param res
   * @param next
   * @return {Promise<void>}
   */
  throughput: async (req, res, next) => {
    debug('executing throughput action');

    const { project_id: projectId, from_date: from, to_date: to } = req.query;

    try {
      const report = await ReportService.getThroughputData(projectId, from, to);
      res.status(200).send(report);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ReportController;
