const debug = require('debug')('github-metrics:routes:auth');
const express = require('express');

debug('configuring routes');

const router = express.Router();

const AuthController = require('../controllers/auth');

router.route('/login')
  .get(AuthController.login);

router.route('/logout')
  .get(AuthController.logout);

router.route('/github')
  .get(AuthController.github);

router.route('/github/callback')
  .get(AuthController.githubCallback);

module.exports = router;
