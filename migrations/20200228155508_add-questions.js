
exports.up = function (knex) {
  return knex.schema.createTable('questions', function (table) {
    table.increments('id');
    table.integer('version');
    table.unique(['id', 'version']);
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.string('label');
    table.enum('type', ['boolen', 'multiple_choice', 'range', 'text', 'date', 'timestamp']);
    table.jsonb('options');
    table.index(['id', 'version'], 'GIN');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('questions');
};
