/**
 * Allow setup all tenants at once.
 */
export default function (setupTenant, fetchTenants) {
  return async function (baseKnex) {
    const tenants = await fetchTenants(baseKnex);

    for (const tenantId of tenants) {
      await setupTenant(baseKnex, tenantId);
    }
  };
}
