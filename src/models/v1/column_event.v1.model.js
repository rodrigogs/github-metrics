const mongoose = require('mongoose');

const ColumnEventSchema = require('./schemas/column_event.v1.schema');

const ColumnEvent = mongoose.model('ColumnEvent', ColumnEventSchema);

/**
 * @class ColumnEvent
 */
module.exports = ColumnEvent;
