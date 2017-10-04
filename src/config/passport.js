const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

const Env = require('./env');
const AuthService = require('../services/auth');

passport.use(new GitHubStrategy({
  clientID: Env.GITHUB_CLIENT_ID,
  clientSecret: Env.GITHUB_CLIENT_SECRET,
  callbackURL: '/auth/github/callback',
  scope: ['user:email', 'read:org', 'repo'],
}, async (accessToken, refreshToken, profile, cb) => {
  try {
    await AuthService.persistToken(accessToken, profile, 'github');
    cb();
  } catch (err) {
    cb(err);
  }
}));
