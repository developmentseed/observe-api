exports.up = async function (knex) {
  return knex.schema.alterTable('badges', table => {
    table.text('image').alter();
  })
};

exports.down = async function (knex) {
  return knex.schema.alterTable('badges', table => {
    table.binary('image').alter();
  })
};
