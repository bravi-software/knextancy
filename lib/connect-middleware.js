var tenant = require('./tenant');

/**
  Middleware that populates
 */
module.exports = function (baseKnex, options) {
  return function (req, res, next) {
    var tenantId = req.header(options.header) || '1';

    var populate = function (knex) {
      req.knex = knex;
      next();
    };

    tenant(baseKnex, tenantId).then(populate, next);
  };
};
