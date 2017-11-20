(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("initialize.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gapp = exports.glview = undefined;

var _tdSetup = require('tdSetup');

var _tdTable = require('tdTable');

var _tdTable2 = _interopRequireDefault(_tdTable);

var _okNoga = require('okNoga');

var _okNoga2 = _interopRequireDefault(_okNoga);

var _ok3Dploca = require('ok3Dploca');

var _ok3Dploca2 = _interopRequireDefault(_ok3Dploca);

var _okPolyTable = require('okPolyTable');

var _okPolyTable2 = _interopRequireDefault(_okPolyTable);

var _swpUI = require('swpUI');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var objects = [];
var currentObj = 0;
var glview = exports.glview = void 0,
    gapp = exports.gapp = 0;

document.addEventListener('DOMContentLoaded', function () {

  exports.glview = glview = new _tdSetup.World();

  objects.push(new _okPolyTable2.default());
  objects.push(new _tdTable2.default());
  objects.push(new _okNoga2.default());
  objects.push(new _ok3Dploca2.default());

  buildControls();

  bindButtons();

  console.log('Initialized app');
});

function buildControls() {

  var obj = objects[currentObj];

  glview.add(obj);

  var container = document.getElementById('controls');

  while (container.hasChildNodes()) {
    container.removeChild(container.lastChild);
  }

  for (var param in obj.parameters) {
    if (obj.parameters.hasOwnProperty(param)) {
      var p = obj.parameters[param];
      if (p.type === 'number') {
        var options = {
          label: param,
          min: p.min,
          max: p.max,
          default: p.v,
          step: 0.01,
          screen: 0.01,
          measure: p.unit
        };
        var control = new _swpUI.SwpNumber(container, options, obj);
        //console.log( p);       
      }
      if (p.type === 'choice') {
        //et control = new SwpChoice ( p );
      }
    }
  }
}

var nextObj = function nextObj() {

  glview.remove(objects[currentObj]);
  if (currentObj == objects.length - 1) {
    currentObj = 0;
  } else {
    currentObj++;
  }
  buildControls();
};

var prevObj = function prevObj() {

  glview.remove(objects[currentObj]);
  if (currentObj == 0) {
    currentObj = objects.length - 1;
  } else {
    currentObj--;
  }
  buildControls();
};

function bindButtons() {

  var prev = document.getElementById('prevObj');
  prev.onclick = function () {
    prevObj();
  };

  var next = document.getElementById('nextObj');
  next.onclick = function () {
    nextObj();
  };
  
  var arlink = document.getElementById('arlink');
  arlink.onclick = function () { 
    arlink.href = arlink.href 
      + "?N=" + objects[0].parameters.sides.v 
      + "&R=" + objects[0].parameters.radius.v 
      + "&H=" + objects[0].parameters.height.v ;
  };
  
}

function setMaterial(mat) {}

});

;require.register("ok3Dploca.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = ok3Dploca;

var _three = require('three');

var THREE = _interopRequireWildcard(_three);

var _glslCanvas = require('glslCanvas');

var _glslCanvas2 = _interopRequireDefault(_glslCanvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ParaNumber(v, min, max, unit) {

    this.type = 'number';
    this.v = v;
    this.min = min;
    this.max = max;
    this.unit = unit || '';
}

var ok3DplocaDefaultParams = {
    length: new ParaNumber(1.2, 0.2, 2.0, 'm'),
    width: new ParaNumber(0.6, 0.2, 2.0, 'm'),
    segments: new ParaNumber(8, .1, 16, ''),
    u: new ParaNumber(1, 0.5, 20.0, ''),
    v: new ParaNumber(1, 0.5, 20.0, ''),
    depth: new ParaNumber(0.02, 0, 0.1, 'm'),
    //
    cond: function cond() {
        return true;
        //return  this.legLower.v <= this.legUpper.v && 
        //        this.legUpper.v * 2 < this.width.v ;
    }
};

function ok3Dploca() {
    var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ok3DplocaDefaultParams;

    this.parameters = parameters;
    this.group = new THREE.Group();

    this.changed = false;

    var canv = createShader();
    this.shcanvas = canv.shCanvas;
    this.sandbox = canv.sandbox;
    this.sendToShader(this.parameters.u.v, this.parameters.v.v);

    this.material = new THREE.MeshPhongMaterial({ wireframe: false });

    var dispMap = new THREE.CanvasTexture(this.shcanvas);
    this.material.map = dispMap;
    this.material.displacementMap = dispMap;
    this.material.displacementScale = this.parameters.depth.v;
    this.material.map.needsUpdate = true;
    this.material.needsUpdate = true;

    this.build();
    //console.log(dispMap);
}

ok3Dploca.prototype.getMesh = function () {
    return this.group;
};

ok3Dploca.prototype.update = function (scene) {
    this.scene = scene;

    if (this.changed) {
        scene.remove(this.group);
        this.build();
        scene.add(this.group);
    }
};

ok3Dploca.prototype.isOK = function (para, v) {
    //temporery paramterers
    var tPara = Object.assign({}, this.parameters);
    tPara[para].v = v;
    return tPara.cond();
};

ok3Dploca.prototype.build = function () {

    //mat
    this.sendToShader(this.parameters.u.v, this.parameters.v.v);

    var dispMap = new THREE.CanvasTexture(this.shcanvas);

    //dispMap.needsUpdate= true;
    this.material.map = dispMap;
    this.material.displacementMap = dispMap;
    this.material.displacementScale = this.parameters.depth.v;
    this.material.map.needsUpdate = true;
    this.material.needsUpdate = true;

    //
    this.changed = false;

    this.group = new THREE.Group();

    var points = [];

    var aspekt = this.parameters.width.v / this.parameters.length.v;
    var geometry = new THREE.PlaneGeometry(this.p('length'), this.p('width'), 10 * this.p('segments'), aspekt * 10 * this.p('segments'));
    var mesh = new THREE.Mesh(geometry, this.material);

    mesh.translateY(.5);

    this.group.add(mesh);
};

ok3Dploca.prototype.p = function (paraname) {
    if (this.parameters.hasOwnProperty(paraname)) {
        return this.parameters[paraname].v;
    } else {
        return false;
    }
};

ok3Dploca.prototype.sendToShader = function (u, v) {
    this.sandbox.setUniform('u_vek', u, v);
};

var createShader = function createShader() {

    // 1 novi canvas ?
    var shCanvas = document.createElement('canvas');
    shCanvas.width = 512;
    shCanvas.height = 512;
    var sandbox = new _glslCanvas2.default(shCanvas);

    // 2 shader

    // Load only the Fragment Shader


    var string_frag_code = '\n\n    #ifdef GL_ES\n    precision mediump float;\n    #endif\n    \n    uniform vec2 u_resolution;\n    uniform vec2 u_mouse;\n    uniform float u_time;\n    uniform vec2 u_vek;\n    \n    float random (in vec2 st) { \n        return fract(sin(dot(st.xy,\n                             vec2(12.9898,78.233))) \n                    * 43758.5453123);\n    }\n    \n    // Value noise by Inigo Quilez - iq/2013\n    // https://www.shadertoy.com/view/lsf3WH\n    float noise(vec2 st) {\n        vec2 i = floor(st);\n        vec2 f = fract(st);\n        vec2 u = f*f*(3.0-2.0*f);\n        return mix( mix( random( i + vec2(0.0,0.0) ), \n                         random( i + vec2(1.0,0.0) ), u.x),\n                    mix( random( i + vec2(0.0,1.0) ), \n                         random( i + vec2(1.0,1.0) ), u.x), u.y);\n    }\n    \n    mat2 rotate2d(float angle){\n        return mat2(cos(angle),-sin(angle),\n                    sin(angle),cos(angle));\n    }\n    \n    float lines(in vec2 pos, float b){\n        float scale = 10.0;\n        pos *= scale;\n        return smoothstep(0.0,\n                        .5+b*.5,\n                        abs((sin(pos.x*3.1415)+b*2.0))*.5);\n    }\n    \n    void main() {\n        vec2 st = gl_FragCoord.xy/u_resolution.xy;\n        st.y *= u_resolution.y/u_resolution.x;\n    \n        vec2 pos = st.yx* u_vek;\n    \n        float pattern = pos.x;\n    \n        // Add noise\n        pos = rotate2d( noise(pos) ) * pos;\n        \n        // Draw lines\n        pattern = lines(pos,.5);\n    \n        gl_FragColor = vec4(vec3(pattern),1.0);\n    }';

    sandbox.load(string_frag_code);

    sandbox.setUniform("u_vek", 5.2, 2.3);

    //debug
    //var dbgdiv = document.getElementById('debug');
    //dbgdiv.appendChild(shCanvas);

    return { sandbox: sandbox, shCanvas: shCanvas };
};

});

;require.register("okNoga.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = okNoga;

var _three = require('three');

var THREE = _interopRequireWildcard(_three);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ParaNumber(v, min, max, unit) {

    this.type = 'number';
    this.v = v;
    this.min = min;
    this.max = max;
    this.unit = unit || '';
}

var okNogaDefaultParams = {
    length: new ParaNumber(0.6, 0.1, 1.2, 'm'),
    widthLower: new ParaNumber(0.05, 0.05, 0.15, 'm'),
    widthHigher: new ParaNumber(0.1, 0.05, 0.15, 'm'),
    segments: new ParaNumber(3, 2, 20, ''),
    taper: new ParaNumber(1, 0.5, 2.0, ''),
    sides: new ParaNumber(4, 3, 16, ''),
    cond: function cond() {
        return true;
        //return  this.legLower.v <= this.legUpper.v && 
        //        this.legUpper.v * 2 < this.width.v ;
    }
};

function okNoga() {
    var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : okNogaDefaultParams;

    this.parameters = parameters;
    this.group = new THREE.Group();
    this.material = new THREE.MeshLambertMaterial({ wireframe: false });
    //this.extrudeSettings = { steps:1 , amount: parameters.plocaD.v , bevelEnabled: false };
    this.changed = false;

    this.build();
}

okNoga.prototype.getMesh = function () {
    return this.group;
};

okNoga.prototype.update = function (scene) {
    this.scene = scene;
    if (this.changed) {
        scene.remove(this.group);
        this.build();
        scene.add(this.group);
    }
};

okNoga.prototype.isOK = function (para, v) {
    //temporery paramterers
    var tPara = Object.assign({}, this.parameters);
    tPara[para].v = v;
    return tPara.cond();
};

okNoga.prototype.build = function () {

    this.changed = false;

    this.group = new THREE.Group();

    var points = [];

    var segh = this.parameters.length.v / Math.ceil(this.parameters.segments.v) * 2;
    console.log(segh);
    for (var i = 0; i < Math.ceil(this.parameters.segments.v); i++) {
        var taper = this.parameters.taper.v + (1 - this.parameters.taper.v) / Math.ceil(this.parameters.segments.v) * i;
        points.push(new THREE.Vector2(this.parameters.widthLower.v * taper, segh * i));
        points.push(new THREE.Vector2(this.parameters.widthHigher.v * taper, segh * (i + 0.25)));
    }

    var geometry = new THREE.LatheGeometry(points, this.parameters.sides.v);
    var mesh = new THREE.Mesh(geometry, this.material);
    mesh.castShadow = true;
    this.group.add(mesh);
};

});

;require.register("okPolyTable.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = okPolyTable;

var _three = require('three');

var THREE = _interopRequireWildcard(_three);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ParaNumber(v, min, max, unit) {

    this.type = 'number';
    this.v = v;
    this.min = min;
    this.max = max;
    this.unit = unit || '';
}

var okPolyTableDefaultParams = {
    sides: new ParaNumber(5, 3, 12, ''),
    radius: new ParaNumber(0.3, 0.1, 0.8, 'm'),
    height: new ParaNumber(0.3, 0.2, 1.0, 'm'),

    cond: function cond() {
        return true;
    }
};

function okPolyTable() {
    var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : okPolyTableDefaultParams;

    this.parameters = parameters;

    this.group = new THREE.Group();
    this.material = new THREE.MeshStandardMaterial({ wireframe: false });

    this.extrudeSettings = { steps: 1, amount: 0.02, bevelEnabled: false };

    this.changed = false;

    this.build();
}

okPolyTable.prototype.build = function () {

    var N = Math.floor(this.parameters.sides.v);
    var H = this.parameters.height.v;
    var R = this.parameters.radius.v;
    var D = 0.02;

    this.changed = false;

    // this.group.matrix = new THREE.Matrix4();
    // this.group.updateMatrix();

    this.group = new THREE.Group();

    var mGrupa = new THREE.Group();

    // osnovne tocke
    var kut = Math.PI * 2 / N;
    var tocke = [];
    for (var i = 0; i < N; i++) {
        tocke.push(new THREE.Vector2(Math.sin(kut * i) * R, Math.cos(kut * i) * R));
    }

    //ploca
    var ploca2d = new THREE.Shape();
    ploca2d.fromPoints(tocke);
    var plocaExtrude = new THREE.ExtrudeGeometry(ploca2d, this.extrudeSettings);
    var ploca = new THREE.Mesh(plocaExtrude, this.material);

    ploca.castShadow = true;
    mGrupa.add(ploca);

    //noge
    for (var j = 0; j < N; j++) {

        var t1 = new THREE.Vector3(tocke[j].x, tocke[j].y, D);
        if (j != N - 1) var t2 = new THREE.Vector3(tocke[j + 1].x, tocke[j + 1].y, D);else var t2 = new THREE.Vector3(tocke[0].x, tocke[0].y, D);

        var tempVec = new THREE.Vector3((t1.x + t2.x) / 2, (t1.y + t2.y) / 2, 0);

        var vec = tempVec.clone();

        vec.normalize().multiplyScalar(H).add(tempVec);

        var noga2d = new THREE.Shape([t1, vec, t2]);

        var nogaExtrude = new THREE.ExtrudeGeometry(noga2d, this.extrudeSettings);
        var noga = new THREE.Mesh(nogaExtrude, this.material);

        //var pivot=new THREE.Object3D();
        noga.translateOnAxis(new THREE.Vector3().copy(tempVec).normalize(), tempVec.length());
        //pivot.add(noga);

        var axis = new THREE.Vector3().subVectors(t2, t1);
        axis.normalize();
        noga.rotateOnAxis(axis, Math.PI / 2);
        noga.position.z = -tempVec.length() + D;
        // noga.updateMatrix();

        noga.castShadow = true;

        mGrupa.add(noga);
    }

    mGrupa.rotateX(Math.PI / 2);
    mGrupa.translateZ(-H - D);

    mGrupa.castShadow = true;
    this.group.add(mGrupa);
};

okPolyTable.prototype.getMesh = function () {
    return this.group;
};

okPolyTable.prototype.update = function (scene) {
    this.scene = scene;
    if (this.changed) {
        scene.remove(this.group);
        this.build();
        scene.add(this.group);
    }
};

okPolyTable.prototype.isOK = function (para, v) {
    //temporery paramterers
    var tPara = Object.assign({}, this.parameters);
    tPara[para].v = v;
    return tPara.cond();
};

});

;require.register("swpUI.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// 16.9.2017.
// ------ SwpNumber -------
// kontrola za numerički unos pomoći vertikalnog skrolanja ili sweepanja
// TODO
// Trenutno je state kontrole unutar DOM-a , enkapsulirati state i refaktorirat 

var SwpNumber = exports.SwpNumber = function () {
    function SwpNumber(htmlEl, params, obj) {
        _classCallCheck(this, SwpNumber);

        //defaults for mouse event
        this.mevent = {
            down: false,
            target: undefined,
            lasty: 0.0,
            value: 0.0,
            screen: 0.01,
            max: 100,
            min: -100,
            step: 0.01,
            measure: "",
            time: 0
        };

        this.obj = obj;
        this.name = params.label;

        var outdiv = document.createElement('div');
        outdiv.className = "numberSweep noselect";
        outdiv.id = params.id || params.label;
        outdiv.setAttribute('screen', params.screen || 0.1);
        outdiv.setAttribute('min', params.min);
        outdiv.setAttribute('max', params.max);
        outdiv.setAttribute('measure', params.measure || "");
        outdiv.setAttribute('step', params.step || 1.0);

        var labelp = document.createElement('p');
        labelp.className = "label";
        labelp.innerText = params.label;
        outdiv.appendChild(labelp);

        var numberp = document.createElement('p');
        numberp.className = "nmb";
        numberp.innerText = params.default;
        outdiv.appendChild(numberp);

        this.mevent.screen = params.screen || 0.1;
        this.mevent.min = params.min;
        this.mevent.max = params.max;
        this.mevent.step = params.step || 1.0;
        this.mevent.measure = params.measure || "";
        this.mevent.value = params.value;

        this.nmb = numberp;
        this.changeValueText(params.default);

        this.activate(outdiv);
        htmlEl.appendChild(outdiv);
    }

    _createClass(SwpNumber, [{
        key: "activate",
        value: function activate(outdiv) {
            var _this = this;

            outdiv.addEventListener('mousedown', function (e) {
                _this.movestart(e);
            }, { passive: false });
            outdiv.addEventListener('touchstart', function (e) {
                _this.movestart(e);
            }, { passive: false });
            outdiv.addEventListener('dblclick', this.editNmb);
        }
    }, {
        key: "movestart",
        value: function movestart(event) {
            var _this2 = this;

            // console.log( this.mevent);
            if (this.mevent.down != true) {
                //event.preventDefault();
                //event.stopPropagation();

                this.mevent.down = true;
                this.mevent.target = event.currentTarget;
                if (event.changedTouches) {
                    this.mevent.lasty = event.changedTouches.item(0).screenY;
                    document.addEventListener('touchmove', function (e) {
                        _this2.move(e);
                    }, { passive: false });
                    document.addEventListener('touchend', function (e) {
                        _this2.moveend(e), { passive: false };
                    });
                } else {
                    this.mevent.lasty = event.screenY;
                    document.addEventListener('mousemove', function (e) {
                        _this2.move(e);
                    }, { passive: false });
                    document.addEventListener('mouseup', function (e) {
                        _this2.moveend(e), { passive: false };
                    });
                }
                this.mevent.screen = this.mevent.target.getAttribute('screen') || 0.1;
                this.mevent.min = this.mevent.target.getAttribute('min') || -100;
                this.mevent.max = this.mevent.target.getAttribute('max') || 100;
                this.mevent.step = this.mevent.target.getAttribute('step') || 0.1;
                this.mevent.measure = this.mevent.target.getAttribute('measure') || "";
                this.mevent.value = this.mevent.target.querySelector('.nmb').innerText.match(/\-*\d+\.+\d+|\-*\d+/)[0] / this.mevent.screen;
                var t = Date.now();
                if (t - this.mevent.time < 200) {
                    editNmb(event);
                }
                this.mevent.time = t;
            }
        }
    }, {
        key: "move",
        value: function move(event) {

            if (this.mevent.down == true) {
                //nisam siguran da li je ova provjera nužna..

                event.preventDefault();
                event.stopPropagation();

                if (event.changedTouches) {
                    var tmp = this.mevent.lasty - event.changedTouches.item(0).screenY;
                    this.mevent.lasty = event.changedTouches.item(0).screenY;
                } else {
                    var tmp = this.mevent.lasty - event.screenY;
                    this.mevent.lasty = event.screenY;
                }

                this.mevent.value += tmp;
                //console.log(this.mevent.value + "max :" + this.mevent.max);
                if (this.mevent.value * this.mevent.screen > this.mevent.max) {
                    this.mevent.value = this.mevent.max / this.mevent.screen;
                }
                if (this.mevent.value * this.mevent.screen < this.mevent.min) {
                    this.mevent.value = this.mevent.min / this.mevent.screen;
                }
                var steped = Math.ceil(this.mevent.value * this.mevent.screen / this.mevent.step) * this.mevent.step;
                var isitOK = this.obj.isOK(this.name, steped);
                console.log(isitOK);
                if (isitOK == false) {
                    return;
                }

                this.nmb.innerText = String(steped.toFixed(2)) + this.mevent.measure;

                //color changing TODO
                if (this.mevent.target.style.backgroundColor) {
                    color = this.mevent.target.style.backgroundColor.split(/rgb\(|\,|\)|\s/);
                    raspon = this.mevent.max - this.mevent.min;
                    var r = parseInt(256 * (this.mevent.value * this.mevent.screen + raspon / 2) / raspon);
                    var g = parseInt(color[3]);
                    var b = parseInt(color[5]);
                    this.mevent.target.style.backgroundColor = "rgb\(" + r + ',' + g + ',' + b + '\)';
                    // console.log("rgb\(" + r + ',' + g + ',' + b + '\)' );
                }

                // like a callback but more stupid

                this.obj.parameters[this.name].v = this.mevent.value * this.mevent.screen;
                this.obj.changed = true;

                //fire input event

                var ievent = new InputEvent('input', {
                    target: this.mevent.target,
                    bubbles: false,
                    cancelable: true
                });
                //   console.log("this.mevent  " + this.mevent.value);
                //   console.log("this.mevent scaled " + this.mevent.value * this.mevent.screen);
                this.mevent.target.value = this.mevent.value * this.mevent.screen;
                this.mevent.target.dispatchEvent(ievent);
            }
        }
    }, {
        key: "moveend",
        value: function moveend(event) {
            this.mevent.down = false;
            //this.mevent.target = undefined;
            this.mevent.lasty = 0.0;
            document.removeEventListener('mousemove', this.move);
            document.removeEventListener('mouseup', this.moveend);
            document.removeEventListener('touchmove', this.move);
            document.removeEventListener('touchstop', this.moveend);
        }
    }, {
        key: "editNmb",
        value: function editNmb(event) {
            var ni = document.getElementById('numbInput');
            if (ni) {
                document.body.removeChild(ni);
            }
            //console.log ( event.clientX + ", " + event.clientY);
            var inp = document.createElement('input');
            inp.id = "numbInput";
            inp.value = this.mevent.value * this.mevent.screen;
            inp.style = " display: table ; position: fixed; z-index: 5; left: " + this.mevent.target.offsetLeft + "px ; top: " + (this.mevent.target.offsetTop + 50) + "px; width: " + (this.mevent.target.offsetWidth - 5) + "px;" + "height: " + 30 + "px; background-color:" + (this.mevent.target.style.backgroundColor || window.getComputedStyle(this.mevent.target).backgroundColor) + ";";
            document.body.appendChild(inp);
            setTimeout(function () {
                document.getElementById('numbInput').focus();
            }, 0);
            ;

            inp.onchange = function () {
                ni = document.getElementById('numbInput');
                //console.log("submited: " + ni.value );
                this.mevent.value = ni.value;
                this.changeValueText(parseFloat(ni.value));
                document.body.removeChild(ni);
            };
            ni.onclick, ni.dblclick = function () {};

            document.onclick = function removeInp() {
                if (ni = document.getElementById('numbInput')) {
                    document.body.removeChild(ni);
                }
                document.removeEventListener('onclick', removeInp);
            };
        }
    }, {
        key: "changeValueText",
        value: function changeValueText(val) {
            this.mevent.value = val;
            if (val > this.mevent.max) {
                this.mevent.value = this.mevent.max;
            }
            if (val < this.mevent.min) {
                this.mevent.value = this.mevent.min;
            }
            var steped = Math.ceil(this.mevent.value / this.mevent.step) * this.mevent.step;
            this.nmb.innerText = String(steped.toFixed(2)) + this.mevent.measure;
        }
    }]);

    return SwpNumber;
}();

});

;require.register("tdSetup.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Cube = exports.World = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _three = require('three');

var THREE = _interopRequireWildcard(_three);

var _threeOrbitcontrols = require('three-orbitcontrols');

var _threeOrbitcontrols2 = _interopRequireDefault(_threeOrbitcontrols);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var World = exports.World = function () {
    function World() {
        _classCallCheck(this, World);

        this.objects = [];
        this.createScene();

        this.materials = [new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load("img/1.jpg") }), new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load("img/2.jpg") }), new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load("img/3.jpg") })];
    }

    _createClass(World, [{
        key: 'createScene',
        value: function createScene() {
            var _this = this;

            this.container = window['document'].getElementById('world');

            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(40, this.container.clientWidth / this.container.clientHeight, 0.01, 200);

            this.camera.position.y = 1;
            this.camera.position.z = 3;
            this.camera.lookAt(new THREE.Vector3(1, 1, 0));
            this.camera.matrixAutoUpdate = true;

            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.renderer.setClearColor(0xffffff);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
            this.container.appendChild(this.renderer.domElement);

            this.controls = new _threeOrbitcontrols2.default(this.camera, this.renderer.domElement);

            //AMBIENTALNO
            var light = new THREE.AmbientLight(0xeeeeee, 0.8);
            this.scene.add(light);

            //LAMPA
            var lamp = new THREE.DirectionalLight(0xaaaaaa, 0.9, 100, 1);
            lamp.position.x = 2;
            lamp.position.z = 2.5;
            //Set up shadow properties for the light
            lamp.castShadow = true;
            lamp.shadow.mapSize.width = 2048; // default
            lamp.shadow.mapSize.height = 2048; // default
            lamp.shadow.camera.near = 0.5; // default
            lamp.shadow.camera.far = 5000; // default
            this.scene.add(lamp);

            //TLO
            var tlo = new THREE.Mesh(new THREE.PlaneGeometry(500, 500, 50, 50), new THREE.ShadowMaterial());
            tlo.rotateX(-Math.PI / 2);
            tlo.receiveShadow = true;
            this.scene.add(tlo);

            window.addEventListener('resize', function () {
                _this.camera.aspect = _this.container.clientWidth / _this.container.clientHeight;
                _this.camera.updateProjectionMatrix();
                _this.renderer.setSize(_this.container.clientWidth, _this.container.clientHeight);
            }, false);

            this.render();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            requestAnimationFrame(function () {
                _this2.render();
            });

            this.objects.forEach(function (object) {
                object.update(_this2.scene);
            });

            this.renderer.render(this.scene, this.camera);
        }
    }, {
        key: 'add',
        value: function add(obj) {
            this.objects.push(obj);
            obj.getMesh().castShadow = true;
            this.scene.add(obj.getMesh());
        }
    }, {
        key: 'remove',
        value: function remove(mesh) {
            this.objects.pop(mesh);
            this.scene.remove(mesh.getMesh());
        }
    }, {
        key: 'getScene',
        value: function getScene() {
            return this.scene;
        }
    }, {
        key: 'changeMat',
        value: function changeMat(id) {

            var textureLoader = new THREE.TextureLoader();
            var texture = textureLoader.load("./img/" + (id + 1) + ".jpg");
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);

            this.objects[this.objects.length - 1].material.map = texture;
            this.objects[this.objects.length - 1].material.map.needsUpdate = true;
            this.objects[this.objects.length - 1].material.needsUpdate = true;
            this.objects[this.objects.length - 1].changed = true;
            console.log(this.objects[this.objects.length - 1]);
        }
    }]);

    return World;
}();

var Cube = exports.Cube = function () {
    function Cube(size) {
        _classCallCheck(this, Cube);

        this.geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
        this.material = new THREE.MeshBasicMaterial({
            color: 0x00ff00
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    _createClass(Cube, [{
        key: 'update',
        value: function update() {
            this.mesh.rotation.x += 0.01;
            this.mesh.rotation.y += 0.01;
        }
    }, {
        key: 'getMesh',
        value: function getMesh() {
            return this.mesh;
        }
    }]);

    return Cube;
}();

});

;require.register("tdTable.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = TableCC;

var _three = require('three');

var THREE = _interopRequireWildcard(_three);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ParaNumber(v, min, max, unit) {

    this.type = 'number';
    this.v = v;
    this.min = min;
    this.max = max;
    this.unit = unit || '';
}

var tableccDefaultParams = {
    length: new ParaNumber(1.2, 0.6, 3.0, 'm'),
    width: new ParaNumber(0.6, 0.4, 2.0, 'm'),
    height: new ParaNumber(0.65, 0.2, 1.5, 'm'),
    legUpper: new ParaNumber(0.15, 0.1, 0.5, 'm'),
    legLower: new ParaNumber(0.03, 0.01, 0.5, 'm'),
    legAngle: new ParaNumber(Math.PI / 4, 0, Math.PI / 2, 'rad'),
    plocaD: new ParaNumber(0.025, 0.02, 0.1, 'm'),
    cond: function cond() {
        return this.legLower.v <= this.legUpper.v && this.legUpper.v * 2 < this.width.v;
    }
};

function TableCC() {
    var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : tableccDefaultParams;

    this.parameters = parameters;

    this.group = new THREE.Group();
    this.material = new THREE.MeshStandardMaterial({ wireframe: false });

    this.extrudeSettings = { steps: 1, amount: parameters.plocaD.v, bevelEnabled: false };

    this.changed = false;

    this.build();
}

TableCC.prototype.build = function () {

    this.changed = false;

    // this.group.matrix = new THREE.Matrix4();
    // this.group.updateMatrix();

    this.group = new THREE.Group();

    var H = this.parameters.height.v;
    console.log(H);
    var W = this.parameters.width.v;
    var L = this.parameters.length.v;
    var lgU = this.parameters.legUpper.v;
    var lgD = this.parameters.legLower.v;
    var lgA = this.parameters.legAngle.v;

    // ploča 
    var cornerL = lgU * Math.cos(lgA);
    var cornerW = lgU * Math.sin(lgA);

    var pnts = [new THREE.Vector2(0, -W / 2), new THREE.Vector2(L / 2 - cornerL, -W / 2), new THREE.Vector2(L / 2, -W / 2 + cornerW), new THREE.Vector2(L / 2, W / 2 - cornerW), new THREE.Vector2(L / 2 - cornerL, W / 2), new THREE.Vector2(-L / 2 + cornerL, W / 2), new THREE.Vector2(-L / 2, W / 2 - cornerW), new THREE.Vector2(-L / 2, -W / 2 + cornerW), new THREE.Vector2(-L / 2 + cornerL, -W / 2), new THREE.Vector2(0, -W / 2)];

    var ploca2d = new THREE.Shape(pnts);
    var plocaGeo = new THREE.ExtrudeBufferGeometry(ploca2d, this.extrudeSettings);
    var plocaMesh = new THREE.Mesh(plocaGeo, this.material);

    //plocaMesh.rotateX(Math.PI/2);
    //plocaMesh.translateZ( -H);

    plocaMesh.castShadow = true;
    this.group.add(plocaMesh);

    var lpnts = [new THREE.Vector2(-lgU / 2, 0), new THREE.Vector2(lgU / 2, 0), new THREE.Vector2(lgD / 2, H - this.parameters.plocaD.v), new THREE.Vector2(-lgD / 2, H - this.parameters.plocaD.v), new THREE.Vector2(-lgU / 2, 0)];

    var leg2d = new THREE.Shape(lpnts);
    var legGeo = new THREE.ExtrudeBufferGeometry(leg2d, this.extrudeSettings);
    var legMesh = new THREE.Mesh(legGeo, this.material);

    //legMesh.rotateY( lgA );


    for (var i = 0; i < 4; i++) {
        var leg = legMesh.clone();

        if (i == 0 || i == 2) {
            var dest = new THREE.Vector2(L / 2 - cornerL / 2, W / 2 - cornerW / 2);
            if (i == 2) {
                dest.negate();
            }
        } else {
            var dest = new THREE.Vector2(-L / 2 + cornerL / 2, W / 2 - cornerW / 2);
            if (i == 3) {
                dest.negate();
            }
        }

        var dist = dest.length();
        dest.normalize();

        var axis = new THREE.Vector3(dest.x, dest.y, 0);

        leg.translateOnAxis(axis, dist);
        leg.rotateX(Math.PI / 2);

        if (i % 2 == 0) {
            leg.rotateY(-lgA);
        } else {
            leg.rotateY(lgA);
        }

        leg.translateY(this.parameters.plocaD.v);

        if (i > 1) {
            leg.translateOnAxis(new THREE.Vector3(0, 0, -1), this.parameters.plocaD.v);
        }

        leg.castShadow = true;
        this.group.add(leg);
    }

    this.group.matrix = new THREE.Matrix4();
    this.group.matrixWorldNeedsUpdate = true;
    this.group.updateMatrix();
    this.group.translateY(H);

    console.log(this.group);
    this.group.rotateX(Math.PI / 2);
};

TableCC.prototype.getMesh = function () {
    return this.group;
};

TableCC.prototype.update = function (scene) {
    this.scene = scene;
    if (this.changed) {
        scene.remove(this.group);
        this.build();
        scene.add(this.group);
    }
};

TableCC.prototype.isOK = function (para, v) {
    //temporery paramterers
    var tPara = Object.assign({}, this.parameters);
    tPara[para].v = v;
    return tPara.cond();
};

});

;require.register("___globals___", function(exports, require, module) {
  

// Auto-loaded modules from config.npm.globals.
window.THREE = require("three");
window.INIT = require("initialize");


});})();require('___globals___');


//# sourceMappingURL=oblikod.js.map
