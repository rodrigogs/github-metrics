const mongoose = require('mongoose');

const LabelSchema = require('./label');

const Label = mongoose.model('Label', LabelSchema);

module.exports = Label;
