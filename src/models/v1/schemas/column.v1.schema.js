const mongoose = require('mongoose');

const { Schema } = mongoose;

const DateHelper = require('../../../helpers/date.helper');

const ColumnSchema = new Schema({
  id: Number,
  name: String,
  url: String,
  after_id: Number,
  project_url: String,
  cards_url: String,
  deleted: Boolean,
  color: String,
  order: Number,
  visible: Boolean,
  created_at: {
    type: Date,
    set: DateHelper.resolveGithubDate,
  },
  updated_at: {
    type: Date,
    set: DateHelper.resolveGithubDate,
  },
});

module.exports = ColumnSchema;
