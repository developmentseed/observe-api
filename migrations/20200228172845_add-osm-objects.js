
exports.up = function (knex) {
  return knex.schema.createTable('osm_objects', function (table) {
    table.string('id').notNullable();
    table.integer('version');
    table.primary(['id', 'version']);
    table.specificType('geom', 'GEOMETRY');
    table.string('quadkey');
    table.jsonb('attributes');
    table.index('geom', 'GIST');
    table.index('quadkey', 'varchar_pattern_ops');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('osm_objects');
};
