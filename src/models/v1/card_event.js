const mongoose = require('mongoose');

const CardEventSchema = require('./schemas/card_event');

const CardEvent = mongoose.model('CardEvent', CardEventSchema);

module.exports = CardEvent;
