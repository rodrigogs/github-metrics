require('dotenv').load();

class Env {
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
    return Number(process.env.PORT) || 3000;
  }

  /**
   * @param {number} value
   * @constructor
   */
  static set PORT(value) {
    process.env.PORT = value;
  }

  /**
   * @return {string}
   * @constructor
   */
  static get MONGO_DB() {
    return process.env.MONGO_DB || 'mongodb://localhost:27017/github-metrics';
  }

  /**
   * @param {string} value
   * @constructor
   */
  static set MONGO_DB(value) {
    process.env.MONGO_DB = value;
  }

  /**
   * @return {number}
   * @constructor
   */
  static get RECONNECTION_INTERVAL() {
    return Number(process.env.RECONNECTION_INTERVAL) || 10000;
  }

  /**
   * @param {number} value
   * @constructor
   */
  static set RECONNECTION_INTERVAL(value) {
    process.env.RECONNECTION_INTERVAL = value;
  }

  /**
   * @return {string}
   * @constructor
   */
  static get HTTP_LOG_CONFIG() {
    return process.env.HTTP_LOG_CONFIG || 'dev';
  }

  /**
   * @param {string} value
   * @constructor
   */
  static set HTTP_LOG_CONFIG(value) {
    process.env.HTTP_LOG_CONFIG = value;
  }

  /**
   * @return {string}
   * @constructor
   */
  static get GITHUB_COMPANY_NAME() {
    return process.env.GITHUB_COMPANY_NAME;
  }

  /**
   * @param {string} value
   * @constructor
   */
  static set GITHUB_COMPANY_NAME(value) {
    process.env.GITHUB_COMPANY_NAME = value;
  }

  /**
   * @return {string}
   * @constructor
   */
  static get GITHUB_CLIENT_ID() {
    return process.env.GITHUB_CLIENT_ID;
  }

  /**
   * @param {string} value
   * @constructor
   */
  static set GITHUB_CLIENT_ID(value) {
    process.env.GITHUB_CLIENT_ID = value;
  }

  /**
   * @return {string}
   * @constructor
   */
  static get GITHUB_CLIENT_SECRET() {
    return process.env.GITHUB_CLIENT_SECRET;
  }

  /**
   * @param {string} value
   * @constructor
   */
  static set GITHUB_CLIENT_SECRET(value) {
    process.env.GITHUB_CLIENT_SECRET = value;
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
   * @param {string} value
   * @constructor
   */
  static set REDIS_URL(value) {
    process.env.REDIS_URL = value;
  }
}

module.exports = Env;
