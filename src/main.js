// uncomment next lineif you want to use an old browser
//import '@webcomponents/webcomponentsjs/webcomponents-loader.js';

// web animations polyfil, must come before other web components
import 'web-animations-js/web-animations-next-lite.min.js';

// main YAD library
import YAD from 'node-red-contrib-component-dashboard/src/lib.js';

// include widgets you want to use
import './widgets.js';

// start
YAD.initializeApp();
