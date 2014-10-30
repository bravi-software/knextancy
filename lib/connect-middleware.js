var _ = require('underscore'),
    tenant = require('./tenant');

/**
  Middleware that populates
 */
module.exports = function (baseKnex, options) {
  var opts = options || {},
      header = opts.header || 'x-client-id';

  return function (req, res, next) {
    var tenantId = req.header(header);

    if (_.isUndefined(tenantId)) { return next('Missing ' + header + ' header'); }

    var populate = function (knex) {
      req.knex = knex;
      next();
    };

    tenant(baseKnex, tenantId).then(populate, next);
  };
};
