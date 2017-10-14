var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-minify-css');
var sass = require('gulp-sass');
var merge = require('merge-stream');
var plumber = require('gulp-plumber');

gulp.task('styles', function() {
	var scss_stream = gulp.src('inform_mapper/static/scss/*.scss')
		.pipe(plumber())
		.pipe(sass())
		.pipe(concat('scss-files.scss'));

	var css_stream = gulp.src('inform_mapper/static/css/*.css')
		.pipe(plumber())
		.pipe(concat('css-files.css'));

	var mergedStream = merge(scss_stream, css_stream)
		.pipe(plumber())
		.pipe(concat('style.min.css'))
		.pipe(minify())
		.pipe(gulp.dest('inform_mapper/static/css'));

	return mergedStream;
});

gulp.task('watch', function () {
	gulp.watch(['inform_mapper/static/css/*.css', 'inform_mapper/static/scss/*.scss', '!inform_mapper/static/css/style.min.css'], ['styles']);
});

gulp.task('default', ['styles']);
