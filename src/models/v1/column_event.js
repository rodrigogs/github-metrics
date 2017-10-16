const mongoose = require('mongoose');

const ColumnEventSchema = require('./schemas/column_event');

const ColumnEvent = mongoose.model('ColumnEvent', ColumnEventSchema);

module.exports = ColumnEvent;
