"""Fights a handful of battles with every combat system in play (terrain, props, once-a-fight moves, openings,
   boss blows and phases, objectives) and prints what happened. Run: python3 tools/combattest.py"""
import asyncio
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
exec(open(os.path.join(ROOT, 'tools', 'puzzletest.py')).read().split('async def main')[0])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 960, 'height': 720}); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' else None)
        await pg.add_init_script('window.__NO_TITLE = true;')
        await pg.goto('file://' + os.path.join(ROOT, 'dist', 'index.html')); await pg.wait_for_timeout(300)
        await pg.evaluate(SETUP + HELP + '; void 0')
        r = await pg.evaluate(r"""(async () => {
          const out = []; G.newGame(); Object.assign(G.S.flags,{tut:1,joined:1,chapter:3}); G.S.level = 14; G.healAll();
          const tally = {};
          for (const [map, grp] of [['thornwood','wood_wolves'],['icecaves','ic_wolves'],['mirefen','fen_eels'],['undercroft','cryptshades'],['ashroad','ashroad_a'],['barrow1','skrit']]) {
            if (!G.D.groups[grp]) { out.push('no group ' + grp); continue; }
            await Field.enter(map, null, {noFade:true, noSave:true});
            B.setup(G.D.groups[grp], {});
            const t = {}; for (const v of B.terrain.values()) t[v] = (t[v]||0)+1; const pr = {}; for (const v of B.props.values()) pr[v] = (pr[v]||0)+1;
            out.push(map + '/' + B.bg + ': terrain ' + JSON.stringify(t) + ' props ' + JSON.stringify(pr) + ' units on fire: ' + B.c.filter(u => B.ter(u.gx,u.gy)==='fire').length);
          }
          // whole fights, with every system in play
          const res = {};
          for (const [map, grp, o] of [['thornwood','wood_wolves',{opening:'ambush'}],['thornwood','wood_wolves',{opening:'surprised'}],['frostpass','troll3',{}],['frostpass','whitepaw',{}],['catacombs1','watcher',{}],['undercroft','engine',{}],['ashroad','ashmarshal',{}],['karrow','giant',{}]]) {
            if (!G.D.groups[grp]) { out.push('no group ' + grp); continue; }
            G.healAll(); await Field.enter(map, null, {noFade:true, noSave:true});
            let r; try { r = await B.start(grp, o); } catch (e) { r = 'ERR ' + (e.stack || e).toString().split('\n').slice(0,3).join(' | '); }
            out.push(grp + ' ' + JSON.stringify(o) + ' -> ' + r + ' in ' + B.rounds + ' rounds; phase2=' + B.phase2 + ' objective=' + (G.D.groups[grp].objective ? G.D.groups[grp].objective.type : '-'));
          }
          // props and once-moves on a fresh board
          await Field.enter('undercroft', null, {noFade:true, noSave:true}); B.setup(G.D.groups.cryptshades, {});
          const runa = B.c.find(u => u.id === 'runa'), foe = B.c.find(u => u.side === 1);
          B.walls.set('6,5', 'keg'); B.props.set('6,5', 'keg'); foe.gx = 6; foe.gy = 6; runa.gx = 2; runa.gy = 5;
          const hp0 = foe.hp; await B.useProp(runa, { kind: 'keg', x: 6, y: 5, k: '6,5' }); out.push('keg: foe hp ' + hp0 + ' -> ' + foe.hp + ', fire at keg: ' + B.ter(6,5));
          B.walls.set('3,3', 'brazier'); B.props.set('3,3', 'brazier'); runa.gx = 2; runa.gy = 3; await B.useProp(runa, { kind: 'brazier', x: 3, y: 3, k: '3,3' });
          out.push('brazier: fire squares ' + [...B.terrain].filter(e => e[1]==='fire').map(e=>e[0]).join(' '));
          const f2 = B.c.find(u => u.side === 1 && !u.down); runa.gx = 8; runa.gy = 8; f2.gx = 9; f2.gy = 8; const x0 = f2.gx;
          await B.exec(runa, { type: 'ability', ab: G.D.abilities.shove, targets: [f2] }); out.push('shove: ' + x0 + ' -> ' + f2.gx + ' stunned=' + B.has(f2,'stunned') + ' once=' + JSON.stringify(runa.usedOnce));
          const dask = B.c.find(u => u.id === 'dask'); await B.exec(dask, { type: 'ability', ab: G.D.abilities.pellet, targets: [dask] }); out.push('pellet: hidden=' + B.has(dask,'hidden'));
          const maren = B.c.find(u => u.id === 'maren'); await B.exec(maren, { type: 'ability', ab: G.D.abilities.flare, targets: [maren] });
          const finch = B.c.find(u => u.id === 'finch'); const f3 = B.c.find(u => u.side === 1 && !u.down); if (f3) await B.exec(finch, { type: 'ability', ab: G.D.abilities.hush, targets: [f3] });
          out.push('finch abilities include hush: ' + finch.abilities.includes('hush'));
          // a terrain-aware hit chance
          runa.gx = 4; runa.gy = 4; B.terrain.set('4,4','high'); const tg = B.c.find(u => u.side === 1 && !u.down); if (tg) { tg.gx = 5; tg.gy = 4; B.terrain.delete('5,4'); out.push('chance from high ' + B.chance(runa, tg, 4, 4) + ' vs flat ' + (B.terrain.delete('4,4'), B.chance(runa, tg, 4, 4))); }
          return out.join('\n');
        })()""")
        print(r); print(errs[:8])
        await b.close()
asyncio.run(main())
