const debug = require('debug')('fastify-scaffold:app');
const fastify = require('fastify');
const router = require('fastify-router');
const helmet = require('fastify-helmet');
const formBody = require('fastify-formbody');

debug('bootstrapping application');

const Env = require('./config/env');

const routes = require('./routes');

module.exports = port => new Promise((resolve, reject) => {
  const app = fastify();

  port = port || Env.PORT || 3000;

  app.register(helmet);
  app.register(formBody);

  app.register(router, {}, (err) => {
    if (err) return reject(err);
    app.Router.route(routes);
  });

  app.listen(port, (err) => {
    /* istanbul ignore next */
    if (err) return reject(err);
    resolve(app);
  });
});
