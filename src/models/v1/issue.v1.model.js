const mongoose = require('mongoose');

const IssueSchema = require('./schemas/issue.v1.schema');

const Issue = mongoose.model('Issue', IssueSchema);

/**
 * @class Issue
 */
module.exports = Issue;
