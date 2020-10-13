
exports.up = function (knex) {
  return knex.schema.createTable('campaigns', function (table ) {
    table.increments('id').primary();
    table.timestamp('createdAt');
    table.string('name');
    table.string('slug');
    table.specificType('aoi', 'GEOMETRY');
    table.specificType('surveys', 'INT[]');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('campaigns');
};
