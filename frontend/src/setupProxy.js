const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // PDF navigation can accept text/html; always proxy API requests before the SPA fallback.
  app.use('/api', createProxyMiddleware({
    target: 'http://127.0.0.1:5000',
    // Flask checks Origin against Host, so preserve the browser-facing host.
    changeOrigin: false,
  }));
};
