
exports.up = function (knex) {
  return knex.schema.createTable('surveys', function (table) {
    table.increments('id').primary();
    table.string('name');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.integer('ownerId');
    table.specificType('optionalQuestions', 'INT[]');
    table.specificType('mandatoryQuestions', 'INT[]');
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('surveys');
};
