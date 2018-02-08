const mongoose = require('mongoose');

const UserSchema = require('./schemas/profile.v1.schema');

const Profile = mongoose.model('User', UserSchema);

/**
 * @class Profile
 */
module.exports = Profile;
