// Enable ECMAScript module loader
require = require('esm')(module); // eslint-disable-line

async function init () {
  const initServer = require('./app').default;
  const server = await initServer();
  console.log(`Server running at: ${server.info.uri}`); // eslint-disable-line
}
init();

process.on('unhandledRejection', (err) => {
  /* eslint-disable-next-line no-console */
  console.log(err);
  process.exit(1);
});
