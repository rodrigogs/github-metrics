const debug = require('debug')('github-metrics:services:auth');

const Env = require('../config/env');
const GitHubProvider = require('../providers/github');
const RedisProvider = require('../providers/redis');
const AccessToken = require('../models/access_token');

const AuthService = {

  persistToken: async (accessToken, profile, provider = 'github') => {
    debug('persisting token for provider', provider);

    const request = await AuthService.buildGitHubRequest({ token: accessToken });
    const orgs = await request.get('https://api.github.com/user/orgs');
    if (orgs.data) {
      const org = orgs.data.find(o => o.login === Env.GITHUB_COMPANY_NAME);
      if (!org) throw new Error('User must be in the allowed company');
    }

    await AuthService.deleteToken(provider);

    const token = AccessToken({ token: accessToken, provider });
    try {
      await token.save();
      RedisProvider.set('access_token', accessToken);
    } catch (err) {
      AuthService.deleteToken();
    }
  },

  deleteToken: async (provider = 'github') => {
    debug('deleting token for provider', provider);

    const oldToken = await AccessToken.findOne({ provider, active: true }).exec();
    if (oldToken) {
      oldToken.active = false;
      await oldToken.save();
    }
    RedisProvider.del('access_token');
  },

  isAppAuthenticated: async (provider = 'github') => {
    debug('verifying authentication for provider', provider);

    let token = await RedisProvider.safeGet('access_token');
    if (!token) token = await AccessToken.findOne({ provider, active: true }).exec();
    return !!token;
  },

  buildGitHubApi: async (accessToken) => {
    debug('building GitHubApi');

    if (!accessToken) accessToken = await AccessToken.findOne({ provider: 'github', active: true }).exec();
    return new GitHubProvider.Api({ type: 'oauth', token: accessToken.token });
  },

  buildGitHubRequest: async (accessToken) => {
    debug('building GitHub contextualized request');

    if (!accessToken) accessToken = await AccessToken.findOne({ provider: 'github', active: true }).exec();
    const instance = GitHubProvider.request(accessToken.token);
    instance.interceptors.response.use((res) => {
      if (res.status === 401) AuthService.deleteToken();
      return res;
    }, (err) => {
      if (err.response.status === 401) AuthService.deleteToken();
      return err;
    });

    return instance;
  },
};

module.exports = AuthService;
