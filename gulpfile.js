/**
 * Gulpfile.js
 * Build management for kinvey-local.
 *
 * Copyright (C) Karim Alibhai 2014-2015.
 **/

(function () {
    "use strict";

    var gulp = require('gulp'),
        jslint = require('gulp-jslint');

    // lint every javascript file ever
    gulp.task('default', function () {
        return gulp.src(['Gulpfile.js', 'index.js', 'modules/*.js', 'test/test-*.js', 'example/*.js', 'example/*/*.js'])
            .pipe(jslint({
                node: true,
                nomen: true
            }));
    });
}());
