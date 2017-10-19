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
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    required: false,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'created_at',
  },
});

module.exports = UserSchema;
