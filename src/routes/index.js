const debug = require('debug')('github-metrics:routes:index');
const session = require('express-session');
const flash = require('flash');
const passport = require('passport');
const express = require('express');
const RedisStore = require('connect-redis')(session);

const Env = require('../config/env');
const redisClient = require('../providers/redis');

debug('configuring routes');

const GeneralMiddleware = require('../middlewares/general');
const AuthMiddleware = require('../middlewares/auth');
const ErrorsMiddleware = require('../middlewares/errors');
const HealthyCheckController = require('../controllers/healthcheck');
const DashboardController = require('../controllers/dashboard');

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
appRouter.use(session({
  secret: Env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: new RedisStore({ client: redisClient }),
}));
appRouter.use(flash());
appRouter.use(passport.initialize());
appRouter.use(passport.session());

// Healthy check
appRouter.get('/healthcheck', HealthyCheckController.index);

// Auth
appRouter.use('/auth', auth);

// Dashboard
appRouter.get('/', AuthMiddleware.ensureFullyAuthenticated, DashboardController.index);

// Sheet
appRouter.use('/sheet', AuthMiddleware.ensureFullyAuthenticated, sheet);

// Process
appRouter.use('/process', AuthMiddleware.ensureFullyAuthenticated, process);

// API versions
apiRouter.use('/v1', AuthMiddleware.ensureAppAuthenticated, v1);

// catch 404 and forward to error handler
router.use(ErrorsMiddleware.notFound);

// generic error handler
router.use(ErrorsMiddleware.generic);

module.exports = router;
