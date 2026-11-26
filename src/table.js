/* Every fight on the diamond board is played at a table: the board sits on it in a dark back room, and a hooded
   Dungeon Master with glowing eyes and a grin sits behind his screen at the enemies' end. At the end-of-chapter bosses
   four players in the party's colours sit round the other sides too. Drawn around B.isoBoard; the board is drawn
   smaller and lower so the table fits, and B.isoPos / B.isoPick follow it. Turn the board to walk round the table.
   He reacts to the game: a wider grin when a hero goes down or a foe lands a critical hit, wide eyes at a hero's
   critical, a flare when a boss turns, and he leans in while the party is nearly beaten. */
(function () {
  const T = B.table = { on: false };
  const FIGHTS = ['grukk', 'grukk_duo', 'prior', 'giant', 'colossus', 'corr', 'corr_shaken', 'corrveyra', 'king'], FINAL = ['corr', 'corr_shaken', 'corrveyra', 'king'];
  T.dmOn = () => !!(B.N && B.c && B.isIso && B.isIso() && G.opts.table !== false);
  T.active = T.dmOn;                                   // the table and the DM: every fight on the diamond board
  T.players = () => FIGHTS.includes(B.gid);           // the four players: chapter bosses only
  const SLAB = 9; let M = 1.7; const zk = () => T.players() ? 0.62 : 0.72, zy = () => T.players() ? 24 : 21;
  const syncM = () => { M = T.players() ? 1.7 : 1.0; };   // M: how far the table runs past the board; room for players at the bosses   // ZK, ZY: the board drawn smaller and lower, so the table and its people fit around it                     // the slab's depth; how far the table runs past the board, in squares
  const al = (h, a) => { const n = parseInt(h.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; };
  const sh = (h, p) => { const n = parseInt(h.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v + (p > 0 ? (255 - v) * p / 100 : v * p / 100)))); return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join(''); };
  function glow(c, x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + col + ',' + a + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }

  // which side of the grid is the enemies' end: of the two far edges at the opening view, the one nearer the enemies
  function edgeOf() { if (T._for === B.c && T._edge) return T._edge; const N = B.N, P = B.isoP, foes = B.c.filter(u => u.side === 1); let ax = 0, ay = 0; foes.forEach(u => { ax += u.gx; ay += u.gy; }); ax /= foes.length || 1; ay /= foes.length || 1;
    const mids = { top: [N / 2, 0], bottom: [N / 2, N], left: [0, N / 2], right: [N, N / 2] }, far = Object.keys(mids).sort((a, b) => P(...mids[a], 0)[1] - P(...mids[b], 0)[1]).slice(0, 2);
    const d = e => Math.hypot(mids[e][0] - ax, mids[e][1] - ay); T._edge = d(far[0]) < d(far[1]) ? far[0] : far[1]; T._for = B.c; return T._edge; }
  // a seat: a point beyond the table's edge, in grid terms; 'along' runs 0..1 along that edge
  function seat(edge, along, out, m) { const N = B.N, mm = m == null ? M : m, a = -mm - out, b = N + mm + out, s = along * N;
    return edge === 'top' ? [s, a] : edge === 'bottom' ? [N - s, b] : edge === 'left' ? [a, N - s] : [b, s]; }
  const OPP = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }, SIDES = { top: ['right', 'left'], bottom: ['left', 'right'], left: ['top', 'bottom'], right: ['bottom', 'top'] };
  const PLAYERS = [
    { id: 'runa', col: '#c9512a', hair: '#d0602e', skin: '#e0b090', kind: 'braids', act: 'lean' },
    { id: 'dask', col: '#3a7050', hair: '#2a1c16', skin: '#c89670', kind: 'hood', act: 'dice' },
    { id: 'maren', col: '#3a62a8', hair: '#eeeae2', skin: '#e8c0a8', kind: 'bun', act: 'sheet', sash: '#a83444' },
    { id: 'finch', col: '#9a3046', hair: '#e7bd62', skin: '#eab995', kind: 'hat', act: 'mug', hat: '#5c3456' }
  ];

  /* ---------- the room and the table ---------- */
  function room(c, t) {
    c.fillStyle = '#0c0907'; c.fillRect(0, 0, 320, 240);
    // stone and timber in the dark, a hanging lamp over the table
    c.fillStyle = '#16110c'; for (let x = -10; x < 330; x += 46) c.fillRect(x, 0, 6, 240);
    c.fillStyle = '#120d09'; c.fillRect(0, 18, 320, 4);
    const f = 0.9 + 0.1 * Math.sin(t / 300) * Math.sin(t / 113);
    glow(c, 168, 122, 190 * f, '255,180,100', 0.2);
  }
  function table(c, P, t) {
    const N = B.N, z = -SLAB, cs = [P(-M, -M, z), P(N + M, -M, z), P(N + M, N + M, z), P(-M, N + M, z)];
    // the sides of the table top that face the viewer, then the top
    const lowest = cs.reduce((m, p, i) => p[1] > cs[m][1] ? i : m, 0), th = 9;
    for (const k of [(lowest + 3) % 4, lowest]) { const a = cs[k], b = cs[(k + 1) % 4]; c.fillStyle = k === lowest ? '#2a1a0e' : '#3a2414'; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(b[0], b[1] + th); c.lineTo(a[0], a[1] + th); c.closePath(); c.fill(); }
    c.save(); c.beginPath(); cs.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fillStyle = '#5a3a22'; c.fill(); c.clip();
    // planks running across the table, following its angle
    c.strokeStyle = 'rgba(30,16,8,.55)'; c.lineWidth = 0.6; for (let k = -M; k <= N + M; k += 1.6) { const a = P(k, -M, z), b = P(k, N + M, z); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    c.strokeStyle = 'rgba(255,220,170,.05)'; c.lineWidth = 2; for (let k = -M + 0.5; k <= N + M; k += 1.6) { const a = P(k, -M, z), b = P(k, N + M, z); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    // the lamp's pool of light, darker toward the edges
    const mid = P(N / 2, N / 2, z), g = c.createRadialGradient(mid[0], mid[1], 20, mid[0], mid[1], 200); g.addColorStop(0, 'rgba(255,200,130,.18)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = g; c.fillRect(0, 0, 320, 240);
    c.restore();
    c.strokeStyle = '#7a5232'; c.lineWidth = 0.8; c.beginPath(); cs.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.stroke();
    // a shadow under the board
    c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); [P(-0.4, -0.4, z), P(N + 0.4, -0.4, z), P(N + 0.4, N + 0.4, z), P(-0.4, N + 0.4, z)].forEach((p, i) => i ? c.lineTo(p[0], p[1] + 2) : c.moveTo(p[0], p[1] + 2)); c.closePath(); c.fill();
  }
  // things on the table at a seat: a character sheet, dice, a mug
  function props(c, P, edge, along, t, who) {
    const [gx, gy] = seat(edge, along, -1.3), p = P(gx, gy, -SLAB);
    c.fillStyle = '#e8dcc0'; c.save(); c.translate(p[0], p[1]); c.rotate(0.3); c.fillRect(-5, -3, 10, 7); c.fillStyle = 'rgba(80,60,40,.6)'; for (let i = 0; i < 3; i++) c.fillRect(-4, -2 + i * 2, 7, 0.5); c.restore();
    c.fillStyle = '#8a5a2a'; c.fillRect(p[0] + 8, p[1] - 5, 4, 5); c.fillStyle = 'rgba(255,240,210,.7)'; c.fillRect(p[0] + 8, p[1] - 5, 4, 1);
    if (who.act === 'dice') { const roll = (t % 6000) < 900, k = ((t % 6000) / 900); const dx = roll ? -6 + k * 12 : 6, dy = roll ? -Math.sin(k * Math.PI) * 5 : 0; c.save(); c.translate(p[0] + dx, p[1] + 3 + dy); c.rotate(roll ? k * 9 : 0.4); c.fillStyle = '#e8e0d0'; c.fillRect(-1.6, -1.6, 3.2, 3.2); c.fillStyle = '#2a1a10'; c.fillRect(-0.4, -0.4, 0.8, 0.8); c.restore(); }
  }

  /* ---------- the Dungeon Master ---------- */
  // what he reacts to: T.react = { kind, t0 } for a moment; T.lean eases toward 1 while the party is nearly beaten
  const REACT = { cruel: 1700, wow: 1300, flare: 1800 };
  T.reactTo = kind => { if (T.dmOn()) T.react = { kind, t0: G.time }; };
  function watch() {
    const party = B.c.filter(x => x.side === 0 && !x.guest), downs = party.filter(x => x.down).length;
    if (T._downs != null && downs > T._downs) T.reactTo('cruel');                 // a hero falls: the grin spreads
    T._downs = downs;
    if (B.phase2 && !T._ph) T.reactTo('flare'); T._ph = !!B.phase2;              // a boss turns: his eyes flare
    const hp = party.reduce((a, x) => a + (x.down ? 0 : x.hp), 0), mx = party.reduce((a, x) => a + x.maxHp, 0) || 1, want = B.over && B.over() ? 0 : hp / mx < 0.35 ? 1 : 0;
    T.lean = (T.lean || 0) + (want - (T.lean || 0)) * 0.04;
  }
  function mood(t) {
    const r = T.react, o = { wide: null, eyes: 1, eyeOpen: 1, glowR: 1 }; if (!r) return o;
    const k = (t - r.t0) / REACT[r.kind]; if (k > 1 || k < 0) { T.react = null; return o; }
    const e = Math.sin(Math.min(1, k * 1.6) * Math.PI / 2) * (k > 0.7 ? (1 - k) / 0.3 : 1);   // quick in, hold, ease out
    if (r.kind === 'cruel') { o.wide = 1 + 0.75 * e; o.eyes = 1 + 0.7 * e; o.glowR = 1 + 0.5 * e; }
    if (r.kind === 'wow') { o.wide = 1 - 0.45 * e; o.eyeOpen = 1 + 0.9 * e; }              // a hero's critical: even he is impressed
    if (r.kind === 'flare') { o.eyes = 1 + 1.3 * e; o.glowR = 1 + 1.2 * e; o.wide = 1 + 0.3 * e; }
    return o;
  }
  function dm(c, P, edge, t, back) {
    const fin = FINAL.includes(B.gid), ln = back ? 0 : T.lean || 0, [gx, gy] = seat(edge, 0.5, back ? (T.players() ? 1.0 : 1.8) : (fin ? 1.1 : 1.4) - ln * 0.35), base = P(gx, gy, -SLAB), m = mood(t);
    paintDM(c, base[0], base[1] + (back ? 6 : fin ? -4 : 0) + ln * 3, (back ? 2.3 : fin ? 2.6 : 2.3) * (1 + ln * 0.1), t, { back, fin: fin || ln > 0.5, hands: false, wide: m.wide, eyes: m.eyes * (1 + ln * 0.25), eyeOpen: m.eyeOpen, glowR: m.glowR });
  }
  function paintDM(c, x, y, s, t, o) {
    const back = o.back, br = Math.sin(t / 1400) * 0.6, tilt = Math.sin(t / 5200) * 0.04;
    c.save(); c.translate(x, y); c.scale(s, s);
    // shoulders and the robe, then the hood and the dark inside it
    c.fillStyle = '#120c14'; c.beginPath(); c.moveTo(-26, 6); c.quadraticCurveTo(-24, -20 + br, -10, -26 + br); c.lineTo(10, -26 + br); c.quadraticCurveTo(24, -20 + br, 26, 6); c.closePath(); c.fill();
    if (back) { c.globalAlpha *= 0.88; c.fillStyle = '#16101a'; c.beginPath(); c.moveTo(-13, -22 + br); c.quadraticCurveTo(-15, -46 + br, 0, -52 + br); c.quadraticCurveTo(15, -46 + br, 13, -22 + br); c.closePath(); c.fill(); c.strokeStyle = 'rgba(200,170,240,.75)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(-26, 6); c.quadraticCurveTo(-24, -20 + br, -12, -24 + br); c.quadraticCurveTo(-15, -46 + br, 0, -52 + br); c.quadraticCurveTo(15, -46 + br, 12, -24 + br); c.quadraticCurveTo(24, -20 + br, 26, 6); c.stroke(); c.restore(); return; }
    c.save(); c.translate(0, -30 + br); c.rotate(tilt);
    c.fillStyle = '#16101a'; c.beginPath(); c.moveTo(-13, 8); c.quadraticCurveTo(-15, -12, 0, -20); c.quadraticCurveTo(15, -12, 13, 8); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(180,140,220,.18)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-12, 6); c.quadraticCurveTo(-14, -11, 0, -19); c.stroke();
    c.fillStyle = '#030204'; c.beginPath(); c.ellipse(0, -2, 8.4, 9.6, 0, 0, 7); c.fill();
    // just an outline of a face: cheek and chin catch a little light
    c.strokeStyle = 'rgba(120,100,140,.22)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-6, -2); c.quadraticCurveTo(-6, 6, 0, 7.4); c.quadraticCurveTo(6, 6, 6, -2); c.stroke();
    // eyes that glow, and blink now and then
    const pulse = (o.fin ? 1.15 : 0.75) * (o.eyes == null ? 1 : o.eyes) + 0.25 * Math.sin(t / 700), blink = (t % 5200) < 140 ? 0.15 : 1;
    const gr = o.glowR || 1, op = o.eyeOpen || 1;
    for (const ex of [-3.2, 3.2]) { glow(c, ex, -3, 5 * gr, '255,220,90', Math.min(0.9, 0.45 * pulse)); c.fillStyle = 'rgba(255,236,150,' + Math.min(1, 0.95 * blink * (o.eyes == null ? 1 : o.eyes)) + ')'; c.beginPath(); c.ellipse(ex, -3, 1.4 * (1 + (op - 1) * 0.3), 0.75 * blink * op, ex < 0 ? 0.25 : -0.25, 0, 7); c.fill(); }
    // the grin: a thin crescent of teeth, that widens now and then
    const wide = o.wide != null ? o.wide : 1 + 0.35 * Math.max(0, Math.sin(t / 2600)) ** 6;
    c.fillStyle = 'rgba(230,220,200,' + (0.75 * (o.grin == null ? 1 : o.grin)) + ')'; c.beginPath(); c.moveTo(-4.6 * wide, 2.4); c.quadraticCurveTo(0, 6.4 + wide, 4.6 * wide, 2.4); c.quadraticCurveTo(0, 4.4 + wide * 0.6, -4.6 * wide, 2.4); c.fill();
    c.strokeStyle = 'rgba(10,6,8,' + (0.8 * (o.grin == null ? 1 : o.grin)) + ')'; c.lineWidth = 0.3; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 1.2 * wide, 3); c.lineTo(i * 1.2 * wide, 4.6 + (1 - Math.abs(i) / 4) * wide); c.stroke(); }
    c.restore();
    // long fingers resting on top of the screen, tapping
    if (o.hands !== false) for (const [hx, ph] of [[-16, 0], [16, 1.7]]) for (let k = 0; k < 4; k++) { const tap = k === 1 && Math.sin(t / 240 + ph) > 0.7 ? -1.2 : 0; c.strokeStyle = '#2a2230'; c.lineWidth = 1.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx + k * 1.8 - 2.7, -4); c.lineTo(hx + k * 1.8 - 2.7, 1 + tap); c.stroke(); }
    c.restore();
  }
  // the screen: three painted panels standing on the table between the DM and the board
  function dmScreen(c, P, edge, t, back, m, zz) {
    // three panels standing on the table along the DM's edge, in the table's own angle: the middle one square to the
    // edge, the wings folded back toward him. Art faces the players; seen from his side it is plain and see-through
    const H = 30, z = zz == null ? -SLAB : zz, sp = [[0.26, -0.05], [0.4, -0.32], [0.6, -0.32], [0.74, -0.05]].map(([a, o]) => seat(edge, a, o, m)), panels = [[0, 1, 0], [1, 2, 1], [2, 3, 2]];
    c.save();
    const order = panels.map(([i, j, k]) => ({ i, j, k, y: (P(sp[i][0], sp[i][1], z)[1] + P(sp[j][0], sp[j][1], z)[1]) / 2 })).sort((a, b) => a.y - b.y);
    for (const { i, j, k } of order) {
      const b0 = P(sp[i][0], sp[i][1], z), b1 = P(sp[j][0], sp[j][1], z), m = (u, v) => [b0[0] + (b1[0] - b0[0]) * u, b0[1] + (b1[1] - b0[1]) * u - v * H * (k === 1 ? 1 : 0.94)];
      const quad = () => { c.beginPath(); [[0, 0], [1, 0], [1, 1], [0, 1]].forEach(([u, v], n) => { const q = m(u, v); n ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); };
      quad(); c.fillStyle = back ? '#2a1418' : k === 1 ? '#4a1e24' : '#3a161c'; c.fill(); c.strokeStyle = '#c8a050'; c.lineWidth = 0.8; c.stroke();
      const path = pts => { c.beginPath(); pts.forEach((uv, n) => { const q = m(uv[0], uv[1]); n ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); };
      if (back) { c.strokeStyle = 'rgba(232,193,74,.5)'; c.lineWidth = 0.4; for (let r = 0.2; r < 0.9; r += 0.14) { path([[0.12, r], [0.88, r]]); c.stroke(); } continue; }   // his side: tables and notes
      c.strokeStyle = 'rgba(232,193,74,.6)'; c.lineWidth = 0.55;
      if (k === 1) { const arc = []; for (let n = 0; n <= 12; n++) { const a = Math.PI * n / 12; arc.push([0.5 - 0.22 * Math.cos(a), 0.28 + 0.4 * Math.sin(a)]); } path(arc); c.stroke(); path([[0.25, 0.42], [0.12, 0.66]]); c.stroke(); path([[0.75, 0.42], [0.88, 0.66]]); c.stroke();
        c.fillStyle = 'rgba(255,90,40,' + (0.55 + 0.2 * Math.sin(t / 600)) + ')'; for (const u of [0.42, 0.58]) { const q = m(u, 0.5); c.beginPath(); c.arc(q[0], q[1], 0.8, 0, 7); c.fill(); } }
      else { const ring = []; for (let n = 0; n <= 16; n++) { const a = 2 * Math.PI * n / 16; ring.push([0.5 + 0.26 * Math.cos(a), 0.5 + 0.3 * Math.sin(a)]); } path(ring); c.stroke(); path([[0.5, 0.2], [0.5, 0.8]]); c.stroke(); path([[0.24, 0.5], [0.76, 0.5]]); c.stroke(); }
    }
    c.restore();
  }
  function screenPanels(c, x, y) { const s = 1.25;
    c.save(); c.translate(x, y); c.scale(s, s);
    const panels = [[-30, -22, -10, -20], [-10, -20, 10, -20], [10, -20, 30, -22]];
    panels.forEach(([x0, y0, x1, y1], i) => { c.fillStyle = i === 1 ? '#4a1e24' : '#3a161c'; c.beginPath(); c.moveTo(x0, 0); c.lineTo(x0, y0); c.lineTo(x1, y1); c.lineTo(x1, 0); c.closePath(); c.fill();
      c.strokeStyle = '#c8a050'; c.lineWidth = 0.8; c.stroke(); c.strokeStyle = 'rgba(232,193,74,.55)'; c.lineWidth = 0.5; const cx = (x0 + x1) / 2;
      if (i === 1) { c.beginPath(); c.moveTo(cx - 5, -6); c.quadraticCurveTo(cx, -18, cx + 5, -6); c.moveTo(cx - 6, -9); c.lineTo(cx - 9, -14); c.moveTo(cx + 6, -9); c.lineTo(cx + 9, -14); c.stroke(); c.fillStyle = 'rgba(255,90,40,.7)'; c.beginPath(); c.arc(cx - 2, -12, 0.7, 0, 7); c.arc(cx + 2, -12, 0.7, 0, 7); c.fill(); }
      else { c.beginPath(); c.arc(cx, -10, 5, 0, 7); c.moveTo(cx, -15); c.lineTo(cx, -5); c.moveTo(cx - 5, -10); c.lineTo(cx + 5, -10); c.stroke(); } });
    c.restore();
  }

  /* ---------- the players ---------- */
  // seated, facing the board: from the front if they sit across the far edges, from behind on the near ones
  function player(c, P, who, edge, along, t, i) {
    const mid = P(B.N / 2, B.N / 2, -SLAB), [g0x, g0y] = seat(edge, along, 1.1), front = P(g0x, g0y, -SLAB)[1] < mid[1], [gx, gy] = seat(edge, along, front ? 1.1 : 2.2), base = P(gx, gy, -SLAB);            // far side: we see the face
    paintPlayer(c, base[0], base[1], front ? 1.75 : 1.9, who, front, t, i, { turn: (mid[0] - base[0]) / 55 });
  }
  function paintPlayer(c, x, y, s, who, front, t, i, o) {
    const br = Math.sin(t / 1600 + i * 1.7) * 0.5;
    let lean = 0, armUp = 0;
    if (!o.still) {
    if (who.act === 'lean') lean = Math.max(0, Math.sin(t / 3400 + i)) * 2.4;
    if (who.act === 'mug') armUp = Math.max(0, Math.sin(t / 2900 + i)) ** 3;
    if (who.act === 'sheet') armUp = Math.max(0, Math.sin(t / 3700 + i)) ** 4 * 0.6;
    }
    const dim = o.dim != null ? o.dim : front ? 0.74 : 0.6;                                                       // a little withdrawn into the dark
    c.save(); c.translate(x, y + (front ? 0 : 6)); c.scale(s, s); c.globalAlpha = 1; c.rotate(Math.max(-1, Math.min(1, o.turn || 0)) * 0.07);
    const body = sh(who.col, -20), hd = -27 + br - lean * (front ? -1 : 1) * 0.4, tu = Math.max(-1, Math.min(1, o.turn || 0)), fx = tu * 2.6;   // tu: turned toward the table, -1 left .. 1 right
    // the body
    c.fillStyle = body; c.beginPath(); c.moveTo(-12, 8); c.quadraticCurveTo(-12, -14 + br, -6, -18 + br); c.lineTo(6, -18 + br); c.quadraticCurveTo(12, -14 + br, 12, 8); c.closePath(); c.fill();
    if (who.sash && front) { c.fillStyle = who.sash; c.fillRect(-2, -16 + br, 4, 20); }
    // the head
    c.save(); c.translate(tu * 1.6, hd + (front ? lean : 0)); c.rotate(tu * 0.06);
    if (front) { const skin = sh(who.skin, -25); c.fillStyle = skin; c.beginPath(); c.ellipse(0, 0, 5.4 - Math.abs(tu) * 0.6, 6.4, 0, 0, 7); c.fill();
      if (Math.abs(tu) > 0.3) { c.beginPath(); c.ellipse(fx * 1.95, 0.6, 1.3, 1.1, 0, 0, 7); c.fill(); c.fillStyle = sh(who.skin, -38); c.beginPath(); c.ellipse(-tu * 4.6, 0.2, 1, 1.6, 0, 0, 7); c.fill(); }   // a nose toward the table, an ear on the far side
      c.fillStyle = 'rgba(20,12,8,.85)'; const blink = ((t + i * 1300) % 4700) < 120; for (const ex of [-2, 2]) { const w = 1.2 * (1 - Math.max(0, -Math.sign(ex) * tu) * 0.6); c.fillRect(ex + fx - w / 2, -0.8, w, blink ? 0.3 : 1); } c.fillRect(-1.4 + fx, 3, 2.8 - Math.abs(tu), 0.5); }
    else { c.fillStyle = sh(who.hair, -30); c.beginPath(); c.ellipse(0, 0, 5.6, 6.6, 0, 0, 7); c.fill();
}
    // what each of them wears on their head, in the hero's manner
    c.fillStyle = who.hair;
    if (who.kind === 'braids') { c.beginPath(); c.ellipse(0, -2.6, 5.8, 4.4, 0, Math.PI, 0); c.fill(); c.fillRect(-6, -2, 2, 12); c.fillRect(4, -2, 2, 12); }
    if (who.kind === 'bun') { c.beginPath(); c.ellipse(0, -2.6, 5.8, 4.2, 0, Math.PI, 0); c.fill(); c.beginPath(); c.arc(0, -7.4, 2.8, 0, 7); c.fill(); }
    if (who.kind === 'hood') { c.fillStyle = sh(who.col, -5); c.beginPath(); c.moveTo(-7, 6); c.quadraticCurveTo(-8, -10, 0, -10); c.quadraticCurveTo(8, -10, 7, 6); c.lineTo(5, 6); c.quadraticCurveTo(5, -5, 0, -5.4); c.quadraticCurveTo(-5, -5, -5, 6); c.closePath(); c.fill(); if (!front) { c.beginPath(); c.ellipse(0, -1, 7, 8, 0, 0, 7); c.fill(); } }
    if (who.kind === 'hat') { c.beginPath(); c.ellipse(0, -3, 5.8, 3.6, 0, Math.PI, 0); c.fill(); c.fillStyle = who.hat; c.beginPath(); c.ellipse(0, -5, 9, 2, 0, 0, 7); c.fill(); c.fillRect(-4.4, -10, 8.8, 5); c.fillStyle = '#efe2c4'; c.beginPath(); c.moveTo(-4, -8); c.quadraticCurveTo(-12, -16 + Math.sin(t / 500) * 0.8, -15, -13); c.quadraticCurveTo(-9, -11, -4, -6); c.fill(); }
    if (!front && Math.abs(tu) > 0.15) { c.fillStyle = sh(who.skin, -12); c.beginPath(); c.ellipse(tu * (who.kind === 'hood' ? 4.6 : 4.4), 1.4, 0.8 + 1.8 * Math.abs(tu), 3.4, 0, 0, 7); c.fill(); c.fillStyle = sh(who.skin, -35); c.beginPath(); c.ellipse(tu * (who.kind === 'hood' ? 5.6 : 5.4), 0.4, 0.7, 1.4, 0, 0, 7); c.fill(); }   // from behind, a cheek shows on the side they look toward
    c.restore();
    // an arm: resting, lifting a mug, turning a page
    c.strokeStyle = body; c.lineWidth = 3.6; c.lineCap = 'round'; const sx = Math.abs(tu) > 0.2 ? 9 * Math.sign(tu) : front ? 9 : -9;   // the arm on the table's side
    c.beginPath(); c.moveTo(sx, -12 + br); c.quadraticCurveTo(sx + 3, -4, sx * 0.6, 2 - armUp * 10); c.stroke();
    if (who.act === 'mug' && armUp > 0.05) { c.fillStyle = '#8a5a2a'; c.fillRect(sx * 0.6 - 2, -3 - armUp * 10, 4, 5); }
    // the hero's colour, caught by the lamp along one shoulder
    c.strokeStyle = al(who.col, 0.7); c.lineWidth = 0.8; c.beginPath(); c.moveTo(-6, -18 + br); c.quadraticCurveTo(-12, -14 + br, -12, 8); c.stroke();
    c.restore();
    // a veil of shadow keeps them back from the game
    c.save(); c.globalAlpha = 1 - dim; c.fillStyle = '#0c0907'; c.beginPath(); c.ellipse(x, y - 14 * s / 1.8, 20 * s / 1.8, 26 * s / 1.8, 0, 0, 7); c.fill(); c.restore();
  }

  T.paintDM = paintDM; T.paintPlayer = paintPlayer; T.screenAt = (c, x, y, s) => { c.save(); c.translate(x, y); c.scale(s / 1.25, s / 1.25); c.translate(-x, -y); screenPanels(c, x, y); c.restore(); }; T.PLAYERS = PLAYERS;

  /* ---------- hook it around the board ---------- */
  const hurt0 = B.hurt; B.hurt = function (t, dmg, o) { if (o && o.crit && t) T.reactTo(t.side === 0 ? 'cruel' : 'wow'); return hurt0.apply(this, arguments); };
  const att0 = B.attack; B.attack = function () { if (T.dmOn() && !G.fast) G.audio.sfx('dice'); return att0.apply(this, arguments); };   // dice on the table
  // on a phone the board zooms in on the action: first, a moment to see the whole table
  const cu0 = B.camUpdate; B.camUpdate = function () { if (!(T.dmOn() && T._t0 != null && G.time - T._t0 < 2400 && B.zoomFlip == null)) return cu0.apply(this, arguments);
    B.zoomFlip = false; try { return cu0.apply(this, arguments); } finally { B.zoomFlip = null; } };
  const pos0 = B.isoPos; B.isoPos = function (gx, gy) { const p = pos0.call(this, gx, gy); if (T.inside || !T.dmOn()) return p; const ZK = zk(), ZY = zy(); return { x: 168 + (p.x - 168) * ZK, y: 122 + (p.y - 122 + ZY) * ZK }; };
  const pick0 = B.isoPick; B.isoPick = function (lx, ly) { if (!T.dmOn()) return pick0.call(this, lx, ly); const ZK = zk(), ZY = zy(); return pick0.call(this, 168 + (lx - 168) / ZK, 122 + (ly - 122) / ZK - ZY); };
  // the opening view puts the DM at the top right, clear of the command menu on the left
  const nf0 = B.isoNewFight; B.isoNewFight = function () { nf0.apply(this, arguments); if (!T.dmOn()) return; syncM(); T._for = null; T._t0 = G.time; T.react = null; T.lean = 0; T._downs = null; T._ph = false;
    if (B.cam) Object.assign(B.cam, { z: 1, x: 160, y: 120 });   // start each fight seeing the whole table
    const e = edgeOf(), N = B.N, mid = { top: [N / 2, -M], bottom: [N / 2, N + M], left: [-M, N / 2], right: [N + M, N / 2] }[e];
    const t0 = G.time; let bump = 0; const at = () => { G.time = t0 + (++bump) * 1e-6; B.isoTurning(); G.time = t0; return B.isoP(mid[0], mid[1], 0); }, c0 = B.rot, p0 = at(), ok = p => p[0] > 168 && p[1] < 122;
    if (!ok(p0)) for (const d of [1, -1]) { B.rot = c0 + d; if (ok(at())) return; } B.rot = c0; at(); };
  // the board's own outline on the screen (scaled onto the table), and a clip to it raised by `up`: weather and fog
  // stay over the little world on the board, not in the DM's room
  T.scr = p => [168 + (p[0] - 168) * zk(), 122 + (p[1] - 122 + zy()) * zk()];
  T.clipBoard = (c, up) => { const N = B.N, cs = [[0, 0], [N, 0], [N, N], [0, N]].map(([x, y]) => T.scr(B.isoP(x, y, 0)));
    const by = k => cs.slice().sort((a, b) => k(a) - k(b))[0], top = by(p => p[1]), bot = by(p => -p[1]), lf = by(p => p[0]), rt = by(p => -p[0]);
    c.beginPath(); [[lf[0], lf[1] + 4], [lf[0], lf[1] - up], [top[0], top[1] - up], [rt[0], rt[1] - up], [rt[0], rt[1] + 4], [bot[0], bot[1] + 6]].forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.clip(); };
  // the board's torches stand on its far edge: put them (and their light) where the smaller board is drawn
  const tor0 = B.isoTorches; B.isoTorches = function () { const ts = tor0.apply(this, arguments); if (!T.dmOn() || T.inside) return ts; return ts.map(tc => { const p = T.scr([tc.x, tc.y]); return Object.assign({}, tc, { x: p[0], y: p[1], pole: tc.pole * zk() }); }); };

  // switching from the flat board back to the diamond mid-fight: open on the DM's view again, as a new fight would
  const tv0 = B.toggleView; B.toggleView = function () { tv0.apply(this, arguments); if (T.dmOn()) B._isoFor = null; };
  const orig = B.isoBoard;
  B.isoBoard = function (c, dt, units) {
    if (!T.dmOn()) return orig.call(this, c, dt, units);
    if (B._isoFor !== B.c && B.isoNewFight) B.isoNewFight();    // the opening view first, so the DM's edge is read from it
    syncM(); watch();
    const P = B.isoP, t = G.time, edge = edgeOf(), mid = P(B.N / 2, B.N / 2, -SLAB);
    const seats = [{ kind: 'dm', edge, along: 0.5 }];
    const opp = OPP[edge], [s1, s2] = SIDES[edge];
    if (T.players()) seats.push({ who: PLAYERS[0], edge: s1, along: 0.5 }, { who: PLAYERS[1], edge: opp, along: 0.32 }, { who: PLAYERS[2], edge: opp, along: 0.68 }, { who: PLAYERS[3], edge: s2, along: 0.5 });
    seats.forEach((st, i) => { const g = st.kind === 'dm' ? seat(st.edge, 0.5, 1.4) : seat(st.edge, st.along, 1.1); st.y = P(g[0], g[1], -SLAB)[1]; st.far = st.y < mid[1]; st.i = i; });
    room(c, t); c.save(); c.translate(168, 122); c.scale(zk(), zk()); c.translate(-168, -122 + zy());
    for (const st of seats.filter(s => s.far).sort((a, b) => a.y - b.y)) st.kind === 'dm' ? dm(c, P, st.edge, t) : player(c, P, st.who, st.edge, st.along, t, st.i);
    table(c, P, t);
    for (const st of seats) if (st.kind !== 'dm') props(c, P, st.edge, st.along, t, st.who);
    const dmFar = seats[0].far; if (dmFar) dmScreen(c, P, edge, t);
    // candles at the table's corners
    for (const [gx, gy] of [[-M + 0.6, -M + 0.6], [B.N + M - 0.6, -M + 0.6], [B.N + M - 0.6, B.N + M - 0.6], [-M + 0.6, B.N + M - 0.6]]) { const p = P(gx, gy, -SLAB), f = 0.85 + 0.15 * Math.sin(t / 110 + gx); glow(c, p[0], p[1] - 6, 14 * f, '255,190,100', 0.45); c.fillStyle = '#e8e0d0'; c.fillRect(p[0] - 1, p[1] - 6, 2, 6); c.fillStyle = '#ffd890'; c.beginPath(); c.ellipse(p[0], p[1] - 7.6, 0.9, 1.6 * f, 0, 0, 7); c.fill(); }
    c.restore();
    c.save(); c.translate(168, 122); c.scale(zk(), zk()); c.translate(-168, -122 + zy()); T.inside = true; try { orig.call(this, c, dt, units); } finally { T.inside = false; } c.restore();
    c.save(); c.translate(168, 122); c.scale(zk(), zk()); c.translate(-168, -122 + zy());
    // from his side of the table he and his screen turn see-through, fading as the view comes round to them (Options: DM from behind)
    if (!dmFar && G.opts.dmBack !== 'hide') { const dy = seats[0].y - mid[1], a = 1 - 0.65 * Math.max(0, Math.min(1, dy / 40)); c.save(); c.globalAlpha = a; dmScreen(c, P, edge, t, true); dm(c, P, edge, t, true); c.restore(); }
    for (const st of seats.filter(s => !s.far).sort((a, b) => a.y - b.y)) if (st.kind !== 'dm') player(c, P, st.who, st.edge, st.along, t, st.i);
    c.restore();
  };
})();
