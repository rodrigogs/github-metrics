const mongoose = require('mongoose');

const IssueEventSchema = require('./schemas/issue_event.v1.schema');

const IssueEvent = mongoose.model('IssueEvent', IssueEventSchema);

/**
 * @class IssueEvent
 */
module.exports = IssueEvent;
