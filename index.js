// Enable ECMAScript module loader
require = require('esm')(module); // eslint-disable-line

// Check if a JWT secret is defined before starting the app. See:
//   https://github.com/dwyl/hapi-auth-jwt2#generating-your-secret-key
try {
  const config = require('config');
  config.get('jwt.secret');
} catch (error) {
  throw Error('Config property "jwtSecret" must be set.');
}

async function init () {
  const initServer = require('./app').default;
  const server = await initServer();
  console.log(`Server is running at ${server.info.uri}`); // eslint-disable-line
}
init();

process.on('unhandledRejection', err => {
  /* eslint-disable-next-line no-console */
  console.log(err);
  process.exit(1);
});
