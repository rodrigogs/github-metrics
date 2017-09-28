const DateHelper = {

  /**
   * Github has some date inconsistency. This helper resolves any type of date dynamically.
   *
   * @param {String|Number} val
   * @return {*}
   */
  resolveGithubDate: (val) => {
    if (val instanceof String) {
      return new Date(Date.parse(val));
    }
    if (val instanceof Number) {
      return new Date(val * 1000);
    }
    return null;
  },

};

module.exports = DateHelper;
