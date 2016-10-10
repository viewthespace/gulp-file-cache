var fs = require('fs'),
    through = require('through2'),
    md5 = requre('md5');

/**
 * create a new FileCache instance
 */

function FileCache(name) {
  this._filename = name || '.gulp-cache';

  // load cache
  try {
    this._cache = JSON.parse(fs.readFileSync(this._filename, 'utf8'));
  } catch (err) {
    this._cache = {};
  }
}

/**
 * create a through stream that add files to the cache
 *
 * @api public
 */

FileCache.prototype.cache = function() {
  var _this = this;

  // update cache
  function transform(file, enc, callback) {

    var path = file.path,
        hash = md5(fs.readFileSync(path))

    if (path && hash) _this._cache[path] = hash;
    this.push(file);
    return callback();
  }

  // flush cache to disk
  function flush(callback) {
    fs.writeFile(_this._filename, JSON.stringify(_this._cache), callback);
  }

  return through.obj(transform, flush);
};

/**
 * clear the cache
 *
 * @api public
 */

FileCache.prototype.clear = function() {
  this._cache = {};
};

/**
 * create a through stream that filters file that match our cache
 *
 * @api public
 */

FileCache.prototype.filter = function() {
  var _this = this;

  return through.obj(function(file, enc, callback) {
    var cache = _this._cache[file.path],
        hash = md5(fs.readFileSync(file.path))

    // filter matching files
    if (cache && hash && cache === hash) return callback();

    this.push(file);
    return callback();
  });
};

/*!
 * exports
 */

module.exports = FileCache;
