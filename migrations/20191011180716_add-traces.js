exports.up = function (knex) {
  return knex.schema.createTable('traces', function (table) {
    table.string('id').primary();
    table.string('description');
    table.specificType('geometry', 'GEOGRAPHY(Linestring, 4326)');
    table.specificType('timestamps', 'float[]');
    table.float('length');
    table.timestamp('recordedAt');
    table.timestamp('uploadedAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
    table.integer('ownerId');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('traces');
};
