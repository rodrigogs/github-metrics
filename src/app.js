const debug = require('debug')('github-metrics:app');
const fastify = require('fastify');
const helmet = require('fastify-helmet');
const router = require('fastify-router');
const formBody = require('fastify-formbody');

debug('bootstrapping application');

const config = require('./config');
const Env = require('./config/env');
const routes = require('./routes');

/**
 * @param {Number} [port]
 * @return {Promise.<*>} fastify instance
 */
module.exports = (port) => {
  const app = fastify({
    logger: {
      level: Env.REQUEST_LOG_LEVEL,
      stream: config.logger.stream,
    },
  });

  port = port || Env.PORT;

  app.register(helmet);
  app.register(formBody);

  app.register(router, {}, (err) => {
    if (err) throw err;
    app.Router.route(routes);
  });

  const listen = () => new Promise((resolve, reject) => {
    app.listen(port, (err) => {
      /* istanbul ignore next */
      if (err) return reject(err);
      resolve(app);
    });
  });

  return config.mongoose
    .then(listen);
};
