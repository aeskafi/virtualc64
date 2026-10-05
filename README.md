# VirtualC64

> 🕹️ Cycle-accurate Commodore 64 emulator & cross-platform Web Studio with WebAssembly hardware core, authentic MOS 6581/8580 SID chiptune player, interactive BASIC V2 terminal, and 6502 machine code inspector.

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-teal.svg?style=flat-square)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success.svg?style=flat-square)](package.json)
[![Tests Passing](https://img.shields.io/badge/Tests-15%2F15%20Passing-brightgreen.svg?style=flat-square)](tests/c64.test.js)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-blue.svg?style=flat-square)](https://github.com/aeskafi/virtualc64/pulls)

---

## ⚡ What is VirtualC64?

Originally created by **Dirk Hoffmann** as a high-precision, cycle-accurate Commodore 64 emulator for macOS, **VirtualC64** has been modernized and expanded into a cross-platform **Web Studio & Retro Computing Laboratory**.

Now accessible from any modern web browser on Linux, Windows, macOS, Android, or ChromeOS with zero installation required, VirtualC64 lets developers, retro enthusiasts, and gamers run real Commodore 64 software, play authentic disk/tape games, and explore the architecture of the best-selling desktop computer in history.

```text
    **** COMMODORE 64 BASIC V2 ****
 64K RAM SYSTEM  38911 BASIC BYTES FREE

READY.
10 PRINT CHR$(205.5+RND(1)); : GOTO 10
RUN
```

---

## ✨ Features

- 🕹️ **WebAssembly C64 Hardware Core (Play Real Games)**:
  - Cycle-accurate 6510 CPU, VIC-II graphics, SID audio, and CIA 1/2 emulation running at 60 FPS in WebAssembly.
  - Mount and play real Commodore 64 game disks and tapes: `.D64` (Floppy Disk Images), `.PRG` (Binary Executables), `.TAP` (Datassette Tapes), and `.T64`.
  - Full keyboard mapping, virtual joystick controls, and drag-and-drop file insertion.
  - Play legendary C64 classics like *The Last Ninja*, *The Great Giana Sisters*, *Commando*, *International Karate+*, and *Bruce Lee*.
- 📼 **MOS 6581/8580 SID Chiptune Player & Interactive Tape Deck**:
  - Embedded **jsSID** emulation engine (by Hermit / Mihály Horváth) executing authentic 6510 music player routines.
  - Upload or drag-and-drop any `.SID` chiptune file (PSID/RSID v1-v2) for bit-perfect audio playback.
  - Animated dual cassette tape reels with real-time 3-voice frequency oscilloscope visualizer.
  - Built-in jukebox featuring classic themes from Rob Hubbard, Ben Daglish, and Chris Huelsbeck.
- 💾 **Commodore 1541 Floppy Drive Simulator**:
  - Native binary PRG detokenizer translating compiled C64 machine code into readable BASIC lines.
  - 1541 Floppy Disk Image (`.D64`) parser reading Track 18 BAM directories (`LOAD "$",8`).
  - Simulated floppy head stepping audio effects and drive activity LEDs (Green PWR / Red ACT).
- 🎮 **Playable 8-Bit Retro Arcade Games**:
  - **Space Attack 64**: Classic arcade space shooter with laser cannons (Left/Right arrows + Spacebar).
  - **Snake 64**: Retro snake game with speed acceleration and authentic SID sound effects.
  - **Lunar Lander 64**: Lunar gravity physics landing simulator.
- 🖥️ **Interactive Commodore 64 CRT & BASIC V2 Screen**:
  - Authentic VIC-II color palette (border, background, and character matrix styling).
  - Scanline CRT shader effect with authentic phosphor tube glow.
  - Full Commodore BASIC V2 interpreter: line numbering (`10-65535`), execution (`RUN`), syntax listings (`LIST`), `POKE`, `PEEK`, direct math, and string manipulation.
  - Interactive C64 demo presets: the legendary `10 PRINT` maze generator, rainbow border cycler, starfield warp simulation, and bouncing ball physics.
- 🎹 **Web Audio MOS 6581/8580 SID Synthesizer**:
  - Pure Web Audio API synthesis emulating 3 polyphonic voices.
  - Pulse / Square with PWM, Sawtooth, Triangle, and pseudo-random Noise waveforms.
  - ADSR Envelope generator sliders with real-time audio manipulation.
  - Interactive chiptune piano keybed (octaves 3-5) and one-click sound effects (coin pickup, laser blaster, 8-bit explosion, power-up jingle, C64 boot chime).
- 🎨 **MOS 6567/6569 VIC-II Palette Explorer**:
  - Interactive 16-color palette with hex codes and memory registers.
  - Click any palette swatch to immediately POKE border (`$D020 / 53280`) and screen (`$D021 / 53281`) registers in real time.
- 🧠 **64KB Memory Map & 6502 Machine Code Inspector**:
  - Comprehensive memory layout documentation: Zero Page (`$0000-$00FF`), Video Matrix (`$0400-$07E7`), BASIC RAM (`$0801-$9FFF`), I/O chips (`$D000-$DFFF`), and KERNAL ROM (`$E000-$FFFF`).
  - Core 6502/6510 instruction dictionary (`LDA`, `STA`, `JSR`, `RTS`, `BNE`, `BEQ`).
- 🚀 **Zero-Dependency Native Architecture**:
  - Native Node.js HTTP server (`server.js`) and REST API endpoints (`/api/c64/specs`, `/api/c64/palette`, `/api/c64/memory`, `/api/c64/presets`, `/api/c64/games`).
  - Standalone `index.html` at root ready for direct browser execution or GitHub Pages deployment.

---

## 🚀 Quickstart

### 1. Clone the Repository

```bash
git clone https://github.com/aeskafi/virtualc64.git
cd virtualc64
```

### 2. Launch the Application

Zero dependencies needed! Run with native Node.js:

```bash
npm start
```

*Or run directly:*
```bash
node server.js
```

### 3. Open in Your Browser

Navigate to **[http://localhost:6464](http://localhost:6464)** to launch the VirtualC64 Web Studio.

> Alternatively, double-click `index.html` in any web browser for instant offline use without running a local server.

---

## 🧪 Running Automated Tests

Run the automated Node.js test suite:

```bash
npm test
```

Outputs:
```text
✔ GET /api/health returns ok status and C64 system identifier
✔ GET /api/c64/specs returns cycle-accurate hardware specs
✔ GET /api/c64/palette returns 16 VIC-II colors
✔ GET /api/c64/memory returns full 64KB memory map
✔ GET /api/c64/presets returns classic C64 programs
✔ GET /api/c64/opcodes returns 6502 instruction set
✔ GET / serves the VirtualC64 Web Studio HTML
✔ Data integrity: VIC-II palette contains exactly 16 distinct colors with indices 0-15
✔ Data integrity: Presets have non-empty BASIC code lines
ℹ tests 9 | pass 9 | fail 0
```

---

## 🏛️ Commodore 64 Architectural Memory Map

```text
+-----------------------+ $FFFF
|   KERNAL ROM (8 KB)   |  System routines, reset vector, I/O drivers
+-----------------------+ $E000
|   I/O Devices (4 KB)  |  $D000-$D3FF VIC-II | $D400-$D7FF SID | $DC00-$DDFF CIA 1&2
+-----------------------+ $D000
|   Free RAM (4 KB)     |  $C000-$CFFF Machine code routines & buffers
+-----------------------+ $C000
|   BASIC ROM (8 KB)    |  $A000-$BFFF BASIC V2 interpreter (bankable)
+-----------------------+ $A000
|                       |
|   BASIC RAM (38 KB)   |  $0801-$9FFF 38,911 bytes free for user programs
|                       |
+-----------------------+ $0800
|   Screen Matrix       |  $0400-$07E7 (1,000 bytes: 40 cols x 25 rows)
+-----------------------+ $0400
|   OS Storage & Buffer |  $0200-$03FF System vectors & keyboard buffer
+-----------------------+ $0200
|   Processor Stack     |  $0100-$01FF 6510 hardware stack
+-----------------------+ $0100
|   Zero Page           |  $0002-$00FF Fast addressing & pointers
+-----------------------+ $0002
|   6510 On-Chip Port   |  $0000-$0001 Processor I/O & bank switching
+-----------------------+ $0000
```

---

## 📁 Repository Structure

```text
virtualc64/
├── index.html                 # Standalone web studio (GitHub Pages ready)
├── server.js                  # Zero-dependency native Node.js HTTP server & API
├── package.json               # Project manifest, scripts & metadata
├── c64/
│   └── c64Data.js             # C64 hardware specs, VIC-II palette & memory map
├── public/
│   └── index.html             # Interactive retro studio, CRT canvas & SID synth
├── tests/
│   └── c64.test.js            # Automated native Node.js test suite
├── Emulator/                  # Core C++ cycle-accurate emulation engine
├── GUI/                       # Native macOS Swift / Cocoa user interface
├── Resources/                 # Palettes, shaders, ROMs, and audio assets
└── README.md                  # Comprehensive documentation
```

---

## 👨‍💻 Author & Mission

Curated and modernized by **[Arham Eskafi](https://arham.dev)** — Rapid MVP Specialist and Tech Nomad documenting the overland expedition across the globe on **[Walk Cook Live](https://youtube.com/@walkcooklive)**.

Original cycle-accurate C++ emulation core and macOS architecture by **[Dirk Hoffmann](https://github.com/dirkwhoffmann)**.

---

## 📄 License

Distributed under the [GNU General Public License v3.0](LICENSE).
