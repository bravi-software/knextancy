var debug = require('debug');


module.exports = function (namespace) {
  return debug('knextancy:' + (namespace || '*'));
};
