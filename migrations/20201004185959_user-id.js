exports.up = async function (knex) {
  await knex.schema.alterTable('observations', function (table) {
    table.dropForeign(['userId']);
  });

  await knex.schema.alterTable('users', function (table) {
    table.dropPrimary();
  });

  await knex.schema.alterTable('users', function (table) {
    table.increments('id').primary();
    table.string('displayName');
    table.string('email');
    table.timestamps(true, true);
    table.integer('osmId').nullable().alter();
  });

  await knex.raw('UPDATE observations SET "userId"=(SELECT id from users where "osmId"=observations."userId")');
  await knex.raw('UPDATE users SET "displayName"="osmDisplayName"');

  await knex.schema.alterTable('observations', function (table) {
    table.foreign('userId').references('users.id');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('observations', function (table) {
    table.dropForeign(['userId']);
  });

  // This rollback line will fail if osmId is null. This migration is meant to be run once during the addition of Google as an
  // auth provider
  await knex.raw('UPDATE observations SET "userId"=(SELECT "osmId" from users where users.id=observations."userId")');

  await knex.schema.alterTable('users', function (table) {
    table.dropPrimary();
  });

  await knex.schema.alterTable('users', function (table) {
    table.integer('osmId').primary().alter();
    table.dropColumns('id', 'displayName', 'email');
    table.dropTimestamps();
  });

  await knex.schema.alterTable('observations', function (table) {
    table.foreign('userId').references('users.osmId');
  });
};
