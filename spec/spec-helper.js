var fs = require('fs'),
    path = require('path');


var removeTablesSQL = fs.readFileSync(path.join(__dirname, './spec-helper.sql'), { encoding: 'utf8' });


var knex = require('knex')(require('./fixtures/knexfile').test);


beforeEach(function() {
  this.timeout(10000);
  return knex.raw(removeTablesSQL);
});


module.exports = {
  knex: knex
};
