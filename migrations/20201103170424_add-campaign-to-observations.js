
exports.up = async function (knex) {
  await knex.schema.alterTable('observations', function (table) {
    table.integer('campaignId');
    table.foreign('campaignId').references('campaigns.id');
  });

  // add campaignId to existing observations. Just assume the fist campaign id.
  // this should be modified to what's needed
  await knex.raw('UPDATE observations SET "campaignId"=(SELECT id from campaigns limit 1)');

  await knex.schema.alterTable('observations', function (table) {
    table.integer('campaignId').notNullable().alter();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('observations', function (table) {
    table.dropForeign(['campaignId']);
    table.dropColumn('campaignId');
  });
};
