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
    return process.env.MONGO_DB;
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
  static get GITHUB_TOKEN() {
    return process.env.GITHUB_TOKEN;
  }

  /**
   * @param {string} value
   * @constructor
   */
  static set GITHUB_TOKEN(value) {
    process.env.GITHUB_TOKEN = value;
  }
}

module.exports = Env;
