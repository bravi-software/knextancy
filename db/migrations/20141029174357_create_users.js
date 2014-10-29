'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('$tenant:users', function (table) {
    table.string('name');
  });
};

exports.down = function(knex, Promise) {

};
