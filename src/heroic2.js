/* Heroic-scale heroes, second pass: one anatomy for all four. Tapered limbs with knees and calves, boots with soles,
   shaped hands, one head with a modelled face (lids, irises, nose, lips, jaw), and one palette: earthy, a little
   muted, one accent each. Same 40x64 layout and finish as heroic.js; the feet stand on y 51. */
(function () {
  const A = {};                                                     // the anatomy kit, on top of the heroic kit
  A.make = function (H) {
    const { c, K, shade, alpha } = H;
    const X = {};
    // a limb through points [x, y] with widths at each: a smooth tapering outline, lit from the upper left
    X.limb = function (pts, ws, col, o) {
      o = o || {};
      const L = [], R = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
        const nx = -dy, ny = dx, w = ws[i] / 2;
        L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
      }
      const ring = L.concat(R.reverse());
      const p = K.shape(q => {
        q.moveTo(ring[0][0], ring[0][1]);
        for (let i = 1; i < ring.length; i++) { const m = [(ring[i - 1][0] + ring[i][0]) / 2, (ring[i - 1][1] + ring[i][1]) / 2]; q.quadraticCurveTo(ring[i - 1][0], ring[i - 1][1], m[0], m[1]); }
        q.lineTo(ring[ring.length - 1][0], ring[ring.length - 1][1]); q.closePath();
      }, o.fill || (() => { const xs = ring.map(r => r[0]), x0 = Math.min(...xs), x1 = Math.max(...xs); return K.lin(x0 - 0.3, 0, x1 + 0.3, 0, [[0, shade(col, 34)], [0.35, shade(col, 8)], [0.75, shade(col, -20)], [1, shade(col, -44)]]); })());
      K.clip(p, () => {
        // the turn of the form: a soft shadow down the far side, a lit edge on the near one (from o.edgeFrom on, if given)
        const e0 = o.edgeFrom || 0, Rr = R.reverse().slice(e0), Ll = L.slice(e0);
        if (Rr.length > 1) H.soft(ws[0] * 0.18, () => K.line(Rr.flat(), Math.max(...ws) * 0.35, 'rgba(10,6,14,' + (o.edgeA || 0.32) + ')'));
        if (Ll.length > 1) H.soft(ws[0] * 0.1, () => K.line(Ll.flat(), Math.max(...ws) * 0.12, 'rgba(255,246,228,' + (0.28 * (o.edgeA ? o.edgeA / 0.32 : 1)) + ')'));
        if (o.joint != null) { const j = pts[o.joint]; H.soft(0.4, () => K.ell(j[0] - 0.15, j[1] - 0.2, ws[o.joint] * 0.32, ws[o.joint] * 0.22, 'rgba(255,240,220,.1)')); H.soft(0.4, () => K.ell(j[0] + 0.2, j[1] + ws[o.joint] * 0.45, ws[o.joint] * 0.4, 0.3, 'rgba(0,0,0,.14)')); }
        if (o.inner) o.inner(p);
      });
      return p;
    };
    // a boot standing on the ground at (x, y): shaft, ankle, a foot pointing toward dir (1 right, -1 left), a sole
    X.boot = function (x, y, w, h, col, dir, o) {
      o = o || {}; dir = dir || 1;
      const toe = x + dir * w * 0.95, heel = x - dir * w * 0.55;
      const p = K.shape(q => {
        q.moveTo(x - w / 2, y - h); q.lineTo(x + w / 2, y - h);
        q.quadraticCurveTo(x + w * 0.52, y - h * 0.45, dir > 0 ? x + w * 0.5 : x + w * 0.55, y - 1.2);
        if (dir > 0) { q.quadraticCurveTo(toe - 0.2, y - 1.5, toe + 0.2, y - 0.4); q.lineTo(toe + 0.1, y); q.lineTo(heel, y); q.quadraticCurveTo(heel - 0.2, y - 1, x - w * 0.5, y - 1.8); }
        else { q.lineTo(heel, y - 1.6); q.lineTo(heel, y); q.lineTo(toe - 0.1, y); q.quadraticCurveTo(toe - 0.4, y - 1.5, x - w * 0.5, y - 1.3); }
        q.lineTo(x - w / 2, y - h); q.closePath();
      }, K.lin(x - w, 0, x + w, 0, [[0, shade(col, 30)], [0.45, col], [1, shade(col, -45)]]));
      K.clip(p, () => {
        H.soft(0.2, () => K.ell(x - w * 0.15, y - h * 0.62, w * 0.18, h * 0.3, 'rgba(255,240,220,.22)'));   // the shine down the shaft
        H.soft(0.2, () => K.ell(x + dir * w * 0.35, y - 1.2, w * 0.4, 0.4, 'rgba(255,240,220,.2)'));
        H.soft(0.3, () => K.line([x - w * 0.5, y - 2.1, x + w * 0.55, y - 2], 0.35, 'rgba(0,0,0,.3)'));       // the crease at the ankle
      });
      K.R(Math.min(toe, heel) - 0.1, y - 0.45, Math.abs(toe - heel) + 0.3, 0.55, shade(col, -70), 0.25);       // the sole
      if (o.cuff) K.R(x - w / 2 - 0.25, y - h - 0.1, w + 0.5, o.cuff, K.lin(0, y - h, 0, y - h + o.cuff, [[0, shade(col, 26)], [1, shade(col, -30)]]), 0.35);
      return p;
    };
    // a fist round a grip (rot turns it): knuckles, a thumb over the fingers
    X.fist = function (x, y, rot, skin, s) {
      s = s || 1; c.save(); c.translate(x, y); c.rotate(rot || 0); c.scale(s, s);
      K.shape(q => { q.moveTo(-1.05, -0.75); q.quadraticCurveTo(0.2, -1.15, 1.05, -0.55); q.quadraticCurveTo(1.35, 0.4, 0.75, 0.95); q.quadraticCurveTo(-0.4, 1.2, -1.1, 0.5); q.quadraticCurveTo(-1.3, -0.2, -1.05, -0.75); q.closePath(); },
        K.rad(-0.35, -0.45, 0.1, 1.6, [[0, shade(skin, 26)], [0.6, skin], [1, shade(skin, -55)]]));
      for (const k of [-0.5, -0.05, 0.4]) { K.ell(0.85, k, 0.28, 0.22, alpha(shade(skin, 30), 0.5)); K.line([1.05, k + 0.2, 0.75, k + 0.3], 0.07, alpha(shade(skin, -80), 0.5)); }
      K.shape(q => { q.moveTo(-0.6, -0.9); q.quadraticCurveTo(0.4, -0.7, 0.7, -0.15); q.quadraticCurveTo(0.3, 0.05, -0.2, -0.3); q.closePath(); }, shade(skin, 10));   // the thumb
      c.restore();
    };
    // the head, three-quarters to the right, about real proportion: (hx, hy) is the middle of the eyes' line
    X.head = function (hx, hy, o) {
      const skin = o.skin, jaw = o.jaw || 3.1, wide = o.wide || 1, dark = shade(skin, -60), deep = shade(skin, -95);
      // the neck: a column under the back half of the skull, no wider than the jaw's turn, flaring a little into the shoulders
      if (o.neck !== false) {
        const nw = o.neckW || 2.15, nx = hx - 0.3, top = hy + 1.2, bot = hy + jaw + (o.neckLen || 2.6);
        const neck = K.shape(q => { q.moveTo(nx - nw / 2, top); q.lineTo(nx + nw / 2, top); q.quadraticCurveTo(nx + nw / 2 - 0.12, bot - 0.5, nx + nw / 2 + 0.35, bot); q.lineTo(nx - nw / 2 - 0.35, bot); q.quadraticCurveTo(nx - nw / 2 + 0.12, bot - 0.5, nx - nw / 2, top); q.closePath(); },
          K.lin(nx - nw, 0, nx + nw, 0, [[0, shade(skin, 6)], [0.45, shade(skin, -12)], [1, shade(skin, -48)]]));
        K.clip(neck, () => {
          H.soft(0.45, () => K.ell(hx + 0.2, hy + jaw + 0.35, 2.2, 0.85, alpha(deep, 0.6)));                              // the jaw's shadow across the throat
          H.soft(0.2, () => K.line([nx - nw * 0.42, hy + jaw - 0.2, nx + 0.15, bot - 0.3], 0.28, alpha(dark, 0.32)));     // the long muscle, ear to the collarbone
          H.soft(0.2, () => K.line([nx - nw * 0.3, hy + jaw + 0.2, nx - 0.2, bot - 0.4], 0.16, alpha(shade(skin, 30), 0.3)));
          H.soft(0.25, () => K.ell(nx + 0.2, bot - 0.35, 0.45, 0.3, alpha(dark, 0.4)));                                  // the pit of the throat
          H.soft(0.3, () => K.ell(nx + nw * 0.55, (top + bot) / 2, 0.5, 2, alpha(deep, 0.3)));
        });
      }
      // the ear, back on the left
      K.shape(q => { q.ellipse(hx - 2.2 * wide, hy + 0.45, 0.58, 1.0, 0.18, 0, 6.283); }, K.lin(hx - 2.8, 0, hx - 1.6, 0, [[0, shade(skin, 12)], [1, shade(skin, -34)]]));
      K.curve([hx - 2.38 * wide, hy - 0.05, hx - 2.0 * wide, hy + 0.45, hx - 2.25 * wide, hy + 1.05], 0.12, alpha(dark, 0.5));
      H.soft(0.12, () => K.ell(hx - 2.25 * wide, hy + 0.2, 0.18, 0.4, 'rgba(255,170,140,.35)'));
      // the skull and the face: forehead, temple, the cheekbone, a jaw that turns to the chin
      const head = K.shape(q => {
        q.moveTo(hx - 2.3 * wide, hy - 0.3);
        q.quadraticCurveTo(hx - 2.4 * wide, hy - 3.5, hx + 0.1, hy - 3.55);
        q.quadraticCurveTo(hx + 2.35 * wide, hy - 3.4, hx + 2.45 * wide, hy - 1.0);
        q.quadraticCurveTo(hx + 2.7 * wide, hy + 0.1, hx + 2.45 * wide, hy + 1.0);
        q.quadraticCurveTo(hx + 2.2 * wide, hy + jaw - 0.6, hx + 1.1, hy + jaw + 0.1);
        q.quadraticCurveTo(hx + 0.4, hy + jaw + 0.35, hx - 0.35, hy + jaw - 0.1);
        q.quadraticCurveTo(hx - 1.75 * wide, hy + jaw - 0.75, hx - 2.15 * wide, hy + 1.3);
        q.closePath();
      }, K.rad(hx - 0.6, hy - 0.6, 0.3, 4.8, [[0, shade(skin, 22)], [0.55, skin], [0.85, shade(skin, -22)], [1, shade(skin, -48)]]));
      K.clip(head, () => {
        H.soft(0.7, () => K.ell(hx + 2.7 * wide, hy + 0.5, 1.0, 3.6, alpha(deep, 0.35)));                  // the far side, turning away
        H.soft(0.55, () => K.ell(hx - 0.85, hy + 1.5, 1.1, 0.75, o.blush || 'rgba(232,120,100,.24)'));      // warmth in the near cheek
        H.soft(0.45, () => K.ell(hx + 1.75, hy + 1.6, 0.6, 0.6, o.blush || 'rgba(232,120,100,.16)'));
        H.soft(0.45, () => { K.ell(hx - 0.85, hy - 0.15, 0.95, 0.6, alpha(dark, 0.22)); K.ell(hx + 1.35, hy - 0.15, 0.8, 0.56, alpha(dark, 0.26)); });   // soft sockets
        H.soft(0.35, () => K.ell(hx - 1.2, hy + 0.95, 0.85, 0.42, alpha(shade(skin, 40), 0.32)));            // the cheekbone catching the light
        H.soft(0.5, () => K.ell(hx - 0.4, hy - 2.3, 1.6, 0.8, alpha(shade(skin, 36), 0.3)));                 // the brow, lit
        H.soft(0.4, () => K.ell(hx + 0.5, hy + jaw + 0.25, 2.3, 0.5, alpha(deep, 0.3)));                     // under the jaw
        H.soft(0.25, () => K.ell(hx + 0.3, hy + jaw - 0.4, 0.5, 0.28, alpha(shade(skin, 34), 0.35)));        // the chin
        H.soft(0.3, () => K.ell(hx + 0.45, hy + jaw - 0.95, 0.6, 0.18, alpha(dark, 0.22)));                  // the dip between lip and chin
        if (o.stubble) for (let i = 0; i < 160; i++) { const x = hx - 1.6 + H.rr() * 3.8, y = hy + 1.6 + H.rr() * (jaw - 1.2); K.ell(x, y, 0.04, 0.04, alpha(o.stubble, 0.35)); }
        if (o.freckles) for (let i = 0; i < o.freckles; i++) { const t = H.rr(), x = hx - 1.9 + H.rr() * 4.2, y = hy + 0.55 + Math.abs(x - hx - 0.4) * 0.15 + H.rr() * 1.3 * (1 - t * 0.4); K.ell(x, y, 0.05 + H.rr() * 0.05, 0.04 + H.rr() * 0.04, alpha(shade(skin, -55), 0.25 + H.rr() * 0.25)); }
        if (o.spots) for (const [x, y, r] of o.spots) H.soft(0.08, () => K.ell(hx + x, hy + y, r, r * 0.8, alpha(shade(skin, -45), 0.28)));
        if (o.mole) K.ell(hx + o.mole[0], hy + o.mole[1], 0.1, 0.09, alpha(shade(skin, -100), 0.75));
        if (o.dimple) H.soft(0.08, () => K.curve([hx - 0.75, hy + 2.0, hx - 0.85, hy + 2.3, hx - 0.75, hy + 2.55], 0.08, alpha(dark, 0.4)));
        if (o.lines) {                                         // age: crow's feet, the lines from nose to mouth, the forehead
          for (const [a, b, d, e, w] of [[-1.75, 0.05, -1.4, 0.35, 0.07], [-1.8, 0.3, -1.45, 0.45, 0.06], [2.15, 0.05, 2.35, 0.35, 0.06], [-0.05, 1.25, 0.15, 2.25, 0.1], [1.3, 1.35, 1.6, 2.3, 0.09], [-1.1, -2.05, 1.3, -2.15, 0.07], [-0.9, -1.65, 1.1, -1.72, 0.06]])
            H.soft(0.05, () => K.curve([hx + a, hy + b, (2 * hx + a + d) / 2, (2 * hy + b + e) / 2 + 0.1, hx + d, hy + e], w, alpha(dark, 0.4)));
          H.soft(0.3, () => K.ell(hx - 0.85, hy + 0.55, 0.65, 0.22, alpha(dark, 0.18)));                     // softness under the eyes
        }
        if (o.paint) {                                                                                         // a band of woad over the eyes, painted on with fingers, run at the cheeks
          H.soft(0.06, () => { K.R(hx - 2.7, hy - 0.5, 5.8, 0.95, o.paint, 0.3); for (const [x, l] of [[-1.35, 1.2], [-0.75, 0.7], [1.65, 1.0]]) K.line([hx + x, hy + 0.3, hx + x + 0.04, hy + 0.3 + l], 0.2, o.paint); });
          for (let i = 0; i < 40; i++) K.ell(hx - 2.6 + H.rr() * 5.6, hy - 0.5 + H.rr() * 1, 0.08, 0.05, 'rgba(10,20,60,.25)');
        }
        if (o.inner) o.inner();
      });
      // the eyes: the crease above, an almond of white, a ringed iris, the pupil, a catchlight, the lash line heavier at the outer corner
      const eye = (ex, s, near) => {
        const w = 0.66 * s, h = 0.33 * s;
        H.soft(0.06, () => K.curve([ex - w * 0.8, hy - h * 0.9, ex, hy - h * 2.3, ex + w * 0.9, hy - h * 1.0], 0.07, alpha(dark, 0.55)));   // the lid crease
        const al = K.shape(q => { q.moveTo(ex - w, hy + 0.02); q.quadraticCurveTo(ex - w * 0.1, hy - h * 1.45, ex + w, hy - 0.04); q.quadraticCurveTo(ex + w * 0.1, hy + h * 1.1, ex - w, hy + 0.02); q.closePath(); }, '#efe8e0');
        K.clip(al, () => {
          const ix = ex + (near ? 0.12 : 0.1) * s, ir = 0.29 * s;
          K.ell(ix, hy - 0.03, ir, ir, K.rad(ix, hy + 0.05, 0.02, ir, [[0, shade(o.eye, 60)], [0.45, shade(o.eye, 20)], [0.85, o.eye], [1, shade(o.eye, -70)]]));
          K.ell(ix, hy - 0.03, 0.12 * s, 0.12 * s, '#0a080a');
          H.soft(0.1, () => K.R(ex - w, hy - h * 1.5, 2 * w, h * 0.85, 'rgba(40,18,18,.5)', 0));            // the lid's shadow on the eye
          H.soft(0.1, () => K.ell(ex - w * 0.9, hy, 0.18, 0.2, 'rgba(200,120,110,.4)'));                     // the inner corner
        });
        K.ell(ex + 0.02 * s, hy - 0.12, 0.075 * s, 0.075 * s, 'rgba(255,255,255,.95)');
        const lash = o.lash || '#24140f';
        K.shape(q => { q.moveTo(ex - w - 0.02, hy + 0.04); q.quadraticCurveTo(ex - w * 0.1, hy - h * 1.55, ex + w + 0.06, hy - 0.06); q.quadraticCurveTo(ex + w * 0.2, hy - h * 1.15, ex - w - 0.02, hy + 0.04); q.closePath(); }, lash);
        if (o.flick) K.curve([ex + w - 0.05, hy - 0.06, ex + w + 0.15, hy - 0.1, ex + w + 0.22, hy - 0.2], 0.06, lash);   // a flick at the outer corner
        K.curve([ex - w * 0.6, hy + h * 0.8, ex, hy + h * 1.15, ex + w * 0.75, hy + h * 0.6], 0.06, alpha(dark, 0.45));
      };
      eye(hx - 0.85, 1, true); eye(hx + 1.38, 0.88, false);
      // the brows: thick at the inner end, tapering out
      const bc = o.brow || '#5a3a28', bt = o.browTilt || 0;
      K.shape(q => { q.moveTo(hx - 0.1, hy - 0.62 - bt * 0.6); q.quadraticCurveTo(hx - 0.25, hy - 1.05 - bt * 0.6, hx - 0.8, hy - 1.1 - bt * 0.3); q.quadraticCurveTo(hx - 1.4, hy - 1.08, hx - 1.85, hy - 0.6 + bt); q.quadraticCurveTo(hx - 1.3, hy - 0.86, hx - 0.8, hy - 0.84 - bt * 0.3); q.quadraticCurveTo(hx - 0.35, hy - 0.8 - bt * 0.6, hx - 0.1, hy - 0.62 - bt * 0.6); q.closePath(); }, bc);
      K.shape(q => { q.moveTo(hx + 0.72, hy - 0.64 - bt * 0.6); q.quadraticCurveTo(hx + 0.85, hy - 1.02 - bt * 0.6, hx + 1.4, hy - 1.06 - bt * 0.3); q.quadraticCurveTo(hx + 1.95, hy - 1.0, hx + 2.25, hy - 0.58 + bt); q.quadraticCurveTo(hx + 1.85, hy - 0.84, hx + 1.4, hy - 0.84 - bt * 0.3); q.quadraticCurveTo(hx + 1.0, hy - 0.8 - bt * 0.6, hx + 0.72, hy - 0.64 - bt * 0.6); q.closePath(); }, bc);
      // the nose: the far side in shadow, a soft lit bridge and tip, the wing of the nostril, the shadow it casts
      const nl = o.nose || 1, ny = hy + 1.2 * nl;
      H.soft(0.25, () => K.shape(q => { q.moveTo(hx + 0.5, hy - 0.35); q.quadraticCurveTo(hx + 1.15, hy + 0.7 * nl, hx + 1.15, ny + 0.1); q.quadraticCurveTo(hx + 0.8, ny + 0.4, hx + 0.5, ny + 0.2); q.closePath(); }, alpha(dark, 0.35)));
      H.soft(0.18, () => K.line([hx + 0.28, hy - 0.4, hx + 0.38, ny - 0.3], 0.2, alpha(shade(skin, 38), 0.45)));
      H.soft(0.12, () => K.ell(hx + 0.45, ny - 0.05, 0.3, 0.22, alpha(shade(skin, 34), 0.55)));
      K.curve([hx + 0.1, ny + 0.1, hx + 0.25, ny + 0.35, hx + 0.55, ny + 0.3], 0.07, alpha(dark, 0.5));     // the near wing
      K.ell(hx + 0.82, ny + 0.24, 0.17, 0.08, alpha(deep, 0.6));                                            // the nostril
      H.soft(0.2, () => K.ell(hx + 0.7, ny + 0.48, 0.55, 0.16, alpha(dark, 0.35)));                         // its shadow on the lip
      // the mouth
      const my = hy + 2.05 + (nl - 1) * 0.6, lip = o.lip || shade(skin, -24), mw = o.mouthW || 1;
      H.soft(0.12, () => K.line([hx + 0.45, ny + 0.5, hx + 0.48, my - 0.25], 0.18, alpha(dark, 0.2)));     // the groove above the lip
      if (o.mouth === 'grin') {
        K.shape(q => { q.moveTo(hx - 0.5 * mw, my - 0.08); q.quadraticCurveTo(hx + 0.5, my + 0.12, hx + 1.5 * mw, my - 0.22); q.quadraticCurveTo(hx + 1.1, my + 0.8, hx + 0.4, my + 0.78); q.quadraticCurveTo(hx - 0.2, my + 0.58, hx - 0.5 * mw, my - 0.08); q.closePath(); }, '#5a2422');
        K.shape(q => { q.moveTo(hx - 0.28, my + 0.02); q.quadraticCurveTo(hx + 0.5, my + 0.16, hx + 1.28, my - 0.12); q.lineTo(hx + 1.18, my + 0.2); q.quadraticCurveTo(hx + 0.5, my + 0.36, hx - 0.18, my + 0.22); q.closePath(); }, '#f2ebe2');
        K.shape(q => { q.moveTo(hx - 0.5 * mw, my - 0.08); q.quadraticCurveTo(hx + 0.5, my + 0.04, hx + 1.5 * mw, my - 0.22); q.quadraticCurveTo(hx + 0.5, my - 0.25, hx - 0.5 * mw, my - 0.08); q.closePath(); }, shade(lip, -15));
        K.curve([hx + 0.0, my + 0.82, hx + 0.45, my + 0.98, hx + 0.95, my + 0.8], 0.12, alpha(lip, 0.8));
        H.soft(0.15, () => { K.curve([hx - 0.6 * mw, my - 0.12, hx - 0.8, my - 0.4, hx - 0.85, my - 0.65], 0.09, alpha(dark, 0.45)); K.curve([hx + 1.55 * mw, my - 0.25, hx + 1.75, my - 0.5, hx + 1.75, my - 0.75], 0.08, alpha(dark, 0.4)); });
      } else {
        const curl = o.mouth === 'smirk' || o.mouth === 'smile' ? -0.2 : o.mouth === 'frown' ? 0.14 : 0, cl = o.mouth === 'smile' || o.mouth === 'frown' ? curl * 0.8 : curl * 0.3;
        K.shape(q => { q.moveTo(hx - 0.45 * mw, my + cl); q.quadraticCurveTo(hx + 0.15, my - 0.3, hx + 0.48, my - 0.15); q.quadraticCurveTo(hx + 0.85, my - 0.3, hx + 1.3 * mw, my + curl); q.quadraticCurveTo(hx + 0.5, my + 0.04, hx - 0.45 * mw, my + cl); q.closePath(); }, shade(lip, -22));
        K.shape(q => { q.moveTo(hx - 0.32 * mw, my + 0.05); q.quadraticCurveTo(hx + 0.5, my + 0.12, hx + 1.2 * mw, my + curl + 0.05); q.quadraticCurveTo(hx + 0.6, my + 0.58, hx - 0.15, my + 0.36); q.closePath(); }, lip);
        H.soft(0.1, () => K.ell(hx + 0.38, my + 0.27, 0.3, 0.09, 'rgba(255,236,226,.4)'));
        K.curve([hx - 0.45 * mw, my + cl, hx + 0.5, my + 0.07, hx + 1.3 * mw, my + curl], 0.075, alpha(deep, 0.85));
        if (o.mouth === 'smirk') H.soft(0.1, () => K.curve([hx + 1.3 * mw, my + curl, hx + 1.5, my - 0.35, hx + 1.55, my - 0.55], 0.07, alpha(dark, 0.45)));
      }
      if (o.scar) K.line([hx + 1.9, hy - 1.4, hx + 1.4, hy + 1.0], 0.14, 'rgba(240,196,186,.75)');
      return head;
    };
    // a torso of cloth or leather: a path with a gradient lit from the left and soft vertical folds
    X.cloth = function (fn, col, folds, o) {
      o = o || {};
      const p = K.shape(fn, K.lin(o.x0 == null ? 12 : o.x0, 0, o.x1 == null ? 28 : o.x1, 0, [[0, shade(col, 30)], [0.4, col], [0.8, shade(col, -22)], [1, shade(col, -44)]]));
      K.clip(p, () => { for (const f of folds || []) H.fold(f[0], f[1] || 0.9, f[2], f[3]); if (o.inner) o.inner(p); });
      return p;
    };
    // textures, clipped to a path within box [x0, y0, x1, y1]: wool and linen weave, leather grain, worn metal, wood grain, fur, hair
    const R = H.rr;
    X.tex = function (p, kind, box, o) {
      o = o || {}; const [x0, y0, x1, y1] = box, W = x1 - x0, Hh = y1 - y0, area = W * Hh, at = () => [x0 + R() * W, y0 + R() * Hh];
      K.clip(p, () => {
        if (kind === 'wool' || kind === 'linen') {
          const sp = kind === 'wool' ? 0.28 : 0.2, a = o.a || (kind === 'wool' ? 0.08 : 0.06);
          for (let x = x0 - Hh; x < x1; x += sp) K.line([x, y0, x + Hh, y1], 0.045, 'rgba(255,248,232,' + a + ')');
          for (let x = x0; x < x1 + Hh; x += sp) K.line([x, y0, x - Hh, y1], 0.045, 'rgba(0,0,0,' + a + ')');
          for (let i = 0; i < area * 0.16; i++) { const [x, y] = at(); K.line([x, y, x + 0.3 + R() * 0.3, y + (R() - 0.5) * 0.1], 0.06, R() > 0.5 ? 'rgba(255,248,232,.13)' : 'rgba(0,0,0,.13)'); }
        }
        if (kind === 'leather') {
          for (let i = 0; i < area * 0.45; i++) { const [x, y] = at(); K.ell(x, y, 0.12 + R() * 0.3, 0.06 + R() * 0.16, R() > 0.5 ? 'rgba(255,232,204,.08)' : 'rgba(20,8,0,.1)'); }
          for (let i = 0; i < area * 0.05; i++) { const [x, y] = at(), l = 0.4 + R() * 0.8, d = (R() - 0.5) * 0.5; K.curve([x, y, x + l / 2, y + d, x + l, y], 0.06, 'rgba(20,8,0,.28)'); K.curve([x, y + 0.08, x + l / 2, y + d + 0.08, x + l, y + 0.08], 0.05, 'rgba(255,232,204,.18)'); }
          for (let i = 0; i < area * 0.02; i++) { const [x, y] = at(), a = R() * 6.28, l = 0.3 + R() * 0.6; K.line([x, y, x + Math.cos(a) * l, y + Math.sin(a) * l], 0.05, 'rgba(255,240,220,.3)'); }
        }
        if (kind === 'metal') {
          for (let i = 0; i < area * 0.6; i++) { const [x, y] = at(), a = (o.dir || 0) + (R() - 0.5) * 0.6, l = 0.2 + R() * 0.9; K.line([x, y, x + Math.cos(a) * l, y + Math.sin(a) * l], 0.035, R() > 0.5 ? 'rgba(255,255,255,.28)' : 'rgba(0,0,0,.2)'); }
          for (let i = 0; i < area * 0.12; i++) { const [x, y] = at(); K.ell(x, y, 0.06, 0.06, 'rgba(70,46,34,.3)'); }
        }
        if (kind === 'wood') {
          const a = o.dir || 0, ca = Math.cos(a), sa = Math.sin(a);
          for (let i = 0; i < area * 0.35; i++) { const [x, y] = at(), l = 0.8 + R() * 2, w = (R() - 0.5) * 0.2; K.curve([x, y, x + ca * l / 2 - sa * w, y + sa * l / 2 + ca * w, x + ca * l, y + sa * l], 0.05, R() > 0.5 ? 'rgba(255,230,190,.2)' : 'rgba(40,20,0,.25)'); }
        }
        if (kind === 'fur') {
          const a0 = o.dir == null ? 1.57 : o.dir;
          for (let i = 0; i < area * (o.n || 2); i++) { const [x, y] = at(), l = 0.25 + R() * 0.4, a = a0 + (R() - 0.5) * 0.7; K.line([x, y, x + Math.cos(a) * l, y + Math.sin(a) * l], 0.045, R() > 0.5 ? 'rgba(255,252,240,.18)' : 'rgba(110,86,60,.16)'); }
          for (let i = 0; i < area * 0.06; i++) { const [x, y] = at(); H.soft(0.2, () => K.ell(x, y, 0.5, 0.35, R() > 0.5 ? 'rgba(255,250,236,.12)' : 'rgba(90,70,50,.1)')); }
        }
        if (kind === 'hair') {
          for (let i = 0; i < area * (o.n || 3); i++) { const [x, y] = at(), a = o.flow ? o.flow(x, y) : 1.57, l = (0.6 + R() * 1.2) * (o.len || 1), b = a + (R() - 0.5) * 0.3;
            K.curve([x, y, x + Math.cos(a) * l / 2, y + Math.sin(a) * l / 2, x + Math.cos(b) * l, y + Math.sin(b) * l], o.w || 0.045, R() > 0.45 ? alpha(shade(o.col, 50), 0.45) : alpha(shade(o.col, -60), 0.4)); }
          if (o.sheen) H.soft(0.3, () => K.curve(o.sheen, o.sheenW || 0.5, 'rgba(255,255,240,.28)'));
        }
      });
    };
    X.qp = (x0, y0, cx, cy, x1, y1, n) => { const a = []; n = n || 14; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; a.push(u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1); } return a; };
    X.stitch = (pts, col, w) => { c.save(); c.setLineDash([0.24, 0.17]); K.line(pts, w || 0.07, col || 'rgba(255,236,200,.6)'); c.restore(); };
    X.rivet = (x, y, r, col) => K.ell(x, y, r, r, K.rad(x - r * 0.3, y - r * 0.3, 0.01, r, [[0, '#fff4d8'], [0.4, col], [1, shade(col, -60)]]));
    // an embroidered band along a polyline: gold edges, the cloth between, a running chain of gold lozenges
    X.band = (pts, w, col, gold) => {
      K.line(pts, w, shade(gold, -30)); K.line(pts, w - 0.12, gold); K.line(pts, w - 0.3, col);
      c.save(); c.setLineDash([0.22, 0.2]); K.line(pts, w * 0.34, gold); c.restore();
      c.save(); c.setLineDash([0.05, 0.37]); K.line(pts, w * 0.16, '#fff4c8'); c.restore();
    };
    // a small buckle: a frame and a tongue
    X.buckle = (x, y, w, h, col) => { K.R(x - w / 2, y - h / 2, w, h, 'rgba(0,0,0,0)', 0.1); c.save(); c.strokeStyle = col; c.lineWidth = 0.16; c.strokeRect(x - w / 2, y - h / 2, w, h); c.restore(); K.line([x - w / 2, y, x + w * 0.2, y], 0.1, shade(col, 30)); };
    return X;
  };

  const P = {};                                                     // the four painters

  /* ---------- Finch: a fencer's stance, the rapier out, the lute slung across his back, a wine cape ---------- */
  P.finch = function (cOut) {
    const H = B.heroicKit(cOut, 7171), { c, K, shade, alpha } = H, X = A.make(H);
    const SKIN = '#e8b896', DOUB = '#9a3046', TRIM = '#e0b450', SHIRT = '#f6ecd6', HOSE = '#4c4a66', BOOT = '#7a4c2c', CAPE = '#7e2a44', HAT = '#5c3456', HAIR = '#f0c868', WOOD = '#b07434';
    // the lute on his back: the bowl behind his left shoulder, the neck up past his head
    c.save(); c.translate(18.4, 23.2); c.rotate(0.62);                // slung across his back: the bowl behind him, the neck over his right shoulder
    const bowl = K.shape(q => q.ellipse(0, 0, 4.2, 5.2, 0, 0, 6.283), K.rad(-1.2, -1.6, 0.4, 6, [[0, shade(WOOD, 40)], [0.6, WOOD], [1, shade(WOOD, -55)]]));
    X.tex(bowl, 'wood', [-4.2, -5.2, 4.2, 5.2], { dir: 1.57 });
    for (let i = -3; i <= 3; i++) K.curve([i * 1.1, -5, i * 1.25, 0, i * 1.1, 5], 0.07, alpha(shade(WOOD, -70), 0.6));
    K.R(-0.7, -13, 1.4, 9, K.lin(-0.7, 0, 0.7, 0, [[0, shade(WOOD, 20)], [1, shade(WOOD, -50)]]), 0.3);
    for (let y = -12.4; y < -5; y += 1.05) K.line([-0.7, y, 0.7, y], 0.07, '#e8d8b0');
    K.R(-1, -15, 2, 2.6, shade(WOOD, -40), 0.4); for (const y of [-14.6, -13.6]) { K.ell(-1.2, y, 0.25, 0.25, TRIM); K.ell(1.2, y, 0.25, 0.25, TRIM); }
    c.restore();
    // the cape, flung back off his right shoulder, falling behind
    X.cloth(q => { q.moveTo(22.5, 14.2); q.quadraticCurveTo(28.5, 15, 30.4, 22); q.quadraticCurveTo(32, 32, 34.2, 41.6); q.quadraticCurveTo(31.2, 43, 28.6, 41.2); q.quadraticCurveTo(27.4, 34, 24.6, 26); q.closePath(); },
      CAPE, [[[26, 18, 28.6, 30, 31, 41], 0.9], [[24.6, 20, 26, 30, 28.6, 40], 0.7]], { x0: 22, x1: 34, inner: p => { X.tex(p, 'wool', [22, 14, 35, 43], { a: 0.06 }); H.soft(0.5, () => K.curve([27.2, 18, 29.4, 28, 32.2, 39], 0.35, 'rgba(255,220,230,.16)')); } });
    X.band(X.qp(28.4, 41.1, 31.4, 42.9, 34.3, 41.5), 0.75, CAPE, TRIM);
    X.band(X.qp(24.7, 26.1, 27.3, 33.6, 28.5, 41.1), 0.5, CAPE, TRIM);
    // legs in a fencer's stance: left back and turned out, right forward, knees soft
    X.limb([[17.4, 27.2], [15.4, 33.6], [13.6, 38.8], [12.8, 44.2]], [3.3, 2.8, 2.4, 1.9], HOSE, { joint: 1, inner: p => X.tex(p, 'linen', [10, 26, 20, 45]) });
    X.limb([[21.6, 27.2], [23.6, 32.6], [25.6, 37.6], [26.4, 43.6]], [3.4, 2.9, 2.5, 1.9], HOSE, { joint: 2, inner: p => X.tex(p, 'linen', [19, 26, 29, 45]) });
    for (const [bx, w, h, d] of [[12.6, 2.7, 8.4, -1], [26.8, 2.8, 8.6, 1]]) {
      const bp = X.boot(bx, 51, w, h, BOOT, d, { cuff: 1.6 }); X.tex(bp, 'leather', [bx - 4, 42, bx + 4, 51]);
      X.stitch([bx + w * 0.42, 51 - h + 1.8, bx + w * 0.45, 49.4], 'rgba(255,226,180,.45)');
      K.R(bx - w / 2 - 0.1, 47.6, w + 0.2, 0.55, shade(BOOT, -40), 0.15); X.buckle(bx + d * 0.6, 47.88, 0.55, 0.6, TRIM);
    }
    // the doublet: fitted, short skirts, gold piping and buttons; the shirt's collar and cuffs
    const body = X.cloth(q => { q.moveTo(15.4, 14.6); q.quadraticCurveTo(19.8, 13.6, 24.2, 14.4); q.quadraticCurveTo(25.2, 20, 24.4, 25.6); q.quadraticCurveTo(25.8, 27.4, 25, 29.4); q.quadraticCurveTo(19.6, 30.6, 14.2, 29.4); q.quadraticCurveTo(13.6, 27.4, 15, 25.6); q.quadraticCurveTo(14.2, 20, 15.4, 14.6); q.closePath(); },
      DOUB, [[[17.4, 16, 17, 22, 17.6, 28], 0.6], [[22.4, 16, 22.8, 22, 22.2, 28], 0.6], [[15, 26, 19.6, 27.2, 24.6, 26], 0.5]], { x0: 14, x1: 26 });
    K.clip(body, () => {
      for (let y = 15.6, r = 0; y < 30; y += 1.15, r++) for (let x = 14.6 + (r % 2) * 0.6; x < 25.6; x += 1.2) { const g = alpha(shade(DOUB, 34), 0.5); for (const [dx, dy] of [[0.13, 0], [-0.13, 0], [0, 0.13], [0, -0.13]]) K.ell(x + dx, y + dy, 0.1, 0.1, g); K.ell(x, y, 0.05, 0.05, alpha(TRIM, 0.55)); }
      H.soft(0.6, () => { K.curve([16, 16, 15.6, 21, 16.2, 25], 0.7, 'rgba(255,220,230,.2)'); K.curve([21.2, 16, 21.4, 21, 21.2, 25], 0.5, 'rgba(255,220,230,.14)'); });
      for (const x of [17.2, 22.6]) K.line([x, 15, x - 0.1, 29], 0.22, alpha(TRIM, 0.8));
      for (const x of [15.6, 18.2, 21.6, 24]) { K.curve([x, 28.6, x + 0.5, 27.2, x + 1, 28.2], 0.09, TRIM); K.curve([x + 1, 28.2, x + 0.75, 28.8, x + 0.55, 28.3], 0.07, TRIM); }
    });
    K.curve([19.9, 14.4, 19.8, 21, 20, 29.6], 0.26, TRIM); for (let y = 16; y < 26; y += 1.6) { K.ell(20, y, 0.32, 0.32, TRIM); K.ell(19.92, y - 0.08, 0.12, 0.12, '#fff2c0'); }
    const belt = K.shape(q => q.rect(14.4, 24.8, 11.2, 1.1), shade(BOOT, -10)); X.tex(belt, 'leather', [14, 24.6, 26, 26]); X.stitch([14.6, 25.05, 25.4, 25.05], 'rgba(255,226,180,.4)', 0.05); X.stitch([14.6, 25.65, 25.4, 25.65], 'rgba(255,226,180,.4)', 0.05);
    K.R(19.2, 24.6, 1.6, 1.5, TRIM, 0.2); K.R(19.55, 24.95, 0.9, 0.8, shade(BOOT, -20), 0.1); K.line([19.5, 25.35, 20.3, 25.35], 0.12, '#fff0b0');     // a gold buckle
    const purse = K.shape(q => { q.moveTo(22.4, 25.8); q.lineTo(24.4, 25.8); q.quadraticCurveTo(24.6, 28.2, 23.4, 28.4); q.quadraticCurveTo(22.2, 28.2, 22.4, 25.8); q.closePath(); }, K.lin(22.4, 0, 24.6, 0, [[0, shade(BOOT, 20)], [1, shade(BOOT, -30)]])); X.tex(purse, 'leather', [22, 25.6, 25, 28.6]);
    K.curve([22.4, 26.4, 23.4, 27, 24.4, 26.4], 0.12, shade(BOOT, -50)); X.rivet(23.4, 26.8, 0.2, TRIM);
    // the scabbard, empty, at his left hip
    K.line([15.2, 26, 10.4, 36.8], 0.9, '#2a2020'); K.line([15.2, 26, 10.4, 36.8], 0.3, shade('#2a2020', 40));
    K.line([15.1, 26.2, 14.5, 27.6], 0.95, TRIM); K.line([10.9, 35.6, 10.4, 36.8], 0.95, TRIM); K.ell(10.35, 36.9, 0.45, 0.4, TRIM);
    // the left arm back and raised for balance, open hand; the right arm forward with the rapier, en garde
    const slash = (x0, y0, x1, y1) => { const a = Math.atan2(y1 - y0, x1 - x0); for (const t of [0.22, 0.5, 0.78]) { const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; for (const o of [-0.6, 0, 0.6]) { const px = x - Math.sin(a) * o, py = y + Math.cos(a) * o; K.shape(q => q.ellipse(px, py, 0.5, 0.16, a, 0, 6.283), shade(DOUB, -55)); K.shape(q => q.ellipse(px + 0.03, py + 0.03, 0.4, 0.09, a, 0, 6.283), K.lin(px, py - 0.1, px, py + 0.1, [[0, '#fffaf0'], [1, shade(SHIRT, -25)]])); } } };
    X.limb([[15.6, 15.8], [12.6, 19.2], [10.4, 16.2]], [3, 2.3, 1.8], DOUB, { joint: 1 }); slash(15.6, 15.8, 12.6, 19.2);
    K.ell(10.2, 15.6, 1.05, 0.75, SHIRT); X.fist(9.6, 14.6, -1.2, SKIN, 0.9);
    X.limb([[23.6, 15.8], [26.2, 20.2], [29.2, 22.6]], [3.1, 2.4, 1.9], DOUB, { joint: 1 }); slash(23.6, 15.8, 26.2, 20.2);
    K.ell(29.4, 22.8, 1.1, 0.8, SHIRT); for (let i = 0; i < 6; i++) K.ell(28.6 + i * 0.3, 23.5 - i * 0.12, 0.18, 0.14, '#ffffff');
    // the rapier: a swept hilt, the blade long and fine toward the upper right
    K.line([30.6, 23.1, 38.6, 8.4], 0.36, '#c8ccd6'); K.line([30.6, 23.1, 38.6, 8.4], 0.12, '#f4f6fa'); K.line([31.1, 22.2, 33.6, 17.6], 0.07, 'rgba(60,70,90,.6)');
    K.ell(29.6, 24.6, 0.42, 0.42, TRIM); K.ell(29.45, 24.45, 0.14, 0.14, '#fff4c8');
    K.curve([29.2, 24.2, 31.4, 25.4, 32.4, 22.2], 0.22, TRIM); K.curve([29.6, 21.6, 31.6, 20.6, 31.8, 22.8], 0.18, TRIM); K.ell(30.1, 24.6, 0.45, 0.45, TRIM);
    X.fist(30.4, 23.4, -0.4, SKIN, 0.95);
    // the collar
    K.shape(q => { q.moveTo(17.2, 14.2); q.quadraticCurveTo(19.9, 16.4, 22.8, 14.2); q.quadraticCurveTo(21.8, 13.2, 19.9, 13.6); q.quadraticCurveTo(18, 13.2, 17.2, 14.2); q.closePath(); }, SHIRT);
    { const lp = X.qp(17.2, 14.2, 19.9, 16.4, 22.8, 14.2, 12); for (let i = 0; i < lp.length; i += 2) { K.ell(lp[i], lp[i + 1] + 0.1, 0.26, 0.2, '#fffaf0'); K.ell(lp[i], lp[i + 1] + 0.12, 0.08, 0.06, 'rgba(160,140,110,.5)'); } }
    // the head: fair, clean-shaven, a knowing smile; hair to the jaw
    const hx = 20.8, hy = 9.6;
    K.shape(q => { q.moveTo(hx - 3, hy - 2); q.quadraticCurveTo(hx - 3.6, hy + 2.6, hx - 2.2, hy + 4.4); q.lineTo(hx - 0.6, hy + 1.2); q.closePath(); }, shade(HAIR, -40));   // hair behind
    X.head(hx, hy, { skin: SKIN, eye: '#3e7cc4', brow: '#b08838', mouth: 'grin', browTilt: -0.18, jaw: 3.0, neckLen: 1.6, lip: '#c4706a', mole: [1.95, 1.7], dimple: true });
    // hair: long, fair, swept back from the face
    const hairP = K.shape(q => { q.moveTo(hx - 2.6, hy - 1.6); q.quadraticCurveTo(hx - 2.9, hy + 1.8, hx - 2.2, hy + 3.6); q.quadraticCurveTo(hx - 1.6, hy + 2, hx - 1.7, hy - 0.6); q.quadraticCurveTo(hx - 0.4, hy - 2.2, hx + 2.2, hy - 2.1); q.lineTo(hx + 2, hy - 3); q.closePath(); },
      K.lin(hx - 3, 0, hx + 2, 0, [[0, shade(HAIR, -30)], [0.5, HAIR], [1, shade(HAIR, 20)]]));
    X.tex(hairP, 'hair', [hx - 3, hy - 3.2, hx + 2.4, hy + 3.8], { col: HAIR, n: 6, flow: (x, y) => y < hy - 1.2 ? 3.0 : 1.75, sheen: [hx - 2.6, hy - 0.8, hx - 2.4, hy + 1, hx - 2.1, hy + 2.6], sheenW: 0.35 });
    // the hat: a broad brim cocked up on one side, a band, a long cream plume sweeping back
    const brim = K.shape(q => { q.ellipse(hx + 0.2, hy - 2.7, 6.2, 1.35, -0.12, 0, 6.283); }, K.lin(hx - 6, 0, hx + 6, 0, [[0, shade(HAT, 40)], [0.5, HAT], [1, shade(HAT, -45)]]));
    X.tex(brim, 'wool', [hx - 6.2, hy - 4.2, hx + 6.6, hy - 1.2], { a: 0.05 }); X.stitch(X.qp(hx - 5.6, hy - 2.3, hx + 0.2, hy - 0.9, hx + 6, hy - 3.2), 'rgba(255,220,240,.3)', 0.05);
    H.soft(0.35, () => K.ell(hx + 0.6, hy - 1.9, 3.6, 0.7, 'rgba(0,0,0,.45)'));
    const crown = K.shape(q => { q.moveTo(hx - 2.8, hy - 2.9); q.quadraticCurveTo(hx - 2.8, hy - 6.6, hx + 0.3, hy - 6.8); q.quadraticCurveTo(hx + 3.5, hy - 6.6, hx + 3.3, hy - 3.2); q.closePath(); }, K.lin(hx - 3, 0, hx + 3.6, 0, [[0, shade(HAT, 36)], [1, shade(HAT, -40)]]));
    X.tex(crown, 'wool', [hx - 3, hy - 7, hx + 3.6, hy - 2.8], { a: 0.05 }); K.clip(crown, () => H.soft(0.3, () => K.curve([hx + 0.2, hy - 6.7, hx + 0.6, hy - 5, hx + 0.3, hy - 3.6], 0.3, 'rgba(0,0,0,.25)')));
    K.shape(q => { q.moveTo(hx - 2.8, hy - 3.6); q.quadraticCurveTo(hx + 0.3, hy - 4.3, hx + 3.3, hy - 3.8); q.lineTo(hx + 3.3, hy - 3.1); q.quadraticCurveTo(hx + 0.3, hy - 3.6, hx - 2.8, hy - 2.9); q.closePath(); }, TRIM);
    X.buckle(hx + 1.5, hy - 3.55, 0.8, 0.75, '#fff0b0'); K.ell(hx - 1.7, hy - 3.5, 0.32, 0.36, K.rad(hx - 1.8, hy - 3.6, 0.02, 0.36, [[0, '#ffd0e0'], [0.5, '#c02850'], [1, '#601020']]));
    const plume = K.shape(q => { q.moveTo(hx - 2.2, hy - 4); q.quadraticCurveTo(hx - 6.6, hy - 10.4, hx - 11.4, hy - 6.4); q.quadraticCurveTo(hx - 7.6, hy - 7.8, hx - 6.4, hy - 5.6); q.quadraticCurveTo(hx - 9.2, hy - 5, hx - 10.2, hy - 2.4); q.quadraticCurveTo(hx - 6, hy - 5.2, hx - 2.2, hy - 4); q.closePath(); },
      K.lin(hx - 11, hy - 8, hx - 2, hy - 4, [[0, '#f4ead4'], [0.7, '#e2d2b0'], [1, '#b89a6a']]));
    K.clip(plume, () => { for (let i = 0; i < 160; i++) { const t = H.rr(), x = hx - 2.2 - t * 9, y = hy - 4 - Math.sin(t * 3) * 3.2; K.line([x, y, x - 0.6 - H.rr() * 0.4, y + 1.2 + H.rr() * 0.9], 0.04, H.rr() > 0.5 ? 'rgba(255,255,245,.5)' : 'rgba(150,120,80,.35)'); } for (let i = 0; i < 44; i++) { const t = i / 44, x = hx - 2.2 - t * 9, y = hy - 4 - Math.sin(t * 3) * 3.2; K.line([x, y, x - 0.7, y + 1.7], 0.07, 'rgba(150,120,80,.45)'); } });
    K.curve([hx - 2.2, hy - 3.8, hx - 6.8, hy - 9, hx - 11, hy - 6.2], 0.12, '#b89a6a');
    H.finish({ shadowW: 12, wear: 'cloth', clean: [[hx + 0.2, hy + 0.6, 3.1, 4.4]], grade: 0.14, pop: 'saturate(1.12) brightness(1.06)' });
    return null;
  };


  /* ---------- Runa: a wide stance, the great axe two-handed across her, the wolf pelt on her shoulders ---------- */
  P.runa = function (cOut) {
    const H = B.heroicKit(cOut, 4242), { c, K, shade, alpha } = H, X = A.make(H);
    const SKIN = '#eebf9c', HAIR = '#d2582a', PELT = '#ece2cc', LEATH = '#7a4e30', KILT = '#8e6640', WRAP = '#8a7058', BOOT = '#a08a6c', IRON = '#a4aab6', HAFT = '#86582e', WOAD = 'rgba(22,52,140,.82)';
    // the pelt, hanging behind her to the knees
    X.cloth(q => { q.moveTo(13.4, 14.6); q.quadraticCurveTo(10.4, 22, 10.6, 36.4); q.quadraticCurveTo(14, 38.6, 16.4, 36.8); q.lineTo(24.2, 36.8); q.quadraticCurveTo(27, 38.6, 30, 36.4); q.quadraticCurveTo(30, 22, 27.2, 14.6); q.closePath(); },
      PELT, [[[13, 20, 12, 28, 12.4, 36], 0.9], [[27.4, 20, 28.4, 28, 28.4, 36], 0.9]], { x0: 10, x1: 30, inner: p => X.tex(p, 'fur', [10, 14, 30.4, 39], { n: 1.6 }) });
    for (let i = 0; i < 40; i++) { const t = i / 40, x = 10.6 + t * 19.4, y = 36.6 + Math.sin(t * 3.14 * 2) * 1 + (t > 0.28 && t < 0.7 ? 0.2 : 1.2); K.poly([x - 0.3, y - 0.6, x + (H.rr() - 0.5) * 0.5, y + 0.6 + H.rr() * 0.5, x + 0.3, y - 0.6], H.rr() > 0.5 ? shade(PELT, -12) : shade(PELT, 6)); }
    // legs, wide apart, wrapped from knee to ankle; fur boots
    X.limb([[17.2, 30], [14.8, 36.4], [13.4, 41.2], [12.8, 44.6]], [3.9, 3.3, 2.9, 2.3], SKIN, { joint: 1 });
    X.limb([[23.4, 30], [25.8, 36.4], [27.2, 41.2], [27.8, 44.6]], [3.9, 3.3, 2.9, 2.3], SKIN, { joint: 1 });
    for (const [x0, x1] of [[14.6, 12.8], [25.8, 27.8]]) for (let i = 0; i < 6; i++) { const t = i / 6, x = x0 + (x1 - x0) * t, y = 37.6 + t * 7; K.line([x - 1.5, y, x + 1.5, y + 0.9], 0.55, shade(WRAP, i % 2 ? -10 : 10)); K.line([x - 1.5, y + 0.25, x + 1.5, y + 1.15], 0.1, 'rgba(0,0,0,.3)'); for (let k = 0; k < 7; k++) K.line([x - 1.4 + k * 0.42, y + 0.1 + k * 0.12, x - 1.35 + k * 0.42, y + 0.55 + k * 0.12], 0.05, 'rgba(255,240,220,.18)'); }
    for (const [x0, x1] of [[14.6, 12.8], [25.8, 27.8]]) for (let i = 0; i < 4; i++) { const ya = 37.8 + i * 1.8, xa = x0 + (x1 - x0) * (i / 4); K.line([xa - 1.3, ya, xa + 1.2, ya + 1.6], 0.14, '#3a2416'); K.line([xa + 1.3, ya, xa - 1.2, ya + 1.6], 0.14, '#4a301e'); }
    for (const [bx, d] of [[12.6, -1], [28, 1]]) { const bp = X.boot(bx, 51, 3.4, 6.6, BOOT, d, { cuff: 2 }); X.tex(bp, 'fur', [bx - 4, 44, bx + 4, 51], { n: 3 }); K.line([bx - 1.7, 48.6, bx + 1.7, 48.8], 0.3, '#4a301e'); X.rivet(bx + d * 0.9, 48.7, 0.22, '#c8a050'); }
    for (const x of [12.6, 28]) for (let i = 0; i < 14; i++) K.line([x - 1.9 + i * 0.28, 44.6, x - 2 + i * 0.28 + (H.rr() - 0.5) * 0.4, 46.4], 0.14, i % 2 ? 'rgba(255,248,232,.35)' : 'rgba(60,44,30,.4)');
    // the kilt of leather strips
    for (let i = 0; i < 9; i++) { const x = 14 + i * 1.45, w = 1.4; X.cloth(q => { q.moveTo(x, 25.6); q.lineTo(x + w, 25.6); q.lineTo(x + w + (i - 4) * 0.18, 33 + (i % 3) * 0.6); q.lineTo(x + (i - 4) * 0.18, 33.4 + (i % 2) * 0.5); q.closePath(); }, shade(KILT, (i % 3 - 1) * 8), [], { x0: x - 1, x1: x + w + 1, inner: p => X.tex(p, 'leather', [x - 1, 25.5, x + w + 1, 34]) }); X.stitch([x + 0.2 + (i - 4) * 0.16, 32.6 + (i % 3) * 0.5, x + w - 0.2 + (i - 4) * 0.16, 32.4 + (i % 3) * 0.5], 'rgba(255,230,190,.4)', 0.05); X.rivet(x + w / 2, 26.9, 0.2, '#b8b8c0'); }
    // the jerkin: laced up the front, a broad belt with a bronze boss
    X.cloth(q => { q.moveTo(14.6, 15.6); q.quadraticCurveTo(20.3, 14.4, 26, 15.6); q.quadraticCurveTo(27, 21, 26.2, 26.4); q.quadraticCurveTo(20.3, 27.4, 14.4, 26.4); q.quadraticCurveTo(13.6, 21, 14.6, 15.6); q.closePath(); },
      LEATH, [[[17, 17, 16.6, 22, 17, 26], 0.7], [[23.6, 17, 24, 22, 23.6, 26], 0.7]], { x0: 13.6, x1: 27, inner: p => X.tex(p, 'leather', [13.6, 14.4, 27, 27.4]) });
    X.stitch(X.qp(15.1, 16.4, 14.4, 21, 15.1, 25.6), 'rgba(255,226,180,.45)'); X.stitch(X.qp(25.5, 16.4, 26.2, 21, 25.5, 25.6), 'rgba(255,226,180,.35)'); X.stitch([19.3, 16.4, 19.3, 24.4], 'rgba(255,226,180,.35)', 0.05); X.stitch([21.3, 16.4, 21.3, 24.4], 'rgba(255,226,180,.35)', 0.05);
    for (let y = 16.6; y < 24; y += 1.1) { K.line([19.6, y, 21, y + 0.9], 0.16, '#c8b090'); K.line([21, y, 19.6, y + 0.9], 0.16, '#a89070'); }
    const rbelt = K.shape(q => q.rect(13.8, 24.6, 13, 1.9), K.lin(0, 24.6, 0, 26.5, [[0, shade(LEATH, 10)], [1, shade(LEATH, -50)]])); X.tex(rbelt, 'leather', [13.6, 24.4, 27, 26.6]);
    for (const x of [15, 16.6, 24, 25.6]) X.rivet(x, 25.55, 0.24, '#c8a050');
    K.ell(20.3, 25.5, 1.25, 1.05, K.rad(19.9, 25.1, 0.1, 1.3, [[0, '#f0c880'], [0.6, '#b8822e'], [1, '#6a4418']]));
    c.save(); c.strokeStyle = '#6a4418'; c.lineWidth = 0.08; c.beginPath(); c.ellipse(20.3, 25.5, 0.8, 0.66, 0, 0, 6.283); c.stroke(); c.restore();
    for (let k = 0; k < 8; k++) { const a = k * 0.785; K.ell(20.3 + Math.cos(a) * 1.0, 25.5 + Math.sin(a) * 0.83, 0.08, 0.08, '#f8dca0'); } K.ell(20.15, 25.35, 0.25, 0.2, 'rgba(255,248,220,.6)');
    // the axe: the haft from low on her left to over her right shoulder, a broad bearded head
    { const a = Math.atan2(7.6 - 41.6, 31.6 - 11.4), nx = -Math.sin(a) * 0.575, ny = Math.cos(a) * 0.575;
      const haft = K.shape(q => { q.moveTo(11.4 + nx, 41.6 + ny); q.lineTo(31.6 + nx, 7.6 + ny); q.lineTo(31.6 - nx, 7.6 - ny); q.lineTo(11.4 - nx, 41.6 - ny); q.closePath(); }, HAFT);
      K.line([11.4, 41.6, 31.6, 7.6], 0.35, shade(HAFT, 30)); X.tex(haft, 'wood', [10.6, 7, 32.4, 42.4], { dir: a });
      for (const t of [0.12, 0.2]) for (let k = 0; k < 5; k++) { const tt = t + k * 0.012, x = 11.4 + 20.2 * tt, y = 41.6 - 34 * tt; K.line([x + nx * 1.1, y + ny * 1.1, x - nx * 1.1 + 0.15, y - ny * 1.1 - 0.1], 0.2, k % 2 ? '#3a2416' : '#4e321e'); } }
    for (let i = 0; i < 4; i++) K.line([28.6 - i * 0.45, 13.6 + i * 0.75, 29.8 - i * 0.45, 14.2 + i * 0.75], 0.45, '#3a2a1c');
    const head = K.shape(q => { q.moveTo(30.2, 6.2); q.quadraticCurveTo(35.6, 3.6, 38.4, 5.8); q.quadraticCurveTo(36.4, 9.8, 38.2, 14.6); q.quadraticCurveTo(34.6, 13.2, 32.6, 11.2); q.closePath(); },
      K.lin(30, 5, 38.6, 12, [[0, shade(IRON, 30)], [0.5, IRON], [1, shade(IRON, -50)]]));
    X.tex(head, 'metal', [30, 3.4, 38.8, 14.8], { dir: 1.2 });
    K.clip(head, () => { K.curve([38.4, 5.8, 36.4, 9.8, 38.2, 14.6], 0.55, '#eef2f8'); for (const [x, y] of [[37.2, 8.1], [36.9, 11.4], [37.7, 13.2]]) K.poly([x + 0.6, y - 0.25, x - 0.05, y, x + 0.6, y + 0.25], 'rgba(60,50,50,.7)');
      for (const [x, y] of [[32.4, 7.2], [33.4, 7.0], [34.4, 7.1], [32.8, 9.2]]) { K.line([x, y, x, y + 1.1], 0.09, 'rgba(40,40,60,.6)'); K.line([x, y + 0.3, x + 0.45, y + 0.1], 0.08, 'rgba(40,40,60,.6)'); K.line([x, y + 0.6, x + 0.45, y + 0.85], 0.08, 'rgba(40,40,60,.6)'); } });
    K.R(29.8, 6.2, 2.4, 2.6, shade(IRON, -30), 0.4);
    // arms bare and strong: her right (on the left) down to the lower grip, her left up to the high one; woad on the upper arm
    X.limb([[14.4, 16.4], [12.4, 22.6], [15.8, 29.2]], [3.6, 2.8, 2.3], SKIN, { joint: 1, inner: () => { for (const y of [18.6, 20.6]) { K.line([11.6, y - 0.3, 15.4, y + 0.3], 0.16, WOAD); } for (let k = 0; k < 6; k++) K.ell(12.1 + k * 0.55, 19.55 + k * 0.08, 0.14, 0.14, WOAD); K.curve([11.8, 21.4, 12.6, 21.0, 13.4, 21.5], 0.1, WOAD); K.curve([13.4, 21.5, 14.2, 22.0, 15, 21.6], 0.1, WOAD);
      for (let i = 0; i < 18; i++) K.ell(12.6 + H.rr() * 2.6, 16.6 + H.rr() * 2.2, 0.06, 0.05, 'rgba(150,80,50,.35)'); } });
    X.limb([[26.2, 16.4], [29, 20.4], [25.8, 21.2]], [3.6, 2.8, 2.3], SKIN, { joint: 1 });
    for (const [bx, by] of [[14.4, 26.8], [24.6, 19.8]]) { const br = K.shape(q => q.roundRect(bx, by, 2.6, 1.6, 0.4), K.lin(bx, 0, bx + 2.6, 0, [[0, shade(LEATH, 20)], [1, shade(LEATH, -30)]])); X.tex(br, 'leather', [bx, by, bx + 2.6, by + 1.6]); for (let k = 0; k < 3; k++) K.line([bx + 0.6 + k * 0.6, by + 0.2, bx + 0.9 + k * 0.6, by + 1.4], 0.08, '#d8c0a0'); }           // bracers
    X.fist(16.6, 30.4, 0.95, SKIN, 1.15); X.fist(26, 21.6, 0.95, SKIN, 1.15);
    // the wolf's head on her left shoulder, its jaws over her collarbone
    K.shape(q => { q.moveTo(10.4, 13.6); q.quadraticCurveTo(11.6, 10.4, 14.8, 10.8); q.quadraticCurveTo(17.4, 11.6, 17.6, 14.6); q.quadraticCurveTo(15.6, 17.6, 12, 17); q.quadraticCurveTo(10, 16, 10.4, 13.6); q.closePath(); },
      K.rad(13.4, 12.4, 0.4, 5, [[0, shade(PELT, 20)], [0.6, PELT], [1, shade(PELT, -50)]]));
    { const wolf = K.shape(q => { q.moveTo(10.4, 13.6); q.quadraticCurveTo(11.6, 10.4, 14.8, 10.8); q.quadraticCurveTo(17.4, 11.6, 17.6, 14.6); q.quadraticCurveTo(15.6, 17.6, 12, 17); q.quadraticCurveTo(10, 16, 10.4, 13.6); q.closePath(); }); X.tex(wolf, 'fur', [10, 10.4, 17.8, 17.6], { dir: 3.3, n: 3 }); }
    K.poly([11.4, 11.4, 11.8, 8.6, 13.2, 10.8], shade(PELT, -20)); K.poly([11.8, 11, 11.9, 9.6, 12.6, 10.8], '#d8a890'); K.poly([13.8, 10.8, 15.2, 8.2, 15.8, 11.2], shade(PELT, -10));
    K.ell(9.8, 15, 1.4, 0.9, shade(PELT, -30)); K.ell(9.2, 14.8, 0.45, 0.35, '#2a2020');
    K.ell(12.6, 13, 0.35, 0.2, '#1a1410'); K.ell(14.8, 12.8, 0.32, 0.18, '#1a1410'); K.ell(12.5, 12.95, 0.08, 0.05, 'rgba(255,240,200,.7)'); K.ell(14.7, 12.75, 0.07, 0.05, 'rgba(255,240,200,.7)');
    for (const [x, y] of [[10.4, 15.7], [11.1, 15.9], [11.8, 16]]) K.poly([x - 0.18, y, x + 0.18, y, x, y + 0.55], '#f4ecd8'); K.ell(9.05, 14.65, 0.15, 0.1, 'rgba(255,255,255,.5)');
    // the pelt over her shoulders, ruffed at the neck
    X.cloth(q => { q.moveTo(13.2, 15.2); q.quadraticCurveTo(20.3, 12.4, 27.6, 15.2); q.quadraticCurveTo(28.8, 17.6, 27.2, 18.4); q.quadraticCurveTo(20.3, 16.6, 14.6, 18.4); q.quadraticCurveTo(12.4, 17.4, 13.2, 15.2); q.closePath(); }, PELT, [], { x0: 13, x1: 28 });
    { const sp = K.shape(q => { q.moveTo(13.2, 15.2); q.quadraticCurveTo(20.3, 12.4, 27.6, 15.2); q.quadraticCurveTo(28.8, 17.6, 27.2, 18.4); q.quadraticCurveTo(20.3, 16.6, 14.6, 18.4); q.quadraticCurveTo(12.4, 17.4, 13.2, 15.2); q.closePath(); }); X.tex(sp, 'fur', [12.6, 13.4, 28.8, 18.6], { n: 4 }); }
    for (let i = 0; i < 60; i++) { const x = 13.6 + H.rr() * 13.6, y = 15 + H.rr() * 3; K.line([x, y, x + (H.rr() - 0.5) * 0.4, y + 0.8], 0.12, H.rr() > 0.5 ? 'rgba(255,250,236,.5)' : 'rgba(80,64,48,.4)'); }
    // the head: braids, the woad band, a hard set to the mouth
    const hx = 20.6, hy = 9.1;
    K.shape(q => { q.moveTo(hx - 3, hy - 2.6); q.quadraticCurveTo(hx - 3.7, hy + 2.4, hx - 2.4, hy + 4.4); q.lineTo(hx + 2.6, hy + 2); q.lineTo(hx + 2.6, hy - 2.6); q.closePath(); }, shade(HAIR, -35));
    const lock = K.shape(q => { q.moveTo(hx + 1.6, hy - 3.4); q.quadraticCurveTo(hx + 3.4, hy - 2.4, hx + 3.35, hy + 0.4); q.quadraticCurveTo(hx + 3.3, hy + 2.0, hx + 3.2, hy + 2.8); q.lineTo(hx + 2.2, hy + 2.8); q.quadraticCurveTo(hx + 2.3, hy - 1.2, hx + 1.6, hy - 3.4); q.closePath(); },
      K.lin(hx + 2, 0, hx + 3.4, 0, [[0, shade(HAIR, -10)], [1, shade(HAIR, -45)]]));
    X.tex(lock, 'hair', [hx + 1.5, hy - 3.5, hx + 3.5, hy + 2.9], { col: HAIR, n: 9, flow: () => 1.62 });
    X.head(hx, hy, { skin: SKIN, eye: '#4a9a6a', brow: shade(HAIR, -25), mouth: 'set', browTilt: -0.28, jaw: 3.2, neckW: 2.4, neckLen: 2.2, wide: 1.04, paint: WOAD, lip: '#c47c6c', blush: 'rgba(236,120,90,.26)', freckles: 46 });
    const rhair = K.shape(q => { q.moveTo(hx - 2.8, hy - 0.8); q.quadraticCurveTo(hx - 3, hy - 3.8, hx + 0.2, hy - 4); q.quadraticCurveTo(hx + 2.8, hy - 3.9, hx + 2.8, hy - 1.4); q.quadraticCurveTo(hx + 1.2, hy - 3, hx - 1, hy - 2.3); q.quadraticCurveTo(hx - 2.2, hy - 1.8, hx - 2.8, hy - 0.8); q.closePath(); },
      K.lin(hx - 3, hy - 4, hx + 3, hy - 1, [[0, shade(HAIR, 30)], [0.5, HAIR], [1, shade(HAIR, -40)]]));
    X.tex(rhair, 'hair', [hx - 3, hy - 4.1, hx + 2.9, hy - 0.7], { col: HAIR, n: 7, flow: (x, y) => Math.atan2(hy - 4.4 - y, hx - 3.4 - x), sheen: [hx - 1.6, hy - 3.5, hx + 0.2, hy - 3.9, hx + 1.8, hy - 3.4], sheenW: 0.35 });
    // two braids down in front of the shoulders: slim, plaited, bound in leather with a bead at the end
    for (const [bx, dir] of [[hx - 2.25, -1], [hx + 2.45, 1]]) {
      for (let i = 0; i < 12; i++) {
        const y = hy + 1.9 + i * 0.82, x = bx + dir * (0.25 + Math.sin(i * 0.35) * 0.2), side = i % 2 ? 1 : -1, w = 0.62 - i * 0.015;
        K.shape(q => { q.moveTo(x - w, y - 0.45 + side * 0.15); q.quadraticCurveTo(x, y - 0.75, x + w, y - 0.45 - side * 0.15); q.quadraticCurveTo(x + w * 0.6, y + 0.4, x, y + 0.5); q.quadraticCurveTo(x - w * 0.6, y + 0.4, x - w, y - 0.45 + side * 0.15); q.closePath(); },
          K.lin(x - w, y - 0.6, x + w, y + 0.5, side > 0 ? [[0, shade(HAIR, 30)], [1, shade(HAIR, -40)]] : [[0, shade(HAIR, 10)], [1, shade(HAIR, -55)]]));
        K.curve([x - w * 0.7, y - 0.35, x, y - 0.1, x + w * 0.7, y - 0.4], 0.05, alpha(shade(HAIR, 50), 0.5));
        for (let k = 0; k < 3; k++) K.curve([x - w * 0.8 + k * 0.25, y - 0.5 + side * 0.1, x - w * 0.3 + k * 0.3, y, x + k * 0.15, y + 0.4], 0.035, alpha(shade(HAIR, -50), 0.45));
      }
      const ex = bx + dir * 0.3, ey = hy + 11.7;
      K.R(ex - 0.45, ey - 0.3, 0.9, 0.7, '#6a4228', 0.2); K.line([ex - 0.45, ey, ex + 0.45, ey], 0.08, '#c8a050');
      for (let k = 0; k < 5; k++) K.line([ex - 0.3 + k * 0.15, ey + 0.4, ex - 0.35 + k * 0.17, ey + 1.3], 0.12, shade(HAIR, k % 2 ? -20 : 10));
    }
    H.finish({ shadowW: 14, wear: 'fur', clean: [[hx + 0.2, hy + 0.5, 3.1, 4.3]], grade: 0.14, pop: 'saturate(1.12) brightness(1.06)' });
    return null;
  };

  /* ---------- Dask: low and coiled, a knife thrust forward, another reversed at his chest, the hood up ---------- */
  P.dask = function (cOut) {
    const H = B.heroicKit(cOut, 3131), { c, K, shade, alpha } = H, X = A.make(H);
    const SKIN = '#d6a07c', CLOAK = '#3a7050', LEATH = '#5a4434', VEST = '#6a5240', PANTS = '#4e4844', BOOT = '#46342a', SCARF = '#c03a30', STEEL = '#d4d8e2';
    // the cloak flaring out behind, its hem ragged
    X.cloth(q => { q.moveTo(15.6, 17.8); q.quadraticCurveTo(9.6, 26, 6.4, 46.6); q.lineTo(8.4, 45.6); q.lineTo(9.6, 47.4); q.lineTo(11.4, 45.8); q.lineTo(12.8, 47.2); q.lineTo(14.6, 45.4); q.lineTo(26.4, 45.4); q.lineTo(28, 47); q.lineTo(29.6, 45.4); q.lineTo(31.4, 46.8); q.lineTo(33.8, 44.6); q.quadraticCurveTo(31.4, 26, 25.6, 17.8); q.closePath(); },
      CLOAK, [[[13, 24, 10.6, 34, 9.2, 46], 1.1], [[27.6, 24, 29.6, 34, 31.6, 45], 1.1], [[15.6, 26, 14.4, 36, 13.6, 45], 0.8]], { x0: 6, x1: 34, inner: p => {
        X.tex(p, 'wool', [6, 17, 34.4, 47.6]);
        for (const [px, py, pw, ph, r] of [[9.6, 36.4, 2.2, 2.6, -0.12], [29.2, 30.2, 1.8, 2.2, 0.1]]) { c.save(); c.translate(px, py); c.rotate(r); const pa = K.shape(q => q.rect(0, 0, pw, ph), K.lin(0, 0, pw, 0, [[0, shade(CLOAK, 4)], [1, shade(CLOAK, -40)]])); X.tex(pa, 'wool', [0, 0, pw, ph], { a: 0.1 }); X.stitch([0.12, 0.12, pw - 0.12, 0.12, pw - 0.12, ph - 0.12, 0.12, ph - 0.12, 0.12, 0.12], 'rgba(220,200,160,.55)', 0.06); c.restore(); }
        for (let k = 0; k < 5; k++) K.line([22.6 + k * 0.32, 39.2 - k * 0.1, 22.9 + k * 0.32, 40.2 - k * 0.1], 0.07, 'rgba(200,180,140,.5)');                // a darn
        H.soft(0.8, () => K.R(6, 42.4, 28.4, 5.4, 'rgba(50,40,24,.35)', 0));                                                                     // road dirt on the hem
      } });
    for (const [x, y] of [[6.4, 46.6], [9.6, 47.4], [12.8, 47.2], [28, 47], [31.4, 46.8], [33.8, 44.6]]) for (let k = 0; k < 4; k++) K.line([x + (k - 1.5) * 0.18, y - 0.2, x + (k - 1.5) * 0.3 + (H.rr() - 0.5) * 0.3, y + 0.5 + H.rr() * 0.5], 0.05, alpha(shade(CLOAK, -20), 0.8));
    // legs bent low: the left back, the right forward, weight on the balls of the feet
    X.limb([[17.6, 31.2], [13.6, 37.6], [14.8, 44.6]], [3.5, 2.8, 2.2], PANTS, { joint: 1, inner: p => X.tex(p, 'linen', [11, 30, 20, 45]) });
    X.limb([[22.6, 31.2], [27.4, 35.8], [27, 44.4]], [3.5, 2.8, 2.2], PANTS, { joint: 1, inner: p => { X.tex(p, 'linen', [20, 30, 30, 45]); const kp = K.shape(q => q.ellipse(27.2, 36.2, 1.2, 1.0, 0.3, 0, 6.283), shade(LEATH, 6)); X.tex(kp, 'leather', [26, 35, 28.4, 37.4]); X.stitch(X.qp(26.1, 36, 27.2, 34.9, 28.3, 36.4), 'rgba(220,200,160,.5)', 0.05); } });
    for (const [bx, d] of [[14.6, -1], [27.2, 1]]) { const bp = X.boot(bx, 51, 2.8, 7.4, BOOT, d, { cuff: 1 }); X.tex(bp, 'leather', [bx - 3.4, 43.4, bx + 3.4, 51]); for (const y of [45.4, 47.6]) { K.R(bx - 1.5, y, 3, 0.5, shade(BOOT, 30), 0.1); X.buckle(bx + d * 0.7, y + 0.25, 0.5, 0.6, '#b8b0a0'); } }
    // the vest, leaning forward, a bandolier of knives across it, a belt hung with pouches
    X.cloth(q => { q.moveTo(15.8, 18.6); q.quadraticCurveTo(20.8, 17.4, 25.6, 18.4); q.quadraticCurveTo(26.8, 25, 25.4, 31.4); q.quadraticCurveTo(20.4, 32.4, 15.4, 31.4); q.quadraticCurveTo(14.4, 25, 15.8, 18.6); q.closePath(); },
      VEST, [[[18, 20, 17.6, 25, 18, 30], 0.6], [[23.4, 20, 23.8, 25, 23.4, 30], 0.6]], { x0: 14.4, x1: 27, inner: p => X.tex(p, 'leather', [14.4, 17.4, 27, 32.4]) });
    X.stitch(X.qp(16.2, 19.2, 15.2, 25, 16, 30.8), 'rgba(230,206,170,.45)'); X.stitch(X.qp(25.2, 19.0, 26.2, 25, 25, 30.8), 'rgba(230,206,170,.35)');
    for (const y of [21.4, 24, 26.6]) { K.R(22.2, y, 2.6, 0.5, shade(LEATH, -15), 0.1); X.buckle(23.8, y + 0.25, 0.45, 0.6, '#b8b0a0'); }
    K.line([16.2, 19.4, 25.2, 29.4], 0.9, LEATH); K.line([16.2, 19.1, 25.2, 29.1], 0.1, alpha(shade(LEATH, 40), 0.5)); X.stitch([16.4, 19.3, 25, 29.3], 'rgba(230,206,170,.35)', 0.05);
    for (let i = 0; i < 4; i++) { const t = 0.2 + i * 0.18, x = 16.2 + 9 * t, y = 19.4 + 10 * t; K.line([x - 0.5, y - 1.1, x + 0.3, y + 0.4], 0.32, STEEL); K.line([x - 0.45, y - 1.0, x + 0.1, y], 0.06, '#ffffff'); K.line([x + 0.3, y + 0.4, x + 0.6, y + 1], 0.4, '#3a2a20'); for (let k = 0; k < 3; k++) K.line([x + 0.25 + k * 0.12, y + 0.45 + k * 0.2, x + 0.55 + k * 0.12, y + 0.35 + k * 0.2], 0.06, '#7a6450'); X.rivet(x + 0.9, y + 0.5, 0.15, '#b8b0a0'); }
    const dbelt = K.shape(q => q.rect(15, 29.6, 11, 1.4), shade(LEATH, -20)); X.tex(dbelt, 'leather', [15, 29.4, 26, 31.2]); X.buckle(20.6, 30.3, 0.9, 1.0, '#b8b0a0');
    for (const [px, w] of [[17.4, 2.2], [22.4, 2]]) { const pp = K.shape(q => q.roundRect(px, 30.6, w, 2.3, 0.5), K.lin(px, 0, px + w, 0, [[0, shade(LEATH, 24)], [1, shade(LEATH, -24)]])); X.tex(pp, 'leather', [px, 30.6, px + w, 33]); K.shape(q => { q.moveTo(px - 0.05, 30.6); q.lineTo(px + w + 0.05, 30.6); q.lineTo(px + w + 0.05, 31.6); q.quadraticCurveTo(px + w / 2, 32.3, px - 0.05, 31.6); q.closePath(); }, shade(LEATH, -6)); X.stitch(X.qp(px + 0.15, 31.45, px + w / 2, 32.0, px + w - 0.15, 31.45), 'rgba(230,206,170,.45)', 0.05); X.rivet(px + w / 2, 31.75, 0.16, '#b8b0a0'); }
    // arms: the right forward and low with the knife pointed at the enemy; the left in to the chest, the blade reversed
    X.limb([[24.8, 19.8], [28.6, 24.4], [31.6, 26.6]], [3, 2.4, 1.9], LEATH, { joint: 1, inner: p => { X.tex(p, 'leather', [23, 18, 33, 28]); for (let k = 0; k < 4; k++) { const x = 29.2 + k * 0.55, y = 24.9 + k * 0.4; K.line([x - 0.4, y - 0.6, x + 0.4, y + 0.6], 0.07, '#d8c0a0'); } K.line([28.8, 24.1, 29, 26.2], 0.14, shade(LEATH, -50)); } });
    K.poly([32.4, 26.2, 37.6, 24.4, 32.6, 27.4], STEEL); K.line([32.4, 26.4, 37.4, 24.6], 0.08, '#ffffff'); K.line([33, 26.6, 35.6, 25.6], 0.07, 'rgba(70,80,100,.55)'); K.line([32.2, 25.9, 32.7, 27.6], 0.25, '#6a6060');
    X.fist(31.8, 26.8, -0.3, SKIN, 0.95);
    X.limb([[16.2, 19.8], [13, 24.8], [17.2, 25.4]], [3, 2.4, 1.9], LEATH, { joint: 1, inner: p => X.tex(p, 'leather', [11, 18, 19, 27]) });
    K.poly([17.6, 26, 18.6, 31.6, 18.4, 26.2], STEEL); K.line([17.8, 26.2, 18.5, 31], 0.07, '#ffffff'); K.line([17.4, 26.0, 18.8, 25.8], 0.25, '#6a6060');
    X.fist(17.6, 25.4, 1.2, SKIN, 0.95);
    // the head, low and forward under the hood; the scarf over his mouth and nose; only the eyes
    const hx = 21, hy = 13.4;
    K.shape(q => { q.moveTo(hx - 4.4, hy + 5.2); q.quadraticCurveTo(hx - 5.4, hy - 4.6, hx + 0.2, hy - 5.4); q.quadraticCurveTo(hx + 5.6, hy - 4.8, hx + 4.6, hy + 5.4); q.closePath(); },
      K.rad(hx - 1.6, hy - 2.4, 0.5, 7.4, [[0, shade(CLOAK, 30)], [0.6, CLOAK], [1, shade(CLOAK, -50)]]));
    { const hood = K.shape(q => { q.moveTo(hx - 4.4, hy + 5.2); q.quadraticCurveTo(hx - 5.4, hy - 4.6, hx + 0.2, hy - 5.4); q.quadraticCurveTo(hx + 5.6, hy - 4.8, hx + 4.6, hy + 5.4); q.closePath(); }); X.tex(hood, 'wool', [hx - 5.4, hy - 5.6, hx + 5.6, hy + 5.6]); X.stitch(X.qp(hx - 3.7, hy + 1.6, hx - 4.3, hy - 3.9, hx + 0.2, hy - 4.75), 'rgba(200,220,190,.35)', 0.05); }
    const opening = K.shape(q => { q.moveTo(hx - 3.2, hy + 4); q.quadraticCurveTo(hx - 3.8, hy - 3.2, hx + 0.2, hy - 3.6); q.quadraticCurveTo(hx + 4, hy - 3.2, hx + 3.4, hy + 4.2); q.closePath(); }, '#0e0c0e');
    X.head(hx, hy, { skin: SKIN, eye: '#8a9a3e', brow: '#2e201a', mouth: 'set', browTilt: -0.35, jaw: 3, neck: false, scar: true });
    K.clip(opening, () => {
      const fringe = K.shape(q => { q.moveTo(hx - 2.9, hy - 3.2); q.quadraticCurveTo(hx + 0.2, hy - 4.0, hx + 3.1, hy - 3.0);
        const tips = [[2.7, -1.9], [2.2, -2.6], [1.6, -1.75], [0.9, -2.5], [0.3, -1.6], [-0.5, -2.45], [-1.1, -1.7], [-1.7, -2.5], [-2.4, -1.5], [-2.9, -2.4]];
        for (const [x, y] of tips) q.lineTo(hx + x, hy + y); q.closePath(); }, K.lin(0, hy - 3.8, 0, hy - 1.6, [[0, '#120c0a'], [1, '#3a2a20']]));
      X.tex(fringe, 'hair', [hx - 3, hy - 4, hx + 3.2, hy - 1.4], { col: '#3a2a20', n: 10, flow: (x, y) => 1.5 + (x - hx) * 0.1 });
    });
    H.soft(0.6, () => K.ell(hx + 0.2, hy - 2.6, 3.2, 1.3, 'rgba(0,0,0,.42)'));             // the hood's shadow over his brow
    X.cloth(q => { q.moveTo(hx - 2.6, hy + 0.9); q.quadraticCurveTo(hx + 0.4, hy + 0.3, hx + 2.9, hy + 0.8); q.quadraticCurveTo(hx + 3.3, hy + 3.6, hx + 0.6, hy + 4.6); q.quadraticCurveTo(hx - 2.2, hy + 4, hx - 2.6, hy + 0.9); q.closePath(); },
      SCARF, [[[hx - 1.6, hy + 1.8, hx + 0.4, hy + 2.6, hx + 2.6, hy + 1.9], 0.4], [[hx - 1.6, hy + 3.1, hx + 0.4, hy + 3.8, hx + 2.4, hy + 3.2], 0.4]], { x0: hx - 3, x1: hx + 3.4, inner: p => X.tex(p, 'wool', [hx - 2.8, hy + 0.2, hx + 3.4, hy + 4.8], { a: 0.12 }) });
    { const tail = K.shape(q => { q.moveTo(hx + 2.2, hy + 3.4); q.quadraticCurveTo(hx + 4.2, hy + 5.6, hx + 5.6, hy + 9.2); q.lineTo(hx + 4.4, hy + 9.4); q.quadraticCurveTo(hx + 3.2, hy + 6.4, hx + 1.6, hy + 4.4); q.closePath(); }, shade(SCARF, -15)); X.tex(tail, 'wool', [hx + 1.5, hy + 3.3, hx + 5.7, hy + 9.5], { a: 0.12 }); K.line([hx + 4.45, hy + 8.7, hx + 5.5, hy + 8.55], 0.12, shade(SCARF, -45));   // its tail
      for (let k = 0; k < 7; k++) K.line([hx + 4.5 + k * 0.17, hy + 9.35 - k * 0.03, hx + 4.45 + k * 0.19 + (H.rr() - 0.5) * 0.2, hy + 10.2 + H.rr() * 0.3], 0.07, shade(SCARF, -25)); }
    // the hood's rim, lit
    K.curve([hx - 4.4, hy + 5, hx - 5, hy - 4.4, hx + 0.2, hy - 5.2], 0.25, alpha(shade(CLOAK, 50), 0.6));
    H.finish({ shadowW: 13, wear: 'cloth', clean: [[hx + 0.2, hy + 0.2, 3, 3.6]], grade: 0.14, pop: 'saturate(1.12) brightness(1.06)' });
    return null;
  };

  /* ---------- Maren: the Warden-blue mantle, her lantern held up and out, the mace low ---------- */
  P.maren = function (cOut) {
    const H = B.heroicKit(cOut, 12345), { c, K, shade, alpha } = H, X = A.make(H);
    const SKIN = '#e6b498', WOOL = '#ece2c8', MANT = '#3a62a8', TAB = '#a83444', HAIR = '#f0eee8', LEATH = '#6a4a30', IRON = '#9a9ea8', BRASS = '#e0b050';
    // the mantle behind, long, flaring
    X.cloth(q => { q.moveTo(15.4, 15.6); q.quadraticCurveTo(10.6, 22, 7.2, 50.6); q.quadraticCurveTo(20, 52, 33, 50.6); q.quadraticCurveTo(30, 22, 25.2, 15.6); q.closePath(); },
      MANT, [[[12.6, 24, 10, 38, 8.6, 50], 1.1], [[27.6, 24, 30.2, 38, 31.6, 50], 1.1]], { x0: 7, x1: 33, inner: p => X.tex(p, 'wool', [7, 15, 33.4, 52]) });
    X.band(X.qp(7.3, 50.3, 20, 51.8, 32.9, 50.3, 20), 0.7, MANT, BRASS);
    // the habit to the floor, its folds fanning to a muddy hem
    X.cloth(q => { q.moveTo(15.8, 15.8); q.quadraticCurveTo(20.3, 14.8, 25, 15.8); q.quadraticCurveTo(26.8, 31, 29.4, 49.6); q.quadraticCurveTo(24.4, 51.6, 20.4, 51); q.quadraticCurveTo(15.6, 51.6, 11.2, 49.8); q.quadraticCurveTo(13.8, 31, 15.8, 15.8); q.closePath(); },
      WOOL, [[[16.4, 28, 14.6, 40, 13, 50.4], 1.3], [[18.6, 28, 17.6, 40, 16.8, 50.8], 1.1], [[22.4, 28, 23.4, 40, 24, 50.8], 1.2], [[24.6, 28, 26.4, 40, 27.8, 50], 1.1]], { x0: 11, x1: 29.4, inner: p => { X.tex(p, 'wool', [11, 14.8, 29.6, 52]); X.stitch(X.qp(11.4, 49.2, 20.3, 50.6, 29.2, 49.0, 20), 'rgba(120,96,70,.45)', 0.06); H.soft(0.9, () => K.R(10, 46.4, 20, 6, 'rgba(60,44,26,.4)', 0)); for (let i = 0; i < 40; i++) K.ell(11.4 + H.rr() * 17.8, 48 + H.rr() * 3, 0.06 + H.rr() * 0.1, 0.05, 'rgba(70,50,30,.45)'); } });
    // the tabard, red, with the lamp of the Wardens worked in gold
    X.cloth(q => { q.moveTo(18.2, 16.4); q.lineTo(22.6, 16.4); q.quadraticCurveTo(23.2, 32, 22.8, 44.4); q.lineTo(18, 44.4); q.quadraticCurveTo(17.6, 32, 18.2, 16.4); q.closePath(); }, TAB, [[[19.4, 28, 19.2, 36, 19.4, 44], 0.5]], { x0: 17.6, x1: 23.4, inner: p => X.tex(p, 'wool', [17.6, 16.4, 23.4, 44.4], { a: 0.1 }) });
    X.band(X.qp(18.35, 16.4, 17.95, 32, 18.15, 44.4), 0.45, TAB, BRASS); X.band(X.qp(22.45, 16.4, 22.95, 32, 22.65, 44.4), 0.45, TAB, BRASS); X.band([18, 44.15, 22.8, 44.15], 0.45, TAB, BRASS);
    { const ex = 20.4, ey = 30.4;                                                     // the lamp of the Wardens: a lantern, its flame, rays
      for (let k = 0; k < 7; k++) { const a = -2.8 + k * 0.42; K.line([ex + Math.cos(a) * 1.1, ey + Math.sin(a) * 1.1, ex + Math.cos(a) * 1.6, ey + Math.sin(a) * 1.6], 0.08, BRASS); }
      K.curve([ex - 0.5, ey - 0.75, ex, ey - 1.15, ex + 0.5, ey - 0.75], 0.1, BRASS); K.R(ex - 0.6, ey - 0.75, 1.2, 0.16, BRASS, 0.05); K.R(ex - 0.6, ey + 0.65, 1.2, 0.2, BRASS, 0.05);
      c.save(); c.strokeStyle = BRASS; c.lineWidth = 0.1; c.strokeRect(ex - 0.5, ey - 0.6, 1.0, 1.25); c.restore();
      K.shape(q => { q.moveTo(ex, ey - 0.4); q.quadraticCurveTo(ex + 0.3, ey + 0.1, ex, ey + 0.45); q.quadraticCurveTo(ex - 0.3, ey + 0.1, ex, ey - 0.4); q.closePath(); }, '#ffe08a'); }
    const mbelt = K.shape(q => q.roundRect(15.4, 24.4, 10, 1.2, 0.3), LEATH); X.tex(mbelt, 'leather', [15.4, 24.2, 25.4, 25.8]); X.stitch([15.7, 25.0, 25.1, 25.0], 'rgba(255,226,180,.35)', 0.05);
    K.R(19.6, 24.2, 1.6, 1.6, BRASS, 0.2); K.R(19.95, 24.55, 0.9, 0.9, shade(LEATH, -20), 0.1); K.line([19.9, 25, 20.6, 25], 0.12, '#fff0b0');
    { const pts = X.qp(16.6, 25.6, 16.2, 30.4, 17.6, 31.4, 22); for (let i = 0; i < pts.length; i += 2) X.rivet(pts[i], pts[i + 1], 0.17, i % 8 === 0 ? '#c8a8d8' : '#8a5a3a'); K.line([17.6, 31.4, 17.7, 32.4], 0.1, BRASS); K.line([17.3, 32.0, 18.1, 32.0], 0.1, BRASS); }
    { K.line([24, 25.6, 24.2, 26.8], 0.08, '#3a2a20'); const bk = K.shape(q => q.roundRect(23.3, 26.6, 1.9, 2.4, 0.2), K.lin(23.3, 0, 25.2, 0, [[0, '#7a3a2a'], [1, '#4a2018']])); X.tex(bk, 'leather', [23.3, 26.6, 25.2, 29]); K.R(25.0, 26.75, 0.2, 2.1, '#f0e6cc', 0.05); for (const y of [27.0, 28.6]) K.R(23.3, y, 1.9, 0.14, BRASS, 0); K.ell(24.2, 27.8, 0.25, 0.25, BRASS); }
    // the mantle's hood fallen back round her shoulders
    X.cloth(q => { q.moveTo(14.4, 15.4); q.quadraticCurveTo(20.3, 12.6, 26.2, 15.4); q.quadraticCurveTo(27, 18.8, 24.4, 19.6); q.quadraticCurveTo(20.3, 17.8, 16.2, 19.6); q.quadraticCurveTo(13.6, 18.8, 14.4, 15.4); q.closePath(); },
      MANT, [[[16.4, 17, 20.3, 18.6, 24.2, 17], 0.5]], { x0: 14, x1: 27, inner: p => X.tex(p, 'wool', [13.6, 12.6, 27.2, 19.8]) });
    X.band(X.qp(16.0, 19.4, 20.3, 17.6, 24.6, 19.4), 0.45, MANT, BRASS);
    X.rivet(20.3, 18.2, 0.65, BRASS); K.ell(20.3, 18.2, 0.36, 0.36, K.rad(20.2, 18.1, 0.02, 0.36, [[0, '#d8f0ff'], [0.5, '#2c6ac8'], [1, '#0c2a60']])); K.ell(20.18, 18.08, 0.1, 0.08, 'rgba(255,255,255,.9)');
    // her right arm out with the lantern held up at shoulder height; her left down with the mace
    X.limb([[24.8, 16.8], [28.2, 20.6], [31.4, 18.2]], [3, 2.4, 2], WOOL, { joint: 1, inner: p => X.tex(p, 'wool', [23, 15, 33, 22.4]) }); K.line([30.4, 17.4, 30.6, 19.4], 0.35, MANT);
    for (let k = 0; k < 4; k++) { const y = 18.0 + k * 0.75; c.save(); c.strokeStyle = '#5a5048'; c.lineWidth = 0.09; c.beginPath(); c.ellipse(31.7 + k * 0.05, y, k % 2 ? 0.14 : 0.2, 0.34, 0, 0, 6.283); c.stroke(); c.restore(); }
    const lx = 31.9, ly = 23.2;
    K.R(lx - 1.6, ly - 2.4, 3.2, 0.7, shade(BRASS, -20), 0.3); K.R(lx - 1.4, ly + 1.8, 2.8, 0.7, shade(BRASS, -30), 0.3);
    K.R(lx - 1.3, ly - 1.8, 2.6, 3.6, K.rad(lx, ly, 0.1, 2.4, [[0, '#fff6c8'], [0.5, '#ffc048'], [1, '#c86a18']]), 0.4);
    K.shape(q => { q.moveTo(lx, ly - 1.1); q.quadraticCurveTo(lx + 0.55, ly + 0.2, lx, ly + 0.8); q.quadraticCurveTo(lx - 0.55, ly + 0.2, lx, ly - 1.1); q.closePath(); }, '#ffffff'); K.ell(lx, ly + 0.25, 0.22, 0.4, '#fff0a0'); K.R(lx - 0.15, ly + 0.8, 0.3, 0.8, '#f4ead8', 0.05);
    for (const x of [lx - 1.3, lx + 1.1]) K.R(x, ly - 1.8, 0.25, 3.6, shade(BRASS, -40), 0.1); K.line([lx - 1.2, ly, lx + 1.2, ly], 0.08, shade(BRASS, -40));
    K.shape(q => { q.moveTo(lx - 1.6, ly - 2.4); q.lineTo(lx, ly - 3.2); q.lineTo(lx + 1.6, ly - 2.4); q.closePath(); }, shade(BRASS, -10)); for (const x of [lx - 1.3, lx + 1.3]) X.rivet(x, ly - 2.1, 0.14, BRASS);
    X.fist(31.4, 17.6, -0.5, SKIN, 0.95);
    X.limb([[15.8, 16.8], [13.4, 22.4], [13.8, 28]], [3, 2.4, 2], WOOL, { joint: 1, inner: p => X.tex(p, 'wool', [11.6, 15, 17.6, 29]) }); K.line([12.8, 27.2, 14.8, 27.0], 0.35, MANT);
    K.line([13.2, 26, 12.2, 38.4], 0.55, '#4a3a2c'); for (let k = 0; k < 6; k++) { const y = 26.6 + k * 0.4, x = 13.15 - k * 0.032; K.line([x - 0.32, y, x + 0.32, y + 0.25], 0.12, k % 2 ? LEATH : shade(LEATH, 25)); }
    { const mh = K.shape(q => q.ellipse(12, 39.4, 1.25, 1.25, 0, 0, 6.283), K.rad(11.6, 39, 0.1, 1.4, [[0, '#d8dce4'], [0.6, IRON], [1, '#3a3c44']])); X.tex(mh, 'metal', [10.6, 38, 13.4, 40.8], { dir: 0.8 }); }
    for (const a of [0, 1.57, 3.14, 4.71]) K.poly([12 + Math.cos(a) * 1.1, 39.4 + Math.sin(a) * 1.1, 12 + Math.cos(a) * 1.8, 39.4 + Math.sin(a) * 1.8, 12 + Math.cos(a + 0.4) * 1.1, 39.4 + Math.sin(a + 0.4) * 1.1], IRON);
    X.fist(13.8, 28.2, 1.4, SKIN, 0.95);
    // the head: an old face, kind and watchful, white hair in a knot
    const hx = 20.6, hy = 10.0;
    const bun = K.shape(q => q.ellipse(hx - 2.2, hy - 2.6, 1.7, 1.6, 0, 0, 6.283), K.rad(hx - 2.6, hy - 3, 0.1, 1.8, [[0, '#ffffff'], [1, shade(HAIR, -40)]]));
    X.tex(bun, 'hair', [hx - 3.9, hy - 4.2, hx - 0.5, hy - 1], { col: shade(HAIR, -10), n: 8, flow: (x, y) => Math.atan2(y - (hy - 2.6), x - (hx - 2.2)) + 1.57 });
    for (const [a, b] of [[-0.9, 0.5], [0.3, -0.6]]) { K.line([hx - 2.2 + a, hy - 2.6 + b, hx - 2.2 + a + 1.6, hy - 2.6 + b - 1.2], 0.12, shade(BRASS, -10)); K.ell(hx - 2.2 + a + 1.6, hy - 2.6 + b - 1.2, 0.18, 0.18, BRASS); }
    X.head(hx, hy, { skin: SKIN, eye: '#4a78b0', brow: '#bcb8b0', mouth: 'smirk', browTilt: 0.12, jaw: 3, neckW: 2.0, neckLen: 2.0, lines: true, lip: '#bc7e72', blush: 'rgba(220,120,110,.2)', spots: [[-1.7, -1.6, 0.16], [-1.95, -0.9, 0.11], [2.0, -1.9, 0.12], [-1.4, 1.9, 0.09]] });
    const mhair = K.shape(q => { q.moveTo(hx - 2.6, hy - 0.4); q.quadraticCurveTo(hx - 2.8, hy - 3.9, hx + 0.3, hy - 3.9); q.quadraticCurveTo(hx + 2.7, hy - 3.7, hx + 2.7, hy - 1.6); q.quadraticCurveTo(hx + 1, hy - 3, hx - 0.8, hy - 2.6); q.quadraticCurveTo(hx - 2, hy - 2, hx - 2.6, hy - 0.4); q.closePath(); },
      K.lin(hx - 3, 0, hx + 3, 0, [[0, '#ffffff'], [0.6, HAIR], [1, shade(HAIR, -45)]]));
    X.tex(mhair, 'hair', [hx - 2.8, hy - 4, hx + 2.8, hy - 0.3], { col: shade(HAIR, -14), n: 8, flow: (x, y) => Math.atan2(hy - 2.8 - y, hx - 2.4 - x) });
    H.soft(1.4, () => K.ell(lx, ly, 3.4, 3.4, 'rgba(255,200,100,.55)'));                       // the lantern's glow
    H.finish({ shadowW: 13, wear: 'cloth', clean: [[hx + 0.2, hy + 0.5, 3.1, 4.2]], grade: 0.14, pop: 'saturate(1.12) brightness(1.06)', light: [lx, ly, 13, '255,190,90', 0.5] });
    return null;
  };

  B.heroicAnatomy = A.make;
  B.HEROIC2 = P;
  B.heroic2Painter = name => P[name] ? (c => { P[name](c); return null; }) : null;
  // these four replace the first heroic set; the old painters are kept as B.HEROIC_OLD for comparison
  const FACE2 = { finch: [14.4, 3.6, 12.6], runa: [14.2, 3.3, 12.8], dask: [14.6, 7, 12.8], maren: [14.2, 4.2, 12.8] };
  B.HEROIC_OLD = Object.assign({}, B.HEROIC);
  for (const k in P) B.HEROIC[k] = P[k];
  B.heroicFace = name => B.heroicOn(name) ? (FACE2[name] || null) : null;
})();
