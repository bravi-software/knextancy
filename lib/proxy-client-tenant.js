var _ = require('underscore');


module.exports = function proxyClientTenant (client, tenant) {
  var proxy = new Proxy(client, {
    get: function (target, name) {
      var value = target[name];

      if (name === 'migrationConfig') {
        return _.extend(target.migrationConfig || {}, {

          // custom migration with the table name prefix
          tableName: tenant + ':' + target.migrationConfig.tableName
        });
      }

      if (name === 'QueryBuilder') {
        return function () {
          var builder = new client.QueryBuilder();
              toSQL = builder.toSQL;

          builder.toSQL = function () {
            var sql = toSQL.apply(this, arguments);

            sql.sql = sql.sql.replace('$tenant', tenant);
            return sql;
          };

          return builder;
        };
      }

      if (name === 'SchemaBuilder' && value) {
        return function () {
          var builder = new client.SchemaBuilder();
              toSQL = builder.toSQL;

          builder.toSQL = function () {
            var sql = toSQL.apply(this, arguments);

            sql.forEach(function (sql) {
              sql.sql = sql.sql.replace('$tenant', tenant);
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
