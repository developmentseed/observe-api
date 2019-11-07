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
 * Small delay function using Promises.
 */
export function delay (interval) {
  return new Promise(function (resolve) {
    setTimeout(resolve, interval);
  });
}
