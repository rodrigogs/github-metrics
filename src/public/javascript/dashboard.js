((window, document, $, Promise, toastr, Chart, randomColor, Color, moment, _, App) => {
  /* Charts */
  let cfdChart;

  /* Elements */
  let reportForm;
  let projectSelect;
  let columnsSelect;
  let fromDate;
  let toDate;
  let loadButton;
  let cfdCanvas;
  let leadTimeCanvas;
  let wipCanvas;

  const disableControls = () => {
    projectSelect.attr('disabled', 'disabled');
    columnsSelect.attr('disabled', 'disabled');
    fromDate.attr('disabled', 'disabled');
    toDate.attr('disabled', 'disabled');
    loadButton.attr('disabled', 'disabled');
  };

  const enableControls = () => {
    projectSelect.removeAttr('disabled');
    columnsSelect.removeAttr('disabled');
    fromDate.removeAttr('disabled');
    toDate.removeAttr('disabled');
    loadButton.removeAttr('disabled');
  };

  const populateProjects = (projects) => {
    projectSelect.empty();
    projects.forEach((project) => {
      projectSelect.append($('<option>', {
        text: project.name,
        value: project.id,
      }));
    });
  };

  const populateProjectColumns = (columns) => {
    columnsSelect.empty();
    columns.forEach((column) => {
      columnsSelect.append($('<option>', {
        text: column.name,
        value: column.id,
      }));
    });
  };

  const loadProjectColumns = () => {
    disableControls();

    const project_id = projectSelect.find(':selected').val();

    $.ajax({
      url: App.getBaseUrl(`/api/v1/project/${project_id}/columns`),
      dataType: 'json',
      success: populateProjects,
      complete: enableControls,
    });
  };

  const loadProjects = () => {
    disableControls();

    $.ajax({
      url: App.getBaseUrl('/api/v1/project/'),
      dataType: 'json',
      success: populateProjects,
      complete: enableControls,
    });
  };

  const loadCfd = async (e) => {
    e.preventDefault();

    const query = reportForm.serialize();

    projectSelect.attr('disabled', 'disabled');
    fromDate.attr('disabled', 'disabled');
    toDate.attr('disabled', 'disabled');
    loadButton.attr('disabled', 'disabled');

    try {
      const summaries = await getCfdData(query);

      _.each(summaries, (summary) => {
        _.each(summary.board_moves, (move) => {
          const date = moment.utc(move.when);
          move.day = date.date();
          move.month = date.month() + 1;
          move.year = date.year();
          move.dayOfYear = date.dayOfYear();
          move.millis = date.valueOf();
          move.formatedDate = date.format('DD/MM/YYYY');
          move.column = move.to_column.name;

          delete move.from_column;
          delete move.to_column;
        });

        return _.groupBy(summary.board_moves, 'dayOfYear');
      });

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
        .groupBy('column')
        .map((column, key) => {
          column = _.uniqBy(column, column => column.issue + column.formatedDate);
          const color = randomColor();

          let total = 0;
          const data = _.map(labels, (date) => {
            total += _.filter(column, ['formatedDate', date]).length;
            return total;
          });

          return {
            data,
            label: key,
            borderColor: color,
            backgroundColor: Color(color).alpha(0.3).rgbString(),
          }
        })
        .value();

      cfdChart.data = {
        labels,
        datasets,
      };
      cfdChart.update();
    } catch (err) {
      console.error(err);
      toastr.error('An error has occurred');
    } finally {
      projectSelect.removeAttr('disabled');
      fromDate.removeAttr('disabled');
      toDate.removeAttr('disabled');
      loadButton.removeAttr('disabled');
    }
  };

  const getCfdData = (query) => new Promise((resolve, reject) => {
    $.ajax({
      method: 'GET',
      url: App.getBaseUrl(`/api/v1/report/summary?${query}`),
      dataType: 'json',
      success: resolve,
      error: reject,
    });
  });

  const initElements = () => {
    reportForm = $('form#report_form');
    projectSelect = $('select#project_id');
    columnsSelect = $('select#project_columns');
    fromDate = $('input#from_date');
    toDate = $('input#to_date');
    loadButton = $('button#load_report');
    cfdCanvas = $('canvas#cfd');
    leadTimeCanvas = $('canvas#lead_time');
    wipCanvas = $('canvas#wip');
  };

  const initEventHandlers = () => {
    projectSelect.on('change', loadProjectColumns);
    loadButton.on('click', loadCfd);
  };

  const initCharts = () => {
    cfdChart = new Chart(cfdCanvas[0], {
      type: 'line',
      responsive: true,
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Days',
          },
        }],
        yAxes: [{
          stacked: true,
          scaleLabel: {
            display: true,
            labelString: 'Issues',
          },
        }],
      },
    });
  };

  const init = () => {
    initElements();
    initEventHandlers();
    initCharts();
    loadProjects();
  };

  $(document).ready(init);
})(window, document, jQuery, Promise, toastr, Chart, randomColor, Color, moment, _, App);
