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
            logger: require('./logger.js'),
            collectionAccess: require('./collectionAccess.js'),
            push: require('./push.js'),
            email: require('./email.js'),
            validation: require('./validation.js'),
            utils: require('./utils.js'),
            backendContext: require('./backendContext.js')
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