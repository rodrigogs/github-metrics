const mongoose = require('mongoose');

const RepositorySchema = require('./schemas/repository');

const Repository = mongoose.model('Repository', RepositorySchema);

module.exports = Repository;
