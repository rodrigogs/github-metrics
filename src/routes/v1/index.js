const debug = require('debug')('github-metrics:routes:v1:index');

debug('configuring routes');

const feed = require('./feed');

const routers = [
  {
    prefix: '/feed',
    routes: feed,
  },
];

module.exports = routers;
