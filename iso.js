/* The diamond board: the same 12x12 battle seen from an angle, the way tactics games are, with high ground
   standing up as real blocks. It turns in quarter steps (a short spin between them), so nothing stays hidden.
   Grid squares, rules and pieces are exactly those of the flat board; only drawing and pointing change.
   Grid point (x, y, z) -> screen: rotate (x, y) about the board's middle by the view angle, then
   sx = OX + (rx - ry) * HW, sy = OY + (rx + ry) * HH - z. Squares are drawn back to front by rx + ry.
   The ground is painted once per fight onto a square canvas, then laid onto the board with one transform. */
(function () {
  const OX = 168, OY = 122, HIGH = 7, SLAB = 9, P = 48, SPIN = 380;
  let HW = 12, HH = 6;                         // a square's half-width and half-height: the board keeps its size on screen whatever N is
  const P_ = () => B._paint;
  B.isIso = () => !G.opts || G.opts.bview !== 'flat';

  /* ---------- the view angle ---------- */
  B.rot = 0;                                   // quarter turns, counted on (not wrapped) so a spin always goes the short way
  let rotFrom = 0, rotT0 = -1e9, angT = null, cs = 1, sn = 0, shown = 0;
  function angle() {
    HW = 144 / B.N; HH = 72 / B.N;
    if (angT === G.time) return;
    angT = G.time;
    const k = G.fast ? 1 : Math.min(1, (G.time - rotT0) / SPIN), e = 1 - Math.pow(1 - k, 3);
    shown = rotFrom + (B.rot - rotFrom) * e;
    const a = shown * Math.PI / 2; cs = Math.cos(a); sn = Math.sin(a);
  }
  B.isoTurning = () => { angle(); return Math.abs(shown - B.rot) > 0.001; };
  function R(x, y) { angle(); const c = B.N / 2, dx = x - c, dy = y - c; return [dx * cs - dy * sn, dx * sn + dy * cs]; }
  const proj = (x, y, z) => { const [rx, ry] = R(x, y); return [OX + (rx - ry) * HW, OY + (rx + ry) * HH - (z || 0)]; };
  const depth = (x, y) => { const [rx, ry] = R(x, y); return rx + ry; };
  B.isoP = proj;
  B.isoVec = (dx, dy) => { angle(); const rx = dx * cs - dy * sn, ry = dx * sn + dy * cs; return [(rx - ry) * HW, (rx + ry) * HH]; };
  const hOf = (x, y) => !B.inside(x, y) ? -SLAB : B.high(x, y) ? HIGH : 0;
  // A unit's foot point; between squares (while walking) the height blends.
  B.isoPos = function (gx, gy) {
    const a = hOf(Math.floor(gx), Math.floor(gy)), b = hOf(Math.ceil(gx), Math.ceil(gy)), f = Math.max(gx % 1, gy % 1);
    const p = proj(gx + 0.5, gy + 0.5, Math.max(0, a + (b - a) * f)); return { x: p[0], y: p[1] };
  };
  // Pieces face left or right on screen: whichever way their last step or swing points from this angle.
  B.isoFace = function (o) {
    const d = o.fdir || [o.face || 1, 0], v = B.isoVec(d[0], d[1]);
    if (Math.abs(v[0]) < 0.5) return o.face || 1;
    return v[0] > 0 ? 1 : -1;
  };
  // The square as a path, its top at its own height (or z), shrunk by inset squares on each side.
  B.isoPath = function (c, x, y, inset, z) {
    const i = inset || 0, h = z == null ? Math.max(0, hOf(x, y)) : z;
    const pts = [[x + i, y + i], [x + 1 - i, y + i], [x + 1 - i, y + 1 - i], [x + i, y + 1 - i]].map(([a, b]) => proj(a, b, h));
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < 4; k++) c.lineTo(pts[k][0], pts[k][1]); c.closePath();
    return pts;
  };

  /* ---------- turning and switching ---------- */
  B.turnView = function (d) {
    if (!B.isIso() || G.scene !== 'battle') return;
    angle(); rotFrom = shown; B.rot += d; rotT0 = G.time; angT = null;
    if (G.audio) G.audio.sfx('move');
    B.refreshView();
  };
  B.toggleView = function () {
    G.opts.bview = B.isIso() ? 'flat' : 'iso'; G.saveOpts();
    if (B.isIso()) { B.rot = rotFrom = startRot(); rotT0 = -1e9; angT = null; }
    if (G.audio) G.audio.sfx('select');
    B.refreshView();
  };
  // Each fight opens turned so the party stands on the near side of the board, to the right (clear of the
  // command list on the left).
  function startRot() {
    const party = (B.c || []).filter(u => u.side === 0 && !u.gone);
    if (!party.length) return 0;
    let best = 0, bv = -1e9;
    for (let r = 0; r < 4; r++) {
      const a = r * Math.PI / 2, c0 = Math.cos(a), s0 = Math.sin(a), m = B.N / 2;
      const v = party.reduce((t, u) => { const dx = u.gx + 0.5 - m, dy = u.gy + 0.5 - m; const rx = dx * c0 - dy * s0, ry = dx * s0 + dy * c0; return t + (rx + ry) + 0.3 * (rx - ry); }, 0);
      if (v > bv) { bv = v; best = r; }
    }
    return best;
  }
  B.isoNewFight = function () { B.rot = rotFrom = startRot(); rotT0 = -1e9; angT = null; B._isoFor = B.c; };
  // The small buttons beside the board: switch view, turn left, turn right.
  B.buildViewButtons = function () {
    if (B.viewEl) B.viewEl.remove();
    const el = UI.el('div', 'bview');
    const btn = (txt, title, fn) => { const b = UI.el('button', 'bvb', txt); b.title = title; b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (G.audio) G.audio.unlock(); fn(); }); el.appendChild(b); return b; };
    B.viewBtn = btn('', 'Switch board view (' + (G.keyName ? G.keyName((G.bindings().bview || [])[0]) : 'V') + ')', () => B.toggleView());
    B.threatBtn = btn('⚔', 'Show where enemies can strike next turn (T)', () => B.toggleThreat());
    btn('⟲', 'Turn the board left', () => B.turnView(-1));
    btn('⟳', 'Turn the board right', () => B.turnView(1));
    UI.root.appendChild(el); B.viewEl = el; B.refreshView();
  };
  B.refreshView = function () {
    if (!B.viewEl) return;
    const iso = B.isIso();
    B.viewEl.classList.toggle('flat', !iso);
    if (B.threatBtn) B.threatBtn.classList.toggle('on', !!G.opts.threat);
    B.viewBtn.textContent = iso ? '▦' : '◆';
    B.viewBtn.title = iso ? 'Switch to the flat board' : 'Switch to the diamond board';
  };
  // Arrow keys move the cursor by screen direction: up goes up and to the right, as on the flat board at the
  // opening angle; after a turn, whichever grid direction now points that way.
  B.isoDir = function (b) {
    const want = { up: [1, -2], right: [2, 1], down: [-1, 2], left: [-2, -1] }[b]; if (!want) return null;
    let best = null, bv = -1e9;
    for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const v = B.isoVec(d[0], d[1]), s = v[0] * want[0] + v[1] * want[1] * 2; if (s > bv) { bv = s; best = d; } }
    return best;
  };

  /* ---------- pointing: the topmost thing under the pointer wins ---------- */
  function inPoly(px, py, pts) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  const corners = (x, y, z) => [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]].map(([a, b]) => proj(a, b, z));
  B.isoPick = function (lx, ly) {
    let best = null, bd = -1e9;
    for (let y = 0; y < B.N; y++) for (let x = 0; x < B.N; x++) {
      if (!B.inside(x, y)) continue;
      const h = Math.max(0, hOf(x, y)), d = depth(x + 0.5, y + 0.5);
      if (d <= bd) continue;
      if (inPoly(lx, ly, corners(x, y, h)) || (h && (inPoly(lx, ly, corners(x, y, h / 2)) || inPoly(lx, ly, corners(x, y, 0))))) { best = [x, y]; bd = d; }
    }
    for (const o of B.c || []) {
      if (o.gone || o.px == null) continue;
      const sz = B.pieceSize(o), d = depth(o.gx + 0.5, o.gy + 0.5) + 0.02;
      if (d > bd && lx > o.px - 8 * sz && lx < o.px + 8 * sz && ly > o.py - (o.down ? 8 : 29) * sz && ly < o.py + 3) { best = [o.gx, o.gy]; bd = d; }
    }
    return best;
  };

  /* ---------- the ground, painted once per fight ---------- */
  let gcache = null;
  function ground() {
    const th = B.THEME[B.bg] || B.THEME.forest, g = gcache;
    if (g && g.floor === B.floor && g.walls === B.walls && g.bg === B.bg && g.n === (B.walls ? B.walls.size : 0) && g.t === B.terrain && g.tn === (B.terrain ? B.terrain.size : 0) && g.rev === B.boardRev && g.N === B.N && g.voids === B.voids) return g.cv;
    const { tileTex, rnd, hex2, rgb, STYLE, paintTer } = P_(), N = B.N;
    const key = (B.gid || '') + '|' + B.bg + '|' + (B.walls ? [...B.walls.keys()].join(';') : '') + '|' + (B.terrain ? [...B.terrain].filter(e => e[1] !== 'fire').join(';') : '');
    const r = rnd([...key].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) | 0, 11)), style = STYLE[B.bg] || 'grass';
    const cv = (g && g.cv) || document.createElement('canvas'); cv.width = cv.height = N * P;
    const c = cv.getContext('2d');
    const baseOf = (x, y) => B.floor ? B.floor[y][x] : hex2((x + y) % 2 ? th.b : th.a);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (!B.inside(x, y)) continue;
      const hi = B.high(x, y), col = baseOf(x, y).map(v => v + ((x + y) % 2 ? -6 : 3) + (hi ? 30 : 0)), px = x * P, py = y * P;
      const w = B.walls && B.walls.get(x + ',' + y), wk = w && (w.kind || w);
      if (wk === 'water') {
        const wg = c.createLinearGradient(px, py, px + P, py + P); wg.addColorStop(0, '#3a6aa8'); wg.addColorStop(1, '#22487c'); c.fillStyle = wg; c.fillRect(px, py, P, P);
        c.fillStyle = 'rgba(20,40,80,.5)'; c.fillRect(px, py, P, 2); c.fillRect(px, py, 2, P);
        continue;
      }
      c.fillStyle = rgb(col); c.fillRect(px, py, P, P);
      tileTex(c, px, py, P, P, col, style, r);
      if (B.ter(x, y) === 'rough') {
        for (let i = 0; i < 13; i++) { const sx = px + 3 + r() * (P - 8), sy = py + 3 + r() * (P - 8), sz = 3 + r() * 4.5;
          c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(sx + 0.6, sy + 1.2, sz * 0.62, sz * 0.5, 0, 0, 7); c.fill();
          c.fillStyle = rgb(col, -22); c.beginPath(); c.ellipse(sx, sy, sz * 0.55, sz * 0.45, 0, 0, 7); c.fill();
          c.fillStyle = rgb(col, 24); c.fillRect(sx - sz * 0.3, sy - sz * 0.25, sz * 0.4, 1); }
      }
      const tk = B.ter(x, y); if (tk && tk !== 'rough' && tk !== 'high' && tk !== 'fire') paintTer(c, tk, px, py, P, P, col, r);
      if (hi) { c.strokeStyle = 'rgba(255,250,230,.28)'; c.lineWidth = 2; c.strokeRect(px + 1, py + 1, P - 2, P - 2); }
    }
    // the grid, on the board only
    c.save(); c.globalCompositeOperation = 'source-atop';
    c.fillStyle = 'rgba(0,0,0,.20)'; for (let i = 0; i <= N; i++) { c.fillRect(i * P - 1, 0, 2, N * P); c.fillRect(0, i * P - 1, N * P, 2); }
    c.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < N; i++) { c.fillRect(i * P + 1, 0, 1, N * P); c.fillRect(0, i * P + 1, N * P, 1); }
    c.restore();
    gcache = { cv, floor: B.floor, walls: B.walls, bg: B.bg, n: B.walls ? B.walls.size : 0, t: B.terrain, tn: B.terrain ? B.terrain.size : 0, rev: B.boardRev, N: B.N, voids: B.voids };
    return cv;
  }
  // Lays the ground canvas (or one square of it) onto the board at height z.
  function laid(c, z, sx, sy) {
    const o = proj(0, 0, z), ax = proj(1, 0, z), ay = proj(0, 1, z);
    c.save(); c.transform((ax[0] - o[0]) / P, (ax[1] - o[1]) / P, (ay[0] - o[0]) / P, (ay[1] - o[1]) / P, o[0], o[1]);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    const cv = ground();
    if (sx == null) c.drawImage(cv, 0, 0); else c.drawImage(cv, sx * P, sy * P, P, P, sx * P, sy * P, P, P);
    c.restore();
  }

  /* ---------- solid shapes ---------- */
  // How bright a side is: lit from the upper left of the screen, whichever way the board is turned.
  function sideShade(nx, ny) { const v = B.isoVec(nx, ny), l = Math.hypot(v[0], v[1]) || 1; return -38 - 22 * v[0] / l; }
  const faces = (x, y) => [[[x, y], [x + 1, y], 0, -1], [[x + 1, y], [x + 1, y + 1], 1, 0], [[x + 1, y + 1], [x, y + 1], 0, 1], [[x, y + 1], [x, y], -1, 0]];
  const facing = (nx, ny) => { const v = B.isoVec(nx, ny); return v[1] > 0.01; };
  function quad(c, a, b, z0, z1, fill) {
    const p0 = proj(a[0], a[1], z0), p1 = proj(b[0], b[1], z0), p2 = proj(b[0], b[1], z1), p3 = proj(a[0], a[1], z1);
    c.fillStyle = fill; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.lineTo(p2[0], p2[1]); c.lineTo(p3[0], p3[1]); c.closePath(); c.fill();
    return [p0, p1, p2, p3];
  }
  // A raised square: its sides wherever the ground beside it is lower, then its top.
  function raised(c, x, y, ov) {
    const { rgb, hex2 } = P_(), th = B.THEME[B.bg] || B.THEME.forest, base = B.floor ? B.floor[y][x] : hex2(th.a);
    for (const [a, b, nx, ny] of faces(x, y)) {
      if (!facing(nx, ny) || hOf(x + nx, y + ny) >= HIGH) continue;
      const s = sideShade(nx, ny), top = Math.max(0, hOf(x + nx, y + ny));
      quad(c, a, b, top, HIGH, rgb(base, s));
      quad(c, a, b, HIGH - 1.2, HIGH, rgb(base, s + 30));                        // a lighter lip along the top edge
    }
    laid(c, HIGH, x, y);
    ov(x, y, HIGH);
  }
  // A wall: a stone block with courses of brick on its sides.
  function wallBlock(c, x, y, v, alpha) {
    const { rgb } = P_(), col = v.col || [90, 86, 100], z0 = Math.max(0, hOf(x, y)), H = 19;
    c.save(); c.globalAlpha = alpha;
    for (const [a, b, nx, ny] of faces(x, y)) {
      if (!facing(nx, ny)) continue;
      const s = sideShade(nx, ny) + 18; quad(c, a, b, z0, z0 + H, rgb(col, s));
      c.strokeStyle = rgb(col, s - 26); c.lineWidth = 0.5; c.beginPath();
      for (let k = 1; k < 4; k++) { const zz = z0 + k * H / 4, p = proj(a[0], a[1], zz), q = proj(b[0], b[1], zz); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); }
      for (let k = 0; k < 4; k++) { const f = k % 2 ? 0.25 : 0.62, zz = z0 + k * H / 4, mx = a[0] + (b[0] - a[0]) * f, my = a[1] + (b[1] - a[1]) * f, p = proj(mx, my, zz), q = proj(mx, my, zz + H / 4); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); }
      c.stroke();
    }
    const tp = corners(x, y, z0 + H);
    c.fillStyle = rgb(col, 12); c.beginPath(); tp.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fill();
    c.strokeStyle = rgb(col, 36); c.lineWidth = 0.6; c.stroke();
    c.restore();
  }

  /* ---------- drawing the board ---------- */
  B.isoTorches = function () {
    if (!B.voids) {
      const N = B.N, cs4 = [proj(0, 0, 0), proj(N, 0, 0), proj(N, N, 0), proj(0, N, 0)];
      let bi = 0; cs4.forEach((p, i) => { if (p[1] < cs4[bi][1]) bi = i; });
      const back = cs4[bi], l = cs4[(bi + 3) % 4], r = cs4[(bi + 1) % 4], mid = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      return [mid(back, l, 0.5), back, mid(back, r, 0.5)].map(p => ({ x: p[0], y: p[1] - 13, pole: 12 }));
    }
    // a shaped board: the farthest square in each of three slices across the screen
    const best = [null, null, null];
    for (let y = 0; y < B.N; y++) for (let x = 0; x < B.N; x++) {
      if (!B.inside(x, y)) continue;
      const p = proj(x + 0.5, y + 0.5, 0), slot = p[0] < OX - 50 ? 0 : p[0] > OX + 50 ? 2 : 1;
      if (!best[slot] || p[1] < best[slot][1]) best[slot] = p;
    }
    return best.filter(Boolean).map(p => ({ x: p[0], y: p[1] - HH - 13, pole: 12 }));
  };
  // The slab's shadow and near sides, the ground laid on it, and a soft light from the upper left of the screen.
  let baseCache = null;
  function slab(c) {
    const { rgb, hex2 } = P_(), N = B.N, th = B.THEME[B.bg] || B.THEME.forest, edge = hex2(th.edge), ins = B.inside;
    const tiles = (z, off) => { c.beginPath(); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (ins(x, y)) { const q = corners(x, y, z); c.moveTo(q[0][0], q[0][1] + off); for (let i = 1; i < 4; i++) c.lineTo(q[i][0], q[i][1] + off); c.closePath(); } };
    for (const [off, a] of [[7, 0.18], [4, 0.22], [2, 0.25]]) { c.fillStyle = 'rgba(0,0,0,' + a + ')'; tiles(-SLAB, off); c.fill(); }
    // pits: a dark floor far below
    const pits = B.pitVoids ? B.pitVoids() : new Set();
    for (const k of pits) { const [x, y] = k.split(',').map(Number), q = corners(x, y, -SLAB * 2.5); c.fillStyle = 'rgba(6,4,12,.92)'; c.beginPath(); q.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fill(); }
    // the sides of the slab wherever the next square is missing and the side faces us
    const items = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (!ins(x, y)) continue;
      for (const [a, b, nx, ny] of faces(x, y)) if (!ins(x + nx, y + ny) && facing(nx, ny)) items.push([depth(x + 0.5 + nx * 0.5, y + 0.5 + ny * 0.5), a, b, nx, ny, pits.has(key2(x + nx, y + ny))]);
    }
    items.sort((p, q) => p[0] - q[0]);
    for (const [, a, b, nx, ny, pit] of items) {
      const s = sideShade(nx, ny) + 30, z0 = pit ? -SLAB * 2.5 : -SLAB;
      quad(c, a, b, z0, 0, rgb(edge, s));
      c.strokeStyle = rgb(edge, s - 22); c.lineWidth = 0.5; c.beginPath();
      for (const zz of [-3, -6]) { const p = proj(a[0], a[1], zz), q = proj(b[0], b[1], zz); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); } c.stroke();
      quad(c, a, b, -1, 0, rgb(edge, s + 26));
    }
    // the ground, and a soft light across it from the upper left of the screen
    laid(c, 0);
    const lg = c.createLinearGradient(OX - 130, OY - 70, OX + 130, OY + 70); lg.addColorStop(0, 'rgba(255,240,200,.10)'); lg.addColorStop(0.5, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(0,0,20,.18)');
    c.fillStyle = lg; tiles(0, 0); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 0.7; c.beginPath();
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (!ins(x, y)) continue;
      for (const [a, b, nx, ny] of faces(x, y)) if (!ins(x + nx, y + ny)) { const p = proj(a[0], a[1], 0), q = proj(b[0], b[1], 0); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); }
    }
    c.stroke();
  }
  const key2 = (x, y) => x + ',' + y;
  B.isoBoard = function (c, dt, units) {
    if (B._isoFor !== B.c) B.isoNewFight();
    angle();
    const { block, drawUnit, activeRing } = P_(), N = B.N, t = G.time;
    // the slab, its shadow and the ground: painted once per angle (and every frame only while turning)
    const turning = B.isoTurning(), gcv = ground();
    if (turning) slab(c); else {
      const bc = baseCache;
      if (!bc || bc.g !== gcv || bc.rot !== B.rot || bc.bg !== B.bg || bc.rev !== B.boardRev) {
        const cv = bc && bc.cv || document.createElement('canvas'); cv.width = 320 * B.RES; cv.height = 240 * B.RES;
        const cc = cv.getContext('2d'); cc.setTransform(B.RES, 0, 0, B.RES, 0, 0); slab(cc);
        baseCache = { cv, g: gcv, rot: B.rot, bg: B.bg, rev: B.boardRev };
      }
      c.save(); c.imageSmoothingEnabled = false; c.drawImage(baseCache.cv, 0, 0, 320, 240); c.restore();
    }
    // what lies on a square: water ripples, fire's glow, a boss's marks, the highlights and the cursor
    const ui = B.ui, marks = new Set(), area = new Set();
    for (const m of B.marks || []) for (const k of m.sq) marks.add(k);
    if (ui && ui.area) { const [ax, ay] = ui.area.c; for (let dy = -ui.area.r; dy <= ui.area.r; dy++) for (let dx = -ui.area.r; dx <= ui.area.r; dx++) area.add((ax + dx) + ',' + (ay + dy)); }
    const show = new Set(); if (ui && ui.show) for (const v of ui.show.values()) if (!v.pass) show.add(v.x + ',' + v.y);
    const tint = ui && ui.valid ? ({ foe: 'rgba(255,90,70,.40)', ally: 'rgba(110,230,140,.40)', move: 'rgba(110,170,255,.42)' }[ui.tint] || 'rgba(255,255,255,.3)') : null;
    const pulse = 0.28 + 0.18 * Math.sin(t / 110), threat = B.showThreat() ? B.threat() : null;
    const ov = (x, y, z) => {
      const k = x + ',' + y, w = B.walls && B.walls.get(k);
      if (w && (w.kind || w) === 'water') {
        const tt = t / 400 + x * 0.7 + y * 1.3; c.strokeStyle = 'rgba(170,210,255,.55)'; c.lineWidth = 0.6; c.beginPath();
        for (const [u0, v0, len, ph] of [[0.15, 0.3, 0.35, 0], [0.5, 0.65, 0.3, 2]]) { const du = Math.sin(tt + ph) * 0.08, p = proj(x + u0 + du, y + v0, z), q = proj(x + u0 + du + len, y + v0, z); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); }
        c.stroke();
      }
      if (B.ter(x, y) === 'fire') {
        const p = proj(x + 0.5, y + 0.5, z), fg = c.createRadialGradient(p[0], p[1], 1, p[0], p[1], 14);
        fg.addColorStop(0, 'rgba(255,170,60,.6)'); fg.addColorStop(1, 'rgba(255,80,30,.06)'); c.fillStyle = fg; B.isoPath(c, x, y, 0, z); c.fill();
      }
      if (threat && threat.has(k)) {
        c.fillStyle = 'rgba(255,60,50,' + Math.min(0.32, 0.12 + 0.07 * threat.get(k)) + ')'; B.isoPath(c, x, y, 0, z); c.fill();
        c.strokeStyle = 'rgba(255,110,90,.85)'; c.lineWidth = 0.7; c.beginPath();
        for (const [a, b2, nx, ny] of faces(x, y)) if (!threat.has((x + nx) + ',' + (y + ny))) { const p = proj(a[0], a[1], z), q = proj(b2[0], b2[1], z); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); }
        c.stroke();
      }
      if (marks.has(k)) { c.fillStyle = 'rgba(255,40,30,' + pulse + ')'; B.isoPath(c, x, y, 0.05, z); c.fill(); c.strokeStyle = 'rgba(255,90,70,.9)'; c.lineWidth = 0.8; c.stroke(); }
      if (!ui) return;
      if (show.has(k)) { c.fillStyle = 'rgba(110,170,255,.22)'; B.isoPath(c, x, y, 0.05, z); c.fill(); }
      if (tint && ui.valid.has(k)) { c.fillStyle = tint; B.isoPath(c, x, y, 0.05, z); c.fill(); }
      if (area.has(k)) { c.fillStyle = 'rgba(255,220,90,.45)'; B.isoPath(c, x, y, 0.05, z); c.fill(); }
      if (ui.stand && ui.stand[0] === x && ui.stand[1] === y) { c.strokeStyle = '#8ab4ff'; c.lineWidth = 1; c.setLineDash([2, 2]); B.isoPath(c, x, y, 0.14, z); c.stroke(); c.setLineDash([]); }
      if (ui.cur && ui.cur.x === x && ui.cur.y === y) {
        const a = 0.65 + 0.35 * Math.sin(t / 130);
        c.fillStyle = 'rgba(255,210,74,' + (0.16 * a) + ')'; B.isoPath(c, x, y, 0.02, z); c.fill();
        c.strokeStyle = 'rgba(255,210,74,' + a + ')'; c.lineWidth = 1.1; c.stroke();
      }
    };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (B.inside(x, y) && !B.high(x, y)) ov(x, y, 0);
    if (B.hangs) for (const k of B.hangs.keys()) { const [x, y] = k.split(',').map(Number), p = proj(x + 0.5, y + 0.5, Math.max(0, hOf(x, y))); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(p[0], p[1], HW * 0.6, HH * 0.6, 0, 0, 7); c.fill(); }

    // everything that stands up, back to front
    const items = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const d = depth(x + 0.5, y + 0.5);
      if (B.high(x, y)) items.push({ d, k: 'high', x, y });
      const w = B.walls && B.walls.get(x + ',' + y);
      if (w && (w.kind || w) !== 'water') items.push({ d: d + 0.004, k: 'wall', x, y, w });
      if (B.ter(x, y) === 'fire') items.push({ d: d + 0.003, k: 'fire', x, y });
      if (B.ter(x, y) === 'smoke') items.push({ d: d + 0.02, k: 'smoke', x, y });
      if (B.hangs && B.hangs.has(x + ',' + y)) items.push({ d: d + 0.03, k: 'hang', x, y, kind: B.hangs.get(x + ',' + y) });
    }
    for (const o of units) {
      let gx = o.gx, gy = o.gy;
      if (o.anim) { const a = (t - o.anim.t0) / o.anim.per, p = o.anim.path, i = Math.min(p.length - 1, Math.floor(a)), f = Math.min(1, a - i); if (i >= p.length - 1) [gx, gy] = p[p.length - 1]; else { gx = p[i][0] + (p[i + 1][0] - p[i][0]) * f; gy = p[i][1] + (p[i + 1][1] - p[i][1]) * f; } }
      items.push({ d: depth(gx + 0.5, gy + 0.5) + 0.01 + (o.down ? -0.005 : 0), k: 'unit', o });
    }
    items.sort((a, b) => a.d - b.d);
    // tall things in front of a piece (or of the cursor) fade, so nothing is lost behind them
    const seen = units.filter(o => !o.gone && !o.down).map(o => ({ x: o.px, y: o.py, d: depth(o.gx + 0.5, o.gy + 0.5), h: 30 * B.pieceSize(o) }));
    if (ui && ui.cur) { const p = proj(ui.cur.x + 0.5, ui.cur.y + 0.5, Math.max(0, hOf(ui.cur.x, ui.cur.y))); seen.push({ x: p[0], y: p[1], d: depth(ui.cur.x + 0.5, ui.cur.y + 0.5), h: 8 }); }
    const fadeFor = (x, y, tall) => {
      const p = proj(x + 0.5, y + 0.5, Math.max(0, hOf(x, y))), d = depth(x + 0.5, y + 0.5);
      return seen.some(s => s.d < d && Math.abs(s.x - p[0]) < 17 && s.y < p[1] + 7 && s.y - s.h < p[1] && s.y > p[1] - tall - 4) ? 0.38 : 1;
    };
    for (const it of items) {
      if (it.k === 'high') raised(c, it.x, it.y, ov);
      else if (it.k === 'wall') {
        const kind = it.w.kind || it.w, tall = kind === 'wall' ? 19 : /^(tree|pine|pillar|standing|deadtree)$/.test(kind) ? 28 : 13, a = fadeFor(it.x, it.y, tall);
        if (kind === 'wall') { wallBlock(c, it.x, it.y, it.w, a); continue; }
        const z = Math.max(0, hOf(it.x, it.y)), p = proj(it.x + 0.5, it.y + 0.5, z);
        c.fillStyle = 'rgba(12,8,20,.30)'; B.isoPath(c, it.x, it.y, 0.08, z); c.fill();
        const sg = c.createRadialGradient(p[0], p[1], 1, p[0], p[1], 12); sg.addColorStop(0, 'rgba(0,0,0,.35)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = sg; c.beginPath(); c.ellipse(p[0], p[1], 12, 6, 0, 0, 7); c.fill();
        c.save(); c.globalAlpha = a; block(c, it.w, p[0] - B.TW / 2, p[1] - B.TH + 3, true); c.restore();
      } else if (it.k === 'fire') {
        const z = Math.max(0, hOf(it.x, it.y)), p = proj(it.x + 0.5, it.y + 0.5, z), ft = t / 120 + it.x * 1.3 + it.y * 2.1;
        for (let i = 0; i < 5; i++) { const fx = p[0] - 8 + i * 4, fy = p[1] + 2 - Math.abs(i - 2) * 1.2, h = 3 + Math.abs(Math.sin(ft + i * 1.9)) * 6; c.fillStyle = i % 2 ? 'rgba(255,214,90,.9)' : 'rgba(255,120,40,.9)'; c.beginPath(); c.moveTo(fx - 2, fy); c.lineTo(fx, fy - h); c.lineTo(fx + 2, fy); c.fill(); }
      } else if (it.k === 'smoke') {
        const p = proj(it.x + 0.5, it.y + 0.5, Math.max(0, hOf(it.x, it.y))); P_().drawSmoke(c, p[0], p[1], it.x, it.y);
      } else if (it.k === 'hang') {
        const p = proj(it.x + 0.5, it.y + 0.5, Math.max(0, hOf(it.x, it.y)) + 34); P_().drawHang(c, it.kind, p[0], p[1]);
      } else {
        if (it.o === B.active) activeRing(c);
        drawUnit(c, it.o);
      }
    }
    // a small marker over the cursor's square when no piece stands there to show it
    if (ui && ui.cur && !B.occupant(ui.cur.x, ui.cur.y)) {
      const p = proj(ui.cur.x + 0.5, ui.cur.y + 0.5, Math.max(0, hOf(ui.cur.x, ui.cur.y)) + 13 + Math.sin(t / 180) * 2);
      c.fillStyle = '#1a1420'; c.beginPath(); c.moveTo(p[0] - 4, p[1] - 4); c.lineTo(p[0] + 4, p[1] - 4); c.lineTo(p[0], p[1] + 2); c.closePath(); c.fill();
      c.fillStyle = '#ffd24a'; c.beginPath(); c.moveTo(p[0] - 2.8, p[1] - 3.3); c.lineTo(p[0] + 2.8, p[1] - 3.3); c.lineTo(p[0], p[1] + 0.6); c.closePath(); c.fill();
    }
  };
})();
