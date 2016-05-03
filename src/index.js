import tenant from './tenant';
import middleware from './connect-middleware';


// Use ES5 module export for compatibility with those not using ES6
module.exports = {
  tenant,
  middleware,
};
