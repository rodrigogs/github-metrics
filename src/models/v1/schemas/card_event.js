const mongoose = require('mongoose');

const { Schema } = mongoose;

const CardSchema = require('./card');
const RepositorySchema = require('./repository');
const UserSchema = require('./user');
const OrganizationSchema = require('./organization');

const CardEventSchema = new Schema({
  delivery: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ['created', 'edited', 'converted', 'moved', 'deleted'],
    required: true,
  },
  received_at: {
    type: Date,
    default: new Date(),
    required: true,
  },
  changes: {
    note: {
      from: String,
    },
    column_id: {
      from: Number,
    },
  },
  project_card: CardSchema,
  repository: RepositorySchema,
  organization: OrganizationSchema,
  sender: UserSchema,
});

module.exports = CardEventSchema;
