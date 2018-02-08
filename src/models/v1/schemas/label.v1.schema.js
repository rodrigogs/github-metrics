const mongoose = require('mongoose');

const { Schema } = mongoose;

const LabelSchema = new Schema({
  id: Number,
  url: String,
  name: String,
  color: String,
  default: Boolean,
});

module.exports = LabelSchema;
