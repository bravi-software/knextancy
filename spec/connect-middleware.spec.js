var express = require('express'),
    request = require('supertest'),
    knex = require('./spec-helper').knex,
    expect = require('chai').expect;


var knextancy = require('../src');


describe("connect-middleware with default settings", function() {
  var app;

  beforeEach(function() {
    app = express();

    app.use(knextancy.middleware(knex));

    app.get('/', function (req, res) {
      req.knex.select().from('$_users').then(function (users) {
        res.send(users);
      });
    });
  });

  describe("given some data in tenant 01 and tenant 02", function() {
    beforeEach(function() {
      return knextancy.tenant(knex, '01').then(function (tenantKnex) {
        return tenantKnex('$_users').insert({ name: 'Paulo' });
      }).then(function () {
        return knextancy.tenant(knex, '02').then(function (tenantKnex) {
          return tenantKnex('$_users').insert({ name: 'Pedro' });
        });
      });
    });

    it("should be possible to access the request's knex and query a tenant data", function(done) {
      request(app)
        .get('/')
        .set('x-client-id', '01')
        .expect(200)
        .end(function (err, res) {
          if (err) { return done(err); }

          expect(res.body).to.eql([ { id: 1, name: 'Paulo', role_id: null } ]);
          done();
        });
    });

    it("should throw an error if the 'x-client-id' header is not set", function(done) {
      request(app)
        .get('/')
        .expect(500)
        .end(function (err, res) {
          if (err) { return done(err); }

          expect(res.text).to.eql('Missing x-client-id header\n');

          done();
        });
    });
  });
});
