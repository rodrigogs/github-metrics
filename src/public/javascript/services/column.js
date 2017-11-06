const ColumnService = (($, App) => ({

  /**
   * @param projectId
   * @return Promise
   */
  listForProject: (projectId) => new Promise((resolve, reject) => {
    $.ajax({
      url: App.getBaseUrl(`/api/v1/column?project.id=${projectId}`),
      dataType: 'json',
      success: resolve,
      error: reject,
    });
  }),

  /**
   * @param id
   * @param data
   * @return Promise
   */
  update: (id, data) => new Promise((resolve, reject) => {
    $.ajax({
      method: 'PUT',
      url: App.getBaseUrl(`/api/v1/column/${id}`),
      data,
      dataType: 'json',
      success: resolve,
      error: reject,
    });
  }),

}))(jQuery, App);
