const mongoose = require('mongoose');

const { Schema } = mongoose;

const DateHelper = require('../../../helpers/date');
const UserSchema = require('./user');

const CardSchema = new Schema({
  url: String,
  column_url: String,
  content_url: String,
  id: Number,
  note: String,
  creator: UserSchema,
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
