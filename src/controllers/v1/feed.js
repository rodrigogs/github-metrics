const debug = require('debug')('github-metrics:controllers:v1:feed');

const FeedService = require('../../services/v1/feed');

const FeedController = {

  /**
   * @api {post} /github Github webhook
   * @apiVersion 1
   * @apiName Github
   * @apiGroup Webhook
   * @apiPermission any
   *
   * @apiDescription Github webhook.
   *
   * @apiExample Example usage:
   * curl -X POST http://localhost:3000/github
   */
  github: async (req, res, next) => {
    debug('executing index action');

    const type = req.headers['x-github-event'];
    const payload = req.body;

    try {
      await FeedService.schedule('github', type, payload);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },

};

module.exports = FeedController;
