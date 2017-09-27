const debug = require('debug')('fastify-scaffold:routes:index');

debug('configuring routes');

const healthcheck = require('./healthcheck');
const github = require('./github');
const v1 = require('./v1');

const routers = [
  {
    routes: healthcheck,
  },
  {
    prefix: '/github',
    routes: github,
  },
  {
    prefix: '/v1',
    routers: v1,
  },
];

module.exports = routers;
