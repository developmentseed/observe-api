import config from 'config';
import path from 'path';
import { writeFile, emptyDir } from 'fs-extra';

const mediaStore = config.get('media.store');
const mediaPath = path.join(__dirname, '..', '..', mediaStore.path);

export async function clearMediaStore () {
  await emptyDir(mediaPath);
}

export async function saveFileFromBase64 (name, data) {
  await writeFile(path.join(mediaPath, name), data, 'base64');
}
