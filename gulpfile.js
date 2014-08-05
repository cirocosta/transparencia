'use strict';

var gulp = require('gulp')
  , browserify = require('gulp-browserify')
  , uglify = require('gulp-uglify')
  , rimraf = require('rimraf');

gulp.task('build', function () {
  return gulp.src(['src/transparencia.js'])
    .pipe(browserify({standalone: 'transparencia'}))
    .pipe(uglify({mangle: true}))
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
  rimraf('dist', function (err) {
    if (err)
      (process.stdout.write('"clean" gulp task raised an error: ' + err),
       process.exit(1));
  });
});

gulp.task('default', ['test', 'build']);
