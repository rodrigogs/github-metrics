const debug = require('debug')('github-metrics:controllers:dashboard');

const DashboardController = {

  /**
   * @param req
   * @param res
   * @return {Promise.<void>}
   */
  index: async (req, res) => {
    debug('executing index action');

    res.render('index');
  },

};

module.exports = DashboardController;
