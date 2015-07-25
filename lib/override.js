/**
 * Based on http://me.dt.in.th/page/JavaScript-override
 */
module.exports.override = function (object, methodName, callback) {
  object[methodName] = callback(object[methodName]);
};


module.exports.before = function (extraBehavior) {
  return function(original) {
    return function() {
      return original.apply(this, extraBehavior.apply(this, arguments));
    };
  };
};


module.exports.after = function (extraBehavior) {
  return function(original) {
    return function() {
      return extraBehavior.call(this, original.apply(this, arguments), arguments);
    };
  };
};
