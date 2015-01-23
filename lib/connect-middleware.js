var _ = require('underscore'),
    tenant = require('./tenant'),
    lru = require('lru-cache');

/**
  Middleware that populates
 */
module.exports = function (baseKnex, options, lruOptions) {
  var opts = options || {},
      header = opts.header || 'x-client-id',
      cache = lru(lruOptions || { max: 100 });

  return function (req, res, next) {
    var tenantId = req.header(header);

    if (_.isUndefined(tenantId)) { return next('Missing ' + header + ' header'); }

    var knex = cache.get(tenantId);

    var populate = function (k) {
      if (knex != k) cache.set(tenantId, k);
      req.knex = k;
      next();
    };

    if (!knex) return tenant(baseKnex, tenantId).then(populate, next);

    populate(knex);
  };
};
