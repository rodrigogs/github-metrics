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
}

module.exports = Env;
