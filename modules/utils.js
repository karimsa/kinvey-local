/**
 * modules/utils.js
 * Miscellaneous utilities module.
 *
 * Copyright (C) 2014 Karim Alibhai.
 **/

(function () {
    "use strict";

    var uuid = require('node-uuid'),
        mustache = require('mustache'),
        utils = {
            Kinvey: null,
            modules: null,

            // base64
            // encoding and decoding in base64.
            base64: {
                encode: function (str) {
                    return (new Buffer(str)).toString('base64');
                },

                decode: function (str) {
                    return (new Buffer(str, 'base64')).toString('ascii');
                }
            },

            // convert
            // convert between kinvey date formats.
            convert: {
                fromKinveyDateString: function (str, format) {
                    // create new date object
                    var date = new Date(str);

                    // default format is date
                    format = format || 'date';

                    // verify date
                    if (String(date) === 'Invalid Date') {
                        return String(date);
                    }

                    if (format === 'moment') {
                        date = utils.modules.moment(str);
                    }

                    return format === 'string' ? date.toISOString() : date;
                },

                toKinveyDateString: function (dt) {
                    return dt.toISOString();
                }
            },

            // kinveyEntity()
            // extend document with metadata
            kinveyEntity: function (obj) {
                var user = utils.Kinvey.getActiveUser(),
                    datetime = utils.convert.toKinveyDateString(new Date());

                // default to JSON
                obj = obj || {};

                if (typeof obj === 'string') {
                    // use string input as
                    // the unique identitifer
                    obj = {
                        _id: obj
                    };
                } else {
                    // add unique identifier
                    // (time dependant due to .v1)
                    obj._id = obj._id || uuid.v1();
                }

                // set access control
                obj._acl = obj._acl || user._id;

                // fix ID
                obj._id = obj._id.replace(/-/g, '');

                // add metadata
                obj._kmd = obj._kmd || {
                    ect: datetime,
                    lmt: datetime
                };

                // return final document
                return obj;
            },

            // renderTemplate
            // renders a template using mustache
            renderTemplate: function (spec, data) {
                return mustache.render(spec, data);
            },

            // tempObjectStore
            // currently unsupported (follow issues/#1)
            tempObjectStore: null
        };

    // expose
    module.exports = function (Kinvey, modules) {
        // save kinvey object
        utils.Kinvey = Kinvey;
        utils.modules = modules;

        // actual expose
        return utils;
    };
}());