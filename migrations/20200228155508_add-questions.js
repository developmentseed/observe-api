
exports.up = function (knex) {
  return knex.schema.createTable('questions', function (table) {
    table.increments('id');
    table.dropPrimary();
    table.integer('version').notNullable();
    table.primary(['id', 'version']);
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.string('label');
    table.enum('type', ['boolean', 'multiple_choice', 'range', 'text', 'date', 'timestamp', 'number', 'photo', 'radio', 'checkbox']);
    table.jsonb('options');
    table.index(['id', 'version'], 'GIN');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('questions');
};
