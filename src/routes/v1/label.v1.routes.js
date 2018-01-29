const debug = require('debug')('github-metrics:routes:v1:label');
const express = require('express');

debug('configuring routes');

const router = express.Router();

const LabelController = require('../../controllers/v1/label.v1.controller');

router.route('/')
  .get(LabelController.find);

module.exports = router;
