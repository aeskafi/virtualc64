// VirtualC64 - Specifications, Architecture, Memory Map & Presets

export const c64Specs = {
  name: 'Commodore 64 (C64)',
  releaseYear: 1982,
  cpu: {
    name: 'MOS Technology 6510',
    architecture: '8-bit CISC',
    clockSpeedPal: '0.985 MHz',
    clockSpeedNtsc: '1.023 MHz',
    registers: ['A (Accumulator)', 'X (Index)', 'Y (Index)', 'SP (Stack Pointer)', 'PC (Program Counter)', 'P (Processor Status)'],
    addressBus: '16-bit (64 KB addressable space)'
  },
  ram: {
    total: '64 KB (65,536 bytes)',
    basicAvailable: '38,911 bytes free for BASIC programs',
    colorRam: '1,024 x 4-bit nybbles at $D800-$DBE7'
  },
  rom: {
    total: '20 KB',
    breakdown: [
      '8 KB BASIC V2 ($A000 - $BFFF)',
      '8 KB KERNAL Operating System ($E000 - $FFFF)',
      '4 KB Character Generator ROM ($D000 - $DFFF)'
    ]
  },
  graphics: {
    chip: 'MOS Technology 6567 (NTSC) / 6569 (PAL) VIC-II',
    resolutionStandard: '320 x 200 pixels (2 colors per 8x8 character cell)',
    resolutionMulticolor: '160 x 200 pixels (4 colors per 4x8 cell)',
    textMode: '40 columns x 25 rows (PETSCII)',
    colors: 16,
    sprites: '8 hardware sprites (24x21 pixels, multicolor, expandable X/Y, collision detection)'
  },
  audio: {
    chip: 'MOS Technology 6581 / 8580 SID (Sound Interface Device)',
    voices: 3,
    waveforms: ['Triangle', 'Sawtooth', 'Variable Pulse (Square with PWM)', 'Noise'],
    filters: 'Multi-mode resonant analog filter (Low-pass, Band-pass, High-pass, Notch)',
    envelope: 'ADSR (Attack, Decay, Sustain, Release) per voice'
  },
  io: {
    chips: '2x MOS Technology 6526 CIA (Complex Interface Adapter)',
    ports: ['User Port', 'Expansion (Cartridge) Port', '2x Control (Joystick) Ports', 'Serial IEC Bus', 'Audio/Video Out', 'Datassette Port']
  }
};

export const c64Palette = [
  { index: 0, name: 'Black', hex: '#000000', labelColor: '#ffffff' },
  { index: 1, name: 'White', hex: '#FFFFFF', labelColor: '#000000' },
  { index: 2, name: 'Red', hex: '#880000', labelColor: '#ffffff' },
  { index: 3, name: 'Cyan', hex: '#AAFFEE', labelColor: '#000000' },
  { index: 4, name: 'Purple', hex: '#CC44CC', labelColor: '#ffffff' },
  { index: 5, name: 'Green', hex: '#00CC55', labelColor: '#000000' },
  { index: 6, name: 'Blue', hex: '#0000AA', labelColor: '#ffffff' },
  { index: 7, name: 'Yellow', hex: '#EEEE77', labelColor: '#000000' },
  { index: 8, name: 'Orange', hex: '#DD8855', labelColor: '#000000' },
  { index: 9, name: 'Brown', hex: '#664400', labelColor: '#ffffff' },
  { index: 10, name: 'Light Red', hex: '#FF7777', labelColor: '#000000' },
  { index: 11, name: 'Dark Grey', hex: '#333333', labelColor: '#ffffff' },
  { index: 12, name: 'Grey', hex: '#777777', labelColor: '#ffffff' },
  { index: 13, name: 'Light Green', hex: '#AAFF66', labelColor: '#000000' },
  { index: 14, name: 'Light Blue', hex: '#0088FF', labelColor: '#ffffff' },
  { index: 15, name: 'Light Grey', hex: '#BBBBBB', labelColor: '#000000' }
];

export const c64MemoryMap = [
  { range: '$0000 - $0001', name: '6510 On-Chip I/O Port', description: 'Direction and data register for processor I/O lines (controls ROM/RAM bank switching and cassette).' },
  { range: '$0002 - $00FF', name: 'Zero Page', description: '256 bytes accessed with fast 1-byte addressing. Contains BASIC pointers, system vectors, and temporary variables.' },
  { range: '$0100 - $01FF', name: 'Microprocessor Stack', description: 'Hardware push-down stack for JSR/RTS, interrupts, and PHA/PLA.' },
  { range: '$0200 - $03FF', name: 'Operating System & BASIC Vectors', description: 'System variables, keyboard buffer, screen editor vectors, and tape buffers.' },
  { range: '$0400 - $07E7', name: 'Default Screen Video Matrix', description: '1000 screen bytes (40 columns x 25 rows) holding character codes displayed by VIC-II.' },
  { range: '$07E8 - $07FF', name: 'Sprite Data Pointers', description: 'Pointers defining the memory block locations for sprites 0 through 7.' },
  { range: '$0801 - $9FFF', name: 'BASIC Program Area', description: '38,911 bytes allocated for BASIC V2 tokenized lines and runtime variables.' },
  { range: '$A000 - $BFFF', name: 'BASIC ROM', description: '8 KB Commodore BASIC V2 interpreter (bankable with RAM).' },
  { range: '$C000 - $CFFF', name: 'Free RAM Buffer', description: '4 KB RAM buffer commonly used by machine code programmers and custom utilities.' },
  { range: '$D000 - $D3FF', name: 'VIC-II Video Registers', description: 'Screen control, sprite coordinates, raster interrupts, colors, and border control.' },
  { range: '$D400 - $D7FF', name: 'SID Sound Synthesizer Registers', description: '3 sound voices, frequencies, pulse widths, ADSR envelopes, and resonant filter.' },
  { range: '$D800 - $DBE7', name: 'Color RAM', description: '1000 nybbles setting the foreground color for each of the 40x25 screen characters.' },
  { range: '$DC00 - $DCFF', name: 'CIA 1 Registers', description: 'Keyboard matrix scan, joystick ports, timers A/B, time of day clock.' },
  { range: '$DD00 - $DDFF', name: 'CIA 2 Registers', description: 'VIC-II memory bank selection, serial IEC bus (1541 disk drive), user port.' },
  { range: '$E000 - $FFFF', name: 'KERNAL ROM', description: '8 KB system operating system, I/O routines, reset vector, and interrupt handlers.' }
];

export const c64Presets = [
  {
    id: 'maze',
    title: '10 PRINT Maze Generator',
    author: 'Commodore 64 Lore',
    category: 'Procedural Art',
    description: 'The legendary one-line BASIC program that draws an infinite procedural labyrinth using diagonal PETSCII slash characters.',
    code: `10 PRINT CHR$(205.5+RND(1)); : GOTO 10`
  },
  {
    id: 'rainbow',
    title: 'Rainbow Border & Screen Cycler',
    author: 'Dirk Hoffmann / VirtualC64',
    category: 'VIC-II Graphics',
    description: 'Directly manipulates VIC-II registers $D020 (border color) and $D021 (background color) to cycle through all 16 C64 palette colors.',
    code: `10 FOR I=0 TO 15
20 POKE 53280,I : POKE 53281,I
30 FOR W=1 TO 80 : NEXT W
40 NEXT I
50 GOTO 10`
  },
  {
    id: 'sid_arpeggio',
    title: 'SID Chiptune Arpeggio',
    author: 'Rob Hubbard homage',
    category: 'SID Sound',
    description: 'Powers up voice 1 on the MOS 6581 SID chip, configures attack/decay envelope, and plays a rapid 3-note melodic arpeggio.',
    code: `10 REM SID CHIPTUNE ARPEGGIO
20 POKE 54296,15 : REM MASTER VOLUME MAXIMUM
30 POKE 54277,33 : REM ATTACK 2MS, DECAY 750MS
40 POKE 54278,240: REM SUSTAIN 15, RELEASE 6S
50 FOR N=1 TO 8
60 POKE 54273,34 : POKE 54276,17 : FOR W=1 TO 50: NEXT W
70 POKE 54273,43 : POKE 54276,17 : FOR W=1 TO 50: NEXT W
80 POKE 54273,51 : POKE 54276,17 : FOR W=1 TO 50: NEXT W
90 NEXT N
100 POKE 54276,16 : REM RELEASE GATE`
  },
  {
    id: 'starfield',
    title: 'Warp-Speed Starfield Simulation',
    author: 'Retro Demogroup',
    category: 'Animation',
    description: 'Renders an interactive animated starfield on the 40x25 character screen with pseudo-3D velocity.',
    code: `10 PRINT CHR$(147) : REM CLEAR SCREEN
20 FOR I=1 TO 80
30 X=INT(RND(1)*39)+1 : Y=INT(RND(1)*24)+1
40 PRINT TAB(X); "*"
50 FOR W=1 TO 20 : NEXT W
60 NEXT I
70 PRINT "WARP SPEED COMPLETE."`
  },
  {
    id: 'bouncing_ball',
    title: 'Physics Bouncing Character',
    author: 'Commodore Computing',
    category: 'Physics & Math',
    description: 'Simulates a ball bouncing against the boundaries of the 40x25 character grid with vector reflection.',
    code: `10 PRINT CHR$(147)
20 X=1 : Y=1 : DX=1 : DY=1
30 PRINT TAB(X); "O"
40 X=X+DX : Y=Y+DY
50 IF X>=38 OR X<=1 THEN DX=-DX
60 IF Y>=23 OR Y<=1 THEN DY=-DY
70 FOR W=1 TO 30 : NEXT W
80 GOTO 30`
  }
];

export const opcodes6502 = [
  { opcode: 'LDA', mode: 'Immediate / Absolute', description: 'Load Accumulator with Memory' },
  { opcode: 'STA', mode: 'Absolute / ZeroPage', description: 'Store Accumulator in Memory' },
  { opcode: 'LDX', mode: 'Immediate / Absolute', description: 'Load Index Register X' },
  { opcode: 'STX', mode: 'Absolute / ZeroPage', description: 'Store Index Register X' },
  { opcode: 'LDY', mode: 'Immediate / Absolute', description: 'Load Index Register Y' },
  { opcode: 'STY', mode: 'Absolute / ZeroPage', description: 'Store Index Register Y' },
  { opcode: 'JSR', mode: 'Absolute ($xxxx)', description: 'Jump to Subroutine (saves return address on stack)' },
  { opcode: 'RTS', mode: 'Implied', description: 'Return from Subroutine' },
  { opcode: 'JMP', mode: 'Absolute ($xxxx)', description: 'Jump to Address' },
  { opcode: 'BEQ', mode: 'Relative', description: 'Branch if Equal (Zero flag = 1)' },
  { opcode: 'BNE', mode: 'Relative', description: 'Branch if Not Equal (Zero flag = 0)' },
  { opcode: 'NOP', mode: 'Implied', description: 'No Operation (2 clock cycles)' }
];
