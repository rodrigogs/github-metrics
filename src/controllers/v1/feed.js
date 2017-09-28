const debug = require('debug')('github-metrics:controllers:feed');

const FeedService = require('../../services/v1/feed');

const FeedController = {

  /**
   * @api {post} /github Github webhook
   * @apiVersion 1.0.0
   * @apiName Github
   * @apiGroup Webhook
   * @apiPermission any
   *
   * @apiDescription Github webhook.
   *
   * @apiExample Example usage:
   * curl -X POST http://localhost:3000/github
   */
  github: async (request, reply) => {
    debug('executing index action');

    const type = request.headers['x-github-event'];
    const payload = request.body;

    await FeedService.github(type, payload);

    reply.code(200).send({ message: 'ok' });
  },

};

module.exports = FeedController;
