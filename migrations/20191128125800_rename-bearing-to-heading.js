exports.up = function (knex) {
  return knex.schema.table('photos', function (t) {
    t.renameColumn('bearing', 'heading');
  });
};

exports.down = function (knex) {
  return knex.schema.table('photos', function (t) {
    t.renameColumn('heading', 'bearing');
  });
};
