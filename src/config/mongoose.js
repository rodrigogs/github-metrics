const debug = require('debug')('github-metrics:config:mongoose');
const mongoose = require('mongoose');
const logger = require('./logger');
const Env = require('./env');

const url = Env.MONGO_DB;

debug(`configuring mongoose connection to ${url}`);

mongoose.Promise = Promise;

mongoose.set('debug', Env.NODE_ENV === 'development');

const connect = () => mongoose.connect(url, {
  reconnectTries: Number.MAX_VALUE,
  useMongoClient: true,
});

connect();

module.exports = new Promise((resolve, reject) => {
  mongoose.connection.on('connected', () => logger.info(`Mongoose default connection open to ${url}`));

  mongoose.connection.on('error', (err) => {
    logger.error(`Mongoose default connection error: ${err}`);
    reject(err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.info('Mongoose default connection disconnected');
    logger.info(`Reconnecting in ${Env.RECONNECTION_INTERVAL / 1000} seconds`);

    setTimeout(() => connect(), Env.RECONNECTION_INTERVAL);
  });

  mongoose.connection.once('open', () => {
    logger.info('Mongoose default connection is open');
    resolve();
  });

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      logger.error('Mongoose default connection disconnected through app termination');
      process.exit(0);
    });
  });
});
