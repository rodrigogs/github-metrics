const debug = require('debug')('github-metrics:middlewares:auth');

const AuthService = require('../services/auth');

const AuthenticationMiddleware = {

  ensureAuthenticated: async (req, res, next) => {
    debug('verifying if app is authenticated');

    try {
      const isAuthenticated = await AuthService.isAuthenticated();
      res.locals.is_authenticated = isAuthenticated;

      if (isAuthenticated) {
        debug('GitHub is authenticated');
        return next();
      }
      debug('GitHub isn\'t authenticated');
      res.redirect('/auth/login');
    } catch (err) {
      next(err);
    }
  },

};

module.exports = AuthenticationMiddleware;
