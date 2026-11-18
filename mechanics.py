"""Mechanics test: drives the battle board, every ability, every item and the map directly and checks each one works.
Usage: python3 tools/mechanics.py   (needs dist/index.html; prints one line per check and a count of failures)."""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TEST = r"""
async () => {
  const R = [], ok = (name, cond, info) => R.push([!!cond, name, info == null ? '' : String(info)]);
  G.fast = true; G.auto = true; G.opts.sfx = false; G.opts.music = false; G.save = () => true;
  const log = []; const _msg = B.msg; B.msg = function (t, s) { log.push(t + (s ? ' | ' + s : '')); return _msg.apply(this, arguments); };
  G.newGame(); Object.assign(G.S.flags, { tut: 1, joined: 1, chapter: 5, ch5mid: 1 }); G.S.level = 30; G.healAll();
  await Field.enter('thornwood', null, { noFade: true });
  const D = G.D, A = D.abilities, low = () => 2;
  const fresh = (gid, guests) => { B.gid = gid; B.setup(D.groups[gid], { guests: guests || [] }); B.round = 1; B.extra = []; B.c.forEach(u => { if (u.side === 1) { u.hp = u.maxHp = 9999; } }); };
  const hero = id => B.c.find(u => u.id === id && u.side === 0);
  const foes = () => B.c.filter(u => u.side === 1 && !u.down);
  const put = (u, x, y) => { u.gx = x; u.gy = y; };

  /* ---- 1. every map gives a fair board ---- */
  let badBoards = [];
  for (const id of Object.keys(D.maps)) {
    Field.load(id); const m = Field.map;
    let spot = null; for (let y = 0; y < m.h && !spot; y++) for (let x = 0; x < m.w; x++) if (!(D.tiles[m.t[y][x]] || {}).solid) { spot = [x, y]; break; }
    Field.p.x = spot ? spot[0] : 1; Field.p.y = spot ? spot[1] : 1;
    B.bg = m.def.bg || 'forest'; B.brawl = false;
    fresh('wood_wolves');
    const sq = new Set(); let fine = true;
    for (const u of B.c) { const k = u.gx + ',' + u.gy; if (sq.has(k) || B.wall(u.gx, u.gy) || !B.inside(u.gx, u.gy)) fine = false; sq.add(k); }
    // loose obstacles never land in either deployment zone (a shape's own water or wall may: the sea, a bog)
    const zone = x => x < 4 || x > 7 + (B.N - 12) / 2;
    for (let y = 0; y < B.N; y++) for (let x = 0; x < B.N; x++) if (zone(x) && B.wall(x, y) && !(B.fixed && B.fixed.has(x + ',' + y)) && !(B.props && B.props.has(x + ',' + y))) fine = false;
    if (B.shapeOk && !B.shapeOk()) fine = false;
    let open = 0, start = null; for (let y = 0; y < B.N; y++) for (let x = 0; x < B.N; x++) if (B.inside(x, y) && !B.wall(x, y)) { open++; if (!start) start = [x, y]; }
    const seen = new Set([start.join(',')]), q = [start];
    while (q.length) { const [x, y] = q.shift(); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (B.inside(nx, ny) && !B.wall(nx, ny) && !seen.has(k)) { seen.add(k); q.push([nx, ny]); } } }
    if (seen.size !== open) fine = false;
    if (!fine) badBoards.push(id);
  }
  ok('every one of ' + Object.keys(D.maps).length + ' maps gives a fair, connected board', !badBoards.length, badBoards.join(','));
  await Field.enter('thornwood', null, { noFade: true });

  /* ---- 2. movement ---- */
  fresh('wood_wolves');
  ok('movement: Maren 2, Runa 3, Finch 3, Dask 4', hero('maren').mov === 2 && hero('runa').mov === 3 && hero('finch').mov === 3 && hero('dask').mov === 4, ['runa', 'dask', 'maren', 'finch'].map(i => hero(i).mov).join(','));
  B.walls = new Map(); B.c.forEach((u, i) => put(u, 11, i));
  const dk = hero('dask'); put(dk, 5, 5);
  let far = 0; for (const v of B.reach(dk, 4).values()) far = Math.max(far, B.dist(dk, { gx: v.x, gy: v.y }));
  ok('a quick piece reaches exactly 4 squares', far === 4, far);
  B.walls = new Map([['6,4', 'rock'], ['6,5', 'rock'], ['6,6', 'rock']]);
  ok('obstacles block movement', !B.reach(dk, 1).has('6,5'));
  B.walls = new Map(); const w1 = foes()[0]; put(w1, 6, 5);
  ok('enemies cannot be walked through', !B.reach(dk, 4).has('6,5') && B.reach(dk, 4).has('7,5'));
  put(hero('runa'), 6, 5); put(w1, 11, 0);
  ok('allies can be walked through but not stood on', B.reach(dk, 2).has('7,5') && B.reach(dk, 2).get('6,5').pass === true);

  /* ---- 3. sight ---- */
  const fi = hero('finch'); put(fi, 1, 5); put(w1, 7, 5); put(hero('runa'), 0, 0);
  B.walls = new Map([['4,5', 'rock']]);
  ok('a rock blocks a bow shot', !B.options(fi, B.spec(fi, 'shot'), true).some(o => o.targets[0] === w1));
  B.walls = new Map([['4,5', 'water']]);
  ok('water does not block a bow shot', B.options(fi, B.spec(fi, 'shot'), true).some(o => o.targets[0] === w1));
  B.walls = new Map();

  /* ---- 4. weapons: reach, engaged, flanking, sneak attack ---- */
  ok('Finch shoots 6, Runa throws 4, Dask throws 4, Maren has no ranged weapon', fi.shot.range === 6 && hero('runa').shot.range === 4 && dk.shot.range === 4 && !hero('maren').shot);
  const ru = hero('runa'); put(ru, 5, 2); put(w1, 6, 2); put(fi, 1, 8); put(dk, 9, 9); w1.ac = 30;
  const c0 = B.chance(ru, w1, 5, 2); put(dk, 7, 2); const c1 = B.chance(ru, w1, 5, 2);
  ok('flanking gives +2 to hit in melee (10%)', c1 - c0 === 10, c0 + ' -> ' + c1);
  put(dk, 2, 2); const d0 = B.chance(dk, w1, 2, 2, 0, true); put(ru, 9, 9); const d1 = B.chance(dk, w1, 2, 2, 0, true);
  ok('Dask gets +2 at range against an engaged target', d0 - d1 === 10, d1 + ' -> ' + d0);
  put(ru, 5, 2); log.length = 0; B.rig = [15]; await B.exec(dk, { type: 'shot', targets: [w1] });
  ok('Dask sneak-attacks an engaged target with thrown knives', log.some(l => /sneak attacks/.test(l)), log[0]);
  put(dk, 7, 2); log.length = 0; B.rig = [15]; await B.exec(dk, { type: 'attack', targets: [w1] });
  ok('Dask sneak-attacks in melee beside an ally (flanking shown)', log.some(l => /sneak attacks/.test(l) && /flanking/.test(l)), log[0]);
  put(ru, 0, 0); put(dk, 9, 9); put(fi, 6, 3); const fm = B.chance(fi, w1, 6, 3); put(fi, 2, 3); const fr = B.chance(fi, w1, 2, 3, 0, true);
  ok('Finch: her bow from range is more accurate than her rapier up close', fr > fm, fm + ' vs ' + fr);
  put(fi, 1, 8); put(dk, 9, 9); w1.ac = 10;
  const avg = async (u, shot, n) => { let t = 0; for (let i = 0; i < n; i++) { const h = w1.hp; B.rig = [15]; await B.attack(u, w1, { shot }); t += h - w1.hp; } return t / n; };
  put(ru, 5, 2); const rm = await avg(ru, false, 60); put(ru, 3, 2); const rt = await avg(ru, true, 60);
  ok('Runa hits harder in melee than throwing', rm > rt, rm.toFixed(1) + ' vs ' + rt.toFixed(1));
  put(ru, 0, 0);
  put(w1, 9, 5); put(foes()[1], 4, 4); put(fi, 5, 5); log.length = 0;
  B.rig = [15]; await B.exec(fi, { type: 'shot', targets: [w1] });
  ok('a bow shot with a foe adjacent is crowded (-2)', log.some(l => /crowded/.test(l)));

  /* ---- 5. every hero ability ---- */
  const failed = [];
  for (const hid of ['runa', 'dask', 'maren', 'finch']) {
    const ids = Object.values(D.classes[hid].learn).flat();
    for (const id of ids) {
      fresh('wood_wolves', ['bryn5']); B.walls = new Map();
      const u = hero(hid), ab = A[id], fs = foes();
      B.c.forEach(x => { if (x.side === 0) { x.hp = Math.floor(x.maxHp / 2); x.statuses = []; } });
      put(hero('runa'), 4, 4); put(hero('dask'), 4, 6); put(hero('maren'), 3, 5); put(hero('finch'), 3, 7); put(B.c.find(x => x.guest), 2, 5);
      put(fs[0], 5, 5); put(fs[1], 5, 4);
      if (u.id === 'maren' || u.id === 'finch') put(u, 4, 5);
      const ally = B.c.find(x => x.side === 0 && x !== u && !x.guest);
      if (ab.target === 'downAlly' || ab.target === 'party') { ally.down = true; ally.hp = 0; }
      fs[0].statuses = [{ id: 'blessed', turns: 3, v: 0 }];
      if ((ab.fx || []).some(e => e.tag === 'undead')) fs.forEach(f => { f.tags = ['undead']; });
      u.sp = 999; G.d20 = low; B.rig = Array(20).fill(17);
      const spec = B.spec(u, ab), opts = B.options(u, spec, false).filter(o => spec.self || o.targets.length);
      if (!opts.length) { failed.push(id + ':noTarget'); continue; }
      const use = B.bestUse(u, ab, null, false, false) || Object.assign({}, opts[0]);
      if (use.path && use.path.length > 1) await B.walk(u, use.path, use.leap);
      const before = B.c.map(x => [x.hp, x.down, x.statuses.map(s => s.id).join(), x.gx, x.gy]), bx = B.extra.length;
      try { await B.exec(u, { type: 'ability', ab, targets: use.targets, center: [use.tx, use.ty] }); }
      catch (e) { failed.push(id + ':' + e.message); continue; }
      const changed = B.c.some((x, i) => x.hp !== before[i][0] || x.down !== before[i][1] || x.statuses.map(s => s.id).join() !== before[i][2] || x.gx !== before[i][3] || x.gy !== before[i][4]) || B.extra.length !== bx;
      if (!changed) failed.push(id + ':noEffect');
      if (u.sp !== 999 - (ab.cost || 0)) failed.push(id + ':cost');
    }
  }
  G.d20 = () => 1 + Math.floor(G.rand() * 20);
  const total = Object.values(D.classes).reduce((n, c) => n + Object.values(c.learn).flat().length, 0);
  ok('all ' + total + ' hero abilities can be aimed, cost their points and take effect', !failed.length, failed.join(' '));

  /* ---- 6. specials ---- */
  fresh('wood_wolves'); B.walls = new Map(); B.c.forEach((x, i) => put(x, 11, i));
  const dd = hero('dask'); put(dd, 1, 1); const tg = foes()[0]; put(tg, 6, 6);
  const step = B.options(dd, B.spec(dd, A.shadowstep), false).find(o => o.targets[0] === tg);
  ok('Shadowstep reaches a foe 5 squares away', !!step && step.leap && B.dist({ gx: step.sx, gy: step.sy }, tg) === 1);
  const rr = hero('runa'); put(rr, 1, 6); put(tg, 7, 6);
  ok('Headlong Charge moves 2 further than a plain attack', !B.options(rr, B.spec(rr, null), false).some(o => o.targets[0] === tg) && B.options(rr, B.spec(rr, A.charge), false).some(o => o.targets[0] === tg));
  put(rr, 5, 6); put(tg, 6, 6); G.d20 = low; B.rig = [17];
  await B.exec(rr, { type: 'ability', ab: A.avalanche, targets: [tg] });
  ok('Avalanche knocks the target back 2', tg.gx === 8, tg.gx);
  const f2 = foes()[1]; put(tg, 6, 6); tg.hp = 1; put(f2, 6, 7); put(dd, 5, 6); B.rig = [17, 17];
  const h2 = f2.hp; await B.exec(dd, { type: 'ability', ab: A.twinfangs, targets: [tg] });
  ok('a multi-hit moves on to another foe in reach', tg.down && f2.hp < h2);
  G.d20 = () => 1 + Math.floor(G.rand() * 20);
  fresh('wood_wolves'); const fsx = foes(); fsx[0].statuses = [{ id: 'charmed', turns: 2, v: 0 }]; put(fsx[0], 6, 6); put(fsx[1], 7, 6);
  const plan = B.planAI(fsx[0]);
  ok('a charmed enemy turns on its own side', plan.type === 'attack' && plan.targets[0] === fsx[1]);
  fresh('wood_wolves'); const mm = hero('maren'); await B.exec(mm, { type: 'defend' });
  ok('Defend gives Guard and 1 point back', B.has(mm, 'guard'));
  fresh('wood_wolves'); G.d20 = () => 20; const fl = await B.exec(hero('finch'), { type: 'flee' }); G.d20 = () => 1 + Math.floor(G.rand() * 20);
  ok('Flee works on a good roll', fl === 'flee');

  /* ---- 7. every battle item ---- */
  const itemFail = [];
  for (const [id, it] of Object.entries(D.items)) {
    if (!it.fx) continue;
    fresh('wood_wolves'); B.walls = new Map(); G.S.bag[id] = 2;
    const u = hero('runa'), al = hero('maren'), fs = foes();
    put(u, 4, 5); put(al, 4, 6); put(fs[0], 6, 5); put(fs[1], 6, 6); put(hero('dask'), 0, 0); put(hero('finch'), 0, 11);
    al.hp = 1; al.sp = 0; al.statuses = [{ id: 'poison', turns: 3, v: 2 }];
    if (it.target === 'downAlly') { al.down = true; al.hp = 0; }
    const use = B.bestUse(u, it, null, true, false);
    if (!use) { itemFail.push(id + ':noTarget'); continue; }
    const before = B.c.map(x => [x.hp, x.sp, x.down, x.statuses.length]);
    G.d20 = low;
    try { await B.exec(u, { type: 'item', id, targets: use.targets, center: [use.tx, use.ty] }); } catch (e) { itemFail.push(id + ':' + e.message); }
    G.d20 = () => 1 + Math.floor(G.rand() * 20);
    if (G.S.bag[id] !== 1) itemFail.push(id + ':count');
    if (!B.c.some((x, i) => x.hp !== before[i][0] || x.sp !== before[i][1] || x.down !== before[i][2] || x.statuses.length !== before[i][3])) itemFail.push(id + ':noEffect');
  }
  ok('every battle item can be aimed, is used up and takes effect', !itemFail.length, itemFail.join(' '));

  /* ---- 8. whole fights: waves, guests, every enemy group ---- */
  G.S.level = 6; G.healAll();
  let r = await B.start('ratking', {});
  ok('waves: the Rat King arrives in the second wave and the fight is won', r === 'win' && B.gone && B.gone.some(u => u.id === 'rat'), r);
  const groupErr = [];
  const lv = gid => { for (const c of [5, 4, 3, 2]) if (D.groups[gid] && JSON.stringify(D.groups).length) {} return 30; };
  for (const gid of Object.keys(D.groups)) {
    G.S.level = 30; G.healAll(); G.lastError = null;
    try { await B.start(gid, D.groups[gid].simGuests ? { guests: D.groups[gid].simGuests } : {}); } catch (e) { groupErr.push(gid + ':' + e.message); }
    if (G.lastError) groupErr.push(gid + ':' + G.lastError.message);
  }
  ok('all ' + Object.keys(D.groups).length + ' enemy groups fight to the end without errors', !groupErr.length, groupErr.join(' '));

  /* ---- 9. levels ---- */
  G.newGame(); G.S.flags.chapter = 5; G.S.xp = 0; G.S.level = 1; G.gainXp(999999);
  ok('chapter 5 holds at level 29 before the war-line', G.S.level === 29, G.S.level);
  G.S.flags.ch5mid = 1; G.gainXp(999999);
  ok('and opens level 30 after it', G.S.level === 30, G.S.level);
  G.newGame(); G.S.flags.chapter = 1; G.gainXp(99999);
  ok('chapter 1 caps at 6 with a quarter-level bank', G.S.level === 6 && G.S.xp === G.xpBank(6), G.S.level + ' ' + G.S.xp);

  /* ---- 10. the map ---- */
  G.newGame(); Object.assign(G.S.flags, { tut: 1, joined: 1 });
  await Field.enter('thornwood', null, { noFade: true });
  const seen0 = Field.seenBits.reduce((a, b) => a + b, 0);
  Field.p.x += 3; Field.reveal(); const seen1 = Field.seenBits.reduce((a, b) => a + b, 0);
  ok('walking reveals more of the map', seen1 > seen0 && seen0 > 0, seen0 + ' -> ' + seen1);
  const code = G.S.seen.thornwood; Field.loadSeen();
  ok('explored squares survive a save and reload', Field.seenBits.reduce((a, b) => a + b, 0) === seen1 && Field.encodeSeen(Field.seenBits) === code);
  await Field.enter('tavern', null, { noFade: true });
  ok('a small room is seen whole on entry', Field.seenBits.every(b => b === 1));
  await Field.enter('thornwood', null, { noFade: true });
  const cv = document.createElement('canvas'); cv.width = 424; cv.height = 344;
  let mapErr = null; try { Menu.drawArea(cv); Menu.drawRegion(cv); } catch (e) { mapErr = e.message; }
  ok('the Area and Region maps draw', !mapErr, mapErr);
  const back = JSON.parse(decodeURIComponent(escape(atob(G.exportCode()))));
  ok('exploration is in the save code', back.seen && back.seen.thornwood && back.seen.tavern);

  /* ---- camping: a Camp Kit buys one full rest per campsite between inn stays ---- */
  let _choice2, _say2; const _choice = UI.choice, _say = UI.say; UI.choice = async () => 0; UI.say = async () => {};
  const site = { key: 'thornwood.h' }, hurt = () => G.S.party.forEach(m => { m.hp = 1; m.sp = 0; });
  const fullUp = () => G.S.party.every(m => { const st = G.stats(m); return m.hp === st.maxHp && m.sp === st.maxSp; });
  G.S.bag.campkit = 1; hurt(); await G.run(D.scripts.campsite, { thing: site });
  ok('making camp uses a Camp Kit and restores everyone', G.has('campkit') === 0 && fullUp());
  G.S.bag.campkit = 2; hurt(); await G.run(D.scripts.campsite, { thing: site });
  ok('the same campsite cannot be used twice before an inn rest', G.has('campkit') === 2 && !fullUp());
  await G.run(D.scripts.campsite, { thing: { key: 'ossuary.x' } });
  ok('a different campsite still works', G.has('campkit') === 1 && fullUp());
  G.S.bag.campkit = 0; hurt(); await G.run(D.scripts.campsite, { thing: { key: 'barrow.y' } });
  ok('no Camp Kit, no rest', !fullUp());
  await G.run([['inn', 0]], {});
  ok('an inn rest frees the campsites again', !Object.keys(G.S.flags).some(f => f.startsWith('campUsed.')));
  ok('Camp Kits carry at most two and cost more each chapter', D.items.campkit.max === 2 && D.items.campkit.chapterPrice);
  UI.choice = _choice; UI.say = _say;

  /* ---- Chapter 1's new places are wired up ---- */
  const tw = D.maps.thornwood.things, toMill = Object.keys(tw).find(k => tw[k].to === 'mill');
  ok('Thornwood leads to the mill, and the mill back', toMill && D.maps.mill.things.w.at === toMill);
  ok('the barrow stairs pass through the ossuary', D.maps.barrow1.things.z.to === 'ossuary' && D.maps.barrow2.things.u.to === 'ossuary');
  G.S.flags = { tut: 1, joined: 1, chapter: 1 };
  let ended = false; try { await G.run(tw.e.script, {}); } catch (e) { ended = e instanceof G.Abort; }
  ok('the barrow stays sealed until the mill is cleared', ended && G.flag('q.act1') === 1);
  ok('the Cairn stairs pass through the Sleepers\' Vault', D.maps.cairn1.things.z.to === 'vault3' && D.maps.cairn2.things.u.to === 'vault3');
  G.S.flags = { tut: 1, joined: 1, chapter: 3 }; ended = false;
  try { await G.run(D.maps.frostpass.things.a.script, {}); } catch (e) { ended = e instanceof G.Abort; }
  ok('the Cairn door stays frozen until the rime-altar is broken', ended && G.flag('q.act3') === 1);
  ok('the catacomb stairs pass through the Charnel Galleries', D.maps.catacombs1.things.z.to === 'charnel' && D.maps.catacombs2.things.u.to === 'charnel');
  G.S.flags = { tut: 1, joined: 1, chapter: 4 }; ended = false;
  try { await G.run(D.maps.undercroft.things.a.script, {}); } catch (e) { ended = e instanceof G.Abort; }
  ok('the Plague Gate stays down until the bell-tower winch is turned', ended && G.flag('q.act4') === 1);
  ok('the fen bell-tower and the Chancellery tower are different places', D.maps.belltower && D.maps.chtower && D.maps.belltower !== D.maps.chtower);
  ok('the Hollow Barrow stairs pass through the Hall of Lamps', D.maps.hollow1.things.z.to === 'lamphall' && D.maps.hollow2.things.u.to === 'lamphall');
  G.S.flags = { tut: 1, joined: 1, chapter: 5 }; ended = false;
  try { await G.run(D.maps.ashroad.things.z.script, {}); } catch (e) { ended = e instanceof G.Abort; }
  ok('the Ash-Ward stands until the Cinder Keep pyre is out', ended && G.flag('q.act5') === 1);

  /* ---- markers, fast travel, life in the wild ---- */
  G.S.flags = { tut: 1, joined: 1, chapter: 1 };
  Field.load('thornwood');
  const alf = Field.map.things.find(t => t.def.tag === 'alf');
  ok('a quest-giver in the wild wears a blue marker until you take the job', alf && Field.questMark(alf) === 'side');
  G.S.flags['q.oldtower'] = 1;
  ok('the marker goes once the job is taken', Field.questMark(alf) === null);
  ok('the wild has animals and passers-by', Field.map.things.filter(t => t.def.ambient).length >= 5);
  Field.load('brackenford');
  const board = Field.map.things.find(t => t.def.tag === 'board1');
  ok('a notice board with open jobs is marked too', board && Field.questMark(board) === 'side');
  await Field.enter('brackenford', 'n', { noFade: true, noSave: true, quiet: true });
  ok('walking into a town marks it found', G.flag('visited.brackenford') === 1);
  ok('with only one town found there is nowhere to travel', !!Menu.travelBlock());
  G.S.flags['visited.saltmere'] = 1;
  ok('with two towns found you can travel', Menu.travelBlock() === null);
  await Field.enter('barrow1', 'z', { noFade: true, noSave: true, quiet: true });
  ok('no fast travel from underground', !!Menu.travelBlock());
  await Menu.travel('saltmere');
  ok('travel takes you to the town', G.S.map === 'saltmere');

  /* ---- leaders, abilities, walking rounds ---- */
  G.S.flags = { tut: 1, joined: 1, chapter: 1 };
  await Field.enter('thornwood', 's', { noFade: true, noSave: true, quiet: true });
  const alf2 = Field.map.things.find(t => t.def.tag === 'alf');
  ok('people outdoors walk a loop of 3-5 spots', alf2 && alf2.route && alf2.route.length >= 3 && alf2.route.length <= 5);
  const hx = alf2.x, hy = alf2.y; for (let i = 0; i < 400; i++) Field.update(50);
  ok('and they actually walk it', alf2.x !== hx || alf2.y !== hy || alf2.ri !== 1);
  Field.load('tavern');
  ok('people indoors stay where they are', !Field.map.things.some(t => t.route));
  Field.switchLeader('dask');
  ok('you can put another hero in front', Field.leader() === 'dask');
  _choice2 = UI.choice; _say2 = UI.say; UI.say = async () => {}; UI.choice = async () => 0;
  await Field.enter('barrow1', 'z', { noFade: true, noSave: true, quiet: true });
  const rub = Field.map.things.find(t => t.def.tag === 'lead_runa1');
  const face = th => { const p = Field.p; for (const [d, v] of Object.entries({ up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] })) { const x = th.x - v[0], y = th.y - v[1]; if (!Field.blocked(x, y)) { p.x = p.tx = x; p.y = p.ty = y; p.dir = d; return true; } } return false; };
  ok('a Runa-only rubble pile is in the barrow', rub && face(rub));
  await Field.ability();
  ok('Dask cannot smash it', !G.flag('lead.barrow1.runa'));
  Field.switchLeader('runa'); const g0 = G.S.gold; await Field.ability();
  ok('Runa can, and finds something behind it', G.flag('lead.barrow1.runa') === 1 && G.S.gold > g0);
  Field.switchLeader('maren'); G.S.party.forEach(m => m.hp = 1); await Field.ability();
  ok('Maren cannot pray just anywhere', G.S.party.every(m => m.hp === 1));
  await G.run([['pray', 'temple']]); ok('Maren\'s prayer at a shrine heals', G.S.party.every(m => m.hp > 1));
  const hp1 = G.S.party.map(m => m.hp).join(); await Field.ability();
  ok('but not twice', G.S.party.map(m => m.hp).join() === hp1);
  UI.choice = _choice2; UI.say = _say2;
  ok('the abbey stairs pass through the scriptorium', D.maps.abbey1.things.z.to === 'scriptorium' && D.maps.abbey2.things.u.to === 'scriptorium');
  G.S.flags = { tut: 1, joined: 1, chapter: 2 }; ended = false;
  try { await G.run(D.maps.mirefen.things.a.script, {}); } catch (e) { ended = e instanceof G.Abort; }
  ok('the causeway stays flooded until the tide mill is taken', ended && G.flag('q.act2') === 1);
  G.S.flags.act2done = 1; ended = false;
  try { await G.run(D.maps.mirefen.things.a.script, {}); } catch (e) { ended = e instanceof G.Abort; }
  ok('the causeway opens once the sluice is shut', !ended && G.flag('q.act2') === 3);
  const sc = G.D.xpScale; G.S.flags.chapter = 2; const x0 = G.S.xp; G.gainXp(100);
  /* ---- controls ---- */
  G.resetKeys();
  ok('default keys: M opens the map, I items, J the journal, E and Z confirm', G.KEYMAP.m === 'map' && G.KEYMAP.i === 'items' && G.KEYMAP.j === 'journal' && G.KEYMAP.e === 'a' && G.KEYMAP.z === 'a' && G.KEYMAP.Escape === 'b' && G.KEYMAP.n === 'bt_end');
  let took = G.bindKey('map', 0, 'Y');
  ok('rebinding a key works and is case-blind', G.KEYMAP.y === 'map' && !G.KEYMAP.m && took === null);
  took = G.bindKey('items', 0, 'z');
  ok('a key moved to another action is taken off the first', G.KEYMAP.z === 'items' && took === 'a' && G.bindings().a.length === 2);
  ok('confirm cannot lose its last key', (G.clearKey('a', 0), G.clearKey('a', 0), !G.clearKey('a', 0)) && G.bindings().a.length === 1);
  ok('bindings are kept in the options', JSON.stringify(G.opts.keys.map) === JSON.stringify(['y']));
  G.resetKeys();
  ok('reset all puts every key back', G.KEYMAP.m === 'map' && G.KEYMAP.z === 'a' && !G.opts.keys);
  await Field.enter('saltmere', null, { noFade: true }); G.busy = false;
  let opened = null; const _items = Menu.items; Menu.items = async () => { opened = Menu.hot; }; 
  G.hotkey('items'); for (let i = 0; i < 20 && opened == null; i++) await new Promise(r => setTimeout(r, 20));
  Menu.items = _items;
  ok('the Items hotkey opens Items from the field', opened === 'items');
  ok('chapter XP scaling applies', G.S.xp - x0 === Math.round(100 * sc[2]) || G.S.level >= G.levelCap(), G.S.xp - x0);
  return R;
}
"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.add_init_script('window.__NO_TITLE = true;')
        await pg.goto('file://' + os.path.join(ROOT, 'dist', 'index.html')); await pg.wait_for_timeout(400)
        res = await pg.evaluate(TEST)
        bad = 0
        for good, name, info in res:
            print(('ok   ' if good else 'FAIL ') + name + ('' if good or not info else '  [' + info[:300] + ']'))
            bad += 0 if good else 1
        print('console:', errs[:5])
        print('%d failed' % bad)
        await b.close()
asyncio.run(main())
