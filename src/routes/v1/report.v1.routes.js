const debug = require('debug')('github-metrics:routes:v1:report');
const express = require('express');
// const graphqlHTTP = require('express-graphql');

debug('configuring routes');

const router = express.Router();

const ReportController = require('../../controllers/v1/report.v1.controller');

router.route('/summary')
  .get(ReportController.summaries);

// router.use('/graphql', graphqlHTTP({
//   schema: require('../../models/v1/graphql/summary.graphql'),
//   rootValue: true,
//   graphiql: true,
// }));

module.exports = router;
