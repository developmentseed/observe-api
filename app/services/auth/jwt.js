import jwt from 'jsonwebtoken';
import hapiAuthJwt2 from 'hapi-auth-jwt2';
import * as users from '../../models/users';
import config from 'config';

const jwtSecret = config.get('jwt.secret');
const expiresIn = config.get('jwt.expiresIn');
/**
 * Returns an access token for an existing user.
 *
 * @param {integer} userId
 */
export async function getAccessTokenFromUserId (userId) {
  const user = await users.get(userId);

  if (user) {
    return jwt.sign(
      { userId: user.id, createdAt: user.createdAt },
      jwtSecret,
      { expiresIn }
    );
  }
  throw Error(`Could not generate access token, user not found.`);
}

/**
 * Helper function to validate JWT, returns true if token metadata matches the
 * database.
 *
 * @param {object} decoded
 */
const validate = async function (decoded) {
  const { userId, createdAt } = decoded;

  // Token should include userId and createdAt
  if (!userId || !createdAt) return { isValid: false };

  const user = await users.get(userId);

  // User is found and metadata match, return valid
  if (
    user &&
    user.id === userId &&
    user.createdAt.toISOString() === createdAt
  ) {
    return { isValid: true, credentials: user };
  }

  return { isValid: false };
};

export async function setupJwtAuth (server) {
  await server.register(hapiAuthJwt2);

  server.auth.strategy('jwt', 'jwt', {
    key: jwtSecret,
    validate
  });
}
