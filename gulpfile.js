var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-minify-css');
var sass = require('gulp-sass');
var merge = require('merge-stream');
var plumber = require('gulp-plumber');
var del = require('del');
var uglify = require('gulp-uglify');
var fs = require('file-system');

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

	var merged_stream = merge(scss_stream, css_stream)
		.pipe(plumber())
		.pipe(concat('style.min.css'))
		.pipe(minify())
		.pipe(gulp.dest('inform_mapper/static/css'));

	return merged_stream;
});

gulp.task('clean_front_js', function() {
	return del('inform_mapper/static/scripts/frontpage.min.js');
});

gulp.task('frontpage_scripts', ['clean_front_js'], function() {
	return gulp.src(['inform_mapper/static/scripts/frontpage/modernizr-custom.js', 'inform_mapper/static/scripts/frontpage/frontpage.js'])
		.pipe(concat('frontpage.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('inform_mapper/static/scripts/'));
});

gulp.task('clean_external_graph_js', function() {
	return del('inform_mapper/static/scripts/graph/external/external.min.js');
});

function generate_external_scripts( ) {
	return gulp.src([ 'inform_mapper/static/scripts/graph/external/*.js' ])
		.pipe(concat('external.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('inform_mapper/static/scripts/graph/external/'));
}

gulp.task('external_graph_scripts', ['clean_external_graph_js'], function() {
	return generate_external_scripts( );
});

gulp.task('clean_graph_js', function() {
	return del('inform_mapper/static/scripts/graph.min.js');
});

gulp.task('graph_scripts', ['clean_graph_js'], function() {
	try {
		fs.accessSync('inform_mapper/static/scripts/graph/external/external.min.js');
	} catch( ex ) {
		generate_external_scripts( );
	}
	
	var external_stream = gulp.src([ 'inform_mapper/static/scripts/graph/external/external.min.js' ])
		.pipe( plumber() );

	var internal_stream = gulp.src(['inform_mapper/static/scripts/graph/graph_logic.js', 'inform_mapper/static/scripts/graph/graph.js'])
		.pipe( plumber() )
		.pipe(concat('internal.min.js'))
		.pipe(uglify());

	var merged_stream = merge( external_stream, internal_stream )
		.pipe( plumber() )
		.pipe(concat('graph.min.js'))
		.pipe(gulp.dest('inform_mapper/static/scripts/'));

	return merged_stream;
});

gulp.task('watch', function () {
	gulp.watch(['inform_mapper/static/css/*.css', 'inform_mapper/static/scss/*.scss', '!inform_mapper/static/css/style.min.css'], ['styles']);
	gulp.watch(['inform_mapper/static/scripts/frontpage/*.js'], ['frontpage_scripts']);
	gulp.watch(['inform_mapper/static/scripts/graph/external/*.js', '!inform_mapper/static/scripts/graph/external/external.min.js'], ['external_graph_scripts']);
	gulp.watch(['inform_mapper/static/scripts/graph/*.js'], ['graph_scripts']);
});

gulp.task('default', ['styles', 'frontpage_scripts', 'external_graph_scripts', 'graph_scripts' ]);
