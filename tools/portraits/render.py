#!/usr/bin/env python3
"""Paints every speaker's oil portrait, and the mood faces their lines call for, into data/portraits_oil.js.

Run after tools/build.py (it reads the built game for the cast, their looks and their lines), then build again:
    python3 tools/build.py && python3 tools/portraits/render.py && python3 tools/build.py
Needs Chrome and Playwright. The painter itself is bust.js (anatomy, hair, clothes, moods) and styles.js (oil).
"""
import asyncio, base64, json, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SIZE, PAINT = 256, 512           # stored size, and the size it is painted at before shrinking
MOODS = ['happy', 'angry', 'worried', 'sad']
# characters with enough feeling in their lines to get every mood, whatever the word-guess finds
FULL = {'Runa', 'Dask', 'Maren', 'Finch', 'Veyra', 'High Warden Oriel', 'Sigrid', 'Ilvane Corr', 'Hooded Man', 'The Barrow King', 'Vael Morn', 'Grukk',
        'Brannoc', 'Harbourmaster Quill', 'Halda', 'Tobias', 'Ennet', 'Bryn', 'Old Pell', 'Wenna', 'Wren', 'Orrin', 'Ingrid'}
HEROES = {'Runa': 'runa', 'Dask': 'dask', 'Maren': 'maren', 'Finch': 'finch'}

HER={'Runa','Dask','Maren','Finch'}
F=set('veyra sigrid halda bryn ingrid wenna wren ennet ysolde brine mags asta eydis ama nagra olwen lysa oldmags gudrun ragna signe lisbet thora shieldmaiden rimemother ilsabet kid3 quell healer ada longsal noble'.split())
FOE=set('king corr corrcrowned vosk hand cutthroat inquisitor zealot frostzealot ashenknight ashmarshal duelist rimemother abbot prior archivist keeper watcher wight wraith grukk goblin snagtooth grimtusk smuggler hexer frostacolyte captain courtier'.split())
KIND={'ghoul':'ghoul','ashghoul':'ghoul','drownedman':'ghoul','alder':'ghoul','brine':'ghoul'}
AGE={'ennet':0,'ilsabet':0,'rimemother':0.2,'veyra':0.35,'sigrid':0.5,'oriel':0.9,'corr':0.8}
NASAL=set('hobb clanguard cityguard recruit zealot frostzealot captain5 shieldmaiden'.split())
CHILD=set('boy kid3 urchin tam pip'.split())
# speakers without a figure: map to a sprite or design a look
EXTRA={
 'Hooded Man':('hand',{'shadow':1,'mouth':'smirk'}),
 'Brannoc':('vosk',{'mouth':'smirk'}),
 'Snik':('goblin',{'spec':{'apron':'#8a7a5a','held':None},'mouth':'grin'}),
 'Prisoner':('cutthroat',{'spec':{'hood':None},'mouth':'frown'}),
 '???':('veyra',{'shadow':1,'mouth':'set'}),
 'Fisherman':('fisher',{}),
 'Hrimgar':('giant',{'kind':'giant','mouth':'set','age':0.9}),
 'Acolyte':('acolyte',{}),
 'Frozen Sentry':(None,{'spec':{'skin':'#c8d8e8','hair':'#e8f0f8','top':'#6a7a8a','helm':'#a8b4c4','held':'spear','fur':'#e8f0f8','beard':1},'mouth':'set','glow':'#bfe8ff','nasal':1}),
 'Solveig the Skald':(None,{'sex':'f','spec':{'skin':'#ecc8a8','hair':'#e8d090','long':1,'hs':'braids','top':'#4a3a6a','robe':1,'held':'lute','fur':'#c8b898'},'mouth':'smile'}),
 'Frost-priest':('frostacolyte',{'foe':1}),
 'Bored Guard':('cityguard',{'mouth':'set','nasal':1}),
 'Hallvard':(None,{'spec':{'skin':'#e0a67c','hair':'#a8a8a8','beard':1,'top':'#5a3a2a','helm':'#8a8a94','fur':'#c8b898','held':'axe','big':1,'scar':1},'mouth':'set','age':0.8}),
 'The Old Herald':('herald',{'age':0.9,'spec':{'hair':'#e8e8e8'}}),
 'Camp Smith':('rook',{'spec':{'skin':'#d8a070','hair':'#5a3a22','beard':1}}),
 'Skrit':('hexer',{'mouth':'smirk','foe':1}),
 'The Hollow Warden':('hollowwarden',{}),
 'Watch-Sergeant Brand':('mott',{'spec':{'hair':'#5a3a22','helm':'#a8aab4','top':'#6a1e2a','cape':'#4a1a24'},'nasal':1,'age':0.3}),
 'Grandmother':(None,{'sex':'f','spec':{'skin':'#e8c0a0','hair':'#f0eee8','hs':'bun','top':'#7a3a4a','robe':1,'scarf':'#d8a040','glasses':1},'mouth':'smirk','age':1}),
 'Vael Morn':('king',{}),
 'Hollin':('fisher2',{'spec':{'hair':'#8a5a2a','scarf':None},'mouth':'frown'}),
 'Clansman':('clanguard',{'spec':{'helm':None,'hair':'#a8672e'}}),
 "Hedda's Shield":('shieldmaiden',{'spec':{'hair':'#d8b060'}}),
 'Captain Sarre':(None,{'sex':'f','foe':1,'spec':{'skin':'#e0b090','hair':'#2a2a30','hs':'pony','top':'#2a2a34','trim':'#c8c8d4','cape':'#1a1a24','held':'sword','scar':1},'mouth':'smirk'}),
 'Inquisitor Vell':('inquisitor',{}),
 'Ducal Guard':('cityguard',{'spec':{'top':'#6a1e2a','helm':'#d8c070'},'nasal':1}),
 'Scout':('eydis',{'sex':'m','spec':{'hs':None,'long':None,'hair':'#6a4a2a'}}),
 'Messenger':('herald',{'spec':{'hat':None,'held':'scroll','hair':'#a8672e'}}),
 'Rattle Jack':('cutthroat',{'spec':{'hood':None,'hat':'#3a2a1e','feather':'#c83a2a','hair':'#3a2a1e','mus':1},'mouth':'grin'}),
 'Hexer':('hexer',{}),
 'Fisherwife':(None,{'sex':'f','spec':{'skin':'#d8a070','hair':'#6b3f2a','hs':'bun','top':'#4a6a7a','apron':'#e8e0cc','scarf':'#c8443c'},'mouth':'smile'}),
 'Old Woman':(None,{'sex':'f','spec':{'skin':'#e0b8a0','hair':'#d8d4cc','top':'#5a4a5a','robe':1,'hood':'#6a5a4a'},'age':1}),
 'Fen Warden':(None,{'spec':{'skin':'#c89070','hair':'#5a4a3a','beard':1,'top':'#4a5a3a','hood':'#5a6a3a','held':'staff'}}),
 'Sailor':('sailor',{}),
 'Smuggler':('smuggler',{'foe':1}),
 'Zealot':('zealot',{'foe':1}),
 'Weaver':(None,{'sex':'f','spec':{'skin':'#e8c0a0','hair':'#8a3a2a','hs':'bun','top':'#7a6a9a','apron':'#d8d0c0'},'mouth':'smile'}),
 'Washerwoman':(None,{'sex':'f','spec':{'skin':'#d8a880','hair':'#a8a8a0','hs':'bun','top':'#8a7a6a','apron':'#e8e0cc','sleeves':'#e8b890'},'age':0.6}),
 'Off-duty Guard':('cityguard',{'spec':{'helm':None,'hair':'#6b3f2a','mus':1},'mouth':'smile'}),
 'Pot-boy':('boy',{'child':1,'spec':{'apron':'#e8e0cc','hair':'#a8672e','hs':'spiky'}}),
 'Widow':('ama',{'sex':'f'}),
 'Warden':('kell',{'spec':{'scar':None,'hair':'#6b3f2a'},'age':0.2}),
 'Jory':('fisher',{'spec':{'hair':'#6a4a2a'}}),
}


DUMP = """() => { const m = UI.portraitMap(), out = {}, moods = {};
  const walk = s => { if (!Array.isArray(s)) { if (s && typeof s === 'object') for (const k in s) walk(s[k]); return; }
    if (s[0] === 'say' && typeof s[1] === 'string') { const o = out[s[1]] = out[s[1]] || { n: 0 }; o.n++; if (typeof s[2] === 'string') { const md = UI.moodFor(s[2]); if (md) (moods[s[1]] = moods[s[1]] || {})[md] = 1; } }
    s.forEach(walk); };
  walk(G.D.scripts); for (const id in G.D.maps) walk(G.D.maps[id]);
  for (const n of Object.keys(Object.assign({}, out, m))) { const k = m[n]; out[n] = Object.assign(out[n] || { n: 0 }, { key: k || null, spec: k ? Object.assign({}, G.D.sprites[k], (G.D.looks || {})[k]) : null }); }
  const sprites = {}; for (const k in G.D.sprites) sprites[k] = Object.assign({}, G.D.sprites[k], (G.D.looks || {})[k]);
  return { out, moods, sprites }; }"""


def cast(c, S):
    groups = {}
    def add(names, key, spec, meta):
        sig = json.dumps([key, spec, meta], sort_keys=True)
        if sig not in groups: groups[sig] = {'names': [], 'key': key, 'spec': spec, 'meta': meta}
        groups[sig]['names'] += names
    for name, v in c.items():
        if name in HER or name.startswith('Then you'): continue
        if v['key']:
            k = v['key']; meta = {}
            if k in F: meta['sex'] = 'f'
            if k in FOE: meta['foe'] = 1
            if k in KIND: meta['kind'] = KIND[k]
            if k in AGE: meta['age'] = AGE[k]
            if k in NASAL: meta['nasal'] = 1
            if k in CHILD: meta['child'] = 1
            sp = dict(v['spec'])
            if k == 'duke': sp.pop('helm', None); sp['crown'] = '#e8c14a'
            add([name], k, sp, meta)
        elif name in EXTRA:
            k, meta = EXTRA[name]; meta = dict(meta); sp = dict(S[k]) if k else {}
            for a, b in (meta.pop('spec', {}) or {}).items():
                if b is None: sp.pop(a, None)
                else: sp[a] = b
            if k in F and 'sex' not in meta: meta['sex'] = 'f'
            if k in FOE and 'foe' not in meta: meta['foe'] = 1
            if k in KIND and 'kind' not in meta: meta['kind'] = KIND[k]
            if k in CHILD: meta['child'] = 1
            add([name], k or name.lower().replace(' ', ''), sp, meta)
        else: print('no portrait for', name)
    L = list(groups.values())
    for g in L:   # a stable id from the first name, so a portrait keeps its face from one build to the next
        g['id'] = ''.join(ch for ch in g['names'][0].lower() if ch.isalnum())
    return L


PAGE = """<!doctype html><html><body><script>%s</script><script>%s</script><script>
window.paintAll = function (jobs, SIZE, PAINT) { const out = {};
  for (const j of jobs) { const tall = j.spec && (j.spec.hat || j.spec.horns || j.spec.crown || j.spec.hs === 'mohawk') || j.id === 'finch';
    const art = Styles.oil(j.id, PAINT, { spec: j.spec, meta: j.meta, mood: j.mood, noFrame: true, zoom: tall ? [13, 0, 76] : [15, 7, 72] });
    const c = document.createElement('canvas'); c.width = c.height = SIZE; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(art, 0, 0, SIZE, SIZE);
    out[j.id + '|' + j.mood] = c.toDataURL('image/webp', 0.76); }
  return out; };
window.paintGlass = function (ids, SIZE) { const out = {}; for (const id of ids) { const g = Styles.glass(id, 420, { panel: true, zoom: [12, 4, 80] }); const c = document.createElement('canvas'); c.width = c.height = SIZE; c.getContext('2d').drawImage(g, 0, 0, SIZE, SIZE); out['glass|' + id] = c.toDataURL('image/webp', 0.82); } return out; };
</script></body></html>"""


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(); await pg.add_init_script('window.__NO_TITLE = true;')
        await pg.goto('file://' + os.path.join(ROOT, 'dist', 'index.html')); await pg.wait_for_timeout(1500)
        d = await pg.evaluate(DUMP)
        L = cast(d['out'], d['sprites'])
        who, jobs = {}, []
        for h, hid in HEROES.items():
            who[h] = hid
            for m in ['usual'] + MOODS: jobs.append({'id': hid, 'mood': m, 'spec': None, 'meta': None})
        for g in L:
            ms = set()
            for n in g['names']:
                who[n] = g['id']; ms |= set(d['moods'].get(n, {}))
                if n in FULL: ms |= set(MOODS)
            for m in ['usual'] + [m for m in MOODS if m in ms]: jobs.append({'id': g['id'], 'mood': m, 'spec': g['spec'], 'meta': g['meta']})
        print(len(L) + 4, 'portraits,', len(jobs), 'pictures')
        pg2 = await b.new_page()
        html = PAGE % (open(os.path.join(HERE, 'bust.js')).read(), open(os.path.join(HERE, 'styles.js')).read())
        tmp = os.path.join(HERE, '.paint.html'); open(tmp, 'w').write(html)
        await pg2.goto('file://' + tmp); os.remove(tmp)
        img = {}
        for i in range(0, len(jobs), 20):
            img.update(await pg2.evaluate('([j, s, n]) => paintAll(j, s, n)', [jobs[i:i + 20], SIZE, PAINT]))
            sys.stdout.write('.'); sys.stdout.flush()
        img.update(await pg2.evaluate('([i, s]) => paintGlass(i, s)', [list(HEROES.values()), 320]))   # the heroes on glass, for the epilogue's windows
        await b.close()
    js = ('/* Oil portraits for everyone who speaks, painted by tools/portraits/render.py (do not edit by hand).\n'
          '   who: speaker name -> portrait id; img: "id|mood" -> picture. A missing mood falls back to "id|usual". */\n'
          '(function () {\n  G.D.portraitOil = {\n    who: ' + json.dumps(who, sort_keys=True) + ',\n    img: {\n' +
          ',\n'.join('      %s: %s' % (json.dumps(k), json.dumps(v)) for k, v in sorted(img.items())) + '\n    }\n  };\n})();\n')
    open(os.path.join(ROOT, 'data', 'portraits_oil.js'), 'w').write(js)
    print('\nwrote data/portraits_oil.js: %d pictures, %.0f KB' % (len(img), len(js) / 1024))

asyncio.run(main())
