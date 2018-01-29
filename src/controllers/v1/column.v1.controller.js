const debug = require('debug')('github-metrics:controllers:v1:column');

const ColumnService = require('../../services/v1/column.v1.service');

const ColumnController = {

  /**
   * @param req
   * @param res
   * @param next
   * @return {Promise.<void>}
   */
  find: async (req, res, next) => {
    debug('executing find action');

    try {
      const columns = await ColumnService.find(req.query);
      res.status(200).send(columns);
    } catch (err) {
      next(err);
    }
  },

  /**
   * @param req
   * @param res
   * @param next
   * @return {Promise.<void>}
   */
  update: async (req, res, next) => {
    debug('executing update action');

    const { color, order, visible } = req.body;

    try {
      const columns = await ColumnService.update(req.params.id, color, order, visible);
      res.status(200).send(columns);
    } catch (err) {
      next(err);
    }
  },

};

module.exports = ColumnController;
