// Enable ECMAScript module loader
require = require("esm")(module); // eslint-disable-line

const { createMockTrace, getRandomInt } = require('../test/utils/mock-factory');

exports.seed = async function (knex) {
  console.log('Seeding traces...') // eslint-disable-line

  const users = await knex('users').select('id');

  const totalUsers = users.length;

  if (users.length === 0) {
    throw Error('No users found. Please login to create a user to associate mock data.');
  }

  for (let i = 0; i < 50; i++) {
    const user = users[getRandomInt(totalUsers)];
    await createMockTrace({ id: user.id });
  }
};
