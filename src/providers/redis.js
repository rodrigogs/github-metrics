const debug = require('debug')('github-metrics:providers:redis');
const redis = require('redis');

const Env = require('../config/env');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

redis.RedisClient.prototype.safeGet = function safeGet(...args) {
  if (!this.connected) return Promise.resolve(undefined);
  return redis.RedisClient.prototype.getAsync.call(this, args);
};

debug('creating redis client');
const client = redis.createClient(Env.REDIS_URL || '', {
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      debug('the server refused the connection');
    }
    return Math.min(options.attempt * 100, 20000);
  },
});

client.on('ready', () => debug('redis client is ready'));
client.on('connect', () => debug('redis client connected'));
client.on('reconnecting', () => debug('redis client reconnecting'));
client.on('error', err => debug('redis error', err));
client.on('end', () => debug('redis client connection closed'));
client.on('warning', warning => debug('redis warning', warning));

module.exports = client;
