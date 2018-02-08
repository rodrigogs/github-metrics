const mongoose = require('mongoose');

const ColumnSchema = require('./schemas/column.v1.schema');

const Column = mongoose.model('Column', ColumnSchema);

/**
 * @class Column
 */
module.exports = Column;
