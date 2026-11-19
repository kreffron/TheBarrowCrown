// A mock-up: Maren as a realistic painted miniature. Same 40x64 layout as every piece (base top at 20,52).
// Real proportions (about seven heads tall), a slight stoop, heavy wool over mail, worn and muddied, one warm key
// light from the upper left, her own lantern lighting her from below right, and a cool rim from behind.
window.marenWide = function (cOut) {
  const off = document.createElement('canvas'); off.width = cOut.canvas.width; off.height = cOut.canvas.height;
  const c = off.getContext('2d'); c.setTransform(cOut.getTransform()); c.lineJoin = 'round'; c.lineCap = 'round';
  const K = B.paintKit(c), { shade, alpha } = B.fig, S = c.getTransform().a;
  const rr = (s => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; })(12345);
  const soft = (b, fn) => { c.save(); c.filter = 'blur(' + (b * S) + 'px)'; fn(); c.restore(); };     // b in layout units
  const WOOL = '#b0a286', MANT = '#575046', MANT_D = '#2a2520', TAB = '#6a262c', SKIN = '#cf9f7c', HAIR = '#dedcd6', LEATH = '#4a3424';
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
