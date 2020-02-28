
exports.up = function (knex) {
  return knex.schema.createTable('answers', function (table) {
    table.increments('id').primary();
    table.integer('observationId').notNullable();
    table.foreign('observationId').references('observations.id');
    table.integer('questionId').notNullable();
    table.foreign('questionId').references('questions.id');
    table.integer('questionVersion').notNullable();
    table.foreign('questionVersion').references('question_versions.id');
    table.string('answer');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('answers');
};
