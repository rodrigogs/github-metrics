const mongoose = require('mongoose');

const IssueEventSchema = require('./schemas/issue_event');

const IssueEvent = mongoose.model('IssueEvent', IssueEventSchema);

module.exports = IssueEvent;
