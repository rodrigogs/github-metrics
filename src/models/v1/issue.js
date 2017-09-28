const mongoose = require('mongoose');

const IssueSchema = require('./schemas/issue');

const Issue = mongoose.model('Issue', IssueSchema);

module.exports = Issue;
