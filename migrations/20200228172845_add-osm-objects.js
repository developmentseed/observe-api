
exports.up = async function (knex) {
  await knex.schema.createTable('osm_objects', function (table) {
    table.string('id').notNullable();
    table.integer('version');
    table.primary(['id', 'version']);
    table.specificType('geom', 'GEOMETRY');
    table.text('quadkey');
    table.jsonb('attributes');
    table.index('geom', 'GIST');
  });

  await knex.raw('CREATE INDEX txt_x on osm_objects (quadkey text_pattern_ops)');
};

exports.down = function (knex) {
  return knex.schema.dropTable('osm_objects');
};
