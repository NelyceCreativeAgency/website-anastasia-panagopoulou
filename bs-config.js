// Browser-sync configuration for local development.
// Run with:  npm run dev
module.exports = {
  // Serve the project root as a static site.
  server: { baseDir: "./" },

  // Watch these files. CSS changes are injected live (no reload);
  // HTML/JS changes trigger a quick full reload.
  files: [
    "*.html",
    "pages/*.html",
    "css/*.css",
    "js/*.js",
    "Images/*"
  ],

  // Inject CSS in place instead of reloading the whole page.
  injectChanges: true,

  port: 3000,
  open: true,         // open the browser automatically on start
  notify: false,      // hide the "Connected to BrowserSync" toast
  ui: false,          // no control-panel UI on :3001
  ghostMode: false,   // don't mirror clicks/scroll across devices
  startPath: "/index.html"
};
