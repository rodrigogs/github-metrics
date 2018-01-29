const mongoose = require('mongoose');

const RootCauseSchema = require('./schemas/root_cause.v1.schema');

const RootCause = mongoose.model('RootCause', RootCauseSchema);

/**
 * @class RootCause
 */
module.exports = RootCause;
