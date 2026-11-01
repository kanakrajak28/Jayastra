import './lib/vendor';
import { App } from './App';

/* Jayastra — studio site
   React 18 + Framer Motion 12, bundled from npm and exposed as globals (React, ReactDOM, Motion, Lenis).
   Authored in JSX and compiled to plain React.createElement calls for the page. */


ReactDOM.createRoot(document.getElementById('root')).render(<App />);
