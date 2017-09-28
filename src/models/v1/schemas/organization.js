const mongoose = require('mongoose');

const { Schema } = mongoose;

const OrganizationSchema = new Schema({
  login: String,
  id: Number,
  url: String,
  repos_url: String,
  events_url: String,
  members_url: String,
  public_members_url: String,
  avatar_url: String,
});

module.exports = OrganizationSchema;
