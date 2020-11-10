// Enable ECMAScript module loader
require = require("esm")(module); // eslint-disable-line

const photos = require('../app/models/photos');
const { createMockPhoto, getRandomInt } = require('../test/utils/mock-factory');

exports.seed = async function (knex) {

  const photosCount = await photos.countPhotos();
  if (photosCount > 0) {
    // eslint-disable-next-line
    console.log('There are PHOTOS in the database already, bypass seeding...'); 
    return;
  }


  console.log('Seeding photos...') // eslint-disable-line

  const users = await knex('users').select('id');

  const totalUsers = users.length;

  if (users.length === 0) {
    throw Error('No users found. Please login to create a user to associate mock data.');
  }

  for (let i = 0; i < 50; i++) {
    const user = users[getRandomInt(totalUsers)];
    await createMockPhoto({ id: user.id });
  }
};
