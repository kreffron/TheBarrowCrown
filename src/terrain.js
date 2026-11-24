/* Terrain, props and the shape of a fight.
   Terrain (B.terrain: square -> kind), laid down by B.makeTerrain from the place the fight happens:
     high   high ground: +1 to hit anyone lower (and -1 hitting up at someone on it); bows, thrown weapons and spells
            reach one square further from it.
     rough  brush, rubble, mud, drifts: entering costs 2 squares of movement.
     fire   burns anyone who ends a move in it or starts a turn in it. Some fire burns out after a few rounds.
   Cover: a low obstacle (fence, table, crate, barrel, grave, bush, stump, reeds, water) right beside a target, on the
   side the shot comes from, gives -2 to hit with anything fired from further than one square.
   Props (B.props: square -> kind), which are also obstacles:
     keg      a powder keg. Light it from up to 5 squares away (Use), shoot it (any ranged attack), or catch it in a
              blast or an area spell: it blows up everything next to it. Gas vents and beehives work the same way.
     brazier  stand beside it and topple it (Use): fire spills three squares on, away from you.
   Openings (B.opening): 'ambush' when you reach an enemy from behind (your side moves first in round 1);
   'surprised' when it catches you from behind (its side moves first, and some come at you from the rear).
   Bosses (B.bossUnit): every few rounds a big, marked blow you can step out of; a second phase at half health
   (enraged: +2 damage, and it calls its weakest follower, who gives no XP); some fights have an objective (grp.objective). */
(function () {
  const key = B.key;
  B.TERRAIN = {
    high: { name: 'High ground', desc: '+1 to hit anyone lower. Bows and spells reach 1 further from here.' },
    rough: { name: 'Rough ground', desc: 'Costs 2 squares of movement to enter.' },
    fire: { name: 'Fire', desc: 'Burns anyone who ends a move or starts a turn here.' },
    bridge: { name: 'Bridge', desc: 'The only way across. Shove someone off the edge and they fall hard.' },
    shallows: { name: 'Shallows', desc: 'Costs 2 squares of movement to enter. Nothing burns here.' },
    ice: { name: 'Ice', desc: '-1 to hit for anyone swinging from it. Anyone shoved across it slides further. Fire melts it.' },
    smoke: { name: 'Smoke', desc: 'Nobody can see through it, though they can see into it.' },
    hallowed: { name: 'Hallowed ground', desc: 'The dead burn here: undead who start a turn on it are hurt.' }
  };
  B.PROP = {
    keg: { name: 'Powder keg', desc: 'Shoot it, catch it in a spell, or Use it from up to 5 squares away: it blows up everything next to it. Goblin and human archers will shoot it too, so don\'t linger beside one.' },
    brazier: { name: 'Brazier', desc: 'Stand beside it and Use it: it tips over, and fire spills three squares beyond.' },
    boulder: { name: 'Loose boulder', desc: 'Stand beside it and Use it: it rolls away from you and flattens the first one in its path.' },
    log: { name: 'Felled log', desc: 'Stand beside it and Use it: it rolls away from you and knocks down the first one in its path.' },
    hive: { name: 'Beehive', desc: 'Shoot it, catch it in a spell, or hit it with a stone from up to 4 squares (Use): the bees sting and poison everyone next to it.' },
    gas: { name: 'Gas vent', desc: 'Shoot it, catch it in a spell, or fling a torch at it from up to 5 squares (Use): the gas goes up, burning everything around it.' }
  };
  // Things hanging over open squares (B.hangs: square -> kind). Bring one down from up to 5 squares (Use).
  B.HANG = {
    chandelier: { name: 'Chandelier', desc: 'Bring it down from up to 5 squares (Use): it crushes whoever is under it, and the candles set the floor alight.', label: 'Bring down the chandelier', after: 'fire' },
    icicles: { name: 'Icicles', desc: 'Shake them loose from up to 5 squares (Use): they spear whoever is under them and splash anyone beside.', label: 'Shake loose the icicles', after: 'ice' },
    rocks: { name: 'Cracked ceiling', desc: 'Strike it from up to 5 squares (Use): the rock falls on whoever is under it, and the ground is left broken.', label: 'Bring down the cracked ceiling', after: 'rough' }
  };
  B.ter = (x, y) => B.terrain ? B.terrain.get(key(x, y)) : undefined;
  B.high = (x, y) => B.ter(x, y) === 'high';
  B.stepCost = (x, y) => { const t = B.ter(x, y); return t === 'rough' || t === 'shallows' ? 2 : 1; };
  B.smoky = (x, y) => B.ter(x, y) === 'smoke';
  B.boardRev = 0;                                                  // bumped whenever obstacles change, so the painted board is redone
  B.marked = (x, y) => !!(B.marks && B.marks.some(m => m.sq.has(key(x, y))));

  // What a place's ground is like: how many patches of each kind (and props) a fight there gets.
  // Each prop or hanging thing turns up with the chance given (a number above 1 means several tries).
  const MIX = {
    forest: { high: 2, rough: 3, log: 0.6, hive: 0.6 }, cave: { high: 2, rough: 3, keg: 1, boulder: 0.8, rocks: 0.8 },
    crypt: { high: 1, rough: 2, brazier: 2, chandelier: 0.7, hallowed: 1 }, throne: { high: 1, rough: 1, brazier: 2, chandelier: 1.4, hallowed: 1 },
    fen: { high: 1, rough: 3, shallows: 2, gas: 1.5 }, snow: { high: 2, rough: 3, ice: 2, icicles: 0.8, boulder: 0.6 },
    city: { high: 1, rough: 1, keg: 1, brazier: 1 }, town: { high: 1, rough: 1, keg: 1, brazier: 1, log: 0.4 },
    ash: { high: 1, rough: 2, brazier: 1, fire: 3, smoke: 2, boulder: 0.6 }, sewer: { high: 0, rough: 2, keg: 1, shallows: 2, gas: 1 },
    beach: { high: 1, rough: 2, keg: 1, shallows: 2, log: 0.5 }, tavern: {}
  };
  const ROUGH_TILES = /mud|shallows|snowdrift|drift|rubble|bog/;
  B.makeTerrain = function (rnd) {
    B.terrain = new Map(); B.props = new Map(); B.marks = []; B.fireT = new Map(); B.hangs = new Map(); B.boardRev++;
    if (B.brawl || !rnd || B.CLASSIC) return;
    // boss fights were balanced by hand on the original ground and props, so they keep to those
    let mix = MIX[B.bg] || MIX.forest; const N = B.N, e = N - 12;
    if (B.boss) mix = Object.fromEntries(Object.entries(mix).filter(([k]) => ['high', 'rough', 'fire', 'keg', 'brazier'].includes(k)));
    const open = (x, y) => B.inside(x, y) && !B.wall(x, y) && !B.terrain.has(key(x, y)) && !(B.fixed && B.fixed.has(key(x, y)));
    // the ground under the fight first: muddy, sandy or rubbly squares of the real map become rough
    const ground = Field.map && Field.map.def.ground;
    if (B.srcTiles) for (let y = 0; y < N; y++) for (let x = 2; x < N - 2; x++) {
      const t = B.srcTiles[y][x];
      if (t && t !== ground && ROUGH_TILES.test(t) && open(x, y) && B.terrain.size < 10) B.terrain.set(key(x, y), 'rough');
    }
    const patch = (kind, size, x0, x1) => {
      for (let tries = 0; tries < 30; tries++) {
        const x = x0 + Math.floor(rnd() * (x1 - x0 + 1)), y = Math.floor(rnd() * N);
        if (!open(x, y)) continue;
        const cells = [[x, y]];
        for (let i = 1; i < size; i++) {
          const [px, py] = cells[Math.floor(rnd() * cells.length)], d = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(rnd() * 4)];
          const nx = px + d[0], ny = py + d[1];
          if (open(nx, ny) && nx >= x0 && nx <= x1 && !cells.some(c => c[0] === nx && c[1] === ny)) cells.push([nx, ny]);
        }
        cells.forEach(c => B.terrain.set(key(c[0], c[1]), kind)); return;
      }
    };
    for (let i = 0; i < (mix.high || 0); i++) patch('high', 2 + Math.floor(rnd() * 3), 2, 9 + e);
    for (let i = 0; i < (mix.rough || 0); i++) patch('rough', 2 + Math.floor(rnd() * 2), 3, 8 + e);
    for (let i = 0; i < (mix.fire || 0); i++) patch('fire', 1 + Math.floor(rnd() * 2), 4, 7 + e);
    for (const kind of ['shallows', 'ice', 'smoke', 'hallowed']) for (let i = 0; i < (mix[kind] || 0); i++) patch(kind, 2 + Math.floor(rnd() * 3), kind === 'hallowed' ? 3 : 2, kind === 'hallowed' ? 8 + e : 9 + e);
    const prop = kind => {
      for (let tries = 0; tries < 40; tries++) {
        const x = 4 + Math.floor(rnd() * (4 + e / 2)), y = 1 + Math.floor(rnd() * (N - 2)), k = key(x, y);
        if (!open(x, y)) continue;
        B.walls.set(k, kind); B.props.set(k, kind);
        if (!B.connected()) { B.walls.delete(k); B.props.delete(k); continue; }
        return;
      }
    };
    const chance = (n, f) => { for (let i = 0; i < Math.ceil(n); i++) if (rnd() < Math.min(1, n - i) * 0.9) f(); };
    chance(mix.keg ? mix.keg * 0.83 : 0, () => prop('keg'));
    chance(mix.brazier ? mix.brazier * 0.9 : 0, () => prop('brazier'));
    for (const kind of ['boulder', 'log', 'hive', 'gas']) chance(mix[kind] || 0, () => prop(kind));
    // a boulder or log needs room to roll: drop one with no open square on any side
    for (const [k, kind] of [...B.props]) if ((kind === 'boulder' || kind === 'log') && !B.rollDirs(...k.split(',').map(Number)).length) { B.walls.delete(k); B.props.delete(k); }
    B.hangs = new Map();
    for (const kind of Object.keys(B.HANG)) chance(mix[kind] || 0, () => {
      for (let tries = 0; tries < 40; tries++) {
        const x = 3 + Math.floor(rnd() * (6 + e)), y = 1 + Math.floor(rnd() * (N - 2)), k = key(x, y);
        if (!B.inside(x, y) || B.wall(x, y) || B.hangs.has(k)) continue;
        B.hangs.set(k, kind); return;
      }
    });
  };
  // Directions a roller beside (x, y) could be pushed in: the square past it must be open.
  B.rollDirs = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].filter(([dx, dy]) => B.inside(x + dx, y + dy) && !B.wall(x + dx, y + dy) && B.inside(x - dx, y - dy) && !B.wall(x - dx, y - dy));
  // after deployment: nobody starts a fight standing in fire
  B.clearUnderfoot = function () { B.c.forEach(u => { if (B.ter(u.gx, u.gy) === 'fire') B.terrain.delete(key(u.gx, u.gy)); }); };

  /* ---------- the effect on a strike ---------- */
  B.coverFor = function (fx, fy, t) {
    if (Math.max(Math.abs(fx - t.gx), Math.abs(fy - t.gy)) <= 1) return false;
    const dx = Math.sign(fx - t.gx), dy = Math.sign(fy - t.gy);
    const sq = [[t.gx + dx, t.gy + dy]]; if (dx && dy) sq.push([t.gx + dx, t.gy], [t.gx, t.gy + dy]);
    return sq.some(([x, y]) => { const k = B.walls && B.walls.get(key(x, y)); return k && B.LOW[k.kind || k]; });
  };
  // { bonus, notes } for u striking t from (sx, sy)
  B.terrainMod = function (u, t, sx, sy, ranged) {
    let bonus = 0; const notes = [];
    const up = (B.high(sx, sy) ? 1 : 0) - (B.high(t.gx, t.gy) ? 1 : 0);
    if (up > 0) { bonus += 1; notes.push('high ground +1'); } else if (up < 0) { bonus -= 1; notes.push('uphill -1'); }
    if (ranged && B.coverFor(sx, sy, t)) { bonus -= 2; notes.push('cover -2'); }
    if (!ranged && B.ter(sx, sy) === 'ice') { bonus -= 1; notes.push('on ice -1'); }
    return { bonus, notes };
  };
  B.rangeFrom = (spec, sx, sy) => spec.range + (spec.range > 1 && B.high(sx, sy) ? 1 : 0);

  /* ---------- fire ---------- */
  B.burnDmg = () => G.roll('1d6') + Math.floor((G.S.level || 1) / 3);
  B.burn = async function (u, why) {
    if (!u || u.down || B.ter(u.gx, u.gy) !== 'fire') return;
    const dmg = B.scaleIn(u, B.burnDmg());
    B.addVfx({ k: 'burst', to: u, color: '#ff8a3a', n: 12 });
    await B.hurt(u, dmg, { kind: 'fire', text: u.name + (why || ' is caught in the flames') + ' for ' + dmg + '.' });
  };
  B.setFire = function (x, y, rounds) {
    if (!B.inside(x, y) || B.wall(x, y)) return false;
    const was = B.ter(x, y);
    if (was === 'shallows' || was === 'bridge') return false;
    if (was === 'ice') { B.terrain.set(key(x, y), 'shallows'); B.boardRev++; return false; }
    B.terrain.set(key(x, y), 'fire'); if (rounds) B.fireT.set(key(x, y), rounds); return true;
  };
  B.roundEnd = function () {           // temporary fires burn down
    for (const [k, n] of [...B.fireT]) { if (n <= 1) { B.fireT.delete(k); if (B.terrain.get(k) === 'fire') B.terrain.delete(k); } else B.fireT.set(k, n - 1); }
  };

  /* ---------- props ---------- */
  B.usable = function (c) {
    const out = [];
    for (const [k, kind] of B.props || []) {
      const [x, y] = k.split(',').map(Number), d = Math.max(Math.abs(x - c.gx), Math.abs(y - c.gy));
      if (kind === 'keg' && d <= 5 && B.los(c, { gx: x, gy: y })) out.push({ k, x, y, kind, label: d <= 1 ? 'Light the powder keg' : 'Fling a torch at the powder keg' });
      if (kind === 'brazier' && d === 1) out.push({ k, x, y, kind, label: 'Topple the brazier' });
      if ((kind === 'boulder' || kind === 'log') && d === 1) {
        const dx = Math.sign(x - c.gx), dy = Math.sign(y - c.gy), nx = x + dx, ny = y + dy, o = B.occupant(nx, ny);
        if ((B.inside(nx, ny) && !B.wall(nx, ny)) || (B.inBounds(nx, ny) && !B.inside(nx, ny)) || (o && B.living(o))) out.push({ k, x, y, kind, label: kind === 'log' ? 'Roll the log' : 'Roll the boulder' });
      }
      if (kind === 'hive' && d <= 4 && B.los(c, { gx: x, gy: y })) out.push({ k, x, y, kind, label: 'Throw a stone at the beehive' });
      if (kind === 'gas' && d <= 5 && B.los(c, { gx: x, gy: y })) out.push({ k, x, y, kind, label: 'Fling a torch at the gas vent' });
    }
    for (const [k, kind] of B.hangs || []) {
      const [x, y] = k.split(',').map(Number), d = Math.max(Math.abs(x - c.gx), Math.abs(y - c.gy));
      if (d <= 5 && (d <= 1 || B.los(c, { gx: x, gy: y }))) out.push({ k, x, y, kind, hang: true, label: B.HANG[kind].label });
    }
    return out;
  };
  // Who a prop would hit, for the AI and the autopilot: { foes, allies } of c.
  B.propHits = function (c, p) {
    let sq = [];
    const near = (x, y) => B.c.filter(u => B.living(u) && Math.max(Math.abs(u.gx - x), Math.abs(u.gy - y)) <= 1);
    if (p.kind === 'keg' || p.kind === 'gas' || p.kind === 'hive') sq = near(p.x, p.y);
    else if (p.hang) sq = near(p.x, p.y);
    else if (p.kind === 'brazier') { const dx = Math.sign(p.x - c.gx), dy = Math.sign(p.y - c.gy); let x = p.x, y = p.y; for (let i = 0; i < 3; i++) { x += dx; y += dy; if (!B.inside(x, y) || B.wall(x, y)) break; const o = B.occupant(x, y); if (o && B.living(o)) sq.push(o); } }
    else if (p.kind === 'boulder' || p.kind === 'log') { const r = B.rollPath(c, p); if (r.hit) sq = [r.hit]; }
    return { foes: sq.filter(u => u.side !== c.side), allies: sq.filter(u => u.side === c.side) };
  };
  // The squares a prop's use would hit, for the preview while you aim at it or pick it from Use: round a keg, a gas
  // vent, a hive or a falling thing; along the spill of a brazier; down the line a boulder or a log rolls.
  B.blastSquares = function (c, p) {
    const out = [];
    if (p.hang || p.kind === 'keg' || p.kind === 'gas' || p.kind === 'hive') { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (B.inside(p.x + dx, p.y + dy)) out.push([p.x + dx, p.y + dy]); }
    else if (p.kind === 'brazier') { const dx = Math.sign(p.x - c.gx), dy = Math.sign(p.y - c.gy); let x = p.x, y = p.y; for (let i = 0; i < 3; i++) { x += dx; y += dy; if (!B.inside(x, y) || B.wall(x, y)) break; out.push([x, y]); } }
    else if (p.kind === 'boulder' || p.kind === 'log') { const r = B.rollPath(c, p); out.push(...r.path); if (r.hit) out.push([r.hit.gx, r.hit.gy]); }
    return out;
  };
  // What the log says while you aim at one: who it catches, and a warning in place of the description when it would
  // catch one of yours (the log has room for two lines).
  B.blastLog = function (head, desc, h) {
    const n = h.foes.length, names = h.allies.map(a => a.name);
    if (n) head += ' Catches ' + n + (n > 1 ? ' foes.' : ' foe.');
    return [head, names.length ? 'Careful: the blast would catch ' + names.join(' and ') + ' too.' : desc];
  };
  // The use of a prop worth making this turn, or null: from any square c could move to first, by hand (Use) or,
  // for anyone with a bow or a throw, by shooting a keg, a gas vent or a hive from further off. Enemies weigh it the
  // same way heroes on autopilot do: worth it when it catches more of the other side than a plain attack would, and
  // never when it would catch their own. Returns the prop, with .path (the walk there) and .shot.
  B.propChoice = function (c) {
    if (B.CLASSIC || !B.props) return null;
    if (B.boss && c.side === 1) return null;                         // a boss fight has its own dangers (marked blows, phases)
    if (c.side === 1 && (c.tags || (c.def && c.def.tags) || []).includes('beast')) return null;   // wolves do not light fuses
    const stands = B.reach(c, Math.max(0, c.mov - (B.has(c, 'weak') ? 1 : 0))), r = B.attackRange(c), ox = c.gx, oy = c.gy;
    let best = null, bv = 0;
    try {
      for (const [k, v] of stands) {
        if (v.pass) continue;
        c.gx = v.x; c.gy = v.y;
        const opts = B.usable(c).map(p => Object.assign({}, p));
        if (r > 1) for (const [pk, kind] of B.props) {
          if (!B.SHOT_TEXT || !B.SHOT_TEXT[kind] || opts.some(o => o.k === pk)) continue;
          const [x, y] = pk.split(',').map(Number), d = Math.max(Math.abs(x - v.x), Math.abs(y - v.y));
          if (d > 1 && d <= B.rangeFrom({ range: r }, v.x, v.y) && B.los(c, { gx: x, gy: y })) opts.push({ k: pk, x, y, kind, shot: true });
        }
        for (const p of opts) {
          // what each foe caught is worth, against simply attacking: a keg or a falling thing hits hard (and stuns), a
          // hive's poison adds up, but spilled coals do little to anyone who can step out of them
          const h = B.propHits(c, p), per = p.hang || p.kind === 'boulder' || p.kind === 'log' ? 1.6 : p.kind === 'brazier' ? 0.5 : p.kind === 'hive' ? 0.9 : 1;
          if (h.allies.length) continue;
          const val = h.foes.length * per - 0.04 * v.d;
          if (val > bv) { bv = val; best = Object.assign(p, { path: B.pathTo(stands, k) }); }
        }
      }
    } finally { c.gx = ox; c.gy = oy; }
    return bv >= 1.6 ? best : null;
  };
  // Where a roller goes: square by square away from c until something stops it.
  B.rollPath = function (c, p) {
    const dx = Math.sign(p.x - c.gx), dy = Math.sign(p.y - c.gy), path = [];
    let x = p.x, y = p.y, hit = null, fall = false;
    for (let i = 0; i < 6; i++) {
      const nx = x + dx, ny = y + dy;
      if (B.inBounds(nx, ny) && !B.inside(nx, ny)) { fall = true; break; }
      if (!B.inside(nx, ny) || B.wall(nx, ny)) break;
      const o = B.occupant(nx, ny); if (o && B.living(o)) { hit = o; break; }
      x = nx; y = ny; path.push([x, y]);
    }
    return { path, hit, fall, end: [x, y] };
  };
  B.useProp = async function (c, p) {
    B.boardRev++;
    if (p.kind === 'keg' || p.kind === 'gas') { await B.explode(p.x, p.y, c); return; }
    if (p.hang) { await B.dropHang(c, p); return; }
    if (p.kind === 'boulder' || p.kind === 'log') { await B.roll(c, p); return; }
    if (p.kind === 'hive') { await B.hive(c, p); return; }
    // the brazier tips away from whoever pushed it
    const dx = Math.sign(p.x - c.gx), dy = Math.sign(p.y - c.gy);
    B.walls.delete(p.k); B.props.delete(p.k); B.boardRev++;
    B.setFire(p.x, p.y, 3);
    G.audio.sfx('hit'); B.shakeT = G.time;
    await B.msg(c.name + ' kicks the brazier over. Burning coals spill across the floor.');
    let x = p.x, y = p.y;
    for (let i = 0; i < 3; i++) { x += dx; y += dy; if (!B.inside(x, y) || B.wall(x, y)) break; B.setFire(x, y, 3); }
    B.refresh();
    for (const u of B.c.filter(u => B.living(u) && B.ter(u.gx, u.gy) === 'fire')) await B.burn(u, ' is caught in the spilled coals');
  };
  B.explode = async function (x, y, by, shot) {
    const k = key(x, y), kind = B.props.get(k); if (kind !== 'keg' && kind !== 'gas') return;
    B.walls.delete(k); B.props.delete(k); B.boardRev++;
    G.audio.sfx('crit'); B.shakeT = G.time; B.flashT = G.time;
    B.addVfx({ k: 'blast', at: [x, y], r: 1, color: kind === 'gas' ? '#7ac8ff' : '#ff8a3a' });
    if (B.spark) { const p = B.tileCenter(x, y); B.spark(p.x, p.y - 4, kind === 'gas' ? '#9ad8ff' : '#ffb04a', 30, 90, 700, 40); }
    if (kind === 'gas') await B.msg((by && !shot ? by.name + ' flings a torch at the vent. ' : '') + 'The gas goes up in a sheet of blue flame.');
    else await B.msg((by && !shot ? by.name + ' sets off the powder keg. ' : 'The powder keg goes up. ') + 'BOOM.');
    B.setFire(x, y, 2);
    if (kind === 'gas') for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) B.setFire(x + dx, y + dy, 2);
    for (const u of B.c.filter(u => B.living(u) && Math.max(Math.abs(u.gx - x), Math.abs(u.gy - y)) <= 1)) {
      const dmg = B.scaleIn(u, G.roll('2d6') + Math.floor((G.S.level || 1) / 2));
      if (by && u.side === by.side && u !== by) B.bondMoment(by, u, -1, 'caught in a blast');
      await B.hurt(u, dmg, { kind: 'fire', text: u.name + ' is caught in the blast for ' + dmg + '.' });
    }
    for (const [k2, kind] of [...B.props]) {                     // kegs set each other off
      if (kind !== 'keg' && kind !== 'gas') continue; const [x2, y2] = k2.split(',').map(Number);
      if (Math.max(Math.abs(x2 - x), Math.abs(y2 - y)) <= 1) await B.explode(x2, y2, null);
    }
    B.refresh();
  };

  // A boulder or log rolls away from whoever pushed it, flattening the first one in its path (or going over the edge).
  B.roll = async function (c, p) {
    const r = B.rollPath(c, p), log = p.kind === 'log', lv = G.S.level || 1;
    B.walls.delete(p.k); B.props.delete(p.k);
    G.audio.sfx('hit');
    await B.msg(c.name + (log ? ' heaves the log over. It rolls.' : ' puts a shoulder to the boulder. It rolls.'));
    let at = [p.x, p.y];
    for (const sq of r.path) {                                    // trundle across the board, a square at a time
      at = sq; B.walls.set(key(sq[0], sq[1]), log ? 'log' : 'boulder'); B.boardRev++;
      if (!G.fast) await G.sleep(70);
      B.walls.delete(key(sq[0], sq[1]));
    }
    B.boardRev++;
    if (r.fall) { B.shakeT = G.time; await B.msg(log ? 'The log tips over the edge and is gone.' : 'The boulder goes over the edge. A long while later, a crash.'); return; }
    B.walls.set(key(at[0], at[1]), log ? 'stump' : 'rock');        // where it comes to rest, it stays
    if (r.hit) {
      const t = r.hit, dmg = B.scaleIn(t, G.roll('2d6') + Math.floor(lv / 2) + 2);
      if (t.side === c.side) B.bondMoment(c, t, -1, 'flattened by a friend');
      B.shakeT = G.time; B.addVfx({ k: 'burst', to: t, color: '#c8b89a', n: 18 });
      await B.hurt(t, dmg, { text: (log ? 'The log' : 'The boulder') + ' hits ' + t.name + ' for ' + dmg + '.' });
      if (!t.down && (t.def ? (t.def.scale || 3) < 4 : true) && B.addStatus(t, 'stunned', 1)) await B.msg(t.name + ' is knocked flat.');
    }
    B.refresh();
  };
  // Something hanging overhead comes down: a heavy hit on the square, a lighter one beside it.
  B.dropHang = async function (c, p) {
    const h = B.HANG[p.kind], lv = G.S.level || 1;
    B.hangs.delete(p.k); B.boardRev++;
    G.audio.sfx('crit'); B.shakeT = G.time;
    B.addVfx({ k: 'blast', at: [p.x, p.y], r: 0, color: p.kind === 'icicles' ? '#c8e8ff' : p.kind === 'rocks' ? '#a89a88' : '#ffd27a' });
    await B.msg(c.name + (p.kind === 'chandelier' ? ' cuts the chain. The chandelier comes down.' : p.kind === 'icicles' ? ' cracks the ice overhead. The icicles fall.' : ' strikes the cracked rock overhead. It gives.'));
    for (const u of B.c.filter(u => B.living(u) && Math.max(Math.abs(u.gx - p.x), Math.abs(u.gy - p.y)) <= 1)) {
      if (u.side === c.side && u !== c) B.bondMoment(c, u, -1, 'something dropped on them');
      const under = u.gx === p.x && u.gy === p.y, dmg = B.scaleIn(u, under ? G.roll('2d6') + Math.floor(lv / 2) + 2 : G.roll('1d6') + Math.floor(lv / 4));
      await B.hurt(u, dmg, { text: u.name + (under ? ' is right under it, for ' : ' is caught by the edge of it, for ') + dmg + '.' });
      if (under && !u.down && B.addStatus(u, 'stunned', 1)) await B.msg(u.name + ' is stunned.');
    }
    if (h.after === 'fire') B.setFire(p.x, p.y, 2); else if (!B.ter(p.x, p.y) || B.ter(p.x, p.y) === 'high') B.terrain.set(p.k, h.after);
    B.refresh();
  };
  // An area attack (a fireball, a whirlwind of blades, a thrown flask) that reaches a keg, a gas vent or a hive sets
  // it off, after its own damage: center [x, y] and radius r, by c.
  B.areaProps = async function (c, center, r) {
    if (!B.props || !center) return;
    for (const [k, kind] of [...B.props]) {
      if (!B.SHOT_TEXT || !B.SHOT_TEXT[kind] || !B.props.has(k)) continue; const [x, y] = k.split(',').map(Number);
      if (Math.max(Math.abs(x - center[0]), Math.abs(y - center[1])) > r) continue;
      B.boardRev++;
      if (kind === 'hive') await B.hive(c, { k, x, y, kind }, true); else await B.explode(x, y, c, true);
      if (B.over && B.over()) return;
    }
  };
  // The bees come out angry: everyone next to the hive is stung and poisoned.
  B.hive = async function (c, p, shot) {
    B.walls.set(p.k, 'stump'); B.props.delete(p.k); B.boardRev++;
    G.audio.sfx('debuff');
    if (B.spark) { const q = B.tileCenter(p.x, p.y); B.spark(q.x, q.y - 8, '#ffd24a', 40, 50, 1400, 0); }
    await B.msg(shot ? 'The hive splits open. The bees boil out.' : c.name + "'s stone knocks the hive down. The bees boil out.");
    for (const u of B.c.filter(u => B.living(u) && Math.max(Math.abs(u.gx - p.x), Math.abs(u.gy - p.y)) <= 1)) {
      const dmg = B.scaleIn(u, G.roll('1d4') + 1);
      await B.hurt(u, dmg, { kind: 'poison', text: u.name + ' is stung for ' + dmg + '.' });
      if (!u.down && B.addStatus(u, 'poison', 3, 2 + Math.floor((G.S.level || 1) / 4))) B.float(u, 'Poisoned', '#7ad04a');
    }
    B.refresh();
  };
  // Undead who start a turn on hallowed ground are hurt by it.
  B.hallow = async function (u) {
    if (!u || u.down || B.ter(u.gx, u.gy) !== 'hallowed' || !(u.tags || []).includes('undead')) return;
    const dmg = G.roll('1d6') + Math.floor((G.S.level || 1) / 3);
    B.addVfx({ k: 'rise', to: u, shape: 'spark', color: '#fff2b0' });
    await B.hurt(u, dmg, { kind: 'holy', text: 'The hallowed ground burns ' + u.name + ' for ' + dmg + '.' });
  };

  /* ---------- openings ---------- */
  B.applyOpening = function (grp) {
    const op = B.opening;
    if (!op || grp.boss || grp.brawl || grp.guide) { B.opening = null; return; }
    if (op === 'surprised') {                                    // some of them come at you from behind
      const foes = B.c.filter(u => u.side === 1);
      foes.filter((u, i) => i % 2 === 1).forEach(u => { const ox = u.gx, oy = u.gy; u.gx = -1; B.place(u, [0, 1]); if (u.gx < 0) { u.gx = ox; u.gy = oy; } else { u.face = 1; u.fdir = [1, 0]; } });
    }
  };

  /* ---------- bosses ---------- */
  // A great blow: on its turn the boss marks a 3x3 area (where most of your side stands); on its next turn
  // everything still in it is hit hard. Returns true if the boss spent its turn on this.
  B.bossTurn = async function (u) {
    if (u !== B.bossUnit || u.down || B.CLASSIC) return false;
    if (u.windup) {
      const m = u.windup; u.windup = null; B.marks = B.marks.filter(x => x !== m); u.cool = 3;
      u.fx = { k: 'lunge', t: G.time, dx: -1, dy: 0 }; B.shakeT = G.time; B.flashT = G.time; G.audio.sfx('crit');
      B.addVfx({ k: 'blast', at: m.c, r: 1, color: '#ff5a3a' });
      await B.msg(u.name + ' brings the blow down!');
      const hit = B.c.filter(t => B.living(t) && t.side !== u.side && m.sq.has(key(t.gx, t.gy)));
      if (!hit.length) { await B.msg('It smashes into empty floor.'); return true; }
      for (const t of hit) { const dmg = B.scaleIn(t, Math.round((G.roll(u.dmg) + (u.dmgBonus || 0)) * 1.25)); await B.hurt(t, dmg, { text: t.name + ' takes ' + dmg + '.' }); }
      return true;
    }
    if (u.cool > 0) { u.cool--; return false; }
    const foes = B.c.filter(t => B.living(t) && t.side !== u.side);
    if (B.round < 2 || foes.length < 2 || G.rand() < 0.5) return false;
    let best = null;
    for (const t of foes) {
      const n = foes.filter(o => Math.max(Math.abs(o.gx - t.gx), Math.abs(o.gy - t.gy)) <= 1).length;
      if (!best || n > best.n) best = { n, c: [t.gx, t.gy] };
    }
    if (!best || best.n < 2) return false;
    const sq = new Set(); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (B.inside(best.c[0] + dx, best.c[1] + dy)) sq.add(key(best.c[0] + dx, best.c[1] + dy));
    const m = { c: best.c, sq }; B.marks.push(m); u.windup = m;
    u.fx = { k: 'cast', t: G.time }; G.audio.sfx('debuff'); B.refresh();
    await B.msg(u.name + ' draws back for a terrible blow!', 'Get out of the red squares before its next turn.');
    return true;
  };
  // At half health: enraged, and it calls a couple of its followers (who give no XP).
  B.bossPhase = async function () {
    const u = B.bossUnit; if (!u || u.down || B.phase2 || u.hp > u.maxHp / 2 || B.CLASSIC) return;
    B.phase2 = true;
    B.addStatus(u, 'enraged', 99); G.audio.sfx('encounter'); B.shakeT = G.time;
    B.banner = { text: u.name, sub: 'Enraged', boss: true, t0: G.time, dur: 1300 };
    const others = B.c.filter(x => x.side === u.side && x !== u && B.living(x)).length;
    const kin = (B.grp.waves && B.grp.waves.length) || others >= 2 ? [] : (B.grp.enemies || []).filter(id => id !== u.id && G.D.enemies[id]).sort((a, b) => G.D.enemies[a].hp - G.D.enemies[b].hp).slice(0, 1);   // its weakest follower
    const before = B.c.length;
    if (kin.length) B.spawn(kin, true);
    B.c.slice(before).forEach(x => { x.noXp = true; });
    B.refresh();
    await B.msg(u.name + ' is badly hurt, and furious.' + (kin.length ? ' Another of them comes to its call!' : ''), 'It hits harder now.');
  };
  // Objectives: { type: 'survive', rounds, text, done } wins when you last that long;
  // { type: 'deadline', rounds, more: { if, rounds }, text, late, dmg } hurts every round after that.
  B.objectiveRound = async function (round) {
    const ob = B.objective; if (!ob || B.CLASSIC) return null;
    const limit = ob.rounds + (ob.more && G.cond(ob.more.if) ? ob.more.rounds : 0);
    if (ob.type === 'survive') {
      if (round > limit) { await B.msg(ob.done || 'You held out.', null, true); return 'win'; }
      B.objNote = 'Survive ' + (limit - round + 1) + ' more round' + (limit - round ? 's' : '') + '.';
    } else if (ob.type === 'deadline') {
      if (round > limit) {
        B.objNote = 'Too late: it is at full strength.';
        if (!B.lateSaid) { B.lateSaid = true; if (B.bossUnit) B.addStatus(B.bossUnit, 'enraged', 99); await B.msg(ob.late || 'Too late!'); }
        for (const t of B.c.filter(t => B.living(t) && t.side === 0)) { const dmg = B.scaleIn(t, G.roll(ob.dmg || '1d6')); await B.hurt(t, dmg, { kind: 'fire', text: t.name + ' is scalded for ' + dmg + '.' }); }
      } else B.objNote = 'Beat it within ' + (limit - round + 1) + ' more round' + (limit - round ? 's' : '') + '.';
    }
    return B.over();
  };
})();
