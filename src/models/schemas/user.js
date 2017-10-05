const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  provider: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
});

module.exports = UserSchema;
