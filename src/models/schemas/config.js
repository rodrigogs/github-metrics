const mongoose = require('mongoose');

const { Schema } = mongoose;

const ConfigSchema = new Schema({
  key: {
    type: String,
    required: true,
  },
  value: Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'created_at',
  },
});

module.exports = ConfigSchema;
