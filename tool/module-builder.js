var path = require('path'),
  gutil = require('gulp-util'),
  through = require('through2'),
  html2js = require('html2js'),
  fs = require('fs'),
  ejs = require('ejs'),
  is = require('is');

var builder = {
  fileStat: function(path, callback) {
    if (callback) {
      fs.stat(path, function(err, stat) {
        if (err) {
          throw new Error(err);
        }
        callback(stat);
      });
    } else {
      return fs.statSync(path);
    }
  },
  scanFiles: function(dir, dirFilter, callback, end) {
    fs.readdir(dir, function(err, files) {
      if (files.length === 0) {
        end();
        return;
      }
      var _executed = 0;
      var _end = function() {
        _executed++;
        if (files.length === _executed) {
          end();
        }
      }
      files.forEach(function(f) {
        var fpath = path.join(dir, f);
        builder.fileStat(fpath, function(stat) {
          if (stat.isDirectory()) {
            if (!dirFilter || dirFilter(fpath) !== false) {
              builder.scanFiles(fpath, dirFilter, callback, function() {
                callback(fpath, true, _end);
              });
            } else {
              callback(fpath, true, _end);
            }
          } else {
            callback(fpath, false, _end);
          }
        });
      });
    });
  },
  _MODULE_GENERATOR: '/*@MODULE_GENERATOR@*/'
};

function checkArray(arr) {
  arr = arr || [];
  if (!Array.isArray(arr)) {
    arr = [arr];
  }
  return arr;
}

function checkReg(str, includes, excludes) {
  includes = checkArray(includes);
  excludes = checkArray(excludes);
  for (var i = 0; i < includes.length; i++) {
    var reg = new RegExp(includes[i]);
    if (!reg.test(str)) {
      return false;
    }
  }
  for (var i = 0; i < excludes.length; i++) {
    var reg = new RegExp(excludes[i]);
    if (reg.test(str)) {
      return false;
    }
  }
  return true;
}

var _parseOutputFileName = function(out, dir) {
  if (is.string(out)) {
    return out;
  }
  if (is.fn(out)) {
    return out(dir);
  } else {
    throw new Error('invalid output:' + out);
  }
}

function _parseOutput(out, dir) {
  var filename = _parseOutputFileName(out, dir),
    existing ;
  if (!/\.js$/.test(out)) {
    filename += '.js';
  }
  existing = fs.existsSync(path.join(dir, filename));
  return {
    filename: filename,
    existing: existing,
    path: path.join(dir, filename)
  }
}

function _parseModuleName(name) {
  name = name.replace(/[^a-zA-Z0-9][a-z]?/g, function(w) {
    if (w.length === 1) {
      return '';
    }
    return w[1].toUpperCase();
  });
  return name.substr(0, 1).toUpperCase() + name.substr(1);
}

function _scanDir(rootPath, basePath, dirPath, callback, end) {
  builder.scanFiles(dirPath, function() {
    return false
  }, function(filePath, isDir, c) {
    var relativePath = filePath.substr(basePath.length + 1).replace(/[\\]/g, '/'),
      rootRelativePath = filePath.substr(rootPath.length + 1).replace(/[\\]/g, '/');
    callback(rootRelativePath, relativePath, filePath, isDir, c);
  }, function() {
    end();
  });
}

function _buildModule(rootPath, basePath, dirPath, output, includes, excludes, end) {
  var modules = [];
  _scanDir(rootPath, basePath, dirPath, function(rootRelativePath, relativePath, absPath, isDir, c) {
    var moduleName, reqPath;
    if (!isDir) {
      if (checkReg(rootRelativePath, includes, excludes)) {
        moduleName = _parseModuleName(relativePath.replace(/[/]/g, '_').replace(/\.[^\.]*$/, ''));
        reqPath = './' + relativePath.replace(/\.[^\.]*$/, '');
      }
    } else {
      var fp = _parseOutput(output, absPath);
      if (checkReg(fp.path.replace(/[\\]/g, '/'), includes, excludes)) {
        moduleName = _parseModuleName(relativePath.replace(/[/]/g, '_').replace(/\.[^\.]*$/, ''));
        reqPath = './' + relativePath;
        if (fp.filename !== 'index.js') {
          reqPath += '/' + fp.filename;
        }
      }
    }
    if (moduleName && reqPath) {
      modules.push({
        name: moduleName,
        reqpath: reqPath
      })
    }
    c();
  }, function() {
    end(modules);
  });
}

builder.buildModule = function(option) {
  var tpl = option.tpl || '',
    output = option.out || 'index',
    includes = (option.includes || []).concat([/\.js$/]),
    excludes = (option.excludes || []).concat([]);
  return through.obj(function(dir, e, c) {
    var _build = function(_path, out, c) {
      if ((out.existing && fs.readFileSync(out.path, 'utf-8').indexOf(builder._MODULE_GENERATOR) !== 0)
        || !checkReg(out.path.substr(dir.path.length + 1).replace(/[\\]/g, '/'), includes, excludes)) {
        c();
        return;
      }

      var _excludes = excludes;
      if (out.existing) {
        _excludes = _excludes.concat('^' + out.path.substr(dir.path.length + 1).replace(/[\\]/g, '/').replace('\.', '\\.') + '$')
      }
      _buildModule(dir.path, _path, _path, output, includes, _excludes,
        function(modules) {
          var _file = new gutil.File({
            base: dir.path,
            path: out.path,
            contents: new Buffer(
              builder._MODULE_GENERATOR + '\n' + ejs.render(tpl, {
                modules: modules,
                path: out.path.substr(dir.path.length).replace(/\\/g, '/').replace(/\/[^/]+$/, '')
              }))
          });
          gutil.log('build module: ' + _file.path + '\n' + _file.contents);
          this.push(_file);

          builder.scanFiles(_path, function() {
            return false
          }, function(filePath, isDir, c) {
            if (isDir) {
              _build(filePath, _parseOutput(output, filePath), c);
            } else {
              c();
            }
          }, c);
        }.bind(this));
    }.bind(this);
    _build(dir.path, _parseOutput(output, dir.path), c);
  });
}

builder.buildTemplate = function() {
  return through.obj(function(dir, e, c) {
    builder.scanFiles(dir.path, function() {
      return true
    }, function(filePath, isDir, c) {
      if (!isDir && /\.html$/.test(filePath)) {
        var content = html2js(fs.readFileSync(filePath, 'utf-8').toString(), {
            mode: 'compress',
            wrap: 'commonjs'
          }),
          f = new gutil.File({
            base: dir.path,
            path: filePath + '.js',
            contents: new Buffer(content)
          });
        gutil.log(f.base + '   ' + f.path + ' : ' + f.contents)
        this.push(f);
      }
      c();
    }.bind(this), function() {
      c();
    });
  });
}

function _buildDoc(rootPath, basePath, dirPath, includes, excludes, end) {
  var modules = [],
    relativePath = dirPath.substr(basePath.length + 1).replace(/[\\]/g, '/'),
    rootRelativePath = dirPath.substr(rootPath.length + 1).replace(/[\\]/g, '/');
  if (!checkReg(rootRelativePath, includes, excludes)) {
    builder.scanFiles(dirPath, function() {
      return false
    }, function(filePath, isDir, c) {
      if (isDir) {
        _buildDoc(rootPath, basePath, filePath, includes, excludes, function(ms) {
          modules = modules.concat(ms);
          c();
        });
      } else {
        c();
      }
    }, function() {
      end(modules);
    });
  } else {
    var module = {
      name: _parseModuleName(relativePath.replace(/\/doc/, '')),
      demos: {},
      readmes: {}
    };
    modules.push(module);
    builder.scanFiles(dirPath, function() {
      return false
    }, function(filePath, isDir, c) {
      if (!isDir) {
        var fileName = filePath.replace(/.*[\\/]/g, '').replace(/\.[^\.]*$/, ''),
          name = _parseModuleName(fileName);
        if (/\.md$/.test(filePath)) {
          module.readmes[name] = fs.readFileSync(filePath, 'utf-8').toString();
        } else if (/\.jsx?$/.test(filePath)) {
          module.demos[name] = {
            path: './' + relativePath + '/' + fileName,
            content: fs.readFileSync(filePath, 'utf-8').toString()
          }
        }
      }
      c();
    }, function() {
      end(modules);
    });
  }
}


builder.buildDoc = function(option) {
  var tpl = option.tpl || '',
    output = option.out || 'doc',
    includes = (option.includes || []),
    excludes = (option.excludes || []);
  return through.obj(function(dir, e, c) {
    var out = _parseOutput(output, dir.path);
    if (out.existing && fs.readFileSync(out.path, 'utf-8').indexOf(builder._MODULE_GENERATOR) !== 0) {
      return;
    }
    _buildDoc(dir.path, dir.path, dir.path, includes, excludes,
      function(modules) {
        var _file = new gutil.File({
          base: dir.path,
          path: out.path,
          contents: new Buffer(
            builder._MODULE_GENERATOR + '\n' + ejs.render(tpl, {
              modules: modules,
              path: out.path.substr(dir.path.length).replace(/\\/g, '/').replace(/\/[^/]+$/, '')
            }))
        });
        gutil.log('build module: ' + _file.path + '\n' + _file.contents)
        this.push(_file);
        c();
      }.bind(this));
  });
}
module.exports = builder;
