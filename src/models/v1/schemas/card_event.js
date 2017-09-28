const mongoose = require('mongoose');

const { Schema } = mongoose;

const CardSchema = require('./card');
const RepositorySchema = require('./repository');
const UserSchema = require('./user');
const OrganizationSchema = require('./organization');

const CardEventSchema = new Schema({
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
  project_card: CardSchema,
  repository: RepositorySchema,
  organization: OrganizationSchema,
  sender: UserSchema,
});

module.exports = CardEventSchema;
