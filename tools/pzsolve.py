#!/usr/bin/env python3
"""A solver for the puzzle rooms, following the game's own rules (src/puzzle.js), used to check that every room can be
solved, how long the shortest solution is, and how easy it is to ruin a room so it has to be reset.

Room rows use these characters:
  #  wall            .  floor             ~  ice (a shoved block slides on until something stops it)
  B  block           P  plate (a block must sit on it)   *  block already on a plate
  O  pit (a block shoved in fills it: floor from then on)
  _  cracked floor: the party can cross it once; it falls in behind them (and a block shoved onto it drops through
     and fills the hole)
  1-9  things to use in that order (lamps, bell-stones): solid; used from any square beside them
  @  where the party comes in    E  the way out: shut until every plate is held and every 1-9 used, then walked onto

Rules that match the game: the party is never pushed by ice; a block that moves one square is followed by the party, a
block that slides further is not; a sliding block stops on a plate; a block can't be shoved onto a wall, another block,
a 1-9 or the shut way out.
"""
from collections import deque

DIRS = {'u': (0, -1), 'd': (0, 1), 'l': (-1, 0), 'r': (1, 0)}


class Room:
    def __init__(self, rows):
        self.rows = [r for r in rows]
        self.h, self.w = len(rows), max(len(r) for r in rows)
        self.walls, self.ice, self.plates, self.pits, self.cracks, self.targets = set(), set(), set(), set(), set(), {}
        blocks = set(); self.start = self.exit = None; self.exits = set()
        for y, r in enumerate(rows):
            for x, c in enumerate(r.ljust(self.w, '#')):
                p = (x, y)
                if c == '#': self.walls.add(p)
                elif c == '~': self.ice.add(p)
                elif c == 'B': blocks.add(p)
                elif c == 'P': self.plates.add(p)
                elif c == '*': self.plates.add(p); blocks.add(p)
                elif c == 'O': self.pits.add(p)
                elif c == '_': self.cracks.add(p)
                elif c in '123456789': self.targets[p] = int(c)
                elif c == '@': self.start = p
                elif c == 'E': self.exits.add(p); self.exit = self.exit or p
        self.blocks0 = frozenset(blocks)
        self.ntarget = max(self.targets.values()) if self.targets else 0
        self.cidx = {p: i for i, p in enumerate(sorted(self.cracks | self.pits))}   # holes: pits and fallen cracks
        assert self.start, 'no @'

    def inside(self, p): return 0 <= p[0] < self.w and 0 <= p[1] < self.h

    # state: (player, blocks, fallen: bitmask of cracks fallen in, filled: bitmask of holes filled, progress)
    def initial(self): return (self.start, self.blocks0, 0, 0, 0)

    def done_open(self, blocks, prog):
        return self.plates <= blocks and prog == self.ntarget

    def hole(self, p, fallen, filled):
        """an open hole the party can't cross (an unfilled pit, or a crack that has fallen in)"""
        i = self.cidx.get(p)
        if i is None or (filled >> i) & 1: return False
        return p in self.pits or (fallen >> i) & 1

    def solid(self, p, blocks, prog):
        return (not self.inside(p)) or p in self.walls or p in self.targets or (p in self.exits and not self.done_open(blocks, prog))

    def moves(self, s):
        """(label, next state, pushed) for each move from s"""
        pl, blocks, fallen, filled, prog = s
        out = []
        # use a 1-9 that is next in order, from beside it
        for k, (dx, dy) in DIRS.items():
            q = (pl[0] + dx, pl[1] + dy)
            if self.targets.get(q) == prog + 1:
                out.append(('F' + k, (pl, blocks, fallen, filled, prog + 1), False))
        for k, (dx, dy) in DIRS.items():
            q = (pl[0] + dx, pl[1] + dy)
            if self.solid(q, blocks, prog) or self.hole(q, fallen, filled): continue
            nf, nfl, nb, pushed = fallen, filled, blocks, False
            if q in blocks:
                # shove: one square, or on along the ice until it hits something; it stops on a plate, drops into a hole
                b = q; moved = 0; drop = None
                while True:
                    n = (b[0] + dx, b[1] + dy)
                    if self.solid(n, blocks, prog) or n in blocks: break
                    if n == pl: break
                    b = n; moved += 1
                    i = self.cidx.get(n)
                    if i is not None and not (nfl >> i) & 1 and (n in self.pits or (nf >> i) & 1 or n in self.cracks):
                        drop = n; break
                    if n not in self.ice or n in self.plates: break
                if not moved: continue
                nb = set(blocks); nb.discard(q)
                if drop is not None: nfl |= 1 << self.cidx[drop]
                else: nb.add(b)
                nb = frozenset(nb); pushed = True
                if moved != 1: out.append(('P' + k, (pl, nb, nf, nfl, prog), True)); continue
            # the party steps on; a crack it steps off falls in
            if pl in self.cracks and not (nfl >> self.cidx[pl]) & 1: nf |= 1 << self.cidx[pl]
            out.append((k if not pushed else 'P' + k, (q, nb, nf, nfl, prog), pushed))
        return out

    def goal(self, s):
        return s[0] in self.exits if self.exits else self.done_open(s[1], s[4])


def solve(room, limit=600000, deadness=True):
    """Breadth-first over every state. Returns dict: path (moves), steps, pushes, states, dead (states from which the
    room can no longer be solved: the ones that need a reset), deadfrac."""
    s0 = room.initial()
    seen = {s0: None}; order = [s0]; q = deque([s0]); goal = None; edges = {}
    while q:
        s = q.popleft()
        if room.goal(s) and goal is None: goal = s
        nx = []
        for lab, t, pushed in room.moves(s):
            nx.append(t)
            if t not in seen:
                seen[t] = (s, lab); q.append(t); order.append(t)
                if len(seen) > limit: return {'ok': False, 'why': 'too many states', 'states': len(seen)}
        edges[s] = nx
    if goal is None: return {'ok': False, 'why': 'unsolvable', 'states': len(seen)}
    path = []; s = goal
    while seen[s]: s, lab = seen[s]; path.append(lab)
    path.reverse()
    res = {'ok': True, 'path': path, 'steps': len(path), 'pushes': sum(1 for p in path if p[0] == 'P'),
           'uses': sum(1 for p in path if p[0] == 'F'), 'states': len(seen)}
    if deadness:
        # states that can still reach a goal: walk the edges backwards from every goal
        rev = {}
        for s, ts in edges.items():
            for t in ts: rev.setdefault(t, []).append(s)
        live = set(t for t in seen if room.goal(t)); dq = deque(live)
        while dq:
            t = dq.popleft()
            for s in rev.get(t, ()):
                if s not in live: live.add(s); dq.append(s)
        res['dead'] = len(seen) - len(live); res['deadfrac'] = round(res['dead'] / len(seen), 2)
        # how many single moves from a live state lead straight to ruin
        res['ruin_moves'] = sum(1 for s in live for t in edges[s] if t not in live)
        res['live_moves'] = sum(len(edges[s]) for s in live)
        res['ruinrate'] = round(res['ruin_moves'] / max(1, res['live_moves']), 2)
    return res


def moves_str(path):
    """the solution as the puzzletest walk string: plain letters for steps and shoves; Fx = face x and use"""
    out = []
    for p in path:
        out.append(p[1] if p[0] == 'P' else ('F' + p[1] if p[0] == 'F' else p))
    return ' '.join(out)


if __name__ == '__main__':
    import sys
    rows = open(sys.argv[1]).read().split('\n')
    rows = [r for r in rows if r]
    r = solve(Room(rows))
    print({k: v for k, v in r.items() if k != 'path'})
    if r.get('ok'): print(moves_str(r['path']))


# ---------------------------------------------------------------- a faster search for rooms of blocks only
def _reach(room, pl, blocks, filled, prog=0):
    """squares the party can walk to without shoving anything, with the walk to each"""
    seen = {pl: ''}; q = deque([pl])
    while q:
        p = q.popleft()
        for k, (dx, dy) in DIRS.items():
            n = (p[0] + dx, p[1] + dy)
            if n in seen or n in blocks or room.solid(n, blocks, prog) or room.hole(n, 0, filled): continue
            seen[n] = seen[p] + k; q.append(n)
    return seen


def solve_push(room, limit=400000, deadness=True):
    """For rooms with no cracked floor and no 1-9: states are (where the party can reach, blocks, filled holes)."""
    assert not room.cracks and not room.targets
    def norm(pl, blocks, filled):
        r = _reach(room, pl, blocks, filled); return (min(r), blocks, filled), r
    s0, r0 = norm(room.start, room.blocks0, 0)
    seen = {s0: None}; q = deque([(s0, room.start)]); edges = {}; goal = None
    def is_goal(s, reach):
        if not room.done_open(s[1], 0): return False
        if not room.exit: return True
        # the way out must be reachable now the gate is open
        return any((e[0] + dx, e[1] + dy) in reach for e in room.exits for dx, dy in DIRS.values())
    while q:
        s, pl = q.popleft()
        reach = _reach(room, pl, s[1], s[2])
        if goal is None and is_goal(s, reach): goal = s
        nx = []
        for b in s[1]:
            for k, (dx, dy) in DIRS.items():
                stand = (b[0] - dx, b[1] - dy)
                if stand not in reach: continue
                for lab, t, pushed in room.moves((stand, s[1], 0, s[2], 0)):
                    if lab != 'P' + k: continue
                    t2, r2 = norm(t[0], t[1], t[3])
                    nx.append(t2)
                    if t2 not in seen:
                        seen[t2] = (s, pl, stand, k, t[0]); q.append((t2, t[0]))
                        if len(seen) > limit: return {'ok': False, 'why': 'too many states', 'states': len(seen)}
        edges[s] = nx
    if goal is None: return {'ok': False, 'why': 'unsolvable', 'states': len(seen)}
    # rebuild the walk: for each push, walk from where the party was to where it stands, then shove
    chain = []; s = goal
    while seen[s]: prev, pl, stand, k, after = seen[s]; chain.append((prev, pl, stand, k)); s = prev
    chain.reverse(); path = []; pushes = 0; dirs = []
    for prev, pl, stand, k in chain:
        path += list(_reach(room, pl, prev[1], prev[2])[stand]); path.append('P' + k); pushes += 1; dirs.append(k)
    res = {'ok': True, 'path': path, 'steps': len(path), 'pushes': pushes, 'states': len(seen),
           'turns': sum(1 for a, b in zip(dirs, dirs[1:]) if a != b), 'dirs': len(set(dirs))}
    if deadness:
        rev = {}
        for s, ts in edges.items():
            for t in ts: rev.setdefault(t, []).append(s)
        live = set(); goals = []
        for s in seen:
            if room.done_open(s[1], 0) and (not room.exits or is_goal(s, _reach(room, s[0], s[1], s[2]))): goals.append(s)
        live = set(goals); dq = deque(goals)
        while dq:
            t = dq.popleft()
            for u in rev.get(t, ()):
                if u not in live: live.add(u); dq.append(u)
        res['dead'] = len(seen) - len(live); res['deadfrac'] = round(res['dead'] / len(seen), 2)
        res['ruin_moves'] = sum(1 for s in live for t in edges.get(s, ()) if t not in live)
        res['live_moves'] = sum(len(edges.get(s, ())) for s in live)
    return res


# ---------------------------------------------------------------- rooms with guards (the Archive): sneaking
class GuardRoom(Room):
    """A room of blocks (shelves) and guards. guards: {char: {'turns': ['left', 'down'], 'range': 6, 'every': 1, 'offset': 0}}.
    Matches src/puzzle.js: a guard faces turns[(steps // every + offset) % len] and sees in a straight line up to `range`
    squares, stopped by walls and anything solid (shelves, other guards). Every step the party takes (a shove included:
    the party follows the shelf one square) counts one; after it, a party standing where a guard looks is caught and
    marched back to the room's start (`@`) with the count back to 0. Shelves stay where they were shoved. The state is
    (party, shelves, count mod the guards' whole cycle)."""
    FACE = {'up': (0, -1), 'down': (0, 1), 'left': (-1, 0), 'right': (1, 0)}

    def __init__(self, rows, guards):
        from math import lcm
        rows2, self.guards = [], []
        for y, r in enumerate(rows):
            row = list(r)
            for x, c in enumerate(row):
                if c in guards: self.guards.append(((x, y), guards[c])); row[x] = '#'
            rows2.append(''.join(row))
        super().__init__(rows2)
        assert not self.ice and not self.cracks and not self.pits and not self.targets and not self.plates
        self.L = 1
        for p, g in self.guards: self.L = lcm(self.L, len(g['turns']) * g.get('every', 1))
        # each guard's line of sight each way, ignoring shelves (they are checked as the line is walked)
        self.rays = []
        for (x, y), g in self.guards:
            rr = {}
            for f, (dx, dy) in self.FACE.items():
                line = []
                for i in range(g.get('range', 6)):
                    q = (x + dx * (i + 1), y + dy * (i + 1))
                    if q in self.walls or not self.inside(q): break
                    line.append(q)
                rr[f] = line
            self.rays.append(rr)
        self.faces = [[self.facing(g, n) for (p, g) in self.guards] for n in range(self.L)]

    def watched(self, q, blocks, n):
        for i, f in enumerate(self.faces[n]):
            for sq in self.rays[i][f]:
                if sq in blocks: break
                if sq == q: return True
        return False

    def facing(self, g, n):
        t = g['turns']; return t[(n // g.get('every', 1) + g.get('offset', 0)) % len(t)]

    def sight(self, blocks, n):
        out = set()
        for (x, y), g in self.guards:
            dx, dy = self.FACE[self.facing(g, n)]
            for i in range(g.get('range', 6)):
                x2, y2 = x + dx * (i + 1), y + dy * (i + 1)
                if (x2, y2) in self.walls or (x2, y2) in blocks or not self.inside((x2, y2)): break
                out.add((x2, y2))
        return out

    def initial(self, n=0): return (self.start, self.blocks0, n % self.L)

    def gmoves(self, s):
        """(label, next state, caught) for each move"""
        pl, blocks, n = s; out = []
        n2 = (n + 1) % self.L
        for k, (dx, dy) in DIRS.items():
            q = (pl[0] + dx, pl[1] + dy)
            if q in self.walls or not self.inside(q) or (q in self.exits and False): continue
            nb, lab = blocks, k
            if q in blocks:
                b = (q[0] + dx, q[1] + dy)
                if b in self.walls or b in blocks or not self.inside(b) or b in self.exits: continue
                nb = frozenset((blocks - {q}) | {b}); lab = 'P' + k
            if self.watched(q, nb, n2): out.append((lab, (self.start, nb, 0), True))
            else: out.append((lab, (q, nb, n2), False))
        return out

    def ggoal(self, s): return s[0] in self.exits


def solve_guards(room, n0=0, limit=1500000, deadness=True, allow_caught=True):
    """Breadth-first over (party, shelves, count). The shortest way out that is never caught (if allow_caught, a way that
    is caught on purpose counts too, at a cost: it is still a step)."""
    s0 = room.initial(n0)
    if room.start in room.sight(room.blocks0, s0[2]): return {'ok': False, 'why': 'seen at the door'}
    seen = {s0: None}; q = deque([s0]); goal = None; edges = {}
    while q:
        s = q.popleft()
        if goal is None and room.ggoal(s): goal = s
        nx = []
        for lab, t, caught in room.gmoves(s):
            if caught and not allow_caught: continue
            nx.append(t)
            if t not in seen:
                seen[t] = (s, lab + ('!' if caught else '')); q.append(t)
                if len(seen) > limit: return {'ok': False, 'why': 'too many states', 'states': len(seen)}
        edges[s] = nx
    if goal is None: return {'ok': False, 'why': 'unsolvable', 'states': len(seen)}
    path = []; s = goal
    while seen[s]: s, lab = seen[s]; path.append(lab)
    path.reverse()
    res = {'ok': True, 'path': path, 'steps': len(path), 'pushes': sum(1 for p in path if p[0] == 'P'), 'caught': sum(1 for p in path if p.endswith('!')),
           'states': len(seen), 'dirs': len(set(p[1] for p in path if p[0] == 'P'))}
    if deadness:
        rev = {}
        for s, ts in edges.items():
            for t in ts: rev.setdefault(t, []).append(s)
        live = set(t for t in seen if room.ggoal(t)); dq = deque(live)
        while dq:
            t = dq.popleft()
            for u in rev.get(t, ()):
                if u not in live: live.add(u); dq.append(u)
        res['dead'] = len(seen) - len(live); res['deadfrac'] = round(res['dead'] / len(seen), 2)
        res['ruin_moves'] = sum(1 for s in live for t in edges[s] if t not in live)
        res['live_moves'] = sum(len(edges[s]) for s in live)
        res['ruinrate'] = round(res['ruin_moves'] / max(1, res['live_moves']), 3)
        # pushes that ruin: a shove from a live state into a dead one
        pl = [(lab, t) for s in live for lab, t, c in room.gmoves(s) if lab[0] == 'P' and (allow_caught or not c)]
        res['ruin_pushes'] = sum(1 for lab, t in pl if t not in live); res['live_pushes'] = len(pl)
        res['pushruin'] = round(res['ruin_pushes'] / max(1, len(pl)), 2)
    return res
