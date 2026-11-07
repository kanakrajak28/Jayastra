/* Build-time only (see prerender.js): renders a page of the site to HTML in Node, and exposes the
   data the build uses for structured data and llms.txt. Not part of the website's app.js. */
import { App } from './src/App';
import { FAQS } from './src/components/FAQ';
import { DISCIPLINES, DISC_INFO, SERVICE_SLUGS } from './src/components/Services';
import { CASES } from './src/components/CaseStudies';
import { INDUSTRIES, SECTOR_SLUGS } from './src/components/Industries';

globalThis.__renderPage = () => ReactDOMServer.renderToString(<App />);
globalThis.__siteData = { FAQS, DISCIPLINES, DISC_INFO, SERVICE_SLUGS, CASES, INDUSTRIES, SECTOR_SLUGS };
