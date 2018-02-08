const mongoose = require('mongoose');

const UserSchema = require('./schemas/user.v1.schema');

const User = mongoose.model('User', UserSchema);

/**
 * @class User
 */
module.exports = User;
