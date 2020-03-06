
exports.up = function (knex) {
  return knex.schema.table('observations', function (table) {
    table.foreign(['osmObjectId', 'osmObjectVersion']).references(['osm_objects.id', 'osm_objects.version']);
  });
};

exports.down = function (knex) {
  return knex.schema.table('observations', function (table) {
    table.dropForeign('osmObject');
  });
};
