const debug = require('debug')('github-metrics:routes:index');

debug('configuring routes');

const healthcheck = require('./healthcheck');
const v1 = require('./v1');

const routers = [
  {
    routes: healthcheck,
  },
  {
    prefix: '/v1',
    routers: v1,
  },
];

module.exports = routers;
