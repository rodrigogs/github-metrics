const mongoose = require('mongoose');

const { Schema } = mongoose;

const ProjectSchema = require('./project');
const IssueSchema = require('./issue');
const CardSchema = require('./card');
const ColumnSchema = require('./column');
const IssueEventSchema = require('./issue_event');
const CardEventSchema = require('./card_event');

const SummarySchema = new Schema({
  project: ProjectSchema,
  card: CardSchema,
  issue: IssueSchema,
  root_causes: [{
    causes: [String],
    when: Date,
  }],
  custom_statuses: [{
    statuses: [String],
    when: Date,
  }],
  changes: [{
    origin: {
      type: String,
      enum: ['card', 'issue'],
      required: true,
    },
    event: String,
    issue_event: IssueEventSchema,
    card_event: CardEventSchema,
    issue_before: IssueSchema,
    issue_after: IssueSchema,
    card_before: CardSchema,
    card_after: CardSchema,
    when: Date,
  }],
  board_moves: [{
    from_column: ColumnSchema,
    to_column: ColumnSchema,
    when: Date,
  }],
  generated_at: {
    type: Date,
    default: new Date(),
  },
});

module.exports = SummarySchema;
