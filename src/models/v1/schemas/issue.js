const mongoose = require('mongoose');

const { Schema } = mongoose;

const DateHelper = require('../../../helpers/date');

const RepositorySchema = require('./repository');
const UserSchema = require('./user');
const LabelSchema = require('./label');
const MilestoneSchema = require('./milestone');

const IssueSchema = new Schema({
  id: Number,
  url: String,
  repository_url: String,
  labels_url: String,
  comments_url: String,
  events_url: String,
  html_url: String,
  number: Number,
  state: String,
  title: String,
  body: String,
  user: UserSchema,
  labels: [LabelSchema],
  assignee: UserSchema,
  milestone: MilestoneSchema,
  locked: Boolean,
  comments: Number,
  pull_request: new Schema({
    url: String,
    html_url: String,
    diff_url: String,
    patch_url: String,
  }),
  closed_at: {
    type: Date,
    set: DateHelper.resolveGithubDate,
  },
  created_at: {
    type: Date,
    set: DateHelper.resolveGithubDate,
  },
  updated_at: {
    type: Date,
    set: DateHelper.resolveGithubDate,
  },
  repository: RepositorySchema,
});

module.exports = IssueSchema;
