const debug = require('debug')('github-metrics:routes:feed');

debug('configuring routes');

const FeedController = require('../../controllers/v1/feed');

module.exports = [
  {
    method: 'POST',
    url: '/github',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
          },
        },
      },
    },
    handler: FeedController.github,
  },
];
