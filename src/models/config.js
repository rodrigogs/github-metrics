const mongoose = require('mongoose');

const ConfigSchema = require('./schemas/config');

const Config = mongoose.model('Config', ConfigSchema);

module.exports = Config;
module.exports.KEYS = {
  LAST_SUMMARY: 'last_summary',
};
