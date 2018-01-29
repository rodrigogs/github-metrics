const debug = require('debug')('github-metrics:services:auth');

const Env = require('../config/env');
const GitHubProvider = require('../providers/github.provider');
const RedisProvider = require('../providers/redis.provider');
const AccessToken = require('../models/v1/access_token.v1.model');

/**
 * @class AuthService
 */
class AuthService {
  /**
   * @param {String} accessToken
   * @param {Object} profile
   * @param {String} [provider = 'github']
   * @return {Promise<void>}
   */
  static async persistToken(accessToken, profile, provider = 'github') {
    debug('persisting token for provider', provider);

    const request = await AuthService.buildGitHubRequest(accessToken);
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
  }

  /**
   * @param {String} [provider = 'github']
   * @return {Promise<*>}
   */
  static async getToken(provider = 'github') {
    const token = await RedisProvider.safeGet('access_token');
    if (token) return token;

    const accessToken = await AccessToken.findOne({ provider, active: true }).exec();
    if (accessToken) {
      RedisProvider.set('access_token', accessToken.token);
      return accessToken.token;
    }
  }

  /**
   * @param {String} [provider = 'github']
   * @return {Promise<void>}
   */
  static async deleteToken(provider = 'github') {
    debug('deleting token for provider', provider);

    const oldToken = await AccessToken.findOne({ provider, active: true }).exec();
    if (oldToken) {
      oldToken.active = false;
      await oldToken.save();
    }
    RedisProvider.del('access_token');
  }

  /**
   * @param {String} [provider = 'github']
   * @return {Promise<boolean>}
   */
  static async isAppAuthenticated(provider = 'github') {
    debug('verifying authentication for provider', provider);

    const token = await AuthService.getToken();
    return !!token;
  }

  /**
   * @param {String} token
   * @return {Promise<GitHub>}
   */
  static async buildGitHubApi(token) {
    debug('building GitHubApi');

    token = token || await AuthService.getToken();
    return new GitHubProvider.Api({ type: 'oauth', token });
  }

  /**
   * @param {String} token
   * @return {Promise<Axios>}
   */
  static async buildGitHubRequest(token) {
    debug('building GitHub contextualized request');

    const deauthOnError = !token;
    token = token || await AuthService.getToken();

    const instance = GitHubProvider.request(token);

    if (deauthOnError) {
      instance.interceptors.response.use((res) => {
        if (res.status === 401) AuthService.deleteToken();
        return res;
      }, (err) => {
        if (err.response.status === 401) AuthService.deleteToken();
        return err;
      });
    }

    return instance;
  }
}

module.exports = AuthService;
