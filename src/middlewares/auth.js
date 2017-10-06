const debug = require('debug')('github-metrics:middlewares:auth');

const AuthService = require('../services/auth');

const _ensureAppAuthenticated = async (req, res, next) => {
  debug('verifying if app is authenticated');

  try {
    const isAppAuthenticated = await AuthService.isAppAuthenticated();
    res.locals.is_app_authenticated = isAppAuthenticated;

    if (isAppAuthenticated) {
      debug('App is authenticated');
      return next();
    }
    debug('App isn\'t authenticated');
    res.redirect('/auth/register');
  } catch (err) {
    next(err);
  }
};

const _ensureAuthenticated = (req, res, next) => {
  debug('verifying if user is authenticated');

  const isAuthenticated = req.isAuthenticated();
  res.locals.is_authenticated = isAuthenticated;

  if (isAuthenticated) {
    debug('user is authenticated');
    return next();
  }
  debug('user isn\'t authenticated');
  res.redirect('/auth/github');
};

const AuthenticationMiddleware = {

  ensureAppAuthenticated: _ensureAppAuthenticated,

  ensureAuthenticated: _ensureAuthenticated,

  ensureFullyAuthenticated: [_ensureAppAuthenticated, _ensureAuthenticated],

};

module.exports = AuthenticationMiddleware;
