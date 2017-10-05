const debug = require('debug')('github-metrics:routes:sheet');
const express = require('express');

debug('configuring routes');

const router = express.Router();

const SheetController = require('../controllers/sheet');

router.route('/')
  .get(SheetController.config)
  .post(SheetController.load);

module.exports = router;
