const debug = require('debug')('github-metrics:controllers:process');

const ProcessService = require('../services/process');

const ProcessController = {

  /**
   * @param req
   * @param res
   * @return {Promise.<void>}
   */
  index: async (req, res) => {
    debug('executing index action');

    res.render('process/index');
  },

  /**
   * @param req
   * @param res
   * @return {Promise.<void>}
   */
  execute: async (req, res) => {
    debug('executing execute action');

    const { process } = req.body;

    try {
      await ProcessService.execute(process);
      req.flash('success', 'Executing process');
    } catch (err) {
      req.flash('error', err.message);
    }

    res.redirect('/process');
  },

};

module.exports = ProcessController;
