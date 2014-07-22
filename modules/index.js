/**
 * index.js
 * Script to tie modules together.
 *
 * Copyright (C) 2014 Karim Alibhai.
 **/

(function () {
    "use strict";

    module.exports = function (Kinvey) {
        var modules = {
            email: require('./email.js'),
            utils: require('./utils.js'),
            logger: require('./logger.js'),
            validation: require('./validation.js'),
            backendContext: require('./backendContext.js'),
            collectionAccess: require('./collectionAccess.js')
        }, i;

        // extend everything with kinvey object
        for (i in modules) {
            if (modules.hasOwnProperty(i)) {
                modules[i] = modules[i](Kinvey, modules);
            }
        }

        // import from packages
        modules.request = require('request');
        modules.moment = require('moment');
        modules.async = require('async');

        // expose extended modules list
        return modules;
    };
}());