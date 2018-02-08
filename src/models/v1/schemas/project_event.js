const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = require('./user');
const RepositorySchema = require('./repository');
const ProjectSchema = require('./project');
const OrganizationSchema = require('./organization');

const ProjectEventSchema = new Schema({
  delivery: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ['created', 'edited', 'closed', 'reopened', 'deleted'],
    required: true,
  },
  project: ProjectSchema,
  repository: RepositorySchema,
  organization: OrganizationSchema,
  sender: UserSchema,
}, {
  timestamps: {
    createdAt: 'received_at',
    updatedAt: 'updated_at',
  },
});

module.exports = ProjectEventSchema;
