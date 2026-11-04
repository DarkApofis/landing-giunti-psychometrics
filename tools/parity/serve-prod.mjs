#!/usr/bin/env node
/**
 * Measurement stand-in for the production web server of version B (the Dockerfile of Prompt 10 is the
 * real one): a reverse proxy in front of `php artisan serve` that applies what that server must apply.
 *   - brotli (or gzip) for text responses: HTML, CSS, JS, JSON, SVG
 *   - Cache-Control: public, max-age=31536000, immutable for hashed assets (/build/*, /fonts/*)
 *   - Cache-Control: no-cache for HTML (always revalidated)
 *   - no X-Powered-By
 * It exists only to measure (docs/AUDIT-B.md §3.3); it is not a deployment.
 *
 *   node serve-prod.mjs [listenPort=8080] [upstream=http://localhost:8000]
 */
import http from 'node:http';
import zlib from 'node:zlib';

const PORT = Number(process.argv[2] ?? 8080);
const UPSTREAM = new URL(process.argv[3] ?? 'http://localhost:8000');
const COMPRESSIBLE = /^(text\/|application\/(javascript|json|xml)|image\/svg\+xml)/;
const HASHED = /^\/(build|fonts)\/.+-[0-9a-f]{10}\.[a-z0-9]+$/;

http
  .createServer((req, res) => {
    const upstream = http.request(
      { host: UPSTREAM.hostname, port: UPSTREAM.port, path: req.url, method: req.method, // Keep the client's Host (as nginx does with PHP-FPM): Laravel builds asset URLs from it.
        headers: { ...req.headers, 'accept-encoding': 'identity' } },
      (up) => {
        const headers = { ...up.headers };
        delete headers['x-powered-by'];
        delete headers['content-length'];
        const type = String(headers['content-type'] ?? '');
        const path = req.url.split('?')[0];

        if (HASHED.test(path)) headers['cache-control'] = 'public, max-age=31536000, immutable';
        else if (type.startsWith('text/html')) headers['cache-control'] = 'no-cache';

        const accepts = String(req.headers['accept-encoding'] ?? '');
        let encoder = null;
        if (COMPRESSIBLE.test(type)) {
          if (accepts.includes('br')) {
            encoder = zlib.createBrotliCompress({ params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } });
            headers['content-encoding'] = 'br';
          } else if (accepts.includes('gzip')) {
            encoder = zlib.createGzip({ level: 6 });
            headers['content-encoding'] = 'gzip';
          }
          if (encoder) headers.vary = 'Accept-Encoding';
        }
        res.writeHead(up.statusCode, headers);
        if (encoder) up.pipe(encoder).pipe(res);
        else up.pipe(res);
      },
    );
    upstream.on('error', (error) => {
      res.writeHead(502);
      res.end(String(error));
    });
    req.pipe(upstream);
  })
  .listen(PORT, () => console.log(`serve-prod: http://localhost:${PORT} → ${UPSTREAM.origin}`));
