const debug = require('debug')('github-metrics:controllers:v1:label');

const LabelService = require('../../services/v1/label');

const LabelController = {

  /**
   * @param req
   * @param res
   * @param next
   * @return {Promise.<void>}
   */
  find: async (req, res, next) => {
    debug('executing find action');

    try {
      const labels = await LabelService.find(req.query);
      res.status(200).send(labels);
    } catch (err) {
      next(err);
    }
  },

};

module.exports = LabelController;
