exports.up = function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.uuid('id').primary();
    table.integer('osmId').unique();
    table.string('osmDisplayName');
    table.timestamp('osmCreatedAt');
    table.boolean('isAdmin').defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('users');
};
