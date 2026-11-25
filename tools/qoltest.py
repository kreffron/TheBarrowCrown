"""Quality-of-life features: the interact prompt (what it marks and what it does not), running (Shift, and Always run),
   gear comparisons and the equip offer, the dialogue log, and patching up the party. Saves screenshots to $OUT
   (default /tmp). Run: python3 tools/qoltest.py"""
import asyncio
import os
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('OUT', '/tmp')
async def main():
    fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 960, 'height': 720}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' else None)
        await pg.add_init_script('window.__NO_TITLE = true;')
        await pg.goto('file://' + os.path.join(ROOT, 'dist', 'index.html')); await pg.wait_for_timeout(600)
        r = await pg.evaluate(r"""(async () => {
          const fails = [], ok = (n, v) => { if (!v) fails.push(n); };
          G.fast = true; G.newGame(); G.S.flags.joined = 1; G.S.flags.chapter = 2; G.S.level = 8; G.healAll(); Field.banter = () => {};
          await Field.enter('brackenford', null, { noFade: true, noSave: true, quiet: true });
          // 1. the prompt: an NPC with something to say is marked; a plain barrel is not
          const npc = Field.map.things.find(t => t.def.type === 'npc' && t.def.script && Field.visible(t) && !Field.blocked(t.x, t.y + 1));
          Field.p.x = Field.p.tx = npc.x; Field.p.y = Field.p.ty = npc.y + 1; Field.p.dir = 'up';
          ok('prompt target is the NPC in front', Field.target() === npc && Field.hasUse(npc));
          const plain = Field.map.things.find(t => t.def.type === 'obj' && !t.def.script && !t.def.abil);
          ok('a plain object has no use', !plain || !Field.hasUse(plain));
          // 3. gear comparison
          const runa = G.member('runa'), axes = Object.keys(G.D.items).filter(k => G.D.items[k].type === 'weapon' && (!G.D.items[k].for || G.D.items[k].for.indexOf('runa') >= 0));
          const c = axes.map(k => Menu.compare(runa, k)).filter(Boolean);
          ok('weapons compare for Runa', c.length >= 2 && c.some(x => x.parts.length));
          const wearing = Menu.compare(runa, runa.gear.weapon); ok('the item worn says so', wearing && wearing.same);
          const best = axes.map(k => [k, Menu.compare(runa, k)]).filter(x => x[1] && !x[1].same).sort((a, b) => b[1].score - a[1].score)[0];
          G.give(best[0], 1); G.autoPick = o => o.items[0].value; await Menu.offerEquip(best[0]); G.autoPick = null;
          ok('equip offer puts the best upgrade on', Object.values(G.S.party.map(m => m.gear.weapon)).indexOf(best[0]) >= 0);
          ok('comparison html has colours', /#7ee08a|#ff8a7a/.test(Menu.compareHtml(G.member('dask'), Object.keys(G.D.items).find(k => G.D.items[k].type === 'armor' && (!G.D.items[k].for || G.D.items[k].for.indexOf('dask') >= 0) && k !== G.member('dask').gear.armor)) || ''));
          // 4. the dialogue log
          G.S.dlog = []; G.autoPick = o => 1;
          await G.run([['say', 'Hobb', 'Wolves keep off the forest road.'], ['note', 'The wind picks up.'], ['choice', 'Hobb', 'Well?', [['Yes', []], ['No', []]]]]);
          G.autoPick = null;
          const L = G.S.dlog; ok('log keeps lines, narration, the choice prompt and the pick', L.length === 4 && L[0][0] === 'Hobb' && (L[1][0] === '' || L[1][0] === 'The Dungeon Master') && L[3][3] === 'pick' && L[3][1] === 'No');
          for (let i = 0; i < 100; i++) UI.logLine('X', 'line ' + i); ok('log is capped at 80', G.S.dlog.length === 80 && G.S.dlog[79][1] === 'line 99');
          // 5. patch up
          G.S.bag = { draught: 5, greater: 2 }; G.S.party.forEach(m => { m.hp = Math.max(1, Math.floor(G.stats(m).maxHp * 0.4)); }); G.member('finch').hp = G.stats(G.member('finch')).maxHp - 2;
          const plan = Menu.patchPlan(false), before = JSON.stringify(G.S.bag);
          ok('plan uses something', Object.keys(plan.used).length > 0); ok('plan does not touch the bag', JSON.stringify(G.S.bag) === before);
          const hp0 = G.S.party.map(m => m.hp), done = Menu.patchPlan(true), hp1 = G.S.party.map(m => m.hp);
          ok('patch up heals the hurt', hp1[0] > hp0[0] && hp1[1] > hp0[1] && hp1[2] > hp0[2]);
          ok('no draught for a 2-point scratch', hp1[3] === hp0[3]);
          ok('bag goes down by what was used', Object.values(done.used).reduce((a, b) => a + b, 0) === 7 - Object.values(G.S.bag).reduce((a, b) => a + b, 0));
          G.S.bag = {}; ok('nothing to use: empty plan', !Object.keys(Menu.patchPlan(false).used).length);
          G.healAll(); G.fast = false;
          return fails;
        })()""")
        fails += r
        # 2. running, with real keys: tiles covered in 600ms walking, then holding Shift
        async def walk(shift):
            await pg.evaluate("(() => { G.fast = false; const p = Field.p; p.x = p.tx = 6; p.y = p.ty = 14; p.dir = 'right'; p.moving = false; })()")
            await pg.wait_for_timeout(200)
            x0 = await pg.evaluate("Field.p.x")
            if shift: await pg.keyboard.down('Shift')
            await pg.keyboard.down('ArrowRight'); await pg.wait_for_timeout(900); await pg.keyboard.up('ArrowRight')
            if shift: await pg.keyboard.up('Shift')
            await pg.wait_for_timeout(300); return (await pg.evaluate("Field.p.x")) - x0
        await pg.evaluate("Field.enter('ashroad', { x: 6, y: 14 }, { noFade: true, noSave: true, quiet: true }).then(() => 1)")
        await pg.evaluate("(() => { G.S.flags.chapter = 5; Field.map.def.enc = null; Field.danger = -1e9; })()")
        w = await walk(False); r2 = await walk(True)
        await pg.evaluate("G.opts.alwaysRun = true; void 0"); a = await walk(False); await pg.evaluate("G.opts.alwaysRun = false; void 0")
        print('tiles in 0.9s: walk', w, 'run', r2, 'always run', a)
        if not (r2 > w and a > w): fails.append('running is not faster')
        # screenshots: the prompt, a shop with comparisons, the log, patch up
        await pg.evaluate("(async () => { G.fast = true; await Field.enter('brackenford', null, { noFade: true, noSave: true, quiet: true }); const npc = Field.map.things.find(t => t.def.type === 'npc' && t.def.script && Field.visible(t) && !Field.blocked(t.x, t.y + 1)); Field.p.x = Field.p.tx = npc.x; Field.p.y = Field.p.ty = npc.y + 1; Field.p.dir = 'up'; G.fast = false; })()")
        await pg.wait_for_timeout(500); await pg.screenshot(path=os.path.join(OUT, 'qol_prompt.png'))
        await pg.evaluate("(() => { G.S.gold = 2000; Menu.shop(Object.keys(G.D.shops).find(k => G.D.shops[k].stock.some(i => G.D.items[i].type === 'armor'))); })(); void 0")
        await pg.wait_for_timeout(400); await pg.keyboard.press('e'); await pg.wait_for_timeout(300)
        for i in range(12):
            t = await pg.evaluate("(Menu.descEl && Menu.descEl.innerHTML) || ''")
            if '#7ee08a' in t or '#ff8a7a' in t: break
            await pg.keyboard.press('ArrowDown'); await pg.wait_for_timeout(150)
        await pg.screenshot(path=os.path.join(OUT, 'qol_shop.png'))
        await pg.keyboard.press('x'); await pg.wait_for_timeout(200); await pg.keyboard.press('x'); await pg.wait_for_timeout(300)
        await pg.evaluate("(async () => { G.fast = true; G.S.dlog = []; G.autoPick = o => 0; await G.run([['say', 'Hobb', 'Lights burn at night in the old watchtower, north-west of the forest road.'], ['say', 'Runa', 'We will look.'], ['choice', 'Hobb', 'Take the job?', [['Yes', []], ['No', []]]], ['say', 'Hobb', 'Good. Mind the wolves.']]); G.autoPick = null; G.fast = false; })()")
        await pg.keyboard.press('j'); await pg.wait_for_timeout(400)
        for i in range(12):
            t = await pg.evaluate("(document.querySelector('.menu .mi.sel .ml') || {}).innerText || ''")
            if 'Recent' in t: break
            await pg.keyboard.press('ArrowDown'); await pg.wait_for_timeout(120)
        await pg.keyboard.press('e'); await pg.wait_for_timeout(300); await pg.keyboard.press('ArrowDown'); await pg.wait_for_timeout(200); await pg.keyboard.press('ArrowDown'); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, 'qol_log.png'))
        for i in range(3): await pg.keyboard.press('x'); await pg.wait_for_timeout(200)
        await pg.evaluate("(() => { G.S.bag = { draught: 6, greater: 2 }; G.S.party.forEach(m => { m.hp = Math.max(1, Math.floor(G.stats(m).maxHp * 0.45)); }); })()")
        for i in range(4):
            if not await pg.evaluate("G.modals.length > 0"): break
            await pg.keyboard.press('Escape'); await pg.wait_for_timeout(250)
        await pg.wait_for_timeout(300); await pg.keyboard.press('i'); await pg.wait_for_timeout(500); await pg.keyboard.press('e'); await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(OUT, 'qol_patch.png'))
        print('FAILS:', fails, len(fails)); print('console:', errs[:5])
        await b.close()
        raise SystemExit(1 if fails or errs else 0)
asyncio.run(main())
