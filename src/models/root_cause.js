const mongoose = require('mongoose');

const RootCauseSchema = require('./schemas/root_cause');

const RootCause = mongoose.model('RootCause', RootCauseSchema);

module.exports = RootCause;
