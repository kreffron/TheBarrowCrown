"""Checks that roaming bands spawn, spot the party from three squares ahead, chase and start a fight, and that
   story foes come for you the same way. Run: python3 tools/hunttest.py"""
import asyncio
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
exec(open(os.path.join(ROOT, 'tools', 'puzzletest.py')).read().split('async def main')[0])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 960, 'height': 720}); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.add_init_script('window.__NO_TITLE = true;')
        await pg.goto('file://' + os.path.join(ROOT, 'dist', 'index.html')); await pg.wait_for_timeout(300)
        await pg.evaluate(SETUP + HELP + '; void 0')
        r = await pg.evaluate(r"""(async () => {
          const out = []; G.newGame(); Object.assign(G.S.flags,{tut:1,joined:1,'q.bounty1':1}); for (const k in G.D.banter) G.S.flags['bt.'+G.D.banter[k].id]=1;
          const counts = {};
          for (const id of Object.keys(G.D.maps)) { if (!G.D.maps[id].encounters) continue; await Field.enter(id, null, {noFade:true, noSave:true}); counts[id] = Field.map.roamers; }
          out.push('roamers per map: ' + Object.entries(counts).map(e => e[0] + '=' + e[1]).join(' '));
          await Field.enter('thornwood', null, {noFade:true});
          G.fast = false; G.auto = false; G.autoPick = null;
          let fought = []; B.start = async (g) => { fought.push(g); return 'win'; };
          UI.say = async () => {}; UI.choice = async () => 0;
          const V = {up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}; let ro = null, px, py;
          for (const t of Field.map.things.filter(t => t.def.type === 'roamer')) for (const d in V) { const w = V[d];
            if (!ro && [1,2,3].every(k => !Field.blocked(t.x+w[0]*k, t.y+w[1]*k))) { ro = t; t.dir = d; px = t.x+w[0]*3; py = t.y+w[1]*3; } }
          out.push('test roamer ' + (ro && ro.def.grp) + ' sprite ' + (ro && ro.def.sprite));
          Field.p.x = Field.p.tx = px; Field.p.y = Field.p.ty = py; ro.wt = 99999;
          for (let i = 0; i < 60 && !fought.length; i++) await new Promise(r => setTimeout(r, 100));
          out.push('roamer engaged: ' + fought.join(',') + ' removed=' + (Field.map.things.indexOf(ro) < 0) + ' gone=' + JSON.stringify(G.S.roamGone));
          const one = Field.map.things.find(t => t.def.tag === 'oneear');
          if (one) { fought = []; Field.p.x = Field.p.tx = one.x + 3; Field.p.y = Field.p.ty = one.y; one.dir = 'right';
            for (let i = 0; i < 60 && !fought.length; i++) await new Promise(r => setTimeout(r, 100));
            out.push('One-Ear came for us: ' + fought.join(',') + ' at ' + one.x + ',' + one.y); }
          // walk behind a foe: no reaction
          return out.join('\n');
        })()""")
        print(r); print(errs)
        await b.close()
asyncio.run(main())
