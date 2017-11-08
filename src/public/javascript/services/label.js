const LabelService = (($, App) => ({

  /**
   *
   */
  _cache: [],

  /**
   * @param [renewCache=false]
   * @return Promise
   */
  list: (renewCache = false) => new Promise((resolve, reject) => {
    const cache = LabelService._cache;
    if (cache && cache.length && !renewCache) return resolve(cache);

    $.ajax({
      url: App.getBaseUrl('/api/v1/label/'),
      dataType: 'json',
      success: (data) => {
        LabelService._cache = data;
        resolve(data);
      },
      error: reject,
    });
  }),

}))(jQuery, App);
