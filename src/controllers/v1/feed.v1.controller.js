const debug = require('debug')('github-metrics:controllers:v1:feed');

const FeedService = require('../../services/v1/feed.v1.service');

const FeedController = {

  /**
   * @api {post} /update Github webhook
   * @apiVersion 1
   * @apiName Github
   * @apiGroup Webhook
   * @apiPermission any
   *
   * @apiDescription Github webhook.
   */
  update: async (req, res, next) => {
    debug('executing update action');

    const code = req.headers['x-delivery'];
    const type = req.headers['x-event'];
    const delivery = req.body;

    try {
      await FeedService.update(code, type, delivery);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },

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
    debug('executing github action');

    const delivery = req.headers['x-github-delivery'];
    const type = req.headers['x-github-event'];
    const payload = req.body;

    try {
      await FeedService.schedule('github', delivery, type, payload);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },

};

module.exports = FeedController;
