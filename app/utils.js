import config from 'config';

const host = config.get('host');
const port = config.get('port');

export function appUrl () {
  return `http://${host}:${port}`;
}

export function mediaUrl () {
  return `${appUrl()}/media`;
}

/**
 * Generate random integer number up to "max" value.
 * @param {integer} max
 */
export function getRandomInt (max) {
  return Math.floor(Math.random() * Math.floor(max));
}
