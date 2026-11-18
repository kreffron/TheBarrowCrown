/* The shape of a battlefield. Most fights are on the familiar 12x12 square; the rest are on a 14x14 board cut to a
   shape that suits the place: a forest clearing, a stream with fords, a chasm crossed by two bridges, a long hall, a
   cross of passages, a pit, a hill one side holds, a wall with gates, a bog, a shoreline. The same spot always
   gives the same shape (it is seeded by the place), so a fight feels like where it happens.
   A shape is a plan: { voids: squares that are not part of the board, walls: [x, y, kind] that belong to it (kept
   when the board is thinned), terrain: [x, y, kind] laid after the random patches }. */
(function () {
  const key = B.key;
  // How often each shape turns up, by setting. 'square' is the classic board.
  const WEIGHTS = {
    forest: { square: 3, clearing: 2, river: 2, hill: 1 },
    cave: { square: 2, chasm: 2, hall: 1, pit: 1, hill: 1 },
    crypt: { square: 2, hall: 2, cross: 2, pit: 1, gates: 1 },
    throne: { square: 1, hall: 2, cross: 2, pit: 1 },
    fen: { square: 2, bog: 3, river: 1, clearing: 1 },
    snow: { square: 2, river: 2, hill: 2, chasm: 1, clearing: 1 },
    city: { square: 2, gates: 2, cross: 1, hall: 1 },
    town: { square: 2, gates: 2, clearing: 1, cross: 1 },
    ash: { square: 2, pit: 2, chasm: 1, hill: 1 },
    sewer: { square: 2, hall: 2, cross: 1 },
    beach: { square: 2, shore: 3, clearing: 1 },
    tavern: { square: 1 }
  };
  B.SHAPE_NAMES = {
    square: 'Open ground', clearing: 'A clearing', river: 'A stream with fords', hill: 'A hill', chasm: 'A chasm and two bridges',
    hall: 'A long hall', cross: 'Crossing passages', pit: 'Around a pit', gates: 'A wall with gates', bog: 'A bog', shore: 'The shoreline'
  };
  B.pickShape = function (rnd) {
    const grp = B.boardGrp || {}, def = (Field.map && Field.map.def) || {};
    const forced = B.forceShape || grp.board || def.board;   // B.forceShape: for tests
    if (forced && (forced === 'square' || B.SHAPES[forced])) return forced;
    if (B.brawl || B.guide || B.CLASSIC) return 'square';
    // boss fights were balanced by hand on the 12x12 square, so they stay on it
    if (B.boss) return 'square';
    const w = WEIGHTS[B.bg] || WEIGHTS.forest;
    const total = Object.values(w).reduce((a, b) => a + b, 0);
    let r = rnd() * total;
    for (const k in w) { r -= w[k]; if (r < 0) return k; }
    return 'square';
  };

  // Lays a plan on the board. Plan walls and terrain squares are 'fixed': loose obstacles never go there.
  B.applyShape = function (plan) {
    B.voids = new Set((plan.voids || []).map(([x, y]) => key(x, y)));
    for (const [x, y, kind] of plan.walls || []) { if (!B.inside(x, y)) continue; const k = key(x, y); B.walls.set(k, kind); B.fixed.add(k); }
    for (const [x, y] of plan.terrain || []) B.fixed.add(key(x, y));
  };
  // Missing squares walled in by the board on every side (a pit, not the space round a hall): drawn dark.
  let pitFor, pitSet = new Set();
  B.pitVoids = function () {
    if (pitFor === B.voids) return pitSet;
    pitFor = B.voids; pitSet = new Set(); if (!B.voids) return pitSet;
    const outer = new Set(), q = [];
    for (const k of B.voids) { const [x, y] = k.split(',').map(Number); if (x === 0 || y === 0 || x === B.N - 1 || y === B.N - 1) { outer.add(k); q.push([x, y]); } }
    while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = key(x + dx, y + dy); if (B.voids.has(k) && !outer.has(k)) { outer.add(k); q.push([x + dx, y + dy]); } } }
    for (const k of B.voids) if (!outer.has(k)) pitSet.add(k);
    return pitSet;
  };
  // A board is fair if every open square connects and both sides have room to stand.
  B.shapeOk = function () {
    if (!B.connected()) return false;
    const room = (x0, x1) => { let n = 0; for (let x = x0; x <= x1; x++) for (let y = 0; y < B.N; y++) if (B.inside(x, y) && !B.wall(x, y)) n++; return n; };
    return room(0, 3) >= 10 && room(B.N - 5, B.N - 1) >= 10;
  };

  const R = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));
  const WALLCOL = { city: [112, 106, 98], town: [128, 112, 92], crypt: [92, 92, 108], throne: [70, 56, 84], cave: [90, 80, 70], sewer: [70, 82, 70] };
  const wallOf = bg => ({ kind: 'wall', col: WALLCOL[bg] || [96, 92, 104] });
  B.SHAPES = {
    // A rough circle of ground: the corners fall away.
    clearing(rnd) {
      const voids = [];
      for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) { const d = Math.hypot(x - 6.5, y - 6.5); if (d > 7.4 || (d > 6.6 && rnd() < 0.35)) voids.push([x, y]); }
      return { voids };
    },
    // A chasm down the middle, crossed by two bridges. Shove someone off the edge and they fall.
    chasm(rnd) {
      const voids = [], terrain = [], b1 = R(rnd, 2, 4), b2 = R(rnd, 9, 11);
      for (let y = 0; y < 14; y++) {
        if (y === b1 || y === b2) { terrain.push([6, y, 'bridge'], [7, y, 'bridge']); continue; }
        voids.push([6, y], [7, y]);
        if (Math.abs(y - b1) > 1 && Math.abs(y - b2) > 1) { if (rnd() < 0.4) voids.push([5, y]); if (rnd() < 0.4) voids.push([8, y]); }
      }
      return { voids, terrain };
    },
    // A long hall, eight squares deep: pillars down it, a water channel in a sewer, ragged walls in a cave.
    hall(rnd, bg) {
      const voids = [], walls = [], terrain = [];
      for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) if (y < 3 || y > 10) voids.push([x, y]);
      if (bg === 'sewer') {
        const c1 = R(rnd, 4, 5), c2 = R(rnd, 8, 9);
        for (let x = 3; x <= 10; x++) { if (x === c1 || x === c2) terrain.push([x, 7, 'bridge']); else walls.push([x, 7, 'water']); }
      } else if (bg === 'cave') {
        for (let x = 0; x < 14; x++) { if (rnd() < 0.45) voids.push([x, 3]); if (rnd() < 0.45) voids.push([x, 10]); }
      } else {
        for (const x of [5, 8]) for (const y of [4, 9]) walls.push([x, y, 'pillar']);
      }
      return { voids, walls, terrain };
    },
    // Two passages crossing: the four corners are solid rock or masonry.
    cross() {
      const voids = [];
      for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) if ((x < 4 || x > 9) && (y < 4 || y > 9)) voids.push([x, y]);
      return { voids };
    },
    // A pit in the middle; in the ash country its lip is burning.
    pit(rnd, bg) {
      const voids = [], terrain = [];
      for (let y = 5; y <= 8; y++) for (let x = 5; x <= 8; x++) if (!((x === 5 || x === 8) && (y === 5 || y === 8))) voids.push([x, y]);
      if (bg === 'ash') for (const [x, y] of [[4, 6], [9, 7], [6, 4], [7, 9]]) if (rnd() < 0.7) terrain.push([x, y, 'fire']);
      for (const [x, y] of [[0, 0], [13, 0], [0, 13], [13, 13]]) voids.push([x, y]);
      return { voids, terrain };
    },
    // A hill that one side holds: high ground across its end of the board, a broken slope below it.
    hill(rnd) {
      const voids = [], terrain = [], ours = rnd() < 0.4, x0 = ours ? 0 : 10, x1 = ours ? 3 : 13, slope = ours ? 4 : 9;
      for (let x = 0; x < 14; x++) { voids.push([x, 0]); if (rnd() < 0.5) voids.push([x, 1]); if (rnd() < 0.3) voids.push([x, 13]); }
      for (let y = 2; y <= 11; y++) {
        for (let x = x0; x <= x1; x++) terrain.push([x, y, 'high']);
        if (rnd() < 0.6) terrain.push([slope, y, 'rough']);
      }
      return { voids, terrain };
    },
    // A wall across the field with two gates; a fence of crates and barrels in a town.
    gates(rnd, bg) {
      const walls = [], terrain = [], g1 = R(rnd, 2, 5), g2 = R(rnd, 8, 11), x = 6 + (rnd() < 0.5 ? 0 : 1);
      for (let y = 0; y < 14; y++) {
        if (y === g1 || y === g2) continue;
        walls.push([x, y, bg === 'town' ? (y % 3 === 0 ? 'barrel' : y % 3 === 1 ? 'crate' : 'fence') : wallOf(bg)]);
      }
      return { walls, terrain };
    },
    // A stream across the field with fords; frozen over in the snow (ice, with a hole or two).
    river(rnd, bg) {
      const walls = [], terrain = [], frozen = bg === 'snow';
      let cx = R(rnd, 6, 7); const rows = [];
      for (let y = 0; y < 14; y++) { rows.push(cx); cx = Math.max(5, Math.min(8, cx + R(rnd, -1, 1))); }
      const fords = new Set([R(rnd, 1, 3), R(rnd, 6, 7), R(rnd, 10, 12)]);
      rows.forEach((c, y) => {
        for (const x of [c, c + 1]) {
          if (frozen) terrain.push([x, y, rnd() < 0.12 ? 'shallows' : 'ice']);
          else if (fords.has(y)) terrain.push([x, y, 'shallows']);
          else walls.push([x, y, 'water']);
        }
      });
      if (frozen) for (const y of [R(rnd, 3, 5), R(rnd, 8, 10)]) walls.push([rows[y], y, 'water']);
      return { walls, terrain };
    },
    // Pools of black water among the reeds, shallows around them.
    bog(rnd) {
      const walls = [], terrain = [], taken = new Set();
      for (let p = 0; p < 6; p++) {
        const x0 = R(rnd, 4, 9), y0 = R(rnd, 1, 12), size = R(rnd, 2, 4);
        let x = x0, y = y0;
        for (let i = 0; i < size; i++) {
          const k = key(x, y);
          if (!taken.has(k) && x >= 4 && x <= 9 && y >= 0 && y < 14) { taken.add(k); walls.push([x, y, 'water']); }
          if (rnd() < 0.5) x += rnd() < 0.5 ? 1 : -1; else y += rnd() < 0.5 ? 1 : -1;
        }
      }
      for (const [x, y] of walls) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = key(x + dx, y + dy); if (!taken.has(k) && rnd() < 0.5 && x + dx >= 3 && x + dx <= 10) { taken.add(k); terrain.push([x + dx, y + dy, 'shallows']); }
      }
      return { walls, terrain };
    },
    // The sea along one side, shallows where the waves come in.
    shore(rnd) {
      const walls = [], terrain = [], top = rnd() < 0.5;
      for (let x = 0; x < 14; x++) {
        const line = 10 + Math.round(Math.sin(x * 0.7 + rnd()) * 1.2);
        for (let y = 0; y < 14; y++) {
          const d = top ? (13 - line) - y : y - line;
          if (d > 0) walls.push([x, y, 'water']); else if (d > -2) terrain.push([x, y, 'shallows']);
        }
      }
      return { walls, terrain };
    }
  };
})();
