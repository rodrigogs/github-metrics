const debug = require('debug')('github-metrics:routes:auth');
const express = require('express');

debug('configuring routes');

const router = express.Router();

const AuthenticationMiddleware = require('../middlewares/auth');
const AuthController = require('../controllers/auth');

router.route('/authenticate')
  .get(AuthController.authenticateApp);

router.route('/deauthenticate')
  .get(AuthController.logoutApp);

router.route('/githubtoken')
  .get(AuthController.githubToken);

router.route('/githubtoken/callback')
  .get(AuthController.githubTokenCallback);

router.route('/github')
  .get(AuthenticationMiddleware.ensureAppAuthenticated, AuthController.github);

router.route('/github/callback')
  .get(AuthenticationMiddleware.ensureAppAuthenticated, AuthController.githubCallback);

module.exports = router;
