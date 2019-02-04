'use strict';

const fs = require('fs');
const path = require('path');
const MKDIRP_DEFAULT_MODE = 0o777;

const mkdir = (dir, mode, cb) => {
  fs.access(dir, fs.constants.F_OK, err => {
    if (err && err.code === 'ENOENT') {
      mkdir(path.dirname(dir), mode, err => {
        if (err) cb(err);
        else fs.mkdir(dir, mode, cb);
      });
    } else {
      cb(err);
    }
  });
};

const recursivelyListDirs = dir => {
  const list = [dir];
  let nextDir = dir;
  const root = path.parse(dir).root || '.';
  while ((nextDir = path.dirname(nextDir)) !== root) list.push(nextDir);
  return list;
};

const rmdirp = (dir, cb) => {
  const dirs = recursivelyListDirs(dir);
  let i = 0;
  rmNextDir();
  function rmNextDir() {
    fs.rmdir(dirs[i], err => {
      if (err) {
        cb(err);
        return;
      }
      if (++i === dirs.length) {
        cb();
      } else {
        rmNextDir();
      }
    });
  }
};

let mkdirp;
const version = process.versions.node.split('.').map(el => parseInt(el));
if (version[0] < 10 || (version[0] === 10 && version[1] <= 11)) {
  mkdirp = (dir, mode, cb) => {
    if (typeof mode === 'function') {
      cb = mode;
      mode = MKDIRP_DEFAULT_MODE;
    }
    mkdir(dir, mode, cb);
  };
} else {
  mkdirp = (dir, mode, cb) => {
    typeof mode === 'function'
      ? fs.mkdir(dir, { recursive: true }, mode)
      : fs.mkdir(dir, { recursive: true, mode }, cb);
  };
}

const metasync = require('metasync');

const error = (err, options, cb) => {
  if (options.errorLog) options.errorLog.write(err.stack);
  cb(err);
};

const cpDir = (src, dest, options, curDepth, cb) => {
  if (curDepth > options.depth) {
    cb();
    return;
  }
  fs.mkdir(dest, err => {
    if (err !== null && err.code !== 'EEXIST') {
      error(err, options, cb);
      return;
    }
    fs.readdir(src, (err, files) => {
      if (err) {
        error(err, options, cb);
        return;
      }
      metasync.each(
        files,
        (file, cb) => {
          if (
            (options.filter instanceof RegExp && options.filter.test(file)) ||
            (typeof options.filter === 'function' && options.filter(file))
          ) {
            cb();
            return;
          }
          const srcFile = path.join(src, file);
          fs.lstat(srcFile, (err, stats) => {
            if (err) {
              error(err, options, cb);
              return;
            }
            const destFile = path.join(dest, file);
            if (stats.isDirectory()) {
              cpDir(srcFile, destFile, options, curDepth + 1, cb);
            } else if (stats.isFile()) {
              if (options.Transform) {
                const read = fs.createReadStream(srcFile, options.readOptions);
                const write = fs.createWriteStream(
                  destFile,
                  options.writeOptions
                );
                read.pipe(new options.Transform()).pipe(write);
                read.on('error', cb);
                write.on('error', cb).on('close', cb);
              } else {
                fs.copyFile(srcFile, destFile, cb);
              }
            } else if (stats.isSymbolicLink()) {
              if (options.dereference) {
                fs.readlink(srcFile, (err, link) => {
                  if (err) {
                    error(err, options, cb);
                    return;
                  }
                  cpDir(
                    path.resolve(path.dirname(srcFile), link),
                    destFile,
                    options,
                    curDepth + 1,
                    cb
                  );
                });
              } else {
                fs.readlink(srcFile, (err, link) => {
                  if (err) {
                    error(err, options, cb);
                    return;
                  }
                  fs.symlink(link, destFile, cb);
                });
              }
            }
          });
        },
        cb
      );
    });
  });
};

const copyDir = (src, dest, options, cb) => {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  cpDir(src, dest, options, 1, cb);
};

module.exports = {
  copyDir,
  mkdirp,
  rmdirp,
};
