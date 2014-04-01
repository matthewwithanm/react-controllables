gulp = require 'gulp'
gutil = require 'gulp-util'
coffee = require 'gulp-coffee'
browserify = require 'gulp-browserify'
rename = require 'gulp-rename'
connect = require 'gulp-connect'
gbump = require 'gulp-bump'


gulp.task 'watch', ->
  gulp.watch './src/**/*', ['build']
  gulp.watch './test/**/*', ['build:tests']

bump = (type) ->
  gulp.src ['./bower.json', './package.json']
    .pipe gbump {type}
    .pipe gulp.dest './'

gulp.task 'bump:major', -> bump 'major'
gulp.task 'bump:minor', -> bump 'minor'
gulp.task 'bump:patch', -> bump 'patch'

gulp.task 'build:node', ->
  gulp.src './src/*.?(lit)coffee'
    .pipe coffee(bare: true).on('error', gutil.log)
    .pipe gulp.dest('./lib')

gulp.task 'build:browser', ['build:node'], ->
  gulp.src './lib/*.js'
    .pipe browserify
      standalone: 'ControllablesMixin'
      transform: ['browserify-shim']
    .pipe rename('react-controllables.js')
    .pipe gulp.dest('./standalone/')

gulp.task 'build:tests', ->
  gulp.src './test/**/*.?(lit)coffee'
    .pipe coffee().on('error', gutil.log)
    .pipe browserify
      transform: ['browserify-shim']
    .pipe gulp.dest('./test/')

# A server for the test page
gulp.task 'testserver', connect.server
  root: [__dirname]
  port: 1337
  open:
    file: 'test/index.html'
    browser: 'Google Chrome'

gulp.task 'test', ['build:browser', 'build:tests', 'testserver']
gulp.task 'build', ['build:node', 'build:browser']
