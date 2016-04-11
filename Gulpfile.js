(function gulpTasks() {
    'use strict';

var gulp = require('gulp'),
	sass = require('gulp-sass'),
	sassLint = require('gulp-sass-lint'),
	minifyCSS = require('gulp-minify-css'),
	autoprefixer = require('gulp-autoprefixer'),
	neat = require('node-neat').includePaths,
	eslint = require('gulp-eslint'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	sourcemaps = require('gulp-sourcemaps'),
	sequence = require('gulp-sequence'),
	notify = require('gulp-notify'),
	plumber = require('gulp-plumber'),
	rename = require('gulp-rename'),
	connect = require('gulp-connect'),
	queue = require('streamqueue'),
	paths = {
		root: 	'./app',
		js: 	'./assets/js',
		sass: 	'./assets/sass',
		mainJS: './assets/js/main.js',
		mainSASS: './assets/sass/main.sass'
	},
	sassVendors = [
		'./bower_components/font-awesome/scss/',
	],
	jsVendors = [
		'./bower_components/jquery/dist/jquery.min.js',
		'./bower_components/localforage/dist/localforage.min.js',
		'./bower_components/moment/min/moment.min.js',
		'./bower_components/pikaday-time/pikaday.js'
	],
	fonts = {
		src: [
			'./bower_components/font-awesome/fonts/*',
		],
		dest: './app/fonts/'
	};

gulp.task('default', sequence('copyFonts', ['styles','scripts'],'webserver','watch'));

gulp.task('copyFonts',function(){
	return gulp.src(fonts.src).pipe(gulp.dest(fonts.dest));
});

gulp.task('webserver',function(){
	console.log("werb server",paths.root);
	connect.server({
		root: paths.root,
		livereload: true
	});
});

gulp.task('watch',function(){
	gulp.watch(paths.sass+'/*.sass',['styles']);
	gulp.watch(paths.js+'/*.js',['scripts']);
});

gulp.task('styles', ['sass-lint', 'sass']);

gulp.task('sass-lint',function(){
	gulp
		.src(paths.mainSASS)
		.pipe(plumber({
			errorHandler: function(err) {
				notify.onError({
					title: 'Sass Lint Error',
					message: '<%= error.message %>',
					sound: 'Sosumi'
				})(err);
				this.emit('end');
			}
		}))
		.pipe(sassLint({'config': 'lint.yml'}))
		.pipe(sassLint.format());
		//.pipe(sassLint.failOnError());
});

gulp.task('sass',function(){

	gulp.src(paths.mainSASS)
		.pipe(plumber({
			errorHandler: function(err) {
				notify.onError({
					title: 'Sass Compile Error',
					message: '<%= error.message %>',
					sound: 'Sosumi'
				})(err);
				this.emit('end');
			}
		}))
		.pipe(sourcemaps.init())
		.pipe(sass({
			style: 'compact',
			includePaths: neat.concat(sassVendors),
			sourceMap: true
		}))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(minifyCSS())
		.pipe(rename('style.css'))
		.pipe(gulp.dest(paths.root))
		.pipe(sourcemaps.write(paths.root))
		.pipe(gulp.dest(paths.root))
		.pipe(notify({
			message: 'SASS complete'
		}))
		.pipe(connect.reload());
});



gulp.task('scripts', ['es-lint', 'js']);

gulp.task('es-lint',function(){
	gulp.src(paths.js+'/*.js')
		.pipe(plumber({
			errorHandler: function(err) {
				notify.onError({
					title: 'JS Compile Error',
					message: '<%= error.message %>',
					sound: 'Sosumi'
				})(err);
				this.emit('end');
			}
		}))
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('js',function(){

	var concatStream = gulp.src(jsVendors),
		minStream = gulp.src(paths.js+'/*.js')
		.pipe(plumber({
			errorHandler: function(err) {
				notify.onError({
					title: 'JS Compile Error',
					message: '<%= error.message %>',
					sound: 'Sosumi'
				})(err);
				this.emit('end');
			}
		}))
		.pipe(sourcemaps.init())
		.pipe(uglify());

	return queue({objectMode:true},concatStream,minStream)
		.pipe(concat('script.min.js'))
		.pipe(gulp.dest(paths.root))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.root))
		.pipe(notify({
			message: 'JS complete'
		}));
});

})();