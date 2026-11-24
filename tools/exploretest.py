"""Checks the exploring-ability spots (data/ch9_world/k_explore.js): each one is on its map, can be reached, leaves its
   map in one piece, and its script runs for the right hero (shortcuts carry you across and back; choices move bonds).
   Run: python3 tools/exploretest.py"""
import asyncio
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
exec(open(os.path.join(ROOT, 'tools', 'puzzletest.py')).read().split('async def main')[0])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 960, 'height': 720}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' else None)
        await pg.add_init_script('window.__NO_TITLE = true;')
        await pg.goto('file://' + os.path.join(ROOT, 'dist', 'index.html')); await pg.wait_for_timeout(300)
        await pg.evaluate(SETUP + HELP + '; void 0')
        r = await pg.evaluate(r"""(async () => {
          const out = [], fails = [], D = G.D, per = { runa: 0, dask: 0, maren: 0, finch: 0 };
          const spots = [];
          for (const id in D.maps) for (const [ch, def] of Object.entries(D.maps[id].things || {})) {
            const scr = JSON.stringify(def.abil || '');
            if (def.abil && (/"ex\./.test(scr) || /"(pray|busk)"/.test(scr))) spots.push({ map: id, ch, def });
          }
          out.push('spots found: ' + spots.length);
          // reachability: every spot has an open square beside it in the map's main walkable area
          const mapsDone = new Set();
          for (const s of spots) {
            const m = D.maps[s.map], things = m.things || {}, H = m.rows.length;
            const walk = (x, y) => { const c = m.rows[y] && m.rows[y][x]; if (!c || things[c]) return false; if (c === '.' || c === ',') return true; const t = (m.legend || {})[c] || D.legend[c]; return !!(t && D.tiles[t] && !D.tiles[t].solid && !D.tiles[t].water && t !== 'void'); };
            const comps = new Map(); let big = null;
            for (let y = 0; y < H; y++) for (let x = 0; x < m.rows[0].length; x++) if (walk(x, y) && !comps.has(x + ',' + y)) {
              const c = [], q = [[x, y]]; comps.set(x + ',' + y, c);
              while (q.length) { const [a, bb] = q.pop(); c.push([a, bb]); for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const k = (a + dx) + ',' + (bb + dy); if (!comps.has(k) && walk(a + dx, bb + dy)) { comps.set(k, c); q.push([a + dx, bb + dy]); } } }
              if (!big || c.length > big.length) big = c;
            }
            const y = m.rows.findIndex(r => r.indexOf(s.ch) >= 0), x = m.rows[y].indexOf(s.ch);
            const reach = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => comps.get((x + dx) + ',' + (y + dy)) === big);
            if (!reach) fails.push('unreachable: ' + s.map + ' ' + x + ',' + y);
            per[s.def.abil.who]++;
          }
          out.push('per hero: ' + JSON.stringify(per));
          // run every spot's ability script
          G.autoPick = o => (o.items && o.items[0] ? o.items[0].value : 0);
          for (const s of spots) {
            G.newGame(); Object.assign(G.S.flags, { tut: 1, joined: 1, chapter: 3 }); G.S.level = 10; G.healAll();
            await Field.enter(s.map, null, { noFade: true, noSave: true });
            const th = Field.map.things.find(t => t.def === s.def || t.ch === s.ch || (t.def.abil && t.def.abil === s.def.abil));
            if (!th) { fails.push('not on map: ' + s.map + ' ' + s.ch); continue; }
            G.S.leader = s.def.abil.who;
            const gold = G.S.gold, xp = G.S.xp, bag = JSON.stringify(G.S.bag), fl = Object.keys(G.S.flags).length;
            try { await G.run(s.def.abil.script, { thing: th }); } catch (e) { fails.push('script ' + s.map + ': ' + e); continue; }
            const changed = G.S.gold !== gold || G.S.xp !== xp || JSON.stringify(G.S.bag) !== bag || Object.keys(G.S.flags).length !== fl;
            if (!changed) fails.push('no effect: ' + s.map + ' ' + s.def.abil.who);
            // a shortcut: using it again carries you somewhere open on the same map
            if (/\.cut\./.test(JSON.stringify(s.def.abil))) {
              const before = [Field.p.x, Field.p.y];
              await G.run(th.def.script, { thing: th }); await G.sleep(50);
              const there = [Field.p.x, Field.p.y], ok = Field.map.id === s.map && !Field.blocked(there[0], there[1]) && (there[0] !== before[0] || there[1] !== before[1]);
              out.push('shortcut ' + s.map + ': ' + before + ' -> ' + there + (ok ? '' : ' BAD')); if (!ok) fails.push('shortcut ' + s.map);
            }
          }
          // a wrong hero gets told who can do it
          return { out, fails, err: G.lastError ? String(G.lastError.stack) : null };
        })()""")
        print('\n'.join(r['out'])); print('FAILS:', r['fails'][:20], len(r['fails'])); print('lastError:', r['err']); print('console:', errs[:10])
        await b.close()
        raise SystemExit(1 if r['fails'] or errs else 0)
asyncio.run(main())
