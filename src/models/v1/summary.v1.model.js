const mongoose = require('mongoose');

const SummarySchema = require('./schemas/summary.v1.schema');

const Summary = mongoose.model('Summary', SummarySchema);

/**
 * @class Summary
 */
module.exports = Summary;
