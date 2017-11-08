const ReportService = (($, _, App, Util) => ({

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

          const column = columns.find(c => c.id === move.to_column.id || c.name === move.to_column.name);
          if (column) {
            move.column = $.extend(true, {}, column);
          }

          delete move.from_column;
          delete move.to_column;
        });
        summary.board_moves = _.filter(summary.board_moves, move => !!move.column);

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
      .groupBy('column.order')
      .map((order) => { // Group columns by order
        const uniqueColumns = _.uniqBy(order, 'column.id');
        if (uniqueColumns.length === 1) return order;

        const name = _.map(uniqueColumns, 'column.name').join(' / ');
        return _.map(order, (col) => {
          col.column.id = `composit-id-${name}${col.column.order}`;
          col.column.name = name;
          return col;
        });
      })
      .flatten()
      .groupBy('column.id')
      .map((col) => {
        const column = (col[0] || {}).column || {};
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
      .filter(move => move.column.visible)
      .groupBy('issue')
      .filter((issue) => {
        const hasFirst = issue.find((move) => move.column.order === _(columns).filter('visible').filter(move => move.order > 0).minBy('order').order);
        const hasLast = issue.find((move) => move.column.order === _(columns).filter('visible').filter(move => move.order > 0).maxBy('order').order);
        return hasFirst && hasLast;
      })
      .map((issue) => {
        const first = issue.find((move) => move.column.order === _(columns).filter('visible').filter(move => move.order > 0).minBy('order').order);
        const last = issue.find((move) => move.column.order === _(columns).filter('visible').filter(move => move.order > 0).maxBy('order').order);
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
   * @return {{labels, datasets}}
   */
  getWipData: async (data, project) => {
    const columns = await ColumnService.listForProject(project.id);
    const summaries = ReportService._normalizeData(data, project, columns);

    const labels = _(summaries)
      .map('board_moves')
      .flatten()
      .sortBy('millis')
      .map('formatedDate')
      .uniq()
      .value();

    const columns = _(summaries)
      .map((summ) => {
        summ.board_moves.forEach((move) => {
          move.issue = summ.issue.number;
        });
        return summ.board_moves;
      })
      .flatten()
      .sortBy('millis')
      .groupBy('column.order')
      .map((order) => { // Group columns by order
        const uniqueColumns = _.uniqBy(order, 'column.id');
        if (uniqueColumns.length === 1) return order;

        const name = _.map(uniqueColumns, 'column.name').join(' / ');
        return _.map(order, (col) => {
          col.column.id = `composit-id-${name}${col.column.order}`;
          col.column.name = name;
          return col;
        });
      })
      .flatten()
      .groupBy('column.id')
      .map((col) => {
        const column = (col[0] || {}).column || {};
        column.color = column.color || randomColor();
        column.order = column.order || 0;

        col = _.uniqBy(col, column => column.issue + column.formatedDate);

        const data = _.map(labels, (date) => {
          return _.filter(col, ['formatedDate', date]).length;
        });

        return {
          data,
          order: column.order,
          visible: column.visible,
          label: column.name,
          borderColor: column.color,
          backgroundColor: column.color,
        }
      })
      .filter('visible')
      .sortBy('order')
      .value();

    return {
      labels,
      datasets,
    }
  },

}))(jQuery, _, App, Util);
