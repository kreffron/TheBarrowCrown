"""Draws the five towns and writes data/ch9_world/c_towns.js.

Each town keeps its size (scripted scenes use coordinates) and its things, which are placed by character, or by
`@tag` for the ones the chapter expansions added. The JS side checks every thing is placed exactly where asked.
Run: python3 tools/towns.py
"""
import json, os, random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Town:
    def __init__(self, id, w, h, fill='.'):
        self.id, self.w, self.h = id, w, h
        self.g = [[fill] * w for _ in range(h)]
        self.places = []          # (selector, x, y)
        self.legend = {}
        self.keep = set()         # cells decor must not touch

    def set(self, x, y, ch):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.g[y][x] = ch

    def get(self, x, y):
        return self.g[y][x] if 0 <= x < self.w and 0 <= y < self.h else None

    def rect(self, x, y, w, h, ch):
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.set(xx, yy, ch)

    def frame(self, x, y, w, h, ch):
        for xx in range(x, x + w):
            self.set(xx, y, ch); self.set(xx, y + h - 1, ch)
        for yy in range(y, y + h):
            self.set(x, yy, ch); self.set(x + w - 1, yy, ch)

    def rows(self, x, y, lines):
        """Stamps literal rows; spaces are left alone."""
        for dy, line in enumerate(lines):
            for dx, ch in enumerate(line):
                if ch != ' ':
                    self.set(x + dx, y + dy, ch)

    def house(self, x, y, w, h, roof='^', wall='W', win='N', door=None, wins=None):
        """Roof rows on top, one wall row at the bottom. door = (dx, selector) puts a thing in the wall."""
        self.rect(x, y, w, h - 1, roof)
        wy = y + h - 1
        for i in range(w):
            self.set(x + i, wy, wall)
        for i in (wins if wins is not None else range(1, w - 1, 3)):
            self.set(x + i, wy, win)
        if door:
            dx, sel = door
            self.set(x + dx, wy, '.')
            self.put(sel, x + dx, wy)
            return (x + dx, wy + 1)

    def path(self, pts, ch=':', width=1):
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            if x0 == x1:
                for y in range(min(y0, y1), max(y0, y1) + 1):
                    for k in range(width):
                        self.set(x0 + k, y, ch)
            else:
                for x in range(min(x0, x1), max(x0, x1) + 1):
                    for k in range(width):
                        self.set(x, y0 + k, ch)

    def outside(self, start, ch, through='.,'):
        """Flood-fills from start over `through` cells, turning them to ch (the land outside a wall)."""
        todo, seen = [start], set()
        while todo:
            x, y = todo.pop()
            if (x, y) in seen or (self.get(x, y) or '#') not in through:
                continue
            seen.add((x, y)); self.set(x, y, ch)
            todo += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]

    def put(self, sel, x, y):
        self.places.append([sel, x, y])
        self.keep.add((x, y))

    def scatter(self, chars, n, box, seed, on='.', clear=1):
        """Drops n decor pieces on `on` cells inside box=(x0,y0,x1,y1), away from things and paths."""
        r = random.Random(seed)
        x0, y0, x1, y1 = box
        placed = tries = 0
        while placed < n and tries < n * 60:
            tries += 1
            x, y = r.randint(x0, x1), r.randint(y0, y1)
            if self.get(x, y) not in on:
                continue
            bad = False
            for dy in range(-clear, clear + 1):
                for dx in range(-clear, clear + 1):
                    if (x + dx, y + dy) in self.keep or self.get(x + dx, y + dy) in (':', '=', '-'):
                        bad = True
            if bad:
                continue
            self.set(x, y, r.choice(chars))
            placed += 1

    def text(self):
        return [''.join(r) for r in self.g]


# ---------------------------------------------------------------- Brackenford: a river village at the forest's edge
def brackenford():
    t = Town('brackenford', 40, 28)
    # forest, thick in the north-west and north-east, thinning to the south
    t.rows(0, 0, [
        'TTTTTTTTTTTTTTTTTTT  TTTTTTTTTTTTTTTTTTT',
        'TTTTTTTT TTTTTTTTTT  TTTT TTTTTTTTTTTTTT',
        'TTTT       TTTT          T     TTTTTTTTT',
        'TTT                              TTTTTTT',
        'TT                                TTTTTT',
        'TT                                 TTTTT',
        'T                                    TTT',
    ])
    for y in range(7, 22):
        t.set(0, y, 'T'); t.set(39, y, 'T')
    for (x, y) in [(1, 9), (1, 10), (1, 15), (38, 8), (38, 12), (37, 12), (38, 13), (1, 20), (38, 19), (38, 20)]:
        t.set(x, y, 'T')
    # the north road winds in from the forest gate to the green
    t.path([(19, 0), (19, 3)], width=2)
    t.path([(19, 3), (24, 3)], width=2)
    t.path([(23, 4), (23, 8)], width=2)
    t.put('n', 19, 0); t.put('n', 20, 0)
    # the Crooked Lantern: a long low inn with a stable
    door = t.house(4, 3, 12, 4, door=(6, 'a'), wins=[1, 3, 9, 11])
    t.house(16, 4, 3, 3, roof='^', wall='W', wins=[])
    t.rows(17, 7, ['UU'])
    t.path([(10, 7), (22, 7)])
    t.put('s', 12, 7)
    t.put('q', 3, 7)
    t.put('g', 8, 8); t.put('h', 11, 8); t.put('f', 13, 8)       # the party, waiting outside the inn of a morning
    # Odo's Sundries, up the lane to the east, with a vegetable patch
    t.house(27, 2, 7, 4, door=(3, 'b'), wins=[1, 5])
    t.path([(25, 7), (30, 7), (30, 6)])
    t.path([(24, 7), (25, 7)])
    t.rect(33, 6, 3, 2, ',')
    t.frame(32, 5, 5, 4, 'F'); t.set(34, 8, '.')
    # Hobb the reeve's cottage on the rise, north-west of the green
    t.house(2, 9, 6, 3, wins=[2], door=None)
    t.put('5', 9, 10)
    # the village green: the old oak, the well, the board, a bench
    t.rect(15, 9, 13, 7, '.')
    t.set(16, 11, 'T')
    t.put('w', 21, 12)
    t.put('@board1', 25, 10)
    t.rows(18, 14, ['▬'])
    t.put('2', 19, 11)                         # Tam, playing on the green
    t.path([(23, 9), (23, 10), (22, 10)])
    t.path([(22, 10), (22, 15)])
    # Ingrid's forge, west, with an anvil and a woodpile
    t.house(4, 13, 7, 4, roof='^', wall='S', win='H', door=(3, 'c'), wins=[1, 5])
    t.rows(2, 16, ['ZX'])
    t.rows(11, 14, ['U'])
    t.path([(7, 17), (19, 17)])
    t.path([(14, 14), (21, 14)])
    t.path([(14, 14), (14, 17)])
    t.put('7', 12, 18)                          # Garrick, back from the wood
    # the temple and its churchyard, in the south-west
    t.house(2, 19, 7, 3, roof='^', wall='S', win='H', door=(3, 'e'), wins=[1, 5])
    t.frame(9, 18, 10, 4, 'F')
    t.rect(10, 19, 8, 2, '.')
    t.set(13, 21, '.')
    for (x, y) in [(10, 19), (12, 19), (16, 19), (17, 20)]:
        t.set(x, y, 'G')
    t.put('x', 14, 19)
    t.put('@lantern1', 11, 20); t.put('@lantern2', 15, 20)
    t.put('3', 12, 22)                           # old Pell, by the churchyard gate
    # cottages on the east lane: Wenna and Garrick's, and two neighbours
    t.path([(22, 15), (22, 17)])
    t.path([(22, 17), (35, 17)])
    t.house(25, 12, 6, 4, door=None, wins=[1, 4])
    t.put('d', 27, 15)
    t.put('4', 28, 16)
    t.house(32, 13, 5, 3, roof='^', wall='W', wins=[1, 3])
    t.house(29, 19, 6, 3, roof='^', wall='W', wins=[1, 4])
    t.rect(31, 9, 5, 3, ',')
    t.frame(30, 8, 7, 5, 'F'); t.set(33, 12, '.')
    t.put('@lantern3', 18, 21)
    # the field on the east bank, and the farmer who works it
    t.rect(24, 22, 6, 1, 'ψ')
    # the river front: kept as it was, for the farewell scene
    t.rows(0, 22, [
        'T    ::::::::::::::::::::::::::        T',
        'T  ,         ψψ ,rmiljop    ψψψψψψ     T',
        'T  ¡       B   ¡   ::  6       T    ¡  T',
        'T ¡¡  ¡        ¡ yuztv   ¡  ¡   ¡ ¡¡   T',
        '~~~~~~~~~~~~~~~~~~~kk~~~~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    ])
    t.path([(22, 15), (22, 17)])
    t.path([(19, 17), (19, 22)], width=2)
    for ch, x, y in [('r', 17, 23), ('m', 18, 23), ('i', 19, 23), ('l', 20, 23), ('j', 21, 23), ('o', 22, 23), ('p', 23, 23),
                     ('6', 24, 24), ('y', 17, 25), ('u', 18, 25), ('z', 19, 25), ('t', 20, 25), ('v', 21, 25), ('k', 19, 26), ('k', 20, 26)]:
        t.put(ch, x, y)
    t.set(24, 24, '.')
    for (x, y) in [(17, 23), (18, 23), (19, 23), (20, 23), (21, 23), (22, 23), (23, 23), (17, 25), (18, 25), (19, 25), (20, 25), (21, 25), (19, 26), (20, 26)]:
        t.set(x, y, '.')
    # flowers, shrubs and odds and ends
    t.scatter([',', ',', 'ψ', 'ƒ'], 40, (1, 3, 38, 21), seed=3)
    t.scatter(['♣', 'B', 'U', 'X'], 9, (2, 3, 37, 21), seed=4, clear=1)
    t.legend = {}
    return t


# ---------------------------------------------------------------- Saltmere: a harbour town on a slope down to the sea
def saltmere():
    t = Town('saltmere', 40, 28)
    t.legend = {'D': 'stall'}
    # sea and shore: the coast climbs from the west beach to the harbour, and a rocky headland holds the light
    coast = {}
    for x in range(40):
        coast[x] = 22 if x < 9 else 20 if x < 16 else 19 if x < 28 else 21 if x < 32 else 26
    for x in range(40):
        for y in range(coast[x], 28):
            t.set(x, y, '~')
        if coast[x] < 28:
            t.set(x, coast[x] - 1, '<' if x % 3 else '.')
    # the quay: a boardwalk along the harbour, two piers, boats, nets
    t.path([(9, 18), (31, 18)], ch='-')
    t.path([(13, 18), (13, 25)], ch='-'); t.path([(24, 18), (24, 26)], ch='-')
    for (x, y) in [(11, 22), (15, 23), (22, 21), (26, 24), (27, 21)]:
        t.set(x, y, '!')
    t.rows(16, 17, ['$$']); t.rows(28, 17, ['$']); t.rows(10, 17, ['UX']); t.rows(30, 17, ['XU'])
    # the headland and the lighthouse
    t.rect(33, 11, 7, 1, 'R')
    for y in range(12, 26):
        t.set(39, y, 'R')
    t.rect(32, 22, 7, 4, 'R')
    t.rows(33, 12, ['..R...', '......', '......', '.R....', '......', '......', '......', '....R.', '......', '.R....'])
    t.put('l', 36, 14)
    t.put('k', 35, 16); t.put('p', 34, 16)
    t.path([(31, 18), (33, 18), (33, 16), (35, 16)])
    t.set(35, 16, '.'); t.set(34, 16, '.')
    t.put('v', 38, 20); t.set(37, 20, '.')
    t.put('@toPans', 39, 12); t.set(38, 12, '.')
    # marsh to the north-east, and the fen gate
    t.rect(31, 1, 8, 9, ',')
    t.scatter([';', ';', '¡'], 16, (31, 1, 38, 9), seed=5, on=',')
    t.path([(23, 9), (38, 9)])
    t.put('e', 39, 9)
    # the north road and the square
    t.path([(19, 0), (19, 7)], width=2)
    t.put('n', 19, 0); t.put('n', 20, 0)
    t.rect(17, 7, 7, 4, ':')
    t.put('m', 22, 7); t.put('@board2', 24, 10)
    t.put('r', 18, 9)
    t.path([(21, 10), (21, 17)])
    # the Gull and Lantern, west along the high street
    t.path([(4, 7), (17, 7)])
    t.house(2, 2, 9, 5, door=(5, 'a'), wins=[1, 3, 6, 8])
    t.rows(11, 5, ['UU'])
    t.house(12, 2, 5, 4, wins=[2])
    # Brine and Rook, down by the west quay
    t.house(4, 12, 6, 4, door=(3, 'b'), wins=[1, 4])
    t.path([(7, 8), (7, 11)])
    t.path([(7, 16), (7, 18)])
    t.path([(7, 18), (9, 18)], ch='-')
    # Ama's cottage, and net-sheds
    t.house(11, 10, 5, 3, wins=[1, 3])
    t.put('w', 13, 13)
    t.house(1, 9, 4, 3, wins=[2])
    t.rows(16, 12, ['$$'])
    # the fish market on the quay, and the harbour office
    t.rows(15, 15, ['D.D.D'])
    t.house(25, 12, 6, 4, roof='^', wall='S', win='H', wins=[1, 4])
    t.put('q', 27, 15)
    t.put('u', 20, 18)
    # the chapel of the Tide-Lamp on the hill, east
    t.house(26, 2, 7, 4, roof='^', wall='S', win='H', door=(3, 'c'), wins=[1, 5])
    t.path([(24, 7), (29, 7), (29, 6)])
    t.path([(29, 7), (29, 8)])
    # people
    t.put('1', 13, 20)          # a fisherman out on the west pier
    t.put('2', 26, 17)
    t.put('3', 11, 16)
    t.put('@ama2', 18, 13)
    t.put('z', 6, 20)
    t.put('@toWreck', 1, 19); t.set(1, 20, '.')
    t.scatter(['·', '·', 'ψ', '¡'], 26, (1, 1, 37, 20), seed=7)
    t.scatter(['U', 'X', '♣'], 6, (2, 2, 30, 16), seed=8)
    return t


# ---------------------------------------------------------------- Karrow Hold: a clan hold behind a palisade in the snow
def karrow():
    t = Town('karrow', 40, 30)
    # a lopsided palisade, pines outside it
    wall = [(5, 2), (18, 2), (18, 2), (21, 2), (30, 2), (30, 4), (35, 4), (35, 13), (37, 13), (37, 20), (34, 20), (34, 27),
            (21, 27), (18, 27), (8, 27), (8, 24), (3, 24), (3, 10), (5, 10), (5, 2)]
    t.path(wall, ch='F')
    for (x, y) in [(5, 2), (30, 2), (35, 4), (37, 13), (37, 20), (34, 27), (8, 27), (3, 24), (3, 10), (18, 2), (21, 2), (18, 27), (21, 27)]:
        t.set(x, y, ']')
    t.outside((0, 0), '{')
    for (x, y, w, h) in [(0, 0, 40, 1), (0, 29, 40, 1), (0, 0, 1, 30), (39, 0, 1, 30)]:
        t.rect(x, y, w, h, '{')
    for x in range(19, 21):
        for y in range(0, 3):
            t.set(x, y, '.')
        for y in range(27, 30):
            t.set(x, y, '.')
    t.scatter(['.', '.', '(', '}'], 30, (1, 1, 38, 28), seed=12, on='{')
    t.put('e', 19, 0); t.put('e', 20, 0); t.put('n', 19, 29); t.put('n', 20, 29)
    t.put('7', 18, 1); t.put('5', 18, 28); t.put('6', 21, 28)
    # the road through the hold bends round the Ring of Stones
    t.path([(19, 0), (19, 6)], width=2)
    t.path([(14, 6), (20, 6)], width=2)
    t.path([(14, 7), (14, 16)], width=2)
    t.path([(14, 16), (20, 16)], width=2)
    t.path([(19, 16), (19, 29)], width=2)
    # the Longhall, huge, in the north-west
    t.house(6, 3, 9, 5, roof='|', wall='W', win='N', door=(4, 'a'), wins=[1, 3, 6, 8])
    t.rows(8, 8, ['+']); t.rows(12, 8, ['+'])
    t.path([(10, 8), (10, 9)]); t.path([(10, 9), (14, 9)])
    # the Ring of Stones, with the ward-lamp at its heart
    for (x, y) in [(25, 5), (28, 4), (31, 5), (32, 8), (31, 11), (28, 12), (25, 11), (24, 8)]:
        t.set(x, y, ']')
    t.put('h', 28, 8)
    t.put('y', 26, 9)
    t.path([(16, 9), (23, 9)])
    # Forge and Furs, by the west wall, with racks of hides
    t.house(4, 12, 7, 4, roof='|', wall='W', win='N', door=(3, 'b'), wins=[1, 5])
    t.rows(11, 13, ['X', 'U'])
    t.path([(7, 16), (7, 17)]); t.path([(7, 17), (14, 17)])
    # round huts
    t.house(4, 19, 5, 3, roof='|', wall='W', win='N', wins=[2])
    t.house(9, 22, 5, 3, roof='|', wall='W', win='N', wins=[2])
    t.house(23, 15, 5, 3, roof='|', wall='W', win='N', wins=[1, 3])
    t.house(34, 15, 3, 3, roof='|', wall='W', win='N', wins=[1])
    # the cells, stone, by the east wall
    t.house(28, 17, 6, 4, roof='|', wall='S', win='H', door=(3, 'j'), wins=[1, 4])
    t.path([(31, 21), (31, 22)]); t.path([(21, 22), (31, 22)])
    # the frozen pond, and the drying racks
    t.rect(23, 23, 8, 3, ')'); t.rect(24, 22, 5, 1, ')'); t.rect(25, 26, 4, 1, ')')
    t.rows(12, 19, ['A', 'A'])
    # Hrolf by the Longhall fire, Asta and the children by the pond, hunters at the gates
    t.put('s', 13, 8)
    t.put('w', 21, 24)
    t.put('2', 26, 21)
    t.put('1', 16, 20)
    t.put('3', 33, 12); t.put('4', 9, 10)
    t.put('@board3', 17, 14)
    t.scatter([',', ',', '(', '✧'], 40, (4, 3, 34, 26), seed=13)
    t.scatter(['♠', '{', '}', '+'], 10, (4, 3, 34, 26), seed=14)
    return t


# ---------------------------------------------------------------- Highmoor: a walled city of crooked streets
def highmoor():
    t = Town('highmoor', 44, 34)
    t.legend = {'D': 'stall', '>': 'fountain', '/': 'hedge', '«': 'marble'}
    # the city wall, with the south gate
    t.frame(0, 0, 44, 34, 'S')
    for x in range(21, 23):
        t.set(x, 33, '.')
    t.put('n', 21, 33); t.put('n', 22, 33)
    t.put('5', 20, 32); t.put('6', 23, 32); t.put('h', 24, 31)
    # the palace on its terrace, behind its own wall
    t.house(12, 1, 20, 6, roof='^', wall='S', win='H', wins=[2, 5, 8, 11, 14, 17])
    t.rect(10, 7, 24, 1, 'S')
    t.set(21, 7, '«'); t.set(22, 7, '«')
    t.put('a', 21, 7); t.put('a', 22, 7)
    t.put('7', 20, 8); t.put('8', 23, 8)
    t.rect(10, 1, 2, 6, '/'); t.rect(32, 5, 2, 2, '/')
    # the Chancellery tower, north-east, square and grey
    t.house(35, 1, 6, 5, roof='^', wall='S', win='H', door=(2, '@toTower4'), wins=[1, 4])
    t.places[-1].append('down')
    # the avenue: from the gate north, east round the fountain square, and up to the palace
    t.path([(21, 26), (21, 33)], width=2)
    t.path([(21, 25), (27, 25)], width=2)
    t.path([(26, 17), (26, 26)], width=2)
    t.path([(21, 16), (27, 16)], width=2)
    t.path([(21, 8), (21, 17)], width=2)
    # the fountain square, east of the avenue
    t.rect(28, 15, 9, 7, ',')
    t.rows(30, 16, ['«««', '«>«', '«««'])
    t.put('@board4', 29, 15)
    t.put('@ashby', 34, 20)
    t.put('1', 33, 16)
    # the cathedral, among hedged gardens
    t.house(30, 8, 11, 6, roof='^', wall='S', win='H', door=(5, 'c'), wins=[1, 3, 7, 9])
    t.rect(28, 9, 2, 5, '/'); t.rect(41, 9, 1, 3, '/')
    t.path([(35, 14), (35, 15)])
    # Orrin and Sons, west, stone and narrow-windowed
    t.house(2, 9, 9, 5, roof='^', wall='S', win='H', door=(5, 'b'), wins=[1, 3, 7])
    t.path([(7, 14), (7, 15)]); t.path([(7, 15), (20, 15)])
    # the canal, crossing the west quarter on a slant, with two bridges
    t.path([(1, 19), (12, 19)], ch='~', width=2)
    t.path([(12, 19), (12, 23)], ch='~', width=2)
    t.path([(12, 22), (19, 22)], ch='~', width=2)
    t.set(6, 19, '='); t.set(6, 20, '='); t.set(12, 21, '='); t.set(13, 21, '='); t.set(17, 22, '='); t.set(17, 23, '=')
    # the print-shop, behind the canal
    t.house(2, 15, 6, 3, roof='^', wall='W', win='N', door=(2, '@toPrint'), wins=[1, 4])
    t.places[-1].append('down')
    # the market: stalls by the canal, and the Market Hall
    t.rows(3, 23, ['D.D.D', '.....', 'D.D.D'])
    t.house(2, 27, 8, 4, roof='^', wall='W', win='N', door=(4, 'd'), wins=[1, 6])
    t.put('3', 8, 24)
    t.put('u', 2, 32); t.set(3, 32, '.')
    t.put('z', 5, 32)
    # the Silver Lantern, by the gate
    t.house(30, 25, 10, 5, roof='^', wall='W', win='N', door=(5, 'i'), wins=[1, 3, 7, 9])
    t.path([(35, 30), (35, 31)]); t.path([(23, 31), (35, 31)])
    t.put('2', 28, 22)
    t.put('4', 38, 22)
    # crowded houses in every gap
    for (x, y, w, h) in [(13, 9, 6, 4), (13, 25, 6, 4), (24, 9, 4, 5), (24, 18, 0 + 2, 3), (36, 22, 5, 3), (14, 28, 5, 3), (2, 2, 7, 4)]:
        if w > 1:
            t.house(x, y, w, h, roof='^', wall='S' if (x + y) % 2 else 'W', win='H' if (x + y) % 2 else 'N')
    # the night streets: three alleys where the gangs wait
    t.put('@gang1', 9, 7); t.put('@gang2', 41, 30); t.put('@gang3', 11, 31)
    t.put('@toSewer4', 42, 24); t.set(42, 25, '.')
    t.scatter(['U', 'X', '+'], 10, (2, 8, 41, 31), seed=21, on='.,')
    t.scatter([',', ','], 50, (2, 8, 41, 31), seed=22)
    return t


# ---------------------------------------------------------------- Ashfall: the Wardens' war camp on the edge of the ash
def ashfall():
    t = Town('ashfall', 40, 28)
    # a ragged stockade of stakes and dead trees
    wall = [(2, 2), (14, 2), (14, 1), (27, 1), (27, 3), (37, 3), (37, 12), (37, 15), (37, 25), (24, 25), (24, 26), (10, 26), (10, 24), (2, 24), (2, 15), (2, 12), (2, 2)]
    t.path(wall, ch='F')
    t.outside((0, 0), 'T', through='.,')
    t.scatter(['.', ',', ',', '·'], 70, (0, 0, 39, 27), seed=31, on='T', clear=0)
    for y in (13, 14):
        for x in range(0, 3):
            t.set(x, y, '.')
        for x in range(37, 40):
            t.set(x, y, '.')
    t.put('n', 0, 13); t.put('n', 0, 14); t.put('e', 39, 13); t.put('e', 39, 14)
    # the camp road, west to east, sagging round the muster fire
    t.path([(0, 13), (12, 13)], width=2)
    t.path([(12, 13), (12, 16)], width=2)
    t.path([(12, 16), (27, 16)], width=2)
    t.path([(26, 13), (26, 17)], width=2)
    t.path([(26, 13), (39, 13)], width=2)
    # the command tent, north
    t.rect(16, 3, 7, 3, '?')
    t.rect(18, 6, 3, 1, '.')
    t.put('o', 19, 7)
    t.put('d', 24, 6); t.put('b', 13, 5); t.put('1', 11, 6)
    t.path([(19, 8), (19, 15)])
    t.put('@board5', 21, 9)
    # the muster yard, north-east: training posts and banners
    for (x, y) in [(30, 6), (32, 6), (34, 6), (30, 9), (32, 9), (34, 9)]:
        t.set(x, y, ']')
    t.put('3', 29, 8); t.put('4', 35, 8)
    # the quartermaster's depot, south-west
    t.rect(4, 17, 3, 2, '?')
    t.rows(4, 19, ['XXU', 'U.X'])
    t.put('q', 8, 18); t.put('u', 9, 20)
    # the goblins keep to the west wall, round their own fire
    t.rect(3, 5, 3, 2, '?'); t.set(7, 9, '+')
    t.put('g', 6, 9); t.put('j', 8, 9); t.put('2', 4, 10)
    # the field hospital, south-east: cots in the open
    t.rect(29, 18, 5, 2, '?')
    t.rows(29, 21, ['E.E.E'])
    t.put('h', 31, 22)
    t.put('v', 34, 17); t.put('k', 35, 17)
    # the muster fire, south of the road
    t.put('p', 19, 20)
    t.rows(16, 19, ['▬', ' ', '▬'])
    t.put('w', 22, 21); t.put('i', 16, 22); t.put('t', 13, 22); t.put('f', 25, 22); t.put('z', 23, 18)
    # tents everywhere else
    for (x, y, w) in [(4, 3, 3), (24, 9, 2), (8, 5, 2), (14, 10, 2), (32, 15, 2), (6, 22, 2), (28, 23, 3), (33, 22, 2)]:
        t.rect(x, y, w, 2, '?')
    t.put('@toCave5', 3, 22); t.set(3, 23, '.')
    t.scatter([',', ',', '·', '☠'], 30, (3, 3, 36, 24), seed=33)
    t.scatter(['+', 'U', 'X', '†'], 8, (3, 3, 36, 24), seed=34)
    return t


TOWNS = [brackenford, saltmere, karrow, highmoor, ashfall]


def main():
    out = ['/* The towns, redrawn: tighter, lopsided, each in its own style. Built by tools/towns.py - edit that, not this. */',
           '(function () {', '  const D = G.D, M = D.maps;',
           '  function lay(id, rows, places, legend) {',
           "    const m = M[id], g = rows.map(r => r.split('')), byTag = {}, used = new Set();",
           '    for (const k in m.things) if (m.things[k].tag) byTag[m.things[k].tag] = k;',
           '    for (const [sel, x, y, out] of places) {',
           "      const ch = sel[0] === '@' ? byTag[sel.slice(1)] : sel;",
           "      if (!ch || !m.things[ch]) throw new Error('lay ' + id + ': no thing ' + sel);",
           "      if (!g[y] || g[y][x] === undefined) throw new Error('lay ' + id + ': ' + sel + ' off the map');",
           '      g[y][x] = ch; used.add(ch); if (out) m.things[ch].out = out;',
           '    }',
           "    for (const k in m.things) if (!used.has(k)) throw new Error('lay ' + id + ': thing ' + k + ' was not placed');",
           "    if (rows.length !== m.rows.length || rows[0].length !== m.rows[0].length) throw new Error('lay ' + id + ': size changed');",
           "    m.rows = g.map(r => r.join('')); if (legend) m.legend = Object.assign(m.legend || {}, legend);",
           '  }']
    for f in TOWNS:
        t = f()
        txt = t.text()
        for r in txt:
            assert len(r) == t.w, (t.id, len(r), r)
        out.append('  lay(%s, %s, %s, %s);' % (json.dumps(t.id), json.dumps(txt, ensure_ascii=False, indent=4).replace('\n', '\n  '),
                                              json.dumps(t.places), json.dumps(t.legend or None)))
    out.append('})();')
    p = os.path.join(ROOT, 'data', 'ch9_world', 'c_towns.js')
    open(p, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    for f in TOWNS:
        t = f()
        print('\n'.join(t.text()))


if __name__ == '__main__':
    main()
