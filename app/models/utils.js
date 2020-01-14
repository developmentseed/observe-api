import config from 'config';
import generate from 'nanoid/generate';

const { length, alphabet } = config.get('elementIds');

export function generateId () {
  return generate(alphabet, length);
}
