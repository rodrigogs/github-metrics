const mongoose = require('mongoose');

const ColumnEventSchema = require('./schemas/card_event');

const ColumnEvent = mongoose.model('ColumnEvent', ColumnEventSchema);

module.exports = ColumnEvent;
