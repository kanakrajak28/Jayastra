/* Libraries bundled into app.js from npm (see source/package.json), served from jayastra.com
   instead of outside CDNs. The site code uses them as globals, so they are put on window here;
   main.jsx imports this file first so they exist before anything else runs. */
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import * as Motion from 'framer-motion';
import Lenis from 'lenis';

window.React = React;
window.ReactDOM = ReactDOM;
window.Motion = Motion;
window.Lenis = Lenis;
