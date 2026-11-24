/* Enemies that react to you.
   - Story foes (type 'foe') stand facing their way. Step into the three squares straight in front of one, with
     nothing solid between, and it comes for you; the fight starts when it reaches you.
   - Roaming bands (type 'roamer'): a few visible groups on every map that has random encounters, drawn from that
     map's encounter table. They wander near where they started, look the way they walk, and chase you the same way.
     A band you beat stays gone until you rest (inn or camp); fleeing calms it for a few seconds.
   Random encounters still happen on such maps, but about half as often.
   Nothing hunts during cutscenes, menus, the tutorial, or automated test runs (G.auto). */
const Hunt = G.hunt = { SIGHT: 3, STEP: 260 };
(function () {
  const DV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const hunter = th => (th.def.type === 'foe' && !th.def.noHunt) || th.def.type === 'roamer';

  // Roaming bands for this map: where they stand is fixed for a given map until you next rest.
  Hunt.spawn = function () {
    const m = Field.map, d = m.def, enc = d.encounters, S = G.S;
    m.roamers = 0;
    if (!enc || d.noRoam || G.tutorial() || (enc.unless && G.cond(enc.unless))) return;
    const gone = (S.roamGone || {})[m.id] || [];
    let seed = 7 + (S.rests || 0) * 131; for (const ch of m.id) seed = (seed * 31 + ch.charCodeAt(0)) % 2147483647;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const busy = new Set(m.things.map(t => t.x + ',' + t.y));
    const warps = m.things.filter(t => t.def.type === 'warp');
    const cands = [];
    for (let y = 1; y < m.h - 1; y++) for (let x = 1; x < m.w - 1; x++) {
      const t = Field.tile(x, y); if (!t || G.D.tiles[t].solid || G.D.tiles[t].safe || busy.has(x + ',' + y)) continue;
      if (warps.some(w => Math.abs(w.x - x) + Math.abs(w.y - y) < 7)) continue;
      if (Math.abs(x - Field.p.x) + Math.abs(y - Field.p.y) < 9) continue;
      cands.push([x, y]);
    }
    const n = cands.length < 40 ? 0 : Math.max(2, Math.min(4, Math.round(cands.length / 170)));
    const placed = [];
    for (let i = 0; i < n; i++) {
      let pos = null;
      for (let tries = 0; tries < 40 && !pos; tries++) {
        const c = cands[Math.floor(rnd() * cands.length)];
        if (placed.every(q => Math.abs(q[0] - c[0]) + Math.abs(q[1] - c[1]) > 8)) pos = c;
      }
      if (!pos) continue;
      let r = rnd() * enc.groups.reduce((a, g) => a + g[1], 0), grp = enc.groups[0][0];
      for (const g of enc.groups) { r -= g[1]; if (r <= 0) { grp = g[0]; break; } }
      placed.push(pos);
      if (gone.indexOf(i) >= 0) continue;
      const foes = G.D.groups[grp].enemies.map(e => G.D.enemies[e]).filter(Boolean);
      const lead = foes.slice().sort((a, b) => b.hp - a.hp)[0];
      const dir = ['up', 'down', 'left', 'right'][Math.floor(rnd() * 4)];
      m.things.push({ key: m.id + '.~roam' + i, ch: '~roam' + i, def: { type: 'roamer', grp, idx: i, sprite: lead.sprite, name: lead.name, dir },
        x: pos[0], y: pos[1], hx: pos[0], hy: pos[1], dir, ox: 0, oy: 0, mt: 0, wt: 800 + rnd() * 2000 });
      m.roamers++;
    }
  };

  // What a hunter can see: up to three squares straight ahead, stopping at anything solid.
  Hunt.sees = function (th, x, y) {
    const v = DV[th.dir || th.def.dir || 'down']; let cx = th.x, cy = th.y;
    for (let i = 0; i < Hunt.SIGHT; i++) {
      cx += v[0]; cy += v[1];
      const t = Field.tile(cx, cy); if (!t || G.D.tiles[t].solid) return false;
      if (cx === x && cy === y) return true;
      if (Field.thingsAt(cx, cy).some(o => o !== th && Field.isSolid(o))) return false;
    }
    return false;
  };
  Hunt.calm = function (th, ms) { th.chase = false; th.path = null; th.calm = G.time + (ms || 6000); };

  Hunt.tick = function (dt) {
    const m = Field.map, p = Field.p;
    if (!m || G.auto || G.busy || G.cine || G.modals.length || G.tutorial() || Field.hideP) return;
    if (G.time - (Hunt.enterT || 0) < 1500) return;                // a moment to get your bearings after a door
    for (const th of m.things) {
      if (!hunter(th) || !Field.visible(th) || th.mt > 0) continue;
      const near = Math.abs(th.x - p.x) + Math.abs(th.y - p.y);
      // reached you: the fight starts
      if (near === 1 && !p.moving && (th.chase || th.def.type === 'roamer') && !(th.calm > G.time)) { Hunt.engage(th); return; }
      // spotted you
      if (!th.chase && !(th.calm > G.time) && (Hunt.sees(th, p.x, p.y) || (p.moving && Hunt.sees(th, p.tx, p.ty)))) {
        th.chase = true; th.path = null; th.stepT = 0;
        Field.emotes.push({ who: th.ch, ch: '!', t: G.time }); G.audio.sfx('select');
        continue;
      }
      if (th.chase) {
        th.stepT = (th.stepT || 0) - dt; if (th.stepT > 0) continue; th.stepT = Hunt.STEP;
        if (near > 12) { Hunt.calm(th, 1500); continue; }
        const path = Field.pathTo(th.x, th.y, p.x, p.y, th);
        if (!path || path.length < 2) { if (!path) Hunt.calm(th, 2000); continue; }
        const [nx, ny] = path[0];
        if ((nx === p.tx && ny === p.ty) || Field.thingsAt(nx, ny).some(o => o !== th && Field.isSolid(o))) continue;
        th.dir = nx > th.x ? 'right' : nx < th.x ? 'left' : ny > th.y ? 'down' : 'up';
        th.ox = th.x - nx; th.oy = th.y - ny; th.x = nx; th.y = ny; th.mt = 1;
        continue;
      }
      // idle roamers potter about near home, looking the way they walk
      if (th.def.type === 'roamer') {
        th.wt -= dt; if (th.wt > 0) continue;
        th.wt = 900 + Math.random() * 2200;
        if (th.calm > G.time && (th.x !== th.hx || th.y !== th.hy)) {          // calmed: drift home
          const path = Field.pathTo(th.x, th.y, th.hx, th.hy, th); if (!path || !path.length) continue;
          const [nx, ny] = path[0]; if (Field.thingsAt(nx, ny).some(o => o !== th && Field.isSolid(o)) || (nx === p.x && ny === p.y)) continue;
          th.dir = nx > th.x ? 'right' : nx < th.x ? 'left' : ny > th.y ? 'down' : 'up'; th.ox = th.x - nx; th.oy = th.y - ny; th.x = nx; th.y = ny; th.mt = 1; continue;
        }
        const dir = G.pick(['up', 'down', 'left', 'right']), nx = th.x + DV[dir][0], ny = th.y + DV[dir][1];
        th.dir = dir;
        if (Math.abs(nx - th.hx) > 3 || Math.abs(ny - th.hy) > 3) continue;
        if (Field.blocked(nx, ny) || (nx === p.x && ny === p.y) || (nx === p.tx && ny === p.ty) || Field.thingsAt(nx, ny).length) continue;
        const t = Field.tile(nx, ny); if (G.D.tiles[t].safe) continue;                 // bands keep off the roads
        th.ox = -DV[dir][0]; th.oy = -DV[dir][1]; th.x = nx; th.y = ny; th.mt = 1;
      }
    }
  };

  // Who saw whom first: reaching one from behind is an ambush (your side moves first); one that chases you down
  // while your back is to it springs one on you (its side moves first, and some come from behind).
  Hunt.opening = function (th) {
    const p = Field.p, vx = p.x - th.x, vy = p.y - th.y, f = DV[th.dir || th.def.dir || 'down'], pf = DV[p.dir || 'down'];
    if (!th.chase && f[0] * vx + f[1] * vy < 0) return 'ambush';
    if (th.chase && pf[0] * -vx + pf[1] * -vy < 0) return 'surprised';
    return null;
  };
  Hunt.engage = function (th) {
    const p = Field.p;
    B.nextOpening = Hunt.opening(th);
    th.chase = false;
    th.dir = p.x < th.x ? 'left' : p.x > th.x ? 'right' : p.y < th.y ? 'up' : 'down';
    p.dir = th.x < p.x ? 'left' : th.x > p.x ? 'right' : th.y < p.y ? 'up' : 'down';
    Field.exec(async () => {
      if (th.def.type === 'roamer') await Hunt.fight(th);
      else {
        try { await Field.use(th); } finally { B.nextOpening = null; }
        if (Field.map.things.indexOf(th) >= 0 && Field.visible(th)) { Hunt.calm(th, 1e9); th.x = th.hx; th.y = th.hy; th.dir = th.def.dir || th.dir; }   // talked down: leaves you be while you are here
      }
    });
  };
  Hunt.fight = async function (th) {
    const m = Field.map, r = await B.start(th.def.grp, {});
    if (r === 'win') {
      const S = G.S; S.roamGone = S.roamGone || {}; (S.roamGone[m.id] = S.roamGone[m.id] || []).push(th.def.idx);
      const i = m.things.indexOf(th); if (i >= 0) m.things.splice(i, 1);
    } else Hunt.calm(th, 6000);
  };
  // a rest brings the bands back, in new places
  Hunt.rested = function () {
    G.S.roamGone = {}; G.S.rests = (G.S.rests || 0) + 1;
    for (const f of Object.keys(G.S.flags)) if (f.startsWith('pray.') || f.startsWith('busk.')) delete G.S.flags[f];   // prayer places and venues are fresh again
  };
})();
