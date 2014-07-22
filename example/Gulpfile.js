/**
 * Gulpfile.js
 *
 * Simple Gulpfile to start tests,
 * and forward stream to gulp.
 **/

(function () {
    "use strict";

    var gulp = require('gulp');

    // default task is to test
    // in reality, instead of default
    // one would want to have a separate
    // task for testing
    // i.e. gulp.task('test', /* ... */);
    gulp.task('default', function () {
        // this script is set to export a stream
        // which gulp uses happily.
        return require('./test/test-sample.js');
    });
}());