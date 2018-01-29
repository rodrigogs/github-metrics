const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = require('./user.v1.schema');
const RepositorySchema = require('./repository.v1.schema');
const ProjectSchema = require('./project.v1.schema');
const OrganizationSchema = require('./organization.v1.schema');

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
