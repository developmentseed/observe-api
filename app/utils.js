import config from 'config';
import path from 'path';

export const appBasePath = path.join(__dirname, '..');

const relativeMediaStorePath = config.get('media.store.path');
export const mediaStorePath = path.join(appBasePath, '..', relativeMediaStorePath);

const appUrl = config.get('appUrl');
export const mediaUrl = `${appUrl}/media`;

/**
 * Small delay function using Promises.
 */
export function delay (interval) {
  return new Promise(function (resolve) {
    setTimeout(resolve, interval);
  });
}
