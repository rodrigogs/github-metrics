const debug = require('debug')('github-metrics:services:v1:report');
const moment = require('moment');

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
  if (summary.issue) {
    summary.issue = await Issue.findOne({ id: summary.issue.id }).exec();
  }
  return summary;
};

const ReportService = {

  /**
   * @return {Promise.<void>}
   */
  summaries: async (query) => {
    debug('fetching data for summary report');

    query.from_date = moment(query.from_date || new Date(0), 'DD/MM/YYYY').startOf('day');
    query.to_date = moment(query.to_date || new Date(), 'DD/MM/YYYY').endOf('day');

    const summaries = await Summary.find({
      'project.id': Number(query.project_id),
      issue: { $ne: null },
      board_moves: { $not: { $size: 0 } },
      'board_moves.when': {
        $gte: query.from_date.toDate(),
        $lte: query.to_date.toDate(),
      },
    }, {
      issue: 1,
      board_moves: 1,
    }).exec();

    summaries.forEach((summ) => {
      summ.board_moves = summ.board_moves.filter((move) => {
        return move.when >= query.from_date.toDate()
          && move.when <= query.to_date.toDate();
      });
    });

    return Promise.mapSeries(summaries, _process);
  },

};

module.exports = ReportService;
