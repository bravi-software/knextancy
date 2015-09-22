import knex from 'knex';
import { override, before, after } from './override';


const debug = require('./debug')('client-multi-tenant');


export function buildConfig (config, tenantId) {
  const multitenantConfig = { ...(config || {}) };

  multitenantConfig.tenantId = tenantId;
  multitenantConfig.migrations = {
    ...(multitenantConfig.migrations || {}),
    // custom migration with the table name prefix
    tableName: `${tenantId}_${(multitenantConfig.migrations.tableName || 'knex_migrations')}`,
  };

  return multitenantConfig;
}


export function install () {
  Object.defineProperty(knex.Client.prototype, 'tenantId', {
    get: function() {
      return this.config.tenantId;
    },
  });

  override(knex.Client.prototype.QueryBuilder.prototype, 'toSQL', after(function(sql) {
    debug('knex.Client.prototype.QueryBuilder.prototype.toSQL', arguments);
    sql.sql = applyTenant(sql.sql, this.client.tenantId);
    return sql;
  }));

  override(knex.Client.prototype.Raw.prototype, 'set', before(function(sql, bindings) {
    debug('knex.Client.prototype.Raw.prototype.set', arguments);
    const tenantSQL = applyTenant(sql, this.client.tenantId);
    return [tenantSQL, bindings];
  }));

  override(knex.Client.prototype.SchemaBuilder.prototype, 'toSQL', after(function(sql) {
    debug('knex.Client.prototype.SchemaBuilder.prototype.toSQL', arguments);

    sql.forEach(q => {
      q.sql = applyTenant(q.sql, this.client.tenantId);
    });

    return sql;
  }));

  override(knex.Client.prototype.Runner.prototype, 'query', after(function(promise, originalArgs) {
    debug('knex.Client.prototype.Runner.prototype.query', arguments);
    const options = originalArgs[0].options;

    const client = this.client;
    return promise.then(function(result) {
      if (!options || !options.nestTables) return result;

      return result.map(function (row) {
        const processedRow = {};

        Object.keys(row).forEach(function (tableJoinName) {
          processedRow[unapplyTenant(tableJoinName, client.tenantId)] = row[tableJoinName];
        });

        return processedRow;
      });
    });
  }));
}


function unapplyTenant (sql, tenant) {
  const regexp = new RegExp('^(' + tenant + '+_)');
  return sql.replace(regexp, '$_');
}


function applyTenant (sql, tenant) {
  return sql.replace(/\$_/g, tenant + '_');
}
