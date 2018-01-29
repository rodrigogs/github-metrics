// const debug = require('debug')('github-metrics:services:v1:delivery');
const Delivery = require('../../models/v1/delivery.v1.model');

/**
 * @class DeliveryService
 * @extends Delivery
 */
class DeliveryService extends Delivery {
  /**
   * @param {Object} [obj = {}]
   * @return {Delivery}
   */
  static new(obj = {}) {
    return new Delivery(obj);
  }
}

module.exports = DeliveryService;
