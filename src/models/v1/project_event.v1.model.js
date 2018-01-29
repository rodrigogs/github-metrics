const mongoose = require('mongoose');

const ProjectEventSchema = require('./schemas/project_event.v1.schema');

const ProjectEvent = mongoose.model('ProjectEvent', ProjectEventSchema);

/**
 * @class ProjectEvent
 */
module.exports = ProjectEvent;
