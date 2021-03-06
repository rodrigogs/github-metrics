require('dotenv').load();

class Env {
  /**
   * @return {string}
   * @constructor
   */
  static get APP_NAME() {
    return process.env.APP_NAME || 'GitHub Metrics';
  }

  /**
   * @return {string}
   * @constructor
   */
  static get APP_URL() {
    return process.env.APP_URL || '';
  }

  /**
   * @return {string}
   * @constructor
   */
  static get NODE_ENV() {
    return process.env.NODE_ENV || 'development';
  }

  /**
   * @param {string} value
   * @constructor
   */
  static set NODE_ENV(value) {
    process.env.NODE_ENV = value;
  }

  /**
   * @return {number}
   * @constructor
   */
  static get PORT() {
    return process.env.PORT ? Number(process.env.PORT) : 3000;
  }

  /**
   * @return {string}
   * @constructor
   */
  static get MONGO_DB() {
    return process.env.MONGO_DB || 'mongodb://localhost:27017/github-metrics';
  }

  /**
   * @return {number}
   * @constructor
   */
  static get RECONNECTION_INTERVAL() {
    return Number(process.env.RECONNECTION_INTERVAL) || 10000;
  }

  /**
   * @return {string}
   * @constructor
   */
  static get HTTP_LOG_CONFIG() {
    return process.env.HTTP_LOG_CONFIG || 'dev';
  }

  /**
   * @return {string}
   * @constructor
   */
  static get GITHUB_COMPANY_NAME() {
    return process.env.GITHUB_COMPANY_NAME;
  }

  /**
   * @return {string}
   * @constructor
   */
  static get GITHUB_CLIENT_ID() {
    return process.env.GITHUB_CLIENT_ID;
  }

  /**
   * @return {string}
   * @constructor
   */
  static get GITHUB_CLIENT_SECRET() {
    return process.env.GITHUB_CLIENT_SECRET;
  }

  /**
   * @example
   * [redis:]//[[user][:password@]][host][:port]
   * [/db-number][?db=db-number[&password=bar[&option=value]]]
   * @return {string}
   * @constructor
   */
  static get REDIS_URL() {
    return process.env.REDIS_URL;
  }

  /**
   * @return {string}
   * @constructor
   */
  static get SESSION_SECRET() {
    return process.env.SESSION_SECRET;
  }
}

module.exports = Env;
