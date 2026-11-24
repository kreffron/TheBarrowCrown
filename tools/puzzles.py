#!/usr/bin/env python3
"""Builds data/ch9_world/g_puzzles.js: the puzzle dungeons. Each map is carved here on a grid (so the rows always
line up), and its things are JS snippets. Run: python3 tools/puzzles.py"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Grid:
    def __init__(self, w, h, fill='#'):
        self.w, self.h = w, h
        self.g = [[fill] * w for _ in range(h)]

    def box(self, x0, y0, x1, y1, ch='.'):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.g[y][x] = ch

    def put(self, x, y, ch):
        assert 0 <= x < self.w and 0 <= y < self.h, (x, y, ch)
        self.g[y][x] = ch

    def line(self, pts, ch):
        for x, y in pts:
            self.put(x, y, ch)

    def rows(self):
        return [''.join(r) for r in self.g]

    def js(self):
        return ',\n'.join("      '" + r.replace('\\', '\\\\').replace("'", "\\'") + "'" for r in self.rows())


MAPS = []

# ---------------------------------------------------------------- the hard rooms
# Each is laid out by hand from a room found by tools/pzgen.py (a random search scored by tools/pzsolve.py), and solved
# again here on every build: the shortest solution and how easy the room is to ruin go into tools/pz_rooms.json, which
# tools/puzzletest.py walks through the real game. In a layout: # pillar, B block, P plate (in reading order: the first
# P gets the first plate key), O pit a block fills, _ cracked floor, ~ ice, 1-9 things used in order, @ the way in,
# E the way out. Squares marked '#' or 'E' in the template are the room's walls and doors, and are left alone.
import json, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pzsolve import Room, solve, solve_push, GuardRoom, solve_guards
ROOMS = {}


def stamp(g, mid, rid, x0, y0, tpl, lay, keys, solver_rows=None):
    """lay the room `lay` into the grid at (x0, y0). keys: what each layout letter becomes on the map (P: a list of
    plate keys, used in reading order; 1-9 likewise a list)."""
    assert len(tpl) == len(lay) and all(len(a) == len(b) for a, b in zip(tpl, lay)), rid
    plates = list(keys.get('P', [])); nums = {}
    for j, (trow, lrow) in enumerate(zip(tpl, lay)):
        for i, (tc, lc) in enumerate(zip(trow, lrow)):
            if tc in '#E': assert lc == tc, (rid, i, j, tc, lc); continue
            x, y = x0 + i, y0 + j
            if lc == 'P': g.put(x, y, plates.pop(0))
            elif lc in '123456789': nums[lc] = (x, y); g.put(x, y, keys[lc])
            elif lc == '@': g.put(x, y, keys.get('@', keys.get('.', '.')))
            else: g.put(x, y, keys[lc])
    room = Room(solver_rows or lay)
    r = (solve if (room.cracks or room.targets) else solve_push)(room)
    assert r.get('ok'), (mid, rid, r)
    st = room.start
    ROOMS.setdefault(mid, {})[rid] = {'start': [x0 + st[0], y0 + st[1]], 'path': r['path'], 'steps': r['steps'],
        'pushes': r['pushes'], 'dead': r.get('deadfrac'), 'states': r['states']}
    return r


import random
DECOR = {'millrace': '○≋∴', 'hollowbarrow': '¤∴%', 'drownedchapel': '≋○∴', 'seacaves': '○◊≋·', 'icehalls': '❄✧', 'echospire': '∴¤▫', 'archive': '▫¤V', 'lampvault': '¤%∴'}


def decorate(mid, grid, rate=0.06):
    # scatter floor-level decor (nothing solid, so no path or slide changes) on plain floor squares
    rnd = random.Random(mid)
    for y in range(1, grid.h - 1):
        for x in range(1, grid.w - 1):
            if grid.g[y][x] == '.' and rnd.random() < rate:
                grid.g[y][x] = rnd.choice(DECOR[mid])


def emit(mid, head, grid, things, extra='', rename=None):
    if mid in DECOR: decorate(mid, grid)
    # rename: thing characters to swap (uppercase letters clash with the global tile legend)
    if rename:
        grid.g = [[rename.get(c, c) for c in row] for row in grid.g]
        out = []
        for t in things:
            k = t.split(':', 1)[0]
            if k in rename:
                n = rename[k]; t = (("'%s'" % n) if n.isdigit() else n) + ':' + t.split(':', 1)[1]
            out.append(t)
        things = out
    MAPS.append('  M.%s = {\n%s,\n    rows: [\n%s\n    ],\n    things: {\n%s\n    }%s\n  };' % (
        mid, head, grid.js(), ',\n'.join('      %s' % t for t in things), extra))


# ---------------------------------------------------------------- Ch 1: the Millrace Cellars (Runa: shove; Dask: spot)
# Five block rooms, two millstones and two plates each, every one easy to ruin with a careless shove. R2's drain plates
# are hidden under the silt: Dask has to find them before Runa can plan.
g = Grid(30, 15)
g.box(1, 7, 8, 13)                      # R1: the sluice room
g.box(2, 3, 4, 5); g.put(3, 6, 's')     # a hidden alcove behind a secret door
g.box(10, 1, 19, 13)                    # R2: the split race
g.box(21, 1, 28, 4)                     # R3: above the short race
g.box(21, 6, 28, 13)                    # R3: either side of the long race
for x in range(10, 20): g.put(x, 7, 'c')                 # R2's race
for x in range(21, 25): g.put(x, 5, 'k')                 # R3's short race
for y in range(6, 14): g.put(25, y, 'l')                 # R3's long race
MILL = {
    'r1': (0, 6, ['##########', '##???????#', '#????????#', '#???????.E', '#????????#', '#????????#', '#???@????#', '##??#????#', '##########'],
                 ['##########', '##.......#', '#......BP#', '#........E', '#..#.....#', '#....#...#', '##.B@.#..#', '##..#P...#', '##########'],
           {'B': 'm', 'P': ['p', 'α'], '#': 'U'}),
    'r2s': (9, 7, ['#####E######', '#????.?????#', '#@?????????#', '#??????????#', '#??????????#', '#??????????#', '#??????????#', '############'],
                  ['#####E######', '#..........#', '#@P........#', '#P..#....#.#', '#...#.B..#.#', '#....#.#B.##', '#....#....##', '############'],
           {'B': 'n', 'P': ['h', 'β'], '#': 'X'}),
    'r2n': (9, 0, ['############', '#????????#?#', '#??????????#', '#?????????.E', '#??????????#', '#??????????#', '#??????????#', '#....@.....#', '############'],
                  ['############', '###......#.#', '#...#..B...#', '#P...#.B...E', '#..#.##....#', '#..........#', '#.P........#', '#....@.....#', '############'],
           {'B': 'ν', 'P': ['q', 'γ'], '#': 'U', '.': '.'}),
    'r3a': (20, 0, ['##########', '##???????#', '#????????#', '#@???????#', '#????????#', '###E######'],
                   ['##########', '##....#..#', '##.#.P...#', '#@...B#B.#', '#.....#.P#', '###E######'],
           {'B': 'o', 'P': ['a', 'δ'], '#': 'X'}),
    'r3b': (20, 5, ['######', '#?@??#', '#????#', '#????#', '#????#', '#????#', '#????#', '#????#', '#????#', '######'],
                   ['######', '#.@..#', '#..B.#', '#.#B.#', '#.#..#', '##...#', '##...#', '#PP..#', '#..#.#', '######'],
           {'B': 'ω', 'P': ['b', 'ε'], '#': 'U'}),
}
for rid, (x0, y0, tpl, lay, keys) in MILL.items():
    keys = dict({'.': '.', '@': '.'}, **keys)
    rows = lay
    if rid == 'r2n': rows = [r.replace('@', '.') if i != 7 else r for i, r in enumerate(lay)]
    stamp(g, 'millrace', rid, x0, y0, tpl, lay, keys)
for x in range(10, 20): g.put(x, 7, 'c')                 # (the race row is the way in to R2's north half)
g.put(4, 13, 'u'); g.put(9, 9, 'g'); g.put(1, 7, '1'); g.put(1, 13, 't'); g.put(3, 4, 'e')
g.put(20, 3, 'i'); g.put(13, 10, 'v'); g.put(19, 12, '2'); g.put(18, 1, '6'); g.put(21, 1, '3'); g.put(21, 10, '4')
for x in range(25, 29): g.put(x, 5, '#')                 # the short race only runs under the west half
g.put(27, 12, 'z'); g.put(28, 6, 'U'); g.put(26, 13, '%'); g.put(28, 13, 'U')
emit('millrace', "    name: 'The Millrace Cellars', ground: 'stone', ground2: 'cave', music: 'dungeon', bg: 'crypt', dark: 0.35, travel: false", g, [
    "u: { type: 'warp', to: 'mill', at: '__MILL__', gfx: 'stairsUp', out: 'up' }",
    "t: { type: 'sign', gfx: 'notice', script: [['note', 'Chalked on a board in a miller\\'s hand: SLUICES WORK OFF THE STONES. TWO STONES, TWO PLATES, EVERY GATE. A STONE IN A CORNER STAYS THERE.'], ['note', 'Runa can shove the millstones: put her in front and walk into one, or press F beside it. She can only push, never pull. If a stone gets stuck, pull the room\\'s red lever, or open the menu (Esc) and choose Start this room over.']] }",
    "m: { type: 'obj', pz: 'block', gfx: 'millstone', room: 'r1' }",
    "p: { type: 'pz', pz: 'plate', flag: 'mr.g1a', room: 'r1', pressText: 'One plate down. The sluice gate shudders, but holds.' }",
    "'α': { type: 'pz', pz: 'plate', flag: 'mr.g1b', room: 'r1', pressText: 'One plate down. The sluice gate shudders, but holds.' }",
    "g: { type: 'obj', gfx: 'sluice', unless: 'mr.g1a&mr.g1b', script: [['note', 'An iron sluice gate, shut. There are two stone plates in the floor of this room, and it wants both held down.']] }",
    "s: { type: 'obj', pz: 'secret', text: 'Dask leans on a stone that is a shade cleaner than the rest. It swings in on a pivot: the miller\\'s hidey-hole.' , hidden: true }",
    "e: { type: 'chest', gold: 30, items: { draught: 2 } }",
    "n: { type: 'obj', pz: 'block', gfx: 'millstone', room: 'r2s' }",
    "h: { type: 'pz', pz: 'plate', flag: 'mr.dr2a', room: 'r2s', hidden: true, pressText: 'Something under the silt clunks. The race gurgles, but the water stays.' }",
    "'β': { type: 'pz', pz: 'plate', flag: 'mr.dr2b', room: 'r2s', hidden: true, pressText: 'Something under the silt clunks. The race gurgles, but the water stays.' }",
    "c: { type: 'pz', pz: 'gap', under: 'water', open: 'mr.dr2a&mr.dr2b', openGfx: 'mud', room: 'r2s' }",
    "'ν': { type: 'obj', pz: 'block', gfx: 'millstone', room: 'r2n' }",
    "q: { type: 'pz', pz: 'plate', flag: 'mr.g2a', room: 'r2n', pressText: 'A plate goes down. The second sluice gate creaks.' }",
    "'γ': { type: 'pz', pz: 'plate', flag: 'mr.g2b', room: 'r2n', pressText: 'A plate goes down. The second sluice gate creaks.' }",
    "i: { type: 'obj', gfx: 'sluice', unless: 'mr.g2a&mr.g2b', script: [['note', 'Another sluice gate. Two plates again, by the look of the floor.']] }",
    "v: { type: 'sign', gfx: 'notice', script: [['note', 'Scratched into a beam: TWO DRAIN-PLATES UNDER THE SILT, THIS SIDE OF THE RACE. LOOK BEFORE YOU SHOVE. Teague never could find them.'], ['say', 'Dask', 'Under the silt. Somebody with good eyes, then. Let me walk the room before Runa starts shoving.']] }",
    "o: { type: 'obj', pz: 'block', gfx: 'millstone', room: 'r3a' }",
    "a: { type: 'pz', pz: 'plate', flag: 'mr.dr3a', room: 'r3a', pressText: 'A plate goes down. Half the weight the race needs.' }",
    "'δ': { type: 'pz', pz: 'plate', flag: 'mr.dr3c', room: 'r3a', pressText: 'A plate goes down. Half the weight the race needs.' }",
    "k: { type: 'pz', pz: 'gap', under: 'water', open: 'mr.dr3a&mr.dr3c', openGfx: 'mud', room: 'r3a' }",
    "'ω': { type: 'obj', pz: 'block', gfx: 'millstone', room: 'r3b' }",
    "b: { type: 'pz', pz: 'plate', flag: 'mr.dr3b', room: 'r3b', pressText: 'A plate goes down. The long race shivers.' }",
    "'ε': { type: 'pz', pz: 'plate', flag: 'mr.dr3d', room: 'r3b', pressText: 'A plate goes down. The long race shivers.' }",
    "l: { type: 'pz', pz: 'gap', under: 'water', open: 'mr.dr3b&mr.dr3d', openGfx: 'mud', room: 'r3b' }",
    "z: { type: 'obj', gfx: 'shrine', script: [['run', 'pzMillrace']] }",
    "'1': { type: 'obj', pz: 'reset', room: 'r1', back: [4, 12], area: [1, 7, 8, 13] }",
    "'2': { type: 'obj', pz: 'reset', room: 'r2s', back: [10, 9], area: [10, 8, 19, 13] }",
    "'6': { type: 'obj', pz: 'reset', room: 'r2n', back: [14, 7], area: [10, 1, 19, 7] }",
    "'3': { type: 'obj', pz: 'reset', room: 'r3a', back: [21, 3], area: [21, 1, 28, 4] }",
    "'4': { type: 'obj', pz: 'reset', room: 'r3b', back: [22, 6], area: [21, 5, 24, 13] }",
], ",\n    onEnter: [['if', '!pz.mr.in', [['set', 'pz.mr.in'], ['note', 'Under the mill the old race runs through three stone cellars, and the sluice gates between them are all shut.'], ['say', 'Runa', 'Stones and plates. I can shift stones.'], ['say', 'Dask', 'You can shift them into corners, too. Look first.']]]]")

# ---------------------------------------------------------------- Ch 1: the Hollow Barrow (Dask: spot; Maren: light)
g = Grid(28, 17)
g.box(1, 9, 12, 15)                     # R1: the trapped hall
g.box(13, 13, 13, 14)                   # doorway to R2
g.box(14, 9, 26, 15)                    # R2: the chasm
for x in range(14, 27):
    for y in (11, 12): g.put(x, y, '▒')
for y in (11, 12): g.put(20, y, 'b')     # the bridge that comes down
# R3: the vault of brittle bone-floor. Four lamps to light in the order the dead are counted (one skull, two...), and
# every cracked square takes one crossing: the way between the lamps has to be planned before the first step.
VAULT_T = ['####E####', '#?1???2?#', '#???????#', '#???????#', '#???????#', '#?3???4?#', '####@####']
VAULT = ['####E####', '#_1.__2.#', '#._...__#', '#___.__##', '#_____.##', '#_3___4.#', '####@####']
stamp(g, 'hollowbarrow', 'r3', 11, 2, VAULT_T, VAULT, {'_': 'κ', '.': '.', '#': 'I', '1': 'λ', '2': 'μ', '3': 'π', '4': 'σ', '@': 'r'})
g.put(15, 1, 'z'); g.put(15, 2, 'g')                     # the sarcophagus, behind its grate
g.box(21, 5, 25, 7); g.put(22, 8, 's')                   # an alcove behind a secret door
safe = [(2, 14), (3, 14), (4, 14), (4, 13), (4, 12), (5, 12), (6, 12), (6, 11), (6, 10), (7, 10), (8, 10), (9, 10), (9, 11), (9, 12), (10, 12), (11, 12), (11, 13), (12, 13), (12, 14)]
for x in range(3, 13):
    for y in range(9, 16):
        if (x, y) not in safe: g.put(x, y, 'x')
g.put(2, 15, 'u'); g.put(1, 9, '5'); g.put(12, 9, '5'); g.put(1, 13, 'w'); g.put(3, 9, '%'); g.put(2, 9, '%')
g.put(23, 10, 'q'); g.put(24, 13, '6'); g.put(15, 15, '%'); g.put(26, 15, '%'); g.put(14, 9, '%')
g.put(25, 6, 'e'); g.put(21, 5, '%'); g.put(14, 9, 'v'); g.put(17, 9, '3')
emit('hollowbarrow', "    name: 'The Hollow Barrow', ground: 'cave', ground2: 'stone', music: 'dungeon', bg: 'crypt', travel: false, pzDark: { r: 1.9, maren: 4.6, alpha: 0.9 }, legend: { '▒': 'pit' }", g, [
    "u: { type: 'warp', to: 'thornwood', at: '__THORN__', gfx: 'stairsUp', out: 'up' }",
    "w: { type: 'sign', gfx: 'notice', script: [['note', 'A grave-marker, the letters picked out by touch: HERE THE FLOOR KEEPS WATCH. GO LIGHT, AND GO WHERE THE DEAD WENT.'], ['say', 'Dask', 'Traps. Old ones. Let me walk in front, and somebody bring a light.'], ['note', 'Dask spots hidden things near him while he leads, and F disarms a trap he is facing. Maren carries a stronger light, and lights old lamps.']] }",
    "x: { type: 'pz', pz: 'trap', hidden: true, dmg: '1d4', text: 'Click. Rusted blades snap up out of the floor. Everyone is nicked, and you stumble back.' }",
    "'5': { type: 'obj', pz: 'lamp', radius: 4 }",
    "'6': { type: 'obj', pz: 'lamp', radius: 4.5 }",
    "'λ': { type: 'obj', pz: 'lamp', seq: 'vault', order: 0, seqFlag: 'hb.seq', room: 'r3', radius: 3, text: 'A lamp in a niche of bone. One skull is set above it.' }",
    "'μ': { type: 'obj', pz: 'lamp', seq: 'vault', order: 1, seqFlag: 'hb.seq', room: 'r3', radius: 3, text: 'A lamp in a niche of bone. Two skulls are set above it.' }",
    "'π': { type: 'obj', pz: 'lamp', seq: 'vault', order: 2, seqFlag: 'hb.seq', room: 'r3', radius: 3, text: 'A lamp in a niche of bone. Three skulls are set above it.' }",
    "'σ': { type: 'obj', pz: 'lamp', seq: 'vault', order: 3, seqFlag: 'hb.seq', room: 'r3', radius: 3, text: 'A lamp in a niche of bone. Four skulls are set above it.', doneText: 'The fourth lamp catches. Somewhere under the floor a chain runs out, and the grate before the sarcophagus grinds up into the roof.' }",
    "'κ': { type: 'pz', pz: 'gap', crack: 1, under: 'pit', openGfx: 'crackFloor', room: 'r3', fallText: 'The bone-floor crumbles away behind you into black nothing. You will not cross there again.' }",
    "g: { type: 'obj', gfx: 'gate', unless: 'hb.seq', script: [['note', 'An iron grate before the sarcophagus. There is no handle on this side; it answers to the lamps.']] }",
    "v: { type: 'sign', gfx: 'notice', hidden: true, script: [['note', 'Carved small beside the vault door, where a thief would look: THE DEAD ARE COUNTED FROM ONE. THE FLOOR REMEMBERS EVERY FOOT.'], ['say', 'Dask', 'Light them in order of skulls. And the floor in there is rotten: one crossing per square, then it is gone. Maren, think before you walk.']] }",
    "'3': { type: 'obj', pz: 'reset', room: 'r3', back: [15, 9], area: [12, 3, 18, 8], text: 'Far off, bone grinds on bone. The vault floor knits itself back together, and its lamps go cold.' }",
    "b: { type: 'pz', pz: 'gap', under: 'pit', open: 'hb.br', openGfx: 'bridge' }",
    "q: { type: 'pz', pz: 'plate', flag: 'hb.br', light: true, latch: true, hidden: true, pressText: 'Chains rattle. A bridge of black planks swings down over the chasm.' }",
    "r: { type: 'obj', pz: 'secret', hidden: true, text: 'Dask traces a seam in the stone, finds the catch, and the slab sighs inward. Stairs, going up into the dark.' }",
    "s: { type: 'obj', pz: 'secret', hidden: true, text: 'A false stone. Behind it, a little burial niche nobody was meant to find.' }",
    "e: { type: 'chest', gold: 40, items: { tonic: 2 } }",
    "z: { type: 'obj', gfx: 'sarcophagus', script: [['run', 'pzBarrow']] }",
], ",\n    onEnter: [['if', '!pz.hb.in', [['set', 'pz.hb.in'], ['note', 'The barrow is black as the inside of a boot. Something in the floor ticks, very faintly, like an old clock.'], ['say', 'Maren', 'I can give us more light than a torch, if I walk in front.']]]]")

# ---------------------------------------------------------------- Ch 2: the Drowned Chapel (Maren: light; Finch: bells; Runa: shove)
g = Grid(30, 17)
g.box(1, 1, 9, 15)                      # R1: the nave, flooded across the middle
g.box(1, 5, 9, 11, '~')
for y in range(5, 12): g.put(5, y, 't')  # a causeway that only shows at low tide
g.put(10, 2, '.')                        # R1 -> R2, from the dry north end
g.box(11, 1, 19, 15)                    # R2: the lamp island
g.box(11, 3, 19, 12, '~')
g.box(15, 7, 17, 9)                     # the island
for y in range(3, 7): g.put(16, y, 't')  # causeway from the north shore to the island
for y in range(3, 13): g.put(12, y, 'w')  # the lamplit way down the west side
g.put(20, 14, '.')                       # R2 -> R3, from the south shore
g.box(21, 1, 28, 15)                    # R3: the reliquary
g.box(21, 4, 28, 11, '~')
# the dry end of the reliquary: two toppled saints, two plates (one at the head of the sunken aisle, walkable only at low
# tide), pillars to wedge a saint against
CH3_T = ['##########', '#####P####', '#####.####', '#####.####', '#####.####', '#?.??????#', '#????????#', '@????????#', '#????????#', '##########']
CH3 = ['##########', '#####P####', '#####.####', '#####.####', '#####.####', '#........#', '#.....##.#', '@...B..B.#', '#P.#.#..##', '##########']
stamp(g, 'drownedchapel', 'r3', 20, 7, CH3_T, CH3, {'.': '.', '@': '.', '#': 'I', 'B': 'k', 'P': ['p', 'ρ']})
for y in range(9, 12): g.put(25, y, 't')  # a sunken aisle up to the plate
g.put(20, 14, '.')
for y in range(4, 12): g.put(22, y, 'v')  # the lamplit way north
g.box(26, 1, 26, 3, '#'); g.put(26, 2, 'g'); g.put(28, 2, 'z')   # the reliquary behind its gate
g.put(5, 15, 'u'); g.put(3, 13, 'b'); g.put(7, 13, 'r'); g.put(5, 1, 'j')
g.put(14, 1, 'b'); g.put(16, 8, 'l'); g.put(18, 1, 'r')
g.put(26, 13, 'b'); g.put(23, 15, '7'); g.put(28, 15, '8'); g.put(25, 15, '9'); g.put(19, 13, 'm'); g.put(19, 15, '3')
g.put(1, 1, 'I'); g.put(9, 1, 'I'); g.put(1, 14, '%'); g.put(9, 15, 'U'); g.put(21, 1, 'I'); g.put(25, 1, 'I')
emit('drownedchapel', "    name: 'The Drowned Chapel', ground: 'stone', ground2: 'tideFloor', music: 'dungeon', bg: 'crypt', dark: 0.45, travel: false", g, [
    "u: { type: 'warp', to: 'mirefen', at: '__FEN__', gfx: 'stairsUp', out: 'up' }",
    "t: { type: 'pz', pz: 'gap', under: 'water', open: 'dc.low', openGfx: 'tideFloor' }",
    "w: { type: 'pz', pz: 'gap', under: 'water', open: 'dc.l1&!dc.low', openGfx: 'ghostBridge' }",
    "v: { type: 'pz', pz: 'gap', under: 'water', open: 'dc.seq&!dc.low', openGfx: 'ghostBridge' }",
    "b: { type: 'obj', pz: 'lever', who: 'finch', toggle: 1, flag: 'dc.low', gfx: 'bell', gfxOn: 'bellRung', text: 'A tide bell, green with salt. It wants the right note.', whoText: 'You thump the bell. It clanks. Finch could find its note (C to switch).', sfx: 'bell', flipText: ['Finch finds the bell\\'s note. It booms through the chapel; somewhere sluices open, and the sea drains away. LOW TIDE.', 'The bell tolls again. The sea comes back in. HIGH TIDE.'] }",
    "r: { type: 'sign', gfx: 'notice', script: [['note', 'A brass plate on a pew-end: AT THE BELL THE SEA GOES OUT. AT THE BELL THE SEA COMES IN. THE LAMPLIT WAY IS WALKED ON THE FLOOD.'], ['say', 'Finch', 'A bell with a note in it. That one is mine.'], ['say', 'Maren', 'And a lamplit way. That one is mine.']] }",
    "l: { type: 'obj', pz: 'lamp', flag: 'dc.l1', radius: 3, litText: 'Pale light runs out from the lamp across the water and hangs there, waiting, in a long line to the north-west. It shivers in the shallows.' }",
    "'7': { type: 'obj', pz: 'lamp', seq: 'rel', order: 0, seqFlag: 'dc.seq', radius: 3, text: 'A lamp-niche carved with a fisher and his net.' }",
    "'8': { type: 'obj', pz: 'lamp', seq: 'rel', order: 1, seqFlag: 'dc.seq', radius: 3, text: 'A lamp-niche carved with a maiden holding a lily.' }",
    "'9': { type: 'obj', pz: 'lamp', seq: 'rel', order: 2, seqFlag: 'dc.seq', radius: 3, text: 'A lamp-niche carved with an old man leaning on a stick.', doneText: 'All three lamps burn. A road of light lies down on the flood along the west wall, and waits for the tide to come in.' }",
    "j: { type: 'sign', gfx: 'muralSong', script: [['note', 'A painted window, half its glass gone: three saints with lamps. Under them, in faded gold: FIRST THE FISHER, THEN THE MAIDEN, LAST THE OLD MAN.'], ['say', 'Maren', 'An order. There will be lamps, and they will want lighting in it.']] }",
    "m: { type: 'sign', gfx: 'notice', script: [['note', 'A list of the chapel\\'s saints, half rubbed away: ...the Fisher, who keeps the door... the Maiden of the far corner... the Old Man, who is never far from his bell...']] }",
    "k: { type: 'obj', pz: 'block', gfx: 'statue', room: 'r3', text: 'A saint toppled off her plinth, still in one piece. Runa could shove her.' }",
    "p: { type: 'pz', pz: 'plate', flag: 'dc.p', room: 'r3', keep: 0, pressText: 'Stone grinds on stone. One of the reliquary gate\\'s two bolts slides back.' }",
    "'ρ': { type: 'pz', pz: 'plate', flag: 'dc.p2', room: 'r3', keep: 0, pressText: 'Stone grinds on stone. One of the reliquary gate\\'s two bolts slides back.' }",
    "g: { type: 'obj', gfx: 'gate', unless: 'dc.p&dc.p2', script: [['note', 'The reliquary gate, held by two bolts. One plate sits at the head of the sunken aisle; there is another somewhere in the dry end of the chapel.']] }",
    "z: { type: 'obj', gfx: 'shrine', script: [['run', 'pzChapel']] }",
    "'3': { type: 'obj', pz: 'reset', room: 'r3', back: [20, 14], area: [21, 8, 28, 15] }",
], ",\n    onEnter: [['if', '!pz.dc.in', [['set', 'pz.dc.in'], ['note', 'The chapel stands up to its knees in the sea. Every pew is a little island. Somewhere, a bell creaks in the draught.']]]]")

# ---------------------------------------------------------------- Ch 2: the Singing Sea-Caves (Finch: chimes; Dask: spot; Maren: light)
g = Grid(30, 17)
g.box(1, 10, 9, 15)                     # R1: the echo chamber
g.put(5, 9, 'd')                        # its singing door
g.box(1, 1, 13, 8)                      # R2: the crab tunnel
g.box(1, 4, 13, 4, '#'); g.put(2, 4, '.')  # a rock wall with one gap in it
g.box(7, 5, 8, 5, '~')
g.put(14, 6, 'f')                       # R2's singing door
g.box(15, 1, 28, 8)                     # R3: the grotto
g.box(15, 9, 22, 15, '~')               # its pool
g.box(23, 9, 28, 15)                    # the dry rock
g.box(23, 12, 28, 12, '#'); g.put(26, 12, 'g')   # the last door, and the ledge behind it
g.put(26, 14, 'z')
g.put(5, 15, 'u'); g.put(2, 11, 'c'); g.put(5, 11, 'h'); g.put(8, 11, 'i'); g.put(9, 14, 'm'); g.put(1, 15, 'U')
g.put(3, 6, 'n'); g.put(6, 6, 'o'); g.put(9, 6, 'q'); g.put(12, 6, 's'); g.put(12, 1, 'w'); g.put(2, 3, 'k'); g.put(1, 8, '%'); g.put(5, 2, '%')
# the gull-song is struck from a shelf of rotten rock above the grotto: shell, moon, sun, then back for wave and gull,
# then down again. Every cracked square holds once, so the way along the shelf has to be planned first
g.box(15, 1, 28, 5, '#')
CV3_T = ['################', '###?5?4?1?2?3?##', '###???????????##', '###???????????##', '###???????????##', '#####@#####E####']
CV3 = ['################', '###_5_4_1_2_3_##', '###.__..._..####', '####_..____#__##', '#####.___..__###', '#####@#####E####']
stamp(g, 'seacaves', 'r3', 14, 0, CV3_T, CV3, {'_': 'κ', '.': '.', '@': '.', '#': '#', '1': 'e', '2': 'j', '3': 'l', '4': 'b', '5': 'a'})
g.put(25, 5, '.')
g.put(15, 8, '5'); g.put(16, 8, 'v'); g.put(28, 9, 'y'); g.put(28, 14, '6'); g.put(21, 6, '7')
g.put(16, 14, 'p'); g.put(20, 11, 'p'); g.put(18, 10, 'p'); g.put(21, 14, 'p')
emit('seacaves', "    name: 'The Singing Sea-Caves', ground: 'cave', ground2: 'sand', music: 'dungeon', bg: 'cave', travel: false, pzDark: { r: 2.4, maren: 5, alpha: 0.85 }", g, [
    "u: { type: 'warp', to: 'saltmere', at: '__SALT__', gfx: 'stairsUp', out: 'up' }",
    "c: { type: 'obj', pz: 'chime', note: 0, song: 's1', text: 'A bell-stone carved with a gull.' }",
    "h: { type: 'obj', pz: 'chime', note: 2, song: 's1', text: 'A bell-stone carved with a wave.' }",
    "i: { type: 'obj', pz: 'chime', note: 4, song: 's1', text: 'A bell-stone carved with a shell.' }",
    "m: { type: 'sign', gfx: 'muralSong', script: [['note', 'Painted on the rock in old red ochre: a gull, a wave, a shell, a gull. Under it, a mouth, singing.'], ['say', 'Finch', 'It is a tune. Those stones are tuned. Let me.'], ['note', 'Finch can strike the bell-stones: put him in front and press F beside one.']] }",
    "d: { type: 'obj', gfx: 'boulder', unless: 'sc.s1', script: [['note', 'A rock door, round as a cartwheel, sitting in a groove. It hums faintly when the bell-stones ring.']] }",
    "n: { type: 'obj', pz: 'chime', note: 1, song: 's2', text: 'A bell-stone carved with a fish.' }",
    "o: { type: 'obj', pz: 'chime', note: 3, song: 's2', text: 'A bell-stone carved with a crab.' }",
    "q: { type: 'obj', pz: 'chime', note: 5, song: 's2', text: 'A bell-stone carved with the moon.' }",
    "s: { type: 'obj', pz: 'chime', note: 6, song: 's2', text: 'A bell-stone carved with a star.' }",
    "w: { type: 'sign', gfx: 'muralSong', hidden: true, script: [['note', 'Scratched small, behind a curtain of weed, where only a thief would look: MOON, FISH, STAR, CRAB, MOON.'], ['say', 'Dask', 'Found you. Finch, this one is yours.']] }",
    "k: { type: 'npc', pz: 'beast', sprite: 'crab', dir: 'down', battle: 'seacrabs', text: 'A crab the size of a cart has wedged itself in the tunnel, claws folded, watching you with eyes on stalks.' }",
    "f: { type: 'obj', gfx: 'boulder', unless: 'sc.s2', script: [['note', 'Another singing door.']] }",
    "a: { type: 'obj', pz: 'chime', note: 0, song: 's3', room: 'r3', text: 'A bell-stone carved with a gull.' }",
    "b: { type: 'obj', pz: 'chime', note: 2, song: 's3', room: 'r3', text: 'A bell-stone carved with a wave.' }",
    "e: { type: 'obj', pz: 'chime', note: 4, song: 's3', room: 'r3', text: 'A bell-stone carved with a shell.' }",
    "j: { type: 'obj', pz: 'chime', note: 5, song: 's3', room: 'r3', text: 'A bell-stone carved with the moon.' }",
    "l: { type: 'obj', pz: 'chime', note: 7, song: 's3', room: 'r3', text: 'A bell-stone carved with the sun.' }",
    "'5': { type: 'obj', pz: 'lamp', flag: 'sc.l3', radius: 4, litText: 'The lamp throws its light across the grotto wall. There is writing there.' }",
    "v: { type: 'sign', gfx: 'muralSong', script: [['if', 'sc.l3', [['note', 'In the lamplight the wall is covered in song: SHELL, MOON, SUN... and the rest is under the tide-line, gone. Something else is scratched beside it: THE LAST OF IT IS WHERE THE WATER CANNOT REACH.'], ['say', 'Finch', 'Three notes and a riddle. Somebody hid the end.']], [['note', 'There is something on the rock, but it is too dark to make out. Maren\\'s lamp would show it.']]]] }",
    "y: { type: 'sign', gfx: 'muralSong', hidden: true, script: [['note', 'High on the dry rock, scratched by someone who did not want the sea to have it: ... WAVE, GULL. AND THE SEA WILL LET YOU PASS.'], ['say', 'Finch', 'Shell, moon, sun, wave, gull. That is the gull-song! My grandmother sang that one!']] }",
    "'κ': { type: 'pz', pz: 'gap', crack: 1, under: 'pit', openGfx: 'crackFloor', room: 'r3', fallText: 'The rotten rock crumbles away behind you and drops into the sea. That way is gone.' }",
    "'7': { type: 'obj', pz: 'reset', room: 'r3', back: [19, 6], area: [15, 1, 28, 5], text: 'A red lever, crusted with salt. Somewhere above, the shelf groans and its broken rock grinds back into place.' }",
    "'6': { type: 'obj', pz: 'lamp', radius: 3.5 }",
    "g: { type: 'obj', gfx: 'boulder', unless: 'sc.s3', script: [['note', 'The last door. It is the biggest, and it hums the loudest.']] }",
    "p: { type: 'pz', glow: 1.8, gfx: 'shallows', under: 'water' }",
    "z: { type: 'obj', gfx: 'chest', gfxIf: ['pz.sc.done', 'chestOpen'], script: [['run', 'pzSeaCaves']] }",
], """,
    songs: {
      s1: { notes: [0, 2, 4, 0], flag: 'sc.s1', script: [['note', 'The four notes hang in the air, and the rock door rolls back in its groove with a long low hum.']] },
      s2: { notes: [5, 1, 6, 3, 5], flag: 'sc.s2', script: [['note', 'The tunnel sings back at you. The second rock door rolls aside.']] },
      s3: { notes: [4, 5, 7, 2, 0], flag: 'sc.s3', script: [['note', 'The whole grotto takes up the gull-song, every stone of it, and the last door rolls away. Beyond it, on a dry ledge, a sea-chest.']] }
    },
    onEnter: [['if', '!pz.sc.in', [['set', 'pz.sc.in'], ['note', 'The cave is dark and full of the sea\\'s noise, and somewhere under the noise, faint as a rumour, something is singing.']]]]""")


# ---------------------------------------------------------------- Ch 3: the Ice Halls of Karrow (Runa: sliding ice; all four)
g = Grid(34, 19, '[')
g.box(2, 12, 9, 17); g.box(2, 12, 9, 16, ')')            # R1: the first rink
g.box(4, 8, 6, 10); g.put(5, 11, 's')                     # a hidden cache
g.put(10, 14, 'g'); g.put(11, 14, '.')
g.box(12, 11, 20, 17, ')')                                # R2: the second rink
g.put(21, 12, 'i'); g.put(22, 12, 'k')                    # the gate, and a wolf in the passage beyond
g.box(23, 8, 32, 15, ')')                                 # R3: the great rink
g.put(27, 7, 'v')                                         # the vault door
g.box(23, 2, 29, 6, '.')                                  # the vault
g.box(31, 3, 32, 5, '.'); g.put(30, 4, 'w')               # the horn alcove, behind a wall of ice
g.put(26, 1, 'z'); g.put(26, 2, 'c')                      # the reward, behind icicles
# three rinks, two blocks and two plates in each. On the ice a shoved block slides until something stops it (a pillar,
# a wall, the other block, a plate); the party does not slide. Rink 2 and 3 each hide one plate under the frost.
ICE = {
    'r1': (1, 11, ['##########', '#????????#', '#????????#', '#???????~E', '#????????#', '#???@????#', '##..#...##', '##########'],
                  ['##########', '#~#~~~#~~#', '#~~P~~~B~#', '#~~~~~~~~E', '#~~#~~~B~#', '#~#~@P~~~#', '##..#...##', '##########'],
           {'B': 'm', 'P': ['p', 'α']}),
    'r2': (11, 10, ['###########', '#?????????#', '#????????~E', '#?????????#', '@?????????#', '#?????????#', '#?????????#', '#?????????#', '###########'],
                   ['###########', '#P~~~~~~~~#', '#~~~~#~#~~E', '#~~#~#~B~~#', '@~~~~~~B~~#', '#~~~~P~~~##', '#~#~~~~~~~#', '##~~~~#~~~#', '###########'],
           {'B': 'n', 'P': ['h', 'β']}),
    'r3': (22, 7, ['#####E######', '#????~?????#', '#??????????#', '#??????????#', '#??????????#', '#@?????????#', '#??????????#', '#??????????#', '#??????????#', '############'],
                  ['#####E######', '#~~~~~~~~~~#', '##~~~P~#B#~#', '#~~~~~~~~#~#', '#~P~~~~~~~~#', '#@~~~~~~#~~#', '#~#~~~B~~~##', '#~~~~~~~~~~#', '#~~~~~~~~~~#', '############'],
           {'B': 'o', 'P': ['γ', 'x']}),
}
for rid, (x0, y0, tpl, lay, keys) in ICE.items():
    stamp(g, 'icehalls', rid, x0, y0, tpl, lay, dict({'~': ')', '.': '.', '@': ')', '#': 'I'}, **keys))
g.put(11, 14, '.'); g.put(23, 12, ')')
g.put(5, 17, 'u'); g.put(2, 17, 't'); g.put(9, 17, '1'); g.put(5, 9, 'e')
g.put(16, 12, 'q'); g.put(14, 13, '2'); g.put(24, 13, '3')
g.put(24, 4, 'L'); g.put(32, 4, 'b'); g.put(29, 6, 'y'); g.put(23, 2, '}'); g.put(29, 2, '}')
emit('icehalls', "    name: 'The Ice Halls of Karrow', ground: 'snow', ground2: 'ice', music: 'dungeon', bg: 'snow', dark: 0.3, travel: false", g, [
    "u: { type: 'warp', to: 'frostpass', at: 'u', gfx: 'stairsUp', out: 'up' }",
    "t: { type: 'sign', gfx: 'notice', script: [['note', 'Cut into the ice by an old Karrow hand: THE ICE CARRIES WHAT YOU PUSH UNTIL SOMETHING STOPS IT. A PLATE WILL CATCH A STONE. A STONE WILL CATCH A STONE.'], ['say', 'Runa', 'My grandmother\\'s halls. We used to slide the blocks for fun. Then for the doors.']] }",
    "m: { type: 'obj', pz: 'block', gfx: 'iceblock', room: 'r1' }",
    "p: { type: 'pz', pz: 'plate', flag: 'ih.g1', under: 'ice', room: 'r1', pressText: 'A plate takes the weight. The ice-gate cracks, but holds.' }",
    "'α': { type: 'pz', pz: 'plate', flag: 'ih.g1b', under: 'ice', room: 'r1', pressText: 'A plate takes the weight. The ice-gate cracks, but holds.' }",
    "g: { type: 'obj', gfx: 'iceblock', unless: 'ih.g1&ih.g1b', script: [['note', 'A gate of clear ice. Two plates are set into the rink.']] }",
    "s: { type: 'obj', pz: 'secret', hidden: true, wallGfx: 'iceFace', text: 'Dask finds the seam in the ice, and a hidden stair down to a trapper\\'s cache.' }",
    "e: { type: 'chest', gold: 120, items: { potent: 2 } }",
    "n: { type: 'obj', pz: 'block', gfx: 'iceblock', room: 'r2' }",
    "h: { type: 'pz', pz: 'plate', flag: 'ih.g2', under: 'ice', room: 'r2', hidden: true, pressText: 'Under the frost, a plate clicks down.' }",
    "'β': { type: 'pz', pz: 'plate', flag: 'ih.g2b', under: 'ice', room: 'r2', pressText: 'A plate takes the weight.' }",
    "q: { type: 'sign', gfx: 'notice', script: [['note', 'Frost-rimed letters: THE SECOND PLATE SLEEPS UNDER THE FROST. ONLY A THIEF\\'S EYE OR A GRANDMOTHER\\'S MEMORY WILL FIND IT.'], ['say', 'Runa', 'I have forgotten. Dask?']] }",
    "i: { type: 'obj', gfx: 'iceblock', unless: 'ih.g2&ih.g2b', script: [['note', 'Another ice-gate.']] }",
    "k: { type: 'npc', pz: 'beast', sprite: 'wolf', dir: 'left', battle: 'ic_wolves', text: 'A frost wolf lies across the passage, ears up, lip lifting off its teeth. Its pack is somewhere close.', lullText: 'Finch hums a Karrow cradle-song. The wolf\\'s ears drop; it lays its head on its paws, and sleeps.' }",
    "o: { type: 'obj', pz: 'block', gfx: 'iceblock', room: 'r3' }",
    "x: { type: 'pz', pz: 'plate', flag: 'ih.p3', under: 'ice', room: 'r3', hidden: true, pressText: 'Deep in the ice, a great bolt slides back.' }",
    "'γ': { type: 'pz', pz: 'plate', flag: 'ih.p3b', under: 'ice', room: 'r3', pressText: 'Deep in the ice, a great bolt slides back.' }",
    "v: { type: 'obj', gfx: 'iceblock', unless: 'ih.p3&ih.p3b', script: [['note', 'The vault door, a slab of blue ice three feet thick.']] }",
    "L: { type: 'obj', pz: 'lamp', flag: 'ih.thaw', radius: 3, litText: 'The old fire-lamp roars up. Across the vault, a wall of ice sweats, slumps, and runs away in a river of meltwater.' }",
    "w: { type: 'obj', gfx: 'iceblock', unless: 'ih.thaw', script: [['note', 'A wall of ice, newer than the rest. Something is behind it. A good fire would see to it.']] }",
    "b: { type: 'obj', pz: 'lever', who: 'finch', flag: 'ih.horn', gfx: 'horn', gfxOn: 'horn', text: 'The great horn of the hall, as long as Runa is tall.', whoText: 'Runa blows until she is purple. The horn makes a noise like a sick cow. Finch could find its note (C to switch).', sfx: 'bell', flipText: ['Finch finds the horn\\'s note. It goes through the halls like a gale, and every icicle in the vault shivers and falls.'] }",
    "c: { type: 'obj', gfx: 'icecrystal', unless: 'ih.horn', script: [['note', 'A curtain of icicles as thick as spears, guarding a niche. They hum when anything loud happens.']] }",
    "y: { type: 'sign', gfx: 'notice', script: [['note', 'On the vault wall: THE FIRE TO OPEN THE WAY, THE HORN TO OPEN THE HEART.']] }",
    "z: { type: 'obj', gfx: 'chest', gfxIf: ['pz.ih.done', 'chestOpen'], script: [['run', 'pzIceHalls']] }",
    "'1': { type: 'obj', pz: 'reset', room: 'r1', back: [5, 16], area: [2, 12, 9, 17] }",
    "'2': { type: 'obj', pz: 'reset', room: 'r2', back: [11, 14], area: [12, 11, 20, 17] }",
    "'3': { type: 'obj', pz: 'reset', room: 'r3', back: [23, 12], area: [23, 8, 32, 15] }",
], ",\n    legend: { ')': 'ice' },\n    onEnter: [['if', '!pz.ih.in', [['set', 'pz.ih.in'], ['note', 'Blue light, and the creak of old ice. The floors are glass-smooth: anything you shove on them will keep going.'], ['say', 'Runa', 'Karrow built these before it built the hall. Grandmother said the best gift of the clan was kept at the bottom.']]]]", rename={'L': 'l'})

# ---------------------------------------------------------------- Ch 3: the Echo Spire (Finch: chimes turn mirrors; all four)
g = Grid(30, 17)
g.box(1, 11, 12, 15)                                     # R1: the first gallery
g.put(13, 13, 'd')
g.box(14, 9, 25, 15)                                     # R2: the hall of mirrors
g.box(27, 9, 28, 11); g.put(26, 10, 'r')                  # a crystal behind a false wall
g.put(14, 8, 'f'); g.put(14, 7, '.'); g.put(13, 7, '.')
g.box(1, 1, 12, 8)                                       # R3: the bell-loft
g.put(13, 3, 'h'); g.box(14, 1, 17, 4)                    # the vault
g.put(10, 15, 'u'); g.put(1, 13, 'L'); g.put(8, 13, 'M'); g.put(8, 11, 'K'); g.put(4, 15, 'c'); g.put(12, 11, 't')
# R2: daylight falls through the roof onto five mirrors in a row; five bell-stones each turn two of them. The stones
# stand along a gallery of rotten boards, walked once, end to end: work out which three stones to strike before stepping
# on, because there is no walking back. (Two sets of three work: first+second+third, or third+fourth+fifth stone.)
g.put(15, 9, 'S'); g.put(15, 13, 'α'); g.put(19, 13, 'β'); g.put(19, 11, 'γ'); g.put(24, 11, 'δ'); g.put(24, 10, 'ε'); g.put(28, 10, 'J')
for x in (15, 17, 19, 21, 23): g.put(x, 14, '#')
for x, k in zip((16, 18, 20, 22, 24), 'ζηθλμ'): g.put(x, 14, k)
for x in range(15, 25): g.put(x, 15, 'κ')
g.put(25, 12, '2'); g.put(16, 9, 'n')
g.put(12, 2, 'l'); g.put(6, 2, 'p'); g.put(6, 6, 'w'); g.put(2, 6, 'k'); g.put(9, 7, 'e'); g.put(1, 1, 'm'); g.put(12, 8, '3')
g.put(14, 1, 'A'); g.put(15, 1, 'B'); g.put(16, 1, 'C'); g.put(17, 4, 'z'); g.put(1, 8, 'U'); g.put(1, 15, 'U')
emit('echospire', "    name: 'The Echo Spire', ground: 'stone', ground2: 'marble', music: 'dungeon', bg: 'crypt', dark: 0.4, travel: false", g, [
    "u: { type: 'warp', to: 'falls', at: 'u', gfx: 'stairsUp', out: 'up' }",
    "t: { type: 'sign', gfx: 'notice', script: [['note', 'A singer\\'s tower, the plaque says. THE STONES TURN THE GLASSES, THE GLASSES TURN THE LIGHT, THE LIGHT TURNS THE KEY.'], ['say', 'Finch', 'A tower that wants a tune. I could kiss whoever built it.'], ['say', 'Maren', 'And a lamp to start the light. That one is mine.']] }",
    "L: { type: 'obj', pz: 'lamp', beam: 'right', radius: 2.5, text: 'A lamp with a lens of polished crystal, pointing along the gallery.' }",
    "M: { type: 'obj', pz: 'mirror', tag: 'm1', start: '\\\\', room: 'r1' }",
    "K: { type: 'obj', pz: 'crystal', flag: 'es.k1', latch: 1, litText: 'The crystal blazes. The gallery door unlocks with a click.' }",
    "c: { type: 'obj', pz: 'chime', note: 0, turns: ['m1'], turnText: 'The bell-stone rings, and across the gallery a mirror turns on its pivot.', text: 'A bell-stone, linked by a long bronze rod to the mirror.' }",
    "d: { type: 'obj', gfx: 'gate', unless: 'es.k1', script: [['note', 'A bronze door. Its lock is a crystal eye, dark.']] }",
    "S: { type: 'obj', pz: 'sun', beam: 'down', glow: 2 }",
    "r: { type: 'obj', pz: 'secret', hidden: true, text: 'A panel painted to look like stone. Dask slides it aside: behind it, a crystal in a niche, waiting for the light.' }",
    "J: { type: 'obj', pz: 'crystal', flag: 'es.k2', latch: 1, litText: 'Behind the false wall, a crystal takes the light. A door unlocks somewhere above.' }",
    "'α': { type: 'obj', pz: 'mirror', tag: 'ha', start: '/', room: 'r2' }",
    "'β': { type: 'obj', pz: 'mirror', tag: 'hb', start: '\\\\', room: 'r2' }",
    "'γ': { type: 'obj', pz: 'mirror', tag: 'hc', start: '/', room: 'r2' }",
    "'δ': { type: 'obj', pz: 'mirror', tag: 'hd', start: '\\\\', room: 'r2' }",
    "'ε': { type: 'obj', pz: 'mirror', tag: 'he', start: '\\\\', room: 'r2' }",
    "'ζ': { type: 'obj', pz: 'chime', note: 0, turns: ['ha', 'hd'], room: 'r2', text: 'The first bell-stone. Its rods run to the first mirror and the fourth (counting along the light from the roof).' }",
    "'η': { type: 'obj', pz: 'chime', note: 2, turns: ['hb', 'hc'], room: 'r2', text: 'The second bell-stone. Its rods run to the second mirror and the third.' }",
    "'θ': { type: 'obj', pz: 'chime', note: 4, turns: ['hc', 'he'], room: 'r2', text: 'The third bell-stone. Its rods run to the third mirror and the fifth.' }",
    "'λ': { type: 'obj', pz: 'chime', note: 5, turns: ['ha', 'hb'], room: 'r2', text: 'The fourth bell-stone. Its rods run to the first mirror and the second.' }",
    "'μ': { type: 'obj', pz: 'chime', note: 7, turns: ['hc', 'hd'], room: 'r2', text: 'The fifth bell-stone. Its rods run to the third mirror and the fourth.' }",
    "'κ': { type: 'pz', pz: 'gap', crack: 1, under: 'pit', openGfx: 'rottenPlanks', room: 'r2', fallText: 'The rotten boards give way behind you and clatter down the spire. There is no going back along the gallery.' }",
    "n: { type: 'sign', gfx: 'notice', script: [['note', 'Scratched by some apprentice: THE LIGHT FALLS FROM THE ROOF AND WANTS THE SECRET CRYSTAL. FIVE GLASSES, FIVE STONES, EACH STONE TURNS TWO. THE GALLERY BOARDS ARE ROTTEN: ONE WALK, END TO END. KNOW YOUR STONES BEFORE YOU STEP.'], ['say', 'Finch', 'So I look at every glass, work out which way each one has to face, and only then walk the gallery. Nobody talk to me for a minute.']] }",
    "f: { type: 'obj', gfx: 'gate', unless: 'es.k2', script: [['note', 'A bronze door with a dark crystal eye.']] }",
    "l: { type: 'obj', pz: 'lamp', beam: 'left', radius: 2.5, text: 'Another lens-lamp, aimed along the loft.' }",
    "p: { type: 'obj', pz: 'mirror', tag: 'd', start: '\\\\', room: 'r3' }",
    "w: { type: 'obj', pz: 'mirror', tag: 'f', start: '\\\\', who: 'runa', room: 'r3', text: 'A great mirror on a stone pivot, far too heavy for a rod to turn. Runa could put her shoulder to it.' }",
    "k: { type: 'obj', pz: 'crystal', flag: 'es.k3', latch: 1, litText: 'The last crystal blazes, and the vault door swings open.' }",
    "e: { type: 'obj', pz: 'chime', note: 7, turns: ['d'], text: 'A bell-stone rodded to the near mirror.' }",
    "m: { type: 'sign', gfx: 'muralSong', hidden: true, script: [['note', 'Tucked behind a loose board: the spire-song, in a choirmaster\\'s hand. HIGH, MIDDLE, LOW, MIDDLE.'], ['say', 'Dask', 'Sheet music. Finch, your sort of loot.']] }",
    "h: { type: 'obj', gfx: 'gate', unless: 'es.k3', script: [['note', 'The vault door. Its crystal eye is dark.']] }",
    "A: { type: 'obj', pz: 'chime', note: 0, song: 'v', text: 'The low bell-stone.' }",
    "B: { type: 'obj', pz: 'chime', note: 4, song: 'v', text: 'The middle bell-stone.' }",
    "C: { type: 'obj', pz: 'chime', note: 7, song: 'v', text: 'The high bell-stone.' }",
    "z: { type: 'obj', gfx: 'chest', gfxIf: ['pz.es.done', 'chestOpen'], script: [['if', 'es.song', [['run', 'pzSpire']], [['note', 'A music-box chest. Its lock is three little bells, and they want a tune.']]]] }",
    "'2': { type: 'obj', pz: 'reset', room: 'r2', back: [14, 13], area: [14, 9, 25, 15] }",
    "'3': { type: 'obj', pz: 'reset', room: 'r3', back: [12, 7] }",
], """,
    songs: { v: { notes: [7, 4, 0, 4], flag: 'es.song', script: [['note', 'The vault answers the spire-song, and the little bells on the chest ring it back. The lock springs.']] } },
    onEnter: [['if', '!pz.es.in', [['set', 'pz.es.in'], ['note', 'The spire is full of bells and bronze mirrors, and every footstep comes back to you three times.']]]]""", rename={'L': '4', 'M': '6', 'K': '7', 'S': '8', 'X': '9', 'J': 'j', 'A': 'g', 'B': 'i', 'C': 'v'})

# ---------------------------------------------------------------- Ch 4: the Inquisitor's Archive (Dask: sneaking; all four)
g = Grid(30, 17)
g.box(1, 9, 11, 15)                                      # R1: the hall of records
g.put(6, 8, '.')
g.box(1, 1, 11, 7)                                       # R2: the stacks
g.put(12, 2, '.')
g.box(13, 1, 28, 15)                                     # R3: the reading room
g.box(23, 10, 28, 10, '#'); g.box(23, 10, 23, 15, '#'); g.put(23, 13, 'v')   # the vault
for x in (1, 2, 9, 10, 11): g.put(x, 9, 'K')
for x in (1, 11): g.put(x, 15, 'K')
g.put(6, 15, 'u'); g.put(3, 11, 'S'); g.put(10, 14, 't')
# R2, the stacks: three aisles between fixed bookcases, a warden at the west end of each, looking down his aisle and
# now and then glancing away, and two bookcases on castors. Each warden's aisle has to be closed off with a bookcase
# (it blocks the eye), and the bookcases only go where Runa can get behind them. Searched for with tools/pzgen.py
# (search_guards, 'stacks4'), the third warden added after; solved from every moment of the wardens' rounds.
STK = ['#############', '#####....####', '#g..........E', '##..#.#######', '#h..........#', '###.#.###.#.#', '#j......B.B.#', '#L....@.....#', '#############']
STK_GUARDS = {'g': {'turns': ['right', 'right', 'left'], 'range': 9, 'every': 2}, 'h': {'turns': ['right', 'right', 'right', 'down'], 'range': 8, 'every': 1},
              'j': {'turns': ['right', 'right', 'down'], 'range': 4, 'every': 1}}
stk = GuardRoom([r.replace('L', '#') for r in STK], STK_GUARDS)
for n0 in range(stk.L): assert solve_guards(stk, n0=n0, deadness=False, allow_caught=False).get('ok'), ('archive r2 from', n0)
stk_r = solve_guards(stk, n0=0, allow_caught=False)
for j, row in enumerate(STK[1:-1], 1):
    for i, c in enumerate(row[1:-1], 1):
        g.put(i, j, {'#': 'K', '.': '.', '@': '.', 'B': 'B', 'g': 'G', 'h': 'H', 'j': 'J', 'L': '2'}[c])
ROOMS.setdefault('archive', {})['r2'] = {'start': [6, 7], 'path': stk_r['path'], 'steps': stk_r['steps'], 'pushes': stk_r['pushes'], 'dead': stk_r['deadfrac'], 'states': stk_r['states'],
                                         'guards': {k: dict(v) for k, v in STK_GUARDS.items()}}
print('archive r2: %d steps, %d shoves, %.2f of positions dead' % (stk_r['steps'], stk_r['pushes'], stk_r['deadfrac']))
for (x, y) in [(5, 12), (4, 10), (8, 12), (8, 10)]: g.put(x, y, 'x')        # Dask's trip-wires, across the hall of records
g.put(20, 6, 'P'); g.put(14, 6, 'a'); g.put(26, 6, 'b'); g.put(20, 11, 'c'); g.put(28, 1, 'l'); g.put(27, 13, 'z')
for (x, y) in [(15, 2), (16, 2), (17, 2), (15, 12), (16, 12), (17, 12), (25, 2), (26, 2)]: g.put(x, y, 'K')
g.put(24, 1, 'q')
emit('archive', "    name: \"The Inquisitor's Archive\", ground: 'wood', ground2: 'marble', music: 'dungeon', bg: 'tavern', dark: 0.25, travel: false", g, [
    "u: { type: 'warp', to: 'highmoor', at: 'u', gfx: 'stairsUp', out: 'up' }",
    "t: { type: 'sign', gfx: 'notice', script: [['note', 'A notice on the wall: THE ARCHIVE IS CLOSED AFTER THE BELL. WARDENS WILL REMOVE ANY READER FOUND WITHIN. BY ORDER, VELL.'], ['say', 'Dask', 'Removed. Not hanged. Practically an invitation.'], ['note', 'Red squares show where a warden is looking. They turn each time you take a step. With Dask in front, you can also see where they will look next.']] }",
    "S: { type: 'npc', pz: 'sentry', sprite: 'cityguard', name: 'Archive Warden', turns: ['up', 'right', 'down', 'right'], range: 8, back: [6, 14] }",
] + ["%s: { type: 'npc', pz: 'sentry', sprite: 'cityguard', name: 'Archive Warden', turns: %s, every: %d, range: %d, back: [6, 7], room: 'r2' }" % (ch, json.dumps(STK_GUARDS[k]['turns']).replace('"', "'"), STK_GUARDS[k]['every'], STK_GUARDS[k]['range']) for ch, k in (('G', 'g'), ('H', 'h'), ('J', 'j'))] + [
    "B: { type: 'obj', pz: 'block', gfx: 'shelfCart', room: 'r2', text: 'A bookcase on castors, stuffed with tax rolls. Runa could shove it, and a warden cannot see through it.' }",
    "x: { type: 'pz', pz: 'trap', hidden: true, dmg: '1d6', text: 'A wire across the floor. A bell jangles, and an inkpot full of something nasty tips onto your heads. You back off, dripping.' }",
    "P: { type: 'npc', pz: 'sentry', sprite: 'noble', name: 'The Old Porter', turns: ['down', 'left', 'up', 'right'], every: 2, range: 5, back: [13, 2], lull: 1, lullText: 'Finch sings the dullest hymn in the Highmoor book. The old porter\\'s chin sinks to his chest. He is snoring before the second verse.', shouts: ['Eh? Who\\'s that? Out, out!'] }",
    "a: { type: 'obj', pz: 'lamp', seq: 'ia', order: 2, seqFlag: 'ia.seq', radius: 3, text: 'The west reading-lamp.' }",
    "b: { type: 'obj', pz: 'lamp', seq: 'ia', order: 0, seqFlag: 'ia.seq', radius: 3, text: 'The east reading-lamp.' }",
    "c: { type: 'obj', pz: 'lamp', seq: 'ia', order: 1, seqFlag: 'ia.seq', radius: 3, text: 'The south reading-lamp.', doneText: 'The third lamp catches, and something in the vault wall goes clunk.' }",
    "l: { type: 'sign', gfx: 'papers', hidden: true, script: [['note', 'A ledger hidden under the porter\\'s ledger: LAMPS, IN ORDER, FOR THE VAULT: EAST. SOUTH. WEST. (DO NOT TELL THE INQUISITOR I WROTE THIS DOWN.)'], ['say', 'Dask', 'Every clerk keeps a crib sheet. Every one.']] }",
    "q: { type: 'sign', gfx: 'notice', script: [['note', 'The porter\\'s duty-roll. He walks round his desk twice a bell, looking each way in turn: south, west, north, east.']] }",
    "v: { type: 'obj', gfx: 'gate', unless: 'ia.seq', script: [['note', 'The Inquisitor\\'s vault. No lock: it opens when the reading-room lamps are lit in the right order.']] }",
    "z: { type: 'obj', gfx: 'chest', gfxIf: ['pz.ia.done', 'chestOpen'], script: [['run', 'pzArchive']] }",
    "'2': { type: 'obj', pz: 'reset', room: 'r2', back: [6, 7], area: [1, 1, 11, 7], text: 'Somewhere a pulley creaks. The bookcases roll back to where they stood, and you slip back to the door.' }",
], ",\n    onEnter: [['if', '!pz.ia.in', [['set', 'pz.ia.in'], ['note', 'Rows of shelves, the smell of ink and candle-fat, and somewhere ahead, the slow tread of a warden on his rounds.']]]]", rename={'S': '1', 'G': 'g', 'H': 'h', 'J': 'j', 'B': 'k', 'P': 'p'})

# ---------------------------------------------------------------- Ch 4: the Undercroft of Lamps (Maren: the finale; all four)
g = Grid(30, 17)
g.box(1, 10, 12, 15)                                     # R1: the trapped gallery
safe = [(4, 13), (5, 13), (6, 13), (6, 12), (6, 11), (7, 11), (8, 11), (8, 12), (8, 13), (9, 13), (10, 13)]
for x in range(5, 10):
    for y in range(10, 16):
        if (x, y) not in safe: g.put(x, y, 'x')
g.put(13, 14, 's')
g.box(14, 10, 28, 15)                                    # R2: the pits
# two rows of pit right across the hall, and two boulders: both must go down the same column, and a boulder dropped
# anywhere else is gone for good
LV2_T = ['#################', '#EEEEEEEEEEEEEEE#', '#OOOOOOOOOOOOOOO#', '#OOOOOOOOOOOOOOO#', '#???????????????#', '@???????????????#', '#???????????????#', '#################']
LV2 = ['#################', '#EEEEEEEEEEEEEEE#', '#OOOOOOOOOOOOOOO#', '#OOOOOOOOOOOOOOO#', '#..#.....#....#.#', '@B.........#.B..#', '#...#...........#', '#################']
stamp(g, 'lampvault', 'r2', 13, 9, LV2_T, LV2, {'.': '.', '@': 's', '#': 'I', 'B': 'o', 'O': 'f'})
g.put(17, 9, 'd')                                        # the way north, shut until the far lamp burns
g.box(14, 1, 28, 8)                                      # R3: the hall of the beam
g.put(13, 4, 'h')
g.box(1, 1, 12, 8)                                       # R4: the four lamps
g.box(5, 2, 7, 3, '#'); g.put(6, 3, 'z'); g.put(6, 4, 'a')
g.put(2, 15, 'u'); g.put(1, 10, '5'); g.put(12, 15, '5'); g.put(12, 10, 'm'); g.put(3, 11, '%'); g.put(11, 11, '%')
g.put(28, 10, 'L'); g.put(27, 13, 'n'); g.put(22, 13, '2')
g.put(28, 4, 'l'); g.put(20, 4, 'p'); g.put(20, 1, 'k'); g.put(24, 7, 'c'); g.put(16, 2, 'r'); g.put(27, 1, '%'); g.put(15, 8, '%')
g.put(1, 1, 'A'); g.put(12, 1, 'B'); g.put(1, 8, 'C'); g.put(12, 8, 'D'); g.put(6, 6, 'w'); g.put(10, 4, 'y')
emit('lampvault', "    name: 'The Undercroft of Lamps', ground: 'stone', ground2: 'cave', music: 'dungeon', bg: 'crypt', travel: false, pzDark: { r: 1.9, maren: 4.6, alpha: 0.92 }, legend: { '▒': 'pit' }", g, [
    "u: { type: 'warp', to: 'undercroft', at: 'u', gfx: 'stairsUp', out: 'up' }",
    "x: { type: 'pz', pz: 'trap', hidden: true, dmg: '1d8', text: 'The floor bites. Old Warden blades, still sharp after three hundred years. You fall back.' }",
    "'5': { type: 'obj', pz: 'lamp', radius: 4 }",
    "m: { type: 'sign', gfx: 'muralSong', hidden: true, script: [['note', 'Carved small, low on the wall, where a thief would look: OF THE FOUR GREAT LAMPS, THE FIRST IS THE KEEPER\\'S.'], ['say', 'Dask', 'Maren. This is about your lamps.'], ['say', 'Maren', 'It is about all of them. Keep reading the walls.']] }",
    "s: { type: 'obj', pz: 'secret', hidden: true, text: 'A Warden door, made to look like the wall. Dask finds the lamp-shaped catch.' }",
    "o: { type: 'obj', pz: 'block', gfx: 'boulder', room: 'r2' }",
    "f: { type: 'pz', pz: 'gap', under: 'pit', fill: 1, room: 'r2', fillText: 'The stone drops into the pit with a crash and wedges there. One less pit between you and the far side.' }",
    "L: { type: 'obj', pz: 'lamp', flag: 'uc.l2', radius: 3.5, litText: 'Light runs from the far lamp along the north wall, and the Warden door at the end of it swings open.' }",
    "d: { type: 'obj', gfx: 'gate', unless: 'uc.l2', script: [['note', 'A Warden door. A lamp on the far side of the pits would open it.']] }",
    "n: { type: 'sign', gfx: 'muralSong', script: [['note', 'A painted Warden, walking, with a staff: THE SECOND IS THE WANDERER\\'S.']] }",
    "l: { type: 'obj', pz: 'lamp', beam: 'left', flag: 'uc.l3', radius: 3, text: 'A lens-lamp aimed across the hall.' }",
    "p: { type: 'obj', pz: 'mirror', tag: 'p', start: '/', room: 'r3' }",
    "k: { type: 'obj', pz: 'crystal', flag: 'uc.k3', latch: 1, litText: 'The crystal takes the beam, and the west door opens.' }",
    "c: { type: 'obj', pz: 'chime', note: 4, turns: ['p'], text: 'A bell-stone, rodded to the mirror.' }",
    "r: { type: 'sign', gfx: 'muralSong', script: [['if', 'uc.l3', [['note', 'In the lamplight: a Warden with a lute. THE THIRD IS THE SINGER\\'S.'], ['say', 'Finch', 'There was a singer Warden? I am going to be insufferable about this.']], [['note', 'A painted wall, too dark to read. Light the lamp across the hall.']]]] }",
    "h: { type: 'obj', gfx: 'gate', unless: 'uc.k3', script: [['note', 'A Warden door with a crystal eye.']] }",
    "A: { type: 'obj', pz: 'lamp', seq: 'four', order: 0, seqFlag: 'uc.seq', radius: 4, text: 'A great lamp carved with a key: the Keeper\\'s lamp.' }",
    "B: { type: 'obj', pz: 'lamp', seq: 'four', order: 1, seqFlag: 'uc.seq', radius: 4, text: 'A great lamp carved with a staff: the Wanderer\\'s lamp.' }",
    "C: { type: 'obj', pz: 'lamp', seq: 'four', order: 2, seqFlag: 'uc.seq', radius: 4, text: 'A great lamp carved with a lute: the Singer\\'s lamp.' }",
    "D: { type: 'obj', pz: 'lamp', seq: 'four', order: 3, seqFlag: 'uc.seq', radius: 4, text: 'A great lamp carved with a hammer: the Smith\\'s lamp.', doneText: 'The fourth great lamp takes the flame, and the four of them burn together for the first time in three hundred years. The shrine door opens.' }",
    "y: { type: 'sign', gfx: 'muralSong', hidden: true, script: [['note', 'Under the dust, the last line: AND THE LAST IS THE SMITH\\'S, WHO MADE THEM ALL.']] }",
    "w: { type: 'npc', pz: 'beast', sprite: 'shade', dir: 'down', battle: 'cryptshades', text: 'A shade drifts before the shrine, the last Warden on watch, mad with three hundred years of it.', lullText: 'Finch sings the Warden lullaby, the one Maren\\'s order still uses for the dying. The shade sinks down, and down, and is still.' }",
    "a: { type: 'obj', gfx: 'gate', unless: 'uc.seq', script: [['note', 'The shrine door. Four great lamps stand dark around the hall.']] }",
    "z: { type: 'obj', gfx: 'shrine', script: [['run', 'pzLamps']] }",
    "'2': { type: 'obj', pz: 'reset', room: 'r2', back: [13, 14], area: [14, 11, 28, 15] }",
], ",\n    onEnter: [['if', '!pz.uc.in', [['set', 'pz.uc.in'], ['note', 'Under the Undercroft, older still: the first Warden hall, cut before Highmoor had a name. It is utterly dark.'], ['say', 'Maren', 'This is where the lamps began. I can feel it.']]]]", rename={'L': 'i', 'A': '6', 'B': '7', 'C': '8', 'D': '9'})


# ---------------------------------------------------------------- Ch 5: the Smith's Deep (the last and hardest: all four, every room)
# Pitch dark. R1 the Cinder Gate (Dask traps + secret, Runa block, Maren lamp), R2 the Bellows Hall (Finch's song under two
# sentries), R3 the Quench (Runa on ice, Dask's pebble), R4 the Anvil of Light (Maren's lens, Runa's and Finch's mirrors,
# four lamps in an order only Dask can find, Finch's hound). Reward: the Smith's Edge (critical hits one number lower).
g = Grid(36, 20)
g.box(2, 10, 10, 17)                                     # R1: the Cinder Gate
for x in range(2, 11): g.put(x, 13, 'x')                 # a band of hidden traps right across it
g.box(2, 6, 3, 8); g.put(3, 9, 's'); g.put(3, 7, 'b')    # the hidden alcove, and the block in it
g.put(3, 11, 'p'); g.put(7, 9, 'g'); g.put(7, 8, '.'); g.put(7, 7, '.')
g.put(2, 17, 'u'); g.put(10, 10, 'a'); g.put(9, 10, 'q'); g.put(10, 17, '1'); g.put(10, 15, '6')
g.box(5, 1, 20, 6)                                       # R2: the Bellows Hall
g.put(5, 1, 'c'); g.put(20, 1, 'e'); g.put(13, 6, 'i')   # three bell-stones: low, high, middle
g.put(13, 1, 't'); g.put(17, 4, 'n'); g.put(5, 6, '7')
g.put(21, 3, 'v')
g.box(22, 1, 33, 8, ')')                                 # R3: the Quench, all ice
# two quenching-stones on the ice, a pit down the middle that any stone will fill, and the plate on the far side: the
# first stone has to bridge the pit in just the right place for the second to reach the plate
SD3_T = ['############', '#?????O????#', '#?????O????#', '@?????O????#', '#?????O????#', '#?????O????#', '#?????O????#', '#?????O????#', '#?????O??~?#', '#########E##']
SD3 = ['############', '###~~~O~P~~#', '#~~B~~O~~~##', '@~~~~#O~~#~#', '#~~~~#O~~~##', '##~~~~O~~~~#', '#~B#~~O~~~~#', '#~~~~~O~~~~#', '#~~~~~O~~~~#', '#########E##']
stamp(g, 'smithdeep', 'r3', 21, 0, SD3_T, SD3, {'~': ')', '@': ')', '#': 'I', 'B': 'o', 'O': 'f', 'P': ['y']})
g.put(21, 3, 'v')
for y in (4, 5, 6): g.put(32, y, '▒')               # a ledge behind more pit
for y in (1, 2, 3, 7, 8): g.put(33, y, '#')
g.put(33, 5, 'd')
g.put(30, 9, '4'); g.put(30, 10, '.'); g.put(22, 1, '3'); g.put(26, 3, '8')
g.box(12, 11, 34, 18)                                    # R4: the Anvil of Light
g.put(34, 12, 'l'); g.put(25, 12, 'j'); g.put(25, 16, 'k'); g.put(27, 18, 'm'); g.put(14, 16, 'ü')
g.put(34, 18, '2'); g.put(12, 11, '0'); g.put(34, 15, 'ö'); g.put(12, 18, '5'); g.put(20, 18, '9')
g.box(13, 8, 15, 8); g.put(14, 9, 'w'); g.put(14, 10, 'h'); g.put(15, 8, 'z')   # the shrine, behind its door and its hound
g.put(5, 17, 'ä'); g.put(20, 6, 'ë'); g.put(20, 14, 'ï')   # hint stones: one nudge, or a plain answer, for wherever you are stuck
emit('smithdeep', "    name: \"The Smith's Deep\", ground: 'stone', ground2: 'cave', music: 'dungeon', bg: 'cave', travel: false, pzDark: { r: 1.9, maren: 4.6, alpha: 0.95 }, legend: { ')': 'ice', '▒': 'pit' },\n    songs: { forge: { notes: [1, 5, 3, 5], flag: 'sd.song', script: [['note', 'The last note rings, and the whole hall answers it. Somewhere east, a great bolt slides back.']] } }", g, [
    "u: { type: 'warp', to: 'ashfall', at: 'u', gfx: 'stairsUp', out: 'up' }",
    "x: { type: 'pz', pz: 'trap', hidden: true, dmg: '2d6', text: 'The floor gives under you. Red-hot pins, still hot after three hundred years. Everyone is burned, and you scramble back.' }",
    "s: { type: 'obj', pz: 'secret', hidden: true, text: 'A soot-black seam in the wall. Dask finds the catch, shaped like a hammer, and a narrow alcove opens.' }",
    "b: { type: 'obj', pz: 'block', gfx: 'boulder', room: 'r1', text: 'An anvil-stone, the size of a cart. Runa could shove it.' }",
    "p: { type: 'pz', pz: 'plate', flag: 'sd.g1', room: 'r1', pressText: 'The Cinder Gate grinds open.' }",
    "g: { type: 'obj', gfx: 'gate', unless: 'sd.g1', script: [['note', 'The Cinder Gate. A great plate is set in the floor nearby, waiting for weight.']] }",
    "a: { type: 'obj', pz: 'lamp', flag: 'sd.l1', radius: 4, text: 'A Warden lamp set over a carved wall.' }",
    "q: { type: 'sign', gfx: 'muralSong', script: [['if', 'sd.l1', [['note', 'In the lamplight, carved deep: THE FORGE-SONG. THE BELLOWS BREATHE LOW. THE HAMMER RINGS HIGH. THE ANVIL ANSWERS BETWEEN. THE HAMMER RINGS AGAIN.'], ['say', 'Finch', 'Low, high, middle, high. I can do that. Probably.']], [['note', 'A carved wall, too dark to read. Something is cut deep into it.']]]] }",
    "'6': { type: 'sign', gfx: 'muralSong', hidden: true, script: [['note', 'Scratched low on the wall, where a thief would look: THE SMITH\\'S FIRST FIRE IS THE BELLOWS\\'.'], ['say', 'Dask', 'Somebody was here before us, and they were writing things down. My kind of somebody.']] }",
    "'1': { type: 'obj', pz: 'reset', room: 'r1', back: [2, 16] }",
    "c: { type: 'obj', pz: 'chime', note: 1, song: 'forge', text: 'A bell-stone shaped like a bellows. It hums low.' }",
    "e: { type: 'obj', pz: 'chime', note: 5, song: 'forge', text: 'A bell-stone shaped like a hammer-head. It rings high.' }",
    "i: { type: 'obj', pz: 'chime', note: 3, song: 'forge', text: 'A bell-stone shaped like an anvil. Its note sits in the middle.' }",
    "t: { type: 'npc', pz: 'sentry', sprite: 'deathknight', name: 'Forge-warden', turns: ['down', 'left', 'right'], range: 8, back: [7, 7], caughtText: 'The forge-warden\\'s burning eyes find you. Its hammer points: back. You go back.', shouts: ['NONE PASS THE BELLOWS.', 'THE FORGE IS CLOSED.'] }",
    "n: { type: 'npc', pz: 'sentry', sprite: 'ashghoul', name: 'Bellows-keeper', turns: ['left', 'up', 'left', 'down'], range: 12, back: [7, 7], lull: 1, lullText: 'Finch sings the slowest song he knows, a fen lullaby with no end. The bellows-keeper\\'s head sinks. It is still standing, and fast asleep.', shouts: ['Hhhh... who works the bellows? Who?'] }",
    "'7': { type: 'sign', gfx: 'muralSong', hidden: true, script: [['note', 'Under the soot, a second line: SECOND, THE TONGS THAT HOLD THE WORK.']] }",
    "v: { type: 'obj', gfx: 'gate', unless: 'sd.song', script: [['note', 'A door of black iron with no lock and no handle. Three bell-stones stand in the hall behind you.']] }",
    "o: { type: 'obj', pz: 'block', gfx: 'boulder', room: 'r3', text: 'A quenching-stone on the ice.' }",
    "f: { type: 'pz', pz: 'gap', under: 'pit', fill: 1, room: 'r3', fillText: 'The stone slides into the pit and wedges there, hissing. A way across, here and nowhere else.' }",
    "y: { type: 'pz', pz: 'plate', flag: 'sd.p3a', under: 'ice', room: 'r3', pressText: 'A bolt in the south door slides back. One more holds it.' }",
    "d: { type: 'pz', pz: 'plate', flag: 'sd.p3b', light: 1, hidden: true, under: 'stone', room: 'r3', pressText: 'A small plate on the ledge clicks down. A bolt in the south door slides back.' }",
    "'4': { type: 'obj', gfx: 'gate', unless: 'sd.p3a&sd.p3b', script: [['note', 'The south door of the Quench, held by two bolts. Two plates, somewhere in this room.']] }",
    "'3': { type: 'obj', pz: 'reset', room: 'r3', back: [22, 3], area: [22, 1, 32, 8] }",
    "'8': { type: 'sign', gfx: 'muralSong', hidden: true, script: [['note', 'Cut into the ice-wall: THIRD, THE HAMMER, THAT STRIKES.']] }",
    "l: { type: 'obj', pz: 'lamp', beam: 'left', flag: 'sd.lens', radius: 3, text: 'A lens-lamp, aimed down the hall.' }",
    "j: { type: 'obj', pz: 'mirror', tag: 'm1', start: '\\\\', who: 'runa', text: 'A mirror of polished steel as tall as a door, on a pivot rusted almost solid.' }",
    "k: { type: 'obj', pz: 'mirror', tag: 'm2', start: '\\\\' }",
    "m: { type: 'obj', pz: 'chime', note: 4, turns: ['m2'], text: 'A bell-stone rodded to the far mirror.' }",
    "'ü': { type: 'obj', pz: 'crystal', flag: 'sd.cr', latch: 1, litText: 'The beam strikes the crystal, and it blazes. Somewhere north, the shrine door\\'s first lock opens.' }",
    "'2': { type: 'obj', pz: 'lamp', seq: 'forge', order: 0, seqFlag: 'sd.seq', radius: 4, text: 'A great lamp carved with a bellows.' }",
    "'0': { type: 'obj', pz: 'lamp', seq: 'forge', order: 1, seqFlag: 'sd.seq', radius: 4, text: 'A great lamp carved with a pair of tongs.' }",
    "'ö': { type: 'obj', pz: 'lamp', seq: 'forge', order: 2, seqFlag: 'sd.seq', radius: 4, text: 'A great lamp carved with a hammer.' }",
    "'5': { type: 'obj', pz: 'lamp', seq: 'forge', order: 3, seqFlag: 'sd.seq', radius: 4, text: 'A great lamp carved with an anvil.', doneText: 'The fourth fire catches, and the four burn together. The shrine door\\'s second lock opens.' }",
    "'9': { type: 'sign', gfx: 'muralSong', hidden: true, script: [['note', 'On the last stone, very small: AND LAST, THE ANVIL, WHICH BEARS ALL.'], ['say', 'Dask', 'Bellows, tongs, hammer, anvil. Maren, that is your order.']] }",
    "h: { type: 'obj', gfx: 'gate', unless: 'sd.cr&sd.seq', script: [['note', 'The shrine door, with two locks: a crystal eye, and four empty lamp-sockets.']] }",
    "w: { type: 'npc', pz: 'beast', sprite: 'ghoul', dir: 'down', battle: 'ar_ghouls', text: 'A forge-hound of cinders and old bone lies across the shrine door, and it has been waiting a long time for someone to bite.', lullText: 'Finch hums the forge-song, very softly, slowed right down. The hound\\'s cinders dim. It curls up like a dog by a hearth.' }",
    "z: { type: 'obj', gfx: 'shrine', script: [['run', 'pzSmith']] }",
    "'ä': { type: 'obj', gfx: 'runeBlank', name: 'Hint stone', script: [['run', 'pzSmithHint']] }",
    "'ë': { type: 'obj', gfx: 'runeBlank', name: 'Hint stone', script: [['run', 'pzSmithHint']] }",
    "'ï': { type: 'obj', gfx: 'runeBlank', name: 'Hint stone', script: [['run', 'pzSmithHint']] }",
], ",\n    onEnter: [['if', '!pz.sd.in', [['set', 'pz.sd.in'], ['note', 'Hot, dry dark, and the smell of a forge that went out three hundred years ago. Somewhere ahead, something is still breathing like a bellows.'], ['say', 'Maren', 'This is where the Smith worked. The one who made the lamps. And the crown.'], ['say', 'Dask', 'Then let us not touch anything. Starting now. Starting with me.']]]]")

SCRIPTS = r"""
  /* ---------- rewards ---------- */
  D.scripts.pzMillrace = [['if', 'pz.mr.done', [['note', 'The old shrine to the river-spirit. You have had its blessing.']], [
    ['set', 'pz.mr.done'], ['quest', 'pz_millrace', 2],
    ['note', 'A little shrine to the river, where the millers used to leave a loaf. Runa puts her hand on the cold stone and something passes into her: the patience of millstones.'],
    ['say', 'Runa', 'Hah. I feel like a wall.'], ['feat', 'runa', 'thick']]]];
  D.scripts.pzBarrowLamps = [['if', 'hb.l4', [], [['if', 'hb.l3', [['set', 'hb.l4'], ['note', 'The fourth lamp catches. Every trap in the vault floor shows for a moment in the light, then sinks into shadow again.'], ['run', 'pzBarrowSpot']],
    [['if', 'hb.l2', [['set', 'hb.l3']], [['if', 'hb.l1', [['set', 'hb.l2']], [['set', 'hb.l1']]]]]]]]]];
  D.scripts.pzBarrowSpot = [['spotall']];
  D.scripts.pzBarrow = [['if', 'pz.hb.done', [['note', 'The sarcophagus is empty now. Its sleeper wanted nothing more.']], [
    ['set', 'pz.hb.done'], ['quest', 'pz_barrow', 2],
    ['note', 'The lid slides back. The barrow-thief inside was buried with what he stole: a pair of gloves of black silk, cold as the grave and not one thread rotted.'],
    ['say', 'Dask', 'A colleague. Three hundred years dead and still better dressed than me.'], ['give', 'shadowgloves'],
    ['note', 'Gravesilk Gloves: a charm for Dask. His first attack in every fight is always a Sneak Attack, with one extra die.']]]];
  D.scripts.pzChapel = [['if', 'pz.dc.done', [['note', 'The reliquary is quiet. The lamp inside burns on by itself.']], [
    ['set', 'pz.dc.done'], ['quest', 'pz_chapel', 2],
    ['note', 'In the reliquary, dry as a bone above the flood, a single Warden lamp burns. It has burned, untended, for two hundred years.'],
    ['say', 'Maren', 'Lamplighter. You kept this one going all by yourself.'], ['note', 'Maren cups her hands round the flame for a long moment. When she lets go, a little of it has stayed with her.'],
    ['feat', 'maren', 'grace']]]];
  D.scripts.pzSeaCaves = [['if', 'pz.sc.done', [['note', 'The sea-chest is empty, but it still smells of her pipe smoke.']], [
    ['set', 'pz.sc.done'], ['quest', 'pz_seacaves', 2],
    ['note', 'In the sea-chest, wrapped in oilskin: a bowstring of pale gut, and a note in a hand Finch knows. "For the next one of us who sings the gull-song. - G."'],
    ['say', 'Finch', '... Grandmother. You were here.'], ['give', 'sirenstring'],
    ['note', 'Siren-string: a charm for Finch. +1 bow range, and his first bow hit in every fight Inspires the ally nearest him.']]]];
  D.scripts.pzIceHalls = [['if', 'pz.ih.done', [['note', 'The niche is empty.']], [
    ['set', 'pz.ih.done'], ['quest', 'pz_icehalls', 2],
    ['note', 'In the niche, folded as neatly as the day it was put there: a war-cloak sewn with plates of rime-iron, and a name stitched inside. RUNA, it says. Not this Runa. The first one.'],
    ['say', 'Runa', 'Grandmother\'s grandmother. She left it for whoever was stubborn enough.'], ['give', 'frostmantle'],
    ['note', 'Frostbound Mantle: armour for Runa. +6 AC, +6 HP, and every weapon hit on her does 1 less damage.']]]];
  D.scripts.pzSpire = [['if', 'pz.es.done', [['note', 'The music-box chest is empty now. It still plays, softly, when you open it.']], [
    ['set', 'pz.es.done'], ['quest', 'pz_spire', 2],
    ['note', 'Inside the music-box chest is no treasure at all: only a sheet of songs, the lost second verses of every ballad Finch knows.'],
    ['say', 'Finch', 'Oh. Oh, these are better than the first verses.'], ['feat', 'finch', 'secondverse']]]];
  D.scripts.pzArchive = [['if', 'pz.ia.done', [['note', 'The Inquisitor\'s strongbox is empty.']], [
    ['set', 'pz.ia.done'], ['quest', 'pz_archive', 2],
    ['note', 'In Inquisitor Vell\'s private strongbox: files. On everyone. On Dask, a thick one, with every weakness he ever showed noted in red ink.'],
    ['say', 'Dask', 'So that is how they always caught me. They watched for the moment I flinched.'], ['say', 'Dask', 'Two can play.'],
    ['feat', 'dask', 'opportunist']]]];
  D.scripts.pzSmithHint = [['note', 'An old rune-stone, warm to the touch. Somebody left it here for the ones who come after.']].concat([['if', 'sd.g1', [['if', 'sd.song', [['if', 'sd.p3a&sd.p3b', [['if', 'sd.cr', [['if', 'sd.seq', [['if', 'pz.sd.done', [['note', 'The stone is quiet now. You have what the Smith left.']], [['choice', null, 'Words rise in the soot under your hand. How much do you want to know?', [['A nudge', [['note', 'The forge-hound guards the shrine. It can be fought, or it can be sung to sleep.']]], ['Tell me plainly', [['note', 'Finch can lull the hound from the doorway. Then the shrine is yours.']]], ['Nothing, thank you', []]]]]]], [['choice', null, 'Words rise in the soot under your hand. How much do you want to know?', [['A nudge', [['note', 'Four great lamps, four carvings: bellows, tongs, hammer, anvil. The walls give the order, if Dask looks low enough.']]], ['Tell me plainly', [['note', 'There is a hidden mural in each room, and Dask finds them. In order: the bellows lamp (south-east corner), the tongs (north-west), the hammer (east wall), then the anvil (south-west). Maren lights them in that order; a wrong lamp puts them all out.']]], ['Nothing, thank you', []]]]]]], [['choice', null, 'Words rise in the soot under your hand. How much do you want to know?', [['A nudge', [['note', 'The crystal by the west wall wants light. The lens-lamp in the east corner throws a beam, if someone turns the mirrors.']]], ['Tell me plainly', [['note', 'Maren lights the lens-lamp, and its beam runs west to the first steel mirror. Runa turns that one to send the beam south. The second mirror is rodded to the bell-stone on the south wall: Finch strikes it, and the beam runs west into the crystal.']]], ['Nothing, thank you', []]]]]]], [['choice', null, 'Words rise in the soot under your hand. How much do you want to know?', [['A nudge', [['note', 'The south door of the Quench has two bolts. One plate is out on the ice; the other is hidden on the far ledge, where nobody can stand.']]], ['Tell me plainly', [['note', 'On ice a stone slides until something stops it: a pillar, the other stone, or a plate. Work backwards from the plate in the north-east corner: the second stone has to arrive in its column or its row with nothing in the way, so the first stone must bridge the pit at exactly the square that lets it. Any stone that drops into the pit stays there, so a careless shove costs you the room (the menu has Start this room over). Dask can see the hidden plate on the ledge and flick a pebble onto it from across the pit.']]], ['Nothing, thank you', []]]]]]], [['choice', null, 'Words rise in the soot under your hand. How much do you want to know?', [['A nudge', [['note', 'Four notes, low, high, middle, high. The bell-stones are shaped like the sounds they make. Two guards are listening.']]], ['Tell me plainly', [['note', 'Finch plays the bell-stones in this order: the bellows (low, north-west), the hammer-head (high, north-east), the anvil (middle, south wall), the hammer-head again. Sing the Bellows-keeper to sleep first. The Forge-warden looks down, then left, then right, one turn for every step you take: count, and cross while it looks away. (The carving by the Cinder Gate shows the song once Maren lights its lamp.)']]], ['Nothing, thank you', []]]]]]], [['choice', null, 'Words rise in the soot under your hand. How much do you want to know?', [['A nudge', [['note', 'The Cinder Gate wants weight on its plate. Something heavy is hidden close by, and the floor between is not to be trusted.']]], ['Tell me plainly', [['note', 'Put Dask in front: he sees the hidden traps across the floor (and can disarm them), and a soot-black seam in the west wall. Behind it, Runa can push the anvil-stone out and down onto the plate. While you are here, Maren\'s lamp by the gate lights up the song you will need next.']]], ['Nothing, thank you', []]]]]]]);
  D.scripts.pzSmith = [['if', 'pz.sd.done', [['note', 'The anvil-shrine is cold. Its gift is in your hands now.']], [
    ['set', 'pz.sd.done'], ['set', 'smithEdge'], ['quest', 'pz_smith', 2],
    ['note', 'On the anvil lies a whetstone, worn hollow in the middle by three hundred years of the Smith\'s hand. One by one, the four of you draw a blade across it.'],
    ['say', 'Runa', 'It feels like the edge knows where to go.'], ['say', 'Finch', 'My rapier just hummed. Did anyone else\'s hum?'],
    ['note', "The Smith's Edge: for the whole party, critical hits come one number sooner (a natural 19 or 20 is now a critical hit)."]]]];
  D.scripts.pzLamps = [['if', 'pz.uc.done', [['note', 'The shrine is quiet. The lamp is with Maren now.']], [
    ['set', 'pz.uc.done'], ['quest', 'pz_lamps', 2],
    ['note', 'On the shrine sits a small, plain lamp of old brass. It is the oldest thing Maren has ever seen, and it lights itself as she reaches for it.'],
    ['say', 'Maren', 'The first Wardens carried this under Highmoor. Brother, I have it. I have it.'], ['give', 'brotherslantern'],
    ['note', "Brother's Lantern: a charm for Maren. +2 Power, and the whole party starts every fight Blessed."]]]];
"""

ENTRANCES = r"""
  /* ---------- the ways in, and the quests that point to them ---------- */
  Object.assign(D.quests, {
    pz_millrace: { ch: 1, name: 'The Millrace Cellars', short: 'Millrace Cellars', done: 2, stages: { 1: 'Teague says the old race under the mill has a shrine at the bottom, behind three shut sluices. Runa can shove millstones; Dask has sharp eyes.', 2: 'Runa found the river-shrine under the mill. (New feat: Thick-Skinned.)' } },
    pz_barrow: { ch: 1, name: 'The Hollow Barrow', short: 'The Hollow Barrow', done: 2, stages: { 1: 'A trapped barrow in the Thornwood, pitch dark inside. Dask can spot and disarm traps; Maren carries the best light.', 2: 'Dask robbed a barrow-thief. (New item: Gravesilk Gloves.)' } },
    pz_chapel: { ch: 2, name: 'The Drowned Chapel', short: 'The Drowned Chapel', done: 2, stages: { 1: 'A chapel out in the Mirefen, half under the sea, with a tide bell. Finch can ring the bell; Maren lights the old lamps; Runa shifts what is heavy.', 2: 'Maren found the lamp that never went out. (New feat: Keeper\'s Grace.)' } },
    pz_icehalls: { ch: 3, name: 'The Ice Halls of Karrow', short: 'The Ice Halls', done: 2, stages: { 1: 'Old Karrow ice-halls under the Frost Pass, where the floors are glass and the blocks slide. Runa\'s clan kept its best gift at the bottom.', 2: 'Runa found her ancestor\'s war-cloak. (New item: Frostbound Mantle.)' } },
    pz_spire: { ch: 3, name: 'The Echo Spire', short: 'The Echo Spire', done: 2, stages: { 1: 'A singer\'s tower by the falls, full of bells and mirrors. The bell-stones turn the mirrors; the mirrors steer the light.', 2: 'Finch found the lost second verses. (New feat: Second Verse.)' } },
    pz_archive: { ch: 4, name: "The Inquisitor's Archive", short: "The Inquisitor's Archive", done: 2, stages: { 1: 'Vell\'s archive in Highmoor, guarded after the bell. Wardens send away anyone they see. Dask can read where they will look next.', 2: 'Dask read his own file. (New feat: Opportunist.)' } },
    pz_lamps: { ch: 4, name: 'The Undercroft of Lamps', short: 'The Undercroft of Lamps', done: 2, stages: { 1: 'The first Warden hall, under the Undercroft. Four great lamps, and writing on the walls that says in what order.', 2: "Maren found the first lamp. (New item: Brother's Lantern.)" } },
    pz_smith: { ch: 5, name: "The Smith's Deep", short: "The Smith's Deep", done: 2, stages: { 1: 'Under Ashfall, the forge of the Warden who made the lamps, and the crown. Pitch dark, guarded, and built to need all four of you, every room.', 2: "The party found the Smith's whetstone. (New: the Smith's Edge: critical hits on 19-20.)" } },
    pz_seacaves: { ch: 2, name: 'The Singing Sea-Caves', short: 'The Singing Sea-Caves', done: 2, stages: { 1: 'Caves under Saltmere that sing when the tide is in. Finch can play the bell-stones, if you can find the songs.', 2: 'Finch found his grandmother\'s gift. (New item: Siren-string.)' } }
  });
  const way = (map, x, y, def) => D.placeNear(map, null, x, y, Object.assign({ type: 'warp', gfx: 'stairsDown', out: 'down' }, def));
  const MILL = way('mill', 27, 13, { to: 'millrace', at: 'u', under: 'grass', script: [['if', '!millFree', [['note', 'A trapdoor into the mill cellars. Not while the yard is full of goblins.'], ['end']]], ['quest', 'pz_millrace', 1]] });
  const THORN = way('thornwood', 34, 22, { to: 'hollowbarrow', at: 'u', gfx: 'caveMouth', under: 'grass', script: [['if', '!joined', [['note', 'A barrow-mound with a black door in its side. Not yet.'], ['end']]], ['quest', 'pz_barrow', 1]] });
  const FEN = way('mirefen', 40, 6, { to: 'drownedchapel', at: 'u', gfx: 'stairsDown', under: 'marsh', script: [['quest', 'pz_chapel', 1]] });
  const SALT = way('saltmere', 4, 24, { to: 'seacaves', at: 'u', gfx: 'caveMouth', under: 'sand', out: 'up', script: [['quest', 'pz_seacaves', 1]] });
  const ICE = way('frostpass', 30, 20, { to: 'icehalls', at: 'u', gfx: 'caveMouth', under: 'snow', script: [['quest', 'pz_icehalls', 1]] });
  const SPIRE = way('falls', 10, 10, { to: 'echospire', at: 'u', gfx: 'stairsDown', out: 'up', script: [['quest', 'pz_spire', 1]] });
  const ARCH = way('highmoor', 8, 6, { to: 'archive', at: 'u', gfx: 'stairsDown', script: [['quest', 'pz_archive', 1]] });
  const LAMPS = way('undercroft', 20, 12, { to: 'lampvault', at: 'u', gfx: 'stairsDown', script: [['quest', 'pz_lamps', 1]] });
  const SMITH = way('ashfall', 7, 3, { to: 'smithdeep', at: 'u', gfx: 'caveMouth', script: [['if', 'chapter<5', [['note', 'A low cave-mouth breathing warm air. Not yet.'], ['end']]], ['quest', 'pz_smith', 1]] });
  M.smithdeep.things.u.at = SMITH;
  M.icehalls.things.u.at = ICE; M.echospire.things.u.at = SPIRE; M.archive.things.u.at = ARCH; M.lampvault.things.u.at = LAMPS;
  M.millrace.things.u.at = MILL; M.hollowbarrow.things.u.at = THORN; M.drownedchapel.things.u.at = FEN; M.seacaves.things.u.at = SALT;
"""

# ---------------------------------------------------------------- hints for every hard room
# Asked of the room's red lever (or the menu): a nudge, or the plain answer, which is the solver's own shortest way
# through, written out as arrows from the spot the lever puts you back on.
NUDGE = {
    ('millrace', 'r1'): ('Runa', 'Work backwards: from which side must Runa push to land each stone on its plate? Make sure she can still get round to that side once the first stone is placed. A stone against a wall only slides along it; one in a corner never moves again.'),
    ('millrace', 'r2s'): ('Runa', 'Dask first: both drain plates are under the silt, and you cannot plan for plates you cannot see. Then work backwards from each plate, and keep the stones out of the corners.'),
    ('millrace', 'r2n'): ('Runa', 'The two stones start side by side. Move the one that is in the way of the other first, and think about where Runa will have to stand for each last shove.'),
    ('millrace', 'r3a'): ('Runa', 'A small room, so every shove counts. One stone has to come round the pillar; get that one placed before the other blocks its way.'),
    ('millrace', 'r3b'): ('Runa', 'A narrow strip with both plates side by side at the bottom. The stones have to come down one at a time, and the first must not block the column the second needs.'),
    ('hollowbarrow', 'r3'): ('Maren', 'One skull, two, three, four. Every cracked square holds once, and sound stone holds forever. Trace the whole way from lamp to lamp to the grate before taking a step.'),
    ('drownedchapel', 'r3'): ('Runa', 'Finch rings the bell for low tide first, or the aisle plate is under water. One saint goes all the way up the sunken aisle; the other has its plate in the dry end.'),
    ('seacaves', 'r3'): ('Finch', 'Shell, moon, sun, then back for wave and gull, then out by the far gap. Plan a way along the shelf that never needs the same cracked square twice: the sound rock can be crossed as often as you like.'),
    ('icehalls', 'r1'): ('Runa', 'On the ice a stone slides until something stops it: a pillar, a wall, the other stone, or a plate. Count where each shove ends before you make it.'),
    ('icehalls', 'r2'): ('Runa', 'Dask first, for the plate under the frost. Then use one stone as a backstop for the other: a stone stops dead against its partner.'),
    ('icehalls', 'r3'): ('Runa', 'The great rink is long work. Each plate has only one or two lines a stone can slide in along; find them, then find how to get a stone onto each line.'),
    ('lampvault', 'r2'): ('Runa', 'Both boulders must go down the same column: the first fills the near row of pit, the second is pushed over it into the far row. Choose a column you can line both up in.'),
    ('archive', 'r2'): ('Runa', 'A warden cannot see through a bookcase. The wardens at the west ends of the two upper aisles hardly ever look away: close each of those aisles with a bookcase on castors, between the warden and the way you need. Both bookcases start in the bottom aisle; roll them west and shove them up through the gaps. A bookcase in a corner or a dead end is lost until you pull the lever. The bottom warden only sees a few squares: work behind a bookcase near him, or wait (step back and forth) until he looks down.'),
    ('smithdeep', 'r3'): ('Runa', 'Work backwards from the plate in the north-east corner: the second stone has to slide in along its row or its column. The first stone must bridge the pit exactly where that line crosses it.'),
}
MANUAL = {
    ('echospire', 'r2'): ('Finch', 'Follow the daylight down from the roof and work out which way each of the five mirrors must face to carry it to the false wall. Then find stones whose rods turn exactly the mirrors that are wrong.',
                          'Strike the first, second and third bell-stones, once each, then walk off the far end of the gallery. (The third, fourth and fifth work as well.) Then Dask opens the false wall.'),
}
ARROW = {'u': '↑', 'd': '↓', 'l': '←', 'r': '→'}
def plain_path(path):
    toks = []
    for t in path:
        kind = 'P' if t[0] == 'P' else 'F' if t[0] == 'F' else 'S'
        toks.append((kind, t[-1]))
    out = []; i = 0
    while i < len(toks):
        j = i
        while j < len(toks) and toks[j] == toks[i]: j += 1
        kind, d = toks[i]; n = j - i
        sym = ('⇒' if kind == 'P' else '✦' if kind == 'F' else '') + ARROW[d]
        out.append(sym + (str(n) if n > 1 else ''))
        i = j
    return ' '.join(out)
HINTS = {}
for (mid, rid), (lead, nudge) in NUDGE.items():
    r = ROOMS[mid][rid]
    lead_in = {('hollowbarrow', 'r3'): ['u'], ('seacaves', 'r3'): ['u'], ('smithdeep', 'r3'): ['l']}.get((mid, rid), [])   # the lever's spot is a step outside the room
    HINTS.setdefault(mid, {})[rid] = {'nudge': nudge, 'plain': 'Lead with ' + lead + ', from the spot the red lever puts you on (arrows are steps, ⇒ a shove, ✦ the leader\'s move facing that way): ' + plain_path(lead_in + r['path'])}
for (mid, rid), (lead, nudge, plain) in MANUAL.items():
    HINTS.setdefault(mid, {})[rid] = {'nudge': nudge, 'plain': plain}
SCRIPTS += "\n  D.pzHints = " + json.dumps(HINTS, ensure_ascii=False) + ";\n"

out = """/* The puzzle dungeons: two in each of chapters 1 to 4, each built around one hero's move with the others in
   support, paying that hero a feat or a unique item; and the Smith's Deep in chapter 5, the last and hardest, which
   needs all four in every room and pays the whole party the Smith's Edge. Generated by tools/puzzles.py: edit there.
   Pieces are documented in src/puzzle.js. */
(function () {
  const D = G.D, M = D.maps;
%s
%s
%s
})();
""" % ('\n\n'.join(MAPS), SCRIPTS, ENTRANCES)
for k, v in (("'__MILL__'", "'u'"), ("'__THORN__'", "'u'"), ("'__FEN__'", "'u'"), ("'__SALT__'", "'u'")):
    out = out.replace(k, v)
open(os.path.join(ROOT, 'data', 'ch9_world', 'g_puzzles.js'), 'w').write(out)
if __name__ == '__main__':
    import sys
    if '-v' in sys.argv:
        for m in MAPS: print(m[:0])
    json.dump(ROOMS, open(os.path.join(ROOT, 'tools', 'pz_rooms.json'), 'w'), indent=1)
    for mid, rr in ROOMS.items():
        for rid, r in rr.items(): print('  %-14s %-5s steps %3d pushes %3d ruinable %.2f states %d' % (mid, rid, r['steps'], r['pushes'], r['dead'] or 0, r['states']))
    print('wrote g_puzzles.js')
