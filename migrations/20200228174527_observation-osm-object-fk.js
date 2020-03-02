
exports.up = function (knex) {
  return knex.schema.table('observations', function (table) {
    table.foreign('osmObject').references('osm_objects.id');
  });
};

exports.down = function (knex) {
  return knex.schema.table('observations', function (table) {
    table.dropForeign('osmObject');
  });
};
