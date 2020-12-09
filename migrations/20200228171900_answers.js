
exports.up = function (knex) {
  return knex.schema.createTable('answers', function (table) {
    table.increments('id').primary();
    table.integer('observationId').notNullable();
    table.foreign('observationId').references('observations.id');
    table.integer('questionId').notNullable();
    table.integer('questionVersion').notNullable();
    table.foreign(['questionId', 'questionVersion']).references(['id', 'version']).on('questions');
    table.jsonb('answer');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('answers');
};
