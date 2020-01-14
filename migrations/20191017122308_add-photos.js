exports.up = function (knex) {
  return knex.schema.createTable('photos', function (table) {
    table.string('id').primary();
    table.string('description');
    table.specificType('osmObjects', 'text[]');
    table.specificType('location', 'GEOGRAPHY(Point, 4326)');
    table.float('bearing');
    table.timestamp('createdAt');
    table.timestamp('uploadedAt').defaultTo(knex.fn.now());
    table.integer('ownerId');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('photos');
};
