const mongoose = require('mongoose');

const { Schema } = mongoose;

const RepositorySchema = require('./repository');
const UserSchema = require('./user');
const ColumnSchema = require('./column');
const OrganizationSchema = require('./organization');

const ColumnEventSchema = new Schema({
  delivery: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ['created', 'edited', 'moved', 'deleted'],
    required: true,
  },
  changes: {
    name: String,
  },
  project_column: ColumnSchema,
  repository: RepositorySchema,
  organization: OrganizationSchema,
  sender: UserSchema,
}, {
  timestamps: {
    createdAt: 'received_at',
    updatedAt: 'created_at',
  },
});

module.exports = ColumnEventSchema;
