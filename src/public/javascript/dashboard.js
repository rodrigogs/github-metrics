((window, document, $, Promise, toastr, Chart, randomColor, Color, moment, _, App) => {
  /* Charts */
  let cfdChart;

  /* Elements */
  let reportForm;
  let projectSelect;
  let columnsModalBtn;
  let columnsModal;
  let closeColumnsModalBtn;
  let saveColumnsBtn;
  let fromDate;
  let toDate;
  let loadBtn;
  let cfdCard;
  let leadTimeCard;
  let wipCard;
  let cfdCanvas;
  let leadTimeCanvas;
  let wipCanvas;

  /* Data */
  let projects;
  let columns;
  let report;

  const disableControls = () => {
    projectSelect.attr('disabled', 'disabled');
    columnsModalBtn.attr('disabled', 'disabled');
    saveColumnsBtn.attr('disabled', 'disabled');
    fromDate.attr('disabled', 'disabled');
    toDate.attr('disabled', 'disabled');
    loadBtn.attr('disabled', 'disabled');
  };

  const enableControls = () => {
    projectSelect.removeAttr('disabled');
    columnsModalBtn.removeAttr('disabled');
    saveColumnsBtn.removeAttr('disabled');
    fromDate.removeAttr('disabled');
    toDate.removeAttr('disabled');
    loadBtn.removeAttr('disabled');
  };

  const populateProjects = (payload) => {
    projects = payload;

    projectSelect.empty();
    projects.forEach((project) => {
      projectSelect.append($('<option>', {
        text: project.name,
        value: project.id,
      }));
    });

    loadProjectColumns();
  };

  const populateProjectColumns = (payload) => {
    columns = payload;

    const modalBody = columnsModal.find('.modal-body tbody');
    const template = (column) => `
      <tr data-column-id="${column.id}">
        <th scope="row">
          ${column.name}
        </th>
        <td width="75px">
          <input type="color" class="column-color color-picker" id="column_color_${column.id}" value="${column.color || randomColor()}">
        </td>
        <td width="90px">
          <input class="form-control" id="column_order_${column.id}" type="number" min="0" value="${column.order || 0}">        
        </td>
        <td width="1%">
          <div class="form-check">
            <label class="form-check-label">
              <input class="form-check-input" id="column_visible_${column.id}" type="checkbox"
                    value="${column.id}" ${column.visible !== false ? 'checked' : ''} />
            </label>
          </div>
        </td>
      </tr>
    `;

    modalBody.empty();

    _.orderBy(columns, 'order')
      .map(template)
      .forEach((column => modalBody.append(column)));

    $('.column-color.color-picker').spectrum({
      showInput: true,
      allowEmpty: false,
      preferredFormat: 'hex',
    });
  };

  const saveColumn = (column) => new Promise((resolve, reject) => {
    $.ajax({
      method: 'PUT',
      url: App.getBaseUrl(`/api/v1/column/${column.id}`),
      data: column,
      dataType: 'json',
      success: resolve,
      error: reject,
    });
  });

  const saveColumns = async () => {
    disableControls();

    try {
      const columnsTbody = columnsModal.find('tbody');
      const data = _.map(columnsTbody.find('tr'), (row) => {
        row = $(row);

        const id = row.data('column-id');
        const color = row.find(`#column_color_${id}`).val();
        const order = Number(row.find(`#column_order_${id}`).val());
        const visible = row.find(`#column_visible_${id}`).is(':checked');

        return {
          id,
          color,
          order,
          visible,
        }
      });

      closeColumnsModalBtn.click();

      await Promise.all(data.map(saveColumn));
      await loadProjectColumns();
      toastr.info('Columns successfully saved!');
    } catch (err) {
      toastr.error('Error saving columns');
      console.error(err);
    } finally {
      enableControls();
    }
  };

  const loadProjectColumns = () => {
    disableControls();

    const projectId = projectSelect.find(':selected').val();

    $.ajax({
      url: App.getBaseUrl(`/api/v1/column?project.id=${projectId}`),
      dataType: 'json',
      success: populateProjectColumns,
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

  const loadCfd = () => {
    const summaries = _.cloneDeep(report);

    _.each(summaries, (summary) => {
      _.each(summary.board_moves, (move) => {
        const date = moment.utc(move.when);
        move.day = date.date();
        move.month = date.month() + 1;
        move.year = date.year();
        move.dayOfYear = date.dayOfYear();
        move.millis = date.valueOf();
        move.formatedDate = date.format('DD/MM/YYYY');
        move.column = columns.find(c => c.id === move.to_column.id);

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

    cfdChart.data = {
      labels,
      datasets,
    };
    cfdChart.update();
  };

  const loadLeadTime = () => {
    const summaries = _.cloneDeep(report);
  };

  const loadWip = () => {
    const summaries = _.cloneDeep(report);
  };

  const loadReport = async (e) => {
    e.preventDefault();

    const query = reportForm.serialize();
    disableControls();

    try {
      report = await getReportData(query);

      if (cfdCard.closest('.card').find('.collapse').hasClass('show')) {
        loadCfd();
      }

      if (leadTimeCard.closest('.card').find('.collapse').hasClass('show')) {
        loadLeadTime();
      }

      if (cfdCard.closest('.card').find('.collapse').hasClass('show')) {
        loadWip();
      }
    } catch (err) {
      console.error(err);
      toastr.error('An error has occurred');
    } finally {
      enableControls();
    }
  };

  const getReportData = (query) => new Promise((resolve, reject) => {
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
    columnsModalBtn = $('button#manage_columns');
    columnsModal = $('#column_manager');
    closeColumnsModalBtn = $('button#close_columns_modal');
    saveColumnsBtn = $('button#save_columns');
    fromDate = $('input#from_date');
    toDate = $('input#to_date');
    loadBtn = $('button#load_report');
    cfdCard = $('a#cfd_card');
    leadTimeCard = $('a#lead_time_card');
    wipCard = $('a#wip_card');
    cfdCanvas = $('canvas#cfd');
    leadTimeCanvas = $('canvas#lead_time');
    wipCanvas = $('canvas#wip');
  };

  const initEventHandlers = () => {
    projectSelect.on('change', loadProjectColumns);
    loadBtn.on('click', loadReport);
    saveColumnsBtn.on('click', saveColumns);
    cfdCard.on('click', loadCfd);
    leadTimeCard.on('click', loadLeadTime);
    wipCard.on('click', loadWip);
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
