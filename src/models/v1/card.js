const mongoose = require('mongoose');

const CardSchema = require('./schemas/card');

const Card = mongoose.model('Card', CardSchema);

module.exports = Card;
