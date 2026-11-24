"""Checks battle boards: every shape on every setting builds a fair board (connected, room for both sides, nobody on a
   missing square; the open square has at least four separate lanes across, every shape at least one), how often each shape turns up, and that every new object and kind of ground does what it says
   (rolling boulders and logs, things hanging overhead, beehives, gas vents, falling off an edge, sliding on ice,
   smoke blocking sight, hallowed ground), and that the AI uses objects when it is worth it.
   Run: python3 tools/boardtest.py"""
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
          const out = [], fails = [], ok = (name, v) => { if (!v) fails.push(name); };
          G.newGame(); Object.assign(G.S.flags, {tut: 1, joined: 1, chapter: 3}); G.S.level = 14; G.healAll();
          await Field.enter('thornwood', null, {noFade: true, noSave: true});
          // 1. every shape, every setting, many seeds: fair boards
          const grp = { enemies: ['wolf', 'wolf', 'wolf'] }, counts = {}, fellBack = {};
          for (const bg of Object.keys(B.THEME)) {
            for (const shape of ['square', ...Object.keys(B.SHAPES)]) {
              for (let seed = 0; seed < 6; seed++) {
                B.forceShape = shape; B.randomBoard = true; B.gid = 'test' + seed + shape;
                B.setup(Object.assign({ bg }, grp), {});
                if (B.shape !== shape) { fellBack[shape + '/' + bg] = (fellBack[shape + '/' + bg] || 0) + 1; }
                const bad = B.c.filter(u => !B.inside(u.gx, u.gy) || B.wall(u.gx, u.gy));
                ok('units on real squares ' + shape + '/' + bg, !bad.length);
                ok('connected ' + shape + '/' + bg, B.connected());
                ok('four lanes across ' + shape + '/' + bg, B.shape !== 'square' || B.lanes(4) >= 4); ok('crossable ' + shape + '/' + bg, B.lanes(1) >= 1);
                ok('no fire under anyone ' + shape + '/' + bg, !B.c.some(u => B.ter(u.gx, u.gy) === 'fire'));
                const twoOnOne = new Set(B.c.map(u => u.gx + ',' + u.gy)).size === B.c.length; ok('one per square ' + shape + '/' + bg, twoOnOne);
              }
            }
          }
          B.forceShape = null;
          out.push('fell back to the square (per 6 tries): ' + JSON.stringify(fellBack));
          // 2. how often each shape turns up, by setting
          for (const bg of Object.keys(B.THEME)) {
            const c = {};
            for (let seed = 0; seed < 60; seed++) { B.gid = 'g' + seed; B.setup(Object.assign({ bg }, grp), {}); c[B.shape] = (c[B.shape] || 0) + 1; }
            counts[bg] = c;
          }
          out.push('shapes by setting (60 fights each): ' + JSON.stringify(counts));
          // 3. the objects
          const fresh = (shape, bg) => { B.forceShape = shape; B.gid = 'obj'; B.setup(Object.assign({ bg: bg || 'cave' }, grp), {}); B.forceShape = null;
            for (const k of [...B.props.keys()]) { B.walls.delete(k); B.props.delete(k); } B.hangs = new Map(); B.terrain = new Map();
            const party = B.c.filter(u => u.side === 0), foes = B.c.filter(u => u.side === 1);
            party.forEach((u, i) => { u.gx = 0; u.gy = i; }); foes.forEach((u, i) => { u.gx = B.N - 1; u.gy = i; });
            for (let y = 0; y < B.N; y++) for (let x = 0; x < B.N; x++) if (B.wall(x, y) && x > 0 && x < B.N - 1) B.walls.delete(x + ',' + y);
            return { party, foes }; };
          let { party, foes } = fresh('square');
          const runa = party.find(u => u.id === 'runa'), f = foes[0];
          // boulder: rolls east from (4,5), hits the wolf at (7,5)
          B.walls.set('4,5', 'boulder'); B.props.set('4,5', 'boulder'); runa.gx = 3; runa.gy = 5; f.gx = 7; f.gy = 5;
          let use = B.usable(runa).find(p => p.kind === 'boulder'); ok('boulder usable', !!use);
          let hp0 = f.hp; await B.useProp(runa, use);
          out.push('boulder: wolf hp ' + hp0 + ' -> ' + f.hp + ' stunned=' + B.has(f, 'stunned') + ' rests at 6,5 as ' + B.walls.get('6,5'));
          ok('boulder hurts', f.hp < hp0); ok('boulder rests before the wolf', B.walls.get('6,5') === 'rock');
          // a hanging chandelier over the second wolf, brought down from 4 away
          const f2 = foes[1]; f2.gx = 8; f2.gy = 2; B.hangs.set('8,2', 'chandelier'); runa.gx = 4; runa.gy = 2;
          use = B.usable(runa).find(p => p.hang); ok('chandelier usable', !!use);
          hp0 = f2.hp; await B.useProp(runa, use);
          out.push('chandelier: wolf hp ' + hp0 + ' -> ' + f2.hp + ' fire under it: ' + B.ter(8, 2) + ' gone: ' + !B.hangs.has('8,2'));
          ok('chandelier hurts', f2.hp < hp0); ok('chandelier leaves fire', B.ter(8, 2) === 'fire');
          // beehive: poisons everyone beside it
          ({ party, foes } = fresh('square'));
          const dask = party.find(u => u.id === 'dask'); B.walls.set('6,6', 'hive'); B.props.set('6,6', 'hive');
          foes[0].gx = 7; foes[0].gy = 6; foes[1].gx = 6; foes[1].gy = 7; dask.gx = 3; dask.gy = 6;
          use = B.usable(dask).find(p => p.kind === 'hive'); ok('hive usable', !!use); await B.useProp(dask, use);
          out.push('hive: poisoned ' + foes.filter(u => B.has(u, 'poison')).length + ' wolves; hive now ' + B.walls.get('6,6'));
          ok('hive poisons both', foes.filter(u => B.has(u, 'poison')).length >= 2);
          // gas vent: blows up, fire in a plus
          ({ party, foes } = fresh('square', 'fen'));
          const maren = party.find(u => u.id === 'maren'); B.walls.set('6,6', 'gas'); B.props.set('6,6', 'gas'); foes[0].gx = 7; foes[0].gy = 7; maren.gx = 2; maren.gy = 6;
          use = B.usable(maren).find(p => p.kind === 'gas'); ok('gas usable', !!use); hp0 = foes[0].hp; await B.useProp(maren, use);
          const fires = ['6,6', '7,6', '5,6', '6,7', '6,5'].filter(k => B.terrain.get(k) === 'fire').length;
          out.push('gas: wolf hp ' + hp0 + ' -> ' + foes[0].hp + ', fire squares ' + fires);
          ok('gas hurts', foes[0].hp < hp0); ok('gas fire in a plus', fires >= 4);
          // shoved off the chasm: falls
          ({ party, foes } = fresh('chasm'));
          const r2 = party.find(u => u.id === 'runa'); let edgeY = 0; while (!B.voids.has('6,' + edgeY) || B.voids.has('5,' + edgeY)) edgeY++;
          r2.gx = 4; r2.gy = edgeY; foes[0].gx = 5; foes[0].gy = edgeY; hp0 = foes[0].hp;
          await B.fx(r2, [{ t: 'shove', n: 2 }], [foes[0]]);
          out.push('shove at the chasm (row ' + edgeY + '): stop=' + B.pushStop + ' wolf hp ' + hp0 + ' -> ' + foes[0].hp);
          ok('shove off the edge is a fall', B.pushStop === 'fall' && foes[0].hp < hp0);
          // ice: a shove slides on
          ({ party, foes } = fresh('square', 'snow'));
          const r3 = party.find(u => u.id === 'runa'); r3.gx = 2; r3.gy = 4; foes[0].gx = 3; foes[0].gy = 4;
          for (let x = 4; x <= 9; x++) B.terrain.set(x + ',4', 'ice');
          B.push(foes[0], r3, 2); out.push('ice: shoved 2, slid to x=' + foes[0].gx);
          ok('ice slides further', foes[0].gx > 5);
          ok('ice -1 to hit from it', B.terrainMod(r3, foes[0], 4, 4, false).bonus === -1);
          ok('fire melts ice', (B.setFire(6, 4, 2), B.ter(6, 4) === 'shallows'));
          ok('shallows cost 2', (B.terrain.set('7,7', 'shallows'), B.stepCost(7, 7) === 2));
          // smoke blocks sight through it
          B.terrain.set('5,9', 'smoke'); ok('smoke blocks sight', !B.los({ gx: 3, gy: 9 }, { gx: 7, gy: 9 })); ok('can see into smoke', B.los({ gx: 3, gy: 9 }, { gx: 5, gy: 9 }));
          // hallowed ground hurts the undead
          ({ party, foes } = fresh('square', 'crypt'));
          const shade = foes[0]; shade.tags = ['undead']; B.terrain.set(shade.gx + ',' + shade.gy, 'hallowed'); hp0 = shade.hp; await B.hallow(shade);
          out.push('hallowed: undead hp ' + hp0 + ' -> ' + shade.hp); ok('hallowed hurts undead', shade.hp < hp0);
          // 4. the AI uses a keg when two heroes stand by it, and not when its own side would be caught
          ({ party, foes } = fresh('square'));
          B.walls.set('5,5', 'keg'); B.props.set('5,5', 'keg'); party[0].gx = 4; party[0].gy = 5; party[1].gx = 5; party[1].gy = 6; foes[0].gx = 9; foes[0].gy = 5; foes[0].tags = ['goblin'];
          let ch = B.propChoice(foes[0]); out.push('AI keg choice with two heroes beside it: ' + (ch && ch.kind)); ok('AI lights the keg', ch && ch.kind === 'keg');
          foes[1].gx = 6; foes[1].gy = 5; ch = B.propChoice(foes[0]); ok('AI spares its own', !ch || ch.kind !== 'keg');
          foes[1].gx = 12; foes[1].gy = 12; foes[0].tags = ['beast']; ch = B.propChoice(foes[0]); ok('beasts leave kegs alone', !ch);
          // 5. a fight on every shape plays out, on the diamond board and the flat one
          const res = {};
          for (const view of ['iso', 'flat']) for (const shape of Object.keys(B.SHAPES)) {
            G.opts.bview = view; G.healAll(); B.forceShape = shape; B.randomBoard = true; G.fast = true; G.auto = true; G.autoPick = () => 0;
            let r; try { r = await B.start('wood_wolves', {}); } catch (e) { r = 'ERR ' + String(e.stack || e).split('\n').slice(0, 3).join(' | '); }
            res[view + ':' + shape] = r + '/' + B.rounds;
            if (String(r).startsWith('ERR')) fails.push('fight on ' + shape + ' ' + view + ': ' + r);
          }
          B.forceShape = null; B.randomBoard = false; G.opts.bview = 'iso';
          out.push('fights: ' + JSON.stringify(res));
          return { out, fails, err: G.lastError ? String(G.lastError.stack) : null };
        })()""")
        print('\n'.join(r['out']))
        print('FAILS:', r['fails'][:20], len(r['fails']))
        print('lastError:', r['err'])
        print('console:', errs[:10])
        await b.close()
        raise SystemExit(1 if r['fails'] or errs else 0)
asyncio.run(main())
