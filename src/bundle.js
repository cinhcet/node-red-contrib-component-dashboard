// from https://parceljs.org/api.html
const Bundler = require('parcel-bundler');
const path = require('path');

const entryFiles = path.join(__dirname, './index.html');
const options = {
  publicUrl: './',
  watch: false,
  minify: true
};

const bundler = new Bundler(entryFiles, options);
bundler.bundle();
