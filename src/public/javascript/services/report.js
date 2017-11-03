const ReportService = (($, _, App) => ({

  summary: (query) => new Promise((resolve, reject) => {
    $.ajax({
      method: 'GET',
      url: App.getBaseUrl(`/api/v1/report/summary?${query}`),
      dataType: 'json',
      success: resolve,
      error: reject,
    });
  }),

  getCfdData: (data, project, columns) => {
    const rawData = $.extend(true, {}, data);
    const summaries = _(rawData)
      .map((summary) => {
        _.each(summary.board_moves, (move) => {
          const date = moment.utc(move.when);
          move.day = date.date();
          move.month = date.month() + 1;
          move.year = date.year();
          move.dayOfYear = date.dayOfYear();
          move.millis = date.valueOf();
          move.formatedDate = date.format('DD/MM/YYYY');
          move.column = $.extend(true, {}, columns.find(c => c.id === move.to_column.id));

          delete move.from_column;
          delete move.to_column;
        });

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

    const labels = _(summaries)
      .map('board_moves')
      .flatten()
      .sortBy('millis')
      .map('formatedDate')
      .uniq()
      .value();

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
      .value();

    return {
      labels,
      datasets,
    };
  },

  getWipData: (data, project, columns) => {
    const rawData = $.extend(true, {}, data);
    const summaries = _(rawData)
      .map((summary) => {
        _.each(summary.board_moves, (move) => {
          const date = moment.utc(move.when);
          move.day = date.date();
          move.month = date.month() + 1;
          move.year = date.year();
          move.dayOfYear = date.dayOfYear();
          move.millis = date.valueOf();
          move.formatedDate = date.format('DD/MM/YYYY');
          move.column = $.extend(true, {}, columns.find(c => c.id === move.to_column.id));

          delete move.from_column;
          delete move.to_column;
        });

        const distinctDays = _.groupBy(summary.board_moves, 'dayOfYear');
        summary.board_moves = _.map(distinctDays, day => _.maxBy(day, 'millis'));

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

    const labels = _(summaries)
      .map('board_moves')
      .flatten()
      .sortBy('millis')
      .map('formatedDate')
      .uniq()
      .value();

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

}))(jQuery, _, App);
