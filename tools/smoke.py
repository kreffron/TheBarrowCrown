#!/usr/bin/env python3
"""Real-keyboard test in headless Chrome. Plays the opening the way a player would: prologue, tavern
tutorial (talk, search, the coat check, recruiting Ingrid), the guided brawl, the closing scene, then
menus, a shop, a battle, saving and reloading. Also checks that a cutscene can be skipped.
Screenshots go to the folder given as the first argument (default /home/claude/shots)."""
import asyncio, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/shots'
URL = 'file://' + os.path.join(ROOT, 'dist', 'index.html')
FAILS = []

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 960, 'height': 720})
        pg = await ctx.new_page()
        errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') and 'willReadFrequently' not in m.text else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        ev = lambda js: pg.evaluate('(() => { return ' + js + '; })()')
        shot = lambda name: pg.screenshot(path=OUT + '/' + name)
        def ok(label, cond):
            print(('ok   ' if cond else 'FAIL ') + label)
            if not cond: FAILS.append(label)
        async def key(k, n=1, gap=90):
            for _ in range(n):
                await pg.keyboard.press(k); await pg.wait_for_timeout(gap)
        async def hold(k, ms):
            await pg.keyboard.down(k); await pg.wait_for_timeout(ms); await pg.keyboard.up(k); await pg.wait_for_timeout(220)
        async def until_free(maxn=400, shots=None):
            for i in range(maxn):
                if await ev("G.scene === 'field' && !G.busy && !G.modals.length"): return True
                if shots and i in shots: await shot(shots[i])
                await pg.keyboard.press('e'); await pg.wait_for_timeout(80)
            return False
        async def face(x, y, d):
            await ev("(Field.p.x = Field.p.tx = %d, Field.p.y = Field.p.ty = %d, Field.p.dir = '%s', 1)" % (x, y, d))
            await pg.wait_for_timeout(60)

        # ---------- skipping: X twice jumps to the end of a cutscene ----------
        await pg.goto(URL); await pg.wait_for_timeout(500)
        await key('Enter'); await pg.wait_for_timeout(1200)
        await key('x'); await pg.wait_for_timeout(150)
        await shot('50_skip_armed.png')
        ok('first X arms the skip', await ev("!!(G.cine && G.cine.armed && !G.cine.skip)"))
        await key('x'); await pg.wait_for_timeout(1500)
        ok('second X skips the prologue to the tutorial', await ev("G.scene === 'field' && G.S.map === 'tavern' && G.flag('cs.vosk') === 1 && G.flag('tut') === 1 && !G.fast && !G.cine && !document.querySelector('.lbox.on')"))
        ok('after the skip the tutorial starts normally', await until_free(20) and await ev("!!document.querySelector('.hintbox')"))

        # ---------- the full opening, played with keys ----------
        await pg.goto(URL); await pg.wait_for_timeout(500)
        await ev("(G.opts.textFast = true, 1)")
        await key('Enter'); await pg.wait_for_timeout(700)
        ok('prologue reaches the tutorial', await until_free(600, {3: '51_prologue_card.png', 9: '52_king.png', 22: '53_thane_hooded.png',
                                                                40: '54_thane_dark.png', 66: '55_tavern_dream.png', 92: '56_vosks_enter.png'}))
        ok('tutorial running, nothing saved yet', await ev("G.tutorial() && G.S.map === 'tavern' && !localStorage.getItem(G.SAVE_KEY)"))
        ok('hint banner is shown', await ev("!!document.querySelector('.hintbox')"))
        await shot('57_tutorial.png')
        y0 = await ev('Field.p.y')
        for i in range(3):                      # a short real key-hold; on a busy machine, try again before failing
            await hold('ArrowDown', 330)
            if await ev('Field.p.y') > y0: break
            await pg.wait_for_timeout(300)
        ok('walking moves the player', await ev('Field.p.y') > y0)
        await face(8, 10, 'down'); await hold('ArrowDown', 300)
        await until_free()
        ok('the door will not let you leave', await ev("G.S.map === 'tavern' && Field.p.y === 10"))
        for (x, y, d) in [(3, 8, 'up'), (4, 5, 'down'), (5, 8, 'up')]:
            await face(x, y, d); await key('e'); await until_free()
        ok('talking to all three updates the hint', await ev("G.flag('tut.talked') === 3 && /Brannoc/.test(document.querySelector('.hintbox').textContent)"))
        await shot('58_hint2.png')
        d0 = await ev("G.S.bag.draught || 0")
        await face(16, 2, 'up'); await key('e'); await until_free()
        ok('searching the cask finds two draughts', await ev("G.S.bag.draught") == d0 + 2)
        await key('x'); await pg.wait_for_timeout(250)
        for i in range(12):                                                   # find Save by name (the menu's order can change)
            if await ev("((document.querySelector('.menu .mi.sel .ml') || {}).innerText || '') === 'Save'"): break
            await key('ArrowDown')
        await key('e'); await pg.wait_for_timeout(300)
        ok('saving is blocked during the tutorial', await ev("!localStorage.getItem(G.SAVE_KEY)"))
        await key('x'); await pg.wait_for_timeout(300)
        await ev("(G._d20 = G.d20, G.d20 = () => 15, 1)")                 # make the coat check pass
        await face(6, 9, 'down'); await key('e')
        await until_free(200, {6: '59_coat_check.png', 10: '60_letter.png'})
        ok('the coat check finds the letter', await ev("G.flag('tut.letter') === 1 && G.has('voskletter') === 1"))
        await ev("(G.d20 = G._d20, 1)")
        await face(15, 4, 'left'); await key('e'); await pg.wait_for_timeout(400)
        await shot('61_ingrid_choice.png')
        await key('e'); await until_free()
        ok('showing the letter recruits Ingrid', await ev("G.flag('ingridAlly') === 1"))

        # ---------- the guided brawl ----------
        await face(11, 3, 'up'); await key('e'); await pg.wait_for_timeout(400)
        await key('ArrowDown'); await key('e')
        for i in range(60):
            if await ev("G.scene === 'battle' && !!document.querySelector('.bcmd')"): break
            await key('e', 1, 120)
        guided = "B.active && B.active.id === 'runa' && B.logEl.classList.contains('guide') && document.querySelectorAll('.bcmd .mi.dis').length === 5"
        for i in range(15):                     # the menu can appear a moment before the lock is drawn: give it a beat
            if await ev(guided): break
            await pg.wait_for_timeout(200)
        await shot('62_guide_runa.png')
        ok('Runa is guided to Attack, other commands locked', await ev(guided))
        await key('ArrowDown'); await key('e'); await pg.wait_for_timeout(200)
        ok('a locked command cannot be chosen', await ev("!!document.querySelector('.bcmd') && !document.querySelector('.bsub')"))
        await key('ArrowUp'); await key('e'); await pg.wait_for_timeout(250)
        await shot('63_guide_target.png')
        ok('only Brannoc can be targeted on the board', await ev("!!(B.ui && B.ui.valid && B.ui.valid.size === 1 && [...B.ui.valid].every(k => { const p = k.split(',').map(Number); const o = B.occupant(p[0], p[1]); return o && o.id === 'brannoc'; }))"))
        seen, steps = set(), {'dask': '64_guide_dask.png', 'maren': '65_guide_maren.png', 'finch': '66_guide_finch.png'}
        for i in range(200):
            st = await ev("G.scene === 'battle' && B.active && document.querySelector('.bcmd') ? B.active.id : ''")
            if st in steps and st not in seen:
                seen.add(st); await shot(steps[st])
                if st == 'maren':
                    await key('e'); await pg.wait_for_timeout(250); await shot('65b_mend.png')
                    ok('Maren is guided to Mend', await ev("document.querySelector('.bsub .mi.sel') && /Mend/.test(document.querySelector('.bsub .mi.sel').textContent)"))
                    continue
            if await ev("G.scene === 'battle' && B.guide && B.guide.length === 0 && B.active && B.active.side === 0 && !B.active.guest && !!document.querySelector('.bcmd')"):
                break
            await key('e', 1, 110)
        await shot('67_free_control.png')
        ok('guided steps done, then full control', await ev("B.guide && B.guide.length === 0 && document.querySelectorAll('.bcmd .mi.dis').length <= 2"))
        ok('Ingrid fought as a guest ally', await ev("B.c.some(c => c.guest && c.id === 'ingrid')"))
        ok('Brannoc took the guided hits', await ev("(B.c.find(c => c.id === 'brannoc') || {hp: 99}).hp < 34"))
        await until_free(700, {30: '68_closing_halda.png'})
        ok('closing scene hands over to Brackenford', await ev("G.flag('joined') === 1 && G.S.map === 'brackenford' && G.flag('q.main') === 1 && !G.tutorial()"))
        ok('the game saves once the tutorial is over', await ev("!!localStorage.getItem(G.SAVE_KEY)"))
        ok('morning actors are gone', await ev("G.flag('cs.morning') === 0 && !Field.map.things.some(t => t.def.if === 'cs.morning' && Field.visible(t))"))
        await shot('69_morning.png')

        # ---------- the game proper ----------
        await ev("(void Field.exec(() => Field.enter('tavern', {x: 6, y: 3}, {dir: 'up'})), 1)"); await pg.wait_for_timeout(900)
        await key('e'); await pg.wait_for_timeout(700)
        ok('Bram offers a room after the tutorial', await ev("!!document.querySelector('.choice')"))
        await key('ArrowDown', 2); await key('e'); await until_free()
        await face(8, 10, 'down'); await hold('ArrowDown', 600); await pg.wait_for_timeout(900)
        ok('the tavern door leads to town', await ev("G.S.map") == 'brackenford')
        await ev("(void Field.exec(() => Field.enter('smithy', {x: 4, y: 3}, {dir: 'up'})), 1)"); await pg.wait_for_timeout(900)
        for _ in range(30):
            if await ev("!!document.querySelector('.pane')"): break
            await key('e', 1, 200)
        ok('Ingrid opens her shop after the gift', await ev("!!document.querySelector('.pane')"))
        for _ in range(6):
            if not await ev("!!document.querySelector('.pane')"): break
            await key('x', 1, 250)
        await until_free(10)
        ok('Ingrid gives her gift at the forge', await ev("G.flag('ingridGift') === 1 && G.has('horseshoe') === 1"))
        await key('x'); await pg.wait_for_timeout(250)
        await key('ArrowDown'); await key('e'); await pg.wait_for_timeout(250)
        await ev("(G.S.party[0].hp = 3, 1)")
        d1 = await ev("G.S.bag.draught")
        await key('e'); await pg.wait_for_timeout(200); await key('e'); await pg.wait_for_timeout(200)
        ok('a draught heals from the menu', await ev('G.S.party[0].hp') > 3 and await ev("G.S.bag.draught") == d1 - 1)
        await key('x'); await key('ArrowDown', 2); await key('e'); await pg.wait_for_timeout(250)
        for _ in range(6):                                   # walk down the journal until the Chronicle is showing
            await key('ArrowDown'); await pg.wait_for_timeout(120)
            if await ev("!!document.querySelector('.chron')"): break
        ok('journal shows the Chronicle', await ev("!!document.querySelector('.chron') && /Ingrid/.test(document.querySelector('.chron').textContent)"))
        await shot('70_chronicle.png')
        await key('x', 2); await pg.wait_for_timeout(300)
        ok('menu closes', await ev("!G.modals.length && !G.busy"))
        await ev("(G.S.gold = 200, void Field.exec(() => Field.enter('shop', {x: 4, y: 3}, {dir: 'up'})), 1)"); await pg.wait_for_timeout(900)
        await key('e'); await pg.wait_for_timeout(400)
        for _ in range(14):
            if await ev("!!document.querySelector('.pane')"): break
            await key('e'); await pg.wait_for_timeout(120)
        await key('e'); await pg.wait_for_timeout(300)
        d2 = await ev("G.S.bag.draught")
        await key('e'); await pg.wait_for_timeout(150)
        ok('buying takes gold and adds the item', await ev("G.S.gold") == 185 and await ev("G.S.bag.draught") == d2 + 1)
        await key('x', 2); await pg.wait_for_timeout(300)
        ok('shop closes cleanly', await ev("!G.modals.length && !G.busy && !document.querySelector('.pane')"))
        await ev("(void Field.exec(() => B.start('b1_camp', {})), 1)"); await pg.wait_for_timeout(1500)
        for i in range(900):
            if await ev("G.scene === 'field' && !G.busy"): break
            await pg.keyboard.press('e'); await pg.wait_for_timeout(60)
        ok('an ordinary battle ends back on the field', await ev("G.scene === 'field' && !G.busy"))
        await ev("(G.save(), 1)")
        xp = await ev("G.S.xp")
        await pg.reload(); await pg.wait_for_timeout(600)
        await key('Enter'); await pg.wait_for_timeout(900)
        ok('Continue restores the save', await ev("G.S && G.S.xp") == xp and await ev("G.scene") == 'field')
        code = await ev("G.exportCode()")
        ok('save code round-trips', await ev("(() => { const a = G.importCode(%r), b = JSON.parse(JSON.stringify(G.S)); delete a.time; delete b.time; return JSON.stringify(a) === JSON.stringify(b); })()" % code))   # play time ticks between the two calls
        print('console:', errs[:8])
        print('lastError:', await ev("G.lastError ? String(G.lastError.stack) : null"))
        await b.close()
        print('%d failed' % len(FAILS))
        sys.exit(1 if FAILS or errs else 0)
asyncio.run(main())
