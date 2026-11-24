/* Graphics: every tile and sprite is painted in code at boot into an atlas.
   Tiles are listed in G.D.tiles; each names a painter below (default: its own id).
   Characters are built from a small spec (G.D.sprites); beasts are pixel strings (G.D.pix). */
G.gfx = (function () {
  const T = 16, COLS = 32;
  const tiles = {}, sprites = {}, pix = {};
  let atlas, actx, next = 0;

  const P = {
    grass: '#4c9141', grassD: '#3e7c36', grassL: '#62a850',
    path: '#c8a56a', pathD: '#b08c55', pathL: '#d8b983',
    water: '#3a6fb8', waterL: '#7fb0e8', waterD: '#2f5c9c',
    trunk: '#6b4a2b', trunkD: '#4e3520', leaf: '#2f7032', leafD: '#215226', leafL: '#4a9440',
    pine: '#245a3a', pineD: '#183f29', pineL: '#33784c',
    stone: '#8d8f9c', stoneD: '#666876', stoneL: '#a9abb8', flag: '#70727f', flagD: '#5b5d69',
    wood: '#a8754a', woodD: '#8a5d38', woodL: '#bf8a5c',
    cave: '#5c5349', caveD: '#4a4239', caveL: '#6c6257',
    rock: '#34303b', rockL: '#474151', brick: '#544c5e', brickD: '#3d3746', brickL: '#6a6176',
    roof: '#a9483c', roofD: '#873429', roofL: '#c45e50',
    plaster: '#dccba3', plasterD: '#c2b088', glass: '#7fc4e8', glassL: '#c6ecff',
    ink: '#1a1420', white: '#f4f1e6', gold: '#e8c14a', goldD: '#b58a2a',
    iron: '#70747f', ironD: '#4a4d57', fire: '#ff9a2e', fireL: '#ffe07a', red: '#c8443c',
    bone: '#e6e0cc', boneD: '#b9b29b', rug: '#8f3340', rugL: '#b8505a', black: '#0b0a10'
  };

  function mulberry(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const px = (c, x, y, col) => R(c, x, y, 1, 1, col);
  const speck = (c, rnd, n, col) => { for (let i = 0; i < n; i++) px(c, (rnd() * 16) | 0, (rnd() * 16) | 0, col); };
  const disc = (c, cx, cy, r, col) => {
    c.fillStyle = col;
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.8) c.fillRect(cx + x, cy + y, 1, 1);
  };
  function shade(hex, d) {
    const n = parseInt(hex.slice(1), 16);
    const f = v => G.clamp(v + d, 0, 255);
    return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
  }
  function bricks(c, base, lo, hi) {
    R(c, 0, 0, 16, 16, lo);
    for (let r = 0; r < 4; r++) {
      const off = (r % 2) * 4;
      for (let x = -8; x < 16; x += 8) { R(c, x + off, r * 4, 7, 3, base); R(c, x + off, r * 4, 7, 1, hi); }
    }
  }

  /* ---------- tile painters: (ctx, frame, rnd) at 0,0..16,16 ---------- */
  const PAINT = {
    missing(c) { R(c, 0, 0, 16, 16, '#f0f'); },
    grass(c, f, rnd) {
      R(c, 0, 0, 16, 16, P.grass); speck(c, rnd, 16, P.grassD); speck(c, rnd, 9, P.grassL);
      for (let i = 0; i < 2; i++) { const x = 2 + (rnd() * 11 | 0), y = 3 + (rnd() * 10 | 0); px(c, x, y, P.grassL); px(c, x + 1, y - 1, P.grassL); px(c, x + 2, y, P.grassL); }
    },
    flowers(c, f, rnd) {
      PAINT.grass(c, f, rnd);
      const cols = ['#f4f1e6', '#f08aa6', '#f2d14a', '#b99cf0'];
      for (let i = 0; i < 4; i++) { const x = 2 + (rnd() * 12 | 0), y = 2 + (rnd() * 11 | 0); px(c, x, y + 1, P.grassD); px(c, x, y, cols[i % cols.length]); }
    },
    path(c, f, rnd) { R(c, 0, 0, 16, 16, P.path); speck(c, rnd, 14, P.pathD); speck(c, rnd, 8, P.pathL); },
    water(c, f, rnd) {
      R(c, 0, 0, 16, 16, P.water); speck(c, rnd, 8, P.waterD);
      for (let i = 0; i < 4; i++) { const y = 2 + i * 4, x = (i * 5 + f * 3) % 12; R(c, x, y, 4, 1, P.waterL); px(c, x + 5, y + 1, P.waterL); }
    },
    bridge(c) {
      R(c, 0, 0, 16, 16, P.woodD);
      for (let y = 0; y < 16; y += 4) { R(c, 0, y, 16, 3, P.wood); R(c, 0, y, 16, 1, P.woodL); }
      R(c, 0, 0, 1, 16, P.trunkD); R(c, 15, 0, 1, 16, P.trunkD);
    },
    brokenBridge(c, f, rnd) {
      PAINT.water(c, f, rnd);
      R(c, 0, 0, 16, 3, P.wood); R(c, 0, 0, 16, 1, P.woodL); R(c, 2, 3, 3, 3, P.woodD); R(c, 10, 3, 2, 2, P.woodD);
      R(c, 5, 11, 5, 2, P.woodD); px(c, 6, 10, P.wood);
    },
    tree(c, f, rnd) {
      R(c, 3, 13, 10, 2, 'rgba(0,0,0,.22)'); R(c, 6, 9, 4, 6, P.trunk); R(c, 6, 9, 1, 6, P.trunkD);
      disc(c, 8, 6, 6, P.leafD); disc(c, 8, 5, 5, P.leaf); disc(c, 6, 4, 2, P.leafL);
      for (let i = 0; i < 5; i++) px(c, 4 + (rnd() * 8 | 0), 2 + (rnd() * 7 | 0), rnd() < 0.5 ? P.leafL : P.leafD);
    },
    pine(c) {
      R(c, 4, 14, 8, 1, 'rgba(0,0,0,.22)'); R(c, 7, 12, 2, 3, P.trunk);
      for (let t = 0; t < 3; t++) for (let i = 0; i < 5; i++) {
        const y = 1 + t * 3 + i, half = 1 + t + i;
        if (y > 12) continue;
        R(c, 8 - half, y, half * 2, 1, i === 4 ? P.pineD : P.pine); px(c, 8 - half + 1, y, P.pineL);
      }
    },
    // small wild decor, drawn over the map's ground
    cobweb(c) { const W = 'rgba(230,230,240,.55)'; for (let i = 0; i < 9; i++) { px(c, i, i, W); } for (let i = 0; i < 12; i++) { px(c, i, 0, i % 3 ? W : 'rgba(230,230,240,.3)'); px(c, 0, i, W); }
      [[3, 6], [6, 3], [5, 9], [9, 5]].forEach(q => px(c, q[0], q[1], W)); for (let i = 0; i < 6; i++) { px(c, 6 - i, i + 1, 'rgba(230,230,240,.4)'); px(c, 9 - i, i, 'rgba(230,230,240,.3)'); } },
    rubbleFloor(c, f, rnd) { for (let i = 0; i < 6; i++) { const x = 1 + (rnd() * 12 | 0), y = 2 + (rnd() * 11 | 0), w = 2 + (rnd() * 2 | 0); R(c, x, y + 1, w, 2, 'rgba(0,0,0,.25)'); R(c, x, y, w, 2, P.stone); px(c, x, y, P.stoneL); } },
    puddle(c, f) { R(c, 3, 6, 10, 5, 'rgba(40,60,90,.55)'); R(c, 2, 7, 12, 3, 'rgba(40,60,90,.55)'); R(c, 5, 7, 4, 1, f ? 'rgba(200,220,255,.5)' : 'rgba(200,220,255,.3)'); px(c, 10, 9, 'rgba(200,220,255,.4)'); },
    moss(c, f, rnd) { for (let i = 0; i < 14; i++) { const x = rnd() * 15 | 0, y = rnd() * 15 | 0; px(c, x, y, i % 3 ? '#4a6a3a' : '#6a8a4a'); if (i % 2) px(c, x + 1, y, '#3a5a2e'); } },
    papersFloor(c, f, rnd) { for (let i = 0; i < 3; i++) { const x = 1 + (rnd() * 9 | 0), y = 2 + (rnd() * 9 | 0); R(c, x, y + 1, 5, 4, 'rgba(0,0,0,.2)'); R(c, x, y, 5, 4, '#e8dcc0'); R(c, x + 1, y + 1, 3, 1, '#8a7a6a'); R(c, x + 1, y + 2, 2, 1, '#8a7a6a'); } },
    rime(c, f, rnd) { for (let i = 0; i < 10; i++) { const x = rnd() * 14 | 0, y = rnd() * 14 | 0; px(c, x, y, '#ffffff'); px(c, x + 1, y + 1, '#c8e8ff'); } },
    shells(c, f, rnd) { for (let i = 0; i < 4; i++) { const x = 2 + (rnd() * 11 | 0), y = 3 + (rnd() * 10 | 0); R(c, x, y, 3, 2, '#f0d8c8'); px(c, x + 1, y, '#c89a8a'); } },
    fern(c, f, rnd) { for (let i = 0; i < 2; i++) { const x = 4 + (rnd() * 7 | 0), y = 6 + (rnd() * 5 | 0); for (let k = 0; k < 4; k++) { px(c, x - k, y + k, P.leafL); px(c, x + k, y + k, P.leaf); px(c, x, y + k, P.leafD); } } },
    // tall grass: thick, waist-high cover (random fights start in it), plainly different from the open grass
    tallgrass(c, f, rnd) { R(c, 0, 2, 16, 14, 'rgba(30,70,30,.35)');
      for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) { const x = i * 3 + (row % 2) - 1 + (rnd() * 2 | 0), y = 3 + row * 5, h = 5 + (rnd() * 2 | 0);
        R(c, x, y + 1, 2, h - 1, '#2e6a2a'); R(c, x, y, 1, h, '#3e8a34'); px(c, x, y, '#8ad06a'); px(c, x + 1, y + 1, '#5aa848'); } },
    pebbles(c, f, rnd) { for (let i = 0; i < 5; i++) { const x = 2 + (rnd() * 12 | 0), y = 3 + (rnd() * 11 | 0); px(c, x, y, P.stone); px(c, x + 1, y, P.stoneD); } },
    shrub(c, f, rnd) { R(c, 3, 13, 10, 2, 'rgba(0,0,0,.2)'); disc(c, 8, 10, 4, P.leafD); disc(c, 7, 9, 3, P.leaf); disc(c, 10, 10, 2, P.leaf); px(c, 6, 7, P.leafL); px(c, 9, 8, '#f2d14a'); px(c, 5, 10, '#f08aa6'); px(c, 11, 11, '#f4f1e6'); },
    log(c) { R(c, 1, 12, 14, 2, 'rgba(0,0,0,.2)'); R(c, 1, 8, 14, 5, P.trunk); R(c, 1, 8, 14, 1, P.woodL); R(c, 1, 12, 14, 1, P.trunkD); R(c, 13, 8, 2, 5, P.wood); px(c, 14, 10, P.trunkD); px(c, 5, 9, P.trunkD); px(c, 9, 11, P.trunkD); },
    // reed-beds: thick cover in the fen (random fights start in it)
    cattail(c, f, rnd) { R(c, 0, 4, 16, 12, 'rgba(40,60,30,.35)');
      for (let i = 0; i < 7; i++) { const x = 1 + i * 2 + (rnd() * 2 | 0), y = 2 + (rnd() * 4 | 0); R(c, x, y + 3, 1, 11 - (y - 2), i % 2 ? '#6a8a3a' : '#5a7a30'); if (i % 2 === 0) R(c, x, y, 1, 3, '#6a4428'); }
      R(c, 2, 13, 12, 1, '#4a6a28'); },
    snowshrub(c) { R(c, 3, 13, 10, 2, 'rgba(0,0,0,.15)'); disc(c, 8, 10, 4, '#2c5a3e'); disc(c, 8, 8, 3, '#e8eef4'); px(c, 5, 10, '#f4f8fc'); px(c, 11, 9, '#f4f8fc'); },
    icecrystal(c, f, rnd) { for (let i = 0; i < 3; i++) { const x = 3 + (rnd() * 10 | 0), y = 6 + (rnd() * 6 | 0); R(c, x, y - 3, 1, 4, '#bfe6ff'); px(c, x, y - 4, '#ffffff'); px(c, x + 1, y, '#8ac8f0'); } },
    deadshrub(c) { R(c, 3, 13, 10, 2, 'rgba(0,0,0,.2)'); for (const [x, y, dx] of [[8, 13, 0], [8, 10, -1], [8, 10, 1], [8, 8, -1], [8, 7, 1]]) for (let k = 0; k < 4; k++) px(c, x + dx * k, y - k, '#4a3a34'); px(c, 4, 6, '#6a5a50'); px(c, 12, 5, '#6a5a50'); },
    skull(c) { R(c, 6, 9, 5, 4, P.bone); R(c, 7, 13, 3, 1, P.boneD); px(c, 7, 10, P.ink); px(c, 9, 10, P.ink); px(c, 8, 12, P.ink); },
    bush(c) { disc(c, 8, 10, 5, P.leafD); disc(c, 8, 9, 4, P.leaf); disc(c, 6, 8, 1, P.leafL); px(c, 10, 9, P.red); px(c, 7, 11, P.red); },
    rock(c) { R(c, 3, 13, 10, 2, 'rgba(0,0,0,.22)'); disc(c, 8, 9, 5, P.stoneD); disc(c, 8, 8, 4, P.stone); R(c, 6, 5, 3, 1, P.stoneL); px(c, 10, 9, P.stoneD); },
    roof(c) {
      R(c, 0, 0, 16, 16, P.roofD);
      for (let r = 0; r < 4; r++) for (let x = -4; x < 16; x += 4) { const o = (r % 2) * 2; R(c, x + o, r * 4, 3, 3, P.roof); px(c, x + o, r * 4, P.roofL); }
    },
    timber(c, f, rnd) {
      R(c, 0, 0, 16, 16, P.plaster); speck(c, rnd, 8, P.plasterD);
      R(c, 0, 0, 16, 2, P.trunk); R(c, 0, 0, 1, 16, P.trunk); R(c, 15, 0, 1, 16, P.trunk); R(c, 0, 13, 16, 3, P.stoneD); R(c, 0, 13, 16, 1, P.stone);
    },
    window(c, f, rnd) {
      PAINT.timber(c, f, rnd);
      R(c, 4, 3, 8, 8, P.trunk); R(c, 5, 4, 6, 6, P.glass); R(c, 5, 4, 2, 2, P.glassL); R(c, 7, 4, 1, 6, P.trunk); R(c, 5, 6, 6, 1, P.trunk);
    },
    stonewall(c) { bricks(c, P.stone, P.stoneD, P.stoneL); },
    stonewin(c) { bricks(c, P.stone, P.stoneD, P.stoneL); R(c, 5, 3, 6, 9, P.stoneD); R(c, 6, 4, 4, 7, P.gold); R(c, 6, 4, 4, 2, P.fireL); R(c, 7, 4, 1, 7, P.stoneD); },
    door(c, f, rnd) {
      PAINT.timber(c, f, rnd);
      R(c, 3, 2, 10, 14, P.trunkD); R(c, 4, 3, 8, 13, P.wood); R(c, 4, 3, 8, 1, P.woodL); R(c, 8, 3, 1, 13, P.woodD); px(c, 10, 9, P.gold);
    },
    doorStone(c) {
      bricks(c, P.stone, P.stoneD, P.stoneL);
      R(c, 3, 2, 10, 14, P.trunkD); R(c, 4, 3, 8, 13, P.wood); R(c, 4, 3, 8, 1, P.woodL); R(c, 8, 3, 1, 13, P.woodD); px(c, 10, 9, P.gold);
    },
    fence(c) { R(c, 1, 5, 2, 10, P.trunk); R(c, 13, 5, 2, 10, P.trunk); R(c, 0, 7, 16, 2, P.woodL); R(c, 0, 11, 16, 1, P.wood); },
    grave(c) {
      R(c, 3, 13, 10, 2, P.pathD); R(c, 5, 4, 6, 9, P.stoneD); R(c, 6, 3, 4, 1, P.stone); R(c, 5, 4, 5, 8, P.stone);
      R(c, 8, 6, 1, 4, P.ink); R(c, 7, 7, 3, 1, P.ink);
    },
    graveOpen(c) { R(c, 3, 4, 10, 10, P.pathD); R(c, 4, 5, 8, 8, P.black); R(c, 4, 5, 8, 1, P.trunkD); px(c, 2, 9, P.path); px(c, 13, 6, P.path); px(c, 12, 14, P.path); },
    well(c) { disc(c, 8, 9, 6, P.stoneD); disc(c, 8, 9, 5, P.stone); disc(c, 8, 9, 3, P.waterD); px(c, 7, 8, P.waterL); R(c, 2, 2, 1, 6, P.trunk); R(c, 13, 2, 1, 6, P.trunk); R(c, 2, 1, 12, 1, P.trunkD); },
    lamp(c, f) { R(c, 7, 6, 2, 9, P.ironD); R(c, 5, 14, 6, 1, P.ironD); R(c, 5, 1, 6, 5, P.ironD); R(c, 6, 2, 4, 3, f ? P.fireL : P.fire); },
    wallTop(c, f, rnd) { R(c, 0, 0, 16, 16, P.rock); speck(c, rnd, 10, P.rockL); },
    wallFace(c) { bricks(c, P.brick, P.brickD, P.brickL); R(c, 0, 0, 16, 3, P.rock); R(c, 0, 3, 16, 1, P.rockL); R(c, 0, 15, 16, 1, P.black); },
    void(c) { R(c, 0, 0, 16, 16, P.black); },
    wood(c, f, rnd) {
      R(c, 0, 0, 16, 16, P.wood);
      for (let r = 0; r < 4; r++) { R(c, 0, r * 4 + 3, 16, 1, P.woodD); R(c, (r * 7 + 3) % 16, r * 4, 1, 3, P.woodD); }
      speck(c, rnd, 4, P.woodL);
    },
    stone(c, f, rnd) {
      R(c, 0, 0, 16, 16, P.flag); speck(c, rnd, 6, P.flagD);
      R(c, 0, 7, 16, 1, P.flagD); R(c, 0, 15, 16, 1, P.flagD); R(c, 7, 0, 1, 7, P.flagD); R(c, 15, 0, 1, 7, P.flagD); R(c, 3, 8, 1, 7, P.flagD); R(c, 11, 8, 1, 7, P.flagD);
    },
    cave(c, f, rnd) { R(c, 0, 0, 16, 16, P.cave); speck(c, rnd, 18, P.caveD); speck(c, rnd, 9, P.caveL); },
    table(c) { R(c, 2, 11, 2, 4, P.trunkD); R(c, 12, 11, 2, 4, P.trunkD); R(c, 1, 4, 14, 8, P.woodD); R(c, 1, 3, 14, 7, P.woodL); R(c, 2, 4, 12, 5, P.wood); R(c, 10, 5, 2, 2, P.stoneL); px(c, 5, 6, P.gold); },
    counter(c) { R(c, 0, 2, 16, 13, P.woodD); R(c, 0, 1, 16, 5, P.woodL); R(c, 0, 6, 16, 1, P.trunkD); R(c, 5, 8, 1, 6, P.trunkD); R(c, 11, 8, 1, 6, P.trunkD); },
    bed(c) { R(c, 2, 1, 12, 14, P.woodD); R(c, 3, 2, 10, 12, P.white); R(c, 4, 3, 8, 3, '#cfd8e8'); R(c, 3, 7, 10, 7, P.red); R(c, 3, 7, 10, 1, P.roofL); },
    shelf(c) {
      R(c, 1, 0, 14, 15, P.trunkD);
      const cols = ['#b23a3a', '#3a6ea5', '#4a9440', '#e8c14a', '#7a3fa0'];
      for (let r = 0; r < 3; r++) { R(c, 2, 1 + r * 5, 12, 4, P.trunk); for (let i = 0; i < 6; i++) R(c, 2 + i * 2, 1 + r * 5 + (i % 3 === 0 ? 1 : 0), 2, 4 - (i % 3 === 0 ? 1 : 0), cols[(i + r * 2) % 5]); }
    },
    // a bookcase on castors (it can be shoved): shorter, a pale oak frame with brass corners, little iron wheels
    shelfCart(c) {
      R(c, 2, 14, 12, 2, 'rgba(0,0,0,.3)');
      R(c, 1, 1, 14, 12, P.woodL); R(c, 1, 1, 14, 1, '#f0d9a8');
      const cols = ['#b23a3a', '#3a6ea5', '#4a9440', '#e8c14a', '#7a3fa0'];
      for (let r = 0; r < 2; r++) { R(c, 2, 2 + r * 5, 12, 4, P.wood); for (let i = 0; i < 6; i++) R(c, 2 + i * 2, 2 + r * 5 + (i % 2), 2, 4 - (i % 2), cols[(i + r * 3) % 5]); }
      R(c, 1, 12, 14, 1, P.woodD); px(c, 1, 1, P.gold); px(c, 14, 1, P.gold); px(c, 1, 12, P.gold); px(c, 14, 12, P.gold);
      disc(c, 3, 14, 1.5, P.ironD); disc(c, 12, 14, 1.5, P.ironD); px(c, 3, 14, P.iron); px(c, 12, 14, P.iron);
    },
    barrel(c) { R(c, 3, 13, 10, 2, 'rgba(0,0,0,.22)'); R(c, 4, 3, 8, 11, P.wood); R(c, 3, 5, 10, 7, P.wood); R(c, 3, 5, 10, 1, P.ironD); R(c, 3, 11, 10, 1, P.ironD); R(c, 5, 2, 6, 2, P.woodL); R(c, 4, 6, 1, 5, P.woodL); },
    crate(c) { R(c, 2, 3, 12, 12, P.woodD); R(c, 3, 4, 10, 10, P.wood); for (let i = 0; i < 10; i++) { px(c, 3 + i, 4 + i, P.woodD); px(c, 12 - i, 4 + i, P.woodD); } R(c, 3, 4, 10, 1, P.woodL); },
    pillar(c) { R(c, 3, 13, 10, 3, P.stoneD); R(c, 4, 0, 8, 14, P.stone); R(c, 4, 0, 2, 14, P.stoneL); R(c, 10, 0, 2, 14, P.stoneD); R(c, 3, 0, 10, 2, P.stoneL); },
    altar(c) { R(c, 1, 5, 14, 10, P.stoneD); R(c, 1, 4, 14, 3, P.stoneL); R(c, 5, 4, 6, 10, P.white); R(c, 5, 13, 6, 1, P.gold); R(c, 7, 1, 2, 3, P.goldD); px(c, 7, 0, P.fireL); px(c, 8, 0, P.fire); },
    rug(c) { R(c, 0, 0, 16, 16, P.rug); R(c, 0, 0, 2, 16, P.rugL); R(c, 14, 0, 2, 16, P.rugL); R(c, 2, 0, 1, 16, P.goldD); R(c, 13, 0, 1, 16, P.goldD); px(c, 7, 4, P.rugL); px(c, 8, 11, P.rugL); },
    hearth(c, f) { bricks(c, P.stone, P.stoneD, P.stoneL); R(c, 3, 5, 10, 11, P.black); R(c, 5, 11, 6, 5, P.fire); R(c, 6, 8 + f, 4, 6, P.fireL); px(c, 5 + f * 5, 9, P.fire); },
    pots(c) { disc(c, 5, 11, 3, '#b5653a'); R(c, 4, 7, 3, 1, '#8a4a28'); disc(c, 11, 10, 3, '#9c5530'); R(c, 10, 6, 3, 1, '#7a4020'); px(c, 4, 10, '#d88a5a'); px(c, 10, 9, '#c0703f'); },
    anvil(c) { R(c, 4, 13, 8, 2, P.ironD); R(c, 6, 9, 4, 4, P.ironD); R(c, 3, 6, 10, 3, P.ironD); R(c, 2, 5, 12, 2, P.iron); px(c, 2, 5, P.stoneL); },
    statue(c) { R(c, 3, 12, 10, 3, P.stoneD); R(c, 5, 4, 6, 9, P.stone); R(c, 5, 4, 2, 9, P.stoneL); R(c, 6, 0, 4, 4, P.stoneL); px(c, 7, 2, P.stoneD); px(c, 9, 2, P.stoneD); R(c, 4, 6, 1, 4, P.stone); R(c, 11, 6, 1, 4, P.stoneD); },
    brazier(c, f) { R(c, 7, 8, 2, 7, P.ironD); R(c, 5, 14, 6, 1, P.ironD); R(c, 4, 6, 8, 3, P.iron); R(c, 5, 2 + f, 6, 5 - f, P.fire); R(c, 6, 3 + f, 4, 3, P.fireL); },
    bones(c) { R(c, 4, 10, 6, 1, P.bone); px(c, 3, 9, P.bone); px(c, 3, 11, P.bone); px(c, 10, 9, P.bone); px(c, 10, 11, P.bone); R(c, 9, 4, 4, 3, P.bone); px(c, 10, 5, P.ink); px(c, 12, 5, P.ink); R(c, 10, 7, 2, 1, P.boneD); },
    rubble(c) { disc(c, 5, 11, 3, P.rockL); disc(c, 11, 10, 3, P.brick); disc(c, 8, 6, 2, P.brickL); px(c, 4, 10, P.brickL); },
    mat(c) { R(c, 2, 4, 12, 9, P.rugL); R(c, 3, 5, 10, 7, P.rug); R(c, 2, 14, 12, 2, 'rgba(255,230,170,.35)'); },
    daylight(c) { R(c, 1, 0, 14, 16, '#bcd0c0'); R(c, 3, 0, 10, 16, '#e6f0dc'); R(c, 0, 0, 1, 16, P.rock); R(c, 15, 0, 1, 16, P.rock); },
    stairsDown(c) { R(c, 1, 1, 14, 14, P.black); const sh = [P.stoneL, P.stone, P.stoneD, P.brick, P.brickD]; for (let i = 0; i < 5; i++) R(c, 2, 2 + i * 2.5 | 0, 12 - i, 2, sh[i]); R(c, 1, 1, 14, 1, P.stoneL); },
    stairsUp(c) { R(c, 1, 1, 14, 14, P.brickD); const sh = [P.brickD, P.brick, P.stoneD, P.stone, P.stoneL]; for (let i = 0; i < 5; i++) R(c, 2 + i, 12 - i * 2.5 | 0, 12 - i, 2, sh[i]); },
    chest(c) { R(c, 2, 6, 12, 9, P.trunkD); R(c, 3, 7, 10, 7, P.wood); R(c, 2, 4, 12, 4, P.woodL); R(c, 2, 8, 12, 1, P.trunkD); R(c, 7, 4, 2, 10, P.gold); R(c, 7, 8, 2, 2, P.goldD); },
    chestOpen(c) { R(c, 2, 8, 12, 7, P.trunkD); R(c, 3, 9, 10, 5, P.wood); R(c, 2, 2, 12, 5, P.woodD); R(c, 3, 3, 10, 3, P.wood); R(c, 3, 7, 10, 2, P.black); R(c, 7, 9, 2, 5, P.gold); },
    sign(c) { R(c, 7, 8, 2, 7, P.trunk); R(c, 2, 2, 12, 7, P.trunkD); R(c, 3, 3, 10, 5, P.woodL); R(c, 4, 4, 7, 1, P.ink); R(c, 4, 6, 5, 1, P.ink); },
    notice(c) { R(c, 2, 9, 2, 6, P.trunk); R(c, 12, 9, 2, 6, P.trunk); R(c, 1, 1, 14, 9, P.trunkD); R(c, 2, 2, 12, 7, P.wood); R(c, 3, 3, 4, 5, P.white); R(c, 9, 3, 4, 3, P.white); R(c, 9, 7, 3, 1, P.plaster); px(c, 4, 4, P.red); },
    lever(c) { R(c, 5, 11, 6, 3, P.ironD); R(c, 6, 10, 4, 1, P.iron); px(c, 7, 9, P.stoneL); px(c, 6, 8, P.stoneL); px(c, 5, 7, P.stoneL); R(c, 3, 5, 2, 2, P.red); },
    leverOn(c) { R(c, 5, 11, 6, 3, P.ironD); R(c, 6, 10, 4, 1, P.iron); px(c, 8, 9, P.stoneL); px(c, 9, 8, P.stoneL); px(c, 10, 7, P.stoneL); R(c, 11, 5, 2, 2, '#4a9440'); },
    gate(c) { for (let x = 1; x < 16; x += 3) { R(c, x, 0, 2, 16, P.iron); R(c, x, 0, 1, 16, P.stoneL); } R(c, 0, 2, 16, 1, P.ironD); R(c, 0, 9, 16, 1, P.ironD); },
    lockedDoor(c) { R(c, 0, 0, 16, 16, P.brickD); R(c, 1, 0, 14, 16, P.woodD); R(c, 2, 0, 12, 16, P.wood); R(c, 6, 0, 1, 16, P.woodD); R(c, 10, 0, 1, 16, P.woodD); R(c, 1, 3, 14, 2, P.ironD); R(c, 1, 11, 14, 2, P.ironD); R(c, 7, 7, 2, 3, P.ink); },
    sarcophagus(c) { R(c, 1, 0, 14, 16, P.stoneD); R(c, 2, 1, 12, 14, P.stone); R(c, 3, 2, 10, 12, P.stoneL); R(c, 6, 3, 4, 3, P.stone); R(c, 5, 6, 6, 7, P.stone); R(c, 7, 7, 2, 5, P.stoneD); R(c, 6, 8, 4, 1, P.stoneD); },
    mushroom(c) { R(c, 6, 11, 1, 3, '#cfc7dc'); R(c, 4, 9, 5, 2, '#eee9f6'); R(c, 5, 8, 3, 1, '#eee9f6'); px(c, 5, 10, '#cfc7dc'); R(c, 11, 12, 1, 2, '#cfc7dc'); R(c, 10, 11, 3, 1, '#eee9f6'); },
    boulder(c) { R(c, 2, 13, 12, 2, 'rgba(0,0,0,.25)'); disc(c, 8, 8, 6, P.stoneD); disc(c, 8, 7, 5, P.stone); R(c, 5, 4, 4, 1, P.stoneL); px(c, 9, 8, P.stoneD); px(c, 10, 9, P.stoneD); px(c, 10, 10, P.stoneD); },
    shrine(c, f) { R(c, 4, 11, 8, 4, P.stoneD); R(c, 4, 11, 8, 1, P.stoneL); R(c, 6, 6, 4, 5, P.stone); R(c, 5, 1, 6, 5, P.goldD); R(c, 6, 2, 4, 3, f ? P.fireL : P.fire); px(c, 7, 0, P.goldD); px(c, 8, 0, P.goldD); },
    lampDead(c) { R(c, 4, 11, 8, 4, P.stoneD); R(c, 4, 11, 8, 1, P.stoneL); R(c, 6, 6, 4, 5, P.stone); R(c, 5, 1, 6, 5, P.ironD); R(c, 6, 2, 4, 3, P.black); px(c, 7, 0, P.ironD); px(c, 8, 0, P.ironD); },
    // puzzle pieces
    plateUp(c) { R(c, 1, 2, 14, 13, 'rgba(0,0,0,.35)'); R(c, 1, 1, 14, 13, P.stoneD); R(c, 2, 2, 12, 11, P.stone); R(c, 2, 2, 12, 1, P.stoneL); R(c, 2, 2, 1, 11, P.stoneL);
      R(c, 6, 5, 4, 1, P.flagD); R(c, 5, 6, 1, 4, P.flagD); R(c, 10, 6, 1, 4, P.flagD); R(c, 6, 10, 4, 1, P.flagD); px(c, 7, 7, P.goldD); px(c, 8, 8, P.goldD); },
    plateDown(c) { R(c, 1, 1, 14, 14, P.black); R(c, 2, 3, 12, 11, P.stoneD); R(c, 2, 3, 12, 1, 'rgba(0,0,0,.6)');
      R(c, 6, 6, 4, 1, '#7ee08a'); R(c, 5, 7, 1, 4, '#7ee08a'); R(c, 10, 7, 1, 4, '#7ee08a'); R(c, 6, 11, 4, 1, '#7ee08a'); R(c, 7, 8, 2, 2, '#c8ffd0'); },
    pit(c) { R(c, 0, 0, 16, 16, '#0a080e'); R(c, 0, 0, 16, 3, P.rock); R(c, 0, 3, 16, 1, P.rockL); R(c, 0, 4, 16, 3, '#1a1622'); R(c, 0, 7, 16, 2, '#120f18');
      px(c, 3, 11, '#1a1622'); px(c, 11, 13, '#1a1622'); px(c, 8, 9, '#16121c'); },
    filledPit(c, f, rnd) { R(c, 0, 0, 16, 16, P.stoneD); for (let i = 0; i < 9; i++) { const x = rnd() * 13 | 0, y = rnd() * 13 | 0; R(c, x, y, 3, 3, i % 2 ? P.stone : P.flag); px(c, x, y, P.stoneL); } R(c, 0, 0, 16, 1, P.rock); },
    crackFloor(c, f, rnd) { R(c, 0, 0, 16, 16, '#3a3440'); R(c, 1, 1, 14, 14, P.flagD); speck(c, rnd, 12, P.flag); R(c, 1, 1, 14, 1, P.flag);
      [[3, 2], [4, 3], [5, 4], [5, 5], [6, 6], [7, 7], [8, 7], [9, 8], [10, 9], [10, 10], [11, 11], [12, 12], [8, 8], [7, 9], [6, 10], [5, 11], [4, 12], [9, 6], [10, 5], [12, 4], [11, 4]].forEach(q => px(c, q[0], q[1], '#1a1622'));
      [[6, 7], [9, 9], [5, 10]].forEach(q => px(c, q[0], q[1], '#3a3644')); },
    rottenPlanks(c, f, rnd) { R(c, 0, 0, 16, 16, '#2a1c12'); for (let y = 0; y < 16; y += 4) { R(c, 0, y, 16, 3, P.woodD); R(c, 0, y, 16, 1, P.wood); }
      R(c, 5, 4, 3, 3, '#140c08'); R(c, 10, 9, 4, 2, '#140c08'); R(c, 2, 12, 3, 2, '#140c08'); px(c, 8, 5, P.woodL); px(c, 13, 10, P.woodL); },
    thinIce(c, f, rnd) { R(c, 0, 0, 16, 16, '#3a6a90'); R(c, 1, 1, 14, 14, '#7ab0d8'); R(c, 1, 1, 14, 1, '#c8e8ff');
      [[2, 3], [3, 4], [4, 4], [5, 5], [6, 6], [7, 6], [8, 7], [9, 8], [10, 8], [11, 9], [12, 10], [13, 11], [7, 7], [6, 8], [5, 9], [4, 10], [3, 11], [9, 5], [10, 4], [11, 3]].forEach(q => px(c, q[0], q[1], '#eaf8ff'));
      px(c, 8, 8, '#ffffff'); },
    trap(c) { for (let i = 0; i < 3; i++) { R(c, 2, 3 + i * 4, 12, 2, '#1a1418'); for (let x = 3; x < 14; x += 3) { px(c, x, 3 + i * 4, '#c8c8d0'); px(c, x + 1, 3 + i * 4, '#8a2a2a'); } } R(c, 1, 1, 14, 1, 'rgba(0,0,0,.25)'); },
    trapOff(c) { for (let i = 0; i < 3; i++) R(c, 2, 3 + i * 4, 12, 2, '#2a2228'); R(c, 4, 6, 3, 3, P.wood); R(c, 4, 6, 3, 1, P.woodL); R(c, 10, 10, 3, 3, P.wood); R(c, 10, 10, 3, 1, P.woodL); },
    secretDoor(c) { PAINT.wallFace(c); R(c, 4, 5, 8, 11, 'rgba(10,8,16,.55)'); R(c, 4, 5, 8, 1, '#7ee08a'); R(c, 4, 5, 1, 11, '#7ee08a'); R(c, 11, 5, 1, 11, '#7ee08a'); px(c, 9, 11, P.gold); },
    wardLamp(c, f) { R(c, 4, 11, 8, 4, P.stoneD); R(c, 4, 11, 8, 1, P.stoneL); R(c, 6, 6, 4, 5, P.stone); R(c, 5, 1, 6, 5, P.ironD); R(c, 6, 2, 4, 3, f ? P.fireL : P.fire);
      px(c, 7, 0, P.ironD); px(c, 8, 0, P.ironD); R(c, 7, 2 + f, 2, 2, '#fffbe0'); },
    chime(c) { R(c, 2, 14, 12, 2, P.stoneD); R(c, 3, 1, 2, 14, P.woodD); R(c, 11, 1, 2, 14, P.woodD); R(c, 3, 1, 10, 2, P.wood); R(c, 3, 1, 10, 1, P.woodL);
      R(c, 7, 3, 2, 2, P.ironD); R(c, 5, 5, 6, 7, '#5a7a9a'); R(c, 5, 5, 6, 1, '#9ac8e8'); R(c, 5, 5, 1, 7, '#7aa0c0'); R(c, 7, 7, 2, 3, '#c8e8ff'); },
    resetLever(c) { R(c, 3, 11, 10, 4, P.ironD); R(c, 3, 11, 10, 1, P.iron); disc(c, 8, 6, 4, P.red); disc(c, 8, 6, 2, P.ironD); R(c, 7, 2, 2, 9, P.iron); R(c, 7, 2, 1, 9, P.stoneL); R(c, 6, 1, 4, 2, P.gold); },
    millstone(c) { R(c, 2, 13, 12, 2, 'rgba(0,0,0,.3)'); disc(c, 8, 8, 7, '#8a8070'); disc(c, 8, 8, 6, '#a89c88'); disc(c, 8, 8, 2, '#3a3428');
      for (let a = 0; a < 6; a++) { const an = a * 1.047; px(c, 8 + Math.round(Math.cos(an) * 4), 8 + Math.round(Math.sin(an) * 4), '#7a7060'); } R(c, 4, 3, 4, 1, '#c8bca8'); },
    iceblock(c) { R(c, 1, 2, 14, 13, '#5a8ab0'); R(c, 2, 3, 12, 11, '#9ad0f0'); R(c, 2, 3, 12, 2, '#d8f4ff'); R(c, 2, 3, 2, 11, '#c0e8fc'); px(c, 10, 8, '#ffffff'); px(c, 11, 7, '#ffffff'); R(c, 1, 14, 14, 1, '#3a6a90'); },
    ghostBridge(c, f) { R(c, 0, 0, 16, 16, 'rgba(120,180,255,.18)'); for (let y = 1; y < 16; y += 4) { R(c, 0, y, 16, 3, f ? 'rgba(170,215,255,.55)' : 'rgba(150,200,255,.45)'); R(c, 0, y, 16, 1, 'rgba(230,245,255,.7)'); } },
    muralSong(c) { R(c, 1, 2, 14, 12, '#4a4038'); R(c, 2, 3, 12, 10, '#d8cba8'); for (let y = 5; y < 12; y += 2) R(c, 3, y, 10, 1, '#a8987a');
      [[4, 9], [6, 7], [8, 5], [10, 8], [12, 6]].forEach(q => { R(c, q[0], q[1], 2, 2, P.ink); }); R(c, 1, 2, 14, 1, '#6a5a48'); },
    sluice(c) { R(c, 2, 0, 12, 16, P.ironD); for (let x = 3; x < 14; x += 3) R(c, x, 0, 2, 16, P.iron); R(c, 2, 6, 12, 2, P.wood); R(c, 2, 6, 12, 1, P.woodL); },
    mirrorA(c) { R(c, 2, 13, 12, 2, 'rgba(0,0,0,.3)'); R(c, 6, 11, 4, 3, P.goldD); for (let i = 0; i < 11; i++) { R(c, 2 + i, 12 - i, 2, 2, P.goldD); px(c, 3 + i, 12 - i, '#d8e8ff'); } px(c, 12, 2, '#ffffff'); },
    mirrorB(c) { R(c, 2, 13, 12, 2, 'rgba(0,0,0,.3)'); R(c, 6, 11, 4, 3, P.goldD); for (let i = 0; i < 11; i++) { R(c, 2 + i, 2 + i, 2, 2, P.goldD); px(c, 3 + i, 2 + i, '#d8e8ff'); } px(c, 3, 2, '#ffffff'); },
    crystal(c) { R(c, 4, 12, 8, 3, P.ironD); R(c, 4, 12, 8, 1, P.iron); R(c, 6, 3, 4, 9, '#5a6a8a'); R(c, 7, 2, 2, 1, '#5a6a8a'); R(c, 6, 3, 1, 9, '#8a9ab8'); px(c, 8, 5, '#aab8d0'); },
    crystalLit(c, f) { R(c, 4, 12, 8, 3, P.ironD); R(c, 4, 12, 8, 1, P.iron); R(c, 6, 3, 4, 9, f ? '#ffe9a0' : '#fff4c8'); R(c, 7, 2, 2, 1, '#fff4c8'); R(c, 6, 3, 1, 9, '#ffffff'); R(c, 3, 6, 1, 2, '#ffe07a'); R(c, 12, 6, 1, 2, '#ffe07a'); R(c, 7, 0, 2, 1, '#ffe07a'); },
    sunshaft(c, f) { R(c, 2, 2, 12, 12, f ? 'rgba(255,240,180,.35)' : 'rgba(255,240,180,.28)'); R(c, 5, 5, 6, 6, 'rgba(255,250,220,.5)'); R(c, 7, 7, 2, 2, '#fffbe8'); },
    sentryPost(c) { R(c, 3, 12, 10, 3, P.stoneD); },
    tideFloor(c, f, rnd) { R(c, 0, 0, 16, 16, '#5a6058'); speck(c, rnd, 14, '#4a5048'); speck(c, rnd, 8, '#7a8070'); px(c, 4, 4, '#3a7050'); px(c, 11, 10, '#3a7050'); R(c, 6, 12, 3, 1, '#3a7050'); },
    crack(c) { PAINT.wallFace(c); const pts = [[8, 3], [7, 4], [7, 5], [8, 6], [9, 7], [8, 8], [7, 9], [6, 10], [7, 11], [8, 12], [8, 13], [9, 14], [10, 6], [11, 5], [5, 11], [4, 12]]; pts.forEach(p => px(c, p[0], p[1], P.black)); },
    caveMouth(c) { R(c, 0, 0, 16, 16, P.stoneD); R(c, 1, 1, 14, 2, P.stoneL); R(c, 1, 3, 2, 13, P.stone); R(c, 13, 3, 2, 13, P.stone); R(c, 3, 3, 10, 13, P.black); R(c, 4, 13, 8, 3, '#1c1826'); },
    mound(c, f, rnd) { R(c, 0, 0, 16, 16, P.grassD); speck(c, rnd, 14, P.leafD); speck(c, rnd, 6, P.grass); R(c, 0, 14, 16, 2, P.leafD); },
    sack(c) { R(c, 3, 13, 10, 2, 'rgba(0,0,0,.25)'); disc(c, 8, 10, 4, '#7a5f3a'); disc(c, 8, 9, 3, '#927448'); R(c, 6, 4, 4, 2, '#7a5f3a'); R(c, 5, 5, 6, 1, P.trunkD); px(c, 7, 3, P.stoneL); px(c, 9, 3, P.white); px(c, 8, 2, P.stoneL); px(c, 6, 9, '#a88a5a'); },
    throne(c) { R(c, 3, 0, 10, 14, P.stoneD); R(c, 4, 1, 8, 12, P.stone); R(c, 5, 2, 6, 6, '#4a2f66'); R(c, 2, 9, 12, 6, P.stoneD); R(c, 3, 9, 10, 4, P.stoneL); R(c, 4, 10, 8, 2, '#5a3a7a'); R(c, 2, 15, 12, 1, P.black); px(c, 7, 0, P.gold); px(c, 8, 0, P.gold); },
    throneBack(c) { R(c, 2, 0, 12, 16, P.stoneD); R(c, 3, 1, 10, 15, P.stone); R(c, 4, 3, 8, 13, '#4a2f66'); R(c, 5, 4, 6, 12, '#5a3a7a'); R(c, 7, 0, 2, 2, P.gold); px(c, 3, 1, P.stoneL); px(c, 12, 1, P.stoneL); R(c, 2, 15, 1, 1, P.black); R(c, 13, 15, 1, 1, P.black); },
    web(c, f, rnd) {
      const W = 'rgba(240,240,250,.75)';
      for (let i = 0; i < 16; i++) { px(c, i, i, W); px(c, 15 - i, i, W); }
      for (let i = 2; i < 14; i++) { px(c, 8, i, W); px(c, i, 8, W); }
      [[5, 5], [11, 5], [5, 11], [11, 11]].forEach(p => { px(c, p[0], p[1], P.white); px(c, p[0] + 1, p[1], W); px(c, p[0], p[1] + 1, W); });
    },
    ladder(c) { R(c, 1, 0, 14, 16, P.black); R(c, 3, 0, 2, 16, P.wood); R(c, 11, 0, 2, 16, P.wood); for (let y = 1; y < 16; y += 4) { R(c, 3, y, 10, 2, P.woodL); R(c, 3, y + 1, 10, 1, P.woodD); } },
    wheel(c) {
      R(c, 7, 9, 2, 7, P.ironD); R(c, 4, 15, 8, 1, P.ironD);
      for (let a = 0; a < 40; a++) { const t = a / 40 * Math.PI * 2; px(c, 8 + Math.round(Math.cos(t) * 6), 7 + Math.round(Math.sin(t) * 6), P.iron); px(c, 8 + Math.round(Math.cos(t) * 5), 7 + Math.round(Math.sin(t) * 5), P.ironD); }
      for (let i = -5; i <= 5; i++) { px(c, 8 + i, 7, P.iron); px(c, 8, 7 + i, P.iron); }
      R(c, 7, 6, 3, 3, P.red); px(c, 13, 3, '#8a4a28'); px(c, 3, 10, '#8a4a28');
    },
    bramble(c, f, rnd) {
      R(c, 2, 14, 12, 2, 'rgba(0,0,0,.25)'); disc(c, 8, 9, 7, '#2a3a1e'); disc(c, 8, 8, 6, '#3a4a26');
      for (let i = 0; i < 26; i++) { const x = 2 + (rnd() * 12 | 0), y = 2 + (rnd() * 12 | 0); px(c, x, y, rnd() < 0.5 ? '#6a4a2a' : '#8a6a3a'); px(c, x + 1, y - 1, '#c8b890'); }
      px(c, 5, 6, P.red); px(c, 11, 10, P.red); px(c, 9, 4, P.red);
    },
    sand(c, f, rnd) { R(c, 0, 0, 16, 16, '#d6c28a'); speck(c, rnd, 14, '#c4ae74'); speck(c, rnd, 8, '#e6d6a4'); },
    marsh(c, f, rnd) {
      R(c, 0, 0, 16, 16, '#6b7a3c'); speck(c, rnd, 14, '#58662f'); speck(c, rnd, 7, '#8a9650');
      for (let i = 0; i < 3; i++) { const x = 1 + (rnd() * 13 | 0), y = 3 + (rnd() * 11 | 0); px(c, x, y, '#4a5626'); px(c, x, y - 1, '#7f8c46'); px(c, x + 2, y, '#4a5626'); px(c, x + 2, y - 2, '#7f8c46'); }
    },
    mud(c, f, rnd) { R(c, 0, 0, 16, 16, '#5d4c34'); speck(c, rnd, 14, '#4a3c28'); speck(c, rnd, 5, '#7a6a4c'); R(c, 4 + (rnd() * 6 | 0), 5 + (rnd() * 6 | 0), 3, 1, '#8a9aa8'); },
    reeds(c, f, rnd) {
      for (let i = 0; i < 9; i++) { const x = 1 + (rnd() * 14 | 0), h = 7 + (rnd() * 7 | 0); R(c, x, 15 - h, 1, h, i % 2 ? '#7a8a3a' : '#5e6e2c'); if (rnd() < 0.5) R(c, x, 15 - h - 2, 1, 3, '#6a4a2a'); }
    },
    boardwalk(c) { R(c, 0, 0, 16, 16, '#3a2e22'); for (let x = 0; x < 16; x += 4) { R(c, x, 0, 3, 16, P.wood); R(c, x, 0, 1, 16, P.woodL); px(c, x + 1, 3, P.trunkD); px(c, x + 1, 12, P.trunkD); } },
    shallows(c, f, rnd) { R(c, 0, 0, 16, 16, '#7aa6b8'); speck(c, rnd, 10, '#9cc4cc'); speck(c, rnd, 6, '#c8b888'); R(c, (f * 5 + 2) % 12, 6, 4, 1, '#d4ecf0'); R(c, (f * 7 + 8) % 12, 11, 3, 1, '#d4ecf0'); },
    boat(c) { R(c, 1, 6, 14, 7, P.trunkD); R(c, 2, 5, 12, 6, P.wood); R(c, 3, 6, 10, 3, '#4a3a28'); R(c, 2, 5, 12, 1, P.woodL); R(c, 7, 2, 1, 4, P.trunk); R(c, 8, 2, 4, 3, P.white); },
    snow(c, f, rnd) { R(c, 0, 0, 16, 16, '#e4ecf2'); speck(c, rnd, 14, '#cdd8e2'); speck(c, rnd, 8, '#f8fbff'); },
    drift(c, f, rnd) { R(c, 0, 0, 16, 16, '#d6e2ec'); speck(c, rnd, 12, '#bccad8'); const x = 2 + (rnd() * 8 | 0), y = 4 + (rnd() * 8 | 0); R(c, x, y, 6, 2, '#f4f8fc'); R(c, x + 1, y + 2, 5, 1, '#b4c4d4'); },
    ice(c, f, rnd) {
      R(c, 0, 0, 16, 16, '#a8d0e4'); speck(c, rnd, 10, '#c8e6f2');
      let x = rnd() * 16 | 0, y = rnd() * 16 | 0; for (let i = 0; i < 7; i++) { px(c, x, y, '#86b2ca'); x += (rnd() * 3 | 0) - 1; y += 1; }
      R(c, 3, 3, 3, 1, '#e8f6fc');
    },
    frostpine(c) {
      PAINT.pine(c);
      for (let t = 0; t < 3; t++) { const y = 1 + t * 3, half = 1 + t; R(c, 8 - half, y, half * 2, 1, '#f4f8fc'); px(c, 8 - half - 1, y + 3, '#e4ecf2'); px(c, 8 + half + 1, y + 3, '#e4ecf2'); }
    },
    snowrock(c) { PAINT.rock(c); R(c, 5, 4, 6, 2, '#f4f8fc'); R(c, 4, 6, 2, 1, '#e4ecf2'); px(c, 11, 6, '#e4ecf2'); },
    iceTop(c, f, rnd) { R(c, 0, 0, 16, 16, '#4a6a84'); speck(c, rnd, 10, '#6a8aa4'); speck(c, rnd, 4, '#8aaac4'); },
    iceFace(c, f, rnd) {
      R(c, 0, 0, 16, 16, '#7aa4c4'); for (let x = 1; x < 16; x += 3) R(c, x, 3, 1, 10 + (rnd() * 3 | 0), '#a8cce4');
      R(c, 0, 0, 16, 3, '#4a6a84'); R(c, 0, 3, 16, 1, '#c8e6f2'); R(c, 0, 15, 16, 1, '#2a3a4a');
    },
    standing(c) { R(c, 3, 13, 10, 2, 'rgba(0,0,0,.22)'); R(c, 5, 1, 6, 13, P.stoneD); R(c, 5, 1, 5, 12, P.stone); R(c, 6, 1, 2, 12, P.stoneL); px(c, 8, 5, '#6a8a5a'); px(c, 7, 9, '#6a8a5a'); R(c, 5, 0, 5, 2, '#f4f8fc'); },
    snowroof(c, f, rnd) { R(c, 0, 0, 16, 16, '#c4d2e0'); for (let r = 0; r < 4; r++) for (let x = -4; x < 16; x += 4) { const o = (r % 2) * 2; R(c, x + o, r * 4 + 3, 3, 1, '#9fb4c8'); R(c, x + o, r * 4, 3, 1, '#e8f0f6'); } speck(c, rnd, 6, '#f8fbff'); if (rnd() < 0.5) px(c, rnd() * 16 | 0, rnd() * 16 | 0, P.trunkD); },
    tent(c) { for (let y = 2; y < 14; y++) { const w = y - 1; R(c, 8 - w / 2 | 0, y, w, 1, y % 3 ? '#8a6a4a' : '#7a5a3a'); } R(c, 7, 9, 2, 5, '#2a1e14'); R(c, 7, 0, 2, 3, P.trunkD); },
    runeBlank(c) { R(c, 3, 13, 10, 2, 'rgba(0,0,0,.22)'); R(c, 4, 2, 8, 12, P.stoneD); R(c, 4, 2, 7, 11, P.stone); R(c, 4, 2, 7, 1, P.stoneL); },
    runeBear(c) { PAINT.runeBlank(c); R(c, 6, 6, 4, 4, P.ink); px(c, 5, 5, P.ink); px(c, 10, 5, P.ink); R(c, 6, 10, 1, 2, P.ink); R(c, 9, 10, 1, 2, P.ink); px(c, 7, 7, '#7fd0ff'); },
    runeWolf(c) { PAINT.runeBlank(c); px(c, 5, 4, P.ink); px(c, 6, 5, P.ink); px(c, 9, 5, P.ink); px(c, 10, 4, P.ink); R(c, 6, 6, 4, 3, P.ink); R(c, 7, 9, 2, 2, P.ink); px(c, 7, 7, '#7fd0ff'); },
    runeEagle(c) { PAINT.runeBlank(c); R(c, 4, 6, 8, 1, P.ink); R(c, 5, 5, 2, 1, P.ink); R(c, 9, 5, 2, 1, P.ink); R(c, 7, 4, 2, 6, P.ink); R(c, 6, 10, 4, 1, P.ink); px(c, 7, 5, '#7fd0ff'); },
    runeStone(c) { PAINT.runeBlank(c); R(c, 6, 5, 4, 1, P.ink); R(c, 5, 6, 6, 4, P.ink); R(c, 6, 10, 4, 1, P.ink); R(c, 7, 7, 2, 2, '#7fd0ff'); },
    beacon(c) { R(c, 4, 13, 8, 2, P.stoneD); R(c, 6, 6, 4, 8, P.stone); R(c, 3, 3, 10, 3, P.ironD); R(c, 4, 4, 8, 1, P.iron); px(c, 5, 2, P.ironD); px(c, 10, 2, P.ironD); },
    beaconLit(c, f) { PAINT.beacon(c); R(c, 4, 0, 8, 4, f ? P.fire : P.fireL); R(c, 6, 0, 4, 2, f ? P.fireL : P.white); },
    bars(c) { for (let x = 1; x < 16; x += 3) R(c, x, 0, 2, 16, P.ironD); R(c, 0, 2, 16, 2, P.iron); R(c, 0, 12, 16, 2, P.iron); for (let x = 1; x < 16; x += 3) px(c, x, 0, P.iron); },
    horn(c) { R(c, 4, 9, 9, 3, P.bone); R(c, 3, 8, 3, 3, P.boneD); R(c, 11, 10, 2, 3, P.boneD); R(c, 6, 9, 1, 3, P.goldD); R(c, 9, 9, 1, 3, P.goldD); },
    cobble(c, f, rnd) {
      R(c, 0, 0, 16, 16, '#6e695f');
      for (let y = 0; y < 16; y += 4) for (let x = (y % 8 ? 2 : 0) - 4; x < 16; x += 4) { R(c, x + 1, y + 1, 3, 3, rnd() < 0.5 ? '#8a8478' : '#7e786c'); px(c, x + 1, y + 1, '#9a9488'); }
    },
    cobble2(c, f, rnd) { PAINT.cobble(c, f, rnd); speck(c, rnd, 8, '#5a6a48'); speck(c, rnd, 4, '#4a5a3a'); },
    marble(c, f, rnd) { R(c, 0, 0, 16, 16, '#d8d4cc'); R(c, 0, 15, 16, 1, '#b8b0a8'); R(c, 15, 0, 1, 16, '#b8b0a8'); let x = rnd() * 16 | 0; for (let y = 0; y < 15; y++) { px(c, x, y, '#c4bcb2'); x += (rnd() * 3 | 0) - 1; } },
    fountain(c, f) { disc(c, 8, 9, 7, P.stoneD); disc(c, 8, 9, 6, P.stone); disc(c, 8, 9, 5, P.water); R(c, 7, 2, 2, 7, P.stoneL); px(c, 6 + f, 4, P.waterL); px(c, 9 - f, 5, P.waterL); px(c, 5, 8 + f, P.waterL); px(c, 11, 9 - f, P.waterL); },
    stall(c) { for (let x = 0; x < 16; x += 4) { R(c, x, 0, 2, 5, P.red); R(c, x + 2, 0, 2, 5, P.white); } R(c, 0, 5, 16, 1, '#8a3a32'); R(c, 1, 6, 1, 6, P.trunkD); R(c, 14, 6, 1, 6, P.trunkD); R(c, 0, 10, 16, 5, P.wood); R(c, 0, 10, 16, 1, P.woodL); px(c, 4, 9, P.gold); px(c, 9, 9, '#7ac84a'); px(c, 11, 9, P.red); },
    sewer(c, f, rnd) { R(c, 0, 0, 16, 16, '#3a4a3a'); speck(c, rnd, 10, '#2a3a2a'); R(c, (f * 5 + 2) % 12, 5, 4, 1, '#5a6a50'); R(c, (f * 7 + 8) % 12, 11, 3, 1, '#5a6a50'); },
    nicheFace(c, f, rnd) {
      PAINT.wallFace(c);
      for (const x of [2, 9]) { R(c, x, 6, 5, 6, P.black); R(c, x + 1, 8, 3, 3, P.bone); px(c, x + 1, 9, P.ink); px(c, x + 3, 9, P.ink); if (rnd() < 0.5) R(c, x + 1, 11, 3, 1, P.boneD); }
    },
    skulls(c) { for (const [x, y] of [[3, 10], [8, 11], [12, 10], [5, 7], [10, 7], [7, 4]]) { R(c, x, y, 3, 3, P.bone); px(c, x, y + 1, P.ink); px(c, x + 2, y + 1, P.ink); px(c, x + 1, y + 2, P.boneD); } },
    coffin(c) { R(c, 4, 1, 8, 14, P.trunkD); R(c, 5, 2, 6, 12, P.trunk); R(c, 7, 4, 2, 6, P.goldD); R(c, 6, 6, 4, 1, P.goldD); },
    coins(c) { disc(c, 8, 11, 5, P.goldD); disc(c, 8, 10, 4, P.gold); px(c, 6, 8, P.fireL); px(c, 10, 9, P.fireL); R(c, 3, 13, 3, 1, P.gold); R(c, 11, 12, 3, 1, P.gold); },
    papers(c) { R(c, 1, 2, 14, 12, P.trunkD); for (let y = 3; y < 13; y += 3) { R(c, 2, y, 12, 2, '#e8e0c8'); R(c, 2, y + 1, 12, 1, '#c8c0a8'); } R(c, 5, 3, 1, 10, P.red); },
    hedge(c, f, rnd) { R(c, 0, 1, 16, 14, P.leafD); speck(c, rnd, 18, P.leaf); speck(c, rnd, 6, P.leafL); },
    banner(c) { PAINT.wallFace(c); R(c, 4, 1, 8, 13, '#7a1e2a'); R(c, 4, 1, 8, 1, P.gold); R(c, 7, 4, 2, 4, P.gold); R(c, 6, 5, 4, 1, P.goldD); R(c, 4, 13, 2, 2, '#7a1e2a'); R(c, 10, 13, 2, 2, '#7a1e2a'); },
    gearwork(c, f) { R(c, 0, 0, 16, 16, P.ironD); disc(c, 6, 6, 4, P.iron); disc(c, 6, 6, 1, P.ink); disc(c, 11, 11, 3, P.goldD); disc(c, 11, 11, 1, P.ink); px(c, 6 + (f ? 3 : -3), 6, P.iron); px(c, 6, 6 + (f ? 3 : -3), P.iron); },
    ash(c, f, rnd) { R(c, 0, 0, 16, 16, '#5a4e48'); speck(c, rnd, 14, '#4a403a'); speck(c, rnd, 8, '#6e625a'); },
    cinder(c, f, rnd) { R(c, 0, 0, 16, 16, '#4a403c'); speck(c, rnd, 16, '#3a302c'); speck(c, rnd, 3, '#8a4a2a'); },
    ember(c, f, rnd) { PAINT.cinder(c, f, rnd); let x = 2 + (rnd() * 4 | 0), y = 2; for (let i = 0; i < 10; i++) { px(c, x, y, f ? P.fire : '#c84a1a'); x += (rnd() * 3 | 0) - 1; y += 1; if (x < 1) x = 1; if (x > 14) x = 14; } px(c, 9, 6, P.fireL); },
    deadtree(c, f, rnd) { R(c, 3, 13, 10, 2, 'rgba(0,0,0,.25)'); R(c, 7, 4, 2, 11, '#2a2220'); R(c, 4, 6, 3, 1, '#2a2220'); R(c, 4, 4, 1, 2, '#2a2220'); R(c, 9, 7, 4, 1, '#2a2220'); R(c, 12, 5, 1, 2, '#2a2220'); R(c, 6, 2, 1, 2, '#2a2220'); },
    waylamp(c) { R(c, 7, 4, 2, 11, P.ironD); R(c, 5, 14, 6, 1, P.ironD); R(c, 4, 0, 8, 5, P.ironD); R(c, 5, 1, 6, 3, '#2a2a30'); },
    waylampLit(c, f) { PAINT.waylamp(c); R(c, 5, 1, 6, 3, f ? P.fire : P.fireL); px(c, 3, 2, P.fireL); px(c, 12, 2, P.fireL); },
    obsidianTop(c, f, rnd) { R(c, 0, 0, 16, 16, '#1a1420'); speck(c, rnd, 8, '#2a2034'); speck(c, rnd, 3, '#4a3a5a'); },
    obsidianFace(c, f, rnd) { R(c, 0, 0, 16, 16, '#2a2034'); for (let x = 2; x < 16; x += 5) R(c, x, 4, 1, 10, '#3a2e48'); R(c, 0, 0, 16, 3, '#1a1420'); R(c, 0, 3, 16, 1, '#4a3a5a'); R(c, 0, 15, 16, 1, P.black); },
    kingdoor(c) { R(c, 0, 0, 16, 16, '#2a2034'); R(c, 2, 1, 12, 15, '#3a2a14'); R(c, 7, 1, 2, 15, '#1a1408'); R(c, 4, 6, 2, 2, P.goldD); R(c, 10, 6, 2, 2, P.goldD); R(c, 6, 2, 4, 2, P.gold); px(c, 7, 9, P.fireL); px(c, 8, 9, P.fireL); },
    mirror(c, f) { R(c, 3, 13, 10, 2, 'rgba(0,0,0,.25)'); R(c, 3, 1, 10, 13, P.goldD); R(c, 4, 2, 8, 11, f ? '#8a9ab8' : '#9aaac8'); R(c, 5, 3, 2, 6, '#d8e0f0'); R(c, 6, 14, 4, 1, P.goldD); },
    net(c) { for (let i = 1; i < 15; i += 3) { R(c, i, 3, 1, 11, '#a89a7a'); R(c, 1, i, 14, 1, '#a89a7a'); } px(c, 4, 4, '#c8443c'); px(c, 13, 10, '#c8443c'); },
    lighthouse(c) { R(c, 4, 13, 8, 3, P.stoneD); R(c, 5, 2, 6, 12, P.white); R(c, 5, 5, 6, 2, P.red); R(c, 5, 10, 6, 2, P.red); R(c, 4, 0, 8, 3, P.ironD); R(c, 6, 1, 4, 1, '#3a3a44'); },
    lighthouseLit(c, f) { PAINT.lighthouse(c); R(c, 6, 0, 4, 2, f ? P.fireL : P.gold); px(c, 3, 1, P.fireL); px(c, 12, 1, P.fireL); },
    bell(c) { R(c, 2, 1, 12, 1, P.trunkD); R(c, 7, 2, 2, 2, P.ironD); R(c, 5, 4, 6, 7, '#a8782a'); R(c, 4, 9, 8, 3, '#a8782a'); R(c, 5, 4, 2, 7, '#c8984a'); R(c, 7, 12, 2, 2, P.ironD); R(c, 3, 13, 10, 2, P.stoneD); },
    bellRung(c) { PAINT.bell(c); px(c, 2, 6, P.fireL); px(c, 13, 6, P.fireL); px(c, 1, 9, P.fireL); px(c, 14, 9, P.fireL); R(c, 5, 4, 2, 7, '#f0c870'); },
    drowned(c) { R(c, 3, 9, 10, 4, '#3a4a4a'); R(c, 2, 8, 4, 3, '#a9b8a2'); px(c, 3, 9, P.ink); R(c, 7, 10, 6, 1, '#5a6a6a'); px(c, 12, 12, '#a9b8a2'); },
    coatstand(c) { R(c, 7, 1, 2, 14, P.trunkD); R(c, 4, 14, 8, 2, P.trunkD); R(c, 4, 3, 8, 8, '#6a4a2a'); R(c, 5, 3, 6, 1, '#8a6a42'); R(c, 4, 11, 3, 2, '#6a4a2a'); R(c, 9, 11, 3, 2, '#6a4a2a'); R(c, 7, 4, 2, 7, '#5a3a1e'); R(c, 10, 6, 2, 2, P.white); },
    coatEmpty(c) { R(c, 7, 1, 2, 14, P.trunkD); R(c, 4, 14, 8, 2, P.trunkD); R(c, 5, 2, 6, 1, P.trunkD); px(c, 5, 3, P.trunkD); px(c, 10, 3, P.trunkD); },
    stump(c) { R(c, 3, 13, 10, 2, 'rgba(0,0,0,.22)'); R(c, 4, 8, 8, 6, P.trunk); R(c, 4, 8, 1, 6, P.trunkD); R(c, 4, 6, 8, 3, P.woodL); R(c, 6, 7, 4, 1, P.wood); }
  };

  /* ---------- characters ----------
     A spec (D.sprites, plus any D.looks details) is drawn facing down, left or up; right is left mirrored. */
  const BROWN = '#6b4a2b', STEEL = '#a8aab4', STEEL_L = '#e8ecf4';
  function held(c, s, dir) {
    const k = s.held; if (!k) return;
    const f = dir === 'left' ? -1 : 1, hx = dir === 'left' ? 3 : 13, hy = 12, x0 = n => f > 0 ? hx + n : hx - n;
    if (k === 'pack') {
      if (dir === 'up') { R(c, 5, 8, 6, 5, '#8a6a42'); R(c, 5, 8, 6, 1, '#a8854f'); R(c, 7, 10, 2, 1, P.goldD); }
      else if (dir === 'left') R(c, 10, 8, 3, 5, '#8a6a42');
      else { R(c, 4, 8, 1, 4, '#6b4a2b'); R(c, 11, 8, 1, 4, '#6b4a2b'); }
      return;
    }
    if (k === 'shield') {
      if (dir === 'down') { R(c, 10, 8, 5, 6, '#8a5d38'); R(c, 10, 8, 5, 1, '#bf8a5c'); px(c, 12, 10, P.gold); }
      else if (dir === 'left') { R(c, 2, 8, 3, 6, '#8a5d38'); px(c, 3, 10, P.gold); }
      else { R(c, 5, 8, 6, 6, '#8a5d38'); R(c, 7, 8, 2, 6, '#bf8a5c'); }
      return;
    }
    if (dir === 'up' && ['lantern', 'book', 'scroll', 'ladle', 'dagger'].indexOf(k) >= 0) return;   // held in front, out of sight
    if (k === 'axe') { R(c, hx, hy - 7, 1, 10, BROWN); R(c, f > 0 ? hx + 1 : hx - 2, hy - 8, 2, 4, STEEL); px(c, x0(2), hy - 8, STEEL_L); }
    else if (k === 'dagger') { R(c, hx, hy - 3, 1, 3, STEEL_L); px(c, hx, hy, BROWN); px(c, x0(1), hy - 1, P.goldD); }
    else if (k === 'sword') { R(c, hx, hy - 9, 1, 9, STEEL_L); R(c, hx - 1, hy - 1, 3, 1, P.goldD); px(c, hx, hy, BROWN); }
    else if (k === 'mace') { R(c, hx, hy - 5, 1, 7, BROWN); R(c, hx - 1, hy - 7, 3, 3, STEEL); px(c, hx, hy - 8, STEEL_L); }
    else if (k === 'hammer') { R(c, hx, hy - 6, 1, 8, BROWN); R(c, hx - 1, hy - 8, 3, 2, P.ironD); }
    else if (k === 'spade') { R(c, hx, hy - 8, 1, 10, BROWN); R(c, hx - 1, hy + 1, 3, 3, STEEL); R(c, hx - 1, hy - 9, 3, 1, BROWN); }
    else if (k === 'club') { R(c, hx, hy - 5, 1, 6, BROWN); R(c, hx - 1, hy - 9, 2, 5, '#8a6a42'); px(c, hx, hy - 8, '#a8854f'); }
    else if (k === 'staff') { R(c, hx, hy - 10, 1, 14, BROWN); R(c, hx - 1, hy - 12, 3, 2, s.gem || P.gold); px(c, hx, hy - 12, P.white); }
    else if (k === 'spear') { R(c, hx, hy - 10, 1, 14, BROWN); R(c, hx, 0, 1, 3, STEEL_L); px(c, hx - 1, 2, STEEL); px(c, hx + 1, 2, STEEL); }
    else if (k === 'pitchfork') { R(c, hx, hy - 9, 1, 12, BROWN); R(c, hx - 1, hy - 10, 3, 1, STEEL); px(c, hx - 1, hy - 11, STEEL); px(c, hx, hy - 11, STEEL); px(c, hx + 1, hy - 11, STEEL); }
    else if (k === 'bow') { R(c, x0(1), hy - 7, 1, 8, BROWN); px(c, hx, hy - 8, BROWN); px(c, hx, hy + 1, BROWN); R(c, hx, hy - 7, 1, 8, '#e8e0cc'); }
    else if (k === 'rod') { R(c, hx, hy - 10, 1, 12, '#8a6a42'); R(c, x0(1), hy - 10, 1, 7, '#c8ccd8'); }
    else if (k === 'lute') { R(c, hx - 1, hy - 2, 3, 4, '#a8754a'); px(c, hx, hy - 1, '#4e3520'); R(c, hx, hy - 7, 1, 5, BROWN); px(c, hx, hy - 8, '#4e3520'); }
    else if (k === 'lantern') { px(c, hx, hy - 1, P.ironD); R(c, hx - 1, hy, 3, 3, P.ironD); px(c, hx, hy + 1, s.gem || P.fireL); }
    else if (k === 'book') { R(c, hx - 1, hy - 2, 3, 4, '#7a2f2f'); R(c, hx - 1, hy - 2, 1, 4, '#5a1f1f'); px(c, hx + (f > 0 ? 1 : -1), hy - 1, P.white); }
    else if (k === 'scroll') { R(c, hx - 1, hy - 2, 3, 3, '#f4f1e6'); px(c, hx - 1, hy - 2, '#c8b88a'); px(c, hx + 1, hy, '#c8b88a'); }
    else if (k === 'ladle') { R(c, hx, hy - 4, 1, 5, STEEL); R(c, hx - 1, hy - 6, 2, 2, STEEL); }
  }
  function drawChar(c, s0, dir, f) {
    if (dir === 'right') { c.save(); c.translate(16, 0); c.scale(-1, 1); drawChar(c, s0, 'left', f); c.restore(); return; }
    const s = s0;
    c.save();
    if (s.short) c.translate(0, 2);
    const sk = s.skel ? P.bone : (s.skin || '#e8b890');
    const hr = s.bald ? sk : (s.hair || '#4a3020');
    const tp = s.skel ? '#3a3440' : (s.top || '#3a6ea5'), tpD = shade(tp.startsWith('#') ? tp : '#3a3440', -34);
    const lg = s.skel ? P.boneD : (s.legs || '#3b3340');
    const eye = s.eyes || P.ink, side = dir === 'left', mc = s.mus === 1 || s.goatee === 1 ? (s.bald && s.hair ? s.hair : hr) : (s.mus || s.goatee);
    const bw = s.big ? 1 : 0;
    // a cape hangs behind
    if (s.cape && dir === 'down') R(c, 3 - bw, 8, 10 + bw * 2, 7, shade(s.cape, -20));
    if (s.cape && side) R(c, 9, 8, 3, 7, s.cape);
    // legs or robe
    if (s.robe) {
      R(c, side ? 5 : 4, 12, side ? 6 : 8, 4, tp); R(c, side ? 5 : 4, 15, side ? 6 : 8, 1, tpD);
      if (f === 1) R(c, 4, 15, 3, 1, tp); else if (f === 2) R(c, 9, 15, 3, 1, tp);
    } else if (side) {
      if (f === 0) R(c, 6, 13, 3, 3, lg);
      else if (f === 1) { R(c, 4, 13, 2, 3, lg); R(c, 9, 13, 2, 2, lg); R(c, 6, 13, 3, 1, lg); }
      else { R(c, 5, 13, 2, 2, lg); R(c, 8, 13, 2, 3, lg); R(c, 6, 13, 3, 1, lg); }
    } else {
      R(c, 5, 13, 2, f === 1 ? 2 : 3, lg); R(c, 9, 13, 2, f === 2 ? 2 : 3, lg);
    }
    // body
    const arm = s.sleeves || tp;
    if (side) {
      R(c, 5 - bw, 8, 6 + bw, 5, tp); R(c, 7, 9, 2, 3, s.sleeves || tpD); R(c, 7, 12, 2, 1, sk);
      if (!s.robe) R(c, 5, 12, 2, 1, tpD), R(c, 9, 12, 2, 1, tpD);
    } else {
      R(c, 4 - bw, 8, 8 + bw * 2, 5, tp); R(c, 3 - bw, 8, 1, 4, arm); R(c, 12 + bw, 8, 1, 4, arm); px(c, 3 - bw, 12, sk); px(c, 12 + bw, 12, sk);
      if (!s.robe) R(c, 4 - bw, 12, 8 + bw * 2, 1, tpD);
    }
    const bx = side ? 5 - bw : 4 - bw, bwid = side ? 6 + bw : 8 + bw * 2;
    if (s.stripe) { R(c, bx, 9, bwid, 1, s.stripe); R(c, bx, 11, bwid, 1, s.stripe); }
    if (s.apron && dir !== 'up') { if (side) R(c, 5 - bw, 9, 2, 5, s.apron); else R(c, 5, 9, 6, 5, s.apron); }
    if (s.skel) { if (side) { R(c, 5, 9, 6, 1, P.bone); R(c, 5, 11, 6, 1, P.bone); } else { R(c, 5, 9, 6, 1, P.bone); R(c, 5, 11, 6, 1, P.bone); px(c, 3, 9, P.bone); px(c, 12, 9, P.bone); px(c, 3, 11, P.bone); px(c, 12, 11, P.bone); } }
    if (s.trim && !side) R(c, 7, 8, 2, 5, s.trim);
    if (s.belt) { R(c, bx, 11, bwid, 1, s.belt); if (!side && dir !== 'up') px(c, 7, 11, P.gold); }
    if (s.cape && dir === 'up') { R(c, 4 - bw, 8, 8 + bw * 2, 7, s.cape); R(c, 4 - bw, 8, 8 + bw * 2, 1, shade(s.cape, 24)); }
    if (s.fur) { if (side) R(c, 6, 8, 4, 2, s.fur); else { R(c, 3 - bw, 8, 3, 2, s.fur); R(c, 10 + bw, 8, 3, 2, s.fur); } }
    if (s.scarf) { if (side) { R(c, 5, 8, 6, 1, s.scarf); px(c, 10, 9, s.scarf); } else R(c, 4, 8, 8, 1, s.scarf); }
    if (dir === 'up') held(c, s, dir);
    // head
    if (dir === 'down') {
      if (s.hs === 'curly') { R(c, 3, 1, 10, 3, hr); px(c, 3, 4, hr); px(c, 12, 4, hr); }
      R(c, 4, 2, 8, 6, sk); R(c, 4, 1, 8, 2, hr); px(c, 4, 3, hr); px(c, 11, 3, hr);
      if (s.skel) { R(c, 5, 4, 2, 2, P.ink); R(c, 9, 4, 2, 2, P.ink); px(c, 7, 7, P.ink); px(c, 9, 7, P.ink); }
      else {
        if (s.glasses) R(c, 5, 5, 6, 1, '#c8ccd8');
        px(c, 6, 5, eye); px(c, 9, 5, eye);
        if (s.patch) { px(c, 6, 5, P.ink); R(c, 4, 4, 8, 1, P.ink); }
        if (s.scar) { px(c, 9, 4, '#b0504a'); px(c, 10, 6, '#b0504a'); }
      }
      if (s.long && s.hs !== 'braids' && s.hs !== 'bun' && s.hs !== 'pony') { R(c, 3, 3, 1, 6, hr); R(c, 12, 3, 1, 6, hr); }
      if (s.hs === 'braids') { R(c, 3, 3, 1, 8, hr); R(c, 12, 3, 1, 8, hr); px(c, 3, 10, P.goldD); px(c, 12, 10, P.goldD); }
      if (s.hs === 'bun') R(c, 6, 0, 4, 1, hr);
      if (s.hs === 'spiky') { px(c, 4, 0, hr); px(c, 6, 0, hr); px(c, 9, 0, hr); px(c, 11, 0, hr); }
      if (s.hs === 'mohawk') R(c, 7, 0, 2, 2, hr);
      if (s.beard) { R(c, 5, 7, 6, 2, hr); px(c, 4, 6, hr); px(c, 11, 6, hr); }
      if (s.mus) R(c, 5, 6, 6, 1, mc);
      if (s.goatee) R(c, 7, 7, 2, 2, mc);
      if (s.ears) { px(c, 3, 4, sk); px(c, 2, 3, sk); px(c, 12, 4, sk); px(c, 13, 3, sk); }
      if (s.hood) { R(c, 3, 1, 10, 2, s.hood); R(c, 3, 3, 2, 5, s.hood); R(c, 11, 3, 2, 5, s.hood); }
    } else if (dir === 'up') {
      if (s.hs === 'curly') R(c, 3, 1, 10, 7, hr);
      R(c, 4, 1, 8, 6, hr); R(c, 5, 7, 6, 1, sk);
      if (s.long && s.hs !== 'braids' && s.hs !== 'bun' && s.hs !== 'pony') R(c, 3, 2, 10, 7, hr);
      if (s.hs === 'braids') { R(c, 5, 7, 1, 5, hr); R(c, 10, 7, 1, 5, hr); px(c, 5, 11, P.goldD); px(c, 10, 11, P.goldD); }
      if (s.hs === 'pony') { R(c, 7, 6, 2, 5, hr); px(c, 7, 6, P.goldD); }
      if (s.hs === 'bun') R(c, 6, 1, 4, 3, shade(hr.startsWith('#') ? hr : '#4a3020', -16));
      if (s.hs === 'spiky') { px(c, 4, 0, hr); px(c, 6, 0, hr); px(c, 9, 0, hr); px(c, 11, 0, hr); }
      if (s.hs === 'mohawk') { R(c, 4, 1, 8, 6, sk); R(c, 7, 0, 2, 7, hr); }
      if (s.ears) { px(c, 3, 4, sk); px(c, 2, 3, sk); px(c, 12, 4, sk); px(c, 13, 3, sk); }
      if (s.hood) R(c, 3, 1, 10, 7, s.hood);
    } else {
      if (s.hs === 'curly') R(c, 5, 1, 8, 3, hr);
      R(c, 5, 2, 7, 6, sk); R(c, 5, 1, 7, 2, hr); R(c, 9, 3, 3, 4, hr);
      if (s.skel) { R(c, 6, 4, 2, 2, P.ink); px(c, 6, 7, P.ink); }
      else {
        if (s.glasses) R(c, 5, 5, 3, 1, '#c8ccd8');
        px(c, 6, 5, eye);
        if (s.patch) { px(c, 6, 5, P.ink); R(c, 6, 4, 6, 1, P.ink); }
        if (s.scar) { px(c, 7, 4, '#b0504a'); px(c, 7, 6, '#b0504a'); }
      }
      if (s.long && s.hs !== 'braids' && s.hs !== 'bun' && s.hs !== 'pony') R(c, 9, 3, 3, 6, hr);
      if (s.hs === 'braids') { R(c, 10, 4, 1, 7, hr); px(c, 10, 10, P.goldD); }
      if (s.hs === 'pony') { R(c, 12, 3, 1, 2, hr); R(c, 12, 5, 1, 4, hr); px(c, 12, 4, P.goldD); }
      if (s.hs === 'bun') R(c, 11, 1, 2, 3, hr);
      if (s.hs === 'spiky') { px(c, 6, 0, hr); px(c, 8, 0, hr); px(c, 10, 0, hr); }
      if (s.hs === 'mohawk') { R(c, 5, 1, 7, 2, sk); R(c, 6, 0, 6, 2, hr); }
      if (s.beard) R(c, 5, 6, 3, 3, hr);
      if (s.mus) R(c, 4, 6, 3, 1, mc);
      if (s.goatee) R(c, 5, 7, 2, 2, mc);
      if (s.ears) { px(c, 11, 4, sk); px(c, 12, 3, sk); }
      if (s.hood) { R(c, 5, 1, 8, 2, s.hood); R(c, 8, 3, 5, 5, s.hood); }
    }
    if (s.hat) { R(c, s.brim ? 2 : 3, 2, s.brim ? 12 : 10, 1, s.hat); R(c, 5, 0, 6, 2, s.hat); if (s.feather) { px(c, 11, 0, s.feather); px(c, 12, 0, s.feather); px(c, 12, 1, s.feather); } }
    if (s.cap) { R(c, 4, 1, 8, 2, s.cap); if (dir === 'down') R(c, 4, 3, 8, 1, shade(s.cap, -30)); else if (side) R(c, 3, 3, 4, 1, shade(s.cap, -30)); }
    if (s.helm) { R(c, 4, 0, 8, 3, s.helm); R(c, 3, 2, 10, 1, s.helm); if (s.horns) { px(c, 3, 0, P.bone); px(c, 2, 0, P.bone); px(c, 12, 0, P.bone); px(c, 13, 0, P.bone); px(c, 3, 1, P.bone); px(c, 12, 1, P.bone); } }
    if (s.crown) { R(c, 4, 1, 8, 1, s.crown); px(c, 4, 0, s.crown); px(c, 7, 0, s.crown); px(c, 8, 0, s.crown); px(c, 11, 0, s.crown); if (dir === 'down') px(c, 7, 1, P.red); }
    if (s.circlet) { R(c, side ? 5 : 4, 2, side ? 7 : 8, 1, s.circlet); if (dir === 'down') px(c, 7, 2, '#7fd0ff'); }
    if (dir !== 'up') held(c, s, dir);
    c.restore();
  }
  function outline(cv) {
    const c = cv.getContext('2d'), w = cv.width, h = cv.height;
    const im = c.getImageData(0, 0, w, h), d = im.data, src = new Uint8ClampedArray(d);
    const a = (x, y) => (x >= 0 && y >= 0 && x < w && y < h) ? src[(y * w + x) * 4 + 3] : 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (a(x, y) < 128 && (a(x - 1, y) > 127 || a(x + 1, y) > 127 || a(x, y - 1) > 127 || a(x, y + 1) > 127)) {
        const i = (y * w + x) * 4; d[i] = 26; d[i + 1] = 20; d[i + 2] = 32; d[i + 3] = 255;
      }
    }
    c.putImageData(im, 0, 0);
  }
  function cell() { const cv = document.createElement('canvas'); cv.width = cv.height = T; return cv; }
  const DIRS = { down: 0, left: 1, right: 2, up: 3 };

  function build() {
    atlas = document.createElement('canvas'); atlas.width = COLS * T; atlas.height = 16 * T; actx = atlas.getContext('2d');
    let seed = 1;
    for (const id in G.D.tiles) {
      const d = G.D.tiles[id], fr = d.anim || 1, v = d.v || 1, cells = [];
      for (let vi = 0; vi < v; vi++) for (let f = 0; f < fr; f++) {
        const cx = (next % COLS) * T, cy = Math.floor(next / COLS) * T; next++;
        actx.save(); actx.translate(cx, cy); actx.beginPath(); actx.rect(0, 0, T, T); actx.clip();
        (PAINT[d.paint || id] || PAINT.missing)(actx, f, mulberry(seed * 7919 + vi * 131 + 5));
        actx.restore(); cells.push([cx, cy]);
      }
      seed++; tiles[id] = { cells, fr, v };
    }
    for (const name in G.D.sprites) {
      const sheet = document.createElement('canvas'); sheet.width = 48; sheet.height = 64;
      const sc = sheet.getContext('2d');
      const spec = Object.assign({}, G.D.sprites[name], (G.D.looks || {})[name]);
      for (const dir in DIRS) for (let f = 0; f < 3; f++) {
        const cv = cell(); drawChar(cv.getContext('2d', { willReadFrequently: true }), spec, dir, f); outline(cv);
        sc.drawImage(cv, f * 16, DIRS[dir] * 16);
      }
      sprites[name] = sheet;
    }
    for (const name in G.D.pix) {
      const p = G.D.pix[name], cv = cell(), c = cv.getContext('2d', { willReadFrequently: true });
      p.rows.forEach((row, y) => { for (let x = 0; x < row.length && x < 16; x++) { const col = p.pal[row[x]]; if (col) px(c, x, y, col); } });
      outline(cv); pix[name] = cv;
    }
  }
  function drawTile(c, id, x, y, hash) {
    const t = tiles[id]; if (!t) return;
    const f = t.fr > 1 ? Math.floor(G.time / 380) % t.fr : 0;
    const vi = t.v > 1 ? (hash || 0) % t.v : 0;
    const cl = t.cells[vi * t.fr + f];
    c.drawImage(atlas, cl[0], cl[1], T, T, x, y, T, T);
  }
  // Draws a character sheet frame, or a beast if the name is a pixel sprite.
  function drawSprite(c, name, dir, frame, x, y, scale) {
    scale = scale || 1;
    const sh = sprites[name];
    if (sh) { c.drawImage(sh, (frame || 0) * 16, DIRS[dir || 'down'] * 16, 16, 16, x, y, 16 * scale, 16 * scale); return; }
    const p = pix[name];
    if (p) {
      if (dir === 'left') { c.save(); c.translate(x + 16 * scale, y); c.scale(-1, 1); c.drawImage(p, 0, 0, 16, 16, 0, 0, 16 * scale, 16 * scale); c.restore(); }
      else c.drawImage(p, 0, 0, 16, 16, x, y, 16 * scale, 16 * scale);
    }
  }
  // The average colour of a tile's first cell, as [r, g, b] (used by the battle board and the map).
  const avg = {};
  function avgColor(id) {
    if (avg[id]) return avg[id];
    const t = tiles[id]; if (!t) return (avg[id] = [90, 90, 90]);
    const tmp = document.createElement('canvas'); tmp.width = tmp.height = T;
    const tc = tmp.getContext('2d', { willReadFrequently: true }); tc.drawImage(atlas, t.cells[0][0], t.cells[0][1], T, T, 0, 0, T, T);
    const d = tc.getImageData(0, 0, T, T).data; let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 100) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
    return (avg[id] = n ? [r / n | 0, g / n | 0, b / n | 0] : [20, 18, 26]);
  }
  // An object drawn so it stands out from any ground. style 'pop' (something you can use): a dark outline, a light rim
  // along the top and a soft shadow. 'furn' (furniture): the outline and the shadow. 'wall' (set against a wall): the
  // outline only. Each style and animation frame is built once and kept.
  const popped = {};
  function drawThing(c, id, x, y, style) {
    style = style || 'pop';
    const t = tiles[id]; if (!t) return;
    const f = t.fr > 1 ? Math.floor(G.time / 380) % t.fr : 0, key = id + '|' + style + '|' + f;
    let cv = popped[key];
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = cv.height = T + 4;
      const raw = document.createElement('canvas'); raw.width = raw.height = T;
      const cl = t.cells[f] || t.cells[0];
      const rc = raw.getContext('2d', { willReadFrequently: true }); rc.drawImage(atlas, cl[0], cl[1], T, T, 0, 0, T, T);
      const src = rc.getImageData(0, 0, T, T).data, a = (xx, yy) => (xx >= 0 && yy >= 0 && xx < T && yy < T) ? src[(yy * T + xx) * 4 + 3] : 0;
      const oc = cv.getContext('2d');
      if (style !== 'wall') { oc.fillStyle = style === 'pop' ? 'rgba(0,0,0,.28)' : 'rgba(0,0,0,.32)'; oc.beginPath(); oc.ellipse(T / 2 + 2, T + 1, 6.5, 2, 0, 0, 6.283); oc.fill(); }
      oc.fillStyle = style === 'pop' ? '#120c18' : 'rgba(18,12,24,.85)';
      for (let yy = -1; yy <= T; yy++) for (let xx = -1; xx <= T; xx++) {
        if (a(xx, yy) > 100) continue;
        if (a(xx - 1, yy) > 100 || a(xx + 1, yy) > 100 || a(xx, yy - 1) > 100 || a(xx, yy + 1) > 100) oc.fillRect(xx + 2, yy + 2, 1, 1);
      }
      oc.drawImage(raw, 2, 2);
      if (style === 'pop') for (let yy = 0; yy < T; yy++) for (let xx = 0; xx < T; xx++) if (a(xx, yy) > 100 && a(xx, yy - 1) <= 100) { oc.fillStyle = 'rgba(255,248,225,.55)'; oc.fillRect(xx + 2, yy + 2, 1, 1); }
      popped[key] = cv;
    }
    c.drawImage(cv, x - 2, y - 2);
  }
  // Part of a tile (for a chimney breast cut from a wall tile, and the like).
  function drawTilePart(c, id, sx, sy, sw, sh, x, y) { const t = tiles[id]; if (!t) return; const cl = t.cells[0]; c.drawImage(atlas, cl[0] + sx, cl[1] + sy, sw, sh, x, y, sw, sh); }
  return { build, drawTile, drawThing, drawTilePart, drawSprite, avgColor, P, tiles, sprites, pix, has: n => !!(sprites[n] || pix[n]) };
})();
