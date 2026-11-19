/* The animals in the heroic style: real anatomy (a wolf's deep chest and long legs, a rat's hunch and naked tail,
   a bat's finger-bones through the membrane, a spider's jointed legs and eye cluster), muted natural colour, small
   eyes. Used by beasts.js in place of the classic painters when the heroic figures are on. Same 40x64 layout, heads
   where the classic ones were, so portraits and turn chips crop the same place. Each gets the beasts kit (K) and the
   heroic kit (H: soft blur, folds, rr). */
(function () {
  const { shade, alpha } = { shade: (c, n) => B.fig.shade(c, n), alpha: (c, a) => B.fig.alpha(c, a) };
  const hairs = (K, H, path, box, n, ang, light, dark) => K.clip(path, () => {    // short strokes of fur lying one way
    const [x0, y0, w, h] = box, dx = Math.cos(ang) * 0.7, dy = Math.sin(ang) * 0.7;
    for (let i = 0; i < n; i++) { const x = x0 + H.rr() * w, y = y0 + H.rr() * h; K.line([x, y, x + dx, y + dy], 0.13, H.rr() > 0.5 ? light : dark); }
  });

  /* ---------- the wolf: lean, deep-chested, long-legged, tail low ---------- */
  function wolf(c, K, H, p) {
    const fur = p.fur, dk = shade(fur, -46), lt = p.light, saddle = shade(fur, -30);
    // tail, low and bushy
    const tail = K.shape(q => { q.moveTo(8.4, 33.4); q.quadraticCurveTo(3, 36, 2.4, 45.6); q.quadraticCurveTo(4.4, 44.8, 5.6, 43); q.quadraticCurveTo(6.4, 39, 10, 36.6); q.closePath(); }, K.lin(2, 34, 10, 46, [[0, saddle], [0.7, fur], [1, dk]]));
    hairs(K, H, tail, [2, 33, 9, 13], 80, 1.9, alpha(lt, 0.4), 'rgba(0,0,0,.35)');
    // far legs, in shadow
    K.shape(q => { q.moveTo(11.8, 37); q.quadraticCurveTo(15.4, 40, 14.6, 44); q.lineTo(12.6, 47.6); q.lineTo(13.4, 51.2); q.lineTo(11.6, 51.2); q.lineTo(11.4, 47.2); q.lineTo(12.6, 43.4); q.quadraticCurveTo(10.4, 40.6, 11.8, 37); q.closePath(); }, shade(fur, -56));
    K.shape(q => { q.moveTo(26.2, 37.4); q.lineTo(28, 37.4); q.lineTo(28.4, 45); q.lineTo(29.4, 51.2); q.lineTo(27.6, 51.2); q.lineTo(26.8, 45.4); q.closePath(); }, shade(fur, -54));
    // body: deep chest, tucked belly, a darker saddle along the back
    const body = K.shape(q => { q.moveTo(29.4, 29.6); q.quadraticCurveTo(31.4, 35, 28.8, 41); q.quadraticCurveTo(24, 40.2, 20.4, 38.8); q.quadraticCurveTo(16, 39.4, 13.8, 41.4);
      q.quadraticCurveTo(8.6, 41.6, 7.6, 37.4); q.quadraticCurveTo(6.8, 32, 11, 30.8); q.quadraticCurveTo(18, 29.6, 24, 28.6); q.closePath(); },
      K.lin(0, 28.6, 0, 41.4, [[0, saddle], [0.45, fur], [1, lt]]));
    K.clip(body, () => { H.soft(0.6, () => K.ell(17, 30.4, 9, 1.6, alpha(dk, 0.6))); H.soft(0.5, () => K.ell(11, 37.6, 3.4, 3.6, 'rgba(0,0,0,.18)')); H.soft(0.4, () => K.curve([24, 31, 25.6, 35, 25, 39.4], 0.8, 'rgba(0,0,0,.22)')); });
    hairs(K, H, body, [6, 28, 26, 14], 380, 0.35, alpha(lt, 0.35), 'rgba(0,0,0,.3)');
    // neck and a ruff of paler fur at the throat (a heavy mane on the alpha)
    const neck = K.shape(q => { q.moveTo(23.6, 29.6); q.quadraticCurveTo(25.4, 24.6, 28.4, 21.8); q.lineTo(33, 24); q.quadraticCurveTo(33.4, 29.6, 30.4, 34); q.quadraticCurveTo(27, 33, 23.6, 29.6); q.closePath(); },
      K.lin(24, 22, 33, 34, [[0, saddle], [0.5, fur], [1, shade(fur, -14)]]));
    hairs(K, H, neck, [23, 21, 11, 14], 140, 1.1, alpha(lt, 0.35), 'rgba(0,0,0,.3)');
    if (p.mane) { const mn = K.shape(q => { q.moveTo(23, 30.4); q.quadraticCurveTo(22.6, 24.4, 27.6, 20.6); for (let i = 0; i < 7; i++) q.lineTo(28.6 + (i % 2) * 1.6 + i * 0.3, 21.6 + i * 2.2); q.quadraticCurveTo(26.6, 34.6, 23, 30.4); q.closePath(); }, K.lin(22, 20, 32, 36, [[0, shade(p.mane, 20)], [1, shade(p.mane, -30)]])); hairs(K, H, mn, [22, 20, 11, 16], 160, 1.3, 'rgba(255,255,255,.3)', 'rgba(0,0,0,.35)'); }
    K.shape(q => { q.moveTo(29.2, 30); q.quadraticCurveTo(32.6, 31.6, 31.6, 36.4); q.quadraticCurveTo(30.4, 38.6, 29.2, 36.4); q.quadraticCurveTo(28.2, 33, 29.2, 30); q.closePath(); }, K.lin(0, 30, 0, 38, [[0, lt], [1, shade(lt, -24)]]));
    // the head: skull, a long tapering muzzle, cheek ruff, ears up
    for (const [x0, x1, s] of [[28.6, 30.4, -6], [31, 33.2, 6]]) {
      K.poly([x0, 20.6, x0 + 0.7, 14.8, x1 + 0.4, 20.2], shade(fur, s - 10));
      K.poly([x0 + 0.6, 19.8, x0 + 0.9, 16.4, x1 - 0.2, 19.8], shade(fur, -60));
    }
    const head = K.shape(q => { q.moveTo(27.6, 23.4); q.quadraticCurveTo(28, 19.6, 31.4, 19.4); q.quadraticCurveTo(34.4, 19.4, 35.4, 22); q.lineTo(39.2, 24.4); q.quadraticCurveTo(40.4, 25.6, 39.4, 26.6);
      q.lineTo(35.6, 27.6); q.quadraticCurveTo(33, 29.2, 30.4, 28.4); q.quadraticCurveTo(27.6, 27.2, 27.6, 23.4); q.closePath(); },
      K.lin(28, 19, 32, 29, [[0, shade(fur, 16)], [0.6, fur], [1, lt]]));
    K.clip(head, () => {
      H.soft(0.3, () => K.ell(30, 22.4, 2, 1.2, alpha(dk, 0.5)));                  // the dark mask round the eye
      H.soft(0.3, () => K.curve([34.6, 23.4, 37, 24.4, 39, 25.4], 0.5, 'rgba(255,255,255,.3)'));
      H.soft(0.3, () => K.ell(30.6, 27.2, 2.6, 1.4, alpha(lt, 0.8)));             // the pale cheek
    });
    hairs(K, H, head, [27, 19, 13, 10], 160, 0.2, alpha(lt, 0.3), 'rgba(0,0,0,.28)');
    K.ell(39.4, 25.2, 0.9, 0.7, '#120e12'); K.ell(39.1, 24.9, 0.25, 0.2, 'rgba(255,255,255,.6)');
    K.curve([39.2, 26.4, 37.4, 26.8, 35.4, 27.4], 0.32, shade(fur, -80));          // the mouth line
    K.eye(33.4, 22.6, 0.9, p.eye, p.glow);
    if (p.scar) K.line([31.8, 20.6, 34.2, 24.8], 0.4, '#7a2a2a');
    // near legs: a long foreleg, the hind leg bent back at the hock
    K.shape(q => { q.moveTo(27, 36.8); q.lineTo(29.8, 37); q.lineTo(29.6, 45); q.lineTo(30.8, 50.8); q.quadraticCurveTo(29.6, 51.8, 28.2, 51.2); q.lineTo(28, 45.4); q.closePath(); }, K.lin(27, 0, 31, 0, [[0, shade(fur, 6)], [1, shade(fur, -34)]]));
    K.shape(q => { q.moveTo(9.4, 36); q.quadraticCurveTo(15.6, 37.6, 16.2, 42); q.lineTo(14.2, 47.2); q.lineTo(15.4, 50.8); q.quadraticCurveTo(14, 51.8, 12.6, 51.2); q.lineTo(12.4, 46.8); q.lineTo(13.4, 43.4); q.quadraticCurveTo(9.4, 41.6, 9.4, 36); q.closePath(); }, K.lin(9, 0, 16, 0, [[0, shade(fur, 4)], [1, shade(fur, -34)]]));
    for (const x of [29.4, 14]) for (let i = 0; i < 3; i++) K.line([x + i * 0.5, 51, x + 0.3 + i * 0.5, 51.6], 0.2, '#2a2420');
  }

  /* ---------- the bear: huge and hunched, shoulders high, head low, long claws ---------- */
  function bear(c, K, H, p) {
    const fur = p.fur, dk = p.dark;
    K.shape(q => { q.moveTo(8, 40); q.lineTo(12.4, 40); q.lineTo(12.6, 51.2); q.lineTo(7.6, 51.2); q.closePath(); }, shade(dk, -10));
    K.shape(q => { q.moveTo(25.6, 39); q.lineTo(30, 39); q.lineTo(30.4, 51.2); q.lineTo(25.4, 51.2); q.closePath(); }, shade(dk, -10));
    const body = K.shape(q => { q.moveTo(4.4, 42.6); q.quadraticCurveTo(3.4, 32, 11, 29.6); q.quadraticCurveTo(20, 25.6, 26.6, 27.2); q.quadraticCurveTo(31.6, 28.6, 32.6, 34.6);
      q.quadraticCurveTo(33, 42, 30, 44.6); q.quadraticCurveTo(19, 46.4, 8.6, 46); q.quadraticCurveTo(4.8, 45.6, 4.4, 42.6); q.closePath(); },
      K.lin(0, 26, 0, 46, [[0, shade(fur, 6)], [0.55, shade(fur, -8)], [1, dk]]));
    K.clip(body, () => { H.soft(0.6, () => K.ell(22, 28.4, 6, 2, 'rgba(255,255,255,.3)')); H.soft(0.7, () => K.ell(12, 40, 6, 5, 'rgba(0,0,0,.14)')); H.soft(0.5, () => K.curve([25, 30, 26.4, 36, 25.4, 43], 1.2, 'rgba(0,0,0,.18)')); });
    hairs(K, H, body, [3, 25, 31, 22], 600, 1.1, 'rgba(255,255,255,.3)', alpha(dk, 0.55));
    // head, low and forward: small round ears, a long muzzle, a black nose
    const head = K.shape(q => { q.moveTo(28.4, 30); q.quadraticCurveTo(29.6, 26.6, 33.6, 27); q.quadraticCurveTo(36.6, 27.4, 37.2, 30.2); q.lineTo(40.6, 32); q.quadraticCurveTo(41.4, 33.6, 40.2, 34.6);
      q.lineTo(36.2, 35.6); q.quadraticCurveTo(32.4, 37.2, 29.8, 35.2); q.quadraticCurveTo(28, 33.2, 28.4, 30); q.closePath(); }, K.lin(29, 27, 33, 37, [[0, fur], [1, shade(fur, -18)]]));
    hairs(K, H, head, [28, 26, 13, 12], 200, 0.3, 'rgba(255,255,255,.3)', alpha(dk, 0.5));
    for (const [x, y] of [[30.4, 27.6], [34, 27]]) { K.ell(x, y, 1.4, 1.3, fur); K.ell(x, y + 0.2, 0.7, 0.6, shade(dk, -20)); }
    K.ell(40.4, 32.6, 1.1, 0.85, '#16121a'); K.ell(40.1, 32.3, 0.3, 0.2, 'rgba(255,255,255,.6)');
    K.curve([40.2, 34.2, 38, 34.8, 36.2, 35.4], 0.35, shade(dk, -50));
    K.eye(34.6, 30.4, 0.8, p.eye || '#1a1620');
    // near legs: thick as posts, with long dark claws
    for (const [x, sh] of [[9.6, -4], [24.2, 6]]) {
      const lg = K.shape(q => { q.moveTo(x, 40); q.quadraticCurveTo(x + 3, 38.6, x + 6, 40); q.lineTo(x + 6.2, 50.4); q.quadraticCurveTo(x + 3, 51.6, x - 0.2, 50.6); q.closePath(); }, K.lin(x, 0, x + 6, 0, [[0, shade(fur, sh + 8)], [1, shade(fur, sh - 30)]]));
      hairs(K, H, lg, [x, 39, 6.4, 12], 90, 1.5, 'rgba(255,255,255,.3)', alpha(dk, 0.5));
      for (let i = 0; i < 4; i++) K.curve([x + 1.6 + i * 1.1, 51, x + 2 + i * 1.1, 51.6, x + 2.4 + i * 1.1, 51.8], 0.32, '#2a2430');
    }
  }

  /* ---------- the rat: hunched, pointed snout, round ears, a naked scaly tail ---------- */
  function rat(c, K, H, p) {
    const fur = p.fur, dk = shade(fur, -44), pink = p.pink || '#d8a0a0';
    // the tail: long, naked, ringed with scales
    c.save(); c.lineCap = 'round';
    const tpts = [9, 46, 3.4, 45, 3, 39, 3.2, 32, 7.4, 29.6]; K.curve(tpts, 1.1, shade(pink, -24)); K.curve(tpts, 0.5, shade(pink, 6));
    for (let t = 0; t < 1; t += 0.06) { const x = 9 - 6 * Math.sin(t * 2.2) - t * 1.5, y = 46 - t * 16; K.line([x - 0.5, y, x + 0.5, y + 0.1], 0.08, 'rgba(90,40,40,.5)'); }
    c.restore();
    K.leg([14, 45.6, 12.8, 50.8], 1.4, dk, shade(pink, -30)); K.leg([25.4, 45, 26, 50.8], 1.4, dk, shade(pink, -30));
    // body: a hunched back, the haunch round, the belly paler
    const body = K.shape(q => { q.moveTo(8, 45); q.quadraticCurveTo(7, 35, 16, 33.4); q.quadraticCurveTo(25, 32.4, 29.6, 37.6); q.quadraticCurveTo(31, 44, 26.4, 47.4); q.lineTo(12.6, 47.6); q.quadraticCurveTo(8.4, 47.4, 8, 45); q.closePath(); },
      K.lin(0, 33, 0, 48, [[0, shade(fur, -10)], [0.6, fur], [1, shade(fur, 24)]]));
    K.clip(body, () => { H.soft(0.6, () => K.ell(12.6, 41.6, 4, 4.2, 'rgba(0,0,0,.18)')); H.soft(0.5, () => K.ell(18, 34.4, 8, 1.6, 'rgba(255,255,255,.18)')); });
    hairs(K, H, body, [7, 32, 24, 16], 420, 0.45, 'rgba(255,248,236,.3)', alpha(dk, 0.6));
    // the head: a long wedge to a pink nose, whiskers, a round thin ear
    const head = K.shape(q => { q.moveTo(26, 37); q.quadraticCurveTo(29, 34.4, 32.6, 36.6); q.lineTo(38.4, 40.4); q.quadraticCurveTo(39.4, 41.6, 38.4, 42.4); q.lineTo(33.4, 44); q.quadraticCurveTo(28.4, 45.4, 26.4, 42.4); q.closePath(); },
      K.lin(0, 35, 0, 45, [[0, shade(fur, -6)], [1, shade(fur, 20)]]));
    hairs(K, H, head, [26, 34, 13, 11], 160, 0.4, 'rgba(255,248,236,.3)', alpha(dk, 0.5));
    K.ell(29.4, 35.4, 2.2, 2.4, shade(fur, -14)); K.ell(29.6, 35.6, 1.4, 1.6, alpha(pink, 0.85)); H.soft(0.2, () => K.ell(29.8, 35.8, 0.8, 1, 'rgba(120,50,50,.35)'));
    K.ell(38.6, 41.4, 0.8, 0.7, shade(pink, -10));
    for (const dy of [-0.8, 0.2, 1.2]) K.curve([37.4, 41.6 + dy * 0.2, 39.4, 41 + dy * 0.8, 41.4, 40.4 + dy * 1.6], 0.09, 'rgba(240,236,228,.75)');
    K.eye(33.4, 39, 0.85, p.eye || '#140c10', p.glow);
    // near legs: thin, with pink clawed feet
    K.leg([21.6, 45, 20.8, 50.8], 1.6, shade(fur, -10), shade(pink, -10)); K.leg([31, 43.4, 32.6, 50.8], 1.4, shade(fur, -6), shade(pink, -10));
    if (p.crown) {
      K.poly([25.6, 34.6, 25.2, 29.4, 27, 31.6, 28.4, 28.4, 29.8, 31.4, 31.6, 29.2, 31.4, 34.4], K.lin(0, 28, 0, 35, [[0, '#f0d27a'], [1, '#9a7020']]));
      K.ell(28.5, 33, 0.7, 0.7, '#b82a3a'); K.R(25.4, 33.6, 6.2, 1.1, '#8a6018', 0.4);
      for (let i = 0; i < 12; i++) K.ell(25.6 + H.rr() * 6, 29 + H.rr() * 5, 0.12, 0.12, 'rgba(40,20,0,.4)');      // tarnish
    }
  }

  /* ---------- the bat: finger-bones through a leathery membrane, a furred body, big ears ---------- */
  function bat(c, K, H, p) {
    const body = p.body, wing = p.wing, bone = shade(wing, -30);
    for (const s of [-1, 1]) {
      const x = v => 20 + s * v;
      const mem = K.shape(q => { q.moveTo(x(2.2), 21); q.lineTo(x(7), 15.4); q.lineTo(x(12.6), 13.2); q.lineTo(x(18.6), 15.6);
        q.quadraticCurveTo(x(17), 19.4, x(17.6), 23.6); q.quadraticCurveTo(x(14.4), 21.6, x(12.8), 25.4); q.quadraticCurveTo(x(10), 22.8, x(7.6), 27.6); q.quadraticCurveTo(x(5), 25, x(2.4), 27); q.closePath(); },
        K.lin(x(2), 13, x(18), 27, [[0, shade(wing, s < 0 ? 16 : -10)], [1, shade(wing, s < 0 ? -10 : -36)]]));
      K.clip(mem, () => { H.soft(0.3, () => { for (const [a, b] of [[12.6, 13.2], [18.6, 15.6]]) K.line([x(7), 15.4, x(a + (b - a) * 0.5), 20], 0.6, 'rgba(0,0,0,.18)'); }); for (let i = 0; i < 40; i++) K.ell(x(3 + H.rr() * 15), 15 + H.rr() * 12, 0.12, 0.05, 'rgba(0,0,0,.18)'); });
      // the bones: arm to the wrist, then four fingers spread to the edge
      K.line([x(2.4), 21.4, x(7), 15.4], 0.55, bone);
      for (const [fx, fy] of [[12.6, 13.2], [18.6, 15.6], [17.6, 23.6], [12.8, 25.4]]) K.line([x(7), 15.4, x(fx), fy], 0.3, bone);
      K.poly([x(7), 15.4, x(7.6), 13.6, x(7.6), 15.8], '#e8e0d0');                                                   // the thumb claw
    }
    // the body: furred, small, with the ears up and a pug face
    const torso = K.shape(q => { q.ellipse(20, 23.2, 3.4, 5, 0, 0, 6.283); }, K.lin(17, 18, 23, 28, [[0, shade(body, 20)], [1, shade(body, -30)]]));
    hairs(K, H, torso, [16, 18, 8, 11], 160, 1.5, 'rgba(255,240,255,.3)', 'rgba(0,0,0,.35)');
    for (const s of [-1, 1]) { K.poly([20 + s * 1.2, 17.4, 20 + s * 3.4, 12, 20 + s * 2.8, 17.8], shade(body, -10)); K.poly([20 + s * 1.6, 17.2, 20 + s * 3, 13.6, 20 + s * 2.6, 17.4], alpha('#c890a0', 0.6)); }
    K.ell(20, 18.6, 2.8, 2.4, K.rad(19.4, 18, 0.2, 3, [[0, shade(body, 20)], [1, shade(body, -20)]]));
    K.ell(20, 19.8, 1, 0.7, shade(body, -40)); K.ell(19.6, 19.6, 0.2, 0.15, 'rgba(255,255,255,.4)');
    K.poly([19.2, 20.6, 19.4, 21.6, 19.6, 20.6], '#f4ece0'); K.poly([20.4, 20.6, 20.6, 21.6, 20.8, 20.6], '#f4ece0');
    K.eye(18.6, 18.2, 0.75, p.eye, true); K.eye(21.4, 18.2, 0.75, p.eye, true);
    K.line([19, 28, 18.6, 30], 0.4, bone); K.line([21, 28, 21.4, 30], 0.4, bone);
    return K2 => K2.ell(20, 51.6, 6, 1.6, 'rgba(0,0,0,.3)');                               // its shadow far below
  }

  /* ---------- the spider: a hairy abdomen with a mark, jointed legs, a cluster of eyes ---------- */
  function spider(c, K, H, p) {
    const b = p.body, dk = shade(b, -40);
    const leg = (pts, w, col) => { K.line(pts, w, col); for (let i = 2; i < pts.length - 2; i += 2) K.ell(pts[i], pts[i + 1], w * 0.65, w * 0.65, shade(col, 16)); };
    // far legs, then the abdomen, then the near legs
    for (const [a, d] of [[[22, 38, 26.6, 30.4, 33.6, 33, 37.6, 46], 0], [[20, 38.6, 23.4, 31.6, 29, 33.4, 33, 47], 0], [[17.4, 38.6, 13.6, 31.4, 8, 33.4, 4.6, 47], 0], [[16, 38, 11.6, 30.4, 5.2, 32.6, 2, 45.4], 0]]) leg(a, 0.9, shade(b, -30 + d));
    const ab = K.shape(q => { q.ellipse(15, 37.4, 8.4, 6.8, -0.2, 0, 6.283); }, K.rad(12.4, 34.4, 0.5, 9.4, [[0, shade(b, 26)], [0.6, b], [1, dk]]));
    hairs(K, H, ab, [6, 30, 18, 15], 380, 0.9, 'rgba(255,240,255,.28)', 'rgba(0,0,0,.4)');
    K.clip(ab, () => { K.shape(q => { q.moveTo(13.4, 33.6); q.lineTo(16.6, 35.6); q.lineTo(13.8, 37.4); q.lineTo(17, 39.6); q.lineTo(13, 41.4); q.lineTo(11.2, 38.6); q.lineTo(12.8, 37.2); q.lineTo(10.8, 35.6); q.closePath(); }, alpha(p.mark, 0.85)); });
    const ce = K.shape(q => { q.ellipse(24.6, 39, 4.6, 3.8, 0.1, 0, 6.283); }, K.rad(23.4, 37.6, 0.3, 5, [[0, shade(b, 20)], [1, dk]]));
    hairs(K, H, ce, [20, 35, 10, 8], 140, 0.3, 'rgba(255,240,255,.25)', 'rgba(0,0,0,.4)');
    // the fangs (chelicerae) and the eyes: two big, six small
    for (const x of [27.2, 29]) { K.shape(q => { q.moveTo(x - 0.8, 40.6); q.quadraticCurveTo(x + 0.8, 41.6, x + 0.2, 44.4); q.quadraticCurveTo(x - 0.4, 43, x - 1.2, 41.6); q.closePath(); }, shade(b, -20)); K.poly([x - 0.1, 43.8, x + 0.5, 44.6, x + 0.1, 45.4], '#e8e4d8'); }
    for (const [x, y, r] of [[27, 37.8, 0.75], [28.8, 38.2, 0.65], [25.8, 36.8, 0.4], [27.8, 36.6, 0.38], [29.6, 37.2, 0.36], [26.4, 39.2, 0.32]]) K.eye(x, y, r, p.eye, true);
    for (const a of [[23, 41, 26, 44.4, 29.6, 43.4, 33.4, 51], [21.4, 41.4, 20.8, 45.4, 16.4, 46, 13.6, 51.2], [24.8, 41, 28.6, 41.2, 34.2, 40.4, 38.4, 49.4], [19.6, 40.6, 16.2, 42.4, 10.4, 43.4, 7.6, 51]]) leg(a, 1.1, shade(b, -8));
  }

  /* ---------- the crab: a ridged, pitted shell, heavy claws, eyes on stalks ---------- */
  function crab(c, K, H, p) {
    const sh = p.shell, dk = shade(sh, -40);
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const x0 = 20 + s * (6 + i * 1.6), y0 = 40 + i * 1.6; K.line([x0, y0, x0 + s * 4.4, y0 - 2, x0 + s * 6.6, y0 + 6 + i * 1.2], 0.9 - i * 0.1, shade(sh, -24 - i * 6)); }
    const shell = K.shape(q => { q.moveTo(8.4, 40); q.quadraticCurveTo(9.4, 31.6, 20, 31.2); q.quadraticCurveTo(30.6, 31.6, 31.6, 40); q.quadraticCurveTo(26, 45.4, 20, 45.2); q.quadraticCurveTo(14, 45.4, 8.4, 40); q.closePath(); },
      K.rad(16, 34, 0.5, 15, [[0, shade(sh, 30)], [0.55, sh], [1, dk]]));
    K.clip(shell, () => {
      for (const x of [14.6, 20, 25.4]) H.soft(0.3, () => K.curve([x, 32, x + (x - 20) * 0.1, 38, x + (x - 20) * 0.2, 45], 0.5, 'rgba(0,0,0,.25)'));
      for (let i = 0; i < 70; i++) K.ell(9 + H.rr() * 22, 32 + H.rr() * 13, 0.15 + H.rr() * 0.2, 0.12 + H.rr() * 0.15, H.rr() > 0.5 ? 'rgba(255,230,200,.3)' : 'rgba(40,10,0,.35)');
      H.soft(0.5, () => K.ell(20, 44.6, 11, 2, 'rgba(240,210,170,.4)'));         // the paler underside
      for (let i = 0; i < 6; i++) K.poly([9.4 + i * 4, 40.2 - Math.abs(i - 2.5) * 0.8, 10.4 + i * 4, 39.2 - Math.abs(i - 2.5) * 0.8, 11.4 + i * 4, 40.4 - Math.abs(i - 2.5) * 0.8], alpha(shade(sh, 40), 0.6));
    });
    // claws: a big crusher and a smaller cutter
    for (const [s, k] of [[-1, 1.15], [1, 0.95]]) {
      const ax = 20 + s * 10.6, ay = 36;
      K.line([20 + s * 8, 38, ax, ay - 2], 1.6 * k, shade(sh, -14));
      c.save(); c.translate(ax + s * 1.6, ay - 6); c.scale(s * k, k);
      const cl = K.shape(q => { q.moveTo(-2.6, 4); q.quadraticCurveTo(-4, -2.6, 0.6, -4.4); q.quadraticCurveTo(3.8, -4.4, 4, -1.4); q.lineTo(0.8, -0.6); q.lineTo(3, 2.2); q.quadraticCurveTo(1.4, 4.8, -2.6, 4); q.closePath(); }, K.rad(-1, -2, 0.3, 5, [[0, shade(sh, 30)], [1, dk]]));
      K.clip(cl, () => { for (let i = 0; i < 14; i++) K.ell(-3 + H.rr() * 7, -4 + H.rr() * 8, 0.15, 0.15, 'rgba(255,230,210,.4)'); });
      K.line([0.8, -0.6, 3.8, -1.4], 0.25, '#2a0a04'); c.restore();
    }
    for (const x of [17.4, 22.6]) { K.line([x, 33, x + (x > 20 ? 0.4 : -0.4), 29.2], 0.6, shade(sh, -10)); K.eye(x + (x > 20 ? 0.4 : -0.4), 28.8, 1, '#1a1018'); }
  }

  /* ---------- the eel: rising out of dark water, mottled, a long finned back, a hooked jaw ---------- */
  function eel(c, K, H, p) {
    const b = p.body, bel = p.belly, fn = p.fin;
    K.ell(20, 47.8, 11, 3.2, K.rad(20, 47.4, 0.5, 11, [[0, 'rgba(20,40,40,.9)'], [1, 'rgba(10,26,30,.5)']]));     // the dark water it comes from
    c.strokeStyle = 'rgba(200,230,230,.4)'; c.lineWidth = 0.25; for (const r of [6, 9]) { c.beginPath(); c.ellipse(20, 47.8, r, r * 0.28, 0, 3.4, 6); c.stroke(); }
    const spine = [14.4, 47.6, 13, 38, 18.4, 32, 25.2, 26.4, 23.6, 18.6];
    // the dorsal fin along the back, then the body as a tapering ribbon with a pale belly
    K.curve([13.4, 44, 11.8, 37, 17, 31, 23.4, 25.4, 22.6, 19.2], 2.2, alpha(fn, 0.9));
    const pts = []; for (let t = 0; t <= 1.0001; t += 0.05) { const u = 1 - t, x = u * u * u * 14.4 + 3 * u * u * t * 13 + 3 * u * t * t * 18.4 + t * t * t * 25.2, y = u * u * u * 47.6 + 3 * u * u * t * 38 + 3 * u * t * t * 32 + t * t * t * 26.4; pts.push([x, y, 2.4 - t * 0.6]); }
    const ribbon = K.shape(q => { pts.forEach(([x, y, w], i) => i ? q.lineTo(x - w, y - w * 0.3) : q.moveTo(x - w, y)); for (let i = pts.length - 1; i >= 0; i--) { const [x, y, w] = pts[i]; q.lineTo(x + w, y + w * 0.3); } q.closePath(); },
      K.lin(12, 0, 28, 0, [[0, shade(b, 10)], [0.5, b], [1, shade(b, -30)]]));
    K.clip(ribbon, () => { for (let i = 0; i < 70; i++) K.ell(11 + H.rr() * 16, 26 + H.rr() * 22, 0.4 + H.rr() * 0.4, 0.3, H.rr() > 0.5 ? alpha(shade(b, -40), 0.45) : alpha(shade(b, 30), 0.3)); pts.forEach(([x, y, w]) => K.ell(x + w * 0.5, y + 0.2, w * 0.5, 0.6, alpha(bel, 0.5))); });
    // the head: long, a hooked lower jaw, teeth showing
    const head = K.shape(q => { q.moveTo(23, 26.6); q.quadraticCurveTo(22, 21, 24.6, 17.4); q.quadraticCurveTo(28, 15.4, 31.4, 17.2); q.lineTo(33.4, 18.8); q.quadraticCurveTo(31.6, 20.6, 28.6, 20.6);
      q.lineTo(32, 21.6); q.quadraticCurveTo(30.4, 23.6, 27.4, 23.4); q.quadraticCurveTo(25.4, 26, 23, 26.6); q.closePath(); }, K.lin(23, 16, 30, 26, [[0, shade(b, 16)], [1, shade(b, -26)]]));
    K.clip(head, () => { for (let i = 0; i < 24; i++) K.ell(23 + H.rr() * 10, 16 + H.rr() * 10, 0.35, 0.25, alpha(shade(b, -40), 0.45)); });
    for (let i = 0; i < 4; i++) K.poly([28.6 + i * 0.8, 20.6, 29 + i * 0.8, 21.4, 29.4 + i * 0.8, 20.7], '#ece6d6');
    K.eye(28, 18.4, 0.9, p.eye, true);
    K.line([31.6, 17.6, 32.6, 18.4], 0.25, '#1a2016');                                    // the nostril
  }

  /* ---------- the colossus: a giant's skeleton, bones yellowed and cracked, embers in the sockets ---------- */
  function colossus(c, K, H, p) {
    const BN = '#ddd4ba', BD = '#9a8e72', bone = (pts, w, d) => { K.line(pts, w, shade(BN, d || 0)); H.soft(0.15, () => K.line(pts.map((v, i) => i % 2 ? v : v - w * 0.22), w * 0.3, 'rgba(255,252,236,.5)')); };
    const knob = (x, y, r, d) => K.ell(x, y, r, r * 0.9, K.rad(x - r * 0.3, y - r * 0.3, 0.1, r * 1.2, [[0, shade(BN, 20 + (d || 0))], [1, shade(BD, d || 0)]]));
    // legs: femur, knee, shin bones, long feet
    for (const [s, d] of [[-1, 0], [1, -18]]) { const x = 20 + s * 3.6; bone([x, 34.6, x + s * 0.6, 42.4], 1.6, d); knob(x + s * 0.6, 42.6, 1.2, d); bone([x + s * 0.6 - 0.5, 43.2, x + s * 0.4 - 0.6, 50.4], 0.8, d); bone([x + s * 0.6 + 0.6, 43.2, x + s * 0.4 + 0.5, 50.4], 0.7, d - 10); K.R(x + s * 0.4 - 2, 50, 4.4, 1.6, shade(BN, d - 10), 0.6); }
    // pelvis
    K.shape(q => { q.moveTo(14.6, 31); q.quadraticCurveTo(20, 29.4, 25.4, 31); q.quadraticCurveTo(26, 34.6, 22.4, 35.6); q.lineTo(20, 33.6); q.lineTo(17.6, 35.6); q.quadraticCurveTo(14, 34.6, 14.6, 31); q.closePath(); }, K.lin(14, 0, 26, 0, [[0, shade(BN, 10)], [1, BD]]));
    K.ell(17.2, 32.4, 1, 0.9, '#2a2420'); K.ell(22.8, 32.4, 1, 0.9, '#2a2420');
    // spine and ribcage
    for (let y = 13.6; y < 31; y += 1.5) K.ell(20, y, 0.9, 0.6, shade(BN, -(y - 14)));
    for (let i = 0; i < 6; i++) { const y = 16 + i * 2, w = 6.4 - Math.abs(i - 1.6) * 0.6; for (const s of [-1, 1]) { K.curve([20, y, 20 + s * w * 0.9, y - 0.6, 20 + s * w, y + 1.8], 0.75, shade(BN, s > 0 ? -16 : 4)); } }
    K.R(19.2, 15.4, 1.6, 6, shade(BN, 8), 0.6);                                            // the breastbone
    // arms: long, hanging, big hands
    for (const [s, d] of [[-1, 0], [1, -18]]) { const x0 = 20 + s * 6.6; knob(x0, 15, 1.6, d); bone([x0 + s * 0.4, 15.8, x0 + s * 1.6, 23.6], 1.2, d); knob(x0 + s * 1.6, 23.8, 1, d); bone([x0 + s * 1.6, 24.4, x0 + s * 2.4, 31], 0.85, d); for (let f = 0; f < 4; f++) bone([x0 + s * 2.4 - 1 + f * 0.6, 31.2, x0 + s * 2.6 - 1.2 + f * 0.7, 33.8], 0.32, d - 6); }
    K.line([13.4, 14.6, 26.6, 14.6], 0.9, shade(BN, -6));                                   // collarbones
    // the skull: a real one, big, cracked, cheekbones and teeth, embers far back in the sockets
    const sk = K.shape(q => { q.moveTo(15, 8); q.quadraticCurveTo(15, 2.4, 20, 2.4); q.quadraticCurveTo(25.2, 2.4, 25.2, 8); q.quadraticCurveTo(25.4, 10.6, 23.6, 11.4); q.lineTo(23, 13.4); q.lineTo(17.2, 13.4); q.lineTo(16.6, 11.4); q.quadraticCurveTo(14.8, 10.6, 15, 8); q.closePath(); },
      K.rad(18.4, 5, 0.3, 8, [[0, '#f4eedc'], [0.6, BN], [1, BD]]));
    K.clip(sk, () => { H.soft(0.2, () => { K.ell(17.8, 8, 1.4, 1.5, '#1a1410'); K.ell(22.4, 8, 1.4, 1.5, '#1a1410'); }); K.poly([19.6, 10, 20.2, 9, 20.8, 10, 20.2, 11], '#2a2018'); K.line([17, 3.6, 18.2, 5.6, 17.4, 7], 0.15, 'rgba(60,40,20,.7)'); });
    for (let i = 0; i < 6; i++) K.R(17.6 + i * 0.84, 11.8, 0.62, 1.2, i % 2 ? '#e8e0c8' : '#d4ccb2', 0.15);
    for (const x of [17.8, 22.4]) K.eye(x, 8.2, 0.8, p.eye, true);
  }

  /* ---------- the golem: boulders stacked into a giant, cracked and mossed, a rune burning in the chest ---------- */
  function golem(c, K, H, p) {
    const st = p.stone, dk = shade(st, -44);
    const rock = (pts, d) => { const pa = K.shape(q => { q.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) q.lineTo(pts[i], pts[i + 1]); q.closePath(); }, K.lin(Math.min(...pts.filter((v, i) => !(i % 2))), 0, Math.max(...pts.filter((v, i) => !(i % 2))), 0, [[0, shade(st, 20 + d)], [0.5, shade(st, d)], [1, shade(st, -40 + d)]]));
      K.clip(pa, () => { for (let i = 0; i < 30; i++) K.ell(pts[0] - 4 + H.rr() * 12, pts[1] - 2 + H.rr() * 12, 0.2 + H.rr() * 0.3, 0.15 + H.rr() * 0.2, H.rr() > 0.5 ? 'rgba(255,255,250,.2)' : 'rgba(0,0,0,.25)'); }); return pa; };
    rock([14.4, 40, 18.6, 39.6, 19, 51.2, 13.6, 51.2, 13, 45], -6); rock([21.2, 39.6, 25.8, 40, 27, 45.6, 26.4, 51.2, 21, 51.2], -16);       // legs
    const torso = rock([11.4, 24, 16, 20.6, 24.6, 20.2, 29, 24.2, 28.6, 33.6, 25.4, 40.6, 14.6, 40.6, 11.6, 34], 0);
    K.clip(torso, () => { K.line([14, 26, 17.6, 31, 15.4, 36], 0.3, 'rgba(0,0,0,.5)'); K.line([25.4, 23.6, 23, 29.4, 26.4, 35], 0.3, 'rgba(0,0,0,.5)'); H.soft(0.6, () => K.ell(20, 31, 4, 4, alpha(p.glow, 0.35))); });
    // the rune in the chest
    c.save(); c.strokeStyle = p.glow; c.lineWidth = 0.5; c.beginPath(); c.moveTo(20, 28); c.lineTo(20, 34); c.moveTo(18, 30); c.lineTo(22, 32.4); c.moveTo(22, 30); c.lineTo(18, 32.4); c.stroke(); c.restore();
    // arms: two boulders each, the fists huge
    for (const [s, d] of [[-1, 4], [1, -20]]) { rock([20 + s * 9, 22.4, 20 + s * 12.6, 23.4, 20 + s * 13, 30, 20 + s * 9.4, 30.6], d); rock([20 + s * 9.4, 30.6, 20 + s * 13.4, 31, 20 + s * 13.8, 37.6, 20 + s * 9.6, 38.4], d - 6); }
    // the head: a smaller stone, sunk between the shoulders, two lit slits
    rock([16.6, 15.6, 19.6, 13.4, 23.4, 14, 24.4, 19.4, 22.6, 21.4, 17.4, 21.4], 6);
    for (const x of [18.6, 22]) { K.R(x - 0.9, 17.2, 1.8, 0.6, p.glow, 0.2); }
    // moss in the cracks
    for (const [x, y, w] of [[12.6, 25.4, 2.6], [26.6, 38.4, 2], [17.2, 14.6, 2.4], [30.6, 23.8, 1.8]]) K.ell(x, y, w, 0.8, alpha(p.moss, 0.9));
    return K2 => { K2.ell(20, 31, 6, 6, K2.rad(20, 31, 0.2, 6, [[0, alpha(p.glow, 0.5)], [1, alpha(p.glow, 0)]])); };
  }

  /* ---------- the automaton: a clockwork knight of brass plates and rivets, a visor slit for a face ---------- */
  function automaton(c, K, H, p) {
    const br = p.brass, dk = shade(br, -48), plate = (path, x0, x1, d) => { const pa = K.shape(path, K.lin(x0, 0, x1, 0, [[0, shade(br, 34 + d)], [0.45, shade(br, 6 + d)], [1, shade(br, -46 + d)]])); K.clip(pa, () => { for (let i = 0; i < 30; i++) K.ell(x0 + H.rr() * (x1 - x0), 8 + H.rr() * 44, 0.2, 0.12, 'rgba(40,20,0,.25)'); }); return pa; };
    // legs: jointed, with pistons
    for (const [s, d] of [[-1, 0], [1, -18]]) { const x = 20 + s * 3.4; K.R(x - 0.5, 36, 1, 8, '#4a4a52', 0.3); plate(q => { q.rect(x - 1.8, 35, 3.6, 6); }, x - 1.8, x + 1.8, d); K.ell(x, 42, 1.6, 1.4, shade(br, d - 10)); plate(q => { q.moveTo(x - 1.6, 43); q.lineTo(x + 1.6, 43); q.lineTo(x + 2, 49.6); q.lineTo(x - 2, 49.6); q.closePath(); }, x - 2, x + 2, d); K.R(x - 2.6, 49.4, 5.2 + (s > 0 ? 0.6 : 0), 2, shade(br, d - 20), 0.6); }
    // the body: a barrel of riveted plates, an open hatch showing the gears
    const body = plate(q => { q.moveTo(13.2, 21); q.quadraticCurveTo(20, 19.4, 26.8, 21); q.lineTo(26, 34.4); q.quadraticCurveTo(20, 36, 14, 34.4); q.closePath(); }, 13, 27, 0);
    K.clip(body, () => { for (const y of [24.6, 29.4]) { K.line([12, y, 28, y], 0.3, 'rgba(0,0,0,.4)'); for (let x = 14; x < 27; x += 2) K.ell(x, y - 0.6, 0.3, 0.3, shade(br, 50)); } });
    K.ell(20.4, 27.6, 2.8, 2.6, '#1a1410');
    for (const [x, y, r, sp] of [[20, 27.4, 1.8, 1], [21.6, 28.6, 1, -1.6]]) { c.save(); c.translate(x, y); for (let t = 0; t < 8; t++) { c.rotate(Math.PI / 4); K.R(-0.25, -r - 0.4, 0.5, 0.8, '#c8a050', 0.1); } c.restore(); K.ell(x, y, r * 0.8, r * 0.8, K.rad(x - 0.3, y - 0.3, 0.1, r, [[0, '#e8c070'], [1, '#7a5420']])); K.ell(x, y, 0.3, 0.3, '#2a1a0a'); }
    // arms: plated, with a hammer-hand and a pincer
    for (const [s, d] of [[-1, 4], [1, -20]]) { const x = 20 + s * 8.2; K.ell(x, 22.6, 2.4, 2.2, shade(br, d)); K.R(x - 0.5 + s * 0.6, 23, 1, 9, '#4a4a52', 0.3); plate(q => { q.rect(x - 1.4 + s * 0.6, 24, 2.8, 5.6); }, x - 1.4, x + 1.4, d); }
    K.R(9.4, 31.6, 4.6, 3.2, shade(br, -10), 0.8); K.line([29, 31.6, 30.6, 35], 0.6, '#5a5a62'); K.line([28.2, 31.6, 28.6, 35.4], 0.6, '#5a5a62');
    // the head: a helm with a visor slit and the light behind it, a steam pipe
    plate(q => { q.moveTo(16.4, 19.6); q.quadraticCurveTo(16, 12.4, 20, 12); q.quadraticCurveTo(24, 12.4, 23.6, 19.6); q.closePath(); }, 16, 24, 10);
    K.R(17, 15.4, 6, 1.1, '#120c08', 0.3); K.R(17.6, 15.7, 4.8, 0.5, p.eye, 0.2);
    K.R(23.4, 13, 0.9, 3.4, '#5a5a62', 0.3);
    return K2 => K2.ell(20, 15.9, 4, 1.8, K2.rad(20, 15.9, 0.2, 4, [[0, alpha(p.eye, 0.5)], [1, alpha(p.eye, 0)]]));
  }

  B.REAL_BEASTS = {
    rat: (c, K, H) => rat(c, K, H, { fur: '#7a6656' }),
    ratking: (c, K, H) => rat(c, K, H, { fur: '#5e5260', eye: '#d8343a', glow: true, crown: true }),
    bat: (c, K, H) => bat(c, K, H, { body: '#4a3c4c', wing: '#4e4050', eye: '#e8c84a' }),
    wolf: (c, K, H) => wolf(c, K, H, { fur: '#7a7c84', light: '#c8c6c0', eye: '#e8b83a' }),
    alpha: (c, K, H) => wolf(c, K, H, { fur: '#a8aab2', light: '#ecece6', eye: '#ff4a3a', glow: true, mane: '#8a8c96', scar: true }),
    bear: (c, K, H) => bear(c, K, H, { fur: '#e8e6de', dark: '#9a9c9e' }),
    spider: (c, K, H) => spider(c, K, H, { body: '#3a3036', mark: '#a8343e', eye: '#e84a50' }),
    crab: (c, K, H) => crab(c, K, H, { shell: '#b44a32' }),
    eel: (c, K, H) => eel(c, K, H, { body: '#3e5a46', belly: '#b8b88a', fin: '#4a6a52', eye: '#e8d04a' }),
    colossus: (c, K, H) => colossus(c, K, H, { eye: '#ff8a3a' }),
    automaton: (c, K, H) => automaton(c, K, H, { brass: '#a8802e', eye: '#7ad8ff' }),
    golem: (c, K, H) => golem(c, K, H, { stone: '#8a8a8e', glow: '#6ac8ff', moss: '#4e6a3a' })
  };
})();
