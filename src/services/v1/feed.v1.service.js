const debug = require('debug')('github-metrics:services:v1:feed');

const ProjectService = require('./project.v1.service');
const CardService = require('./card.v1.service');
const ColumnService = require('./column.v1.service');
const IssueService = require('./issue.v1.service');
const DeliveryService = require('./delivery.v1.service');
const RedisProvider = require('../../providers/redis.provider');
const logger = require('../../config/logger');

/**
 * @class FeedService
 */
class FeedService {
  /**
   * @param provider
   * @param delivery
   * @param type
   * @param payload
   * @return {Promise.<void>}
   */
  static async schedule(provider, delivery, type, payload) {
    RedisProvider.set(`schedule-${delivery}`, JSON.stringify({
      provider, delivery, type, payload,
    }));

    payload.delivery = delivery;

    try {
      const event = await FeedService[provider](type, payload);
      RedisProvider.del(`schedule-${delivery}`);

      if (event) return logger.info('event saved', delivery);
      logger.info('event ignored', delivery);
    } catch (err) {
      setTimeout(async () => {
        logger.info('retrying to save payload', type);

        let conf = await RedisProvider.safeGet(`schedule-${delivery}`);
        conf = JSON.parse(conf);
        RedisProvider.del(`schedule-${delivery}`);

        await FeedService.schedule(conf.provider, conf.delivery, conf.type, conf.payload);
        logger.info('event saved with delay', delivery);
      }, 60 * 1000);

      logger.error('An error has occurred while trying to save an', type, err);
      throw new Error(`Failed to save payload information for delivery '${delivery}' due to error '${err.message}'. The scheduler will try again later.`, err);
    }
  }

  /**
   * @param {String} type
   * @param {Object} payload
   * @return {Promise}
   */
  static async github(type, payload) {
    debug('saving data for event', type);

    const oldDelivery = await DeliveryService.findOne({ code: payload.delivery }).exec();
    if (oldDelivery) {
      debug('event already received', payload.delivery);
      return;
    }

    const saveEventFunction = {
      project: ProjectService.saveEvent,
      project_card: CardService.saveEvent,
      project_column: ColumnService.saveEvent,
      issues: IssueService.saveEvent,
    }[type];

    if (!saveEventFunction) return;

    await saveEventFunction(payload);

    return DeliveryService.create({ code: payload.delivery });
  }
}

module.exports = FeedService;
