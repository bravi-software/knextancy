import tenant from './tenant';

/**
  Middleware that populates
 */
export default function (baseKnex, options) {
  const opts = options || {};
  const header = opts.header || 'x-client-id';

  return function middleware (req, res, next) {
    const tenantId = req.header(header);
    if (typeof tenantId === 'undefined') {
      return next(`Missing ${header} header`);
    }

    const populate = function onPopulate (k) {
      req.knex = k;
      next();
    };

    tenant(baseKnex, tenantId).then(populate, next);
  };
}
