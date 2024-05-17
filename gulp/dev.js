const gulp = require('gulp');

// HTML
const fileInclude = require('gulp-file-include');

// SASS
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const sourceMaps = require('gulp-sourcemaps');

const server = require('gulp-server-livereload');
const clean = require('gulp-clean');
const fs = require('fs');

const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const webpack = require('webpack-stream');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');


gulp.task('clean:dev', function (done)
{
    if (fs.existsSync('./build/'))
    {
        return gulp.src('./build/', {read: false})
            .pipe(clean({force: true}));
    }
    done();
})

const fileIncludeSettings = {
    prefix: '@@', basepath: '@file',
};

const plumberNotify = (title) =>
{
    return {
        errorHandler: notify.onError({
            title: title, message: 'Error <%= error.message %>', sound: false
        })
    }
}

gulp.task('html:dev', function ()
{
    return gulp.src(['./src/html/**/*.html', '!./src/html/components/*.html'])
        .pipe(changed('./build/', {hasChanged: changed.compareContents}))
        .pipe(plumber(plumberNotify('HTML')))
        //.pipe(rigger(fileIncludeSettings))
        .pipe(fileInclude(fileIncludeSettings))
        .pipe(gulp.dest('./build/'));
})

gulp.task('sass:dev', function ()
{
    return gulp.src('./src/scss/*.scss')
        .pipe(changed('./build/css/'))
        .pipe(plumber(plumberNotify('Styles')))
        .pipe(sourceMaps.init())
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('./build/css'))
})

gulp.task('img:dev', function ()
{
    return gulp.src('./src/img/**/*', {encoding: false})
        .pipe(changed('./build/img'))
        .pipe(imagemin({verbose: true}))
        .pipe(gulp.dest('./build/img'))
});

const serverOptions = {
    livereload: true, open: true
};

gulp.task('js:dev', function ()
{
    return gulp.src('./src/js/*.js')
        .pipe(changed('./build/js/'))
        .pipe(plumber(plumberNotify('JS')))
        //.pipe(babel())
        .pipe(webpack(require('./../webpack.config')))
        .pipe(gulp.dest('./build/js'))
})

gulp.task('server:dev', function ()
{
    return gulp.src('./build/')
        .pipe(server(serverOptions))
})

gulp.task('watch:dev', function ()
{
    gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass:dev'));
    gulp.watch('./src/html/**/*.html', gulp.parallel('html:dev'));
    gulp.watch('./src/img/**/*', gulp.parallel('img:dev'));
    gulp.watch('./src/js/**/*.js', gulp.parallel('js:dev'));
})