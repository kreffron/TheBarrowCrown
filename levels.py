"""Suggested levels for every fight, map and quest, measured from the playtest routes.

    LEVELS_OUT=/tmp/lv.jsonl PATCH="<old chapter caps>" python3 tools/playtest.py play   # and play2..play5
    python3 tools/levels.py /tmp/lv.jsonl          # writes data/ch9_world/s_levels.js

Each route records the party's level at every fight (by group), the maps it fought in, and the level at which each
quest was first taken up. The routes run under the old chapter caps (6/12/18/24/30), which is the pace the content
was built for, so these are the levels the game expects.
  - A fight's level is the highest level any route met it at: the most a party is expected to be. Above it, the
    fight pays less experience (G.xpFor) and the party is quicker off the mark (B.initBonus).
  - A fight's low level is the lowest any route met it at. Below it, the foes are quicker off the mark.
  - A map's range runs from the lowest to the highest of its fights' levels.
  - A quest's suggested level is the middle of the levels the routes took it up at, shown in the journal.
Groups no route fought take the level of their siblings (same name prefix), or of their chapter's middle.
"""
import json, os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rows = [json.loads(l) for l in open(sys.argv[1])]
glv, glo, gmap, qmin = {}, {}, {}, {}
for r in rows:
    d = r['d']
    for g, l in d['glv'].items(): glv[g] = max(glv.get(g, 0), l); glo[g] = min(glo.get(g, 99), l)
    for g, ms in d['gmap'].items(): gmap.setdefault(g, set()).update(ms)
    for q, l in d['qlv'].items(): qmin.setdefault(q, []).append(l)

# every group, and the chapter whose files define it
gch = {}
for f in sorted(glob.glob(os.path.join(ROOT, 'data', '**', '*.js'), recursive=True)):
    m = re.search(r'/ch(\d)/', f); ch = int(m.group(1)) if m else None
    for k in re.findall(r"^\s+'?(\w+)'?: \{ ?enemies:", open(f).read(), re.M): gch.setdefault(k, ch)
MID = {1: 4, 2: 9, 3: 15, 4: 21, 5: 27}
for g, ch in gch.items():
    if g in glv: continue
    pre = g.split('_')[0]
    sib = [glv[k] for k in glv if k.split('_')[0] == pre]
    glv[g] = max(sib) if sib else MID.get(ch or 1, 4)
    glo[g] = min([glo[k] for k in glo if k.split('_')[0] == pre] or [glv[g]])

qmin = {q: sorted(v)[len(v) // 2] for q, v in qmin.items()}       # the middle of the levels the routes took it up at
maps = {}
for g, ms in gmap.items():
    for m in ms: lo, hi = maps.get(m, (99, 0)); maps[m] = (min(lo, glv[g]), max(hi, glv[g]))

out = ['/* Suggested levels, measured by tools/levels.py from the playtest routes (see that file). Do not edit by hand.',
       '   groups: a fight\'s level (the most a party is expected to be); low: the least; maps: [lowest, highest] of the fights met there; quests: the level to take one up at (the middle of the routes). */',
       '(function () {', '  G.D.fightLevels = {',
       '    groups: ' + json.dumps(dict(sorted(glv.items())), separators=(',', ':')) + ',',
       '    low: ' + json.dumps(dict(sorted(glo.items())), separators=(',', ':')) + ',',
       '    maps: ' + json.dumps({k: list(v) for k, v in sorted(maps.items())}, separators=(',', ':')) + ',',
       '    quests: ' + json.dumps(dict(sorted(qmin.items())), separators=(',', ':')),
       '  };', '})();', '']
open(os.path.join(ROOT, 'data', 'ch9_world', 's_levels.js'), 'w').write('\n'.join(out))
print('%d groups, %d maps, %d quests' % (len(glv), len(maps), len(qmin)))
