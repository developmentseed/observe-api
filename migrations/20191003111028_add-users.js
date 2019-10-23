exports.up = function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.integer('osmId').primary();
    table.string('osmDisplayName');
    table.timestamp('osmCreatedAt');
    table.boolean('isAdmin').defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('users');
};
