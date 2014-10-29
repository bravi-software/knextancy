var knex = require('knex'),
    proxyClientTenant = require('./proxy-client-tenant');


module.exports = function (baseKnex, tenant) {
  var proxyKnex = knex({ __client__: proxyClientTenant(baseKnex.client, tenant)});
  return proxyKnex.migrate.latest().then(function () {
    return proxyKnex;
  });
};
