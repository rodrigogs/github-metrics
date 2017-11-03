const { composeWithMongoose } = require('graphql-compose-mongoose');
const { GQC } = require('graphql-compose');

const SummarySchema = require('../summary');

const customizationOptions = {};
const Summary = composeWithMongoose(SummarySchema, customizationOptions);

GQC.rootQuery().addFields({
  findById: Summary.getResolver('findById'),
  findByIds: Summary.getResolver('findByIds'),
  findOne: Summary.getResolver('findOne'),
  findMany: Summary.getResolver('findMany'),
  count: Summary.getResolver('count'),
  connection: Summary.getResolver('connection'),
  pagination: Summary.getResolver('pagination'),
});

GQC.rootMutation().addFields({
  createOne: Summary.getResolver('createOne'),
  updateById: Summary.getResolver('updateById'),
  updateOne: Summary.getResolver('updateOne'),
  updateMany: Summary.getResolver('updateMany'),
  removeById: Summary.getResolver('removeById'),
  removeOne: Summary.getResolver('removeOne'),
  removeMany: Summary.getResolver('removeMany'),
});

module.exports = GQC.buildSchema();
