var knex = require('knex'),
    proxyClientTenant = require('./proxy-client-tenant'),
    Promise = require('rsvp').Promise;

var cache = {};
var waiting = {};


module.exports = function (baseKnex, tenantId) {
  return new Promise(function (resolve, reject) {
    var result = cache[tenantId];
    if (result) {
      resolve(result);
      return;
    }

    var promises = waiting[tenantId];
    if (!promises) { promises = waiting[tenantId] = []; }

    promises.push({ resolve: resolve, reject: reject });

    if (promises.length > 1) { return; }

    var proxyKnex = knex({ __client__: proxyClientTenant(baseKnex.client, tenantId)});
    proxyKnex.tenantId = tenantId;

    proxyKnex.migrate.latest().then(function () {
      return proxyKnex.seed.run();
    }).then(function () {
      cache[tenantId] = proxyKnex;
      promises.forEach(function (p) {
        p.resolve(proxyKnex);
      });
      delete waiting[tenantId];
    }).catch(function () {
      promises.forEach(function (p) {
        p.reject(proxyKnex);
      });
      delete waiting[tenantId];
    });
  });
};
