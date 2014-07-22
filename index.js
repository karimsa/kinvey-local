/**
 * index.js
 * Script to tie everything together.
 *
 * Copyright (C) 2014 Karim Alibhai.
 **/

(function () {
    "use strict";

    var fs = require('fs'),
        path = require('path'),
        deepExtend = require('deep-extend'),
        EventEmitter = require('events').EventEmitter,
        noop = function () {
            return false;
        },

        // Kinvey's verification of a proper
        // user object
        isGoodUser = function (user) {
            return user && user.hasOwnProperty('_id') && user.hasOwnProperty('_kmd') && user._kmd.hasOwnProperty('authtoken');
        },

        // the kinvey object
        Kinvey = {
            // some inner data
            _didInit: false,
            _events: new EventEmitter(),
            _modules: require('./modules'),
            _activeUser: null,
            _collections: {
                user: []
            },
            _mailTransport: null,

            // app credentials
            appKey: null,
            appSecret: null,
            masterSecret: null,

            // endpoint request object
            _request: function (name, data) {
                return {
                    method: 'POST',
                    headers: [],
                    body: data,
                    params: [],
                    username: Kinvey.getActiveUser().username,
                    appKey: Kinvey.appKey,
                    collectionName: name
                };
            },

            // endpoint reponse object
            _response: function () {
                var res = {
                    body: null,
                    complete: function () {
                        Kinvey._events.emit('complete', res.body);
                        Kinvey._events = new EventEmitter();
                    },
                    error: function (msg) {
                        Kinvey._events.emit('uderror', {
                            name: 'BLRuntimeError',
                            description: 'The Business Logic script has a runtime error. See debug message for details.',
                            debug: 'UserDefinedError: ' + msg
                        });
                        Kinvey._events = new EventEmitter();
                    }
                };

                return res;
            },

            // objects
            Error: function (msg) {
                return new Error(msg);
            },
            User: {
                // verify data, and lookup user
                // via username/password pair
                login: function (username, password, callbacks) {
                    var options,
                        err = null,
                        users = Kinvey._collections.user,
                        user = null,
                        tmp,
                        i;

                    // don't allow login overlaps
                    if (Kinvey._activeUser) {
                        err = 'You are already logged in as a different user.';
                    } else {
                        // always use object data
                        if (typeof username === 'object') {
                            options = username;
                            callbacks = password;
                        } else {
                            options = {
                                username: username,
                                password: password
                            };
                        }

                        // noopify
                        callbacks = callbacks || {};
                        callbacks.success = callbacks.success || noop;
                        callbacks.error = callbacks.error || noop;

                        // unsupported: social logins
                        if (options.hasOwnProperty('_socialIdentity')) {
                            err = 'Social logins are currently unsupported.';
                        } else if (!options.hasOwnProperty('username') || !options.hasOwnProperty('password') || typeof options.password !== 'string') {
                            err = 'Argument must contain: username and password, or _socialIdentity.';
                        } else {
                            for (i = 0; i < users.length; i += 1) {
                                if (users[i].username === options.username && users[i].password === options.password) {
                                    user = users[i];
                                    break;
                                }
                            }

                            if (!user) {
                                callbacks.error('Wrong username/password combination.');
                            } else {
                                // falisfy authentication token
                                tmp = {
                                    _kmd: {
                                        authtoken: 'xxx-authtoken-xxx'
                                    }
                                };

                                // save new object as user
                                deepExtend(tmp, user);
                                Kinvey.setActiveUser(tmp);
                                callbacks.success();
                            }
                        }
                    }

                    // throw error?
                    if (err) {
                        throw new Kinvey.Error(err);
                    }
                },

                // reset active user, and
                // result in success
                logout: function (callbacks) {
                    // noopify
                    callbacks = callbacks || {};
                    callbacks.success = callbacks.success || noop;

                    // reset user
                    Kinvey._activeUser = null;

                    // return
                    callbacks.success();
                }
            },

            // configure phony local env
            // using options
            setOptions: function (options) {
                // puts users store back into collections
                if (options.hasOwnProperty('users')) {
                    options.collections = options.collections || {};
                    options.collections.user = options.users;
                    delete options.users;
                }

                // preset collections
                if (options.hasOwnProperty('collections')) {
                    deepExtend(Kinvey._collections, options.collections);
                }

                // endpoint path base
                if (options.hasOwnProperty('endpoints-base')) {
                    Kinvey._endBase = options['endpoints-base'];
                }

                // nodemailer config
                if (options.hasOwnProperty('email')) {
                    Kinvey._mailTransport = options.email || {};
                }
            },

            // simple key/secret verification
            // (does not verify against Kinvey)
            init: function (creds) {
                return {
                    then: function (success, error) {
                        var err = null;

                        // reset user login
                        Kinvey._activeUser = null;
                        Kinvey._didInit = null;

                        // noopify
                        success = success || noop;
                        error = error || noop;

                        // verify data like Kinvey
                        if (creds.hasOwnProperty('appKey')) {
                            if (creds.hasOwnProperty('masterSecret')) {
                                err = new Kinvey.Error('Never user the masterSecret on the client side.');
                            } else if (!creds.hasOwnProperty('appSecret')) {
                                err = new Kinvey.Error('options argument must contain: appSecret.');
                            }
                        } else {
                            err = new Kinvey.Error('options argument must contain: appKey.');
                        }

                        // execute correct callback
                        if (err) {
                            error(err);
                        } else {
                            // set state
                            Kinvey._didInit = true;

                            // save credentials
                            Kinvey.appKey = creds.appKey;
                            Kinvey.appSecret = creds.appSecret;

                            // return to callback
                            success();
                        }
                    }
                };
            },

            // quick callback exec
            // (nothing to ping)
            ping: function () {
                return {
                    then: function (success) {
                        (success || noop).call();
                    }
                };
            },

            // grab user profile
            getActiveUser: function () {
                if (Kinvey._didInit !== true) {
                    throw new Kinvey.Error('Kinvey.getActiveUser can only be called after the ' +
                        'promise returned by Kinvey.init fulfills or rejects.');
                }

                return Kinvey._activeUser;
            },

            // set user profile
            setActiveUser: function (user) {
                // validate arguments
                if (!isGoodUser(user)) {
                    throw new Kinvey.Error('user argument must contain: _id, _kmd.authtoken.');
                }

                // backup previous user
                var result = Kinvey.getActiveUser();
                Kinvey._activeUser = user;

                // return previous user
                return result;
            },

            // endpoint execute
            execute: function (name, data, callbacks) {
                if (!Kinvey._activeUser || !Kinvey._didInit) {
                    throw new Kinvey.Error('Kinvey.getActiveUser can only be called after the ' +
                        'promise returned by Kinvey.init fulfills or rejects.');
                }

                callbacks = callbacks || {};

                fs.readFile(path.join(Kinvey._endBase, name + '.js'), 'utf8', function (err, js) {
                    if (err) {
                        callbacks.error({
                            name: 'BLInternalError',
                            description: 'The Business Logic script did not complete. See debug message for details',
                            debug: String(err)
                        });
                    } else {
                        // adding this to the end causes
                        // the onRequest callback to be
                        // returned from eval; strict mode
                        // will stop this from going global
                        js += ';onRequest';

                        // save endpoint callback
                        var onRequest = eval(js);

                        // set once event handlers
                        Kinvey._events.once('complete', callbacks.success || noop);
                        Kinvey._events.once('uderror', callbacks.error || noop);

                        // execute the endpoint
                        onRequest(Kinvey._request(name, data), Kinvey._response(), Kinvey._modules);
                    }
                });
            }
        };

    // give modules the env as well
    Kinvey._modules = Kinvey._modules(Kinvey);

    // expose full object
    module.exports = Kinvey;
}());