/* Board: battles are fought on a 12x12 tactical grid.
   Every unit has a square (gx, gy) and, on its turn, may move once and act once, in either order.
   Movement: slow 2, regular 3, quick 4 squares (B.movOf). Distances are counted like a chess king
   (diagonals count as one). Weapons reach adjacent squares, bows 6, spells and songs 4-6 (B.spec).
   Obstacles block movement and line of sight; units block movement for the other side only.
   The canvas runs at double resolution during a battle so the pieces can be drawn finer. */
(function () {
  // The board is 12x12, or 14x14 for the shaped boards (B.SHAPES), whose missing squares (B.voids) are not part
  // of the fight at all: chasms, pits, the space beyond a hall's walls. B.inside is false there, so nothing can
  // stand on, walk through or aim at them; sight passes over them.
  let N = 12, TW = 20, TH = 12, BX = 76, BY = 50, ROWS = [];
  const key = (x, y) => x + ',' + y;
  B.key = key;
  B.setSize = function (n) {
    N = n; [TW, TH, BX, BY] = n === 14 ? [17, 10, 77, 52] : [20, 12, 76, 50];
    Object.assign(B, { N, TW, TH, BX, BY });
    const c = n / 2 - 1; ROWS = [];                                   // middle rows first: 5, 6, 4, 7, 3 ... on a 12
    for (let i = 0; i < n; i++) ROWS.push(c + (i % 2 ? 1 : -1) * Math.ceil(i / 2));
  };
  B.voids = null;
  B.inBounds = (x, y) => x >= 0 && y >= 0 && x < N && y < N;
  B.inside = (x, y) => x >= 0 && y >= 0 && x < N && y < N && !(B.voids && B.voids.has(key(x, y)));
  B.dist = (a, b) => Math.max(Math.abs(a.gx - b.gx), Math.abs(a.gy - b.gy));
  B.wall = (x, y) => !!(B.walls && B.walls.has(key(x, y)));
  // A square is taken by any standing unit, or by a fallen hero (who can still be revived there).
  B.occupant = (x, y) => B.c.find(u => u.gx === x && u.gy === y && !u.gone && (!u.down || u.side === 0));
  B.living = u => !u.down && !u.gone;

  /* ---------- the battlefield ---------- */
  B.THEME = {
    forest: { a: '#4c9141', b: '#447f3a', edge: '#2a4a24', block: 'tree' },
    cave: { a: '#5c5349', b: '#524a41', edge: '#2e2822', block: 'rock' },
    crypt: { a: '#70727f', b: '#646673', edge: '#33343e', block: 'pillar' },
    fen: { a: '#6b7a3c', b: '#5e6c34', edge: '#34401e', block: 'reeds' },
    snow: { a: '#e4ecf2', b: '#d0dae4', edge: '#7a8aa0', block: 'snowrock' },
    city: { a: '#8a8478', b: '#7c766b', edge: '#46423a', block: 'crate' },
    ash: { a: '#6e5e56', b: '#62534c', edge: '#2e2420', block: 'deadtree' },
    throne: { a: '#4a3a54', b: '#3e3048', edge: '#170f20', block: 'pillar' },
    sewer: { a: '#4a5a48', b: '#405040', edge: '#1e2a22', block: 'barrel' },
    tavern: { a: '#8a5d38', b: '#7c5332', edge: '#3e2818', block: 'table' },
    town: { a: '#c8a56a', b: '#b9965e', edge: '#6e5636', block: 'crate' },
    beach: { a: '#d8c08a', b: '#cbb27c', edge: '#7a6440', block: 'rock' }
  };
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  // Every open square must connect to every other, so nobody is ever walled in.
  function connected() {
    let total = 0, start = null;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (B.inside(x, y) && !B.wall(x, y)) { total++; if (!start) start = [x, y]; }
    if (!start) return false;
    const seen = new Set([key(start[0], start[1])]), q = [start];
    while (q.length) {
      const [x, y] = q.shift();
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy, k = key(nx, ny);
        if ((dx || dy) && B.inside(nx, ny) && !B.wall(nx, ny) && !seen.has(k)) { seen.add(k); q.push([nx, ny]); }
      }
    }
    return seen.size === total;
  }
  // What a solid field tile becomes on the board. Low things (water, fences, tables, graves) stop movement but not sight.
  const KIND = {
    tree: 'tree', hedge: 'bush', bush: 'bush', pine: 'pine', frostpine: 'pine', deadtree: 'deadtree', stump: 'stump', mound: 'rock',
    rock: 'rock', boulder: 'rock', rubble: 'rock', snowrock: 'snowrock', well: 'rock', hearth: 'rock', statue: 'pillar',
    water: 'water', brokenBridge: 'water', boat: 'water', fountain: 'water', sewer: 'water', reeds: 'reeds',
    pillar: 'pillar', standing: 'standing', lamp: 'pillar', waylamp: 'pillar', waylampLit: 'pillar', brazier: 'pillar', lighthouse: 'pillar', banner: 'pillar', mirror: 'pillar', gearwork: 'pillar',
    table: 'table', counter: 'table', bed: 'table', altar: 'table', anvil: 'table', coffin: 'table', stall: 'crate', shelf: 'crate', tent: 'crate',
    barrel: 'barrel', pots: 'barrel', crate: 'crate', coins: 'barrel', papers: 'crate', skulls: 'rock', grave: 'grave', fence: 'fence'
  };
  const LOW = { water: 1, reeds: 1, fence: 1, table: 1, crate: 1, barrel: 1, grave: 1, bush: 1, stump: 1, keg: 1, brazier: 1, log: 1, hive: 1, gas: 1 };
  B.LOW = LOW;
  B.blocksSight = (x, y) => { const k = B.walls && B.walls.get(key(x, y)); return (!!k && !LOW[k.kind || k]) || (B.smoky && B.smoky(x, y)); };
  // The board is cut from the 12x12 patch of the field map around the party, so every fight looks like where it
  // happens: the floor takes the colour of the ground there, and solid things on it become obstacles. Both
  // deployment zones are cleared, crowding is thinned, and every open square must connect.
  B.makeBoard = function (gid) {
    B.walls = new Map(); B.floor = null; B.srcTiles = null; B.voids = null; B.fixed = new Set(); B.makeTerrain(null);
    let h = 7; for (const ch of String(gid || '') + B.bg + (Field.p ? Field.p.x * 31 + Field.p.y : 0)) h = (h * 31 + String(ch).charCodeAt(0)) | 0;
    const rnd = rng(h), theme = (B.THEME[B.bg] || B.THEME.forest).block;
    B.connected = connected;
    const picked = B.pickShape(rnd);
    for (const shape of picked === 'square' ? ['square'] : [picked, 'square']) {
      B.walls = new Map(); B.voids = null; B.fixed = new Set(); B.shape = shape;
      B.setSize(shape === 'square' ? 12 : 14);
      if (B.brawl) { [[4, 0], [5, 0], [8, 11], [9, 11], [7, 1], [4, 10]].forEach(p => B.walls.set(key(p[0], p[1]), 'table')); B.fromMap(true); return; }
      if (B.buildBoard(shape, rnd, theme)) return;
    }
  };
  B.buildBoard = function (shape, rnd, theme) {
    const plan = B.SHAPES[shape] ? B.SHAPES[shape](rnd, B.bg) : null;
    if (plan) { B.applyShape(plan); if (!B.connected()) return false; }
    const m = !B.randomBoard && Field.map;
    if (m) B.fromMap(false, rnd);
    const extra = B.walls.size - B.fixed.size;
    if (!m || extra < 3) {                                              // open ground: add a few things of the place's kind
      const want = B.fixed.size + (plan ? 4 : 6) + Math.floor(rnd() * (plan ? 3 : 5));
      for (let i = 0, tries = 0; B.walls.size < want && tries < 300; tries++) {
        const x = 4 + Math.floor(rnd() * (4 + (N - 12) / 2)), y = Math.floor(rnd() * N), k = key(x, y);
        if (B.walls.has(k) || !B.inside(x, y) || B.fixed.has(k) || B.voidNear(x, y)) continue;
        B.walls.set(k, B.local || theme);
        if (!connected()) B.walls.delete(k);
      }
    }
    B.makeTerrain(rnd);
    if (plan && plan.terrain) for (const [x, y, kind] of plan.terrain) if (B.inside(x, y) && !B.wall(x, y)) B.terrain.set(key(x, y), kind);
    return !plan || B.shapeOk();
  };
  // Squares beside a missing one (the lip of a chasm or a pit) are kept clear of loose obstacles.
  B.voidNear = (x, y) => { if (!B.voids) return false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (B.voids.has(key(x + dx, y + dy))) return true; return false; };
  B.fromMap = function (floorOnly, rnd) {
    const m = Field.map; if (!m || !G.gfx.avgColor) return;
    const ox = m.w >= N ? G.clamp(Field.p.x - N / 2, 0, m.w - N) : Math.floor((m.w - N) / 2);
    const oy = m.h >= N ? G.clamp(Field.p.y - N / 2, 0, m.h - N) : Math.floor((m.h - N) / 2);
    const ground = m.def.ground || 'grass', counts = {};
    B.floor = []; B.srcTiles = [];
    for (let y = 0; y < N; y++) {
      const row = [], src = []; B.srcTiles.push(src);
      for (let x = 0; x < N; x++) {
        let t = Field.tile(ox + x, oy + y);
        if (!t || t === 'void') t = ground;
        const td = G.D.tiles[t] || {}, solid = td.solid; src.push(t);
        row.push(G.gfx.avgColor(solid || t === 'door' || t === 'doorStone' ? ground : t));
        if (floorOnly || !solid) continue;
        const kind = KIND[t] || (/wall|Top|Face|roof|timber|window|obsidian|niche|bars|kingdoor|throneBack|icewall/.test(t) ? 'wall' : 'rock');
        counts[kind] = (counts[kind] || 0) + 1;
        if (x < 4 || x > 7 + (N - 12) / 2) continue;                    // keep both deployment zones open
        const k = key(x, y); if (!B.inside(x, y) || B.fixed.has(k) || B.walls.has(k) || (B.shape !== 'square' && B.voidNear(x, y))) continue;
        B.walls.set(k, kind === 'wall' ? { kind, col: G.gfx.avgColor(t) } : kind);
      }
      B.floor.push(row);
    }
    B.local = Object.keys(counts).filter(k => k !== 'wall' && k !== 'water').sort((a, b) => counts[b] - counts[a])[0];
    if (floorOnly) return;
    const keys = [...B.walls.keys()].filter(k => !B.fixed.has(k)), cap = B.fixed.size ? 10 : 18;
    while (keys.length > cap) B.walls.delete(keys.splice(Math.floor(rnd() * keys.length), 1)[0]);   // thin a crowded patch
    for (let guard = 0; !connected() && guard < 60; guard++) { const ks = [...B.walls.keys()].filter(k => !B.fixed.has(k)); if (!ks.length) break; B.walls.delete(ks[Math.floor(rnd() * ks.length)]); }
  };

  /* ---------- deployment ---------- */
  B.setSize(12);
  const HERO_AT = { runa: [3, 4], dask: [3, 7], maren: [1, 5], finch: [1, 8] };
  B.movOf = function (u) {
    if (u.def && u.def.mov) return u.def.mov;
    if (u.side === 1 && (u.def.scale || 3) >= 4) return 2;
    return u.spd >= 4 ? 4 : u.spd <= 0 ? 2 : 3;
  };
  B.free = (x, y) => B.inside(x, y) && !B.wall(x, y) && !B.occupant(x, y);
  B.place = function (u, cols) {
    for (const x of cols) for (const y of ROWS) if (B.free(x, y)) { u.gx = x; u.gy = y; return; }
    // nothing free in those columns (a shaped board): the nearest free square to them, middle rows first
    let best = null, bv = 1e9;
    for (let x = 0; x < N; x++) for (const y of ROWS) if (B.free(x, y)) { const v = Math.min(...cols.map(c => Math.abs(c - x))) * 100 + ROWS.indexOf(y); if (v < bv) { bv = v; best = [x, y]; } }
    if (best) { u.gx = best[0]; u.gy = best[1]; }
  };
  B.deploy = function () {
    const party = B.c.filter(u => u.side === 0 && !u.guest);
    const off = (N - 12) / 2;
    party.forEach(u => { const p = HERO_AT[u.id]; if (p && B.free(p[0], p[1] + off)) { u.gx = p[0]; u.gy = p[1] + off; } else B.place(u, [2, 1, 3]); });
    B.c.filter(u => u.guest).forEach(u => B.place(u, [3, 2]));
    B.c.forEach(u => { u.mov = B.movOf(u); u.face = u.side === 0 ? 1 : -1; u.fdir = [u.face, 0]; });
  };
  B.placeFoe = function (u, entering) {
    const ranged = B.attackRange(u) > 1 || (u.def.scale || 3) >= 4 || (u.moves || []).some(m => m[1] !== 'attack' && G.D.abilities[m[1]] && G.D.abilities[m[1]].target !== 'self');
    const e = (N - 12) / 2, cols = B.brawl ? [6, 7] : entering ? [10 + e, 11 + e, 9 + e] : ranged ? [9 + e, 10 + e, 8 + e] : [8 + e, 9 + e, 10 + e];
    B.place(u, cols); u.mov = B.movOf(u); u.face = -1; u.fdir = [-1, 0];
  };

  /* ---------- movement and sight ---------- */
  // Squares u can finish a move on: Map key -> { x, y, d, prev }. Allies can be walked through, foes cannot.
  B.reach = function (u, mov) {
    // rough ground costs 2 (the first step is always allowed)
    const start = key(u.gx, u.gy), out = new Map([[start, { x: u.gx, y: u.gy, d: 0, prev: null }]]), q = [[u.gx, u.gy]];
    while (q.length) {
      let bi = 0; for (let i = 1; i < q.length; i++) if (out.get(key(q[i][0], q[i][1])).d < out.get(key(q[bi][0], q[bi][1])).d) bi = i;
      const [x, y] = q.splice(bi, 1)[0], cur = out.get(key(x, y));
      if (cur.d >= mov) continue;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy, k = key(nx, ny);
        if (!B.inside(nx, ny) || B.wall(nx, ny)) continue;
        if (dx && dy && B.wall(x + dx, y) && B.wall(x, y + dy)) continue;    // no squeezing between two blocks
        const o = B.occupant(nx, ny);
        if (o && B.living(o) && o.side !== u.side) continue;
        let nd = cur.d + B.stepCost(nx, ny); if (nd > mov) { if (cur.d === 0) nd = mov; else continue; }
        if (out.has(k) && out.get(k).d <= nd) continue;
        out.set(k, { x: nx, y: ny, d: nd, prev: key(x, y) }); q.push([nx, ny]);
      }
    }
    for (const [k, v] of out) { if (k === start) continue; if (B.occupant(v.x, v.y)) v.pass = true; }
    return out;
  };
  B.pathTo = function (map, k) { const p = []; for (let c = map.get(k); c; c = c.prev ? map.get(c.prev) : null) p.unshift([c.x, c.y]); return p; };
  B.los = function (a, b) {
    let x0 = a.gx, y0 = a.gy; const x1 = b.gx, y1 = b.gy, dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    for (;;) {
      if (x0 === x1 && y0 === y1) return true;
      const e2 = 2 * err; if (e2 > -dy) { err -= dy; x0 += sx; } if (e2 < dx) { err += dx; y0 += sy; }
      if (x0 === x1 && y0 === y1) return true;
      if (B.blocksSight(x0, y0)) return false;
    }
  };
  // Distance to the nearest foe of `side`, walking around blocks (ignores units). Used to approach.
  B.flow = function (side) {
    const d = new Map(), q = [];
    B.c.filter(u => B.living(u) && u.side !== side && !B.has(u, 'hidden')).forEach(u => { d.set(key(u.gx, u.gy), 0); q.push([u.gx, u.gy]); });
    while (q.length) {
      const [x, y] = q.shift(), cd = d.get(key(x, y));
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy, k = key(nx, ny);
        if ((dx || dy) && B.inside(nx, ny) && !B.wall(nx, ny) && !d.has(k)) { d.set(k, cd + 1); q.push([nx, ny]); }
      }
    }
    return d;
  };

  /* ---------- what an action can reach ----------
     spec: { self } | { unit: 'foe'|'ally'|'down', range, los } | { around: r, side } | { burst: r, range, side }.
     Abilities may set range, radius, leap (jump next to a target up to that far), dash (extra squares
     for this action), push (knock the target back), around (an area centred on the user). */
  B.attackRange = u => (u.def && u.def.range) || (B.hitStyle(u) === 'arrow' ? 6 : 1);
  B.spec = function (u, ab, isItem) {
    if (ab === 'shot') return { unit: 'foe', range: u.shot.range, los: true, shot: true };
    if (!ab) { const r = B.attackRange(u); return { unit: 'foe', range: r, los: r > 1, melee: r === 1 }; }
    const t = ab.target, fx = ab.fx || [], atk = fx.some(e => e.t === 'attack');
    if (t === 'self') return { self: true };
    if (t === 'enemy') { const r = ab.range || (atk ? B.attackRange(u) : 5); return { unit: 'foe', range: r, los: r > 1, melee: atk && r === 1, leap: ab.leap, dash: ab.dash }; }
    if (t === 'ally') return { unit: 'ally', range: ab.range || (isItem ? 1 : 4), notSelf: ab.notSelf };
    if (t === 'downAlly') return { unit: 'down', range: ab.range || 1 };
    if (t === 'allEnemies') return (atk && !ab.burst) || ab.around ? { around: ab.around || ab.radius || 1, side: 'foe', los: !!ab.radius && atk } : { burst: ab.radius || 1, range: ab.range || (isItem ? 4 : 5), side: 'foe' };
    if (t === 'allAllies') return { around: ab.radius || 3, side: 'ally' };
    if (t === 'party') return { around: ab.radius || 4, side: 'party' };
    return { self: true };
  };
  const sideOk = (u, t, side) => side === 'foe' ? t.side !== u.side && B.living(t) && !B.has(t, 'hidden')
    : side === 'ally' ? t.side === u.side && B.living(t) : side === 'down' ? t.side === u.side && t.down && !t.gone : t.side === u.side && !t.gone;
  // The units an action would affect if u stood at (sx, sy) and aimed at square (tx, ty).
  B.affected = function (u, spec, sx, sy, tx, ty) {
    const at = { gx: sx, gy: sy };
    if (spec.self) return [u];
    if (spec.unit) {
      const t = B.c.find(o => o.gx === tx && o.gy === ty && sideOk(u, o, spec.unit) && (o !== u || spec.unit !== 'foe'));
      if (!t || B.dist(at, t) > B.rangeFrom(spec, sx, sy) || (spec.los && !B.los(at, t))) return [];
      return [t];
    }
    if (spec.around != null) return B.c.filter(o => sideOk(u, o, spec.side) && B.dist(at, o) <= spec.around && (!spec.los || B.los(at, o)) && (o !== u || spec.side !== 'foe'));
    if (spec.burst != null) {
      const c = { gx: tx, gy: ty };
      if (B.dist(at, c) > B.rangeFrom(spec, sx, sy) || !B.los(at, c)) return [];
      return B.c.filter(o => sideOk(u, o, spec.side) && B.dist(c, o) <= spec.burst);
    }
    return [];
  };
  // Every way to use an action this turn: [{ sx, sy, tx, ty, path, targets }].
  B.options = function (u, spec, moved) {
    const out = [];
    const stands = moved ? new Map([[key(u.gx, u.gy), { x: u.gx, y: u.gy, d: 0, prev: null }]]) : B.reach(u, Math.max(0, u.mov + (spec.dash || 0) - (B.has(u, 'weak') ? 1 : 0)));
    const standList = [...stands.entries()].filter(([k, v]) => !v.pass);
    if (spec.self) return [{ sx: u.gx, sy: u.gy, tx: u.gx, ty: u.gy, path: [], targets: [u] }];
    if (spec.around != null) {
      for (const [k, v] of standList) { const t = B.affected(u, spec, v.x, v.y); out.push({ sx: v.x, sy: v.y, tx: v.x, ty: v.y, path: B.pathTo(stands, k), targets: t }); }
      return out;
    }
    if (spec.unit) {
      const pool = B.c.filter(o => sideOk(u, o, spec.unit) && !(o === u && (spec.unit === 'foe' || spec.notSelf)));
      for (const t of pool) {
        let best = null;
        if (spec.leap && !moved) {                                      // Shadowstep: appear beside the target
          if (B.dist(u, t) <= spec.leap) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const x = t.gx + dx, y = t.gy + dy;
            if ((dx || dy) && B.free(x, y)) { const sc = -Math.abs(x - u.gx) - Math.abs(y - u.gy); if (!best || sc > best.sc) best = { sc, sx: x, sy: y, path: [[u.gx, u.gy], [x, y]], leap: true }; }
          }
          if (B.dist(u, t) <= 1) best = { sc: 0, sx: u.gx, sy: u.gy, path: [] };
        } else for (const [k, v] of standList) {
          const at = { gx: v.x, gy: v.y };
          if (B.dist(at, t) > B.rangeFrom(spec, v.x, v.y) || (spec.los && !B.los(at, t))) continue;
          let sc = -v.d * 2 + (B.high(v.x, v.y) ? 2 : 0) - (B.ter(v.x, v.y) === 'fire' ? 12 : 0) - (B.ter(v.x, v.y) === 'hallowed' && (u.tags || []).includes('undead') ? 8 : 0) - (u.side === 0 && B.marked(v.x, v.y) ? 25 : 0);
          if (spec.melee && spec.unit === 'foe' && B.flanked(u, t, v.x, v.y)) sc += 5;
          if (v.d) sc -= 7 * B.provokes(u, B.pathTo(stands, k)).length;
          if (!spec.melee && spec.unit === 'foe') sc += Math.min(3, B.nearestFoe(u, v.x, v.y));
          if (!best || sc > best.sc) best = { sc, sx: v.x, sy: v.y, path: B.pathTo(stands, k) };
        }
        if (best) out.push({ sx: best.sx, sy: best.sy, tx: t.gx, ty: t.gy, path: best.path, targets: [t], leap: best.leap });
      }
      return out;
    }
    if (spec.burst != null) {
      const seen = new Map();
      for (const [k, v] of standList) for (let ty = 0; ty < N; ty++) for (let tx = 0; tx < N; tx++) {
        if (!B.inside(tx, ty)) continue;
        const tk = key(tx, ty); if (seen.has(tk) && seen.get(tk).d <= v.d) continue;
        const tg = B.affected(u, spec, v.x, v.y, tx, ty);
        if (!tg.length && !(v.x === u.gx && v.y === u.gy && B.dist(u, { gx: tx, gy: ty }) <= spec.range && B.los(u, { gx: tx, gy: ty }))) continue;
        seen.set(tk, { d: v.d, o: { sx: v.x, sy: v.y, tx, ty, path: B.pathTo(stands, k), targets: tg } });
      }
      for (const v of seen.values()) out.push(v.o);
      return out;
    }
    return out;
  };
  B.nearestFoe = function (u, x, y) {
    let d = 99; B.c.forEach(o => { if (B.living(o) && o.side !== u.side) d = Math.min(d, Math.max(Math.abs(o.gx - x), Math.abs(o.gy - y))); });
    return d;
  };
  // Flanking: another of u's side already stands next to t (u attacking from x, y).
  B.flanked = function (u, t, x, y) {
    return B.c.some(o => o !== u && o.side === u.side && B.living(o) && B.dist(o, t) <= 1 && !(o.gx === x && o.gy === y));
  };

  /* ---------- moving ---------- */
  // Walking: anyone the walk leaves behind may take a free strike (tactics.js); the walk stops for it, then goes on.
  B.walk = async function (u, path, leap) {
    if (!path || path.length < 2) return;
    const pv = leap ? [] : B.provokes(u, path);
    if (!pv.length) return walkSeg(u, path, leap, true);
    let start = 0;
    for (let k = 0; k < pv.length;) {
      const i = pv[k].i, grp = []; while (k < pv.length && pv[k].i === i) grp.push(pv[k++].e);
      if (i > start) await walkSeg(u, path.slice(start, i + 1), false, false);
      start = i;
      for (const e of grp) {
        if (!B.living(u)) break; if (!B.canStrikeBack(e)) continue;
        e.aooRound = B.round; B.eventSeq++; B.float(e, 'Free strike!', '#ffb04a');
        await B.attack(e, u, { reach: 1, aoo: true, atkMod: -2 });
      }
      if (!B.living(u)) return;
    }
    await walkSeg(u, path.slice(start), false, true);
  };
  async function walkSeg(u, path, leap, final) {
    if (!path || path.length < 2) return;
    const last = path[path.length - 1];
    if (last[0] !== u.gx) u.face = last[0] > u.gx ? 1 : -1;
    { const pv = path[path.length - 2]; u.fdir = [Math.sign(last[0] - pv[0]), Math.sign(last[1] - pv[1])]; }
    if (!G.fast) {
      u.anim = { path, t0: G.time, per: B.pace(leap ? 260 : 110), leap };
      G.audio.sfx('move');
      await G.sleep((path.length - 1) * u.anim.per + (leap ? 120 : 30));
      u.anim = null;
    }
    u.gx = last[0]; u.gy = last[1];
    if (leap) B.addVfx({ k: 'burst', to: u, color: '#6a6a7a', n: 14 });
    if (final && B.ter(u.gx, u.gy) === 'fire') await B.burn(u, ' walks into the fire');
  }
  B.push = function (t, from, n) {
    if (t.down || (t.def && (t.def.scale || 3) >= 4)) return false;
    const dx = Math.sign(t.gx - from.gx), dy = Math.sign(t.gy - from.gy);
    let moved = 0;
    B.pushStop = null;
    for (let i = 0; i < n; i++) {
      const x = t.gx + dx, y = t.gy + dy; if (!B.free(x, y)) { B.pushStop = B.inside(x, y) ? 'slam' : B.inBounds(x, y) ? 'fall' : 'edge'; break; }
      t.gx = x; t.gy = y; moved++;
      if (i === n - 1 && B.ter(x, y) === 'ice' && n < 6) n++;          // on ice, they keep sliding
    }
    if (moved) { t.fx = { k: 'hit', t: G.time }; B.shakeT = G.time; }
    return moved > 0;
  };

  /* ---------- deciding (enemies, allies and the autopilot) ---------- */
  // Score one way of using an action. Higher is better; null = not worth doing.
  function score(u, ab, spec, o, pref) {
    const tg = o.targets;
    if (spec.self) return 1;
    if (!tg.length) return null;
    const harmful = spec.unit === 'foe' || spec.side === 'foe';
    let s = 0;
    if (harmful) {
      for (const t of tg) {
        s += 10 + (1 - t.hp / t.maxHp) * 6 + (B.has(t, 'taunt') ? 30 : 0) + (pref && pref.indexOf(t) >= 0 ? 12 : 0);
        if (spec.melee && B.flanked(u, t, o.sx, o.sy)) s += 4;
        if (u.sneak && B.flanked(u, t, o.sx, o.sy)) s += 6;
      }
    } else if (spec.unit === 'down' || spec.side === 'party') s = tg.filter(t => t.down).length * 20 + tg.length;
    else s = tg.reduce((a, t) => a + (1 - t.hp / t.maxHp) * 10 + 2, 0) + (pref && tg.some(t => pref.indexOf(t) >= 0) ? 8 : 0);
    s -= (o.path ? Math.max(0, o.path.length - 1) : 0) * 0.3;
    if (B.ter(o.sx, o.sy) === 'fire') s -= 15;                          // keep out of the flames
    if (u.side !== 1 && B.marked(o.sx, o.sy)) s -= 25;                  // and out of a boss's marked blow
    if (B.high(o.sx, o.sy)) s += 1;
    if (!spec.melee && u.side !== undefined) s += Math.min(2, B.nearestFoe(u, o.sx, o.sy)) * 0.8;
    return s;
  }
  B.bestUse = function (u, ab, pref, isItem, moved) {
    const spec = B.spec(u, ab, isItem);
    let best = null;
    for (const o of B.options(u, spec, moved)) {
      const s = score(u, ab, spec, o, pref);
      if (s == null) continue;
      if (spec.burst != null && (spec.side === 'foe') && o.targets.length === 0) continue;
      if (!best || s > best.s) best = Object.assign({ s, spec }, o);
    }
    return best;
  };
  // The better of a melee strike and a ranged shot (bow, thrown axe or knives) this turn.
  B.weaponUse = function (u, pref) {
    const m = B.bestUse(u, null, pref, false, false), s = u.shot ? B.bestUse(u, 'shot', pref, false, false) : null;
    if (s) s.s += (u.shot.prefer ? 4 : 0) + (u.engage && s.targets[0] && B.flanked(u, s.targets[0], s.sx, s.sy) ? 3 : 0) - (u.melee && u.melee.dmg > 0 ? 3 : 0);
    if (m && u.melee && u.melee.dmg < 0) m.s -= 3;
    const best = !s ? m : !m ? s : s.s > m.s ? s : m;
    return best ? toAct(u, best, best === s ? 'shot' : 'attack') : null;
  };
  // Move toward the fight: melee closes in, others keep a square or two of distance.
  B.approach = function (u, keepAway) {
    const flow = B.flow(u.side), map = B.reach(u, Math.max(1, u.mov - (B.has(u, 'weak') ? 1 : 0)));
    let best = null;
    for (const [k, v] of map) {
      if (v.pass) continue;
      const d = flow.has(k) ? flow.get(k) : 99, want = (keepAway ? Math.abs(d - keepAway) * 2 + (d < 2 ? 6 : 0) : d) + (B.ter(v.x, v.y) === 'fire' ? 8 : 0) + (B.ter(v.x, v.y) === 'hallowed' && (u.tags || []).includes('undead') ? 6 : 0) + (u.side !== 1 && B.marked(v.x, v.y) ? 20 : 0) - (B.high(v.x, v.y) ? 0.5 : 0);
      const sc = -want - v.d * 0.05 - (v.d ? 4 * B.provokes(u, B.pathTo(map, k)).length : 0);
      if (!best || sc > best.sc) best = { sc, k };
    }
    return best ? B.pathTo(map, best.k) : null;
  };
  const toAct = (u, use, type, extra) => Object.assign({ type, targets: use.targets, path: use.path, leap: use.leap, center: [use.tx, use.ty] }, extra);
  // Enemies and guests: pick a move from their list, then find where to stand.
  B.planAI = function (u) {
    const A = G.D.abilities;
    if (B.has(u, 'charmed')) {
      const mates = B.c.filter(o => o !== u && o.side === u.side && B.living(o));
      const opts = B.options(u, { unit: 'ally', range: 1 }, false).filter(o => o.targets[0] !== u && mates.indexOf(o.targets[0]) >= 0);
      if (opts.length) { const o = opts[0]; return toAct(u, o, 'attack'); }
    }
    const tries = [G.wpick(u.moves.map(m => [m[1], m[0]]))].concat(u.moves.map(m => m[1]), ['attack']);
    for (const id of tries) {
      const ab = id === 'attack' ? null : A[id];
      if (ab && ab.target === 'ally' && !B.allies(u).some(x => x.hp < x.maxHp * 0.7)) continue;
      if (ab && ab.target === 'self' && B.round > 1 && G.rand() < 0.5) continue;
      const use = B.bestUse(u, ab, null, false, false);
      if (!use) continue;
      return ab ? toAct(u, use, 'ability', { ab }) : toAct(u, use, 'attack');
    }
    const ranged = B.attackRange(u) > 1 || u.moves.some(m => m[1] !== 'attack' && A[m[1]] && A[m[1]].target === 'enemy');
    return { type: 'wait', path: B.approach(u, ranged ? 4 : 0) };
  };
  // The autopilot party (balance runs): ask B.autoAction what it wants, then make it happen on the board.
  B.planAuto = function (u) {
    B.noUse = new Set();
    for (let i = 0; i < 10; i++) {
      const want = B.autoAction(u);
      if (want.type === 'defend') break;
      if (want.type === 'attack') { const w = B.weaponUse(u, want.targets); if (w) { B.noUse = null; return w; } break; }
      const ab = want.type === 'ability' ? want.ab : want.type === 'item' ? G.D.items[want.id] : null;
      const use = B.bestUse(u, ab, want.targets, want.type === 'item', false);
      if (use) { B.noUse = null; return toAct(u, use, want.type, { ab: want.ab, id: want.id }); }
      if (want.type === 'attack') break;
      B.noUse.add(want.type === 'item' ? 'item:' + want.id : want.abId);
    }
    B.noUse = null;
    const atk = B.weaponUse(u, null);
    if (atk) return atk;
    const support = u.id === 'maren' || u.id === 'finch';
    return { type: 'defend', path: B.approach(u, support ? 3 : 0) };
  };
  B.aiTurn = async function (u) {
    if (await B.bossTurn(u)) return null;
    const pu = !u.guest && B.propChoice(u);
    if (pu) { await B.useProp(u, pu); B.refresh(); return null; }
    const plan = u.side === 0 && !u.guest ? B.planAuto(u) : B.planAI(u);
    if (plan.path) await B.walk(u, plan.path, plan.leap);
    if (plan.type === 'wait') return null;
    if (plan.type === 'defend') return B.exec(u, { type: 'defend' });
    return B.exec(u, plan);
  };

  /* ---------- the player's turn ---------- */
  B.ui = null;
  const posOf = o => key(o.sx, o.sy);
  // Shows squares on the board and lets the player pick one. Returns the chosen option or null.
  B.pickSquare = function (o) {
    if (G.autoPick) return Promise.resolve(o.options[0] || null);
    return new Promise(resolve => {
      const byKey = new Map(); o.options.forEach(op => { const k = key(op.tx, op.ty); if (!byKey.has(k)) byKey.set(k, op); });
      const startOp = o.start || o.options[0];
      const cur = startOp ? { x: startOp.tx, y: startOp.ty } : { x: o.unit.gx, y: o.unit.gy };
      B.ui = { valid: new Set(byKey.keys()), tint: o.tint, cur, area: null, spec: o.spec, unit: o.unit, standFor: k => byKey.get(k) };
      const hover = () => {
        const op = byKey.get(key(cur.x, cur.y));
        B.ui.area = op && o.areaOf ? o.areaOf(op) : null;
        B.ui.stand = op && (op.sx !== o.unit.gx || op.sy !== o.unit.gy) ? [op.sx, op.sy] : null;
        if (o.onHover) o.onHover(op, cur);
        const tk = key(cur.x, cur.y), tr = B.ter(cur.x, cur.y), pr = B.props && B.props.get(tk), hg = B.hangs && B.hangs.get(tk);
        if ((tr || pr || hg || B.marked(cur.x, cur.y)) && B.logEl) {                 // say what the ground there is like
          const bits = []; if (tr && B.TERRAIN[tr]) bits.push(B.TERRAIN[tr].name + ': ' + B.TERRAIN[tr].desc); if (pr) bits.push(B.PROP[pr].name + ': ' + B.PROP[pr].desc); if (hg) bits.push(B.HANG[hg].name + ' overhead: ' + B.HANG[hg].desc); if (B.marked(cur.x, cur.y)) bits.push('Marked: the boss is about to bring a blow down here.');
          const el = UI.el('div', 'l2 terr', UI.esc(bits.join(' '))); B.logEl.appendChild(el);
        }
      };
      const done = v => { UI.popModal(m); B.ui = null; B.pointer = null; resolve(v); };
      const m = {
        press(b) {
          const d = B.isIso() ? B.isoDir(b) : { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[b];
          if (d) { cur.x = G.clamp(cur.x + d[0], 0, N - 1); cur.y = G.clamp(cur.y + d[1], 0, N - 1); G.audio.sfx('move'); hover(); }
          else if (b === 'a') { const op = byKey.get(key(cur.x, cur.y)); if (op) { G.audio.sfx('select'); done(op); } else G.audio.sfx('error'); }
          else if (b === 'b') { G.audio.sfx('cancel'); done(null); }
        }
      };
      B.pointer = (x, y, click) => { if (!B.inside(x, y)) return; const moved = cur.x !== x || cur.y !== y; cur.x = x; cur.y = y; hover(); if (click && (!moved || byKey.has(key(x, y)))) m.press('a'); };
      UI.pushModal(m); hover();
    });
  };
  // A card on a piece: name, health, armour and conditions. Shows for a few seconds, or until the next tap.
  B.inspect = function (u) {
    clearTimeout(B.inspectT);
    if (B.inspectEl) { B.inspectEl.remove(); B.inspectEl = null; }
    B.inspected = u || null;
    if (!u) return;
    const pct = Math.max(0, u.hp) / u.maxHp, col = pct > 0.5 ? '#5ad07a' : pct > 0.25 ? '#e8c14a' : '#e85a4a';
    const el = UI.el('div', 'win inspect', '<div class="in-name">' + UI.esc(u.name) + (u.side === 1 ? '' : u.side === 2 ? ' <span class="dim">(ally)</span>' : '') + '</div>' +
      '<div class="in-bar"><i style="width:' + Math.round(pct * 100) + '%;background:' + col + '"></i></div>' +
      '<div>HP ' + u.hp + '/' + u.maxHp + ' · AC ' + (u.ac + B.mod(u, 'ac')) + ' · speed ' + (u.spd + B.mod(u, 'spd')) + '</div>' +
      (u.statuses.length ? '<div class="dim">' + UI.esc(B.statusLine(u)) + '</div>' : ''));
    document.getElementById('stage').appendChild(el); B.inspectEl = el;
    B.inspectT = setTimeout(() => B.inspect(null), 5000);
  };
  B.describe = function (t) {
    return t.name + '  HP ' + t.hp + '/' + t.maxHp + '  AC ' + (t.ac + B.mod(t, 'ac')) + (t.statuses.length ? '  · ' + B.statusLine(t) : '');
  };
  B.chance = function (u, t, sx, sy, atkMod, shot) {
    const at = { gx: sx, gy: sy }, helpless = B.has(t, 'asleep') || B.has(t, 'stunned');
    let bonus = u.atk + B.mod(u, 'atk') + (atkMod || 0) + (helpless ? 4 : 0);
    const melee = B.dist(at, t) <= 1, ranged = shot || !melee;
    if (B.flanked(u, t, sx, sy) && (melee || u.engage)) bonus += 2;
    if (ranged && B.c.some(o => B.living(o) && o.side !== u.side && B.dist(o, at) <= 1)) bonus -= 2;
    const prof = shot ? u.shot : melee ? u.melee : null; if (prof) bonus += prof.atk || 0;
    bonus += B.terrainMod(u, t, sx, sy, ranged).bonus + B.bondHit(u, sx, sy).bonus;
    const need = t.ac + B.mod(t, 'ac') + B.bondAc(t).bonus - bonus;
    return Math.round(100 * G.clamp((21 - need) / 20, 0.05, 0.95));
  };
  // Choose a target (and, if not moved yet, where to stand) for an attack, ability or item.
  B.aim = async function (u, ab, isItem, moved, onlyId) {
    const spec = B.spec(u, ab, isItem);
    let opts = B.options(u, spec, moved);
    if (onlyId) opts = opts.filter(o => o.targets.some(t => t.id === onlyId));
    if (spec.burst == null && spec.around == null) opts = opts.filter(o => o.targets.length);
    if (!opts.length) { G.audio.sfx('error'); B.setLog('Nothing in reach.', moved ? 'Move first, or pick another action.' : 'Nothing can be reached from here this turn.'); await G.sleep(700); return null; }
    if (spec.self) return opts[0];
    const harmful = spec.unit === 'foe' || spec.side === 'foe';
    let start = null;
    opts.forEach(o => { const sc = (o.targets.length * 10) - (o.path ? o.path.length : 0) + (o.sx === u.gx && o.sy === u.gy ? 3 : 0); if (!start || sc > start.sc) start = Object.assign({ sc }, o); });
    const name = ab === 'shot' ? u.shot.name : ab ? ab.name : 'Attack';
    return B.pickSquare({
      unit: u, spec, options: opts, start, tint: harmful ? 'foe' : 'ally',
      areaOf: op => spec.burst != null ? { c: [op.tx, op.ty], r: spec.burst } : spec.around != null ? { c: [op.sx, op.sy], r: spec.around } : null,
      onHover: (op, cur) => {
        if (!op) { const t = B.occupant(cur.x, cur.y); B.setLog(t ? B.describe(t) : name + ': pick a highlighted square.', t ? 'Out of reach.' : (ab ? ab.desc : 'Strike an enemy in reach.')); return; }
        if (B.ui) { B.ui.preview = harmful && op.targets.length === 1 ? B.preview(u, ab, op.targets[0], op.sx, op.sy) : null; B.ui.provokers = op.path && op.path.length > 1 && !op.leap ? B.provokes(u, op.path).map(p => p.e) : null; }
        if (spec.unit) {
          const t = op.targets[0], atk = !ab || ab === 'shot' || (ab.fx || []).some(e => e.t === 'attack');
          const shotNow = ab === 'shot', eng = B.flanked(u, t, op.sx, op.sy), mel = B.dist({ gx: op.sx, gy: op.sy }, t) <= 1;
          const pv = B.ui && B.ui.preview, prov = B.ui && B.ui.provokers ? B.ui.provokers.length : 0;
          B.setLog(B.describe(t), (harmful && pv ? B.previewText(pv) + (!u.sneak && eng && (mel || u.engage) ? ' · flanking +2' : '') : atk && harmful ? B.chance(u, t, op.sx, op.sy, ab && ab.fx && ab.fx[0] && ab.fx[0].atkMod, shotNow) + '% to hit' : (ab && ab.desc ? ab.desc : '')) + (op.path && op.path.length > 1 ? ' · moves first' : '') + (prov ? ' · ' + prov + ' free strike' + (prov > 1 ? 's' : '') + ' on the way' : ''));
        } else { const n = op.targets.length; B.setLog(name + ': ' + n + ' ' + (harmful ? (n === 1 ? 'enemy' : 'enemies') : (n === 1 ? 'ally' : 'allies')) + ' caught.', ab ? ab.desc : ''); }
      }
    });
  };
  B.playerTurn = async function (c) {
    if (B.guide && B.guide.length && B.guide[0].who === c.id) return B.guidedTurn(c, B.guide[0]);
    const A = G.D.abilities, I = G.D.items;
    let moved = false, acted = false, undo = null;
    for (;;) {
      if (moved && acted) return null;
      if (acted) undo = null;
      const canHit = !acted && B.options(c, B.spec(c, null), moved).some(o => o.targets.length);
      const canShoot = !acted && c.shot && B.options(c, B.spec(c, 'shot'), moved).some(o => o.targets.length);
      const hk = id => ({ hot: id, right: Menu.keyHint(id) });
      const items = [
        Object.assign({ label: c.shot && c.shot.prefer ? 'Rapier' : 'Attack', value: 'attack', disabled: acted }, hk('bt_attack')),
        ...(c.shot ? [Object.assign({ label: c.shot.name, value: 'shot', disabled: acted }, hk('bt_shot'))] : []),
        Object.assign({ label: 'Skills', value: 'ab', disabled: acted || !c.abilities.length }, hk('bt_skills')),
        Object.assign({ label: 'Items', value: 'item', disabled: acted }, hk('bt_items')),
        ...(B.usable(c).length ? [{ label: 'Use', value: 'use', disabled: acted }] : []),
        undo ? Object.assign({ label: 'Undo move', value: 'undo' }, hk('bt_undo')) : Object.assign({ label: 'Move', value: 'move', disabled: moved }, hk('bt_move')),
        Object.assign({ label: 'Defend', value: 'defend', disabled: acted }, hk('bt_defend')),
        Object.assign({ label: acted || moved || B.boss ? 'End turn' : 'Flee', value: acted || moved || B.boss ? 'end' : 'flee' }, hk('bt_end'))
      ];
      const iv = v => items.findIndex(it => it.value === v);
      const start = !acted && canShoot && (c.shot.prefer || !canHit) ? iv('shot') : !acted && canHit ? 0 : !moved ? iv('move') : items.length - 1;
      B.setLog(c.name + "'s turn." + (moved ? '' : ' Move ' + c.mov + '.'), B.statusLine(c) || 'Move and act once each, in either order.');
      B.ui = { show: !moved ? B.reach(c, Math.max(1, c.mov - (B.has(c, 'weak') ? 1 : 0))) : null, unit: c };
      const cmd = await UI.menu({ cls: 'bcmd', title: c.name, cancel: false, start, items });
      B.ui = null;
      if (cmd === 'move') {
        const map = B.reach(c, Math.max(1, c.mov - (B.has(c, 'weak') ? 1 : 0)));
        const opts = [...map.entries()].filter(([k, v]) => !v.pass).map(([k, v]) => ({ sx: v.x, sy: v.y, tx: v.x, ty: v.y, path: B.pathTo(map, k), targets: [] }));
        const flow = B.flow(0); let best = null;
        opts.forEach(o => { const d = flow.get(key(o.tx, o.ty)); const sc = -(d == null ? 99 : Math.abs(d - (c.id === 'maren' || c.id === 'finch' ? 3 : 1))); if (!best || sc > best.sc) best = Object.assign({ sc }, o); });
        const op = await B.pickSquare({ unit: c, spec: { move: true }, options: opts, start: best, tint: 'move', onHover: (o, cur) => { const t = B.occupant(cur.x, cur.y); const pv = o ? B.provokes(c, o.path).map(p => p.e) : []; if (B.ui) B.ui.provokers = pv; B.setLog(o ? 'Move here.' : t ? B.describe(t) : 'Out of reach.', o ? (o.path.length - 1) + ' of ' + c.mov + ' squares.' + (pv.length ? ' Leaving ' + pv.map(e => e.name).join(' and ') + (pv.length > 1 ? ' gives them' : ' gives it') + ' a free strike.' : '') : null); } });
        // a move can be taken back until the hero acts, unless something happened on the way (a free strike, fire)
        const before = { gx: c.gx, gy: c.gy, face: c.face, fdir: c.fdir, seq: B.eventSeq };
        if (op && op.path.length > 1) { await B.walk(c, op.path); moved = true; }
        else if (op) moved = true;
        undo = moved && op && op.path.length > 1 && B.eventSeq === before.seq && B.living(c) ? before : null;
      } else if (cmd === 'attack' || cmd === 'shot' || cmd === 'ab' || cmd === 'item') {
        let ab = null, isItem = false, id = null;
        if (cmd === 'ab') {
          id = await UI.menu({
            cls: 'bsub', title: c.st.res + ' ' + c.sp + '/' + c.maxSp,
            items: c.abilities.map(a => ({ label: A[a].name, right: A[a].once ? (c.usedOnce && c.usedOnce[a] ? 'used' : 'once') : B.cost(c, A[a]) + '', value: a, disabled: c.sp < B.cost(c, A[a]) || !!(A[a].once && c.usedOnce && c.usedOnce[a]) })),
            onMove: it => B.setLog(A[it.value].name, A[it.value].desc)
          });
          if (!id) continue; ab = A[id];
        } else if (cmd === 'item') {
          const ids = Object.keys(G.S.bag).filter(k => I[k] && I[k].fx && G.S.bag[k] > 0);
          id = await UI.menu({ cls: 'bsub', title: 'Items', items: ids.map(k => ({ label: I[k].name, right: '×' + G.S.bag[k], value: k })), onMove: it => B.setLog(I[it.value].name, I[it.value].desc) });
          if (!id) continue; ab = I[id]; isItem = true;
        }
        const op = await B.aim(c, cmd === 'shot' ? 'shot' : ab, isItem, moved);
        if (!op) continue;
        if (op.path && op.path.length > 1) { await B.walk(c, op.path, op.leap); moved = true; }
        const act = cmd === 'attack' || cmd === 'shot' ? { type: cmd, targets: op.targets } : cmd === 'ab' ? { type: 'ability', ab, targets: op.targets, center: [op.tx, op.ty] } : { type: 'item', id, targets: op.targets, center: [op.tx, op.ty] };
        await B.exec(c, act); acted = true;
        if (B.over()) return null;
      } else if (cmd === 'use') {
        const list = B.usable(c);
        const pick = await UI.menu({ cls: 'bsub', title: 'Use', items: list.map((p, i) => ({ label: p.label, value: i + 1 })), onMove: it => { const p = list[it.value - 1], d = (p.hang ? B.HANG : B.PROP)[p.kind]; B.ui = { cur: { x: p.x, y: p.y } }; B.setLog(d.name, d.desc); } });
        B.ui = null;
        if (!pick) continue;
        await B.useProp(c, list[pick - 1]); acted = true;
        if (B.over()) return null;
      } else if (cmd === 'undo' && undo) {
        c.gx = undo.gx; c.gy = undo.gy; c.face = undo.face; c.fdir = undo.fdir; moved = false; undo = null; G.audio.sfx('cancel');
      } else if (cmd === 'defend') { await B.exec(c, { type: 'defend' }); return null; }
      else if (cmd === 'flee') { const r = await B.exec(c, { type: 'flee' }); if (r === 'flee') return 'flee'; acted = true; }
      else if (cmd === 'end') return null;
    }
  };
  /* A guided turn (the tutorial brawl): only the taught command, ability and target can be chosen.
     step: { who, cmd: 'attack'|'ab', ab, enemy|ally (id), rig (forced d20), text, sub, targetSub, after: [line, sub] } */
  B.guidedTurn = async function (c, step) {
    const A = G.D.abilities, CMDS = ['attack', 'ab', 'item', 'move', 'defend', 'end'], LABELS = ['Attack', 'Skills', 'Items', 'Move', 'Defend', 'End turn'];
    for (;;) {
      B.setLog(step.text, step.sub, true);
      const cmd = await UI.menu({ cls: 'bcmd', title: c.name, cancel: false, start: CMDS.indexOf(step.cmd), items: CMDS.map((v, i) => ({ label: LABELS[i], value: v, disabled: v !== step.cmd })) });
      let ab = null;
      if (cmd === 'ab') {
        const id = await UI.menu({
          cls: 'bsub', title: c.st.res + ' ' + c.sp + '/' + c.maxSp, start: Math.max(0, c.abilities.indexOf(step.ab)),
          items: c.abilities.map(a => ({ label: A[a].name, right: A[a].cost + '', value: a, disabled: a !== step.ab })),
          onMove: it => B.setLog(A[it.value].name, A[it.value].desc, true)
        });
        if (!id) continue;
        ab = A[id];
      }
      B.setLog(step.text, step.targetSub || step.sub, true);
      const op = await B.aim(c, ab, false, false, step.ally || step.enemy);
      if (!op) continue;
      B.guide.shift();
      if (op.path && op.path.length > 1) await B.walk(c, op.path);
      if (step.rig) B.rig.push(step.rig);
      B.pendingAfter = step.after || null;
      return B.exec(c, cmd === 'attack' ? { type: 'attack', targets: op.targets } : { type: 'ability', ab, targets: op.targets });
    }
  };

  /* ---------- pointer: tap or click a square ---------- */
  B.tileAt = function (lx, ly) {
    [lx, ly] = B.toWorld(lx, ly);
    if (B.isIso()) return B.isoPick(lx, ly);
    const gx = Math.floor((lx - BX) / TW), gy = Math.floor((ly - BY) / TH);
    return B.inside(gx, gy) ? [gx, gy] : null;
  };
  window.addEventListener('load', () => {
    const st = document.getElementById('stage');
    if (!st) return;
    const at = e => { if (e.target.closest && e.target.closest('.win, .bview')) return null; const r = st.getBoundingClientRect(); return B.tileAt((e.clientX - r.left) / r.width * 320, (e.clientY - r.top) / r.height * 240); };
    st.addEventListener('pointermove', e => { if (G.scene !== 'battle') return; const t = at(e); B.hoverCell = t ? { x: t[0], y: t[1] } : null; if (t && B.pointer) B.pointer(t[0], t[1], false); });
    st.addEventListener('pointerleave', () => { B.hoverCell = null; });
    st.addEventListener('pointerdown', e => {
      if (G.scene !== 'battle') return;
      const t = at(e); if (!t) return;
      if (B.pointer) { e.preventDefault(); e.stopPropagation(); B.pointer(t[0], t[1], true); return; }
      // not aiming: a tap or click on anyone shows what you know of them; on empty ground it puts the card away
      const u = (B.c || []).find(o => !o.gone && !o.down && o.gx === t[0] && o.gy === t[1]);
      B.inspect(u || null);
    });
  });
})();
