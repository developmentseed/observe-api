const config = require('config');
const knexConfig = config.get('knex');
module.exports = require('knex')(knexConfig);
