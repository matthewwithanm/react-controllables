import gulp from 'gulp';
import gutil from 'gulp-util';
import babel from 'gulp-babel';
import browserify from 'gulp-browserify';
import rename from 'gulp-rename';
import connect from 'gulp-connect';
import gbump from 'gulp-bump';


gulp.task('watch', function() {
  gulp.watch('./src/**/*', ['build']);
  gulp.watch('./test/**/*', ['build:tests']);
});

function bump(type) {
  gulp.src(['./bower.json', './package.json'])
    .pipe(gbump({type}))
    .pipe(gulp.dest('./'));
}

gulp.task('bump:major', () => { bump('major'); });
gulp.task('bump:minor', () => { bump('minor'); });
gulp.task('bump:patch', () => { bump('patch'); });

gulp.task('build:node', () => {
  gulp.src('./src/*.js')
    .pipe(babel().on('error', gutil.log))
    .pipe(gulp.dest('./lib', {overwrite: true}));
});

gulp.task('build:browser', ['build:node'], () => {
  gulp.src('./lib/standalone.js')
    .pipe(browserify({
      standalone: 'Controllables',
      transform: ['browserify-shim'],
    }))
    .pipe(rename('react-controllables.js'))
    .pipe(gulp.dest('./standalone/', {overwrite: true}));
});

gulp.task('build:tests', () => {
  gulp.src(['./test/tests**.js', '!**/*-compiled.js'])
    .pipe(babel().on('error', gutil.log))
    .pipe(browserify({
      transform: ['browserify-shim'],
    }))
    .pipe(rename({suffix: '-compiled'}))
    .pipe(gulp.dest('./test/', {overwrite: true}));
});

gulp.task('testserver', connect.server({
  root: [__dirname],
  port: 1337,
  open: {
    file: 'test/index.html',
    browser: 'Google Chrome',
  },
}));

gulp.task('test', ['build:browser', 'build:tests', 'testserver']);

gulp.task('build', ['build:node', 'build:browser']);
