const GitHubApi = require('github');

class GitHubProvider extends GitHubApi {
  /**
   * @param {Object} auth
   * @param {String} auth.type
   * @param {String} auth.username For `basic` authentication type
   * @param {String} auth.password For `basic` authentication type
   * @param {String} auth.key For `oauth` authentication type
   * @param {String} auth.secret For `oauth` authentication type
   * @param {String} auth.token For `oauth` or `token` authentication types
   * @param {String} auth.jwt For `integration` authentication type
   * @return {Object} GitHub authenticated instance
   */
  constructor(auth) {
    super({
      Promise: global.Promise,
      host: 'api.github.com',
    });

    this.authenticate(auth);
  }
}

module.exports = GitHubProvider;
