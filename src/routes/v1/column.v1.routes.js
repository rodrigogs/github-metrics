const debug = require('debug')('github-metrics:routes:v1:column');
const express = require('express');

debug('configuring routes');

const router = express.Router();

const ColumnController = require('../../controllers/v1/column.v1.controller');

router.route('/')
  .get(ColumnController.find);

router.route('/:id')
  .put(ColumnController.update);

module.exports = router;
