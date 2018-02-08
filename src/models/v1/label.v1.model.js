const mongoose = require('mongoose');

const LabelSchema = require('./schemas/label.v1.schema');

const Label = mongoose.model('Label', LabelSchema);

/**
 * @class Label
 */
module.exports = Label;
