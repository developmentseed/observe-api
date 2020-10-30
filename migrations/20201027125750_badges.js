/**
 * Badges are composed of an id, name and json description
 * The json description contains a "metric" by which the badge is calculated
 * and other attributes such as a threshold (in the case of a numerical metric),
 * a location (for a geofence), etc.
 */
exports.up = async function(knex) {
  await knex.schema.createTable('badges', function (table) {
    table.increments('id').primary();
    table.string('name');
    table.json('description');
  });
  await knex.schema.createTable('badges_users', function (table) {
    table.increments('id').primary();
    table.foreign('badgeId').references('badges.id').onDelete('CASCADE');
    table.foreign('userId').references('users.id').onDelete('CASCADE');
    table.timestamp('createdAt').defaultTo();
  });
};

exports.down = function(knex) {
  await knex.schema.dropTable('badges_users');
  await knex.schema.dropTable('badges');
};

