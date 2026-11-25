/* The epilogue, painted: a scene for each part of the recap in the title screen's style (a 320x240 stage, vectors,
   a little movement), the four heroes as stained-glass windows in a crypt, and the Crooked Lantern to close.
   EP.mount(canvas) attaches it; EP.play(state) runs it, choosing the lines the way the game's epilogue does. */
(function () {
  const EP = window.EP = {};
  const K = 3, W = 320, H = 240;
  let cv, ctx, running = false, last = 0, now = 0, fx = [], waiters = [], advance = null;
  const V = { scene: null, prev: null, mix: 1, fade: 0, text: null, textA: 0, title: null, sub: null, big: null, bigA: 0, skip: false };
  const rnd = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const lerp = (a, b, t) => a + (b - a) * t, ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sleep = ms => new Promise(r => waiters.push({ at: now + (V.skip ? 0 : ms), r }));
  function tween(o, p, ms) { const f = {}; for (const k in p) f[k] = o[k]; const t0 = now; ms = V.skip ? 1 : ms; return new Promise(r => fx.push(() => { const t = clamp((now - t0) / ms, 0, 1), e = ease(t); for (const k in p) o[k] = lerp(f[k], p[k], e); if (t >= 1) { r(); return true; } })); }

  /* ---------------- painting helpers, after the title screen's ---------------- */
  let c;
  function sky(stops) { const g = c.createLinearGradient(0, 0, 0, H); stops.forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  function stars(t, n, maxY, seed) { const r = rnd(seed); for (let i = 0; i < n; i++) { const x = r() * W, y = r() * maxY, s = r(), a = 0.35 + 0.5 * Math.abs(Math.sin(t / (600 + s * 900) + i)); c.fillStyle = 'rgba(244,241,230,' + a.toFixed(2) + ')'; c.fillRect(x, y, s > 0.85 ? 1.4 : 0.8, s > 0.85 ? 1.4 : 0.8); } }
  function glow(x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + col + ',' + a + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
  function ridge(base, amp, seed, col, jag, snow) { const r = rnd(seed), pts = []; let x = -10; while (x < 340) { pts.push([x, base - r() * amp]); x += jag ? 10 + r() * 22 : 30 + r() * 40; }
    c.fillStyle = col; c.beginPath(); c.moveTo(-10, H); if (jag) pts.forEach(p => c.lineTo(p[0], p[1])); else { c.lineTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; c.quadraticCurveTo(a[0] + (b[0] - a[0]) / 2, Math.min(a[1], b[1]) - 6, b[0], b[1]); } }
    c.lineTo(340, H); c.closePath(); c.fill();
    if (snow) { c.fillStyle = snow; for (let i = 1; i < pts.length - 1; i++) { const p = pts[i]; if (p[1] > base - amp * 0.55) continue; const w = 6 + (base - p[1]) * 0.18; c.beginPath(); c.moveTo(p[0] - w, p[1] + w * 0.7); c.lineTo(p[0], p[1]); c.lineTo(p[0] + w, p[1] + w * 0.7); c.lineTo(p[0] + w * 0.4, p[1] + w * 0.45); c.lineTo(p[0], p[1] + w * 0.8); c.lineTo(p[0] - w * 0.4, p[1] + w * 0.45); c.closePath(); c.fill(); } } }
  function mist(y, h, col, a, t) { for (let i = 0; i < 5; i++) { const x = ((i * 90 + t / 60) % 420) - 50, g = c.createRadialGradient(x, y, 2, x, y, 70); g.addColorStop(0, 'rgba(' + col + ',' + a + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); c.fillStyle = g; c.save(); c.translate(x, y); c.scale(1.6, h / 70); c.translate(-x, -y); c.beginPath(); c.arc(x, y, 70, 0, 7); c.fill(); c.restore(); } }
  function pine(x, y, h, col) { c.fillStyle = col; c.beginPath(); c.moveTo(x, y - h); for (let k = 0; k < 3; k++) { const yy = y - h + (k + 1) * h / 3.4, w = h * (0.22 + k * 0.1); c.lineTo(x + w, yy); c.lineTo(x + w * 0.35, yy); } c.lineTo(x + 1, y); c.lineTo(x - 1, y); for (let k = 2; k >= 0; k--) { const yy = y - h + (k + 1) * h / 3.4, w = h * (0.22 + k * 0.1); c.lineTo(x - w * 0.35, yy); c.lineTo(x - w, yy); } c.closePath(); c.fill(); }
  function oak(x, y, h, col) { c.fillStyle = col; c.fillRect(x - 1, y - h * 0.4, 2, h * 0.4); for (const [dx, dy, r] of [[0, -0.7, 0.32], [-0.22, -0.55, 0.25], [0.22, -0.55, 0.25]]) { c.beginPath(); c.arc(x + dx * h, y + dy * h, r * h, 0, 7); c.fill(); } }
  function lampPost(x, y, lit, t, s) { c.save(); c.translate(x, y); c.scale(s || 1, s || 1); c.fillStyle = '#0a0c18'; c.fillRect(-0.6, -12, 1.2, 12); c.fillRect(-2, -14, 4, 3);
    if (lit > 0) { const f = 0.8 + 0.2 * Math.sin(t / 180 + x); glow(0, -12.5, 12 * f * lit, '255,200,110', 0.55 * lit); c.fillStyle = 'rgba(255,224,160,' + lit + ')'; c.fillRect(-1, -13.5, 2, 2); } else { c.fillStyle = '#3a3a48'; c.fillRect(-1, -13.5, 2, 2); } c.restore(); }
  function falling(t, n, seed, kind) { const r = rnd(seed); for (let i = 0; i < n; i++) { const sp = 0.4 + r(), x0 = r() * 360, y0 = r() * 260, ph = r() * 7;
      if (kind === 'snow') { const y = (y0 + t * 0.012 * sp) % 260 - 10, x = (x0 + Math.sin(t / 900 + ph) * 8 + t * 0.004 * sp) % 340 - 10; c.fillStyle = 'rgba(255,255,255,' + (0.5 + sp * 0.3).toFixed(2) + ')'; c.beginPath(); c.arc(x, y, sp > 1 ? 1.1 : 0.7, 0, 7); c.fill(); }
      else { const y = (y0 + t * 0.004 * sp) % 200 + 20, x = (x0 + Math.sin(t / 1500 + ph) * 12 + t * 0.003) % 340 - 10; c.fillStyle = 'rgba(255,240,200,' + (0.15 + 0.25 * Math.abs(Math.sin(t / 900 + ph))).toFixed(2) + ')'; c.fillRect(x, y, 0.8, 0.8); } } }
  function waves(t, y0, col, hi) { c.fillStyle = col; c.fillRect(0, y0, W, H - y0); for (let row = 0; row < 7; row++) { const y = y0 + 3 + row * row * 1.6 + row * 3, a = 0.12 + row * 0.04; c.strokeStyle = 'rgba(' + hi + ',' + a + ')'; c.lineWidth = 0.6 + row * 0.15; c.beginPath(); for (let x = -10; x <= 330; x += 6) { const yy = y + Math.sin(x / (14 + row * 4) + t / (900 - row * 60) + row) * (0.8 + row * 0.35); x === -10 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); } }
  function smoke(x, y, t, n, col) { for (let i = 0; i < (n || 6); i++) { const k = ((t / 2600 + i / (n || 6)) % 1); c.fillStyle = 'rgba(' + (col || '200,200,210') + ',' + (0.22 * (1 - k)).toFixed(3) + ')'; c.beginPath(); c.arc(x + Math.sin(k * 5 + i) * 3 + k * 8, y - k * 34, 1.5 + k * 5, 0, 7); c.fill(); } }
  function house(x, y, w, h, wall, roof, lit, t, seed) { c.fillStyle = wall; c.fillRect(x, y - h, w, h); c.fillStyle = roof; c.beginPath(); c.moveTo(x - 3, y - h); c.lineTo(x + w / 2, y - h - w * 0.45); c.lineTo(x + w + 3, y - h); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(x, y - h * 0.5); c.lineTo(x + w, y - h * 0.5); c.moveTo(x + w / 2, y - h); c.lineTo(x + w / 2, y); c.stroke();
    const r = rnd(seed || 3); for (let i = 0; i < 2; i++) { const wx = x + 3 + i * (w - 9), wy = y - h + 4, f = lit ? 0.75 + 0.25 * Math.sin(t / 700 + i + x) : 0; c.fillStyle = lit && r() > 0.2 ? 'rgba(255,200,110,' + f.toFixed(2) + ')' : '#1a1410'; c.fillRect(wx, wy, 3, 4); if (lit) glow(wx + 1.5, wy + 2, 6, '255,190,100', 0.15); } }
  function gull(x, y, s) { c.strokeStyle = '#1a2028'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(x - 3 * s, y); c.quadraticCurveTo(x - 1.5 * s, y - 2 * s, x, y); c.quadraticCurveTo(x + 1.5 * s, y - 2 * s, x + 3 * s, y); c.stroke(); }
  function figure(x, y, h, col, hood) { c.fillStyle = col; c.beginPath(); c.moveTo(x - h * 0.16, y); c.quadraticCurveTo(x - h * 0.2, y - h * 0.5, x - h * 0.1, y - h * 0.74); c.lineTo(x + h * 0.1, y - h * 0.74); c.quadraticCurveTo(x + h * 0.2, y - h * 0.5, x + h * 0.16, y); c.fill(); c.beginPath(); c.arc(x, y - h * 0.84, h * (hood ? 0.13 : 0.1), 0, 7); c.fill(); }

  /* ---------------- the scenes ---------------- */
  const S = {};
  // the valley at first light: the five lamps all burning
  S.dawn = t => { sky([[0, '#1a2244'], [0.5, '#6a5a7a'], [0.8, '#e8a070'], [1, '#f4c890']]); glow(160, 200, 160, '255,200,140', 0.4);
    stars(t, 30, 60, 4); ridge(168, 44, 11, '#4a3a5a', true); mist(172, 14, '255,220,200', 0.2, t); ridge(194, 22, 5, '#2a2440', false);
    for (const [x, y] of [[40, 188], [104, 182], [160, 178], [222, 184], [286, 190]]) { c.fillStyle = '#1a1630'; c.beginPath(); c.ellipse(x, y + 6, 16, 8, 0, Math.PI, 0); c.fill(); lampPost(x, y + 2, 1, t, 0.8); }
    c.fillStyle = '#120e20'; c.fillRect(0, 214, W, 26); for (let x = 0; x < W; x += 3) { c.fillStyle = '#120e20'; c.fillRect(x, 210 + Math.sin(x * 7) * 2 + Math.sin(t / 600 + x) * 0.6, 1, 6); } };
  // Brackenford of an evening: the Crooked Lantern, the temple and its lamp, the churchyard
  S.brackenford = (t, st) => { sky([[0, '#1a1c3a'], [0.6, '#4a3a5a'], [1, '#c87a5a']]); stars(t, 40, 90, 9); glow(250, 170, 90, '255,150,100', 0.3);
    ridge(160, 26, 12, '#2a2842', false); for (let i = 0; i < 14; i++) pine(8 + i * 24, 168, 18 + (i * 7 % 9), '#1a1a30');
    // the temple, its lamp in the high window
    c.fillStyle = '#2a2436'; c.fillRect(236, 120, 40, 74); c.beginPath(); c.moveTo(232, 120); c.lineTo(256, 96); c.lineTo(280, 120); c.fill(); c.fillRect(250, 70, 12, 50); c.beginPath(); c.moveTo(248, 70); c.lineTo(256, 52); c.lineTo(264, 70); c.fill();
    const tl = st.tobiasLamp; glow(256, 88, 22, '255,210,130', 0.5 * tl + 0.1); c.fillStyle = tl ? '#ffe0a0' : '#3a3040'; c.beginPath(); c.arc(256, 88, 3, Math.PI, 0); c.lineTo(259, 94); c.lineTo(253, 94); c.fill();
    // the churchyard
    for (const [x, h] of [[286, 8], [296, 10], [306, 7], [292, 6]]) { c.fillStyle = '#3a3648'; c.fillRect(x - 2, 194 - h, 4, h); c.beginPath(); c.arc(x, 194 - h, 2, Math.PI, 0); c.fill(); }
    if (st.pell) { figure(300, 194, 11, '#0c0a14'); c.fillStyle = 'rgba(232,220,190,.8)'; c.fillRect(305, 186, 1.2, 4); }
    // houses, and the Crooked Lantern
    house(10, 196, 30, 26, '#4a3a30', '#2a2028', 1, t, 4); house(46, 196, 26, 22, '#544038', '#2e2228', 1, t, 7); house(196, 196, 30, 24, '#4a3a30', '#2a2028', 1, t, 9);
    c.fillStyle = '#5a4434'; c.fillRect(84, 136, 96, 60); c.fillStyle = '#3a2a2a'; c.beginPath(); c.moveTo(78, 138); c.lineTo(132, 106); c.lineTo(186, 138); c.fill();
    c.fillStyle = '#2a1e18'; c.fillRect(162, 98, 8, 22); smoke(166, 96, t, 8);
    c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 0.7; for (const x of [96, 116, 148, 168]) { c.beginPath(); c.moveTo(x, 138); c.lineTo(x, 196); c.stroke(); } c.beginPath(); c.moveTo(84, 166); c.lineTo(180, 166); c.stroke();
    for (const [x, y] of [[90, 146], [104, 146], [152, 146], [166, 146], [90, 174], [166, 174]]) { const f = 0.75 + 0.25 * Math.sin(t / 300 + x * 0.3) * Math.sin(t / 130 + y); c.fillStyle = 'rgba(255,196,110,' + f.toFixed(2) + ')'; c.fillRect(x, y, 7, 9); glow(x + 3.5, y + 4.5, 14, '255,180,90', 0.18); c.fillStyle = '#2a1e18'; c.fillRect(x + 3, y, 1, 9); }
    c.fillStyle = '#2a1a12'; c.fillRect(124, 172, 16, 24); glow(132, 184, 18, '255,190,100', 0.25);
    if (st.horseshoe) { c.strokeStyle = '#b8b8c4'; c.lineWidth = 1.4; c.beginPath(); c.arc(132, 166, 3, 0.2, Math.PI - 0.2, true); c.stroke(); }
    // the sign: a lantern, hanging crooked, swinging a little
    const sw = Math.sin(t / 900) * 0.12; c.strokeStyle = '#1a120c'; c.lineWidth = 1; c.beginPath(); c.moveTo(182, 150); c.lineTo(200, 150); c.stroke(); c.save(); c.translate(196, 150); c.rotate(0.25 + sw); c.strokeStyle = '#1a120c'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 6); c.stroke(); c.fillStyle = '#2a1e18'; c.fillRect(-3, 6, 6, 9); c.fillStyle = 'rgba(255,210,120,.95)'; c.fillRect(-2, 7, 4, 7); c.restore(); glow(198, 160, 16, '255,200,110', 0.4);
    c.fillStyle = '#16121c'; c.fillRect(0, 196, W, 44); c.fillStyle = 'rgba(255,190,110,.08)'; c.fillRect(80, 196, 110, 12);
    // a few townsfolk, as shapes, going in
    for (const [x, h] of [[70 + (t / 90) % 50, 14], [214, 12]]) figure(x, 210, h, '#0c0a12'); };
  // Saltmere in the morning: boats going out, the lighthouse sweeping, gulls
  S.saltmere = (t, st) => { sky([[0, '#5a7a9a'], [0.6, '#b8c8d4'], [1, '#e8dcc8']]); glow(70, 120, 80, '255,240,210', 0.5);
    c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 5; i++) { const x = ((i * 80 + t / 120) % 400) - 40; c.beginPath(); c.ellipse(x, 40 + (i % 3) * 16, 40, 7, 0, 0, 7); c.fill(); }
    ridge(150, 14, 31, '#7a8a98', false);
    // the lighthouse on its rocks
    c.fillStyle = '#3a4048'; c.beginPath(); c.moveTo(232, 168); c.quadraticCurveTo(262, 140, 300, 168); c.fill(); c.fillStyle = '#e8e4dc'; c.beginPath(); c.moveTo(256, 150); c.lineTo(260, 84); c.lineTo(272, 84); c.lineTo(276, 150); c.fill(); c.fillStyle = '#a83030'; for (const y of [96, 116, 136]) c.fillRect(258, y, 16, 6); c.fillStyle = '#2a2a30'; c.fillRect(256, 76, 20, 9);
    if (st.lightLit) { const a = (t / 2200) % (Math.PI * 2), bx = 266 + Math.cos(a) * 160, by = 80 + Math.sin(a) * 18; c.fillStyle = 'rgba(255,240,190,.18)'; c.beginPath(); c.moveTo(266, 80); c.lineTo(bx, by - 10); c.lineTo(bx, by + 10); c.fill(); glow(266, 80, 18, '255,240,190', 0.7); }
    // the town up the hill
    for (let i = 0; i < 7; i++) house(4 + i * 26, 158 - (i % 3) * 3, 18, 14 + (i * 5 % 7), '#c8b8a0', '#7a3a30', st.mourn ? 1 : 0, t, i + 2); c.fillStyle = '#8a8070'; c.fillRect(150, 112, 10, 40); c.beginPath(); c.moveTo(148, 112); c.lineTo(155, 100); c.lineTo(162, 112); c.fill();
    waves(t, 166, '#3a5a72', '220,235,245');
    // the boats, heading out
    for (const [x0, y, s, sp] of [[60, 186, 1, 0.006], [130, 200, 1.3, 0.005], [20, 212, 1.6, 0.004], [200, 184, 0.9, 0.007], [100, 178, 0.7, 0.008], [-30, 196, 1.1, 0.0055]].slice(0, st.boats || 6)) { const x = ((x0 + t * sp) % 400) - 40, b = Math.sin(t / 500 + x0) * 1.2;
      c.save(); c.translate(x, y + b); c.scale(s, s); c.fillStyle = '#4a2e1e'; c.beginPath(); c.moveTo(-10, 0); c.lineTo(10, 0); c.lineTo(7, 4); c.lineTo(-8, 4); c.fill(); c.fillStyle = '#2a1e14'; c.fillRect(-0.5, -16, 1, 16); c.fillStyle = '#e8dcc0'; c.beginPath(); c.moveTo(0.5, -15); c.lineTo(9, -3); c.lineTo(0.5, -3); c.fill(); figure(-4, 0, 6, '#1a1410'); c.restore(); }
    c.fillStyle = '#4a3a2a'; c.fillRect(0, 176, 60, 4); for (let x = 4; x < 60; x += 10) c.fillRect(x, 176, 2, 14);
    for (let i = 0; i < 5; i++) gull(((i * 70 + t / 30) % 380) - 30, 50 + i * 9 + Math.sin(t / 400 + i) * 4, 1.2); };
  // Karrow Hold under snow: the hall in the rock, banners, the Cairn and its lamp
  S.karrow = (t, st) => { sky([[0, '#7a90b0'], [0.5, '#b8c8dc'], [1, '#e8e4e8']]); glow(250, 60, 60, '255,245,230', 0.5);
    ridge(140, 80, 31, '#6a7a96', true, '#eef2f8'); ridge(170, 50, 17, '#4a5a78', true, '#dde6f0'); mist(172, 14, '240,244,250', 0.35, t);
    // the Cairn on its slope, the giant's lamp
    c.fillStyle = '#5a6478'; c.beginPath(); c.moveTo(214, 150); c.quadraticCurveTo(256, 110, 300, 150); c.fill(); c.fillStyle = '#eef2f8'; c.beginPath(); c.moveTo(232, 136); c.quadraticCurveTo(256, 114, 284, 136); c.quadraticCurveTo(256, 124, 232, 136); c.fill();
    c.fillStyle = '#2a3040'; c.fillRect(250, 132, 12, 16); lampPost(256, 132, st.giant ? 1 : 0, t, 1); if (st.giant) glow(256, 120, 30, '160,210,255', 0.35);
    // the Hold: a hall cut into the cliff, its door lit
    c.fillStyle = '#3a4054'; c.fillRect(40, 120, 140, 80); c.fillStyle = '#4a5268'; c.beginPath(); c.moveTo(30, 122); c.lineTo(110, 86); c.lineTo(190, 122); c.fill(); c.fillStyle = '#eef2f8'; c.beginPath(); c.moveTo(30, 122); c.lineTo(110, 86); c.lineTo(190, 122); c.lineTo(180, 124); c.lineTo(110, 92); c.lineTo(40, 124); c.fill();
    for (const x of [56, 92, 128, 164]) { c.fillStyle = '#2a3040'; c.fillRect(x - 3, 124, 6, 76); }
    c.fillStyle = '#1a1410'; c.beginPath(); c.moveTo(96, 200); c.lineTo(96, 160); c.arc(110, 160, 14, Math.PI, 0); c.lineTo(124, 200); c.fill(); glow(110, 182, 30, '255,170,80', 0.45); c.fillStyle = 'rgba(255,180,90,.6)'; c.fillRect(100, 168, 20, 32);
    for (const [x, col] of [[70, '#8a2a2a'], [150, '#2a4a8a']]) { const w = Math.sin(t / 400 + x) * 2; c.fillStyle = '#1a1410'; c.fillRect(x - 0.5, 96, 1, 34); c.fillStyle = col; c.beginPath(); c.moveTo(x + 0.5, 98); c.quadraticCurveTo(x + 8, 100 + w, x + 14, 99 + w * 1.4); c.lineTo(x + 13, 108 + w); c.quadraticCurveTo(x + 7, 109 + w, x + 0.5, 108); c.fill(); }
    c.fillStyle = '#e8eef6'; c.fillRect(0, 198, W, 42); ridge(206, 8, 4, '#f4f8fc', false);
    for (const [x, y] of [[82, 214], [150, 220]]) { glow(x, y - 4, 10, '255,180,90', 0.5); c.fillStyle = '#3a2a1a'; c.fillRect(x - 1, y - 6, 2, 6); }
    falling(t, 100, 13, 'snow'); };
  // Highmoor at sunrise: towers, banners, the lamps along the walls burning clean
  S.highmoor = (t, st) => { sky([[0, '#2a3a6a'], [0.45, '#8a7aa0'], [0.8, '#f0b080'], [1, '#f8d8a0']]); glow(160, 190, 140, '255,210,150', 0.45);
    const r = rnd(41); for (let x = -4; x < W;) { const w = 14 + r() * 18, h = 50 + r() * 70, top = 196 - h; c.fillStyle = '#3a3050'; c.fillRect(x, top, w, h + 50);
      if (r() > 0.45) { c.beginPath(); c.moveTo(x - 1, top); c.lineTo(x + w / 2, top - 16 - r() * 22); c.lineTo(x + w + 1, top); c.fill(); if (r() > 0.4) { const fx2 = x + w / 2, fy = top - 30, wv = Math.sin(t / 300 + x) * 1.5; c.fillStyle = '#1a1420'; c.fillRect(fx2 - 0.4, fy, 0.8, 14); c.fillStyle = st.duke ? (r() > 0.5 ? '#c8a040' : '#a02a3a') : (r() > 0.5 ? '#6a6a78' : '#4a4a58'); c.beginPath(); c.moveTo(fx2, fy); c.quadraticCurveTo(fx2 + 5, fy + wv, fx2 + 9, fy + 1 + wv); c.lineTo(fx2 + 9, fy + 5 + wv); c.quadraticCurveTo(fx2 + 5, fy + 4 + wv, fx2, fy + 5); c.fill(); } }
      for (let k = 0; k < 3; k++) if (r() > 0.5) { c.fillStyle = 'rgba(255,220,150,.7)'; c.fillRect(x + 3 + r() * (w - 6), top + 8 + r() * (h - 16), 2, 3); }
      x += w + r() * 3; }
    c.fillStyle = 'rgba(255,220,180,.18)'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#2a2236'; c.fillRect(0, 186, W, 54); c.fillStyle = '#3a304a'; for (let x = 0; x < W; x += 12) c.fillRect(x, 182, 7, 6);
    for (let i = 0; i < 9; i++) lampPost(14 + i * 37, 186, 1, t, 1);
    // a rider on the road below
    if (!st.duke) return;
    const rx = ((t / 40) % 400) - 40; c.fillStyle = '#16101c'; c.beginPath(); c.ellipse(rx, 220, 9, 4, 0, 0, 7); c.fill(); for (const lx of [-6, -3, 4, 7]) c.fillRect(rx + lx + Math.sin(t / 80 + lx) * 1.4, 222, 1.2, 8); c.beginPath(); c.moveTo(rx + 8, 218); c.lineTo(rx + 13, 212); c.lineTo(rx + 15, 214); c.lineTo(rx + 10, 221); c.fill(); figure(rx - 1, 218, 12, '#16101c'); };
  // the Wardens' road at dusk: the ward-lamps lighting one by one, two figures far off
  S.lamps = (t, st) => { sky([[0, '#14183a'], [0.6, '#3a3a6a'], [1, '#8a6a7a']]); stars(t, 60, 100, 6); ridge(128, 28, 9, '#232450', false); ridge(148, 14, 3, '#18183a', false);
    c.fillStyle = '#18183a'; c.fillRect(0, 150, W, 90); c.fillStyle = '#2a2440'; c.beginPath(); c.moveTo(152, 146); c.lineTo(164, 146); c.lineTo(270, 240); c.lineTo(40, 240); c.fill();
    const lit = st.lampsLit || 0; [[148, 148, 0.35], [168, 148, 0.35], [141, 154, 0.5], [176, 154, 0.5], [128, 164, 0.7], [190, 164, 0.7], [104, 180, 1], [214, 180, 1]].reverse().forEach(([x, y, s], i) => lampPost(x, y, clamp(lit - i, 0, 1), t, s * 1.5));
    figure(155, 150, 7, '#0c0a18', 1); if ((st.walkers || 2) > 1) figure(161, 150, 6.5, '#0c0a18', 1); glow(158, 146, 10, '220,230,255', 0.25); };
  // a tavern stage: Finch's ballad, the front row, the notes rising
  S.ballad = (t, st) => { sky([[0, '#1a0e0a'], [1, '#3a2014']]); c.fillStyle = '#2a1a12'; for (let x = 0; x < W; x += 20) c.fillRect(x, 0, 2, 150);
    glow(160, 120, 120, '255,190,110', 0.35); c.fillStyle = '#4a3020'; c.fillRect(90, 150, 140, 14); c.fillStyle = '#3a2418'; c.fillRect(90, 164, 140, 6);
    c.fillStyle = 'rgba(255,230,180,.12)'; c.beginPath(); c.moveTo(140, 0); c.lineTo(180, 0); c.lineTo(210, 150); c.lineTo(110, 150); c.fill();
    // Finch, as a shape, with his hat and plume and lute
    const b = Math.sin(t / 300) * 0.8; c.save(); c.translate(160, 150 + b * 0.3); c.fillStyle = '#1a0c10'; c.beginPath(); c.moveTo(-8, 0); c.quadraticCurveTo(-10, -22, -5, -34); c.lineTo(5, -34); c.quadraticCurveTo(10, -22, 8, 0); c.fill(); c.beginPath(); c.arc(0, -40, 5.5, 0, 7); c.fill();
    c.beginPath(); c.ellipse(0, -45, 11, 2.4, -0.1, 0, 7); c.fill(); c.fillRect(-5, -52, 10, 7); c.fillStyle = '#e8dcc0'; c.beginPath(); c.moveTo(-5, -50); c.quadraticCurveTo(-16, -60 + b, -22, -56 + b); c.quadraticCurveTo(-14, -54, -5, -48); c.fill();
    c.fillStyle = '#6a3a1a'; c.beginPath(); c.ellipse(6, -18, 7, 9, -0.5, 0, 7); c.fill(); c.fillRect(8, -38, 2, 18); c.restore();
    for (let i = 0; i < 6; i++) { const k = ((t / 3000 + i / 6) % 1), x = 170 + Math.sin(k * 6 + i) * 18 + i * 4, y = 120 - k * 100; c.fillStyle = 'rgba(255,230,170,' + (0.7 * (1 - k)).toFixed(2) + ')'; c.font = '9px serif'; c.fillText(i % 2 ? '♪' : '♫', x, y); }
    // the crowd, heads and mugs; an old woman in the front row
    const r = rnd(5), rows = st.ending === 2 ? 1 : 3; for (let row = 0; row < rows; row++) for (let i = 0; i < (st.ending === 2 ? 5 : 12); i++) { const x = 8 + i * 27 + row * 9 + r() * 6, y = 196 + row * 16, sway = Math.sin(t / 500 + i + row) * 1.2; c.fillStyle = row === 0 ? '#120a08' : '#0a0604'; c.beginPath(); c.arc(x + sway, y, 6, 0, 7); c.fill(); c.fillRect(x - 9 + sway, y + 5, 18, 20); }
    if (st.ending === 3) { glow(124, 140, 16, '220,225,240', 0.6); c.fillStyle = '#2a2a34'; c.fillRect(121, 140, 6, 10); c.fillStyle = '#e8ecf4'; c.fillRect(122, 142, 4, 6); }
    if (st.ennet) { c.fillStyle = '#16100c'; c.beginPath(); c.arc(150, 190, 6, 0, 7); c.fill(); c.fillStyle = '#d8d0c4'; c.beginPath(); c.arc(150, 186, 5, Math.PI, 0); c.fill(); } };
  // the north hills: the goblins' camp, goats, smoke; a trading cart from the Hold
  S.goblins = (t, st) => { sky([[0, '#5a6a8a'], [0.6, '#a8b0b8'], [1, '#d8ccb0']]); ridge(150, 40, 21, '#6a7080', true, '#e8ecf0'); ridge(176, 20, 8, '#5a6a4a', false); ridge(196, 12, 3, '#4a5a3a', false);
    for (const [x, col] of [[90, '#8a6a4a'], [130, '#6a5a3a'], [200, '#7a5a3a']]) { c.fillStyle = col; c.beginPath(); c.moveTo(x - 14, 196); c.lineTo(x, 170); c.lineTo(x + 14, 196); c.fill(); c.fillStyle = '#2a1a10'; c.beginPath(); c.moveTo(x - 3, 196); c.lineTo(x, 186); c.lineTo(x + 3, 196); c.fill(); }
    glow(160, 196, 14, '255,170,80', 0.6); c.fillStyle = '#ffb050'; c.beginPath(); c.moveTo(156, 198); c.quadraticCurveTo(160, 186 + Math.sin(t / 90) * 2, 164, 198); c.fill(); smoke(160, 188, t, 7, '190,190,200');
    // goblins, ears and all, and their goats
    for (const [x, d] of [[146, 1], [176, -1], [112, 1]]) { const y = 206, b = Math.abs(Math.sin(t / 300 + x)) * 1.5; c.fillStyle = '#3a5a2a'; c.beginPath(); c.ellipse(x, y - 4 - b, 3.6, 5, 0, 0, 7); c.fill(); c.beginPath(); c.arc(x, y - 11 - b, 3.2, 0, 7); c.fill(); c.beginPath(); c.moveTo(x - 2, y - 12 - b); c.lineTo(x - 8 * d, y - 15 - b); c.lineTo(x - 1, y - 10 - b); c.fill(); c.beginPath(); c.moveTo(x + 2, y - 12 - b); c.lineTo(x + 8 * d, y - 16 - b); c.lineTo(x + 1, y - 10 - b); c.fill(); }
    for (const [x0, sp] of [[230, 0.003], [260, -0.002], [40, 0.0025]]) { const x = x0 + Math.sin(t * sp) * 12, y = 214; c.fillStyle = '#e8e0d0'; c.beginPath(); c.ellipse(x, y - 6, 7, 4, 0, 0, 7); c.fill(); c.fillRect(x - 5, y - 4, 1.4, 6); c.fillRect(x + 4, y - 4, 1.4, 6); c.beginPath(); c.arc(x + 7, y - 9, 2.6, 0, 7); c.fill(); c.strokeStyle = '#8a7a6a'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x + 7, y - 11); c.quadraticCurveTo(x + 4, y - 15, x + 2, y - 13); c.stroke(); }
    c.fillStyle = '#4a3020'; c.fillRect(270, 196, 30, 10); for (const wx of [274, 296]) { c.beginPath(); c.arc(wx, 207, 4, 0, 7); c.fill(); } c.fillStyle = '#8a2a2a'; c.fillRect(272, 190, 26, 6); };

  /* ---------------- the hall of windows ---------------- */
  const HERO = [['runa', '#c9512a', 'Runa'], ['dask', '#3a7050', 'Dask'], ['maren', '#3a62a8', 'Maren'], ['finch', '#9a3046', 'Finch']];
  const WIN = []; for (let i = 0; i < 4; i++) WIN.push({ x: 42 + i * 64, y: 30, w: 44, h: 116, lit: 0.35 });
  const hall = { rose: 0.3, figureLook: 0, pool: [0, 0, 0, 0] };
  EP.windows = [];                // canvases, one per hero, made once
  function lancet(x, y, w, h) { const p = new Path2D(), ys = y + w * 0.75; p.moveTo(x, y + h); p.lineTo(x, ys); p.bezierCurveTo(x, ys - w * 0.42, x + w * 0.3, y + w * 0.1, x + w / 2, y); p.bezierCurveTo(x + w * 0.7, y + w * 0.1, x + w, ys - w * 0.42, x + w, ys); p.lineTo(x + w, y + h); p.closePath(); return p; }
  function makeWindow(i) {
    const [id, col, name] = HERO[i], PW = 48 * K * 2, PH = 138 * K * 2, cnv = document.createElement('canvas'); cnv.width = PW; cnv.height = PH; const g = cnv.getContext('2d'), s = PW / 48;
    g.scale(s, s); const shape = lancet(0, 0, 48, 138); g.save(); g.clip(shape);
    // a ground of small glass in the hero's colour, cut in diamonds
    const r = rnd(i * 7 + 3); g.fillStyle = col; g.fillRect(0, 0, 48, 138);
    for (let y = -6; y < 140; y += 6) for (let x = (y / 6 % 2) * 3 - 6; x < 52; x += 6) { const k = r(); g.fillStyle = k > 0.7 ? shade(col, 0.35) : k > 0.35 ? col : shade(col, -0.25); g.beginPath(); g.moveTo(x, y - 3); g.lineTo(x + 3, y); g.lineTo(x, y + 3); g.lineTo(x - 3, y); g.fill(); }
    g.strokeStyle = 'rgba(20,18,16,.75)'; g.lineWidth = 0.35; for (let d = -140; d < 200; d += 6) { g.beginPath(); g.moveTo(d, 0); g.lineTo(d + 140, 140); g.stroke(); g.beginPath(); g.moveTo(d + 140, 0); g.lineTo(d, 140); g.stroke(); }
    // the hero, in a round, painted on glass
    const panel = EP.glass[id]; if (panel) { g.save(); g.beginPath(); g.arc(24, 44, 20.5, 0, 7); g.clip(); g.drawImage(panel, 3.5, 23.5, 41, 41); g.restore(); }
    g.strokeStyle = '#141210'; g.lineWidth = 1.6; g.beginPath(); g.arc(24, 44, 20.5, 0, 7); g.stroke(); g.strokeStyle = '#d8b050'; g.lineWidth = 0.7; g.beginPath(); g.arc(24, 44, 21.8, 0, 7); g.stroke();
    // their emblem below, in grisaille on pale glass, in a vesica
    const ve = new Path2D(); ve.ellipse(24, 98, 13, 22, 0, 0, 7); g.fillStyle = '#f0e6c8'; g.fill(ve); g.save(); g.clip(ve); g.fillStyle = 'rgba(120,90,40,.25)'; g.fillRect(0, 76, 48, 44); g.restore();
    g.strokeStyle = '#3a2a1a'; g.fillStyle = '#4a3a26'; g.lineWidth = 1.1; g.lineCap = 'round'; emblem(g, id, 24, 98); g.strokeStyle = '#141210'; g.lineWidth = 1.4; g.stroke(ve);
    // a gold band with the name, and the borders
    g.fillStyle = '#e8c050'; g.fillRect(4, 124, 40, 8); g.strokeStyle = '#141210'; g.lineWidth = 0.9; g.strokeRect(4, 124, 40, 8); g.fillStyle = '#3a2410'; g.font = 'bold 6px Georgia'; g.textAlign = 'center'; g.fillText(name.toUpperCase(), 24, 130.4);
    g.restore();
    g.strokeStyle = '#141210'; g.lineWidth = 2.6; g.stroke(shape); g.strokeStyle = 'rgba(160,150,140,.4)'; g.lineWidth = 0.6; g.stroke(shape);
    return cnv;
  }
  function shade(h, k) { const n = parseInt(h.slice(1), 16), f = v => clamp(Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)), 0, 255); return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')'; }
  function emblem(g, id, x, y) {
    if (id === 'runa') { g.beginPath(); g.moveTo(x - 1, y + 16); g.lineTo(x + 1, y - 14); g.stroke(); g.beginPath(); g.moveTo(x + 1, y - 12); g.quadraticCurveTo(x + 12, y - 14, x + 11, y - 2); g.quadraticCurveTo(x + 6, y - 6, x + 1, y - 4); g.fill(); g.beginPath(); g.moveTo(x + 1, y - 14); g.lineTo(x - 1, y - 18); g.lineTo(x - 3, y - 13); g.fill(); g.beginPath(); g.moveTo(x - 4, y + 2); g.lineTo(x + 4, y + 2); g.stroke(); }
    if (id === 'dask') { g.beginPath(); g.moveTo(x - 6, y + 14); g.lineTo(x + 6, y - 14); g.stroke(); g.beginPath(); g.moveTo(x - 9, y + 8); g.lineTo(x - 2, y + 11); g.stroke(); g.beginPath(); g.arc(x + 4, y + 8, 3.4, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x + 2, y + 4); g.lineTo(x - 5, y - 10); g.lineTo(x - 2, y - 11); g.moveTo(x - 4, y - 7); g.lineTo(x - 1, y - 8); g.stroke(); }
    if (id === 'maren') { g.beginPath(); g.moveTo(x - 7, y - 6); g.lineTo(x, y - 12); g.lineTo(x + 7, y - 6); g.closePath(); g.fill(); g.strokeRect(x - 6, y - 6, 12, 16); g.beginPath(); g.arc(x, y - 14, 2.4, Math.PI, 0); g.stroke(); g.fillStyle = '#e8b040'; g.beginPath(); g.ellipse(x, y + 2, 3, 5, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(232,176,64,.6)'; for (const a of [0.3, 1, 1.6, 2.2, 2.8]) { g.beginPath(); g.moveTo(x + Math.cos(a + 3.14) * 9, y + 2 + Math.sin(a + 3.14) * 9); g.lineTo(x + Math.cos(a + 3.14) * 12, y + 2 + Math.sin(a + 3.14) * 12); g.stroke(); } }
    if (id === 'finch') { g.beginPath(); g.ellipse(x - 1, y + 6, 7, 9, -0.3, 0, 7); g.fill(); g.fillStyle = '#f0e6c8'; g.beginPath(); g.arc(x - 1, y + 5, 2, 0, 7); g.fill(); g.beginPath(); g.moveTo(x + 2, y - 2); g.lineTo(x + 7, y - 16); g.stroke(); g.beginPath(); g.moveTo(x + 5, y - 15); g.lineTo(x + 10, y - 17); g.stroke(); }
  }
  S.hall = (t, st) => {
    // the crypt: dark stone, vaults overhead, the windows set deep in the wall
    sky([[0, '#0c0a12'], [1, '#1a1622']]); c.fillStyle = '#16131e'; c.fillRect(0, 0, W, 156);
    const r = rnd(8); for (let y = 0; y < 156; y += 9) for (let x = -(y / 9 % 2) * 8; x < W; x += 16) { c.fillStyle = 'rgba(' + (40 + r() * 14 | 0) + ',' + (36 + r() * 12 | 0) + ',' + (50 + r() * 14 | 0) + ',.9)'; c.fillRect(x + 0.5, y + 0.5, 15, 8); }
    c.strokeStyle = '#0a0810'; c.lineWidth = 6; for (let i = 0; i <= 4; i++) { const x = 32 + i * 64; c.beginPath(); c.moveTo(x, 156); c.lineTo(x, 34); if (i < 4) c.quadraticCurveTo(x + 32, -6, x + 64, 34); c.stroke(); } c.fillStyle = '#0e0b14'; for (let i = 0; i <= 4; i++) c.fillRect(28 + i * 64, 34, 8, 122);
    // the rose window above, for the ending
    const rx = 160, ry = 16; c.save(); c.globalAlpha = 0.4 + hall.rose * 0.6; for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283 + t / 40000; c.fillStyle = (hall.roseCols || ['#c02040', '#2a60d0', '#e8c040'])[k % 3]; c.beginPath(); c.moveTo(rx, ry); c.arc(rx, ry, 14, a, a + 0.5); c.fill(); } c.fillStyle = '#fff0b0'; c.beginPath(); c.arc(rx, ry, 4, 0, 7); c.fill(); c.restore(); c.strokeStyle = '#0a0810'; c.lineWidth = 1.4; c.beginPath(); c.arc(rx, ry, 14.5, 0, 7); c.stroke(); if (hall.rose > 0.5) glow(rx, ry, 40, hall.roseGlow || '255,230,170', 0.3 * hall.rose);
    WIN.forEach((w, i) => { const lit = w.lit; c.fillStyle = '#0a0810'; c.fill(lancet(w.x - 4, w.y - 4, w.w + 8, w.h + 8));
      c.save(); c.globalAlpha = 1; c.drawImage(EP.windows[i], w.x, w.y, w.w, w.h); c.fillStyle = 'rgba(8,6,14,' + (1 - lit) * 0.72 + ')'; c.fill(lancet(w.x, w.y, w.w, w.h)); c.restore();
      if (lit > 0.4) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = (lit - 0.4) * 0.5; c.drawImage(EP.windows[i], w.x, w.y, w.w, w.h); c.restore(); } });
    // the floor: flagstones going away, colour pooled on them
    c.fillStyle = '#1e1a26'; c.fillRect(0, 156, W, 84); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 0.6; for (let y = 160; y < H; y += 6 + (y - 156) * 0.14) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } for (let x = -260; x < 580; x += 24) { c.beginPath(); c.moveTo(160 + (x - 160) * 0.45, 156); c.lineTo(x, H); c.stroke(); }
    // shafts of coloured light, from each window down to the floor
    c.save(); c.globalCompositeOperation = 'lighter';
    WIN.forEach((w, i) => { const lit = w.lit, col = HERO[i][1], a = Math.max(0, lit - 0.25) * 0.6; if (a <= 0) return; const fx = 160 + (w.x + w.w / 2 - 160) * 0.55, fy = 186;
      const g = c.createLinearGradient(w.x, w.y + 40, fx, fy); g.addColorStop(0, hexa(col, a)); g.addColorStop(1, hexa(col, a * 0.25)); c.fillStyle = g; c.beginPath(); c.moveTo(w.x + 4, w.y + 46); c.lineTo(w.x + w.w - 4, w.y + 46); c.lineTo(fx + 24, fy); c.lineTo(fx - 24, fy); c.closePath(); c.fill();
      const pg = c.createRadialGradient(fx, fy, 0, fx, fy, 36); pg.addColorStop(0, hexa(col, a * 1.2)); pg.addColorStop(1, hexa(col, 0)); c.fillStyle = pg; c.save(); c.translate(fx, fy); c.scale(1.6, 0.4); c.beginPath(); c.arc(0, 0, 36, 0, 7); c.fill(); c.restore(); });
    c.restore();
    // dust drifting in the light
    falling(t, 70, 17, 'dust');
    // candles at either side
    for (const x of [14, 306]) { c.fillStyle = '#2a2430'; c.fillRect(x - 4, 146, 8, 18); for (const dx of [-2, 0, 2]) { const f = 0.8 + 0.2 * Math.sin(t / 120 + dx + x); glow(x + dx, 142, 8 * f, '255,190,100', 0.4); c.fillStyle = '#e8e0d0'; c.fillRect(x + dx - 0.5, 142, 1, 4); c.fillStyle = '#ffd890'; c.fillRect(x + dx - 0.4, 140.4, 0.8, 1.6); } }
    // the figure in the shadows, looking up
    const fx = 160, fy = 176, sway = Math.sin(t / 1800) * 0.6, look = hall.figureLook;
    c.fillStyle = 'rgba(0,0,0,.5)'; c.beginPath(); c.ellipse(fx, fy + 1, 14, 3, 0, 0, 7); c.fill();
    c.fillStyle = '#07060a'; c.beginPath(); c.moveTo(fx - 12, fy); c.quadraticCurveTo(fx - 13 + sway, fy - 22, fx - 8, fy - 36); c.quadraticCurveTo(fx, fy - 40, fx + 8, fy - 36); c.quadraticCurveTo(fx + 13 + sway, fy - 22, fx + 12, fy); c.closePath(); c.fill();
    c.save(); c.translate(fx + look * 2, fy - 42); c.rotate(look * 0.12); c.beginPath(); c.moveTo(-7, 6); c.quadraticCurveTo(-8, -6, 0, -9); c.quadraticCurveTo(8, -6, 7, 6); c.closePath(); c.fill(); c.restore();
    // the light catches the edge of the cloak, in the colour of whichever window is brightest
    let best = 0; WIN.forEach((w, i) => { if (w.lit > WIN[best].lit) best = i; }); const bl = WIN[best].lit; if (bl > 0.5) { c.strokeStyle = hexa(HERO[best][1], (bl - 0.5) * 0.9); c.lineWidth = 0.8; c.beginPath(); c.moveTo(fx + (best < 2 ? -8 : 8), fy - 36); c.quadraticCurveTo(fx + (best < 2 ? -13 : 13), fy - 22, fx + (best < 2 ? -12 : 12), fy); c.stroke(); }
  };
  function hexa(h, a) { const n = parseInt(h.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + clamp(a, 0, 1).toFixed(3) + ')'; }
  // the Crooked Lantern by the fire: the table, four chairs
  S.lantern = (t, st) => { sky([[0, '#140c08'], [1, '#2a1810']]); c.fillStyle = '#2a1a10'; for (let x = 0; x < W; x += 22) c.fillRect(x, 0, 3, 190); c.fillStyle = '#1e140c'; c.fillRect(0, 26, W, 6);
    // the hearth
    c.fillStyle = '#3a3030'; c.fillRect(200, 80, 90, 110); c.fillStyle = '#100806'; c.beginPath(); c.moveTo(214, 190); c.lineTo(214, 128); c.arc(245, 128, 31, Math.PI, 0); c.lineTo(276, 190); c.fill();
    const f = 0.8 + 0.2 * Math.sin(t / 90) * Math.sin(t / 37); glow(245, 170, 90 * f, '255,140,60', 0.45); for (let i = 0; i < 6; i++) { const x = 230 + i * 6, h = 14 + Math.sin(t / 70 + i * 2) * 5 + (i % 2) * 6; c.fillStyle = i % 2 ? '#ffb040' : '#ff7a20'; c.beginPath(); c.moveTo(x - 4, 186); c.quadraticCurveTo(x, 186 - h * 1.3, x + 4, 186); c.fill(); } c.fillStyle = '#2a1a10'; c.fillRect(226, 184, 40, 4);
    // the lantern on its beam, crooked
    c.save(); c.translate(110, 32); c.rotate(0.22 + Math.sin(t / 1200) * 0.03); c.strokeStyle = '#1a100a'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 10); c.stroke(); c.fillStyle = '#2a1e14'; c.fillRect(-5, 10, 10, 14); c.fillStyle = 'rgba(255,210,120,.95)'; c.fillRect(-3.5, 12, 7, 10); c.restore(); glow(112, 50, 40, '255,200,110', 0.35);
    // the table and the chairs; who sits in them depends on the years
    c.fillStyle = '#5a3a22'; c.beginPath(); c.ellipse(130, 176, 60, 12, 0, 0, 7); c.fill(); c.fillStyle = '#3a2414'; c.fillRect(124, 180, 12, 30);
    const seats = st.seats == null ? 4 : st.seats, pos = [[78, 1], [104, 1], [156, -1], [182, -1]], col = ['#c9512a', '#3a7050', '#3a62a8', '#9a3046'];
    pos.forEach(([x, d], i) => { c.fillStyle = '#3a2414'; c.fillRect(x - 8, 168, 16, 3); c.fillRect(x - 8 * d - 1, 140, 3, 46); c.fillRect(x - 7, 171, 2, 18); c.fillRect(x + 5, 171, 2, 18);
      if (i < seats) { const b = Math.sin(t / 700 + i) * 0.6; c.fillStyle = '#0e0806'; c.beginPath(); c.moveTo(x - 7, 170); c.quadraticCurveTo(x - 8, 152, x - 4, 146 + b); c.lineTo(x + 4, 146 + b); c.quadraticCurveTo(x + 8, 152, x + 7, 170); c.fill(); c.beginPath(); c.arc(x + d, 140 + b, 5, 0, 7); c.fill(); c.strokeStyle = col[i]; c.globalAlpha = 0.5; c.lineWidth = 0.8; c.beginPath(); c.arc(x + d, 140 + b, 5.2, -1, 0.6); c.stroke(); c.globalAlpha = 1; } });
    if (seats) for (const x of [100, 130, 160]) { c.fillStyle = '#8a6a3a'; c.fillRect(x - 2, 164, 4, 6); smoke(x, 162, t + x * 40, 3, '230,220,210'); }
    c.fillStyle = '#1a100a'; c.fillRect(0, 190, W, 50); c.fillStyle = 'rgba(255,150,70,.08)'; c.fillRect(150, 190, 170, 50); };
  // the High Warden's study: the white lamp on the desk, the valley's lamps in the window
  S.study = (t, st) => { sky([[0, '#1a1420'], [1, '#2a2030']]); c.fillStyle = '#2a2232'; c.fillRect(0, 0, W, 200);
    c.fillStyle = '#0e1028'; c.beginPath(); c.moveTo(190, 150); c.lineTo(190, 70); c.arc(230, 70, 40, Math.PI, 0); c.lineTo(270, 150); c.fill();
    c.save(); c.beginPath(); c.moveTo(190, 150); c.lineTo(190, 70); c.arc(230, 70, 40, Math.PI, 0); c.lineTo(270, 150); c.clip(); stars(t, 30, 150, 12); c.fillStyle = '#141838'; c.beginPath(); c.moveTo(190, 150); c.quadraticCurveTo(230, 118, 270, 140); c.lineTo(270, 150); c.fill();
    for (const [x, y] of [[200, 140], [214, 134], [232, 130], [250, 133], [262, 138]]) { glow(x, y, 5, '255,200,110', 0.6); c.fillStyle = '#ffe0a0'; c.fillRect(x - 0.5, y - 0.5, 1, 1); } c.restore();
    c.strokeStyle = '#1a1420'; c.lineWidth = 3; c.beginPath(); c.moveTo(230, 30); c.lineTo(230, 150); c.moveTo(190, 100); c.lineTo(270, 100); c.stroke();
    for (let i = 0; i < 6; i++) { c.fillStyle = ['#6a2a2a', '#2a4a6a', '#5a4a2a', '#3a5a3a'][i % 4]; c.fillRect(30 + i * 9, 60 + (i % 2) * 3, 7, 34 - (i % 2) * 3); } c.fillStyle = '#3a2a1e'; c.fillRect(24, 94, 64, 4); c.fillRect(24, 56, 64, 4);
    c.fillStyle = '#3a2618'; c.fillRect(60, 160, 200, 10); c.fillRect(70, 170, 8, 40); c.fillRect(242, 170, 8, 40);
    const f = 0.85 + 0.15 * Math.sin(t / 160); glow(130, 140, 70 * f, '235,240,255', 0.45); c.fillStyle = '#2a2a34'; c.fillRect(122, 136, 16, 3); c.fillRect(124, 156, 12, 4); c.fillStyle = '#f4f6ff'; c.fillRect(125, 139, 10, 17); c.fillStyle = '#2a2a34'; c.fillRect(129.5, 139, 1, 17); c.beginPath(); c.moveTo(122, 136); c.lineTo(130, 130); c.lineTo(138, 136); c.fill();
    c.fillStyle = '#e8dcc0'; c.fillRect(160, 154, 26, 6); c.strokeStyle = '#6a5a40'; c.lineWidth = 0.5; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(162, 156 + i * 1.4); c.lineTo(184, 156 + i * 1.4); c.stroke(); }
    if (st.visit) { figure(282, 200, 30, '#0c0a12', 1); glow(282, 176, 18, '200,200,220', 0.15); }
    c.fillStyle = '#16101a'; c.fillRect(0, 200, W, 40); };
  // Saltmere at dusk: Snik's eel stall
  S.stall = (t, st) => { sky([[0, '#2a3a5a'], [0.6, '#6a6a7a'], [1, '#c8906a']]); waves(t, 170, '#2a3a4a', '200,215,230');
    c.fillStyle = '#4a3a2a'; c.fillRect(0, 168, W, 6); for (let x = 6; x < W; x += 18) c.fillRect(x, 168, 3, 20);
    c.fillStyle = '#5a4030'; c.fillRect(110, 120, 100, 48); c.fillStyle = '#8a2a2a'; c.beginPath(); c.moveTo(100, 122); c.lineTo(220, 122); c.lineTo(212, 106); c.lineTo(108, 106); c.closePath(); c.fill(); c.fillStyle = '#e8dcc0'; for (let x = 112; x < 212; x += 16) c.fillRect(x, 106, 8, 16);
    c.fillStyle = '#e8dcc0'; c.fillRect(132, 92, 56, 12); c.fillStyle = '#3a2410'; c.font = 'bold 8px Georgia'; c.textAlign = 'center'; c.fillText('EELS', 160, 101);
    for (let i = 0; i < 5; i++) { const sw = Math.sin(t / 600 + i) * 0.1; c.save(); c.translate(124 + i * 18, 124); c.rotate(sw); c.strokeStyle = '#3a4a3a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(3, 8, 0, 16); c.stroke(); c.restore(); }
    const b = Math.abs(Math.sin(t / 400)) * 1.2, x = 160; c.fillStyle = '#3a5a2a'; c.beginPath(); c.arc(x, 152 - b, 6, 0, 7); c.fill(); c.beginPath(); c.moveTo(x - 4, 150 - b); c.lineTo(x - 15, 144 - b); c.lineTo(x - 3, 154 - b); c.fill(); c.beginPath(); c.moveTo(x + 4, 150 - b); c.lineTo(x + 15, 144 - b); c.lineTo(x + 3, 154 - b); c.fill(); glow(x - 2, 150 - b, 3, '255,225,74', 0.8); glow(x + 2, 150 - b, 3, '255,225,74', 0.8);
    c.fillStyle = '#3a2a1a'; c.fillRect(104, 152, 112, 16); lampPost(220, 168, 1, t, 1.4); for (let i = 0; i < 3; i++) gull(((i * 90 + t / 35) % 380) - 30, 50 + i * 12, 1.1); };
  S.black = () => { c.fillStyle = '#000'; c.fillRect(0, 0, W, H); };

  /* ---------------- the frame ---------------- */
  const ST = {}, STS = {};   // ST: the mock's shared state; STS: each scene's own, so a cross-fade paints both right
  function frame(tm) {
    if (!running) return;
    const dt = Math.min(50, tm - last); last = tm; now += V.skip ? 3000 : dt;
    fx = fx.filter(f => !f()); waiters = waiters.filter(w => { if (now >= w.at) { w.r(); return false; } return true; });
    c = ctx; ctx.setTransform(K, 0, 0, K, 0, 0);
    const stOf = n => STS[n] || ST;
    try { if (V.prev && V.mix < 1) { S[V.prev](now, stOf(V.prev)); ctx.globalAlpha = V.mix; S[V.scene](now, stOf(V.scene)); ctx.globalAlpha = 1; } else if (V.scene) S[V.scene](now, stOf(V.scene)); } catch (e) { ctx.globalAlpha = 1; console.warn('epilogue paint', e); }
    if (V.fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + V.fade + ')'; ctx.fillRect(0, 0, W, H); }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // the words: a band of dark at the foot, a title in gold over the lines
    if (V.textA > 0 && (V.text || V.title)) { const a = V.textA, CW = W * K, CH = H * K, top = V.top ? 28 : V.scene === 'hall' ? CH - 168 : CH - 190;
      const g = ctx.createLinearGradient(0, top - 30, 0, top + 190); if (V.top) { g.addColorStop(0, 'rgba(0,0,0,' + 0.75 * a + ')'); g.addColorStop(1, 'rgba(0,0,0,0)'); } else { g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.35, 'rgba(0,0,0,' + 0.72 * a + ')'); g.addColorStop(1, 'rgba(0,0,0,' + 0.85 * a + ')'); }
      ctx.fillStyle = g; ctx.fillRect(0, V.top ? 0 : top - 30, CW, 220); ctx.globalAlpha = a; ctx.textAlign = 'center'; let y = top + 30;
      if (V.title) { ctx.fillStyle = '#e8c14a'; ctx.font = '600 34px Georgia, serif'; ctx.fillText(V.title, CW / 2, y); y += 28; if (V.sub) { ctx.fillStyle = '#c8b89a'; ctx.font = 'italic 20px Georgia, serif'; ctx.fillText(V.sub, CW / 2, y); y += 12; } y += 22; }
      if (V.text && !V.title && EP.dmName) { ctx.fillStyle = '#d8b0ff'; ctx.font = 'italic 17px Georgia, serif'; ctx.fillText('— ' + EP.dmName + ' —', CW / 2, y - 6); y += 26; }   // plain narration: just his name, no portrait
      if (V.text) { ctx.fillStyle = '#efe6d2'; ctx.font = '23px Georgia, serif'; ctx.shadowColor = '#000'; ctx.shadowBlur = 6; y = wrap(V.text, CW / 2, y, CW - 140, 31); ctx.shadowBlur = 0; }
      ctx.globalAlpha = 1; }
    if (V.big && V.bigA > 0) { ctx.globalAlpha = V.bigA; ctx.textAlign = 'center'; ctx.fillStyle = '#e8c14a'; ctx.font = '600 46px Georgia, serif'; ctx.shadowColor = '#000'; ctx.shadowBlur = 12; ctx.fillText(V.big[0], W * K / 2, H * K / 2 - (V.big[1] ? 10 : -14)); if (V.big[1]) { ctx.fillStyle = '#e8dcc4'; ctx.font = 'italic 26px Georgia, serif'; ctx.fillText(V.big[1], W * K / 2, H * K / 2 + 32); } ctx.shadowBlur = 0; ctx.globalAlpha = 1; }
    if (V.note) { ctx.font = '15px Georgia, serif'; ctx.fillStyle = 'rgba(232,220,196,.55)'; ctx.textAlign = 'right'; ctx.fillText(V.note, W * K - 14, H * K - 10); }
    requestAnimationFrame(frame);
  }
  function wrap(text, x, y, mw, lh) { const words = text.split(' '); let line = ''; for (const w of words) { const t2 = line ? line + ' ' + w : w; if (ctx.measureText(t2).width > mw && line) { ctx.fillText(line, x, y); line = w; y += lh; } else line = t2; } ctx.fillText(line, x, y); return y + lh; }

  /* ---------------- the timeline ---------------- */
  EP.tap = () => { if (advance) { const a = advance; advance = null; a(); } };
  EP.skip = () => { V.skip = true; for (const w of waiters) w.at = 0; EP.tap(); };
  const waitRead = text => new Promise(r => { const ms = 2200 + String(text || '').length * 45; let done = false; const fin = () => { if (!done) { done = true; advance = null; r(); } };
    if (window.AUTO) { waiters.push({ at: now + window.AUTO, r: fin }); return; } waiters.push({ at: now + (V.skip ? 0 : ms * 1.6), r: fin }); advance = fin; });
  async function go(scene, ms) { if (!V.scene || V.scene === 'black') { V.scene = scene; V.prev = null; await tween(V, { fade: 0 }, ms || 1000); return; } V.prev = V.scene; V.scene = scene; V.mix = 0; await tween(V, { mix: 1 }, ms || 1400); V.prev = null; }
  EP.log = [];            // what was said, for the tests
  async function line(text, title, sub, top) { EP.log.push((V.scene || '') + ' | ' + (title ? title + ': ' : '') + text); V.text = text; V.title = title || null; V.sub = sub || null; V.top = !!top; await tween(V, { textA: 1 }, 600); await waitRead((title || '') + ' ' + text); await tween(V, { textA: 0 }, 500); V.text = V.title = V.sub = null; }
  async function big(a, b, ms) { V.big = [a, b]; await tween(V, { bigA: 1 }, 900); await sleep(ms || 2200); await tween(V, { bigA: 0 }, 800); V.big = null; }
  EP.cond = () => false;
  // walk a script's commands the way G.run would, keeping only what is said: notes, and cards with their lines
  function said(cmds, out) { for (const c2 of cmds || []) { if (!Array.isArray(c2)) continue;
      if (c2[0] === 'if') said(EP.cond(c2[1]) ? c2[2] : c2[3], out); else if (c2[0] === 'note') out.push({ text: c2[1] });
      else if (c2[0] === 'card') out.push({ title: c2[1], sub: c2[2], text: (c2[3] || []).join(' ') }); else if (c2[0] === 'run' && EP.scripts[c2[1]]) said(EP.scripts[c2[1]], out); }
    return out; }
  EP.play = async function (valley, heroes) {
    const C = EP.cond;
    V.scene = 'black'; V.fade = 1;
    await go('dawn', 1600); await big('', 'Afterwards', 1800);
    // the valley, place by place: each scene shows only if its place has something to say, dressed for how things went
    const look = {
      brackenford: () => ({ scene: 'brackenford', st: { tobiasLamp: 1, horseshoe: C('ingridAlly'), pell: C('silver=1') } }),
      saltmere: () => ({ scene: 'saltmere', st: { lightLit: C('lightLit'), boats: C('hostagesSaved') ? 6 : 3, mourn: !C('hostagesSaved') } }),
      karrow: () => ({ scene: 'karrow', st: { giant: C('giant=1') } }),
      highmoor: () => ({ scene: 'highmoor', st: { duke: C('dukeCured') } }),
      wardens: () => C('veyra5=1') && !C('ending=3') ? { scene: 'lamps', st: { walkers: 2 } } : C('veyra5=2') ? { scene: 'lamps', st: { walkers: 1 } } : { scene: 'study', st: { visit: C('veyra5=3') } },
      ballad: () => ({ scene: 'ballad', st: { ending: C('ending=1') ? 1 : C('ending=2') ? 2 : 3, ennet: C('ending=1') } }),
      goblins: () => ({ scene: 'goblins', st: {} }), snik: () => ({ scene: 'stall', st: {} })
    };
    for (const [place, cmds] of valley) { const lines = said(cmds, []); if (!lines.length) continue; const lk = (look[place] || (() => ({ scene: 'dawn', st: {} })))();
      const st = STS[lk.scene] = Object.assign({ tobiasLamp: 1 }, lk.st); if (lk.scene === 'lamps') st.lampsLit = 0; await go(lk.scene); if (lk.scene === 'lamps') tween(st, { lampsLit: 8 }, 9000);
      for (const l of lines) await line(l.text, l.title, l.sub); }
    // the hall of windows: the ending, each hero, the pairs; then the Crooked Lantern
    const cards = said(heroes, []), NAMES = ['Runa', 'Dask', 'Maren', 'Finch'], bondLit = [1, C('bond.dask>=10') ? 1 : C('bond.dask>=4') ? 0.85 : 0.7, C('bond.maren>=10') ? 1 : C('bond.maren>=4') ? 0.85 : 0.7, C('bond.finch>=10') ? 1 : C('bond.finch>=4') ? 0.85 : 0.7];
    hall.roseCols = C('ending=1') ? ['#e8c040', '#c02040', '#f4e080'] : C('ending=2') ? ['#f4f0e0', '#c8b8a0', '#e8dcc0'] : ['#8a8a96', '#b8bcc8', '#5a5a66']; hall.roseGlow = C('ending=1') ? '255,220,140' : C('ending=2') ? '255,245,225' : '210,215,230';
    await tween(V, { fade: 1 }, 1100); V.scene = 'hall'; V.prev = null; WIN.forEach(w => w.lit = 0.18); hall.rose = 0.2; hall.figureLook = 0; await tween(V, { fade: 0 }, 1800);
    await Promise.all(WIN.map((w, i) => sleep(i * 350).then(() => tween(w, { lit: 0.42 }, 1500))));
    const light = async (on, look2) => { await Promise.all([...WIN.map((w, i) => tween(w, { lit: on.includes(i) ? bondLit[i] : 0.28 }, 1200)), tween(hall, { figureLook: look2 }, 1200)]); };
    let lantern = null;
    for (const cd of cards) {
      if (cd.title === 'The Crooked Lantern') { lantern = cd; continue; }
      if (cd.title === 'Your ending') { await tween(hall, { rose: 1 }, 1200); await line(cd.sub, 'Your ending'); await tween(hall, { rose: 0.45 }, 800); continue; }
      const who = NAMES.map((n, i) => (cd.title || '').includes(n) ? i : -1).filter(i => i >= 0);
      if (who.length) await light(who, who.length === 1 ? (who[0] - 1.5) / 1.5 : 0); else await light([0, 1, 2, 3], 0);
      await line(cd.text, cd.title, cd.sub);
    }
    await light([0, 1, 2, 3], 0); await sleep(1600);
    if (lantern) { STS.lantern = { seats: C('end.bonds>=12') ? 4 : 0 }; await go('lantern', 1800); await line(lantern.text, 'The Crooked Lantern'); }
    await tween(V, { fade: 1 }, 1400); V.scene = 'black'; V.fade = 0;
    await big('The End', 'The Barrow Crown', 3000);
  };
  EP.glass = {}; EP.scripts = {};
  EP.dmName = null;   // set by the game when the DM narrates (G.opts.dmNarrator)
  EP.mount = (canvas) => { cv = canvas; ctx = cv.getContext('2d'); cv.width = W * K; cv.height = H * K; for (let i = 0; i < 4; i++) EP.windows[i] = makeWindow(i);
    now = 0; fx = []; waiters = []; advance = null; Object.assign(V, { scene: null, prev: null, mix: 1, fade: 0, text: null, textA: 0, title: null, sub: null, big: null, bigA: 0, skip: false });
    running = true; requestAnimationFrame(t => { last = t; requestAnimationFrame(frame); }); };
  EP.unmount = () => { running = false; advance = null; };
  EP.V = V; EP.WIN = WIN; EP.hall = hall; EP.ST = ST; EP.S = S; EP.go = go;
})();

/* ---------- in the game: ['epilogue'] plays it over the screen ---------- */
(function () {
  const load = url => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = url; });
  G.playEpilogue = async function () {
    const D = G.D, img = (D.portraitOil && D.portraitOil.img) || {};
    for (const id of ['runa', 'dask', 'maren', 'finch']) if (!EP.glass[id] && img['glass|' + id]) EP.glass[id] = await load(img['glass|' + id]);
    EP.cond = k => G.cond(k); EP.scripts = D.scripts; EP.dmName = G.opts.dmNarrator !== false ? "The Dungeon Master" : null;
    if (G.fast) return;
    const box = document.createElement('div'); box.className = 'animbox';
    box.style.cssText = 'position:absolute;inset:0;z-index:60;background:#000;display:flex;align-items:center;justify-content:center';
    const cv = document.createElement('canvas'); cv.style.cssText = 'width:100%;height:100%;display:block'; box.appendChild(cv); UI.root.appendChild(box);
    cv.addEventListener('pointerdown', () => { G.audio.unlock(); EP.tap(); });
    const modal = { press: b => { if (b === 'a') EP.tap(); }, skip: () => { const i = G.modals.indexOf(modal); if (i >= 0) G.modals.splice(i, 1); EP.skip(); } };
    G.modals.push(modal);
    EP.mount(cv); EP.V.note = ('ontouchstart' in window || navigator.maxTouchPoints > 0) ? 'A next   B twice: skip' : G.keyText('{a} next   {b} twice: skip');
    let skipped; const sk = new Promise(r => { skipped = r; }); const sk0 = EP.skip; EP.skip = () => { sk0(); skipped(); };
    const watch = setInterval(() => { if (G.fast) EP.skip(); }, 100);
    try { await Promise.race([EP.play(D.epilogueValley || [], D.scripts.epilogueHeroes || []), sk]); }
    finally { EP.skip = sk0; clearInterval(watch); EP.unmount(); box.remove(); const i = G.modals.indexOf(modal); if (i >= 0) G.modals.splice(i, 1); }
  };
})();
