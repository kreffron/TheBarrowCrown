/* Figures: everyone on the board built from a character spec (D.sprites + D.looks), painted in the same hand as
   the heroes: shaded cloth and skin, a face with brows and an expression, real boots, armour, hair and headwear,
   and weapons drawn to scale. Battle-only extras come from D.battleLooks (q_battle.js):
     armor: 'plate' | 'mail' | 'leather' | 'coat' | 'rags'   metal: plate or mail colour
     tabard: colour   sigil: 'hand' | 'lamp' | 'skull' | 'crown' | 'flame' | 'wave' | 'snow' | 'anchor' | 'tusk'
     off: 'shield' | 'dagger' | 'book' | 'torch'   shield: shield colour   mask: cloth over the lower face
     glow: colour of eyes that shine (undead and worse)   staffTop: 'orb' | 'crook' | 'antler' | 'bell'
   Same 40x64 layout as every piece: base top at (20, 52), facing the viewer and a little to the right. */
(function () {
  const INK = '#1a1420', STEEL = '#b4b8c4', STEEL_L = '#f2f5fc', STEEL_D = '#5a5e6c', GOLD = '#e8c14a', GOLD_D = '#9a7420', WOOD = '#7a5434', WOOD_D = '#4a3020', BONE = '#e6e0cc', BONE_D = '#a8a088';

  // Heroic mode (H, the heroes' kit, given): the same gear and colours on a realistic figure. The body is drawn in
  // the layout below, stretched taller and slimmer from the feet (bodyT); the head is drawn at real size on top of
  // the neck (headT maps the old head's coordinates onto it, so hair, hats, helms and hoods still fit), with a
  // realistic face; the heroes' light, rim, wear and contact shadow are laid on by H.finish in pieces.js.
  const HX = 20, HY = 11, HK = 0.66;                                      // heroic scale: the head a tenth larger than life
  const bodyT = cc => { cc.translate(20, 51.6); cc.scale(1.04, 1.24); cc.translate(-20, -51.6); };   // taller, and no narrower than before
  const headT = cc => { cc.translate(HX, HY - 0.3); cc.scale(HK, HK); cc.translate(-20.3, -13.8); };
  B.paintSpec = function (c, K, s, side, H) {
    const F = B.fig, shade = F.shade, alpha = F.alpha;
    const foe = side === 1 || side === 3, W = s.big ? 1.6 : 0, skel = !!s.skel;
    const skin = skel ? BONE : (s.skin || '#e8b890'), hair = s.hair || '#4a3020';
    const top = s.top || (skel ? '#3a3440' : '#3a6ea5'), legs = s.legs || (skel ? BONE_D : '#3b3340');
    const armor = s.armor || null, metal = s.metal || (armor === 'mail' ? '#9a9ea8' : '#b8bcc8');
    const glow = s.glow || (skel ? '#7fd0ff' : null);
    const heldShield = s.held === 'shield', held = heldShield ? null : s.held, off = heldShield ? 'shield' : s.off;
    const L = { x: 11.6 - W, y: 33.6 }, Rh = { x: 29.4 + W, y: 32.4 };            // the hands
    const afters = [], hk = (s.short ? 1.22 : B.fig.HEAD) * (s.big ? 1.04 : 1);
    const X = H && B.heroicAnatomy ? B.heroicAnatomy(H) : null;
    const clothTex = armor === 'leather' ? 'leather' : armor === 'rags' || s.robe ? 'wool' : 'linen';
    const inHead = f => { const g = (K2, c2) => { c2.save(); if (H) headT(c2); else { c2.translate(20, 20); c2.scale(hk, hk); c2.translate(-20, -20); } f(K2, c2); c2.restore(); }; g.head = true; return g; };
    if (s.short) { c.save(); c.translate(20, 51.6); c.scale(0.8, 0.8); c.translate(-20, -51.6); }
    const M00 = c.getTransform();
    if (H) { c.save(); bodyT(c); }

    /* ----- behind the body ----- */
    if (held === 'pack') { K.R(7 - W, 22.6, 9, 14, K.lin(7, 0, 16, 0, [[0, '#a8854f'], [1, '#6a4a2a']]), 2); K.R(7 - W, 22.6, 9, 3, '#b8955f', 1.4); K.line([9.6 - W, 26, 9.6 - W, 35], 0.6, '#5a4028'); }
    if (s.cape) {
      const cp = s.cape;
      K.shape(q => { q.moveTo(13 - W, 21); q.quadraticCurveTo(7.6 - W, 34, 7.8 - W, 48.6); q.quadraticCurveTo(11, 47.4, 14, 49.4); q.quadraticCurveTo(20, 48.4, 26, 49.4); q.quadraticCurveTo(29, 47.4, 32.2 + W, 48.6); q.quadraticCurveTo(32.4 + W, 34, 27 + W, 21); q.closePath(); },
        K.lin(8, 0, 32, 0, [[0, shade(cp, 16)], [0.5, shade(cp, -14)], [1, shade(cp, -42)]]));
      if (X) { const cpp = K.shape(q => { q.moveTo(13 - W, 21); q.quadraticCurveTo(7.6 - W, 34, 7.8 - W, 48.6); q.quadraticCurveTo(11, 47.4, 14, 49.4); q.quadraticCurveTo(20, 48.4, 26, 49.4); q.quadraticCurveTo(29, 47.4, 32.2 + W, 48.6); q.quadraticCurveTo(32.4 + W, 34, 27 + W, 21); q.closePath(); }); X.tex(cpp, 'wool', [7, 20, 33.4, 50]); K.clip(cpp, () => { H.fold([11.6, 26, 9.6, 38, 9.4, 48], 1.1); H.fold([28.4, 26, 30.4, 38, 30.6, 48], 1.1); }); }
    }
    if (X && s.long && !s.hood && ['braids', 'bun', 'mohawk'].indexOf(s.hs) < 0) {   // long hair falling from the head behind the shoulders, in the head's own scale
      c.save(); c.setTransform(M00); headT(c);
      const lh = K.shape(q => { q.moveTo(14.6, 11); q.quadraticCurveTo(12.6, 20, 13.2, 27.4); q.quadraticCurveTo(14.6, 28.8, 16.2, 27.8); q.quadraticCurveTo(18, 29.4, 20.4, 28.4); q.quadraticCurveTo(22.8, 29.4, 24.6, 27.8); q.quadraticCurveTo(26.2, 28.8, 27.6, 27.4); q.quadraticCurveTo(28.2, 20, 26, 11); q.closePath(); }, K.lin(13, 0, 28, 0, [[0, shade(hair, 16)], [0.5, shade(hair, -8)], [1, shade(hair, -40)]]));
      X.tex(lh, 'hair', [12.6, 10.6, 28.4, 29.4], { col: hair, n: 1.2, w: 0.1, len: 2.2, flow: (x) => 1.57 + (x - 20.4) * 0.015 });
      c.restore();
    } else if (s.long && !s.hood && ['braids', 'bun', 'mohawk'].indexOf(s.hs) < 0) K.shape(q => { q.moveTo(14.2, 12); q.quadraticCurveTo(13, 22, 14.6, 26.4); q.lineTo(25.6, 26.4); q.quadraticCurveTo(27.4, 22, 26.2, 12); q.closePath(); }, K.lin(0, 12, 0, 27, [[0, shade(hair, 6)], [1, shade(hair, -36)]]));

    /* ----- legs and boots ----- */
    if (!s.robe) {
      if (skel && !armor && !s.legs) {
        for (const [x, d] of [[17.4, 0], [22.6, -20]]) { K.line([x, 35, x - 0.4, 41, x, 47], 1.3, shade(BONE, d)); K.ell(x - 0.4, 41, 1.1, 1, shade(BONE, d + 10)); }
        K.ell(16.8, 48.4, 2.6, 1.3, BONE_D); K.ell(23.4, 48.4, 2.6, 1.3, shade(BONE_D, -16));
      } else {
        const legEnd = X && armor === 'rags' ? 49.6 : 45.6;
        if (X) { X.limb([[17.4, 34.6], [17.1, 40.4], [17.3, legEnd]], [4.4, 3.6, 3.0], legs, { joint: 1, inner: p => X.tex(p, armor === 'leather' ? 'leather' : 'linen', [14.6, 34, 20, 46.4]) }); X.limb([[22.6, 34.6], [22.9, 40.4], [22.7, legEnd]], [4.4, 3.6, 3.0], shade(legs, -8), { joint: 1, inner: p => X.tex(p, armor === 'leather' ? 'leather' : 'linen', [20, 34, 25.4, 46.4]) }); }
        else { K.R(15.4, 35, 4.2, 12, F.cloth(K, 15.4, 19.6, legs), 1.2); K.R(20.4, 35, 4.2, 12, F.cloth(K, 20.4, 24.6, legs, 4), 1.2); }
        if (H && !X) for (const x of [17.5, 22.5]) { H.soft(0.18, () => K.curve([x - 1.6, 40.6, x, 41.2, x + 1.6, 40.6], 0.35, 'rgba(0,0,0,.4)')); H.soft(0.2, () => K.line([x - 0.9, 36, x - 1.1, 44], 0.4, 'rgba(255,248,230,.18)')); }
        if (armor === 'plate') {
          for (const [x, d] of [[15, 6], [20.2, -14]]) { K.R(x, 40.2, 4.8, 8, K.lin(x, 0, x + 4.8, 0, [[0, shade(metal, 30 + d)], [0.5, shade(metal, d)], [1, shade(metal, -46 + d)]]), 1.4); K.ell(x + 2.4, 40.8, 2.2, 1.3, shade(metal, 20 + d)); }
          for (const [x, d] of [[14.4, 0], [20.2, -18]]) K.R(x, 47.2, 5.6, 4.2, K.lin(0, 47, 0, 51.4, [[0, shade(metal, 10 + d)], [1, shade(metal, -50 + d)]]), [1.6, 1.6, 0.8, 0.8]);
        } else {
          const bootCol = s.boots || (armor === 'rags' ? '#4a3c30' : '#4a3424');
          if (armor === 'rags' && X) for (const [fx, d, dk] of [[17.3, -1, -30], [22.7, 1, -40]]) {     // feet bound in rags, on the ground
            const ft = K.shape(q => { q.moveTo(fx - 1.6, 48.2); q.lineTo(fx + 1.6, 48.2); q.quadraticCurveTo(fx + 1.7 + (d > 0 ? 1.4 : 0), 49.6, fx + 1.5 + (d > 0 ? 1.6 : 0), 51.4); q.lineTo(fx - 1.5 - (d < 0 ? 1.6 : 0), 51.4); q.quadraticCurveTo(fx - 1.7 - (d < 0 ? 1.4 : 0), 49.6, fx - 1.6, 48.2); q.closePath(); }, K.lin(fx - 2, 0, fx + 2, 0, [[0, shade('#6a5a48', dk + 30)], [1, shade('#6a5a48', dk)]]));
            X.tex(ft, 'linen', [fx - 3.4, 48, fx + 3.4, 51.6], { a: 0.12 }); for (let k = 0; k < 3; k++) K.line([fx - 1.6, 48.8 + k * 0.8, fx + 1.6, 49.2 + k * 0.8], 0.12, 'rgba(30,20,10,.35)');
          }
          else if (armor === 'rags') { K.ell(17.2, 49.6, 2.6, 1.6, shade(skin, -30)); K.ell(22.8, 49.6, 2.6, 1.6, shade(skin, -40)); }
          else if (X) { for (const [bx, d, dk] of [[17.3, -1, 0], [22.7, 1, -10]]) { const bp = X.boot(bx, 51.4, 3.7, 6.6, shade(bootCol, dk), d, { cuff: 1 }); X.tex(bp, 'leather', [bx - 4, 44, bx + 4, 51.4]); X.stitch([bx + 1.2, 46.2, bx + 1.3, 50.4], 'rgba(255,226,180,.35)', 0.06); } }
          else { F.boot(K, 15, 44.4, 4.8, 7, bootCol, -0.6); F.boot(K, 20.2, 44.4, 4.8, 7, shade(bootCol, -10), 0.8); }
        }
      }
    }

    /* ----- body ----- */
    let torso;
    if (s.robe) {
      torso = K.shape(q => { q.moveTo(13.4 - W, 22); q.quadraticCurveTo(20, 20.4, 26.6 + W, 22); q.quadraticCurveTo(28 + W, 36, 30.8 + W, 50.4); q.quadraticCurveTo(20, 52.2, 9.2 - W, 50.4); q.quadraticCurveTo(12 - W, 36, 13.4 - W, 22); }, F.cloth(K, 9, 31, top, 18, -42));
      K.clip(torso, () => {
        for (const x of [13.6, 17, 24.4, 27.4]) K.line([x + (x - 20) * 0.1, 36, x + (x - 20) * 0.42, 51], 0.5, alpha('#000000', 0.16));
        if (s.trim) { K.R(19, 21, 2.2, 31, s.trim, 0); K.shape(q => { q.moveTo(8, 49.2); q.quadraticCurveTo(20, 51, 32, 49.2); q.lineTo(32, 53); q.lineTo(8, 53); q.closePath(); }, s.trim); }
        if (armor === 'rags') for (let x = 9; x < 31; x += 3) K.poly([x, 53, x + 1.5, 47.6 + (x % 2), x + 3, 53], alpha('#000000', 0.28));
        if (!X) K.ell(16, 25, 3.6, 1.4, 'rgba(255,255,255,.14)');
        if (X) X.tex(torso, 'wool', [9, 20, 31.2, 53]);
        if (H) { for (const [x, w] of [[13.4, 1.2], [16.8, 1.3], [23.4, 1.4], [26.8, 1.2]]) H.fold([x, X ? 31 : 29, x + (x - 20) * 0.2, 40, x + (x - 20) * 0.44, 51.4], w, 'rgba(0,0,0,.38)', 'rgba(255,248,230,.26)'); H.soft(0.5, () => K.R(9, 23, 22, 1.4, 'rgba(0,0,0,.28)', 0.6)); }
      });
    } else {
      torso = K.shape(q => { q.moveTo(13.2 - W, 22); q.quadraticCurveTo(20, 20.4, 26.8 + W, 22); q.quadraticCurveTo(27.6 + W, 29, 26.6 + W * 0.6, 33.6); q.lineTo(27.4 + W * 0.6, 37.4); q.quadraticCurveTo(20, 38.4, 12.6 - W * 0.6, 37.4); q.lineTo(13.4 - W * 0.6, 33.6); q.quadraticCurveTo(12.4 - W, 29, 13.2 - W, 22); }, F.cloth(K, 12.4 - W, 27.6 + W, top, 26, -40));
      K.clip(torso, () => {
        if (s.stripe) for (let y = 24; y < 37; y += 3.2) K.R(10, y, 20, 1, s.stripe, 0);
        if (s.trim && !s.tabard) { K.R(19.2, 21, 1.8, 17, s.trim, 0); }
        if (skel && !armor && !s.tabard) { for (let i = 0; i < 4; i++) { const y = 24 + i * 2.4, w = 5 - Math.abs(i - 1.2) * 0.5; K.curve([20 - w, y + 1.4, 20 - w * 0.5, y - 0.4, 20, y], 0.9, BONE); K.curve([20, y, 20 + w * 0.5, y - 0.4, 20 + w, y + 1.4], 0.9, shade(BONE, -18)); } K.line([20, 22.6, 20, 34], 1.1, BONE_D); }
        if (armor === 'leather') { K.R(13, 22, 14, 13, alpha('#2a1a10', 0.25), 1.6); K.line([14.6, 22, 25.6, 33.6], 1.4, alpha('#2a1a10', 0.55)); for (let y = 24.6; y < 33; y += 2.6) { K.ell(15.2, y, 0.4, 0.4, '#c8b48a'); K.ell(24.8, y, 0.4, 0.4, '#c8b48a'); } }
        if (armor === 'coat') { K.poly([16, 21, 20, 30, 15.2, 37.6, 13, 37.6], alpha('#000000', 0.18)); K.poly([24, 21, 20, 30, 24.8, 37.6, 27, 37.6], alpha('#000000', 0.26)); for (const y of [27, 30.4, 33.8]) { K.ell(17.6, y, 0.5, 0.5, s.trim || GOLD); K.ell(22.4, y, 0.5, 0.5, s.trim || GOLD); } }
        if (armor === 'rags') { for (let x = 12; x < 28; x += 2.6) K.poly([x, 38.4, x + 1.3, 35.4 + (x % 2), x + 2.6, 38.4], alpha('#000000', 0.3)); K.R(22, 26, 3, 3, alpha('#ffffff', 0.08), 0.4); }
        if (armor === 'mail') {
          c.strokeStyle = alpha('#ffffff', 0.35); c.lineWidth = 0.28;
          for (let y = 22.6; y < 38; y += 1.3) for (let x = 12 + ((y * 10) % 2 ? 0.65 : 0); x < 28.6; x += 1.3) { c.beginPath(); c.arc(x, y, 0.55, 0.2, 2.9); c.stroke(); }
          K.R(10, 21, 20, 18, K.lin(10, 0, 30, 0, [[0, alpha(metal, 0.35)], [1, alpha('#000000', 0.25)]]), 0);
        }
        if (!X) K.ell(16.2, 24.6, 3.4, 1.2, 'rgba(255,255,255,.14)');
        if (X && armor !== 'mail' && !skel) { X.tex(torso, clothTex, [11, 20, 29, 39]); X.stitch(X.qp(16.6, 21.9, 20, 23.6, 23.4, 21.9), 'rgba(255,240,210,.35)', 0.06); if (armor === 'leather') { X.stitch(X.qp(13.6, 22.6, 12.8, 29, 13.8, 33.4), 'rgba(255,226,180,.4)'); X.stitch(X.qp(26.4, 22.6, 27.2, 29, 26.2, 33.4), 'rgba(255,226,180,.3)'); } }
        if (H && armor !== 'mail' && !skel) { if (X) { H.fold([16.6, 29, 16.3, 33, 16.6, 37.6], 0.7, 'rgba(0,0,0,.2)', 'rgba(255,248,230,.14)'); H.fold([23.6, 29, 23.9, 33, 23.6, 37.6], 0.7, 'rgba(0,0,0,.24)', false); } else { H.fold([16.4, 23, 16, 29, 16.6, 37.6], 0.8, 'rgba(0,0,0,.34)', 'rgba(255,248,230,.24)'); H.fold([23.8, 23, 24.2, 29, 23.6, 37.6], 0.8, 'rgba(0,0,0,.4)', false); } H.soft(0.3, () => K.curve([14, 33, 20, 34.4, 26, 33], 0.6, 'rgba(0,0,0,.3)')); }
      });
    }
    // plate: breastplate, faulds and a gorget over whatever is beneath
    if (armor === 'plate') {
      const bp = K.shape(q => { q.moveTo(13.6 - W, 22.4); q.quadraticCurveTo(20, 20.6, 26.4 + W, 22.4); q.quadraticCurveTo(27.4 + W, 28.6, 25.6 + W * 0.5, 33.4); q.quadraticCurveTo(20, 35, 14.4 - W * 0.5, 33.4); q.quadraticCurveTo(12.6 - W, 28.6, 13.6 - W, 22.4); }, K.lin(13, 0, 27, 0, [[0, shade(metal, 34)], [0.42, shade(metal, 10)], [0.58, shade(metal, -8)], [1, shade(metal, -52)]]));
      if (X) { X.tex(bp, 'metal', [12.6, 20.6, 27.4, 35], { dir: 1.4 }); for (const [rx, ry] of [[14.4, 23.2], [25.6, 23.2], [14.8, 32.4], [25.2, 32.4]]) X.rivet(rx, ry, 0.32, metal); }
      K.clip(bp, () => { K.line([20, 21.4, 20, 34], 0.5, 'rgba(255,255,255,.5)'); K.ell(16.6, 25.4, 2.4, 3.6, 'rgba(255,255,255,.28)'); K.curve([14, 30, 20, 31.6, 26, 30], 0.4, alpha('#000000', 0.3)); });
      for (let i = 0; i < 2; i++) K.shape(q => { const y = 33.2 + i * 2.2; q.moveTo(13.8 - W * 0.5, y); q.quadraticCurveTo(20, y + 1.6, 26.2 + W * 0.5, y); q.lineTo(26.6 + W * 0.5, y + 2.4); q.quadraticCurveTo(20, y + 4, 13.4 - W * 0.5, y + 2.4); q.closePath(); }, K.lin(13, 0, 27, 0, [[0, shade(metal, 20 - i * 8)], [1, shade(metal, -46 - i * 8)]]));
    }
    if (s.tabard) {
      const tb = s.tabard;
      const tbp = K.shape(q => { q.moveTo(16.6, 22); q.lineTo(23.4, 22); q.lineTo(24.2, 42.6); q.lineTo(20, 44.4); q.lineTo(15.8, 42.6); q.closePath(); }, F.cloth(K, 15.8, 24.2, tb, 20, -34));
      if (X) { X.tex(tbp, 'wool', [15.6, 21.8, 24.4, 44.6], { a: 0.1 }); K.clip(tbp, () => H.fold([19.6, 30, 19.4, 37, 19.8, 43], 0.7)); }
      if (s.trim) { if (X) X.band([16.75, 22.6, 16.1, 42.4, 20, 44.0, 23.9, 42.4, 23.25, 22.6], 0.6, tb, s.trim); else K.line([16.6, 22.6, 16, 42.2, 20, 43.8, 24, 42.2, 23.4, 22.6], 0.45, s.trim); }
      sigil(c, K, s.sigil, 20, 29.4, 2.6, s.trim || (shade(tb, 0) && luminous(tb) ? '#3a3448' : GOLD), tb);
    } else if (s.sigil && !armor) sigil(c, K, s.sigil, 20, 27.6, 2.2, s.trim || GOLD, top);
    if (s.apron) {
      if (X) { const ap = K.shape(q => { q.moveTo(16.2, 25); q.lineTo(23.8, 25); q.quadraticCurveTo(24.6, 33, 24.6, 40); q.quadraticCurveTo(20, 41.4, 15.4, 40); q.quadraticCurveTo(15.4, 33, 16.2, 25); q.closePath(); }, K.lin(15.4, 0, 24.6, 0, [[0, shade(s.apron, 6)], [0.5, shade(s.apron, -10)], [1, shade(s.apron, -36)]]));
        X.tex(ap, 'linen', [15, 24.6, 25, 41.6], { a: 0.1 }); K.clip(ap, () => { H.fold([18, 30, 17.6, 35, 17.8, 40.4], 0.7); H.fold([21.8, 30, 22.4, 35, 22.4, 40.4], 0.6); H.soft(0.5, () => K.R(15, 37, 10, 4, 'rgba(120,96,70,.18)', 0)); for (let i = 0; i < 6; i++) K.ell(16.4 + H.rr() * 7, 32 + H.rr() * 7, 0.3 + H.rr() * 0.4, 0.2 + H.rr() * 0.3, 'rgba(110,80,50,.12)'); });
        X.stitch(X.qp(15.7, 39.6, 20, 40.8, 24.3, 39.6), 'rgba(120,100,80,.5)', 0.07); K.line([15.6, 32.9, 24.4, 32.9], 0.5, shade(s.apron, -20)); K.curve([24.2, 33, 25.4, 34.4, 24.8, 36.4], 0.3, shade(s.apron, -30)); }
      else K.R(16, 25, 8, 15.6, F.cloth(K, 16, 24, s.apron, 14, -20), 1.4);
    }
    if (s.belt || (!s.robe && !s.tabard && armor !== 'plate')) { const bc = s.belt || shade(legs, -30); const blt = K.shape(q => q.roundRect(13.2 - W * 0.6, 32.6, 13.6 + W * 1.2, 2, 0.6), bc); if (X) { X.tex(blt, 'leather', [12, 32.4, 28, 34.8]); X.stitch([13.8 - W * 0.6, 33.0, 26.2 + W * 0.6, 33.0], 'rgba(255,226,180,.3)', 0.06); X.stitch([13.8 - W * 0.6, 34.2, 26.2 + W * 0.6, 34.2], 'rgba(255,226,180,.3)', 0.06); } K.R(18.8, 32.3, 2.4, 2.6, s.belt ? GOLD : shade(bc, 30), 0.5); if (X) K.R(19.35, 32.85, 1.3, 1.5, shade(bc, -10), 0.2); }
    else if (s.belt || s.tabard) K.R(14.4, 33, 11.2, 1.6, s.belt || '#3a2a1e', 0.5);

    /* ----- arms ----- */
    const sleeve = s.sleeves || (armor === 'plate' ? metal : armor === 'mail' ? shade(metal, -20) : top);
    const mailRings = (x0, x1) => { c.save(); c.strokeStyle = alpha('#ffffff', 0.3); c.lineWidth = 0.22; for (let y = 22; y < 34; y += 1.1) for (let xx = x0; xx < x1; xx += 1.1) { c.beginPath(); c.arc(xx + ((y * 10) % 2 ? 0.55 : 0), y, 0.45, 0.2, 2.9); c.stroke(); } c.restore(); };
    const boneArm = skel && !armor && !s.sleeves && !(H && (s.robe || s.hood));
    if (boneArm) {
      if (X) { X.limb([[13.6 - W, 23.2], [12.2 - W, 28], [L.x, L.y - 1]], [1.5, 1.1, 1.0], BONE, { joint: 1 }); X.limb([[26.4 + W, 23.2], [28.2 + W, 28], [Rh.x, Rh.y - 1]], [1.5, 1.1, 1.0], shade(BONE, -20), { joint: 1 }); K.ell(13.6 - W, 23.2, 1.3, 1.1, BONE); K.ell(26.4 + W, 23.2, 1.3, 1.1, shade(BONE, -14)); }
      else { F.limb(K, c, [13.6 - W, 23.6, 12.2 - W, 28, L.x, L.y - 1], 1.6, 1.2, BONE, null); F.limb(K, c, [26.4 + W, 23.6, 28.2 + W, 28, Rh.x, Rh.y - 1], 1.6, 1.2, shade(BONE, -20), null);
      K.ell(13.2 - W, 23.2, 2, 1.7, BONE); K.ell(26.8 + W, 23.2, 2, 1.7, shade(BONE, -14)); }
    } else {
      if (X) {
        const st = armor === 'plate' ? 'metal' : armor === 'mail' ? null : armor === 'leather' ? 'leather' : clothTex;
        const dist = (a, b) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), Bc = p(b); return Math.abs(A[0] - Bc[0]) + Math.abs(A[1] - Bc[1]) + Math.abs(A[2] - Bc[2]); };
        const bare = !!(s.sleeves && /^#[0-9a-f]{6}$/i.test(s.sleeves) && /^#[0-9a-f]{6}$/i.test(skin) && dist(s.sleeves, skin) < 30);
        const armCol = bare ? skin : sleeve, ast = bare ? null : st;
        // each arm one form: from the base of the neck over the shoulder, down the upper arm, the elbow, into the wrist
        // the arms share the body's light: one gradient across arm, torso and arm, so their tones meet without a step
        const x0g = 8 - W, x1g = 32 + W, pg = x => (x - x0g) / (x1g - x0g), tx0 = 12.4 - W, tx1 = 27.6 + W;
        const bodyLight = col => K.lin(x0g, 0, x1g, 0, [[0, shade(col, 32)], [pg(tx0), shade(col, 26)], [pg(tx0 + 0.45 * (tx1 - tx0)), col], [pg(tx1), shade(col, -40)], [1, shade(col, -50)]]);
        const armPaths = [];
        for (const [sg, hp] of [[-1, L], [1, Rh]]) {
          const col = armCol, ex = 20 + sg * (8.2 + W), sx = 20 + sg * (6.2 + W);
          const box = sg < 0 ? [8 - W, 20, 18, 34] : [22, 20, 32 + W, 34];
          armPaths[armPaths.length] = X.limb([[20 + sg * (bare || armor === 'plate' ? 3.4 : 4.2), bare || armor === 'plate' ? 21.5 : 22.2], [sx, 22.4], [20 + sg * (7.6 + W), 24.4], [ex, 28.4], [hp.x, hp.y - 0.4]], [2.2, 3.6, 3.9, 3.1, 2.4], col, { joint: 3, fill: bodyLight(col), edgeFrom: 2, edgeA: 0.24, inner: p => {
            if (ast) X.tex(p, ast, box); if (armor === 'mail') mailRings(box[0], box[2]);
            H.soft(0.7, () => K.ell(20 + sg * (7.2 + W), 27.6, 1.3, 2.6, sg < 0 ? alpha(shade(col, 30), 0.18) : 'rgba(0,0,0,.14)'));         // the roundness of the upper arm
            H.soft(0.6, () => K.curve([20 + sg * 5.9, 26.8, 20 + sg * 6.3, 28.4, 20 + sg * 6.6, 30.2], 0.9, 'rgba(0,0,0,.24)'));               // the arm's inside, below the armpit
          } });
          H.soft(0.7, () => K.curve([20 + sg * 6.0, 27.2, 20 + sg * 6.2, 29, 20 + sg * 6.4, 31.4], 0.8, 'rgba(0,0,0,.13)'));               // where the arm meets the body, from the armpit down
        }
        // the garment's shoulders laid over the tops of the arms, in the torso's own cloth and light, fading out down the
        // arm and in toward the chest: the shoulder belongs to the body, and the arm comes out from under it
        if (!bare && armor !== 'plate') {
          const cv2 = document.createElement('canvas'); cv2.width = c.canvas.width; cv2.height = c.canvas.height;
          const o = cv2.getContext('2d'); o.setTransform(c.getTransform()); o.lineJoin = 'round'; o.lineCap = 'round'; const K2 = B.paintKit(o);
          const yc = armor === 'mail' ? sleeve : top, Wd = 7.9 + W;
          const seam = /^#[0-9a-f]{6}$/i.test(sleeve) && /^#[0-9a-f]{6}$/i.test(yc) && dist(sleeve, yc) > 60;   // a sleeve of another colour: a sewn seam, not a fade
          const yoke = seam ? q => { q.moveTo(20 - 2.8, 20.8); q.quadraticCurveTo(20 - Wd + 0.5, 20.7, 20 - Wd - 0.15, 23.4); q.quadraticCurveTo(20 - Wd + 0.6, 24.8, 20 - 4.6, 26.8); q.lineTo(20 + 4.6, 26.8); q.quadraticCurveTo(20 + Wd - 0.6, 24.8, 20 + Wd + 0.15, 23.4); q.quadraticCurveTo(20 + Wd - 0.5, 20.7, 20 + 2.8, 20.8); q.closePath(); } : q => { q.rect(20 - 13 - W, 19, 26 + 2 * W, 10.6); };
          const yp = K2.shape(yoke, s.robe ? F.cloth(K2, 9, 31, yc, 18, -42) : K2.lin(x0g, 0, x1g, 0, [[0, shade(yc, 32)], [pg(tx0), shade(yc, 26)], [pg(tx0 + 0.45 * (tx1 - tx0)), yc], [pg(tx1), shade(yc, -40)], [1, shade(yc, -50)]]));
          o.save(); o.clip(yp);
          o.filter = 'blur(' + (0.5 * H.S) + 'px)'; K2.ell(20 - Wd + 2.2, 22.0, 2.6, 0.9, alpha(shade(yc, 40), 0.4)); K2.ell(20 + Wd - 1.6, 22.6, 2.2, 1.6, 'rgba(0,0,0,.18)');   // light on the near shoulder, the far one turning away
          o.filter = 'none';
          if (armor === 'mail') { o.strokeStyle = alpha('#ffffff', 0.3); o.lineWidth = 0.22; for (let y = 21; y < 28; y += 1.1) for (let xx = 10 - W; xx < 30 + W; xx += 1.1) { o.beginPath(); o.arc(xx + ((y * 10) % 2 ? 0.55 : 0), y, 0.45, 0.2, 2.9); o.stroke(); } }
          else { for (let x = 10 - W - 8; x < 30 + W; x += 0.24) { o.strokeStyle = 'rgba(255,248,232,.06)'; o.lineWidth = 0.045; o.beginPath(); o.moveTo(x, 20.5); o.lineTo(x + 8, 28.5); o.stroke(); o.strokeStyle = 'rgba(0,0,0,.06)'; o.beginPath(); o.moveTo(x + 8, 20.5); o.lineTo(x, 28.5); o.stroke(); } }
          o.restore();
          o.globalCompositeOperation = 'destination-in';                        // fade: down the arm, and toward the middle of the chest
          if (!seam) { o.fillStyle = K2.lin(0, 23.6, 0, 28.6, [[0, 'rgba(0,0,0,1)'], [0.45, 'rgba(0,0,0,.6)'], [1, 'rgba(0,0,0,0)']]); o.fillRect(0, 0, 40, 64); }
          const f0 = (20 - 5.6 - W * 0.4) / 40, f1 = (20 - 4.2) / 40;
          o.fillStyle = K2.lin(0, 0, 40, 0, [[0, 'rgba(0,0,0,1)'], [f0, 'rgba(0,0,0,1)'], [f1, 'rgba(0,0,0,0)'], [1 - f1, 'rgba(0,0,0,0)'], [1 - f0, 'rgba(0,0,0,1)'], [1, 'rgba(0,0,0,1)']]); o.fillRect(0, 0, 40, 64);
          const mk = document.createElement('canvas'); mk.width = cv2.width; mk.height = cv2.height; const mc = mk.getContext('2d'); mc.setTransform(c.getTransform()); mc.fillStyle = '#000';   // trimmed to the body and the arms
          mc.fill(torso); for (const ap of armPaths) if (ap) mc.fill(ap);
          o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'destination-in'; o.drawImage(mk, 0, 0);
          c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(cv2, 0, 0); c.restore();
          if (seam) for (const sg of [-1, 1]) { const pts = X.qp(20 + sg * (Wd + 0.15), 23.4, 20 + sg * (Wd - 0.6), 24.8, 20 + sg * 5.2, 26.4); H.soft(0.12, () => K.line(pts, 0.35, alpha(shade(yc, -50), 0.6))); X.stitch(pts.map((v, i) => i % 2 ? v - 0.3 : v), alpha(shade(yc, 40), 0.55), 0.06); }
        }
        if (armor !== 'plate') for (const [sg, dk] of [[-1, 4], [1, -14]]) {
          const sx = 20 + sg * (6.6 + W);
          if (bare) {                                                         // a sleeveless top: its strap over the shoulder and the edge of the armhole
            K.shape(q => { q.moveTo(20 + sg * 2.6, 21.0); q.quadraticCurveTo(20 + sg * 4.6, 20.9, 20 + sg * 5.6, 21.8); q.lineTo(20 + sg * 5.2, 23.2); q.quadraticCurveTo(20 + sg * 4.2, 22.4, 20 + sg * 2.8, 22.6); q.closePath(); }, shade(top, dk));
            H.soft(0.1, () => K.curve([20 + sg * 5.3, 22.6, sx - sg * 0.2, 24.8, 20 + sg * 6.1, 26.8], 0.3, alpha(shade(top, -40 + dk), 0.7)));
          }
        }
      } else {
      F.limb(K, c, [13.4 - W, 23.6, 11.6 - W, 28.6, L.x, L.y - 1], 3.4, 2.8, shade(sleeve, 4), alpha('#ffffff', 0.22));
      F.limb(K, c, [26.6 + W, 23.6, 28.8 + W, 28, Rh.x, Rh.y - 1], 3.4, 2.8, shade(sleeve, -20), null);
      }
      if (armor === 'plate') for (const [x, d] of [[12.6 - W, 0], [27.4 + W, -22]]) K.ell(x, 23.4, 3.2, 2.6, K.rad(x - 0.8, 22.6, 0.3, 3.4, [[0, shade(metal, 40 + d)], [1, shade(metal, -30 + d)]]));
    }
    const hand = H ? (p, d) => {
      const col = armor === 'plate' ? shade(metal, -10 + d) : skel ? shade(BONE, d) : shade(skin, d);
      c.save(); c.translate(p.x, p.y); c.scale(1.05, 0.86);                        // undo some of the body's stretch: a hand, not an egg
      K.shape(q => { q.moveTo(-1.1, -0.9); q.quadraticCurveTo(0.5, -1.3, 1.2, -0.3); q.quadraticCurveTo(1.4, 0.8, 0.4, 1.2); q.quadraticCurveTo(-0.9, 1.3, -1.2, 0.2); q.closePath(); }, K.rad(-0.4, -0.5, 0.1, 1.7, [[0, shade(col, 26)], [1, shade(col, -44)]]));
      for (const k of [-0.5, 0, 0.5]) K.line([1.1, k - 0.1, 0.6, k + 0.2], 0.14, alpha(shade(col, -80), 0.5));
      c.restore();
    } : (p, d) => K.ell(p.x, p.y, 1.6, 1.5, armor === 'plate' ? shade(metal, -10 + d) : skel ? shade(BONE, d) : shade(skin, d));
    hand(L, 2); hand(Rh, -16);
    if (s.fur) K.shape(q => { q.moveTo(10 - W, 24.6); q.quadraticCurveTo(10.6 - W, 19.8, 15, 19.4); q.lineTo(25, 19.4); q.quadraticCurveTo(29.4 + W, 19.8, 30 + W, 24.6); for (let i = 0; i <= 9; i++) q.lineTo(30 + W - i * (20 + 2 * W) / 9, 23.4 + (i % 2) * 2); q.closePath(); }, K.lin(0, 19, 0, 26, [[0, shade(s.fur, 26)], [1, shade(s.fur, -30)]]));
    if (s.cape) { K.ell(14.4 - W * 0.5, 21.8, 1.1, 1, GOLD); K.ell(25.6 + W * 0.5, 21.8, 1.1, 1, GOLD_D); }

    /* ----- the off hand ----- */
    if (off === 'shield') {
      const sc = s.shield || '#6a4a2a', x = L.x + 0.6, y = L.y - 2;
      const sh = K.shape(q => { q.moveTo(x - 5, y - 6); q.lineTo(x + 5, y - 6); q.quadraticCurveTo(x + 5.4, y + 2, x, y + 7); q.quadraticCurveTo(x - 5.4, y + 2, x - 5, y - 6); }, K.lin(x - 5, 0, x + 5, 0, [[0, shade(sc, 30)], [1, shade(sc, -34)]]));
      c.strokeStyle = s.metal ? shade(metal, 10) : '#b8bcc8'; c.lineWidth = 0.7; c.stroke(sh);
      if (s.sigil) sigil(c, K, s.sigil, x, y - 0.6, 2.2, s.trim || GOLD, sc); else K.ell(x, y - 0.6, 1.4, 1.4, K.rad(x - 0.4, y - 1, 0.1, 1.5, [[0, STEEL_L], [1, STEEL_D]]));
      K.ell(x - 2.6, y - 3.6, 1.2, 2, 'rgba(255,255,255,.18)');
    } else if (off === 'dagger') { K.poly([L.x - 0.5, L.y + 1, L.x + 0.5, L.y + 1, L.x - 0.4, L.y + 7.6, L.x - 1, L.y + 6.8], K.lin(L.x - 1, 0, L.x + 1, 0, [[0, STEEL_L], [1, STEEL_D]])); K.R(L.x - 1.8, L.y + 0.4, 3.6, 0.9, GOLD_D, 0.3); }
    else if (off === 'book') { K.R(L.x - 2.4, L.y - 3.4, 4.8, 6, K.lin(L.x - 2.4, 0, L.x + 2.4, 0, [[0, '#9a3f3f'], [1, '#5a1f1f']]), 0.8); K.R(L.x + 1.8, L.y - 2.8, 0.6, 4.8, '#f4f1e6', 0.2); }

    /* ----- the head ----- */
    if (H) c.restore();                                                      // out of the body's stretch
    const M0 = c.getTransform();
    if (H && !skel && !X) K.R(HX - 1.6, HY + 1.4, 3.2, 3.8, K.lin(HX - 1.6, 0, HX + 1.6, 0, [[0, shade(skin, -6)], [1, shade(skin, -50)]]), 1.2);   // a real neck
    c.save(); if (H) headT(c); else { c.translate(20, 20); c.scale(hk, hk); c.translate(-20, -20); }
    const hx = 20.3, hy = 13.8, r = 4.8;
    if (!skel) { if (!H) K.R(18.4, 17.4, 3.4, 3, shade(skin, -24), 1); } else K.line([20, 17, 20, 21], 1.2, BONE_D);
    const covered = !!(s.hood || s.helm), hatted = !!(s.hat || s.cap);
    if (s.hood) K.shape(q => { q.moveTo(12.6, 21.4); q.quadraticCurveTo(12, 9.6, 19, 7); q.quadraticCurveTo(21.6, 6.2, 22.6, 5.4); q.quadraticCurveTo(23.8, 7.6, 25.6, 9.6); q.quadraticCurveTo(28.6, 13.6, 27.6, 21.4); q.quadraticCurveTo(20, 23, 12.6, 21.4); }, K.rad(17, 9, 0.5, 15, [[0, shade(s.hood, 30)], [0.6, s.hood], [1, shade(s.hood, -34)]]));
    // hair behind the head
    if (!s.bald && !s.hood && !skel) {
      if (s.hs === 'curly') for (const [x, y, rr] of [[15.4, 10.6, 2.8], [18.6, 8.4, 3], [22.4, 8.4, 3], [25.4, 10.8, 2.8], [15, 14.4, 2.4], [25.8, 14.4, 2.4]]) K.ell(x, y, rr, rr, K.rad(x - 0.8, y - 0.8, 0.2, rr, [[0, shade(hair, 30)], [1, shade(hair, -16)]]));
      else if (s.hs !== 'mohawk' && !covered) { const hb = K.shape(q => q.ellipse(20, 12.4, 6.2, 5.8, 0, 0, 6.283), K.rad(18, 10, 0.5, 7, [[0, shade(hair, 26)], [1, shade(hair, -18)]])); if (X) X.tex(hb, 'hair', [13.8, 6.6, 26.2, 18.2], { col: hair, n: 1.2, w: 0.09, len: 1.6, flow: (x, y) => Math.atan2(y - 6, x - 20) }); }
      if (s.hs === 'pony') { K.ell(14.4, 11, 2, 2, hair); K.shape(q => { q.moveTo(13.6, 11); q.quadraticCurveTo(10, 15, 11.6, 21.6); q.quadraticCurveTo(13.4, 17, 15.2, 12); q.closePath(); }, K.lin(0, 11, 0, 22, [[0, hair], [1, shade(hair, -30)]])); K.R(12.8, 11.6, 2, 1, GOLD, 0.3); }
      if (s.hs === 'bun') K.ell(20, 7, 3, 2.7, K.rad(19, 6, 0.3, 3.2, [[0, shade(hair, 30)], [1, shade(hair, -20)]]));
    }
    if (s.ears) for (const sgn of [-1, 1]) K.poly([hx + sgn * r * 0.86, hy - 0.6, hx + sgn * (r + 4.2), hy - 3.4, hx + sgn * r * 0.9, hy + 1.6], sgn < 0 ? skin : shade(skin, -20));
    if (s.hood) K.ell(20.6, 15, 5, 5.4, K.rad(20.6, 14.4, 0.3, 5.6, [[0, '#0e0c12'], [1, shade(s.hood, -50)]]));
    // the face, or the skull
    if (skel) skull(c, K, hx, hy + (s.hood ? 0.6 : 0), s.hood ? 4.2 : r, glow);
    else {
      if (H) {                                                                // a real face, at real size, under the old head's hair and hats
        const M1 = c.getTransform(); c.setTransform(M0); c.translate(HX, HY + 3.2); c.scale(1.1, 1.1); c.translate(-HX, -(HY + 3.2));
        if (X) {
          const EYES = ['#5a3a24', '#4a6a9a', '#5a7a4a', '#7a5a30', '#3a5a7a', '#4a3020'], ey = s.eyes || EYES[Math.floor(H.rr() * EYES.length)];
          const grey = !s.bald && /^#([c-f][0-9a-f]){3}$/i.test(hair) && Math.abs(parseInt(hair.slice(1, 3), 16) - parseInt(hair.slice(5, 7), 16)) < 40;
          X.head(HX - 0.12, HY + (s.hood ? 0.4 : 0), { skin, eye: ey, brow: s.bald ? shade(skin, -60) : shade(hair, -20), mouth: s.beard ? 'set' : foe ? (s.eyes ? 'set' : 'frown') : 'smile', browTilt: foe ? -0.3 : 0.06, jaw: s.big ? 3.4 : 3.05, wide: s.big ? 1.08 : 1, neckW: s.big ? 2.6 : 2.15, neckLen: 1.7, lines: grey || s.old, lip: shade(skin, -26) });
        } else H.face(HX - 0.3, HY + (s.hood ? 0.4 : 0), { skin, eye: s.eyes || '#3a3040', brow: s.bald ? shade(skin, -60) : shade(hair, -20), mouth: s.beard ? 'set' : foe ? 'set' : null, browTilt: foe ? 0.22 : 0, jaw: s.big ? 3.4 : 3 });
        c.setTransform(M1);
      }
      else F.face(K, c, { x: hx, y: hy + (s.hood ? 0.8 : 0), r: s.hood ? 4.3 : r, skin, hair, eye: s.eyes || '#241820', mouth: s.beard ? 'none' : foe ? 'set' : null, brow: foe ? 1.8 : 0, browCol: s.bald ? shade(skin, -60) : shade(hair, -20), blush: !foe && !s.eyes });
      if (s.hood) { if (H) H.soft(0.7, () => K.ell(20.6, 10.6, 5.6, 2.6, alpha('#0e0c12', 0.55))); else K.ell(20.6, 11.6, 5.4, 2.6, alpha('#0e0c12', 0.6)); }   // the hood's shadow over the brow
      if (s.eyes && foe) afters.push(inHead(K2 => { for (const ex of [hx - r * 0.3, hx + r * 0.42]) K2.ell(ex, hy + 0.4, 1.6, 1.6, K2.rad(ex, hy + 0.4, 0, 1.6, [[0, alpha(s.eyes, 0.6)], [1, alpha(s.eyes, 0)]])); }));
    }
    if (!skel && !s.hood) {
      // hair over the brow
      if (!s.bald && !covered && s.hs !== 'curly') {
        if (s.hs === 'mohawk') K.R(18.6, 6.2, 3.4, 7.6, K.lin(0, 6, 0, 14, [[0, shade(hair, 30)], [1, hair]]), 1.4);
        else if (s.hs === 'spiky') { for (let i = 0; i < 6; i++) K.poly([14.6 + i * 2.1, 11.6, 15.8 + i * 2.1, 5.6 - (i % 2) * 1.6, 17 + i * 2.1, 11], i % 2 ? hair : shade(hair, 20)); K.shape(q => { q.moveTo(14.6, 12.6); q.quadraticCurveTo(15, 8, 20.6, 8.2); q.quadraticCurveTo(26, 8.2, 25.8, 12); q.quadraticCurveTo(21, 9.8, 14.6, 12.6); }, hair); }
        else { const hf = K.shape(q => { q.moveTo(14.8, 13.4); q.quadraticCurveTo(15, 7.8, 20.6, 7.8); q.quadraticCurveTo(25.8, 8, 25.8, 12.6); q.quadraticCurveTo(23, 10, 20.2, 10.8); q.quadraticCurveTo(17.4, 10.8, 14.8, 13.4); }, K.lin(0, 8, 0, 13, [[0, shade(hair, 34)], [1, hair]])); if (X) X.tex(hf, 'hair', [14.6, 7.6, 26, 13.6], { col: hair, n: 2, w: 0.09, len: 1.6, flow: (x, y) => Math.atan2(y - 6.4, x - 20.4) }); }
      }
      if (s.hs === 'braids') for (const sgn of [-1, 1]) {
        const bx = 20 + sgn * 5.3 + (sgn > 0 ? 0.4 : 0);
        if (X) { K.shape(q => { q.moveTo(bx - sgn * 1.6, 11.6); q.quadraticCurveTo(bx + sgn * 0.6, 12.4, bx + sgn * 0.3, 15.4); q.lineTo(bx - sgn * 1.1, 15.6); q.closePath(); }, shade(hair, -6));
          for (let i = 0; i < 8; i++) { const y = 15.4 + i * 1.3, x = bx + Math.sin(i * 0.5) * 0.15, sd = i % 2 ? 1 : -1, w = 1.15 - i * 0.04;
            K.shape(q => { q.moveTo(x - w, y - 0.7 + sd * 0.25); q.quadraticCurveTo(x, y - 1.15, x + w, y - 0.7 - sd * 0.25); q.quadraticCurveTo(x + w * 0.6, y + 0.6, x, y + 0.8); q.quadraticCurveTo(x - w * 0.6, y + 0.6, x - w, y - 0.7 + sd * 0.25); q.closePath(); }, K.lin(x - w, y - 1, x + w, y + 0.8, sd > 0 ? [[0, shade(hair, 30)], [1, shade(hair, -40)]] : [[0, shade(hair, 10)], [1, shade(hair, -50)]]));
            for (let k = 0; k < 3; k++) K.curve([x - w * 0.8 + k * 0.45, y - 0.8 + sd * 0.15, x - w * 0.3 + k * 0.5, y, x + k * 0.25, y + 0.6], 0.07, alpha(shade(hair, -50), 0.45)); }
          K.R(bx - 0.7, 25.6, 1.4, 1.0, GOLD, 0.3); for (let k = 0; k < 4; k++) K.line([bx - 0.45 + k * 0.3, 26.5, bx - 0.5 + k * 0.33, 27.8], 0.2, shade(hair, k % 2 ? -20 : 10)); }
        else { for (let i = 0; i < 5; i++) K.ell(bx, 15.6 + i * 2, 1.3 - i * 0.06, 1.05, i % 2 ? shade(hair, -18) : shade(hair, 6)); K.R(bx - 0.7, 25.4, 1.4, 1.1, GOLD, 0.4); }
      }
      if (s.beard) { const bd = K.shape(q => { q.moveTo(15.8, 14.4); q.quadraticCurveTo(15.6, 21.6, 20.6, 22.4); q.quadraticCurveTo(25.4, 21.6, 25.2, 14.4); q.quadraticCurveTo(24.6, 17.6, 22.6, 17.2); q.quadraticCurveTo(20.6, 16.4, 18.6, 17.2); q.quadraticCurveTo(16.6, 17.4, 15.8, 14.4); }, K.lin(0, 14, 0, 23, [[0, shade(hair, 20)], [1, shade(hair, -26)]])); if (X) X.tex(bd, 'hair', [15.4, 14.2, 25.6, 22.6], { col: hair, n: 2.4, w: 0.1, len: 1.4, flow: (x) => 1.57 + (20.6 - x) * 0.06 }); }
      const mc = s.mus === 1 || s.goatee === 1 ? hair : (s.mus || s.goatee);
      if (s.mus) K.shape(q => { q.moveTo(17.6, 17.4); q.quadraticCurveTo(20.6, 15.2, 23.8, 17.2); q.quadraticCurveTo(20.6, 16.6, 17.6, 17.4); }, mc), K.curve([17.8, 17.2, 20.6, 15.8, 23.6, 17], 0.9, mc);
      if (s.goatee) K.ell(21, 19.4, 1.3, 1.6, mc);
      if (s.glasses || s.specs) { c.strokeStyle = '#d8dce8'; c.lineWidth = 0.4; for (const ex of [hx - r * 0.3, hx + r * 0.42]) { c.beginPath(); c.arc(ex, hy + 0.4, 1.3, 0, 6.3); c.stroke(); } K.line([hx - r * 0.3 + 1.3, hy + 0.3, hx + r * 0.42 - 1.3, hy + 0.3], 0.35, '#d8dce8'); }
      if (s.patch) { K.ell(hx + r * 0.42, hy + 0.4, 1.4, 1.3, INK); K.line([15.6, 11.4, 25.2, 13.2], 0.4, INK); }
      if (s.scar) K.line([hx - r * 0.5, hy - 1.6, hx - r * 0.12, hy + 2.4], 0.4, '#b0504a');
      if (s.mask) K.shape(q => { q.moveTo(15.6, 15); q.quadraticCurveTo(20.6, 13.6, 25.4, 15); q.quadraticCurveTo(26.2, 18.6, 24.8, 20.4); q.quadraticCurveTo(20.4, 21.6, 16, 20.4); q.quadraticCurveTo(14.8, 18, 15.6, 15); }, K.lin(0, 14, 0, 21, [[0, shade(s.mask, 20)], [1, shade(s.mask, -24)]]));
    }
    // headwear
    if (s.helm) {
      const hm = s.helm, dome = K.shape(q => { q.moveTo(14.4, 13.4); q.quadraticCurveTo(14, 5.8, 20.4, 5.6); q.quadraticCurveTo(26.8, 5.8, 26.4, 13.4); q.closePath(); }, K.lin(14, 0, 27, 0, [[0, shade(hm, 40)], [0.45, hm], [1, shade(hm, -44)]]));
      K.clip(dome, () => { K.ell(17.6, 8.6, 2, 2.6, 'rgba(255,255,255,.35)'); K.line([20.4, 5.6, 20.4, 13], 0.5, alpha('#000000', 0.25)); });
      K.R(13.8, 12, 13.2, 1.8, shade(hm, -20), 0.7); for (const x of [15.6, 18, 22.8, 25.2]) K.ell(x, 12.9, 0.35, 0.35, shade(hm, 50));
      if (!s.crown && !s.horns) K.R(20, 13, 1, 3.6, shade(hm, -10), 0.3);
      if (s.horns) for (const sgn of [-1, 1]) K.shape(q => { q.moveTo(20 + sgn * 5.2, 9.6); q.quadraticCurveTo(20 + sgn * 10, 9, 20 + sgn * 9.6, 2.6); q.quadraticCurveTo(20 + sgn * 8, 6.6, 20 + sgn * 5.6, 7.2); q.closePath(); }, K.lin(0, 2, 0, 10, [[0, '#fff8e8'], [1, sgn < 0 ? BONE : BONE_D]]));
    }
    if (s.hat) { const ht = s.hat; K.ell(20.4, 9.6, s.brim ? 9.6 : 7.4, s.brim ? 2.1 : 1.6, K.lin(11, 0, 30, 0, [[0, shade(ht, 26)], [1, shade(ht, -30)]]), -0.06); K.R(15.6, 3.6, 9.6, 6.4, K.lin(15, 0, 26, 0, [[0, shade(ht, 26)], [1, shade(ht, -26)]]), [2.4, 2.4, 0.6, 0.6]); K.R(15.6, 8, 9.6, 1.2, shade(ht, -44), 0.3); if (s.feather) K.curve([24.4, 7, 29, 2, 27, -1.6], 1.4, s.feather); }
    if (s.cap) { const cp = s.cap; K.shape(q => { q.moveTo(15, 11.6); q.quadraticCurveTo(15, 6, 20.4, 6); q.quadraticCurveTo(25.8, 6, 25.8, 11.4); q.closePath(); }, K.lin(15, 0, 26, 0, [[0, shade(cp, 26)], [1, shade(cp, -26)]])); K.ell(24.6, 11.6, 3.8, 1, shade(cp, -30)); }
    if (s.crown) { K.poly([14.6, 9.6, 14.4, 3.6, 16.8, 6.4, 18.6, 2.4, 20.4, 6, 22.4, 2.4, 24.2, 6.4, 26.6, 3.6, 26.4, 9.6], K.lin(14, 0, 27, 0, [[0, '#fff2b0'], [0.45, s.crown], [1, shade(s.crown, -50)]])); K.R(14.4, 8.6, 12.2, 1.6, shade(s.crown, -30), 0.4); K.ell(20.4, 8.2, 0.9, 0.9, '#c8443c'); K.ell(16.4, 8.6, 0.6, 0.6, '#5ab0e8'); K.ell(24.4, 8.6, 0.6, 0.6, '#5ab0e8'); }
    if (s.circlet) { K.curve([14.8, 10.6, 20.4, 9.2, 25.8, 10.4], 0.8, s.circlet); K.ell(20.4, 9.8, 0.9, 0.9, '#7fd0ff'); }
    if (s.hood) K.curve([13.4, 15, 15.6, 8.6, 21, 7.6, 25.4, 8.6, 27, 14], 0.6, alpha('#ffffff', 0.14));
    if (s.scarf && !H) { K.R(15.2, 18.6, 10.4, 2.8, K.lin(0, 18.6, 0, 21.4, [[0, shade(s.scarf, 20)], [1, shade(s.scarf, -20)]]), 1.2); K.shape(q => { q.moveTo(15.8, 20); q.quadraticCurveTo(12, 22, 10.6, 27.4); q.quadraticCurveTo(13, 25.6, 14.6, 26.2); q.quadraticCurveTo(15.4, 23, 17.4, 21.4); q.closePath(); }, shade(s.scarf, -18)); }
    c.restore();
    if (H) {
      if (s.scarf) { K.R(HX - 3.2, HY + 2.6, 6.6, 2, K.lin(0, HY + 2.6, 0, HY + 4.6, [[0, shade(s.scarf, 20)], [1, shade(s.scarf, -20)]]), 0.9); K.shape(q => { q.moveTo(HX - 2.6, HY + 3.8); q.quadraticCurveTo(HX - 5, HY + 5.4, HX - 5.6, HY + 9.4); q.quadraticCurveTo(HX - 4, HY + 8.2, HX - 3, HY + 8.6); q.quadraticCurveTo(HX - 2.6, HY + 6, HX - 1.4, HY + 4.6); q.closePath(); }, shade(s.scarf, -18)); }
      c.save(); bodyT(c);                                                    // back into the body's stretch for the main hand
    }

    /* ----- the main hand ----- */
    const x = Rh.x, y = Rh.y, g = s.gem || '#ffe07a';
    const blade = (x0, y0, x1, y1, w) => K.poly([x0 - w, y0, x1 - w * 0.6, y1 + w * 2, x1, y1, x1 + w * 0.6, y1 + w * 2, x0 + w, y0], K.lin(x0 - w, 0, x0 + w, 0, [[0, STEEL_L], [0.5, STEEL], [1, STEEL_D]]));
    if (held === 'sword') { blade(x, y - 1.4, x, y - 18.6, 0.9); K.line([x, y - 2, x, y - 15], 0.25, 'rgba(255,255,255,.7)'); K.R(x - 3, y - 2.2, 6, 1.3, K.lin(x - 3, 0, x + 3, 0, [[0, '#fff2b0'], [1, GOLD_D]]), 0.5); K.R(x - 0.7, y - 1, 1.4, 4.2, WOOD_D, 0.4); K.ell(x, y + 3.6, 1, 1, GOLD); }
    else if (held === 'axe') { K.R(x - 0.8, y - 20, 1.6, 30, K.lin(x - 0.8, 0, x + 0.8, 0, [[0, '#a8805a'], [1, WOOD_D]]), 0.6); K.shape(q => { q.moveTo(x + 0.6, y - 19.4); q.quadraticCurveTo(x + 8, y - 21.4, x + 7.6, y - 15); q.quadraticCurveTo(x + 8, y - 9, x + 0.6, y - 11.4); q.closePath(); }, K.lin(x, y - 20, x + 8, y - 10, [[0, STEEL_L], [0.5, STEEL], [1, STEEL_D]])); K.curve([x + 7, y - 20, x + 7.8, y - 15, x + 7, y - 10.6], 0.4, 'rgba(255,255,255,.8)'); }
    else if (held === 'dagger') { K.poly([x - 0.6, y - 1, x + 0.6, y - 1, x + 0.2, y - 9, x - 0.4, y - 8.4], K.lin(x - 1, 0, x + 1, 0, [[0, STEEL_L], [1, STEEL_D]])); K.R(x - 2, y - 1.4, 4, 0.9, GOLD_D, 0.3); }
    else if (held === 'mace') { K.R(x - 0.7, y - 10, 1.4, 16, K.lin(x - 0.7, 0, x + 0.7, 0, [[0, '#a8805a'], [1, WOOD_D]]), 0.5); K.ell(x, y - 11.6, 2.8, 3, K.rad(x - 0.8, y - 12.6, 0.2, 3.2, [[0, STEEL_L], [1, STEEL_D]])); for (const a of [0, 1.05, 2.1, 3.15, 4.2, 5.25]) K.poly([x + Math.cos(a) * 2.2, y - 11.6 + Math.sin(a) * 2.4, x + Math.cos(a) * 4, y - 11.6 + Math.sin(a) * 4.2, x + Math.cos(a + 0.4) * 2.2, y - 11.6 + Math.sin(a + 0.4) * 2.4], STEEL); }
    else if (held === 'hammer') { K.R(x - 0.8, y - 13, 1.6, 20, K.lin(x - 0.8, 0, x + 0.8, 0, [[0, '#a8805a'], [1, WOOD_D]]), 0.5); K.R(x - 4.6, y - 17.6, 9.2, 5, K.lin(0, y - 18, 0, y - 12.6, [[0, '#9a9ea8'], [1, '#3a3d47']]), 1); K.R(x - 4.6, y - 17.6, 9.2, 1, 'rgba(255,255,255,.35)', 0.5); }
    else if (held === 'spade') { K.R(x - 0.7, y - 18, 1.4, 30, WOOD, 0.5); K.R(x - 2.6, y - 19.4, 5.2, 1.4, WOOD_D, 0.5); K.shape(q => { q.moveTo(x - 3, y + 11); q.lineTo(x + 3, y + 11); q.lineTo(x + 2.8, y + 16.6); q.quadraticCurveTo(x, y + 19, x - 2.8, y + 16.6); q.closePath(); }, K.lin(x - 3, 0, x + 3, 0, [[0, STEEL_L], [1, STEEL_D]])); }
    else if (held === 'club') { K.R(x - 0.9, y - 6, 1.8, 10, WOOD_D, 0.6); K.ell(x + 0.2, y - 10, 2.8, 5.4, K.lin(x - 3, 0, x + 3, 0, [[0, '#a8805a'], [1, '#4a3020']]), 0.1); for (const [dx, dy] of [[-1.6, -12], [1.8, -9], [-1.2, -7.6]]) K.ell(x + dx, y + dy, 0.6, 0.6, '#3a2414'); }
    else if (held === 'staff') {
      K.R(x - 0.7, y - 22, 1.4, 41, K.lin(x - 0.7, 0, x + 0.7, 0, [[0, '#a8805a'], [1, WOOD_D]]), 0.5);
      K.curve([x - 0.4, y - 21.4, x - 2.6, y - 23.6, x - 1.6, y - 26.4], 0.8, WOOD); K.curve([x + 0.4, y - 21.4, x + 2.6, y - 23.6, x + 1.6, y - 26.4], 0.8, WOOD_D);
      K.ell(x, y - 24.4, 2.2, 2.2, K.rad(x - 0.6, y - 25, 0.2, 2.4, [[0, '#ffffff'], [0.4, g], [1, shade(g, -60)]]));
      afters.push(K2 => K2.ell(x, y - 24.4, 6, 6, K2.rad(x, y - 24.4, 0.5, 6, [[0, alpha(g, 0.5)], [1, alpha(g, 0)]])));
    }
    else if (held === 'spear') { K.R(x - 0.6, y - 26, 1.2, 46, K.lin(x - 0.6, 0, x + 0.6, 0, [[0, '#a8805a'], [1, WOOD_D]]), 0.5); K.shape(q => { q.moveTo(x, y - 33); q.quadraticCurveTo(x + 2, y - 28.6, x, y - 25.6); q.quadraticCurveTo(x - 2, y - 28.6, x, y - 33); }, K.lin(x - 2, 0, x + 2, 0, [[0, STEEL_L], [1, STEEL_D]])); K.R(x - 1, y - 26, 2, 1.4, s.trim || '#8a2a2a', 0.4); }
    else if (held === 'pitchfork') { K.R(x - 0.6, y - 20, 1.2, 40, WOOD, 0.5); K.line([x - 3.2, y - 20.6, x + 3.2, y - 20.6], 1, STEEL); for (const dx of [-3, 0, 3]) K.line([x + dx, y - 20.6, x + dx, y - 26.4], 0.7, STEEL_L); }
    else if (held === 'bow') { K.curve([x - 0.6, y - 13, x + 7, y, x - 0.6, y + 13], 1.3, '#8a5a32'); K.line([x - 0.6, y - 13, x - 0.6, y + 13], 0.3, '#ece4d0'); }
    else if (held === 'lute') { K.line([x, y - 1, x - 2, y - 11], 1.2, '#4e3520'); K.ell(x + 0.6, y + 2.6, 3.6, 4.4, K.rad(x - 0.4, y + 1.4, 0.4, 5, [[0, '#e8b070'], [1, '#6a4020']])); K.ell(x + 0.6, y + 2, 0.9, 0.9, '#2a1810'); }
    else if (held === 'lantern') {
      K.line([x, y + 0.6, x, y + 2.6], 0.5, '#3a3d47'); K.poly([x - 2.6, y + 2.6, x + 2.6, y + 2.6, x + 2, y + 3.8, x - 2, y + 3.8], '#3a3d47');
      K.R(x - 2.1, y + 3.6, 4.2, 6.2, K.lin(0, y + 3.6, 0, y + 9.8, [[0, '#ffffff'], [0.5, g], [1, shade(g, -50)]]), 0.8); for (const dx of [-2, 0, 1.9]) K.line([x + dx, y + 3.6, x + dx, y + 9.9], 0.4, '#3a3d47'); K.R(x - 2.4, y + 9.6, 4.8, 1, '#3a3d47', 0.4);
      afters.push(K2 => K2.ell(x, y + 6.6, 8, 8, K2.rad(x, y + 6.6, 0.5, 8, [[0, alpha(g, 0.5)], [0.4, alpha(g, 0.16)], [1, alpha(g, 0)]])));
    }
    else if (held === 'book') K.R(x - 2.6, y - 1.6, 5.2, 6.4, K.lin(x - 2.6, 0, x + 2.6, 0, [[0, '#9a3f3f'], [1, '#5a1f1f']]), 0.8), K.R(x + 2, y - 1, 0.6, 5.2, '#f4f1e6', 0.2), K.ell(x, y + 1.6, 0.8, 0.8, GOLD);
    else if (held === 'scroll') { K.R(x - 2.4, y - 0.4, 4.8, 6, '#f4f1e6', 0.4); K.ell(x, y - 0.4, 2.8, 0.9, '#c8b88a'); K.ell(x, y + 5.6, 2.8, 0.9, '#c8b88a'); for (let i = 0; i < 3; i++) K.line([x - 1.4, y + 1.4 + i * 1.3, x + 1.4, y + 1.4 + i * 1.3], 0.25, '#8a7a5a'); }
    else if (held === 'ladle') { K.line([x, y + 1, x, y - 10], 0.9, STEEL); K.ell(x, y - 11, 2.2, 1.6, K.rad(x - 0.5, y - 11.4, 0.2, 2.4, [[0, STEEL_L], [1, STEEL_D]])); }
    else if (held === 'rod') { K.line([x, y + 6, x - 1, y - 24], 0.8, '#8a6a42'); K.curve([x - 1, y - 24, x + 5, y - 14, x + 3.6, y - 4], 0.3, 'rgba(220,226,240,.8)'); }
    hand(Rh, -16);
    if (held === 'sword' || held === 'axe' || held === 'mace' || held === 'hammer' || held === 'spear' || held === 'staff' || held === 'spade' || held === 'pitchfork') K.line([x - 1.4, y - 0.4, x + 1.4, y - 0.4], 0.4, alpha('#000000', 0.25));

    if (glow && skel) afters.push(inHead(K2 => { const rr = s.hood ? 4.2 : 4.8, sy = 13.8 + (s.hood ? 0.6 : 0); for (const ex of [20.3 - rr * 0.34, 20.3 + rr * 0.42]) K2.ell(ex, sy + 0.1, 1.1, 1.1, K2.rad(ex, sy + 0.1, 0, 1.1, [[0, alpha(glow, 0.6)], [1, alpha(glow, 0)]])); }));
    if (H) c.restore();
    const sig = H && s.sigName && ((B.bossSig && B.bossSig[s.sigName]) || (B.townSig && B.townSig[s.sigName]));
    if (sig && !s.short) { c.save(); sig(K, c, H, X, s); c.restore(); }   // a signature detail (bosslooks.js)   // a chief villain's signature detail (bosslooks.js)
    if (s.short) c.restore();
    if (!afters.length) return null;
    return (K2, c2) => { c2.save(); if (s.short) { c2.translate(20, 51.6); c2.scale(0.8, 0.8); c2.translate(-20, -51.6); } afters.forEach(f => { c2.save(); if (H && !f.head) bodyT(c2); f(K2, c2); c2.restore(); }); c2.restore(); };
  };

  // where the face is, for portraits and turn chips: [x, y, size] in the 40x64 layout
  B.specFace = s => (B.figHeroic && B.figHeroic()) ? (s.short ? [14.4, 12.2, 11.6] : [13, 3.6, 14.4]) : s.short ? [7, 9, 26] : [6, 0.5, 28];
  function luminous(hex) { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) > 170; }
  function skull(c, K, x, y, r, glow) {
    K.ell(x, y - 0.6, r * 1.02, r * 0.98, K.rad(x - r * 0.4, y - r * 0.6, r * 0.1, r * 1.2, [[0, '#fffbe8'], [0.6, BONE], [1, BONE_D]]));
    K.R(x - r * 0.6, y + r * 0.4, r * 1.3, r * 0.8, K.lin(0, y, 0, y + r * 1.2, [[0, BONE], [1, BONE_D]]), r * 0.3);
    const ex = [x - r * 0.34, x + r * 0.42];
    for (const e of ex) { K.ell(e, y + r * 0.02, r * 0.27, r * 0.3, '#1a1420'); if (glow) K.ell(e, y + r * 0.08, r * 0.09, r * 0.09, glow); }
    K.poly([x + r * 0.04, y + r * 0.36, x - r * 0.12, y + r * 0.62, x + r * 0.22, y + r * 0.62], '#2a2230');
    K.line([x - r * 0.5, y + r * 0.86, x + r * 0.62, y + r * 0.86], r * 0.06, '#5a5040');
    for (let i = 0; i < 5; i++) K.line([x - r * 0.4 + i * r * 0.24, y + r * 0.72, x - r * 0.4 + i * r * 0.24, y + r * 1.02], r * 0.05, '#5a5040');
    K.curve([x - r * 0.7, y - r * 0.5, x - r * 0.4, y - r * 0.2, x - r * 0.62, y + r * 0.1], r * 0.05, alpha('#5a5040', 0.6));
    function alpha(hex, a) { const n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }
  }
  // a badge on a tabard, a robe or a shield
  function sigil(c, K, kind, x, y, r, col, ground) {
    if (!kind) return;
    c.save(); c.fillStyle = col; c.strokeStyle = col; c.lineWidth = r * 0.22; c.lineCap = 'round';
    if (kind === 'hand') { K.R(x - r * 0.62, y - r * 0.1, r * 1.24, r * 1.1, col, r * 0.3); for (let i = 0; i < 4; i++) K.R(x - r * 0.6 + i * r * 0.32, y - r * 0.92 + Math.abs(i - 1.5) * r * 0.14, r * 0.24, r * 0.9, col, r * 0.12); K.R(x + r * 0.56, y - r * 0.1, r * 0.46, r * 0.24, col, r * 0.1); }
    else if (kind === 'lamp') { K.ell(x, y, r * 0.5, r * 0.5, col); for (let a = 0; a < 8; a++) { const t = a / 8 * 6.283; K.line([x + Math.cos(t) * r * 0.72, y + Math.sin(t) * r * 0.72, x + Math.cos(t) * r, y + Math.sin(t) * r], r * 0.16, col); } }
    else if (kind === 'skull') { K.ell(x, y - r * 0.16, r * 0.66, r * 0.6, col); K.R(x - r * 0.34, y + r * 0.2, r * 0.68, r * 0.44, col, r * 0.1); K.ell(x - r * 0.24, y - r * 0.14, r * 0.17, r * 0.19, ground); K.ell(x + r * 0.24, y - r * 0.14, r * 0.17, r * 0.19, ground); }
    else if (kind === 'crown') { K.poly([x - r * 0.8, y + r * 0.5, x - r * 0.8, y - r * 0.5, x - r * 0.4, y - r * 0.05, x, y - r * 0.7, x + r * 0.4, y - r * 0.05, x + r * 0.8, y - r * 0.5, x + r * 0.8, y + r * 0.5], col); }
    else if (kind === 'flame') { K.shape(q => { q.moveTo(x, y - r); q.quadraticCurveTo(x + r * 0.9, y - r * 0.1, x + r * 0.5, y + r * 0.7); q.quadraticCurveTo(x, y + r, x - r * 0.5, y + r * 0.7); q.quadraticCurveTo(x - r * 0.9, y - r * 0.1, x - r * 0.1, y - r * 0.4); q.quadraticCurveTo(x - r * 0.1, y - r * 0.8, x, y - r); }, col); }
    else if (kind === 'wave') { for (let i = 0; i < 2; i++) K.curve([x - r * 0.8, y - r * 0.2 + i * r * 0.6, x - r * 0.4, y - r * 0.6 + i * r * 0.6, x, y - r * 0.2 + i * r * 0.6, x + r * 0.4, y + r * 0.2 + i * r * 0.6, x + r * 0.8, y - r * 0.2 + i * r * 0.6], r * 0.2, col); }
    else if (kind === 'snow') { for (let a = 0; a < 3; a++) { const t = a / 3 * 3.1416; K.line([x - Math.cos(t) * r * 0.85, y - Math.sin(t) * r * 0.85, x + Math.cos(t) * r * 0.85, y + Math.sin(t) * r * 0.85], r * 0.16, col); } }
    else if (kind === 'anchor') { K.line([x, y - r * 0.8, x, y + r * 0.7], r * 0.2, col); K.line([x - r * 0.4, y - r * 0.4, x + r * 0.4, y - r * 0.4], r * 0.18, col); K.curve([x - r * 0.7, y + r * 0.2, x, y + r * 1.1, x + r * 0.7, y + r * 0.2], r * 0.18, col); }
    else if (kind === 'tusk') { for (const s of [-1, 1]) K.shape(q => { q.moveTo(x + s * r * 0.2, y + r * 0.7); q.quadraticCurveTo(x + s * r * 0.9, y, x + s * r * 0.3, y - r * 0.9); q.quadraticCurveTo(x + s * r * 0.5, y, x - s * r * 0.1, y + r * 0.6); }, col); }
    c.restore();
  }
})();
