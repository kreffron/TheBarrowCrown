/* Heroes: the four party members as battle pieces, painted in full: Runa's fur mantle and great axe, Dask's hood,
   scarf and knives, Maren's robes, tabard and lantern, Finch's plumed hat, doublet and lute. Same 40x64 layout as
   every piece: base top at (20, 52), facing the viewer and a little to the right. The head is drawn a size up
   (HEAD) so the four stay easy to tell apart at board size. Anyone else built from a character spec is still drawn
   by B.piece from that spec. Uses the drawing kit from beasts.js. */
(function () {
  const HEAD = 1.14;
  const bigHead = c => { c.save(); c.translate(20, 20); c.scale(HEAD, HEAD); c.translate(-20, -20); };
  function rgb(col) {                                               // '#rrggbb' or 'rgb(r,g,b)'
    if (col[0] !== '#') return (col.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number);
    const n = parseInt(col.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255];
  }
  function shade(hex, d) { const [r, g, b] = rgb(hex), f = v => Math.max(0, Math.min(255, v + d)); return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')'; }
  function alpha(hex, a) { const [r, g, b] = rgb(hex); return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; }
  const INK = '#1a1420', STEEL = '#b4b8c4', STEEL_L = '#f2f5fc', STEEL_D = '#5a5e6c', GOLD = '#e8c14a', GOLD_D = '#9a7420', BRONZE = '#c08040';

  // a cloth or leather panel: lit from the upper left
  const cloth = (K, x0, x1, col, a, b) => K.lin(x0, 0, x1, 0, [[0, shade(col, a == null ? 26 : a)], [0.45, col], [1, shade(col, b == null ? -38 : b)]]);
  // a limb as a tapering, shaded stroke
  function limb(K, c, pts, w0, w1, col, lit) {
    const n = pts.length / 2;
    for (let i = 0; i < n - 1; i++) {
      const x0 = pts[i * 2], y0 = pts[i * 2 + 1], x1 = pts[i * 2 + 2], y1 = pts[i * 2 + 3];
      const t0 = i / (n - 1), t1 = (i + 1) / (n - 1), wa = w0 + (w1 - w0) * t0, wb = w0 + (w1 - w0) * t1;
      const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      c.fillStyle = col; c.beginPath(); c.moveTo(x0 + nx * wa / 2, y0 + ny * wa / 2); c.lineTo(x1 + nx * wb / 2, y1 + ny * wb / 2); c.lineTo(x1 - nx * wb / 2, y1 - ny * wb / 2); c.lineTo(x0 - nx * wa / 2, y0 - ny * wa / 2); c.closePath(); c.fill();
      K.ell(x0, y0, wa / 2, wa / 2, col);
      if (lit) { c.strokeStyle = lit; c.lineWidth = Math.min(wa, wb) * 0.28; c.beginPath(); c.moveTo(x0 + nx * wa * 0.26, y0 + ny * wa * 0.26); c.lineTo(x1 + nx * wb * 0.26, y1 + ny * wb * 0.26); c.stroke(); }
    }
    K.ell(pts[pts.length - 2], pts[pts.length - 1], w1 / 2, w1 / 2, col);
  }
  // a face, three-quarters to the right
  function face(K, c, o) {
    const { x, y, r, skin } = o, sD = shade(skin, -34), sL = shade(skin, 22);
    K.ell(x - r * 0.92, y + 0.6, r * 0.24, r * 0.34, sD);                                   // ear
    K.ell(x, y, r, r * 1.06, K.rad(x - r * 0.3, y - r * 0.4, r * 0.1, r * 1.2, [[0, sL], [0.6, skin], [1, sD]]));
    K.ell(x + 0.2, y + r * 0.78, r * 0.62, r * 0.32, alpha('#000000', 0.05));                 // jaw shadow
    if (o.blush !== false) { K.ell(x - r * 0.42, y + r * 0.38, r * 0.24, r * 0.16, 'rgba(230,110,100,.28)'); K.ell(x + r * 0.62, y + r * 0.36, r * 0.2, r * 0.14, 'rgba(230,110,100,.28)'); }
    const ex = [x - r * 0.3, x + r * 0.42], ey = y + r * 0.08;
    if (o.paint) for (const e of [x - r * 0.3, x + r * 0.42]) for (const k of [-0.16, 0.16]) K.line([e + k * r - r * 0.06, ey + r * 0.3, e + k * r + r * 0.02, ey + r * 0.62], r * 0.12, o.paint);
    for (const e of ex) { K.ell(e, ey, r * 0.17, r * 0.23, o.eye || '#241820'); K.ell(e - r * 0.05, ey - r * 0.08, r * 0.06, r * 0.07, 'rgba(255,255,255,.95)'); }
    // brows
    const bt = o.brow || 0, bc = o.browCol || shade(o.hair || '#3a2a20', -20);
    K.line([ex[0] - r * 0.2, ey - r * 0.32 - bt * 0.1, ex[0] + r * 0.18, ey - r * 0.3 + bt * 0.2], r * 0.12, bc);
    K.line([ex[1] - r * 0.18, ey - r * 0.3 + bt * 0.2, ex[1] + r * 0.2, ey - r * 0.32 - bt * 0.1], r * 0.12, bc);
    // nose and mouth
    K.line([x + r * 0.16, ey + r * 0.06, x + r * 0.3, ey + r * 0.34, x + r * 0.12, ey + r * 0.4], r * 0.08, sD);
    if (o.mouth === 'grin') {
      const m = K.shape(q => { q.moveTo(x - r * 0.24, y + r * 0.5); q.quadraticCurveTo(x + r * 0.16, y + r * 0.58, x + r * 0.56, y + r * 0.46); q.quadraticCurveTo(x + r * 0.42, y + r * 0.96, x + r * 0.12, y + r * 0.94); q.quadraticCurveTo(x - r * 0.16, y + r * 0.9, x - r * 0.24, y + r * 0.5); }, '#6a2028');
      K.clip(m, () => { K.R(x - r * 0.3, y + r * 0.44, r * 0.9, r * 0.18, '#fff8f0', 0); K.ell(x + r * 0.14, y + r * 0.92, r * 0.26, r * 0.14, '#d86a6a'); });
    }
    else if (o.mouth === 'set') K.line([x - r * 0.12, y + r * 0.66, x + r * 0.4, y + r * 0.62], r * 0.09, shade(skin, -70));
    else K.curve([x - r * 0.12, y + r * 0.6, x + r * 0.12, y + r * 0.74, x + r * 0.4, y + r * 0.58], r * 0.08, shade(skin, -60));
    if (o.lines) { K.curve([x - r * 0.6, ey + r * 0.05, x - r * 0.72, ey + r * 0.1, x - r * 0.66, ey + r * 0.22], r * 0.05, alpha('#5a3020', 0.5)); K.curve([x + r * 0.04, y + r * 0.42, x - r * 0.06, y + r * 0.55, x - r * 0.04, y + r * 0.68], r * 0.05, alpha('#5a3020', 0.4)); }
  }
  function boot(K, x, y, w, h, col, toe) {
    K.R(x, y, w, h, K.lin(x, 0, x + w, 0, [[0, shade(col, 24)], [1, shade(col, -30)]]), [1.2, 1.2, 0.8, 0.8]);
    K.ell(x + w / 2 + (toe || 0.6), y + h - 0.4, w * 0.62, 1.1, shade(col, -14));
    K.ell(x + w * 0.35, y + 1.2, w * 0.22, 0.5, 'rgba(255,255,255,.22)');
  }

  /* ---------- Runa: barbarian ---------- */
  function runa(c, K) {
    const skin = '#e0a67c', hair = '#c8572e', hide = '#7a5636', leather = '#5a3a24', fur = '#e8dcc0', woad = '#3a6ab8';
    // braids behind the shoulders
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) K.ell(20 + s * 5.4, 18 + i * 2.2, 1.7 - i * 0.08, 1.3, i % 2 ? shade(hair, -26) : shade(hair, -10));
    // the great axe, haft behind the right hand
    K.R(30.4, 4, 1.8, 44, K.lin(30.4, 0, 32.2, 0, [[0, '#a8805a'], [1, '#5a3a20']]), 0.8);
    for (const y of [12.4, 15, 36, 38.2]) K.R(30, y, 2.6, 1.2, leather, 0.4);
    K.shape(q => { q.moveTo(32, 5); q.quadraticCurveTo(39.6, 2.8, 39.4, 9); q.quadraticCurveTo(39.6, 15, 32, 13.6); q.closePath(); }, K.lin(32, 4, 39.6, 14, [[0, STEEL_L], [0.5, STEEL], [1, STEEL_D]]));
    K.shape(q => { q.moveTo(30.6, 5.6); q.quadraticCurveTo(25, 4.4, 24.6, 9); q.quadraticCurveTo(25, 13.4, 30.6, 12.6); q.closePath(); }, K.lin(24.6, 4, 30.6, 13, [[0, STEEL], [1, STEEL_D]]));
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(38.8, 4.8); c.quadraticCurveTo(39.4, 9, 38.8, 13.2); c.stroke();
    K.ell(31.3, 3.6, 1.2, 1.2, BRONZE); K.R(30.2, 8, 2.2, 1.8, BRONZE, 0.4);
    // boots, legs, hide kilt
    K.R(15, 38, 4.6, 10, cloth(K, 15, 19.6, '#4a3b2e'), 1.2); K.R(20.6, 38, 4.6, 10, cloth(K, 20.6, 25.2, '#4a3b2e', 6), 1.2);
    boot(K, 14.4, 45.4, 5.4, 6.2, '#5a3e28', -0.4); boot(K, 20.4, 45.4, 5.4, 6.2, '#4a3220', 0.8);
    K.R(13.8, 44.6, 6, 1.8, fur, 0.9); K.R(19.8, 44.6, 6, 1.8, shade(fur, -16), 0.9);
    K.shape(q => { q.moveTo(12.6, 32.6); q.lineTo(27.6, 32.6); q.lineTo(29.6, 41); q.lineTo(26.8, 39.6); q.lineTo(24.6, 42); q.lineTo(22.2, 39.8); q.lineTo(20, 42.4); q.lineTo(17.8, 39.8); q.lineTo(15.4, 42); q.lineTo(13.2, 39.6); q.lineTo(10.6, 41); q.closePath(); }, cloth(K, 10.6, 29.6, hide));
    for (const x of [15.2, 20, 24.8]) K.line([x, 33.6, x + (x - 20) * 0.12, 39.4], 0.3, alpha('#2a1a10', 0.5));
    // torso: hide cuirass with lacing, a strap and a bronze buckle
    const torso = K.shape(q => { q.moveTo(12, 22); q.quadraticCurveTo(20, 20, 28, 22); q.quadraticCurveTo(28.8, 28, 27.4, 33.4); q.lineTo(12.6, 33.4); q.quadraticCurveTo(11.2, 28, 12, 22); }, cloth(K, 11, 29, leather, 30, -30));
    K.clip(torso, () => { K.line([15.4, 21, 25.6, 34], 1.6, shade(hide, -10)); for (let y = 24; y < 32; y += 1.8) K.line([18.8, y, 21.2, y + 0.9], 0.3, '#d8c8a0'); K.ell(16, 24, 3.6, 1.2, 'rgba(255,255,255,.14)'); });
    K.R(11.6, 31.6, 16.8, 2.4, '#3a2a1e', 0.6); K.ell(20, 32.8, 1.8, 1.5, K.rad(19.4, 32.3, 0.2, 1.9, [[0, '#ffd890'], [1, BRONZE]])); K.ell(20, 32.8, 0.7, 0.6, '#5a3a1a');
    // arms: bare, painted with woad, leather bracers
    limb(K, c, [11.6, 23.4, 9.8, 29, 9.6, 34.6], 4, 3, skin, 'rgba(255,230,200,.5)');
    K.R(8, 30, 3.6, 3.4, leather, 0.8); for (const y of [30.8, 32.4]) K.line([8.2, y, 11.4, y], 0.3, '#c8a878');
    K.line([10.2, 25.4, 12.4, 26.2], 0.6, woad); K.line([10, 26.8, 12.2, 27.6], 0.6, woad);
    K.ell(9.7, 35.6, 1.9, 1.7, shade(skin, -6));
    limb(K, c, [28.4, 23.4, 30.4, 28, 31.2, 32], 4, 3, shade(skin, -10), 'rgba(255,230,200,.35)');
    K.R(29.4, 28.4, 3.6, 3.2, shade(leather, -10), 0.8);
    K.line([28.4, 25.4, 30.6, 24.8], 0.6, woad);
    K.ell(31.2, 33, 2, 1.8, shade(skin, -14)); K.line([29.6, 32.2, 32.8, 32.4], 0.3, shade(skin, -50));
    // fur mantle over the shoulders
    K.shape(q => { q.moveTo(9.4, 24.6); q.quadraticCurveTo(10, 19.6, 15, 19); q.lineTo(25, 19); q.quadraticCurveTo(30, 19.6, 30.6, 24.6); q.lineTo(29, 23.4); q.lineTo(28, 25.6); q.lineTo(26.6, 23.6); q.lineTo(25.2, 25.4); q.lineTo(23.4, 23.4); q.lineTo(21.8, 24.6); q.lineTo(20, 23.2); q.lineTo(18.2, 24.6); q.lineTo(16.6, 23.4); q.lineTo(14.8, 25.4); q.lineTo(13.4, 23.6); q.lineTo(12, 25.6); q.lineTo(11, 23.4); q.closePath(); }, K.lin(0, 19, 0, 26, [[0, '#fff8e8'], [1, shade(fur, -30)]]));
    for (let i = 0; i < 8; i++) K.line([11.6 + i * 2.4, 20.6 + (i % 2) * 0.6, 12.2 + i * 2.4, 22.4], 0.3, alpha('#8a7a5a', 0.6));
    K.ell(14.4, 21.6, 1.2, 1.1, K.rad(14, 21.2, 0.1, 1.3, [[0, '#ffe2a0'], [1, BRONZE]]));     // the cloak pin
    // head: wild red hair, braids forward, blue warpaint, a hard look
    bigHead(c);
    K.R(18.2, 17.4, 3.8, 3, shade(skin, -24), 1);
    K.ell(20, 12.4, 6.6, 6, K.rad(18, 10, 0.5, 7, [[0, shade(hair, 30)], [1, shade(hair, -16)]]));
    face(K, c, { x: 20.3, y: 13.6, r: 4.9, skin, hair, mouth: 'set', brow: 2.4, paint: alpha(woad, 0.8), browCol: '#8a2e18' });
    K.shape(q => { q.moveTo(14.6, 13); q.quadraticCurveTo(15, 7, 20.6, 7.2); q.quadraticCurveTo(26, 7.2, 25.8, 12); q.quadraticCurveTo(23.6, 9.6, 21.4, 10.6); q.quadraticCurveTo(19, 9.2, 17.2, 11); q.quadraticCurveTo(15.6, 11, 14.6, 13); }, K.lin(0, 7, 0, 13, [[0, shade(hair, 36)], [1, hair]]));
    for (const s of [-1, 1]) { for (let i = 0; i < 6; i++) K.ell(20 + s * 5.6 + (s > 0 ? 0.6 : 0), 15.6 + i * 2.1, 1.5 - i * 0.07, 1.2, K.rad(20 + s * 5.6 - 0.4, 15.2 + i * 2.1, 0.1, 1.6, [[0, shade(hair, 30)], [1, shade(hair, -14)]])); K.R(20 + s * 5.6 - 0.8 + (s > 0 ? 0.6 : 0), 27.6, 1.6, 1.4, GOLD, 0.5); }
    c.restore();
  }

  /* ---------- Dask: rogue ---------- */
  function dask(c, K) {
    const skin = '#e8c09a', cloak = '#2f4a3c', jerkin = '#4a3a2e', scarf = '#9a3030', dark = '#262230';
    // cloak behind, ragged at the hem
    K.shape(q => { q.moveTo(12.6, 20); q.quadraticCurveTo(7, 32, 7.4, 47); q.lineTo(9.8, 45.4); q.lineTo(11.4, 48.6); q.lineTo(13.6, 46); q.lineTo(15.6, 48.4); q.lineTo(26, 48.4); q.lineTo(28, 46.2); q.lineTo(30.2, 48.4); q.lineTo(31.8, 45.2); q.lineTo(33.4, 46.8); q.quadraticCurveTo(33, 32, 27.4, 20); q.closePath(); }, K.lin(7, 0, 33, 0, [[0, shade(cloak, 6)], [0.5, shade(cloak, -20)], [1, shade(cloak, -40)]]));
    // legs wrapped in strips, soft boots
    K.R(15.6, 36, 4, 11, cloth(K, 15.6, 19.6, dark), 1.2); K.R(20.4, 36, 4, 11, cloth(K, 20.4, 24.4, dark, 4), 1.2);
    for (let y = 38; y < 44; y += 1.6) { K.line([15.8, y, 19.4, y + 0.8], 0.35, alpha('#8a7a6a', 0.7)); K.line([20.6, y + 0.8, 24.2, y], 0.35, alpha('#8a7a6a', 0.6)); }
    boot(K, 15, 45.2, 4.8, 6.4, '#4a3a2a', -0.6); boot(K, 20.2, 45.2, 4.8, 6.4, '#3e3022', 0.8);
    // jerkin: dark leather, a bandolier of throwing knives
    const torso = K.shape(q => { q.moveTo(13.4, 22); q.quadraticCurveTo(20, 20.4, 26.6, 22); q.quadraticCurveTo(27.4, 30, 26, 37.4); q.lineTo(14, 37.4); q.quadraticCurveTo(12.6, 30, 13.4, 22); }, cloth(K, 12.6, 27.4, jerkin, 28, -34));
    K.clip(torso, () => {
      K.line([20, 21.4, 20, 37.4], 0.35, alpha('#000000', 0.4));
      for (let y = 24; y < 36; y += 2.6) { K.ell(18.6, y, 0.4, 0.4, '#a89070'); K.ell(21.4, y, 0.4, 0.4, '#a89070'); }
      K.line([14, 23, 26.4, 34.6], 2.2, '#2a201a'); K.line([14, 23, 26.4, 34.6], 0.4, '#5a4a3a');
      for (let i = 0; i < 4; i++) { const x = 16 + i * 2.6, y = 24.8 + i * 2.4; K.poly([x - 0.5, y, x + 0.5, y, x + 0.9, y - 3.2, x + 0.1, y - 4], STEEL_L); K.R(x - 0.6, y - 0.4, 1.2, 1.8, '#3a2a1e', 0.3); }
    });
    K.R(13.6, 35, 12.8, 2.2, '#2a1e16', 0.6); K.R(18.6, 34.6, 2.6, 3, '#8a8e98', 0.5); K.R(23.4, 35.6, 3, 3.4, shade(jerkin, 8), 0.8); K.R(13.8, 35.8, 2.8, 3, shade(jerkin, -6), 0.8);
    // arms: forward, a dagger in each hand held point down
    limb(K, c, [13.6, 23.6, 11.4, 28.6, 12.6, 32.6], 3.4, 2.8, shade(cloak, 4), 'rgba(200,230,210,.25)');
    K.ell(12.6, 33.4, 1.6, 1.5, '#3a2e28');
    K.poly([12.1, 34.4, 13.1, 34.4, 12.2, 41.4, 11.6, 40.6], K.lin(11, 0, 13, 0, [[0, STEEL_L], [1, STEEL_D]])); K.R(10.6, 33.8, 3.8, 0.9, GOLD_D, 0.3);
    limb(K, c, [26.4, 23.6, 28.8, 28, 28.4, 32], 3.4, 2.8, shade(cloak, -18), null);
    K.ell(28.4, 32.8, 1.6, 1.5, '#2e2420');
    K.poly([27.8, 33.8, 28.8, 33.8, 29.6, 40.6, 29, 41.2], K.lin(28, 0, 30, 0, [[0, STEEL_L], [1, STEEL_D]])); K.R(26.6, 33.2, 3.8, 0.9, GOLD_D, 0.3);
    // scarf wrapped high, its tail blowing back
    bigHead(c);
    K.shape(q => { q.moveTo(15.8, 18); q.quadraticCurveTo(10, 20, 6.6, 26.6); q.quadraticCurveTo(10.4, 24.6, 12.4, 25.4); q.quadraticCurveTo(13.6, 22.4, 16.6, 21.4); q.closePath(); }, K.lin(6, 0, 16, 0, [[0, shade(scarf, -30)], [1, scarf]]));
    // hood, deep, with the face in shadow
    K.shape(q => { q.moveTo(12.2, 21.6); q.quadraticCurveTo(11.6, 10, 18.6, 6.8); q.quadraticCurveTo(21.6, 5.6, 22.4, 4.6); q.quadraticCurveTo(23.4, 7, 25.6, 9.6); q.quadraticCurveTo(28.6, 13.6, 27.8, 21.6); q.quadraticCurveTo(20, 23.4, 12.2, 21.6); }, K.rad(17, 9, 0.5, 15, [[0, shade(cloak, 30)], [0.6, cloak], [1, shade(cloak, -30)]]));
    K.ell(20.6, 15, 5, 5.4, K.rad(20.6, 14.4, 0.3, 5.6, [[0, '#0e0c12'], [1, shade(cloak, -46)]]));
    K.ell(20.8, 15.4, 3.6, 3.4, K.rad(21, 15.2, 0.2, 3.8, [[0, shade(skin, -40)], [1, shade(skin, -90)]]));
    for (const ex of [19.2, 22.6]) { K.ell(ex, 14.6, 0.75, 0.5, '#f0f4e8'); K.ell(ex + 0.2, 14.6, 0.36, 0.42, '#3a6a4a'); }
    K.line([18.2, 13.4, 20, 13.8], 0.35, '#0a0a0a'); K.line([21.8, 13.8, 23.6, 13.2], 0.35, '#0a0a0a');
    K.shape(q => { q.moveTo(16.2, 17.6); q.quadraticCurveTo(18.6, 16.6, 21.2, 15.6); q.quadraticCurveTo(23.6, 16.4, 25.4, 17.6); q.quadraticCurveTo(26.8, 20, 25.8, 22); q.quadraticCurveTo(20.4, 23.6, 14.8, 21.8); q.quadraticCurveTo(14.4, 19.4, 16.2, 17.6); }, K.rad(19.6, 17.4, 0.4, 7, [[0, shade(scarf, 26)], [1, shade(scarf, -30)]]));
    K.curve([15.4, 19.6, 20.4, 18.6, 25.8, 19.8], 0.35, alpha('#000000', 0.3)); K.curve([15.2, 21.2, 20.4, 20.8, 25.8, 21.4], 0.35, alpha('#000000', 0.22)); K.ell(20.6, 17.4, 1.4, 0.4, 'rgba(255,255,255,.2)');
    K.curve([14.6, 11, 17.4, 7.8, 21.6, 6.2], 0.4, 'rgba(255,255,255,.2)');
    c.restore();
  }

  /* ---------- Maren: cleric ---------- */
  function maren(c, K) {
    const skin = '#c98e62', hair = '#b4b8c2', robe = '#ece4cc', mantle = '#8a7a5a', tabard = '#7a2f3a';
    // mantle hood behind the head
    K.ell(20, 19, 8.4, 5, shade(mantle, -24));
    // robe, flaring to the floor, gold hem
    const robeP = K.shape(q => { q.moveTo(13.4, 22); q.quadraticCurveTo(20, 20.4, 26.6, 22); q.quadraticCurveTo(28, 36, 30.8, 50.4); q.quadraticCurveTo(20, 52.2, 9.2, 50.4); q.quadraticCurveTo(12, 36, 13.4, 22); }, cloth(K, 9, 31, robe, 14, -40));
    K.clip(robeP, () => {
      for (const x of [13.6, 17, 24.4, 27.4]) K.line([x + (x - 20) * 0.1, 36, x + (x - 20) * 0.4, 51], 0.5, alpha('#8a7a5a', 0.35));
      K.shape(q => { q.moveTo(8, 49); q.quadraticCurveTo(20, 50.8, 32, 49); q.lineTo(32, 53); q.lineTo(8, 53); q.closePath(); }, K.lin(0, 49, 0, 52, [[0, '#ffe58a'], [1, GOLD_D]]));
    });
    // tabard with the lamp sign
    K.shape(q => { q.moveTo(16.4, 22); q.lineTo(23.6, 22); q.lineTo(24.4, 44); q.lineTo(20, 46.4); q.lineTo(15.6, 44); q.closePath(); }, cloth(K, 15.6, 24.4, tabard, 22, -30));
    K.line([16.4, 22.6, 15.8, 43.6, 20, 45.8, 24.2, 43.6, 23.6, 22.6], 0.5, GOLD);
    K.ell(20, 33.6, 2.4, 2.4, K.rad(19.4, 33, 0.2, 2.6, [[0, '#fff2b0'], [1, GOLD]])); K.ell(20, 33.6, 1.1, 1.1, tabard);
    for (let a = 0; a < 8; a++) { const t = a / 8 * 6.283; K.line([20 + Math.cos(t) * 2.9, 33.6 + Math.sin(t) * 2.9, 20 + Math.cos(t) * 3.9, 33.6 + Math.sin(t) * 3.9], 0.4, GOLD); }
    // rope belt, beads, a mace at her side
    K.R(14, 28.6, 12, 1.4, '#c8b48a', 0.6); K.curve([16, 29.6, 15.2, 33, 15.8, 36], 0.6, '#c8b48a');
    for (let i = 0; i < 5; i++) K.ell(25 + i * 0.1, 30.6 + i * 1.2, 0.55, 0.55, '#6a4a3a');
    K.curve([26.2, 29.6, 28.2, 33.6, 26.4, 37.4], 0.5, '#7a5636'); K.curve([26.8, 29.6, 27.2, 33.4, 26.8, 37], 0.4, '#8a6644'); K.ell(26.6, 37.9, 1.3, 0.9, '#6a4a2e');   // her sling, coiled at the belt
    K.R(11.6, 30, 1.2, 9, '#5a3e2a', 0.4); K.ell(12.2, 39.8, 2, 2.2, K.rad(11.6, 39.2, 0.2, 2.4, [[0, STEEL_L], [1, STEEL_D]]));
    for (const a of [0, 1.6, 3.2, 4.7]) K.ell(12.2 + Math.cos(a) * 2, 39.8 + Math.sin(a) * 2.1, 0.6, 0.6, STEEL_D);
    // mantle over the shoulders
    K.shape(q => { q.moveTo(11, 26.6); q.quadraticCurveTo(11, 20.4, 16, 19.6); q.lineTo(24, 19.6); q.quadraticCurveTo(29, 20.4, 29, 26.6); q.quadraticCurveTo(25, 24.4, 20, 25.2); q.quadraticCurveTo(15, 24.4, 11, 26.6); }, K.lin(0, 19.6, 0, 26.6, [[0, shade(mantle, 26)], [1, shade(mantle, -16)]]));
    K.curve([11.4, 26, 15.6, 24.2, 20, 25], 0.4, GOLD); K.curve([20, 25, 24.4, 24.2, 28.6, 26], 0.4, GOLD);
    // arms: the left hand at her breast, the right holding the lantern out
    limb(K, c, [12.6, 24, 11.4, 29, 15, 30.6], 3.6, 3, shade(robe, -6), 'rgba(255,255,255,.4)');
    K.ell(15.8, 30.4, 1.6, 1.4, shade(skin, 4));
    limb(K, c, [27.4, 24, 29.4, 28.6, 30.4, 31.4], 3.6, 3, shade(robe, -30), null);
    K.ell(30.6, 32, 1.6, 1.4, shade(skin, -16));
    // the lantern
    K.line([30.6, 32.6, 30.6, 35], 0.5, '#3a3d47');
    K.poly([28, 35, 33.2, 35, 32.6, 36.2, 28.6, 36.2], '#3a3d47');
    K.R(28.5, 36, 4.2, 6.4, K.lin(0, 36, 0, 42, [[0, '#fff8d0'], [0.5, '#ffd25a'], [1, '#e89a2a']]), 0.8);
    for (const x of [28.6, 30.6, 32.4]) K.line([x, 36, x, 42.4], 0.4, '#3a3d47');
    K.R(28.2, 42.2, 4.8, 1, '#3a3d47', 0.4);
    // head: silver hair up in a bun, a kind, lined face
    bigHead(c);
    K.ell(20, 7, 3.2, 2.8, K.rad(19, 6, 0.3, 3.4, [[0, '#eef0f4'], [1, shade(hair, -20)]]));
    K.R(18.4, 17.4, 3.4, 3, shade(skin, -24), 1);
    K.ell(20, 12.8, 5.9, 5.6, K.rad(18.6, 10.6, 0.5, 6.4, [[0, '#f2f4f8'], [1, shade(hair, -16)]]));
    face(K, c, { x: 20.3, y: 13.8, r: 4.6, skin, hair: '#8a8e98', lines: true, browCol: '#9a9ea8' });
    K.shape(q => { q.moveTo(15.2, 13.6); q.quadraticCurveTo(15.4, 8.4, 20.4, 8.4); q.quadraticCurveTo(25.2, 8.6, 25.4, 12.8); q.quadraticCurveTo(22.6, 9.8, 19.6, 10.6); q.quadraticCurveTo(17, 10.8, 15.2, 13.6); }, K.lin(0, 8, 0, 13, [[0, '#ffffff'], [1, hair]]));
    K.curve([16.2, 9.6, 18, 8.6, 20.6, 8.8], 0.3, alpha('#8a8e98', 0.6));
    c.restore();
    K.ell(20, 20.8, 0.9, 0.9, GOLD);
    return (K2) => {                                                // the lantern's light
      K2.ell(30.6, 39.2, 9, 9, K2.rad(30.6, 39.2, 0.5, 9, [[0, 'rgba(255,220,120,.55)'], [0.4, 'rgba(255,200,90,.18)'], [1, 'rgba(255,200,90,0)']]));
      K2.ell(30.6, 39.4, 1.8, 2.4, 'rgba(255,255,240,.85)');
    };
  }

  /* ---------- Finch: bard ---------- */
  function finch(c, K) {
    const skin = '#f0c8a0', hair = '#e8c14a', doublet = '#b23a6a', slash = '#f2d14a', cape = '#4a2f7a', hat = '#7a2f8a', hose = '#3a2f55';
    // shortbow slung across the back
    K.line([27, 7, 28.6, 40], 0.3, '#ece4d0'); K.curve([27, 7, 34.4, 22, 28.6, 40], 1.3, '#8a5a32'); K.ell(27, 7, 0.6, 0.6, '#5a3a20');
    // short cape off one shoulder
    K.shape(q => { q.moveTo(12, 21); q.quadraticCurveTo(7.6, 30, 8.6, 40); q.lineTo(11, 38.6); q.lineTo(13.4, 40.2); q.lineTo(16.6, 38.2); q.quadraticCurveTo(15.6, 28, 17, 21); q.closePath(); }, K.lin(8, 0, 17, 0, [[0, shade(cape, -24)], [1, shade(cape, 20)]]));
    // tall boots, hose
    K.R(15.6, 35, 4, 9, cloth(K, 15.6, 19.6, hose), 1.2); K.R(20.6, 35, 4, 9, cloth(K, 20.6, 24.6, hose, 4), 1.2);
    boot(K, 15, 41.4, 5, 10.2, '#6a4024', -0.6); boot(K, 20.4, 41.4, 5, 10.2, '#5a361e', 0.8);
    K.R(14.6, 41, 5.8, 1.6, '#8a5a32', 0.8); K.R(20, 41, 5.8, 1.6, '#7a4c2a', 0.8);
    // doublet with slashed puffs, gold buttons, a little ruff
    const torso = K.shape(q => { q.moveTo(13.6, 22); q.quadraticCurveTo(20, 20.4, 26.4, 22); q.quadraticCurveTo(27.6, 29, 26.6, 34.4); q.lineTo(27.6, 37.6); q.lineTo(20, 36.4); q.lineTo(12.4, 37.6); q.lineTo(13.4, 34.4); q.quadraticCurveTo(12.4, 29, 13.6, 22); }, cloth(K, 12.4, 27.6, doublet, 28, -40));
    K.clip(torso, () => {
      for (const [x, y] of [[15.4, 25], [15.6, 29.6], [24.6, 25], [24.4, 29.6]]) { K.ell(x, y, 0.9, 1.8, slash); K.ell(x - 0.2, y - 0.5, 0.3, 0.7, '#fff6c0'); }
      for (let y = 23.6; y < 35; y += 2.2) K.ell(20.4, y, 0.55, 0.55, K.rad(20.2, y - 0.2, 0.05, 0.6, [[0, '#fff2b0'], [1, GOLD_D]]));
      K.ell(16, 23.4, 3, 1, 'rgba(255,255,255,.18)');
    });
    K.R(13, 33.2, 14, 1.8, '#3a2214', 0.6); K.R(19.2, 32.9, 2.4, 2.4, GOLD, 0.4);
    // rapier at the hip: swept gold guard, blade behind
    K.line([12.6, 34.6, 8.4, 47], 0.7, STEEL); K.line([12.6, 34.6, 8.4, 47], 0.25, STEEL_L); K.curve([11.6, 32.2, 14.6, 33, 13.6, 35.6], 0.6, GOLD); K.ell(12.4, 33.8, 0.9, 0.9, GOLD);
    // puffed sleeves
    for (const [x, s, d] of [[12.6, -1, 0], [27.4, 1, -20]]) { K.ell(x, 23.6, 2.8, 2.6, shade(doublet, d)); for (const k of [-0.9, 0.9]) K.ell(x + k, 23.6, 0.5, 2, shade(slash, d)); }
    // arms around the lute: left hand on the neck, right strumming
    limb(K, c, [12.4, 25, 11.6, 27.6, 13.8, 25.8], 2.8, 2.4, shade(doublet, -10), null);
    limb(K, c, [27.4, 25, 28.4, 29, 24.6, 32.6], 2.8, 2.4, shade(doublet, -26), null);
    // the lute
    K.line([17.6, 29.4, 11.6, 22.6], 1.4, '#4e3520'); c.save(); c.translate(10.8, 21.4); c.rotate(0.85); K.R(-1.4, -2, 2.8, 3.4, '#4e3520', 0.8); c.restore();
    for (const [x, y] of [[9.6, 22.2], [10.8, 20.4]]) K.ell(x, y, 0.45, 0.45, GOLD);
    K.shape(q => { q.ellipse(22, 32.4, 5.4, 4.4, -0.55, 0, 6.2832); }, K.rad(20.6, 30.8, 0.5, 6.4, [[0, '#e8b070'], [0.6, '#b0743c'], [1, '#6a4020']]));
    K.ell(20.6, 31.6, 1.3, 1.2, '#2a1810'); c.strokeStyle = 'rgba(255,240,200,.6)'; c.lineWidth = 0.3; c.beginPath(); c.arc(20.6, 31.6, 1.8, 0, 6.283); c.stroke();
    for (const k of [-0.35, 0.35]) K.line([12.6 + k, 23.8 + k, 24 + k, 35.2 + k], 0.18, '#f4ecd8');
    K.ell(14, 25.6, 1.4, 1.3, skin); K.ell(24.4, 32.8, 1.4, 1.3, shade(skin, -10));
    // head: golden hair to the jaw, a grin, the hat and its plume
    bigHead(c);
    K.R(18.4, 17.4, 3.4, 3, shade(skin, -24), 1);
    K.shape(q => { q.moveTo(14.4, 12); q.quadraticCurveTo(13.6, 18.6, 15.8, 19.8); q.lineTo(17, 16); q.lineTo(23.6, 16); q.lineTo(24.6, 19.8); q.quadraticCurveTo(26.8, 18, 26, 12); q.closePath(); }, K.lin(0, 12, 0, 20, [[0, hair], [1, shade(hair, -40)]]));
    face(K, c, { x: 20.4, y: 13.8, r: 4.8, skin, hair, mouth: 'grin', brow: -0.6, browCol: '#a87a2a' });
    K.curve([15.2, 12.6, 17, 10.6, 19.8, 11.4], 1.2, hair); K.curve([21, 11, 23.6, 10.4, 25.4, 13], 1.2, shade(hair, -10));
    // the hat: a wide brim, tilted
    K.shape(q => { q.ellipse(20.6, 9.6, 9.6, 2.2, -0.12, 0, 6.2832); }, K.lin(11, 0, 30, 0, [[0, shade(hat, 30)], [1, shade(hat, -30)]]));
    K.shape(q => { q.moveTo(15.6, 9.6); q.quadraticCurveTo(15.6, 3.6, 20.6, 3.4); q.quadraticCurveTo(25.6, 3.4, 25.4, 8.8); q.closePath(); }, K.lin(15, 0, 26, 0, [[0, shade(hat, 30)], [1, shade(hat, -20)]]));
    K.shape(q => { q.moveTo(15.6, 8.6); q.quadraticCurveTo(20.6, 7.4, 25.4, 7.9); q.lineTo(25.4, 9); q.quadraticCurveTo(20.6, 8.6, 15.6, 9.8); q.closePath(); }, GOLD);
    K.shape(q => { q.moveTo(17, 7.4); q.quadraticCurveTo(10, 2, 3.4, 5.4); q.quadraticCurveTo(9, 3.8, 12.6, 6.6); q.quadraticCurveTo(8.4, 6.2, 5.4, 9.4); q.quadraticCurveTo(12, 6.8, 17, 8.6); q.closePath(); }, K.lin(3, 0, 17, 0, [[0, '#fff2a0'], [1, '#f2b82a']]));
    K.curve([16.6, 8, 10.4, 4.6, 4.6, 6.2], 0.3, '#c8901a');
    c.restore();
  }

  // shared with figures.js, which paints everyone else in the same hand
  B.fig = { face, limb, boot, cloth, shade, alpha, HEAD };

  const P = { runa, dask, maren, finch };
  B.heroFace = name => P[name] ? [8, 0.5, 24] : null;               // head and shoulders, for portraits and turn chips
  B.heroPainter = function (name) {
    const fn = P[name]; if (!fn) return null;
    return c => { const K = B.paintKit(c); c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; const after = fn(c, K); c.restore(); return after ? (c2 => { c2.save(); after(B.paintKit(c2), c2); c2.restore(); }) : null; };
  };
})();
