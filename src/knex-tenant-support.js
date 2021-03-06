import knex from 'knex';
import QueryBuilder from 'knex/lib/query/builder';
import Raw from 'knex/lib/raw';
import Runner from 'knex/lib/runner';
import SchemaBuilder from 'knex/lib/schema/builder';

import { override, before, after } from './override';
import createDebug from './debug';


const debug = createDebug('client-multi-tenant');


/**
 * Build knex tenant configuration changing details related to multitenant
 */
export function buildConfig (config, tenantId) {
  const multitenantConfig = {
    ...(config || {}),
    tenantId,
  };

  multitenantConfig.migrations = {...(multitenantConfig.migrations || {})};

  // custom migration with the table name prefix
  const tableName = multitenantConfig.migrations.tableName || 'knex_migrations';
  multitenantConfig.migrations.tableName = `${tenantId}_${(tableName)}`;

  return multitenantConfig;
}


/**
 * Installs the tenant monkey patch on knex.
 *
 * It overrides some base knex functions changing the original behavior to
 * include multitenant configurations such as the tenant prefix in every table.
 */
export function install () {
  Object.defineProperty(knex.Client.prototype, 'tenantId', {
    get: function() {
      return this.config.tenantId;
    },
  });

  override(QueryBuilder.prototype, 'toSQL', after(function(sql) {
    debug('knex.Client.prototype.QueryBuilder.prototype.toSQL', arguments);
    sql.sql = applyTenant(sql.sql, this.client.tenantId);
    return sql;
  }));

  override(Raw.prototype, 'set', before(function(sql, bindings) {
    debug('knex.Client.prototype.Raw.prototype.set', arguments);
    const tenantSQL = applyTenant(sql, this.client.tenantId);
    return [tenantSQL, bindings];
  }));

  override(SchemaBuilder.prototype, 'toSQL', after(function(sql) {
    debug('knex.Client.prototype.SchemaBuilder.prototype.toSQL', arguments);
    return sql.map(q => {
      q.sql = applyTenant(q.sql, this.client.tenantId);
      return q;
    });
  }));

  override(Runner.prototype, 'query', after(async function(promise, originalArgs) {
    debug('knex.Client.prototype.Runner.prototype.query', arguments);
    const options = originalArgs[0].options;

    const result = await promise;
    if (!options || !options.nestTables) {
      return result;
    }

    return result.map(row => {
      return Object.keys(row).reduce((processedRow, tableJoinName) => {
        processedRow[unapplyTenant(tableJoinName, this.client.tenantId)] = row[tableJoinName];
        return processedRow;
      }, {});
    });
  }));
}


function unapplyTenant (sql, tenant) {
  const regexp = new RegExp(`^(${tenant}_)`);
  return sql.replace(regexp, '$_');
}


function applyTenant (sql, tenant) {
  return sql.replace(/\$_/g, tenant + '_');
}
