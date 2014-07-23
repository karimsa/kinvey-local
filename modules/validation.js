/**
 * validation.js
 * Payload validation.
 *
 * Copyright (C) 2014 Karim Alibhai.
 **/

(function () {
    "use strict";

    var match = function (str, ptn) {
        var matches = String(str).match(ptn), tmp = [], i;

        // remove empty matches
        for (i = 0; i < matches.length; i += 1) {
            if (matches[i]) {
                tmp.push(matches[i]);
            }
        }

        // the pattern should match the whole string
        return tmp.length === 1;
    };

    module.exports = function () {
        return {
            doValidation: function (spec, data) {
                var results = [], ptn, i;

                for (i in spec) {
                    if (spec.hasOwnProperty(i)) {
                        // verify property exists
                        if (spec[i].hasOwnProperty('required') && !data.hasOwnProperty(i)) {
                            results.push({
                                attr: i,
                                valid: false,
                                msg: i + ' is required'
                            });
                        } else if (spec[i].hasOwnProperty('pattern') && data.hasOwnProperty(i)) {
                            // make it into a regular expression
                            ptn = new RegExp(spec[i].pattern[0], 'g');

                            // match the pattern
                            if (!match(data[i], ptn)) {
                                results.push({
                                    attr: i,
                                    valid: false,
                                    msg: i + ' does not match pattern'
                                });
                            }
                        }
                    }
                }

                return results;
            }
        };
    };
}());