const debug = require('debug')('github-metrics:controllers:sheet');

const SheetService = require('../services/sheet');

const SheetController = {

  /**
   * @param req
   * @param res
   * @param next
   * @return {Promise.<void>}
   */
  config: async (req, res) => {
    debug('executing config action');

    res.render('sheet/index');
  },

  /**
   * @param req
   * @param res
   * @param next
   * @return {Promise.<void>}
   */
  load: async (req, res, next) => {
    debug('executing load action');

    const { sheet } = req.files;
    req.flash('error', 'Select a file');
    if (!sheet) return res.redirect('/sheet');

    try {
      await SheetService.read(sheet.data);
      req.flash('success', 'Not implemented yet ¯\\_(ツ)_/¯');
      res.redirect('/sheet');
    } catch (err) {
      next(err);
    }
  },

};

module.exports = SheetController;
