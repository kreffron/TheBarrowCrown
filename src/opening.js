/* ===== the opening, as a side-on 2D animation (engine, then scenes, then the hook into the game) ===== */
/* The opening, side on: a small 2D animation engine. A camera over a scene painter, jointed figures with faces,
   hands, folds and a proper walk, light and dark, and a timeline of awaited steps (walks, turns, poses, lines of
   dialogue with the oil portraits). OP.mount(canvas, opts) attaches it; OP.play() runs the opening (scenes.js). */
(function () {
  const W = 960, SH = 540;                 // the scene is 960 x 540; the canvas may be taller, with the scene at oy
  let cv = null, ctx = null, H = 540, OY = 0, running = false;
  const OP = window.OP = {};
  let now = 0, last = 0, scene = null, actors = [], fx = [], shakeT = 0, shakeA = 0, waiters = [];
  const cam = { x: 0, y: 0, z: 1 };
  const view = { fade: 1, letter: 1, caption: null, capA: 0, card: null, cardA: 0, dlg: null, skip: false, lines: [] };
  OP.speakers = { 'The Barrow King': '#c890f0', 'Hooded Man': '#b8b0d0', Veyra: '#d6d6e4', Grukk: '#9bd06a', Skrit: '#c59be8' };
  OP.portrait = () => null;                // (who, mood) -> image url
  const imgs = {}; const imgOf = url => url ? (imgs[url] || (imgs[url] = Object.assign(new Image(), { src: url }))) : null;
  let sd = 11; const rr = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
  const lerp = (a, b, t) => a + (b - a) * t, ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const al = (h, a) => { const n = parseInt(h.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; };
  const sh = (h, p) => { const n = parseInt(h.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v + (p > 0 ? (255 - v) * p / 100 : v * p / 100)))); return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join(''); };

  /* ---------------- timing ---------------- */
  const sleep = ms => new Promise(r => waiters.push({ at: now + (view.skip ? 0 : ms), r }));
  function tween(o, props, ms, ez) { const from = {}; for (const k in props) from[k] = o[k]; const t0 = now; ms = view.skip ? 1 : ms;
    return new Promise(r => fx.push({ step: () => { const t = clamp((now - t0) / ms, 0, 1), e = (ez || ease)(t); for (const k in props) o[k] = lerp(from[k], props[k], e); if (t >= 1) { r(); return true; } } })); }
  let advance = null, hurryT = 0;
  OP.tap = () => { if (advance) { const a = advance; advance = null; a(); } else hurryT = now + 700; };
  OP.skip = () => { view.skip = true; for (const w of waiters) w.at = 0; OP.tap(); };

  /* ---------------- figures ---------------- */
  // A figure stands with its feet at (x, y), facing right when face = 1; about 100 units tall for a person.
  function actor(o) { const a = Object.assign({ x: 0, y: 440, s: 1, face: 1, walk: 0, moving: 0, armF: 0.12, armB: -0.08, foreF: 0.25, foreB: 0.2, bob: 0, sit: 0, alpha: 1, glow: 0, crouch: 0, sway: 0, tilt: 0, brow: 0, blinkAt: 1500 + rr() * 3000 }, o); actors.push(a); return a; }
  OP.walk = async (a, x, speed) => { a.moving = 1; a.face = x > a.x ? 1 : -1; const d = Math.abs(x - a.x), ms = d / (speed || 60) * 1000; await tween(a, { x }, ms, t => t); a.moving = 0; };
  OP.turn = (a, f) => { a.face = f; return sleep(200); };
  OP.pose = (a, p, ms) => tween(a, p, ms || 450);

  const seg = (x0, y0, a, l) => [x0 + Math.sin(a) * l, y0 + Math.cos(a) * l];
  function taper(x0, y0, x1, y1, w0, w1, fill) {          // a limb segment as a tapered capsule
    const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(x0 + nx * w0 / 2, y0 + ny * w0 / 2); ctx.lineTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2); ctx.arc(x1, y1, w1 / 2, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI); ctx.lineTo(x0 - nx * w0 / 2, y0 - ny * w0 / 2); ctx.arc(x0, y0, w0 / 2, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI); ctx.fill(); }
  function lgrad(x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([t, c]) => g.addColorStop(t, c)); return g; }
  function handAt(x, y, ang, col, bony, open) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-ang);
    if (bony) { ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = 1.4; for (let i = -1; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 1.1, 0); ctx.lineTo(i * 1.6 + (open ? i : 0), 5.4 + (i === 0 || i === 1 ? 1 : 0)); ctx.stroke(); } ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0.6, -0.4, 2.6, 1.8, 0, 0, 6.283); ctx.fill(); }
    else { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0.4, 2.2, 2.6, 3.4, 0.1, 0, 6.283); ctx.fill(); ctx.beginPath(); ctx.ellipse(2.4, 0.8, 1.1, 2, -0.6, 0, 6.283); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(-1.2, 3.6); ctx.lineTo(1.8, 4.4); ctx.stroke(); }
    ctx.restore();
  }

  function drawFigure(a) {
    const sp = a.sp, k = a.kind, ph = a.walk, mv = a.moving;
    const sinp = Math.sin(ph), cosp = Math.cos(ph), breath = Math.sin(now / 700 + a.x * 0.01);
    const bob = mv ? Math.abs(cosp) * 2.4 - 1 : breath * 0.4;
    ctx.save(); ctx.translate(a.x, a.y); ctx.scale(a.face * a.s, a.s); ctx.globalAlpha = a.alpha;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, 1, 24, 4.4, 0, 0, 6.283); ctx.fill();
    ctx.translate(0, -bob + a.crouch * 8); ctx.rotate(mv ? 0.05 : 0);
    const hipY = -46, shY = -76 + a.crouch * 4 + (mv ? 0 : breath * 0.3);
    const skin = sp.skin, cloth = sp.cloth, dk = sh(cloth, -38), lt = sh(cloth, 24), skinD = sh(skin, -30);
    if (a.throne) throne();
    // the cape, behind everything, with a lift and a flutter
    if (sp.cape) { const fl = Math.sin(now / 260 + a.x) * (mv ? 3 : 1), back = mv ? 8 : 2;
      ctx.fillStyle = lgrad(-30, -70, 10, 0, [[0, sh(sp.cape, -35)], [1, sh(sp.cape, 8)]]); ctx.beginPath(); ctx.moveTo(-3, shY + 1);
      ctx.bezierCurveTo(-16 - back, -54, -20 - back - fl, -24, -22 - back * 1.4 - fl, a.sit ? -46 : -1); ctx.lineTo(-14 - back * 0.4 + fl * 0.5, a.sit ? -46 : -0.5); ctx.lineTo(-7, a.sit ? -46 : 0); ctx.bezierCurveTo(-9, -30, -6, -56, 7, shY + 3); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 1; for (const t of [0.3, 0.6]) { ctx.beginPath(); ctx.moveTo(-6, shY + 6); ctx.quadraticCurveTo(-12 - back * t, -36, -18 * t - 8 - back * t - fl * t, a.sit ? -32 : -1); ctx.stroke(); } }
    // legs: thigh and shin, a knee that bends, a foot that lifts
    const leg = side => { let th = side * sinp * 0.52, kn = Math.max(0, side * cosp) * 0.8 + 0.04;
      if (!mv) { th = side * 0.06; kn = 0.03; } if (a.sit) { th = -1.5 + side * 0.08; kn = 1.52; }
      const col = side > 0 ? (sp.legs || dk) : sh(sp.legs || dk, -32), [kx, ky] = seg(side * 2, hipY, th, 23), [fx2, fy2] = seg(kx, ky, th - kn, 23);
      taper(side * 2, hipY, kx, ky, 10, 8.5, col); taper(kx, ky, fx2, fy2, 8.5, 6.5, col);
      const lift = mv ? Math.max(0, -side * cosp) * 0.25 : 0; ctx.save(); ctx.translate(fx2, fy2); ctx.rotate(-lift);
      ctx.fillStyle = side > 0 ? (sp.boots || '#2e2218') : sh(sp.boots || '#2e2218', -35); ctx.beginPath(); ctx.moveTo(-3.6, -2.4); ctx.lineTo(5, -2.6); ctx.quadraticCurveTo(9.6, -1.6, 9, 1.4); ctx.lineTo(-4, 1.4); ctx.closePath(); ctx.fill(); ctx.restore(); };
    if (!sp.robe || a.sit) leg(-1);
    // the far arm
    const armPts = side => { const sw = mv ? -side * sinp * 0.45 : 0, a1 = (side > 0 ? a.armF : a.armB) + sw, a2 = (side > 0 ? a.foreF : a.foreB) + (mv ? 0.2 : 0);
      const [ex, ey] = seg(1, shY + 4, a1, 17), [hx2, hy2] = seg(ex, ey, a1 + a2, 15.5); return { a1, a2, ex, ey, hx2, hy2 }; };
    const drawArm = side => { const p = armPts(side), col = side > 0 ? cloth : sh(cloth, -34), wide = sp.robe;
      taper(1, shY + 4, p.ex, p.ey, wide ? 11 : 8.5, wide ? 10 : 7.5, col);
      if (wide) { ctx.fillStyle = col; ctx.beginPath(); const [cx2, cy2] = seg(p.ex, p.ey, p.a1 + p.a2, 13); ctx.moveTo(p.ex - 5, p.ey); ctx.lineTo(cx2 - 6.5, cy2 + 2); ctx.lineTo(cx2 + 4, cy2 + 2); ctx.lineTo(p.ex + 5, p.ey); ctx.closePath(); ctx.fill(); if (sp.trim) { ctx.strokeStyle = sp.trim; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx2 - 6.5, cy2 + 2); ctx.lineTo(cx2 + 4, cy2 + 2); ctx.stroke(); } }
      else taper(p.ex, p.ey, p.hx2, p.hy2, 7.5, 6, col);
      ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(p.ex - 2, p.ey - 3); ctx.quadraticCurveTo(p.ex, p.ey + 1, p.ex + 3, p.ey - 1); ctx.stroke();
      handAt(p.hx2, p.hy2, p.a1 + p.a2, side > 0 ? skin : skinD, k === 'skel', a.openHand && side > 0); return p; };
    if (!a.noBackArm) drawArm(-1);
    if (!sp.robe || a.sit) leg(1);
    // the robe: a skirt that swings with the stride, folds that follow it
    if (sp.robe && !a.sit) { const f = mv ? sinp * 6 : breath * 0.4, hem = -0.5;
      ctx.fillStyle = lgrad(-16, 0, 17, 0, [[0, dk], [0.55, cloth], [1, lt]]); ctx.beginPath(); ctx.moveTo(-10, hipY - 5);
      ctx.bezierCurveTo(-14, -30, -16 - f * 0.4, -12, -17 - f * 0.5, hem); ctx.quadraticCurveTo(-8, hem + 2.4, -1, hem + 1); ctx.quadraticCurveTo(8, hem + 3, 16 + f, hem - 0.5); ctx.bezierCurveTo(15 + f * 0.5, -14, 13, -30, 11, hipY - 5); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1.1; for (const [x, w] of [[-6, 0.2], [0, 0.6], [6, 1]]) { ctx.beginPath(); ctx.moveTo(x * 0.6, hipY + 2); ctx.bezierCurveTo(x * 0.8, -30, x + f * w * 0.6, -14, x * 1.4 + f * w, hem + 1); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(9, hipY); ctx.bezierCurveTo(12, -30, 13 + f * 0.4, -14, 14 + f * 0.8, hem - 1); ctx.stroke();
      if (sp.trim) { ctx.strokeStyle = sp.trim; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(-17 - f * 0.5, hem); ctx.quadraticCurveTo(-8, hem + 2.4, -1, hem + 1); ctx.quadraticCurveTo(8, hem + 3, 16 + f, hem - 0.5); ctx.stroke(); }
      if (mv) { ctx.fillStyle = sp.boots || '#2e2218'; const fx3 = f * 1.3; ctx.beginPath(); ctx.ellipse(fx3 + 6, 0, 6, 2.4, 0, 0, 6.283); ctx.fill(); } }
    if (sp.robe && a.sit) { ctx.fillStyle = lgrad(-14, 0, 30, 0, [[0, dk], [1, lt]]); ctx.beginPath(); ctx.moveTo(-12, hipY - 7); ctx.lineTo(22, hipY - 7); ctx.quadraticCurveTo(28, hipY - 4, 27, hipY + 6); ctx.lineTo(28, -2); ctx.lineTo(14, -2); ctx.lineTo(14, hipY + 8); ctx.lineTo(-12, hipY + 8); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1; for (const x of [17, 21, 25]) { ctx.beginPath(); ctx.moveTo(x, hipY + 4); ctx.lineTo(x + 1, -3); ctx.stroke(); } }
    // the torso, with the chest forward and a curve in the back
    const big = sp.big ? 4 : 0;
    ctx.fillStyle = lgrad(-12, 0, 14 + big, 0, [[0, dk], [0.5, cloth], [1, lt]]); ctx.beginPath(); ctx.moveTo(-8, shY - 1); ctx.bezierCurveTo(-14, shY + 8, -12, hipY - 10, -10, hipY + 1); ctx.lineTo(10, hipY + 1); ctx.bezierCurveTo(12, hipY - 10, 14 + big, shY + 10, 10, shY); ctx.quadraticCurveTo(1, shY - 5, -8, shY - 1); ctx.fill();
    if (k === 'skel' && a.ribs) { ctx.strokeStyle = '#d8ccb0'; ctx.lineWidth = 1.3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-3, shY + 7 + i * 5); ctx.quadraticCurveTo(6, shY + 5 + i * 5, 9, shY + 9 + i * 5); ctx.stroke(); } }
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(2, shY + 4); ctx.quadraticCurveTo(5, (shY + hipY) / 2, 3, hipY); ctx.stroke();
    if (sp.belt) { ctx.fillStyle = sp.belt; ctx.fillRect(-11, hipY - 4, 23 + big, 4.4); ctx.fillStyle = '#c8a050'; ctx.fillRect(7, hipY - 4.2, 3.4, 4.8); }
    if (sp.rope) { ctx.strokeStyle = sp.rope; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-10, hipY - 2); ctx.lineTo(11, hipY - 3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(8, hipY - 3); ctx.quadraticCurveTo(10 + (mv ? sinp * 2 : 0), hipY + 6, 9, hipY + 14); ctx.stroke(); }
    if (sp.fur) { for (let i = 0; i < 26; i++) { const x = -13 + i * 1.1, l = 4 + (i * 7 % 5); ctx.strokeStyle = i % 2 ? sp.fur : sh(sp.fur, 25); ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(x, shY - 2); ctx.lineTo(x + 0.6, shY + l); ctx.stroke(); } ctx.fillStyle = sp.fur; ctx.beginPath(); ctx.ellipse(0, shY, 14, 4.4, 0, 0, 6.283); ctx.fill(); }
    if (sp.trim && sp.robe) { ctx.strokeStyle = sp.trim; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(5, shY + 1); ctx.quadraticCurveTo(9, (shY + hipY) / 2, 9, hipY + 1); ctx.stroke(); }
    // the head
    const hy = shY - 12 + (mv ? 0 : breath * 0.2), hxp = 3 + (mv ? 1.4 : 0);
    ctx.save(); ctx.translate(hxp, hy); ctx.rotate(a.tilt || 0);
    if (k === 'skel') skull(a); else if (k === 'goblin') gobHead(a); else humanHead(a);
    ctx.restore();
    // held things, then the near arm over them
    if (sp.held === 'spade') { ctx.save(); ctx.translate(14, -46); ctx.rotate(0.45 + (mv ? sinp * 0.08 : 0)); ctx.fillStyle = lgrad(-2, 0, 2, 0, [[0, '#8a5a2a'], [1, '#4a2e14']]); ctx.fillRect(-1.7, -32, 3.4, 54); ctx.fillStyle = lgrad(-6, 0, 6, 0, [[0, '#6a6e78'], [0.5, '#c8ccd4'], [1, '#5a5e68']]); ctx.beginPath(); ctx.moveTo(-6, 21); ctx.lineTo(6, 21); ctx.lineTo(5.4, 33); ctx.quadraticCurveTo(0, 38, -5.4, 33); ctx.closePath(); ctx.fill(); ctx.restore(); }
    if (sp.held === 'staff') { ctx.fillStyle = lgrad(17, 0, 21, 0, [[0, '#7a5230'], [1, '#3a2410']]); ctx.fillRect(17.5, -98, 3.4, 98); ctx.strokeStyle = '#5a3a1e'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(19.2, -101, 5, 0.3, 5.9); ctx.stroke();
      const g = ctx.createRadialGradient(19.2, -101, 0, 19.2, -101, 16); g.addColorStop(0, al(sp.gem, 0.9)); g.addColorStop(1, al(sp.gem, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(19.2, -101, 16, 0, 6.283); ctx.fill(); ctx.fillStyle = '#fff0f0'; ctx.beginPath(); ctx.arc(19.2, -101, 1.6, 0, 6.283); ctx.fill(); }
    const near = drawArm(1);
    if (sp.held === 'lantern' && !a.noLantern) { const lx = near.hx2 + 1, ly = near.hy2 + 4, lit = a.lanternLit !== false;
      if (lit) { const lg = ctx.createRadialGradient(lx, ly + 9, 0, lx, ly + 9, 64); lg.addColorStop(0, 'rgba(220,235,255,.32)'); lg.addColorStop(1, 'rgba(220,235,255,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(lx, ly + 9, 64, 0, 6.283); ctx.fill(); }
      ctx.strokeStyle = '#2e2418'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(lx, ly, 2.4, Math.PI, 0); ctx.stroke(); ctx.fillStyle = '#2e2418'; ctx.beginPath(); ctx.moveTo(lx - 5.4, ly + 3); ctx.lineTo(lx, ly); ctx.lineTo(lx + 5.4, ly + 3); ctx.fill(); ctx.fillRect(lx - 5, ly + 16, 10, 2);
      ctx.fillStyle = lit ? lgrad(0, ly + 3, 0, ly + 16, [[0, '#ffffff'], [1, '#b8c8f0']]) : '#3a3a44'; ctx.fillRect(lx - 4, ly + 3, 8, 13); ctx.fillStyle = '#2e2418'; ctx.fillRect(lx - 0.5, ly + 3, 1, 13); }
    ctx.restore();
  }
  function throne() {
    ctx.fillStyle = lgrad(-30, -190, 10, 0, [[0, '#3a2e44'], [1, '#120e18']]); ctx.beginPath(); ctx.moveTo(-28, -40); ctx.lineTo(-28, -150); ctx.lineTo(-22, -176); ctx.lineTo(-16, -150); ctx.lineTo(-14, -40); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4a1a2a'; ctx.fillRect(-25, -142, 8, 94); ctx.fillStyle = '#e8c14a'; ctx.beginPath(); ctx.arc(-21, -160, 2.4, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#231b2c'; ctx.fillRect(-28, -44, 56, 12); ctx.fillRect(-26, -32, 6, 32); ctx.fillRect(20, -32, 6, 32); ctx.fillStyle = '#3e3448'; ctx.fillRect(-28, -46, 56, 3);
    ctx.fillStyle = '#2a2134'; ctx.fillRect(16, -64, 10, 20); ctx.fillStyle = '#3e3448'; ctx.fillRect(14, -66, 14, 3);
  }
  function humanHead(a) {
    const sp = a.sp, skin = sp.skin, sD = sh(skin, -28), blink = (now % a.blinkAt) < 130;
    if (sp.hood) { ctx.fillStyle = lgrad(-16, 0, 10, 0, [[0, sh(sp.hood, -40)], [1, sh(sp.hood, -12)]]); ctx.beginPath(); ctx.moveTo(-15, 12); ctx.bezierCurveTo(-20, -6, -14, -17, 0, -17); ctx.quadraticCurveTo(13, -16, 15, -2); ctx.lineTo(13, 12); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = lgrad(-3, 0, 5, 0, [[0, sh(skin, -40)], [1, sD]]); ctx.beginPath(); ctx.moveTo(-3.4, 4); ctx.lineTo(4, 5); ctx.lineTo(5, 14); ctx.lineTo(-4, 14); ctx.closePath(); ctx.fill();
    // skull and face in profile: brow, nose, lips, chin, the jaw back to the ear
    const face = new Path2D(); face.moveTo(-8, -1); face.bezierCurveTo(-9.4, -10, -4, -12.4, 1, -12.2); face.bezierCurveTo(6.6, -12, 9.2, -8.6, 9.4, -5.4); face.quadraticCurveTo(9.8, -4, 9.2, -3.2);
    face.bezierCurveTo(10.6, -1.6, 12.6, 0.6, 12.2, 1.6); face.quadraticCurveTo(11.4, 2.4, 10, 2.2); face.quadraticCurveTo(10.6, 3.2, 10.4, 4.0); face.quadraticCurveTo(10.9, 4.6, 10.1, 5.2); face.quadraticCurveTo(10.6, 6.2, 9.8, 6.8);
    face.bezierCurveTo(10, 8.4, 8.6, 9.6, 6.6, 9.6); face.bezierCurveTo(3.4, 9.6, 0.4, 8.6, -1.6, 6.6); face.bezierCurveTo(-5.4, 5.6, -7.6, 3, -8, -1); face.closePath();
    ctx.fillStyle = lgrad(-9, 0, 12, 0, [[0, sh(skin, -34)], [0.45, sh(skin, -8)], [1, sh(skin, 10)]]); ctx.fill(face);
    ctx.save(); ctx.clip(face);
    ctx.fillStyle = 'rgba(220,100,90,.18)'; ctx.beginPath(); ctx.ellipse(5.6, 2, 3, 2, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.beginPath(); ctx.ellipse(-1, 5, 6, 4, 0.4, 0, 6.283); ctx.fill();
    ctx.restore();
    if (!sp.hood) { ctx.fillStyle = sD; ctx.beginPath(); ctx.ellipse(-2.2, -0.6, 2.2, 3.2, 0.2, 0, 6.283); ctx.fill(); ctx.strokeStyle = sh(skin, -50); ctx.lineWidth = 0.5; ctx.beginPath(); ctx.arc(-2, -0.6, 1.3, -1.2, 1.6); ctx.stroke(); }
    // the eye: white, iris, a lid, lashes; a blink now and then
    if (blink) { ctx.strokeStyle = '#2a1810'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(4.6, -3); ctx.quadraticCurveTo(6.4, -2.2, 8, -2.8); ctx.stroke(); }
    else { ctx.fillStyle = '#efe6de'; ctx.beginPath(); ctx.moveTo(4.4, -3); ctx.quadraticCurveTo(6.4, -4.6, 8.3, -3); ctx.quadraticCurveTo(6.4, -1.7, 4.4, -3); ctx.fill();
      ctx.fillStyle = sp.eye || '#5a3a22'; ctx.beginPath(); ctx.arc(6.9 + (a.lookDx || 0), -3.05, 1.15, 0, 6.283); ctx.fill(); ctx.fillStyle = '#0a0606'; ctx.beginPath(); ctx.arc(7.1 + (a.lookDx || 0), -3.05, 0.5, 0, 6.283); ctx.fill();
      ctx.strokeStyle = '#2a1810'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(4.2, -3.1); ctx.quadraticCurveTo(6.4, -4.9, 8.5, -3.2); ctx.stroke(); ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(8.3, -3.4); ctx.lineTo(9.1, -3.9); ctx.stroke(); }
    ctx.strokeStyle = al(sh(sp.hair || '#5a3a22', -30), 0.9); ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(3.8, -5.6 + a.brow * 0.5); ctx.quadraticCurveTo(6.4, -6.6 - a.brow * 0.2, 9, -5.6 - a.brow * 0.6); ctx.stroke();
    ctx.strokeStyle = 'rgba(80,30,24,.75)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(8.2, 4.6); ctx.quadraticCurveTo(9.4, 4.8 + (a.mouth || 0), 10.2, 4.5); ctx.stroke();
    ctx.strokeStyle = 'rgba(80,40,30,.35)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(9.4, 1.8); ctx.quadraticCurveTo(8.2, 2.2, 7.8, 3.6); ctx.stroke();
    if (sp.age) { ctx.strokeStyle = 'rgba(80,40,30,.3)'; ctx.lineWidth = 0.4; for (const y of [-8.6, -7.6]) { ctx.beginPath(); ctx.moveTo(2, y); ctx.lineTo(8, y + 0.4); ctx.stroke(); } }
    if (a.shadowFace) { ctx.fillStyle = lgrad(0, -12, 0, 6, [[0, 'rgba(0,0,0,.92)'], [0.65, 'rgba(0,0,0,.82)'], [1, 'rgba(0,0,0,.15)']]); ctx.fill(face); ctx.fillStyle = 'rgba(200,190,230,.6)'; ctx.beginPath(); ctx.arc(6.9, -3, 0.6, 0, 6.283); ctx.fill(); }
    if (sp.hair && !sp.hood) { ctx.fillStyle = sp.hair; ctx.beginPath(); ctx.moveTo(-8.4, 3); ctx.bezierCurveTo(-11.4, -12, 0, -15.4, 6, -12.6); ctx.quadraticCurveTo(10, -10.4, 9.8, -6.4); ctx.quadraticCurveTo(4, -9, -2, -7); ctx.quadraticCurveTo(-5, -2, -4, 3); ctx.closePath(); ctx.fill(); }
    // the hood's front: a deep opening, shadow inside it
    if (sp.hood) { const h = sp.hood, hood = new Path2D(); hood.moveTo(-15, 12); hood.bezierCurveTo(-21, -10, -12, -18.6, 1, -18); hood.bezierCurveTo(12, -17.4, 16, -10, 15.4, -3); hood.bezierCurveTo(12, -9, 7, -11.4, 2, -11); hood.bezierCurveTo(-4.4, -10.4, -6.6, -4, -6, 2); hood.bezierCurveTo(-5.6, 7, -1, 10.6, 4, 13); hood.lineTo(-8, 15); hood.closePath();
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.moveTo(15.4, -3); ctx.bezierCurveTo(12, -9, 7, -11.4, 2, -11); ctx.bezierCurveTo(-4.4, -10.4, -6.6, -4, -6, 2); ctx.lineTo(-2, 2); ctx.bezierCurveTo(-2, -6, 4, -8.4, 9, -7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = lgrad(-18, -10, 16, 6, [[0, sh(h, -30)], [0.6, h], [1, sh(h, 18)]]); ctx.fill(hood);
      ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-12, -6); ctx.quadraticCurveTo(-6, -15, 6, -15.4); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-13, 4); ctx.quadraticCurveTo(-10, -4, -8, -9); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(14.6, -4); ctx.bezierCurveTo(12, -9.6, 7, -11.8, 2, -11.4); ctx.stroke();
      if (sp.hair) { ctx.strokeStyle = sp.hair; ctx.lineWidth = 1.1; for (const dx of [0, 1.4, 2.6]) { ctx.beginPath(); ctx.moveTo(3 + dx, -10.6); ctx.quadraticCurveTo(-0.4 + dx * 0.6, -3, 0.6 + dx * 0.4, 7 - dx); ctx.stroke(); } } }
  }
  function gobHead(a) {
    const sp = a.sp, skin = sp.skin, sD = sh(skin, -30);
    const ear = new Path2D(); ear.moveTo(-5, -5); ear.bezierCurveTo(-12, -10, -21, -14, -29, -19); ear.bezierCurveTo(-24, -10, -16, -1, -5, 3); ear.closePath();
    ctx.fillStyle = lgrad(-28, -18, -4, 0, [[0, sh(skin, -10)], [1, sD]]); ctx.fill(ear); ctx.fillStyle = 'rgba(220,110,100,.35)'; ctx.beginPath(); ctx.moveTo(-8, -3); ctx.bezierCurveTo(-14, -8, -20, -11, -24, -15); ctx.bezierCurveTo(-18, -7, -12, -2, -7, 0); ctx.fill();
    const head = new Path2D(); head.moveTo(-8, 1); head.bezierCurveTo(-10, -11, -4, -13, 2, -12.6); head.bezierCurveTo(8, -12, 10, -8, 10, -5.4); head.bezierCurveTo(13, -4, 17.6, -1, 16.6, 1.8); head.quadraticCurveTo(15, 3.6, 11, 3); head.quadraticCurveTo(11.6, 4.6, 10.6, 5.4); head.bezierCurveTo(10.4, 8.6, 6, 10, 2, 9.4); head.bezierCurveTo(-3, 8.6, -7, 6, -8, 1); head.closePath();
    ctx.fillStyle = lgrad(-9, 0, 16, 0, [[0, sh(skin, -32)], [0.5, sh(skin, -6)], [1, sh(skin, 12)]]); ctx.fill(head);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; for (const [x, y] of [[1, -6], [4, 6], [-3, 2]]) { ctx.beginPath(); ctx.arc(x, y, 0.7, 0, 6.283); ctx.fill(); }
    const eg = ctx.createRadialGradient(5.8, -4, 0, 5.8, -4, 5); eg.addColorStop(0, al(sp.eyes, 0.55)); eg.addColorStop(1, al(sp.eyes, 0)); ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(5.8, -4, 5, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#e8d890'; ctx.beginPath(); ctx.moveTo(3.8, -4); ctx.quadraticCurveTo(5.8, -5.6, 8, -4.2); ctx.quadraticCurveTo(5.8, -2.6, 3.8, -4); ctx.fill(); ctx.fillStyle = sp.eyes; ctx.beginPath(); ctx.arc(6.4, -4, 1.1, 0, 6.283); ctx.fill(); ctx.fillStyle = '#100808'; ctx.fillRect(6.2, -4.9, 0.5, 1.8);
    ctx.strokeStyle = sh(skin, -55); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(3, -6.4); ctx.lineTo(8.6, -5.6 + (a.brow || 0)); ctx.stroke();
    ctx.strokeStyle = 'rgba(30,10,10,.8)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(5.4, 5.4); ctx.quadraticCurveTo(8, 6.4 + (a.mouth || 0), 10.6, 5.2); ctx.stroke();
    ctx.fillStyle = '#fffbe8'; ctx.beginPath(); ctx.moveTo(8.4, 5.6); ctx.lineTo(9.2, 2.8); ctx.lineTo(10, 5.6); ctx.fill();
    if (sp.helm) { const hm = new Path2D(); hm.moveTo(-10.4, -2); hm.bezierCurveTo(-11, -18, 12, -19, 11.4, -3.6); hm.lineTo(-10.4, -2); hm.closePath();
      ctx.fillStyle = lgrad(-10, -18, 10, 0, [[0, '#fff4b0'], [0.4, sp.helm], [1, sh(sp.helm, -45)]]); ctx.fill(hm); ctx.fillStyle = sh(sp.helm, -30); ctx.fillRect(-10.6, -4, 22.2, 2.6); ctx.fillStyle = '#fff0b0'; for (const x of [-7, -1, 5]) { ctx.beginPath(); ctx.arc(x, -2.7, 0.7, 0, 6.283); ctx.fill(); }
      for (const [x0, cx1, cy1, x2, y2] of [[-4, -16, -20, -13, -33], [4, 12, -24, 18, -29]]) { ctx.fillStyle = lgrad(x0, -14, x2, y2, [[0, '#d8ccb0'], [1, '#f8f0dc']]); ctx.beginPath(); ctx.moveTo(x0 - 2.6, -13); ctx.quadraticCurveTo(cx1, cy1, x2, y2); ctx.quadraticCurveTo(cx1 + 4, cy1 + 6, x0 + 2.6, -12); ctx.fill(); } }
    if (sp.hood) { const hd = new Path2D(); hd.moveTo(-13, 9); hd.bezierCurveTo(-18, -10, -8, -18, 3, -17.4); hd.bezierCurveTo(12, -17, 14, -10, 13.4, -5); hd.bezierCurveTo(10, -10, 4, -11, 0, -10); hd.bezierCurveTo(-5, -8, -6, -2, -5, 5); hd.closePath();
      ctx.fillStyle = lgrad(-16, 0, 14, 0, [[0, sh(sp.hood, -30)], [1, sh(sp.hood, 16)]]); ctx.fill(hd); ctx.strokeStyle = sp.trim || 'rgba(0,0,0,.3)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(13.4, -5); ctx.bezierCurveTo(10, -10, 4, -11, 0, -10); ctx.stroke(); }
  }
  function skull(a) {
    const bone = '#e2d6b8', g = a.glowCol || '#9fd8ff';
    const cr = new Path2D(); cr.moveTo(-8.4, 0.4); cr.bezierCurveTo(-10.4, -13, 2, -15.4, 7, -12); cr.bezierCurveTo(10, -9.6, 11, -6, 10.6, -2.6); cr.lineTo(11.6, 1); cr.lineTo(9.6, 2); cr.lineTo(10, 5); cr.lineTo(3.4, 5.8); cr.bezierCurveTo(-2, 6, -6.6, 4, -8.4, 0.4); cr.closePath();
    ctx.fillStyle = lgrad(-9, 0, 11, 0, [[0, '#8a7a5a'], [0.6, bone], [1, '#f4ecd8']]); ctx.fill(cr);
    ctx.strokeStyle = 'rgba(90,70,40,.5)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(-3, -12); ctx.lineTo(-1.6, -8); ctx.lineTo(-3, -5); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-4, 3); ctx.quadraticCurveTo(-1, 1, 2, 3.4); ctx.stroke();
    const jaw = new Path2D(); jaw.moveTo(-1, 4); jaw.lineTo(9.2, 5.6); jaw.lineTo(8.6, 9.8); jaw.quadraticCurveTo(3, 11.2, -0.4, 8.4); jaw.closePath(); ctx.fillStyle = lgrad(0, 0, 9, 0, [[0, '#9a8a6a'], [1, bone]]); ctx.save(); ctx.translate(0, a.jaw || 0); ctx.fill(jaw);
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 0.45; for (let x = 4; x < 9.4; x += 1.1) { ctx.beginPath(); ctx.moveTo(x, 5.6); ctx.lineTo(x + 0.1, 7.2); ctx.stroke(); } ctx.restore();
    for (let x = 4; x < 9.6; x += 1.1) { ctx.beginPath(); ctx.moveTo(x, 3.8); ctx.lineTo(x + 0.1, 5.4); ctx.stroke(); }
    ctx.fillStyle = '#0a0604'; ctx.beginPath(); ctx.ellipse(5.4, -3.2, 2.8, 2.5, 0.2, 0, 6.283); ctx.fill(); ctx.beginPath(); ctx.moveTo(9.4, -0.8); ctx.lineTo(10.8, 1.4); ctx.lineTo(9, 1.8); ctx.fill();
    if (a.glow > 0) { const gg = ctx.createRadialGradient(5.6, -3.2, 0, 5.6, -3.2, 10 * a.glow); gg.addColorStop(0, al(g, 0.95)); gg.addColorStop(0.3, al(g, 0.5)); gg.addColorStop(1, al(g, 0)); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(5.6, -3.2, 10 * a.glow, 0, 6.283); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(5.9, -3.2, 0.8 * a.glow, 0, 6.283); ctx.fill(); }
    if (a.sp.crown) { const cw = new Path2D(); cw.moveTo(-8.6, -9.4); cw.lineTo(-9.4, -19); cw.lineTo(-5.4, -14); cw.lineTo(-2.4, -21.6); cw.lineTo(1, -14.6); cw.lineTo(4.2, -21.6); cw.lineTo(6.8, -14); cw.lineTo(10.4, -18.6); cw.lineTo(10, -8.6); cw.quadraticCurveTo(0.6, -12, -8.6, -9.4); cw.closePath();
      ctx.fillStyle = lgrad(-8, -20, 9, -9, [[0, '#fff4c0'], [0.5, '#e0b040'], [1, '#8a6010']]); ctx.fill(cw); ctx.strokeStyle = '#6a4808'; ctx.lineWidth = 0.4; ctx.stroke(cw);
      ctx.fillStyle = '#c02040'; ctx.beginPath(); ctx.arc(1, -11.6, 1.3, 0, 6.283); ctx.fill(); ctx.fillStyle = '#2a60d0'; ctx.beginPath(); ctx.arc(-4.6, -11, 0.9, 0, 6.283); ctx.fill(); ctx.fillStyle = 'rgba(255,255,230,.8)'; ctx.beginPath(); ctx.arc(-2.4, -20.4, 0.7, 0, 6.283); ctx.fill(); }
  }

  /* ---------------- painting a frame ---------------- */
  function frame(t) {
    if (!running) return;
    const dt = Math.min(50, t - last) * (now < hurryT ? 4 : 1); last = t; now += view.skip ? 2000 : dt;
    for (const a of actors) if (a.moving) a.walk += dt * 0.0105 * (a.stride || 1);
    fx = fx.filter(f => !f.step()); waiters = waiters.filter(w => { if (now >= w.at) { w.r(); return false; } return true; });
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(0, OY); ctx.beginPath(); ctx.rect(0, 0, W, SH); ctx.clip();
    ctx.save();
    const sx = shakeT > now ? (rr() - 0.5) * shakeA : 0, sy = shakeT > now ? (rr() - 0.5) * shakeA : 0;
    ctx.translate(W / 2 + sx, SH / 2 + sy); ctx.scale(cam.z, cam.z); ctx.translate(-W / 2 - cam.x, -SH / 2 - cam.y);
    if (scene) scene.back(ctx, cam);
    for (const a of actors.slice().sort((p, q) => (p.depth || 0) - (q.depth || 0))) if (a.alpha > 0 && !a.hidden) drawFigure(a);
    if (scene && scene.front) scene.front(ctx, cam);
    ctx.restore();
    if (scene && scene.light) scene.light(ctx, cam);
    if (view.flare > 0) { const g = ctx.createRadialGradient(W / 2, SH / 2, 0, W / 2, SH / 2, 620); g.addColorStop(0, 'rgba(255,246,214,' + view.flare + ')'); g.addColorStop(0.45, 'rgba(255,196,110,' + view.flare + ')'); g.addColorStop(1, 'rgba(210,90,40,' + view.flare + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, SH); }
    const lb = (OY ? 0 : 56) * view.letter; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, lb); ctx.fillRect(0, SH - lb, W, lb);
    if (view.fade < 1) { ctx.fillStyle = 'rgba(0,0,0,' + (1 - view.fade) + ')'; ctx.fillRect(0, 0, W, SH); }
    ctx.restore();
    if (view.caption && view.capA > 0) { ctx.globalAlpha = view.capA; ctx.font = 'italic 21px Georgia, serif'; ctx.fillStyle = '#e8dcc4'; ctx.textAlign = 'center'; wrap(view.caption, W / 2, OY ? Math.max(30, OY / 2 + 6) : 34, 860, 26); ctx.globalAlpha = 1; }
    if (view.card && view.cardA > 0) { ctx.globalAlpha = view.cardA; ctx.textAlign = 'center'; ctx.fillStyle = '#e8c14a'; ctx.font = '600 44px Georgia, serif'; ctx.fillText(view.card[0], W / 2, H / 2 - 8); if (view.card[1]) { ctx.fillStyle = '#e8dcc4'; ctx.font = 'italic 24px Georgia, serif'; ctx.fillText(view.card[1], W / 2, H / 2 + 34); } ctx.globalAlpha = 1; }
    ctx.textAlign = 'center'; ctx.font = '23px Georgia, serif'; for (const l of view.lines) if (l.a > 0) { ctx.globalAlpha = l.a; ctx.fillStyle = '#efe4cc'; ctx.shadowColor = '#000'; ctx.shadowBlur = 8; wrap(l.t, W / 2, OY + l.y, 760, 30); ctx.shadowBlur = 0; } ctx.globalAlpha = 1;
    if (view.dlg) dialogue(view.dlg);
    if (view.note) { ctx.font = '15px Georgia, serif'; ctx.fillStyle = 'rgba(232,220,196,.7)'; ctx.textAlign = 'right'; ctx.fillText(view.note, W - 16, H - 12); }
    requestAnimationFrame(frame);
  }
  function wrap(text, x, y, mw, lh) { const words = text.split(' '); let line = '', yy = y; for (const w of words) { const t2 = line ? line + ' ' + w : w; if (ctx.measureText(t2).width > mw && line) { ctx.fillText(line, x, yy); line = w; yy += lh; } else line = t2; } ctx.fillText(line, x, yy); }
  function dialogue(d) {
    const bx = 60, bh = 140, by = H - bh - (OY ? 14 : 28), bw = W - 120, col = OP.speakers[d.who] || '#9cc4ff';
    ctx.fillStyle = 'rgba(22,24,58,.95)'; rrect(bx, by, bw, bh, 10); ctx.fill(); ctx.strokeStyle = '#d8dcf0'; ctx.lineWidth = 3; ctx.stroke();
    const im = imgOf(OP.portrait(d.who, d.mood));
    if (im && im.complete && im.naturalWidth) { ctx.save(); rrect(bx + 14, by + 14, 112, 112, 8); ctx.clip(); ctx.drawImage(im, bx + 14, by + 14, 112, 112); ctx.restore(); ctx.strokeStyle = col; ctx.lineWidth = 3; rrect(bx + 14, by + 14, 112, 112, 8); ctx.stroke(); }
    ctx.font = '600 20px ui-monospace, Menlo, Consolas, monospace'; const nw = ctx.measureText(d.who).width + 26; ctx.fillStyle = 'rgba(22,24,58,1)'; rrect(bx + 150, by - 20, nw, 32, 6); ctx.fill(); ctx.strokeStyle = '#d8dcf0'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(d.who, bx + 163, by + 3);
    ctx.font = '20px ui-monospace, Menlo, Consolas, monospace'; ctx.fillStyle = '#f0f0f8'; const shown = d.text.slice(0, Math.floor(d.n)); d.n = Math.min(d.text.length, d.n + 1.4);
    const words = shown.split(' '); let line = '', yy = by + 42; for (const w of words) { const t2 = line ? line + ' ' + w : w; if (ctx.measureText(t2).width > bw - 180 && line) { ctx.fillText(line, bx + 145, yy); line = w; yy += 28; } else line = t2; } ctx.fillText(line, bx + 145, yy);
    if (d.n >= d.text.length && (now / 400 | 0) % 2) { ctx.fillStyle = '#e8c14a'; ctx.font = '16px sans-serif'; ctx.fillText('▼', bx + bw - 30, by + bh - 14); }
  }
  function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  /* ---------------- timeline helpers ---------------- */
  OP.say = (who, text, mood) => new Promise(r => { view.dlg = { who, text, mood, n: 0 }; const done = () => { view.dlg = null; r(); };
    if (OP.onLine) OP.onLine(who, text);
    if (view.skip || window.AUTO) { waiters.push({ at: now + (view.skip ? 0 : window.AUTO), r: done }); return; }
    const self = () => { if (view.dlg && view.dlg.n < text.length) { view.dlg.n = text.length; advance = self; return; } done(); }; advance = self; });
  OP.caption = async (t, ms) => { view.caption = t; await tween(view, { capA: 1 }, 700); await sleep(ms || 2600); await tween(view, { capA: 0 }, 600); view.caption = null; };
  OP.card = async (a, b, ms) => { view.card = [a, b]; await tween(view, { cardA: 1 }, 900); await sleep(ms || 2200); await tween(view, { cardA: 0 }, 800); view.card = null; };
  OP.fade = (to, ms) => tween(view, { fade: to }, ms || 700);
  OP.shake = (ms, amp) => { shakeT = now + (view.skip ? 0 : ms); shakeA = amp || 8; };
  OP.cam = (x, y, z, ms, ez) => tween(cam, { x, y: y || 0, z: z || 1 }, ms || 1200, ez);
  OP.sfx = n => { if (!view.skip && OP.onSfx) OP.onSfx(n); };
  OP.sleep = sleep; OP.tween = tween; OP.actor = actor; OP.view = view; OP.cam0 = cam; OP.rr = rr; OP.al = al; OP.sh = sh;
  OP.setScene = s => { scene = s; actors = []; };
  OP.mount = (canvas, o) => { cv = canvas; ctx = cv.getContext('2d'); H = (o && o.h) || 540; OY = (H - SH) / 2; cv.width = W; cv.height = H;
    now = 0; fx = []; waiters = []; actors = []; scene = null; Object.assign(view, { fade: 1, letter: 1, caption: null, capA: 0, card: null, cardA: 0, dlg: null, skip: false, lines: [], note: null, flare: 0 }); Object.assign(cam, { x: 0, y: 0, z: 1 });
    running = true; requestAnimationFrame(t => { last = t; requestAnimationFrame(frame); }); };
  OP.unmount = () => { running = false; advance = null; };
})();

/* The three scenes of the opening, and the timeline that plays them. */
(function () {
  const W = 960, H = 540, FLOOR = 362;
  const { al, sh, rr } = OP;
  const S = OP.state = {};                         // per-scene state the painters read (OP.state for tests)
  const par = (c, cam, f) => c.translate(cam.x * (1 - f), cam.y * (1 - f));   // a layer that moves at f of the camera's speed

  function darkness(c, amount, lights, cam, tint) {
    const d = S.dk || (S.dk = document.createElement('canvas')); d.width = W; d.height = H; const x = d.getContext('2d');
    x.fillStyle = 'rgba(' + (tint || '6,5,14') + ',' + amount + ')'; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'destination-out';
    for (const L of lights) { if (!L.i) continue; const sx = (L.x - cam.x - W / 2) * cam.z + W / 2, sy = (L.y - cam.y - H / 2) * cam.z + H / 2, r = L.r * cam.z * (1 + (L.fl ? Math.sin(performance.now() / 90 + L.x) * 0.03 + Math.sin(performance.now() / 37) * 0.02 : 0));
      const g = x.createRadialGradient(sx, sy, 0, sx, sy, r); g.addColorStop(0, 'rgba(0,0,0,' + L.i + ')'); g.addColorStop(0.5, 'rgba(0,0,0,' + L.i * 0.6 + ')'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
    c.drawImage(d, 0, 0);
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const L of lights) { if (!L.i || !L.col) continue; const sx = (L.x - cam.x - W / 2) * cam.z + W / 2, sy = (L.y - cam.y - H / 2) * cam.z + H / 2, r = L.r * 0.7 * cam.z; const g = c.createRadialGradient(sx, sy, 0, sx, sy, r); g.addColorStop(0, al(L.col, 0.22 * L.i)); g.addColorStop(1, al(L.col, 0)); c.fillStyle = g; c.fillRect(0, 0, W, H); }
    c.restore();
  }
  function stones(c, x0, y0, w, h, col, seed) { let s = seed; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    c.fillStyle = col; c.fillRect(x0, y0, w, h);
    for (let y = y0; y < y0 + h; y += 26) for (let x = x0 - ((y / 26) % 2) * 22; x < x0 + w; x += 44 + r() * 10) { c.fillStyle = sh(col, (r() - 0.5) * 30); c.fillRect(x + 1.5, y + 1.5, 41, 23); c.fillStyle = 'rgba(255,255,255,.04)'; c.fillRect(x + 1.5, y + 1.5, 41, 3); } }

  /* ================= A: the history of Mornvale ================= */
  const MOUNDS = [[260, 300], [520, 318], [860, 296], [1180, 322], [1460, 304]];
  S.a = { sky: 0, crown: 0, king: 1, shards: [], lamps: [0, 0, 0, 0, 0], dead: -1, years: 0 };
  const sceneA = {
    back(c, cam) { const A = S.a;
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
      const g = c.createLinearGradient(0, 0, 0, H); const top = A.sky < 0.5 ? ['#3a0a14', '#a8301e'] : ['#060818', '#1c2448'];
      g.addColorStop(0, A.sky < 1 ? mix('#3a0a14', '#060818', A.sky) : '#060818'); g.addColorStop(0.7, mix('#c0502a', '#24305a', A.sky)); g.addColorStop(1, mix('#e08a3a', '#2a3258', A.sky)); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.globalAlpha = A.sky; let s = 5; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
      for (let i = 0; i < 160; i++) { const a0 = r() * 6.283 + A.years * 0.6, rad = 200 + r() * 700, x = W / 2 + Math.cos(a0) * rad, y = 420 + Math.sin(a0) * rad * 0.8; if (y < 340) { c.fillStyle = 'rgba(230,235,255,' + (0.3 + r() * 0.7) + ')'; c.fillRect(x, y, 1.6, 1.6); } }
      const ma = A.years * 2.2 + 0.6; c.fillStyle = '#f4f0e0'; c.beginPath(); c.arc(W / 2 + Math.cos(ma + 3.6) * 380, 300 + Math.sin(ma + 3.6) * 220, 18, 0, 6.283); c.fill(); c.globalAlpha = 1; c.restore();
      // far mountains, the hills with their barrows, and the near ground
      c.save(); par(c, cam, 0.25); c.fillStyle = mix('#5a1a1a', '#141a34', A.sky); c.beginPath(); c.moveTo(-400, 330); for (let x = -400; x < 2400; x += 80) c.lineTo(x, 250 + Math.sin(x * 0.013) * 40 + Math.sin(x * 0.041) * 18); c.lineTo(2400, H); c.lineTo(-400, H); c.fill(); c.restore();
      c.save(); par(c, cam, 0.6); c.fillStyle = mix('#3a1212', '#0e1428', A.sky); c.beginPath(); c.moveTo(-400, 340); for (let x = -400; x < 2400; x += 40) c.lineTo(x, 318 + Math.sin(x * 0.006) * 22 + Math.sin(x * 0.02) * 6); c.lineTo(2400, H); c.lineTo(-400, H); c.fill();
      MOUNDS.forEach(([mx, my], i) => { c.fillStyle = mix('#2a0c0c', '#0a1020', A.sky); c.beginPath(); c.ellipse(mx, my + 14, 46, 22, 0, Math.PI, 0); c.fill(); c.fillStyle = '#1a1410'; c.fillRect(mx - 1.5, my - 22, 3, 14);
        const lit = A.lamps[i] * (A.dead === i ? A.deadF : 1); if (lit > 0) { const gg = c.createRadialGradient(mx, my - 24, 0, mx, my - 24, 40 * lit); gg.addColorStop(0, 'rgba(255,230,150,' + 0.9 * lit + ')'); gg.addColorStop(0.2, 'rgba(255,190,90,' + 0.4 * lit + ')'); gg.addColorStop(1, 'rgba(255,160,60,0)'); c.fillStyle = gg; c.beginPath(); c.arc(mx, my - 24, 40 * lit, 0, 6.283); c.fill(); c.fillStyle = '#fff4c8'; c.beginPath(); c.arc(mx, my - 24, 2.6 * lit, 0, 6.283); c.fill(); } });
      c.restore();
      c.fillStyle = mix('#1a0606', '#05070e', A.sky); c.beginPath(); c.moveTo(-600, FLOOR + 10); for (let x = -600; x < 2600; x += 30) c.lineTo(x, FLOOR + 6 + Math.sin(x * 0.05) * 3); c.lineTo(2600, H); c.lineTo(-600, H); c.fill();
      for (let x = -600; x < 2600; x += 9) { c.strokeStyle = mix('#1a0606', '#05070e', A.sky); c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, FLOOR + 10); c.lineTo(x + Math.sin(x + performance.now() / 700) * 3, FLOOR - 4 - (x * 7919 % 9)); c.stroke(); }
      // the King, huge against the burning sky
      if (A.king > 0) { c.save(); c.globalAlpha = A.king; c.translate(cam.x * 0.9, 0); const K = '#0c0406', rim = 'rgba(255,110,60,.55)';
        const thr = new Path2D(); thr.moveTo(520, FLOOR + 10); thr.lineTo(520, 150); thr.lineTo(540, 96); thr.lineTo(560, 150); thr.lineTo(585, 70); thr.lineTo(610, 40); thr.lineTo(635, 70); thr.lineTo(660, 150); thr.lineTo(680, 96); thr.lineTo(700, 150); thr.lineTo(700, FLOOR + 10); thr.closePath();
        c.fillStyle = K; c.fill(thr); c.strokeStyle = 'rgba(255,90,40,.25)'; c.lineWidth = 2; c.stroke(thr);
        const body = new Path2D(); body.moveTo(610, 112); body.bezierCurveTo(628, 112, 634, 134, 628, 150); body.bezierCurveTo(660, 156, 676, 172, 680, 200); body.lineTo(690, 250); body.lineTo(668, 256); body.lineTo(672, 300); body.lineTo(690, FLOOR); body.lineTo(530, FLOOR); body.lineTo(548, 300); body.lineTo(552, 256); body.lineTo(530, 250); body.lineTo(540, 200); body.bezierCurveTo(544, 172, 560, 156, 592, 150); body.bezierCurveTo(586, 134, 592, 112, 610, 112); body.closePath();
        c.fillStyle = '#16080a'; c.fill(body); c.strokeStyle = rim; c.lineWidth = 2.5; c.stroke(body);
        c.fillStyle = '#20100e'; c.fillRect(606, 240, 8, 110); c.fillRect(590, 238, 40, 7); c.beginPath(); c.moveTo(606, 350); c.lineTo(610, 362); c.lineTo(614, 350); c.fill();
        c.fillStyle = 'rgba(255,90,40,' + (0.6 + Math.sin(performance.now() / 300) * 0.25) * A.king + ')'; for (const ex of [602, 618]) { c.beginPath(); c.arc(ex, 130, 2.6, 0, 6.283); c.fill(); }
        if (A.crown > 0) { const cg = c.createRadialGradient(610, 138, 0, 610, 138, 60); cg.addColorStop(0, 'rgba(255,230,140,' + 0.8 * A.crown + ')'); cg.addColorStop(1, 'rgba(255,200,80,0)'); c.fillStyle = cg; c.beginPath(); c.arc(610, 138, 60, 0, 6.283); c.fill();
          c.fillStyle = '#f0c850'; c.beginPath(); c.moveTo(588, 146); c.lineTo(586, 126); c.lineTo(596, 136); c.lineTo(603, 120); c.lineTo(610, 134); c.lineTo(618, 120); c.lineTo(624, 136); c.lineTo(634, 126); c.lineTo(632, 146); c.closePath(); c.fill(); }
        c.restore(); }
      for (const sd of A.shards) { if (sd.t <= 0 || sd.t >= 1) continue; const x = lerp(sd.x0, sd.x1, sd.t), y = lerp(sd.y0, sd.y1, sd.t) - Math.sin(sd.t * Math.PI) * 160;
        const gg = c.createRadialGradient(x, y, 0, x, y, 22); gg.addColorStop(0, 'rgba(255,240,170,.95)'); gg.addColorStop(1, 'rgba(255,200,80,0)'); c.fillStyle = gg; c.beginPath(); c.arc(x, y, 22, 0, 6.283); c.fill();
        c.strokeStyle = 'rgba(255,220,140,.4)'; c.lineWidth = 3; c.beginPath(); for (let k = 0; k <= 10; k++) { const tt = Math.max(0, sd.t - k * 0.02); const xx = lerp(sd.x0, sd.x1, tt), yy = lerp(sd.y0, sd.y1, tt) - Math.sin(tt * Math.PI) * 160; k ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); }
    }
  };
  function mix(a, b, t) { t = Math.max(0, Math.min(1, t)); const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), f = (x, y) => Math.round(x + (y - x) * t); return 'rgb(' + f(A >> 16, B >> 16) + ',' + f((A >> 8) & 255, (B >> 8) & 255) + ',' + f(A & 255, B & 255) + ')'; }
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ================= B: the Hollow Barrow ================= */
  S.b = { eyes: 0 };
  const sceneB = {
    back(c, cam) {
      c.save(); par(c, cam, 0.5); stones(c, -400, 40, 2600, FLOOR, '#2a2436', 7);
      for (let x = -200; x < 2200; x += 260) { c.fillStyle = '#140f1c'; c.beginPath(); c.moveTo(x, FLOOR); c.lineTo(x, 170); c.arc(x + 70, 170, 70, Math.PI, 0); c.lineTo(x + 140, FLOOR); c.fill(); c.fillStyle = 'rgba(150,110,200,.06)'; c.fillRect(x + 8, 180, 10, FLOOR - 180); }
      c.restore();
      c.fillStyle = '#1c1726'; c.fillRect(-600, FLOOR, 3000, H); c.fillStyle = 'rgba(160,140,200,.08)'; c.fillRect(-600, FLOOR, 3000, 3);
      // the dais and the throne
      c.fillStyle = '#2e2838'; c.fillRect(1120, FLOOR - 18, 300, 18); c.fillStyle = '#3a3346'; c.fillRect(1140, FLOOR - 30, 260, 12);
      for (const [x, s] of [[300, 1], [720, 1], [1500, 1]]) { c.fillStyle = '#100c16'; c.fillRect(x - 6, FLOOR - 80, 12, 80); c.fillStyle = 'rgba(160,110,230,.8)'; c.beginPath(); c.ellipse(x, FLOOR - 88, 6, 10 + Math.sin(performance.now() / 120 + x) * 2, 0, 0, 6.283); c.fill(); }
      // dust motes
      for (let i = 0; i < 50; i++) { const x = (i * 197 + performance.now() * 0.01 * (1 + i % 3)) % 1800 - 100, y = 80 + (i * 61) % 260 + Math.sin(performance.now() / 1000 + i) * 8; c.fillStyle = 'rgba(200,180,240,.25)'; c.fillRect(x, y, 1.5, 1.5); }
    },
    front(c, cam) { c.save(); par(c, cam, 1.5); for (const x of [-100, 520, 1150, 1780]) { c.fillStyle = '#07050b'; c.fillRect(x, 0, 90, H); c.fillRect(x - 14, FLOOR + 20, 118, 200); } c.restore(); },
    light(c, cam) { darkness(c, 0.72, [{ x: 300, y: FLOOR - 90, r: 200, i: 0.6, col: '#a070e0', fl: 1 }, { x: 720, y: FLOOR - 90, r: 200, i: 0.6, col: '#a070e0', fl: 1 }, { x: 1500, y: FLOOR - 90, r: 200, i: 0.6, col: '#a070e0', fl: 1 }, { x: 1255, y: FLOOR - 230, r: 300 * S.b.eyes + 1, i: 0.75 * S.b.eyes, col: '#9fd8ff' }], cam, '8,4,16'); }
  };

  /* ================= C: the Thane's Barrow ================= */
  S.c = { flame: 1, dust: [], bones: 0 };
  const LAMP = [880, FLOOR - 118];
  const sceneC = {
    back(c, cam) {
      c.save(); par(c, cam, 0.7);
      c.fillStyle = '#2a1e16'; c.fillRect(-300, 0, 2200, FLOOR + 40); stones(c, 140, 60, 1500, FLOOR - 60, '#3a2e24', 3);
      // burial niches, with their dead
      for (const [x, y] of [[330, 150], [560, 160], [1120, 150], [1340, 160]]) { c.fillStyle = '#120c08'; c.beginPath(); c.moveTo(x, y + 70); c.lineTo(x, y + 20); c.arc(x + 60, y + 20, 60, Math.PI, 0); c.lineTo(x + 120, y + 70); c.fill();
        c.fillStyle = '#c8bca0'; c.beginPath(); c.ellipse(x + 30, y + 60, 9, 7, 0, 0, 6.283); c.fill(); c.fillRect(x + 38, y + 58, 70, 5); for (let k = 0; k < 4; k++) c.fillRect(x + 46 + k * 12, y + 52, 3, 14);
        if (S.c.bones > 0) { c.fillStyle = 'rgba(160,220,255,' + S.c.bones * (0.5 + Math.sin(performance.now() / 200 + x) * 0.3) + ')'; c.beginPath(); c.arc(x + 33, y + 58, 2.2, 0, 6.283); c.fill(); } }
      // roots hanging from the roof
      c.strokeStyle = '#1e140c'; c.lineWidth = 3; for (let x = 160; x < 1700; x += 70) { c.beginPath(); c.moveTo(x, 50); c.quadraticCurveTo(x + 10, 80 + (x % 50), x - 4, 100 + (x % 90)); c.stroke(); }
      c.fillStyle = '#140e0a'; c.fillRect(-300, 0, 2200, 64);
      c.restore();
      // the stair down from the hill, with moonlight in it
      c.fillStyle = '#0c0a10'; c.fillRect(-300, 0, 330, FLOOR); for (let i = 0; i < 7; i++) { c.fillStyle = '#2a2420'; c.fillRect(-300 + i * 44, FLOOR - 40 - i * 34, 340 - i * 44, 10); }
      const mg = c.createLinearGradient(-200, 0, 120, FLOOR); mg.addColorStop(0, 'rgba(140,170,230,.35)'); mg.addColorStop(1, 'rgba(140,170,230,0)'); c.fillStyle = mg; c.beginPath(); c.moveTo(-220, 0); c.lineTo(-60, 0); c.lineTo(200, FLOOR); c.lineTo(20, FLOOR); c.fill();
      // the floor, the grave-goods, the shrine and its lamp
      c.fillStyle = '#231a12'; c.fillRect(-300, FLOOR, 2400, H); c.fillStyle = 'rgba(255,220,180,.06)'; c.fillRect(-300, FLOOR, 2400, 2);
      c.fillStyle = '#5a4430'; c.beginPath(); c.ellipse(230, FLOOR - 14, 22, 18, 0, 0, 6.283); c.fill(); c.fillStyle = '#d8b050'; c.fillRect(244, FLOOR - 26, 8, 5);
      c.fillStyle = '#4a4038'; c.fillRect(LAMP[0] - 46, FLOOR - 70, 92, 70); c.fillStyle = '#5a5046'; c.fillRect(LAMP[0] - 54, FLOOR - 78, 108, 10); c.fillStyle = '#3a322c'; for (let k = 0; k < 3; k++) c.fillRect(LAMP[0] - 40 + k * 30, FLOOR - 62, 20, 50);
      c.fillStyle = '#2e2418'; c.fillRect(LAMP[0] - 8, FLOOR - 98, 16, 20); c.fillRect(LAMP[0] - 12, FLOOR - 102, 24, 5); c.fillStyle = '#c8a050'; c.fillRect(LAMP[0] - 10, FLOOR - 103, 20, 2);
      const f = S.c.flame; if (f > 0.02) { const fl = 1 + Math.sin(performance.now() / 70) * 0.08 + Math.sin(performance.now() / 23) * 0.05; c.fillStyle = 'rgba(255,200,90,' + f + ')'; c.beginPath(); c.moveTo(LAMP[0] - 6 * f, FLOOR - 104); c.quadraticCurveTo(LAMP[0] - 7 * f, FLOOR - 112 - 8 * f * fl, LAMP[0], FLOOR - 104 - 22 * f * fl); c.quadraticCurveTo(LAMP[0] + 7 * f, FLOOR - 112 - 8 * f * fl, LAMP[0] + 6 * f, FLOOR - 104); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,250,220,' + f + ')'; c.beginPath(); c.ellipse(LAMP[0], FLOOR - 110, 2.6 * f, 5 * f * fl, 0, 0, 6.283); c.fill(); }
      else if (S.c.smoke) for (let i = 0; i < 6; i++) { const t = ((performance.now() / 1400 + i / 6) % 1); c.fillStyle = 'rgba(160,150,140,' + 0.3 * (1 - t) * S.c.smoke + ')'; c.beginPath(); c.arc(LAMP[0] + Math.sin(t * 9 + i) * 6, FLOOR - 106 - t * 60, 3 + t * 8, 0, 6.283); c.fill(); }
    },
    front(c, cam) { for (const d of S.c.dust) { d.y += d.v; d.v += 0.03; if (d.y < FLOOR) { c.fillStyle = 'rgba(180,160,130,.6)'; c.fillRect(d.x, d.y, 2, 2); } } },
    light(c, cam) { const f = S.c.flame, ex = []; if (S.c.skrit && S.c.skrit.alpha > 0) ex.push({ x: S.c.skrit.x + 24 * S.c.skrit.face * S.c.skrit.s, y: FLOOR - 118 * S.c.skrit.s, r: 170, i: 0.7 * S.c.skrit.alpha, col: '#ff4a5a', fl: 1 }); if (S.c.vey && !S.c.vey.hidden) ex.push({ x: S.c.vey.x + 20 * S.c.vey.face * S.c.vey.s, y: FLOOR - 60 * S.c.vey.s, r: 230, i: 0.7, col: '#c8d8ff' }); if (S.c.grukk) ex.push({ x: S.c.grukk.x, y: FLOOR - 130 * S.c.grukk.s, r: 90, i: 0.35, col: '#ffe14a' });
      darkness(c, 0.5 + (1 - f) * 0.26, [{ x: LAMP[0], y: LAMP[1] - 10, r: 560 * Math.max(f, 0.01), i: f, col: '#ffb860', fl: 1 }, { x: 40, y: 200, r: 380, i: 0.7, col: '#8aa8e8' }, { x: 220, y: FLOOR, r: 220, i: 0.4 }, ...ex], cam, '4,4,12'); }
  };

  /* ================= T: the table, where the Dungeon Master tells it ================= */
  // Seen from the foot of the table: the DM behind his screen, a candle, the board with four little figures, and the
  // four players, still, half in the dark. They do nothing much: the game is where they talk.
  const TB = { dmx: 480, dmy: 258, dms: 4.2, cx: 622, cy: 352, mini: [470, 428] };
  S.t = { lit: 0, eyes: 0, grin: 0, wide: 1, match: null, low: 0 };
  function tableTop(c) {
    const far = 318, l0 = 150, r0 = 810, near = 560, l1 = -80, r1 = 1040, P = (u, v) => [lerp(lerp(l0, l1, v), lerp(r0, r1, v), u), lerp(far, near, v)];
    c.fillStyle = '#3e2716'; c.beginPath(); c.moveTo(l0, far); c.lineTo(r0, far); c.lineTo(r1, near); c.lineTo(l1, near); c.closePath(); c.fill();
    c.fillStyle = '#5a3a20'; c.fillRect(l0, far - 3, r0 - l0, 4);
    c.strokeStyle = 'rgba(20,10,4,.5)'; c.lineWidth = 1.2; for (let u = 0.08; u < 1; u += 0.12) { const a = P(u, 0), b = P(u, 1); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    // the board, a little to the left of the candle
    const B0 = [[300, 352], [640, 352], [700, 470], [240, 470]], q = (u, v) => [lerp(lerp(B0[0][0], B0[3][0], v), lerp(B0[1][0], B0[2][0], v), u), lerp(352, 470, v)];
    c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); B0.forEach(([x, y], i) => i ? c.lineTo(x + 4, y + 5) : c.moveTo(x + 4, y + 5)); c.fill();
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const a = q(i / 8, j / 8), b = q((i + 1) / 8, j / 8), d = q((i + 1) / 8, (j + 1) / 8), e = q(i / 8, (j + 1) / 8);
      c.fillStyle = (i + j) % 2 ? '#3f6a34' : '#4c7a3e'; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(e[0], e[1]); c.closePath(); c.fill(); }
    c.strokeStyle = '#2a1a0c'; c.lineWidth = 2; c.beginPath(); B0.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.stroke();
    // a little tavern on the board, and four figures in the heroes' colours waiting by its door
    const [mx, my] = TB.mini; c.fillStyle = '#6a4a2a'; c.fillRect(mx - 52, my - 34, 34, 22); c.fillStyle = '#9a3a2a'; c.beginPath(); c.moveTo(mx - 56, my - 33); c.lineTo(mx - 35, my - 48); c.lineTo(mx - 14, my - 33); c.fill();
    c.fillStyle = '#ffcf7a'; c.fillRect(mx - 31, my - 26, 6, 5);
    B.table.PLAYERS.forEach((p, i) => { const x = mx - 6 + i * 13, y = my - 4 + (i % 2) * 6; c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(x, y + 1, 5.5, 2.2, 0, 0, 7); c.fill();
      c.fillStyle = '#2a2a2a'; c.beginPath(); c.ellipse(x, y, 5, 2, 0, 0, 7); c.fill(); c.fillStyle = p.col; c.fillRect(x - 3, y - 11, 6, 10); c.fillStyle = p.skin; c.beginPath(); c.arc(x, y - 13.5, 2.8, 0, 7); c.fill(); c.fillStyle = p.hair; c.fillRect(x - 2.8, y - 16.6, 5.6, 2); });
  }
  function candle(c) { const T = S.t, x = TB.cx, y = TB.cy, h = 38 - T.low * 16;
    c.fillStyle = '#6a5228'; c.beginPath(); c.ellipse(x, y, 20, 6, 0, 0, 7); c.fill(); c.fillStyle = '#8a6c34'; c.fillRect(x - 6, y - 6, 12, 6);
    c.fillStyle = '#e8dcc0'; c.fillRect(x - 7, y - 6 - h, 14, h); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x - 5, y - 6 - h, 3, h);
    c.fillStyle = '#d8ccb0'; c.beginPath(); c.moveTo(x + 7, y - 6 - h); c.quadraticCurveTo(x + 9, y - h + 4, x + 8, y - h + 10); c.lineTo(x + 6, y - 6 - h); c.fill();     // a drip
    c.strokeStyle = '#1a1008'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, y - 6 - h); c.lineTo(x + 0.5, y - 12 - h); c.stroke();
    if (T.lit > 0.02) { const f = T.lit * (1 + Math.sin(performance.now() / 70) * 0.07 + Math.sin(performance.now() / 23) * 0.04), fy = y - 12 - h;
      const g = c.createRadialGradient(x, fy - 6, 0, x, fy - 6, 46 * f); g.addColorStop(0, 'rgba(255,220,140,.5)'); g.addColorStop(1, 'rgba(255,160,60,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, fy - 6, 46 * f, 0, 7); c.fill();
      c.fillStyle = '#ffb04a'; c.beginPath(); c.moveTo(x - 5 * f, fy); c.quadraticCurveTo(x - 6 * f, fy - 10 * f, x + Math.sin(performance.now() / 160) * 1.5, fy - 22 * f); c.quadraticCurveTo(x + 6 * f, fy - 10 * f, x + 5 * f, fy); c.closePath(); c.fill();
      c.fillStyle = '#fff4c8'; c.beginPath(); c.ellipse(x, fy - 5 * f, 2.4 * f, 5 * f, 0, 0, 7); c.fill(); } }
  const sceneT = {
    back(c, cam) { const T = S.t, now = performance.now(), PL = B.table.PLAYERS;
      c.fillStyle = '#0b0806'; c.fillRect(-400, -200, W + 800, H + 400);
      c.fillStyle = '#140e0a'; for (let x = -40; x < W + 40; x += 150) c.fillRect(x, -200, 14, 560); c.fillStyle = '#100b08'; c.fillRect(-400, 40, W + 800, 8);
      B.table.paintDM(c, TB.dmx, TB.dmy, TB.dms, now, { eyes: T.eyes, grin: T.grin, wide: T.wide, hands: false });
      tableTop(c);
      B.table.screenAt(c, TB.dmx, 328, 3.4);
      candle(c);
      // the players: one at each side, two at the near end with their backs to us; just breathing
      // held back in the dark: the near two are little more than shapes against the candlelight
      const pp = (x, y, sc, k, front, br, turn) => { c.save(); c.filter = 'brightness(' + br + '%)'; B.table.paintPlayer(c, x, y, sc, PL[k], front, now, k, { still: true, dim: 1, turn }); c.restore(); };
      pp(112, 436, 4.4, 1, true, 62, 0.9); pp(848, 436, 4.4, 3, true, 62, -0.9);
      pp(232, 668, 9.4, 0, false, 34, 0.55); pp(728, 668, 9.4, 2, false, 30, -0.55);
    },
    front(c) { const m = S.t.match; if (!m) return;
      c.save(); c.globalAlpha = m.a; c.translate(m.x, m.y); c.scale(1.9, 1.9); c.rotate(-0.5); c.fillStyle = '#c8a878'; c.fillRect(-1.2, 0, 2.4, 26); c.fillStyle = '#3a1a10'; c.beginPath(); c.arc(0, 0, 2.4, 0, 7); c.fill();
      if (m.f > 0) { const f = m.f * (1 + Math.sin(performance.now() / 50) * 0.1); c.fillStyle = '#ffb04a'; c.beginPath(); c.moveTo(-4 * f, 0); c.quadraticCurveTo(-4 * f, -8 * f, 0, -15 * f); c.quadraticCurveTo(4 * f, -8 * f, 4 * f, 0); c.fill(); c.fillStyle = '#fff2c0'; c.beginPath(); c.ellipse(0, -3 * f, 1.8 * f, 3.6 * f, 0, 0, 7); c.fill(); }
      c.restore(); },
    light(c, cam) { const T = S.t, m = T.match, Ls = [{ x: TB.cx, y: TB.cy - 60, r: 760 * Math.max(T.lit, 0.01), i: T.lit, col: '#ffb860', fl: 1 }];
      if (m && m.f > 0) Ls.push({ x: m.x, y: m.y - 8, r: 300 * m.f, i: 0.8 * m.f * m.a, col: '#ffb860', fl: 1 });
      darkness(c, 0.5 + (1 - T.lit) * 0.5, Ls, cam, '6,4,4');
      // the eyes burn through the dark before anything else is lit
      if (T.eyes > 0 && T.lit < 1) { const k = T.eyes * (1 - T.lit * 0.9), blink = (performance.now() % 5200) < 140 ? 0.2 : 1;
        for (const ex of [-3.2, 3.2]) { const wx = TB.dmx + ex * TB.dms, wy = TB.dmy + (-33) * TB.dms, sx = (wx - cam.x - W / 2) * cam.z + W / 2, sy = (wy - cam.y - H / 2) * cam.z + H / 2;
          const g = c.createRadialGradient(sx, sy, 0, sx, sy, 22 * cam.z); g.addColorStop(0, 'rgba(255,224,110,' + 0.55 * k + ')'); g.addColorStop(1, 'rgba(255,200,80,0)'); c.fillStyle = g; c.fillRect(sx - 30 * cam.z, sy - 30 * cam.z, 60 * cam.z, 60 * cam.z);
          c.fillStyle = 'rgba(255,238,160,' + 0.95 * k + ')'; c.beginPath(); c.ellipse(sx, sy, 5.6 * cam.z, 3 * cam.z * blink, ex < 0 ? 0.25 : -0.25, 0, 7); c.fill(); } } }
  };

  /* ================= the cast ================= */
  const KING = { skin: '#e2d6b8', cloth: '#4a1a2a', robe: 1, cape: '#3a1222', crown: 1, trim: '#e8c14a' };
  const VEYRA = { skin: '#e8dcd0', cloth: '#7a7a86', robe: 1, hood: '#70707c', hair: '#a8a8b4', cape: '#5a5a66', held: 'lantern', rope: '#c8c0a8', eye: '#5a6a8a' };
  const HAND = { skin: '#d8ccbc', cloth: '#3a3848', robe: 1, hood: '#26242f', cape: '#1a1820', trim: '#8a86a0', eye: '#3a3a44' };
  const GRUKK = { skin: '#5a9a3a', cloth: '#7a2f2f', legs: '#3a2a22', helm: '#e8c14a', eyes: '#ffe14a', fur: '#6a4a2a', belt: '#3a2a1e', held: 'spade', big: 1 };
  const SKRIT = { skin: '#7ab85a', cloth: '#5a3a7a', robe: 1, hood: '#4a2f66', eyes: '#e02a3a', trim: '#e8c14a', held: 'staff', gem: '#d02a3a' };
  const WARDEN = { skin: '#d8b090', cloth: '#8a8a94', robe: 1, hood: '#6a6a78', held: 'lantern', rope: '#c8c0a8' };

  /* ================= the timeline ================= */
  async function play() {
    const { say, caption, card, fade, cam, sleep, tween, actor, walk, turn, pose, view } = OP;
    const DM = 'The Dungeon Master', line = t => say(DM, t);   // the narrator is the DM, as at the boss tables
    const clear = async () => { await Promise.all(view.lines.map(L => tween(L, { a: 0 }, 700))); view.lines = []; };
    const atTable = typeof B !== 'undefined' && !!(B.table && B.table.paintDM), T = S.t;
    // T: the table in the dark. His eyes first, then a match, then the candle
    if (atTable) {
      OP.setScene(sceneT); Object.assign(T, { lit: 0, eyes: 0, grin: 0, wide: 1, match: null, low: 0 }); Object.assign(OP.cam0, { x: 0, y: 0, z: 1 }); view.fade = 1;
      await sleep(900); await tween(T, { eyes: 1 }, 1400); await sleep(700);
      T.match = { x: 700, y: 250, a: 1, f: 0 }; OP.sfx('fire'); await tween(T.match, { f: 1.3 }, 120); await tween(T.match, { f: 1 }, 260);
      await tween(T.match, { x: TB.cx + 4, y: TB.cy - 64 }, 900); await sleep(250);
      await Promise.all([tween(T, { lit: 1 }, 1100), tween(T, { grin: 1 }, 1600)]);
      await Promise.all([tween(T.match, { f: 0, x: 690, y: 230, a: 0 }, 700)]); T.match = null;
      await say(DM, 'Settle in. This one starts a long way back.', 'happy');
      // into the flame
      await cam(TB.cx - W / 2, TB.cy - 62 - H / 2, 1.5, 1100);
      await Promise.all([cam(TB.cx - W / 2, TB.cy - 62 - H / 2, 14, 1700, t => t * t * t), sleep(900).then(() => tween(view, { flare: 1 }, 800))]);
    }
    // A: Mornvale, out of the flame and into the burning sky
    OP.setScene(sceneA); const A = S.a; Object.assign(OP.cam0, { x: 0, y: 0, z: 1 }); view.lines = [];
    if (atTable) { view.fade = 1; await tween(view, { flare: 0 }, 1800); } else { view.fade = 0; await fade(1, 1400); }
    await tween(A, { crown: 1 }, 900);
    await line('Three hundred years ago, the Barrow King bound his soul to his crown and would not die.');
    await clear();
    // the crown breaks: five shards fly out over the valley to five barrows
    OP.shake(600, 6); OP.sfx('crit'); A.crown = 0; await sleep(200);
    A.shards = MOUNDS.map(([mx, my]) => ({ x0: 610, y0: 138, x1: mx, y1: my - 24, t: 0 }));
    const flight = Promise.all([tween(A, { king: 0 }, 1800), cam(500, 0, 1, 3800), tween(A, { sky: 1 }, 3800), ...A.shards.map((s, i) => sleep(i * 220).then(() => tween(s, { t: 1 }, 1600)).then(() => tween(A.lamps, { [i]: 1 }, 400)))]);
    await line('Five heroes broke the crown in five, and buried each piece under a lamp that never goes out.');
    await flight; await sleep(800); await clear();
    // the years go by, and the Wardens walk their rounds
    const wd = actor({ sp: WARDEN, x: 100, y: FLOOR + 2, s: 1.15 }); walk(wd, 1300, 70);
    await Promise.all([tween(A, { years: 1.4 }, 6000, t => t), line('Wardens have kept those lamps burning ever since.', 110, 4200)]);
    await clear(); await sleep(400);
    // until now
    A.dead = 1; A.deadF = 1; await cam(MOUNDS[1][0] * 0.4 - 100, 0, 1, 1400);
    for (const v of [0.4, 1, 0.2, 0.8, 0.1, 0.5, 0]) await tween(A, { deadF: v }, 160 + OP.rr() * 160);
    await say(DM, 'Until now.', 'happy'); await clear(); await fade(0, 1200);

    // B: the Hollow Barrow
    OP.setScene(sceneB); S.b.eyes = 0; OP.cam0.x = -200;
    const king = actor({ sp: KING, x: 1270, y: FLOOR - 30, s: 2.2, face: -1, sit: 1, throne: 1, kind: 'skel', glow: 0, armF: 0.6, foreF: 1.2, armB: 0.5, foreB: 1.3, depth: 2 });
    await fade(1, 1200);
    await Promise.all([cam(770, 0, 1, 6500), sleep(900).then(() => say(DM, 'Far to the north, in the Hollow Barrow, the Barrow King still wears one fifth of his crown.'))]);
    await sleep(500); OP.sfx('magic'); await tween(king, { glow: 1 }, 1400); king.glowCol = '#9fd8ff'; await tween(S.b, { eyes: 1 }, 600); OP.shake(400, 3);
    await pose(king, { tilt: -0.12 }, 700);
    await say('The Barrow King', 'One of my lamps has gone cold. I can feel the air again.', 'happy');
    await Promise.all([pose(king, { armF: 1.5, foreF: 0.2 }, 800), cam(800, 0, 1.25, 900)]);
    await say('The Barrow King', 'Bring them to me. Bring me the rest of myself.');
    await fade(0, 900);

    // C: the Thane's Barrow
    OP.setScene(sceneC); S.c.flame = 1; S.c.smoke = 0; S.c.bones = 0; S.c.dust = []; OP.cam0.x = 260; OP.cam0.z = 1;
    const vey = actor({ sp: VEYRA, x: 770, y: FLOOR + 4, s: 1.85, face: 1, lanternLit: true, depth: 2 });
    const hand = actor({ sp: HAND, x: -120, y: FLOOR + 4, s: 1.95, face: 1, depth: 3, shadowFace: true });
    const grukk = actor({ sp: GRUKK, x: -160, y: FLOOR + 4, s: 1.5, face: 1, kind: 'goblin', depth: 4, stride: 1.4 });
    const skrit = actor({ sp: SKRIT, x: 330, y: FLOOR + 4, s: 1.2, face: 1, kind: 'goblin', depth: 5, alpha: 0 });
    S.c.skrit = skrit; S.c.vey = vey; S.c.grukk = grukk;
    await fade(1, 1200);
    await say(DM, "Nine days ago. The Thane's Barrow, in the forest north of Brackenford.");
    await Promise.all([walk(hand, 520, 60), cam(200, 0, 1, 3600)]);
    await say('Hooded Man', 'Well, Sister?');
    await say('Veyra', 'Three hundred years it has burned. It deserves a moment.', 'sad');
    await say('Hooded Man', 'It deserves an ending. Like everything else.');
    await turn(vey, -1);
    await say('Veyra', 'Not everything. That is the point. No more graves. No more mothers at gravesides. If the King found a way past death, it can be found for everyone.', 'angry');
    await say('Hooded Man', 'And it will be. Five lamps, five barrows, five pieces of a crown. Bring them to me, and I will see the crown on the right head.', 'happy');
    await turn(vey, 1); await sleep(400);
    // she puts it out
    await Promise.all([pose(vey, { armF: 1.45, foreF: 0.35, x: 818 }, 1200), cam(400, -40, 1.4, 1400)]);
    await sleep(700); OP.sfx('magic'); await tween(S.c, { flame: 0 }, 900); S.c.smoke = 1;
    OP.shake(700, 7); for (let i = 0; i < 90; i++) S.c.dust.push({ x: 200 + OP.rr() * 1200, y: 60 + OP.rr() * 20, v: OP.rr() * 2 });
    await Promise.all([pose(vey, { armF: 0.15, foreF: 0.2 }, 800), cam(260, 0, 1, 1400)]);
    await say(DM, 'The flame goes out. Somewhere in the dark, old bones begin to shift.', 'happy');
    await tween(S.c, { bones: 1 }, 1600);
    // Grukk
    OP.sfx('door'); await walk(grukk, 420, 130);
    await say('Grukk', 'Grey lady! Grey man! Grukk dug the hole like you said. Silver now?', 'happy');
    await turn(hand, -1);
    await say('Hooded Man', 'Take whatever the dead were buried with. Hold the hill until the Sister comes back for the shard, and keep everyone away.');
    await turn(hand, 1);
    await say('Hooded Man', 'Skrit stays with you. To help.');
    await tween(skrit, { alpha: 1, x: 300 }, 900);
    await say('Skrit', 'Skrit will watch him.');
    await say('Hooded Man', "Skrit will watch everyone. And I have bought men in Brackenford to keep the reeve's notice off the board.", 'happy');
    await turn(vey, -1);
    await say('Veyra', 'And the town? When the lamp goes cold, their dead will wake.', 'worried');
    await say('Hooded Man', 'Then the town will learn what we already know. Death is a door, Sister. Someone ought to open it.');
    // she leaves; he stays with the dark lamp
    await walk(hand, 600, 50);
    await Promise.all([walk(vey, -200, 70), sleep(1200).then(() => turn(grukk, -1)), sleep(1500).then(() => turn(skrit, -1))]);
    vey.hidden = true;
    await walk(hand, 760, 40); await sleep(500);
    await cam(450, -40, 1.4, 1800);
    await say('Hooded Man', '(Alone, to the dark lamp.) A crown is wasted on the dead.', 'happy');
    await fade(0, 1400);
    // T again: the candle lower now. Then down into the little tavern on the board
    if (atTable) {
      OP.setScene(sceneT); Object.assign(T, { lit: 1, eyes: 1, grin: 1, wide: 1, match: null, low: 1 }); Object.assign(OP.cam0, { x: 0, y: 0, z: 1 });
      await fade(1, 1200);
      await tween(T, { wide: 1.35 }, 600);
      await say(DM, 'Which brings us to tonight. Four friends, three weeks on the road, and, where else, a tavern.', 'happy');
      await tween(T, { wide: 1 }, 500);
      await cam(TB.mini[0] - W / 2, TB.mini[1] - 18 - H / 2, 1.4, 1000);
      await Promise.all([cam(TB.mini[0] - W / 2, TB.mini[1] - 18 - H / 2, 8, 2000, t => t * t), sleep(1100).then(() => fade(0, 900))]);
    }
    OP.setScene(null); await card('Chapter One', "The Thane's Barrow", 2600);
    window.DONE_ANIM = true;
  }
  OP.play = play;
})();

/* ---------- in the game: ['anim', 'opening'] plays it over the screen ---------- */
(function () {
  G.playAnim = async function (name) {
    if (name !== 'opening' || G.fast) return;
    const box = document.createElement('div'); box.className = 'animbox';
    box.style.cssText = 'position:absolute;inset:0;z-index:60;background:#000;display:flex;align-items:center;justify-content:center';
    const cv = document.createElement('canvas'); cv.style.cssText = 'width:100%;height:100%;display:block'; box.appendChild(cv); UI.root.appendChild(box);
    OP.portrait = (who, mood) => UI.portraitOf ? UI.portraitOf(who, mood) : null;
    OP.speakers = Object.assign({}, OP.speakers, G.D.speakers || {});
    OP.onSfx = n => G.audio.sfx(n);
    cv.addEventListener('pointerdown', () => { G.audio.unlock(); OP.tap(); });
    const modal = { press: b => { if (b === 'a') OP.tap(); }, skip: () => { const i = G.modals.indexOf(modal); if (i >= 0) G.modals.splice(i, 1); OP.skip(); } };   // skip must leave the modal stack, or G.skipPress spins
    G.modals.push(modal); G.audio.music('omen');
    OP.mount(cv, { h: 720 }); OP.view.note = ('ontouchstart' in window || navigator.maxTouchPoints > 0) ? 'A next   B twice: skip' : G.keyText('{a} next   {b} twice: skip');
    const watch = setInterval(() => { if (G.fast) OP.skip(); }, 100);
    let skipped; const sk = new Promise(r => { skipped = r; }); const sk0 = OP.skip; OP.skip = () => { sk0(); skipped(); };
    try { await Promise.race([OP.play(), sk]); }   // a skip ends it at once; the abandoned timeline stops with the frames
    finally { OP.skip = sk0; clearInterval(watch); OP.unmount(); box.remove(); const i = G.modals.indexOf(modal); if (i >= 0) G.modals.splice(i, 1); }
  };
})();
