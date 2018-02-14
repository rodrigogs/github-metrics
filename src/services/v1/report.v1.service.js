const debug = require('debug')('github-metrics:services:v1:report');
const moment = require('moment');

const RedisProvider = require('../../providers/redis.provider');

// const ProjectService = require('./project.v1.service');
// const ColumnService = require('./column.v1.service');
const SummaryService = require('./summary.v1.service');

/**
 * @class ReportService
 */
class ReportService {
  /**
   * @return {Promise.<void>}
   */
  static async summaries(query) {
    debug('fetching data for summary report');

    query.from_date = moment(query.from_date || new Date(0), 'DD/MM/YYYY').startOf('day');
    query.to_date = moment(query.to_date || new Date(), 'DD/MM/YYYY').endOf('day');

    const cached = await RedisProvider.safeGet(JSON.stringify(query));
    if (cached) return JSON.parse(cached);

    const summaries = await SummaryService.find({
      'project.url': query.project_url,
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

    RedisProvider.set(JSON.stringify(query), JSON.stringify(summaries), 'EX', 60 * 5);

    return summaries;
  }

  // /**
  //  *
  //  */
  // static async cfd(projectId, fromDate, toDate) {
  //   const project = await ProjectService.findOne({id: projectId}).exec();
  //   if (!project) throw new Error(`Project ${projectId} not found`);
  //
  //   const {ignore_labels: ignoreLabels} = project;
  //
  //   const columns = await ColumnService.find({project_url: project.url}).exec();
  // }
}

module.exports = ReportService;