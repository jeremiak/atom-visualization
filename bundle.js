(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Raphael = require('raphael');

var atomData = require('./atomData.json');

function generateAtom(atomicNumber, cx, cy, options) {
  var options = options || {};
  var atom = {
    atomicNumber: atomicNumber,
    cx: cx,
    cy: cy,
    r: options.r || 100,
    shells: {}
  };

  var text = 'Atomic Number: ' + atom.atomicNumber;
  text += '\nName: ' + atomData[atom.atomicNumber];
  var atomLabel = paper.text(atom.cx, atom.cy, text),
      atomLabelAttrs = {'font-size': '15'};

  atomLabel.attr(atomLabelAttrs);
  drawElectronShells(atom);
  drawElectrons(atom);

  return atom;
}

function numberOfShells(numberOfElectrons) {
  if (numberOfElectrons <= 2) {
    return 1;
  }
  else if (numberOfElectrons > 2 && numberOfElectrons <= 8) {
    return 2;
  }
  else {
    return 3;
  }
}
var whichShell = numberOfShells;

function drawElectronShells(atom){
  var shellCount = numberOfShells(atom.atomicNumber);

  for (var i=1; i <= shellCount; i++) {
    var shellAttrs = {
      'cx': atom.cx,
      'cy': atom.cy,
      'stroke': 'black',
      'stroke-width': '3',
      'stroke-dasharray': '5, 5',
      'r': atom.r * i
    }, electronCount;

    if (i == 1 && atom.atomicNumber == 1) {
      electronCount = 1;
    }
    else if (i == 1 && atom.atomicNumber >= 2) {
      electronCount = 2;
    }
    else if (i == 2 && atom.atomicNumber < 8) {
      electronCount = atom.atomicNumber - 2;
    }
    else if (i == 2 && atom.atomicNumber >= 8) {
      electronCount = 6;
    }
    else if (i == 3 && atom.atomicNumber < 16) {
      electronCount = atom.atomicNumber - 8;
    }
    var shell = paper.circle().attr(shellAttrs);
    atom.shells[i] = {shell: shell, electrons: paper.set(), electronCount: electronCount};
  }
}

function generateElectron(atom, options) {
  var options = options || {};
  var electron = paper.circle();
  var electronAttrs = {
    'r': atom.r / 10,
    'fill': options.fill || 'black'
  };
  electron.attr(electronAttrs);

  return electron;
}

function drawElectrons(atom) {
  Object.keys(atom.shells).forEach(function(shellNumber){
    var shell = atom.shells[shellNumber];
    var shellRadius = atom.r * shellNumber,
        offset = 360/shell.electronCount;
    for (var i = 0; i < shell.electronCount; i++) {
      var electron = generateElectron(atom, {fill: 'yellow'});
      electron.attr('cx', atom.cx + shellRadius);
      electron.attr('cy', atom.cy);

      var animationString = 'r' + (offset * i) + "," + atom.cx + "," + atom.cy;
      electron.transform(animationString);

      shell.electrons.push(electron);
    }

    var animationString = "...R360" + "," + atom.cx + "," + atom.cy;
    electronSpinAnimation = Raphael.animation({transform: animationString}, 6000).repeat(Infinity);
    shell.electrons.animate(electronSpinAnimation)
  });
};

var paper = Raphael(50, 50, window.innerWidth-100, window.innerHeight-100);

var atom = generateAtom(9, paper.width/2, paper.height/2, {r: 90});

},{"./atomData.json":2,"raphael":4}],2:[function(require,module,exports){
module.exports={
  1: 'Hydrogen',
  2: 'Helium',
  3: 'Lithium',
  4: 'Beryllium',
  5: 'Boron',
  6: 'Carbon',
  7: 'Nitrogen',
  8: 'Oxygen',
  9: 'Flourine',
  10: 'Neon'
}

},{}],3:[function(require,module,exports){
// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
// http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ┌────────────────────────────────────────────────────────────┐ \\
// │ Eve 0.4.2 - JavaScript Events Library                      │ \\
// ├────────────────────────────────────────────────────────────┤ \\
// │ Author Dmitry Baranovskiy (http://dmitry.baranovskiy.com/) │ \\
// └────────────────────────────────────────────────────────────┘ \\

(function (glob) {
    var version = "0.4.2",
        has = "hasOwnProperty",
        separator = /[\.\/]/,
        wildcard = "*",
        fun = function () {},
        numsort = function (a, b) {
            return a - b;
        },
        current_event,
        stop,
        events = {n: {}},
    /*\
     * eve
     [ method ]

     * Fires event with given `name`, given scope and other parameters.

     > Arguments

     - name (string) name of the *event*, dot (`.`) or slash (`/`) separated
     - scope (object) context for the event handlers
     - varargs (...) the rest of arguments will be sent to event handlers

     = (object) array of returned values from the listeners
    \*/
        eve = function (name, scope) {
			name = String(name);
            var e = events,
                oldstop = stop,
                args = Array.prototype.slice.call(arguments, 2),
                listeners = eve.listeners(name),
                z = 0,
                f = false,
                l,
                indexed = [],
                queue = {},
                out = [],
                ce = current_event,
                errors = [];
            current_event = name;
            stop = 0;
            for (var i = 0, ii = listeners.length; i < ii; i++) if ("zIndex" in listeners[i]) {
                indexed.push(listeners[i].zIndex);
                if (listeners[i].zIndex < 0) {
                    queue[listeners[i].zIndex] = listeners[i];
                }
            }
            indexed.sort(numsort);
            while (indexed[z] < 0) {
                l = queue[indexed[z++]];
                out.push(l.apply(scope, args));
                if (stop) {
                    stop = oldstop;
                    return out;
                }
            }
            for (i = 0; i < ii; i++) {
                l = listeners[i];
                if ("zIndex" in l) {
                    if (l.zIndex == indexed[z]) {
                        out.push(l.apply(scope, args));
                        if (stop) {
                            break;
                        }
                        do {
                            z++;
                            l = queue[indexed[z]];
                            l && out.push(l.apply(scope, args));
                            if (stop) {
                                break;
                            }
                        } while (l)
                    } else {
                        queue[l.zIndex] = l;
                    }
                } else {
                    out.push(l.apply(scope, args));
                    if (stop) {
                        break;
                    }
                }
            }
            stop = oldstop;
            current_event = ce;
            return out.length ? out : null;
        };
		// Undocumented. Debug only.
		eve._events = events;
    /*\
     * eve.listeners
     [ method ]

     * Internal method which gives you array of all event handlers that will be triggered by the given `name`.

     > Arguments

     - name (string) name of the event, dot (`.`) or slash (`/`) separated

     = (array) array of event handlers
    \*/
    eve.listeners = function (name) {
        var names = name.split(separator),
            e = events,
            item,
            items,
            k,
            i,
            ii,
            j,
            jj,
            nes,
            es = [e],
            out = [];
        for (i = 0, ii = names.length; i < ii; i++) {
            nes = [];
            for (j = 0, jj = es.length; j < jj; j++) {
                e = es[j].n;
                items = [e[names[i]], e[wildcard]];
                k = 2;
                while (k--) {
                    item = items[k];
                    if (item) {
                        nes.push(item);
                        out = out.concat(item.f || []);
                    }
                }
            }
            es = nes;
        }
        return out;
    };
    
    /*\
     * eve.on
     [ method ]
     **
     * Binds given event handler with a given name. You can use wildcards “`*`” for the names:
     | eve.on("*.under.*", f);
     | eve("mouse.under.floor"); // triggers f
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) returned function accepts a single numeric parameter that represents z-index of the handler. It is an optional feature and only used when you need to ensure that some subset of handlers will be invoked in a given order, despite of the order of assignment. 
     > Example:
     | eve.on("mouse", eatIt)(2);
     | eve.on("mouse", scream);
     | eve.on("mouse", catchIt)(1);
     * This will ensure that `catchIt()` function will be called before `eatIt()`.
	 *
     * If you want to put your handler before non-indexed handlers, specify a negative value.
     * Note: I assume most of the time you don’t need to worry about z-index, but it’s nice to have this feature “just in case”.
    \*/
    eve.on = function (name, f) {
		name = String(name);
		if (typeof f != "function") {
			return function () {};
		}
        var names = name.split(separator),
            e = events;
        for (var i = 0, ii = names.length; i < ii; i++) {
            e = e.n;
            e = e.hasOwnProperty(names[i]) && e[names[i]] || (e[names[i]] = {n: {}});
        }
        e.f = e.f || [];
        for (i = 0, ii = e.f.length; i < ii; i++) if (e.f[i] == f) {
            return fun;
        }
        e.f.push(f);
        return function (zIndex) {
            if (+zIndex == +zIndex) {
                f.zIndex = +zIndex;
            }
        };
    };
    /*\
     * eve.f
     [ method ]
     **
     * Returns function that will fire given event with optional arguments.
	 * Arguments that will be passed to the result function will be also
	 * concated to the list of final arguments.
 	 | el.onclick = eve.f("click", 1, 2);
 	 | eve.on("click", function (a, b, c) {
 	 |     console.log(a, b, c); // 1, 2, [event object]
 	 | });
     > Arguments
	 - event (string) event name
	 - varargs (…) and any other arguments
	 = (function) possible event handler function
    \*/
	eve.f = function (event) {
		var attrs = [].slice.call(arguments, 1);
		return function () {
			eve.apply(null, [event, null].concat(attrs).concat([].slice.call(arguments, 0)));
		};
	};
    /*\
     * eve.stop
     [ method ]
     **
     * Is used inside an event handler to stop the event, preventing any subsequent listeners from firing.
    \*/
    eve.stop = function () {
        stop = 1;
    };
    /*\
     * eve.nt
     [ method ]
     **
     * Could be used inside event handler to figure out actual name of the event.
     **
     > Arguments
     **
     - subname (string) #optional subname of the event
     **
     = (string) name of the event, if `subname` is not specified
     * or
     = (boolean) `true`, if current event’s name contains `subname`
    \*/
    eve.nt = function (subname) {
        if (subname) {
            return new RegExp("(?:\\.|\\/|^)" + subname + "(?:\\.|\\/|$)").test(current_event);
        }
        return current_event;
    };
    /*\
     * eve.nts
     [ method ]
     **
     * Could be used inside event handler to figure out actual name of the event.
     **
     **
     = (array) names of the event
    \*/
    eve.nts = function () {
        return current_event.split(separator);
    };
    /*\
     * eve.off
     [ method ]
     **
     * Removes given function from the list of event listeners assigned to given name.
	 * If no arguments specified all the events will be cleared.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
    \*/
    /*\
     * eve.unbind
     [ method ]
     **
     * See @eve.off
    \*/
    eve.off = eve.unbind = function (name, f) {
		if (!name) {
		    eve._events = events = {n: {}};
			return;
		}
        var names = name.split(separator),
            e,
            key,
            splice,
            i, ii, j, jj,
            cur = [events];
        for (i = 0, ii = names.length; i < ii; i++) {
            for (j = 0; j < cur.length; j += splice.length - 2) {
                splice = [j, 1];
                e = cur[j].n;
                if (names[i] != wildcard) {
                    if (e[names[i]]) {
                        splice.push(e[names[i]]);
                    }
                } else {
                    for (key in e) if (e[has](key)) {
                        splice.push(e[key]);
                    }
                }
                cur.splice.apply(cur, splice);
            }
        }
        for (i = 0, ii = cur.length; i < ii; i++) {
            e = cur[i];
            while (e.n) {
                if (f) {
                    if (e.f) {
                        for (j = 0, jj = e.f.length; j < jj; j++) if (e.f[j] == f) {
                            e.f.splice(j, 1);
                            break;
                        }
                        !e.f.length && delete e.f;
                    }
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        var funcs = e.n[key].f;
                        for (j = 0, jj = funcs.length; j < jj; j++) if (funcs[j] == f) {
                            funcs.splice(j, 1);
                            break;
                        }
                        !funcs.length && delete e.n[key].f;
                    }
                } else {
                    delete e.f;
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        delete e.n[key].f;
                    }
                }
                e = e.n;
            }
        }
    };
    /*\
     * eve.once
     [ method ]
     **
     * Binds given event handler with a given name to only run once then unbind itself.
     | eve.once("login", f);
     | eve("login"); // triggers f
     | eve("login"); // no listeners
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) same return function as @eve.on
    \*/
    eve.once = function (name, f) {
        var f2 = function () {
            eve.unbind(name, f2);
            return f.apply(this, arguments);
        };
        return eve.on(name, f2);
    };
    /*\
     * eve.version
     [ property (string) ]
     **
     * Current version of the library.
    \*/
    eve.version = version;
    eve.toString = function () {
        return "You are running Eve " + version;
    };
    (typeof module != "undefined" && module.exports) ? (module.exports = eve) : (typeof define != "undefined" ? (define("eve", [], function() { return eve; })) : (glob.eve = eve));
})(this);

},{}],4:[function(require,module,exports){
// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ "Raphaël 2.1.0" - JavaScript Vector Library                         │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\

var eve = require('eve');

(function () {
    /*\
     * Raphael
     [ method ]
     **
     * Creates a canvas object on which to draw.
     * You must do this first, as all future calls to drawing methods
     * from this instance will be bound to this canvas.
     > Parameters
     **
     - container (HTMLElement|string) DOM element or its ID which is going to be a parent for drawing surface
     - width (number)
     - height (number)
     - callback (function) #optional callback function which is going to be executed in the context of newly created paper
     * or
     - x (number)
     - y (number)
     - width (number)
     - height (number)
     - callback (function) #optional callback function which is going to be executed in the context of newly created paper
     * or
     - all (array) (first 3 or 4 elements in the array are equal to [containerID, width, height] or [x, y, width, height]. The rest are element descriptions in format {type: type, <attributes>}). See @Paper.add.
     - callback (function) #optional callback function which is going to be executed in the context of newly created paper
     * or
     - onReadyCallback (function) function that is going to be called on DOM ready event. You can also subscribe to this event via Eve’s “DOMLoad” event. In this case method returns `undefined`.
     = (object) @Paper
     > Usage
     | // Each of the following examples create a canvas
     | // that is 320px wide by 200px high.
     | // Canvas is created at the viewport’s 10,50 coordinate.
     | var paper = Raphael(10, 50, 320, 200);
     | // Canvas is created at the top left corner of the #notepad element
     | // (or its top right corner in dir="rtl" elements)
     | var paper = Raphael(document.getElementById("notepad"), 320, 200);
     | // Same as above
     | var paper = Raphael("notepad", 320, 200);
     | // Image dump
     | var set = Raphael(["notepad", 320, 200, {
     |     type: "rect",
     |     x: 10,
     |     y: 10,
     |     width: 25,
     |     height: 25,
     |     stroke: "#f00"
     | }, {
     |     type: "text",
     |     x: 30,
     |     y: 40,
     |     text: "Dump"
     | }]);
    \*/
    function R(first) {
        if (R.is(first, "function")) {
            return loaded ? first() : eve.on("raphael.DOMload", first);
        } else if (R.is(first, array)) {
            return R._engine.create[apply](R, first.splice(0, 3 + R.is(first[0], nu))).add(first);
        } else {
            var args = Array.prototype.slice.call(arguments, 0);
            if (R.is(args[args.length - 1], "function")) {
                var f = args.pop();
                return loaded ? f.call(R._engine.create[apply](R, args)) : eve.on("raphael.DOMload", function () {
                    f.call(R._engine.create[apply](R, args));
                });
            } else {
                return R._engine.create[apply](R, arguments);
            }
        }
    }
    R.version = "2.1.0";
    R.eve = eve;
    var loaded,
        separator = /[, ]+/,
        elements = {circle: 1, rect: 1, path: 1, ellipse: 1, text: 1, image: 1},
        formatrg = /\{(\d+)\}/g,
        proto = "prototype",
        has = "hasOwnProperty",
        g = {
            doc: document,
            win: window
        },
        oldRaphael = {
            was: Object.prototype[has].call(g.win, "Raphael"),
            is: g.win.Raphael
        },
        Paper = function () {
            /*\
             * Paper.ca
             [ property (object) ]
             **
             * Shortcut for @Paper.customAttributes
            \*/
            /*\
             * Paper.customAttributes
             [ property (object) ]
             **
             * If you have a set of attributes that you would like to represent
             * as a function of some number you can do it easily with custom attributes:
             > Usage
             | paper.customAttributes.hue = function (num) {
             |     num = num % 1;
             |     return {fill: "hsb(" + num + ", 0.75, 1)"};
             | };
             | // Custom attribute “hue” will change fill
             | // to be given hue with fixed saturation and brightness.
             | // Now you can use it like this:
             | var c = paper.circle(10, 10, 10).attr({hue: .45});
             | // or even like this:
             | c.animate({hue: 1}, 1e3);
             | 
             | // You could also create custom attribute
             | // with multiple parameters:
             | paper.customAttributes.hsb = function (h, s, b) {
             |     return {fill: "hsb(" + [h, s, b].join(",") + ")"};
             | };
             | c.attr({hsb: "0.5 .8 1"});
             | c.animate({hsb: [1, 0, 0.5]}, 1e3);
            \*/
            this.ca = this.customAttributes = {};
        },
        paperproto,
        appendChild = "appendChild",
        apply = "apply",
        concat = "concat",
        supportsTouch = "createTouch" in g.doc,
        E = "",
        S = " ",
        Str = String,
        split = "split",
        events = "click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend touchcancel"[split](S),
        touchMap = {
            mousedown: "touchstart",
            mousemove: "touchmove",
            mouseup: "touchend"
        },
        lowerCase = Str.prototype.toLowerCase,
        math = Math,
        mmax = math.max,
        mmin = math.min,
        abs = math.abs,
        pow = math.pow,
        PI = math.PI,
        nu = "number",
        string = "string",
        array = "array",
        toString = "toString",
        fillString = "fill",
        objectToString = Object.prototype.toString,
        paper = {},
        push = "push",
        ISURL = R._ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i,
        colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i,
        isnan = {"NaN": 1, "Infinity": 1, "-Infinity": 1},
        bezierrg = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
        round = math.round,
        setAttribute = "setAttribute",
        toFloat = parseFloat,
        toInt = parseInt,
        upperCase = Str.prototype.toUpperCase,
        availableAttrs = R._availableAttrs = {
            "arrow-end": "none",
            "arrow-start": "none",
            blur: 0,
            "clip-rect": "0 0 1e9 1e9",
            cursor: "default",
            cx: 0,
            cy: 0,
            fill: "#fff",
            "fill-opacity": 1,
            font: '10px "Arial"',
            "font-family": '"Arial"',
            "font-size": "10",
            "font-style": "normal",
            "font-weight": 400,
            gradient: 0,
            height: 0,
            href: "http://raphaeljs.com/",
            "letter-spacing": 0,
            opacity: 1,
            path: "M0,0",
            r: 0,
            rx: 0,
            ry: 0,
            src: "",
            stroke: "#000",
            "stroke-dasharray": "",
            "stroke-linecap": "butt",
            "stroke-linejoin": "butt",
            "stroke-miterlimit": 0,
            "stroke-opacity": 1,
            "stroke-width": 1,
            target: "_blank",
            "text-anchor": "middle",
            title: "Raphael",
            transform: "",
            width: 0,
            x: 0,
            y: 0
        },
        availableAnimAttrs = R._availableAnimAttrs = {
            blur: nu,
            "clip-rect": "csv",
            cx: nu,
            cy: nu,
            fill: "colour",
            "fill-opacity": nu,
            "font-size": nu,
            height: nu,
            opacity: nu,
            path: "path",
            r: nu,
            rx: nu,
            ry: nu,
            stroke: "colour",
            "stroke-opacity": nu,
            "stroke-width": nu,
            transform: "transform",
            width: nu,
            x: nu,
            y: nu
        },
        whitespace = /[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]/g,
        commaSpaces = /[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/,
        hsrg = {hs: 1, rg: 1},
        p2s = /,?([achlmqrstvxz]),?/gi,
        pathCommand = /([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
        tCommand = /([rstm])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
        pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/ig,
        radial_gradient = R._radial_gradient = /^r(?:\(([^,]+?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*([^\)]+?)\))?/,
        eldata = {},
        sortByKey = function (a, b) {
            return a.key - b.key;
        },
        sortByNumber = function (a, b) {
            return toFloat(a) - toFloat(b);
        },
        fun = function () {},
        pipe = function (x) {
            return x;
        },
        rectPath = R._rectPath = function (x, y, w, h, r) {
            if (r) {
                return [["M", x + r, y], ["l", w - r * 2, 0], ["a", r, r, 0, 0, 1, r, r], ["l", 0, h - r * 2], ["a", r, r, 0, 0, 1, -r, r], ["l", r * 2 - w, 0], ["a", r, r, 0, 0, 1, -r, -r], ["l", 0, r * 2 - h], ["a", r, r, 0, 0, 1, r, -r], ["z"]];
            }
            return [["M", x, y], ["l", w, 0], ["l", 0, h], ["l", -w, 0], ["z"]];
        },
        ellipsePath = function (x, y, rx, ry) {
            if (ry == null) {
                ry = rx;
            }
            return [["M", x, y], ["m", 0, -ry], ["a", rx, ry, 0, 1, 1, 0, 2 * ry], ["a", rx, ry, 0, 1, 1, 0, -2 * ry], ["z"]];
        },
        getPath = R._getPath = {
            path: function (el) {
                return el.attr("path");
            },
            circle: function (el) {
                var a = el.attrs;
                return ellipsePath(a.cx, a.cy, a.r);
            },
            ellipse: function (el) {
                var a = el.attrs;
                return ellipsePath(a.cx, a.cy, a.rx, a.ry);
            },
            rect: function (el) {
                var a = el.attrs;
                return rectPath(a.x, a.y, a.width, a.height, a.r);
            },
            image: function (el) {
                var a = el.attrs;
                return rectPath(a.x, a.y, a.width, a.height);
            },
            text: function (el) {
                var bbox = el._getBBox();
                return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
            },
            set : function(el) {
                var bbox = el._getBBox();
                return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
            }
        },
        /*\
         * Raphael.mapPath
         [ method ]
         **
         * Transform the path string with given matrix.
         > Parameters
         - path (string) path string
         - matrix (object) see @Matrix
         = (string) transformed path string
        \*/
        mapPath = R.mapPath = function (path, matrix) {
            if (!matrix) {
                return path;
            }
            var x, y, i, j, ii, jj, pathi;
            path = path2curve(path);
            for (i = 0, ii = path.length; i < ii; i++) {
                pathi = path[i];
                for (j = 1, jj = pathi.length; j < jj; j += 2) {
                    x = matrix.x(pathi[j], pathi[j + 1]);
                    y = matrix.y(pathi[j], pathi[j + 1]);
                    pathi[j] = x;
                    pathi[j + 1] = y;
                }
            }
            return path;
        };

    R._g = g;
    /*\
     * Raphael.type
     [ property (string) ]
     **
     * Can be “SVG”, “VML” or empty, depending on browser support.
    \*/
    R.type = (g.win.SVGAngle || g.doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML");
    if (R.type == "VML") {
        var d = g.doc.createElement("div"),
            b;
        d.innerHTML = '<v:shape adj="1"/>';
        b = d.firstChild;
        b.style.behavior = "url(#default#VML)";
        if (!(b && typeof b.adj == "object")) {
            return (R.type = E);
        }
        d = null;
    }
    /*\
     * Raphael.svg
     [ property (boolean) ]
     **
     * `true` if browser supports SVG.
    \*/
    /*\
     * Raphael.vml
     [ property (boolean) ]
     **
     * `true` if browser supports VML.
    \*/
    R.svg = !(R.vml = R.type == "VML");
    R._Paper = Paper;
    /*\
     * Raphael.fn
     [ property (object) ]
     **
     * You can add your own method to the canvas. For example if you want to draw a pie chart,
     * you can create your own pie chart function and ship it as a Raphaël plugin. To do this
     * you need to extend the `Raphael.fn` object. You should modify the `fn` object before a
     * Raphaël instance is created, otherwise it will take no effect. Please note that the
     * ability for namespaced plugins was removed in Raphael 2.0. It is up to the plugin to
     * ensure any namespacing ensures proper context.
     > Usage
     | Raphael.fn.arrow = function (x1, y1, x2, y2, size) {
     |     return this.path( ... );
     | };
     | // or create namespace
     | Raphael.fn.mystuff = {
     |     arrow: function () {…},
     |     star: function () {…},
     |     // etc…
     | };
     | var paper = Raphael(10, 10, 630, 480);
     | // then use it
     | paper.arrow(10, 10, 30, 30, 5).attr({fill: "#f00"});
     | paper.mystuff.arrow();
     | paper.mystuff.star();
    \*/
    R.fn = paperproto = Paper.prototype = R.prototype;
    R._id = 0;
    R._oid = 0;
    /*\
     * Raphael.is
     [ method ]
     **
     * Handfull replacement for `typeof` operator.
     > Parameters
     - o (…) any object or primitive
     - type (string) name of the type, i.e. “string”, “function”, “number”, etc.
     = (boolean) is given value is of given type
    \*/
    R.is = function (o, type) {
        type = lowerCase.call(type);
        if (type == "finite") {
            return !isnan[has](+o);
        }
        if (type == "array") {
            return o instanceof Array;
        }
        return  (type == "null" && o === null) ||
                (type == typeof o && o !== null) ||
                (type == "object" && o === Object(o)) ||
                (type == "array" && Array.isArray && Array.isArray(o)) ||
                objectToString.call(o).slice(8, -1).toLowerCase() == type;
    };

    function clone(obj) {
        if (Object(obj) !== obj) {
            return obj;
        }
        var res = new obj.constructor;
        for (var key in obj) if (obj[has](key)) {
            res[key] = clone(obj[key]);
        }
        return res;
    }

    /*\
     * Raphael.angle
     [ method ]
     **
     * Returns angle between two or three points
     > Parameters
     - x1 (number) x coord of first point
     - y1 (number) y coord of first point
     - x2 (number) x coord of second point
     - y2 (number) y coord of second point
     - x3 (number) #optional x coord of third point
     - y3 (number) #optional y coord of third point
     = (number) angle in degrees.
    \*/
    R.angle = function (x1, y1, x2, y2, x3, y3) {
        if (x3 == null) {
            var x = x1 - x2,
                y = y1 - y2;
            if (!x && !y) {
                return 0;
            }
            return (180 + math.atan2(-y, -x) * 180 / PI + 360) % 360;
        } else {
            return R.angle(x1, y1, x3, y3) - R.angle(x2, y2, x3, y3);
        }
    };
    /*\
     * Raphael.rad
     [ method ]
     **
     * Transform angle to radians
     > Parameters
     - deg (number) angle in degrees
     = (number) angle in radians.
    \*/
    R.rad = function (deg) {
        return deg % 360 * PI / 180;
    };
    /*\
     * Raphael.deg
     [ method ]
     **
     * Transform angle to degrees
     > Parameters
     - deg (number) angle in radians
     = (number) angle in degrees.
    \*/
    R.deg = function (rad) {
        return rad * 180 / PI % 360;
    };
    /*\
     * Raphael.snapTo
     [ method ]
     **
     * Snaps given value to given grid.
     > Parameters
     - values (array|number) given array of values or step of the grid
     - value (number) value to adjust
     - tolerance (number) #optional tolerance for snapping. Default is `10`.
     = (number) adjusted value.
    \*/
    R.snapTo = function (values, value, tolerance) {
        tolerance = R.is(tolerance, "finite") ? tolerance : 10;
        if (R.is(values, array)) {
            var i = values.length;
            while (i--) if (abs(values[i] - value) <= tolerance) {
                return values[i];
            }
        } else {
            values = +values;
            var rem = value % values;
            if (rem < tolerance) {
                return value - rem;
            }
            if (rem > values - tolerance) {
                return value - rem + values;
            }
        }
        return value;
    };
    
    /*\
     * Raphael.createUUID
     [ method ]
     **
     * Returns RFC4122, version 4 ID
    \*/
    var createUUID = R.createUUID = (function (uuidRegEx, uuidReplacer) {
        return function () {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(uuidRegEx, uuidReplacer).toUpperCase();
        };
    })(/[xy]/g, function (c) {
        var r = math.random() * 16 | 0,
            v = c == "x" ? r : (r & 3 | 8);
        return v.toString(16);
    });

    /*\
     * Raphael.setWindow
     [ method ]
     **
     * Used when you need to draw in `&lt;iframe>`. Switched window to the iframe one.
     > Parameters
     - newwin (window) new window object
    \*/
    R.setWindow = function (newwin) {
        eve("raphael.setWindow", R, g.win, newwin);
        g.win = newwin;
        g.doc = g.win.document;
        if (R._engine.initWin) {
            R._engine.initWin(g.win);
        }
    };
    var toHex = function (color) {
        if (R.vml) {
            // http://dean.edwards.name/weblog/2009/10/convert-any-colour-value-to-hex-in-msie/
            var trim = /^\s+|\s+$/g;
            var bod;
            try {
                var docum = new ActiveXObject("htmlfile");
                docum.write("<body>");
                docum.close();
                bod = docum.body;
            } catch(e) {
                bod = createPopup().document.body;
            }
            var range = bod.createTextRange();
            toHex = cacher(function (color) {
                try {
                    bod.style.color = Str(color).replace(trim, E);
                    var value = range.queryCommandValue("ForeColor");
                    value = ((value & 255) << 16) | (value & 65280) | ((value & 16711680) >>> 16);
                    return "#" + ("000000" + value.toString(16)).slice(-6);
                } catch(e) {
                    return "none";
                }
            });
        } else {
            var i = g.doc.createElement("i");
            i.title = "Rapha\xebl Colour Picker";
            i.style.display = "none";
            g.doc.body.appendChild(i);
            toHex = cacher(function (color) {
                i.style.color = color;
                return g.doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
            });
        }
        return toHex(color);
    },
    hsbtoString = function () {
        return "hsb(" + [this.h, this.s, this.b] + ")";
    },
    hsltoString = function () {
        return "hsl(" + [this.h, this.s, this.l] + ")";
    },
    rgbtoString = function () {
        return this.hex;
    },
    prepareRGB = function (r, g, b) {
        if (g == null && R.is(r, "object") && "r" in r && "g" in r && "b" in r) {
            b = r.b;
            g = r.g;
            r = r.r;
        }
        if (g == null && R.is(r, string)) {
            var clr = R.getRGB(r);
            r = clr.r;
            g = clr.g;
            b = clr.b;
        }
        if (r > 1 || g > 1 || b > 1) {
            r /= 255;
            g /= 255;
            b /= 255;
        }
        
        return [r, g, b];
    },
    packageRGB = function (r, g, b, o) {
        r *= 255;
        g *= 255;
        b *= 255;
        var rgb = {
            r: r,
            g: g,
            b: b,
            hex: R.rgb(r, g, b),
            toString: rgbtoString
        };
        R.is(o, "finite") && (rgb.opacity = o);
        return rgb;
    };
    
    /*\
     * Raphael.color
     [ method ]
     **
     * Parses the color string and returns object with all values for the given color.
     > Parameters
     - clr (string) color string in one of the supported formats (see @Raphael.getRGB)
     = (object) Combined RGB & HSB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••,
     o     error (boolean) `true` if string can’t be parsed,
     o     h (number) hue,
     o     s (number) saturation,
     o     v (number) value (brightness),
     o     l (number) lightness
     o }
    \*/
    R.color = function (clr) {
        var rgb;
        if (R.is(clr, "object") && "h" in clr && "s" in clr && "b" in clr) {
            rgb = R.hsb2rgb(clr);
            clr.r = rgb.r;
            clr.g = rgb.g;
            clr.b = rgb.b;
            clr.hex = rgb.hex;
        } else if (R.is(clr, "object") && "h" in clr && "s" in clr && "l" in clr) {
            rgb = R.hsl2rgb(clr);
            clr.r = rgb.r;
            clr.g = rgb.g;
            clr.b = rgb.b;
            clr.hex = rgb.hex;
        } else {
            if (R.is(clr, "string")) {
                clr = R.getRGB(clr);
            }
            if (R.is(clr, "object") && "r" in clr && "g" in clr && "b" in clr) {
                rgb = R.rgb2hsl(clr);
                clr.h = rgb.h;
                clr.s = rgb.s;
                clr.l = rgb.l;
                rgb = R.rgb2hsb(clr);
                clr.v = rgb.b;
            } else {
                clr = {hex: "none"};
                clr.r = clr.g = clr.b = clr.h = clr.s = clr.v = clr.l = -1;
            }
        }
        clr.toString = rgbtoString;
        return clr;
    };
    /*\
     * Raphael.hsb2rgb
     [ method ]
     **
     * Converts HSB values to RGB object.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - v (number) value or brightness
     = (object) RGB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••
     o }
    \*/
    R.hsb2rgb = function (h, s, v, o) {
        if (this.is(h, "object") && "h" in h && "s" in h && "b" in h) {
            v = h.b;
            s = h.s;
            h = h.h;
            o = h.o;
        }
        h *= 360;
        var R, G, B, X, C;
        h = (h % 360) / 60;
        C = v * s;
        X = C * (1 - abs(h % 2 - 1));
        R = G = B = v - C;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];
        return packageRGB(R, G, B, o);
    };
    /*\
     * Raphael.hsl2rgb
     [ method ]
     **
     * Converts HSL values to RGB object.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - l (number) luminosity
     = (object) RGB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••
     o }
    \*/
    R.hsl2rgb = function (h, s, l, o) {
        if (this.is(h, "object") && "h" in h && "s" in h && "l" in h) {
            l = h.l;
            s = h.s;
            h = h.h;
        }
        if (h > 1 || s > 1 || l > 1) {
            h /= 360;
            s /= 100;
            l /= 100;
        }
        h *= 360;
        var R, G, B, X, C;
        h = (h % 360) / 60;
        C = 2 * s * (l < .5 ? l : 1 - l);
        X = C * (1 - abs(h % 2 - 1));
        R = G = B = l - C / 2;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];
        return packageRGB(R, G, B, o);
    };
    /*\
     * Raphael.rgb2hsb
     [ method ]
     **
     * Converts RGB values to HSB object.
     > Parameters
     - r (number) red
     - g (number) green
     - b (number) blue
     = (object) HSB object in format:
     o {
     o     h (number) hue
     o     s (number) saturation
     o     b (number) brightness
     o }
    \*/
    R.rgb2hsb = function (r, g, b) {
        b = prepareRGB(r, g, b);
        r = b[0];
        g = b[1];
        b = b[2];

        var H, S, V, C;
        V = mmax(r, g, b);
        C = V - mmin(r, g, b);
        H = (C == 0 ? null :
             V == r ? (g - b) / C :
             V == g ? (b - r) / C + 2 :
                      (r - g) / C + 4
            );
        H = ((H + 360) % 6) * 60 / 360;
        S = C == 0 ? 0 : C / V;
        return {h: H, s: S, b: V, toString: hsbtoString};
    };
    /*\
     * Raphael.rgb2hsl
     [ method ]
     **
     * Converts RGB values to HSL object.
     > Parameters
     - r (number) red
     - g (number) green
     - b (number) blue
     = (object) HSL object in format:
     o {
     o     h (number) hue
     o     s (number) saturation
     o     l (number) luminosity
     o }
    \*/
    R.rgb2hsl = function (r, g, b) {
        b = prepareRGB(r, g, b);
        r = b[0];
        g = b[1];
        b = b[2];

        var H, S, L, M, m, C;
        M = mmax(r, g, b);
        m = mmin(r, g, b);
        C = M - m;
        H = (C == 0 ? null :
             M == r ? (g - b) / C :
             M == g ? (b - r) / C + 2 :
                      (r - g) / C + 4);
        H = ((H + 360) % 6) * 60 / 360;
        L = (M + m) / 2;
        S = (C == 0 ? 0 :
             L < .5 ? C / (2 * L) :
                      C / (2 - 2 * L));
        return {h: H, s: S, l: L, toString: hsltoString};
    };
    R._path2string = function () {
        return this.join(",").replace(p2s, "$1");
    };
    function repush(array, item) {
        for (var i = 0, ii = array.length; i < ii; i++) if (array[i] === item) {
            return array.push(array.splice(i, 1)[0]);
        }
    }
    function cacher(f, scope, postprocessor) {
        function newf() {
            var arg = Array.prototype.slice.call(arguments, 0),
                args = arg.join("\u2400"),
                cache = newf.cache = newf.cache || {},
                count = newf.count = newf.count || [];
            if (cache[has](args)) {
                repush(count, args);
                return postprocessor ? postprocessor(cache[args]) : cache[args];
            }
            count.length >= 1e3 && delete cache[count.shift()];
            count.push(args);
            cache[args] = f[apply](scope, arg);
            return postprocessor ? postprocessor(cache[args]) : cache[args];
        }
        return newf;
    }

    var preload = R._preload = function (src, f) {
        var img = g.doc.createElement("img");
        img.style.cssText = "position:absolute;left:-9999em;top:-9999em";
        img.onload = function () {
            f.call(this);
            this.onload = null;
            g.doc.body.removeChild(this);
        };
        img.onerror = function () {
            g.doc.body.removeChild(this);
        };
        g.doc.body.appendChild(img);
        img.src = src;
    };
    
    function clrToString() {
        return this.hex;
    }

    /*\
     * Raphael.getRGB
     [ method ]
     **
     * Parses colour string as RGB object
     > Parameters
     - colour (string) colour string in one of formats:
     # <ul>
     #     <li>Colour name (“<code>red</code>”, “<code>green</code>”, “<code>cornflowerblue</code>”, etc)</li>
     #     <li>#••• — shortened HTML colour: (“<code>#000</code>”, “<code>#fc0</code>”, etc)</li>
     #     <li>#•••••• — full length HTML colour: (“<code>#000000</code>”, “<code>#bd2300</code>”)</li>
     #     <li>rgb(•••, •••, •••) — red, green and blue channels’ values: (“<code>rgb(200,&nbsp;100,&nbsp;0)</code>”)</li>
     #     <li>rgb(•••%, •••%, •••%) — same as above, but in %: (“<code>rgb(100%,&nbsp;175%,&nbsp;0%)</code>”)</li>
     #     <li>hsb(•••, •••, •••) — hue, saturation and brightness values: (“<code>hsb(0.5,&nbsp;0.25,&nbsp;1)</code>”)</li>
     #     <li>hsb(•••%, •••%, •••%) — same as above, but in %</li>
     #     <li>hsl(•••, •••, •••) — same as hsb</li>
     #     <li>hsl(•••%, •••%, •••%) — same as hsb</li>
     # </ul>
     = (object) RGB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue
     o     hex (string) color in HTML/CSS format: #••••••,
     o     error (boolean) true if string can’t be parsed
     o }
    \*/
    R.getRGB = cacher(function (colour) {
        if (!colour || !!((colour = Str(colour)).indexOf("-") + 1)) {
            return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: clrToString};
        }
        if (colour == "none") {
            return {r: -1, g: -1, b: -1, hex: "none", toString: clrToString};
        }
        !(hsrg[has](colour.toLowerCase().substring(0, 2)) || colour.charAt() == "#") && (colour = toHex(colour));
        var res,
            red,
            green,
            blue,
            opacity,
            t,
            values,
            rgb = colour.match(colourRegExp);
        if (rgb) {
            if (rgb[2]) {
                blue = toInt(rgb[2].substring(5), 16);
                green = toInt(rgb[2].substring(3, 5), 16);
                red = toInt(rgb[2].substring(1, 3), 16);
            }
            if (rgb[3]) {
                blue = toInt((t = rgb[3].charAt(3)) + t, 16);
                green = toInt((t = rgb[3].charAt(2)) + t, 16);
                red = toInt((t = rgb[3].charAt(1)) + t, 16);
            }
            if (rgb[4]) {
                values = rgb[4][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                rgb[1].toLowerCase().slice(0, 4) == "rgba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
            }
            if (rgb[5]) {
                values = rgb[5][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsb2rgb(red, green, blue, opacity);
            }
            if (rgb[6]) {
                values = rgb[6][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsla" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsl2rgb(red, green, blue, opacity);
            }
            rgb = {r: red, g: green, b: blue, toString: clrToString};
            rgb.hex = "#" + (16777216 | blue | (green << 8) | (red << 16)).toString(16).slice(1);
            R.is(opacity, "finite") && (rgb.opacity = opacity);
            return rgb;
        }
        return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: clrToString};
    }, R);
    /*\
     * Raphael.hsb
     [ method ]
     **
     * Converts HSB values to hex representation of the colour.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - b (number) value or brightness
     = (string) hex representation of the colour.
    \*/
    R.hsb = cacher(function (h, s, b) {
        return R.hsb2rgb(h, s, b).hex;
    });
    /*\
     * Raphael.hsl
     [ method ]
     **
     * Converts HSL values to hex representation of the colour.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - l (number) luminosity
     = (string) hex representation of the colour.
    \*/
    R.hsl = cacher(function (h, s, l) {
        return R.hsl2rgb(h, s, l).hex;
    });
    /*\
     * Raphael.rgb
     [ method ]
     **
     * Converts RGB values to hex representation of the colour.
     > Parameters
     - r (number) red
     - g (number) green
     - b (number) blue
     = (string) hex representation of the colour.
    \*/
    R.rgb = cacher(function (r, g, b) {
        return "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1);
    });
    /*\
     * Raphael.getColor
     [ method ]
     **
     * On each call returns next colour in the spectrum. To reset it back to red call @Raphael.getColor.reset
     > Parameters
     - value (number) #optional brightness, default is `0.75`
     = (string) hex representation of the colour.
    \*/
    R.getColor = function (value) {
        var start = this.getColor.start = this.getColor.start || {h: 0, s: 1, b: value || .75},
            rgb = this.hsb2rgb(start.h, start.s, start.b);
        start.h += .075;
        if (start.h > 1) {
            start.h = 0;
            start.s -= .2;
            start.s <= 0 && (this.getColor.start = {h: 0, s: 1, b: start.b});
        }
        return rgb.hex;
    };
    /*\
     * Raphael.getColor.reset
     [ method ]
     **
     * Resets spectrum position for @Raphael.getColor back to red.
    \*/
    R.getColor.reset = function () {
        delete this.start;
    };

    // http://schepers.cc/getting-to-the-point
    function catmullRom2bezier(crp, z) {
        var d = [];
        for (var i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
            var p = [
                        {x: +crp[i - 2], y: +crp[i - 1]},
                        {x: +crp[i],     y: +crp[i + 1]},
                        {x: +crp[i + 2], y: +crp[i + 3]},
                        {x: +crp[i + 4], y: +crp[i + 5]}
                    ];
            if (z) {
                if (!i) {
                    p[0] = {x: +crp[iLen - 2], y: +crp[iLen - 1]};
                } else if (iLen - 4 == i) {
                    p[3] = {x: +crp[0], y: +crp[1]};
                } else if (iLen - 2 == i) {
                    p[2] = {x: +crp[0], y: +crp[1]};
                    p[3] = {x: +crp[2], y: +crp[3]};
                }
            } else {
                if (iLen - 4 == i) {
                    p[3] = p[2];
                } else if (!i) {
                    p[0] = {x: +crp[i], y: +crp[i + 1]};
                }
            }
            d.push(["C",
                  (-p[0].x + 6 * p[1].x + p[2].x) / 6,
                  (-p[0].y + 6 * p[1].y + p[2].y) / 6,
                  (p[1].x + 6 * p[2].x - p[3].x) / 6,
                  (p[1].y + 6*p[2].y - p[3].y) / 6,
                  p[2].x,
                  p[2].y
            ]);
        }

        return d;
    }
    /*\
     * Raphael.parsePathString
     [ method ]
     **
     * Utility method
     **
     * Parses given path string into an array of arrays of path segments.
     > Parameters
     - pathString (string|array) path string or array of segments (in the last case it will be returned straight away)
     = (array) array of segments.
    \*/
    R.parsePathString = function (pathString) {
        if (!pathString) {
            return null;
        }
        var pth = paths(pathString);
        if (pth.arr) {
            return pathClone(pth.arr);
        }
        
        var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, z: 0},
            data = [];
        if (R.is(pathString, array) && R.is(pathString[0], array)) { // rough assumption
            data = pathClone(pathString);
        }
        if (!data.length) {
            Str(pathString).replace(pathCommand, function (a, b, c) {
                var params = [],
                    name = b.toLowerCase();
                c.replace(pathValues, function (a, b) {
                    b && params.push(+b);
                });
                if (name == "m" && params.length > 2) {
                    data.push([b][concat](params.splice(0, 2)));
                    name = "l";
                    b = b == "m" ? "l" : "L";
                }
                if (name == "r") {
                    data.push([b][concat](params));
                } else while (params.length >= paramCounts[name]) {
                    data.push([b][concat](params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    }
                }
            });
        }
        data.toString = R._path2string;
        pth.arr = pathClone(data);
        return data;
    };
    /*\
     * Raphael.parseTransformString
     [ method ]
     **
     * Utility method
     **
     * Parses given path string into an array of transformations.
     > Parameters
     - TString (string|array) transform string or array of transformations (in the last case it will be returned straight away)
     = (array) array of transformations.
    \*/
    R.parseTransformString = cacher(function (TString) {
        if (!TString) {
            return null;
        }
        var paramCounts = {r: 3, s: 4, t: 2, m: 6},
            data = [];
        if (R.is(TString, array) && R.is(TString[0], array)) { // rough assumption
            data = pathClone(TString);
        }
        if (!data.length) {
            Str(TString).replace(tCommand, function (a, b, c) {
                var params = [],
                    name = lowerCase.call(b);
                c.replace(pathValues, function (a, b) {
                    b && params.push(+b);
                });
                data.push([b][concat](params));
            });
        }
        data.toString = R._path2string;
        return data;
    });
    // PATHS
    var paths = function (ps) {
        var p = paths.ps = paths.ps || {};
        if (p[ps]) {
            p[ps].sleep = 100;
        } else {
            p[ps] = {
                sleep: 100
            };
        }
        setTimeout(function () {
            for (var key in p) if (p[has](key) && key != ps) {
                p[key].sleep--;
                !p[key].sleep && delete p[key];
            }
        });
        return p[ps];
    };
    /*\
     * Raphael.findDotsAtSegment
     [ method ]
     **
     * Utility method
     **
     * Find dot coordinates on the given cubic bezier curve at the given t.
     > Parameters
     - p1x (number) x of the first point of the curve
     - p1y (number) y of the first point of the curve
     - c1x (number) x of the first anchor of the curve
     - c1y (number) y of the first anchor of the curve
     - c2x (number) x of the second anchor of the curve
     - c2y (number) y of the second anchor of the curve
     - p2x (number) x of the second point of the curve
     - p2y (number) y of the second point of the curve
     - t (number) position on the curve (0..1)
     = (object) point information in format:
     o {
     o     x: (number) x coordinate of the point
     o     y: (number) y coordinate of the point
     o     m: {
     o         x: (number) x coordinate of the left anchor
     o         y: (number) y coordinate of the left anchor
     o     }
     o     n: {
     o         x: (number) x coordinate of the right anchor
     o         y: (number) y coordinate of the right anchor
     o     }
     o     start: {
     o         x: (number) x coordinate of the start of the curve
     o         y: (number) y coordinate of the start of the curve
     o     }
     o     end: {
     o         x: (number) x coordinate of the end of the curve
     o         y: (number) y coordinate of the end of the curve
     o     }
     o     alpha: (number) angle of the curve derivative at the point
     o }
    \*/
    R.findDotsAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
        var t1 = 1 - t,
            t13 = pow(t1, 3),
            t12 = pow(t1, 2),
            t2 = t * t,
            t3 = t2 * t,
            x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
            y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
            mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
            my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
            nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
            ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
            ax = t1 * p1x + t * c1x,
            ay = t1 * p1y + t * c1y,
            cx = t1 * c2x + t * p2x,
            cy = t1 * c2y + t * p2y,
            alpha = (90 - math.atan2(mx - nx, my - ny) * 180 / PI);
        (mx > nx || my < ny) && (alpha += 180);
        return {
            x: x,
            y: y,
            m: {x: mx, y: my},
            n: {x: nx, y: ny},
            start: {x: ax, y: ay},
            end: {x: cx, y: cy},
            alpha: alpha
        };
    };
    /*\
     * Raphael.bezierBBox
     [ method ]
     **
     * Utility method
     **
     * Return bounding box of a given cubic bezier curve
     > Parameters
     - p1x (number) x of the first point of the curve
     - p1y (number) y of the first point of the curve
     - c1x (number) x of the first anchor of the curve
     - c1y (number) y of the first anchor of the curve
     - c2x (number) x of the second anchor of the curve
     - c2y (number) y of the second anchor of the curve
     - p2x (number) x of the second point of the curve
     - p2y (number) y of the second point of the curve
     * or
     - bez (array) array of six points for bezier curve
     = (object) point information in format:
     o {
     o     min: {
     o         x: (number) x coordinate of the left point
     o         y: (number) y coordinate of the top point
     o     }
     o     max: {
     o         x: (number) x coordinate of the right point
     o         y: (number) y coordinate of the bottom point
     o     }
     o }
    \*/
    R.bezierBBox = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
        if (!R.is(p1x, "array")) {
            p1x = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y];
        }
        var bbox = curveDim.apply(null, p1x);
        return {
            x: bbox.min.x,
            y: bbox.min.y,
            x2: bbox.max.x,
            y2: bbox.max.y,
            width: bbox.max.x - bbox.min.x,
            height: bbox.max.y - bbox.min.y
        };
    };
    /*\
     * Raphael.isPointInsideBBox
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if given point is inside bounding boxes.
     > Parameters
     - bbox (string) bounding box
     - x (string) x coordinate of the point
     - y (string) y coordinate of the point
     = (boolean) `true` if point inside
    \*/
    R.isPointInsideBBox = function (bbox, x, y) {
        return x >= bbox.x && x <= bbox.x2 && y >= bbox.y && y <= bbox.y2;
    };
    /*\
     * Raphael.isBBoxIntersect
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if two bounding boxes intersect
     > Parameters
     - bbox1 (string) first bounding box
     - bbox2 (string) second bounding box
     = (boolean) `true` if they intersect
    \*/
    R.isBBoxIntersect = function (bbox1, bbox2) {
        var i = R.isPointInsideBBox;
        return i(bbox2, bbox1.x, bbox1.y)
            || i(bbox2, bbox1.x2, bbox1.y)
            || i(bbox2, bbox1.x, bbox1.y2)
            || i(bbox2, bbox1.x2, bbox1.y2)
            || i(bbox1, bbox2.x, bbox2.y)
            || i(bbox1, bbox2.x2, bbox2.y)
            || i(bbox1, bbox2.x, bbox2.y2)
            || i(bbox1, bbox2.x2, bbox2.y2)
            || (bbox1.x < bbox2.x2 && bbox1.x > bbox2.x || bbox2.x < bbox1.x2 && bbox2.x > bbox1.x)
            && (bbox1.y < bbox2.y2 && bbox1.y > bbox2.y || bbox2.y < bbox1.y2 && bbox2.y > bbox1.y);
    };
    function base3(t, p1, p2, p3, p4) {
        var t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
            t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
        return t * t2 - 3 * p1 + 3 * p2;
    }
    function bezlen(x1, y1, x2, y2, x3, y3, x4, y4, z) {
        if (z == null) {
            z = 1;
        }
        z = z > 1 ? 1 : z < 0 ? 0 : z;
        var z2 = z / 2,
            n = 12,
            Tvalues = [-0.1252,0.1252,-0.3678,0.3678,-0.5873,0.5873,-0.7699,0.7699,-0.9041,0.9041,-0.9816,0.9816],
            Cvalues = [0.2491,0.2491,0.2335,0.2335,0.2032,0.2032,0.1601,0.1601,0.1069,0.1069,0.0472,0.0472],
            sum = 0;
        for (var i = 0; i < n; i++) {
            var ct = z2 * Tvalues[i] + z2,
                xbase = base3(ct, x1, x2, x3, x4),
                ybase = base3(ct, y1, y2, y3, y4),
                comb = xbase * xbase + ybase * ybase;
            sum += Cvalues[i] * math.sqrt(comb);
        }
        return z2 * sum;
    }
    function getTatLen(x1, y1, x2, y2, x3, y3, x4, y4, ll) {
        if (ll < 0 || bezlen(x1, y1, x2, y2, x3, y3, x4, y4) < ll) {
            return;
        }
        var t = 1,
            step = t / 2,
            t2 = t - step,
            l,
            e = .01;
        l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
        while (abs(l - ll) > e) {
            step /= 2;
            t2 += (l < ll ? 1 : -1) * step;
            l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
        }
        return t2;
    }
    function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        if (
            mmax(x1, x2) < mmin(x3, x4) ||
            mmin(x1, x2) > mmax(x3, x4) ||
            mmax(y1, y2) < mmin(y3, y4) ||
            mmin(y1, y2) > mmax(y3, y4)
        ) {
            return;
        }
        var nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
            ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
            denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

        if (!denominator) {
            return;
        }
        var px = nx / denominator,
            py = ny / denominator,
            px2 = +px.toFixed(2),
            py2 = +py.toFixed(2);
        if (
            px2 < +mmin(x1, x2).toFixed(2) ||
            px2 > +mmax(x1, x2).toFixed(2) ||
            px2 < +mmin(x3, x4).toFixed(2) ||
            px2 > +mmax(x3, x4).toFixed(2) ||
            py2 < +mmin(y1, y2).toFixed(2) ||
            py2 > +mmax(y1, y2).toFixed(2) ||
            py2 < +mmin(y3, y4).toFixed(2) ||
            py2 > +mmax(y3, y4).toFixed(2)
        ) {
            return;
        }
        return {x: px, y: py};
    }
    function inter(bez1, bez2) {
        return interHelper(bez1, bez2);
    }
    function interCount(bez1, bez2) {
        return interHelper(bez1, bez2, 1);
    }
    function interHelper(bez1, bez2, justCount) {
        var bbox1 = R.bezierBBox(bez1),
            bbox2 = R.bezierBBox(bez2);
        if (!R.isBBoxIntersect(bbox1, bbox2)) {
            return justCount ? 0 : [];
        }
        var l1 = bezlen.apply(0, bez1),
            l2 = bezlen.apply(0, bez2),
            n1 = ~~(l1 / 5),
            n2 = ~~(l2 / 5),
            dots1 = [],
            dots2 = [],
            xy = {},
            res = justCount ? 0 : [];
        for (var i = 0; i < n1 + 1; i++) {
            var p = R.findDotsAtSegment.apply(R, bez1.concat(i / n1));
            dots1.push({x: p.x, y: p.y, t: i / n1});
        }
        for (i = 0; i < n2 + 1; i++) {
            p = R.findDotsAtSegment.apply(R, bez2.concat(i / n2));
            dots2.push({x: p.x, y: p.y, t: i / n2});
        }
        for (i = 0; i < n1; i++) {
            for (var j = 0; j < n2; j++) {
                var di = dots1[i],
                    di1 = dots1[i + 1],
                    dj = dots2[j],
                    dj1 = dots2[j + 1],
                    ci = abs(di1.x - di.x) < .001 ? "y" : "x",
                    cj = abs(dj1.x - dj.x) < .001 ? "y" : "x",
                    is = intersect(di.x, di.y, di1.x, di1.y, dj.x, dj.y, dj1.x, dj1.y);
                if (is) {
                    if (xy[is.x.toFixed(4)] == is.y.toFixed(4)) {
                        continue;
                    }
                    xy[is.x.toFixed(4)] = is.y.toFixed(4);
                    var t1 = di.t + abs((is[ci] - di[ci]) / (di1[ci] - di[ci])) * (di1.t - di.t),
                        t2 = dj.t + abs((is[cj] - dj[cj]) / (dj1[cj] - dj[cj])) * (dj1.t - dj.t);
                    if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
                        if (justCount) {
                            res++;
                        } else {
                            res.push({
                                x: is.x,
                                y: is.y,
                                t1: t1,
                                t2: t2
                            });
                        }
                    }
                }
            }
        }
        return res;
    }
    /*\
     * Raphael.pathIntersection
     [ method ]
     **
     * Utility method
     **
     * Finds intersections of two paths
     > Parameters
     - path1 (string) path string
     - path2 (string) path string
     = (array) dots of intersection
     o [
     o     {
     o         x: (number) x coordinate of the point
     o         y: (number) y coordinate of the point
     o         t1: (number) t value for segment of path1
     o         t2: (number) t value for segment of path2
     o         segment1: (number) order number for segment of path1
     o         segment2: (number) order number for segment of path2
     o         bez1: (array) eight coordinates representing beziér curve for the segment of path1
     o         bez2: (array) eight coordinates representing beziér curve for the segment of path2
     o     }
     o ]
    \*/
    R.pathIntersection = function (path1, path2) {
        return interPathHelper(path1, path2);
    };
    R.pathIntersectionNumber = function (path1, path2) {
        return interPathHelper(path1, path2, 1);
    };
    function interPathHelper(path1, path2, justCount) {
        path1 = R._path2curve(path1);
        path2 = R._path2curve(path2);
        var x1, y1, x2, y2, x1m, y1m, x2m, y2m, bez1, bez2,
            res = justCount ? 0 : [];
        for (var i = 0, ii = path1.length; i < ii; i++) {
            var pi = path1[i];
            if (pi[0] == "M") {
                x1 = x1m = pi[1];
                y1 = y1m = pi[2];
            } else {
                if (pi[0] == "C") {
                    bez1 = [x1, y1].concat(pi.slice(1));
                    x1 = bez1[6];
                    y1 = bez1[7];
                } else {
                    bez1 = [x1, y1, x1, y1, x1m, y1m, x1m, y1m];
                    x1 = x1m;
                    y1 = y1m;
                }
                for (var j = 0, jj = path2.length; j < jj; j++) {
                    var pj = path2[j];
                    if (pj[0] == "M") {
                        x2 = x2m = pj[1];
                        y2 = y2m = pj[2];
                    } else {
                        if (pj[0] == "C") {
                            bez2 = [x2, y2].concat(pj.slice(1));
                            x2 = bez2[6];
                            y2 = bez2[7];
                        } else {
                            bez2 = [x2, y2, x2, y2, x2m, y2m, x2m, y2m];
                            x2 = x2m;
                            y2 = y2m;
                        }
                        var intr = interHelper(bez1, bez2, justCount);
                        if (justCount) {
                            res += intr;
                        } else {
                            for (var k = 0, kk = intr.length; k < kk; k++) {
                                intr[k].segment1 = i;
                                intr[k].segment2 = j;
                                intr[k].bez1 = bez1;
                                intr[k].bez2 = bez2;
                            }
                            res = res.concat(intr);
                        }
                    }
                }
            }
        }
        return res;
    }
    /*\
     * Raphael.isPointInsidePath
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if given point is inside a given closed path.
     > Parameters
     - path (string) path string
     - x (number) x of the point
     - y (number) y of the point
     = (boolean) true, if point is inside the path
    \*/
    R.isPointInsidePath = function (path, x, y) {
        var bbox = R.pathBBox(path);
        return R.isPointInsideBBox(bbox, x, y) &&
               interPathHelper(path, [["M", x, y], ["H", bbox.x2 + 10]], 1) % 2 == 1;
    };
    R._removedFactory = function (methodname) {
        return function () {
            eve("raphael.log", null, "Rapha\xebl: you are calling to method \u201c" + methodname + "\u201d of removed object", methodname);
        };
    };
    /*\
     * Raphael.pathBBox
     [ method ]
     **
     * Utility method
     **
     * Return bounding box of a given path
     > Parameters
     - path (string) path string
     = (object) bounding box
     o {
     o     x: (number) x coordinate of the left top point of the box
     o     y: (number) y coordinate of the left top point of the box
     o     x2: (number) x coordinate of the right bottom point of the box
     o     y2: (number) y coordinate of the right bottom point of the box
     o     width: (number) width of the box
     o     height: (number) height of the box
     o     cx: (number) x coordinate of the center of the box
     o     cy: (number) y coordinate of the center of the box
     o }
    \*/
    var pathDimensions = R.pathBBox = function (path) {
        var pth = paths(path);
        if (pth.bbox) {
            return clone(pth.bbox);
        }
        if (!path) {
            return {x: 0, y: 0, width: 0, height: 0, x2: 0, y2: 0};
        }
        path = path2curve(path);
        var x = 0, 
            y = 0,
            X = [],
            Y = [],
            p;
        for (var i = 0, ii = path.length; i < ii; i++) {
            p = path[i];
            if (p[0] == "M") {
                x = p[1];
                y = p[2];
                X.push(x);
                Y.push(y);
            } else {
                var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                X = X[concat](dim.min.x, dim.max.x);
                Y = Y[concat](dim.min.y, dim.max.y);
                x = p[5];
                y = p[6];
            }
        }
        var xmin = mmin[apply](0, X),
            ymin = mmin[apply](0, Y),
            xmax = mmax[apply](0, X),
            ymax = mmax[apply](0, Y),
            width = xmax - xmin,
            height = ymax - ymin,
                bb = {
                x: xmin,
                y: ymin,
                x2: xmax,
                y2: ymax,
                width: width,
                height: height,
                cx: xmin + width / 2,
                cy: ymin + height / 2
            };
        pth.bbox = clone(bb);
        return bb;
    },
        pathClone = function (pathArray) {
            var res = clone(pathArray);
            res.toString = R._path2string;
            return res;
        },
        pathToRelative = R._pathToRelative = function (pathArray) {
            var pth = paths(pathArray);
            if (pth.rel) {
                return pathClone(pth.rel);
            }
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = pathArray[0][1];
                y = pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res.push(["M", x, y]);
            }
            for (var i = start, ii = pathArray.length; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != lowerCase.call(pa[0])) {
                    r[0] = lowerCase.call(pa[0]);
                    switch (r[0]) {
                        case "a":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] - x).toFixed(3);
                            r[7] = +(pa[7] - y).toFixed(3);
                            break;
                        case "v":
                            r[1] = +(pa[1] - y).toFixed(3);
                            break;
                        case "m":
                            mx = pa[1];
                            my = pa[2];
                        default:
                            for (var j = 1, jj = pa.length; j < jj; j++) {
                                r[j] = +(pa[j] - ((j % 2) ? x : y)).toFixed(3);
                            }
                    }
                } else {
                    r = res[i] = [];
                    if (pa[0] == "m") {
                        mx = pa[1] + x;
                        my = pa[2] + y;
                    }
                    for (var k = 0, kk = pa.length; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                var len = res[i].length;
                switch (res[i][0]) {
                    case "z":
                        x = mx;
                        y = my;
                        break;
                    case "h":
                        x += +res[i][len - 1];
                        break;
                    case "v":
                        y += +res[i][len - 1];
                        break;
                    default:
                        x += +res[i][len - 2];
                        y += +res[i][len - 1];
                }
            }
            res.toString = R._path2string;
            pth.rel = pathClone(res);
            return res;
        },
        pathToAbsolute = R._pathToAbsolute = function (pathArray) {
            var pth = paths(pathArray);
            if (pth.abs) {
                return pathClone(pth.abs);
            }
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            if (!pathArray || !pathArray.length) {
                return [["M", 0, 0]];
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = +pathArray[0][1];
                y = +pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[0] = ["M", x, y];
            }
            var crz = pathArray.length == 3 && pathArray[0][0] == "M" && pathArray[1][0].toUpperCase() == "R" && pathArray[2][0].toUpperCase() == "Z";
            for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
                res.push(r = []);
                pa = pathArray[i];
                if (pa[0] != upperCase.call(pa[0])) {
                    r[0] = upperCase.call(pa[0]);
                    switch (r[0]) {
                        case "A":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] + x);
                            r[7] = +(pa[7] + y);
                            break;
                        case "V":
                            r[1] = +pa[1] + y;
                            break;
                        case "H":
                            r[1] = +pa[1] + x;
                            break;
                        case "R":
                            var dots = [x, y][concat](pa.slice(1));
                            for (var j = 2, jj = dots.length; j < jj; j++) {
                                dots[j] = +dots[j] + x;
                                dots[++j] = +dots[j] + y;
                            }
                            res.pop();
                            res = res[concat](catmullRom2bezier(dots, crz));
                            break;
                        case "M":
                            mx = +pa[1] + x;
                            my = +pa[2] + y;
                        default:
                            for (j = 1, jj = pa.length; j < jj; j++) {
                                r[j] = +pa[j] + ((j % 2) ? x : y);
                            }
                    }
                } else if (pa[0] == "R") {
                    dots = [x, y][concat](pa.slice(1));
                    res.pop();
                    res = res[concat](catmullRom2bezier(dots, crz));
                    r = ["R"][concat](pa.slice(-2));
                } else {
                    for (var k = 0, kk = pa.length; k < kk; k++) {
                        r[k] = pa[k];
                    }
                }
                switch (r[0]) {
                    case "Z":
                        x = mx;
                        y = my;
                        break;
                    case "H":
                        x = r[1];
                        break;
                    case "V":
                        y = r[1];
                        break;
                    case "M":
                        mx = r[r.length - 2];
                        my = r[r.length - 1];
                    default:
                        x = r[r.length - 2];
                        y = r[r.length - 1];
                }
            }
            res.toString = R._path2string;
            pth.abs = pathClone(res);
            return res;
        },
        l2c = function (x1, y1, x2, y2) {
            return [x1, y1, x2, y2, x2, y2];
        },
        q2c = function (x1, y1, ax, ay, x2, y2) {
            var _13 = 1 / 3,
                _23 = 2 / 3;
            return [
                    _13 * x1 + _23 * ax,
                    _13 * y1 + _23 * ay,
                    _13 * x2 + _23 * ax,
                    _13 * y2 + _23 * ay,
                    x2,
                    y2
                ];
        },
        a2c = function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
            // for more information of where this math came from visit:
            // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
            var _120 = PI * 120 / 180,
                rad = PI / 180 * (+angle || 0),
                res = [],
                xy,
                rotate = cacher(function (x, y, rad) {
                    var X = x * math.cos(rad) - y * math.sin(rad),
                        Y = x * math.sin(rad) + y * math.cos(rad);
                    return {x: X, y: Y};
                });
            if (!recursive) {
                xy = rotate(x1, y1, -rad);
                x1 = xy.x;
                y1 = xy.y;
                xy = rotate(x2, y2, -rad);
                x2 = xy.x;
                y2 = xy.y;
                var cos = math.cos(PI / 180 * angle),
                    sin = math.sin(PI / 180 * angle),
                    x = (x1 - x2) / 2,
                    y = (y1 - y2) / 2;
                var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
                if (h > 1) {
                    h = math.sqrt(h);
                    rx = h * rx;
                    ry = h * ry;
                }
                var rx2 = rx * rx,
                    ry2 = ry * ry,
                    k = (large_arc_flag == sweep_flag ? -1 : 1) *
                        math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                    cx = k * rx * y / ry + (x1 + x2) / 2,
                    cy = k * -ry * x / rx + (y1 + y2) / 2,
                    f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
                    f2 = math.asin(((y2 - cy) / ry).toFixed(9));

                f1 = x1 < cx ? PI - f1 : f1;
                f2 = x2 < cx ? PI - f2 : f2;
                f1 < 0 && (f1 = PI * 2 + f1);
                f2 < 0 && (f2 = PI * 2 + f2);
                if (sweep_flag && f1 > f2) {
                    f1 = f1 - PI * 2;
                }
                if (!sweep_flag && f2 > f1) {
                    f2 = f2 - PI * 2;
                }
            } else {
                f1 = recursive[0];
                f2 = recursive[1];
                cx = recursive[2];
                cy = recursive[3];
            }
            var df = f2 - f1;
            if (abs(df) > _120) {
                var f2old = f2,
                    x2old = x2,
                    y2old = y2;
                f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
                x2 = cx + rx * math.cos(f2);
                y2 = cy + ry * math.sin(f2);
                res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
            }
            df = f2 - f1;
            var c1 = math.cos(f1),
                s1 = math.sin(f1),
                c2 = math.cos(f2),
                s2 = math.sin(f2),
                t = math.tan(df / 4),
                hx = 4 / 3 * rx * t,
                hy = 4 / 3 * ry * t,
                m1 = [x1, y1],
                m2 = [x1 + hx * s1, y1 - hy * c1],
                m3 = [x2 + hx * s2, y2 - hy * c2],
                m4 = [x2, y2];
            m2[0] = 2 * m1[0] - m2[0];
            m2[1] = 2 * m1[1] - m2[1];
            if (recursive) {
                return [m2, m3, m4][concat](res);
            } else {
                res = [m2, m3, m4][concat](res).join()[split](",");
                var newres = [];
                for (var i = 0, ii = res.length; i < ii; i++) {
                    newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
                }
                return newres;
            }
        },
        findDotAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
            var t1 = 1 - t;
            return {
                x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
            };
        },
        curveDim = cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
            var a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
                b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
                c = p1x - c1x,
                t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a,
                t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a,
                y = [p1y, p2y],
                x = [p1x, p2x],
                dot;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x.push(dot.x);
                y.push(dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x.push(dot.x);
                y.push(dot.y);
            }
            a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
            b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
            c = p1y - c1y;
            t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a;
            t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x.push(dot.x);
                y.push(dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x.push(dot.x);
                y.push(dot.y);
            }
            return {
                min: {x: mmin[apply](0, x), y: mmin[apply](0, y)},
                max: {x: mmax[apply](0, x), y: mmax[apply](0, y)}
            };
        }),
        path2curve = R._path2curve = cacher(function (path, path2) {
            var pth = !path2 && paths(path);
            if (!path2 && pth.curve) {
                return pathClone(pth.curve);
            }
            var p = pathToAbsolute(path),
                p2 = path2 && pathToAbsolute(path2),
                attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                processPath = function (path, d) {
                    var nx, ny;
                    if (!path) {
                        return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                    }
                    !(path[0] in {T:1, Q:1}) && (d.qx = d.qy = null);
                    switch (path[0]) {
                        case "M":
                            d.X = path[1];
                            d.Y = path[2];
                            break;
                        case "A":
                            path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                            break;
                        case "S":
                            nx = d.x + (d.x - (d.bx || d.x));
                            ny = d.y + (d.y - (d.by || d.y));
                            path = ["C", nx, ny][concat](path.slice(1));
                            break;
                        case "T":
                            d.qx = d.x + (d.x - (d.qx || d.x));
                            d.qy = d.y + (d.y - (d.qy || d.y));
                            path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                            break;
                        case "Q":
                            d.qx = path[1];
                            d.qy = path[2];
                            path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                            break;
                        case "L":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                            break;
                        case "H":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                            break;
                        case "V":
                            path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                            break;
                        case "Z":
                            path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                            break;
                    }
                    return path;
                },
                fixArc = function (pp, i) {
                    if (pp[i].length > 7) {
                        pp[i].shift();
                        var pi = pp[i];
                        while (pi.length) {
                            pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
                        }
                        pp.splice(i, 1);
                        ii = mmax(p.length, p2 && p2.length || 0);
                    }
                },
                fixM = function (path1, path2, a1, a2, i) {
                    if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                        path2.splice(i, 0, ["M", a2.x, a2.y]);
                        a1.bx = 0;
                        a1.by = 0;
                        a1.x = path1[i][1];
                        a1.y = path1[i][2];
                        ii = mmax(p.length, p2 && p2.length || 0);
                    }
                };
            for (var i = 0, ii = mmax(p.length, p2 && p2.length || 0); i < ii; i++) {
                p[i] = processPath(p[i], attrs);
                fixArc(p, i);
                p2 && (p2[i] = processPath(p2[i], attrs2));
                p2 && fixArc(p2, i);
                fixM(p, p2, attrs, attrs2, i);
                fixM(p2, p, attrs2, attrs, i);
                var seg = p[i],
                    seg2 = p2 && p2[i],
                    seglen = seg.length,
                    seg2len = p2 && seg2.length;
                attrs.x = seg[seglen - 2];
                attrs.y = seg[seglen - 1];
                attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
                attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
                attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
                attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
                attrs2.x = p2 && seg2[seg2len - 2];
                attrs2.y = p2 && seg2[seg2len - 1];
            }
            if (!p2) {
                pth.curve = pathClone(p);
            }
            return p2 ? [p, p2] : p;
        }, null, pathClone),
        parseDots = R._parseDots = cacher(function (gradient) {
            var dots = [];
            for (var i = 0, ii = gradient.length; i < ii; i++) {
                var dot = {},
                    par = gradient[i].match(/^([^:]*):?([\d\.]*)/);
                dot.color = R.getRGB(par[1]);
                if (dot.color.error) {
                    return null;
                }
                dot.color = dot.color.hex;
                par[2] && (dot.offset = par[2] + "%");
                dots.push(dot);
            }
            for (i = 1, ii = dots.length - 1; i < ii; i++) {
                if (!dots[i].offset) {
                    var start = toFloat(dots[i - 1].offset || 0),
                        end = 0;
                    for (var j = i + 1; j < ii; j++) {
                        if (dots[j].offset) {
                            end = dots[j].offset;
                            break;
                        }
                    }
                    if (!end) {
                        end = 100;
                        j = ii;
                    }
                    end = toFloat(end);
                    var d = (end - start) / (j - i + 1);
                    for (; i < j; i++) {
                        start += d;
                        dots[i].offset = start + "%";
                    }
                }
            }
            return dots;
        }),
        tear = R._tear = function (el, paper) {
            el == paper.top && (paper.top = el.prev);
            el == paper.bottom && (paper.bottom = el.next);
            el.next && (el.next.prev = el.prev);
            el.prev && (el.prev.next = el.next);
        },
        tofront = R._tofront = function (el, paper) {
            if (paper.top === el) {
                return;
            }
            tear(el, paper);
            el.next = null;
            el.prev = paper.top;
            paper.top.next = el;
            paper.top = el;
        },
        toback = R._toback = function (el, paper) {
            if (paper.bottom === el) {
                return;
            }
            tear(el, paper);
            el.next = paper.bottom;
            el.prev = null;
            paper.bottom.prev = el;
            paper.bottom = el;
        },
        insertafter = R._insertafter = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.top && (paper.top = el);
            el2.next && (el2.next.prev = el);
            el.next = el2.next;
            el.prev = el2;
            el2.next = el;
        },
        insertbefore = R._insertbefore = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.bottom && (paper.bottom = el);
            el2.prev && (el2.prev.next = el);
            el.prev = el2.prev;
            el2.prev = el;
            el.next = el2;
        },
        /*\
         * Raphael.toMatrix
         [ method ]
         **
         * Utility method
         **
         * Returns matrix of transformations applied to a given path
         > Parameters
         - path (string) path string
         - transform (string|array) transformation string
         = (object) @Matrix
        \*/
        toMatrix = R.toMatrix = function (path, transform) {
            var bb = pathDimensions(path),
                el = {
                    _: {
                        transform: E
                    },
                    getBBox: function () {
                        return bb;
                    }
                };
            extractTransform(el, transform);
            return el.matrix;
        },
        /*\
         * Raphael.transformPath
         [ method ]
         **
         * Utility method
         **
         * Returns path transformed by a given transformation
         > Parameters
         - path (string) path string
         - transform (string|array) transformation string
         = (string) path
        \*/
        transformPath = R.transformPath = function (path, transform) {
            return mapPath(path, toMatrix(path, transform));
        },
        extractTransform = R._extractTransform = function (el, tstr) {
            if (tstr == null) {
                return el._.transform;
            }
            tstr = Str(tstr).replace(/\.{3}|\u2026/g, el._.transform || E);
            var tdata = R.parseTransformString(tstr),
                deg = 0,
                dx = 0,
                dy = 0,
                sx = 1,
                sy = 1,
                _ = el._,
                m = new Matrix;
            _.transform = tdata || [];
            if (tdata) {
                for (var i = 0, ii = tdata.length; i < ii; i++) {
                    var t = tdata[i],
                        tlen = t.length,
                        command = Str(t[0]).toLowerCase(),
                        absolute = t[0] != command,
                        inver = absolute ? m.invert() : 0,
                        x1,
                        y1,
                        x2,
                        y2,
                        bb;
                    if (command == "t" && tlen == 3) {
                        if (absolute) {
                            x1 = inver.x(0, 0);
                            y1 = inver.y(0, 0);
                            x2 = inver.x(t[1], t[2]);
                            y2 = inver.y(t[1], t[2]);
                            m.translate(x2 - x1, y2 - y1);
                        } else {
                            m.translate(t[1], t[2]);
                        }
                    } else if (command == "r") {
                        if (tlen == 2) {
                            bb = bb || el.getBBox(1);
                            m.rotate(t[1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                            deg += t[1];
                        } else if (tlen == 4) {
                            if (absolute) {
                                x2 = inver.x(t[2], t[3]);
                                y2 = inver.y(t[2], t[3]);
                                m.rotate(t[1], x2, y2);
                            } else {
                                m.rotate(t[1], t[2], t[3]);
                            }
                            deg += t[1];
                        }
                    } else if (command == "s") {
                        if (tlen == 2 || tlen == 3) {
                            bb = bb || el.getBBox(1);
                            m.scale(t[1], t[tlen - 1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                            sx *= t[1];
                            sy *= t[tlen - 1];
                        } else if (tlen == 5) {
                            if (absolute) {
                                x2 = inver.x(t[3], t[4]);
                                y2 = inver.y(t[3], t[4]);
                                m.scale(t[1], t[2], x2, y2);
                            } else {
                                m.scale(t[1], t[2], t[3], t[4]);
                            }
                            sx *= t[1];
                            sy *= t[2];
                        }
                    } else if (command == "m" && tlen == 7) {
                        m.add(t[1], t[2], t[3], t[4], t[5], t[6]);
                    }
                    _.dirtyT = 1;
                    el.matrix = m;
                }
            }

            /*\
             * Element.matrix
             [ property (object) ]
             **
             * Keeps @Matrix object, which represents element transformation
            \*/
            el.matrix = m;

            _.sx = sx;
            _.sy = sy;
            _.deg = deg;
            _.dx = dx = m.e;
            _.dy = dy = m.f;

            if (sx == 1 && sy == 1 && !deg && _.bbox) {
                _.bbox.x += +dx;
                _.bbox.y += +dy;
            } else {
                _.dirtyT = 1;
            }
        },
        getEmpty = function (item) {
            var l = item[0];
            switch (l.toLowerCase()) {
                case "t": return [l, 0, 0];
                case "m": return [l, 1, 0, 0, 1, 0, 0];
                case "r": if (item.length == 4) {
                    return [l, 0, item[2], item[3]];
                } else {
                    return [l, 0];
                }
                case "s": if (item.length == 5) {
                    return [l, 1, 1, item[3], item[4]];
                } else if (item.length == 3) {
                    return [l, 1, 1];
                } else {
                    return [l, 1];
                }
            }
        },
        equaliseTransform = R._equaliseTransform = function (t1, t2) {
            t2 = Str(t2).replace(/\.{3}|\u2026/g, t1);
            t1 = R.parseTransformString(t1) || [];
            t2 = R.parseTransformString(t2) || [];
            var maxlength = mmax(t1.length, t2.length),
                from = [],
                to = [],
                i = 0, j, jj,
                tt1, tt2;
            for (; i < maxlength; i++) {
                tt1 = t1[i] || getEmpty(t2[i]);
                tt2 = t2[i] || getEmpty(tt1);
                if ((tt1[0] != tt2[0]) ||
                    (tt1[0].toLowerCase() == "r" && (tt1[2] != tt2[2] || tt1[3] != tt2[3])) ||
                    (tt1[0].toLowerCase() == "s" && (tt1[3] != tt2[3] || tt1[4] != tt2[4]))
                    ) {
                    return;
                }
                from[i] = [];
                to[i] = [];
                for (j = 0, jj = mmax(tt1.length, tt2.length); j < jj; j++) {
                    j in tt1 && (from[i][j] = tt1[j]);
                    j in tt2 && (to[i][j] = tt2[j]);
                }
            }
            return {
                from: from,
                to: to
            };
        };
    R._getContainer = function (x, y, w, h) {
        var container;
        container = h == null && !R.is(x, "object") ? g.doc.getElementById(x) : x;
        if (container == null) {
            return;
        }
        if (container.tagName) {
            if (y == null) {
                return {
                    container: container,
                    width: container.style.pixelWidth || container.offsetWidth,
                    height: container.style.pixelHeight || container.offsetHeight
                };
            } else {
                return {
                    container: container,
                    width: y,
                    height: w
                };
            }
        }
        return {
            container: 1,
            x: x,
            y: y,
            width: w,
            height: h
        };
    };
    /*\
     * Raphael.pathToRelative
     [ method ]
     **
     * Utility method
     **
     * Converts path to relative form
     > Parameters
     - pathString (string|array) path string or array of segments
     = (array) array of segments.
    \*/
    R.pathToRelative = pathToRelative;
    R._engine = {};
    /*\
     * Raphael.path2curve
     [ method ]
     **
     * Utility method
     **
     * Converts path to a new path where all segments are cubic bezier curves.
     > Parameters
     - pathString (string|array) path string or array of segments
     = (array) array of segments.
    \*/
    R.path2curve = path2curve;
    /*\
     * Raphael.matrix
     [ method ]
     **
     * Utility method
     **
     * Returns matrix based on given parameters.
     > Parameters
     - a (number)
     - b (number)
     - c (number)
     - d (number)
     - e (number)
     - f (number)
     = (object) @Matrix
    \*/
    R.matrix = function (a, b, c, d, e, f) {
        return new Matrix(a, b, c, d, e, f);
    };
    function Matrix(a, b, c, d, e, f) {
        if (a != null) {
            this.a = +a;
            this.b = +b;
            this.c = +c;
            this.d = +d;
            this.e = +e;
            this.f = +f;
        } else {
            this.a = 1;
            this.b = 0;
            this.c = 0;
            this.d = 1;
            this.e = 0;
            this.f = 0;
        }
    }
    (function (matrixproto) {
        /*\
         * Matrix.add
         [ method ]
         **
         * Adds given matrix to existing one.
         > Parameters
         - a (number)
         - b (number)
         - c (number)
         - d (number)
         - e (number)
         - f (number)
         or
         - matrix (object) @Matrix
        \*/
        matrixproto.add = function (a, b, c, d, e, f) {
            var out = [[], [], []],
                m = [[this.a, this.c, this.e], [this.b, this.d, this.f], [0, 0, 1]],
                matrix = [[a, c, e], [b, d, f], [0, 0, 1]],
                x, y, z, res;

            if (a && a instanceof Matrix) {
                matrix = [[a.a, a.c, a.e], [a.b, a.d, a.f], [0, 0, 1]];
            }

            for (x = 0; x < 3; x++) {
                for (y = 0; y < 3; y++) {
                    res = 0;
                    for (z = 0; z < 3; z++) {
                        res += m[x][z] * matrix[z][y];
                    }
                    out[x][y] = res;
                }
            }
            this.a = out[0][0];
            this.b = out[1][0];
            this.c = out[0][1];
            this.d = out[1][1];
            this.e = out[0][2];
            this.f = out[1][2];
        };
        /*\
         * Matrix.invert
         [ method ]
         **
         * Returns inverted version of the matrix
         = (object) @Matrix
        \*/
        matrixproto.invert = function () {
            var me = this,
                x = me.a * me.d - me.b * me.c;
            return new Matrix(me.d / x, -me.b / x, -me.c / x, me.a / x, (me.c * me.f - me.d * me.e) / x, (me.b * me.e - me.a * me.f) / x);
        };
        /*\
         * Matrix.clone
         [ method ]
         **
         * Returns copy of the matrix
         = (object) @Matrix
        \*/
        matrixproto.clone = function () {
            return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
        };
        /*\
         * Matrix.translate
         [ method ]
         **
         * Translate the matrix
         > Parameters
         - x (number)
         - y (number)
        \*/
        matrixproto.translate = function (x, y) {
            this.add(1, 0, 0, 1, x, y);
        };
        /*\
         * Matrix.scale
         [ method ]
         **
         * Scales the matrix
         > Parameters
         - x (number)
         - y (number) #optional
         - cx (number) #optional
         - cy (number) #optional
        \*/
        matrixproto.scale = function (x, y, cx, cy) {
            y == null && (y = x);
            (cx || cy) && this.add(1, 0, 0, 1, cx, cy);
            this.add(x, 0, 0, y, 0, 0);
            (cx || cy) && this.add(1, 0, 0, 1, -cx, -cy);
        };
        /*\
         * Matrix.rotate
         [ method ]
         **
         * Rotates the matrix
         > Parameters
         - a (number)
         - x (number)
         - y (number)
        \*/
        matrixproto.rotate = function (a, x, y) {
            a = R.rad(a);
            x = x || 0;
            y = y || 0;
            var cos = +math.cos(a).toFixed(9),
                sin = +math.sin(a).toFixed(9);
            this.add(cos, sin, -sin, cos, x, y);
            this.add(1, 0, 0, 1, -x, -y);
        };
        /*\
         * Matrix.x
         [ method ]
         **
         * Return x coordinate for given point after transformation described by the matrix. See also @Matrix.y
         > Parameters
         - x (number)
         - y (number)
         = (number) x
        \*/
        matrixproto.x = function (x, y) {
            return x * this.a + y * this.c + this.e;
        };
        /*\
         * Matrix.y
         [ method ]
         **
         * Return y coordinate for given point after transformation described by the matrix. See also @Matrix.x
         > Parameters
         - x (number)
         - y (number)
         = (number) y
        \*/
        matrixproto.y = function (x, y) {
            return x * this.b + y * this.d + this.f;
        };
        matrixproto.get = function (i) {
            return +this[Str.fromCharCode(97 + i)].toFixed(4);
        };
        matrixproto.toString = function () {
            return R.svg ?
                "matrix(" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)].join() + ")" :
                [this.get(0), this.get(2), this.get(1), this.get(3), 0, 0].join();
        };
        matrixproto.toFilter = function () {
            return "progid:DXImageTransform.Microsoft.Matrix(M11=" + this.get(0) +
                ", M12=" + this.get(2) + ", M21=" + this.get(1) + ", M22=" + this.get(3) +
                ", Dx=" + this.get(4) + ", Dy=" + this.get(5) + ", sizingmethod='auto expand')";
        };
        matrixproto.offset = function () {
            return [this.e.toFixed(4), this.f.toFixed(4)];
        };
        function norm(a) {
            return a[0] * a[0] + a[1] * a[1];
        }
        function normalize(a) {
            var mag = math.sqrt(norm(a));
            a[0] && (a[0] /= mag);
            a[1] && (a[1] /= mag);
        }
        /*\
         * Matrix.split
         [ method ]
         **
         * Splits matrix into primitive transformations
         = (object) in format:
         o dx (number) translation by x
         o dy (number) translation by y
         o scalex (number) scale by x
         o scaley (number) scale by y
         o shear (number) shear
         o rotate (number) rotation in deg
         o isSimple (boolean) could it be represented via simple transformations
        \*/
        matrixproto.split = function () {
            var out = {};
            // translation
            out.dx = this.e;
            out.dy = this.f;

            // scale and shear
            var row = [[this.a, this.c], [this.b, this.d]];
            out.scalex = math.sqrt(norm(row[0]));
            normalize(row[0]);

            out.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
            row[1] = [row[1][0] - row[0][0] * out.shear, row[1][1] - row[0][1] * out.shear];

            out.scaley = math.sqrt(norm(row[1]));
            normalize(row[1]);
            out.shear /= out.scaley;

            // rotation
            var sin = -row[0][1],
                cos = row[1][1];
            if (cos < 0) {
                out.rotate = R.deg(math.acos(cos));
                if (sin < 0) {
                    out.rotate = 360 - out.rotate;
                }
            } else {
                out.rotate = R.deg(math.asin(sin));
            }

            out.isSimple = !+out.shear.toFixed(9) && (out.scalex.toFixed(9) == out.scaley.toFixed(9) || !out.rotate);
            out.isSuperSimple = !+out.shear.toFixed(9) && out.scalex.toFixed(9) == out.scaley.toFixed(9) && !out.rotate;
            out.noRotation = !+out.shear.toFixed(9) && !out.rotate;
            return out;
        };
        /*\
         * Matrix.toTransformString
         [ method ]
         **
         * Return transform string that represents given matrix
         = (string) transform string
        \*/
        matrixproto.toTransformString = function (shorter) {
            var s = shorter || this[split]();
            if (s.isSimple) {
                s.scalex = +s.scalex.toFixed(4);
                s.scaley = +s.scaley.toFixed(4);
                s.rotate = +s.rotate.toFixed(4);
                return  (s.dx || s.dy ? "t" + [s.dx, s.dy] : E) + 
                        (s.scalex != 1 || s.scaley != 1 ? "s" + [s.scalex, s.scaley, 0, 0] : E) +
                        (s.rotate ? "r" + [s.rotate, 0, 0] : E);
            } else {
                return "m" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)];
            }
        };
    })(Matrix.prototype);

    // WebKit rendering bug workaround method
    var version = navigator.userAgent.match(/Version\/(.*?)\s/) || navigator.userAgent.match(/Chrome\/(\d+)/);
    if ((navigator.vendor == "Apple Computer, Inc.") && (version && version[1] < 4 || navigator.platform.slice(0, 2) == "iP") ||
        (navigator.vendor == "Google Inc." && version && version[1] < 8)) {
        /*\
         * Paper.safari
         [ method ]
         **
         * There is an inconvenient rendering bug in Safari (WebKit):
         * sometimes the rendering should be forced.
         * This method should help with dealing with this bug.
        \*/
        paperproto.safari = function () {
            var rect = this.rect(-99, -99, this.width + 99, this.height + 99).attr({stroke: "none"});
            setTimeout(function () {rect.remove();});
        };
    } else {
        paperproto.safari = fun;
    }
 
    var preventDefault = function () {
        this.returnValue = false;
    },
    preventTouch = function () {
        return this.originalEvent.preventDefault();
    },
    stopPropagation = function () {
        this.cancelBubble = true;
    },
    stopTouch = function () {
        return this.originalEvent.stopPropagation();
    },
    addEvent = (function () {
        if (g.doc.addEventListener) {
            return function (obj, type, fn, element) {
                var realName = supportsTouch && touchMap[type] ? touchMap[type] : type,
                    f = function (e) {
                        var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                            scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
                            x = e.clientX + scrollX,
                            y = e.clientY + scrollY;
                    if (supportsTouch && touchMap[has](type)) {
                        for (var i = 0, ii = e.targetTouches && e.targetTouches.length; i < ii; i++) {
                            if (e.targetTouches[i].target == obj) {
                                var olde = e;
                                e = e.targetTouches[i];
                                e.originalEvent = olde;
                                e.preventDefault = preventTouch;
                                e.stopPropagation = stopTouch;
                                break;
                            }
                        }
                    }
                    return fn.call(element, e, x, y);
                };
                obj.addEventListener(realName, f, false);
                return function () {
                    obj.removeEventListener(realName, f, false);
                    return true;
                };
            };
        } else if (g.doc.attachEvent) {
            return function (obj, type, fn, element) {
                var f = function (e) {
                    e = e || g.win.event;
                    var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                        scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
                        x = e.clientX + scrollX,
                        y = e.clientY + scrollY;
                    e.preventDefault = e.preventDefault || preventDefault;
                    e.stopPropagation = e.stopPropagation || stopPropagation;
                    return fn.call(element, e, x, y);
                };
                obj.attachEvent("on" + type, f);
                var detacher = function () {
                    obj.detachEvent("on" + type, f);
                    return true;
                };
                return detacher;
            };
        }
    })(),
    drag = [],
    dragMove = function (e) {
        var x = e.clientX,
            y = e.clientY,
            scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
            scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
            dragi,
            j = drag.length;
        while (j--) {
            dragi = drag[j];
            if (supportsTouch) {
                var i = e.touches.length,
                    touch;
                while (i--) {
                    touch = e.touches[i];
                    if (touch.identifier == dragi.el._drag.id) {
                        x = touch.clientX;
                        y = touch.clientY;
                        (e.originalEvent ? e.originalEvent : e).preventDefault();
                        break;
                    }
                }
            } else {
                e.preventDefault();
            }
            var node = dragi.el.node,
                o,
                next = node.nextSibling,
                parent = node.parentNode,
                display = node.style.display;
            g.win.opera && parent.removeChild(node);
            node.style.display = "none";
            o = dragi.el.paper.getElementByPoint(x, y);
            node.style.display = display;
            g.win.opera && (next ? parent.insertBefore(node, next) : parent.appendChild(node));
            o && eve("raphael.drag.over." + dragi.el.id, dragi.el, o);
            x += scrollX;
            y += scrollY;
            eve("raphael.drag.move." + dragi.el.id, dragi.move_scope || dragi.el, x - dragi.el._drag.x, y - dragi.el._drag.y, x, y, e);
        }
    },
    dragUp = function (e) {
        R.unmousemove(dragMove).unmouseup(dragUp);
        var i = drag.length,
            dragi;
        while (i--) {
            dragi = drag[i];
            dragi.el._drag = {};
            eve("raphael.drag.end." + dragi.el.id, dragi.end_scope || dragi.start_scope || dragi.move_scope || dragi.el, e);
        }
        drag = [];
    },
    /*\
     * Raphael.el
     [ property (object) ]
     **
     * You can add your own method to elements. This is usefull when you want to hack default functionality or
     * want to wrap some common transformation or attributes in one method. In difference to canvas methods,
     * you can redefine element method at any time. Expending element methods wouldn’t affect set.
     > Usage
     | Raphael.el.red = function () {
     |     this.attr({fill: "#f00"});
     | };
     | // then use it
     | paper.circle(100, 100, 20).red();
    \*/
    elproto = R.el = {};
    /*\
     * Element.click
     [ method ]
     **
     * Adds event handler for click for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unclick
     [ method ]
     **
     * Removes event handler for click for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.dblclick
     [ method ]
     **
     * Adds event handler for double click for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.undblclick
     [ method ]
     **
     * Removes event handler for double click for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.mousedown
     [ method ]
     **
     * Adds event handler for mousedown for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmousedown
     [ method ]
     **
     * Removes event handler for mousedown for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.mousemove
     [ method ]
     **
     * Adds event handler for mousemove for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmousemove
     [ method ]
     **
     * Removes event handler for mousemove for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.mouseout
     [ method ]
     **
     * Adds event handler for mouseout for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmouseout
     [ method ]
     **
     * Removes event handler for mouseout for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.mouseover
     [ method ]
     **
     * Adds event handler for mouseover for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmouseover
     [ method ]
     **
     * Removes event handler for mouseover for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.mouseup
     [ method ]
     **
     * Adds event handler for mouseup for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmouseup
     [ method ]
     **
     * Removes event handler for mouseup for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.touchstart
     [ method ]
     **
     * Adds event handler for touchstart for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchstart
     [ method ]
     **
     * Removes event handler for touchstart for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.touchmove
     [ method ]
     **
     * Adds event handler for touchmove for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchmove
     [ method ]
     **
     * Removes event handler for touchmove for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.touchend
     [ method ]
     **
     * Adds event handler for touchend for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchend
     [ method ]
     **
     * Removes event handler for touchend for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.touchcancel
     [ method ]
     **
     * Adds event handler for touchcancel for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchcancel
     [ method ]
     **
     * Removes event handler for touchcancel for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    for (var i = events.length; i--;) {
        (function (eventName) {
            R[eventName] = elproto[eventName] = function (fn, scope) {
                if (R.is(fn, "function")) {
                    this.events = this.events || [];
                    this.events.push({name: eventName, f: fn, unbind: addEvent(this.shape || this.node || g.doc, eventName, fn, scope || this)});
                }
                return this;
            };
            R["un" + eventName] = elproto["un" + eventName] = function (fn) {
                var events = this.events || [],
                    l = events.length;
                while (l--) if (events[l].name == eventName && events[l].f == fn) {
                    events[l].unbind();
                    events.splice(l, 1);
                    !events.length && delete this.events;
                    return this;
                }
                return this;
            };
        })(events[i]);
    }
    
    /*\
     * Element.data
     [ method ]
     **
     * Adds or retrieves given value asociated with given key.
     ** 
     * See also @Element.removeData
     > Parameters
     - key (string) key to store data
     - value (any) #optional value to store
     = (object) @Element
     * or, if value is not specified:
     = (any) value
     > Usage
     | for (var i = 0, i < 5, i++) {
     |     paper.circle(10 + 15 * i, 10, 10)
     |          .attr({fill: "#000"})
     |          .data("i", i)
     |          .click(function () {
     |             alert(this.data("i"));
     |          });
     | }
    \*/
    elproto.data = function (key, value) {
        var data = eldata[this.id] = eldata[this.id] || {};
        if (arguments.length == 1) {
            if (R.is(key, "object")) {
                for (var i in key) if (key[has](i)) {
                    this.data(i, key[i]);
                }
                return this;
            }
            eve("raphael.data.get." + this.id, this, data[key], key);
            return data[key];
        }
        data[key] = value;
        eve("raphael.data.set." + this.id, this, value, key);
        return this;
    };
    /*\
     * Element.removeData
     [ method ]
     **
     * Removes value associated with an element by given key.
     * If key is not provided, removes all the data of the element.
     > Parameters
     - key (string) #optional key
     = (object) @Element
    \*/
    elproto.removeData = function (key) {
        if (key == null) {
            eldata[this.id] = {};
        } else {
            eldata[this.id] && delete eldata[this.id][key];
        }
        return this;
    };
     /*\
     * Element.getData
     [ method ]
     **
     * Retrieves the element data
     = (object) data
    \*/
    elproto.getData = function () {
        return clone(eldata[this.id] || {});
    };
    /*\
     * Element.hover
     [ method ]
     **
     * Adds event handlers for hover for the element.
     > Parameters
     - f_in (function) handler for hover in
     - f_out (function) handler for hover out
     - icontext (object) #optional context for hover in handler
     - ocontext (object) #optional context for hover out handler
     = (object) @Element
    \*/
    elproto.hover = function (f_in, f_out, scope_in, scope_out) {
        return this.mouseover(f_in, scope_in).mouseout(f_out, scope_out || scope_in);
    };
    /*\
     * Element.unhover
     [ method ]
     **
     * Removes event handlers for hover for the element.
     > Parameters
     - f_in (function) handler for hover in
     - f_out (function) handler for hover out
     = (object) @Element
    \*/
    elproto.unhover = function (f_in, f_out) {
        return this.unmouseover(f_in).unmouseout(f_out);
    };
    var draggable = [];
    /*\
     * Element.drag
     [ method ]
     **
     * Adds event handlers for drag of the element.
     > Parameters
     - onmove (function) handler for moving
     - onstart (function) handler for drag start
     - onend (function) handler for drag end
     - mcontext (object) #optional context for moving handler
     - scontext (object) #optional context for drag start handler
     - econtext (object) #optional context for drag end handler
     * Additionaly following `drag` events will be triggered: `drag.start.<id>` on start, 
     * `drag.end.<id>` on end and `drag.move.<id>` on every move. When element will be dragged over another element 
     * `drag.over.<id>` will be fired as well.
     *
     * Start event and start handler will be called in specified context or in context of the element with following parameters:
     o x (number) x position of the mouse
     o y (number) y position of the mouse
     o event (object) DOM event object
     * Move event and move handler will be called in specified context or in context of the element with following parameters:
     o dx (number) shift by x from the start point
     o dy (number) shift by y from the start point
     o x (number) x position of the mouse
     o y (number) y position of the mouse
     o event (object) DOM event object
     * End event and end handler will be called in specified context or in context of the element with following parameters:
     o event (object) DOM event object
     = (object) @Element
    \*/
    elproto.drag = function (onmove, onstart, onend, move_scope, start_scope, end_scope) {
        function start(e) {
            (e.originalEvent || e).preventDefault();
            var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft;
            this._drag.x = e.clientX + scrollX;
            this._drag.y = e.clientY + scrollY;
            this._drag.id = e.identifier;
            !drag.length && R.mousemove(dragMove).mouseup(dragUp);
            drag.push({el: this, move_scope: move_scope, start_scope: start_scope, end_scope: end_scope});
            onstart && eve.on("raphael.drag.start." + this.id, onstart);
            onmove && eve.on("raphael.drag.move." + this.id, onmove);
            onend && eve.on("raphael.drag.end." + this.id, onend);
            eve("raphael.drag.start." + this.id, start_scope || move_scope || this, e.clientX + scrollX, e.clientY + scrollY, e);
        }
        this._drag = {};
        draggable.push({el: this, start: start});
        this.mousedown(start);
        return this;
    };
    /*\
     * Element.onDragOver
     [ method ]
     **
     * Shortcut for assigning event handler for `drag.over.<id>` event, where id is id of the element (see @Element.id).
     > Parameters
     - f (function) handler for event, first argument would be the element you are dragging over
    \*/
    elproto.onDragOver = function (f) {
        f ? eve.on("raphael.drag.over." + this.id, f) : eve.unbind("raphael.drag.over." + this.id);
    };
    /*\
     * Element.undrag
     [ method ]
     **
     * Removes all drag event handlers from given element.
    \*/
    elproto.undrag = function () {
        var i = draggable.length;
        while (i--) if (draggable[i].el == this) {
            this.unmousedown(draggable[i].start);
            draggable.splice(i, 1);
            eve.unbind("raphael.drag.*." + this.id);
        }
        !draggable.length && R.unmousemove(dragMove).unmouseup(dragUp);
        drag = [];
    };
    /*\
     * Paper.circle
     [ method ]
     **
     * Draws a circle.
     **
     > Parameters
     **
     - x (number) x coordinate of the centre
     - y (number) y coordinate of the centre
     - r (number) radius
     = (object) Raphaël element object with type “circle”
     **
     > Usage
     | var c = paper.circle(50, 50, 40);
    \*/
    paperproto.circle = function (x, y, r) {
        var out = R._engine.circle(this, x || 0, y || 0, r || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.rect
     [ method ]
     *
     * Draws a rectangle.
     **
     > Parameters
     **
     - x (number) x coordinate of the top left corner
     - y (number) y coordinate of the top left corner
     - width (number) width
     - height (number) height
     - r (number) #optional radius for rounded corners, default is 0
     = (object) Raphaël element object with type “rect”
     **
     > Usage
     | // regular rectangle
     | var c = paper.rect(10, 10, 50, 50);
     | // rectangle with rounded corners
     | var c = paper.rect(40, 40, 50, 50, 10);
    \*/
    paperproto.rect = function (x, y, w, h, r) {
        var out = R._engine.rect(this, x || 0, y || 0, w || 0, h || 0, r || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.ellipse
     [ method ]
     **
     * Draws an ellipse.
     **
     > Parameters
     **
     - x (number) x coordinate of the centre
     - y (number) y coordinate of the centre
     - rx (number) horizontal radius
     - ry (number) vertical radius
     = (object) Raphaël element object with type “ellipse”
     **
     > Usage
     | var c = paper.ellipse(50, 50, 40, 20);
    \*/
    paperproto.ellipse = function (x, y, rx, ry) {
        var out = R._engine.ellipse(this, x || 0, y || 0, rx || 0, ry || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.path
     [ method ]
     **
     * Creates a path element by given path data string.
     > Parameters
     - pathString (string) #optional path string in SVG format.
     * Path string consists of one-letter commands, followed by comma seprarated arguments in numercal form. Example:
     | "M10,20L30,40"
     * Here we can see two commands: “M”, with arguments `(10, 20)` and “L” with arguments `(30, 40)`. Upper case letter mean command is absolute, lower case—relative.
     *
     # <p>Here is short list of commands available, for more details see <a href="http://www.w3.org/TR/SVG/paths.html#PathData" title="Details of a path's data attribute's format are described in the SVG specification.">SVG path string format</a>.</p>
     # <table><thead><tr><th>Command</th><th>Name</th><th>Parameters</th></tr></thead><tbody>
     # <tr><td>M</td><td>moveto</td><td>(x y)+</td></tr>
     # <tr><td>Z</td><td>closepath</td><td>(none)</td></tr>
     # <tr><td>L</td><td>lineto</td><td>(x y)+</td></tr>
     # <tr><td>H</td><td>horizontal lineto</td><td>x+</td></tr>
     # <tr><td>V</td><td>vertical lineto</td><td>y+</td></tr>
     # <tr><td>C</td><td>curveto</td><td>(x1 y1 x2 y2 x y)+</td></tr>
     # <tr><td>S</td><td>smooth curveto</td><td>(x2 y2 x y)+</td></tr>
     # <tr><td>Q</td><td>quadratic Bézier curveto</td><td>(x1 y1 x y)+</td></tr>
     # <tr><td>T</td><td>smooth quadratic Bézier curveto</td><td>(x y)+</td></tr>
     # <tr><td>A</td><td>elliptical arc</td><td>(rx ry x-axis-rotation large-arc-flag sweep-flag x y)+</td></tr>
     # <tr><td>R</td><td><a href="http://en.wikipedia.org/wiki/Catmull–Rom_spline#Catmull.E2.80.93Rom_spline">Catmull-Rom curveto</a>*</td><td>x1 y1 (x y)+</td></tr></tbody></table>
     * * “Catmull-Rom curveto” is a not standard SVG command and added in 2.0 to make life easier.
     * Note: there is a special case when path consist of just three commands: “M10,10R…z”. In this case path will smoothly connects to its beginning.
     > Usage
     | var c = paper.path("M10 10L90 90");
     | // draw a diagonal line:
     | // move to 10,10, line to 90,90
     * For example of path strings, check out these icons: http://raphaeljs.com/icons/
    \*/
    paperproto.path = function (pathString) {
        pathString && !R.is(pathString, string) && !R.is(pathString[0], array) && (pathString += E);
        var out = R._engine.path(R.format[apply](R, arguments), this);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.image
     [ method ]
     **
     * Embeds an image into the surface.
     **
     > Parameters
     **
     - src (string) URI of the source image
     - x (number) x coordinate position
     - y (number) y coordinate position
     - width (number) width of the image
     - height (number) height of the image
     = (object) Raphaël element object with type “image”
     **
     > Usage
     | var c = paper.image("apple.png", 10, 10, 80, 80);
    \*/
    paperproto.image = function (src, x, y, w, h) {
        var out = R._engine.image(this, src || "about:blank", x || 0, y || 0, w || 0, h || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.text
     [ method ]
     **
     * Draws a text string. If you need line breaks, put “\n” in the string.
     **
     > Parameters
     **
     - x (number) x coordinate position
     - y (number) y coordinate position
     - text (string) The text string to draw
     = (object) Raphaël element object with type “text”
     **
     > Usage
     | var t = paper.text(50, 50, "Raphaël\nkicks\nbutt!");
    \*/
    paperproto.text = function (x, y, text) {
        var out = R._engine.text(this, x || 0, y || 0, Str(text));
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.set
     [ method ]
     **
     * Creates array-like object to keep and operate several elements at once.
     * Warning: it doesn’t create any elements for itself in the page, it just groups existing elements.
     * Sets act as pseudo elements — all methods available to an element can be used on a set.
     = (object) array-like object that represents set of elements
     **
     > Usage
     | var st = paper.set();
     | st.push(
     |     paper.circle(10, 10, 5),
     |     paper.circle(30, 10, 5)
     | );
     | st.attr({fill: "red"}); // changes the fill of both circles
    \*/
    paperproto.set = function (itemsArray) {
        !R.is(itemsArray, "array") && (itemsArray = Array.prototype.splice.call(arguments, 0, arguments.length));
        var out = new Set(itemsArray);
        this.__set__ && this.__set__.push(out);
        out["paper"] = this;
        out["type"] = "set";
        return out;
    };
    /*\
     * Paper.setStart
     [ method ]
     **
     * Creates @Paper.set. All elements that will be created after calling this method and before calling
     * @Paper.setFinish will be added to the set.
     **
     > Usage
     | paper.setStart();
     | paper.circle(10, 10, 5),
     | paper.circle(30, 10, 5)
     | var st = paper.setFinish();
     | st.attr({fill: "red"}); // changes the fill of both circles
    \*/
    paperproto.setStart = function (set) {
        this.__set__ = set || this.set();
    };
    /*\
     * Paper.setFinish
     [ method ]
     **
     * See @Paper.setStart. This method finishes catching and returns resulting set.
     **
     = (object) set
    \*/
    paperproto.setFinish = function (set) {
        var out = this.__set__;
        delete this.__set__;
        return out;
    };
    /*\
     * Paper.setSize
     [ method ]
     **
     * If you need to change dimensions of the canvas call this method
     **
     > Parameters
     **
     - width (number) new width of the canvas
     - height (number) new height of the canvas
    \*/
    paperproto.setSize = function (width, height) {
        return R._engine.setSize.call(this, width, height);
    };
    /*\
     * Paper.setViewBox
     [ method ]
     **
     * Sets the view box of the paper. Practically it gives you ability to zoom and pan whole paper surface by 
     * specifying new boundaries.
     **
     > Parameters
     **
     - x (number) new x position, default is `0`
     - y (number) new y position, default is `0`
     - w (number) new width of the canvas
     - h (number) new height of the canvas
     - fit (boolean) `true` if you want graphics to fit into new boundary box
    \*/
    paperproto.setViewBox = function (x, y, w, h, fit) {
        return R._engine.setViewBox.call(this, x, y, w, h, fit);
    };
    /*\
     * Paper.top
     [ property ]
     **
     * Points to the topmost element on the paper
    \*/
    /*\
     * Paper.bottom
     [ property ]
     **
     * Points to the bottom element on the paper
    \*/
    paperproto.top = paperproto.bottom = null;
    /*\
     * Paper.raphael
     [ property ]
     **
     * Points to the @Raphael object/function
    \*/
    paperproto.raphael = R;
    var getOffset = function (elem) {
        var box = elem.getBoundingClientRect(),
            doc = elem.ownerDocument,
            body = doc.body,
            docElem = doc.documentElement,
            clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
            top  = box.top  + (g.win.pageYOffset || docElem.scrollTop || body.scrollTop ) - clientTop,
            left = box.left + (g.win.pageXOffset || docElem.scrollLeft || body.scrollLeft) - clientLeft;
        return {
            y: top,
            x: left
        };
    };
    /*\
     * Paper.getElementByPoint
     [ method ]
     **
     * Returns you topmost element under given point.
     **
     = (object) Raphaël element object
     > Parameters
     **
     - x (number) x coordinate from the top left corner of the window
     - y (number) y coordinate from the top left corner of the window
     > Usage
     | paper.getElementByPoint(mouseX, mouseY).attr({stroke: "#f00"});
    \*/
    paperproto.getElementByPoint = function (x, y) {
        var paper = this,
            svg = paper.canvas,
            target = g.doc.elementFromPoint(x, y);
        if (g.win.opera && target.tagName == "svg") {
            var so = getOffset(svg),
                sr = svg.createSVGRect();
            sr.x = x - so.x;
            sr.y = y - so.y;
            sr.width = sr.height = 1;
            var hits = svg.getIntersectionList(sr, null);
            if (hits.length) {
                target = hits[hits.length - 1];
            }
        }
        if (!target) {
            return null;
        }
        while (target.parentNode && target != svg.parentNode && !target.raphael) {
            target = target.parentNode;
        }
        target == paper.canvas.parentNode && (target = svg);
        target = target && target.raphael ? paper.getById(target.raphaelid) : null;
        return target;
    };

    /*\
     * Paper.getElementsByBBox
     [ method ]
     **
     * Returns set of elements that have an intersecting bounding box
     **
     > Parameters
     **
     - bbox (object) bbox to check with
     = (object) @Set
     \*/
    paperproto.getElementsByBBox = function (bbox) {
        var set = this.set();
        this.forEach(function (el) {
            if (R.isBBoxIntersect(el.getBBox(), bbox)) {
                set.push(el);
            }
        });
        return set;
    };

    /*\
     * Paper.getById
     [ method ]
     **
     * Returns you element by its internal ID.
     **
     > Parameters
     **
     - id (number) id
     = (object) Raphaël element object
    \*/
    paperproto.getById = function (id) {
        var bot = this.bottom;
        while (bot) {
            if (bot.id == id) {
                return bot;
            }
            bot = bot.next;
        }
        return null;
    };
    /*\
     * Paper.forEach
     [ method ]
     **
     * Executes given function for each element on the paper
     *
     * If callback function returns `false` it will stop loop running.
     **
     > Parameters
     **
     - callback (function) function to run
     - thisArg (object) context object for the callback
     = (object) Paper object
     > Usage
     | paper.forEach(function (el) {
     |     el.attr({ stroke: "blue" });
     | });
    \*/
    paperproto.forEach = function (callback, thisArg) {
        var bot = this.bottom;
        while (bot) {
            if (callback.call(thisArg, bot) === false) {
                return this;
            }
            bot = bot.next;
        }
        return this;
    };
    /*\
     * Paper.getElementsByPoint
     [ method ]
     **
     * Returns set of elements that have common point inside
     **
     > Parameters
     **
     - x (number) x coordinate of the point
     - y (number) y coordinate of the point
     = (object) @Set
    \*/
    paperproto.getElementsByPoint = function (x, y) {
        var set = this.set();
        this.forEach(function (el) {
            if (el.isPointInside(x, y)) {
                set.push(el);
            }
        });
        return set;
    };
    function x_y() {
        return this.x + S + this.y;
    }
    function x_y_w_h() {
        return this.x + S + this.y + S + this.width + " \xd7 " + this.height;
    }
    /*\
     * Element.isPointInside
     [ method ]
     **
     * Determine if given point is inside this element’s shape
     **
     > Parameters
     **
     - x (number) x coordinate of the point
     - y (number) y coordinate of the point
     = (boolean) `true` if point inside the shape
    \*/
    elproto.isPointInside = function (x, y) {
        var rp = this.realPath = this.realPath || getPath[this.type](this);
        return R.isPointInsidePath(rp, x, y);
    };
    /*\
     * Element.getBBox
     [ method ]
     **
     * Return bounding box for a given element
     **
     > Parameters
     **
     - isWithoutTransform (boolean) flag, `true` if you want to have bounding box before transformations. Default is `false`.
     = (object) Bounding box object:
     o {
     o     x: (number) top left corner x
     o     y: (number) top left corner y
     o     x2: (number) bottom right corner x
     o     y2: (number) bottom right corner y
     o     width: (number) width
     o     height: (number) height
     o }
    \*/
    elproto.getBBox = function (isWithoutTransform) {
        if (this.removed) {
            return {};
        }
        var _ = this._;
        if (isWithoutTransform) {
            if (_.dirty || !_.bboxwt) {
                this.realPath = getPath[this.type](this);
                _.bboxwt = pathDimensions(this.realPath);
                _.bboxwt.toString = x_y_w_h;
                _.dirty = 0;
            }
            return _.bboxwt;
        }
        if (_.dirty || _.dirtyT || !_.bbox) {
            if (_.dirty || !this.realPath) {
                _.bboxwt = 0;
                this.realPath = getPath[this.type](this);
            }
            _.bbox = pathDimensions(mapPath(this.realPath, this.matrix));
            _.bbox.toString = x_y_w_h;
            _.dirty = _.dirtyT = 0;
        }
        return _.bbox;
    };
    /*\
     * Element.clone
     [ method ]
     **
     = (object) clone of a given element
     **
    \*/
    elproto.clone = function () {
        if (this.removed) {
            return null;
        }
        var out = this.paper[this.type]().attr(this.attr());
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Element.glow
     [ method ]
     **
     * Return set of elements that create glow-like effect around given element. See @Paper.set.
     *
     * Note: Glow is not connected to the element. If you change element attributes it won’t adjust itself.
     **
     > Parameters
     **
     - glow (object) #optional parameters object with all properties optional:
     o {
     o     width (number) size of the glow, default is `10`
     o     fill (boolean) will it be filled, default is `false`
     o     opacity (number) opacity, default is `0.5`
     o     offsetx (number) horizontal offset, default is `0`
     o     offsety (number) vertical offset, default is `0`
     o     color (string) glow colour, default is `black`
     o }
     = (object) @Paper.set of elements that represents glow
    \*/
    elproto.glow = function (glow) {
        if (this.type == "text") {
            return null;
        }
        glow = glow || {};
        var s = {
            width: (glow.width || 10) + (+this.attr("stroke-width") || 1),
            fill: glow.fill || false,
            opacity: glow.opacity || .5,
            offsetx: glow.offsetx || 0,
            offsety: glow.offsety || 0,
            color: glow.color || "#000"
        },
            c = s.width / 2,
            r = this.paper,
            out = r.set(),
            path = this.realPath || getPath[this.type](this);
        path = this.matrix ? mapPath(path, this.matrix) : path;
        for (var i = 1; i < c + 1; i++) {
            out.push(r.path(path).attr({
                stroke: s.color,
                fill: s.fill ? s.color : "none",
                "stroke-linejoin": "round",
                "stroke-linecap": "round",
                "stroke-width": +(s.width / c * i).toFixed(3),
                opacity: +(s.opacity / c).toFixed(3)
            }));
        }
        return out.insertBefore(this).translate(s.offsetx, s.offsety);
    };
    var curveslengths = {},
    getPointAtSegmentLength = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
        if (length == null) {
            return bezlen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
        } else {
            return R.findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, getTatLen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length));
        }
    },
    getLengthFactory = function (istotal, subpath) {
        return function (path, length, onlystart) {
            path = path2curve(path);
            var x, y, p, l, sp = "", subpaths = {}, point,
                len = 0;
            for (var i = 0, ii = path.length; i < ii; i++) {
                p = path[i];
                if (p[0] == "M") {
                    x = +p[1];
                    y = +p[2];
                } else {
                    l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                    if (len + l > length) {
                        if (subpath && !subpaths.start) {
                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                            sp += ["C" + point.start.x, point.start.y, point.m.x, point.m.y, point.x, point.y];
                            if (onlystart) {return sp;}
                            subpaths.start = sp;
                            sp = ["M" + point.x, point.y + "C" + point.n.x, point.n.y, point.end.x, point.end.y, p[5], p[6]].join();
                            len += l;
                            x = +p[5];
                            y = +p[6];
                            continue;
                        }
                        if (!istotal && !subpath) {
                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                            return {x: point.x, y: point.y, alpha: point.alpha};
                        }
                    }
                    len += l;
                    x = +p[5];
                    y = +p[6];
                }
                sp += p.shift() + p;
            }
            subpaths.end = sp;
            point = istotal ? len : subpath ? subpaths : R.findDotsAtSegment(x, y, p[0], p[1], p[2], p[3], p[4], p[5], 1);
            point.alpha && (point = {x: point.x, y: point.y, alpha: point.alpha});
            return point;
        };
    };
    var getTotalLength = getLengthFactory(1),
        getPointAtLength = getLengthFactory(),
        getSubpathsAtLength = getLengthFactory(0, 1);
    /*\
     * Raphael.getTotalLength
     [ method ]
     **
     * Returns length of the given path in pixels.
     **
     > Parameters
     **
     - path (string) SVG path string.
     **
     = (number) length.
    \*/
    R.getTotalLength = getTotalLength;
    /*\
     * Raphael.getPointAtLength
     [ method ]
     **
     * Return coordinates of the point located at the given length on the given path.
     **
     > Parameters
     **
     - path (string) SVG path string
     - length (number)
     **
     = (object) representation of the point:
     o {
     o     x: (number) x coordinate
     o     y: (number) y coordinate
     o     alpha: (number) angle of derivative
     o }
    \*/
    R.getPointAtLength = getPointAtLength;
    /*\
     * Raphael.getSubpath
     [ method ]
     **
     * Return subpath of a given path from given length to given length.
     **
     > Parameters
     **
     - path (string) SVG path string
     - from (number) position of the start of the segment
     - to (number) position of the end of the segment
     **
     = (string) pathstring for the segment
    \*/
    R.getSubpath = function (path, from, to) {
        if (this.getTotalLength(path) - to < 1e-6) {
            return getSubpathsAtLength(path, from).end;
        }
        var a = getSubpathsAtLength(path, to, 1);
        return from ? getSubpathsAtLength(a, from).end : a;
    };
    /*\
     * Element.getTotalLength
     [ method ]
     **
     * Returns length of the path in pixels. Only works for element of “path” type.
     = (number) length.
    \*/
    elproto.getTotalLength = function () {
        if (this.type != "path") {return;}
        if (this.node.getTotalLength) {
            return this.node.getTotalLength();
        }
        return getTotalLength(this.attrs.path);
    };
    /*\
     * Element.getPointAtLength
     [ method ]
     **
     * Return coordinates of the point located at the given length on the given path. Only works for element of “path” type.
     **
     > Parameters
     **
     - length (number)
     **
     = (object) representation of the point:
     o {
     o     x: (number) x coordinate
     o     y: (number) y coordinate
     o     alpha: (number) angle of derivative
     o }
    \*/
    elproto.getPointAtLength = function (length) {
        if (this.type != "path") {return;}
        return getPointAtLength(this.attrs.path, length);
    };
    /*\
     * Element.getSubpath
     [ method ]
     **
     * Return subpath of a given element from given length to given length. Only works for element of “path” type.
     **
     > Parameters
     **
     - from (number) position of the start of the segment
     - to (number) position of the end of the segment
     **
     = (string) pathstring for the segment
    \*/
    elproto.getSubpath = function (from, to) {
        if (this.type != "path") {return;}
        return R.getSubpath(this.attrs.path, from, to);
    };
    /*\
     * Raphael.easing_formulas
     [ property ]
     **
     * Object that contains easing formulas for animation. You could extend it with your own. By default it has following list of easing:
     # <ul>
     #     <li>“linear”</li>
     #     <li>“&lt;” or “easeIn” or “ease-in”</li>
     #     <li>“>” or “easeOut” or “ease-out”</li>
     #     <li>“&lt;>” or “easeInOut” or “ease-in-out”</li>
     #     <li>“backIn” or “back-in”</li>
     #     <li>“backOut” or “back-out”</li>
     #     <li>“elastic”</li>
     #     <li>“bounce”</li>
     # </ul>
     # <p>See also <a href="http://raphaeljs.com/easing.html">Easing demo</a>.</p>
    \*/
    var ef = R.easing_formulas = {
        linear: function (n) {
            return n;
        },
        "<": function (n) {
            return pow(n, 1.7);
        },
        ">": function (n) {
            return pow(n, .48);
        },
        "<>": function (n) {
            var q = .48 - n / 1.04,
                Q = math.sqrt(.1734 + q * q),
                x = Q - q,
                X = pow(abs(x), 1 / 3) * (x < 0 ? -1 : 1),
                y = -Q - q,
                Y = pow(abs(y), 1 / 3) * (y < 0 ? -1 : 1),
                t = X + Y + .5;
            return (1 - t) * 3 * t * t + t * t * t;
        },
        backIn: function (n) {
            var s = 1.70158;
            return n * n * ((s + 1) * n - s);
        },
        backOut: function (n) {
            n = n - 1;
            var s = 1.70158;
            return n * n * ((s + 1) * n + s) + 1;
        },
        elastic: function (n) {
            if (n == !!n) {
                return n;
            }
            return pow(2, -10 * n) * math.sin((n - .075) * (2 * PI) / .3) + 1;
        },
        bounce: function (n) {
            var s = 7.5625,
                p = 2.75,
                l;
            if (n < (1 / p)) {
                l = s * n * n;
            } else {
                if (n < (2 / p)) {
                    n -= (1.5 / p);
                    l = s * n * n + .75;
                } else {
                    if (n < (2.5 / p)) {
                        n -= (2.25 / p);
                        l = s * n * n + .9375;
                    } else {
                        n -= (2.625 / p);
                        l = s * n * n + .984375;
                    }
                }
            }
            return l;
        }
    };
    ef.easeIn = ef["ease-in"] = ef["<"];
    ef.easeOut = ef["ease-out"] = ef[">"];
    ef.easeInOut = ef["ease-in-out"] = ef["<>"];
    ef["back-in"] = ef.backIn;
    ef["back-out"] = ef.backOut;

    var animationElements = [],
        requestAnimFrame = window.requestAnimationFrame       ||
                           window.webkitRequestAnimationFrame ||
                           window.mozRequestAnimationFrame    ||
                           window.oRequestAnimationFrame      ||
                           window.msRequestAnimationFrame     ||
                           function (callback) {
                               setTimeout(callback, 16);
                           },
        animation = function () {
            var Now = +new Date,
                l = 0;
            for (; l < animationElements.length; l++) {
                var e = animationElements[l];
                if (e.el.removed || e.paused) {
                    continue;
                }
                var time = Now - e.start,
                    ms = e.ms,
                    easing = e.easing,
                    from = e.from,
                    diff = e.diff,
                    to = e.to,
                    t = e.t,
                    that = e.el,
                    set = {},
                    now,
                    init = {},
                    key;
                if (e.initstatus) {
                    time = (e.initstatus * e.anim.top - e.prev) / (e.percent - e.prev) * ms;
                    e.status = e.initstatus;
                    delete e.initstatus;
                    e.stop && animationElements.splice(l--, 1);
                } else {
                    e.status = (e.prev + (e.percent - e.prev) * (time / ms)) / e.anim.top;
                }
                if (time < 0) {
                    continue;
                }
                if (time < ms) {
                    var pos = easing(time / ms);
                    for (var attr in from) if (from[has](attr)) {
                        switch (availableAnimAttrs[attr]) {
                            case nu:
                                now = +from[attr] + pos * ms * diff[attr];
                                break;
                            case "colour":
                                now = "rgb(" + [
                                    upto255(round(from[attr].r + pos * ms * diff[attr].r)),
                                    upto255(round(from[attr].g + pos * ms * diff[attr].g)),
                                    upto255(round(from[attr].b + pos * ms * diff[attr].b))
                                ].join(",") + ")";
                                break;
                            case "path":
                                now = [];
                                for (var i = 0, ii = from[attr].length; i < ii; i++) {
                                    now[i] = [from[attr][i][0]];
                                    for (var j = 1, jj = from[attr][i].length; j < jj; j++) {
                                        now[i][j] = +from[attr][i][j] + pos * ms * diff[attr][i][j];
                                    }
                                    now[i] = now[i].join(S);
                                }
                                now = now.join(S);
                                break;
                            case "transform":
                                if (diff[attr].real) {
                                    now = [];
                                    for (i = 0, ii = from[attr].length; i < ii; i++) {
                                        now[i] = [from[attr][i][0]];
                                        for (j = 1, jj = from[attr][i].length; j < jj; j++) {
                                            now[i][j] = from[attr][i][j] + pos * ms * diff[attr][i][j];
                                        }
                                    }
                                } else {
                                    var get = function (i) {
                                        return +from[attr][i] + pos * ms * diff[attr][i];
                                    };
                                    // now = [["r", get(2), 0, 0], ["t", get(3), get(4)], ["s", get(0), get(1), 0, 0]];
                                    now = [["m", get(0), get(1), get(2), get(3), get(4), get(5)]];
                                }
                                break;
                            case "csv":
                                if (attr == "clip-rect") {
                                    now = [];
                                    i = 4;
                                    while (i--) {
                                        now[i] = +from[attr][i] + pos * ms * diff[attr][i];
                                    }
                                }
                                break;
                            default:
                                var from2 = [][concat](from[attr]);
                                now = [];
                                i = that.paper.customAttributes[attr].length;
                                while (i--) {
                                    now[i] = +from2[i] + pos * ms * diff[attr][i];
                                }
                                break;
                        }
                        set[attr] = now;
                    }
                    that.attr(set);
                    (function (id, that, anim) {
                        setTimeout(function () {
                            eve("raphael.anim.frame." + id, that, anim);
                        });
                    })(that.id, that, e.anim);
                } else {
                    (function(f, el, a) {
                        setTimeout(function() {
                            eve("raphael.anim.frame." + el.id, el, a);
                            eve("raphael.anim.finish." + el.id, el, a);
                            R.is(f, "function") && f.call(el);
                        });
                    })(e.callback, that, e.anim);
                    that.attr(to);
                    animationElements.splice(l--, 1);
                    if (e.repeat > 1 && !e.next) {
                        for (key in to) if (to[has](key)) {
                            init[key] = e.totalOrigin[key];
                        }
                        e.el.attr(init);
                        runAnimation(e.anim, e.el, e.anim.percents[0], null, e.totalOrigin, e.repeat - 1);
                    }
                    if (e.next && !e.stop) {
                        runAnimation(e.anim, e.el, e.next, null, e.totalOrigin, e.repeat);
                    }
                }
            }
            R.svg && that && that.paper && that.paper.safari();
            animationElements.length && requestAnimFrame(animation);
        },
        upto255 = function (color) {
            return color > 255 ? 255 : color < 0 ? 0 : color;
        };
    /*\
     * Element.animateWith
     [ method ]
     **
     * Acts similar to @Element.animate, but ensure that given animation runs in sync with another given element.
     **
     > Parameters
     **
     - el (object) element to sync with
     - anim (object) animation to sync with
     - params (object) #optional final attributes for the element, see also @Element.attr
     - ms (number) #optional number of milliseconds for animation to run
     - easing (string) #optional easing type. Accept on of @Raphael.easing_formulas or CSS format: `cubic&#x2010;bezier(XX,&#160;XX,&#160;XX,&#160;XX)`
     - callback (function) #optional callback function. Will be called at the end of animation.
     * or
     - element (object) element to sync with
     - anim (object) animation to sync with
     - animation (object) #optional animation object, see @Raphael.animation
     **
     = (object) original element
    \*/
    elproto.animateWith = function (el, anim, params, ms, easing, callback) {
        var element = this;
        if (element.removed) {
            callback && callback.call(element);
            return element;
        }
        var a = params instanceof Animation ? params : R.animation(params, ms, easing, callback),
            x, y;
        runAnimation(a, element, a.percents[0], null, element.attr());
        for (var i = 0, ii = animationElements.length; i < ii; i++) {
            if (animationElements[i].anim == anim && animationElements[i].el == el) {
                animationElements[ii - 1].start = animationElements[i].start;
                break;
            }
        }
        return element;
        // 
        // 
        // var a = params ? R.animation(params, ms, easing, callback) : anim,
        //     status = element.status(anim);
        // return this.animate(a).status(a, status * anim.ms / a.ms);
    };
    function CubicBezierAtTime(t, p1x, p1y, p2x, p2y, duration) {
        var cx = 3 * p1x,
            bx = 3 * (p2x - p1x) - cx,
            ax = 1 - cx - bx,
            cy = 3 * p1y,
            by = 3 * (p2y - p1y) - cy,
            ay = 1 - cy - by;
        function sampleCurveX(t) {
            return ((ax * t + bx) * t + cx) * t;
        }
        function solve(x, epsilon) {
            var t = solveCurveX(x, epsilon);
            return ((ay * t + by) * t + cy) * t;
        }
        function solveCurveX(x, epsilon) {
            var t0, t1, t2, x2, d2, i;
            for(t2 = x, i = 0; i < 8; i++) {
                x2 = sampleCurveX(t2) - x;
                if (abs(x2) < epsilon) {
                    return t2;
                }
                d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
                if (abs(d2) < 1e-6) {
                    break;
                }
                t2 = t2 - x2 / d2;
            }
            t0 = 0;
            t1 = 1;
            t2 = x;
            if (t2 < t0) {
                return t0;
            }
            if (t2 > t1) {
                return t1;
            }
            while (t0 < t1) {
                x2 = sampleCurveX(t2);
                if (abs(x2 - x) < epsilon) {
                    return t2;
                }
                if (x > x2) {
                    t0 = t2;
                } else {
                    t1 = t2;
                }
                t2 = (t1 - t0) / 2 + t0;
            }
            return t2;
        }
        return solve(t, 1 / (200 * duration));
    }
    elproto.onAnimation = function (f) {
        f ? eve.on("raphael.anim.frame." + this.id, f) : eve.unbind("raphael.anim.frame." + this.id);
        return this;
    };
    function Animation(anim, ms) {
        var percents = [],
            newAnim = {};
        this.ms = ms;
        this.times = 1;
        if (anim) {
            for (var attr in anim) if (anim[has](attr)) {
                newAnim[toFloat(attr)] = anim[attr];
                percents.push(toFloat(attr));
            }
            percents.sort(sortByNumber);
        }
        this.anim = newAnim;
        this.top = percents[percents.length - 1];
        this.percents = percents;
    }
    /*\
     * Animation.delay
     [ method ]
     **
     * Creates a copy of existing animation object with given delay.
     **
     > Parameters
     **
     - delay (number) number of ms to pass between animation start and actual animation
     **
     = (object) new altered Animation object
     | var anim = Raphael.animation({cx: 10, cy: 20}, 2e3);
     | circle1.animate(anim); // run the given animation immediately
     | circle2.animate(anim.delay(500)); // run the given animation after 500 ms
    \*/
    Animation.prototype.delay = function (delay) {
        var a = new Animation(this.anim, this.ms);
        a.times = this.times;
        a.del = +delay || 0;
        return a;
    };
    /*\
     * Animation.repeat
     [ method ]
     **
     * Creates a copy of existing animation object with given repetition.
     **
     > Parameters
     **
     - repeat (number) number iterations of animation. For infinite animation pass `Infinity`
     **
     = (object) new altered Animation object
    \*/
    Animation.prototype.repeat = function (times) { 
        var a = new Animation(this.anim, this.ms);
        a.del = this.del;
        a.times = math.floor(mmax(times, 0)) || 1;
        return a;
    };
    function runAnimation(anim, element, percent, status, totalOrigin, times) {
        percent = toFloat(percent);
        var params,
            isInAnim,
            isInAnimSet,
            percents = [],
            next,
            prev,
            timestamp,
            ms = anim.ms,
            from = {},
            to = {},
            diff = {};
        if (status) {
            for (i = 0, ii = animationElements.length; i < ii; i++) {
                var e = animationElements[i];
                if (e.el.id == element.id && e.anim == anim) {
                    if (e.percent != percent) {
                        animationElements.splice(i, 1);
                        isInAnimSet = 1;
                    } else {
                        isInAnim = e;
                    }
                    element.attr(e.totalOrigin);
                    break;
                }
            }
        } else {
            status = +to; // NaN
        }
        for (var i = 0, ii = anim.percents.length; i < ii; i++) {
            if (anim.percents[i] == percent || anim.percents[i] > status * anim.top) {
                percent = anim.percents[i];
                prev = anim.percents[i - 1] || 0;
                ms = ms / anim.top * (percent - prev);
                next = anim.percents[i + 1];
                params = anim.anim[percent];
                break;
            } else if (status) {
                element.attr(anim.anim[anim.percents[i]]);
            }
        }
        if (!params) {
            return;
        }
        if (!isInAnim) {
            for (var attr in params) if (params[has](attr)) {
                if (availableAnimAttrs[has](attr) || element.paper.customAttributes[has](attr)) {
                    from[attr] = element.attr(attr);
                    (from[attr] == null) && (from[attr] = availableAttrs[attr]);
                    to[attr] = params[attr];
                    switch (availableAnimAttrs[attr]) {
                        case nu:
                            diff[attr] = (to[attr] - from[attr]) / ms;
                            break;
                        case "colour":
                            from[attr] = R.getRGB(from[attr]);
                            var toColour = R.getRGB(to[attr]);
                            diff[attr] = {
                                r: (toColour.r - from[attr].r) / ms,
                                g: (toColour.g - from[attr].g) / ms,
                                b: (toColour.b - from[attr].b) / ms
                            };
                            break;
                        case "path":
                            var pathes = path2curve(from[attr], to[attr]),
                                toPath = pathes[1];
                            from[attr] = pathes[0];
                            diff[attr] = [];
                            for (i = 0, ii = from[attr].length; i < ii; i++) {
                                diff[attr][i] = [0];
                                for (var j = 1, jj = from[attr][i].length; j < jj; j++) {
                                    diff[attr][i][j] = (toPath[i][j] - from[attr][i][j]) / ms;
                                }
                            }
                            break;
                        case "transform":
                            var _ = element._,
                                eq = equaliseTransform(_[attr], to[attr]);
                            if (eq) {
                                from[attr] = eq.from;
                                to[attr] = eq.to;
                                diff[attr] = [];
                                diff[attr].real = true;
                                for (i = 0, ii = from[attr].length; i < ii; i++) {
                                    diff[attr][i] = [from[attr][i][0]];
                                    for (j = 1, jj = from[attr][i].length; j < jj; j++) {
                                        diff[attr][i][j] = (to[attr][i][j] - from[attr][i][j]) / ms;
                                    }
                                }
                            } else {
                                var m = (element.matrix || new Matrix),
                                    to2 = {
                                        _: {transform: _.transform},
                                        getBBox: function () {
                                            return element.getBBox(1);
                                        }
                                    };
                                from[attr] = [
                                    m.a,
                                    m.b,
                                    m.c,
                                    m.d,
                                    m.e,
                                    m.f
                                ];
                                extractTransform(to2, to[attr]);
                                to[attr] = to2._.transform;
                                diff[attr] = [
                                    (to2.matrix.a - m.a) / ms,
                                    (to2.matrix.b - m.b) / ms,
                                    (to2.matrix.c - m.c) / ms,
                                    (to2.matrix.d - m.d) / ms,
                                    (to2.matrix.e - m.e) / ms,
                                    (to2.matrix.f - m.f) / ms
                                ];
                                // from[attr] = [_.sx, _.sy, _.deg, _.dx, _.dy];
                                // var to2 = {_:{}, getBBox: function () { return element.getBBox(); }};
                                // extractTransform(to2, to[attr]);
                                // diff[attr] = [
                                //     (to2._.sx - _.sx) / ms,
                                //     (to2._.sy - _.sy) / ms,
                                //     (to2._.deg - _.deg) / ms,
                                //     (to2._.dx - _.dx) / ms,
                                //     (to2._.dy - _.dy) / ms
                                // ];
                            }
                            break;
                        case "csv":
                            var values = Str(params[attr])[split](separator),
                                from2 = Str(from[attr])[split](separator);
                            if (attr == "clip-rect") {
                                from[attr] = from2;
                                diff[attr] = [];
                                i = from2.length;
                                while (i--) {
                                    diff[attr][i] = (values[i] - from[attr][i]) / ms;
                                }
                            }
                            to[attr] = values;
                            break;
                        default:
                            values = [][concat](params[attr]);
                            from2 = [][concat](from[attr]);
                            diff[attr] = [];
                            i = element.paper.customAttributes[attr].length;
                            while (i--) {
                                diff[attr][i] = ((values[i] || 0) - (from2[i] || 0)) / ms;
                            }
                            break;
                    }
                }
            }
            var easing = params.easing,
                easyeasy = R.easing_formulas[easing];
            if (!easyeasy) {
                easyeasy = Str(easing).match(bezierrg);
                if (easyeasy && easyeasy.length == 5) {
                    var curve = easyeasy;
                    easyeasy = function (t) {
                        return CubicBezierAtTime(t, +curve[1], +curve[2], +curve[3], +curve[4], ms);
                    };
                } else {
                    easyeasy = pipe;
                }
            }
            timestamp = params.start || anim.start || +new Date;
            e = {
                anim: anim,
                percent: percent,
                timestamp: timestamp,
                start: timestamp + (anim.del || 0),
                status: 0,
                initstatus: status || 0,
                stop: false,
                ms: ms,
                easing: easyeasy,
                from: from,
                diff: diff,
                to: to,
                el: element,
                callback: params.callback,
                prev: prev,
                next: next,
                repeat: times || anim.times,
                origin: element.attr(),
                totalOrigin: totalOrigin
            };
            animationElements.push(e);
            if (status && !isInAnim && !isInAnimSet) {
                e.stop = true;
                e.start = new Date - ms * status;
                if (animationElements.length == 1) {
                    return animation();
                }
            }
            if (isInAnimSet) {
                e.start = new Date - e.ms * status;
            }
            animationElements.length == 1 && requestAnimFrame(animation);
        } else {
            isInAnim.initstatus = status;
            isInAnim.start = new Date - isInAnim.ms * status;
        }
        eve("raphael.anim.start." + element.id, element, anim);
    }
    /*\
     * Raphael.animation
     [ method ]
     **
     * Creates an animation object that can be passed to the @Element.animate or @Element.animateWith methods.
     * See also @Animation.delay and @Animation.repeat methods.
     **
     > Parameters
     **
     - params (object) final attributes for the element, see also @Element.attr
     - ms (number) number of milliseconds for animation to run
     - easing (string) #optional easing type. Accept one of @Raphael.easing_formulas or CSS format: `cubic&#x2010;bezier(XX,&#160;XX,&#160;XX,&#160;XX)`
     - callback (function) #optional callback function. Will be called at the end of animation.
     **
     = (object) @Animation
    \*/
    R.animation = function (params, ms, easing, callback) {
        if (params instanceof Animation) {
            return params;
        }
        if (R.is(easing, "function") || !easing) {
            callback = callback || easing || null;
            easing = null;
        }
        params = Object(params);
        ms = +ms || 0;
        var p = {},
            json,
            attr;
        for (attr in params) if (params[has](attr) && toFloat(attr) != attr && toFloat(attr) + "%" != attr) {
            json = true;
            p[attr] = params[attr];
        }
        if (!json) {
            return new Animation(params, ms);
        } else {
            easing && (p.easing = easing);
            callback && (p.callback = callback);
            return new Animation({100: p}, ms);
        }
    };
    /*\
     * Element.animate
     [ method ]
     **
     * Creates and starts animation for given element.
     **
     > Parameters
     **
     - params (object) final attributes for the element, see also @Element.attr
     - ms (number) number of milliseconds for animation to run
     - easing (string) #optional easing type. Accept one of @Raphael.easing_formulas or CSS format: `cubic&#x2010;bezier(XX,&#160;XX,&#160;XX,&#160;XX)`
     - callback (function) #optional callback function. Will be called at the end of animation.
     * or
     - animation (object) animation object, see @Raphael.animation
     **
     = (object) original element
    \*/
    elproto.animate = function (params, ms, easing, callback) {
        var element = this;
        if (element.removed) {
            callback && callback.call(element);
            return element;
        }
        var anim = params instanceof Animation ? params : R.animation(params, ms, easing, callback);
        runAnimation(anim, element, anim.percents[0], null, element.attr());
        return element;
    };
    /*\
     * Element.setTime
     [ method ]
     **
     * Sets the status of animation of the element in milliseconds. Similar to @Element.status method.
     **
     > Parameters
     **
     - anim (object) animation object
     - value (number) number of milliseconds from the beginning of the animation
     **
     = (object) original element if `value` is specified
     * Note, that during animation following events are triggered:
     *
     * On each animation frame event `anim.frame.<id>`, on start `anim.start.<id>` and on end `anim.finish.<id>`.
    \*/
    elproto.setTime = function (anim, value) {
        if (anim && value != null) {
            this.status(anim, mmin(value, anim.ms) / anim.ms);
        }
        return this;
    };
    /*\
     * Element.status
     [ method ]
     **
     * Gets or sets the status of animation of the element.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     - value (number) #optional 0 – 1. If specified, method works like a setter and sets the status of a given animation to the value. This will cause animation to jump to the given position.
     **
     = (number) status
     * or
     = (array) status if `anim` is not specified. Array of objects in format:
     o {
     o     anim: (object) animation object
     o     status: (number) status
     o }
     * or
     = (object) original element if `value` is specified
    \*/
    elproto.status = function (anim, value) {
        var out = [],
            i = 0,
            len,
            e;
        if (value != null) {
            runAnimation(anim, this, -1, mmin(value, 1));
            return this;
        } else {
            len = animationElements.length;
            for (; i < len; i++) {
                e = animationElements[i];
                if (e.el.id == this.id && (!anim || e.anim == anim)) {
                    if (anim) {
                        return e.status;
                    }
                    out.push({
                        anim: e.anim,
                        status: e.status
                    });
                }
            }
            if (anim) {
                return 0;
            }
            return out;
        }
    };
    /*\
     * Element.pause
     [ method ]
     **
     * Stops animation of the element with ability to resume it later on.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     **
     = (object) original element
    \*/
    elproto.pause = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            if (eve("raphael.anim.pause." + this.id, this, animationElements[i].anim) !== false) {
                animationElements[i].paused = true;
            }
        }
        return this;
    };
    /*\
     * Element.resume
     [ method ]
     **
     * Resumes animation if it was paused with @Element.pause method.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     **
     = (object) original element
    \*/
    elproto.resume = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            var e = animationElements[i];
            if (eve("raphael.anim.resume." + this.id, this, e.anim) !== false) {
                delete e.paused;
                this.status(e.anim, e.status);
            }
        }
        return this;
    };
    /*\
     * Element.stop
     [ method ]
     **
     * Stops animation of the element.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     **
     = (object) original element
    \*/
    elproto.stop = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            if (eve("raphael.anim.stop." + this.id, this, animationElements[i].anim) !== false) {
                animationElements.splice(i--, 1);
            }
        }
        return this;
    };
    function stopAnimation(paper) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.paper == paper) {
            animationElements.splice(i--, 1);
        }
    }
    eve.on("raphael.remove", stopAnimation);
    eve.on("raphael.clear", stopAnimation);
    elproto.toString = function () {
        return "Rapha\xebl\u2019s object";
    };

    // Set
    var Set = function (items) {
        this.items = [];
        this.length = 0;
        this.type = "set";
        if (items) {
            for (var i = 0, ii = items.length; i < ii; i++) {
                if (items[i] && (items[i].constructor == elproto.constructor || items[i].constructor == Set)) {
                    this[this.items.length] = this.items[this.items.length] = items[i];
                    this.length++;
                }
            }
        }
    },
    setproto = Set.prototype;
    /*\
     * Set.push
     [ method ]
     **
     * Adds each argument to the current set.
     = (object) original element
    \*/
    setproto.push = function () {
        var item,
            len;
        for (var i = 0, ii = arguments.length; i < ii; i++) {
            item = arguments[i];
            if (item && (item.constructor == elproto.constructor || item.constructor == Set)) {
                len = this.items.length;
                this[len] = this.items[len] = item;
                this.length++;
            }
        }
        return this;
    };
    /*\
     * Set.pop
     [ method ]
     **
     * Removes last element and returns it.
     = (object) element
    \*/
    setproto.pop = function () {
        this.length && delete this[this.length--];
        return this.items.pop();
    };
    /*\
     * Set.forEach
     [ method ]
     **
     * Executes given function for each element in the set.
     *
     * If function returns `false` it will stop loop running.
     **
     > Parameters
     **
     - callback (function) function to run
     - thisArg (object) context object for the callback
     = (object) Set object
    \*/
    setproto.forEach = function (callback, thisArg) {
        for (var i = 0, ii = this.items.length; i < ii; i++) {
            if (callback.call(thisArg, this.items[i], i) === false) {
                return this;
            }
        }
        return this;
    };
    for (var method in elproto) if (elproto[has](method)) {
        setproto[method] = (function (methodname) {
            return function () {
                var arg = arguments;
                return this.forEach(function (el) {
                    el[methodname][apply](el, arg);
                });
            };
        })(method);
    }
    setproto.attr = function (name, value) {
        if (name && R.is(name, array) && R.is(name[0], "object")) {
            for (var j = 0, jj = name.length; j < jj; j++) {
                this.items[j].attr(name[j]);
            }
        } else {
            for (var i = 0, ii = this.items.length; i < ii; i++) {
                this.items[i].attr(name, value);
            }
        }
        return this;
    };
    /*\
     * Set.clear
     [ method ]
     **
     * Removeds all elements from the set
    \*/
    setproto.clear = function () {
        while (this.length) {
            this.pop();
        }
    };
    /*\
     * Set.splice
     [ method ]
     **
     * Removes given element from the set
     **
     > Parameters
     **
     - index (number) position of the deletion
     - count (number) number of element to remove
     - insertion… (object) #optional elements to insert
     = (object) set elements that were deleted
    \*/
    setproto.splice = function (index, count, insertion) {
        index = index < 0 ? mmax(this.length + index, 0) : index;
        count = mmax(0, mmin(this.length - index, count));
        var tail = [],
            todel = [],
            args = [],
            i;
        for (i = 2; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        for (i = 0; i < count; i++) {
            todel.push(this[index + i]);
        }
        for (; i < this.length - index; i++) {
            tail.push(this[index + i]);
        }
        var arglen = args.length;
        for (i = 0; i < arglen + tail.length; i++) {
            this.items[index + i] = this[index + i] = i < arglen ? args[i] : tail[i - arglen];
        }
        i = this.items.length = this.length -= count - arglen;
        while (this[i]) {
            delete this[i++];
        }
        return new Set(todel);
    };
    /*\
     * Set.exclude
     [ method ]
     **
     * Removes given element from the set
     **
     > Parameters
     **
     - element (object) element to remove
     = (boolean) `true` if object was found & removed from the set
    \*/
    setproto.exclude = function (el) {
        for (var i = 0, ii = this.length; i < ii; i++) if (this[i] == el) {
            this.splice(i, 1);
            return true;
        }
    };
    setproto.animate = function (params, ms, easing, callback) {
        (R.is(easing, "function") || !easing) && (callback = easing || null);
        var len = this.items.length,
            i = len,
            item,
            set = this,
            collector;
        if (!len) {
            return this;
        }
        callback && (collector = function () {
            !--len && callback.call(set);
        });
        easing = R.is(easing, string) ? easing : collector;
        var anim = R.animation(params, ms, easing, collector);
        item = this.items[--i].animate(anim);
        while (i--) {
            this.items[i] && !this.items[i].removed && this.items[i].animateWith(item, anim, anim);
        }
        return this;
    };
    setproto.insertAfter = function (el) {
        var i = this.items.length;
        while (i--) {
            this.items[i].insertAfter(el);
        }
        return this;
    };
    setproto.getBBox = function () {
        var x = [],
            y = [],
            x2 = [],
            y2 = [];
        for (var i = this.items.length; i--;) if (!this.items[i].removed) {
            var box = this.items[i].getBBox();
            x.push(box.x);
            y.push(box.y);
            x2.push(box.x + box.width);
            y2.push(box.y + box.height);
        }
        x = mmin[apply](0, x);
        y = mmin[apply](0, y);
        x2 = mmax[apply](0, x2);
        y2 = mmax[apply](0, y2);
        return {
            x: x,
            y: y,
            x2: x2,
            y2: y2,
            width: x2 - x,
            height: y2 - y
        };
    };
    setproto.clone = function (s) {
        s = this.paper.set();
        for (var i = 0, ii = this.items.length; i < ii; i++) {
            s.push(this.items[i].clone());
        }
        return s;
    };
    setproto.toString = function () {
        return "Rapha\xebl\u2018s set";
    };

    setproto.glow = function(glowConfig) {
        var ret = this.paper.set();
        this.forEach(function(shape, index){
            var g = shape.glow(glowConfig);
            if(g != null){
                g.forEach(function(shape2, index2){
                    ret.push(shape2);
                });
            }
        });
        return ret;
    };

    /*\
     * Raphael.registerFont
     [ method ]
     **
     * Adds given font to the registered set of fonts for Raphaël. Should be used as an internal call from within Cufón’s font file.
     * Returns original parameter, so it could be used with chaining.
     # <a href="http://wiki.github.com/sorccu/cufon/about">More about Cufón and how to convert your font form TTF, OTF, etc to JavaScript file.</a>
     **
     > Parameters
     **
     - font (object) the font to register
     = (object) the font you passed in
     > Usage
     | Cufon.registerFont(Raphael.registerFont({…}));
    \*/
    R.registerFont = function (font) {
        if (!font.face) {
            return font;
        }
        this.fonts = this.fonts || {};
        var fontcopy = {
                w: font.w,
                face: {},
                glyphs: {}
            },
            family = font.face["font-family"];
        for (var prop in font.face) if (font.face[has](prop)) {
            fontcopy.face[prop] = font.face[prop];
        }
        if (this.fonts[family]) {
            this.fonts[family].push(fontcopy);
        } else {
            this.fonts[family] = [fontcopy];
        }
        if (!font.svg) {
            fontcopy.face["units-per-em"] = toInt(font.face["units-per-em"], 10);
            for (var glyph in font.glyphs) if (font.glyphs[has](glyph)) {
                var path = font.glyphs[glyph];
                fontcopy.glyphs[glyph] = {
                    w: path.w,
                    k: {},
                    d: path.d && "M" + path.d.replace(/[mlcxtrv]/g, function (command) {
                            return {l: "L", c: "C", x: "z", t: "m", r: "l", v: "c"}[command] || "M";
                        }) + "z"
                };
                if (path.k) {
                    for (var k in path.k) if (path[has](k)) {
                        fontcopy.glyphs[glyph].k[k] = path.k[k];
                    }
                }
            }
        }
        return font;
    };
    /*\
     * Paper.getFont
     [ method ]
     **
     * Finds font object in the registered fonts by given parameters. You could specify only one word from the font name, like “Myriad” for “Myriad Pro”.
     **
     > Parameters
     **
     - family (string) font family name or any word from it
     - weight (string) #optional font weight
     - style (string) #optional font style
     - stretch (string) #optional font stretch
     = (object) the font object
     > Usage
     | paper.print(100, 100, "Test string", paper.getFont("Times", 800), 30);
    \*/
    paperproto.getFont = function (family, weight, style, stretch) {
        stretch = stretch || "normal";
        style = style || "normal";
        weight = +weight || {normal: 400, bold: 700, lighter: 300, bolder: 800}[weight] || 400;
        if (!R.fonts) {
            return;
        }
        var font = R.fonts[family];
        if (!font) {
            var name = new RegExp("(^|\\s)" + family.replace(/[^\w\d\s+!~.:_-]/g, E) + "(\\s|$)", "i");
            for (var fontName in R.fonts) if (R.fonts[has](fontName)) {
                if (name.test(fontName)) {
                    font = R.fonts[fontName];
                    break;
                }
            }
        }
        var thefont;
        if (font) {
            for (var i = 0, ii = font.length; i < ii; i++) {
                thefont = font[i];
                if (thefont.face["font-weight"] == weight && (thefont.face["font-style"] == style || !thefont.face["font-style"]) && thefont.face["font-stretch"] == stretch) {
                    break;
                }
            }
        }
        return thefont;
    };
    /*\
     * Paper.print
     [ method ]
     **
     * Creates path that represent given text written using given font at given position with given size.
     * Result of the method is path element that contains whole text as a separate path.
     **
     > Parameters
     **
     - x (number) x position of the text
     - y (number) y position of the text
     - string (string) text to print
     - font (object) font object, see @Paper.getFont
     - size (number) #optional size of the font, default is `16`
     - origin (string) #optional could be `"baseline"` or `"middle"`, default is `"middle"`
     - letter_spacing (number) #optional number in range `-1..1`, default is `0`
     = (object) resulting path element, which consist of all letters
     > Usage
     | var txt = r.print(10, 50, "print", r.getFont("Museo"), 30).attr({fill: "#fff"});
    \*/
    paperproto.print = function (x, y, string, font, size, origin, letter_spacing) {
        origin = origin || "middle"; // baseline|middle
        letter_spacing = mmax(mmin(letter_spacing || 0, 1), -1);
        var letters = Str(string)[split](E),
            shift = 0,
            notfirst = 0,
            path = E,
            scale;
        R.is(font, "string") && (font = this.getFont(font));
        if (font) {
            scale = (size || 16) / font.face["units-per-em"];
            var bb = font.face.bbox[split](separator),
                top = +bb[0],
                lineHeight = bb[3] - bb[1],
                shifty = 0,
                height = +bb[1] + (origin == "baseline" ? lineHeight + (+font.face.descent) : lineHeight / 2);
            for (var i = 0, ii = letters.length; i < ii; i++) {
                if (letters[i] == "\n") {
                    shift = 0;
                    curr = 0;
                    notfirst = 0;
                    shifty += lineHeight;
                } else {
                    var prev = notfirst && font.glyphs[letters[i - 1]] || {},
                        curr = font.glyphs[letters[i]];
                    shift += notfirst ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) + (font.w * letter_spacing) : 0;
                    notfirst = 1;
                }
                if (curr && curr.d) {
                    path += R.transformPath(curr.d, ["t", shift * scale, shifty * scale, "s", scale, scale, top, height, "t", (x - top) / scale, (y - height) / scale]);
                }
            }
        }
        return this.path(path).attr({
            fill: "#000",
            stroke: "none"
        });
    };

    /*\
     * Paper.add
     [ method ]
     **
     * Imports elements in JSON array in format `{type: type, <attributes>}`
     **
     > Parameters
     **
     - json (array)
     = (object) resulting set of imported elements
     > Usage
     | paper.add([
     |     {
     |         type: "circle",
     |         cx: 10,
     |         cy: 10,
     |         r: 5
     |     },
     |     {
     |         type: "rect",
     |         x: 10,
     |         y: 10,
     |         width: 10,
     |         height: 10,
     |         fill: "#fc0"
     |     }
     | ]);
    \*/
    paperproto.add = function (json) {
        if (R.is(json, "array")) {
            var res = this.set(),
                i = 0,
                ii = json.length,
                j;
            for (; i < ii; i++) {
                j = json[i] || {};
                elements[has](j.type) && res.push(this[j.type]().attr(j));
            }
        }
        return res;
    };

    /*\
     * Raphael.format
     [ method ]
     **
     * Simple format function. Replaces construction of type “`{<number>}`” to the corresponding argument.
     **
     > Parameters
     **
     - token (string) string to format
     - … (string) rest of arguments will be treated as parameters for replacement
     = (string) formated string
     > Usage
     | var x = 10,
     |     y = 20,
     |     width = 40,
     |     height = 50;
     | // this will draw a rectangular shape equivalent to "M10,20h40v50h-40z"
     | paper.path(Raphael.format("M{0},{1}h{2}v{3}h{4}z", x, y, width, height, -width));
    \*/
    R.format = function (token, params) {
        var args = R.is(params, array) ? [0][concat](params) : arguments;
        token && R.is(token, string) && args.length - 1 && (token = token.replace(formatrg, function (str, i) {
            return args[++i] == null ? E : args[i];
        }));
        return token || E;
    };
    /*\
     * Raphael.fullfill
     [ method ]
     **
     * A little bit more advanced format function than @Raphael.format. Replaces construction of type “`{<name>}`” to the corresponding argument.
     **
     > Parameters
     **
     - token (string) string to format
     - json (object) object which properties will be used as a replacement
     = (string) formated string
     > Usage
     | // this will draw a rectangular shape equivalent to "M10,20h40v50h-40z"
     | paper.path(Raphael.fullfill("M{x},{y}h{dim.width}v{dim.height}h{dim['negative width']}z", {
     |     x: 10,
     |     y: 20,
     |     dim: {
     |         width: 40,
     |         height: 50,
     |         "negative width": -40
     |     }
     | }));
    \*/
    R.fullfill = (function () {
        var tokenRegex = /\{([^\}]+)\}/g,
            objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g, // matches .xxxxx or ["xxxxx"] to run over object properties
            replacer = function (all, key, obj) {
                var res = obj;
                key.replace(objNotationRegex, function (all, name, quote, quotedName, isFunc) {
                    name = name || quotedName;
                    if (res) {
                        if (name in res) {
                            res = res[name];
                        }
                        typeof res == "function" && isFunc && (res = res());
                    }
                });
                res = (res == null || res == obj ? all : res) + "";
                return res;
            };
        return function (str, obj) {
            return String(str).replace(tokenRegex, function (all, key) {
                return replacer(all, key, obj);
            });
        };
    })();
    /*\
     * Raphael.ninja
     [ method ]
     **
     * If you want to leave no trace of Raphaël (Well, Raphaël creates only one global variable `Raphael`, but anyway.) You can use `ninja` method.
     * Beware, that in this case plugins could stop working, because they are depending on global variable existance.
     **
     = (object) Raphael object
     > Usage
     | (function (local_raphael) {
     |     var paper = local_raphael(10, 10, 320, 200);
     |     …
     | })(Raphael.ninja());
    \*/
    R.ninja = function () {
        oldRaphael.was ? (g.win.Raphael = oldRaphael.is) : delete Raphael;
        return R;
    };
    /*\
     * Raphael.st
     [ property (object) ]
     **
     * You can add your own method to elements and sets. It is wise to add a set method for each element method
     * you added, so you will be able to call the same method on sets too.
     **
     * See also @Raphael.el.
     > Usage
     | Raphael.el.red = function () {
     |     this.attr({fill: "#f00"});
     | };
     | Raphael.st.red = function () {
     |     this.forEach(function (el) {
     |         el.red();
     |     });
     | };
     | // then use it
     | paper.set(paper.circle(100, 100, 20), paper.circle(110, 100, 20)).red();
    \*/
    R.st = setproto;
    // Firefox <3.6 fix: http://webreflection.blogspot.com/2009/11/195-chars-to-help-lazy-loading.html
    (function (doc, loaded, f) {
        if (doc.readyState == null && doc.addEventListener){
            doc.addEventListener(loaded, f = function () {
                doc.removeEventListener(loaded, f, false);
                doc.readyState = "complete";
            }, false);
            doc.readyState = "loading";
        }
        function isLoaded() {
            (/in/).test(doc.readyState) ? setTimeout(isLoaded, 9) : R.eve("raphael.DOMload");
        }
        isLoaded();
    })(document, "DOMContentLoaded");

    oldRaphael.was ? (g.win.Raphael = R) : (Raphael = R);
    
    eve.on("raphael.DOMload", function () {
        loaded = true;
    });

    require('./raphael.svg');
    require('./raphael.vml');

    module.exports = Raphael;
})();

},{"./raphael.svg":5,"./raphael.vml":6,"eve":3}],5:[function(require,module,exports){
// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël - JavaScript Vector Library                                 │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ SVG Module                                                          │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\
window.Raphael && window.Raphael.svg && function (R) {
    var has = "hasOwnProperty",
        Str = String,
        toFloat = parseFloat,
        toInt = parseInt,
        math = Math,
        mmax = math.max,
        abs = math.abs,
        pow = math.pow,
        separator = /[, ]+/,
        eve = R.eve,
        E = "",
        S = " ";
    var xlink = "http://www.w3.org/1999/xlink",
        markers = {
            block: "M5,0 0,2.5 5,5z",
            classic: "M5,0 0,2.5 5,5 3.5,3 3.5,2z",
            diamond: "M2.5,0 5,2.5 2.5,5 0,2.5z",
            open: "M6,1 1,3.5 6,6",
            oval: "M2.5,0A2.5,2.5,0,0,1,2.5,5 2.5,2.5,0,0,1,2.5,0z"
        },
        markerCounter = {};
    R.toString = function () {
        return  "Your browser supports SVG.\nYou are running Rapha\xebl " + this.version;
    };
    var $ = function (el, attr) {
        if (attr) {
            if (typeof el == "string") {
                el = $(el);
            }
            for (var key in attr) if (attr[has](key)) {
                if (key.substring(0, 6) == "xlink:") {
                    el.setAttributeNS(xlink, key.substring(6), Str(attr[key]));
                } else {
                    el.setAttribute(key, Str(attr[key]));
                }
            }
        } else {
            el = R._g.doc.createElementNS("http://www.w3.org/2000/svg", el);
            el.style && (el.style.webkitTapHighlightColor = "rgba(0,0,0,0)");
        }
        return el;
    },
    addGradientFill = function (element, gradient) {
        var type = "linear",
            id = element.id + gradient,
            fx = .5, fy = .5,
            o = element.node,
            SVG = element.paper,
            s = o.style,
            el = R._g.doc.getElementById(id);
        if (!el) {
            gradient = Str(gradient).replace(R._radial_gradient, function (all, _fx, _fy) {
                type = "radial";
                if (_fx && _fy) {
                    fx = toFloat(_fx);
                    fy = toFloat(_fy);
                    var dir = ((fy > .5) * 2 - 1);
                    pow(fx - .5, 2) + pow(fy - .5, 2) > .25 &&
                        (fy = math.sqrt(.25 - pow(fx - .5, 2)) * dir + .5) &&
                        fy != .5 &&
                        (fy = fy.toFixed(5) - 1e-5 * dir);
                }
                return E;
            });
            gradient = gradient.split(/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
                var vector = [0, 0, math.cos(R.rad(angle)), math.sin(R.rad(angle))],
                    max = 1 / (mmax(abs(vector[2]), abs(vector[3])) || 1);
                vector[2] *= max;
                vector[3] *= max;
                if (vector[2] < 0) {
                    vector[0] = -vector[2];
                    vector[2] = 0;
                }
                if (vector[3] < 0) {
                    vector[1] = -vector[3];
                    vector[3] = 0;
                }
            }
            var dots = R._parseDots(gradient);
            if (!dots) {
                return null;
            }
            id = id.replace(/[\(\)\s,\xb0#]/g, "_");
            
            if (element.gradient && id != element.gradient.id) {
                SVG.defs.removeChild(element.gradient);
                delete element.gradient;
            }

            if (!element.gradient) {
                el = $(type + "Gradient", {id: id});
                element.gradient = el;
                $(el, type == "radial" ? {
                    fx: fx,
                    fy: fy
                } : {
                    x1: vector[0],
                    y1: vector[1],
                    x2: vector[2],
                    y2: vector[3],
                    gradientTransform: element.matrix.invert()
                });
                SVG.defs.appendChild(el);
                for (var i = 0, ii = dots.length; i < ii; i++) {
                    el.appendChild($("stop", {
                        offset: dots[i].offset ? dots[i].offset : i ? "100%" : "0%",
                        "stop-color": dots[i].color || "#fff"
                    }));
                }
            }
        }
        $(o, {
            fill: "url(#" + id + ")",
            opacity: 1,
            "fill-opacity": 1
        });
        s.fill = E;
        s.opacity = 1;
        s.fillOpacity = 1;
        return 1;
    },
    updatePosition = function (o) {
        var bbox = o.getBBox(1);
        $(o.pattern, {patternTransform: o.matrix.invert() + " translate(" + bbox.x + "," + bbox.y + ")"});
    },
    addArrow = function (o, value, isEnd) {
        if (o.type == "path") {
            var values = Str(value).toLowerCase().split("-"),
                p = o.paper,
                se = isEnd ? "end" : "start",
                node = o.node,
                attrs = o.attrs,
                stroke = attrs["stroke-width"],
                i = values.length,
                type = "classic",
                from,
                to,
                dx,
                refX,
                attr,
                w = 3,
                h = 3,
                t = 5;
            while (i--) {
                switch (values[i]) {
                    case "block":
                    case "classic":
                    case "oval":
                    case "diamond":
                    case "open":
                    case "none":
                        type = values[i];
                        break;
                    case "wide": h = 5; break;
                    case "narrow": h = 2; break;
                    case "long": w = 5; break;
                    case "short": w = 2; break;
                }
            }
            if (type == "open") {
                w += 2;
                h += 2;
                t += 2;
                dx = 1;
                refX = isEnd ? 4 : 1;
                attr = {
                    fill: "none",
                    stroke: attrs.stroke
                };
            } else {
                refX = dx = w / 2;
                attr = {
                    fill: attrs.stroke,
                    stroke: "none"
                };
            }
            if (o._.arrows) {
                if (isEnd) {
                    o._.arrows.endPath && markerCounter[o._.arrows.endPath]--;
                    o._.arrows.endMarker && markerCounter[o._.arrows.endMarker]--;
                } else {
                    o._.arrows.startPath && markerCounter[o._.arrows.startPath]--;
                    o._.arrows.startMarker && markerCounter[o._.arrows.startMarker]--;
                }
            } else {
                o._.arrows = {};
            }
            if (type != "none") {
                var pathId = "raphael-marker-" + type,
                    markerId = "raphael-marker-" + se + type + w + h;
                if (!R._g.doc.getElementById(pathId)) {
                    p.defs.appendChild($($("path"), {
                        "stroke-linecap": "round",
                        d: markers[type],
                        id: pathId
                    }));
                    markerCounter[pathId] = 1;
                } else {
                    markerCounter[pathId]++;
                }
                var marker = R._g.doc.getElementById(markerId),
                    use;
                if (!marker) {
                    marker = $($("marker"), {
                        id: markerId,
                        markerHeight: h,
                        markerWidth: w,
                        orient: "auto",
                        refX: refX,
                        refY: h / 2
                    });
                    use = $($("use"), {
                        "xlink:href": "#" + pathId,
                        transform: (isEnd ? "rotate(180 " + w / 2 + " " + h / 2 + ") " : E) + "scale(" + w / t + "," + h / t + ")",
                        "stroke-width": (1 / ((w / t + h / t) / 2)).toFixed(4)
                    });
                    marker.appendChild(use);
                    p.defs.appendChild(marker);
                    markerCounter[markerId] = 1;
                } else {
                    markerCounter[markerId]++;
                    use = marker.getElementsByTagName("use")[0];
                }
                $(use, attr);
                var delta = dx * (type != "diamond" && type != "oval");
                if (isEnd) {
                    from = o._.arrows.startdx * stroke || 0;
                    to = R.getTotalLength(attrs.path) - delta * stroke;
                } else {
                    from = delta * stroke;
                    to = R.getTotalLength(attrs.path) - (o._.arrows.enddx * stroke || 0);
                }
                attr = {};
                attr["marker-" + se] = "url(#" + markerId + ")";
                if (to || from) {
                    attr.d = Raphael.getSubpath(attrs.path, from, to);
                }
                $(node, attr);
                o._.arrows[se + "Path"] = pathId;
                o._.arrows[se + "Marker"] = markerId;
                o._.arrows[se + "dx"] = delta;
                o._.arrows[se + "Type"] = type;
                o._.arrows[se + "String"] = value;
            } else {
                if (isEnd) {
                    from = o._.arrows.startdx * stroke || 0;
                    to = R.getTotalLength(attrs.path) - from;
                } else {
                    from = 0;
                    to = R.getTotalLength(attrs.path) - (o._.arrows.enddx * stroke || 0);
                }
                o._.arrows[se + "Path"] && $(node, {d: Raphael.getSubpath(attrs.path, from, to)});
                delete o._.arrows[se + "Path"];
                delete o._.arrows[se + "Marker"];
                delete o._.arrows[se + "dx"];
                delete o._.arrows[se + "Type"];
                delete o._.arrows[se + "String"];
            }
            for (attr in markerCounter) if (markerCounter[has](attr) && !markerCounter[attr]) {
                var item = R._g.doc.getElementById(attr);
                item && item.parentNode.removeChild(item);
            }
        }
    },
    dasharray = {
        "": [0],
        "none": [0],
        "-": [3, 1],
        ".": [1, 1],
        "-.": [3, 1, 1, 1],
        "-..": [3, 1, 1, 1, 1, 1],
        ". ": [1, 3],
        "- ": [4, 3],
        "--": [8, 3],
        "- .": [4, 3, 1, 3],
        "--.": [8, 3, 1, 3],
        "--..": [8, 3, 1, 3, 1, 3]
    },
    addDashes = function (o, value, params) {
        value = dasharray[Str(value).toLowerCase()];
        if (value) {
            var width = o.attrs["stroke-width"] || "1",
                butt = {round: width, square: width, butt: 0}[o.attrs["stroke-linecap"] || params["stroke-linecap"]] || 0,
                dashes = [],
                i = value.length;
            while (i--) {
                dashes[i] = value[i] * width + ((i % 2) ? 1 : -1) * butt;
            }
            $(o.node, {"stroke-dasharray": dashes.join(",")});
        }
    },
    setFillAndStroke = function (o, params) {
        var node = o.node,
            attrs = o.attrs,
            vis = node.style.visibility;
        node.style.visibility = "hidden";
        for (var att in params) {
            if (params[has](att)) {
                if (!R._availableAttrs[has](att)) {
                    continue;
                }
                var value = params[att];
                attrs[att] = value;
                switch (att) {
                    case "blur":
                        o.blur(value);
                        break;
                    case "href":
                    case "title":
                    case "target":
                        var pn = node.parentNode;
                        if (pn.tagName.toLowerCase() != "a") {
                            var hl = $("a");
                            pn.insertBefore(hl, node);
                            hl.appendChild(node);
                            pn = hl;
                        }
                        if (att == "target") {
                            pn.setAttributeNS(xlink, "show", value == "blank" ? "new" : value);
                        } else {
                            pn.setAttributeNS(xlink, att, value);
                        }
                        break;
                    case "cursor":
                        node.style.cursor = value;
                        break;
                    case "transform":
                        o.transform(value);
                        break;
                    case "arrow-start":
                        addArrow(o, value);
                        break;
                    case "arrow-end":
                        addArrow(o, value, 1);
                        break;
                    case "clip-rect":
                        var rect = Str(value).split(separator);
                        if (rect.length == 4) {
                            o.clip && o.clip.parentNode.parentNode.removeChild(o.clip.parentNode);
                            var el = $("clipPath"),
                                rc = $("rect");
                            el.id = R.createUUID();
                            $(rc, {
                                x: rect[0],
                                y: rect[1],
                                width: rect[2],
                                height: rect[3]
                            });
                            el.appendChild(rc);
                            o.paper.defs.appendChild(el);
                            $(node, {"clip-path": "url(#" + el.id + ")"});
                            o.clip = rc;
                        }
                        if (!value) {
                            var path = node.getAttribute("clip-path");
                            if (path) {
                                var clip = R._g.doc.getElementById(path.replace(/(^url\(#|\)$)/g, E));
                                clip && clip.parentNode.removeChild(clip);
                                $(node, {"clip-path": E});
                                delete o.clip;
                            }
                        }
                    break;
                    case "path":
                        if (o.type == "path") {
                            $(node, {d: value ? attrs.path = R._pathToAbsolute(value) : "M0,0"});
                            o._.dirty = 1;
                            if (o._.arrows) {
                                "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                                "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                            }
                        }
                        break;
                    case "width":
                        node.setAttribute(att, value);
                        o._.dirty = 1;
                        if (attrs.fx) {
                            att = "x";
                            value = attrs.x;
                        } else {
                            break;
                        }
                    case "x":
                        if (attrs.fx) {
                            value = -attrs.x - (attrs.width || 0);
                        }
                    case "rx":
                        if (att == "rx" && o.type == "rect") {
                            break;
                        }
                    case "cx":
                        node.setAttribute(att, value);
                        o.pattern && updatePosition(o);
                        o._.dirty = 1;
                        break;
                    case "height":
                        node.setAttribute(att, value);
                        o._.dirty = 1;
                        if (attrs.fy) {
                            att = "y";
                            value = attrs.y;
                        } else {
                            break;
                        }
                    case "y":
                        if (attrs.fy) {
                            value = -attrs.y - (attrs.height || 0);
                        }
                    case "ry":
                        if (att == "ry" && o.type == "rect") {
                            break;
                        }
                    case "cy":
                        node.setAttribute(att, value);
                        o.pattern && updatePosition(o);
                        o._.dirty = 1;
                        break;
                    case "r":
                        if (o.type == "rect") {
                            $(node, {rx: value, ry: value});
                        } else {
                            node.setAttribute(att, value);
                        }
                        o._.dirty = 1;
                        break;
                    case "src":
                        if (o.type == "image") {
                            node.setAttributeNS(xlink, "href", value);
                        }
                        break;
                    case "stroke-width":
                        if (o._.sx != 1 || o._.sy != 1) {
                            value /= mmax(abs(o._.sx), abs(o._.sy)) || 1;
                        }
                        if (o.paper._vbSize) {
                            value *= o.paper._vbSize;
                        }
                        node.setAttribute(att, value);
                        if (attrs["stroke-dasharray"]) {
                            addDashes(o, attrs["stroke-dasharray"], params);
                        }
                        if (o._.arrows) {
                            "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                            "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                        }
                        break;
                    case "stroke-dasharray":
                        addDashes(o, value, params);
                        break;
                    case "fill":
                        var isURL = Str(value).match(R._ISURL);
                        if (isURL) {
                            el = $("pattern");
                            var ig = $("image");
                            el.id = R.createUUID();
                            $(el, {x: 0, y: 0, patternUnits: "userSpaceOnUse", height: 1, width: 1});
                            $(ig, {x: 0, y: 0, "xlink:href": isURL[1]});
                            el.appendChild(ig);

                            (function (el) {
                                R._preload(isURL[1], function () {
                                    var w = this.offsetWidth,
                                        h = this.offsetHeight;
                                    $(el, {width: w, height: h});
                                    $(ig, {width: w, height: h});
                                    o.paper.safari();
                                });
                            })(el);
                            o.paper.defs.appendChild(el);
                            $(node, {fill: "url(#" + el.id + ")"});
                            o.pattern = el;
                            o.pattern && updatePosition(o);
                            break;
                        }
                        var clr = R.getRGB(value);
                        if (!clr.error) {
                            delete params.gradient;
                            delete attrs.gradient;
                            !R.is(attrs.opacity, "undefined") &&
                                R.is(params.opacity, "undefined") &&
                                $(node, {opacity: attrs.opacity});
                            !R.is(attrs["fill-opacity"], "undefined") &&
                                R.is(params["fill-opacity"], "undefined") &&
                                $(node, {"fill-opacity": attrs["fill-opacity"]});
                        } else if ((o.type == "circle" || o.type == "ellipse" || Str(value).charAt() != "r") && addGradientFill(o, value)) {
                            if ("opacity" in attrs || "fill-opacity" in attrs) {
                                var gradient = R._g.doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, E));
                                if (gradient) {
                                    var stops = gradient.getElementsByTagName("stop");
                                    $(stops[stops.length - 1], {"stop-opacity": ("opacity" in attrs ? attrs.opacity : 1) * ("fill-opacity" in attrs ? attrs["fill-opacity"] : 1)});
                                }
                            }
                            attrs.gradient = value;
                            attrs.fill = "none";
                            break;
                        }
                        clr[has]("opacity") && $(node, {"fill-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                    case "stroke":
                        clr = R.getRGB(value);
                        node.setAttribute(att, clr.hex);
                        att == "stroke" && clr[has]("opacity") && $(node, {"stroke-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                        if (att == "stroke" && o._.arrows) {
                            "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                            "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                        }
                        break;
                    case "gradient":
                        (o.type == "circle" || o.type == "ellipse" || Str(value).charAt() != "r") && addGradientFill(o, value);
                        break;
                    case "opacity":
                        if (attrs.gradient && !attrs[has]("stroke-opacity")) {
                            $(node, {"stroke-opacity": value > 1 ? value / 100 : value});
                        }
                        // fall
                    case "fill-opacity":
                        if (attrs.gradient) {
                            gradient = R._g.doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, E));
                            if (gradient) {
                                stops = gradient.getElementsByTagName("stop");
                                $(stops[stops.length - 1], {"stop-opacity": value});
                            }
                            break;
                        }
                    default:
                        att == "font-size" && (value = toInt(value, 10) + "px");
                        var cssrule = att.replace(/(\-.)/g, function (w) {
                            return w.substring(1).toUpperCase();
                        });
                        node.style[cssrule] = value;
                        o._.dirty = 1;
                        node.setAttribute(att, value);
                        break;
                }
            }
        }

        tuneText(o, params);
        node.style.visibility = vis;
    },
    leading = 1.2,
    tuneText = function (el, params) {
        if (el.type != "text" || !(params[has]("text") || params[has]("font") || params[has]("font-size") || params[has]("x") || params[has]("y"))) {
            return;
        }
        var a = el.attrs,
            node = el.node,
            fontSize = node.firstChild ? toInt(R._g.doc.defaultView.getComputedStyle(node.firstChild, E).getPropertyValue("font-size"), 10) : 10;

        if (params[has]("text")) {
            a.text = params.text;
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
            var texts = Str(params.text).split("\n"),
                tspans = [],
                tspan;
            for (var i = 0, ii = texts.length; i < ii; i++) {
                tspan = $("tspan");
                i && $(tspan, {dy: fontSize * leading, x: a.x});
                tspan.appendChild(R._g.doc.createTextNode(texts[i]));
                node.appendChild(tspan);
                tspans[i] = tspan;
            }
        } else {
            tspans = node.getElementsByTagName("tspan");
            for (i = 0, ii = tspans.length; i < ii; i++) if (i) {
                $(tspans[i], {dy: fontSize * leading, x: a.x});
            } else {
                $(tspans[0], {dy: 0});
            }
        }
        $(node, {x: a.x, y: a.y});
        el._.dirty = 1;
        var bb = el._getBBox(),
            dif = a.y - (bb.y + bb.height / 2);
        dif && R.is(dif, "finite") && $(tspans[0], {dy: dif});
    },
    Element = function (node, svg) {
        var X = 0,
            Y = 0;
        /*\
         * Element.node
         [ property (object) ]
         **
         * Gives you a reference to the DOM object, so you can assign event handlers or just mess around.
         **
         * Note: Don’t mess with it.
         > Usage
         | // draw a circle at coordinate 10,10 with radius of 10
         | var c = paper.circle(10, 10, 10);
         | c.node.onclick = function () {
         |     c.attr("fill", "red");
         | };
        \*/
        this[0] = this.node = node;
        /*\
         * Element.raphael
         [ property (object) ]
         **
         * Internal reference to @Raphael object. In case it is not available.
         > Usage
         | Raphael.el.red = function () {
         |     var hsb = this.paper.raphael.rgb2hsb(this.attr("fill"));
         |     hsb.h = 1;
         |     this.attr({fill: this.paper.raphael.hsb2rgb(hsb).hex});
         | }
        \*/
        node.raphael = true;
        /*\
         * Element.id
         [ property (number) ]
         **
         * Unique id of the element. Especially usesful when you want to listen to events of the element, 
         * because all events are fired in format `<module>.<action>.<id>`. Also useful for @Paper.getById method.
        \*/
        this.id = R._oid++;
        node.raphaelid = this.id;
        this.matrix = R.matrix();
        this.realPath = null;
        /*\
         * Element.paper
         [ property (object) ]
         **
         * Internal reference to “paper” where object drawn. Mainly for use in plugins and element extensions.
         > Usage
         | Raphael.el.cross = function () {
         |     this.attr({fill: "red"});
         |     this.paper.path("M10,10L50,50M50,10L10,50")
         |         .attr({stroke: "red"});
         | }
        \*/
        this.paper = svg;
        this.attrs = this.attrs || {};
        this._ = {
            transform: [],
            sx: 1,
            sy: 1,
            deg: 0,
            dx: 0,
            dy: 0,
            dirty: 1
        };
        !svg.bottom && (svg.bottom = this);
        /*\
         * Element.prev
         [ property (object) ]
         **
         * Reference to the previous element in the hierarchy.
        \*/
        this.prev = svg.top;
        svg.top && (svg.top.next = this);
        svg.top = this;
        /*\
         * Element.next
         [ property (object) ]
         **
         * Reference to the next element in the hierarchy.
        \*/
        this.next = null;
    },
    elproto = R.el;

    Element.prototype = elproto;
    elproto.constructor = Element;

    R._engine.path = function (pathString, SVG) {
        var el = $("path");
        SVG.canvas && SVG.canvas.appendChild(el);
        var p = new Element(el, SVG);
        p.type = "path";
        setFillAndStroke(p, {
            fill: "none",
            stroke: "#000",
            path: pathString
        });
        return p;
    };
    /*\
     * Element.rotate
     [ method ]
     **
     * Deprecated! Use @Element.transform instead.
     * Adds rotation by given angle around given point to the list of
     * transformations of the element.
     > Parameters
     - deg (number) angle in degrees
     - cx (number) #optional x coordinate of the centre of rotation
     - cy (number) #optional y coordinate of the centre of rotation
     * If cx & cy aren’t specified centre of the shape is used as a point of rotation.
     = (object) @Element
    \*/
    elproto.rotate = function (deg, cx, cy) {
        if (this.removed) {
            return this;
        }
        deg = Str(deg).split(separator);
        if (deg.length - 1) {
            cx = toFloat(deg[1]);
            cy = toFloat(deg[2]);
        }
        deg = toFloat(deg[0]);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
            cx = bbox.x + bbox.width / 2;
            cy = bbox.y + bbox.height / 2;
        }
        this.transform(this._.transform.concat([["r", deg, cx, cy]]));
        return this;
    };
    /*\
     * Element.scale
     [ method ]
     **
     * Deprecated! Use @Element.transform instead.
     * Adds scale by given amount relative to given point to the list of
     * transformations of the element.
     > Parameters
     - sx (number) horisontal scale amount
     - sy (number) vertical scale amount
     - cx (number) #optional x coordinate of the centre of scale
     - cy (number) #optional y coordinate of the centre of scale
     * If cx & cy aren’t specified centre of the shape is used instead.
     = (object) @Element
    \*/
    elproto.scale = function (sx, sy, cx, cy) {
        if (this.removed) {
            return this;
        }
        sx = Str(sx).split(separator);
        if (sx.length - 1) {
            sy = toFloat(sx[1]);
            cx = toFloat(sx[2]);
            cy = toFloat(sx[3]);
        }
        sx = toFloat(sx[0]);
        (sy == null) && (sy = sx);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
        }
        cx = cx == null ? bbox.x + bbox.width / 2 : cx;
        cy = cy == null ? bbox.y + bbox.height / 2 : cy;
        this.transform(this._.transform.concat([["s", sx, sy, cx, cy]]));
        return this;
    };
    /*\
     * Element.translate
     [ method ]
     **
     * Deprecated! Use @Element.transform instead.
     * Adds translation by given amount to the list of transformations of the element.
     > Parameters
     - dx (number) horisontal shift
     - dy (number) vertical shift
     = (object) @Element
    \*/
    elproto.translate = function (dx, dy) {
        if (this.removed) {
            return this;
        }
        dx = Str(dx).split(separator);
        if (dx.length - 1) {
            dy = toFloat(dx[1]);
        }
        dx = toFloat(dx[0]) || 0;
        dy = +dy || 0;
        this.transform(this._.transform.concat([["t", dx, dy]]));
        return this;
    };
    /*\
     * Element.transform
     [ method ]
     **
     * Adds transformation to the element which is separate to other attributes,
     * i.e. translation doesn’t change `x` or `y` of the rectange. The format
     * of transformation string is similar to the path string syntax:
     | "t100,100r30,100,100s2,2,100,100r45s1.5"
     * Each letter is a command. There are four commands: `t` is for translate, `r` is for rotate, `s` is for
     * scale and `m` is for matrix.
     *
     * There are also alternative “absolute” translation, rotation and scale: `T`, `R` and `S`. They will not take previous transformation into account. For example, `...T100,0` will always move element 100 px horisontally, while `...t100,0` could move it vertically if there is `r90` before. Just compare results of `r90t100,0` and `r90T100,0`.
     *
     * So, the example line above could be read like “translate by 100, 100; rotate 30° around 100, 100; scale twice around 100, 100;
     * rotate 45° around centre; scale 1.5 times relative to centre”. As you can see rotate and scale commands have origin
     * coordinates as optional parameters, the default is the centre point of the element.
     * Matrix accepts six parameters.
     > Usage
     | var el = paper.rect(10, 20, 300, 200);
     | // translate 100, 100, rotate 45°, translate -100, 0
     | el.transform("t100,100r45t-100,0");
     | // if you want you can append or prepend transformations
     | el.transform("...t50,50");
     | el.transform("s2...");
     | // or even wrap
     | el.transform("t50,50...t-50-50");
     | // to reset transformation call method with empty string
     | el.transform("");
     | // to get current value call it without parameters
     | console.log(el.transform());
     > Parameters
     - tstr (string) #optional transformation string
     * If tstr isn’t specified
     = (string) current transformation string
     * else
     = (object) @Element
    \*/
    elproto.transform = function (tstr) {
        var _ = this._;
        if (tstr == null) {
            return _.transform;
        }
        R._extractTransform(this, tstr);

        this.clip && $(this.clip, {transform: this.matrix.invert()});
        this.pattern && updatePosition(this);
        this.node && $(this.node, {transform: this.matrix});
    
        if (_.sx != 1 || _.sy != 1) {
            var sw = this.attrs[has]("stroke-width") ? this.attrs["stroke-width"] : 1;
            this.attr({"stroke-width": sw});
        }

        return this;
    };
    /*\
     * Element.hide
     [ method ]
     **
     * Makes element invisible. See @Element.show.
     = (object) @Element
    \*/
    elproto.hide = function () {
        !this.removed && this.paper.safari(this.node.style.display = "none");
        return this;
    };
    /*\
     * Element.show
     [ method ]
     **
     * Makes element visible. See @Element.hide.
     = (object) @Element
    \*/
    elproto.show = function () {
        !this.removed && this.paper.safari(this.node.style.display = "");
        return this;
    };
    /*\
     * Element.remove
     [ method ]
     **
     * Removes element from the paper.
    \*/
    elproto.remove = function () {
        if (this.removed || !this.node.parentNode) {
            return;
        }
        var paper = this.paper;
        paper.__set__ && paper.__set__.exclude(this);
        eve.unbind("raphael.*.*." + this.id);
        if (this.gradient) {
            paper.defs.removeChild(this.gradient);
        }
        R._tear(this, paper);
        if (this.node.parentNode.tagName.toLowerCase() == "a") {
            this.node.parentNode.parentNode.removeChild(this.node.parentNode);
        } else {
            this.node.parentNode.removeChild(this.node);
        }
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
        this.removed = true;
    };
    elproto._getBBox = function () {
        if (this.node.style.display == "none") {
            this.show();
            var hide = true;
        }
        var bbox = {};
        try {
            bbox = this.node.getBBox();
        } catch(e) {
            // Firefox 3.0.x plays badly here
        } finally {
            bbox = bbox || {};
        }
        hide && this.hide();
        return bbox;
    };
    /*\
     * Element.attr
     [ method ]
     **
     * Sets the attributes of the element.
     > Parameters
     - attrName (string) attribute’s name
     - value (string) value
     * or
     - params (object) object of name/value pairs
     * or
     - attrName (string) attribute’s name
     * or
     - attrNames (array) in this case method returns array of current values for given attribute names
     = (object) @Element if attrsName & value or params are passed in.
     = (...) value of the attribute if only attrsName is passed in.
     = (array) array of values of the attribute if attrsNames is passed in.
     = (object) object of attributes if nothing is passed in.
     > Possible parameters
     # <p>Please refer to the <a href="http://www.w3.org/TR/SVG/" title="The W3C Recommendation for the SVG language describes these properties in detail.">SVG specification</a> for an explanation of these parameters.</p>
     o arrow-end (string) arrowhead on the end of the path. The format for string is `<type>[-<width>[-<length>]]`. Possible types: `classic`, `block`, `open`, `oval`, `diamond`, `none`, width: `wide`, `narrow`, `medium`, length: `long`, `short`, `midium`.
     o clip-rect (string) comma or space separated values: x, y, width and height
     o cursor (string) CSS type of the cursor
     o cx (number) the x-axis coordinate of the center of the circle, or ellipse
     o cy (number) the y-axis coordinate of the center of the circle, or ellipse
     o fill (string) colour, gradient or image
     o fill-opacity (number)
     o font (string)
     o font-family (string)
     o font-size (number) font size in pixels
     o font-weight (string)
     o height (number)
     o href (string) URL, if specified element behaves as hyperlink
     o opacity (number)
     o path (string) SVG path string format
     o r (number) radius of the circle, ellipse or rounded corner on the rect
     o rx (number) horisontal radius of the ellipse
     o ry (number) vertical radius of the ellipse
     o src (string) image URL, only works for @Element.image element
     o stroke (string) stroke colour
     o stroke-dasharray (string) [“”, “`-`”, “`.`”, “`-.`”, “`-..`”, “`. `”, “`- `”, “`--`”, “`- .`”, “`--.`”, “`--..`”]
     o stroke-linecap (string) [“`butt`”, “`square`”, “`round`”]
     o stroke-linejoin (string) [“`bevel`”, “`round`”, “`miter`”]
     o stroke-miterlimit (number)
     o stroke-opacity (number)
     o stroke-width (number) stroke width in pixels, default is '1'
     o target (string) used with href
     o text (string) contents of the text element. Use `\n` for multiline text
     o text-anchor (string) [“`start`”, “`middle`”, “`end`”], default is “`middle`”
     o title (string) will create tooltip with a given text
     o transform (string) see @Element.transform
     o width (number)
     o x (number)
     o y (number)
     > Gradients
     * Linear gradient format: “`‹angle›-‹colour›[-‹colour›[:‹offset›]]*-‹colour›`”, example: “`90-#fff-#000`” – 90°
     * gradient from white to black or “`0-#fff-#f00:20-#000`” – 0° gradient from white via red (at 20%) to black.
     *
     * radial gradient: “`r[(‹fx›, ‹fy›)]‹colour›[-‹colour›[:‹offset›]]*-‹colour›`”, example: “`r#fff-#000`” –
     * gradient from white to black or “`r(0.25, 0.75)#fff-#000`” – gradient from white to black with focus point
     * at 0.25, 0.75. Focus point coordinates are in 0..1 range. Radial gradients can only be applied to circles and ellipses.
     > Path String
     # <p>Please refer to <a href="http://www.w3.org/TR/SVG/paths.html#PathData" title="Details of a path’s data attribute’s format are described in the SVG specification.">SVG documentation regarding path string</a>. Raphaël fully supports it.</p>
     > Colour Parsing
     # <ul>
     #     <li>Colour name (“<code>red</code>”, “<code>green</code>”, “<code>cornflowerblue</code>”, etc)</li>
     #     <li>#••• — shortened HTML colour: (“<code>#000</code>”, “<code>#fc0</code>”, etc)</li>
     #     <li>#•••••• — full length HTML colour: (“<code>#000000</code>”, “<code>#bd2300</code>”)</li>
     #     <li>rgb(•••, •••, •••) — red, green and blue channels’ values: (“<code>rgb(200,&nbsp;100,&nbsp;0)</code>”)</li>
     #     <li>rgb(•••%, •••%, •••%) — same as above, but in %: (“<code>rgb(100%,&nbsp;175%,&nbsp;0%)</code>”)</li>
     #     <li>rgba(•••, •••, •••, •••) — red, green and blue channels’ values: (“<code>rgba(200,&nbsp;100,&nbsp;0, .5)</code>”)</li>
     #     <li>rgba(•••%, •••%, •••%, •••%) — same as above, but in %: (“<code>rgba(100%,&nbsp;175%,&nbsp;0%, 50%)</code>”)</li>
     #     <li>hsb(•••, •••, •••) — hue, saturation and brightness values: (“<code>hsb(0.5,&nbsp;0.25,&nbsp;1)</code>”)</li>
     #     <li>hsb(•••%, •••%, •••%) — same as above, but in %</li>
     #     <li>hsba(•••, •••, •••, •••) — same as above, but with opacity</li>
     #     <li>hsl(•••, •••, •••) — almost the same as hsb, see <a href="http://en.wikipedia.org/wiki/HSL_and_HSV" title="HSL and HSV - Wikipedia, the free encyclopedia">Wikipedia page</a></li>
     #     <li>hsl(•••%, •••%, •••%) — same as above, but in %</li>
     #     <li>hsla(•••, •••, •••, •••) — same as above, but with opacity</li>
     #     <li>Optionally for hsb and hsl you could specify hue as a degree: “<code>hsl(240deg,&nbsp;1,&nbsp;.5)</code>” or, if you want to go fancy, “<code>hsl(240°,&nbsp;1,&nbsp;.5)</code>”</li>
     # </ul>
    \*/
    elproto.attr = function (name, value) {
        if (this.removed) {
            return this;
        }
        if (name == null) {
            var res = {};
            for (var a in this.attrs) if (this.attrs[has](a)) {
                res[a] = this.attrs[a];
            }
            res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
            res.transform = this._.transform;
            return res;
        }
        if (value == null && R.is(name, "string")) {
            if (name == "fill" && this.attrs.fill == "none" && this.attrs.gradient) {
                return this.attrs.gradient;
            }
            if (name == "transform") {
                return this._.transform;
            }
            var names = name.split(separator),
                out = {};
            for (var i = 0, ii = names.length; i < ii; i++) {
                name = names[i];
                if (name in this.attrs) {
                    out[name] = this.attrs[name];
                } else if (R.is(this.paper.customAttributes[name], "function")) {
                    out[name] = this.paper.customAttributes[name].def;
                } else {
                    out[name] = R._availableAttrs[name];
                }
            }
            return ii - 1 ? out : out[names[0]];
        }
        if (value == null && R.is(name, "array")) {
            out = {};
            for (i = 0, ii = name.length; i < ii; i++) {
                out[name[i]] = this.attr(name[i]);
            }
            return out;
        }
        if (value != null) {
            var params = {};
            params[name] = value;
        } else if (name != null && R.is(name, "object")) {
            params = name;
        }
        for (var key in params) {
            eve("raphael.attr." + key + "." + this.id, this, params[key]);
        }
        for (key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
            var par = this.paper.customAttributes[key].apply(this, [].concat(params[key]));
            this.attrs[key] = params[key];
            for (var subkey in par) if (par[has](subkey)) {
                params[subkey] = par[subkey];
            }
        }
        setFillAndStroke(this, params);
        return this;
    };
    /*\
     * Element.toFront
     [ method ]
     **
     * Moves the element so it is the closest to the viewer’s eyes, on top of other elements.
     = (object) @Element
    \*/
    elproto.toFront = function () {
        if (this.removed) {
            return this;
        }
        if (this.node.parentNode.tagName.toLowerCase() == "a") {
            this.node.parentNode.parentNode.appendChild(this.node.parentNode);
        } else {
            this.node.parentNode.appendChild(this.node);
        }
        var svg = this.paper;
        svg.top != this && R._tofront(this, svg);
        return this;
    };
    /*\
     * Element.toBack
     [ method ]
     **
     * Moves the element so it is the furthest from the viewer’s eyes, behind other elements.
     = (object) @Element
    \*/
    elproto.toBack = function () {
        if (this.removed) {
            return this;
        }
        var parent = this.node.parentNode;
        if (parent.tagName.toLowerCase() == "a") {
            parent.parentNode.insertBefore(this.node.parentNode, this.node.parentNode.parentNode.firstChild); 
        } else if (parent.firstChild != this.node) {
            parent.insertBefore(this.node, this.node.parentNode.firstChild);
        }
        R._toback(this, this.paper);
        var svg = this.paper;
        return this;
    };
    /*\
     * Element.insertAfter
     [ method ]
     **
     * Inserts current object after the given one.
     = (object) @Element
    \*/
    elproto.insertAfter = function (element) {
        if (this.removed) {
            return this;
        }
        var node = element.node || element[element.length - 1].node;
        if (node.nextSibling) {
            node.parentNode.insertBefore(this.node, node.nextSibling);
        } else {
            node.parentNode.appendChild(this.node);
        }
        R._insertafter(this, element, this.paper);
        return this;
    };
    /*\
     * Element.insertBefore
     [ method ]
     **
     * Inserts current object before the given one.
     = (object) @Element
    \*/
    elproto.insertBefore = function (element) {
        if (this.removed) {
            return this;
        }
        var node = element.node || element[0].node;
        node.parentNode.insertBefore(this.node, node);
        R._insertbefore(this, element, this.paper);
        return this;
    };
    elproto.blur = function (size) {
        // Experimental. No Safari support. Use it on your own risk.
        var t = this;
        if (+size !== 0) {
            var fltr = $("filter"),
                blur = $("feGaussianBlur");
            t.attrs.blur = size;
            fltr.id = R.createUUID();
            $(blur, {stdDeviation: +size || 1.5});
            fltr.appendChild(blur);
            t.paper.defs.appendChild(fltr);
            t._blur = fltr;
            $(t.node, {filter: "url(#" + fltr.id + ")"});
        } else {
            if (t._blur) {
                t._blur.parentNode.removeChild(t._blur);
                delete t._blur;
                delete t.attrs.blur;
            }
            t.node.removeAttribute("filter");
        }
    };
    R._engine.circle = function (svg, x, y, r) {
        var el = $("circle");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {cx: x, cy: y, r: r, fill: "none", stroke: "#000"};
        res.type = "circle";
        $(el, res.attrs);
        return res;
    };
    R._engine.rect = function (svg, x, y, w, h, r) {
        var el = $("rect");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {x: x, y: y, width: w, height: h, r: r || 0, rx: r || 0, ry: r || 0, fill: "none", stroke: "#000"};
        res.type = "rect";
        $(el, res.attrs);
        return res;
    };
    R._engine.ellipse = function (svg, x, y, rx, ry) {
        var el = $("ellipse");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {cx: x, cy: y, rx: rx, ry: ry, fill: "none", stroke: "#000"};
        res.type = "ellipse";
        $(el, res.attrs);
        return res;
    };
    R._engine.image = function (svg, src, x, y, w, h) {
        var el = $("image");
        $(el, {x: x, y: y, width: w, height: h, preserveAspectRatio: "none"});
        el.setAttributeNS(xlink, "href", src);
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {x: x, y: y, width: w, height: h, src: src};
        res.type = "image";
        return res;
    };
    R._engine.text = function (svg, x, y, text) {
        var el = $("text");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {
            x: x,
            y: y,
            "text-anchor": "middle",
            text: text,
            font: R._availableAttrs.font,
            stroke: "none",
            fill: "#000"
        };
        res.type = "text";
        setFillAndStroke(res, res.attrs);
        return res;
    };
    R._engine.setSize = function (width, height) {
        this.width = width || this.width;
        this.height = height || this.height;
        this.canvas.setAttribute("width", this.width);
        this.canvas.setAttribute("height", this.height);
        if (this._viewBox) {
            this.setViewBox.apply(this, this._viewBox);
        }
        return this;
    };
    R._engine.create = function () {
        var con = R._getContainer.apply(0, arguments),
            container = con && con.container,
            x = con.x,
            y = con.y,
            width = con.width,
            height = con.height;
        if (!container) {
            throw new Error("SVG container not found.");
        }
        var cnvs = $("svg"),
            css = "overflow:hidden;",
            isFloating;
        x = x || 0;
        y = y || 0;
        width = width || 512;
        height = height || 342;
        $(cnvs, {
            height: height,
            version: 1.1,
            width: width,
            xmlns: "http://www.w3.org/2000/svg"
        });
        if (container == 1) {
            cnvs.style.cssText = css + "position:absolute;left:" + x + "px;top:" + y + "px";
            R._g.doc.body.appendChild(cnvs);
            isFloating = 1;
        } else {
            cnvs.style.cssText = css + "position:relative";
            if (container.firstChild) {
                container.insertBefore(cnvs, container.firstChild);
            } else {
                container.appendChild(cnvs);
            }
        }
        container = new R._Paper;
        container.width = width;
        container.height = height;
        container.canvas = cnvs;
        container.clear();
        container._left = container._top = 0;
        isFloating && (container.renderfix = function () {});
        container.renderfix();
        return container;
    };
    R._engine.setViewBox = function (x, y, w, h, fit) {
        eve("raphael.setViewBox", this, this._viewBox, [x, y, w, h, fit]);
        var size = mmax(w / this.width, h / this.height),
            top = this.top,
            aspectRatio = fit ? "meet" : "xMinYMin",
            vb,
            sw;
        if (x == null) {
            if (this._vbSize) {
                size = 1;
            }
            delete this._vbSize;
            vb = "0 0 " + this.width + S + this.height;
        } else {
            this._vbSize = size;
            vb = x + S + y + S + w + S + h;
        }
        $(this.canvas, {
            viewBox: vb,
            preserveAspectRatio: aspectRatio
        });
        while (size && top) {
            sw = "stroke-width" in top.attrs ? top.attrs["stroke-width"] : 1;
            top.attr({"stroke-width": sw});
            top._.dirty = 1;
            top._.dirtyT = 1;
            top = top.prev;
        }
        this._viewBox = [x, y, w, h, !!fit];
        return this;
    };
    /*\
     * Paper.renderfix
     [ method ]
     **
     * Fixes the issue of Firefox and IE9 regarding subpixel rendering. If paper is dependant
     * on other elements after reflow it could shift half pixel which cause for lines to lost their crispness.
     * This method fixes the issue.
     **
       Special thanks to Mariusz Nowak (http://www.medikoo.com/) for this method.
    \*/
    R.prototype.renderfix = function () {
        var cnvs = this.canvas,
            s = cnvs.style,
            pos;
        try {
            pos = cnvs.getScreenCTM() || cnvs.createSVGMatrix();
        } catch (e) {
            pos = cnvs.createSVGMatrix();
        }
        var left = -pos.e % 1,
            top = -pos.f % 1;
        if (left || top) {
            if (left) {
                this._left = (this._left + left) % 1;
                s.left = this._left + "px";
            }
            if (top) {
                this._top = (this._top + top) % 1;
                s.top = this._top + "px";
            }
        }
    };
    /*\
     * Paper.clear
     [ method ]
     **
     * Clears the paper, i.e. removes all the elements.
    \*/
    R.prototype.clear = function () {
        R.eve("raphael.clear", this);
        var c = this.canvas;
        while (c.firstChild) {
            c.removeChild(c.firstChild);
        }
        this.bottom = this.top = null;
        (this.desc = $("desc")).appendChild(R._g.doc.createTextNode("Created with Rapha\xebl " + R.version));
        c.appendChild(this.desc);
        c.appendChild(this.defs = $("defs"));
    };
    /*\
     * Paper.remove
     [ method ]
     **
     * Removes the paper from the DOM.
    \*/
    R.prototype.remove = function () {
        eve("raphael.remove", this);
        this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
    };
    var setproto = R.st;
    for (var method in elproto) if (elproto[has](method) && !setproto[has](method)) {
        setproto[method] = (function (methodname) {
            return function () {
                var arg = arguments;
                return this.forEach(function (el) {
                    el[methodname].apply(el, arg);
                });
            };
        })(method);
    }
}(window.Raphael);
},{}],6:[function(require,module,exports){
// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël - JavaScript Vector Library                                 │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ VML Module                                                          │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\
window.Raphael && window.Raphael.vml && function (R) {
    var has = "hasOwnProperty",
        Str = String,
        toFloat = parseFloat,
        math = Math,
        round = math.round,
        mmax = math.max,
        mmin = math.min,
        abs = math.abs,
        fillString = "fill",
        separator = /[, ]+/,
        eve = R.eve,
        ms = " progid:DXImageTransform.Microsoft",
        S = " ",
        E = "",
        map = {M: "m", L: "l", C: "c", Z: "x", m: "t", l: "r", c: "v", z: "x"},
        bites = /([clmz]),?([^clmz]*)/gi,
        blurregexp = / progid:\S+Blur\([^\)]+\)/g,
        val = /-?[^,\s-]+/g,
        cssDot = "position:absolute;left:0;top:0;width:1px;height:1px",
        zoom = 21600,
        pathTypes = {path: 1, rect: 1, image: 1},
        ovalTypes = {circle: 1, ellipse: 1},
        path2vml = function (path) {
            var total =  /[ahqstv]/ig,
                command = R._pathToAbsolute;
            Str(path).match(total) && (command = R._path2curve);
            total = /[clmz]/g;
            if (command == R._pathToAbsolute && !Str(path).match(total)) {
                var res = Str(path).replace(bites, function (all, command, args) {
                    var vals = [],
                        isMove = command.toLowerCase() == "m",
                        res = map[command];
                    args.replace(val, function (value) {
                        if (isMove && vals.length == 2) {
                            res += vals + map[command == "m" ? "l" : "L"];
                            vals = [];
                        }
                        vals.push(round(value * zoom));
                    });
                    return res + vals;
                });
                return res;
            }
            var pa = command(path), p, r;
            res = [];
            for (var i = 0, ii = pa.length; i < ii; i++) {
                p = pa[i];
                r = pa[i][0].toLowerCase();
                r == "z" && (r = "x");
                for (var j = 1, jj = p.length; j < jj; j++) {
                    r += round(p[j] * zoom) + (j != jj - 1 ? "," : E);
                }
                res.push(r);
            }
            return res.join(S);
        },
        compensation = function (deg, dx, dy) {
            var m = R.matrix();
            m.rotate(-deg, .5, .5);
            return {
                dx: m.x(dx, dy),
                dy: m.y(dx, dy)
            };
        },
        setCoords = function (p, sx, sy, dx, dy, deg) {
            var _ = p._,
                m = p.matrix,
                fillpos = _.fillpos,
                o = p.node,
                s = o.style,
                y = 1,
                flip = "",
                dxdy,
                kx = zoom / sx,
                ky = zoom / sy;
            s.visibility = "hidden";
            if (!sx || !sy) {
                return;
            }
            o.coordsize = abs(kx) + S + abs(ky);
            s.rotation = deg * (sx * sy < 0 ? -1 : 1);
            if (deg) {
                var c = compensation(deg, dx, dy);
                dx = c.dx;
                dy = c.dy;
            }
            sx < 0 && (flip += "x");
            sy < 0 && (flip += " y") && (y = -1);
            s.flip = flip;
            o.coordorigin = (dx * -kx) + S + (dy * -ky);
            if (fillpos || _.fillsize) {
                var fill = o.getElementsByTagName(fillString);
                fill = fill && fill[0];
                o.removeChild(fill);
                if (fillpos) {
                    c = compensation(deg, m.x(fillpos[0], fillpos[1]), m.y(fillpos[0], fillpos[1]));
                    fill.position = c.dx * y + S + c.dy * y;
                }
                if (_.fillsize) {
                    fill.size = _.fillsize[0] * abs(sx) + S + _.fillsize[1] * abs(sy);
                }
                o.appendChild(fill);
            }
            s.visibility = "visible";
        };
    R.toString = function () {
        return  "Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\xebl " + this.version;
    };
    var addArrow = function (o, value, isEnd) {
        var values = Str(value).toLowerCase().split("-"),
            se = isEnd ? "end" : "start",
            i = values.length,
            type = "classic",
            w = "medium",
            h = "medium";
        while (i--) {
            switch (values[i]) {
                case "block":
                case "classic":
                case "oval":
                case "diamond":
                case "open":
                case "none":
                    type = values[i];
                    break;
                case "wide":
                case "narrow": h = values[i]; break;
                case "long":
                case "short": w = values[i]; break;
            }
        }
        var stroke = o.node.getElementsByTagName("stroke")[0];
        stroke[se + "arrow"] = type;
        stroke[se + "arrowlength"] = w;
        stroke[se + "arrowwidth"] = h;
    },
    setFillAndStroke = function (o, params) {
        // o.paper.canvas.style.display = "none";
        o.attrs = o.attrs || {};
        var node = o.node,
            a = o.attrs,
            s = node.style,
            xy,
            newpath = pathTypes[o.type] && (params.x != a.x || params.y != a.y || params.width != a.width || params.height != a.height || params.cx != a.cx || params.cy != a.cy || params.rx != a.rx || params.ry != a.ry || params.r != a.r),
            isOval = ovalTypes[o.type] && (a.cx != params.cx || a.cy != params.cy || a.r != params.r || a.rx != params.rx || a.ry != params.ry),
            res = o;


        for (var par in params) if (params[has](par)) {
            a[par] = params[par];
        }
        if (newpath) {
            a.path = R._getPath[o.type](o);
            o._.dirty = 1;
        }
        params.href && (node.href = params.href);
        params.title && (node.title = params.title);
        params.target && (node.target = params.target);
        params.cursor && (s.cursor = params.cursor);
        "blur" in params && o.blur(params.blur);
        if (params.path && o.type == "path" || newpath) {
            node.path = path2vml(~Str(a.path).toLowerCase().indexOf("r") ? R._pathToAbsolute(a.path) : a.path);
            if (o.type == "image") {
                o._.fillpos = [a.x, a.y];
                o._.fillsize = [a.width, a.height];
                setCoords(o, 1, 1, 0, 0, 0);
            }
        }
        "transform" in params && o.transform(params.transform);
        if (isOval) {
            var cx = +a.cx,
                cy = +a.cy,
                rx = +a.rx || +a.r || 0,
                ry = +a.ry || +a.r || 0;
            node.path = R.format("ar{0},{1},{2},{3},{4},{1},{4},{1}x", round((cx - rx) * zoom), round((cy - ry) * zoom), round((cx + rx) * zoom), round((cy + ry) * zoom), round(cx * zoom));
        }
        if ("clip-rect" in params) {
            var rect = Str(params["clip-rect"]).split(separator);
            if (rect.length == 4) {
                rect[2] = +rect[2] + (+rect[0]);
                rect[3] = +rect[3] + (+rect[1]);
                var div = node.clipRect || R._g.doc.createElement("div"),
                    dstyle = div.style;
                dstyle.clip = R.format("rect({1}px {2}px {3}px {0}px)", rect);
                if (!node.clipRect) {
                    dstyle.position = "absolute";
                    dstyle.top = 0;
                    dstyle.left = 0;
                    dstyle.width = o.paper.width + "px";
                    dstyle.height = o.paper.height + "px";
                    node.parentNode.insertBefore(div, node);
                    div.appendChild(node);
                    node.clipRect = div;
                }
            }
            if (!params["clip-rect"]) {
                node.clipRect && (node.clipRect.style.clip = "auto");
            }
        }
        if (o.textpath) {
            var textpathStyle = o.textpath.style;
            params.font && (textpathStyle.font = params.font);
            params["font-family"] && (textpathStyle.fontFamily = '"' + params["font-family"].split(",")[0].replace(/^['"]+|['"]+$/g, E) + '"');
            params["font-size"] && (textpathStyle.fontSize = params["font-size"]);
            params["font-weight"] && (textpathStyle.fontWeight = params["font-weight"]);
            params["font-style"] && (textpathStyle.fontStyle = params["font-style"]);
        }
        if ("arrow-start" in params) {
            addArrow(res, params["arrow-start"]);
        }
        if ("arrow-end" in params) {
            addArrow(res, params["arrow-end"], 1);
        }
        if (params.opacity != null || 
            params["stroke-width"] != null ||
            params.fill != null ||
            params.src != null ||
            params.stroke != null ||
            params["stroke-width"] != null ||
            params["stroke-opacity"] != null ||
            params["fill-opacity"] != null ||
            params["stroke-dasharray"] != null ||
            params["stroke-miterlimit"] != null ||
            params["stroke-linejoin"] != null ||
            params["stroke-linecap"] != null) {
            var fill = node.getElementsByTagName(fillString),
                newfill = false;
            fill = fill && fill[0];
            !fill && (newfill = fill = createNode(fillString));
            if (o.type == "image" && params.src) {
                fill.src = params.src;
            }
            params.fill && (fill.on = true);
            if (fill.on == null || params.fill == "none" || params.fill === null) {
                fill.on = false;
            }
            if (fill.on && params.fill) {
                var isURL = Str(params.fill).match(R._ISURL);
                if (isURL) {
                    fill.parentNode == node && node.removeChild(fill);
                    fill.rotate = true;
                    fill.src = isURL[1];
                    fill.type = "tile";
                    var bbox = o.getBBox(1);
                    fill.position = bbox.x + S + bbox.y;
                    o._.fillpos = [bbox.x, bbox.y];

                    R._preload(isURL[1], function () {
                        o._.fillsize = [this.offsetWidth, this.offsetHeight];
                    });
                } else {
                    fill.color = R.getRGB(params.fill).hex;
                    fill.src = E;
                    fill.type = "solid";
                    if (R.getRGB(params.fill).error && (res.type in {circle: 1, ellipse: 1} || Str(params.fill).charAt() != "r") && addGradientFill(res, params.fill, fill)) {
                        a.fill = "none";
                        a.gradient = params.fill;
                        fill.rotate = false;
                    }
                }
            }
            if ("fill-opacity" in params || "opacity" in params) {
                var opacity = ((+a["fill-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+R.getRGB(params.fill).o + 1 || 2) - 1);
                opacity = mmin(mmax(opacity, 0), 1);
                fill.opacity = opacity;
                if (fill.src) {
                    fill.color = "none";
                }
            }
            node.appendChild(fill);
            var stroke = (node.getElementsByTagName("stroke") && node.getElementsByTagName("stroke")[0]),
            newstroke = false;
            !stroke && (newstroke = stroke = createNode("stroke"));
            if ((params.stroke && params.stroke != "none") ||
                params["stroke-width"] ||
                params["stroke-opacity"] != null ||
                params["stroke-dasharray"] ||
                params["stroke-miterlimit"] ||
                params["stroke-linejoin"] ||
                params["stroke-linecap"]) {
                stroke.on = true;
            }
            (params.stroke == "none" || params.stroke === null || stroke.on == null || params.stroke == 0 || params["stroke-width"] == 0) && (stroke.on = false);
            var strokeColor = R.getRGB(params.stroke);
            stroke.on && params.stroke && (stroke.color = strokeColor.hex);
            opacity = ((+a["stroke-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+strokeColor.o + 1 || 2) - 1);
            var width = (toFloat(params["stroke-width"]) || 1) * .75;
            opacity = mmin(mmax(opacity, 0), 1);
            params["stroke-width"] == null && (width = a["stroke-width"]);
            params["stroke-width"] && (stroke.weight = width);
            width && width < 1 && (opacity *= width) && (stroke.weight = 1);
            stroke.opacity = opacity;
        
            params["stroke-linejoin"] && (stroke.joinstyle = params["stroke-linejoin"] || "miter");
            stroke.miterlimit = params["stroke-miterlimit"] || 8;
            params["stroke-linecap"] && (stroke.endcap = params["stroke-linecap"] == "butt" ? "flat" : params["stroke-linecap"] == "square" ? "square" : "round");
            if (params["stroke-dasharray"]) {
                var dasharray = {
                    "-": "shortdash",
                    ".": "shortdot",
                    "-.": "shortdashdot",
                    "-..": "shortdashdotdot",
                    ". ": "dot",
                    "- ": "dash",
                    "--": "longdash",
                    "- .": "dashdot",
                    "--.": "longdashdot",
                    "--..": "longdashdotdot"
                };
                stroke.dashstyle = dasharray[has](params["stroke-dasharray"]) ? dasharray[params["stroke-dasharray"]] : E;
            }
            newstroke && node.appendChild(stroke);
        }
        if (res.type == "text") {
            res.paper.canvas.style.display = E;
            var span = res.paper.span,
                m = 100,
                fontSize = a.font && a.font.match(/\d+(?:\.\d*)?(?=px)/);
            s = span.style;
            a.font && (s.font = a.font);
            a["font-family"] && (s.fontFamily = a["font-family"]);
            a["font-weight"] && (s.fontWeight = a["font-weight"]);
            a["font-style"] && (s.fontStyle = a["font-style"]);
            fontSize = toFloat(a["font-size"] || fontSize && fontSize[0]) || 10;
            s.fontSize = fontSize * m + "px";
            res.textpath.string && (span.innerHTML = Str(res.textpath.string).replace(/</g, "&#60;").replace(/&/g, "&#38;").replace(/\n/g, "<br>"));
            var brect = span.getBoundingClientRect();
            res.W = a.w = (brect.right - brect.left) / m;
            res.H = a.h = (brect.bottom - brect.top) / m;
            // res.paper.canvas.style.display = "none";
            res.X = a.x;
            res.Y = a.y + res.H / 2;

            ("x" in params || "y" in params) && (res.path.v = R.format("m{0},{1}l{2},{1}", round(a.x * zoom), round(a.y * zoom), round(a.x * zoom) + 1));
            var dirtyattrs = ["x", "y", "text", "font", "font-family", "font-weight", "font-style", "font-size"];
            for (var d = 0, dd = dirtyattrs.length; d < dd; d++) if (dirtyattrs[d] in params) {
                res._.dirty = 1;
                break;
            }
        
            // text-anchor emulation
            switch (a["text-anchor"]) {
                case "start":
                    res.textpath.style["v-text-align"] = "left";
                    res.bbx = res.W / 2;
                break;
                case "end":
                    res.textpath.style["v-text-align"] = "right";
                    res.bbx = -res.W / 2;
                break;
                default:
                    res.textpath.style["v-text-align"] = "center";
                    res.bbx = 0;
                break;
            }
            res.textpath.style["v-text-kern"] = true;
        }
        // res.paper.canvas.style.display = E;
    },
    addGradientFill = function (o, gradient, fill) {
        o.attrs = o.attrs || {};
        var attrs = o.attrs,
            pow = Math.pow,
            opacity,
            oindex,
            type = "linear",
            fxfy = ".5 .5";
        o.attrs.gradient = gradient;
        gradient = Str(gradient).replace(R._radial_gradient, function (all, fx, fy) {
            type = "radial";
            if (fx && fy) {
                fx = toFloat(fx);
                fy = toFloat(fy);
                pow(fx - .5, 2) + pow(fy - .5, 2) > .25 && (fy = math.sqrt(.25 - pow(fx - .5, 2)) * ((fy > .5) * 2 - 1) + .5);
                fxfy = fx + S + fy;
            }
            return E;
        });
        gradient = gradient.split(/\s*\-\s*/);
        if (type == "linear") {
            var angle = gradient.shift();
            angle = -toFloat(angle);
            if (isNaN(angle)) {
                return null;
            }
        }
        var dots = R._parseDots(gradient);
        if (!dots) {
            return null;
        }
        o = o.shape || o.node;
        if (dots.length) {
            o.removeChild(fill);
            fill.on = true;
            fill.method = "none";
            fill.color = dots[0].color;
            fill.color2 = dots[dots.length - 1].color;
            var clrs = [];
            for (var i = 0, ii = dots.length; i < ii; i++) {
                dots[i].offset && clrs.push(dots[i].offset + S + dots[i].color);
            }
            fill.colors = clrs.length ? clrs.join() : "0% " + fill.color;
            if (type == "radial") {
                fill.type = "gradientTitle";
                fill.focus = "100%";
                fill.focussize = "0 0";
                fill.focusposition = fxfy;
                fill.angle = 0;
            } else {
                // fill.rotate= true;
                fill.type = "gradient";
                fill.angle = (270 - angle) % 360;
            }
            o.appendChild(fill);
        }
        return 1;
    },
    Element = function (node, vml) {
        this[0] = this.node = node;
        node.raphael = true;
        this.id = R._oid++;
        node.raphaelid = this.id;
        this.X = 0;
        this.Y = 0;
        this.attrs = {};
        this.paper = vml;
        this.matrix = R.matrix();
        this._ = {
            transform: [],
            sx: 1,
            sy: 1,
            dx: 0,
            dy: 0,
            deg: 0,
            dirty: 1,
            dirtyT: 1
        };
        !vml.bottom && (vml.bottom = this);
        this.prev = vml.top;
        vml.top && (vml.top.next = this);
        vml.top = this;
        this.next = null;
    };
    var elproto = R.el;

    Element.prototype = elproto;
    elproto.constructor = Element;
    elproto.transform = function (tstr) {
        if (tstr == null) {
            return this._.transform;
        }
        var vbs = this.paper._viewBoxShift,
            vbt = vbs ? "s" + [vbs.scale, vbs.scale] + "-1-1t" + [vbs.dx, vbs.dy] : E,
            oldt;
        if (vbs) {
            oldt = tstr = Str(tstr).replace(/\.{3}|\u2026/g, this._.transform || E);
        }
        R._extractTransform(this, vbt + tstr);
        var matrix = this.matrix.clone(),
            skew = this.skew,
            o = this.node,
            split,
            isGrad = ~Str(this.attrs.fill).indexOf("-"),
            isPatt = !Str(this.attrs.fill).indexOf("url(");
        matrix.translate(-.5, -.5);
        if (isPatt || isGrad || this.type == "image") {
            skew.matrix = "1 0 0 1";
            skew.offset = "0 0";
            split = matrix.split();
            if ((isGrad && split.noRotation) || !split.isSimple) {
                o.style.filter = matrix.toFilter();
                var bb = this.getBBox(),
                    bbt = this.getBBox(1),
                    dx = bb.x - bbt.x,
                    dy = bb.y - bbt.y;
                o.coordorigin = (dx * -zoom) + S + (dy * -zoom);
                setCoords(this, 1, 1, dx, dy, 0);
            } else {
                o.style.filter = E;
                setCoords(this, split.scalex, split.scaley, split.dx, split.dy, split.rotate);
            }
        } else {
            o.style.filter = E;
            skew.matrix = Str(matrix);
            skew.offset = matrix.offset();
        }
        oldt && (this._.transform = oldt);
        return this;
    };
    elproto.rotate = function (deg, cx, cy) {
        if (this.removed) {
            return this;
        }
        if (deg == null) {
            return;
        }
        deg = Str(deg).split(separator);
        if (deg.length - 1) {
            cx = toFloat(deg[1]);
            cy = toFloat(deg[2]);
        }
        deg = toFloat(deg[0]);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
            cx = bbox.x + bbox.width / 2;
            cy = bbox.y + bbox.height / 2;
        }
        this._.dirtyT = 1;
        this.transform(this._.transform.concat([["r", deg, cx, cy]]));
        return this;
    };
    elproto.translate = function (dx, dy) {
        if (this.removed) {
            return this;
        }
        dx = Str(dx).split(separator);
        if (dx.length - 1) {
            dy = toFloat(dx[1]);
        }
        dx = toFloat(dx[0]) || 0;
        dy = +dy || 0;
        if (this._.bbox) {
            this._.bbox.x += dx;
            this._.bbox.y += dy;
        }
        this.transform(this._.transform.concat([["t", dx, dy]]));
        return this;
    };
    elproto.scale = function (sx, sy, cx, cy) {
        if (this.removed) {
            return this;
        }
        sx = Str(sx).split(separator);
        if (sx.length - 1) {
            sy = toFloat(sx[1]);
            cx = toFloat(sx[2]);
            cy = toFloat(sx[3]);
            isNaN(cx) && (cx = null);
            isNaN(cy) && (cy = null);
        }
        sx = toFloat(sx[0]);
        (sy == null) && (sy = sx);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
        }
        cx = cx == null ? bbox.x + bbox.width / 2 : cx;
        cy = cy == null ? bbox.y + bbox.height / 2 : cy;
    
        this.transform(this._.transform.concat([["s", sx, sy, cx, cy]]));
        this._.dirtyT = 1;
        return this;
    };
    elproto.hide = function () {
        !this.removed && (this.node.style.display = "none");
        return this;
    };
    elproto.show = function () {
        !this.removed && (this.node.style.display = E);
        return this;
    };
    elproto._getBBox = function () {
        if (this.removed) {
            return {};
        }
        return {
            x: this.X + (this.bbx || 0) - this.W / 2,
            y: this.Y - this.H,
            width: this.W,
            height: this.H
        };
    };
    elproto.remove = function () {
        if (this.removed || !this.node.parentNode) {
            return;
        }
        this.paper.__set__ && this.paper.__set__.exclude(this);
        R.eve.unbind("raphael.*.*." + this.id);
        R._tear(this, this.paper);
        this.node.parentNode.removeChild(this.node);
        this.shape && this.shape.parentNode.removeChild(this.shape);
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
        this.removed = true;
    };
    elproto.attr = function (name, value) {
        if (this.removed) {
            return this;
        }
        if (name == null) {
            var res = {};
            for (var a in this.attrs) if (this.attrs[has](a)) {
                res[a] = this.attrs[a];
            }
            res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
            res.transform = this._.transform;
            return res;
        }
        if (value == null && R.is(name, "string")) {
            if (name == fillString && this.attrs.fill == "none" && this.attrs.gradient) {
                return this.attrs.gradient;
            }
            var names = name.split(separator),
                out = {};
            for (var i = 0, ii = names.length; i < ii; i++) {
                name = names[i];
                if (name in this.attrs) {
                    out[name] = this.attrs[name];
                } else if (R.is(this.paper.customAttributes[name], "function")) {
                    out[name] = this.paper.customAttributes[name].def;
                } else {
                    out[name] = R._availableAttrs[name];
                }
            }
            return ii - 1 ? out : out[names[0]];
        }
        if (this.attrs && value == null && R.is(name, "array")) {
            out = {};
            for (i = 0, ii = name.length; i < ii; i++) {
                out[name[i]] = this.attr(name[i]);
            }
            return out;
        }
        var params;
        if (value != null) {
            params = {};
            params[name] = value;
        }
        value == null && R.is(name, "object") && (params = name);
        for (var key in params) {
            eve("raphael.attr." + key + "." + this.id, this, params[key]);
        }
        if (params) {
            for (key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
                var par = this.paper.customAttributes[key].apply(this, [].concat(params[key]));
                this.attrs[key] = params[key];
                for (var subkey in par) if (par[has](subkey)) {
                    params[subkey] = par[subkey];
                }
            }
            // this.paper.canvas.style.display = "none";
            if (params.text && this.type == "text") {
                this.textpath.string = params.text;
            }
            setFillAndStroke(this, params);
            // this.paper.canvas.style.display = E;
        }
        return this;
    };
    elproto.toFront = function () {
        !this.removed && this.node.parentNode.appendChild(this.node);
        this.paper && this.paper.top != this && R._tofront(this, this.paper);
        return this;
    };
    elproto.toBack = function () {
        if (this.removed) {
            return this;
        }
        if (this.node.parentNode.firstChild != this.node) {
            this.node.parentNode.insertBefore(this.node, this.node.parentNode.firstChild);
            R._toback(this, this.paper);
        }
        return this;
    };
    elproto.insertAfter = function (element) {
        if (this.removed) {
            return this;
        }
        if (element.constructor == R.st.constructor) {
            element = element[element.length - 1];
        }
        if (element.node.nextSibling) {
            element.node.parentNode.insertBefore(this.node, element.node.nextSibling);
        } else {
            element.node.parentNode.appendChild(this.node);
        }
        R._insertafter(this, element, this.paper);
        return this;
    };
    elproto.insertBefore = function (element) {
        if (this.removed) {
            return this;
        }
        if (element.constructor == R.st.constructor) {
            element = element[0];
        }
        element.node.parentNode.insertBefore(this.node, element.node);
        R._insertbefore(this, element, this.paper);
        return this;
    };
    elproto.blur = function (size) {
        var s = this.node.runtimeStyle,
            f = s.filter;
        f = f.replace(blurregexp, E);
        if (+size !== 0) {
            this.attrs.blur = size;
            s.filter = f + S + ms + ".Blur(pixelradius=" + (+size || 1.5) + ")";
            s.margin = R.format("-{0}px 0 0 -{0}px", round(+size || 1.5));
        } else {
            s.filter = f;
            s.margin = 0;
            delete this.attrs.blur;
        }
    };

    R._engine.path = function (pathString, vml) {
        var el = createNode("shape");
        el.style.cssText = cssDot;
        el.coordsize = zoom + S + zoom;
        el.coordorigin = vml.coordorigin;
        var p = new Element(el, vml),
            attr = {fill: "none", stroke: "#000"};
        pathString && (attr.path = pathString);
        p.type = "path";
        p.path = [];
        p.Path = E;
        setFillAndStroke(p, attr);
        vml.canvas.appendChild(el);
        var skew = createNode("skew");
        skew.on = true;
        el.appendChild(skew);
        p.skew = skew;
        p.transform(E);
        return p;
    };
    R._engine.rect = function (vml, x, y, w, h, r) {
        var path = R._rectPath(x, y, w, h, r),
            res = vml.path(path),
            a = res.attrs;
        res.X = a.x = x;
        res.Y = a.y = y;
        res.W = a.width = w;
        res.H = a.height = h;
        a.r = r;
        a.path = path;
        res.type = "rect";
        return res;
    };
    R._engine.ellipse = function (vml, x, y, rx, ry) {
        var res = vml.path(),
            a = res.attrs;
        res.X = x - rx;
        res.Y = y - ry;
        res.W = rx * 2;
        res.H = ry * 2;
        res.type = "ellipse";
        setFillAndStroke(res, {
            cx: x,
            cy: y,
            rx: rx,
            ry: ry
        });
        return res;
    };
    R._engine.circle = function (vml, x, y, r) {
        var res = vml.path(),
            a = res.attrs;
        res.X = x - r;
        res.Y = y - r;
        res.W = res.H = r * 2;
        res.type = "circle";
        setFillAndStroke(res, {
            cx: x,
            cy: y,
            r: r
        });
        return res;
    };
    R._engine.image = function (vml, src, x, y, w, h) {
        var path = R._rectPath(x, y, w, h),
            res = vml.path(path).attr({stroke: "none"}),
            a = res.attrs,
            node = res.node,
            fill = node.getElementsByTagName(fillString)[0];
        a.src = src;
        res.X = a.x = x;
        res.Y = a.y = y;
        res.W = a.width = w;
        res.H = a.height = h;
        a.path = path;
        res.type = "image";
        fill.parentNode == node && node.removeChild(fill);
        fill.rotate = true;
        fill.src = src;
        fill.type = "tile";
        res._.fillpos = [x, y];
        res._.fillsize = [w, h];
        node.appendChild(fill);
        setCoords(res, 1, 1, 0, 0, 0);
        return res;
    };
    R._engine.text = function (vml, x, y, text) {
        var el = createNode("shape"),
            path = createNode("path"),
            o = createNode("textpath");
        x = x || 0;
        y = y || 0;
        text = text || "";
        path.v = R.format("m{0},{1}l{2},{1}", round(x * zoom), round(y * zoom), round(x * zoom) + 1);
        path.textpathok = true;
        o.string = Str(text);
        o.on = true;
        el.style.cssText = cssDot;
        el.coordsize = zoom + S + zoom;
        el.coordorigin = "0 0";
        var p = new Element(el, vml),
            attr = {
                fill: "#000",
                stroke: "none",
                font: R._availableAttrs.font,
                text: text
            };
        p.shape = el;
        p.path = path;
        p.textpath = o;
        p.type = "text";
        p.attrs.text = Str(text);
        p.attrs.x = x;
        p.attrs.y = y;
        p.attrs.w = 1;
        p.attrs.h = 1;
        setFillAndStroke(p, attr);
        el.appendChild(o);
        el.appendChild(path);
        vml.canvas.appendChild(el);
        var skew = createNode("skew");
        skew.on = true;
        el.appendChild(skew);
        p.skew = skew;
        p.transform(E);
        return p;
    };
    R._engine.setSize = function (width, height) {
        var cs = this.canvas.style;
        this.width = width;
        this.height = height;
        width == +width && (width += "px");
        height == +height && (height += "px");
        cs.width = width;
        cs.height = height;
        cs.clip = "rect(0 " + width + " " + height + " 0)";
        if (this._viewBox) {
            R._engine.setViewBox.apply(this, this._viewBox);
        }
        return this;
    };
    R._engine.setViewBox = function (x, y, w, h, fit) {
        R.eve("raphael.setViewBox", this, this._viewBox, [x, y, w, h, fit]);
        var width = this.width,
            height = this.height,
            size = 1 / mmax(w / width, h / height),
            H, W;
        if (fit) {
            H = height / h;
            W = width / w;
            if (w * H < width) {
                x -= (width - w * H) / 2 / H;
            }
            if (h * W < height) {
                y -= (height - h * W) / 2 / W;
            }
        }
        this._viewBox = [x, y, w, h, !!fit];
        this._viewBoxShift = {
            dx: -x,
            dy: -y,
            scale: size
        };
        this.forEach(function (el) {
            el.transform("...");
        });
        return this;
    };
    var createNode;
    R._engine.initWin = function (win) {
            var doc = win.document;
            doc.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
            try {
                !doc.namespaces.rvml && doc.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
                createNode = function (tagName) {
                    return doc.createElement('<rvml:' + tagName + ' class="rvml">');
                };
            } catch (e) {
                createNode = function (tagName) {
                    return doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
                };
            }
        };
    R._engine.initWin(R._g.win);
    R._engine.create = function () {
        var con = R._getContainer.apply(0, arguments),
            container = con.container,
            height = con.height,
            s,
            width = con.width,
            x = con.x,
            y = con.y;
        if (!container) {
            throw new Error("VML container not found.");
        }
        var res = new R._Paper,
            c = res.canvas = R._g.doc.createElement("div"),
            cs = c.style;
        x = x || 0;
        y = y || 0;
        width = width || 512;
        height = height || 342;
        res.width = width;
        res.height = height;
        width == +width && (width += "px");
        height == +height && (height += "px");
        res.coordsize = zoom * 1e3 + S + zoom * 1e3;
        res.coordorigin = "0 0";
        res.span = R._g.doc.createElement("span");
        res.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;";
        c.appendChild(res.span);
        cs.cssText = R.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden", width, height);
        if (container == 1) {
            R._g.doc.body.appendChild(c);
            cs.left = x + "px";
            cs.top = y + "px";
            cs.position = "absolute";
        } else {
            if (container.firstChild) {
                container.insertBefore(c, container.firstChild);
            } else {
                container.appendChild(c);
            }
        }
        res.renderfix = function () {};
        return res;
    };
    R.prototype.clear = function () {
        R.eve("raphael.clear", this);
        this.canvas.innerHTML = E;
        this.span = R._g.doc.createElement("span");
        this.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
        this.canvas.appendChild(this.span);
        this.bottom = this.top = null;
    };
    R.prototype.remove = function () {
        R.eve("raphael.remove", this);
        this.canvas.parentNode.removeChild(this.canvas);
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
        return true;
    };

    var setproto = R.st;
    for (var method in elproto) if (elproto[has](method) && !setproto[has](method)) {
        setproto[method] = (function (methodname) {
            return function () {
                var arg = arguments;
                return this.forEach(function (el) {
                    el[methodname].apply(el, arg);
                });
            };
        })(method);
    }
}(window.Raphael);
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAuanMiLCJhdG9tRGF0YS5qc29uIiwibm9kZV9tb2R1bGVzL3JhcGhhZWwvbm9kZV9tb2R1bGVzL2V2ZS9ldmUuanMiLCJub2RlX21vZHVsZXMvcmFwaGFlbC9yYXBoYWVsLmNvcmUuanMiLCJub2RlX21vZHVsZXMvcmFwaGFlbC9yYXBoYWVsLnN2Zy5qcyIsIm5vZGVfbW9kdWxlcy9yYXBoYWVsL3JhcGhhZWwudm1sLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25YQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdm9LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvMENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBSYXBoYWVsID0gcmVxdWlyZSgncmFwaGFlbCcpO1xuXG52YXIgYXRvbURhdGEgPSByZXF1aXJlKCcuL2F0b21EYXRhLmpzb24nKTtcblxuZnVuY3Rpb24gZ2VuZXJhdGVBdG9tKGF0b21pY051bWJlciwgY3gsIGN5LCBvcHRpb25zKSB7XG4gIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIGF0b20gPSB7XG4gICAgYXRvbWljTnVtYmVyOiBhdG9taWNOdW1iZXIsXG4gICAgY3g6IGN4LFxuICAgIGN5OiBjeSxcbiAgICByOiBvcHRpb25zLnIgfHwgMTAwLFxuICAgIHNoZWxsczoge31cbiAgfTtcblxuICB2YXIgdGV4dCA9ICdBdG9taWMgTnVtYmVyOiAnICsgYXRvbS5hdG9taWNOdW1iZXI7XG4gIHRleHQgKz0gJ1xcbk5hbWU6ICcgKyBhdG9tRGF0YVthdG9tLmF0b21pY051bWJlcl07XG4gIHZhciBhdG9tTGFiZWwgPSBwYXBlci50ZXh0KGF0b20uY3gsIGF0b20uY3ksIHRleHQpLFxuICAgICAgYXRvbUxhYmVsQXR0cnMgPSB7J2ZvbnQtc2l6ZSc6ICcxNSd9O1xuXG4gIGF0b21MYWJlbC5hdHRyKGF0b21MYWJlbEF0dHJzKTtcbiAgZHJhd0VsZWN0cm9uU2hlbGxzKGF0b20pO1xuICBkcmF3RWxlY3Ryb25zKGF0b20pO1xuXG4gIHJldHVybiBhdG9tO1xufVxuXG5mdW5jdGlvbiBudW1iZXJPZlNoZWxscyhudW1iZXJPZkVsZWN0cm9ucykge1xuICBpZiAobnVtYmVyT2ZFbGVjdHJvbnMgPD0gMikge1xuICAgIHJldHVybiAxO1xuICB9XG4gIGVsc2UgaWYgKG51bWJlck9mRWxlY3Ryb25zID4gMiAmJiBudW1iZXJPZkVsZWN0cm9ucyA8PSA4KSB7XG4gICAgcmV0dXJuIDI7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIDM7XG4gIH1cbn1cbnZhciB3aGljaFNoZWxsID0gbnVtYmVyT2ZTaGVsbHM7XG5cbmZ1bmN0aW9uIGRyYXdFbGVjdHJvblNoZWxscyhhdG9tKXtcbiAgdmFyIHNoZWxsQ291bnQgPSBudW1iZXJPZlNoZWxscyhhdG9tLmF0b21pY051bWJlcik7XG5cbiAgZm9yICh2YXIgaT0xOyBpIDw9IHNoZWxsQ291bnQ7IGkrKykge1xuICAgIHZhciBzaGVsbEF0dHJzID0ge1xuICAgICAgJ2N4JzogYXRvbS5jeCxcbiAgICAgICdjeSc6IGF0b20uY3ksXG4gICAgICAnc3Ryb2tlJzogJ2JsYWNrJyxcbiAgICAgICdzdHJva2Utd2lkdGgnOiAnMycsXG4gICAgICAnc3Ryb2tlLWRhc2hhcnJheSc6ICc1LCA1JyxcbiAgICAgICdyJzogYXRvbS5yICogaVxuICAgIH0sIGVsZWN0cm9uQ291bnQ7XG5cbiAgICBpZiAoaSA9PSAxICYmIGF0b20uYXRvbWljTnVtYmVyID09IDEpIHtcbiAgICAgIGVsZWN0cm9uQ291bnQgPSAxO1xuICAgIH1cbiAgICBlbHNlIGlmIChpID09IDEgJiYgYXRvbS5hdG9taWNOdW1iZXIgPj0gMikge1xuICAgICAgZWxlY3Ryb25Db3VudCA9IDI7XG4gICAgfVxuICAgIGVsc2UgaWYgKGkgPT0gMiAmJiBhdG9tLmF0b21pY051bWJlciA8IDgpIHtcbiAgICAgIGVsZWN0cm9uQ291bnQgPSBhdG9tLmF0b21pY051bWJlciAtIDI7XG4gICAgfVxuICAgIGVsc2UgaWYgKGkgPT0gMiAmJiBhdG9tLmF0b21pY051bWJlciA+PSA4KSB7XG4gICAgICBlbGVjdHJvbkNvdW50ID0gNjtcbiAgICB9XG4gICAgZWxzZSBpZiAoaSA9PSAzICYmIGF0b20uYXRvbWljTnVtYmVyIDwgMTYpIHtcbiAgICAgIGVsZWN0cm9uQ291bnQgPSBhdG9tLmF0b21pY051bWJlciAtIDg7XG4gICAgfVxuICAgIHZhciBzaGVsbCA9IHBhcGVyLmNpcmNsZSgpLmF0dHIoc2hlbGxBdHRycyk7XG4gICAgYXRvbS5zaGVsbHNbaV0gPSB7c2hlbGw6IHNoZWxsLCBlbGVjdHJvbnM6IHBhcGVyLnNldCgpLCBlbGVjdHJvbkNvdW50OiBlbGVjdHJvbkNvdW50fTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUVsZWN0cm9uKGF0b20sIG9wdGlvbnMpIHtcbiAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgZWxlY3Ryb24gPSBwYXBlci5jaXJjbGUoKTtcbiAgdmFyIGVsZWN0cm9uQXR0cnMgPSB7XG4gICAgJ3InOiBhdG9tLnIgLyAxMCxcbiAgICAnZmlsbCc6IG9wdGlvbnMuZmlsbCB8fCAnYmxhY2snXG4gIH07XG4gIGVsZWN0cm9uLmF0dHIoZWxlY3Ryb25BdHRycyk7XG5cbiAgcmV0dXJuIGVsZWN0cm9uO1xufVxuXG5mdW5jdGlvbiBkcmF3RWxlY3Ryb25zKGF0b20pIHtcbiAgT2JqZWN0LmtleXMoYXRvbS5zaGVsbHMpLmZvckVhY2goZnVuY3Rpb24oc2hlbGxOdW1iZXIpe1xuICAgIHZhciBzaGVsbCA9IGF0b20uc2hlbGxzW3NoZWxsTnVtYmVyXTtcbiAgICB2YXIgc2hlbGxSYWRpdXMgPSBhdG9tLnIgKiBzaGVsbE51bWJlcixcbiAgICAgICAgb2Zmc2V0ID0gMzYwL3NoZWxsLmVsZWN0cm9uQ291bnQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaGVsbC5lbGVjdHJvbkNvdW50OyBpKyspIHtcbiAgICAgIHZhciBlbGVjdHJvbiA9IGdlbmVyYXRlRWxlY3Ryb24oYXRvbSwge2ZpbGw6ICd5ZWxsb3cnfSk7XG4gICAgICBlbGVjdHJvbi5hdHRyKCdjeCcsIGF0b20uY3ggKyBzaGVsbFJhZGl1cyk7XG4gICAgICBlbGVjdHJvbi5hdHRyKCdjeScsIGF0b20uY3kpO1xuXG4gICAgICB2YXIgYW5pbWF0aW9uU3RyaW5nID0gJ3InICsgKG9mZnNldCAqIGkpICsgXCIsXCIgKyBhdG9tLmN4ICsgXCIsXCIgKyBhdG9tLmN5O1xuICAgICAgZWxlY3Ryb24udHJhbnNmb3JtKGFuaW1hdGlvblN0cmluZyk7XG5cbiAgICAgIHNoZWxsLmVsZWN0cm9ucy5wdXNoKGVsZWN0cm9uKTtcbiAgICB9XG5cbiAgICB2YXIgYW5pbWF0aW9uU3RyaW5nID0gXCIuLi5SMzYwXCIgKyBcIixcIiArIGF0b20uY3ggKyBcIixcIiArIGF0b20uY3k7XG4gICAgZWxlY3Ryb25TcGluQW5pbWF0aW9uID0gUmFwaGFlbC5hbmltYXRpb24oe3RyYW5zZm9ybTogYW5pbWF0aW9uU3RyaW5nfSwgNjAwMCkucmVwZWF0KEluZmluaXR5KTtcbiAgICBzaGVsbC5lbGVjdHJvbnMuYW5pbWF0ZShlbGVjdHJvblNwaW5BbmltYXRpb24pXG4gIH0pO1xufTtcblxudmFyIHBhcGVyID0gUmFwaGFlbCg1MCwgNTAsIHdpbmRvdy5pbm5lcldpZHRoLTEwMCwgd2luZG93LmlubmVySGVpZ2h0LTEwMCk7XG5cbnZhciBhdG9tID0gZ2VuZXJhdGVBdG9tKDksIHBhcGVyLndpZHRoLzIsIHBhcGVyLmhlaWdodC8yLCB7cjogOTB9KTtcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgMTogJ0h5ZHJvZ2VuJyxcbiAgMjogJ0hlbGl1bScsXG4gIDM6ICdMaXRoaXVtJyxcbiAgNDogJ0JlcnlsbGl1bScsXG4gIDU6ICdCb3JvbicsXG4gIDY6ICdDYXJib24nLFxuICA3OiAnTml0cm9nZW4nLFxuICA4OiAnT3h5Z2VuJyxcbiAgOTogJ0Zsb3VyaW5lJyxcbiAgMTA6ICdOZW9uJ1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDEzIEFkb2JlIFN5c3RlbXMgSW5jb3Jwb3JhdGVkLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vLyBcbi8vIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy8gXG4vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQIFxcXFxcbi8vIOKUgiBFdmUgMC40LjIgLSBKYXZhU2NyaXB0IEV2ZW50cyBMaWJyYXJ5ICAgICAgICAgICAgICAgICAgICAgIOKUgiBcXFxcXG4vLyDilJzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilKQgXFxcXFxuLy8g4pSCIEF1dGhvciBEbWl0cnkgQmFyYW5vdnNraXkgKGh0dHA6Ly9kbWl0cnkuYmFyYW5vdnNraXkuY29tLykg4pSCIFxcXFxcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmCBcXFxcXG5cbihmdW5jdGlvbiAoZ2xvYikge1xuICAgIHZhciB2ZXJzaW9uID0gXCIwLjQuMlwiLFxuICAgICAgICBoYXMgPSBcImhhc093blByb3BlcnR5XCIsXG4gICAgICAgIHNlcGFyYXRvciA9IC9bXFwuXFwvXS8sXG4gICAgICAgIHdpbGRjYXJkID0gXCIqXCIsXG4gICAgICAgIGZ1biA9IGZ1bmN0aW9uICgpIHt9LFxuICAgICAgICBudW1zb3J0ID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhIC0gYjtcbiAgICAgICAgfSxcbiAgICAgICAgY3VycmVudF9ldmVudCxcbiAgICAgICAgc3RvcCxcbiAgICAgICAgZXZlbnRzID0ge246IHt9fSxcbiAgICAvKlxcXG4gICAgICogZXZlXG4gICAgIFsgbWV0aG9kIF1cblxuICAgICAqIEZpcmVzIGV2ZW50IHdpdGggZ2l2ZW4gYG5hbWVgLCBnaXZlbiBzY29wZSBhbmQgb3RoZXIgcGFyYW1ldGVycy5cblxuICAgICA+IEFyZ3VtZW50c1xuXG4gICAgIC0gbmFtZSAoc3RyaW5nKSBuYW1lIG9mIHRoZSAqZXZlbnQqLCBkb3QgKGAuYCkgb3Igc2xhc2ggKGAvYCkgc2VwYXJhdGVkXG4gICAgIC0gc2NvcGUgKG9iamVjdCkgY29udGV4dCBmb3IgdGhlIGV2ZW50IGhhbmRsZXJzXG4gICAgIC0gdmFyYXJncyAoLi4uKSB0aGUgcmVzdCBvZiBhcmd1bWVudHMgd2lsbCBiZSBzZW50IHRvIGV2ZW50IGhhbmRsZXJzXG5cbiAgICAgPSAob2JqZWN0KSBhcnJheSBvZiByZXR1cm5lZCB2YWx1ZXMgZnJvbSB0aGUgbGlzdGVuZXJzXG4gICAgXFwqL1xuICAgICAgICBldmUgPSBmdW5jdGlvbiAobmFtZSwgc2NvcGUpIHtcblx0XHRcdG5hbWUgPSBTdHJpbmcobmFtZSk7XG4gICAgICAgICAgICB2YXIgZSA9IGV2ZW50cyxcbiAgICAgICAgICAgICAgICBvbGRzdG9wID0gc3RvcCxcbiAgICAgICAgICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSxcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBldmUubGlzdGVuZXJzKG5hbWUpLFxuICAgICAgICAgICAgICAgIHogPSAwLFxuICAgICAgICAgICAgICAgIGYgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBsLFxuICAgICAgICAgICAgICAgIGluZGV4ZWQgPSBbXSxcbiAgICAgICAgICAgICAgICBxdWV1ZSA9IHt9LFxuICAgICAgICAgICAgICAgIG91dCA9IFtdLFxuICAgICAgICAgICAgICAgIGNlID0gY3VycmVudF9ldmVudCxcbiAgICAgICAgICAgICAgICBlcnJvcnMgPSBbXTtcbiAgICAgICAgICAgIGN1cnJlbnRfZXZlbnQgPSBuYW1lO1xuICAgICAgICAgICAgc3RvcCA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgaWk7IGkrKykgaWYgKFwiekluZGV4XCIgaW4gbGlzdGVuZXJzW2ldKSB7XG4gICAgICAgICAgICAgICAgaW5kZXhlZC5wdXNoKGxpc3RlbmVyc1tpXS56SW5kZXgpO1xuICAgICAgICAgICAgICAgIGlmIChsaXN0ZW5lcnNbaV0uekluZGV4IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBxdWV1ZVtsaXN0ZW5lcnNbaV0uekluZGV4XSA9IGxpc3RlbmVyc1tpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmRleGVkLnNvcnQobnVtc29ydCk7XG4gICAgICAgICAgICB3aGlsZSAoaW5kZXhlZFt6XSA8IDApIHtcbiAgICAgICAgICAgICAgICBsID0gcXVldWVbaW5kZXhlZFt6KytdXTtcbiAgICAgICAgICAgICAgICBvdXQucHVzaChsLmFwcGx5KHNjb3BlLCBhcmdzKSk7XG4gICAgICAgICAgICAgICAgaWYgKHN0b3ApIHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcCA9IG9sZHN0b3A7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsID0gbGlzdGVuZXJzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChcInpJbmRleFwiIGluIGwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGwuekluZGV4ID09IGluZGV4ZWRbel0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dC5wdXNoKGwuYXBwbHkoc2NvcGUsIGFyZ3MpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdG9wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeisrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGwgPSBxdWV1ZVtpbmRleGVkW3pdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsICYmIG91dC5wdXNoKGwuYXBwbHkoc2NvcGUsIGFyZ3MpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RvcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IHdoaWxlIChsKVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVbbC56SW5kZXhdID0gbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG91dC5wdXNoKGwuYXBwbHkoc2NvcGUsIGFyZ3MpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0b3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RvcCA9IG9sZHN0b3A7XG4gICAgICAgICAgICBjdXJyZW50X2V2ZW50ID0gY2U7XG4gICAgICAgICAgICByZXR1cm4gb3V0Lmxlbmd0aCA/IG91dCA6IG51bGw7XG4gICAgICAgIH07XG5cdFx0Ly8gVW5kb2N1bWVudGVkLiBEZWJ1ZyBvbmx5LlxuXHRcdGV2ZS5fZXZlbnRzID0gZXZlbnRzO1xuICAgIC8qXFxcbiAgICAgKiBldmUubGlzdGVuZXJzXG4gICAgIFsgbWV0aG9kIF1cblxuICAgICAqIEludGVybmFsIG1ldGhvZCB3aGljaCBnaXZlcyB5b3UgYXJyYXkgb2YgYWxsIGV2ZW50IGhhbmRsZXJzIHRoYXQgd2lsbCBiZSB0cmlnZ2VyZWQgYnkgdGhlIGdpdmVuIGBuYW1lYC5cblxuICAgICA+IEFyZ3VtZW50c1xuXG4gICAgIC0gbmFtZSAoc3RyaW5nKSBuYW1lIG9mIHRoZSBldmVudCwgZG90IChgLmApIG9yIHNsYXNoIChgL2ApIHNlcGFyYXRlZFxuXG4gICAgID0gKGFycmF5KSBhcnJheSBvZiBldmVudCBoYW5kbGVyc1xuICAgIFxcKi9cbiAgICBldmUubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgdmFyIG5hbWVzID0gbmFtZS5zcGxpdChzZXBhcmF0b3IpLFxuICAgICAgICAgICAgZSA9IGV2ZW50cyxcbiAgICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgICBpdGVtcyxcbiAgICAgICAgICAgIGssXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgaWksXG4gICAgICAgICAgICBqLFxuICAgICAgICAgICAgamosXG4gICAgICAgICAgICBuZXMsXG4gICAgICAgICAgICBlcyA9IFtlXSxcbiAgICAgICAgICAgIG91dCA9IFtdO1xuICAgICAgICBmb3IgKGkgPSAwLCBpaSA9IG5hbWVzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgIG5lcyA9IFtdO1xuICAgICAgICAgICAgZm9yIChqID0gMCwgamogPSBlcy5sZW5ndGg7IGogPCBqajsgaisrKSB7XG4gICAgICAgICAgICAgICAgZSA9IGVzW2pdLm47XG4gICAgICAgICAgICAgICAgaXRlbXMgPSBbZVtuYW1lc1tpXV0sIGVbd2lsZGNhcmRdXTtcbiAgICAgICAgICAgICAgICBrID0gMjtcbiAgICAgICAgICAgICAgICB3aGlsZSAoay0tKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0gPSBpdGVtc1trXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5lcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ID0gb3V0LmNvbmNhdChpdGVtLmYgfHwgW10pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXMgPSBuZXM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xuICAgIFxuICAgIC8qXFxcbiAgICAgKiBldmUub25cbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEJpbmRzIGdpdmVuIGV2ZW50IGhhbmRsZXIgd2l0aCBhIGdpdmVuIG5hbWUuIFlvdSBjYW4gdXNlIHdpbGRjYXJkcyDigJxgKmDigJ0gZm9yIHRoZSBuYW1lczpcbiAgICAgfCBldmUub24oXCIqLnVuZGVyLipcIiwgZik7XG4gICAgIHwgZXZlKFwibW91c2UudW5kZXIuZmxvb3JcIik7IC8vIHRyaWdnZXJzIGZcbiAgICAgKiBVc2UgQGV2ZSB0byB0cmlnZ2VyIHRoZSBsaXN0ZW5lci5cbiAgICAgKipcbiAgICAgPiBBcmd1bWVudHNcbiAgICAgKipcbiAgICAgLSBuYW1lIChzdHJpbmcpIG5hbWUgb2YgdGhlIGV2ZW50LCBkb3QgKGAuYCkgb3Igc2xhc2ggKGAvYCkgc2VwYXJhdGVkLCB3aXRoIG9wdGlvbmFsIHdpbGRjYXJkc1xuICAgICAtIGYgKGZ1bmN0aW9uKSBldmVudCBoYW5kbGVyIGZ1bmN0aW9uXG4gICAgICoqXG4gICAgID0gKGZ1bmN0aW9uKSByZXR1cm5lZCBmdW5jdGlvbiBhY2NlcHRzIGEgc2luZ2xlIG51bWVyaWMgcGFyYW1ldGVyIHRoYXQgcmVwcmVzZW50cyB6LWluZGV4IG9mIHRoZSBoYW5kbGVyLiBJdCBpcyBhbiBvcHRpb25hbCBmZWF0dXJlIGFuZCBvbmx5IHVzZWQgd2hlbiB5b3UgbmVlZCB0byBlbnN1cmUgdGhhdCBzb21lIHN1YnNldCBvZiBoYW5kbGVycyB3aWxsIGJlIGludm9rZWQgaW4gYSBnaXZlbiBvcmRlciwgZGVzcGl0ZSBvZiB0aGUgb3JkZXIgb2YgYXNzaWdubWVudC4gXG4gICAgID4gRXhhbXBsZTpcbiAgICAgfCBldmUub24oXCJtb3VzZVwiLCBlYXRJdCkoMik7XG4gICAgIHwgZXZlLm9uKFwibW91c2VcIiwgc2NyZWFtKTtcbiAgICAgfCBldmUub24oXCJtb3VzZVwiLCBjYXRjaEl0KSgxKTtcbiAgICAgKiBUaGlzIHdpbGwgZW5zdXJlIHRoYXQgYGNhdGNoSXQoKWAgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgYmVmb3JlIGBlYXRJdCgpYC5cblx0ICpcbiAgICAgKiBJZiB5b3Ugd2FudCB0byBwdXQgeW91ciBoYW5kbGVyIGJlZm9yZSBub24taW5kZXhlZCBoYW5kbGVycywgc3BlY2lmeSBhIG5lZ2F0aXZlIHZhbHVlLlxuICAgICAqIE5vdGU6IEkgYXNzdW1lIG1vc3Qgb2YgdGhlIHRpbWUgeW91IGRvbuKAmXQgbmVlZCB0byB3b3JyeSBhYm91dCB6LWluZGV4LCBidXQgaXTigJlzIG5pY2UgdG8gaGF2ZSB0aGlzIGZlYXR1cmUg4oCcanVzdCBpbiBjYXNl4oCdLlxuICAgIFxcKi9cbiAgICBldmUub24gPSBmdW5jdGlvbiAobmFtZSwgZikge1xuXHRcdG5hbWUgPSBTdHJpbmcobmFtZSk7XG5cdFx0aWYgKHR5cGVvZiBmICE9IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uICgpIHt9O1xuXHRcdH1cbiAgICAgICAgdmFyIG5hbWVzID0gbmFtZS5zcGxpdChzZXBhcmF0b3IpLFxuICAgICAgICAgICAgZSA9IGV2ZW50cztcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gbmFtZXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgZSA9IGUubjtcbiAgICAgICAgICAgIGUgPSBlLmhhc093blByb3BlcnR5KG5hbWVzW2ldKSAmJiBlW25hbWVzW2ldXSB8fCAoZVtuYW1lc1tpXV0gPSB7bjoge319KTtcbiAgICAgICAgfVxuICAgICAgICBlLmYgPSBlLmYgfHwgW107XG4gICAgICAgIGZvciAoaSA9IDAsIGlpID0gZS5mLmxlbmd0aDsgaSA8IGlpOyBpKyspIGlmIChlLmZbaV0gPT0gZikge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bjtcbiAgICAgICAgfVxuICAgICAgICBlLmYucHVzaChmKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh6SW5kZXgpIHtcbiAgICAgICAgICAgIGlmICgrekluZGV4ID09ICt6SW5kZXgpIHtcbiAgICAgICAgICAgICAgICBmLnpJbmRleCA9ICt6SW5kZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogZXZlLmZcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgZnVuY3Rpb24gdGhhdCB3aWxsIGZpcmUgZ2l2ZW4gZXZlbnQgd2l0aCBvcHRpb25hbCBhcmd1bWVudHMuXG5cdCAqIEFyZ3VtZW50cyB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIHRoZSByZXN1bHQgZnVuY3Rpb24gd2lsbCBiZSBhbHNvXG5cdCAqIGNvbmNhdGVkIHRvIHRoZSBsaXN0IG9mIGZpbmFsIGFyZ3VtZW50cy5cbiBcdCB8IGVsLm9uY2xpY2sgPSBldmUuZihcImNsaWNrXCIsIDEsIDIpO1xuIFx0IHwgZXZlLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiBcdCB8ICAgICBjb25zb2xlLmxvZyhhLCBiLCBjKTsgLy8gMSwgMiwgW2V2ZW50IG9iamVjdF1cbiBcdCB8IH0pO1xuICAgICA+IEFyZ3VtZW50c1xuXHQgLSBldmVudCAoc3RyaW5nKSBldmVudCBuYW1lXG5cdCAtIHZhcmFyZ3MgKOKApikgYW5kIGFueSBvdGhlciBhcmd1bWVudHNcblx0ID0gKGZ1bmN0aW9uKSBwb3NzaWJsZSBldmVudCBoYW5kbGVyIGZ1bmN0aW9uXG4gICAgXFwqL1xuXHRldmUuZiA9IGZ1bmN0aW9uIChldmVudCkge1xuXHRcdHZhciBhdHRycyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdFx0ZXZlLmFwcGx5KG51bGwsIFtldmVudCwgbnVsbF0uY29uY2F0KGF0dHJzKS5jb25jYXQoW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDApKSk7XG5cdFx0fTtcblx0fTtcbiAgICAvKlxcXG4gICAgICogZXZlLnN0b3BcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIElzIHVzZWQgaW5zaWRlIGFuIGV2ZW50IGhhbmRsZXIgdG8gc3RvcCB0aGUgZXZlbnQsIHByZXZlbnRpbmcgYW55IHN1YnNlcXVlbnQgbGlzdGVuZXJzIGZyb20gZmlyaW5nLlxuICAgIFxcKi9cbiAgICBldmUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3RvcCA9IDE7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogZXZlLm50XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDb3VsZCBiZSB1c2VkIGluc2lkZSBldmVudCBoYW5kbGVyIHRvIGZpZ3VyZSBvdXQgYWN0dWFsIG5hbWUgb2YgdGhlIGV2ZW50LlxuICAgICAqKlxuICAgICA+IEFyZ3VtZW50c1xuICAgICAqKlxuICAgICAtIHN1Ym5hbWUgKHN0cmluZykgI29wdGlvbmFsIHN1Ym5hbWUgb2YgdGhlIGV2ZW50XG4gICAgICoqXG4gICAgID0gKHN0cmluZykgbmFtZSBvZiB0aGUgZXZlbnQsIGlmIGBzdWJuYW1lYCBpcyBub3Qgc3BlY2lmaWVkXG4gICAgICogb3JcbiAgICAgPSAoYm9vbGVhbikgYHRydWVgLCBpZiBjdXJyZW50IGV2ZW504oCZcyBuYW1lIGNvbnRhaW5zIGBzdWJuYW1lYFxuICAgIFxcKi9cbiAgICBldmUubnQgPSBmdW5jdGlvbiAoc3VibmFtZSkge1xuICAgICAgICBpZiAoc3VibmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoXCIoPzpcXFxcLnxcXFxcL3xeKVwiICsgc3VibmFtZSArIFwiKD86XFxcXC58XFxcXC98JClcIikudGVzdChjdXJyZW50X2V2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3VycmVudF9ldmVudDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBldmUubnRzXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDb3VsZCBiZSB1c2VkIGluc2lkZSBldmVudCBoYW5kbGVyIHRvIGZpZ3VyZSBvdXQgYWN0dWFsIG5hbWUgb2YgdGhlIGV2ZW50LlxuICAgICAqKlxuICAgICAqKlxuICAgICA9IChhcnJheSkgbmFtZXMgb2YgdGhlIGV2ZW50XG4gICAgXFwqL1xuICAgIGV2ZS5udHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50X2V2ZW50LnNwbGl0KHNlcGFyYXRvcik7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogZXZlLm9mZlxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBnaXZlbiBmdW5jdGlvbiBmcm9tIHRoZSBsaXN0IG9mIGV2ZW50IGxpc3RlbmVycyBhc3NpZ25lZCB0byBnaXZlbiBuYW1lLlxuXHQgKiBJZiBubyBhcmd1bWVudHMgc3BlY2lmaWVkIGFsbCB0aGUgZXZlbnRzIHdpbGwgYmUgY2xlYXJlZC5cbiAgICAgKipcbiAgICAgPiBBcmd1bWVudHNcbiAgICAgKipcbiAgICAgLSBuYW1lIChzdHJpbmcpIG5hbWUgb2YgdGhlIGV2ZW50LCBkb3QgKGAuYCkgb3Igc2xhc2ggKGAvYCkgc2VwYXJhdGVkLCB3aXRoIG9wdGlvbmFsIHdpbGRjYXJkc1xuICAgICAtIGYgKGZ1bmN0aW9uKSBldmVudCBoYW5kbGVyIGZ1bmN0aW9uXG4gICAgXFwqL1xuICAgIC8qXFxcbiAgICAgKiBldmUudW5iaW5kXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBTZWUgQGV2ZS5vZmZcbiAgICBcXCovXG4gICAgZXZlLm9mZiA9IGV2ZS51bmJpbmQgPSBmdW5jdGlvbiAobmFtZSwgZikge1xuXHRcdGlmICghbmFtZSkge1xuXHRcdCAgICBldmUuX2V2ZW50cyA9IGV2ZW50cyA9IHtuOiB7fX07XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuICAgICAgICB2YXIgbmFtZXMgPSBuYW1lLnNwbGl0KHNlcGFyYXRvciksXG4gICAgICAgICAgICBlLFxuICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgc3BsaWNlLFxuICAgICAgICAgICAgaSwgaWksIGosIGpqLFxuICAgICAgICAgICAgY3VyID0gW2V2ZW50c107XG4gICAgICAgIGZvciAoaSA9IDAsIGlpID0gbmFtZXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IGN1ci5sZW5ndGg7IGogKz0gc3BsaWNlLmxlbmd0aCAtIDIpIHtcbiAgICAgICAgICAgICAgICBzcGxpY2UgPSBbaiwgMV07XG4gICAgICAgICAgICAgICAgZSA9IGN1cltqXS5uO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lc1tpXSAhPSB3aWxkY2FyZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZVtuYW1lc1tpXV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwbGljZS5wdXNoKGVbbmFtZXNbaV1dKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGUpIGlmIChlW2hhc10oa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3BsaWNlLnB1c2goZVtrZXldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdXIuc3BsaWNlLmFwcGx5KGN1ciwgc3BsaWNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwLCBpaSA9IGN1ci5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICBlID0gY3VyW2ldO1xuICAgICAgICAgICAgd2hpbGUgKGUubikge1xuICAgICAgICAgICAgICAgIGlmIChmKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLmYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDAsIGpqID0gZS5mLmxlbmd0aDsgaiA8IGpqOyBqKyspIGlmIChlLmZbal0gPT0gZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuZi5zcGxpY2UoaiwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAhZS5mLmxlbmd0aCAmJiBkZWxldGUgZS5mO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGUubikgaWYgKGUubltoYXNdKGtleSkgJiYgZS5uW2tleV0uZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZ1bmNzID0gZS5uW2tleV0uZjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDAsIGpqID0gZnVuY3MubGVuZ3RoOyBqIDwgamo7IGorKykgaWYgKGZ1bmNzW2pdID09IGYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jcy5zcGxpY2UoaiwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAhZnVuY3MubGVuZ3RoICYmIGRlbGV0ZSBlLm5ba2V5XS5mO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGUuZjtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gZS5uKSBpZiAoZS5uW2hhc10oa2V5KSAmJiBlLm5ba2V5XS5mKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZS5uW2tleV0uZjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlID0gZS5uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogZXZlLm9uY2VcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEJpbmRzIGdpdmVuIGV2ZW50IGhhbmRsZXIgd2l0aCBhIGdpdmVuIG5hbWUgdG8gb25seSBydW4gb25jZSB0aGVuIHVuYmluZCBpdHNlbGYuXG4gICAgIHwgZXZlLm9uY2UoXCJsb2dpblwiLCBmKTtcbiAgICAgfCBldmUoXCJsb2dpblwiKTsgLy8gdHJpZ2dlcnMgZlxuICAgICB8IGV2ZShcImxvZ2luXCIpOyAvLyBubyBsaXN0ZW5lcnNcbiAgICAgKiBVc2UgQGV2ZSB0byB0cmlnZ2VyIHRoZSBsaXN0ZW5lci5cbiAgICAgKipcbiAgICAgPiBBcmd1bWVudHNcbiAgICAgKipcbiAgICAgLSBuYW1lIChzdHJpbmcpIG5hbWUgb2YgdGhlIGV2ZW50LCBkb3QgKGAuYCkgb3Igc2xhc2ggKGAvYCkgc2VwYXJhdGVkLCB3aXRoIG9wdGlvbmFsIHdpbGRjYXJkc1xuICAgICAtIGYgKGZ1bmN0aW9uKSBldmVudCBoYW5kbGVyIGZ1bmN0aW9uXG4gICAgICoqXG4gICAgID0gKGZ1bmN0aW9uKSBzYW1lIHJldHVybiBmdW5jdGlvbiBhcyBAZXZlLm9uXG4gICAgXFwqL1xuICAgIGV2ZS5vbmNlID0gZnVuY3Rpb24gKG5hbWUsIGYpIHtcbiAgICAgICAgdmFyIGYyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXZlLnVuYmluZChuYW1lLCBmMik7XG4gICAgICAgICAgICByZXR1cm4gZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gZXZlLm9uKG5hbWUsIGYyKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBldmUudmVyc2lvblxuICAgICBbIHByb3BlcnR5IChzdHJpbmcpIF1cbiAgICAgKipcbiAgICAgKiBDdXJyZW50IHZlcnNpb24gb2YgdGhlIGxpYnJhcnkuXG4gICAgXFwqL1xuICAgIGV2ZS52ZXJzaW9uID0gdmVyc2lvbjtcbiAgICBldmUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBcIllvdSBhcmUgcnVubmluZyBFdmUgXCIgKyB2ZXJzaW9uO1xuICAgIH07XG4gICAgKHR5cGVvZiBtb2R1bGUgIT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUuZXhwb3J0cykgPyAobW9kdWxlLmV4cG9ydHMgPSBldmUpIDogKHR5cGVvZiBkZWZpbmUgIT0gXCJ1bmRlZmluZWRcIiA/IChkZWZpbmUoXCJldmVcIiwgW10sIGZ1bmN0aW9uKCkgeyByZXR1cm4gZXZlOyB9KSkgOiAoZ2xvYi5ldmUgPSBldmUpKTtcbn0pKHRoaXMpO1xuIiwiLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQIFxcXFxcbi8vIOKUgiBcIlJhcGhhw6tsIDIuMS4wXCIgLSBKYXZhU2NyaXB0IFZlY3RvciBMaWJyYXJ5ICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiBcXFxcXG4vLyDilJzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilKQgXFxcXFxuLy8g4pSCIENvcHlyaWdodCAoYykgMjAwOC0yMDExIERtaXRyeSBCYXJhbm92c2tpeSAoaHR0cDovL3JhcGhhZWxqcy5jb20pICAg4pSCIFxcXFxcbi8vIOKUgiBDb3B5cmlnaHQgKGMpIDIwMDgtMjAxMSBTZW5jaGEgTGFicyAoaHR0cDovL3NlbmNoYS5jb20pICAgICAgICAgICAgIOKUgiBcXFxcXG4vLyDilIIgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCAoaHR0cDovL3JhcGhhZWxqcy5jb20vbGljZW5zZS5odG1sKSBsaWNlbnNlLiDilIIgXFxcXFxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYIFxcXFxcblxudmFyIGV2ZSA9IHJlcXVpcmUoJ2V2ZScpO1xuXG4oZnVuY3Rpb24gKCkge1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDcmVhdGVzIGEgY2FudmFzIG9iamVjdCBvbiB3aGljaCB0byBkcmF3LlxuICAgICAqIFlvdSBtdXN0IGRvIHRoaXMgZmlyc3QsIGFzIGFsbCBmdXR1cmUgY2FsbHMgdG8gZHJhd2luZyBtZXRob2RzXG4gICAgICogZnJvbSB0aGlzIGluc3RhbmNlIHdpbGwgYmUgYm91bmQgdG8gdGhpcyBjYW52YXMuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGNvbnRhaW5lciAoSFRNTEVsZW1lbnR8c3RyaW5nKSBET00gZWxlbWVudCBvciBpdHMgSUQgd2hpY2ggaXMgZ29pbmcgdG8gYmUgYSBwYXJlbnQgZm9yIGRyYXdpbmcgc3VyZmFjZVxuICAgICAtIHdpZHRoIChudW1iZXIpXG4gICAgIC0gaGVpZ2h0IChudW1iZXIpXG4gICAgIC0gY2FsbGJhY2sgKGZ1bmN0aW9uKSAjb3B0aW9uYWwgY2FsbGJhY2sgZnVuY3Rpb24gd2hpY2ggaXMgZ29pbmcgdG8gYmUgZXhlY3V0ZWQgaW4gdGhlIGNvbnRleHQgb2YgbmV3bHkgY3JlYXRlZCBwYXBlclxuICAgICAqIG9yXG4gICAgIC0geCAobnVtYmVyKVxuICAgICAtIHkgKG51bWJlcilcbiAgICAgLSB3aWR0aCAobnVtYmVyKVxuICAgICAtIGhlaWdodCAobnVtYmVyKVxuICAgICAtIGNhbGxiYWNrIChmdW5jdGlvbikgI29wdGlvbmFsIGNhbGxiYWNrIGZ1bmN0aW9uIHdoaWNoIGlzIGdvaW5nIHRvIGJlIGV4ZWN1dGVkIGluIHRoZSBjb250ZXh0IG9mIG5ld2x5IGNyZWF0ZWQgcGFwZXJcbiAgICAgKiBvclxuICAgICAtIGFsbCAoYXJyYXkpIChmaXJzdCAzIG9yIDQgZWxlbWVudHMgaW4gdGhlIGFycmF5IGFyZSBlcXVhbCB0byBbY29udGFpbmVySUQsIHdpZHRoLCBoZWlnaHRdIG9yIFt4LCB5LCB3aWR0aCwgaGVpZ2h0XS4gVGhlIHJlc3QgYXJlIGVsZW1lbnQgZGVzY3JpcHRpb25zIGluIGZvcm1hdCB7dHlwZTogdHlwZSwgPGF0dHJpYnV0ZXM+fSkuIFNlZSBAUGFwZXIuYWRkLlxuICAgICAtIGNhbGxiYWNrIChmdW5jdGlvbikgI29wdGlvbmFsIGNhbGxiYWNrIGZ1bmN0aW9uIHdoaWNoIGlzIGdvaW5nIHRvIGJlIGV4ZWN1dGVkIGluIHRoZSBjb250ZXh0IG9mIG5ld2x5IGNyZWF0ZWQgcGFwZXJcbiAgICAgKiBvclxuICAgICAtIG9uUmVhZHlDYWxsYmFjayAoZnVuY3Rpb24pIGZ1bmN0aW9uIHRoYXQgaXMgZ29pbmcgdG8gYmUgY2FsbGVkIG9uIERPTSByZWFkeSBldmVudC4gWW91IGNhbiBhbHNvIHN1YnNjcmliZSB0byB0aGlzIGV2ZW50IHZpYSBFdmXigJlzIOKAnERPTUxvYWTigJ0gZXZlbnQuIEluIHRoaXMgY2FzZSBtZXRob2QgcmV0dXJucyBgdW5kZWZpbmVkYC5cbiAgICAgPSAob2JqZWN0KSBAUGFwZXJcbiAgICAgPiBVc2FnZVxuICAgICB8IC8vIEVhY2ggb2YgdGhlIGZvbGxvd2luZyBleGFtcGxlcyBjcmVhdGUgYSBjYW52YXNcbiAgICAgfCAvLyB0aGF0IGlzIDMyMHB4IHdpZGUgYnkgMjAwcHggaGlnaC5cbiAgICAgfCAvLyBDYW52YXMgaXMgY3JlYXRlZCBhdCB0aGUgdmlld3BvcnTigJlzIDEwLDUwIGNvb3JkaW5hdGUuXG4gICAgIHwgdmFyIHBhcGVyID0gUmFwaGFlbCgxMCwgNTAsIDMyMCwgMjAwKTtcbiAgICAgfCAvLyBDYW52YXMgaXMgY3JlYXRlZCBhdCB0aGUgdG9wIGxlZnQgY29ybmVyIG9mIHRoZSAjbm90ZXBhZCBlbGVtZW50XG4gICAgIHwgLy8gKG9yIGl0cyB0b3AgcmlnaHQgY29ybmVyIGluIGRpcj1cInJ0bFwiIGVsZW1lbnRzKVxuICAgICB8IHZhciBwYXBlciA9IFJhcGhhZWwoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJub3RlcGFkXCIpLCAzMjAsIDIwMCk7XG4gICAgIHwgLy8gU2FtZSBhcyBhYm92ZVxuICAgICB8IHZhciBwYXBlciA9IFJhcGhhZWwoXCJub3RlcGFkXCIsIDMyMCwgMjAwKTtcbiAgICAgfCAvLyBJbWFnZSBkdW1wXG4gICAgIHwgdmFyIHNldCA9IFJhcGhhZWwoW1wibm90ZXBhZFwiLCAzMjAsIDIwMCwge1xuICAgICB8ICAgICB0eXBlOiBcInJlY3RcIixcbiAgICAgfCAgICAgeDogMTAsXG4gICAgIHwgICAgIHk6IDEwLFxuICAgICB8ICAgICB3aWR0aDogMjUsXG4gICAgIHwgICAgIGhlaWdodDogMjUsXG4gICAgIHwgICAgIHN0cm9rZTogXCIjZjAwXCJcbiAgICAgfCB9LCB7XG4gICAgIHwgICAgIHR5cGU6IFwidGV4dFwiLFxuICAgICB8ICAgICB4OiAzMCxcbiAgICAgfCAgICAgeTogNDAsXG4gICAgIHwgICAgIHRleHQ6IFwiRHVtcFwiXG4gICAgIHwgfV0pO1xuICAgIFxcKi9cbiAgICBmdW5jdGlvbiBSKGZpcnN0KSB7XG4gICAgICAgIGlmIChSLmlzKGZpcnN0LCBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9hZGVkID8gZmlyc3QoKSA6IGV2ZS5vbihcInJhcGhhZWwuRE9NbG9hZFwiLCBmaXJzdCk7XG4gICAgICAgIH0gZWxzZSBpZiAoUi5pcyhmaXJzdCwgYXJyYXkpKSB7XG4gICAgICAgICAgICByZXR1cm4gUi5fZW5naW5lLmNyZWF0ZVthcHBseV0oUiwgZmlyc3Quc3BsaWNlKDAsIDMgKyBSLmlzKGZpcnN0WzBdLCBudSkpKS5hZGQoZmlyc3QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgICAgICAgICAgaWYgKFIuaXMoYXJnc1thcmdzLmxlbmd0aCAtIDFdLCBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGYgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBsb2FkZWQgPyBmLmNhbGwoUi5fZW5naW5lLmNyZWF0ZVthcHBseV0oUiwgYXJncykpIDogZXZlLm9uKFwicmFwaGFlbC5ET01sb2FkXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZi5jYWxsKFIuX2VuZ2luZS5jcmVhdGVbYXBwbHldKFIsIGFyZ3MpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFIuX2VuZ2luZS5jcmVhdGVbYXBwbHldKFIsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgUi52ZXJzaW9uID0gXCIyLjEuMFwiO1xuICAgIFIuZXZlID0gZXZlO1xuICAgIHZhciBsb2FkZWQsXG4gICAgICAgIHNlcGFyYXRvciA9IC9bLCBdKy8sXG4gICAgICAgIGVsZW1lbnRzID0ge2NpcmNsZTogMSwgcmVjdDogMSwgcGF0aDogMSwgZWxsaXBzZTogMSwgdGV4dDogMSwgaW1hZ2U6IDF9LFxuICAgICAgICBmb3JtYXRyZyA9IC9cXHsoXFxkKylcXH0vZyxcbiAgICAgICAgcHJvdG8gPSBcInByb3RvdHlwZVwiLFxuICAgICAgICBoYXMgPSBcImhhc093blByb3BlcnR5XCIsXG4gICAgICAgIGcgPSB7XG4gICAgICAgICAgICBkb2M6IGRvY3VtZW50LFxuICAgICAgICAgICAgd2luOiB3aW5kb3dcbiAgICAgICAgfSxcbiAgICAgICAgb2xkUmFwaGFlbCA9IHtcbiAgICAgICAgICAgIHdhczogT2JqZWN0LnByb3RvdHlwZVtoYXNdLmNhbGwoZy53aW4sIFwiUmFwaGFlbFwiKSxcbiAgICAgICAgICAgIGlzOiBnLndpbi5SYXBoYWVsXG4gICAgICAgIH0sXG4gICAgICAgIFBhcGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLypcXFxuICAgICAgICAgICAgICogUGFwZXIuY2FcbiAgICAgICAgICAgICBbIHByb3BlcnR5IChvYmplY3QpIF1cbiAgICAgICAgICAgICAqKlxuICAgICAgICAgICAgICogU2hvcnRjdXQgZm9yIEBQYXBlci5jdXN0b21BdHRyaWJ1dGVzXG4gICAgICAgICAgICBcXCovXG4gICAgICAgICAgICAvKlxcXG4gICAgICAgICAgICAgKiBQYXBlci5jdXN0b21BdHRyaWJ1dGVzXG4gICAgICAgICAgICAgWyBwcm9wZXJ0eSAob2JqZWN0KSBdXG4gICAgICAgICAgICAgKipcbiAgICAgICAgICAgICAqIElmIHlvdSBoYXZlIGEgc2V0IG9mIGF0dHJpYnV0ZXMgdGhhdCB5b3Ugd291bGQgbGlrZSB0byByZXByZXNlbnRcbiAgICAgICAgICAgICAqIGFzIGEgZnVuY3Rpb24gb2Ygc29tZSBudW1iZXIgeW91IGNhbiBkbyBpdCBlYXNpbHkgd2l0aCBjdXN0b20gYXR0cmlidXRlczpcbiAgICAgICAgICAgICA+IFVzYWdlXG4gICAgICAgICAgICAgfCBwYXBlci5jdXN0b21BdHRyaWJ1dGVzLmh1ZSA9IGZ1bmN0aW9uIChudW0pIHtcbiAgICAgICAgICAgICB8ICAgICBudW0gPSBudW0gJSAxO1xuICAgICAgICAgICAgIHwgICAgIHJldHVybiB7ZmlsbDogXCJoc2IoXCIgKyBudW0gKyBcIiwgMC43NSwgMSlcIn07XG4gICAgICAgICAgICAgfCB9O1xuICAgICAgICAgICAgIHwgLy8gQ3VzdG9tIGF0dHJpYnV0ZSDigJxodWXigJ0gd2lsbCBjaGFuZ2UgZmlsbFxuICAgICAgICAgICAgIHwgLy8gdG8gYmUgZ2l2ZW4gaHVlIHdpdGggZml4ZWQgc2F0dXJhdGlvbiBhbmQgYnJpZ2h0bmVzcy5cbiAgICAgICAgICAgICB8IC8vIE5vdyB5b3UgY2FuIHVzZSBpdCBsaWtlIHRoaXM6XG4gICAgICAgICAgICAgfCB2YXIgYyA9IHBhcGVyLmNpcmNsZSgxMCwgMTAsIDEwKS5hdHRyKHtodWU6IC40NX0pO1xuICAgICAgICAgICAgIHwgLy8gb3IgZXZlbiBsaWtlIHRoaXM6XG4gICAgICAgICAgICAgfCBjLmFuaW1hdGUoe2h1ZTogMX0sIDFlMyk7XG4gICAgICAgICAgICAgfCBcbiAgICAgICAgICAgICB8IC8vIFlvdSBjb3VsZCBhbHNvIGNyZWF0ZSBjdXN0b20gYXR0cmlidXRlXG4gICAgICAgICAgICAgfCAvLyB3aXRoIG11bHRpcGxlIHBhcmFtZXRlcnM6XG4gICAgICAgICAgICAgfCBwYXBlci5jdXN0b21BdHRyaWJ1dGVzLmhzYiA9IGZ1bmN0aW9uIChoLCBzLCBiKSB7XG4gICAgICAgICAgICAgfCAgICAgcmV0dXJuIHtmaWxsOiBcImhzYihcIiArIFtoLCBzLCBiXS5qb2luKFwiLFwiKSArIFwiKVwifTtcbiAgICAgICAgICAgICB8IH07XG4gICAgICAgICAgICAgfCBjLmF0dHIoe2hzYjogXCIwLjUgLjggMVwifSk7XG4gICAgICAgICAgICAgfCBjLmFuaW1hdGUoe2hzYjogWzEsIDAsIDAuNV19LCAxZTMpO1xuICAgICAgICAgICAgXFwqL1xuICAgICAgICAgICAgdGhpcy5jYSA9IHRoaXMuY3VzdG9tQXR0cmlidXRlcyA9IHt9O1xuICAgICAgICB9LFxuICAgICAgICBwYXBlcnByb3RvLFxuICAgICAgICBhcHBlbmRDaGlsZCA9IFwiYXBwZW5kQ2hpbGRcIixcbiAgICAgICAgYXBwbHkgPSBcImFwcGx5XCIsXG4gICAgICAgIGNvbmNhdCA9IFwiY29uY2F0XCIsXG4gICAgICAgIHN1cHBvcnRzVG91Y2ggPSBcImNyZWF0ZVRvdWNoXCIgaW4gZy5kb2MsXG4gICAgICAgIEUgPSBcIlwiLFxuICAgICAgICBTID0gXCIgXCIsXG4gICAgICAgIFN0ciA9IFN0cmluZyxcbiAgICAgICAgc3BsaXQgPSBcInNwbGl0XCIsXG4gICAgICAgIGV2ZW50cyA9IFwiY2xpY2sgZGJsY2xpY2sgbW91c2Vkb3duIG1vdXNlbW92ZSBtb3VzZW91dCBtb3VzZW92ZXIgbW91c2V1cCB0b3VjaHN0YXJ0IHRvdWNobW92ZSB0b3VjaGVuZCB0b3VjaGNhbmNlbFwiW3NwbGl0XShTKSxcbiAgICAgICAgdG91Y2hNYXAgPSB7XG4gICAgICAgICAgICBtb3VzZWRvd246IFwidG91Y2hzdGFydFwiLFxuICAgICAgICAgICAgbW91c2Vtb3ZlOiBcInRvdWNobW92ZVwiLFxuICAgICAgICAgICAgbW91c2V1cDogXCJ0b3VjaGVuZFwiXG4gICAgICAgIH0sXG4gICAgICAgIGxvd2VyQ2FzZSA9IFN0ci5wcm90b3R5cGUudG9Mb3dlckNhc2UsXG4gICAgICAgIG1hdGggPSBNYXRoLFxuICAgICAgICBtbWF4ID0gbWF0aC5tYXgsXG4gICAgICAgIG1taW4gPSBtYXRoLm1pbixcbiAgICAgICAgYWJzID0gbWF0aC5hYnMsXG4gICAgICAgIHBvdyA9IG1hdGgucG93LFxuICAgICAgICBQSSA9IG1hdGguUEksXG4gICAgICAgIG51ID0gXCJudW1iZXJcIixcbiAgICAgICAgc3RyaW5nID0gXCJzdHJpbmdcIixcbiAgICAgICAgYXJyYXkgPSBcImFycmF5XCIsXG4gICAgICAgIHRvU3RyaW5nID0gXCJ0b1N0cmluZ1wiLFxuICAgICAgICBmaWxsU3RyaW5nID0gXCJmaWxsXCIsXG4gICAgICAgIG9iamVjdFRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyxcbiAgICAgICAgcGFwZXIgPSB7fSxcbiAgICAgICAgcHVzaCA9IFwicHVzaFwiLFxuICAgICAgICBJU1VSTCA9IFIuX0lTVVJMID0gL151cmxcXChbJ1wiXT8oW15cXCldKz8pWydcIl0/XFwpJC9pLFxuICAgICAgICBjb2xvdXJSZWdFeHAgPSAvXlxccyooKCNbYS1mXFxkXXs2fSl8KCNbYS1mXFxkXXszfSl8cmdiYT9cXChcXHMqKFtcXGRcXC5dKyU/XFxzKixcXHMqW1xcZFxcLl0rJT9cXHMqLFxccypbXFxkXFwuXSslPyg/OlxccyosXFxzKltcXGRcXC5dKyU/KT8pXFxzKlxcKXxoc2JhP1xcKFxccyooW1xcZFxcLl0rKD86ZGVnfFxceGIwfCUpP1xccyosXFxzKltcXGRcXC5dKyU/XFxzKixcXHMqW1xcZFxcLl0rKD86JT9cXHMqLFxccypbXFxkXFwuXSspPyklP1xccypcXCl8aHNsYT9cXChcXHMqKFtcXGRcXC5dKyg/OmRlZ3xcXHhiMHwlKT9cXHMqLFxccypbXFxkXFwuXSslP1xccyosXFxzKltcXGRcXC5dKyg/OiU/XFxzKixcXHMqW1xcZFxcLl0rKT8pJT9cXHMqXFwpKVxccyokL2ksXG4gICAgICAgIGlzbmFuID0ge1wiTmFOXCI6IDEsIFwiSW5maW5pdHlcIjogMSwgXCItSW5maW5pdHlcIjogMX0sXG4gICAgICAgIGJlemllcnJnID0gL14oPzpjdWJpYy0pP2JlemllclxcKChbXixdKyksKFteLF0rKSwoW14sXSspLChbXlxcKV0rKVxcKS8sXG4gICAgICAgIHJvdW5kID0gbWF0aC5yb3VuZCxcbiAgICAgICAgc2V0QXR0cmlidXRlID0gXCJzZXRBdHRyaWJ1dGVcIixcbiAgICAgICAgdG9GbG9hdCA9IHBhcnNlRmxvYXQsXG4gICAgICAgIHRvSW50ID0gcGFyc2VJbnQsXG4gICAgICAgIHVwcGVyQ2FzZSA9IFN0ci5wcm90b3R5cGUudG9VcHBlckNhc2UsXG4gICAgICAgIGF2YWlsYWJsZUF0dHJzID0gUi5fYXZhaWxhYmxlQXR0cnMgPSB7XG4gICAgICAgICAgICBcImFycm93LWVuZFwiOiBcIm5vbmVcIixcbiAgICAgICAgICAgIFwiYXJyb3ctc3RhcnRcIjogXCJub25lXCIsXG4gICAgICAgICAgICBibHVyOiAwLFxuICAgICAgICAgICAgXCJjbGlwLXJlY3RcIjogXCIwIDAgMWU5IDFlOVwiLFxuICAgICAgICAgICAgY3Vyc29yOiBcImRlZmF1bHRcIixcbiAgICAgICAgICAgIGN4OiAwLFxuICAgICAgICAgICAgY3k6IDAsXG4gICAgICAgICAgICBmaWxsOiBcIiNmZmZcIixcbiAgICAgICAgICAgIFwiZmlsbC1vcGFjaXR5XCI6IDEsXG4gICAgICAgICAgICBmb250OiAnMTBweCBcIkFyaWFsXCInLFxuICAgICAgICAgICAgXCJmb250LWZhbWlseVwiOiAnXCJBcmlhbFwiJyxcbiAgICAgICAgICAgIFwiZm9udC1zaXplXCI6IFwiMTBcIixcbiAgICAgICAgICAgIFwiZm9udC1zdHlsZVwiOiBcIm5vcm1hbFwiLFxuICAgICAgICAgICAgXCJmb250LXdlaWdodFwiOiA0MDAsXG4gICAgICAgICAgICBncmFkaWVudDogMCxcbiAgICAgICAgICAgIGhlaWdodDogMCxcbiAgICAgICAgICAgIGhyZWY6IFwiaHR0cDovL3JhcGhhZWxqcy5jb20vXCIsXG4gICAgICAgICAgICBcImxldHRlci1zcGFjaW5nXCI6IDAsXG4gICAgICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICAgICAgcGF0aDogXCJNMCwwXCIsXG4gICAgICAgICAgICByOiAwLFxuICAgICAgICAgICAgcng6IDAsXG4gICAgICAgICAgICByeTogMCxcbiAgICAgICAgICAgIHNyYzogXCJcIixcbiAgICAgICAgICAgIHN0cm9rZTogXCIjMDAwXCIsXG4gICAgICAgICAgICBcInN0cm9rZS1kYXNoYXJyYXlcIjogXCJcIixcbiAgICAgICAgICAgIFwic3Ryb2tlLWxpbmVjYXBcIjogXCJidXR0XCIsXG4gICAgICAgICAgICBcInN0cm9rZS1saW5lam9pblwiOiBcImJ1dHRcIixcbiAgICAgICAgICAgIFwic3Ryb2tlLW1pdGVybGltaXRcIjogMCxcbiAgICAgICAgICAgIFwic3Ryb2tlLW9wYWNpdHlcIjogMSxcbiAgICAgICAgICAgIFwic3Ryb2tlLXdpZHRoXCI6IDEsXG4gICAgICAgICAgICB0YXJnZXQ6IFwiX2JsYW5rXCIsXG4gICAgICAgICAgICBcInRleHQtYW5jaG9yXCI6IFwibWlkZGxlXCIsXG4gICAgICAgICAgICB0aXRsZTogXCJSYXBoYWVsXCIsXG4gICAgICAgICAgICB0cmFuc2Zvcm06IFwiXCIsXG4gICAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgIH0sXG4gICAgICAgIGF2YWlsYWJsZUFuaW1BdHRycyA9IFIuX2F2YWlsYWJsZUFuaW1BdHRycyA9IHtcbiAgICAgICAgICAgIGJsdXI6IG51LFxuICAgICAgICAgICAgXCJjbGlwLXJlY3RcIjogXCJjc3ZcIixcbiAgICAgICAgICAgIGN4OiBudSxcbiAgICAgICAgICAgIGN5OiBudSxcbiAgICAgICAgICAgIGZpbGw6IFwiY29sb3VyXCIsXG4gICAgICAgICAgICBcImZpbGwtb3BhY2l0eVwiOiBudSxcbiAgICAgICAgICAgIFwiZm9udC1zaXplXCI6IG51LFxuICAgICAgICAgICAgaGVpZ2h0OiBudSxcbiAgICAgICAgICAgIG9wYWNpdHk6IG51LFxuICAgICAgICAgICAgcGF0aDogXCJwYXRoXCIsXG4gICAgICAgICAgICByOiBudSxcbiAgICAgICAgICAgIHJ4OiBudSxcbiAgICAgICAgICAgIHJ5OiBudSxcbiAgICAgICAgICAgIHN0cm9rZTogXCJjb2xvdXJcIixcbiAgICAgICAgICAgIFwic3Ryb2tlLW9wYWNpdHlcIjogbnUsXG4gICAgICAgICAgICBcInN0cm9rZS13aWR0aFwiOiBudSxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogXCJ0cmFuc2Zvcm1cIixcbiAgICAgICAgICAgIHdpZHRoOiBudSxcbiAgICAgICAgICAgIHg6IG51LFxuICAgICAgICAgICAgeTogbnVcbiAgICAgICAgfSxcbiAgICAgICAgd2hpdGVzcGFjZSA9IC9bXFx4MDlcXHgwYVxceDBiXFx4MGNcXHgwZFxceDIwXFx4YTBcXHUxNjgwXFx1MTgwZVxcdTIwMDBcXHUyMDAxXFx1MjAwMlxcdTIwMDNcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBhXFx1MjAyZlxcdTIwNWZcXHUzMDAwXFx1MjAyOFxcdTIwMjldL2csXG4gICAgICAgIGNvbW1hU3BhY2VzID0gL1tcXHgwOVxceDBhXFx4MGJcXHgwY1xceDBkXFx4MjBcXHhhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDJmXFx1MjA1ZlxcdTMwMDBcXHUyMDI4XFx1MjAyOV0qLFtcXHgwOVxceDBhXFx4MGJcXHgwY1xceDBkXFx4MjBcXHhhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDJmXFx1MjA1ZlxcdTMwMDBcXHUyMDI4XFx1MjAyOV0qLyxcbiAgICAgICAgaHNyZyA9IHtoczogMSwgcmc6IDF9LFxuICAgICAgICBwMnMgPSAvLD8oW2FjaGxtcXJzdHZ4el0pLD8vZ2ksXG4gICAgICAgIHBhdGhDb21tYW5kID0gLyhbYWNobG1ycXN0dnpdKVtcXHgwOVxceDBhXFx4MGJcXHgwY1xceDBkXFx4MjBcXHhhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDJmXFx1MjA1ZlxcdTMwMDBcXHUyMDI4XFx1MjAyOSxdKigoLT9cXGQqXFwuP1xcZCooPzplW1xcLStdP1xcZCspP1tcXHgwOVxceDBhXFx4MGJcXHgwY1xceDBkXFx4MjBcXHhhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDJmXFx1MjA1ZlxcdTMwMDBcXHUyMDI4XFx1MjAyOV0qLD9bXFx4MDlcXHgwYVxceDBiXFx4MGNcXHgwZFxceDIwXFx4YTBcXHUxNjgwXFx1MTgwZVxcdTIwMDBcXHUyMDAxXFx1MjAwMlxcdTIwMDNcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBhXFx1MjAyZlxcdTIwNWZcXHUzMDAwXFx1MjAyOFxcdTIwMjldKikrKS9pZyxcbiAgICAgICAgdENvbW1hbmQgPSAvKFtyc3RtXSlbXFx4MDlcXHgwYVxceDBiXFx4MGNcXHgwZFxceDIwXFx4YTBcXHUxNjgwXFx1MTgwZVxcdTIwMDBcXHUyMDAxXFx1MjAwMlxcdTIwMDNcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBhXFx1MjAyZlxcdTIwNWZcXHUzMDAwXFx1MjAyOFxcdTIwMjksXSooKC0/XFxkKlxcLj9cXGQqKD86ZVtcXC0rXT9cXGQrKT9bXFx4MDlcXHgwYVxceDBiXFx4MGNcXHgwZFxceDIwXFx4YTBcXHUxNjgwXFx1MTgwZVxcdTIwMDBcXHUyMDAxXFx1MjAwMlxcdTIwMDNcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBhXFx1MjAyZlxcdTIwNWZcXHUzMDAwXFx1MjAyOFxcdTIwMjldKiw/W1xceDA5XFx4MGFcXHgwYlxceDBjXFx4MGRcXHgyMFxceGEwXFx1MTY4MFxcdTE4MGVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwYVxcdTIwMmZcXHUyMDVmXFx1MzAwMFxcdTIwMjhcXHUyMDI5XSopKykvaWcsXG4gICAgICAgIHBhdGhWYWx1ZXMgPSAvKC0/XFxkKlxcLj9cXGQqKD86ZVtcXC0rXT9cXGQrKT8pW1xceDA5XFx4MGFcXHgwYlxceDBjXFx4MGRcXHgyMFxceGEwXFx1MTY4MFxcdTE4MGVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwYVxcdTIwMmZcXHUyMDVmXFx1MzAwMFxcdTIwMjhcXHUyMDI5XSosP1tcXHgwOVxceDBhXFx4MGJcXHgwY1xceDBkXFx4MjBcXHhhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDJmXFx1MjA1ZlxcdTMwMDBcXHUyMDI4XFx1MjAyOV0qL2lnLFxuICAgICAgICByYWRpYWxfZ3JhZGllbnQgPSBSLl9yYWRpYWxfZ3JhZGllbnQgPSAvXnIoPzpcXCgoW14sXSs/KVtcXHgwOVxceDBhXFx4MGJcXHgwY1xceDBkXFx4MjBcXHhhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDJmXFx1MjA1ZlxcdTMwMDBcXHUyMDI4XFx1MjAyOV0qLFtcXHgwOVxceDBhXFx4MGJcXHgwY1xceDBkXFx4MjBcXHhhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDJmXFx1MjA1ZlxcdTMwMDBcXHUyMDI4XFx1MjAyOV0qKFteXFwpXSs/KVxcKSk/LyxcbiAgICAgICAgZWxkYXRhID0ge30sXG4gICAgICAgIHNvcnRCeUtleSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5rZXkgLSBiLmtleTtcbiAgICAgICAgfSxcbiAgICAgICAgc29ydEJ5TnVtYmVyID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiB0b0Zsb2F0KGEpIC0gdG9GbG9hdChiKTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuID0gZnVuY3Rpb24gKCkge30sXG4gICAgICAgIHBpcGUgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgIH0sXG4gICAgICAgIHJlY3RQYXRoID0gUi5fcmVjdFBhdGggPSBmdW5jdGlvbiAoeCwgeSwgdywgaCwgcikge1xuICAgICAgICAgICAgaWYgKHIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1tcIk1cIiwgeCArIHIsIHldLCBbXCJsXCIsIHcgLSByICogMiwgMF0sIFtcImFcIiwgciwgciwgMCwgMCwgMSwgciwgcl0sIFtcImxcIiwgMCwgaCAtIHIgKiAyXSwgW1wiYVwiLCByLCByLCAwLCAwLCAxLCAtciwgcl0sIFtcImxcIiwgciAqIDIgLSB3LCAwXSwgW1wiYVwiLCByLCByLCAwLCAwLCAxLCAtciwgLXJdLCBbXCJsXCIsIDAsIHIgKiAyIC0gaF0sIFtcImFcIiwgciwgciwgMCwgMCwgMSwgciwgLXJdLCBbXCJ6XCJdXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBbW1wiTVwiLCB4LCB5XSwgW1wibFwiLCB3LCAwXSwgW1wibFwiLCAwLCBoXSwgW1wibFwiLCAtdywgMF0sIFtcInpcIl1dO1xuICAgICAgICB9LFxuICAgICAgICBlbGxpcHNlUGF0aCA9IGZ1bmN0aW9uICh4LCB5LCByeCwgcnkpIHtcbiAgICAgICAgICAgIGlmIChyeSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcnkgPSByeDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBbW1wiTVwiLCB4LCB5XSwgW1wibVwiLCAwLCAtcnldLCBbXCJhXCIsIHJ4LCByeSwgMCwgMSwgMSwgMCwgMiAqIHJ5XSwgW1wiYVwiLCByeCwgcnksIDAsIDEsIDEsIDAsIC0yICogcnldLCBbXCJ6XCJdXTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0UGF0aCA9IFIuX2dldFBhdGggPSB7XG4gICAgICAgICAgICBwYXRoOiBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWwuYXR0cihcInBhdGhcIik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2lyY2xlOiBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgYSA9IGVsLmF0dHJzO1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGxpcHNlUGF0aChhLmN4LCBhLmN5LCBhLnIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVsbGlwc2U6IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgIHZhciBhID0gZWwuYXR0cnM7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsbGlwc2VQYXRoKGEuY3gsIGEuY3ksIGEucngsIGEucnkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlY3Q6IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgIHZhciBhID0gZWwuYXR0cnM7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY3RQYXRoKGEueCwgYS55LCBhLndpZHRoLCBhLmhlaWdodCwgYS5yKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpbWFnZTogZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGEgPSBlbC5hdHRycztcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjdFBhdGgoYS54LCBhLnksIGEud2lkdGgsIGEuaGVpZ2h0KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZXh0OiBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgYmJveCA9IGVsLl9nZXRCQm94KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY3RQYXRoKGJib3gueCwgYmJveC55LCBiYm94LndpZHRoLCBiYm94LmhlaWdodCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0IDogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgYmJveCA9IGVsLl9nZXRCQm94KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY3RQYXRoKGJib3gueCwgYmJveC55LCBiYm94LndpZHRoLCBiYm94LmhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qXFxcbiAgICAgICAgICogUmFwaGFlbC5tYXBQYXRoXG4gICAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBUcmFuc2Zvcm0gdGhlIHBhdGggc3RyaW5nIHdpdGggZ2l2ZW4gbWF0cml4LlxuICAgICAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICAgICAtIHBhdGggKHN0cmluZykgcGF0aCBzdHJpbmdcbiAgICAgICAgIC0gbWF0cml4IChvYmplY3QpIHNlZSBATWF0cml4XG4gICAgICAgICA9IChzdHJpbmcpIHRyYW5zZm9ybWVkIHBhdGggc3RyaW5nXG4gICAgICAgIFxcKi9cbiAgICAgICAgbWFwUGF0aCA9IFIubWFwUGF0aCA9IGZ1bmN0aW9uIChwYXRoLCBtYXRyaXgpIHtcbiAgICAgICAgICAgIGlmICghbWF0cml4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgeCwgeSwgaSwgaiwgaWksIGpqLCBwYXRoaTtcbiAgICAgICAgICAgIHBhdGggPSBwYXRoMmN1cnZlKHBhdGgpO1xuICAgICAgICAgICAgZm9yIChpID0gMCwgaWkgPSBwYXRoLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwYXRoaSA9IHBhdGhbaV07XG4gICAgICAgICAgICAgICAgZm9yIChqID0gMSwgamogPSBwYXRoaS5sZW5ndGg7IGogPCBqajsgaiArPSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHggPSBtYXRyaXgueChwYXRoaVtqXSwgcGF0aGlbaiArIDFdKTtcbiAgICAgICAgICAgICAgICAgICAgeSA9IG1hdHJpeC55KHBhdGhpW2pdLCBwYXRoaVtqICsgMV0pO1xuICAgICAgICAgICAgICAgICAgICBwYXRoaVtqXSA9IHg7XG4gICAgICAgICAgICAgICAgICAgIHBhdGhpW2ogKyAxXSA9IHk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgICAgIH07XG5cbiAgICBSLl9nID0gZztcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC50eXBlXG4gICAgIFsgcHJvcGVydHkgKHN0cmluZykgXVxuICAgICAqKlxuICAgICAqIENhbiBiZSDigJxTVkfigJ0sIOKAnFZNTOKAnSBvciBlbXB0eSwgZGVwZW5kaW5nIG9uIGJyb3dzZXIgc3VwcG9ydC5cbiAgICBcXCovXG4gICAgUi50eXBlID0gKGcud2luLlNWR0FuZ2xlIHx8IGcuZG9jLmltcGxlbWVudGF0aW9uLmhhc0ZlYXR1cmUoXCJodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcxMS9mZWF0dXJlI0Jhc2ljU3RydWN0dXJlXCIsIFwiMS4xXCIpID8gXCJTVkdcIiA6IFwiVk1MXCIpO1xuICAgIGlmIChSLnR5cGUgPT0gXCJWTUxcIikge1xuICAgICAgICB2YXIgZCA9IGcuZG9jLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksXG4gICAgICAgICAgICBiO1xuICAgICAgICBkLmlubmVySFRNTCA9ICc8djpzaGFwZSBhZGo9XCIxXCIvPic7XG4gICAgICAgIGIgPSBkLmZpcnN0Q2hpbGQ7XG4gICAgICAgIGIuc3R5bGUuYmVoYXZpb3IgPSBcInVybCgjZGVmYXVsdCNWTUwpXCI7XG4gICAgICAgIGlmICghKGIgJiYgdHlwZW9mIGIuYWRqID09IFwib2JqZWN0XCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gKFIudHlwZSA9IEUpO1xuICAgICAgICB9XG4gICAgICAgIGQgPSBudWxsO1xuICAgIH1cbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5zdmdcbiAgICAgWyBwcm9wZXJ0eSAoYm9vbGVhbikgXVxuICAgICAqKlxuICAgICAqIGB0cnVlYCBpZiBicm93c2VyIHN1cHBvcnRzIFNWRy5cbiAgICBcXCovXG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwudm1sXG4gICAgIFsgcHJvcGVydHkgKGJvb2xlYW4pIF1cbiAgICAgKipcbiAgICAgKiBgdHJ1ZWAgaWYgYnJvd3NlciBzdXBwb3J0cyBWTUwuXG4gICAgXFwqL1xuICAgIFIuc3ZnID0gIShSLnZtbCA9IFIudHlwZSA9PSBcIlZNTFwiKTtcbiAgICBSLl9QYXBlciA9IFBhcGVyO1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmZuXG4gICAgIFsgcHJvcGVydHkgKG9iamVjdCkgXVxuICAgICAqKlxuICAgICAqIFlvdSBjYW4gYWRkIHlvdXIgb3duIG1ldGhvZCB0byB0aGUgY2FudmFzLiBGb3IgZXhhbXBsZSBpZiB5b3Ugd2FudCB0byBkcmF3IGEgcGllIGNoYXJ0LFxuICAgICAqIHlvdSBjYW4gY3JlYXRlIHlvdXIgb3duIHBpZSBjaGFydCBmdW5jdGlvbiBhbmQgc2hpcCBpdCBhcyBhIFJhcGhhw6tsIHBsdWdpbi4gVG8gZG8gdGhpc1xuICAgICAqIHlvdSBuZWVkIHRvIGV4dGVuZCB0aGUgYFJhcGhhZWwuZm5gIG9iamVjdC4gWW91IHNob3VsZCBtb2RpZnkgdGhlIGBmbmAgb2JqZWN0IGJlZm9yZSBhXG4gICAgICogUmFwaGHDq2wgaW5zdGFuY2UgaXMgY3JlYXRlZCwgb3RoZXJ3aXNlIGl0IHdpbGwgdGFrZSBubyBlZmZlY3QuIFBsZWFzZSBub3RlIHRoYXQgdGhlXG4gICAgICogYWJpbGl0eSBmb3IgbmFtZXNwYWNlZCBwbHVnaW5zIHdhcyByZW1vdmVkIGluIFJhcGhhZWwgMi4wLiBJdCBpcyB1cCB0byB0aGUgcGx1Z2luIHRvXG4gICAgICogZW5zdXJlIGFueSBuYW1lc3BhY2luZyBlbnN1cmVzIHByb3BlciBjb250ZXh0LlxuICAgICA+IFVzYWdlXG4gICAgIHwgUmFwaGFlbC5mbi5hcnJvdyA9IGZ1bmN0aW9uICh4MSwgeTEsIHgyLCB5Miwgc2l6ZSkge1xuICAgICB8ICAgICByZXR1cm4gdGhpcy5wYXRoKCAuLi4gKTtcbiAgICAgfCB9O1xuICAgICB8IC8vIG9yIGNyZWF0ZSBuYW1lc3BhY2VcbiAgICAgfCBSYXBoYWVsLmZuLm15c3R1ZmYgPSB7XG4gICAgIHwgICAgIGFycm93OiBmdW5jdGlvbiAoKSB74oCmfSxcbiAgICAgfCAgICAgc3RhcjogZnVuY3Rpb24gKCkge+KApn0sXG4gICAgIHwgICAgIC8vIGV0Y+KAplxuICAgICB8IH07XG4gICAgIHwgdmFyIHBhcGVyID0gUmFwaGFlbCgxMCwgMTAsIDYzMCwgNDgwKTtcbiAgICAgfCAvLyB0aGVuIHVzZSBpdFxuICAgICB8IHBhcGVyLmFycm93KDEwLCAxMCwgMzAsIDMwLCA1KS5hdHRyKHtmaWxsOiBcIiNmMDBcIn0pO1xuICAgICB8IHBhcGVyLm15c3R1ZmYuYXJyb3coKTtcbiAgICAgfCBwYXBlci5teXN0dWZmLnN0YXIoKTtcbiAgICBcXCovXG4gICAgUi5mbiA9IHBhcGVycHJvdG8gPSBQYXBlci5wcm90b3R5cGUgPSBSLnByb3RvdHlwZTtcbiAgICBSLl9pZCA9IDA7XG4gICAgUi5fb2lkID0gMDtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5pc1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogSGFuZGZ1bGwgcmVwbGFjZW1lbnQgZm9yIGB0eXBlb2ZgIG9wZXJhdG9yLlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBvICjigKYpIGFueSBvYmplY3Qgb3IgcHJpbWl0aXZlXG4gICAgIC0gdHlwZSAoc3RyaW5nKSBuYW1lIG9mIHRoZSB0eXBlLCBpLmUuIOKAnHN0cmluZ+KAnSwg4oCcZnVuY3Rpb27igJ0sIOKAnG51bWJlcuKAnSwgZXRjLlxuICAgICA9IChib29sZWFuKSBpcyBnaXZlbiB2YWx1ZSBpcyBvZiBnaXZlbiB0eXBlXG4gICAgXFwqL1xuICAgIFIuaXMgPSBmdW5jdGlvbiAobywgdHlwZSkge1xuICAgICAgICB0eXBlID0gbG93ZXJDYXNlLmNhbGwodHlwZSk7XG4gICAgICAgIGlmICh0eXBlID09IFwiZmluaXRlXCIpIHtcbiAgICAgICAgICAgIHJldHVybiAhaXNuYW5baGFzXSgrbyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT0gXCJhcnJheVwiKSB7XG4gICAgICAgICAgICByZXR1cm4gbyBpbnN0YW5jZW9mIEFycmF5O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAgKHR5cGUgPT0gXCJudWxsXCIgJiYgbyA9PT0gbnVsbCkgfHxcbiAgICAgICAgICAgICAgICAodHlwZSA9PSB0eXBlb2YgbyAmJiBvICE9PSBudWxsKSB8fFxuICAgICAgICAgICAgICAgICh0eXBlID09IFwib2JqZWN0XCIgJiYgbyA9PT0gT2JqZWN0KG8pKSB8fFxuICAgICAgICAgICAgICAgICh0eXBlID09IFwiYXJyYXlcIiAmJiBBcnJheS5pc0FycmF5ICYmIEFycmF5LmlzQXJyYXkobykpIHx8XG4gICAgICAgICAgICAgICAgb2JqZWN0VG9TdHJpbmcuY2FsbChvKS5zbGljZSg4LCAtMSkudG9Mb3dlckNhc2UoKSA9PSB0eXBlO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBjbG9uZShvYmopIHtcbiAgICAgICAgaWYgKE9iamVjdChvYmopICE9PSBvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlcyA9IG5ldyBvYmouY29uc3RydWN0b3I7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChvYmpbaGFzXShrZXkpKSB7XG4gICAgICAgICAgICByZXNba2V5XSA9IGNsb25lKG9ialtrZXldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmFuZ2xlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIGFuZ2xlIGJldHdlZW4gdHdvIG9yIHRocmVlIHBvaW50c1xuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSB4MSAobnVtYmVyKSB4IGNvb3JkIG9mIGZpcnN0IHBvaW50XG4gICAgIC0geTEgKG51bWJlcikgeSBjb29yZCBvZiBmaXJzdCBwb2ludFxuICAgICAtIHgyIChudW1iZXIpIHggY29vcmQgb2Ygc2Vjb25kIHBvaW50XG4gICAgIC0geTIgKG51bWJlcikgeSBjb29yZCBvZiBzZWNvbmQgcG9pbnRcbiAgICAgLSB4MyAobnVtYmVyKSAjb3B0aW9uYWwgeCBjb29yZCBvZiB0aGlyZCBwb2ludFxuICAgICAtIHkzIChudW1iZXIpICNvcHRpb25hbCB5IGNvb3JkIG9mIHRoaXJkIHBvaW50XG4gICAgID0gKG51bWJlcikgYW5nbGUgaW4gZGVncmVlcy5cbiAgICBcXCovXG4gICAgUi5hbmdsZSA9IGZ1bmN0aW9uICh4MSwgeTEsIHgyLCB5MiwgeDMsIHkzKSB7XG4gICAgICAgIGlmICh4MyA9PSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgeCA9IHgxIC0geDIsXG4gICAgICAgICAgICAgICAgeSA9IHkxIC0geTI7XG4gICAgICAgICAgICBpZiAoIXggJiYgIXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAoMTgwICsgbWF0aC5hdGFuMigteSwgLXgpICogMTgwIC8gUEkgKyAzNjApICUgMzYwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFIuYW5nbGUoeDEsIHkxLCB4MywgeTMpIC0gUi5hbmdsZSh4MiwgeTIsIHgzLCB5Myk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLnJhZFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVHJhbnNmb3JtIGFuZ2xlIHRvIHJhZGlhbnNcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gZGVnIChudW1iZXIpIGFuZ2xlIGluIGRlZ3JlZXNcbiAgICAgPSAobnVtYmVyKSBhbmdsZSBpbiByYWRpYW5zLlxuICAgIFxcKi9cbiAgICBSLnJhZCA9IGZ1bmN0aW9uIChkZWcpIHtcbiAgICAgICAgcmV0dXJuIGRlZyAlIDM2MCAqIFBJIC8gMTgwO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuZGVnXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBUcmFuc2Zvcm0gYW5nbGUgdG8gZGVncmVlc1xuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBkZWcgKG51bWJlcikgYW5nbGUgaW4gcmFkaWFuc1xuICAgICA9IChudW1iZXIpIGFuZ2xlIGluIGRlZ3JlZXMuXG4gICAgXFwqL1xuICAgIFIuZGVnID0gZnVuY3Rpb24gKHJhZCkge1xuICAgICAgICByZXR1cm4gcmFkICogMTgwIC8gUEkgJSAzNjA7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5zbmFwVG9cbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFNuYXBzIGdpdmVuIHZhbHVlIHRvIGdpdmVuIGdyaWQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIHZhbHVlcyAoYXJyYXl8bnVtYmVyKSBnaXZlbiBhcnJheSBvZiB2YWx1ZXMgb3Igc3RlcCBvZiB0aGUgZ3JpZFxuICAgICAtIHZhbHVlIChudW1iZXIpIHZhbHVlIHRvIGFkanVzdFxuICAgICAtIHRvbGVyYW5jZSAobnVtYmVyKSAjb3B0aW9uYWwgdG9sZXJhbmNlIGZvciBzbmFwcGluZy4gRGVmYXVsdCBpcyBgMTBgLlxuICAgICA9IChudW1iZXIpIGFkanVzdGVkIHZhbHVlLlxuICAgIFxcKi9cbiAgICBSLnNuYXBUbyA9IGZ1bmN0aW9uICh2YWx1ZXMsIHZhbHVlLCB0b2xlcmFuY2UpIHtcbiAgICAgICAgdG9sZXJhbmNlID0gUi5pcyh0b2xlcmFuY2UsIFwiZmluaXRlXCIpID8gdG9sZXJhbmNlIDogMTA7XG4gICAgICAgIGlmIChSLmlzKHZhbHVlcywgYXJyYXkpKSB7XG4gICAgICAgICAgICB2YXIgaSA9IHZhbHVlcy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSAoaS0tKSBpZiAoYWJzKHZhbHVlc1tpXSAtIHZhbHVlKSA8PSB0b2xlcmFuY2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFsdWVzID0gK3ZhbHVlcztcbiAgICAgICAgICAgIHZhciByZW0gPSB2YWx1ZSAlIHZhbHVlcztcbiAgICAgICAgICAgIGlmIChyZW0gPCB0b2xlcmFuY2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgLSByZW07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVtID4gdmFsdWVzIC0gdG9sZXJhbmNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlIC0gcmVtICsgdmFsdWVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICAgIFxuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmNyZWF0ZVVVSURcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgUkZDNDEyMiwgdmVyc2lvbiA0IElEXG4gICAgXFwqL1xuICAgIHZhciBjcmVhdGVVVUlEID0gUi5jcmVhdGVVVUlEID0gKGZ1bmN0aW9uICh1dWlkUmVnRXgsIHV1aWRSZXBsYWNlcikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIFwieHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4XCIucmVwbGFjZSh1dWlkUmVnRXgsIHV1aWRSZXBsYWNlcikudG9VcHBlckNhc2UoKTtcbiAgICAgICAgfTtcbiAgICB9KSgvW3h5XS9nLCBmdW5jdGlvbiAoYykge1xuICAgICAgICB2YXIgciA9IG1hdGgucmFuZG9tKCkgKiAxNiB8IDAsXG4gICAgICAgICAgICB2ID0gYyA9PSBcInhcIiA/IHIgOiAociAmIDMgfCA4KTtcbiAgICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xuXG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuc2V0V2luZG93XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBVc2VkIHdoZW4geW91IG5lZWQgdG8gZHJhdyBpbiBgJmx0O2lmcmFtZT5gLiBTd2l0Y2hlZCB3aW5kb3cgdG8gdGhlIGlmcmFtZSBvbmUuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIG5ld3dpbiAod2luZG93KSBuZXcgd2luZG93IG9iamVjdFxuICAgIFxcKi9cbiAgICBSLnNldFdpbmRvdyA9IGZ1bmN0aW9uIChuZXd3aW4pIHtcbiAgICAgICAgZXZlKFwicmFwaGFlbC5zZXRXaW5kb3dcIiwgUiwgZy53aW4sIG5ld3dpbik7XG4gICAgICAgIGcud2luID0gbmV3d2luO1xuICAgICAgICBnLmRvYyA9IGcud2luLmRvY3VtZW50O1xuICAgICAgICBpZiAoUi5fZW5naW5lLmluaXRXaW4pIHtcbiAgICAgICAgICAgIFIuX2VuZ2luZS5pbml0V2luKGcud2luKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdmFyIHRvSGV4ID0gZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgICAgIGlmIChSLnZtbCkge1xuICAgICAgICAgICAgLy8gaHR0cDovL2RlYW4uZWR3YXJkcy5uYW1lL3dlYmxvZy8yMDA5LzEwL2NvbnZlcnQtYW55LWNvbG91ci12YWx1ZS10by1oZXgtaW4tbXNpZS9cbiAgICAgICAgICAgIHZhciB0cmltID0gL15cXHMrfFxccyskL2c7XG4gICAgICAgICAgICB2YXIgYm9kO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgZG9jdW0gPSBuZXcgQWN0aXZlWE9iamVjdChcImh0bWxmaWxlXCIpO1xuICAgICAgICAgICAgICAgIGRvY3VtLndyaXRlKFwiPGJvZHk+XCIpO1xuICAgICAgICAgICAgICAgIGRvY3VtLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgYm9kID0gZG9jdW0uYm9keTtcbiAgICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgICAgIGJvZCA9IGNyZWF0ZVBvcHVwKCkuZG9jdW1lbnQuYm9keTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciByYW5nZSA9IGJvZC5jcmVhdGVUZXh0UmFuZ2UoKTtcbiAgICAgICAgICAgIHRvSGV4ID0gY2FjaGVyKGZ1bmN0aW9uIChjb2xvcikge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGJvZC5zdHlsZS5jb2xvciA9IFN0cihjb2xvcikucmVwbGFjZSh0cmltLCBFKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gcmFuZ2UucXVlcnlDb21tYW5kVmFsdWUoXCJGb3JlQ29sb3JcIik7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gKCh2YWx1ZSAmIDI1NSkgPDwgMTYpIHwgKHZhbHVlICYgNjUyODApIHwgKCh2YWx1ZSAmIDE2NzExNjgwKSA+Pj4gMTYpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCIjXCIgKyAoXCIwMDAwMDBcIiArIHZhbHVlLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTYpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJub25lXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgaSA9IGcuZG9jLmNyZWF0ZUVsZW1lbnQoXCJpXCIpO1xuICAgICAgICAgICAgaS50aXRsZSA9IFwiUmFwaGFcXHhlYmwgQ29sb3VyIFBpY2tlclwiO1xuICAgICAgICAgICAgaS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICBnLmRvYy5ib2R5LmFwcGVuZENoaWxkKGkpO1xuICAgICAgICAgICAgdG9IZXggPSBjYWNoZXIoZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgICAgICAgICAgICAgaS5zdHlsZS5jb2xvciA9IGNvbG9yO1xuICAgICAgICAgICAgICAgIHJldHVybiBnLmRvYy5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKGksIEUpLmdldFByb3BlcnR5VmFsdWUoXCJjb2xvclwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b0hleChjb2xvcik7XG4gICAgfSxcbiAgICBoc2J0b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFwiaHNiKFwiICsgW3RoaXMuaCwgdGhpcy5zLCB0aGlzLmJdICsgXCIpXCI7XG4gICAgfSxcbiAgICBoc2x0b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFwiaHNsKFwiICsgW3RoaXMuaCwgdGhpcy5zLCB0aGlzLmxdICsgXCIpXCI7XG4gICAgfSxcbiAgICByZ2J0b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGV4O1xuICAgIH0sXG4gICAgcHJlcGFyZVJHQiA9IGZ1bmN0aW9uIChyLCBnLCBiKSB7XG4gICAgICAgIGlmIChnID09IG51bGwgJiYgUi5pcyhyLCBcIm9iamVjdFwiKSAmJiBcInJcIiBpbiByICYmIFwiZ1wiIGluIHIgJiYgXCJiXCIgaW4gcikge1xuICAgICAgICAgICAgYiA9IHIuYjtcbiAgICAgICAgICAgIGcgPSByLmc7XG4gICAgICAgICAgICByID0gci5yO1xuICAgICAgICB9XG4gICAgICAgIGlmIChnID09IG51bGwgJiYgUi5pcyhyLCBzdHJpbmcpKSB7XG4gICAgICAgICAgICB2YXIgY2xyID0gUi5nZXRSR0Iocik7XG4gICAgICAgICAgICByID0gY2xyLnI7XG4gICAgICAgICAgICBnID0gY2xyLmc7XG4gICAgICAgICAgICBiID0gY2xyLmI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHIgPiAxIHx8IGcgPiAxIHx8IGIgPiAxKSB7XG4gICAgICAgICAgICByIC89IDI1NTtcbiAgICAgICAgICAgIGcgLz0gMjU1O1xuICAgICAgICAgICAgYiAvPSAyNTU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBbciwgZywgYl07XG4gICAgfSxcbiAgICBwYWNrYWdlUkdCID0gZnVuY3Rpb24gKHIsIGcsIGIsIG8pIHtcbiAgICAgICAgciAqPSAyNTU7XG4gICAgICAgIGcgKj0gMjU1O1xuICAgICAgICBiICo9IDI1NTtcbiAgICAgICAgdmFyIHJnYiA9IHtcbiAgICAgICAgICAgIHI6IHIsXG4gICAgICAgICAgICBnOiBnLFxuICAgICAgICAgICAgYjogYixcbiAgICAgICAgICAgIGhleDogUi5yZ2IociwgZywgYiksXG4gICAgICAgICAgICB0b1N0cmluZzogcmdidG9TdHJpbmdcbiAgICAgICAgfTtcbiAgICAgICAgUi5pcyhvLCBcImZpbml0ZVwiKSAmJiAocmdiLm9wYWNpdHkgPSBvKTtcbiAgICAgICAgcmV0dXJuIHJnYjtcbiAgICB9O1xuICAgIFxuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmNvbG9yXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBQYXJzZXMgdGhlIGNvbG9yIHN0cmluZyBhbmQgcmV0dXJucyBvYmplY3Qgd2l0aCBhbGwgdmFsdWVzIGZvciB0aGUgZ2l2ZW4gY29sb3IuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGNsciAoc3RyaW5nKSBjb2xvciBzdHJpbmcgaW4gb25lIG9mIHRoZSBzdXBwb3J0ZWQgZm9ybWF0cyAoc2VlIEBSYXBoYWVsLmdldFJHQilcbiAgICAgPSAob2JqZWN0KSBDb21iaW5lZCBSR0IgJiBIU0Igb2JqZWN0IGluIGZvcm1hdDpcbiAgICAgbyB7XG4gICAgIG8gICAgIHIgKG51bWJlcikgcmVkLFxuICAgICBvICAgICBnIChudW1iZXIpIGdyZWVuLFxuICAgICBvICAgICBiIChudW1iZXIpIGJsdWUsXG4gICAgIG8gICAgIGhleCAoc3RyaW5nKSBjb2xvciBpbiBIVE1ML0NTUyBmb3JtYXQ6ICPigKLigKLigKLigKLigKLigKIsXG4gICAgIG8gICAgIGVycm9yIChib29sZWFuKSBgdHJ1ZWAgaWYgc3RyaW5nIGNhbuKAmXQgYmUgcGFyc2VkLFxuICAgICBvICAgICBoIChudW1iZXIpIGh1ZSxcbiAgICAgbyAgICAgcyAobnVtYmVyKSBzYXR1cmF0aW9uLFxuICAgICBvICAgICB2IChudW1iZXIpIHZhbHVlIChicmlnaHRuZXNzKSxcbiAgICAgbyAgICAgbCAobnVtYmVyKSBsaWdodG5lc3NcbiAgICAgbyB9XG4gICAgXFwqL1xuICAgIFIuY29sb3IgPSBmdW5jdGlvbiAoY2xyKSB7XG4gICAgICAgIHZhciByZ2I7XG4gICAgICAgIGlmIChSLmlzKGNsciwgXCJvYmplY3RcIikgJiYgXCJoXCIgaW4gY2xyICYmIFwic1wiIGluIGNsciAmJiBcImJcIiBpbiBjbHIpIHtcbiAgICAgICAgICAgIHJnYiA9IFIuaHNiMnJnYihjbHIpO1xuICAgICAgICAgICAgY2xyLnIgPSByZ2IucjtcbiAgICAgICAgICAgIGNsci5nID0gcmdiLmc7XG4gICAgICAgICAgICBjbHIuYiA9IHJnYi5iO1xuICAgICAgICAgICAgY2xyLmhleCA9IHJnYi5oZXg7XG4gICAgICAgIH0gZWxzZSBpZiAoUi5pcyhjbHIsIFwib2JqZWN0XCIpICYmIFwiaFwiIGluIGNsciAmJiBcInNcIiBpbiBjbHIgJiYgXCJsXCIgaW4gY2xyKSB7XG4gICAgICAgICAgICByZ2IgPSBSLmhzbDJyZ2IoY2xyKTtcbiAgICAgICAgICAgIGNsci5yID0gcmdiLnI7XG4gICAgICAgICAgICBjbHIuZyA9IHJnYi5nO1xuICAgICAgICAgICAgY2xyLmIgPSByZ2IuYjtcbiAgICAgICAgICAgIGNsci5oZXggPSByZ2IuaGV4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKFIuaXMoY2xyLCBcInN0cmluZ1wiKSkge1xuICAgICAgICAgICAgICAgIGNsciA9IFIuZ2V0UkdCKGNscik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoUi5pcyhjbHIsIFwib2JqZWN0XCIpICYmIFwiclwiIGluIGNsciAmJiBcImdcIiBpbiBjbHIgJiYgXCJiXCIgaW4gY2xyKSB7XG4gICAgICAgICAgICAgICAgcmdiID0gUi5yZ2IyaHNsKGNscik7XG4gICAgICAgICAgICAgICAgY2xyLmggPSByZ2IuaDtcbiAgICAgICAgICAgICAgICBjbHIucyA9IHJnYi5zO1xuICAgICAgICAgICAgICAgIGNsci5sID0gcmdiLmw7XG4gICAgICAgICAgICAgICAgcmdiID0gUi5yZ2IyaHNiKGNscik7XG4gICAgICAgICAgICAgICAgY2xyLnYgPSByZ2IuYjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2xyID0ge2hleDogXCJub25lXCJ9O1xuICAgICAgICAgICAgICAgIGNsci5yID0gY2xyLmcgPSBjbHIuYiA9IGNsci5oID0gY2xyLnMgPSBjbHIudiA9IGNsci5sID0gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2xyLnRvU3RyaW5nID0gcmdidG9TdHJpbmc7XG4gICAgICAgIHJldHVybiBjbHI7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5oc2IycmdiXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDb252ZXJ0cyBIU0IgdmFsdWVzIHRvIFJHQiBvYmplY3QuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGggKG51bWJlcikgaHVlXG4gICAgIC0gcyAobnVtYmVyKSBzYXR1cmF0aW9uXG4gICAgIC0gdiAobnVtYmVyKSB2YWx1ZSBvciBicmlnaHRuZXNzXG4gICAgID0gKG9iamVjdCkgUkdCIG9iamVjdCBpbiBmb3JtYXQ6XG4gICAgIG8ge1xuICAgICBvICAgICByIChudW1iZXIpIHJlZCxcbiAgICAgbyAgICAgZyAobnVtYmVyKSBncmVlbixcbiAgICAgbyAgICAgYiAobnVtYmVyKSBibHVlLFxuICAgICBvICAgICBoZXggKHN0cmluZykgY29sb3IgaW4gSFRNTC9DU1MgZm9ybWF0OiAj4oCi4oCi4oCi4oCi4oCi4oCiXG4gICAgIG8gfVxuICAgIFxcKi9cbiAgICBSLmhzYjJyZ2IgPSBmdW5jdGlvbiAoaCwgcywgdiwgbykge1xuICAgICAgICBpZiAodGhpcy5pcyhoLCBcIm9iamVjdFwiKSAmJiBcImhcIiBpbiBoICYmIFwic1wiIGluIGggJiYgXCJiXCIgaW4gaCkge1xuICAgICAgICAgICAgdiA9IGguYjtcbiAgICAgICAgICAgIHMgPSBoLnM7XG4gICAgICAgICAgICBoID0gaC5oO1xuICAgICAgICAgICAgbyA9IGgubztcbiAgICAgICAgfVxuICAgICAgICBoICo9IDM2MDtcbiAgICAgICAgdmFyIFIsIEcsIEIsIFgsIEM7XG4gICAgICAgIGggPSAoaCAlIDM2MCkgLyA2MDtcbiAgICAgICAgQyA9IHYgKiBzO1xuICAgICAgICBYID0gQyAqICgxIC0gYWJzKGggJSAyIC0gMSkpO1xuICAgICAgICBSID0gRyA9IEIgPSB2IC0gQztcblxuICAgICAgICBoID0gfn5oO1xuICAgICAgICBSICs9IFtDLCBYLCAwLCAwLCBYLCBDXVtoXTtcbiAgICAgICAgRyArPSBbWCwgQywgQywgWCwgMCwgMF1baF07XG4gICAgICAgIEIgKz0gWzAsIDAsIFgsIEMsIEMsIFhdW2hdO1xuICAgICAgICByZXR1cm4gcGFja2FnZVJHQihSLCBHLCBCLCBvKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmhzbDJyZ2JcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENvbnZlcnRzIEhTTCB2YWx1ZXMgdG8gUkdCIG9iamVjdC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaCAobnVtYmVyKSBodWVcbiAgICAgLSBzIChudW1iZXIpIHNhdHVyYXRpb25cbiAgICAgLSBsIChudW1iZXIpIGx1bWlub3NpdHlcbiAgICAgPSAob2JqZWN0KSBSR0Igb2JqZWN0IGluIGZvcm1hdDpcbiAgICAgbyB7XG4gICAgIG8gICAgIHIgKG51bWJlcikgcmVkLFxuICAgICBvICAgICBnIChudW1iZXIpIGdyZWVuLFxuICAgICBvICAgICBiIChudW1iZXIpIGJsdWUsXG4gICAgIG8gICAgIGhleCAoc3RyaW5nKSBjb2xvciBpbiBIVE1ML0NTUyBmb3JtYXQ6ICPigKLigKLigKLigKLigKLigKJcbiAgICAgbyB9XG4gICAgXFwqL1xuICAgIFIuaHNsMnJnYiA9IGZ1bmN0aW9uIChoLCBzLCBsLCBvKSB7XG4gICAgICAgIGlmICh0aGlzLmlzKGgsIFwib2JqZWN0XCIpICYmIFwiaFwiIGluIGggJiYgXCJzXCIgaW4gaCAmJiBcImxcIiBpbiBoKSB7XG4gICAgICAgICAgICBsID0gaC5sO1xuICAgICAgICAgICAgcyA9IGgucztcbiAgICAgICAgICAgIGggPSBoLmg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGggPiAxIHx8IHMgPiAxIHx8IGwgPiAxKSB7XG4gICAgICAgICAgICBoIC89IDM2MDtcbiAgICAgICAgICAgIHMgLz0gMTAwO1xuICAgICAgICAgICAgbCAvPSAxMDA7XG4gICAgICAgIH1cbiAgICAgICAgaCAqPSAzNjA7XG4gICAgICAgIHZhciBSLCBHLCBCLCBYLCBDO1xuICAgICAgICBoID0gKGggJSAzNjApIC8gNjA7XG4gICAgICAgIEMgPSAyICogcyAqIChsIDwgLjUgPyBsIDogMSAtIGwpO1xuICAgICAgICBYID0gQyAqICgxIC0gYWJzKGggJSAyIC0gMSkpO1xuICAgICAgICBSID0gRyA9IEIgPSBsIC0gQyAvIDI7XG5cbiAgICAgICAgaCA9IH5+aDtcbiAgICAgICAgUiArPSBbQywgWCwgMCwgMCwgWCwgQ11baF07XG4gICAgICAgIEcgKz0gW1gsIEMsIEMsIFgsIDAsIDBdW2hdO1xuICAgICAgICBCICs9IFswLCAwLCBYLCBDLCBDLCBYXVtoXTtcbiAgICAgICAgcmV0dXJuIHBhY2thZ2VSR0IoUiwgRywgQiwgbyk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5yZ2IyaHNiXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDb252ZXJ0cyBSR0IgdmFsdWVzIHRvIEhTQiBvYmplY3QuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIHIgKG51bWJlcikgcmVkXG4gICAgIC0gZyAobnVtYmVyKSBncmVlblxuICAgICAtIGIgKG51bWJlcikgYmx1ZVxuICAgICA9IChvYmplY3QpIEhTQiBvYmplY3QgaW4gZm9ybWF0OlxuICAgICBvIHtcbiAgICAgbyAgICAgaCAobnVtYmVyKSBodWVcbiAgICAgbyAgICAgcyAobnVtYmVyKSBzYXR1cmF0aW9uXG4gICAgIG8gICAgIGIgKG51bWJlcikgYnJpZ2h0bmVzc1xuICAgICBvIH1cbiAgICBcXCovXG4gICAgUi5yZ2IyaHNiID0gZnVuY3Rpb24gKHIsIGcsIGIpIHtcbiAgICAgICAgYiA9IHByZXBhcmVSR0IociwgZywgYik7XG4gICAgICAgIHIgPSBiWzBdO1xuICAgICAgICBnID0gYlsxXTtcbiAgICAgICAgYiA9IGJbMl07XG5cbiAgICAgICAgdmFyIEgsIFMsIFYsIEM7XG4gICAgICAgIFYgPSBtbWF4KHIsIGcsIGIpO1xuICAgICAgICBDID0gViAtIG1taW4ociwgZywgYik7XG4gICAgICAgIEggPSAoQyA9PSAwID8gbnVsbCA6XG4gICAgICAgICAgICAgViA9PSByID8gKGcgLSBiKSAvIEMgOlxuICAgICAgICAgICAgIFYgPT0gZyA/IChiIC0gcikgLyBDICsgMiA6XG4gICAgICAgICAgICAgICAgICAgICAgKHIgLSBnKSAvIEMgKyA0XG4gICAgICAgICAgICApO1xuICAgICAgICBIID0gKChIICsgMzYwKSAlIDYpICogNjAgLyAzNjA7XG4gICAgICAgIFMgPSBDID09IDAgPyAwIDogQyAvIFY7XG4gICAgICAgIHJldHVybiB7aDogSCwgczogUywgYjogViwgdG9TdHJpbmc6IGhzYnRvU3RyaW5nfTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLnJnYjJoc2xcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENvbnZlcnRzIFJHQiB2YWx1ZXMgdG8gSFNMIG9iamVjdC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gciAobnVtYmVyKSByZWRcbiAgICAgLSBnIChudW1iZXIpIGdyZWVuXG4gICAgIC0gYiAobnVtYmVyKSBibHVlXG4gICAgID0gKG9iamVjdCkgSFNMIG9iamVjdCBpbiBmb3JtYXQ6XG4gICAgIG8ge1xuICAgICBvICAgICBoIChudW1iZXIpIGh1ZVxuICAgICBvICAgICBzIChudW1iZXIpIHNhdHVyYXRpb25cbiAgICAgbyAgICAgbCAobnVtYmVyKSBsdW1pbm9zaXR5XG4gICAgIG8gfVxuICAgIFxcKi9cbiAgICBSLnJnYjJoc2wgPSBmdW5jdGlvbiAociwgZywgYikge1xuICAgICAgICBiID0gcHJlcGFyZVJHQihyLCBnLCBiKTtcbiAgICAgICAgciA9IGJbMF07XG4gICAgICAgIGcgPSBiWzFdO1xuICAgICAgICBiID0gYlsyXTtcblxuICAgICAgICB2YXIgSCwgUywgTCwgTSwgbSwgQztcbiAgICAgICAgTSA9IG1tYXgociwgZywgYik7XG4gICAgICAgIG0gPSBtbWluKHIsIGcsIGIpO1xuICAgICAgICBDID0gTSAtIG07XG4gICAgICAgIEggPSAoQyA9PSAwID8gbnVsbCA6XG4gICAgICAgICAgICAgTSA9PSByID8gKGcgLSBiKSAvIEMgOlxuICAgICAgICAgICAgIE0gPT0gZyA/IChiIC0gcikgLyBDICsgMiA6XG4gICAgICAgICAgICAgICAgICAgICAgKHIgLSBnKSAvIEMgKyA0KTtcbiAgICAgICAgSCA9ICgoSCArIDM2MCkgJSA2KSAqIDYwIC8gMzYwO1xuICAgICAgICBMID0gKE0gKyBtKSAvIDI7XG4gICAgICAgIFMgPSAoQyA9PSAwID8gMCA6XG4gICAgICAgICAgICAgTCA8IC41ID8gQyAvICgyICogTCkgOlxuICAgICAgICAgICAgICAgICAgICAgIEMgLyAoMiAtIDIgKiBMKSk7XG4gICAgICAgIHJldHVybiB7aDogSCwgczogUywgbDogTCwgdG9TdHJpbmc6IGhzbHRvU3RyaW5nfTtcbiAgICB9O1xuICAgIFIuX3BhdGgyc3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5qb2luKFwiLFwiKS5yZXBsYWNlKHAycywgXCIkMVwiKTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIHJlcHVzaChhcnJheSwgaXRlbSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBhcnJheS5sZW5ndGg7IGkgPCBpaTsgaSsrKSBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBhcnJheS5wdXNoKGFycmF5LnNwbGljZShpLCAxKVswXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gY2FjaGVyKGYsIHNjb3BlLCBwb3N0cHJvY2Vzc29yKSB7XG4gICAgICAgIGZ1bmN0aW9uIG5ld2YoKSB7XG4gICAgICAgICAgICB2YXIgYXJnID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSxcbiAgICAgICAgICAgICAgICBhcmdzID0gYXJnLmpvaW4oXCJcXHUyNDAwXCIpLFxuICAgICAgICAgICAgICAgIGNhY2hlID0gbmV3Zi5jYWNoZSA9IG5ld2YuY2FjaGUgfHwge30sXG4gICAgICAgICAgICAgICAgY291bnQgPSBuZXdmLmNvdW50ID0gbmV3Zi5jb3VudCB8fCBbXTtcbiAgICAgICAgICAgIGlmIChjYWNoZVtoYXNdKGFyZ3MpKSB7XG4gICAgICAgICAgICAgICAgcmVwdXNoKGNvdW50LCBhcmdzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcG9zdHByb2Nlc3NvciA/IHBvc3Rwcm9jZXNzb3IoY2FjaGVbYXJnc10pIDogY2FjaGVbYXJnc107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb3VudC5sZW5ndGggPj0gMWUzICYmIGRlbGV0ZSBjYWNoZVtjb3VudC5zaGlmdCgpXTtcbiAgICAgICAgICAgIGNvdW50LnB1c2goYXJncyk7XG4gICAgICAgICAgICBjYWNoZVthcmdzXSA9IGZbYXBwbHldKHNjb3BlLCBhcmcpO1xuICAgICAgICAgICAgcmV0dXJuIHBvc3Rwcm9jZXNzb3IgPyBwb3N0cHJvY2Vzc29yKGNhY2hlW2FyZ3NdKSA6IGNhY2hlW2FyZ3NdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXdmO1xuICAgIH1cblxuICAgIHZhciBwcmVsb2FkID0gUi5fcHJlbG9hZCA9IGZ1bmN0aW9uIChzcmMsIGYpIHtcbiAgICAgICAgdmFyIGltZyA9IGcuZG9jLmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgICAgIGltZy5zdHlsZS5jc3NUZXh0ID0gXCJwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0Oi05OTk5ZW07dG9wOi05OTk5ZW1cIjtcbiAgICAgICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGYuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMub25sb2FkID0gbnVsbDtcbiAgICAgICAgICAgIGcuZG9jLmJvZHkucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIH07XG4gICAgICAgIGltZy5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZy5kb2MuYm9keS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgICAgZy5kb2MuYm9keS5hcHBlbmRDaGlsZChpbWcpO1xuICAgICAgICBpbWcuc3JjID0gc3JjO1xuICAgIH07XG4gICAgXG4gICAgZnVuY3Rpb24gY2xyVG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhleDtcbiAgICB9XG5cbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5nZXRSR0JcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFBhcnNlcyBjb2xvdXIgc3RyaW5nIGFzIFJHQiBvYmplY3RcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gY29sb3VyIChzdHJpbmcpIGNvbG91ciBzdHJpbmcgaW4gb25lIG9mIGZvcm1hdHM6XG4gICAgICMgPHVsPlxuICAgICAjICAgICA8bGk+Q29sb3VyIG5hbWUgKOKAnDxjb2RlPnJlZDwvY29kZT7igJ0sIOKAnDxjb2RlPmdyZWVuPC9jb2RlPuKAnSwg4oCcPGNvZGU+Y29ybmZsb3dlcmJsdWU8L2NvZGU+4oCdLCBldGMpPC9saT5cbiAgICAgIyAgICAgPGxpPiPigKLigKLigKIg4oCUIHNob3J0ZW5lZCBIVE1MIGNvbG91cjogKOKAnDxjb2RlPiMwMDA8L2NvZGU+4oCdLCDigJw8Y29kZT4jZmMwPC9jb2RlPuKAnSwgZXRjKTwvbGk+XG4gICAgICMgICAgIDxsaT4j4oCi4oCi4oCi4oCi4oCi4oCiIOKAlCBmdWxsIGxlbmd0aCBIVE1MIGNvbG91cjogKOKAnDxjb2RlPiMwMDAwMDA8L2NvZGU+4oCdLCDigJw8Y29kZT4jYmQyMzAwPC9jb2RlPuKAnSk8L2xpPlxuICAgICAjICAgICA8bGk+cmdiKOKAouKAouKAoiwg4oCi4oCi4oCiLCDigKLigKLigKIpIOKAlCByZWQsIGdyZWVuIGFuZCBibHVlIGNoYW5uZWxz4oCZIHZhbHVlczogKOKAnDxjb2RlPnJnYigyMDAsJm5ic3A7MTAwLCZuYnNwOzApPC9jb2RlPuKAnSk8L2xpPlxuICAgICAjICAgICA8bGk+cmdiKOKAouKAouKAoiUsIOKAouKAouKAoiUsIOKAouKAouKAoiUpIOKAlCBzYW1lIGFzIGFib3ZlLCBidXQgaW4gJTogKOKAnDxjb2RlPnJnYigxMDAlLCZuYnNwOzE3NSUsJm5ic3A7MCUpPC9jb2RlPuKAnSk8L2xpPlxuICAgICAjICAgICA8bGk+aHNiKOKAouKAouKAoiwg4oCi4oCi4oCiLCDigKLigKLigKIpIOKAlCBodWUsIHNhdHVyYXRpb24gYW5kIGJyaWdodG5lc3MgdmFsdWVzOiAo4oCcPGNvZGU+aHNiKDAuNSwmbmJzcDswLjI1LCZuYnNwOzEpPC9jb2RlPuKAnSk8L2xpPlxuICAgICAjICAgICA8bGk+aHNiKOKAouKAouKAoiUsIOKAouKAouKAoiUsIOKAouKAouKAoiUpIOKAlCBzYW1lIGFzIGFib3ZlLCBidXQgaW4gJTwvbGk+XG4gICAgICMgICAgIDxsaT5oc2wo4oCi4oCi4oCiLCDigKLigKLigKIsIOKAouKAouKAoikg4oCUIHNhbWUgYXMgaHNiPC9saT5cbiAgICAgIyAgICAgPGxpPmhzbCjigKLigKLigKIlLCDigKLigKLigKIlLCDigKLigKLigKIlKSDigJQgc2FtZSBhcyBoc2I8L2xpPlxuICAgICAjIDwvdWw+XG4gICAgID0gKG9iamVjdCkgUkdCIG9iamVjdCBpbiBmb3JtYXQ6XG4gICAgIG8ge1xuICAgICBvICAgICByIChudW1iZXIpIHJlZCxcbiAgICAgbyAgICAgZyAobnVtYmVyKSBncmVlbixcbiAgICAgbyAgICAgYiAobnVtYmVyKSBibHVlXG4gICAgIG8gICAgIGhleCAoc3RyaW5nKSBjb2xvciBpbiBIVE1ML0NTUyBmb3JtYXQ6ICPigKLigKLigKLigKLigKLigKIsXG4gICAgIG8gICAgIGVycm9yIChib29sZWFuKSB0cnVlIGlmIHN0cmluZyBjYW7igJl0IGJlIHBhcnNlZFxuICAgICBvIH1cbiAgICBcXCovXG4gICAgUi5nZXRSR0IgPSBjYWNoZXIoZnVuY3Rpb24gKGNvbG91cikge1xuICAgICAgICBpZiAoIWNvbG91ciB8fCAhISgoY29sb3VyID0gU3RyKGNvbG91cikpLmluZGV4T2YoXCItXCIpICsgMSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7cjogLTEsIGc6IC0xLCBiOiAtMSwgaGV4OiBcIm5vbmVcIiwgZXJyb3I6IDEsIHRvU3RyaW5nOiBjbHJUb1N0cmluZ307XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbG91ciA9PSBcIm5vbmVcIikge1xuICAgICAgICAgICAgcmV0dXJuIHtyOiAtMSwgZzogLTEsIGI6IC0xLCBoZXg6IFwibm9uZVwiLCB0b1N0cmluZzogY2xyVG9TdHJpbmd9O1xuICAgICAgICB9XG4gICAgICAgICEoaHNyZ1toYXNdKGNvbG91ci50b0xvd2VyQ2FzZSgpLnN1YnN0cmluZygwLCAyKSkgfHwgY29sb3VyLmNoYXJBdCgpID09IFwiI1wiKSAmJiAoY29sb3VyID0gdG9IZXgoY29sb3VyKSk7XG4gICAgICAgIHZhciByZXMsXG4gICAgICAgICAgICByZWQsXG4gICAgICAgICAgICBncmVlbixcbiAgICAgICAgICAgIGJsdWUsXG4gICAgICAgICAgICBvcGFjaXR5LFxuICAgICAgICAgICAgdCxcbiAgICAgICAgICAgIHZhbHVlcyxcbiAgICAgICAgICAgIHJnYiA9IGNvbG91ci5tYXRjaChjb2xvdXJSZWdFeHApO1xuICAgICAgICBpZiAocmdiKSB7XG4gICAgICAgICAgICBpZiAocmdiWzJdKSB7XG4gICAgICAgICAgICAgICAgYmx1ZSA9IHRvSW50KHJnYlsyXS5zdWJzdHJpbmcoNSksIDE2KTtcbiAgICAgICAgICAgICAgICBncmVlbiA9IHRvSW50KHJnYlsyXS5zdWJzdHJpbmcoMywgNSksIDE2KTtcbiAgICAgICAgICAgICAgICByZWQgPSB0b0ludChyZ2JbMl0uc3Vic3RyaW5nKDEsIDMpLCAxNik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmdiWzNdKSB7XG4gICAgICAgICAgICAgICAgYmx1ZSA9IHRvSW50KCh0ID0gcmdiWzNdLmNoYXJBdCgzKSkgKyB0LCAxNik7XG4gICAgICAgICAgICAgICAgZ3JlZW4gPSB0b0ludCgodCA9IHJnYlszXS5jaGFyQXQoMikpICsgdCwgMTYpO1xuICAgICAgICAgICAgICAgIHJlZCA9IHRvSW50KCh0ID0gcmdiWzNdLmNoYXJBdCgxKSkgKyB0LCAxNik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmdiWzRdKSB7XG4gICAgICAgICAgICAgICAgdmFsdWVzID0gcmdiWzRdW3NwbGl0XShjb21tYVNwYWNlcyk7XG4gICAgICAgICAgICAgICAgcmVkID0gdG9GbG9hdCh2YWx1ZXNbMF0pO1xuICAgICAgICAgICAgICAgIHZhbHVlc1swXS5zbGljZSgtMSkgPT0gXCIlXCIgJiYgKHJlZCAqPSAyLjU1KTtcbiAgICAgICAgICAgICAgICBncmVlbiA9IHRvRmxvYXQodmFsdWVzWzFdKTtcbiAgICAgICAgICAgICAgICB2YWx1ZXNbMV0uc2xpY2UoLTEpID09IFwiJVwiICYmIChncmVlbiAqPSAyLjU1KTtcbiAgICAgICAgICAgICAgICBibHVlID0gdG9GbG9hdCh2YWx1ZXNbMl0pO1xuICAgICAgICAgICAgICAgIHZhbHVlc1syXS5zbGljZSgtMSkgPT0gXCIlXCIgJiYgKGJsdWUgKj0gMi41NSk7XG4gICAgICAgICAgICAgICAgcmdiWzFdLnRvTG93ZXJDYXNlKCkuc2xpY2UoMCwgNCkgPT0gXCJyZ2JhXCIgJiYgKG9wYWNpdHkgPSB0b0Zsb2F0KHZhbHVlc1szXSkpO1xuICAgICAgICAgICAgICAgIHZhbHVlc1szXSAmJiB2YWx1ZXNbM10uc2xpY2UoLTEpID09IFwiJVwiICYmIChvcGFjaXR5IC89IDEwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmdiWzVdKSB7XG4gICAgICAgICAgICAgICAgdmFsdWVzID0gcmdiWzVdW3NwbGl0XShjb21tYVNwYWNlcyk7XG4gICAgICAgICAgICAgICAgcmVkID0gdG9GbG9hdCh2YWx1ZXNbMF0pO1xuICAgICAgICAgICAgICAgIHZhbHVlc1swXS5zbGljZSgtMSkgPT0gXCIlXCIgJiYgKHJlZCAqPSAyLjU1KTtcbiAgICAgICAgICAgICAgICBncmVlbiA9IHRvRmxvYXQodmFsdWVzWzFdKTtcbiAgICAgICAgICAgICAgICB2YWx1ZXNbMV0uc2xpY2UoLTEpID09IFwiJVwiICYmIChncmVlbiAqPSAyLjU1KTtcbiAgICAgICAgICAgICAgICBibHVlID0gdG9GbG9hdCh2YWx1ZXNbMl0pO1xuICAgICAgICAgICAgICAgIHZhbHVlc1syXS5zbGljZSgtMSkgPT0gXCIlXCIgJiYgKGJsdWUgKj0gMi41NSk7XG4gICAgICAgICAgICAgICAgKHZhbHVlc1swXS5zbGljZSgtMykgPT0gXCJkZWdcIiB8fCB2YWx1ZXNbMF0uc2xpY2UoLTEpID09IFwiXFx4YjBcIikgJiYgKHJlZCAvPSAzNjApO1xuICAgICAgICAgICAgICAgIHJnYlsxXS50b0xvd2VyQ2FzZSgpLnNsaWNlKDAsIDQpID09IFwiaHNiYVwiICYmIChvcGFjaXR5ID0gdG9GbG9hdCh2YWx1ZXNbM10pKTtcbiAgICAgICAgICAgICAgICB2YWx1ZXNbM10gJiYgdmFsdWVzWzNdLnNsaWNlKC0xKSA9PSBcIiVcIiAmJiAob3BhY2l0eSAvPSAxMDApO1xuICAgICAgICAgICAgICAgIHJldHVybiBSLmhzYjJyZ2IocmVkLCBncmVlbiwgYmx1ZSwgb3BhY2l0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmdiWzZdKSB7XG4gICAgICAgICAgICAgICAgdmFsdWVzID0gcmdiWzZdW3NwbGl0XShjb21tYVNwYWNlcyk7XG4gICAgICAgICAgICAgICAgcmVkID0gdG9GbG9hdCh2YWx1ZXNbMF0pO1xuICAgICAgICAgICAgICAgIHZhbHVlc1swXS5zbGljZSgtMSkgPT0gXCIlXCIgJiYgKHJlZCAqPSAyLjU1KTtcbiAgICAgICAgICAgICAgICBncmVlbiA9IHRvRmxvYXQodmFsdWVzWzFdKTtcbiAgICAgICAgICAgICAgICB2YWx1ZXNbMV0uc2xpY2UoLTEpID09IFwiJVwiICYmIChncmVlbiAqPSAyLjU1KTtcbiAgICAgICAgICAgICAgICBibHVlID0gdG9GbG9hdCh2YWx1ZXNbMl0pO1xuICAgICAgICAgICAgICAgIHZhbHVlc1syXS5zbGljZSgtMSkgPT0gXCIlXCIgJiYgKGJsdWUgKj0gMi41NSk7XG4gICAgICAgICAgICAgICAgKHZhbHVlc1swXS5zbGljZSgtMykgPT0gXCJkZWdcIiB8fCB2YWx1ZXNbMF0uc2xpY2UoLTEpID09IFwiXFx4YjBcIikgJiYgKHJlZCAvPSAzNjApO1xuICAgICAgICAgICAgICAgIHJnYlsxXS50b0xvd2VyQ2FzZSgpLnNsaWNlKDAsIDQpID09IFwiaHNsYVwiICYmIChvcGFjaXR5ID0gdG9GbG9hdCh2YWx1ZXNbM10pKTtcbiAgICAgICAgICAgICAgICB2YWx1ZXNbM10gJiYgdmFsdWVzWzNdLnNsaWNlKC0xKSA9PSBcIiVcIiAmJiAob3BhY2l0eSAvPSAxMDApO1xuICAgICAgICAgICAgICAgIHJldHVybiBSLmhzbDJyZ2IocmVkLCBncmVlbiwgYmx1ZSwgb3BhY2l0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZ2IgPSB7cjogcmVkLCBnOiBncmVlbiwgYjogYmx1ZSwgdG9TdHJpbmc6IGNsclRvU3RyaW5nfTtcbiAgICAgICAgICAgIHJnYi5oZXggPSBcIiNcIiArICgxNjc3NzIxNiB8IGJsdWUgfCAoZ3JlZW4gPDwgOCkgfCAocmVkIDw8IDE2KSkudG9TdHJpbmcoMTYpLnNsaWNlKDEpO1xuICAgICAgICAgICAgUi5pcyhvcGFjaXR5LCBcImZpbml0ZVwiKSAmJiAocmdiLm9wYWNpdHkgPSBvcGFjaXR5KTtcbiAgICAgICAgICAgIHJldHVybiByZ2I7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtyOiAtMSwgZzogLTEsIGI6IC0xLCBoZXg6IFwibm9uZVwiLCBlcnJvcjogMSwgdG9TdHJpbmc6IGNsclRvU3RyaW5nfTtcbiAgICB9LCBSKTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5oc2JcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENvbnZlcnRzIEhTQiB2YWx1ZXMgdG8gaGV4IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjb2xvdXIuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGggKG51bWJlcikgaHVlXG4gICAgIC0gcyAobnVtYmVyKSBzYXR1cmF0aW9uXG4gICAgIC0gYiAobnVtYmVyKSB2YWx1ZSBvciBicmlnaHRuZXNzXG4gICAgID0gKHN0cmluZykgaGV4IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjb2xvdXIuXG4gICAgXFwqL1xuICAgIFIuaHNiID0gY2FjaGVyKGZ1bmN0aW9uIChoLCBzLCBiKSB7XG4gICAgICAgIHJldHVybiBSLmhzYjJyZ2IoaCwgcywgYikuaGV4O1xuICAgIH0pO1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmhzbFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ29udmVydHMgSFNMIHZhbHVlcyB0byBoZXggcmVwcmVzZW50YXRpb24gb2YgdGhlIGNvbG91ci5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaCAobnVtYmVyKSBodWVcbiAgICAgLSBzIChudW1iZXIpIHNhdHVyYXRpb25cbiAgICAgLSBsIChudW1iZXIpIGx1bWlub3NpdHlcbiAgICAgPSAoc3RyaW5nKSBoZXggcmVwcmVzZW50YXRpb24gb2YgdGhlIGNvbG91ci5cbiAgICBcXCovXG4gICAgUi5oc2wgPSBjYWNoZXIoZnVuY3Rpb24gKGgsIHMsIGwpIHtcbiAgICAgICAgcmV0dXJuIFIuaHNsMnJnYihoLCBzLCBsKS5oZXg7XG4gICAgfSk7XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwucmdiXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDb252ZXJ0cyBSR0IgdmFsdWVzIHRvIGhleCByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29sb3VyLlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSByIChudW1iZXIpIHJlZFxuICAgICAtIGcgKG51bWJlcikgZ3JlZW5cbiAgICAgLSBiIChudW1iZXIpIGJsdWVcbiAgICAgPSAoc3RyaW5nKSBoZXggcmVwcmVzZW50YXRpb24gb2YgdGhlIGNvbG91ci5cbiAgICBcXCovXG4gICAgUi5yZ2IgPSBjYWNoZXIoZnVuY3Rpb24gKHIsIGcsIGIpIHtcbiAgICAgICAgcmV0dXJuIFwiI1wiICsgKDE2Nzc3MjE2IHwgYiB8IChnIDw8IDgpIHwgKHIgPDwgMTYpKS50b1N0cmluZygxNikuc2xpY2UoMSk7XG4gICAgfSk7XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuZ2V0Q29sb3JcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIE9uIGVhY2ggY2FsbCByZXR1cm5zIG5leHQgY29sb3VyIGluIHRoZSBzcGVjdHJ1bS4gVG8gcmVzZXQgaXQgYmFjayB0byByZWQgY2FsbCBAUmFwaGFlbC5nZXRDb2xvci5yZXNldFxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSB2YWx1ZSAobnVtYmVyKSAjb3B0aW9uYWwgYnJpZ2h0bmVzcywgZGVmYXVsdCBpcyBgMC43NWBcbiAgICAgPSAoc3RyaW5nKSBoZXggcmVwcmVzZW50YXRpb24gb2YgdGhlIGNvbG91ci5cbiAgICBcXCovXG4gICAgUi5nZXRDb2xvciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgc3RhcnQgPSB0aGlzLmdldENvbG9yLnN0YXJ0ID0gdGhpcy5nZXRDb2xvci5zdGFydCB8fCB7aDogMCwgczogMSwgYjogdmFsdWUgfHwgLjc1fSxcbiAgICAgICAgICAgIHJnYiA9IHRoaXMuaHNiMnJnYihzdGFydC5oLCBzdGFydC5zLCBzdGFydC5iKTtcbiAgICAgICAgc3RhcnQuaCArPSAuMDc1O1xuICAgICAgICBpZiAoc3RhcnQuaCA+IDEpIHtcbiAgICAgICAgICAgIHN0YXJ0LmggPSAwO1xuICAgICAgICAgICAgc3RhcnQucyAtPSAuMjtcbiAgICAgICAgICAgIHN0YXJ0LnMgPD0gMCAmJiAodGhpcy5nZXRDb2xvci5zdGFydCA9IHtoOiAwLCBzOiAxLCBiOiBzdGFydC5ifSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJnYi5oZXg7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5nZXRDb2xvci5yZXNldFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVzZXRzIHNwZWN0cnVtIHBvc2l0aW9uIGZvciBAUmFwaGFlbC5nZXRDb2xvciBiYWNrIHRvIHJlZC5cbiAgICBcXCovXG4gICAgUi5nZXRDb2xvci5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuc3RhcnQ7XG4gICAgfTtcblxuICAgIC8vIGh0dHA6Ly9zY2hlcGVycy5jYy9nZXR0aW5nLXRvLXRoZS1wb2ludFxuICAgIGZ1bmN0aW9uIGNhdG11bGxSb20yYmV6aWVyKGNycCwgeikge1xuICAgICAgICB2YXIgZCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgaUxlbiA9IGNycC5sZW5ndGg7IGlMZW4gLSAyICogIXogPiBpOyBpICs9IDIpIHtcbiAgICAgICAgICAgIHZhciBwID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAge3g6ICtjcnBbaSAtIDJdLCB5OiArY3JwW2kgLSAxXX0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7eDogK2NycFtpXSwgICAgIHk6ICtjcnBbaSArIDFdfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt4OiArY3JwW2kgKyAyXSwgeTogK2NycFtpICsgM119LFxuICAgICAgICAgICAgICAgICAgICAgICAge3g6ICtjcnBbaSArIDRdLCB5OiArY3JwW2kgKyA1XX1cbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGlmICh6KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBbMF0gPSB7eDogK2NycFtpTGVuIC0gMl0sIHk6ICtjcnBbaUxlbiAtIDFdfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlMZW4gLSA0ID09IGkpIHtcbiAgICAgICAgICAgICAgICAgICAgcFszXSA9IHt4OiArY3JwWzBdLCB5OiArY3JwWzFdfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlMZW4gLSAyID09IGkpIHtcbiAgICAgICAgICAgICAgICAgICAgcFsyXSA9IHt4OiArY3JwWzBdLCB5OiArY3JwWzFdfTtcbiAgICAgICAgICAgICAgICAgICAgcFszXSA9IHt4OiArY3JwWzJdLCB5OiArY3JwWzNdfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChpTGVuIC0gNCA9PSBpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBbM10gPSBwWzJdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWkpIHtcbiAgICAgICAgICAgICAgICAgICAgcFswXSA9IHt4OiArY3JwW2ldLCB5OiArY3JwW2kgKyAxXX07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZC5wdXNoKFtcIkNcIixcbiAgICAgICAgICAgICAgICAgICgtcFswXS54ICsgNiAqIHBbMV0ueCArIHBbMl0ueCkgLyA2LFxuICAgICAgICAgICAgICAgICAgKC1wWzBdLnkgKyA2ICogcFsxXS55ICsgcFsyXS55KSAvIDYsXG4gICAgICAgICAgICAgICAgICAocFsxXS54ICsgNiAqIHBbMl0ueCAtIHBbM10ueCkgLyA2LFxuICAgICAgICAgICAgICAgICAgKHBbMV0ueSArIDYqcFsyXS55IC0gcFszXS55KSAvIDYsXG4gICAgICAgICAgICAgICAgICBwWzJdLngsXG4gICAgICAgICAgICAgICAgICBwWzJdLnlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGQ7XG4gICAgfVxuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLnBhcnNlUGF0aFN0cmluZ1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVXRpbGl0eSBtZXRob2RcbiAgICAgKipcbiAgICAgKiBQYXJzZXMgZ2l2ZW4gcGF0aCBzdHJpbmcgaW50byBhbiBhcnJheSBvZiBhcnJheXMgb2YgcGF0aCBzZWdtZW50cy5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gcGF0aFN0cmluZyAoc3RyaW5nfGFycmF5KSBwYXRoIHN0cmluZyBvciBhcnJheSBvZiBzZWdtZW50cyAoaW4gdGhlIGxhc3QgY2FzZSBpdCB3aWxsIGJlIHJldHVybmVkIHN0cmFpZ2h0IGF3YXkpXG4gICAgID0gKGFycmF5KSBhcnJheSBvZiBzZWdtZW50cy5cbiAgICBcXCovXG4gICAgUi5wYXJzZVBhdGhTdHJpbmcgPSBmdW5jdGlvbiAocGF0aFN0cmluZykge1xuICAgICAgICBpZiAoIXBhdGhTdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwdGggPSBwYXRocyhwYXRoU3RyaW5nKTtcbiAgICAgICAgaWYgKHB0aC5hcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXRoQ2xvbmUocHRoLmFycik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBwYXJhbUNvdW50cyA9IHthOiA3LCBjOiA2LCBoOiAxLCBsOiAyLCBtOiAyLCByOiA0LCBxOiA0LCBzOiA0LCB0OiAyLCB2OiAxLCB6OiAwfSxcbiAgICAgICAgICAgIGRhdGEgPSBbXTtcbiAgICAgICAgaWYgKFIuaXMocGF0aFN0cmluZywgYXJyYXkpICYmIFIuaXMocGF0aFN0cmluZ1swXSwgYXJyYXkpKSB7IC8vIHJvdWdoIGFzc3VtcHRpb25cbiAgICAgICAgICAgIGRhdGEgPSBwYXRoQ2xvbmUocGF0aFN0cmluZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgU3RyKHBhdGhTdHJpbmcpLnJlcGxhY2UocGF0aENvbW1hbmQsIGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtcyA9IFtdLFxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gYi50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIGMucmVwbGFjZShwYXRoVmFsdWVzLCBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgICAgICBiICYmIHBhcmFtcy5wdXNoKCtiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAobmFtZSA9PSBcIm1cIiAmJiBwYXJhbXMubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goW2JdW2NvbmNhdF0ocGFyYW1zLnNwbGljZSgwLCAyKSkpO1xuICAgICAgICAgICAgICAgICAgICBuYW1lID0gXCJsXCI7XG4gICAgICAgICAgICAgICAgICAgIGIgPSBiID09IFwibVwiID8gXCJsXCIgOiBcIkxcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUgPT0gXCJyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKFtiXVtjb25jYXRdKHBhcmFtcykpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB3aGlsZSAocGFyYW1zLmxlbmd0aCA+PSBwYXJhbUNvdW50c1tuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goW2JdW2NvbmNhdF0ocGFyYW1zLnNwbGljZSgwLCBwYXJhbUNvdW50c1tuYW1lXSkpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwYXJhbUNvdW50c1tuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBkYXRhLnRvU3RyaW5nID0gUi5fcGF0aDJzdHJpbmc7XG4gICAgICAgIHB0aC5hcnIgPSBwYXRoQ2xvbmUoZGF0YSk7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwucGFyc2VUcmFuc2Zvcm1TdHJpbmdcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICoqXG4gICAgICogUGFyc2VzIGdpdmVuIHBhdGggc3RyaW5nIGludG8gYW4gYXJyYXkgb2YgdHJhbnNmb3JtYXRpb25zLlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBUU3RyaW5nIChzdHJpbmd8YXJyYXkpIHRyYW5zZm9ybSBzdHJpbmcgb3IgYXJyYXkgb2YgdHJhbnNmb3JtYXRpb25zIChpbiB0aGUgbGFzdCBjYXNlIGl0IHdpbGwgYmUgcmV0dXJuZWQgc3RyYWlnaHQgYXdheSlcbiAgICAgPSAoYXJyYXkpIGFycmF5IG9mIHRyYW5zZm9ybWF0aW9ucy5cbiAgICBcXCovXG4gICAgUi5wYXJzZVRyYW5zZm9ybVN0cmluZyA9IGNhY2hlcihmdW5jdGlvbiAoVFN0cmluZykge1xuICAgICAgICBpZiAoIVRTdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwYXJhbUNvdW50cyA9IHtyOiAzLCBzOiA0LCB0OiAyLCBtOiA2fSxcbiAgICAgICAgICAgIGRhdGEgPSBbXTtcbiAgICAgICAgaWYgKFIuaXMoVFN0cmluZywgYXJyYXkpICYmIFIuaXMoVFN0cmluZ1swXSwgYXJyYXkpKSB7IC8vIHJvdWdoIGFzc3VtcHRpb25cbiAgICAgICAgICAgIGRhdGEgPSBwYXRoQ2xvbmUoVFN0cmluZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgU3RyKFRTdHJpbmcpLnJlcGxhY2UodENvbW1hbmQsIGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtcyA9IFtdLFxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gbG93ZXJDYXNlLmNhbGwoYik7XG4gICAgICAgICAgICAgICAgYy5yZXBsYWNlKHBhdGhWYWx1ZXMsIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgICAgIGIgJiYgcGFyYW1zLnB1c2goK2IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGRhdGEucHVzaChbYl1bY29uY2F0XShwYXJhbXMpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGRhdGEudG9TdHJpbmcgPSBSLl9wYXRoMnN0cmluZztcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSk7XG4gICAgLy8gUEFUSFNcbiAgICB2YXIgcGF0aHMgPSBmdW5jdGlvbiAocHMpIHtcbiAgICAgICAgdmFyIHAgPSBwYXRocy5wcyA9IHBhdGhzLnBzIHx8IHt9O1xuICAgICAgICBpZiAocFtwc10pIHtcbiAgICAgICAgICAgIHBbcHNdLnNsZWVwID0gMTAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcFtwc10gPSB7XG4gICAgICAgICAgICAgICAgc2xlZXA6IDEwMFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBwKSBpZiAocFtoYXNdKGtleSkgJiYga2V5ICE9IHBzKSB7XG4gICAgICAgICAgICAgICAgcFtrZXldLnNsZWVwLS07XG4gICAgICAgICAgICAgICAgIXBba2V5XS5zbGVlcCAmJiBkZWxldGUgcFtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBbcHNdO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuZmluZERvdHNBdFNlZ21lbnRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICoqXG4gICAgICogRmluZCBkb3QgY29vcmRpbmF0ZXMgb24gdGhlIGdpdmVuIGN1YmljIGJlemllciBjdXJ2ZSBhdCB0aGUgZ2l2ZW4gdC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gcDF4IChudW1iZXIpIHggb2YgdGhlIGZpcnN0IHBvaW50IG9mIHRoZSBjdXJ2ZVxuICAgICAtIHAxeSAobnVtYmVyKSB5IG9mIHRoZSBmaXJzdCBwb2ludCBvZiB0aGUgY3VydmVcbiAgICAgLSBjMXggKG51bWJlcikgeCBvZiB0aGUgZmlyc3QgYW5jaG9yIG9mIHRoZSBjdXJ2ZVxuICAgICAtIGMxeSAobnVtYmVyKSB5IG9mIHRoZSBmaXJzdCBhbmNob3Igb2YgdGhlIGN1cnZlXG4gICAgIC0gYzJ4IChudW1iZXIpIHggb2YgdGhlIHNlY29uZCBhbmNob3Igb2YgdGhlIGN1cnZlXG4gICAgIC0gYzJ5IChudW1iZXIpIHkgb2YgdGhlIHNlY29uZCBhbmNob3Igb2YgdGhlIGN1cnZlXG4gICAgIC0gcDJ4IChudW1iZXIpIHggb2YgdGhlIHNlY29uZCBwb2ludCBvZiB0aGUgY3VydmVcbiAgICAgLSBwMnkgKG51bWJlcikgeSBvZiB0aGUgc2Vjb25kIHBvaW50IG9mIHRoZSBjdXJ2ZVxuICAgICAtIHQgKG51bWJlcikgcG9zaXRpb24gb24gdGhlIGN1cnZlICgwLi4xKVxuICAgICA9IChvYmplY3QpIHBvaW50IGluZm9ybWF0aW9uIGluIGZvcm1hdDpcbiAgICAgbyB7XG4gICAgIG8gICAgIHg6IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnRcbiAgICAgbyAgICAgeTogKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSBwb2ludFxuICAgICBvICAgICBtOiB7XG4gICAgIG8gICAgICAgICB4OiAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIGxlZnQgYW5jaG9yXG4gICAgIG8gICAgICAgICB5OiAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIGxlZnQgYW5jaG9yXG4gICAgIG8gICAgIH1cbiAgICAgbyAgICAgbjoge1xuICAgICBvICAgICAgICAgeDogKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSByaWdodCBhbmNob3JcbiAgICAgbyAgICAgICAgIHk6IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgcmlnaHQgYW5jaG9yXG4gICAgIG8gICAgIH1cbiAgICAgbyAgICAgc3RhcnQ6IHtcbiAgICAgbyAgICAgICAgIHg6IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgc3RhcnQgb2YgdGhlIGN1cnZlXG4gICAgIG8gICAgICAgICB5OiAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIHN0YXJ0IG9mIHRoZSBjdXJ2ZVxuICAgICBvICAgICB9XG4gICAgIG8gICAgIGVuZDoge1xuICAgICBvICAgICAgICAgeDogKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSBlbmQgb2YgdGhlIGN1cnZlXG4gICAgIG8gICAgICAgICB5OiAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIGVuZCBvZiB0aGUgY3VydmVcbiAgICAgbyAgICAgfVxuICAgICBvICAgICBhbHBoYTogKG51bWJlcikgYW5nbGUgb2YgdGhlIGN1cnZlIGRlcml2YXRpdmUgYXQgdGhlIHBvaW50XG4gICAgIG8gfVxuICAgIFxcKi9cbiAgICBSLmZpbmREb3RzQXRTZWdtZW50ID0gZnVuY3Rpb24gKHAxeCwgcDF5LCBjMXgsIGMxeSwgYzJ4LCBjMnksIHAyeCwgcDJ5LCB0KSB7XG4gICAgICAgIHZhciB0MSA9IDEgLSB0LFxuICAgICAgICAgICAgdDEzID0gcG93KHQxLCAzKSxcbiAgICAgICAgICAgIHQxMiA9IHBvdyh0MSwgMiksXG4gICAgICAgICAgICB0MiA9IHQgKiB0LFxuICAgICAgICAgICAgdDMgPSB0MiAqIHQsXG4gICAgICAgICAgICB4ID0gdDEzICogcDF4ICsgdDEyICogMyAqIHQgKiBjMXggKyB0MSAqIDMgKiB0ICogdCAqIGMyeCArIHQzICogcDJ4LFxuICAgICAgICAgICAgeSA9IHQxMyAqIHAxeSArIHQxMiAqIDMgKiB0ICogYzF5ICsgdDEgKiAzICogdCAqIHQgKiBjMnkgKyB0MyAqIHAyeSxcbiAgICAgICAgICAgIG14ID0gcDF4ICsgMiAqIHQgKiAoYzF4IC0gcDF4KSArIHQyICogKGMyeCAtIDIgKiBjMXggKyBwMXgpLFxuICAgICAgICAgICAgbXkgPSBwMXkgKyAyICogdCAqIChjMXkgLSBwMXkpICsgdDIgKiAoYzJ5IC0gMiAqIGMxeSArIHAxeSksXG4gICAgICAgICAgICBueCA9IGMxeCArIDIgKiB0ICogKGMyeCAtIGMxeCkgKyB0MiAqIChwMnggLSAyICogYzJ4ICsgYzF4KSxcbiAgICAgICAgICAgIG55ID0gYzF5ICsgMiAqIHQgKiAoYzJ5IC0gYzF5KSArIHQyICogKHAyeSAtIDIgKiBjMnkgKyBjMXkpLFxuICAgICAgICAgICAgYXggPSB0MSAqIHAxeCArIHQgKiBjMXgsXG4gICAgICAgICAgICBheSA9IHQxICogcDF5ICsgdCAqIGMxeSxcbiAgICAgICAgICAgIGN4ID0gdDEgKiBjMnggKyB0ICogcDJ4LFxuICAgICAgICAgICAgY3kgPSB0MSAqIGMyeSArIHQgKiBwMnksXG4gICAgICAgICAgICBhbHBoYSA9ICg5MCAtIG1hdGguYXRhbjIobXggLSBueCwgbXkgLSBueSkgKiAxODAgLyBQSSk7XG4gICAgICAgIChteCA+IG54IHx8IG15IDwgbnkpICYmIChhbHBoYSArPSAxODApO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICBtOiB7eDogbXgsIHk6IG15fSxcbiAgICAgICAgICAgIG46IHt4OiBueCwgeTogbnl9LFxuICAgICAgICAgICAgc3RhcnQ6IHt4OiBheCwgeTogYXl9LFxuICAgICAgICAgICAgZW5kOiB7eDogY3gsIHk6IGN5fSxcbiAgICAgICAgICAgIGFscGhhOiBhbHBoYVxuICAgICAgICB9O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuYmV6aWVyQkJveFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVXRpbGl0eSBtZXRob2RcbiAgICAgKipcbiAgICAgKiBSZXR1cm4gYm91bmRpbmcgYm94IG9mIGEgZ2l2ZW4gY3ViaWMgYmV6aWVyIGN1cnZlXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIHAxeCAobnVtYmVyKSB4IG9mIHRoZSBmaXJzdCBwb2ludCBvZiB0aGUgY3VydmVcbiAgICAgLSBwMXkgKG51bWJlcikgeSBvZiB0aGUgZmlyc3QgcG9pbnQgb2YgdGhlIGN1cnZlXG4gICAgIC0gYzF4IChudW1iZXIpIHggb2YgdGhlIGZpcnN0IGFuY2hvciBvZiB0aGUgY3VydmVcbiAgICAgLSBjMXkgKG51bWJlcikgeSBvZiB0aGUgZmlyc3QgYW5jaG9yIG9mIHRoZSBjdXJ2ZVxuICAgICAtIGMyeCAobnVtYmVyKSB4IG9mIHRoZSBzZWNvbmQgYW5jaG9yIG9mIHRoZSBjdXJ2ZVxuICAgICAtIGMyeSAobnVtYmVyKSB5IG9mIHRoZSBzZWNvbmQgYW5jaG9yIG9mIHRoZSBjdXJ2ZVxuICAgICAtIHAyeCAobnVtYmVyKSB4IG9mIHRoZSBzZWNvbmQgcG9pbnQgb2YgdGhlIGN1cnZlXG4gICAgIC0gcDJ5IChudW1iZXIpIHkgb2YgdGhlIHNlY29uZCBwb2ludCBvZiB0aGUgY3VydmVcbiAgICAgKiBvclxuICAgICAtIGJleiAoYXJyYXkpIGFycmF5IG9mIHNpeCBwb2ludHMgZm9yIGJlemllciBjdXJ2ZVxuICAgICA9IChvYmplY3QpIHBvaW50IGluZm9ybWF0aW9uIGluIGZvcm1hdDpcbiAgICAgbyB7XG4gICAgIG8gICAgIG1pbjoge1xuICAgICBvICAgICAgICAgeDogKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSBsZWZ0IHBvaW50XG4gICAgIG8gICAgICAgICB5OiAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIHRvcCBwb2ludFxuICAgICBvICAgICB9XG4gICAgIG8gICAgIG1heDoge1xuICAgICBvICAgICAgICAgeDogKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSByaWdodCBwb2ludFxuICAgICBvICAgICAgICAgeTogKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSBib3R0b20gcG9pbnRcbiAgICAgbyAgICAgfVxuICAgICBvIH1cbiAgICBcXCovXG4gICAgUi5iZXppZXJCQm94ID0gZnVuY3Rpb24gKHAxeCwgcDF5LCBjMXgsIGMxeSwgYzJ4LCBjMnksIHAyeCwgcDJ5KSB7XG4gICAgICAgIGlmICghUi5pcyhwMXgsIFwiYXJyYXlcIikpIHtcbiAgICAgICAgICAgIHAxeCA9IFtwMXgsIHAxeSwgYzF4LCBjMXksIGMyeCwgYzJ5LCBwMngsIHAyeV07XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJib3ggPSBjdXJ2ZURpbS5hcHBseShudWxsLCBwMXgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogYmJveC5taW4ueCxcbiAgICAgICAgICAgIHk6IGJib3gubWluLnksXG4gICAgICAgICAgICB4MjogYmJveC5tYXgueCxcbiAgICAgICAgICAgIHkyOiBiYm94Lm1heC55LFxuICAgICAgICAgICAgd2lkdGg6IGJib3gubWF4LnggLSBiYm94Lm1pbi54LFxuICAgICAgICAgICAgaGVpZ2h0OiBiYm94Lm1heC55IC0gYmJveC5taW4ueVxuICAgICAgICB9O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuaXNQb2ludEluc2lkZUJCb3hcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICoqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgZ2l2ZW4gcG9pbnQgaXMgaW5zaWRlIGJvdW5kaW5nIGJveGVzLlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBiYm94IChzdHJpbmcpIGJvdW5kaW5nIGJveFxuICAgICAtIHggKHN0cmluZykgeCBjb29yZGluYXRlIG9mIHRoZSBwb2ludFxuICAgICAtIHkgKHN0cmluZykgeSBjb29yZGluYXRlIG9mIHRoZSBwb2ludFxuICAgICA9IChib29sZWFuKSBgdHJ1ZWAgaWYgcG9pbnQgaW5zaWRlXG4gICAgXFwqL1xuICAgIFIuaXNQb2ludEluc2lkZUJCb3ggPSBmdW5jdGlvbiAoYmJveCwgeCwgeSkge1xuICAgICAgICByZXR1cm4geCA+PSBiYm94LnggJiYgeCA8PSBiYm94LngyICYmIHkgPj0gYmJveC55ICYmIHkgPD0gYmJveC55MjtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmlzQkJveEludGVyc2VjdFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVXRpbGl0eSBtZXRob2RcbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0d28gYm91bmRpbmcgYm94ZXMgaW50ZXJzZWN0XG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGJib3gxIChzdHJpbmcpIGZpcnN0IGJvdW5kaW5nIGJveFxuICAgICAtIGJib3gyIChzdHJpbmcpIHNlY29uZCBib3VuZGluZyBib3hcbiAgICAgPSAoYm9vbGVhbikgYHRydWVgIGlmIHRoZXkgaW50ZXJzZWN0XG4gICAgXFwqL1xuICAgIFIuaXNCQm94SW50ZXJzZWN0ID0gZnVuY3Rpb24gKGJib3gxLCBiYm94Mikge1xuICAgICAgICB2YXIgaSA9IFIuaXNQb2ludEluc2lkZUJCb3g7XG4gICAgICAgIHJldHVybiBpKGJib3gyLCBiYm94MS54LCBiYm94MS55KVxuICAgICAgICAgICAgfHwgaShiYm94MiwgYmJveDEueDIsIGJib3gxLnkpXG4gICAgICAgICAgICB8fCBpKGJib3gyLCBiYm94MS54LCBiYm94MS55MilcbiAgICAgICAgICAgIHx8IGkoYmJveDIsIGJib3gxLngyLCBiYm94MS55MilcbiAgICAgICAgICAgIHx8IGkoYmJveDEsIGJib3gyLngsIGJib3gyLnkpXG4gICAgICAgICAgICB8fCBpKGJib3gxLCBiYm94Mi54MiwgYmJveDIueSlcbiAgICAgICAgICAgIHx8IGkoYmJveDEsIGJib3gyLngsIGJib3gyLnkyKVxuICAgICAgICAgICAgfHwgaShiYm94MSwgYmJveDIueDIsIGJib3gyLnkyKVxuICAgICAgICAgICAgfHwgKGJib3gxLnggPCBiYm94Mi54MiAmJiBiYm94MS54ID4gYmJveDIueCB8fCBiYm94Mi54IDwgYmJveDEueDIgJiYgYmJveDIueCA+IGJib3gxLngpXG4gICAgICAgICAgICAmJiAoYmJveDEueSA8IGJib3gyLnkyICYmIGJib3gxLnkgPiBiYm94Mi55IHx8IGJib3gyLnkgPCBiYm94MS55MiAmJiBiYm94Mi55ID4gYmJveDEueSk7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBiYXNlMyh0LCBwMSwgcDIsIHAzLCBwNCkge1xuICAgICAgICB2YXIgdDEgPSAtMyAqIHAxICsgOSAqIHAyIC0gOSAqIHAzICsgMyAqIHA0LFxuICAgICAgICAgICAgdDIgPSB0ICogdDEgKyA2ICogcDEgLSAxMiAqIHAyICsgNiAqIHAzO1xuICAgICAgICByZXR1cm4gdCAqIHQyIC0gMyAqIHAxICsgMyAqIHAyO1xuICAgIH1cbiAgICBmdW5jdGlvbiBiZXpsZW4oeDEsIHkxLCB4MiwgeTIsIHgzLCB5MywgeDQsIHk0LCB6KSB7XG4gICAgICAgIGlmICh6ID09IG51bGwpIHtcbiAgICAgICAgICAgIHogPSAxO1xuICAgICAgICB9XG4gICAgICAgIHogPSB6ID4gMSA/IDEgOiB6IDwgMCA/IDAgOiB6O1xuICAgICAgICB2YXIgejIgPSB6IC8gMixcbiAgICAgICAgICAgIG4gPSAxMixcbiAgICAgICAgICAgIFR2YWx1ZXMgPSBbLTAuMTI1MiwwLjEyNTIsLTAuMzY3OCwwLjM2NzgsLTAuNTg3MywwLjU4NzMsLTAuNzY5OSwwLjc2OTksLTAuOTA0MSwwLjkwNDEsLTAuOTgxNiwwLjk4MTZdLFxuICAgICAgICAgICAgQ3ZhbHVlcyA9IFswLjI0OTEsMC4yNDkxLDAuMjMzNSwwLjIzMzUsMC4yMDMyLDAuMjAzMiwwLjE2MDEsMC4xNjAxLDAuMTA2OSwwLjEwNjksMC4wNDcyLDAuMDQ3Ml0sXG4gICAgICAgICAgICBzdW0gPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgdmFyIGN0ID0gejIgKiBUdmFsdWVzW2ldICsgejIsXG4gICAgICAgICAgICAgICAgeGJhc2UgPSBiYXNlMyhjdCwgeDEsIHgyLCB4MywgeDQpLFxuICAgICAgICAgICAgICAgIHliYXNlID0gYmFzZTMoY3QsIHkxLCB5MiwgeTMsIHk0KSxcbiAgICAgICAgICAgICAgICBjb21iID0geGJhc2UgKiB4YmFzZSArIHliYXNlICogeWJhc2U7XG4gICAgICAgICAgICBzdW0gKz0gQ3ZhbHVlc1tpXSAqIG1hdGguc3FydChjb21iKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gejIgKiBzdW07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldFRhdExlbih4MSwgeTEsIHgyLCB5MiwgeDMsIHkzLCB4NCwgeTQsIGxsKSB7XG4gICAgICAgIGlmIChsbCA8IDAgfHwgYmV6bGVuKHgxLCB5MSwgeDIsIHkyLCB4MywgeTMsIHg0LCB5NCkgPCBsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0ID0gMSxcbiAgICAgICAgICAgIHN0ZXAgPSB0IC8gMixcbiAgICAgICAgICAgIHQyID0gdCAtIHN0ZXAsXG4gICAgICAgICAgICBsLFxuICAgICAgICAgICAgZSA9IC4wMTtcbiAgICAgICAgbCA9IGJlemxlbih4MSwgeTEsIHgyLCB5MiwgeDMsIHkzLCB4NCwgeTQsIHQyKTtcbiAgICAgICAgd2hpbGUgKGFicyhsIC0gbGwpID4gZSkge1xuICAgICAgICAgICAgc3RlcCAvPSAyO1xuICAgICAgICAgICAgdDIgKz0gKGwgPCBsbCA/IDEgOiAtMSkgKiBzdGVwO1xuICAgICAgICAgICAgbCA9IGJlemxlbih4MSwgeTEsIHgyLCB5MiwgeDMsIHkzLCB4NCwgeTQsIHQyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdDI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGludGVyc2VjdCh4MSwgeTEsIHgyLCB5MiwgeDMsIHkzLCB4NCwgeTQpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgbW1heCh4MSwgeDIpIDwgbW1pbih4MywgeDQpIHx8XG4gICAgICAgICAgICBtbWluKHgxLCB4MikgPiBtbWF4KHgzLCB4NCkgfHxcbiAgICAgICAgICAgIG1tYXgoeTEsIHkyKSA8IG1taW4oeTMsIHk0KSB8fFxuICAgICAgICAgICAgbW1pbih5MSwgeTIpID4gbW1heCh5MywgeTQpXG4gICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBueCA9ICh4MSAqIHkyIC0geTEgKiB4MikgKiAoeDMgLSB4NCkgLSAoeDEgLSB4MikgKiAoeDMgKiB5NCAtIHkzICogeDQpLFxuICAgICAgICAgICAgbnkgPSAoeDEgKiB5MiAtIHkxICogeDIpICogKHkzIC0geTQpIC0gKHkxIC0geTIpICogKHgzICogeTQgLSB5MyAqIHg0KSxcbiAgICAgICAgICAgIGRlbm9taW5hdG9yID0gKHgxIC0geDIpICogKHkzIC0geTQpIC0gKHkxIC0geTIpICogKHgzIC0geDQpO1xuXG4gICAgICAgIGlmICghZGVub21pbmF0b3IpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcHggPSBueCAvIGRlbm9taW5hdG9yLFxuICAgICAgICAgICAgcHkgPSBueSAvIGRlbm9taW5hdG9yLFxuICAgICAgICAgICAgcHgyID0gK3B4LnRvRml4ZWQoMiksXG4gICAgICAgICAgICBweTIgPSArcHkudG9GaXhlZCgyKTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgcHgyIDwgK21taW4oeDEsIHgyKS50b0ZpeGVkKDIpIHx8XG4gICAgICAgICAgICBweDIgPiArbW1heCh4MSwgeDIpLnRvRml4ZWQoMikgfHxcbiAgICAgICAgICAgIHB4MiA8ICttbWluKHgzLCB4NCkudG9GaXhlZCgyKSB8fFxuICAgICAgICAgICAgcHgyID4gK21tYXgoeDMsIHg0KS50b0ZpeGVkKDIpIHx8XG4gICAgICAgICAgICBweTIgPCArbW1pbih5MSwgeTIpLnRvRml4ZWQoMikgfHxcbiAgICAgICAgICAgIHB5MiA+ICttbWF4KHkxLCB5MikudG9GaXhlZCgyKSB8fFxuICAgICAgICAgICAgcHkyIDwgK21taW4oeTMsIHk0KS50b0ZpeGVkKDIpIHx8XG4gICAgICAgICAgICBweTIgPiArbW1heCh5MywgeTQpLnRvRml4ZWQoMilcbiAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHt4OiBweCwgeTogcHl9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbnRlcihiZXoxLCBiZXoyKSB7XG4gICAgICAgIHJldHVybiBpbnRlckhlbHBlcihiZXoxLCBiZXoyKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW50ZXJDb3VudChiZXoxLCBiZXoyKSB7XG4gICAgICAgIHJldHVybiBpbnRlckhlbHBlcihiZXoxLCBiZXoyLCAxKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW50ZXJIZWxwZXIoYmV6MSwgYmV6MiwganVzdENvdW50KSB7XG4gICAgICAgIHZhciBiYm94MSA9IFIuYmV6aWVyQkJveChiZXoxKSxcbiAgICAgICAgICAgIGJib3gyID0gUi5iZXppZXJCQm94KGJlejIpO1xuICAgICAgICBpZiAoIVIuaXNCQm94SW50ZXJzZWN0KGJib3gxLCBiYm94MikpIHtcbiAgICAgICAgICAgIHJldHVybiBqdXN0Q291bnQgPyAwIDogW107XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGwxID0gYmV6bGVuLmFwcGx5KDAsIGJlejEpLFxuICAgICAgICAgICAgbDIgPSBiZXpsZW4uYXBwbHkoMCwgYmV6MiksXG4gICAgICAgICAgICBuMSA9IH5+KGwxIC8gNSksXG4gICAgICAgICAgICBuMiA9IH5+KGwyIC8gNSksXG4gICAgICAgICAgICBkb3RzMSA9IFtdLFxuICAgICAgICAgICAgZG90czIgPSBbXSxcbiAgICAgICAgICAgIHh5ID0ge30sXG4gICAgICAgICAgICByZXMgPSBqdXN0Q291bnQgPyAwIDogW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjEgKyAxOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBwID0gUi5maW5kRG90c0F0U2VnbWVudC5hcHBseShSLCBiZXoxLmNvbmNhdChpIC8gbjEpKTtcbiAgICAgICAgICAgIGRvdHMxLnB1c2goe3g6IHAueCwgeTogcC55LCB0OiBpIC8gbjF9KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbjIgKyAxOyBpKyspIHtcbiAgICAgICAgICAgIHAgPSBSLmZpbmREb3RzQXRTZWdtZW50LmFwcGx5KFIsIGJlejIuY29uY2F0KGkgLyBuMikpO1xuICAgICAgICAgICAgZG90czIucHVzaCh7eDogcC54LCB5OiBwLnksIHQ6IGkgLyBuMn0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBuMTsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG4yOyBqKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZGkgPSBkb3RzMVtpXSxcbiAgICAgICAgICAgICAgICAgICAgZGkxID0gZG90czFbaSArIDFdLFxuICAgICAgICAgICAgICAgICAgICBkaiA9IGRvdHMyW2pdLFxuICAgICAgICAgICAgICAgICAgICBkajEgPSBkb3RzMltqICsgMV0sXG4gICAgICAgICAgICAgICAgICAgIGNpID0gYWJzKGRpMS54IC0gZGkueCkgPCAuMDAxID8gXCJ5XCIgOiBcInhcIixcbiAgICAgICAgICAgICAgICAgICAgY2ogPSBhYnMoZGoxLnggLSBkai54KSA8IC4wMDEgPyBcInlcIiA6IFwieFwiLFxuICAgICAgICAgICAgICAgICAgICBpcyA9IGludGVyc2VjdChkaS54LCBkaS55LCBkaTEueCwgZGkxLnksIGRqLngsIGRqLnksIGRqMS54LCBkajEueSk7XG4gICAgICAgICAgICAgICAgaWYgKGlzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh4eVtpcy54LnRvRml4ZWQoNCldID09IGlzLnkudG9GaXhlZCg0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgeHlbaXMueC50b0ZpeGVkKDQpXSA9IGlzLnkudG9GaXhlZCg0KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHQxID0gZGkudCArIGFicygoaXNbY2ldIC0gZGlbY2ldKSAvIChkaTFbY2ldIC0gZGlbY2ldKSkgKiAoZGkxLnQgLSBkaS50KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHQyID0gZGoudCArIGFicygoaXNbY2pdIC0gZGpbY2pdKSAvIChkajFbY2pdIC0gZGpbY2pdKSkgKiAoZGoxLnQgLSBkai50KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQxID49IDAgJiYgdDEgPD0gMSAmJiB0MiA+PSAwICYmIHQyIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqdXN0Q291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBpcy54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBpcy55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0MTogdDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQyOiB0MlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLnBhdGhJbnRlcnNlY3Rpb25cbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICoqXG4gICAgICogRmluZHMgaW50ZXJzZWN0aW9ucyBvZiB0d28gcGF0aHNcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gcGF0aDEgKHN0cmluZykgcGF0aCBzdHJpbmdcbiAgICAgLSBwYXRoMiAoc3RyaW5nKSBwYXRoIHN0cmluZ1xuICAgICA9IChhcnJheSkgZG90cyBvZiBpbnRlcnNlY3Rpb25cbiAgICAgbyBbXG4gICAgIG8gICAgIHtcbiAgICAgbyAgICAgICAgIHg6IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnRcbiAgICAgbyAgICAgICAgIHk6IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnRcbiAgICAgbyAgICAgICAgIHQxOiAobnVtYmVyKSB0IHZhbHVlIGZvciBzZWdtZW50IG9mIHBhdGgxXG4gICAgIG8gICAgICAgICB0MjogKG51bWJlcikgdCB2YWx1ZSBmb3Igc2VnbWVudCBvZiBwYXRoMlxuICAgICBvICAgICAgICAgc2VnbWVudDE6IChudW1iZXIpIG9yZGVyIG51bWJlciBmb3Igc2VnbWVudCBvZiBwYXRoMVxuICAgICBvICAgICAgICAgc2VnbWVudDI6IChudW1iZXIpIG9yZGVyIG51bWJlciBmb3Igc2VnbWVudCBvZiBwYXRoMlxuICAgICBvICAgICAgICAgYmV6MTogKGFycmF5KSBlaWdodCBjb29yZGluYXRlcyByZXByZXNlbnRpbmcgYmV6acOpciBjdXJ2ZSBmb3IgdGhlIHNlZ21lbnQgb2YgcGF0aDFcbiAgICAgbyAgICAgICAgIGJlejI6IChhcnJheSkgZWlnaHQgY29vcmRpbmF0ZXMgcmVwcmVzZW50aW5nIGJlemnDqXIgY3VydmUgZm9yIHRoZSBzZWdtZW50IG9mIHBhdGgyXG4gICAgIG8gICAgIH1cbiAgICAgbyBdXG4gICAgXFwqL1xuICAgIFIucGF0aEludGVyc2VjdGlvbiA9IGZ1bmN0aW9uIChwYXRoMSwgcGF0aDIpIHtcbiAgICAgICAgcmV0dXJuIGludGVyUGF0aEhlbHBlcihwYXRoMSwgcGF0aDIpO1xuICAgIH07XG4gICAgUi5wYXRoSW50ZXJzZWN0aW9uTnVtYmVyID0gZnVuY3Rpb24gKHBhdGgxLCBwYXRoMikge1xuICAgICAgICByZXR1cm4gaW50ZXJQYXRoSGVscGVyKHBhdGgxLCBwYXRoMiwgMSk7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBpbnRlclBhdGhIZWxwZXIocGF0aDEsIHBhdGgyLCBqdXN0Q291bnQpIHtcbiAgICAgICAgcGF0aDEgPSBSLl9wYXRoMmN1cnZlKHBhdGgxKTtcbiAgICAgICAgcGF0aDIgPSBSLl9wYXRoMmN1cnZlKHBhdGgyKTtcbiAgICAgICAgdmFyIHgxLCB5MSwgeDIsIHkyLCB4MW0sIHkxbSwgeDJtLCB5Mm0sIGJlejEsIGJlejIsXG4gICAgICAgICAgICByZXMgPSBqdXN0Q291bnQgPyAwIDogW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IHBhdGgxLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBwaSA9IHBhdGgxW2ldO1xuICAgICAgICAgICAgaWYgKHBpWzBdID09IFwiTVwiKSB7XG4gICAgICAgICAgICAgICAgeDEgPSB4MW0gPSBwaVsxXTtcbiAgICAgICAgICAgICAgICB5MSA9IHkxbSA9IHBpWzJdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAocGlbMF0gPT0gXCJDXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgYmV6MSA9IFt4MSwgeTFdLmNvbmNhdChwaS5zbGljZSgxKSk7XG4gICAgICAgICAgICAgICAgICAgIHgxID0gYmV6MVs2XTtcbiAgICAgICAgICAgICAgICAgICAgeTEgPSBiZXoxWzddO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJlejEgPSBbeDEsIHkxLCB4MSwgeTEsIHgxbSwgeTFtLCB4MW0sIHkxbV07XG4gICAgICAgICAgICAgICAgICAgIHgxID0geDFtO1xuICAgICAgICAgICAgICAgICAgICB5MSA9IHkxbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDAsIGpqID0gcGF0aDIubGVuZ3RoOyBqIDwgamo7IGorKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGogPSBwYXRoMltqXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBqWzBdID09IFwiTVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4MiA9IHgybSA9IHBqWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgeTIgPSB5Mm0gPSBwalsyXTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwalswXSA9PSBcIkNcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlejIgPSBbeDIsIHkyXS5jb25jYXQocGouc2xpY2UoMSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgyID0gYmV6Mls2XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5MiA9IGJlejJbN107XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlejIgPSBbeDIsIHkyLCB4MiwgeTIsIHgybSwgeTJtLCB4Mm0sIHkybV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDIgPSB4Mm07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTIgPSB5Mm07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW50ciA9IGludGVySGVscGVyKGJlejEsIGJlejIsIGp1c3RDb3VudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanVzdENvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzICs9IGludHI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGsgPSAwLCBrayA9IGludHIubGVuZ3RoOyBrIDwga2s7IGsrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnRyW2tdLnNlZ21lbnQxID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50cltrXS5zZWdtZW50MiA9IGo7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludHJba10uYmV6MSA9IGJlejE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludHJba10uYmV6MiA9IGJlejI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IHJlcy5jb25jYXQoaW50cik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuaXNQb2ludEluc2lkZVBhdGhcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICoqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgZ2l2ZW4gcG9pbnQgaXMgaW5zaWRlIGEgZ2l2ZW4gY2xvc2VkIHBhdGguXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIHBhdGggKHN0cmluZykgcGF0aCBzdHJpbmdcbiAgICAgLSB4IChudW1iZXIpIHggb2YgdGhlIHBvaW50XG4gICAgIC0geSAobnVtYmVyKSB5IG9mIHRoZSBwb2ludFxuICAgICA9IChib29sZWFuKSB0cnVlLCBpZiBwb2ludCBpcyBpbnNpZGUgdGhlIHBhdGhcbiAgICBcXCovXG4gICAgUi5pc1BvaW50SW5zaWRlUGF0aCA9IGZ1bmN0aW9uIChwYXRoLCB4LCB5KSB7XG4gICAgICAgIHZhciBiYm94ID0gUi5wYXRoQkJveChwYXRoKTtcbiAgICAgICAgcmV0dXJuIFIuaXNQb2ludEluc2lkZUJCb3goYmJveCwgeCwgeSkgJiZcbiAgICAgICAgICAgICAgIGludGVyUGF0aEhlbHBlcihwYXRoLCBbW1wiTVwiLCB4LCB5XSwgW1wiSFwiLCBiYm94LngyICsgMTBdXSwgMSkgJSAyID09IDE7XG4gICAgfTtcbiAgICBSLl9yZW1vdmVkRmFjdG9yeSA9IGZ1bmN0aW9uIChtZXRob2RuYW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBldmUoXCJyYXBoYWVsLmxvZ1wiLCBudWxsLCBcIlJhcGhhXFx4ZWJsOiB5b3UgYXJlIGNhbGxpbmcgdG8gbWV0aG9kIFxcdTIwMWNcIiArIG1ldGhvZG5hbWUgKyBcIlxcdTIwMWQgb2YgcmVtb3ZlZCBvYmplY3RcIiwgbWV0aG9kbmFtZSk7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5wYXRoQkJveFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVXRpbGl0eSBtZXRob2RcbiAgICAgKipcbiAgICAgKiBSZXR1cm4gYm91bmRpbmcgYm94IG9mIGEgZ2l2ZW4gcGF0aFxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBwYXRoIChzdHJpbmcpIHBhdGggc3RyaW5nXG4gICAgID0gKG9iamVjdCkgYm91bmRpbmcgYm94XG4gICAgIG8ge1xuICAgICBvICAgICB4OiAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIGxlZnQgdG9wIHBvaW50IG9mIHRoZSBib3hcbiAgICAgbyAgICAgeTogKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSBsZWZ0IHRvcCBwb2ludCBvZiB0aGUgYm94XG4gICAgIG8gICAgIHgyOiAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIHJpZ2h0IGJvdHRvbSBwb2ludCBvZiB0aGUgYm94XG4gICAgIG8gICAgIHkyOiAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIHJpZ2h0IGJvdHRvbSBwb2ludCBvZiB0aGUgYm94XG4gICAgIG8gICAgIHdpZHRoOiAobnVtYmVyKSB3aWR0aCBvZiB0aGUgYm94XG4gICAgIG8gICAgIGhlaWdodDogKG51bWJlcikgaGVpZ2h0IG9mIHRoZSBib3hcbiAgICAgbyAgICAgY3g6IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgY2VudGVyIG9mIHRoZSBib3hcbiAgICAgbyAgICAgY3k6IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgY2VudGVyIG9mIHRoZSBib3hcbiAgICAgbyB9XG4gICAgXFwqL1xuICAgIHZhciBwYXRoRGltZW5zaW9ucyA9IFIucGF0aEJCb3ggPSBmdW5jdGlvbiAocGF0aCkge1xuICAgICAgICB2YXIgcHRoID0gcGF0aHMocGF0aCk7XG4gICAgICAgIGlmIChwdGguYmJveCkge1xuICAgICAgICAgICAgcmV0dXJuIGNsb25lKHB0aC5iYm94KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXBhdGgpIHtcbiAgICAgICAgICAgIHJldHVybiB7eDogMCwgeTogMCwgd2lkdGg6IDAsIGhlaWdodDogMCwgeDI6IDAsIHkyOiAwfTtcbiAgICAgICAgfVxuICAgICAgICBwYXRoID0gcGF0aDJjdXJ2ZShwYXRoKTtcbiAgICAgICAgdmFyIHggPSAwLCBcbiAgICAgICAgICAgIHkgPSAwLFxuICAgICAgICAgICAgWCA9IFtdLFxuICAgICAgICAgICAgWSA9IFtdLFxuICAgICAgICAgICAgcDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gcGF0aC5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICBwID0gcGF0aFtpXTtcbiAgICAgICAgICAgIGlmIChwWzBdID09IFwiTVwiKSB7XG4gICAgICAgICAgICAgICAgeCA9IHBbMV07XG4gICAgICAgICAgICAgICAgeSA9IHBbMl07XG4gICAgICAgICAgICAgICAgWC5wdXNoKHgpO1xuICAgICAgICAgICAgICAgIFkucHVzaCh5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpbSA9IGN1cnZlRGltKHgsIHksIHBbMV0sIHBbMl0sIHBbM10sIHBbNF0sIHBbNV0sIHBbNl0pO1xuICAgICAgICAgICAgICAgIFggPSBYW2NvbmNhdF0oZGltLm1pbi54LCBkaW0ubWF4LngpO1xuICAgICAgICAgICAgICAgIFkgPSBZW2NvbmNhdF0oZGltLm1pbi55LCBkaW0ubWF4LnkpO1xuICAgICAgICAgICAgICAgIHggPSBwWzVdO1xuICAgICAgICAgICAgICAgIHkgPSBwWzZdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciB4bWluID0gbW1pblthcHBseV0oMCwgWCksXG4gICAgICAgICAgICB5bWluID0gbW1pblthcHBseV0oMCwgWSksXG4gICAgICAgICAgICB4bWF4ID0gbW1heFthcHBseV0oMCwgWCksXG4gICAgICAgICAgICB5bWF4ID0gbW1heFthcHBseV0oMCwgWSksXG4gICAgICAgICAgICB3aWR0aCA9IHhtYXggLSB4bWluLFxuICAgICAgICAgICAgaGVpZ2h0ID0geW1heCAtIHltaW4sXG4gICAgICAgICAgICAgICAgYmIgPSB7XG4gICAgICAgICAgICAgICAgeDogeG1pbixcbiAgICAgICAgICAgICAgICB5OiB5bWluLFxuICAgICAgICAgICAgICAgIHgyOiB4bWF4LFxuICAgICAgICAgICAgICAgIHkyOiB5bWF4LFxuICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgICAgICAgICBjeDogeG1pbiArIHdpZHRoIC8gMixcbiAgICAgICAgICAgICAgICBjeTogeW1pbiArIGhlaWdodCAvIDJcbiAgICAgICAgICAgIH07XG4gICAgICAgIHB0aC5iYm94ID0gY2xvbmUoYmIpO1xuICAgICAgICByZXR1cm4gYmI7XG4gICAgfSxcbiAgICAgICAgcGF0aENsb25lID0gZnVuY3Rpb24gKHBhdGhBcnJheSkge1xuICAgICAgICAgICAgdmFyIHJlcyA9IGNsb25lKHBhdGhBcnJheSk7XG4gICAgICAgICAgICByZXMudG9TdHJpbmcgPSBSLl9wYXRoMnN0cmluZztcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH0sXG4gICAgICAgIHBhdGhUb1JlbGF0aXZlID0gUi5fcGF0aFRvUmVsYXRpdmUgPSBmdW5jdGlvbiAocGF0aEFycmF5KSB7XG4gICAgICAgICAgICB2YXIgcHRoID0gcGF0aHMocGF0aEFycmF5KTtcbiAgICAgICAgICAgIGlmIChwdGgucmVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhdGhDbG9uZShwdGgucmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghUi5pcyhwYXRoQXJyYXksIGFycmF5KSB8fCAhUi5pcyhwYXRoQXJyYXkgJiYgcGF0aEFycmF5WzBdLCBhcnJheSkpIHsgLy8gcm91Z2ggYXNzdW1wdGlvblxuICAgICAgICAgICAgICAgIHBhdGhBcnJheSA9IFIucGFyc2VQYXRoU3RyaW5nKHBhdGhBcnJheSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcmVzID0gW10sXG4gICAgICAgICAgICAgICAgeCA9IDAsXG4gICAgICAgICAgICAgICAgeSA9IDAsXG4gICAgICAgICAgICAgICAgbXggPSAwLFxuICAgICAgICAgICAgICAgIG15ID0gMCxcbiAgICAgICAgICAgICAgICBzdGFydCA9IDA7XG4gICAgICAgICAgICBpZiAocGF0aEFycmF5WzBdWzBdID09IFwiTVwiKSB7XG4gICAgICAgICAgICAgICAgeCA9IHBhdGhBcnJheVswXVsxXTtcbiAgICAgICAgICAgICAgICB5ID0gcGF0aEFycmF5WzBdWzJdO1xuICAgICAgICAgICAgICAgIG14ID0geDtcbiAgICAgICAgICAgICAgICBteSA9IHk7XG4gICAgICAgICAgICAgICAgc3RhcnQrKztcbiAgICAgICAgICAgICAgICByZXMucHVzaChbXCJNXCIsIHgsIHldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBzdGFydCwgaWkgPSBwYXRoQXJyYXkubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciByID0gcmVzW2ldID0gW10sXG4gICAgICAgICAgICAgICAgICAgIHBhID0gcGF0aEFycmF5W2ldO1xuICAgICAgICAgICAgICAgIGlmIChwYVswXSAhPSBsb3dlckNhc2UuY2FsbChwYVswXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgclswXSA9IGxvd2VyQ2FzZS5jYWxsKHBhWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChyWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiYVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbMV0gPSBwYVsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByWzJdID0gcGFbMl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgclszXSA9IHBhWzNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbNF0gPSBwYVs0XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByWzVdID0gcGFbNV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcls2XSA9ICsocGFbNl0gLSB4KS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbN10gPSArKHBhWzddIC0geSkudG9GaXhlZCgzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ2XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgclsxXSA9ICsocGFbMV0gLSB5KS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm1cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBteCA9IHBhWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG15ID0gcGFbMl07XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAxLCBqaiA9IHBhLmxlbmd0aDsgaiA8IGpqOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcltqXSA9ICsocGFbal0gLSAoKGogJSAyKSA/IHggOiB5KSkudG9GaXhlZCgzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByID0gcmVzW2ldID0gW107XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYVswXSA9PSBcIm1cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbXggPSBwYVsxXSArIHg7XG4gICAgICAgICAgICAgICAgICAgICAgICBteSA9IHBhWzJdICsgeTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrID0gMCwga2sgPSBwYS5sZW5ndGg7IGsgPCBrazsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNbaV1ba10gPSBwYVtrXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgbGVuID0gcmVzW2ldLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHJlc1tpXVswXSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwielwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgeCA9IG14O1xuICAgICAgICAgICAgICAgICAgICAgICAgeSA9IG15O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJoXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICB4ICs9ICtyZXNbaV1bbGVuIC0gMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInZcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgKz0gK3Jlc1tpXVtsZW4gLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgeCArPSArcmVzW2ldW2xlbiAtIDJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgeSArPSArcmVzW2ldW2xlbiAtIDFdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcy50b1N0cmluZyA9IFIuX3BhdGgyc3RyaW5nO1xuICAgICAgICAgICAgcHRoLnJlbCA9IHBhdGhDbG9uZShyZXMpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfSxcbiAgICAgICAgcGF0aFRvQWJzb2x1dGUgPSBSLl9wYXRoVG9BYnNvbHV0ZSA9IGZ1bmN0aW9uIChwYXRoQXJyYXkpIHtcbiAgICAgICAgICAgIHZhciBwdGggPSBwYXRocyhwYXRoQXJyYXkpO1xuICAgICAgICAgICAgaWYgKHB0aC5hYnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF0aENsb25lKHB0aC5hYnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFSLmlzKHBhdGhBcnJheSwgYXJyYXkpIHx8ICFSLmlzKHBhdGhBcnJheSAmJiBwYXRoQXJyYXlbMF0sIGFycmF5KSkgeyAvLyByb3VnaCBhc3N1bXB0aW9uXG4gICAgICAgICAgICAgICAgcGF0aEFycmF5ID0gUi5wYXJzZVBhdGhTdHJpbmcocGF0aEFycmF5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcGF0aEFycmF5IHx8ICFwYXRoQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtbXCJNXCIsIDAsIDBdXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciByZXMgPSBbXSxcbiAgICAgICAgICAgICAgICB4ID0gMCxcbiAgICAgICAgICAgICAgICB5ID0gMCxcbiAgICAgICAgICAgICAgICBteCA9IDAsXG4gICAgICAgICAgICAgICAgbXkgPSAwLFxuICAgICAgICAgICAgICAgIHN0YXJ0ID0gMDtcbiAgICAgICAgICAgIGlmIChwYXRoQXJyYXlbMF1bMF0gPT0gXCJNXCIpIHtcbiAgICAgICAgICAgICAgICB4ID0gK3BhdGhBcnJheVswXVsxXTtcbiAgICAgICAgICAgICAgICB5ID0gK3BhdGhBcnJheVswXVsyXTtcbiAgICAgICAgICAgICAgICBteCA9IHg7XG4gICAgICAgICAgICAgICAgbXkgPSB5O1xuICAgICAgICAgICAgICAgIHN0YXJ0Kys7XG4gICAgICAgICAgICAgICAgcmVzWzBdID0gW1wiTVwiLCB4LCB5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBjcnogPSBwYXRoQXJyYXkubGVuZ3RoID09IDMgJiYgcGF0aEFycmF5WzBdWzBdID09IFwiTVwiICYmIHBhdGhBcnJheVsxXVswXS50b1VwcGVyQ2FzZSgpID09IFwiUlwiICYmIHBhdGhBcnJheVsyXVswXS50b1VwcGVyQ2FzZSgpID09IFwiWlwiO1xuICAgICAgICAgICAgZm9yICh2YXIgciwgcGEsIGkgPSBzdGFydCwgaWkgPSBwYXRoQXJyYXkubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIHJlcy5wdXNoKHIgPSBbXSk7XG4gICAgICAgICAgICAgICAgcGEgPSBwYXRoQXJyYXlbaV07XG4gICAgICAgICAgICAgICAgaWYgKHBhWzBdICE9IHVwcGVyQ2FzZS5jYWxsKHBhWzBdKSkge1xuICAgICAgICAgICAgICAgICAgICByWzBdID0gdXBwZXJDYXNlLmNhbGwocGFbMF0pO1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHJbMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJBXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgclsxXSA9IHBhWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbMl0gPSBwYVsyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByWzNdID0gcGFbM107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcls0XSA9IHBhWzRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbNV0gPSBwYVs1XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByWzZdID0gKyhwYVs2XSArIHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbN10gPSArKHBhWzddICsgeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiVlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbMV0gPSArcGFbMV0gKyB5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkhcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByWzFdID0gK3BhWzFdICsgeDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJSXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRvdHMgPSBbeCwgeV1bY29uY2F0XShwYS5zbGljZSgxKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDIsIGpqID0gZG90cy5sZW5ndGg7IGogPCBqajsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvdHNbal0gPSArZG90c1tqXSArIHg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvdHNbKytqXSA9ICtkb3RzW2pdICsgeTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IHJlc1tjb25jYXRdKGNhdG11bGxSb20yYmV6aWVyKGRvdHMsIGNyeikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIk1cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBteCA9ICtwYVsxXSArIHg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXkgPSArcGFbMl0gKyB5O1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAxLCBqaiA9IHBhLmxlbmd0aDsgaiA8IGpqOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcltqXSA9ICtwYVtqXSArICgoaiAlIDIpID8geCA6IHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFbMF0gPT0gXCJSXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZG90cyA9IFt4LCB5XVtjb25jYXRdKHBhLnNsaWNlKDEpKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICByZXMgPSByZXNbY29uY2F0XShjYXRtdWxsUm9tMmJlemllcihkb3RzLCBjcnopKTtcbiAgICAgICAgICAgICAgICAgICAgciA9IFtcIlJcIl1bY29uY2F0XShwYS5zbGljZSgtMikpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGsgPSAwLCBrayA9IHBhLmxlbmd0aDsgayA8IGtrOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJba10gPSBwYVtrXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHJbMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlpcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHggPSBteDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgPSBteTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiSFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgeCA9IHJbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlZcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgPSByWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJNXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBteCA9IHJbci5sZW5ndGggLSAyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG15ID0gcltyLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgeCA9IHJbci5sZW5ndGggLSAyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgPSByW3IubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzLnRvU3RyaW5nID0gUi5fcGF0aDJzdHJpbmc7XG4gICAgICAgICAgICBwdGguYWJzID0gcGF0aENsb25lKHJlcyk7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9LFxuICAgICAgICBsMmMgPSBmdW5jdGlvbiAoeDEsIHkxLCB4MiwgeTIpIHtcbiAgICAgICAgICAgIHJldHVybiBbeDEsIHkxLCB4MiwgeTIsIHgyLCB5Ml07XG4gICAgICAgIH0sXG4gICAgICAgIHEyYyA9IGZ1bmN0aW9uICh4MSwgeTEsIGF4LCBheSwgeDIsIHkyKSB7XG4gICAgICAgICAgICB2YXIgXzEzID0gMSAvIDMsXG4gICAgICAgICAgICAgICAgXzIzID0gMiAvIDM7XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICBfMTMgKiB4MSArIF8yMyAqIGF4LFxuICAgICAgICAgICAgICAgICAgICBfMTMgKiB5MSArIF8yMyAqIGF5LFxuICAgICAgICAgICAgICAgICAgICBfMTMgKiB4MiArIF8yMyAqIGF4LFxuICAgICAgICAgICAgICAgICAgICBfMTMgKiB5MiArIF8yMyAqIGF5LFxuICAgICAgICAgICAgICAgICAgICB4MixcbiAgICAgICAgICAgICAgICAgICAgeTJcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICB9LFxuICAgICAgICBhMmMgPSBmdW5jdGlvbiAoeDEsIHkxLCByeCwgcnksIGFuZ2xlLCBsYXJnZV9hcmNfZmxhZywgc3dlZXBfZmxhZywgeDIsIHkyLCByZWN1cnNpdmUpIHtcbiAgICAgICAgICAgIC8vIGZvciBtb3JlIGluZm9ybWF0aW9uIG9mIHdoZXJlIHRoaXMgbWF0aCBjYW1lIGZyb20gdmlzaXQ6XG4gICAgICAgICAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcxMS9pbXBsbm90ZS5odG1sI0FyY0ltcGxlbWVudGF0aW9uTm90ZXNcbiAgICAgICAgICAgIHZhciBfMTIwID0gUEkgKiAxMjAgLyAxODAsXG4gICAgICAgICAgICAgICAgcmFkID0gUEkgLyAxODAgKiAoK2FuZ2xlIHx8IDApLFxuICAgICAgICAgICAgICAgIHJlcyA9IFtdLFxuICAgICAgICAgICAgICAgIHh5LFxuICAgICAgICAgICAgICAgIHJvdGF0ZSA9IGNhY2hlcihmdW5jdGlvbiAoeCwgeSwgcmFkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBYID0geCAqIG1hdGguY29zKHJhZCkgLSB5ICogbWF0aC5zaW4ocmFkKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFkgPSB4ICogbWF0aC5zaW4ocmFkKSArIHkgKiBtYXRoLmNvcyhyYWQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge3g6IFgsIHk6IFl9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFyZWN1cnNpdmUpIHtcbiAgICAgICAgICAgICAgICB4eSA9IHJvdGF0ZSh4MSwgeTEsIC1yYWQpO1xuICAgICAgICAgICAgICAgIHgxID0geHkueDtcbiAgICAgICAgICAgICAgICB5MSA9IHh5Lnk7XG4gICAgICAgICAgICAgICAgeHkgPSByb3RhdGUoeDIsIHkyLCAtcmFkKTtcbiAgICAgICAgICAgICAgICB4MiA9IHh5Lng7XG4gICAgICAgICAgICAgICAgeTIgPSB4eS55O1xuICAgICAgICAgICAgICAgIHZhciBjb3MgPSBtYXRoLmNvcyhQSSAvIDE4MCAqIGFuZ2xlKSxcbiAgICAgICAgICAgICAgICAgICAgc2luID0gbWF0aC5zaW4oUEkgLyAxODAgKiBhbmdsZSksXG4gICAgICAgICAgICAgICAgICAgIHggPSAoeDEgLSB4MikgLyAyLFxuICAgICAgICAgICAgICAgICAgICB5ID0gKHkxIC0geTIpIC8gMjtcbiAgICAgICAgICAgICAgICB2YXIgaCA9ICh4ICogeCkgLyAocnggKiByeCkgKyAoeSAqIHkpIC8gKHJ5ICogcnkpO1xuICAgICAgICAgICAgICAgIGlmIChoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBoID0gbWF0aC5zcXJ0KGgpO1xuICAgICAgICAgICAgICAgICAgICByeCA9IGggKiByeDtcbiAgICAgICAgICAgICAgICAgICAgcnkgPSBoICogcnk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciByeDIgPSByeCAqIHJ4LFxuICAgICAgICAgICAgICAgICAgICByeTIgPSByeSAqIHJ5LFxuICAgICAgICAgICAgICAgICAgICBrID0gKGxhcmdlX2FyY19mbGFnID09IHN3ZWVwX2ZsYWcgPyAtMSA6IDEpICpcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGguc3FydChhYnMoKHJ4MiAqIHJ5MiAtIHJ4MiAqIHkgKiB5IC0gcnkyICogeCAqIHgpIC8gKHJ4MiAqIHkgKiB5ICsgcnkyICogeCAqIHgpKSksXG4gICAgICAgICAgICAgICAgICAgIGN4ID0gayAqIHJ4ICogeSAvIHJ5ICsgKHgxICsgeDIpIC8gMixcbiAgICAgICAgICAgICAgICAgICAgY3kgPSBrICogLXJ5ICogeCAvIHJ4ICsgKHkxICsgeTIpIC8gMixcbiAgICAgICAgICAgICAgICAgICAgZjEgPSBtYXRoLmFzaW4oKCh5MSAtIGN5KSAvIHJ5KS50b0ZpeGVkKDkpKSxcbiAgICAgICAgICAgICAgICAgICAgZjIgPSBtYXRoLmFzaW4oKCh5MiAtIGN5KSAvIHJ5KS50b0ZpeGVkKDkpKTtcblxuICAgICAgICAgICAgICAgIGYxID0geDEgPCBjeCA/IFBJIC0gZjEgOiBmMTtcbiAgICAgICAgICAgICAgICBmMiA9IHgyIDwgY3ggPyBQSSAtIGYyIDogZjI7XG4gICAgICAgICAgICAgICAgZjEgPCAwICYmIChmMSA9IFBJICogMiArIGYxKTtcbiAgICAgICAgICAgICAgICBmMiA8IDAgJiYgKGYyID0gUEkgKiAyICsgZjIpO1xuICAgICAgICAgICAgICAgIGlmIChzd2VlcF9mbGFnICYmIGYxID4gZjIpIHtcbiAgICAgICAgICAgICAgICAgICAgZjEgPSBmMSAtIFBJICogMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFzd2VlcF9mbGFnICYmIGYyID4gZjEpIHtcbiAgICAgICAgICAgICAgICAgICAgZjIgPSBmMiAtIFBJICogMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGYxID0gcmVjdXJzaXZlWzBdO1xuICAgICAgICAgICAgICAgIGYyID0gcmVjdXJzaXZlWzFdO1xuICAgICAgICAgICAgICAgIGN4ID0gcmVjdXJzaXZlWzJdO1xuICAgICAgICAgICAgICAgIGN5ID0gcmVjdXJzaXZlWzNdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGRmID0gZjIgLSBmMTtcbiAgICAgICAgICAgIGlmIChhYnMoZGYpID4gXzEyMCkge1xuICAgICAgICAgICAgICAgIHZhciBmMm9sZCA9IGYyLFxuICAgICAgICAgICAgICAgICAgICB4Mm9sZCA9IHgyLFxuICAgICAgICAgICAgICAgICAgICB5Mm9sZCA9IHkyO1xuICAgICAgICAgICAgICAgIGYyID0gZjEgKyBfMTIwICogKHN3ZWVwX2ZsYWcgJiYgZjIgPiBmMSA/IDEgOiAtMSk7XG4gICAgICAgICAgICAgICAgeDIgPSBjeCArIHJ4ICogbWF0aC5jb3MoZjIpO1xuICAgICAgICAgICAgICAgIHkyID0gY3kgKyByeSAqIG1hdGguc2luKGYyKTtcbiAgICAgICAgICAgICAgICByZXMgPSBhMmMoeDIsIHkyLCByeCwgcnksIGFuZ2xlLCAwLCBzd2VlcF9mbGFnLCB4Mm9sZCwgeTJvbGQsIFtmMiwgZjJvbGQsIGN4LCBjeV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGYgPSBmMiAtIGYxO1xuICAgICAgICAgICAgdmFyIGMxID0gbWF0aC5jb3MoZjEpLFxuICAgICAgICAgICAgICAgIHMxID0gbWF0aC5zaW4oZjEpLFxuICAgICAgICAgICAgICAgIGMyID0gbWF0aC5jb3MoZjIpLFxuICAgICAgICAgICAgICAgIHMyID0gbWF0aC5zaW4oZjIpLFxuICAgICAgICAgICAgICAgIHQgPSBtYXRoLnRhbihkZiAvIDQpLFxuICAgICAgICAgICAgICAgIGh4ID0gNCAvIDMgKiByeCAqIHQsXG4gICAgICAgICAgICAgICAgaHkgPSA0IC8gMyAqIHJ5ICogdCxcbiAgICAgICAgICAgICAgICBtMSA9IFt4MSwgeTFdLFxuICAgICAgICAgICAgICAgIG0yID0gW3gxICsgaHggKiBzMSwgeTEgLSBoeSAqIGMxXSxcbiAgICAgICAgICAgICAgICBtMyA9IFt4MiArIGh4ICogczIsIHkyIC0gaHkgKiBjMl0sXG4gICAgICAgICAgICAgICAgbTQgPSBbeDIsIHkyXTtcbiAgICAgICAgICAgIG0yWzBdID0gMiAqIG0xWzBdIC0gbTJbMF07XG4gICAgICAgICAgICBtMlsxXSA9IDIgKiBtMVsxXSAtIG0yWzFdO1xuICAgICAgICAgICAgaWYgKHJlY3Vyc2l2ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbbTIsIG0zLCBtNF1bY29uY2F0XShyZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXMgPSBbbTIsIG0zLCBtNF1bY29uY2F0XShyZXMpLmpvaW4oKVtzcGxpdF0oXCIsXCIpO1xuICAgICAgICAgICAgICAgIHZhciBuZXdyZXMgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSByZXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBuZXdyZXNbaV0gPSBpICUgMiA/IHJvdGF0ZShyZXNbaSAtIDFdLCByZXNbaV0sIHJhZCkueSA6IHJvdGF0ZShyZXNbaV0sIHJlc1tpICsgMV0sIHJhZCkueDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ld3JlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZmluZERvdEF0U2VnbWVudCA9IGZ1bmN0aW9uIChwMXgsIHAxeSwgYzF4LCBjMXksIGMyeCwgYzJ5LCBwMngsIHAyeSwgdCkge1xuICAgICAgICAgICAgdmFyIHQxID0gMSAtIHQ7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHg6IHBvdyh0MSwgMykgKiBwMXggKyBwb3codDEsIDIpICogMyAqIHQgKiBjMXggKyB0MSAqIDMgKiB0ICogdCAqIGMyeCArIHBvdyh0LCAzKSAqIHAyeCxcbiAgICAgICAgICAgICAgICB5OiBwb3codDEsIDMpICogcDF5ICsgcG93KHQxLCAyKSAqIDMgKiB0ICogYzF5ICsgdDEgKiAzICogdCAqIHQgKiBjMnkgKyBwb3codCwgMykgKiBwMnlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIGN1cnZlRGltID0gY2FjaGVyKGZ1bmN0aW9uIChwMXgsIHAxeSwgYzF4LCBjMXksIGMyeCwgYzJ5LCBwMngsIHAyeSkge1xuICAgICAgICAgICAgdmFyIGEgPSAoYzJ4IC0gMiAqIGMxeCArIHAxeCkgLSAocDJ4IC0gMiAqIGMyeCArIGMxeCksXG4gICAgICAgICAgICAgICAgYiA9IDIgKiAoYzF4IC0gcDF4KSAtIDIgKiAoYzJ4IC0gYzF4KSxcbiAgICAgICAgICAgICAgICBjID0gcDF4IC0gYzF4LFxuICAgICAgICAgICAgICAgIHQxID0gKC1iICsgbWF0aC5zcXJ0KGIgKiBiIC0gNCAqIGEgKiBjKSkgLyAyIC8gYSxcbiAgICAgICAgICAgICAgICB0MiA9ICgtYiAtIG1hdGguc3FydChiICogYiAtIDQgKiBhICogYykpIC8gMiAvIGEsXG4gICAgICAgICAgICAgICAgeSA9IFtwMXksIHAyeV0sXG4gICAgICAgICAgICAgICAgeCA9IFtwMXgsIHAyeF0sXG4gICAgICAgICAgICAgICAgZG90O1xuICAgICAgICAgICAgYWJzKHQxKSA+IFwiMWUxMlwiICYmICh0MSA9IC41KTtcbiAgICAgICAgICAgIGFicyh0MikgPiBcIjFlMTJcIiAmJiAodDIgPSAuNSk7XG4gICAgICAgICAgICBpZiAodDEgPiAwICYmIHQxIDwgMSkge1xuICAgICAgICAgICAgICAgIGRvdCA9IGZpbmREb3RBdFNlZ21lbnQocDF4LCBwMXksIGMxeCwgYzF5LCBjMngsIGMyeSwgcDJ4LCBwMnksIHQxKTtcbiAgICAgICAgICAgICAgICB4LnB1c2goZG90LngpO1xuICAgICAgICAgICAgICAgIHkucHVzaChkb3QueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodDIgPiAwICYmIHQyIDwgMSkge1xuICAgICAgICAgICAgICAgIGRvdCA9IGZpbmREb3RBdFNlZ21lbnQocDF4LCBwMXksIGMxeCwgYzF5LCBjMngsIGMyeSwgcDJ4LCBwMnksIHQyKTtcbiAgICAgICAgICAgICAgICB4LnB1c2goZG90LngpO1xuICAgICAgICAgICAgICAgIHkucHVzaChkb3QueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhID0gKGMyeSAtIDIgKiBjMXkgKyBwMXkpIC0gKHAyeSAtIDIgKiBjMnkgKyBjMXkpO1xuICAgICAgICAgICAgYiA9IDIgKiAoYzF5IC0gcDF5KSAtIDIgKiAoYzJ5IC0gYzF5KTtcbiAgICAgICAgICAgIGMgPSBwMXkgLSBjMXk7XG4gICAgICAgICAgICB0MSA9ICgtYiArIG1hdGguc3FydChiICogYiAtIDQgKiBhICogYykpIC8gMiAvIGE7XG4gICAgICAgICAgICB0MiA9ICgtYiAtIG1hdGguc3FydChiICogYiAtIDQgKiBhICogYykpIC8gMiAvIGE7XG4gICAgICAgICAgICBhYnModDEpID4gXCIxZTEyXCIgJiYgKHQxID0gLjUpO1xuICAgICAgICAgICAgYWJzKHQyKSA+IFwiMWUxMlwiICYmICh0MiA9IC41KTtcbiAgICAgICAgICAgIGlmICh0MSA+IDAgJiYgdDEgPCAxKSB7XG4gICAgICAgICAgICAgICAgZG90ID0gZmluZERvdEF0U2VnbWVudChwMXgsIHAxeSwgYzF4LCBjMXksIGMyeCwgYzJ5LCBwMngsIHAyeSwgdDEpO1xuICAgICAgICAgICAgICAgIHgucHVzaChkb3QueCk7XG4gICAgICAgICAgICAgICAgeS5wdXNoKGRvdC55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0MiA+IDAgJiYgdDIgPCAxKSB7XG4gICAgICAgICAgICAgICAgZG90ID0gZmluZERvdEF0U2VnbWVudChwMXgsIHAxeSwgYzF4LCBjMXksIGMyeCwgYzJ5LCBwMngsIHAyeSwgdDIpO1xuICAgICAgICAgICAgICAgIHgucHVzaChkb3QueCk7XG4gICAgICAgICAgICAgICAgeS5wdXNoKGRvdC55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbWluOiB7eDogbW1pblthcHBseV0oMCwgeCksIHk6IG1taW5bYXBwbHldKDAsIHkpfSxcbiAgICAgICAgICAgICAgICBtYXg6IHt4OiBtbWF4W2FwcGx5XSgwLCB4KSwgeTogbW1heFthcHBseV0oMCwgeSl9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgcGF0aDJjdXJ2ZSA9IFIuX3BhdGgyY3VydmUgPSBjYWNoZXIoZnVuY3Rpb24gKHBhdGgsIHBhdGgyKSB7XG4gICAgICAgICAgICB2YXIgcHRoID0gIXBhdGgyICYmIHBhdGhzKHBhdGgpO1xuICAgICAgICAgICAgaWYgKCFwYXRoMiAmJiBwdGguY3VydmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF0aENsb25lKHB0aC5jdXJ2ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcCA9IHBhdGhUb0Fic29sdXRlKHBhdGgpLFxuICAgICAgICAgICAgICAgIHAyID0gcGF0aDIgJiYgcGF0aFRvQWJzb2x1dGUocGF0aDIpLFxuICAgICAgICAgICAgICAgIGF0dHJzID0ge3g6IDAsIHk6IDAsIGJ4OiAwLCBieTogMCwgWDogMCwgWTogMCwgcXg6IG51bGwsIHF5OiBudWxsfSxcbiAgICAgICAgICAgICAgICBhdHRyczIgPSB7eDogMCwgeTogMCwgYng6IDAsIGJ5OiAwLCBYOiAwLCBZOiAwLCBxeDogbnVsbCwgcXk6IG51bGx9LFxuICAgICAgICAgICAgICAgIHByb2Nlc3NQYXRoID0gZnVuY3Rpb24gKHBhdGgsIGQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG54LCBueTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW1wiQ1wiLCBkLngsIGQueSwgZC54LCBkLnksIGQueCwgZC55XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAhKHBhdGhbMF0gaW4ge1Q6MSwgUToxfSkgJiYgKGQucXggPSBkLnF5ID0gbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAocGF0aFswXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIk1cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkLlggPSBwYXRoWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQuWSA9IHBhdGhbMl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGggPSBbXCJDXCJdW2NvbmNhdF0oYTJjW2FwcGx5XSgwLCBbZC54LCBkLnldW2NvbmNhdF0ocGF0aC5zbGljZSgxKSkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJTXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnggPSBkLnggKyAoZC54IC0gKGQuYnggfHwgZC54KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnkgPSBkLnkgKyAoZC55IC0gKGQuYnkgfHwgZC55KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCA9IFtcIkNcIiwgbngsIG55XVtjb25jYXRdKHBhdGguc2xpY2UoMSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkLnF4ID0gZC54ICsgKGQueCAtIChkLnF4IHx8IGQueCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQucXkgPSBkLnkgKyAoZC55IC0gKGQucXkgfHwgZC55KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCA9IFtcIkNcIl1bY29uY2F0XShxMmMoZC54LCBkLnksIGQucXgsIGQucXksIHBhdGhbMV0sIHBhdGhbMl0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJRXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZC5xeCA9IHBhdGhbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZC5xeSA9IHBhdGhbMl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCA9IFtcIkNcIl1bY29uY2F0XShxMmMoZC54LCBkLnksIHBhdGhbMV0sIHBhdGhbMl0sIHBhdGhbM10sIHBhdGhbNF0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJMXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCA9IFtcIkNcIl1bY29uY2F0XShsMmMoZC54LCBkLnksIHBhdGhbMV0sIHBhdGhbMl0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJIXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCA9IFtcIkNcIl1bY29uY2F0XShsMmMoZC54LCBkLnksIHBhdGhbMV0sIGQueSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlZcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoID0gW1wiQ1wiXVtjb25jYXRdKGwyYyhkLngsIGQueSwgZC54LCBwYXRoWzFdKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiWlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGggPSBbXCJDXCJdW2NvbmNhdF0obDJjKGQueCwgZC55LCBkLlgsIGQuWSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXRoO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZml4QXJjID0gZnVuY3Rpb24gKHBwLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcFtpXS5sZW5ndGggPiA3KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcFtpXS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBpID0gcHBbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAocGkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHAuc3BsaWNlKGkrKywgMCwgW1wiQ1wiXVtjb25jYXRdKHBpLnNwbGljZSgwLCA2KSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcHAuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWkgPSBtbWF4KHAubGVuZ3RoLCBwMiAmJiBwMi5sZW5ndGggfHwgMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZpeE0gPSBmdW5jdGlvbiAocGF0aDEsIHBhdGgyLCBhMSwgYTIsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhdGgxICYmIHBhdGgyICYmIHBhdGgxW2ldWzBdID09IFwiTVwiICYmIHBhdGgyW2ldWzBdICE9IFwiTVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoMi5zcGxpY2UoaSwgMCwgW1wiTVwiLCBhMi54LCBhMi55XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhMS5ieCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBhMS5ieSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBhMS54ID0gcGF0aDFbaV1bMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBhMS55ID0gcGF0aDFbaV1bMl07XG4gICAgICAgICAgICAgICAgICAgICAgICBpaSA9IG1tYXgocC5sZW5ndGgsIHAyICYmIHAyLmxlbmd0aCB8fCAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBtbWF4KHAubGVuZ3RoLCBwMiAmJiBwMi5sZW5ndGggfHwgMCk7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcFtpXSA9IHByb2Nlc3NQYXRoKHBbaV0sIGF0dHJzKTtcbiAgICAgICAgICAgICAgICBmaXhBcmMocCwgaSk7XG4gICAgICAgICAgICAgICAgcDIgJiYgKHAyW2ldID0gcHJvY2Vzc1BhdGgocDJbaV0sIGF0dHJzMikpO1xuICAgICAgICAgICAgICAgIHAyICYmIGZpeEFyYyhwMiwgaSk7XG4gICAgICAgICAgICAgICAgZml4TShwLCBwMiwgYXR0cnMsIGF0dHJzMiwgaSk7XG4gICAgICAgICAgICAgICAgZml4TShwMiwgcCwgYXR0cnMyLCBhdHRycywgaSk7XG4gICAgICAgICAgICAgICAgdmFyIHNlZyA9IHBbaV0sXG4gICAgICAgICAgICAgICAgICAgIHNlZzIgPSBwMiAmJiBwMltpXSxcbiAgICAgICAgICAgICAgICAgICAgc2VnbGVuID0gc2VnLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgc2VnMmxlbiA9IHAyICYmIHNlZzIubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGF0dHJzLnggPSBzZWdbc2VnbGVuIC0gMl07XG4gICAgICAgICAgICAgICAgYXR0cnMueSA9IHNlZ1tzZWdsZW4gLSAxXTtcbiAgICAgICAgICAgICAgICBhdHRycy5ieCA9IHRvRmxvYXQoc2VnW3NlZ2xlbiAtIDRdKSB8fCBhdHRycy54O1xuICAgICAgICAgICAgICAgIGF0dHJzLmJ5ID0gdG9GbG9hdChzZWdbc2VnbGVuIC0gM10pIHx8IGF0dHJzLnk7XG4gICAgICAgICAgICAgICAgYXR0cnMyLmJ4ID0gcDIgJiYgKHRvRmxvYXQoc2VnMltzZWcybGVuIC0gNF0pIHx8IGF0dHJzMi54KTtcbiAgICAgICAgICAgICAgICBhdHRyczIuYnkgPSBwMiAmJiAodG9GbG9hdChzZWcyW3NlZzJsZW4gLSAzXSkgfHwgYXR0cnMyLnkpO1xuICAgICAgICAgICAgICAgIGF0dHJzMi54ID0gcDIgJiYgc2VnMltzZWcybGVuIC0gMl07XG4gICAgICAgICAgICAgICAgYXR0cnMyLnkgPSBwMiAmJiBzZWcyW3NlZzJsZW4gLSAxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcDIpIHtcbiAgICAgICAgICAgICAgICBwdGguY3VydmUgPSBwYXRoQ2xvbmUocCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcDIgPyBbcCwgcDJdIDogcDtcbiAgICAgICAgfSwgbnVsbCwgcGF0aENsb25lKSxcbiAgICAgICAgcGFyc2VEb3RzID0gUi5fcGFyc2VEb3RzID0gY2FjaGVyKGZ1bmN0aW9uIChncmFkaWVudCkge1xuICAgICAgICAgICAgdmFyIGRvdHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IGdyYWRpZW50Lmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZG90ID0ge30sXG4gICAgICAgICAgICAgICAgICAgIHBhciA9IGdyYWRpZW50W2ldLm1hdGNoKC9eKFteOl0qKTo/KFtcXGRcXC5dKikvKTtcbiAgICAgICAgICAgICAgICBkb3QuY29sb3IgPSBSLmdldFJHQihwYXJbMV0pO1xuICAgICAgICAgICAgICAgIGlmIChkb3QuY29sb3IuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRvdC5jb2xvciA9IGRvdC5jb2xvci5oZXg7XG4gICAgICAgICAgICAgICAgcGFyWzJdICYmIChkb3Qub2Zmc2V0ID0gcGFyWzJdICsgXCIlXCIpO1xuICAgICAgICAgICAgICAgIGRvdHMucHVzaChkb3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChpID0gMSwgaWkgPSBkb3RzLmxlbmd0aCAtIDE7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFkb3RzW2ldLm9mZnNldCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhcnQgPSB0b0Zsb2F0KGRvdHNbaSAtIDFdLm9mZnNldCB8fCAwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IGlpOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb3RzW2pdLm9mZnNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZCA9IGRvdHNbal0ub2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQgPSAxMDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBqID0gaWk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZW5kID0gdG9GbG9hdChlbmQpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IChlbmQgLSBzdGFydCkgLyAoaiAtIGkgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0ICs9IGQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb3RzW2ldLm9mZnNldCA9IHN0YXJ0ICsgXCIlXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZG90cztcbiAgICAgICAgfSksXG4gICAgICAgIHRlYXIgPSBSLl90ZWFyID0gZnVuY3Rpb24gKGVsLCBwYXBlcikge1xuICAgICAgICAgICAgZWwgPT0gcGFwZXIudG9wICYmIChwYXBlci50b3AgPSBlbC5wcmV2KTtcbiAgICAgICAgICAgIGVsID09IHBhcGVyLmJvdHRvbSAmJiAocGFwZXIuYm90dG9tID0gZWwubmV4dCk7XG4gICAgICAgICAgICBlbC5uZXh0ICYmIChlbC5uZXh0LnByZXYgPSBlbC5wcmV2KTtcbiAgICAgICAgICAgIGVsLnByZXYgJiYgKGVsLnByZXYubmV4dCA9IGVsLm5leHQpO1xuICAgICAgICB9LFxuICAgICAgICB0b2Zyb250ID0gUi5fdG9mcm9udCA9IGZ1bmN0aW9uIChlbCwgcGFwZXIpIHtcbiAgICAgICAgICAgIGlmIChwYXBlci50b3AgPT09IGVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGVhcihlbCwgcGFwZXIpO1xuICAgICAgICAgICAgZWwubmV4dCA9IG51bGw7XG4gICAgICAgICAgICBlbC5wcmV2ID0gcGFwZXIudG9wO1xuICAgICAgICAgICAgcGFwZXIudG9wLm5leHQgPSBlbDtcbiAgICAgICAgICAgIHBhcGVyLnRvcCA9IGVsO1xuICAgICAgICB9LFxuICAgICAgICB0b2JhY2sgPSBSLl90b2JhY2sgPSBmdW5jdGlvbiAoZWwsIHBhcGVyKSB7XG4gICAgICAgICAgICBpZiAocGFwZXIuYm90dG9tID09PSBlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRlYXIoZWwsIHBhcGVyKTtcbiAgICAgICAgICAgIGVsLm5leHQgPSBwYXBlci5ib3R0b207XG4gICAgICAgICAgICBlbC5wcmV2ID0gbnVsbDtcbiAgICAgICAgICAgIHBhcGVyLmJvdHRvbS5wcmV2ID0gZWw7XG4gICAgICAgICAgICBwYXBlci5ib3R0b20gPSBlbDtcbiAgICAgICAgfSxcbiAgICAgICAgaW5zZXJ0YWZ0ZXIgPSBSLl9pbnNlcnRhZnRlciA9IGZ1bmN0aW9uIChlbCwgZWwyLCBwYXBlcikge1xuICAgICAgICAgICAgdGVhcihlbCwgcGFwZXIpO1xuICAgICAgICAgICAgZWwyID09IHBhcGVyLnRvcCAmJiAocGFwZXIudG9wID0gZWwpO1xuICAgICAgICAgICAgZWwyLm5leHQgJiYgKGVsMi5uZXh0LnByZXYgPSBlbCk7XG4gICAgICAgICAgICBlbC5uZXh0ID0gZWwyLm5leHQ7XG4gICAgICAgICAgICBlbC5wcmV2ID0gZWwyO1xuICAgICAgICAgICAgZWwyLm5leHQgPSBlbDtcbiAgICAgICAgfSxcbiAgICAgICAgaW5zZXJ0YmVmb3JlID0gUi5faW5zZXJ0YmVmb3JlID0gZnVuY3Rpb24gKGVsLCBlbDIsIHBhcGVyKSB7XG4gICAgICAgICAgICB0ZWFyKGVsLCBwYXBlcik7XG4gICAgICAgICAgICBlbDIgPT0gcGFwZXIuYm90dG9tICYmIChwYXBlci5ib3R0b20gPSBlbCk7XG4gICAgICAgICAgICBlbDIucHJldiAmJiAoZWwyLnByZXYubmV4dCA9IGVsKTtcbiAgICAgICAgICAgIGVsLnByZXYgPSBlbDIucHJldjtcbiAgICAgICAgICAgIGVsMi5wcmV2ID0gZWw7XG4gICAgICAgICAgICBlbC5uZXh0ID0gZWwyO1xuICAgICAgICB9LFxuICAgICAgICAvKlxcXG4gICAgICAgICAqIFJhcGhhZWwudG9NYXRyaXhcbiAgICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICAgICAqKlxuICAgICAgICAgKiBSZXR1cm5zIG1hdHJpeCBvZiB0cmFuc2Zvcm1hdGlvbnMgYXBwbGllZCB0byBhIGdpdmVuIHBhdGhcbiAgICAgICAgID4gUGFyYW1ldGVyc1xuICAgICAgICAgLSBwYXRoIChzdHJpbmcpIHBhdGggc3RyaW5nXG4gICAgICAgICAtIHRyYW5zZm9ybSAoc3RyaW5nfGFycmF5KSB0cmFuc2Zvcm1hdGlvbiBzdHJpbmdcbiAgICAgICAgID0gKG9iamVjdCkgQE1hdHJpeFxuICAgICAgICBcXCovXG4gICAgICAgIHRvTWF0cml4ID0gUi50b01hdHJpeCA9IGZ1bmN0aW9uIChwYXRoLCB0cmFuc2Zvcm0pIHtcbiAgICAgICAgICAgIHZhciBiYiA9IHBhdGhEaW1lbnNpb25zKHBhdGgpLFxuICAgICAgICAgICAgICAgIGVsID0ge1xuICAgICAgICAgICAgICAgICAgICBfOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IEVcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZ2V0QkJveDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGV4dHJhY3RUcmFuc2Zvcm0oZWwsIHRyYW5zZm9ybSk7XG4gICAgICAgICAgICByZXR1cm4gZWwubWF0cml4O1xuICAgICAgICB9LFxuICAgICAgICAvKlxcXG4gICAgICAgICAqIFJhcGhhZWwudHJhbnNmb3JtUGF0aFxuICAgICAgICAgWyBtZXRob2QgXVxuICAgICAgICAgKipcbiAgICAgICAgICogVXRpbGl0eSBtZXRob2RcbiAgICAgICAgICoqXG4gICAgICAgICAqIFJldHVybnMgcGF0aCB0cmFuc2Zvcm1lZCBieSBhIGdpdmVuIHRyYW5zZm9ybWF0aW9uXG4gICAgICAgICA+IFBhcmFtZXRlcnNcbiAgICAgICAgIC0gcGF0aCAoc3RyaW5nKSBwYXRoIHN0cmluZ1xuICAgICAgICAgLSB0cmFuc2Zvcm0gKHN0cmluZ3xhcnJheSkgdHJhbnNmb3JtYXRpb24gc3RyaW5nXG4gICAgICAgICA9IChzdHJpbmcpIHBhdGhcbiAgICAgICAgXFwqL1xuICAgICAgICB0cmFuc2Zvcm1QYXRoID0gUi50cmFuc2Zvcm1QYXRoID0gZnVuY3Rpb24gKHBhdGgsIHRyYW5zZm9ybSkge1xuICAgICAgICAgICAgcmV0dXJuIG1hcFBhdGgocGF0aCwgdG9NYXRyaXgocGF0aCwgdHJhbnNmb3JtKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGV4dHJhY3RUcmFuc2Zvcm0gPSBSLl9leHRyYWN0VHJhbnNmb3JtID0gZnVuY3Rpb24gKGVsLCB0c3RyKSB7XG4gICAgICAgICAgICBpZiAodHN0ciA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsLl8udHJhbnNmb3JtO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHN0ciA9IFN0cih0c3RyKS5yZXBsYWNlKC9cXC57M318XFx1MjAyNi9nLCBlbC5fLnRyYW5zZm9ybSB8fCBFKTtcbiAgICAgICAgICAgIHZhciB0ZGF0YSA9IFIucGFyc2VUcmFuc2Zvcm1TdHJpbmcodHN0ciksXG4gICAgICAgICAgICAgICAgZGVnID0gMCxcbiAgICAgICAgICAgICAgICBkeCA9IDAsXG4gICAgICAgICAgICAgICAgZHkgPSAwLFxuICAgICAgICAgICAgICAgIHN4ID0gMSxcbiAgICAgICAgICAgICAgICBzeSA9IDEsXG4gICAgICAgICAgICAgICAgXyA9IGVsLl8sXG4gICAgICAgICAgICAgICAgbSA9IG5ldyBNYXRyaXg7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybSA9IHRkYXRhIHx8IFtdO1xuICAgICAgICAgICAgaWYgKHRkYXRhKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gdGRhdGEubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdCA9IHRkYXRhW2ldLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGxlbiA9IHQubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZCA9IFN0cih0WzBdKS50b0xvd2VyQ2FzZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWJzb2x1dGUgPSB0WzBdICE9IGNvbW1hbmQsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnZlciA9IGFic29sdXRlID8gbS5pbnZlcnQoKSA6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB4MSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHkxLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDIsXG4gICAgICAgICAgICAgICAgICAgICAgICB5MixcbiAgICAgICAgICAgICAgICAgICAgICAgIGJiO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29tbWFuZCA9PSBcInRcIiAmJiB0bGVuID09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhYnNvbHV0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgxID0gaW52ZXIueCgwLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5MSA9IGludmVyLnkoMCwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDIgPSBpbnZlci54KHRbMV0sIHRbMl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkyID0gaW52ZXIueSh0WzFdLCB0WzJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRyYW5zbGF0ZSh4MiAtIHgxLCB5MiAtIHkxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS50cmFuc2xhdGUodFsxXSwgdFsyXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29tbWFuZCA9PSBcInJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRsZW4gPT0gMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJiID0gYmIgfHwgZWwuZ2V0QkJveCgxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnJvdGF0ZSh0WzFdLCBiYi54ICsgYmIud2lkdGggLyAyLCBiYi55ICsgYmIuaGVpZ2h0IC8gMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVnICs9IHRbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRsZW4gPT0gNCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhYnNvbHV0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4MiA9IGludmVyLngodFsyXSwgdFszXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkyID0gaW52ZXIueSh0WzJdLCB0WzNdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5yb3RhdGUodFsxXSwgeDIsIHkyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnJvdGF0ZSh0WzFdLCB0WzJdLCB0WzNdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVnICs9IHRbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29tbWFuZCA9PSBcInNcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRsZW4gPT0gMiB8fCB0bGVuID09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYiA9IGJiIHx8IGVsLmdldEJCb3goMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5zY2FsZSh0WzFdLCB0W3RsZW4gLSAxXSwgYmIueCArIGJiLndpZHRoIC8gMiwgYmIueSArIGJiLmhlaWdodCAvIDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN4ICo9IHRbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3kgKj0gdFt0bGVuIC0gMV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRsZW4gPT0gNSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhYnNvbHV0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4MiA9IGludmVyLngodFszXSwgdFs0XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkyID0gaW52ZXIueSh0WzNdLCB0WzRdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5zY2FsZSh0WzFdLCB0WzJdLCB4MiwgeTIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uc2NhbGUodFsxXSwgdFsyXSwgdFszXSwgdFs0XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN4ICo9IHRbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3kgKj0gdFsyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb21tYW5kID09IFwibVwiICYmIHRsZW4gPT0gNykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5hZGQodFsxXSwgdFsyXSwgdFszXSwgdFs0XSwgdFs1XSwgdFs2XSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXy5kaXJ0eVQgPSAxO1xuICAgICAgICAgICAgICAgICAgICBlbC5tYXRyaXggPSBtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLypcXFxuICAgICAgICAgICAgICogRWxlbWVudC5tYXRyaXhcbiAgICAgICAgICAgICBbIHByb3BlcnR5IChvYmplY3QpIF1cbiAgICAgICAgICAgICAqKlxuICAgICAgICAgICAgICogS2VlcHMgQE1hdHJpeCBvYmplY3QsIHdoaWNoIHJlcHJlc2VudHMgZWxlbWVudCB0cmFuc2Zvcm1hdGlvblxuICAgICAgICAgICAgXFwqL1xuICAgICAgICAgICAgZWwubWF0cml4ID0gbTtcblxuICAgICAgICAgICAgXy5zeCA9IHN4O1xuICAgICAgICAgICAgXy5zeSA9IHN5O1xuICAgICAgICAgICAgXy5kZWcgPSBkZWc7XG4gICAgICAgICAgICBfLmR4ID0gZHggPSBtLmU7XG4gICAgICAgICAgICBfLmR5ID0gZHkgPSBtLmY7XG5cbiAgICAgICAgICAgIGlmIChzeCA9PSAxICYmIHN5ID09IDEgJiYgIWRlZyAmJiBfLmJib3gpIHtcbiAgICAgICAgICAgICAgICBfLmJib3gueCArPSArZHg7XG4gICAgICAgICAgICAgICAgXy5iYm94LnkgKz0gK2R5O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfLmRpcnR5VCA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGdldEVtcHR5ID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHZhciBsID0gaXRlbVswXTtcbiAgICAgICAgICAgIHN3aXRjaCAobC50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcInRcIjogcmV0dXJuIFtsLCAwLCAwXTtcbiAgICAgICAgICAgICAgICBjYXNlIFwibVwiOiByZXR1cm4gW2wsIDEsIDAsIDAsIDEsIDAsIDBdO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJyXCI6IGlmIChpdGVtLmxlbmd0aCA9PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbbCwgMCwgaXRlbVsyXSwgaXRlbVszXV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtsLCAwXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSBcInNcIjogaWYgKGl0ZW0ubGVuZ3RoID09IDUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtsLCAxLCAxLCBpdGVtWzNdLCBpdGVtWzRdXTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0ubGVuZ3RoID09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtsLCAxLCAxXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW2wsIDFdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXF1YWxpc2VUcmFuc2Zvcm0gPSBSLl9lcXVhbGlzZVRyYW5zZm9ybSA9IGZ1bmN0aW9uICh0MSwgdDIpIHtcbiAgICAgICAgICAgIHQyID0gU3RyKHQyKS5yZXBsYWNlKC9cXC57M318XFx1MjAyNi9nLCB0MSk7XG4gICAgICAgICAgICB0MSA9IFIucGFyc2VUcmFuc2Zvcm1TdHJpbmcodDEpIHx8IFtdO1xuICAgICAgICAgICAgdDIgPSBSLnBhcnNlVHJhbnNmb3JtU3RyaW5nKHQyKSB8fCBbXTtcbiAgICAgICAgICAgIHZhciBtYXhsZW5ndGggPSBtbWF4KHQxLmxlbmd0aCwgdDIubGVuZ3RoKSxcbiAgICAgICAgICAgICAgICBmcm9tID0gW10sXG4gICAgICAgICAgICAgICAgdG8gPSBbXSxcbiAgICAgICAgICAgICAgICBpID0gMCwgaiwgamosXG4gICAgICAgICAgICAgICAgdHQxLCB0dDI7XG4gICAgICAgICAgICBmb3IgKDsgaSA8IG1heGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdHQxID0gdDFbaV0gfHwgZ2V0RW1wdHkodDJbaV0pO1xuICAgICAgICAgICAgICAgIHR0MiA9IHQyW2ldIHx8IGdldEVtcHR5KHR0MSk7XG4gICAgICAgICAgICAgICAgaWYgKCh0dDFbMF0gIT0gdHQyWzBdKSB8fFxuICAgICAgICAgICAgICAgICAgICAodHQxWzBdLnRvTG93ZXJDYXNlKCkgPT0gXCJyXCIgJiYgKHR0MVsyXSAhPSB0dDJbMl0gfHwgdHQxWzNdICE9IHR0MlszXSkpIHx8XG4gICAgICAgICAgICAgICAgICAgICh0dDFbMF0udG9Mb3dlckNhc2UoKSA9PSBcInNcIiAmJiAodHQxWzNdICE9IHR0MlszXSB8fCB0dDFbNF0gIT0gdHQyWzRdKSlcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZnJvbVtpXSA9IFtdO1xuICAgICAgICAgICAgICAgIHRvW2ldID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChqID0gMCwgamogPSBtbWF4KHR0MS5sZW5ndGgsIHR0Mi5sZW5ndGgpOyBqIDwgamo7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBqIGluIHR0MSAmJiAoZnJvbVtpXVtqXSA9IHR0MVtqXSk7XG4gICAgICAgICAgICAgICAgICAgIGogaW4gdHQyICYmICh0b1tpXVtqXSA9IHR0MltqXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBmcm9tOiBmcm9tLFxuICAgICAgICAgICAgICAgIHRvOiB0b1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICBSLl9nZXRDb250YWluZXIgPSBmdW5jdGlvbiAoeCwgeSwgdywgaCkge1xuICAgICAgICB2YXIgY29udGFpbmVyO1xuICAgICAgICBjb250YWluZXIgPSBoID09IG51bGwgJiYgIVIuaXMoeCwgXCJvYmplY3RcIikgPyBnLmRvYy5nZXRFbGVtZW50QnlJZCh4KSA6IHg7XG4gICAgICAgIGlmIChjb250YWluZXIgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb250YWluZXIudGFnTmFtZSkge1xuICAgICAgICAgICAgaWYgKHkgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcjogY29udGFpbmVyLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogY29udGFpbmVyLnN0eWxlLnBpeGVsV2lkdGggfHwgY29udGFpbmVyLm9mZnNldFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGNvbnRhaW5lci5zdHlsZS5waXhlbEhlaWdodCB8fCBjb250YWluZXIub2Zmc2V0SGVpZ2h0XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyOiBjb250YWluZXIsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiB5LFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb250YWluZXI6IDEsXG4gICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgIHdpZHRoOiB3LFxuICAgICAgICAgICAgaGVpZ2h0OiBoXG4gICAgICAgIH07XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5wYXRoVG9SZWxhdGl2ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVXRpbGl0eSBtZXRob2RcbiAgICAgKipcbiAgICAgKiBDb252ZXJ0cyBwYXRoIHRvIHJlbGF0aXZlIGZvcm1cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gcGF0aFN0cmluZyAoc3RyaW5nfGFycmF5KSBwYXRoIHN0cmluZyBvciBhcnJheSBvZiBzZWdtZW50c1xuICAgICA9IChhcnJheSkgYXJyYXkgb2Ygc2VnbWVudHMuXG4gICAgXFwqL1xuICAgIFIucGF0aFRvUmVsYXRpdmUgPSBwYXRoVG9SZWxhdGl2ZTtcbiAgICBSLl9lbmdpbmUgPSB7fTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5wYXRoMmN1cnZlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBVdGlsaXR5IG1ldGhvZFxuICAgICAqKlxuICAgICAqIENvbnZlcnRzIHBhdGggdG8gYSBuZXcgcGF0aCB3aGVyZSBhbGwgc2VnbWVudHMgYXJlIGN1YmljIGJlemllciBjdXJ2ZXMuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIHBhdGhTdHJpbmcgKHN0cmluZ3xhcnJheSkgcGF0aCBzdHJpbmcgb3IgYXJyYXkgb2Ygc2VnbWVudHNcbiAgICAgPSAoYXJyYXkpIGFycmF5IG9mIHNlZ21lbnRzLlxuICAgIFxcKi9cbiAgICBSLnBhdGgyY3VydmUgPSBwYXRoMmN1cnZlO1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLm1hdHJpeFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVXRpbGl0eSBtZXRob2RcbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIG1hdHJpeCBiYXNlZCBvbiBnaXZlbiBwYXJhbWV0ZXJzLlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBhIChudW1iZXIpXG4gICAgIC0gYiAobnVtYmVyKVxuICAgICAtIGMgKG51bWJlcilcbiAgICAgLSBkIChudW1iZXIpXG4gICAgIC0gZSAobnVtYmVyKVxuICAgICAtIGYgKG51bWJlcilcbiAgICAgPSAob2JqZWN0KSBATWF0cml4XG4gICAgXFwqL1xuICAgIFIubWF0cml4ID0gZnVuY3Rpb24gKGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXgoYSwgYiwgYywgZCwgZSwgZik7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBNYXRyaXgoYSwgYiwgYywgZCwgZSwgZikge1xuICAgICAgICBpZiAoYSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmEgPSArYTtcbiAgICAgICAgICAgIHRoaXMuYiA9ICtiO1xuICAgICAgICAgICAgdGhpcy5jID0gK2M7XG4gICAgICAgICAgICB0aGlzLmQgPSArZDtcbiAgICAgICAgICAgIHRoaXMuZSA9ICtlO1xuICAgICAgICAgICAgdGhpcy5mID0gK2Y7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmEgPSAxO1xuICAgICAgICAgICAgdGhpcy5iID0gMDtcbiAgICAgICAgICAgIHRoaXMuYyA9IDA7XG4gICAgICAgICAgICB0aGlzLmQgPSAxO1xuICAgICAgICAgICAgdGhpcy5lID0gMDtcbiAgICAgICAgICAgIHRoaXMuZiA9IDA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKGZ1bmN0aW9uIChtYXRyaXhwcm90bykge1xuICAgICAgICAvKlxcXG4gICAgICAgICAqIE1hdHJpeC5hZGRcbiAgICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIEFkZHMgZ2l2ZW4gbWF0cml4IHRvIGV4aXN0aW5nIG9uZS5cbiAgICAgICAgID4gUGFyYW1ldGVyc1xuICAgICAgICAgLSBhIChudW1iZXIpXG4gICAgICAgICAtIGIgKG51bWJlcilcbiAgICAgICAgIC0gYyAobnVtYmVyKVxuICAgICAgICAgLSBkIChudW1iZXIpXG4gICAgICAgICAtIGUgKG51bWJlcilcbiAgICAgICAgIC0gZiAobnVtYmVyKVxuICAgICAgICAgb3JcbiAgICAgICAgIC0gbWF0cml4IChvYmplY3QpIEBNYXRyaXhcbiAgICAgICAgXFwqL1xuICAgICAgICBtYXRyaXhwcm90by5hZGQgPSBmdW5jdGlvbiAoYSwgYiwgYywgZCwgZSwgZikge1xuICAgICAgICAgICAgdmFyIG91dCA9IFtbXSwgW10sIFtdXSxcbiAgICAgICAgICAgICAgICBtID0gW1t0aGlzLmEsIHRoaXMuYywgdGhpcy5lXSwgW3RoaXMuYiwgdGhpcy5kLCB0aGlzLmZdLCBbMCwgMCwgMV1dLFxuICAgICAgICAgICAgICAgIG1hdHJpeCA9IFtbYSwgYywgZV0sIFtiLCBkLCBmXSwgWzAsIDAsIDFdXSxcbiAgICAgICAgICAgICAgICB4LCB5LCB6LCByZXM7XG5cbiAgICAgICAgICAgIGlmIChhICYmIGEgaW5zdGFuY2VvZiBNYXRyaXgpIHtcbiAgICAgICAgICAgICAgICBtYXRyaXggPSBbW2EuYSwgYS5jLCBhLmVdLCBbYS5iLCBhLmQsIGEuZl0sIFswLCAwLCAxXV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAoeCA9IDA7IHggPCAzOyB4KyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKHkgPSAwOyB5IDwgMzsgeSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcyA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoeiA9IDA7IHogPCAzOyB6KyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcyArPSBtW3hdW3pdICogbWF0cml4W3pdW3ldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG91dFt4XVt5XSA9IHJlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmEgPSBvdXRbMF1bMF07XG4gICAgICAgICAgICB0aGlzLmIgPSBvdXRbMV1bMF07XG4gICAgICAgICAgICB0aGlzLmMgPSBvdXRbMF1bMV07XG4gICAgICAgICAgICB0aGlzLmQgPSBvdXRbMV1bMV07XG4gICAgICAgICAgICB0aGlzLmUgPSBvdXRbMF1bMl07XG4gICAgICAgICAgICB0aGlzLmYgPSBvdXRbMV1bMl07XG4gICAgICAgIH07XG4gICAgICAgIC8qXFxcbiAgICAgICAgICogTWF0cml4LmludmVydFxuICAgICAgICAgWyBtZXRob2QgXVxuICAgICAgICAgKipcbiAgICAgICAgICogUmV0dXJucyBpbnZlcnRlZCB2ZXJzaW9uIG9mIHRoZSBtYXRyaXhcbiAgICAgICAgID0gKG9iamVjdCkgQE1hdHJpeFxuICAgICAgICBcXCovXG4gICAgICAgIG1hdHJpeHByb3RvLmludmVydCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBtZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgeCA9IG1lLmEgKiBtZS5kIC0gbWUuYiAqIG1lLmM7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE1hdHJpeChtZS5kIC8geCwgLW1lLmIgLyB4LCAtbWUuYyAvIHgsIG1lLmEgLyB4LCAobWUuYyAqIG1lLmYgLSBtZS5kICogbWUuZSkgLyB4LCAobWUuYiAqIG1lLmUgLSBtZS5hICogbWUuZikgLyB4KTtcbiAgICAgICAgfTtcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBNYXRyaXguY2xvbmVcbiAgICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIFJldHVybnMgY29weSBvZiB0aGUgbWF0cml4XG4gICAgICAgICA9IChvYmplY3QpIEBNYXRyaXhcbiAgICAgICAgXFwqL1xuICAgICAgICBtYXRyaXhwcm90by5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWF0cml4KHRoaXMuYSwgdGhpcy5iLCB0aGlzLmMsIHRoaXMuZCwgdGhpcy5lLCB0aGlzLmYpO1xuICAgICAgICB9O1xuICAgICAgICAvKlxcXG4gICAgICAgICAqIE1hdHJpeC50cmFuc2xhdGVcbiAgICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIFRyYW5zbGF0ZSB0aGUgbWF0cml4XG4gICAgICAgICA+IFBhcmFtZXRlcnNcbiAgICAgICAgIC0geCAobnVtYmVyKVxuICAgICAgICAgLSB5IChudW1iZXIpXG4gICAgICAgIFxcKi9cbiAgICAgICAgbWF0cml4cHJvdG8udHJhbnNsYXRlID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkKDEsIDAsIDAsIDEsIHgsIHkpO1xuICAgICAgICB9O1xuICAgICAgICAvKlxcXG4gICAgICAgICAqIE1hdHJpeC5zY2FsZVxuICAgICAgICAgWyBtZXRob2QgXVxuICAgICAgICAgKipcbiAgICAgICAgICogU2NhbGVzIHRoZSBtYXRyaXhcbiAgICAgICAgID4gUGFyYW1ldGVyc1xuICAgICAgICAgLSB4IChudW1iZXIpXG4gICAgICAgICAtIHkgKG51bWJlcikgI29wdGlvbmFsXG4gICAgICAgICAtIGN4IChudW1iZXIpICNvcHRpb25hbFxuICAgICAgICAgLSBjeSAobnVtYmVyKSAjb3B0aW9uYWxcbiAgICAgICAgXFwqL1xuICAgICAgICBtYXRyaXhwcm90by5zY2FsZSA9IGZ1bmN0aW9uICh4LCB5LCBjeCwgY3kpIHtcbiAgICAgICAgICAgIHkgPT0gbnVsbCAmJiAoeSA9IHgpO1xuICAgICAgICAgICAgKGN4IHx8IGN5KSAmJiB0aGlzLmFkZCgxLCAwLCAwLCAxLCBjeCwgY3kpO1xuICAgICAgICAgICAgdGhpcy5hZGQoeCwgMCwgMCwgeSwgMCwgMCk7XG4gICAgICAgICAgICAoY3ggfHwgY3kpICYmIHRoaXMuYWRkKDEsIDAsIDAsIDEsIC1jeCwgLWN5KTtcbiAgICAgICAgfTtcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBNYXRyaXgucm90YXRlXG4gICAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBSb3RhdGVzIHRoZSBtYXRyaXhcbiAgICAgICAgID4gUGFyYW1ldGVyc1xuICAgICAgICAgLSBhIChudW1iZXIpXG4gICAgICAgICAtIHggKG51bWJlcilcbiAgICAgICAgIC0geSAobnVtYmVyKVxuICAgICAgICBcXCovXG4gICAgICAgIG1hdHJpeHByb3RvLnJvdGF0ZSA9IGZ1bmN0aW9uIChhLCB4LCB5KSB7XG4gICAgICAgICAgICBhID0gUi5yYWQoYSk7XG4gICAgICAgICAgICB4ID0geCB8fCAwO1xuICAgICAgICAgICAgeSA9IHkgfHwgMDtcbiAgICAgICAgICAgIHZhciBjb3MgPSArbWF0aC5jb3MoYSkudG9GaXhlZCg5KSxcbiAgICAgICAgICAgICAgICBzaW4gPSArbWF0aC5zaW4oYSkudG9GaXhlZCg5KTtcbiAgICAgICAgICAgIHRoaXMuYWRkKGNvcywgc2luLCAtc2luLCBjb3MsIHgsIHkpO1xuICAgICAgICAgICAgdGhpcy5hZGQoMSwgMCwgMCwgMSwgLXgsIC15KTtcbiAgICAgICAgfTtcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBNYXRyaXgueFxuICAgICAgICAgWyBtZXRob2QgXVxuICAgICAgICAgKipcbiAgICAgICAgICogUmV0dXJuIHggY29vcmRpbmF0ZSBmb3IgZ2l2ZW4gcG9pbnQgYWZ0ZXIgdHJhbnNmb3JtYXRpb24gZGVzY3JpYmVkIGJ5IHRoZSBtYXRyaXguIFNlZSBhbHNvIEBNYXRyaXgueVxuICAgICAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICAgICAtIHggKG51bWJlcilcbiAgICAgICAgIC0geSAobnVtYmVyKVxuICAgICAgICAgPSAobnVtYmVyKSB4XG4gICAgICAgIFxcKi9cbiAgICAgICAgbWF0cml4cHJvdG8ueCA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgICAgICByZXR1cm4geCAqIHRoaXMuYSArIHkgKiB0aGlzLmMgKyB0aGlzLmU7XG4gICAgICAgIH07XG4gICAgICAgIC8qXFxcbiAgICAgICAgICogTWF0cml4LnlcbiAgICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIFJldHVybiB5IGNvb3JkaW5hdGUgZm9yIGdpdmVuIHBvaW50IGFmdGVyIHRyYW5zZm9ybWF0aW9uIGRlc2NyaWJlZCBieSB0aGUgbWF0cml4LiBTZWUgYWxzbyBATWF0cml4LnhcbiAgICAgICAgID4gUGFyYW1ldGVyc1xuICAgICAgICAgLSB4IChudW1iZXIpXG4gICAgICAgICAtIHkgKG51bWJlcilcbiAgICAgICAgID0gKG51bWJlcikgeVxuICAgICAgICBcXCovXG4gICAgICAgIG1hdHJpeHByb3RvLnkgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICAgICAgcmV0dXJuIHggKiB0aGlzLmIgKyB5ICogdGhpcy5kICsgdGhpcy5mO1xuICAgICAgICB9O1xuICAgICAgICBtYXRyaXhwcm90by5nZXQgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgcmV0dXJuICt0aGlzW1N0ci5mcm9tQ2hhckNvZGUoOTcgKyBpKV0udG9GaXhlZCg0KTtcbiAgICAgICAgfTtcbiAgICAgICAgbWF0cml4cHJvdG8udG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gUi5zdmcgP1xuICAgICAgICAgICAgICAgIFwibWF0cml4KFwiICsgW3RoaXMuZ2V0KDApLCB0aGlzLmdldCgxKSwgdGhpcy5nZXQoMiksIHRoaXMuZ2V0KDMpLCB0aGlzLmdldCg0KSwgdGhpcy5nZXQoNSldLmpvaW4oKSArIFwiKVwiIDpcbiAgICAgICAgICAgICAgICBbdGhpcy5nZXQoMCksIHRoaXMuZ2V0KDIpLCB0aGlzLmdldCgxKSwgdGhpcy5nZXQoMyksIDAsIDBdLmpvaW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgbWF0cml4cHJvdG8udG9GaWx0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuTWF0cml4KE0xMT1cIiArIHRoaXMuZ2V0KDApICtcbiAgICAgICAgICAgICAgICBcIiwgTTEyPVwiICsgdGhpcy5nZXQoMikgKyBcIiwgTTIxPVwiICsgdGhpcy5nZXQoMSkgKyBcIiwgTTIyPVwiICsgdGhpcy5nZXQoMykgK1xuICAgICAgICAgICAgICAgIFwiLCBEeD1cIiArIHRoaXMuZ2V0KDQpICsgXCIsIER5PVwiICsgdGhpcy5nZXQoNSkgKyBcIiwgc2l6aW5nbWV0aG9kPSdhdXRvIGV4cGFuZCcpXCI7XG4gICAgICAgIH07XG4gICAgICAgIG1hdHJpeHByb3RvLm9mZnNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBbdGhpcy5lLnRvRml4ZWQoNCksIHRoaXMuZi50b0ZpeGVkKDQpXTtcbiAgICAgICAgfTtcbiAgICAgICAgZnVuY3Rpb24gbm9ybShhKSB7XG4gICAgICAgICAgICByZXR1cm4gYVswXSAqIGFbMF0gKyBhWzFdICogYVsxXTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBub3JtYWxpemUoYSkge1xuICAgICAgICAgICAgdmFyIG1hZyA9IG1hdGguc3FydChub3JtKGEpKTtcbiAgICAgICAgICAgIGFbMF0gJiYgKGFbMF0gLz0gbWFnKTtcbiAgICAgICAgICAgIGFbMV0gJiYgKGFbMV0gLz0gbWFnKTtcbiAgICAgICAgfVxuICAgICAgICAvKlxcXG4gICAgICAgICAqIE1hdHJpeC5zcGxpdFxuICAgICAgICAgWyBtZXRob2QgXVxuICAgICAgICAgKipcbiAgICAgICAgICogU3BsaXRzIG1hdHJpeCBpbnRvIHByaW1pdGl2ZSB0cmFuc2Zvcm1hdGlvbnNcbiAgICAgICAgID0gKG9iamVjdCkgaW4gZm9ybWF0OlxuICAgICAgICAgbyBkeCAobnVtYmVyKSB0cmFuc2xhdGlvbiBieSB4XG4gICAgICAgICBvIGR5IChudW1iZXIpIHRyYW5zbGF0aW9uIGJ5IHlcbiAgICAgICAgIG8gc2NhbGV4IChudW1iZXIpIHNjYWxlIGJ5IHhcbiAgICAgICAgIG8gc2NhbGV5IChudW1iZXIpIHNjYWxlIGJ5IHlcbiAgICAgICAgIG8gc2hlYXIgKG51bWJlcikgc2hlYXJcbiAgICAgICAgIG8gcm90YXRlIChudW1iZXIpIHJvdGF0aW9uIGluIGRlZ1xuICAgICAgICAgbyBpc1NpbXBsZSAoYm9vbGVhbikgY291bGQgaXQgYmUgcmVwcmVzZW50ZWQgdmlhIHNpbXBsZSB0cmFuc2Zvcm1hdGlvbnNcbiAgICAgICAgXFwqL1xuICAgICAgICBtYXRyaXhwcm90by5zcGxpdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBvdXQgPSB7fTtcbiAgICAgICAgICAgIC8vIHRyYW5zbGF0aW9uXG4gICAgICAgICAgICBvdXQuZHggPSB0aGlzLmU7XG4gICAgICAgICAgICBvdXQuZHkgPSB0aGlzLmY7XG5cbiAgICAgICAgICAgIC8vIHNjYWxlIGFuZCBzaGVhclxuICAgICAgICAgICAgdmFyIHJvdyA9IFtbdGhpcy5hLCB0aGlzLmNdLCBbdGhpcy5iLCB0aGlzLmRdXTtcbiAgICAgICAgICAgIG91dC5zY2FsZXggPSBtYXRoLnNxcnQobm9ybShyb3dbMF0pKTtcbiAgICAgICAgICAgIG5vcm1hbGl6ZShyb3dbMF0pO1xuXG4gICAgICAgICAgICBvdXQuc2hlYXIgPSByb3dbMF1bMF0gKiByb3dbMV1bMF0gKyByb3dbMF1bMV0gKiByb3dbMV1bMV07XG4gICAgICAgICAgICByb3dbMV0gPSBbcm93WzFdWzBdIC0gcm93WzBdWzBdICogb3V0LnNoZWFyLCByb3dbMV1bMV0gLSByb3dbMF1bMV0gKiBvdXQuc2hlYXJdO1xuXG4gICAgICAgICAgICBvdXQuc2NhbGV5ID0gbWF0aC5zcXJ0KG5vcm0ocm93WzFdKSk7XG4gICAgICAgICAgICBub3JtYWxpemUocm93WzFdKTtcbiAgICAgICAgICAgIG91dC5zaGVhciAvPSBvdXQuc2NhbGV5O1xuXG4gICAgICAgICAgICAvLyByb3RhdGlvblxuICAgICAgICAgICAgdmFyIHNpbiA9IC1yb3dbMF1bMV0sXG4gICAgICAgICAgICAgICAgY29zID0gcm93WzFdWzFdO1xuICAgICAgICAgICAgaWYgKGNvcyA8IDApIHtcbiAgICAgICAgICAgICAgICBvdXQucm90YXRlID0gUi5kZWcobWF0aC5hY29zKGNvcykpO1xuICAgICAgICAgICAgICAgIGlmIChzaW4gPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dC5yb3RhdGUgPSAzNjAgLSBvdXQucm90YXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3V0LnJvdGF0ZSA9IFIuZGVnKG1hdGguYXNpbihzaW4pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3V0LmlzU2ltcGxlID0gIStvdXQuc2hlYXIudG9GaXhlZCg5KSAmJiAob3V0LnNjYWxleC50b0ZpeGVkKDkpID09IG91dC5zY2FsZXkudG9GaXhlZCg5KSB8fCAhb3V0LnJvdGF0ZSk7XG4gICAgICAgICAgICBvdXQuaXNTdXBlclNpbXBsZSA9ICErb3V0LnNoZWFyLnRvRml4ZWQoOSkgJiYgb3V0LnNjYWxleC50b0ZpeGVkKDkpID09IG91dC5zY2FsZXkudG9GaXhlZCg5KSAmJiAhb3V0LnJvdGF0ZTtcbiAgICAgICAgICAgIG91dC5ub1JvdGF0aW9uID0gIStvdXQuc2hlYXIudG9GaXhlZCg5KSAmJiAhb3V0LnJvdGF0ZTtcbiAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgIH07XG4gICAgICAgIC8qXFxcbiAgICAgICAgICogTWF0cml4LnRvVHJhbnNmb3JtU3RyaW5nXG4gICAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBSZXR1cm4gdHJhbnNmb3JtIHN0cmluZyB0aGF0IHJlcHJlc2VudHMgZ2l2ZW4gbWF0cml4XG4gICAgICAgICA9IChzdHJpbmcpIHRyYW5zZm9ybSBzdHJpbmdcbiAgICAgICAgXFwqL1xuICAgICAgICBtYXRyaXhwcm90by50b1RyYW5zZm9ybVN0cmluZyA9IGZ1bmN0aW9uIChzaG9ydGVyKSB7XG4gICAgICAgICAgICB2YXIgcyA9IHNob3J0ZXIgfHwgdGhpc1tzcGxpdF0oKTtcbiAgICAgICAgICAgIGlmIChzLmlzU2ltcGxlKSB7XG4gICAgICAgICAgICAgICAgcy5zY2FsZXggPSArcy5zY2FsZXgudG9GaXhlZCg0KTtcbiAgICAgICAgICAgICAgICBzLnNjYWxleSA9ICtzLnNjYWxleS50b0ZpeGVkKDQpO1xuICAgICAgICAgICAgICAgIHMucm90YXRlID0gK3Mucm90YXRlLnRvRml4ZWQoNCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICAocy5keCB8fCBzLmR5ID8gXCJ0XCIgKyBbcy5keCwgcy5keV0gOiBFKSArIFxuICAgICAgICAgICAgICAgICAgICAgICAgKHMuc2NhbGV4ICE9IDEgfHwgcy5zY2FsZXkgIT0gMSA/IFwic1wiICsgW3Muc2NhbGV4LCBzLnNjYWxleSwgMCwgMF0gOiBFKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAocy5yb3RhdGUgPyBcInJcIiArIFtzLnJvdGF0ZSwgMCwgMF0gOiBFKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwibVwiICsgW3RoaXMuZ2V0KDApLCB0aGlzLmdldCgxKSwgdGhpcy5nZXQoMiksIHRoaXMuZ2V0KDMpLCB0aGlzLmdldCg0KSwgdGhpcy5nZXQoNSldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pKE1hdHJpeC5wcm90b3R5cGUpO1xuXG4gICAgLy8gV2ViS2l0IHJlbmRlcmluZyBidWcgd29ya2Fyb3VuZCBtZXRob2RcbiAgICB2YXIgdmVyc2lvbiA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1ZlcnNpb25cXC8oLio/KVxccy8pIHx8IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0Nocm9tZVxcLyhcXGQrKS8pO1xuICAgIGlmICgobmF2aWdhdG9yLnZlbmRvciA9PSBcIkFwcGxlIENvbXB1dGVyLCBJbmMuXCIpICYmICh2ZXJzaW9uICYmIHZlcnNpb25bMV0gPCA0IHx8IG5hdmlnYXRvci5wbGF0Zm9ybS5zbGljZSgwLCAyKSA9PSBcImlQXCIpIHx8XG4gICAgICAgIChuYXZpZ2F0b3IudmVuZG9yID09IFwiR29vZ2xlIEluYy5cIiAmJiB2ZXJzaW9uICYmIHZlcnNpb25bMV0gPCA4KSkge1xuICAgICAgICAvKlxcXG4gICAgICAgICAqIFBhcGVyLnNhZmFyaVxuICAgICAgICAgWyBtZXRob2QgXVxuICAgICAgICAgKipcbiAgICAgICAgICogVGhlcmUgaXMgYW4gaW5jb252ZW5pZW50IHJlbmRlcmluZyBidWcgaW4gU2FmYXJpIChXZWJLaXQpOlxuICAgICAgICAgKiBzb21ldGltZXMgdGhlIHJlbmRlcmluZyBzaG91bGQgYmUgZm9yY2VkLlxuICAgICAgICAgKiBUaGlzIG1ldGhvZCBzaG91bGQgaGVscCB3aXRoIGRlYWxpbmcgd2l0aCB0aGlzIGJ1Zy5cbiAgICAgICAgXFwqL1xuICAgICAgICBwYXBlcnByb3RvLnNhZmFyaSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciByZWN0ID0gdGhpcy5yZWN0KC05OSwgLTk5LCB0aGlzLndpZHRoICsgOTksIHRoaXMuaGVpZ2h0ICsgOTkpLmF0dHIoe3N0cm9rZTogXCJub25lXCJ9KTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge3JlY3QucmVtb3ZlKCk7fSk7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcGFwZXJwcm90by5zYWZhcmkgPSBmdW47XG4gICAgfVxuIFxuICAgIHZhciBwcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgIH0sXG4gICAgcHJldmVudFRvdWNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcmlnaW5hbEV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSxcbiAgICBzdG9wUHJvcGFnYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2FuY2VsQnViYmxlID0gdHJ1ZTtcbiAgICB9LFxuICAgIHN0b3BUb3VjaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3JpZ2luYWxFdmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9LFxuICAgIGFkZEV2ZW50ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGcuZG9jLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCB0eXBlLCBmbiwgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHZhciByZWFsTmFtZSA9IHN1cHBvcnRzVG91Y2ggJiYgdG91Y2hNYXBbdHlwZV0gPyB0b3VjaE1hcFt0eXBlXSA6IHR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGYgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNjcm9sbFkgPSBnLmRvYy5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGcuZG9jLmJvZHkuc2Nyb2xsVG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbFggPSBnLmRvYy5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCB8fCBnLmRvYy5ib2R5LnNjcm9sbExlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeCA9IGUuY2xpZW50WCArIHNjcm9sbFgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeSA9IGUuY2xpZW50WSArIHNjcm9sbFk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdXBwb3J0c1RvdWNoICYmIHRvdWNoTWFwW2hhc10odHlwZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IGUudGFyZ2V0VG91Y2hlcyAmJiBlLnRhcmdldFRvdWNoZXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLnRhcmdldFRvdWNoZXNbaV0udGFyZ2V0ID09IG9iaikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2xkZSA9IGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUgPSBlLnRhcmdldFRvdWNoZXNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUub3JpZ2luYWxFdmVudCA9IG9sZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQgPSBwcmV2ZW50VG91Y2g7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uID0gc3RvcFRvdWNoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZuLmNhbGwoZWxlbWVudCwgZSwgeCwgeSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBvYmouYWRkRXZlbnRMaXN0ZW5lcihyZWFsTmFtZSwgZiwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5yZW1vdmVFdmVudExpc3RlbmVyKHJlYWxOYW1lLCBmLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKGcuZG9jLmF0dGFjaEV2ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgdHlwZSwgZm4sIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZiA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGUgPSBlIHx8IGcud2luLmV2ZW50O1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2Nyb2xsWSA9IGcuZG9jLmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgfHwgZy5kb2MuYm9keS5zY3JvbGxUb3AsXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxYID0gZy5kb2MuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQgfHwgZy5kb2MuYm9keS5zY3JvbGxMZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgeCA9IGUuY2xpZW50WCArIHNjcm9sbFgsXG4gICAgICAgICAgICAgICAgICAgICAgICB5ID0gZS5jbGllbnRZICsgc2Nyb2xsWTtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCA9IGUucHJldmVudERlZmF1bHQgfHwgcHJldmVudERlZmF1bHQ7XG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uID0gZS5zdG9wUHJvcGFnYXRpb24gfHwgc3RvcFByb3BhZ2F0aW9uO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm4uY2FsbChlbGVtZW50LCBlLCB4LCB5KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIG9iai5hdHRhY2hFdmVudChcIm9uXCIgKyB0eXBlLCBmKTtcbiAgICAgICAgICAgICAgICB2YXIgZGV0YWNoZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5kZXRhY2hFdmVudChcIm9uXCIgKyB0eXBlLCBmKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGV0YWNoZXI7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSkoKSxcbiAgICBkcmFnID0gW10sXG4gICAgZHJhZ01vdmUgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgeCA9IGUuY2xpZW50WCxcbiAgICAgICAgICAgIHkgPSBlLmNsaWVudFksXG4gICAgICAgICAgICBzY3JvbGxZID0gZy5kb2MuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBnLmRvYy5ib2R5LnNjcm9sbFRvcCxcbiAgICAgICAgICAgIHNjcm9sbFggPSBnLmRvYy5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCB8fCBnLmRvYy5ib2R5LnNjcm9sbExlZnQsXG4gICAgICAgICAgICBkcmFnaSxcbiAgICAgICAgICAgIGogPSBkcmFnLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKGotLSkge1xuICAgICAgICAgICAgZHJhZ2kgPSBkcmFnW2pdO1xuICAgICAgICAgICAgaWYgKHN1cHBvcnRzVG91Y2gpIHtcbiAgICAgICAgICAgICAgICB2YXIgaSA9IGUudG91Y2hlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIHRvdWNoO1xuICAgICAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgdG91Y2ggPSBlLnRvdWNoZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b3VjaC5pZGVudGlmaWVyID09IGRyYWdpLmVsLl9kcmFnLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4ID0gdG91Y2guY2xpZW50WDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgPSB0b3VjaC5jbGllbnRZO1xuICAgICAgICAgICAgICAgICAgICAgICAgKGUub3JpZ2luYWxFdmVudCA/IGUub3JpZ2luYWxFdmVudCA6IGUpLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG5vZGUgPSBkcmFnaS5lbC5ub2RlLFxuICAgICAgICAgICAgICAgIG8sXG4gICAgICAgICAgICAgICAgbmV4dCA9IG5vZGUubmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlLFxuICAgICAgICAgICAgICAgIGRpc3BsYXkgPSBub2RlLnN0eWxlLmRpc3BsYXk7XG4gICAgICAgICAgICBnLndpbi5vcGVyYSAmJiBwYXJlbnQucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICAgICAgICBub2RlLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIG8gPSBkcmFnaS5lbC5wYXBlci5nZXRFbGVtZW50QnlQb2ludCh4LCB5KTtcbiAgICAgICAgICAgIG5vZGUuc3R5bGUuZGlzcGxheSA9IGRpc3BsYXk7XG4gICAgICAgICAgICBnLndpbi5vcGVyYSAmJiAobmV4dCA/IHBhcmVudC5pbnNlcnRCZWZvcmUobm9kZSwgbmV4dCkgOiBwYXJlbnQuYXBwZW5kQ2hpbGQobm9kZSkpO1xuICAgICAgICAgICAgbyAmJiBldmUoXCJyYXBoYWVsLmRyYWcub3Zlci5cIiArIGRyYWdpLmVsLmlkLCBkcmFnaS5lbCwgbyk7XG4gICAgICAgICAgICB4ICs9IHNjcm9sbFg7XG4gICAgICAgICAgICB5ICs9IHNjcm9sbFk7XG4gICAgICAgICAgICBldmUoXCJyYXBoYWVsLmRyYWcubW92ZS5cIiArIGRyYWdpLmVsLmlkLCBkcmFnaS5tb3ZlX3Njb3BlIHx8IGRyYWdpLmVsLCB4IC0gZHJhZ2kuZWwuX2RyYWcueCwgeSAtIGRyYWdpLmVsLl9kcmFnLnksIHgsIHksIGUpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBkcmFnVXAgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICBSLnVubW91c2Vtb3ZlKGRyYWdNb3ZlKS51bm1vdXNldXAoZHJhZ1VwKTtcbiAgICAgICAgdmFyIGkgPSBkcmFnLmxlbmd0aCxcbiAgICAgICAgICAgIGRyYWdpO1xuICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICBkcmFnaSA9IGRyYWdbaV07XG4gICAgICAgICAgICBkcmFnaS5lbC5fZHJhZyA9IHt9O1xuICAgICAgICAgICAgZXZlKFwicmFwaGFlbC5kcmFnLmVuZC5cIiArIGRyYWdpLmVsLmlkLCBkcmFnaS5lbmRfc2NvcGUgfHwgZHJhZ2kuc3RhcnRfc2NvcGUgfHwgZHJhZ2kubW92ZV9zY29wZSB8fCBkcmFnaS5lbCwgZSk7XG4gICAgICAgIH1cbiAgICAgICAgZHJhZyA9IFtdO1xuICAgIH0sXG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuZWxcbiAgICAgWyBwcm9wZXJ0eSAob2JqZWN0KSBdXG4gICAgICoqXG4gICAgICogWW91IGNhbiBhZGQgeW91ciBvd24gbWV0aG9kIHRvIGVsZW1lbnRzLiBUaGlzIGlzIHVzZWZ1bGwgd2hlbiB5b3Ugd2FudCB0byBoYWNrIGRlZmF1bHQgZnVuY3Rpb25hbGl0eSBvclxuICAgICAqIHdhbnQgdG8gd3JhcCBzb21lIGNvbW1vbiB0cmFuc2Zvcm1hdGlvbiBvciBhdHRyaWJ1dGVzIGluIG9uZSBtZXRob2QuIEluIGRpZmZlcmVuY2UgdG8gY2FudmFzIG1ldGhvZHMsXG4gICAgICogeW91IGNhbiByZWRlZmluZSBlbGVtZW50IG1ldGhvZCBhdCBhbnkgdGltZS4gRXhwZW5kaW5nIGVsZW1lbnQgbWV0aG9kcyB3b3VsZG7igJl0IGFmZmVjdCBzZXQuXG4gICAgID4gVXNhZ2VcbiAgICAgfCBSYXBoYWVsLmVsLnJlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgfCAgICAgdGhpcy5hdHRyKHtmaWxsOiBcIiNmMDBcIn0pO1xuICAgICB8IH07XG4gICAgIHwgLy8gdGhlbiB1c2UgaXRcbiAgICAgfCBwYXBlci5jaXJjbGUoMTAwLCAxMDAsIDIwKS5yZWQoKTtcbiAgICBcXCovXG4gICAgZWxwcm90byA9IFIuZWwgPSB7fTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5jbGlja1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBldmVudCBoYW5kbGVyIGZvciBjbGljayBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC51bmNsaWNrXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGV2ZW50IGhhbmRsZXIgZm9yIGNsaWNrIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIFxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmRibGNsaWNrXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGV2ZW50IGhhbmRsZXIgZm9yIGRvdWJsZSBjbGljayBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC51bmRibGNsaWNrXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGV2ZW50IGhhbmRsZXIgZm9yIGRvdWJsZSBjbGljayBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5tb3VzZWRvd25cbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgZXZlbnQgaGFuZGxlciBmb3IgbW91c2Vkb3duIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnVubW91c2Vkb3duXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGV2ZW50IGhhbmRsZXIgZm9yIG1vdXNlZG93biBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5tb3VzZW1vdmVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgZXZlbnQgaGFuZGxlciBmb3IgbW91c2Vtb3ZlIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnVubW91c2Vtb3ZlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGV2ZW50IGhhbmRsZXIgZm9yIG1vdXNlbW92ZSBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5tb3VzZW91dFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBldmVudCBoYW5kbGVyIGZvciBtb3VzZW91dCBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC51bm1vdXNlb3V0XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGV2ZW50IGhhbmRsZXIgZm9yIG1vdXNlb3V0IGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIFxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50Lm1vdXNlb3ZlclxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBldmVudCBoYW5kbGVyIGZvciBtb3VzZW92ZXIgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW5tb3VzZW92ZXJcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlciBmb3IgbW91c2VvdmVyIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIFxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50Lm1vdXNldXBcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgZXZlbnQgaGFuZGxlciBmb3IgbW91c2V1cCBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC51bm1vdXNldXBcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlciBmb3IgbW91c2V1cCBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC50b3VjaHN0YXJ0XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGV2ZW50IGhhbmRsZXIgZm9yIHRvdWNoc3RhcnQgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW50b3VjaHN0YXJ0XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGV2ZW50IGhhbmRsZXIgZm9yIHRvdWNoc3RhcnQgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudG91Y2htb3ZlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGV2ZW50IGhhbmRsZXIgZm9yIHRvdWNobW92ZSBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC51bnRvdWNobW92ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBldmVudCBoYW5kbGVyIGZvciB0b3VjaG1vdmUgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudG91Y2hlbmRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgZXZlbnQgaGFuZGxlciBmb3IgdG91Y2hlbmQgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW50b3VjaGVuZFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBldmVudCBoYW5kbGVyIGZvciB0b3VjaGVuZCBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC50b3VjaGNhbmNlbFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBldmVudCBoYW5kbGVyIGZvciB0b3VjaGNhbmNlbCBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC51bnRvdWNoY2FuY2VsXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGV2ZW50IGhhbmRsZXIgZm9yIHRvdWNoY2FuY2VsIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIGZvciAodmFyIGkgPSBldmVudHMubGVuZ3RoOyBpLS07KSB7XG4gICAgICAgIChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICAgICAgICBSW2V2ZW50TmFtZV0gPSBlbHByb3RvW2V2ZW50TmFtZV0gPSBmdW5jdGlvbiAoZm4sIHNjb3BlKSB7XG4gICAgICAgICAgICAgICAgaWYgKFIuaXMoZm4sIFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ldmVudHMgPSB0aGlzLmV2ZW50cyB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ldmVudHMucHVzaCh7bmFtZTogZXZlbnROYW1lLCBmOiBmbiwgdW5iaW5kOiBhZGRFdmVudCh0aGlzLnNoYXBlIHx8IHRoaXMubm9kZSB8fCBnLmRvYywgZXZlbnROYW1lLCBmbiwgc2NvcGUgfHwgdGhpcyl9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgUltcInVuXCIgKyBldmVudE5hbWVdID0gZWxwcm90b1tcInVuXCIgKyBldmVudE5hbWVdID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50cyA9IHRoaXMuZXZlbnRzIHx8IFtdLFxuICAgICAgICAgICAgICAgICAgICBsID0gZXZlbnRzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB3aGlsZSAobC0tKSBpZiAoZXZlbnRzW2xdLm5hbWUgPT0gZXZlbnROYW1lICYmIGV2ZW50c1tsXS5mID09IGZuKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50c1tsXS51bmJpbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzLnNwbGljZShsLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgIWV2ZW50cy5sZW5ndGggJiYgZGVsZXRlIHRoaXMuZXZlbnRzO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KShldmVudHNbaV0pO1xuICAgIH1cbiAgICBcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5kYXRhXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIG9yIHJldHJpZXZlcyBnaXZlbiB2YWx1ZSBhc29jaWF0ZWQgd2l0aCBnaXZlbiBrZXkuXG4gICAgICoqIFxuICAgICAqIFNlZSBhbHNvIEBFbGVtZW50LnJlbW92ZURhdGFcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0ga2V5IChzdHJpbmcpIGtleSB0byBzdG9yZSBkYXRhXG4gICAgIC0gdmFsdWUgKGFueSkgI29wdGlvbmFsIHZhbHVlIHRvIHN0b3JlXG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICAgKiBvciwgaWYgdmFsdWUgaXMgbm90IHNwZWNpZmllZDpcbiAgICAgPSAoYW55KSB2YWx1ZVxuICAgICA+IFVzYWdlXG4gICAgIHwgZm9yICh2YXIgaSA9IDAsIGkgPCA1LCBpKyspIHtcbiAgICAgfCAgICAgcGFwZXIuY2lyY2xlKDEwICsgMTUgKiBpLCAxMCwgMTApXG4gICAgIHwgICAgICAgICAgLmF0dHIoe2ZpbGw6IFwiIzAwMFwifSlcbiAgICAgfCAgICAgICAgICAuZGF0YShcImlcIiwgaSlcbiAgICAgfCAgICAgICAgICAuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICB8ICAgICAgICAgICAgIGFsZXJ0KHRoaXMuZGF0YShcImlcIikpO1xuICAgICB8ICAgICAgICAgIH0pO1xuICAgICB8IH1cbiAgICBcXCovXG4gICAgZWxwcm90by5kYXRhID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBlbGRhdGFbdGhpcy5pZF0gPSBlbGRhdGFbdGhpcy5pZF0gfHwge307XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgIGlmIChSLmlzKGtleSwgXCJvYmplY3RcIikpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGtleSkgaWYgKGtleVtoYXNdKGkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YShpLCBrZXlbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV2ZShcInJhcGhhZWwuZGF0YS5nZXQuXCIgKyB0aGlzLmlkLCB0aGlzLCBkYXRhW2tleV0sIGtleSk7XG4gICAgICAgICAgICByZXR1cm4gZGF0YVtrZXldO1xuICAgICAgICB9XG4gICAgICAgIGRhdGFba2V5XSA9IHZhbHVlO1xuICAgICAgICBldmUoXCJyYXBoYWVsLmRhdGEuc2V0LlwiICsgdGhpcy5pZCwgdGhpcywgdmFsdWUsIGtleSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQucmVtb3ZlRGF0YVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggYW4gZWxlbWVudCBieSBnaXZlbiBrZXkuXG4gICAgICogSWYga2V5IGlzIG5vdCBwcm92aWRlZCwgcmVtb3ZlcyBhbGwgdGhlIGRhdGEgb2YgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGtleSAoc3RyaW5nKSAjb3B0aW9uYWwga2V5XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by5yZW1vdmVEYXRhID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpZiAoa2V5ID09IG51bGwpIHtcbiAgICAgICAgICAgIGVsZGF0YVt0aGlzLmlkXSA9IHt9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxkYXRhW3RoaXMuaWRdICYmIGRlbGV0ZSBlbGRhdGFbdGhpcy5pZF1ba2V5XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgICAvKlxcXG4gICAgICogRWxlbWVudC5nZXREYXRhXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXRyaWV2ZXMgdGhlIGVsZW1lbnQgZGF0YVxuICAgICA9IChvYmplY3QpIGRhdGFcbiAgICBcXCovXG4gICAgZWxwcm90by5nZXREYXRhID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gY2xvbmUoZWxkYXRhW3RoaXMuaWRdIHx8IHt9KTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmhvdmVyXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIGZvciBob3ZlciBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGZfaW4gKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciBob3ZlciBpblxuICAgICAtIGZfb3V0IChmdW5jdGlvbikgaGFuZGxlciBmb3IgaG92ZXIgb3V0XG4gICAgIC0gaWNvbnRleHQgKG9iamVjdCkgI29wdGlvbmFsIGNvbnRleHQgZm9yIGhvdmVyIGluIGhhbmRsZXJcbiAgICAgLSBvY29udGV4dCAob2JqZWN0KSAjb3B0aW9uYWwgY29udGV4dCBmb3IgaG92ZXIgb3V0IGhhbmRsZXJcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLmhvdmVyID0gZnVuY3Rpb24gKGZfaW4sIGZfb3V0LCBzY29wZV9pbiwgc2NvcGVfb3V0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vdXNlb3ZlcihmX2luLCBzY29wZV9pbikubW91c2VvdXQoZl9vdXQsIHNjb3BlX291dCB8fCBzY29wZV9pbik7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC51bmhvdmVyXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGV2ZW50IGhhbmRsZXJzIGZvciBob3ZlciBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGZfaW4gKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciBob3ZlciBpblxuICAgICAtIGZfb3V0IChmdW5jdGlvbikgaGFuZGxlciBmb3IgaG92ZXIgb3V0XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by51bmhvdmVyID0gZnVuY3Rpb24gKGZfaW4sIGZfb3V0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVubW91c2VvdmVyKGZfaW4pLnVubW91c2VvdXQoZl9vdXQpO1xuICAgIH07XG4gICAgdmFyIGRyYWdnYWJsZSA9IFtdO1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmRyYWdcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgZm9yIGRyYWcgb2YgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIG9ubW92ZSAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIG1vdmluZ1xuICAgICAtIG9uc3RhcnQgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciBkcmFnIHN0YXJ0XG4gICAgIC0gb25lbmQgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciBkcmFnIGVuZFxuICAgICAtIG1jb250ZXh0IChvYmplY3QpICNvcHRpb25hbCBjb250ZXh0IGZvciBtb3ZpbmcgaGFuZGxlclxuICAgICAtIHNjb250ZXh0IChvYmplY3QpICNvcHRpb25hbCBjb250ZXh0IGZvciBkcmFnIHN0YXJ0IGhhbmRsZXJcbiAgICAgLSBlY29udGV4dCAob2JqZWN0KSAjb3B0aW9uYWwgY29udGV4dCBmb3IgZHJhZyBlbmQgaGFuZGxlclxuICAgICAqIEFkZGl0aW9uYWx5IGZvbGxvd2luZyBgZHJhZ2AgZXZlbnRzIHdpbGwgYmUgdHJpZ2dlcmVkOiBgZHJhZy5zdGFydC48aWQ+YCBvbiBzdGFydCwgXG4gICAgICogYGRyYWcuZW5kLjxpZD5gIG9uIGVuZCBhbmQgYGRyYWcubW92ZS48aWQ+YCBvbiBldmVyeSBtb3ZlLiBXaGVuIGVsZW1lbnQgd2lsbCBiZSBkcmFnZ2VkIG92ZXIgYW5vdGhlciBlbGVtZW50IFxuICAgICAqIGBkcmFnLm92ZXIuPGlkPmAgd2lsbCBiZSBmaXJlZCBhcyB3ZWxsLlxuICAgICAqXG4gICAgICogU3RhcnQgZXZlbnQgYW5kIHN0YXJ0IGhhbmRsZXIgd2lsbCBiZSBjYWxsZWQgaW4gc3BlY2lmaWVkIGNvbnRleHQgb3IgaW4gY29udGV4dCBvZiB0aGUgZWxlbWVudCB3aXRoIGZvbGxvd2luZyBwYXJhbWV0ZXJzOlxuICAgICBvIHggKG51bWJlcikgeCBwb3NpdGlvbiBvZiB0aGUgbW91c2VcbiAgICAgbyB5IChudW1iZXIpIHkgcG9zaXRpb24gb2YgdGhlIG1vdXNlXG4gICAgIG8gZXZlbnQgKG9iamVjdCkgRE9NIGV2ZW50IG9iamVjdFxuICAgICAqIE1vdmUgZXZlbnQgYW5kIG1vdmUgaGFuZGxlciB3aWxsIGJlIGNhbGxlZCBpbiBzcGVjaWZpZWQgY29udGV4dCBvciBpbiBjb250ZXh0IG9mIHRoZSBlbGVtZW50IHdpdGggZm9sbG93aW5nIHBhcmFtZXRlcnM6XG4gICAgIG8gZHggKG51bWJlcikgc2hpZnQgYnkgeCBmcm9tIHRoZSBzdGFydCBwb2ludFxuICAgICBvIGR5IChudW1iZXIpIHNoaWZ0IGJ5IHkgZnJvbSB0aGUgc3RhcnQgcG9pbnRcbiAgICAgbyB4IChudW1iZXIpIHggcG9zaXRpb24gb2YgdGhlIG1vdXNlXG4gICAgIG8geSAobnVtYmVyKSB5IHBvc2l0aW9uIG9mIHRoZSBtb3VzZVxuICAgICBvIGV2ZW50IChvYmplY3QpIERPTSBldmVudCBvYmplY3RcbiAgICAgKiBFbmQgZXZlbnQgYW5kIGVuZCBoYW5kbGVyIHdpbGwgYmUgY2FsbGVkIGluIHNwZWNpZmllZCBjb250ZXh0IG9yIGluIGNvbnRleHQgb2YgdGhlIGVsZW1lbnQgd2l0aCBmb2xsb3dpbmcgcGFyYW1ldGVyczpcbiAgICAgbyBldmVudCAob2JqZWN0KSBET00gZXZlbnQgb2JqZWN0XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by5kcmFnID0gZnVuY3Rpb24gKG9ubW92ZSwgb25zdGFydCwgb25lbmQsIG1vdmVfc2NvcGUsIHN0YXJ0X3Njb3BlLCBlbmRfc2NvcGUpIHtcbiAgICAgICAgZnVuY3Rpb24gc3RhcnQoZSkge1xuICAgICAgICAgICAgKGUub3JpZ2luYWxFdmVudCB8fCBlKS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdmFyIHNjcm9sbFkgPSBnLmRvYy5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGcuZG9jLmJvZHkuc2Nyb2xsVG9wLFxuICAgICAgICAgICAgICAgIHNjcm9sbFggPSBnLmRvYy5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCB8fCBnLmRvYy5ib2R5LnNjcm9sbExlZnQ7XG4gICAgICAgICAgICB0aGlzLl9kcmFnLnggPSBlLmNsaWVudFggKyBzY3JvbGxYO1xuICAgICAgICAgICAgdGhpcy5fZHJhZy55ID0gZS5jbGllbnRZICsgc2Nyb2xsWTtcbiAgICAgICAgICAgIHRoaXMuX2RyYWcuaWQgPSBlLmlkZW50aWZpZXI7XG4gICAgICAgICAgICAhZHJhZy5sZW5ndGggJiYgUi5tb3VzZW1vdmUoZHJhZ01vdmUpLm1vdXNldXAoZHJhZ1VwKTtcbiAgICAgICAgICAgIGRyYWcucHVzaCh7ZWw6IHRoaXMsIG1vdmVfc2NvcGU6IG1vdmVfc2NvcGUsIHN0YXJ0X3Njb3BlOiBzdGFydF9zY29wZSwgZW5kX3Njb3BlOiBlbmRfc2NvcGV9KTtcbiAgICAgICAgICAgIG9uc3RhcnQgJiYgZXZlLm9uKFwicmFwaGFlbC5kcmFnLnN0YXJ0LlwiICsgdGhpcy5pZCwgb25zdGFydCk7XG4gICAgICAgICAgICBvbm1vdmUgJiYgZXZlLm9uKFwicmFwaGFlbC5kcmFnLm1vdmUuXCIgKyB0aGlzLmlkLCBvbm1vdmUpO1xuICAgICAgICAgICAgb25lbmQgJiYgZXZlLm9uKFwicmFwaGFlbC5kcmFnLmVuZC5cIiArIHRoaXMuaWQsIG9uZW5kKTtcbiAgICAgICAgICAgIGV2ZShcInJhcGhhZWwuZHJhZy5zdGFydC5cIiArIHRoaXMuaWQsIHN0YXJ0X3Njb3BlIHx8IG1vdmVfc2NvcGUgfHwgdGhpcywgZS5jbGllbnRYICsgc2Nyb2xsWCwgZS5jbGllbnRZICsgc2Nyb2xsWSwgZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZHJhZyA9IHt9O1xuICAgICAgICBkcmFnZ2FibGUucHVzaCh7ZWw6IHRoaXMsIHN0YXJ0OiBzdGFydH0pO1xuICAgICAgICB0aGlzLm1vdXNlZG93bihzdGFydCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQub25EcmFnT3ZlclxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogU2hvcnRjdXQgZm9yIGFzc2lnbmluZyBldmVudCBoYW5kbGVyIGZvciBgZHJhZy5vdmVyLjxpZD5gIGV2ZW50LCB3aGVyZSBpZCBpcyBpZCBvZiB0aGUgZWxlbWVudCAoc2VlIEBFbGVtZW50LmlkKS5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gZiAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIGV2ZW50LCBmaXJzdCBhcmd1bWVudCB3b3VsZCBiZSB0aGUgZWxlbWVudCB5b3UgYXJlIGRyYWdnaW5nIG92ZXJcbiAgICBcXCovXG4gICAgZWxwcm90by5vbkRyYWdPdmVyID0gZnVuY3Rpb24gKGYpIHtcbiAgICAgICAgZiA/IGV2ZS5vbihcInJhcGhhZWwuZHJhZy5vdmVyLlwiICsgdGhpcy5pZCwgZikgOiBldmUudW5iaW5kKFwicmFwaGFlbC5kcmFnLm92ZXIuXCIgKyB0aGlzLmlkKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnVuZHJhZ1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBhbGwgZHJhZyBldmVudCBoYW5kbGVycyBmcm9tIGdpdmVuIGVsZW1lbnQuXG4gICAgXFwqL1xuICAgIGVscHJvdG8udW5kcmFnID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaSA9IGRyYWdnYWJsZS5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChpLS0pIGlmIChkcmFnZ2FibGVbaV0uZWwgPT0gdGhpcykge1xuICAgICAgICAgICAgdGhpcy51bm1vdXNlZG93bihkcmFnZ2FibGVbaV0uc3RhcnQpO1xuICAgICAgICAgICAgZHJhZ2dhYmxlLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGV2ZS51bmJpbmQoXCJyYXBoYWVsLmRyYWcuKi5cIiArIHRoaXMuaWQpO1xuICAgICAgICB9XG4gICAgICAgICFkcmFnZ2FibGUubGVuZ3RoICYmIFIudW5tb3VzZW1vdmUoZHJhZ01vdmUpLnVubW91c2V1cChkcmFnVXApO1xuICAgICAgICBkcmFnID0gW107XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIuY2lyY2xlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBEcmF3cyBhIGNpcmNsZS5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0geCAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRyZVxuICAgICAtIHkgKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSBjZW50cmVcbiAgICAgLSByIChudW1iZXIpIHJhZGl1c1xuICAgICA9IChvYmplY3QpIFJhcGhhw6tsIGVsZW1lbnQgb2JqZWN0IHdpdGggdHlwZSDigJxjaXJjbGXigJ1cbiAgICAgKipcbiAgICAgPiBVc2FnZVxuICAgICB8IHZhciBjID0gcGFwZXIuY2lyY2xlKDUwLCA1MCwgNDApO1xuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLmNpcmNsZSA9IGZ1bmN0aW9uICh4LCB5LCByKSB7XG4gICAgICAgIHZhciBvdXQgPSBSLl9lbmdpbmUuY2lyY2xlKHRoaXMsIHggfHwgMCwgeSB8fCAwLCByIHx8IDApO1xuICAgICAgICB0aGlzLl9fc2V0X18gJiYgdGhpcy5fX3NldF9fLnB1c2gob3V0KTtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5yZWN0XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKlxuICAgICAqIERyYXdzIGEgcmVjdGFuZ2xlLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSB4IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgdG9wIGxlZnQgY29ybmVyXG4gICAgIC0geSAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIHRvcCBsZWZ0IGNvcm5lclxuICAgICAtIHdpZHRoIChudW1iZXIpIHdpZHRoXG4gICAgIC0gaGVpZ2h0IChudW1iZXIpIGhlaWdodFxuICAgICAtIHIgKG51bWJlcikgI29wdGlvbmFsIHJhZGl1cyBmb3Igcm91bmRlZCBjb3JuZXJzLCBkZWZhdWx0IGlzIDBcbiAgICAgPSAob2JqZWN0KSBSYXBoYcOrbCBlbGVtZW50IG9iamVjdCB3aXRoIHR5cGUg4oCccmVjdOKAnVxuICAgICAqKlxuICAgICA+IFVzYWdlXG4gICAgIHwgLy8gcmVndWxhciByZWN0YW5nbGVcbiAgICAgfCB2YXIgYyA9IHBhcGVyLnJlY3QoMTAsIDEwLCA1MCwgNTApO1xuICAgICB8IC8vIHJlY3RhbmdsZSB3aXRoIHJvdW5kZWQgY29ybmVyc1xuICAgICB8IHZhciBjID0gcGFwZXIucmVjdCg0MCwgNDAsIDUwLCA1MCwgMTApO1xuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLnJlY3QgPSBmdW5jdGlvbiAoeCwgeSwgdywgaCwgcikge1xuICAgICAgICB2YXIgb3V0ID0gUi5fZW5naW5lLnJlY3QodGhpcywgeCB8fCAwLCB5IHx8IDAsIHcgfHwgMCwgaCB8fCAwLCByIHx8IDApO1xuICAgICAgICB0aGlzLl9fc2V0X18gJiYgdGhpcy5fX3NldF9fLnB1c2gob3V0KTtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5lbGxpcHNlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBEcmF3cyBhbiBlbGxpcHNlLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSB4IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgY2VudHJlXG4gICAgIC0geSAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRyZVxuICAgICAtIHJ4IChudW1iZXIpIGhvcml6b250YWwgcmFkaXVzXG4gICAgIC0gcnkgKG51bWJlcikgdmVydGljYWwgcmFkaXVzXG4gICAgID0gKG9iamVjdCkgUmFwaGHDq2wgZWxlbWVudCBvYmplY3Qgd2l0aCB0eXBlIOKAnGVsbGlwc2XigJ1cbiAgICAgKipcbiAgICAgPiBVc2FnZVxuICAgICB8IHZhciBjID0gcGFwZXIuZWxsaXBzZSg1MCwgNTAsIDQwLCAyMCk7XG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8uZWxsaXBzZSA9IGZ1bmN0aW9uICh4LCB5LCByeCwgcnkpIHtcbiAgICAgICAgdmFyIG91dCA9IFIuX2VuZ2luZS5lbGxpcHNlKHRoaXMsIHggfHwgMCwgeSB8fCAwLCByeCB8fCAwLCByeSB8fCAwKTtcbiAgICAgICAgdGhpcy5fX3NldF9fICYmIHRoaXMuX19zZXRfXy5wdXNoKG91dCk7XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIucGF0aFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ3JlYXRlcyBhIHBhdGggZWxlbWVudCBieSBnaXZlbiBwYXRoIGRhdGEgc3RyaW5nLlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBwYXRoU3RyaW5nIChzdHJpbmcpICNvcHRpb25hbCBwYXRoIHN0cmluZyBpbiBTVkcgZm9ybWF0LlxuICAgICAqIFBhdGggc3RyaW5nIGNvbnNpc3RzIG9mIG9uZS1sZXR0ZXIgY29tbWFuZHMsIGZvbGxvd2VkIGJ5IGNvbW1hIHNlcHJhcmF0ZWQgYXJndW1lbnRzIGluIG51bWVyY2FsIGZvcm0uIEV4YW1wbGU6XG4gICAgIHwgXCJNMTAsMjBMMzAsNDBcIlxuICAgICAqIEhlcmUgd2UgY2FuIHNlZSB0d28gY29tbWFuZHM6IOKAnE3igJ0sIHdpdGggYXJndW1lbnRzIGAoMTAsIDIwKWAgYW5kIOKAnEzigJ0gd2l0aCBhcmd1bWVudHMgYCgzMCwgNDApYC4gVXBwZXIgY2FzZSBsZXR0ZXIgbWVhbiBjb21tYW5kIGlzIGFic29sdXRlLCBsb3dlciBjYXNl4oCUcmVsYXRpdmUuXG4gICAgICpcbiAgICAgIyA8cD5IZXJlIGlzIHNob3J0IGxpc3Qgb2YgY29tbWFuZHMgYXZhaWxhYmxlLCBmb3IgbW9yZSBkZXRhaWxzIHNlZSA8YSBocmVmPVwiaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHL3BhdGhzLmh0bWwjUGF0aERhdGFcIiB0aXRsZT1cIkRldGFpbHMgb2YgYSBwYXRoJ3MgZGF0YSBhdHRyaWJ1dGUncyBmb3JtYXQgYXJlIGRlc2NyaWJlZCBpbiB0aGUgU1ZHIHNwZWNpZmljYXRpb24uXCI+U1ZHIHBhdGggc3RyaW5nIGZvcm1hdDwvYT4uPC9wPlxuICAgICAjIDx0YWJsZT48dGhlYWQ+PHRyPjx0aD5Db21tYW5kPC90aD48dGg+TmFtZTwvdGg+PHRoPlBhcmFtZXRlcnM8L3RoPjwvdHI+PC90aGVhZD48dGJvZHk+XG4gICAgICMgPHRyPjx0ZD5NPC90ZD48dGQ+bW92ZXRvPC90ZD48dGQ+KHggeSkrPC90ZD48L3RyPlxuICAgICAjIDx0cj48dGQ+WjwvdGQ+PHRkPmNsb3NlcGF0aDwvdGQ+PHRkPihub25lKTwvdGQ+PC90cj5cbiAgICAgIyA8dHI+PHRkPkw8L3RkPjx0ZD5saW5ldG88L3RkPjx0ZD4oeCB5KSs8L3RkPjwvdHI+XG4gICAgICMgPHRyPjx0ZD5IPC90ZD48dGQ+aG9yaXpvbnRhbCBsaW5ldG88L3RkPjx0ZD54KzwvdGQ+PC90cj5cbiAgICAgIyA8dHI+PHRkPlY8L3RkPjx0ZD52ZXJ0aWNhbCBsaW5ldG88L3RkPjx0ZD55KzwvdGQ+PC90cj5cbiAgICAgIyA8dHI+PHRkPkM8L3RkPjx0ZD5jdXJ2ZXRvPC90ZD48dGQ+KHgxIHkxIHgyIHkyIHggeSkrPC90ZD48L3RyPlxuICAgICAjIDx0cj48dGQ+UzwvdGQ+PHRkPnNtb290aCBjdXJ2ZXRvPC90ZD48dGQ+KHgyIHkyIHggeSkrPC90ZD48L3RyPlxuICAgICAjIDx0cj48dGQ+UTwvdGQ+PHRkPnF1YWRyYXRpYyBCw6l6aWVyIGN1cnZldG88L3RkPjx0ZD4oeDEgeTEgeCB5KSs8L3RkPjwvdHI+XG4gICAgICMgPHRyPjx0ZD5UPC90ZD48dGQ+c21vb3RoIHF1YWRyYXRpYyBCw6l6aWVyIGN1cnZldG88L3RkPjx0ZD4oeCB5KSs8L3RkPjwvdHI+XG4gICAgICMgPHRyPjx0ZD5BPC90ZD48dGQ+ZWxsaXB0aWNhbCBhcmM8L3RkPjx0ZD4ocnggcnkgeC1heGlzLXJvdGF0aW9uIGxhcmdlLWFyYy1mbGFnIHN3ZWVwLWZsYWcgeCB5KSs8L3RkPjwvdHI+XG4gICAgICMgPHRyPjx0ZD5SPC90ZD48dGQ+PGEgaHJlZj1cImh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ2F0bXVsbOKAk1JvbV9zcGxpbmUjQ2F0bXVsbC5FMi44MC45M1JvbV9zcGxpbmVcIj5DYXRtdWxsLVJvbSBjdXJ2ZXRvPC9hPio8L3RkPjx0ZD54MSB5MSAoeCB5KSs8L3RkPjwvdHI+PC90Ym9keT48L3RhYmxlPlxuICAgICAqICog4oCcQ2F0bXVsbC1Sb20gY3VydmV0b+KAnSBpcyBhIG5vdCBzdGFuZGFyZCBTVkcgY29tbWFuZCBhbmQgYWRkZWQgaW4gMi4wIHRvIG1ha2UgbGlmZSBlYXNpZXIuXG4gICAgICogTm90ZTogdGhlcmUgaXMgYSBzcGVjaWFsIGNhc2Ugd2hlbiBwYXRoIGNvbnNpc3Qgb2YganVzdCB0aHJlZSBjb21tYW5kczog4oCcTTEwLDEwUuKApnrigJ0uIEluIHRoaXMgY2FzZSBwYXRoIHdpbGwgc21vb3RobHkgY29ubmVjdHMgdG8gaXRzIGJlZ2lubmluZy5cbiAgICAgPiBVc2FnZVxuICAgICB8IHZhciBjID0gcGFwZXIucGF0aChcIk0xMCAxMEw5MCA5MFwiKTtcbiAgICAgfCAvLyBkcmF3IGEgZGlhZ29uYWwgbGluZTpcbiAgICAgfCAvLyBtb3ZlIHRvIDEwLDEwLCBsaW5lIHRvIDkwLDkwXG4gICAgICogRm9yIGV4YW1wbGUgb2YgcGF0aCBzdHJpbmdzLCBjaGVjayBvdXQgdGhlc2UgaWNvbnM6IGh0dHA6Ly9yYXBoYWVsanMuY29tL2ljb25zL1xuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLnBhdGggPSBmdW5jdGlvbiAocGF0aFN0cmluZykge1xuICAgICAgICBwYXRoU3RyaW5nICYmICFSLmlzKHBhdGhTdHJpbmcsIHN0cmluZykgJiYgIVIuaXMocGF0aFN0cmluZ1swXSwgYXJyYXkpICYmIChwYXRoU3RyaW5nICs9IEUpO1xuICAgICAgICB2YXIgb3V0ID0gUi5fZW5naW5lLnBhdGgoUi5mb3JtYXRbYXBwbHldKFIsIGFyZ3VtZW50cyksIHRoaXMpO1xuICAgICAgICB0aGlzLl9fc2V0X18gJiYgdGhpcy5fX3NldF9fLnB1c2gob3V0KTtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5pbWFnZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogRW1iZWRzIGFuIGltYWdlIGludG8gdGhlIHN1cmZhY2UuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHNyYyAoc3RyaW5nKSBVUkkgb2YgdGhlIHNvdXJjZSBpbWFnZVxuICAgICAtIHggKG51bWJlcikgeCBjb29yZGluYXRlIHBvc2l0aW9uXG4gICAgIC0geSAobnVtYmVyKSB5IGNvb3JkaW5hdGUgcG9zaXRpb25cbiAgICAgLSB3aWR0aCAobnVtYmVyKSB3aWR0aCBvZiB0aGUgaW1hZ2VcbiAgICAgLSBoZWlnaHQgKG51bWJlcikgaGVpZ2h0IG9mIHRoZSBpbWFnZVxuICAgICA9IChvYmplY3QpIFJhcGhhw6tsIGVsZW1lbnQgb2JqZWN0IHdpdGggdHlwZSDigJxpbWFnZeKAnVxuICAgICAqKlxuICAgICA+IFVzYWdlXG4gICAgIHwgdmFyIGMgPSBwYXBlci5pbWFnZShcImFwcGxlLnBuZ1wiLCAxMCwgMTAsIDgwLCA4MCk7XG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8uaW1hZ2UgPSBmdW5jdGlvbiAoc3JjLCB4LCB5LCB3LCBoKSB7XG4gICAgICAgIHZhciBvdXQgPSBSLl9lbmdpbmUuaW1hZ2UodGhpcywgc3JjIHx8IFwiYWJvdXQ6YmxhbmtcIiwgeCB8fCAwLCB5IHx8IDAsIHcgfHwgMCwgaCB8fCAwKTtcbiAgICAgICAgdGhpcy5fX3NldF9fICYmIHRoaXMuX19zZXRfXy5wdXNoKG91dCk7XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIudGV4dFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogRHJhd3MgYSB0ZXh0IHN0cmluZy4gSWYgeW91IG5lZWQgbGluZSBicmVha3MsIHB1dCDigJxcXG7igJ0gaW4gdGhlIHN0cmluZy5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0geCAobnVtYmVyKSB4IGNvb3JkaW5hdGUgcG9zaXRpb25cbiAgICAgLSB5IChudW1iZXIpIHkgY29vcmRpbmF0ZSBwb3NpdGlvblxuICAgICAtIHRleHQgKHN0cmluZykgVGhlIHRleHQgc3RyaW5nIHRvIGRyYXdcbiAgICAgPSAob2JqZWN0KSBSYXBoYcOrbCBlbGVtZW50IG9iamVjdCB3aXRoIHR5cGUg4oCcdGV4dOKAnVxuICAgICAqKlxuICAgICA+IFVzYWdlXG4gICAgIHwgdmFyIHQgPSBwYXBlci50ZXh0KDUwLCA1MCwgXCJSYXBoYcOrbFxcbmtpY2tzXFxuYnV0dCFcIik7XG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8udGV4dCA9IGZ1bmN0aW9uICh4LCB5LCB0ZXh0KSB7XG4gICAgICAgIHZhciBvdXQgPSBSLl9lbmdpbmUudGV4dCh0aGlzLCB4IHx8IDAsIHkgfHwgMCwgU3RyKHRleHQpKTtcbiAgICAgICAgdGhpcy5fX3NldF9fICYmIHRoaXMuX19zZXRfXy5wdXNoKG91dCk7XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIuc2V0XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDcmVhdGVzIGFycmF5LWxpa2Ugb2JqZWN0IHRvIGtlZXAgYW5kIG9wZXJhdGUgc2V2ZXJhbCBlbGVtZW50cyBhdCBvbmNlLlxuICAgICAqIFdhcm5pbmc6IGl0IGRvZXNu4oCZdCBjcmVhdGUgYW55IGVsZW1lbnRzIGZvciBpdHNlbGYgaW4gdGhlIHBhZ2UsIGl0IGp1c3QgZ3JvdXBzIGV4aXN0aW5nIGVsZW1lbnRzLlxuICAgICAqIFNldHMgYWN0IGFzIHBzZXVkbyBlbGVtZW50cyDigJQgYWxsIG1ldGhvZHMgYXZhaWxhYmxlIHRvIGFuIGVsZW1lbnQgY2FuIGJlIHVzZWQgb24gYSBzZXQuXG4gICAgID0gKG9iamVjdCkgYXJyYXktbGlrZSBvYmplY3QgdGhhdCByZXByZXNlbnRzIHNldCBvZiBlbGVtZW50c1xuICAgICAqKlxuICAgICA+IFVzYWdlXG4gICAgIHwgdmFyIHN0ID0gcGFwZXIuc2V0KCk7XG4gICAgIHwgc3QucHVzaChcbiAgICAgfCAgICAgcGFwZXIuY2lyY2xlKDEwLCAxMCwgNSksXG4gICAgIHwgICAgIHBhcGVyLmNpcmNsZSgzMCwgMTAsIDUpXG4gICAgIHwgKTtcbiAgICAgfCBzdC5hdHRyKHtmaWxsOiBcInJlZFwifSk7IC8vIGNoYW5nZXMgdGhlIGZpbGwgb2YgYm90aCBjaXJjbGVzXG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8uc2V0ID0gZnVuY3Rpb24gKGl0ZW1zQXJyYXkpIHtcbiAgICAgICAgIVIuaXMoaXRlbXNBcnJheSwgXCJhcnJheVwiKSAmJiAoaXRlbXNBcnJheSA9IEFycmF5LnByb3RvdHlwZS5zcGxpY2UuY2FsbChhcmd1bWVudHMsIDAsIGFyZ3VtZW50cy5sZW5ndGgpKTtcbiAgICAgICAgdmFyIG91dCA9IG5ldyBTZXQoaXRlbXNBcnJheSk7XG4gICAgICAgIHRoaXMuX19zZXRfXyAmJiB0aGlzLl9fc2V0X18ucHVzaChvdXQpO1xuICAgICAgICBvdXRbXCJwYXBlclwiXSA9IHRoaXM7XG4gICAgICAgIG91dFtcInR5cGVcIl0gPSBcInNldFwiO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLnNldFN0YXJ0XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDcmVhdGVzIEBQYXBlci5zZXQuIEFsbCBlbGVtZW50cyB0aGF0IHdpbGwgYmUgY3JlYXRlZCBhZnRlciBjYWxsaW5nIHRoaXMgbWV0aG9kIGFuZCBiZWZvcmUgY2FsbGluZ1xuICAgICAqIEBQYXBlci5zZXRGaW5pc2ggd2lsbCBiZSBhZGRlZCB0byB0aGUgc2V0LlxuICAgICAqKlxuICAgICA+IFVzYWdlXG4gICAgIHwgcGFwZXIuc2V0U3RhcnQoKTtcbiAgICAgfCBwYXBlci5jaXJjbGUoMTAsIDEwLCA1KSxcbiAgICAgfCBwYXBlci5jaXJjbGUoMzAsIDEwLCA1KVxuICAgICB8IHZhciBzdCA9IHBhcGVyLnNldEZpbmlzaCgpO1xuICAgICB8IHN0LmF0dHIoe2ZpbGw6IFwicmVkXCJ9KTsgLy8gY2hhbmdlcyB0aGUgZmlsbCBvZiBib3RoIGNpcmNsZXNcbiAgICBcXCovXG4gICAgcGFwZXJwcm90by5zZXRTdGFydCA9IGZ1bmN0aW9uIChzZXQpIHtcbiAgICAgICAgdGhpcy5fX3NldF9fID0gc2V0IHx8IHRoaXMuc2V0KCk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIuc2V0RmluaXNoXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBTZWUgQFBhcGVyLnNldFN0YXJ0LiBUaGlzIG1ldGhvZCBmaW5pc2hlcyBjYXRjaGluZyBhbmQgcmV0dXJucyByZXN1bHRpbmcgc2V0LlxuICAgICAqKlxuICAgICA9IChvYmplY3QpIHNldFxuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLnNldEZpbmlzaCA9IGZ1bmN0aW9uIChzZXQpIHtcbiAgICAgICAgdmFyIG91dCA9IHRoaXMuX19zZXRfXztcbiAgICAgICAgZGVsZXRlIHRoaXMuX19zZXRfXztcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5zZXRTaXplXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBJZiB5b3UgbmVlZCB0byBjaGFuZ2UgZGltZW5zaW9ucyBvZiB0aGUgY2FudmFzIGNhbGwgdGhpcyBtZXRob2RcbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gd2lkdGggKG51bWJlcikgbmV3IHdpZHRoIG9mIHRoZSBjYW52YXNcbiAgICAgLSBoZWlnaHQgKG51bWJlcikgbmV3IGhlaWdodCBvZiB0aGUgY2FudmFzXG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8uc2V0U2l6ZSA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHJldHVybiBSLl9lbmdpbmUuc2V0U2l6ZS5jYWxsKHRoaXMsIHdpZHRoLCBoZWlnaHQpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLnNldFZpZXdCb3hcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFNldHMgdGhlIHZpZXcgYm94IG9mIHRoZSBwYXBlci4gUHJhY3RpY2FsbHkgaXQgZ2l2ZXMgeW91IGFiaWxpdHkgdG8gem9vbSBhbmQgcGFuIHdob2xlIHBhcGVyIHN1cmZhY2UgYnkgXG4gICAgICogc3BlY2lmeWluZyBuZXcgYm91bmRhcmllcy5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0geCAobnVtYmVyKSBuZXcgeCBwb3NpdGlvbiwgZGVmYXVsdCBpcyBgMGBcbiAgICAgLSB5IChudW1iZXIpIG5ldyB5IHBvc2l0aW9uLCBkZWZhdWx0IGlzIGAwYFxuICAgICAtIHcgKG51bWJlcikgbmV3IHdpZHRoIG9mIHRoZSBjYW52YXNcbiAgICAgLSBoIChudW1iZXIpIG5ldyBoZWlnaHQgb2YgdGhlIGNhbnZhc1xuICAgICAtIGZpdCAoYm9vbGVhbikgYHRydWVgIGlmIHlvdSB3YW50IGdyYXBoaWNzIHRvIGZpdCBpbnRvIG5ldyBib3VuZGFyeSBib3hcbiAgICBcXCovXG4gICAgcGFwZXJwcm90by5zZXRWaWV3Qm94ID0gZnVuY3Rpb24gKHgsIHksIHcsIGgsIGZpdCkge1xuICAgICAgICByZXR1cm4gUi5fZW5naW5lLnNldFZpZXdCb3guY2FsbCh0aGlzLCB4LCB5LCB3LCBoLCBmaXQpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLnRvcFxuICAgICBbIHByb3BlcnR5IF1cbiAgICAgKipcbiAgICAgKiBQb2ludHMgdG8gdGhlIHRvcG1vc3QgZWxlbWVudCBvbiB0aGUgcGFwZXJcbiAgICBcXCovXG4gICAgLypcXFxuICAgICAqIFBhcGVyLmJvdHRvbVxuICAgICBbIHByb3BlcnR5IF1cbiAgICAgKipcbiAgICAgKiBQb2ludHMgdG8gdGhlIGJvdHRvbSBlbGVtZW50IG9uIHRoZSBwYXBlclxuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLnRvcCA9IHBhcGVycHJvdG8uYm90dG9tID0gbnVsbDtcbiAgICAvKlxcXG4gICAgICogUGFwZXIucmFwaGFlbFxuICAgICBbIHByb3BlcnR5IF1cbiAgICAgKipcbiAgICAgKiBQb2ludHMgdG8gdGhlIEBSYXBoYWVsIG9iamVjdC9mdW5jdGlvblxuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLnJhcGhhZWwgPSBSO1xuICAgIHZhciBnZXRPZmZzZXQgPSBmdW5jdGlvbiAoZWxlbSkge1xuICAgICAgICB2YXIgYm94ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICAgIGRvYyA9IGVsZW0ub3duZXJEb2N1bWVudCxcbiAgICAgICAgICAgIGJvZHkgPSBkb2MuYm9keSxcbiAgICAgICAgICAgIGRvY0VsZW0gPSBkb2MuZG9jdW1lbnRFbGVtZW50LFxuICAgICAgICAgICAgY2xpZW50VG9wID0gZG9jRWxlbS5jbGllbnRUb3AgfHwgYm9keS5jbGllbnRUb3AgfHwgMCwgY2xpZW50TGVmdCA9IGRvY0VsZW0uY2xpZW50TGVmdCB8fCBib2R5LmNsaWVudExlZnQgfHwgMCxcbiAgICAgICAgICAgIHRvcCAgPSBib3gudG9wICArIChnLndpbi5wYWdlWU9mZnNldCB8fCBkb2NFbGVtLnNjcm9sbFRvcCB8fCBib2R5LnNjcm9sbFRvcCApIC0gY2xpZW50VG9wLFxuICAgICAgICAgICAgbGVmdCA9IGJveC5sZWZ0ICsgKGcud2luLnBhZ2VYT2Zmc2V0IHx8IGRvY0VsZW0uc2Nyb2xsTGVmdCB8fCBib2R5LnNjcm9sbExlZnQpIC0gY2xpZW50TGVmdDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHk6IHRvcCxcbiAgICAgICAgICAgIHg6IGxlZnRcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5nZXRFbGVtZW50QnlQb2ludFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyB5b3UgdG9wbW9zdCBlbGVtZW50IHVuZGVyIGdpdmVuIHBvaW50LlxuICAgICAqKlxuICAgICA9IChvYmplY3QpIFJhcGhhw6tsIGVsZW1lbnQgb2JqZWN0XG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHggKG51bWJlcikgeCBjb29yZGluYXRlIGZyb20gdGhlIHRvcCBsZWZ0IGNvcm5lciBvZiB0aGUgd2luZG93XG4gICAgIC0geSAobnVtYmVyKSB5IGNvb3JkaW5hdGUgZnJvbSB0aGUgdG9wIGxlZnQgY29ybmVyIG9mIHRoZSB3aW5kb3dcbiAgICAgPiBVc2FnZVxuICAgICB8IHBhcGVyLmdldEVsZW1lbnRCeVBvaW50KG1vdXNlWCwgbW91c2VZKS5hdHRyKHtzdHJva2U6IFwiI2YwMFwifSk7XG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8uZ2V0RWxlbWVudEJ5UG9pbnQgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICB2YXIgcGFwZXIgPSB0aGlzLFxuICAgICAgICAgICAgc3ZnID0gcGFwZXIuY2FudmFzLFxuICAgICAgICAgICAgdGFyZ2V0ID0gZy5kb2MuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcbiAgICAgICAgaWYgKGcud2luLm9wZXJhICYmIHRhcmdldC50YWdOYW1lID09IFwic3ZnXCIpIHtcbiAgICAgICAgICAgIHZhciBzbyA9IGdldE9mZnNldChzdmcpLFxuICAgICAgICAgICAgICAgIHNyID0gc3ZnLmNyZWF0ZVNWR1JlY3QoKTtcbiAgICAgICAgICAgIHNyLnggPSB4IC0gc28ueDtcbiAgICAgICAgICAgIHNyLnkgPSB5IC0gc28ueTtcbiAgICAgICAgICAgIHNyLndpZHRoID0gc3IuaGVpZ2h0ID0gMTtcbiAgICAgICAgICAgIHZhciBoaXRzID0gc3ZnLmdldEludGVyc2VjdGlvbkxpc3Qoc3IsIG51bGwpO1xuICAgICAgICAgICAgaWYgKGhpdHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gaGl0c1toaXRzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAodGFyZ2V0LnBhcmVudE5vZGUgJiYgdGFyZ2V0ICE9IHN2Zy5wYXJlbnROb2RlICYmICF0YXJnZXQucmFwaGFlbCkge1xuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0ID09IHBhcGVyLmNhbnZhcy5wYXJlbnROb2RlICYmICh0YXJnZXQgPSBzdmcpO1xuICAgICAgICB0YXJnZXQgPSB0YXJnZXQgJiYgdGFyZ2V0LnJhcGhhZWwgPyBwYXBlci5nZXRCeUlkKHRhcmdldC5yYXBoYWVsaWQpIDogbnVsbDtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9O1xuXG4gICAgLypcXFxuICAgICAqIFBhcGVyLmdldEVsZW1lbnRzQnlCQm94XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIHNldCBvZiBlbGVtZW50cyB0aGF0IGhhdmUgYW4gaW50ZXJzZWN0aW5nIGJvdW5kaW5nIGJveFxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBiYm94IChvYmplY3QpIGJib3ggdG8gY2hlY2sgd2l0aFxuICAgICA9IChvYmplY3QpIEBTZXRcbiAgICAgXFwqL1xuICAgIHBhcGVycHJvdG8uZ2V0RWxlbWVudHNCeUJCb3ggPSBmdW5jdGlvbiAoYmJveCkge1xuICAgICAgICB2YXIgc2V0ID0gdGhpcy5zZXQoKTtcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgaWYgKFIuaXNCQm94SW50ZXJzZWN0KGVsLmdldEJCb3goKSwgYmJveCkpIHtcbiAgICAgICAgICAgICAgICBzZXQucHVzaChlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc2V0O1xuICAgIH07XG5cbiAgICAvKlxcXG4gICAgICogUGFwZXIuZ2V0QnlJZFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyB5b3UgZWxlbWVudCBieSBpdHMgaW50ZXJuYWwgSUQuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGlkIChudW1iZXIpIGlkXG4gICAgID0gKG9iamVjdCkgUmFwaGHDq2wgZWxlbWVudCBvYmplY3RcbiAgICBcXCovXG4gICAgcGFwZXJwcm90by5nZXRCeUlkID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHZhciBib3QgPSB0aGlzLmJvdHRvbTtcbiAgICAgICAgd2hpbGUgKGJvdCkge1xuICAgICAgICAgICAgaWYgKGJvdC5pZCA9PSBpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBib3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib3QgPSBib3QubmV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5mb3JFYWNoXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBFeGVjdXRlcyBnaXZlbiBmdW5jdGlvbiBmb3IgZWFjaCBlbGVtZW50IG9uIHRoZSBwYXBlclxuICAgICAqXG4gICAgICogSWYgY2FsbGJhY2sgZnVuY3Rpb24gcmV0dXJucyBgZmFsc2VgIGl0IHdpbGwgc3RvcCBsb29wIHJ1bm5pbmcuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGNhbGxiYWNrIChmdW5jdGlvbikgZnVuY3Rpb24gdG8gcnVuXG4gICAgIC0gdGhpc0FyZyAob2JqZWN0KSBjb250ZXh0IG9iamVjdCBmb3IgdGhlIGNhbGxiYWNrXG4gICAgID0gKG9iamVjdCkgUGFwZXIgb2JqZWN0XG4gICAgID4gVXNhZ2VcbiAgICAgfCBwYXBlci5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICB8ICAgICBlbC5hdHRyKHsgc3Ryb2tlOiBcImJsdWVcIiB9KTtcbiAgICAgfCB9KTtcbiAgICBcXCovXG4gICAgcGFwZXJwcm90by5mb3JFYWNoID0gZnVuY3Rpb24gKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICAgIHZhciBib3QgPSB0aGlzLmJvdHRvbTtcbiAgICAgICAgd2hpbGUgKGJvdCkge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrLmNhbGwodGhpc0FyZywgYm90KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJvdCA9IGJvdC5uZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLmdldEVsZW1lbnRzQnlQb2ludFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBzZXQgb2YgZWxlbWVudHMgdGhhdCBoYXZlIGNvbW1vbiBwb2ludCBpbnNpZGVcbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0geCAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50XG4gICAgIC0geSAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50XG4gICAgID0gKG9iamVjdCkgQFNldFxuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLmdldEVsZW1lbnRzQnlQb2ludCA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIHZhciBzZXQgPSB0aGlzLnNldCgpO1xuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICBpZiAoZWwuaXNQb2ludEluc2lkZSh4LCB5KSkge1xuICAgICAgICAgICAgICAgIHNldC5wdXNoKGVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzZXQ7XG4gICAgfTtcbiAgICBmdW5jdGlvbiB4X3koKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnggKyBTICsgdGhpcy55O1xuICAgIH1cbiAgICBmdW5jdGlvbiB4X3lfd19oKCkge1xuICAgICAgICByZXR1cm4gdGhpcy54ICsgUyArIHRoaXMueSArIFMgKyB0aGlzLndpZHRoICsgXCIgXFx4ZDcgXCIgKyB0aGlzLmhlaWdodDtcbiAgICB9XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuaXNQb2ludEluc2lkZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogRGV0ZXJtaW5lIGlmIGdpdmVuIHBvaW50IGlzIGluc2lkZSB0aGlzIGVsZW1lbnTigJlzIHNoYXBlXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHggKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSBwb2ludFxuICAgICAtIHkgKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSBwb2ludFxuICAgICA9IChib29sZWFuKSBgdHJ1ZWAgaWYgcG9pbnQgaW5zaWRlIHRoZSBzaGFwZVxuICAgIFxcKi9cbiAgICBlbHByb3RvLmlzUG9pbnRJbnNpZGUgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICB2YXIgcnAgPSB0aGlzLnJlYWxQYXRoID0gdGhpcy5yZWFsUGF0aCB8fCBnZXRQYXRoW3RoaXMudHlwZV0odGhpcyk7XG4gICAgICAgIHJldHVybiBSLmlzUG9pbnRJbnNpZGVQYXRoKHJwLCB4LCB5KTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmdldEJCb3hcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybiBib3VuZGluZyBib3ggZm9yIGEgZ2l2ZW4gZWxlbWVudFxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBpc1dpdGhvdXRUcmFuc2Zvcm0gKGJvb2xlYW4pIGZsYWcsIGB0cnVlYCBpZiB5b3Ugd2FudCB0byBoYXZlIGJvdW5kaW5nIGJveCBiZWZvcmUgdHJhbnNmb3JtYXRpb25zLiBEZWZhdWx0IGlzIGBmYWxzZWAuXG4gICAgID0gKG9iamVjdCkgQm91bmRpbmcgYm94IG9iamVjdDpcbiAgICAgbyB7XG4gICAgIG8gICAgIHg6IChudW1iZXIpIHRvcCBsZWZ0IGNvcm5lciB4XG4gICAgIG8gICAgIHk6IChudW1iZXIpIHRvcCBsZWZ0IGNvcm5lciB5XG4gICAgIG8gICAgIHgyOiAobnVtYmVyKSBib3R0b20gcmlnaHQgY29ybmVyIHhcbiAgICAgbyAgICAgeTI6IChudW1iZXIpIGJvdHRvbSByaWdodCBjb3JuZXIgeVxuICAgICBvICAgICB3aWR0aDogKG51bWJlcikgd2lkdGhcbiAgICAgbyAgICAgaGVpZ2h0OiAobnVtYmVyKSBoZWlnaHRcbiAgICAgbyB9XG4gICAgXFwqL1xuICAgIGVscHJvdG8uZ2V0QkJveCA9IGZ1bmN0aW9uIChpc1dpdGhvdXRUcmFuc2Zvcm0pIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG4gICAgICAgIHZhciBfID0gdGhpcy5fO1xuICAgICAgICBpZiAoaXNXaXRob3V0VHJhbnNmb3JtKSB7XG4gICAgICAgICAgICBpZiAoXy5kaXJ0eSB8fCAhXy5iYm94d3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWxQYXRoID0gZ2V0UGF0aFt0aGlzLnR5cGVdKHRoaXMpO1xuICAgICAgICAgICAgICAgIF8uYmJveHd0ID0gcGF0aERpbWVuc2lvbnModGhpcy5yZWFsUGF0aCk7XG4gICAgICAgICAgICAgICAgXy5iYm94d3QudG9TdHJpbmcgPSB4X3lfd19oO1xuICAgICAgICAgICAgICAgIF8uZGlydHkgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF8uYmJveHd0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLmRpcnR5IHx8IF8uZGlydHlUIHx8ICFfLmJib3gpIHtcbiAgICAgICAgICAgIGlmIChfLmRpcnR5IHx8ICF0aGlzLnJlYWxQYXRoKSB7XG4gICAgICAgICAgICAgICAgXy5iYm94d3QgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMucmVhbFBhdGggPSBnZXRQYXRoW3RoaXMudHlwZV0odGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfLmJib3ggPSBwYXRoRGltZW5zaW9ucyhtYXBQYXRoKHRoaXMucmVhbFBhdGgsIHRoaXMubWF0cml4KSk7XG4gICAgICAgICAgICBfLmJib3gudG9TdHJpbmcgPSB4X3lfd19oO1xuICAgICAgICAgICAgXy5kaXJ0eSA9IF8uZGlydHlUID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXy5iYm94O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuY2xvbmVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICA9IChvYmplY3QpIGNsb25lIG9mIGEgZ2l2ZW4gZWxlbWVudFxuICAgICAqKlxuICAgIFxcKi9cbiAgICBlbHByb3RvLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgb3V0ID0gdGhpcy5wYXBlclt0aGlzLnR5cGVdKCkuYXR0cih0aGlzLmF0dHIoKSk7XG4gICAgICAgIHRoaXMuX19zZXRfXyAmJiB0aGlzLl9fc2V0X18ucHVzaChvdXQpO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuZ2xvd1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJuIHNldCBvZiBlbGVtZW50cyB0aGF0IGNyZWF0ZSBnbG93LWxpa2UgZWZmZWN0IGFyb3VuZCBnaXZlbiBlbGVtZW50LiBTZWUgQFBhcGVyLnNldC5cbiAgICAgKlxuICAgICAqIE5vdGU6IEdsb3cgaXMgbm90IGNvbm5lY3RlZCB0byB0aGUgZWxlbWVudC4gSWYgeW91IGNoYW5nZSBlbGVtZW50IGF0dHJpYnV0ZXMgaXQgd29u4oCZdCBhZGp1c3QgaXRzZWxmLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBnbG93IChvYmplY3QpICNvcHRpb25hbCBwYXJhbWV0ZXJzIG9iamVjdCB3aXRoIGFsbCBwcm9wZXJ0aWVzIG9wdGlvbmFsOlxuICAgICBvIHtcbiAgICAgbyAgICAgd2lkdGggKG51bWJlcikgc2l6ZSBvZiB0aGUgZ2xvdywgZGVmYXVsdCBpcyBgMTBgXG4gICAgIG8gICAgIGZpbGwgKGJvb2xlYW4pIHdpbGwgaXQgYmUgZmlsbGVkLCBkZWZhdWx0IGlzIGBmYWxzZWBcbiAgICAgbyAgICAgb3BhY2l0eSAobnVtYmVyKSBvcGFjaXR5LCBkZWZhdWx0IGlzIGAwLjVgXG4gICAgIG8gICAgIG9mZnNldHggKG51bWJlcikgaG9yaXpvbnRhbCBvZmZzZXQsIGRlZmF1bHQgaXMgYDBgXG4gICAgIG8gICAgIG9mZnNldHkgKG51bWJlcikgdmVydGljYWwgb2Zmc2V0LCBkZWZhdWx0IGlzIGAwYFxuICAgICBvICAgICBjb2xvciAoc3RyaW5nKSBnbG93IGNvbG91ciwgZGVmYXVsdCBpcyBgYmxhY2tgXG4gICAgIG8gfVxuICAgICA9IChvYmplY3QpIEBQYXBlci5zZXQgb2YgZWxlbWVudHMgdGhhdCByZXByZXNlbnRzIGdsb3dcbiAgICBcXCovXG4gICAgZWxwcm90by5nbG93ID0gZnVuY3Rpb24gKGdsb3cpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PSBcInRleHRcIikge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZ2xvdyA9IGdsb3cgfHwge307XG4gICAgICAgIHZhciBzID0ge1xuICAgICAgICAgICAgd2lkdGg6IChnbG93LndpZHRoIHx8IDEwKSArICgrdGhpcy5hdHRyKFwic3Ryb2tlLXdpZHRoXCIpIHx8IDEpLFxuICAgICAgICAgICAgZmlsbDogZ2xvdy5maWxsIHx8IGZhbHNlLFxuICAgICAgICAgICAgb3BhY2l0eTogZ2xvdy5vcGFjaXR5IHx8IC41LFxuICAgICAgICAgICAgb2Zmc2V0eDogZ2xvdy5vZmZzZXR4IHx8IDAsXG4gICAgICAgICAgICBvZmZzZXR5OiBnbG93Lm9mZnNldHkgfHwgMCxcbiAgICAgICAgICAgIGNvbG9yOiBnbG93LmNvbG9yIHx8IFwiIzAwMFwiXG4gICAgICAgIH0sXG4gICAgICAgICAgICBjID0gcy53aWR0aCAvIDIsXG4gICAgICAgICAgICByID0gdGhpcy5wYXBlcixcbiAgICAgICAgICAgIG91dCA9IHIuc2V0KCksXG4gICAgICAgICAgICBwYXRoID0gdGhpcy5yZWFsUGF0aCB8fCBnZXRQYXRoW3RoaXMudHlwZV0odGhpcyk7XG4gICAgICAgIHBhdGggPSB0aGlzLm1hdHJpeCA/IG1hcFBhdGgocGF0aCwgdGhpcy5tYXRyaXgpIDogcGF0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBjICsgMTsgaSsrKSB7XG4gICAgICAgICAgICBvdXQucHVzaChyLnBhdGgocGF0aCkuYXR0cih7XG4gICAgICAgICAgICAgICAgc3Ryb2tlOiBzLmNvbG9yLFxuICAgICAgICAgICAgICAgIGZpbGw6IHMuZmlsbCA/IHMuY29sb3IgOiBcIm5vbmVcIixcbiAgICAgICAgICAgICAgICBcInN0cm9rZS1saW5lam9pblwiOiBcInJvdW5kXCIsXG4gICAgICAgICAgICAgICAgXCJzdHJva2UtbGluZWNhcFwiOiBcInJvdW5kXCIsXG4gICAgICAgICAgICAgICAgXCJzdHJva2Utd2lkdGhcIjogKyhzLndpZHRoIC8gYyAqIGkpLnRvRml4ZWQoMyksXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogKyhzLm9wYWNpdHkgLyBjKS50b0ZpeGVkKDMpXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dC5pbnNlcnRCZWZvcmUodGhpcykudHJhbnNsYXRlKHMub2Zmc2V0eCwgcy5vZmZzZXR5KTtcbiAgICB9O1xuICAgIHZhciBjdXJ2ZXNsZW5ndGhzID0ge30sXG4gICAgZ2V0UG9pbnRBdFNlZ21lbnRMZW5ndGggPSBmdW5jdGlvbiAocDF4LCBwMXksIGMxeCwgYzF5LCBjMngsIGMyeSwgcDJ4LCBwMnksIGxlbmd0aCkge1xuICAgICAgICBpZiAobGVuZ3RoID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBiZXpsZW4ocDF4LCBwMXksIGMxeCwgYzF5LCBjMngsIGMyeSwgcDJ4LCBwMnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFIuZmluZERvdHNBdFNlZ21lbnQocDF4LCBwMXksIGMxeCwgYzF5LCBjMngsIGMyeSwgcDJ4LCBwMnksIGdldFRhdExlbihwMXgsIHAxeSwgYzF4LCBjMXksIGMyeCwgYzJ5LCBwMngsIHAyeSwgbGVuZ3RoKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGdldExlbmd0aEZhY3RvcnkgPSBmdW5jdGlvbiAoaXN0b3RhbCwgc3VicGF0aCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHBhdGgsIGxlbmd0aCwgb25seXN0YXJ0KSB7XG4gICAgICAgICAgICBwYXRoID0gcGF0aDJjdXJ2ZShwYXRoKTtcbiAgICAgICAgICAgIHZhciB4LCB5LCBwLCBsLCBzcCA9IFwiXCIsIHN1YnBhdGhzID0ge30sIHBvaW50LFxuICAgICAgICAgICAgICAgIGxlbiA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBwYXRoLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwID0gcGF0aFtpXTtcbiAgICAgICAgICAgICAgICBpZiAocFswXSA9PSBcIk1cIikge1xuICAgICAgICAgICAgICAgICAgICB4ID0gK3BbMV07XG4gICAgICAgICAgICAgICAgICAgIHkgPSArcFsyXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsID0gZ2V0UG9pbnRBdFNlZ21lbnRMZW5ndGgoeCwgeSwgcFsxXSwgcFsyXSwgcFszXSwgcFs0XSwgcFs1XSwgcFs2XSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsZW4gKyBsID4gbGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3VicGF0aCAmJiAhc3VicGF0aHMuc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludCA9IGdldFBvaW50QXRTZWdtZW50TGVuZ3RoKHgsIHksIHBbMV0sIHBbMl0sIHBbM10sIHBbNF0sIHBbNV0sIHBbNl0sIGxlbmd0aCAtIGxlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3AgKz0gW1wiQ1wiICsgcG9pbnQuc3RhcnQueCwgcG9pbnQuc3RhcnQueSwgcG9pbnQubS54LCBwb2ludC5tLnksIHBvaW50LngsIHBvaW50LnldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvbmx5c3RhcnQpIHtyZXR1cm4gc3A7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnBhdGhzLnN0YXJ0ID0gc3A7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3AgPSBbXCJNXCIgKyBwb2ludC54LCBwb2ludC55ICsgXCJDXCIgKyBwb2ludC5uLngsIHBvaW50Lm4ueSwgcG9pbnQuZW5kLngsIHBvaW50LmVuZC55LCBwWzVdLCBwWzZdXS5qb2luKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuICs9IGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeCA9ICtwWzVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkgPSArcFs2XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXN0b3RhbCAmJiAhc3VicGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50ID0gZ2V0UG9pbnRBdFNlZ21lbnRMZW5ndGgoeCwgeSwgcFsxXSwgcFsyXSwgcFszXSwgcFs0XSwgcFs1XSwgcFs2XSwgbGVuZ3RoIC0gbGVuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge3g6IHBvaW50LngsIHk6IHBvaW50LnksIGFscGhhOiBwb2ludC5hbHBoYX07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbGVuICs9IGw7XG4gICAgICAgICAgICAgICAgICAgIHggPSArcFs1XTtcbiAgICAgICAgICAgICAgICAgICAgeSA9ICtwWzZdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzcCArPSBwLnNoaWZ0KCkgKyBwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3VicGF0aHMuZW5kID0gc3A7XG4gICAgICAgICAgICBwb2ludCA9IGlzdG90YWwgPyBsZW4gOiBzdWJwYXRoID8gc3VicGF0aHMgOiBSLmZpbmREb3RzQXRTZWdtZW50KHgsIHksIHBbMF0sIHBbMV0sIHBbMl0sIHBbM10sIHBbNF0sIHBbNV0sIDEpO1xuICAgICAgICAgICAgcG9pbnQuYWxwaGEgJiYgKHBvaW50ID0ge3g6IHBvaW50LngsIHk6IHBvaW50LnksIGFscGhhOiBwb2ludC5hbHBoYX0pO1xuICAgICAgICAgICAgcmV0dXJuIHBvaW50O1xuICAgICAgICB9O1xuICAgIH07XG4gICAgdmFyIGdldFRvdGFsTGVuZ3RoID0gZ2V0TGVuZ3RoRmFjdG9yeSgxKSxcbiAgICAgICAgZ2V0UG9pbnRBdExlbmd0aCA9IGdldExlbmd0aEZhY3RvcnkoKSxcbiAgICAgICAgZ2V0U3VicGF0aHNBdExlbmd0aCA9IGdldExlbmd0aEZhY3RvcnkoMCwgMSk7XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuZ2V0VG90YWxMZW5ndGhcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgbGVuZ3RoIG9mIHRoZSBnaXZlbiBwYXRoIGluIHBpeGVscy5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gcGF0aCAoc3RyaW5nKSBTVkcgcGF0aCBzdHJpbmcuXG4gICAgICoqXG4gICAgID0gKG51bWJlcikgbGVuZ3RoLlxuICAgIFxcKi9cbiAgICBSLmdldFRvdGFsTGVuZ3RoID0gZ2V0VG90YWxMZW5ndGg7XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuZ2V0UG9pbnRBdExlbmd0aFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJuIGNvb3JkaW5hdGVzIG9mIHRoZSBwb2ludCBsb2NhdGVkIGF0IHRoZSBnaXZlbiBsZW5ndGggb24gdGhlIGdpdmVuIHBhdGguXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHBhdGggKHN0cmluZykgU1ZHIHBhdGggc3RyaW5nXG4gICAgIC0gbGVuZ3RoIChudW1iZXIpXG4gICAgICoqXG4gICAgID0gKG9iamVjdCkgcmVwcmVzZW50YXRpb24gb2YgdGhlIHBvaW50OlxuICAgICBvIHtcbiAgICAgbyAgICAgeDogKG51bWJlcikgeCBjb29yZGluYXRlXG4gICAgIG8gICAgIHk6IChudW1iZXIpIHkgY29vcmRpbmF0ZVxuICAgICBvICAgICBhbHBoYTogKG51bWJlcikgYW5nbGUgb2YgZGVyaXZhdGl2ZVxuICAgICBvIH1cbiAgICBcXCovXG4gICAgUi5nZXRQb2ludEF0TGVuZ3RoID0gZ2V0UG9pbnRBdExlbmd0aDtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5nZXRTdWJwYXRoXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm4gc3VicGF0aCBvZiBhIGdpdmVuIHBhdGggZnJvbSBnaXZlbiBsZW5ndGggdG8gZ2l2ZW4gbGVuZ3RoLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBwYXRoIChzdHJpbmcpIFNWRyBwYXRoIHN0cmluZ1xuICAgICAtIGZyb20gKG51bWJlcikgcG9zaXRpb24gb2YgdGhlIHN0YXJ0IG9mIHRoZSBzZWdtZW50XG4gICAgIC0gdG8gKG51bWJlcikgcG9zaXRpb24gb2YgdGhlIGVuZCBvZiB0aGUgc2VnbWVudFxuICAgICAqKlxuICAgICA9IChzdHJpbmcpIHBhdGhzdHJpbmcgZm9yIHRoZSBzZWdtZW50XG4gICAgXFwqL1xuICAgIFIuZ2V0U3VicGF0aCA9IGZ1bmN0aW9uIChwYXRoLCBmcm9tLCB0bykge1xuICAgICAgICBpZiAodGhpcy5nZXRUb3RhbExlbmd0aChwYXRoKSAtIHRvIDwgMWUtNikge1xuICAgICAgICAgICAgcmV0dXJuIGdldFN1YnBhdGhzQXRMZW5ndGgocGF0aCwgZnJvbSkuZW5kO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhID0gZ2V0U3VicGF0aHNBdExlbmd0aChwYXRoLCB0bywgMSk7XG4gICAgICAgIHJldHVybiBmcm9tID8gZ2V0U3VicGF0aHNBdExlbmd0aChhLCBmcm9tKS5lbmQgOiBhO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuZ2V0VG90YWxMZW5ndGhcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgbGVuZ3RoIG9mIHRoZSBwYXRoIGluIHBpeGVscy4gT25seSB3b3JrcyBmb3IgZWxlbWVudCBvZiDigJxwYXRo4oCdIHR5cGUuXG4gICAgID0gKG51bWJlcikgbGVuZ3RoLlxuICAgIFxcKi9cbiAgICBlbHByb3RvLmdldFRvdGFsTGVuZ3RoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy50eXBlICE9IFwicGF0aFwiKSB7cmV0dXJuO31cbiAgICAgICAgaWYgKHRoaXMubm9kZS5nZXRUb3RhbExlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubm9kZS5nZXRUb3RhbExlbmd0aCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnZXRUb3RhbExlbmd0aCh0aGlzLmF0dHJzLnBhdGgpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuZ2V0UG9pbnRBdExlbmd0aFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJuIGNvb3JkaW5hdGVzIG9mIHRoZSBwb2ludCBsb2NhdGVkIGF0IHRoZSBnaXZlbiBsZW5ndGggb24gdGhlIGdpdmVuIHBhdGguIE9ubHkgd29ya3MgZm9yIGVsZW1lbnQgb2Yg4oCccGF0aOKAnSB0eXBlLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBsZW5ndGggKG51bWJlcilcbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSByZXByZXNlbnRhdGlvbiBvZiB0aGUgcG9pbnQ6XG4gICAgIG8ge1xuICAgICBvICAgICB4OiAobnVtYmVyKSB4IGNvb3JkaW5hdGVcbiAgICAgbyAgICAgeTogKG51bWJlcikgeSBjb29yZGluYXRlXG4gICAgIG8gICAgIGFscGhhOiAobnVtYmVyKSBhbmdsZSBvZiBkZXJpdmF0aXZlXG4gICAgIG8gfVxuICAgIFxcKi9cbiAgICBlbHByb3RvLmdldFBvaW50QXRMZW5ndGggPSBmdW5jdGlvbiAobGVuZ3RoKSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgIT0gXCJwYXRoXCIpIHtyZXR1cm47fVxuICAgICAgICByZXR1cm4gZ2V0UG9pbnRBdExlbmd0aCh0aGlzLmF0dHJzLnBhdGgsIGxlbmd0aCk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5nZXRTdWJwYXRoXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm4gc3VicGF0aCBvZiBhIGdpdmVuIGVsZW1lbnQgZnJvbSBnaXZlbiBsZW5ndGggdG8gZ2l2ZW4gbGVuZ3RoLiBPbmx5IHdvcmtzIGZvciBlbGVtZW50IG9mIOKAnHBhdGjigJ0gdHlwZS5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gZnJvbSAobnVtYmVyKSBwb3NpdGlvbiBvZiB0aGUgc3RhcnQgb2YgdGhlIHNlZ21lbnRcbiAgICAgLSB0byAobnVtYmVyKSBwb3NpdGlvbiBvZiB0aGUgZW5kIG9mIHRoZSBzZWdtZW50XG4gICAgICoqXG4gICAgID0gKHN0cmluZykgcGF0aHN0cmluZyBmb3IgdGhlIHNlZ21lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by5nZXRTdWJwYXRoID0gZnVuY3Rpb24gKGZyb20sIHRvKSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgIT0gXCJwYXRoXCIpIHtyZXR1cm47fVxuICAgICAgICByZXR1cm4gUi5nZXRTdWJwYXRoKHRoaXMuYXR0cnMucGF0aCwgZnJvbSwgdG8pO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuZWFzaW5nX2Zvcm11bGFzXG4gICAgIFsgcHJvcGVydHkgXVxuICAgICAqKlxuICAgICAqIE9iamVjdCB0aGF0IGNvbnRhaW5zIGVhc2luZyBmb3JtdWxhcyBmb3IgYW5pbWF0aW9uLiBZb3UgY291bGQgZXh0ZW5kIGl0IHdpdGggeW91ciBvd24uIEJ5IGRlZmF1bHQgaXQgaGFzIGZvbGxvd2luZyBsaXN0IG9mIGVhc2luZzpcbiAgICAgIyA8dWw+XG4gICAgICMgICAgIDxsaT7igJxsaW5lYXLigJ08L2xpPlxuICAgICAjICAgICA8bGk+4oCcJmx0O+KAnSBvciDigJxlYXNlSW7igJ0gb3Ig4oCcZWFzZS1pbuKAnTwvbGk+XG4gICAgICMgICAgIDxsaT7igJw+4oCdIG9yIOKAnGVhc2VPdXTigJ0gb3Ig4oCcZWFzZS1vdXTigJ08L2xpPlxuICAgICAjICAgICA8bGk+4oCcJmx0Oz7igJ0gb3Ig4oCcZWFzZUluT3V04oCdIG9yIOKAnGVhc2UtaW4tb3V04oCdPC9saT5cbiAgICAgIyAgICAgPGxpPuKAnGJhY2tJbuKAnSBvciDigJxiYWNrLWlu4oCdPC9saT5cbiAgICAgIyAgICAgPGxpPuKAnGJhY2tPdXTigJ0gb3Ig4oCcYmFjay1vdXTigJ08L2xpPlxuICAgICAjICAgICA8bGk+4oCcZWxhc3RpY+KAnTwvbGk+XG4gICAgICMgICAgIDxsaT7igJxib3VuY2XigJ08L2xpPlxuICAgICAjIDwvdWw+XG4gICAgICMgPHA+U2VlIGFsc28gPGEgaHJlZj1cImh0dHA6Ly9yYXBoYWVsanMuY29tL2Vhc2luZy5odG1sXCI+RWFzaW5nIGRlbW88L2E+LjwvcD5cbiAgICBcXCovXG4gICAgdmFyIGVmID0gUi5lYXNpbmdfZm9ybXVsYXMgPSB7XG4gICAgICAgIGxpbmVhcjogZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICB9LFxuICAgICAgICBcIjxcIjogZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgICAgIHJldHVybiBwb3cobiwgMS43KTtcbiAgICAgICAgfSxcbiAgICAgICAgXCI+XCI6IGZ1bmN0aW9uIChuKSB7XG4gICAgICAgICAgICByZXR1cm4gcG93KG4sIC40OCk7XG4gICAgICAgIH0sXG4gICAgICAgIFwiPD5cIjogZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgICAgIHZhciBxID0gLjQ4IC0gbiAvIDEuMDQsXG4gICAgICAgICAgICAgICAgUSA9IG1hdGguc3FydCguMTczNCArIHEgKiBxKSxcbiAgICAgICAgICAgICAgICB4ID0gUSAtIHEsXG4gICAgICAgICAgICAgICAgWCA9IHBvdyhhYnMoeCksIDEgLyAzKSAqICh4IDwgMCA/IC0xIDogMSksXG4gICAgICAgICAgICAgICAgeSA9IC1RIC0gcSxcbiAgICAgICAgICAgICAgICBZID0gcG93KGFicyh5KSwgMSAvIDMpICogKHkgPCAwID8gLTEgOiAxKSxcbiAgICAgICAgICAgICAgICB0ID0gWCArIFkgKyAuNTtcbiAgICAgICAgICAgIHJldHVybiAoMSAtIHQpICogMyAqIHQgKiB0ICsgdCAqIHQgKiB0O1xuICAgICAgICB9LFxuICAgICAgICBiYWNrSW46IGZ1bmN0aW9uIChuKSB7XG4gICAgICAgICAgICB2YXIgcyA9IDEuNzAxNTg7XG4gICAgICAgICAgICByZXR1cm4gbiAqIG4gKiAoKHMgKyAxKSAqIG4gLSBzKTtcbiAgICAgICAgfSxcbiAgICAgICAgYmFja091dDogZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgICAgIG4gPSBuIC0gMTtcbiAgICAgICAgICAgIHZhciBzID0gMS43MDE1ODtcbiAgICAgICAgICAgIHJldHVybiBuICogbiAqICgocyArIDEpICogbiArIHMpICsgMTtcbiAgICAgICAgfSxcbiAgICAgICAgZWxhc3RpYzogZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgICAgIGlmIChuID09ICEhbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHBvdygyLCAtMTAgKiBuKSAqIG1hdGguc2luKChuIC0gLjA3NSkgKiAoMiAqIFBJKSAvIC4zKSArIDE7XG4gICAgICAgIH0sXG4gICAgICAgIGJvdW5jZTogZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgICAgIHZhciBzID0gNy41NjI1LFxuICAgICAgICAgICAgICAgIHAgPSAyLjc1LFxuICAgICAgICAgICAgICAgIGw7XG4gICAgICAgICAgICBpZiAobiA8ICgxIC8gcCkpIHtcbiAgICAgICAgICAgICAgICBsID0gcyAqIG4gKiBuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAobiA8ICgyIC8gcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbiAtPSAoMS41IC8gcCk7XG4gICAgICAgICAgICAgICAgICAgIGwgPSBzICogbiAqIG4gKyAuNzU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG4gPCAoMi41IC8gcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG4gLT0gKDIuMjUgLyBwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGwgPSBzICogbiAqIG4gKyAuOTM3NTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG4gLT0gKDIuNjI1IC8gcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsID0gcyAqIG4gKiBuICsgLjk4NDM3NTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBsO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBlZi5lYXNlSW4gPSBlZltcImVhc2UtaW5cIl0gPSBlZltcIjxcIl07XG4gICAgZWYuZWFzZU91dCA9IGVmW1wiZWFzZS1vdXRcIl0gPSBlZltcIj5cIl07XG4gICAgZWYuZWFzZUluT3V0ID0gZWZbXCJlYXNlLWluLW91dFwiXSA9IGVmW1wiPD5cIl07XG4gICAgZWZbXCJiYWNrLWluXCJdID0gZWYuYmFja0luO1xuICAgIGVmW1wiYmFjay1vdXRcIl0gPSBlZi5iYWNrT3V0O1xuXG4gICAgdmFyIGFuaW1hdGlvbkVsZW1lbnRzID0gW10sXG4gICAgICAgIHJlcXVlc3RBbmltRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICAgIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCAxNik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICBhbmltYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgTm93ID0gK25ldyBEYXRlLFxuICAgICAgICAgICAgICAgIGwgPSAwO1xuICAgICAgICAgICAgZm9yICg7IGwgPCBhbmltYXRpb25FbGVtZW50cy5sZW5ndGg7IGwrKykge1xuICAgICAgICAgICAgICAgIHZhciBlID0gYW5pbWF0aW9uRWxlbWVudHNbbF07XG4gICAgICAgICAgICAgICAgaWYgKGUuZWwucmVtb3ZlZCB8fCBlLnBhdXNlZCkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHRpbWUgPSBOb3cgLSBlLnN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBtcyA9IGUubXMsXG4gICAgICAgICAgICAgICAgICAgIGVhc2luZyA9IGUuZWFzaW5nLFxuICAgICAgICAgICAgICAgICAgICBmcm9tID0gZS5mcm9tLFxuICAgICAgICAgICAgICAgICAgICBkaWZmID0gZS5kaWZmLFxuICAgICAgICAgICAgICAgICAgICB0byA9IGUudG8sXG4gICAgICAgICAgICAgICAgICAgIHQgPSBlLnQsXG4gICAgICAgICAgICAgICAgICAgIHRoYXQgPSBlLmVsLFxuICAgICAgICAgICAgICAgICAgICBzZXQgPSB7fSxcbiAgICAgICAgICAgICAgICAgICAgbm93LFxuICAgICAgICAgICAgICAgICAgICBpbml0ID0ge30sXG4gICAgICAgICAgICAgICAgICAgIGtleTtcbiAgICAgICAgICAgICAgICBpZiAoZS5pbml0c3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWUgPSAoZS5pbml0c3RhdHVzICogZS5hbmltLnRvcCAtIGUucHJldikgLyAoZS5wZXJjZW50IC0gZS5wcmV2KSAqIG1zO1xuICAgICAgICAgICAgICAgICAgICBlLnN0YXR1cyA9IGUuaW5pdHN0YXR1cztcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGUuaW5pdHN0YXR1cztcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wICYmIGFuaW1hdGlvbkVsZW1lbnRzLnNwbGljZShsLS0sIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGUuc3RhdHVzID0gKGUucHJldiArIChlLnBlcmNlbnQgLSBlLnByZXYpICogKHRpbWUgLyBtcykpIC8gZS5hbmltLnRvcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRpbWUgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGltZSA8IG1zKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwb3MgPSBlYXNpbmcodGltZSAvIG1zKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgYXR0ciBpbiBmcm9tKSBpZiAoZnJvbVtoYXNdKGF0dHIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGF2YWlsYWJsZUFuaW1BdHRyc1thdHRyXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgbnU6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdyA9ICtmcm9tW2F0dHJdICsgcG9zICogbXMgKiBkaWZmW2F0dHJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiY29sb3VyXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdyA9IFwicmdiKFwiICsgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXB0bzI1NShyb3VuZChmcm9tW2F0dHJdLnIgKyBwb3MgKiBtcyAqIGRpZmZbYXR0cl0ucikpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXB0bzI1NShyb3VuZChmcm9tW2F0dHJdLmcgKyBwb3MgKiBtcyAqIGRpZmZbYXR0cl0uZykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXB0bzI1NShyb3VuZChmcm9tW2F0dHJdLmIgKyBwb3MgKiBtcyAqIGRpZmZbYXR0cl0uYikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0uam9pbihcIixcIikgKyBcIilcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInBhdGhcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93ID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IGZyb21bYXR0cl0ubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93W2ldID0gW2Zyb21bYXR0cl1baV1bMF1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDEsIGpqID0gZnJvbVthdHRyXVtpXS5sZW5ndGg7IGogPCBqajsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93W2ldW2pdID0gK2Zyb21bYXR0cl1baV1bal0gKyBwb3MgKiBtcyAqIGRpZmZbYXR0cl1baV1bal07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3dbaV0gPSBub3dbaV0uam9pbihTKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3cgPSBub3cuam9pbihTKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInRyYW5zZm9ybVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlmZlthdHRyXS5yZWFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3cgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGlpID0gZnJvbVthdHRyXS5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93W2ldID0gW2Zyb21bYXR0cl1baV1bMF1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDEsIGpqID0gZnJvbVthdHRyXVtpXS5sZW5ndGg7IGogPCBqajsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vd1tpXVtqXSA9IGZyb21bYXR0cl1baV1bal0gKyBwb3MgKiBtcyAqIGRpZmZbYXR0cl1baV1bal07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGdldCA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICtmcm9tW2F0dHJdW2ldICsgcG9zICogbXMgKiBkaWZmW2F0dHJdW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdyA9IFtbXCJyXCIsIGdldCgyKSwgMCwgMF0sIFtcInRcIiwgZ2V0KDMpLCBnZXQoNCldLCBbXCJzXCIsIGdldCgwKSwgZ2V0KDEpLCAwLCAwXV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3cgPSBbW1wibVwiLCBnZXQoMCksIGdldCgxKSwgZ2V0KDIpLCBnZXQoMyksIGdldCg0KSwgZ2V0KDUpXV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImNzdlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0ciA9PSBcImNsaXAtcmVjdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3cgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkgPSA0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vd1tpXSA9ICtmcm9tW2F0dHJdW2ldICsgcG9zICogbXMgKiBkaWZmW2F0dHJdW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmcm9tMiA9IFtdW2NvbmNhdF0oZnJvbVthdHRyXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpID0gdGhhdC5wYXBlci5jdXN0b21BdHRyaWJ1dGVzW2F0dHJdLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93W2ldID0gK2Zyb20yW2ldICsgcG9zICogbXMgKiBkaWZmW2F0dHJdW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0W2F0dHJdID0gbm93O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuYXR0cihzZXQpO1xuICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKGlkLCB0aGF0LCBhbmltKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmUoXCJyYXBoYWVsLmFuaW0uZnJhbWUuXCIgKyBpZCwgdGhhdCwgYW5pbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSkodGhhdC5pZCwgdGhhdCwgZS5hbmltKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24oZiwgZWwsIGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlKFwicmFwaGFlbC5hbmltLmZyYW1lLlwiICsgZWwuaWQsIGVsLCBhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmUoXCJyYXBoYWVsLmFuaW0uZmluaXNoLlwiICsgZWwuaWQsIGVsLCBhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSLmlzKGYsIFwiZnVuY3Rpb25cIikgJiYgZi5jYWxsKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KShlLmNhbGxiYWNrLCB0aGF0LCBlLmFuaW0pO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmF0dHIodG8pO1xuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb25FbGVtZW50cy5zcGxpY2UobC0tLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUucmVwZWF0ID4gMSAmJiAhZS5uZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiB0bykgaWYgKHRvW2hhc10oa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRba2V5XSA9IGUudG90YWxPcmlnaW5ba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGUuZWwuYXR0cihpbml0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bkFuaW1hdGlvbihlLmFuaW0sIGUuZWwsIGUuYW5pbS5wZXJjZW50c1swXSwgbnVsbCwgZS50b3RhbE9yaWdpbiwgZS5yZXBlYXQgLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoZS5uZXh0ICYmICFlLnN0b3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bkFuaW1hdGlvbihlLmFuaW0sIGUuZWwsIGUubmV4dCwgbnVsbCwgZS50b3RhbE9yaWdpbiwgZS5yZXBlYXQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgUi5zdmcgJiYgdGhhdCAmJiB0aGF0LnBhcGVyICYmIHRoYXQucGFwZXIuc2FmYXJpKCk7XG4gICAgICAgICAgICBhbmltYXRpb25FbGVtZW50cy5sZW5ndGggJiYgcmVxdWVzdEFuaW1GcmFtZShhbmltYXRpb24pO1xuICAgICAgICB9LFxuICAgICAgICB1cHRvMjU1ID0gZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gY29sb3IgPiAyNTUgPyAyNTUgOiBjb2xvciA8IDAgPyAwIDogY29sb3I7XG4gICAgICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuYW5pbWF0ZVdpdGhcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFjdHMgc2ltaWxhciB0byBARWxlbWVudC5hbmltYXRlLCBidXQgZW5zdXJlIHRoYXQgZ2l2ZW4gYW5pbWF0aW9uIHJ1bnMgaW4gc3luYyB3aXRoIGFub3RoZXIgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gZWwgKG9iamVjdCkgZWxlbWVudCB0byBzeW5jIHdpdGhcbiAgICAgLSBhbmltIChvYmplY3QpIGFuaW1hdGlvbiB0byBzeW5jIHdpdGhcbiAgICAgLSBwYXJhbXMgKG9iamVjdCkgI29wdGlvbmFsIGZpbmFsIGF0dHJpYnV0ZXMgZm9yIHRoZSBlbGVtZW50LCBzZWUgYWxzbyBARWxlbWVudC5hdHRyXG4gICAgIC0gbXMgKG51bWJlcikgI29wdGlvbmFsIG51bWJlciBvZiBtaWxsaXNlY29uZHMgZm9yIGFuaW1hdGlvbiB0byBydW5cbiAgICAgLSBlYXNpbmcgKHN0cmluZykgI29wdGlvbmFsIGVhc2luZyB0eXBlLiBBY2NlcHQgb24gb2YgQFJhcGhhZWwuZWFzaW5nX2Zvcm11bGFzIG9yIENTUyBmb3JtYXQ6IGBjdWJpYyYjeDIwMTA7YmV6aWVyKFhYLCYjMTYwO1hYLCYjMTYwO1hYLCYjMTYwO1hYKWBcbiAgICAgLSBjYWxsYmFjayAoZnVuY3Rpb24pICNvcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbi4gV2lsbCBiZSBjYWxsZWQgYXQgdGhlIGVuZCBvZiBhbmltYXRpb24uXG4gICAgICogb3JcbiAgICAgLSBlbGVtZW50IChvYmplY3QpIGVsZW1lbnQgdG8gc3luYyB3aXRoXG4gICAgIC0gYW5pbSAob2JqZWN0KSBhbmltYXRpb24gdG8gc3luYyB3aXRoXG4gICAgIC0gYW5pbWF0aW9uIChvYmplY3QpICNvcHRpb25hbCBhbmltYXRpb24gb2JqZWN0LCBzZWUgQFJhcGhhZWwuYW5pbWF0aW9uXG4gICAgICoqXG4gICAgID0gKG9iamVjdCkgb3JpZ2luYWwgZWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLmFuaW1hdGVXaXRoID0gZnVuY3Rpb24gKGVsLCBhbmltLCBwYXJhbXMsIG1zLCBlYXNpbmcsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBlbGVtZW50ID0gdGhpcztcbiAgICAgICAgaWYgKGVsZW1lbnQucmVtb3ZlZCkge1xuICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2suY2FsbChlbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIHZhciBhID0gcGFyYW1zIGluc3RhbmNlb2YgQW5pbWF0aW9uID8gcGFyYW1zIDogUi5hbmltYXRpb24ocGFyYW1zLCBtcywgZWFzaW5nLCBjYWxsYmFjayksXG4gICAgICAgICAgICB4LCB5O1xuICAgICAgICBydW5BbmltYXRpb24oYSwgZWxlbWVudCwgYS5wZXJjZW50c1swXSwgbnVsbCwgZWxlbWVudC5hdHRyKCkpO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBhbmltYXRpb25FbGVtZW50cy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoYW5pbWF0aW9uRWxlbWVudHNbaV0uYW5pbSA9PSBhbmltICYmIGFuaW1hdGlvbkVsZW1lbnRzW2ldLmVsID09IGVsKSB7XG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uRWxlbWVudHNbaWkgLSAxXS5zdGFydCA9IGFuaW1hdGlvbkVsZW1lbnRzW2ldLnN0YXJ0O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgICAgICAvLyBcbiAgICAgICAgLy8gXG4gICAgICAgIC8vIHZhciBhID0gcGFyYW1zID8gUi5hbmltYXRpb24ocGFyYW1zLCBtcywgZWFzaW5nLCBjYWxsYmFjaykgOiBhbmltLFxuICAgICAgICAvLyAgICAgc3RhdHVzID0gZWxlbWVudC5zdGF0dXMoYW5pbSk7XG4gICAgICAgIC8vIHJldHVybiB0aGlzLmFuaW1hdGUoYSkuc3RhdHVzKGEsIHN0YXR1cyAqIGFuaW0ubXMgLyBhLm1zKTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIEN1YmljQmV6aWVyQXRUaW1lKHQsIHAxeCwgcDF5LCBwMngsIHAyeSwgZHVyYXRpb24pIHtcbiAgICAgICAgdmFyIGN4ID0gMyAqIHAxeCxcbiAgICAgICAgICAgIGJ4ID0gMyAqIChwMnggLSBwMXgpIC0gY3gsXG4gICAgICAgICAgICBheCA9IDEgLSBjeCAtIGJ4LFxuICAgICAgICAgICAgY3kgPSAzICogcDF5LFxuICAgICAgICAgICAgYnkgPSAzICogKHAyeSAtIHAxeSkgLSBjeSxcbiAgICAgICAgICAgIGF5ID0gMSAtIGN5IC0gYnk7XG4gICAgICAgIGZ1bmN0aW9uIHNhbXBsZUN1cnZlWCh0KSB7XG4gICAgICAgICAgICByZXR1cm4gKChheCAqIHQgKyBieCkgKiB0ICsgY3gpICogdDtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBzb2x2ZSh4LCBlcHNpbG9uKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHNvbHZlQ3VydmVYKHgsIGVwc2lsb24pO1xuICAgICAgICAgICAgcmV0dXJuICgoYXkgKiB0ICsgYnkpICogdCArIGN5KSAqIHQ7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gc29sdmVDdXJ2ZVgoeCwgZXBzaWxvbikge1xuICAgICAgICAgICAgdmFyIHQwLCB0MSwgdDIsIHgyLCBkMiwgaTtcbiAgICAgICAgICAgIGZvcih0MiA9IHgsIGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgICAgICAgeDIgPSBzYW1wbGVDdXJ2ZVgodDIpIC0geDtcbiAgICAgICAgICAgICAgICBpZiAoYWJzKHgyKSA8IGVwc2lsb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHQyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkMiA9ICgzICogYXggKiB0MiArIDIgKiBieCkgKiB0MiArIGN4O1xuICAgICAgICAgICAgICAgIGlmIChhYnMoZDIpIDwgMWUtNikge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdDIgPSB0MiAtIHgyIC8gZDI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0MCA9IDA7XG4gICAgICAgICAgICB0MSA9IDE7XG4gICAgICAgICAgICB0MiA9IHg7XG4gICAgICAgICAgICBpZiAodDIgPCB0MCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0MDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0MiA+IHQxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHQxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpbGUgKHQwIDwgdDEpIHtcbiAgICAgICAgICAgICAgICB4MiA9IHNhbXBsZUN1cnZlWCh0Mik7XG4gICAgICAgICAgICAgICAgaWYgKGFicyh4MiAtIHgpIDwgZXBzaWxvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdDI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh4ID4geDIpIHtcbiAgICAgICAgICAgICAgICAgICAgdDAgPSB0MjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0MSA9IHQyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0MiA9ICh0MSAtIHQwKSAvIDIgKyB0MDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0MjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc29sdmUodCwgMSAvICgyMDAgKiBkdXJhdGlvbikpO1xuICAgIH1cbiAgICBlbHByb3RvLm9uQW5pbWF0aW9uID0gZnVuY3Rpb24gKGYpIHtcbiAgICAgICAgZiA/IGV2ZS5vbihcInJhcGhhZWwuYW5pbS5mcmFtZS5cIiArIHRoaXMuaWQsIGYpIDogZXZlLnVuYmluZChcInJhcGhhZWwuYW5pbS5mcmFtZS5cIiArIHRoaXMuaWQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIGZ1bmN0aW9uIEFuaW1hdGlvbihhbmltLCBtcykge1xuICAgICAgICB2YXIgcGVyY2VudHMgPSBbXSxcbiAgICAgICAgICAgIG5ld0FuaW0gPSB7fTtcbiAgICAgICAgdGhpcy5tcyA9IG1zO1xuICAgICAgICB0aGlzLnRpbWVzID0gMTtcbiAgICAgICAgaWYgKGFuaW0pIHtcbiAgICAgICAgICAgIGZvciAodmFyIGF0dHIgaW4gYW5pbSkgaWYgKGFuaW1baGFzXShhdHRyKSkge1xuICAgICAgICAgICAgICAgIG5ld0FuaW1bdG9GbG9hdChhdHRyKV0gPSBhbmltW2F0dHJdO1xuICAgICAgICAgICAgICAgIHBlcmNlbnRzLnB1c2godG9GbG9hdChhdHRyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwZXJjZW50cy5zb3J0KHNvcnRCeU51bWJlcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hbmltID0gbmV3QW5pbTtcbiAgICAgICAgdGhpcy50b3AgPSBwZXJjZW50c1twZXJjZW50cy5sZW5ndGggLSAxXTtcbiAgICAgICAgdGhpcy5wZXJjZW50cyA9IHBlcmNlbnRzO1xuICAgIH1cbiAgICAvKlxcXG4gICAgICogQW5pbWF0aW9uLmRlbGF5XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDcmVhdGVzIGEgY29weSBvZiBleGlzdGluZyBhbmltYXRpb24gb2JqZWN0IHdpdGggZ2l2ZW4gZGVsYXkuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGRlbGF5IChudW1iZXIpIG51bWJlciBvZiBtcyB0byBwYXNzIGJldHdlZW4gYW5pbWF0aW9uIHN0YXJ0IGFuZCBhY3R1YWwgYW5pbWF0aW9uXG4gICAgICoqXG4gICAgID0gKG9iamVjdCkgbmV3IGFsdGVyZWQgQW5pbWF0aW9uIG9iamVjdFxuICAgICB8IHZhciBhbmltID0gUmFwaGFlbC5hbmltYXRpb24oe2N4OiAxMCwgY3k6IDIwfSwgMmUzKTtcbiAgICAgfCBjaXJjbGUxLmFuaW1hdGUoYW5pbSk7IC8vIHJ1biB0aGUgZ2l2ZW4gYW5pbWF0aW9uIGltbWVkaWF0ZWx5XG4gICAgIHwgY2lyY2xlMi5hbmltYXRlKGFuaW0uZGVsYXkoNTAwKSk7IC8vIHJ1biB0aGUgZ2l2ZW4gYW5pbWF0aW9uIGFmdGVyIDUwMCBtc1xuICAgIFxcKi9cbiAgICBBbmltYXRpb24ucHJvdG90eXBlLmRlbGF5ID0gZnVuY3Rpb24gKGRlbGF5KSB7XG4gICAgICAgIHZhciBhID0gbmV3IEFuaW1hdGlvbih0aGlzLmFuaW0sIHRoaXMubXMpO1xuICAgICAgICBhLnRpbWVzID0gdGhpcy50aW1lcztcbiAgICAgICAgYS5kZWwgPSArZGVsYXkgfHwgMDtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogQW5pbWF0aW9uLnJlcGVhdFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ3JlYXRlcyBhIGNvcHkgb2YgZXhpc3RpbmcgYW5pbWF0aW9uIG9iamVjdCB3aXRoIGdpdmVuIHJlcGV0aXRpb24uXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHJlcGVhdCAobnVtYmVyKSBudW1iZXIgaXRlcmF0aW9ucyBvZiBhbmltYXRpb24uIEZvciBpbmZpbml0ZSBhbmltYXRpb24gcGFzcyBgSW5maW5pdHlgXG4gICAgICoqXG4gICAgID0gKG9iamVjdCkgbmV3IGFsdGVyZWQgQW5pbWF0aW9uIG9iamVjdFxuICAgIFxcKi9cbiAgICBBbmltYXRpb24ucHJvdG90eXBlLnJlcGVhdCA9IGZ1bmN0aW9uICh0aW1lcykgeyBcbiAgICAgICAgdmFyIGEgPSBuZXcgQW5pbWF0aW9uKHRoaXMuYW5pbSwgdGhpcy5tcyk7XG4gICAgICAgIGEuZGVsID0gdGhpcy5kZWw7XG4gICAgICAgIGEudGltZXMgPSBtYXRoLmZsb29yKG1tYXgodGltZXMsIDApKSB8fCAxO1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIHJ1bkFuaW1hdGlvbihhbmltLCBlbGVtZW50LCBwZXJjZW50LCBzdGF0dXMsIHRvdGFsT3JpZ2luLCB0aW1lcykge1xuICAgICAgICBwZXJjZW50ID0gdG9GbG9hdChwZXJjZW50KTtcbiAgICAgICAgdmFyIHBhcmFtcyxcbiAgICAgICAgICAgIGlzSW5BbmltLFxuICAgICAgICAgICAgaXNJbkFuaW1TZXQsXG4gICAgICAgICAgICBwZXJjZW50cyA9IFtdLFxuICAgICAgICAgICAgbmV4dCxcbiAgICAgICAgICAgIHByZXYsXG4gICAgICAgICAgICB0aW1lc3RhbXAsXG4gICAgICAgICAgICBtcyA9IGFuaW0ubXMsXG4gICAgICAgICAgICBmcm9tID0ge30sXG4gICAgICAgICAgICB0byA9IHt9LFxuICAgICAgICAgICAgZGlmZiA9IHt9O1xuICAgICAgICBpZiAoc3RhdHVzKSB7XG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBpaSA9IGFuaW1hdGlvbkVsZW1lbnRzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZSA9IGFuaW1hdGlvbkVsZW1lbnRzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChlLmVsLmlkID09IGVsZW1lbnQuaWQgJiYgZS5hbmltID09IGFuaW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUucGVyY2VudCAhPSBwZXJjZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb25FbGVtZW50cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc0luQW5pbVNldCA9IDE7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc0luQW5pbSA9IGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hdHRyKGUudG90YWxPcmlnaW4pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0dXMgPSArdG87IC8vIE5hTlxuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IGFuaW0ucGVyY2VudHMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFuaW0ucGVyY2VudHNbaV0gPT0gcGVyY2VudCB8fCBhbmltLnBlcmNlbnRzW2ldID4gc3RhdHVzICogYW5pbS50b3ApIHtcbiAgICAgICAgICAgICAgICBwZXJjZW50ID0gYW5pbS5wZXJjZW50c1tpXTtcbiAgICAgICAgICAgICAgICBwcmV2ID0gYW5pbS5wZXJjZW50c1tpIC0gMV0gfHwgMDtcbiAgICAgICAgICAgICAgICBtcyA9IG1zIC8gYW5pbS50b3AgKiAocGVyY2VudCAtIHByZXYpO1xuICAgICAgICAgICAgICAgIG5leHQgPSBhbmltLnBlcmNlbnRzW2kgKyAxXTtcbiAgICAgICAgICAgICAgICBwYXJhbXMgPSBhbmltLmFuaW1bcGVyY2VudF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN0YXR1cykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYXR0cihhbmltLmFuaW1bYW5pbS5wZXJjZW50c1tpXV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghcGFyYW1zKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc0luQW5pbSkge1xuICAgICAgICAgICAgZm9yICh2YXIgYXR0ciBpbiBwYXJhbXMpIGlmIChwYXJhbXNbaGFzXShhdHRyKSkge1xuICAgICAgICAgICAgICAgIGlmIChhdmFpbGFibGVBbmltQXR0cnNbaGFzXShhdHRyKSB8fCBlbGVtZW50LnBhcGVyLmN1c3RvbUF0dHJpYnV0ZXNbaGFzXShhdHRyKSkge1xuICAgICAgICAgICAgICAgICAgICBmcm9tW2F0dHJdID0gZWxlbWVudC5hdHRyKGF0dHIpO1xuICAgICAgICAgICAgICAgICAgICAoZnJvbVthdHRyXSA9PSBudWxsKSAmJiAoZnJvbVthdHRyXSA9IGF2YWlsYWJsZUF0dHJzW2F0dHJdKTtcbiAgICAgICAgICAgICAgICAgICAgdG9bYXR0cl0gPSBwYXJhbXNbYXR0cl07XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoYXZhaWxhYmxlQW5pbUF0dHJzW2F0dHJdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIG51OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZbYXR0cl0gPSAodG9bYXR0cl0gLSBmcm9tW2F0dHJdKSAvIG1zO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImNvbG91clwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb21bYXR0cl0gPSBSLmdldFJHQihmcm9tW2F0dHJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG9Db2xvdXIgPSBSLmdldFJHQih0b1thdHRyXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZlthdHRyXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcjogKHRvQ29sb3VyLnIgLSBmcm9tW2F0dHJdLnIpIC8gbXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGc6ICh0b0NvbG91ci5nIC0gZnJvbVthdHRyXS5nKSAvIG1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiOiAodG9Db2xvdXIuYiAtIGZyb21bYXR0cl0uYikgLyBtc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwicGF0aFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXRoZXMgPSBwYXRoMmN1cnZlKGZyb21bYXR0cl0sIHRvW2F0dHJdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9QYXRoID0gcGF0aGVzWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb21bYXR0cl0gPSBwYXRoZXNbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZlthdHRyXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGlpID0gZnJvbVthdHRyXS5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZbYXR0cl1baV0gPSBbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAxLCBqaiA9IGZyb21bYXR0cl1baV0ubGVuZ3RoOyBqIDwgamo7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZlthdHRyXVtpXVtqXSA9ICh0b1BhdGhbaV1bal0gLSBmcm9tW2F0dHJdW2ldW2pdKSAvIG1zO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInRyYW5zZm9ybVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfID0gZWxlbWVudC5fLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcSA9IGVxdWFsaXNlVHJhbnNmb3JtKF9bYXR0cl0sIHRvW2F0dHJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbVthdHRyXSA9IGVxLmZyb207XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvW2F0dHJdID0gZXEudG87XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZbYXR0cl0gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZlthdHRyXS5yZWFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMCwgaWkgPSBmcm9tW2F0dHJdLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZbYXR0cl1baV0gPSBbZnJvbVthdHRyXVtpXVswXV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAxLCBqaiA9IGZyb21bYXR0cl1baV0ubGVuZ3RoOyBqIDwgamo7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZbYXR0cl1baV1bal0gPSAodG9bYXR0cl1baV1bal0gLSBmcm9tW2F0dHJdW2ldW2pdKSAvIG1zO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG0gPSAoZWxlbWVudC5tYXRyaXggfHwgbmV3IE1hdHJpeCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzIgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXzoge3RyYW5zZm9ybTogXy50cmFuc2Zvcm19LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldEJCb3g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0QkJveCgxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tW2F0dHJdID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5hLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5iLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5mXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhY3RUcmFuc2Zvcm0odG8yLCB0b1thdHRyXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvW2F0dHJdID0gdG8yLl8udHJhbnNmb3JtO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmW2F0dHJdID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHRvMi5tYXRyaXguYSAtIG0uYSkgLyBtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0bzIubWF0cml4LmIgLSBtLmIpIC8gbXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodG8yLm1hdHJpeC5jIC0gbS5jKSAvIG1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHRvMi5tYXRyaXguZCAtIG0uZCkgLyBtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0bzIubWF0cml4LmUgLSBtLmUpIC8gbXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodG8yLm1hdHJpeC5mIC0gbS5mKSAvIG1zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZyb21bYXR0cl0gPSBbXy5zeCwgXy5zeSwgXy5kZWcsIF8uZHgsIF8uZHldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB2YXIgdG8yID0ge186e30sIGdldEJCb3g6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGVsZW1lbnQuZ2V0QkJveCgpOyB9fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0cmFjdFRyYW5zZm9ybSh0bzIsIHRvW2F0dHJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZGlmZlthdHRyXSA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICh0bzIuXy5zeCAtIF8uc3gpIC8gbXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAodG8yLl8uc3kgLSBfLnN5KSAvIG1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgKHRvMi5fLmRlZyAtIF8uZGVnKSAvIG1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgKHRvMi5fLmR4IC0gXy5keCkgLyBtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICh0bzIuXy5keSAtIF8uZHkpIC8gbXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiY3N2XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlcyA9IFN0cihwYXJhbXNbYXR0cl0pW3NwbGl0XShzZXBhcmF0b3IpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tMiA9IFN0cihmcm9tW2F0dHJdKVtzcGxpdF0oc2VwYXJhdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0ciA9PSBcImNsaXAtcmVjdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb21bYXR0cl0gPSBmcm9tMjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZlthdHRyXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpID0gZnJvbTIubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmW2F0dHJdW2ldID0gKHZhbHVlc1tpXSAtIGZyb21bYXR0cl1baV0pIC8gbXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9bYXR0cl0gPSB2YWx1ZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlcyA9IFtdW2NvbmNhdF0ocGFyYW1zW2F0dHJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tMiA9IFtdW2NvbmNhdF0oZnJvbVthdHRyXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZlthdHRyXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkgPSBlbGVtZW50LnBhcGVyLmN1c3RvbUF0dHJpYnV0ZXNbYXR0cl0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZlthdHRyXVtpXSA9ICgodmFsdWVzW2ldIHx8IDApIC0gKGZyb20yW2ldIHx8IDApKSAvIG1zO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBlYXNpbmcgPSBwYXJhbXMuZWFzaW5nLFxuICAgICAgICAgICAgICAgIGVhc3llYXN5ID0gUi5lYXNpbmdfZm9ybXVsYXNbZWFzaW5nXTtcbiAgICAgICAgICAgIGlmICghZWFzeWVhc3kpIHtcbiAgICAgICAgICAgICAgICBlYXN5ZWFzeSA9IFN0cihlYXNpbmcpLm1hdGNoKGJlemllcnJnKTtcbiAgICAgICAgICAgICAgICBpZiAoZWFzeWVhc3kgJiYgZWFzeWVhc3kubGVuZ3RoID09IDUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnZlID0gZWFzeWVhc3k7XG4gICAgICAgICAgICAgICAgICAgIGVhc3llYXN5ID0gZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBDdWJpY0JlemllckF0VGltZSh0LCArY3VydmVbMV0sICtjdXJ2ZVsyXSwgK2N1cnZlWzNdLCArY3VydmVbNF0sIG1zKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlYXN5ZWFzeSA9IHBpcGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGltZXN0YW1wID0gcGFyYW1zLnN0YXJ0IHx8IGFuaW0uc3RhcnQgfHwgK25ldyBEYXRlO1xuICAgICAgICAgICAgZSA9IHtcbiAgICAgICAgICAgICAgICBhbmltOiBhbmltLFxuICAgICAgICAgICAgICAgIHBlcmNlbnQ6IHBlcmNlbnQsXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAgICAgc3RhcnQ6IHRpbWVzdGFtcCArIChhbmltLmRlbCB8fCAwKSxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IDAsXG4gICAgICAgICAgICAgICAgaW5pdHN0YXR1czogc3RhdHVzIHx8IDAsXG4gICAgICAgICAgICAgICAgc3RvcDogZmFsc2UsXG4gICAgICAgICAgICAgICAgbXM6IG1zLFxuICAgICAgICAgICAgICAgIGVhc2luZzogZWFzeWVhc3ksXG4gICAgICAgICAgICAgICAgZnJvbTogZnJvbSxcbiAgICAgICAgICAgICAgICBkaWZmOiBkaWZmLFxuICAgICAgICAgICAgICAgIHRvOiB0byxcbiAgICAgICAgICAgICAgICBlbDogZWxlbWVudCxcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogcGFyYW1zLmNhbGxiYWNrLFxuICAgICAgICAgICAgICAgIHByZXY6IHByZXYsXG4gICAgICAgICAgICAgICAgbmV4dDogbmV4dCxcbiAgICAgICAgICAgICAgICByZXBlYXQ6IHRpbWVzIHx8IGFuaW0udGltZXMsXG4gICAgICAgICAgICAgICAgb3JpZ2luOiBlbGVtZW50LmF0dHIoKSxcbiAgICAgICAgICAgICAgICB0b3RhbE9yaWdpbjogdG90YWxPcmlnaW5cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBhbmltYXRpb25FbGVtZW50cy5wdXNoKGUpO1xuICAgICAgICAgICAgaWYgKHN0YXR1cyAmJiAhaXNJbkFuaW0gJiYgIWlzSW5BbmltU2V0KSB7XG4gICAgICAgICAgICAgICAgZS5zdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBlLnN0YXJ0ID0gbmV3IERhdGUgLSBtcyAqIHN0YXR1cztcbiAgICAgICAgICAgICAgICBpZiAoYW5pbWF0aW9uRWxlbWVudHMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFuaW1hdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0luQW5pbVNldCkge1xuICAgICAgICAgICAgICAgIGUuc3RhcnQgPSBuZXcgRGF0ZSAtIGUubXMgKiBzdGF0dXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhbmltYXRpb25FbGVtZW50cy5sZW5ndGggPT0gMSAmJiByZXF1ZXN0QW5pbUZyYW1lKGFuaW1hdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpc0luQW5pbS5pbml0c3RhdHVzID0gc3RhdHVzO1xuICAgICAgICAgICAgaXNJbkFuaW0uc3RhcnQgPSBuZXcgRGF0ZSAtIGlzSW5BbmltLm1zICogc3RhdHVzO1xuICAgICAgICB9XG4gICAgICAgIGV2ZShcInJhcGhhZWwuYW5pbS5zdGFydC5cIiArIGVsZW1lbnQuaWQsIGVsZW1lbnQsIGFuaW0pO1xuICAgIH1cbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5hbmltYXRpb25cbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENyZWF0ZXMgYW4gYW5pbWF0aW9uIG9iamVjdCB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gdGhlIEBFbGVtZW50LmFuaW1hdGUgb3IgQEVsZW1lbnQuYW5pbWF0ZVdpdGggbWV0aG9kcy5cbiAgICAgKiBTZWUgYWxzbyBAQW5pbWF0aW9uLmRlbGF5IGFuZCBAQW5pbWF0aW9uLnJlcGVhdCBtZXRob2RzLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBwYXJhbXMgKG9iamVjdCkgZmluYWwgYXR0cmlidXRlcyBmb3IgdGhlIGVsZW1lbnQsIHNlZSBhbHNvIEBFbGVtZW50LmF0dHJcbiAgICAgLSBtcyAobnVtYmVyKSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGZvciBhbmltYXRpb24gdG8gcnVuXG4gICAgIC0gZWFzaW5nIChzdHJpbmcpICNvcHRpb25hbCBlYXNpbmcgdHlwZS4gQWNjZXB0IG9uZSBvZiBAUmFwaGFlbC5lYXNpbmdfZm9ybXVsYXMgb3IgQ1NTIGZvcm1hdDogYGN1YmljJiN4MjAxMDtiZXppZXIoWFgsJiMxNjA7WFgsJiMxNjA7WFgsJiMxNjA7WFgpYFxuICAgICAtIGNhbGxiYWNrIChmdW5jdGlvbikgI29wdGlvbmFsIGNhbGxiYWNrIGZ1bmN0aW9uLiBXaWxsIGJlIGNhbGxlZCBhdCB0aGUgZW5kIG9mIGFuaW1hdGlvbi5cbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSBAQW5pbWF0aW9uXG4gICAgXFwqL1xuICAgIFIuYW5pbWF0aW9uID0gZnVuY3Rpb24gKHBhcmFtcywgbXMsIGVhc2luZywgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHBhcmFtcyBpbnN0YW5jZW9mIEFuaW1hdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICAgICAgfVxuICAgICAgICBpZiAoUi5pcyhlYXNpbmcsIFwiZnVuY3Rpb25cIikgfHwgIWVhc2luZykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBlYXNpbmcgfHwgbnVsbDtcbiAgICAgICAgICAgIGVhc2luZyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcGFyYW1zID0gT2JqZWN0KHBhcmFtcyk7XG4gICAgICAgIG1zID0gK21zIHx8IDA7XG4gICAgICAgIHZhciBwID0ge30sXG4gICAgICAgICAgICBqc29uLFxuICAgICAgICAgICAgYXR0cjtcbiAgICAgICAgZm9yIChhdHRyIGluIHBhcmFtcykgaWYgKHBhcmFtc1toYXNdKGF0dHIpICYmIHRvRmxvYXQoYXR0cikgIT0gYXR0ciAmJiB0b0Zsb2F0KGF0dHIpICsgXCIlXCIgIT0gYXR0cikge1xuICAgICAgICAgICAganNvbiA9IHRydWU7XG4gICAgICAgICAgICBwW2F0dHJdID0gcGFyYW1zW2F0dHJdO1xuICAgICAgICB9XG4gICAgICAgIGlmICghanNvbikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBBbmltYXRpb24ocGFyYW1zLCBtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlYXNpbmcgJiYgKHAuZWFzaW5nID0gZWFzaW5nKTtcbiAgICAgICAgICAgIGNhbGxiYWNrICYmIChwLmNhbGxiYWNrID0gY2FsbGJhY2spO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBBbmltYXRpb24oezEwMDogcH0sIG1zKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuYW5pbWF0ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ3JlYXRlcyBhbmQgc3RhcnRzIGFuaW1hdGlvbiBmb3IgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gcGFyYW1zIChvYmplY3QpIGZpbmFsIGF0dHJpYnV0ZXMgZm9yIHRoZSBlbGVtZW50LCBzZWUgYWxzbyBARWxlbWVudC5hdHRyXG4gICAgIC0gbXMgKG51bWJlcikgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmb3IgYW5pbWF0aW9uIHRvIHJ1blxuICAgICAtIGVhc2luZyAoc3RyaW5nKSAjb3B0aW9uYWwgZWFzaW5nIHR5cGUuIEFjY2VwdCBvbmUgb2YgQFJhcGhhZWwuZWFzaW5nX2Zvcm11bGFzIG9yIENTUyBmb3JtYXQ6IGBjdWJpYyYjeDIwMTA7YmV6aWVyKFhYLCYjMTYwO1hYLCYjMTYwO1hYLCYjMTYwO1hYKWBcbiAgICAgLSBjYWxsYmFjayAoZnVuY3Rpb24pICNvcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbi4gV2lsbCBiZSBjYWxsZWQgYXQgdGhlIGVuZCBvZiBhbmltYXRpb24uXG4gICAgICogb3JcbiAgICAgLSBhbmltYXRpb24gKG9iamVjdCkgYW5pbWF0aW9uIG9iamVjdCwgc2VlIEBSYXBoYWVsLmFuaW1hdGlvblxuICAgICAqKlxuICAgICA9IChvYmplY3QpIG9yaWdpbmFsIGVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by5hbmltYXRlID0gZnVuY3Rpb24gKHBhcmFtcywgbXMsIGVhc2luZywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzO1xuICAgICAgICBpZiAoZWxlbWVudC5yZW1vdmVkKSB7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjay5jYWxsKGVsZW1lbnQpO1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGFuaW0gPSBwYXJhbXMgaW5zdGFuY2VvZiBBbmltYXRpb24gPyBwYXJhbXMgOiBSLmFuaW1hdGlvbihwYXJhbXMsIG1zLCBlYXNpbmcsIGNhbGxiYWNrKTtcbiAgICAgICAgcnVuQW5pbWF0aW9uKGFuaW0sIGVsZW1lbnQsIGFuaW0ucGVyY2VudHNbMF0sIG51bGwsIGVsZW1lbnQuYXR0cigpKTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5zZXRUaW1lXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBTZXRzIHRoZSBzdGF0dXMgb2YgYW5pbWF0aW9uIG9mIHRoZSBlbGVtZW50IGluIG1pbGxpc2Vjb25kcy4gU2ltaWxhciB0byBARWxlbWVudC5zdGF0dXMgbWV0aG9kLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBhbmltIChvYmplY3QpIGFuaW1hdGlvbiBvYmplY3RcbiAgICAgLSB2YWx1ZSAobnVtYmVyKSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgYW5pbWF0aW9uXG4gICAgICoqXG4gICAgID0gKG9iamVjdCkgb3JpZ2luYWwgZWxlbWVudCBpZiBgdmFsdWVgIGlzIHNwZWNpZmllZFxuICAgICAqIE5vdGUsIHRoYXQgZHVyaW5nIGFuaW1hdGlvbiBmb2xsb3dpbmcgZXZlbnRzIGFyZSB0cmlnZ2VyZWQ6XG4gICAgICpcbiAgICAgKiBPbiBlYWNoIGFuaW1hdGlvbiBmcmFtZSBldmVudCBgYW5pbS5mcmFtZS48aWQ+YCwgb24gc3RhcnQgYGFuaW0uc3RhcnQuPGlkPmAgYW5kIG9uIGVuZCBgYW5pbS5maW5pc2guPGlkPmAuXG4gICAgXFwqL1xuICAgIGVscHJvdG8uc2V0VGltZSA9IGZ1bmN0aW9uIChhbmltLCB2YWx1ZSkge1xuICAgICAgICBpZiAoYW5pbSAmJiB2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXR1cyhhbmltLCBtbWluKHZhbHVlLCBhbmltLm1zKSAvIGFuaW0ubXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuc3RhdHVzXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBHZXRzIG9yIHNldHMgdGhlIHN0YXR1cyBvZiBhbmltYXRpb24gb2YgdGhlIGVsZW1lbnQuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGFuaW0gKG9iamVjdCkgI29wdGlvbmFsIGFuaW1hdGlvbiBvYmplY3RcbiAgICAgLSB2YWx1ZSAobnVtYmVyKSAjb3B0aW9uYWwgMCDigJMgMS4gSWYgc3BlY2lmaWVkLCBtZXRob2Qgd29ya3MgbGlrZSBhIHNldHRlciBhbmQgc2V0cyB0aGUgc3RhdHVzIG9mIGEgZ2l2ZW4gYW5pbWF0aW9uIHRvIHRoZSB2YWx1ZS4gVGhpcyB3aWxsIGNhdXNlIGFuaW1hdGlvbiB0byBqdW1wIHRvIHRoZSBnaXZlbiBwb3NpdGlvbi5cbiAgICAgKipcbiAgICAgPSAobnVtYmVyKSBzdGF0dXNcbiAgICAgKiBvclxuICAgICA9IChhcnJheSkgc3RhdHVzIGlmIGBhbmltYCBpcyBub3Qgc3BlY2lmaWVkLiBBcnJheSBvZiBvYmplY3RzIGluIGZvcm1hdDpcbiAgICAgbyB7XG4gICAgIG8gICAgIGFuaW06IChvYmplY3QpIGFuaW1hdGlvbiBvYmplY3RcbiAgICAgbyAgICAgc3RhdHVzOiAobnVtYmVyKSBzdGF0dXNcbiAgICAgbyB9XG4gICAgICogb3JcbiAgICAgPSAob2JqZWN0KSBvcmlnaW5hbCBlbGVtZW50IGlmIGB2YWx1ZWAgaXMgc3BlY2lmaWVkXG4gICAgXFwqL1xuICAgIGVscHJvdG8uc3RhdHVzID0gZnVuY3Rpb24gKGFuaW0sIHZhbHVlKSB7XG4gICAgICAgIHZhciBvdXQgPSBbXSxcbiAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgbGVuLFxuICAgICAgICAgICAgZTtcbiAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJ1bkFuaW1hdGlvbihhbmltLCB0aGlzLCAtMSwgbW1pbih2YWx1ZSwgMSkpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZW4gPSBhbmltYXRpb25FbGVtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZSA9IGFuaW1hdGlvbkVsZW1lbnRzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChlLmVsLmlkID09IHRoaXMuaWQgJiYgKCFhbmltIHx8IGUuYW5pbSA9PSBhbmltKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYW5pbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGUuc3RhdHVzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG91dC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW06IGUuYW5pbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogZS5zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFuaW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnBhdXNlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBTdG9wcyBhbmltYXRpb24gb2YgdGhlIGVsZW1lbnQgd2l0aCBhYmlsaXR5IHRvIHJlc3VtZSBpdCBsYXRlciBvbi5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gYW5pbSAob2JqZWN0KSAjb3B0aW9uYWwgYW5pbWF0aW9uIG9iamVjdFxuICAgICAqKlxuICAgICA9IChvYmplY3QpIG9yaWdpbmFsIGVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by5wYXVzZSA9IGZ1bmN0aW9uIChhbmltKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW5pbWF0aW9uRWxlbWVudHMubGVuZ3RoOyBpKyspIGlmIChhbmltYXRpb25FbGVtZW50c1tpXS5lbC5pZCA9PSB0aGlzLmlkICYmICghYW5pbSB8fCBhbmltYXRpb25FbGVtZW50c1tpXS5hbmltID09IGFuaW0pKSB7XG4gICAgICAgICAgICBpZiAoZXZlKFwicmFwaGFlbC5hbmltLnBhdXNlLlwiICsgdGhpcy5pZCwgdGhpcywgYW5pbWF0aW9uRWxlbWVudHNbaV0uYW5pbSkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uRWxlbWVudHNbaV0ucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnJlc3VtZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVzdW1lcyBhbmltYXRpb24gaWYgaXQgd2FzIHBhdXNlZCB3aXRoIEBFbGVtZW50LnBhdXNlIG1ldGhvZC5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gYW5pbSAob2JqZWN0KSAjb3B0aW9uYWwgYW5pbWF0aW9uIG9iamVjdFxuICAgICAqKlxuICAgICA9IChvYmplY3QpIG9yaWdpbmFsIGVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by5yZXN1bWUgPSBmdW5jdGlvbiAoYW5pbSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuaW1hdGlvbkVsZW1lbnRzLmxlbmd0aDsgaSsrKSBpZiAoYW5pbWF0aW9uRWxlbWVudHNbaV0uZWwuaWQgPT0gdGhpcy5pZCAmJiAoIWFuaW0gfHwgYW5pbWF0aW9uRWxlbWVudHNbaV0uYW5pbSA9PSBhbmltKSkge1xuICAgICAgICAgICAgdmFyIGUgPSBhbmltYXRpb25FbGVtZW50c1tpXTtcbiAgICAgICAgICAgIGlmIChldmUoXCJyYXBoYWVsLmFuaW0ucmVzdW1lLlwiICsgdGhpcy5pZCwgdGhpcywgZS5hbmltKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgZS5wYXVzZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0dXMoZS5hbmltLCBlLnN0YXR1cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5zdG9wXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBTdG9wcyBhbmltYXRpb24gb2YgdGhlIGVsZW1lbnQuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGFuaW0gKG9iamVjdCkgI29wdGlvbmFsIGFuaW1hdGlvbiBvYmplY3RcbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSBvcmlnaW5hbCBlbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8uc3RvcCA9IGZ1bmN0aW9uIChhbmltKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW5pbWF0aW9uRWxlbWVudHMubGVuZ3RoOyBpKyspIGlmIChhbmltYXRpb25FbGVtZW50c1tpXS5lbC5pZCA9PSB0aGlzLmlkICYmICghYW5pbSB8fCBhbmltYXRpb25FbGVtZW50c1tpXS5hbmltID09IGFuaW0pKSB7XG4gICAgICAgICAgICBpZiAoZXZlKFwicmFwaGFlbC5hbmltLnN0b3AuXCIgKyB0aGlzLmlkLCB0aGlzLCBhbmltYXRpb25FbGVtZW50c1tpXS5hbmltKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBhbmltYXRpb25FbGVtZW50cy5zcGxpY2UoaS0tLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIGZ1bmN0aW9uIHN0b3BBbmltYXRpb24ocGFwZXIpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbmltYXRpb25FbGVtZW50cy5sZW5ndGg7IGkrKykgaWYgKGFuaW1hdGlvbkVsZW1lbnRzW2ldLmVsLnBhcGVyID09IHBhcGVyKSB7XG4gICAgICAgICAgICBhbmltYXRpb25FbGVtZW50cy5zcGxpY2UoaS0tLCAxKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBldmUub24oXCJyYXBoYWVsLnJlbW92ZVwiLCBzdG9wQW5pbWF0aW9uKTtcbiAgICBldmUub24oXCJyYXBoYWVsLmNsZWFyXCIsIHN0b3BBbmltYXRpb24pO1xuICAgIGVscHJvdG8udG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBcIlJhcGhhXFx4ZWJsXFx1MjAxOXMgb2JqZWN0XCI7XG4gICAgfTtcblxuICAgIC8vIFNldFxuICAgIHZhciBTZXQgPSBmdW5jdGlvbiAoaXRlbXMpIHtcbiAgICAgICAgdGhpcy5pdGVtcyA9IFtdO1xuICAgICAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgICAgIHRoaXMudHlwZSA9IFwic2V0XCI7XG4gICAgICAgIGlmIChpdGVtcykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gaXRlbXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChpdGVtc1tpXSAmJiAoaXRlbXNbaV0uY29uc3RydWN0b3IgPT0gZWxwcm90by5jb25zdHJ1Y3RvciB8fCBpdGVtc1tpXS5jb25zdHJ1Y3RvciA9PSBTZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNbdGhpcy5pdGVtcy5sZW5ndGhdID0gdGhpcy5pdGVtc1t0aGlzLml0ZW1zLmxlbmd0aF0gPSBpdGVtc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sZW5ndGgrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHNldHByb3RvID0gU2V0LnByb3RvdHlwZTtcbiAgICAvKlxcXG4gICAgICogU2V0LnB1c2hcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgZWFjaCBhcmd1bWVudCB0byB0aGUgY3VycmVudCBzZXQuXG4gICAgID0gKG9iamVjdCkgb3JpZ2luYWwgZWxlbWVudFxuICAgIFxcKi9cbiAgICBzZXRwcm90by5wdXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaXRlbSxcbiAgICAgICAgICAgIGxlbjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgIGl0ZW0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBpZiAoaXRlbSAmJiAoaXRlbS5jb25zdHJ1Y3RvciA9PSBlbHByb3RvLmNvbnN0cnVjdG9yIHx8IGl0ZW0uY29uc3RydWN0b3IgPT0gU2V0KSkge1xuICAgICAgICAgICAgICAgIGxlbiA9IHRoaXMuaXRlbXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHRoaXNbbGVuXSA9IHRoaXMuaXRlbXNbbGVuXSA9IGl0ZW07XG4gICAgICAgICAgICAgICAgdGhpcy5sZW5ndGgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTZXQucG9wXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGxhc3QgZWxlbWVudCBhbmQgcmV0dXJucyBpdC5cbiAgICAgPSAob2JqZWN0KSBlbGVtZW50XG4gICAgXFwqL1xuICAgIHNldHByb3RvLnBvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5sZW5ndGggJiYgZGVsZXRlIHRoaXNbdGhpcy5sZW5ndGgtLV07XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zLnBvcCgpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFNldC5mb3JFYWNoXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBFeGVjdXRlcyBnaXZlbiBmdW5jdGlvbiBmb3IgZWFjaCBlbGVtZW50IGluIHRoZSBzZXQuXG4gICAgICpcbiAgICAgKiBJZiBmdW5jdGlvbiByZXR1cm5zIGBmYWxzZWAgaXQgd2lsbCBzdG9wIGxvb3AgcnVubmluZy5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gY2FsbGJhY2sgKGZ1bmN0aW9uKSBmdW5jdGlvbiB0byBydW5cbiAgICAgLSB0aGlzQXJnIChvYmplY3QpIGNvbnRleHQgb2JqZWN0IGZvciB0aGUgY2FsbGJhY2tcbiAgICAgPSAob2JqZWN0KSBTZXQgb2JqZWN0XG4gICAgXFwqL1xuICAgIHNldHByb3RvLmZvckVhY2ggPSBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gdGhpcy5pdGVtcy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB0aGlzLml0ZW1zW2ldLCBpKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIGZvciAodmFyIG1ldGhvZCBpbiBlbHByb3RvKSBpZiAoZWxwcm90b1toYXNdKG1ldGhvZCkpIHtcbiAgICAgICAgc2V0cHJvdG9bbWV0aG9kXSA9IChmdW5jdGlvbiAobWV0aG9kbmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJnID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsW21ldGhvZG5hbWVdW2FwcGx5XShlbCwgYXJnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pKG1ldGhvZCk7XG4gICAgfVxuICAgIHNldHByb3RvLmF0dHIgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKG5hbWUgJiYgUi5pcyhuYW1lLCBhcnJheSkgJiYgUi5pcyhuYW1lWzBdLCBcIm9iamVjdFwiKSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDAsIGpqID0gbmFtZS5sZW5ndGg7IGogPCBqajsgaisrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtc1tqXS5hdHRyKG5hbWVbal0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gdGhpcy5pdGVtcy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtc1tpXS5hdHRyKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTZXQuY2xlYXJcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZWRzIGFsbCBlbGVtZW50cyBmcm9tIHRoZSBzZXRcbiAgICBcXCovXG4gICAgc2V0cHJvdG8uY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHdoaWxlICh0aGlzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5wb3AoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLypcXFxuICAgICAqIFNldC5zcGxpY2VcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgZ2l2ZW4gZWxlbWVudCBmcm9tIHRoZSBzZXRcbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gaW5kZXggKG51bWJlcikgcG9zaXRpb24gb2YgdGhlIGRlbGV0aW9uXG4gICAgIC0gY291bnQgKG51bWJlcikgbnVtYmVyIG9mIGVsZW1lbnQgdG8gcmVtb3ZlXG4gICAgIC0gaW5zZXJ0aW9u4oCmIChvYmplY3QpICNvcHRpb25hbCBlbGVtZW50cyB0byBpbnNlcnRcbiAgICAgPSAob2JqZWN0KSBzZXQgZWxlbWVudHMgdGhhdCB3ZXJlIGRlbGV0ZWRcbiAgICBcXCovXG4gICAgc2V0cHJvdG8uc3BsaWNlID0gZnVuY3Rpb24gKGluZGV4LCBjb3VudCwgaW5zZXJ0aW9uKSB7XG4gICAgICAgIGluZGV4ID0gaW5kZXggPCAwID8gbW1heCh0aGlzLmxlbmd0aCArIGluZGV4LCAwKSA6IGluZGV4O1xuICAgICAgICBjb3VudCA9IG1tYXgoMCwgbW1pbih0aGlzLmxlbmd0aCAtIGluZGV4LCBjb3VudCkpO1xuICAgICAgICB2YXIgdGFpbCA9IFtdLFxuICAgICAgICAgICAgdG9kZWwgPSBbXSxcbiAgICAgICAgICAgIGFyZ3MgPSBbXSxcbiAgICAgICAgICAgIGk7XG4gICAgICAgIGZvciAoaSA9IDI7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICB0b2RlbC5wdXNoKHRoaXNbaW5kZXggKyBpXSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICg7IGkgPCB0aGlzLmxlbmd0aCAtIGluZGV4OyBpKyspIHtcbiAgICAgICAgICAgIHRhaWwucHVzaCh0aGlzW2luZGV4ICsgaV0pO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhcmdsZW4gPSBhcmdzLmxlbmd0aDtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGFyZ2xlbiArIHRhaWwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXNbaW5kZXggKyBpXSA9IHRoaXNbaW5kZXggKyBpXSA9IGkgPCBhcmdsZW4gPyBhcmdzW2ldIDogdGFpbFtpIC0gYXJnbGVuXTtcbiAgICAgICAgfVxuICAgICAgICBpID0gdGhpcy5pdGVtcy5sZW5ndGggPSB0aGlzLmxlbmd0aCAtPSBjb3VudCAtIGFyZ2xlbjtcbiAgICAgICAgd2hpbGUgKHRoaXNbaV0pIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzW2krK107XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBTZXQodG9kZWwpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFNldC5leGNsdWRlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGdpdmVuIGVsZW1lbnQgZnJvbSB0aGUgc2V0XG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGVsZW1lbnQgKG9iamVjdCkgZWxlbWVudCB0byByZW1vdmVcbiAgICAgPSAoYm9vbGVhbikgYHRydWVgIGlmIG9iamVjdCB3YXMgZm91bmQgJiByZW1vdmVkIGZyb20gdGhlIHNldFxuICAgIFxcKi9cbiAgICBzZXRwcm90by5leGNsdWRlID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IHRoaXMubGVuZ3RoOyBpIDwgaWk7IGkrKykgaWYgKHRoaXNbaV0gPT0gZWwpIHtcbiAgICAgICAgICAgIHRoaXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHNldHByb3RvLmFuaW1hdGUgPSBmdW5jdGlvbiAocGFyYW1zLCBtcywgZWFzaW5nLCBjYWxsYmFjaykge1xuICAgICAgICAoUi5pcyhlYXNpbmcsIFwiZnVuY3Rpb25cIikgfHwgIWVhc2luZykgJiYgKGNhbGxiYWNrID0gZWFzaW5nIHx8IG51bGwpO1xuICAgICAgICB2YXIgbGVuID0gdGhpcy5pdGVtcy5sZW5ndGgsXG4gICAgICAgICAgICBpID0gbGVuLFxuICAgICAgICAgICAgaXRlbSxcbiAgICAgICAgICAgIHNldCA9IHRoaXMsXG4gICAgICAgICAgICBjb2xsZWN0b3I7XG4gICAgICAgIGlmICghbGVuKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjayAmJiAoY29sbGVjdG9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgIS0tbGVuICYmIGNhbGxiYWNrLmNhbGwoc2V0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGVhc2luZyA9IFIuaXMoZWFzaW5nLCBzdHJpbmcpID8gZWFzaW5nIDogY29sbGVjdG9yO1xuICAgICAgICB2YXIgYW5pbSA9IFIuYW5pbWF0aW9uKHBhcmFtcywgbXMsIGVhc2luZywgY29sbGVjdG9yKTtcbiAgICAgICAgaXRlbSA9IHRoaXMuaXRlbXNbLS1pXS5hbmltYXRlKGFuaW0pO1xuICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICB0aGlzLml0ZW1zW2ldICYmICF0aGlzLml0ZW1zW2ldLnJlbW92ZWQgJiYgdGhpcy5pdGVtc1tpXS5hbmltYXRlV2l0aChpdGVtLCBhbmltLCBhbmltKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHNldHByb3RvLmluc2VydEFmdGVyID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgIHZhciBpID0gdGhpcy5pdGVtcy5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXNbaV0uaW5zZXJ0QWZ0ZXIoZWwpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgc2V0cHJvdG8uZ2V0QkJveCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHggPSBbXSxcbiAgICAgICAgICAgIHkgPSBbXSxcbiAgICAgICAgICAgIHgyID0gW10sXG4gICAgICAgICAgICB5MiA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gdGhpcy5pdGVtcy5sZW5ndGg7IGktLTspIGlmICghdGhpcy5pdGVtc1tpXS5yZW1vdmVkKSB7XG4gICAgICAgICAgICB2YXIgYm94ID0gdGhpcy5pdGVtc1tpXS5nZXRCQm94KCk7XG4gICAgICAgICAgICB4LnB1c2goYm94LngpO1xuICAgICAgICAgICAgeS5wdXNoKGJveC55KTtcbiAgICAgICAgICAgIHgyLnB1c2goYm94LnggKyBib3gud2lkdGgpO1xuICAgICAgICAgICAgeTIucHVzaChib3gueSArIGJveC5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIHggPSBtbWluW2FwcGx5XSgwLCB4KTtcbiAgICAgICAgeSA9IG1taW5bYXBwbHldKDAsIHkpO1xuICAgICAgICB4MiA9IG1tYXhbYXBwbHldKDAsIHgyKTtcbiAgICAgICAgeTIgPSBtbWF4W2FwcGx5XSgwLCB5Mik7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgIHgyOiB4MixcbiAgICAgICAgICAgIHkyOiB5MixcbiAgICAgICAgICAgIHdpZHRoOiB4MiAtIHgsXG4gICAgICAgICAgICBoZWlnaHQ6IHkyIC0geVxuICAgICAgICB9O1xuICAgIH07XG4gICAgc2V0cHJvdG8uY2xvbmUgPSBmdW5jdGlvbiAocykge1xuICAgICAgICBzID0gdGhpcy5wYXBlci5zZXQoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gdGhpcy5pdGVtcy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICBzLnB1c2godGhpcy5pdGVtc1tpXS5jbG9uZSgpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcztcbiAgICB9O1xuICAgIHNldHByb3RvLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gXCJSYXBoYVxceGVibFxcdTIwMThzIHNldFwiO1xuICAgIH07XG5cbiAgICBzZXRwcm90by5nbG93ID0gZnVuY3Rpb24oZ2xvd0NvbmZpZykge1xuICAgICAgICB2YXIgcmV0ID0gdGhpcy5wYXBlci5zZXQoKTtcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHNoYXBlLCBpbmRleCl7XG4gICAgICAgICAgICB2YXIgZyA9IHNoYXBlLmdsb3coZ2xvd0NvbmZpZyk7XG4gICAgICAgICAgICBpZihnICE9IG51bGwpe1xuICAgICAgICAgICAgICAgIGcuZm9yRWFjaChmdW5jdGlvbihzaGFwZTIsIGluZGV4Mil7XG4gICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKHNoYXBlMik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH07XG5cbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5yZWdpc3RlckZvbnRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgZ2l2ZW4gZm9udCB0byB0aGUgcmVnaXN0ZXJlZCBzZXQgb2YgZm9udHMgZm9yIFJhcGhhw6tsLiBTaG91bGQgYmUgdXNlZCBhcyBhbiBpbnRlcm5hbCBjYWxsIGZyb20gd2l0aGluIEN1ZsOzbuKAmXMgZm9udCBmaWxlLlxuICAgICAqIFJldHVybnMgb3JpZ2luYWwgcGFyYW1ldGVyLCBzbyBpdCBjb3VsZCBiZSB1c2VkIHdpdGggY2hhaW5pbmcuXG4gICAgICMgPGEgaHJlZj1cImh0dHA6Ly93aWtpLmdpdGh1Yi5jb20vc29yY2N1L2N1Zm9uL2Fib3V0XCI+TW9yZSBhYm91dCBDdWbDs24gYW5kIGhvdyB0byBjb252ZXJ0IHlvdXIgZm9udCBmb3JtIFRURiwgT1RGLCBldGMgdG8gSmF2YVNjcmlwdCBmaWxlLjwvYT5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gZm9udCAob2JqZWN0KSB0aGUgZm9udCB0byByZWdpc3RlclxuICAgICA9IChvYmplY3QpIHRoZSBmb250IHlvdSBwYXNzZWQgaW5cbiAgICAgPiBVc2FnZVxuICAgICB8IEN1Zm9uLnJlZ2lzdGVyRm9udChSYXBoYWVsLnJlZ2lzdGVyRm9udCh74oCmfSkpO1xuICAgIFxcKi9cbiAgICBSLnJlZ2lzdGVyRm9udCA9IGZ1bmN0aW9uIChmb250KSB7XG4gICAgICAgIGlmICghZm9udC5mYWNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZm9udDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZvbnRzID0gdGhpcy5mb250cyB8fCB7fTtcbiAgICAgICAgdmFyIGZvbnRjb3B5ID0ge1xuICAgICAgICAgICAgICAgIHc6IGZvbnQudyxcbiAgICAgICAgICAgICAgICBmYWNlOiB7fSxcbiAgICAgICAgICAgICAgICBnbHlwaHM6IHt9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFtaWx5ID0gZm9udC5mYWNlW1wiZm9udC1mYW1pbHlcIl07XG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gZm9udC5mYWNlKSBpZiAoZm9udC5mYWNlW2hhc10ocHJvcCkpIHtcbiAgICAgICAgICAgIGZvbnRjb3B5LmZhY2VbcHJvcF0gPSBmb250LmZhY2VbcHJvcF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZm9udHNbZmFtaWx5XSkge1xuICAgICAgICAgICAgdGhpcy5mb250c1tmYW1pbHldLnB1c2goZm9udGNvcHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5mb250c1tmYW1pbHldID0gW2ZvbnRjb3B5XTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWZvbnQuc3ZnKSB7XG4gICAgICAgICAgICBmb250Y29weS5mYWNlW1widW5pdHMtcGVyLWVtXCJdID0gdG9JbnQoZm9udC5mYWNlW1widW5pdHMtcGVyLWVtXCJdLCAxMCk7XG4gICAgICAgICAgICBmb3IgKHZhciBnbHlwaCBpbiBmb250LmdseXBocykgaWYgKGZvbnQuZ2x5cGhzW2hhc10oZ2x5cGgpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhdGggPSBmb250LmdseXBoc1tnbHlwaF07XG4gICAgICAgICAgICAgICAgZm9udGNvcHkuZ2x5cGhzW2dseXBoXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgdzogcGF0aC53LFxuICAgICAgICAgICAgICAgICAgICBrOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgZDogcGF0aC5kICYmIFwiTVwiICsgcGF0aC5kLnJlcGxhY2UoL1ttbGN4dHJ2XS9nLCBmdW5jdGlvbiAoY29tbWFuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7bDogXCJMXCIsIGM6IFwiQ1wiLCB4OiBcInpcIiwgdDogXCJtXCIsIHI6IFwibFwiLCB2OiBcImNcIn1bY29tbWFuZF0gfHwgXCJNXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSArIFwielwiXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZiAocGF0aC5rKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGsgaW4gcGF0aC5rKSBpZiAocGF0aFtoYXNdKGspKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb250Y29weS5nbHlwaHNbZ2x5cGhdLmtba10gPSBwYXRoLmtba107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZvbnQ7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIuZ2V0Rm9udFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogRmluZHMgZm9udCBvYmplY3QgaW4gdGhlIHJlZ2lzdGVyZWQgZm9udHMgYnkgZ2l2ZW4gcGFyYW1ldGVycy4gWW91IGNvdWxkIHNwZWNpZnkgb25seSBvbmUgd29yZCBmcm9tIHRoZSBmb250IG5hbWUsIGxpa2Ug4oCcTXlyaWFk4oCdIGZvciDigJxNeXJpYWQgUHJv4oCdLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBmYW1pbHkgKHN0cmluZykgZm9udCBmYW1pbHkgbmFtZSBvciBhbnkgd29yZCBmcm9tIGl0XG4gICAgIC0gd2VpZ2h0IChzdHJpbmcpICNvcHRpb25hbCBmb250IHdlaWdodFxuICAgICAtIHN0eWxlIChzdHJpbmcpICNvcHRpb25hbCBmb250IHN0eWxlXG4gICAgIC0gc3RyZXRjaCAoc3RyaW5nKSAjb3B0aW9uYWwgZm9udCBzdHJldGNoXG4gICAgID0gKG9iamVjdCkgdGhlIGZvbnQgb2JqZWN0XG4gICAgID4gVXNhZ2VcbiAgICAgfCBwYXBlci5wcmludCgxMDAsIDEwMCwgXCJUZXN0IHN0cmluZ1wiLCBwYXBlci5nZXRGb250KFwiVGltZXNcIiwgODAwKSwgMzApO1xuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLmdldEZvbnQgPSBmdW5jdGlvbiAoZmFtaWx5LCB3ZWlnaHQsIHN0eWxlLCBzdHJldGNoKSB7XG4gICAgICAgIHN0cmV0Y2ggPSBzdHJldGNoIHx8IFwibm9ybWFsXCI7XG4gICAgICAgIHN0eWxlID0gc3R5bGUgfHwgXCJub3JtYWxcIjtcbiAgICAgICAgd2VpZ2h0ID0gK3dlaWdodCB8fCB7bm9ybWFsOiA0MDAsIGJvbGQ6IDcwMCwgbGlnaHRlcjogMzAwLCBib2xkZXI6IDgwMH1bd2VpZ2h0XSB8fCA0MDA7XG4gICAgICAgIGlmICghUi5mb250cykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBmb250ID0gUi5mb250c1tmYW1pbHldO1xuICAgICAgICBpZiAoIWZvbnQpIHtcbiAgICAgICAgICAgIHZhciBuYW1lID0gbmV3IFJlZ0V4cChcIihefFxcXFxzKVwiICsgZmFtaWx5LnJlcGxhY2UoL1teXFx3XFxkXFxzKyF+LjpfLV0vZywgRSkgKyBcIihcXFxcc3wkKVwiLCBcImlcIik7XG4gICAgICAgICAgICBmb3IgKHZhciBmb250TmFtZSBpbiBSLmZvbnRzKSBpZiAoUi5mb250c1toYXNdKGZvbnROYW1lKSkge1xuICAgICAgICAgICAgICAgIGlmIChuYW1lLnRlc3QoZm9udE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvbnQgPSBSLmZvbnRzW2ZvbnROYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciB0aGVmb250O1xuICAgICAgICBpZiAoZm9udCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gZm9udC5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhlZm9udCA9IGZvbnRbaV07XG4gICAgICAgICAgICAgICAgaWYgKHRoZWZvbnQuZmFjZVtcImZvbnQtd2VpZ2h0XCJdID09IHdlaWdodCAmJiAodGhlZm9udC5mYWNlW1wiZm9udC1zdHlsZVwiXSA9PSBzdHlsZSB8fCAhdGhlZm9udC5mYWNlW1wiZm9udC1zdHlsZVwiXSkgJiYgdGhlZm9udC5mYWNlW1wiZm9udC1zdHJldGNoXCJdID09IHN0cmV0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGVmb250O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLnByaW50XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDcmVhdGVzIHBhdGggdGhhdCByZXByZXNlbnQgZ2l2ZW4gdGV4dCB3cml0dGVuIHVzaW5nIGdpdmVuIGZvbnQgYXQgZ2l2ZW4gcG9zaXRpb24gd2l0aCBnaXZlbiBzaXplLlxuICAgICAqIFJlc3VsdCBvZiB0aGUgbWV0aG9kIGlzIHBhdGggZWxlbWVudCB0aGF0IGNvbnRhaW5zIHdob2xlIHRleHQgYXMgYSBzZXBhcmF0ZSBwYXRoLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSB4IChudW1iZXIpIHggcG9zaXRpb24gb2YgdGhlIHRleHRcbiAgICAgLSB5IChudW1iZXIpIHkgcG9zaXRpb24gb2YgdGhlIHRleHRcbiAgICAgLSBzdHJpbmcgKHN0cmluZykgdGV4dCB0byBwcmludFxuICAgICAtIGZvbnQgKG9iamVjdCkgZm9udCBvYmplY3QsIHNlZSBAUGFwZXIuZ2V0Rm9udFxuICAgICAtIHNpemUgKG51bWJlcikgI29wdGlvbmFsIHNpemUgb2YgdGhlIGZvbnQsIGRlZmF1bHQgaXMgYDE2YFxuICAgICAtIG9yaWdpbiAoc3RyaW5nKSAjb3B0aW9uYWwgY291bGQgYmUgYFwiYmFzZWxpbmVcImAgb3IgYFwibWlkZGxlXCJgLCBkZWZhdWx0IGlzIGBcIm1pZGRsZVwiYFxuICAgICAtIGxldHRlcl9zcGFjaW5nIChudW1iZXIpICNvcHRpb25hbCBudW1iZXIgaW4gcmFuZ2UgYC0xLi4xYCwgZGVmYXVsdCBpcyBgMGBcbiAgICAgPSAob2JqZWN0KSByZXN1bHRpbmcgcGF0aCBlbGVtZW50LCB3aGljaCBjb25zaXN0IG9mIGFsbCBsZXR0ZXJzXG4gICAgID4gVXNhZ2VcbiAgICAgfCB2YXIgdHh0ID0gci5wcmludCgxMCwgNTAsIFwicHJpbnRcIiwgci5nZXRGb250KFwiTXVzZW9cIiksIDMwKS5hdHRyKHtmaWxsOiBcIiNmZmZcIn0pO1xuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLnByaW50ID0gZnVuY3Rpb24gKHgsIHksIHN0cmluZywgZm9udCwgc2l6ZSwgb3JpZ2luLCBsZXR0ZXJfc3BhY2luZykge1xuICAgICAgICBvcmlnaW4gPSBvcmlnaW4gfHwgXCJtaWRkbGVcIjsgLy8gYmFzZWxpbmV8bWlkZGxlXG4gICAgICAgIGxldHRlcl9zcGFjaW5nID0gbW1heChtbWluKGxldHRlcl9zcGFjaW5nIHx8IDAsIDEpLCAtMSk7XG4gICAgICAgIHZhciBsZXR0ZXJzID0gU3RyKHN0cmluZylbc3BsaXRdKEUpLFxuICAgICAgICAgICAgc2hpZnQgPSAwLFxuICAgICAgICAgICAgbm90Zmlyc3QgPSAwLFxuICAgICAgICAgICAgcGF0aCA9IEUsXG4gICAgICAgICAgICBzY2FsZTtcbiAgICAgICAgUi5pcyhmb250LCBcInN0cmluZ1wiKSAmJiAoZm9udCA9IHRoaXMuZ2V0Rm9udChmb250KSk7XG4gICAgICAgIGlmIChmb250KSB7XG4gICAgICAgICAgICBzY2FsZSA9IChzaXplIHx8IDE2KSAvIGZvbnQuZmFjZVtcInVuaXRzLXBlci1lbVwiXTtcbiAgICAgICAgICAgIHZhciBiYiA9IGZvbnQuZmFjZS5iYm94W3NwbGl0XShzZXBhcmF0b3IpLFxuICAgICAgICAgICAgICAgIHRvcCA9ICtiYlswXSxcbiAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0ID0gYmJbM10gLSBiYlsxXSxcbiAgICAgICAgICAgICAgICBzaGlmdHkgPSAwLFxuICAgICAgICAgICAgICAgIGhlaWdodCA9ICtiYlsxXSArIChvcmlnaW4gPT0gXCJiYXNlbGluZVwiID8gbGluZUhlaWdodCArICgrZm9udC5mYWNlLmRlc2NlbnQpIDogbGluZUhlaWdodCAvIDIpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gbGV0dGVycy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxldHRlcnNbaV0gPT0gXCJcXG5cIikge1xuICAgICAgICAgICAgICAgICAgICBzaGlmdCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGN1cnIgPSAwO1xuICAgICAgICAgICAgICAgICAgICBub3RmaXJzdCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHNoaWZ0eSArPSBsaW5lSGVpZ2h0O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwcmV2ID0gbm90Zmlyc3QgJiYgZm9udC5nbHlwaHNbbGV0dGVyc1tpIC0gMV1dIHx8IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyciA9IGZvbnQuZ2x5cGhzW2xldHRlcnNbaV1dO1xuICAgICAgICAgICAgICAgICAgICBzaGlmdCArPSBub3RmaXJzdCA/IChwcmV2LncgfHwgZm9udC53KSArIChwcmV2LmsgJiYgcHJldi5rW2xldHRlcnNbaV1dIHx8IDApICsgKGZvbnQudyAqIGxldHRlcl9zcGFjaW5nKSA6IDA7XG4gICAgICAgICAgICAgICAgICAgIG5vdGZpcnN0ID0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGN1cnIgJiYgY3Vyci5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhdGggKz0gUi50cmFuc2Zvcm1QYXRoKGN1cnIuZCwgW1widFwiLCBzaGlmdCAqIHNjYWxlLCBzaGlmdHkgKiBzY2FsZSwgXCJzXCIsIHNjYWxlLCBzY2FsZSwgdG9wLCBoZWlnaHQsIFwidFwiLCAoeCAtIHRvcCkgLyBzY2FsZSwgKHkgLSBoZWlnaHQpIC8gc2NhbGVdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucGF0aChwYXRoKS5hdHRyKHtcbiAgICAgICAgICAgIGZpbGw6IFwiIzAwMFwiLFxuICAgICAgICAgICAgc3Ryb2tlOiBcIm5vbmVcIlxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLypcXFxuICAgICAqIFBhcGVyLmFkZFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogSW1wb3J0cyBlbGVtZW50cyBpbiBKU09OIGFycmF5IGluIGZvcm1hdCBge3R5cGU6IHR5cGUsIDxhdHRyaWJ1dGVzPn1gXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGpzb24gKGFycmF5KVxuICAgICA9IChvYmplY3QpIHJlc3VsdGluZyBzZXQgb2YgaW1wb3J0ZWQgZWxlbWVudHNcbiAgICAgPiBVc2FnZVxuICAgICB8IHBhcGVyLmFkZChbXG4gICAgIHwgICAgIHtcbiAgICAgfCAgICAgICAgIHR5cGU6IFwiY2lyY2xlXCIsXG4gICAgIHwgICAgICAgICBjeDogMTAsXG4gICAgIHwgICAgICAgICBjeTogMTAsXG4gICAgIHwgICAgICAgICByOiA1XG4gICAgIHwgICAgIH0sXG4gICAgIHwgICAgIHtcbiAgICAgfCAgICAgICAgIHR5cGU6IFwicmVjdFwiLFxuICAgICB8ICAgICAgICAgeDogMTAsXG4gICAgIHwgICAgICAgICB5OiAxMCxcbiAgICAgfCAgICAgICAgIHdpZHRoOiAxMCxcbiAgICAgfCAgICAgICAgIGhlaWdodDogMTAsXG4gICAgIHwgICAgICAgICBmaWxsOiBcIiNmYzBcIlxuICAgICB8ICAgICB9XG4gICAgIHwgXSk7XG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8uYWRkID0gZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgaWYgKFIuaXMoanNvbiwgXCJhcnJheVwiKSkge1xuICAgICAgICAgICAgdmFyIHJlcyA9IHRoaXMuc2V0KCksXG4gICAgICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICAgICAgaWkgPSBqc29uLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBqO1xuICAgICAgICAgICAgZm9yICg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaiA9IGpzb25baV0gfHwge307XG4gICAgICAgICAgICAgICAgZWxlbWVudHNbaGFzXShqLnR5cGUpICYmIHJlcy5wdXNoKHRoaXNbai50eXBlXSgpLmF0dHIoaikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfTtcblxuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmZvcm1hdFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogU2ltcGxlIGZvcm1hdCBmdW5jdGlvbi4gUmVwbGFjZXMgY29uc3RydWN0aW9uIG9mIHR5cGUg4oCcYHs8bnVtYmVyPn1g4oCdIHRvIHRoZSBjb3JyZXNwb25kaW5nIGFyZ3VtZW50LlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSB0b2tlbiAoc3RyaW5nKSBzdHJpbmcgdG8gZm9ybWF0XG4gICAgIC0g4oCmIChzdHJpbmcpIHJlc3Qgb2YgYXJndW1lbnRzIHdpbGwgYmUgdHJlYXRlZCBhcyBwYXJhbWV0ZXJzIGZvciByZXBsYWNlbWVudFxuICAgICA9IChzdHJpbmcpIGZvcm1hdGVkIHN0cmluZ1xuICAgICA+IFVzYWdlXG4gICAgIHwgdmFyIHggPSAxMCxcbiAgICAgfCAgICAgeSA9IDIwLFxuICAgICB8ICAgICB3aWR0aCA9IDQwLFxuICAgICB8ICAgICBoZWlnaHQgPSA1MDtcbiAgICAgfCAvLyB0aGlzIHdpbGwgZHJhdyBhIHJlY3Rhbmd1bGFyIHNoYXBlIGVxdWl2YWxlbnQgdG8gXCJNMTAsMjBoNDB2NTBoLTQwelwiXG4gICAgIHwgcGFwZXIucGF0aChSYXBoYWVsLmZvcm1hdChcIk17MH0sezF9aHsyfXZ7M31oezR9elwiLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCAtd2lkdGgpKTtcbiAgICBcXCovXG4gICAgUi5mb3JtYXQgPSBmdW5jdGlvbiAodG9rZW4sIHBhcmFtcykge1xuICAgICAgICB2YXIgYXJncyA9IFIuaXMocGFyYW1zLCBhcnJheSkgPyBbMF1bY29uY2F0XShwYXJhbXMpIDogYXJndW1lbnRzO1xuICAgICAgICB0b2tlbiAmJiBSLmlzKHRva2VuLCBzdHJpbmcpICYmIGFyZ3MubGVuZ3RoIC0gMSAmJiAodG9rZW4gPSB0b2tlbi5yZXBsYWNlKGZvcm1hdHJnLCBmdW5jdGlvbiAoc3RyLCBpKSB7XG4gICAgICAgICAgICByZXR1cm4gYXJnc1srK2ldID09IG51bGwgPyBFIDogYXJnc1tpXTtcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4gdG9rZW4gfHwgRTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmZ1bGxmaWxsXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBIGxpdHRsZSBiaXQgbW9yZSBhZHZhbmNlZCBmb3JtYXQgZnVuY3Rpb24gdGhhbiBAUmFwaGFlbC5mb3JtYXQuIFJlcGxhY2VzIGNvbnN0cnVjdGlvbiBvZiB0eXBlIOKAnGB7PG5hbWU+fWDigJ0gdG8gdGhlIGNvcnJlc3BvbmRpbmcgYXJndW1lbnQuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHRva2VuIChzdHJpbmcpIHN0cmluZyB0byBmb3JtYXRcbiAgICAgLSBqc29uIChvYmplY3QpIG9iamVjdCB3aGljaCBwcm9wZXJ0aWVzIHdpbGwgYmUgdXNlZCBhcyBhIHJlcGxhY2VtZW50XG4gICAgID0gKHN0cmluZykgZm9ybWF0ZWQgc3RyaW5nXG4gICAgID4gVXNhZ2VcbiAgICAgfCAvLyB0aGlzIHdpbGwgZHJhdyBhIHJlY3Rhbmd1bGFyIHNoYXBlIGVxdWl2YWxlbnQgdG8gXCJNMTAsMjBoNDB2NTBoLTQwelwiXG4gICAgIHwgcGFwZXIucGF0aChSYXBoYWVsLmZ1bGxmaWxsKFwiTXt4fSx7eX1oe2RpbS53aWR0aH12e2RpbS5oZWlnaHR9aHtkaW1bJ25lZ2F0aXZlIHdpZHRoJ119elwiLCB7XG4gICAgIHwgICAgIHg6IDEwLFxuICAgICB8ICAgICB5OiAyMCxcbiAgICAgfCAgICAgZGltOiB7XG4gICAgIHwgICAgICAgICB3aWR0aDogNDAsXG4gICAgIHwgICAgICAgICBoZWlnaHQ6IDUwLFxuICAgICB8ICAgICAgICAgXCJuZWdhdGl2ZSB3aWR0aFwiOiAtNDBcbiAgICAgfCAgICAgfVxuICAgICB8IH0pKTtcbiAgICBcXCovXG4gICAgUi5mdWxsZmlsbCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB0b2tlblJlZ2V4ID0gL1xceyhbXlxcfV0rKVxcfS9nLFxuICAgICAgICAgICAgb2JqTm90YXRpb25SZWdleCA9IC8oPzooPzpefFxcLikoLis/KSg/PVxcW3xcXC58JHxcXCgpfFxcWygnfFwiKSguKz8pXFwyXFxdKShcXChcXCkpPy9nLCAvLyBtYXRjaGVzIC54eHh4eCBvciBbXCJ4eHh4eFwiXSB0byBydW4gb3ZlciBvYmplY3QgcHJvcGVydGllc1xuICAgICAgICAgICAgcmVwbGFjZXIgPSBmdW5jdGlvbiAoYWxsLCBrZXksIG9iaikge1xuICAgICAgICAgICAgICAgIHZhciByZXMgPSBvYmo7XG4gICAgICAgICAgICAgICAga2V5LnJlcGxhY2Uob2JqTm90YXRpb25SZWdleCwgZnVuY3Rpb24gKGFsbCwgbmFtZSwgcXVvdGUsIHF1b3RlZE5hbWUsIGlzRnVuYykge1xuICAgICAgICAgICAgICAgICAgICBuYW1lID0gbmFtZSB8fCBxdW90ZWROYW1lO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmFtZSBpbiByZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMgPSByZXNbbmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgcmVzID09IFwiZnVuY3Rpb25cIiAmJiBpc0Z1bmMgJiYgKHJlcyA9IHJlcygpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJlcyA9IChyZXMgPT0gbnVsbCB8fCByZXMgPT0gb2JqID8gYWxsIDogcmVzKSArIFwiXCI7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH07XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoc3RyLCBvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcoc3RyKS5yZXBsYWNlKHRva2VuUmVnZXgsIGZ1bmN0aW9uIChhbGwsIGtleSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXBsYWNlcihhbGwsIGtleSwgb2JqKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH0pKCk7XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwubmluamFcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIElmIHlvdSB3YW50IHRvIGxlYXZlIG5vIHRyYWNlIG9mIFJhcGhhw6tsIChXZWxsLCBSYXBoYcOrbCBjcmVhdGVzIG9ubHkgb25lIGdsb2JhbCB2YXJpYWJsZSBgUmFwaGFlbGAsIGJ1dCBhbnl3YXkuKSBZb3UgY2FuIHVzZSBgbmluamFgIG1ldGhvZC5cbiAgICAgKiBCZXdhcmUsIHRoYXQgaW4gdGhpcyBjYXNlIHBsdWdpbnMgY291bGQgc3RvcCB3b3JraW5nLCBiZWNhdXNlIHRoZXkgYXJlIGRlcGVuZGluZyBvbiBnbG9iYWwgdmFyaWFibGUgZXhpc3RhbmNlLlxuICAgICAqKlxuICAgICA9IChvYmplY3QpIFJhcGhhZWwgb2JqZWN0XG4gICAgID4gVXNhZ2VcbiAgICAgfCAoZnVuY3Rpb24gKGxvY2FsX3JhcGhhZWwpIHtcbiAgICAgfCAgICAgdmFyIHBhcGVyID0gbG9jYWxfcmFwaGFlbCgxMCwgMTAsIDMyMCwgMjAwKTtcbiAgICAgfCAgICAg4oCmXG4gICAgIHwgfSkoUmFwaGFlbC5uaW5qYSgpKTtcbiAgICBcXCovXG4gICAgUi5uaW5qYSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgb2xkUmFwaGFlbC53YXMgPyAoZy53aW4uUmFwaGFlbCA9IG9sZFJhcGhhZWwuaXMpIDogZGVsZXRlIFJhcGhhZWw7XG4gICAgICAgIHJldHVybiBSO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuc3RcbiAgICAgWyBwcm9wZXJ0eSAob2JqZWN0KSBdXG4gICAgICoqXG4gICAgICogWW91IGNhbiBhZGQgeW91ciBvd24gbWV0aG9kIHRvIGVsZW1lbnRzIGFuZCBzZXRzLiBJdCBpcyB3aXNlIHRvIGFkZCBhIHNldCBtZXRob2QgZm9yIGVhY2ggZWxlbWVudCBtZXRob2RcbiAgICAgKiB5b3UgYWRkZWQsIHNvIHlvdSB3aWxsIGJlIGFibGUgdG8gY2FsbCB0aGUgc2FtZSBtZXRob2Qgb24gc2V0cyB0b28uXG4gICAgICoqXG4gICAgICogU2VlIGFsc28gQFJhcGhhZWwuZWwuXG4gICAgID4gVXNhZ2VcbiAgICAgfCBSYXBoYWVsLmVsLnJlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgfCAgICAgdGhpcy5hdHRyKHtmaWxsOiBcIiNmMDBcIn0pO1xuICAgICB8IH07XG4gICAgIHwgUmFwaGFlbC5zdC5yZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgIHwgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgfCAgICAgICAgIGVsLnJlZCgpO1xuICAgICB8ICAgICB9KTtcbiAgICAgfCB9O1xuICAgICB8IC8vIHRoZW4gdXNlIGl0XG4gICAgIHwgcGFwZXIuc2V0KHBhcGVyLmNpcmNsZSgxMDAsIDEwMCwgMjApLCBwYXBlci5jaXJjbGUoMTEwLCAxMDAsIDIwKSkucmVkKCk7XG4gICAgXFwqL1xuICAgIFIuc3QgPSBzZXRwcm90bztcbiAgICAvLyBGaXJlZm94IDwzLjYgZml4OiBodHRwOi8vd2VicmVmbGVjdGlvbi5ibG9nc3BvdC5jb20vMjAwOS8xMS8xOTUtY2hhcnMtdG8taGVscC1sYXp5LWxvYWRpbmcuaHRtbFxuICAgIChmdW5jdGlvbiAoZG9jLCBsb2FkZWQsIGYpIHtcbiAgICAgICAgaWYgKGRvYy5yZWFkeVN0YXRlID09IG51bGwgJiYgZG9jLmFkZEV2ZW50TGlzdGVuZXIpe1xuICAgICAgICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIobG9hZGVkLCBmID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKGxvYWRlZCwgZiwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGRvYy5yZWFkeVN0YXRlID0gXCJjb21wbGV0ZVwiO1xuICAgICAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgICAgICAgZG9jLnJlYWR5U3RhdGUgPSBcImxvYWRpbmdcIjtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBpc0xvYWRlZCgpIHtcbiAgICAgICAgICAgICgvaW4vKS50ZXN0KGRvYy5yZWFkeVN0YXRlKSA/IHNldFRpbWVvdXQoaXNMb2FkZWQsIDkpIDogUi5ldmUoXCJyYXBoYWVsLkRPTWxvYWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgaXNMb2FkZWQoKTtcbiAgICB9KShkb2N1bWVudCwgXCJET01Db250ZW50TG9hZGVkXCIpO1xuXG4gICAgb2xkUmFwaGFlbC53YXMgPyAoZy53aW4uUmFwaGFlbCA9IFIpIDogKFJhcGhhZWwgPSBSKTtcbiAgICBcbiAgICBldmUub24oXCJyYXBoYWVsLkRPTWxvYWRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBsb2FkZWQgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgcmVxdWlyZSgnLi9yYXBoYWVsLnN2ZycpO1xuICAgIHJlcXVpcmUoJy4vcmFwaGFlbC52bWwnKTtcblxuICAgIG1vZHVsZS5leHBvcnRzID0gUmFwaGFlbDtcbn0pKCk7XG4iLCIvLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJAgXFxcXFxuLy8g4pSCIFJhcGhhw6tsIC0gSmF2YVNjcmlwdCBWZWN0b3IgTGlicmFyeSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiBcXFxcXG4vLyDilJzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilKQgXFxcXFxuLy8g4pSCIFNWRyBNb2R1bGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIFxcXFxcbi8vIOKUnOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUpCBcXFxcXG4vLyDilIIgQ29weXJpZ2h0IChjKSAyMDA4LTIwMTEgRG1pdHJ5IEJhcmFub3Zza2l5IChodHRwOi8vcmFwaGFlbGpzLmNvbSkgICDilIIgXFxcXFxuLy8g4pSCIENvcHlyaWdodCAoYykgMjAwOC0yMDExIFNlbmNoYSBMYWJzIChodHRwOi8vc2VuY2hhLmNvbSkgICAgICAgICAgICAg4pSCIFxcXFxcbi8vIOKUgiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIChodHRwOi8vcmFwaGFlbGpzLmNvbS9saWNlbnNlLmh0bWwpIGxpY2Vuc2UuIOKUgiBcXFxcXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJggXFxcXFxud2luZG93LlJhcGhhZWwgJiYgd2luZG93LlJhcGhhZWwuc3ZnICYmIGZ1bmN0aW9uIChSKSB7XG4gICAgdmFyIGhhcyA9IFwiaGFzT3duUHJvcGVydHlcIixcbiAgICAgICAgU3RyID0gU3RyaW5nLFxuICAgICAgICB0b0Zsb2F0ID0gcGFyc2VGbG9hdCxcbiAgICAgICAgdG9JbnQgPSBwYXJzZUludCxcbiAgICAgICAgbWF0aCA9IE1hdGgsXG4gICAgICAgIG1tYXggPSBtYXRoLm1heCxcbiAgICAgICAgYWJzID0gbWF0aC5hYnMsXG4gICAgICAgIHBvdyA9IG1hdGgucG93LFxuICAgICAgICBzZXBhcmF0b3IgPSAvWywgXSsvLFxuICAgICAgICBldmUgPSBSLmV2ZSxcbiAgICAgICAgRSA9IFwiXCIsXG4gICAgICAgIFMgPSBcIiBcIjtcbiAgICB2YXIgeGxpbmsgPSBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIixcbiAgICAgICAgbWFya2VycyA9IHtcbiAgICAgICAgICAgIGJsb2NrOiBcIk01LDAgMCwyLjUgNSw1elwiLFxuICAgICAgICAgICAgY2xhc3NpYzogXCJNNSwwIDAsMi41IDUsNSAzLjUsMyAzLjUsMnpcIixcbiAgICAgICAgICAgIGRpYW1vbmQ6IFwiTTIuNSwwIDUsMi41IDIuNSw1IDAsMi41elwiLFxuICAgICAgICAgICAgb3BlbjogXCJNNiwxIDEsMy41IDYsNlwiLFxuICAgICAgICAgICAgb3ZhbDogXCJNMi41LDBBMi41LDIuNSwwLDAsMSwyLjUsNSAyLjUsMi41LDAsMCwxLDIuNSwwelwiXG4gICAgICAgIH0sXG4gICAgICAgIG1hcmtlckNvdW50ZXIgPSB7fTtcbiAgICBSLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gIFwiWW91ciBicm93c2VyIHN1cHBvcnRzIFNWRy5cXG5Zb3UgYXJlIHJ1bm5pbmcgUmFwaGFcXHhlYmwgXCIgKyB0aGlzLnZlcnNpb247XG4gICAgfTtcbiAgICB2YXIgJCA9IGZ1bmN0aW9uIChlbCwgYXR0cikge1xuICAgICAgICBpZiAoYXR0cikge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBlbCA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgZWwgPSAkKGVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBhdHRyKSBpZiAoYXR0cltoYXNdKGtleSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5LnN1YnN0cmluZygwLCA2KSA9PSBcInhsaW5rOlwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZU5TKHhsaW5rLCBrZXkuc3Vic3RyaW5nKDYpLCBTdHIoYXR0cltrZXldKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKGtleSwgU3RyKGF0dHJba2V5XSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsID0gUi5fZy5kb2MuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgZWwpO1xuICAgICAgICAgICAgZWwuc3R5bGUgJiYgKGVsLnN0eWxlLndlYmtpdFRhcEhpZ2hsaWdodENvbG9yID0gXCJyZ2JhKDAsMCwwLDApXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9LFxuICAgIGFkZEdyYWRpZW50RmlsbCA9IGZ1bmN0aW9uIChlbGVtZW50LCBncmFkaWVudCkge1xuICAgICAgICB2YXIgdHlwZSA9IFwibGluZWFyXCIsXG4gICAgICAgICAgICBpZCA9IGVsZW1lbnQuaWQgKyBncmFkaWVudCxcbiAgICAgICAgICAgIGZ4ID0gLjUsIGZ5ID0gLjUsXG4gICAgICAgICAgICBvID0gZWxlbWVudC5ub2RlLFxuICAgICAgICAgICAgU1ZHID0gZWxlbWVudC5wYXBlcixcbiAgICAgICAgICAgIHMgPSBvLnN0eWxlLFxuICAgICAgICAgICAgZWwgPSBSLl9nLmRvYy5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgICAgIGlmICghZWwpIHtcbiAgICAgICAgICAgIGdyYWRpZW50ID0gU3RyKGdyYWRpZW50KS5yZXBsYWNlKFIuX3JhZGlhbF9ncmFkaWVudCwgZnVuY3Rpb24gKGFsbCwgX2Z4LCBfZnkpIHtcbiAgICAgICAgICAgICAgICB0eXBlID0gXCJyYWRpYWxcIjtcbiAgICAgICAgICAgICAgICBpZiAoX2Z4ICYmIF9meSkge1xuICAgICAgICAgICAgICAgICAgICBmeCA9IHRvRmxvYXQoX2Z4KTtcbiAgICAgICAgICAgICAgICAgICAgZnkgPSB0b0Zsb2F0KF9meSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXIgPSAoKGZ5ID4gLjUpICogMiAtIDEpO1xuICAgICAgICAgICAgICAgICAgICBwb3coZnggLSAuNSwgMikgKyBwb3coZnkgLSAuNSwgMikgPiAuMjUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIChmeSA9IG1hdGguc3FydCguMjUgLSBwb3coZnggLSAuNSwgMikpICogZGlyICsgLjUpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBmeSAhPSAuNSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgKGZ5ID0gZnkudG9GaXhlZCg1KSAtIDFlLTUgKiBkaXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gRTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZ3JhZGllbnQgPSBncmFkaWVudC5zcGxpdCgvXFxzKlxcLVxccyovKTtcbiAgICAgICAgICAgIGlmICh0eXBlID09IFwibGluZWFyXCIpIHtcbiAgICAgICAgICAgICAgICB2YXIgYW5nbGUgPSBncmFkaWVudC5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIGFuZ2xlID0gLXRvRmxvYXQoYW5nbGUpO1xuICAgICAgICAgICAgICAgIGlmIChpc05hTihhbmdsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciB2ZWN0b3IgPSBbMCwgMCwgbWF0aC5jb3MoUi5yYWQoYW5nbGUpKSwgbWF0aC5zaW4oUi5yYWQoYW5nbGUpKV0sXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IDEgLyAobW1heChhYnModmVjdG9yWzJdKSwgYWJzKHZlY3RvclszXSkpIHx8IDEpO1xuICAgICAgICAgICAgICAgIHZlY3RvclsyXSAqPSBtYXg7XG4gICAgICAgICAgICAgICAgdmVjdG9yWzNdICo9IG1heDtcbiAgICAgICAgICAgICAgICBpZiAodmVjdG9yWzJdIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICB2ZWN0b3JbMF0gPSAtdmVjdG9yWzJdO1xuICAgICAgICAgICAgICAgICAgICB2ZWN0b3JbMl0gPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodmVjdG9yWzNdIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICB2ZWN0b3JbMV0gPSAtdmVjdG9yWzNdO1xuICAgICAgICAgICAgICAgICAgICB2ZWN0b3JbM10gPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBkb3RzID0gUi5fcGFyc2VEb3RzKGdyYWRpZW50KTtcbiAgICAgICAgICAgIGlmICghZG90cykge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWQgPSBpZC5yZXBsYWNlKC9bXFwoXFwpXFxzLFxceGIwI10vZywgXCJfXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5ncmFkaWVudCAmJiBpZCAhPSBlbGVtZW50LmdyYWRpZW50LmlkKSB7XG4gICAgICAgICAgICAgICAgU1ZHLmRlZnMucmVtb3ZlQ2hpbGQoZWxlbWVudC5ncmFkaWVudCk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGVsZW1lbnQuZ3JhZGllbnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghZWxlbWVudC5ncmFkaWVudCkge1xuICAgICAgICAgICAgICAgIGVsID0gJCh0eXBlICsgXCJHcmFkaWVudFwiLCB7aWQ6IGlkfSk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5ncmFkaWVudCA9IGVsO1xuICAgICAgICAgICAgICAgICQoZWwsIHR5cGUgPT0gXCJyYWRpYWxcIiA/IHtcbiAgICAgICAgICAgICAgICAgICAgZng6IGZ4LFxuICAgICAgICAgICAgICAgICAgICBmeTogZnlcbiAgICAgICAgICAgICAgICB9IDoge1xuICAgICAgICAgICAgICAgICAgICB4MTogdmVjdG9yWzBdLFxuICAgICAgICAgICAgICAgICAgICB5MTogdmVjdG9yWzFdLFxuICAgICAgICAgICAgICAgICAgICB4MjogdmVjdG9yWzJdLFxuICAgICAgICAgICAgICAgICAgICB5MjogdmVjdG9yWzNdLFxuICAgICAgICAgICAgICAgICAgICBncmFkaWVudFRyYW5zZm9ybTogZWxlbWVudC5tYXRyaXguaW52ZXJ0KClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBTVkcuZGVmcy5hcHBlbmRDaGlsZChlbCk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gZG90cy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsLmFwcGVuZENoaWxkKCQoXCJzdG9wXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogZG90c1tpXS5vZmZzZXQgPyBkb3RzW2ldLm9mZnNldCA6IGkgPyBcIjEwMCVcIiA6IFwiMCVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcC1jb2xvclwiOiBkb3RzW2ldLmNvbG9yIHx8IFwiI2ZmZlwiXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgJChvLCB7XG4gICAgICAgICAgICBmaWxsOiBcInVybCgjXCIgKyBpZCArIFwiKVwiLFxuICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICAgIFwiZmlsbC1vcGFjaXR5XCI6IDFcbiAgICAgICAgfSk7XG4gICAgICAgIHMuZmlsbCA9IEU7XG4gICAgICAgIHMub3BhY2l0eSA9IDE7XG4gICAgICAgIHMuZmlsbE9wYWNpdHkgPSAxO1xuICAgICAgICByZXR1cm4gMTtcbiAgICB9LFxuICAgIHVwZGF0ZVBvc2l0aW9uID0gZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgdmFyIGJib3ggPSBvLmdldEJCb3goMSk7XG4gICAgICAgICQoby5wYXR0ZXJuLCB7cGF0dGVyblRyYW5zZm9ybTogby5tYXRyaXguaW52ZXJ0KCkgKyBcIiB0cmFuc2xhdGUoXCIgKyBiYm94LnggKyBcIixcIiArIGJib3gueSArIFwiKVwifSk7XG4gICAgfSxcbiAgICBhZGRBcnJvdyA9IGZ1bmN0aW9uIChvLCB2YWx1ZSwgaXNFbmQpIHtcbiAgICAgICAgaWYgKG8udHlwZSA9PSBcInBhdGhcIikge1xuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IFN0cih2YWx1ZSkudG9Mb3dlckNhc2UoKS5zcGxpdChcIi1cIiksXG4gICAgICAgICAgICAgICAgcCA9IG8ucGFwZXIsXG4gICAgICAgICAgICAgICAgc2UgPSBpc0VuZCA/IFwiZW5kXCIgOiBcInN0YXJ0XCIsXG4gICAgICAgICAgICAgICAgbm9kZSA9IG8ubm9kZSxcbiAgICAgICAgICAgICAgICBhdHRycyA9IG8uYXR0cnMsXG4gICAgICAgICAgICAgICAgc3Ryb2tlID0gYXR0cnNbXCJzdHJva2Utd2lkdGhcIl0sXG4gICAgICAgICAgICAgICAgaSA9IHZhbHVlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgdHlwZSA9IFwiY2xhc3NpY1wiLFxuICAgICAgICAgICAgICAgIGZyb20sXG4gICAgICAgICAgICAgICAgdG8sXG4gICAgICAgICAgICAgICAgZHgsXG4gICAgICAgICAgICAgICAgcmVmWCxcbiAgICAgICAgICAgICAgICBhdHRyLFxuICAgICAgICAgICAgICAgIHcgPSAzLFxuICAgICAgICAgICAgICAgIGggPSAzLFxuICAgICAgICAgICAgICAgIHQgPSA1O1xuICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodmFsdWVzW2ldKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJibG9ja1wiOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiY2xhc3NpY1wiOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwib3ZhbFwiOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZGlhbW9uZFwiOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwib3BlblwiOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwibm9uZVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA9IHZhbHVlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwid2lkZVwiOiBoID0gNTsgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJuYXJyb3dcIjogaCA9IDI7IGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwibG9uZ1wiOiB3ID0gNTsgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzaG9ydFwiOiB3ID0gMjsgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGUgPT0gXCJvcGVuXCIpIHtcbiAgICAgICAgICAgICAgICB3ICs9IDI7XG4gICAgICAgICAgICAgICAgaCArPSAyO1xuICAgICAgICAgICAgICAgIHQgKz0gMjtcbiAgICAgICAgICAgICAgICBkeCA9IDE7XG4gICAgICAgICAgICAgICAgcmVmWCA9IGlzRW5kID8gNCA6IDE7XG4gICAgICAgICAgICAgICAgYXR0ciA9IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsbDogXCJub25lXCIsXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZTogYXR0cnMuc3Ryb2tlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVmWCA9IGR4ID0gdyAvIDI7XG4gICAgICAgICAgICAgICAgYXR0ciA9IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsbDogYXR0cnMuc3Ryb2tlLFxuICAgICAgICAgICAgICAgICAgICBzdHJva2U6IFwibm9uZVwiXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvLl8uYXJyb3dzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIG8uXy5hcnJvd3MuZW5kUGF0aCAmJiBtYXJrZXJDb3VudGVyW28uXy5hcnJvd3MuZW5kUGF0aF0tLTtcbiAgICAgICAgICAgICAgICAgICAgby5fLmFycm93cy5lbmRNYXJrZXIgJiYgbWFya2VyQ291bnRlcltvLl8uYXJyb3dzLmVuZE1hcmtlcl0tLTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvLl8uYXJyb3dzLnN0YXJ0UGF0aCAmJiBtYXJrZXJDb3VudGVyW28uXy5hcnJvd3Muc3RhcnRQYXRoXS0tO1xuICAgICAgICAgICAgICAgICAgICBvLl8uYXJyb3dzLnN0YXJ0TWFya2VyICYmIG1hcmtlckNvdW50ZXJbby5fLmFycm93cy5zdGFydE1hcmtlcl0tLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG8uXy5hcnJvd3MgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlICE9IFwibm9uZVwiKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhdGhJZCA9IFwicmFwaGFlbC1tYXJrZXItXCIgKyB0eXBlLFxuICAgICAgICAgICAgICAgICAgICBtYXJrZXJJZCA9IFwicmFwaGFlbC1tYXJrZXItXCIgKyBzZSArIHR5cGUgKyB3ICsgaDtcbiAgICAgICAgICAgICAgICBpZiAoIVIuX2cuZG9jLmdldEVsZW1lbnRCeUlkKHBhdGhJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcC5kZWZzLmFwcGVuZENoaWxkKCQoJChcInBhdGhcIiksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3Ryb2tlLWxpbmVjYXBcIjogXCJyb3VuZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZDogbWFya2Vyc1t0eXBlXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBwYXRoSWRcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICBtYXJrZXJDb3VudGVyW3BhdGhJZF0gPSAxO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmtlckNvdW50ZXJbcGF0aElkXSsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gUi5fZy5kb2MuZ2V0RWxlbWVudEJ5SWQobWFya2VySWQpLFxuICAgICAgICAgICAgICAgICAgICB1c2U7XG4gICAgICAgICAgICAgICAgaWYgKCFtYXJrZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyID0gJCgkKFwibWFya2VyXCIpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogbWFya2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJIZWlnaHQ6IGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJXaWR0aDogdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWVudDogXCJhdXRvXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZYOiByZWZYLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmWTogaCAvIDJcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHVzZSA9ICQoJChcInVzZVwiKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ4bGluazpocmVmXCI6IFwiI1wiICsgcGF0aElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAoaXNFbmQgPyBcInJvdGF0ZSgxODAgXCIgKyB3IC8gMiArIFwiIFwiICsgaCAvIDIgKyBcIikgXCIgOiBFKSArIFwic2NhbGUoXCIgKyB3IC8gdCArIFwiLFwiICsgaCAvIHQgKyBcIilcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3Ryb2tlLXdpZHRoXCI6ICgxIC8gKCh3IC8gdCArIGggLyB0KSAvIDIpKS50b0ZpeGVkKDQpXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBtYXJrZXIuYXBwZW5kQ2hpbGQodXNlKTtcbiAgICAgICAgICAgICAgICAgICAgcC5kZWZzLmFwcGVuZENoaWxkKG1hcmtlcik7XG4gICAgICAgICAgICAgICAgICAgIG1hcmtlckNvdW50ZXJbbWFya2VySWRdID0gMTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtYXJrZXJDb3VudGVyW21hcmtlcklkXSsrO1xuICAgICAgICAgICAgICAgICAgICB1c2UgPSBtYXJrZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ1c2VcIilbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICQodXNlLCBhdHRyKTtcbiAgICAgICAgICAgICAgICB2YXIgZGVsdGEgPSBkeCAqICh0eXBlICE9IFwiZGlhbW9uZFwiICYmIHR5cGUgIT0gXCJvdmFsXCIpO1xuICAgICAgICAgICAgICAgIGlmIChpc0VuZCkge1xuICAgICAgICAgICAgICAgICAgICBmcm9tID0gby5fLmFycm93cy5zdGFydGR4ICogc3Ryb2tlIHx8IDA7XG4gICAgICAgICAgICAgICAgICAgIHRvID0gUi5nZXRUb3RhbExlbmd0aChhdHRycy5wYXRoKSAtIGRlbHRhICogc3Ryb2tlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZyb20gPSBkZWx0YSAqIHN0cm9rZTtcbiAgICAgICAgICAgICAgICAgICAgdG8gPSBSLmdldFRvdGFsTGVuZ3RoKGF0dHJzLnBhdGgpIC0gKG8uXy5hcnJvd3MuZW5kZHggKiBzdHJva2UgfHwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGF0dHIgPSB7fTtcbiAgICAgICAgICAgICAgICBhdHRyW1wibWFya2VyLVwiICsgc2VdID0gXCJ1cmwoI1wiICsgbWFya2VySWQgKyBcIilcIjtcbiAgICAgICAgICAgICAgICBpZiAodG8gfHwgZnJvbSkge1xuICAgICAgICAgICAgICAgICAgICBhdHRyLmQgPSBSYXBoYWVsLmdldFN1YnBhdGgoYXR0cnMucGF0aCwgZnJvbSwgdG8pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkKG5vZGUsIGF0dHIpO1xuICAgICAgICAgICAgICAgIG8uXy5hcnJvd3Nbc2UgKyBcIlBhdGhcIl0gPSBwYXRoSWQ7XG4gICAgICAgICAgICAgICAgby5fLmFycm93c1tzZSArIFwiTWFya2VyXCJdID0gbWFya2VySWQ7XG4gICAgICAgICAgICAgICAgby5fLmFycm93c1tzZSArIFwiZHhcIl0gPSBkZWx0YTtcbiAgICAgICAgICAgICAgICBvLl8uYXJyb3dzW3NlICsgXCJUeXBlXCJdID0gdHlwZTtcbiAgICAgICAgICAgICAgICBvLl8uYXJyb3dzW3NlICsgXCJTdHJpbmdcIl0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGZyb20gPSBvLl8uYXJyb3dzLnN0YXJ0ZHggKiBzdHJva2UgfHwgMDtcbiAgICAgICAgICAgICAgICAgICAgdG8gPSBSLmdldFRvdGFsTGVuZ3RoKGF0dHJzLnBhdGgpIC0gZnJvbTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmcm9tID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdG8gPSBSLmdldFRvdGFsTGVuZ3RoKGF0dHJzLnBhdGgpIC0gKG8uXy5hcnJvd3MuZW5kZHggKiBzdHJva2UgfHwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG8uXy5hcnJvd3Nbc2UgKyBcIlBhdGhcIl0gJiYgJChub2RlLCB7ZDogUmFwaGFlbC5nZXRTdWJwYXRoKGF0dHJzLnBhdGgsIGZyb20sIHRvKX0pO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBvLl8uYXJyb3dzW3NlICsgXCJQYXRoXCJdO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBvLl8uYXJyb3dzW3NlICsgXCJNYXJrZXJcIl07XG4gICAgICAgICAgICAgICAgZGVsZXRlIG8uXy5hcnJvd3Nbc2UgKyBcImR4XCJdO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBvLl8uYXJyb3dzW3NlICsgXCJUeXBlXCJdO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBvLl8uYXJyb3dzW3NlICsgXCJTdHJpbmdcIl07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGF0dHIgaW4gbWFya2VyQ291bnRlcikgaWYgKG1hcmtlckNvdW50ZXJbaGFzXShhdHRyKSAmJiAhbWFya2VyQ291bnRlclthdHRyXSkge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gUi5fZy5kb2MuZ2V0RWxlbWVudEJ5SWQoYXR0cik7XG4gICAgICAgICAgICAgICAgaXRlbSAmJiBpdGVtLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGRhc2hhcnJheSA9IHtcbiAgICAgICAgXCJcIjogWzBdLFxuICAgICAgICBcIm5vbmVcIjogWzBdLFxuICAgICAgICBcIi1cIjogWzMsIDFdLFxuICAgICAgICBcIi5cIjogWzEsIDFdLFxuICAgICAgICBcIi0uXCI6IFszLCAxLCAxLCAxXSxcbiAgICAgICAgXCItLi5cIjogWzMsIDEsIDEsIDEsIDEsIDFdLFxuICAgICAgICBcIi4gXCI6IFsxLCAzXSxcbiAgICAgICAgXCItIFwiOiBbNCwgM10sXG4gICAgICAgIFwiLS1cIjogWzgsIDNdLFxuICAgICAgICBcIi0gLlwiOiBbNCwgMywgMSwgM10sXG4gICAgICAgIFwiLS0uXCI6IFs4LCAzLCAxLCAzXSxcbiAgICAgICAgXCItLS4uXCI6IFs4LCAzLCAxLCAzLCAxLCAzXVxuICAgIH0sXG4gICAgYWRkRGFzaGVzID0gZnVuY3Rpb24gKG8sIHZhbHVlLCBwYXJhbXMpIHtcbiAgICAgICAgdmFsdWUgPSBkYXNoYXJyYXlbU3RyKHZhbHVlKS50b0xvd2VyQ2FzZSgpXTtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgd2lkdGggPSBvLmF0dHJzW1wic3Ryb2tlLXdpZHRoXCJdIHx8IFwiMVwiLFxuICAgICAgICAgICAgICAgIGJ1dHQgPSB7cm91bmQ6IHdpZHRoLCBzcXVhcmU6IHdpZHRoLCBidXR0OiAwfVtvLmF0dHJzW1wic3Ryb2tlLWxpbmVjYXBcIl0gfHwgcGFyYW1zW1wic3Ryb2tlLWxpbmVjYXBcIl1dIHx8IDAsXG4gICAgICAgICAgICAgICAgZGFzaGVzID0gW10sXG4gICAgICAgICAgICAgICAgaSA9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgICAgICBkYXNoZXNbaV0gPSB2YWx1ZVtpXSAqIHdpZHRoICsgKChpICUgMikgPyAxIDogLTEpICogYnV0dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICQoby5ub2RlLCB7XCJzdHJva2UtZGFzaGFycmF5XCI6IGRhc2hlcy5qb2luKFwiLFwiKX0pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBzZXRGaWxsQW5kU3Ryb2tlID0gZnVuY3Rpb24gKG8sIHBhcmFtcykge1xuICAgICAgICB2YXIgbm9kZSA9IG8ubm9kZSxcbiAgICAgICAgICAgIGF0dHJzID0gby5hdHRycyxcbiAgICAgICAgICAgIHZpcyA9IG5vZGUuc3R5bGUudmlzaWJpbGl0eTtcbiAgICAgICAgbm9kZS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgZm9yICh2YXIgYXR0IGluIHBhcmFtcykge1xuICAgICAgICAgICAgaWYgKHBhcmFtc1toYXNdKGF0dCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIVIuX2F2YWlsYWJsZUF0dHJzW2hhc10oYXR0KSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gcGFyYW1zW2F0dF07XG4gICAgICAgICAgICAgICAgYXR0cnNbYXR0XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoYXR0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJibHVyXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBvLmJsdXIodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJocmVmXCI6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ0aXRsZVwiOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwidGFyZ2V0XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcG4gPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocG4udGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9IFwiYVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhsID0gJChcImFcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG4uaW5zZXJ0QmVmb3JlKGhsLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBobC5hcHBlbmRDaGlsZChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbiA9IGhsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dCA9PSBcInRhcmdldFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG4uc2V0QXR0cmlidXRlTlMoeGxpbmssIFwic2hvd1wiLCB2YWx1ZSA9PSBcImJsYW5rXCIgPyBcIm5ld1wiIDogdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbi5zZXRBdHRyaWJ1dGVOUyh4bGluaywgYXR0LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImN1cnNvclwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5zdHlsZS5jdXJzb3IgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwidHJhbnNmb3JtXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBvLnRyYW5zZm9ybSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImFycm93LXN0YXJ0XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRBcnJvdyhvLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImFycm93LWVuZFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkQXJyb3cobywgdmFsdWUsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJjbGlwLXJlY3RcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZWN0ID0gU3RyKHZhbHVlKS5zcGxpdChzZXBhcmF0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlY3QubGVuZ3RoID09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmNsaXAgJiYgby5jbGlwLnBhcmVudE5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChvLmNsaXAucGFyZW50Tm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVsID0gJChcImNsaXBQYXRoXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByYyA9ICQoXCJyZWN0XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsLmlkID0gUi5jcmVhdGVVVUlEKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChyYywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiByZWN0WzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiByZWN0WzFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogcmVjdFsyXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiByZWN0WzNdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwuYXBwZW5kQ2hpbGQocmMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ucGFwZXIuZGVmcy5hcHBlbmRDaGlsZChlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChub2RlLCB7XCJjbGlwLXBhdGhcIjogXCJ1cmwoI1wiICsgZWwuaWQgKyBcIilcIn0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8uY2xpcCA9IHJjO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXRoID0gbm9kZS5nZXRBdHRyaWJ1dGUoXCJjbGlwLXBhdGhcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNsaXAgPSBSLl9nLmRvYy5nZXRFbGVtZW50QnlJZChwYXRoLnJlcGxhY2UoLyhedXJsXFwoI3xcXCkkKS9nLCBFKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaXAgJiYgY2xpcC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNsaXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKG5vZGUsIHtcImNsaXAtcGF0aFwiOiBFfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBvLmNsaXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInBhdGhcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvLnR5cGUgPT0gXCJwYXRoXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKG5vZGUsIHtkOiB2YWx1ZSA/IGF0dHJzLnBhdGggPSBSLl9wYXRoVG9BYnNvbHV0ZSh2YWx1ZSkgOiBcIk0wLDBcIn0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8uXy5kaXJ0eSA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG8uXy5hcnJvd3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdGFydFN0cmluZ1wiIGluIG8uXy5hcnJvd3MgJiYgYWRkQXJyb3cobywgby5fLmFycm93cy5zdGFydFN0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZW5kU3RyaW5nXCIgaW4gby5fLmFycm93cyAmJiBhZGRBcnJvdyhvLCBvLl8uYXJyb3dzLmVuZFN0cmluZywgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ3aWR0aFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoYXR0LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvLl8uZGlydHkgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmZ4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0ID0gXCJ4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBhdHRycy54O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInhcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy5meCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gLWF0dHJzLnggLSAoYXR0cnMud2lkdGggfHwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJyeFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dCA9PSBcInJ4XCIgJiYgby50eXBlID09IFwicmVjdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJjeFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoYXR0LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvLnBhdHRlcm4gJiYgdXBkYXRlUG9zaXRpb24obyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvLl8uZGlydHkgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJoZWlnaHRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKGF0dCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgby5fLmRpcnR5ID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy5meSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dCA9IFwieVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gYXR0cnMueTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ5XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMuZnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IC1hdHRycy55IC0gKGF0dHJzLmhlaWdodCB8fCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInJ5XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0ID09IFwicnlcIiAmJiBvLnR5cGUgPT0gXCJyZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImN5XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShhdHQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG8ucGF0dGVybiAmJiB1cGRhdGVQb3NpdGlvbihvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG8uXy5kaXJ0eSA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInJcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvLnR5cGUgPT0gXCJyZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKG5vZGUsIHtyeDogdmFsdWUsIHJ5OiB2YWx1ZX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShhdHQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG8uXy5kaXJ0eSA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInNyY1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG8udHlwZSA9PSBcImltYWdlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLnNldEF0dHJpYnV0ZU5TKHhsaW5rLCBcImhyZWZcIiwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzdHJva2Utd2lkdGhcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvLl8uc3ggIT0gMSB8fCBvLl8uc3kgIT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlIC89IG1tYXgoYWJzKG8uXy5zeCksIGFicyhvLl8uc3kpKSB8fCAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG8ucGFwZXIuX3ZiU2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlICo9IG8ucGFwZXIuX3ZiU2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKGF0dCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzW1wic3Ryb2tlLWRhc2hhcnJheVwiXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZERhc2hlcyhvLCBhdHRyc1tcInN0cm9rZS1kYXNoYXJyYXlcIl0sIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoby5fLmFycm93cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RhcnRTdHJpbmdcIiBpbiBvLl8uYXJyb3dzICYmIGFkZEFycm93KG8sIG8uXy5hcnJvd3Muc3RhcnRTdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZW5kU3RyaW5nXCIgaW4gby5fLmFycm93cyAmJiBhZGRBcnJvdyhvLCBvLl8uYXJyb3dzLmVuZFN0cmluZywgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInN0cm9rZS1kYXNoYXJyYXlcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZERhc2hlcyhvLCB2YWx1ZSwgcGFyYW1zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZmlsbFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlzVVJMID0gU3RyKHZhbHVlKS5tYXRjaChSLl9JU1VSTCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNVUkwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbCA9ICQoXCJwYXR0ZXJuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpZyA9ICQoXCJpbWFnZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5pZCA9IFIuY3JlYXRlVVVJRCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoZWwsIHt4OiAwLCB5OiAwLCBwYXR0ZXJuVW5pdHM6IFwidXNlclNwYWNlT25Vc2VcIiwgaGVpZ2h0OiAxLCB3aWR0aDogMX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoaWcsIHt4OiAwLCB5OiAwLCBcInhsaW5rOmhyZWZcIjogaXNVUkxbMV19KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5hcHBlbmRDaGlsZChpZyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFIuX3ByZWxvYWQoaXNVUkxbMV0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3ID0gdGhpcy5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoID0gdGhpcy5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGVsLCB7d2lkdGg6IHcsIGhlaWdodDogaH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChpZywge3dpZHRoOiB3LCBoZWlnaHQ6IGh9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ucGFwZXIuc2FmYXJpKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLnBhcGVyLmRlZnMuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQobm9kZSwge2ZpbGw6IFwidXJsKCNcIiArIGVsLmlkICsgXCIpXCJ9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLnBhdHRlcm4gPSBlbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLnBhdHRlcm4gJiYgdXBkYXRlUG9zaXRpb24obyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2xyID0gUi5nZXRSR0IodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjbHIuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgcGFyYW1zLmdyYWRpZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRycy5ncmFkaWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAhUi5pcyhhdHRycy5vcGFjaXR5LCBcInVuZGVmaW5lZFwiKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSLmlzKHBhcmFtcy5vcGFjaXR5LCBcInVuZGVmaW5lZFwiKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKG5vZGUsIHtvcGFjaXR5OiBhdHRycy5vcGFjaXR5fSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIVIuaXMoYXR0cnNbXCJmaWxsLW9wYWNpdHlcIl0sIFwidW5kZWZpbmVkXCIpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFIuaXMocGFyYW1zW1wiZmlsbC1vcGFjaXR5XCJdLCBcInVuZGVmaW5lZFwiKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKG5vZGUsIHtcImZpbGwtb3BhY2l0eVwiOiBhdHRyc1tcImZpbGwtb3BhY2l0eVwiXX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICgoby50eXBlID09IFwiY2lyY2xlXCIgfHwgby50eXBlID09IFwiZWxsaXBzZVwiIHx8IFN0cih2YWx1ZSkuY2hhckF0KCkgIT0gXCJyXCIpICYmIGFkZEdyYWRpZW50RmlsbChvLCB2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXCJvcGFjaXR5XCIgaW4gYXR0cnMgfHwgXCJmaWxsLW9wYWNpdHlcIiBpbiBhdHRycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZ3JhZGllbnQgPSBSLl9nLmRvYy5nZXRFbGVtZW50QnlJZChub2RlLmdldEF0dHJpYnV0ZShcImZpbGxcIikucmVwbGFjZSgvXnVybFxcKCN8XFwpJC9nLCBFKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncmFkaWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3BzID0gZ3JhZGllbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzdG9wXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChzdG9wc1tzdG9wcy5sZW5ndGggLSAxXSwge1wic3RvcC1vcGFjaXR5XCI6IChcIm9wYWNpdHlcIiBpbiBhdHRycyA/IGF0dHJzLm9wYWNpdHkgOiAxKSAqIChcImZpbGwtb3BhY2l0eVwiIGluIGF0dHJzID8gYXR0cnNbXCJmaWxsLW9wYWNpdHlcIl0gOiAxKX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzLmdyYWRpZW50ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnMuZmlsbCA9IFwibm9uZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xyW2hhc10oXCJvcGFjaXR5XCIpICYmICQobm9kZSwge1wiZmlsbC1vcGFjaXR5XCI6IGNsci5vcGFjaXR5ID4gMSA/IGNsci5vcGFjaXR5IC8gMTAwIDogY2xyLm9wYWNpdHl9KTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInN0cm9rZVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xyID0gUi5nZXRSR0IodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoYXR0LCBjbHIuaGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dCA9PSBcInN0cm9rZVwiICYmIGNscltoYXNdKFwib3BhY2l0eVwiKSAmJiAkKG5vZGUsIHtcInN0cm9rZS1vcGFjaXR5XCI6IGNsci5vcGFjaXR5ID4gMSA/IGNsci5vcGFjaXR5IC8gMTAwIDogY2xyLm9wYWNpdHl9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHQgPT0gXCJzdHJva2VcIiAmJiBvLl8uYXJyb3dzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdGFydFN0cmluZ1wiIGluIG8uXy5hcnJvd3MgJiYgYWRkQXJyb3cobywgby5fLmFycm93cy5zdGFydFN0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJlbmRTdHJpbmdcIiBpbiBvLl8uYXJyb3dzICYmIGFkZEFycm93KG8sIG8uXy5hcnJvd3MuZW5kU3RyaW5nLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZ3JhZGllbnRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIChvLnR5cGUgPT0gXCJjaXJjbGVcIiB8fCBvLnR5cGUgPT0gXCJlbGxpcHNlXCIgfHwgU3RyKHZhbHVlKS5jaGFyQXQoKSAhPSBcInJcIikgJiYgYWRkR3JhZGllbnRGaWxsKG8sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwib3BhY2l0eVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmdyYWRpZW50ICYmICFhdHRyc1toYXNdKFwic3Ryb2tlLW9wYWNpdHlcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKG5vZGUsIHtcInN0cm9rZS1vcGFjaXR5XCI6IHZhbHVlID4gMSA/IHZhbHVlIC8gMTAwIDogdmFsdWV9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZhbGxcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImZpbGwtb3BhY2l0eVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmdyYWRpZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQgPSBSLl9nLmRvYy5nZXRFbGVtZW50QnlJZChub2RlLmdldEF0dHJpYnV0ZShcImZpbGxcIikucmVwbGFjZSgvXnVybFxcKCN8XFwpJC9nLCBFKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyYWRpZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3BzID0gZ3JhZGllbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzdG9wXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHN0b3BzW3N0b3BzLmxlbmd0aCAtIDFdLCB7XCJzdG9wLW9wYWNpdHlcIjogdmFsdWV9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBhdHQgPT0gXCJmb250LXNpemVcIiAmJiAodmFsdWUgPSB0b0ludCh2YWx1ZSwgMTApICsgXCJweFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjc3NydWxlID0gYXR0LnJlcGxhY2UoLyhcXC0uKS9nLCBmdW5jdGlvbiAodykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB3LnN1YnN0cmluZygxKS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnN0eWxlW2Nzc3J1bGVdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBvLl8uZGlydHkgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoYXR0LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0dW5lVGV4dChvLCBwYXJhbXMpO1xuICAgICAgICBub2RlLnN0eWxlLnZpc2liaWxpdHkgPSB2aXM7XG4gICAgfSxcbiAgICBsZWFkaW5nID0gMS4yLFxuICAgIHR1bmVUZXh0ID0gZnVuY3Rpb24gKGVsLCBwYXJhbXMpIHtcbiAgICAgICAgaWYgKGVsLnR5cGUgIT0gXCJ0ZXh0XCIgfHwgIShwYXJhbXNbaGFzXShcInRleHRcIikgfHwgcGFyYW1zW2hhc10oXCJmb250XCIpIHx8IHBhcmFtc1toYXNdKFwiZm9udC1zaXplXCIpIHx8IHBhcmFtc1toYXNdKFwieFwiKSB8fCBwYXJhbXNbaGFzXShcInlcIikpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGEgPSBlbC5hdHRycyxcbiAgICAgICAgICAgIG5vZGUgPSBlbC5ub2RlLFxuICAgICAgICAgICAgZm9udFNpemUgPSBub2RlLmZpcnN0Q2hpbGQgPyB0b0ludChSLl9nLmRvYy5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKG5vZGUuZmlyc3RDaGlsZCwgRSkuZ2V0UHJvcGVydHlWYWx1ZShcImZvbnQtc2l6ZVwiKSwgMTApIDogMTA7XG5cbiAgICAgICAgaWYgKHBhcmFtc1toYXNdKFwidGV4dFwiKSkge1xuICAgICAgICAgICAgYS50ZXh0ID0gcGFyYW1zLnRleHQ7XG4gICAgICAgICAgICB3aGlsZSAobm9kZS5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5yZW1vdmVDaGlsZChub2RlLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHRleHRzID0gU3RyKHBhcmFtcy50ZXh0KS5zcGxpdChcIlxcblwiKSxcbiAgICAgICAgICAgICAgICB0c3BhbnMgPSBbXSxcbiAgICAgICAgICAgICAgICB0c3BhbjtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IHRleHRzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0c3BhbiA9ICQoXCJ0c3BhblwiKTtcbiAgICAgICAgICAgICAgICBpICYmICQodHNwYW4sIHtkeTogZm9udFNpemUgKiBsZWFkaW5nLCB4OiBhLnh9KTtcbiAgICAgICAgICAgICAgICB0c3Bhbi5hcHBlbmRDaGlsZChSLl9nLmRvYy5jcmVhdGVUZXh0Tm9kZSh0ZXh0c1tpXSkpO1xuICAgICAgICAgICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQodHNwYW4pO1xuICAgICAgICAgICAgICAgIHRzcGFuc1tpXSA9IHRzcGFuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHNwYW5zID0gbm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInRzcGFuXCIpO1xuICAgICAgICAgICAgZm9yIChpID0gMCwgaWkgPSB0c3BhbnMubGVuZ3RoOyBpIDwgaWk7IGkrKykgaWYgKGkpIHtcbiAgICAgICAgICAgICAgICAkKHRzcGFuc1tpXSwge2R5OiBmb250U2l6ZSAqIGxlYWRpbmcsIHg6IGEueH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKHRzcGFuc1swXSwge2R5OiAwfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgJChub2RlLCB7eDogYS54LCB5OiBhLnl9KTtcbiAgICAgICAgZWwuXy5kaXJ0eSA9IDE7XG4gICAgICAgIHZhciBiYiA9IGVsLl9nZXRCQm94KCksXG4gICAgICAgICAgICBkaWYgPSBhLnkgLSAoYmIueSArIGJiLmhlaWdodCAvIDIpO1xuICAgICAgICBkaWYgJiYgUi5pcyhkaWYsIFwiZmluaXRlXCIpICYmICQodHNwYW5zWzBdLCB7ZHk6IGRpZn0pO1xuICAgIH0sXG4gICAgRWxlbWVudCA9IGZ1bmN0aW9uIChub2RlLCBzdmcpIHtcbiAgICAgICAgdmFyIFggPSAwLFxuICAgICAgICAgICAgWSA9IDA7XG4gICAgICAgIC8qXFxcbiAgICAgICAgICogRWxlbWVudC5ub2RlXG4gICAgICAgICBbIHByb3BlcnR5IChvYmplY3QpIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIEdpdmVzIHlvdSBhIHJlZmVyZW5jZSB0byB0aGUgRE9NIG9iamVjdCwgc28geW91IGNhbiBhc3NpZ24gZXZlbnQgaGFuZGxlcnMgb3IganVzdCBtZXNzIGFyb3VuZC5cbiAgICAgICAgICoqXG4gICAgICAgICAqIE5vdGU6IERvbuKAmXQgbWVzcyB3aXRoIGl0LlxuICAgICAgICAgPiBVc2FnZVxuICAgICAgICAgfCAvLyBkcmF3IGEgY2lyY2xlIGF0IGNvb3JkaW5hdGUgMTAsMTAgd2l0aCByYWRpdXMgb2YgMTBcbiAgICAgICAgIHwgdmFyIGMgPSBwYXBlci5jaXJjbGUoMTAsIDEwLCAxMCk7XG4gICAgICAgICB8IGMubm9kZS5vbmNsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgfCAgICAgYy5hdHRyKFwiZmlsbFwiLCBcInJlZFwiKTtcbiAgICAgICAgIHwgfTtcbiAgICAgICAgXFwqL1xuICAgICAgICB0aGlzWzBdID0gdGhpcy5ub2RlID0gbm9kZTtcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBFbGVtZW50LnJhcGhhZWxcbiAgICAgICAgIFsgcHJvcGVydHkgKG9iamVjdCkgXVxuICAgICAgICAgKipcbiAgICAgICAgICogSW50ZXJuYWwgcmVmZXJlbmNlIHRvIEBSYXBoYWVsIG9iamVjdC4gSW4gY2FzZSBpdCBpcyBub3QgYXZhaWxhYmxlLlxuICAgICAgICAgPiBVc2FnZVxuICAgICAgICAgfCBSYXBoYWVsLmVsLnJlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIHwgICAgIHZhciBoc2IgPSB0aGlzLnBhcGVyLnJhcGhhZWwucmdiMmhzYih0aGlzLmF0dHIoXCJmaWxsXCIpKTtcbiAgICAgICAgIHwgICAgIGhzYi5oID0gMTtcbiAgICAgICAgIHwgICAgIHRoaXMuYXR0cih7ZmlsbDogdGhpcy5wYXBlci5yYXBoYWVsLmhzYjJyZ2IoaHNiKS5oZXh9KTtcbiAgICAgICAgIHwgfVxuICAgICAgICBcXCovXG4gICAgICAgIG5vZGUucmFwaGFlbCA9IHRydWU7XG4gICAgICAgIC8qXFxcbiAgICAgICAgICogRWxlbWVudC5pZFxuICAgICAgICAgWyBwcm9wZXJ0eSAobnVtYmVyKSBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBVbmlxdWUgaWQgb2YgdGhlIGVsZW1lbnQuIEVzcGVjaWFsbHkgdXNlc2Z1bCB3aGVuIHlvdSB3YW50IHRvIGxpc3RlbiB0byBldmVudHMgb2YgdGhlIGVsZW1lbnQsIFxuICAgICAgICAgKiBiZWNhdXNlIGFsbCBldmVudHMgYXJlIGZpcmVkIGluIGZvcm1hdCBgPG1vZHVsZT4uPGFjdGlvbj4uPGlkPmAuIEFsc28gdXNlZnVsIGZvciBAUGFwZXIuZ2V0QnlJZCBtZXRob2QuXG4gICAgICAgIFxcKi9cbiAgICAgICAgdGhpcy5pZCA9IFIuX29pZCsrO1xuICAgICAgICBub2RlLnJhcGhhZWxpZCA9IHRoaXMuaWQ7XG4gICAgICAgIHRoaXMubWF0cml4ID0gUi5tYXRyaXgoKTtcbiAgICAgICAgdGhpcy5yZWFsUGF0aCA9IG51bGw7XG4gICAgICAgIC8qXFxcbiAgICAgICAgICogRWxlbWVudC5wYXBlclxuICAgICAgICAgWyBwcm9wZXJ0eSAob2JqZWN0KSBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBJbnRlcm5hbCByZWZlcmVuY2UgdG8g4oCccGFwZXLigJ0gd2hlcmUgb2JqZWN0IGRyYXduLiBNYWlubHkgZm9yIHVzZSBpbiBwbHVnaW5zIGFuZCBlbGVtZW50IGV4dGVuc2lvbnMuXG4gICAgICAgICA+IFVzYWdlXG4gICAgICAgICB8IFJhcGhhZWwuZWwuY3Jvc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICB8ICAgICB0aGlzLmF0dHIoe2ZpbGw6IFwicmVkXCJ9KTtcbiAgICAgICAgIHwgICAgIHRoaXMucGFwZXIucGF0aChcIk0xMCwxMEw1MCw1ME01MCwxMEwxMCw1MFwiKVxuICAgICAgICAgfCAgICAgICAgIC5hdHRyKHtzdHJva2U6IFwicmVkXCJ9KTtcbiAgICAgICAgIHwgfVxuICAgICAgICBcXCovXG4gICAgICAgIHRoaXMucGFwZXIgPSBzdmc7XG4gICAgICAgIHRoaXMuYXR0cnMgPSB0aGlzLmF0dHJzIHx8IHt9O1xuICAgICAgICB0aGlzLl8gPSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IFtdLFxuICAgICAgICAgICAgc3g6IDEsXG4gICAgICAgICAgICBzeTogMSxcbiAgICAgICAgICAgIGRlZzogMCxcbiAgICAgICAgICAgIGR4OiAwLFxuICAgICAgICAgICAgZHk6IDAsXG4gICAgICAgICAgICBkaXJ0eTogMVxuICAgICAgICB9O1xuICAgICAgICAhc3ZnLmJvdHRvbSAmJiAoc3ZnLmJvdHRvbSA9IHRoaXMpO1xuICAgICAgICAvKlxcXG4gICAgICAgICAqIEVsZW1lbnQucHJldlxuICAgICAgICAgWyBwcm9wZXJ0eSAob2JqZWN0KSBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBSZWZlcmVuY2UgdG8gdGhlIHByZXZpb3VzIGVsZW1lbnQgaW4gdGhlIGhpZXJhcmNoeS5cbiAgICAgICAgXFwqL1xuICAgICAgICB0aGlzLnByZXYgPSBzdmcudG9wO1xuICAgICAgICBzdmcudG9wICYmIChzdmcudG9wLm5leHQgPSB0aGlzKTtcbiAgICAgICAgc3ZnLnRvcCA9IHRoaXM7XG4gICAgICAgIC8qXFxcbiAgICAgICAgICogRWxlbWVudC5uZXh0XG4gICAgICAgICBbIHByb3BlcnR5IChvYmplY3QpIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIFJlZmVyZW5jZSB0byB0aGUgbmV4dCBlbGVtZW50IGluIHRoZSBoaWVyYXJjaHkuXG4gICAgICAgIFxcKi9cbiAgICAgICAgdGhpcy5uZXh0ID0gbnVsbDtcbiAgICB9LFxuICAgIGVscHJvdG8gPSBSLmVsO1xuXG4gICAgRWxlbWVudC5wcm90b3R5cGUgPSBlbHByb3RvO1xuICAgIGVscHJvdG8uY29uc3RydWN0b3IgPSBFbGVtZW50O1xuXG4gICAgUi5fZW5naW5lLnBhdGggPSBmdW5jdGlvbiAocGF0aFN0cmluZywgU1ZHKSB7XG4gICAgICAgIHZhciBlbCA9ICQoXCJwYXRoXCIpO1xuICAgICAgICBTVkcuY2FudmFzICYmIFNWRy5jYW52YXMuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICB2YXIgcCA9IG5ldyBFbGVtZW50KGVsLCBTVkcpO1xuICAgICAgICBwLnR5cGUgPSBcInBhdGhcIjtcbiAgICAgICAgc2V0RmlsbEFuZFN0cm9rZShwLCB7XG4gICAgICAgICAgICBmaWxsOiBcIm5vbmVcIixcbiAgICAgICAgICAgIHN0cm9rZTogXCIjMDAwXCIsXG4gICAgICAgICAgICBwYXRoOiBwYXRoU3RyaW5nXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnJvdGF0ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogRGVwcmVjYXRlZCEgVXNlIEBFbGVtZW50LnRyYW5zZm9ybSBpbnN0ZWFkLlxuICAgICAqIEFkZHMgcm90YXRpb24gYnkgZ2l2ZW4gYW5nbGUgYXJvdW5kIGdpdmVuIHBvaW50IHRvIHRoZSBsaXN0IG9mXG4gICAgICogdHJhbnNmb3JtYXRpb25zIG9mIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBkZWcgKG51bWJlcikgYW5nbGUgaW4gZGVncmVlc1xuICAgICAtIGN4IChudW1iZXIpICNvcHRpb25hbCB4IGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRyZSBvZiByb3RhdGlvblxuICAgICAtIGN5IChudW1iZXIpICNvcHRpb25hbCB5IGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRyZSBvZiByb3RhdGlvblxuICAgICAqIElmIGN4ICYgY3kgYXJlbuKAmXQgc3BlY2lmaWVkIGNlbnRyZSBvZiB0aGUgc2hhcGUgaXMgdXNlZCBhcyBhIHBvaW50IG9mIHJvdGF0aW9uLlxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8ucm90YXRlID0gZnVuY3Rpb24gKGRlZywgY3gsIGN5KSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGRlZyA9IFN0cihkZWcpLnNwbGl0KHNlcGFyYXRvcik7XG4gICAgICAgIGlmIChkZWcubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgY3ggPSB0b0Zsb2F0KGRlZ1sxXSk7XG4gICAgICAgICAgICBjeSA9IHRvRmxvYXQoZGVnWzJdKTtcbiAgICAgICAgfVxuICAgICAgICBkZWcgPSB0b0Zsb2F0KGRlZ1swXSk7XG4gICAgICAgIChjeSA9PSBudWxsKSAmJiAoY3ggPSBjeSk7XG4gICAgICAgIGlmIChjeCA9PSBudWxsIHx8IGN5ID09IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBiYm94ID0gdGhpcy5nZXRCQm94KDEpO1xuICAgICAgICAgICAgY3ggPSBiYm94LnggKyBiYm94LndpZHRoIC8gMjtcbiAgICAgICAgICAgIGN5ID0gYmJveC55ICsgYmJveC5oZWlnaHQgLyAyO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudHJhbnNmb3JtKHRoaXMuXy50cmFuc2Zvcm0uY29uY2F0KFtbXCJyXCIsIGRlZywgY3gsIGN5XV0pKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5zY2FsZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogRGVwcmVjYXRlZCEgVXNlIEBFbGVtZW50LnRyYW5zZm9ybSBpbnN0ZWFkLlxuICAgICAqIEFkZHMgc2NhbGUgYnkgZ2l2ZW4gYW1vdW50IHJlbGF0aXZlIHRvIGdpdmVuIHBvaW50IHRvIHRoZSBsaXN0IG9mXG4gICAgICogdHJhbnNmb3JtYXRpb25zIG9mIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBzeCAobnVtYmVyKSBob3Jpc29udGFsIHNjYWxlIGFtb3VudFxuICAgICAtIHN5IChudW1iZXIpIHZlcnRpY2FsIHNjYWxlIGFtb3VudFxuICAgICAtIGN4IChudW1iZXIpICNvcHRpb25hbCB4IGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRyZSBvZiBzY2FsZVxuICAgICAtIGN5IChudW1iZXIpICNvcHRpb25hbCB5IGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRyZSBvZiBzY2FsZVxuICAgICAqIElmIGN4ICYgY3kgYXJlbuKAmXQgc3BlY2lmaWVkIGNlbnRyZSBvZiB0aGUgc2hhcGUgaXMgdXNlZCBpbnN0ZWFkLlxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8uc2NhbGUgPSBmdW5jdGlvbiAoc3gsIHN5LCBjeCwgY3kpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgc3ggPSBTdHIoc3gpLnNwbGl0KHNlcGFyYXRvcik7XG4gICAgICAgIGlmIChzeC5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBzeSA9IHRvRmxvYXQoc3hbMV0pO1xuICAgICAgICAgICAgY3ggPSB0b0Zsb2F0KHN4WzJdKTtcbiAgICAgICAgICAgIGN5ID0gdG9GbG9hdChzeFszXSk7XG4gICAgICAgIH1cbiAgICAgICAgc3ggPSB0b0Zsb2F0KHN4WzBdKTtcbiAgICAgICAgKHN5ID09IG51bGwpICYmIChzeSA9IHN4KTtcbiAgICAgICAgKGN5ID09IG51bGwpICYmIChjeCA9IGN5KTtcbiAgICAgICAgaWYgKGN4ID09IG51bGwgfHwgY3kgPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGJib3ggPSB0aGlzLmdldEJCb3goMSk7XG4gICAgICAgIH1cbiAgICAgICAgY3ggPSBjeCA9PSBudWxsID8gYmJveC54ICsgYmJveC53aWR0aCAvIDIgOiBjeDtcbiAgICAgICAgY3kgPSBjeSA9PSBudWxsID8gYmJveC55ICsgYmJveC5oZWlnaHQgLyAyIDogY3k7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtKHRoaXMuXy50cmFuc2Zvcm0uY29uY2F0KFtbXCJzXCIsIHN4LCBzeSwgY3gsIGN5XV0pKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC50cmFuc2xhdGVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIERlcHJlY2F0ZWQhIFVzZSBARWxlbWVudC50cmFuc2Zvcm0gaW5zdGVhZC5cbiAgICAgKiBBZGRzIHRyYW5zbGF0aW9uIGJ5IGdpdmVuIGFtb3VudCB0byB0aGUgbGlzdCBvZiB0cmFuc2Zvcm1hdGlvbnMgb2YgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGR4IChudW1iZXIpIGhvcmlzb250YWwgc2hpZnRcbiAgICAgLSBkeSAobnVtYmVyKSB2ZXJ0aWNhbCBzaGlmdFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8udHJhbnNsYXRlID0gZnVuY3Rpb24gKGR4LCBkeSkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBkeCA9IFN0cihkeCkuc3BsaXQoc2VwYXJhdG9yKTtcbiAgICAgICAgaWYgKGR4Lmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGR5ID0gdG9GbG9hdChkeFsxXSk7XG4gICAgICAgIH1cbiAgICAgICAgZHggPSB0b0Zsb2F0KGR4WzBdKSB8fCAwO1xuICAgICAgICBkeSA9ICtkeSB8fCAwO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybSh0aGlzLl8udHJhbnNmb3JtLmNvbmNhdChbW1widFwiLCBkeCwgZHldXSkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnRyYW5zZm9ybVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyB0cmFuc2Zvcm1hdGlvbiB0byB0aGUgZWxlbWVudCB3aGljaCBpcyBzZXBhcmF0ZSB0byBvdGhlciBhdHRyaWJ1dGVzLFxuICAgICAqIGkuZS4gdHJhbnNsYXRpb24gZG9lc27igJl0IGNoYW5nZSBgeGAgb3IgYHlgIG9mIHRoZSByZWN0YW5nZS4gVGhlIGZvcm1hdFxuICAgICAqIG9mIHRyYW5zZm9ybWF0aW9uIHN0cmluZyBpcyBzaW1pbGFyIHRvIHRoZSBwYXRoIHN0cmluZyBzeW50YXg6XG4gICAgIHwgXCJ0MTAwLDEwMHIzMCwxMDAsMTAwczIsMiwxMDAsMTAwcjQ1czEuNVwiXG4gICAgICogRWFjaCBsZXR0ZXIgaXMgYSBjb21tYW5kLiBUaGVyZSBhcmUgZm91ciBjb21tYW5kczogYHRgIGlzIGZvciB0cmFuc2xhdGUsIGByYCBpcyBmb3Igcm90YXRlLCBgc2AgaXMgZm9yXG4gICAgICogc2NhbGUgYW5kIGBtYCBpcyBmb3IgbWF0cml4LlxuICAgICAqXG4gICAgICogVGhlcmUgYXJlIGFsc28gYWx0ZXJuYXRpdmUg4oCcYWJzb2x1dGXigJ0gdHJhbnNsYXRpb24sIHJvdGF0aW9uIGFuZCBzY2FsZTogYFRgLCBgUmAgYW5kIGBTYC4gVGhleSB3aWxsIG5vdCB0YWtlIHByZXZpb3VzIHRyYW5zZm9ybWF0aW9uIGludG8gYWNjb3VudC4gRm9yIGV4YW1wbGUsIGAuLi5UMTAwLDBgIHdpbGwgYWx3YXlzIG1vdmUgZWxlbWVudCAxMDAgcHggaG9yaXNvbnRhbGx5LCB3aGlsZSBgLi4udDEwMCwwYCBjb3VsZCBtb3ZlIGl0IHZlcnRpY2FsbHkgaWYgdGhlcmUgaXMgYHI5MGAgYmVmb3JlLiBKdXN0IGNvbXBhcmUgcmVzdWx0cyBvZiBgcjkwdDEwMCwwYCBhbmQgYHI5MFQxMDAsMGAuXG4gICAgICpcbiAgICAgKiBTbywgdGhlIGV4YW1wbGUgbGluZSBhYm92ZSBjb3VsZCBiZSByZWFkIGxpa2Ug4oCcdHJhbnNsYXRlIGJ5IDEwMCwgMTAwOyByb3RhdGUgMzDCsCBhcm91bmQgMTAwLCAxMDA7IHNjYWxlIHR3aWNlIGFyb3VuZCAxMDAsIDEwMDtcbiAgICAgKiByb3RhdGUgNDXCsCBhcm91bmQgY2VudHJlOyBzY2FsZSAxLjUgdGltZXMgcmVsYXRpdmUgdG8gY2VudHJl4oCdLiBBcyB5b3UgY2FuIHNlZSByb3RhdGUgYW5kIHNjYWxlIGNvbW1hbmRzIGhhdmUgb3JpZ2luXG4gICAgICogY29vcmRpbmF0ZXMgYXMgb3B0aW9uYWwgcGFyYW1ldGVycywgdGhlIGRlZmF1bHQgaXMgdGhlIGNlbnRyZSBwb2ludCBvZiB0aGUgZWxlbWVudC5cbiAgICAgKiBNYXRyaXggYWNjZXB0cyBzaXggcGFyYW1ldGVycy5cbiAgICAgPiBVc2FnZVxuICAgICB8IHZhciBlbCA9IHBhcGVyLnJlY3QoMTAsIDIwLCAzMDAsIDIwMCk7XG4gICAgIHwgLy8gdHJhbnNsYXRlIDEwMCwgMTAwLCByb3RhdGUgNDXCsCwgdHJhbnNsYXRlIC0xMDAsIDBcbiAgICAgfCBlbC50cmFuc2Zvcm0oXCJ0MTAwLDEwMHI0NXQtMTAwLDBcIik7XG4gICAgIHwgLy8gaWYgeW91IHdhbnQgeW91IGNhbiBhcHBlbmQgb3IgcHJlcGVuZCB0cmFuc2Zvcm1hdGlvbnNcbiAgICAgfCBlbC50cmFuc2Zvcm0oXCIuLi50NTAsNTBcIik7XG4gICAgIHwgZWwudHJhbnNmb3JtKFwiczIuLi5cIik7XG4gICAgIHwgLy8gb3IgZXZlbiB3cmFwXG4gICAgIHwgZWwudHJhbnNmb3JtKFwidDUwLDUwLi4udC01MC01MFwiKTtcbiAgICAgfCAvLyB0byByZXNldCB0cmFuc2Zvcm1hdGlvbiBjYWxsIG1ldGhvZCB3aXRoIGVtcHR5IHN0cmluZ1xuICAgICB8IGVsLnRyYW5zZm9ybShcIlwiKTtcbiAgICAgfCAvLyB0byBnZXQgY3VycmVudCB2YWx1ZSBjYWxsIGl0IHdpdGhvdXQgcGFyYW1ldGVyc1xuICAgICB8IGNvbnNvbGUubG9nKGVsLnRyYW5zZm9ybSgpKTtcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gdHN0ciAoc3RyaW5nKSAjb3B0aW9uYWwgdHJhbnNmb3JtYXRpb24gc3RyaW5nXG4gICAgICogSWYgdHN0ciBpc27igJl0IHNwZWNpZmllZFxuICAgICA9IChzdHJpbmcpIGN1cnJlbnQgdHJhbnNmb3JtYXRpb24gc3RyaW5nXG4gICAgICogZWxzZVxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8udHJhbnNmb3JtID0gZnVuY3Rpb24gKHRzdHIpIHtcbiAgICAgICAgdmFyIF8gPSB0aGlzLl87XG4gICAgICAgIGlmICh0c3RyID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBfLnRyYW5zZm9ybTtcbiAgICAgICAgfVxuICAgICAgICBSLl9leHRyYWN0VHJhbnNmb3JtKHRoaXMsIHRzdHIpO1xuXG4gICAgICAgIHRoaXMuY2xpcCAmJiAkKHRoaXMuY2xpcCwge3RyYW5zZm9ybTogdGhpcy5tYXRyaXguaW52ZXJ0KCl9KTtcbiAgICAgICAgdGhpcy5wYXR0ZXJuICYmIHVwZGF0ZVBvc2l0aW9uKHRoaXMpO1xuICAgICAgICB0aGlzLm5vZGUgJiYgJCh0aGlzLm5vZGUsIHt0cmFuc2Zvcm06IHRoaXMubWF0cml4fSk7XG4gICAgXG4gICAgICAgIGlmIChfLnN4ICE9IDEgfHwgXy5zeSAhPSAxKSB7XG4gICAgICAgICAgICB2YXIgc3cgPSB0aGlzLmF0dHJzW2hhc10oXCJzdHJva2Utd2lkdGhcIikgPyB0aGlzLmF0dHJzW1wic3Ryb2tlLXdpZHRoXCJdIDogMTtcbiAgICAgICAgICAgIHRoaXMuYXR0cih7XCJzdHJva2Utd2lkdGhcIjogc3d9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuaGlkZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogTWFrZXMgZWxlbWVudCBpbnZpc2libGUuIFNlZSBARWxlbWVudC5zaG93LlxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8uaGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIXRoaXMucmVtb3ZlZCAmJiB0aGlzLnBhcGVyLnNhZmFyaSh0aGlzLm5vZGUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5zaG93XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBNYWtlcyBlbGVtZW50IHZpc2libGUuIFNlZSBARWxlbWVudC5oaWRlLlxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8uc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIXRoaXMucmVtb3ZlZCAmJiB0aGlzLnBhcGVyLnNhZmFyaSh0aGlzLm5vZGUuc3R5bGUuZGlzcGxheSA9IFwiXCIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnJlbW92ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBlbGVtZW50IGZyb20gdGhlIHBhcGVyLlxuICAgIFxcKi9cbiAgICBlbHByb3RvLnJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCB8fCAhdGhpcy5ub2RlLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcGFwZXIgPSB0aGlzLnBhcGVyO1xuICAgICAgICBwYXBlci5fX3NldF9fICYmIHBhcGVyLl9fc2V0X18uZXhjbHVkZSh0aGlzKTtcbiAgICAgICAgZXZlLnVuYmluZChcInJhcGhhZWwuKi4qLlwiICsgdGhpcy5pZCk7XG4gICAgICAgIGlmICh0aGlzLmdyYWRpZW50KSB7XG4gICAgICAgICAgICBwYXBlci5kZWZzLnJlbW92ZUNoaWxkKHRoaXMuZ3JhZGllbnQpO1xuICAgICAgICB9XG4gICAgICAgIFIuX3RlYXIodGhpcywgcGFwZXIpO1xuICAgICAgICBpZiAodGhpcy5ub2RlLnBhcmVudE5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09IFwiYVwiKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMubm9kZS5wYXJlbnROb2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMubm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaSBpbiB0aGlzKSB7XG4gICAgICAgICAgICB0aGlzW2ldID0gdHlwZW9mIHRoaXNbaV0gPT0gXCJmdW5jdGlvblwiID8gUi5fcmVtb3ZlZEZhY3RvcnkoaSkgOiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlZCA9IHRydWU7XG4gICAgfTtcbiAgICBlbHByb3RvLl9nZXRCQm94ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5ub2RlLnN0eWxlLmRpc3BsYXkgPT0gXCJub25lXCIpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvdygpO1xuICAgICAgICAgICAgdmFyIGhpZGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBiYm94ID0ge307XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBiYm94ID0gdGhpcy5ub2RlLmdldEJCb3goKTtcbiAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAvLyBGaXJlZm94IDMuMC54IHBsYXlzIGJhZGx5IGhlcmVcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGJib3ggPSBiYm94IHx8IHt9O1xuICAgICAgICB9XG4gICAgICAgIGhpZGUgJiYgdGhpcy5oaWRlKCk7XG4gICAgICAgIHJldHVybiBiYm94O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuYXR0clxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogU2V0cyB0aGUgYXR0cmlidXRlcyBvZiB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gYXR0ck5hbWUgKHN0cmluZykgYXR0cmlidXRl4oCZcyBuYW1lXG4gICAgIC0gdmFsdWUgKHN0cmluZykgdmFsdWVcbiAgICAgKiBvclxuICAgICAtIHBhcmFtcyAob2JqZWN0KSBvYmplY3Qgb2YgbmFtZS92YWx1ZSBwYWlyc1xuICAgICAqIG9yXG4gICAgIC0gYXR0ck5hbWUgKHN0cmluZykgYXR0cmlidXRl4oCZcyBuYW1lXG4gICAgICogb3JcbiAgICAgLSBhdHRyTmFtZXMgKGFycmF5KSBpbiB0aGlzIGNhc2UgbWV0aG9kIHJldHVybnMgYXJyYXkgb2YgY3VycmVudCB2YWx1ZXMgZm9yIGdpdmVuIGF0dHJpYnV0ZSBuYW1lc1xuICAgICA9IChvYmplY3QpIEBFbGVtZW50IGlmIGF0dHJzTmFtZSAmIHZhbHVlIG9yIHBhcmFtcyBhcmUgcGFzc2VkIGluLlxuICAgICA9ICguLi4pIHZhbHVlIG9mIHRoZSBhdHRyaWJ1dGUgaWYgb25seSBhdHRyc05hbWUgaXMgcGFzc2VkIGluLlxuICAgICA9IChhcnJheSkgYXJyYXkgb2YgdmFsdWVzIG9mIHRoZSBhdHRyaWJ1dGUgaWYgYXR0cnNOYW1lcyBpcyBwYXNzZWQgaW4uXG4gICAgID0gKG9iamVjdCkgb2JqZWN0IG9mIGF0dHJpYnV0ZXMgaWYgbm90aGluZyBpcyBwYXNzZWQgaW4uXG4gICAgID4gUG9zc2libGUgcGFyYW1ldGVyc1xuICAgICAjIDxwPlBsZWFzZSByZWZlciB0byB0aGUgPGEgaHJlZj1cImh0dHA6Ly93d3cudzMub3JnL1RSL1NWRy9cIiB0aXRsZT1cIlRoZSBXM0MgUmVjb21tZW5kYXRpb24gZm9yIHRoZSBTVkcgbGFuZ3VhZ2UgZGVzY3JpYmVzIHRoZXNlIHByb3BlcnRpZXMgaW4gZGV0YWlsLlwiPlNWRyBzcGVjaWZpY2F0aW9uPC9hPiBmb3IgYW4gZXhwbGFuYXRpb24gb2YgdGhlc2UgcGFyYW1ldGVycy48L3A+XG4gICAgIG8gYXJyb3ctZW5kIChzdHJpbmcpIGFycm93aGVhZCBvbiB0aGUgZW5kIG9mIHRoZSBwYXRoLiBUaGUgZm9ybWF0IGZvciBzdHJpbmcgaXMgYDx0eXBlPlstPHdpZHRoPlstPGxlbmd0aD5dXWAuIFBvc3NpYmxlIHR5cGVzOiBgY2xhc3NpY2AsIGBibG9ja2AsIGBvcGVuYCwgYG92YWxgLCBgZGlhbW9uZGAsIGBub25lYCwgd2lkdGg6IGB3aWRlYCwgYG5hcnJvd2AsIGBtZWRpdW1gLCBsZW5ndGg6IGBsb25nYCwgYHNob3J0YCwgYG1pZGl1bWAuXG4gICAgIG8gY2xpcC1yZWN0IChzdHJpbmcpIGNvbW1hIG9yIHNwYWNlIHNlcGFyYXRlZCB2YWx1ZXM6IHgsIHksIHdpZHRoIGFuZCBoZWlnaHRcbiAgICAgbyBjdXJzb3IgKHN0cmluZykgQ1NTIHR5cGUgb2YgdGhlIGN1cnNvclxuICAgICBvIGN4IChudW1iZXIpIHRoZSB4LWF4aXMgY29vcmRpbmF0ZSBvZiB0aGUgY2VudGVyIG9mIHRoZSBjaXJjbGUsIG9yIGVsbGlwc2VcbiAgICAgbyBjeSAobnVtYmVyKSB0aGUgeS1heGlzIGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgY2lyY2xlLCBvciBlbGxpcHNlXG4gICAgIG8gZmlsbCAoc3RyaW5nKSBjb2xvdXIsIGdyYWRpZW50IG9yIGltYWdlXG4gICAgIG8gZmlsbC1vcGFjaXR5IChudW1iZXIpXG4gICAgIG8gZm9udCAoc3RyaW5nKVxuICAgICBvIGZvbnQtZmFtaWx5IChzdHJpbmcpXG4gICAgIG8gZm9udC1zaXplIChudW1iZXIpIGZvbnQgc2l6ZSBpbiBwaXhlbHNcbiAgICAgbyBmb250LXdlaWdodCAoc3RyaW5nKVxuICAgICBvIGhlaWdodCAobnVtYmVyKVxuICAgICBvIGhyZWYgKHN0cmluZykgVVJMLCBpZiBzcGVjaWZpZWQgZWxlbWVudCBiZWhhdmVzIGFzIGh5cGVybGlua1xuICAgICBvIG9wYWNpdHkgKG51bWJlcilcbiAgICAgbyBwYXRoIChzdHJpbmcpIFNWRyBwYXRoIHN0cmluZyBmb3JtYXRcbiAgICAgbyByIChudW1iZXIpIHJhZGl1cyBvZiB0aGUgY2lyY2xlLCBlbGxpcHNlIG9yIHJvdW5kZWQgY29ybmVyIG9uIHRoZSByZWN0XG4gICAgIG8gcnggKG51bWJlcikgaG9yaXNvbnRhbCByYWRpdXMgb2YgdGhlIGVsbGlwc2VcbiAgICAgbyByeSAobnVtYmVyKSB2ZXJ0aWNhbCByYWRpdXMgb2YgdGhlIGVsbGlwc2VcbiAgICAgbyBzcmMgKHN0cmluZykgaW1hZ2UgVVJMLCBvbmx5IHdvcmtzIGZvciBARWxlbWVudC5pbWFnZSBlbGVtZW50XG4gICAgIG8gc3Ryb2tlIChzdHJpbmcpIHN0cm9rZSBjb2xvdXJcbiAgICAgbyBzdHJva2UtZGFzaGFycmF5IChzdHJpbmcpIFvigJzigJ0sIOKAnGAtYOKAnSwg4oCcYC5g4oCdLCDigJxgLS5g4oCdLCDigJxgLS4uYOKAnSwg4oCcYC4gYOKAnSwg4oCcYC0gYOKAnSwg4oCcYC0tYOKAnSwg4oCcYC0gLmDigJ0sIOKAnGAtLS5g4oCdLCDigJxgLS0uLmDigJ1dXG4gICAgIG8gc3Ryb2tlLWxpbmVjYXAgKHN0cmluZykgW+KAnGBidXR0YOKAnSwg4oCcYHNxdWFyZWDigJ0sIOKAnGByb3VuZGDigJ1dXG4gICAgIG8gc3Ryb2tlLWxpbmVqb2luIChzdHJpbmcpIFvigJxgYmV2ZWxg4oCdLCDigJxgcm91bmRg4oCdLCDigJxgbWl0ZXJg4oCdXVxuICAgICBvIHN0cm9rZS1taXRlcmxpbWl0IChudW1iZXIpXG4gICAgIG8gc3Ryb2tlLW9wYWNpdHkgKG51bWJlcilcbiAgICAgbyBzdHJva2Utd2lkdGggKG51bWJlcikgc3Ryb2tlIHdpZHRoIGluIHBpeGVscywgZGVmYXVsdCBpcyAnMSdcbiAgICAgbyB0YXJnZXQgKHN0cmluZykgdXNlZCB3aXRoIGhyZWZcbiAgICAgbyB0ZXh0IChzdHJpbmcpIGNvbnRlbnRzIG9mIHRoZSB0ZXh0IGVsZW1lbnQuIFVzZSBgXFxuYCBmb3IgbXVsdGlsaW5lIHRleHRcbiAgICAgbyB0ZXh0LWFuY2hvciAoc3RyaW5nKSBb4oCcYHN0YXJ0YOKAnSwg4oCcYG1pZGRsZWDigJ0sIOKAnGBlbmRg4oCdXSwgZGVmYXVsdCBpcyDigJxgbWlkZGxlYOKAnVxuICAgICBvIHRpdGxlIChzdHJpbmcpIHdpbGwgY3JlYXRlIHRvb2x0aXAgd2l0aCBhIGdpdmVuIHRleHRcbiAgICAgbyB0cmFuc2Zvcm0gKHN0cmluZykgc2VlIEBFbGVtZW50LnRyYW5zZm9ybVxuICAgICBvIHdpZHRoIChudW1iZXIpXG4gICAgIG8geCAobnVtYmVyKVxuICAgICBvIHkgKG51bWJlcilcbiAgICAgPiBHcmFkaWVudHNcbiAgICAgKiBMaW5lYXIgZ3JhZGllbnQgZm9ybWF0OiDigJxg4oC5YW5nbGXigLot4oC5Y29sb3Vy4oC6Wy3igLljb2xvdXLigLpbOuKAuW9mZnNldOKAul1dKi3igLljb2xvdXLigLpg4oCdLCBleGFtcGxlOiDigJxgOTAtI2ZmZi0jMDAwYOKAnSDigJMgOTDCsFxuICAgICAqIGdyYWRpZW50IGZyb20gd2hpdGUgdG8gYmxhY2sgb3Ig4oCcYDAtI2ZmZi0jZjAwOjIwLSMwMDBg4oCdIOKAkyAwwrAgZ3JhZGllbnQgZnJvbSB3aGl0ZSB2aWEgcmVkIChhdCAyMCUpIHRvIGJsYWNrLlxuICAgICAqXG4gICAgICogcmFkaWFsIGdyYWRpZW50OiDigJxgclso4oC5ZnjigLosIOKAuWZ54oC6KV3igLljb2xvdXLigLpbLeKAuWNvbG91cuKAuls64oC5b2Zmc2V04oC6XV0qLeKAuWNvbG91cuKAumDigJ0sIGV4YW1wbGU6IOKAnGByI2ZmZi0jMDAwYOKAnSDigJNcbiAgICAgKiBncmFkaWVudCBmcm9tIHdoaXRlIHRvIGJsYWNrIG9yIOKAnGByKDAuMjUsIDAuNzUpI2ZmZi0jMDAwYOKAnSDigJMgZ3JhZGllbnQgZnJvbSB3aGl0ZSB0byBibGFjayB3aXRoIGZvY3VzIHBvaW50XG4gICAgICogYXQgMC4yNSwgMC43NS4gRm9jdXMgcG9pbnQgY29vcmRpbmF0ZXMgYXJlIGluIDAuLjEgcmFuZ2UuIFJhZGlhbCBncmFkaWVudHMgY2FuIG9ubHkgYmUgYXBwbGllZCB0byBjaXJjbGVzIGFuZCBlbGxpcHNlcy5cbiAgICAgPiBQYXRoIFN0cmluZ1xuICAgICAjIDxwPlBsZWFzZSByZWZlciB0byA8YSBocmVmPVwiaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHL3BhdGhzLmh0bWwjUGF0aERhdGFcIiB0aXRsZT1cIkRldGFpbHMgb2YgYSBwYXRo4oCZcyBkYXRhIGF0dHJpYnV0ZeKAmXMgZm9ybWF0IGFyZSBkZXNjcmliZWQgaW4gdGhlIFNWRyBzcGVjaWZpY2F0aW9uLlwiPlNWRyBkb2N1bWVudGF0aW9uIHJlZ2FyZGluZyBwYXRoIHN0cmluZzwvYT4uIFJhcGhhw6tsIGZ1bGx5IHN1cHBvcnRzIGl0LjwvcD5cbiAgICAgPiBDb2xvdXIgUGFyc2luZ1xuICAgICAjIDx1bD5cbiAgICAgIyAgICAgPGxpPkNvbG91ciBuYW1lICjigJw8Y29kZT5yZWQ8L2NvZGU+4oCdLCDigJw8Y29kZT5ncmVlbjwvY29kZT7igJ0sIOKAnDxjb2RlPmNvcm5mbG93ZXJibHVlPC9jb2RlPuKAnSwgZXRjKTwvbGk+XG4gICAgICMgICAgIDxsaT4j4oCi4oCi4oCiIOKAlCBzaG9ydGVuZWQgSFRNTCBjb2xvdXI6ICjigJw8Y29kZT4jMDAwPC9jb2RlPuKAnSwg4oCcPGNvZGU+I2ZjMDwvY29kZT7igJ0sIGV0Yyk8L2xpPlxuICAgICAjICAgICA8bGk+I+KAouKAouKAouKAouKAouKAoiDigJQgZnVsbCBsZW5ndGggSFRNTCBjb2xvdXI6ICjigJw8Y29kZT4jMDAwMDAwPC9jb2RlPuKAnSwg4oCcPGNvZGU+I2JkMjMwMDwvY29kZT7igJ0pPC9saT5cbiAgICAgIyAgICAgPGxpPnJnYijigKLigKLigKIsIOKAouKAouKAoiwg4oCi4oCi4oCiKSDigJQgcmVkLCBncmVlbiBhbmQgYmx1ZSBjaGFubmVsc+KAmSB2YWx1ZXM6ICjigJw8Y29kZT5yZ2IoMjAwLCZuYnNwOzEwMCwmbmJzcDswKTwvY29kZT7igJ0pPC9saT5cbiAgICAgIyAgICAgPGxpPnJnYijigKLigKLigKIlLCDigKLigKLigKIlLCDigKLigKLigKIlKSDigJQgc2FtZSBhcyBhYm92ZSwgYnV0IGluICU6ICjigJw8Y29kZT5yZ2IoMTAwJSwmbmJzcDsxNzUlLCZuYnNwOzAlKTwvY29kZT7igJ0pPC9saT5cbiAgICAgIyAgICAgPGxpPnJnYmEo4oCi4oCi4oCiLCDigKLigKLigKIsIOKAouKAouKAoiwg4oCi4oCi4oCiKSDigJQgcmVkLCBncmVlbiBhbmQgYmx1ZSBjaGFubmVsc+KAmSB2YWx1ZXM6ICjigJw8Y29kZT5yZ2JhKDIwMCwmbmJzcDsxMDAsJm5ic3A7MCwgLjUpPC9jb2RlPuKAnSk8L2xpPlxuICAgICAjICAgICA8bGk+cmdiYSjigKLigKLigKIlLCDigKLigKLigKIlLCDigKLigKLigKIlLCDigKLigKLigKIlKSDigJQgc2FtZSBhcyBhYm92ZSwgYnV0IGluICU6ICjigJw8Y29kZT5yZ2JhKDEwMCUsJm5ic3A7MTc1JSwmbmJzcDswJSwgNTAlKTwvY29kZT7igJ0pPC9saT5cbiAgICAgIyAgICAgPGxpPmhzYijigKLigKLigKIsIOKAouKAouKAoiwg4oCi4oCi4oCiKSDigJQgaHVlLCBzYXR1cmF0aW9uIGFuZCBicmlnaHRuZXNzIHZhbHVlczogKOKAnDxjb2RlPmhzYigwLjUsJm5ic3A7MC4yNSwmbmJzcDsxKTwvY29kZT7igJ0pPC9saT5cbiAgICAgIyAgICAgPGxpPmhzYijigKLigKLigKIlLCDigKLigKLigKIlLCDigKLigKLigKIlKSDigJQgc2FtZSBhcyBhYm92ZSwgYnV0IGluICU8L2xpPlxuICAgICAjICAgICA8bGk+aHNiYSjigKLigKLigKIsIOKAouKAouKAoiwg4oCi4oCi4oCiLCDigKLigKLigKIpIOKAlCBzYW1lIGFzIGFib3ZlLCBidXQgd2l0aCBvcGFjaXR5PC9saT5cbiAgICAgIyAgICAgPGxpPmhzbCjigKLigKLigKIsIOKAouKAouKAoiwg4oCi4oCi4oCiKSDigJQgYWxtb3N0IHRoZSBzYW1lIGFzIGhzYiwgc2VlIDxhIGhyZWY9XCJodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0hTTF9hbmRfSFNWXCIgdGl0bGU9XCJIU0wgYW5kIEhTViAtIFdpa2lwZWRpYSwgdGhlIGZyZWUgZW5jeWNsb3BlZGlhXCI+V2lraXBlZGlhIHBhZ2U8L2E+PC9saT5cbiAgICAgIyAgICAgPGxpPmhzbCjigKLigKLigKIlLCDigKLigKLigKIlLCDigKLigKLigKIlKSDigJQgc2FtZSBhcyBhYm92ZSwgYnV0IGluICU8L2xpPlxuICAgICAjICAgICA8bGk+aHNsYSjigKLigKLigKIsIOKAouKAouKAoiwg4oCi4oCi4oCiLCDigKLigKLigKIpIOKAlCBzYW1lIGFzIGFib3ZlLCBidXQgd2l0aCBvcGFjaXR5PC9saT5cbiAgICAgIyAgICAgPGxpPk9wdGlvbmFsbHkgZm9yIGhzYiBhbmQgaHNsIHlvdSBjb3VsZCBzcGVjaWZ5IGh1ZSBhcyBhIGRlZ3JlZTog4oCcPGNvZGU+aHNsKDI0MGRlZywmbmJzcDsxLCZuYnNwOy41KTwvY29kZT7igJ0gb3IsIGlmIHlvdSB3YW50IHRvIGdvIGZhbmN5LCDigJw8Y29kZT5oc2woMjQwwrAsJm5ic3A7MSwmbmJzcDsuNSk8L2NvZGU+4oCdPC9saT5cbiAgICAgIyA8L3VsPlxuICAgIFxcKi9cbiAgICBlbHByb3RvLmF0dHIgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hbWUgPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIHJlcyA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgYSBpbiB0aGlzLmF0dHJzKSBpZiAodGhpcy5hdHRyc1toYXNdKGEpKSB7XG4gICAgICAgICAgICAgICAgcmVzW2FdID0gdGhpcy5hdHRyc1thXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcy5ncmFkaWVudCAmJiByZXMuZmlsbCA9PSBcIm5vbmVcIiAmJiAocmVzLmZpbGwgPSByZXMuZ3JhZGllbnQpICYmIGRlbGV0ZSByZXMuZ3JhZGllbnQ7XG4gICAgICAgICAgICByZXMudHJhbnNmb3JtID0gdGhpcy5fLnRyYW5zZm9ybTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlID09IG51bGwgJiYgUi5pcyhuYW1lLCBcInN0cmluZ1wiKSkge1xuICAgICAgICAgICAgaWYgKG5hbWUgPT0gXCJmaWxsXCIgJiYgdGhpcy5hdHRycy5maWxsID09IFwibm9uZVwiICYmIHRoaXMuYXR0cnMuZ3JhZGllbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRycy5ncmFkaWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChuYW1lID09IFwidHJhbnNmb3JtXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fLnRyYW5zZm9ybTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBuYW1lcyA9IG5hbWUuc3BsaXQoc2VwYXJhdG9yKSxcbiAgICAgICAgICAgICAgICBvdXQgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IG5hbWVzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZXNbaV07XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUgaW4gdGhpcy5hdHRycykge1xuICAgICAgICAgICAgICAgICAgICBvdXRbbmFtZV0gPSB0aGlzLmF0dHJzW25hbWVdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoUi5pcyh0aGlzLnBhcGVyLmN1c3RvbUF0dHJpYnV0ZXNbbmFtZV0sIFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0W25hbWVdID0gdGhpcy5wYXBlci5jdXN0b21BdHRyaWJ1dGVzW25hbWVdLmRlZjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvdXRbbmFtZV0gPSBSLl9hdmFpbGFibGVBdHRyc1tuYW1lXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaWkgLSAxID8gb3V0IDogb3V0W25hbWVzWzBdXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWUgPT0gbnVsbCAmJiBSLmlzKG5hbWUsIFwiYXJyYXlcIikpIHtcbiAgICAgICAgICAgIG91dCA9IHt9O1xuICAgICAgICAgICAgZm9yIChpID0gMCwgaWkgPSBuYW1lLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICBvdXRbbmFtZVtpXV0gPSB0aGlzLmF0dHIobmFtZVtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgcGFyYW1zID0ge307XG4gICAgICAgICAgICBwYXJhbXNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChuYW1lICE9IG51bGwgJiYgUi5pcyhuYW1lLCBcIm9iamVjdFwiKSkge1xuICAgICAgICAgICAgcGFyYW1zID0gbmFtZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gcGFyYW1zKSB7XG4gICAgICAgICAgICBldmUoXCJyYXBoYWVsLmF0dHIuXCIgKyBrZXkgKyBcIi5cIiArIHRoaXMuaWQsIHRoaXMsIHBhcmFtc1trZXldKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGtleSBpbiB0aGlzLnBhcGVyLmN1c3RvbUF0dHJpYnV0ZXMpIGlmICh0aGlzLnBhcGVyLmN1c3RvbUF0dHJpYnV0ZXNbaGFzXShrZXkpICYmIHBhcmFtc1toYXNdKGtleSkgJiYgUi5pcyh0aGlzLnBhcGVyLmN1c3RvbUF0dHJpYnV0ZXNba2V5XSwgXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgdmFyIHBhciA9IHRoaXMucGFwZXIuY3VzdG9tQXR0cmlidXRlc1trZXldLmFwcGx5KHRoaXMsIFtdLmNvbmNhdChwYXJhbXNba2V5XSkpO1xuICAgICAgICAgICAgdGhpcy5hdHRyc1trZXldID0gcGFyYW1zW2tleV07XG4gICAgICAgICAgICBmb3IgKHZhciBzdWJrZXkgaW4gcGFyKSBpZiAocGFyW2hhc10oc3Via2V5KSkge1xuICAgICAgICAgICAgICAgIHBhcmFtc1tzdWJrZXldID0gcGFyW3N1YmtleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2V0RmlsbEFuZFN0cm9rZSh0aGlzLCBwYXJhbXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnRvRnJvbnRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIE1vdmVzIHRoZSBlbGVtZW50IHNvIGl0IGlzIHRoZSBjbG9zZXN0IHRvIHRoZSB2aWV3ZXLigJlzIGV5ZXMsIG9uIHRvcCBvZiBvdGhlciBlbGVtZW50cy5cbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLnRvRnJvbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm5vZGUucGFyZW50Tm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT0gXCJhXCIpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5ub2RlLnBhcmVudE5vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5ub2RlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3ZnID0gdGhpcy5wYXBlcjtcbiAgICAgICAgc3ZnLnRvcCAhPSB0aGlzICYmIFIuX3RvZnJvbnQodGhpcywgc3ZnKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC50b0JhY2tcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIE1vdmVzIHRoZSBlbGVtZW50IHNvIGl0IGlzIHRoZSBmdXJ0aGVzdCBmcm9tIHRoZSB2aWV3ZXLigJlzIGV5ZXMsIGJlaGluZCBvdGhlciBlbGVtZW50cy5cbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLnRvQmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMubm9kZS5wYXJlbnROb2RlO1xuICAgICAgICBpZiAocGFyZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PSBcImFcIikge1xuICAgICAgICAgICAgcGFyZW50LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMubm9kZS5wYXJlbnROb2RlLCB0aGlzLm5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLmZpcnN0Q2hpbGQpOyBcbiAgICAgICAgfSBlbHNlIGlmIChwYXJlbnQuZmlyc3RDaGlsZCAhPSB0aGlzLm5vZGUpIHtcbiAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUodGhpcy5ub2RlLCB0aGlzLm5vZGUucGFyZW50Tm9kZS5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuICAgICAgICBSLl90b2JhY2sodGhpcywgdGhpcy5wYXBlcik7XG4gICAgICAgIHZhciBzdmcgPSB0aGlzLnBhcGVyO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50Lmluc2VydEFmdGVyXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBJbnNlcnRzIGN1cnJlbnQgb2JqZWN0IGFmdGVyIHRoZSBnaXZlbiBvbmUuXG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by5pbnNlcnRBZnRlciA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHZhciBub2RlID0gZWxlbWVudC5ub2RlIHx8IGVsZW1lbnRbZWxlbWVudC5sZW5ndGggLSAxXS5ub2RlO1xuICAgICAgICBpZiAobm9kZS5uZXh0U2libGluZykge1xuICAgICAgICAgICAgbm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLm5vZGUsIG5vZGUubmV4dFNpYmxpbmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9kZS5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMubm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgUi5faW5zZXJ0YWZ0ZXIodGhpcywgZWxlbWVudCwgdGhpcy5wYXBlcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuaW5zZXJ0QmVmb3JlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBJbnNlcnRzIGN1cnJlbnQgb2JqZWN0IGJlZm9yZSB0aGUgZ2l2ZW4gb25lLlxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8uaW5zZXJ0QmVmb3JlID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5vZGUgPSBlbGVtZW50Lm5vZGUgfHwgZWxlbWVudFswXS5ub2RlO1xuICAgICAgICBub2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMubm9kZSwgbm9kZSk7XG4gICAgICAgIFIuX2luc2VydGJlZm9yZSh0aGlzLCBlbGVtZW50LCB0aGlzLnBhcGVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBlbHByb3RvLmJsdXIgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICAgICAgICAvLyBFeHBlcmltZW50YWwuIE5vIFNhZmFyaSBzdXBwb3J0LiBVc2UgaXQgb24geW91ciBvd24gcmlzay5cbiAgICAgICAgdmFyIHQgPSB0aGlzO1xuICAgICAgICBpZiAoK3NpemUgIT09IDApIHtcbiAgICAgICAgICAgIHZhciBmbHRyID0gJChcImZpbHRlclwiKSxcbiAgICAgICAgICAgICAgICBibHVyID0gJChcImZlR2F1c3NpYW5CbHVyXCIpO1xuICAgICAgICAgICAgdC5hdHRycy5ibHVyID0gc2l6ZTtcbiAgICAgICAgICAgIGZsdHIuaWQgPSBSLmNyZWF0ZVVVSUQoKTtcbiAgICAgICAgICAgICQoYmx1ciwge3N0ZERldmlhdGlvbjogK3NpemUgfHwgMS41fSk7XG4gICAgICAgICAgICBmbHRyLmFwcGVuZENoaWxkKGJsdXIpO1xuICAgICAgICAgICAgdC5wYXBlci5kZWZzLmFwcGVuZENoaWxkKGZsdHIpO1xuICAgICAgICAgICAgdC5fYmx1ciA9IGZsdHI7XG4gICAgICAgICAgICAkKHQubm9kZSwge2ZpbHRlcjogXCJ1cmwoI1wiICsgZmx0ci5pZCArIFwiKVwifSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodC5fYmx1cikge1xuICAgICAgICAgICAgICAgIHQuX2JsdXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0Ll9ibHVyKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdC5fYmx1cjtcbiAgICAgICAgICAgICAgICBkZWxldGUgdC5hdHRycy5ibHVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdC5ub2RlLnJlbW92ZUF0dHJpYnV0ZShcImZpbHRlclwiKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgUi5fZW5naW5lLmNpcmNsZSA9IGZ1bmN0aW9uIChzdmcsIHgsIHksIHIpIHtcbiAgICAgICAgdmFyIGVsID0gJChcImNpcmNsZVwiKTtcbiAgICAgICAgc3ZnLmNhbnZhcyAmJiBzdmcuY2FudmFzLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgdmFyIHJlcyA9IG5ldyBFbGVtZW50KGVsLCBzdmcpO1xuICAgICAgICByZXMuYXR0cnMgPSB7Y3g6IHgsIGN5OiB5LCByOiByLCBmaWxsOiBcIm5vbmVcIiwgc3Ryb2tlOiBcIiMwMDBcIn07XG4gICAgICAgIHJlcy50eXBlID0gXCJjaXJjbGVcIjtcbiAgICAgICAgJChlbCwgcmVzLmF0dHJzKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuICAgIFIuX2VuZ2luZS5yZWN0ID0gZnVuY3Rpb24gKHN2ZywgeCwgeSwgdywgaCwgcikge1xuICAgICAgICB2YXIgZWwgPSAkKFwicmVjdFwiKTtcbiAgICAgICAgc3ZnLmNhbnZhcyAmJiBzdmcuY2FudmFzLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgdmFyIHJlcyA9IG5ldyBFbGVtZW50KGVsLCBzdmcpO1xuICAgICAgICByZXMuYXR0cnMgPSB7eDogeCwgeTogeSwgd2lkdGg6IHcsIGhlaWdodDogaCwgcjogciB8fCAwLCByeDogciB8fCAwLCByeTogciB8fCAwLCBmaWxsOiBcIm5vbmVcIiwgc3Ryb2tlOiBcIiMwMDBcIn07XG4gICAgICAgIHJlcy50eXBlID0gXCJyZWN0XCI7XG4gICAgICAgICQoZWwsIHJlcy5hdHRycyk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfTtcbiAgICBSLl9lbmdpbmUuZWxsaXBzZSA9IGZ1bmN0aW9uIChzdmcsIHgsIHksIHJ4LCByeSkge1xuICAgICAgICB2YXIgZWwgPSAkKFwiZWxsaXBzZVwiKTtcbiAgICAgICAgc3ZnLmNhbnZhcyAmJiBzdmcuY2FudmFzLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgdmFyIHJlcyA9IG5ldyBFbGVtZW50KGVsLCBzdmcpO1xuICAgICAgICByZXMuYXR0cnMgPSB7Y3g6IHgsIGN5OiB5LCByeDogcngsIHJ5OiByeSwgZmlsbDogXCJub25lXCIsIHN0cm9rZTogXCIjMDAwXCJ9O1xuICAgICAgICByZXMudHlwZSA9IFwiZWxsaXBzZVwiO1xuICAgICAgICAkKGVsLCByZXMuYXR0cnMpO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gICAgUi5fZW5naW5lLmltYWdlID0gZnVuY3Rpb24gKHN2Zywgc3JjLCB4LCB5LCB3LCBoKSB7XG4gICAgICAgIHZhciBlbCA9ICQoXCJpbWFnZVwiKTtcbiAgICAgICAgJChlbCwge3g6IHgsIHk6IHksIHdpZHRoOiB3LCBoZWlnaHQ6IGgsIHByZXNlcnZlQXNwZWN0UmF0aW86IFwibm9uZVwifSk7XG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZU5TKHhsaW5rLCBcImhyZWZcIiwgc3JjKTtcbiAgICAgICAgc3ZnLmNhbnZhcyAmJiBzdmcuY2FudmFzLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgdmFyIHJlcyA9IG5ldyBFbGVtZW50KGVsLCBzdmcpO1xuICAgICAgICByZXMuYXR0cnMgPSB7eDogeCwgeTogeSwgd2lkdGg6IHcsIGhlaWdodDogaCwgc3JjOiBzcmN9O1xuICAgICAgICByZXMudHlwZSA9IFwiaW1hZ2VcIjtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuICAgIFIuX2VuZ2luZS50ZXh0ID0gZnVuY3Rpb24gKHN2ZywgeCwgeSwgdGV4dCkge1xuICAgICAgICB2YXIgZWwgPSAkKFwidGV4dFwiKTtcbiAgICAgICAgc3ZnLmNhbnZhcyAmJiBzdmcuY2FudmFzLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgdmFyIHJlcyA9IG5ldyBFbGVtZW50KGVsLCBzdmcpO1xuICAgICAgICByZXMuYXR0cnMgPSB7XG4gICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgIFwidGV4dC1hbmNob3JcIjogXCJtaWRkbGVcIixcbiAgICAgICAgICAgIHRleHQ6IHRleHQsXG4gICAgICAgICAgICBmb250OiBSLl9hdmFpbGFibGVBdHRycy5mb250LFxuICAgICAgICAgICAgc3Ryb2tlOiBcIm5vbmVcIixcbiAgICAgICAgICAgIGZpbGw6IFwiIzAwMFwiXG4gICAgICAgIH07XG4gICAgICAgIHJlcy50eXBlID0gXCJ0ZXh0XCI7XG4gICAgICAgIHNldEZpbGxBbmRTdHJva2UocmVzLCByZXMuYXR0cnMpO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gICAgUi5fZW5naW5lLnNldFNpemUgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCkge1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGggfHwgdGhpcy53aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgfHwgdGhpcy5oZWlnaHQ7XG4gICAgICAgIHRoaXMuY2FudmFzLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIHRoaXMud2lkdGgpO1xuICAgICAgICB0aGlzLmNhbnZhcy5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgdGhpcy5oZWlnaHQpO1xuICAgICAgICBpZiAodGhpcy5fdmlld0JveCkge1xuICAgICAgICAgICAgdGhpcy5zZXRWaWV3Qm94LmFwcGx5KHRoaXMsIHRoaXMuX3ZpZXdCb3gpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgUi5fZW5naW5lLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNvbiA9IFIuX2dldENvbnRhaW5lci5hcHBseSgwLCBhcmd1bWVudHMpLFxuICAgICAgICAgICAgY29udGFpbmVyID0gY29uICYmIGNvbi5jb250YWluZXIsXG4gICAgICAgICAgICB4ID0gY29uLngsXG4gICAgICAgICAgICB5ID0gY29uLnksXG4gICAgICAgICAgICB3aWR0aCA9IGNvbi53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodCA9IGNvbi5oZWlnaHQ7XG4gICAgICAgIGlmICghY29udGFpbmVyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTVkcgY29udGFpbmVyIG5vdCBmb3VuZC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNudnMgPSAkKFwic3ZnXCIpLFxuICAgICAgICAgICAgY3NzID0gXCJvdmVyZmxvdzpoaWRkZW47XCIsXG4gICAgICAgICAgICBpc0Zsb2F0aW5nO1xuICAgICAgICB4ID0geCB8fCAwO1xuICAgICAgICB5ID0geSB8fCAwO1xuICAgICAgICB3aWR0aCA9IHdpZHRoIHx8IDUxMjtcbiAgICAgICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IDM0MjtcbiAgICAgICAgJChjbnZzLCB7XG4gICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgICAgIHZlcnNpb246IDEuMSxcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIHhtbG5zOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChjb250YWluZXIgPT0gMSkge1xuICAgICAgICAgICAgY252cy5zdHlsZS5jc3NUZXh0ID0gY3NzICsgXCJwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OlwiICsgeCArIFwicHg7dG9wOlwiICsgeSArIFwicHhcIjtcbiAgICAgICAgICAgIFIuX2cuZG9jLmJvZHkuYXBwZW5kQ2hpbGQoY252cyk7XG4gICAgICAgICAgICBpc0Zsb2F0aW5nID0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNudnMuc3R5bGUuY3NzVGV4dCA9IGNzcyArIFwicG9zaXRpb246cmVsYXRpdmVcIjtcbiAgICAgICAgICAgIGlmIChjb250YWluZXIuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUoY252cywgY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY252cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29udGFpbmVyID0gbmV3IFIuX1BhcGVyO1xuICAgICAgICBjb250YWluZXIud2lkdGggPSB3aWR0aDtcbiAgICAgICAgY29udGFpbmVyLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgY29udGFpbmVyLmNhbnZhcyA9IGNudnM7XG4gICAgICAgIGNvbnRhaW5lci5jbGVhcigpO1xuICAgICAgICBjb250YWluZXIuX2xlZnQgPSBjb250YWluZXIuX3RvcCA9IDA7XG4gICAgICAgIGlzRmxvYXRpbmcgJiYgKGNvbnRhaW5lci5yZW5kZXJmaXggPSBmdW5jdGlvbiAoKSB7fSk7XG4gICAgICAgIGNvbnRhaW5lci5yZW5kZXJmaXgoKTtcbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgICB9O1xuICAgIFIuX2VuZ2luZS5zZXRWaWV3Qm94ID0gZnVuY3Rpb24gKHgsIHksIHcsIGgsIGZpdCkge1xuICAgICAgICBldmUoXCJyYXBoYWVsLnNldFZpZXdCb3hcIiwgdGhpcywgdGhpcy5fdmlld0JveCwgW3gsIHksIHcsIGgsIGZpdF0pO1xuICAgICAgICB2YXIgc2l6ZSA9IG1tYXgodyAvIHRoaXMud2lkdGgsIGggLyB0aGlzLmhlaWdodCksXG4gICAgICAgICAgICB0b3AgPSB0aGlzLnRvcCxcbiAgICAgICAgICAgIGFzcGVjdFJhdGlvID0gZml0ID8gXCJtZWV0XCIgOiBcInhNaW5ZTWluXCIsXG4gICAgICAgICAgICB2YixcbiAgICAgICAgICAgIHN3O1xuICAgICAgICBpZiAoeCA9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fdmJTaXplKSB7XG4gICAgICAgICAgICAgICAgc2l6ZSA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fdmJTaXplO1xuICAgICAgICAgICAgdmIgPSBcIjAgMCBcIiArIHRoaXMud2lkdGggKyBTICsgdGhpcy5oZWlnaHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl92YlNpemUgPSBzaXplO1xuICAgICAgICAgICAgdmIgPSB4ICsgUyArIHkgKyBTICsgdyArIFMgKyBoO1xuICAgICAgICB9XG4gICAgICAgICQodGhpcy5jYW52YXMsIHtcbiAgICAgICAgICAgIHZpZXdCb3g6IHZiLFxuICAgICAgICAgICAgcHJlc2VydmVBc3BlY3RSYXRpbzogYXNwZWN0UmF0aW9cbiAgICAgICAgfSk7XG4gICAgICAgIHdoaWxlIChzaXplICYmIHRvcCkge1xuICAgICAgICAgICAgc3cgPSBcInN0cm9rZS13aWR0aFwiIGluIHRvcC5hdHRycyA/IHRvcC5hdHRyc1tcInN0cm9rZS13aWR0aFwiXSA6IDE7XG4gICAgICAgICAgICB0b3AuYXR0cih7XCJzdHJva2Utd2lkdGhcIjogc3d9KTtcbiAgICAgICAgICAgIHRvcC5fLmRpcnR5ID0gMTtcbiAgICAgICAgICAgIHRvcC5fLmRpcnR5VCA9IDE7XG4gICAgICAgICAgICB0b3AgPSB0b3AucHJldjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl92aWV3Qm94ID0gW3gsIHksIHcsIGgsICEhZml0XTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIucmVuZGVyZml4XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBGaXhlcyB0aGUgaXNzdWUgb2YgRmlyZWZveCBhbmQgSUU5IHJlZ2FyZGluZyBzdWJwaXhlbCByZW5kZXJpbmcuIElmIHBhcGVyIGlzIGRlcGVuZGFudFxuICAgICAqIG9uIG90aGVyIGVsZW1lbnRzIGFmdGVyIHJlZmxvdyBpdCBjb3VsZCBzaGlmdCBoYWxmIHBpeGVsIHdoaWNoIGNhdXNlIGZvciBsaW5lcyB0byBsb3N0IHRoZWlyIGNyaXNwbmVzcy5cbiAgICAgKiBUaGlzIG1ldGhvZCBmaXhlcyB0aGUgaXNzdWUuXG4gICAgICoqXG4gICAgICAgU3BlY2lhbCB0aGFua3MgdG8gTWFyaXVzeiBOb3dhayAoaHR0cDovL3d3dy5tZWRpa29vLmNvbS8pIGZvciB0aGlzIG1ldGhvZC5cbiAgICBcXCovXG4gICAgUi5wcm90b3R5cGUucmVuZGVyZml4ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY252cyA9IHRoaXMuY2FudmFzLFxuICAgICAgICAgICAgcyA9IGNudnMuc3R5bGUsXG4gICAgICAgICAgICBwb3M7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwb3MgPSBjbnZzLmdldFNjcmVlbkNUTSgpIHx8IGNudnMuY3JlYXRlU1ZHTWF0cml4KCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHBvcyA9IGNudnMuY3JlYXRlU1ZHTWF0cml4KCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGxlZnQgPSAtcG9zLmUgJSAxLFxuICAgICAgICAgICAgdG9wID0gLXBvcy5mICUgMTtcbiAgICAgICAgaWYgKGxlZnQgfHwgdG9wKSB7XG4gICAgICAgICAgICBpZiAobGVmdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2xlZnQgPSAodGhpcy5fbGVmdCArIGxlZnQpICUgMTtcbiAgICAgICAgICAgICAgICBzLmxlZnQgPSB0aGlzLl9sZWZ0ICsgXCJweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRvcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RvcCA9ICh0aGlzLl90b3AgKyB0b3ApICUgMTtcbiAgICAgICAgICAgICAgICBzLnRvcCA9IHRoaXMuX3RvcCArIFwicHhcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLmNsZWFyXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDbGVhcnMgdGhlIHBhcGVyLCBpLmUuIHJlbW92ZXMgYWxsIHRoZSBlbGVtZW50cy5cbiAgICBcXCovXG4gICAgUi5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIFIuZXZlKFwicmFwaGFlbC5jbGVhclwiLCB0aGlzKTtcbiAgICAgICAgdmFyIGMgPSB0aGlzLmNhbnZhcztcbiAgICAgICAgd2hpbGUgKGMuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgYy5yZW1vdmVDaGlsZChjLmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYm90dG9tID0gdGhpcy50b3AgPSBudWxsO1xuICAgICAgICAodGhpcy5kZXNjID0gJChcImRlc2NcIikpLmFwcGVuZENoaWxkKFIuX2cuZG9jLmNyZWF0ZVRleHROb2RlKFwiQ3JlYXRlZCB3aXRoIFJhcGhhXFx4ZWJsIFwiICsgUi52ZXJzaW9uKSk7XG4gICAgICAgIGMuYXBwZW5kQ2hpbGQodGhpcy5kZXNjKTtcbiAgICAgICAgYy5hcHBlbmRDaGlsZCh0aGlzLmRlZnMgPSAkKFwiZGVmc1wiKSk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIucmVtb3ZlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIHRoZSBwYXBlciBmcm9tIHRoZSBET00uXG4gICAgXFwqL1xuICAgIFIucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZXZlKFwicmFwaGFlbC5yZW1vdmVcIiwgdGhpcyk7XG4gICAgICAgIHRoaXMuY2FudmFzLnBhcmVudE5vZGUgJiYgdGhpcy5jYW52YXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmNhbnZhcyk7XG4gICAgICAgIGZvciAodmFyIGkgaW4gdGhpcykge1xuICAgICAgICAgICAgdGhpc1tpXSA9IHR5cGVvZiB0aGlzW2ldID09IFwiZnVuY3Rpb25cIiA/IFIuX3JlbW92ZWRGYWN0b3J5KGkpIDogbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdmFyIHNldHByb3RvID0gUi5zdDtcbiAgICBmb3IgKHZhciBtZXRob2QgaW4gZWxwcm90bykgaWYgKGVscHJvdG9baGFzXShtZXRob2QpICYmICFzZXRwcm90b1toYXNdKG1ldGhvZCkpIHtcbiAgICAgICAgc2V0cHJvdG9bbWV0aG9kXSA9IChmdW5jdGlvbiAobWV0aG9kbmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJnID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsW21ldGhvZG5hbWVdLmFwcGx5KGVsLCBhcmcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSkobWV0aG9kKTtcbiAgICB9XG59KHdpbmRvdy5SYXBoYWVsKTsiLCIvLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJAgXFxcXFxuLy8g4pSCIFJhcGhhw6tsIC0gSmF2YVNjcmlwdCBWZWN0b3IgTGlicmFyeSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiBcXFxcXG4vLyDilJzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilKQgXFxcXFxuLy8g4pSCIFZNTCBNb2R1bGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIFxcXFxcbi8vIOKUnOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUpCBcXFxcXG4vLyDilIIgQ29weXJpZ2h0IChjKSAyMDA4LTIwMTEgRG1pdHJ5IEJhcmFub3Zza2l5IChodHRwOi8vcmFwaGFlbGpzLmNvbSkgICDilIIgXFxcXFxuLy8g4pSCIENvcHlyaWdodCAoYykgMjAwOC0yMDExIFNlbmNoYSBMYWJzIChodHRwOi8vc2VuY2hhLmNvbSkgICAgICAgICAgICAg4pSCIFxcXFxcbi8vIOKUgiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIChodHRwOi8vcmFwaGFlbGpzLmNvbS9saWNlbnNlLmh0bWwpIGxpY2Vuc2UuIOKUgiBcXFxcXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJggXFxcXFxud2luZG93LlJhcGhhZWwgJiYgd2luZG93LlJhcGhhZWwudm1sICYmIGZ1bmN0aW9uIChSKSB7XG4gICAgdmFyIGhhcyA9IFwiaGFzT3duUHJvcGVydHlcIixcbiAgICAgICAgU3RyID0gU3RyaW5nLFxuICAgICAgICB0b0Zsb2F0ID0gcGFyc2VGbG9hdCxcbiAgICAgICAgbWF0aCA9IE1hdGgsXG4gICAgICAgIHJvdW5kID0gbWF0aC5yb3VuZCxcbiAgICAgICAgbW1heCA9IG1hdGgubWF4LFxuICAgICAgICBtbWluID0gbWF0aC5taW4sXG4gICAgICAgIGFicyA9IG1hdGguYWJzLFxuICAgICAgICBmaWxsU3RyaW5nID0gXCJmaWxsXCIsXG4gICAgICAgIHNlcGFyYXRvciA9IC9bLCBdKy8sXG4gICAgICAgIGV2ZSA9IFIuZXZlLFxuICAgICAgICBtcyA9IFwiIHByb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdFwiLFxuICAgICAgICBTID0gXCIgXCIsXG4gICAgICAgIEUgPSBcIlwiLFxuICAgICAgICBtYXAgPSB7TTogXCJtXCIsIEw6IFwibFwiLCBDOiBcImNcIiwgWjogXCJ4XCIsIG06IFwidFwiLCBsOiBcInJcIiwgYzogXCJ2XCIsIHo6IFwieFwifSxcbiAgICAgICAgYml0ZXMgPSAvKFtjbG16XSksPyhbXmNsbXpdKikvZ2ksXG4gICAgICAgIGJsdXJyZWdleHAgPSAvIHByb2dpZDpcXFMrQmx1clxcKFteXFwpXStcXCkvZyxcbiAgICAgICAgdmFsID0gLy0/W14sXFxzLV0rL2csXG4gICAgICAgIGNzc0RvdCA9IFwicG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3RvcDowO3dpZHRoOjFweDtoZWlnaHQ6MXB4XCIsXG4gICAgICAgIHpvb20gPSAyMTYwMCxcbiAgICAgICAgcGF0aFR5cGVzID0ge3BhdGg6IDEsIHJlY3Q6IDEsIGltYWdlOiAxfSxcbiAgICAgICAgb3ZhbFR5cGVzID0ge2NpcmNsZTogMSwgZWxsaXBzZTogMX0sXG4gICAgICAgIHBhdGgydm1sID0gZnVuY3Rpb24gKHBhdGgpIHtcbiAgICAgICAgICAgIHZhciB0b3RhbCA9ICAvW2FocXN0dl0vaWcsXG4gICAgICAgICAgICAgICAgY29tbWFuZCA9IFIuX3BhdGhUb0Fic29sdXRlO1xuICAgICAgICAgICAgU3RyKHBhdGgpLm1hdGNoKHRvdGFsKSAmJiAoY29tbWFuZCA9IFIuX3BhdGgyY3VydmUpO1xuICAgICAgICAgICAgdG90YWwgPSAvW2NsbXpdL2c7XG4gICAgICAgICAgICBpZiAoY29tbWFuZCA9PSBSLl9wYXRoVG9BYnNvbHV0ZSAmJiAhU3RyKHBhdGgpLm1hdGNoKHRvdGFsKSkge1xuICAgICAgICAgICAgICAgIHZhciByZXMgPSBTdHIocGF0aCkucmVwbGFjZShiaXRlcywgZnVuY3Rpb24gKGFsbCwgY29tbWFuZCwgYXJncykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFscyA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNNb3ZlID0gY29tbWFuZC50b0xvd2VyQ2FzZSgpID09IFwibVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gbWFwW2NvbW1hbmRdO1xuICAgICAgICAgICAgICAgICAgICBhcmdzLnJlcGxhY2UodmFsLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc01vdmUgJiYgdmFscy5sZW5ndGggPT0gMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcyArPSB2YWxzICsgbWFwW2NvbW1hbmQgPT0gXCJtXCIgPyBcImxcIiA6IFwiTFwiXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWxzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxzLnB1c2gocm91bmQodmFsdWUgKiB6b29tKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzICsgdmFscztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHBhID0gY29tbWFuZChwYXRoKSwgcCwgcjtcbiAgICAgICAgICAgIHJlcyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gcGEubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIHAgPSBwYVtpXTtcbiAgICAgICAgICAgICAgICByID0gcGFbaV1bMF0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICByID09IFwielwiICYmIChyID0gXCJ4XCIpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAxLCBqaiA9IHAubGVuZ3RoOyBqIDwgamo7IGorKykge1xuICAgICAgICAgICAgICAgICAgICByICs9IHJvdW5kKHBbal0gKiB6b29tKSArIChqICE9IGpqIC0gMSA/IFwiLFwiIDogRSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlcy5wdXNoKHIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlcy5qb2luKFMpO1xuICAgICAgICB9LFxuICAgICAgICBjb21wZW5zYXRpb24gPSBmdW5jdGlvbiAoZGVnLCBkeCwgZHkpIHtcbiAgICAgICAgICAgIHZhciBtID0gUi5tYXRyaXgoKTtcbiAgICAgICAgICAgIG0ucm90YXRlKC1kZWcsIC41LCAuNSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGR4OiBtLngoZHgsIGR5KSxcbiAgICAgICAgICAgICAgICBkeTogbS55KGR4LCBkeSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHNldENvb3JkcyA9IGZ1bmN0aW9uIChwLCBzeCwgc3ksIGR4LCBkeSwgZGVnKSB7XG4gICAgICAgICAgICB2YXIgXyA9IHAuXyxcbiAgICAgICAgICAgICAgICBtID0gcC5tYXRyaXgsXG4gICAgICAgICAgICAgICAgZmlsbHBvcyA9IF8uZmlsbHBvcyxcbiAgICAgICAgICAgICAgICBvID0gcC5ub2RlLFxuICAgICAgICAgICAgICAgIHMgPSBvLnN0eWxlLFxuICAgICAgICAgICAgICAgIHkgPSAxLFxuICAgICAgICAgICAgICAgIGZsaXAgPSBcIlwiLFxuICAgICAgICAgICAgICAgIGR4ZHksXG4gICAgICAgICAgICAgICAga3ggPSB6b29tIC8gc3gsXG4gICAgICAgICAgICAgICAga3kgPSB6b29tIC8gc3k7XG4gICAgICAgICAgICBzLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgICAgICAgICAgaWYgKCFzeCB8fCAhc3kpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvLmNvb3Jkc2l6ZSA9IGFicyhreCkgKyBTICsgYWJzKGt5KTtcbiAgICAgICAgICAgIHMucm90YXRpb24gPSBkZWcgKiAoc3ggKiBzeSA8IDAgPyAtMSA6IDEpO1xuICAgICAgICAgICAgaWYgKGRlZykge1xuICAgICAgICAgICAgICAgIHZhciBjID0gY29tcGVuc2F0aW9uKGRlZywgZHgsIGR5KTtcbiAgICAgICAgICAgICAgICBkeCA9IGMuZHg7XG4gICAgICAgICAgICAgICAgZHkgPSBjLmR5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3ggPCAwICYmIChmbGlwICs9IFwieFwiKTtcbiAgICAgICAgICAgIHN5IDwgMCAmJiAoZmxpcCArPSBcIiB5XCIpICYmICh5ID0gLTEpO1xuICAgICAgICAgICAgcy5mbGlwID0gZmxpcDtcbiAgICAgICAgICAgIG8uY29vcmRvcmlnaW4gPSAoZHggKiAta3gpICsgUyArIChkeSAqIC1reSk7XG4gICAgICAgICAgICBpZiAoZmlsbHBvcyB8fCBfLmZpbGxzaXplKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZpbGwgPSBvLmdldEVsZW1lbnRzQnlUYWdOYW1lKGZpbGxTdHJpbmcpO1xuICAgICAgICAgICAgICAgIGZpbGwgPSBmaWxsICYmIGZpbGxbMF07XG4gICAgICAgICAgICAgICAgby5yZW1vdmVDaGlsZChmaWxsKTtcbiAgICAgICAgICAgICAgICBpZiAoZmlsbHBvcykge1xuICAgICAgICAgICAgICAgICAgICBjID0gY29tcGVuc2F0aW9uKGRlZywgbS54KGZpbGxwb3NbMF0sIGZpbGxwb3NbMV0pLCBtLnkoZmlsbHBvc1swXSwgZmlsbHBvc1sxXSkpO1xuICAgICAgICAgICAgICAgICAgICBmaWxsLnBvc2l0aW9uID0gYy5keCAqIHkgKyBTICsgYy5keSAqIHk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChfLmZpbGxzaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGwuc2l6ZSA9IF8uZmlsbHNpemVbMF0gKiBhYnMoc3gpICsgUyArIF8uZmlsbHNpemVbMV0gKiBhYnMoc3kpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvLmFwcGVuZENoaWxkKGZpbGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcy52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgICAgIH07XG4gICAgUi50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICBcIllvdXIgYnJvd3NlciBkb2VzblxcdTIwMTl0IHN1cHBvcnQgU1ZHLiBGYWxsaW5nIGRvd24gdG8gVk1MLlxcbllvdSBhcmUgcnVubmluZyBSYXBoYVxceGVibCBcIiArIHRoaXMudmVyc2lvbjtcbiAgICB9O1xuICAgIHZhciBhZGRBcnJvdyA9IGZ1bmN0aW9uIChvLCB2YWx1ZSwgaXNFbmQpIHtcbiAgICAgICAgdmFyIHZhbHVlcyA9IFN0cih2YWx1ZSkudG9Mb3dlckNhc2UoKS5zcGxpdChcIi1cIiksXG4gICAgICAgICAgICBzZSA9IGlzRW5kID8gXCJlbmRcIiA6IFwic3RhcnRcIixcbiAgICAgICAgICAgIGkgPSB2YWx1ZXMubGVuZ3RoLFxuICAgICAgICAgICAgdHlwZSA9IFwiY2xhc3NpY1wiLFxuICAgICAgICAgICAgdyA9IFwibWVkaXVtXCIsXG4gICAgICAgICAgICBoID0gXCJtZWRpdW1cIjtcbiAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgc3dpdGNoICh2YWx1ZXNbaV0pIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiYmxvY2tcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwiY2xhc3NpY1wiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJvdmFsXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcImRpYW1vbmRcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwib3BlblwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJub25lXCI6XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPSB2YWx1ZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJ3aWRlXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcIm5hcnJvd1wiOiBoID0gdmFsdWVzW2ldOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwibG9uZ1wiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJzaG9ydFwiOiB3ID0gdmFsdWVzW2ldOyBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgc3Ryb2tlID0gby5ub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic3Ryb2tlXCIpWzBdO1xuICAgICAgICBzdHJva2Vbc2UgKyBcImFycm93XCJdID0gdHlwZTtcbiAgICAgICAgc3Ryb2tlW3NlICsgXCJhcnJvd2xlbmd0aFwiXSA9IHc7XG4gICAgICAgIHN0cm9rZVtzZSArIFwiYXJyb3d3aWR0aFwiXSA9IGg7XG4gICAgfSxcbiAgICBzZXRGaWxsQW5kU3Ryb2tlID0gZnVuY3Rpb24gKG8sIHBhcmFtcykge1xuICAgICAgICAvLyBvLnBhcGVyLmNhbnZhcy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIG8uYXR0cnMgPSBvLmF0dHJzIHx8IHt9O1xuICAgICAgICB2YXIgbm9kZSA9IG8ubm9kZSxcbiAgICAgICAgICAgIGEgPSBvLmF0dHJzLFxuICAgICAgICAgICAgcyA9IG5vZGUuc3R5bGUsXG4gICAgICAgICAgICB4eSxcbiAgICAgICAgICAgIG5ld3BhdGggPSBwYXRoVHlwZXNbby50eXBlXSAmJiAocGFyYW1zLnggIT0gYS54IHx8IHBhcmFtcy55ICE9IGEueSB8fCBwYXJhbXMud2lkdGggIT0gYS53aWR0aCB8fCBwYXJhbXMuaGVpZ2h0ICE9IGEuaGVpZ2h0IHx8IHBhcmFtcy5jeCAhPSBhLmN4IHx8IHBhcmFtcy5jeSAhPSBhLmN5IHx8IHBhcmFtcy5yeCAhPSBhLnJ4IHx8IHBhcmFtcy5yeSAhPSBhLnJ5IHx8IHBhcmFtcy5yICE9IGEuciksXG4gICAgICAgICAgICBpc092YWwgPSBvdmFsVHlwZXNbby50eXBlXSAmJiAoYS5jeCAhPSBwYXJhbXMuY3ggfHwgYS5jeSAhPSBwYXJhbXMuY3kgfHwgYS5yICE9IHBhcmFtcy5yIHx8IGEucnggIT0gcGFyYW1zLnJ4IHx8IGEucnkgIT0gcGFyYW1zLnJ5KSxcbiAgICAgICAgICAgIHJlcyA9IG87XG5cblxuICAgICAgICBmb3IgKHZhciBwYXIgaW4gcGFyYW1zKSBpZiAocGFyYW1zW2hhc10ocGFyKSkge1xuICAgICAgICAgICAgYVtwYXJdID0gcGFyYW1zW3Bhcl07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5ld3BhdGgpIHtcbiAgICAgICAgICAgIGEucGF0aCA9IFIuX2dldFBhdGhbby50eXBlXShvKTtcbiAgICAgICAgICAgIG8uXy5kaXJ0eSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcGFyYW1zLmhyZWYgJiYgKG5vZGUuaHJlZiA9IHBhcmFtcy5ocmVmKTtcbiAgICAgICAgcGFyYW1zLnRpdGxlICYmIChub2RlLnRpdGxlID0gcGFyYW1zLnRpdGxlKTtcbiAgICAgICAgcGFyYW1zLnRhcmdldCAmJiAobm9kZS50YXJnZXQgPSBwYXJhbXMudGFyZ2V0KTtcbiAgICAgICAgcGFyYW1zLmN1cnNvciAmJiAocy5jdXJzb3IgPSBwYXJhbXMuY3Vyc29yKTtcbiAgICAgICAgXCJibHVyXCIgaW4gcGFyYW1zICYmIG8uYmx1cihwYXJhbXMuYmx1cik7XG4gICAgICAgIGlmIChwYXJhbXMucGF0aCAmJiBvLnR5cGUgPT0gXCJwYXRoXCIgfHwgbmV3cGF0aCkge1xuICAgICAgICAgICAgbm9kZS5wYXRoID0gcGF0aDJ2bWwoflN0cihhLnBhdGgpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihcInJcIikgPyBSLl9wYXRoVG9BYnNvbHV0ZShhLnBhdGgpIDogYS5wYXRoKTtcbiAgICAgICAgICAgIGlmIChvLnR5cGUgPT0gXCJpbWFnZVwiKSB7XG4gICAgICAgICAgICAgICAgby5fLmZpbGxwb3MgPSBbYS54LCBhLnldO1xuICAgICAgICAgICAgICAgIG8uXy5maWxsc2l6ZSA9IFthLndpZHRoLCBhLmhlaWdodF07XG4gICAgICAgICAgICAgICAgc2V0Q29vcmRzKG8sIDEsIDEsIDAsIDAsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFwidHJhbnNmb3JtXCIgaW4gcGFyYW1zICYmIG8udHJhbnNmb3JtKHBhcmFtcy50cmFuc2Zvcm0pO1xuICAgICAgICBpZiAoaXNPdmFsKSB7XG4gICAgICAgICAgICB2YXIgY3ggPSArYS5jeCxcbiAgICAgICAgICAgICAgICBjeSA9ICthLmN5LFxuICAgICAgICAgICAgICAgIHJ4ID0gK2EucnggfHwgK2EuciB8fCAwLFxuICAgICAgICAgICAgICAgIHJ5ID0gK2EucnkgfHwgK2EuciB8fCAwO1xuICAgICAgICAgICAgbm9kZS5wYXRoID0gUi5mb3JtYXQoXCJhcnswfSx7MX0sezJ9LHszfSx7NH0sezF9LHs0fSx7MX14XCIsIHJvdW5kKChjeCAtIHJ4KSAqIHpvb20pLCByb3VuZCgoY3kgLSByeSkgKiB6b29tKSwgcm91bmQoKGN4ICsgcngpICogem9vbSksIHJvdW5kKChjeSArIHJ5KSAqIHpvb20pLCByb3VuZChjeCAqIHpvb20pKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXCJjbGlwLXJlY3RcIiBpbiBwYXJhbXMpIHtcbiAgICAgICAgICAgIHZhciByZWN0ID0gU3RyKHBhcmFtc1tcImNsaXAtcmVjdFwiXSkuc3BsaXQoc2VwYXJhdG9yKTtcbiAgICAgICAgICAgIGlmIChyZWN0Lmxlbmd0aCA9PSA0KSB7XG4gICAgICAgICAgICAgICAgcmVjdFsyXSA9ICtyZWN0WzJdICsgKCtyZWN0WzBdKTtcbiAgICAgICAgICAgICAgICByZWN0WzNdID0gK3JlY3RbM10gKyAoK3JlY3RbMV0pO1xuICAgICAgICAgICAgICAgIHZhciBkaXYgPSBub2RlLmNsaXBSZWN0IHx8IFIuX2cuZG9jLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksXG4gICAgICAgICAgICAgICAgICAgIGRzdHlsZSA9IGRpdi5zdHlsZTtcbiAgICAgICAgICAgICAgICBkc3R5bGUuY2xpcCA9IFIuZm9ybWF0KFwicmVjdCh7MX1weCB7Mn1weCB7M31weCB7MH1weClcIiwgcmVjdCk7XG4gICAgICAgICAgICAgICAgaWYgKCFub2RlLmNsaXBSZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGRzdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICAgICAgICAgICAgICAgICAgZHN0eWxlLnRvcCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGRzdHlsZS5sZWZ0ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZHN0eWxlLndpZHRoID0gby5wYXBlci53aWR0aCArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgZHN0eWxlLmhlaWdodCA9IG8ucGFwZXIuaGVpZ2h0ICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICBub2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGRpdiwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5jbGlwUmVjdCA9IGRpdjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXBhcmFtc1tcImNsaXAtcmVjdFwiXSkge1xuICAgICAgICAgICAgICAgIG5vZGUuY2xpcFJlY3QgJiYgKG5vZGUuY2xpcFJlY3Quc3R5bGUuY2xpcCA9IFwiYXV0b1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoby50ZXh0cGF0aCkge1xuICAgICAgICAgICAgdmFyIHRleHRwYXRoU3R5bGUgPSBvLnRleHRwYXRoLnN0eWxlO1xuICAgICAgICAgICAgcGFyYW1zLmZvbnQgJiYgKHRleHRwYXRoU3R5bGUuZm9udCA9IHBhcmFtcy5mb250KTtcbiAgICAgICAgICAgIHBhcmFtc1tcImZvbnQtZmFtaWx5XCJdICYmICh0ZXh0cGF0aFN0eWxlLmZvbnRGYW1pbHkgPSAnXCInICsgcGFyYW1zW1wiZm9udC1mYW1pbHlcIl0uc3BsaXQoXCIsXCIpWzBdLnJlcGxhY2UoL15bJ1wiXSt8WydcIl0rJC9nLCBFKSArICdcIicpO1xuICAgICAgICAgICAgcGFyYW1zW1wiZm9udC1zaXplXCJdICYmICh0ZXh0cGF0aFN0eWxlLmZvbnRTaXplID0gcGFyYW1zW1wiZm9udC1zaXplXCJdKTtcbiAgICAgICAgICAgIHBhcmFtc1tcImZvbnQtd2VpZ2h0XCJdICYmICh0ZXh0cGF0aFN0eWxlLmZvbnRXZWlnaHQgPSBwYXJhbXNbXCJmb250LXdlaWdodFwiXSk7XG4gICAgICAgICAgICBwYXJhbXNbXCJmb250LXN0eWxlXCJdICYmICh0ZXh0cGF0aFN0eWxlLmZvbnRTdHlsZSA9IHBhcmFtc1tcImZvbnQtc3R5bGVcIl0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChcImFycm93LXN0YXJ0XCIgaW4gcGFyYW1zKSB7XG4gICAgICAgICAgICBhZGRBcnJvdyhyZXMsIHBhcmFtc1tcImFycm93LXN0YXJ0XCJdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXCJhcnJvdy1lbmRcIiBpbiBwYXJhbXMpIHtcbiAgICAgICAgICAgIGFkZEFycm93KHJlcywgcGFyYW1zW1wiYXJyb3ctZW5kXCJdLCAxKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyYW1zLm9wYWNpdHkgIT0gbnVsbCB8fCBcbiAgICAgICAgICAgIHBhcmFtc1tcInN0cm9rZS13aWR0aFwiXSAhPSBudWxsIHx8XG4gICAgICAgICAgICBwYXJhbXMuZmlsbCAhPSBudWxsIHx8XG4gICAgICAgICAgICBwYXJhbXMuc3JjICE9IG51bGwgfHxcbiAgICAgICAgICAgIHBhcmFtcy5zdHJva2UgIT0gbnVsbCB8fFxuICAgICAgICAgICAgcGFyYW1zW1wic3Ryb2tlLXdpZHRoXCJdICE9IG51bGwgfHxcbiAgICAgICAgICAgIHBhcmFtc1tcInN0cm9rZS1vcGFjaXR5XCJdICE9IG51bGwgfHxcbiAgICAgICAgICAgIHBhcmFtc1tcImZpbGwtb3BhY2l0eVwiXSAhPSBudWxsIHx8XG4gICAgICAgICAgICBwYXJhbXNbXCJzdHJva2UtZGFzaGFycmF5XCJdICE9IG51bGwgfHxcbiAgICAgICAgICAgIHBhcmFtc1tcInN0cm9rZS1taXRlcmxpbWl0XCJdICE9IG51bGwgfHxcbiAgICAgICAgICAgIHBhcmFtc1tcInN0cm9rZS1saW5lam9pblwiXSAhPSBudWxsIHx8XG4gICAgICAgICAgICBwYXJhbXNbXCJzdHJva2UtbGluZWNhcFwiXSAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgZmlsbCA9IG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoZmlsbFN0cmluZyksXG4gICAgICAgICAgICAgICAgbmV3ZmlsbCA9IGZhbHNlO1xuICAgICAgICAgICAgZmlsbCA9IGZpbGwgJiYgZmlsbFswXTtcbiAgICAgICAgICAgICFmaWxsICYmIChuZXdmaWxsID0gZmlsbCA9IGNyZWF0ZU5vZGUoZmlsbFN0cmluZykpO1xuICAgICAgICAgICAgaWYgKG8udHlwZSA9PSBcImltYWdlXCIgJiYgcGFyYW1zLnNyYykge1xuICAgICAgICAgICAgICAgIGZpbGwuc3JjID0gcGFyYW1zLnNyYztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcmFtcy5maWxsICYmIChmaWxsLm9uID0gdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoZmlsbC5vbiA9PSBudWxsIHx8IHBhcmFtcy5maWxsID09IFwibm9uZVwiIHx8IHBhcmFtcy5maWxsID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZmlsbC5vbiA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZpbGwub24gJiYgcGFyYW1zLmZpbGwpIHtcbiAgICAgICAgICAgICAgICB2YXIgaXNVUkwgPSBTdHIocGFyYW1zLmZpbGwpLm1hdGNoKFIuX0lTVVJMKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNVUkwpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsbC5wYXJlbnROb2RlID09IG5vZGUgJiYgbm9kZS5yZW1vdmVDaGlsZChmaWxsKTtcbiAgICAgICAgICAgICAgICAgICAgZmlsbC5yb3RhdGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBmaWxsLnNyYyA9IGlzVVJMWzFdO1xuICAgICAgICAgICAgICAgICAgICBmaWxsLnR5cGUgPSBcInRpbGVcIjtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJib3ggPSBvLmdldEJCb3goMSk7XG4gICAgICAgICAgICAgICAgICAgIGZpbGwucG9zaXRpb24gPSBiYm94LnggKyBTICsgYmJveC55O1xuICAgICAgICAgICAgICAgICAgICBvLl8uZmlsbHBvcyA9IFtiYm94LngsIGJib3gueV07XG5cbiAgICAgICAgICAgICAgICAgICAgUi5fcHJlbG9hZChpc1VSTFsxXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgby5fLmZpbGxzaXplID0gW3RoaXMub2Zmc2V0V2lkdGgsIHRoaXMub2Zmc2V0SGVpZ2h0XTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsbC5jb2xvciA9IFIuZ2V0UkdCKHBhcmFtcy5maWxsKS5oZXg7XG4gICAgICAgICAgICAgICAgICAgIGZpbGwuc3JjID0gRTtcbiAgICAgICAgICAgICAgICAgICAgZmlsbC50eXBlID0gXCJzb2xpZFwiO1xuICAgICAgICAgICAgICAgICAgICBpZiAoUi5nZXRSR0IocGFyYW1zLmZpbGwpLmVycm9yICYmIChyZXMudHlwZSBpbiB7Y2lyY2xlOiAxLCBlbGxpcHNlOiAxfSB8fCBTdHIocGFyYW1zLmZpbGwpLmNoYXJBdCgpICE9IFwiclwiKSAmJiBhZGRHcmFkaWVudEZpbGwocmVzLCBwYXJhbXMuZmlsbCwgZmlsbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGEuZmlsbCA9IFwibm9uZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYS5ncmFkaWVudCA9IHBhcmFtcy5maWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbC5yb3RhdGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChcImZpbGwtb3BhY2l0eVwiIGluIHBhcmFtcyB8fCBcIm9wYWNpdHlcIiBpbiBwYXJhbXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgb3BhY2l0eSA9ICgoK2FbXCJmaWxsLW9wYWNpdHlcIl0gKyAxIHx8IDIpIC0gMSkgKiAoKCthLm9wYWNpdHkgKyAxIHx8IDIpIC0gMSkgKiAoKCtSLmdldFJHQihwYXJhbXMuZmlsbCkubyArIDEgfHwgMikgLSAxKTtcbiAgICAgICAgICAgICAgICBvcGFjaXR5ID0gbW1pbihtbWF4KG9wYWNpdHksIDApLCAxKTtcbiAgICAgICAgICAgICAgICBmaWxsLm9wYWNpdHkgPSBvcGFjaXR5O1xuICAgICAgICAgICAgICAgIGlmIChmaWxsLnNyYykge1xuICAgICAgICAgICAgICAgICAgICBmaWxsLmNvbG9yID0gXCJub25lXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZChmaWxsKTtcbiAgICAgICAgICAgIHZhciBzdHJva2UgPSAobm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInN0cm9rZVwiKSAmJiBub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic3Ryb2tlXCIpWzBdKSxcbiAgICAgICAgICAgIG5ld3N0cm9rZSA9IGZhbHNlO1xuICAgICAgICAgICAgIXN0cm9rZSAmJiAobmV3c3Ryb2tlID0gc3Ryb2tlID0gY3JlYXRlTm9kZShcInN0cm9rZVwiKSk7XG4gICAgICAgICAgICBpZiAoKHBhcmFtcy5zdHJva2UgJiYgcGFyYW1zLnN0cm9rZSAhPSBcIm5vbmVcIikgfHxcbiAgICAgICAgICAgICAgICBwYXJhbXNbXCJzdHJva2Utd2lkdGhcIl0gfHxcbiAgICAgICAgICAgICAgICBwYXJhbXNbXCJzdHJva2Utb3BhY2l0eVwiXSAhPSBudWxsIHx8XG4gICAgICAgICAgICAgICAgcGFyYW1zW1wic3Ryb2tlLWRhc2hhcnJheVwiXSB8fFxuICAgICAgICAgICAgICAgIHBhcmFtc1tcInN0cm9rZS1taXRlcmxpbWl0XCJdIHx8XG4gICAgICAgICAgICAgICAgcGFyYW1zW1wic3Ryb2tlLWxpbmVqb2luXCJdIHx8XG4gICAgICAgICAgICAgICAgcGFyYW1zW1wic3Ryb2tlLWxpbmVjYXBcIl0pIHtcbiAgICAgICAgICAgICAgICBzdHJva2Uub24gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgKHBhcmFtcy5zdHJva2UgPT0gXCJub25lXCIgfHwgcGFyYW1zLnN0cm9rZSA9PT0gbnVsbCB8fCBzdHJva2Uub24gPT0gbnVsbCB8fCBwYXJhbXMuc3Ryb2tlID09IDAgfHwgcGFyYW1zW1wic3Ryb2tlLXdpZHRoXCJdID09IDApICYmIChzdHJva2Uub24gPSBmYWxzZSk7XG4gICAgICAgICAgICB2YXIgc3Ryb2tlQ29sb3IgPSBSLmdldFJHQihwYXJhbXMuc3Ryb2tlKTtcbiAgICAgICAgICAgIHN0cm9rZS5vbiAmJiBwYXJhbXMuc3Ryb2tlICYmIChzdHJva2UuY29sb3IgPSBzdHJva2VDb2xvci5oZXgpO1xuICAgICAgICAgICAgb3BhY2l0eSA9ICgoK2FbXCJzdHJva2Utb3BhY2l0eVwiXSArIDEgfHwgMikgLSAxKSAqICgoK2Eub3BhY2l0eSArIDEgfHwgMikgLSAxKSAqICgoK3N0cm9rZUNvbG9yLm8gKyAxIHx8IDIpIC0gMSk7XG4gICAgICAgICAgICB2YXIgd2lkdGggPSAodG9GbG9hdChwYXJhbXNbXCJzdHJva2Utd2lkdGhcIl0pIHx8IDEpICogLjc1O1xuICAgICAgICAgICAgb3BhY2l0eSA9IG1taW4obW1heChvcGFjaXR5LCAwKSwgMSk7XG4gICAgICAgICAgICBwYXJhbXNbXCJzdHJva2Utd2lkdGhcIl0gPT0gbnVsbCAmJiAod2lkdGggPSBhW1wic3Ryb2tlLXdpZHRoXCJdKTtcbiAgICAgICAgICAgIHBhcmFtc1tcInN0cm9rZS13aWR0aFwiXSAmJiAoc3Ryb2tlLndlaWdodCA9IHdpZHRoKTtcbiAgICAgICAgICAgIHdpZHRoICYmIHdpZHRoIDwgMSAmJiAob3BhY2l0eSAqPSB3aWR0aCkgJiYgKHN0cm9rZS53ZWlnaHQgPSAxKTtcbiAgICAgICAgICAgIHN0cm9rZS5vcGFjaXR5ID0gb3BhY2l0eTtcbiAgICAgICAgXG4gICAgICAgICAgICBwYXJhbXNbXCJzdHJva2UtbGluZWpvaW5cIl0gJiYgKHN0cm9rZS5qb2luc3R5bGUgPSBwYXJhbXNbXCJzdHJva2UtbGluZWpvaW5cIl0gfHwgXCJtaXRlclwiKTtcbiAgICAgICAgICAgIHN0cm9rZS5taXRlcmxpbWl0ID0gcGFyYW1zW1wic3Ryb2tlLW1pdGVybGltaXRcIl0gfHwgODtcbiAgICAgICAgICAgIHBhcmFtc1tcInN0cm9rZS1saW5lY2FwXCJdICYmIChzdHJva2UuZW5kY2FwID0gcGFyYW1zW1wic3Ryb2tlLWxpbmVjYXBcIl0gPT0gXCJidXR0XCIgPyBcImZsYXRcIiA6IHBhcmFtc1tcInN0cm9rZS1saW5lY2FwXCJdID09IFwic3F1YXJlXCIgPyBcInNxdWFyZVwiIDogXCJyb3VuZFwiKTtcbiAgICAgICAgICAgIGlmIChwYXJhbXNbXCJzdHJva2UtZGFzaGFycmF5XCJdKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhc2hhcnJheSA9IHtcbiAgICAgICAgICAgICAgICAgICAgXCItXCI6IFwic2hvcnRkYXNoXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiLlwiOiBcInNob3J0ZG90XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiLS5cIjogXCJzaG9ydGRhc2hkb3RcIixcbiAgICAgICAgICAgICAgICAgICAgXCItLi5cIjogXCJzaG9ydGRhc2hkb3Rkb3RcIixcbiAgICAgICAgICAgICAgICAgICAgXCIuIFwiOiBcImRvdFwiLFxuICAgICAgICAgICAgICAgICAgICBcIi0gXCI6IFwiZGFzaFwiLFxuICAgICAgICAgICAgICAgICAgICBcIi0tXCI6IFwibG9uZ2Rhc2hcIixcbiAgICAgICAgICAgICAgICAgICAgXCItIC5cIjogXCJkYXNoZG90XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiLS0uXCI6IFwibG9uZ2Rhc2hkb3RcIixcbiAgICAgICAgICAgICAgICAgICAgXCItLS4uXCI6IFwibG9uZ2Rhc2hkb3Rkb3RcIlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgc3Ryb2tlLmRhc2hzdHlsZSA9IGRhc2hhcnJheVtoYXNdKHBhcmFtc1tcInN0cm9rZS1kYXNoYXJyYXlcIl0pID8gZGFzaGFycmF5W3BhcmFtc1tcInN0cm9rZS1kYXNoYXJyYXlcIl1dIDogRTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld3N0cm9rZSAmJiBub2RlLmFwcGVuZENoaWxkKHN0cm9rZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlcy50eXBlID09IFwidGV4dFwiKSB7XG4gICAgICAgICAgICByZXMucGFwZXIuY2FudmFzLnN0eWxlLmRpc3BsYXkgPSBFO1xuICAgICAgICAgICAgdmFyIHNwYW4gPSByZXMucGFwZXIuc3BhbixcbiAgICAgICAgICAgICAgICBtID0gMTAwLFxuICAgICAgICAgICAgICAgIGZvbnRTaXplID0gYS5mb250ICYmIGEuZm9udC5tYXRjaCgvXFxkKyg/OlxcLlxcZCopPyg/PXB4KS8pO1xuICAgICAgICAgICAgcyA9IHNwYW4uc3R5bGU7XG4gICAgICAgICAgICBhLmZvbnQgJiYgKHMuZm9udCA9IGEuZm9udCk7XG4gICAgICAgICAgICBhW1wiZm9udC1mYW1pbHlcIl0gJiYgKHMuZm9udEZhbWlseSA9IGFbXCJmb250LWZhbWlseVwiXSk7XG4gICAgICAgICAgICBhW1wiZm9udC13ZWlnaHRcIl0gJiYgKHMuZm9udFdlaWdodCA9IGFbXCJmb250LXdlaWdodFwiXSk7XG4gICAgICAgICAgICBhW1wiZm9udC1zdHlsZVwiXSAmJiAocy5mb250U3R5bGUgPSBhW1wiZm9udC1zdHlsZVwiXSk7XG4gICAgICAgICAgICBmb250U2l6ZSA9IHRvRmxvYXQoYVtcImZvbnQtc2l6ZVwiXSB8fCBmb250U2l6ZSAmJiBmb250U2l6ZVswXSkgfHwgMTA7XG4gICAgICAgICAgICBzLmZvbnRTaXplID0gZm9udFNpemUgKiBtICsgXCJweFwiO1xuICAgICAgICAgICAgcmVzLnRleHRwYXRoLnN0cmluZyAmJiAoc3Bhbi5pbm5lckhUTUwgPSBTdHIocmVzLnRleHRwYXRoLnN0cmluZykucmVwbGFjZSgvPC9nLCBcIiYjNjA7XCIpLnJlcGxhY2UoLyYvZywgXCImIzM4O1wiKS5yZXBsYWNlKC9cXG4vZywgXCI8YnI+XCIpKTtcbiAgICAgICAgICAgIHZhciBicmVjdCA9IHNwYW4uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICByZXMuVyA9IGEudyA9IChicmVjdC5yaWdodCAtIGJyZWN0LmxlZnQpIC8gbTtcbiAgICAgICAgICAgIHJlcy5IID0gYS5oID0gKGJyZWN0LmJvdHRvbSAtIGJyZWN0LnRvcCkgLyBtO1xuICAgICAgICAgICAgLy8gcmVzLnBhcGVyLmNhbnZhcy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICByZXMuWCA9IGEueDtcbiAgICAgICAgICAgIHJlcy5ZID0gYS55ICsgcmVzLkggLyAyO1xuXG4gICAgICAgICAgICAoXCJ4XCIgaW4gcGFyYW1zIHx8IFwieVwiIGluIHBhcmFtcykgJiYgKHJlcy5wYXRoLnYgPSBSLmZvcm1hdChcIm17MH0sezF9bHsyfSx7MX1cIiwgcm91bmQoYS54ICogem9vbSksIHJvdW5kKGEueSAqIHpvb20pLCByb3VuZChhLnggKiB6b29tKSArIDEpKTtcbiAgICAgICAgICAgIHZhciBkaXJ0eWF0dHJzID0gW1wieFwiLCBcInlcIiwgXCJ0ZXh0XCIsIFwiZm9udFwiLCBcImZvbnQtZmFtaWx5XCIsIFwiZm9udC13ZWlnaHRcIiwgXCJmb250LXN0eWxlXCIsIFwiZm9udC1zaXplXCJdO1xuICAgICAgICAgICAgZm9yICh2YXIgZCA9IDAsIGRkID0gZGlydHlhdHRycy5sZW5ndGg7IGQgPCBkZDsgZCsrKSBpZiAoZGlydHlhdHRyc1tkXSBpbiBwYXJhbXMpIHtcbiAgICAgICAgICAgICAgICByZXMuXy5kaXJ0eSA9IDE7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAgICAgLy8gdGV4dC1hbmNob3IgZW11bGF0aW9uXG4gICAgICAgICAgICBzd2l0Y2ggKGFbXCJ0ZXh0LWFuY2hvclwiXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJzdGFydFwiOlxuICAgICAgICAgICAgICAgICAgICByZXMudGV4dHBhdGguc3R5bGVbXCJ2LXRleHQtYWxpZ25cIl0gPSBcImxlZnRcIjtcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJieCA9IHJlcy5XIC8gMjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgICAgICAgICAgICAgIHJlcy50ZXh0cGF0aC5zdHlsZVtcInYtdGV4dC1hbGlnblwiXSA9IFwicmlnaHRcIjtcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJieCA9IC1yZXMuVyAvIDI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmVzLnRleHRwYXRoLnN0eWxlW1widi10ZXh0LWFsaWduXCJdID0gXCJjZW50ZXJcIjtcbiAgICAgICAgICAgICAgICAgICAgcmVzLmJieCA9IDA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXMudGV4dHBhdGguc3R5bGVbXCJ2LXRleHQta2VyblwiXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVzLnBhcGVyLmNhbnZhcy5zdHlsZS5kaXNwbGF5ID0gRTtcbiAgICB9LFxuICAgIGFkZEdyYWRpZW50RmlsbCA9IGZ1bmN0aW9uIChvLCBncmFkaWVudCwgZmlsbCkge1xuICAgICAgICBvLmF0dHJzID0gby5hdHRycyB8fCB7fTtcbiAgICAgICAgdmFyIGF0dHJzID0gby5hdHRycyxcbiAgICAgICAgICAgIHBvdyA9IE1hdGgucG93LFxuICAgICAgICAgICAgb3BhY2l0eSxcbiAgICAgICAgICAgIG9pbmRleCxcbiAgICAgICAgICAgIHR5cGUgPSBcImxpbmVhclwiLFxuICAgICAgICAgICAgZnhmeSA9IFwiLjUgLjVcIjtcbiAgICAgICAgby5hdHRycy5ncmFkaWVudCA9IGdyYWRpZW50O1xuICAgICAgICBncmFkaWVudCA9IFN0cihncmFkaWVudCkucmVwbGFjZShSLl9yYWRpYWxfZ3JhZGllbnQsIGZ1bmN0aW9uIChhbGwsIGZ4LCBmeSkge1xuICAgICAgICAgICAgdHlwZSA9IFwicmFkaWFsXCI7XG4gICAgICAgICAgICBpZiAoZnggJiYgZnkpIHtcbiAgICAgICAgICAgICAgICBmeCA9IHRvRmxvYXQoZngpO1xuICAgICAgICAgICAgICAgIGZ5ID0gdG9GbG9hdChmeSk7XG4gICAgICAgICAgICAgICAgcG93KGZ4IC0gLjUsIDIpICsgcG93KGZ5IC0gLjUsIDIpID4gLjI1ICYmIChmeSA9IG1hdGguc3FydCguMjUgLSBwb3coZnggLSAuNSwgMikpICogKChmeSA+IC41KSAqIDIgLSAxKSArIC41KTtcbiAgICAgICAgICAgICAgICBmeGZ5ID0gZnggKyBTICsgZnk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gRTtcbiAgICAgICAgfSk7XG4gICAgICAgIGdyYWRpZW50ID0gZ3JhZGllbnQuc3BsaXQoL1xccypcXC1cXHMqLyk7XG4gICAgICAgIGlmICh0eXBlID09IFwibGluZWFyXCIpIHtcbiAgICAgICAgICAgIHZhciBhbmdsZSA9IGdyYWRpZW50LnNoaWZ0KCk7XG4gICAgICAgICAgICBhbmdsZSA9IC10b0Zsb2F0KGFuZ2xlKTtcbiAgICAgICAgICAgIGlmIChpc05hTihhbmdsZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZG90cyA9IFIuX3BhcnNlRG90cyhncmFkaWVudCk7XG4gICAgICAgIGlmICghZG90cykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbyA9IG8uc2hhcGUgfHwgby5ub2RlO1xuICAgICAgICBpZiAoZG90cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIG8ucmVtb3ZlQ2hpbGQoZmlsbCk7XG4gICAgICAgICAgICBmaWxsLm9uID0gdHJ1ZTtcbiAgICAgICAgICAgIGZpbGwubWV0aG9kID0gXCJub25lXCI7XG4gICAgICAgICAgICBmaWxsLmNvbG9yID0gZG90c1swXS5jb2xvcjtcbiAgICAgICAgICAgIGZpbGwuY29sb3IyID0gZG90c1tkb3RzLmxlbmd0aCAtIDFdLmNvbG9yO1xuICAgICAgICAgICAgdmFyIGNscnMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IGRvdHMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIGRvdHNbaV0ub2Zmc2V0ICYmIGNscnMucHVzaChkb3RzW2ldLm9mZnNldCArIFMgKyBkb3RzW2ldLmNvbG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbGwuY29sb3JzID0gY2xycy5sZW5ndGggPyBjbHJzLmpvaW4oKSA6IFwiMCUgXCIgKyBmaWxsLmNvbG9yO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT0gXCJyYWRpYWxcIikge1xuICAgICAgICAgICAgICAgIGZpbGwudHlwZSA9IFwiZ3JhZGllbnRUaXRsZVwiO1xuICAgICAgICAgICAgICAgIGZpbGwuZm9jdXMgPSBcIjEwMCVcIjtcbiAgICAgICAgICAgICAgICBmaWxsLmZvY3Vzc2l6ZSA9IFwiMCAwXCI7XG4gICAgICAgICAgICAgICAgZmlsbC5mb2N1c3Bvc2l0aW9uID0gZnhmeTtcbiAgICAgICAgICAgICAgICBmaWxsLmFuZ2xlID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gZmlsbC5yb3RhdGU9IHRydWU7XG4gICAgICAgICAgICAgICAgZmlsbC50eXBlID0gXCJncmFkaWVudFwiO1xuICAgICAgICAgICAgICAgIGZpbGwuYW5nbGUgPSAoMjcwIC0gYW5nbGUpICUgMzYwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgby5hcHBlbmRDaGlsZChmaWxsKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMTtcbiAgICB9LFxuICAgIEVsZW1lbnQgPSBmdW5jdGlvbiAobm9kZSwgdm1sKSB7XG4gICAgICAgIHRoaXNbMF0gPSB0aGlzLm5vZGUgPSBub2RlO1xuICAgICAgICBub2RlLnJhcGhhZWwgPSB0cnVlO1xuICAgICAgICB0aGlzLmlkID0gUi5fb2lkKys7XG4gICAgICAgIG5vZGUucmFwaGFlbGlkID0gdGhpcy5pZDtcbiAgICAgICAgdGhpcy5YID0gMDtcbiAgICAgICAgdGhpcy5ZID0gMDtcbiAgICAgICAgdGhpcy5hdHRycyA9IHt9O1xuICAgICAgICB0aGlzLnBhcGVyID0gdm1sO1xuICAgICAgICB0aGlzLm1hdHJpeCA9IFIubWF0cml4KCk7XG4gICAgICAgIHRoaXMuXyA9IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogW10sXG4gICAgICAgICAgICBzeDogMSxcbiAgICAgICAgICAgIHN5OiAxLFxuICAgICAgICAgICAgZHg6IDAsXG4gICAgICAgICAgICBkeTogMCxcbiAgICAgICAgICAgIGRlZzogMCxcbiAgICAgICAgICAgIGRpcnR5OiAxLFxuICAgICAgICAgICAgZGlydHlUOiAxXG4gICAgICAgIH07XG4gICAgICAgICF2bWwuYm90dG9tICYmICh2bWwuYm90dG9tID0gdGhpcyk7XG4gICAgICAgIHRoaXMucHJldiA9IHZtbC50b3A7XG4gICAgICAgIHZtbC50b3AgJiYgKHZtbC50b3AubmV4dCA9IHRoaXMpO1xuICAgICAgICB2bWwudG9wID0gdGhpcztcbiAgICAgICAgdGhpcy5uZXh0ID0gbnVsbDtcbiAgICB9O1xuICAgIHZhciBlbHByb3RvID0gUi5lbDtcblxuICAgIEVsZW1lbnQucHJvdG90eXBlID0gZWxwcm90bztcbiAgICBlbHByb3RvLmNvbnN0cnVjdG9yID0gRWxlbWVudDtcbiAgICBlbHByb3RvLnRyYW5zZm9ybSA9IGZ1bmN0aW9uICh0c3RyKSB7XG4gICAgICAgIGlmICh0c3RyID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl8udHJhbnNmb3JtO1xuICAgICAgICB9XG4gICAgICAgIHZhciB2YnMgPSB0aGlzLnBhcGVyLl92aWV3Qm94U2hpZnQsXG4gICAgICAgICAgICB2YnQgPSB2YnMgPyBcInNcIiArIFt2YnMuc2NhbGUsIHZicy5zY2FsZV0gKyBcIi0xLTF0XCIgKyBbdmJzLmR4LCB2YnMuZHldIDogRSxcbiAgICAgICAgICAgIG9sZHQ7XG4gICAgICAgIGlmICh2YnMpIHtcbiAgICAgICAgICAgIG9sZHQgPSB0c3RyID0gU3RyKHRzdHIpLnJlcGxhY2UoL1xcLnszfXxcXHUyMDI2L2csIHRoaXMuXy50cmFuc2Zvcm0gfHwgRSk7XG4gICAgICAgIH1cbiAgICAgICAgUi5fZXh0cmFjdFRyYW5zZm9ybSh0aGlzLCB2YnQgKyB0c3RyKTtcbiAgICAgICAgdmFyIG1hdHJpeCA9IHRoaXMubWF0cml4LmNsb25lKCksXG4gICAgICAgICAgICBza2V3ID0gdGhpcy5za2V3LFxuICAgICAgICAgICAgbyA9IHRoaXMubm9kZSxcbiAgICAgICAgICAgIHNwbGl0LFxuICAgICAgICAgICAgaXNHcmFkID0gflN0cih0aGlzLmF0dHJzLmZpbGwpLmluZGV4T2YoXCItXCIpLFxuICAgICAgICAgICAgaXNQYXR0ID0gIVN0cih0aGlzLmF0dHJzLmZpbGwpLmluZGV4T2YoXCJ1cmwoXCIpO1xuICAgICAgICBtYXRyaXgudHJhbnNsYXRlKC0uNSwgLS41KTtcbiAgICAgICAgaWYgKGlzUGF0dCB8fCBpc0dyYWQgfHwgdGhpcy50eXBlID09IFwiaW1hZ2VcIikge1xuICAgICAgICAgICAgc2tldy5tYXRyaXggPSBcIjEgMCAwIDFcIjtcbiAgICAgICAgICAgIHNrZXcub2Zmc2V0ID0gXCIwIDBcIjtcbiAgICAgICAgICAgIHNwbGl0ID0gbWF0cml4LnNwbGl0KCk7XG4gICAgICAgICAgICBpZiAoKGlzR3JhZCAmJiBzcGxpdC5ub1JvdGF0aW9uKSB8fCAhc3BsaXQuaXNTaW1wbGUpIHtcbiAgICAgICAgICAgICAgICBvLnN0eWxlLmZpbHRlciA9IG1hdHJpeC50b0ZpbHRlcigpO1xuICAgICAgICAgICAgICAgIHZhciBiYiA9IHRoaXMuZ2V0QkJveCgpLFxuICAgICAgICAgICAgICAgICAgICBiYnQgPSB0aGlzLmdldEJCb3goMSksXG4gICAgICAgICAgICAgICAgICAgIGR4ID0gYmIueCAtIGJidC54LFxuICAgICAgICAgICAgICAgICAgICBkeSA9IGJiLnkgLSBiYnQueTtcbiAgICAgICAgICAgICAgICBvLmNvb3Jkb3JpZ2luID0gKGR4ICogLXpvb20pICsgUyArIChkeSAqIC16b29tKTtcbiAgICAgICAgICAgICAgICBzZXRDb29yZHModGhpcywgMSwgMSwgZHgsIGR5LCAwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgby5zdHlsZS5maWx0ZXIgPSBFO1xuICAgICAgICAgICAgICAgIHNldENvb3Jkcyh0aGlzLCBzcGxpdC5zY2FsZXgsIHNwbGl0LnNjYWxleSwgc3BsaXQuZHgsIHNwbGl0LmR5LCBzcGxpdC5yb3RhdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgby5zdHlsZS5maWx0ZXIgPSBFO1xuICAgICAgICAgICAgc2tldy5tYXRyaXggPSBTdHIobWF0cml4KTtcbiAgICAgICAgICAgIHNrZXcub2Zmc2V0ID0gbWF0cml4Lm9mZnNldCgpO1xuICAgICAgICB9XG4gICAgICAgIG9sZHQgJiYgKHRoaXMuXy50cmFuc2Zvcm0gPSBvbGR0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBlbHByb3RvLnJvdGF0ZSA9IGZ1bmN0aW9uIChkZWcsIGN4LCBjeSkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVnID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkZWcgPSBTdHIoZGVnKS5zcGxpdChzZXBhcmF0b3IpO1xuICAgICAgICBpZiAoZGVnLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGN4ID0gdG9GbG9hdChkZWdbMV0pO1xuICAgICAgICAgICAgY3kgPSB0b0Zsb2F0KGRlZ1syXSk7XG4gICAgICAgIH1cbiAgICAgICAgZGVnID0gdG9GbG9hdChkZWdbMF0pO1xuICAgICAgICAoY3kgPT0gbnVsbCkgJiYgKGN4ID0gY3kpO1xuICAgICAgICBpZiAoY3ggPT0gbnVsbCB8fCBjeSA9PSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgYmJveCA9IHRoaXMuZ2V0QkJveCgxKTtcbiAgICAgICAgICAgIGN4ID0gYmJveC54ICsgYmJveC53aWR0aCAvIDI7XG4gICAgICAgICAgICBjeSA9IGJib3gueSArIGJib3guaGVpZ2h0IC8gMjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl8uZGlydHlUID0gMTtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm0odGhpcy5fLnRyYW5zZm9ybS5jb25jYXQoW1tcInJcIiwgZGVnLCBjeCwgY3ldXSkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIGVscHJvdG8udHJhbnNsYXRlID0gZnVuY3Rpb24gKGR4LCBkeSkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBkeCA9IFN0cihkeCkuc3BsaXQoc2VwYXJhdG9yKTtcbiAgICAgICAgaWYgKGR4Lmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGR5ID0gdG9GbG9hdChkeFsxXSk7XG4gICAgICAgIH1cbiAgICAgICAgZHggPSB0b0Zsb2F0KGR4WzBdKSB8fCAwO1xuICAgICAgICBkeSA9ICtkeSB8fCAwO1xuICAgICAgICBpZiAodGhpcy5fLmJib3gpIHtcbiAgICAgICAgICAgIHRoaXMuXy5iYm94LnggKz0gZHg7XG4gICAgICAgICAgICB0aGlzLl8uYmJveC55ICs9IGR5O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudHJhbnNmb3JtKHRoaXMuXy50cmFuc2Zvcm0uY29uY2F0KFtbXCJ0XCIsIGR4LCBkeV1dKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgZWxwcm90by5zY2FsZSA9IGZ1bmN0aW9uIChzeCwgc3ksIGN4LCBjeSkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBzeCA9IFN0cihzeCkuc3BsaXQoc2VwYXJhdG9yKTtcbiAgICAgICAgaWYgKHN4Lmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIHN5ID0gdG9GbG9hdChzeFsxXSk7XG4gICAgICAgICAgICBjeCA9IHRvRmxvYXQoc3hbMl0pO1xuICAgICAgICAgICAgY3kgPSB0b0Zsb2F0KHN4WzNdKTtcbiAgICAgICAgICAgIGlzTmFOKGN4KSAmJiAoY3ggPSBudWxsKTtcbiAgICAgICAgICAgIGlzTmFOKGN5KSAmJiAoY3kgPSBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBzeCA9IHRvRmxvYXQoc3hbMF0pO1xuICAgICAgICAoc3kgPT0gbnVsbCkgJiYgKHN5ID0gc3gpO1xuICAgICAgICAoY3kgPT0gbnVsbCkgJiYgKGN4ID0gY3kpO1xuICAgICAgICBpZiAoY3ggPT0gbnVsbCB8fCBjeSA9PSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgYmJveCA9IHRoaXMuZ2V0QkJveCgxKTtcbiAgICAgICAgfVxuICAgICAgICBjeCA9IGN4ID09IG51bGwgPyBiYm94LnggKyBiYm94LndpZHRoIC8gMiA6IGN4O1xuICAgICAgICBjeSA9IGN5ID09IG51bGwgPyBiYm94LnkgKyBiYm94LmhlaWdodCAvIDIgOiBjeTtcbiAgICBcbiAgICAgICAgdGhpcy50cmFuc2Zvcm0odGhpcy5fLnRyYW5zZm9ybS5jb25jYXQoW1tcInNcIiwgc3gsIHN5LCBjeCwgY3ldXSkpO1xuICAgICAgICB0aGlzLl8uZGlydHlUID0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBlbHByb3RvLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICF0aGlzLnJlbW92ZWQgJiYgKHRoaXMubm9kZS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIGVscHJvdG8uc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIXRoaXMucmVtb3ZlZCAmJiAodGhpcy5ub2RlLnN0eWxlLmRpc3BsYXkgPSBFKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBlbHByb3RvLl9nZXRCQm94ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHRoaXMuWCArICh0aGlzLmJieCB8fCAwKSAtIHRoaXMuVyAvIDIsXG4gICAgICAgICAgICB5OiB0aGlzLlkgLSB0aGlzLkgsXG4gICAgICAgICAgICB3aWR0aDogdGhpcy5XLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLkhcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIGVscHJvdG8ucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkIHx8ICF0aGlzLm5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGFwZXIuX19zZXRfXyAmJiB0aGlzLnBhcGVyLl9fc2V0X18uZXhjbHVkZSh0aGlzKTtcbiAgICAgICAgUi5ldmUudW5iaW5kKFwicmFwaGFlbC4qLiouXCIgKyB0aGlzLmlkKTtcbiAgICAgICAgUi5fdGVhcih0aGlzLCB0aGlzLnBhcGVyKTtcbiAgICAgICAgdGhpcy5ub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5ub2RlKTtcbiAgICAgICAgdGhpcy5zaGFwZSAmJiB0aGlzLnNoYXBlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5zaGFwZSk7XG4gICAgICAgIGZvciAodmFyIGkgaW4gdGhpcykge1xuICAgICAgICAgICAgdGhpc1tpXSA9IHR5cGVvZiB0aGlzW2ldID09IFwiZnVuY3Rpb25cIiA/IFIuX3JlbW92ZWRGYWN0b3J5KGkpIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlbW92ZWQgPSB0cnVlO1xuICAgIH07XG4gICAgZWxwcm90by5hdHRyID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lID09IG51bGwpIHtcbiAgICAgICAgICAgIHZhciByZXMgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGEgaW4gdGhpcy5hdHRycykgaWYgKHRoaXMuYXR0cnNbaGFzXShhKSkge1xuICAgICAgICAgICAgICAgIHJlc1thXSA9IHRoaXMuYXR0cnNbYV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXMuZ3JhZGllbnQgJiYgcmVzLmZpbGwgPT0gXCJub25lXCIgJiYgKHJlcy5maWxsID0gcmVzLmdyYWRpZW50KSAmJiBkZWxldGUgcmVzLmdyYWRpZW50O1xuICAgICAgICAgICAgcmVzLnRyYW5zZm9ybSA9IHRoaXMuXy50cmFuc2Zvcm07XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZSA9PSBudWxsICYmIFIuaXMobmFtZSwgXCJzdHJpbmdcIikpIHtcbiAgICAgICAgICAgIGlmIChuYW1lID09IGZpbGxTdHJpbmcgJiYgdGhpcy5hdHRycy5maWxsID09IFwibm9uZVwiICYmIHRoaXMuYXR0cnMuZ3JhZGllbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRycy5ncmFkaWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBuYW1lcyA9IG5hbWUuc3BsaXQoc2VwYXJhdG9yKSxcbiAgICAgICAgICAgICAgICBvdXQgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IG5hbWVzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZXNbaV07XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUgaW4gdGhpcy5hdHRycykge1xuICAgICAgICAgICAgICAgICAgICBvdXRbbmFtZV0gPSB0aGlzLmF0dHJzW25hbWVdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoUi5pcyh0aGlzLnBhcGVyLmN1c3RvbUF0dHJpYnV0ZXNbbmFtZV0sIFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0W25hbWVdID0gdGhpcy5wYXBlci5jdXN0b21BdHRyaWJ1dGVzW25hbWVdLmRlZjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvdXRbbmFtZV0gPSBSLl9hdmFpbGFibGVBdHRyc1tuYW1lXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaWkgLSAxID8gb3V0IDogb3V0W25hbWVzWzBdXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5hdHRycyAmJiB2YWx1ZSA9PSBudWxsICYmIFIuaXMobmFtZSwgXCJhcnJheVwiKSkge1xuICAgICAgICAgICAgb3V0ID0ge307XG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBpaSA9IG5hbWUubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIG91dFtuYW1lW2ldXSA9IHRoaXMuYXR0cihuYW1lW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhcmFtcztcbiAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHBhcmFtcyA9IHt9O1xuICAgICAgICAgICAgcGFyYW1zW25hbWVdID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWUgPT0gbnVsbCAmJiBSLmlzKG5hbWUsIFwib2JqZWN0XCIpICYmIChwYXJhbXMgPSBuYW1lKTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHBhcmFtcykge1xuICAgICAgICAgICAgZXZlKFwicmFwaGFlbC5hdHRyLlwiICsga2V5ICsgXCIuXCIgKyB0aGlzLmlkLCB0aGlzLCBwYXJhbXNba2V5XSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcmFtcykge1xuICAgICAgICAgICAgZm9yIChrZXkgaW4gdGhpcy5wYXBlci5jdXN0b21BdHRyaWJ1dGVzKSBpZiAodGhpcy5wYXBlci5jdXN0b21BdHRyaWJ1dGVzW2hhc10oa2V5KSAmJiBwYXJhbXNbaGFzXShrZXkpICYmIFIuaXModGhpcy5wYXBlci5jdXN0b21BdHRyaWJ1dGVzW2tleV0sIFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyID0gdGhpcy5wYXBlci5jdXN0b21BdHRyaWJ1dGVzW2tleV0uYXBwbHkodGhpcywgW10uY29uY2F0KHBhcmFtc1trZXldKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hdHRyc1trZXldID0gcGFyYW1zW2tleV07XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgc3Via2V5IGluIHBhcikgaWYgKHBhcltoYXNdKHN1YmtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zW3N1YmtleV0gPSBwYXJbc3Via2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB0aGlzLnBhcGVyLmNhbnZhcy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICBpZiAocGFyYW1zLnRleHQgJiYgdGhpcy50eXBlID09IFwidGV4dFwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0cGF0aC5zdHJpbmcgPSBwYXJhbXMudGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldEZpbGxBbmRTdHJva2UodGhpcywgcGFyYW1zKTtcbiAgICAgICAgICAgIC8vIHRoaXMucGFwZXIuY2FudmFzLnN0eWxlLmRpc3BsYXkgPSBFO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgZWxwcm90by50b0Zyb250ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAhdGhpcy5yZW1vdmVkICYmIHRoaXMubm9kZS5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMubm9kZSk7XG4gICAgICAgIHRoaXMucGFwZXIgJiYgdGhpcy5wYXBlci50b3AgIT0gdGhpcyAmJiBSLl90b2Zyb250KHRoaXMsIHRoaXMucGFwZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIGVscHJvdG8udG9CYWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ub2RlLnBhcmVudE5vZGUuZmlyc3RDaGlsZCAhPSB0aGlzLm5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLm5vZGUsIHRoaXMubm9kZS5wYXJlbnROb2RlLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgUi5fdG9iYWNrKHRoaXMsIHRoaXMucGFwZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgZWxwcm90by5pbnNlcnRBZnRlciA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtZW50LmNvbnN0cnVjdG9yID09IFIuc3QuY29uc3RydWN0b3IpIHtcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50W2VsZW1lbnQubGVuZ3RoIC0gMV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnQubm9kZS5uZXh0U2libGluZykge1xuICAgICAgICAgICAgZWxlbWVudC5ub2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMubm9kZSwgZWxlbWVudC5ub2RlLm5leHRTaWJsaW5nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnQubm9kZS5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMubm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgUi5faW5zZXJ0YWZ0ZXIodGhpcywgZWxlbWVudCwgdGhpcy5wYXBlcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgZWxwcm90by5pbnNlcnRCZWZvcmUgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC5jb25zdHJ1Y3RvciA9PSBSLnN0LmNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudFswXTtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50Lm5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5ub2RlLCBlbGVtZW50Lm5vZGUpO1xuICAgICAgICBSLl9pbnNlcnRiZWZvcmUodGhpcywgZWxlbWVudCwgdGhpcy5wYXBlcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgZWxwcm90by5ibHVyID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgICAgdmFyIHMgPSB0aGlzLm5vZGUucnVudGltZVN0eWxlLFxuICAgICAgICAgICAgZiA9IHMuZmlsdGVyO1xuICAgICAgICBmID0gZi5yZXBsYWNlKGJsdXJyZWdleHAsIEUpO1xuICAgICAgICBpZiAoK3NpemUgIT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuYXR0cnMuYmx1ciA9IHNpemU7XG4gICAgICAgICAgICBzLmZpbHRlciA9IGYgKyBTICsgbXMgKyBcIi5CbHVyKHBpeGVscmFkaXVzPVwiICsgKCtzaXplIHx8IDEuNSkgKyBcIilcIjtcbiAgICAgICAgICAgIHMubWFyZ2luID0gUi5mb3JtYXQoXCItezB9cHggMCAwIC17MH1weFwiLCByb3VuZCgrc2l6ZSB8fCAxLjUpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHMuZmlsdGVyID0gZjtcbiAgICAgICAgICAgIHMubWFyZ2luID0gMDtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmF0dHJzLmJsdXI7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgUi5fZW5naW5lLnBhdGggPSBmdW5jdGlvbiAocGF0aFN0cmluZywgdm1sKSB7XG4gICAgICAgIHZhciBlbCA9IGNyZWF0ZU5vZGUoXCJzaGFwZVwiKTtcbiAgICAgICAgZWwuc3R5bGUuY3NzVGV4dCA9IGNzc0RvdDtcbiAgICAgICAgZWwuY29vcmRzaXplID0gem9vbSArIFMgKyB6b29tO1xuICAgICAgICBlbC5jb29yZG9yaWdpbiA9IHZtbC5jb29yZG9yaWdpbjtcbiAgICAgICAgdmFyIHAgPSBuZXcgRWxlbWVudChlbCwgdm1sKSxcbiAgICAgICAgICAgIGF0dHIgPSB7ZmlsbDogXCJub25lXCIsIHN0cm9rZTogXCIjMDAwXCJ9O1xuICAgICAgICBwYXRoU3RyaW5nICYmIChhdHRyLnBhdGggPSBwYXRoU3RyaW5nKTtcbiAgICAgICAgcC50eXBlID0gXCJwYXRoXCI7XG4gICAgICAgIHAucGF0aCA9IFtdO1xuICAgICAgICBwLlBhdGggPSBFO1xuICAgICAgICBzZXRGaWxsQW5kU3Ryb2tlKHAsIGF0dHIpO1xuICAgICAgICB2bWwuY2FudmFzLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgdmFyIHNrZXcgPSBjcmVhdGVOb2RlKFwic2tld1wiKTtcbiAgICAgICAgc2tldy5vbiA9IHRydWU7XG4gICAgICAgIGVsLmFwcGVuZENoaWxkKHNrZXcpO1xuICAgICAgICBwLnNrZXcgPSBza2V3O1xuICAgICAgICBwLnRyYW5zZm9ybShFKTtcbiAgICAgICAgcmV0dXJuIHA7XG4gICAgfTtcbiAgICBSLl9lbmdpbmUucmVjdCA9IGZ1bmN0aW9uICh2bWwsIHgsIHksIHcsIGgsIHIpIHtcbiAgICAgICAgdmFyIHBhdGggPSBSLl9yZWN0UGF0aCh4LCB5LCB3LCBoLCByKSxcbiAgICAgICAgICAgIHJlcyA9IHZtbC5wYXRoKHBhdGgpLFxuICAgICAgICAgICAgYSA9IHJlcy5hdHRycztcbiAgICAgICAgcmVzLlggPSBhLnggPSB4O1xuICAgICAgICByZXMuWSA9IGEueSA9IHk7XG4gICAgICAgIHJlcy5XID0gYS53aWR0aCA9IHc7XG4gICAgICAgIHJlcy5IID0gYS5oZWlnaHQgPSBoO1xuICAgICAgICBhLnIgPSByO1xuICAgICAgICBhLnBhdGggPSBwYXRoO1xuICAgICAgICByZXMudHlwZSA9IFwicmVjdFwiO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gICAgUi5fZW5naW5lLmVsbGlwc2UgPSBmdW5jdGlvbiAodm1sLCB4LCB5LCByeCwgcnkpIHtcbiAgICAgICAgdmFyIHJlcyA9IHZtbC5wYXRoKCksXG4gICAgICAgICAgICBhID0gcmVzLmF0dHJzO1xuICAgICAgICByZXMuWCA9IHggLSByeDtcbiAgICAgICAgcmVzLlkgPSB5IC0gcnk7XG4gICAgICAgIHJlcy5XID0gcnggKiAyO1xuICAgICAgICByZXMuSCA9IHJ5ICogMjtcbiAgICAgICAgcmVzLnR5cGUgPSBcImVsbGlwc2VcIjtcbiAgICAgICAgc2V0RmlsbEFuZFN0cm9rZShyZXMsIHtcbiAgICAgICAgICAgIGN4OiB4LFxuICAgICAgICAgICAgY3k6IHksXG4gICAgICAgICAgICByeDogcngsXG4gICAgICAgICAgICByeTogcnlcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfTtcbiAgICBSLl9lbmdpbmUuY2lyY2xlID0gZnVuY3Rpb24gKHZtbCwgeCwgeSwgcikge1xuICAgICAgICB2YXIgcmVzID0gdm1sLnBhdGgoKSxcbiAgICAgICAgICAgIGEgPSByZXMuYXR0cnM7XG4gICAgICAgIHJlcy5YID0geCAtIHI7XG4gICAgICAgIHJlcy5ZID0geSAtIHI7XG4gICAgICAgIHJlcy5XID0gcmVzLkggPSByICogMjtcbiAgICAgICAgcmVzLnR5cGUgPSBcImNpcmNsZVwiO1xuICAgICAgICBzZXRGaWxsQW5kU3Ryb2tlKHJlcywge1xuICAgICAgICAgICAgY3g6IHgsXG4gICAgICAgICAgICBjeTogeSxcbiAgICAgICAgICAgIHI6IHJcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfTtcbiAgICBSLl9lbmdpbmUuaW1hZ2UgPSBmdW5jdGlvbiAodm1sLCBzcmMsIHgsIHksIHcsIGgpIHtcbiAgICAgICAgdmFyIHBhdGggPSBSLl9yZWN0UGF0aCh4LCB5LCB3LCBoKSxcbiAgICAgICAgICAgIHJlcyA9IHZtbC5wYXRoKHBhdGgpLmF0dHIoe3N0cm9rZTogXCJub25lXCJ9KSxcbiAgICAgICAgICAgIGEgPSByZXMuYXR0cnMsXG4gICAgICAgICAgICBub2RlID0gcmVzLm5vZGUsXG4gICAgICAgICAgICBmaWxsID0gbm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZShmaWxsU3RyaW5nKVswXTtcbiAgICAgICAgYS5zcmMgPSBzcmM7XG4gICAgICAgIHJlcy5YID0gYS54ID0geDtcbiAgICAgICAgcmVzLlkgPSBhLnkgPSB5O1xuICAgICAgICByZXMuVyA9IGEud2lkdGggPSB3O1xuICAgICAgICByZXMuSCA9IGEuaGVpZ2h0ID0gaDtcbiAgICAgICAgYS5wYXRoID0gcGF0aDtcbiAgICAgICAgcmVzLnR5cGUgPSBcImltYWdlXCI7XG4gICAgICAgIGZpbGwucGFyZW50Tm9kZSA9PSBub2RlICYmIG5vZGUucmVtb3ZlQ2hpbGQoZmlsbCk7XG4gICAgICAgIGZpbGwucm90YXRlID0gdHJ1ZTtcbiAgICAgICAgZmlsbC5zcmMgPSBzcmM7XG4gICAgICAgIGZpbGwudHlwZSA9IFwidGlsZVwiO1xuICAgICAgICByZXMuXy5maWxscG9zID0gW3gsIHldO1xuICAgICAgICByZXMuXy5maWxsc2l6ZSA9IFt3LCBoXTtcbiAgICAgICAgbm9kZS5hcHBlbmRDaGlsZChmaWxsKTtcbiAgICAgICAgc2V0Q29vcmRzKHJlcywgMSwgMSwgMCwgMCwgMCk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfTtcbiAgICBSLl9lbmdpbmUudGV4dCA9IGZ1bmN0aW9uICh2bWwsIHgsIHksIHRleHQpIHtcbiAgICAgICAgdmFyIGVsID0gY3JlYXRlTm9kZShcInNoYXBlXCIpLFxuICAgICAgICAgICAgcGF0aCA9IGNyZWF0ZU5vZGUoXCJwYXRoXCIpLFxuICAgICAgICAgICAgbyA9IGNyZWF0ZU5vZGUoXCJ0ZXh0cGF0aFwiKTtcbiAgICAgICAgeCA9IHggfHwgMDtcbiAgICAgICAgeSA9IHkgfHwgMDtcbiAgICAgICAgdGV4dCA9IHRleHQgfHwgXCJcIjtcbiAgICAgICAgcGF0aC52ID0gUi5mb3JtYXQoXCJtezB9LHsxfWx7Mn0sezF9XCIsIHJvdW5kKHggKiB6b29tKSwgcm91bmQoeSAqIHpvb20pLCByb3VuZCh4ICogem9vbSkgKyAxKTtcbiAgICAgICAgcGF0aC50ZXh0cGF0aG9rID0gdHJ1ZTtcbiAgICAgICAgby5zdHJpbmcgPSBTdHIodGV4dCk7XG4gICAgICAgIG8ub24gPSB0cnVlO1xuICAgICAgICBlbC5zdHlsZS5jc3NUZXh0ID0gY3NzRG90O1xuICAgICAgICBlbC5jb29yZHNpemUgPSB6b29tICsgUyArIHpvb207XG4gICAgICAgIGVsLmNvb3Jkb3JpZ2luID0gXCIwIDBcIjtcbiAgICAgICAgdmFyIHAgPSBuZXcgRWxlbWVudChlbCwgdm1sKSxcbiAgICAgICAgICAgIGF0dHIgPSB7XG4gICAgICAgICAgICAgICAgZmlsbDogXCIjMDAwXCIsXG4gICAgICAgICAgICAgICAgc3Ryb2tlOiBcIm5vbmVcIixcbiAgICAgICAgICAgICAgICBmb250OiBSLl9hdmFpbGFibGVBdHRycy5mb250LFxuICAgICAgICAgICAgICAgIHRleHQ6IHRleHRcbiAgICAgICAgICAgIH07XG4gICAgICAgIHAuc2hhcGUgPSBlbDtcbiAgICAgICAgcC5wYXRoID0gcGF0aDtcbiAgICAgICAgcC50ZXh0cGF0aCA9IG87XG4gICAgICAgIHAudHlwZSA9IFwidGV4dFwiO1xuICAgICAgICBwLmF0dHJzLnRleHQgPSBTdHIodGV4dCk7XG4gICAgICAgIHAuYXR0cnMueCA9IHg7XG4gICAgICAgIHAuYXR0cnMueSA9IHk7XG4gICAgICAgIHAuYXR0cnMudyA9IDE7XG4gICAgICAgIHAuYXR0cnMuaCA9IDE7XG4gICAgICAgIHNldEZpbGxBbmRTdHJva2UocCwgYXR0cik7XG4gICAgICAgIGVsLmFwcGVuZENoaWxkKG8pO1xuICAgICAgICBlbC5hcHBlbmRDaGlsZChwYXRoKTtcbiAgICAgICAgdm1sLmNhbnZhcy5hcHBlbmRDaGlsZChlbCk7XG4gICAgICAgIHZhciBza2V3ID0gY3JlYXRlTm9kZShcInNrZXdcIik7XG4gICAgICAgIHNrZXcub24gPSB0cnVlO1xuICAgICAgICBlbC5hcHBlbmRDaGlsZChza2V3KTtcbiAgICAgICAgcC5za2V3ID0gc2tldztcbiAgICAgICAgcC50cmFuc2Zvcm0oRSk7XG4gICAgICAgIHJldHVybiBwO1xuICAgIH07XG4gICAgUi5fZW5naW5lLnNldFNpemUgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCkge1xuICAgICAgICB2YXIgY3MgPSB0aGlzLmNhbnZhcy5zdHlsZTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgd2lkdGggPT0gK3dpZHRoICYmICh3aWR0aCArPSBcInB4XCIpO1xuICAgICAgICBoZWlnaHQgPT0gK2hlaWdodCAmJiAoaGVpZ2h0ICs9IFwicHhcIik7XG4gICAgICAgIGNzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIGNzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgY3MuY2xpcCA9IFwicmVjdCgwIFwiICsgd2lkdGggKyBcIiBcIiArIGhlaWdodCArIFwiIDApXCI7XG4gICAgICAgIGlmICh0aGlzLl92aWV3Qm94KSB7XG4gICAgICAgICAgICBSLl9lbmdpbmUuc2V0Vmlld0JveC5hcHBseSh0aGlzLCB0aGlzLl92aWV3Qm94KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFIuX2VuZ2luZS5zZXRWaWV3Qm94ID0gZnVuY3Rpb24gKHgsIHksIHcsIGgsIGZpdCkge1xuICAgICAgICBSLmV2ZShcInJhcGhhZWwuc2V0Vmlld0JveFwiLCB0aGlzLCB0aGlzLl92aWV3Qm94LCBbeCwgeSwgdywgaCwgZml0XSk7XG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQgPSB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIHNpemUgPSAxIC8gbW1heCh3IC8gd2lkdGgsIGggLyBoZWlnaHQpLFxuICAgICAgICAgICAgSCwgVztcbiAgICAgICAgaWYgKGZpdCkge1xuICAgICAgICAgICAgSCA9IGhlaWdodCAvIGg7XG4gICAgICAgICAgICBXID0gd2lkdGggLyB3O1xuICAgICAgICAgICAgaWYgKHcgKiBIIDwgd2lkdGgpIHtcbiAgICAgICAgICAgICAgICB4IC09ICh3aWR0aCAtIHcgKiBIKSAvIDIgLyBIO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGggKiBXIDwgaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgeSAtPSAoaGVpZ2h0IC0gaCAqIFcpIC8gMiAvIFc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdmlld0JveCA9IFt4LCB5LCB3LCBoLCAhIWZpdF07XG4gICAgICAgIHRoaXMuX3ZpZXdCb3hTaGlmdCA9IHtcbiAgICAgICAgICAgIGR4OiAteCxcbiAgICAgICAgICAgIGR5OiAteSxcbiAgICAgICAgICAgIHNjYWxlOiBzaXplXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgIGVsLnRyYW5zZm9ybShcIi4uLlwiKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgdmFyIGNyZWF0ZU5vZGU7XG4gICAgUi5fZW5naW5lLmluaXRXaW4gPSBmdW5jdGlvbiAod2luKSB7XG4gICAgICAgICAgICB2YXIgZG9jID0gd2luLmRvY3VtZW50O1xuICAgICAgICAgICAgZG9jLmNyZWF0ZVN0eWxlU2hlZXQoKS5hZGRSdWxlKFwiLnJ2bWxcIiwgXCJiZWhhdmlvcjp1cmwoI2RlZmF1bHQjVk1MKVwiKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgIWRvYy5uYW1lc3BhY2VzLnJ2bWwgJiYgZG9jLm5hbWVzcGFjZXMuYWRkKFwicnZtbFwiLCBcInVybjpzY2hlbWFzLW1pY3Jvc29mdC1jb206dm1sXCIpO1xuICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGUgPSBmdW5jdGlvbiAodGFnTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9jLmNyZWF0ZUVsZW1lbnQoJzxydm1sOicgKyB0YWdOYW1lICsgJyBjbGFzcz1cInJ2bWxcIj4nKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGUgPSBmdW5jdGlvbiAodGFnTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9jLmNyZWF0ZUVsZW1lbnQoJzwnICsgdGFnTmFtZSArICcgeG1sbnM9XCJ1cm46c2NoZW1hcy1taWNyb3NvZnQuY29tOnZtbFwiIGNsYXNzPVwicnZtbFwiPicpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgUi5fZW5naW5lLmluaXRXaW4oUi5fZy53aW4pO1xuICAgIFIuX2VuZ2luZS5jcmVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjb24gPSBSLl9nZXRDb250YWluZXIuYXBwbHkoMCwgYXJndW1lbnRzKSxcbiAgICAgICAgICAgIGNvbnRhaW5lciA9IGNvbi5jb250YWluZXIsXG4gICAgICAgICAgICBoZWlnaHQgPSBjb24uaGVpZ2h0LFxuICAgICAgICAgICAgcyxcbiAgICAgICAgICAgIHdpZHRoID0gY29uLndpZHRoLFxuICAgICAgICAgICAgeCA9IGNvbi54LFxuICAgICAgICAgICAgeSA9IGNvbi55O1xuICAgICAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVk1MIGNvbnRhaW5lciBub3QgZm91bmQuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXMgPSBuZXcgUi5fUGFwZXIsXG4gICAgICAgICAgICBjID0gcmVzLmNhbnZhcyA9IFIuX2cuZG9jLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksXG4gICAgICAgICAgICBjcyA9IGMuc3R5bGU7XG4gICAgICAgIHggPSB4IHx8IDA7XG4gICAgICAgIHkgPSB5IHx8IDA7XG4gICAgICAgIHdpZHRoID0gd2lkdGggfHwgNTEyO1xuICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgMzQyO1xuICAgICAgICByZXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgcmVzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgd2lkdGggPT0gK3dpZHRoICYmICh3aWR0aCArPSBcInB4XCIpO1xuICAgICAgICBoZWlnaHQgPT0gK2hlaWdodCAmJiAoaGVpZ2h0ICs9IFwicHhcIik7XG4gICAgICAgIHJlcy5jb29yZHNpemUgPSB6b29tICogMWUzICsgUyArIHpvb20gKiAxZTM7XG4gICAgICAgIHJlcy5jb29yZG9yaWdpbiA9IFwiMCAwXCI7XG4gICAgICAgIHJlcy5zcGFuID0gUi5fZy5kb2MuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICAgIHJlcy5zcGFuLnN0eWxlLmNzc1RleHQgPSBcInBvc2l0aW9uOmFic29sdXRlO2xlZnQ6LTk5OTllbTt0b3A6LTk5OTllbTtwYWRkaW5nOjA7bWFyZ2luOjA7bGluZS1oZWlnaHQ6MTtcIjtcbiAgICAgICAgYy5hcHBlbmRDaGlsZChyZXMuc3Bhbik7XG4gICAgICAgIGNzLmNzc1RleHQgPSBSLmZvcm1hdChcInRvcDowO2xlZnQ6MDt3aWR0aDp7MH07aGVpZ2h0OnsxfTtkaXNwbGF5OmlubGluZS1ibG9jaztwb3NpdGlvbjpyZWxhdGl2ZTtjbGlwOnJlY3QoMCB7MH0gezF9IDApO292ZXJmbG93OmhpZGRlblwiLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgaWYgKGNvbnRhaW5lciA9PSAxKSB7XG4gICAgICAgICAgICBSLl9nLmRvYy5ib2R5LmFwcGVuZENoaWxkKGMpO1xuICAgICAgICAgICAgY3MubGVmdCA9IHggKyBcInB4XCI7XG4gICAgICAgICAgICBjcy50b3AgPSB5ICsgXCJweFwiO1xuICAgICAgICAgICAgY3MucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoY29udGFpbmVyLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKGMsIGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlcy5yZW5kZXJmaXggPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuICAgIFIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBSLmV2ZShcInJhcGhhZWwuY2xlYXJcIiwgdGhpcyk7XG4gICAgICAgIHRoaXMuY2FudmFzLmlubmVySFRNTCA9IEU7XG4gICAgICAgIHRoaXMuc3BhbiA9IFIuX2cuZG9jLmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgICB0aGlzLnNwYW4uc3R5bGUuY3NzVGV4dCA9IFwicG9zaXRpb246YWJzb2x1dGU7bGVmdDotOTk5OWVtO3RvcDotOTk5OWVtO3BhZGRpbmc6MDttYXJnaW46MDtsaW5lLWhlaWdodDoxO2Rpc3BsYXk6aW5saW5lO1wiO1xuICAgICAgICB0aGlzLmNhbnZhcy5hcHBlbmRDaGlsZCh0aGlzLnNwYW4pO1xuICAgICAgICB0aGlzLmJvdHRvbSA9IHRoaXMudG9wID0gbnVsbDtcbiAgICB9O1xuICAgIFIucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgUi5ldmUoXCJyYXBoYWVsLnJlbW92ZVwiLCB0aGlzKTtcbiAgICAgICAgdGhpcy5jYW52YXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmNhbnZhcyk7XG4gICAgICAgIGZvciAodmFyIGkgaW4gdGhpcykge1xuICAgICAgICAgICAgdGhpc1tpXSA9IHR5cGVvZiB0aGlzW2ldID09IFwiZnVuY3Rpb25cIiA/IFIuX3JlbW92ZWRGYWN0b3J5KGkpIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgdmFyIHNldHByb3RvID0gUi5zdDtcbiAgICBmb3IgKHZhciBtZXRob2QgaW4gZWxwcm90bykgaWYgKGVscHJvdG9baGFzXShtZXRob2QpICYmICFzZXRwcm90b1toYXNdKG1ldGhvZCkpIHtcbiAgICAgICAgc2V0cHJvdG9bbWV0aG9kXSA9IChmdW5jdGlvbiAobWV0aG9kbmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJnID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsW21ldGhvZG5hbWVdLmFwcGx5KGVsLCBhcmcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSkobWV0aG9kKTtcbiAgICB9XG59KHdpbmRvdy5SYXBoYWVsKTsiXX0=
