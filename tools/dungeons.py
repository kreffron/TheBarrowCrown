"""Redraws the dungeons and writes data/ch9_world/d_dungeons.js.

How it keeps every puzzle and fight working:
  1. analyse() reads the current map: open floor splits into zones wherever a solid thing (a gate, a sealed door, a
     guard in a doorway) or a step-on trigger is the only way through. Those things are the connectors.
  2. generate() lays out new rooms for each zone (more rooms for bigger zones, extra corridors so most zones loop),
     joins zones only through a one-wide corridor holding their connector, and drops each zone's things back into
     its own rooms. Warps go against a wall, facing into the room.
  3. check() re-analyses the result and insists the same things sit in the same zones behind the same connectors,
     that every warp lands on open floor, and that nothing is out of reach. A seed that fails is simply retried.
Run: SKIPFILE=d_dungeons.js node /tmp/dump.js && python3 tools/dungeons.py
"""
import json, os, random, sys
from collections import deque

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = json.load(open('/tmp/maps.json'))
TILES, LEGEND = DATA['tiles'], DATA['legend']
WALKERS = ('warp', 'mark', 'pickup')            # things you stand on
DV = {'up': (0, -1), 'down': (0, 1), 'left': (-1, 0), 'right': (1, 0)}
N4 = [(1, 0), (-1, 0), (0, 1), (0, -1)]


def tile_solid(m, ch):
    if ch in '.,':
        return False
    t = m['legend'].get(ch) or LEGEND.get(ch)
    if not t:
        return False
    return TILES.get(t, {}).get('solid', False)


def analyse(m, rows=None):
    rows = rows or m['rows']
    H, W, th = len(rows), len(rows[0]), m['things']
    occ = {}                                         # char -> [(x, y)]
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch in th:
                occ.setdefault(ch, []).append((x, y))

    def open_cell(x, y, triggers_block=True):
        if not (0 <= x < W and 0 <= y < H):
            return False
        ch = rows[y][x]
        if ch in th:
            t = th[ch]['type']
            if t == 'trigger':
                return not triggers_block
            return t in WALKERS or th[ch].get('solid') is False
        return not tile_solid(m, ch)

    comp, size, n = {}, {}, 0
    for y in range(H):
        for x in range(W):
            if (x, y) in comp or not open_cell(x, y):
                continue
            q = deque([(x, y)]); comp[(x, y)] = n; c = 0
            while q:
                a, b = q.popleft(); c += 1
                for dx, dy in N4:
                    p = (a + dx, b + dy)
                    if p not in comp and open_cell(*p):
                        comp[p] = n; q.append(p)
            size[n] = c; n += 1
    things, connectors = [], []
    solid_cells = {}
    for ch, cells in occ.items():
        t = th[ch]
        for (x, y) in cells:
            if t['type'] in WALKERS:
                things.append({'ch': ch, 'x': x, 'y': y, 'type': t['type'], 'zone': comp.get((x, y)), 'near': []})
            elif t['type'] != 'trigger':
                solid_cells[(x, y)] = ch
    # solid things standing shoulder to shoulder (a gate with a guard behind it) are judged as one group
    done = set()
    for start in solid_cells:
        if start in done:
            continue
        grp, q = [], [start]; done.add(start)
        while q:
            c = q.pop(); grp.append(c)
            for dx, dy in N4:
                n = (c[0] + dx, c[1] + dy)
                if n in solid_cells and n not in done:
                    done.add(n); q.append(n)
        near = sorted({comp[(x + dx, y + dy)] for (x, y) in grp for dx, dy in N4 if (x + dx, y + dy) in comp})
        if len(near) >= 2 and len(grp) <= 3:
            # order the chain from the near[0] side outwards
            first = [c for c in grp if any(comp.get((c[0] + dx, c[1] + dy)) == near[0] for dx, dy in N4)]
            chain, seen, q = [], set(), first[:1]
            while q:
                c = q.pop(0)
                if c in seen:
                    continue
                seen.add(c); chain.append(c)
                q += [(c[0] + dx, c[1] + dy) for dx, dy in N4 if (c[0] + dx, c[1] + dy) in grp]
            chain += [c for c in grp if c not in seen]
            chs = [solid_cells[c] for c in chain]
            connectors.append({'ch': chs[0], 'chain': chs, 'x': chain[0][0], 'y': chain[0][1], 'type': th[chs[0]]['type'], 'near': near})
        else:
            for (x, y) in grp:
                ch = solid_cells[(x, y)]
                nn = sorted({comp[(x + dx, y + dy)] for dx, dy in N4 if (x + dx, y + dy) in comp})
                things.append({'ch': ch, 'x': x, 'y': y, 'type': th[ch]['type'], 'near': nn, 'zone': nn[0] if nn else None})
    # triggers you must step on count as connectors too
    for ch, cells in occ.items():
        if th[ch]['type'] != 'trigger':
            continue
        for (x, y) in cells:
            near = sorted({comp[(x + dx, y + dy)] for dx, dy in N4 if (x + dx, y + dy) in comp})
            if len(near) >= 2:
                connectors.append({'ch': ch, 'chain': [ch], 'x': x, 'y': y, 'type': 'trigger', 'near': near})
            else:
                things.append({'ch': ch, 'x': x, 'y': y, 'type': 'trigger', 'near': near, 'zone': near[0] if near else None})
    # a thing walled in on all sides (behind a counter) joins the nearest zone
    for it in things:
        if it['zone'] is None:
            best = None
            for d in range(1, 6):
                for dy in range(-d, d + 1):
                    for dx in range(-d, d + 1):
                        p = (it['x'] + dx, it['y'] + dy)
                        if p in comp and best is None:
                            best = comp[p]
                if best is not None:
                    break
            it['zone'] = best
    return {'W': W, 'H': H, 'comp': comp, 'size': size, 'things': things, 'connectors': connectors, 'occ': occ}


def summary(mid):
    m = DATA['maps'][mid]
    a = analyse(m)
    zones = {}
    for it in a['things']:
        zones.setdefault(it['zone'], []).append(it['ch'] + ':' + it['type'][0])
    print('==', mid, a['W'], 'x', a['H'])
    for z, items in sorted(zones.items(), key=lambda kv: (kv[0] is None, kv[0] or 0)):
        print('   zone', z, 'size', a['size'].get(z), ' '.join(items))
    for c in a['connectors']:
        print('   connector', c['ch'], c['type'], 'between', c['near'], 'at', c['x'], c['y'])


if __name__ == '__main__' and len(sys.argv) > 1 and sys.argv[1] == 'show':
    for mid in sys.argv[2].split(','):
        summary(mid)


# ------------------------------------------------------------------------------------------------ generation
class Fail(Exception):
    pass


def DATA_T(c, ch):
    return c['type']


def prune(a):
    """Drops empty dead-end zones: a connector whose far side holds nothing becomes an ordinary thing."""
    zthings = {}
    for it in a['things']:
        zthings.setdefault(it['zone'], []).append(it)
    changed = True
    while changed:
        changed = False
        deg = {}
        for c in a['connectors']:
            for z in c['near']:
                deg[z] = deg.get(z, 0) + 1
        for c in list(a['connectors']):
            for z in c['near']:
                if not zthings.get(z) and deg.get(z, 0) == 1:
                    others = [o for o in c['near'] if o != z]
                    if len(others) == 1:
                        a['connectors'].remove(c)
                        for ch in c['chain']:
                            it = dict(c, ch=ch, zone=others[0], type=DATA_T(c, ch))
                            a['things'].append(it); zthings.setdefault(others[0], []).append(it)
                        changed = True
                        break
            if changed:
                break
    return a


def plan(mid):
    m = DATA['maps'][mid]
    a = prune(analyse(m))
    zones = {}
    for it in a['things']:
        zones.setdefault(it['zone'], {'things': [], 'size': a['size'].get(it['zone'], 4)})['things'].append(it)
    for c in a['connectors']:
        for z in c['near']:
            zones.setdefault(z, {'things': [], 'size': a['size'].get(z, 4)})
    edges = [(c['near'][0], c['near'][1], c) for c in a['connectors']]
    return m, a, zones, edges


def generate(mid, st, seed):
    m, a, zones, edges = plan(mid)
    W, H = a['W'], a['H']
    r = random.Random(seed)
    wall = st.get('wall', '#')
    g = [[wall] * W for _ in range(H)]
    owner = {}                                   # floor cell -> zone
    rooms = {z: [] for z in zones}               # zone -> [(x, y, w, h)]
    isolated = [z for z in zones if not any(z in (e[0], e[1]) for e in edges)]
    root = max([z for z in zones if z not in isolated] or list(zones), key=lambda z: zones[z]['size'])
    # BFS order over the zone tree
    order, seen, parent = [root], {root}, {root: None}
    i = 0
    while i < len(order):
        z = order[i]; i += 1
        for (p, q, c) in edges:
            for (u, v) in ((p, q), (q, p)):
                if u == z and v not in seen:
                    seen.add(v); parent[v] = (z, c); order.append(v)
    for z in isolated:
        if z not in seen:
            order.append(z); parent[z] = None; seen.add(z)
    for z in zones:
        if z not in seen:
            order.append(z); parent[z] = None; seen.add(z)

    def free_rect(x, y, w, h, z, margin_same=1, margin_other=2):
        if x < 1 or y < 1 or x + w > W - 1 or y + h > H - 1:
            return False
        for zz, rl in rooms.items():
            mg = margin_same if zz == z else margin_other
            for (rx, ry, rw, rh) in rl:
                if x < rx + rw + mg and rx < x + w + mg and y < ry + rh + mg and ry < y + h + mg:
                    return False
        return True

    def carve_room(z, rect):
        x, y, w, h = rect
        shape = st.get('shape', 'rect')
        cells = []
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                if shape == 'cave' and w >= 4 and h >= 3:
                    # knock the corners off, and a few more bites out of the edges
                    edge = (xx in (x, x + w - 1)) + (yy in (y, y + h - 1))
                    if edge == 2 or (edge == 1 and r.random() < 0.18):
                        continue
                if shape == 'oct' and w >= 5 and h >= 4 and (xx in (x, x + w - 1)) and (yy in (y, y + h - 1)):
                    continue
                cells.append((xx, yy))
        for c in cells:
            g[c[1]][c[0]] = '.'; owner[c] = z
        rooms[z].append(rect)

    def size_for(z, k):
        area = max(4, int(zones[z]['size'] * st.get('scale', 0.95) / k))
        if len(zones[z]['things']) <= 1 and zones[z]['size'] <= 8:
            return (r.choice([2, 3]), 2)
        asp = r.uniform(0.6, 1.9)
        w = max(3, min(st.get('maxw', 11), int(round((area * asp) ** 0.5))))
        h = max(2, min(st.get('maxh', 7), int(round(area / w))))
        return (w, h)

    def place_room(z, near_zone, gap=(2, 5), mo=2):
        k = max(1, len(rooms[z]) + 1)
        for attempt in range(700):
            w, h = size_for(z, max(1, nrooms[z]))
            if attempt > 120:
                w, h = max(2, w - attempt // 200), max(2, h - attempt // 260)
            if near_zone is None or not rooms[near_zone] or attempt > 500:
                x, y = r.randint(1, max(1, W - w - 1)), r.randint(1, max(1, H - h - 1))
            else:
                bx, by, bw, bh = r.choice(rooms[near_zone])
                side = r.choice('lrtb'); d = r.randint(*gap)
                if side == 'l':
                    x, y = bx - d - w, r.randint(by - h + 1, by + bh - 1)
                elif side == 'r':
                    x, y = bx + bw + d, r.randint(by - h + 1, by + bh - 1)
                elif side == 't':
                    x, y = r.randint(bx - w + 1, bx + bw - 1), by - d - h
                else:
                    x, y = r.randint(bx - w + 1, bx + bw - 1), by + bh + d
            if free_rect(x, y, w, h, z, 1 if near_zone == z else 2, mo) and (mo == 2 or attempt <= 500):
                carve_room(z, (x, y, w, h))
                return (x, y, w, h)
        raise Fail('no room for zone %s' % z)

    nrooms = {}
    for z in zones:
        sz, nt = zones[z]['size'], len(zones[z]['things'])
        nrooms[z] = 1 if sz <= 12 else max(1, min(st.get('maxrooms', 6), int(round(sz / st.get('per', 42)))))
        if z in isolated:
            nrooms[z] = 1
    # lay out the rooms, zone by zone, each new zone beside its parent
    for z in order:
        p = parent.get(z)
        if p is None and z != root and z in isolated:
            place_room(z, root, gap=(1, 1), mo=1)
        elif p is None:
            place_room(z, None)
        else:
            place_room(z, p[0], gap=(2, 4))
        for _ in range(nrooms[z] - 1):
            place_room(z, z, gap=(1, 4))

    def center(rect):
        x, y, w, h = rect
        return (x + w // 2, y + h // 2)

    def dig(a_pt, b_pt, z, allow_zones, width=1):
        """Shortest path from a to b through wall and the zone's own floor, keeping off other zones' floor."""
        def ok(x, y):
            if not (1 <= x < W - 1 and 1 <= y < H - 1):
                return False
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    o = owner.get((x + dx, y + dy))
                    if o is not None and o not in allow_zones:
                        return False
            return True
        prev = {a_pt: None}; q = deque([a_pt])
        while q:
            c = q.popleft()
            if c == b_pt:
                break
            dirs = N4[:]; r.shuffle(dirs)
            for dx, dy in dirs:
                n = (c[0] + dx, c[1] + dy)
                if n not in prev and ok(*n):
                    prev[n] = c; q.append(n)
        if b_pt not in prev:
            raise Fail('no path')
        path, c = [], b_pt
        while c:
            path.append(c); c = prev[c]
        return path[::-1]

    # inside each zone: a spanning tree of corridors, plus a loop or two
    cw = st.get('corridor', 1)
    for z in zones:
        rl = rooms[z]
        if len(rl) < 2:
            continue
        cs = [center(x) for x in rl]
        links, done = [], {0}
        while len(done) < len(cs):
            best = min(((i, j) for i in done for j in range(len(cs)) if j not in done),
                       key=lambda ij: abs(cs[ij[0]][0] - cs[ij[1]][0]) + abs(cs[ij[0]][1] - cs[ij[1]][1]))
            links.append(best); done.add(best[1])
        extra = 1 if len(cs) >= 3 else 0
        extra += 1 if len(cs) >= 5 else 0
        pairs = [(i, j) for i in range(len(cs)) for j in range(i + 1, len(cs)) if (i, j) not in links and (j, i) not in links]
        r.shuffle(pairs)
        links += pairs[:extra]
        for (i, j) in links:
            for c in dig(cs[i], cs[j], z, {z}):
                if g[c[1]][c[0]] != '.':
                    g[c[1]][c[0]] = '.'; owner[c] = z
                    if cw == 2:
                        for (dx, dy) in ((1, 0), (0, 1)):
                            n = (c[0] + dx, c[1] + dy)
                            if 1 <= n[0] < W - 1 and 1 <= n[1] < H - 1 and owner.get(n, z) == z and all(owner.get((n[0] + ax, n[1] + ay), z) == z for ax in (-1, 0, 1) for ay in (-1, 0, 1)):
                                g[n[1]][n[0]] = '.'; owner[n] = z
    # between zones: one narrow corridor each, with its connector in the middle
    conn_at = {}
    for z in order:
        p = parent.get(z)
        if not p:
            continue
        pz, c = p
        best = None
        for ra in rooms[pz]:
            for rb in rooms[z]:
                d = abs(center(ra)[0] - center(rb)[0]) + abs(center(ra)[1] - center(rb)[1])
                if best is None or d < best[0]:
                    best = (d, ra, rb)
        _, ra, rb = best
        path = dig(center(ra), center(rb), None, {pz, z})
        walls = [pc for pc in path if owner.get(pc) is None]
        chain = c['chain'] if c['near'][0] == pz else c['chain'][::-1]
        if len(walls) < len(chain):
            raise Fail('zones too close')
        k0 = (len(walls) - len(chain)) // 2
        spots = walls[k0:k0 + len(chain)]
        first = path.index(spots[0])
        for pc in path:
            if owner.get(pc) is None:
                g[pc[1]][pc[0]] = '.'
                owner[pc] = pz if path.index(pc) < first else z
        for ch, pc in zip(chain, spots):
            owner[pc] = None
            conn_at.setdefault(ch, []).append(pc)
    # connectors the tree did not use (a second guarded way between the same two zones): one more corridor each
    for (p0, q0, c) in edges:
        if c['chain'][0] in conn_at:
            continue
        pairs = [(ra, rb) for ra in rooms[p0] for rb in rooms[q0]]
        r.shuffle(pairs)
        dug = False
        for (ra, rb) in pairs[:6]:
            try:
                path = dig(center(ra), center(rb), None, {p0, q0})
            except Fail:
                continue
            walls = [pc for pc in path if owner.get(pc) is None]
            if len(walls) < len(c['chain']):
                continue
            chain = c['chain']
            k0 = (len(walls) - len(chain)) // 2
            spots = walls[k0:k0 + len(chain)]
            first = path.index(spots[0])
            for pc in path:
                if owner.get(pc) is None:
                    g[pc[1]][pc[0]] = '.'
                    owner[pc] = p0 if path.index(pc) < first else q0
            for ch, pc in zip(chain, spots):
                owner[pc] = None
                conn_at.setdefault(ch, []).append(pc)
            dug = True
            break
        if not dug:
            raise Fail('no second way')
    # isolated zones (cells behind bars): open the shared wall as bars
    for z in isolated:
        if z == root:
            continue
        x, y, w, h = rooms[z][0]
        best = None
        for rr in rooms[root]:
            rx, ry, rw, rh = rr
            for (yy, side) in ((y - 1, 'top'), (y + h, 'bottom')):
                if (side == 'top' and ry + rh == yy) or (side == 'bottom' and ry == yy + 1):
                    best = (yy, max(x, rx), min(x + w, rx + rw))
        if not best:
            raise Fail('cell not beside a room')
        yy, x0, x1 = best
        if x1 - x0 < 1:
            raise Fail('cell too narrow')
        for xx in range(x0, x1):
            g[yy][xx] = st.get('bars', 'B')
    return g, owner, rooms, conn_at, zones, a, root, isolated


def place_things(mid, st, seed, g, owner, rooms, conn_at, zones, a):
    r = random.Random(seed * 7 + 1)
    m = DATA['maps'][mid]
    H, W = len(g), len(g[0])
    th = m['things']
    outs = {}
    used = {pc for pcs in conn_at.values() for pc in pcs}
    for ch, pcs in conn_at.items():
        for (x, y) in pcs:
            g[y][x] = ch

    def floor(x, y):
        return 0 <= x < W and 0 <= y < H and g[y][x] == '.' and (x, y) not in used

    def doorish(x, y):
        """Next to a corridor mouth: floor on two opposite sides and wall on the other two."""
        for (dx, dy) in N4:
            n = (x + dx, y + dy)
            if n in used and g[n[1]][n[0]] in conn_at:
                return True
        lr = floor(x - 1, y) and floor(x + 1, y) and not floor(x, y - 1) and not floor(x, y + 1)
        ud = floor(x, y - 1) and floor(x, y + 1) and not floor(x - 1, y) and not floor(x + 1, y)
        return lr or ud

    def room_cells(z):
        cells = []
        for (x, y, w, h) in rooms[z]:
            for yy in range(y, y + h):
                for xx in range(x, x + w):
                    if floor(xx, yy) and owner.get((xx, yy)) == z:
                        cells.append((xx, yy))
        return cells

    behind_bars = set()
    for y in range(H):
        for x in range(W):
            if g[y][x] == st.get('bars', 'B'):
                for dy in (-1, 1):
                    behind_bars.add((x, y + dy))
    for z, info in zones.items():
        cells = room_cells(z)
        items = sorted(info['things'], key=lambda it: (it['type'] != 'warp', it['type'] not in ('npc', 'sign')))
        for it in items:
            ch, t = it['ch'], th[it['ch']]
            cand = [c for c in cells if c not in used]
            if t['type'] == 'warp':
                # against a wall, facing into the room
                opts = []
                for (x, y) in cand:
                    for d, (dx, dy) in DV.items():
                        back = (x - dx, y - dy)
                        if g[back[1]][back[0]] not in ('.',) and floor(x + dx, y + dy) and (x + dx, y + dy) not in used and not doorish(x, y):
                            opts.append((x, y, d))
                if not opts:
                    raise Fail('no wall spot for warp %s' % ch)
                x, y, d = r.choice(opts)
                outs[ch] = d
                used.add((x, y)); used.add((x + DV[d][0], y + DV[d][1]))
            else:
                opts = [c for c in cand if not doorish(*c) and all((c[0] + dx, c[1] + dy) not in used for dx in (-1, 0, 1) for dy in (-1, 0, 1))]
                if any(cc in behind_bars for cc in cells):
                    pref = [c for c in cand if c in behind_bars]          # prisoners stand at the bars, so you can talk to them
                    opts = pref or opts
                if t['type'] == 'chest' or t['type'] == 'sign':
                    pref = [c for c in opts if sum(1 for dx, dy in N4 if not floor(c[0] + dx, c[1] + dy)) >= 1]
                    opts = pref or opts
                if not opts:
                    opts = [c for c in cand if not doorish(*c)]
                if not opts:
                    raise Fail('no spot for %s' % ch)
                x, y = r.choice(opts)
                used.add((x, y))
            g[y][x] = ch
    return outs


def features(mid, st, seed, g, rooms, owner):
    """Room furniture by style: a pool or channel down the middle of big rooms, colonnades along the long walls."""
    r = random.Random(seed * 31 + 7)
    th = DATA['maps'][mid]['things']
    H, W = len(g), len(g[0])
    clear = lambda x, y: g[y][x] == '.' and all(g[y + dy][x + dx] not in th for dx in (-1, 0, 1) for dy in (-1, 0, 1))
    for z, rl in rooms.items():
        for (x, y, w, h) in rl:
            if st.get('pool') and w >= 6 and h >= 4 and r.random() < st.get('pPool', 0.6):
                cy = y + h // 2
                for xx in range(x + 2, x + w - 2):
                    if clear(xx, cy) and g[cy - 1][xx] == '.' and g[cy + 1][xx] == '.':
                        g[cy][xx] = st['pool']
            if st.get('pillars') and w >= 7 and h >= 5 and r.random() < 0.7:
                for yy in (y + 1, y + h - 2):
                    for xx in range(x + 1, x + w - 1, 2):
                        if clear(xx, yy) and all(g[yy + dy][xx + dx] in '.,' for dx in (-1, 0, 1) for dy in (-1, 0, 1) if (dx, dy) != (0, 0) and g[yy + dy][xx + dx] != st['pillars']):
                            g[yy][xx] = st['pillars']


def decorate(mid, st, seed, g):
    """Style: pillars down big rooms, pools, rubble and bones. Solid pieces only where all eight neighbours are open."""
    r = random.Random(seed * 13 + 5)
    m = DATA['maps'][mid]
    H, W = len(g), len(g[0])
    th = m['things']

    def is_open(x, y):
        return 0 <= x < W and 0 <= y < H and g[y][x] in '.,' + ''.join(st.get('soft', ''))

    def near_thing(x, y, d=1):
        return any(0 <= y + dy < H and 0 <= x + dx < W and g[y + dy][x + dx] in th for dx in range(-d, d + 1) for dy in range(-d, d + 1))

    for y in range(1, H - 1):
        for x in range(1, W - 1):
            if g[y][x] != '.':
                continue
            v = r.random()
            if v < st.get('pSolid', 0.05) and st.get('solid'):
                if near_thing(x, y, 1):
                    continue
                if all(is_open(x + dx, y + dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1) if (dx, dy) != (0, 0)):
                    g[y][x] = r.choice(st['solid'])
            elif v < st.get('pSolid', 0.05) + st.get('pSoft', 0.1) and st.get('soft'):
                if not near_thing(x, y, 0):
                    g[y][x] = r.choice(st['soft'])


def check(mid, rows, outs, original):
    m = dict(DATA['maps'][mid]); m['things'] = {k: dict(v) for k, v in m['things'].items()}
    for ch, d in outs.items():
        m['things'][ch]['out'] = d
    b = prune(analyse(m, rows))
    zo = {}
    for it in original['things']:
        zo.setdefault(it['zone'], set()).add(it['ch'])
    zn = {}
    for it in b['things']:
        zn.setdefault(it['zone'], set()).add(it['ch'])
    old_sets = sorted(sorted(s) for s in zo.values() if s)
    new_sets = sorted(sorted(s) for s in zn.values() if s)
    if old_sets != new_sets:
        raise Fail('zones differ %s / %s' % (old_sets, new_sets))
    oc = sorted(''.join(sorted(c['chain'])) for c in original['connectors'])
    nc = sorted(''.join(sorted(c['chain'])) for c in b['connectors'])
    if oc != nc:
        raise Fail('connectors differ %s / %s' % (oc, nc))
    # every warp lands on open floor
    for ch, t in m['things'].items():
        if t['type'] != 'warp':
            continue
        for y, row in enumerate(rows):
            for x, c in enumerate(row):
                if c == ch and t['out']:
                    dx, dy = DV[t['out']]
                    n = rows[y + dy][x + dx] if 0 <= y + dy < len(rows) and 0 <= x + dx < len(row) else '#'
                    if n != '.' and n != ',' and (n in m['things'] or tile_solid(m, n)):
                        raise Fail('warp %s lands on %s' % (ch, n))


def build(mid, st, tries=400):
    original = prune(analyse(DATA['maps'][mid]))
    last = None
    for s in range(tries):
        seed = st.get('seed', 1) * 1000 + s
        try:
            g, owner, rooms, conn_at, zones, a, root, isolated = generate(mid, st, seed)
            outs = place_things(mid, st, seed, g, owner, rooms, conn_at, zones, a)
            features(mid, st, seed, g, rooms, owner)
            decorate(mid, st, seed, g)
            rows = [''.join(row) for row in g]
            check(mid, rows, outs, original)
            return rows, outs, seed
        except Fail as e:
            last = e
    raise SystemExit('%s: gave up (%s)' % (mid, last))


# ------------------------------------------------------------------------------------------------ styles
# wall: the wall character; shape: rect | cave | oct; soft/solid: decor; per: floor cells per room (smaller = more rooms)
STYLES = {
    'cistern':    dict(seed=3, shape='cave', soft='`<%', solid='*U', pSolid=.04, pSoft=.12, per=36, pool='~'),
    'chapel':     dict(seed=4, shape='oct', soft='%', solid='IMA', pSolid=.06, pSoft=.04, per=30, pillars='I'),
    'barrow1':    dict(seed=5, shape='cave', soft='%·', solid='*@', pSolid=.05, pSoft=.10, per=34),
    'barrow2':    dict(seed=6, shape='oct', soft='%☠', solid='IGM', pSolid=.06, pSoft=.07, per=34, pillars='I'),
    'oldtower':   dict(seed=7, wall='S', shape='rect', soft='·', solid='XUA', pSolid=.05, pSoft=.06, per=30),
    'ossuary':    dict(seed=8, shape='rect', soft='%☠', solid='I*', pSolid=.06, pSoft=.12, per=30),
    'digsite':    dict(seed=9, shape='cave', soft='·%', solid='*@', pSolid=.06, pSoft=.10, per=28),
    'abbey1':     dict(seed=10, shape='oct', soft='<', solid='IA', pSolid=.05, pSoft=.10, per=44, corridor=2, pool='~', pillars='I'),
    'abbey2':     dict(seed=11, shape='rect', soft='<%', solid='I', pSolid=.04, pSoft=.08, per=50),
    'seacave':    dict(seed=12, shape='cave', soft='`<', solid='*', pSolid=.04, pSoft=.15, per=36, pool='~'),
    'belltower':  dict(seed=13, wall='S', shape='rect', soft='<', solid='I', pSolid=.05, pSoft=.10, per=32, pool='~'),
    'scriptorium': dict(seed=14, shape='rect', soft='<·', solid='KA', pSolid=.07, pSoft=.08, per=26, pool='~', pillars='K'),
    'smugglers':  dict(seed=15, shape='cave', soft='·', solid='UX', pSolid=.07, pSoft=.06, per=24),
    'cairn1':     dict(seed=16, shape='oct', soft='·', solid=']I', pSolid=.04, pSoft=.06, per=48, pillars=']'),
    'cairn2':     dict(seed=17, shape='oct', soft='·', solid='I', pSolid=.03, pSoft=.05, per=60),
    'icecaves':   dict(seed=18, wall='[', shape='cave', soft=')(', solid='}', pSolid=.04, pSoft=.18, per=40, pool='~', pPool=.3),
    'watchtower': dict(seed=19, wall='S', shape='rect', soft='(·', solid='I', pSolid=.05, pSoft=.08, per=30),
    'vault3':     dict(seed=20, shape='oct', soft='%', solid='+I', pSolid=.05, pSoft=.06, per=26, pillars='I'),
    'goblinden':  dict(seed=21, shape='cave', soft='%·', solid='UX*', pSolid=.07, pSoft=.08, per=26),
    'iceshrine':  dict(seed=22, wall='[', shape='cave', soft=')', solid='}', pSolid=.04, pSoft=.20, per=30),
    'catacombs1': dict(seed=23, shape='rect', soft='%', solid='&=', pSolid=.06, pSoft=.06, per=42, pillars='&'),
    'h_vault':    dict(seed=24, shape='rect', soft='&=', solid='>X', pSolid=.06, pSoft=.06, per=36),
    'h_crypt':    dict(seed=25, shape='oct', soft='%', solid='=M', pSolid=.06, pSoft=.05, per=32, pillars='='),
    'undercroft': dict(seed=26, shape='rect', soft='·%', solid='*U', pSolid=.03, pSoft=.06, per=55, corridor=2, maxrooms=8, pool='~', pPool=.9),
    'chtower':    dict(seed=27, wall='S', shape='rect', soft='·', solid='KAI', pSolid=.06, pSoft=.04, per=28),
    'charnel':    dict(seed=28, shape='rect', soft='%☠', solid='M*', pSolid=.06, pSoft=.12, per=28, pillars='M'),
    'sewer4':     dict(seed=29, shape='rect', soft='·%', solid='*', pSolid=.04, pSoft=.08, per=26, pool='~', pPool=.9),
    'greyhold':   dict(seed=30, shape='rect', soft='%', solid='I+', pSolid=.04, pSoft=.05, per=40, bars='B'),
    'mirror':     dict(seed=31, shape='oct', soft='·', solid='I', pSolid=.04, pSoft=.05, per=40, pillars='I'),
    'hollow1':    dict(seed=32, shape='oct', soft='·', solid='I+', pSolid=.05, pSoft=.04, per=46, pillars='I'),
    'hollow2':    dict(seed=33, shape='rect', soft='·', solid='I', pSolid=.03, pSoft=.04, per=60),
    'lamphall':   dict(seed=34, shape='rect', soft='·', solid='I', pSolid=.05, pSoft=.04, per=30, pillars='I'),
    'cinderkeep': dict(seed=35, wall='S', shape='rect', soft=',·', solid='+U', pSolid=.05, pSoft=.10, per=30),
    'ashchapel':  dict(seed=36, shape='oct', soft='%', solid='IA', pSolid=.05, pSoft=.06, per=24),
    'cindercave': dict(seed=37, shape='cave', soft=',·', solid='*', pSolid=.05, pSoft=.10, per=24),
    'printshop':  dict(seed=38, shape='rect', soft='·', solid='AKX', pSolid=.07, pSoft=.04, per=22),
}


def main(ids):
    out = ['/* The dungeons, redrawn by tools/dungeons.py: new rooms, loops and decor, the same puzzles. Edit the tool, not this. */',
           '(function () {', '  const M = G.D.maps;',
           '  function lay(id, rows, outs, legend) {',
           "    const m = M[id]; if (rows.length !== m.rows.length || rows[0].length !== m.rows[0].length) throw new Error('lay ' + id + ': size changed');",
           "    for (const k in m.things) if (!rows.some(r => r.indexOf(k) >= 0)) throw new Error('lay ' + id + ': thing ' + k + ' is missing');",
           '    m.rows = rows; for (const k in outs) m.things[k].out = outs[k];',
           '    if (legend) m.legend = Object.assign(m.legend || {}, legend);',
           '  }']
    for mid in ids:
        st = STYLES[mid]
        rows, outs, seed = build(mid, st)
        print('==', mid, 'seed', seed)
        print('\n'.join(rows))
        out.append('  lay(%s, %s, %s, %s);' % (json.dumps(mid), json.dumps(rows, ensure_ascii=False), json.dumps(outs), json.dumps(st.get('legend'))))
    out.append('})();')
    open(os.path.join(ROOT, 'data', 'ch9_world', 'd_dungeons.js'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')


if __name__ == '__main__' and (len(sys.argv) < 2 or sys.argv[1] != 'show'):
    main(sys.argv[1].split(',') if len(sys.argv) > 1 else list(STYLES))
