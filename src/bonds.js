/* Bonds: how the four get on.
   Trust: each companion's trust in Runa (flags bond.dask, bond.maren, bond.finch), built up and worn down by Runa's
     choices. Tiers: Doubting (-2 or less), Steady, Trusting (4+), Devoted (10+).
   Friendship: how two companions get on (bond.dask_maren, bond.dask_finch, bond.maren_finch), changed by what they
     go through together, in the field, at the inn and in a fight. Tiers: At odds (-2 or less), Easy, Friends (3+),
     Close (6+).
   In a fight: two friends side by side get +1 to hit ("side by side"); two at odds side by side get -1
     ("bickering"). A companion who trusts Runa, standing beside her, gives them both +1 AC ("back to back"); one who
     doubts her gives them both -1 AC.
   In a fight, bonds also move: bringing someone back from the floor, or healing them when they are nearly gone,
     brings the two closer (once a fight per pair); catching a friend in a blast you set off does the opposite. */
(function () {
  const HEROES = ['dask', 'maren', 'finch'], NAME = { runa: 'Runa', dask: 'Dask', maren: 'Maren', finch: 'Finch' };
  // the flag a pair's bond lives in: a companion and Runa share the companion's trust flag
  G.bondKey = (a, b) => a === 'runa' ? b : b === 'runa' ? a : [a, b].sort((x, y) => HEROES.indexOf(x) - HEROES.indexOf(y)).join('_');
  G.bond = (a, b) => G.flag('bond.' + G.bondKey(a, b)) || 0;
  G.TRUST = [[10, 'Devoted'], [4, 'Trusting'], [-1, 'Steady'], [-99, 'Doubting']];
  G.FRIEND = [[6, 'Close'], [3, 'Friends'], [-1, 'Easy'], [-99, 'At odds']];
  G.bondTier = (a, b) => { const v = G.bond(a, b), t = a === 'runa' || b === 'runa' ? G.TRUST : G.FRIEND; return t.find(r => v >= r[0])[1]; };
  // ['bond', key, n]: key is a companion (their trust in Runa) or a pair, 'dask_maren'
  G.bondAdd = function (key, n, quiet) {
    G.setFlag('bond.' + key, (G.flag('bond.' + key) || 0) + n);
    if (quiet || G.fast) return;
    if (key.indexOf('_') < 0) UI.toast(NAME[key] + (n > 0 ? ' approves.' : ' disapproves.'));
    else { const [a, b] = key.split('_'); UI.toast(NAME[a] + ' and ' + NAME[b] + (n > 0 ? ' grow closer.' : ' grow apart.')); }
  };
  const isHero = u => u && u.side === 0 && !u.guest && NAME[u.id];
  const adj = (a, b) => a !== b && Math.max(Math.abs(a.gx - b.gx), Math.abs(a.gy - b.gy)) <= 1;
  // to hit, for u striking from (sx, sy): +1 beside a friend (Friends or Close), -1 beside someone it is at odds with;
  // +1 more for a companion who is Devoted to Runa, fighting beside her (and for Runa, beside them). At most +2.
  B.bondHit = function (u, sx, sy) {
    if (!isHero(u) || B.CLASSIC) return { bonus: 0, note: null };
    let friend = 0, odds = 0, devoted = 0;
    for (const o of B.c) {
      if (!isHero(o) || o === u || !B.living(o) || Math.max(Math.abs(o.gx - sx), Math.abs(o.gy - sy)) > 1) continue;
      if (u.id !== 'runa' && o.id !== 'runa') { const v = G.bond(u.id, o.id); if (v >= 3) friend = 1; if (v <= -2) odds = -1; }
      else if (G.bond(u.id, o.id) >= 10) devoted = 1;
    }
    const bonus = Math.min(2, friend + odds + devoted);
    return { bonus, note: bonus > 0 ? (devoted ? 'devoted' : 'side by side') + ' +' + bonus : bonus < 0 ? 'bickering ' + bonus : null };
  };
  // AC for t: back to back with Runa, +1 if that companion trusts her (Trusting or Devoted), -1 if they doubt her;
  // +1 beside a Close friend. At most +2.
  B.bondAc = function (t) {
    if (!isHero(t) || B.CLASSIC) return { bonus: 0, note: null };
    let trust = 0, close = 0;
    for (const o of B.c) {
      if (!isHero(o) || !B.living(o) || !adj(o, t)) continue;
      if (t.id === 'runa' || o.id === 'runa') { const v = G.bond('runa', t.id === 'runa' ? o.id : t.id); if (v >= 4) trust = Math.max(trust, 1); if (v <= -2) trust = Math.min(trust, -1); }
      else if (G.bond(t.id, o.id) >= 6) close = 1;
    }
    const bonus = Math.min(2, trust + close);
    return { bonus, note: bonus > 0 ? 'back to back +' + bonus + ' AC' : bonus < 0 ? 'no trust ' + bonus + ' AC' : null };
  };
  /* ---------- outside a fight ----------
     Dask's trust: shop prices (he haggles for Runa) -5% Trusting, -10% Devoted, +5% Doubting.
     Maren's trust: her prayers heal and restore x1.15 Trusting, x1.3 Devoted, x0.85 Doubting.
     Finch's trust: his songs pay x1.25 Trusting, x1.5 Devoted, x0.75 Doubting.
     Friends patch each other up after a won fight: 4% of their health back (Close: 8%). */
  G.bondScale = function (who) { const v = G.bond('runa', who); return v >= 10 ? 2 : v >= 4 ? 1 : v <= -2 ? -1 : 0; };
  G.shopPct = () => [105, 100, 95, 90][G.bondScale('dask') + 1];
  G.prayerMul = () => [0.85, 1, 1.15, 1.3][G.bondScale('maren') + 1];
  G.buskMul = () => [0.75, 1, 1.25, 1.5][G.bondScale('finch') + 1];
  G.patchUp = function () {
    const out = [];
    for (const [a, b] of [['dask', 'maren'], ['dask', 'finch'], ['maren', 'finch']]) {
      const v = G.bond(a, b), pct = v >= 6 ? 0.08 : v >= 3 ? 0.04 : 0; if (!pct) continue;
      for (const id of [a, b]) { const m = G.member(id); if (!m || m.hp <= 0) continue; const st = G.stats(m); m.hp = Math.min(st.maxHp, m.hp + Math.ceil(st.maxHp * pct)); }
      out.push(NAME[a] + ' and ' + NAME[b]);
    }
    return out;
  };
  // moments in a fight
  B.bondMoment = function (a, b, n, why) {
    if (!isHero(a) || !isHero(b) || a === b || B.CLASSIC) return;
    const k = G.bondKey(a.id, b.id); B.bondSeen = B.bondSeen || {};
    if (B.bondSeen[k + n]) return; B.bondSeen[k + n] = 1;
    G.bondAdd(k, n, true);
    (B.bondNotes = B.bondNotes || []).push((k.indexOf('_') < 0 ? NAME[k] + (n > 0 ? ' trusts Runa more' : ' trusts Runa less') : NAME[a.id] + ' and ' + NAME[b.id] + (n > 0 ? ' are closer' : ' are cooler')) + ' (' + why + ').');
  };

  /* ---------- team-ups ----------
     Two heroes who are close (a companion Trusting Runa, or two companions who are Friends) standing side by side
     can pull off a joint move, once per pair each fight. It takes the turn's action of the one who calls it.
       Runa + Dask   Over the Line: Runa hurls Dask; he lands beside a foe up to 4 squares away and strikes (+2, +2d6).
       Runa + Maren  Hammer and Lamp: Maren's lamp flares as Runa swings (+2, +1d8; +2d8 against the dead).
       Runa + Finch  Battle Hymn: Runa strikes to Finch's beat (+2, +1d6) and knocks the foe back.
       Dask + Maren  Blind and Bleed: the lamp dazzles, Dask's knife finds the gap (+3, +2d6).
       Dask + Finch  Look Over There: Finch distracts, Dask strikes (+2, +3d6).
       Maren + Finch Two-Part Hymn: everyone within 2 squares of either is healed (2d6 + level/2). */
  B.TEAM = {
    runa_dask: { name: 'Over the Line', striker: 'dask', reach: 4, leap: true, atkMod: 2, bonusDice: '2d6', say: 'Runa grabs Dask by the belt and hurls him over the line!' },
    runa_maren: { name: 'Hammer and Lamp', striker: 'runa', reach: 1, atkMod: 2, bonusDice: '1d8', dead: '2d8', say: 'Maren lifts the lamp high, and Runa swings into the light!' },
    runa_finch: { name: 'Battle Hymn', striker: 'runa', reach: 1, atkMod: 2, bonusDice: '1d6', push: 1, say: 'Finch hammers out a beat, and Runa swings on it!' },
    dask_maren: { name: 'Blind and Bleed', striker: 'dask', reach: 1, atkMod: 3, bonusDice: '2d6', say: 'Maren flashes the lamp in its eyes; Dask finds the gap.' },
    dask_finch: { name: 'Look Over There', striker: 'dask', reach: 1, atkMod: 2, bonusDice: '3d6', say: 'Finch points and shouts. It looks. Dask does not.' },
    maren_finch: { name: 'Two-Part Hymn', heal: true, say: 'Maren and Finch sing it together, one line each, and the hurt goes out of everyone near them.' }
  };
  const pairKey = (a, b) => { const o = ['runa', 'dask', 'maren', 'finch']; return [a, b].sort((x, y) => o.indexOf(x) - o.indexOf(y)).join('_'); };
  const close = (a, b) => (a === 'runa' || b === 'runa') ? G.bond(a, b) >= 4 : G.bond(a, b) >= 3;
  // the team-ups c can call this turn: a partner beside it, close enough, and the pair not yet used this fight
  B.teamUps = function (c) {
    if (!isHero(c) || B.CLASSIC || B.brawl) return [];
    B.teamUsed = B.teamUsed || {};
    return B.c.filter(o => isHero(o) && adj(c, o) && B.living(o) && close(c.id, o.id) && !B.teamUsed[pairKey(c.id, o.id)])
      .map(o => ({ partner: o, key: pairKey(c.id, o.id), t: B.TEAM[pairKey(c.id, o.id)] })).filter(x => x.t)
      .filter(x => x.t.heal || B.teamTargets(c, x).length);
  };
  B.teamTargets = function (c, x) {
    const s = x.t.striker === c.id ? c : x.partner;
    return B.c.filter(f => B.living(f) && f.side === 1 && Math.max(Math.abs(f.gx - s.gx), Math.abs(f.gy - s.gy)) <= x.t.reach && (x.t.reach <= 1 || B.los(s, f)) &&
      (!x.t.leap || B.teamLanding(s, f)));
  };
  // where Dask lands: a free square beside the foe, nearest to where he was thrown from
  B.teamLanding = function (s, f) {
    let best = null;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const x = f.gx + dx, y = f.gy + dy; if ((!dx && !dy) || !B.inside(x, y) || B.wall(x, y) || B.occupant(x, y) || B.ter(x, y) === 'fire') continue;
      const d = Math.abs(x - s.gx) + Math.abs(y - s.gy); if (!best || d < best.d) best = { x, y, d };
    }
    return best;
  };
  // pull it off: returns false if called off at the target pick
  B.teamUp = async function (c, x) {
    const T = x.t, partner = x.partner;
    if (T.heal) {
      const near = B.c.filter(h => isHero(h) && !h.down && [c, partner].some(p => Math.max(Math.abs(h.gx - p.gx), Math.abs(h.gy - p.gy)) <= 2));
      B.teamUsed[x.key] = 1; G.audio.sfx('heal'); B.float(c, T.name + '!', '#ffd24a');
      B.addVfx({ k: 'aura', to: c, color: '#7ee08a' }); B.addVfx({ k: 'aura', to: partner, color: '#7ee08a' });
      await B.msg(T.say);
      for (const h of near) { const n = G.roll('2d6') + Math.floor((G.S.level || 1) / 2); h.hp = Math.min(h.maxHp, h.hp + n); B.addVfx({ k: 'rise', to: h, shape: 'plus', color: '#7ee08a' }); B.float(h, '+' + n, '#7ee08a'); }
      B.refresh(); await B.msg(near.map(h => h.name).join(', ') + ' feel' + (near.length === 1 ? 's' : '') + ' the hurt ease.');
      return true;
    }
    const striker = T.striker === c.id ? c : partner, helper = striker === c ? partner : c, opts = B.teamTargets(c, x);
    const pick = await B.pickSquare({ unit: striker, spec: B.spec(striker, null), tint: 'foe',
      options: opts.map(f => ({ tx: f.gx, ty: f.gy, sx: striker.gx, sy: striker.gy, targets: [f] })),
      onHover: op => B.setLog(T.name + (op ? ': ' + op.targets[0].name : ''), op ? T.say : 'Pick a foe in reach.') });
    B.ui = null;
    if (!pick) return false;
    const f = pick.targets[0];
    B.teamUsed[x.key] = 1; G.audio.sfx('buff'); B.float(c, T.name + '!', '#ffd24a');
    helper.fx = { k: 'cast', t: G.time };
    await B.msg(T.say);
    if (T.leap) {                                                // the throw: Dask sails over and lands beside the foe
      const l = B.teamLanding(striker, f);
      striker.anim = { t0: G.time, per: B.pace(380), path: [[striker.gx, striker.gy], [l.x, l.y]], leap: true }; G.audio.sfx('move');
      await G.sleep(B.pace(380)); striker.gx = l.x; striker.gy = l.y; striker.anim = null; B.refresh();
    }
    const dead = T.dead && (f.tags || []).indexOf('undead') >= 0;
    await B.attack(striker, f, { atkMod: T.atkMod, bonusDice: dead ? T.dead : T.bonusDice, push: T.push });
    return true;
  };
})();
