const ProjectService = (($, App) => ({

  list: () => new Promise((resolve, reject) => {
    $.ajax({
      method: 'GET',
      url: App.getBaseUrl('/api/v1/project/'),
      dataType: 'json',
      success: resolve,
      error: reject,
    });
  }),

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
