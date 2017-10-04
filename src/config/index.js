const debug = require('debug')('github-metrics:config');

debug('loading app configuration');

require('./promise');

module.exports = {
  Env: require('./env'),
  logger: require('./logger'),
  mongoose: require('./mongoose'),
  passport: require('./passport'),
};
