const debug = require('debug')('github-metrics:routes:index');

debug('configuring routes');

const express = require('express');

debug('configuring routes');

const AuthMiddleware = require('../middlewares/auth');
const ErrorsMiddleware = require('../middlewares/errors');
const HealthyCheckController = require('../controllers/healthcheck');

const auth = require('./auth');
const v1 = require('./v1');

const router = express.Router();

// Healthy check
router.get('/', HealthyCheckController.index);

// Auth
router.use('/auth', auth);

// API versions
router.use('/v1', AuthMiddleware.ensureAuthenticated, v1);

// catch 404 and forward to error handler
router.use(ErrorsMiddleware.notFound);

// generic error handler
router.use(ErrorsMiddleware.generic);

module.exports = router;
