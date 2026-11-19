/* Beasts: the creatures that have no character spec (wolves, spiders, wisps, golems and the rest) painted as smooth
   figures on the board, in the same hand as the heroes: shaded shapes, soft highlights, bright eyes. The field still
   shows them as pixel sprites.
   Each painter draws one creature facing right, in the piece's 40x64 layout, standing (or hovering) on the base whose
   top is the ellipse at (20, 52). A painter may return an `after` function, drawn on top once the dark outline and
   lighting are on, for glows that should not be outlined. */
(function () {
  function rgb(col) {                                              // '#rrggbb' or 'rgb(r,g,b)'
    if (col[0] !== '#') return (col.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number);
    const n = parseInt(col.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255];
  }
  function shade(hex, d) {
    if (!hex) return hex;
    const [r, g, b] = rgb(hex), f = v => Math.max(0, Math.min(255, v + d));
    return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')';
  }
  function alpha(hex, a) { const [r, g, b] = rgb(hex); return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; }
  // drawing helpers, bound to one context
  function kit(c) {
    const K = {
      lin(x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; },
      rad(x, y, r0, r1, stops, fx, fy) { const g = c.createRadialGradient(fx == null ? x : fx, fy == null ? y : fy, r0, x, y, r1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; },
      ell(cx, cy, rx, ry, fill, rot) { c.fillStyle = fill; c.beginPath(); c.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, 6.2832); c.fill(); },
      R(x, y, w, h, fill, r) { c.fillStyle = fill; c.beginPath(); c.roundRect(x, y, w, h, r == null ? 0.8 : r); c.fill(); },
      line(pts, w, col) { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke(); },
      curve(pts, w, col) { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 4) c.quadraticCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3]); c.stroke(); },
      poly(pts, fill) { c.fillStyle = fill; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); },
      shape(fn, fill, stroke, sw) { const p = new Path2D(); fn(p); if (fill) { c.fillStyle = fill; c.fill(p); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = sw || 0.5; c.stroke(p); } return p; },
      // an eye with a glint; glow eyes get a soft halo
      eye(x, y, r, col, glow) {
        if (K.real) {                                       // heroic style: a small eye in a shadowed socket, a pin of light
          const e = r * 0.62;
          K.ell(x, y + e * 0.1, e * 1.6, e * 1.15, 'rgba(10,6,10,.45)');
          if (glow) K.ell(x, y, r * 1.7, r * 1.7, K.rad(x, y, 0, r * 1.7, [[0, alpha(col, 0.5)], [1, alpha(col, 0)]]));
          K.ell(x, y, e * 1.15, e * 0.82, glow ? col : shade(col, -30));
          K.ell(x, y, e * 0.42, e * 0.7, glow ? 'rgba(255,250,230,.9)' : '#0c080c');
          K.ell(x - e * 0.4, y - e * 0.32, e * 0.2, e * 0.2, 'rgba(255,255,255,.85)');
          return;
        }
        if (glow) { K.ell(x, y, r * 2.4, r * 2.4, K.rad(x, y, 0, r * 2.4, [[0, alpha(col, 0.55)], [1, alpha(col, 0)]])); }
        K.ell(x, y, r, r, col); K.ell(x - r * 0.3, y - r * 0.35, r * 0.38, r * 0.38, 'rgba(255,255,255,.9)');
      },
      // a leg as a tapering stroke through points, with a paw at the end
      leg(pts, w, col, paw) {
        K.line(pts, w, col);
        const n = pts.length; if (paw) K.ell(pts[n - 2] + 0.5, pts[n - 1] - 0.2, w * 0.68, w * 0.42, paw);
      },
      clip(p, fn) { c.save(); c.clip(p); fn(); c.restore(); },
      alpha: a => { c.globalAlpha = a; },
      // a pool of light on the base under something that glows
      pool(col, a) { K.ell(20, 52, 12, 3.4, K.rad(20, 52, 0, 12, [[0, alpha(col, a || 0.5)], [1, alpha(col, 0)]])); },
      shade, rgba: alpha,
    };
    return K;
  }

  /* ---------- four-legged beasts ---------- */
  function wolf(c, K, p) {
    const fur = p.fur, dk = shade(fur, -42), lt = p.light;
    // tail, far legs
    K.shape(q => { q.moveTo(11, 35.5); q.quadraticCurveTo(3.5, 35, 2.6, 45.5); q.quadraticCurveTo(5.2, 43, 6.8, 42.4); q.quadraticCurveTo(8.6, 39.5, 12, 39.5); q.closePath(); }, K.lin(3, 36, 11, 44, [[0, shade(fur, 10)], [1, dk]]));
    K.ell(3.6, 44.2, 1.6, 1.4, lt, 0.5);
    K.leg([13.5, 40, 12, 46, 13, 50.8], 2.5, shade(fur, -60), shade(fur, -72));
    K.leg([27.5, 40, 28, 46, 28.6, 50.8], 2.5, shade(fur, -60), shade(fur, -72));
    // body
    const body = K.shape(q => { q.moveTo(9.5, 37.5); q.quadraticCurveTo(12, 32.6, 19, 33); q.quadraticCurveTo(25.5, 32, 29, 32.4); q.quadraticCurveTo(33, 35, 31.6, 40); q.quadraticCurveTo(30, 44.6, 25.5, 44.2); q.quadraticCurveTo(19, 42.8, 14.5, 44.2); q.quadraticCurveTo(9, 44.4, 9.5, 37.5); }, K.lin(0, 32, 0, 45, [[0, shade(fur, 22)], [0.55, fur], [1, dk]]));
    K.clip(body, () => { K.ell(22, 46, 9, 3.6, alpha(lt, 0.7)); K.ell(17, 33.2, 8, 1.4, 'rgba(255,255,255,.18)'); if (p.stripe) K.ell(19, 34.4, 9, 1.6, p.stripe); });
    // neck and head
    K.shape(q => { q.moveTo(25.5, 34); q.lineTo(29, 24.5); q.lineTo(34.5, 26.5); q.quadraticCurveTo(33.6, 33, 31.5, 38); q.closePath(); }, K.lin(26, 0, 34, 0, [[0, fur], [1, shade(fur, -16)]]));
    if (p.mane) K.shape(q => { q.moveTo(24.5, 33); q.quadraticCurveTo(25, 26, 29.5, 23.6); q.lineTo(30.6, 27); q.lineTo(29, 30); q.lineTo(31.6, 31.5); q.lineTo(29.2, 34); q.lineTo(31.4, 37.6); q.quadraticCurveTo(27, 37, 24.5, 33); }, p.mane);
    K.ell(30.5, 36.2, 2.6, 3.8, alpha(lt, 0.85));                                       // chest ruff
    K.poly([28.4, 24.4, 29.2, 17.8, 31.8, 23.4], shade(fur, -6)); K.poly([29.3, 23.4, 29.6, 20, 31, 23.2], shade(fur, -55));
    K.poly([31, 23.6, 33.4, 18.2, 34.2, 24.4], shade(fur, 6)); K.poly([31.9, 23.4, 33.2, 20.4, 33.6, 23.8], shade(fur, -48));
    K.ell(31.6, 26.4, 4.4, 3.6, K.rad(30.6, 25, 0.5, 5, [[0, shade(fur, 28)], [1, fur]]));
    K.shape(q => { q.moveTo(33, 24.6); q.quadraticCurveTo(37, 25.2, 39.6, 26.8); q.quadraticCurveTo(40.2, 28.4, 39, 28.8); q.lineTo(34.6, 30.2); q.quadraticCurveTo(32.6, 29, 33, 24.6); }, K.lin(0, 25, 0, 30, [[0, shade(fur, 14)], [1, lt]]));
    K.ell(39.2, 27.3, 1, 0.85, '#141018');
    K.line([38.8, 28.9, 35.6, 29.6], 0.45, shade(fur, -80));
    K.eye(33.4, 25.3, 0.9, p.eye, p.glow);
    if (p.scar) K.line([32.2, 23.4, 34.6, 27.2], 0.5, '#7a2a2a');
    // near legs
    K.leg([11.5, 40, 9.8, 45.5, 11, 51.2], 3, shade(fur, -14), shade(fur, -36));
    K.leg([25.5, 40.5, 25, 46, 25.4, 51.2], 3, shade(fur, -8), shade(fur, -30));
  }

  function bear(c, K, p) {
    const fur = p.fur, dk = p.dark, lt = shade(fur, 10);
    K.R(7.5, 41, 5, 10.5, dk, 2.2); K.R(26, 41, 5, 10.5, dk, 2.2);                     // far legs
    const body = K.shape(q => { q.moveTo(4.2, 41); q.quadraticCurveTo(4, 29, 16, 27.6); q.quadraticCurveTo(26, 26.4, 30.5, 30.5); q.quadraticCurveTo(34, 36, 31.5, 44); q.quadraticCurveTo(20, 46.5, 8, 45.4); q.quadraticCurveTo(4.4, 44.6, 4.2, 41); }, K.lin(0, 27, 0, 46, [[0, lt], [0.6, fur], [1, dk]]));
    K.clip(body, () => { K.ell(12, 29.5, 8, 2.4, 'rgba(255,255,255,.35)'); for (let i = 0; i < 7; i++) K.curve([8 + i * 3.4, 33 + (i % 2), 9 + i * 3.4, 35.5 + (i % 2), 8.4 + i * 3.4, 38 + (i % 2)], 0.35, alpha('#7c8aa6', 0.35)); });
    // head
    K.ell(29.6, 26.6, 2, 2, fur); K.ell(29.6, 26.6, 1.1, 1.1, dk);
    K.ell(32.2, 31.4, 5.8, 5.2, K.rad(31, 29.6, 0.6, 6.4, [[0, lt], [1, shade(fur, -14)]]));
    K.ell(34.4, 26.2, 2, 2, lt); K.ell(34.4, 26.2, 1.1, 1.1, dk);
    K.ell(37.4, 33.2, 3.4, 2.6, K.lin(0, 31, 0, 36, [[0, lt], [1, shade(fur, -20)]]));
    K.ell(40.2, 32.4, 1.1, 0.9, '#1a1620');
    K.line([39.6, 34.4, 37, 35.2], 0.45, '#4a4250');
    K.eye(34.8, 30.2, 0.85, p.eye || '#1a1620');
    // near legs and claws
    for (const [x, sh] of [[10.5, -6], [23.5, 4]]) {
      K.R(x, 41.5, 5.6, 10.2, K.lin(x, 0, x + 5.6, 0, [[0, shade(fur, sh + 6)], [1, shade(fur, sh - 26)]]), 2.4);
      for (let i = 0; i < 3; i++) K.line([x + 2.4 + i * 1.3, 51.3, x + 3 + i * 1.3, 52.4], 0.55, '#3a3440');
    }
  }

  function rat(c, K, p) {
    const fur = p.fur, dk = shade(fur, -40), pink = p.pink || '#e8a0a8';
    K.curve([9, 45, 2, 44, 3, 37, 4, 30, 8, 28], 1.3, shade(pink, -20));               // tail
    K.leg([14, 45, 12.6, 50.6], 2.2, dk, shade(pink, -30)); K.leg([25.5, 45, 26, 50.6], 2.2, dk, shade(pink, -30));
    const body = K.shape(q => { q.moveTo(8, 44); q.quadraticCurveTo(8, 34, 18, 34.5); q.quadraticCurveTo(27, 35, 30, 39.5); q.quadraticCurveTo(31, 46, 24, 47.6); q.lineTo(13, 47.6); q.quadraticCurveTo(8, 47.4, 8, 44); }, K.lin(0, 34, 0, 48, [[0, shade(fur, 24)], [0.6, fur], [1, dk]]));
    K.clip(body, () => { K.ell(19, 48, 10, 3, alpha('#ffffff', 0.12)); for (let i = 0; i < 5; i++) K.curve([12 + i * 3.6, 36.5, 13 + i * 3.6, 38.4, 12.6 + i * 3.6, 40.4], 0.35, alpha('#000000', 0.18)); });
    // head
    K.shape(q => { q.moveTo(26, 36.6); q.quadraticCurveTo(30, 34.2, 33.4, 37.6); q.quadraticCurveTo(37, 40, 38.6, 41.6); q.quadraticCurveTo(37.6, 43.6, 33, 44.4); q.quadraticCurveTo(28, 45, 26.4, 42); q.closePath(); }, K.lin(0, 35, 0, 45, [[0, shade(fur, 26)], [1, shade(fur, -10)]]));
    K.ell(29, 35.6, 2.6, 2.8, fur); K.ell(29.2, 35.8, 1.6, 1.8, pink);
    K.ell(38.6, 41.6, 1, 0.9, pink);
    for (const dy of [-0.8, 0.4, 1.4]) K.line([37.2, 42 + dy * 0.3, 40.6, 41 + dy * 1.4], 0.22, 'rgba(240,240,240,.7)');
    K.eye(33.2, 39.1, 0.95, p.eye || '#140c10', p.glow);
    K.leg([22, 45, 21, 51], 2.4, shade(fur, -10), shade(pink, -10)); K.leg([31.5, 43.4, 33, 50.8], 2.2, shade(fur, -6), shade(pink, -10));
    if (p.crown) {
      K.poly([25.6, 34.6, 25.2, 29.4, 27, 31.6, 28.4, 28.4, 29.8, 31.4, 31.6, 29.2, 31.4, 34.4], K.lin(0, 28, 0, 35, [[0, '#ffe58a'], [1, '#c8941e']]));
      K.ell(28.5, 33, 0.8, 0.8, '#d83a4a'); K.R(25.4, 33.6, 6.2, 1.2, '#a8781a', 0.4);
    }
  }

  /* ---------- creepers and swimmers ---------- */
  function spider(c, K, p) {
    const b = p.body, dk = shade(b, -30);
    const legs = (far) => {
      const col = far ? shade(b, -28) : shade(b, 8), xs = far ? [17, 20, 23, 26] : [16, 19.5, 23, 26.5];
      xs.forEach((x, i) => {
        const back = i < 2, kx = back ? x - 6 - (1 - i) * 3 : x + 4 + (i - 2) * 3.4, fx = back ? x - 8 - (1 - i) * 4 : x + 7 + (i - 2) * 4.6;
        K.line([x, 40, kx, far ? 31.5 - i * 0.4 : 32.5 - i * 0.3, fx, far ? 49.6 : 51.2], far ? 1.3 : 1.6, col);
      });
    };
    legs(true);
    const ab = K.shape(q => q.ellipse(13.5, 38.6, 8.6, 7.4, -0.2, 0, 6.2832), K.rad(11, 35, 0.6, 9.5, [[0, shade(b, 30)], [0.7, b], [1, dk]]));
    K.clip(ab, () => { K.ell(12.4, 38.6, 2.4, 1.6, p.mark); K.ell(15.4, 37.6, 1.4, 1, p.mark); K.ell(9.6, 40.4, 1.4, 1, p.mark); K.ell(11, 33.4, 5, 1.4, 'rgba(255,255,255,.16)', -0.2); for (let i = 0; i < 9; i++) K.line([6 + i * 2, 45 - (i % 3), 6.6 + i * 2, 46.2 - (i % 3)], 0.3, alpha('#000000', 0.3)); });
    K.ell(25.4, 40.4, 5.2, 4.2, K.rad(24, 38.6, 0.4, 5.6, [[0, shade(b, 32)], [1, dk]]));
    legs(false);
    // fangs and eyes
    K.poly([29.2, 42.4, 30.6, 45.6, 30.8, 42], '#e8dcc8'); K.poly([27.6, 42.8, 28.4, 45.4, 29, 42.4], '#c8baa4');
    for (const [x, y, r] of [[29.2, 39.2, 0.85], [28, 38.2, 0.7], [30.1, 40.6, 0.6], [26.6, 37.8, 0.5]]) K.eye(x, y, r, p.eye, true);
  }

  function crab(c, K, p) {
    const sh = p.shell, dk = shade(sh, -46);
    // legs: three each side, bent down to the base
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      const x0 = 20 + s * (5 + i * 1.6), kx = 20 + s * (10.5 + i * 2.2), fx = 20 + s * (9.5 + i * 3);
      K.line([x0, 44, kx, 41 + i * 1.2, fx, 51.4 - i * 0.6], 1.6, i === 1 ? shade(sh, -16) : shade(sh, -30));
    }
    // arms up to the claws
    for (const s of [-1, 1]) {
      const cx = 20 + s * 13.5;
      K.line([20 + s * 7, 40, 20 + s * 11, 37, cx, 32], 2.4, shade(sh, -10));
      K.shape(q => { q.ellipse(cx, 27.6, 4.4, 5.4, s * 0.25, 0, 6.2832); }, K.rad(cx - 1.4, 25.6, 0.6, 6, [[0, shade(sh, 40)], [1, shade(sh, -18)]]));
      K.poly([cx - 1.4 * s, 22.8, cx + 0.6 * s, 26.6, cx + 4.6 * s, 21.4, cx + 2.2 * s, 19.6], '#00000000');
      // the pincer's notch, cut in dark, then the moving finger
      K.poly([cx - 0.6, 23, cx + 0.6, 23, cx + 0.2 * s, 27.2], dk);
      K.ell(cx + 2.4 * s, 23.6, 1.6, 3.8, shade(sh, 14), s * 0.5);
    }
    // the shell
    const shell = K.shape(q => { q.moveTo(8.5, 43); q.quadraticCurveTo(9, 34.4, 20, 34); q.quadraticCurveTo(31, 34.4, 31.5, 43); q.quadraticCurveTo(26, 47.6, 20, 47.4); q.quadraticCurveTo(14, 47.6, 8.5, 43); }, K.rad(17, 36.4, 1, 13, [[0, shade(sh, 46)], [0.6, sh], [1, dk]]));
    K.clip(shell, () => { K.ell(20, 47.4, 12, 3, alpha('#000000', 0.25)); for (const x of [13, 20, 27]) K.ell(x, 41, 1.4, 1, alpha('#000000', 0.18)); K.ell(16, 36, 6, 1.4, 'rgba(255,255,255,.25)'); });
    // eyes on stalks
    for (const x of [16.6, 23.4]) { K.line([x, 35.6, x + (x > 20 ? 0.6 : -0.6), 30.6], 1, shade(sh, -10)); K.eye(x + (x > 20 ? 0.6 : -0.6), 30, 1.3, '#1a1018'); }
    K.curve([16.4, 43.6, 20, 45.6, 23.6, 43.6], 0.6, dk);
  }

  function eel(c, K, p) {
    const b = p.body, belly = p.belly;
    // the body: a run of discs down a curve, thick at the head and thin at the tail
    const pt = t => { const u = 1 - t; return [u * u * u * 13 + 3 * u * u * t * 4 + 3 * u * t * t * 34 + t * t * t * 25, u * u * u * 51 + 3 * u * u * t * 34 + 3 * u * t * t * 34 + t * t * t * 22]; };
    const N = 60;
    for (let i = 0; i <= N; i++) { const t = i / N, [x, y] = pt(t), r = 1.4 + 2.6 * Math.sin(Math.min(1, t * 1.15) * 1.5); K.ell(x, y, r, r, K.rad(x - r * 0.3, y - r * 0.4, 0.2, r, [[0, shade(b, 26)], [1, shade(b, -24)]])); }
    for (let i = 4; i <= N - 4; i++) { const t = i / N, [x, y] = pt(t), r = 1.4 + 2.6 * Math.sin(Math.min(1, t * 1.15) * 1.5); K.ell(x + r * 0.35, y + r * 0.45, r * 0.45, r * 0.4, alpha(belly, 0.8)); }
    // a fin along the back
    for (let i = 8; i < N - 8; i += 4) { const [x, y] = pt(i / N), [x2, y2] = pt((i + 4) / N), r = 1.4 + 2.6 * Math.sin(Math.min(1, i / N * 1.15) * 1.5); K.poly([x - r * 0.4, y - r * 0.8, (x + x2) / 2 - r * 0.9, (y + y2) / 2 - r * 1.6, x2 - r * 0.4, y2 - r * 0.8], alpha(p.fin, 0.85)); }
    // head
    K.ell(27.6, 21.4, 5.2, 3.8, K.rad(26.6, 20, 0.5, 5.6, [[0, shade(b, 30)], [1, shade(b, -18)]]), -0.25);
    K.shape(q => { q.moveTo(30, 19.6); q.quadraticCurveTo(34.6, 19.6, 35.6, 21.6); q.quadraticCurveTo(33, 24.6, 29, 24); q.closePath(); }, shade(b, 6));
    K.line([35, 21.9, 30.6, 22.8], 0.5, '#101814');
    for (const x of [31.4, 33]) K.poly([x, 22.6, x + 0.5, 23.8, x + 0.9, 22.5], '#f0ecd8');
    K.eye(29.8, 19.9, 1, p.eye, true);
    if (p.crown) K.poly([24, 18.4, 24.6, 14.6, 25.8, 16.8, 27, 13.8, 28.2, 16.8, 29.4, 14.6, 29.8, 18.6], '#e8c14a');
    return (K, c) => {                                              // ripples where it rises from the water
      K.ell(15, 51.4, 9, 2.6, alpha('#3a6a8a', 0.5));
      c.strokeStyle = 'rgba(200,230,255,.7)'; c.lineWidth = 0.45; c.beginPath(); c.ellipse(15, 51.4, 6, 1.8, 0, 3.3, 6.2); c.stroke(); c.beginPath(); c.ellipse(15, 51.4, 9.4, 2.8, 0, 3.5, 6.0); c.stroke();
    };
  }

  /* ---------- big walkers ---------- */
  function golem(c, K, p) {
    const st = p.stone, dk = shade(st, -44), lt = shade(st, 30);
    const rock = (x, y, w, h, r, sh) => K.R(x, y, w, h, K.lin(x, y, x + w, y + h, [[0, shade(st, 24 + (sh || 0))], [0.55, shade(st, sh || 0)], [1, shade(st, -36 + (sh || 0))]]), r);
    rock(11.4, 40, 7, 11.6, 2.2, -16); rock(21.6, 40, 7, 11.6, 2.2, -4);                 // legs
    rock(9.4, 22, 21.2, 20, 4.5);                                                        // torso
    c.strokeStyle = alpha('#000000', 0.32); c.lineWidth = 0.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(14, 25); c.lineTo(16.4, 29.6); c.lineTo(15.2, 33); c.moveTo(24, 34); c.lineTo(26.6, 37.6); c.moveTo(20, 23.6); c.lineTo(21, 26.2); c.stroke();
    K.ell(20, 31, 3, 3, K.rad(20, 31, 0, 3.2, [[0, '#ffffff'], [0.35, p.glow], [1, alpha(p.glow, 0)]]));   // a rune at the heart
    if (p.moss) { K.ell(13.6, 23, 3.4, 1.4, p.moss); K.ell(27, 40.6, 2.2, 1, p.moss); }
    if (p.frost) { K.poly([9.6, 26, 11.6, 22.4, 14, 22.2, 12, 24.6], 'rgba(235,245,255,.8)'); K.poly([25, 22.2, 30.4, 22.6, 30.6, 26.6, 28.6, 24], 'rgba(235,245,255,.8)'); }
    rock(14.6, 13.4, 10.8, 9.6, 3);                                                      // head
    K.R(15.6, 19.6, 8.8, 1.2, dk, 0.5);
    K.eye(18, 17.2, 1.1, p.glow, true); K.eye(22.2, 17.2, 1.1, p.glow, true);
    // boulder arms
    rock(3.6, 23, 6.8, 9.4, 3, -12); rock(2.8, 31.4, 7.4, 8.6, 3.2, -18);
    rock(29.6, 23, 6.8, 9.4, 3, 4); rock(30, 31.4, 7.4, 8.6, 3.2, -4);
    for (const [x, y] of [[6, 25], [32, 25], [5, 34], [33, 34]]) K.ell(x, y, 1.6, 0.7, alpha('#ffffff', 0.22));
  }

  function automaton(c, K, p) {
    const br = p.brass, dk = shade(br, -60), lt = shade(br, 50);
    const metal = (x, y, w, h, r, sh) => K.R(x, y, w, h, K.lin(x, 0, x + w, 0, [[0, shade(br, 30 + (sh || 0))], [0.4, shade(br, 8 + (sh || 0))], [1, shade(br, -50 + (sh || 0))]]), r);
    // legs: pistons and feet
    for (const [x, sh] of [[13, -20], [22.6, 0]]) { K.R(x + 1.4, 40, 2.4, 9, '#5a5e68', 0.6); metal(x, 39, 5, 3.2, 1, sh); metal(x - 0.6, 48.6, 6.6, 3, 1.2, sh); }
    // body: a riveted boiler
    metal(10, 20.6, 20, 19.6, 4.5);
    K.R(11, 27.6, 18, 1.6, dk, 0.6);
    for (const x of [12.4, 16, 24, 27.6]) for (const y of [22.6, 31.2, 37.6]) K.ell(x, y, 0.55, 0.55, lt);
    // a turning gear on the chest
    c.save(); c.translate(20, 33.6);
    c.fillStyle = shade(br, -20); c.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.2832, r = i % 2 ? 4.4 : 3.4; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill();
    c.restore(); K.ell(20, 33.6, 2.6, 2.6, K.rad(19.4, 33, 0.3, 2.8, [[0, lt], [1, shade(br, -10)]])); K.ell(20, 33.6, 0.9, 0.9, dk);
    // arms: jointed pipes
    for (const [s, sh] of [[-1, -18], [1, 4]]) {
      const sx = 20 + s * 11.2;
      K.ell(sx, 23.4, 2.8, 2.8, K.rad(sx - 0.6, 22.6, 0.3, 3, [[0, lt], [1, shade(br, -30 + sh)]]));
      K.line([sx, 24, sx + s * 1.6, 31.6, sx + s * 0.6, 37.4], 2.4, '#6a6e78');
      metal(sx + s * 0.6 - 2.2, 37, 4.4, 3.4, 1.2, sh);
    }
    // head: a dome with a grille and lamp eyes
    metal(13.8, 11.6, 12.4, 9.6, [5, 5, 1.6, 1.6]);
    K.R(15, 15, 10, 3.4, '#1e1a20', 1.2);
    K.eye(17.8, 16.7, 1.05, p.eye, true); K.eye(22.6, 16.7, 1.05, p.eye, true);
    K.line([20, 11.6, 20, 8.6], 0.7, shade(br, -30)); K.ell(20, 8.2, 1, 1, '#e86a4a');
    K.ell(17, 12.8, 3, 0.8, 'rgba(255,255,255,.35)');
  }

  function colossus(c, K, p) {
    const bone = '#e6dcc0', bd = '#9a8e70', bl = '#fffbe8', gap = '#2a2230';
    const boneSeg = (pts, w) => { K.line(pts, w + 0.9, bd); K.line(pts, w, bone); const n = pts.length; for (let i = 0; i < n; i += 2) K.ell(pts[i], pts[i + 1], w * 0.62, w * 0.62, bl); };
    // legs
    boneSeg([15, 40, 13.4, 45.6, 14, 50.6], 2.4); boneSeg([25, 40, 26.4, 45.6, 26, 50.6], 2.4);
    K.ell(13.6, 51, 2.8, 1.2, bone); K.ell(26.6, 51, 2.8, 1.2, bone);
    // pelvis and spine
    K.shape(q => { q.moveTo(12, 38); q.quadraticCurveTo(20, 35, 28, 38); q.quadraticCurveTo(27, 42.6, 20, 42.4); q.quadraticCurveTo(13, 42.6, 12, 38); }, K.lin(0, 36, 0, 43, [[0, bl], [1, bd]]));
    K.line([20, 22, 20, 37], 2.2, bd); for (let y = 23; y < 37; y += 2.4) K.ell(20, y, 1.5, 0.9, bone);
    // rib cage
    K.shape(q => { q.moveTo(11, 21); q.quadraticCurveTo(20, 17, 29, 21); q.quadraticCurveTo(31, 30, 26, 34.6); q.lineTo(14, 34.6); q.quadraticCurveTo(9, 30, 11, 21); }, alpha(gap, 0.75));
    for (let i = 0; i < 5; i++) { const y = 21.6 + i * 2.7, w = 9.4 - Math.abs(i - 1.5) * 0.9; K.curve([20 - w, y + 2, 20 - w * 0.6, y - 0.6, 20, y], 1.1, bone); K.curve([20, y, 20 + w * 0.6, y - 0.6, 20 + w, y + 2], 1.1, shade(bone, -16)); }
    // shoulders and great arms, knuckles down
    K.ell(9.4, 20.6, 4.2, 3.2, K.rad(8.6, 19.6, 0.4, 4.6, [[0, bl], [1, bd]])); K.ell(30.6, 20.6, 4.2, 3.2, K.rad(29.8, 19.6, 0.4, 4.6, [[0, bl], [1, shade(bd, -10)]]));
    boneSeg([8, 22, 5.4, 30, 5, 38], 2.8); boneSeg([32, 22, 34.6, 30, 35, 38], 2.8);
    for (const x of [5, 35]) { K.ell(x, 40.2, 3.6, 2.8, K.rad(x - 0.8, 39.4, 0.4, 3.8, [[0, bl], [1, bd]])); for (let i = 0; i < 3; i++) K.ell(x - 2 + i * 2, 42.4, 0.9, 1, bone); }
    // the skull, too big, with lamplit sockets
    K.shape(q => { q.moveTo(13.2, 13.2); q.quadraticCurveTo(13, 5.2, 20, 5); q.quadraticCurveTo(27, 5.2, 26.8, 13.2); q.quadraticCurveTo(26.6, 16, 24.4, 16.6); q.lineTo(24, 19); q.lineTo(16, 19); q.lineTo(15.6, 16.6); q.quadraticCurveTo(13.4, 16, 13.2, 13.2); }, K.rad(18, 8, 0.6, 12, [[0, bl], [0.6, bone], [1, bd]]));
    K.ell(17.2, 12.4, 2.2, 2.4, gap); K.ell(22.8, 12.4, 2.2, 2.4, gap);
    K.eye(17.4, 12.6, 0.8, p.eye, true); K.eye(23, 12.6, 0.8, p.eye, true);
    K.poly([20, 14.2, 19, 16.2, 21, 16.2], gap);
    for (let i = 0; i < 5; i++) K.R(16.6 + i * 1.4, 17, 1, 1.8, i % 2 ? bone : bl, 0.3);
    K.line([16.6, 7.4, 18.4, 9.4, 17.6, 10.4], 0.4, bd);
  }

  /* ---------- the shapeless ---------- */
  function bogling(c, K, p) {
    const mud = p.mud, dk = shade(mud, -40);
    const body = K.shape(q => {
      q.moveTo(6, 51); q.quadraticCurveTo(4.6, 38, 10, 30); q.quadraticCurveTo(14, 19.6, 21, 20); q.quadraticCurveTo(29, 20.6, 31.6, 30); q.quadraticCurveTo(35.6, 40, 34.4, 51);
      for (let x = 34.4; x > 6; x -= 4.6) { q.quadraticCurveTo(x - 1.2, 53.6, x - 2.3, 51); q.quadraticCurveTo(x - 3.4, 49.6, x - 4.6, 51); }
    }, K.rad(17, 27, 1, 24, [[0, shade(mud, 34)], [0.55, mud], [1, dk]]));
    K.clip(body, () => {
      for (const [x, y, r] of [[12, 40, 1.6], [27, 44, 1.2], [16, 46, 1], [29, 34, 0.9]]) { K.ell(x, y, r, r, alpha('#000000', 0.25)); K.ell(x - r * 0.3, y - r * 0.3, r * 0.4, r * 0.4, alpha('#ffffff', 0.18)); }
      K.ell(15, 23.6, 6, 2, alpha('#ffffff', 0.18), -0.3);
    });
    // weed and moss hanging off it
    for (const [x, y, l] of [[11, 27.6, 7], [26.6, 25, 5], [31, 33, 6], [8, 36, 5]]) K.curve([x, y, x - 1, y + l / 2, x + 0.4, y + l], 1, p.moss);
    K.ell(19, 21.4, 4, 1.4, p.moss);
    // stubby arms
    K.ell(6.4, 41, 2.6, 4.2, shade(mud, -10), 0.3); K.ell(34, 40, 2.6, 4.2, shade(mud, -24), -0.3);
    // face
    if (K.real) {                                                   // heroic style: a wet, ragged maw, roots for teeth
      c.save(); c.filter = 'blur(' + (0.35 * c.getTransform().a) + 'px)'; K.ell(23, 34.6, 4.6, 2, 'rgba(14,8,4,.9)'); c.restore();
      for (const x of [20, 22.4, 24.6, 26]) K.line([x, 33.4, x + 0.3, 34.8 + (x % 2) * 0.4], 0.22, 'rgba(120,100,70,.8)');
      K.curve([18.6, 33.4, 23, 32.4, 27.6, 33.6], 0.3, 'rgba(160,140,110,.35)');
    } else {
      K.ell(23, 34.6, 5.6, 2.6, '#1a1008'); K.ell(23, 34, 4.4, 1.2, '#3a2010');
      for (const x of [19.6, 22.6, 25.8]) K.poly([x, 33, x + 0.6, 34.8, x + 1.2, 33], '#e8dcb0');
    }
    K.eye(20.4, 28.6, 1.4, p.eye, true); K.eye(26.6, 28.4, 1.2, p.eye, true);
  }

  function ooze(c, K, p) {
    const g = p.slime;
    const body = K.shape(q => {
      q.moveTo(5, 51); q.quadraticCurveTo(4.6, 43, 10, 38); q.quadraticCurveTo(13, 26, 20, 25.6); q.quadraticCurveTo(26, 25.8, 29, 34); q.quadraticCurveTo(35.6, 40, 35, 51);
      q.quadraticCurveTo(27, 53.4, 20, 52.2); q.quadraticCurveTo(12, 53.6, 5, 51);
    }, K.rad(17, 31, 1, 22, [[0, shade(g, 70)], [0.45, shade(g, 24)], [1, shade(g, -30)]]));
    K.clip(body, () => {
      // things caught inside: a bone, a coin, bubbles
      K.line([10, 46, 15.6, 43.6], 1.2, alpha('#e8e0c8', 0.55)); K.ell(9.8, 46.2, 1, 1, alpha('#e8e0c8', 0.55)); K.ell(15.8, 43.4, 1, 1, alpha('#e8e0c8', 0.55));
      K.ell(26.4, 46.4, 1.4, 0.9, alpha('#e8c14a', 0.6));
      for (const [x, y, r] of [[13, 34, 1.4], [24, 40.6, 1], [18, 47, 0.8], [29.6, 44, 0.7], [16.4, 39, 0.6]]) { c.strokeStyle = alpha('#ffffff', 0.45); c.lineWidth = 0.35; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.stroke(); K.ell(x - r * 0.35, y - r * 0.35, r * 0.3, r * 0.3, alpha('#ffffff', 0.6)); }
      K.ell(15.6, 29.6, 4, 1.6, alpha('#ffffff', 0.45), -0.5);
    });
    if (!K.real) { K.eye(19, 34.4, 1.2, '#1a2414'); K.eye(24, 34, 1.1, '#1a2414'); }      // a slime has no face (heroic style)
    // a drip down the front
    K.ell(29.8, 49.6, 1, 1.6, shade(g, 10));
  }

  /* ---------- lights and spirits: they hover, and glow ---------- */
  function flame(K, p, cx, top, r, bot) {
    // a teardrop: a round belly at (cx, bot - r) with a point curling up to (cx, top)
    return q => { q.moveTo(cx + (p.curl || 0), top); q.bezierCurveTo(cx + r * 0.9, top + (bot - top) * 0.32, cx + r * 1.1, bot - r * 0.9, cx, bot); q.bezierCurveTo(cx - r * 1.1, bot - r * 0.9, cx - r * 0.9, top + (bot - top) * 0.32, cx + (p.curl || 0), top); };
  }
  function spirit(c, K, p) {
    const col = p.col, core = p.core || '#ffffff';
    // the trailing wisp under it
    K.shape(q => { q.moveTo(16.4, 36); q.quadraticCurveTo(18.4, 43, 20.6, 46.6); q.quadraticCurveTo(21.8, 42.6, 23.6, 36); q.closePath(); }, K.lin(0, 36, 0, 47, [[0, col], [1, shade(col, -30)]]));
    // outer flame, inner flame, core: solid colour, brightest at the heart
    K.shape(flame(K, p, 20, 9, 10.4, 39), K.lin(0, 9, 0, 39, [[0, shade(col, 30)], [0.45, shade(col, 10)], [1, shade(col, -26)]]));
    K.shape(flame(K, p, 20.4, 13.6, 7.6, 37.4), K.lin(0, 13, 0, 38, [[0, shade(col, 60)], [1, shade(col, 34)]]));
    K.ell(20, 30.6, 6.6, 6.6, K.rad(20, 30.6, 0.5, 7, [[0, core], [0.5, alpha(core, 0.75)], [1, alpha(core, 0)]]));
    if (p.extra) p.extra(c, K);
    // a face: hollow eyes and a small mouth
    if (K.real) {                                                   // heroic style: two hollows in the fire, smoke for a face
      c.save(); c.filter = 'blur(' + (0.5 * c.getTransform().a) + 'px)';
      for (const x of [17.6, 22.6]) K.ell(x, 29.2, 1.1, 1.7, alpha(p.eyeCol || '#1a2440', 0.85));
      K.ell(20.1, 33.6, 1.6, 0.5, alpha(p.eyeCol || '#1a2440', 0.35)); c.restore();
      for (const x of [17.6, 22.6]) K.ell(x, 29.6, 0.3, 0.3, alpha(core, 0.8));
    } else {
      K.ell(17.4, 29.4, 1.5, 2.2, p.eyeCol || '#1a2440'); K.ell(22.8, 29.4, 1.5, 2.2, p.eyeCol || '#1a2440');
      K.ell(17, 28.6, 0.5, 0.6, 'rgba(255,255,255,.8)'); K.ell(22.4, 28.6, 0.5, 0.6, 'rgba(255,255,255,.8)');
      if (p.mouth) K.ell(20.2, 33.4, 1.4, p.mouth, p.eyeCol || '#1a2440');
    }
    return K => {                                                   // a halo and a pool of light, laid on after the outline
      K.pool(col, 0.45);
      K.ell(20, 29, 15, 17, K.rad(20, 29, 4, 17, [[0, alpha(col, 0.28)], [1, alpha(col, 0)]]));
      if (p.motes) p.motes(K);
    };
  }
  const motes = (col, list) => K => { for (const [x, y, r] of list) K.ell(x, y, r, r, K.rad(x, y, 0, r, [[0, '#ffffff'], [0.4, K.rgba(col, 0.9)], [1, K.rgba(col, 0)]])); };

  function shade_(c, K, p) {
    // a hooded ghost: a dome head on a ragged trailing cloak
    const col = p.col, dk = shade(col, -60);
    K.shape(q => {
      q.moveTo(10.6, 24); q.quadraticCurveTo(10.6, 10.6, 20, 10.4); q.quadraticCurveTo(29.4, 10.6, 29.4, 24); q.quadraticCurveTo(31, 33, 32.4, 42);
      q.lineTo(29.2, 39.6); q.lineTo(27.6, 46); q.lineTo(24.6, 41.6); q.lineTo(21.6, 48); q.lineTo(19, 41.6); q.lineTo(15.8, 46.4); q.lineTo(14.2, 40); q.lineTo(10.6, 44); q.lineTo(9.4, 38.6); q.quadraticCurveTo(9.6, 31, 10.6, 24);
    }, K.lin(0, 10, 0, 48, [[0, shade(col, 34)], [0.55, col], [1, shade(col, -50)]]));
    K.ell(20, 22, 7, 7.6, K.rad(20, 23, 0.5, 7.6, [[0, alpha('#06040c', 0.95)], [1, alpha(dk, 0.7)]]));   // the dark under the hood
    K.eye(17.4, 22.6, 1.1, p.eye, true); K.eye(22.8, 22.6, 1.1, p.eye, true);
    // reaching hands
    K.curve([11, 28, 6.6, 31, 5.4, 34.6], 1.6, shade(col, 10)); K.curve([29, 28, 33.4, 31, 34.6, 34.6], 1.6, shade(col, -10));
    return K => { K.pool(col, 0.35); K.ell(20, 26, 15, 18, K.rad(20, 26, 4, 18, [[0, alpha(col, 0.22)], [1, alpha(col, 0)]])); };
  }

  function mirror(c, K, p) {
    // a ghost of mirror glass: hard facets, bright edges, a reflection streak
    const col = p.col;
    const outline = q => { q.moveTo(20, 8.6); q.lineTo(28, 16); q.lineTo(30.4, 28); q.lineTo(28.4, 38.6); q.lineTo(24, 46); q.lineTo(20.6, 40.8); q.lineTo(16.4, 46); q.lineTo(11.8, 38.4); q.lineTo(9.6, 27.6); q.lineTo(12, 16); q.closePath(); };
    const shell = K.shape(outline, K.lin(10, 9, 30, 44, [[0, shade(col, 50)], [0.45, col], [0.55, shade(col, -40)], [1, shade(col, 10)]]));
    K.clip(shell, () => {
      const facets = [[20, 8.6, 28, 16, 20, 21], [12, 16, 20, 8.6, 20, 21], [12, 16, 20, 21, 9.6, 27.6], [28, 16, 30.4, 28, 20, 21], [9.6, 27.6, 20, 21, 15, 34], [20, 21, 30.4, 28, 25, 34], [15, 34, 25, 34, 20.6, 40.8], [11.8, 38.4, 15, 34, 9.6, 27.6], [25, 34, 30.4, 28, 28.4, 38.6]];
      facets.forEach((f, i) => K.poly(f, alpha(i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#5a6a9a' : '#c8d4f0', 0.22)));
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 0.35; for (const f of facets) { c.beginPath(); c.moveTo(f[0], f[1]); c.lineTo(f[2], f[3]); c.lineTo(f[4], f[5]); c.stroke(); }
      K.poly([13, 14, 16.6, 11, 12.4, 30, 10.6, 30], 'rgba(255,255,255,.55)');             // the reflection streak
    });
    K.ell(17.2, 24.4, 1.4, 1.9, '#141a30'); K.ell(22.8, 24.4, 1.4, 1.9, '#141a30');
    K.eye(17.2, 24.6, 0.55, p.eye, true); K.eye(22.8, 24.6, 0.55, p.eye, true);
    return (K, c) => {
      K.pool('#c8d8ff', 0.4);
      K.ell(20, 27, 14, 17, K.rad(20, 27, 4, 17, [[0, 'rgba(200,215,255,.2)'], [1, 'rgba(200,215,255,0)']]));
      for (const [x, y] of [[8.6, 14], [31.6, 20], [33, 34]]) { c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 0.35; c.beginPath(); c.moveTo(x - 1.4, y); c.lineTo(x + 1.4, y); c.moveTo(x, y - 1.4); c.lineTo(x, y + 1.4); c.stroke(); }
    };
  }

  function bat(c, K, p) {
    const b = p.body, wing = p.wing;
    const wingPath = s => q => {
      q.moveTo(20 + s * 3, 26); q.quadraticCurveTo(20 + s * 9, 16.4, 20 + s * 18, 18.6); q.lineTo(20 + s * 19, 21);
      q.quadraticCurveTo(20 + s * 16.6, 25, 20 + s * 17, 29.4); q.quadraticCurveTo(20 + s * 14.6, 27.6, 20 + s * 12.4, 30.4); q.quadraticCurveTo(20 + s * 10.4, 28.4, 20 + s * 7.8, 31.6); q.quadraticCurveTo(20 + s * 6, 29.4, 20 + s * 3, 31.6); q.closePath();
    };
    for (const s of [-1, 1]) {
      K.shape(wingPath(s), K.lin(20, 18, 20 + s * 19, 30, [[0, shade(wing, 10)], [1, shade(wing, -26)]]));
      K.line([20 + s * 3, 26, 20 + s * 12, 19.6, 20 + s * 18.4, 19.6], 0.7, shade(wing, -40));
      K.line([20 + s * 10.6, 20.4, 20 + s * 12.4, 30], 0.45, shade(wing, -36)); K.line([20 + s * 14.6, 19.6, 20 + s * 17, 29.2], 0.45, shade(wing, -36)); K.line([20 + s * 7.4, 22.6, 20 + s * 7.8, 31.4], 0.45, shade(wing, -36));
    }
    K.ell(20, 29, 4.4, 6, K.rad(19, 27, 0.5, 6.4, [[0, shade(b, 34)], [1, shade(b, -20)]]));
    K.poly([16.6, 24.6, 16.8, 18.4, 19.2, 23], shade(b, 6)); K.poly([20.8, 23, 23.2, 18.4, 23.4, 24.6], shade(b, -6));
    K.poly([17.4, 23.6, 17.6, 20.4, 18.6, 23], '#c87888'); K.poly([21.4, 23, 22.4, 20.4, 22.6, 23.6], '#c87888');
    K.ell(20, 25.6, 3.8, 3.2, K.rad(19.4, 24.6, 0.4, 4, [[0, shade(b, 40)], [1, b]]));
    K.eye(18.4, 25, 0.8, p.eye, true); K.eye(21.6, 25, 0.8, p.eye, true);
    K.poly([18.8, 27.4, 19.4, 29, 19.8, 27.4], '#ffffff'); K.poly([20.2, 27.4, 20.6, 29, 21.2, 27.4], '#ffffff');
    K.line([18.4, 34.4, 18, 36.4], 0.6, shade(b, -30)); K.line([21.6, 34.4, 22, 36.4], 0.6, shade(b, -30));
    return K => K.ell(20, 51.6, 6, 1.6, 'rgba(0,0,0,.3)');                               // its shadow far below
  }

  const P = {
    rat: (c, K) => rat(c, K, { fur: '#8a6e58' }),
    ratking: (c, K) => rat(c, K, { fur: '#6a5a6e', eye: '#e8343a', glow: true, crown: true }),
    bat: (c, K) => bat(c, K, { body: '#4a3a5c', wing: '#5c4878', eye: '#ffd84a' }),
    wolf: (c, K) => wolf(c, K, { fur: '#7c808e', light: '#c4c8d2', eye: '#ffd24a' }),
    alpha: (c, K) => wolf(c, K, { fur: '#b4b8c4', light: '#eef0f6', eye: '#ff4a3a', glow: true, mane: '#8a8e9c', scar: true, stripe: 'rgba(90,94,110,.45)' }),
    bear: (c, K) => bear(c, K, { fur: '#eef1f6', dark: '#9aa6bc' }),
    spider: (c, K) => spider(c, K, { body: '#3e3048', mark: '#b8344a', eye: '#ff4a5a' }),
    crab: (c, K) => crab(c, K, { shell: '#c24e34' }),
    eel: (c, K) => eel(c, K, { body: '#3e6a52', belly: '#b8c88a', fin: '#5a8a6a', eye: '#ffe04a' }),
    golem: (c, K) => golem(c, K, { stone: '#8e9098', glow: '#6ac8ff', moss: '#5a7a42' }),
    automaton: (c, K) => automaton(c, K, { brass: '#b8862e', eye: '#7ad8ff' }),
    colossus: (c, K) => colossus(c, K, { eye: '#ff9a3a' }),
    bogling: (c, K) => bogling(c, K, { mud: '#6e5634', moss: '#6a8a3a', eye: '#f0d040' }),
    ooze: (c, K) => ooze(c, K, { slime: '#6aa042' }),
    wisp: (c, K) => spirit(c, K, { col: '#4a8ae8', eyeCol: '#1a2a5a', mouth: 0.7 }),
    marshlight: (c, K) => spirit(c, K, { col: '#7ad04a', eyeCol: '#1e3a14', curl: 2, motes: motes('#a8f07a', [[7, 22, 1.8], [33, 16, 1.4], [31.6, 38, 1.2], [8.4, 38, 1]]) }),
    frostspirit: (c, K) => spirit(c, K, { col: '#8ad4f0', eyeCol: '#1a3a5a', curl: -1.4, mouth: 0.5,
      extra: (c2, K2) => { for (const [x, y, a] of [[11, 22, -0.6], [29, 22, 0.6], [20, 8, 0]]) { c2.save(); c2.translate(x, y); c2.rotate(a); K2.poly([0, -4, 1.4, 0, 0, 3, -1.4, 0], 'rgba(235,250,255,.9)'); c2.restore(); } },
      motes: motes('#e8f8ff', [[6, 18, 1.2], [34, 26, 1.4], [9, 40, 1], [32, 42, 0.9]]) }),
    ashwraith: (c, K) => spirit(c, K, { col: '#f06a1e', core: '#fff0b0', eyeCol: '#2a0a04', curl: 1.6, mouth: 1.1,
      extra: (c2, K2) => { for (const [x, y, h] of [[13.6, 20, 7], [26.6, 19, 8], [17, 13.4, 5]]) K2.shape(q => { q.moveTo(x, y - h); q.quadraticCurveTo(x + 2.4, y - h * 0.3, x + 1.6, y + 2); q.quadraticCurveTo(x - 1, y + 1, x, y - h); }, 'rgba(255,170,60,.85)'); },
      motes: motes('#ffb04a', [[8, 16, 1], [32, 12, 1.2], [34, 30, 0.8], [6, 30, 0.9], [27, 6, 0.8]]) }),
    shade: (c, K) => shade_(c, K, { col: '#8a72c8', eye: '#d8c8ff' }),
    mirrorshade: (c, K) => mirror(c, K, { col: '#9aa8c8', eye: '#e8f0ff' }),
  };

  // where each beast's face is, for the turn-order chips: [x, y, size] in the 40x64 layout
  const FACE = { rat: [24, 30, 16], ratking: [23, 27, 18], bat: [9, 14, 22], wolf: [24, 16, 17], alpha: [23, 15, 18], bear: [24, 21, 18], spider: [17, 29, 17],
    crab: [7, 20, 26], eel: [19, 11, 18], golem: [10, 9, 20], automaton: [10, 5, 20], colossus: [9, 3, 22], bogling: [10, 18, 22], ooze: [9, 24, 22],
    wisp: [9, 14, 22], marshlight: [9, 14, 22], frostspirit: [9, 12, 22], ashwraith: [9, 13, 22], shade: [9, 11, 22], mirrorshade: [9, 12, 22] };
  B.beastFace = name => FACE[name] || null;
  B.paintKit = kit;
  // the beasts with fur or hair, and which way it lies (radians): the heroic finish strokes it in
  const FURRED = { rat: 0.3, ratking: 0.3, wolf: 0.25, alpha: 0.25, bear: 0.2, bat: 1.4, spider: 1.2 };
  B.beastPainter = function (name) {
    const fn = P[name]; if (!fn) return null;
    // heroic style: the beast on its own layer, then the heroes' finish over it: fur or hide grain, the warm key light,
    // the cool rim from behind, and a soft contact shadow (pieces.js gives it the heroes' thinner outline)
    if (B.figHeroic && B.figHeroic() && B.heroicKit) return c => {
      let seed = 11; for (const ch of name) seed = (seed * 31 + ch.charCodeAt(0)) % 2147483000;
      const H = B.heroicKit(c, seed + 3), K = kit(H.c); K.real = true; H.c.save(); H.c.lineJoin = 'round'; H.c.lineCap = 'round';
      const real = B.REAL_BEASTS && B.REAL_BEASTS[name];          // the animals have their own realistic painters (beasts2.js)
      const after = real ? real(H.c, K, H) : fn(H.c, K); H.c.restore();
      H.finish({ wear: FURRED[name] && !real ? 'fur' : 'cloth', fur: real ? null : FURRED[name], real: true, shadowW: (FACE[name] && FACE[name][2] > 24) ? 14 : 11 });
      return after ? (c2 => { c2.save(); c2.lineCap = 'round'; after(kit(c2), c2); c2.restore(); }) : null;
    };
    // paints into c (already scaled to the 40x64 layout); returns the after-pass, if any, to draw on the outlined piece
    return c => { const K = kit(c); c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; const after = fn(c, K); c.restore(); return after ? (c2 => { c2.save(); c2.lineCap = 'round'; after(kit(c2), c2); c2.restore(); }) : null; };
  };
})();
