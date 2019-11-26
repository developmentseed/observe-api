// Enable ECMAScript module loader
require = require("esm")(module); // eslint-disable-line

const { createMockUser } = require('../test/utils/mock-factory');

exports.seed = async function (knex) {
  console.log('Seeding users...') // eslint-disable-line

  // Create 5 admins
  for (let i = 0; i < 5; i++) {
    await createMockUser({ isAdmin: true });
  }

  // Create more 45 users
  for (let i = 0; i < 45; i++) {
    await createMockUser();
  }
};
