const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = require('./user');
const RepositorySchema = require('./repository');
const ProjectSchema = require('./project');
const OrganizationSchema = require('./organization');

const ProjectEventSchema = new Schema({
  action: {
    type: String,
    enum: ['created', 'edited', 'closed', 'reopened', 'deleted'],
    required: true,
  },
  received_at: {
    type: Date,
    default: new Date(),
    required: true,
  },
  project: ProjectSchema,
  repository: RepositorySchema,
  organization: OrganizationSchema,
  sender: UserSchema,
});

module.exports = ProjectEventSchema;
