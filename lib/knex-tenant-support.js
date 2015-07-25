var knex = require('knex');
var _ = require('underscore');
var debug = require('./debug')('client-multi-tenant');


exports.buildConfig = function (config, tenantId) {
  var multitenantConfig = _.clone(config || {});

  multitenantConfig.tenantId = tenantId;

  var migrationsMultitenantConfig = _.clone(multitenantConfig.migrations || {});
  multitenantConfig.migrations = _.extend(migrationsMultitenantConfig, {
    // custom migration with the table name prefix
    tableName: tenantId + '_' + (multitenantConfig.migrations.tableName || 'knex_migrations')
  });

  return multitenantConfig;
};


exports.install = function () {
  Object.defineProperty(knex.Client.prototype, 'tenantId', {
    get: function() {
      return this.config.tenantId;
    }
  });

  var originalQueryBuilderToSQL = knex.Client.prototype.QueryBuilder.prototype.toSQL;
  knex.Client.prototype.QueryBuilder.prototype.toSQL = function () {
    debug('knex.Client.prototype.QueryBuilder.prototype.toSQL', arguments);
    var sql = originalQueryBuilderToSQL.apply(this, arguments);

    sql.sql = applyTenant(sql.sql, this.client.tenantId);

    return sql;
  };

  var originalRawSet = knex.Client.prototype.Raw.prototype.set;
  knex.Client.prototype.Raw.prototype.set = function (sql, bindings) {
    debug('knex.Client.prototype.Raw.prototype.set', arguments);
    sql = applyTenant(sql, this.client.tenantId);

    var builder = originalRawSet.call(this, sql, bindings);

    return builder;
  };

  var originalSchemaBuilderToSQL = knex.Client.prototype.SchemaBuilder.prototype.toSQL;
  knex.Client.prototype.SchemaBuilder.prototype.toSQL = function () {
    debug('knex.Client.prototype.SchemaBuilder.prototype.toSQL', arguments);
    var client = this.client;
    var sql = originalSchemaBuilderToSQL.apply(this, arguments);

    sql.forEach(function (sql) {
      sql.sql = applyTenant(sql.sql, client.tenantId);
    });

    return sql;
  };

  var originalQuery = knex.Client.prototype.Runner.prototype.query;
  knex.Client.prototype.Runner.prototype.query = function (obj) {
    debug('knex.Client.prototype.Runner.prototype.query', arguments);
    var client = this.client;
    return originalQuery.apply(this, arguments).then(function(result) {
      if (!obj.options || !obj.options.nestTables) return result;

      return result.map(function (row) {
        var processedRow = {};

        Object.keys(row).forEach(function (tableJoinName) {
          processedRow[unapplyTenant(tableJoinName, client.tenantId)] = row[tableJoinName];
        });

        return processedRow;
      });

    });
  };
};


function unapplyTenant (sql, tenant) {
  var regexp = new RegExp('^('+tenant+'+_)');
  return sql.replace(regexp, '$_');
}


function applyTenant (sql, tenant) {
  return sql.replace(/\$_/g, tenant + '_');
}
