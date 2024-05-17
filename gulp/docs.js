const gulp = require('gulp');

// HTML
const fileInclude = require('gulp-file-include');
const htmlclean = require('gulp-htmlclean');

// SASS
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
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



gulp.task('clean:docs', function (done)
{
    if (fs.existsSync('./docs/'))
    {
        return gulp.src('./docs/', {read: false})
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

gulp.task('html:docs', function ()
{
    return gulp.src(['./src/html/**/*.html','!./src/html/components/*.html'])
        .pipe(changed('./docs/'))
        .pipe(plumber(plumberNotify('HTML')))
        .pipe(fileInclude(fileIncludeSettings))
        .pipe(htmlclean())
        .pipe(gulp.dest('./docs/'));
})

gulp.task('sass:docs', function ()
{
    return gulp.src('./src/scss/*.scss')
        .pipe(changed('./docs/css/'))
        .pipe(plumber(plumberNotify('Styles')))
        .pipe(sourceMaps.init())
        .pipe(autoprefixer())
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(csso())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('./docs/css'))
})

gulp.task('img:docs', function ()
{
    return gulp.src('./src/img/**/*')
        .pipe(changed('./docs/img'))
        .pipe(imagemin({verbose: true}))
        .pipe(gulp.dest('./docs/img'))
})

const serverOptions = {
    livereload: true, open: true
};

gulp.task('js:docs', function ()
{
    return gulp.src('./src/js/*.js')
        .pipe(changed('./docs/js/'))
        .pipe(plumber(plumberNotify('JS')))
        .pipe(babel())
        .pipe(webpack(require('./../webpack.config')))
        .pipe(gulp.dest('./docs/js'))
})

gulp.task('server:docs', function ()
{
    return gulp.src('./docs/')
        .pipe(server(serverOptions))
})