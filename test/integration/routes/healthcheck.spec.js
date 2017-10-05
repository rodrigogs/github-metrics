const chai = require('chai');
const got = require('got');
const Env = require('../../../src/config/env');
const server = require('../../fixture/server');

chai.should();

let instance;

before(async () => {
  instance = await server();
});

after(() => {
  instance.close();
});

suite('healthcheck', () => {
  suite('/', () => {
    test('should return a status message', async () => {
      const response = await got(`http://localhost:${Env.PORT}/healthcheck`, { json: true });

      response.statusCode.should.be.equal(200);
      response.body.status.should.be.equal('ok');
    });
  });
});
