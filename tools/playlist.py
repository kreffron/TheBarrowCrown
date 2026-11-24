#!/usr/bin/env python3
"""Builds the soundtrack page: every track in the game, played by the game's own audio engine (src/audio.js), grouped,
with where each one plays and a keep / change / note for each, to send back.
  1. dump the composed music from the built game (tools/playlist.py dump needs playwright and dist/index.html)
  2. python3 tools/playlist.py  -> playlist/index.html"""
import json, os, sys, asyncio, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'playlist')
DUMP = os.path.join(OUT, 'music.json')

DUMP_JS = r"""
const D = G.D, out = { tracks: {}, maps: {}, bosses: {} };
for (const [id, t] of Object.entries(D.music)) {
  let len = 0; for (const v of t.voices) { if (v.drum) len = Math.max(len, v.drum.replace(/[\s|]/g, '').length); else if (v.notes) len = Math.max(len, v.notes.split(/\s+/).filter(x => x && x !== '|').reduce((n, x) => n + +(x.split(':')[1] || 1), 0)); }
  out.tracks[id] = { bpm: t.bpm, verb: t.verb, voices: t.voices, secs: Math.round(len * 30 / t.bpm) };
}
for (const [id, m] of Object.entries(D.maps)) { const t = D.musicFor(m); if (t && !/^v_/.test(id)) (out.maps[t] = out.maps[t] || []).push(m.name || id); }
for (const [gid, tid] of Object.entries(D.bossMusic)) {
  const g = D.groups[gid]; if (!g) continue;
  const e = D.enemies[gid] || g.enemies.map(k => D.enemies[k]).filter(Boolean).sort((a, b) => (b.hp || 0) - (a.hp || 0))[0];
  const n = e ? e.name : gid; out.bosses[tid] = out.bosses[tid] || []; if (out.bosses[tid].indexOf(n) < 0) out.bosses[tid].push(n);
}
JSON.stringify(out)
"""


async def dump():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(); await pg.add_init_script('window.__NO_TITLE = true;')
        await pg.goto('file://' + os.path.join(ROOT, 'dist', 'index.html')); await pg.wait_for_timeout(500)
        s = await pg.evaluate(DUMP_JS); await b.close()
    os.makedirs(OUT, exist_ok=True); open(DUMP, 'w').write(s)


# Titles and where each plays (the maps list from the game is added after)
GROUPS = [
    ('The road', 'Towns, inns and the open country.', [
        ('title', 'Title', 'The title screen.'), ('town', 'Brackenford', 'Chapter 1 town.'), ('field', 'The Thornwood', 'Chapter 1 open country.'),
        ('harbor', 'Saltmere', 'Chapter 2 town.'), ('fen', 'The Mirefen', 'Chapter 2 open country.'), ('hold', 'Karrow', 'Chapter 3 town.'),
        ('frost', 'The Frost Pass', 'Chapter 3 open country.'), ('city', 'Highmoor', 'Chapter 4 city.'), ('ashen', 'The Ashlands', 'Chapter 5 open country.'),
        ('tavern', 'The inns', 'Every inn and tavern.'), ('shop', 'The shops', 'Every shop. New.'), ('hymn', 'Temples and chapels', 'New.'),
        ('court', 'The Duke\'s court', 'Highmoor palace and counting-house. New.')]),
    ('Story', 'Visions, dreams and the ominous moments.', [
        ('omen', 'Omen', 'Visions and the dread scenes.'), ('dream', 'Dream', 'Dreams and the mirror. New.')]),
    ('Underground', 'Each chapter\'s dungeons.', [
        ('dungeon', 'Old stone', 'Chapter 1 cellars and towers.'), ('crypt', 'The crypt', 'Chapter 1 barrows and crypts.'), ('cave', 'The caves', 'Chapters 1 and 2 caves.'),
        ('sunken', 'Sunken', 'Chapter 2 abbey and sea-caves.'), ('cairn', 'The cairns', 'Chapter 3 barrows.'), ('frostcave', 'Ice caves', 'Chapter 3 ice caves and shrine. New.'),
        ('catacomb', 'Catacombs', 'Chapter 4 underground.'), ('undercroft', 'The Undercroft', 'Chapter 4 vaults and sewers.'), ('cinder', 'Cinder', 'Chapter 5 underground.'),
        ('throne', 'Vael Morn\'s halls', 'The last dungeon.')]),
    ('Puzzle dungeons', 'A theme per chapter. All new except the first.', [
        ('puzzle', 'Music-box', 'Chapter 1: Millrace Cellars, Hollow Barrow vault.'), ('puzzle_tide', 'Bells under water', 'Chapter 2: Drowned Chapel, Sea-Caves grotto. New.'),
        ('puzzle_frost', 'Glass and mirrors', 'Chapter 3: Ice Halls, Echo Spire. New.'), ('stealth', 'Tiptoe', 'Chapter 4: the Inquisitor\'s Archive. New.'),
        ('puzzle_lamp', 'The four lamps', 'Chapter 4: the Undercroft of Lamps. New.'), ('puzzle_forge', 'Hammer and quench', 'Chapter 5: the Smith\'s Deep. New.')]),
    ('Battles', 'Ordinary fights, by chapter, and the fallback boss music.', [
        ('battle', 'Battle I', 'Chapter 1 fights.'), ('battle2', 'Battle II', 'Chapter 2 fights.'), ('battle_frost', 'Battle in the frost', 'Chapter 3 fights.'),
        ('battle3', 'Battle IV', 'Chapter 4 fights.'), ('battle_ash', 'Battle in the ash', 'Chapter 5 fights.'), ('boss', 'Boss', 'Veyra (both early fights).'),
        ('boss2', 'Boss II', 'Spare: any later boss without a theme.'), ('finale', 'Finale', 'Corr and Vael Morn.')]),
]


def build():
    d = json.load(open(DUMP))
    T = d['tracks']; listed = set(); groups = []
    for gname, gnote, items in GROUPS:
        rows = []
        for tid, title, where in items:
            if tid not in T: continue
            listed.add(tid); places = d['maps'].get(tid, [])
            rows.append({'id': tid, 'title': title, 'where': where, 'places': places[:8], 'more': max(0, len(places) - 8), 'secs': T[tid]['secs']})
        groups.append({'name': gname, 'note': gnote, 'rows': rows})
    boss = []
    for tid in [k for k in T if k.startswith('boss_')]:
        listed.add(tid); names = d['bosses'].get(tid, [tid[5:]])
        boss.append({'id': tid, 'title': names[0], 'where': ('Also: ' + ', '.join(names[1:])) if len(names) > 1 else '', 'places': [], 'more': 0, 'secs': T[tid]['secs']})
    groups.append({'name': 'Boss themes', 'note': 'Every boss, in story order. Each takes the band of its kind: brutes pound, the dead toll, beasts stampede, rogues swagger, zealots march, the uncanny glitter.', 'rows': boss})
    rest = [k for k in T if k not in listed]
    if rest: groups.append({'name': 'Other', 'note': '', 'rows': [{'id': k, 'title': k, 'where': '', 'places': d['maps'].get(k, []), 'more': 0, 'secs': T[k]['secs']} for k in rest]})
    music = {k: {'bpm': v['bpm'], 'verb': v.get('verb'), 'voices': v['voices']} for k, v in T.items()}
    audio = open(os.path.join(ROOT, 'src', 'audio.js')).read()
    # the page's own changes to the engine: start where asked (not where a track was left), and report the loop position
    audio = audio.replace('const from = resumeAt[name] || 0;', 'const from = G.__from || 0; G.__from = 0;')
    audio = audio.replace('return { unlock, sfx, note, music, setOpts, current: () => cur || wanted };',
                          'return { unlock, sfx, note, music, setOpts, current: () => cur || wanted, info: () => (ac && loopLen ? { t: ac.currentTime - startT, len: loopLen * stepDur, steps: loopLen, step: stepDur } : null) };')
    assert 'G.__from' in audio and 'info:' in audio
    total = sum(v['secs'] for v in T.values())
    page = open(os.path.join(ROOT, 'tools', 'playlist.html')).read()
    page = page.replace('/*__AUDIO__*/', audio).replace('/*__MUSIC__*/', json.dumps(music, separators=(',', ':'))).replace('/*__GROUPS__*/', json.dumps(groups, ensure_ascii=False))
    page = page.replace('__COUNT__', str(len(T))).replace('__TOTAL__', '%d hours %d minutes' % (total // 3600, total % 3600 // 60) if total >= 3600 else '%d minutes' % (total // 60))
    assert '</script' not in json.dumps(music)
    open(os.path.join(OUT, 'index.html'), 'w').write(page)
    print('playlist/index.html: %d tracks, %d min, %.0f KB' % (len(T), total // 60, len(page) / 1024))


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'dump': asyncio.run(dump())
    build()
