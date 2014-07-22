/**
 * logger.js
 * Logging using console.
 *
 * Copyright (C) 2014 Karim Alibhai.
 **/

(function () {
    "use strict";

    var attach = function (data, type) {
        data[type] = function (msg) {
            console.log('[%s] %s', type, msg);
        };
    };

    module.exports = function () {
        var data = {}, loggers = ['info', 'warn', 'error', 'fatal'], i;

        // attach loggers
        for (i = 0; i < loggers.length; i += 1) {
            attach(data, loggers[i]);
        }

        // expose
        return data;
    };
}());