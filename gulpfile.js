var gulp = require('gulp');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');

gulp.task('styles', function() {
	gulp.src('inform_mapper/static/css/*.css')
		.pipe(minifyCSS())
		.pipe(concat('style.min.css'))
		.pipe(gulp.dest('inform_mapper/static/css'))
});

gulp.task('watch', function () {
	gulp.watch(['inform_mapper/static/css/*.css', '!inform_mapper/static/css/style.min.css'], ['styles']);
});

gulp.task('default', ['styles']);
