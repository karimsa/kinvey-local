/**
 * test-all.js
 * Run tests on all supported features.
 *
 * Copyright (C) 2014 Karim Alibhai.
 **/

(function () {
    "use strict";

    var test = require('tape'),
        path = require('path'),
        moment = require('moment'),
        Kinvey,
        promise = function (t, message, expected) {
            var good = true;
            return {
                success: function (given) {
                    t.ok(good, message);

                    if (good && expected) {
                        t.equals(given, expected);
                    }
                },
                error: function (err) {
                    t.ok(!good, err);
                },
                fail: function () {
                    good = !good;
                }
            };
        },

        // toggle this flag to run tests with
        // the official kinvey object and the
        // local object.
        USE_LOCAL = true,
        APP_KEY = 'xxx-appkey-xxx',
        APP_SECRET = 'xxx-appSecret-xxx',
        MASTER_SECRET = 'xxx-masterSecret-xxx';

    /**
     * CORE TESTING
     **/

    test('setup Kinvey env', function (t) {
        if (USE_LOCAL) {
            Kinvey = require('../index.js');

            t.plan(1);
            t.throws(function () {
                Kinvey.setOptions({});
            }, false, 'ensure that `endpoints-base` is given');

            // these settings are to mimic
            // the target environment.
            Kinvey.setOptions({
                'endpoints-base': path.resolve(__dirname, '../example/endpoints'),
                push: 'logger',
                email: {},
                users: [
                    {
                        _id: 'xxx-one-xxx',
                        first_name: 'User',
                        last_name: 'One',
                        username: 'userone',
                        password: 'passone',
                        email: 'one@example.com'
                    }, {
                        _id: 'xxx-two-xxx',
                        first_name: 'User',
                        last_name: 'Two',
                        username: 'usertwo',
                        password: 'passtwo',
                        email: 'two@example.com'
                    }
                ],
                collections: {
                    messages: [
                        {
                            _id: 'xxx#1',
                            no: 1,
                            text: 'Hello, world'
                        }, {
                            _id: 'xxx#2',
                            no: 2,
                            text: 'Hello, #2'
                        }, {
                            _id: 'xxx#3',
                            no: 3,
                            text: 'Hello, #3'
                        }
                    ]
                }
            });
        } else {
            t.done();

            // if you use the actual kinvey
            // object, be sure to change the app
            // credentials above. Also, setup
            // the target environment with the settings
            // passed above to the local object
            Kinvey = require('kinvey');
        }
    });

    // .init()
    test('initalize Kinvey', function (t) {
        t.plan(11);

        t.throws(function () {
            Kinvey.getActiveUser();
        }, false, 'fail to fetch active user before init');

        t.throws(function () {
            Kinvey.execute('test', {
                text: 'hello'
            }, {});
        }, false, 'fail to execute endpoints before init');

        t.doesNotThrow(function () {
            Kinvey.init({}).then(function () {
                t.ok(false, 'passed .init()');
            }, function () {
                t.ok(true, 'failed .init()');
            });
        }, false, 'init without appKey');

        t.doesNotThrow(function () {
            Kinvey.init({}).then();
        }, false, 'init without callbacks');

        t.doesNotThrow(function () {
            Kinvey.init({
                appKey: APP_KEY
            }).then(function () {
                t.ok(false, 'passed .init()');
            }, function () {
                t.ok(true, 'failed .init()');
            });
        }, false, 'init without appSecret');

        t.doesNotThrow(function () {
            Kinvey.init({
                appKey: APP_KEY,
                masterSecret: MASTER_SECRET
            }).then(function () {
                t.ok(false, 'passed .init()');
            }, function () {
                t.ok(true, 'failed .init()');
            });
        }, false, 'fail to init with masterSecret');

        t.doesNotThrow(function () {
            Kinvey.init({
                appKey: APP_KEY,
                appSecret: APP_SECRET
            }).then(function () {
                t.ok(true, 'passed .init()');
            }, function (err) {
                t.ok(false, err);
            });
        }, false, 'init properly');
    });

    // .ping()
    test('ping the server', function (t) {
        t.plan(2);

        t.doesNotThrow(function () {
            Kinvey.ping().then();
        }, false, 'ping without callback');

        Kinvey.ping().then(function () {
            t.ok(true, 'received ping');
        }, function (err) {
            t.ok(false, err);
        });
    });

    // .setActiveUser()
    test('set active user (bad user)', function (t) {
        t.plan(2);

        t.throws(function () {
            Kinvey.setActiveUser({});
        }, false, 'throws exception');

        Kinvey.User.logout(promise(t, 'reset active user'));
    });

    // .login()
    test('login as userone', function (t) {
        t.plan(12);

        t.doesNotThrow(function () {
            Kinvey.User.login('userone', 'passone', promise(t, 'logged in'));
        }, false, 'exception handling');

        t.throws(function () {
            Kinvey.User.login('userone', 'passone', promise(t, 'logged in'));
        }, false, 'login again');

        Kinvey.User.logout(promise(t, 'log out'));

        t.throws(function () {
            Kinvey.User.login({
                username: 'userone',
                password: 'passone',
                _socialIdentity: {
                    facebook: {
                        authtoken: 'xxx'
                    }
                }
            }, promise(t, 'logged in'));
        }, false, 'login with facebook');

        Kinvey.User.logout(promise(t, 'log out'));

        t.throws(function () {
            Kinvey.User.login({}, promise(t, 'logged in'));
        }, false, 'login with nothing');

        Kinvey.User.logout(promise(t, 'log out'));

        t.doesNotThrow(function () {
            Kinvey.User.login({
                username: 'charlie',
                password: 'stuffity'
            }, promise(t, 'logged in').fail());
        }, false, 'login with bad username/password');

        Kinvey.User.logout(promise(t, 'log out'));

        t.doesNotThrow(function () {
            Kinvey.User.login({
                username: 'userone',
                password: 'passone'
            }, promise(t, 'logged in'));
        }, false, 'login with object');
    });

    // .getActiveUser()
    test('verify user info', function (t) {
        t.plan(7);

        t.doesNotThrow(function () {
            var user = Kinvey.getActiveUser();

            // make sure user is not null
            t.notEqual(user, null, 'user is not null');

            // verify user data
            t.equal(user._id, 'xxx-one-xxx', 'user._id');
            t.equal(user.username, 'userone', 'user.username');
            t.equal(user.first_name, 'User', 'user.first_name');
            t.equal(user.last_name, 'One', 'user.last_name');
            t.equal(user.email, 'one@example.com', 'user.email');
        }, false, 'does not throw exception');
    });

    // .execute()
    test('execute sample', function (t) {
        t.plan(7);

        Kinvey.execute('test', {
            text: 'xxx-helloWorld-xxx'
        }, {
            success: function (data) {
                t.ok(true, 'got result');
                t.equals(data, 'xxx-helloWorld-xxx', 'correct text echoed');
            },
            error: function (err) {
                t.ok(false, err.debug);
                t.fail();
            }
        });

        Kinvey.execute('test', {
            text: 'xxx-helloWorld-xxx',
            number: 'xxx-badnumber-xxx'
        }, {
            success: function () {
                t.ok(false, 'endpoint was successful');
                t.fail();
            },
            error: function () {
                t.ok(true, 'endpoint errored out');
            }
        });

        Kinvey.execute('test', {}, {
            success: function () {
                t.ok(false, 'endpoint was successful');
                t.fail();
            },
            error: function (err) {
                t.ok(true, 'endpoint errored out');
                t.equal(err.name, 'BLRuntimeError', 'correct error type');
                t.equal(err.debug, 'UserDefinedError: You must specify the text to be echoed.', 'correct error message');
            }
        });

        t.doesNotThrow(function () {
            Kinvey.execute('test', {
                text: 'xxx-helloWorld-xxx'
            });
        }, false, 'execute endpoint without callbacks');
    });

    // .execute() failure
    test('execute random endpoint', function (t) {
        t.plan(2);

        Kinvey.execute('random-ass-endpoint', {}, {
            success: function () {
                t.ok(false, 'endpoint somehow returned');
                t.fail();
            },
            error: function (err) {
                t.ok(true, 'endpoint failed');
                t.notEqual(err.debug.indexOf('Cannot find module'), -1);
            }
        });
    });

    // backendContext
    test('verify backendContext', function (t) {
        t.plan(40);

        var modules = Kinvey._modules,
            dt = (new Date()).toISOString(),
            mmt = moment(dt),
            col = modules.collectionAccess.collection('messages'),
            isEntity = function (object) {
                return object && typeof object === 'object' && object.hasOwnProperty('_id') && object.hasOwnProperty('_acl') && object.hasOwnProperty('_kmd');
            };

        Kinvey._mailTransport = 'events';
        Kinvey._events.once('email', function (evt) {
            t.deepEqual(evt, {
                from: 'test',
                to: 'test',
                subject: 'test',
                text: 'test',
                replyTo: 'test',
                html: 'test'
            }, 'event-based email receives proper data');
        });
        modules.email.send('test', 'test', 'test', 'test', 'test', 'test');

        Kinvey._push = 'events';
        Kinvey._events.once('push:message', function (evt) {
            t.deepEqual(evt.users, ['all'], 'broadcastMessage - users');
            t.equal(evt.message, 'hello world from push', 'broadcastMessage - message');
        });
        modules.push.broadcastMessage('hello world from push');

        Kinvey._events.once('push:message', function (evt) {
            t.deepEqual(evt.users, [{
                username: 'custom'
            }], 'sendMessage - users');
            t.equal(evt.message, 'hello world from push', 'sendMessage - message');
        });
        modules.push.sendMessage([{
            username: 'custom'
        }], 'hello world from push');

        Kinvey._events.once('push:payload', function (evt) {
            t.deepEqual(evt.users, ['all'], 'broadcastPayload - users');
            t.deepEqual(evt.iOSAps, {
                isRight: 'yeah',
                isFor: 'aps'
            }, 'broadcastPayload - iOSAps');
            t.deepEqual(evt.iOSExtras, {
                isRight: 'yeah',
                isFor: 'extra'
            }, 'broadcastPayload - iOSExtras');
            t.deepEqual(evt.androidPayload, {
                isRight: 'yeah',
                isFor: 'apayload'
            }, 'broadcastPayload - androidPayload');
        });
        modules.push.broadcastPayload({
            isRight: 'yeah',
            isFor: 'aps'
        }, {
            isRight: 'yeah',
            isFor: 'extra'
        }, {
            isRight: 'yeah',
            isFor: 'apayload'
        });

        Kinvey._events.once('push:payload', function (evt) {
            t.deepEqual(evt.users, [{
                username: 'auser'
            }], 'sendPayload - users');
            t.deepEqual(evt.iOSAps, {
                isRight: 'yeah',
                isFor: 'aps'
            }, 'sendPayload - iOSAps');
            t.deepEqual(evt.iOSExtras, {
                isRight: 'yeah',
                isFor: 'extra'
            }, 'sendPayload - iOSExtras');
            t.deepEqual(evt.androidPayload, {
                isRight: 'yeah',
                isFor: 'apayload'
            }, 'sendPayload - androidPayload');
        });
        modules.push.sendPayload([{
            username: 'auser'
        }], {
            isRight: 'yeah',
            isFor: 'aps'
        }, {
            isRight: 'yeah',
            isFor: 'extra'
        }, {
            isRight: 'yeah',
            isFor: 'apayload'
        });

        t.ok(isEntity(modules.utils.kinveyEntity()), 'entity from nothing');
        t.ok(isEntity(modules.utils.kinveyEntity({})), 'entity from object');
        t.ok(isEntity(modules.utils.kinveyEntity('hello')), 'entity from string');
        t.ok(isEntity(modules.utils.kinveyEntity(modules.collectionAccess.objectID('hello'))), 'entity from objectID');

        t.equal(modules.utils.convert.fromKinveyDateString('xxx-baddate-xxx'), 'Invalid Date', 'create invalid date');
        t.equal(modules.utils.convert.fromKinveyDateString(dt, 'date').toISOString(), dt, 'create date object');
        t.equal(modules.utils.convert.fromKinveyDateString(dt, 'string'), dt, 'create date string');
        t.equal(String(modules.utils.convert.fromKinveyDateString(dt, 'moment')), String(mmt), 'create moment');

        t.equal(modules.backendContext.getAppKey(), APP_KEY, 'appKey');
        t.equal(modules.backendContext.getAppSecret(), APP_SECRET, 'appSecret');
        t.equal(modules.backendContext.getMasterSecret(), null, 'masterSecret');
        t.equal(modules.backendContext.getSecurityContext(), Kinvey.getActiveUser().username, 'getSecurityContext');

        t.equal(modules.collectionAccess.deepValue('prop.random.inner', {
            prop: {}
        }), undefined, 'fetch deepValue by selector');

        modules.collectionAccess.collection('messages').insert(function () {
            return false;
        }, function () {
            t.notOk(!Kinvey._collections.messages[Kinvey._collections.messages.length - 1], 'test bad insert');
        });

        t.equal(modules.collectionAccess.objectID('hello') + 'world', 'helloworld', 'test objectID comparison');
        t.equal(modules.collectionAccess.collectionExists('randomcol'), false, 'test collection check');

        // test if collection check passes with faulty collection
        Kinvey._collections.randomcol = {};
        t.equal(modules.collectionAccess.collectionExists('randomcol'), false, 'test collection check');

        t.doesNotThrow(function () {
            col.findOne({});
        }, false, 'find without callbacks');

        col.find({}, function (err, data) {
            if (err) {
                t.fail(err);
            } else {
                t.equal(data.length, 3, 'find via wildcard');
            }
        });

        col.find({
            no: {
                $gt: 0,
                $lt: 5
            }
        }, function (err, data) {
            if (err) {
                t.fail(err);
            } else {
                t.equal(data.length, 3, 'find via numeric query');
            }
        });

        col.findOne({
            no: 1
        }, function (err, data) {
            if (err) {
                t.fail(err);
            } else {
                t.equal(data.text, 'Hello, world', 'find specific single record');
            }
        });

        col.update({
            _id: 'xxx#1',
            text: 'Hello, #1'
        }, function (err) {
            t.ok(!err, err || 'do update');
        });

        col.save({
            _id: 'xxx#1',
            text: 'Hello, world'
        }, function (err) {
            t.ok(!err, err || 'do update');
        });

        col.save({
            _id: 'xxx#rnd',
            text: 'Hello, #rnd'
        }, function (err) {
            t.ok(!err, err || 'do save');
        });

        col.insert({
            no: 4,
            text: 'Hello, #4'
        }, function (err) {
            t.ok(!err, err || 'do insert');
        });

        col.remove({
            no: 4
        }, function (err) {
            t.ok(!err, err || 'do remove');
        });

        col.remove({
            no: {
                $gt: 2,
                $lt: 4
            }
        }, function (err) {
            t.ok(!err, err || 'remove using query');
        });
    });

    // .logout()
    test('logout as userone', function (t) {
        t.plan(2);

        t.doesNotThrow(function () {
            Kinvey.User.logout();
        }, false, 'logout without callbacks');
        Kinvey.User.logout(promise(t, 'logged out'));
    });
}());