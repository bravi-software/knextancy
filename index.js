// setup ES6 Proxy shim
require('harmony-reflect');


module.exports = function (baseKnex, tenant) {
  var proxyKnex = knex({ __client__: proxyClientTenant(baseKnex.client, tenant)});
  return proxyKnex.migrate.latest();
};
