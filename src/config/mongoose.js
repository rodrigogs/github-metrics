const debug = require('debug')('github-metrics:config:mongoose');
const mongoose = require('mongoose');
const logger = require('./logger');
const Env = require('./env');

const url = Env.MONGO_DB;

let initialized = false;

debug(`configuring mongoose connection to ${url}`);

mongoose.Promise = Promise;

mongoose.set('debug', Env.NODE_ENV === 'development');

const connect = () => mongoose.connect(url, {
  reconnectTries: Number.MAX_VALUE,
}).then((conn) => {
  initialized = true;
  return conn;
});

mongoose.connection.on('connected', () => logger.info(`Mongoose default connection open to ${url}`));

mongoose.connection.on('error', err => initialized && logger.error(`Mongoose default connection error: ${err}`));

mongoose.connection.on('disconnected', () => {
  if (initialized) {
    logger.info('Mongoose default connection disconnected');
    logger.info(`Reconnecting in ${Env.RECONNECTION_INTERVAL / 1000} seconds`);

    setTimeout(() => connect(), Env.RECONNECTION_INTERVAL);
  }
});

mongoose.connection.once('open', () => logger.info('Mongoose default connection is open'));

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    logger.error('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

module.exports = connect();
