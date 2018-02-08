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
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'created_at',
  },
});

module.exports = RootCauseSchema;
