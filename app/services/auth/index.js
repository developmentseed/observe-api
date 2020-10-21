import setupOAuth from './oauth';
import { setupJwtAuth } from './jwt';

async function setupAuth (server) {
  await setupOAuth(server);
  await setupJwtAuth(server);
}

export default setupAuth;
