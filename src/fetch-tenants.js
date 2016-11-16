const REGEX_TENANT = /^([^_]+)_.*$/;


const clientsFetchTenants = {
  mysql(knex) {
    return knex.raw(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = (SELECT database())
        AND table_name LIKE '%_knex_migrations'
    `).then(([rows]) => rows.map((row) => row.table_name));
  },
  pg(knex) {
    return knex.raw(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = (SELECT current_schema())
        AND table_name LIKE '%_knex_migrations'
    `).then(({rows}) => rows.map((row) => row.table_name));
  },
};


/**
 * Fetch all the tenants available in the current DB.
 **/
export default async function (knex) {
  const { client } = knex.client.config;
  const fetchTenants = clientsFetchTenants[client];
  if (!fetchTenants) {
    throw new Error(`Current client ${client} has no support yet to fetch the tenant ids.`);
  }

  const tables = await fetchTenants(knex);

  return tables.map((table) => table.replace(REGEX_TENANT, '$1'));
}
