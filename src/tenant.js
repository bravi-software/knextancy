import knex from 'knex';
import PromiseAsyncCache from 'promise-async-cache';
import * as knexTenantSupport from './knex-tenant-support';


const debug = require('./debug')('tenant');

let isMultiTenantSupportInstalled = false;

/**
 * Keep knex tenants in memory and handle race conditions
 */
const cache = new PromiseAsyncCache({
  /**
   * Build knex tenant and load it to the cache
   * @param tenantId
   */
  async load (tenantId, baseKnex) {
    if (!isMultiTenantSupportInstalled) {
      try {
        debug('installing knextancy');
        knexTenantSupport.install();
        isMultiTenantSupportInstalled = true;
      } catch (err) {
        console.error('Error installing knex multi tenant support', err.stack || err);
        throw err;
      }
    }

    debug('building knex for new tenant %d', tenantId);
    const proxyKnex = knex(knexTenantSupport.buildConfig(baseKnex.client.config, tenantId));

    Object.defineProperty(proxyKnex, 'tenantId', {
      get: function() {
        return this.client.tenantId;
      },
    });

    debug('initializing multi tenant database');
    debug('running migration tasks');
    await proxyKnex.migrate.latest();

    debug('running seed tasks');
    await proxyKnex.seed.run();

    return proxyKnex;
  },
});


export default async function (baseKnex, tenantId) {
  try {
    return cache.get(tenantId, baseKnex);
  } catch (err) {
    console.error('Error on initializing the multi tenant database', err.stack || err);
    throw err;
  }
}
