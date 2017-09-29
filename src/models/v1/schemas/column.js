const mongoose = require('mongoose');

const { Schema } = mongoose;

const DateHelper = require('../../../helpers/date');
const ProjectSchema = require('./project');

const ColumnSchema = new Schema({
  id: Number,
  name: String,
  url: String,
  project_url: String,
  cards_url: String,
  project: ProjectSchema,
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

module.exports = ColumnSchema;