const debug = require('debug')('github-metrics:routes:report');
const express = require('express');

debug('configuring routes');

const router = express.Router();

const ReportController = require('../../controllers/v1/report');

router.route('/cfd')
  .get(ReportController.cfd);

module.exports = router;
