import path from 'path';
import { deferConfig } from 'config/defer';

/*
 * Default configuration values. This file makes use of deferConfig(), which
 * allows generating config values in runtime.
 */

module.exports = {
  appUrl: 'http://localhost:3000',
  host: 'localhost',
  port: 3000,
  mediaStorePath: deferConfig(function () {
    // This calculate the absolute path to the media folder,
    // which will be used for file read/write operations
    const appBasePath = path.join(__dirname, '..');
    return path.join(appBasePath, this.media.store.path);
  }),
  mediaUrl: deferConfig(function () {
    return `${this.appUrl}/media`;
  }),
  pagination: {
    limit: 15
  },
  jwt: {
    expiresIn: '30d'
  },
  elementIds: {
    length: 15,
    alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  },
  osmOAuth: {
    requestTokenUrl:
      'https://master.apis.dev.openstreetmap.org/oauth/request_token',
    accessTokenUrl:
      'https://master.apis.dev.openstreetmap.org/oauth/access_token',
    authorizeUrl: 'https://master.apis.dev.openstreetmap.org/oauth/authorize',
    profileUrl:
      'https://master.apis.dev.openstreetmap.org/api/0.6/user/details',
    allowedRedirectURLs:
      'http://observe-dev.surge.sh,http://localhost:3030,http://localhost:9000,observe://apilogin'
  },
  media: {
    store: {
      type: 'local',
      path: './data/media' // relative to server root path
    },
    sizes: [
      {
        id: 'thumb',
        width: 100,
        height: 100
      },
      {
        id: 'default',
        width: 800,
        height: 600,
        fit: 'inside'
      },
      {
        id: 'full',
        width: 1200,
        height: 1200,
        fit: 'inside'
      }
    ]
  }
};
