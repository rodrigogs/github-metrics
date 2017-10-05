const debug = require('debug')('github-metrics:routes:process');
const express = require('express');

debug('configuring routes');

const router = express.Router();

const ProcessController = require('../controllers/process');

router.route('/')
  .get(ProcessController.index)
  .post(ProcessController.execute);

module.exports = router;
