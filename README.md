# Knextancy - knex with multitenancy

[![Build Status](https://travis-ci.org/bravi-software/knextancy.svg?branch=master)](https://travis-ci.org/bravi-software/knextancy)
[![npm version](https://badge.fury.io/js/knextancy.svg)](http://badge.fury.io/js/knextancy)


Small library that provides a way of implementing multi-tenancy using table prefixes.

It has a very simple API:

```js
var knextancy = require('knextancy');

knextancy.tenant(knex, tenantId).then(function (tenantKnex) {

  // the tenantKnex object contains the tenantId as an attribute
  console.log(tenantKnex.tenantId);

  tenantKnex('$_users').where({
    first_name: 'Test',
    last_name:  'User'
  }).select('id')

});
```

Its `tenant` method expects a `knex` instance and a `tenantId` and returns **Promise** for a special `tenantKnex` instance that scopes every queries to the particular tenant.

The only requirement is that every query is written using the special `$_` prefix for every table name.

## Migrations

**Knextancy** assures that all migrations are ran on a tenant's tables before returning its `knex` instance.

This special naming convention also applies while writing migrations, for example:

```js
'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('$_users', function (table) {
    table.string('name');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
```

## Connect Middleware

It also provides a handy [Connect](https://github.com/senchalabs/connect#readme) middleware that automatically creates a `knex` instance and attaches it to the `request` object for a kiven tetant based on a special HTTP header.

Bellow is a usage example:

```js
var app = express();

app.use(knextancy.middleware(knex, { header: 'x-client-id' }));

app.get('/', function (req, res, next) {
  req.knex.select().from('$_users').then(function (users) {
    res.send(users);
  }, next);
});
```

The `knextancy.middleware` expects two parameters:

* `knex` instance;
* `options.header` the name of the HTTP header that will contain the tenant id.

## Tests

To run the tests using [Docker Compose](https://docs.docker.com/compose/):

```bash
docker-compose run test
```
