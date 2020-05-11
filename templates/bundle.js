// see also https://parceljs.org/api.html
const Bundler = require('parcel-bundler');
const path = require('path');

//process.env.NODE_ENV = 'production';

let shouldWatch = false;
let sourceMaps = false;
let minify = true;
if(process.argv.length > 2) {
  if(process.argv.includes('watch')) shouldWatch = true;
  if(process.argv.includes('sourceMaps')) sourceMaps = true;
  if(process.argv.includes('noMinify')) minify = false;
}

const entryFiles = path.join(__dirname, './index.html');
const options = {
  publicUrl: './',
  watch: shouldWatch,
  minify: minify,
  sourceMaps: sourceMaps
};

const bundler = new Bundler(entryFiles, options);
bundler.bundle();
