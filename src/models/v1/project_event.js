const mongoose = require('mongoose');

const ProjectEventSchema = require('./schemas/project_event');

const ProjectEvent = mongoose.model('ProjectEvent', ProjectEventSchema);

module.exports = ProjectEvent;
