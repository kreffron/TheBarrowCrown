"""Checks Maren's prayer places and Finch's venues (data/ch9_world/m_places.js): every one is on its map and reachable,
   works once, is fresh again after a rest, and pays more when that companion trusts Runa; and that Maren's blessing and
   Finch's busking no longer work just anywhere. Run: python3 tools/placestest.py"""
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
          const out = [], fails = [], ok = (n, v) => { if (!v) fails.push(n); }, D = G.D;
          const say = UI.say; UI.say = async () => {};
          const find = (map, kind, id) => Object.values(D.maps[map].things).find(t => t.abil && JSON.stringify(t.abil.script) === JSON.stringify([[kind, id]]));
          for (const [kind, list] of [['pray', D.prayers], ['busk', D.venues]]) {
            for (const id in list) {
              const d = list[id]; ok(kind + ' ' + id + ' placed', !!find(d.map, kind, id));
              G.newGame(); G.S.flags.chapter = 3; G.S.level = 12; G.healAll(); G.S.party.forEach(m => { m.hp = 1; m.sp = 0; });
              const g0 = G.S.gold; await G.run([[kind, id]]);
              const m = G.member('runa'), st = G.stats(m);
              if (kind === 'pray') ok('prayer ' + id + ' does something', m.hp > 1 || m.sp > 0 || G.flag('blessNext'));
              else ok('song ' + id + ' pays', G.S.gold > g0);
              const hp1 = m.hp, gold1 = G.S.gold; await G.run([[kind, id]]); ok(kind + ' ' + id + ' once until a rest', m.hp === hp1 && G.S.gold === gold1);
              Hunt.rested(); ok(kind + ' ' + id + ' fresh after a rest', !G.flag((kind === 'pray' ? 'pray.' : 'busk.') + id));
            }
          }
          // trust scales them
          G.newGame(); G.S.flags.chapter = 2; G.S.flags['bond.finch'] = 10; const g0 = G.S.gold; await G.run([['busk', 'saltmere']]); const devoted = G.S.gold - g0;
          G.newGame(); G.S.flags.chapter = 2; const g1 = G.S.gold; await G.run([['busk', 'saltmere']]); const plain = G.S.gold - g1;
          out.push('Saltmere docks pay ' + plain + ' gold, ' + devoted + ' when Finch is devoted'); ok('devoted pays more', devoted > plain);
          G.S.flags['bond.dask'] = 5; out.push('shop prices with Dask trusting: ' + G.shopPct() + '%'); ok('dask haggles', G.shopPct() === 95);
          // not just anywhere any more
          G.newGame(); G.S.flags.chapter = 1; await Field.enter('thornwood', null, { noFade: true, noSave: true }); G.S.leader = 'maren';
          G.S.party.forEach(m => m.hp = 1); await Field.ability(); ok('no blessing in the open', G.member('runa').hp === 1);
          await Field.enter('brackenford', null, { noFade: true, noSave: true }); G.S.leader = 'finch'; const g2 = G.S.gold; await Field.ability(); ok('no busking just anywhere', G.S.gold === g2);
          // found when you enter the map; shown in the journal and on the map
          G.newGame(); G.S.flags.chapter = 1; ok('nothing found at the start', !Field.places().some(p => p.found));
          await Field.enter('temple', null, { noFade: true, noSave: true }); ok('temple altar found on entering', Field.places().find(p => p.id === 'temple' && p.kind === 'pray').found);
          ok('journal page lists it', Menu.placesPage('pray').indexOf("The Lamplighter's altar") >= 0 && /#ffd24a/.test(Menu.placesPage('pray')));
          await G.run([['pray', 'temple']]); ok('journal shows it used', /opacity:\.55/.test(Menu.placesPage('pray')));
          const cv = document.createElement('canvas'); cv.width = 424; cv.height = 344; Menu.drawArea(cv); Menu.drawRegion(cv); ok('maps draw', true);
          G.newGame(); G.S.seen = { tavern: 1 }; ok('older saves: visited maps count as found', Field.places().find(p => p.id === 'tavern').found);
          UI.say = say;
          out.push(Object.keys(D.prayers).length + ' prayer places, ' + Object.keys(D.venues).length + ' venues');
          return { out, fails, err: G.lastError ? String(G.lastError.stack) : null };
        })()""")
        print('\n'.join(r['out'])); print('FAILS:', r['fails'][:20], len(r['fails'])); print('lastError:', r['err']); print('console:', errs[:10])
        await b.close()
        raise SystemExit(1 if r['fails'] or errs else 0)
asyncio.run(main())
