const mongoose = require('mongoose');

const { Schema } = mongoose;

const IssueSchema = require('./issue');
const RepositorySchema = require('./repository');
const UserSchema = require('./user');

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
    updatedAt: 'created_at',
  },
});

module.exports = IssueEventSchema;
