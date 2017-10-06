const mongoose = require('mongoose');

const { Schema } = mongoose;

const RootCauseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  pattern: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
});

module.exports = RootCauseSchema;
