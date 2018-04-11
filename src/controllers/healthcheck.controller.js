const debug = require('debug')('github-metrics:controllers:healthcheck');
const os = require('os');
const path = require('path');
const fs = require('fs');
const pkg = require('../../package.json');

const logDirectory = path.join(os.homedir(), `.${pkg.name}/logs`);

const _retrieveFileNames = directory => new Promise((resolve, reject) => {
  fs.readdir(directory, (err, files) => {
    if (err) return reject(err);
    resolve(files);
  });
});

const _retrieveFile = file => new Promise((resolve, reject) => {
  fs.readFile(file, {}, (err, file) => {
    if (err) return reject(err);
    resolve(file);
  });
});

const HealthcheckController = {

  /**
   * @api {get} / Healthcheck
   * @apiVersion 1
   * @apiName Healthcheck
   * @apiGroup Status
   * @apiPermission any
   *
   * @apiDescription Verify if the API server is running.
   *
   * @apiExample Example usage:
   * curl -i http://localhost:3000/
   */
  index: (req, res) => {
    debug('executing index action');

    res.status(200).send({ status: 'ok', version: pkg.version });
  },

  logs: async (req, res, next) => {
    try {
      const logFiles = await _retrieveFileNames(logDirectory);

      res.render('logs/index', { logs: logFiles });
    } catch (err) {
      next(err);
    }
  },

  log: async (req, res, next) => {
    const { logFile } = req.params;

    try {
      const log = await _retrieveFile(path.resolve(logDirectory, logFile));

      res.send(log);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = HealthcheckController;
