const mongoose = require('mongoose');

const { Schema } = mongoose;

const IssueSchema = require('./issue.v1.schema');
const RepositorySchema = require('./repository.v1.schema');
const UserSchema = require('./user.v1.schema');

const IssueEventSchema = new Schema({
  delivery: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ['assigned', 'unassigned', 'labeled', 'unlabeled',
      'opened', 'edited', 'milestoned', 'demilestoned', 'closed', 'reopened'],
    required: true,
  },
  issue: IssueSchema,
  repository: RepositorySchema,
  sender: UserSchema,
}, {
  timestamps: {
    createdAt: 'received_at',
    updatedAt: 'updated_at',
  },
});

module.exports = IssueEventSchema;
