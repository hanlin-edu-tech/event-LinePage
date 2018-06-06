var gulp = require('gulp');  
var rename = require("gulp-rename");
var fs = require('fs');
var es = require('event-stream');
var del = require('del');
var path = require('path');
var Q = require('q');
var util = require('gulp-template-util');
var pug = require('pug');
var gulpSass = require('gulp-sass');

function buildHtml(){
    return es.map(function(file, cb){
        file.contents = new Buffer(pug.renderFile(
            file.path, { 
                filename : file.path,
                pretty : "    "
            }
        ));
        cb(null, file);
    });
}

function htmlTask(dest){
  return function(){
      return gulp.src('src/pug/**/*.pug')
          .pipe(buildHtml())
          .pipe(rename({extname:'.html'}))
          .pipe(gulp.dest(dest));};    
}

function libTask(dest) {
    return function() {
        var packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8').toString());
        if (!packageJson.dependencies) {
            packageJson.dependencies = {};
        }
        var webLibModules = [];
        for (var module in packageJson.dependencies) {
            webLibModules.push('node_modules/' + module + '/**/*');
        }
        return gulp.src(webLibModules, {base: 'node_modules/'})
                .pipe(gulp.dest(dest));
    };
}

function styleTask(dest){
  return function(){
      return gulp.src('src/sass/**/*.sass')
          .pipe(gulpSass())
          .pipe(rename({extname:'.css'}))
          .pipe(gulp.dest(dest));};    
}

function copyStaticTask(dest) {
    return function() {
        return gulp.src(['src/*.html', 'src/img/**', 'src/js/**'], {base: "src"})
            .pipe(gulp.dest(dest));
    };
}

function cleanTask() {
    return del([
        'src/css',
        'src/*.html'
    ]);
}

gulp.task('clean', cleanTask);
gulp.task('lib', libTask('src/lib'));
gulp.task('style', styleTask('src/css'));
gulp.task('html', htmlTask('src'));
gulp.task('build', ['style', 'html']);
gulp.task('default', ['build']);
gulp.task('watch', function() {
  gulp.watch('src/pug/**/*.pug', ['html']);
  gulp.watch('src/sass/**/*.sass', ['style']);
});

gulp.task('package', function() {
    var deferred = Q.defer();
    Q.fcall(function() {
        return util.logPromise(cleanTask)
    }).then(function() {
        return Q.all([
            //util.logStream(libTask('dist/lib')),
            util.logStream(copyStaticTask('dist')),
            util.logStream(styleTask('dist/css')),
            util.logStream(htmlTask('dist'))
        ])
    });

    return deferred.promise;
});


