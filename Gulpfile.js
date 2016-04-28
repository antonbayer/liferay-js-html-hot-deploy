"use strict";
var gulp = require('gulp');
var del = require('del');
var watchGulp = require('gulp-watch');

gulp.task('catSync', function() {

    var source = process.env.npm_config_source;

    if (source === undefined) {
        source = './sources.json';
    }

    try {
        var srcs_dest_s = require(source);
    } catch (Exception) {
        console.log(source + " not found.");
        return;
    }

    for (var i = 0; i < srcs_dest_s.length; i++) {
        var srcs_dest = srcs_dest_s[i];

        var srcs = srcs_dest.srcs;
        var dest = srcs_dest.dest;

        for (var j = 0; j < srcs.length; j++) {
            var src = srcs[j];
            sync(src, dest);
            watch(src, dest);
        }
    }

    function watch(src, dest, path) {

        watchGulp([src + '/**/*.html', src + '/**/*.js', src + '/**/*.css'], function(vinyl) {

            console.log(vinyl.event, vinyl.path);
            switch (vinyl.event) {
                case "add":
                    created(src, dest, vinyl.path);
                    break;
                case "unlink":
                    deleted(src, dest, vinyl.path);
                    break;
                case "change":
                    changed(src, dest, vinyl.path);
                    break;
            }
        });
    }
	
	function sync(src, dest) {
        console.log("sync", src, dest);
        gulp.src(src + "/**/*").pipe(gulp.dest(dest));
    }

    function created(src, dest, path) {
        console.log("created", src, dest, path);
        createdChanged(src, dest, path);
    }

    function changed(src, dest, path) {
        console.log("changed", src, dest, path);
        createdChanged(src, dest, path);
    }
	
	function createdChanged(src, dest, path) {
        var subPath = path.replace(src, '');
        var destPath = dest + subPath;
        destPath = destPath.substring(0, destPath.lastIndexOf("\\"));
        gulp.src(path).pipe(gulp.dest(destPath));
    }

    function deleted(src, dest, path) {
        console.log("deleted", src, dest, path);
        var subPath = path.replace(src, '');
        var destPath = dest + subPath;
        console.log(destPath, dest);
        del([destPath], {
            force: true
        });
    }
});