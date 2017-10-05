const debug = require('debug')('github-metrics:routes:index');
const session = require('express-session');
const flash = require('flash');

debug('configuring routes');

const express = require('express');

debug('configuring routes');

const GeneralMiddleware = require('../middlewares/general');
const AuthMiddleware = require('../middlewares/auth');
const ErrorsMiddleware = require('../middlewares/errors');
const HealthyCheckController = require('../controllers/healthcheck');

const auth = require('./auth');
const sheet = require('./sheet');
const process = require('./process');
const v1 = require('./v1');

const router = express.Router();
const appRouter = express.Router();
const apiRouter = express.Router();

router.use(GeneralMiddleware());

router.use('/', appRouter);
router.use('/api', apiRouter);

// Session for the app only
appRouter.use(session({ secret: 'my-secret', resave: false, saveUninitialized: true }));
appRouter.use(flash());

// Healthy check
appRouter.get('/healthcheck', HealthyCheckController.index);

// Auth
appRouter.use('/auth', auth);

// Dashboard
appRouter.get('/', AuthMiddleware.ensureAuthenticated, (req, res) => res.render('index')); // TODO dashboard controller

// Sheet
appRouter.use('/sheet', AuthMiddleware.ensureAuthenticated, sheet);

// Process
appRouter.use('/process', AuthMiddleware.ensureAuthenticated, process);

// API versions
apiRouter.use('/v1', AuthMiddleware.ensureAuthenticated, v1);

// catch 404 and forward to error handler
router.use(ErrorsMiddleware.notFound);

// generic error handler
router.use(ErrorsMiddleware.generic);

module.exports = router;
