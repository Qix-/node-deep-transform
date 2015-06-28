'use strict';

require('should');

var deepTransform = require('./');

it('should make a function', function() {
  var trans = deepTransform({
    foo: function() {},
    bar: {
      qux: function() {},
      qix: function() {},
      baz: {
        buzz: function() {}
      }
    }
  });

  trans.should.be.a.Function();
});

it('should reject non-objects', function() {
  (function integer() {
    var trans = deepTransform(12345);
  }).should.throw();
  (function string() {
    var trans = deepTransform('Hello!');
  }).should.throw();
});

it('should not reject arrays', function() {
  (function array() {
    var trans = deepTransform([0, 2, 4]);
  }).should.not.throw();
});

it('should perform a simple replace', function() {
  var trans = deepTransform({foo: function() { return 'bar'; }});
  var obj = {foo: 'nope'};
  trans(obj);
  obj.foo.should.equal('bar');
});

it('should perform a simple transform', function() {
  var trans = deepTransform({foo: function(v) { return v + 'bar'; }});
  var obj = {foo: 'foo'};
  trans(obj);
  obj.foo.should.equal('foobar');
});

it('should perform a deep transform', function() {
  var trans = deepTransform({
    foo: function(v) { return 10 * v; },
    bar: {
      qux: function() { return 'qix'; },
      baz: function(v) { v.push(1234); return v; }
    }
  });

  var obj = {
    foo: 14,
    bar: {
      qux: 'santa',
      baz: [1, 2, 3, 4]
    }
  };

  obj = trans(obj);

  obj.foo.should.equal(140);
  obj.bar.should.be.an.Object();
  obj.bar.qux.should.equal('qix');
  obj.bar.baz.should.be.instanceOf(Array).and.have.lengthOf(5);
  obj.bar.baz.should.have.property(4, 1234);
});

it('should ignore non-present properties', function() {
  var trans = deepTransform({
    foo: function(v) { return 10 * v; },
    bar: {
      qux: function() { return 'qix'; },
      baz: function(v) { v.push(1234); return v; }
    }
  });

  var obj = {
    bar: {
      qux: 'santa',
      baz: [1, 2, 3, 4]
    }
  };

  obj = trans(obj);

  obj.should.not.have.property('foo');
  obj.bar.should.be.an.Object();
  obj.bar.qux.should.equal('qix');
  obj.bar.baz.should.be.instanceOf(Array).and.have.lengthOf(5);
  obj.bar.baz.should.have.property(4, 1234);
});
