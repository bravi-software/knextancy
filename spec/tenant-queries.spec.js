var knex = require('./spec-helper').knex,
    expect = require('chai').expect;


var knextancy = require('../lib');


describe("tenant queries", function() {
  describe("given some data in tenant 01", function() {
    beforeEach(function() {
      return knextancy.tenant(knex, '01').then(function (tenantKnex) {
        return tenantKnex('$_users').insert({ name: 'Paulo' });
      });
    });

    it("should be readable via a raw query on its tenant", function() {
      return knextancy.tenant(knex, '01').then(function (tenantKnex) {
        return tenantKnex.select().from('$_users').then(function (users) {
          expect(users.length).to.eql(1);
        });
      });
    });

    it("should not be readable via a raw query on other tenant", function() {
      return knextancy.tenant(knex, '02').then(function (tenantKnex) {
        return tenantKnex.select().from('$_users').then(function (users) {
          expect(users.length).to.eql(0);
        });
      });
    });
  });
});
