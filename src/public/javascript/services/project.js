const ProjectService = (($, App, _) => ({

  /**
   *
   */
  _cache: [],

  /**
   * @param {Number} id
   * @param [renewCache=false]
   * @return Promise
   */
  findById: (id, renewCache = false) => new Promise((resolve, reject) => {
    const cache = ProjectService._cache;
    const hasCache = cache && cache.length;

    if (hasCache && !renewCache) {
      const item = cache.find((project) => {
        return String(project.id) === String(id);
      });

      if (item) return resolve(item);
    }

    $.ajax({
      method: 'GET',
      url: App.getBaseUrl(`/api/v1/project/${id}`),
      dataType: 'json',
      success: (data) => {
        cache = _.remove(cache, item => String(item.id) === String(id));

        ProjectService._cache.push(data);
        resolve(data);
      },
      error: reject,
    });
  }),

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

}))(jQuery, App, _);
