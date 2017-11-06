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
  deliveries: [String],
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
    issue_snapshot: IssueSchema,
    card_snapshot: CardSchema,
    when: Date,
  }],
  board_moves: [{
    from_column: ColumnSchema,
    to_column: ColumnSchema,
    when: Date,
  }],
}, {
  timestamps: {
    createdAt: 'generated_at',
  },
});

module.exports = SummarySchema;
