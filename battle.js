/* Battle: turn-based, d20 to hit against AC, saves against 10 + Power.
   Abilities and items are lists of effects (see B.fx); enemies use the same ones. */
const B = G.battle = { c: [], active: null, cursor: null, floats: [], bg: 'forest', lastT: 0 };

/* ---------- entry points ---------- */
B.start = async function (groupId, o) {
  o = o || {};
  const grp = G.D.groups[groupId]; B.gid = groupId;
  if (!grp) { console.error('No enemy group: ' + groupId); return 'win'; }
  B.gid = groupId;
  B.opening = o.opening || B.nextOpening || null; B.nextOpening = null;
  // a few lines before some side-boss fights, the first time only
  const scene = (G.D.bossScenes || {})[groupId];
  if (scene && !G.flag('bs.' + groupId) && !G.auto) { G.setFlag('bs.' + groupId); await G.run(scene, {}); }
  const snap = JSON.stringify(G.S);
  for (;;) {
    const res = await B.run(grp, o);
    if (res !== 'lose') return res;
    G.S = JSON.parse(snap);
    if (G.auto) return 'lose';
    if (grp.retryOnly) { o = Object.assign({}, o, { noGuide: true }); await UI.say(null, grp.retryText || 'Back on your feet. Again!'); continue; }
    const pick = await UI.choice(null, 'The party has fallen.', ['Try the fight again', 'Retreat to your last rest']);
    if (pick === 0) continue;
    G.S.gold = Math.floor(G.S.gold * 0.9); G.healAll();
    const r = G.S.respawn;
    await Field.enter(r.map, r.at || { x: r.x, y: r.y }, { dir: 'down' });
    await UI.say(null, 'You come to under a familiar roof, bruised and a little poorer.');
    throw new G.Abort();
  }
};

B.setup = function (grp, o) {
  B.zoomFlip = null; B.cam = { z: B.zoomOn() ? B.CAM_Z : 1, x: 160, y: 120 }; B.inspected = null; G.S.blog = []; B.round = 0;
  B.c = []; B.floats = []; B.cursor = null; B.active = null; B.parts = []; B.bondNotes = []; B.bondSeen = {}; B.bubbles = []; B.lastQuip = -1e9;
  B.boss = !!(grp.boss || o.boss);
  B.brawl = !!grp.brawl; B.rig = []; B.pendingAfter = null;
  B.guide = (grp.guide && !o.noGuide && !G.auto) ? grp.guide.slice() : null;
  B.bg = grp.bg || (Field.map && Field.map.def.bg) || 'forest';
  G.S.party.forEach((m, i) => {
    const st = G.stats(m);
    B.c.push({
      side: 0, id: m.id, name: st.name, m, st, hp: m.hp, maxHp: st.maxHp, sp: m.sp, maxSp: st.maxSp,
      ac: st.ac, atk: st.atk, dmg: st.dmg, dmgBonus: st.dmgBonus, pow: st.pow, save: st.save, spd: st.spd,
      sneak: st.sneak, critMin: st.critMin, abilities: st.abilities, statuses: [], tags: [], immune: [], down: m.hp <= 0, shot: st.shot, melee: st.melee, engage: st.engage, perks: st.perks,
      sprite: st.sprite, scale: 2, px: 74 - i * 9, py: 74 + i * 25, hitBy: []
    });
  });
  // guests: allies who fight on their own (o.guests = [ids from D.guests])
  (o.guests || []).forEach((gid, i) => {
    const d = G.D.guests[gid];
    B.c.push({
      side: 0, guest: true, id: gid, name: d.name, def: d, hp: d.hp, maxHp: d.hp, sp: 99, maxSp: 99, ac: d.ac, atk: d.atk, dmg: d.dmg, dmgBonus: 0,
      pow: d.pow || 0, save: d.save || 0, spd: d.spd || 0, sneak: 0, statuses: [], tags: [], immune: [], moves: d.moves || [[1, 'attack']],
      down: false, sprite: d.sprite, scale: 2, px: 23, py: 112 + i * 30, hitBy: []
    });
  });
  // aura: [{ if, id, turns, v, text }] on a map gives the party a status at the start of every fight there
  B.auraText = null;
  ((Field.map && Field.map.def.aura) || []).forEach(a => {
    if (!G.cond(a.if)) return;
    B.c.forEach(c => { if (!c.down) B.addStatus(c, a.id, a.turns, a.v); });
    B.auraText = a.text;
  });
  // Larger fights can come in waves: grp.waves lists the groups that follow grp.enemies, one after another.
  B.waves = (grp.waves || []).map(w => w.slice()); B.gone = []; B.waveNo = 1; B.waveText = grp.waveText;
  B.vfx = []; B.shakeT = 0;
  B.boardGrp = grp;
  B.makeBoard(B.gid);
  B.deploy();
  B.spawn(grp.enemies, false);
  B.grp = grp; B.phase2 = false; B.lateSaid = false; B.objNote = null;
  B.objective = grp.objective || null;
  B.bossUnit = B.boss ? B.c.filter(x => x.side === 1).sort((p, q) => q.maxHp - p.maxHp)[0] : null;
  // the heroes' exploring moves, once a fight each
  if (!B.brawl) B.c.forEach(c => { const mv = { runa: 'shove', dask: 'pellet', maren: 'flare', finch: 'hush' }[c.side === 0 && !c.guest && c.id]; if (mv && c.abilities.indexOf(mv) < 0) c.abilities = c.abilities.concat([mv]); c.usedOnce = {}; });
  B.clearUnderfoot();
  B.applyOpening(grp);
};
// Puts a wave of enemies on the right-hand side of the field.
B.spawn = function (ids, entering) {
  const n = ids.length, count = {}, seen = {};
  ids.forEach(id => { count[id] = (count[id] || 0) + 1; });
  const SLOTS = {
    1: [[244, 120]], 2: [[250, 94], [250, 143]], 3: [[220, 119], [268, 94], [268, 143]],
    4: [[218, 94], [218, 143], [270, 94], [270, 143]], 5: [[218, 94], [218, 143], [270, 94], [270, 143], [174, 119]]
  }[Math.min(5, n)];
  ids.slice(0, 5).forEach((id, i) => {
    const d = G.D.enemies[id]; seen[id] = (seen[id] || 0) + 1;
    G.S.foes = G.S.foes || {}; if (!(id in G.S.foes)) G.S.foes[id] = 0;
    const u = {
      side: 1, id, name: d.name + (count[id] > 1 ? ' ' + 'ABCDE'[seen[id] - 1] : ''), def: d,
      // a foe trimmed for ordinary fights keeps its old health beside a boss (bossHp), so boss fights stay as built
      hp: Math.round((B.boss && d.bossHp || d.hp) * B.diff().hp), maxHp: Math.round((B.boss && d.bossHp || d.hp) * B.diff().hp), sp: 99, maxSp: 99, ac: d.ac, atk: d.atk, dmg: d.dmg, dmgBonus: 0,
      pow: d.pow || 0, save: d.save || 0, spd: d.spd || 0, sneak: 0, statuses: [], tags: d.tags || [], immune: d.immune || [],
      moves: d.moves || [[1, 'attack']], down: false, sprite: d.sprite, scale: d.scale || 3,
      px: SLOTS[i][0], py: SLOTS[i][1], hitBy: [],
      fx: entering ? { k: 'enter', t: G.time } : null
    };
    B.c.push(u); B.placeFoe(u, entering);
  });
};
// Called whenever the field might be clear: brings on the next wave if there is one.
B.check = async function () {
  let r = B.over();
  if (r === 'win' && B.waves && B.waves.length) {
    const ids = B.waves.shift(); B.waveNo++;
    B.gone = B.gone.concat(B.c.filter(c => c.side === 1)); B.c = B.c.filter(c => c.side !== 1);
    B.spawn(ids, true); G.audio.sfx('encounter'); B.refresh();
    await B.msg(B.waveText && B.waveText[B.waveNo - 2] || (B.waves.length ? 'Another wave comes on!' : 'The last of them charge in!'), 'Wave ' + B.waveNo + ' of ' + (B.waveNo + B.waves.length) + '.');
    r = null;
  }
  return r;
};

B.run = async function (grp, o) {
  const prevMusic = G.audio.current();
  B.setup(grp, o);
  G.audio.sfx('encounter');
  await UI.fade(true, 170);
  G.scene = 'battle'; G.scenePress = null;
  B.fitRes();
  B.buildUI();
  G.audio.music(grp.music || (B.boss ? 'boss' : 'battle'));
  await UI.fade(false, 170);
  await B.msg(grp.intro || B.introText());
  if (B.auraText) { B.refresh(); await B.msg(B.auraText); }
  if (B.c.some(c => c.side === 0 && !c.down && B.perk(c, 'lantern'))) {
    B.c.forEach(c => { if (c.side === 0 && !c.down) B.addStatus(c, 'blessed', 3); }); B.refresh();
    await B.msg("Brother's Lantern burns up bright. The party is Blessed.");
  }
  if (G.flag('inspireNext') && !B.brawl) {                       // the last of Finch's crowd still singing in their heads
    G.setFlag('inspireNext', 0); B.c.forEach(c => { if (c.side === 0 && !c.down) B.addStatus(c, 'inspired', 9); }); B.refresh();
    await B.msg("Finch's last song is still going round everyone's head. The party is Inspired.");
  }
  if (G.flag('blessNext') && !B.brawl) {                         // a way-lamp Maren lit on the road
    G.setFlag('blessNext', 0); B.c.forEach(c => { if (c.side === 0 && !c.down) B.addStatus(c, 'blessed', 3); }); B.refresh();
    await B.msg("The way-lamp's light is still on you. The party is Blessed.");
  }
  // Level and initiative: +2 to the party's rolls for each level it stands above the fight's level (up to +6), and -2
  // for each below the lowest level it is ever met at, so a seasoned party usually moves first against weak foes and
  // a green one usually last against strong. Ordinary progress through the game sits between the two and gets neither.
  { const hi = G.groupLevel(B.gid) || G.mapLevel(G.S.map), lo = (((G.D.fightLevels || {}).low || {})[B.gid]) || hi, L = G.S.level;
    B.initBonus = !hi || B.brawl ? 0 : L > hi ? Math.min(6, 2 * (L - hi)) : L < lo ? Math.max(-6, -2 * (lo - L)) : 0; }
  if (B.initBonus >= 4) await B.msg('These foes are well beneath you.', 'The party is quick off the mark: +' + B.initBonus + ' to initiative.');
  else if (B.initBonus <= -4) await B.msg('These foes outclass you.', 'They are quicker off the mark: ' + B.initBonus + ' to your initiative.');
  if (B.opening === 'ambush') await B.msg('You catch them unawares!', 'Your side moves first this round.');
  else if (B.opening === 'surprised') await B.msg('Ambush! They were on you before you saw them.', 'Their side moves first, and some are behind you.');
  if (B.objective) await B.msg(B.objective.text, 'Objective.', true);
  if (B.guide && grp.guideIntro) await B.msg(grp.guideIntro[0], grp.guideIntro[1], true);
  for (const g of B.c.filter(x => x.guest)) await B.msg(g.def.joinText || g.name + ' fights beside you.', 'Allies act on their own.', !!B.guide);
  let result = null, round = 0;
  while (!result) {
    round++; B.round = round;
    if (!G.fast && !G.auto) {                                          // a name plate for a boss, then "Round 2", "Round 3"...
      if (round === 1 && B.boss) { const bo = B.c.filter(x => x.side === 1).sort((p, q) => q.maxHp - p.maxHp)[0]; if (bo) { B.banner = { text: bo.name, sub: 'Boss', boss: true, t0: G.time, dur: 1700 }; await G.sleep(1650); } }
      else if (round > 1) { B.banner = { text: 'Round ' + round, sub: B.objNote || null, t0: G.time, dur: 760 }; await G.sleep(700); }
    }
    if (round === 1) B.quipAny(B.boss ? 'boss' : 'start');
    result = await B.objectiveRound(round); if (result) break;
    // Initiative is rolled once a fight (a d20 plus speed; ties split at random) and kept, as at the table. Anyone who
    // joins later (reinforcements, a boss's summons, waves) rolls when they first appear and takes their place.
    for (const x of B.c) if (x.init == null) x.init = G.d20() + x.spd + (x.side === 0 ? B.initBonus || 0 : 0) + G.rand() * 0.5;
    let order = B.c.filter(x => !x.down).sort((a, b) => b.init - a.init);
    if (round === 1 && grp.guide && !G.auto) {                       // tutorial: the party goes first, in the guide's order
      const party = B.c.filter(x => x.side === 0 && !x.guest);
      order = party.concat(B.c.filter(x => x.guest), B.c.filter(x => x.side === 1));
    }
    if (round === 1 && B.opening) {                                    // who saw whom first
      const first = B.opening === 'ambush' ? 0 : 1;
      order = order.filter(x => x.side === first).concat(order.filter(x => x.side !== first));
    }
    B.order = order;
    for (const [ti, c] of order.entries()) {
      result = await B.check(); if (result) break;
      if (c.down || B.c.indexOf(c) < 0) continue;
      B.turnIdx = ti; B.active = c; B.refresh();
      if (c.side === 0 && (round > 1 || ti > 0)) B.quip(c, 'turn');
      const skip = await B.turnStart(c);
      result = await B.check(); if (result) break;
      if (c.down || skip) continue;
      const r = c.side === 0 && !c.guest && !G.auto ? await B.playerTurn(c) : await B.aiTurn(c);
      if (B.pendingAfter) { const a = B.pendingAfter; B.pendingAfter = null; B.refresh(); await B.msg(a[0], a[1], true); }
      while (B.extra && B.extra.length && !B.over()) {                // Encore turns
        const x = B.extra.shift(); if (x.down) continue;
        B.active = x; B.refresh();
        if (x.side === 0 && !x.guest && !G.auto) await B.playerTurn(x); else await B.aiTurn(x);
      }
      if (r === 'flee') { B.quipAny('flee'); result = 'flee'; break; }
      B.refresh();
    }
    B.roundEnd();
    if (!result) result = await B.check();
    if (!result && round > 150) result = 'lose';
  }
  B.active = null; B.cursor = null;
  B.c.forEach(c => { if (c.side === 0 && c.m) { c.m.hp = c.down ? 1 : Math.max(1, c.hp); c.m.sp = c.sp; } });
  B.rounds = round;
  if (result === 'win') await B.victory(grp);
  else if (result === 'lose') { G.audio.music(null); G.audio.sfx('lose'); await B.msg('The party is defeated...', null, true); }
  else { G.audio.sfx('cancel'); await B.msg('The party gets away.'); }
  await UI.fade(true, 170);
  B.clearUI(); G.scene = 'field'; G.scenePress = Field.press;
  if (G.cv) { G.cv.width = 320; G.cv.height = 240; G.cv.classList.remove('smooth'); }
  G.audio.music(prevMusic);
  await UI.fade(false, 170);
  return result;
};

B.introText = function () {
  const foes = B.c.filter(c => c.side === 1);
  if (foes.length === 1) return foes[0].name + ' blocks the way!';
  const kinds = [...new Set(foes.map(f => f.def.name))];
  return kinds.length === 1 ? foes.length + ' ' + (foes[0].def.plural || foes[0].def.name + 's') + ' attack!' : 'Enemies attack!';
};
B.over = function () {
  if (B.c.filter(c => c.side === 0 && !c.guest).every(c => c.down)) return 'lose';
  if (B.c.filter(c => c.side === 1).every(c => c.down)) return 'win';
  return null;
};
B.victory = async function (grp) {
  G.audio.music(null); G.audio.sfx('win'); B.quipAny('win');
  let xp = 0, gold = grp.gold || 0; const loot = {};
  B.c.filter(c => c.side === 1).concat(B.gone || []).forEach(e => {
    if (e.noXp) return;
    xp += e.def.xp || 0;
    if (e.def.gold) gold += G.ri(e.def.gold[0], e.def.gold[1]);
    (e.def.loot || []).forEach(l => { if (G.rand() < l[1]) loot[l[0]] = (loot[l[0]] || 0) + 1; });
  });
  if (grp.xpMul) xp = Math.round(xp * grp.xpMul);     // some story fights pay less, so side content still matters
  const share = G.xpFor(G.groupLevel(B.gid) || G.mapLevel(G.S.map)); xp = Math.round(xp * share);   // a fight below the party pays less
  G.S.gold += gold;
  const sp = B.spoils(grp);
  for (const id in sp.out) loot[id] = (loot[id] || 0) + sp.out[id];
  const got = Object.keys(loot).filter(id => !sp.rare.includes(id)).map(id => { G.give(id, loot[id]); return G.D.items[id].name + (loot[id] > 1 ? ' ×' + loot[id] : ''); });
  for (const id of sp.rare) G.give(id, 1);
  const lines = G.gainXp(xp);
  B.lastXp = G.xpGained;
  const parts = [G.xpGained ? '+' + G.xpGained + ' XP' : '', gold ? '+' + gold + ' gold' : ''].filter(Boolean);
  const pr = G.xpProgress();
  const where = (!xp ? '' : pr.capped ? 'Level ' + G.S.level + '.' : pr.pct + '% of the way to level ' + pr.next + '.') + (share < 1 && xp ? ' An easy fight for the party now: ' + (share >= 0.5 ? 'half' : share >= 0.25 ? 'a quarter of the' : 'little') + ' experience.' : '');
  const sub = [where, got.length ? 'Found: ' + got.join(', ') + '.' : ''].filter(Boolean).join(' ');
  await B.msg('Victory!' + (parts.length ? ' ' + parts.join(', ') + '.' : ''), sub || null, true);
  for (const id of sp.rare) {
    const it = G.D.items[id], who = (it.for || []).map(h => G.D.classes[h].name).join(', ');
    G.audio.sfx('level');
    const up = G.S.party.some(m => { const c = Menu.compare(m, id); return c && !c.same && c.score > 0; });
    await B.msg('A rare find: ' + it.name + '!', (who ? 'For ' + who + '. ' : 'A charm anyone can wear. ') + (up ? 'It would be an upgrade.' : 'Compare and equip it from the Gear menu.'), true);
    if (up && !G.fast && !G.auto) { await Menu.offerEquip(id); if (Menu.descEl) { Menu.descEl.remove(); Menu.descEl = null; } }   // put it on now, if it is better
  }
  if (B.bondNotes && B.bondNotes.length) await B.msg(B.bondNotes.join(' '), null, true);
  if (!B.brawl) { const pu = G.patchUp(); if (pu.length) { B.refreshFromState(); await B.msg(pu.join(', ') + ' patch each other up.', 'Friends heal a little after a fight.'); } }
  for (const line of lines) { G.audio.sfx('level'); B.refreshFromState(); await B.msg(line, null, true); }
};

// Spoils (data/ch9_world/r_loot.js): supplies now and then, rarely a piece of found gear, more often at the level
// cap. Returns { out: { id: count }, rare: [found gear ids] }.
B.spoils = function (grp) {
  const T = G.D.spoils, out = {}, rare = [];
  const foes = B.c.filter(c => c.side === 1).concat(B.gone || []).filter(e => !e.noXp);
  if (!T || B.brawl || grp.noLoot || grp.xpMul === 0 || !foes.length) return { out, rare };
  const easy = G.S.level >= G.levelCap() || G.xpFor(G.groupLevel(B.gid) || G.mapLevel(G.S.map)) < 1;   // when experience runs thin, spoils run thicker
  const ch = Math.min(5, Math.max(1, G.flag('chapter') || 1)), mul = easy ? T.capMul : 1, heal = T.heal[ch];
  const add = (id, n) => { out[id] = (out[id] || 0) + (n || 1); };
  if (B.boss || G.rand() < (foes.length >= 4 ? T.healBig : T.healP) * mul) add(heal);
  if (B.boss && G.rand() < 0.5) add(heal);
  if (G.rand() < (B.boss ? 0.5 : T.tonicP * mul)) add('tonic');
  const own = id => G.has(id) || G.S.party.some(m => Object.values(m.gear || {}).includes(id));
  const pool = (T.found[ch] || []).filter(id => !own(id));
  G.S.dry = (G.S.dry || 0) + 1;
  if (pool.length && (G.S.dry >= T.dry || G.rand() < (B.boss ? T.gearBoss : T.gearP) * mul)) { const id = G.pick(pool); add(id); rare.push(id); G.S.dry = 0; }
  return { out, rare };
};

/* ---------- statuses ---------- */
B.has = (c, id) => c.statuses.some(s => s.id === id);
// Difficulty (Options): enemy health and the damage the party takes.
B.DIFF = { easy: { hp: 0.75, dmg: 0.75, name: 'Easy' }, normal: { hp: 1, dmg: 1, name: 'Normal' }, hard: { hp: 1.2, dmg: 1.15, name: 'Hard' } };
B.diff = () => B.DIFF[G.opts.diff] || B.DIFF.normal;
B.scaleIn = (t, dmg) => (t.side === 0 && !t.guest && dmg > 0) ? Math.max(1, Math.round(dmg * B.diff().dmg)) : dmg;
B.perk = (c, id) => !!(c && c.perks && c.perks.indexOf(id) >= 0);
// Second Verse: Finch's first song in a fight costs nothing.
B.cost = (c, ab) => (B.perk(c, 'secondverse') && !c.freeSong && c.id === 'finch') ? 0 : (ab.cost || 0);
B.addStatus = function (c, id, turns, v) {
  if (c.immune.indexOf(id) >= 0) return false;
  if (!G.D.statuses[id].good && B.has(c, 'lampward')) return false;   // Ward of Lamps
  c.statuses = c.statuses.filter(s => s.id !== id);
  c.statuses.push({ id, turns: turns || 1, v: v || 0 });
  return true;
};
B.mod = function (c, key) {
  let t = 0;
  for (const s of c.statuses) { const d = G.D.statuses[s.id]; if (d.mods && d.mods[key]) t += d.mods[key]; if (d.vmods && d.vmods[key]) t += d.vmods[key] * s.v; }
  return t;
};
B.exposed = c => c.statuses.some(s => G.D.statuses[s.id].exposed);
// Start of a combatant's turn: poison and regen tick, sleep and stun skip, durations count down.
B.turnStart = async function (c) {
  if (B.ter(c.gx, c.gy) === 'fire') { await B.burn(c, ' burns'); if (c.down) return true; }
  if (B.ter(c.gx, c.gy) === 'hallowed') { await B.hallow(c); if (c.down) return true; }
  for (const s of c.statuses.slice()) {
    if (s.id === 'poison') { await B.hurt(c, s.v, { kind: 'poison', text: c.name + ' takes ' + s.v + ' poison damage.' }); if (c.down) return true; }
    if (s.id === 'regen' && c.hp < c.maxHp) { const n = Math.min(s.v, c.maxHp - c.hp); c.hp += n; B.float(c, '+' + n, null, 'heal'); B.refresh(); }
  }
  let skip = false;
  if (B.has(c, 'asleep')) { skip = true; await B.msg(c.name + ' is asleep.'); }
  else if (B.has(c, 'stunned')) { skip = true; await B.msg(c.name + ' cannot act.'); }
  c.statuses.forEach(s => { s.turns--; });
  c.statuses = c.statuses.filter(s => s.turns > 0);
  if (!B.has(c, 'hidden')) c.ambush = c.ambush && c.side === 0 ? c.ambush : false;
  B.refresh();
  return skip;
};

/* ---------- rolls ---------- */
B.foes = c => B.c.filter(x => x.side !== c.side && !x.down);
B.allies = c => B.c.filter(x => x.side === c.side && !x.down);
B.save = function (target, caster, dc) {      // true = the target resists
  const d = G.d20();
  return d === 20 || (d !== 1 && d + target.save + B.mod(target, 'save') >= (dc || 10 + caster.pow));
};
B.attack = async function (user, target, o) {
  o = o || {};
  const reach = o.shot && user.shot ? user.shot.range : o.reach || B.attackRange(user);
  if (!target || target.down || (user.side === 1 && target.side === 1 && !B.has(user, 'charmed'))) {
    // a multi-hit moves on to another foe in reach when the first one falls
    const pool = B.foes(user).filter(t => !B.has(t, 'hidden') && B.dist(user, t) <= reach && (reach <= 1 || B.los(user, t)));
    target = pool.sort((a, b) => a.hp - b.hp)[0]; if (!target) return false;
  }
  if (target.gx !== user.gx) user.face = target.gx > user.gx ? 1 : -1;
  if (target.gx !== user.gx || target.gy !== user.gy) user.fdir = [Math.sign(target.gx - user.gx), Math.sign(target.gy - user.gy)];
  const d = B.rig.length ? B.rig.shift() : G.d20(), helpless = B.has(target, 'asleep') || B.has(target, 'stunned');
  // Engaged: the target already has one of the attacker's allies beside it. In melee that is flanking (+2 to hit);
  // the rogue gets the +2 at any range, and his Sneak Attack works on any engaged target.
  const melee = B.dist(user, target) <= 1, engaged = B.flanked(user, target, user.gx, user.gy), flank = engaged && (melee || user.engage);
  const crowded = !melee && B.c.some(x => B.living(x) && x.side !== user.side && B.dist(x, user) <= 1);
  const prof = o.shot ? user.shot : melee ? user.melee : null;
  let bonus = user.atk + B.mod(user, 'atk') + (o.atkMod || 0) + (helpless ? 4 : 0) + (flank ? 2 : 0) - (crowded ? 2 : 0) + (prof ? prof.atk || 0 : 0), insp = 0;
  if (B.has(user, 'inspired')) { insp = G.roll('1d6'); bonus += insp; user.statuses = user.statuses.filter(s => s.id !== 'inspired'); }
  const tm = B.terrainMod(user, target, user.gx, user.gy, !melee); bonus += tm.bonus;
  const bh = B.bondHit(user, user.gx, user.gy), ba = B.bondAc(target); bonus += bh.bonus; if (bh.note) tm.notes.push(bh.note); if (ba.note) tm.notes.push(ba.note);
  const ac = target.ac + B.mod(target, 'ac') + ba.bonus;
  const ambush = !!user.ambush; user.ambush = false;
  const crit = d >= (user.critMin || 20) || ambush, hit = crit || (d !== 1 && d + bonus >= ac);
  const rollTxt = 'd20: ' + d + (bonus >= 0 ? ' + ' : ' - ') + Math.abs(bonus) + ' = ' + (d + bonus) + ' vs AC ' + ac + (flank ? ' (flanking +2)' : '') + (crowded ? ' (crowded -2)' : '') + tm.notes.map(n => ' (' + n + ')').join('');
  const style = o.shot && user.shot ? user.shot.style : B.hitStyle(user);
  user.fx = { k: B.RANGED[style] ? 'cast' : 'lunge', t: G.time, dx: Math.sign(target.gx - user.gx), dy: Math.sign(target.gy - user.gy) };
  if (B.RANGED[style]) { const d = B.pace(260); B.addVfx({ k: 'proj', shape: style, from: user, to: target, dur: d }); await G.sleep(d); }
  else await G.sleep(B.pace(140));
  if (hit) B.addVfx({ k: 'strike', style, to: target, crit, flip: user.side === 1 });
  else B.addVfx({ k: 'whiff', to: target, flip: user.side === 1 });
  if (crit) { B.shakeT = G.time; B.punch = { t: G.time, o: target }; }
  if (!hit) {
    G.audio.sfx('miss'); B.float(target, 'Miss', '#c9d2e8'); if (user.side === 0) B.quip(user, 'miss', target);
    await B.msg(user.name + ' attacks ' + target.name + ' and misses.', rollTxt, false, 0, true); B.eventSeq++;
    return false;
  }
  let dmg = G.roll(user.dmg, crit) + user.dmgBonus + B.mod(user, 'dmg') + insp + (prof ? prof.dmg || 0 : 0);
  if (o.bonusDice) dmg += G.roll(o.bonusDice, crit);
  let sneak = false;
  const first = B.perk(user, 'firstsneak') && !user.firstDone; user.firstDone = true;
  if (user.sneak && (first || ambush || helpless || B.exposed(target) || engaged || (B.perk(user, 'opportunist') && target.hp * 2 < target.maxHp))) { sneak = true; dmg += G.roll((user.sneak + (engaged && melee ? 1 : 0) + (first ? 1 : 0)) + 'd6', crit); }
  dmg = Math.max(1, dmg - B.mod(target, 'dr') - (B.perk(target, 'frostbound') ? 1 : 0));
  dmg = B.scaleIn(target, dmg);
  if (o.shot && user.shot) user.lastShot = user.shot.name;
  if (user.side === 0 && target.hitBy.indexOf(user.id) < 0) target.hitBy.push(user.id);
  if (o.shot && B.perk(user, 'sirenshot') && !user.sirenDone) {
    user.sirenDone = true; const pal = B.allies(user).filter(a => a !== user).sort((a, b) => B.dist(a, user) - B.dist(b, user))[0];
    if (pal) B.pendingSiren = pal;
  }
  await B.hurt(target, dmg, {
    crit, routine: !crit, text: (crit ? 'Critical hit! ' : '') + user.name + (sneak ? ' sneak attacks ' : ' hits ') + target.name + ' for ' + dmg + '.', sub: rollTxt
  });
  if (user.side === 0 && !target.down) B.quip(user, crit ? 'crit' : 'hit', target);
  if (B.pendingSiren) { const pal = B.pendingSiren; B.pendingSiren = null; B.addStatus(pal, 'inspired', 9); B.refresh(); await B.msg('The siren-string hums. ' + pal.name + ' is Inspired.'); }
  if (o.steal && !target.robbed && target.side === 1) {
    target.robbed = true; const g = G.ri(4, 9) + G.S.level; G.S.gold += g; G.audio.sfx('coin');
    await B.msg(user.name + ' lifts ' + g + ' gold in the scuffle.');
  }
  if (o.push && !target.down && B.push(target, user, o.push)) await B.msg(target.name + ' is knocked back.');
  if (o.onHit && !target.down) {
    const h = o.onHit;
    if (h.save && B.save(target, user)) await B.msg(target.name + ' shrugs off the ' + G.D.statuses[h.id].name.toLowerCase() + '.');
    else if (B.addStatus(target, h.id, h.turns, h.v)) { G.audio.sfx('debuff'); await B.msg(target.name + ' is ' + G.D.statuses[h.id].name.toLowerCase() + '.'); }
  }
  return true;
};
B.hurt = async function (t, dmg, o) {
  o = o || {}; B.eventSeq++;
  let held = false;
  if (dmg > 0 && t.side === 0 && B.perk(t, 'thick') && !t.thickUsed) { t.thickUsed = true; dmg = Math.ceil(dmg / 2); B.float(t, 'Thick-skinned', '#ffd24a'); }
  if (t.hp - dmg <= 0 && B.has(t, 'unbroken')) { dmg = Math.max(0, t.hp - 1); held = true; t.statuses = t.statuses.filter(s => s.id !== 'unbroken'); }
  t.hp = Math.max(0, t.hp - dmg);
  t.fx = { k: 'hit', t: G.time };
  if (t.px != null && B.spark) { const cc = B.center(t); B.spark(cc.x, cc.y, o.crit ? '#ffe07a' : t.tags && t.tags.indexOf('undead') >= 0 ? '#c8d8ff' : '#ffb08a', o.crit ? 16 : 9, o.crit ? 70 : 45, 420, 60); if (o.crit) B.flashT = G.time; }
  G.audio.sfx(o.crit ? 'crit' : 'hit');
  B.float(t, '-' + dmg, null, o.crit ? 'crit' : o.kind || 'hit');
  if (B.has(t, 'asleep')) t.statuses = t.statuses.filter(s => s.id !== 'asleep');
  if (t.hp <= 0) { t.down = true; t.statuses = []; t.downT = G.time; if (!B.punch) B.punch = { t: G.time, o: t }; if (t.side === 1) { t.gone = true; if (G.S.foes && t.id in G.S.foes) G.S.foes[t.id]++; } if (t.px != null && B.spark) B.spark(t.px, t.py - 2, '#8a7a6a', 14, 30, 650, -10); }
  B.refresh();
  if (o.text) await B.msg(o.text, o.sub, false, 0, o.routine);
  if (held) { B.float(t, 'Unbroken!', '#ffd24a'); await B.msg(t.name + ' refuses to fall.'); }
  if (t.side === 1 && t.down && B.active && B.active.side === 0) B.quip(B.active, 'kill', t);
  else if (t.side === 0 && t.down) B.quipAny('allyDown', t, t, t);
  else if (t.side === 0 && dmg > 0 && B.active && B.active.side === 1) B.quip(t, t.hp < t.maxHp * 0.3 ? 'low' : 'hurt', B.active);
  if (t.down) { G.audio.sfx('down'); await B.msg(t.side === 0 ? t.name + (B.brawl ? ' is knocked flat!' : ' falls!') : t.name + (B.brawl ? ' is out cold.' : ' is defeated.')); }
  if (t === B.bossUnit && !t.down) await B.bossPhase();
};

/* ---------- effects ----------
   {t:'attack', times, atkMod, bonusDice, steal, onHit:{id,turns,v,save}}
   {t:'damage', dice, pow, save:'half'|'none', dc, vs:'undead', tag:'undead'}
   {t:'heal', dice, pow}   {t:'sp', n}   {t:'revive', pct}   {t:'cure', id}
   {t:'status', id, turns, v, save, tag, notTag}
   Any effect may carry on:'self' to hit the user instead of the chosen targets. */
B.fx = async function (user, list, targets) {
  for (const e of list) {
    const tg = e.on === 'self' ? [user] : e.on === 'allies' ? B.allies(user) : targets;
    for (const t of tg) {
      if (B.over()) return;
      if (e.t === 'attack') {
        for (let i = 0; i < (e.times || 1); i++) { if (B.over()) return; await B.attack(user, t, e); }
        continue;
      }
      if (e.t === 'dispel') {                                           // Cut Purse: strip every helpful status
        if (t.down) continue;
        const had = t.statuses.filter(s => G.D.statuses[s.id].good).length;
        t.statuses = t.statuses.filter(s => !G.D.statuses[s.id].good); B.refresh(); B.addVfx({ k: 'burst', to: t, color: '#c9d2e8', n: 10 });
        if (had) { G.audio.sfx('debuff'); await B.msg(t.name + ' loses every blessing it had.'); }
        continue;
      }
      if (e.t === 'extra') {                                            // Encore: the target acts again, right after this turn
        if (t === user || t.down) { await B.msg('Nothing happens.'); continue; }
        (B.extra = B.extra || []).push(t); G.audio.sfx('buff'); B.float(t, 'Encore!', '#8ab4ff'); B.refresh();
        await B.msg(t.name + ' gets another turn.'); continue;
      }
      if (e.t === 'shove') {                                            // Runa: shove a foe; into something solid, it slams
        if (t.down) continue;
        if (t.def && (t.def.scale || 3) >= 4) { await B.msg(t.name + ' does not budge.'); continue; }
        G.audio.sfx('hit');
        const moved = B.push(t, user, e.n || 2), stop = B.pushStop;
        await B.msg(moved ? t.name + ' is shoved back.' : t.name + ' is jammed against the wall.');
        if (stop === 'fall') { const dmg = B.scaleIn(t, G.roll('2d8') + Math.floor(user.pow / 2) + 2); await B.hurt(t, dmg, { text: t.name + ' goes over the edge and only just catches hold, for ' + dmg + '.' }); if (!t.down && B.addStatus(t, 'stunned', 1)) await B.msg(t.name + ' hangs there, stunned.'); }
        if (stop === 'slam') { const dmg = B.scaleIn(t, G.roll('1d8') + Math.floor(user.pow / 2) + 2); await B.hurt(t, dmg, { text: t.name + ' slams into it for ' + dmg + '.' }); if (!t.down && B.addStatus(t, 'stunned', 1)) await B.msg(t.name + ' is stunned.'); }
        if (B.ter(t.gx, t.gy) === 'fire') await B.burn(t, ' is shoved into the fire');
        continue;
      }
      if (e.t === 'pellet') {                                           // Dask: a smoke pellet; vanish, and rattle whoever is next to him
        B.addVfx({ k: 'burst', to: user, color: '#9a9aaa', n: 24 }); G.audio.sfx('debuff');
        B.addStatus(user, 'hidden', 1); user.ambush = true;
        for (const f of B.foes(user).filter(f => B.dist(f, user) <= 1)) { if (B.save(f, user)) continue; B.addStatus(f, 'rattled', 2, 2); B.float(f, 'Rattled', '#d49cf0'); }
        B.refresh(); await B.msg('Smoke billows. Dask is gone, and everyone near him is coughing.'); continue;
      }
      if (e.t === 'flare') {                                            // Maren: a flare of lamplight; the dead reel, the living squint
        B.addVfx({ k: 'aura', to: user, color: '#fff2b0' }); G.audio.sfx('magic'); B.flashT = G.time;
        for (const f of B.foes(user).filter(f => B.dist(f, user) <= 2 && B.los(user, f))) {
          const undead = f.tags.indexOf('undead') >= 0;
          if (B.save(f, user)) { B.float(f, 'Resists', '#c9d2e8'); continue; }
          if (undead && B.addStatus(f, 'stunned', 1)) B.float(f, 'Stunned', '#fff2b0');
          else if (!undead && B.addStatus(f, 'rattled', 2, 2)) B.float(f, 'Dazzled', '#fff2b0');
        }
        B.refresh(); await B.msg('Maren\'s lamp flares white. The dead reel back from it.'); continue;
      }
      if (e.t === 'revive') {
        if (!t.down) continue;
        t.down = false; t.hp = Math.max(1, Math.floor(t.maxHp * (e.pct || 25) / 100)); t.statuses = [];
        B.bondMoment(user, t, 1, 'brought back from the floor');
        B.addVfx({ k: 'beam', to: t, color: '#fff2b0' });
        G.audio.sfx('heal'); B.float(t, 'Up!', '#7ee08a'); B.refresh(); B.quip(t, 'revived', user);
        await B.msg(t.name + ' is back on their feet.'); continue;
      }
      if (t.down) continue;
      if (e.tag && t.tags.indexOf(e.tag) < 0) { if (e.t === 'status') continue; if (e.t === 'damage') continue; }
      if (e.notTag && t.tags.indexOf(e.notTag) >= 0) { await B.msg(t.name + ' is unaffected.'); continue; }
      if (e.t === 'damage') {
        await B.spellVfx(user, t, e);
        let dmg = G.roll(e.dice) + (e.pow ? user.pow : 0), note = '';
        if (e.vs && t.tags.indexOf(e.vs) >= 0) { dmg = Math.floor(dmg * 1.5); note = ' It sears the ' + e.vs + '.'; }
        if (e.save && B.save(t, user, e.dc)) { dmg = e.save === 'half' ? Math.floor(dmg / 2) : 0; note = ' ' + t.name + ' resists.'; }
        if (dmg <= 0) { await B.msg(t.name + ' shrugs it off.'); continue; }
        dmg = B.scaleIn(t, dmg);
        G.audio.sfx(e.sfx || 'magic');
        await B.hurt(t, Math.max(1, dmg), { kind: B.spellKind(user, e), text: t.name + ' takes ' + dmg + ' damage.' + note });
      } else if (e.t === 'heal') {
        const n = Math.min(t.maxHp - t.hp, G.roll(e.dice) + (e.pow ? user.pow : 0) + (B.perk(user, 'grace') ? user.pow : 0));
        if (t.hp < t.maxHp * 0.3 && t !== user && n > 0) B.bondMoment(user, t, 1, 'a heal in the nick of time');
        B.addVfx({ k: 'rise', to: t, shape: 'plus', color: '#7ee08a' });
        t.hp += n; G.audio.sfx('heal'); B.float(t, '+' + n, null, 'heal'); B.refresh(); if (t !== user && n > 0) B.quip(t, 'healed', user);
        await B.msg(t.name + ' recovers ' + n + ' HP.');
      } else if (e.t === 'sp') {
        const n = Math.min(t.maxSp - t.sp, e.n); t.sp += n; G.audio.sfx('buff'); B.addVfx({ k: 'rise', to: t, shape: 'spark', color: '#8ab4ff' }); B.float(t, '+' + n, '#8ab4ff'); B.refresh();
        await B.msg(t.name + ' recovers ' + n + ' SP.');
      } else if (e.t === 'cure') {
        t.statuses = t.statuses.filter(s => s.id !== e.id); G.audio.sfx('heal'); B.addVfx({ k: 'rise', to: t, shape: 'spark', color: '#f4f1e6' }); B.refresh();
        await B.msg(t.name + ' is cured.');
      } else if (e.t === 'status') {
        const sd = G.D.statuses[e.id];
        if (e.save && B.save(t, user)) { await B.msg(t.name + ' resists.'); continue; }
        if (!B.addStatus(t, e.id, e.turns, e.v)) { await B.msg(t.name + ' is unaffected.'); continue; }
        if (e.id === 'hidden') t.ambush = true;
        B.addVfx(B.statusVfx(e.id, t));
        G.audio.sfx(sd.good ? 'buff' : 'debuff'); B.float(t, sd.name, sd.good ? '#8ab4ff' : '#d49cf0'); B.refresh();
        if (!e.quiet) await B.msg(t.name + ': ' + sd.name + '.', sd.desc);
      }
    }
  }
};

// A plain, competent party policy, used only for balance simulations (G.auto).
B.autoAction = function (c) {
  const A = G.D.abilities, foes = B.foes(c), allies = B.allies(c);
  const can = id => c.abilities.indexOf(id) >= 0 && c.sp >= B.cost(c, A[id]) && !(B.noUse && B.noUse.has(id));
  const weakest = foes.slice().sort((a, b) => a.hp - b.hp)[0];
  const use = (id, t) => ({ type: 'ability', ab: A[id], abId: id, targets: t });
  const once = id => c.abilities.indexOf(id) >= 0 && !(c.usedOnce && c.usedOnce[id]) && !(B.noUse && B.noUse.has(id));
  const near = r => foes.filter(f => B.dist(f, c) <= r);
  if (c.id === 'maren' && once('flare') && near(2).filter(f => f.tags.indexOf('undead') >= 0).length >= 2) return use('flare', [c]);
  if (c.id === 'dask' && once('pellet') && near(1).length >= 2) return use('pellet', [c]);
  if (c.id === 'finch' && once('hush') && foes.length >= 2) { const t = foes.filter(f => f !== B.bossUnit && f.immune.indexOf('asleep') < 0).sort((a, b) => b.hp - a.hp)[0]; if (t) return use('hush', [t]); }
  if (c.id === 'runa' && once('shove') && B.round >= 2) { const t = near(1).filter(f => !(f.def && (f.def.scale || 3) >= 4))[0]; if (t) return use('shove', [t]); }
  if (c.id === 'maren') {
    const dead = B.c.filter(x => x.side === 0 && x.down);
    if (dead.length >= 2 && can('lightforthose')) return use('lightforthose', B.c.filter(x => x.side === 0));
    if (dead.length >= 2 && can('firstlamp')) return use('firstlamp', B.c.filter(x => x.side === 0));
    if (foes.some(f => f.tags.indexOf('undead') >= 0) && foes.length >= 2 && can('lanternrite') && G.rand() < 0.5) return use('lanternrite', foes);
    if (dead.length && can('revive')) return use('revive', [dead[0]]);
    const hurt = allies.filter(x => x.hp <= x.maxHp * 0.45).sort((a, b) => a.hp - b.hp);
    const ailing = allies.filter(a => a.statuses.some(s => ['poison', 'asleep', 'weak', 'rattled'].indexOf(s.id) >= 0));
    if (ailing.length >= 2 && can('cleansing')) return use('cleansing', allies);
    if (hurt.length >= 2 && can('vigil') && !allies.some(a => B.has(a, 'regen'))) return use('vigil', allies);
    if (hurt.length >= 2 && can('circle')) return use('circle', allies);
    if (foes.length >= 3 && can('sanctuary') && !allies.some(a => B.has(a, 'warded'))) return use('sanctuary', allies);
    if (hurt.length && can('greatermend')) return use('greatermend', [hurt[0]]);
    if (hurt.length && can('mend')) return use('mend', [hurt[0]]);
    if (hurt.length && G.has('draught') && !(B.noUse && B.noUse.has('item:draught'))) return { type: 'item', id: 'draught', targets: [hurt[0]] };
    if (B.boss && can('keeperslight') && !allies.some(a => B.has(a, 'regen')) && allies.filter(a => a.hp < a.maxHp * 0.7).length >= 2) return use('keeperslight', allies);
    if (B.boss && can('wardoflamps') && !allies.some(a => B.has(a, 'lampward')) && allies.some(a => a.statuses.some(s => !G.D.statuses[s.id].good))) return use('wardoflamps', allies);
    if (B.boss && can('shieldfaith')) { const runa = allies.find(a => a.id === 'runa'); if (runa && !B.has(runa, 'warded')) return use('shieldfaith', [runa]); }
    if (foes.length >= 2 && can('brotherslamp') && G.rand() < 0.5) return use('brotherslamp', foes);
    if (foes.length >= 3 && can('dawnfire') && G.rand() < 0.5) return use('dawnfire', foes);
    if (can('searing') && c.sp >= 14 && weakest.hp > 30) return use('searing', [weakest]);
    if (can('lampfire')) return use('lampfire', [weakest]);
  }
  if (c.id === 'runa') {
    if (c.hp < c.maxHp * 0.4 && can('secondwind')) return use('secondwind', [c]);
    if (B.boss && can('unbroken') && !c.usedUnbroken) { c.usedUnbroken = 1; return use('unbroken', [c]); }
    if (foes.length >= 2 && can('laststand')) return use('laststand', foes);
    if (B.boss && can('bloodfury') && !B.has(c, 'regen') && c.hp < c.maxHp * 0.6) return use('bloodfury', [c]);
    if (B.boss && can('oathkeeper') && !B.has(c, 'taunt') && c.hp < c.maxHp * 0.7) return use('oathkeeper', [c]);
    if (B.boss && B.round <= 2 && can('warsong') && !allies.some(a => B.has(a, 'rage'))) return use('warsong', allies);
    if (B.boss && can('bearhide') && !B.has(c, 'warded') && c.hp < c.maxHp * 0.7) return use('bearhide', [c]);
    if (foes.length >= 3 && can('mountainfalls')) return use('mountainfalls', foes);
    if (foes.length >= 3 && can('wolfhowl') && !B.has(c, 'rage') && !foes.some(f => B.has(f, 'rattled'))) return use('wolfhowl', foes);
    if (foes.length >= 3 && can('earthshaker')) return use('earthshaker', foes);
    if (foes.length <= 2 && can('twinaxes') && weakest.hp > 40) return use('twinaxes', [weakest]);
    if (foes.length === 1 && can('avalanche')) return use('avalanche', foes);
    if (can('sunder') && weakest.hp > 30 && !B.has(weakest, 'weak')) return use('sunder', [weakest]);
    if (foes.length >= 2 && can('whirlwind')) return use('whirlwind', foes);
    if (!B.has(c, 'rage') && can('rage') && foes.reduce((s, f) => s + f.hp, 0) > 14) return use('rage', [c]);
    if (foes.length >= 3 && can('cleave')) return use('cleave', foes);
    if (can('charge') && weakest.hp > 15 && !B.has(weakest, 'weak')) return use('charge', [weakest]);
  }
  if (c.id === 'finch') {
    const hurt = allies.filter(x => x.hp <= x.maxHp * 0.35).sort((a, b) => a.hp - b.hp);
    if (hurt.length && G.has('draught') && !(B.noUse && B.noUse.has('item:draught'))) return { type: 'item', id: 'draught', targets: [hurt[0]] };
    if (B.round <= 1 && can('grandmother') && !allies.some(a => B.has(a, 'blessed'))) return use('grandmother', allies);
    if (foes.length >= 2 && can('fifthverse') && G.rand() < 0.5) return use('fifthverse', foes);
    if (B.round <= 1 && can('ballad') && !allies.some(a => B.has(a, 'blessed'))) return use('ballad', allies);
    if (foes.length >= 2 && can('counterpoint') && G.rand() < 0.3) { const big = foes.slice().sort((a, b) => b.hp - a.hp)[0]; if (!B.has(big, 'charmed')) return use('counterpoint', [big]); }
    if (B.boss && can('encore') && G.rand() < 0.35) { const runa = allies.find(a => a.id === 'runa'); if (runa) return use('encore', [runa]); }
    if (allies.filter(a => B.has(a, 'poison') || a.hp < a.maxHp * 0.5).length >= 2 && can('shanty') && !allies.some(a => B.has(a, 'regen'))) return use('shanty', allies);
    if (B.boss && can('reel') && !allies.some(a => B.has(a, 'inspired')) && G.rand() < 0.4) return use('reel', allies);
    if (foes.length >= 3 && can('lament') && G.rand() < 0.5) return use('lament', foes);
    if (foes.length >= 3 && can('sleepsong') && !foes.some(f => B.has(f, 'asleep')) && G.rand() < 0.4) return use('sleepsong', foes);
    if (foes.length >= 2 && can('discord') && G.rand() < 0.4) return use('discord', foes);
    if (foes.length >= 3 && can('finale') && G.rand() < 0.5) return use('finale', foes);
    if (foes.length >= 3 && can('dissonance') && G.rand() < 0.4) return use('dissonance', foes);
    if (foes.length >= 3 && can('lullaby') && !foes.some(f => B.has(f, 'asleep')) && G.rand() < 0.5) return use('lullaby', foes);
    if (can('mocking') && c.sp >= 10) return use('mocking', [weakest]);
    if (can('barbed')) return use('barbed', [weakest]);
  }
  if (c.id === 'dask') {
    if (B.boss && can('debtpaid')) { const big = foes.slice().sort((a, b) => b.hp - a.hp)[0]; return use('debtpaid', [big]); }
    if (can('cutpurse') && foes.some(f => f.statuses.some(s => G.D.statuses[s.id].good))) return use('cutpurse', [foes.find(f => f.statuses.some(s => G.D.statuses[s.id].good))]);
    if (B.boss && can('markdeath') && !foes.some(f => B.has(f, 'marked'))) { const big = foes.slice().sort((a, b) => b.hp - a.hp)[0]; return use('markdeath', [big]); }
    if (foes.length >= 3 && can('smokebomb') && !foes.some(f => B.has(f, 'rattled'))) return use('smokebomb', foes);
    if (foes.length >= 3 && can('poisoner') && !foes.some(f => B.has(f, 'poison'))) return use('poisoner', foes);
    if (foes.length >= 3 && can('bladeflurry')) return use('bladeflurry', foes);
    if (foes.length >= 3 && can('knifefan') && G.rand() < 0.5) return use('knifefan', foes);
    if (can('gambit') && weakest.hp > 50) return use('gambit', [weakest]);
    if (can('bleed') && weakest.hp > 40 && !B.has(weakest, 'poison')) return use('bleed', [weakest]);
    if (can('thousandcuts') && weakest.hp > 40) return use('thousandcuts', [weakest]);
    if (can('assassinate') && weakest.hp > 25) return use('assassinate', [weakest]);
    if (can('shadowstep') && weakest.hp > 20) return use('shadowstep', [weakest]);
    if (can('feint') && weakest.hp > 15 && !B.exposed(weakest)) return use('feint', [weakest]);
    if (can('twinfangs') && weakest.hp > 8) return use('twinfangs', [weakest]);
  }
  return { type: 'attack', targets: [weakest] };
};
B.exec = async function (c, act) {
  if (act.type === 'attack') await B.attack(c, act.targets[0], {});
  else if (act.type === 'shot') await B.attack(c, act.targets[0], { shot: true });
  else if (act.type === 'ability') {
    const cost = c.side === 0 ? B.cost(c, act.ab) : 0; if (cost < (act.ab.cost || 0)) c.freeSong = true;
    if (act.ab.once) { c.usedOnce = c.usedOnce || {}; c.usedOnce[Object.keys(G.D.abilities).find(k => G.D.abilities[k] === act.ab)] = 1; }
    c.sp -= cost; B.refresh();
    c.fx = { k: 'cast', t: G.time };
    B.addVfx({ k: 'aura', to: c, color: B.castColor(c, act.ab) });
    if (act.center && B.spec(c, act.ab).burst != null) B.addVfx({ k: 'blast', at: act.center, r: B.spec(c, act.ab).burst, color: B.castColor(c, act.ab) });
    if (c.side === 0) B.quip(c, 'skill');
    await B.msg(c.name + ' uses ' + act.ab.name + '.', null, false, 520);
    B.casting = { ab: act.ab }; await B.fx(c, act.ab.fx, act.targets); B.casting = null;
  } else if (act.type === 'item') {
    const it = G.D.items[act.id]; G.give(act.id, -1);
    await B.msg(c.name + ' uses ' + it.name + '.', null, false, 520);
    c.fx = { k: 'cast', t: G.time };
    const to = act.targets[0];
    if (to && to !== c) { B.addVfx({ k: 'proj', shape: 'bottle', from: c, to, dur: 320, color: it.fx.some(e => e.t === 'damage') ? '#ff9a2e' : '#7ee08a' }); await G.sleep(320); }
    B.casting = { item: it }; await B.fx(c, it.fx, act.targets); B.casting = null;
  } else if (act.type === 'defend') {
    B.addStatus(c, 'guard', 1); c.sp = Math.min(c.maxSp, c.sp + 1); G.audio.sfx('buff'); B.refresh();
    await B.msg(c.name + ' braces.', '+4 AC until their next turn, +1 ' + c.st.res + '.');
  } else if (act.type === 'flee') {
    const best = Math.max.apply(null, B.allies(c).map(x => x.spd)), foe = Math.max.apply(null, B.foes(c).map(x => x.spd));
    const d = G.d20();
    if (d + best >= 8 + foe) return 'flee';
    await B.msg("Can't get away!", 'd20: ' + d + ' + ' + best + ' vs ' + (8 + foe));
  }
  return null;
};

/* ---------- log, panel ---------- */
B.buildUI = function () {
  if (Field.hudEl) Field.hudEl.style.display = 'none';
  B.logEl = UI.el('div', 'win blog'); B.panel = UI.el('div', 'win bpanel'); B.turnEl = UI.el('div', 'bturn');
  UI.root.appendChild(B.logEl); UI.root.appendChild(B.panel); UI.root.appendChild(B.turnEl);
  B.logEl.addEventListener('click', () => G.press('a'));
  B.buildViewButtons();
  B.refresh();
};
B.clearUI = function () { if (B.inspect) B.inspect(null); if (B.logEl) B.logEl.remove(); if (B.panel) B.panel.remove(); if (B.turnEl) B.turnEl.remove(); if (B.viewEl) B.viewEl.remove(); B.logEl = B.panel = B.turnEl = B.viewEl = null; B.c = []; B.order = null; };
B.setLog = function (text, sub, guide) {
  if (!B.logEl) return;
  B.logEl.classList.toggle('guide', !!guide);
  B.logEl.innerHTML = '<div class="l1">' + UI.esc(G.keyText(text)) + '</div>' + (sub ? '<div class="l2">' + UI.esc(G.keyText(sub)) + '</div>' : '');
};
// The battle log: every line the fight shows, with its roll, kept for this fight and the last one (G.S.blog).
B.logBattle = function (text, sub) {
  if (!text || !G.S) return;
  const log = G.S.blog = G.S.blog || [];
  log.push([B.round || 0, G.keyText(String(text)), sub ? G.keyText(String(sub)) : '']);
  if (log.length > 160) log.splice(0, log.length - 160);
};
B.statusLine = c => c.statuses.length ? c.statuses.map(s => G.D.statuses[s.id].name).join(', ') : '';
// Shows a line; advances on a key press or after a short pause. hold = wait for the key.
B.msg = function (text, sub, hold, ms, routine) {
  B.logBattle(text, sub);
  if (G.fast) return Promise.resolve();
  B.setLog(text, sub);
  ms = Math.max(260, Math.round((ms || (G.opts.textFast ? 700 : 1350)) * (routine ? 0.65 : 1) * B.speed()));
  return new Promise(res => {
    let done = false, tm = null;
    const fin = () => { if (done) return; done = true; clearTimeout(tm); UI.popModal(m); res(); };
    const m = { press(b) { if (b === 'a' || b === 'b') fin(); } };
    if (!hold) { const later = () => { tm = setTimeout(() => G.hold ? later() : fin(), G.hold ? 150 : ms); }; later(); }   // G.hold: a log is open; wait
    UI.pushModal(m);
  });
};
B.refreshFromState = function () {
  B.c.forEach(c => { if (c.side === 0 && c.m) { const st = G.stats(c.m); c.maxHp = st.maxHp; c.maxSp = st.maxSp; c.hp = c.m.hp; c.sp = c.m.sp; c.down = false; } });
  B.refresh();
};
B.float = function (c, text, color, kind) {
  if (G.fast) return;
  const k = kind && B.DMG_KIND[kind];
  B.floats.push({ x: c.px, y: c.py - 30 * B.pieceSize(c), text, color: color || (k && k[0]) || '#ff8a7a', glyph: k && k[1], crit: kind === 'crit', t: 0 });
};


/* ---------- battle effects ----------
   Short-lived pictures drawn over the fight: weapon strikes, missiles, spells, heals, statuses.
   Each is { k, to, from, t0, dur, ... }; B.drawVfx paints them. Nothing is drawn in fast mode. */
B.RANGED = { arrow: 1, knife: 1, orb: 1, notes: 1, bottle: 1, hatchet: 1, stone: 1 };
B.HERO_HIT = { runa: 'axe', dask: 'dagger', maren: 'mace', finch: 'blade' };
B.hitStyle = function (u) {
  if (u.side === 0 && !u.guest) return B.HERO_HIT[u.id] || 'blade';
  const d = u.def || {};
  if (d.hit) return d.hit;
  if (/archer|bow/i.test(u.sprite + ' ' + d.name)) return 'arrow';
  if (G.gfx.pix[u.sprite] || (u.tags || []).indexOf('beast') >= 0) return 'claw';
  if ((d.scale || 3) >= 4) return 'smash';
  return 'blade';
};
// What kind of harm a damaging skill does, for the colour and glyph of its number.
B.spellKind = function (u, e) {
  if (e.sfx === 'fire') return 'fire';
  if (u.id === 'maren' || e.vs === 'undead') return 'holy';
  if (u.id === 'finch') return 'song';
  if (u.id === 'runa' || u.id === 'dask') return 'hit';
  return (u.tags || []).indexOf('undead') >= 0 ? 'frost' : 'magic';
};
B.castColor = function (u, ab) {
  const fx = ab.fx || [];
  if (fx.some(e => e.t === 'heal' || e.t === 'revive')) return '#7ee08a';
  if (u.id === 'maren') return '#ffe07a';
  if (u.id === 'finch') return '#f08aa6';
  if (u.id === 'dask') return '#9ad07a';
  if (u.id === 'runa') return '#ff8a3a';
  return fx.some(e => e.sfx === 'fire') ? '#ff9a2e' : '#b48cf0';
};
// The picture for a damaging spell or song; waits for a missile to land.
B.spellVfx = async function (u, t, e) {
  if (G.fast) return;
  const ab = (B.casting && B.casting.ab) || {}, fire = e.sfx === 'fire';
  if (B.casting && B.casting.item) { B.addVfx({ k: 'burst', to: t, color: '#ff9a2e', n: 16 }); return; }
  if (u.id === 'maren' || (fire && u.side === 0)) { B.addVfx({ k: 'beam', to: t, color: '#ffe07a' }); await G.sleep(200); B.addVfx({ k: 'burst', to: t, color: '#fff2b0', n: 12 }); return; }
  if (u.id === 'finch') { B.addVfx({ k: 'proj', shape: 'notes', from: u, to: t, dur: 300, color: '#f08aa6' }); await G.sleep(300); B.addVfx({ k: 'burst', to: t, color: '#f08aa6', n: 10 }); return; }
  if (u.id === 'runa') { B.addVfx({ k: 'quake', to: t }); B.shakeT = G.time; await G.sleep(160); return; }
  if (u.id === 'dask') { B.addVfx({ k: 'proj', shape: 'knife', from: u, to: t, dur: 200 }); await G.sleep(200); return; }
  const col = fire ? '#ff9a2e' : (u.tags || []).indexOf('undead') >= 0 ? '#9ad0ff' : B.castColor(u, ab);
  B.addVfx({ k: 'proj', shape: 'orb', from: u, to: t, dur: 280, color: col }); await G.sleep(280);
  B.addVfx({ k: 'burst', to: t, color: col, n: 14 });
};
B.statusVfx = function (id, t) {
  const sd = G.D.statuses[id];
  if (id === 'poison') return { k: 'rise', to: t, shape: 'bubble', color: '#7ad04a' };
  if (id === 'asleep') return { k: 'rise', to: t, shape: 'z', color: '#c9d2e8' };
  if (id === 'stunned') return { k: 'ring', to: t, shape: 'stars', color: '#ffe07a' };
  if (id === 'guard' || id === 'warded' || id === 'lampward') return { k: 'shield', to: t, color: id === 'lampward' ? '#ffe07a' : '#8ab4ff' };
  if (id === 'rage') return { k: 'rise', to: t, shape: 'flame', color: '#ff6a3a' };
  if (id === 'hidden') return { k: 'burst', to: t, color: '#6a6a7a', n: 18 };
  return sd.good ? { k: 'rise', to: t, shape: 'spark', color: '#8ab4ff' } : { k: 'ring', to: t, shape: 'swirl', color: '#d49cf0' };
};
B.addVfx = function (v) {
  if (G.fast || !B.vfx) return;
  v.t0 = G.time; v.dur = v.dur || { strike: 300, whiff: 240, burst: 420, beam: 520, rise: 760, ring: 600, shield: 560, aura: 420, quake: 480, blast: 650 }[v.k] || 400;
  v.seed = Math.random() * 1000; B.vfx.push(v);
};
B.pieceSize = o => ((o.def && (o.def.scale || 3) >= 4) ? 1.45 : 1) * (B.N > 12 ? 0.88 : 1);   // a little smaller on the 14-square boards
B.center = o => ({ x: o.px, y: o.py - 13 * B.pieceSize(o) });
B.drawVfx = function (c) {
  const now = G.time, R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  B.vfx = (B.vfx || []).filter(v => now - v.t0 < v.dur);
  for (const v of B.vfx) {
    const a = (now - v.t0) / v.dur, to = v.to && B.center(v.to), dir = v.flip ? -1 : 1, k = v.to ? (B.pieceSize(v.to) > 1 ? 1.4 : 1) : 1;
    c.save();
    if (v.k === 'proj') {
      const fr = B.center(v.from), x = fr.x + (to.x - fr.x) * a, arc = v.shape === 'bottle' ? -Math.sin(a * Math.PI) * 26 : v.shape === 'stone' ? -Math.sin(a * Math.PI) * 12 : v.shape === 'notes' ? Math.sin(a * Math.PI * 3) * 5 : 0, y = fr.y + (to.y - fr.y) * a + arc;
      const sx = Math.sign(to.x - fr.x) || 1;
      if (v.shape === 'arrow') { R(Math.min(x, x - 12 * sx), y, 13, 1, '#d8c8a0'); R(x + (sx > 0 ? 1 : -4), y - 1, 4, 3, '#e8ecf4'); R(x - 13 * sx - 1, y - 2, 3, 5, '#f4f1e6'); }
      else if (v.shape === 'hatchet') { c.translate(x, y); c.rotate(a * 16 * sx); R(-1, -5, 2, 10, '#6b4a2b'); R(1, -5, 4, 4, '#c8ccd8'); R(4, -5, 1, 4, '#f4f4fa'); }
      else if (v.shape === 'stone') { for (let i = 3; i > 0; i--) { c.globalAlpha = 0.18 * (4 - i) / 3; c.fillStyle = '#e8e4d8'; c.beginPath(); c.arc(x - sx * i * 3, y + i * 0.6, 2 - i * 0.3, 0, 7); c.fill(); }
        c.globalAlpha = 1; c.fillStyle = '#8a8478'; c.beginPath(); c.arc(x, y, 2.4, 0, 7); c.fill(); c.fillStyle = '#d8d2c4'; c.beginPath(); c.arc(x - 0.7, y - 0.8, 1, 0, 7); c.fill(); }
      else if (v.shape === 'knife') { c.translate(x, y); c.rotate(a * 14); R(-3, -1, 6, 2, '#e8ecf4'); R(-4, -1, 2, 2, '#6b4a2b'); }
      else if (v.shape === 'bottle') { c.translate(x, y); c.rotate(a * 9); R(-3, -3, 6, 7, v.color || '#7ee08a'); R(-1, -6, 3, 3, '#b9b29b'); R(-2, -2, 1, 3, '#ffffff'); }
      else if (v.shape === 'notes') { for (let i = 0; i < 3; i++) { const nx = x - sx * i * 10, ny = y + Math.sin((a * 6 + i) * 2) * 4; R(nx, ny, 4, 3, v.color); R(nx + 3, ny - 7, 1, 8, v.color); R(nx + 3, ny - 7, 3, 2, v.color); } }
      else { c.globalAlpha = 0.35; c.fillStyle = v.color; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); c.globalAlpha = 1; c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); R(x - 2, y - 2, 3, 3, '#ffffff');
        for (let i = 1; i < 4; i++) { c.globalAlpha = 0.5 - i * 0.12; c.beginPath(); c.arc(x - (to.x - fr.x) * 0.06 * i, y - (to.y - fr.y) * 0.06 * i, 3 - i * 0.5, 0, 7); c.fill(); } }
    } else if (v.k === 'strike') {
      const st = v.style, fade = 1 - a * a; c.globalAlpha = fade; c.translate(to.x, to.y); c.scale(dir * k, k);
      if (st === 'axe') { c.strokeStyle = v.crit ? '#ffe07a' : '#f4f1e6'; c.lineWidth = 4; c.beginPath(); c.arc(-6, -4, 16, -1.9 + a * 0.6, 0.2 + a * 0.6); c.stroke(); c.strokeStyle = '#ff9a2e'; c.lineWidth = 1.5; c.beginPath(); c.arc(-6, -4, 12, -1.6 + a * 0.6, 0.1 + a * 0.6); c.stroke(); }
      else if (st === 'dagger') { c.strokeStyle = '#e8ecf4'; c.lineWidth = 2; for (let i = 0; i < 2; i++) { const o = i * 6 - 3, p = Math.min(1, a * 2.4 - i * 0.5); if (p <= 0) continue; c.beginPath(); c.moveTo(-10, -10 + o); c.lineTo(-10 + 20 * p, -10 + o + 16 * p); c.stroke(); } }
      else if (st === 'mace' || st === 'smash') { c.strokeStyle = st === 'mace' ? '#ffe07a' : '#f4f1e6'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 4 + a * 14, 0, 7); c.stroke(); for (let i = 0; i < 8; i++) { const an = i * 0.785 + v.seed, r1 = 6 + a * 10, r2 = r1 + 5; c.beginPath(); c.moveTo(Math.cos(an) * r1, Math.sin(an) * r1); c.lineTo(Math.cos(an) * r2, Math.sin(an) * r2); c.stroke(); } }
      else if (st === 'claw') { c.strokeStyle = '#ff6a5a'; c.lineWidth = 2; for (let i = 0; i < 3; i++) { const p = Math.min(1, a * 2.2); c.beginPath(); c.moveTo(-8 + i * 5, -12); c.lineTo(-8 + i * 5 + 8 * p, -12 + 20 * p); c.stroke(); } }
      else if (st === 'arrow' || st === 'knife' || st === 'orb' || st === 'notes' || st === 'bottle') { c.strokeStyle = '#f4f1e6'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 3 + a * 10, 0, 7); c.stroke(); }
      else { c.strokeStyle = v.crit ? '#ffe07a' : '#f4f1e6'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-14, -14 + a * 4); c.quadraticCurveTo(0, -4, 14, 12); c.stroke(); c.lineWidth = 1; c.strokeStyle = '#9ad0ff'; c.beginPath(); c.moveTo(-12, -15); c.quadraticCurveTo(2, -6, 15, 9); c.stroke(); }
      if (v.crit) { c.fillStyle = '#ffe07a'; for (let i = 0; i < 6; i++) { const an = i * 1.047 + v.seed; R(Math.cos(an) * (8 + a * 16), Math.sin(an) * (8 + a * 16), 2, 2, '#ffe07a'); } }
    } else if (v.k === 'whiff') { c.globalAlpha = 1 - a; c.strokeStyle = '#c9d2e8'; c.lineWidth = 1; c.setLineDash([2, 2]); c.beginPath(); c.arc(to.x - dir * 6, to.y, 12, -1.2, 1.2); c.stroke(); }
    else if (v.k === 'burst') { for (let i = 0; i < (v.n || 12); i++) { const an = i / (v.n || 12) * 6.283 + v.seed, r = (4 + a * 20) * k; c.globalAlpha = 1 - a; R(to.x + Math.cos(an) * r - 1, to.y + Math.sin(an) * r - 1, 3, 3, v.color); R(to.x + Math.cos(an) * r * 0.6, to.y + Math.sin(an) * r * 0.6, 2, 2, '#ffffff'); } }
    else if (v.k === 'beam') { const w = 10 * (1 - Math.abs(a * 2 - 1)) + 2; c.globalAlpha = 0.35; R(to.x - w, 0, w * 2, to.y + 14, v.color); c.globalAlpha = 0.85; R(to.x - w / 3, 0, Math.max(1, w * 2 / 3), to.y + 14, '#ffffff'); }
    else if (v.k === 'rise') {
      for (let i = 0; i < 8; i++) { const ph = (a + i / 8) % 1, x = to.x - 13 + ((i * 37 + v.seed) % 26), y = to.y + 12 - ph * 32; c.globalAlpha = Math.min(1, (1 - a) * 2) * (1 - ph * 0.6);
        if (v.shape === 'plus') { R(x - 1, y - 4, 3, 9, v.color); R(x - 4, y - 1, 9, 3, v.color); }
        else if (v.shape === 'bubble') { c.strokeStyle = v.color; c.lineWidth = 1; c.beginPath(); c.arc(x, y, 2, 0, 7); c.stroke(); }
        else if (v.shape === 'z') { if (i % 2) continue; c.fillStyle = v.color; c.font = 'bold 8px monospace'; c.fillText('z', x, y); }
        else if (v.shape === 'flame') { R(x - 1, y - 2, 3, 4, v.color); R(x, y - 4, 1, 2, '#ffe07a'); }
        else { R(x, y - 2, 1, 5, v.color); R(x - 2, y, 5, 1, v.color); } }
    }
    else if (v.k === 'ring') { c.globalAlpha = 1 - a; c.strokeStyle = v.color; c.fillStyle = v.color; const r = (10 + Math.sin(a * 3.14) * 4) * k;
      if (v.shape === 'stars') { for (let i = 0; i < 4; i++) { const an = a * 8 + i * 1.57; R(to.x + Math.cos(an) * 10, to.y - 12 + Math.sin(an) * 3, 2, 2, v.color); } }
      else { c.lineWidth = 2; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(to.x, to.y, r - i * 4, a * 9 + i, a * 9 + i + 3.6); c.stroke(); } } }
    else if (v.k === 'shield') { c.globalAlpha = (1 - a) * 0.8; c.strokeStyle = v.color; c.lineWidth = 2; c.beginPath(); c.ellipse(to.x, to.y, 13 + a * 3, 16 + a * 3, 0, 0, 7); c.stroke(); c.globalAlpha = (1 - a) * 0.18; c.fillStyle = v.color; c.fill(); }
    else if (v.k === 'aura') { c.globalAlpha = (1 - a) * 0.7; c.strokeStyle = v.color; c.lineWidth = 1; for (let i = 0; i < 2; i++) { c.beginPath(); c.ellipse(to.x, v.to.py - 2, 8 + a * 12 + i * 4, 3 + a * 3 + i, 0, 0, 7); c.stroke(); } }
    else if (v.k === 'blast') { const ctr = B.tileCenter(v.at[0], v.at[1]), iso = B.isIso(); c.globalAlpha = (1 - a) * 0.55; c.fillStyle = v.color;
      for (let dy = -v.r; dy <= v.r; dy++) for (let dx = -v.r; dx <= v.r; dx++) { const x = v.at[0] + dx, y = v.at[1] + dy; if (!B.inside(x, y)) continue; if (iso) { B.isoPath(c, x, y, 0.06); c.fill(); } else c.fillRect(B.BX + x * B.TW + 1, B.BY + y * B.TH + 1, B.TW - 2, B.TH - 2); }
      const rw = iso ? 12 * 1.41 : B.TW, rh = iso ? 6 * 1.41 : B.TH;
      c.globalAlpha = 1 - a; c.strokeStyle = '#ffffff'; c.lineWidth = 1; c.beginPath(); c.ellipse(ctr.x, ctr.y, (v.r + 0.5) * rw * a + 4, (v.r + 0.5) * rh * a + 2, 0, 0, 7); c.stroke(); }
    else if (v.k === 'quake') { c.globalAlpha = 1 - a; for (let i = 0; i < 9; i++) { const x = to.x - 26 + i * 6, h = (6 + ((i * 13 + v.seed) % 9)) * Math.sin(a * 3.14); R(x, v.to.py - h, 5, h, '#8a6a42'); R(x, v.to.py - h, 5, 2, '#c8a56a'); } }
    c.restore();
  }
};

/* ---------- drawing ---------- */
