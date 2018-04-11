const debug = require('debug')('github-metrics:services:v1:card');

const Card = require('../../models/v1/card.v1.model');
const CardEvent = require('../../models/v1/card_event.v1.model');
const AuthService = require('../auth.service');
const ColumnService = require('./column.v1.service');
const IssueService = require('./issue.v1.service');

/**
 * @class CardService
 * @extends Card
 */
class CardService extends Card {
  /**
   * @param {Object} [obj = {}]
   * @return {Card}
   */
  static new(obj = {}) {
    return new Card(obj);
  }

  /**
   * @param {Object} [obj = {}]
   * @return {CardEvent}
   */
  static newEvent(obj = {}) {
    return new CardEvent(obj);
  }

  /**
   * @param query
   */
  static findEvents(query = {}) {
    return CardEvent.find(query).exec();
  }

  /**
   * @param card
   * @return {Promise<Card>}
   */
  static async saveOrUpdate(card) {
    if (!card) throw new Error('Trying to save an empty entity');

    debug('saving', JSON.stringify(card));

    if (card.column_url) await ColumnService.saveFromUrl(card.column_url);
    if (card.content_url) await IssueService.saveFromUrl(card.content_url);

    return new Card(card).save();
  }

  /**
   * @param {Object} event
   * @return {Promise.<CardEvent>}
   */
  static async saveEvent(event) {
    if (!event) throw new Error('Trying to save an empty entity');

    debug('saving event', JSON.stringify(event));

    const { project_card: card, action } = event;

    if (action === 'deleted') await CardService.delete(card.id);

    await CardService.saveFromUrl(card.url);
    return CardEvent(event).save();
  }

  /**
   * @param {Number} id
   * @return {Promise<void>}
   */
  static async delete(id) {
    debug('marking as deleted', id);

    const card = await CardService.findOne({ id }).exec();
    if (card) {
      card.deleted = true;
      await card.save();
    }
  }

  /**
   * @param {String} url
   * @return {Promise<Card>}
   */
  static async saveFromUrl(url) {
    if (!url) throw new Error('Trying to resolve a reference without url');

    debug('saving from url', url);

    const old = await Card.findOne({ url }).exec() || {};

    try {
      const request = await AuthService.buildGitHubRequest();
      const req = await request.get(url);
      const ref = req.data;
      return CardService.saveOrUpdate(Object.assign(old, ref));
    } catch (ignore) {
      return old;
    }
  }
}

module.exports = CardService;
