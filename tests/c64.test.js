import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { appHandler } from '../server.js';
import {
  c64Specs,
  c64Palette,
  c64MemoryMap,
  c64Presets,
  opcodes6502
} from '../c64/c64Data.js';
import {
  detokenizePrg,
  retroPlayableGames,
  builtinSidTracks,
  parseSid
} from '../c64/c64Parser.js';

let serverInstance;
let baseUrl;

test.before(async () => {
  serverInstance = http.createServer(appHandler);
  await new Promise((resolve) => {
    serverInstance.listen(0, '127.0.0.1', () => {
      const port = serverInstance.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    serverInstance.close(resolve);
  });
});

test('GET /api/health returns ok status and C64 system identifier', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.equal(data.service, 'VirtualC64 Web Studio');
  assert.equal(data.system, 'Commodore 64 BASIC V2');
});

test('GET /api/c64/specs returns cycle-accurate hardware specs', async () => {
  const res = await fetch(`${baseUrl}/api/c64/specs`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.name, 'Commodore 64 (C64)');
  assert.equal(data.cpu.name, 'MOS Technology 6510');
  assert.equal(data.ram.total, '64 KB (65,536 bytes)');
  assert.equal(data.graphics.colors, 16);
  assert.equal(data.audio.voices, 3);
});

test('GET /api/c64/palette returns 16 VIC-II colors', async () => {
  const res = await fetch(`${baseUrl}/api/c64/palette`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.length, 16);
  assert.equal(data[0].name, 'Black');
  assert.equal(data[6].name, 'Blue');
  assert.equal(data[14].name, 'Light Blue');
});

test('GET /api/c64/memory returns full 64KB memory map', async () => {
  const res = await fetch(`${baseUrl}/api/c64/memory`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  assert.ok(data.length >= 10);
  const zeroPage = data.find(m => m.name === 'Zero Page');
  assert.ok(zeroPage);
  assert.equal(zeroPage.range, '$0002 - $00FF');
});

test('GET /api/c64/presets returns classic C64 programs', async () => {
  const res = await fetch(`${baseUrl}/api/c64/presets`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  const maze = data.find(p => p.id === 'maze');
  assert.ok(maze, '10 PRINT maze should be present');
  assert.ok(maze.code.includes('205.5+RND(1)'));
});

test('GET /api/c64/games returns playable retro arcade games', async () => {
  const res = await fetch(`${baseUrl}/api/c64/games`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  assert.ok(data.length >= 3);
  const space = data.find(g => g.id === 'space_attack');
  assert.ok(space);
  assert.ok(space.controls.includes('Spacebar'));
});

test('GET /api/c64/opcodes returns 6502 instruction set', async () => {
  const res = await fetch(`${baseUrl}/api/c64/opcodes`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  const lda = data.find(o => o.opcode === 'LDA');
  assert.ok(lda);
  assert.equal(lda.description, 'Load Accumulator with Memory');
});

test('GET / serves the VirtualC64 Web Studio HTML', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.status, 200);
  assert.ok(res.headers.get('content-type').includes('text/html'));
  const html = await res.text();
  assert.ok(html.includes('VirtualC64 Studio'));
  assert.ok(html.includes('COMMODORE 64 BASIC V2'));
  assert.ok(html.includes('1541 FLOPPY DRIVE'));
});

test('PRG Detokenizer correctly parses binary BASIC buffer', () => {
  // Construct a minimal C64 binary PRG for: 10 PRINT "HELLO"
  // Bytes:
  // [0x01, 0x08] => Load address $0801
  // [0x0C, 0x08] => Pointer to next line ($080C)
  // [0x0A, 0x00] => Line 10
  // [0x99] => Token for PRINT
  // [0x20, 0x22, 0x48, 0x45, 0x4C, 0x4C, 0x4F, 0x22] => ' "HELLO"'
  // [0x00] => End of line
  // [0x00, 0x00] => End of program
  const prgBytes = new Uint8Array([
    0x01, 0x08,
    0x0E, 0x08,
    0x0A, 0x00,
    0x99, 0x20, 0x22, 0x48, 0x45, 0x4C, 0x4C, 0x4F, 0x22,
    0x00,
    0x00, 0x00
  ]);

  const result = detokenizePrg(prgBytes);
  assert.equal(result.loadAddress, 0x0801);
  assert.equal(result.lines.length, 1);
  assert.equal(result.lines[0].num, 10);
  assert.ok(result.lines[0].code.includes('PRINT'));
  assert.ok(result.lines[0].code.includes('"HELLO"'));
});

test('Data integrity: VIC-II palette contains exactly 16 distinct colors with indices 0-15', () => {
  assert.equal(c64Palette.length, 16);
  for (let i = 0; i < 16; i++) {
    assert.equal(c64Palette[i].index, i);
    assert.ok(c64Palette[i].hex.startsWith('#'));
  }
});

test('GET /api/c64/sid-tracks returns classic C64 chiptunes', async () => {
  const res = await fetch(`${baseUrl}/api/c64/sid-tracks`);
  assert.equal(res.status, 200);
  const tracks = await res.json();
  assert.ok(Array.isArray(tracks));
  assert.ok(tracks.length >= 3);
  const commando = tracks.find(t => t.id === 'commando');
  assert.ok(commando);
  assert.equal(commando.composer, 'Rob Hubbard');
});

test('parseSid correctly extracts metadata from valid PSID header buffer', () => {
  // Construct a minimal 124-byte PSID buffer
  const buf = new Uint8Array(128);
  // Magic: 'PSID'
  buf[0] = 0x50; buf[1] = 0x53; buf[2] = 0x49; buf[3] = 0x44;
  // Version 2
  buf[4] = 0x00; buf[5] = 0x02;
  // Data offset: 0x7C (124 bytes)
  buf[6] = 0x00; buf[7] = 0x7C;
  // Load address: 0x1000
  buf[8] = 0x10; buf[9] = 0x00;
  // Songs count: 1
  buf[0x0E] = 0x00; buf[0x0F] = 0x01;
  // Start song: 1
  buf[0x10] = 0x00; buf[0x11] = 0x01;
  // Title at 0x16: "Test Tune"
  const title = "Test Tune";
  for (let i = 0; i < title.length; i++) buf[0x16 + i] = title.charCodeAt(i);
  // Author at 0x36: "Martin Galway"
  const author = "Martin Galway";
  for (let i = 0; i < author.length; i++) buf[0x36 + i] = author.charCodeAt(i);

  const parsed = parseSid(buf);
  assert.equal(parsed.magic, 'PSID');
  assert.equal(parsed.version, 2);
  assert.equal(parsed.title, 'Test Tune');
  assert.equal(parsed.author, 'Martin Galway');
  assert.equal(parsed.songs, 1);
  assert.equal(parsed.loadAddress, 0x1000);
});

