"""Solves each puzzle dungeon through the real game code, step by step, and checks every gate, flag and reward.
   Run: python3 tools/puzzletest.py [map ...]"""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import asyncio, json, sys, re
src = open(os.path.join(ROOT, 'tools', 'playtest.py')).read()
SETUP = re.search(r'SETUP = r"""(.*?)"""', src, re.S).group(1)
from playwright.async_api import async_playwright
ROOMS = open(os.path.join(ROOT, 'tools', 'pz_rooms.json')).read()
HELP = r"""
window.PZ = {};
const DV = { u: [0, -1, 'up'], d: [0, 1, 'down'], l: [-1, 0, 'left'], r: [1, 0, 'right'] };
PZ.settle = async () => { for (let i = 0; i < 4000 && (G.busy || G.modals.length); i++) await new Promise(r => setTimeout(r, 2)); await new Promise(r => setTimeout(r, 2)); };
PZ.step = async (c) => {
  const p = Field.p, v = DV[c]; p.dir = v[2]; const nx = p.x + v[0], ny = p.y + v[1];
  if (Field.blocked(nx, ny)) {
    const b = Field.thingsAt(nx, ny).find(t => t.def.pz === 'block');
    if (!b) throw new Error('blocked at ' + nx + ',' + ny + ' on ' + Field.map.id + ' leader ' + Field.leader());
    const fx = b.x, fy = b.y;
    PZ.lastMoved = await Puzzle.push(b, v[2]); if (!PZ.lastMoved) throw new Error('push failed at ' + nx + ',' + ny);
    if (PZ.lastMoved === 1 && !Field.blocked(fx, fy)) { const from = [p.x, p.y]; p.x = p.tx = fx; p.y = p.ty = fy; Field.arrive(from); }
  } else { const from = [p.x, p.y]; p.x = p.tx = nx; p.y = p.ty = ny; Field.arrive(from); }
  await PZ.settle();
};
// Sneaking: before each step, if a sentry will be looking at the square, wiggle (step `w` and back) until it will not.
PZ.seen = (x, y) => Field.map.things.some(t => t.def.pz === 'sentry' && Puzzle.sight(t, 1).some(q => q[0] === x && q[1] === y));
PZ.sneak = async (s, w) => {
  const back = { u: 'd', d: 'u', l: 'r', r: 'l' };
  for (const c of s.replace(/\s/g, '')) {
    for (let i = 0; i < 12; i++) {
      const p = Field.p, v = DV[c];
      if (!PZ.seen(p.x + v[0], p.y + v[1])) break;
      let ww = w || 'u'; for (const t of [ww, 'u', 'd', 'l', 'r']) { const q = DV[t]; if (!Field.blocked(p.x + q[0], p.y + q[1]) && !PZ.seen(p.x + q[0], p.y + q[1])) { ww = t; break; } }
      const q = DV[ww]; if (PZ.seen(p.x + q[0], p.y + q[1])) { await new Promise(r => setTimeout(r, 1)); }
      await PZ.step(ww); if (!PZ.seen(p.x - q[0], p.y - q[1])) await PZ.step(back[ww]); else { await PZ.step(back[ww]); }
    }
    const x0 = Field.p.x, y0 = Field.p.y; await PZ.step(c);
    if (Field.p.x === x0 && Field.p.y === y0) throw new Error('did not move');
  }
};
PZ.walk = async (s) => { for (const c of s.replace(/\s/g, '')) await PZ.step(c); };
// A solution from tools/pz_rooms.json: steps and shoves are letters, Fx is face x and use the leader's move.
PZ.path = async (list) => { for (const t of list) { if (t[0] === 'F') await PZ.F(t[1]); else await PZ.step(t[t.length - 1]); } };
PZ.room = async (mid, rid, lead) => { const r = PZ.rooms[mid][rid]; await PZ.go(r.start[0], r.start[1]); if (lead) PZ.lead(lead); await PZ.path(r.path); };
// Walk to a square by the shortest open way, shoving nothing.
PZ.go = async (tx, ty) => {
  const p = Field.p, k = (x, y) => x + ',' + y, prev = { [k(p.x, p.y)]: null }, q = [[p.x, p.y]];
  while (q.length) { const [x, y] = q.shift(); if (x === tx && y === ty) break;
    for (const c of 'udlr') { const v = DV[c], nx = x + v[0], ny = y + v[1]; if (k(nx, ny) in prev || Field.blocked(nx, ny) || Field.thingsAt(nx, ny).some(t => t.def.type === 'warp' || (t.def.pz === 'trap' && !G.flag('pzd.' + t.key)))) continue; prev[k(nx, ny)] = [x, y, c]; q.push([nx, ny]); } }
  if (!(k(tx, ty) in prev)) throw new Error('no way to ' + tx + ',' + ty + ' from ' + PZ.at());
  const steps = []; let c = k(tx, ty); while (prev[c]) { const [x, y, d] = prev[c]; steps.unshift(d); c = k(x, y); }
  await PZ.walk(steps.join(''));
};
PZ.face = c => { Field.p.dir = DV[c][2]; };
PZ.F = async (c) => { if (c) PZ.face(c); Field.exec(() => Field.ability()); await PZ.settle(); };
PZ.A = async (c) => { if (c) PZ.face(c); Field.interact(); await PZ.settle(); };
PZ.lead = id => { G.S.leader = id; };
PZ.at = () => Field.p.x + ',' + Field.p.y;
PZ.chk = (cond, msg) => { if (!cond) throw new Error('CHECK FAILED: ' + msg + ' at ' + PZ.at()); };
"""
TESTS = {
'smithdeep': r'''
  G.S.flags.chapter = 5;
  await Field.enter('ashfall', null, { noFade: true });
  const way = Field.map.things.find(t => t.def.to === 'smithdeep'); Field.p.x = way.x; Field.p.y = way.y - 1; await PZ.step('d'); await PZ.settle();
  PZ.chk(Field.map.id === 'smithdeep' && PZ.at() === '2,16', 'arrival ' + Field.map.id + ' ' + PZ.at());
  // R1, the Cinder Gate: Dask reads the wall and opens a way through the traps, and the secret alcove
  PZ.lead('dask'); await PZ.walk('rrrrrr'); PZ.chk(G.flag('sp.smithdeep.6'), 'mural 1 (bellows)');
  await PZ.walk('r u'); await PZ.A('r');
  await PZ.walk('lllllll u'); PZ.chk(PZ.at() === '2,14', 'before the traps ' + PZ.at());
  await PZ.F('u'); PZ.chk(G.flag('pzd.smithdeep.x') || Field.map.things.some(t => t.def.pz === 'trap' && G.flag('pzd.' + t.key)), 'trap disarmed');
  await PZ.walk('uuu r u'); await PZ.F('u'); PZ.chk(Field.map.things.some(t => t.def.pz === 'secret' && G.flag('x.' + t.key)), 'secret alcove');
  PZ.lead('runa'); await PZ.walk('u u l u u r'); PZ.chk(PZ.at() === '3,6', 'behind the anvil-stone ' + PZ.at());
  await PZ.walk('dddd'); PZ.chk(G.flag('sd.g1'), 'cinder gate');
  PZ.lead('maren'); await PZ.walk('r d rrrrrr'); await PZ.F('u'); PZ.chk(G.flag('sd.l1'), 'lamp 1');
  await PZ.walk('l'); await PZ.A('u');
  // R2, the Bellows Hall: Finch sings the keeper to sleep, then plays low, high, middle, high under the warden's eye
  PZ.lead('dask'); await PZ.walk('ll u u u'); PZ.chk(PZ.at() === '7,8', 'into the passage ' + PZ.at());
  await PZ.walk('u'); await PZ.sneak('u', 'd'); PZ.chk(G.flag('sp.smithdeep.7'), 'mural 2 (tongs)');
  PZ.lead('finch'); await PZ.sneak('u rrrrrrrrrr', 'd'); PZ.chk(PZ.at() === '17,5', 'below the keeper ' + PZ.at());
  await PZ.F('u'); PZ.chk(Field.map.things.some(t => t.def.lull && G.flag('pzs.' + t.key)), 'keeper asleep');
  await PZ.sneak('llllllllllll uuu', 'd'); PZ.chk(PZ.at() === '5,2', 'at the low stone ' + PZ.at()); await PZ.F('u');
  await PZ.sneak('rrrrrrrrrrrrrrr', 'd'); PZ.chk(PZ.at() === '20,2', 'at the high stone ' + PZ.at()); await PZ.F('u');
  await PZ.sneak('ddd lllllll', 'u'); PZ.chk(PZ.at() === '13,5', 'at the middle stone ' + PZ.at()); await PZ.F('d');
  await PZ.sneak('rrrrrrr uuu', 'd'); PZ.chk(PZ.at() === '20,2', 'back at the high stone ' + PZ.at()); await PZ.F('u');
  PZ.chk(G.flag('sd.song'), 'forge-song');
  await PZ.sneak('d rr', 'u'); PZ.chk(PZ.at() === '22,3', 'into the Quench ' + PZ.at());
  // R3, the Quench: Runa bridges the pit and lays a stone on a plate; Dask finds the ledge plate and the ice-wall writing
  PZ.lead('dask'); await PZ.go(24, 3); PZ.chk(G.flag('sp.smithdeep.8'), 'mural 3 (hammer)');
  await PZ.room('smithdeep', 'r3', 'runa'); PZ.chk(G.flag('sd.p3a') && Field.map.things.some(t => t.def.pz === 'gap' && G.flag('pzf.' + t.key)), 'pit bridged, stone on the plate');
  PZ.lead('dask'); await PZ.go(31, 5); await PZ.F('r'); PZ.chk(G.flag('sd.p3b'), 'pebble on the ledge plate');
  await PZ.go(30, 11); PZ.chk(PZ.at() === '30,11', 'into the Anvil hall ' + PZ.at());
  // R4, the Anvil of Light: Maren's lens, Runa's mirror, Finch's chime; four lamps in Dask's order; Finch and the hound
  PZ.lead('maren'); await PZ.walk('d rrr d r'); await PZ.F('u'); PZ.chk(G.flag('sd.lens'), 'lens lamp');
  PZ.lead('runa'); await PZ.walk('llllllll u'); await PZ.F('l');
  PZ.lead('finch'); await PZ.walk('ddddd r'); await PZ.F('d'); PZ.chk(G.flag('sd.cr'), 'crystal');
  PZ.lead('maren'); await PZ.walk('rrrrrrr'); await PZ.F('d');
  PZ.lead('dask'); await PZ.walk('lllllllllllllllllllll'); PZ.chk(G.flag('sp.smithdeep.9'), 'mural 4 (anvil)');
  PZ.lead('maren'); await PZ.walk('uuuuuu'); await PZ.F('l');
  await PZ.walk('rrrrrrrrrrrrrrrrrrrr dddd'); await PZ.F('r');
  await PZ.walk('dd llllllllllllllllllll d'); await PZ.F('l'); PZ.chk(G.flag('sd.seq'), 'four lamps');
  PZ.lead('finch'); await PZ.walk('uuuuuuu r u'); await PZ.F('u'); PZ.chk(Field.map.things.some(t => t.def.pz === 'beast' && G.flag('pzs.' + t.key)), 'hound asleep');
  await PZ.walk('uu'); await PZ.A('r'); PZ.chk(G.flag('smithEdge'), 'smith edge');
  PZ.chk(G.stats(G.member('runa')).critMin === 19, 'crit on 19');
''',
'icehalls': r"""
  await Field.enter('frostpass', null, { noFade: true });
  const way = Field.map.things.find(t => t.def.to === 'icehalls'); Field.p.x = way.x; Field.p.y = way.y - 1; await PZ.step('d'); await PZ.settle();
  PZ.chk(Field.map.id === 'icehalls' && PZ.at() === '5,16', 'arrival ' + Field.map.id + ' ' + PZ.at());
  // a block on the ice slides until something stops it
  PZ.lead('runa'); const m1 = Field.map.things.find(t => t.ch === 'm' && t.y === 15); await PZ.go(m1.x + 1, m1.y); await PZ.walk('l'); PZ.chk(m1.x === 5 && PZ.at() === '9,15', 'slid to the pillar ' + m1.x + ' ' + PZ.at());
  await PZ.go(8, 17); await PZ.A('r'); PZ.chk(m1.x === 8 && PZ.at() === '5,16', 'rink 1 put back');
  await PZ.room('icehalls', 'r1', 'runa'); PZ.chk(G.flag('ih.g1') && G.flag('ih.g1b'), 'gate 1');
  PZ.lead('dask'); await PZ.go(5, 12); await PZ.F('u'); await PZ.walk('uu'); await PZ.A('u'); PZ.chk(G.flag('o.icehalls.e'), 'cache');
  await PZ.go(13, 12); PZ.chk(G.flag('sp.icehalls.h'), 'spotted the frost plate');
  await PZ.room('icehalls', 'r2', 'runa'); PZ.chk(G.flag('ih.g2') && G.flag('ih.g2b'), 'gate 2 ' + PZ.at());
  await PZ.go(21, 12); PZ.lead('finch'); await PZ.F('r'); PZ.chk(G.flag('pzs.icehalls.k'), 'wolf asleep');
  PZ.lead('dask'); await PZ.go(23, 12); PZ.chk(G.flag('sp.icehalls.x'), 'spotted plate 3');
  await PZ.room('icehalls', 'r3', 'runa'); PZ.chk(G.flag('ih.p3') && G.flag('ih.p3b'), 'vault bolts ' + PZ.at());
  await PZ.go(27, 6); PZ.chk(PZ.at() === '27,6', 'vault ' + PZ.at());
  PZ.lead('maren'); await PZ.walk('lll u'); await PZ.F('u'); PZ.chk(G.flag('ih.thaw'), 'thawed');
  await PZ.walk('rrrrr u rr'); PZ.lead('finch'); await PZ.F('r'); PZ.chk(G.flag('ih.horn'), 'horn');
  await PZ.walk('lllll u u'); await PZ.A('u'); PZ.chk(G.has('frostmantle'), 'mantle');
""",
'echospire': r"""
  await Field.enter('falls', null, { noFade: true });
  const way = Field.map.things.find(t => t.def.to === 'echospire'); Field.p.x = way.x; Field.p.y = way.y - 1; await PZ.step('d'); await PZ.settle();
  PZ.chk(Field.map.id === 'echospire' && PZ.at() === '10,14', 'arrival ' + Field.map.id + ' ' + PZ.at());
  PZ.lead('maren'); await PZ.walk('llllllll u'); await PZ.F('l'); PZ.chk(!G.flag('es.k1'), 'not yet');
  PZ.lead('finch'); await PZ.walk('d rr'); await PZ.F('d'); PZ.chk(G.flag('es.k1'), 'crystal 1');
  await PZ.walk('rrrrrrrr u rr'); PZ.chk(PZ.at() === '14,13', 'r2 ' + PZ.at());
  // the rotten gallery: one walk, end to end. Step on and off, and the first board is gone; start the room over
  PZ.lead('finch'); await PZ.go(14, 15); await PZ.walk('r l'); PZ.chk(Field.blocked(15, 15), 'board fell');
  await Puzzle.reset(Puzzle.roomHere()); await PZ.settle(); PZ.chk(!Field.blocked(15, 15) && PZ.at() === '14,13', 'gallery back ' + PZ.at());
  // first, second and third stones: the five glasses line up from the roof to the false wall
  await PZ.go(14, 15); await PZ.walk('rr'); await PZ.F('u'); await PZ.walk('rr'); await PZ.F('u'); await PZ.walk('rr'); await PZ.F('u');
  await PZ.walk('rrrrr uu'); PZ.chk(PZ.at() === '25,13' && !G.flag('es.k2'), 'off the gallery, wall still blocks ' + PZ.at());
  PZ.lead('dask'); await PZ.go(25, 10); await PZ.F('r'); PZ.chk(G.flag('es.k2'), 'crystal 2 ' + PZ.at());
  await PZ.go(12, 7); PZ.chk(PZ.at() === '12,7', 'r3 ' + PZ.at());
  PZ.lead('maren'); await PZ.walk('uuuu'); await PZ.F('u');
  PZ.lead('finch'); await PZ.walk('ll dddd'); await PZ.F('l'); PZ.chk(!G.flag('es.k3'), 'heavy mirror still wrong');
  PZ.lead('runa'); await PZ.walk('u lll'); await PZ.F('l'); PZ.chk(G.flag('es.k3'), 'crystal 3');
  PZ.lead('dask'); await PZ.walk('uuu l lll u ll'); PZ.chk(G.flag('sp.echospire.m'), 'hidden song');
  await PZ.walk('d rrrrrrrrrrr r r'); PZ.chk(PZ.at() === '14,3', 'vault ' + PZ.at());
  PZ.lead('finch'); await PZ.walk('u rr'); await PZ.F('u'); await PZ.walk('l'); await PZ.F('u'); await PZ.walk('l'); await PZ.F('u'); await PZ.walk('r'); await PZ.F('u');
  PZ.chk(G.flag('es.song'), 'song');
  await PZ.walk('r dd'); await PZ.A('r'); PZ.chk(((G.S.feats || {}).finch || []).indexOf('secondverse') >= 0, 'second verse');
""",
'archive': r'''
  await Field.enter('highmoor', null, { noFade: true });
  const way = Field.map.things.find(t => t.def.to === 'archive'); Field.p.x = way.x; Field.p.y = way.y - 1; await PZ.step('d'); await PZ.settle();
  PZ.chk(Field.map.id === 'archive' && PZ.at() === '6,14', 'arrival ' + Field.map.id + ' ' + PZ.at());
  PZ.lead('dask'); await PZ.walk('uuu'); PZ.chk(PZ.at() === '6,14', 'caught and sent back ' + PZ.at());
  PZ.chk(Field.map.things.filter(t => t.def.pz === 'trap').length === 4, 'four trip-wires in the hall');
  await PZ.walk('r uuuuu l u u'); PZ.chk(PZ.at() === '6,7', 'r2 ' + PZ.at());
  // the stacks: a careless shove (the east bookcase into the corner) ruins the room; the lever puts it back
  const lever = Field.map.things.find(t => t.def.pz === 'reset' && t.def.room === 'r2'), shelves = () => Field.map.things.filter(t => t.def.pz === 'block' && t.def.room === 'r2').map(t => t.x + ',' + t.y).sort().join(' ');
  const home = shelves(); PZ.chk(home === '10,6 8,6', 'shelves ' + home);
  PZ.lead('runa'); await PZ.walk('rrr u r'); PZ.chk(shelves() === '11,6 8,6', 'shelf in the corner ' + shelves());
  await Puzzle.reset(lever); await PZ.settle(); PZ.chk(shelves() === home && PZ.at() === '6,7' && Puzzle.steps === 0, 'lever put the stacks back ' + PZ.at() + ' ' + shelves());
  // walk straight up the middle and a warden sees you
  await PZ.walk('rrr uuu'); PZ.chk(PZ.at() === '6,7', 'seen from the end of an aisle ' + PZ.at());
  await Puzzle.reset(lever); await PZ.settle();
  // the solver's way, from the lever's spot, never seen
  let caught = 0; const w0 = Puzzle.watch; Puzzle.watch = async () => { const r = await w0(); if (r) caught++; return r; };
  await PZ.path(PZ.rooms.archive.r2.path); await PZ.settle(); Puzzle.watch = w0;
  PZ.chk(PZ.at() === '12,2' && !caught, 'through the stacks unseen ' + PZ.at() + ' caught ' + caught);
  PZ.lead('dask'); await PZ.walk('r'); PZ.chk(PZ.at() === '13,2', 'r3 ' + PZ.at());
  await PZ.sneak('d rrrrrrrrrrrrrr ddd', 'l'); PZ.lead('maren'); await PZ.F('l');
  await PZ.sneak('ddd llllll dd', 'u'); await PZ.F('l');
  await PZ.sneak('dd llllllll uuuuuuu', 'd'); await PZ.F('r'); PZ.chk(G.flag('ia.seq'), 'lamps ' + PZ.at());
  await PZ.sneak('ddddddd rrrrrrrrr rrrr', 'l'); await PZ.A('r'); PZ.chk(((G.S.feats || {}).dask || []).indexOf('opportunist') >= 0, 'opportunist ' + PZ.at());
''',
'lampvault': r"""
  await Field.enter('undercroft', null, { noFade: true });
  const way = Field.map.things.find(t => t.def.to === 'lampvault'); Field.p.x = way.x; Field.p.y = way.y - 1; await PZ.step('d'); await PZ.settle();
  PZ.chk(Field.map.id === 'lampvault' && PZ.at() === '2,14', 'arrival ' + Field.map.id + ' ' + PZ.at());
  PZ.lead('dask'); await PZ.walk('u rrrr uu rr dd rr uu'); PZ.chk(G.flag('sp.lampvault.m'), 'mural 1 ' + PZ.at());
  await PZ.walk('ddd rr'); await PZ.F('r'); await PZ.walk('r'); PZ.chk(PZ.at() === '13,14', 'r2 ' + PZ.at());
  // a boulder dropped in the wrong column is gone: fill one pit at the near end, then put the room back
  PZ.lead('runa'); await PZ.walk('r'); await PZ.go(15, 15); await PZ.walk('u u'); PZ.chk(G.flag('pzf.lampvault.f') || Field.map.things.some(t => t.def.pz === 'gap' && G.flag('pzf.' + t.key)), 'a pit filled');
  await Puzzle.reset(Puzzle.roomHere()); await PZ.settle(); PZ.chk(!Field.map.things.some(t => t.def.pz === 'gap' && G.flag('pzf.' + t.key)) && PZ.at() === '13,14', 'pits back ' + PZ.at());
  await PZ.room('lampvault', 'r2', 'runa'); await PZ.go(27, 10); PZ.lead('maren'); await PZ.F('r'); PZ.chk(G.flag('uc.l2'), 'far lamp');
  await PZ.go(17, 8); PZ.chk(PZ.at() === '17,8', 'r3 ' + PZ.at());
  await PZ.walk('uu rrrrrrrrrr uu'); await PZ.F('r');
  PZ.lead('finch'); await PZ.walk('ddd ll'); await PZ.F('l'); PZ.chk(G.flag('uc.k3'), 'crystal');
  PZ.lead('dask'); await PZ.walk('u lllllllllll uu ll'); PZ.chk(PZ.at() === '12,4', 'r4 ' + PZ.at());
  PZ.chk(G.flag('sp.lampvault.y'), 'mural 4');
  PZ.lead('maren'); await PZ.walk('d lllllllllll uuu'); await PZ.F('u');
  await PZ.walk('r u rrrrrrrrr d r'); await PZ.F('u');
  await PZ.walk('ddddd lllllllllll'); await PZ.F('d');
  await PZ.walk('rrrrrrrrrrr'); await PZ.F('d'); PZ.chk(G.flag('uc.seq'), 'four lamps');
  PZ.lead('finch'); await PZ.walk('llllll'); await PZ.F('u'); PZ.chk(G.flag('pzs.lampvault.w'), 'shade asleep');
  await PZ.walk('uuu'); await PZ.A('u'); PZ.chk(G.has('brotherslantern'), 'lantern');
""",
'millrace': r'''
  Object.assign(G.S.flags, { millFree: 1, joined: 1 });
  await Field.enter('mill', null, { noFade: true });
  const way = Field.map.things.find(t => t.def.to === 'millrace');
  Field.p.x = way.x; Field.p.y = way.y - 1; await PZ.step('d'); await PZ.settle();
  PZ.chk(Field.map.id === 'millrace', 'entered millrace via the mill: ' + Field.map.id);
  PZ.chk(PZ.at() === '4,12', 'arrival');
  // nobody but Runa shifts a stone
  PZ.lead('maren'); const m0 = Field.map.things.find(t => t.ch === 'm'); const mx = m0.x; await PZ.go(m0.x - 1, m0.y); await PZ.walk('r').catch(e => {}); PZ.chk(m0.x === mx, 'maren cannot shove');
  // shove a stone, then pull the red lever: the room goes back the way it was
  PZ.lead('runa'); const m1 = Field.map.things.find(t => t.ch === 'm' && t.x === 3 && t.y === 12); await PZ.go(4, 12); await PZ.walk('l'); PZ.chk(m1.x === 2, 'shoved left');
  await PZ.go(2, 7); await PZ.A('l'); PZ.chk(PZ.at() === '4,12' && m1.x === 3 && m1.y === 12, 'lever put r1 back ' + PZ.at());
  await PZ.room('millrace', 'r1', 'runa'); PZ.chk(G.flag('mr.g1a') && G.flag('mr.g1b'), 'gate 1 open');
  PZ.lead('dask'); await PZ.go(3, 7); await PZ.F('u'); await PZ.walk('uu'); await PZ.A('u'); PZ.chk(G.flag('o.millrace.e'), 'bonus chest');
  await PZ.go(10, 9); PZ.chk(G.flag('sp.millrace.h') && G.flag('sp.millrace.β'), 'dask spotted both drain plates');
  await PZ.room('millrace', 'r2s', 'runa'); PZ.chk(G.flag('mr.dr2a') && G.flag('mr.dr2b'), 'race 2 drained');
  await PZ.room('millrace', 'r2n', 'runa'); PZ.chk(G.flag('mr.g2a') && G.flag('mr.g2b'), 'gate 2');
  await PZ.room('millrace', 'r3a', 'runa'); PZ.chk(G.flag('mr.dr3a') && G.flag('mr.dr3c'), 'short race');
  await PZ.room('millrace', 'r3b', 'runa'); PZ.chk(G.flag('mr.dr3b') && G.flag('mr.dr3d'), 'long race');
  await PZ.go(27, 11); await PZ.A('d'); PZ.chk(((G.S.feats || {}).runa || []).indexOf('thick') >= 0, 'feat thick');
  PZ.chk(G.flag('q.pz_millrace') === 2, 'quest done');
  // the menu's Start this room over: from the far side of the long race, back to its start, the race full again
  PZ.chk(!Puzzle.roomHere(), 'east bank is no puzzle room'); await PZ.go(24, 9); const rm = Puzzle.roomHere(); PZ.chk(rm && rm.def.room === 'r3b', 'in r3b');
  await Puzzle.reset(rm); await PZ.settle(); PZ.chk(!G.flag('mr.dr3b') && PZ.at() === '22,6', 'reset r3b ' + PZ.at());
''',
'hollowbarrow': r"""
  Object.assign(G.S.flags, { joined: 1 });
  await Field.enter('thornwood', null, { noFade: true });
  const way = Field.map.things.find(t => t.def.to === 'hollowbarrow'); Field.p.x = way.x; Field.p.y = way.y - 1; await PZ.step('d'); await PZ.settle();
  PZ.chk(Field.map.id === 'hollowbarrow', 'entered');
  PZ.chk(PZ.at() === '2,14', 'arrival ' + PZ.at());
  PZ.lead('maren'); const hp0 = G.S.party.map(m => m.hp).join(); await PZ.walk('u'); await PZ.step('r'); PZ.chk(PZ.at() === '2,13', 'trap threw back ' + PZ.at()); PZ.chk(G.S.party.map(m => m.hp).join() !== hp0, 'trap hurt');
  await PZ.walk('uuuu'); await PZ.F('l'); PZ.chk(G.flag('pzl.hollowbarrow.5'), 'lamp lit');
  await PZ.walk('ddddd'); PZ.chk(PZ.at() === '2,14', 'back down ' + PZ.at());
  PZ.lead('dask'); await PZ.walk('rr uu rr uu rrr dd rr d rr r');
  PZ.chk(PZ.at() === '14,13', 'through the hall ' + PZ.at());
  await PZ.walk('rrrrrrrrr'); PZ.chk(G.flag('sp.hollowbarrow.q'), 'spotted plate'); await PZ.F('u'); PZ.chk(G.flag('hb.br'), 'bridge down');
  await PZ.go(15, 9); PZ.chk(G.flag('sp.hollowbarrow.r') && G.flag('sp.hollowbarrow.v'), 'spotted the vault door and its carving'); await PZ.F('u');
  await PZ.go(22, 9); PZ.chk(G.flag('sp.hollowbarrow.s'), 'spotted alcove'); await PZ.F('u'); await PZ.go(24, 6); await PZ.A('r'); PZ.chk(G.flag('o.hollowbarrow.e'), 'alcove chest');
  // the bone-floor: one crossing per square. Step in and back out, and the way in has fallen away; start the room over
  PZ.lead('maren'); await PZ.go(15, 8); await PZ.walk('u d'); PZ.chk(Field.blocked(15, 7), 'crack fell in');
  PZ.chk(Puzzle.roomHere() && Puzzle.roomHere().def.room === 'r3', 'in the vault'); await Puzzle.reset(Puzzle.roomHere()); await PZ.settle();
  PZ.chk(!Field.blocked(15, 7) && PZ.at() === '15,9', 'vault put back ' + PZ.at());
  await PZ.room('hollowbarrow', 'r3', 'maren'); PZ.chk(G.flag('hb.seq') && PZ.at() === '15,2', 'four lamps, grate up ' + PZ.at());
  await PZ.A('u');
  PZ.chk(G.has('shadowgloves'), 'gloves');
""",
'drownedchapel': r"""
  await Field.enter('mirefen', null, { noFade: true });
  const way = Field.map.things.find(t => t.def.to === 'drownedchapel'); Field.p.x = way.x; Field.p.y = way.y - 1; await PZ.step('d'); await PZ.settle();
  PZ.chk(Field.map.id === 'drownedchapel', 'entered');
  PZ.chk(PZ.at() === '5,14', 'arrival ' + PZ.at());
  PZ.lead('runa'); await PZ.walk('ul'); await PZ.F('l'); PZ.chk(!G.flag('dc.low'), 'runa cannot ring');
  PZ.lead('finch'); await PZ.F('l'); PZ.chk(G.flag('dc.low'), 'low tide');
  await PZ.walk('r uuuuuuuuuuu rrrrr r'); PZ.chk(PZ.at() === '11,2', 'r2 ' + PZ.at());
  await PZ.walk('rrrrr ddddd'); PZ.lead('maren'); await PZ.F('d'); PZ.chk(G.flag('dc.l1'), 'island lamp');
  await PZ.walk('uuuuu ll'); PZ.lead('finch'); await PZ.F('u'); PZ.chk(!G.flag('dc.low'), 'high tide');
  await PZ.walk('ll dddddddddd dd rrrrrrr r'); PZ.chk(PZ.at() === '20,14', 'r3 ' + PZ.at());
  // the dry end: low tide first (the first plate is up the sunken aisle), then the saints
  PZ.lead('finch'); await PZ.go(26, 14); await PZ.F('u'); PZ.chk(G.flag('dc.low'), 'low again');
  await PZ.room('drownedchapel', 'r3', 'runa'); PZ.chk(G.flag('dc.p') && G.flag('dc.p2'), 'both saints on their plates');
  PZ.lead('maren'); await PZ.go(27, 15); await PZ.F('r'); PZ.chk(!G.flag('pzl.drownedchapel.8'), 'wrong order snuffs');
  await PZ.go(22, 15); await PZ.F('r'); await PZ.go(27, 15); await PZ.F('r'); await PZ.go(24, 15); await PZ.F('r'); PZ.chk(G.flag('dc.seq'), 'lamps in order');
  PZ.lead('finch'); await PZ.go(25, 13); await PZ.F('r'); PZ.chk(!G.flag('dc.low'), 'flood');
  await PZ.go(27, 2); await PZ.A('r'); PZ.chk(((G.S.feats || {}).maren || []).indexOf('grace') >= 0, 'grace');
""",
'seacaves': r"""
  await Field.enter('saltmere', null, { noFade: true });
  const way = Field.map.things.find(t => t.def.to === 'seacaves'); Field.p.x = way.x; Field.p.y = way.y - 1; await PZ.step('d'); await PZ.settle();
  PZ.chk(Field.map.id === 'seacaves', 'entered');
  PZ.chk(PZ.at() === '5,14', 'arrival ' + PZ.at());
  PZ.lead('finch'); await PZ.walk('uu lll'); await PZ.F('u'); await PZ.walk('rrr'); await PZ.F('u'); await PZ.walk('rrr'); await PZ.F('u'); await PZ.walk('llllll'); await PZ.F('u');
  PZ.chk(G.flag('sc.s1'), 'song 1');
  await PZ.walk('rr uu r uu lll uuuu'); PZ.chk(PZ.at() === '2,4', 'at the gap ' + PZ.at()); await PZ.F('u'); PZ.chk(G.flag('pzs.seacaves.k'), 'crab asleep');
  PZ.lead('dask'); await PZ.walk('uu rrrrrrrr'); PZ.chk(G.flag('sp.seacaves.w'), 'mural spotted');
  await PZ.walk('llllllll dd ddd'); PZ.lead('finch'); await PZ.walk('rrrrrrr'); await PZ.F('u'); await PZ.walk('llllll'); await PZ.F('u'); await PZ.walk('rrrrrrrrr'); await PZ.F('u'); await PZ.walk('llllll'); await PZ.F('u'); await PZ.walk('rrr'); await PZ.F('u');
  PZ.chk(G.flag('sc.s2'), 'song 2');
  await PZ.walk('rrrr u r'); PZ.chk(PZ.at() === '14,6', 'door 2 ' + PZ.at()); await PZ.go(15, 7); PZ.lead('maren'); await PZ.F('d'); PZ.chk(G.flag('sc.l3'), 'grotto lamp');
  PZ.lead('dask'); await PZ.go(27, 8); PZ.chk(G.flag('sp.seacaves.y'), 'last mural spotted ' + PZ.at());
  // the shelf: one step on and back, and the way up has crumbled; start the room over from the menu
  await PZ.room('seacaves', 'r3', 'finch'); PZ.chk(G.flag('sc.s3'), 'song 3 ' + PZ.at());
  await PZ.go(26, 13); await PZ.A('d'); PZ.chk(G.has('sirenstring'), 'siren-string');
""",
}
async def main():
    names = sys.argv[1:] or list(TESTS)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        bad = 0
        for n in names:
            pg = await b.new_page(viewport={'width': 640, 'height': 480}); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' else None)
            await pg.add_init_script('window.__NO_TITLE = true;')
            await pg.goto('file://' + os.path.join(ROOT, 'dist', 'index.html')); await pg.wait_for_timeout(300)
            await pg.evaluate(SETUP + HELP + '; PZ.rooms = ' + ROOMS + '; void 0')
            body = "(async () => { G.newGame(); G.S.level = 8; G.healAll(); try {\n" + TESTS[n] + "\n  const id0 = Field.map.id, u = Field.map.things.find(t => t.ch === 'u'); Field.p.x = Field.p.tx = u.x; Field.p.y = Field.p.ty = u.y - 1; Puzzle.steps = 1; await PZ.step('d'); await PZ.settle(); PZ.chk(Field.map.id !== id0, 'walked out of ' + id0 + ' (still on ' + Field.map.id + ')');\n return 'ok'; } catch (e) { return 'FAIL ' + (e.stack || e).toString().split('\\n').slice(0, 3).join(' | '); } })()"
            try: r = await asyncio.wait_for(pg.evaluate(body), 120)
            except Exception as e: r = 'TIMEOUT ' + str(e)[:200]
            if r != 'ok' or errs: bad += 1
            print(n, r, errs[:5], flush=True)
            await pg.close()
        await b.close()
        sys.exit(1 if bad else 0)
asyncio.run(main())
