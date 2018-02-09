const debug = require('debug')('github-metrics:controllers:v1:label');

const LabelService = require('../../services/v1/label.v1.service');

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
      const labels = await LabelService.find(req.query).exec();
      res.status(200).send(labels);
    } catch (err) {
      next(err);
    }
  },

};

module.exports = LabelController;
