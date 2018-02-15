const ReportService = (($, _, moment, App, Util) => ({

  /**
   *
   */
  _cache: {},

  /**
   * @param query
   * @return Promise
   */
  summary: (query) => new Promise((resolve, reject) => {
    $.ajax({
      method: 'GET',
      url: App.getBaseUrl(`/api/v1/report/summary?${query}`),
      dataType: 'json',
      success: resolve,
      error: reject,
    });
  }),

 wip: (query) => new Promise((resolve, reject) => {
   $.ajax({
     method: 'GET',
     url: App.getBaseUrl(`/api/v1/report/wip?${query}`),
     dataType: 'json',
     success: resolve,
     error: reject,
   });
 }),

 cfd: (query) => new Promise((resolve, reject) => {
   $.ajax({
     method: 'GET',
     url: App.getBaseUrl(`/api/v1/report/cfd?${query}`),
     dataType: 'json',
     success: resolve,
     error: reject,
   });
 }),

 leadtime: (query) => new Promise((resolve, reject) => {
   $.ajax({
     method: 'GET',
     url: App.getBaseUrl(`/api/v1/report/leadtime?${query}`),
     dataType: 'json',
     success: resolve,
     error: reject,
   });
 }),

 throughput: (query) => new Promise((resolve, reject) => {
   $.ajax({
     method: 'GET',
     url: App.getBaseUrl(`/api/v1/report/throughput?${query}`),
     dataType: 'json',
     success: resolve,
     error: reject,
   });
 }),

}))(jQuery, _, moment, App, Util);
