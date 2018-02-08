const debug = require('debug')('github-metrics:routes:v1:index');
const express = require('express');

debug('configuring routes');

const router = express.Router();

const feed = require('./feed.v1.routes');
const report = require('./report.v1.routes');
const project = require('./project.v1.routes');
const column = require('./column.v1.routes');
const label = require('./label.v1.routes');

router.use('/feed', feed);
router.use('/report', report);
router.use('/project', project);
router.use('/column', column);
router.use('/label', label);

module.exports = router;
