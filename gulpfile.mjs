import gulp from 'gulp';
import * as del from 'del';
import pug from 'pug';
import es from 'event-stream';
import rename from 'gulp-rename';
import gulpSass from 'gulp-sass';
import * as sassCompiler from 'sass';
import autoprefixer from "autoprefixer";
import postcss from 'gulp-postcss';
import imageMin from 'gulp-imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';
import cleanCSS from 'gulp-clean-css';
import gulpPlumber from 'gulp-plumber';
import sourcemaps from 'gulp-sourcemaps';
import connect from 'gulp-connect';
import {fileURLToPath} from "url";
const sass = gulpSass(sassCompiler);

const bucketNameForProd = 'tutor-events';
const bucketNameForTest = 'tutor-test-events';
const projectIdTest = 'tutor-test-238709';
const projectIdProd = 'tutor-204108';
const keyFilenameTest = 'tutor-test.json';
const keyFilenameProd = 'tutor.json';

const projectName = 'event/line';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist/')

const gcsTestOptions = {
    projectId: projectIdTest,
    bucket: bucketNameForTest,
    keyFilename: keyFilenameTest,
    cacheControl: 'no-store, no-transform'
};

const gcsProdOptions = {
    projectId: projectIdProd,
    bucket: bucketNameForProd,
    keyFilename: keyFilenameProd,
    cacheControl: 'no-store, no-transform'
};

const clean = () => {
    return del.deleteAsync(['./build', './dist']);
}

function buildHtml() {
    return es.map(async function (file, cb) {
        file.contents = Buffer.from(pug.renderFile(
            file.path, {
                filename: file.path,
                pretty: true
            }
        ));
        cb(null, file);
    });
}

async function htmlTask() {
    return await new Promise(async (resolve) => {
        gulp.src('src/pug/**/*.pug')
            .pipe(await buildHtml())
            .pipe(rename({
                extname: '.html'
            }))
            .pipe(gulp.dest('build'))
            .on('end', resolve);
    });
}

async function styleTask() {
    console.log('--- style task---');
    let processors = [
        autoprefixer({ grid: true, overrideBrowserslist: ['last 2 version', 'ie 11', '>1%'] })
    ];
    await gulp.src('src/sass/**/*.sass')
        .pipe(gulpPlumber())
        .pipe(sass())
        .pipe(postcss(processors))
        .pipe(cleanCSS({
            compatibility: 'ie11',
        }))
        .pipe(rename({
            extname: '.css'
        }))
        .pipe(gulp.dest('build/css'));
}

async function copyStaticFromSrcToBuild() {
    return new Promise(async(resolve) => {
        console.log(`--- copy form src to build ---`);
        await gulp.src(['src/js/**', 'src/img/**'], {
            base: 'src'
        })
            .pipe(gulp.dest('build'))
            .on('end', resolve)
    })
}

async function copyStaticFromBuildToDist() {
    return new Promise(async(resolve) => {
        console.log(`--- copy form build to dist ---`);
        await gulp.src(['build/**.html', 'build/css/**', 'build/img/**'], {
            base: 'build'
        })
            .pipe(gulp.dest('dist'))
            .on('end', resolve)
    })
}

async function uglifyJs(){
    return new Promise(async (resolve) => {
        console.log("--- uglify js ---");
        await gulp.src(["./build/js/**/*.js"],
            {
                base: './build'
            })
            .pipe(sourcemaps.init())
            .pipe(rename(function(path) {
                path.extname = ".js";
            }))
            .pipe(gulp.dest('./dist'))
            .on('end', resolve)
    })
}


async function minifyImg(){
    return await new Promise(async(resolve) => {
        await gulp.src([`./build/img/**/*`],
            {
                base: `./build`
            })
            .pipe(imageMin([
                imageminPngquant([{quality: '65-80'}]),
                imageMin.gifsicle({interlaced: true}),
                imageMin.mozjpeg({quality: 65, progressive: true}),
                imageminSvgo ({
                    plugins: [
                        {removeViewBox: false},
                        {cleanupIDs: false}
                    ]
                })
            ], {
                verbose: true
            }))
            .pipe(gulp.dest(`./dist/`))
            .on('end', resolve)
    })
}

const uploadToGCS = async (gcsOptions) => {
    let storage = new Storage({
        projectId: gcsOptions.projectId,
        keyFilename: gcsOptions.keyFilename
    })
    const multiDistEntireFilePath = await findAllUploadFilesPath(distDir);
    multiDistEntireFilePath.forEach(distEntireFilePath => {
        storage.bucket(gcsOptions.bucket)
            .upload(distEntireFilePath,
                {
                    destination: `${projectName}/${distEntireFilePath.replace(distDir, '')}`,
                    metadata: {
                        cacheControl: gcsOptions.cacheControl,
                    },
                    public: true
                },
                (err, file) => {
                    console.log(`Upload ${file.name} successfully`)
                }
            )
    })
}

const findAllUploadFilesPath = async (dir, multiDistEntireFilePath = []) => {
    try {
        const files = await fs.promises.readdir(dir);
        for (const file of files) {
            const entireFilepath = path.join(dir, file);
            const stats = await fs.promises.stat(entireFilepath);
            if (stats.isDirectory()) {
                await findAllUploadFilesPath(entireFilepath, multiDistEntireFilePath);
            } else {
                multiDistEntireFilePath.push(entireFilepath);
            }
        }
    } catch (err) {
        console.error("An error occurred:", err);
    }
    return multiDistEntireFilePath;
};

async function watchFiles() {
    gulp.watch("./src/sass/*.sass", gulp.series(styleTask))
        .on("all", (event, path) => {
            console.log(event);
            console.log(path);
        });
    gulp.watch("./src/pug/*.pug", gulp.series(htmlTask))
        .on("all", (event, path) => {
            console.log(event);
            console.log(path);
        });
}

async function connectLiveServer(){
    connect.server({
        root: './build',
        port: 9000,
        livereload: true
    })
}

gulp.task('clean', clean);
gulp.task('build', gulp.series(
gulp.parallel(htmlTask, styleTask),
    copyStaticFromSrcToBuild
));
gulp.task('package', gulp.series(
    clean,
    'build',
    uglifyJs,
    copyStaticFromBuildToDist,
    minifyImg
));
gulp.task('uploadGcsTest', gulp.series(
    'package',
    uploadToGCS.bind(uploadToGCS, gcsTestOptions)
));
gulp.task('uploadGcsProd', gulp.series(
    'package',
    uploadToGCS.bind(uploadToGCS, gcsProdOptions)
));
gulp.task('watch', gulp.parallel(watchFiles));
gulp.task('dev', gulp.series(
    'build',
    connectLiveServer,
    'watch'
));
