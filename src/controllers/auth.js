const debug = require('debug')('github-metrics:controllers:auth');
const passport = require('passport');

const AuthService = require('../services/auth');

const AuthController = {

  /**
   * @param req
   * @param res
   * @param next
   * @return {Promise.<void>}
   */
  login: async (req, res, next) => {
    debug('executing login action');

    try {
      const isAuthenticated = await AuthService.isAuthenticated();
      res.render('auth/login', { is_authenticated: isAuthenticated });
    } catch (err) {
      next(err);
    }
  },

  /**
   * @param req
   * @param res
   * @param next
   * @return {Promise.<void>}
   */
  logout: async (req, res, next) => {
    debug('executing logout action');

    try {
      await AuthService.deleteToken();
      req.flash('info', 'Logged out successfully');
      res.redirect('/auth/login');
    } catch (err) {
      next(err);
    }
  },

  github: passport.authenticate('github'),

  githubCallback: (req, res, next) => {
    passport.authenticate('github', (err) => {
      if (err) return next(err);
      req.flash('info', 'GitHub successfully authenticated');
      res.redirect('/');
    })(req, res, next);
  },

};

module.exports = AuthController;
