var knextancy = require('./knextancy');

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

    knextancy(baseKnex, tenantId).then(populate, next);
  };
};
