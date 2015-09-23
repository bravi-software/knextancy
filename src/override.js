/**
 * Based on http://me.dt.in.th/page/JavaScript-override
 */
export function override (object, methodName, callback) {
  object[methodName] = callback(object[methodName]);
}


export function before (extraBehavior) {
  return function(original) {
    return function() {
      return original.apply(this, extraBehavior.apply(this, arguments));
    };
  };
}


export function after (extraBehavior) {
  return function(original) {
    return function() {
      return extraBehavior.call(this, original.apply(this, arguments), arguments);
    };
  };
}
