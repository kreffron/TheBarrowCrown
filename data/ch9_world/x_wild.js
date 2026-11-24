/* Where random fights happen. Out in the open country they only start in the wild cover (tall grass and ferns,
   reeds, snowdrifts, cinder fields), like walking through long grass: keep to open ground and the roads and you
   travel in peace; step into the cover to look for a fight. Underground there is no cover, so a random fight is just
   half as likely as it was (src/field.js). Roaming bands are unchanged: you can see them coming.
   This file paints extra patches of cover on the maps that had little: deterministic blobs on plain ground, kept
   clear of roads, doors and the things on the map. */
(function () {
  const D = G.D;
  D.WILD_TILES = { tallgrass: 1, fern: 1, cattail: 1, drift: 1, cinder: 1 };
  // how much of each map's open ground should be cover, and what it is
  const PAINT = { thornwood: ['ψ', 0.26], mirefen: ['¡', 0.24], frostpass: ['(', 0.24], ashroad: [null, 0] };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  for (const [id, [ch, want]] of Object.entries(PAINT)) {
    const d = D.maps[id]; if (!d || !ch) continue;
    const L = Object.assign({}, D.legend, d.legend || {}), rows = d.rows.map(r => r.split('')), h = rows.length, w = rows[0].length;
    const tileAt = (x, y) => { const c = rows[y][x]; return c === '.' ? d.ground : c === ',' ? (d.ground2 || d.ground) : (d.things && d.things[c]) ? null : L[c]; };
    const thingAt = (x, y) => !!(d.things && d.things[rows[y][x]]);
    let open = 0, cover = 0; const near = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const t = tileAt(x, y); if (thingAt(x, y)) { near.push([x, y]); continue; }
      if (!t || (D.tiles[t] || {}).solid) continue; open++; if (D.WILD_TILES[t]) cover++;
    }
    const PLAIN = { grass: 1, marsh: 1, mud: 1, snow: 1, ash: 1 };
    const plain = (x, y) => x > 0 && y > 0 && x < w - 1 && y < h - 1 && !thingAt(x, y) && PLAIN[tileAt(x, y)] && !near.some(([a, b]) => Math.abs(a - x) + Math.abs(b - y) < 3)
      && ![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => (D.tiles[tileAt(x + dx, y + dy)] || {}).safe);    // never up against a road
    const R = rng(id.length * 977 + 13);
    for (let tries = 0; tries < 400 && cover < open * want; tries++) {
      let x = 1 + Math.floor(R() * (w - 2)), y = 1 + Math.floor(R() * (h - 2)); if (!plain(x, y)) continue;
      const size = 6 + Math.floor(R() * 14);
      for (let i = 0; i < size; i++) {
        if (plain(x, y)) { rows[y][x] = ch; cover++; }
        const dir = Math.floor(R() * 4); x += [1, -1, 0, 0][dir]; y += [0, 0, 1, -1][dir];
      }
    }
    d.rows = rows.map(r => r.join(''));
  }
})();
