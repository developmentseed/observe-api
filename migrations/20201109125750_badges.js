/**
 * Badges are composed of an id, name and json description
 * The json description contains a "metric" by which the badge is calculated
 * and other attributes such as a threshold (in the case of a numerical metric),
 * a location (for a geofence), etc.
 */
exports.up = async function (knex) {
  await knex.schema.createTable('badges', function (table) {
    table.increments('id').primary();
    table.string('name');
    table.json('description');
    table.binary('image');
  });
  await knex.schema.createTable('badges_users', function (table) {
    table.increments('id').primary();
    table.integer('badgeId').references('id').inTable('badges').onDelete('CASCADE');
    table.integer('userId').references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('createdAt').defaultTo();
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable('badges_users');
  await knex.schema.dropTable('badges');
};
