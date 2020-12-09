
exports.up = function (knex) {
  return knex.schema.table('observations', function (table) {
    table.foreign(['osmObjectId', 'osmObjectVersion']).references(['id', 'version']).on('osm_objects');
  });
};

exports.down = function (knex) {
  return knex.schema.table('observations', function (table) {
    table.dropForeign(['osmObjectId', 'osmObjectVersion']);
  });
};
