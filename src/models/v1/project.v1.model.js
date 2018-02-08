const mongoose = require('mongoose');

const ProjectSchema = require('./schemas/project.v1.schema');

const Project = mongoose.model('Project', ProjectSchema);

/**
 * @class Project
 */
module.exports = Project;
