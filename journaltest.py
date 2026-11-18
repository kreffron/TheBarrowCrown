"""The journal (src/menu.js): every quest has a region; steps tick off as a quest moves on (and skipped steps are not
   shown as done); completed quests leave the open list for the Completed list; the unread dot clears once read.
   Saves screenshots of a quest page and the open list to $OUT (default /tmp). Run: python3 tools/journaltest.py"""
import asyncio
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('OUT', '/tmp')
exec(open(os.path.join(ROOT, 'tools', 'puzzletest.py')).read().split('async def main')[0])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 960, 'height': 720}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' else None)
        await pg.add_init_script('window.__NO_TITLE = true;')
        await pg.goto('file://' + os.path.join(ROOT, 'dist', 'index.html')); await pg.wait_for_timeout(300)
        await pg.evaluate(SETUP + HELP + '; G.autoPick = null; void 0')
        r = await pg.evaluate(r"""(async () => {
          const fails = [], ok = (n, v) => { if (!v) fails.push(n); }, Q = G.D.quests;
          for (const id in Q) { ok('region for ' + id, !!Menu.questRegion(id, 1)); for (const k in Q[id].stages) ok('region ' + id + ' ' + k, (G.D.REGIONS || []).indexOf(Menu.questRegion(id, +k)) >= 0); }
          G.newGame(); G.fast = true;
          await G.run([['quest', 'main', 1], ['quest', 'main', 2], ['quest', 'main', 4]]);
          ok('log keeps steps reached', JSON.stringify(Menu.questSteps('main')) === '[1,2,4]');
          const page = Menu.questPage('main');
          ok('earlier steps ticked', (page.match(/<s>/g) || []).length === 2 && /Now:/.test(page));
          ok('skipped step not shown', page.indexOf(UI.esc(Q.main.stages[3])) < 0);
          ok('region shown', /The Thane&#39;s Barrow|The Thane's Barrow/.test(page));
          await G.run([['quest', 'wood', 1]]); ok('new quest has the dot', Menu.questNew('wood'));
          Menu.questPage('wood'); ok('dot clears once read', !Menu.questNew('wood'));
          await G.run([['quest', 'wood', 2]]); ok('dot back on a new step', Menu.questNew('wood'));
          await G.run([['quest', 'wood', 3]]); ok('wood complete', Menu.questDone('wood'));
          ok('complete page has the outcome', /★/.test(Menu.questPage('wood')));
          await G.run([['quest', 'mush', 1], ['quest', 'lanterns', 1], ['quest', 'nest', 1], ['quest', 'grave', 1], ['quest', 'main2', 1]]);
          G.S.flags.chapter = 2;
          // old save: no log, stage 3 -> steps 1..3
          G.S.flags['q.tam'] = 2; ok('older saves: steps up to now', JSON.stringify(Menu.questSteps('tam')) === '[1,2]');
          return fails;
        })()""")
        # open the journal for real and screenshot the list and a quest page
        await pg.evaluate("G.fast = false; (async () => { await Field.enter('brackenford', null, { noFade: true, noSave: true, quiet: true }); })(); void 0")
        await pg.wait_for_timeout(800); await pg.keyboard.press('j'); await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(OUT, 'journal_list.png'))
        for i in range(12):
            t = await pg.evaluate("(document.querySelector('.sumhead') || {}).innerText || ''")
            if "Thane" in t: break
            await pg.keyboard.press('ArrowDown'); await pg.wait_for_timeout(120)
        await pg.screenshot(path=os.path.join(OUT, 'journal_quest.png'))
        heads = await pg.evaluate("[...document.querySelectorAll('.mhead')].map(e => e.innerText)")
        print('heads:', heads)
        print('FAILS:', r[:20], len(r)); print('console:', errs[:8])
        await b.close()
        raise SystemExit(1 if r or errs else 0)
asyncio.run(main())
