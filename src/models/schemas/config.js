const mongoose = require('mongoose');

const { Schema } = mongoose;

const ConfigSchema = new Schema({
  key: {
    type: String,
    required: true,
  },
  value: Schema.Types.Mixed,
  created_at: {
    type: Date,
    default: new Date(),
  },
  updated_at: {
    type: Date,
    default: new Date(),
  },
});

ConfigSchema.pre('save', function preSave(next) {
  this.updated_at = new Date();
  next();
});

module.exports = ConfigSchema;
