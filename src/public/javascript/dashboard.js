((window, document, $, Promise, toastr, Chart, randomColor, Color, moment, _, App) => {
  /* Charts */
  let cfdChart;

  /* CFD Elements */
  let cfdCanvas;
  let cfdForm;
  let cfdProjectSelect;
  let cfdFromDate;
  let cfdToDate;
  let cfdLoadButton;

  const populateProjects = (projects) => {
    cfdProjectSelect.empty();
    projects.forEach((project) => {
      cfdProjectSelect.append($('<option>', {
        text: project.name,
        value: project.id,
      }));
    });
  };

  const loadProjects = () => {
    cfdProjectSelect.attr('disabled', 'disabled');
    cfdFromDate.attr('disabled', 'disabled');
    cfdToDate.attr('disabled', 'disabled');
    cfdLoadButton.attr('disabled', 'disabled');

    $.ajax({
      url: App.getBaseUrl('/api/v1/project/'),
      dataType: 'json',
      success: populateProjects,
      complete: () => {
        cfdProjectSelect.removeAttr('disabled');
        cfdFromDate.removeAttr('disabled');
        cfdToDate.removeAttr('disabled');
        cfdLoadButton.removeAttr('disabled');
      },
    });
  };

  const loadCfd = async (e) => {
    e.preventDefault();

    const query = cfdForm.serialize();

    cfdProjectSelect.attr('disabled', 'disabled');
    cfdFromDate.attr('disabled', 'disabled');
    cfdToDate.attr('disabled', 'disabled');
    cfdLoadButton.attr('disabled', 'disabled');

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
      cfdProjectSelect.removeAttr('disabled');
      cfdFromDate.removeAttr('disabled');
      cfdToDate.removeAttr('disabled');
      cfdLoadButton.removeAttr('disabled');
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
    cfdForm = $('form#cfd_form');
    cfdCanvas = $('canvas#cfd');
    cfdProjectSelect = $('select#project_id');
    cfdFromDate = $('input#from_date');
    cfdToDate = $('input#to_date');
    cfdLoadButton = $('button#load-cfd');
  };

  const initEventHandlers = () => {
    cfdLoadButton.on('click', loadCfd);
  };

  const initCharts = () => {
    cfdChart = new Chart(cfdCanvas[0], {
      type: 'line',
      options: {
        responsive: true,
        title:{
          display: true,
          text:"Chart.js Line Chart - Stacked Area"
        },
        tooltips: {
          mode: 'index',
        },
        hover: {
          mode: 'index'
        },
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Month'
            }
          }],
          yAxes: [{
            stacked: true,
            scaleLabel: {
              display: true,
              labelString: 'Value'
            }
          }]
        }
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
