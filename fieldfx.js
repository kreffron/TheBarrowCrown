/* Field effects drawn over the map: light from lamps, hearths and braziers (cutting through the dark in crypts,
   glowing warm indoors), drifting air for each kind of place (fen fog, crypt dust, pollen, embers), a glint on
   chests and pickups not yet taken, and small clues near secrets Dask has not yet found (a seam in a wall, a stain
   over a trap, a dusty edge round a plate). */
(function () {
  const T = 16;
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };
  // What gives light, and how: [radius, colour].
  Field.LIGHTS = {
    lamp: [44, '255,190,110'], hearth: [64, '255,150,70'], brazier: [54, '255,140,60'], wardLamp: [50, '255,210,130'],
    waylampLit: [46, '255,200,120'], lighthouseLit: [80, '255,220,150'], crystalLit: [48, '170,220,255'], ember: [22, '255,120,50'],
    sunshaft: [40, '255,240,200'], fire: [40, '255,150,60'], campfire: [52, '255,150,60'], altar: [26, '255,220,160']
  };
  // The light in view: lit tiles (found once per map) and lit things (looked at each frame, since lamps get lit).
  Field.lightsInView = function (cx, cy) {
    const m = Field.map; if (!m) return [];
    if (m.lightTiles == null) {
      m.lightTiles = [];
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (Field.LIGHTS[m.t[y][x]]) m.lightTiles.push([x, y, m.t[y][x]]);
    }
    const out = [];
    const add = (x, y, id, key) => { const L = Field.LIGHTS[id], sx = x * T - cx + 8, sy = y * T - cy + (id === 'hearth' ? 12 : 6); if (sx < -L[0] || sy < -L[0] || sx > G.W + L[0] || sy > G.H + L[0]) return; out.push({ x: sx, y: sy, r: L[0], col: L[1], ph: (x * 13 + y * 7) % 17 }); };
    for (const [x, y, id] of m.lightTiles) add(x, y, id);
    for (const th of m.things) {
      if (!Field.visible(th) || (th.def.hidden && !G.flag('sp.' + th.key))) continue;
      const g = Field.thingGfx(th); if (g && Field.LIGHTS[g]) add(th.x, th.y, g);
    }
    return out;
  };
  const flick = (l, t) => 1 + Math.sin(t / 130 + l.ph) * 0.04 + Math.sin(t / 47 + l.ph * 2) * 0.03;
  // Darkness with holes in it: round the party (as before) and round every light. Returns true if it drew.
  let dk = null;
  Field.drawDark = function (c, m, gx, gy, cx, cy) {
    if (!dk) { dk = document.createElement('canvas'); }
    if (dk.width !== G.W || dk.height !== G.H) { dk.width = G.W; dk.height = G.H; }
    const d = dk.getContext('2d'), t = G.time, lights = Field.lightsInView(cx, cy);
    d.globalCompositeOperation = 'source-over'; d.clearRect(0, 0, G.W, G.H);
    d.fillStyle = 'rgba(8,6,16,' + m.def.dark + ')'; d.fillRect(0, 0, G.W, G.H);
    d.globalCompositeOperation = 'destination-out';
    const inner = m.def.lightInner || 34, outer = m.def.lightInner ? 110 : 145;   // a little tighter than before: the lamps carry the rest
    let g = d.createRadialGradient(gx, gy, inner, gx, gy, outer); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    d.fillStyle = g; d.beginPath(); d.arc(gx, gy, outer, 0, 7); d.fill();
    d.fillStyle = '#000'; d.beginPath(); d.arc(gx, gy, inner, 0, 7); d.fill();
    for (const l of lights) {
      const r = l.r * flick(l, t);
      g = d.createRadialGradient(l.x, l.y, 2, l.x, l.y, r); g.addColorStop(0, 'rgba(0,0,0,.95)'); g.addColorStop(0.5, 'rgba(0,0,0,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      d.fillStyle = g; d.beginPath(); d.arc(l.x, l.y, r, 0, 7); d.fill();
    }
    c.drawImage(dk, 0, 0);
    Field.drawGlow(c, lights, 1);
    return true;
  };
  // Warm light laid over the picture round each source (lighter, so it adds), with a soft flicker.
  Field.drawGlow = function (c, lights, k) {
    if (!lights.length) return;
    const t = G.time; c.save(); c.globalCompositeOperation = 'lighter';
    for (const l of lights) {
      const r = l.r * 0.8 * flick(l, t), g = c.createRadialGradient(l.x, l.y, 1, l.x, l.y, r);
      g.addColorStop(0, 'rgba(' + l.col + ',' + (0.22 * k) + ')'); g.addColorStop(1, 'rgba(' + l.col + ',0)');
      c.fillStyle = g; c.beginPath(); c.arc(l.x, l.y, r, 0, 7); c.fill();
    }
    c.restore();
  };
  // Indoors (not dark): warm glow round each light, and the corners of the room a touch dimmer.
  Field.drawIndoor = function (c, m, cx, cy) {
    Field.drawGlow(c, Field.lightsInView(cx, cy), 1.5);
    const g = c.createRadialGradient(G.W / 2, G.H / 2, G.H * 0.45, G.W / 2, G.H / 2, G.W * 0.75);
    g.addColorStop(0, 'rgba(20,10,4,0)'); g.addColorStop(1, 'rgba(20,10,4,.28)'); c.fillStyle = g; c.fillRect(0, 0, G.W, G.H);
  };

  /* ---------- the air of a place ---------- */
  // Which drift a map gets, if it has no weather of its own: fen fog, crypt and cave dust, pollen in the woods,
  // embers in the ash country, sea-mist on the coast.
  Field.airKind = function (m) {
    const d = m.def, id = m.id;
    if (G.D.weather && G.D.weather[id] === 'rain' && (d.bg === 'fen' || d.ground === 'marsh' || d.ground === 'mud')) return 'fog';
    if (G.D.weather && G.D.weather[id]) return null;
    if (d.bg === 'fen' || d.ground === 'marsh' || d.ground === 'mud') return 'fog';
    if (d.bg === 'beach' || d.ground === 'sand') return 'mist';
    if (d.bg === 'ash' || d.ground === 'ash') return 'embers';
    if (d.dark || d.bg === 'crypt' || d.bg === 'cave' || d.bg === 'sewer') return 'dust';
    if (d.bg === 'forest' || d.ground === 'grass') return 'pollen';
    if (m.indoor) return 'dust';
    return null;
  };
  Field.air = function (c, cx, cy) {
    const m = Field.map; if (!m || G.fast || G.opts.air === false) return;
    const kind = Field.airKind(m); if (!kind) return;
    const now = G.time, dt = Math.min(60, now - (Field.airT || now)); Field.airT = now;
    if (Field.airKey !== m.id) {
      Field.airKey = m.id; Field.airQ = [];
      const n = { fog: 14, mist: 9, dust: 34, pollen: 26, embers: 30 }[kind];
      for (let i = 0; i < n; i++) Field.airQ.push({ x: Math.random() * (G.W + 120) - 60, y: Math.random() * (G.H + 60) - 30, s: 0.5 + Math.random(), p: Math.random() * 7 });
    }
    // particles live in map space (they drift past as you walk), wrapped round the screen
    const W = G.W + 120, H = G.H + 60;
    const wrap = q => { let x = ((q.x - cx * 0.6) % W + W) % W - 60, y = ((q.y - cy * 0.6) % H + H) % H - 30; return [x, y]; };
    c.save();
    for (const q of Field.airQ) {
      q.p += dt * 0.001;
      if (kind === 'fog' || kind === 'mist') {
        q.x += dt * 0.006 * q.s; const [x, y] = wrap(q), a = (kind === 'fog' ? 0.2 : 0.12) * (0.6 + 0.4 * Math.sin(q.p * 0.7)), r = 40 + q.s * 30;
        const g = c.createRadialGradient(x, y, 2, x, y, r); g.addColorStop(0, 'rgba(' + (kind === 'fog' ? '190,205,185' : '220,230,240') + ',' + a + ')'); g.addColorStop(1, 'rgba(200,210,200,0)');
        c.fillStyle = g; c.save(); c.translate(x, y); c.scale(1.8, 0.6); c.translate(-x, -y); c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore();
      } else if (kind === 'dust') {
        q.x += Math.sin(q.p) * dt * 0.004; q.y -= dt * 0.002 * q.s; const [x, y] = wrap(q);
        c.fillStyle = 'rgba(230,215,180,' + (0.18 + 0.2 * Math.abs(Math.sin(q.p * 1.7))) + ')'; c.fillRect(x | 0, y | 0, 1, 1);
      } else if (kind === 'pollen') {
        q.x += (0.006 + Math.sin(q.p) * 0.006) * dt * q.s; q.y += Math.cos(q.p * 1.3) * dt * 0.004; const [x, y] = wrap(q);
        c.fillStyle = 'rgba(255,250,200,' + (0.25 + 0.3 * Math.abs(Math.sin(q.p * 2))) + ')'; c.fillRect(x | 0, y | 0, 1, 1);
      } else if (kind === 'embers') {
        q.y -= dt * 0.012 * q.s; q.x += Math.sin(q.p * 2) * dt * 0.006; const [x, y] = wrap(q), hot = Math.abs(Math.sin(q.p * 3));
        c.fillStyle = 'rgba(255,' + (100 + hot * 90 | 0) + ',40,' + (0.35 + hot * 0.5) + ')'; c.fillRect(x | 0, y | 0, 1, 1);
      }
    }
    c.restore();
  };

  /* ---------- glints and clues ---------- */
  // A sparkle now and then on what is still to be taken: unopened chests, pickups, and notes Dask has found but no
  // one has read. Each has its own beat, so they do not all flash together.
  Field.glintable = th => { const d = th.def;
    if (d.type === 'chest') return !G.flag('o.' + th.key);
    if (d.type === 'pickup') return true;
    if (d.type === 'sign' && d.hidden) return G.flag('sp.' + th.key) && !G.flag('rd.' + th.key);
    return false; };
  Field.drawGlint = function (c, th, sx, sy) {
    if (G.opts.glints === false) return;
    const per = 2600, ph = (G.time + hash(th.key) % per) % per; if (ph > 520) return;
    const k = Math.sin(ph / 520 * Math.PI), x = Math.round(sx) + 12, y = Math.round(sy) + 2, r = 1 + k * 3;
    c.save(); c.globalAlpha = k; c.fillStyle = '#fffbe6';
    c.fillRect(x - r, y, r * 2 + 1, 1); c.fillRect(x, y - r, 1, r * 2 + 1);
    c.fillStyle = 'rgba(255,240,170,.6)'; c.fillRect(x - 1, y - 1, 3, 3);
    c.restore();
  };
  // Clues to what is hidden, faint, and fading in as the party comes within a few steps. Anyone sees them; Dask
  // finds what they point at.
  Field.drawClues = function (c, cx, cy) {
    const m = Field.map, p = Field.p; if (!m || G.opts.clues === false) return;
    for (const th of m.things) {
      const d = th.def; if (!d.hidden || G.flag('sp.' + th.key) || !Field.visible(th)) continue;
      const dist = Math.abs(th.x - p.x) + Math.abs(th.y - p.y); if (dist > 6) continue;
      const a = Math.min(1, (6.5 - dist) / 3), sx = th.x * T - cx, sy = th.y * T - cy, h = hash(th.key);
      c.save(); c.globalAlpha = a;
      if (d.pz === 'secret') {                       // a hairline seam in the stone, and a breath of dust from its foot
        c.fillStyle = 'rgba(10,6,14,.55)'; c.fillRect(sx + 4, sy + 2, 1, 12); c.fillRect(sx + 11, sy + 2, 1, 12); c.fillRect(sx + 4, sy + 2, 8, 1);
        c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(sx + 5, sy + 3, 1, 11);
        const q = (G.time / 900 + (h % 10) / 10) % 1; c.fillStyle = 'rgba(230,220,190,' + (0.5 * (1 - q)) + ')'; c.fillRect(sx + 6 + Math.round(q * 5), sy + 14 - Math.round(q * 3), 1, 1); c.fillRect(sx + 9 - Math.round(q * 4), sy + 15 - Math.round(q * 2), 1, 1);
      } else if (d.pz === 'trap') {                  // a rust-dark stain and a scatter of scratches across the slab
        c.fillStyle = 'rgba(80,30,20,.32)'; c.beginPath(); c.ellipse(sx + 8, sy + 9, 5, 3, (h % 6) / 3, 0, 7); c.fill();
        c.fillStyle = 'rgba(20,12,10,.5)'; c.fillRect(sx + 3, sy + 4 + h % 3, 4, 1); c.fillRect(sx + 9, sy + 12, 5, 1); c.fillRect(sx + 11, sy + 5, 1, 3);
      } else if (d.pz === 'plate') {                 // a square edge in the dust
        c.strokeStyle = 'rgba(15,10,20,.4)'; c.lineWidth = 1; c.strokeRect(sx + 2.5, sy + 2.5, 11, 11);
        c.fillStyle = 'rgba(255,245,220,.14)'; c.fillRect(sx + 3, sy + 3, 10, 1);
      } else if (d.type === 'sign') {                // a few scratches, low down
        c.fillStyle = 'rgba(240,230,210,.35)'; for (let i = 0; i < 4; i++) c.fillRect(sx + 3 + i * 3, sy + 9 + ((h >> i) & 1), 2, 1);
      }
      c.restore();
    }
  };
})();
