const debug = require('debug')('github-metrics:services:v1:label');

const Label = require('../../models/v1/label.v1.model');
const AuthService = require('../auth.service');

/**
 * @class LabelService
 * @extends Label
 */
class LabelService extends Label {
  /**
   * @param {Object} [obj = {}]
   * @return {Label}
   */
  static new(obj = {}) {
    return new Label(obj);
  }

  /**
   * @param label
   * @return {Promise<Label>}
   */
  static async saveOrUpdate(label) {
    if (!label) throw new Error('Trying to save an empty entity');

    debug('saving', JSON.stringify(label));

    return new Label(label).save();
  }

  /**
   * @param url
   * @return {Promise<Label>}
   */
  static async saveFromUrl(url) {
    if (!url) throw new Error('Trying to resolve a reference without url');

    debug('saving from url', url);

    const old = await Label.findOne({ url }).exec() || {};

    try {
      const request = await AuthService.buildGitHubRequest();
      const req = await request.get(url);
      const ref = req.data;
      return LabelService.saveOrUpdate(Object.assign(old, ref));
    } catch (ignore) {
      return old;
    }
  }
}

module.exports = LabelService;
