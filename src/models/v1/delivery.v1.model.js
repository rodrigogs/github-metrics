const mongoose = require('mongoose');

const DeliverySchema = require('./schemas/delivery.v1.schema');

const Delivery = mongoose.model('Delivery', DeliverySchema);

/**
 * @class Delivery
 */
module.exports = Delivery;
