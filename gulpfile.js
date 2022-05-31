const { src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoPrefixer');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const kit = require('gulp-kit');
const gulpClean = require('gulp-clean');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const gulp = require('gulp');
const fs   = require('fs');


// function mkdirSrc(cb) {

//     const folders = [
//         'src',
        
//     ];

//     folders.forEach(dir => {
//         if(!fs.existsSync(dir)) {
//             fs.mkdirSync(dir);
//             console.log('📁  folder created:', dir);    
//         }   
//     });

// 	cb()
// };


function mkdirDist(cb) {

    const folders = [
        'dist',
		'src'
        
    ];

    folders.forEach(dir => {
        if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            console.log('📁  folder created:', dir);    
        }   
    });

	cb()

    folders.forEach(src => {
        if(!fs.existsSync(src)) {
            fs.mkdirSync(src);
            console.log('📁  folder created:', src);    
        }   
    });

	cb()
};

const paths = {
	html: './html/**/*.kit',
	sass: './src/sass/**/*.scss',
	sassAdv: './src/**/*.scss',
	js: './src/js/**/*.js',
	img: './src/img/**/*',
	imgIcons: './src/img/icons/*',
	imgLogo: './src/img/logo/*',
	dist: './dist',
	sassDest: './dist/css',
	jsDest: './dist/js',
	imgDest: './dist/img',
	imgIconsDest: './dist/img/icons',
	imgLogoDest: './dist/img/logo',
};

function sassCompiler(cb) {
	src(paths.sass, paths.sassAdv)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(cssnano())
		.pipe(
			rename({
				suffix: '.min',
			})
		)
		.pipe(sourcemaps.write())
		.pipe(dest(paths.sassDest));
	cb();
}

function javaScript(cb) {
	src(paths.js)
		.pipe(sourcemaps.init())
		.pipe(
			babel({
				presets: ['@babel/env'],
			})
		)
		.pipe(uglify())
		.pipe(
			rename({
				suffix: '.min',
			})
		)
		.pipe(sourcemaps.write())
		.pipe(dest(paths.jsDest));
	cb();
}

function convertImages(cb) {
	src(paths.img)
		.pipe(sourcemaps.init())
		.pipe(imagemin())
		.pipe(sourcemaps.write())
		.pipe(dest(paths.imgDest));
	cb();

	src(paths.imgIcons)
		.pipe(sourcemaps.init())
		.pipe(imagemin())
		.pipe(sourcemaps.write())
		.pipe(dest(paths.imgIconsDest));
	cb();

	src(paths.imgLogo)
		.pipe(sourcemaps.init())
		.pipe(imagemin())
		.pipe(sourcemaps.write())
		.pipe(dest(paths.imgLogoDest));
	cb();
}

function handleKits(cb) {
	src(paths.html).pipe(kit()).pipe(dest('./'));
	cb();
}

function cleanStuff(cb) {
	src(paths.dist, { read: false }).pipe(clean());
	cb();
}

function startBrowserSync(cb) {
	browserSync.init({
		server: {
			baseDir: './',
		},
	});
	cb();
}

function watchForChanges(cb) {
	watch('./*.html').on('change', reload);
	watch(
		[paths.html, paths.sass, paths.sassAdv, paths.js],
		parallel(handleKits, sassCompiler, javaScript)
	).on('change', reload);
	watch(paths.img, convertImages).on('change', reload);
	cb();
}
const mainFunctions = parallel(
	// mkdirSrc,
	mkdirDist,
	handleKits,
	sassCompiler,
	javaScript,
	convertImages
);
exports.cleanStuff = cleanStuff;
exports.default = series(mainFunctions, startBrowserSync, watchForChanges);
