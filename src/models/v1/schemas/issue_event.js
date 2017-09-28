const mongoose = require('mongoose');

const { Schema } = mongoose;

const IssueSchema = require('./issue');
const RepositorySchema = require('./repository');
const UserSchema = require('./user');

const IssueEventSchema = new Schema({
  action: {
    type: String,
    enum: ['assigned', 'unassigned', 'labeled', 'unlabeled',
      'opened', 'edited', 'milestoned', 'demilestoned', 'closed', 'reopened'],
    required: true,
  },
  received_at: {
    type: Date,
    default: new Date(),
    required: true,
  },
  issue: IssueSchema,
  repository: RepositorySchema,
  sender: UserSchema,
});

module.exports = IssueEventSchema;
