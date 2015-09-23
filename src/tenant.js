import knex from 'knex';
import * as knexTenantSupport from './knex-tenant-support';

const debug = require('./debug')('tenant');

const cache = {};
const waiting = {};
let isMultiTenantSupportInstalled = false;

export default function (baseKnex, tenantId) {
  if (!isMultiTenantSupportInstalled) {
    try {
      debug('installing knextancy');
      knexTenantSupport.install();
      isMultiTenantSupportInstalled = true;
    } catch (e) {
      console.error('Error installing knex multi tenant support', e, e.stack);
      throw e;
    }
  }

  return new Promise(function (resolve, reject) {
    const result = cache[tenantId];
    if (result) {
      debug('getting knex for tenant %d from cache', tenantId);
      resolve(result);
      return;
    }

    let promises = waiting[tenantId];
    if (!promises) { promises = waiting[tenantId] = []; }

    promises.push({ resolve, reject });

    if (promises.length > 1) {
      debug('the knex for this tenant %d is already been built', tenantId);
      return;
    }

    debug('building knex for new tenant %d', tenantId);
    const proxyKnex = knex(knexTenantSupport.buildConfig(baseKnex.client.config, tenantId));

    Object.defineProperty(proxyKnex, 'tenantId', {
      get: function() {
        return this.client.tenantId;
      },
    });

    debug('initializing multi tenant database');
    proxyKnex.migrate.latest().then(function () {
      return proxyKnex.seed.run();
    }).then(function () {
      cache[tenantId] = proxyKnex;
      promises.forEach(p => p.resolve(proxyKnex));
      delete waiting[tenantId];
    }).catch(function (e) {
      promises.forEach(p => p.reject(proxyKnex));
      delete waiting[tenantId];

      console.error('Error on initializing the multi tenant database', e, e.stack);
    });
  });
}
