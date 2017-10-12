const path = require('path');
const debug = require('debug')('github-metrics:app');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');
const fileUpload = require('express-fileupload');
const favicon = require('serve-favicon');

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

  app.locals.app_url = Env.APP_URL;
  app.locals.app_name = Env.APP_NAME;

  app.use(helmet());
  app.use(morgan(Env.HTTP_LOG_CONFIG, { stream: config.logger.stream }));
  app.use(cors());
  app.use(fileUpload({ debug: true }));
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
  app.use(compression());
  app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
  app.use('/static', express.static(path.join(__dirname, 'public')));
  app.use(routes);

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  const listen = () => new Promise((resolve, reject) => {
    port = port || Env.PORT;

    const server = app.listen(port, (err) => {
      /* istanbul ignore next */
      if (err) return reject(err);
      resolve(server);
    });
  });

  return config.mongoose
    .then(listen);
};
