import nanoid from 'nanoid';
import config from 'config';

const idLength = config.get('idLength');

export function generateId () {
  return nanoid(idLength);
}
