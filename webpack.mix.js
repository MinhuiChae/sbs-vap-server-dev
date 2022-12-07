// eslint-disable-next-line import/no-extraneous-dependencies
const mix = require('laravel-mix');
const path = require('path');

// mix.config.fileLoaderDirs.fonts = 'resources/js/src/assets/fonts';
/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.webpackConfig({
  stats: {
      children: true,
  },
});

mix.alias({
  '@': path.join(__dirname, 'resources/js/src'),
});

mix.options({
  fileLoaderDirs:  {
      fonts: '@/assets/fonts'
  }
});

mix.ts('resources/js/app.ts', 'public/js')
.vue({ version: 3 })
.sass('resources/js/src/scss/index.scss', 'public/css')
//

// mix.ts('resources/js/admin.ts', 'public/js').vue();

if (mix.inProduction()) {
  //mix.version();
} else {

  //mix.sourceMaps();
}

// mix.postCss('resources/css/app.css', 'public/css', [
//   // eslint-disable-next-line global-require
//   require('postcss-import'),
//   // eslint-disable-next-line global-require
//   require('tailwindcss'),
//   // eslint-disable-next-line global-require
//   require('autoprefixer'),
// ]);
