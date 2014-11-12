var knex = require('./spec-helper').knex,
    expect = require('chai').expect;


var knextancy = require('../lib');


describe("tenant", function() {
  it("should return a knex object with the tenantId as an attribute", function() {
    return knextancy.tenant(knex, '01').then(function (tenantKnex) {
      expect(tenantKnex.tenantId).to.eql('01');
    });
  });
});
