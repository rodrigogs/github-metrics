const mongoose = require('mongoose');

const { Schema } = mongoose;

const DeliverySchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports = DeliverySchema;
