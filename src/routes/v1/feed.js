const debug = require('debug')('github-metrics:routes:v1:feed');
const express = require('express');

debug('configuring routes');

const router = express.Router();

const FeedController = require('../../controllers/v1/feed');

router.route('/github')
  .post(FeedController.github);

router.route('/update')
  .post(FeedController.update);

module.exports = router;
