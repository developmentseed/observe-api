import users from '../../app/models/users';
import traces from '../../app/models/traces';
import validTraceJson from '../fixtures/valid-trace.json';

/**
 * Generate random integer number up to "max" value.
 * @param {integer} max
 */
function getRandomInt (max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
 * Factory to create mock users at the database.
 */
export async function createMockUser (data) {
  // Randomize id and display name separately to test sorting.
  const profile = {
    osmId: getRandomInt(100000),
    osmDisplayName: 'User' + getRandomInt(100000),
    osmCreatedAt: new Date().toISOString()
  };
  const [user] = await users.create({ ...profile, ...data }).returning('*');
  return user;
}

/**
 * Factory to create mock traces at the database.
 */
export async function createMockTrace (ownerId) {
  const [trace] = await traces
    .create(
      {
        ...validTraceJson
      },
      ownerId
    )
    .returning([
      'id',
      'ownerId',
      'description',
      'length',
      'recordedAt',
      'uploadedAt',
      'updatedAt'
    ])
    .map(r => {
      r.recordedAt = r.recordedAt.toISOString();
      r.uploadedAt = r.uploadedAt.toISOString();
      r.updatedAt = r.updatedAt.toISOString();
      return r;
    });
  return trace;
}

export default {
  createMockTrace,
  createMockUser
};
