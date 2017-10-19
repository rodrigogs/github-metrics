const debug = require('debug')('github-metrics:routes:v1:column');
const express = require('express');

debug('configuring routes');

const router = express.Router();

const ColumnController = require('../../controllers/v1/column');

router.route('/')
  .get(ColumnController.find);

module.exports = router;
