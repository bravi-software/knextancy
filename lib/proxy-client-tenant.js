var _ = require('underscore');


module.exports = function proxyClientTenant (client, tenant) {
  installResponseProxy(client, tenant);

  var proxy = new Proxy(client, {
    get: function (target, name) {
      var value = target[name];

      if (name === 'migrationConfig') {
        var migrationConfig = _.clone(target.migrationConfig || {});

        return _.extend(migrationConfig, {
          // custom migration with the table name prefix
          tableName: tenant + '_' + (target.migrationConfig.tableName || 'knex_migrations')
        });
      }

      if (name === 'QueryBuilder') {
        return function () {
          var builder = new client.QueryBuilder(),
              toSQL = builder.toSQL;

          builder.toSQL = function () {
            var sql = toSQL.apply(builder, arguments);

            sql.sql = applyTenant(sql.sql, tenant);

            return sql;
          };

          return builder;
        };
      }

      if (name === 'Raw') {
        return function (sql, bindings) {
          sql = applyTenant(sql, tenant);

          var builder = new client.Raw(sql, bindings);

          return builder;
        };
      }

      if (name === 'SchemaBuilder' && value) {
        return function () {
          var builder = new client.SchemaBuilder(),
              toSQL = builder.toSQL;

          builder.toSQL = function () {
            var sql = toSQL.apply(builder, arguments);

            sql.forEach(function (sql) {
              sql.sql = applyTenant(sql.sql, tenant);
            });

            return sql;
          };

          return builder;
        };
      }

      return value;
    }
  });

  return proxy;
};


function installResponseProxy (client, tenant) {
  var originalProcess = client.Runner.prototype.processResponse;
  client.Runner.prototype.processResponse = function (obj) {
    var result = originalProcess.apply(this, arguments);
    if (!obj.options || !obj.options.nestTables) return result;

    return result.map(function (row) {
      var processedRow = {};

      Object.keys(row).forEach(function (tableJoinName) {
        processedRow[unapplyTenant(tableJoinName, tenant)] = row[tableJoinName];
      });

      return processedRow;
    });
  };
}


function unapplyTenant (sql, tenant) {
  var regexp = new RegExp('^('+tenant+'+_)');
  return sql.replace(regexp, '$_');
}


function applyTenant (sql, tenant) {
  return sql.replace(/\$_/g, tenant + '_');
}
