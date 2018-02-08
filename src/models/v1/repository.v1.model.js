const mongoose = require('mongoose');

const RepositorySchema = require('./schemas/repository.v1.schema');

const Repository = mongoose.model('Repository', RepositorySchema);

/**
 * @class Repository
 */
module.exports = Repository;
