/** @jest-environment node */
const { EventEmitter } = require('events');
const { parse } = require('url');
const httpProxy = require('http-proxy');
const { setupOutgoing } = require('http-proxy/lib/http-proxy/common');
const setupProxy = require('./setupProxy');

test.each([
  ['POST', '/api/generate-full-resume', 'http://localhost:3002'],
  ['GET', '/api/view/resume_Hilbert.pdf', 'http://localhost:3002'],
  ['GET', '/api/download/resume_Hilbert.pdf', 'http://localhost:3002'],
  ['POST', '/api/generate-full-resume', 'https://untrusted.example'],
])('proxy preserves the path and origin headers for %s %s from %s', async (method, path, origin) => {
  let outgoing;
  const transport = Object.assign(new EventEmitter(), {
    web(req, res, options) {
      outgoing = setupOutgoing({}, { ...options, target: parse(options.target) }, req);
    },
  });
  const spy = jest.spyOn(httpProxy, 'createProxyServer').mockReturnValue(transport);
  try {
    const app = { use: jest.fn() };
    setupProxy(app);
    const [mount, middleware] = app.use.mock.calls[0];
    expect(mount).toBe('/api');
    const next = jest.fn();
    await middleware({
      method,
      url: path.slice(mount.length),
      originalUrl: path,
      headers: {
        host: 'localhost:3002',
        origin,
        accept: 'text/html,application/pdf,*/*',
      },
    }, {}, next);
    expect(next).not.toHaveBeenCalled();
    expect(outgoing.hostname).toBe('127.0.0.1');
    expect(outgoing.port).toBe('5000');
    expect(outgoing.path).toBe(path);
    expect(outgoing.headers.host).toBe('localhost:3002');
    expect(outgoing.headers.origin).toBe(origin);
  } finally {
    spy.mockRestore();
  }
});
