const debug = require('debug')('github-metrics:services:v1:report');
const moment = require('moment');

const RedisProvider = require('../../providers/redis.provider');

const ProjectService = require('./project.v1.service');
const ColumnService = require('./column.v1.service');

/**
 * @class ReportService
 */
class ReportService {
  /**
   *
   */
  static async cfd(projectId, fromDate, toDate) {
    const project = await ProjectService.findOne({ id: projectId }).exec();
    if (!project) throw new Error(`Project ${projectId} not found`);

    const { ignore_labels: ignoreLabels } = project;

    const columns = await ColumnService.find({ project_url: project.url }).exec();
  }
}

module.exports = ReportService;
