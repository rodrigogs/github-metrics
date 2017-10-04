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
  created_at: {
    type: Date,
    default: new Date(),
  },
  updated_at: {
    type: Date,
    default: new Date(),
  },
});

// eslint-disable-next-line
AccessTokenSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

module.exports = AccessTokenSchema;
