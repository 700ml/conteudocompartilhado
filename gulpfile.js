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



gulp.task('mg', function() {

  var file = getParam('file') || "devop/mail/mail.html";
  var to = getParam('to') || 'rafaelnco@live.com';
  var from = getParam('from') || 'Rafael @ CIAO <rafaelnco@ciaoagenciadigital.com>';
  var subject = getParam('subject') || 'Bem vindo a CIAO';

  fs.readFile(file, {encoding: 'utf-8', flag: 'rs'}, function(e, data) {
    if (e) return console.log(e);
    exec("curl -s --user 'api:key-2131e74e7569fae04d86dd19a8b5a562' \
    https://api.mailgun.net/v3/ciaoagenciadigital.com/messages \
    -F from='"+from+"' \
    -F to="+to+" \
    -F subject='"+subject+"' \
    -F text='"+data.replace(/(<([^>]+)>)/ig,"").replace(/\s\s/g,'')+"' \
    --form-string html='"+data+"'",
    function(err, sout, serr) {
      gutil.log(sout);
    });
  });
});


gulp.task('mc', function() {

  /*var file = getParam('file') || "devop/mail/mail.html";
  var to = getParam('to') || 'rafaelnco@live.com';
  var from = getParam('from') || 'Rafael @ CIAO <rafaelnco@ciaoagenciadigital.com>';
  var subject = getParam('subject') || 'Bem vindo a CIAO';

  fs.readFile(file, {encoding: 'utf-8', flag: 'rs'}, function(e, data) {
    if (e) return console.log(e);
    exec("curl -s --user 'api:key-2131e74e7569fae04d86dd19a8b5a562' \
    https://api.mailgun.net/v3/ciaoagenciadigital.com/messages \
    -F from='"+from+"' \
    -F to="+to+" \
    -F subject='"+subject+"' \
    -F text='"+data.replace(/(<([^>]+)>)/ig,"").replace(/\s\s/g,'')+"' \
    --form-string html='"+data+"'");
  });*/


  var mc_key = "82a032a9a1cb604d7a490bcfe9874f3a-us12";
  exec("curl --user apikey:"+mc_key+" \
     --request POST 'https://us12.api.mailchimp.com/3.0/campaigns/768bebfe43/actions/replicate/?fields=id'",
    function(er, sout, serr) {
      var id = JSON.parse(sout).id;
      exec("curl --user apikey:"+mc_key+" \
     --request POST 'https://us12.api.mailchimp.com/3.0/campaigns/"+id+"/actions/send'",
     function(er, sout, serr) {
      gutil.log(sout);
     });
    });

  /*curl --user apikey:$MC_KEY \
     --request GET "https://us12.api.mailchimp.com/3.0/campaigns/?fields=campaigns.id,campaigns.settings.title"

  curl --user apikey:$MC_KEY \
     --request POST "https://us12.api.mailchimp.com/3.0/campaigns/768bebfe43/actions/send"


  curl --user apikey:$MC_KEY \
     --request POST "https://us12.api.mailchimp.com/3.0/campaigns/768bebfe43/actions/replicate/?fields=id"*/
});


/*gulp.task('compile', function() {
  return gulp.src('src/*.js')
    .pipe(closureCompiler({
      compilerPath: 'bower_components/closure-compiler/compiler.jar',
      fileName: 'build.js'
      compilerFlags: {
        closure_entry_point: 'src/script.js',
        compilation_level: 'ADVANCED_OPTIMIZATIONS',
        only_closure_dependencies: true,
        warning_level: 'VERBOSE'
      }
    }))
    .pipe(gulp.dest('.'));
});*/

//basic example
/*gulp.task('b64', function () {
    return gulp.src('./css/*.css')
        .pipe(base64())
        .pipe(concat('main.css'))
        .pipe(gulp.dest('./public/css'));
});*/
//example with options
/*gulp.task('b64', function () {
    return gulp.src('./css/*.css')
        .pipe(base64({
            baseDir: 'public',
            extensions: ['svg', 'png', /\.jpg#datauri$/i],
            exclude:    [/\.server\.(com|net)\/dynamic\/, '--live.jpg'],
            maxImageSize: 8*1024, // bytes,
            deleteAfterEncoding: false,
            debug: true
        }))
        .pipe(concat('main.css'))
        .pipe(gulp.dest('./public/css'));
});*/