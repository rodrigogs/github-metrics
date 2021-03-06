const debug = require('debug')('github-metrics:routes:v1:project');
const express = require('express');

debug('configuring routes');

const router = express.Router();

const ProjectController = require('../../controllers/v1/project.v1.controller');

router.route('/')
  .get(ProjectController.find);

router.route('/:id')
  .get(ProjectController.findById)
  .put(ProjectController.update);

module.exports = router;
