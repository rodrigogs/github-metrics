const debug = require('debug')('fastify-scaffold:controllers:github');

const GithubController = {

  /**
   * @api {get} /github Github webhook
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
  index: (request, reply) => {
    debug('executing index action');

    console.log(request.body);

    reply.code(200).send({ message: 'ok' });
  },

};

module.exports = GithubController;
