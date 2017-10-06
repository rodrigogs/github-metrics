const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

const Env = require('./env');
const RedisProvider = require('../providers/redis');
const AuthService = require('../services/auth');
const User = require('../models/user');

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    let user = await RedisProvider.safeGet(`user-id-${id}`);
    if (user) user = JSON.parse(user);
    if (!user) user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use('github-token', new GitHubStrategy({
  clientID: Env.GITHUB_CLIENT_ID,
  clientSecret: Env.GITHUB_CLIENT_SECRET,
  callbackURL: `${Env.APP_URL}/auth/githubtoken/callback`,
  scope: ['user:email', 'read:org', 'repo'],
}, async (accessToken, refreshToken, profile, cb) => {
  try {
    await AuthService.persistToken(accessToken, profile, 'github');
    cb();
  } catch (err) {
    cb(err);
  }
}));

passport.use(new GitHubStrategy({
  clientID: Env.GITHUB_USERS_CLIENT_ID,
  clientSecret: Env.GITHUB_USERS_CLIENT_SECRET,
  callbackURL: `${Env.APP_URL}/auth/github/callback`,
  scope: ['user:email', 'read:org', 'repo'],
}, async (accessToken, refreshToken, profile, cb) => {
  try {
    const email = profile.emails.find(email => email.primary).value;
    const request = await AuthService.buildGitHubRequest({ token: accessToken });
    const orgs = await request.get('https://api.github.com/user/orgs');
    if (orgs.data) {
      const org = orgs.data.find(o => o.login === Env.GITHUB_COMPANY_NAME);
      if (!org) return cb(new Error('User must be in the allowed company'));
    }

    let user = await User.findOne({ email }).exec();
    if (!user) {
      user = new User({
        provider: 'github',
        name: profile.displayName.split(' ')[0],
        last_name: profile.displayName.split(' ').slice(1).join(' '),
        email,
      });
    }

    await user.save();
    RedisProvider.set(`user-id-${user._id}`, JSON.stringify(user));
    cb(null, user);
  } catch (err) {
    cb(err);
  }
}));
