// Enable ECMAScript module loader
require = require('esm')(module); // eslint-disable-line

const db = require('../app/services/db');
const { stringify } = require('wellknown');

exports.seed = async function(knex) {
  const {count} = await db('campaigns').count().first();
  if (count > 0) {
    // eslint-disable-next-line
    console.log(
      'There are CAMPAIGNS in the database already, bypass seeding...'
    );
    return;
  }

  console.log('Seeding campaigns...'); // eslint-disable-line

  const adminId = (await db('users')
    .select('id')
    .where({ isAdmin: true })
    .limit(1))[0].id;

  await db('campaigns').insert({
    name: 'Washington DC',
    slug: 'washignton-dc',
    aoi: stringify({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-77.16796875, 38.77871080859691],
            [-76.871337890625, 38.77871080859691],
            [-76.871337890625, 39.00744617666487],
            [-77.16796875, 39.00744617666487],
            [-77.16796875, 38.77871080859691]
          ]
        ]
      }
    }),
    surveys: [1],
    ownerId: adminId
  });

  await db('campaigns').insert({
    name: 'Boston',
    slug: 'boston',
    aoi: stringify({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-71.13029479980469, 42.3016903282445],
            [-70.98129272460938, 42.3016903282445],
            [-70.98129272460938, 42.40064333382955],
            [-71.13029479980469, 42.40064333382955],
            [-71.13029479980469, 42.3016903282445]
          ]
        ]
      }
    }),
    surveys: [1],
    ownerId: adminId
  });
};
