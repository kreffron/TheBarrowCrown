#!/usr/bin/env python3
"""Searches for hard block rooms: fills the '?' squares of a room template with a few pillars, blocks and plates at
random, solves each try with pzsolve, and keeps the ones that need the most shoves, the most changes of direction and
are the easiest to ruin. The rooms it found are written out by hand into tools/puzzles.py; this is only the search.
  python3 tools/pzgen.py <name>     (templates below)"""
import sys, random, time
sys.path.insert(0, __import__('os').path.dirname(__file__))
from pzsolve import Room, solve_push, moves_str


def fill(tpl, rnd, nb, npl, walls, ice=False, pits=0):
    g = [list(r) for r in tpl]
    free = [(x, y) for y, r in enumerate(g) for x, c in enumerate(r) if c == '?']
    rnd.shuffle(free)
    nw = int(len(free) * walls)
    for i, (x, y) in enumerate(free):
        g[y][x] = '~' if ice else '.'
    k = 0
    for (x, y) in free[k:k + nw]: g[y][x] = '#'
    k += nw
    for (x, y) in free[k:k + npl]: g[y][x] = 'P'
    k += npl
    for (x, y) in free[k:k + nb]: g[y][x] = 'B'
    k += nb
    for (x, y) in free[k:k + pits]: g[y][x] = 'O'
    return [''.join(r) for r in g]


def score(r):
    return r['pushes'] + 3 * r['turns'] + 4 * r['dirs'] + 25 * r['deadfrac']


def search(tpl, nb, npl, walls=(0.08, 0.22), secs=60, seed=1, ice=False, pits=0, need=None, keep=5):
    rnd = random.Random(seed); best = []; t0 = time.time(); n = 0
    while time.time() - t0 < secs:
        n += 1
        rows = fill(tpl, rnd, nb, npl, rnd.uniform(*walls), ice, pits)
        try: room = Room(rows)
        except AssertionError: continue
        r = solve_push(room, limit=150000)
        if not r.get('ok'): continue
        if r['dirs'] < 3 or r['deadfrac'] < 0.35: continue
        if need and not need(r): continue
        best.append((score(r), rows, r)); best.sort(key=lambda b: -b[0]); best = best[:keep]
    return best, n


def show(best, n):
    print('tries', n)
    for sc, rows, r in best:
        print('score %.1f pushes %d turns %d dirs %d steps %d dead %.2f states %d' % (sc, r['pushes'], r['turns'], r['dirs'], r['steps'], r['deadfrac'], r['states']))
        for row in rows: print('   ', row)
        print('   ', moves_str(r['path']))


def search_route(tpl, pc=0.6, pw=0.18, secs=60, seed=1, keep=4, limit=300000):
    """cracked-floor rooms: each '?' becomes cracked floor (pc), a pillar (pw) or sound floor"""
    from pzsolve import solve
    rnd = random.Random(seed); best = []; t0 = time.time(); n = 0
    while time.time() - t0 < secs:
        n += 1
        g = [list(r) for r in tpl]
        for y, r in enumerate(g):
            for x, c in enumerate(r):
                if c == '?':
                    u = rnd.random(); g[y][x] = '_' if u < pc else '#' if u < pc + pw else '.'
        rows = [''.join(r) for r in g]
        r = solve(Room(rows), limit=limit)
        if not r.get('ok'): continue
        sc = r['steps'] + 60 * r['ruinrate'] + 10 * r['deadfrac']
        best.append((sc, rows, r)); best.sort(key=lambda b: -b[0]); best = best[:keep]
    print('tries', n)
    for sc, rows, r in best:
        print('score %.1f steps %d ruinrate %.2f dead %.2f states %d' % (sc, r['steps'], r['ruinrate'], r['deadfrac'], r['states']))
        for row in rows: print('   ', row)
        print('   ', moves_str(r['path']))
    return best


TEMPLATES = {
    'mill1': {'nb': 2, 'np': 2, 'rows': [
        '##########', '##???????#', '#????????#', '#???????.E', '#????????#', '#????????#', '#???@????#', '##??#????#', '##########']},
    # the Millrace R2: south of the race (two hidden plates drain it), then north of it (two plates lift the gate)
    'mill2s': {'nb': 2, 'np': 2, 'rows': [
        '#####E######', '#????.?????#', '#@?????????#', '#??????????#', '#??????????#', '#??????????#', '#??????????#', '############']},
    'mill2n': {'nb': 2, 'np': 2, 'rows': [
        '############', '#????????#?#', '#??????????#', '#?????????.E', '#??????????#', '#??????????#', '#??????????#', '#....@.....#', '############']},
    # the Millrace R3: above the short race, then west of the long race
    'mill3a': {'nb': 2, 'np': 2, 'rows': [
        '##########', '##???????#', '#????????#', '#@???????#', '#????????#', '###E######']},
    # the Drowned Chapel R3: the dry end of the reliquary, and the sunken aisle up to the first plate
    'chapel3': {'nb': 2, 'np': 1, 'rows': [
        '##########', '#####P####', '#####.####', '#####.####', '#####.####', '#?.??????#', '#????????#', '@????????#', '#????????#', '##########']},
    # the Ice Halls: three rinks (~ ice; the party walks, the blocks slide)
    'ice1': {'nb': 2, 'np': 2, 'ice': True, 'rows': [
        '##########', '#????????#', '#????????#', '#???????~E', '#????????#', '#???@????#', '##..#...##', '##########']},
    'ice2': {'nb': 2, 'np': 2, 'ice': True, 'rows': [
        '###########', '#?????????#', '#????????~E', '#?????????#', '@?????????#', '#?????????#', '#?????????#', '#?????????#', '###########']},
    'ice3': {'nb': 2, 'np': 2, 'ice': True, 'rows': [
        '#####E######', '#????~?????#', '#??????????#', '#??????????#', '#??????????#', '#@?????????#', '#??????????#', '#??????????#', '#??????????#', '############']},
    # the Undercroft R2: two rows of pit between the party and the far side; two boulders to fill a way
    'lamp2': {'nb': 2, 'np': 0, 'rows': [
        '#################', '#EEEEEEEEEEEEEEE#', '#OOOOOOOOOOOOOOO#', '#OOOOOOOOOOOOOOO#', '#???????????????#', '@???????????????#', '#???????????????#', '#################']},
    # the Smith's Deep R3, the Quench: all ice, a pit down the middle any stone can fill, a plate beyond it
    'smith3': {'nb': 2, 'np': 1, 'ice': True, 'rows': [
        '############', '#?????O????#', '#?????O????#', '@?????O????#', '#?????O????#', '#?????O????#', '#?????O????#', '#?????O????#', '#?????O??~?#', '#########E##']},
    'mill3b': {'nb': 2, 'np': 2, 'rows': [
        '######', '#?@??#', '#????#', '#????#', '#????#', '#????#', '#????#', '#????#', '#????#', '######']},
}

ROUTES = {
    # the Sea-Caves grotto: the gull-song struck in order (shell, moon, sun, wave, gull) from a shelf of rotten rock
    'caves3': ['################', '###?5?4?1?2?3?##', '###???????????##', '###???????????##', '###???????????##', '#####@#####E####'],
    'barrow3s': ['####E####', '#?1???2?#', '#???????#', '#???????#', '#???????#', '#?3???4?#', '####@####'],
    'barrow3': ['#####E#####', '#?1?????2?#', '#?????????#', '#?????????#', '#?????????#', '#?3?????4?#', '#####@#####'],
}

if __name__ == '__main__':
    name = sys.argv[1]
    if name in ROUTES:
        search_route(ROUTES[name], pc=float(sys.argv[4]) if len(sys.argv) > 4 else 0.6, pw=float(sys.argv[5]) if len(sys.argv) > 5 else 0.18, secs=float(sys.argv[2]) if len(sys.argv) > 2 else 60, seed=int(sys.argv[3]) if len(sys.argv) > 3 else 1); sys.exit()
    t = TEMPLATES[name]
    best, n = search(t['rows'], t['nb'], t['np'], t.get('walls', (0.08, 0.22)), float(sys.argv[2]) if len(sys.argv) > 2 else 60, int(sys.argv[3]) if len(sys.argv) > 3 else 1, t.get('ice', False), t.get('pits', 0))
    show(best, n)


# ---------------------------------------------------------------- sneaking rooms: guards, and shelves to hide behind
def search_guards(tpl, secs=60, seed=1, keep=4, nguards=(2, 3), nshelves=(2, 3), walls=(0.08, 0.2), limit=400000, edge=True):
    """'?' squares become floor, a fixed bookcase (#), a shelf (B) or a guard (g, h, j). Keeps rooms that cannot be
    crossed without moving a shelf, can be crossed cleanly (never caught) from the lever's spot, and are easy to ruin."""
    from pzsolve import GuardRoom, solve_guards
    rnd = random.Random(seed); best = []; t0 = time.time(); n = 0
    DIRN = ['up', 'down', 'left', 'right']
    while time.time() - t0 < secs:
        n += 1
        g = [list(r) for r in tpl]
        free = [(x, y) for y, r in enumerate(g) for x, c in enumerate(r) if c == '?']
        rnd.shuffle(free)
        for (x, y) in free: g[y][x] = '.'
        k = 0; nw = int(len(free) * rnd.uniform(*walls))
        for (x, y) in free[k:k + nw]: g[y][x] = '#'
        k += nw
        # '%': a square of the fixed bookcase rows, mostly bookcase with the odd gap (or a shelf in the gap)
        stack = [(x, y) for y, r in enumerate(tpl) for x, c in enumerate(r) if c == '%']
        sw = rnd.uniform(0.6, 0.85)
        for (x, y) in stack: g[y][x] = '#' if rnd.random() < sw else '.'
        guards = {}
        marked = [(x, y) for y, r in enumerate(tpl) for x, c in enumerate(r) if c == 'G']
        for (x, y) in marked: g[y][x] = '.'
        rnd.shuffle(marked)
        spots = marked or [p for p in free[k:] if not edge or p[0] in (1, len(g[0]) - 2) or p[1] in (1, len(g) - 2)]
        for i, ch in enumerate('ghj'[:rnd.randint(*nguards)]):
            if not spots: break
            (x, y) = spots.pop(); g[y][x] = ch
            turns = [rnd.choice(DIRN) for _ in range(rnd.choice([2, 2, 3, 4]))]
            if marked:                                       # a marked spot watches its aisle, then glances elsewhere
                along = 'right' if x < len(g[0]) // 2 else 'left'
                turns = [along] + [rnd.choice(DIRN) for _ in range(rnd.choice([1, 1, 2, 3]))]
            if len(set(turns)) == 1: turns[-1] = rnd.choice([d for d in DIRN if d != turns[0]])
            guards[ch] = {'turns': turns, 'range': rnd.randint(5, 10), 'every': rnd.choice([1, 1, 2])}
        rest = [p for p in free[k:] if g[p[1]][p[0]] == '.']
        for (x, y) in rest[:rnd.randint(*nshelves)]: g[y][x] = 'B'
        rows = [''.join(r) for r in g]
        try: room = GuardRoom(rows, guards)
        except AssertionError: continue
        if any(room.start in room.sight(room.blocks0, i) for i in range(room.L)): continue
        # no way through without shifting a shelf
        fixed = GuardRoom([r.replace('B', '#') for r in rows], guards)
        if solve_guards(fixed, limit=limit, deadness=False, allow_caught=False).get('ok'): continue
        r = solve_guards(room, limit=limit, allow_caught=False)
        if not r.get('ok') or r['pushes'] < 2: continue
        # every guard must matter: without it, the way through is shorter or needs fewer shoves
        def without(ch):
            g2 = dict(guards); del g2[ch]
            return solve_guards(GuardRoom([row.replace(ch, '#') for row in rows], g2), limit=limit, deadness=False, allow_caught=False)
        if any((lambda w: w.get('ok') and w['steps'] >= r['steps'] and w['pushes'] >= r['pushes'])(without(ch)) for ch in guards): continue
        sc = r['steps'] + 5 * r['pushes'] + 8 * r['dirs'] + 30 * r['deadfrac'] + 60 * r['pushruin']
        best.append((sc, rows, guards, r)); best.sort(key=lambda b: -b[0]); best = best[:keep]
    print('tries', n)
    for sc, rows, guards, r in best:
        print('score %.1f steps %d pushes %d dirs %d dead %.2f pushruin %.2f states %d' % (sc, r['steps'], r['pushes'], r['dirs'], r['deadfrac'], r['pushruin'], r['states']))
        for row in rows: print('   ', row)
        print('   ', guards)
        print('   ', ' '.join(r['path']))
    return best


GUARDS = {
    # the Archive R2, the stacks: in from the hall of records (bottom), out east to the reading room; the red lever
    # stands left of the door
    'stacks2': ['#############', '#???????????#', '#???????????E', '#%%%%%%%%%%%#', '#???????????#', '#%%%%%%%%%%%#', '#???????????#', '#%%%%%@%%%%%#', '#############'],
    'stacks3': ['#############', '#%%%%%%%%%%%#', '#???????????E', '#%%%%%%%%%%%#', '#???????????#', '#%%%%%%%%%%%#', '#???????????#', '#????%@?????#', '#############'],
    'stacks4': ['#############', '#%%%%%%%%%%%#', '#G??????????E', '#%%%%%%%%%%%#', '#G?????????G#', '#%%%%%%%%%%%#', '#G?????????G#', '#????%@?????#', '#############'],
    'stacks': ['#############', '#???????????#', '#???????????E', '#???????????#', '#???????????#', '#???????????#', '#???????????#', '#????#@?????#', '#############'],
}
