const debug = require('debug')('github-metrics:middlewares:errors');
const Env = require('../config/env');
const logger = require('../config/logger');

const ErrorHandlerMiddleware = {

  notFound: (req, res, next) => {
    debug('route not found');

    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  },

  generic: (err, req, res, next) => {
    if (!err) return next();
    debug(`error caught: ${err.message}`);

    if (Env.NODE_ENV !== 'development') delete err.stack;
    logger.error(err);

    res
      .status(err.status || 500)
      .send(err.message);
  },

};

module.exports = ErrorHandlerMiddleware;
