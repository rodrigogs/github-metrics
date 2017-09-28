const mongoose = require('mongoose');

const ProjectSchema = require('./schemas/project');

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
