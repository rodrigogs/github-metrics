const debug = require('debug')('fastify-scaffold:routes:github');

debug('configuring routes');

const GithubController = require('../controllers/github');

module.exports = [
  {
    method: 'POST',
    url: '/',
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
    handler: GithubController.index,
  },
];
