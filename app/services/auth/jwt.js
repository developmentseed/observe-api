import jwt from 'jsonwebtoken';
import hapiAuthJwt2 from 'hapi-auth-jwt2';
import users from '../../models/users';
import config from 'config';

const jwtSecret = config.get('jwtSecret');

/**
 * Returns an access token for an existing user.
 *
 * @param {integer} osmId
 */
export async function getAccessToken (osmId) {
  const [user] = await users.findByOsmId(osmId);
  if (user) {
    return jwt.sign(
      { osmId: user.osmId, osmCreatedAt: user.osmCreatedAt },
      jwtSecret
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
  const { osmId, osmCreatedAt } = decoded;

  // Token should include osmId and osmCreatedAt
  if (!osmId || !osmCreatedAt) return { isValid: false };

  const [user] = await users.findByOsmId(osmId);

  // User is found and metadata match, return valid
  if (
    user &&
    user.osmId === osmId &&
    user.osmCreatedAt.toISOString() === osmCreatedAt
  ) {
    return { isValid: true };
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
