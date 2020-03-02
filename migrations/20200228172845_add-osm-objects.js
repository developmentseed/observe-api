
exports.up = function (knex) {
  return knex.schema.createTable('osm_objects', function (table) {
    table.string('id').notNullable();
    table.unique('id');
    table.specificType('geom', 'GEOMETRY');
    table.jsonb('attributes');
    table.index('geom', 'GIST');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('osm_objects');
};
