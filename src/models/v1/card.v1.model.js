const mongoose = require('mongoose');

const CardSchema = require('./schemas/card.v1.schema');

const Card = mongoose.model('Card', CardSchema);

/**
 * @class Card
 */
module.exports = Card;
