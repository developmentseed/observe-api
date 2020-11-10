// Enable ECMAScript module loader
require = require("esm")(module); // eslint-disable-line

const users = require('../app/models/users');
const { createMockUser } = require('../test/utils/mock-factory');

exports.seed = async function (knex) {

  const usersCount = await users.count();
  if (usersCount > 0) {
    // eslint-disable-next-line
    console.log('There are USERS in the database already, bypass seeding...'); 
    return;
  }

  console.log('Seeding users...'); // eslint-disable-line

  // Create 5 admins
  for (let i = 0; i < 5; i++) {
    await createMockUser({ isAdmin: true });
  }

  // Create more 45 users
  for (let i = 0; i < 45; i++) {
    await createMockUser();
  }
};
