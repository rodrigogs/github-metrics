/* eslint-disable no-multi-assign */
const debug = require('debug')('github-metrics:services:v1:report');
const moment = require('moment');
const _ = require('lodash');
const Color = require('color');
const randomColor = require('randomcolor');

const RedisProvider = require('../../providers/redis.provider');

const ProjectService = require('./project.v1.service');
const ColumnService = require('./column.v1.service');
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

    const cached = await RedisProvider.safeGet(JSON.stringify(query));
    if (cached) return JSON.parse(cached);

    const summaries = await SummaryService.find({
      'project.url': query.project_url,
      issue: { $ne: null },
      board_moves: { $not: { $size: 0 } },
    }, {
      issue: 1,
      board_moves: 1,
    }).exec();

    RedisProvider.set(JSON.stringify(query), JSON.stringify(summaries), 'EX', 60 * 5);

    return summaries;
  }

  /**
   * @param {Object} result
   * @param {String} initialDate
   * @param {String} finalDate
   * @return {{labels: *, datasets: *}}
   */
  static removePeriod(result, initialDate, finalDate) {
    const { labels, datasets } = result;

    initialDate = moment(initialDate, 'DD/MM/YYYY');
    finalDate = moment(finalDate, 'DD/MM/YYYY');

    const indexesToRemove = [];

    labels.forEach((label, index) => {
      const date = moment(label, 'DD/MM/YYYY');
      const keep = date.isBetween(initialDate, finalDate, null, '[]');

      if (!keep) indexesToRemove.push(index);
    });

    indexesToRemove.forEach((index) => {
      labels[index] = undefined;
      datasets.forEach((dataset) => { dataset.data[index] = undefined; });
    });

    _.remove(labels, _.isUndefined);
    datasets.forEach((dataset) => { _.remove(dataset.data, _.isUndefined); });

    return {
      labels,
      datasets,
    };
  }

  /**
   * @param {Object[]} data
   * @param {Object} project
   * @param {Object[]} columns
   * @return {object}
   */
  static normalizeData(data, project, columns) {
    const rawData = Object.assign({}, data);

    return _(rawData)
      .map((summary) => {
        let lastMove;

        _.each(summary.board_moves, (move) => {
          const date = moment.utc(move.when);
          move.date = date;
          move.day = date.date();
          move.month = date.month() + 1;
          move.year = date.year();
          move.dayOfYear = date.dayOfYear();
          move.weekOfYear = date.week();
          move.millis = date.valueOf();
          move.formatedDate = date.format('DD/MM/YYYY');

          // eslint-disable-next-line max-len
          const fromColumn = columns.find(c => c.id === (move.from_column || {}).id || c.name === (move.from_column || {}).name);
          if (fromColumn) {
            move.from_column = Object.assign({}, fromColumn.toObject());
          }

          // eslint-disable-next-line max-len
          const toColumn = columns.find(c => c.id === (move.to_column || {}).id || c.name === (move.to_column || {}).name);
          if (toColumn) {
            move.to_column = Object.assign({}, toColumn.toObject());
          }

          if (((lastMove && lastMove.to_column) && move.to_column)
            && (lastMove.to_column.order >= move.to_column.order)) move.__remove = true;

          lastMove = move;
        });

        summary.board_moves = _
          .filter(summary.board_moves, move => !!move.to_column && !move.__remove);

        _.groupBy(summary.board_moves, 'dayOfYear');

        return summary;
      })
      .filter((summary) => {
        const ignoreLabels = project.ignore_labels;
        const { issue } = summary;
        if (!issue) return true;

        return !issue.labels.filter((label) => {
          return label && ignoreLabels.indexOf(label.id) !== -1;
        }).length;
      })
      .value();
  }

  /**
   * @param {Number} project_id
   * @param {String} from
   * @param {String} to
   * @return {{labels, datasets}}
   */
  static async getCfdData(project_id, from, to) {
    const project = await ProjectService.findOne({ id: project_id }).exec();
    const columns = await ColumnService.find({ project_url: project.url }).exec();
    const data = await ReportService.summaries({ project_url: project.url });
    const summaries = ReportService.normalizeData(data, project, columns);

    let labels = _(summaries)
      .map('board_moves')
      .flatten()
      .sortBy('millis')
      .map('formatedDate')
      .value();

    labels = _.uniq(labels);

    const datasets = _(summaries)
      .map((summ) => {
        summ.board_moves.forEach((move) => {
          move.issue = summ.issue.number;
        });
        return summ.board_moves;
      })
      .flatten()
      .sortBy('millis')
      .groupBy('to_column.order')
      .map((order) => { // Group columns by order
        const uniqueColumns = _.uniqBy(order, 'to_column.id');
        if (uniqueColumns.length === 1) return order;

        const name = _.map(uniqueColumns, 'to_column.name').join(' / ');
        return _.map(order, (col) => {
          col.to_column.id = `composit-id-${name}${col.to_column.order}`;
          col.to_column.name = name;
          return col;
        });
      })
      .flatten()
      .groupBy('to_column.id')
      .map((col) => {
        const column = (col[0] || {}).to_column || {};
        column.color = column.color || randomColor();
        column.order = column.order || 0;

        col = _.uniqBy(col, column => column.issue + column.formatedDate);

        let total = 0;
        const data = _.map(labels, (date) => {
          total += _.filter(col, ['formatedDate', date]).length;
          return total;
        });

        return {
          data,
          order: column.order,
          visible: column.visible,
          label: column.name,
          borderColor: column.color,
          backgroundColor: Color(column.color).alpha(0.3).string(),
        };
      })
      .filter('visible')
      .sortBy('order')
      .reverse()
      .value();

    return ReportService.removePeriod({
      labels,
      datasets,
    }, from, to);
  }

  /**
   * @param {Number} project_id
   * @param {String} from
   * @param {String} to
   * @return {{labels, datasets}}
   */
  static async getLeadTimeData(project_id, from, to) {
    const project = await ProjectService.findOne({ id: project_id }).exec();
    const columns = await ColumnService.find({ project_url: project.url }).exec();
    const data = await ReportService.summaries({ project_url: project.url });
    const summaries = ReportService.normalizeData(data, project, columns);

    const labels = _(summaries)
      .map('board_moves')
      .flatten()
      .sortBy('millis')
      .map(move => ({
        firstWeekDay: move.date.isoWeekday(1).format('DD/MM/YYYY'),
        weekOfYear: move.weekOfYear,
      }))
      .uniqBy('weekOfYear')
      .value();

    const weeks = _(summaries)
      .map((summ) => {
        summ.board_moves.forEach((move) => {
          move.issue = summ.issue.number;
        });
        return summ.board_moves;
      })
      .flatten()
      .filter(move => move.to_column.visible)
      .sortBy('millis')
      .groupBy('issue')
      .filter((issue) => {
        const hasFirst = issue.find(move => move.to_column.order === _(columns).filter('visible').filter(move => move.order > 0).minBy('order').order);
        const hasLast = issue.find(move => move.to_column.order === _(columns).filter('visible').filter(move => move.order > 0).maxBy('order').order);
        return hasFirst && hasLast;
      })
      .map((issue) => {
        const first = issue.find(move => move.to_column.order === _(columns).filter('visible').filter(move => move.order > 0).minBy('order').order);
        const last = issue.find(move => move.to_column.order === _(columns).filter('visible').filter(move => move.order > 0).maxBy('order').order);
        const leadTime = last.dayOfYear - first.dayOfYear;

        return {
          week: last.weekOfYear,
          leadTime,
        };
      })
      .groupBy('week')
      .value();

    const totals = labels.map((week, index) => {
      let totalWeeksLeadTime = 0;
      let totalIssuesFromWeeks = 0;

      let leadTime;

      for (let i = 0; i <= index; i += 1) {
        const weekNumber = labels[i].weekOfYear;

        // eslint-disable-next-line no-loop-func
        (weeks[weekNumber] || []).forEach((issue) => {
          totalIssuesFromWeeks += 1;
          totalWeeksLeadTime += issue.leadTime;
        });

        leadTime = (totalWeeksLeadTime / totalIssuesFromWeeks) || 0;
      }

      return leadTime.toFixed(2);
    });

    const datasets = [{
      data: totals,
      label: 'Ratio',
      fill: false,
      borderColor: 'blue',
      pointStyle: 'crossRot',
      pointRadius: 10,
    }];

    return ReportService.removePeriod({
      labels: _.map(labels, 'firstWeekDay'),
      datasets,
    }, from, to);
  }

  /**
   * @param {Number} project_id
   * @param {String} from
   * @param {String} to
   * @return {{labels, datasets}}
   */
  static async getWipData(project_id, from, to) {
    const project = await ProjectService.findOne({ id: project_id }).exec();
    const columns = await ColumnService.find({ project_url: project.url }).exec();
    const data = await ReportService.summaries({ project_url: project.url });
    const summaries = ReportService.normalizeData(data, project, columns);

    const fromDate = moment(from, 'DD/MM/YYYY');
    const toDate = moment(to, 'DD/MM/YYYY');

    const labels = [];

    let lastDate = fromDate;
    while (lastDate.isBefore(toDate)) {
      lastDate = lastDate.clone().add(1, 'days');
      labels.push(lastDate.format('DD/MM/YYYY'));
    }

    const moves = _(summaries).map('board_moves').flatten().value();

    const columnsCache = {};
    const columnColorCache = {};
    const columnOrderCache = {};
    const dailyMovesCache = {};
    const columnsMoveCache = {};

    const getDailyColumnCache = day => (column, create = true) => {
      let columnMoves = columnsMoveCache[column.id];
      if (!columnMoves) columnMoves = (columnsMoveCache[column.id] = 0);

      let dailyCache = dailyMovesCache[day];
      if (!dailyCache) dailyCache = (dailyMovesCache[day] = {});

      let columnCache = dailyCache[column.id];
      // eslint-disable-next-line max-len
      if (!columnCache && create) columnCache = (dailyCache[column.id] = Object.assign({}, column, { count: columnMoves }));

      return columnCache || { count: 0 };
    };

    labels.forEach(day => moves.forEach((move) => {
      const from = move.from_column;
      const to = move.to_column;

      if (from) {
        columnsCache[from.id] = from;

        // eslint-disable-next-line max-len
        from.color = from.color || columnColorCache[from.id] || (columnColorCache[from.id] = randomColor());
        from.order = from.order || columnOrderCache[from.id] || (columnOrderCache[from.id] = 0);

        const cache = getDailyColumnCache(day)(from);
        if (day === move.formatedDate && cache.count > 0) {
          cache.count -= 1;
          columnsMoveCache[from.id] -= 1;
        }
      }

      if (to) {
        columnsCache[to.id] = to;

        to.color = to.color || columnColorCache[to.id] || (columnColorCache[to.id] = randomColor());
        to.order = to.order || columnOrderCache[to.id] || (columnOrderCache[to.id] = 0);

        const cache = getDailyColumnCache(day)(to);
        if (day === move.formatedDate) {
          cache.count += 1;
          columnsMoveCache[to.id] += 1;
        }
      }
    }));

    const datasets = _(columnsCache).orderBy('order').filter('visible').map((column) => {
      const data = labels.map(day => getDailyColumnCache(day)(column, false).count);

      return {
        data,
        label: column.name,
        borderColor: column.color,
        backgroundColor: column.color,
      };
    })
      .value();

    return ReportService.removePeriod({
      labels,
      datasets,
    }, from, to);
  }

  /**
   * @param {Number} project_id
   * @param {String} from
   * @param {String} to
   * @return {{labels, datasets}}
   */
  static async getThroughputData(project_id, from, to) {
    const project = await ProjectService.findOne({ id: project_id }).exec();
    const columns = await ColumnService.find({ project_url: project.url }).exec();
    const data = await ReportService.summaries({ project_url: project.url });
    const summaries = ReportService.normalizeData(data, project, columns);

    const labels = _(summaries)
      .map('board_moves')
      .flatten()
      .sortBy('millis')
      .map(move => ({
        firstWeekDay: move.date.isoWeekday(1).format('DD/MM/YYYY'),
        weekOfYear: move.weekOfYear,
      }))
      .uniqBy('weekOfYear')
      .value();

    const datasets = [];

    const totals = _(summaries)
      .map('board_moves')
      .flatten()
      .sortBy('millis')
      .groupBy('weekOfYear')
      .map((week) => {
        return _.filter(week, (move) => {
          const lastColumn = _(columns).filter('visible').filter(move => move.order > 0).maxBy('order');
          if (!lastColumn) return false;

          return move.to_column.order === lastColumn.order;
        }).length;
      })
      .value();

    datasets.push({
      data: totals,
      label: 'Closed Issues',
      fill: false,
      borderColor: 'blue',
      pointRadius: 10,
    });

    return ReportService.removePeriod({
      labels: _.map(labels, 'firstWeekDay'),
      datasets,
    }, from, to);
  }
}

module.exports = ReportService;
