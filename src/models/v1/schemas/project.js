const mongoose = require('mongoose');

const { Schema } = mongoose;

const DateHelper = require('../../../helpers/date');
const UserSchema = require('./user');

const ProjectSchema = new Schema({
  owner_url: String,
  url: String,
  html_url: String,
  columns_url: String,
  id: Number,
  name: String,
  body: String,
  number: Number,
  state: String,
  creator: UserSchema,
  deleted: Boolean,
  ignore_labels: [Number],
  created_at: {
    type: Date,
    set: DateHelper.resolveGithubDate,
  },
  updated_at: {
    type: Date,
    set: DateHelper.resolveGithubDate,
  },
});

module.exports = ProjectSchema;
