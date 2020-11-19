exports.up = function (knex) {
  return knex.raw('CREATE index attributes_tsvector ON osm_objects USING gin(jsonb_to_tsvector(\'english\', attributes, \'["string"]\'))');
};

exports.down = function (knex) {
  return knex.schema.table('osm_objects', function (t) {
    t.dropIndex('attributes', 'attributes_tsvector');
  });
};
