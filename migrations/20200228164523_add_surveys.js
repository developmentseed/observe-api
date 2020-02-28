
exports.up = function (knex) {
  return knex.schema.createTable('surveys', function (table) {
    table.increments('id').primary();
    table.string('name');
    table.timestamp('createdAt');
    table.integer('ownerId');
    table.specificType('questions', 'INT[]');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('surveys');
};
