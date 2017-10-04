const mongoose = require('mongoose');

const { Schema } = mongoose;

const DateHelper = require('../../../helpers/date');
const UserSchema = require('./user');
const IssueSchema = require('./issue');
const ColumnSchema = require('./column');

const CardSchema = new Schema({
  url: String,
  after_id: Number,
  column_id: Number,
  column_url: String,
  content_url: String,
  id: Number,
  note: String,
  creator: UserSchema,
  issue: IssueSchema,
  column: ColumnSchema,
  deleted: Boolean,
  created_at: {
    type: Date,
    set: DateHelper.resolveGithubDate,
  },
  updated_at: {
    type: Date,
    set: DateHelper.resolveGithubDate,
  },
});

module.exports = CardSchema;
