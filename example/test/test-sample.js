/**
 * test-sample.js
 *
 * Example of a basic test of endpoints.
 **/

(function () {
    "use strict";

    var path = require('path'),
        test = require('tape'),
        color = require('colortape'),
        Kinvey = require('../../index.js');

    test('initalize kinvey', function (t) {
        t.plan(1);

        Kinvey.init({
            appKey: 'kid_xxxxxx',
            appSecret: 'xxxyyyzzz'
        }).then(function () {
            // let's also setup options here
            Kinvey.setOptions({
                'endpoints-base': path.resolve(__dirname, '../endpoints/'),
                users: [
                    {
                        _id: 'xxx-user-xxx',
                        username: 'john.smith',
                        password: 'the-password',
                        email: 'john.smith@example.com'
                    }
                ]
            });

            // end test
            t.ok(true, 'initalized');
        }, function (err) {
            t.ok(false, err);
        });
    });

    test('log user in', function (t) {
        t.plan(2);

        t.doesNotThrow(function () {
            Kinvey.User.login('john.smith', 'the-password', {
                success: function () {
                    t.ok(true, 'logged in');
                },
                error: function (err) {
                    t.ok(false, err);
                }
            });
        }, function () {
            return false;
        }, 'exception check');
    });

    test('execute sample', function (t) {
        t.plan(2);

        Kinvey.execute('sample', {
            text: 'Hello, world!'
        }, {
            success: function (data) {
                t.ok(true, 'got result');
                t.equals(data, 'Hello, world!');
            },
            error: function (err) {
                t.ok(false, err.debug);
                t.fail();
            }
        });
    });

    module.exports = test.createStream().pipe(color());
}());