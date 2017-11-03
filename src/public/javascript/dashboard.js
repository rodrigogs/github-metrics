const Dashboard = ((window, document, $, Promise, toastr, Chart, randomColor, Color, moment, _, App, ProjectService, ColumnService, ReportService, LabelService) => {
  /* Charts */
  let cfdChart;
  let wipChart;

  /* Elements */
  let reportForm;
  let projectSelect;
  let columnsModalBtn;
  let columnsModal;
  let closeColumnsModalBtn;
  let saveColumnsBtn;
  let labelsModalBtn;
  let labelsModal;
  let closeLabelsModalBtn;
  let saveLabelsBtn;
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
  let labels;
  let report;

  const disableControls = () => {
    projectSelect.attr('disabled', 'disabled');
    columnsModalBtn.attr('disabled', 'disabled');
    saveColumnsBtn.attr('disabled', 'disabled');
    labelsModalBtn.attr('disabled', 'disabled');
    saveLabelsBtn.attr('disabled', 'disabled');
    fromDate.attr('disabled', 'disabled');
    toDate.attr('disabled', 'disabled');
    loadBtn.attr('disabled', 'disabled');
  };

  const enableControls = () => {
    projectSelect.removeAttr('disabled');
    columnsModalBtn.removeAttr('disabled');
    saveColumnsBtn.removeAttr('disabled');
    labelsModalBtn.removeAttr('disabled');
    saveLabelsBtn.removeAttr('disabled');
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

  const getCurrentProject = () => {
    const currentProjectId = projectSelect.find(':selected').val();
    return projects.find(project => Number(project.id) === Number(currentProjectId));
  };

  const populateProjectColumns = (payload) => {
    columns = payload || columns;

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

      await Promise.all(data.map(ColumnService.update));
      await loadProjectColumns();
      toastr.info('Columns successfully saved!');
    } catch (err) {
      toastr.error('Error saving columns');
      console.error(err);
    } finally {
      enableControls();
    }
  };

  const saveLabels = async () => {
    disableControls();

    const currentProject = getCurrentProject();

    try {
      const labelsTbody = labelsModal.find('tbody');
      const data = _(labelsTbody.find('tr'))
        .map((row) => {
          row = $(row);

          const id = row.data('label-id');
          const ignore = row.find(`#label_ignore_${id}`).is(':checked');

          return {
            id,
            ignore,
          }
        })
        .filter(label => !!label.ignore)
        .map(label => Number(label.id))
        .value();

      closeLabelsModalBtn.click();

      await ProjectService.update(currentProject.id, { ignore_labels: data.join(',') });
      currentProject.ignore_labels = data;

      populateLabels();
      toastr.info('Labels successfully saved!');
    } catch (err) {
      toastr.error('Error saving labels');
      console.error(err);
    } finally {
      enableControls();
    }
  };

  const loadProjectColumns = async () => {
    disableControls();

    const projectId = projectSelect.find(':selected').val();

    try {
      const data = await ColumnService.listForProject(projectId);
      populateProjectColumns(data);
    } catch (err) {
      toastr.error('Error retrieving columns for project');
      console.error(err);
    } finally {
      enableControls();
    }
  };

  const loadProjects = async () => {
    disableControls();

    try {
      const data = await ProjectService.list();
      populateProjects(data);
    } catch (err) {
      toastr.error('Error retrieving projects');
      console.error(err);
    } finally {
      enableControls();
    }
  };

  const populateLabels = (payload) => {
    labels = payload || labels;

    const currentProject = getCurrentProject();

    const modalBody = labelsModal.find('.modal-body tbody');
    const template = (label) => `
      <tr data-label-id="${label.id}">
        <th scope="row">
          <span class="badge" style="background-color: #${label.color}">${label.name}</span>
        </th>
        <td width="1%">
          <div class="form-check">
            <label class="form-check-label">
              <input class="form-check-input" id="label_ignore_${label.id}" type="checkbox"
                    value="${label.id}" ${currentProject.ignore_labels.indexOf(label.id) !== -1 ? 'checked' : ''} />
            </label>
          </div>
        </td>
      </tr>
    `;

    modalBody.empty();

    _.orderBy(labels, 'name')
      .map(template)
      .forEach((column => modalBody.append(column)));
  };

  const loadLabels = async () => {
    disableControls();

    try {
      const data = await LabelService.list();
      populateLabels(data);
    } catch (err) {
      toastr.error('Error retrieving labels');
      console.error(err);
    } finally {
      enableControls();
    }
  };

  const loadLeadTime = () => {
  };

  const loadCfd = () => {
    cfdChart.data = ReportService.getCfdData(report, getCurrentProject(), columns);
    cfdChart.update();
  };

  const loadWip = () => {
    wipChart.data = ReportService.getWipData(report, getCurrentProject(), columns);
    wipChart.update();
  };

  const loadReport = async (e) => {
    e.preventDefault();

    const query = reportForm.serialize();
    disableControls();

    try {
      report = await ReportService.summary(query);

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

  const initElements = () => {
    reportForm = $('form#report_form');
    projectSelect = $('select#project_id');
    columnsModalBtn = $('button#manage_columns');
    columnsModal = $('#column_manager');
    closeColumnsModalBtn = $('button#close_columns_modal');
    saveColumnsBtn = $('button#save_columns');
    labelsModalBtn = $('button#manage_labels');
    labelsModal = $('#label_manager');
    closeLabelsModalBtn = $('button#close_labels_modal');
    saveLabelsBtn = $('button#save_labels');
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
    projectSelect.on('change', () => loadProjectColumns() && populateLabels());
    loadBtn.on('click', loadReport);
    saveColumnsBtn.on('click', saveColumns);
    saveLabelsBtn.on('click', saveLabels);
    cfdCard.on('click', loadCfd);
    leadTimeCard.on('click', loadLeadTime);
    wipCard.on('click', loadWip);
  };

  const initCharts = () => {
    cfdChart = new Chart(cfdCanvas[0], {
      type: 'line',
      options: {
        responsive: true,
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Days',
            },
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Issues',
            },
          }],
        },
      },
    });

    wipChart = new Chart(wipCanvas[0], {
      type: 'bar',
      options: {
        responsive: true,
        tooltips: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          xAxes: [{
            stacked: true,
          }],
          yAxes: [{
            stacked: true,
          }],
        },
      },
    });
  };

  const init = () => {
    initElements();
    initEventHandlers();
    initCharts();
    loadProjects().then(loadLabels);
  };

  return {
    init,
  };
})(window, document, jQuery, Promise, toastr, Chart, randomColor, Color, moment, _, App, ProjectService, ColumnService, ReportService, LabelService);

$(document).ready(Dashboard.init);
