const ReportService = (($, _, moment, App, Util) => ({

  /**
   *
   */
  _cache: {},

  /**
   * @param query
   * @param [renewCache=false]
   * @return Promise
   */
  summary: (query, renewCache = false) => new Promise((resolve, reject) => {
    const queryHash = Util.hashify(query);
    const cache = ReportService._cache[queryHash];
    if (cache && cache.length && !renewCache) return resolve(cache);

    $.ajax({
      method: 'GET',
      url: App.getBaseUrl(`/api/v1/report/summary?${query}`),
      dataType: 'json',
      success: (data) => {
        ReportService._cache[queryHash] = data;
        resolve(data);
      },
      error: reject,
    });
  }),

  /**
   * @param data
   * @param project
   * @param columns
   * @private
   * @return {object}
   */
  _normalizeData: (data, project, columns) => {
    const rawData = $.extend(true, {}, data);
    return _(rawData)
      .map((summary) => {
        _.each(summary.board_moves, (move) => {
          const date = moment.utc(move.when);
          move.day = date.date();
          move.month = date.month() + 1;
          move.year = date.year();
          move.dayOfYear = date.dayOfYear();
          move.weekOfYear = date.week();
          move.millis = date.valueOf();
          move.formatedDate = date.format('DD/MM/YYYY');

          const fromColumn = columns.find(c => c.id === (move.from_column || {}).id || c.name === (move.from_column || {}).name);
          if (fromColumn) {
            move.from_column = $.extend(true, {}, fromColumn);
          }

          const toColumn = columns.find(c => c.id === (move.to_column || {}).id || c.name === (move.to_column || {}).name);
          if (toColumn) {
            move.to_column = $.extend(true, {}, toColumn);
          }
        });
        summary.board_moves = _.filter(summary.board_moves, move => !!move.to_column);

        _.groupBy(summary.board_moves, 'dayOfYear');

        return summary;
      })
      .filter((summary) => {
        const ignoreLabels = project.ignore_labels;
        const { issue } = summary;
        if (!issue) return true;

        return !issue.labels.filter((label) => {
          return ignoreLabels.indexOf(label.id) !== -1;
        }).length;
      })
      .value();
  },

  /**
   * @param data
   * @param project
   * @param from
   * @param to
   * @return {{labels, datasets}}
   */
  getCfdData: async (data, project, from, to) => {
    const columns = await ColumnService.listForProject(project.id);
    const summaries = ReportService._normalizeData(data, project, columns);

    let labels = [from, ..._(summaries)
      .map('board_moves')
      .flatten()
      .sortBy('millis')
      .map('formatedDate')
      .value(), to];

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
          backgroundColor: Color(column.color).alpha(0.3).rgbString(),
        }
      })
      .filter('visible')
      .sortBy('order')
      .reverse()
      .value();

    return {
      labels,
      datasets,
    };
  },

  /**
   * @param data
   * @param project
   * @return {{labels, datasets}}
   */
  getLeadTimeData: async (data, project) => {
    const columns = await ColumnService.listForProject(project.id);
    const summaries = ReportService._normalizeData(data, project, columns);

    const labels = _(summaries)
      .map('board_moves')
      .flatten()
      .sortBy('millis')
      .map('weekOfYear')
      .uniq()
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
      .groupBy('issue')
      .filter((issue) => {
        const hasFirst = issue.find((move) => move.to_column.order === _(columns).filter('visible').filter(move => move.order > 0).minBy('order').order);
        const hasLast = issue.find((move) => move.to_column.order === _(columns).filter('visible').filter(move => move.order > 0).maxBy('order').order);
        return hasFirst && hasLast;
      })
      .map((issue) => {
        const first = issue.find((move) => move.to_column.order === _(columns).filter('visible').filter(move => move.order > 0).minBy('order').order);
        const last = issue.find((move) => move.to_column.order === _(columns).filter('visible').filter(move => move.order > 0).maxBy('order').order);
        const leadTime = last.dayOfYear - first.dayOfYear;

        return {
          week: last.weekOfYear,
          leadTime,
        };
      })
      .groupBy('week')
      .value();

    const datasets = labels.map((week, index) => {
      let totalWeeksLeadTime = 0;
      let totalIssuesFromWeeks = 0;

      const data = [];

      for (let i = 0; i <= index; i += 1) {
        const weekNumber = labels[i];

        (weeks[weekNumber] || []).forEach((issue) => {
          totalIssuesFromWeeks += 1;
          totalWeeksLeadTime += issue.leadTime;
        });

        const leadTime = (totalWeeksLeadTime / totalIssuesFromWeeks) || 0;
        data.push(leadTime.toFixed(2));
      }

      return {
        data,
        label: week,
        fill: false,
        borderColor: randomColor(),
        pointStyle: 'crossRot',
        pointRadius: 10,
      };
    });

    return {
      labels,
      datasets,
    };
  },

  /**
   * @param data
   * @param project
   * @param from
   * @param to
   * @return {{labels, datasets}}
   */
  getWipData: async (data, project, from, to) => {
    const columns = await ColumnService.listForProject(project.id);
    const summaries = ReportService._normalizeData(data, project, columns);

    const fromDate = moment(from, 'DD/MM/YYYY');
    const toDate = moment(to, 'DD/MM/YYYY');

    const labels = [fromDate.format('DD/MM/YYYY')];

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

    const getDailyColumnCache = day => (column) => {
      let dailyCache = dailyMovesCache[day];
      if (!dailyCache) dailyCache = (dailyMovesCache[day] = {});

      let columnCache = dailyCache[column.id];
      if (!columnCache) {
        const total = _(dailyMovesCache).map().map(val => _.map(val)).flatten().filter({ id: column.id }).sumBy('count');
        columnCache = (dailyCache[column.id] = Object.assign({}, column, { count: 0, total }));
      }

      return columnCache;
    }

    labels.forEach((day, index) => moves.forEach((move) => {
      if (day !== move.formatedDate) return;

      const from = move.from_column;
      const to = move.to_column;

      if (from) {
        columnsCache[from.id] = from;

        from.color = from.color || columnColorCache[from.id] || (columnColorCache[from.id] = randomColor());
        from.order = from.order || columnOrderCache[from.id] || (columnOrderCache[from.id] = 0);

        const cache = getDailyColumnCache(day)(from);
        if (cache.count > 0) cache.count -= 1;
        if (cache.total > 0) cache.total -= 1;
      }

      if (to) {
        columnsCache[to.id] = to;

        to.color = to.color || columnColorCache[to.id] || (columnColorCache[to.id] = randomColor());
        to.order = to.order || columnOrderCache[to.id] || (columnOrderCache[to.id] = 0);

        const cache = getDailyColumnCache(day)(to);
        cache.count += 1;
        cache.total += 1;
      }
    }));

    const datasets = _(columns).orderBy('order').filter('visible').map((column) => {
      const data = labels.map(day => getDailyColumnCache(day)(column).total);

      return {
        data,
        label: column.name,
        borderColor: column.color,
        backgroundColor: column.color,
      };
    }).value();

    console.log(datasets)

    return {
      labels,
      datasets,
    };
  },

}))(jQuery, _, moment, App, Util);
