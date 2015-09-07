var fs = require('fs'),
  path = require('path'),
  express = require('express'),
  gulp = require('gulp'),
  gutil = require('gulp-util'),
  rename = require('gulp-rename'),
  gulpless = require('gulp-less'),
  minifycss = require('gulp-minify-css'),
  concat = require('gulp-concat'),
  clean = require('gulp-clean'),
  sourcemaps = require('gulp-sourcemaps'),
  webpack = require('webpack'),
  gulpWebpack = require('gulp-webpack'),
  WebpackDevServer = require('webpack-dev-server'),
  moduleBuilder = require('./tool/module-builder.js'),
  mkcfg = require('./tool/make.webpack.js'),
  main = {
    src: './src/js',
    dist: './dist/js',
    entry: 'index.js',
    library: 'dat',
    output: 'dat.js',
    moduleDirectories: ['dependency', './src'],
    externals: [{
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
    }, {
      path: 'dat',
      root: 'dat',
      lib: 'dat'
    }]
  },
  doc = {
    src: './src/js',
    dist: './dist/js',
    entry: 'doc.js',
    library: 'dat',
    output: 'dat.doc.js',
    moduleDirectories: ['dependency', './src'],
    externals: main.externals.concat({
      path: 'dat',
      root: 'dat',
      lib: 'dat'
    })
  },
  less = {
    src: './src/less',
    dist: './dist/css',
    output: 'dat.css',
    theme: {
      output: 'dat-{name}.css',
      src: './src/less/theme',
      dist: './dist/css/theme'
    }
  },
  template = {
    src: './src/template',
    dist: './src/template'
  },
  devserver = {
    host: 'localhost',
    port: 8089
  },
  moduleTmpl = {
    index: './tmpl/index.js',
    doc: './tmpl/doc.js'
  };

function _buildCompontent(config, rebuild) {
  var output = path.join(__dirname, config.dist, config.output);
  if (!rebuild && fs.existsSync(output)) {
    return;
  }
  var cfg = Object.create(config),
    miniCfg = Object.create(config);
  cfg.entry = miniCfg.entry = config.src + '/' + config.entry;
  cfg.output = miniCfg.output = output;
  cfg.devtool = 'source-map';
  miniCfg.output = miniCfg.output.replace(/js$/, 'min.js');
  miniCfg.plugins = (miniCfg.plugins || []).concat(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }));
  return gulp.src(config.src)
    .pipe(gulpWebpack(mkcfg(cfg)))
    .pipe(gulp.dest(config.dist))
    .pipe(gulpWebpack(mkcfg(miniCfg)))
    .pipe(gulp.dest(config.dist));
}

gulp.task('build:lib', ['build:module'], function() {
  return _buildCompontent(main, true);
});

gulp.task('build:doc', ['build:module:doc'], function() {
  return _buildCompontent(doc, true);
});

gulp.task('build:module', ['build:template'], function() {
  return gulp.src(main.src)
    .pipe(moduleBuilder.buildModule({
      out: main.entry,
      excludes: [/^doc\.js$/, /\/doc\/.*$/, /_[^/]*\.js$/],
      tpl: fs.readFileSync(moduleTmpl.index).toString()
    }))
    .pipe(gulp.dest(main.src));
});

gulp.task('build:module:doc', function() {
  return gulp.src(doc.src)
    .pipe(moduleBuilder.buildDoc({
      out: doc.entry,
      includes: [/\/doc$/],
      excludes: [/_[^/]*\.js$/],
      tpl: fs.readFileSync(moduleTmpl.doc).toString()
    }))
    .pipe(gulp.dest(doc.src));
});

gulp.task('build:template', function() {
  return gulp.src(template.src)
    .pipe(moduleBuilder.buildTemplate())
    .pipe(gulp.dest(template.dist));
});


gulp.task('build:less', function() {
  return gulp.src([less.src + '/*.less', '!' + less.src + '/theme.less'])
    .pipe(sourcemaps.init())
    .pipe(gulpless())
    .pipe(concat(less.output))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(less.dist))
    .pipe(rename(less.output.replace(/css$/, 'min.css')))
    .pipe(minifycss())
    .pipe(gulp.dest(less.dist));
});

gulp.task('build:less:theme', function(c) {
  moduleBuilder.scanFiles(path.join(__dirname, less.theme.src), function() {
    return false
  }, function(filePath, isDir, c) {
    if (isDir) {
      var dirName = filePath.replace(/.*[\\/]/g, ''),
        output = less.theme.output.replace(/\{name\}/, dirName);
      gulp.src([less.theme.src + '/' + dirName + '/*.less', less.src + '/theme.less'])
        .pipe(sourcemaps.init())
        .pipe(gulpless())
        .pipe(concat(output))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(less.theme.dist))
        .pipe(rename(output.replace(/css$/, 'min.css')))
        .pipe(minifycss())
        .pipe(gulp.dest(less.theme.dist))
        .on('end', c);
    } else {
      c();
    }
  }, c);
});

gulp.task('build:styles', ['build:less', 'build:less:theme']);


gulp.task('build', ['clean'], function() {
  return gulp.start(['build:lib', 'build:doc', 'build:styles']);
});

gulp.task('clean', function() {
  return gulp.src([main.dist, doc.dist, less.dist, less.theme.dist, template.dist + '/**/*.html.js'])
    .pipe(clean());
});

gulp.task('watch:module', function(event) {

  gulp.watch(moduleTmpl.index, ['build:module']);
  gulp.watch(moduleTmpl.doc, ['build:module:doc']);

  gulp.watch([template.src + '/**/*.html'], ['build:template'])

  gulp.watch([main.src + '/**/*.js', '!' + doc.src + '/' + doc.entry, '!' + main.src + '/**/doc/**'], function(event) {
    if (event.type === 'added' || event.type === 'deleted') {
      gulp.start('build:module');
    }
  });

  gulp.watch([doc.src + '**/doc/**', '!' + main.src + '/' + main.entry], function(event) {
    if (event.type === 'added' || event.type === 'deleted') {
      gulp.start('build:module:doc');
    }
  });
});

gulp.task('watch:style', function() {
  gulp.watch([less.src + '/*.less', '!' + less.src + '/theme.less'], ['build:less']);
  gulp.watch([less.theme.src + '/*.less', less.src + '/theme.less'], ['build:theme']);
})

gulp.task('watch', ['watch:module', 'watch:style']);

gulp.task('server', ['build'], function() {
  var cfg = Object.create(doc);
  cfg.entry = {};
  cfg.entry[main.output] = main.src + '/' + main.entry;
  cfg.entry[doc.output] = doc.src + '/' + doc.entry;
  cfg.publicPath = 'http://' + devserver.host + ':' + devserver.port + main.dist.replace(/^\.\//, '/');
  cfg.hot = true;
  cfg.devtool = 'source-map',
  cfg.plugins = (cfg.plugins || []).push(new webpack.NoErrorsPlugin());
  cfg.output = path.join(__dirname, '[name]');
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
  devServer.listen(devserver.port, devserver.host, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log('Listening at port ' + devserver.port);
    }
  });
  gulp.start('watch');
});
