
exports.up = function (knex) {
  return knex.schema.createTable('observations', function (table) {
    table.increments('id').primary();
    table.timestamp('createdAt');
    table.timestamp('uploadedAt').defaultTo(knex.fn.now());
    table.integer('userId');
    table.foreign('userId').references('users.osmId');
    table.integer('surveyId').notNullable();
    table.foreign('surveyId').references('surveys.id');
    table.string('osmObjectId');
    table.integer('osmObjectVersion');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('observations');
};
