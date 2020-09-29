import setupOAuth from './oauth';
import { setupJwtAuth } from './jwt';

const config = require('config');

async function setupAuth (server) {
  await setupOAuth(server, config.get('oauthStrategy'));
  await setupJwtAuth(server);
}

export default setupAuth;
