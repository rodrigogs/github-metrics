const debug = require('debug')('github-metrics:controllers:auth');
const passport = require('passport');

const AuthService = require('../services/auth.service');

const AuthController = {

  /**
   * @param req
   * @param res
   * @param next
   * @return {Promise.<void>}
   */
  authenticateApp: async (req, res, next) => {
    debug('executing authenticateApp action');

    try {
      const isAuthenticated = await AuthService.isAppAuthenticated();
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
  logoutApp: async (req, res, next) => {
    debug('executing logoutApp action');

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
    passport.authenticate('github', (err, user) => {
      if (err) return next(err);
      req.logIn(user, (err) => {
        if (err) return next(err);
        res.redirect('/');
      });
    })(req, res, next);
  },

  githubToken: passport.authenticate('github-token'),

  githubTokenCallback: (req, res, next) => {
    passport.authenticate('github-token', (err) => {
      if (err) return next(err);
      req.flash('info', 'GitHub successfully authenticated');
      res.redirect('/');
    })(req, res, next);
  },

};

module.exports = AuthController;
