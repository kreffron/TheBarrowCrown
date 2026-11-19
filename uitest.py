"""Interface checks with a real page and real input: holding C or F does not stop the game; the tutorial's skill check (the coat stand) can be played through
   with clicks alone, and its roll box says how to go on; Quit to title works during the tutorial and mid-game (save and
   quit, then Continue). Run: python3 tools/uitest.py"""
import asyncio
import os
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
async def menu_pick(pg, label):
    for i in range(14):
        sel = await pg.evaluate("(() => { const s = [...document.querySelectorAll('.menu .mi.sel .ml')].pop(); return s ? s.innerText : ''; })()")
        if sel.startswith(label): await pg.keyboard.press('z'); await pg.wait_for_timeout(400); return True
        await pg.keyboard.press('ArrowDown'); await pg.wait_for_timeout(120)
    return False
async def main():
    fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 960, 'height': 720}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' else None)
        await pg.goto('file://' + os.path.join(ROOT, 'dist', 'index.html')); await pg.wait_for_timeout(800)
        await pg.evaluate("localStorage.clear(); G.fast = true; G.press('a'); void 0"); await pg.wait_for_timeout(1500)
        # 0. holding C (switch leader) or F (ability) in the tutorial must not stop the game
        await pg.evaluate("G.fast = false; void 0")
        for k in ['c', 'c', 'f', 'c', 'c']:
            await pg.keyboard.down(k); await pg.wait_for_timeout(150); await pg.keyboard.up(k); await pg.wait_for_timeout(200)
            if await pg.evaluate("G.busy > 0 || G.modals.length > 0"):
                for j in range(6): await pg.keyboard.press('z'); await pg.wait_for_timeout(150)
        t1 = await pg.evaluate("G.time"); await pg.wait_for_timeout(300)
        if await pg.evaluate("G.time") <= t1: fails.append('the game loop stopped after holding C/F')
        await pg.evaluate("G.S.leader = 'runa'; void 0")
        # 1. the coat stand, with clicks only
        await pg.evaluate("G.fast = false; const p = Field.p; p.x = p.tx = 6; p.y = p.ty = 9; p.dir = 'down'; void 0"); await pg.wait_for_timeout(300)
        await pg.keyboard.press('z'); saw_hint = False
        for i in range(40):
            await pg.wait_for_timeout(350)
            if await pg.evaluate("G.busy === 0"): break
            if await pg.evaluate("!!document.querySelector('.dice')"):
                await pg.wait_for_timeout(900)
                saw_hint = saw_hint or await pg.evaluate("(() => { const h = document.querySelector('.dice .dhint'); return !!h && getComputedStyle(h).visibility === 'visible'; })()")
                await pg.mouse.click(480, 300); continue
            await pg.mouse.click(480, 660)
        if not await pg.evaluate("G.busy === 0 && !!G.flag('tut.checkTaught')"): fails.append('coat stand scene did not finish with clicks')
        if not saw_hint: fails.append('roll box shows no hint')
        # 2. quit to title during the tutorial
        await pg.keyboard.press('x'); await pg.wait_for_timeout(500)
        if not (await menu_pick(pg, 'Quit') and await menu_pick(pg, 'Quit')): fails.append('no quit option')
        await pg.wait_for_timeout(1200)
        if await pg.evaluate("G.scene") != 'title': fails.append('tutorial quit did not reach the title')
        # 3. mid-game: save, reload, continue, save and quit, continue
        await pg.evaluate("(() => { G.newGame(); G.S.flags.joined = 1; G.S.flags.tut = 0; G.S.map = 'brackenford'; G.S.x = 20; G.S.y = 10; G.slot = 2; G.save(2); })()")
        await pg.reload(); await pg.wait_for_timeout(1200)
        await menu_pick(pg, 'Continue'); await pg.wait_for_timeout(1500)
        await pg.evaluate("G.S.gold = 456; void 0")
        await pg.keyboard.press('x'); await pg.wait_for_timeout(500)
        await menu_pick(pg, 'Quit'); await menu_pick(pg, 'Save and quit'); await pg.wait_for_timeout(1200)
        if await pg.evaluate("G.scene") != 'title': fails.append('save and quit did not reach the title')
        await menu_pick(pg, 'Continue'); await pg.wait_for_timeout(1500)
        st = await pg.evaluate("({ scene: G.scene, busy: G.busy, gold: G.S.gold })")
        if st != {'scene': 'field', 'busy': 0, 'gold': 456}: fails.append('continue after save and quit: ' + str(st))
        await pg.keyboard.down('ArrowDown'); await pg.wait_for_timeout(400); await pg.keyboard.up('ArrowDown'); await pg.wait_for_timeout(300)
        if await pg.evaluate("Field.p.y") <= 10: fails.append('cannot move after continuing')
        print('FAILS:', fails, len(fails)); print('console:', errs[:5])
        await b.close()
        raise SystemExit(1 if fails or errs else 0)
asyncio.run(main())
