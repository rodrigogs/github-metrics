const App = ((window, document, $) => ({

  /**
   *
   */
  startLoader: () => {
    $('.progress.default-loader').show();
  },

  /**
   *
   */
  stopLoader: () => {
    $('.progress.default-loader').hide();
  },

  /**
   *
   */
  configure: () => {
    $.ajaxSetup({
      global: true,
      xhrFields: {
        withCredentials: true
      }
    });

    $(document).ajaxStart(App.startLoader);
    $(document).ajaxStop(App.stopLoader);

    $('.color-picker').spectrum();
  },

  /**
   * @param [path='']
   * @return {string}
   */
  getBaseUrl: (path = '') => {
    const baseUrl = $('base#base-url').attr('href');
    if (!path.startsWith('/')) path = `/${path}`;

    return `${baseUrl}${path}`;
  },

}))(window, document, jQuery);

$(document).ready(App.configure);
