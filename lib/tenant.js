var knex = require('knex'),
    proxyClientTenant = require('./proxy-client-tenant');


module.exports = function (baseKnex, tenantId) {
  var proxyKnex = knex({ __client__: proxyClientTenant(baseKnex.client, tenantId)});
  proxyKnex.tenantId = tenantId;
  return proxyKnex.migrate.latest().then(function () {
    return proxyKnex.seed.run();
  }).then(function () {
    return proxyKnex;
  });
};
