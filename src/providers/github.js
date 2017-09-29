const Env = require('../config/env');
const GitHubApi = require('github');

const GitHubProvider = new GitHubApi({
  Promise: global.Promise,
  host: 'api.github.com',
});

GitHubProvider.authenticate({
  type: 'token',
  token: Env.GITHUB_TOKEN,
});

module.exports = GitHubProvider;
