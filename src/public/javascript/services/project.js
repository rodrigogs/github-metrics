const ProjectService = (($, App) => ({

  /**
   *
   */
  _cache: [],

  /**
   * @param [renewCache=false]
   * @return Promise
   */
  list: (renewCache = false) => new Promise((resolve, reject) => {
    const cache = ProjectService._cache;
    if (cache && cache.length && !renewCache) return resolve(cache);

    $.ajax({
      method: 'GET',
      url: App.getBaseUrl('/api/v1/project/'),
      dataType: 'json',
      success: (data) => {
        ProjectService._cache = data;
        resolve(data);
      },
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
