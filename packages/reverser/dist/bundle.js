'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var util = _interopDefault(require('util'));
var events = _interopDefault(require('events'));
var string_decoder = _interopDefault(require('string_decoder'));
var fs = require('fs');
var fs__default = _interopDefault(fs);
var os = _interopDefault(require('os'));

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var node = util.deprecate;

var index$1 = createCommonjsModule(function (module, exports) {
var inherits = util.inherits;
var EventEmitter = events.EventEmitter;
var Decoder = string_decoder.StringDecoder;
exports = module.exports = function ( /*optional*/xs, /*optional*/secondArg, /*optional*/mappingHint) {
    return new Stream(xs, secondArg, mappingHint);
};
var _ = exports;
var slice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;
var isES5 = function () {
    'use strict';
    return Function.prototype.bind && !this;
}();
_.isUndefined = function (x) {
    return typeof x === 'undefined';
};
_.isFunction = function (x) {
    return typeof x === 'function';
};
_.isObject = function (x) {
    return typeof x === 'object' && x !== null;
};
_.isString = function (x) {
    return typeof x === 'string';
};
_.isArray = Array.isArray || function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
};
if (typeof setImmediate === 'undefined') {
    _.setImmediate = function (fn) {
        setTimeout(fn, 0);
    };
}
else if (typeof process === 'undefined' || !process.stdout) {
        _.setImmediate = function (fn) {
            setImmediate(fn);
        };
    } else {
        _.setImmediate = setImmediate;
    }
var _global = commonjsGlobal;
if (typeof commonjsGlobal !== 'undefined') {
    _global = commonjsGlobal;
} else if (typeof window !== 'undefined') {
    _global = window;
}
if (!_global.nil) {
    _global.nil = {};
}
var nil = _.nil = _global.nil;
_.curry = function (fn /* args... */) {
    var args = slice.call(arguments);
    return _.ncurry.apply(this, [fn.length].concat(args));
};
_.ncurry = function (n, fn /* args... */) {
    var largs = slice.call(arguments, 2);
    if (largs.length >= n) {
        return fn.apply(this, largs.slice(0, n));
    }
    return _.partial.apply(this, [_.ncurry, n, fn].concat(largs));
};
_.partial = function (f /* args... */) {
    var args = slice.call(arguments, 1);
    return function () {
        return f.apply(this, args.concat(slice.call(arguments)));
    };
};
_.flip = _.curry(function (fn, x, y) {
    return fn(y, x);
});
_.compose = function () /*functions...*/{
    var fns = slice.call(arguments).reverse();
    return _.seq.apply(null, fns);
};
_.seq = function () {
    var fns = slice.call(arguments);
    return function () {
        if (!fns.length) {
            return null;
        }
        var r = fns[0].apply(this, arguments);
        for (var i = 1; i < fns.length; i++) {
            r = fns[i].call(this, r);
        }
        return r;
    };
};
function nop() {
}
function defaultReadableOnFinish(readable, callback) {
    readable.once('error', callback);
    return function () {
        readable.removeListener('error', callback);
    };
}
function pipeReadable(xs, onFinish, stream) {
    var response = onFinish(xs, streamEndCb);
    var unbound = false;
    var cleanup = null;
    var endOnError = true;
    if (_.isFunction(response)) {
        cleanup = response;
    } else if (response != null) {
        cleanup = response.onDestroy;
        endOnError = !response.continueOnError;
    }
    xs.pipe(stream);
    stream._destructors.push(unbind);
    function streamEndCb(error) {
        if (stream._nil_pushed) {
            return;
        }
        if (error) {
            stream.write(new StreamError(error));
        }
        if (error == null || endOnError) {
            unbind();
            stream.end();
        }
    }
    function unbind() {
        if (unbound) {
            return;
        }
        unbound = true;
        if (cleanup) {
            cleanup();
        }
        if (xs.unpipe) {
            xs.unpipe(stream);
        }
    }
}
function promiseStream(promise) {
    var nilScheduled = false;
    return _(function (push) {
        promise = promise.then(function (value) {
            nilScheduled = true;
            _.setImmediate(function () {
                push(null, value);
                push(null, nil);
            });
            return null;
        }, function (err) {
            nilScheduled = true;
            _.setImmediate(function () {
                push(err);
                push(null, nil);
            });
            return null;
        });
        if (_.isFunction(promise['finally'])) {
            promise['finally'](function () {
                if (!nilScheduled) {
                    _.setImmediate(function () {
                        push(null, nil);
                    });
                }
                return null;
            });
        }
    });
}
function iteratorStream(it) {
    return _(function (push, next) {
        var iterElem, iterErr;
        try {
            iterElem = it.next();
        } catch (err) {
            iterErr = err;
        }
        if (iterErr) {
            push(iterErr);
            push(null, _.nil);
        } else if (iterElem.done) {
            if (!_.isUndefined(iterElem.value)) {
                push(null, iterElem.value);
            }
            push(null, _.nil);
        } else {
            push(null, iterElem.value);
            next();
        }
    });
}
function hintMapper(mappingHint) {
    var mappingHintType = typeof mappingHint;
    var mapper;
    if (mappingHintType === 'function') {
        mapper = mappingHint;
    } else if (mappingHintType === 'number') {
        mapper = function () {
            return slice.call(arguments, 0, mappingHint);
        };
    } else if (_.isArray(mappingHint)) {
        mapper = function () {
            var args = arguments;
            return mappingHint.reduce(function (ctx, hint, idx) {
                ctx[hint] = args[idx];
                return ctx;
            }, {});
        };
    } else {
        mapper = function (x) {
            return x;
        };
    }
    return mapper;
}
function pipeStream(src, dest, write, end, passAlongErrors) {
    var resume = null;
    var s = src.consume(function (err, x, push, next) {
        var canContinue;
        if (err) {
            if (passAlongErrors) {
                canContinue = write.call(dest, new StreamError(err));
            } else {
                src.emit('error', err);
                canContinue = true;
            }
        } else if (x === nil) {
            end.call(dest);
            return;
        } else {
            canContinue = write.call(dest, x);
        }
        if (canContinue !== false) {
            next();
        } else {
            resume = next;
        }
    });
    dest.on('drain', onConsumerDrain);
    src._destructors.push(function () {
        dest.removeListener('drain', onConsumerDrain);
    });
    dest.emit('pipe', src);
    s.resume();
    return dest;
    function onConsumerDrain() {
        if (resume) {
            var oldResume = resume;
            resume = null;
            oldResume();
        }
    }
}
function generatorPush(stream, write) {
    if (!write) {
        write = stream.write;
    }
    return function (err, x) {
        write.call(stream, err ? new StreamError(err) : x);
    };
}
function Stream( /*optional*/xs, /*optional*/secondArg, /*optional*/mappingHint) {
    if (xs && _.isStream(xs)) {
        return xs;
    }
    EventEmitter.call(this);
    var self = this;
    self.__HighlandStream__ = true;
    self.id = ('' + Math.random()).substr(2, 6);
    this.paused = true;
    this._incoming = [];
    this._outgoing = [];
    this._consumers = [];
    this._observers = [];
    this._destructors = [];
    this._send_events = false;
    this._nil_pushed = false;
    this._delegate = null;
    this._is_observer = false;
    this._in_consume_cb = false;
    this._repeat_resume = false;
    this._consume_waiting_for_next = false;
    this.source = null;
    this.writable = true;
    self.on('newListener', function (ev) {
        if (ev === 'data') {
            self._send_events = true;
            _.setImmediate(self.resume.bind(self));
        } else if (ev === 'end') {
            self._send_events = true;
        }
    });
    self.on('removeListener', function (ev) {
        if (ev === 'end' || ev === 'data') {
            var end_listeners = self.listeners('end').length;
            var data_listeners = self.listeners('data').length;
            if (end_listeners + data_listeners === 0) {
                self._send_events = false;
            }
        }
    });
    if (_.isUndefined(xs)) {
        return this;
    } else if (_.isArray(xs)) {
        self._incoming = xs.concat([nil]);
        return this;
    } else if (_.isFunction(xs)) {
        this._generator = xs;
        this._generator_push = generatorPush(this);
        this._generator_next = function (s) {
            if (self._nil_pushed) {
                throw new Error('Cannot call next after nil');
            }
            if (s) {
                var _paused = self.paused;
                if (!_paused) {
                    self.pause();
                }
                self.write(new StreamRedirect(s));
                if (!_paused) {
                    self._resume(false);
                }
            } else {
                self._generator_running = false;
            }
            if (!self.paused) {
                self._resume(false);
            }
        };
        return this;
    } else if (_.isObject(xs)) {
        if (_.isFunction(xs.on) && _.isFunction(xs.pipe)) {
            var onFinish = _.isFunction(secondArg) ? secondArg : defaultReadableOnFinish;
            pipeReadable(xs, onFinish, self);
            return this;
        } else if (_.isFunction(xs.then)) {
            return promiseStream(xs);
        }
        else if (_.isFunction(xs.next)) {
                return iteratorStream(xs);
            } else if (!_.isUndefined(_global.Symbol) && xs[_global.Symbol.iterator]) {
                return iteratorStream(xs[_global.Symbol.iterator]());
            } else {
                throw new Error('Object was not a stream, promise, iterator or iterable: ' + typeof xs);
            }
    } else if (_.isString(xs)) {
        var mapper = hintMapper(mappingHint);
        var callback_func = function () {
            var ctx = mapper.apply(this, arguments);
            self.write(ctx);
        };
        secondArg.on(xs, callback_func);
        var removeMethod = secondArg.removeListener
        || secondArg.unbind;
        if (removeMethod) {
            this._destructors.push(function () {
                removeMethod.call(secondArg, xs, callback_func);
            });
        }
        return this;
    } else {
        throw new Error('Unexpected argument type to Stream(): ' + typeof xs);
    }
}
inherits(Stream, EventEmitter);
_.of = function (x) {
    return _([x]);
};
_.fromError = function (error) {
    return _(function (push) {
        push(error);
        push(null, _.nil);
    });
};
function exposeMethod(name) {
    var f = Stream.prototype[name];
    var n = f.length;
    _[name] = _.ncurry(n + 1, function () {
        var args = slice.call(arguments);
        var s = _(args.pop());
        return f.apply(s, args);
    });
}
function StreamError(err) {
    this.__HighlandStreamError__ = true;
    this.error = err;
}
function StreamRedirect(to) {
    this.__HighlandStreamRedirect__ = true;
    this.to = to;
}
_.isStream = function (x) {
    return _.isObject(x) && !!x.__HighlandStream__;
};
_._isStreamError = function (x) {
    return _.isObject(x) && !!x.__HighlandStreamError__;
};
_._isStreamRedirect = function (x) {
    return _.isObject(x) && !!x.__HighlandStreamRedirect__;
};
Stream.prototype._send = function (err, x) {
    var token;
    if (this._consumers.length) {
        token = err ? new StreamError(err) : x;
        var consumers = this._consumers;
        for (var i = 0, len = consumers.length; i < len; i++) {
            consumers[i].write(token);
        }
    }
    if (this._observers.length) {
        token = err ? new StreamError(err) : x;
        var observers = this._observers;
        for (var j = 0, len2 = observers.length; j < len2; j++) {
            observers[j].write(token);
        }
    }
    if (this._send_events) {
        if (err) {
            this.emit('error', err);
        } else if (x === nil) {
            this.emit('end');
        } else {
            this.emit('data', x);
        }
    }
    if (x === nil) {
        this._onEnd();
    }
};
Stream.prototype._onEnd = function _onEnd() {
    if (this.ended) {
        return;
    }
    this.pause();
    this.ended = true;
    if (this.source) {
        var source = this.source;
        source._removeConsumer(this);
        source._removeObserver(this);
    }
    var i, len;
    var consumers = this._consumers;
    for (i = 0, len = consumers.length; i < len; i++) {
        this._removeConsumer(consumers[i]);
    }
    var observer;
    for (i = 0, len = this._observers.length; i < len; i++) {
        observer = this._observers[i];
        if (observer.source === this) {
            observer.source = null;
        }
    }
    for (i = 0, len = this._destructors.length; i < len; i++) {
        this._destructors[i].call(this);
    }
    this.source = null;
    this._consumers = [];
    this._incoming = [];
    this._outgoing = [];
    this._delegate = null;
    this._generator = null;
    this._observers = [];
    this._destructors = [];
};
Stream.prototype.pause = function () {
    this.paused = true;
    if (!this._is_observer && this.source) {
        this.source._checkBackPressure();
    }
};
Stream.prototype._checkBackPressure = function () {
    if (!this._consumers.length) {
        this._repeat_resume = false;
        this.pause();
        return;
    }
    for (var i = 0, len = this._consumers.length; i < len; i++) {
        if (this._consumers[i].paused) {
            this._repeat_resume = false;
            this.pause();
            return;
        }
    }
    this._resume(false);
};
Stream.prototype._readFromBuffer = function () {
    var len = this._incoming.length;
    var i = 0;
    while (i < len && !this.paused) {
        var x = this._incoming[i];
        if (_._isStreamError(x)) {
            this._send(x.error);
        } else if (_._isStreamRedirect(x)) {
            this._redirect(x.to);
        } else {
            this._send(null, x);
        }
        i++;
    }
    this._incoming.splice(0, i);
};
Stream.prototype._sendOutgoing = function () {
    var len = this._outgoing.length;
    var i = 0;
    while (i < len && !this.paused) {
        var x = this._outgoing[i];
        if (_._isStreamError(x)) {
            Stream.prototype._send.call(this, x.error);
        } else if (_._isStreamRedirect(x)) {
            this._redirect(x.to);
        } else {
            Stream.prototype._send.call(this, null, x);
        }
        i++;
    }
    this._outgoing.splice(0, i);
};
Stream.prototype._resume = function (forceResumeSource) {
    if (this._resume_running || this._in_consume_cb) {
        this._repeat_resume = true;
        return;
    }
    this._resume_running = true;
    do {
        this._repeat_resume = false;
        this.paused = false;
        this._sendOutgoing();
        this._readFromBuffer();
        if (!this.paused && !this._is_observer) {
            if (this.source) {
                if (!this._consume_waiting_for_next || forceResumeSource) {
                    this.source._checkBackPressure();
                }
            }
            else if (this._generator) {
                    this._runGenerator();
                } else {
                    this.emit('drain');
                }
        }
    } while (this._repeat_resume);
    this._resume_running = false;
};
Stream.prototype.resume = function () {
    this._resume(true);
};
Stream.prototype.end = function () {
    if (this._nil_pushed) {
        return;
    }
    this.write(nil);
};
Stream.prototype.pipe = function (dest, options) {
    options = options || {};
    var canClose = dest !== process.stdout && dest !== process.stderr && options.end !== false;
    var end;
    if (canClose) {
        end = dest.end;
    } else {
        end = nop;
    }
    return pipeStream(this, dest, dest.write, end, false);
};
Stream.prototype.destroy = function () {
    if (this.ended) {
        return;
    }
    if (!this._nil_pushed) {
        this.end();
    }
    this._onEnd();
};
Stream.prototype._runGenerator = function () {
    if (this._generator_running) {
        return;
    }
    this._generator_running = true;
    this._generator(this._generator_push, this._generator_next);
};
Stream.prototype._redirect = function (to) {
    to = _(to);
    while (to._delegate) {
        to = to._delegate;
    }
    to._consumers = this._consumers.map(function (c) {
        c.source = to;
        return c;
    });
    this._consumers = [];
    to._delegate_source = this._delegate_source || this;
    to._delegate_source._delegate = to;
    if (this.paused) {
        to.pause();
    } else {
        this.pause();
        to._checkBackPressure();
    }
};
Stream.prototype._addConsumer = function (s) {
    if (this._consumers.length) {
        throw new Error('Stream already being consumed, you must either fork() or observe()');
    }
    s.source = this;
    this._consumers.push(s);
    this._checkBackPressure();
};
Stream.prototype._removeConsumer = function (s) {
    var src = this;
    while (src._delegate) {
        src = src._delegate;
    }
    src._consumers = src._consumers.filter(function (c) {
        return c !== s;
    });
    if (s.source === src) {
        s.source = null;
    }
    src._checkBackPressure();
};
Stream.prototype._removeObserver = function (s) {
    this._observers = this._observers.filter(function (o) {
        return o !== s;
    });
    if (s.source === this) {
        s.source = null;
    }
};
Stream.prototype.consume = function (f) {
    var self = this;
    while (self._delegate) {
        self = self._delegate;
    }
    var s = new Stream();
    s._is_consumer = true;
    var async;
    var next_called;
    var _send = s._send;
    var push = function (err, x) {
        if (s._nil_pushed) {
            throw new Error('Cannot write to stream after nil');
        }
        if (x === nil) {
            s._nil_pushed = true;
            s._consume_waiting_for_next = false;
            self._removeConsumer(s);
            if (async) {
                s._resume(false);
            }
        }
        if (s.paused) {
            if (err) {
                s._outgoing.push(new StreamError(err));
            } else {
                s._outgoing.push(x);
            }
        } else {
            _send.call(s, err, x);
        }
    };
    var next = function (s2) {
        s._consume_waiting_for_next = false;
        if (s._nil_pushed) {
            throw new Error('Cannot call next after nil');
        }
        if (s2) {
            var _paused = s.paused;
            if (!_paused) {
                s.pause();
            }
            s.write(new StreamRedirect(s2));
            if (!_paused) {
                s._resume(false);
            }
        } else if (async) {
            s._resume(false);
        } else {
            next_called = true;
        }
    };
    s._send = function (err, x) {
        async = false;
        next_called = false;
        s._in_consume_cb = true;
        f(err, x, push, next);
        s._in_consume_cb = false;
        async = true;
        if (!next_called && x !== nil) {
            s._consume_waiting_for_next = true;
            s.pause();
        }
        if (s._repeat_resume) {
            s._repeat_resume = false;
            s._resume(false);
        }
    };
    self._addConsumer(s);
    self._already_consumed = true;
    return s;
};
exposeMethod('consume');
Stream.prototype.pull = function (f) {
    var s = this.consume(function (err, x) {
        s.source._removeConsumer(s);
        f(err, x);
    });
    s.id = 'pull:' + s.id;
    s.resume();
};
Stream.prototype.write = function (x) {
    if (this._nil_pushed) {
        throw new Error('Cannot write to stream after nil');
    }
    if (x === _.nil && !this._is_consumer) {
        this._nil_pushed = true;
    }
    if (this.paused) {
        this._incoming.push(x);
    } else {
        if (_._isStreamError(x)) {
            this._send(x.error);
        } else {
            this._send(null, x);
        }
    }
    return !this.paused;
};
var warnForkAfterConsume = node(function () {}, 'Highland: Calling Stream.fork() on a stream that has already been consumed is deprecated. Always call fork() on a stream that is meant to be forked.');
Stream.prototype.fork = function () {
    if (this._already_consumed) {
        warnForkAfterConsume();
    }
    var s = new Stream();
    s.id = 'fork:' + s.id;
    s.source = this;
    this._consumers.push(s);
    this._checkBackPressure();
    return s;
};
Stream.prototype.observe = function () {
    var s = new Stream();
    s.id = 'observe:' + s.id;
    s.source = this;
    s._is_observer = true;
    this._observers.push(s);
    return s;
};
Stream.prototype.errors = function (f) {
    return this.consume(function (err, x, push, next) {
        if (err) {
            f(err, push);
            next();
        } else if (x === nil) {
            push(null, nil);
        } else {
            push(null, x);
            next();
        }
    });
};
exposeMethod('errors');
Stream.prototype.stopOnError = function (f) {
    return this.consume(function (err, x, push, next) {
        if (err) {
            f(err, push);
            push(null, nil);
        } else if (x === nil) {
            push(null, nil);
        } else {
            push(null, x);
            next();
        }
    });
};
exposeMethod('stopOnError');
Stream.prototype.each = function (f) {
    var self = this;
    var s = this.consume(function (err, x, push, next) {
        if (err) {
            self.emit('error', err);
        } else if (x === nil) {
            push(null, nil);
        } else {
            f(x);
            next();
        }
    });
    s.resume();
    return s;
};
exposeMethod('each');
Stream.prototype.apply = function (f) {
    return this.toArray(function (args) {
        f.apply(null, args);
    });
};
exposeMethod('apply');
Stream.prototype.toArray = function (f) {
    var self = this;
    return this.collect().pull(function (err, x) {
        if (err) {
            self.emit('error', err);
        } else {
            f(x);
        }
    });
};
Stream.prototype.done = function (f) {
    if (this.ended) {
        f();
        return null;
    }
    var self = this;
    return this.consume(function (err, x, push, next) {
        if (err) {
            self.emit('error', err);
        } else if (x === nil) {
            f();
        } else {
            next();
        }
    }).resume();
};
Stream.prototype.toCallback = function (cb) {
    var value;
    var hasValue = false;
    this.consume(function (err, x, push, next) {
        if (err) {
            push(null, nil);
            if (hasValue) {
                cb(new Error('toCallback called on stream emitting multiple values'));
            } else {
                cb(err);
            }
        } else if (x === nil) {
            if (hasValue) {
                cb(null, value);
            } else {
                cb();
            }
        } else {
            if (hasValue) {
                push(null, nil);
                cb(new Error('toCallback called on stream emitting multiple values'));
            } else {
                value = x;
                hasValue = true;
                next();
            }
        }
    }).resume();
};
var warnMapWithValue = node(function () {}, 'Highland: Calling Stream.map() with a non-function argument is deprecated.');
Stream.prototype.map = function (f) {
    if (!_.isFunction(f)) {
        warnMapWithValue();
        var val = f;
        f = function () {
            return val;
        };
    }
    return this.consume(function (err, x, push, next) {
        if (err) {
            push(err);
            next();
        } else if (x === nil) {
            push(err, x);
        } else {
            var fnVal, fnErr;
            try {
                fnVal = f(x);
            } catch (e) {
                fnErr = e;
            }
            push(fnErr, fnVal);
            next();
        }
    });
};
exposeMethod('map');
Stream.prototype.doto = function (f) {
    return this.map(function (x) {
        f(x);
        return x;
    });
};
exposeMethod('doto');
Stream.prototype.tap = Stream.prototype.doto;
_.tap = _.doto;
Stream.prototype.ratelimit = function (num, ms) {
    if (num < 1) {
        throw new Error('Invalid number of operations per ms: ' + num);
    }
    var sent = 0;
    return this.consume(function (err, x, push, next) {
        if (err) {
            push(err);
            next();
        } else if (x === nil) {
            push(null, nil);
        } else {
            if (sent < num) {
                sent++;
                push(null, x);
                next();
            } else {
                setTimeout(function () {
                    sent = 1;
                    push(null, x);
                    next();
                }, ms);
            }
        }
    });
};
exposeMethod('ratelimit');
Stream.prototype.flatMap = function (f) {
    return this.map(f).sequence();
};
exposeMethod('flatMap');
Stream.prototype.pluck = function (prop) {
    return this.consume(function (err, x, push, next) {
        if (err) {
            push(err);
            next();
        } else if (x === nil) {
            push(err, x);
        } else if (_.isObject(x)) {
            push(null, x[prop]);
            next();
        } else {
            push(new Error('Expected Object, got ' + typeof x));
            next();
        }
    });
};
exposeMethod('pluck');
var objectOnly = _.curry(function (strategy, x) {
    if (_.isObject(x)) {
        return strategy(x);
    } else {
        throw new Error('Expected Object, got ' + typeof x);
    }
});
Stream.prototype.pickBy = function (f) {
    return this.map(objectOnly(function (x) {
        var out = {};
        var seen = isES5 ? Object.create(null) : {};
        var obj = x;
        function testAndAdd(prop) {
            if (seen[prop] !== true && f(prop, x[prop])) {
                out[prop] = x[prop];
                seen[prop] = true;
            }
        }
        if (isES5) {
            do {
                Object.getOwnPropertyNames(obj).forEach(testAndAdd);
                obj = Object.getPrototypeOf(obj);
            } while (obj);
        } else {
            for (var k in x) {
                testAndAdd(k);
            }
        }
        return out;
    }));
};
exposeMethod('pickBy');
Stream.prototype.pick = function (properties) {
    return this.map(objectOnly(function (x) {
        var out = {};
        for (var i = 0, length = properties.length; i < length; i++) {
            var p = properties[i];
            if (p in x) {
                out[p] = x[p];
            }
        }
        return out;
    }));
};
exposeMethod('pick');
Stream.prototype.filter = function (f) {
    return this.consume(function (err, x, push, next) {
        if (err) {
            push(err);
            next();
        } else if (x === nil) {
            push(err, x);
        } else {
            var fnVal, fnErr;
            try {
                fnVal = f(x);
            } catch (e) {
                fnErr = e;
            }
            if (fnErr) {
                push(fnErr);
            } else if (fnVal) {
                push(null, x);
            }
            next();
        }
    });
};
exposeMethod('filter');
Stream.prototype.flatFilter = function (f) {
    return this.flatMap(function (x) {
        return f(x).take(1).otherwise(errorStream()).flatMap(function (bool) {
            return _(bool ? [x] : []);
        });
    });
    function errorStream() {
        return _(function (push) {
            push(new Error('Stream returned by function was empty.'));
            push(null, _.nil);
        });
    }
};
exposeMethod('flatFilter');
Stream.prototype.reject = function (f) {
    return this.filter(_.compose(_.not, f));
};
exposeMethod('reject');
Stream.prototype.find = function (f) {
    return this.filter(f).take(1);
};
exposeMethod('find');
Stream.prototype.findWhere = function (props) {
    return this.where(props).take(1);
};
exposeMethod('findWhere');
Stream.prototype.group = function (f) {
    var lambda = _.isString(f) ? _.get(f) : f;
    return this.reduce({}, function (m, o) {
        var key = lambda(o);
        if (!hasOwn.call(m, key)) {
            m[key] = [];
        }
        m[key].push(o);
        return m;
    });
};
exposeMethod('group');
Stream.prototype.compact = function () {
    return this.filter(function (x) {
        return x;
    });
};
exposeMethod('compact');
Stream.prototype.where = function (props) {
    return this.filter(function (x) {
        for (var k in props) {
            if (x[k] !== props[k]) {
                return false;
            }
        }
        return true;
    });
};
exposeMethod('where');
Stream.prototype.uniqBy = function (compare) {
    var uniques = [];
    return this.consume(function (err, x, push, next) {
        if (err) {
            push(err);
            next();
        } else if (x === nil) {
            push(err, x);
        } else {
            var seen = false;
            var hasErr;
            for (var i = 0, len = uniques.length; i < len; i++) {
                try {
                    seen = compare(x, uniques[i]);
                } catch (e) {
                    hasErr = e;
                    seen = true;
                }
                if (seen) {
                    break;
                }
            }
            if (!seen) {
                uniques.push(x);
                push(null, x);
            }
            if (hasErr) {
                push(hasErr);
            }
            next();
        }
    });
};
exposeMethod('uniqBy');
Stream.prototype.uniq = function () {
    if (!_.isUndefined(_global.Set)) {
        var uniques = new _global.Set(),
            size = uniques.size;
        return this.consume(function (err, x, push, next) {
            if (err) {
                push(err);
                next();
            } else if (x === nil) {
                push(err, x);
            }
            else if (x !== x) {
                    push(null, x);
                    next();
                } else {
                    uniques.add(x);
                    if (uniques.size > size) {
                        size = uniques.size;
                        push(null, x);
                    }
                    next();
                }
        });
    }
    return this.uniqBy(function (a, b) {
        return a === b;
    });
};
exposeMethod('uniq');
Stream.prototype.zipAll0 = function () {
    var returned = 0;
    var z = [];
    var finished = false;
    function nextValue(index, max, src, push, next) {
        src.pull(function (err, x) {
            if (err) {
                push(err);
                nextValue(index, max, src, push, next);
            } else if (x === _.nil) {
                if (!finished) {
                    finished = true;
                    push(null, nil);
                }
            } else {
                returned++;
                z[index] = x;
                if (returned === max) {
                    push(null, z);
                    next();
                }
            }
        });
    }
    return this.collect().flatMap(function (array) {
        if (!array.length) {
            return _([]);
        }
        return _(function (push, next) {
            returned = 0;
            z = [];
            for (var i = 0, length = array.length; i < length; i++) {
                nextValue(i, length, array[i], push, next);
            }
        });
    });
};
exposeMethod('zipAll0');
Stream.prototype.zipAll = function (ys) {
    return _([this]).concat(_(ys).map(_)).zipAll0();
};
exposeMethod('zipAll');
Stream.prototype.zip = function (ys) {
    return _([this, _(ys)]).zipAll0();
};
exposeMethod('zip');
Stream.prototype.batch = function (n) {
    return this.batchWithTimeOrCount(-1, n);
};
exposeMethod('batch');
Stream.prototype.batchWithTimeOrCount = function (ms, n) {
    var batched = [],
        timeout;
    return this.consume(function (err, x, push, next) {
        if (err) {
            push(err);
            next();
        } else if (x === nil) {
            if (batched.length > 0) {
                push(null, batched);
                clearTimeout(timeout);
            }
            push(null, nil);
        } else {
            batched.push(x);
            if (batched.length === n) {
                push(null, batched);
                batched = [];
                clearTimeout(timeout);
            } else if (batched.length === 1 && ms >= 0) {
                timeout = setTimeout(function () {
                    push(null, batched);
                    batched = [];
                }, ms);
            }
            next();
        }
    });
};
exposeMethod('batchWithTimeOrCount');
Stream.prototype.intersperse = function (separator) {
    var started = false;
    return this.consume(function (err, x, push, next) {
        if (err) {
            push(err);
            next();
        } else if (x === nil) {
            push(null, nil);
        } else {
            if (started) {
                push(null, separator);
            } else {
                started = true;
            }
            push(null, x);
            next();
        }
    });
};
exposeMethod('intersperse');
Stream.prototype.splitBy = function (sep) {
    var decoder = new Decoder();
    var buffer = false;
    function drain(x, push) {
        buffer = (buffer || '') + decoder.write(x);
        var pieces = buffer.split(sep);
        buffer = pieces.pop();
        pieces.forEach(function (piece) {
            push(null, piece);
        });
    }
    return this.consume(function (err, x, push, next) {
        if (err) {
            push(err);
            next();
        } else if (x === nil) {
            if (_.isString(buffer)) {
                drain(decoder.end(), push);
                push(null, buffer);
            }
            push(null, nil);
        } else {
            drain(x, push);
            next();
        }
    });
};
exposeMethod('splitBy');
Stream.prototype.split = function () {
    return this.splitBy(/\r?\n/);
};
exposeMethod('split');
Stream.prototype.slice = function (start, end) {
    var index = 0;
    start = typeof start != 'number' || start < 0 ? 0 : start;
    end = typeof end != 'number' ? Infinity : end;
    if (start === 0 && end === Infinity) {
        return this;
    } else if (start >= end) {
        return _([]);
    }
    var s = this.consume(function (err, x, push, next) {
        var done = x === nil;
        if (err) {
            push(err);
        } else if (!done && index++ >= start) {
            push(null, x);
        }
        if (!done && index < end) {
            next();
        } else {
            push(null, nil);
        }
    });
    s.id = 'slice:' + s.id;
    return s;
};
exposeMethod('slice');
Stream.prototype.take = function (n) {
    var s = this.slice(0, n);
    s.id = 'take:' + s.id;
    return s;
};
exposeMethod('take');
Stream.prototype.drop = function (n) {
    return this.slice(n, Infinity);
};
exposeMethod('drop');
Stream.prototype.head = function () {
    return this.take(1);
};
exposeMethod('head');
Stream.prototype.last = function () {
    var nothing = {};
    var prev = nothing;
    return this.consume(function (err, x, push, next) {
        if (err) {
            push(err);
            next();
        } else if (x === nil) {
            if (prev !== nothing) {
                push(null, prev);
            }
            push(null, nil);
        } else {
            prev = x;
            next();
        }
    });
};
exposeMethod('last');
Stream.prototype.sortBy = function (f) {
    return this.collect().invoke('sort', [f]).sequence();
};
exposeMethod('sortBy');
Stream.prototype.sort = function () {
    return this.sortBy();
};
exposeMethod('sort');
Stream.prototype.through = function (target) {
    var output;
    if (_.isFunction(target)) {
        return target(this);
    } else {
        target.pause();
        output = _();
        this.on('error', writeErr);
        target.on('error', writeErr);
        return this.pipe(target).pipe(output);
    }
    function writeErr(err) {
        output.write(new StreamError(err));
    }
};
exposeMethod('through');
_.pipeline = function () /*through...*/{
    if (!arguments.length) {
        return _();
    }
    var start = arguments[0],
        rest,
        startHighland;
    if (!_.isStream(start) && !_.isFunction(start.resume)) {
        start = _();
        startHighland = start;
        rest = slice.call(arguments);
    } else {
        startHighland = _(start);
        rest = slice.call(arguments, 1);
    }
    var end = rest.reduce(function (src, dest) {
        return src.through(dest);
    }, startHighland);
    var wrapper = _(function (push, next) {
        end.pull(function (err, x) {
            push(err, x);
            if (x !== nil) {
                next();
            }
        });
    });
    wrapper.write = function (x) {
        return start.write(x);
    };
    wrapper.end = function () {
        return start.end();
    };
    start.on('drain', function () {
        wrapper.emit('drain');
    });
    return wrapper;
};
Stream.prototype.sequence = function () {
    var original = this;
    var curr = this;
    return _(function (push, next) {
        curr.pull(function (err, x) {
            if (err) {
                push(err);
                next();
            } else if (_.isArray(x)) {
                if (onOriginalStream()) {
                    x.forEach(function (y) {
                        push(null, y);
                    });
                } else {
                    push(null, x);
                }
                next();
            } else if (_.isStream(x)) {
                if (onOriginalStream()) {
                    curr = x;
                    next();
                } else {
                    push(null, x);
                    next();
                }
            } else if (x === nil) {
                if (onOriginalStream()) {
                    push(null, nil);
                } else {
                    curr = original;
                    next();
                }
            } else {
                if (onOriginalStream()) {
                    push(new Error('Expected Stream, got ' + typeof x));
                    next();
                } else {
                    push(null, x);
                    next();
                }
            }
        });
    });
    function onOriginalStream() {
        return curr === original;
    }
};
exposeMethod('sequence');
Stream.prototype.series = Stream.prototype.sequence;
_.series = _.sequence;
Stream.prototype.flatten = function () {
    var curr = this;
    var stack = [];
    return _(function (push, next) {
        curr.pull(function (err, x) {
            if (err) {
                push(err);
                next();
                return;
            }
            if (_.isArray(x)) {
                x = _(x);
            }
            if (_.isStream(x)) {
                stack.push(curr);
                curr = x;
                next();
            } else if (x === nil) {
                if (stack.length) {
                    curr = stack.pop();
                    next();
                } else {
                    push(null, nil);
                }
            } else {
                push(null, x);
                next();
            }
        });
    });
};
exposeMethod('flatten');
Stream.prototype.parallel = function (n) {
    var source = this;
    var running = [];
    var ended = false;
    var reading_source = false;
    if (typeof n !== 'number') {
        throw new Error('Must specify a number to parallel().');
    }
    if (n <= 0) {
        throw new Error('The parallelism factor must be positive');
    }
    return _(function (push, next) {
        if (running.length < n && !ended && !reading_source) {
            reading_source = true;
            source.pull(function (err, x) {
                reading_source = false;
                if (err) {
                    push(err);
                } else if (x === nil) {
                    ended = true;
                } else if (!_.isStream(x)) {
                    push(new Error('Expected Stream, got ' + typeof x));
                } else {
                    var run = { stream: x, buffer: [] };
                    running.push(run);
                    x.consume(function (_err, y, _push, _next) {
                        if (running[0] === run) {
                            if (y === nil) {
                                running.shift();
                                flushBuffer();
                                next();
                            } else {
                                push(_err, y);
                            }
                        } else {
                            run.buffer.push([_err, y]);
                        }
                        if (y !== nil) {
                            _next();
                        }
                    }).resume();
                }
                return next();
            });
        } else if (!running.length && ended) {
            push(null, nil);
        }
        function flushBuffer() {
            while (running.length && running[0].buffer.length) {
                var buf = running[0].buffer;
                for (var i = 0; i < buf.length; i++) {
                    if (buf[i][1] === nil) {
                        running.shift();
                        break;
                    } else {
                        push.apply(null, buf[i]);
                    }
                }
                buf.length = 0;
            }
        }
    });
};
exposeMethod('parallel');
Stream.prototype.otherwise = function (ys) {
    var xs = this;
    return xs.consume(function (err, x, push, next) {
        if (err) {
            push(err);
            next();
        } else if (x === nil) {
            if (_.isFunction(ys)) {
                next(ys());
            } else {
                next(ys);
            }
        } else {
            push(null, x);
            next(xs);
        }
    });
};
exposeMethod('otherwise');
Stream.prototype.append = function (y) {
    return this.consume(function (err, x, push, next) {
        if (x === nil) {
            push(null, y);
            push(null, _.nil);
        } else {
            push(err, x);
            next();
        }
    });
};
exposeMethod('append');
Stream.prototype.reduce = function (z, f) {
    return this.consume(function (err, x, push, next) {
        if (x === nil) {
            push(null, z);
            push(null, _.nil);
        } else if (err) {
            push(err);
            next();
        } else {
            try {
                z = f(z, x);
            } catch (e) {
                push(e);
                push(null, _.nil);
                return;
            }
            next();
        }
    });
};
exposeMethod('reduce');
Stream.prototype.reduce1 = function (f) {
    var self = this;
    return _(function (push, next) {
        self.pull(function (err, x) {
            if (err) {
                push(err);
                next();
            } else if (x === nil) {
                push(null, nil);
            } else {
                next(self.reduce(x, f));
            }
        });
    });
};
exposeMethod('reduce1');
Stream.prototype.collect = function () {
    var xs = [];
    return this.consume(function (err, x, push, next) {
        if (err) {
            push(err);
            next();
        } else if (x === nil) {
            push(null, xs);
            push(null, nil);
        } else {
            xs.push(x);
            next();
        }
    });
};
exposeMethod('collect');
Stream.prototype.scan = function (z, f) {
    var self = this;
    return _([z]).concat(self.consume(function (err, x, push, next) {
        if (x === nil) {
            push(null, _.nil);
        } else if (err) {
            push(err);
            next();
        } else {
            try {
                z = f(z, x);
            } catch (e) {
                push(e);
                push(null, _.nil);
                return;
            }
            push(null, z);
            next();
        }
    }));
};
exposeMethod('scan');
Stream.prototype.scan1 = function (f) {
    var self = this;
    return _(function (push, next) {
        self.pull(function (err, x) {
            if (err) {
                push(err);
                next();
            } else if (x === nil) {
                push(null, nil);
            } else {
                next(self.scan(x, f));
            }
        });
    });
};
exposeMethod('scan1');
function HighlandTransform(push) {
    this.push = push;
}
HighlandTransform.prototype['@@transducer/init'] = function () {
    return this.push;
};
HighlandTransform.prototype['@@transducer/result'] = function (push) {
    return push;
};
HighlandTransform.prototype['@@transducer/step'] = function (push, input) {
    push(null, input);
    return push;
};
Stream.prototype.transduce = function transduce(xf) {
    var transform = null,
        memo = null;
    return this.consume(function (err, x, push, next) {
        if (transform == null) {
            transform = xf(new HighlandTransform(push));
            memo = transform['@@transducer/init']();
        }
        if (err) {
            push(err);
            next();
        } else if (x === _.nil) {
            runResult(push, memo);
        } else {
            var res = runStep(push, memo, x);
            if (!res) {
                return;
            }
            memo = res;
            if (memo['@@transducer/reduced']) {
                runResult(memo['@@transducer/value']);
            } else {
                next();
            }
        }
    });
    function runResult(push, _memo) {
        try {
            transform['@@transducer/result'](_memo);
        } catch (e) {
            push(e);
        }
        push(null, _.nil);
    }
    function runStep(push, _memo, x) {
        try {
            return transform['@@transducer/step'](_memo, x);
        } catch (e) {
            push(e);
            push(null, _.nil);
            return null;
        }
    }
};
exposeMethod('transduce');
Stream.prototype.concat = function (ys) {
    ys = _(ys);
    return this.consume(function (err, x, push, next) {
        if (x === nil) {
            next(ys);
        } else {
            push(err, x);
            next();
        }
    });
};
exposeMethod('concat');
Stream.prototype.merge = function () {
    var self = this;
    var srcs = [];
    var srcsNeedPull = [],
        first = true,
        async = false;
    return _(function (push, next) {
        if (first) {
            first = false;
            getSourcesSync(push, next);
        }
        if (srcs.length === 0) {
            push(null, nil);
        } else if (srcsNeedPull.length) {
            pullFromAllSources(push, next);
            next();
        } else {
            async = true;
        }
    });
    function srcPullHandler(push, next, src) {
        return function (err, x) {
            if (err) {
                push(err);
                srcsNeedPull.push(src);
            } else if (x === nil) {
                srcs = srcs.filter(function (s) {
                    return s !== src;
                });
            } else {
                if (src === self) {
                    srcs.push(x);
                    srcsNeedPull.push(x);
                    srcsNeedPull.unshift(self);
                } else {
                    push(null, x);
                    srcsNeedPull.push(src);
                }
            }
            if (async) {
                async = false;
                next();
            }
        };
    }
    function pullFromAllSources(push, next) {
        var _srcs = srcsNeedPull;
        srcsNeedPull = [];
        _srcs.forEach(function (src) {
            src.pull(srcPullHandler(push, next, src));
        });
    }
    function getSourcesSync(push, next) {
        var asynchronous;
        var done = false;
        var pull_cb = function (err, x) {
            asynchronous = false;
            if (done) {
                srcPullHandler(push, next, self)(err, x);
            } else {
                if (err) {
                    push(err);
                } else if (x === nil) {
                    done = true;
                } else {
                    srcs.push(x);
                    srcsNeedPull.push(x);
                }
            }
        };
        while (!done) {
            asynchronous = true;
            self.pull(pull_cb);
            if (asynchronous) {
                done = true;
                srcs.unshift(self);
            }
        }
    }
};
exposeMethod('merge');
Stream.prototype.mergeWithLimit = function (n) {
    var self = this;
    var processCount = 0;
    var waiting = false;
    if (typeof n !== 'number' || n < 1) {
        throw new Error('mergeWithLimit expects a positive number, but got: ' + n);
    }
    if (n === Infinity) {
        return this.merge();
    }
    return _(function (push, next) {
        self.pull(function (err, x) {
            var done = x === nil;
            if (err) {
                push(err);
                next();
            } else if (x === nil) {
                push(null, nil);
            } else {
                processCount++;
                push(err, x);
                x._destructors.push(function () {
                    processCount--;
                    if (waiting) {
                        waiting = false;
                        next();
                    }
                });
                if (!done && processCount < n) {
                    next();
                } else {
                    waiting = true;
                }
            }
        });
    }).merge();
};
exposeMethod('mergeWithLimit');
Stream.prototype.invoke = function (method, args) {
    return this.map(function (x) {
        return x[method].apply(x, args);
    });
};
exposeMethod('invoke');
Stream.prototype.nfcall = function (args) {
    return this.map(function (x) {
        return _.wrapCallback(x).apply(x, args);
    });
};
exposeMethod('nfcall');
Stream.prototype.throttle = function (ms) {
    var last = 0 - ms;
    return this.consume(function (err, x, push, next) {
        var now = new Date().getTime();
        if (err) {
            push(err);
            next();
        } else if (x === nil) {
            push(null, nil);
        } else if (now - ms >= last) {
            last = now;
            push(null, x);
            next();
        } else {
            next();
        }
    });
};
exposeMethod('throttle');
Stream.prototype.debounce = function (ms) {
    var t = null;
    var nothing = {};
    var last = nothing;
    return this.consume(function (err, x, push, next) {
        if (err) {
            push(err);
            next();
        } else if (x === nil) {
            if (t) {
                clearTimeout(t);
            }
            if (last !== nothing) {
                push(null, last);
            }
            push(null, nil);
        } else {
            last = x;
            if (t) {
                clearTimeout(t);
            }
            t = setTimeout(push.bind(this, null, x), ms);
            next();
        }
    });
};
exposeMethod('debounce');
Stream.prototype.latest = function () {
    var nothing = {},
        latest = nothing,
        errors = [],
        ended = false,
        onValue = null;
    this.consume(function (err, x, push, next) {
        if (onValue != null) {
            var cb = onValue;
            onValue = null;
            cb(err, x);
        }
        if (err) {
            errors.push(err);
            next();
        } else if (x === nil) {
            ended = true;
        } else {
            latest = x;
            next();
        }
    }).resume();
    return _(function (push, next) {
        var oldErrors = errors;
        errors = [];
        if (!oldErrors.length && latest === nothing && !ended) {
            onValue = function (err, x) {
                push(err, x);
                if (x !== nil) {
                    next();
                }
            };
        } else {
            oldErrors.forEach(push);
            if (latest !== nothing) {
                push(null, latest);
            }
            if (ended) {
                push(null, nil);
            } else {
                next();
            }
        }
    });
};
exposeMethod('latest');
_.values = function (obj) {
    return _.keys(obj).map(function (k) {
        return obj[k];
    });
};
function keys(obj) {
    var keysArray = [];
    for (var k in obj) {
        if (hasOwn.call(obj, k)) {
            keysArray.push(k);
        }
    }
    return keysArray;
}
_.keys = function (obj) {
    return _(keys(obj));
};
_.pairs = function (obj) {
    return _.keys(obj).map(function (k) {
        return [k, obj[k]];
    });
};
_.extend = _.curry(function (extensions, target) {
    for (var k in extensions) {
        if (hasOwn.call(extensions, k)) {
            target[k] = extensions[k];
        }
    }
    return target;
});
_.get = _.curry(function (prop, obj) {
    return obj[prop];
});
_.set = _.curry(function (prop, val, obj) {
    obj[prop] = val;
    return obj;
});
_.log = function () {
    console.log.apply(console, arguments);
};
_.wrapCallback = function (f, /*optional*/mappingHint) {
    var mapper = hintMapper(mappingHint);
    return function () {
        var self = this;
        var args = slice.call(arguments);
        return _(function (push) {
            var cb = function (err) {
                if (err) {
                    push(err);
                } else {
                    var cbArgs = slice.call(arguments, 1);
                    var v = mapper.apply(this, cbArgs);
                    push(null, v);
                }
                push(null, nil);
            };
            f.apply(self, args.concat([cb]));
        });
    };
};
function isClass(fn) {
    if (!(typeof fn === 'function' && fn.prototype)) {
        return false;
    }
    var getKeys = isES5 ? Object.getOwnPropertyNames : keys;
    var allKeys = getKeys(fn.prototype);
    return allKeys.length > 0 && !(allKeys.length === 1 && allKeys[0] === 'constructor');
}
function inheritedKeys(obj) {
    var allProps = {};
    var curr = obj;
    var handleProp = function (prop) {
        allProps[prop] = true;
    };
    while (Object.getPrototypeOf(curr)) {
        var props = Object.getOwnPropertyNames(curr);
        props.forEach(handleProp);
        curr = Object.getPrototypeOf(curr);
    }
    return keys(allProps);
}
function streamifyAll(inp, suffix) {
    var getKeys = isES5 ? inheritedKeys : keys;
    var allKeys = getKeys(inp);
    for (var i = 0, len = allKeys.length; i < len; i++) {
        var key = allKeys[i];
        var val;
        try {
            val = inp[key];
        } catch (e) {
        }
        if (val && typeof val === 'function' && !isClass(val) && !val.__HighlandStreamifiedFunction__) {
            var streamified = _.wrapCallback(val);
            streamified.__HighlandStreamifiedFunction__ = true;
            inp[key + suffix] = streamified;
        }
    }
    return inp;
}
_.streamifyAll = function (arg) {
    if (typeof arg !== 'function' && typeof arg !== 'object') {
        throw new TypeError('takes an object or a constructor function');
    }
    var suffix = 'Stream';
    var ret = streamifyAll(arg, suffix);
    if (isClass(arg)) {
        ret.prototype = streamifyAll(arg.prototype, suffix);
    }
    return ret;
};
_.add = _.curry(function (a, b) {
    return a + b;
});
_.not = function (x) {
    return !x;
};
});

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
var encode$1 = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};
var decode$1 = function (charCode) {
  var bigA = 65;
  var bigZ = 90;
  var littleA = 97;
  var littleZ = 122;
  var zero = 48;
  var nine = 57;
  var plus = 43;
  var slash = 47;
  var littleOffset = 26;
  var numberOffset = 52;
  if (bigA <= charCode && charCode <= bigZ) {
    return charCode - bigA;
  }
  if (littleA <= charCode && charCode <= littleZ) {
    return charCode - littleA + littleOffset;
  }
  if (zero <= charCode && charCode <= nine) {
    return charCode - zero + numberOffset;
  }
  if (charCode == plus) {
    return 62;
  }
  if (charCode == slash) {
    return 63;
  }
  return -1;
};
var base64 = {
	encode: encode$1,
	decode: decode$1
};

var VLQ_BASE_SHIFT = 5;
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;
var VLQ_BASE_MASK = VLQ_BASE - 1;
var VLQ_CONTINUATION_BIT = VLQ_BASE;
function toVLQSigned(aValue) {
  return aValue < 0 ? (-aValue << 1) + 1 : (aValue << 1) + 0;
}
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative ? -shifted : shifted;
}
var encode = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;
  var vlq = toVLQSigned(aValue);
  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);
  return encoded;
};
var decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;
  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }
    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }
    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);
  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};
var base64Vlq = {
	encode: encode,
	decode: decode
};

var util$1 = createCommonjsModule(function (module, exports) {
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;
var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;
function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;
function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port;
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;
function normalize(aPath) {
  var path = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = exports.isAbsolute(path);
  var parts = path.split(/\/+/);
  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');
  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }
  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
}
exports.normalize = normalize;
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }
  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }
  var joined = aPath.charAt(0) === '/' ? aPath : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);
  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;
exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || !!aPath.match(urlRegexp);
};
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  aRoot = aRoot.replace(/\/$/, '');
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }
    ++level;
  }
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;
var supportsNullProto = function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}();
function identity(s) {
  return s;
}
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }
  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;
function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }
  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;
function isProtoString(s) {
  if (!s) {
    return false;
  }
  var length = s.length;
  if (length < 9 /* "__proto__".length */) {
      return false;
    }
  if (s.charCodeAt(length - 1) !== 95 /* '_' */ || s.charCodeAt(length - 2) !== 95 /* '_' */ || s.charCodeAt(length - 3) !== 111 /* 'o' */ || s.charCodeAt(length - 4) !== 116 /* 't' */ || s.charCodeAt(length - 5) !== 111 /* 'o' */ || s.charCodeAt(length - 6) !== 114 /* 'r' */ || s.charCodeAt(length - 7) !== 112 /* 'p' */ || s.charCodeAt(length - 8) !== 95 /* '_' */ || s.charCodeAt(length - 9) !== 95 /* '_' */) {
      return false;
    }
  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
        return false;
      }
  }
  return true;
}
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = mappingA.source - mappingB.source;
  if (cmp !== 0) {
    return cmp;
  }
  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }
  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }
  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }
  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }
  return mappingA.name - mappingB.name;
}
exports.compareByOriginalPositions = compareByOriginalPositions;
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }
  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }
  cmp = mappingA.source - mappingB.source;
  if (cmp !== 0) {
    return cmp;
  }
  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }
  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }
  return mappingA.name - mappingB.name;
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;
function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }
  if (aStr1 > aStr2) {
    return 1;
  }
  return -1;
}
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }
  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }
  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }
  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }
  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }
  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;
});

var has = Object.prototype.hasOwnProperty;
function ArraySet$1() {
  this._array = [];
  this._set = Object.create(null);
}
ArraySet$1.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet$1();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};
ArraySet$1.prototype.size = function ArraySet_size() {
  return Object.getOwnPropertyNames(this._set).length;
};
ArraySet$1.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = util$1.toSetString(aStr);
  var isDuplicate = has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    this._set[sStr] = idx;
  }
};
ArraySet$1.prototype.has = function ArraySet_has(aStr) {
  var sStr = util$1.toSetString(aStr);
  return has.call(this._set, sStr);
};
ArraySet$1.prototype.indexOf = function ArraySet_indexOf(aStr) {
  var sStr = util$1.toSetString(aStr);
  if (has.call(this._set, sStr)) {
    return this._set[sStr];
  }
  throw new Error('"' + aStr + '" is not in the set.');
};
ArraySet$1.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};
ArraySet$1.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};
var ArraySet_1 = ArraySet$1;
var arraySet = {
	ArraySet: ArraySet_1
};

var binarySearch = createCommonjsModule(function (module, exports) {
exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    return mid;
  } else if (cmp > 0) {
    if (aHigh - mid > 1) {
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  } else {
    if (mid - aLow > 1) {
      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }
  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }
  return index;
};
});

function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}
function randomIntInRange(low, high) {
  return Math.round(low + Math.random() * (high - low));
}
function doQuickSort(ary, comparator, p, r) {
  if (p < r) {
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;
    swap(ary, pivotIndex, r);
    var pivot = ary[r];
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }
    swap(ary, i + 1, j);
    var q = i + 1;
    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}
var quickSort_1 = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};
var quickSort$1 = {
	quickSort: quickSort_1
};

var ArraySet$2 = arraySet.ArraySet;
var quickSort = quickSort$1.quickSort;
function SourceMapConsumer$1(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }
  return sourceMap.sections != null ? new IndexedSourceMapConsumer(sourceMap) : new BasicSourceMapConsumer(sourceMap);
}
SourceMapConsumer$1.fromSourceMap = function (aSourceMap) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap);
};
SourceMapConsumer$1.prototype._version = 3;
SourceMapConsumer$1.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer$1.prototype, '_generatedMappings', {
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }
    return this.__generatedMappings;
  }
});
SourceMapConsumer$1.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer$1.prototype, '_originalMappings', {
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }
    return this.__originalMappings;
  }
});
SourceMapConsumer$1.prototype._charIsMappingSeparator = function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
  var c = aStr.charAt(index);
  return c === ";" || c === ",";
};
SourceMapConsumer$1.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
  throw new Error("Subclasses must implement _parseMappings");
};
SourceMapConsumer$1.GENERATED_ORDER = 1;
SourceMapConsumer$1.ORIGINAL_ORDER = 2;
SourceMapConsumer$1.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer$1.LEAST_UPPER_BOUND = 2;
SourceMapConsumer$1.prototype.eachMapping = function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
  var context = aContext || null;
  var order = aOrder || SourceMapConsumer$1.GENERATED_ORDER;
  var mappings;
  switch (order) {
    case SourceMapConsumer$1.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer$1.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
  }
  var sourceRoot = this.sourceRoot;
  mappings.map(function (mapping) {
    var source = mapping.source === null ? null : this._sources.at(mapping.source);
    if (source != null && sourceRoot != null) {
      source = util$1.join(sourceRoot, source);
    }
    return {
      source: source,
      generatedLine: mapping.generatedLine,
      generatedColumn: mapping.generatedColumn,
      originalLine: mapping.originalLine,
      originalColumn: mapping.originalColumn,
      name: mapping.name === null ? null : this._names.at(mapping.name)
    };
  }, this).forEach(aCallback, context);
};
SourceMapConsumer$1.prototype.allGeneratedPositionsFor = function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
  var line = util$1.getArg(aArgs, 'line');
  var needle = {
    source: util$1.getArg(aArgs, 'source'),
    originalLine: line,
    originalColumn: util$1.getArg(aArgs, 'column', 0)
  };
  if (this.sourceRoot != null) {
    needle.source = util$1.relative(this.sourceRoot, needle.source);
  }
  if (!this._sources.has(needle.source)) {
    return [];
  }
  needle.source = this._sources.indexOf(needle.source);
  var mappings = [];
  var index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util$1.compareByOriginalPositions, binarySearch.LEAST_UPPER_BOUND);
  if (index >= 0) {
    var mapping = this._originalMappings[index];
    if (aArgs.column === undefined) {
      var originalLine = mapping.originalLine;
      while (mapping && mapping.originalLine === originalLine) {
        mappings.push({
          line: util$1.getArg(mapping, 'generatedLine', null),
          column: util$1.getArg(mapping, 'generatedColumn', null),
          lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
        });
        mapping = this._originalMappings[++index];
      }
    } else {
      var originalColumn = mapping.originalColumn;
      while (mapping && mapping.originalLine === line && mapping.originalColumn == originalColumn) {
        mappings.push({
          line: util$1.getArg(mapping, 'generatedLine', null),
          column: util$1.getArg(mapping, 'generatedColumn', null),
          lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
        });
        mapping = this._originalMappings[++index];
      }
    }
  }
  return mappings;
};
var SourceMapConsumer_1 = SourceMapConsumer$1;
function BasicSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }
  var version = util$1.getArg(sourceMap, 'version');
  var sources = util$1.getArg(sourceMap, 'sources');
  var names = util$1.getArg(sourceMap, 'names', []);
  var sourceRoot = util$1.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util$1.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util$1.getArg(sourceMap, 'mappings');
  var file = util$1.getArg(sourceMap, 'file', null);
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }
  sources = sources.map(String)
  .map(util$1.normalize)
  .map(function (source) {
    return sourceRoot && util$1.isAbsolute(sourceRoot) && util$1.isAbsolute(source) ? util$1.relative(sourceRoot, source) : source;
  });
  this._names = ArraySet$2.fromArray(names.map(String), true);
  this._sources = ArraySet$2.fromArray(sources, true);
  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this.file = file;
}
BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer$1.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer$1;
BasicSourceMapConsumer.fromSourceMap = function SourceMapConsumer_fromSourceMap(aSourceMap) {
  var smc = Object.create(BasicSourceMapConsumer.prototype);
  var names = smc._names = ArraySet$2.fromArray(aSourceMap._names.toArray(), true);
  var sources = smc._sources = ArraySet$2.fromArray(aSourceMap._sources.toArray(), true);
  smc.sourceRoot = aSourceMap._sourceRoot;
  smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(), smc.sourceRoot);
  smc.file = aSourceMap._file;
  var generatedMappings = aSourceMap._mappings.toArray().slice();
  var destGeneratedMappings = smc.__generatedMappings = [];
  var destOriginalMappings = smc.__originalMappings = [];
  for (var i = 0, length = generatedMappings.length; i < length; i++) {
    var srcMapping = generatedMappings[i];
    var destMapping = new Mapping();
    destMapping.generatedLine = srcMapping.generatedLine;
    destMapping.generatedColumn = srcMapping.generatedColumn;
    if (srcMapping.source) {
      destMapping.source = sources.indexOf(srcMapping.source);
      destMapping.originalLine = srcMapping.originalLine;
      destMapping.originalColumn = srcMapping.originalColumn;
      if (srcMapping.name) {
        destMapping.name = names.indexOf(srcMapping.name);
      }
      destOriginalMappings.push(destMapping);
    }
    destGeneratedMappings.push(destMapping);
  }
  quickSort(smc.__originalMappings, util$1.compareByOriginalPositions);
  return smc;
};
BasicSourceMapConsumer.prototype._version = 3;
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._sources.toArray().map(function (s) {
      return this.sourceRoot != null ? util$1.join(this.sourceRoot, s) : s;
    }, this);
  }
});
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}
BasicSourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
  var generatedLine = 1;
  var previousGeneratedColumn = 0;
  var previousOriginalLine = 0;
  var previousOriginalColumn = 0;
  var previousSource = 0;
  var previousName = 0;
  var length = aStr.length;
  var index = 0;
  var cachedSegments = {};
  var temp = {};
  var originalMappings = [];
  var generatedMappings = [];
  var mapping, str, segment, end, value;
  while (index < length) {
    if (aStr.charAt(index) === ';') {
      generatedLine++;
      index++;
      previousGeneratedColumn = 0;
    } else if (aStr.charAt(index) === ',') {
      index++;
    } else {
      mapping = new Mapping();
      mapping.generatedLine = generatedLine;
      for (end = index; end < length; end++) {
        if (this._charIsMappingSeparator(aStr, end)) {
          break;
        }
      }
      str = aStr.slice(index, end);
      segment = cachedSegments[str];
      if (segment) {
        index += str.length;
      } else {
        segment = [];
        while (index < end) {
          base64Vlq.decode(aStr, index, temp);
          value = temp.value;
          index = temp.rest;
          segment.push(value);
        }
        if (segment.length === 2) {
          throw new Error('Found a source, but no line and column');
        }
        if (segment.length === 3) {
          throw new Error('Found a source and line, but no column');
        }
        cachedSegments[str] = segment;
      }
      mapping.generatedColumn = previousGeneratedColumn + segment[0];
      previousGeneratedColumn = mapping.generatedColumn;
      if (segment.length > 1) {
        mapping.source = previousSource + segment[1];
        previousSource += segment[1];
        mapping.originalLine = previousOriginalLine + segment[2];
        previousOriginalLine = mapping.originalLine;
        mapping.originalLine += 1;
        mapping.originalColumn = previousOriginalColumn + segment[3];
        previousOriginalColumn = mapping.originalColumn;
        if (segment.length > 4) {
          mapping.name = previousName + segment[4];
          previousName += segment[4];
        }
      }
      generatedMappings.push(mapping);
      if (typeof mapping.originalLine === 'number') {
        originalMappings.push(mapping);
      }
    }
  }
  quickSort(generatedMappings, util$1.compareByGeneratedPositionsDeflated);
  this.__generatedMappings = generatedMappings;
  quickSort(originalMappings, util$1.compareByOriginalPositions);
  this.__originalMappings = originalMappings;
};
BasicSourceMapConsumer.prototype._findMapping = function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName, aColumnName, aComparator, aBias) {
  if (aNeedle[aLineName] <= 0) {
    throw new TypeError('Line must be greater than or equal to 1, got ' + aNeedle[aLineName]);
  }
  if (aNeedle[aColumnName] < 0) {
    throw new TypeError('Column must be greater than or equal to 0, got ' + aNeedle[aColumnName]);
  }
  return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
};
BasicSourceMapConsumer.prototype.computeColumnSpans = function SourceMapConsumer_computeColumnSpans() {
  for (var index = 0; index < this._generatedMappings.length; ++index) {
    var mapping = this._generatedMappings[index];
    if (index + 1 < this._generatedMappings.length) {
      var nextMapping = this._generatedMappings[index + 1];
      if (mapping.generatedLine === nextMapping.generatedLine) {
        mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
        continue;
      }
    }
    mapping.lastGeneratedColumn = Infinity;
  }
};
BasicSourceMapConsumer.prototype.originalPositionFor = function SourceMapConsumer_originalPositionFor(aArgs) {
  var needle = {
    generatedLine: util$1.getArg(aArgs, 'line'),
    generatedColumn: util$1.getArg(aArgs, 'column')
  };
  var index = this._findMapping(needle, this._generatedMappings, "generatedLine", "generatedColumn", util$1.compareByGeneratedPositionsDeflated, util$1.getArg(aArgs, 'bias', SourceMapConsumer$1.GREATEST_LOWER_BOUND));
  if (index >= 0) {
    var mapping = this._generatedMappings[index];
    if (mapping.generatedLine === needle.generatedLine) {
      var source = util$1.getArg(mapping, 'source', null);
      if (source !== null) {
        source = this._sources.at(source);
        if (this.sourceRoot != null) {
          source = util$1.join(this.sourceRoot, source);
        }
      }
      var name = util$1.getArg(mapping, 'name', null);
      if (name !== null) {
        name = this._names.at(name);
      }
      return {
        source: source,
        line: util$1.getArg(mapping, 'originalLine', null),
        column: util$1.getArg(mapping, 'originalColumn', null),
        name: name
      };
    }
  }
  return {
    source: null,
    line: null,
    column: null,
    name: null
  };
};
BasicSourceMapConsumer.prototype.hasContentsOfAllSources = function BasicSourceMapConsumer_hasContentsOfAllSources() {
  if (!this.sourcesContent) {
    return false;
  }
  return this.sourcesContent.length >= this._sources.size() && !this.sourcesContent.some(function (sc) {
    return sc == null;
  });
};
BasicSourceMapConsumer.prototype.sourceContentFor = function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
  if (!this.sourcesContent) {
    return null;
  }
  if (this.sourceRoot != null) {
    aSource = util$1.relative(this.sourceRoot, aSource);
  }
  if (this._sources.has(aSource)) {
    return this.sourcesContent[this._sources.indexOf(aSource)];
  }
  var url;
  if (this.sourceRoot != null && (url = util$1.urlParse(this.sourceRoot))) {
    var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
    if (url.scheme == "file" && this._sources.has(fileUriAbsPath)) {
      return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)];
    }
    if ((!url.path || url.path == "/") && this._sources.has("/" + aSource)) {
      return this.sourcesContent[this._sources.indexOf("/" + aSource)];
    }
  }
  if (nullOnMissing) {
    return null;
  } else {
    throw new Error('"' + aSource + '" is not in the SourceMap.');
  }
};
BasicSourceMapConsumer.prototype.generatedPositionFor = function SourceMapConsumer_generatedPositionFor(aArgs) {
  var source = util$1.getArg(aArgs, 'source');
  if (this.sourceRoot != null) {
    source = util$1.relative(this.sourceRoot, source);
  }
  if (!this._sources.has(source)) {
    return {
      line: null,
      column: null,
      lastColumn: null
    };
  }
  source = this._sources.indexOf(source);
  var needle = {
    source: source,
    originalLine: util$1.getArg(aArgs, 'line'),
    originalColumn: util$1.getArg(aArgs, 'column')
  };
  var index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util$1.compareByOriginalPositions, util$1.getArg(aArgs, 'bias', SourceMapConsumer$1.GREATEST_LOWER_BOUND));
  if (index >= 0) {
    var mapping = this._originalMappings[index];
    if (mapping.source === needle.source) {
      return {
        line: util$1.getArg(mapping, 'generatedLine', null),
        column: util$1.getArg(mapping, 'generatedColumn', null),
        lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
      };
    }
  }
  return {
    line: null,
    column: null,
    lastColumn: null
  };
};
var BasicSourceMapConsumer_1 = BasicSourceMapConsumer;
function IndexedSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }
  var version = util$1.getArg(sourceMap, 'version');
  var sections = util$1.getArg(sourceMap, 'sections');
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }
  this._sources = new ArraySet$2();
  this._names = new ArraySet$2();
  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = util$1.getArg(s, 'offset');
    var offsetLine = util$1.getArg(offset, 'line');
    var offsetColumn = util$1.getArg(offset, 'column');
    if (offsetLine < lastOffset.line || offsetLine === lastOffset.line && offsetColumn < lastOffset.column) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;
    return {
      generatedOffset: {
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer$1(util$1.getArg(s, 'map'))
    };
  });
}
IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer$1.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer$1;
IndexedSourceMapConsumer.prototype._version = 3;
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});
IndexedSourceMapConsumer.prototype.originalPositionFor = function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
  var needle = {
    generatedLine: util$1.getArg(aArgs, 'line'),
    generatedColumn: util$1.getArg(aArgs, 'column')
  };
  var sectionIndex = binarySearch.search(needle, this._sections, function (needle, section) {
    var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
    if (cmp) {
      return cmp;
    }
    return needle.generatedColumn - section.generatedOffset.generatedColumn;
  });
  var section = this._sections[sectionIndex];
  if (!section) {
    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  }
  return section.consumer.originalPositionFor({
    line: needle.generatedLine - (section.generatedOffset.generatedLine - 1),
    column: needle.generatedColumn - (section.generatedOffset.generatedLine === needle.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
    bias: aArgs.bias
  });
};
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources = function IndexedSourceMapConsumer_hasContentsOfAllSources() {
  return this._sections.every(function (s) {
    return s.consumer.hasContentsOfAllSources();
  });
};
IndexedSourceMapConsumer.prototype.sourceContentFor = function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
  for (var i = 0; i < this._sections.length; i++) {
    var section = this._sections[i];
    var content = section.consumer.sourceContentFor(aSource, true);
    if (content) {
      return content;
    }
  }
  if (nullOnMissing) {
    return null;
  } else {
    throw new Error('"' + aSource + '" is not in the SourceMap.');
  }
};
IndexedSourceMapConsumer.prototype.generatedPositionFor = function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
  for (var i = 0; i < this._sections.length; i++) {
    var section = this._sections[i];
    if (section.consumer.sources.indexOf(util$1.getArg(aArgs, 'source')) === -1) {
      continue;
    }
    var generatedPosition = section.consumer.generatedPositionFor(aArgs);
    if (generatedPosition) {
      var ret = {
        line: generatedPosition.line + (section.generatedOffset.generatedLine - 1),
        column: generatedPosition.column + (section.generatedOffset.generatedLine === generatedPosition.line ? section.generatedOffset.generatedColumn - 1 : 0)
      };
      return ret;
    }
  }
  return {
    line: null,
    column: null
  };
};
IndexedSourceMapConsumer.prototype._parseMappings = function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
  this.__generatedMappings = [];
  this.__originalMappings = [];
  for (var i = 0; i < this._sections.length; i++) {
    var section = this._sections[i];
    var sectionMappings = section.consumer._generatedMappings;
    for (var j = 0; j < sectionMappings.length; j++) {
      var mapping = sectionMappings[j];
      var source = section.consumer._sources.at(mapping.source);
      if (section.consumer.sourceRoot !== null) {
        source = util$1.join(section.consumer.sourceRoot, source);
      }
      this._sources.add(source);
      source = this._sources.indexOf(source);
      var name = section.consumer._names.at(mapping.name);
      this._names.add(name);
      name = this._names.indexOf(name);
      var adjustedMapping = {
        source: source,
        generatedLine: mapping.generatedLine + (section.generatedOffset.generatedLine - 1),
        generatedColumn: mapping.generatedColumn + (section.generatedOffset.generatedLine === mapping.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: name
      };
      this.__generatedMappings.push(adjustedMapping);
      if (typeof adjustedMapping.originalLine === 'number') {
        this.__originalMappings.push(adjustedMapping);
      }
    }
  }
  quickSort(this.__generatedMappings, util$1.compareByGeneratedPositionsDeflated);
  quickSort(this.__originalMappings, util$1.compareByOriginalPositions);
};
var IndexedSourceMapConsumer_1 = IndexedSourceMapConsumer;
var sourceMapConsumer = {
	SourceMapConsumer: SourceMapConsumer_1,
	BasicSourceMapConsumer: BasicSourceMapConsumer_1,
	IndexedSourceMapConsumer: IndexedSourceMapConsumer_1
};

var isSourceNode = "$$$isSourceNode$$$";

var SourceMapConsumer = sourceMapConsumer.SourceMapConsumer;

const traceItemRegex = /(http.+):(\d+):(\d+)/;
var buildTraceCollection = (xs => {
  return xs.split('\n').map(x => traceItemRegex.exec(x)).filter(x => x != null).map(xs => ({
    compiledLine: xs[0],
    url: xs[1],
    line: parseInt(xs[2], 10),
    column: parseInt(xs[3], 10)
  }));
});

const LEVELS = {
  INFO: 30,
  ERROR: 50
};

var logger = (config => {
  const s = fs__default.createWriteStream(config.path, {
    flags: 'a',
    encoding: 'utf8'
  });
  const base = {
    name: config.name,
    pid: process.pid,
    hostname: os.hostname(),
    v: 0
  };
  return createLogger(base, s, config);
});
const createLogger = (base, s, config) => ({
  child: r => {
    return createLogger(Object.assign({}, base, r), s, config);
  },
  info: getLevelLogger(config.level, LEVELS.INFO, s, config.serializers, base),
  error: getLevelLogger(config.level, LEVELS.ERROR, s, config.serializers, base)
});
const getLevelLogger = (passedLevel, expectedLevel, s, serializers, base) => passedLevel <= expectedLevel ? parseRecord(s, serializers, expectedLevel, base) : () => {};
const parseRecord = (s, serializers, level, base) => (r, msg = '') => {
  if (typeof r === 'string') {
    msg = r;
    r = {};
  }
  const result = Object.assign({}, base, r, {
    msg,
    level,
    time: new Date().toISOString()
  });
  const out = Object.keys(result).reduce((x, k) => {
    const val = result[k];
    const serialized = serializers[k] && serializers[k](val);
    return Object.assign({}, x, {
      [k]: serialized || val
    });
  }, {});
  s.write(`${JSON.stringify(out)}\n`);
};

const errorLog = logger({
  path: 'reverser-errors.log',
  level: LEVELS.ERROR,
  name: 'errors',
  serializers: {}
});
const reverseLog = logger({
  path: 'reverser-trace.log',
  level: LEVELS.INFO,
  name: 'reverseTrace',
  serializers: {}
});

var srcmapReverse = ((srcMap, trace) => {
  const smc = new SourceMapConsumer(srcMap);
  return buildTraceCollection(trace).map(x => smc.originalPositionFor(x)).map(x => {
    x.name = x.name ? 'at ' + x.name + ' ' : 'at ';
    return x;
  }).map(x => `${x.name}${x.source}:${x.line}:${x.column}`).join('\n');
});

const srcMapFile = process.env.npm_package_config_srcMapFile ? process.env.npm_package_config_srcMapFile : '';
const sourceMapStream = index$1(fs.createReadStream(`${__dirname}/..${srcMapFile}`));
var reverser = (s => {
  return index$1([sourceMapStream, s]).flatMap(s => {
    return s.map(x => x.toString('utf8')).collect().map(x => x.join(''));
  }).collect().map(([srcMap, traceLine]) => srcmapReverse(srcMap, traceLine));
});

index$1(process.stdin).otherwise(index$1([''])).through(reverser).pipe(process.stdout);
//# sourceMappingURL=bundle.js.map
