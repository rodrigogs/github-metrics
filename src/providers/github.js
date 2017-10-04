const axios = require('axios');
const GitHubApi = require('github');

class GitHub extends GitHubApi {
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

let _gitHubRequest;
let _token;

const request = (token) => {
  if (!_gitHubRequest || token !== _token) {
    _token = token;
    _gitHubRequest = axios.create({
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.inertia-preview+json',
      },
    });
  }

  return _gitHubRequest;
};

module.exports = {
  Api: GitHub,
  request,
};
