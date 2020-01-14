exports.up = function (knex) {
  return knex.schema.table('photos', function (t) {
    t.dropColumn('osmObjects');
    t.string('osmElement');
  });
};

exports.down = function (knex) {
  return knex.schema.table('photos', function (t) {
    t.dropColumn('osmElement');
    t.specificType('osmObjects', 'text[]');
  });
};
