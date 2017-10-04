const debug = require('debug')('github-metrics:routes:feed');
const express = require('express');

debug('configuring routes');

const router = express.Router();

const FeedController = require('../../controllers/v1/feed');

router.route('/github')
  .post(FeedController.github);

module.exports = router;
