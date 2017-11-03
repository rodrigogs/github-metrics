const LabelService = (($, App) => ({

  list: () => new Promise((resolve, reject) => {
    $.ajax({
      url: App.getBaseUrl('/api/v1/label/'),
      dataType: 'json',
      success: resolve,
      error: reject,
    });
  }),

}))(jQuery, App);
