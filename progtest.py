"""Checks level-up choices (skill or improvement) and bonds (tiers, the effect in a fight, inn evenings, the epilogue
   cards), and takes a screenshot of the level-up choice. Run: python3 tools/progtest.py"""
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
        await pg.evaluate('window.__gain = G.gainXp; 0'); await pg.evaluate(SETUP + HELP + '; G.gainXp = window.__gain; void 0')   # the harness logs level-ups; not wanted here
        r = await pg.evaluate(r"""(async () => {
          const out = [], fails = [], ok = (n, v) => { if (!v) fails.push(n); };
          G.newGame(); G.S.level = 1; G.healAll(); const runa = G.member('runa');
          // legacy: a hero with levels but no picks keeps every skill
          G.S.level = 12; ok('legacy keeps every skill', G.stats(runa).abilities.length === Object.keys(G.D.classes.runa.learn).filter(l => +l <= 12).reduce((n, l) => n + G.D.classes.runa.learn[l].length, 0));
          // level-ups queue a choice for each hero who learns something
          G.S.level = 1; G.S.xp = 0; G.S.pendingPicks = []; G.S.flags.chapter = 1; G.gainXp(G.D.xpTable[2] + 5);
          out.push('after reaching level ' + G.S.level + ': pending ' + JSON.stringify(G.S.pendingPicks));
          ok('choices queued', G.S.pendingPicks.length >= 4);
          const off = G.pickOffer(runa, 2); out.push('Runa at level 2: ' + off.skills.join(',') + ' or ' + off.mastery);
          const hp0 = G.stats(runa).maxHp; G.choosePick(runa, 2, 'm:' + off.mastery); const st = G.stats(runa);
          ok('improvement taken instead of the skill', st.abilities.indexOf(off.skills[0]) < 0 && st.mastery[off.mastery] === 1);
          out.push('Runa took ' + off.mastery + ': max HP ' + hp0 + ' -> ' + st.maxHp);
          G.choosePick(runa, 2, 'skill'); ok('skill back when chosen', G.stats(runa).abilities.indexOf(off.skills[0]) >= 0);
          // the offer rotates, and nothing goes past three ranks
          runa.picks = {}; const seen = []; for (const L of Object.keys(G.D.classes.runa.learn).map(Number).filter(l => l > 1)) { const o = G.pickOffer(runa, L); seen.push(o.mastery); G.choosePick(runa, L, 'm:' + o.mastery); }
          const counts = {}; seen.forEach(m => counts[m] = (counts[m] || 0) + 1); out.push('all improvements, Runa: ' + JSON.stringify(counts));
          ok('max three ranks', Object.values(counts).every(n => n <= 3));
          runa.picks = {};
          // bonds
          ok('pair key', G.bondKey('maren', 'dask') === 'dask_maren' && G.bondKey('runa', 'finch') === 'finch');
          G.S.flags['bond.dask_maren'] = 3; G.S.flags['bond.maren'] = 5; G.S.flags['bond.dask_finch'] = -3;
          ok('tiers', G.bondTier('dask', 'maren') === 'Friends' && G.bondTier('runa', 'maren') === 'Trusting' && G.bondTier('finch', 'dask') === 'At odds');
          await Field.enter('thornwood', null, { noFade: true, noSave: true }); G.fast = true;
          B.forceShape = 'square'; B.randomBoard = true; B.setup({ enemies: ['wolf'], bg: 'forest' }, {});
          const H = id => B.c.find(u => u.id === id); H('dask').gx = 5; H('dask').gy = 5; H('maren').gx = 5; H('maren').gy = 6; H('finch').gx = 6; H('finch').gy = 5; H('runa').gx = 4; H('runa').gy = 6;
          const bh = B.bondHit(H('maren'), 5, 6), bf = B.bondHit(H('finch'), 6, 5), ba = B.bondAc(H('maren'));
          out.push('Maren beside Dask: ' + JSON.stringify(bh) + ' · Finch beside Dask: ' + JSON.stringify(bf) + ' · Maren beside Runa: ' + JSON.stringify(ba));
          ok('friends +1', bh.bonus === 1); ok('at odds -1', bf.bonus === -1); ok('trust AC', ba.bonus === 1);
          const before = G.flag('bond.dask_maren'); B.bondMoment(H('maren'), H('dask'), 1, 'test'); B.bondMoment(H('maren'), H('dask'), 1, 'test');
          ok('once a fight per pair', G.flag('bond.dask_maren') === before + 1);
          // inn evenings: a sour friendship comes up first, and its choice moves the bond
          G.fast = false; G.autoPick = o => o.items[0].value; G.auto = false;
          G.S.flags['inn.turn'] = 1; const sour = G.D.bondTalk.find(e => !G.flag('inn.' + e.id) && (!e.if || G.cond(e.if)));
          out.push('first bond evening: ' + sour.id); ok('mending first', sour.id === 'mend_df');
          const UIsay = UI.say; UI.say = async () => {}; await G.innTalk(); UI.say = UIsay;
          ok('mending moved the bond', G.flag('bond.dask_finch') === 0);
          ok('every evening has a valid script', G.D.bondTalk.every(e => Array.isArray(e.script) && e.script.length));
          // epilogue cards are in
          ok('epilogue pair cards', JSON.stringify(G.D.scripts.epilogueHeroes).indexOf('Dask and Maren') >= 0);
          G.S.pendingPicks = []; G.autoPick = null;
          return { out, fails };
        })()""")
        print('\n'.join(r['out']))
        # the level-up choice on screen
        await pg.evaluate("""(async () => { G.fast = false; G.auto = false; G.autoPick = null; G.newGame(); Object.assign(G.S.flags,{tut:1,joined:1,chapter:2}); G.S.level = 8; G.S.xp = G.D.xpTable[8] - 5; G.healAll();
          await Field.enter('saltmere', null, {noFade:true, noSave:true}); G.gainXp(20); })()""")
        await pg.wait_for_timeout(1200)
        await pg.screenshot(path='/tmp/levelpick.png')
        shown = await pg.evaluate("[!!document.querySelector('.lvpick'), (document.querySelector('.lvpick')||{}).textContent]")
        print('level-up choice on screen:', shown[0], (shown[1] or '')[:120])
        await pg.keyboard.press('ArrowDown'); await pg.wait_for_timeout(200); await pg.screenshot(path='/tmp/levelpick2.png'); await pg.keyboard.press('z'); await pg.wait_for_timeout(500)
        after = await pg.evaluate("[JSON.stringify(G.S.party.map(m => m.picks || {})), (G.S.pendingPicks || []).length]")
        print('after choosing:', after)
        fails = r['fails'] + ([] if shown[0] else ['level-up choice did not show'])
        print('FAILS:', fails, len(fails)); print('console:', errs[:10])
        await b.close()
        raise SystemExit(1 if fails or errs else 0)
asyncio.run(main())
