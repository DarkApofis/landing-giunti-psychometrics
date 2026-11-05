/**
 * Front-end build for version B (docs/PLAN-B.md §3.1).
 *
 *   gulp build   production: minified CSS/JS, no sourcemaps, hashed names + manifest
 *   gulp dev     development: readable output with sourcemaps, then watch
 *   gulp clean   remove everything this build writes
 *
 * Output (generated, not versioned):
 *   public/build/css/{app,styleguide}-[hash].css · public/build/js/app-[hash].js
 *   public/fonts/{figtree,noto-sans}-latin-wght-normal-[hash].woff2
 *   public/build/rev-manifest.json   { "css/app.css": "build/css/app-1a2b3c4d5e.css", "fonts/…": "fonts/…" }
 * Keys are logical names; values are paths relative to public/. PHP resolves them through
 * App\Support\AssetManifest (Blade directive @asset).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
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

const PUBLIC = 'public';
const MANIFEST = `${PUBLIC}/build/rev-manifest.json`;

/** Where each kind of asset is published, relative to public/. */
const TARGETS = { css: 'build/css', js: 'build/js', fonts: 'fonts' };

/** JS bundle order replaces imports: vendor → pure lib → modules (config first) → entry point. */
const SCRIPTS = [
  // jQuery 4 slim: no ajax, effects or Deferred, none of which version B uses (docs/ASSUMPTIONS.md B33).
  'node_modules/jquery/dist/jquery.slim.js',
  'resources/js/lib/**/*.js',
  'resources/js/modules/config.js',
  'resources/js/modules/**/*.js',
  'resources/js/main.js',
];

/** Stylesheets: the site, plus the local-only styleguide (never linked from the public page). */
const STYLES = ['resources/stylus/app.styl', 'resources/stylus/styleguide.styl'];

/** lucide-static icons used by the views (DESIGN-SPEC §7), copied to resources/svg/lucide and versioned. */
const ICONS = [
  'arrow-down', 'arrow-right', 'arrow-up', 'badge-check', 'book-open', 'check', 'circle-alert', 'circle-check',
  'chevron-down', 'chevron-right', 'circle-play', 'clock', 'headset', 'info', 'loader-circle', 'mail', 'map-pin', 'menu', 'minus',
  'monitor-smartphone', 'phone', 'plus', 'rotate-ccw', 'search', 'search-x', 'send', 'shield-check',
  'shopping-bag', 'trash-2', 'truck', 'user-round', 'x',
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

/** Logical name → path relative to public/, filled by every task, written by writeManifest(). */
const entries = {};
const toPosix = (path) => path.replaceAll('\\', '/');

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
          toPosix(relative(file.base, source.replace(/^\/\/\?\//, ''))),
        );
        applySourceMap(file, { ...style.sourcemap, sources, file: file.relative });
      }
      callback(null, file);
    });
  });
}

/** Moves a file to public/<TARGETS[kind]>/<name>, so dest(PUBLIC) writes it where it is served. */
function placeIn(kind) {
  return through.obj((file, _encoding, callback) => {
    const root = join(file.cwd, PUBLIC);
    file.base = root;
    file.path = join(root, TARGETS[kind], basename(file.path));
    callback(null, file);
  });
}

/** After rev(): records "kind/original-name" → hashed path relative to public/. */
function record(kind) {
  return through.obj((file, _encoding, callback) => {
    if (file.revOrigPath) {
      entries[`${kind}/${basename(file.revOrigPath)}`] = toPosix(relative(file.base, file.path));
    }
    callback(null, file);
  });
}

function writeManifest(done) {
  mkdirSync(dirname(MANIFEST), { recursive: true });
  const sorted = Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`);
  done();
}

const removeTarget = (kind) => () => deleteAsync([`${PUBLIC}/${TARGETS[kind]}`]);

export const clean = () =>
  deleteAsync([`${PUBLIC}/build`, `${PUBLIC}/${TARGETS.fonts}`]).then(() => {
    for (const key of Object.keys(entries)) delete entries[key];
  });

/**
 * Copies the icons the server inlines (<x-icon>), so PHP never depends on node_modules.
 * The output is committed: a changed icon shows up in the diff.
 */
export function icons() {
  return src(ICONS.map((name) => `node_modules/lucide-static/icons/${name}.svg`)).pipe(
    dest('resources/svg/lucide'),
  );
}

export function fonts() {
  return src(FONTS, { encoding: false })
    .pipe(placeIn('fonts'))
    .pipe(rev())
    .pipe(record('fonts'))
    .pipe(dest(PUBLIC));
}

export function scripts() {
  return src(SCRIPTS, { sourcemaps: !production, allowEmpty: true })
    .pipe(concat('app.js'))
    .pipe(production ? terser({ ecma: 2020, format: { comments: false } }) : through.obj())
    .pipe(placeIn('js'))
    .pipe(rev())
    .pipe(record('js'))
    .pipe(dest(PUBLIC, { sourcemaps: production ? false : '.' }));
}

export function styles() {
  const plugins = production ? [autoprefixer(), cssnano({ preset: 'default' })] : [autoprefixer()];
  // Font URLs in the CSS (../../fonts/x.woff2) are rewritten to the hashed files: fonts() runs first.
  const fontEntries = Buffer.from(JSON.stringify(entries));

  return src(STYLES, { sourcemaps: !production })
    .pipe(compileStylus())
    .pipe(postcss(plugins))
    .pipe(revRewrite({ manifest: fontEntries }))
    .pipe(placeIn('css'))
    .pipe(rev())
    .pipe(record('css'))
    .pipe(dest(PUBLIC, { sourcemaps: production ? false : '.' }));
}

// Sequential on purpose: styles() needs the hashed font names recorded by fonts().
export const build = series(clean, icons, fonts, scripts, styles, writeManifest);

function watchSources() {
  watch('resources/stylus/**/*.styl', series(removeTarget('css'), styles, writeManifest));
  watch('resources/js/**/*.js', series(removeTarget('js'), scripts, writeManifest));
}

export const dev = series(development, build, watchSources);
export default build;
