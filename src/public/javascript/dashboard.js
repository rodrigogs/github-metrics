((window, document, $, Promise, toastr, Chart, randomColor, Color, moment, _, App) => {
  /* Charts */
  let cfdChart;

  /* Elements */
  let cfdCanvas;
  let projectsSelect;
  let loadCfdButton;

  const populateProjects = (projects) => {
    projectsSelect.empty();
    projects.forEach((project) => {
      projectsSelect.append($('<option>', {
        text: project.name,
        value: project.id,
      }));
    });
  };

  const loadProjects = () => {
    projectsSelect.attr('disabled', 'disabled');
    loadCfdButton.attr('disabled', 'disabled');

    $.ajax({
      url: App.getBaseUrl('/api/v1/project/'),
      dataType: 'json',
      success: populateProjects,
      complete: () => {
        projectsSelect.removeAttr('disabled');
        loadCfdButton.removeAttr('disabled');
      },
    });
  };

  const loadCfd = async (e) => {
    e.preventDefault();

    const project = projectsSelect.find(':selected').val();
    projectsSelect.attr('disabled', 'disabled');
    loadCfdButton.attr('disabled', 'disabled');

    try {
      const summaries = await getCfdData(project);

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

        const distinctDays = _.groupBy(summary.board_moves, 'dayOfYear');
        summary.board_moves = _.map(distinctDays, day => _.maxBy(day, 'millis'));
      });

      const labels = _(summaries)
        .map('board_moves')
        .flatten()
        .sortBy('millis')
        .map('formatedDate')
        .uniq()
        .value();

      const datasets = _(summaries)
        .map('board_moves')
        .flatten()
        .sortBy('millis')
        .groupBy('column')
        .map((column, key) => {
          const color = randomColor();

          return {
            data: _.map(labels, (label) => {
              const matches = _.filter(column, ['formatedDate', label]);
              return matches.length;
            }),
            label: key,
            borderColor: color,
            backgroundColor: Color(color).alpha(0.5).rgbString(),
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
      projectsSelect.removeAttr('disabled');
      loadCfdButton.removeAttr('disabled');
    }
  };

  const getCfdData = (project) => new Promise((resolve, reject) => {
    $.ajax({
      method: 'GET',
      url: App.getBaseUrl(`/api/v1/report/cfd?project_id=${project}`),
      dataType: 'json',
      success: resolve,
      error: reject,
    });
  });

  const initElements = () => {
    cfdCanvas = $('canvas#cfd');
    projectsSelect = $('select#projects');
    loadCfdButton = $('button#load-cfd');
  };

  const initEventHandlers = () => {
    loadCfdButton.on('click', loadCfd);
  };

  const initCharts = () => {
    cfdChart = new Chart(cfdCanvas[0], {
      type: 'line',
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
