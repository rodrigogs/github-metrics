const mongoose = require('mongoose');

const SummarySchema = require('./schemas/summary');

const Summary = mongoose.model('Summary', SummarySchema);

module.exports = Summary;
