"""Combat quips (src/quips.js, data/ch9_world/n_quips.js): every hero has lines for every kind; a real fight at normal
   speed puts up speech bubbles; fast mode and 'Party chatter: Off' put up none. Saves a screenshot with a bubble to $OUT (default /tmp).
   Run: python3 tools/quipstest.py"""
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
        r = await pg.evaluate(r"""(() => {
          const fails = [], ok = (n, v) => { if (!v) fails.push(n); }, Q = G.D.quips;
          const KINDS = ['start', 'boss', 'turn', 'hit', 'crit', 'miss', 'kill', 'hurt', 'low', 'allyDown', 'revived', 'healed', 'skill', 'win', 'flee'];
          for (const h of ['runa', 'dask', 'maren', 'finch']) { let n = 0; for (const k of KINDS) { ok(h + ' has ' + k, (Q[h][k] || []).length >= 3); n += (Q[h][k] || []).length; } ok(h + ' 50-100 lines', n >= 50 && n <= 100); }
          return fails;
        })()""")
        res = {}
        for name, chatter, fast in [('often', 'often', 'false'), ('off', 'off', 'false'), ('fast', 'often', 'true')]:
            await pg.evaluate("(() => { G.newGame(); G.S.level = 6; G.healAll(); G.opts.chatter = '%s'; G.fast = %s; G.auto = true; G.autoPick = () => 0; G.opts.bspeed = 'swift';"
                              " B.quipCount = 0; window.__r = 'running'; B.start('wood_wolves', {}).then(x => window.__r = x, e => window.__r = 'ERR ' + e.stack); })()" % (chatter, fast))
            shot = False
            for i in range(240):
                await pg.wait_for_timeout(500)
                st = await pg.evaluate("({ r: window.__r, n: B.quipCount || 0, over: !!(B.over && B.over()), bub: (B.bubbles || []).length })")
                if name == 'often' and st['bub'] and not shot:
                    await pg.screenshot(path=os.path.join(os.environ.get('OUT', '/tmp'), 'quips.png')); shot = True
                if st['r'] != 'running': break
                if st['over']: await pg.keyboard.press('Enter')
            res[name] = st
        print(res)
        fails = r + (['a live fight talks'] if res['often']['n'] < 2 else []) + (['chatter off is quiet'] if res['off']['n'] else []) + (['fast mode is quiet'] if res['fast']['n'] else [])
        fails += [k + ' finished' for k in res if res[k]['r'] != 'win']
        print('FAILS:', fails)
        r = {'fails': fails}
        print('console:', errs[:8])
        await b.close()
        raise SystemExit(1 if r['fails'] or errs else 0)
asyncio.run(main())
