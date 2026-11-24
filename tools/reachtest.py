"""Walks the whole game from the new-game start: through every door and stair (each fires the moment it is stepped
   on, so one standing in a corridor seals what lies past it) and every story move. Anything that can be cleared out
   of the way counts as passable: foes, wanderers, people, puzzle pieces, doors that open, things that come and go
   with the story. Then it lists every map never reached, and every door, chest, person, sign or pickup the party can
   never stand beside. A few are meant to be out of reach (cutscene maps, shopkeepers behind counters, prisoners in
   cells); anything else fails.  Run: python3 tools/reachtest.py"""
import os, re, json, asyncio
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'tools', 'playtest.py')).read()
SETUP = re.search(r'SETUP = r"""(.*?)"""', src, re.S).group(1)
from playwright.async_api import async_playwright
TRACE = r"""
G.autoPick = null; G.newGame(); const wait = ms => new Promise(r => setTimeout(r, ms)); Object.assign(G.S.flags, {tut:1, joined:1}); G.fast = true; G.auto = true;
const D = G.D, info = {};
const clearable = d => d.type === 'foe' || d.type === 'roamer' || d.type === 'npc' || d.type === 'pz' || d.pz || d.abil || d.if || d.unless || (d.script && JSON.stringify(d.script).includes('"remove"'));
for (const id of Object.keys(D.maps)) {
  try { await Promise.race([Field.enter(id, null, {noFade:true, noSave:true, quiet:true}), wait(1500)]); } catch (e) { continue; }
  const m = Field.map; if (!m || m.id !== id) continue;
  const pass = []; for (let y = 0; y < m.h; y++) { pass.push([]); for (let x = 0; x < m.w; x++) { const th = m.things.find(t => t.x === x && t.y === y && t.def.type !== 'warp'); pass[y].push(th ? (clearable(th.def) || !Field.isSolid(th)) && !(Field.tile && 0) && (!Field.blocked(x, y) || clearable(th.def)) : !Field.blocked(x, y)); } }
  info[id] = { w: m.w, h: m.h, pass, things: m.things.map(t => ({ x: t.x, y: t.y, ch: t.ch, d: t.def, key: t.key })) };
}
// every story move anywhere in the data
const storyWarps = []; const walk = v => { if (Array.isArray(v)) { if (v[0] === 'warp' && typeof v[1] === 'string') storyWarps.push([v[1], v[2]]); v.forEach(walk); } else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
walk(D);
const arrive = (id, at) => { const I = info[id]; if (!I) return null; if (at && typeof at === 'object') return [at.x, at.y]; const all = I.things.filter(t => t.ch === at); if (!all.length) return null; const t = all[Math.floor((all.length - 1) / 2)]; const DV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }; const o = t.d.out ? DV[t.d.out] : [0, 0]; return [t.x + o[0], t.y + o[1]]; };
const reached = {}, queue = [], badSeed = [];
const seed = (id, at, why) => { const p = arrive(id, at); if (!p) { if (info[id]) badSeed.push(id + '@' + at + ' (' + why + ')'); return; } queue.push([id, p[0], p[1]]); };
seed(D.start.map, D.start.at, 'start'); for (const [m, at] of storyWarps) seed(m, at, 'story');
while (queue.length) {
  const [id, sx, sy] = queue.shift(), I = info[id], R = reached[id] || (reached[id] = new Set());
  if (R.has(sx + ',' + sy)) continue;
  const q = [[sx, sy]]; R.add(sx + ',' + sy);
  while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (nx < 0 || ny < 0 || nx >= I.w || ny >= I.h || R.has(k)) continue; const w = I.things.find(t => t.x === nx && t.y === ny && t.d.type === 'warp'); if (w) { R.add(k); if (w.d.to) seed(w.d.to, w.d.at, id + ' warp'); continue; } if (!I.pass[ny][nx]) continue; R.add(k); q.push([nx, ny]); } }
}
const unreachedMaps = Object.keys(info).filter(id => !reached[id]);
const bad = [];
for (const id of Object.keys(reached)) { const I = info[id], R = reached[id]; for (const t of I.things) { if (!['warp', 'chest', 'npc', 'sign', 'pickup', 'obj'].includes(t.d.type)) continue; if (/\.~/.test(t.key || '')) continue;   /* farm animals and birds, wandering in their pens */ if (t.d.type === 'obj' && !t.d.script) continue; if (![[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => R.has((t.x + dx) + ',' + (t.y + dy)))) bad.push(id + ':' + t.d.type + (t.d.to ? '->' + t.d.to : '') + '@' + t.x + ',' + t.y); } }
return JSON.stringify({ maps: Object.keys(info).length, reached: Object.keys(reached).length, never: unreachedMaps, bad, badSeed });

"""
# out of reach on purpose
EXPECTED = [
    r'^v_',                                   # cutscene-only maps (visions, dreams, the road)
    r'^(tavern|h_inn|s_shop|k_shop|h_shop):npc@\d+,1$',     # shopkeepers and innkeepers, behind their counters
    r'^k_cells:npc@', r'^greyhold:npc@',     # prisoners, behind bars until a lever or a key
]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 640, 'height': 480}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.add_init_script('window.__NO_TITLE = true;')
        await pg.goto('file://' + os.path.join(ROOT, 'dist', 'index.html')); await pg.wait_for_timeout(300)
        await pg.evaluate(SETUP + '; T.lv = []; T.log = []; void 0')
        r = json.loads(await asyncio.wait_for(pg.evaluate('(async () => {' + TRACE + '})()'), 500))
        await b.close()
    ok = lambda s: any(re.search(e, s) for e in EXPECTED)
    fails = [m for m in r['never'] if not ok(m)] + [t for t in r['bad'] if not ok(t)] + ['no arrival marker: ' + s for s in r['badSeed']]
    print('maps', r['maps'], 'reached', r['reached'], '| expected out of reach:', len([m for m in r['never'] if ok(m)]) + len([t for t in r['bad'] if ok(t)]))
    for f in fails: print('  unreachable:', f)
    print('FAILS:', len(fails), '| page errors:', errs[:3])
asyncio.run(main())
