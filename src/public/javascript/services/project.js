const ProjectService = (($, App) => ({

  /**
   * @return Promise
   */
  list: () => new Promise((resolve, reject) => {
    $.ajax({
      method: 'GET',
      url: App.getBaseUrl('/api/v1/project/'),
      dataType: 'json',
      success: resolve,
      error: reject,
    });
  }),

  /**
   * @param projectId
   * @param data
   * @return Promise
   */
  update: (projectId, data) => new Promise((resolve, reject) => {
    $.ajax({
      method: 'PUT',
      url: App.getBaseUrl(`/api/v1/project/${projectId}`),
      data,
      dataType: 'json',
      success: resolve,
      error: reject,
    });
  }),

}))(jQuery, App);
