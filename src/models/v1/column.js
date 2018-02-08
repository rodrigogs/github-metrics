const mongoose = require('mongoose');

const ColumnSchema = require('./schemas/column');

const Column = mongoose.model('Column', ColumnSchema);

module.exports = Column;
