// setup ES6 Proxy shim
require('harmony-reflect');


var fs = require('fs'),
    path = require('path');


var truncateTablesSQL = fs.readFileSync(path.join(__dirname, './spec-helper.sql'), { encoding: 'utf8' });


var knex = require('knex')(require('./fixtures/knexfile').test);


beforeEach(function() {
  return truncateAllTables();
});


function truncateAllTables () {
  return knex.raw(truncateTablesSQL).then(function (sql) {
    sql = sql[0].map(function (sqlQuery) {
      return sqlQuery.trucate_table_cmd;
    }).join('');

    return knex.raw(sql);
  });
}


module.exports = {
  knex: knex
};
