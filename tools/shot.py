#!/usr/bin/env python3
"""Loads the built page in headless Chrome, plays through key moments and saves screenshots."""
import asyncio, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/shots'

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 960, 'height': 720})
        errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') and 'willReadFrequently' not in m.text else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        await pg.goto('file://' + os.path.join(ROOT, 'dist', 'index.html'))
        await pg.wait_for_timeout(600)
        await pg.screenshot(path=OUT + '/01_title.png')
        await pg.evaluate("G.fast = true; G.press('a'); void 0")
        await pg.wait_for_timeout(800)
        await pg.evaluate("G.fast = false")
        await pg.wait_for_timeout(300)
        await pg.screenshot(path=OUT + '/02_tavern.png')
        async def go(m, at, name, wait=500):
            await pg.evaluate("G.fast = true; void Field.exec(() => Field.enter('%s', %s)).then(() => { G.fast = false; })" % (m, at))
            await pg.wait_for_timeout(wait)
            await pg.screenshot(path=OUT + '/' + name)
        await go('brackenford', "{x:14,y:9}", '03_town.png')
        await go('brackenford', "{x:8,y:16}", '04_town2.png')
        await go('thornwood', "{x:21,y:19}", '05_wood.png')
        await go('thornwood', "{x:34,y:3}", '06_wood2.png')
        await go('barrow1', "{x:14,y:8}", '07_barrow1.png')
        await go('barrow2', "{x:14,y:15}", '08_barrow2.png')
        await go('temple', "{x:5,y:5}", '09_temple.png')
        await go('shop', "{x:4,y:4}", '10_shop.png')
        # dialogue
        await pg.evaluate("void Field.exec(() => UI.say('Finch', 'A barrow, goblins, a worried town. Friends, this is how every good ballad starts.'))")
        await pg.wait_for_timeout(1500)
        await pg.screenshot(path=OUT + '/11_dialogue.png')
        await pg.evaluate("G.press('a')")
        await pg.wait_for_timeout(200)
        # menu
        await pg.evaluate("G.press('b')")
        await pg.wait_for_timeout(400)
        await pg.screenshot(path=OUT + '/12_menu.png')
        await pg.evaluate("G.press('b')")
        await pg.wait_for_timeout(300)
        # battle
        await pg.evaluate("void Field.exec(() => B.start('b1_lever', {}))")
        await pg.wait_for_timeout(2600)
        await pg.screenshot(path=OUT + '/13_battle.png')
        await pg.evaluate("G.press('down'); G.press('a'); void 0")
        await pg.wait_for_timeout(400)
        await pg.screenshot(path=OUT + '/14_battle_abilities.png')
        await pg.evaluate("G.press('b'); G.press('up'); G.press('a'); void 0")
        await pg.wait_for_timeout(400)
        await pg.screenshot(path=OUT + '/15_battle_target.png')
        await pg.evaluate("G.press('a'); void 0")
        await pg.wait_for_timeout(700)
        await pg.screenshot(path=OUT + '/16_battle_hit.png')
        print('errors:', errs)
        print('lastError:', await pg.evaluate("G.lastError ? String(G.lastError.stack) : null"))
        await b.close()
asyncio.run(main())
