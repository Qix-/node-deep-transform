'use strict';

module.exports = function deepTransform(template) {
  if (typeof template !== 'object') {
    throw new Error('Expected object');
  }

  var transformations = [];
  var indexObject = function(obj, index) {
    for (var k in obj) {
      if (!obj.hasOwnProperty(k)) {
        continue;
      }

      var v = obj[k];

      switch (typeof v) {
      case 'function':
        transformations.push([index.concat(k), v]);
        break;
      case 'object':
        indexObject(v, index.concat(k));
        break;
      }
    }
  };
  indexObject(template, []);

  return function(obj) {
    if (!obj) {
      return;
    }

    transforms:
    for (var i = 0, len = transformations.length; i < len; i++) {
      var path = transformations[i][0];
      var node = path.pop();
      var fn = transformations[i][1];
      var cur = obj;
      for (var j = 0; j < path.length; j++) {
        cur = cur[path[j]];
        if (!cur) {
          continue transforms;
        }
      }

      if (!cur[node]) {
        continue;
      }

      cur[node] = fn(cur[node], obj);
    }

    return obj;
  };
};
