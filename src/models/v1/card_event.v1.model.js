const mongoose = require('mongoose');

const CardEventSchema = require('./schemas/card_event.v1.schema');

const CardEvent = mongoose.model('CardEvent', CardEventSchema);

/**
 * @class CardEvent
 */
module.exports = CardEvent;
