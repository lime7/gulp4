'use strict';
 
// Load plugins
const gulp          = require('gulp'),
      autoprefixer  = require('autoprefixer'),	
      sass          = require('gulp-sass'),
      cssnano       = require('cssnano'),
      postcss       = require('gulp-postcss'),
      imagemin      = require('gulp-imagemin'),
      uglify        = require('gulp-uglify'),
      rename        = require('gulp-rename'),
      watch         = require('gulp-watch'),
      clean         = require('gulp-clean'),
      htmlPartial   = require('gulp-html-partial'),
      browserSync   = require('browser-sync').create(),
      reload        = browserSync.reload,
      eslint        = require('gulp-eslint'),
      plumber       = require('gulp-plumber'),
      gulpStylelint = require('gulp-stylelint');

// Paths
var path = {
	app : {          // src
		html   : 'app/*.html',
		partials: 'app/partials/',
		js     : 'app/js/**/*.js',
		gulpFile: './gulpfile.js',
		scss   : 'app/scss/style.scss',		
		images : 'app/images/**/*.*',
		fonts  : 'app/fonts/**/*.*',
		},
	dist : {         // dist
		html   : 'dist/',		
		js     : 'dist/js/',
		css    : 'dist/css/',
		images : 'dist/images/',
		fonts  : 'dist/fonts/'
	},
	watch : {        // watch
		html   : 'app/**/*.html',
		js     : 'app/js/**/*.js',
		scss   : 'app/scss/**/*.scss',		
		images : 'app/images/**/*.*',
		fonts  : 'app/fonts/**/*.*'
	},
	clean      : './dist' // clean
};



// HTML task
function html() {
    gulp.src(path.app.html)
		.pipe(htmlPartial({
			basePath: path.app.partials
		}))
		.pipe(gulp.dest(path.dist.html));
}

// JS Lint scripts
function scriptsLint() {
	return gulp.src([path.app.js, path.app.gulpFile])
		.pipe(plumber())
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
}

// JS task
function scripts() {
	return gulp.src(path.app.js)
		.pipe(uglify())
		.pipe(gulp.dest(path.dist.js));
}


sass.compiler = require('node-sass');

// SASS task
function scss() {
	gulp.src(path.app.scss)
		.pipe(plumber())
		.pipe(gulpStylelint({
			failAfterError: false,
			reporters: [
				{
					formatter: 'string',
					console: true
				}
			]
		}))
		.pipe(sass({
			includePaths: ['node_modules'],
			outputStyle: 'expanded'
		}).on('error', sass.logError))
		.pipe(gulp.dest(path.dist.css))
		.pipe(rename({ suffix: '.min' }))
		.pipe(postcss([autoprefixer(), cssnano()]))
		.pipe(gulp.dest(path.dist.css));
}

// FONTS task 
function fonts() {
	return gulp.src(path.app.fonts)
		.pipe(gulp.dest(path.dist.fonts));
}

// IMAGES task
function images() {
	gulp.src(path.app.images)
		.pipe(imagemin())
		.pipe(gulp.dest(path.dist.images));
}

// BrowserSync
function browserSyncServe(done) {
	browserSync.init({
		server: {
			baseDir: './dist'
		},
		port: 9000
	});
	done();
}


// BrowserSync Reload
function browserSyncReload(done) {
	browserSync.reload();
	done();
}

// Clean assets
function del() {
    return gulp.src(path.clean)
        .pipe(clean());
}

// Watch files
function watchFiles() {
    gulp.watch(path.watch.html, gulp.series(html, browserSyncReload));
    gulp.watch(path.watch.scss, gulp.series(scss, browserSyncReload));
    gulp.watch(path.watch.js, gulp.series(scriptsLint, scripts));
    gulp.watch(path.watch.images, gulp.series(images));
    gulp.watch(path.watch.fonts, gulp.series(fonts));

    return;
}

// Define complex tasks
const js = gulp.series(scriptsLint, scripts);
const build = gulp.series(del, html, scss, js, fonts, images);
const serve = gulp.parallel(html, scss, js, images, fonts, watchFiles, browserSyncServe);

// Export tasks
exports.scss = scss;
exports.html = html;
exports.js = js;
exports.fonts = fonts;

exports.del = del;
exports.serve = serve;
exports.default = build;