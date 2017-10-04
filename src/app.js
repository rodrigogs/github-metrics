const path = require('path');
const debug = require('debug')('github-metrics:app');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');

debug('bootstrapping application');

const config = require('./config');
const Env = require('./config/env');
const routes = require('./routes');

/**
 * @param {Number} [port]
 * @return {Promise.<*>} fastify instance
 */
module.exports = (port) => {
  const app = express();

  port = port || Env.PORT;

  app.use(helmet());
  app.use(morgan(Env.HTTP_LOG_CONFIG, { stream: config.logger.stream }));
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(compression());
  app.use('/static', express.static(path.join(__dirname, 'public')));
  app.use(routes);

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  const listen = () => new Promise((resolve, reject) => {
    app.listen(port, (err) => {
      /* istanbul ignore next */
      if (err) return reject(err);
      resolve(app);
    });
  });

  return config.mongoose
    .then(listen);
};
