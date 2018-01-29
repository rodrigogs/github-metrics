const mongoose = require('mongoose');

const OrganizationSchema = require('./schemas/organization.v1.schema');

const Organization = mongoose.model('Organization', OrganizationSchema);

/**
 * @class Organization
 */
module.exports = Organization;
