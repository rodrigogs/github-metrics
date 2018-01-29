const mongoose = require('mongoose');

const { Schema } = mongoose;

const DateHelper = require('../../../helpers/date.helper');
const UserSchema = require('./user.v1.schema');

const MilestoneSchema = new Schema({
  url: String,
  html_url: String,
  labels_url: String,
  id: Number,
  number: Number,
  state: String,
  title: String,
  description: String,
  creator: UserSchema,
  open_issues: Number,
  closed_issues: Number,
  created_at: {
    type: Date,
    set: DateHelper.resolveGithubDate,
  },
  updated_at: {
    type: Date,
    set: DateHelper.resolveGithubDate,
  },
  closed_at: {
    type: Date,
    set: DateHelper.resolveGithubDate,
  },
  due_on: {
    type: Date,
    set: DateHelper.resolveGithubDate,
  },
});

module.exports = MilestoneSchema;
