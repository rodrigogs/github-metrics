# github-metrics (WORK IN PROGRESS)

[![Build Status](https://travis-ci.org/rodrigogs/github-metrics.svg?branch=master)](https://travis-ci.org/rodrigogs/github-metrics)
[![Code Climate](https://codeclimate.com/github/rodrigogs/github-metrics/badges/gpa.svg)](https://codeclimate.com/github/rodrigogs/github-metrics)
[![Test Coverage](https://codeclimate.com/github/rodrigogs/github-metrics/badges/coverage.svg)](https://codeclimate.com/github/rodrigogs/github-metrics/coverage)
[![Dependency Status](https://david-dm.org/rodrigogs/github-metrics/status.svg)](https://david-dm.org/rodrigogs/github-metrics#info=dependencies)
[![devDependency Status](https://david-dm.org/rodrigogs/github-metrics/dev-status.svg)](https://david-dm.org/rodrigogs/github-metrics#info=devDependencies)

Track github project events from webhooks.

#### Requirements

- Node.js **7.6.0 >** 
- Redis server
- Mongodb

#### Development setup

- Download or clone github-metrics latest [release](https://github.com/rodrigogs/github-metrics/releases)
-  `$ yarn install`
-  Download [ngrok](https://ngrok.com/download) to expose your computer port to receive webhook events
-  Start nkrok `$ ngrok http 3000`
-  Create two Github OAuth Apps
    -  One for authenticate your application to use web hooks
        -  **Authorization callback URL:** https://your_url.ngrok.io/auth/githubtoken/callback
    -  Other for authenticate your application users
      -  **Authorization callback URL:** https://your_url.ngrok.io/auth/github/callback
-  Create a .env file base on .env.sample and fill with the correct data

```
APP_NAME=GitHub Metrics
NODE_ENV=development
PORT=3000
MONGO_DB=mongodb://url
RECONNECTION_INTERVAL=15000
HTTP_LOG_CONFIG=dev
GITHUB_COMPANY_NAME=your_company_name
GITHUB_CLIENT_ID=client_id
GITHUB_CLIENT_SECRET=client_secret
GITHUB_USERS_CLIENT_ID=client_users_id
GITHUB_USERS_CLIENT_SECRET=client_users_secret
REDIS_URL=redis://url
APP_URL=https://your_url.ngrok.io
SESSION_SECRET=my-secret
```

- Start the application: `$ yarn start`

#### Production
- Single instance
    - `$ NODE_ENV=production node bin/www`

- Cluster
    - `$ NODE_ENV=production node bin/fork`

#### Test

- `$ yarn test`

License
-------
[Licence](https://github.com/rodrigogs/github-metrics/blob/master/LICENSE) © Rodrigo Gomes da Silva
