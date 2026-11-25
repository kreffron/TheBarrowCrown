/* A portrait bust painted from scratch, in a 100 x 100 space: the head three-quarters to the viewer's right, key light
   from the upper left. Bust.paint(c, S, hero, o) paints into c (already scaled by S px/unit); it records the shapes it
   draws (rec: path, role, colour) so the stylised versions can ink, wash or lead them. */
(function () {
  const Bz = {};
  const sh = (h, p) => { const n = parseInt(h.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v + (p > 0 ? (255 - v) * p / 100 : v * p / 100)))); return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join(''); };
  const al = (h, a) => { const n = parseInt(h.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; };
  const HEROES = {
    runa: { skin: '#e9b896', eye: '#3f8a5c', hair: '#c9512a', brow: '#9a3e22', lip: '#c27766', age: 0, jaw: 1.06, freckles: 1, hs: { jaw: 1.03, square: 0.7, chinW: 1.15, cheek: 0.4 }, woad: 1, mouth: 'set', eyeS: 1, nose: [1, 1], mouthS: 1 },
    dask: { skin: '#cf9c78', eye: '#7a8a3a', hair: '#2a1c16', brow: '#20160f', lip: '#a8695a', age: 0.15, jaw: 0.98, stubble: '#3a2a20', scar: 1, hs: { cheek: 0.5, chin: -0.8, chinW: 0.9 }, mouth: 'smirk', eyeS: 0.9, nose: [1.14, 1.05], mouthS: 1.04, noEar: 1 },
    maren: { skin: '#e8b9a0', eye: '#4a74aa', hair: '#eeeae2', brow: '#bdb6ac', lip: '#b77c72', age: 1, jaw: 0.96, hs: { chin: 1.2, chinW: 0.85, cheek: 0.3 }, mouth: 'smile', eyeS: 0.93, nose: [1, 1.08], mouthS: 0.92 },
    finch: { skin: '#eab995', eye: '#3a7ac6', hair: '#e7bd62', brow: '#a88234', lip: '#c4706a', age: 0, jaw: 0.94, hs: { cheek: -0.2, chin: -0.6, chinW: 1.1, square: 0.2 }, mouth: 'grin', eyeS: 1.1, nose: [0.92, 0.94], mouthS: 1.06 }
  };
  Bz.HEROES = HEROES;
  const mix = (a, b, t) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), f = (x, y) => Math.round(x + (y - x) * t); return '#' + [f(A >> 16, B >> 16), f((A >> 8) & 255, (B >> 8) & 255), f(A & 255, B & 255)].map(v => v.toString(16).padStart(2, '0')).join(''); };
  const hsl = hx => { const n = parseInt(hx.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b); return { l: (mx + mn) / 2, s: mx === mn ? 0 : (mx - mn) / (1 - Math.abs(mx + mn - 1)) }; };
  Bz.moodify = function (h, mood) {
    const o = Object.assign({}, h), foe = h.foe, kid = h.child || h.mouth === 'grin' || h.kind === 'goblin';
    if (mood === 'happy') Object.assign(o, foe ? { mouth: 'smirk', bi: 0.5, bo: -0.4, eyeK: 0.84 } : { mouth: kid || h.mouth === 'smirk' ? 'grin' : 'beam', bi: -0.8, bo: -0.5, eyeK: 0.76, cheekUp: 1 });
    if (mood === 'angry') Object.assign(o, { mouth: h.kind === 'goblin' ? 'grin' : 'scowl', bi: 2.5, bo: -0.9, eyeK: 0.72, furrow: 1, mouthS: (h.mouthS || 1) * 0.92, glow: h.kind === 'skel' ? '#ff5a3a' : h.glow });
    if (mood === 'worried') Object.assign(o, { mouth: 'worry', bi: -2.5, bo: 0.5, eyeK: 1.2, foreLines: 1.2, mouthS: (h.mouthS || 1) * 0.88 });
    if (mood === 'sad') Object.assign(o, { mouth: 'sad', bi: -2.1, bo: 1.3, eyeK: 0.72, look: 0.45, foreLines: 0.8, tearLine: !foe && h.kind === 'human' ? 1 : 0, glow: h.kind === 'skel' ? '#7a8aa8' : h.glow });
    return o;
  };
  Bz.fromSpec = function (sp, key, m) {
    m = m || {}; let sd = 7; for (const ch of key) sd = (sd * 31 + ch.charCodeAt(0)) % 2147483000; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
    const kind = sp.skel ? 'skel' : sp.ears ? 'goblin' : (m.kind || 'human'), sex = m.sex || 'm', child = !!m.child;
    const hair = sp.hair || '#4a3a2a', hx = hsl(hair), grey = hx.s < 0.16 && hx.l > 0.45, age = m.age != null ? m.age : grey ? 0.85 : (r() < 0.3 ? 0.3 : 0);
    const skin = sp.skin || '#e0b090', eyes = ['#5a3a22', '#6a4a2a', '#3a6aa8', '#4a7a5a', '#6a7a8a', '#7a5a2a', '#4a5a8a'];
    const moods = m.mouth ? [m.mouth] : m.foe ? ['frown', 'smirk', 'set'] : child ? ['grin', 'smile'] : ['set', 'smile', 'smile', 'smirk'];
    const fem = sex === 'f';
    const SHAPES = { oval: [{ chin: 0.4 }, 1, 1], square: [{ jaw: 1.12, square: 1.4, chinW: 1.45, cheek: 0.3 }, 1.05, 0.98], round: [{ cheek: 1, jaw: 1.07, chin: -2.4, chinW: 1.5, square: 0.4 }, 1.09, 0.94], long: [{ chin: 3.6, jaw: 0.94, chinW: 0.85, cheek: -0.3 }, 0.91, 1.07],
      heart: [{ cheek: 1.2, jaw: 0.84, chinW: 0.6, chin: 1 }, 1.02, 1], diamond: [{ cheek: 1.8, jaw: 0.88, chinW: 0.65, chin: 0.8 }, 0.97, 1.02], pear: [{ cheek: -0.9, jaw: 1.18, chinW: 1.55, square: 0.9 }, 1.05, 0.98] };
    const pool = m.shape ? [m.shape] : child ? ['round', 'round', 'oval', 'heart'] : kind === 'goblin' ? ['pear', 'diamond', 'long', 'square'] : sp.big ? ['square', 'pear', 'square'] : fem ? ['oval', 'heart', 'round', 'long', 'diamond', 'oval'] : ['square', 'oval', 'long', 'round', 'pear', 'diamond', 'square'];
    const shp = SHAPES[pool[Math.floor(r() * pool.length)]], jit = k => k * (0.85 + r() * 0.3), hsV = {}; for (const k in shp[0]) hsV[k] = k === 'jaw' ? 1 + (shp[0][k] - 1) * (0.8 + r() * 0.4) : jit(shp[0][k]);
    return { spec: sp, foe: !!m.foe, kind, sex, child, skin, hair, age: child ? 0 : age, glow: sp.eyes || m.glow || null, eye: sp.eyes || m.eye || eyes[Math.floor(r() * eyes.length)],
      brow: kind === 'skel' ? null : sp.bald && !sp.hair ? sh(skin, -40) : sh(grey ? mix(hair, '#8a8070', 0.3) : hair, grey ? -10 : -22), browW: fem ? 0.75 : kind === 'goblin' ? 1.5 : 1.3,
      lip: fem ? mix(sh(skin, -18), '#c05a5a', 0.45) : mix(sh(skin, -22), '#a86050', 0.25), lipY: fem ? 1.22 : 0.9,
      jaw: fem ? 0.95 : sp.big ? 1.08 : 1.02, mouth: moods[Math.floor(r() * moods.length)],
      eyeS: (child ? 1.14 : fem ? 1.03 : 0.95) * (kind === 'goblin' ? 1.05 : 1), nose: kind === 'goblin' ? [1.35, 1.25] : child ? [0.84, 0.84] : fem ? [0.92, 0.96] : [1.06 + r() * 0.12, 1.02 + r() * 0.1], mouthS: kind === 'goblin' ? 1.2 : fem ? 0.96 : 1.02,
      noEar: !!sp.hood || !!sp.helm, stubble: !fem && !child && !sp.beard && kind === 'human' && r() < 0.35 ? sh(hair, -10) : null, freckles: !!m.freckles || (child && r() < 0.5),
      hs: hsV, eyeGap: -0.6 + r() * 1.5, eyeDy: -0.5 + r() * 1, mouthDy: (hsV.chin || 0) * 0.3 - 0.3 + r() * 0.9, fw: ((fem ? 0.95 + r() * 0.05 : 0.98 + r() * 0.07) + (sp.big ? 0.04 : 0) - (child ? 0.02 : 0)) * shp[1], fh: (0.97 + r() * 0.06) * shp[2], scar: 0, sclera: kind === 'goblin' ? '#e4d890' : kind === 'ghoul' ? '#d8d4b0' : null, nasal: !!m.nasal, shadowFace: !!m.shadow, beardCol: grey ? mix(hair, '#ffffff', 0.15) : null, bone: m.bone };
  };
  Bz.paint = function (c, S, id, o) {
    o = o || {}; const h0 = o.spec ? Bz.fromSpec(o.spec, id, o.meta) : HEROES[id], h = o.mood && o.mood !== 'usual' ? Bz.moodify(h0, o.mood) : h0, rec = [], T0 = c.getTransform().inverse(), R = (p, role, col) => { const q = new Path2D(); q.addPath(p, T0.multiply(c.getTransform())); rec.push({ p: q, role, col }); };
    let seed = 1; for (const ch of id) seed = (seed * 31 + ch.charCodeAt(0)) % 2147483000; const rr = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const P = fn => { const p = new Path2D(); fn(p); return p; };
    const fill = (p, st) => { c.fillStyle = st; c.fill(p); return p; };
    const clip = (p, fn) => { c.save(); c.clip(p); fn(); c.restore(); };
    const soft = (b, fn) => { c.save(); c.filter = 'blur(' + Math.max(0.01, b * S) + 'px)'; fn(); c.restore(); };
    const ell = (x, y, rx, ry, st, rot) => { c.fillStyle = st; c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, 6.283); c.fill(); };
    const line = (pts, w, st) => { c.strokeStyle = st; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke(); };
    const curve = (pts, w, st) => { c.strokeStyle = st; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length - 2; i += 2) { const mx = (pts[i] + pts[i + 2]) / 2, my = (pts[i + 1] + pts[i + 3]) / 2; c.quadraticCurveTo(pts[i], pts[i + 1], mx, my); } c.lineTo(pts[pts.length - 2], pts[pts.length - 1]); c.stroke(); };
    const lin = (x0, y0, x1, y1, st) => { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(([t, col]) => g.addColorStop(t, col)); return g; };
    const rad = (x, y, r0, r1, st, x1, y1) => { const g = c.createRadialGradient(x, y, r0, x1 == null ? x : x1, y1 == null ? y : y1, r1); st.forEach(([t, col]) => g.addColorStop(t, col)); return g; };
    const L = o.light === 'void' ? { key: 'rgba(235,245,255,', warm: 'rgba(255,214,180,', rim: '#7fd6ff', shadow: '#2a2040', amb: 0.1 } : { key: 'rgba(255,236,206,', warm: 'rgba(255,190,130,', rim: null, shadow: '#3a1e14', amb: 0 };
    const skin = h.skin, skD = sh(skin, -34), skDD = sh(skin, -62), skL = sh(skin, 26);
    const jw = h.jaw;
    const Dk = (HEROES[id] && !o.spec) ? makeDress()[id] : genericDress();
    // hair behind the head and shoulders, and the clothes, before the face
    Dk.back && Dk.back();
    // the neck
    if (h.kind === 'skel') { skull(); Dk.front(); return rec; }
    const neck = P(q => { q.moveTo(39, 58); q.quadraticCurveTo(40, 70, 33, 80); q.lineTo(30, 86); q.lineTo(70, 86); q.lineTo(66, 79); q.quadraticCurveTo(60, 72, 60.4, 62); q.closePath(); });
    fill(neck, lin(37, 0, 63, 0, [[0, sh(skin, 4)], [0.55, sh(skin, -16)], [1, skD]])); R(neck, 'neck', skin);
    clip(neck, () => { soft(2.2, () => ell(52, 64.5, 13, 4.2, al(skDD, 0.75))); soft(1, () => curve([42, 62, 44.5, 70, 49, 79], 1.4, al(skD, 0.45))); soft(1, () => curve([43, 63, 45, 70, 48.6, 78], 0.6, al(skL, 0.35))); soft(1.4, () => ell(50, 79.5, 2.4, 1.4, al(skD, 0.5))); if (L.rim) soft(1, () => curve([60.4, 63, 59.8, 72, 62.4, 82], 1, al(L.rim, 0.45))); });
    if (o.body !== false) Dk.body();
    c.save(); { const fw = h.fw || 1, fh = h.fh || 1; c.translate(50, 58); c.scale(fw, fh); c.translate(-50, -58); }
    // the head: cranium hidden by hair, the face, a jaw that turns to the chin
    const HS = h.hs || {}, ck = HS.cheek || 0, jW = (HS.jaw != null ? HS.jaw : 1) * jw, cY = 68 + (HS.chin || 0), cw = HS.chinW || 1, sq = HS.square || 0;
    const xJ = 58 + 6.4 * jW + ck * 0.3, yJ = 54 + (1 - jW) * 2 - (HS.chin || 0) * 0.2, fcX = 51.6 + 3.4 * cw, fcY = cY - 0.8 - sq * 1.1, ncX = 51.6 - 3.8 * cw, ncY = cY - 1 - sq * 1.1, xN = 36 + (1 - jW) * 7 - ck * 0.4, yN = 55 + (1 - jW) * 2;
    const head = P(q => { q.moveTo(34, 33); q.bezierCurveTo(34, 21, 44, 18.5, 52, 19.5); q.bezierCurveTo(60, 20.5, 65.5, 25, 65.2, 33); q.bezierCurveTo(65.4 + ck * 0.5, 36, 64.6 + ck, 38.5, 65.6 + ck, 41.5);
      q.bezierCurveTo(66.6 + ck, 45, 65.6 + ck * 0.6, 49, xJ, yJ); q.bezierCurveTo(xJ - 1.9 + sq * 1.4, yJ + 6.5 - sq * 1.6, fcX + 3.2 + sq * 1.4, fcY - 2.2 + sq * 1.4, fcX, fcY);
      q.bezierCurveTo(fcX - 1.6 + sq * 0.8, cY + 0.5, ncX + 1.6 - sq * 0.8, cY + 0.5, ncX, ncY); q.bezierCurveTo(ncX - 3.2 - sq * 1.4, ncY - 1.6 + sq * 1.2, xN + 2.4 + sq * 0.8, yN + 5 - sq * 1.4, xN, yN);
      q.bezierCurveTo(34.2 - ck * 0.6, 51, 33.4 - ck * 0.6, 44, 34, 33); q.closePath(); });
    fill(head, rad(45, 40, 2, 34, [[0, skL], [0.45, skin], [0.8, sh(skin, -14)], [1, skD]], 50, 44)); R(head, 'skin', skin);
    clip(head, () => {
      soft(4.4, () => ell(67.5, 46, 6.8, 24, al(skD, 0.7)));                          // the far side of the face turning away
      soft(2, () => curve([60.5, 27, 62, 38, 61.4, 47, 58.4, 60], 2.6, al(skD, 0.25)));
      soft(3, () => { ell(43.4, 40.4, 6.6, 3.8, al(skD, 0.42)); ell(58.8, 40.4, 4.8, 3.6, al(skD, 0.48)); });   // eye sockets
      soft(2.4, () => ell(44.5, 33.2, 8.5, 2.2, L.key + '0.4)'));                       // brow ridge in the light
      soft(3.2, () => ell(46, 26.5, 8, 4, L.key + '0.32)'));                            // forehead
      soft(2.4, () => ell(42.6, 47.6, 5.2, 3.4, L.key + '0.3)'));                       // cheekbone
      soft(4, () => ell(43, 52, 6, 4.2, 'rgba(225,95,80,.17)')); soft(3, () => ell(60.5, 52, 3.4, 3, 'rgba(225,95,80,.12)'));   // warmth in the cheeks
      soft(1.6, () => ell(53, 61.8, 4.4, 1.4, al(skDD, 0.45)));                         // under the lower lip
      soft(2, () => ell(51.6, 65.2, 4, 2, L.key + '0.32)'));                            // the chin
      soft(1.5, () => curve([63.4, 52, 61, 60, 55.4, 66.6], 1.4, L.warm + '0.18)'));    // light bounced back up the far jaw
      soft(2, () => ell(41, 61, 5, 3, al(skD, 0.2)));
      soft(2.6, () => fill(P(q => { q.moveTo(60.5, 20); q.bezierCurveTo(66, 26, 67, 40, 66.5, 50); q.bezierCurveTo(65, 60, 59, 66, 54.6, 68.4); q.bezierCurveTo(55.6, 64, 58.6, 58, 59.4, 52); q.bezierCurveTo(60.4, 46, 60, 40, 59.6, 34); q.bezierCurveTo(59.4, 28, 59.6, 24, 60.5, 20); q.closePath(); }), al(skDD, 0.42)));   // the terminator: the plane turning from the light
      soft(2, () => ell(41.2, 55, 4, 2.2, al(skD, 0.22)));                             // hollow under the cheekbone
      soft(1.6, () => ell(36.4, 33.6, 1.8, 5, al(skD, 0.28)));                          // the temple
      soft(0.7, () => curve([51.2, 53.4, 48.6, 55.6, 46.4, 58.8], 0.8, al(skD, 0.32))); soft(0.9, () => curve([50.6, 52.6, 47.6, 55, 45.4, 58.4], 0.8, L.key + '0.18)'));   // the fold from nose to mouth
      soft(3, () => ell(48, 26, 12, 6, 'rgba(240,200,120,.12)')); soft(3, () => ell(50, 50, 13, 5, 'rgba(220,80,70,.08)')); soft(3, () => ell(53, 63, 9, 5, 'rgba(80,110,150,' + (h.stubble ? 0.14 : 0.08) + ')'));   // gold brow, red middle, cool jaw
      soft(0.8, () => { ell(44, 27.4, 2.6, 1.3, L.key + '0.3)'); ell(41.6, 46.6, 2.2, 0.9, L.key + '0.3)'); ell(51.2, 64.6, 1.6, 0.8, L.key + '0.3)'); });   // the shine where skin faces the lamp
      soft(1.6, () => curve([59.6, 24, 60.4, 36, 59.6, 48, 56.4, 62], 1.4, 'rgba(220,90,70,.12)'));   // blood just inside the shadow's edge
      for (let i = 0; i < 70; i++) { const x = 35 + rr() * 30, y = 22 + rr() * 44; soft(0.8 + rr(), () => ell(x, y, 0.8 + rr() * 1.6, 0.6 + rr() * 1.2, rr() > 0.5 ? 'rgba(210,90,80,.05)' : 'rgba(230,200,140,.05)')); }
      if (L.rim) soft(1.1, () => curve([64.4, 27, 65.6, 36, 66.2, 44, 64.6, 53, 60.6, 62, 55, 67.4], 1.2, al(L.rim, 0.55)));
      if (h.age) { const a = h.age;                                                     // a long life, in the skin
        for (const [p, w] of [[[35.8, 39.4, 37.6, 41.4], 0.18], [[35.6, 41.4, 37.4, 42.4], 0.16], [[36.2, 37.4, 37.8, 39.6], 0.14], [[64, 39.4, 65, 41.2], 0.14], [[48.6, 49.6, 47.2, 53.6, 46.6, 58.4], 0.4], [[59.6, 50.4, 60.2, 55, 59.4, 59.8], 0.34], [[40, 26.6, 47, 25.6, 54, 26.2], 0.22], [[41, 29.4, 47.5, 28.6, 53.4, 29], 0.2], [[45, 64.8, 46.6, 66.4, 49.4, 67.4], 0.25]])
          soft(0.25, () => curve(p, w, al(skDD, 0.38 * a)));
        soft(0.8, () => { ell(43.2, 43.8, 3.6, 1, al(skD, 0.35 * a)); ell(58.6, 43.6, 2.6, 0.9, al(skD, 0.35 * a)); });
        for (let i = 0; i < 12; i++) soft(0.3, () => ell(38 + rr() * 22, 24 + rr() * 30, 0.4 + rr() * 0.4, 0.3 + rr() * 0.3, al(sh(skin, -30), 0.25)));
      }
      if (h.kind === 'ghoul') { soft(2.4, () => { ell(43.4, 41, 6, 4.4, al(skDD, 0.6)); ell(58.8, 41, 4.6, 4, al(skDD, 0.6)); ell(41.4, 54.6, 4.6, 3, al(skDD, 0.4)); ell(61, 54, 3, 3, al(skDD, 0.4)); }); for (let i = 0; i < 8; i++) soft(0.3, () => curve([38 + rr() * 24, 24 + rr() * 30, 40 + rr() * 22, 26 + rr() * 30, 42 + rr() * 20, 28 + rr() * 30], 0.16, al(skDD, 0.4))); }
      if (h.kind === 'goblin') { soft(2, () => { ell(43.4, 37.2, 7, 2.4, al(skDD, 0.4)); }); for (let i = 0; i < 9; i++) { const x = 38 + rr() * 24, y = 28 + rr() * 34; ell(x, y, 0.5 + rr() * 0.5, 0.45 + rr() * 0.4, al(sh(skin, -30), 0.7)); ell(x - 0.15, y - 0.15, 0.2, 0.18, al(skL, 0.6)); } }
      if (h.freckles) for (let i = 0; i < 90; i++) { const x = 38 + rr() * 26, y = 43 + rr() * 11 + Math.abs(x - 52) * 0.1; ell(x, y, 0.16 + rr() * 0.16, 0.13 + rr() * 0.12, al(sh(skin, -40), 0.25 + rr() * 0.3)); }
      if (h.stubble) { soft(1.2, () => { const sp = P(q => { q.moveTo(40, 55); q.quadraticCurveTo(45, 60, 50, 60.5); q.quadraticCurveTo(57, 60, 63.5, 52); q.lineTo(62, 60); q.quadraticCurveTo(57, 68, 51, 68.6); q.quadraticCurveTo(43, 66, 38, 59); q.closePath(); }); fill(sp, al(h.stubble, 0.28)); });
        for (let i = 0; i < 1400; i++) { const x = 38 + rr() * 26, y = 53 + rr() * 16; if (y < 59 && Math.abs(x - 52) < 4.4 && y > 55.5) continue; ell(x, y, 0.07, 0.07, al(h.stubble, 0.45)); } }
      for (let i = 0; i < 2600; i++) ell(33 + rr() * 34, 19 + rr() * 50, 0.06, 0.06, rr() > 0.5 ? 'rgba(255,240,230,.06)' : 'rgba(80,30,20,.06)');   // the grain of skin
    });
    // the near ear
    if (h.kind === 'goblin') gobEar(); else if (!h.noEar) {
    const ear = P(q => { q.moveTo(35.4, 38); q.bezierCurveTo(32, 35.6, 30.6, 39.4, 31.4, 43.6); q.bezierCurveTo(31.9, 47.6, 33.2, 50.6, 35.6, 50.2); q.closePath(); });
    soft(0.6, () => fill(ear, al(skD, 0.6))); fill(ear, rad(32.4, 41, 0.4, 6, [[0, sh(skin, 4)], [0.6, sh(skin, -14)], [1, skD]])); R(ear, 'skin', skin);
    clip(ear, () => { soft(0.5, () => curve([33.4, 37.4, 31.8, 39, 31.9, 43.6, 33, 48.6], 0.5, L.key + '0.35)')); soft(0.7, () => ell(34.2, 43.6, 1.3, 2.4, al(skDD, 0.5))); soft(0.6, () => curve([34.6, 39, 32.6, 39.6, 32.8, 44, 34.4, 47.2], 0.7, al(skDD, 0.45))); soft(0.8, () => ell(33, 41.5, 1.2, 2.6, 'rgba(230,100,90,.25)')); });
    }
    // the eyes
    const eye = (cx, cy, w, hh, near) => {
      const wh = P(q => { q.moveTo(cx - w, cy + 0.1); q.quadraticCurveTo(cx - w * 0.15, cy - hh * 1.3, cx + w, cy - 0.25); q.quadraticCurveTo(cx + w * 0.1, cy + hh * 1.1, cx - w, cy + 0.1); q.closePath(); });
      soft(0.35, () => curve([cx - w * 0.85, cy - hh * 0.95, cx - w * 0.1, cy - hh * 2.2, cx + w * 0.95, cy - hh * 1.15], 0.38, al(skDD, 0.5)));   // the lid's crease
      soft(0.5, () => curve([cx - w * 0.8, cy - hh * 1.4, cx, cy - hh * 2.05, cx + w * 0.9, cy - hh * 1.45], 0.9, L.key + '0.22)'));                 // the lit lid above it
      fill(wh, rad(cx - w * 0.2, cy - hh * 0.1, 0.2, w * 1.1, [[0, h.sclera || '#eee4dc'], [0.6, sh(h.sclera || '#eee4dc', -10)], [1, sh(h.sclera || '#eee4dc', -32)]])); R(wh, 'eye', '#f4eee8');
      clip(wh, () => {
        const ix = cx + w * (near ? 0.1 : 0.16), ir = hh * 1.08 / (h.eyeK || 1) * (h.eyeK > 1 ? 0.94 : 1); cy += (h.look || 0) * hh;
        ell(ix, cy - 0.05, ir, ir, rad(ix - ir * 0.2, cy + ir * 0.2, 0.05, ir, [[0, sh(h.eye, 55)], [0.4, sh(h.eye, 18)], [0.8, h.eye], [1, sh(h.eye, -65)]]));
        for (let i = 0; i < 46; i++) { const a = i / 46 * 6.283; line([ix + Math.cos(a) * ir * 0.42, cy + Math.sin(a) * ir * 0.42, ix + Math.cos(a) * ir * 0.93, cy + Math.sin(a) * ir * 0.93], 0.05, rr() > 0.5 ? al(sh(h.eye, 60), 0.45) : al(sh(h.eye, -50), 0.4)); }
        ell(ix, cy - 0.05, ir * 0.36, ir * 0.36, '#060408');
        if (h.glow) { soft(0.4, () => ell(ix, cy - 0.05, ir * 0.9, ir * 0.9, al(h.glow, 0.9))); ell(ix, cy - 0.05, ir * 0.3, ir * 0.3, '#ffffff'); }
        soft(0.25, () => { c.fillStyle = 'rgba(40,16,12,.55)'; c.fillRect(cx - w * 1.2, cy - hh * 1.6, w * 2.4, hh * 0.9); });
        soft(0.2, () => ell(cx - w * 0.9, cy + 0.1, 0.5, 0.45, 'rgba(210,120,110,.6)'));
      });
      if (h.glow) soft(1.6, () => ell(cx + w * 0.1, cy, w * 1.3, hh * 1.6, al(h.glow, 0.35)));
      ell(cx + w * 0.02, cy - hh * 0.38, hh * 0.3, hh * 0.26, 'rgba(255,255,255,.95)'); ell(cx + w * 0.3, cy + hh * 0.32, hh * 0.12, hh * 0.09, 'rgba(255,255,255,.55)');
      const lid = P(q => { q.moveTo(cx - w - 0.1, cy + 0.15); q.quadraticCurveTo(cx - w * 0.15, cy - hh * 1.45, cx + w + 0.25, cy - 0.3); q.quadraticCurveTo(cx - w * 0.1, cy - hh * 1.05, cx - w - 0.1, cy + 0.15); q.closePath(); });
      fill(lid, '#1c100c'); R(lid, 'feature', '#1c100c');
      for (let i = 0; i < 11; i++) { const t = 0.38 + i / 18, x = cx - w + 2 * w * t, y = cy - hh * 1.2 * Math.sin(t * Math.PI) * 0.95; c.strokeStyle = 'rgba(26,14,10,.7)'; c.lineWidth = 0.1; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 0.25, y - 0.5, x + 0.55 + t * 0.4, y - 0.62 - t * 0.15); c.stroke(); }
      soft(0.25, () => curve([cx - w * 0.9, cy - hh * 0.2, cx - w * 0.1, cy - hh * 1.4, cx + w, cy - hh * 0.3], 0.35, 'rgba(26,14,10,.55)'));
      soft(0.15, () => curve([cx - w * 0.7, cy + hh * 0.62, cx, cy + hh * 1.05, cx + w * 0.8, cy + hh * 0.5], 0.22, 'rgba(255,230,220,.6)'));
      soft(0.15, () => curve([cx - w * 0.6, cy + hh * 0.85, cx + w * 0.1, cy + hh * 1.3, cx + w * 0.85, cy + hh * 0.75], 0.12, al(skDD, 0.4)));
      R(wh, 'eyeline', null);
    };
    const es = h.eyeS, eg = h.eyeGap || 0, ey = h.eyeDy || 0, ek = h.eyeK || 1; eye(43.4 - eg, 40.8 + ey, 3.6 * es, 1.8 * es * ek, true); eye(58.7 + eg * 0.8, 40.6 + ey, 2.9 * es, 1.6 * es * ek, false);
    // the brows: a soft band, then hairs that rise at the inner end and lie down outward
    const brow = (pts, up) => { if (!h.brow) return; soft(0.5, () => curve(pts, 1.1 * (h.browW || 1), al(h.brow, 0.55))); const nb = Math.round(70 * (h.browW || 1)); for (let i = 0; i < nb; i++) { const t = i / nb, k = Math.min(pts.length / 2 - 2, Math.floor(t * (pts.length / 2 - 1))), f = t * (pts.length / 2 - 1) - k, x = pts[k * 2] + (pts[k * 2 + 2] - pts[k * 2]) * f, y = pts[k * 2 + 1] + (pts[k * 2 + 3] - pts[k * 2 + 1]) * f + (rr() - 0.5) * 0.7, a = (1 - t) * -1.1 + t * (up ? -0.2 : 0.3) - 0.1; line([x, y, x + Math.cos(a) * 1.1, y + Math.sin(a) * 1.1], 0.09, al(h.brow, 0.8)); } };
    const bt = h0.mouth === 'set' ? 0.9 : h0.mouth === 'grin' ? -0.4 : 0, bi = h.bi != null ? h.bi : bt * 0.5, bo = h.bo != null ? h.bo : -bt * 0.2, bgx = h.eyeGap || 0, bgy = h.eyeDy || 0;
    brow([39 - bgx, 37 + bo + bgy, 42.5 - bgx, 35.2 + (bi + bo) * 0.25 + bgy, 48 - bgx * 0.5, 35.8 + bi + bgy], false); brow([56 + bgx * 0.4, 35.8 + bi + bgy, 59.5 + bgx * 0.8, 35 + (bi + bo) * 0.25 + bgy, 62.8 + bgx * 0.8, 36.6 + bo + bgy], true);
    if (h.kind !== 'skel') clip(head, () => {
      if (h.furrow) soft(0.4, () => { curve([50.4, 33.4, 50.9, 35.6, 51, 37.8], 0.4, al(skDD, 0.5)); curve([53.4, 33.6, 53.1, 35.6, 52.9, 37.4], 0.35, al(skDD, 0.4)); curve([50.9, 33.4, 51.4, 35.6, 51.5, 37.8], 0.3, L.key + '0.25)'); });
      if (h.foreLines) for (let k = 0; k < 3; k++) soft(0.35, () => curve([41, 30.4 - k * 1.7, 47, 29 - k * 1.7, 53, 29.2 - k * 1.7, 59, 30.2 - k * 1.7], 0.28, al(skDD, 0.32 * h.foreLines)));
      if (h.cheekUp) { soft(1.6, () => { ell(42, 47, 4.4, 2.4, L.key + '0.3)'); ell(60, 46.6, 2.6, 2, L.key + '0.2)'); }); soft(0.4, () => { curve([40.6, 43.6, 43.4, 44.6, 46.4, 43.6], 0.3, al(skD, 0.5)); curve([56.6, 43.2, 58.6, 44, 60.6, 43.2], 0.26, al(skD, 0.45)); }); if (h.age) soft(0.3, () => { curve([37.2, 40, 36, 41.4], 0.2, al(skDD, 0.4)); curve([37.4, 41.6, 36.2, 43], 0.2, al(skDD, 0.4)); }); soft(0.8, () => curve([51.4, 53, 47.6, 55.6, 45.6, 58.6], 0.9, al(skD, 0.35))); }
      if (h.tearLine) soft(0.4, () => { curve([41, 43.4, 43.4, 44.4, 46.2, 43.4], 0.3, 'rgba(200,80,80,.35)'); ell(46.4, 42.6, 0.5, 0.35, 'rgba(255,255,255,.7)'); });
    });
    R(P(q => { q.moveTo(39, 37); q.quadraticCurveTo(42.5, 35.2, 48, 35.8); }), 'line', h.brow); R(P(q => { q.moveTo(56, 35.8); q.quadraticCurveTo(59.5, 35, 62.8, 36.6); }), 'line', h.brow);
    if (h.scar) { soft(0.15, () => line([61, 33.4, 60.2, 38], 0.36, 'rgba(236,190,176,.6)')); soft(0.1, () => line([61.1, 33.6, 60.3, 37.8], 0.1, 'rgba(120,50,40,.35)')); soft(0.15, () => line([59.6, 43.4, 59.1, 46], 0.3, 'rgba(236,190,176,.5)')); }
    // the nose
    c.save(); c.translate(54, 50); c.scale(h.nose[0], h.nose[1]); c.translate(-54, -50);
    soft(1.5, () => { const sd = P(q => { q.moveTo(52.6, 40.5); q.quadraticCurveTo(56.6, 46, 57, 50.6); q.quadraticCurveTo(56, 52.8, 54.6, 52.6); q.quadraticCurveTo(54.4, 47, 52.6, 40.5); q.closePath(); }); fill(sd, al(skD, 0.42)); });
    soft(0.9, () => line([51.2, 40, 53.4, 49.2], 1, L.key + '0.3)'));
    soft(0.5, () => ell(54.6, 50.6, 2.4, 2, rad(54, 49.8, 0.2, 2.4, [[0, sh(skin, 8)], [0.7, skin], [1, al(skin, 0)]])));
    soft(0.3, () => ell(53.9, 49.6, 0.5, 0.36, 'rgba(255,250,240,.5)'));
    soft(0.4, () => curve([50.8, 51.4, 50.5, 53.1, 52.6, 53.7], 0.4, al(skDD, 0.4)));
    soft(0.35, () => ell(56.2, 53, 0.95, 0.42, al(skDD, 0.6))); soft(0.35, () => ell(52.4, 53.5, 0.6, 0.3, al(skDD, 0.4)));
    soft(1.2, () => ell(56, 55, 3, 1.1, al(skDD, 0.45)));                                // the nose's shadow on the lip
    soft(1, () => ell(54.6, 51.6, 3, 1.4, 'rgba(220,100,90,.14)'));
    R(P(q => { q.moveTo(52.4, 40.6); q.quadraticCurveTo(56.6, 46, 57, 50.6); q.quadraticCurveTo(56, 52.8, 54.4, 52.8); }), 'line', skDD);
    R(P(q => { q.moveTo(50.6, 51.2); q.quadraticCurveTo(50.3, 53.2, 52.6, 53.8); }), 'line', skDD);
    c.restore();
    // the mouth
    c.save(); c.translate(52.5, 59 + (h.mouthDy || 0)); c.scale(h.mouthS, h.lipY || 1); c.translate(-52.5, -59);
    soft(0.5, () => { line([53, 54.4, 52.4, 56.6], 0.4, al(skD, 0.4)); line([54.6, 54.4, 54.2, 56.7], 0.4, al(skD, 0.3)); });
    const m = h.mouth, curl = m === 'smile' ? -0.9 : m === 'smirk' ? -0.7 : m === 'grin' ? -1.4 : m === 'frown' ? 0.9 : m === 'sad' ? 1.6 : m === 'worry' ? 0.7 : m === 'beam' ? -1.5 : m === 'scowl' ? 1.4 : 0, nearC = [46.4, 58.6 + (m === 'smirk' ? 0.2 : curl * 0.6)], farC = [58.6, 58 + curl];
    const lip = h.lip;
    if (m === 'grin') {
      const mo = P(q => { q.moveTo(nearC[0] - 0.4, nearC[1] - 0.3); q.quadraticCurveTo(52.5, 58.6, farC[0] + 0.4, farC[1] - 0.2); q.quadraticCurveTo(56.5, 62.8, 52.6, 62.6); q.quadraticCurveTo(48.4, 62.2, nearC[0] - 0.4, nearC[1] - 0.3); q.closePath(); });
      fill(mo, '#4a1c1a'); R(mo, 'feature', '#4a1c1a');
      clip(mo, () => { fill(P(q => { q.moveTo(46, 57); q.quadraticCurveTo(52.5, 59.4, 59, 57); q.lineTo(59, 60); q.quadraticCurveTo(52.5, 60.8, 46, 60); q.closePath(); }), lin(0, 58, 0, 60.6, [[0, '#fbf6ee'], [1, '#d8ccc0']])); for (const x of [49.4, 51.6, 53.8, 55.8]) line([x, 58.8, x + 0.1, 60.4], 0.1, 'rgba(150,120,110,.5)'); soft(0.4, () => ell(53, 62, 3.4, 1, '#b85a5a')); });
      const ul = P(q => { q.moveTo(nearC[0] - 0.5, nearC[1] - 0.4); q.quadraticCurveTo(50, 57, 52.2, 57.4); q.quadraticCurveTo(54.6, 57, farC[0] + 0.5, farC[1] - 0.3); q.quadraticCurveTo(52.6, 58.3, nearC[0] - 0.5, nearC[1] - 0.4); q.closePath(); }); fill(ul, sh(lip, -18));
      const ll = P(q => { q.moveTo(48.6, 62.3); q.quadraticCurveTo(52.6, 63.8, 56.2, 62.6); q.quadraticCurveTo(52.6, 62.9, 48.6, 62.3); q.closePath(); }); fill(ll, lip);
      soft(0.4, () => { curve([nearC[0] - 0.6, nearC[1] - 0.5, 45.2, 57, 45, 55.6], 0.35, al(skD, 0.6)); curve([farC[0] + 0.6, farC[1] - 0.4, 60, 55.6, 60.4, 54], 0.3, al(skD, 0.5)); });
      soft(0.8, () => { ell(44.6, 55.4, 1.6, 2.4, L.key + '0.25)'); });
    } else {
      const up = P(q => { q.moveTo(nearC[0], nearC[1]); q.quadraticCurveTo(49.6, 56.9, 51.6, 56.8); q.quadraticCurveTo(52.4, 57.3, 53.2, 57); q.quadraticCurveTo(55.4, 56.9, farC[0], farC[1]); q.quadraticCurveTo(52.6, 58.6, nearC[0], nearC[1]); q.closePath(); });
      fill(up, lin(0, 56.8, 0, 58.6, [[0, sh(lip, -8)], [1, sh(lip, -26)]])); R(up, 'lip', lip);
      const lo = P(q => { q.moveTo(nearC[0] + 0.3, nearC[1] + 0.05); q.quadraticCurveTo(52.6, 58.7, farC[0] - 0.3, farC[1] + 0.05); q.quadraticCurveTo(56.6, 61.3, 52.4, 61.2); q.quadraticCurveTo(48.4, 61, nearC[0] + 0.3, nearC[1] + 0.05); q.closePath(); });
      fill(lo, lin(0, 58.6, 0, 61.2, [[0, sh(lip, -6)], [0.5, lip], [1, sh(lip, -12)]])); R(lo, 'lip', lip);
      soft(0.35, () => ell(51.6, 59.6, 1.6, 0.42, 'rgba(255,240,235,.45)'));
      curve([nearC[0], nearC[1], 52.6, 58.55, farC[0], farC[1]], 0.3, '#5a2620');
      R(P(q => { q.moveTo(nearC[0], nearC[1]); q.quadraticCurveTo(52.6, 58.55, farC[0], farC[1]); }), 'line', '#5a2620');
      soft(0.4, () => { ell(nearC[0] - 0.3, nearC[1], 0.6, 0.5, al(skD, 0.6)); ell(farC[0] + 0.3, farC[1], 0.5, 0.45, al(skD, 0.55)); });
      if (curl < 0) soft(0.5, () => { curve([nearC[0] - 0.4, nearC[1] - 0.2, 45.4, 57, 45.4, 55.4], 0.35, al(skD, 0.4)); curve([farC[0] + 0.4, farC[1] - 0.2, 59.8, 56, 60, 54.4], 0.3, al(skD, 0.4)); });
    }
    c.restore();
    if (h.kind === 'goblin') for (const [x, y] of [[48, 60.6], [57, 60.2]]) { const t = P(q => { q.moveTo(x - 0.7, y + 0.6); q.quadraticCurveTo(x - 0.4, y - 2.4, x + 0.3, y - 3); q.quadraticCurveTo(x + 0.4, y - 1, x + 0.8, y + 0.6); q.closePath(); }); fill(t, lin(x, y - 3, x, y + 0.6, [[0, '#fffbe8'], [1, '#c8b890']])); R(t, 'feature', '#e8dcc0'); }
    if (h.woad) {                                                                       // Runa's band of woad, fingered on, run at the cheeks
      const band = P(q => { q.moveTo(33.6, 37.6); for (let x = 36; x <= 66; x += 2) q.lineTo(x, 37.2 - (x - 50) * 0.01 + (rr() - 0.5) * 0.8); q.lineTo(66.2, 43.4); for (let x = 64; x >= 34; x -= 2) q.lineTo(x, 43.6 + (rr() - 0.5) * 1); q.closePath(); });
      clip(head, () => { c.save(); c.globalCompositeOperation = 'multiply'; soft(0.5, () => fill(band, 'rgba(30,62,170,.42)')); for (let i = 0; i < 26; i++) { const y = 37.4 + rr() * 6; soft(0.4, () => line([33.6, y, 66, y + (rr() - 0.5) * 1.2], 0.5 + rr() * 0.6, 'rgba(20,50,160,.16)')); } for (const [x, l] of [[39.4, 5], [42, 3.4], [46, 4.2], [57.2, 4.6], [61, 3]]) soft(0.2, () => line([x, 43.6, x + 0.2, 43.6 + l], 0.75, 'rgba(40,74,170,.6)')); for (let i = 0; i < 180; i++) ell(34 + rr() * 32, 37 + rr() * 7, 0.15, 0.1, 'rgba(10,20,80,.3)'); c.restore(); });
      eye(43.4 - eg, 40.8 + ey, 3.6 * es, 1.8 * es * ek, true); eye(58.7 + eg * 0.8, 40.6 + ey, 2.9 * es, 1.6 * es * ek, false);
      R(band, 'paint', '#2a4aa8');
    }
    // the hair, hats and anything in front
    if (Dk.face) Dk.face();
    Dk.front();
    if (o.after) o.after(c, { P, fill, soft, ell, curve, line, clip, rad, lin, h });   // a last touch, in the face's own space (the DM's dark face)
    c.restore();
    return rec;

    /* ---------- a skull, for the dead ---------- */
    function skull() {
      const bone = h.bone || '#e2d6b8', bD = sh(bone, -40), bDD = sh(bone, -70);
      for (let i = 0; i < 5; i++) { const y = 66 + i * 4; ell(50.5, y, 4.4 - i * 0.2, 1.7, lin(46, 0, 55, 0, [[0, sh(bone, 6)], [1, bD]])); ell(50.5, y + 1.9, 2.6, 0.6, al(bDD, 0.6)); }
      if (o.body !== false) Dk.body2 && Dk.body2();
      const sk = P(q => { q.moveTo(34.4, 33); q.bezierCurveTo(34, 20, 44, 17, 51, 17.6); q.bezierCurveTo(59, 18, 66, 23, 65.8, 34); q.bezierCurveTo(65.6, 41, 64.6, 45, 63, 49); q.lineTo(61, 53); q.lineTo(60.4, 58); q.lineTo(45, 58.4); q.lineTo(41.6, 53); q.bezierCurveTo(36.6, 47, 34.6, 41, 34.4, 33); q.closePath(); });
      fill(sk, rad(44, 30, 2, 34, [[0, sh(bone, 16)], [0.5, bone], [1, bD]], 50, 40)); R(sk, 'skin', bone);
      const jaw = P(q => { q.moveTo(42.6, 55); q.bezierCurveTo(43, 62, 46, 67, 51.6, 67.6); q.bezierCurveTo(57, 67.4, 60.6, 63, 61.4, 55.6); q.lineTo(59.6, 60.6); q.lineTo(45, 61); q.closePath(); });
      fill(jaw, lin(42, 0, 62, 0, [[0, sh(bone, 4)], [1, bD]])); R(jaw, 'skin', bone);
      clip(sk, () => { soft(3, () => ell(66, 40, 6, 20, al(bDD, 0.6))); soft(1.4, () => ell(42, 50, 4, 2.4, al(bD, 0.4))); for (let i = 0; i < 300; i++) ell(34 + rr() * 32, 17 + rr() * 42, 0.15, 0.12, al(bDD, 0.15)); soft(0.2, () => { curve([47, 18, 48.4, 22, 47.2, 25, 48.6, 28], 0.2, al(bDD, 0.7)); curve([60, 24, 58, 27, 59.4, 30], 0.18, al(bDD, 0.6)); }); });
      const glow = h.glow || '#9fd8ff';
      for (const [x, y, rx, ry] of [[43.2, 40.6, 4.6, 4], [58.4, 40.4, 3.8, 3.8]]) { soft(0.6, () => ell(x, y, rx, ry, '#120c08')); ell(x, y + 0.2, rx * 0.86, ry * 0.86, '#0a0604'); R(P(q => q.ellipse(x, y, rx, ry, 0, 0, 6.283)), 'feature', '#0a0604'); if (h.eyesOn !== false) { soft(1.4, () => ell(x + 0.4, y + 0.4, rx * 0.6, ry * 0.6, al(glow, 0.5))); ell(x + 0.4, y + 0.4, 0.8, 0.8, '#ffffff'); } }
      const nz = P(q => { q.moveTo(52.6, 45); q.quadraticCurveTo(50.4, 50, 51.2, 52.8); q.lineTo(54.2, 51.8); q.lineTo(56.6, 52.8); q.quadraticCurveTo(57, 49, 54.2, 45); q.closePath(); }); fill(nz, '#140c08'); R(nz, 'feature', '#140c08');
      for (let i = 0; i < 8; i++) { const x = 45.8 + i * 1.75, tw = P(q => q.rect(x, 55.6 + Math.abs(i - 3.5) * 0.12, 1.5, 3.2)); fill(tw, lin(0, 55, 0, 59, [[0, '#f4ecd6'], [1, '#b8a888']])); line([x + 1.6, 55.8, x + 1.6, 58.8], 0.18, '#3a2a1a'); }
      line([45.4, 58.9, 60, 58.6], 0.4, '#2a1c10');
      for (let i = 0; i < 7; i++) { const x = 46.8 + i * 1.8, tw = P(q => q.rect(x, 59.2, 1.6, 2.4)); fill(tw, lin(0, 59, 0, 62, [[0, '#e8dcc0'], [1, '#a8987a']])); line([x + 1.7, 59.4, x + 1.7, 61.4], 0.16, '#3a2a1a'); }
      R(P(q => { q.moveTo(45.4, 58.9); q.lineTo(60, 58.6); }), 'line', '#2a1c10');
      if (Dk.face) Dk.face();
    }
    /* ---------- a goblin's ear, long and pointed ---------- */
    function gobEar() {
      const e = P(q => { q.moveTo(35.4, 36); q.bezierCurveTo(30, 34, 24, 28, 18.6, 25); q.bezierCurveTo(22, 32, 26, 42, 30, 47); q.bezierCurveTo(32, 49.6, 34.4, 50, 35.8, 48.6); q.closePath(); });
      fill(e, lin(18, 25, 36, 48, [[0, sh(skin, 10)], [0.6, skin], [1, skD]])); R(e, 'skin', skin);
      clip(e, () => { soft(0.8, () => curve([33.6, 38, 28, 34, 23, 30, 29, 42, 33.4, 46], 1.2, al(skDD, 0.5))); soft(1, () => ell(30, 38, 3, 4, 'rgba(230,110,90,.25)')); });
    }
    /* ---------- everyone else: hair, headwear and clothes read from their look ---------- */
    function genericDress() {
      const sp = h.spec || {}, hc = h.hair || '#5a3a22', big = sp.big ? 1 : 0, kid = h.child, sx = big ? 1.1 : kid ? 0.84 : 1;
      const hooded = !!sp.hood, helm = !!sp.helm, hat = !!sp.hat, capH = !!sp.cap, covered = hooded || helm || hat;
      const style = (sp.bald || h.kind === 'skel') ? 'bald' : (sp.hs || (sp.long ? 'long' : 'short'));
      const top = sp.top || '#6a5a4a', Lx = 50 - 52 * sx, Rx = 50 + 52 * sx;
      const hairDraw = (p, flow, len) => { soft(1.5, () => fill(p, al(hc, 0.55))); fill(p, lin(34, 14, 66, 44, [[0, sh(hc, 18)], [0.5, hc], [1, sh(hc, -36)]])); R(p, 'hair', hc); locks(p, 140, flow, hc, len || 9, 1.9); strands(p, 1800, flow, hc, 4, 0.15); };
      const flowBack = (x, y) => Math.atan2(19 - y, 44 - x) + (x > 50 ? 0.2 : 0) + Math.PI * (x < 44 ? 0 : 0);
      const flowDown = (x, y) => (x < 50 ? Math.PI - 0.55 + (y - 15) * 0.05 : 0.55 - (y - 15) * 0.05) + (y > 30 ? (x < 50 ? -0.9 : 0.9) : 0);
      const hoodPath = () => P(q => { q.ellipse(50.5, 42, 23.5, 30, 0, 0, 6.283); q.moveTo(51 + 17.6, 45); q.ellipse(51, 45, 17.6, 25.4, 0, 0, -6.283, true); });
      const capShort = () => P(q => { q.moveTo(33.8, 41); q.bezierCurveTo(31.8, 26, 38, 16, 50, 15.6); q.bezierCurveTo(61, 15.6, 67.6, 23, 66.4, 37); q.bezierCurveTo(65.2, 31, 62.6, 26.4, 57.6, 25.2); q.bezierCurveTo(53, 24.4, 47, 24.2, 42.4, 25.6); q.bezierCurveTo(38.6, 27, 36.4, 31, 35.8, 41); q.closePath(); });
      const capLong = () => P(q => { q.moveTo(33.2, 54); q.bezierCurveTo(30.4, 34, 36, 15.6, 50, 15.2); q.bezierCurveTo(62, 15.4, 68.6, 24, 67.6, 42); q.bezierCurveTo(67.4, 47, 67, 51, 66.4, 55); q.bezierCurveTo(65.6, 47, 65.4, 40, 64.4, 33); q.bezierCurveTo(62.6, 27.4, 57, 24, 51.4, 23.4); q.bezierCurveTo(46, 23.8, 39.6, 26.4, 37.2, 32); q.bezierCurveTo(35.6, 38, 35.8, 46, 35.8, 54); q.closePath(); });
      const capBack = () => P(q => { q.moveTo(34.2, 42); q.bezierCurveTo(31.6, 28, 36, 17.6, 50, 16.6); q.bezierCurveTo(61, 16.6, 66.8, 23, 66, 34); q.bezierCurveTo(64, 28.6, 60.4, 24.2, 54, 23.4); q.bezierCurveTo(47, 22.6, 39.6, 25, 36.6, 31); q.bezierCurveTo(35.4, 34.6, 35.4, 38.6, 35.8, 42); q.closePath(); });
      function mantle(col, kind) {
        const m = P(q => { q.moveTo(Lx - 4, 100); q.lineTo(Lx - 4, 84); q.bezierCurveTo(Lx + 8, 74, 26, 70.6, 36, 73); q.bezierCurveTo(41, 78, 45.6, 81.6, 50, 82.6); q.bezierCurveTo(54.4, 81.6, 59, 78, 64, 73); q.bezierCurveTo(74, 70.6, Rx - 8, 74, Rx + 4, 84); q.lineTo(Rx + 4, 100); q.lineTo(70, 100); q.bezierCurveTo(64, 92, 60, 88, 50, 88.4); q.bezierCurveTo(40, 88, 36, 92, 30, 100); q.closePath(); });
        if (kind === 'fur') { fill(m, lin(0, 70, 0, 100, [[0, sh(col, 18)], [0.6, col], [1, sh(col, -30)]])); R(m, 'cloth', col); clip(m, () => { soft(3, () => ell(80, 92, 18, 10, 'rgba(40,24,10,.3)')); soft(2, () => ell(22, 80, 12, 5, 'rgba(255,255,255,.25)')); }); fur(m, 2400, col); }
        else { cloth(m, col, 0, 100); R(m, 'cloth', col); weave(m, 0.07); clip(m, () => { soft(1.6, () => { curve([14, 78, 19, 88, 21, 100], 1.6, 'rgba(0,0,0,.3)'); curve([86, 78, 81, 88, 79, 100], 1.6, 'rgba(0,0,0,.3)'); }); soft(2, () => ell(22, 76, 12, 3, 'rgba(255,255,255,.22)')); }); if (sp.trim) curve([36, 73.4, 43.6, 80.6, 50, 83.2, 56.4, 80.6, 64, 73.4], 0.7, sp.trim); }
        return m;
      }
      function held() {
        const it = sp.held, gem = sp.gem;
        if (it === 'staff' || it === 'spear' || it === 'pitchfork' || it === 'rod') {
          const x = 13, topY = it === 'rod' ? 30 : 44; const pole = P(q => { q.moveTo(x - 1.1, 100); q.lineTo(x - 0.8, topY); q.lineTo(x + 0.8, topY); q.lineTo(x + 1.1, 100); q.closePath(); }); fill(pole, lin(x - 1, 0, x + 1, 0, [[0, '#b0844a'], [1, '#4a2e14']])); R(pole, 'trim', '#8a5a2a');
          if (it === 'staff') { if (gem) { soft(3, () => ell(x, topY - 2, 5, 5, al(gem, 0.45))); ell(x, topY - 2, 2.2, 2.2, rad(x - 0.6, topY - 2.6, 0.2, 2.3, [[0, '#ffffff'], [0.35, gem], [1, sh(gem, -50)]])); } else ell(x, topY - 1, 1.8, 1.8, '#6a4220'); }
          if (it === 'spear') { const bl = P(q => { q.moveTo(x, topY - 10); q.quadraticCurveTo(x + 2.4, topY - 4, x, topY); q.quadraticCurveTo(x - 2.4, topY - 4, x, topY - 10); q.closePath(); }); fill(bl, lin(x - 2, 0, x + 2, 0, [[0, '#f0f2f8'], [1, '#6a6e7a']])); R(bl, 'trim', '#a8acb8'); }
          if (it === 'pitchfork') for (const dx of [-2, 0, 2]) line([x + dx, topY, x + dx, topY - 7], 0.5, '#8a8c94');
        } else if (it === 'lantern') {
          const x = 15, y = 84; soft(5, () => ell(x, y, 12, 12, al(gem || '#ffd070', 0.4))); c.fillStyle = '#2e2418'; c.fillRect(x - 6, y - 10, 12, 1.8); c.fillRect(x - 6, y + 8, 12, 2.2);
          fill(P(q => { q.moveTo(x - 4.5, y - 10); q.lineTo(x, y - 15); q.lineTo(x + 4.5, y - 10); q.closePath(); }), '#2e2418'); c.strokeStyle = '#2e2418'; c.lineWidth = 0.7; c.beginPath(); c.arc(x, y - 16.4, 2.2, Math.PI, 0); c.stroke();
          ell(x, y, 5, 8, rad(x, y, 0, 8, [[0, '#fffbe0'], [0.4, gem || '#ffd070'], [1, sh(gem || '#ffd070', -40)]])); c.fillStyle = '#2e2418'; for (const dx of [-5.4, -0.5, 4.4]) c.fillRect(x + dx, y - 8.2, 1, 16.4);
        } else if (it === 'lute') {
          const lute = P(q => { q.moveTo(13, 100); q.lineTo(9, 58); q.lineTo(13, 57); q.lineTo(18, 100); q.closePath(); }); fill(lute, lin(9, 0, 18, 0, [[0, '#c88a44'], [1, '#6a3a18']])); for (let y = 62; y < 98; y += 4) line([10, y, 14.6, y - 0.4], 0.22, '#f0e0b0');
          fill(P(q => { q.moveTo(7, 52); q.lineTo(14, 50); q.lineTo(15, 58); q.lineTo(8.6, 59); q.closePath(); }), '#5a3218');
        } else if (it === 'axe' || it === 'hammer' || it === 'mace' || it === 'club' || it === 'sword' || it === 'spade') {
          const x0 = 76, y0 = 100, x1 = 88, y1 = 58; const haft = P(q => { q.moveTo(x0 - 1, y0); q.lineTo(x1 - 0.8, y1); q.lineTo(x1 + 0.8, y1); q.lineTo(x0 + 1, y0); q.closePath(); });
          fill(haft, it === 'sword' ? lin(x0, 0, x0 + 2, 0, [[0, '#f4f6fa'], [1, '#7a7e8a']]) : lin(x0, 0, x0 + 2, 0, [[0, '#a87a44'], [1, '#4a2e14']])); R(haft, 'trim', '#8a5a2a');
          if (it === 'axe') { const hd = P(q => { q.moveTo(x1 - 1, y1 + 2); q.quadraticCurveTo(x1 + 7, y1 - 4, x1 + 6, y1 + 6); q.quadraticCurveTo(x1 + 3, y1 + 5, x1 - 0.4, y1 + 6); q.closePath(); }); fill(hd, lin(x1, 0, x1 + 7, 0, [[0, '#8a8e98'], [0.7, '#e8ecf4'], [1, '#f8faff']])); R(hd, 'trim', '#a8acb8'); }
          if (it === 'hammer' || it === 'mace' || it === 'club') { ell(x1, y1, it === 'club' ? 2.6 : 3, it === 'club' ? 4 : 2.4, lin(x1 - 3, 0, x1 + 3, 0, [[0, it === 'club' ? '#a87a44' : '#e0e4ec'], [1, it === 'club' ? '#4a2e14' : '#5a5e68']])); }
          if (it === 'sword') { line([x1 - 4, y1 + 4.4, x1 + 4, y1 + 1.6], 1, '#c8a050'); ell(x1 + 0.6, y1 - 2.6, 1.2, 1.2, '#c8a050'); }
        } else if (it === 'bow') { c.strokeStyle = '#6a4220'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(80, 100); c.quadraticCurveTo(96, 74, 84, 46); c.stroke(); line([84, 46, 80, 100], 0.15, '#e8e0c8'); }
        else if (it === 'book' || it === 'scroll') { const bk = P(q => { q.moveTo(8, 100); q.lineTo(10, 88); q.lineTo(24, 90); q.lineTo(23, 100); q.closePath(); }); fill(bk, lin(8, 0, 24, 0, [[0, it === 'scroll' ? '#f0e4c4' : '#7a3a2a'], [1, it === 'scroll' ? '#b8a478' : '#3a1a12']])); R(bk, 'trim', '#6a3020'); if (it === 'book') line([10.6, 89.4, 23.4, 91.2], 0.5, '#e8d8b0'); }
      }
      return {
        back() {
          if (hooded) fill(P(q => q.ellipse(50.5, 42, 23.5, 30, 0, 0, 6.283)), rad(54, 44, 4, 30, [[0, '#08080a'], [1, sh(sp.hood, -60)]]));
          else if (!helm && (style === 'long' || (style === 'braids' && sp.long))) { const b = P(q => { q.moveTo(31, 30); q.bezierCurveTo(31, 14, 69, 14, 69, 30); q.bezierCurveTo(71, 50, 73, 70, 72, 86); q.lineTo(28, 86); q.bezierCurveTo(27, 70, 29, 50, 31, 30); q.closePath(); }); fill(b, lin(28, 0, 72, 0, [[0, sh(hc, -14)], [0.5, sh(hc, -34)], [1, sh(hc, -52)]])); R(b, 'hair', hc); locks(b, 200, x => 1.57 + (x - 50) * 0.01, sh(hc, -10), 12, 2.2); strands(b, 1600, x => 1.57 + (x - 50) * 0.01, hc, 6, 0.16); }
          else if (style === 'pony' && !hooded) { const b = P(q => { q.moveTo(62, 24); q.bezierCurveTo(74, 26, 75, 46, 72, 70); q.bezierCurveTo(70, 74, 67, 74, 66, 70); q.bezierCurveTo(68, 50, 66, 34, 60, 28); q.closePath(); }); fill(b, lin(60, 0, 75, 0, [[0, sh(hc, -10)], [1, sh(hc, -48)]])); R(b, 'hair', hc); locks(b, 80, () => 1.4, hc, 10, 1.6); strands(b, 600, () => 1.45, hc, 5, 0.14); }
          if (h.kind === 'goblin') { const e = P(q => { q.moveTo(64.6, 36); q.bezierCurveTo(70, 33, 76, 28, 80.6, 25.4); q.bezierCurveTo(78, 33, 74, 42, 66, 47); q.closePath(); }); fill(e, lin(64, 0, 80, 0, [[0, sh(h.skin, -30)], [1, sh(h.skin, -6)]])); R(e, 'skin', h.skin); }
          if (style === 'bun' && !covered) { const bun = P(q => q.ellipse(41, 18.4, 7.4, 6.6, -0.3, 0, 6.283)); fill(bun, rad(39, 16.6, 0.5, 8, [[0, sh(hc, 20)], [0.6, hc], [1, sh(hc, -36)]])); R(bun, 'hair', hc); locks(bun, 60, (x, y) => Math.atan2(y - 18.4, x - 41) + 1.3, hc, 6, 1.4); strands(bun, 500, (x, y) => Math.atan2(y - 18.4, x - 41) + 1.57, hc, 3, 0.14); }
          if (sp.held === 'bow' || sp.held === 'spear' && false) held();
        },
        body() {
          const t = P(q => { q.moveTo(Lx - 2, 100); q.lineTo(Lx - 2, 87); q.bezierCurveTo(Lx + 10, 77, 26, 74, 35.6, 75.6);
            if (sp.robe || h.kind === 'skel') { q.bezierCurveTo(41, 73.6, 59, 73.6, 64.4, 75.6); } else { q.quadraticCurveTo(43, 86, 50, 86.8); q.quadraticCurveTo(57, 86, 64.4, 75.6); }
            q.bezierCurveTo(74, 74, Rx - 10, 77, Rx + 2, 87); q.lineTo(Rx + 2, 100); q.closePath(); });
          const mail = helm && !sp.robe;
          if (mail) { fill(t, lin(0, 74, 0, 100, [[0, '#b8bcc8'], [1, '#4a4e5a']])); clip(t, () => { for (let y = 72; y < 100; y += 1.1) for (let x = (y * 7) % 1.4; x < 100; x += 1.4) { c.strokeStyle = 'rgba(30,32,40,.55)'; c.lineWidth = 0.16; c.beginPath(); c.arc(x, y, 0.55, 0, 6.283); c.stroke(); } soft(2, () => ell(24, 80, 14, 5, 'rgba(255,255,255,.28)')); soft(3, () => ell(84, 94, 16, 9, 'rgba(0,0,0,.35)')); }); R(t, 'cloth', '#8a8e98');
            const sur = P(q => { q.moveTo(30, 100); q.lineTo(33, 84); q.quadraticCurveTo(50, 90, 67, 84); q.lineTo(70, 100); q.closePath(); }); cloth(sur, top, 30, 70); R(sur, 'cloth', top); weave(sur, 0.08); if (sp.trim) { curve([33, 84, 50, 90, 67, 84], 0.8, sp.trim); } }
          else { cloth(t, top, 0, 100); R(t, 'cloth', top); weave(t, 0.07); clip(t, () => { soft(2, () => ell(24, 82, 14, 4, 'rgba(255,240,230,.22)')); soft(3, () => ell(84, 95, 16, 8, 'rgba(0,0,0,.3)')); soft(1.2, () => { curve([30, 84, 33, 92, 32, 100], 1.2, 'rgba(0,0,0,.25)'); curve([70, 84, 67, 92, 68, 100], 1.2, 'rgba(0,0,0,.25)'); }); });
            if (sp.stripe) clip(t, () => { for (let y = 79; y < 100; y += 3.4) { c.fillStyle = al(sp.stripe, 0.85); c.fillRect(0, y, 100, 1.5); } });
            if (sp.robe) { curve([35.6, 75.6, 41, 73.6, 50, 73.2, 59, 73.6, 64.4, 75.6], 1.4, sp.trim || sh(top, 20)); line([50, 74, 50, 100], 0.6, al(sh(top, -40), 0.6)); }
            else if (sp.trim) curve([35.6, 75.6, 43, 86, 50, 86.8, 57, 86, 64.4, 75.6], 0.8, sp.trim);
            if (!sp.robe) { const sh2 = P(q => { q.moveTo(38, 77.4); q.quadraticCurveTo(44, 84.6, 50, 85.4); q.quadraticCurveTo(56, 84.6, 62, 77.4); q.lineTo(64, 76); q.quadraticCurveTo(57, 86, 50, 86.8); q.quadraticCurveTo(43, 86, 36, 76); q.closePath(); }); fill(sh2, sh(sp.sleeves || '#e8e0cc', -6)); } }
          if (sp.apron) { const ap = P(q => { q.moveTo(40, 100); q.lineTo(41, 85); q.lineTo(59, 85); q.lineTo(60, 100); q.closePath(); }); cloth(ap, sp.apron, 40, 60); R(ap, 'cloth', sp.apron); line([41.2, 85.2, 36.4, 75.6], 0.9, sh(sp.apron, -14)); line([58.8, 85.2, 63.6, 75.6], 0.9, sh(sp.apron, -22)); }
          if (sp.fur) mantle(sp.fur, 'fur'); else if (sp.cape && !hooded) mantle(sp.cape, 'cloth'); else if (sp.cape && hooded) mantle(sp.cape, 'cloth');
          if (sp.cape || sp.fur) { if (sp.trim || sp.cape) { ell(50, 84.4, 1.8, 1.8, rad(49.4, 83.8, 0.2, 2, [[0, '#fff4c0'], [0.4, '#d8a840'], [1, '#6a4a10']])); } }
          if (sp.scarf) { const scf = P(q => { q.moveTo(37, 68); q.bezierCurveTo(44, 72, 56, 72, 63, 67); q.bezierCurveTo(65, 72, 64, 78, 62, 81); q.bezierCurveTo(55, 84, 45, 84, 37.6, 81); q.bezierCurveTo(36, 77, 35.6, 72, 37, 68); q.closePath(); }); cloth(scf, sp.scarf, 36, 64); R(scf, 'cloth', sp.scarf); clip(scf, () => soft(0.8, () => { curve([37, 73, 50, 76.4, 63, 72], 0.9, 'rgba(0,0,0,.35)'); curve([37.4, 77.6, 50, 80.6, 62.6, 77], 0.8, 'rgba(0,0,0,.3)'); })); weave(scf, 0.1); }
          held();
        },
        body2() { this.body(); },
        face() {
          // beards and moustaches, in their hair colour (grey with age)
          const bc = h.beardCol || hc, beardFlow = x => 1.57 + (x - 52) * 0.02;
          if (sp.beard) { const len = big ? 82 : 76; const bd = P(q => { q.moveTo(35, 44); q.bezierCurveTo(35.4, 52, 37, 58, 40, 62); q.bezierCurveTo(42, 70, 46, len, 51.6, len + 1); q.bezierCurveTo(58, len, 63, 68, 63.4, 60); q.bezierCurveTo(65.4, 54, 66, 48, 65.6, 42); q.bezierCurveTo(63.8, 47, 62.4, 52, 59.6, 56); q.bezierCurveTo(58, 61.6, 55.6, 62.8, 52.6, 62.6); q.bezierCurveTo(49.2, 62.8, 46.6, 61.4, 45.4, 57.6); q.bezierCurveTo(42, 55, 38.6, 50, 37, 44); q.closePath(); });
            soft(1.4, () => fill(bd, al(bc, 0.5))); fill(bd, lin(36, 44, 64, len, [[0, sh(bc, 16)], [0.5, bc], [1, sh(bc, -40)]])); R(bd, 'hair', bc); locks(bd, 120, beardFlow, bc, 7, 1.6); strands(bd, 1600, beardFlow, bc, 3.4, 0.14); }
          if (sp.goatee) { const gt = P(q => { q.moveTo(48.6, 63); q.quadraticCurveTo(52.6, 64.4, 56.4, 62.8); q.quadraticCurveTo(56, 68, 52.4, 70.4); q.quadraticCurveTo(49, 68, 48.6, 63); q.closePath(); }); fill(gt, lin(0, 62, 0, 70, [[0, bc], [1, sh(bc, -30)]])); R(gt, 'hair', bc); strands(gt, 300, () => 1.57, bc, 2, 0.12); }
          if (sp.mus || sp.beard || sp.goatee) { const th = sp.mus ? 1 : 0.6, mu = P(q => { q.moveTo(44.6, 59.6 + th); q.bezierCurveTo(46, 56.6, 49, 55.6, 52.4, 56.4); q.bezierCurveTo(56, 55.4, 59.6, 56, 61, 58.6 + th); q.bezierCurveTo(58.4, 57.6, 55.6, 57.6, 52.6, 58.2); q.bezierCurveTo(49.6, 57.8, 47, 58, 44.6, 59.6 + th); q.closePath(); }); fill(mu, lin(0, 55, 0, 60, [[0, sh(bc, 10)], [1, sh(bc, -30)]])); R(mu, 'hair', bc); strands(mu, 260, x => x < 52.6 ? 2.4 : 0.7, bc, 1.6, 0.11); }
          if (sp.scar) { soft(0.15, () => line([39, 47, 44.6, 53.6], 0.5, 'rgba(236,190,176,.6)')); soft(0.1, () => line([39.1, 47.2, 44.5, 53.4], 0.14, 'rgba(110,40,30,.45)')); }
          if (sp.patch) { line([34, 30.4, 66, 46], 0.7, '#1a1410'); const pt = P(q => q.ellipse(58.6, 40.8, 3.6, 3, 0.1, 0, 6.283)); fill(pt, lin(55, 38, 62, 44, [[0, '#3a3028'], [1, '#0e0a08']])); R(pt, 'feature', '#1a1410'); }
          if (sp.glasses || sp.specs) { c.strokeStyle = '#3a2a1a'; c.lineWidth = 0.42; for (const [x, y, r] of [[43.4, 41, 3.9], [58.8, 40.8, 3.2]]) { c.beginPath(); c.ellipse(x, y, r, r * 0.86, 0, 0, 6.283); c.stroke(); soft(0.4, () => ell(x - r * 0.3, y - r * 0.3, r * 0.5, r * 0.28, 'rgba(255,255,255,.3)', -0.5)); } line([47.3, 40.6, 49.8, 40, 55.6, 40.4], 0.36, '#3a2a1a'); line([39.5, 40.4, 34.4, 39.4], 0.36, '#3a2a1a'); R(P(q => { q.ellipse(43.4, 41, 3.9, 3.35, 0, 0, 6.283); }), 'line', '#3a2a1a'); }
        },
        front() {
          // hair first, then whatever is worn on the head over it
          if (style !== 'bald' && !hooded) {
            if (style === 'long' || style === 'pony' && false) hairDraw(helm ? capShort() : capLong(), flowDown, 10);
            else if (style === 'bun' || style === 'pony') hairDraw(capBack(), (x, y) => Math.atan2(19 - y, 41 - x), 9);
            else if (style === 'braids') { hairDraw(capBack(), (x, y) => x < 50.6 ? Math.PI - 0.5 + (y - 15) * 0.05 : -0.5 + 0.9 * (y - 15) / 25 + 0.6, 9);
              for (const [x0, y0, x1, y1] of [[34.6, 44, 31, 86], [65.6, 44, 68, 84]]) { const rope = P(q => { q.moveTo(x0 - 2, y0); q.lineTo(x1 - 1.1, y1); q.lineTo(x1 + 1.1, y1); q.lineTo(x0 + 2, y0); q.closePath(); }); fill(rope, sh(hc, -55));
                for (let i = 0; i < 18; i++) { const t2 = i / 18, sd = i % 2 ? 1 : -1, w = 2.1 - t2 * 0.7, x = x0 + (x1 - x0) * t2 + sd * w * 0.28, y = y0 + (y1 - y0) * t2, a = sd * 0.8; const pl = P(q => q.ellipse(x, y, w * 0.55, 2.2, a, 0, 6.283)); soft(0.3, () => ell(x, y + 0.7, w * 0.6, 2.2, 'rgba(30,10,4,.45)', a)); fill(pl, lin(x - w, y - 1.6, x + w * 0.4, y + 1.6, [[0, sh(hc, 24)], [0.55, sh(hc, -6)], [1, sh(hc, -50)]])); R(pl, 'hair', hc); } } }
            else if (style === 'curly') { const cu = P(q => { for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI * 1.04 - 0.02, x = 50 + Math.cos(a) * 16.4, y = 31 + Math.sin(a) * 14.8; q.moveTo(x + 3.4, y); q.arc(x, y, 3.4, 0, 6.283); } q.moveTo(34, 40); q.ellipse(50, 30, 16, 12, 0, 0, 6.283); }); hairDraw(cu, (x, y) => Math.atan2(y - 30, x - 50) + 1.57, 4);
              for (let i = 0; i < 60; i++) { const x = 36 + rr() * 28, y = 16 + rr() * 16; c.strokeStyle = al(sh(hc, rr() > 0.5 ? 30 : -30), 0.5); c.lineWidth = 0.2; c.beginPath(); c.arc(x, y, 0.8 + rr() * 0.8, rr() * 6, rr() * 6 + 3.5); c.stroke(); } }
            else if (style === 'mohawk') { soft(1.6, () => fill(capShort(), al(hc, 0.25))); const mh = P(q => { q.moveTo(44.6, 26); q.lineTo(42, 10); q.lineTo(46, 13.4); q.lineTo(48, 7); q.lineTo(51, 12.4); q.lineTo(54, 6.6); q.lineTo(55.4, 13); q.lineTo(59, 10.6); q.lineTo(57, 26); q.quadraticCurveTo(51, 24, 44.6, 26); q.closePath(); }); hairDraw(mh, () => -1.57, 7); }
            else { hairDraw(capShort(), (x, y) => (x < 42 ? 1.4 : 0.3 + (y - 16) * 0.05) + (x > 60 ? 0.6 : 0), 8);
              if (style === 'spiky' || (!covered && h.sex !== 'f')) for (let i = 0; i < (style === 'spiky' ? 34 : 18); i++) { const x0 = 38 + rr() * 26, y0 = style === 'spiky' ? 17 + rr() * 6 : 21 + rr() * 3, up = style === 'spiky' && y0 < 20, len = style === 'spiky' ? 4 + rr() * 4 : 3 + rr() * 3, a = up ? -1.57 + (x0 - 51) * 0.06 : 1.4 + (x0 - 51) * 0.04 + (rr() - 0.5) * 0.4, wd = 1 + rr();
                const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len, nx = Math.cos(a + 1.57) * wd / 2, ny = Math.sin(a + 1.57) * wd / 2;
                const lk = P(q => { q.moveTo(x0 - nx, y0 - ny); q.quadraticCurveTo((x0 + x1) / 2 - nx * 0.7, (y0 + y1) / 2 - ny * 0.7, x1, y1); q.quadraticCurveTo((x0 + x1) / 2 + nx * 0.7, (y0 + y1) / 2 + ny * 0.7, x0 + nx, y0 + ny); q.closePath(); });
                fill(lk, lin(x0, y0, x1, y1, [[0, sh(hc, -20)], [1, sh(hc, rr() > 0.5 ? 20 : -6)]])); } }
            sheen([40, 20.4, 47, 18, 55, 18.4], 0.9);
          }
          if (style === 'bald' && h.age > 0.4 && sp.hair && !covered) for (const [x, y] of [[35.2, 38], [64.8, 37]]) { const fr = P(q => q.ellipse(x, y, 2.2, 6, x < 50 ? 0.15 : -0.15, 0, 6.283)); fill(fr, al(hc, 0.85)); strands(fr, 120, () => 1.3, hc, 2, 0.12); }
          if (hooded) { if (style !== 'bald') { const fr = P(q => { q.moveTo(34, 52); q.bezierCurveTo(33.6, 36, 38, 24, 47, 21.4); q.bezierCurveTo(42, 26, 38.4, 34, 37.4, 52); q.closePath(); q.moveTo(67, 50); q.bezierCurveTo(67.4, 36, 64, 25, 56, 21.4); q.bezierCurveTo(61, 27, 63.6, 36, 64.2, 50); q.closePath(); }); hairDraw(fr, (x) => x < 50 ? 1.75 : 1.4, 6); }
            const hd = hoodPath(), hcol = sp.hood; c.save(); c.fillStyle = rad(42, 30, 6, 34, [[0, sh(hcol, 22)], [0.6, hcol], [1, sh(hcol, -40)]]); c.fill(hd); c.clip(hd); soft(2, () => { c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 2.6; c.beginPath(); c.ellipse(51, 45, 18.4, 26.2, 0, 0, 6.283); c.stroke(); }); weave(P(q => q.rect(0, 0, 100, 100)), 0.07);
            soft(1, () => { c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 0.9; c.beginPath(); c.ellipse(50.5, 42, 23, 29.5, 0, 3.4, 5.2); c.stroke(); }); c.restore(); R(hd, 'cloth', hcol);
            if (sp.trim) { c.strokeStyle = al(sp.trim, 0.8); c.lineWidth = 0.6; c.beginPath(); c.ellipse(51, 45, 17.9, 25.9, 0, 3.0, 6.4); c.stroke(); }
            if (h.kind === 'skel' || h.shadowFace) clip(P(q => q.ellipse(51, 45, 17.6, 25.4, 0, 0, 6.283)), () => soft(4, () => { ell(51, 30, 22, 17, 'rgba(0,0,0,' + (h.shadowFace ? 0.86 : 0.6) + ')'); if (h.shadowFace) ell(51, 50, 20, 8, 'rgba(0,0,0,.45)'); }));
          }
          if (helm) { const hm = sp.helm, dome = P(q => { q.moveTo(32.4, 38); q.bezierCurveTo(30.6, 20, 40, 12.2, 50, 12); q.bezierCurveTo(60, 12, 69.4, 19, 67.8, 37); q.bezierCurveTo(60, 33.2, 42, 33.6, 32.4, 38); q.closePath(); });
            soft(1.2, () => ell(50, 36.6, 16, 2, 'rgba(0,0,0,.45)')); fill(dome, rad(42, 18, 1, 30, [[0, '#ffffff'], [0.15, sh(hm, 30)], [0.55, hm], [1, sh(hm, -55)]])); R(dome, 'hat', hm);
            const rim = P(q => { q.moveTo(32.2, 38); q.bezierCurveTo(42, 33.4, 60, 33, 67.9, 37); q.lineTo(67.8, 34.4); q.bezierCurveTo(60, 30.6, 42, 31, 32.3, 35.4); q.closePath(); }); fill(rim, lin(0, 31, 0, 38, [[0, sh(hm, 20)], [1, sh(hm, -40)]])); for (let i = 0; i < 9; i++) { const x = 34.4 + i * 4, y = 35.2 - Math.sin((i / 8) * Math.PI) * 2.6; ell(x, y, 0.5, 0.5, sh(hm, 40)); }
            soft(0.6, () => curve([40, 16, 44, 14.4, 50, 14], 0.9, 'rgba(255,255,255,.5)'));
            if (h.nasal) { const ns = P(q => { q.moveTo(50.2, 34); q.lineTo(53.2, 34); q.lineTo(52.8, 47); q.lineTo(50.8, 47.4); q.closePath(); }); fill(ns, lin(50, 0, 53.4, 0, [[0, sh(hm, 30)], [1, sh(hm, -40)]])); R(ns, 'hat', hm); }
            if (sp.horns) for (const sd of [-1, 1]) { const hx = 50 + sd * 15.6, hn = P(q => { q.moveTo(hx - sd * 0.4, 28); q.bezierCurveTo(hx + sd * 8, 26, hx + sd * 13, 18, hx + sd * 12, 7); q.bezierCurveTo(hx + sd * 10, 15, hx + sd * 6, 20, hx - sd * 0.4, 22); q.closePath(); }); fill(hn, lin(hx, 28, hx + sd * 12, 7, [[0, '#d8ccb0'], [0.6, '#f4ecd8'], [1, '#8a7a5a']])); R(hn, 'hat', '#e8dcc0'); for (let k = 1; k < 5; k++) { const t = k / 5; line([hx + sd * t * 9, 27 - t * 12, hx + sd * (t * 9 + 2.2), 23 - t * 13], 0.2, 'rgba(90,70,40,.5)'); } }
          }
          if (hat) { const hcol = sp.hat, bw = sp.brim ? 24 : 18; const brim = P(q => q.ellipse(51, 22.4, bw, sp.brim ? 5.4 : 4, -0.06, 0, 6.283)); soft(1.4, () => ell(52, 26.6, 15, 2.4, 'rgba(0,0,0,.45)')); clip(head, () => soft(2.4, () => ell(52, 25.4, 16, 3.4, 'rgba(20,10,10,.45)')));
            fill(brim, lin(51 - bw, 0, 51 + bw, 0, [[0, sh(hcol, 22)], [0.5, hcol], [1, sh(hcol, -40)]])); R(brim, 'hat', hcol);
            const crn = P(q => { q.moveTo(38, 23); q.bezierCurveTo(37.4, 11, 44, 7.6, 51, 7.6); q.bezierCurveTo(58.6, 7.8, 64.6, 11.4, 64.2, 21.6); q.bezierCurveTo(57, 24, 45, 24.4, 38, 23); q.closePath(); }); fill(crn, lin(37, 0, 65, 0, [[0, sh(hcol, 28)], [0.5, hcol], [1, sh(hcol, -46)]])); R(crn, 'hat', hcol); weave(crn, 0.05);
            const band = P(q => { q.moveTo(38, 19.4); q.bezierCurveTo(46, 21, 56, 20.6, 64.4, 18.2); q.lineTo(64.2, 21.6); q.bezierCurveTo(56, 24, 46, 24.2, 38, 23); q.closePath(); }); fill(band, lin(0, 18, 0, 24, [[0, sh(hcol, -30)], [1, sh(hcol, -60)]]));
            if (sp.feather) { const pl = P(q => { q.moveTo(40, 19); q.bezierCurveTo(34, 8, 24, 4, 16, 8); q.bezierCurveTo(24, 9, 30, 13, 34, 18); q.bezierCurveTo(28, 17, 22, 19, 18, 23); q.bezierCurveTo(26, 19, 33, 19.4, 40, 20.6); q.closePath(); }); fill(pl, lin(16, 6, 40, 20, [[0, sh(sp.feather, 30)], [1, sh(sp.feather, -30)]])); R(pl, 'hat', sp.feather); curve([40, 19.6, 31, 12, 16, 8.4], 0.25, sh(sp.feather, -40)); }
          }
          if (capH) { const cc = sp.cap, cr = P(q => { q.moveTo(33.6, 29); q.bezierCurveTo(33, 17, 42, 14.4, 51, 14.6); q.bezierCurveTo(60, 14.8, 68, 18, 67, 28.4); q.bezierCurveTo(58, 25.6, 44, 25.8, 33.6, 29); q.closePath(); }); fill(cr, lin(36, 0, 66, 0, [[0, sh(cc, 24)], [0.5, cc], [1, sh(cc, -44)]])); R(cr, 'hat', cc); weave(cr, 0.06);
            const pk = P(q => { q.moveTo(33, 29.4); q.bezierCurveTo(39, 26, 52, 25.4, 59, 27.2); q.bezierCurveTo(52, 31.6, 39, 32.6, 33, 29.4); q.closePath(); }); soft(1, () => ell(47, 32, 11, 1.8, 'rgba(0,0,0,.4)')); fill(pk, lin(0, 22, 0, 28, [[0, sh(cc, -10)], [1, sh(cc, -46)]])); R(pk, 'hat', cc); }
          if (sp.crown) { const cy = helm ? 17.6 : 22, gc = sp.crown, cw = P(q => { q.moveTo(36.4, cy + 4.6); q.lineTo(36, cy - 3); q.lineTo(39.4, cy + 0.6); q.lineTo(42.6, cy - 6.4); q.lineTo(46, cy); q.lineTo(50.2, cy - 8); q.lineTo(54.4, cy); q.lineTo(57.8, cy - 6.4); q.lineTo(61, cy + 0.6); q.lineTo(64.6, cy - 3); q.lineTo(64.4, cy + 4.6); q.bezierCurveTo(56, cy + 6.4, 45, cy + 6.4, 36.4, cy + 4.6); q.closePath(); });
            soft(0.8, () => ell(50.4, cy + 5.6, 14, 1.4, 'rgba(0,0,0,.4)')); fill(cw, lin(36, 0, 65, 0, [[0, '#fff2b0'], [0.35, gc], [0.75, sh(gc, -35)], [1, sh(gc, -60)]])); R(cw, 'hat', gc);
            for (const [x, col] of [[42.6, '#c02040'], [50.2, '#2a60d0'], [57.8, '#20a060']]) { ell(x, cy + 2.4, 1, 1.1, rad(x - 0.3, cy + 2, 0.1, 1.1, [[0, '#ffffff'], [0.4, col], [1, sh(col, -50)]])); } }
          if (sp.circlet) { const cl = sp.circlet; curve([35, 28.2, 42, 26.4, 50, 26, 58, 26.4, 65.6, 28.6], 0.7, sh(cl, -30)); curve([35, 27.8, 42, 26, 50, 25.6, 58, 26, 65.6, 28.2], 0.35, sh(cl, 30)); ell(49.6, 26.2, 1, 1.2, rad(49.3, 25.8, 0.1, 1.2, [[0, '#ffffff'], [0.4, cl], [1, sh(cl, -50)]])); R(P(q => { q.moveTo(35, 28); q.quadraticCurveTo(50, 24.8, 65.6, 28.4); }), 'line', cl); }
          if (sp.held === 'spear' || sp.held === 'staff') {} // already in front of the body
        }
      };
    }
    /* ---------- hair helpers ---------- */
    function strands(p, n, flow, col, len, w) {
      clip(p, () => { for (let i = 0; i < n; i++) { const x = 20 + rr() * 60, y = 8 + rr() * 80, a = flow(x, y) + (rr() - 0.5) * 0.25, l = (len || 4) * (0.5 + rr()), b = a + (rr() - 0.5) * 0.3;
        const t = rr(); c.strokeStyle = t > 0.6 ? al(sh(col, 34), 0.5) : t > 0.25 ? al(sh(col, -30), 0.45) : al(sh(col, 10), 0.4); c.lineWidth = w || 0.16; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * l / 2, y + Math.sin(a) * l / 2, x + Math.cos(b) * l, y + Math.sin(b) * l); c.stroke(); } });
    }
    function locks(p, n, flow, col, len, wid) {
      clip(p, () => { for (let i = 0; i < n; i++) { let x = 18 + rr() * 64, y = 4 + rr() * 80; const l = (len || 8) * (0.6 + rr() * 0.8), wd = (wid || 1.6) * (0.6 + rr() * 0.8), pts = [[x, y]];
        for (let k = 0; k < 6; k++) { const a = flow(x, y); x += Math.cos(a) * l / 6; y += Math.sin(a) * l / 6; pts.push([x, y]); }
        const q = new Path2D(), nrm = k => { const a = flow(pts[k][0], pts[k][1]) + 1.57; return [Math.cos(a), Math.sin(a)]; };
        q.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < pts.length; k++) { const f = Math.sin(k / (pts.length - 1) * Math.PI) * wd / 2, [nx, ny] = nrm(k); q.lineTo(pts[k][0] + nx * f, pts[k][1] + ny * f); }
        for (let k = pts.length - 1; k >= 1; k--) { const f = Math.sin(k / (pts.length - 1) * Math.PI) * wd / 2, [nx, ny] = nrm(k); q.lineTo(pts[k][0] - nx * f, pts[k][1] - ny * f); } q.closePath();
        const t = rr(); c.fillStyle = t > 0.65 ? al(sh(col, 22), 0.35) : t > 0.3 ? al(sh(col, -34), 0.35) : al(col, 0.3); c.fill(q); } });
    }
    function sheen(pts, w) { soft(w * 0.6, () => curve(pts, w, 'rgba(255,250,230,.28)')); }
    function fur(p, n, col) { clip(p, () => { for (let i = 0; i < n; i++) { const x = rr() * 100, y = 50 + rr() * 50, a = 1.3 + (rr() - 0.5) * 1, l = 1 + rr() * 2.2; line([x, y, x + Math.cos(a) * l, y + Math.sin(a) * l], 0.18, rr() > 0.5 ? al(sh(col, 30), 0.5) : al(sh(col, -35), 0.45)); } }); }
    function weave(p, a) { clip(p, () => { for (let x = -60; x < 160; x += 0.7) { line([x, 50, x + 50, 100], 0.08, 'rgba(255,250,235,' + (a || 0.06) + ')'); line([x + 50, 50, x, 100], 0.08, 'rgba(0,0,0,' + (a || 0.06) + ')'); } }); }
    function cloth(p, col, x0, x1) { return fill(p, lin(x0, 0, x1, 0, [[0, sh(col, 26)], [0.45, col], [0.85, sh(col, -28)], [1, sh(col, -46)]])); }

    /* ---------- each hero's hair and dress ---------- */
    function makeDress() { return {
      runa: {
        back() { const b = P(q => { q.moveTo(31, 30); q.bezierCurveTo(32, 14, 68, 14, 69, 30); q.lineTo(67, 56); q.lineTo(33, 58); q.closePath(); }); fill(b, sh(h.hair, -40)); },
        body() {
          const jer = P(q => { q.moveTo(36, 82); q.lineTo(64, 82); q.lineTo(70, 100); q.lineTo(30, 100); q.closePath(); }); cloth(jer, '#7a4e30', 30, 70); R(jer, 'cloth', '#7a4e30');
          for (let y = 84; y < 100; y += 2.2) { line([47.4, y, 52.6, y + 1.8], 0.35, '#e0c8a0'); line([52.6, y, 47.4, y + 1.8], 0.35, '#c8b088'); }
          const pelt = P(q => { q.moveTo(0, 100); q.lineTo(0, 84); q.bezierCurveTo(10, 74, 26, 71, 37, 76); q.bezierCurveTo(39, 82, 40, 88, 38, 100); q.closePath(); q.moveTo(100, 100); q.lineTo(100, 84); q.bezierCurveTo(90, 74, 74, 71, 63, 76); q.bezierCurveTo(61, 82, 60, 88, 62, 100); q.closePath(); });
          fill(pelt, lin(0, 70, 0, 100, [[0, '#fbf6ea'], [0.6, '#e6dcc6'], [1, '#b8aa90']])); R(pelt, 'cloth', '#ece2cc');
          clip(pelt, () => { soft(3, () => ell(80, 92, 18, 10, 'rgba(60,40,20,.3)')); soft(2, () => ell(20, 80, 12, 5, 'rgba(255,255,255,.35)')); }); fur(pelt, 2600, '#e6dcc6');
          for (let i = 0; i < 40; i++) { const x = 37.5 + (i % 2) * 0.5, y = 76 + i * 0.6; line([x, y, x + 1.4, y + 0.6], 0.2, 'rgba(255,250,240,.7)'); }
        },
        front() {
          const cap = P(q => { q.moveTo(33.2, 44); q.bezierCurveTo(31, 30, 34, 17, 50, 15.4); q.bezierCurveTo(63, 15.6, 68.4, 24, 66.8, 38); q.bezierCurveTo(65.8, 32, 64, 26, 58, 23); q.bezierCurveTo(55, 21.8, 52, 22, 50.6, 22.6); q.bezierCurveTo(47, 21.6, 41, 23.4, 37.6, 28); q.bezierCurveTo(35.4, 32, 35.2, 38, 35.6, 44); q.closePath(); });
          soft(1.5, () => fill(cap, al(h.hair, 0.55))); fill(cap, lin(34, 15, 64, 40, [[0, sh(h.hair, 12)], [0.5, h.hair], [1, sh(h.hair, -38)]])); R(cap, 'hair', h.hair);
          locks(cap, 160, (x, y) => x < 50.6 ? Math.PI - 0.5 + (y - 15) * 0.05 : -0.5 + 0.9 * (y - 15) / 25 + 0.6, h.hair, 9, 2);
          strands(cap, 2400, (x, y) => x < 50.6 ? Math.PI - 0.5 + (y - 15) * 0.05 : -0.5 + 0.9 * (y - 15) / 25 + 0.6, h.hair, 4, 0.16);
          sheen([38, 22, 44, 18, 50, 17.2], 1.2); sheen([53, 17.6, 59, 19, 63, 23], 0.9);
          for (const [x0, y0, x1, y1, d] of [[34.6, 44, 30, 94, 0], [65.6, 44, 69, 92, -14]]) {             // the braids, plaited, over the shoulders
            const rope = P(q => { q.moveTo(x0 - 2.2, y0); q.lineTo(x1 - 1.2, y1); q.lineTo(x1 + 1.2, y1); q.lineTo(x0 + 2.2, y0); q.closePath(); }); fill(rope, sh(h.hair, -55 + d));
            for (let i = 0; i < 22; i++) { const t = i / 22, sd = i % 2 ? 1 : -1, w = 2.3 - t * 0.8, x = x0 + (x1 - x0) * t + sd * w * 0.28, y = y0 + (y1 - y0) * t, a = sd * 0.8 + Math.atan2(y1 - y0, x1 - x0) - 1.57;
              const pl = P(q => q.ellipse(x, y, w * 0.55, 2.3, a, 0, 6.283));
              soft(0.3, () => ell(x, y + 0.7, w * 0.6, 2.3, 'rgba(30,10,4,.45)', a));
              fill(pl, lin(x - w, y - 1.6, x + w * 0.4, y + 1.6, [[0, sh(h.hair, 26 + d)], [0.55, sh(h.hair, -6 + d)], [1, sh(h.hair, -50 + d)]])); strands(pl, 40, () => a + 1.57, h.hair, 1.8, 0.1); R(pl, 'hair', h.hair); }
            ell(x1, y1 + 2.4, 1.4, 1.2, '#c8a050'); for (let k = 0; k < 5; k++) line([x1 - 1 + k * 0.5, y1 + 3.4, x1 - 1.2 + k * 0.6, y1 + 7], 0.4, sh(h.hair, k % 2 ? -20 : 8));
          }
        }
      },
      dask: {
        back() { const hood = P(q => { q.ellipse(50.5, 42, 23.5, 30, 0, 0, 6.283); }); fill(hood, rad(54, 44, 4, 30, [[0, '#08080a'], [1, '#18241c']])); },
        body() {
          const jer = P(q => { q.moveTo(34, 82); q.lineTo(66, 82); q.lineTo(74, 100); q.lineTo(26, 100); q.closePath(); }); cloth(jer, '#5a4434', 26, 74); R(jer, 'cloth', '#5a4434');
          line([40, 84, 62, 100], 1.6, '#3a2a20'); for (let i = 0; i < 4; i++) { const t = 0.15 + i * 0.22, x = 40 + 22 * t, y = 84 + 16 * t; line([x - 0.8, y - 2, x + 0.6, y + 1], 0.6, '#d0d4de'); }
          const cloak = P(q => { q.moveTo(0, 100); q.lineTo(0, 80); q.bezierCurveTo(10, 72, 24, 68, 32, 66); q.bezierCurveTo(34, 76, 36, 88, 34, 100); q.closePath(); q.moveTo(100, 100); q.lineTo(100, 80); q.bezierCurveTo(90, 72, 76, 68, 68, 66); q.bezierCurveTo(66, 76, 64, 88, 66, 100); q.closePath(); });
          cloth(cloak, '#3a7050', 0, 100); R(cloak, 'cloth', '#3a7050'); weave(cloak, 0.07); clip(cloak, () => { soft(1.6, () => { curve([18, 74, 16, 86, 15, 100], 2, 'rgba(0,0,0,.35)'); curve([82, 74, 84, 86, 86, 100], 2, 'rgba(0,0,0,.35)'); }); });
          const sc = P(q => { q.moveTo(37, 68); q.bezierCurveTo(44, 72, 56, 72, 63, 67); q.bezierCurveTo(65, 72, 64, 78, 62, 81); q.bezierCurveTo(55, 84, 45, 84, 37.6, 81); q.bezierCurveTo(36, 77, 35.6, 72, 37, 68); q.closePath(); });
          cloth(sc, '#c03a30', 36, 64); R(sc, 'cloth', '#c03a30'); clip(sc, () => { soft(0.8, () => { curve([37, 73, 50, 76.4, 63, 72], 0.9, 'rgba(0,0,0,.35)'); curve([37.4, 77.6, 50, 80.6, 62.6, 77], 0.8, 'rgba(0,0,0,.3)'); curve([38, 71.6, 50, 74.8, 62.6, 70.4], 0.5, 'rgba(255,220,210,.3)'); }); }); weave(sc, 0.1);
          const tail = P(q => { q.moveTo(58, 80); q.quadraticCurveTo(64, 88, 63, 100); q.lineTo(57, 100); q.quadraticCurveTo(58, 90, 54, 82); q.closePath(); }); cloth(tail, '#a83028', 54, 64); R(tail, 'cloth', '#a83028');
        },
        front() {
          const fr = P(q => { q.moveTo(35, 34); q.bezierCurveTo(34, 21, 44, 16, 52, 17); q.bezierCurveTo(60, 17.4, 66, 22, 66, 31); q.bezierCurveTo(60, 27, 44, 26, 35, 34); q.closePath(); });
          soft(1.2, () => fill(fr, 'rgba(26,18,14,.6)')); fill(fr, lin(0, 17, 0, 30, [[0, '#120c0a'], [1, '#2e2018']])); R(fr, 'hair', h.hair);
          locks(fr, 120, (x, y) => 1.5 + (x - 52) * 0.025, '#4a3428', 7, 1.8);
          for (let i = 0; i < 46; i++) { const x0 = 36 + rr() * 29, y0 = 23 + rr() * 4, len = 5 + rr() * 6 - Math.abs(x0 - 50) * 0.12, a = 1.57 + (x0 - 51) * 0.035 + (rr() - 0.5) * 0.3, wd = 1.1 + rr() * 1.2, k = rr();
            const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len, mx = (x0 + x1) / 2 + (rr() - 0.5) * 1.6, my = (y0 + y1) / 2, nx = Math.cos(a + 1.57) * wd / 2, ny = Math.sin(a + 1.57) * wd / 2;
            const lk = P(q => { q.moveTo(x0 - nx, y0 - ny); q.quadraticCurveTo(mx - nx * 0.8, my - ny * 0.8, x1, y1); q.quadraticCurveTo(mx + nx * 0.8, my + ny * 0.8, x0 + nx, y0 + ny); q.closePath(); });
            soft(0.4, () => { c.save(); c.translate(0.5, 0.8); fill(lk, 'rgba(60,30,20,.25)'); c.restore(); });
            fill(lk, lin(x0, y0, x1, y1, [[0, '#140e0a'], [0.6, k > 0.6 ? '#4e382a' : '#2a1c14'], [1, k > 0.6 ? '#6a4e3a' : '#3a281e']])); if (i % 6 === 0) R(lk, 'hair', h.hair); }
          sheen([42, 20.4, 50, 18.6, 58, 19.6], 0.8);
          const hood = P(q => { q.ellipse(50.5, 42, 23.5, 30, 0, 0, 6.283); q.moveTo(51 + 17.6, 45); q.ellipse(51, 45, 17.6, 25.4, 0, 0, -6.283, true); });
          c.save(); c.fillStyle = rad(42, 30, 6, 34, [[0, '#4e8a66'], [0.6, '#3a7050'], [1, '#1e3a2a']]); c.fill(hood, 'evenodd'); c.clip(hood, 'evenodd');
          soft(2, () => { c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 2.6; c.beginPath(); c.ellipse(51, 45, 18.4, 26.2, 0, 0, 6.283); c.stroke(); }); weave(P(q => q.rect(0, 0, 100, 100)), 0.07);
          soft(1, () => { c.strokeStyle = 'rgba(200,240,210,.35)'; c.lineWidth = 0.9; c.beginPath(); c.ellipse(50.5, 42, 23, 29.5, 0, 3.4, 5.2); c.stroke(); }); c.restore(); R(hood, 'cloth', '#3a7050');
        }
      },
      maren: {
        back() { const bun = P(q => q.ellipse(41, 19, 8, 7, -0.3, 0, 6.283)); fill(bun, rad(39, 17, 0.5, 8, [[0, '#ffffff'], [1, sh(h.hair, -30)]])); R(bun, 'hair', h.hair); strands(bun, 500, (x, y) => Math.atan2(y - 19, x - 41) + 1.57, h.hair, 3, 0.14); for (const [a, b] of [[-3, 1], [1, -2]]) { line([41 + a, 19 + b, 41 + a + 6, 19 + b - 4.5], 0.45, '#c89a46'); ell(41 + a + 6, 19 + b - 4.5, 0.7, 0.7, '#e8c060'); } },
        body() {
          const hab = P(q => { q.moveTo(35, 80); q.lineTo(65, 80); q.lineTo(70, 100); q.lineTo(30, 100); q.closePath(); }); cloth(hab, '#ece2c8', 30, 70); R(hab, 'cloth', '#ece2c8'); weave(hab, 0.06);
          const tab = P(q => { q.moveTo(44.6, 84); q.lineTo(55.4, 84); q.lineTo(56.4, 100); q.lineTo(43.6, 100); q.closePath(); }); cloth(tab, '#a83444', 43, 57); R(tab, 'cloth', '#a83444');
          line([44.8, 84.4, 43.9, 100], 0.6, '#e0b050'); line([55.2, 84.4, 56.1, 100], 0.6, '#e0b050'); ell(50, 93, 1.6, 2, '#e0b050'); ell(50, 93, 0.8, 1.1, '#fff0a0');
          const man = P(q => { q.moveTo(0, 100); q.lineTo(0, 82); q.bezierCurveTo(12, 72, 28, 70, 37, 73); q.bezierCurveTo(42, 78, 46, 82, 50, 83.4); q.bezierCurveTo(54, 82, 58, 78, 63, 73); q.bezierCurveTo(72, 70, 88, 72, 100, 82); q.lineTo(100, 100); q.lineTo(70, 100); q.bezierCurveTo(64, 90, 60, 86, 50, 86.4); q.bezierCurveTo(40, 86, 36, 90, 30, 100); q.closePath(); });
          cloth(man, '#3a62a8', 0, 100); R(man, 'cloth', '#3a62a8'); weave(man, 0.07);
          clip(man, () => { soft(1.6, () => { curve([12, 78, 18, 88, 20, 100], 1.6, 'rgba(0,0,0,.3)'); curve([88, 78, 82, 88, 80, 100], 1.6, 'rgba(0,0,0,.3)'); }); soft(2, () => ell(22, 76, 12, 3, 'rgba(255,255,255,.25)')); });
          curve([37, 73.4, 44, 80.6, 50, 83.2, 56, 80.6, 63, 73.4], 0.7, '#e0b050');
          ell(50, 85, 2.2, 2.2, rad(49.4, 84.4, 0.2, 2.3, [[0, '#ffffff'], [0.3, '#5a9ae8'], [1, '#0c2a60']])); c.strokeStyle = '#e0b050'; c.lineWidth = 0.5; c.beginPath(); c.arc(50, 85, 2.4, 0, 6.283); c.stroke();
        },
        front() {
          const cap = P(q => { q.moveTo(34.2, 42); q.bezierCurveTo(31.6, 28, 36, 17.6, 50, 16.6); q.bezierCurveTo(61, 16.6, 66.8, 23, 66, 34); q.bezierCurveTo(64, 28.6, 60.4, 24.2, 54, 23.4); q.bezierCurveTo(47, 22.6, 39.6, 25, 36.6, 31); q.bezierCurveTo(35.4, 34.6, 35.4, 38.6, 35.8, 42); q.closePath(); });
          soft(1.5, () => fill(cap, al(h.hair, 0.55))); fill(cap, lin(34, 16, 64, 36, [[0, '#ffffff'], [0.5, h.hair], [1, sh(h.hair, -32)]])); R(cap, 'hair', h.hair);
          locks(cap, 150, (x, y) => Math.atan2(19 - y, 41 - x), '#d8d2c6', 9, 1.8);
          strands(cap, 2200, (x, y) => Math.atan2(19 - y, 41 - x) + (rr() - 0.5) * 0.1, '#d8d2c6', 4.4, 0.15);
          for (let i = 0; i < 6; i++) soft(0.4, () => curve([37 + i * 4.6, 24 + i * 0.4, 36 + i * 3.6, 21, 40 + i * 1.6, 18.6], 0.5, 'rgba(160,150,140,.35)'));
          sheen([40, 20.4, 47, 18, 55, 18.4], 1);
        }
      },
      finch: {
        back() { const b = P(q => { q.moveTo(31, 28); q.bezierCurveTo(32, 14, 68, 14, 69, 28); q.bezierCurveTo(70, 42, 70.6, 54, 68.6, 61); q.quadraticCurveTo(67, 64.6, 64.4, 62.4); q.quadraticCurveTo(62, 65.4, 60, 62); q.lineTo(40, 63); q.quadraticCurveTo(37, 66, 34.6, 62.6); q.quadraticCurveTo(31.4, 64, 31, 60); q.bezierCurveTo(29.4, 50, 30, 40, 31, 28); q.closePath(); }); fill(b, lin(30, 0, 70, 0, [[0, sh(h.hair, -10)], [0.5, sh(h.hair, -30)], [1, sh(h.hair, -50)]])); locks(b, 160, (x) => 1.57 + (x - 50) * 0.006, sh(h.hair, -20), 10, 2); strands(b, 1400, () => 1.57, h.hair, 5, 0.16); },
        body() {
          const lute = P(q => { q.moveTo(13, 100); q.lineTo(9, 58); q.lineTo(13, 57); q.lineTo(18, 100); q.closePath(); }); fill(lute, lin(9, 0, 18, 0, [[0, '#c88a44'], [1, '#6a3a18']])); for (let y = 62; y < 98; y += 4) line([10, y, 14.6, y - 0.4], 0.22, '#f0e0b0');
          fill(P(q => { q.moveTo(7, 52); q.lineTo(14, 50); q.lineTo(15, 58); q.lineTo(8.6, 59); q.closePath(); }), '#5a3218'); for (const y of [53, 55.6]) { ell(7.4, y, 0.7, 0.7, '#e0b050'); ell(14.4, y - 1, 0.7, 0.7, '#e0b050'); }
          const dub = P(q => { q.moveTo(0, 100); q.lineTo(0, 86); q.bezierCurveTo(12, 76, 26, 74, 36, 76); q.lineTo(64, 76); q.bezierCurveTo(74, 74, 88, 76, 100, 86); q.lineTo(100, 100); q.closePath(); });
          cloth(dub, '#9a3046', 0, 100); R(dub, 'cloth', '#9a3046'); weave(dub, 0.08);
          clip(dub, () => { for (let y = 79; y < 100; y += 2.6) for (let x = 4 + (y % 5.2 ? 1.3 : 0); x < 98; x += 2.6) { ell(x, y, 0.32, 0.32, 'rgba(240,190,90,.35)'); } soft(2, () => ell(20, 80, 12, 4, 'rgba(255,230,230,.25)')); });
          line([50, 78, 50, 100], 0.9, '#e0b450'); for (let y = 82; y < 100; y += 3.4) { ell(50, y, 0.8, 0.8, '#f0c860'); ell(49.7, y - 0.25, 0.3, 0.3, '#fff4c8'); }
          const cape = P(q => { q.moveTo(64, 76); q.bezierCurveTo(78, 72, 96, 78, 100, 90); q.lineTo(100, 100); q.lineTo(76, 100); q.bezierCurveTo(74, 90, 70, 82, 64, 76); q.closePath(); }); cloth(cape, '#7e2a44', 64, 100); R(cape, 'cloth', '#7e2a44'); line([64.4, 76.4, 76.4, 100], 0.7, '#e0b450');
          for (let i = 0; i < 15; i++) { const t = i / 14, x = 38 + t * 24, y = 75.6 + Math.sin(t * Math.PI) * 4.8; ell(x, y, 1.5, 1.1, '#fffaf0'); ell(x, y + 0.3, 0.6, 0.4, 'rgba(170,150,120,.45)'); }
        },
        front() {
          const fr = P(q => { q.moveTo(33, 50); q.bezierCurveTo(31, 34, 34, 22, 46, 20.4); q.lineTo(64, 21.4); q.bezierCurveTo(67, 26, 67.4, 34, 66, 40); q.bezierCurveTo(63.4, 32, 58, 26.6, 50, 26.4); q.bezierCurveTo(45, 29, 40, 34, 38, 40); q.bezierCurveTo(36.6, 46, 36.4, 52, 36.6, 60); q.lineTo(33.4, 62); q.closePath(); });
          soft(0.9, () => fill(fr, al(h.hair, 0.7))); fill(fr, lin(32, 20, 66, 50, [[0, sh(h.hair, 20)], [0.5, h.hair], [1, sh(h.hair, -34)]])); R(fr, 'hair', h.hair);
          locks(fr, 200, (x, y) => (x < 40 ? 1.5 : 0.5 + (y - 22) * 0.04), h.hair, 10, 2);
          strands(fr, 2400, (x, y) => (x < 40 ? 1.5 : 0.5 + (y - 22) * 0.04), h.hair, 5, 0.16); sheen([40, 24, 48, 22, 56, 23.2], 1.1); sheen([34.6, 34, 34, 44, 35, 54], 0.8);
          const brim = P(q => q.ellipse(51, 21.4, 27, 6.4, -0.1, 0, 6.283));
          fill(brim, lin(24, 0, 78, 0, [[0, '#7a4a72'], [0.5, '#5c3456'], [1, '#2e1a2c']])); R(brim, 'hat', '#5c3456');
          soft(1.4, () => ell(52, 26, 15, 2.4, 'rgba(0,0,0,.45)'));
          clip(head, () => soft(2.4, () => ell(52, 24.6, 16, 3.4, 'rgba(30,10,20,.5)')));
          const crown = P(q => { q.moveTo(37.6, 21.8); q.bezierCurveTo(37, 9, 44, 5.4, 51, 5.4); q.bezierCurveTo(59, 5.6, 65, 9.6, 64.6, 20); q.bezierCurveTo(57, 22.6, 45, 23, 37.6, 21.8); q.closePath(); });
          fill(crown, lin(37, 0, 65, 0, [[0, '#8a5a82'], [0.5, '#5c3456'], [1, '#2a1628']])); R(crown, 'hat', '#5c3456'); weave(crown, 0.05);
          const band = P(q => { q.moveTo(37.6, 17.4); q.bezierCurveTo(46, 19, 56, 18.6, 64.8, 16.2); q.lineTo(64.6, 20); q.bezierCurveTo(56, 22.4, 46, 22.8, 37.6, 21.6); q.closePath(); }); fill(band, lin(0, 16, 0, 22, [[0, '#f6d68a'], [1, '#a87a28']])); R(band, 'trim', '#e0b450');
          c.strokeStyle = '#fff0b0'; c.lineWidth = 0.4; c.strokeRect(57, 17.4, 3.2, 3.4); ell(41, 19.4, 1.1, 1.2, rad(40.6, 19, 0.1, 1.2, [[0, '#ffd0e0'], [0.5, '#c02850'], [1, '#601020']]));
          const plume = P(q => { q.moveTo(39, 17); q.bezierCurveTo(30, 2, 14, 2, 4, 12); q.bezierCurveTo(14, 8, 22, 10, 28, 14); q.bezierCurveTo(20, 14, 14, 18, 10, 24); q.bezierCurveTo(20, 18, 30, 17, 39, 18.6); q.closePath(); });
          fill(plume, lin(4, 6, 39, 18, [[0, '#fffaf0'], [0.6, '#efe2c4'], [1, '#c4a878']])); R(plume, 'hat', '#efe2c4');
          clip(plume, () => { for (let i = 0; i < 200; i++) { const t = rr(), x = 39 - t * 33, y = 17 - Math.sin(t * 2.6) * 8 + (rr() - 0.5) * 4; line([x, y, x - 1.4, y + 3], 0.1, rr() > 0.5 ? 'rgba(255,255,255,.6)' : 'rgba(150,120,80,.4)'); } });
          curve([39, 17.6, 28, 9, 6, 11], 0.3, '#b89a6a');
        }
      }
    }; }
  };
  // (DRESS is defined below and hoisted into paint through this setter)
  Bz.setDress = d => { Bz._dress = d; };
  window.Bust = Bz;
})();
