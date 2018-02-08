const DateHelper = {

  /**
   * Github has some date inconsistency. This helper resolves any type of date dynamically.
   *
   * @param {String|Number} val
   * @return {*}
   */
  resolveGithubDate: (val) => {
    if (typeof val === 'string') {
      return new Date(Date.parse(val));
    }
    if (typeof val === 'number') {
      return new Date(val * 1000);
    }
    return null;
  },

};

module.exports = DateHelper;
