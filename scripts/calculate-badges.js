// Enable ECMAScript module loader
require = require('esm')(module); // eslint-disable-line

(async () => {
  try {
    const run = require('../app/services/badges/index').default;
    await run();
    process.exit();
  } catch (error) {
    process.stderr.write('Could not complete badge calculation.\r\n');
    process.stderr.write(error.message);
    process.stderr.write('\r\n');
    process.exit(1);
  }
}
)();
