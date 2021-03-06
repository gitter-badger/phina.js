/*
 *
 */



/*
 * tm namespace
 */
var phina = phina || {};

;(function() {

  phina.method('isNode', function() {
    return (typeof module !== 'undefined');
  });

  phina.method('namespace', function(fn) {
    fn.call(this);
  });

  var ns = phina.isNode() ? global : window;

  /*
   * global
   */
  phina.accessor('global', {
    get: function() {
      return ns;
    },
  });

  // support node.js
  if (phina.isNode()) {
    module.exports = phina;
  }

  ns.phina = phina;

})(this);


phina.namespace(function() {

  /**
   * @member phina
   * @static
   * @method createClass
   * クラスを生成
   */
  phina.method('createClass', function(params) {
    var props = {};

    var _class = function() {
      var instance = new _class.prototype._creator();
      _class.prototype.init.apply(instance, arguments);
      return instance;
    };

    if (params.superClass) {
      _class.prototype = Object.create(params.superClass.prototype);
      params.init.owner = _class;
      _class.prototype.superInit = function() {
        var caller = this.superInit.caller;
        var subclass = caller.owner;
        var superclass = subclass.prototype.superClass;
        var superInit = superclass.prototype.init;

        superInit.apply(this, arguments);
      };
      _class.prototype.constructor = _class;
    }

    _class.prototype.$extend(params);
    _class.prototype.selfClass = _class;

    // accessor
    if (params._accessor) {
      _class.prototype = Object.create(_class.prototype, params._accessor);
    }

    _class.prototype._creator = function() { return this; };
    _class.prototype._creator.prototype = _class.prototype;

    // static method
    if (params._static) {
      _class.$extend(params._static);
    }

    return _class;
  });

  var chachedClasses = {};
  /*
   * 
   */
  phina.method('using', function(path) {
    if (!path) {
      return phina.global;
    }
    
    var pathes = path.split(/[,.\/ ]|::/);
    var current = phina.global;

    pathes.forEach(function(p) {
      current = current[p] || (current[p]={});
    });

    return current;
  });
  
  /*
   * 
   */
  phina.method('register', function(path, _class) {
    var pathes = path.split(/[,.\/ ]|::/);
    var className = pathes.last;
    var parentPath = path.substring(0, path.lastIndexOf('.'));
    var parent = phina.using(parentPath);

    parent[className] = _class;

    return _class;
  });

  /**
   * @member phina
   * @static
   * @method define
   * クラスを定義
   */
  phina.method('define', function(path, params) {
    if (params.superClass) {
      if (typeof params.superClass === 'string') {
        params.superClass = phina.using(params.superClass);
      }
      else {
        params.superClass = params.superClass;
      }
    }

    var _class = phina.createClass(params);
    _class.prototype.accessor('className', {
      get: function() {
        return path;
      },
    });

    phina.register(path, _class);

    return _class;
  });


  phina.method('globalize', function() {
    phina.forIn(function(key, value) {

      value.forIn(function(key, value) {
        phina.global[key] = value;
      });
    });
  });

});







