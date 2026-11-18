"""Random input, at normal speed, looking for anything that breaks the game: a page error, or the game loop stopping.
   Plays the opening and the tutorial (brawl included), then a stretch in several later places and in a fight.
   Run: python3 tools/monkeytest.py [seed] [steps per stretch]"""
import asyncio
import os
import random
import sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] * 4 + ['e'] * 6 + ['x', 'Escape', 'z', 'c', 'f', 'i', 'j', 'm', 'g', 'p', 'Shift', '1', '2', '3', '5', '6', '7', 'u', 'v', 't', '[', ']', 'h']
async def main():
    seed = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    steps = int(sys.argv[2]) if len(sys.argv) > 2 else 250
    rnd = random.Random(seed)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 960, 'height': 720}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' else None)
        await pg.add_init_script("window.__errs = []; window.addEventListener('error', e => window.__errs.push(String(e.error && e.error.stack || e.message).slice(0, 600)));")
        await pg.goto('file://' + os.path.join(ROOT, 'dist', 'index.html')); await pg.wait_for_timeout(900)
        await pg.evaluate("localStorage.clear(); void 0")
        async def alive():
            t1 = await pg.evaluate("G.time"); await pg.wait_for_timeout(250); return (await pg.evaluate("G.time")) > t1
        async def stretch(name, n):
            for i in range(n):
                k = rnd.choice(KEYS)
                if rnd.random() < 0.06:
                    await pg.mouse.click(rnd.randint(40, 920), rnd.randint(40, 700))
                elif k.startswith('Arrow') or k == 'Shift':
                    if k == 'Shift': await pg.keyboard.down('Shift'); k = rnd.choice(KEYS[:4])
                    await pg.keyboard.down(k); await pg.wait_for_timeout(rnd.choice([60, 160, 400])); await pg.keyboard.up(k); await pg.keyboard.up('Shift')
                else:
                    await pg.keyboard.down(k); await pg.wait_for_timeout(rnd.choice([30, 90, 200])); await pg.keyboard.up(k)
                await pg.wait_for_timeout(rnd.choice([20, 80, 200]))
                if await pg.evaluate("window.__errs.length") or errs: break
                if i % 50 == 49 and not await alive(): return name + ': game loop stopped at step ' + str(i)
            if not await alive(): return name + ': game loop stopped'
            return None
        problems = []
        # the opening and the tutorial, as a new player
        await pg.keyboard.press('e'); await pg.wait_for_timeout(1200)
        r = await stretch('opening + tutorial', steps * 2); problems += [r] if r else []
        print('after the tutorial stretch:', await pg.evaluate("({ scene: G.scene, map: G.S && G.S.map, tut: G.tutorial && G.tutorial(), joined: G.S && G.flag('joined') })"))
        # later places
        for m, ch in [('brackenford', 1), ('saltmere', 2), ('karrow', 3), ('highmoor', 4), ('ashfall', 5), ('smithdeep', 5)]:
            if await pg.evaluate("window.__errs.length") or errs: break
            await pg.evaluate("(async ([m, ch]) => { try { while (G.modals.length) UI.popModal(G.modals[G.modals.length - 1]); } catch (e) {} document.querySelectorAll('.title, .menu, .shade').forEach(e => e.remove()); G.fast = true; G.busy = 0; G.newGame(); const S = G.S; S.flags.joined = 1; S.flags.chapter = ch; S.level = 4 * ch; G.healAll(); S.gold = 500; S.bag = { draught: 3, greater: 2, tonic: 1 }; S.party.forEach(x => x.hp = Math.ceil(x.hp * 0.6)); await Field.exec(() => Field.enter(m, null, { noFade: true, noSave: true })); G.fast = false; })(%s)" % str([m, ch]).replace("'", '"'))
            r = await stretch(m, steps); problems += [r] if r else []
        # a fight, diamond view
        if not (await pg.evaluate("window.__errs.length") or errs):
            await pg.evaluate("(() => { G.fast = false; G.opts.bview = 'iso'; G.busy = 0; Field.exec(() => B.start('wood_wolves', {})); })()")
            await pg.wait_for_timeout(800)
            r = await stretch('battle', steps); problems += [r] if r else []
        jerrs = await pg.evaluate("window.__errs")
        print('problems:', problems); print('errors:', (jerrs + errs)[:4])
        await b.close()
        raise SystemExit(1 if problems or jerrs or errs else 0)
asyncio.run(main())
