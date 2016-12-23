var

  //basic
  gulp = require('gulp')
  , fs = require("fs")
  , gutil = require('gulp-util')
  , exec = require('child_process').exec

  // test
  /*, sass = require('gulp-sass')*/
//  , closureCompiler = require('gulp-closure-compiler')
  ,obfuscate = require('gulp-obfuscate')
/*  , sharp = require('sharp')
  , gSharp = require('gulp-sharp')*/
  // chain
  , imagemin = require('gulp-imagemin')
  , pngquant = require('imagemin-pngquant')
  , inline = require('gulp-inline')
  , uglify = require('gulp-uglify')
  , htmlmin = require('gulp-htmlmin')
  , minifyCss = require('gulp-minify-css')

  // aux
  , gzip = require('gulp-gzip')
  , base64 = require('gulp-base64')
  , uncss = require('gulp-uncss')
  , autoprefixer = require('gulp-autoprefixer');


function getParam(param) {
  var i = process.argv.indexOf("--" + param);
  if(i>-1) {
    return process.argv[i+1];
  } else {
    return undefined; 
  }
}

function getFlag(flag) {
  return process.argv.indexOf("-" + flag) != -1;
}
/*
  testing
*/
gulp.task('svg', () => {
    return gulp.src('src/SVG_/*')
        .pipe(imagemin({
            progressive: true,
            multipass: true,
            svgoPlugins: [
              { removeViewBox: false },
              { removeXMLProcInst: false },
              { removeRasterImages: true },
              { removeDimensions: true },
              { cleanupIDs: false }
            ],
            //use: [pngquant()]
        }))
        .pipe(gulp.dest('src/SVG'));
});
gulp.task('PI', () => {
  var dest = getParam('dir') || 'dest';
  return gulp.src([
      'content3/**/*.png',
      'content3/**/*.jpg'])
    .pipe(imagemin({
        progressive: true,
        multipass: true,
        use: [pngquant()]
    }))
    .pipe(gulp.dest(dest))
    .on('end', function() { 
      gutil.log('Images processed!');
    });
});

function pack(dest, opts) {
  if(opts)
  gulp.src('src/**/*.html')
  .pipe(inline({
    base: 'src/',
    js: uglify,
    css: minifyCss,
    disabledTypes: ['img', 'js'], //js, css, svg
    ignore: opts.ignore || []
  }))
  .pipe(htmlmin({
    removeStyleLinkTypeAttributes: true,
    removeCDATASectionsFromCDATA: true,
    removeScriptTypeAttributes: true,
    collapseBooleanAttributes: true,
    removeRedundantAttributes: true,
    preventAttributesEscaping: true,
    removeCommentsFromCDATA: true,
    removeAttributeQuotes: true,
    removeEmptyAttributes: true,
    collapseWhitespace: true,
    removeOptionalTags: true,
    keepClosingSlash: true,
    useShortDoctype: true,
    removeComments: true,
    caseSensitive: false, //custom elements unknown
    minifyURLs: false, //test*/
    minifyCSS: false, //already did
    minifyJS: false, //already did
    //removeEmptyElements: true, //BREAKING
    //lint: true, //unknown BREAKING
  }))
  .pipe(gulp.dest(dest))
  .on('end', function() { 
    gutil.log('Main resources processed');
  });

  if(opts.processImages) {
    gulp.src([
      'src/**/*.png',
      'src/**/*.jpg'])
    .pipe(imagemin({
        progressive: true,
        multipass: true,
        use: [pngquant()]
    }))
    .pipe(gulp.dest(dest))
    .on('end', function() { 
      gutil.log('Images processed!');
    });
  }

  
  //copy
  gulp.src(opts.copy || [])
  .pipe(gulp.dest(dest))
  .on('end', function() { 
    gutil.log('All resources OK!');
  });

  gulp.src('src/**/*.js')
        .pipe(obfuscate())
        .pipe(gulp.dest(dest))
  .on('end', function() { 
    gutil.log('Obfuscate resources OK!');
  });
}

/* OK

src
  assets
    css
    js
    images
      jpg
      svg
  html

dist
  processed assets
    munched css + js
    minified css
    minified js


prod
  bundled site

*/
gulp.task('pack', function() {
  var dest = getParam('dir') || 'dest';
  var lazyjs = getFlag('lazyjs');
  var lazycss = getFlag('lazycss');
/*  var i = process.argv.indexOf("--dir");
  if(i>-1) {
      dest = process.argv[i+1];
  }*/
  var all = 'src/**/*';
  var allJS = 'src/{js,js/**}';
  var allCSS = 'src/{css,css/**}';
  gutil.log(lazyjs?'':'!'+allJS);
  var ignoreCSS = [
        "css/animate-3.4.0.min.css",
        "css/ladda.min.css",
        "css/swiper.css",
        "css/menuzao.css",
        "css/customswiper.css"];
  var opts = {
    copy: [
      all,
      '!src/*.html',
      '!src/**/*.png',
      '!src/**/*.jpg',
      '!src/{SVG,SVG/**}',
      lazycss?'':'!'+allCSS,
      lazyjs?'':'!'+allJS
    ],
    ignore: ignoreCSS,
    processImages: getFlag('images') //process.argv.indexOf("-images") != -1
  };
  if(!opts.processImages) {
    opts.copy = [
      'src/**/*',
      'src/**/*.png',
      'src/**/*.jpg',
      'src/{SVG,SVG/**}',
      '!src/*.html',
      lazycss?'':'!'+allCSS,
      lazyjs?'':'!'+allJS
    ]
  }
  if(process.argv.indexOf("-lazy") > -1) {
    opts.ignore = [
      'SVG/Detalhismo.svg',
      'SVG/Resultado.svg',
      'SVG/Humanismo.svg',
      'SVG/Valor.svg',
      'SVG/Digital.svg',
      'SVG/Historias.svg',
      'SVG/Intraempreendimento.svg',
      'SVG/Talentos.svg',
      'SVG/Desafio.svg'
    ];
    if(opts.processImages) {
      opts.copy = [
        'src/**/*',
        '!src/*.html',
        '!src/**/*.png',
        '!src/**/*.jpg',
        '!src/SVG/Mountains.svg',
        '!src/SVG/Clouds.svg',
        '!src/SVG/Land.svg',
        '!src/SVG/beach.svg',
        '!src/SVG/beachbg.svg',
        lazycss?'':'!'+allCSS,
        lazyjs?'':'!'+allJS
      ]
    } else {
      opts.copy = [
        'src/**/*',
        '!src/*.html',
        '!src/SVG/Mountains.svg',
        '!src/SVG/Clouds.svg',
        '!src/SVG/Land.svg',
        '!src/SVG/beach.svg',
        '!src/SVG/beachbg.svg',
        lazycss?'':'!'+allCSS,
        lazyjs?'':'!'+allJS
      ]
    }
  }
  pack(dest, opts);
});

gulp.task('default', function() {
  pack('dest');
});

gulp.task('dzi', function() {
  var dest = getParam('dir') || 'dest';
/*  var i = process.argv.indexOf("--dir");
  if(i>-1) {
      dest = process.argv[i+1];
  }*/
  exec("find "+dest+"/* -maxdepth 1 -name '*.png' ! -name '*_low.png' ! -name 'bg.png' -execdir magick-slicer.sh {} \\;");

});


/*
  for a previous version of the gziped file
*/
function compress(dest) {
  gulp.src(dest + '/index.html')
  .pipe(gzip({ append: true }))
  .pipe(gulp.dest(dest))
  .on('end',function(){
    gutil.log(dest);
  });
}
gulp.task('gzip', function() {
  var dest = 'src';
  var i = process.argv.indexOf("--dir");
  if(i>-1) {
      dest = process.argv[i+1];
  }
  compress(dest);
});

/*
  this will not work with javascript
  separate css assets and process individually:
    animate.css
    ladda.css
    etc
*/
gulp.task('uncss', function () {
    return gulp.src('src/anim.css')
        .pipe(uncss({
            html: ['src/index.html']
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('prefix', function () {
  return gulp.src('src/style.css')
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('dest'));
});

/*
  testing

  gulp.task('sass:watch', function () {
  gulp.watch('./src/*.scss', ['sass']);
});*
*/
gulp.task('sass', function () {
  gulp.src('./src/scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/scss'));
});

