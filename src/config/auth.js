const Env = require('./env');

module.exports = (app) => {
  app.decorate('gitHubStrategy', (request, reply, done) => {
    passport.authenticate('github', { session: false }, (req, res) => {

    })({}, {}, done);
  });
};
