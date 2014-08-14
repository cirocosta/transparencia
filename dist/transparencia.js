(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var request = require('request')
  , tillthen = require('tillthen')
  , API_SERVER = 'https://api.transparencia.org.br/api/v1';

function empty (obj) {
  return Object.keys(obj).length ? true : false;
}

function Transparencia (token) {
  if (!token) throw new Error('A token must be specified.')

  this.token = token;
  this.url = '';
  this.ops = {};
}

Transparencia.prototype.get = function (url, ops) {
  var dfd = tillthen.defer();

  request.get({
    uri: this.url || url,
    rejectUnauthorized: false,
    json: true,
    qs: empty(this.ops) ? this.ops : ops,
    headers: {
      'App-Token': this.token
    }}, function (err, res, body) {
      if (err) dfd.reject(err);
      else dfd.resolve(res.body);
    });

  return dfd.promise;
};

Transparencia.prototype._prepare = function (a, b) {
  if (typeof a == 'string' || a instanceof String)
    this.url += (this.ops = b || {}, '/' + a);
  else
    this.ops = a || {};
};

/**
 * Entrance functions -- must be called first
 */
Transparencia.prototype.candidatos = function (a, b) {
  this.url = API_SERVER + '/candidatos';

  return (this._prepare(a, b), this);
};

Transparencia.prototype.partidos = function (a, b) {
  this.url = API_SERVER + '/partidos';

  return (this._prepare(a, b), this);
};

Transparencia.prototype.estados = function (a, b) {
  this.url = API_SERVER + '/estados';

  return (this._prepare(a, b), this);
};

Transparencia.prototype.cargos = function (a, b) {
  this.url = API_SERVER + '/cargos';

  return (this._prepare(a, b), this);
};

Transparencia.prototype.excelencias = function (a, b) {
  this.url = API_SERVER + '/excelencias';

  return (this._prepare(a, b), this);
};

/**
 * Complementary -- called after
 */

Transparencia.prototype.paginate = function (o, l) {
  return (this._prepare({_offset: o, _limit: l}), this);
};

Transparencia.prototype.bens = function (a) {
  return (this._prepare('bens', a), this);
};

Transparencia.prototype.doadores = function (a) {
  return (this._prepare('doadores', a), this);
};

Transparencia.prototype.candidaturas = function (a) {
  return (this._prepare('candidaturas', a), this);
};

Transparencia.prototype.estatisticas = function (a) {
  return (this._prepare('estatisticas', a), this);
};


module.exports = Transparencia;

},{"request":2,"tillthen":4}],2:[function(require,module,exports){
// Browser Request
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var XHR = XMLHttpRequest
if (!XHR) throw new Error('missing XMLHttpRequest')
request.log = {
  'trace': noop, 'debug': noop, 'info': noop, 'warn': noop, 'error': noop
}

var DEFAULT_TIMEOUT = 3 * 60 * 1000 // 3 minutes

//
// request
//

function request(options, callback) {
  // The entry-point to the API: prep the options object and pass the real work to run_xhr.
  if(typeof callback !== 'function')
    throw new Error('Bad callback given: ' + callback)

  if(!options)
    throw new Error('No options given')

  var options_onResponse = options.onResponse; // Save this for later.

  if(typeof options === 'string')
    options = {'uri':options};
  else
    options = JSON.parse(JSON.stringify(options)); // Use a duplicate for mutating.

  options.onResponse = options_onResponse // And put it back.

  if (options.verbose) request.log = getLogger();

  if(options.url) {
    options.uri = options.url;
    delete options.url;
  }

  if(!options.uri && options.uri !== "")
    throw new Error("options.uri is a required argument");

  if(typeof options.uri != "string")
    throw new Error("options.uri must be a string");

  var unsupported_options = ['proxy', '_redirectsFollowed', 'maxRedirects', 'followRedirect']
  for (var i = 0; i < unsupported_options.length; i++)
    if(options[ unsupported_options[i] ])
      throw new Error("options." + unsupported_options[i] + " is not supported")

  options.callback = callback
  options.method = options.method || 'GET';
  options.headers = options.headers || {};
  options.body    = options.body || null
  options.timeout = options.timeout || request.DEFAULT_TIMEOUT

  if(options.headers.host)
    throw new Error("Options.headers.host is not supported");

  if(options.json) {
    options.headers.accept = options.headers.accept || 'application/json'
    if(options.method !== 'GET')
      options.headers['content-type'] = 'application/json'

    if(typeof options.json !== 'boolean')
      options.body = JSON.stringify(options.json)
    else if(typeof options.body !== 'string')
      options.body = JSON.stringify(options.body)
  }
  
  //BEGIN QS Hack
  var serialize = function(obj) {
    var str = [];
    for(var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  }
  
  if(options.qs){
    var qs = (typeof options.qs == 'string')? options.qs : serialize(options.qs);
    if(options.uri.indexOf('?') !== -1){ //no get params
        options.uri = options.uri+'&'+qs;
    }else{ //existing get params
        options.uri = options.uri+'?'+qs;
    }
  }
  //END QS Hack
  
  //BEGIN FORM Hack
  var multipart = function(obj) {
    //todo: support file type (useful?)
    var result = {};
    result.boundry = '-------------------------------'+Math.floor(Math.random()*1000000000);
    var lines = [];
    for(var p in obj){
        if (obj.hasOwnProperty(p)) {
            lines.push(
                '--'+result.boundry+"\n"+
                'Content-Disposition: form-data; name="'+p+'"'+"\n"+
                "\n"+
                obj[p]+"\n"
            );
        }
    }
    lines.push( '--'+result.boundry+'--' );
    result.body = lines.join('');
    result.length = result.body.length;
    result.type = 'multipart/form-data; boundary='+result.boundry;
    return result;
  }
  
  if(options.form){
    if(typeof options.form == 'string') throw('form name unsupported');
    if(options.method === 'POST'){
        var encoding = (options.encoding || 'application/x-www-form-urlencoded').toLowerCase();
        options.headers['content-type'] = encoding;
        switch(encoding){
            case 'application/x-www-form-urlencoded':
                options.body = serialize(options.form).replace(/%20/g, "+");
                break;
            case 'multipart/form-data':
                var multi = multipart(options.form);
                //options.headers['content-length'] = multi.length;
                options.body = multi.body;
                options.headers['content-type'] = multi.type;
                break;
            default : throw new Error('unsupported encoding:'+encoding);
        }
    }
  }
  //END FORM Hack

  // If onResponse is boolean true, call back immediately when the response is known,
  // not when the full request is complete.
  options.onResponse = options.onResponse || noop
  if(options.onResponse === true) {
    options.onResponse = callback
    options.callback = noop
  }

  // XXX Browsers do not like this.
  //if(options.body)
  //  options.headers['content-length'] = options.body.length;

  // HTTP basic authentication
  if(!options.headers.authorization && options.auth)
    options.headers.authorization = 'Basic ' + b64_enc(options.auth.username + ':' + options.auth.password);

  return run_xhr(options)
}

var req_seq = 0
function run_xhr(options) {
  var xhr = new XHR
    , timed_out = false
    , is_cors = is_crossDomain(options.uri)
    , supports_cors = ('withCredentials' in xhr)

  req_seq += 1
  xhr.seq_id = req_seq
  xhr.id = req_seq + ': ' + options.method + ' ' + options.uri
  xhr._id = xhr.id // I know I will type "_id" from habit all the time.

  if(is_cors && !supports_cors) {
    var cors_err = new Error('Browser does not support cross-origin request: ' + options.uri)
    cors_err.cors = 'unsupported'
    return options.callback(cors_err, xhr)
  }

  xhr.timeoutTimer = setTimeout(too_late, options.timeout)
  function too_late() {
    timed_out = true
    var er = new Error('ETIMEDOUT')
    er.code = 'ETIMEDOUT'
    er.duration = options.timeout

    request.log.error('Timeout', { 'id':xhr._id, 'milliseconds':options.timeout })
    return options.callback(er, xhr)
  }

  // Some states can be skipped over, so remember what is still incomplete.
  var did = {'response':false, 'loading':false, 'end':false}

  xhr.onreadystatechange = on_state_change
  xhr.open(options.method, options.uri, true) // asynchronous
  if(is_cors)
    xhr.withCredentials = !! options.withCredentials
  xhr.send(options.body)
  return xhr

  function on_state_change(event) {
    if(timed_out)
      return request.log.debug('Ignoring timed out state change', {'state':xhr.readyState, 'id':xhr.id})

    request.log.debug('State change', {'state':xhr.readyState, 'id':xhr.id, 'timed_out':timed_out})

    if(xhr.readyState === XHR.OPENED) {
      request.log.debug('Request started', {'id':xhr.id})
      for (var key in options.headers)
        xhr.setRequestHeader(key, options.headers[key])
    }

    else if(xhr.readyState === XHR.HEADERS_RECEIVED)
      on_response()

    else if(xhr.readyState === XHR.LOADING) {
      on_response()
      on_loading()
    }

    else if(xhr.readyState === XHR.DONE) {
      on_response()
      on_loading()
      on_end()
    }
  }

  function on_response() {
    if(did.response)
      return

    did.response = true
    request.log.debug('Got response', {'id':xhr.id, 'status':xhr.status})
    clearTimeout(xhr.timeoutTimer)
    xhr.statusCode = xhr.status // Node request compatibility

    // Detect failed CORS requests.
    if(is_cors && xhr.statusCode == 0) {
      var cors_err = new Error('CORS request rejected: ' + options.uri)
      cors_err.cors = 'rejected'

      // Do not process this request further.
      did.loading = true
      did.end = true

      return options.callback(cors_err, xhr)
    }

    options.onResponse(null, xhr)
  }

  function on_loading() {
    if(did.loading)
      return

    did.loading = true
    request.log.debug('Response body loading', {'id':xhr.id})
    // TODO: Maybe simulate "data" events by watching xhr.responseText
  }

  function on_end() {
    if(did.end)
      return

    did.end = true
    request.log.debug('Request done', {'id':xhr.id})

    xhr.body = xhr.responseText
    if(options.json) {
      try        { xhr.body = JSON.parse(xhr.responseText) }
      catch (er) { return options.callback(er, xhr)        }
    }

    options.callback(null, xhr, xhr.body)
  }

} // request

request.withCredentials = false;
request.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;

//
// defaults
//

request.defaults = function(options, requester) {
  var def = function (method) {
    var d = function (params, callback) {
      if(typeof params === 'string')
        params = {'uri': params};
      else {
        params = JSON.parse(JSON.stringify(params));
      }
      for (var i in options) {
        if (params[i] === undefined) params[i] = options[i]
      }
      return method(params, callback)
    }
    return d
  }
  var de = def(request)
  de.get = def(request.get)
  de.post = def(request.post)
  de.put = def(request.put)
  de.head = def(request.head)
  return de
}

//
// HTTP method shortcuts
//

var shortcuts = [ 'get', 'put', 'post', 'head' ];
shortcuts.forEach(function(shortcut) {
  var method = shortcut.toUpperCase();
  var func   = shortcut.toLowerCase();

  request[func] = function(opts) {
    if(typeof opts === 'string')
      opts = {'method':method, 'uri':opts};
    else {
      opts = JSON.parse(JSON.stringify(opts));
      opts.method = method;
    }

    var args = [opts].concat(Array.prototype.slice.apply(arguments, [1]));
    return request.apply(this, args);
  }
})

//
// CouchDB shortcut
//

request.couch = function(options, callback) {
  if(typeof options === 'string')
    options = {'uri':options}

  // Just use the request API to do JSON.
  options.json = true
  if(options.body)
    options.json = options.body
  delete options.body

  callback = callback || noop

  var xhr = request(options, couch_handler)
  return xhr

  function couch_handler(er, resp, body) {
    if(er)
      return callback(er, resp, body)

    if((resp.statusCode < 200 || resp.statusCode > 299) && body.error) {
      // The body is a Couch JSON object indicating the error.
      er = new Error('CouchDB error: ' + (body.error.reason || body.error.error))
      for (var key in body)
        er[key] = body[key]
      return callback(er, resp, body);
    }

    return callback(er, resp, body);
  }
}

//
// Utility
//

function noop() {}

function getLogger() {
  var logger = {}
    , levels = ['trace', 'debug', 'info', 'warn', 'error']
    , level, i

  for(i = 0; i < levels.length; i++) {
    level = levels[i]

    logger[level] = noop
    if(typeof console !== 'undefined' && console && console[level])
      logger[level] = formatted(console, level)
  }

  return logger
}

function formatted(obj, method) {
  return formatted_logger

  function formatted_logger(str, context) {
    if(typeof context === 'object')
      str += ' ' + JSON.stringify(context)

    return obj[method].call(obj, str)
  }
}

// Return whether a URL is a cross-domain request.
function is_crossDomain(url) {
  var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/

  // jQuery #8138, IE may throw an exception when accessing
  // a field from window.location if document.domain has been set
  var ajaxLocation
  try { ajaxLocation = location.href }
  catch (e) {
    // Use the href attribute of an A element since IE will modify it given document.location
    ajaxLocation = document.createElement( "a" );
    ajaxLocation.href = "";
    ajaxLocation = ajaxLocation.href;
  }

  var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || []
    , parts = rurl.exec(url.toLowerCase() )

  var result = !!(
    parts &&
    (  parts[1] != ajaxLocParts[1]
    || parts[2] != ajaxLocParts[2]
    || (parts[3] || (parts[1] === "http:" ? 80 : 443)) != (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443))
    )
  )

  //console.debug('is_crossDomain('+url+') -> ' + result)
  return result
}

// MIT License from http://phpjs.org/functions/base64_encode:358
function b64_enc (data) {
    // Encodes string using MIME base64 algorithm
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc="", tmp_arr = [];

    if (!data) {
        return data;
    }

    // assume utf8 data
    // data = this.utf8_encode(data+'');

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1<<16 | o2<<8 | o3;

        h1 = bits>>18 & 0x3f;
        h2 = bits>>12 & 0x3f;
        h3 = bits>>6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
        break;
        case 2:
            enc = enc.slice(0, -1) + '=';
        break;
    }

    return enc;
}
module.exports = request;

},{}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
(function (process){
//     Tillthen v0.3.4

//     https://github.com/biril/tillthen
//     Licensed and freely distributed under the MIT License
//     Copyright (c) 2013 Alex Lambiris

/*global exports, define, process */
(function (root, createModule) {
    "use strict";

    var
        // Package various utility functions we'll be reusing
        _ = {
            isObject: function (o) {
                return Object.prototype.toString.call(o) === "[object Object]";
            },

            isFunction: function (f) {
                return Object.prototype.toString.call(f) === "[object Function]";
            }
        },

        // Detect the current environment (can be CommonJS, AMD or browser). Tillthen will be
        //  exposed as a module or global depending on that
        env = (function () {
            // A global `define` method with an `amd` property signifies the presence of an AMD
            //  loader (require.js, curl.js)
            if (typeof define === "function" && define.amd) { return "AMD"; }

            // A global `exports` object signifies CommonJS-like enviroments that support
            //  `module.exports`, e.g. Node
            if (typeof exports !== "undefined" && _.isObject(exports)) { return "CommonJS"; }

            // If none of the above, then assume a browser, without AMD
            return "browser";
        }());

    // Create a next-turn-evaluation function: A function that evaluates given function `f` on
    //  given value `v`, *soon*, i.e. *not* in the same turn of the event loop
    //
    // (Note that support for CommonJS will be specific to node. So if the detected environment
    //  is in fact 'CommonJS', the presense of node's `process` object is assumed and the latter
    //  is used to get a reference to Node's `nextTick` method)
    _.evaluateOnNextTurn = (function () {
        return env === "CommonJS" ? function (f, v) {
                process.nextTick(function () { f(v); });
            } :
            function (f, v) { root.setTimeout(function () { f(v); }, 0); };
    }());

    // Expose as a module or global depending on the detected environment
    switch (env) {
    case "CommonJS":
        createModule(_, exports);
        break;

    case "AMD":
        define(["exports"], function (exports) { return createModule(_, exports); });
        break;

    case "browser":
        root.tillthen = createModule(_, {});

        // When running in a browser (without AMD modules), attach a `noConflict` onto the
        //  `tillthen` global
        root.tillthen.noConflict = (function () {

            // Save a reference to the previous value of 'tillthen', so that it can be restored
            //  later on, if 'noConflict' is used
            var previousTillthen = root.tillthen;

            // Run in no-conflict mode, setting the `tillthen` global to to its previous value.
            //  Returns `tillthen`
            return function () {
                var tillthen = root.tillthen;
                root.tillthen = previousTillthen;
                tillthen.noConflict = function () { return tillthen; };
                return tillthen;
            };
        }());
    }
}(this, function (_, tillthen) {
    "use strict";

    var
        // Tillthen deferred constructor
        TillthenDeferred = function () {},

        // Tillthen promise constructor
        TillthenPromise = function () {},

        // Resolve `deferred`, i.e. transition it to an appropriate state depending on given `x`
        resolveDeferred = function (deferred, x) {
            var xThen = null;

            // If `promise` and `x` refer to the same object, reject promise with a TypeError as
            //  the reason
            if (deferred.promise === x) {
                return deferred.reject(new TypeError("Cannot resolve a promise with itself"));
            }

            // If `x` is a promise, adopt its (future) state
            if (x instanceof TillthenPromise) {
                if (x.state === "fulfilled") { return deferred.fulfill(x.result); }
                if (x.state === "rejected") { return deferred.reject(x.result); }
                return x.then(deferred.fulfill, deferred.reject);
            }

            // if `x` is *not* a thenable, fulfill promise with `x`. If attempting to query `then`
            //  throws an error, reject promise with that error as the reason
            //
            // (The procedure of first storing a reference to `x.then`, then testing that reference,
            //  and then calling that reference, avoids multiple accesses to the `x.then` property
            //  ensuring consistency in the face of an accessor property, whose value could change
            //  between retrievals)
            try {
                if (!(_.isObject(x) || _.isFunction(x)) || !_.isFunction(xThen = x.then)) {
                    return deferred.fulfill(x);
                }
            }
            catch (error) { deferred.reject(error); }

            // If `x` is a thenable adopt its (future) state
            xThen(function (value) {
                resolveDeferred(deferred, value);
            }, function (reason) {
                deferred.reject(reason);
            });
        },

        // Create an evaluator for given `onResulted` function and `deferred` object. When invoked
        //  with a `result` (value or reason), the evaluator will evaluate `onResulted(result)`
        //  and will use the returned value to resolve `deferred`
        createEvaluator = function (onResulted, deferred) {
            return function (result) {
                try { resolveDeferred(deferred, onResulted(result)); }
                catch (reason) { deferred.reject(reason); }
            };
        },

        // Create a deferred object: A pending promise with `resolve`, `fulfill` and `reject`
        //  methods
        createDeferred = function () {
            var
                // Promise's current state
                state = "pending",

                // Value of fulfillment or reason of rejection. Will be set when fulfillment or
                //  rejection actually occurs
                result,

                // Queues of fulfillment / rejection handlers. Handlers are added whenever the
                //  promise's `then` method is invoked
                fulfillQueue = [],
                rejectQueue = [],

                // The actual promise. The deferred will derive from this
                promise = new TillthenPromise(),

                // The deferred to be returned
                deferred = null,

                // Queue a handler and a dependant deferred for fulfillment. When (and if) the
                //  promise is fulfilled, the handler will be evaluated on promise's value and the
                //  result will be used to resolve the dependant deferred
                queueForFulfillment = function (onFulfilled, dependantDeferred) {

                    // If the promise is already rejected, there's nothing to be done
                    if (state === "rejected") { return; }

                    // If given `onFulfilled` is not a function then use a pass-through function in
                    //  its place
                    _.isFunction(onFulfilled) || (onFulfilled = function (value) { return value; });

                    // Create an evaluator to do the dirty work and either run it 'now' if the
                    //  promise is already fulfilled or as soon as (and if) that eventually happens
                    var evaluator = createEvaluator(onFulfilled, dependantDeferred);
                    state === "fulfilled" ? _.evaluateOnNextTurn(evaluator, result) :
                        fulfillQueue.push(evaluator);
                },

                // Queue a handler and a dependant deferred for rejection. When (and if) the promise
                //  is rejected, the handler will be evaluated on promise's reason and the result
                //  will be used to resolve the dependant deferred
                queueForRejection = function (onRejected, dependantDeferred) {

                    // If the promise is already fulfilled, there's nothing to be done
                    if (state === "fulfilled") { return; }

                    // If given `onRejected` is not a function then use a pass-through function in
                    //  its place
                    _.isFunction(onRejected) || (onRejected = function (error) { throw error; });

                    // Create an evaluator to do the dirty work and either run it 'now' if the
                    //  promise is already rejected or as soon as (and if) that eventually happens
                    var evaluator = createEvaluator(onRejected, dependantDeferred);
                    state === "rejected" ? _.evaluateOnNextTurn(evaluator, result) :
                        rejectQueue.push(evaluator);
                },

                // Fulfil the promise. Will run the queued fulfillment-handlers and resolve
                //  dependant promises. Note that the `fulfill` method will be exposed on the
                //  returned deferred *only* - not on any returned promise: not by the deferred's
                //  underlying promise or those returned by invoking `then`
                fulfill = function (value) {

                    // Dont fulfill the promise unless it's currently in a pending state
                    if (state !== "pending") { return; }

                    // Fulfil the promise
                    state = "fulfilled";
                    for (var i = 0, l = fulfillQueue.length; i < l; ++i) { fulfillQueue[i](value); }
                    fulfillQueue = [];
                    result = value;

                    return promise;
                },

                // Reject the promise. Will run the queued rejection-handlers and resolve
                //  dependant promises. As with the `fulfill` method, the `reject` method will be
                //  exposed on the returned deferred *only* - not on any returned promise
                reject = function (reason) {

                    // Dont reject the promise unless it's currently in a pending state
                    if (state !== "pending") { return; }

                    // Reject the promise
                    state = "rejected";
                    for (var i = 0, l = rejectQueue.length; i < l; ++i) { rejectQueue[i](reason); }
                    rejectQueue = [];
                    result = reason;

                    return promise;
                };

            // Attach `then` method as well as `state` and `result` getters to the promise:
            Object.defineProperties(promise, {

                // Access the promise's current or eventual fulfillment value or rejection reason.
                //  As soon as (if ever) the promise is fulfilled, the `onFulfilled` handler will
                //  be evaluated on the promise's fulfillment value. Similarly, as soon as (if ever)
                //  the promise is rejected, the `onRejected` handler will be evaluated on the
                //  rejection reason. Returns a new promise which will be eventually resolved
                //  with the value / reason / promise returned by `onFulfilled` or `onRejected`
                then: {
                    value: function (onFulfilled, onRejected) {
                        // Create a new deferred, one which is *dependant* on (and will be resolved
                        //  with) the the value / reason / promise returned by `onFulfilled` or
                        //  `onRejected`
                        var dependantDeferred = createDeferred();

                        // Queue `onFulfilled` and `onRejected` for evaluation upon the promise's
                        //  eventual fulfillment or rejection
                        queueForFulfillment(onFulfilled, dependantDeferred);
                        queueForRejection(onRejected, dependantDeferred);

                        // Return the dependant deferred's underlying promise
                        return dependantDeferred.promise;
                    }
                },

                // Get the promise's current state ('pending', 'fulfilled' or 'rejected')
                state: { get: function () { return state; } },

                // Get the promise's result (value or reason). Valid only after the promise has
                //  either been fulfilled or rejected
                result: { get: function () { return result; } }
            });

            // Derive a deferred from the promise, attach needed methods and return it
            TillthenDeferred.prototype = promise;
            deferred = new TillthenDeferred();
            Object.defineProperties(deferred, {

                // Get the deferred's underlying promise
                promise: { get: function () { return promise; } },

                // Fulfill the promise with given value
                fulfill: { value: fulfill },

                // Reject the promise with given reason
                reject: { value: reject },

                // Resolve the promise with given `result`: Fulfill it if `result` is a _value_, or
                //  cause it to assume `result`'s (future) state if it's a _promise_ itself
                resolve: { value: function (result) { resolveDeferred(this, result); } }
            });
            return deferred;
        };

    // Attach the `defer` / `getVersion` methods to Tillthen and return it
    Object.defineProperties(tillthen, {

        // Get a deferred object: A pending promise with `resolve`, `fulfill` and `reject` methods
        defer: { value: createDeferred },

        // Get current version of Tillthen
        version: { get: function () { return "0.3.4"; } }
    });
    return tillthen;
}));

}).call(this,require('_process'))
},{"_process":3}]},{},[1]);
