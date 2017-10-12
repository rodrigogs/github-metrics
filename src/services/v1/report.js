const debug = require('debug')('github-metrics:services:v1:report');

const Summary = require('../../models/v1/summary');
// const Project = require('../../models/v1/project');
// const Card = require('../../models/v1/card');
// const Column = require('../../models/v1/column');
const Issue = require('../../models/v1/issue');
// const CardEvent = require('../../models/v1/card_event');
// const ColumnEvent = require('../../models/v1/column_event');
// const ProjectEvent = require('../../models/v1/project_event');
// const IssueEvent = require('../../models/v1/issue_event');
// const AuthService = require('../auth');
// const RedisProvider = require('../../providers/redis');
// const logger = require('../../config/logger');

const _process = async (summary) => {
  summary.issue = await Issue.findOne({ id: summary.issue.id }).exec();
  return summary;
};

const ReportService = {

  /**
   * @return {Promise.<void>}
   */
  cfd: async (project) => {
    debug('fetching data for cfd report');

    const summaries = await Summary.find({
      'project.id': Number(project),
      issue: { $ne: null },
      board_moves: { $not: { $size: 0 } },
    }, {
      issue: 1,
      board_moves: 1,
    }).exec();

    return Promise.mapSeries(summaries, _process);
  },

};

module.exports = ReportService;
