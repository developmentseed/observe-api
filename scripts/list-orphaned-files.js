import path from 'path';
import { readdir } from 'fs-extra';
import { mediaStorePath } from '../app/utils';
import db from '../app/services/db';
import config from 'config';
const { sizes } = config.get('media');

(async function listOrphanedMediaFiles () {
  const allFiles = (await readdir(mediaStorePath)).map(f =>
    path.join(mediaStorePath, f)
  );

  // Get photo ids
  const photoIds = await db('photos')
    .select('id')
    .map(p => p.id);

  // Get list of existing files
  let existingPhotoMediaFiles = photoIds
    .map(id => {
      return sizes.map(size =>
        path.join(mediaStorePath, `${id}-${size.id}.jpg`)
      );
    });

  // Flatten and sort array
  existingPhotoMediaFiles = [].concat.apply([], existingPhotoMediaFiles);
  existingPhotoMediaFiles = existingPhotoMediaFiles.sort();

  let difference = allFiles.filter(x => !existingPhotoMediaFiles.includes(x));

  // eslint-disable-next-line no-console
  difference.forEach(f => console.log(f));

  db.destroy();
})();
