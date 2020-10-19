import * as users from '../../app/models/users';
import { createTrace, getTrace } from '../../app/models/traces';
import validTraceJson from '../fixtures/valid-trace.json';
import { createPhoto } from '../../app/models/photos';
import cloneDeep from 'lodash.clonedeep';

/**
 * Generate random integer number up to "max" value.
 * @param {integer} max
 */
export function getRandomInt (max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
 * Factory to create mock users at the database.
 */
export async function createMockUser (data) {
  // Randomize id and display name separately to test sorting.
  const randomId = getRandomInt(100000);
  const profile = {
    osmId: randomId,
    email: `${randomId}@example.com`,
    displayName: 'User' + randomId,
    osmDisplayName: 'User' + randomId,
    osmCreatedAt: new Date().toISOString()
  };
  const [user] = await users.create({ ...profile, ...data }).returning('*');

  // Knex returns date objects, parse into string
  user.osmCreatedAt = user.osmCreatedAt.toISOString();
  user.createdAt = user.createdAt.toISOString();

  return user;
}

/**
 * Factory to create mock traces at the database.
 */
export async function createMockTrace (owner) {
  const traceJson = cloneDeep(validTraceJson);

  // Randomize first timestamp because it define "recordedAt" property,
  // which is used for sorting.
  traceJson.properties.timestamps[0] =
    traceJson.properties.timestamps[0] - getRandomInt(10000);

  const tracejson = await createTrace(
    {
      ...traceJson
    },
    owner.id
  );

  // Return trace without geometry
  return getTrace(tracejson.properties.id);
}

export async function createMockPhoto (owner) {
  const data = {
    file:
      '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',
    lon: Math.random() * 360 - 180,
    lat: Math.random() * 180 - 90,
    heading: Math.random() * 360,
    createdAt: new Date(),
    description: 'A randomized description with number ' + getRandomInt(100000),
    osmElement: `node/${getRandomInt(100000)}`
  };

  const photo = await createPhoto({ ...data, ownerId: owner.id });

  // Add owner display name, as they should be included on responses
  photo.ownerDisplayName = owner.displayName;

  return photo;
}
