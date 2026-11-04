/**
 * Front-end build for version B (docs/PLAN-B.md §3.1).
 *
 *   gulp build   production: minified CSS/JS, no sourcemaps, hashed names + rev-manifest.json
 *   gulp dev     development: readable output with sourcemaps, then watch
 *   gulp clean   remove public/build
 *
 * Output (public/build, not versioned):
 *   css/app-[hash].css · js/app-[hash].js · fonts/*-[hash].woff2 · rev-manifest.json
 * PHP resolves the hashed names through App\Support\AssetManifest (Blade directive @asset).
 */
import { readFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { deleteAsync } from 'del';
import gulp from 'gulp';
import concat from 'gulp-concat';
import postcss from 'gulp-postcss';
import rev from 'gulp-rev';
import revRewrite from 'gulp-rev-rewrite';
import terser from 'gulp-terser';
import stylus from 'stylus';
import through from 'through2';
import applySourceMap from 'vinyl-sourcemaps-apply';

const { dest, series, src, watch } = gulp;

const OUT = 'public/build';
const MANIFEST = `${OUT}/rev-manifest.json`;

/** JS bundle order replaces imports: vendor → pure lib → modules (config first) → entry point. */
const SCRIPTS = [
  'node_modules/jquery/dist/jquery.js',
  'resources/js/lib/**/*.js',
  'resources/js/modules/config.js',
  'resources/js/modules/**/*.js',
  'resources/js/main.js',
];

/** Latin subset only (the one version-a preloads); other subsets are not shipped. */
const FONTS = [
  'node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2',
  'node_modules/@fontsource-variable/noto-sans/files/noto-sans-latin-wght-normal.woff2',
];

let production = true;
const development = (done) => {
  production = false;
  done();
};

/**
 * Minimal Stylus plugin over the stylus API. gulp-stylus is not used: it pins stylus ^0.59
 * and has not been released since 2023 (docs/ASSUMPTIONS.md B7).
 */
function compileStylus() {
  return through.obj((file, _encoding, callback) => {
    if (file.isNull()) return callback(null, file);

    const style = stylus(file.contents.toString(), {
      filename: file.path,
      paths: [dirname(file.path)],
    });
    if (file.sourceMap) style.set('sourcemap', { comment: false, basePath: file.base });

    style.render((error, css) => {
      if (error) return callback(error);
      file.contents = Buffer.from(css);
      file.extname = '.css';
      if (file.sourceMap && style.sourcemap) {
        // Stylus emits absolute (on Windows, "//?/C:/…") source paths: make them relative to the
        // source root so no local path ends up in the map.
        const sources = style.sourcemap.sources.map((source) =>
          relative(file.base, source.replace(/^\/\/\?\//, '')).replaceAll('\\', '/'),
        );
        applySourceMap(file, { ...style.sourcemap, sources, file: file.relative });
      }
      callback(null, file);
    });
  });
}

/**
 * Re-roots a file so that its path relative to the build root is `dir/name`. gulp-rev keys the
 * manifest by that relative path, so entries read "css/app.css" instead of "app.css".
 */
function placeIn(dir) {
  return through.obj((file, _encoding, callback) => {
    const root = join(file.cwd, OUT);
    file.base = root;
    file.path = join(root, dir, basename(file.path));
    callback(null, file);
  });
}

/** Adds the revisioned files of one stream to the shared manifest (merging with what is there). */
const manifest = () => rev.manifest(MANIFEST, { base: OUT, merge: true });

export const clean = () => deleteAsync([OUT]);

const cleanDir = (dir) => () => deleteAsync([`${OUT}/${dir}`]);

export function fonts() {
  return src(FONTS, { encoding: false })
    .pipe(placeIn('fonts'))
    .pipe(rev())
    .pipe(dest(OUT))
    .pipe(manifest())
    .pipe(dest(OUT));
}

export function scripts() {
  return src(SCRIPTS, { sourcemaps: !production, allowEmpty: true })
    .pipe(concat('app.js'))
    .pipe(production ? terser({ ecma: 2020, format: { comments: false } }) : through.obj())
    .pipe(placeIn('js'))
    .pipe(rev())
    .pipe(dest(OUT, { sourcemaps: production ? false : '.' }))
    .pipe(manifest())
    .pipe(dest(OUT));
}

export function styles() {
  const plugins = production ? [autoprefixer(), cssnano({ preset: 'default' })] : [autoprefixer()];
  return (
    src('resources/stylus/app.styl', { sourcemaps: !production })
      .pipe(compileStylus())
      .pipe(postcss(plugins))
      // Font URLs inside the CSS point to the hashed files (fonts() runs first).
      .pipe(revRewrite({ manifest: readFileSync(MANIFEST) }))
      .pipe(placeIn('css'))
      .pipe(rev())
      .pipe(dest(OUT, { sourcemaps: production ? false : '.' }))
      .pipe(manifest())
      .pipe(dest(OUT))
  );
}

// Sequential on purpose: every task merges into the same rev-manifest.json.
const all = series(clean, fonts, scripts, styles);

function watchSources() {
  watch('resources/stylus/**/*.styl', series(cleanDir('css'), styles));
  watch(['resources/js/**/*.js'], series(cleanDir('js'), scripts));
}

export const build = all;
export const dev = series(development, all, watchSources);
export default build;
