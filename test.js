const mongoose = require('mongoose');

require('./src/config/mongoose').then(async () => {
  const PrymarySchema = new mongoose.Schema({
    name: String,
    list: [Number],
  });

  const PrimaryModel = mongoose.model('Prymary', PrymarySchema);

  const SecondarySchema = new mongoose.Schema({
    name: String,
    list: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prymary',
    }],
  });

  const SecondaryModel = mongoose.model('Secondary', SecondarySchema);

  // Inserts
  const test1 = await PrimaryModel({ name: 'Test1', list: [1, 2, 3] }).save();
  const test2 = await PrimaryModel({ name: 'Test2', list: [4, 5, 6] }).save();
  const test3 = await PrimaryModel({ name: 'Test3', list: [7, 8, 9] }).save();

  const relation1 = await SecondaryModel({ name: 'Relation1', list: [test1] }).save();
  const relation2 = await SecondaryModel({ name: 'Relation2', list: [test1, test2] }).save();
  const relation3 = await SecondaryModel({ name: 'Relation3', list: [test1, test2, test3] }).save();

  const query = await SecondaryModel.aggregate([
    { $unwind: '$list' },
    {
      $lookup: {
        from: 'primaries',
        localField: 'list.id',
        foreignField: '_id',
        as: 'primaryList',
      },
    },
    // { $unwind: '$primaryList' },
    // {
    //   $project: {
    //     _id: 1,
    //     list: [{
    //       name: '$primaryList.name',
    //     }],
    //   },
    // },
  ]).exec();

  console.log(query);

}).then(() => console.log('Done.')).catch(console.error);
