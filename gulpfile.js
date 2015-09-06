var fs = require('fs'),
  path = require('path'),
  express = require('express'),
  gulp = require('gulp'),
  gutil = require('gulp-util'),
  rename = require('gulp-rename'),
  less = require('gulp-less'),
  minifycss = require('gulp-minify-css'),
  concat = require('gulp-concat'),
  clean = require('gulp-clean'),
  sourcemaps = require('gulp-sourcemaps'),
  webpack = require('webpack'),
  gulpWebpack = require('gulp-webpack'),
  WebpackDevServer = require('webpack-dev-server'),
  moduleBuilder = require('./tool/module-builder.js'),
  mkcfg = require('./tool/make.webpack.js'),
  externals = ([{
    path: 'q',
    root: 'Q',
    lib: 'q'
  }, {
    path: 'org/cometd',
    root: 'org.cometd',
    lib: 'org/cometd'
  }, {
    path: 'jquery',
    root: 'jQuery',
    lib: 'jquery'
  }, {
    path: 'lodash',
    root: '_',
    lib: '_'
  }, {
    path: 'rivets',
    root: 'rivets',
    lib: 'rivets'
  }]),
  library = requireLibrary = 'dat',
  libOutput = library + '.js',
  docOutput = library + '.doc.js',
  cssOutput = library + '.css',
  dist = './dist/js',
  cssDist = './dist/css',
  cssThemeDist = './dist/css',
  docDist = './dist',
  templateSrc = './src/template',
  templateDist = './src/template',
  scriptSrc = './src/js',
  lessSrc = './src/less',
  lessThemeSrc = './src/less/theme',
  libMain = 'index.js',
  docMain = 'doc.js',
  host = 'localhost',
  port = 8089,
  moduleIdxTmplSrc = './tmpl/index.js',
  docIdxTmplSrc = './tmpl/doc.js',
  lib = {
    src: scriptSrc + '/' + libMain,
    library: library,
    require: requireLibrary,
    filename: libOutput,
    externals: externals,
    moduleDirectories: ['dependency', './src']
  },
  doc = {
    src: scriptSrc + '/' + docMain,
    library: library,
    require: requireLibrary,
    filename: docOutput,
    externals: externals.concat({
      path: requireLibrary,
      root: library,
      lib: requireLibrary
    }),
    moduleDirectories: ['dependency', './src']
  };

gulp.task('build:module', ['build:template'], function() {
  return gulp.src(scriptSrc)
    .pipe(moduleBuilder.buildModule({
      out: libMain,
      excludes: [/^doc\.js$/, /\/doc\/.*$/, /_[^/]*\.js$/],
      tpl: fs.readFileSync(moduleIdxTmplSrc).toString()
    }))
    .pipe(gulp.dest(scriptSrc));
});

gulp.task('build:module:doc', function() {
  return gulp.src(scriptSrc)
    .pipe(moduleBuilder.buildDoc({
      out: docMain,
      includes: [/\/doc$/],
      excludes: [/_[^/]*\.js$/],
      tpl: fs.readFileSync(docIdxTmplSrc).toString()
    }))
    .pipe(gulp.dest(scriptSrc));
});

gulp.task('build:template', function() {
  return gulp.src(templateSrc)
    .pipe(moduleBuilder.buildTemplate())
    .pipe(gulp.dest(templateDist));
});

function _buildCompontent(dir, option, checFile) {
  var output = path.join(__dirname, dir, option.filename);
  if (!checFile && fs.existsSync(output)) {
    return;
  }
  var cfg = {
      entry: option.src,
      output: output,
      devtool: 'source-map',
      library: option.library,
      externals: option.externals || [],
      plugins: option.plugins || [],
      moduleDirectories: moduleDirectories
    },
    miniCfg = {
      entry: option.src,
      output: output.replace(/js$/, 'min.js'),
      library: option.library,
      externals: option.externals || [],
      plugins: (option.plugins || []).concat(new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })),
      moduleDirectories: option.moduleDirectories
    }
  return gulp.src('./')
    .pipe(gulpWebpack(mkcfg(cfg)))
    .pipe(gulp.dest(dir))
    .pipe(gulpWebpack(mkcfg(miniCfg)))
    .pipe(gulp.dest(dir));
}

gulp.task('build:lib', ['build:module'], function() {
  return _buildCompontent(dist, lib, true);
});

gulp.task('build:doc', ['build:module:doc'], function() {
  return _buildCompontent(dist, doc, true);
});

gulp.task('build:css', function() {
  return gulp.src([lessSrc + '/*.less', '!' + lessSrc + '/theme.less'])
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(concat(cssOutput))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(cssDist))
    .pipe(rename(cssOutput.replace(/css$/, 'min.css')))
    .pipe(minifycss())
    .pipe(gulp.dest(cssDist));
});

gulp.task('build:theme', function(c) {
  moduleBuilder.scanFiles(path.join(__dirname, lessThemeSrc), function() {
    return false
  }, function(filePath, isDir, c) {
    if (isDir) {
      var dirName = filePath.replace(/.*[\\/]/g, ''),
        output = cssOutput.replace(/css$/, dirName + '.css');
      gulp.src([lessThemeSrc + '/' + dirName + '/*.less', lessSrc + '/theme.less'])
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(concat(output))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(cssThemeDist))
        .pipe(rename(output.replace(/css$/, 'min.css')))
        .pipe(minifycss())
        .pipe(gulp.dest(cssThemeDist))
        .on('end', c);
    } else {
      c();
    }
  }, c);
});

gulp.task('build:styles', ['build:css', 'build:theme']);


gulp.task('build:dist', ['clean'], function() {
  return gulp.start(['build:lib', 'build:doc', 'build:styles']);
});

gulp.task('clean:dist', function() {
  return gulp.src([dist, cssDist, cssThemeDist, docDist])
    .pipe(clean());
});

gulp.task('clean:template', function() {
  return gulp.src([templateDist + '/**/*.html.js'])
    .pipe(clean());
});

gulp.task('clean', ['clean:dist', 'clean:template']);

gulp.task('watch:module', function(event) {

  gulp.watch(moduleIdxTmplSrc, ['build:module']);
  gulp.watch(docIdxTmplSrc, ['build:module:doc']);

  gulp.watch([templateSrc + '/**/*.html'], ['build:template'])

  gulp.watch([scriptSrc + '/**/*.js', '!' + scriptSrc + '/' + docMain, '!' + scriptSrc + '/**/doc/**'], function(event) {
    if (event.type === 'added' || event.type === 'deleted') {
      gulp.start('build:module');
    }
  });

  gulp.watch([scriptSrc + '**/doc/**', '!' + scriptSrc + '/' + libMain], function(event) {
    if (event.type === 'added' || event.type === 'deleted') {
      gulp.start('build:module:doc');
    }
  });
});

gulp.task('watch:style', function() {
  gulp.watch([lessSrc + '/*.less', '!' + lessSrc + '/theme.less'], ['build:less']);
  gulp.watch([lessThemeSrc + '/*.less', lessSrc + '/theme.less'], ['build:theme']);
})

gulp.task('watch', ['watch:module', 'watch:style']);

gulp.task('server', ['build:dist'], function() {
  var moduleDirectories = [].concat(lib.moduleDirectories),
    cfg = {
      entry: {},
      publicPath: 'http://' + host + ':' + port + '/dist/js/',
      output: path.join(__dirname, '[name]'),
      library: library,
      externals: doc.externals,
      hot: true,
      devtool: 'source-map',
      plugins: [new webpack.NoErrorsPlugin()],
      moduleDirectories: moduleDirectories
    };
  doc.moduleDirectories.forEach(function(dir) {
    if (moduleDirectories.indexOf(dir) == -1) {
      moduleDirectories.push(dir);
    }
  });
  cfg.entry[lib.filename] = lib.src;
  cfg.entry[doc.filename] = doc.src;

  var devServer = new WebpackDevServer(webpack(mkcfg(cfg)), {
    contentBase: path.join('./'),
    publicPath: cfg.publicPath,
    hot: true,
    noInfo: false,
    inline: true,
    stats: {
      colors: true
    }
  });
  devServer.listen(port, host, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log('Listening at port ' + port);
    }
  });
  gulp.start('watch');
});
