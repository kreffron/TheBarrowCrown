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
    const foe = side === 1, W = s.big ? 1.6 : 0, skel = !!s.skel;
    const skin = skel ? BONE : (s.skin || '#e8b890'), hair = s.hair || '#4a3020';
    const top = s.top || (skel ? '#3a3440' : '#3a6ea5'), legs = s.legs || (skel ? BONE_D : '#3b3340');
    const armor = s.armor || null, metal = s.metal || (armor === 'mail' ? '#9a9ea8' : '#b8bcc8');
    const glow = s.glow || (skel ? '#7fd0ff' : null);
    const heldShield = s.held === 'shield', held = heldShield ? null : s.held, off = heldShield ? 'shield' : s.off;
    const L = { x: 11.6 - W, y: 33.6 }, Rh = { x: 29.4 + W, y: 32.4 };            // the hands
    const afters = [], hk = (s.short ? 1.22 : B.fig.HEAD) * (s.big ? 1.04 : 1);
    const inHead = f => { const g = (K2, c2) => { c2.save(); if (H) headT(c2); else { c2.translate(20, 20); c2.scale(hk, hk); c2.translate(-20, -20); } f(K2, c2); c2.restore(); }; g.head = true; return g; };
    if (s.short) { c.save(); c.translate(20, 51.6); c.scale(0.8, 0.8); c.translate(-20, -51.6); }
    if (H) { c.save(); bodyT(c); }

    /* ----- behind the body ----- */
    if (held === 'pack') { K.R(7 - W, 22.6, 9, 14, K.lin(7, 0, 16, 0, [[0, '#a8854f'], [1, '#6a4a2a']]), 2); K.R(7 - W, 22.6, 9, 3, '#b8955f', 1.4); K.line([9.6 - W, 26, 9.6 - W, 35], 0.6, '#5a4028'); }
    if (s.cape) {
      const cp = s.cape;
      K.shape(q => { q.moveTo(13 - W, 21); q.quadraticCurveTo(7.6 - W, 34, 7.8 - W, 48.6); q.quadraticCurveTo(11, 47.4, 14, 49.4); q.quadraticCurveTo(20, 48.4, 26, 49.4); q.quadraticCurveTo(29, 47.4, 32.2 + W, 48.6); q.quadraticCurveTo(32.4 + W, 34, 27 + W, 21); q.closePath(); },
        K.lin(8, 0, 32, 0, [[0, shade(cp, 16)], [0.5, shade(cp, -14)], [1, shade(cp, -42)]]));
    }
    if (s.long && !s.hood && ['braids', 'bun', 'mohawk'].indexOf(s.hs) < 0) K.shape(q => { q.moveTo(14.2, 12); q.quadraticCurveTo(13, 22, 14.6, 26.4); q.lineTo(25.6, 26.4); q.quadraticCurveTo(27.4, 22, 26.2, 12); q.closePath(); }, K.lin(0, 12, 0, 27, [[0, shade(hair, 6)], [1, shade(hair, -36)]]));

    /* ----- legs and boots ----- */
    if (!s.robe) {
      if (skel && !armor && !s.legs) {
        for (const [x, d] of [[17.4, 0], [22.6, -20]]) { K.line([x, 35, x - 0.4, 41, x, 47], 1.3, shade(BONE, d)); K.ell(x - 0.4, 41, 1.1, 1, shade(BONE, d + 10)); }
        K.ell(16.8, 48.4, 2.6, 1.3, BONE_D); K.ell(23.4, 48.4, 2.6, 1.3, shade(BONE_D, -16));
      } else {
        K.R(15.4, 35, 4.2, 12, F.cloth(K, 15.4, 19.6, legs), 1.2); K.R(20.4, 35, 4.2, 12, F.cloth(K, 20.4, 24.6, legs, 4), 1.2);
        if (H) for (const x of [17.5, 22.5]) { H.soft(0.18, () => K.curve([x - 1.6, 40.6, x, 41.2, x + 1.6, 40.6], 0.35, 'rgba(0,0,0,.4)')); H.soft(0.2, () => K.line([x - 0.9, 36, x - 1.1, 44], 0.4, 'rgba(255,248,230,.18)')); }
        if (armor === 'plate') {
          for (const [x, d] of [[15, 6], [20.2, -14]]) { K.R(x, 40.2, 4.8, 8, K.lin(x, 0, x + 4.8, 0, [[0, shade(metal, 30 + d)], [0.5, shade(metal, d)], [1, shade(metal, -46 + d)]]), 1.4); K.ell(x + 2.4, 40.8, 2.2, 1.3, shade(metal, 20 + d)); }
          for (const [x, d] of [[14.4, 0], [20.2, -18]]) K.R(x, 47.2, 5.6, 4.2, K.lin(0, 47, 0, 51.4, [[0, shade(metal, 10 + d)], [1, shade(metal, -50 + d)]]), [1.6, 1.6, 0.8, 0.8]);
        } else {
          const bootCol = s.boots || (armor === 'rags' ? '#4a3c30' : '#4a3424');
          if (armor === 'rags') { K.ell(17.2, 49.6, 2.6, 1.6, shade(skin, -30)); K.ell(22.8, 49.6, 2.6, 1.6, shade(skin, -40)); }
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
        K.ell(16, 25, 3.6, 1.4, 'rgba(255,255,255,.14)');
        if (H) { for (const [x, w] of [[13.4, 1.2], [16.8, 1.3], [23.4, 1.4], [26.8, 1.2]]) H.fold([x, 29, x + (x - 20) * 0.2, 40, x + (x - 20) * 0.44, 51.4], w, 'rgba(0,0,0,.38)', 'rgba(255,248,230,.26)'); H.soft(0.5, () => K.R(9, 23, 22, 1.4, 'rgba(0,0,0,.28)', 0.6)); }
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
        K.ell(16.2, 24.6, 3.4, 1.2, 'rgba(255,255,255,.14)');
        if (H && armor !== 'mail' && !skel) { H.fold([16.4, 23, 16, 29, 16.6, 37.6], 0.8, 'rgba(0,0,0,.34)', 'rgba(255,248,230,.24)'); H.fold([23.8, 23, 24.2, 29, 23.6, 37.6], 0.8, 'rgba(0,0,0,.4)', false); H.soft(0.3, () => K.curve([14, 33, 20, 34.4, 26, 33], 0.6, 'rgba(0,0,0,.3)')); }
      });
    }
    // plate: breastplate, faulds and a gorget over whatever is beneath
    if (armor === 'plate') {
      const bp = K.shape(q => { q.moveTo(13.6 - W, 22.4); q.quadraticCurveTo(20, 20.6, 26.4 + W, 22.4); q.quadraticCurveTo(27.4 + W, 28.6, 25.6 + W * 0.5, 33.4); q.quadraticCurveTo(20, 35, 14.4 - W * 0.5, 33.4); q.quadraticCurveTo(12.6 - W, 28.6, 13.6 - W, 22.4); }, K.lin(13, 0, 27, 0, [[0, shade(metal, 34)], [0.42, shade(metal, 10)], [0.58, shade(metal, -8)], [1, shade(metal, -52)]]));
      K.clip(bp, () => { K.line([20, 21.4, 20, 34], 0.5, 'rgba(255,255,255,.5)'); K.ell(16.6, 25.4, 2.4, 3.6, 'rgba(255,255,255,.28)'); K.curve([14, 30, 20, 31.6, 26, 30], 0.4, alpha('#000000', 0.3)); });
      for (let i = 0; i < 2; i++) K.shape(q => { const y = 33.2 + i * 2.2; q.moveTo(13.8 - W * 0.5, y); q.quadraticCurveTo(20, y + 1.6, 26.2 + W * 0.5, y); q.lineTo(26.6 + W * 0.5, y + 2.4); q.quadraticCurveTo(20, y + 4, 13.4 - W * 0.5, y + 2.4); q.closePath(); }, K.lin(13, 0, 27, 0, [[0, shade(metal, 20 - i * 8)], [1, shade(metal, -46 - i * 8)]]));
    }
    if (s.tabard) {
      const tb = s.tabard;
      K.shape(q => { q.moveTo(16.6, 22); q.lineTo(23.4, 22); q.lineTo(24.2, 42.6); q.lineTo(20, 44.4); q.lineTo(15.8, 42.6); q.closePath(); }, F.cloth(K, 15.8, 24.2, tb, 20, -34));
      if (s.trim) K.line([16.6, 22.6, 16, 42.2, 20, 43.8, 24, 42.2, 23.4, 22.6], 0.45, s.trim);
      sigil(c, K, s.sigil, 20, 29.4, 2.6, s.trim || (shade(tb, 0) && luminous(tb) ? '#3a3448' : GOLD), tb);
    } else if (s.sigil && !armor) sigil(c, K, s.sigil, 20, 27.6, 2.2, s.trim || GOLD, top);
    if (s.apron) K.R(16, 25, 8, 15.6, F.cloth(K, 16, 24, s.apron, 14, -20), 1.4);
    if (s.belt || (!s.robe && !s.tabard && armor !== 'plate')) { const bc = s.belt || shade(legs, -30); K.R(13.2 - W * 0.6, 32.6, 13.6 + W * 1.2, 2, bc, 0.6); K.R(18.8, 32.3, 2.4, 2.6, s.belt ? GOLD : shade(bc, 30), 0.5); }
    else if (s.belt || s.tabard) K.R(14.4, 33, 11.2, 1.6, s.belt || '#3a2a1e', 0.5);

    /* ----- arms ----- */
    const sleeve = s.sleeves || (armor === 'plate' ? metal : armor === 'mail' ? shade(metal, -20) : top);
    const boneArm = skel && !armor && !s.sleeves;
    if (boneArm) {
      F.limb(K, c, [13.6 - W, 23.6, 12.2 - W, 28, L.x, L.y - 1], 1.6, 1.2, BONE, null); F.limb(K, c, [26.4 + W, 23.6, 28.2 + W, 28, Rh.x, Rh.y - 1], 1.6, 1.2, shade(BONE, -20), null);
      K.ell(13.2 - W, 23.2, 2, 1.7, BONE); K.ell(26.8 + W, 23.2, 2, 1.7, shade(BONE, -14));
    } else {
      F.limb(K, c, [13.4 - W, 23.6, 11.6 - W, 28.6, L.x, L.y - 1], 3.4, 2.8, shade(sleeve, 4), alpha('#ffffff', 0.22));
      F.limb(K, c, [26.6 + W, 23.6, 28.8 + W, 28, Rh.x, Rh.y - 1], 3.4, 2.8, shade(sleeve, -20), null);
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
    if (H && !skel) K.R(HX - 1.6, HY + 1.4, 3.2, 3.8, K.lin(HX - 1.6, 0, HX + 1.6, 0, [[0, shade(skin, -6)], [1, shade(skin, -50)]]), 1.2);   // a real neck
    c.save(); if (H) headT(c); else { c.translate(20, 20); c.scale(hk, hk); c.translate(-20, -20); }
    const hx = 20.3, hy = 13.8, r = 4.8;
    if (!skel) { if (!H) K.R(18.4, 17.4, 3.4, 3, shade(skin, -24), 1); } else K.line([20, 17, 20, 21], 1.2, BONE_D);
    const covered = !!(s.hood || s.helm), hatted = !!(s.hat || s.cap);
    if (s.hood) K.shape(q => { q.moveTo(12.6, 21.4); q.quadraticCurveTo(12, 9.6, 19, 7); q.quadraticCurveTo(21.6, 6.2, 22.6, 5.4); q.quadraticCurveTo(23.8, 7.6, 25.6, 9.6); q.quadraticCurveTo(28.6, 13.6, 27.6, 21.4); q.quadraticCurveTo(20, 23, 12.6, 21.4); }, K.rad(17, 9, 0.5, 15, [[0, shade(s.hood, 30)], [0.6, s.hood], [1, shade(s.hood, -34)]]));
    // hair behind the head
    if (!s.bald && !s.hood && !skel) {
      if (s.hs === 'curly') for (const [x, y, rr] of [[15.4, 10.6, 2.8], [18.6, 8.4, 3], [22.4, 8.4, 3], [25.4, 10.8, 2.8], [15, 14.4, 2.4], [25.8, 14.4, 2.4]]) K.ell(x, y, rr, rr, K.rad(x - 0.8, y - 0.8, 0.2, rr, [[0, shade(hair, 30)], [1, shade(hair, -16)]]));
      else if (s.hs !== 'mohawk' && !covered) K.ell(20, 12.4, 6.2, 5.8, K.rad(18, 10, 0.5, 7, [[0, shade(hair, 26)], [1, shade(hair, -18)]]));
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
        H.face(HX - 0.3, HY + (s.hood ? 0.4 : 0), { skin, eye: s.eyes || '#3a3040', brow: s.bald ? shade(skin, -60) : shade(hair, -20), mouth: s.beard ? 'set' : foe ? 'set' : null, browTilt: foe ? 0.22 : 0, jaw: s.big ? 3.4 : 3 });
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
        else K.shape(q => { q.moveTo(14.8, 13.4); q.quadraticCurveTo(15, 7.8, 20.6, 7.8); q.quadraticCurveTo(25.8, 8, 25.8, 12.6); q.quadraticCurveTo(23, 10, 20.2, 10.8); q.quadraticCurveTo(17.4, 10.8, 14.8, 13.4); }, K.lin(0, 8, 0, 13, [[0, shade(hair, 34)], [1, hair]]));
      }
      if (s.hs === 'braids') for (const sgn of [-1, 1]) { for (let i = 0; i < 5; i++) K.ell(20 + sgn * 5.4 + (sgn > 0 ? 0.4 : 0), 15.6 + i * 2, 1.3 - i * 0.06, 1.05, i % 2 ? shade(hair, -18) : shade(hair, 6)); K.R(20 + sgn * 5.4 - 0.7 + (sgn > 0 ? 0.4 : 0), 25.4, 1.4, 1.1, GOLD, 0.4); }
      if (s.beard) K.shape(q => { q.moveTo(15.8, 14.4); q.quadraticCurveTo(15.6, 21.6, 20.6, 22.4); q.quadraticCurveTo(25.4, 21.6, 25.2, 14.4); q.quadraticCurveTo(24.6, 17.6, 22.6, 17.2); q.quadraticCurveTo(20.6, 16.4, 18.6, 17.2); q.quadraticCurveTo(16.6, 17.4, 15.8, 14.4); }, K.lin(0, 14, 0, 23, [[0, shade(hair, 20)], [1, shade(hair, -26)]]));
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
