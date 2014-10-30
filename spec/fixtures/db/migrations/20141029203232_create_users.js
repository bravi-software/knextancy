'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('$tenant:users', function (table) {
    table.string('name');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('$tenant:users');
};
