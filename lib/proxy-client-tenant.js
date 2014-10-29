var _ = require('underscore');


module.exports = function proxyClientTenant (client, tenant) {
  var proxy = new Proxy(client, {
    get: function (target, name) {

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
    }
  });


  return proxy;
};
