/* Tactics: the pace of a fight, holding ground, and what the player can see before committing.
   Pace (G.opts.bspeed): 'normal', 'fast' (the default) or 'swift'. It shortens how long each message holds and how
     long pieces take to move and strike. Routine hits and misses hold for less again: their numbers pop up over the
     pieces, so the text is only a record. A press (or a click on the log) still skips any message.
   Holding ground: a unit that walks out of an enemy's reach (from a square beside it to one that isn't) gives that
     enemy a free strike (a snatched blow, at -2 to hit), once a round per enemy and at most one per move. Enemies who are asleep, stunned or charmed don't strike. A hidden
     unit isn't seen, and Dask is light-footed: neither provokes. Leaps, shoves and falls never provoke. Both sides
     follow the rule, and the AI (and the autopilot) weigh it when choosing where to stand.
   Threat: every square an enemy could strike next turn (walking, then its weapon or its spells), shaded red; shown
     while choosing where to move, and any time with T or the ⚔ button.
   Preview: aiming at someone shows the chance to hit, the damage range, and whether it could knock them out. */
(function () {
  const key = B.key;
  /* ---------- pace ---------- */
  B.SPEEDS = { normal: { name: 'Normal', f: 1 }, fast: { name: 'Fast', f: 0.62 }, swift: { name: 'Swift', f: 0.38 } };
  B.speed = () => (B.SPEEDS[(G.opts && G.opts.bspeed) || 'fast'] || B.SPEEDS.fast).f;
  B.pace = ms => Math.round(ms * Math.max(0.5, B.speed()));            // animations: never so quick you can't follow them

  /* ---------- holding ground ---------- */
  B.lightfoot = u => u.id === 'dask' || B.has(u, 'hidden');
  // a boss winding up its marked blow is too busy to take free swings: stepping out of the red squares is always safe
  B.canStrikeBack = e => B.living(e) && !B.has(e, 'asleep') && !B.has(e, 'stunned') && !B.has(e, 'charmed') && e.aooRound !== B.round && !(e === B.bossUnit && B.marks && B.marks.length);
  // Free strikes a walk along path would give: [{ i, e }], i = the step it leaves from.
  B.provokes = function (u, path) {
    if (B.CLASSIC || B.brawl || B.guide || !path || path.length < 2 || B.lightfoot(u)) return [];
    const out = [], used = new Set();
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i], b = path[i + 1];
      for (const e of B.c) {
        if (e.side === u.side || used.has(e) || !B.canStrikeBack(e)) continue;
        const da = Math.max(Math.abs(e.gx - a[0]), Math.abs(e.gy - a[1])), db = Math.max(Math.abs(e.gx - b[0]), Math.abs(e.gy - b[1]));
        if (da <= 1 && db > 1) { used.add(e); out.push({ i, e }); }
      }
      if (out.length) break;                                         // one free strike a move: the first left behind swings
    }
    return out.slice(0, 1);
  };
  B.eventSeq = 0;                                                   // bumped by anything that can't be taken back (undo checks it)

  /* ---------- threat ---------- */
  let tcache = null;
  B.threat = function () {
    const foes = B.c.filter(e => e.side === 1 && B.living(e));
    const sig = B.round + '|' + B.boardRev + '|' + B.c.map(u => u.gx + ',' + u.gy + (u.down ? 'd' : '') + (u.gone ? 'g' : '')).join(';');
    if (tcache && tcache.sig === sig) return tcache.map;
    const map = new Map(), A = G.D.abilities;
    for (const e of foes) {
      if (B.has(e, 'asleep') || B.has(e, 'stunned')) continue;
      let range = B.attackRange(e);
      for (const m of e.moves || []) { const ab = A[m[1]]; if (ab && (ab.target === 'enemy' || ab.target === 'allEnemies' || ab.target === 'area')) range = Math.max(range, (B.spec(e, ab) || {}).range || 1); }
      const stands = B.reach(e, Math.max(1, e.mov - (B.has(e, 'weak') ? 1 : 0))), mine = new Set();
      for (const v of stands.values()) {
        if (v.pass) continue;
        const r = range + (range > 1 && B.high(v.x, v.y) ? 1 : 0);
        for (let y = Math.max(0, v.y - r); y <= Math.min(B.N - 1, v.y + r); y++) for (let x = Math.max(0, v.x - r); x <= Math.min(B.N - 1, v.x + r); x++) {
          const k = key(x, y); if (mine.has(k) || !B.inside(x, y) || B.wall(x, y)) continue;
          if (r > 1 && Math.max(Math.abs(x - v.x), Math.abs(y - v.y)) > 1 && !B.los({ gx: v.x, gy: v.y }, { gx: x, gy: y })) continue;
          mine.add(k);
        }
      }
      for (const k of mine) map.set(k, (map.get(k) || 0) + 1);
    }
    tcache = { sig, map };
    return map;
  };
  B.showThreat = () => !!(G.opts && G.opts.threat) || !!(B.ui && B.ui.tint === 'move');
  B.toggleThreat = function () { G.opts.threat = !G.opts.threat; G.saveOpts(); if (G.audio) G.audio.sfx('select'); B.refreshView && B.refreshView(); };

  /* ---------- preview ---------- */
  function range(str) {
    let lo = 0, hi = 0; const s = String(str || '0').replace(/\s/g, '');
    s.replace(/([+-]?)(\d+)d(\d+)/g, (m, sg, n, d) => { const k = sg === '-' ? -1 : 1; lo += k * +n; hi += k * n * d; return ''; })
      .replace(/([+-]?\d+)(?!d)/g, (m, n) => { lo += +n; hi += +n; return ''; });
    return [lo, hi];
  }
  B.diceRange = range;
  // { pct, lo, hi, ko: 'sure'|'maybe'|null } for u using ab (null = weapon, 'shot' = ranged weapon) on t from (sx, sy).
  B.preview = function (u, ab, t, sx, sy) {
    if (!t || t.side === u.side) return null;
    const isShot = ab === 'shot', fx = ab && ab !== 'shot' ? ab.fx || [] : [];
    const atkFx = !ab || isShot ? {} : fx.find(e => e.t === 'attack'), dmgFx = fx.find(e => e.t === 'damage');
    let lo = 0, hi = 0, pct = null, note = '';
    if (!ab || isShot || atkFx) {
      const at = { gx: sx, gy: sy }, melee = B.dist(at, t) <= 1, prof = isShot ? u.shot : melee ? u.melee : null;
      const base = range(u.dmg), add = (u.dmgBonus || 0) + B.mod(u, 'dmg') + (prof ? prof.dmg || 0 : 0), extra = atkFx && atkFx.bonusDice ? range(atkFx.bonusDice) : [0, 0];
      lo = base[0] + add + extra[0]; hi = base[1] + add + extra[1];
      const eng = B.flanked(u, t, sx, sy), helpless = B.has(t, 'asleep') || B.has(t, 'stunned');
      if (u.sneak && (eng || helpless || B.exposed(t) || u.ambush)) { const n = u.sneak + (eng && melee ? 1 : 0); lo += n; hi += n * 6; note = 'sneak attack'; }
      const dr = B.mod(t, 'dr'); lo = Math.max(1, lo - dr); hi = Math.max(1, hi - dr);
      const times = atkFx && atkFx.times ? atkFx.times : 1; if (times > 1) { note = (note ? note + ', ' : '') + times + ' strikes'; hi *= times; }
      pct = B.chance(u, t, sx, sy, atkFx && atkFx.atkMod, isShot);
    } else if (dmgFx) {
      const r = range(dmgFx.dice), p = dmgFx.pow ? u.pow : 0; lo = r[0] + p; hi = r[1] + p;
      if (dmgFx.vs && (t.tags || []).indexOf(dmgFx.vs) >= 0) { lo = Math.floor(lo * 1.5); hi = Math.floor(hi * 1.5); note = 'sears the ' + dmgFx.vs; }
      if (dmgFx.save === 'half') note = (note ? note + ', ' : '') + 'half if resisted';
    } else return null;
    lo = Math.max(0, lo); hi = Math.max(lo, hi);
    const ko = lo >= t.hp ? 'sure' : hi >= t.hp ? 'maybe' : null;
    return { t, pct, lo, hi, ko, note };
  };
  B.previewText = p => !p ? '' : (p.pct != null ? p.pct + '% to hit · ' : '') + 'damage ' + p.lo + (p.hi > p.lo ? '-' + p.hi : '') + (p.ko === 'sure' ? ' · will knock out' : p.ko === 'maybe' ? ' · could knock out' : '') + (p.note ? ' (' + p.note + ')' : '');
  // A small tag over the target: chance and damage, a red skull when it could fall; a ! over anyone a move would provoke.
  B.drawPreview = function (c) {
    const ui = B.ui; if (!ui) return;
    if (ui.preview && ui.preview.t && ui.preview.t.px != null) {
      const p = ui.preview, t = p.t, sz = B.pieceSize(t), txt = (p.pct != null ? p.pct + '%  ' : '') + p.lo + (p.hi > p.lo ? '-' + p.hi : '');
      c.font = 'bold 6px ui-monospace, Menlo, Consolas, monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
      const w = c.measureText(txt).width + (p.ko ? 9 : 4), x = Math.round(t.px - w / 2), y = Math.round(t.py - 33 * sz - 10);
      c.fillStyle = 'rgba(12,10,22,.9)'; c.fillRect(x, y, w, 8); c.strokeStyle = p.ko ? '#ff6a5a' : '#ffd24a'; c.lineWidth = 0.6; c.strokeRect(x + 0.3, y + 0.3, w - 0.6, 7.4);
      c.fillStyle = '#f4e6b8'; c.fillText(txt, x + (w - (p.ko ? 7 : 0)) / 2 + (p.ko ? 0 : 0), y + 4.3);
      if (p.ko) {                                                  // a little skull
        const sx = x + w - 5, sy = y + 4; c.fillStyle = p.ko === 'sure' ? '#ff5a4a' : '#ff9a7a';
        c.beginPath(); c.arc(sx, sy - 0.6, 2.2, 0, 7); c.fill(); c.fillRect(sx - 1.3, sy + 0.8, 2.6, 1.6);
        c.fillStyle = '#120c18'; c.fillRect(sx - 1.3, sy - 1, 0.9, 0.9); c.fillRect(sx + 0.4, sy - 1, 0.9, 0.9);
      }
      c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    }
    for (const e of ui.provokers || []) {
      if (e.px == null) continue; const sz = B.pieceSize(e), x = e.px + 9 * sz, y = e.py - 30 * sz, b = Math.sin(G.time / 120) * 1;
      c.fillStyle = '#120c18'; c.beginPath(); c.arc(x, y + b, 3.4, 0, 7); c.fill(); c.fillStyle = '#ffb04a'; c.beginPath(); c.arc(x, y + b, 2.7, 0, 7); c.fill();
      c.fillStyle = '#120c18'; c.fillRect(x - 0.45, y - 1.8 + b, 0.9, 2.2); c.fillRect(x - 0.45, y + 1 + b, 0.9, 0.8);
    }
  };
})();
