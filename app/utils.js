import config from 'config';
import path from 'path';

export const appBasePath = path.join(__dirname, '..');

const protocol = config.get('protocol');
const host = config.get('host');
const port = config.get('port');
export const appUrl = `${protocol}://${host}${port && `:${port}`}`;

const relativeMediaStorePath = config.get('media.store.path');
export const mediaStorePath = path.join(appBasePath, relativeMediaStorePath);

export const mediaUrl = `${appUrl}/media`;

/**
 * Small delay function using Promises.
 */
export function delay (interval) {
  return new Promise(function (resolve) {
    setTimeout(resolve, interval);
  });
}
