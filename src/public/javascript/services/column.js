const ColumnService = (($, App) => ({

  /**
   *
   */
  _cache: {},

  /**
   * @param projectUrl
   * @param [renewCache=false]
   * @return Promise
   */
  listForProject: (projectUrl, renewCache = false) => new Promise((resolve, reject) => {
    const cache = ColumnService._cache[projectUrl];
    if (cache && cache.length && !renewCache) return resolve(cache);

    $.ajax({
      url: App.getBaseUrl(`/api/v1/column?project_url=${projectUrl}`),
      dataType: 'json',
      success: (data) => {
        ColumnService._cache[projectUrl] = data;
        resolve(data);
      },
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
