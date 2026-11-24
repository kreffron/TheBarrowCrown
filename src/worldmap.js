/* The map screen (Menu > Map). Area: the current place as a mini-map of the squares explored so far, with exits.
   Region: a drawn map of the whole land, with every place found so far on it, the roads between, and cloud over the
   parts not yet reached. Exploration is tracked in src/field.js (Field.reveal). */
(function () {
  const W = 424, H = 344;
  const thingsOf = def => Object.entries(def.things || {}).flatMap(([ch, t]) => (Array.isArray(t) ? t : [t]).map(d => [ch, d]));
  const where = (def, ch) => { for (let y = 0; y < def.rows.length; y++) { const x = def.rows[y].indexOf(ch); if (x >= 0) return [x, y]; } return null; };
  const known = () => Object.keys(G.S.seen || {}).filter(id => G.D.maps[id]);
  const nameOf = id => (G.D.maps[id] && G.D.maps[id].name) || id;
  const rgb = (a, d) => 'rgb(' + a.map(v => Math.max(0, Math.min(255, v + (d || 0)))).join(',') + ')';
  // The visible exits of the current map: [{ x, y, to, edge }].
  function exits() {
    const m = Field.map, out = [];
    for (const th of m.things) {
      if (th.def.type !== 'warp' || !th.def.to || !Field.visible(th)) continue;
      const edge = th.x <= 1 || th.y <= 1 || th.x >= m.w - 2 || th.y >= m.h - 2;
      out.push({ x: th.x, y: th.y, to: th.def.to, edge });
    }
    return out;
  }
  function label(c, text, x, y, col) {
    c.font = 'bold 15px ui-monospace, Menlo, Consolas, monospace';
    const w = c.measureText(text).width + 8;
    x = Math.max(2, Math.min(W - w - 2, x - w / 2)); y = Math.max(2, Math.min(H - 20, y));
    c.fillStyle = 'rgba(10,10,24,.85)'; c.fillRect(x, y, w, 19); c.strokeStyle = col; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, w - 1, 18);
    c.fillStyle = col; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText(text, x + 4, y + 2);
  }
  Menu.drawArea = function (cv) {
    const c = cv.getContext('2d'), m = Field.map, bits = Field.seenBits || new Uint8Array(m.w * m.h);
    c.fillStyle = '#07060b'; c.fillRect(0, 0, W, H);
    const cell = Math.max(2, Math.min(Math.floor(W / m.w), Math.floor((H - 24) / m.h))), ox = Math.floor((W - cell * m.w) / 2), oy = 22 + Math.floor((H - 24 - cell * m.h) / 2);
    let seen = 0;
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      if (!bits[y * m.w + x]) continue; seen++;
      const t = m.t[y][x], td = G.D.tiles[t] || {};
      c.fillStyle = rgb(G.gfx.avgColor(t), td.solid ? -45 : 0); c.fillRect(ox + x * cell, oy + y * cell, cell, cell);
    }
    const drawn = [];                                              // one label for exits side by side that lead to the same place
    for (const e of exits()) {
      if (!bits[e.y * m.w + e.x]) continue;
      const px = ox + e.x * cell + cell / 2, py = oy + e.y * cell + cell / 2, been = !!(G.S.seen || {})[e.to];
      c.fillStyle = '#ffd24a'; c.fillRect(px - 3, py - 3, 7, 7); c.fillStyle = '#1a1420'; c.fillRect(px - 1, py - 1, 3, 3);
      if (e.edge && !drawn.some(q => q[0] === e.to && Math.abs(q[1] - e.x) + Math.abs(q[2] - e.y) <= 3)) { drawn.push([e.to, e.x, e.y]); label(c, (been ? nameOf(e.to) : '???'), px, py + (e.y >= m.h - 2 ? -24 : 7), been ? '#ffd24a' : '#9cc4ff'); }
    }
    for (const th of m.things) {                                   // prayer places (gold) and venues (rose), dim once used
      const sc = th.def.abil && th.def.abil.script && th.def.abil.script[0]; if (!sc || (sc[0] !== 'pray' && sc[0] !== 'busk') || !bits[th.y * m.w + th.x]) continue;
      const px = ox + th.x * cell + cell / 2, py = oy + th.y * cell + cell / 2, used = G.flag(sc[0] + '.' + sc[1]);
      c.globalAlpha = used ? 0.45 : 1; c.fillStyle = sc[0] === 'pray' ? '#ffe07a' : '#f08aa6';
      const r = Math.max(4.5, Math.min(11, cell * 0.42));
      c.beginPath(); c.arc(px, py, r, 0, 7); c.fill(); c.strokeStyle = '#1a1420'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#1a1420'; c.font = 'bold ' + Math.round(r * 1.7) + 'px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sc[0] === 'pray' ? '+' : '♪', px, py + 0.5);
      c.globalAlpha = 1;
    }
    const p = Field.p, blink = Math.floor(Date.now() / 300) % 2;
    c.fillStyle = blink ? '#ffffff' : '#ff5a4a'; c.fillRect(ox + p.x * cell - 1, oy + p.y * cell - 1, cell + 2, cell + 2);
    c.font = 'bold 16px ui-monospace, Menlo, Consolas, monospace'; c.fillStyle = '#e8c14a'; c.textAlign = 'left'; c.textBaseline = 'top';
    c.fillText(nameOf(m.id), 4, 2);
    c.textAlign = 'right'; c.fillStyle = '#9cc4ff'; c.fillText(Math.round(100 * seen / Math.max(1, m.w * m.h)) + '% explored', W - 4, 2);
  };
  /* ---------- the region map: a drawn map of the whole land ----------
     Every place has a fixed spot on one hand-laid map (logical 424 x 344). Rooms, shops and the deeper levels of a
     dungeon share the spot of the place you enter them from. A part of the land stays under cloud until you have set
     foot in it; places show once found. */
  const WORLD = {
    // id: [x, y, kind]   kind: town, city, wild (open country), dun (dungeon), pz (puzzle dungeon)
    brackenford: [214, 266, 'town'], thornwood: [214, 216, 'wild'], mill: [166, 214, 'wild'], barrow1: [216, 178, 'dun'],
    hollowbarrow: [250, 200, 'pz'], chapel: [188, 230, 'dun'], oldtower: [244, 226, 'dun'], digsite: [192, 196, 'dun'],
    millrace: [146, 200, 'pz'], cistern: [190, 278, 'dun'],
    saltmere: [84, 252, 'town'], wreck: [50, 268, 'wild'], saltpans: [114, 272, 'wild'], seacave: [110, 240, 'dun'], seacaves: [62, 234, 'pz'],
    mirefen: [124, 198, 'wild'], abbey1: [152, 176, 'dun'], belltower: [116, 174, 'dun'], tidemill: [92, 184, 'wild'],
    smugglers: [140, 214, 'dun'], drownedchapel: [104, 214, 'pz'],
    frostpass: [214, 86, 'wild'], karrow: [222, 122, 'town'], cairn1: [212, 46, 'dun'], icecaves: [166, 86, 'dun'],
    falls: [262, 80, 'wild'], iceshrine: [276, 60, 'dun'], echospire: [270, 100, 'pz'], watchtower: [186, 62, 'dun'],
    goblinden: [242, 58, 'dun'], icehalls: [178, 110, 'pz'],
    highmoor: [330, 170, 'city'], undercroft: [322, 194, 'dun'], lampvault: [344, 204, 'pz'], archive: [310, 156, 'pz'],
    chtower: [348, 152, 'dun'], printshop: [304, 182, 'dun'], sewer4: [360, 176, 'dun'],
    ashfall: [326, 272, 'town'], ashroad: [368, 260, 'wild'], hollow1: [404, 246, 'dun'], cinderkeep: [374, 288, 'dun'],
    greyhold: [356, 236, 'dun'], mirror: [388, 230, 'dun'], ashchapel: [350, 296, 'dun'], cindercave: [306, 290, 'dun'], smithdeep: [304, 256, 'pz']
  };
  const PARENT = {
    tavern: 'brackenford', shop: 'brackenford', smithy: 'brackenford', temple: 'brackenford', ossuary: 'barrow1', barrow2: 'barrow1',
    s_inn: 'saltmere', s_shop: 'saltmere', s_chapel: 'saltmere', abbey2: 'abbey1', scriptorium: 'abbey1',
    k_hall: 'karrow', k_shop: 'karrow', k_cells: 'karrow', vault3: 'cairn1', cairn2: 'cairn1',
    h_inn: 'highmoor', h_shop: 'highmoor', h_cathedral: 'highmoor', h_counting: 'highmoor', h_palace: 'highmoor', h_vault: 'highmoor', h_crypt: 'highmoor',
    catacombs1: 'undercroft', catacombs2: 'undercroft', charnel: 'undercroft', lamphall: 'hollow1', hollow2: 'hollow1', hollow3: 'hollow1'
  };
  const REGIONS = [
    { name: 'The Vale', x: 214, y: 246, maps: ['brackenford', 'thornwood', 'mill', 'barrow1'], box: [140, 160, 280, 300] },
    { name: 'The Salt Coast', x: 124, y: 302, maps: ['saltmere', 'mirefen', 'wreck', 'saltpans', 'abbey1'], box: [28, 150, 170, 310] },
    { name: 'The Frostlands', x: 214, y: 26, maps: ['frostpass', 'karrow', 'falls', 'cairn1'], box: [120, 0, 310, 140] },
    { name: 'The High Moor', x: 344, y: 132, maps: ['highmoor', 'undercroft'], box: [282, 40, 424, 215] },
    { name: 'The Ashlands', x: 366, y: 322, maps: ['ashfall', 'ashroad', 'hollow1'], box: [282, 215, 424, 344] }
  ];
  const ROADS = [['brackenford', 'thornwood'], ['thornwood', 'mill'], ['thornwood', 'barrow1'], ['saltmere', 'mirefen'], ['mirefen', 'abbey1'],
    ['saltmere', 'wreck'], ['saltmere', 'saltpans'], ['frostpass', 'karrow'], ['frostpass', 'cairn1'], ['frostpass', 'icecaves'], ['frostpass', 'falls'],
    ['ashfall', 'ashroad'], ['ashroad', 'hollow1'], ['highmoor', 'undercroft']];
  // the long roads between the regions, walked between chapters: [a, b, bend]
  const HIGHWAYS = [['brackenford', 'saltmere', [150, 286]], ['brackenford', 'karrow', [254, 170]], ['karrow', 'highmoor', [290, 128]], ['highmoor', 'ashfall', [300, 226]]];
  const LAND = [[66, 0], [60, 36], [68, 74], [60, 112], [70, 148], [56, 182], [38, 212], [26, 244], [32, 272], [52, 298], [88, 310], [138, 314], [188, 324], [236, 330], [276, 324], [300, 336], [306, 344], [424, 344], [424, 0]];
  // shorter names for the map, where the full one would crowd its neighbours
  const SHORT = { wreck: 'The Wreck', saltpans: 'Salt Pans', tidemill: 'Tide Mill', frostpass: 'Frost Pass', falls: 'Frozen Falls', ashroad: 'Ashen Road', mill: "Teague's Mill" };
  const rnd = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const spotOf = id => WORLD[id] ? id : PARENT[id] && WORLD[PARENT[id]] ? PARENT[id] : null;
  const isSeen = id => !!(G.S.seen || {})[id] || id === Field.map.id || Object.keys(PARENT).some(k => PARENT[k] === id && (G.S.seen || {})[k]);
  const nearPlace = (x, y, r) => Object.values(WORLD).some(p => Math.hypot(p[0] - x, p[1] - y) < r);
  function landPath(c) {
    c.beginPath(); c.moveTo(LAND[0][0], LAND[0][1]);
    for (let i = 1; i < LAND.length; i++) { const a = LAND[i - 1], b = LAND[i]; c.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
    c.lineTo(424, 0); c.closePath();
  }
  // The land itself, drawn once and kept: sea, coast, mountains, forests, fen, moor, ash, rivers.
  let terrain = null;
  function drawTerrain() {
    const cv = document.createElement('canvas'); cv.width = 848; cv.height = 688; const c = cv.getContext('2d'); c.scale(2, 2);
    const R = rnd(7);
    // sea
    const sea = c.createLinearGradient(0, 0, 0, 344); sea.addColorStop(0, '#24496a'); sea.addColorStop(1, '#1b3754'); c.fillStyle = sea; c.fillRect(0, 0, 424, 344);
    c.strokeStyle = 'rgba(190,220,240,.18)'; c.lineWidth = 0.8;
    for (let i = 0; i < 70; i++) { const x = R() * 120, y = R() * 344; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 3, y - 2, x + 6, y); c.quadraticCurveTo(x + 9, y + 2, x + 12, y); c.stroke(); }
    // land: a shallow-water halo, a dark edge, then parchment
    c.save(); landPath(c); c.strokeStyle = 'rgba(120,170,200,.35)'; c.lineWidth = 9; c.stroke(); c.strokeStyle = 'rgba(120,170,200,.25)'; c.lineWidth = 16; c.stroke(); c.restore();
    landPath(c); c.fillStyle = '#d8c59a'; c.fill(); c.strokeStyle = '#5a4a30'; c.lineWidth = 1.4; c.stroke();
    c.save(); landPath(c); c.clip();
    for (let i = 0; i < 900; i++) { c.fillStyle = R() < 0.5 ? 'rgba(120,90,50,.07)' : 'rgba(255,250,230,.08)'; c.fillRect(R() * 424, R() * 344, 1 + R() * 3, 1 + R() * 2); }
    const blot = (x, y, rx, ry, col, n) => { for (let i = 0; i < (n || 26); i++) { const a = R() * 6.28, d = Math.sqrt(R()); c.fillStyle = col; c.beginPath(); c.ellipse(x + Math.cos(a) * rx * d, y + Math.sin(a) * ry * d, rx * 0.28, ry * 0.28, 0, 0, 7); c.fill(); } };
    blot(214, 70, 110, 70, 'rgba(235,240,248,.22)', 40);          // snowfields in the north
    blot(214, 250, 70, 50, 'rgba(150,170,90,.13)');               // the green vale
    blot(124, 200, 46, 34, 'rgba(110,120,80,.20)');               // the fen
    blot(334, 172, 60, 46, 'rgba(150,140,110,.18)');              // the moor
    blot(364, 282, 76, 60, 'rgba(70,60,60,.30)', 40);             // the ashlands
    for (let i = 0; i < 220; i++) { const x = 290 + R() * 134, y = 220 + R() * 124; c.fillStyle = 'rgba(50,40,40,.18)'; c.fillRect(x, y, 1.5, 1.5); }
    // rivers: from the mountains down through the vale to the sea; and a stream from the pass to the coast
    c.strokeStyle = '#5d8fb2'; c.lineCap = 'round';
    const river = (pts, w) => { c.lineWidth = w; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i++) c.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2); const l = pts[pts.length - 1]; c.lineTo(l[0], l[1]); c.stroke(); };
    river([[246, 96], [240, 140], [262, 176], [238, 206], [252, 244], [244, 292], [262, 334]], 2.2);
    river([[176, 98], [150, 130], [132, 168], [96, 180], [70, 168], [58, 158]], 1.6);
    c.fillStyle = '#5d8fb2'; c.beginPath(); c.ellipse(118, 186, 9, 5, -0.3, 0, 7); c.fill();    // the mere in the fen
    // the fen: reeds and pools
    for (let i = 0; i < 70; i++) { const a = R() * 6.28, d = Math.sqrt(R()), x = 124 + Math.cos(a) * 44 * d, y = 200 + Math.sin(a) * 30 * d; if (nearPlace(x, y, 7)) continue;
      if (R() < 0.3) { c.fillStyle = 'rgba(80,120,150,.6)'; c.beginPath(); c.ellipse(x, y, 2.5, 1.2, 0, 0, 7); c.fill(); }
      else { c.strokeStyle = 'rgba(70,90,40,.7)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 1, y - 4); c.moveTo(x + 1.5, y); c.lineTo(x + 2, y - 3.5); c.stroke(); } }
    // forests: the Thornwood, and woods by the mill
    const tree = (x, y, s) => { c.fillStyle = 'rgba(40,60,30,.35)'; c.beginPath(); c.ellipse(x + 1, y + 2.5, s * 0.9, s * 0.4, 0, 0, 7); c.fill(); c.fillStyle = R() < 0.5 ? '#4f7a3a' : '#5d8a42'; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,220,.18)'; c.beginPath(); c.arc(x - s * 0.3, y - s * 0.3, s * 0.45, 0, 7); c.fill(); };
    for (const [fx, fy, rx, ry, n] of [[214, 212, 48, 34, 150], [160, 214, 18, 14, 26], [270, 250, 20, 16, 24], [100, 140, 22, 14, 22]])
      for (let i = 0; i < n; i++) { const a = R() * 6.28, d = Math.sqrt(R()), x = fx + Math.cos(a) * rx * d, y = fy + Math.sin(a) * ry * d; if (!nearPlace(x, y, 8)) tree(x, y, 2.2 + R() * 1.4); }
    // the moor: low hills
    c.strokeStyle = 'rgba(90,80,50,.55)'; c.lineWidth = 1;
    for (let i = 0; i < 40; i++) { const x = 290 + R() * 110, y = 120 + R() * 90; if (nearPlace(x, y, 10)) continue; c.beginPath(); c.arc(x, y, 4 + R() * 3, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    // mountains: across the north, and a spine between the vale and the moor
    const peaks = [];
    for (let i = 0; i < 150; i++) peaks.push([120 + R() * 200, 4 + R() * 128]);
    for (let i = 0; i < 26; i++) peaks.push([276 + R() * 30, 120 + R() * 100]);
    for (let i = 0; i < 18; i++) peaks.push([300 + R() * 124, 4 + R() * 90]);
    peaks.sort((a, b) => a[1] - b[1]);
    for (const [x, y] of peaks) {
      if (nearPlace(x, y, 11)) continue;
      const s = 5 + R() * 6;
      c.fillStyle = '#9b8a6a'; c.beginPath(); c.moveTo(x - s, y + s * 0.7); c.lineTo(x, y - s); c.lineTo(x + s, y + s * 0.7); c.closePath(); c.fill();
      c.fillStyle = '#7a6a50'; c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s, y + s * 0.7); c.lineTo(x + s * 0.15, y + s * 0.7); c.closePath(); c.fill();
      if (y < 110) { c.fillStyle = '#f4f6fa'; c.beginPath(); c.moveTo(x - s * 0.38, y - s * 0.24); c.lineTo(x, y - s); c.lineTo(x + s * 0.38, y - s * 0.24); c.lineTo(x + s * 0.1, y - s * 0.4); c.closePath(); c.fill(); }
      c.strokeStyle = 'rgba(60,45,30,.6)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(x - s, y + s * 0.7); c.lineTo(x, y - s); c.lineTo(x + s, y + s * 0.7); c.stroke();
    }
    // the fire-mountain over the Ashlands
    c.fillStyle = '#4a3c38'; c.beginPath(); c.moveTo(390, 336); c.lineTo(408, 304); c.lineTo(416, 304); c.lineTo(424, 318); c.lineTo(424, 336); c.closePath(); c.fill();
    const glow = c.createRadialGradient(412, 304, 1, 412, 304, 16); glow.addColorStop(0, 'rgba(255,140,60,.9)'); glow.addColorStop(1, 'rgba(255,90,40,0)'); c.fillStyle = glow; c.beginPath(); c.arc(412, 304, 16, 0, 7); c.fill();
    c.restore();
    // a frame and a compass
    c.strokeStyle = '#3a2c1a'; c.lineWidth = 3; c.strokeRect(1.5, 1.5, 421, 341); c.strokeStyle = '#c8a56a'; c.lineWidth = 1; c.strokeRect(5.5, 5.5, 413, 333);
    const cx = 32, cy = 316; c.fillStyle = 'rgba(30,24,16,.75)'; c.beginPath(); c.arc(cx, cy, 15, 0, 7); c.fill(); c.strokeStyle = '#c8a56a'; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#e8d6a8'; c.beginPath(); c.moveTo(cx, cy - 12); c.lineTo(cx + 3, cy); c.lineTo(cx, cy + 12); c.lineTo(cx - 3, cy); c.closePath(); c.fill();
    c.fillStyle = '#c84a3a'; c.beginPath(); c.moveTo(cx, cy - 12); c.lineTo(cx + 3, cy); c.lineTo(cx - 3, cy); c.closePath(); c.fill();
    c.font = 'bold 7px Georgia, serif'; c.fillStyle = '#e8d6a8'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('N', cx, cy - 20 + 2);
    return cv;
  }
  // the cloud: parchment-coloured, a little mottled, made fresh for each drawing (holes are cut in it)
  let cloudBase = null;
  function cloud() {
    if (!cloudBase) {
      cloudBase = document.createElement('canvas'); cloudBase.width = 848; cloudBase.height = 688; const c = cloudBase.getContext('2d'); c.scale(2, 2);
      const R = rnd(11); c.fillStyle = 'rgba(224,212,184,.94)'; c.fillRect(0, 0, 424, 344);
      for (let i = 0; i < 160; i++) { const x = R() * 424, y = R() * 344, r = 10 + R() * 28; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, R() < 0.5 ? 'rgba(245,238,220,.35)' : 'rgba(190,175,140,.18)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
    }
    const cv = document.createElement('canvas'); cv.width = 848; cv.height = 688; cv.getContext('2d').drawImage(cloudBase, 0, 0); return cv;
  }
  function icon(c, kind, x, y, found) {
    c.lineWidth = 1; c.strokeStyle = '#2a1e10';
    if (kind === 'town' || kind === 'city') {
      const s = kind === 'city' ? 1.35 : 1;
      c.fillStyle = '#b8483a'; c.beginPath(); c.moveTo(x - 7 * s, y - 2 * s); c.lineTo(x, y - 8 * s); c.lineTo(x + 7 * s, y - 2 * s); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#f0e2c0'; c.fillRect(x - 5.5 * s, y - 2 * s, 11 * s, 7 * s); c.strokeRect(x - 5.5 * s, y - 2 * s, 11 * s, 7 * s);
      c.fillStyle = '#3a2c1a'; c.fillRect(x - 1.3 * s, y + 1 * s, 2.6 * s, 4 * s);
      if (kind === 'city') { c.fillStyle = '#b8483a'; c.fillRect(x + 4, y - 14, 4, 8); c.strokeRect(x + 4, y - 14, 4, 8); c.fillRect(x - 8, y - 12, 4, 6); c.strokeRect(x - 8, y - 12, 4, 6); }
    } else if (kind === 'wild') {
      c.fillStyle = '#f0e2c0'; c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#3a6a3a'; c.beginPath(); c.arc(x, y, 2, 0, 7); c.fill();
    } else if (kind === 'pz') {
      c.fillStyle = '#e8c14a'; c.beginPath(); c.moveTo(x, y - 5); c.lineTo(x + 5, y); c.lineTo(x, y + 5); c.lineTo(x - 5, y); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#2a1e10'; c.font = 'bold 6px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', x, y + 0.5);
    } else {                                                        // a dungeon mouth
      c.fillStyle = '#5a4a3a'; c.beginPath(); c.moveTo(x - 5, y + 4); c.lineTo(x - 5, y - 1); c.arc(x, y - 1, 5, Math.PI, 0); c.lineTo(x + 5, y + 4); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#120c08'; c.beginPath(); c.moveTo(x - 2.5, y + 4); c.lineTo(x - 2.5, y); c.arc(x, y, 2.5, Math.PI, 0); c.lineTo(x + 2.5, y + 4); c.closePath(); c.fill();
    }
    if (!found) { c.fillStyle = 'rgba(216,197,154,.55)'; c.beginPath(); c.arc(x, y, 8, 0, 7); c.fill(); }
  }
  function tag(c, text, x, y, opt) {
    opt = opt || {};
    c.font = (opt.bold ? 'bold ' : 'italic ') + (opt.size || 9) + 'px Georgia, "Times New Roman", serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const w = c.measureText(text).width;
    x = Math.max(w / 2 + 8, Math.min(424 - w / 2 - 8, x));
    c.lineWidth = 3; c.strokeStyle = opt.halo || 'rgba(240,226,192,.92)'; c.lineJoin = 'round'; c.strokeText(text, x, y);
    c.fillStyle = opt.col || '#2a1e10'; c.fillText(text, x, y);
  }
  // Everything but the pulsing marker is drawn once into a cached layer, redrawn only when what you know changes.
  let layer = null, layerKey = '';
  Menu.drawRegion = function (cv) {
    if (cv.width !== 848) { cv.width = 848; cv.height = 688; }
    const here = spotOf(Field.map.id), key = here + '|' + Object.keys(WORLD).filter(isSeen).join(',') + '|' + Field.places().filter(q => q.found).map(q => q.id + (q.used ? 1 : 0)).join(',');
    if (key !== layerKey || !layer) { layer = drawLayer(here); layerKey = key; }
    const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(layer, 0, 0); c.setTransform(2, 0, 0, 2, 0, 0);
    if (here) {                                                    // you are here
      const [x, y] = WORLD[here], t = (Date.now() / 600) % 1;
      c.strokeStyle = 'rgba(200,40,30,' + (1 - t) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 6 + t * 9, 0, 7); c.stroke();
      c.fillStyle = '#c8281e'; c.strokeStyle = '#fff4e0'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y - 3); c.lineTo(x - 4, y - 12); c.arc(x, y - 12, 4, Math.PI, 0); c.lineTo(x, y - 3); c.closePath(); c.fill(); c.stroke();
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
  };
  function drawLayer(here) {
    const cvL = document.createElement('canvas'); cvL.width = 848; cvL.height = 688;
    const c = cvL.getContext('2d'); c.setTransform(2, 0, 0, 2, 0, 0);
    if (!terrain) terrain = drawTerrain();
    c.drawImage(terrain, 0, 0, 424, 344);
    const open = REGIONS.map(r => r.maps.some(isSeen) || (here && r.maps.indexOf(here) >= 0) || Object.keys(WORLD).some(id => isSeen(id) && WORLD[id][0] >= r.box[0] && WORLD[id][0] < r.box[2] && WORLD[id][1] >= r.box[1] && WORLD[id][1] < r.box[3]));
    // roads first, under everything: the long roads between regions, then the local ones
    c.lineCap = 'round';
    for (const [a, b, bend] of HIGHWAYS) {
      if (!isSeen(a) || !isSeen(b)) continue;
      const p = WORLD[a], q = WORLD[b];
      c.setLineDash([3, 3]); c.strokeStyle = 'rgba(110,70,30,.75)'; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(p[0], p[1]); c.quadraticCurveTo(bend[0], bend[1], q[0], q[1]); c.stroke();
    }
    c.setLineDash([]);
    for (const [a, b] of ROADS) {
      if (!isSeen(a) || !isSeen(b)) continue;
      const p = WORLD[a], q = WORLD[b];
      c.strokeStyle = 'rgba(90,60,30,.85)'; c.lineWidth = 2; c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke();
      c.strokeStyle = 'rgba(230,205,150,.7)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke();
    }
    // cloud over every region not yet reached (soft-edged), with a clearing round any place already seen in it
    if (open.some(o => !o)) {
      const fog = cloud(), f = fog.getContext('2d'), mask = document.createElement('canvas'); mask.width = 848; mask.height = 688;
      const m = mask.getContext('2d'); m.setTransform(2, 0, 0, 2, 0, 0);
      const blob = (ctx, x, y, rx, ry, a0) => { ctx.save(); ctx.translate(x, y); ctx.scale(rx, ry); const g = ctx.createRadialGradient(0, 0, a0, 0, 0, 1); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, 7); ctx.fill(); ctx.restore(); };
      REGIONS.forEach((r, i) => { if (!open[i]) { const [x0, y0, x1, y1] = r.box; blob(m, (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) * 0.78, (y1 - y0) * 0.78, 0.62); } });
      m.globalCompositeOperation = 'destination-out';
      REGIONS.forEach((r, i) => { if (open[i]) { const [x0, y0, x1, y1] = r.box; blob(m, (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) * 0.6, (y1 - y0) * 0.6, 0.7); } });
      for (const id of Object.keys(WORLD)) if (isSeen(id)) blob(m, WORLD[id][0], WORLD[id][1], 30, 26, 0.5);
      f.globalCompositeOperation = 'destination-in'; f.drawImage(mask, 0, 0);
      c.drawImage(fog, 0, 0, 424, 344);
    }
    REGIONS.forEach((r, i) => { if (!open[i]) { const [x0, y0, x1, y1] = r.box; tag(c, 'Unknown lands', (x0 + x1) / 2, (y0 + y1) / 2, { size: 9, col: 'rgba(90,70,40,.75)', halo: 'rgba(0,0,0,0)' }); } });
    // region names, large and faint, once reached
    REGIONS.forEach((r, i) => { if (open[i]) tag(c, r.name.toUpperCase(), r.x, r.y, { bold: true, size: 10, col: 'rgba(70,45,20,.65)', halo: 'rgba(240,226,192,.5)' }); });
    // the places found so far, and their names: towns and open country always, dungeons only where you stand
    const found = Object.keys(WORLD).filter(isSeen);
    const order = found.slice().sort((a, b) => ({ city: 0, town: 1, wild: 2, pz: 3, dun: 4 }[WORLD[a][2]] - { city: 0, town: 1, wild: 2, pz: 3, dun: 4 }[WORLD[b][2]]));
    for (const id of order.slice().reverse()) icon(c, WORLD[id][2], WORLD[id][0], WORLD[id][1], true);
    for (const id of order) {
      const [x, y, k] = WORLD[id]; if ((k === 'dun' || k === 'pz') && id !== here) continue;
      const big = k === 'town' || k === 'city';
      tag(c, SHORT[id] || nameOf(id), x, y + (big ? 13 : 10), { bold: big, size: big ? 9.5 : 8 });
    }
    // shrines and stages found here: small dots beside the place
    for (const q of Field.places()) {
      if (!q.found) continue; const s = spotOf(q.d.map); if (!s || !isSeen(s)) continue;
      const [x, y] = WORLD[s], n = Field.places().filter(o => o.found && spotOf(o.d.map) === s).indexOf(q);
      c.globalAlpha = q.used ? 0.45 : 1; c.fillStyle = q.kind === 'pray' ? '#e8b830' : '#d0587a'; c.strokeStyle = '#2a1e10'; c.lineWidth = 0.8;
      c.beginPath(); c.arc(x + 9 + n * 6, y - 6, 2.4, 0, 7); c.fill(); c.stroke(); c.globalAlpha = 1;
    }
    return cvL;
  }
  Menu.regionSummary = function () {
    const here = spotOf(Field.map.id), r = here && REGIONS.find(g => { const p = WORLD[here]; return p[0] >= g.box[0] && p[0] < g.box[2] && p[1] >= g.box[1] && p[1] < g.box[3]; });
    const n = Object.keys(WORLD).filter(isSeen).length;
    return (here ? 'You are at ' + nameOf(here) + (r ? ', in ' + r.name : '') + '. ' : '') + n + (n === 1 ? ' place' : ' places') + ' found. Houses: towns; circles: open country; arches: dungeons; gold diamonds: puzzle dungeons.';
  };
  // Fast travel: from a town or the open road (not underground, not mid-fight, not in the opening brawl), to any
  // town already found. Returns why it is not allowed, or null.
  // A town counts as found once visited, or if its chapter is behind you (older saves never stored visits).
  Menu.found = id => !!G.flag('visited.' + id) || (G.flag('chapter') || 1) > G.D.towns[id].ch;
  Menu.travelBlock = function () {
    const d = Field.map.def, here = G.S.map;
    if (G.tutorial && G.tutorial()) return 'Not yet. Finish the brawl first.';
    if (d.dark || d.travel === false) return 'You cannot travel from down here. Find your way back to daylight.';
    const ids = Object.keys(G.D.towns || {}).filter(id => Menu.found(id) && id !== here);
    if (!ids.length) return 'You have not found another town yet.';
    return null;
  };
  Menu.travel = async function (id) {
    const t = G.D.towns[id];
    G.audio.sfx('select');
    await Field.enter(id, t.at);
    UI.toast('You travel the roads to ' + t.name + '.');
  };
  Menu.map = async function () {
    let view = 0, timer = null;
    const show = v => {
      Menu.pane('<canvas class="mapcv" width="' + W + '" height="' + H + '"></canvas>');
      const cv = Menu.paneEl.querySelector('canvas'), draw = v === 0 ? Menu.drawArea : Menu.drawRegion; draw(cv);
      clearInterval(timer); timer = setInterval(() => { if (cv.isConnected) draw(cv); else clearInterval(timer); }, v === 0 ? 300 : 120);
      Menu.desc(v === 0 ? 'Gold squares: exits (??? = new). + Maren prays here, ♪ Finch plays here; faded until you rest.' : Menu.regionSummary());
    };
    for (;;) {
      show(view);
      const why = Menu.travelBlock();
      const pick = await UI.menu({ style: Menu.NAV, start: view, items: [{ label: 'Area', value: 0 }, { label: 'Region', value: 1 }, { label: 'Travel', value: 3, disabled: !!why }, { label: 'Back', value: 2 }],
        onMove: it => { if (it.value < 2) show(it.value); else if (it.value === 3) Menu.desc(why || 'Walk the roads to any town you have already found.'); } });
      if (pick == null || pick === 2) { clearInterval(timer); return; }
      if (pick === 3) {
        const here = G.S.map, ids = Object.keys(G.D.towns).filter(id => Menu.found(id) && id !== here);
        const to = await UI.menu({ style: Menu.NAV, items: ids.map(id => ({ label: G.D.towns[id].name, value: id, right: 'Ch ' + G.D.towns[id].ch })).concat([{ label: 'Back', value: null }]),
          onMove: it => Menu.desc(it.value ? G.D.towns[it.value].desc : '') });
        if (to) { clearInterval(timer); return to; }
        continue;
      }
      view = pick;
    }
  };
})();
