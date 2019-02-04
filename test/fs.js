'use strict';

const metatests = require('metatests');
const fs = require('fs');
const metasync = require('metasync');
const common = require('..');
const stream = require('stream');
const path = require('path');
const { mkdirp, rmdirp } = require('..');

const testMkdirp = metatests.test('mkdir');
const mkdirpTestDir = 'test/ex1/ex2';
const RMDIRP_TEST_DIR = 'tstDir';

const removeUsedDirs = (test, cb) => {
  fs.rmdir(mkdirpTestDir, err => {
    if (err && err.code !== 'ENOENT') test.error(err);
    fs.rmdir(path.dirname(mkdirpTestDir), err => {
      if (err && err.code !== 'ENOENT') test.error(err);
      cb();
    });
  });
};

testMkdirp.beforeEach(removeUsedDirs);
testMkdirp.afterEach(removeUsedDirs);

testMkdirp.test('create 2 directories using mode', test => {
  mkdirp(mkdirpTestDir, 0o777, err => {
    test.error(err, 'Cannot create directory');
    test.end();
  });
});

testMkdirp.test('create 2 directories without mode', test => {
  mkdirp(mkdirpTestDir, err => {
    test.error(err, 'Cannot create directory');
    test.end();
  });
});

metatests.test('rmdirp test', test =>
  fs.mkdir(RMDIRP_TEST_DIR, err => {
    if (err && err.code !== 'EEXISTS') {
      test.bailout(err);
    }
    fs.mkdir(path.join(RMDIRP_TEST_DIR, 'subdir1'), err => {
      if (err && err.code !== 'EEXISTS') {
        test.bailout(err);
      }
      rmdirp(path.join(RMDIRP_TEST_DIR, 'subdir1'), err => {
        if (err) {
          test.bailout(err);
        }
        fs.access(RMDIRP_TEST_DIR, err => {
          test.isError(err);
          test.end();
        });
      });
    });
  })
);

const testData =
  'JySAF1figbONWxAeeoGhDXeI7df25GKXKPcyCl63ZjIv5HZGQH8yfFeHGGaSJ9zDMP0CwtgX2madIQkFmuq38SNhcKcGQ';
const absoluteLink = __dirname + '/lDir';
const srcFiles = [
  'test/srcDir',
  'test/srcDir/dir1',
  'test/srcDir/dir2',
  'test/srcDir/file1',
  'test/srcDir/link',
  'test/srcDir/dir1/subdir1',
  'test/lDir',
  'test/lDir/file1',
  'test/lDir/file2',
];

const dstFiles = [
  'test/dstDir',
  'test/dstDir/dir1',
  'test/dstDir/dir2',
  'test/dstDir/file1',
  'test/dstDir/link',
  'test/dstDir/dir1/subdir1',
];

class ToUpperCase extends stream.Transform {
  constructor(options = {}) {
    options.decodeStrings = false;
    super(options);
  }
  _transform(chunk, encoding, callback) {
    if (encoding === 'utf8') callback(null, chunk.toUpperCase());
    else callback(new Error('Only utf8 is supported'));
  }
}

const transOptions = {
  Transform: ToUpperCase,
  readOptions: { encoding: 'utf-8' },
  writeOptions: {},
};

const rmdir = (dir, cb) => {
  fs.lstat(dir, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') cb(null);
      else cb(err);
      return;
    }
    if (stats.isDirectory()) {
      fs.readdir(dir, (err, files) => {
        if (err) {
          cb(err);
          return;
        }
        files = files.map(file => path.join(dir, file));
        metasync.each(files, rmdir, err => {
          if (err) cb(err);
          else fs.rmdir(dir, cb);
        });
      });
    } else {
      fs.unlink(dir, cb);
    }
  });
};

const copydirTest = metatests.test('Recursive dir copy');
copydirTest.endAfterSubtests();

copydirTest.beforeEach((test, cb) => {
  metasync.series(
    srcFiles,
    (file, cb) => {
      if (path.basename(file).startsWith('file')) {
        fs.appendFile(file, testData, cb);
      } else if (path.basename(file).startsWith('link')) {
        fs.symlink(absoluteLink, file, cb);
      } else {
        fs.mkdir(file, cb);
      }
    },
    test.cb(cb)
  );
});

copydirTest.afterEach((test, cb) => {
  rmdir(dstFiles[0], err => {
    if (err) test.error(err);
    rmdir(srcFiles[0], err => {
      if (err) test.error(err);
      rmdir('test/lDir', test.cb(cb));
    });
  });
});

copydirTest.test('copy', test => {
  common.copyDir(srcFiles[0], dstFiles[0], err => {
    if (err) {
      test.error(err);
      test.end();
      return;
    }
    metasync.each(
      dstFiles,
      (file, cb) => {
        const fileName = path.basename(file);
        if (fileName.startsWith('file')) {
          fs.readFile(file, 'utf-8', (err, data) => {
            test.strictSame(data, testData);
            cb(err);
          });
        } else {
          fs.access(file, cb);
        }
      },
      test.cb(() => test.end())
    );
  });
});

copydirTest.test('dereference', test => {
  common.copyDir(srcFiles[0], dstFiles[0], { dereference: true }, err => {
    if (err) {
      test.error(err);
      test.end();
      return;
    }
    metasync.each(
      common.merge(dstFiles, [
        'test/dstDir/link/file1',
        'test/dstDir/link/file2',
      ]),
      (file, cb) => {
        const fileName = path.basename(file);
        if (fileName.startsWith('file')) {
          fs.readFile(file, 'utf-8', (err, data) => {
            test.strictSame(data, testData);
            cb(err);
          });
        } else {
          fs.access(file, cb);
        }
      },
      test.cb(() => test.end())
    );
  });
});

copydirTest.test('transform', test => {
  common.copyDir(srcFiles[0], dstFiles[0], transOptions, err => {
    if (err) {
      test.error(err);
      test.end();
      return;
    }
    metasync.each(
      dstFiles,
      (file, cb) => {
        const fileName = path.basename(file);
        if (fileName.startsWith('file')) {
          fs.readFile(file, 'utf-8', (err, data) => {
            test.strictSame(data, testData.toUpperCase());
            cb(err);
          });
        } else {
          fs.access(file, cb);
        }
      },
      test.cb(() => test.end())
    );
  });
});

copydirTest.test('filter', test => {
  common.copyDir(srcFiles[0], dstFiles[0], { filter: /file/ }, err => {
    if (err) {
      test.error(err);
      test.end();
      return;
    }
    metasync.each(
      common.merge(dstFiles.slice(0, 3), dstFiles.slice(-2)),
      (file, cb) => {
        const fileName = path.basename(file);
        if (fileName.startsWith('file')) {
          fs.readFile(file, 'utf-8', (err, data) => {
            test.strictSame(data, testData);
            cb(err);
          });
        } else {
          fs.access(file, cb);
        }
      },
      test.cb(() => test.end())
    );
  });
});

copydirTest.test('depth more than expected', test => {
  common.copyDir(srcFiles[0], dstFiles[0], { depth: 100 }, err => {
    if (err) {
      test.error(err);
      test.end();
      return;
    }
    metasync.each(
      dstFiles,
      (file, cb) => {
        const fileName = path.basename(file);
        if (fileName.startsWith('file')) {
          fs.readFile(file, 'utf-8', (err, data) => {
            test.strictSame(data, testData);
            cb(err);
          });
        } else {
          fs.access(file, cb);
        }
      },
      test.cb(() => test.end())
    );
  });
});

copydirTest.test('depth less than expected', test => {
  common.copyDir(srcFiles[0], dstFiles[0], { depth: 2 }, err => {
    if (err) {
      test.error(err);
      test.end();
      return;
    }
    metasync.each(
      dstFiles.slice(0, 5),
      (file, cb) => {
        const fileName = path.basename(file);
        if (fileName.startsWith('file')) {
          fs.readFile(file, 'utf-8', (err, data) => {
            test.strictSame(data, testData);
            cb(err);
          });
        } else {
          fs.access(file, cb);
        }
      },
      test.cb(() => test.end())
    );
  });
});
