// setup ES6 Proxy shim
require('harmony-reflect');


import { readFileSync } from 'fs';
import { join } from 'path';
import knexConfig from './fixtures/knexfile';


const truncateTablesSQL = readFileSync(join(__dirname, './spec-helper.sql'), { encoding: 'utf8' });


export const knex = require('knex')(knexConfig.test);


beforeEach(function() {
  return truncateAllTables();
});


function truncateAllTables () {
  return knex.raw(truncateTablesSQL).then(function (sql) {
    const _sqlQuery = sql[0].map(function (sqlQuery) {
      return sqlQuery.trucate_table_cmd;
    }).join('');

    return knex.raw(_sqlQuery);
  });
}


export default {
  knex: knex,
};
