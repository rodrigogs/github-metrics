const mongoose = require('mongoose');

const OrganizationSchema = require('./schemas/organization');

const Organization = mongoose.model('Organization', OrganizationSchema);

module.exports = Organization;
