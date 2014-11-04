'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('$_roles', function (table) {
    table.increments('id').primary();
    table.string('name');
  }).then(function () {
    return knex.schema.table('$_users', function (table) {
      table.integer('role_id').unsigned().references('id').inTable('$_roles');
    });
  });
};

exports.down = function() {
  // TODO: Implement
};
