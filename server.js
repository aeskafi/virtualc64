// VirtualC64 - Native Zero-Dependency HTTP Server & API
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  c64Specs,
  c64Palette,
  c64MemoryMap,
  c64Presets,
  opcodes6502
} from './c64/c64Data.js';
import { retroPlayableGames } from './c64/c64Parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 6464;
const HOST = process.env.HOST || '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.prg': 'application/octet-stream',
  '.d64': 'application/octet-stream',
  '.t64': 'application/octet-stream'
};

export const appHandler = (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: Health check
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'VirtualC64 Web Studio',
      system: 'Commodore 64 BASIC V2',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // API: Full C64 Specs
  if (pathname === '/api/c64/specs') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(c64Specs));
    return;
  }

  // API: Palette
  if (pathname === '/api/c64/palette') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(c64Palette));
    return;
  }

  // API: Memory Map
  if (pathname === '/api/c64/memory') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(c64MemoryMap));
    return;
  }

  // API: Presets
  if (pathname === '/api/c64/presets') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(c64Presets));
    return;
  }

  // API: 6502 Opcodes
  if (pathname === '/api/c64/opcodes') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(opcodes6502));
    return;
  }

  // API: Retro Playable Games
  if (pathname === '/api/c64/games') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(retroPlayableGames));
    return;
  }

  // Static File Serving
  let filePath;
  if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(__dirname, 'public', 'index.html');
  } else if (pathname.startsWith('/Resources/')) {
    filePath = path.join(__dirname, pathname);
  } else {
    filePath = path.join(__dirname, 'public', pathname);
  }

  // Safe path traversal guard
  const safeBase = __dirname;
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(safeBase)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(resolvedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      const spaFallback = path.join(__dirname, 'public', 'index.html');
      fs.readFile(spaFallback, (fallbackErr, fallbackData) => {
        if (!fallbackErr) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(fallbackData);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        }
      });
      return;
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(resolvedPath);
    stream.pipe(res);
  });
};

export const server = http.createServer(appHandler);

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, HOST, () => {
    console.log(`\n🕹️  VirtualC64 Web Studio & Retro Emulator is live at http://localhost:${PORT}`);
    console.log(`📡 Endpoints:`);
    console.log(`   - http://localhost:${PORT}/api/c64/specs`);
    console.log(`   - http://localhost:${PORT}/api/c64/memory`);
    console.log(`   - http://localhost:${PORT}/api/c64/palette`);
    console.log(`   - http://localhost:${PORT}/api/c64/presets`);
    console.log(`   - http://localhost:${PORT}/api/health\n`);
  });
}
