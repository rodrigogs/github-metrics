const debug = require('debug')('github-metrics:routes:v1:index');
const express = require('express');

debug('configuring routes');

const router = express.Router();

const feed = require('./feed');

router.use('/feed', feed);

module.exports = router;
