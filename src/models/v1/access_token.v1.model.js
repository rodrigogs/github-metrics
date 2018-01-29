const mongoose = require('mongoose');

const AccessTokenSchema = require('./schemas/access_token.v1.schema');

const AccessToken = mongoose.model('AccessToken', AccessTokenSchema);

/**
 * @class AccessToken
 */
module.exports = AccessToken;
