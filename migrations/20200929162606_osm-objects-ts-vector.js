exports.up = function (knex) {
  return knex.schema.table('osm_objects', function (t) {
    t.index('attributes', 'attributes_fulltext', 'gin');
  });
};

exports.down = function (knex) {
  return knex.schema.table('osm_objects', function (t) {
    t.dropIndex('attributes', 'attributes_fulltext');
  });
};
