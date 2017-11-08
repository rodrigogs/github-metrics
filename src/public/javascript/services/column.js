const ColumnService = (($, App) => ({

  /**
   *
   */
  _cache: {},

  /**
   * @param projectId
   * @param [renewCache=false]
   * @return Promise
   */
  listForProject: (projectId, renewCache = false) => new Promise((resolve, reject) => {
    const cache = ColumnService._cache[projectId];
    if (cache && cache.length && !renewCache) return resolve(cache);

    $.ajax({
      url: App.getBaseUrl(`/api/v1/column?project.id=${projectId}`),
      dataType: 'json',
      success: (data) => {
        ColumnService._cache[projectId] = data;
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
