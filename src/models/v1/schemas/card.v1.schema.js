const mongoose = require('mongoose');

const { Schema } = mongoose;

const DateHelper = require('../../../helpers/date.helper');
const UserSchema = require('./user.v1.schema');

const CardSchema = new Schema({
  url: String,
  after_id: Number,
  column_id: Number,
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
