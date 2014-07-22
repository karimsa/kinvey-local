/**
 * backendContext.js
 * Used to return data and perform functions against the current backend context.
 *
 * Copyright (C) 2014 Karim Alibhai.
 **/

(function () {
    "use strict";

    module.exports = function (Kinvey) {
        return {
            getAppKey: function () {
                return Kinvey.appKey || null;
            },
            getAppSecret: function () {
                return Kinvey.appSecret || null;
            },
            getMasterSecret: function () {
                return null;
            },
            getSecurityContext: function () {
                return Kinvey.getActiveUser() && Kinvey.getActiveUser().username ? Kinvey.getActiveUser().username : null;
            }
        };
    };
}());