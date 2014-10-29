// setup ES6 Proxy shim
require('harmony-reflect');


var knex = require('knex'),
    proxyClientTenant = require('./lib/proxy-client-tenant');


var baseKnex = knex(require('./knexfile').development);


var proxyKney = knex({ __client__: proxyClientTenant(baseKnex.client, 'tenant-1')});


proxyKney.migrate.latest().then(function () {
  console.log('migrated');

  proxyKney('$tenant:users').where({
    name: 'Test'
  }).select('name').then(function (users) {
    console.log(users);
  }, function (err) {
    console.log(err);
  });
});


console.log('started');
