const mongoose = require('mongoose');

const { Schema } = mongoose;

const ProjectSchema = require('./project.v1.schema');
const IssueSchema = require('./issue.v1.schema');
const CardSchema = require('./card.v1.schema');
const ColumnSchema = require('./column.v1.schema');
const IssueEventSchema = require('./issue_event.v1.schema');
const CardEventSchema = require('./card_event.v1.schema');

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
    card_event: CardEventSchema,
    from_column: ColumnSchema,
    to_column: ColumnSchema,
    when: Date,
  }],
}, {
  timestamps: {
    createdAt: 'generated_at',
    updatedAt: 'updated_at',
  },
});

module.exports = SummarySchema;
