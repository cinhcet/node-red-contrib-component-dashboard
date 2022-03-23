// see also https://parceljs.org/api.html

import {Parcel} from '@parcel/core';

let bundler = new Parcel({
  entries: 'index.html',
  defaultConfig: '@parcel/config-default',
  mode: 'production',
  defaultTargetOptions: {
    publicUrl: './',
    distDir: './dist'
  }
});

try {
  let {bundleGraph, buildTime} = await bundler.run();
  let bundles = bundleGraph.getBundles();
  console.log(`Built in ${buildTime}ms`);
} catch (err) {
  console.log(err.diagnostics);
}

