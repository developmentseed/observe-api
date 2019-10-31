import db from '../../app/services/db';
import logger from '../../app/services/logger';
import { clearMediaStore } from '../../app/services/media-store';

export default async function resetDb () {
  logger.info('Clearing database...');
  await db.schema.dropTableIfExists('knex_migrations');
  await db.schema.dropTableIfExists('users');
  await db.schema.dropTableIfExists('traces');
  await db.schema.dropTableIfExists('photos');
  await db.migrate.latest();
  await clearMediaStore();
}
