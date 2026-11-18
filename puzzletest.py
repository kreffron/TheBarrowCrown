"""Solves each puzzle dungeon through the real game code, step by step, and checks every gate, flag and reward.
   Run: python3 tools/puzzletest.py [map ...]"""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import asyncio, json, sys, re
src = open(os.path.join(ROOT, 'tools', 'playtest.py')).read()
SETUP = re.search(r'SETUP = r"""(.*?)"""', src, re.S).group(1)
from playwright.async_api import async_playwright
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
  PZ.lead('runa'); await PZ.walk('rr'); PZ.chk(Field.map.things.some(t => t.def.pz === 'gap' && G.flag('pzf.' + t.key)), 'pit bridged');
  PZ.lead('dask'); await PZ.walk('ddd'); PZ.chk(G.flag('sp.smithdeep.8'), 'mural 3 (hammer)'); await PZ.walk('uuu');
  PZ.lead('runa'); await PZ.walk('rrrrr uu rrr'); PZ.chk(PZ.at() === '31,1', 'above the second stone ' + PZ.at());
  await PZ.walk('d'); PZ.chk(G.flag('sd.p3a'), 'stone on the plate');
  PZ.lead('dask'); await PZ.walk('dddd'); await PZ.F('r'); PZ.chk(G.flag('sd.p3b'), 'pebble on the ledge plate');
  await PZ.walk('l dddd dd'); PZ.chk(PZ.at() === '30,11', 'into the Anvil hall ' + PZ.at());
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
  PZ.lead('runa'); await PZ.walk('lll uu'); await PZ.walk('r'); PZ.chk(G.flag('ih.g1') && PZ.at() === '2,14', 'slid onto plate 1 ' + PZ.at());
  PZ.lead('dask'); await PZ.walk('uu rrr'); await PZ.F('u'); await PZ.walk('uu'); await PZ.A('u'); PZ.chk(G.flag('o.icehalls.e'), 'cache');
  await PZ.walk('ddd rrrr d rrr'); PZ.chk(PZ.at() === '12,14', 'r2 ' + PZ.at());
  await PZ.walk('rrr'); PZ.chk(G.flag('sp.icehalls.h'), 'spotted');
  PZ.lead('runa'); await PZ.walk('lll dd'); await PZ.walk('r'); await PZ.walk('d rrrrr'); await PZ.walk('u'); PZ.chk(G.flag('ih.g2'), 'plate 2 ' + PZ.at());
  await PZ.walk('uuu rrr uu r'); PZ.lead('finch'); await PZ.F('r'); PZ.chk(G.flag('pzs.icehalls.k'), 'wolf asleep');
  await PZ.walk('rr'); PZ.chk(PZ.at() === '23,12', 'r3 ' + PZ.at());
  PZ.lead('dask'); await PZ.walk('rrrrr'); PZ.chk(G.flag('sp.icehalls.x'), 'spotted plate 3');
  PZ.lead('runa'); await PZ.walk('uuuu rrr'); await PZ.walk('d'); await PZ.walk('lllll dddddd'); await PZ.walk('r'); await PZ.walk('d rrrr'); await PZ.walk('u');
  PZ.chk(G.flag('ih.p3'), 'plate 3 ' + PZ.at());
  await PZ.walk('uuu l uuuu ll uu'); PZ.chk(PZ.at() === '27,6', 'vault ' + PZ.at());
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
  await PZ.walk('d rrr'); await PZ.F('d'); await PZ.walk('rrrr'); await PZ.F('d');
  PZ.lead('runa'); await PZ.walk('r uuuu u r'); await PZ.walk('d'); PZ.chk(!G.flag('es.k2'), 'wall still blocks');
  PZ.lead('dask'); await PZ.walk('rr'); await PZ.F('r'); PZ.chk(G.flag('es.k2'), 'crystal 2 ' + PZ.at());
  await PZ.walk('u lllllllll d l l u u u l l'); PZ.chk(PZ.at() === '12,7', 'r3 ' + PZ.at());
  PZ.lead('maren'); await PZ.walk('uuuu'); await PZ.F('u');
  PZ.lead('finch'); await PZ.walk('ll dddd'); await PZ.F('l'); PZ.chk(!G.flag('es.k3'), 'heavy mirror still wrong');
  PZ.lead('runa'); await PZ.walk('u lll'); await PZ.F('l'); PZ.chk(G.flag('es.k3'), 'crystal 3');
  PZ.lead('dask'); await PZ.walk('uuu l lll u ll'); PZ.chk(G.flag('sp.echospire.m'), 'hidden song');
  await PZ.walk('d rrrrrrrrrrr r r'); PZ.chk(PZ.at() === '14,3', 'vault ' + PZ.at());
  PZ.lead('finch'); await PZ.walk('u rr'); await PZ.F('u'); await PZ.walk('l'); await PZ.F('u'); await PZ.walk('l'); await PZ.F('u'); await PZ.walk('r'); await PZ.F('u');
  PZ.chk(G.flag('es.song'), 'song');
  await PZ.walk('r dd'); await PZ.A('r'); PZ.chk(((G.S.feats || {}).finch || []).indexOf('secondverse') >= 0, 'second verse');
""",
'archive': r"""
  await Field.enter('highmoor', null, { noFade: true });
  const way = Field.map.things.find(t => t.def.to === 'archive'); Field.p.x = way.x; Field.p.y = way.y - 1; await PZ.step('d'); await PZ.settle();
  PZ.chk(Field.map.id === 'archive' && PZ.at() === '6,14', 'arrival ' + Field.map.id + ' ' + PZ.at());
  PZ.lead('dask'); await PZ.walk('uuu'); PZ.chk(PZ.at() === '6,14', 'caught and sent back ' + PZ.at());
  await PZ.walk('r uuuuu l u u'); PZ.chk(PZ.at() === '6,7', 'r2 ' + PZ.at());
  PZ.lead('runa'); await PZ.walk('rr u'); PZ.chk(PZ.at() === '8,6', 'shelf moved ' + PZ.at());
  PZ.lead('dask'); await PZ.walk('l u u rrrr'); await PZ.sneak('u', 'd'); await PZ.sneak('u', 'd'); await PZ.sneak('rr', 'l');
  PZ.chk(PZ.at() === '13,2', 'r3 ' + PZ.at());
  await PZ.sneak('d rrrrrrrrrrrrrr ddd', 'l'); PZ.lead('maren'); await PZ.F('l');
  await PZ.sneak('ddd llllll dd', 'u'); await PZ.F('l');
  await PZ.sneak('dd llllllll uuuuuuu', 'd'); await PZ.F('r'); PZ.chk(G.flag('ia.seq'), 'lamps ' + PZ.at());
  await PZ.sneak('ddddddd rrrrrrrrr rrrr', 'l'); await PZ.A('r'); PZ.chk(((G.S.feats || {}).dask || []).indexOf('opportunist') >= 0, 'opportunist ' + PZ.at());
""",
'lampvault': r"""
  await Field.enter('undercroft', null, { noFade: true });
  const way = Field.map.things.find(t => t.def.to === 'lampvault'); Field.p.x = way.x; Field.p.y = way.y - 1; await PZ.step('d'); await PZ.settle();
  PZ.chk(Field.map.id === 'lampvault' && PZ.at() === '2,14', 'arrival ' + Field.map.id + ' ' + PZ.at());
  PZ.lead('dask'); await PZ.walk('u rrrr uu rr dd rr uu'); PZ.chk(G.flag('sp.lampvault.m'), 'mural 1 ' + PZ.at());
  await PZ.walk('ddd rr'); await PZ.F('r'); await PZ.walk('rr'); PZ.chk(PZ.at() === '14,14', 'r2 ' + PZ.at());
  PZ.lead('runa'); await PZ.walk('rrrr'); await PZ.walk('r'); await PZ.walk('d r u'); PZ.chk(G.flag('pzf.lampvault.f') && PZ.at() === '20,14', 'pit filled ' + PZ.at());
  await PZ.walk('uu'); PZ.lead('maren'); await PZ.F('r'); PZ.chk(G.flag('uc.l2'), 'island lamp');
  await PZ.walk('dd lll uuuuuu'); PZ.chk(PZ.at() === '17,8', 'r3 ' + PZ.at());
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
'millrace': r"""
  Object.assign(G.S.flags, { millFree: 1, joined: 1 });
  await Field.enter('mill', null, { noFade: true });
  const way = Field.map.things.find(t => t.def.to === 'millrace');
  Field.p.x = way.x; Field.p.y = way.y - 1; await PZ.step('d'); await PZ.settle();
  PZ.chk(Field.map.id === 'millrace', 'entered millrace via the mill: ' + Field.map.id);
  PZ.chk(PZ.at() === '4,12', 'arrival');
  PZ.lead('maren'); await PZ.walk('ulluu'); PZ.chk(PZ.at() === '2,9', 'r1 spot');
  const m0 = Field.map.things.find(t => t.ch === 'm'); await PZ.walk('r').catch(e => {}); PZ.chk(m0.x === 3, 'maren cannot shove');
  PZ.lead('runa'); await PZ.walk('rrr'); PZ.chk(G.flag('mr.g1'), 'gate 1 open');
  PZ.lead('dask'); await PZ.walk('ll uu'); PZ.chk(PZ.at() === '3,7', 'below secret ' + PZ.at()); await PZ.F('u'); await PZ.walk('uu'); await PZ.A('u');
  PZ.chk(G.flag('o.millrace.e'), 'bonus chest');
  await PZ.walk('dddd'); PZ.chk(PZ.at() === '3,9', 'back ' + PZ.at()); await PZ.walk('d rrrrr u rr'); PZ.chk(PZ.at() === '10,9', 'in r2 ' + PZ.at());
  PZ.lead('dask'); await PZ.walk('rrrrd'); PZ.chk(G.flag('sp.millrace.h'), 'spotted h');
  PZ.lead('runa'); await PZ.walk('llld'); await PZ.walk('rrrr'); PZ.chk(G.flag('mr.dr2'), 'race 2 drained');
  await PZ.walk('uuuuu lll uuuu'); await PZ.walk('rrrr'); PZ.chk(G.flag('mr.g2'), 'gate 2');
  await PZ.walk('d rrr rr'); PZ.chk(PZ.at() === '21,3', 'in r3 ' + PZ.at());
  await PZ.walk('ur rrr'); PZ.chk(G.flag('mr.dr3a'), 'upper race');
  await PZ.walk('ddd l dd'); PZ.lead('dask'); await PZ.walk('ddd'); PZ.chk(G.flag('sp.millrace.b'), 'spotted b');
  PZ.lead('runa'); await PZ.walk('uuul ddd'); PZ.chk(G.flag('mr.dr3b'), 'long race');
  await PZ.walk('rrr d r'); await PZ.A('d'); PZ.chk(((G.S.feats || {}).runa || []).indexOf('thick') >= 0, 'feat thick');
  PZ.chk(G.flag('q.pz_millrace') === 2, 'quest done');
  // reset puts r3 back
  await PZ.walk('uuuu'); await PZ.A('r'); PZ.chk(!G.flag('mr.dr3b') && PZ.at() === '21,3', 'reset r3 ' + PZ.at());
""",
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
  await PZ.walk('lll uuu'); PZ.chk(G.flag('sp.hollowbarrow.r'), 'spotted secret'); await PZ.walk('u'); await PZ.F('u'); await PZ.walk('uu');
  PZ.chk(PZ.at() === '20,7', 'in vault ' + PZ.at());
  PZ.lead('maren'); await PZ.walk('rrrrr u'); await PZ.F('r'); PZ.chk(G.flag('hb.l1'), 'vault lamp');
  PZ.lead('dask'); await PZ.walk('d lllll lllll'); PZ.chk(PZ.at() === '15,7', 'below tomb ' + PZ.at()); await PZ.walk('uu'); await PZ.F('u'); await PZ.walk('uu'); await PZ.A('u');
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
  await PZ.walk('ll dddddddddd dd rrrrrrr rr'); PZ.chk(PZ.at() === '21,14', 'r3 ' + PZ.at());
  await PZ.walk('r u'); await PZ.F('r'); PZ.chk(G.flag('dc.low'), 'low again');
  PZ.lead('runa'); await PZ.walk('d rrr uuuuu'); PZ.chk(G.flag('dc.p'), 'statue on plate');
  await PZ.walk('dddd'); PZ.chk(PZ.at() === '25,13', 'back ' + PZ.at());
  PZ.lead('maren'); await PZ.walk('dd rr'); await PZ.F('r'); PZ.chk(!G.flag('pzl.drownedchapel.8'), 'wrong order snuffs');
  await PZ.walk('lllll'); await PZ.F('l'); await PZ.walk('rrrrr'); await PZ.F('r'); await PZ.walk('lll uuu'); await PZ.F('l'); PZ.chk(G.flag('dc.seq'), 'lamps in order');
  PZ.lead('finch'); await PZ.walk('d'); await PZ.F('l'); PZ.chk(!G.flag('dc.low'), 'flood');
  await PZ.walk('d ll uu uuuuuuuuu rrr u r r'); await PZ.A('r'); PZ.chk(((G.S.feats || {}).maren || []).indexOf('grace') >= 0, 'grace');
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
  await PZ.walk('rrrr u r'); PZ.chk(PZ.at() === '14,6', 'door 2 ' + PZ.at()); await PZ.walk('r u'); PZ.lead('maren'); await PZ.F('u'); PZ.chk(G.flag('sc.l3'), 'grotto lamp');
  PZ.lead('dask'); await PZ.walk('dd rrrrrrrrrrrr d'); PZ.chk(G.flag('sp.seacaves.y'), 'last mural spotted ' + PZ.at());
  PZ.lead('finch'); await PZ.walk('uuuuuu llll'); await PZ.F('u'); await PZ.walk('rrr'); await PZ.F('u'); await PZ.walk('rr'); await PZ.F('u'); await PZ.walk('llllllll'); await PZ.F('u'); await PZ.walk('lll'); await PZ.F('u');
  PZ.chk(G.flag('sc.s3'), 'song 3');
  await PZ.walk('dddddd rrrrrrrrr ddd dd'); PZ.chk(PZ.at() === '26,13', 'ledge ' + PZ.at()); await PZ.A('d'); PZ.chk(G.has('sirenstring'), 'siren-string');
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
            await pg.evaluate(SETUP + HELP + '; void 0')
            body = "(async () => { G.newGame(); G.S.level = 8; G.healAll(); try {\n" + TESTS[n] + "\n  const id0 = Field.map.id, u = Field.map.things.find(t => t.ch === 'u'); Field.p.x = Field.p.tx = u.x; Field.p.y = Field.p.ty = u.y - 1; Puzzle.steps = 1; await PZ.step('d'); await PZ.settle(); PZ.chk(Field.map.id !== id0, 'walked out of ' + id0 + ' (still on ' + Field.map.id + ')');\n return 'ok'; } catch (e) { return 'FAIL ' + (e.stack || e).toString().split('\\n').slice(0, 3).join(' | '); } })()"
            try: r = await asyncio.wait_for(pg.evaluate(body), 120)
            except Exception as e: r = 'TIMEOUT ' + str(e)[:200]
            if r != 'ok' or errs: bad += 1
            print(n, r, errs[:5], flush=True)
            await pg.close()
        await b.close()
        sys.exit(1 if bad else 0)
asyncio.run(main())
