const mongoose = require('mongoose');

const { Schema } = mongoose;

const AccessTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    enum: ['github'],
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports = AccessTokenSchema;
