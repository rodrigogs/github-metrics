const mongoose = require('mongoose');

const MilestoneSchema = require('./schemas/milestone.v1.schema');

const Milestone = mongoose.model('Milestone', MilestoneSchema);

/**
 * @class Milestone
 */
module.exports = Milestone;
