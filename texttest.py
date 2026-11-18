"""Content checks on the game's text: choice prompts fit the dialogue box; item, ability, status and feat descriptions
   fit the menu's description box; ability descriptions and battle intros fit the battle log; the heroes' combat quips
   keep the story's voice (no contractions); no leftover placeholders. Run: python3 tools/texttest.py"""
import asyncio
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
exec(open(os.path.join(ROOT, 'tools', 'puzzletest.py')).read().split('async def main')[0])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 960, 'height': 720}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
        await pg.add_init_script('window.__NO_TITLE = true;')
        await pg.goto('file://' + os.path.join(ROOT, 'dist', 'index.html')); await pg.wait_for_timeout(400)
        r = await pg.evaluate(r"""(() => {
          const D = G.D, fails = [], seen = new Set(), prompts = [], texts = [];
          const walk = o => { if (typeof o === 'string') { texts.push(o); return; } if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
            if (Array.isArray(o) && o[0] === 'choice' && typeof o[2] === 'string') prompts.push(o[2]);
            for (const k in o) if (k !== 'rows') walk(o[k]); };
          for (const k of ['maps', 'scripts', 'bondTalk', 'innTalk', 'campTalk', 'banter', 'bossScenes']) walk(D[k]);
          const d = UI.showDlg('Someone'), box = d.querySelector('.dtext');
          for (const t of prompts) { box.textContent = t; if (box.scrollHeight > box.clientHeight + 1) fails.push('prompt too long: ' + t.slice(0, 60)); }
          UI.hideDlg();
          const chk = (kind, t) => { if (!t) return; Menu.desc(t); if (Menu.descEl.scrollHeight > Menu.descEl.clientHeight + 1) fails.push(kind + ' description too long: ' + t.slice(0, 60)); };
          for (const x of Object.values(D.items)) chk('item', x.desc); for (const x of Object.values(D.abilities)) chk('ability', x.desc);
          for (const x of Object.values(D.statuses)) chk('status', x.desc); for (const x of Object.values(D.perks || {})) chk('feat', x.desc);
          const el = UI.el('div', 'win blog'); UI.root.appendChild(el); B.logEl = el;
          for (const a of Object.values(D.abilities)) { if (!a.desc) continue; B.setLog(a.name, a.desc); const l2 = el.querySelector('.l2'); if (l2.scrollHeight > l2.clientHeight + 1) fails.push('ability cut off in battle: ' + a.name); }
          for (const [id, g] of Object.entries(D.groups)) { if (!g.intro) continue; B.setLog(g.intro); if (el.scrollHeight > el.clientHeight + 1) fails.push('battle intro cut off: ' + id); }
          el.remove(); B.logEl = null;
          // every Guide page fits its panel, and every {key} in it is a real action
          for (const [g, pages] of D.guide || []) for (const [title, text] of pages) {
            Menu.pane(Menu.guidePage(title, text), 'journal');
            if (Menu.paneEl.scrollHeight > Menu.paneEl.clientHeight + 1) fails.push('guide page too long: ' + title + ' (' + Menu.paneEl.scrollHeight + ' > ' + Menu.paneEl.clientHeight + ')');
            const left = G.keyText(text).match(/\{[a-z_]+\}/g); if (left) fails.push('guide page names an unknown key: ' + title + ' ' + left.join(' '));
          }
          if (!(D.guide || []).length) fails.push('no guide');
          const C = /\b(I'm|I'll|I've|I'd|you're|we're|we'll|it's|that's|that'll|don't|can't|didn't|isn't|let's|who's|where's|won't)\b/;
          for (const [h, kinds] of Object.entries(D.quips || {})) for (const [k, lines] of Object.entries(kinds)) for (const l of lines) if (C.test(l)) fails.push('quip with a contraction (' + h + '): ' + l);
          for (const t of texts) if (/TODO|FIXME|lorem|undefined|NaN|\[object/.test(t)) fails.push('placeholder: ' + t.slice(0, 60));
          return { fails, prompts: prompts.length, texts: texts.length };
        })()""")
        print(r['prompts'], 'prompts,', r['texts'], 'strings checked')
        print('FAILS:', r['fails'][:20], len(r['fails'])); print('console:', errs[:5])
        await b.close()
        raise SystemExit(1 if r['fails'] or errs else 0)
asyncio.run(main())
