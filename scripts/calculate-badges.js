// Enable ECMAScript module loader
require = require('esm')(module); // eslint-disable-line

(async () => {
  try {
    const run = require('../app/services/badges/index').default;
    await run();
    process.exit();
  } catch (error) {
    process.stderr('Could not complete badge calculation.', error);
    process.exit(1);
  }
}
)();
