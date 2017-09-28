const debug = require('debug')('github-metrics:config:promise');
const Promise = require('bluebird');

debug('configuring global Promise');

Promise.config({
  warnings: {
    wForgottenReturn: false,
  },
});

global.Promise = Promise;
