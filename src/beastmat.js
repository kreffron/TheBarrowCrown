/* Beasts, heroic style: surface materials laid over each creature's own layer (clipped to it by source-atop in
   B.beastPainter): chitin sheen and pitting, scales, scratched and grimy metal, cracked and stained bone, wet mud,
   a slime's depth. Coordinates are the 40x64 layout. */
(function () {
  const M = {}, { alpha, shade } = B.fig;
  const speck = (K, H, box, n, cols, r) => { for (let i = 0; i < n; i++) K.ell(box[0] + H.rr() * box[2], box[1] + H.rr() * box[3], (r || 0.08) * (0.5 + H.rr()), (r || 0.08) * (0.4 + H.rr() * 0.8), cols[i % cols.length]); };
  const crack = (K, H, x, y, len, w, col) => { const pts = [x, y]; let a = H.rr() * 6.28; for (let k = 0; k < 4; k++) { a += (H.rr() - 0.5) * 1.4; x += Math.cos(a) * len / 4; y += Math.sin(a) * len / 4; pts.push(x, y); } K.line(pts, w, col); return pts; };
  // shells: a lacquered sheen in arcs, pits and nicks, a pale rim where the light catches the edge
  const chitin = (box, arcs) => (c, K, H) => {
    for (const [x, y, rx, ry] of arcs) { H.soft(0.35, () => K.ell(x, y, rx, ry, 'rgba(255,255,255,.22)')); H.soft(0.12, () => K.ell(x - rx * 0.2, y - ry * 0.3, rx * 0.35, ry * 0.25, 'rgba(255,255,255,.5)')); }
    speck(K, H, box, 120, ['rgba(0,0,0,.22)', 'rgba(255,240,230,.18)'], 0.12);
    for (let i = 0; i < 6; i++) crack(K, H, box[0] + H.rr() * box[2], box[1] + H.rr() * box[3], 1.2, 0.07, 'rgba(0,0,0,.35)');
  };
  M.crab = chitin([3, 26, 34, 18], [[18, 30.4, 5.4, 1.6], [6.4, 27, 1.6, 1.2], [31.6, 27, 1.6, 1.2]]);
  M.spider = chitin([6, 28, 28, 14], [[15, 31, 3.4, 1.4], [24.4, 35, 1.6, 0.9]]);
  // the eel: rows of small scales over the back, a slick light down its length
  M.eel = (c, K, H) => {
    for (let y = 12; y < 50; y += 0.9) for (let x = 14; x < 30; x += 1.1) { const xo = x + ((y * 10) % 2 ? 0.55 : 0); c.strokeStyle = 'rgba(0,0,0,.16)'; c.lineWidth = 0.07; c.beginPath(); c.arc(xo, y, 0.55, 0.3, 2.85); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.arc(xo, y - 0.12, 0.5, 3.6, 5.8); c.stroke(); }
    H.soft(0.5, () => K.curve([20, 44, 18.8, 34, 21.6, 22, 23.6, 14], 0.7, 'rgba(255,255,255,.22)'));
  };
  // the automaton: brushed scratches, a grime of oil in the seams, rust blooms, worn bright edges
  M.automaton = (c, K, H) => {
    for (let i = 0; i < 260; i++) { const x = 10 + H.rr() * 20, y = 8 + H.rr() * 44, a = 1.57 + (H.rr() - 0.5) * 0.5, l = 0.3 + H.rr() * 0.9; K.line([x, y, x + Math.cos(a) * l, y + Math.sin(a) * l], 0.035, H.rr() > 0.5 ? 'rgba(255,250,220,.3)' : 'rgba(40,20,0,.25)'); }
    for (const [x, y, r] of [[14.6, 30, 1.6], [25.4, 22, 1.2], [17, 44, 1.4], [22.6, 37, 1.0], [12.6, 21, 0.9]]) { H.soft(0.4, () => K.ell(x, y, r, r * 0.8, 'rgba(140,60,20,.35)')); speck(K, H, [x - r, y - r, 2 * r, 2 * r], 18, ['rgba(120,50,10,.5)', 'rgba(200,110,40,.4)'], 0.12); }
    for (const x of [15.4, 24.6]) H.soft(0.3, () => K.line([x, 22, x + 0.2, 34], 0.4, 'rgba(30,16,4,.28)'));
  };
  // the bone colossus: hairline cracks, an old yellow stain in the hollows, chips
  M.colossus = (c, K, H) => {
    for (let i = 0; i < 18; i++) crack(K, H, 12 + H.rr() * 16, 2 + H.rr() * 46, 1.6, 0.06, 'rgba(60,40,20,.5)');
    for (const [x, y, r] of [[20, 4, 3], [20, 20, 3.4], [20, 33, 3], [14, 26, 1.6], [26, 26, 1.6]]) H.soft(0.8, () => K.ell(x, y, r, r * 0.8, 'rgba(150,120,60,.2)'));
    speck(K, H, [12, 0, 16, 50], 140, ['rgba(110,90,60,.25)', 'rgba(255,255,240,.25)'], 0.09);
  };
  // the golem: chipped edges and lichen speckle on top of its own cracks
  M.golem = (c, K, H) => { speck(K, H, [8, 8, 24, 42], 200, ['rgba(0,0,0,.2)', 'rgba(255,255,255,.18)', 'rgba(110,140,80,.3)'], 0.13); for (let i = 0; i < 8; i++) crack(K, H, 10 + H.rr() * 20, 12 + H.rr() * 36, 1.8, 0.08, 'rgba(0,0,0,.35)'); };
  // the bogling: wet mud, a shine on the bulges, drips, pebbles and roots in it
  M.bogling = (c, K, H) => {
    for (const [x, y, rx, ry] of [[16, 26, 3, 1.4], [26, 32, 2.4, 1.2], [13, 40, 2, 1]]) H.soft(0.4, () => K.ell(x, y, rx, ry, 'rgba(255,250,220,.22)'));
    speck(K, H, [6, 18, 28, 32], 160, ['rgba(30,18,6,.3)', 'rgba(200,170,120,.22)'], 0.13);
    for (let i = 0; i < 9; i++) { const x = 9 + H.rr() * 22, y = 34 + H.rr() * 12; K.line([x, y, x + (H.rr() - 0.5) * 0.3, y + 1 + H.rr() * 1.6], 0.35, 'rgba(50,34,14,.45)'); }
    for (let i = 0; i < 5; i++) { const x = 9 + H.rr() * 22, y = 22 + H.rr() * 22; K.curve([x, y, x + 0.8, y + 0.6, x + 1.6, y + 0.2], 0.1, 'rgba(60,40,20,.6)'); }
  };
  // the ooze: depth inside it, a few things suspended, a hard specular on top
  M.ooze = (c, K, H) => {
    H.soft(1.6, () => K.ell(20, 40, 8, 5, 'rgba(10,40,0,.28)'));
    for (const [x, y, r] of [[16, 40, 0.5], [24, 36, 0.4], [21, 44, 0.6], [13, 44, 0.35], [27, 42, 0.45]]) { K.ell(x, y, r, r, 'rgba(255,255,255,.22)'); K.ell(x - r * 0.3, y - r * 0.3, r * 0.3, r * 0.3, 'rgba(255,255,255,.7)'); }
    K.ell(23.6, 46, 0.7, 0.4, 'rgba(240,230,200,.35)');
  };
  // the rats, wolves and bear: a few longer guard hairs catching the light, and a damp nose shine is in their painters
  B.beastMat = M;
})();
