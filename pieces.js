/* Pieces: the board and its figures. Characters stand on the board as carved, chess-like pieces on round bases
   (blue for the party, green for allies, red for enemies), painted at double resolution from the same specs as
   the field sprites (D.sprites plus D.looks). Beasts are painted in the same hand by beasts.js (any left without a painter stand as their pixel sprite, smoothed). */
(function () {
  const cache = {};
  const BASE = { 0: ['#34508f', '#1e3060', '#e8c14a'], 1: ['#8a3030', '#521a1a', '#d8dce8'], 2: ['#2f7a52', '#1a4a30', '#e8c14a'] };
  function shade(hex, d) {
    if (!hex || hex[0] !== '#') return hex;
    const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, v + d));
    return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
  }
  function outline(cv, col) {
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, im = c.getImageData(0, 0, w, h), d = im.data, src = new Uint8ClampedArray(d);
    const a = (x, y) => (x >= 0 && y >= 0 && x < w && y < h) ? src[(y * w + x) * 4 + 3] : 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (a(x, y) < 128 && (a(x - 1, y) > 127 || a(x + 1, y) > 127 || a(x, y - 1) > 127 || a(x, y + 1) > 127)) { const i = (y * w + x) * 4; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255; }
    }
    c.putImageData(im, 0, 0);
  }
  // One figure, facing right (the four heroes have their own painters in heroes.js). Drawn in smooth shapes at 4x a 40x64 layout (20x32 on the board), so it stays crisp
  // when the battle canvas scales it: rounded limbs, shaded cloth, soft outlines, a lacquered base.
  const HD = 4;
  // Scale2x (EPX): doubles pixel art while rounding its diagonals, so beasts look smooth rather than blocky.
  function epx(src) {
    const w = src.width, h = src.height, sc = src.getContext('2d').getImageData(0, 0, w, h).data;
    const out = document.createElement('canvas'); out.width = w * 2; out.height = h * 2;
    const oc = out.getContext('2d'), im = oc.createImageData(w * 2, h * 2), d = im.data;
    const at = (x, y) => { x = Math.max(0, Math.min(w - 1, x)); y = Math.max(0, Math.min(h - 1, y)); const i = (y * w + x) * 4; return (sc[i] << 24 | sc[i + 1] << 16 | sc[i + 2] << 8 | sc[i + 3]) >>> 0; };
    const put = (x, y, v) => { const i = (y * w * 2 + x) * 4; d[i] = v >>> 24; d[i + 1] = (v >>> 16) & 255; d[i + 2] = (v >>> 8) & 255; d[i + 3] = v & 255; };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const P = at(x, y), A = at(x, y - 1), Bq = at(x + 1, y), C = at(x - 1, y), D = at(x, y + 1);
      put(x * 2, y * 2, C === A && C !== D && A !== Bq ? A : P);
      put(x * 2 + 1, y * 2, A === Bq && A !== C && Bq !== D ? Bq : P);
      put(x * 2, y * 2 + 1, D === C && D !== Bq && C !== A ? C : P);
      put(x * 2 + 1, y * 2 + 1, Bq === D && Bq !== A && D !== C ? D : P);
    }
    oc.putImageData(im, 0, 0); return out;
  }
  // A soft dark outline: the silhouette stamped round the figure before it is drawn on top.
  function softOutline(cv, col, r) {
    const out = document.createElement('canvas'); out.width = cv.width; out.height = cv.height;
    const sil = document.createElement('canvas'); sil.width = cv.width; sil.height = cv.height;
    const sc = sil.getContext('2d'); sc.drawImage(cv, 0, 0); sc.globalCompositeOperation = 'source-in'; sc.fillStyle = col; sc.fillRect(0, 0, cv.width, cv.height);
    const oc = out.getContext('2d');
    for (let a = 0; a < 12; a++) oc.drawImage(sil, Math.cos(a / 12 * 6.283) * r, Math.sin(a / 12 * 6.283) * r);
    oc.drawImage(cv, 0, 0); return out;
  }
  B.piece = function (name, side) {
    const k = name + ':' + side;
    if (cache[k]) return cache[k];
    const cv = document.createElement('canvas'); cv.width = 40 * HD; cv.height = 64 * HD;
    const c = cv.getContext('2d'); c.scale(HD, HD); c.lineJoin = 'round'; c.lineCap = 'round';
    const R = (x, y, w, h, col, rad) => { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, rad == null ? 0.7 : rad); c.fill(); };
    const ell = (cx, cy, rx, ry, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, 6.2832); c.fill(); };
    const line = (x0, y0, x1, y1, w, col) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
    const lin = (x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
    const [b, bd, rim] = BASE[side];
    // the base: a lacquered two-tier plinth with a gold or silver rim
    ell(20, 59.5, 15.5, 4.2, 'rgba(0,0,0,.35)');
    c.fillStyle = lin(5, 0, 35, 0, [[0, shade(bd, 10)], [0.5, bd], [1, shade(bd, -20)]]); c.beginPath(); c.ellipse(20, 58, 15, 4, 0, 0, 3.1416); c.lineTo(5, 56); c.ellipse(20, 56, 15, 4, 0, 3.1416, 0, true); c.fill();
    ell(20, 56, 15, 4, rim); ell(20, 56, 13.8, 3.3, lin(6, 0, 34, 0, [[0, shade(b, 34)], [0.45, b], [1, shade(b, -26)]]));
    c.fillStyle = lin(9, 0, 31, 0, [[0, shade(bd, 20)], [1, shade(bd, -10)]]); c.beginPath(); c.ellipse(20, 53.5, 10.5, 3, 0, 0, 3.1416); c.lineTo(9.5, 52); c.ellipse(20, 52, 10.5, 3, 0, 3.1416, 0, true); c.fill();
    ell(20, 52, 10.5, 3, lin(10, 0, 30, 0, [[0, shade(b, 40)], [0.5, b], [1, shade(b, -24)]]));
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 0.6; c.beginPath(); c.ellipse(20, 52, 9, 2.2, 0, 3.5, 4.9); c.stroke();
    const pixIm = G.gfx.pix[name], s = Object.assign({}, G.D.sprites[name], (G.D.looks || {})[name]);
    const paint = (!G.D.sprites[name] && B.beastPainter && B.beastPainter(name)) || (B.heroPainter && B.heroPainter(name));
    if (paint) {                                                // a beast painted to match the heroes (beasts.js)
      const heroic = B.heroicOn && B.heroicOn(name), after = paint(c), fin = softOutline(cv, heroic ? '#1e1610' : '#1a1420', (heroic ? 1.4 : 2.2) * HD / 3); if (!heroic) lightHD(fin);
      if (after) { const fc = fin.getContext('2d'); fc.save(); fc.scale(HD, HD); after(fc); fc.restore(); }
      cache[k] = fin; return fin;
    }
    if (!G.D.sprites[name] && pixIm) {
      const big = epx(epx(pixIm));
      c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
      c.drawImage(big, 0, 0, big.width, big.height, 4, 18, 32, 32);
      const fin = softOutline(cv, '#1a1420', 2.2 * HD / 3); lightHD(fin); cache[k] = fin; return fin;
    }
    // everyone else: painted from their spec by figures.js, with any battle-only extras (armour, tabards, shields)
    Object.assign(s, (G.D.battleLooks || {})[name]);
    const after = B.paintSpec(c, B.paintKit(c), s, side);
    const fin = softOutline(cv, '#1a1420', 2.2 * HD / 3);
    lightHD(fin);
    if (after) { const fc = fin.getContext('2d'); fc.save(); fc.scale(HD, HD); after(B.paintKit(fc), fc); fc.restore(); }
    cache[k] = fin; return fin;
  };
  function lightHD(cv) {
    const c = cv.getContext('2d'); c.save(); c.scale(HD, HD); c.globalCompositeOperation = 'source-atop';
    let g = c.createLinearGradient(6, 0, 34, 0); g.addColorStop(0, 'rgba(255,240,210,.14)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(10,6,20,.22)');
    c.fillStyle = g; c.fillRect(0, 0, 40, 64);
    g = c.createLinearGradient(0, 8, 0, 60); g.addColorStop(0, 'rgba(255,250,230,.08)'); g.addColorStop(0.75, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.14)');
    c.fillStyle = g; c.fillRect(0, 0, 40, 64); c.restore();
  }
  // Carved-wood lighting: a soft highlight from the upper left, shadow to the right and toward the base.
  function light(cv) {
    const c = cv.getContext('2d'); c.save(); c.globalCompositeOperation = 'source-atop';
    let g = c.createLinearGradient(6, 0, 34, 0); g.addColorStop(0, 'rgba(255,240,210,.16)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(10,6,20,.30)');
    c.fillStyle = g; c.fillRect(0, 0, 40, 64);
    g = c.createLinearGradient(0, 8, 0, 60); g.addColorStop(0, 'rgba(255,250,230,.10)'); g.addColorStop(0.7, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.18)');
    c.fillStyle = g; c.fillRect(0, 0, 40, 64); c.restore();
  }
  // A white copy of a piece, flashed over it when it is hit.
  const wcache = {};
  // Forget every painted piece and face (after the hero figures change in Options).
  B.clearPieces = () => { for (const o of [cache, wcache, faces]) for (const k in o) delete o[k]; };
  B.pieceFlash = function (name, side) {
    const k = name + ':' + side; if (wcache[k]) return wcache[k];
    const src = B.piece(name, side), cv = document.createElement('canvas'); cv.width = src.width; cv.height = src.height;
    const c = cv.getContext('2d'); c.drawImage(src, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = '#fff6e8'; c.fillRect(0, 0, cv.width, cv.height);
    return (wcache[k] = cv);
  };

  /* ---------- obstacles ---------- */
  const rgb = (a, d) => 'rgb(' + a.map(v => Math.max(0, Math.min(255, v + (d || 0)))).join(',') + ')';
  function block(c, kind0, x, y, iso) {
    const R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(a, b, w, h); };
    const E = (cx, cy, rx, ry, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 7); c.fill(); };
    const kind = kind0.kind || kind0, cx = x + B.TW / 2, by = y + B.TH - 2;
    if (!iso && kind !== 'water' && kind !== 'wall') {                  // the square it stands on, so you can see which one
      c.fillStyle = 'rgba(12,8,20,.34)'; c.fillRect(x + 0.5, y + 0.5, B.TW - 1, B.TH - 1);
      c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = 0.6; c.strokeRect(x + 0.8, y + 0.8, B.TW - 1.6, B.TH - 1.6);
      c.strokeStyle = 'rgba(255,240,210,.18)'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(x + 1, y + B.TH - 1); c.lineTo(x + 1, y + 1); c.lineTo(x + B.TW - 1, y + 1); c.stroke();
    }
    if (kind === 'water') { R(x, y, B.TW, B.TH, '#2f5c9c'); R(x + 2, y + 3, 7, 1, '#7fb0e8'); R(x + 10, y + 7, 6, 1, '#7fb0e8'); R(x, y, B.TW, 1, '#244a80'); return; }
    if (kind === 'wall') {
      const col = kind0.col || [90, 86, 100], fy = y - 2, fh = B.TH + 2;
      R(x, y - 12, B.TW, 10, rgb(col, 10)); R(x, y - 12, B.TW, 1, rgb(col, 34)); R(x, y - 3, B.TW, 1, rgb(col, -10));
      const g = c.createLinearGradient(0, fy, 0, fy + fh); g.addColorStop(0, rgb(col, -18)); g.addColorStop(1, rgb(col, -50)); c.fillStyle = g; c.fillRect(x, fy, B.TW, fh);
      for (let row = 0; row < 3; row++) { const ry = fy + 1 + row * 4.5; R(x, ry + 3.5, B.TW, 0.5, rgb(col, -62)); for (let bx = (row % 2) * 5; bx < B.TW; bx += 10) R(x + bx, ry, 0.5, 4, rgb(col, -62)); }
      for (let i = 0; i < 3; i++) R(x + 2 + i * 6, y - 10 + (i % 2) * 3, 2, 1, rgb(col, -6));
      R(x, y + B.TH - 1, B.TW, 1, rgb(col, -70)); return;
    }
    E(cx, by, 9, 3, 'rgba(0,0,0,.28)');
    if (kind === 'pine') { R(cx - 1, by - 5, 3, 5, '#6b4a2b'); for (let i = 0; i < 3; i++) { const w = 4 + i * 3, ty = by - 26 + i * 6; c.fillStyle = i % 2 ? '#245a3a' : '#2f7048'; c.beginPath(); c.moveTo(cx, ty); c.lineTo(cx - w, ty + 9); c.lineTo(cx + w, ty + 9); c.fill(); } if (B.bg === 'snow') { R(cx - 3, by - 22, 6, 1, '#f4f8fc'); R(cx - 6, by - 16, 4, 1, '#f4f8fc'); } return; }
    if (kind === 'bush') { E(cx, by - 5, 9, 6, '#215226'); E(cx - 1, by - 6, 7, 5, '#2f7032'); R(cx + 3, by - 7, 2, 2, '#c8443c'); return; }
    if (kind === 'stump') { R(cx - 5, by - 7, 10, 7, '#6b4a2b'); E(cx, by - 7, 5, 2, '#bf8a5c'); return; }
    if (kind === 'standing') { R(cx - 4, by - 22, 8, 22, '#6a6c78'); R(cx - 4, by - 22, 3, 22, '#8d8f9c'); R(cx - 1, by - 16, 2, 5, '#3a3c46'); return; }
    if (kind === 'grave') { R(cx - 4, by - 12, 8, 12, '#8d8f9c'); E(cx, by - 12, 4, 3, '#8d8f9c'); R(cx - 1, by - 11, 2, 6, '#3a3c46'); R(cx - 3, by - 9, 6, 1, '#3a3c46'); return; }
    if (kind === 'fence') { R(x + 1, by - 9, 2, 9, '#6b4a2b'); R(x + B.TW - 3, by - 9, 2, 9, '#6b4a2b'); R(x, by - 8, B.TW, 2, '#bf8a5c'); R(x, by - 4, B.TW, 1, '#a8754a'); return; }
    if (kind === 'tree') { R(cx - 2, by - 12, 4, 12, '#6b4a2b'); R(cx + 1, by - 12, 1, 12, '#4a321c'); E(cx + 1, by - 17, 9, 9, '#183e1e'); E(cx, by - 18, 9, 9, '#215226'); E(cx - 1, by - 19, 8, 8, '#2f7032'); E(cx - 3, by - 21, 5, 4, '#3a8a3c'); E(cx - 4, by - 23, 2.5, 2, '#5aa84a'); E(cx + 3, by - 15, 2, 1.5, '#1a4420'); }
    else if (kind === 'deadtree') { R(cx - 2, by - 18, 3, 18, '#3a2e28'); R(cx - 8, by - 16, 7, 2, '#3a2e28'); R(cx + 1, by - 13, 7, 2, '#3a2e28'); R(cx - 8, by - 20, 2, 5, '#3a2e28'); R(cx + 6, by - 17, 2, 5, '#3a2e28'); }
    else if (kind === 'rock' || kind === 'snowrock') { E(cx, by - 5, 9, 7, '#45424e'); E(cx - 1, by - 6, 8, 6, '#7d7f8c'); E(cx - 2, by - 7, 6, 4.5, '#8d8f9c'); E(cx - 3, by - 9, 3, 2, '#b9bbc8'); R(cx + 2, by - 6, 3, 0.5, '#55525e'); if (kind === 'snowrock') { E(cx - 1, by - 10, 7, 3, '#f4f8fc'); E(cx - 3, by - 11, 3, 1.2, '#ffffff'); } }
    else if (kind === 'pillar') { R(cx - 6, by - 24, 12, 24, '#8d8f9c'); R(cx - 6, by - 24, 3, 24, '#a9abb8'); R(cx + 3, by - 24, 3, 24, '#666876'); R(cx - 8, by - 27, 16, 4, '#a9abb8'); R(cx - 8, by - 3, 16, 3, '#666876'); }
    else if (kind === 'reeds') { E(cx, by - 1, 9, 3, '#3a6f8a'); for (let i = 0; i < 6; i++) { R(cx - 7 + i * 3, by - 12 - (i % 3) * 3, 1, 12 + (i % 3) * 3, i % 2 ? '#6b7a3c' : '#8a9a4a'); R(cx - 7 + i * 3, by - 13 - (i % 3) * 3, 2, 3, '#6b4a2b'); } }
    else if (kind === 'crate' || kind === 'barrel') {
      if (kind === 'crate') { R(cx - 8, by - 13, 16, 13, '#8a5d38'); R(cx - 8, by - 13, 16, 2, '#bf8a5c'); R(cx - 8, by - 7, 16, 1, '#6b4426'); R(cx - 1, by - 13, 2, 13, '#6b4426'); }
      else { R(cx - 6, by - 14, 12, 14, '#a8754a'); R(cx - 7, by - 11, 14, 8, '#a8754a'); R(cx - 7, by - 11, 14, 1, '#4a4d57'); R(cx - 7, by - 4, 14, 1, '#4a4d57'); R(cx - 6, by - 15, 12, 2, '#bf8a5c'); }
    }
    else if (kind === 'keg') {                                  // a powder keg: red bands, a fuse
      R(cx - 6, by - 13, 12, 13, '#5a3a24'); R(cx - 7, by - 10, 14, 7, '#5a3a24'); R(cx - 6, by - 13, 12, 2, '#7a5236');
      R(cx - 7, by - 10, 14, 1.5, '#c8443c'); R(cx - 7, by - 4.5, 14, 1.5, '#c8443c'); R(cx - 2, by - 9, 4, 3, '#e8d8b0'); c.fillStyle = '#2a1a10'; c.fillText && 0;
      R(cx + 1, by - 17, 1, 4, '#3a2a1a'); const f = Math.floor(G.time / 120) % 2; R(cx + 1 - f, by - 18 - f, 2, 2, f ? '#ffd24a' : '#ff8a3a'); }
    else if (kind === 'brazier') {                              // an iron bowl of coals on three legs
      R(cx - 6, by - 4, 2, 4, '#3a3c46'); R(cx + 4, by - 4, 2, 4, '#3a3c46'); R(cx - 1, by - 4, 2, 4, '#3a3c46');
      E(cx, by - 6, 8, 3, '#4a4d57'); R(cx - 8, by - 9, 16, 3, '#5a5d68'); E(cx, by - 9, 7, 2, '#ff6a2a');
      const t = G.time / 110; for (let i = 0; i < 4; i++) { const fx = cx - 5 + i * 3.3, h = 4 + Math.abs(Math.sin(t + i * 1.7)) * 4; c.fillStyle = i % 2 ? '#ffd24a' : '#ff8a3a'; c.beginPath(); c.moveTo(fx - 1.5, by - 9); c.lineTo(fx, by - 9 - h); c.lineTo(fx + 1.5, by - 9); c.fill(); } }
    else if (kind === 'boulder') {                             // a big round stone, ready to roll
      E(cx + 1, by - 6, 9, 8, '#3e3b46'); E(cx, by - 7, 8.5, 7.5, '#7a7884'); E(cx - 2, by - 9, 5, 4, '#9a98a4'); E(cx - 3, by - 11, 2, 1.5, '#c4c2cc');
      R(cx + 2, by - 5, 3, 0.6, '#4a4852'); R(cx - 4, by - 4, 2, 0.6, '#4a4852'); if (B.bg === 'snow') E(cx - 1, by - 13, 6, 2, '#f4f8fc'); }
    else if (kind === 'log') {                                 // a felled trunk lying across the square
      c.fillStyle = '#6b4a2b'; c.beginPath(); c.roundRect(cx - 9, by - 9, 16, 7, 3); c.fill(); R(cx - 8, by - 8, 14, 1.5, '#8f6a42'); R(cx - 7, by - 4, 12, 0.8, '#4a321c');
      E(cx + 7, by - 5.5, 3, 3.5, '#bf8a5c'); c.strokeStyle = '#8a5d38'; c.lineWidth = 0.5; c.beginPath(); c.ellipse(cx + 7, by - 5.5, 1.6, 2, 0, 0, 7); c.stroke(); }
    else if (kind === 'hive') {                                // a stump with a hive on it, and its bees
      R(cx - 4, by - 7, 8, 7, '#6b4a2b'); E(cx, by - 7, 4, 1.5, '#bf8a5c');
      E(cx, by - 13, 5, 6, '#c8962e'); for (let i = 0; i < 4; i++) R(cx - 4.5 + (i % 2), by - 17 + i * 2.6, 9 - (i % 2) * 2, 0.8, '#8a5a18'); E(cx, by - 9, 1.2, 1, '#2a1a10');
      const t = G.time / 160; for (let i = 0; i < 4; i++) R(cx + Math.sin(t + i * 1.7) * 8, by - 15 + Math.cos(t * 1.3 + i) * 5, 1, 1, '#2a1a10'); }
    else if (kind === 'gas') {                                 // a bubbling vent in the mud
      E(cx, by - 3, 8, 3.5, '#3a3a2a'); E(cx, by - 3.5, 6, 2.5, '#5a5a3a');
      const t = G.time / 260; for (let i = 0; i < 3; i++) { const ph = (t + i * 0.37) % 1; c.globalAlpha = 1 - ph; c.strokeStyle = '#9ad0a0'; c.lineWidth = 0.6; c.beginPath(); c.arc(cx - 4 + i * 4, by - 4 - ph * 6, 1 + ph * 1.5, 0, 7); c.stroke(); }
      c.globalAlpha = 0.18; E(cx, by - 9, 8, 6, '#9ad0c8'); c.globalAlpha = 1; }
    else if (kind === 'table') { R(cx - 9, by - 9, 18, 5, '#bf8a5c'); R(cx - 9, by - 5, 18, 2, '#8a5d38'); R(cx - 8, by - 3, 2, 4, '#6b4426'); R(cx + 6, by - 3, 2, 4, '#6b4426'); R(cx - 2, by - 12, 3, 3, '#e8e0cc'); }
  }

  /* ---------- the painted board: cached at full resolution (640x480) ---------- */
  function rnd(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const hex2 = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const STYLE = { forest: 'grass', fen: 'moss', cave: 'rough', sewer: 'rough', crypt: 'flag', throne: 'flag', city: 'cobble', town: 'cobble', snow: 'snow', ash: 'ash', tavern: 'plank', beach: 'sand' };
  function tileTex(c, x, y, w, h, col, style, r) {
    const P = (px, py, pw, ph, d) => { c.fillStyle = rgb(col, d); c.fillRect(x + px, y + py, pw, ph); };
    if (style === 'grass' || style === 'moss') {
      for (let i = 0; i < 4; i++) { const bx = r() * (w - 8), by = r() * (h - 6); c.fillStyle = rgb(col, -10 + r() * 6); c.globalAlpha = 0.35; c.fillRect(x + bx, y + by, 6 + r() * 6, 3 + r() * 3); c.globalAlpha = 1; }
      for (let i = 0; i < 14; i++) { const bx = Math.floor(r() * (w - 1)), by = Math.floor(r() * (h - 3)); P(bx, by, 1, 2 + Math.floor(r() * 2), r() < 0.5 ? 16 : -16); }
      if (style === 'grass' && r() < 0.12) { c.fillStyle = r() < 0.5 ? '#f4f1e6' : '#ffe07a'; c.fillRect(x + 4 + r() * (w - 8), y + 3 + r() * (h - 6), 2, 2); }
      if (style === 'moss' && r() < 0.25) { c.fillStyle = 'rgba(40,70,90,.35)'; c.beginPath(); c.ellipse(x + 8 + r() * (w - 16), y + 6 + r() * (h - 12), 5, 2.5, 0, 0, 7); c.fill(); }
    } else if (style === 'rough') {
      for (let i = 0; i < 7; i++) { const d = r() < 0.5 ? -18 : 12; P(Math.floor(r() * (w - 3)), Math.floor(r() * (h - 2)), 2 + Math.floor(r() * 2), 2, d); }
      if (r() < 0.4) { c.strokeStyle = rgb(col, -30); c.lineWidth = 1; c.beginPath(); let px = x + r() * w, py = y + r() * h; c.moveTo(px, py); for (let i = 0; i < 3; i++) { px += (r() - 0.5) * 10; py += (r() - 0.5) * 6; c.lineTo(px, py); } c.stroke(); }
    } else if (style === 'flag') {
      const mx = 8 + Math.floor(r() * (w - 16));
      P(0, 0, w, 1, 14); P(0, h - 1, w, 1, -26); P(mx, 0, 1, h, -26); P(mx + 1, 0, 1, h, 8);
      for (let i = 0; i < 5; i++) P(Math.floor(r() * (w - 2)), Math.floor(r() * (h - 2)), 1, 1, r() < 0.5 ? -14 : 10);
      if (r() < 0.25) { c.strokeStyle = rgb(col, -34); c.lineWidth = 1; c.beginPath(); const px = x + r() * w; c.moveTo(px, y + 1); c.lineTo(px + (r() - 0.5) * 8, y + h * 0.6); c.stroke(); }
    } else if (style === 'cobble') {
      for (let row = 0; row < 3; row++) for (let i = 0; i < 4; i++) {
        const cx = x + (i + (row % 2) * 0.5) * (w / 4) + 2, cy = y + row * (h / 3) + 4;
        c.fillStyle = rgb(col, -22); c.beginPath(); c.ellipse(cx + 3, cy + 1, 4.2, 3, 0, 0, 7); c.fill();
        c.fillStyle = rgb(col, Math.floor(r() * 14) - 4); c.beginPath(); c.ellipse(cx + 3, cy, 3.6, 2.4, 0, 0, 7); c.fill();
        c.fillStyle = rgb(col, 20); c.fillRect(cx + 1, cy - 1, 2, 1);
      }
    } else if (style === 'snow') {
      for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(120,140,180,.12)'; c.beginPath(); c.ellipse(x + r() * w, y + r() * h, 6, 2, 0, 0, 7); c.fill(); }
      for (let i = 0; i < 4; i++) { c.fillStyle = '#ffffff'; c.fillRect(x + r() * (w - 1), y + r() * (h - 1), 1, 1); }
    } else if (style === 'ash') {
      for (let i = 0; i < 9; i++) P(Math.floor(r() * (w - 2)), Math.floor(r() * (h - 1)), 2, 1, r() < 0.5 ? -16 : 10);
      if (r() < 0.2) { c.fillStyle = '#ff8a3a'; c.fillRect(x + r() * (w - 1), y + r() * (h - 1), 1, 1); }
      if (r() < 0.25) { c.strokeStyle = 'rgba(200,70,30,.35)'; c.lineWidth = 1; c.beginPath(); const px = x + r() * w; c.moveTo(px, y + r() * h); c.lineTo(px + 7, y + r() * h); c.stroke(); }
    } else if (style === 'plank') {
      for (let i = 1; i < 3; i++) { P(0, Math.round(i * h / 3), w, 1, -28); }
      for (let i = 0; i < 3; i++) { const py = Math.round(i * h / 3) + 3; P(Math.floor(r() * (w - 10)), py, 6 + Math.floor(r() * 6), 1, -12); P(Math.floor(r() * (w - 4)), py + 2, 4, 1, 10); }
      P(Math.floor(r() * (w - 1)), 2, 1, 1, -40);
    } else if (style === 'sand') {
      for (let i = 0; i < 12; i++) P(Math.floor(r() * (w - 1)), Math.floor(r() * (h - 1)), 1, 1, r() < 0.5 ? -18 : 14);
      if (r() < 0.3) { c.strokeStyle = rgb(col, -14); c.lineWidth = 1; c.beginPath(); const py = y + 4 + r() * (h - 8); c.moveTo(x + 2, py); c.quadraticCurveTo(x + w / 2, py - 3, x + w - 2, py); c.stroke(); }
    }
  }
  // Ground kinds painted onto a square (w x h at x, y): bridges, shallows, ice, smoke's scorch, hallowed runes.
  function paintTer(c, kind, x, y, w, h, base, r) {
    const stone = /crypt|throne|city|sewer/.test(B.bg);
    if (kind === 'bridge') {
      c.fillStyle = stone ? '#8a8a96' : '#8a6038'; c.fillRect(x, y, w, h);
      c.fillStyle = stone ? '#6a6a78' : '#6a4626'; const n = Math.max(3, Math.round(w / 6));
      for (let i = 1; i < n; i++) c.fillRect(x + i * w / n - 0.5, y, 1, h);
      c.fillStyle = stone ? '#a8a8b4' : '#a87a4a'; for (let i = 0; i < n; i++) c.fillRect(x + i * w / n + 1, y + h * 0.3, w / n - 2, 1);
      c.fillStyle = stone ? '#5a5a66' : '#4a3018'; c.fillRect(x, y, w, Math.max(1.5, h * 0.1)); c.fillRect(x, y + h - Math.max(1.5, h * 0.1), w, Math.max(1.5, h * 0.1));
    } else if (kind === 'shallows') {
      const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, 'rgba(70,130,190,.62)'); g.addColorStop(1, 'rgba(40,90,150,.70)'); c.fillStyle = g; c.fillRect(x, y, w, h);
      c.strokeStyle = 'rgba(190,225,255,.5)'; c.lineWidth = Math.max(0.6, w / 40);
      for (let i = 0; i < 3; i++) { const yy = y + h * (0.25 + i * 0.25) + (r() - 0.5) * h * 0.1, xx = x + r() * w * 0.4; c.beginPath(); c.moveTo(xx, yy); c.quadraticCurveTo(xx + w * 0.15, yy - h * 0.06, xx + w * 0.3, yy); c.stroke(); }
    } else if (kind === 'ice') {
      const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, 'rgba(230,245,255,.80)'); g.addColorStop(1, 'rgba(170,205,235,.80)'); c.fillStyle = g; c.fillRect(x, y, w, h);
      c.strokeStyle = 'rgba(110,150,190,.55)'; c.lineWidth = Math.max(0.5, w / 50); c.beginPath();
      let px = x + r() * w, py = y + r() * h; c.moveTo(px, py); for (let i = 0; i < 3; i++) { px += (r() - 0.5) * w * 0.5; py += (r() - 0.5) * h * 0.5; c.lineTo(px, py); } c.stroke();
      c.fillStyle = 'rgba(255,255,255,.75)'; c.fillRect(x + w * 0.15, y + h * 0.2, w * 0.3, Math.max(0.8, h * 0.06));
    } else if (kind === 'smoke') {
      c.fillStyle = 'rgba(30,24,22,.35)'; c.fillRect(x, y, w, h);
    } else if (kind === 'hallowed') {
      c.fillStyle = 'rgba(255,236,160,.16)'; c.fillRect(x, y, w, h);
      c.strokeStyle = 'rgba(255,226,140,.65)'; c.lineWidth = Math.max(0.6, w / 36); c.beginPath(); c.ellipse(x + w / 2, y + h / 2, w * 0.34, h * 0.34, 0, 0, 7); c.stroke();
      c.beginPath(); c.moveTo(x + w / 2, y + h * 0.26); c.lineTo(x + w / 2, y + h * 0.74); c.moveTo(x + w * 0.36, y + h * 0.42); c.lineTo(x + w * 0.64, y + h * 0.42); c.stroke();
    }
  }
  B.RES = 4;                                                  // the battle canvas is drawn at RES times the game's 320x240
  // Match the battle canvas to the screen pixels it fills (2x to 6x), so the board and figures are painted at the size
  // they are seen and never stretched or squeezed into blocky, jagged edges. Called when a fight starts and on resize.
  B.fitRes = function () {
    const cv = G.cv; if (!cv) return;
    const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    const res = r.width > 0 ? Math.max(2, Math.min(6, Math.round(r.width * dpr / 320 * 4) / 4)) : 4;
    if (res !== B.RES || cv.width !== Math.round(320 * res)) { B.RES = res; B.boardCache = null; cv.width = Math.round(320 * res); cv.height = Math.round(240 * res); }
    cv.classList.add('smooth');
  };
  B.boardCache = null;
  function boardCanvas() {
    const th = B.THEME[B.bg] || B.THEME.forest, bc = B.boardCache;
    if (bc && bc.floor === B.floor && bc.walls === B.walls && bc.bg === B.bg && bc.n === (B.walls ? B.walls.size : 0) && bc.t === B.terrain && bc.tn === (B.terrain ? B.terrain.size : 0) && bc.rev === B.boardRev && bc.N === B.N && bc.voids === B.voids) return bc.cv;
    const key = (B.gid || '') + '|' + B.bg + '|' + (B.floor ? B.floor.map(r => r.map(v => v.join('.')).join(',')).join(';') : '') + '|' + (B.walls ? [...B.walls.keys()].join(';') : '') + '|' + (B.terrain ? [...B.terrain].filter(e => e[1] !== 'fire').join(';') : '');
    const cv = (bc && bc.cv) || document.createElement('canvas'); cv.width = Math.round(320 * B.RES); cv.height = Math.round(240 * B.RES);   // (setting the size clears it)
    const c = cv.getContext('2d'), S = 2, TW = B.TW * S, TH = B.TH * S, X0 = B.BX * S, Y0 = B.BY * S, W = B.N * TW, H = B.N * TH;
    c.scale(B.RES / 2, B.RES / 2);
    const r = rnd(([...key].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) | 0, 7)));
    const style = STYLE[B.bg] || 'grass';
    const ins = (x, y) => B.inside(x, y), slabPath = () => { c.beginPath(); for (let y = 0; y < B.N; y++) for (let x = 0; x < B.N; x++) if (ins(x, y)) c.rect(X0 + x * TW, Y0 + y * TH, TW, TH); };
    // a soft shadow under the slab; pits in the middle of the board are dark; then the front edge of every square
    // with nothing in front of it (the slab's edge, a chasm's or a pit's far side)
    c.fillStyle = 'rgba(0,0,0,.45)'; c.filter = 'blur(' + 3 * B.RES + 'px)'; c.save(); c.translate(4, 10); slabPath(); c.fill(); c.restore(); c.filter = 'none';
    const pits = B.pitVoids ? B.pitVoids() : new Set();
    for (const k of pits) { const [x, y] = k.split(',').map(Number), px = X0 + x * TW, py = Y0 + y * TH, pg = c.createLinearGradient(0, py, 0, py + TH); pg.addColorStop(0, 'rgba(4,2,8,.95)'); pg.addColorStop(1, 'rgba(14,10,20,.85)'); c.fillStyle = pg; c.fillRect(px, py, TW, TH); }
    const edge = hex2(th.edge);
    for (let y = 0; y < B.N; y++) for (let x = 0; x < B.N; x++) {
      if (!ins(x, y) || ins(x, y + 1)) continue;
      const px = X0 + x * TW, py = Y0 + (y + 1) * TH, eh = pits.has((x) + ',' + (y + 1)) ? Math.min(14, TH) : 14, eg = c.createLinearGradient(0, py, 0, py + eh);
      eg.addColorStop(0, rgb(edge, 18)); eg.addColorStop(0.2, rgb(edge, 0)); eg.addColorStop(1, rgb(edge, -40));
      c.fillStyle = eg; c.fillRect(px, py, TW, eh);
      for (let i = 0; i < 3; i++) { c.fillStyle = rgb(edge, r() < 0.5 ? -18 : 10); c.fillRect(px + r() * (TW - 3), py + 3 + r() * (eh - 5), 3, 1); }
    }
    // squares
    for (let y = 0; y < B.N; y++) for (let x = 0; x < B.N; x++) {
      if (!ins(x, y)) continue;
      const base = B.floor ? B.floor[y][x] : hex2((x + y) % 2 ? th.b : th.a), col = base.map(v => v + ((x + y) % 2 ? -6 : 3));
      const px = X0 + x * TW, py = Y0 + y * TH;
      c.fillStyle = rgb(col); c.fillRect(px, py, TW, TH);
      tileTex(c, px, py, TW, TH, col, style, r);
    }
    // terrain painted onto the slab: high ground raised, rough ground broken up
    if (B.terrain) for (const [k, kind] of B.terrain) {
      if (kind === 'fire') continue;
      const [gx, gy] = k.split(',').map(Number), px = X0 + gx * TW, py = Y0 + gy * TH, base = B.floor ? B.floor[gy][gx] : hex2(th.a);
      if (kind === 'high') {
        const hi = (dx, dy) => B.high(gx + dx, gy + dy);
        c.fillStyle = rgb(base, 34); c.fillRect(px, py - 6, TW, TH);                              // the raised top
        tileTex(c, px, py - 6, TW, TH - 6, base.map(v => v + 34), style, r);
        if (!hi(0, 1)) { const fg = c.createLinearGradient(0, py + TH - 6, 0, py + TH); fg.addColorStop(0, rgb(base, -40)); fg.addColorStop(1, rgb(base, -70)); c.fillStyle = fg; c.fillRect(px, py + TH - 6, TW, 6);   // its front face
          c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(px, py + TH, TW, 3); }
        c.fillStyle = 'rgba(255,250,230,.45)'; if (!hi(0, -1)) c.fillRect(px, py - 6, TW, 1.5); if (!hi(-1, 0)) c.fillRect(px, py - 6, 1.5, TH - 6);
        c.fillStyle = 'rgba(0,0,0,.35)'; if (!hi(1, 0)) c.fillRect(px + TW - 1.5, py - 6, 1.5, TH);
      } else if (kind !== 'rough') paintTer(c, kind, px, py, TW, TH, base, r);
      else if (kind === 'rough') {
        for (let i = 0; i < 11; i++) { const x = px + 2 + r() * (TW - 6), y = py + 2 + r() * (TH - 5), sz = 2.5 + r() * 3.5;
          c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(x + 0.5, y + 1.2, sz * 0.6, sz * 0.35, 0, 0, 7); c.fill();
          c.fillStyle = rgb(base, -22); c.beginPath(); c.ellipse(x, y, sz * 0.55, sz * 0.32, 0, 0, 7); c.fill();
          c.fillStyle = rgb(base, 26); c.fillRect(x - sz * 0.3, y - sz * 0.2, sz * 0.4, 0.8); }
        c.strokeStyle = rgb(base, -30); c.lineWidth = 0.8; for (let i = 0; i < 3; i++) { const x = px + 3 + r() * (TW - 8), y = py + 4 + r() * (TH - 8); c.beginPath(); c.moveTo(x, y + 3); c.lineTo(x + 2, y); c.lineTo(x + 4, y + 3); c.stroke(); }
      }
    }
    // grid lines, and a gentle light falling from the upper left (only on the board itself)
    c.save(); slabPath(); c.clip();
    c.fillStyle = 'rgba(0,0,0,.16)';
    for (let i = 1; i < B.N; i++) { c.fillRect(X0 + i * TW, Y0, 1, H); c.fillRect(X0, Y0 + i * TH, W, 1); }
    c.fillStyle = 'rgba(255,255,255,.05)';
    for (let i = 1; i < B.N; i++) { c.fillRect(X0 + i * TW + 1, Y0, 1, H); c.fillRect(X0, Y0 + i * TH + 1, W, 1); }
    const lg = c.createLinearGradient(X0, Y0, X0 + W, Y0 + H); lg.addColorStop(0, 'rgba(255,240,200,.10)'); lg.addColorStop(0.5, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(0,0,20,.18)');
    c.fillStyle = lg; c.fillRect(X0, Y0, W, H);
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1; c.beginPath();
    for (let y = 0; y < B.N; y++) for (let x = 0; x < B.N; x++) {
      if (!ins(x, y)) continue; const px = X0 + x * TW, py = Y0 + y * TH;
      if (!ins(x, y - 1)) { c.moveTo(px, py + 0.5); c.lineTo(px + TW, py + 0.5); } if (!ins(x - 1, y)) { c.moveTo(px + 0.5, py); c.lineTo(px + 0.5, py + TH); }
      if (!ins(x + 1, y)) { c.moveTo(px + TW - 0.5, py); c.lineTo(px + TW - 0.5, py + TH); }
    }
    c.stroke();
    // contact shadows around obstacles that stand on the board
    if (B.walls) for (const [k, v] of B.walls) {
      const kind = v.kind || v; if (kind === 'water') continue;
      const [gx, gy] = k.split(',').map(Number), cx = X0 + gx * TW + TW / 2, cy = Y0 + gy * TH + TH - 4;
      const g = c.createRadialGradient(cx, cy, 2, cx, cy, TW * 0.7); g.addColorStop(0, 'rgba(0,0,0,.32)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.beginPath(); c.ellipse(cx, cy, TW * 0.7, TH * 0.5, 0, 0, 7); c.fill();
    }
    B.boardCache = { key, cv, floor: B.floor, walls: B.walls, bg: B.bg, n: B.walls ? B.walls.size : 0, t: B.terrain, tn: B.terrain ? B.terrain.size : 0, rev: B.boardRev, N: B.N, voids: B.voids }; return cv;
  }
  // The scene behind the board, by setting.
  const bgCache = {};
  function backdrop(bg) {
    if (bgCache[bg] && bgCache[bg].width === Math.round(320 * B.RES)) return bgCache[bg];
    const cv = bgCache[bg] = document.createElement('canvas'); cv.width = Math.round(320 * B.RES); cv.height = Math.round(240 * B.RES); const c = cv.getContext('2d'); c.scale(B.RES / 2, B.RES / 2);
    const col = B.BG[bg] || B.BG.forest, r = rnd(bg.length * 977 + bg.charCodeAt(0));
    const g = c.createLinearGradient(0, 0, 0, 480); g.addColorStop(0, col[0]); g.addColorStop(0.55, col[1]); g.addColorStop(1, col[2]); c.fillStyle = g; c.fillRect(0, 0, 640, 480);
    const dark = (a) => 'rgba(0,0,0,' + a + ')', sil = (a, fn) => { c.fillStyle = dark(a); c.beginPath(); fn(); c.fill(); };
    if (bg === 'forest' || bg === 'fen') {
      for (let layer = 0; layer < 3; layer++) {
        const base = 120 + layer * 70, a = 0.16 + layer * 0.1;
        sil(a, () => { c.moveTo(0, 480); for (let x = 0; x <= 640; x += 12) c.lineTo(x, base - 30 * Math.sin(x / 90 + layer) - r() * 26); c.lineTo(640, 480); });
        if (bg === 'forest') for (let i = 0; i < 18; i++) { const x = r() * 640, h = 40 + r() * 50, w = 14 + r() * 12; sil(a, () => { c.moveTo(x, base - h - 20); c.lineTo(x - w, base + 10); c.lineTo(x + w, base + 10); }); }
      }
      if (bg === 'fen') for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(220,235,220,.06)'; c.fillRect(0, 140 + i * 50 + r() * 20, 640, 14 + r() * 10); }
    } else if (bg === 'cave' || bg === 'sewer') {
      for (let i = 0; i < 30; i++) { const x = r() * 640, h = 20 + r() * 70, w = 8 + r() * 16; sil(0.35, () => { c.moveTo(x - w, 0); c.lineTo(x, h); c.lineTo(x + w, 0); }); }
      for (let i = 0; i < 14; i++) { const x = r() * 640, h = 14 + r() * 40, w = 10 + r() * 20; sil(0.3, () => { c.moveTo(x - w, 480); c.lineTo(x, 480 - h); c.lineTo(x + w, 480); }); }
    } else if (bg === 'crypt' || bg === 'throne') {
      for (let i = 0; i < 7; i++) { const x = i * 100 - 10; sil(0.28, () => { c.rect(x, 40, 22, 440); }); sil(0.22, () => { c.moveTo(x + 22, 120); c.quadraticCurveTo(x + 61, 30, x + 100, 120); c.lineTo(x + 100, 100); c.quadraticCurveTo(x + 61, 10, x + 22, 100); }); }
      if (bg === 'throne') for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(160,60,200,.08)'; c.fillRect(60 + i * 120, 0, 18, 480); }
    } else if (bg === 'city' || bg === 'town') {
      let x = 0; while (x < 640) { const w = 30 + r() * 50, h = 40 + r() * 70; sil(0.22, () => { c.rect(x, 110 - h, w, h + 400); c.moveTo(x - 4, 110 - h); c.lineTo(x + w / 2, 80 - h); c.lineTo(x + w + 4, 110 - h); }); if (r() < 0.6) { c.fillStyle = 'rgba(255,210,120,.25)'; c.fillRect(x + w / 2 - 3, 120 - h * 0.6, 5, 7); } x += w + 4; }
    } else if (bg === 'snow') {
      sil(0.18, () => { c.moveTo(0, 300); for (let x = 0; x <= 640; x += 40) c.lineTo(x, 120 + (x / 40 % 2 ? 0 : 70) + r() * 40); c.lineTo(640, 300); });
      c.fillStyle = 'rgba(255,255,255,.18)'; for (let x = 0; x <= 640; x += 80) { c.beginPath(); c.moveTo(x - 14, 150); c.lineTo(x, 125); c.lineTo(x + 14, 150); c.fill(); }
    } else if (bg === 'ash') {
      sil(0.32, () => { c.moveTo(0, 480); for (let x = 0; x <= 640; x += 16) c.lineTo(x, 140 + r() * 60); c.lineTo(640, 480); });
      const gl = c.createLinearGradient(0, 300, 0, 480); gl.addColorStop(0, 'rgba(255,90,30,0)'); gl.addColorStop(1, 'rgba(255,90,30,.22)'); c.fillStyle = gl; c.fillRect(0, 300, 640, 180);
    } else if (bg === 'tavern') {
      for (let y = 0; y < 480; y += 18) { c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, y, 640, 1); }
      for (let x = 30; x < 640; x += 150) { c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(x, 0, 16, 480); }
      for (let i = 0; i < 4; i++) { const x = 80 + i * 160, gl = c.createRadialGradient(x, 50, 2, x, 50, 60); gl.addColorStop(0, 'rgba(255,200,110,.35)'); gl.addColorStop(1, 'rgba(255,200,110,0)'); c.fillStyle = gl; c.fillRect(x - 60, 0, 120, 120); }
    } else if (bg === 'beach') {
      c.fillStyle = 'rgba(255,255,255,.2)'; for (let i = 0; i < 12; i++) c.fillRect(r() * 640, 60 + r() * 120, 30 + r() * 40, 2);
    }
    // vignette
    const v = c.createRadialGradient(320, 250, 160, 320, 250, 430); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)'); c.fillStyle = v; c.fillRect(0, 0, 640, 480);
    return (bgCache[bg] = cv);
  }
  // Drifting motes for the setting: leaves, fireflies, dust, snow, embers.
  const MOTES = { forest: ['#d8f07a', 0.5, -1], fen: ['#c8f0b0', 0.6, -1], cave: ['#d8ccb8', 0.25, 1], sewer: ['#a8c8a8', 0.25, 1], crypt: ['#b8c8f0', 0.3, -1], throne: ['#d49cf0', 0.45, -1], snow: ['#ffffff', 0.9, 1], ash: ['#ff9a4a', 0.7, -1], town: ['#fff0c8', 0.2, 1], city: ['#fff0c8', 0.2, 1], tavern: ['#ffd890', 0.3, -1], beach: ['#ffffff', 0.25, 1] };
  function motes(c) {
    const m = MOTES[B.bg] || MOTES.forest, t = G.time / 1000;
    c.fillStyle = m[0];
    for (let i = 0; i < 26; i++) {
      const sp = 6 + (i * 7) % 11, x = ((i * 97 + t * sp * (i % 2 ? 1 : -0.6)) % 340 + 340) % 340 - 10, y0 = (i * 53) % 240;
      const y = ((y0 + m[2] * t * sp * 0.9) % 250 + 250) % 250 - 5, a = m[1] * (0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + i)));
      c.globalAlpha = a; c.fillRect(x + Math.sin(t + i) * 3, y, B.bg === 'snow' ? 1.5 : 1, B.bg === 'snow' ? 1.5 : 1);
    }
    c.globalAlpha = 1;
  }
  // Small particles: sparks, dust and motes thrown by hits and spells.
  B.parts = [];
  B.spark = function (x, y, color, n, speed, life, grav) {
    if (G.fast || B.parts.length > 800) return;                  // nothing is drawn while skipping; and never let them pile up
    for (let i = 0; i < (n || 8); i++) { const an = Math.random() * 6.283, sp = (speed || 40) * (0.4 + Math.random() * 0.8); B.parts.push({ x, y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp - (grav ? 20 : 0), t: 0, life: (life || 450) * (0.6 + Math.random() * 0.6), color, g: grav || 0 }); }
  };
  function drawParts(c, dt) {
    const s = dt / 1000; B.parts = B.parts.filter(p => (p.t += dt) < p.life);
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const p of B.parts) { p.x += p.vx * s; p.y += p.vy * s; p.vy += p.g * s; p.vx *= 0.96; const a = 1 - p.t / p.life; c.globalAlpha = a; c.fillStyle = p.color; c.fillRect(p.x - 0.75, p.y - 0.75, 1.5, 1.5); }
    c.restore();
  }

  /* ---------- drawing the battle ---------- */
  B.BG = {
    forest: ['#1d3a2a', '#2f5a3a', '#3e7c36'], cave: ['#14121c', '#26222e', '#3a332c'], crypt: ['#101018', '#1e1c2c', '#33343e'], fen: ['#26302c', '#3e4a3a', '#4a5530'],
    snow: ['#2a3448', '#4a5a74', '#9aa8bc'], city: ['#1a1a2a', '#2a2a40', '#5a564e'], ash: ['#1a1414', '#2a2020', '#3a2e2a'], throne: ['#0e0a14', '#1e1428', '#2a1e34'],
    sewer: ['#141a16', '#24302a', '#2e3a30'], tavern: ['#1e130e', '#3a2418', '#5a3a24'], town: ['#2a3550', '#4a5a80', '#8a7050'], beach: ['#3a5a80', '#6a8ab0', '#c8b080']
  };
  // high ground lifts whoever stands on it (in between squares, the lift blends)
  const lift = (gx, gy) => { const a = B.high(Math.floor(gx), Math.floor(gy)) ? 4 : 0, b2 = B.high(Math.ceil(gx), Math.ceil(gy)) ? 4 : 0, f = Math.max(gx % 1, gy % 1); return a + (b2 - a) * f; };
  const posAt = (gx, gy) => B.isIso() ? B.isoPos(gx, gy) : ({ x: B.BX + gx * B.TW + B.TW / 2, y: B.BY + gy * B.TH + B.TH - 3 - (B.terrain ? lift(gx, gy) : 0) });
  function unitPos(o) {
    let gx = o.gx, gy = o.gy;
    if (o.anim) {
      const a = (G.time - o.anim.t0) / o.anim.per, p = o.anim.path, i = Math.min(p.length - 1, Math.floor(a)), f = Math.min(1, a - i);
      if (i >= p.length - 1) { gx = p[p.length - 1][0]; gy = p[p.length - 1][1]; }
      else { gx = p[i][0] + (p[i + 1][0] - p[i][0]) * f; gy = p[i][1] + (p[i + 1][1] - p[i][1]) * f; }
      const pos = posAt(gx, gy); if (o.anim.leap) pos.y -= Math.sin(f * Math.PI) * 10; else pos.y -= Math.abs(Math.sin(f * Math.PI)) * 2;
      return pos;
    }
    const pos = posAt(gx, gy);
    if (o.fx) {
      const a = G.time - o.fx.t;
      if (o.fx.k === 'lunge' && a < 220) { const k = Math.sin(a / 220 * Math.PI) * 6; if (B.isIso()) { const v = B.isoVec(o.fx.dx || 0, o.fx.dy || 0); pos.x += v[0] / 14 * k; pos.y += v[1] / 14 * k; } else { pos.x += (o.fx.dx || 0) * k; pos.y += (o.fx.dy || 0) * k * 0.6; } }
      else if (o.fx.k === 'cast' && a < 300) pos.y -= Math.sin(a / 300 * Math.PI) * 3;
      else if (o.fx.k === 'hit' && a < 260) pos.x += (Math.floor(a / 40) % 2 ? 1 : -1);
      else if (o.fx.k === 'enter' && a < 520) pos.x += (1 - a / 520) * 60;
    }
    return pos;
  }
  B.draw = function (c) {
    const dt = G.time - (B.lastT || G.time); B.lastT = G.time;
    c.setTransform(B.RES, 0, 0, B.RES, 0, 0); c.imageSmoothingEnabled = false;
    const th = B.THEME[B.bg] || B.THEME.forest;
    c.imageSmoothingEnabled = true; c.drawImage(backdrop(B.BG[B.bg] ? B.bg : 'forest'), 0, 0, 320, 240); c.imageSmoothingEnabled = false;
    const shake = B.shakeT && G.time - B.shakeT < 220 ? Math.round(Math.sin(G.time / 18) * 2) : 0;
    B.camUpdate(dt);
    c.save(); c.translate(shake, 0); B.camApply(c);
    if (B.punch) {                                              // a short push in on a critical hit or a knockout
      const pa = (G.time - B.punch.t) / 300;
      if (pa >= 1 || !B.punch.o || B.punch.o.px == null) B.punch = null;
      else { const z = 1 + 0.05 * Math.sin(pa * Math.PI) * (1 - pa * 0.4), p = B.center(B.punch.o); c.translate(p.x, p.y); c.scale(z, z); c.translate(-p.x, -p.y); }
    }
    const W = B.N * B.TW, H = B.N * B.TH;
    const units = B.c.filter(o => !o.gone || (o.downT && G.time - o.downT < 450));
    units.forEach(o => { const p = unitPos(o); o.px = p.x; o.py = p.y; });
    if (B.isIso()) B.isoBoard(c, dt, units); else flatBoard(c, units);
    fog(c); drawLight(c, dt); beams(c);
    // bars over pieces
    for (const o of units) {
      if (o.down || o.gone) continue;
      const sz = B.pieceSize(o), x = Math.round(o.px - 7), y = Math.round(o.py - 33 * sz);
      if (!B.showBar(o)) {                                       // a hidden foe bar: its wounds show on the figure instead
        B.statusRow(c, o, o.px, y + 1);
        continue;
      }
      if (o.hpShow == null || o.hpShow < o.hp) o.hpShow = o.hp; else o.hpShow = Math.max(o.hp, o.hpShow - Math.max(0.5, (o.hpShow - o.hp) * 0.06) * dt / 16);
      c.fillStyle = 'rgba(10,8,16,.85)'; c.fillRect(x - 0.5, y - 0.5, 15, 4);
      const fw = 13 * o.hp / o.maxHp, tw = 13 * o.hpShow / o.maxHp, pct = o.hp / o.maxHp;
      c.fillStyle = 'rgba(255,240,220,.85)'; c.fillRect(x + 0.5, y + 0.5, Math.max(0, tw), 2);
      const top = o.side === 1 ? (pct > 0.5 ? '#ff7a6a' : '#ff5a4a') : pct > 0.5 ? '#8af0a0' : pct > 0.25 ? '#ffd86a' : '#ff8a6a', bot = o.side === 1 ? '#a82a2a' : pct > 0.5 ? '#2f9a4a' : pct > 0.25 ? '#b88a2a' : '#b83a2a';
      const bg2 = c.createLinearGradient(0, y, 0, y + 3); bg2.addColorStop(0, top); bg2.addColorStop(1, bot);
      c.fillStyle = bg2; c.fillRect(x + 0.5, y + 0.5, Math.max(0, fw), 2);
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x + 0.5, y + 0.5, Math.max(0, fw), 0.5);
      // hit points, in small figures beside the bar
      c.font = 'bold 6px ui-monospace, Menlo, Consolas, monospace'; c.textAlign = 'left'; c.textBaseline = 'middle';
      const hpTxt = String(o.hp), tx = x + 15;
      c.fillStyle = '#1a1420'; c.fillText(hpTxt, tx + 0.5, y + 2); c.fillText(hpTxt, tx - 0.5, y + 2); c.fillText(hpTxt, tx, y + 2.5); c.fillText(hpTxt, tx, y + 1.5);
      c.fillStyle = o.hp <= o.maxHp / 4 ? '#ff8a7a' : '#f4f1e6'; c.fillText(hpTxt, tx, y + 2);
      c.textBaseline = 'alphabetic';
      B.statusRow(c, o, o.px, y - 3.5);
    }
    B.drawPreview(c);
    B.drawVfx(c);
    drawParts(c, Math.min(dt, 60));
    motes(c);
    c.restore();
    c.save(); B.camApply(c);
    c.textAlign = 'center';
    B.floats = B.floats.filter(f => f.t < 1000);
    for (const f of B.floats) {
      f.t += dt;
      const k = Math.min(1, f.t / 600), y = f.y - 4 - 18 * (1 - (1 - k) * (1 - k)), pop = f.t < 140 ? 1.6 - f.t / 140 * 0.6 : 1, big = f.crit || f.color === '#ffd24a' ? 1.35 : 1;
      c.save(); c.translate(f.x, y); c.scale(pop * big, pop * big); c.globalAlpha = f.t > 750 ? Math.max(0, 1 - (f.t - 750) / 250) : 1;
      c.font = 'bold 9px ui-monospace, Menlo, Consolas, monospace'; c.lineJoin = 'round';
      c.strokeStyle = '#1a1420'; c.lineWidth = 2.5; c.strokeText(f.text, 0, 0);
      c.fillStyle = f.color; c.fillText(f.text, 0, 0);
      if (f.glyph) { const w = c.measureText(f.text).width / 2 + 4; c.beginPath(); c.arc(-w, -3, 3.4, 0, 7); c.fillStyle = 'rgba(26,20,32,.9)'; c.fill(); B.glyph(c, f.glyph, -w, -3, 2.5, f.color); }
      c.restore();
    }
    B.drawBubbles(c);
    c.restore();
    banner(c);
    if (B.flashT && G.time - B.flashT < 110) { c.fillStyle = 'rgba(255,240,200,' + (0.22 * (1 - (G.time - B.flashT) / 110)) + ')'; c.fillRect(0, 0, 320, 240); }
    c.setTransform(1, 0, 0, 1, 0, 0);
  };
  // The flat board: the painted slab, then water, fire, marks, highlights, and the rows back to front.
  function flatBoard(c, units) {
    c.drawImage(boardCanvas(), 0, 0, 320, 240);
    if (B.walls) for (const [k, v] of B.walls) if ((v.kind || v) === 'water') {
      const [gx, gy] = k.split(',').map(Number), x = B.BX + gx * B.TW, y = B.BY + gy * B.TH, t = G.time / 400 + gx * 0.7 + gy * 1.3;
      const wg = c.createLinearGradient(x, y, x, y + B.TH); wg.addColorStop(0, '#3a6aa8'); wg.addColorStop(1, '#22487c'); c.fillStyle = wg; c.fillRect(x, y, B.TW, B.TH);
      c.fillStyle = 'rgba(170,210,255,.55)'; c.fillRect(x + 2 + Math.sin(t) * 2, y + 3, 6, 0.5); c.fillRect(x + 10 + Math.cos(t * 0.8) * 2, y + 7, 6, 0.5);
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x + 6 + Math.sin(t * 1.3) * 3, y + 9.5, 3, 0.5);
    }
    // fire, flickering; then a boss's marked squares, pulsing red
    if (B.terrain) for (const [k, kind] of B.terrain) {
      if (kind !== 'fire') continue;
      const [gx, gy] = k.split(',').map(Number), x = B.BX + gx * B.TW, y = B.BY + gy * B.TH, t = G.time / 120 + gx * 1.3 + gy * 2.1;
      const fg = c.createRadialGradient(x + B.TW / 2, y + B.TH / 2, 1, x + B.TW / 2, y + B.TH / 2, B.TW * 0.7); fg.addColorStop(0, 'rgba(255,170,60,.55)'); fg.addColorStop(1, 'rgba(255,80,30,.08)');
      c.fillStyle = fg; c.fillRect(x, y, B.TW, B.TH);
      for (let i = 0; i < 4; i++) { const fx = x + 3 + i * 4.5, h = 3 + Math.abs(Math.sin(t + i * 1.9)) * 5; c.fillStyle = i % 2 ? 'rgba(255,214,90,.9)' : 'rgba(255,120,40,.9)'; c.beginPath(); c.moveTo(fx - 2, y + B.TH - 2); c.lineTo(fx, y + B.TH - 2 - h); c.lineTo(fx + 2, y + B.TH - 2); c.fill(); }
    }
    if (B.marks && B.marks.length) {
      const a = 0.28 + 0.18 * Math.sin(G.time / 110);
      for (const m of B.marks) for (const k of m.sq) { const [gx, gy] = k.split(',').map(Number), x = B.BX + gx * B.TW, y = B.BY + gy * B.TH;
        c.fillStyle = 'rgba(255,40,30,' + a + ')'; c.fillRect(x + 1, y + 1, B.TW - 2, B.TH - 2); c.strokeStyle = 'rgba(255,90,70,.9)'; c.lineWidth = 0.8; c.strokeRect(x + 1.5, y + 1.5, B.TW - 3, B.TH - 3); }
    }
    if (B.hangs) for (const k of B.hangs.keys()) { const [x, y] = k.split(',').map(Number), cx = B.BX + (x + 0.5) * B.TW, cy = B.BY + (y + 0.5) * B.TH; c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(cx, cy, B.TW * 0.38, B.TH * 0.3, 0, 0, 7); c.fill(); }
    // a small mark in the corner of each square of special ground
    if (B.terrain) for (const [k, kind] of B.terrain) { if (!B.TER_GLYPH[kind]) continue; const [gx, gy] = k.split(',').map(Number); B.terrainMark(c, kind, B.BX + gx * B.TW + 4, B.BY + gy * B.TH + B.TH - 4); }
    // highlights
    const ui = B.ui, sq = (x, y, col) => { c.fillStyle = col; c.fillRect(B.BX + x * B.TW + 1, B.BY + y * B.TH + 1, B.TW - 2, B.TH - 2); };
    if (B.showThreat()) for (const [k, n] of B.threat()) { const [x, y] = k.split(',').map(Number); flatThreat(c, x, y, n); }
    if (ui && ui.show) for (const v of ui.show.values()) if (!v.pass) sq(v.x, v.y, 'rgba(110,170,255,.20)');
    if (ui && ui.valid) {
      const col = { foe: 'rgba(255,90,70,.38)', ally: 'rgba(110,230,140,.38)', move: 'rgba(110,170,255,.40)' }[ui.tint] || 'rgba(255,255,255,.3)';
      for (const k of ui.valid) { const [x, y] = k.split(',').map(Number); sq(x, y, col); }
    }
    if (ui && ui.area) { const [ax, ay] = ui.area.c; for (let dy = -ui.area.r; dy <= ui.area.r; dy++) for (let dx = -ui.area.r; dx <= ui.area.r; dx++) if (B.inside(ax + dx, ay + dy)) sq(ax + dx, ay + dy, 'rgba(255,220,90,.45)'); }
    if (ui && ui.stand) { const [x, y] = ui.stand; c.strokeStyle = '#8ab4ff'; c.lineWidth = 1; c.setLineDash([2, 2]); c.strokeRect(B.BX + x * B.TW + 2.5, B.BY + y * B.TH + 2.5, B.TW - 5, B.TH - 5); c.setLineDash([]); }
    if (ui && ui.cur) {
      const x = B.BX + ui.cur.x * B.TW, y = B.BY + ui.cur.y * B.TH, p = Math.floor(G.time / 200) % 2;
      c.fillStyle = '#ffd24a';
      [[0, 0], [B.TW - 4, 0], [0, B.TH - 2], [B.TW - 4, B.TH - 2]].forEach(([ox, oy]) => { c.fillRect(x + ox - p, y + oy - p + (oy ? 1 : -1), 4, 1); });
      [[0, 0], [B.TW - 1, 0], [0, B.TH - 4], [B.TW - 1, B.TH - 4]].forEach(([ox, oy]) => { c.fillRect(x + ox - (ox ? -p : p), y + oy - p + (oy ? 2 : 0), 1, 4); });
    }
    // active ring
    activeRing(c);
    // rows, back to front: blocks then pieces
    for (let gy = 0; gy < B.N; gy++) {
      if (B.walls) for (let gx = 0; gx < B.N; gx++) { const k = B.walls.get(gx + ',' + gy); if (k) block(c, k, B.BX + gx * B.TW, B.BY + gy * B.TH); }
      units.filter(o => Math.round((o.py - B.BY - B.TH + 3) / B.TH) === gy).sort((a, b) => a.px - b.px).forEach(o => drawUnit(c, o));
    }
    units.filter(o => { const r = Math.round((o.py - B.BY - B.TH + 3) / B.TH); return r < 0 || r >= B.N; }).forEach(o => drawUnit(c, o));
    if (B.terrain) for (const [k, kind] of B.terrain) if (kind === 'smoke') { const [x, y] = k.split(',').map(Number); drawSmoke(c, B.BX + (x + 0.5) * B.TW, B.BY + (y + 0.5) * B.TH, x, y); }
    if (B.hangs) for (const [k, kind] of B.hangs) { const [x, y] = k.split(',').map(Number); drawHang(c, kind, B.BX + (x + 0.5) * B.TW, B.BY + (y + 0.5) * B.TH - 26); }
  }
  // Smoke: soft grey puffs rolling over a square.
  function drawSmoke(c, cx, cy, x, y) {
    const t = G.time / 1000;
    for (let i = 0; i < 3; i++) {
      const ph = t * 0.4 + i * 2.1 + x * 0.7 + y * 1.3, px = cx + Math.sin(ph) * 5, py = cy - 6 - i * 4 + Math.cos(ph * 0.8) * 2, rr = 9 + i * 1.5;
      const g = c.createRadialGradient(px, py, 1, px, py, rr); g.addColorStop(0, 'rgba(120,112,108,.55)'); g.addColorStop(1, 'rgba(120,112,108,0)'); c.fillStyle = g; c.beginPath(); c.arc(px, py, rr, 0, 7); c.fill();
    }
  }
  // Something hanging over a square: a chain up, and the thing itself at (cx, cy); a shadow is drawn on the ground.
  function drawHang(c, kind, cx, cy) {
    const sway = Math.sin(G.time / 700 + cx) * 0.8, x = cx + sway;
    c.strokeStyle = kind === 'chandelier' ? '#4a4d57' : 'rgba(0,0,0,0)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(cx, cy - 18); c.lineTo(x, cy - 2); c.stroke();
    if (kind === 'chandelier') {
      c.fillStyle = '#3a3c46'; c.beginPath(); c.ellipse(x, cy, 8, 2.4, 0, 0, 7); c.fill(); c.strokeStyle = '#8a8c96'; c.lineWidth = 0.7; c.stroke();
      for (let i = 0; i < 4; i++) { const a = i / 4 * 6.283 + 0.4, ex = x + Math.cos(a) * 7, ey = cy + Math.sin(a) * 2 - 1; c.fillStyle = '#f4f1e6'; c.fillRect(ex - 0.6, ey - 3, 1.2, 3);
        const f = Math.sin(G.time / 90 + i * 2); c.fillStyle = 'rgba(255,200,90,.9)'; c.beginPath(); c.ellipse(ex, ey - 4, 0.9, 1.6 + f * 0.3, 0, 0, 7); c.fill();
        const g = c.createRadialGradient(ex, ey - 4, 0, ex, ey - 4, 5); g.addColorStop(0, 'rgba(255,200,100,.35)'); g.addColorStop(1, 'rgba(255,200,100,0)'); c.fillStyle = g; c.fillRect(ex - 5, ey - 9, 10, 10); }
    } else if (kind === 'icicles') {
      c.fillStyle = '#c8dcec'; c.fillRect(x - 8, cy - 4, 16, 2.5); c.fillStyle = '#eef6ff'; c.fillRect(x - 8, cy - 4, 16, 1);
      for (let i = 0; i < 5; i++) { const ix = x - 7 + i * 3.5, ih = 4 + ((i * 7) % 5); c.fillStyle = i % 2 ? '#d8ecfa' : '#b8d4ea'; c.beginPath(); c.moveTo(ix - 1.4, cy - 2); c.lineTo(ix, cy - 2 + ih); c.lineTo(ix + 1.4, cy - 2); c.fill(); }
    } else {
      c.fillStyle = '#5a5250'; c.beginPath(); c.moveTo(x - 9, cy - 5); c.lineTo(x + 8, cy - 6); c.lineTo(x + 6, cy + 1); c.lineTo(x + 1, cy + 3); c.lineTo(x - 7, cy + 1); c.closePath(); c.fill();
      c.strokeStyle = '#2a2420'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(x - 4, cy - 5); c.lineTo(x - 1, cy - 1); c.lineTo(x + 3, cy + 2); c.moveTo(x - 1, cy - 1); c.lineTo(x - 5, cy + 1); c.stroke();
      if (Math.floor(G.time / 400 + cx) % 5 === 0) { c.fillStyle = 'rgba(180,170,160,.7)'; c.fillRect(x - 2 + (G.time / 50 % 4), cy + 4 + (G.time / 30 % 8), 0.8, 0.8); }
    }
  }
  // A square an enemy could strike next turn: a red wash (deeper where several could), its edge marked where it ends.
  function flatThreat(c, x, y, n) {
    const px = B.BX + x * B.TW, py = B.BY + y * B.TH, th = B.threat();
    c.fillStyle = 'rgba(255,60,50,' + Math.min(0.32, 0.12 + 0.07 * n) + ')'; c.fillRect(px, py, B.TW, B.TH);
    c.fillStyle = 'rgba(255,110,90,.85)';
    if (!th.has((x) + ',' + (y - 1))) c.fillRect(px, py, B.TW, 0.7); if (!th.has((x) + ',' + (y + 1))) c.fillRect(px, py + B.TH - 0.7, B.TW, 0.7);
    if (!th.has((x - 1) + ',' + (y))) c.fillRect(px, py, 0.7, B.TH); if (!th.has((x + 1) + ',' + (y))) c.fillRect(px + B.TW - 0.7, py, 0.7, B.TH);
  }
  function activeRing(c) {
    if (B.active && !B.active.down && !B.active.anim) {
      const p = posAt(B.active.gx, B.active.gy), a = 0.55 + 0.35 * Math.sin(G.time / 160), sz = B.pieceSize(B.active);
      c.save(); c.globalCompositeOperation = 'lighter';
      const gl = c.createRadialGradient(p.x, p.y, 1, p.x, p.y, 13 * sz); gl.addColorStop(0, 'rgba(255,210,74,' + (0.35 * a) + ')'); gl.addColorStop(1, 'rgba(255,210,74,0)');
      c.fillStyle = gl; c.beginPath(); c.ellipse(p.x, p.y, 13 * sz, 5 * sz, 0, 0, 7); c.fill(); c.restore();
      c.globalAlpha = a; c.strokeStyle = '#ffd24a'; c.lineWidth = 1; c.setLineDash([3, 2]); c.lineDashOffset = -G.time / 60;
      c.beginPath(); c.ellipse(p.x, p.y, 10 * sz, 3.8 * sz, 0, 0, 7); c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
    }
  }
  function drawUnit(c, o) {
    const sz = B.pieceSize(o), side = o.side === 1 ? 1 : o.guest ? 2 : 0, pc = B.piece(o.sprite, side);
    const w = 20 * sz, h = 32 * sz;
    let alpha = 1;
    if (o.gone) alpha = Math.max(0, 1 - (G.time - o.downT) / 450);
    if (B.has(o, 'hidden')) alpha *= 0.45;
    if (o.fx && o.fx.k === 'enter' && G.time - o.fx.t < 520) alpha *= (G.time - o.fx.t) / 520;
    // a soft shadow under the base
    if (!o.down) { const sg = c.createRadialGradient(o.px, o.py + 1, 1, o.px, o.py + 1, 10 * sz); sg.addColorStop(0, 'rgba(0,0,0,' + (0.42 * alpha) + ')'); sg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = sg; c.beginPath(); c.ellipse(o.px + 1, o.py + 1, 10 * sz, 4 * sz, 0, 0, 7); c.fill(); }
    if (o.bob == null) o.bob = Math.random() * 6.283;
    const breathe = o.down || o.anim ? 0 : Math.sin(G.time / 520 + o.bob) * 0.5;
    c.globalAlpha = alpha;
    c.save(); c.translate(o.px, Math.round(o.py * 2) / 2);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    const face = B.isIso() ? B.isoFace(o) : o.face;
    if (o.down && !o.gone) { c.globalAlpha = 0.55 * alpha; c.rotate(face > 0 ? -1.45 : 1.45); c.translate(0, 3); }
    if (face < 0) c.scale(-1, 1);
    const ring = !o.down && !o.gone ? (o === B.active ? '#ffd24a' : B.ui && B.ui.cur && B.ui.tint === 'foe' && B.ui.cur.x === o.gx && B.ui.cur.y === o.gy && o.side === 1 ? '#ff5a4a' : B.ui && B.ui.cur && B.ui.tint === 'ally' && B.ui.cur.x === o.gx && B.ui.cur.y === o.gy ? '#8af0a0' : null) : null;
    if (ring) {                                                 // a glowing outline on the piece whose turn it is, or the one being aimed at
      const tc = B.pieceTint(o.sprite, side, ring), ga = c.globalAlpha; c.globalAlpha = ga * (0.55 + 0.3 * Math.sin(G.time / 150));
      for (const [ox, oy] of [[-0.75, 0], [0.75, 0], [0, -0.75], [0, 0.75]]) c.drawImage(tc, -w / 2 + ox, -h + 3 + breathe + oy, w, h - breathe);
      c.globalAlpha = ga;
    }
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    const ws = o.down || o.gone ? 0 : B.woundStage(o), wk = ws ? B.woundKind(o) : null;
    if (ws === 3) { c.translate(Math.sin(G.time / 45 + o.bob) * 0.35, 0); if (wk === 'spirit') c.globalAlpha *= 0.72 + 0.2 * Math.sin(G.time / 90 + o.bob); }
    c.drawImage(ws ? B.woundedPiece(o.sprite, side, ws, wk) : pc, -w / 2, -h + 3 + breathe, w, h - breathe);
    if (o.fx && o.fx.k === 'hit' && G.time - o.fx.t < 200) { c.globalAlpha = (1 - (G.time - o.fx.t) / 200) * 0.85 * alpha; c.drawImage(B.pieceFlash(o.sprite, side), -w / 2, -h + 3 + breathe, w, h - breathe); }
    c.restore(); c.globalAlpha = 1;
  }

  /* ---------- wounds: how hurt a figure is, shown on the figure itself ----------
     Stage 1 under 3/4 health (hurt), 2 under 1/2 (badly hurt), 3 under 1/4 (near death: it trembles). Living things
     bleed, the dead and the made crack, spirits tear and flicker, oozes cloud. Marks are clipped to the figure. */
  B.woundStage = o => { const p = o.hp / o.maxHp; return p > 0.75 ? 0 : p > 0.5 ? 1 : p > 0.25 ? 2 : 3; };
  const SPIRITS = { wisp: 1, marshlight: 1, frostspirit: 1, ashwraith: 1, shade: 1, mirrorshade: 1, wraith: 1 };
  const MADE = { golem: 1, automaton: 1, colossus: 1 };
  B.woundKind = o => {
    if (SPIRITS[o.sprite]) return 'spirit';
    if (o.sprite === 'ooze') return 'slime';
    if (MADE[o.sprite] || (o.tags || []).includes('construct')) return 'stone';
    const sp = G.D.sprites[o.sprite];
    if ((o.tags || []).includes('undead') || (sp && sp.skel)) return 'bone';
    return 'blood';
  };
  const woundCache = {};
  B.woundedPiece = function (name, side, stage, kind) {
    const k = name + ':' + side + ':' + stage + ':' + kind; if (woundCache[k]) return woundCache[k];
    const src = B.piece(name, side), Wd = src.width, Hd = src.height, u = Wd / 40;
    // places on the figure itself, picked from its own pixels (above the base), the same for every copy of it
    const data = src.getContext('2d').getImageData(0, 0, Wd, Hd).data;
    let seed = 0; for (const ch of name) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const spots = [];
    for (let tries = 0; spots.length < 7 && tries < 900; tries++) {
      const x = 8 + rnd() * 24, y = 12 + rnd() * 34, a = data[(Math.round(y * u) * Wd + Math.round(x * u)) * 4 + 3];
      if (a > 220 && spots.every(p => Math.hypot(p[0] - x, p[1] - y) > 4)) spots.push([x, y, rnd()]);
    }
    const n = [0, 2, 4, 7][stage];
    const layer = document.createElement('canvas'); layer.width = Wd; layer.height = Hd;
    const c = layer.getContext('2d'); c.scale(u, u); c.lineCap = 'round'; c.lineJoin = 'round';
    for (const [x, y, r] of spots.slice(0, n)) {
      const a = -0.5 - r * 0.7, L = 2.6 + r * 2.4, dx = Math.cos(a) * L / 2, dy = Math.sin(a) * L / 2;
      if (kind === 'blood') {
        c.strokeStyle = '#5a0610'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(x - dx, y - dy); c.lineTo(x + dx, y + dy); c.stroke();
        c.strokeStyle = '#d42a3a'; c.lineWidth = 0.45; c.beginPath(); c.moveTo(x - dx * 0.8, y - dy * 0.8); c.lineTo(x + dx * 0.8, y + dy * 0.8); c.stroke();
        if (r > 0.35) { c.strokeStyle = '#8a0c18'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(x + dx * 0.4, y + dy * 0.4); c.lineTo(x + dx * 0.4, y + dy * 0.4 + 1.4 + r * 2); c.stroke(); c.fillStyle = '#8a0c18'; c.beginPath(); c.arc(x + dx * 0.4, y + dy * 0.4 + 1.6 + r * 2, 0.4, 0, 7); c.fill(); }
      } else if (kind === 'bone' || kind === 'stone') {
        const pts = [[x - dx, y - dy]]; for (let i = 1; i <= 3; i++) pts.push([x - dx + dx * 2 * i / 3 + (i % 2 ? 0.7 : -0.7), y - dy + dy * 2 * i / 3 + (i % 2 ? -0.4 : 0.4)]);
        c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 0.5; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0] + 0.35, p[1] + 0.35) : c.moveTo(p[0] + 0.35, p[1] + 0.35)); c.stroke();
        c.strokeStyle = '#140e18'; c.lineWidth = 0.55; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
        c.lineWidth = 0.35; c.beginPath(); c.moveTo(pts[2][0], pts[2][1]); c.lineTo(pts[2][0] + 1.2, pts[2][1] + 1.3); c.stroke();
        if (kind === 'stone' && r > 0.5) { c.fillStyle = 'rgba(20,14,24,.55)'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 1.2, y + 0.4); c.lineTo(x + 0.4, y + 1.3); c.fill(); }
      } else if (kind === 'spirit') {
        const g = c.createRadialGradient(x, y, 0, x, y, 1.6 + r); g.addColorStop(0, 'rgba(10,8,20,.75)'); g.addColorStop(1, 'rgba(10,8,20,0)');
        c.fillStyle = g; c.beginPath(); c.arc(x, y, 1.6 + r, 0, 7); c.fill();
      } else {                                                    // slime: dark clouding
        const g = c.createRadialGradient(x, y, 0, x, y, 2.2 + r); g.addColorStop(0, 'rgba(30,40,10,.6)'); g.addColorStop(1, 'rgba(30,40,10,0)');
        c.fillStyle = g; c.beginPath(); c.arc(x, y, 2.2 + r, 0, 7); c.fill();
      }
    }
    if (stage >= 2) {                                           // the whole figure darkens as it weakens
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.fillStyle = kind === 'blood' ? 'rgba(70,0,12,' + (stage === 3 ? 0.22 : 0.1) + ')' : 'rgba(10,8,20,' + (stage === 3 ? 0.24 : 0.12) + ')';
      c.fillRect(0, 0, Wd, Hd * 0.82);
    }
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'destination-in'; c.drawImage(src, 0, 0);
    const out = document.createElement('canvas'); out.width = Wd; out.height = Hd;
    const oc = out.getContext('2d'); oc.drawImage(src, 0, 0); oc.drawImage(layer, 0, 0);
    woundCache[k] = out; return out;
  };
  /* ---------- the camera: on a small screen the board is zoomed in and follows the action ----------
     Zoom is on by default on touch screens (Options > Battle zoom: Auto / On / Off) and the board's 🔍 button flips it
     for the current fight. The camera centres on the aiming cursor, else on whoever's turn it is, glides there, and never
     shows past the edge of the scene. B.toWorld turns a tap on the screen back into board coordinates. */
  B.CAM_Z = 1.6;
  B.zoomOn = () => {
    if (B.zoomFlip != null) return B.zoomFlip;
    const o = G.opts.bzoom || 'auto';
    return o === 'on' || (o === 'auto' && document.body.classList.contains('touch'));
  };
  B.cam = { z: 1, x: 160, y: 120 };
  B.camUpdate = function (dt) {
    const cam = B.cam, want = B.zoomOn() ? B.CAM_Z : 1;
    let tx = 160, ty = 120;
    if (want > 1) {
      const u = B.ui && B.ui.cur ? null : B.inspected || B.active;
      const p = B.ui && B.ui.cur ? posAt(B.ui.cur.x, B.ui.cur.y) : u && u.px != null ? { x: u.px, y: u.py } : null;
      if (p) { tx = p.x; ty = p.y - 10; }
    }
    const k = Math.min(1, (dt || 16) / 160);
    cam.z += (want - cam.z) * k; cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;
    const hw = 160 / cam.z, hh = 120 / cam.z;                    // keep the view inside the scene
    cam.x = G.clamp(cam.x, hw, 320 - hw); cam.y = G.clamp(cam.y, hh, 240 - hh);
  };
  B.camApply = c => { const cam = B.cam; if (Math.abs(cam.z - 1) < 0.002) return; c.translate(160, 120); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); };
  B.toWorld = (lx, ly) => { const cam = B.cam; return [(lx - 160) / cam.z + cam.x, (ly - 120) / cam.z + cam.y]; };

  // A foe's health bar shows while you point at it or aim at it (or always, if the player chose that in Options).
  B.showBar = function (o) {
    if (o.side !== 1 || G.opts.foeHp === 'always') return true;
    const at = p => p && p.x === o.gx && p.y === o.gy;
    return at(B.ui && B.ui.cur) || at(B.hoverCell) || o === B.inspected;
  };

  // shared with the diamond board (iso.js)
  B._paint = { block, drawUnit, activeRing, tileTex, rnd, hex2, rgb, STYLE, paintTer, drawHang, drawSmoke };
  B.tileCenter = (x, y) => B.isIso() ? B.isoPos(x, y) : { x: B.BX + (x + 0.5) * B.TW, y: B.BY + (y + 0.5) * B.TH };
  B.pieceTint = function (name, side, col) {
    const k = name + ':' + side + ':' + col;
    if (cache[k]) return cache[k];
    const src = B.piece(name, side), cv = document.createElement('canvas'); cv.width = src.width; cv.height = src.height;
    const c = cv.getContext('2d'); c.drawImage(src, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = col; c.fillRect(0, 0, cv.width, cv.height);
    return (cache[k] = cv);
  };
  /* ---------- light, fog and weather over the board ---------- */
  // How dark each setting is, as an rgba wash; dungeons on dark maps get darker still.
  const AMB = { cave: [12, 10, 24, 0.5], crypt: [10, 12, 30, 0.5], sewer: [8, 16, 12, 0.45], throne: [16, 6, 28, 0.5], tavern: [34, 16, 6, 0.28], fen: [12, 22, 28, 0.22], ash: [34, 8, 0, 0.26], city: [12, 12, 34, 0.18], forest: [0, 12, 24, 0.1], snow: [20, 30, 60, 0.08] };
  B.ambient = () => {
    const a = AMB[B.bg]; if (!a) return null;
    const d = typeof Field !== 'undefined' && Field.map && Field.map.def && Field.map.def.dark;
    return d ? [a[0], a[1], a[2], Math.min(0.62, Math.max(a[3], d * 0.7))] : a;
  };
  // Wall torches on the far edge of the board, in the dark places.
  B.torches = () => {
    if (!/^(cave|crypt|sewer|throne|tavern)$/.test(B.bg)) return [];
    if (B.isIso()) return B.isoTorches();
    const W = B.N * B.TW;
    return [0.17, 0.5, 0.83].map(f => { const col = Math.min(B.N - 1, Math.floor(f * B.N)); let top = 0; while (top < B.N - 1 && !B.inside(col, top)) top++; return { x: B.BX + W * f, y: B.BY + top * B.TH - 1 }; });
  };
  let lightCv = null;
  const rgbOf = col => { try { return col && col[0] === '#' && col.length === 7 ? hex2(col).join(',') : '255,230,190'; } catch (e) { return '255,230,190'; } };
  function flame(c, x, y, t, pole) {
    const f = Math.sin(t * 12 + x) * 0.6 + Math.sin(t * 31 + x * 2) * 0.3;
    c.fillStyle = '#2a1e16'; c.fillRect(x - 0.75, y - 1, 1.5, 6 + (pole || 0)); c.fillStyle = '#6a4a30'; c.fillRect(x - 2, y - 1.5, 4, 1.5);
    c.save(); c.globalCompositeOperation = 'lighter';
    [[4.4, 'rgba(255,110,30,.5)'], [3.1, 'rgba(255,170,60,.8)'], [1.7, 'rgba(255,240,190,.95)']].forEach(([r, col], i) => {
      c.fillStyle = col; c.beginPath(); c.ellipse(x + f * 0.4 * (3 - i) / 3, y - 2 - r * 0.85, r * 0.55, r * 1.25 + f * 0.35, 0, 0, 7); c.fill();
    });
    c.restore();
  }
  function drawLight(c, dt) {
    const amb = B.ambient(), t = G.time / 1000, torches = B.torches();
    if (!amb) return;
    const Wd = Math.round(320 * B.RES), Hd = Math.round(240 * B.RES);
    if (!lightCv || lightCv.width !== Wd) { lightCv = document.createElement('canvas'); lightCv.width = Wd; lightCv.height = Hd; }
    const l = lightCv.getContext('2d'), glows = [];
    l.setTransform(1, 0, 0, 1, 0, 0); l.globalCompositeOperation = 'source-over'; l.clearRect(0, 0, Wd, Hd);
    l.fillStyle = 'rgba(' + amb[0] + ',' + amb[1] + ',' + amb[2] + ',' + amb[3] + ')'; l.fillRect(0, 0, Wd, Hd);
    l.setTransform(B.RES, 0, 0, B.RES, 0, 0); l.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, s) => { if (r <= 0 || s <= 0) return; const g = l.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(0,0,0,' + s + ')'); g.addColorStop(0.5, 'rgba(0,0,0,' + (s * 0.6) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)'); l.fillStyle = g; l.beginPath(); l.arc(x, y, r, 0, 7); l.fill(); };
    for (const o of B.c) {
      if (o.gone || o.px == null) continue;
      const sz = B.pieceSize(o), act = o === B.active;
      hole(o.px, o.py - 10 * sz, (o.side === 1 ? 17 : 25) * sz * (act ? 1.35 : 1), o.down ? 0.25 : o.side === 1 ? 0.5 : 0.8);
    }
    for (const tc of torches) { const f = 1 + Math.sin(t * 9 + tc.x) * 0.05 + Math.sin(t * 23 + tc.x * 3) * 0.03; hole(tc.x, tc.y + 8, 62 * f, 0.95); glows.push([tc.x, tc.y + 4, 40 * f, '255,160,70', 0.22]); }
    for (const v of (B.vfx || [])) {
      if (v.k === 'whiff') continue;
      const a = Math.min(1, (G.time - v.t0) / v.dur); let p = null;
      if (v.k === 'proj' && v.from && v.to) { const fr = B.center(v.from), to = B.center(v.to); p = { x: fr.x + (to.x - fr.x) * a, y: fr.y + (to.y - fr.y) * a }; }
      else if (v.to) p = B.center(v.to);
      else if (v.at) p = B.tileCenter(v.at[0], v.at[1]);
      if (!p) continue;
      const r = (v.k === 'blast' ? 30 + (v.r || 1) * 22 : v.k === 'proj' ? 26 : 42) * (1 - a * 0.5);
      hole(p.x, p.y, r, 0.95 * (1 - a * 0.7));
      glows.push([p.x, p.y, r * 0.75, rgbOf(v.color), 0.3 * (1 - a)]);
    }
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(lightCv, 0, 0); c.restore();
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const [x, y, r, col, s] of glows) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + col + ',' + s + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
    c.restore();
    for (const tc of torches) { flame(c, tc.x, tc.y, t, tc.pole); if (Math.random() < dt / 700) B.spark(tc.x, tc.y - 5, '#ffb060', 1, 10, 900, -6); }
  }
  // Low fog rolling across the board in the fens, crypts and caves.
  function fog(c) {
    if (!/^(fen|crypt|cave|sewer|throne)$/.test(B.bg)) return;
    const t = G.time / 1000, W = B.N * B.TW, H = B.N * B.TH, col = B.bg === 'fen' ? '210,230,215' : B.bg === 'throne' ? '190,150,230' : '190,200,230';
    c.save();
    for (let i = 0; i < 5; i++) {
      const y = B.BY + H * (0.2 + i * 0.18) + Math.sin(t * 0.4 + i) * 3, x = B.BX + ((t * (5 + i * 2) + i * 70) % (W + 120)) - 60, rx = 70 + i * 8, ry = 7 + (i % 2) * 3;
      const g = c.createRadialGradient(x, y, 0, x, y, rx); g.addColorStop(0, 'rgba(' + col + ',' + (B.bg === 'fen' ? 0.12 : 0.08) + ')'); g.addColorStop(1, 'rgba(' + col + ',0)');
      c.fillStyle = g; c.save(); c.translate(x, y); c.scale(1, ry / rx); c.beginPath(); c.arc(0, 0, rx, 0, 7); c.fill(); c.restore();
    }
    c.restore();
  }
  // Soft shafts of daylight falling across the board out of doors.
  function beams(c) {
    if (!/^(forest|town|beach|snow)$/.test(B.bg)) return;
    const t = G.time / 1000;
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const x = 60 + i * 70 + Math.sin(t * 0.2 + i) * 6, a = 0.035 + 0.02 * Math.sin(t * 0.6 + i * 1.7);
      const g = c.createLinearGradient(x, 0, x + 60, 240); g.addColorStop(0, 'rgba(255,245,210,' + a + ')'); g.addColorStop(1, 'rgba(255,245,210,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 18, 0); c.lineTo(x + 78, 240); c.lineTo(x + 46, 240); c.closePath(); c.fill();
    }
    c.restore();
  }
  // "Round 3", or a boss's name plate, swept across the board.
  function banner(c) {
    const bn = B.banner; if (!bn) return;
    const a = (G.time - bn.t0) / bn.dur; if (a >= 1 || G.fast) { B.banner = null; return; }
    const cy = B.BY + B.N * B.TH / 2, inA = Math.min(1, a / 0.15), outA = a > 0.8 ? 1 - (a - 0.8) / 0.2 : 1, al = inA * outA, h = bn.boss ? 34 : 20;
    const slide = (1 - inA) * -40 + (a > 0.8 ? (a - 0.8) / 0.2 * 40 : 0);
    c.save(); c.globalAlpha = al * 0.88;
    const g = c.createLinearGradient(0, 0, 320, 0); g.addColorStop(0, 'rgba(10,8,20,0)'); g.addColorStop(0.22, 'rgba(10,8,20,.92)'); g.addColorStop(0.78, 'rgba(10,8,20,.92)'); g.addColorStop(1, 'rgba(10,8,20,0)');
    c.fillStyle = g; c.fillRect(0, cy - h / 2, 320, h);
    c.globalAlpha = al; c.fillStyle = bn.boss ? '#c8402a' : '#e8c14a'; c.fillRect(50, cy - h / 2, 220, 0.5); c.fillRect(50, cy + h / 2 - 0.5, 220, 0.5);
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    const F = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
    if (bn.sub) { c.font = 'bold 6px ' + F; c.fillStyle = '#ff8a6a'; c.fillText(bn.sub.split('').join(' '), 160 + slide, cy - 9); }
    c.font = 'bold ' + (bn.boss ? 12 : 10) + 'px ' + F; c.strokeStyle = '#120c18'; c.lineWidth = 3;
    const ty = cy + (bn.sub ? 4 : 0.5); c.strokeText(bn.text, 160 + slide, ty); c.fillStyle = bn.boss ? '#ffe2c8' : '#f4e6b8'; c.fillText(bn.text, 160 + slide, ty);
    c.restore(); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  }

  /* ---------- the party strip ---------- */
  B.refresh = function () {
    if (!B.panel) return;
    let h = '';
    for (const c of B.c) {
      if (c.side !== 0 || c.guest) continue;
      const tags = c.statuses.map(s => '<em class="' + (G.D.statuses[s.id].good ? 'g' : 'b') + '">' + UI.esc(G.D.statuses[s.id].name) + '</em>').join('');
      h += '<div class="pcell' + (c === B.active ? ' act' : '') + (c.down ? ' dn' : '') + '"><div class="pn">' + UI.esc(c.name) + '<span class="pmv">' + (c.mov ? ' ' + c.mov + '▸' : '') + '</span></div>' +
        '<div class="pv">' + UI.bar(c.hp, c.maxHp, 'hp') + '<b>' + c.hp + '</b>/' + c.maxHp + '</div>' +
        '<div class="pv">' + UI.bar(c.sp, c.maxSp, 'sp') + '<b>' + c.sp + '</b>/' + c.maxSp + '</div><div class="ps">' + (c.down ? '<em class="b">Down</em>' : tags) + '</div></div>';
    }
    B.panel.innerHTML = h;
    B.drawTurns();
  };
  /* ---------- the turn-order ribbon: who has gone, who is up, who comes next this round ---------- */
  const faces = {};
  function face(sprite, side) {
    const k = sprite + ':' + side; if (faces[k]) return faces[k];
    let pc = B.piece(sprite, side), ks = HD;
    const cv = document.createElement('canvas'); cv.width = 96; cv.height = 96;
    if (B.heroicOn && B.heroicOn(sprite)) {                      // heroic heads are small: paint them again, larger, for a sharp face
      ks = 14; pc = document.createElement('canvas'); pc.width = 40 * ks; pc.height = 64 * ks;
      const pcc = pc.getContext('2d'); pcc.scale(ks, ks); pcc.lineJoin = 'round'; pcc.lineCap = 'round'; const after = B.heroPainter(sprite)(pcc); if (after) after(pcc);
    }
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    const isBeast = !G.D.sprites[sprite], box = (isBeast && B.beastFace && B.beastFace(sprite)) || (B.heroFace && B.heroFace(sprite));
    const spec = Object.assign({}, G.D.sprites[sprite], (G.D.looks || {})[sprite], (G.D.battleLooks || {})[sprite]);
    const [sx, sy, sw] = box || (!isBeast && B.specFace ? B.specFace(spec) : [4, isBeast ? 16 : 3, 32]);   // the head and shoulders, in the piece's 40x64 layout
    c.drawImage(pc, sx * ks, sy * ks, sw * ks, sw * ks, 0, 0, 96, 96);
    return (faces[k] = cv.toDataURL());
  }
  B.faceURL = face;
  B.drawTurns = function () {
    const el = B.turnEl; if (!el) return;
    const order = (B.order || []).filter(c => B.c.indexOf(c) >= 0);
    if (!order.length) { el.innerHTML = ''; return; }
    const ti = B.turnIdx || 0;
    let h = '<span class="trnd">R' + (B.round || 1) + '</span>';
    order.forEach((c, i) => {
      const side = c.side === 1 ? 1 : c.guest ? 2 : 0;
      const cls = 'tchip s' + side + (c === B.active ? ' now' : '') + (i < ti && c !== B.active ? ' done' : '') + (c.down ? ' dn' : '');
      h += '<span class="' + cls + '" title="' + UI.esc(c.name) + '"><img src="' + face(c.sprite, side) + '">' + (side === 1 && G.opts.foeHp !== 'always' ? '' : '<i style="width:' + Math.round(100 * Math.max(0, c.hp) / c.maxHp) + '%"></i>') + '</span>';
      if (c === B.active) h += '<span class="tarrow">▸</span>';
    });
    const now = B.active ? B.active.name : '';
    const next = order.slice(ti + 1).find(c => !c.down) || order.find(c => !c.down && c !== B.active);   // the order holds: round's end wraps to the top
    h += '<span class="tnow">' + (now ? UI.esc(now) + "'s turn" : '') + (next ? ' · next: ' + UI.esc(next.name) : '') + '</span>';
    el.innerHTML = h;
  };
})();
