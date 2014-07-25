/**
 * push.js
 * Send push notifications.
 *
 * Copyright (C) 2014 Karim Alibhai.
 **/

(function () {
    "use strict";

    module.exports = function (Kinvey) {
        var transport = function () {
            var trans = {
                message: function (users, message) {
                    Kinvey._events.emit('push:message', {
                        users: users instanceof Array ? users : [users],
                        message: message
                    });
                },

                payload: function (users, iOSAps, iOSExtras, androidPayload) {
                    Kinvey._events.emit('push:payload', {
                        users: users instanceof Array ? users : [users],
                        iOSAps: iOSAps,
                        iOSExtras: iOSExtras,
                        androidPayload: androidPayload
                    });
                }
            };

            if (Kinvey._push !== 'events') {
                trans = {
                    message: function (users, message) {
                        console.log('\n---------------- PUSH NOTIFS ----------------');
                        console.log('Users: %s', JSON.stringify(users));
                        console.log('Message: %s', JSON.stringify(message));
                        console.log('---------------- PUSH NOTIFS ----------------\n');
                    },

                    payload: function (users, iOSAps, iOSExtras, androidPayload) {
                        console.log('\n---------------- PUSH NOTIFS ----------------');
                        console.log('Users: %s', JSON.stringify(users));
                        console.log('iOSAps: %s', JSON.stringify(iOSAps));
                        console.log('iOSExtras: %s', JSON.stringify(iOSExtras));
                        console.log('Android: %s', JSON.stringify(androidPayload));
                        console.log('---------------- PUSH NOTIFS ----------------\n');
                    }
                };
            }

            return trans;
        };

        return {
            // Broadcasts message to all devices registered with this app
            broadcastMessage: function (message) {
                transport().message(['all'], message);
            },

            // Sends messages to the users in users
            sendMessage: function (users, message) {
                transport().message(users, message);
            },

            // Broadcasts custom payloads to all devices registered with this app.
            broadcastPayload: function (iOSAps, iOSExtras, androidPayload) {
                transport().payload(['all'], iOSAps, iOSExtras, androidPayload);
            },

            // Sends a custom payload to the users in users
            sendPayload: function (users, iOSAps, iOSExtras, androidPayload) {
                transport().payload(users, iOSAps, iOSExtras, androidPayload);
            }
        };
    };
}());