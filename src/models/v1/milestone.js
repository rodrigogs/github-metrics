const mongoose = require('mongoose');

const MilestoneSchema = require('./schemas/milestone');

const Milestone = mongoose.model('Milestone', MilestoneSchema);

module.exports = Milestone;
