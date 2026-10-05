// VirtualC64 - C64 Binary PRG Detokenizer & D64 Disk Image Parser

// Standard Commodore 64 BASIC V2 Token Map ($80 - $FF)
export const BASIC_TOKENS = {
  0x80: 'END', 0x81: 'FOR', 0x82: 'NEXT', 0x83: 'DATA',
  0x84: 'INPUT#', 0x85: 'INPUT', 0x86: 'DIM', 0x87: 'READ',
  0x88: 'LET', 0x89: 'GOTO', 0x8A: 'RUN', 0x8B: 'IF',
  0x8C: 'RESTORE', 0x8D: 'GOSUB', 0x8E: 'RETURN', 0x8F: 'REM',
  0x90: 'STOP', 0x91: 'ON', 0x92: 'WAIT', 0x93: 'LOAD',
  0x94: 'SAVE', 0x95: 'VERIFY', 0x96: 'DEF', 0x97: 'POKE',
  0x98: 'PRINT#', 0x99: 'PRINT', 0x9A: 'CONT', 0x9B: 'LIST',
  0x9C: 'CLR', 0x9D: 'CMD', 0x9E: 'SYS', 0x9F: 'OPEN',
  0xA0: 'CLOSE', 0xA1: 'GET', 0xA2: 'NEW', 0xA3: 'TAB(',
  0xA4: 'TO', 0xA5: 'FN', 0xA6: 'SPC(', 0xA7: 'THEN',
  0xA8: 'NOT', 0xA9: 'STEP', 0xAA: '+', 0xAB: '-',
  0xAC: '*', 0xAD: '/', 0xAE: '^', 0xAF: 'AND',
  0xB0: 'OR', 0xB1: '>', 0xB2: '=', 0xB3: '<',
  0xB4: 'SGN', 0xB5: 'INT', 0xB6: 'ABS', 0xB7: 'USR',
  0xB8: 'FRE', 0xB9: 'POS', 0xBA: 'SQR', 0xBB: 'RND',
  0xBC: 'LOG', 0xBD: 'EXP', 0xBE: 'COS', 0xBF: 'SIN',
  0xC0: 'TAN', 0xC1: 'ATN', 0xC2: 'PEEK', 0xC3: 'LEN',
  0xC4: 'STR$', 0xC5: 'VAL', 0xC6: 'ASC', 0xC7: 'CHR$',
  0xC8: 'LEFT$', 0xC9: 'RIGHT$', 0xCA: 'MID$', 0xCB: 'GO'
};

/**
 * Detokenizes binary PRG buffer into readable BASIC program lines
 * @param {Uint8Array} bytes 
 * @returns {{ loadAddress: number, lines: Array<{num: number, code: string}>, text: string }}
 */
export function detokenizePrg(bytes) {
  if (bytes.length < 2) {
    throw new Error('Invalid PRG file: buffer too short');
  }

  // Load address (first 2 bytes, little endian)
  const loadAddress = bytes[0] | (bytes[1] << 8);
  const lines = [];
  let offset = 2;

  while (offset + 4 < bytes.length) {
    // 2 bytes pointer to next line
    const nextLinePtr = bytes[offset] | (bytes[offset + 1] << 8);
    offset += 2;

    if (nextLinePtr === 0) {
      // End of BASIC program marker
      break;
    }

    // 2 bytes line number
    const lineNum = bytes[offset] | (bytes[offset + 1] << 8);
    offset += 2;

    let lineCode = '';
    let inQuotes = false;

    while (offset < bytes.length && bytes[offset] !== 0) {
      const b = bytes[offset];

      if (b === 0x22) { // Quote character '"'
        inQuotes = !inQuotes;
        lineCode += '"';
      } else if (!inQuotes && b >= 0x80 && BASIC_TOKENS[b]) {
        lineCode += BASIC_TOKENS[b] + ' ';
      } else {
        // PETSCII printable mapping
        lineCode += String.fromCharCode(b);
      }
      offset++;
    }

    // Skip the null byte separating lines
    offset++;

    lines.push({ num: lineNum, code: lineCode.trim() });
  }

  const text = lines.map(l => `${l.num} ${l.code}`).join('\n');
  return { loadAddress, lines, text };
}

/**
 * Parses D64 1541 Floppy Disk Image (Standard 35 tracks, 683 sectors)
 * @param {Uint8Array} bytes 
 * @returns {{ diskTitle: string, diskId: string, files: Array<{name: string, type: string, sizeBlocks: number, dataOffset: number}> }}
 */
export function parseD64(bytes) {
  // Standard D64 sizes: 174,848 (35 tracks) or 175,531 (with errors)
  if (bytes.length < 174848) {
    throw new Error('Invalid D64 image: file size smaller than standard 35-track 1541 disk');
  }

  // Sector count per track table for 1541
  const sectorsPerTrack = [
    21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, // 1-17
    19, 19, 19, 19, 19, 19, 19,                                           // 18-24 (Dir on Track 18)
    18, 18, 18, 18, 18, 18,                                               // 25-30
    17, 17, 17, 17, 17                                                    // 31-35
  ];

  function getSectorOffset(track, sector) {
    let offset = 0;
    for (let t = 1; t < track; t++) {
      offset += sectorsPerTrack[t - 1] * 256;
    }
    return offset + (sector * 256);
  }

  // Track 18, Sector 0 is the BAM (Block Availability Map) and Header
  const bamOffset = getSectorOffset(18, 0);
  let diskTitle = '';
  for (let i = 0x90; i < 0xA0; i++) {
    const charCode = bytes[bamOffset + i];
    if (charCode && charCode !== 0xA0) {
      diskTitle += String.fromCharCode(charCode);
    }
  }

  let diskId = '';
  for (let i = 0xA2; i < 0xA7; i++) {
    const charCode = bytes[bamOffset + i];
    if (charCode && charCode !== 0xA0) {
      diskId += String.fromCharCode(charCode);
    }
  }

  // Track 18, Sector 1 begins the directory entries
  const files = [];
  let dirTrack = bytes[bamOffset];
  let dirSector = bytes[bamOffset + 1];

  while (dirTrack === 18 && dirSector < 19) {
    const dirOffset = getSectorOffset(dirTrack, dirSector);
    const nextTrack = bytes[dirOffset];
    const nextSector = bytes[dirOffset + 1];

    // 8 entries of 32 bytes per directory sector
    for (let entry = 0; entry < 8; entry++) {
      const eOffset = dirOffset + (entry * 32);
      const fileTypeByte = bytes[eOffset + 2];

      if (fileTypeByte === 0) continue; // Deleted / empty entry

      const typeBits = fileTypeByte & 0x07;
      const typeNames = ['DEL', 'SEQ', 'PRG', 'USR', 'REL', 'CBM', 'DIR'];
      const type = typeNames[typeBits] || 'PRG';

      // File name (16 bytes, padded with 0xA0)
      let fileName = '';
      for (let c = 0; c < 16; c++) {
        const b = bytes[eOffset + 5 + c];
        if (b && b !== 0xA0) {
          fileName += String.fromCharCode(b);
        }
      }

      // File size in sectors / blocks (2 bytes, little-endian)
      const sizeBlocks = bytes[eOffset + 0x1E] | (bytes[eOffset + 0x1F] << 8);
      const startTrack = bytes[eOffset + 3];
      const startSector = bytes[eOffset + 4];

      if (fileName.trim()) {
        files.push({
          name: fileName.trim(),
          type,
          sizeBlocks,
          startTrack,
          startSector,
          dataOffset: getSectorOffset(startTrack, startSector)
        });
      }
    }

    if (nextTrack === 0) break;
    dirTrack = nextTrack;
    dirSector = nextSector;
  }

  return {
    diskTitle: diskTitle.trim() || 'COMMODORE 64 DISK',
    diskId: diskId.trim() || '2A',
    files
  };
}

// Built-in Retro Interactive Games (Playable directly on the canvas)
export const retroPlayableGames = [
  {
    id: 'space_attack',
    title: 'Space Attack 64',
    category: 'Arcade Shooter',
    description: 'Control your starfighter, dodge alien lasers, and blast UFO invaders with Left/Right arrows and Spacebar!',
    controls: 'Left/Right Arrow to Move • Spacebar to Fire Laser'
  },
  {
    id: 'snake64',
    title: 'Snake 64',
    category: 'Arcade Classic',
    description: 'Eat energy pellets, grow your cyber-snake, and achieve high scores in authentic 40x25 PETSCII characters.',
    controls: 'Arrow Keys (Up/Down/Left/Right) to Slither'
  },
  {
    id: 'lunar_lander',
    title: 'Lunar Lander 64',
    category: 'Physics Sim',
    description: 'Manage thrusters and fuel consumption to perform a delicate landing on the alien lunar surface.',
    controls: 'Up Arrow to Fire Main Thruster • Left/Right to Steer'
  }
];
