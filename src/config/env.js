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
  static get REQUEST_LOG_LEVEL() {
    return process.env.REQUEST_LOG_LEVEL || 'info';
  }

  /**
   * @param {string} value
   * @constructor
   */
  static set REQUEST_LOG_LEVEL(value) {
    process.env.REQUEST_LOG_LEVEL = value;
  }

  /**
   * @return {string}
   * @constructor
   */
  static get ALLOWED_GITHUB_COMPANY_NAME() {
    return process.env.ALLOWED_GITHUB_COMPANY_NAME;
  }

  /**
   * @param {string} value
   * @constructor
   */
  static set ALLOWED_GITHUB_COMPANY_NAME(value) {
    process.env.ALLOWED_GITHUB_COMPANY_NAME = value;
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
}

module.exports = Env;
