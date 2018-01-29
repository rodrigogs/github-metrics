const mongoose = require('mongoose');

const { Schema } = mongoose;

const CardSchema = require('./card.v1.schema');
const RepositorySchema = require('./repository.v1.schema');
const UserSchema = require('./user.v1.schema');
const OrganizationSchema = require('./organization.v1.schema');

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
}, {
  timestamps: {
    createdAt: 'received_at',
    updatedAt: 'updated_at',
  },
});

module.exports = CardEventSchema;
