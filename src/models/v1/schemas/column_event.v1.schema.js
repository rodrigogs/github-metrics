const mongoose = require('mongoose');

const { Schema } = mongoose;

const RepositorySchema = require('./repository.v1.schema');
const UserSchema = require('./user.v1.schema');
const ColumnSchema = require('./column.v1.schema');
const OrganizationSchema = require('./organization.v1.schema');

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
    name: {
      from: String,
    },
  },
  project_column: ColumnSchema,
  repository: RepositorySchema,
  organization: OrganizationSchema,
  sender: UserSchema,
}, {
  timestamps: {
    createdAt: 'received_at',
    updatedAt: 'updated_at',
  },
});

module.exports = ColumnEventSchema;
