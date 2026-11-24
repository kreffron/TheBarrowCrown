/* Painted scenes: the title screen, and a picture for each chapter's opening card. Each is drawn in vectors on a
   320x240 stage at whatever resolution the screen gives, and moves a little (stars, lamp-light, snow, ash, sea).
   Scenes.paint(c, kind, t) draws one; UI.card shows the chapter ones behind "Chapter ..." titles. */
const Scenes = G.scenes = {};
(function () {
  // a seeded random, so a scene's hills and stars are the same every frame
  const rnd = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  function sky(c, stops) { const g = c.createLinearGradient(0, 0, 0, 240); stops.forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; c.fillRect(0, 0, 320, 240); }
  function stars(c, t, n, maxY, seed) {
    const r = rnd(seed);
    for (let i = 0; i < n; i++) { const x = r() * 320, y = r() * maxY, s = r(), a = 0.35 + 0.5 * Math.abs(Math.sin(t / (600 + s * 900) + i)); c.fillStyle = 'rgba(244,241,230,' + a.toFixed(2) + ')'; c.fillRect(x, y, s > 0.85 ? 1.4 : 0.8, s > 0.85 ? 1.4 : 0.8); }
  }
  function glow(c, x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + col + ',' + a + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
  function moon(c, x, y, r, crescent) {
    glow(c, x, y, r * 4, '220,225,255', 0.18);
    c.fillStyle = '#eae6cc'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    if (crescent) { c.save(); c.beginPath(); c.arc(x, y, r + 0.3, 0, 7); c.clip(); c.fillStyle = crescent; c.beginPath(); c.arc(x - r * 0.45, y - r * 0.3, r * 0.92, 0, 7); c.fill(); c.restore(); }   // the shadow, in the sky's colour
  }
  // a ridge line across the stage: jagged for mountains, soft for hills
  function ridge(c, base, amp, seed, col, jag, snow) {
    const r = rnd(seed), pts = []; let x = -10;
    while (x < 340) { pts.push([x, base - r() * amp]); x += jag ? 10 + r() * 22 : 30 + r() * 40; }
    c.fillStyle = col; c.beginPath(); c.moveTo(-10, 240);
    if (jag) pts.forEach(p => c.lineTo(p[0], p[1]));
    else { c.lineTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; c.quadraticCurveTo(a[0] + (b[0] - a[0]) / 2, Math.min(a[1], b[1]) - 6, b[0], b[1]); } }
    c.lineTo(340, 240); c.closePath(); c.fill();
    if (snow) { c.fillStyle = snow; for (let i = 1; i < pts.length - 1; i++) { const p = pts[i]; if (p[1] > base - amp * 0.55) continue; const w = 6 + (base - p[1]) * 0.18; c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[0] - w, p[1] + w * 0.8); c.lineTo(p[0] - w * 0.3, p[1] + w * 0.55); c.lineTo(p[0] + w * 0.2, p[1] + w * 0.8); c.lineTo(p[0] + w, p[1] + w * 0.8); c.closePath(); c.fill(); } }
  }
  function mist(c, y, h, col, a, t) {
    for (let i = 0; i < 5; i++) { const x = ((i * 90 + t / 60) % 420) - 50, g = c.createRadialGradient(x, y, 2, x, y, 70); g.addColorStop(0, 'rgba(' + col + ',' + a + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); c.fillStyle = g; c.save(); c.translate(x, y); c.scale(1.6, h / 70); c.translate(-x, -y); c.beginPath(); c.arc(x, y, 70, 0, 7); c.fill(); c.restore(); }
  }
  function pine(c, x, y, h, col) { c.fillStyle = col; c.beginPath(); c.moveTo(x, y - h); for (let k = 0; k < 3; k++) { const yy = y - h + (k + 1) * h / 3.4, w = h * (0.22 + k * 0.1); c.lineTo(x + w, yy); c.lineTo(x + w * 0.35, yy); } c.lineTo(x + 1, y); c.lineTo(x - 1, y); for (let k = 2; k >= 0; k--) { const yy = y - h + (k + 1) * h / 3.4, w = h * (0.22 + k * 0.1); c.lineTo(x - w * 0.35, yy); c.lineTo(x - w, yy); } c.closePath(); c.fill(); }
  function oak(c, x, y, h, col) { c.fillStyle = col; c.fillRect(x - 1, y - h * 0.4, 2, h * 0.4); for (const [dx, dy, r] of [[0, -0.7, 0.32], [-0.22, -0.55, 0.25], [0.22, -0.55, 0.25]]) { c.beginPath(); c.arc(x + dx * h, y + dy * h, r * h, 0, 7); c.fill(); } }
  // a burial mound with a stone door, and a lamp burning by it
  function barrow(c, x, y, w, h, col, t, lampCol) {
    c.fillStyle = col; c.beginPath(); c.moveTo(x - w, y); c.quadraticCurveTo(x, y - h * 2, x + w, y); c.closePath(); c.fill();
    c.fillStyle = '#2a2f4a'; c.fillRect(x - 7, y - 16, 14, 3); c.fillRect(x - 7, y - 13, 3, 13); c.fillRect(x + 4, y - 13, 3, 13);
    c.fillStyle = '#04050a'; c.fillRect(x - 4, y - 13, 8, 13);
    if (lampCol) { const f = 0.75 + 0.25 * Math.sin(t / 230) * Math.sin(t / 97); glow(c, x, y - 7, 18 * f, lampCol, 0.45); c.fillStyle = 'rgba(' + lampCol + ',' + (0.6 + f * 0.4).toFixed(2) + ')'; c.fillRect(x - 1, y - 9, 2, 4); }
  }
  function lampPost(c, x, y, lit, t) {
    c.fillStyle = '#0a0c18'; c.fillRect(x - 0.6, y - 12, 1.2, 12); c.fillRect(x - 2, y - 14, 4, 3);
    if (lit) { const f = 0.8 + 0.2 * Math.sin(t / 180 + x); glow(c, x, y - 12.5, 12 * f, '255,200,110', 0.55); c.fillStyle = '#ffe0a0'; c.fillRect(x - 1, y - 13.5, 2, 2); }
    else { c.fillStyle = '#3a3a48'; c.fillRect(x - 1, y - 13.5, 2, 2); }
  }
  function falling(c, t, n, seed, kind) {
    const r = rnd(seed);
    for (let i = 0; i < n; i++) {
      const sp = 0.4 + r(), x0 = r() * 360, y0 = r() * 260, ph = r() * 7;
      if (kind === 'snow') { const y = (y0 + t * 0.012 * sp) % 260 - 10, x = (x0 + Math.sin(t / 900 + ph) * 8 + t * 0.004 * sp) % 340 - 10; c.fillStyle = 'rgba(255,255,255,' + (0.5 + sp * 0.3).toFixed(2) + ')'; c.beginPath(); c.arc(x, y, sp > 1 ? 1.1 : 0.7, 0, 7); c.fill(); }
      else { const y = 250 - (y0 + t * 0.01 * sp) % 260, x = (x0 + Math.sin(t / 700 + ph) * 10) % 340 - 10, hot = Math.abs(Math.sin(t / 300 + ph)); c.fillStyle = 'rgba(255,' + (90 + hot * 110 | 0) + ',40,' + (0.3 + hot * 0.6).toFixed(2) + ')'; c.fillRect(x, y, 1, 1); }
    }
  }
  function waves(c, t, y0, col, hi) {
    c.fillStyle = col; c.fillRect(0, y0, 320, 240 - y0);
    for (let row = 0; row < 7; row++) { const y = y0 + 3 + row * row * 1.6 + row * 3, a = 0.12 + row * 0.04; c.strokeStyle = 'rgba(' + hi + ',' + a + ')'; c.lineWidth = 0.6 + row * 0.15; c.beginPath(); for (let x = -10; x <= 330; x += 6) { const yy = y + Math.sin(x / (14 + row * 4) + t / (900 - row * 60) + row) * (0.8 + row * 0.35); x === -10 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); }
  }

  const P = {
    // The title: a moonlit valley, the barrow on its hill, and the five lamps along the ridge, one gone out.
    title(c, t) {
      sky(c, [[0, '#060818'], [0.55, '#1b2350'], [0.85, '#3a2f55'], [1, '#4a3550']]);
      stars(c, t, 110, 150, 7);
      if ((t % 9000) < 700) { const k = (t % 9000) / 700, x = 40 + k * 120, y = 20 + k * 30; c.strokeStyle = 'rgba(255,255,255,' + (1 - k) + ')'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 14, y - 4); c.stroke(); }
      moon(c, 278, 116, 11, '#1a2150');
      ridge(c, 176, 34, 11, '#1a2044', true);
      mist(c, 178, 14, '170,180,230', 0.12, t);
      ridge(c, 196, 20, 5, '#121733', false);
      for (const [x, lit] of [[28, 1], [92, 1], [228, 1], [292, 1], [160, 0]]) if (x !== 160) lampPost(c, x, 194 - Math.sin(x / 50) * 4, lit, t);
      barrow(c, 160, 214, 92, 44, '#0c1024', t, '232,193,74');
      lampPost(c, 186, 192, 0, t);
      c.fillStyle = '#080a16'; c.fillRect(0, 212, 320, 28);
      mist(c, 216, 8, '150,160,210', 0.1, t * 1.6);
    },
    // Chapter One: the Thane's Barrow, in the Thornwood, under a crescent moon.
    1(c, t) {
      sky(c, [[0, '#0b0f24'], [0.6, '#283062'], [1, '#5a4466']]);
      stars(c, t, 70, 120, 3); moon(c, 70, 50, 11, '#121733');
      ridge(c, 170, 20, 21, '#1d2448', false);
      const r = rnd(9); for (let x = -6; x < 330; x += 9 + r() * 8) (r() > 0.4 ? pine : oak)(c, x, 186 + r() * 6, 26 + r() * 18, '#0f1430');
      barrow(c, 210, 212, 70, 34, '#0a0d1e', t, '232,193,74');
      c.fillStyle = '#05060f'; c.fillRect(0, 210, 320, 30);
      for (let x = 4; x < 120; x += 7 + r() * 5) pine(c, x, 236, 40 + r() * 20, '#05060f');
      mist(c, 205, 10, '160,170,220', 0.1, t);
    },
    // Chapter Two: the Drowned Abbey, half under a grey sea, its bell-tower lamp still burning.
    2(c, t) {
      sky(c, [[0, '#1a2430'], [0.55, '#3a4c5c'], [1, '#6a7a80']]);
      c.fillStyle = 'rgba(30,40,52,.55)'; for (let i = 0; i < 6; i++) { const x = ((i * 70 + t / 90) % 420) - 60; c.beginPath(); c.ellipse(x, 40 + (i % 3) * 22, 60, 12, 0, 0, 7); c.fill(); }
      if ((t % 7000) < 120) { c.fillStyle = 'rgba(230,240,255,.25)'; c.fillRect(0, 0, 320, 240); }
      // the abbey: a nave of broken arches, and the tower
      const S = '#141c26';
      c.fillStyle = S; c.fillRect(150, 112, 18, 80); c.beginPath(); c.moveTo(146, 112); c.lineTo(159, 88); c.lineTo(172, 112); c.fill();
      c.fillRect(110, 150, 100, 42);
      c.fillStyle = '#4a5866'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(122 + i * 24, 164, 6, Math.PI, 0); c.lineTo(128 + i * 24, 180); c.lineTo(116 + i * 24, 180); c.fill(); }
      c.fillStyle = S; c.beginPath(); c.moveTo(210, 150); c.lineTo(222, 138); c.lineTo(226, 192); c.lineTo(210, 192); c.fill();
      c.fillStyle = '#4a5866'; c.beginPath(); c.arc(159, 124, 4, Math.PI, 0); c.lineTo(163, 132); c.lineTo(155, 132); c.fill();
      const f = 0.8 + 0.2 * Math.sin(t / 200); glow(c, 159, 128, 30 * f, '255,210,130', 0.5); c.fillStyle = '#ffe2a0'; c.fillRect(158, 127, 2, 3);
      waves(c, t, 182, '#1c2a36', '170,200,220');
      c.fillStyle = 'rgba(255,210,130,.18)'; for (let i = 0; i < 6; i++) c.fillRect(156 + Math.sin(t / 300 + i) * 3, 186 + i * 8, 6 - i * 0.6, 1);
    },
    // Chapter Three: the north, snow on the peaks and a ring of standing stones in the foreground.
    3(c, t) {
      sky(c, [[0, '#9ab0cc'], [0.5, '#c8d4e2'], [1, '#e8d8d0']]);
      glow(c, 240, 70, 60, '255,240,220', 0.5);
      ridge(c, 150, 70, 31, '#7a8aa6', true, '#eef2f8');
      ridge(c, 178, 40, 17, '#5a6a88', true, '#dde6f0');
      mist(c, 176, 14, '240,244,250', 0.35, t);
      c.fillStyle = '#e8eef6'; c.fillRect(0, 196, 320, 44); ridge(c, 204, 8, 4, '#f4f8fc', false);
      for (const [x, h, w, lean] of [[60, 40, 9, -0.05], [100, 30, 8, 0.04], [228, 44, 10, 0.03], [266, 32, 8, -0.06], [164, 22, 7, 0]]) {
        c.save(); c.translate(x, 212); c.rotate(lean); c.fillStyle = '#4a5468'; c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(-w / 2 + 1, -h); c.quadraticCurveTo(0, -h - 4, w / 2 - 1, -h); c.lineTo(w / 2, 0); c.fill();
        c.fillStyle = '#f4f8fc'; c.beginPath(); c.moveTo(-w / 2 + 1, -h); c.quadraticCurveTo(0, -h - 4, w / 2 - 1, -h); c.lineTo(w / 2 - 1, -h + 3); c.lineTo(-w / 2 + 1, -h + 3); c.fill();
        c.fillStyle = 'rgba(140,200,255,.55)'; c.fillRect(-1, -h * 0.6, 2, 6); c.restore();
        c.fillStyle = 'rgba(60,70,100,.25)'; c.beginPath(); c.ellipse(x + 10, 213, w, 2, 0, 0, 7); c.fill();
      }
      falling(c, t, 90, 13, 'snow');
    },
    // Chapter Four: Highmoor at night, spires and lit windows, and the catacomb arch below.
    4(c, t) {
      sky(c, [[0, '#0a0814'], [0.6, '#241a38'], [1, '#4a2a40']]);
      stars(c, t, 50, 100, 21); moon(c, 250, 40, 16, false);
      const r = rnd(41), win = [];
      for (let x = 0; x < 320;) { const w = 14 + r() * 18, h = 40 + r() * 60, top = 190 - h; c.fillStyle = '#120e1e'; c.fillRect(x, top, w, h + 50);
        if (r() > 0.5) { c.beginPath(); c.moveTo(x - 1, top); c.lineTo(x + w / 2, top - 14 - r() * 20); c.lineTo(x + w + 1, top); c.fill(); }
        for (let k = 0; k < 4; k++) if (r() > 0.45) win.push([x + 3 + r() * (w - 6), top + 6 + r() * (h - 12), r() * 7]);
        x += w + r() * 3; }
      for (const [x, y, ph] of win) { const f = 0.6 + 0.4 * Math.sin(t / 900 + ph * 3); c.fillStyle = 'rgba(255,200,110,' + f.toFixed(2) + ')'; c.fillRect(x, y, 2, 3); }
      mist(c, 190, 12, '120,90,140', 0.18, t);
      c.fillStyle = '#06050b'; c.fillRect(0, 200, 320, 40);
      // the arch, and candles in it
      c.fillStyle = '#1e1a2a'; c.fillRect(110, 168, 100, 72); c.fillStyle = '#04030a'; c.beginPath(); c.moveTo(126, 240); c.lineTo(126, 196); c.arc(160, 196, 34, Math.PI, 0); c.lineTo(194, 240); c.fill();
      for (const [x, y] of [[140, 226], [152, 230], [168, 230], [180, 226]]) { const f = 0.8 + 0.2 * Math.sin(t / 150 + x); glow(c, x, y - 3, 10 * f, '255,190,100', 0.5); c.fillStyle = '#d8d0c0'; c.fillRect(x - 0.7, y - 3, 1.4, 4); c.fillStyle = '#ffd890'; c.fillRect(x - 0.6, y - 5, 1.2, 1.6); }
    },
    // Chapter Five: the Ashen Road under a red sky, the Hollow Barrow ahead, and the crown's ghost over it.
    5(c, t) {
      sky(c, [[0, '#1a0608'], [0.5, '#5a1a14'], [0.85, '#a8442a'], [1, '#c86a3a']]);
      glow(c, 160, 196, 140, '255,120,60', 0.25);
      ridge(c, 168, 50, 51, '#2a0c0c', true);
      ridge(c, 196, 18, 23, '#180606', false);
      // the crown, faint in the smoke
      const k = 0.35 + 0.15 * Math.sin(t / 1200); c.save(); c.globalAlpha = k; c.strokeStyle = '#ffd8a0'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(126, 140); c.lineTo(130, 110); c.lineTo(143, 128); c.lineTo(160, 102); c.lineTo(177, 128); c.lineTo(190, 110); c.lineTo(194, 140); c.closePath(); c.stroke();
      c.fillStyle = 'rgba(255,200,140,.5)'; for (const x of [130, 160, 190]) { c.beginPath(); c.arc(x, x === 160 ? 102 : 110, 2, 0, 7); c.fill(); } c.restore();
      barrow(c, 160, 214, 100, 38, '#0a0304', t, null);
      c.fillStyle = '#050102'; c.fillRect(0, 212, 320, 28);
      // the road, and the dead way-lamps along it
      c.fillStyle = '#2a1410'; c.beginPath(); c.moveTo(150, 214); c.lineTo(170, 214); c.lineTo(230, 240); c.lineTo(90, 240); c.fill();
      for (const [x, y, s] of [[136, 218, 0.6], [186, 218, 0.6], [110, 228, 0.85], [212, 228, 0.85]]) { c.save(); c.translate(x, y); c.scale(s, s); lampPost(c, 0, 0, 0, t); c.restore(); }
      falling(c, t, 120, 77, 'ash');
    }
  };
  Scenes.paint = function (c, kind, t) { const f = P[kind]; if (f) f(c, t == null ? G.time : t); return !!f; };
  Scenes.has = kind => !!P[kind];
  // A chapter's number from a card title ('Chapter Three' -> 3).
  Scenes.chapterOf = title => { const m = /^Chapter (One|Two|Three|Four|Five)$/i.exec(String(title || '')); return m ? ['one', 'two', 'three', 'four', 'five'].indexOf(m[1].toLowerCase()) + 1 : 0; };
  // A living picture in a DOM element: a canvas at screen resolution, repainted each frame while it is on the page.
  Scenes.mount = function (el, kind) {
    const cv = document.createElement('canvas'); cv.className = 'scenecv'; el.prepend(cv);
    const fit = () => { const r = el.getBoundingClientRect(), dpr = window.devicePixelRatio || 1, k = Math.max(1, Math.min(6, r.width * dpr / 320)); cv.width = Math.round(320 * k); cv.height = Math.round(240 * k); return k; };
    let k = fit(), t0 = performance.now();
    const step = now => {
      if (!cv.isConnected) return;
      if (Math.abs(cv.width - el.getBoundingClientRect().width * (window.devicePixelRatio || 1)) > 8) k = fit();
      const c = cv.getContext('2d'); c.setTransform(k, 0, 0, k, 0, 0); Scenes.paint(c, kind, now - t0 + 2000);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    return cv;
  };
})();
