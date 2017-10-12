const debug = require('debug')('github-metrics:routes:v1:index');
const express = require('express');

debug('configuring routes');

const router = express.Router();

const feed = require('./feed');
const report = require('./report');
const project = require('./project');

router.use('/feed', feed);
router.use('/report', report);
router.use('/project', project);

module.exports = router;
