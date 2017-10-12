const debug = require('debug')('github-metrics:routes:project');
const express = require('express');

debug('configuring routes');

const router = express.Router();

const ProjectController = require('../../controllers/v1/project');

router.route('/')
  .get(ProjectController.find);

module.exports = router;
