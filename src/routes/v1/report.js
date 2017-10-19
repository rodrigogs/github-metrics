const debug = require('debug')('github-metrics:routes:v1:report');
const express = require('express');

debug('configuring routes');

const router = express.Router();

const ReportController = require('../../controllers/v1/report');

router.route('/summary')
  .get(ReportController.summaries);

module.exports = router;
