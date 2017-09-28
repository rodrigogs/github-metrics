const mongoose = require('mongoose');

const { Schema } = mongoose;

const RepositorySchema = require('./repository');
const UserSchema = require('./user');
const ColumnSchema = require('./column');
const OrganizationSchema = require('./organization');

const ColumnEventSchema = new Schema({
  action: {
    type: String,
    enum: ['created', 'edited', 'moved', 'deleted'],
    required: true,
  },
  received_at: {
    type: Date,
    default: new Date(),
    required: true,
  },
  project_column: ColumnSchema,
  repository: RepositorySchema,
  organization: OrganizationSchema,
  sender: UserSchema,
});

module.exports = ColumnEventSchema;
