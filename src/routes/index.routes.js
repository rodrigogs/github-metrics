const debug = require('debug')('github-metrics:routes:index');
const session = require('express-session');
const flash = require('flash');
const passport = require('passport');
const express = require('express');
const RedisStore = require('connect-redis')(session);

const Env = require('../config/env');
const redisClient = require('../providers/redis.provider');

debug('configuring routes');

const GeneralMiddleware = require('../middlewares/general.middleware');
const AuthMiddleware = require('../middlewares/auth.middleware');
const ErrorsMiddleware = require('../middlewares/errors.middleware');
const HealthyCheckController = require('../controllers/healthcheck.controller');
const DashboardController = require('../controllers/dashboard.controller');

const auth = require('./auth.routes');
const v1 = require('./v1/index.v1.routes');

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
appRouter.get('/logs', HealthyCheckController.logs);
appRouter.get('/logs/:logFile', HealthyCheckController.log);

// Auth
appRouter.use('/auth', auth);

// Dashboard
appRouter.get('/', AuthMiddleware.ensureFullyAuthenticated, DashboardController.index);

// API versions
apiRouter.use('/v1', AuthMiddleware.ensureAppAuthenticated, v1);

// catch 404 and forward to error handler
router.use(ErrorsMiddleware.notFound);

// generic error handler
router.use(ErrorsMiddleware.generic);

module.exports = router;
