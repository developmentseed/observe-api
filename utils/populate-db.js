import resetDb from '../test/utils/reset-db';
import { getRandomInt } from '../app/utils';
import logger from '../app/services/logger';
import {
  createMockUser,
  createMockTrace,
  createMockPhoto
} from '../test/utils/mock-factory';

export async function populateDb () {
  await resetDb();

  logger.info(`Populating...`);

  const numberOfUsers = 5;

  // For each user
  for (let u = 0; u < numberOfUsers; u++) {
    const user = await createMockUser();

    // Generate up to 25 traces
    const numberOfTraces = getRandomInt(20) + 5;
    for (let t = 0; t < numberOfTraces; t++) {
      await createMockTrace(user.osmId);
    }

    // Generate up to 25 photos
    const numberOfPhotos = getRandomInt(20) + 5;
    for (let p = 0; p < numberOfPhotos; p++) {
      await createMockPhoto(user.osmId);
    }

    logger.info(
      `  Added user ${user.osmDisplayName} with ${numberOfTraces} traces and ${numberOfPhotos} photos.`
    );
  }
  process.exit();
}
