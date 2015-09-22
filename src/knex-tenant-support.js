var knex = require('knex');
var _ = require('underscore');
var override = require('./override').override;
var before = require('./override').before;
var after = require('./override').after;
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

  override(knex.Client.prototype.QueryBuilder.prototype, 'toSQL', after(function(sql) {
    debug('knex.Client.prototype.QueryBuilder.prototype.toSQL', arguments);
    sql.sql = applyTenant(sql.sql, this.client.tenantId);
    return sql;
  }));

  override(knex.Client.prototype.Raw.prototype, 'set', before(function(sql, bindings) {
    debug('knex.Client.prototype.Raw.prototype.set', arguments);
    sql = applyTenant(sql, this.client.tenantId);
    return [sql, bindings];
  }));

  override(knex.Client.prototype.SchemaBuilder.prototype, 'toSQL', after(function(sql) {
    debug('knex.Client.prototype.SchemaBuilder.prototype.toSQL', arguments);
    var client = this.client;

    sql.forEach(function (sql) {
      sql.sql = applyTenant(sql.sql, client.tenantId);
    });

    return sql;
  }));

  override(knex.Client.prototype.Runner.prototype, 'query', after(function(promise, originalArgs) {
    debug('knex.Client.prototype.Runner.prototype.query', arguments);
    var options = originalArgs[0].options;

    var client = this.client;
    return promise.then(function(result) {
      if (!options || !options.nestTables) return result;

      return result.map(function (row) {
        var processedRow = {};

        Object.keys(row).forEach(function (tableJoinName) {
          processedRow[unapplyTenant(tableJoinName, client.tenantId)] = row[tableJoinName];
        });

        return processedRow;
      });
    });
  }));
};


function unapplyTenant (sql, tenant) {
  var regexp = new RegExp('^('+tenant+'+_)');
  return sql.replace(regexp, '$_');
}


function applyTenant (sql, tenant) {
  return sql.replace(/\$_/g, tenant + '_');
}
