const debug = require('debug')('github-metrics:services:v1:project');

const Project = require('../../models/v1/project.v1.model');
const ProjectEvent = require('../../models/v1/project_event.v1.model');
const AuthService = require('../auth.service');

/**
 * @class ProjectService
 * @extends Project
 */
class ProjectService extends Project {
  /**
   * @param {Object} [obj = {}]
   * @return {Project}
   */
  static new(obj = {}) {
    return new Project(obj);
  }

  /**
   * @param {Object} [obj = {}]
   * @return {ProjectEvent}
   */
  static newEvent(obj = {}) {
    return new ProjectEvent(obj);
  }

  /**
   * @param project
   * @return {Promise<Project>}
   */
  static async saveOrUpdate(project) {
    if (!project) throw new Error('Trying to save an empty entity');

    debug('saving', JSON.stringify(project));

    return new Project(project).save();
  }

  /**
   * @param {Object} event
   * @return {Promise.<ProjectEvent>}
   */
  static async saveEvent(event) {
    if (!event) throw new Error('Trying to save an empty entity');

    debug('saving event', JSON.stringify(event));

    const { project, action } = event;

    if (action === 'deleted') await ProjectService.delete(project.id);

    await ProjectService.saveFromUrl(project.url);
    return new ProjectEvent(event).save();
  }

  /**
   * @param {Number} id
   * @return {Promise<void>}
   */
  static async delete(id) {
    debug('marking as deleted', id);

    const project = await ProjectService.findOne({ id }).exec();
    if (project) {
      project.deleted = true;
      await project.save();
    }
  }

  /**
   * @param {String} url
   * @return {Promise<Project>}
   */
  static async saveFromUrl(url) {
    if (!url) throw new Error('Trying to resolve a reference without url');

    debug('saving from url', url);

    const old = await Project.findOne({ url }).exec() || {};

    try {
      const request = await AuthService.buildGitHubRequest();
      const req = await request.get(url);
      const ref = req.data;
      return ProjectService.saveOrUpdate(Object.assign(old, ref));
    } catch (ignore) {
      return old;
    }
  }
}

module.exports = ProjectService;
