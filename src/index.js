import fetchTenants from './fetch-tenants';
import setupTenant from './tenant';
import middleware from './connect-middleware';
import setupAllTenants from './setup-all-tenants';


// Use ES5 module export for compatibility with those not using ES6
module.exports = {
  fetchTenants,
  tenant: setupTenant,
  middleware: middleware(setupTenant),
  setupAllTenants: setupAllTenants(setupTenant, fetchTenants),
};
