'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('$_users', function (table) {
    table.increments('id').primary();
    table.string('name');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('$_users');
};
