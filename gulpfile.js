var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-minify-css');
var sass = require('gulp-sass');
var merge = require('merge-stream');
var plumber = require('gulp-plumber');
var del = require('del');
var uglify = require('gulp-uglify');

gulp.task('clean_styles', function () {
    return del('inform_mapper/static/css/style.min.css');
});

gulp.task('styles', ['clean_styles'],  function() {
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

gulp.task('clean_js', function() {
	return del('inform_mapper/static/scripts/frontpage.min.js');
});

gulp.task('scripts', ['clean_js'], function() {
	return gulp.src(['inform_mapper/static/scripts/frontpage/modernizr-custom.js', 'inform_mapper/static/scripts/frontpage/frontpage.js'])
		.pipe(concat('frontpage.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('inform_mapper/static/scripts/'))
});

gulp.task('watch', function () {
	gulp.watch(['inform_mapper/static/css/*.css', 'inform_mapper/static/scss/*.scss', '!inform_mapper/static/css/style.min.css'], ['styles']);
	gulp.watch(['inform_mapper/static/scripts/frontpage/*.js'], ['scripts']);
});

gulp.task('default', ['styles', 'scripts']);
