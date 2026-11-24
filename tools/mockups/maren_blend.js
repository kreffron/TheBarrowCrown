// A mock-up: Maren blended. The game's proportions and bright silhouette (the head a size up, the cream robe, the
// big lantern) with the realistic version's light and wear: her lantern lighting her own figure, faded cloth, deeper
// folds, a wet and muddy hem, a frayed tabard, mail at the cuffs, and a thin cool rim from behind.
window.marenBlend = function (cOut) {
  const off = document.createElement('canvas'); off.width = cOut.canvas.width; off.height = cOut.canvas.height;
  const c = off.getContext('2d'); c.setTransform(cOut.getTransform()); c.lineJoin = 'round'; c.lineCap = 'round';
  const K = B.paintKit(c), { shade, alpha, face, limb, cloth, HEAD } = B.fig, S = c.getTransform().a;
  const bigHead = c => { c.save(); c.translate(20, 20); c.scale(HEAD, HEAD); c.translate(-20, -20); };
  const STEEL_L = '#f2f5fc', STEEL_D = '#5a5e6c', GOLD_D = '#9a7420';
  const rr = (s => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; })(777);
  const soft = (b, fn) => { c.save(); c.filter = 'blur(' + (b * S) + 'px)'; fn(); c.restore(); };
  const cuff = (x, y, rot) => { c.save(); c.translate(x, y); c.rotate(rot); K.R(-1.6, -0.75, 3.2, 1.5, '#4a4c54', 0.5);
    for (let yy = -0.55; yy < 0.7; yy += 0.36) for (let xx = -1.4 + (Math.round(yy * 3) % 2) * 0.18; xx < 1.5; xx += 0.36) { K.ell(xx, yy, 0.17, 0.13, '#2e3038'); K.ell(xx - 0.03, yy - 0.04, 0.08, 0.05, 'rgba(220,226,236,.6)'); }
    c.restore(); };
  (function maren() {
    const skin = '#c98e62', hair = '#b4b8c2', robe = '#ddd1b2', mantle = '#7a6d55', tabard = '#7a2c34'; const GOLD = '#d4b056';
    // mantle hood behind the head
    K.ell(20, 19, 8.4, 5, shade(mantle, -24));
    // robe, flaring to the floor, gold hem
    const robeP = K.shape(q => { q.moveTo(13.4, 22); q.quadraticCurveTo(20, 20.4, 26.6, 22); q.quadraticCurveTo(28, 36, 30.8, 50.4); q.quadraticCurveTo(20, 52.2, 9.2, 50.4); q.quadraticCurveTo(12, 36, 13.4, 22); }, cloth(K, 9, 31, robe, 14, -40));
    K.clip(robeP, () => {
      for (const [x0, x1, w] of [[13.8, 11, 1.3], [17, 15.6, 1.4], [23.6, 25, 1.4], [26.6, 29.4, 1.2]]) {
        soft(0.45, () => K.curve([x0, 30, (x0 + x1) / 2 + 0.4, 41, x1, 51.4], w, 'rgba(70,52,30,.5)'));
        soft(0.22, () => K.curve([x0 - w * 0.7, 30.5, (x0 + x1) / 2 - w * 0.5, 41, x1 - w * 0.75, 51.2], w * 0.42, 'rgba(255,250,232,.5)'));
      }
      soft(0.8, () => K.R(8, 45.6, 24, 8, K.lin(0, 45.6, 0, 52, [[0, 'rgba(90,66,40,0)'], [0.55, 'rgba(90,66,40,.38)'], [1, 'rgba(60,42,24,.7)']]), 0));
      for (let i = 0; i < 18; i++) { const x = 10 + rr() * 20, h = 1 + rr() * 2.6, w = 0.2 + rr() * 0.25, a = (0.15 + rr() * 0.2).toFixed(2), dx = (rr() - 0.5) * 0.4; soft(0.15, () => K.line([x, 51, x + dx, 51 - h], w, 'rgba(70,50,28,' + a + ')')); }
      for (let i = 0; i < 40; i++) K.ell(10 + rr() * 20, 46.5 + rr() * 4.5, 0.06 + rr() * 0.08, 0.05 + rr() * 0.07, 'rgba(70,50,30,' + (0.3 + rr() * 0.3).toFixed(2) + ')');
      for (let i = 0; i < 600; i++) K.ell(9 + rr() * 22, 22 + rr() * 30, 0.05, 0.05, rr() > 0.5 ? 'rgba(255,252,240,.12)' : 'rgba(60,44,24,.1)');
      K.shape(q => { q.moveTo(8, 49); q.quadraticCurveTo(20, 50.8, 32, 49); q.lineTo(32, 53); q.lineTo(8, 53); q.closePath(); }, K.lin(0, 49, 0, 52, [[0, '#ffe58a'], [1, GOLD_D]]));
    });
    // tabard with the lamp sign
    const tabP = K.shape(q => { q.moveTo(16.4, 22); q.lineTo(23.6, 22); q.lineTo(24.4, 44); q.lineTo(20, 46.4); q.lineTo(15.6, 44); q.closePath(); }, cloth(K, 15.6, 24.4, tabard, 22, -30));
    K.clip(tabP, () => {
      soft(0.35, () => { K.curve([18.2, 27, 17.8, 36, 17.6, 45], 0.8, 'rgba(30,6,10,.4)'); K.curve([22.2, 27, 22.6, 36, 22.8, 45], 0.8, 'rgba(30,6,10,.38)'); });
      soft(0.22, () => K.curve([19.6, 27, 19.7, 36, 19.9, 45], 0.6, 'rgba(255,200,190,.16)'));
      for (let i = 0; i < 180; i++) K.ell(15.6 + rr() * 8.8, 22 + rr() * 24, 0.05, 0.05, rr() > 0.5 ? 'rgba(255,220,210,.14)' : 'rgba(20,0,4,.18)');
      soft(0.6, () => K.R(14, 40.5, 12, 6.5, 'rgba(70,46,26,.3)', 0));
    });
    for (let t = 0; t <= 1; t += 0.07) for (const [ax, ay, bx, by] of [[15.6, 44, 20, 46.4], [20, 46.4, 24.4, 44]]) { const x = ax + (bx - ax) * t, y = ay + (by - ay) * t; K.line([x, y, x + (rr() - 0.5) * 0.2, y + 0.4 + rr() * 0.4], 0.1, alpha(tabard, 0.85)); }
    K.line([16.4, 22.6, 15.8, 43.6, 20, 45.8, 24.2, 43.6, 23.6, 22.6], 0.45, GOLD);
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
    cuff(14.4, 30.2, 0.5);
    K.ell(15.8, 30.4, 1.6, 1.4, shade(skin, 4));
    limb(K, c, [27.4, 24, 29.4, 28.6, 30.4, 31.4], 3.6, 3, shade(robe, -30), null);
    cuff(30.2, 31, -0.3);
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
  })();
  // ---- light: the key from the upper left, her lantern warm on her right side and under her chin, a cool rim
  c.save(); c.globalCompositeOperation = 'source-atop';
  c.fillStyle = K.lin(8, 6, 32, 44, [[0, 'rgba(255,236,200,.12)'], [0.55, 'rgba(255,255,255,0)'], [1, 'rgba(20,14,30,.2)']]); c.fillRect(0, 0, 40, 64);
  c.fillStyle = K.rad(30.6, 39, 0.5, 15, [[0, 'rgba(255,170,70,.55)'], [0.35, 'rgba(255,150,60,.22)'], [1, 'rgba(255,140,60,0)']]); c.fillRect(0, 0, 40, 64);
  c.fillStyle = K.rad(22, 21, 0.5, 4.5, [[0, 'rgba(255,170,90,.22)'], [1, 'rgba(255,170,90,0)']]); c.fillRect(0, 0, 40, 64);
  c.restore();
  const W = off.width, H = off.height, sil = document.createElement('canvas'); sil.width = W; sil.height = H;
  const sc = sil.getContext('2d'); sc.drawImage(off, 0, 0); sc.globalCompositeOperation = 'source-in'; sc.fillStyle = '#c8daff'; sc.fillRect(0, 0, W, H);
  sc.globalCompositeOperation = 'destination-out'; sc.drawImage(off, 0.3 * S, 0.14 * S);
  sc.globalCompositeOperation = 'destination-in'; const fade = sc.createLinearGradient(0, 0, W * 0.55, 0); fade.addColorStop(0, 'rgba(0,0,0,.55)'); fade.addColorStop(1, 'rgba(0,0,0,0)'); sc.fillStyle = fade; sc.fillRect(0, 0, W, H);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(sil, 0, 0); c.restore();
  cOut.save(); cOut.filter = 'blur(' + (0.7 * S) + 'px)'; cOut.fillStyle = 'rgba(0,0,0,.45)'; cOut.beginPath(); cOut.ellipse(20, 51.2, 10.6, 1.5, 0, 0, 6.283); cOut.fill(); cOut.restore();
  cOut.save(); cOut.setTransform(1, 0, 0, 1, 0, 0); cOut.drawImage(off, 0, 0); cOut.restore();
  return (K2, c2) => {                                               // the lantern's glow in the air
    c2.save(); c2.globalCompositeOperation = 'lighter';
    K2.ell(30.6, 39.2, 7, 7, K2.rad(30.6, 39.2, 0.5, 7, [[0, 'rgba(255,200,100,.45)'], [0.45, 'rgba(255,170,70,.14)'], [1, 'rgba(255,160,60,0)']]));
    c2.restore();
    K2.ell(30.6, 39.4, 1.5, 2.1, 'rgba(255,255,240,.8)');
  };
};
