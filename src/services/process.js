const debug = require('debug')('github-metrics:services:process');

const Env = require('../config/env');
const AuthService = require('./auth');
const SummaryService = require('./v1/summary');

const _findSchema = name => require(`../models/v1/${name}`);

/**
 * @param schema
 * @private
 */
const _saveOrUpdate = schema => async (obj) => {
  const Schema = _findSchema(schema);
  const old = await Schema.findOne({ id: obj.id }).exec();
  if (old) {
    debug('updating', schema, old.id);
    return Object.assign(old, obj).save();
  }
  debug('saving', schema, obj.id);
  return new Schema(obj).save();
};

/**
 * @param res
 * @param api
 * @param total
 * @return {Promise.<void>}
 * @private
 */
const _loadProjects = async (res, api, total = 0) => {
  const GitHubApi = api || await AuthService.buildGitHubApi();

  if (res) {
    res = await GitHubApi.getNextPage(res);
  } else {
    res = await GitHubApi.projects.getOrgProjects({
      org: Env.GITHUB_COMPANY_NAME,
      state: 'all',
    });
  }

  const projects = res.data;
  await Promise.all(projects.map(_saveOrUpdate('project')));

  debug(total += projects.length, 'projects loaded');

  if (GitHubApi.hasNextPage(res)) await _loadProjects(res, GitHubApi, total);
};

/**
 * @param res
 * @param api
 * @param total
 * @return {Promise.<void>}
 * @private
 */
const _loadIssues = async (res, api, total = 0) => {
  const GitHubApi = api || await AuthService.buildGitHubApi();

  if (res) {
    res = await GitHubApi.getNextPage(res);
  } else {
    res = await GitHubApi.issues.getForOrg({
      org: Env.GITHUB_COMPANY_NAME,
      state: 'all',
      filter: 'all',
    });
  }

  const issues = res.data;
  await Promise.all(issues.map(_saveOrUpdate('issue')));

  debug(total += res.data.length, 'issues loaded');

  if (GitHubApi.hasNextPage(res)) await _loadIssues(res, GitHubApi, total);
};

/**
 * @private
 */
const _summarize = () => SummaryService.summarize();

const ProcessService = {

  /**
   * @param process
   * @return {Promise.<void>}
   */
  execute: async (process) => {
    debug('executing process', process);

    const isAuthenticated = await AuthService.isAppAuthenticated();
    if (!isAuthenticated) throw new Error('GitHub must be authenticated to perform this action');

    switch (process) {
      case 'load-projects':

        debug('loading projects');
        _loadProjects()
          .then(() => debug('finished loading projects'))
          .catch(err => debug('failed loading projects', err));

        break;
      case 'load-issues':

        debug('loading issues');
        _loadIssues()
          .then(() => debug('finished loading issues'))
          .catch(err => debug('failed loading issues', err));

        break;
      case 'summarize':

        debug('summarizing');
        _summarize()
          .then(() => debug('finished summarizing'))
          .catch(err => debug('failed summarizing', err));

        break;
      default:

        throw new Error('You must select a process to run');
    }
  },
};

module.exports = ProcessService;
