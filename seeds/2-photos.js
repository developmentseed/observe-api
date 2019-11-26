// Enable ECMAScript module loader
require = require("esm")(module); // eslint-disable-line

const { createMockPhoto, getRandomInt } = require('../test/utils/mock-factory');

exports.seed = async function (knex) {
  console.log('Seeding photos...') // eslint-disable-line

  const users = await knex('users').select('osmId');

  const totalUsers = users.length;

  if (users.length === 0) {
    throw Error('No users found. Please login to create a user to associate mock data.');
  }

  for (let i = 0; i < 50; i++) {
    const user = users[getRandomInt(totalUsers)];
    await createMockPhoto({ osmId: user.osmId });
  }
};
