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

  getToken: async (provider = 'github') => {
    const token = await RedisProvider.safeGet('access_token');
    if (token) return token;

    const accessToken = await AccessToken.findOne({ provider, active: true }).exec();
    if (accessToken) return accessToken.token;
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

    const token = await AuthService.getToken();
    return !!token;
  },

  buildGitHubApi: async (token) => {
    debug('building GitHubApi');

    token = token || await AuthService.getToken();
    return new GitHubProvider.Api({ type: 'oauth', token });
  },

  buildGitHubRequest: async (token) => {
    debug('building GitHub contextualized request');

    token = token || await AuthService.getToken();

    const instance = GitHubProvider.request(token);
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
