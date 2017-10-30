const mongoose = require('mongoose');

const LabelSchema = require('./schemas/label');

const Label = mongoose.model('Label', LabelSchema);

module.exports = Label;
