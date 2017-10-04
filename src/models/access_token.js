const mongoose = require('mongoose');

const AccessTokenSchema = require('./schemas/access_token');

const AccessToken = mongoose.model('AccessToken', AccessTokenSchema);

module.exports = AccessToken;
