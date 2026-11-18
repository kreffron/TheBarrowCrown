"""Checks the three save slots (save, describe, find the latest) and the hero epilogue cards. Run: python3 tools/slottest.py"""
import asyncio
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
exec(open(os.path.join(ROOT, 'tools', 'puzzletest.py')).read().split('async def main')[0])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 960, 'height': 720}); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.add_init_script('window.__NO_TITLE = true;')
        await pg.goto('file://' + os.path.join(ROOT, 'dist', 'index.html')); await pg.wait_for_timeout(300)
        realsave = await pg.evaluate('0')
        await pg.evaluate('window.__realSave = G.save')
        await pg.evaluate(SETUP + HELP + '; void 0')
        await pg.evaluate('G.save = window.__realSave')
        r = await pg.evaluate(r"""(async () => {
          const out = []; localStorage.clear();
          G.newGame(); Object.assign(G.S.flags,{tut:1,joined:1,chapter:2}); G.S.level = 9; G.S.time = 3*3600000+720000; await Field.enter('saltmere', null, {noFade:true, noSave:true});
          G.slot = 1; out.push('save1 ' + G.save());
          G.S.level = 15; G.S.flags.chapter = 3; G.S.map = 'karrow'; await new Promise(r => setTimeout(r, 20)); out.push('save2 ' + G.save(2));
          out.push(G.slotLine(1)); out.push(G.slotLine(2)); out.push(G.slotLine(3)); G.slot = 2;
          out.push('latest ' + G.latestSlot() + ' level ' + G.loadSave().level);
          // the epilogue cards
          const cards = []; UI.card = async (t, s, l) => { cards.push(t + ' | ' + (s || '') + ' | ' + (l || []).join(' / ').slice(0, 90)); };
          Object.assign(G.S.flags, { ending: 1, camp2: 2, camp3: 2, camp4: 2, camp5: 4, 'bond.dask': 12, 'bond.maren': 5, 'bond.finch': 1 });
          G.auto = true; await G.run(G.D.scripts.epilogueHeroes, {});
          out.push(...cards);
          out.push('epilogue5 has heroes: ' + JSON.stringify(G.D.scripts.epilogue5).includes('epilogueHeroes'));
          return out.join('\n');
        })()""")
        print(r); print(errs)
        await b.close()
asyncio.run(main())
