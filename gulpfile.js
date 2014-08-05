'use strict';

var gulp = require('gulp')
  , browserify = require('browserify')
  , uglify = require('gulp-uglify')
  , source = require('vinyl-source-stream')
  , rename = require('gulp-rename')
  , rimraf = require('rimraf');


gulp.task('browserify', function () {
  return browserify('./src/transparencia.js')
    .bundle()
    .pipe(source('transparencia.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['browserify'], function () {
  return gulp.src('./dist/transparencia.js')
    .pipe(uglify({mangle: true}))
    .pipe(rename('transparencia.min.js'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('clean', function () {
  rimraf('dist', function (err) {
    if (err)
      (process.stdout.write('"clean" gulp task raised an error: ' + err),
       process.exit(1));
  });
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['build']);
});

gulp.task('default', ['build']);
