/* Heroic-scale figures: the four heroes as realistic painted miniatures. Real anatomy, with the head, hands and
   gear a little larger than life (heroic scale, as miniature sculptors do it), and width from cloaks, pose and
   weapons rather than from bulk. One warm key light from the upper left, a cool rim from behind, contact shadows,
   wear and dirt; Maren's lantern lights her own figure. Each is painted on a layer of its own and set on the base.
   Options -> Battle figures switches back to the classic figures (heroes.js). Same 40x64 layout as every piece. */
(function () {
  const H = {};
  H.maren = function (cOut) {
  const off = document.createElement('canvas'); off.width = cOut.canvas.width; off.height = cOut.canvas.height;
  const c = off.getContext('2d'); c.setTransform(cOut.getTransform()); c.lineJoin = 'round'; c.lineCap = 'round';
  const K = B.paintKit(c), { shade, alpha } = B.fig, S = c.getTransform().a;
  const rr = (s => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; })(12345);
  const soft = (b, fn) => { c.save(); c.filter = 'blur(' + (b * S) + 'px)'; fn(); c.restore(); };     // b in layout units
  const WOOL = '#cec2a4', MANT = '#2f4672', MANT_D = '#141c32', TAB = '#7c2a32', SKIN = '#cf9f7c', HAIR = '#dedcd6', LEATH = '#4a3424';
  const mailBand = (x0, x1, y0, y1, tilt) => {                       // rows of tiny rings, lit on top
    for (let y = y0; y < y1; y += 0.34) for (let x = x0 + ((Math.round(y / 0.34) % 2) * 0.17); x < x1; x += 0.34) {
      const yy = y + (x - x0) * (tilt || 0); K.ell(x, yy, 0.16, 0.12, '#2e3038'); K.ell(x - 0.03, yy - 0.04, 0.07, 0.045, 'rgba(210,216,228,.55)');
    }
  };
  const hand = (x, y, rot, lit) => {                                 // an old hand, closed round something
    c.save(); c.translate(x, y); c.rotate(rot);
    K.shape(q => { q.moveTo(-0.9, -0.8); q.quadraticCurveTo(0.4, -1.1, 1, -0.3); q.quadraticCurveTo(1.2, 0.7, 0.4, 1); q.quadraticCurveTo(-0.7, 1.1, -1, 0.2); q.closePath(); },
      K.rad(-0.3, -0.4, 0.1, 1.5, [[0, lit ? '#f0c8a8' : '#e0a880'], [1, lit ? '#a87458' : '#8a5a40']]));
    for (const k of [-0.45, 0, 0.45]) K.line([0.95, k * 0.9 - 0.1, 0.55, k * 0.9 + 0.15], 0.12, 'rgba(110,60,40,.55)');   // knuckles
    c.restore();
  };

  // ---- a full-length cloak hung from her shoulders, flaring wide behind her: width from cloth, not from her body
  const cloak = K.shape(q => { q.moveTo(15, 17.2); q.quadraticCurveTo(12.6, 18.4, 11.4, 24); q.quadraticCurveTo(8.4, 38, 5.6, 50.2); q.quadraticCurveTo(8, 51.4, 10.6, 50.8); q.lineTo(29.6, 50.8); q.quadraticCurveTo(32.4, 51.4, 34.6, 50.2); q.quadraticCurveTo(31.8, 38, 29.4, 24); q.quadraticCurveTo(28.2, 18.4, 25.8, 17.2); q.closePath(); },
    K.lin(5.6, 0, 34.6, 0, [[0, shade(MANT, 6)], [0.25, shade(MANT, -10)], [0.75, shade(MANT, -24)], [1, MANT_D]]));
  K.clip(cloak, () => {
    for (const [x0, x1] of [[12.4, 7.4], [13.6, 9.6], [27.6, 31.4], [28.6, 33.2]]) { soft(0.45, () => K.curve([x0, 24, (x0 + x1) / 2, 38, x1, 51], 1.1, 'rgba(0,0,0,.45)')); soft(0.2, () => K.curve([x0 - 0.8, 24.5, (x0 + x1) / 2 - 0.8, 38, x1 - 0.9, 51], 0.4, 'rgba(255,240,220,.18)')); }
    soft(0.9, () => K.R(4, 46, 32, 7, 'rgba(40,30,18,.5)', 0));
    for (let i = 0; i < 500; i++) K.ell(5 + rr() * 30, 18 + rr() * 33, 0.045, 0.045, rr() > 0.5 ? 'rgba(255,245,230,.05)' : 'rgba(0,0,0,.1)');
  });
  // ---- the habit: heavy wool from shoulder to floor, flaring, its hem dragging and wet
  const habit = K.shape(q => {
    q.moveTo(15.6, 16.8); q.quadraticCurveTo(20.4, 15.8, 25.4, 16.9);
    q.quadraticCurveTo(27.2, 31, 30.4, 49.4); q.quadraticCurveTo(29.2, 51, 27.4, 50.6); q.quadraticCurveTo(25.6, 51.6, 23.4, 51); q.quadraticCurveTo(21, 51.8, 18.6, 51.1); q.quadraticCurveTo(16, 51.7, 13.6, 50.9); q.quadraticCurveTo(11.2, 51.2, 9.8, 49.6);
    q.quadraticCurveTo(13.4, 31, 15.6, 16.8); q.closePath();
  }, K.lin(9.8, 0, 30.4, 0, [[0, shade(WOOL, 26)], [0.38, WOOL], [0.75, shade(WOOL, -30)], [1, shade(WOOL, -58)]]));
  K.clip(habit, () => {
    // folds: broad troughs of shadow with a lit ridge on the side toward the light, fanning toward the hem
    for (const [x0, x1, w] of [[15.8, 11.6, 1.4], [17.6, 15.2, 1.6], [19.8, 19.2, 1.2], [22.6, 23.8, 1.7], [24.6, 27.6, 1.5], [26, 29.8, 1.1]]) {
      soft(0.5, () => K.curve([x0, 28.5, (x0 + x1) / 2 + 0.5, 40, x1, 51.6], w, 'rgba(36,26,16,.72)'));
      soft(0.25, () => K.curve([x0 - w * 0.75, 29, (x0 + x1) / 2 - w * 0.55, 40, x1 - w * 0.8, 51.4], w * 0.45, 'rgba(255,246,222,.45)'));
    }
    soft(0.6, () => K.R(9, 27.6, 22, 2, 'rgba(30,20,10,.3)', 1));                           // gathered under the belt
    // wet and muddy toward the hem: a darkening, streaks wicking upward, and a fine spatter
    soft(0.9, () => K.R(8, 46.2, 24, 7, K.lin(0, 46, 0, 52, [[0, 'rgba(66,48,28,0)'], [0.5, 'rgba(66,48,28,.42)'], [1, 'rgba(40,28,16,.8)']]), 0));
    for (let i = 0; i < 22; i++) { const x = 10 + rr() * 20, h = 1 + rr() * 3, w = 0.18 + rr() * 0.25, a = (0.15 + rr() * 0.25).toFixed(2), dx = (rr() - 0.5) * 0.4; soft(0.15, () => K.line([x, 51, x + dx, 51 - h], w, 'rgba(50,36,20,' + a + ')')); }
    for (let i = 0; i < 70; i++) { const x = 10 + rr() * 20, y = 46 + rr() * 5; K.ell(x, y, 0.04 + rr() * 0.08, 0.04 + rr() * 0.07, 'rgba(50,36,22,' + (0.3 + rr() * 0.4).toFixed(2) + ')'); }
    // the weave: a fine fleck, and faint horizontal threads
    for (let i = 0; i < 900; i++) { const x = 9 + rr() * 22, y = 16 + rr() * 36; K.ell(x, y, 0.045, 0.045, rr() > 0.5 ? 'rgba(255,250,235,.1)' : 'rgba(30,22,14,.1)'); }
    for (let y = 18; y < 51; y += 0.5) K.line([9, y, 31, y + 0.1], 0.05, 'rgba(40,30,20,.035)');
  });
  // her mail skirt where the habit lifts at the front, and the toes of worn boots
  K.shape(q => { q.moveTo(17.8, 51.2); q.quadraticCurveTo(20.2, 48.6, 22.8, 51.2); q.closePath(); }, '#55585f');
  K.clip(new Path2D('M17.8 51.2 Q20.2 48.6 22.8 51.2 Z'), () => mailBand(17.8, 22.8, 48.8, 51.2));
  for (const [x, w] of [[16.2, 3], [21.8, 3.1]]) { K.R(x, 50.4, w, 1.5, K.lin(x, 0, x + w, 0, [[0, shade(LEATH, 26)], [1, shade(LEATH, -16)]]), [0.6, 1.2, 0.4, 0.4]); K.ell(x + w * 0.45, 50.7, w * 0.22, 0.16, 'rgba(255,240,220,.25)'); }

  // ---- the tabard: old red wool, faded along its folds, the lamp sign stitched in tarnished thread
  const tab = K.shape(q => { q.moveTo(17.4, 17); q.lineTo(23.6, 17.1); q.quadraticCurveTo(24.6, 32, 24.2, 43.6); q.quadraticCurveTo(22.4, 44.5, 20.6, 44.1); q.quadraticCurveTo(18.8, 44.6, 16.9, 43.8); q.quadraticCurveTo(16.4, 32, 17.4, 17); q.closePath(); },
    K.lin(16.4, 0, 24.6, 0, [[0, shade(TAB, 24)], [0.5, TAB], [1, shade(TAB, -32)]]));
  K.clip(tab, () => {
    soft(0.4, () => { K.curve([19.2, 29, 18.9, 36.5, 18.7, 44.4], 1, 'rgba(20,4,6,.45)'); K.curve([22.5, 29, 22.9, 36.5, 23.1, 44.4], 0.9, 'rgba(20,4,6,.4)'); });
    soft(0.25, () => { K.curve([20.4, 29, 20.5, 36.5, 20.6, 44.4], 0.7, 'rgba(255,190,180,.16)'); K.curve([17.8, 29, 17.6, 36.5, 17.4, 44], 0.5, 'rgba(255,190,180,.14)'); });
    for (let i = 0; i < 260; i++) K.ell(16.4 + rr() * 8.4, 17 + rr() * 28, 0.045, 0.045, rr() > 0.5 ? 'rgba(255,215,205,.1)' : 'rgba(10,0,0,.14)');
    soft(0.8, () => K.R(15, 40.6, 11, 5, 'rgba(50,34,18,.42)', 0));
    const g = 'rgba(206,168,90,.85)', gd = 'rgba(120,90,40,.7)';
    for (const [col, dy] of [[gd, 0.12], [g, 0]]) {
      K.line([20.7, 28.8 + dy, 20.7, 29.5 + dy], 0.28, col);
      K.shape(q => { q.moveTo(19.6, 29.7 + dy); q.lineTo(21.8, 29.7 + dy); q.lineTo(21.45, 32.4 + dy); q.lineTo(19.95, 32.4 + dy); q.closePath(); }, null, col, 0.28);
      K.line([19.4, 32.9 + dy, 22, 32.9 + dy], 0.3, col);
      for (let a = 0; a < 8; a++) { if (a === 5 || a === 2) continue; const t = a / 8 * 6.283; K.line([20.7 + Math.cos(t) * 2.1, 31.1 + dy + Math.sin(t) * 2.1, 20.7 + Math.cos(t) * 2.7, 31.1 + dy + Math.sin(t) * 2.7], 0.2, col); }
    }
    K.ell(20.7, 31, 0.38, 0.5, 'rgba(255,214,140,.65)');
  });
  for (let x = 17.1; x < 24.2; x += 0.32) K.line([x, 43.9 + Math.sin(x * 3) * 0.25, x + (rr() - 0.5) * 0.15, 44.4 + rr() * 0.6], 0.09, alpha(TAB, 0.85));   // frayed edge

  // ---- belt, and what hangs from it
  soft(0.35, () => K.R(15.4, 27.9, 10.8, 1.3, 'rgba(0,0,0,.45)', 0.5));
  K.R(15.4, 26.7, 10.6, 1.45, K.lin(0, 26.7, 0, 28.1, [[0, '#6e5038'], [0.5, '#4e3824'], [1, '#2e2014']]), 0.5);
  for (let x = 16; x < 25.6; x += 0.9) K.ell(x, 27.4, 0.08, 0.08, 'rgba(255,230,200,.25)');           // stitching
  K.R(19.8, 26.5, 1.8, 1.85, K.lin(19.8, 26.5, 21.6, 28.3, [[0, '#f0d488'], [0.5, '#b08a3a'], [1, '#5a4018']]), 0.3); K.R(20.3, 27, 0.8, 0.85, '#2e2014', 0.15);
  // the sling, coiled and tied at her right hip, and its pouch
  c.strokeStyle = '#5e4028'; c.lineWidth = 0.28; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(25, 29.9 + i * 0.5, 1 - i * 0.1, 0.45, 0.1, 0, 6.283); c.stroke(); }
  c.strokeStyle = 'rgba(220,180,140,.35)'; c.lineWidth = 0.1; c.beginPath(); c.ellipse(25, 29.8, 0.95, 0.4, 0.1, 3.4, 5.6); c.stroke();
  K.ell(25.3, 31.8, 0.85, 0.65, K.rad(25.1, 31.6, 0.1, 1, [[0, '#8a6644'], [1, '#3e2818']]));

  // ---- her left arm: held a little out from her side, the mace in her fist, its head low and away
  const bigHand = (x, y, rot, lit) => { c.save(); c.translate(x, y); c.scale(1.25, 1.25); hand(0, 0, rot, lit); c.restore(); };
  K.line([11.2, 30.2, 7.8, 38.4], 0.85, K.lin(7, 0, 12, 0, [[0, '#9a7a56'], [1, '#4a3420']]));
  c.save(); c.translate(7.4, 39.6); c.rotate(0.35);
  K.shape(q => { q.ellipse(0, 0, 1.55, 2, 0, 0, 6.283); }, K.rad(-0.5, -0.6, 0.1, 2.3, [[0, '#e4e8f0'], [0.45, '#80848e'], [1, '#2a2c34']]));
  for (const [dx, dy] of [[-1.6, -0.5], [1.6, -0.4], [-1.4, 1.2], [1.3, 1.3], [0, 2.1]]) K.poly([0, 0, dx, dy, dx * 0.7, dy * 1.35], '#4e525c');
  K.ell(-0.5, -0.6, 0.4, 0.5, 'rgba(255,255,255,.75)'); c.restore();
  const sleeveL = K.shape(q => { q.moveTo(15.8, 17.4); q.quadraticCurveTo(13, 18.4, 12, 22.6); q.quadraticCurveTo(10.8, 26.6, 9.8, 29.6); q.lineTo(12.6, 30.4); q.quadraticCurveTo(13.8, 26.4, 15.2, 23.4); q.quadraticCurveTo(16.4, 20.8, 17.4, 18.8); q.closePath(); },
    K.lin(9.8, 0, 17.4, 0, [[0, shade(WOOL, 36)], [0.5, shade(WOOL, 8)], [1, shade(WOOL, -30)]]));
  K.clip(sleeveL, () => { soft(0.3, () => { K.curve([13.4, 20, 12.6, 24, 11.6, 28.4], 0.5, 'rgba(40,28,16,.45)'); K.curve([14.6, 22, 13.6, 26, 12.4, 29.6], 0.4, 'rgba(40,28,16,.35)'); }); soft(0.2, () => K.curve([12.6, 20, 11.6, 24, 10.6, 28], 0.35, 'rgba(255,248,226,.4)')); });
  K.shape(q => { q.moveTo(9.7, 29.2); q.lineTo(12.8, 30.1); q.lineTo(12.5, 31.2); q.lineTo(9.4, 30.3); q.closePath(); }, '#55585f'); mailBand(9.6, 12.7, 29.3, 30.9, 0.28);
  bigHand(11.1, 31.3, 0.9, true);

  // ---- her right arm: held out from her body, the lantern hanging at arm's length
  const sleeveR = K.shape(q => { q.moveTo(25, 17.4); q.quadraticCurveTo(28.6, 18, 31.2, 21.2); q.quadraticCurveTo(33, 23.4, 34.4, 25.4); q.lineTo(32.6, 27.2); q.quadraticCurveTo(31.2, 28.6, 30, 28.2); q.quadraticCurveTo(28.6, 26.6, 28.4, 24.4); q.quadraticCurveTo(26.4, 23.4, 25.4, 21.6); q.closePath(); },
    K.lin(25, 0, 34.4, 0, [[0, shade(WOOL, -26)], [1, shade(WOOL, -56)]]));
  K.clip(sleeveR, () => soft(0.3, () => { K.curve([26.6, 19.6, 29.6, 21.4, 32.6, 25.2], 0.45, 'rgba(24,16,10,.5)'); K.curve([28.8, 24.8, 29.6, 26.8, 30.6, 27.8], 0.4, 'rgba(24,16,10,.45)'); }));
  K.shape(q => { q.moveTo(34.4, 25.2); q.lineTo(35.6, 26.6); q.lineTo(33.6, 28.2); q.lineTo(32.5, 27); q.closePath(); }, '#55585f'); mailBand(32.6, 35.4, 25.6, 27.8, -0.5);
  bigHand(34.6, 28.4, 1.6, false);
  // the lantern, a size up
  K.line([34.6, 29.6, 34.6, 30.8], 0.3, '#24262e');
  c.save(); c.translate(34.6, 30.8); c.scale(1.25, 1.25); c.rotate(0.04);
  K.shape(q => { q.moveTo(-1.5, 0.6); q.quadraticCurveTo(0, -0.6, 1.5, 0.6); q.closePath(); }, K.lin(-1.5, 0, 1.5, 0, [[0, '#5a5c66'], [1, '#22242c']]));
  K.R(-1.5, 0.6, 3, 4.2, K.rad(0, 2.7, 0.2, 3, [[0, '#fff8e0'], [0.3, '#ffd884'], [0.8, '#e08a34'], [1, '#a85a20']]), 0.25);
  K.shape(q => { q.moveTo(0, 1.6); q.quadraticCurveTo(0.5, 2.6, 0, 3.4); q.quadraticCurveTo(-0.5, 2.6, 0, 1.6); }, '#ffffff');
  for (const x of [-1.5, 0, 1.5]) K.line([x, 0.6, x, 4.8], 0.24, '#24262e');
  K.R(-1.75, 4.7, 3.5, 0.65, '#24262e', 0.2); K.R(-1.75, 0.45, 3.5, 0.35, '#3a3c46', 0.2);
  c.restore();

  // ---- the mantle: a short cape over rounded shoulders, its hood fallen back in a thick roll round her neck
  const mant = K.shape(q => { q.moveTo(14, 21.2); q.quadraticCurveTo(13.4, 17.4, 16.6, 15.8); q.quadraticCurveTo(20.4, 14.6, 24.4, 15.8); q.quadraticCurveTo(27.6, 17.4, 27, 21.4); q.quadraticCurveTo(25.6, 20.4, 23.8, 20.6); q.quadraticCurveTo(22, 21.6, 20.6, 22); q.quadraticCurveTo(19, 21.6, 17.4, 20.6); q.quadraticCurveTo(15.6, 20.2, 14, 21.2); q.closePath(); },
    K.lin(13.4, 15, 27.4, 21.6, [[0, shade(MANT, 36)], [0.45, MANT], [1, MANT_D]]));
  K.clip(mant, () => {
    soft(0.25, () => { K.curve([16.6, 17, 16.2, 18.8, 15.6, 20.6], 0.45, 'rgba(0,0,0,.45)'); K.curve([24.2, 17.2, 25, 19, 25.8, 20.8], 0.45, 'rgba(0,0,0,.45)'); K.curve([19, 18.6, 18.8, 20, 18.4, 21.2], 0.35, 'rgba(0,0,0,.3)'); K.curve([22.2, 18.6, 22.4, 20, 22.8, 21.2], 0.35, 'rgba(0,0,0,.3)'); });
    soft(0.2, () => { K.curve([15.2, 17.6, 14.8, 19.2, 14.6, 20.6], 0.35, 'rgba(255,240,220,.3)'); K.curve([20.4, 19, 20.5, 20.4, 20.6, 21.6], 0.35, 'rgba(255,240,220,.18)'); });
    for (let i = 0; i < 260; i++) K.ell(13.4 + rr() * 14, 14.6 + rr() * 7.4, 0.045, 0.045, rr() > 0.5 ? 'rgba(255,245,230,.09)' : 'rgba(0,0,0,.12)');
  });
  soft(0.5, () => K.curve([14.4, 21.6, 20.6, 22.8, 26.6, 21.8], 0.9, 'rgba(0,0,0,.3)'));                  // its shadow on the habit
  K.ell(20.6, 20.3, 0.62, 0.62, K.rad(20.4, 20.1, 0.05, 0.7, [[0, '#fff2c0'], [0.5, '#c09440'], [1, '#5a4018']]));   // brooch
  // the hood's roll, and the neck rising out of it in shadow
  K.R(19.6, 13, 2.2, 2.6, K.lin(19.6, 0, 21.8, 0, [[0, '#b88464'], [1, '#6a4634']]), 0.9);
  soft(0.3, () => K.R(19.4, 12.9, 2.6, 1.2, 'rgba(40,18,10,.5)', 0.5));
  K.shape(q => { q.moveTo(16.4, 16.4); q.quadraticCurveTo(16.8, 14, 19.4, 13.8); q.quadraticCurveTo(20.8, 15, 22.2, 13.8); q.quadraticCurveTo(24.6, 14, 25, 16.4); q.quadraticCurveTo(20.6, 17.6, 16.4, 16.4); q.closePath(); },
    K.lin(16.4, 13.6, 25, 17, [[0, shade(MANT, 44)], [0.5, shade(MANT, 4)], [1, MANT_D]]));
  soft(0.2, () => { K.curve([17.4, 15, 19, 15.6, 20.6, 15.4], 0.3, 'rgba(0,0,0,.4)'); K.curve([20.8, 15.4, 22.6, 15.6, 24.2, 15.2], 0.3, 'rgba(0,0,0,.4)'); });

  // ---- the head: heroic scale, a touch larger than life, scaled from the neck
  c.save(); c.translate(20.6, 13.6); c.scale(1.1, 1.1); c.translate(-20.6, -13.6);
  const hx = 20.9, hy = 10.4;
  K.ell(18.5, 9.4, 1.55, 1.45, K.rad(18.1, 8.9, 0.1, 1.8, [[0, '#f8f8f4'], [1, '#9a9a94']]));
  c.strokeStyle = 'rgba(120,120,114,.6)'; c.lineWidth = 0.12; for (const r of [0.6, 1.05]) { c.beginPath(); c.arc(18.5, 9.4, r, 0.4, 4.2); c.stroke(); }
  K.ell(19.15, 10.9, 0.42, 0.66, K.rad(19.1, 10.7, 0.05, 0.7, [[0, '#d8a080'], [1, '#8a5a44']]));
  const head = K.shape(q => { q.moveTo(hx - 2.2, hy - 0.6); q.quadraticCurveTo(hx - 2.1, hy - 3.2, hx + 0.2, hy - 3.3); q.quadraticCurveTo(hx + 2.4, hy - 3.1, hx + 2.5, hy - 0.4);
    q.quadraticCurveTo(hx + 2.6, hy + 0.8, hx + 2.2, hy + 1.6); q.quadraticCurveTo(hx + 1.5, hy + 3, hx + 0.4, hy + 3.1); q.quadraticCurveTo(hx - 0.9, hy + 3, hx - 1.7, hy + 2); q.quadraticCurveTo(hx - 2.3, hy + 1, hx - 2.2, hy - 0.6); q.closePath(); },
    K.rad(hx - 0.8, hy - 0.8, 0.2, 4.1, [[0, '#eec8a6'], [0.55, SKIN], [1, '#8e604a']]));
  K.clip(head, () => {
    soft(0.3, () => { K.ell(hx - 0.4, hy - 0.1, 0.85, 0.5, 'rgba(100,56,44,.5)'); K.ell(hx + 1.45, hy - 0.1, 0.75, 0.48, 'rgba(100,56,44,.5)'); });
    soft(0.35, () => K.ell(hx + 2.2, hy + 0.6, 0.9, 2.6, 'rgba(70,40,30,.4)'));
    soft(0.3, () => K.ell(hx - 0.9, hy + 0.9, 0.85, 0.55, 'rgba(255,224,204,.4)'));
    soft(0.3, () => K.ell(hx + 0.6, hy + 2.9, 2.2, 0.7, 'rgba(70,40,30,.35)'));
    soft(0.4, () => K.ell(hx + 1.6, hy + 3.2, 2, 1.2, 'rgba(255,160,80,.3)'));              // the lantern, warm under her chin
  });
  for (const ex of [hx - 0.4, hx + 1.45]) { K.ell(ex, hy - 0.05, 0.36, 0.19, '#3a2a28'); K.ell(ex + 0.07, hy - 0.05, 0.15, 0.15, '#4a5a6a'); K.ell(ex - 0.05, hy - 0.11, 0.06, 0.06, 'rgba(255,255,255,.9)'); }
  K.curve([hx - 0.85, hy - 0.5, hx - 0.4, hy - 0.7, hx + 0.08, hy - 0.46], 0.16, 'rgba(110,66,52,.7)');
  K.curve([hx + 1, hy - 0.46, hx + 1.45, hy - 0.68, hx + 1.9, hy - 0.46], 0.16, 'rgba(110,66,52,.7)');
  K.line([hx - 1, hy - 0.92, hx + 0.2, hy - 1.02], 0.2, 'rgba(206,206,200,.95)'); K.line([hx + 1, hy - 1.02, hx + 2.05, hy - 0.86], 0.2, 'rgba(206,206,200,.95)');
  K.shape(q => { q.moveTo(hx + 0.6, hy - 0.2); q.quadraticCurveTo(hx + 1.2, hy + 0.9, hx + 1.15, hy + 1.28); q.quadraticCurveTo(hx + 0.7, hy + 1.45, hx + 0.32, hy + 1.22); q.closePath(); }, 'rgba(120,68,50,.38)');
  K.ell(hx + 0.52, hy + 1.02, 0.24, 0.16, 'rgba(255,232,214,.55)');
  K.curve([hx - 0.1, hy + 2, hx + 0.6, hy + 2.2, hx + 1.35, hy + 1.95], 0.18, '#7a4434');
  K.curve([hx - 0.05, hy + 1.25, hx - 0.35, hy + 1.75, hx - 0.15, hy + 2.25], 0.11, 'rgba(110,60,45,.55)');
  K.curve([hx - 1.35, hy - 0.2, hx - 1.65, hy, hx - 1.5, hy + 0.3], 0.09, 'rgba(110,60,45,.55)');
  K.curve([hx - 1.2, hy + 0.5, hx - 0.7, hy + 0.68, hx - 0.2, hy + 0.54], 0.09, 'rgba(110,60,45,.4)');
  K.curve([hx - 0.6, hy - 1.8, hx + 0.6, hy - 1.95, hx + 1.6, hy - 1.75], 0.08, 'rgba(110,60,45,.3)');          // a line across the brow
  K.shape(q => { q.moveTo(hx - 2.3, hy - 0.2); q.quadraticCurveTo(hx - 2.5, hy - 3.5, hx + 0.4, hy - 3.6); q.quadraticCurveTo(hx + 2.5, hy - 3.5, hx + 2.7, hy - 1.2); q.quadraticCurveTo(hx + 1.6, hy - 2.6, hx - 0.4, hy - 2.15); q.quadraticCurveTo(hx - 1.6, hy - 1.8, hx - 1.85, hy + 0.2); q.closePath(); },
    K.lin(0, hy - 3.6, 0, hy, [[0, '#ffffff'], [0.6, HAIR], [1, '#a4a4a0']]));
  for (let i = 0; i < 9; i++) K.curve([hx - 1.8 + i * 0.5, hy - 3.25 + Math.abs(i - 4) * 0.06, hx - 2.2 + i * 0.32, hy - 2.7, hx - 2.4 + i * 0.12, hy - 1.4], 0.06, 'rgba(130,130,124,.55)');
  K.curve([hx + 2.2, hy - 1.4, hx + 2.8, hy - 0.4, hx + 2.5, hy + 0.8], 0.07, 'rgba(246,246,242,.9)');
  K.curve([hx - 2, hy - 0.6, hx - 2.4, hy + 0.4, hx - 2.1, hy + 1.2], 0.07, 'rgba(246,246,242,.8)');

  c.restore();
  // ---- light. One warm key from the upper left over the whole figure, and her lantern warm on her right side ...
  c.save(); c.globalCompositeOperation = 'source-atop';
  c.fillStyle = K.lin(8, 6, 32, 40, [[0, 'rgba(255,236,200,.16)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(20,14,30,.24)']]); c.fillRect(0, 0, 40, 64);
  c.fillStyle = K.rad(34.6, 34, 0.5, 14, [[0, 'rgba(255,168,70,.6)'], [0.35, 'rgba(255,150,60,.26)'], [1, 'rgba(255,140,60,0)']]); c.fillRect(0, 0, 40, 64);
  c.restore();
  // ... and a thin, cool rim along her left edge, from behind
  const W = off.width, H = off.height, sil = document.createElement('canvas'); sil.width = W; sil.height = H;
  const sc = sil.getContext('2d'); sc.drawImage(off, 0, 0); sc.globalCompositeOperation = 'source-in'; sc.fillStyle = '#c8daff'; sc.fillRect(0, 0, W, H);
  sc.globalCompositeOperation = 'destination-out'; sc.drawImage(off, 0.28 * S, 0.12 * S);
  sc.globalCompositeOperation = 'destination-in'; const fade = sc.createLinearGradient(0, 0, W * 0.55, 0); fade.addColorStop(0, 'rgba(0,0,0,.6)'); fade.addColorStop(1, 'rgba(0,0,0,0)'); sc.fillStyle = fade; sc.fillRect(0, 0, W, H);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(sil, 0, 0); c.restore();
  // a soft contact shadow where she stands, then the figure onto the base
  cOut.save(); cOut.filter = 'blur(' + (0.7 * S) + 'px)'; cOut.fillStyle = 'rgba(0,0,0,.5)'; cOut.beginPath(); cOut.ellipse(20.2, 51.3, 14, 1.7, 0, 0, 6.283); cOut.fill(); cOut.restore();
  cOut.save(); cOut.setTransform(1, 0, 0, 1, 0, 0); cOut.drawImage(off, 0, 0); cOut.restore();

  // after the outline: the lantern's glow in the air, and its warm pool on the base
  return (K2, c2) => {
    c2.save(); c2.globalCompositeOperation = 'lighter';
    K2.ell(34.6, 34, 6, 6, K2.rad(34.6, 34, 0, 6, [[0, 'rgba(255,190,90,.4)'], [1, 'rgba(255,150,60,0)']]));
    c2.restore();
  };
};

  /* ---------- shared: a layer of its own, soft strokes, mail, hands, a lifelike face, and the finish ---------- */
  function begin(cOut, seed) {
    const off = document.createElement('canvas'); off.width = cOut.canvas.width; off.height = cOut.canvas.height;
    const c = off.getContext('2d'); c.setTransform(cOut.getTransform()); c.lineJoin = 'round'; c.lineCap = 'round';
    const K = B.paintKit(c), S = c.getTransform().a;
    const rr = (s => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; })(seed);
    const soft = (b, fn) => { c.save(); c.filter = 'blur(' + (b * S) + 'px)'; fn(); c.restore(); };
    return { cOut, off, c, K, S, rr, soft };
  }
  const { shade, alpha } = B.fig;
  // fine fleck over a cloth, inside a clip
  function fleck(E, x, y, w, h, n, a) { const { K, rr } = E; for (let i = 0; i < n; i++) K.ell(x + rr() * w, y + rr() * h, 0.045, 0.045, rr() > 0.5 ? 'rgba(255,248,232,' + a + ')' : 'rgba(10,6,0,' + (a * 1.3) + ')'); }
  // a fold: a soft trough of shadow with a lit ridge beside it
  function fold(E, pts, w, dark, lit) {
    E.soft(0.4, () => E.K.curve(pts, w, dark || 'rgba(20,12,6,.5)'));
    if (lit !== false) E.soft(0.2, () => E.K.curve(pts.map((v, i) => i % 2 ? v + 0.2 : v - w * 0.7), w * 0.42, lit || 'rgba(255,246,226,.32)'));
  }
  function mail(E, x0, x1, y0, y1, tilt) {
    const { K } = E;
    for (let y = y0; y < y1; y += 0.34) for (let x = x0 + ((Math.round(y / 0.34) % 2) * 0.17); x < x1; x += 0.34) { const yy = y + (x - x0) * (tilt || 0); K.ell(x, yy, 0.16, 0.12, '#2e3038'); K.ell(x - 0.03, yy - 0.04, 0.07, 0.045, 'rgba(210,216,228,.55)'); }
  }
  // a hand closed round something, a size up (heroic scale)
  function hand(E, x, y, rot, skin, lit, k) {
    const { c, K } = E; c.save(); c.translate(x, y); c.rotate(rot); c.scale(k || 1.25, k || 1.25);
    K.shape(q => { q.moveTo(-0.9, -0.8); q.quadraticCurveTo(0.4, -1.1, 1, -0.3); q.quadraticCurveTo(1.2, 0.7, 0.4, 1); q.quadraticCurveTo(-0.7, 1.1, -1, 0.2); q.closePath(); },
      K.rad(-0.3, -0.4, 0.1, 1.5, [[0, shade(skin, lit ? 26 : 10)], [1, shade(skin, lit ? -40 : -60)]]));
    for (const k2 of [-0.45, 0, 0.45]) K.line([0.95, k2 * 0.9 - 0.1, 0.55, k2 * 0.9 + 0.15], 0.12, 'rgba(100,50,30,.5)');
    c.restore();
  }
  // a limb as a shaded, tapering form: a sleeve, a bare arm, a leg
  function limbR(E, pts, w0, w1, col, litSide) {
    const { K, c } = E, n = pts.length / 2;
    const p = new Path2D(), L = [], R = [];
    for (let i = 0; i < n; i++) {
      const x = pts[i * 2], y = pts[i * 2 + 1], a = i < n - 1 ? [pts[i * 2 + 2] - x, pts[i * 2 + 3] - y] : [x - pts[i * 2 - 2], y - pts[i * 2 - 1]], l = Math.hypot(a[0], a[1]) || 1, w = (w0 + (w1 - w0) * i / (n - 1)) / 2;
      L.push([x - a[1] / l * w, y + a[0] / l * w]); R.push([x + a[1] / l * w, y - a[0] / l * w]);
    }
    p.moveTo(L[0][0], L[0][1]); for (let i = 1; i < n; i++) p.lineTo(L[i][0], L[i][1]); for (let i = n - 1; i >= 0; i--) p.lineTo(R[i][0], R[i][1]); p.closePath();
    const xs = pts.filter((v, i) => i % 2 === 0), x0 = Math.min(...xs) - w0, x1 = Math.max(...xs) + w0;
    c.fillStyle = K.lin(x0, 0, x1, 0, litSide === 'right' ? [[0, shade(col, -40)], [1, shade(col, 16)]] : [[0, shade(col, 24)], [0.5, col], [1, shade(col, -40)]]); c.fill(p);
    for (const [x, y, r] of [[pts[0], pts[1], w0 / 2], [pts[pts.length - 2], pts[pts.length - 1], w1 / 2]]) K.ell(x, y, r, r, col);
    return p;
  }
  // a lifelike face, three-quarters to the right: sockets, cheekbone, nose, mouth; scaled a touch large
  function faceR(E, o) {
    const { c, K, soft } = E, hx = o.x, hy = o.y, w = o.w || 2.4, sk = o.skin;
    c.save(); c.translate(hx, hy + 3); c.scale(1.1, 1.1); c.translate(-hx, -hy - 3);
    if (o.ear !== false) K.ell(hx - w * 0.75, hy + 0.5, 0.42, 0.66, K.rad(hx - w * 0.75, hy + 0.3, 0.05, 0.7, [[0, shade(sk, 6)], [1, shade(sk, -60)]]));
    const jaw = o.jaw || 1;
    const head = K.shape(q => { q.moveTo(hx - w * 0.92, hy - 0.6); q.quadraticCurveTo(hx - w * 0.88, hy - 3.2, hx + 0.2, hy - 3.3); q.quadraticCurveTo(hx + w, hy - 3.1, hx + w * 1.04, hy - 0.4);
      q.quadraticCurveTo(hx + w * 1.08, hy + 0.8, hx + w * 0.92 * jaw, hy + 1.6); q.quadraticCurveTo(hx + w * 0.62 * jaw, hy + 3, hx + 0.4, hy + 3.1); q.quadraticCurveTo(hx - w * 0.38 * jaw, hy + 3, hx - w * 0.7 * jaw, hy + 2); q.quadraticCurveTo(hx - w * 0.96, hy + 1, hx - w * 0.92, hy - 0.6); q.closePath(); },
      K.rad(hx - 0.8, hy - 0.8, 0.2, 4.1, [[0, shade(sk, 30)], [0.55, sk], [1, shade(sk, -60)]]));
    K.clip(head, () => {
      soft(0.3, () => { K.ell(hx - 0.4, hy - 0.1, 0.85, 0.5, 'rgba(90,46,34,.5)'); K.ell(hx + 1.45, hy - 0.1, 0.75, 0.48, 'rgba(90,46,34,.5)'); });
      soft(0.35, () => K.ell(hx + w * 0.92, hy + 0.6, 0.9, 2.6, 'rgba(60,30,20,.38)'));
      soft(0.3, () => K.ell(hx - 0.9, hy + 0.9, 0.85, 0.55, 'rgba(255,228,206,.4)'));
      soft(0.3, () => K.ell(hx + 0.6, hy + 2.9, 2.2, 0.7, 'rgba(60,30,20,.35)'));
      if (o.stubble) for (let i = 0; i < 70; i++) K.ell(hx - 1 + E.rr() * 3.4, hy + 1.6 + E.rr() * 1.5, 0.04, 0.04, 'rgba(120,80,40,.5)');
      if (o.freckles) for (let i = 0; i < 18; i++) K.ell(hx - 1.2 + E.rr() * 3.2, hy + 0.3 + E.rr() * 0.9, 0.06, 0.06, 'rgba(150,80,50,.55)');
      if (o.paint) o.paint(hx, hy);
      if (o.under) o.under(hx, hy);
    });
    for (const ex of [hx - 0.4, hx + 1.45]) { K.ell(ex, hy - 0.05, 0.36, 0.19, '#2e2220'); K.ell(ex + 0.07, hy - 0.05, 0.15, 0.15, o.eye || '#4a5a6a'); K.ell(ex - 0.05, hy - 0.11, 0.06, 0.06, 'rgba(255,255,255,.9)'); }
    const lid = shade(sk, -70);
    K.curve([hx - 0.85, hy - 0.5, hx - 0.4, hy - 0.7, hx + 0.08, hy - 0.46], 0.16, lid); K.curve([hx + 1, hy - 0.46, hx + 1.45, hy - 0.68, hx + 1.9, hy - 0.46], 0.16, lid);
    const bt = o.browTilt || 0, bc = o.brow || shade(sk, -80);
    K.line([hx - 1, hy - 0.95 + bt * 0.15, hx + 0.2, hy - 1.05 - bt * 0.1], o.browW || 0.22, bc); K.line([hx + 1, hy - 1.05 - bt * 0.1, hx + 2.05, hy - 0.9 + bt * 0.15], o.browW || 0.22, bc);
    K.shape(q => { q.moveTo(hx + 0.6, hy - 0.2); q.quadraticCurveTo(hx + 1.2, hy + 0.9, hx + 1.15, hy + 1.28); q.quadraticCurveTo(hx + 0.7, hy + 1.45, hx + 0.32, hy + 1.22); q.closePath(); }, 'rgba(110,60,42,.38)');
    K.ell(hx + 0.52, hy + 1.02, 0.24, 0.16, 'rgba(255,234,216,.5)');
    if (o.mouth === 'grin') { K.shape(q => { q.moveTo(hx - 0.3, hy + 1.85); q.quadraticCurveTo(hx + 0.7, hy + 2.15, hx + 1.6, hy + 1.7); q.quadraticCurveTo(hx + 1.1, hy + 2.6, hx + 0.4, hy + 2.55); q.quadraticCurveTo(hx - 0.1, hy + 2.4, hx - 0.3, hy + 1.85); q.closePath(); }, '#6a3028'); K.shape(q => { q.moveTo(hx - 0.2, hy + 1.9); q.quadraticCurveTo(hx + 0.7, hy + 2.15, hx + 1.5, hy + 1.78); q.lineTo(hx + 1.4, hy + 2); q.quadraticCurveTo(hx + 0.7, hy + 2.3, hx - 0.1, hy + 2.05); q.closePath(); }, '#f4ece0'); }
    else if (o.mouth === 'set') K.line([hx - 0.1, hy + 2.05, hx + 1.3, hy + 1.95], 0.2, shade(sk, -90));
    else K.curve([hx - 0.1, hy + 2, hx + 0.6, hy + 2.2, hx + 1.35, hy + 1.95], 0.18, shade(sk, -80));
    if (o.lines) { K.curve([hx - 0.05, hy + 1.25, hx - 0.35, hy + 1.75, hx - 0.15, hy + 2.25], 0.11, 'rgba(110,60,45,.55)'); K.curve([hx - 1.35, hy - 0.2, hx - 1.65, hy, hx - 1.5, hy + 0.3], 0.09, 'rgba(110,60,45,.55)'); }
    if (o.scar) K.line([hx + 1.6, hy - 1.7, hx + 2.1, hy - 0.2], 0.12, 'rgba(240,200,190,.75)');
    if (o.hair) o.hair(hx, hy);
    c.restore();
  }
  // the finish: the key light, a local warm light if there is one, a cool rim, a contact shadow, then onto the base
  function finish(E, o) {
    const { c, K, off, cOut, S } = E;
    c.save(); c.globalCompositeOperation = 'source-atop';
    c.fillStyle = K.lin(8, 6, 32, 40, [[0, 'rgba(255,236,200,.16)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(20,14,30,.26)']]); c.fillRect(0, 0, 40, 64);
    if (o.warm) { const [x, y, r, a] = o.warm; c.fillStyle = K.rad(x, y, 0.5, r, [[0, 'rgba(255,168,70,' + a + ')'], [0.35, 'rgba(255,150,60,' + (a * 0.4) + ')'], [1, 'rgba(255,140,60,0)']]); c.fillRect(0, 0, 40, 64); }
    c.restore();
    const W = off.width, H = off.height, sil = document.createElement('canvas'); sil.width = W; sil.height = H;
    const sc = sil.getContext('2d'); sc.drawImage(off, 0, 0); sc.globalCompositeOperation = 'source-in'; sc.fillStyle = '#c8daff'; sc.fillRect(0, 0, W, H);
    sc.globalCompositeOperation = 'destination-out'; sc.drawImage(off, 0.28 * S, 0.12 * S);
    sc.globalCompositeOperation = 'destination-in'; const fade = sc.createLinearGradient(0, 0, W * 0.55, 0); fade.addColorStop(0, 'rgba(0,0,0,.6)'); fade.addColorStop(1, 'rgba(0,0,0,0)'); sc.fillStyle = fade; sc.fillRect(0, 0, W, H);
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(sil, 0, 0); c.restore();
    cOut.save(); cOut.filter = 'blur(' + (0.7 * S) + 'px)'; cOut.fillStyle = 'rgba(0,0,0,.5)'; cOut.beginPath(); cOut.ellipse(20.2, 51.3, o.shadow || 12, 1.7, 0, 0, 6.283); cOut.fill(); cOut.restore();
    cOut.save(); cOut.setTransform(1, 0, 0, 1, 0, 0); cOut.drawImage(off, 0, 0); cOut.restore();
  }
  function boot(E, x, y, w, h, col, fur) {
    const { K } = E;
    K.R(x, y, w, h, K.lin(x, 0, x + w, 0, [[0, shade(col, 26)], [1, shade(col, -26)]]), [0.8, 0.8, 0.5, 0.5]);
    K.ell(x + w * 0.62, y + h - 0.25, w * 0.62, 0.7, shade(col, -14));
    E.soft(0.2, () => K.line([x + 0.5, y + 1, x + 0.6, y + h - 1], 0.3, 'rgba(255,240,220,.2)'));
    if (fur) { K.ell(x + w / 2, y + 0.3, w * 0.7, 0.9, K.lin(0, y - 0.6, 0, y + 1.2, [[0, '#ece2c8'], [1, '#9a8e74']])); for (let i = 0; i < 7; i++) K.line([x - 0.3 + i * (w + 0.6) / 6, y + 0.6, x - 0.3 + i * (w + 0.6) / 6 + 0.1, y + 1.4], 0.22, '#a89c80'); }
  }

  /* ---------- Runa: the axe on her shoulder, the fur mantle, the braids ---------- */
  /* ---------- Runa, Dask and Finch (each paints with kitH: its own layer, fold, fleck, face and finish) ---------- */

  function kitH(cOut, seed) {
    const off = document.createElement('canvas'); off.width = cOut.canvas.width; off.height = cOut.canvas.height;
    const c = off.getContext('2d'); c.setTransform(cOut.getTransform()); c.lineJoin = 'round'; c.lineCap = 'round';
    const K = B.paintKit(c), S = c.getTransform().a, { shade, alpha } = B.fig;
    const rr = (s => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; })(seed || 999);
    const H = {
      c, K, S, off, shade, alpha, rr,
      soft(b, fn) { c.save(); c.filter = 'blur(' + (b * S) + 'px)'; fn(); c.restore(); },
      // a fine fleck of weave or grain inside a path
      fleck(p, x, y, w, h, n, a) { K.clip(p, () => { for (let i = 0; i < n; i++) K.ell(x + rr() * w, y + rr() * h, 0.045, 0.045, rr() > 0.5 ? 'rgba(255,248,232,' + a + ')' : 'rgba(0,0,0,' + (a * 1.3) + ')'); }); },
      // a fold: a soft trough of shadow with a lit ridge beside it
      fold(pts, w, dark, lite) { H.soft(w * 0.35, () => K.curve(pts, w, dark || 'rgba(0,0,0,.42)')); if (lite !== false) H.soft(w * 0.18, () => K.curve(pts.map((v, i) => i % 2 ? v + 0.15 : v - w * 0.7), w * 0.4, lite || 'rgba(255,245,225,.3)')); },
      mail(x0, x1, y0, y1, tilt) { for (let y = y0; y < y1; y += 0.34) for (let x = x0 + ((Math.round(y / 0.34) % 2) * 0.17); x < x1; x += 0.34) { const yy = y + (x - x0) * (tilt || 0); K.ell(x, yy, 0.16, 0.12, '#2e3038'); K.ell(x - 0.03, yy - 0.04, 0.07, 0.045, 'rgba(210,216,228,.55)'); } },
      // a hand, a size up: closed round something
      hand(x, y, rot, skin, lit) {
        c.save(); c.translate(x, y); c.rotate(rot); c.scale(1.25, 1.25);
        K.shape(q => { q.moveTo(-0.9, -0.8); q.quadraticCurveTo(0.4, -1.1, 1, -0.3); q.quadraticCurveTo(1.2, 0.7, 0.4, 1); q.quadraticCurveTo(-0.7, 1.1, -1, 0.2); q.closePath(); },
          K.rad(-0.3, -0.4, 0.1, 1.5, [[0, shade(skin, lit ? 30 : 10)], [1, shade(skin, lit ? -40 : -60)]]));
        for (const k of [-0.45, 0, 0.45]) K.line([0.95, k * 0.9 - 0.1, 0.55, k * 0.9 + 0.15], 0.12, alpha(shade(skin, -80), 0.5));
        c.restore();
      },
      // a face, three-quarters to the right, about real proportion (the head is scaled up by the caller)
      face(hx, hy, o) {
        const skin = o.skin, head = K.shape(q => { q.moveTo(hx - 2.2, hy - 0.6); q.quadraticCurveTo(hx - 2.1, hy - 3.2, hx + 0.2, hy - 3.3); q.quadraticCurveTo(hx + 2.4, hy - 3.1, hx + 2.5, hy - 0.4);
          q.quadraticCurveTo(hx + 2.6, hy + 0.8, hx + 2.2, hy + 1.6); q.quadraticCurveTo(hx + 1.5, hy + (o.jaw || 3), hx + 0.4, hy + (o.jaw || 3) + 0.1); q.quadraticCurveTo(hx - 0.9, hy + (o.jaw || 3), hx - 1.7, hy + 2); q.quadraticCurveTo(hx - 2.3, hy + 1, hx - 2.2, hy - 0.6); q.closePath(); },
          K.rad(hx - 0.8, hy - 0.8, 0.2, 4.1, [[0, shade(skin, 28)], [0.55, skin], [1, shade(skin, -60)]]));
        K.clip(head, () => {
          H.soft(0.3, () => { K.ell(hx - 0.4, hy - 0.1, 0.85, 0.5, alpha(shade(skin, -90), 0.5)); K.ell(hx + 1.45, hy - 0.1, 0.75, 0.48, alpha(shade(skin, -90), 0.5)); });
          H.soft(0.35, () => K.ell(hx + 2.2, hy + 0.6, 0.9, 2.6, 'rgba(60,34,26,.38)'));
          H.soft(0.3, () => K.ell(hx - 0.9, hy + 0.9, 0.85, 0.55, 'rgba(255,226,206,.35)'));
          H.soft(0.3, () => K.ell(hx + 0.6, hy + 2.9, 2.2, 0.7, 'rgba(60,34,26,.32)'));
          if (o.paint) for (const ex of [hx - 0.4, hx + 1.45]) K.line([ex - 0.25, hy + 0.5, ex - 0.05, hy + 1.6], 0.28, o.paint), K.line([ex + 0.25, hy + 0.5, ex + 0.4, hy + 1.5], 0.24, o.paint);
          if (o.inner) o.inner();
        });
        for (const ex of [hx - 0.4, hx + 1.45]) { K.ell(ex, hy - 0.05, 0.36, 0.19, '#2a1e1c'); K.ell(ex + 0.07, hy - 0.05, 0.15, 0.15, o.eye || '#4a5a6a'); K.ell(ex - 0.05, hy - 0.11, 0.06, 0.06, 'rgba(255,255,255,.9)'); }
        const bc = o.brow || '#5a3a28', bt = o.browTilt || 0;
        K.line([hx - 1, hy - 0.92 + bt, hx + 0.2, hy - 1.02 - bt * 0.5], 0.22, bc); K.line([hx + 1, hy - 1.02 - bt * 0.5, hx + 2.05, hy - 0.86 + bt], 0.22, bc);
        K.shape(q => { q.moveTo(hx + 0.6, hy - 0.2); q.quadraticCurveTo(hx + 1.2, hy + 0.9, hx + 1.15, hy + 1.28); q.quadraticCurveTo(hx + 0.7, hy + 1.45, hx + 0.32, hy + 1.22); q.closePath(); }, alpha(shade(skin, -70), 0.4));
        K.ell(hx + 0.52, hy + 1.02, 0.24, 0.16, 'rgba(255,236,220,.5)');
        if (o.mouth === 'grin') { K.shape(q => { q.moveTo(hx - 0.3, hy + 1.9); q.quadraticCurveTo(hx + 0.6, hy + 2.1, hx + 1.6, hy + 1.8); q.quadraticCurveTo(hx + 1.1, hy + 2.7, hx + 0.4, hy + 2.6); q.closePath(); }, '#5a2a24'); K.R(hx - 0.1, hy + 1.92, 1.5, 0.28, '#f4ece0', 0.1); }
        else K.curve([hx - 0.1, hy + 2, hx + 0.6, o.mouth === 'set' ? hy + 2 : hy + 2.2, hx + 1.35, hy + 1.95], 0.18, alpha(shade(skin, -90), 0.9));
        if (o.scar) K.line([hx + 1.9, hy - 1.3, hx + 1.4, hy + 0.9], 0.12, 'rgba(240,200,190,.7)');
        return head;
      },
      // the finish: key light, any extra light, a cool rim, the contact shadow, onto the base
      finish(o) {
        c.save(); c.globalCompositeOperation = 'source-atop';
        if (o && o.fur != null) {                             // fur: short strokes lying one way, light on the tips, dark at the roots
          const a = o.fur, dx = Math.cos(a) * 0.55, dy = Math.sin(a) * 0.55;
          for (let i = 0; i < 1600; i++) { const x = 4 + rr() * 32, y = 6 + rr() * 46, l = 0.6 + rr() * 0.6; K.line([x, y, x + dx * l, y + dy * l], 0.1, rr() > 0.55 ? 'rgba(255,250,236,.22)' : 'rgba(0,0,0,.22)'); }
        }
        if (o && o.wear) {                                    // the weave of cloth and the grain of leather, and the road's dirt toward the feet
          const clean = o.clean || [], inClean = (x, y) => clean.some(e => ((x - e[0]) / e[2]) ** 2 + ((y - e[1]) / e[3]) ** 2 < 1);   // faces stay clear of the weave
          for (let i = 0; i < (o.wear === 'fur' ? 1400 : 900); i++) { const x = 4 + rr() * 32, y = 2 + rr() * 50; if (inClean(x, y)) continue; K.ell(x, y, 0.045, o.wear === 'fur' ? 0.12 : 0.045, rr() > 0.5 ? 'rgba(255,248,232,.1)' : 'rgba(0,0,0,.13)'); }
          c.fillStyle = K.lin(0, 43, 0, 52, [[0, 'rgba(60,44,26,0)'], [1, 'rgba(60,44,26,.32)']]); c.fillRect(0, 40, 40, 13);
        }
        c.fillStyle = K.lin(8, 4, 32, 44, [[0, 'rgba(255,236,200,.16)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(20,14,30,' + (o && o.grade != null ? o.grade : 0.26) + ')']]); c.fillRect(0, 0, 40, 64);
        if (o && o.light) { const [x, y, r, col, a] = o.light; c.fillStyle = K.rad(x, y, 0.5, r, [[0, 'rgba(' + col + ',' + a + ')'], [0.4, 'rgba(' + col + ',' + a * 0.4 + ')'], [1, 'rgba(' + col + ',0)']]); c.fillRect(0, 0, 40, 64); }
        c.restore();
        if (o && o.pop) { const t = document.createElement('canvas'); t.width = off.width; t.height = off.height; const tc = t.getContext('2d'); tc.filter = o.pop; tc.drawImage(off, 0, 0); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, off.width, off.height); c.drawImage(t, 0, 0); c.restore(); }
        if (o && o.real) { const t = document.createElement('canvas'); t.width = off.width; t.height = off.height; const tc = t.getContext('2d'); tc.filter = 'saturate(0.8) contrast(1.06)'; tc.drawImage(off, 0, 0); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, off.width, off.height); c.drawImage(t, 0, 0); c.restore(); }
        const W = off.width, Hh = off.height, sil = document.createElement('canvas'); sil.width = W; sil.height = Hh;
        const sc = sil.getContext('2d'); sc.drawImage(off, 0, 0); sc.globalCompositeOperation = 'source-in'; sc.fillStyle = '#c8daff'; sc.fillRect(0, 0, W, Hh);
        sc.globalCompositeOperation = 'destination-out'; sc.drawImage(off, 0.28 * S, 0.12 * S);
        sc.globalCompositeOperation = 'destination-in'; const fade = sc.createLinearGradient(0, 0, W * 0.55, 0); fade.addColorStop(0, 'rgba(0,0,0,.6)'); fade.addColorStop(1, 'rgba(0,0,0,0)'); sc.fillStyle = fade; sc.fillRect(0, 0, W, Hh);
        c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(sil, 0, 0); c.restore();
        const sw = (o && o.shadowW) || 12;
        cOut.save(); cOut.filter = 'blur(' + (0.7 * S) + 'px)'; cOut.fillStyle = 'rgba(0,0,0,.5)'; cOut.beginPath(); cOut.ellipse(20.2, 51.3, sw, 1.7, 0, 0, 6.283); cOut.fill(); cOut.restore();
        cOut.save(); cOut.setTransform(1, 0, 0, 1, 0, 0); cOut.drawImage(off, 0, 0); cOut.restore();
      }
    };
    return H;
  }
  const headUp = (c, x, y, k) => { c.save(); c.translate(x, y); c.scale(k, k); c.translate(-x, -y); };

  /* ---------- Runa: tall and broad, a wolf pelt over her shoulders, the great axe held across her ---------- */
  function runa(cOut) {
    const H = kitH(cOut, 4242), { c, K, shade, alpha, rr } = H;
    const SKIN = '#dca27a', HAIR = '#c8502a', HIDE = '#7c5634', LEATH = '#4e3420', FUR = '#d6cab0', WOAD = 'rgba(52,96,176,.75)', IRON = '#8a8e98';
    // legs: a wide stance, hide-wrapped, fur boots
    for (const [x0, x1, s] of [[17.4, 14.2, 1], [22.6, 25.8, -1]]) {
      K.shape(q => { q.moveTo(x0 - 1.8, 34); q.lineTo(x0 + 1.8, 34); q.lineTo(x1 + 1.4 * s + 0.4, 47); q.lineTo(x1 - 1.6, 47); q.closePath(); }, K.lin(x1 - 2, 0, x1 + 2, 0, [[0, shade(LEATH, 24)], [1, shade(LEATH, -20)]]));
      for (let y = 36; y < 46.5; y += 1.3) K.line([x0 + (x1 - x0) * (y - 34) / 13 - 1.7, y, x0 + (x1 - x0) * (y - 34) / 13 + 1.6, y + 0.5], 0.22, 'rgba(30,18,10,.45)');   // wrappings
      const bx = x1;
      K.shape(q => { q.moveTo(bx - 2.2, 45.6); q.quadraticCurveTo(bx, 44.6, bx + 2.2, 45.6); q.lineTo(bx + 2.6 + (s < 0 ? 1 : 0), 51.6); q.lineTo(bx - 2.6 - (s > 0 ? 1 : 0), 51.6); q.closePath(); }, K.lin(bx - 2.6, 0, bx + 2.6, 0, [[0, shade(FUR, 0)], [1, shade(FUR, -70)]]));
      for (let i = 0; i < 9; i++) K.line([bx - 2.4 + i * 0.6, 45.8 + rr() * 0.4, bx - 2.6 + i * 0.6 + (rr() - 0.5) * 0.4, 47 + rr() * 0.6], 0.14, 'rgba(90,76,58,.6)');
      K.R(bx - 2.8, 50.6, 5.6 + 0.6, 1.1, '#3a2818', 0.4);
    }
    // the hide skirt: strips to the knee
    const skirt = K.shape(q => { q.moveTo(14.4, 28.4); q.lineTo(25.6, 28.4); q.quadraticCurveTo(27.4, 34, 27.8, 37.8); q.lineTo(12.2, 37.8); q.quadraticCurveTo(12.6, 34, 14.4, 28.4); q.closePath(); },
      K.lin(12.2, 0, 27.8, 0, [[0, shade(HIDE, 26)], [0.5, HIDE], [1, shade(HIDE, -36)]]));
    K.clip(skirt, () => { for (let x = 13.6; x < 27.6; x += 2.2) { K.line([x, 30.6, x + (x - 20) * 0.08, 38], 0.3, 'rgba(30,18,8,.6)'); H.soft(0.15, () => K.line([x + 0.6, 31, x + 0.6 + (x - 20) * 0.08, 38], 0.35, 'rgba(255,230,200,.18)')); } });
    for (let x = 12.6; x < 27.6; x += 2.2) K.poly([x, 37.6, x + 2, 37.6, x + 1.1, 38.8 + rr() * 0.6], shade(HIDE, -20));
    H.fleck(skirt, 12, 28, 16, 11, 160, 0.12);
    // the torso: a hide jerkin laced up the front, a broad belt with a bronze boss
    const torso = K.shape(q => { q.moveTo(14, 17.4); q.quadraticCurveTo(20, 16, 26, 17.4); q.quadraticCurveTo(27, 23, 25.8, 29.2); q.lineTo(14.2, 29.2); q.quadraticCurveTo(13, 23, 14, 17.4); q.closePath(); },
      K.lin(13, 0, 27, 0, [[0, shade(HIDE, 30)], [0.45, shade(HIDE, 4)], [1, shade(HIDE, -40)]]));
    K.clip(torso, () => { H.fold([17, 19, 16.6, 24, 17, 29], 0.9); H.fold([23.4, 19, 23.8, 24, 23.4, 29], 0.9); for (let y = 19.4; y < 28; y += 1.1) K.line([19.4, y, 20.6, y + 0.55], 0.18, '#2a1a0e'), K.line([20.6, y, 19.4, y + 0.55], 0.18, '#2a1a0e'); });
    H.fleck(torso, 13, 16, 14, 14, 200, 0.12);
    K.R(13.8, 27.6, 12.4, 2, K.lin(0, 27.6, 0, 29.6, [[0, '#6a4a30'], [1, '#2e1e10']]), 0.4);
    K.ell(20, 28.6, 1.4, 1.2, K.rad(19.6, 28.2, 0.1, 1.5, [[0, '#f0c070'], [0.5, '#a8702a'], [1, '#4a2e10']]));
    // the axe haft, behind her right hand and in front of her left: low at her left hip, high past her right shoulder
    const haft = [9.4, 46, 31.4, 11];
    K.line(haft, 1.05, K.lin(9, 46, 31, 11, [[0, '#4e3420'], [0.5, '#8a6440'], [1, '#5a3e24']]));
    H.soft(0.15, () => K.line([9.6, 45.6, 31.6, 10.6], 0.3, 'rgba(255,230,190,.35)'));
    for (const t of [0.12, 0.2]) K.line([9.4 + 22 * t - 0.6, 46 - 35 * t, 9.4 + 22 * t + 0.6, 46 - 35 * t + 0.3], 0.5, '#2e1e10');   // grip wrapping
    // the axe head: a broad bearded blade, notched and dark at the edge
    c.save(); c.translate(30.2, 13); c.rotate(-0.12);
    const blade = K.shape(q => { q.moveTo(-0.8, -2.2); q.lineTo(1.6, -2.6); q.quadraticCurveTo(5.6, -4.8, 7.4, -3.6); q.quadraticCurveTo(8.6, 0.6, 7, 5.4); q.quadraticCurveTo(4.8, 5.2, 3.2, 2.6); q.lineTo(1.6, 1.6); q.lineTo(-0.8, 1.6); q.closePath(); },
      K.lin(-1, -3, 8, 5, [[0, '#d8dce4'], [0.45, IRON], [0.85, '#4a4e58'], [1, '#2a2c34']]));
    K.clip(blade, () => { H.soft(0.2, () => K.curve([7.2, -3.4, 8.2, 0.6, 6.8, 5], 0.8, 'rgba(255,255,255,.45)')); for (let i = 0; i < 40; i++) K.ell(rr() * 8, -3 + rr() * 8, 0.1, 0.08, 'rgba(60,40,30,.35)'); });
    for (const y of [-1.4, 2]) K.poly([7.6 + (y > 0 ? -0.4 : 0.3), y, 8.4, y + 0.4, 7.5, y + 0.8], '#1a1420');   // the chips
    K.R(-1.2, -2.4, 2.8, 4.2, '#3a3c44', 0.3);
    c.restore();
    // arms: bare, corded, blue woad bands, leather bracers
    const arm = (pts, w0, w1) => { B.fig.limb(K, c, pts, w0, w1, SKIN, 'rgba(255,230,200,.3)'); };
    arm([14.4, 18.4, 12.4, 25, 13.4, 31.6], 2.8, 2.2);                                   // her left: down to the haft at the hip
    H.soft(0.2, () => K.line([12.4, 22.4, 13.6, 22.8], 0.6, WOAD)); H.soft(0.2, () => K.line([12.2, 23.6, 13.4, 24], 0.4, WOAD));
    K.shape(q => { q.moveTo(11.8, 27.6); q.lineTo(14.6, 27.8); q.lineTo(14.8, 31); q.lineTo(12, 31); q.closePath(); }, K.lin(11.8, 0, 14.8, 0, [[0, '#6a4a30'], [1, '#2e1e10']]));
    H.hand(13.2, 33.2, 1.2, SKIN, true);
    arm([25.6, 18.4, 28.4, 22.6, 25.4, 22.4], 2.9, 2.3);                                   // her right: across, gripping the haft high
    H.soft(0.2, () => K.line([27.4, 19.8, 28.4, 21], 0.6, WOAD));
    K.shape(q => { q.moveTo(26, 21); q.lineTo(28.6, 21.2); q.lineTo(28, 23.8); q.lineTo(25.4, 23.4); q.closePath(); }, K.lin(25.4, 0, 28.6, 0, [[0, '#6a4a30'], [1, '#2e1e10']]));
    H.hand(24.8, 23.2, 2.4, SKIN, false);
    // a thick neck, sloping out into the shoulders under the pelt
    K.shape(q => { q.moveTo(18.6, 10.8); q.lineTo(22.6, 10.8); q.quadraticCurveTo(22.8, 13.2, 24.6, 14.8); q.lineTo(16.4, 14.8); q.quadraticCurveTo(18.4, 13.2, 18.6, 10.8); q.closePath(); },
      K.lin(16.4, 0, 24.6, 0, [[0, shade(SKIN, 6)], [0.5, shade(SKIN, -14)], [1, shade(SKIN, -56)]]));
    H.soft(0.3, () => K.ell(20.8, 12.6, 2.2, 0.8, 'rgba(70,36,24,.45)'));                 // the shadow under the jaw
    // the wolf pelt: heavy, shaggy, spread over both shoulders, its head on her left shoulder
    const pelt = K.shape(q => { q.moveTo(10.4, 22.4); q.quadraticCurveTo(10, 16.4, 15, 14.6); q.quadraticCurveTo(20, 13.4, 25.4, 14.6); q.quadraticCurveTo(30.4, 16.2, 30, 22.6);
      for (let x = 30; x > 10.4; x -= 1.1) q.lineTo(x - 0.55, 20.6 + rr() * 1.6 + (Math.abs(x - 20) < 4 ? 1.4 : 0)); q.closePath(); },
      K.lin(10, 14, 30, 23, [[0, shade(FUR, 20)], [0.45, FUR], [1, shade(FUR, -64)]]));
    K.clip(pelt, () => { for (let i = 0; i < 160; i++) { const x = 10 + rr() * 20, y = 14 + rr() * 9, l = 0.5 + rr() * 0.9; K.line([x, y, x + (x - 20) * 0.04, y + l], 0.12, rr() > 0.5 ? 'rgba(255,255,248,.35)' : 'rgba(90,78,60,.4)'); }
      H.soft(0.4, () => K.ell(20, 22, 6, 1.6, 'rgba(60,48,34,.35)')); });
    // the wolf's head, on her left shoulder: ears, a dark muzzle
    K.shape(q => { q.moveTo(10.6, 17.6); q.quadraticCurveTo(11, 14.4, 13.8, 14.2); q.lineTo(14.6, 12.4); q.lineTo(15.4, 14.6); q.quadraticCurveTo(16.6, 16.4, 15.6, 18.4); q.quadraticCurveTo(13, 19.6, 10.6, 17.6); q.closePath(); }, K.lin(10, 13, 16, 19, [[0, '#eee4cc'], [1, '#8a7c62']]));
    K.poly([11.6, 15.2, 11.6, 13, 12.8, 14.6], '#b8aa8c'); K.ell(12.2, 17.6, 1.1, 0.7, '#3a3028'); K.ell(13.2, 16.2, 0.25, 0.18, '#1a1420');
    // neck and the head, a touch larger than life
    headUp(c, 20.4, 13.4, 1.1);
    const hx = 20.8, hy = 10.2;
    // the hair behind, down to the nape so the head sits into it; then the face, the hair over the brow, the braids
    K.ell(19.4, hy - 0.2, 3.3, 3.8, K.rad(18.6, hy - 1.2, 0.2, 3.9, [[0, shade(HAIR, 30)], [1, shade(HAIR, -40)]]));
    K.R(17.2, hy + 0.6, 3, 2.8, shade(HAIR, -30), 1.2);
    H.face(hx, hy, { skin: SKIN, brow: '#8a3a1e', eye: '#5a7a6a', inner: () => H.soft(0.12, () => K.R(hx - 2.6, hy - 0.62, 5.4, 1.15, 'rgba(52,96,176,.5)', 0.4)), mouth: 'set', browTilt: 0.15, jaw: 3.2, scar: true });
    K.shape(q => { q.moveTo(hx - 2.5, hy + 0.4); q.quadraticCurveTo(hx - 2.8, hy - 3.8, hx + 0.4, hy - 3.8); q.quadraticCurveTo(hx + 2.8, hy - 3.6, hx + 2.8, hy - 1); q.quadraticCurveTo(hx + 1.4, hy - 2.8, hx - 0.2, hy - 2.2); q.quadraticCurveTo(hx - 1.4, hy - 1.6, hx - 1.8, hy + 0.6); q.closePath(); },
      K.lin(0, hy - 4, 0, hy, [[0, shade(HAIR, 30)], [1, shade(HAIR, -24)]]));
    for (let i = 0; i < 8; i++) K.curve([hx - 2 + i * 0.6, hy - 3.4, hx - 2.2 + i * 0.4, hy - 2.6, hx - 2.2 + i * 0.2, hy - 1.2], 0.07, alpha(shade(HAIR, -60), 0.5));
    c.restore();
    for (const [x0, dx] of [[17.8, -1.2], [23.4, 1]]) {                                 // the braids, from behind the ears down over the pelt
      K.ell(x0 + 0.2, 12.2, 0.95, 1.2, K.rad(x0, 11.8, 0.05, 1.3, [[0, shade(HAIR, 20)], [1, shade(HAIR, -46)]]));
      for (let i = 0; i < 10; i++) { const y = 12.6 + i * 1.25, x = x0 + dx * i * 0.12; K.ell(x, y, 0.85 - i * 0.03, 0.72, K.rad(x - 0.3, y - 0.3, 0.05, 1, [[0, shade(HAIR, 34)], [1, shade(HAIR, -40)]])); K.line([x - 0.6, y + 0.1, x + 0.6, y + 0.4], 0.08, alpha(shade(HAIR, -80), 0.6)); }
      K.R(x0 + dx * 1.1 - 0.7, 24.6, 1.4, 0.8, '#3a2818', 0.3); K.line([x0 + dx * 1.1, 25.4, x0 + dx * 1.15, 26.6], 0.6, shade(HAIR, -10));
    }
    H.finish({ shadowW: 13 });
    return null;
  }

  /* ---------- Dask: short, hooded, crouched low with a knife in each hand, the cloak flaring behind ---------- */
  function dask(cOut) {
    const H = kitH(cOut, 777), { c, K, shade, alpha, rr } = H;
    const SKIN = '#e2b896', CLOAK = '#28463a', CLOAK_D = '#0e1c16', JERK = '#4a3828', LEATH = '#2e2420', SCARF = '#b02a2a';
    // the cloak, flaring wide behind him, its hem torn
    const cloak = K.shape(q => { q.moveTo(15.4, 21); q.quadraticCurveTo(12, 22.4, 10.4, 30); q.quadraticCurveTo(8.4, 38, 6.4, 45.6);
      for (let x = 6.4; x < 33.6; x += 1.4) q.lineTo(x + 0.7, 44.2 + rr() * 2.2 + Math.sin(x) * 0.4); q.quadraticCurveTo(31.6, 38, 29.6, 30); q.quadraticCurveTo(28, 22.4, 24.6, 21); q.closePath(); },
      K.lin(6.4, 0, 33.6, 0, [[0, shade(CLOAK, 30)], [0.3, CLOAK], [1, CLOAK_D]]));
    K.clip(cloak, () => { for (const [x0, x1] of [[12.6, 8.6], [14.8, 12.4], [26.2, 29.6], [27.8, 32.4]]) H.fold([x0, 24, (x0 + x1) / 2, 34, x1, 46], 1.2, 'rgba(0,0,0,.5)', 'rgba(220,255,230,.14)'); H.soft(0.8, () => K.R(5, 41, 30, 6, 'rgba(30,24,16,.4)', 0)); });
    H.fleck(cloak, 6, 20, 28, 27, 400, 0.08);
    // legs: bent, wide, soft boots
    for (const [hip, knee, foot, s] of [[[17.6, 33.4], [13.6, 40.4], [13.2, 50.8], 1], [[22.4, 33.4], [26.6, 40.2], [27.2, 50.8], -1]]) {
      B.fig.limb(K, c, [hip[0], hip[1], knee[0], knee[1], foot[0], foot[1] - 2.4], 3.8, 2.6, shade(LEATH, s > 0 ? 18 : -6), 'rgba(255,240,220,.14)');
      K.shape(q => { q.moveTo(foot[0] - 1.6, foot[1] - 4); q.lineTo(foot[0] + 1.4, foot[1] - 4); q.lineTo(foot[0] + 1.6 + (s < 0 ? 1.2 : 0), foot[1] + 0.8); q.lineTo(foot[0] - 1.8 - (s > 0 ? 1.2 : 0), foot[1] + 0.8); q.closePath(); }, K.lin(foot[0] - 2, 0, foot[0] + 2, 0, [[0, '#4a3a30'], [1, '#1e1612']]));
      K.line([foot[0] - 1.5, foot[1] - 3.4, foot[0] + 1.3, foot[1] - 3.2], 0.3, '#5a4a3a');
    }
    // the jerkin: layered leather, a bandolier of throwing knives, belt pouches, a coil of rope
    const jerk = K.shape(q => { q.moveTo(15.6, 22.4); q.quadraticCurveTo(20, 21.4, 24.4, 22.4); q.quadraticCurveTo(25.6, 28, 24.6, 34.6); q.quadraticCurveTo(20, 35.6, 15.4, 34.6); q.quadraticCurveTo(14.4, 28, 15.6, 22.4); q.closePath(); },
      K.lin(14.4, 0, 25.6, 0, [[0, shade(JERK, 30)], [0.5, JERK], [1, shade(JERK, -34)]]));
    K.clip(jerk, () => { for (const y of [26.6, 30.4]) { H.soft(0.2, () => K.line([14, y + 0.4, 26, y + 0.4], 0.5, 'rgba(0,0,0,.45)')); K.line([14, y, 26, y], 0.12, 'rgba(255,230,200,.25)'); } });
    H.fleck(jerk, 14, 21, 12, 15, 160, 0.1);
    K.line([16.2, 23, 24.2, 32.6], 1.1, '#2a1e16'); for (let i = 0; i < 5; i++) { const t = 0.15 + i * 0.16, x = 16.2 + 8 * t, y = 23 + 9.6 * t; c.save(); c.translate(x, y); c.rotate(-0.7); K.R(-0.25, -1.4, 0.5, 1.8, '#c8ccd6', 0.2); K.R(-0.3, 0.3, 0.6, 0.8, '#3a2a20', 0.2); c.restore(); }
    K.R(15, 33.6, 10, 1.4, K.lin(0, 33.6, 0, 35, [[0, '#4a3828'], [1, '#1e1610']]), 0.4);
    K.R(15.6, 34.6, 2.2, 2.4, K.lin(15.6, 0, 17.8, 0, [[0, '#6a5038'], [1, '#2e2018']]), 0.6); K.R(22.4, 34.6, 2.4, 2.2, K.lin(22.4, 0, 24.8, 0, [[0, '#5a4430'], [1, '#2a1c14']]), 0.6);
    c.strokeStyle = '#a08860'; c.lineWidth = 0.38; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(25.2, 31.6 + i * 0.5, 1.3 - i * 0.1, 0.6, 0.2, 0, 6.283); c.stroke(); }
    // arms out low, a knife in each fist: the left blade out forward, the right held reversed along the forearm
    B.fig.limb(K, c, [15.8, 23.4, 12.4, 28.8, 9.6, 32.4], 2.6, 2.1, shade(JERK, 16), 'rgba(255,240,220,.2)');
    K.R(9.4, 30.2, 2.4, 1.8, '#2a1e16', 0.4);
    c.save(); c.translate(8.6, 33.4); c.rotate(-2.4); K.shape(q => { q.moveTo(0, -0.35); q.lineTo(4.4, -0.1); q.lineTo(5, 0.1); q.lineTo(0, 0.35); q.closePath(); }, K.lin(0, -0.4, 0, 0.4, [[0, '#f0f4fa'], [1, '#6a6e78']])); K.R(-0.4, -0.7, 0.4, 1.4, '#8a6a3a', 0.1); c.restore();
    H.hand(9.4, 33.2, 0.6, SKIN, true);
    B.fig.limb(K, c, [24.2, 23.4, 27.8, 28.6, 30.6, 31.4], 2.6, 2.1, shade(JERK, -26), null);
    K.R(29.4, 29.4, 2.4, 1.8, '#1e1610', 0.4);
    c.save(); c.translate(31.2, 32.6); c.rotate(-1.1); K.shape(q => { q.moveTo(0, -0.35); q.lineTo(4.2, -0.1); q.lineTo(4.8, 0.1); q.lineTo(0, 0.35); q.closePath(); }, K.lin(0, -0.4, 0, 0.4, [[0, '#e4e8f0'], [1, '#5a5e68']])); c.restore();
    H.hand(31, 32.4, 1.8, SKIN, false);
    // the hood: deep, up, the face in its shadow; the scarf over his mouth
    const hood = K.shape(q => { q.moveTo(14.4, 24.4); q.quadraticCurveTo(13.2, 17.8, 15.4, 14.4); q.quadraticCurveTo(18.4, 10.2, 22.2, 10.8); q.quadraticCurveTo(26.2, 11.8, 26.6, 16.6); q.quadraticCurveTo(27.4, 21.4, 25.6, 24.4); q.quadraticCurveTo(20, 23, 14.4, 24.4); q.closePath(); },
      K.lin(13, 10, 27, 24, [[0, shade(CLOAK, 40)], [0.45, CLOAK], [1, CLOAK_D]]));
    H.fleck(hood, 13, 10, 15, 15, 160, 0.08);
    headUp(c, 20.8, 19.6, 1.1);
    const hx = 21.2, hy = 17.2;
    K.ell(hx + 0.4, hy, 3, 3.4, '#0c0a0e');                                             // the hood's opening, dark
    const face = H.face(hx, hy, { skin: SKIN, brow: '#2a1e18', eye: '#6a8a5a', mouth: 'set', browTilt: -0.15 });
    K.clip(face, () => H.soft(0.6, () => K.ell(hx - 0.4, hy - 2.6, 4, 2, 'rgba(10,8,14,.75)')));   // the hood's shadow over his brow
    for (const ex of [hx - 0.4, hx + 1.45]) K.ell(ex - 0.05, hy - 0.11, 0.07, 0.07, 'rgba(255,255,255,.95)');
    // the scarf, wrapped up over his nose, its tail falling
    K.shape(q => { q.moveTo(hx - 2.4, hy + 0.9); q.quadraticCurveTo(hx + 0.4, hy + 0.4, hx + 2.8, hy + 0.7); q.quadraticCurveTo(hx + 3, hy + 3.6, hx + 0.4, hy + 4.4); q.quadraticCurveTo(hx - 2, hy + 4, hx - 2.4, hy + 0.9); q.closePath(); },
      K.lin(hx - 2.4, 0, hx + 3, 0, [[0, shade(SCARF, 40)], [0.5, SCARF], [1, shade(SCARF, -50)]]));
    for (const y of [hy + 1.8, hy + 3]) H.soft(0.12, () => K.curve([hx - 2.2, y, hx + 0.4, y - 0.3, hx + 2.8, y], 0.25, 'rgba(60,0,0,.5)'));
    c.restore();
    K.shape(q => { q.moveTo(24.2, 22.8); q.quadraticCurveTo(26.4, 25, 25.8, 28.6); q.lineTo(24.6, 28.4); q.quadraticCurveTo(24.8, 25.6, 23, 23.4); q.closePath(); }, K.lin(23, 0, 26.4, 0, [[0, SCARF], [1, shade(SCARF, -60)]]));
    // the hood's rim over the face
    K.shape(q => { q.moveTo(16.2, 21.6); q.quadraticCurveTo(15.6, 14.6, 21.6, 13.2); q.quadraticCurveTo(25.2, 13.4, 25.8, 17.6); q.quadraticCurveTo(24.4, 14.4, 21.6, 14.4); q.quadraticCurveTo(17.4, 15.4, 17.2, 21.8); q.closePath(); }, K.lin(16, 13, 26, 21, [[0, shade(CLOAK, 50)], [1, shade(CLOAK, -10)]]));
    H.finish({ shadowW: 13 });
    return null;
  }

  /* ---------- Finch: tall, jaunty, the wide plumed hat, the cape flung back, the lute across him, the rapier ---------- */
  function finch(cOut) {
    const H = kitH(cOut, 3131), { c, K, shade, alpha, rr } = H;
    const SKIN = '#ecc4a0', HAIR = '#e2b440', DOUB = '#a8325e', SLASH = '#e8c84a', CAPE = '#5a2e8a', CAPE_D = '#1e0c38', HAT = '#6a2a7e', HOSE = '#2e2846', BOOT = '#5a3a24';
    // the shortbow, slung across his back: the upper limb over his right shoulder, the lower by his left hip
    c.save(); c.strokeStyle = K.lin(14, 36, 30, 10, [[0, '#4a2c14'], [0.5, '#9a6a38'], [1, '#5a3618']]); c.lineWidth = 0.9; c.beginPath(); c.moveTo(14.2, 36.4); c.quadraticCurveTo(26.4, 28.6, 29.6, 9.6); c.stroke();
    c.strokeStyle = 'rgba(255,230,190,.35)'; c.lineWidth = 0.25; c.beginPath(); c.moveTo(14.6, 35.8); c.quadraticCurveTo(26, 28.2, 29.2, 9.8); c.stroke(); c.restore();
    K.line([14.2, 36.4, 29.6, 9.6], 0.12, 'rgba(245,238,220,.85)');                       // the string
    K.R(28.9, 9, 1.4, 0.9, '#2e1a0a', 0.3); K.R(13.6, 36, 1.4, 0.9, '#2e1a0a', 0.3);       // horn nocks
    // the cape, flung back off his left shoulder and flaring wide
    const cape = K.shape(q => { q.moveTo(16, 17.6); q.quadraticCurveTo(11, 19, 8.6, 27); q.quadraticCurveTo(6.4, 34, 5.4, 41.6); q.quadraticCurveTo(9, 43.4, 12.6, 41.8); q.quadraticCurveTo(15, 30, 19, 20.4); q.closePath(); },
      K.lin(5, 0, 19, 0, [[0, shade(CAPE, 30)], [0.5, CAPE], [1, CAPE_D]]));
    K.clip(cape, () => { H.fold([13, 22, 10.6, 30, 8.4, 41.6], 1.2, 'rgba(0,0,0,.5)', 'rgba(255,220,255,.2)'); H.fold([15.6, 22, 13.6, 30, 11.6, 41.4], 1, 'rgba(0,0,0,.45)', 'rgba(255,220,255,.18)'); });
    K.curve([5.6, 41.4, 9, 43.2, 12.6, 41.6], 0.45, '#d8b440');                          // its gold hem
    H.fleck(cape, 5, 17, 15, 27, 260, 0.08);
    // the rapier, at his left hip, angled back and out
    K.line([16.2, 31.4, 9.4, 44.6], 0.5, K.lin(9, 44, 16, 31, [[0, '#9aa0ac'], [1, '#e8ecf4']]));
    c.save(); c.translate(16.6, 30.6); c.rotate(-1.1); c.strokeStyle = '#d8b440'; c.lineWidth = 0.35; c.beginPath(); c.arc(0, 0, 1.3, 2.2, 5.6); c.stroke(); K.R(-0.25, -0.2, 0.5, 2.4, '#3a2418', 0.15); c.restore();
    // legs: one straight, one easy, in dark hose and turned-down boots
    for (const [x0, x1, s] of [[17.8, 16.8, 1], [22.2, 24.2, -1]]) {
      K.shape(q => { q.moveTo(x0 - 1.6, 33); q.lineTo(x0 + 1.6, 33); q.lineTo(x1 + 1.1, 45); q.lineTo(x1 - 1.1, 45); q.closePath(); }, K.lin(x1 - 2, 0, x1 + 2, 0, [[0, shade(HOSE, s > 0 ? 30 : 10)], [1, shade(HOSE, -20)]]));
      K.shape(q => { q.moveTo(x1 - 1.9, 43.4); q.quadraticCurveTo(x1, 42.4, x1 + 1.9, 43.4); q.lineTo(x1 + 1.5, 45); q.lineTo(x1 + 1.6 + (s < 0 ? 1.4 : 0.4), 51.6); q.lineTo(x1 - 1.6 - (s > 0 ? 0.4 : 0), 51.6); q.lineTo(x1 - 1.5, 45); q.closePath(); }, K.lin(x1 - 2, 0, x1 + 2, 0, [[0, shade(BOOT, 34)], [1, shade(BOOT, -30)]]));
      H.soft(0.15, () => K.line([x1 - 1.5, 44.6, x1 + 1.5, 44.8], 0.4, 'rgba(0,0,0,.4)'));
    }
    // the doublet: slashed sleeves and panels, gold showing through, a little faded at the seams; short puffed breeches
    const breech = K.shape(q => { q.moveTo(15.2, 29.6); q.lineTo(24.8, 29.6); q.quadraticCurveTo(26.4, 32, 25.4, 34.4); q.quadraticCurveTo(20, 35.4, 14.6, 34.4); q.quadraticCurveTo(13.6, 32, 15.2, 29.6); q.closePath(); }, K.lin(13.6, 0, 26.4, 0, [[0, shade(DOUB, 20)], [1, shade(DOUB, -40)]]));
    K.clip(breech, () => { for (let x = 15.4; x < 25.4; x += 2) K.R(x, 30, 0.7, 4.6, alpha(SLASH, 0.85), 0.3); });
    const doub = K.shape(q => { q.moveTo(15.6, 17.4); q.quadraticCurveTo(20, 16.4, 24.4, 17.4); q.quadraticCurveTo(25.4, 23, 24.8, 29.8); q.lineTo(20, 31.2); q.lineTo(15.2, 29.8); q.quadraticCurveTo(14.6, 23, 15.6, 17.4); q.closePath(); },
      K.lin(14.6, 0, 25.4, 0, [[0, shade(DOUB, 34)], [0.5, DOUB], [1, shade(DOUB, -42)]]));
    K.clip(doub, () => { for (const x of [17.2, 22.8]) { K.R(x - 0.4, 18, 0.8, 11, alpha(SLASH, 0.8), 0.3); H.soft(0.15, () => K.line([x + 0.6, 18, x + 0.6, 29], 0.3, 'rgba(0,0,0,.4)')); } for (let y = 19; y < 29.5; y += 1.4) K.ell(20, y, 0.3, 0.3, '#e8c84a'); H.fold([18.4, 18, 18.6, 24, 18.4, 30], 0.6); });
    H.fleck(doub, 14, 16, 12, 16, 200, 0.1);
    K.R(14.8, 28.4, 10.4, 1.2, K.lin(0, 28.4, 0, 29.6, [[0, '#6a4a2c'], [1, '#2e1e10']]), 0.3);
    // a falling lace collar
    K.shape(q => { q.moveTo(16.4, 17.4); q.quadraticCurveTo(20, 18.8, 23.6, 17.4); q.quadraticCurveTo(22.8, 19.6, 20, 20); q.quadraticCurveTo(17.2, 19.6, 16.4, 17.4); q.closePath(); }, K.lin(0, 17, 0, 20, [[0, '#fbf6ea'], [1, '#c8c0b0']]));
    // the lute, across his body: the bowl at his right hip, the neck up to his left shoulder
    c.save(); c.translate(23.6, 27.4); c.rotate(-0.85);
    K.shape(q => { q.ellipse(0, 0, 4.2, 3.4, 0, 0, 6.283); }, K.rad(-1.2, -1, 0.3, 4.8, [[0, '#e8b070'], [0.55, '#a86a34'], [1, '#4a2a12']]));
    for (let k = -2; k <= 2; k++) K.line([-4, k * 0.9, 3.8, k * 0.8], 0.08, 'rgba(60,30,10,.4)');
    K.ell(-0.6, 0, 1, 1, '#2a1408'); c.strokeStyle = 'rgba(255,230,180,.6)'; c.lineWidth = 0.15; c.beginPath(); c.arc(-0.6, 0, 1.3, 0, 6.283); c.stroke();
    K.R(-12.4, -0.65, 8.8, 1.3, K.lin(0, -0.7, 0, 0.7, [[0, '#6a4220'], [1, '#2e1a0a']]), 0.3);
    c.save(); c.translate(-12.4, 0); c.rotate(-0.5); K.R(-2.2, -0.75, 2.4, 1.5, '#3a2210', 0.3); c.restore();
    for (const k of [-0.3, 0, 0.3]) K.line([-12, k, 2.2, k * 0.9], 0.06, 'rgba(250,240,220,.8)');
    c.restore();
    // arms: his left hand on the lute's neck, his right strumming at the bowl
    B.fig.limb(K, c, [15.8, 18.6, 13.6, 23, 15.6, 21], 2.5, 2.1, shade(DOUB, 14), 'rgba(255,230,240,.25)');
    K.R(13, 19.6, 0.7, 3, alpha(SLASH, 0.8), 0.3);
    H.hand(15.6, 20.8, 2.6, SKIN, true);
    B.fig.limb(K, c, [24.4, 18.6, 27, 23.6, 24.4, 27.4], 2.5, 2.1, shade(DOUB, -30), null);
    K.R(26.3, 21, 0.7, 2.6, alpha(SLASH, 0.6), 0.3);
    H.hand(24, 27.6, 1.2, SKIN, false);
    // head: golden hair to the jaw, a grin, a fine moustache; then the hat, wide, tilted, and its plume
    K.shape(q => { q.moveTo(18.9, 13.2); q.lineTo(22.5, 13.2); q.quadraticCurveTo(22.6, 16, 23.6, 17.6); q.lineTo(17.8, 17.6); q.quadraticCurveTo(18.8, 16, 18.9, 13.2); q.closePath(); },
      K.lin(17.8, 0, 23.6, 0, [[0, shade(SKIN, 0)], [0.5, shade(SKIN, -16)], [1, shade(SKIN, -56)]]));
    H.soft(0.3, () => K.ell(21, 14.9, 1.8, 0.7, 'rgba(80,44,30,.45)'));                  // the shadow under the jaw
    headUp(c, 20.4, 14.6, 1.1);
    const hx = 20.8, hy = 11.6;
    K.R(hx - 2.9, hy + 0.4, 2.6, 3.8, shade(HAIR, -40), 1.2);                         // hair at the back of the neck
    K.shape(q => { q.moveTo(hx - 2.8, hy - 1); q.quadraticCurveTo(hx - 3.2, hy + 3.4, hx - 1.6, hy + 4); q.lineTo(hx - 1, hy + 1); q.lineTo(hx + 2.4, hy + 1); q.lineTo(hx + 2.6, hy + 3.4); q.quadraticCurveTo(hx + 3.4, hy + 1.6, hx + 2.8, hy - 1); q.closePath(); }, K.lin(0, hy - 1, 0, hy + 4, [[0, shade(HAIR, 20)], [1, shade(HAIR, -50)]]));
    H.face(hx, hy, { skin: SKIN, brow: '#a87a2a', eye: '#4a6a9a', mouth: 'grin', browTilt: -0.2 });
    K.curve([hx - 0.2, hy + 1.6, hx + 0.5, hy + 1.45, hx + 0.6, hy + 1.6], 0.16, '#b8902a'); K.curve([hx + 0.7, hy + 1.6, hx + 1.2, hy + 1.45, hx + 1.7, hy + 1.6], 0.16, '#b8902a');
    for (let i = 0; i < 6; i++) K.curve([hx - 2.6 + i * 0.3, hy - 0.6, hx - 2.8 + i * 0.25, hy + 1.6, hx - 2 + i * 0.2, hy + 3.6], 0.08, alpha(shade(HAIR, -60), 0.5));
    // the hat: a broad brim, tilted, with a gold band
    K.shape(q => { q.ellipse(hx + 0.4, hy - 2.4, 6.8, 1.6, -0.14, 0, 6.283); }, K.lin(hx - 6, 0, hx + 7, 0, [[0, shade(HAT, 40)], [0.5, HAT], [1, shade(HAT, -50)]]));
    H.soft(0.3, () => K.ell(hx + 0.6, hy - 1.6, 4, 0.8, 'rgba(0,0,0,.45)'));
    K.shape(q => { q.moveTo(hx - 3, hy - 2.6); q.quadraticCurveTo(hx - 3, hy - 6.6, hx + 0.4, hy - 6.8); q.quadraticCurveTo(hx + 3.8, hy - 6.6, hx + 3.6, hy - 3); q.closePath(); }, K.lin(hx - 3, 0, hx + 4, 0, [[0, shade(HAT, 36)], [1, shade(HAT, -40)]]));
    K.shape(q => { q.moveTo(hx - 3, hy - 3.4); q.quadraticCurveTo(hx + 0.4, hy - 4.2, hx + 3.6, hy - 3.6); q.lineTo(hx + 3.6, hy - 2.8); q.quadraticCurveTo(hx + 0.4, hy - 3.4, hx - 3, hy - 2.6); q.closePath(); }, K.lin(0, hy - 4, 0, hy - 2.6, [[0, '#f4d870'], [1, '#9a7420']]));
    // the plume: long, white-gold, sweeping back over the brim
    const plume = K.shape(q => { q.moveTo(hx - 2.4, hy - 3.6); q.quadraticCurveTo(hx - 7, hy - 10, hx - 12, hy - 5.6); q.quadraticCurveTo(hx - 8, hy - 7.4, hx - 6.6, hy - 5); q.quadraticCurveTo(hx - 9.6, hy - 4.4, hx - 10.8, hy - 1.6); q.quadraticCurveTo(hx - 6, hy - 4.2, hx - 2, hy - 2.8); q.closePath(); },
      K.lin(hx - 12, hy - 8, hx - 2, hy - 3, [[0, '#f8f0d8'], [0.6, '#e8c860'], [1, '#b88a20']]));
    K.clip(plume, () => { for (let i = 0; i < 40; i++) { const t = i / 40, x = hx - 2.4 - t * 9.4, y = hy - 3.6 - Math.sin(t * 3) * 3; K.line([x, y, x - 0.6, y + 1.6], 0.07, 'rgba(160,120,40,.5)'); } });
    K.curve([hx - 2.4, hy - 3.4, hx - 7, hy - 8.6, hx - 11.6, hy - 5.6], 0.12, '#c89a30');
    c.restore();
    H.finish({ shadowW: 11 });
    return null;
  }
  H.runa = runa; H.dask = dask; H.finch = finch;

  // where each face sits, for turn chips and dialogue portraits: [x, y, size] in the 40x64 layout
  const FACE = { maren: [14.2, 5.4, 13], runa: [13.6, 4, 14], dask: [14.2, 10.4, 13.4], finch: [13.8, 5, 13.6] };
  B.HEROIC = H;
  B.heroicKit = kitH;                                       // the same kit paints every other figure in the heroic style (figures.js, beasts.js)
  B.figHeroic = () => G.opts.figures !== 'classic';
  B.heroicOn = name => !!H[name] && G.opts.figures !== 'classic';
  B.heroicFace = name => B.heroicOn(name) ? FACE[name] : null;
  B.heroicPainter = function (name) {
    if (!B.heroicOn(name)) return null;
    return c => { const a = H[name](c); return a ? (c2 => { c2.save(); c2.lineJoin = 'round'; c2.lineCap = 'round'; a(B.paintKit(c2), c2); c2.restore(); }) : null; };
  };
})();
