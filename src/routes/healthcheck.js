const debug = require('debug')('fastify-scaffold:routes:healthcheck');

debug('configuring routes');

const HealthcheckController = require('../controllers/healthcheck');

module.exports = [
  {
    method: 'GET',
    url: '/',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
            },
          },
        },
      },
    },
    handler: HealthcheckController.index,
  },
];
