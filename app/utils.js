import config from 'config';

const appUrl = config.get('appUrl');

export function mediaUrl () {
  return `${appUrl}/media`;
}

/**
 * Small delay function using Promises.
 */
export function delay (interval) {
  return new Promise(function (resolve) {
    setTimeout(resolve, interval);
  });
}
