
exports.up = function (knex) {
  return knex.schema.createTable('campaigns', function (table) {
    table.increments('id').primary();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.string('name');
    table.string('slug');
    table.specificType('aoi', 'GEOMETRY');
    table.specificType('surveys', 'INT[]');
    table.unique('slug');
    table.integer('ownerId');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('campaigns');
};
