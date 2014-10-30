var knex = require('./spec-helper').knex,
    expect = require('chai').expect;


var knextancy = require('../lib');


describe("tenant raw queries", function() {
  describe("given some data in tenant 10", function() {
    beforeEach(function() {
      return knextancy.tenant(knex, '10').then(function (tenantKnex) {
        return tenantKnex('$tenant:users').insert({ name: 'Paulo' });
      });
    });

    it("should be readable via a raw query on its tenant", function() {
      return knextancy.tenant(knex, '10').then(function (tenantKnex) {
        return tenantKnex.raw('select * from `$tenant:users`').then(function (result) {
          var users = result[0];
          expect(users.length).to.eql(1);
        });
      });
    });

    it("should not be readable via a raw query on other tenant", function() {
      return knextancy.tenant(knex, '20').then(function (tenantKnex) {
        return tenantKnex.raw('select * from `$tenant:users`').then(function (result) {
          var users = result[0];
          expect(users.length).to.eql(0);
        });
      });
    });
  });
});
