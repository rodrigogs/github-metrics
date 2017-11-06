const debug = require('debug')('github-metrics:services:v1:report');
const moment = require('moment');

const Summary = require('../../models/v1/summary');
const RedisProvider = require('../../providers/redis');

const ReportService = {

  /**
   * @return {Promise.<void>}
   */
  summaries: async (query) => {
    debug('fetching data for summary report');

    query.from_date = moment(query.from_date || new Date(0), 'DD/MM/YYYY').startOf('day');
    query.to_date = moment(query.to_date || new Date(), 'DD/MM/YYYY').endOf('day');

    const cached = await RedisProvider.safeGet(JSON.stringify(query));
    if (cached) return JSON.parse(cached);

    const summaries = await Summary.find({
      'project.id': Number(query.project_id),
      issue: { $ne: null },
      board_moves: { $not: { $size: 0 } },
      'board_moves.when': {
        $gte: query.from_date.toDate(),
        $lte: query.to_date.toDate(),
      },
      'card.deleted': { $ne: true },
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
  },

};

module.exports = ReportService;
