"""Checks the tactics layer: free strikes when leaving an enemy's reach (both sides; Dask and hidden units exempt; once a
   round), undo of a move, the threat map, the target preview, battle speed, and takes screenshots of the threat
   overlay and the preview tag. Run: python3 tools/tacticstest.py"""
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
          const out = [], fails = [], ok = (n, v) => { if (!v) fails.push(n); };
          G.newGame(); Object.assign(G.S.flags, {tut: 1, joined: 1, chapter: 2}); G.S.level = 7; G.healAll();
          await Field.enter('thornwood', null, {noFade: true, noSave: true}); B.forceShape = 'square'; B.randomBoard = true;
          const fresh = () => { B.setup({ enemies: ['wolf', 'wolf', 'wolf'], bg: 'forest' }, {}); B.round = 1; for (const k of [...B.walls.keys()]) B.walls.delete(k); B.terrain = new Map();
            const party = B.c.filter(u => u.side === 0), foes = B.c.filter(u => u.side === 1); party.forEach((u, i) => { u.gx = 0; u.gy = i * 2; }); foes.forEach((u, i) => { u.gx = 11; u.gy = i * 2; }); return { party, foes }; };
          G.fast = true;
          // 1. walking away from a wolf: one free strike
          let { party, foes } = fresh(); const runa = party.find(u => u.id === 'runa'), w = foes[0];
          runa.gx = 5; runa.gy = 5; w.gx = 6; w.gy = 5;
          let pv = B.provokes(runa, [[5, 5], [4, 5], [3, 5]]); ok('leaving reach provokes', pv.length === 1 && pv[0].e === w && pv[0].i === 0);
          ok('moving round it does not', B.provokes(runa, [[5, 5], [5, 6], [6, 6]]).length === 0);
          let seq = B.eventSeq; await B.walk(runa, [[5, 5], [4, 5], [3, 5]]);
          ok('the strike happened', B.eventSeq > seq && w.aooRound === B.round); ok('walk still finished', runa.gx === 3 && runa.gy === 5);
          ok('once a round', B.provokes(runa, [[3, 5], [4, 5], [5, 4], [5, 3]]).length === 0 || !B.canStrikeBack(w));
          // 2. Dask and hidden units slip away; asleep enemies don't strike; enemies provoke heroes too
          const dask = party.find(u => u.id === 'dask'); dask.gx = 7; dask.gy = 8; foes[1].gx = 8; foes[1].gy = 8;
          ok('Dask is light-footed', B.provokes(dask, [[7, 8], [6, 8], [5, 8]]).length === 0);
          runa.gx = 7; runa.gy = 2; foes[2].gx = 8; foes[2].gy = 2; B.addStatus(foes[2], 'asleep', 2);
          ok('asleep enemies do not strike', B.provokes(runa, [[7, 2], [6, 2], [5, 2]]).length === 0);
          foes[2].statuses = []; B.addStatus(runa, 'hidden', 1); ok('hidden units do not provoke', B.provokes(runa, [[7, 2], [6, 2], [5, 2]]).length === 0); runa.statuses = [];
          ({ party, foes } = fresh()); const maren = party.find(u => u.id === 'maren'); maren.gx = 5; maren.gy = 5; foes[0].gx = 6; foes[0].gy = 5;
          ok('enemies provoke too', B.provokes(foes[0], [[6, 5], [7, 5], [8, 5]]).length === 1);
          // 3. the AI avoids a free strike when another square is as good
          ({ party, foes } = fresh()); const f = foes[0]; f.gx = 5; f.gy = 5; const r2 = party.find(u => u.id === 'runa'); r2.gx = 4; r2.gy = 5;
          const path = B.approach(f, 4); out.push('AI archer-style keep-away path from beside Runa: ' + JSON.stringify(path) + ' provokes ' + (path ? B.provokes(f, path).length : '-'));
          // 4. threat map and preview
          ({ party, foes } = fresh()); const th = B.threat(); out.push('threat squares with 3 wolves at the far edge: ' + th.size);
          ok('threat covers squares near the wolves', th.has('10,0') && th.has('8,2'));
          ok('threat does not reach the party edge', !th.has('0,0'));
          const fin = party.find(u => u.id === 'finch'), pr = B.preview(fin, null, foes[0], 10, 0); out.push('preview Finch vs wolf: ' + JSON.stringify({ pct: pr.pct, lo: pr.lo, hi: pr.hi, ko: pr.ko }) + ' wolf hp ' + foes[0].hp);
          ok('preview has a chance and a range', pr.pct > 0 && pr.hi >= pr.lo && pr.lo > 0);
          const fire = Object.values(G.D.abilities).find(a => (a.fx || []).some(e => e.t === 'damage')); const pr2 = B.preview(party[2], fire, foes[0], 9, 0);
          out.push('preview ' + fire.name + ': ' + B.previewText(pr2)); ok('spell preview', pr2 && pr2.hi > 0);
          ok('dice ranges', JSON.stringify(B.diceRange('2d6+3')) === '[5,15]' && JSON.stringify(B.diceRange('1d8-1')) === '[0,7]');
          // 5. battle speed
          G.opts.bspeed = 'swift'; const fs = B.speed(); G.opts.bspeed = 'normal'; const fn = B.speed(); G.opts.bspeed = 'fast';
          ok('speeds differ', fs < fn);
          G.fast = false;
          return { out, fails };
        })()""")
        print('\n'.join(r['out']))
        # undo through the real menu, and screenshots of the threat overlay and the preview tag
        await pg.evaluate("""(async () => { G.opts.bview = 'iso'; G.opts.threat = true; G.newGame(); Object.assign(G.S.flags,{tut:1,joined:1,chapter:2}); G.S.level = 7; G.healAll();
          await Field.enter('thornwood', null, {noFade:true, noSave:true}); G.auto = false; G.fast = false; G.autoPick = null; B.forceShape = 'square'; B.randomBoard = false; B.msg = async () => {};
          B.start('wood_wolves', { opening: 'none' }); })()""")
        for i in range(80):
            if await pg.evaluate("!!document.querySelector('.bcmd') && B.active && B.active.side === 0"): break
            await pg.wait_for_timeout(200)
        # wolves are quick: keep them out of reach, so the move is a clean one (a free strike would rightly block undo)
        await pg.evaluate("B.c.filter(u => u.side === 1).forEach((u, i) => { u.gx = 11; u.gy = 2 + i * 3; })")
        who = await pg.evaluate("[B.active.name, B.active.gx, B.active.gy]")
        await pg.keyboard.press('5'); await pg.wait_for_timeout(300)
        await pg.screenshot(path='/tmp/tac_threat.png')
        # two squares one way; if that square is blocked in this fight's opening view, try the other ways
        for keys in [['ArrowRight'] * 2, ['ArrowLeft'] * 4, ['ArrowRight', 'ArrowRight', 'ArrowUp', 'ArrowUp'], ['ArrowDown'] * 4]:
            for k in keys: await pg.keyboard.press(k); await pg.wait_for_timeout(120)
            await pg.keyboard.press('e'); await pg.wait_for_timeout(1500)
            if await pg.evaluate("[B.active.gx, B.active.gy].join() !== %r" % ','.join(map(str, who[1:]))): break
        moved = await pg.evaluate("[B.active.gx, B.active.gy, [...document.querySelectorAll('.bcmd .mi')].map(e => e.textContent.trim())]")
        await pg.keyboard.press('u'); await pg.wait_for_timeout(400)
        back = await pg.evaluate("[B.active.gx, B.active.gy]")
        print('undo: start', who, 'moved to', moved[:2], 'menu', moved[2], 'after undo', back)
        fails = r['fails'] + ([] if back == who[1:] and moved[:2] != who[1:] else ['undo did not return the hero'])
        # aim at something to show the preview tag
        await pg.evaluate("G.opts.threat = false; (() => { const a = B.active, w = B.c.find(u => u.side === 1 && B.living(u)); for (const [dx, dy] of [[1,0],[0,1],[-1,0],[0,-1],[1,1]]) if (B.free(a.gx + dx, a.gy + dy)) { w.gx = a.gx + dx; w.gy = a.gy + dy; break; } })()")
        await pg.keyboard.press('1'); await pg.wait_for_timeout(500)
        await pg.screenshot(path='/tmp/tac_preview.png')
        print('preview on screen:', await pg.evaluate("B.ui && B.ui.preview ? B.previewText(B.ui.preview) : null"))
        print('FAILS:', fails, len(fails)); print('console:', errs[:10])
        await b.close()
        raise SystemExit(1 if fails or errs else 0)
asyncio.run(main())
