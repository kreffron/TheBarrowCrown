import asyncio, json
exec(open('/tmp/bs/pztest.py').read().split('async def main')[0])
MAPS = json.load(open('/tmp/rev/mapch.json'))
JS = r"""((ids) => {
  const D = G.D, out = {};
  for (const id of ids) {
    const m = D.maps[id]; if (!m || !m.rows) { out[id] = { err: 'none' }; continue; }
    const things = m.things || {}, pz = Object.values(things).some(t => t && t.pz);
    const H = m.rows.length, W = m.rows[0].length;
    const tn = c => (m.legend || {})[c] || D.legend[c];
    const walk = (x, y) => { const c = m.rows[y] && m.rows[y][x]; if (!c) return false; if (things[c]) return false; if (c === '.' || c === ',') return true; const t = tn(c); return !!(t && D.tiles[t] && !D.tiles[t].solid && !D.tiles[t].water && t !== 'void'); };
    const thingAt = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = m.rows[y][x]; if (things[c]) thingAt.push([x, y, things[c].type || '']); }
    // biggest walkable area
    const seen = new Map(); let best = null;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (walk(x, y) && !seen.has(x + ',' + y)) {
      const comp = [], q = [[x, y]]; seen.set(x + ',' + y, comp);
      while (q.length) { const [a, b] = q.pop(); comp.push([a, b]); for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const k = (a + dx) + ',' + (b + dy); if (!seen.has(k) && walk(a + dx, b + dy)) { seen.set(k, comp); q.push([a + dx, b + dy]); } } }
      if (!best || comp.length > best.length) best = comp;
    }
    if (!best) { out[id] = { err: 'no ground' }; continue; }
    const inBest = new Set(best.map(p => p.join(',')));
    const connectedWithout = (bx, by) => { const start = best.find(p => p[0] !== bx || p[1] !== by); const s2 = new Set([start.join(',')]), q = [start];
      while (q.length) { const [a, b] = q.pop(); for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx = a + dx, ny = b + dy, k = nx + ',' + ny; if ((nx !== bx || ny !== by) && inBest.has(k) && !s2.has(k)) { s2.add(k); q.push([nx, ny]); } } }
      return s2.size === best.length - 1; };
    const cands = [];
    for (const [x, y] of best) {
      if (thingAt.some(([tx, ty]) => Math.max(Math.abs(tx - x), Math.abs(ty - y)) <= 2)) continue;
      const solidN = [[1,0],[-1,0],[0,1],[0,-1]].filter(([dx, dy]) => !walk(x + dx, y + dy) && !things[(m.rows[y + dy] || '')[x + dx]]).length;
      if (solidN < 1 || solidN > 2) continue;
      if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) continue;
      cands.push([x, y]);
    }
    // spread out: greedy farthest-point picking, checking each one does not cut the area in two
    const picks = [];
    const far = p => Math.min(...picks.map(q => Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1])), ...thingAt.map(t => (Math.abs(t[0] - p[0]) + Math.abs(t[1] - p[1])) * 0.6), 999);
    for (let k = 0; k < 6 && cands.length; k++) {
      cands.sort((a, b) => far(b) - far(a));
      let got = null; for (const c of cands.slice(0, 25)) if (connectedWithout(c[0], c[1])) { got = c; break; }
      if (!got) break; picks.push(got); cands.splice(cands.indexOf(got), 1);
    }
    out[id] = { W, H, pz, area: best.length, picks };
  }
  return out;
})"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(); await pg.add_init_script('window.__NO_TITLE = true;')
        await pg.goto('file:///home/claude/barrow-crown/dist/index.html'); await pg.wait_for_timeout(300)
        r = await pg.evaluate('(' + JS + ')(%s)' % json.dumps(list(MAPS.keys())))
        json.dump({k: dict(v, ch=MAPS[k]) for k, v in r.items()}, open('/tmp/rev/spots.json', 'w'))
        for k, v in r.items(): print(MAPS[k], k, 'PZ' if v.get('pz') else '', v.get('W'), 'x', v.get('H'), 'area', v.get('area'), 'picks', len(v.get('picks', [])), v.get('err', ''))
        await b.close()
asyncio.run(main())
