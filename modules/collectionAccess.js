/**
 * collectionAccess.js
 * Access to the data stores.
 *
 * Copyright (C) 2014 Karim Alibhai.
 **/
/*jslint unparam:true*/

(function () {
    "use strict";

    var deepExtend = require('deep-extend'),
        deepEqual = require('deep-equal'),
        isEmptyObject = function (object) {
            var i;

            // stop if any valid properties
            // are found
            for (i in object) {
                if (object.hasOwnProperty(i)) {
                    return false;
                }
            }

            // object is empty if it has no
            // original (owned) properties
            return true;
        },
        typeEqual = function (one, two) {
            one = typeof one;
            two = typeof two;

            return one === two;
        },
        nor = function (fn) {
            return typeof fn === 'function' ? fn : function () {
                return;
            };
        },
        nonulls = function (arr) {
            var array = [],
                i;

            for (i = 0; i < arr.length; i += 1) {
                if (arr[i]) {
                    if (typeof arr[i] === 'object') {
                        if (!isEmptyObject(arr[i])) {
                            array.push(arr[i]);
                        }
                    } else {
                        array.push(arr[i]);
                    }
                }
            }

            return array;
        };

    module.exports = function (Kinvey) {
        var colAccess = {
            // fetch value from object
            // using a 'JSON selector'
            // i.e. "outer.inner"
            deepValue: function (property, object) {
                var value, i;

                // delimeter is always classic dot
                // notation
                property = String(property).split('.');
                value = object;

                // iterate through the tree
                for (i = 0; i < property.length; i += 1) {
                    try {
                        value = value[property[i]];
                    } catch (err) {
                        value = undefined;
                        break;
                    }
                }

                // no property, no value
                return property.length === 0 ? undefined : value;
            },

            // use simple strings to simplify
            // things
            objectID: function (id) {
                return String(id);
            },

            // check if a data store by that name
            // exists at all (and is usable)
            collectionExists: function (name) {
                return Kinvey._collections.hasOwnProperty(name) && Kinvey._collections[name] instanceof Array;
            },

            // grab entire data store
            collection: function (name) {
                // Kinvey thinks it is a good idea to
                // use an empty collection when the real
                // collection isn't found rather than throw
                // an error, so that's what we'll do too
                var col = [],
                    tmp,
                    i,
                    colHdl = {
                        // simple insert new document into
                        // collection
                        insert: function (document, callback) {
                            callback = nor(callback);

                            // copy over new records
                            col.push(document);
                            Kinvey._collections[name] = nonulls(col);
                            col = Kinvey._collections[name];

                            callback(null);
                        },

                        // simply delete any records
                        // that match the query
                        remove: function (query, callback) {
                            var match,
                                val,
                                x,
                                y;

                            query = query || {};
                            callback = nor(callback);

                            // an empty query object should
                            // act as a wildcard (no filters)
                            if (!isEmptyObject(query)) {
                                for (x = 0; x < col.length; x += 1) {
                                    for (y in query) {
                                        if (query.hasOwnProperty(y)) {
                                            val = colAccess.deepValue(y, col[x]);

                                            if (typeEqual(val, query[y])) {
                                                if (deepEqual(val, query[y])) {
                                                    delete col[x];
                                                }
                                            } else if (typeof query[y] === 'object') {
                                                // greater than and less than
                                                if (typeof val === 'number') {
                                                    match = query[y].hasOwnProperty('$gt') || query[y].hasOwnProperty('$lt');

                                                    if (match && query[y].hasOwnProperty('$gt')) {
                                                        match = val > query[y].$gt;
                                                    }

                                                    if (match && query[y].hasOwnProperty('$lt')) {
                                                        match = val < query[y].$lt;
                                                    }

                                                    if (match) {
                                                        delete col[x];
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                // copy over new records
                                Kinvey._collections[name] = nonulls(col);
                                col = Kinvey._collections[name];
                            }

                            callback(null);
                        },

                        // lookup records matching the
                        // query (see Kinvey docs for query
                        // specs)
                        find: function (query, options, callback) {
                            var data = [],
                                match,
                                val,
                                x,
                                y;

                            query = query || {};

                            if (typeof options === 'function') {
                                callback = options;
                                options = {};
                            } else {
                                callback = nor(callback);
                            }

                            // an empty query object should
                            // act as a wildcard (no filters)
                            if (isEmptyObject(query)) {
                                data = col;
                            } else {
                                for (x = 0; x < col.length; x += 1) {
                                    for (y in query) {
                                        if (query.hasOwnProperty(y)) {
                                            val = colAccess.deepValue(y, col[x]);

                                            if (typeEqual(val, query[y])) {
                                                if (deepEqual(val, query[y])) {
                                                    data.push(col[x]);
                                                }
                                            } else if (typeof query[y] === 'object') {
                                                // greater than and less than
                                                if (typeof val === 'number') {
                                                    match = query[y].hasOwnProperty('$gt') || query[y].hasOwnProperty('$lt');

                                                    if (match && query[y].hasOwnProperty('$gt')) {
                                                        match = val > query[y].$gt;
                                                    }

                                                    if (match && query[y].hasOwnProperty('$lt')) {
                                                        match = val < query[y].$lt;
                                                    }

                                                    if (match) {
                                                        data.push(col[x]);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            // return no data if error occurs
                            // to make the programmer realize
                            // to check the error object
                            callback(null, nonulls(data));
                        },

                        // like find, but stops after first
                        // match is found
                        findOne: function (query, options, callback) {
                            if (typeof options === 'function') {
                                callback = options;
                                options = {};
                            } else {
                                callback = nor(callback);
                            }

                            colHdl.find(query, options, function (err, data) {
                                callback(err, data && data.length > 0 ? data[0] : null);
                            });
                        },

                        // update existing record
                        update: function (document, callback) {
                            var x;

                            callback = nor(callback);

                            // an empty query object should
                            // act as a wildcard (no filters)
                            if (!isEmptyObject(document)) {
                                for (x = 0; x < col.length; x += 1) {
                                    if (col[x]._id === document._id) {
                                        col[x] = document;
                                        break;
                                    }
                                }

                                // copy over new records
                                Kinvey._collections[name] = nonulls(col);
                                col = Kinvey._collections[name];
                            }

                            callback(null);
                        },

                        // either update existing record
                        // or insert new one
                        save: function (document, callback) {
                            var match = false,
                                x;

                            callback = nor(callback);

                            // an empty query object should
                            // act as a wildcard (no filters)
                            if (!isEmptyObject(document)) {
                                for (x = 0; x < col.length; x += 1) {
                                    if (col[x]._id === document._id) {
                                        col[x] = document;
                                        match = true;
                                        break;
                                    }
                                }

                                if (!match) {
                                    col.push(document);
                                }

                                // copy over new records
                                Kinvey._collections[name] = nonulls(col);
                                col = Kinvey._collections[name];
                            }

                            callback(null);
                        }
                    };

                // if real collection, copy over data
                // to a new state to stop any code from
                // changing the data without using the
                // colHdl object
                if (colAccess.collectionExists(name)) {
                    for (i = 0; i < Kinvey._collections[name].length; i += 1) {
                        if (!isEmptyObject(Kinvey._collections[name][i])) {
                            tmp = {};
                            deepExtend(tmp, Kinvey._collections[name][i]);
                            col.push(tmp);
                        }
                    }
                }

                // copy over new records
                Kinvey._collections[name] = nonulls(col);
                col = Kinvey._collections[name];

                // return the handle wrapper
                // over the collection for usage
                return colHdl;
            }
        };

        return colAccess;
    };
}());