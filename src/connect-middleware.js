/**
  Middleware that populates
 */
export default function (setupTenant) {
  return function (baseKnex, options) {
    const opts = options || {};
    const header = opts.header || 'x-client-id';

    return async function middleware (req, res, next) {
      const tenantId = req.header(header);
      if (typeof tenantId === 'undefined') {
        return next(`Missing ${header} header`);
      }

      req.knex = await setupTenant(baseKnex, tenantId);

      next();
    };
  };
}
