'use strict';
/* The Barrow Crown — engine core: namespace, dice, state, flags, input, loop.
   Everything hangs off the global G. Content lives in G.D (see data/). */
const G = {
  TILE: 16, W: 320, H: 240,
  D: { maps: {}, scripts: {} },
  S: null,                 // save state (plain JSON)
  modals: [], held: {}, scene: 'boot', time: 0, busy: 0,
  fast: false,             // skip waits and typewriter (tests, fast text)
  auto: false,             // party fights by itself (balance sims)
  opts: { music: true, sfx: true, textFast: false }
};

/* ---------- random and dice ---------- */
G.rand = Math.random;
G.ri = (a, b) => a + Math.floor(G.rand() * (b - a + 1));
G.pick = a => a[Math.floor(G.rand() * a.length)];
G.wpick = pairs => {                       // [[value, weight], ...]
  let t = 0; for (const p of pairs) t += p[1];
  let r = G.rand() * t;
  for (const p of pairs) { r -= p[1]; if (r < 0) return p[0]; }
  return pairs[pairs.length - 1][0];
};
G.d20 = () => G.ri(1, 20);
G.roll = (spec, crit) => {                 // "2d6+3", "4", 4. crit doubles the dice.
  if (typeof spec === 'number') return spec;
  const m = /^(\d+)d(\d+)([+-]\d+)?$/.exec(spec);
  if (!m) return parseInt(spec, 10) || 0;
  let n = +m[1]; if (crit) n *= 2;
  let t = 0; for (let i = 0; i < n; i++) t += G.ri(1, +m[2]);
  return t + (m[3] ? +m[3] : 0);
};
G.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
G.sleep = ms => G.fast ? Promise.resolve() : new Promise(r => setTimeout(r, ms));
G.Abort = class extends Error { constructor() { super('abort'); } };

/* ---------- flags and conditions ---------- */
G.flag = n => G.S.flags[n] || 0;
G.setFlag = (n, v) => { G.S.flags[n] = (v === undefined ? 1 : v); };
G.val = name => {
  if (name.startsWith('item.')) return G.S.bag[name.slice(5)] || 0;
  if (name === 'gold') return G.S.gold;
  if (name === 'level') return G.S.level;
  return G.S.flags[name] || 0;
};
// "flag", "!flag", "q.main>=2", "item.palecap>=3", joined with "&"
G.cond = expr => {
  if (!expr) return true;
  return expr.split('&').every(t => {
    t = t.trim(); let neg = false;
    if (t[0] === '!') { neg = true; t = t.slice(1); }
    const m = /^([\w.:#]+)\s*(>=|<=|=|>|<)\s*(-?\d+)$/.exec(t);
    let r;
    if (m) {
      const v = G.val(m[1]), n = +m[3], op = m[2];
      r = op === '>=' ? v >= n : op === '<=' ? v <= n : op === '=' ? v === n : op === '>' ? v > n : v < n;
    } else r = !!G.val(t);
    return neg ? !r : r;
  });
};

/* ---------- party ---------- */
// Stats grow on a 1-20 'power' scale spread over the 30 levels (D.powerScale), so each level adds a
// little and a level-30 hero is as strong as the 20-level design intended.
G.power = L => 1 + (L - 1) * (G.D.powerScale || 1);
// Experience hardens: +1 AC at levels 7, 13, 19 and 25, so armour keeps mattering as enemies grow more accurate
// (late foes would otherwise hit 85-95% of the time).
G.AC_LEVELS = [7, 13, 19, 25];
G.acSteps = L => G.AC_LEVELS.filter(l => L >= l).length;
G.stats = function (m) {
  // HP and SP grow smoothly; the stepped stats use power rounded to the nearest half, so a level that sits
  // just under a step (power 6.9, say) does not lose it.
  const c = G.D.classes[m.id], L = G.S.level, I = G.D.items, P = G.power(L), Q = Math.round(G.power(L) * 2) / 2;
  const st = {
    id: m.id, name: c.name, cls: c.cls, level: L, sprite: c.sprite, skill: c.skill, res: c.res,
    maxHp: c.hp[0] + Math.round(c.hp[1] * (P - 1)), maxSp: c.sp[0] + Math.round(c.sp[1] * (P - 1)), ac: c.ac + G.acSteps(L),
    atk: c.atk + Math.floor((Q - 1) / 2), dmgBonus: c.dmgBonus + Math.floor((Q - 1) / 3),
    pow: c.pow + Math.floor((Q - 1) / 2), save: c.save + Math.floor((Q - 1) / 3), spd: c.spd,
    skillBonus: 3 + Math.floor(Q / 2), dmg: '1d4',
    sneak: c.sneak ? 1 + Math.floor((Q - 1) / 2) : 0, abilities: [],
    shot: c.shot || null, melee: c.melee || null, engage: !!c.engage, perks: ((G.S.feats || {})[m.id] || []).slice()
  };
  for (const slot of ['weapon', 'armor', 'charm']) {
    const it = I[m.gear[slot]]; if (!it) continue;
    if (it.dmg) st.dmg = it.dmg;
    if (it.perk) st.perks.push(it.perk);
    if (it.mods) for (const k in it.mods) {
      if (k === 'hp') st.maxHp += it.mods[k]; else if (k === 'sp') st.maxSp += it.mods[k]; else st[k] += it.mods[k];
    }
  }
  const boon = G.S.boons && G.S.boons[m.id];
  if (boon) for (const k in boon) {
    if (k === 'hp') st.maxHp += boon[k]; else if (k === 'sp') st.maxSp += boon[k]; else st[k] += boon[k];
  }
  if (st.shot && st.perks.indexOf('sirenshot') >= 0) st.shot = Object.assign({}, st.shot, { range: st.shot.range + 1 });
  // Skills, level by level: at each level that teaches one, the player may have taken an improvement instead
  // (m.picks[level] = 'm:<id>'). A level with no pick recorded teaches its skill, so older saves keep everything.
  const mast = {};
  for (let l = 1; l <= L; l++) {
    const pk = l > 1 && m.picks && m.picks[l];
    if (pk && pk.startsWith('m:')) { const id = pk.slice(2); mast[id] = (mast[id] || 0) + 1; continue; }
    (c.learn[l] || []).forEach(a => st.abilities.push(a));
  }
  st.mastery = mast;
  for (const id in mast) G.MASTERY[id].apply(st, mast[id]);
  // critical hits: a natural 20, one number sooner for each source (the Smith's Edge, gear with mods.crit), never past 17-20
  st.critBonus = (st.critBonus || 0) + (G.flag('smithEdge') ? 1 : 0);
  st.critMin = Math.max(17, 20 - st.critBonus);
  return st;
};
/* ---------- level-up choices ----------
   Whenever a hero would learn a skill, the player picks: that skill, or a lasting improvement instead. The one
   passed up is gone. Each improvement can be taken up to three times; which one is offered rotates through the
   hero's own list, so the same pair never comes up twice in a row. The autopilot always takes the skill. */
G.MASTERY = {
  tough: { name: 'Tough', desc: '+10% health.', apply: (st, r) => { st.maxHp = Math.round(st.maxHp * (1 + 0.1 * r)); } },
  mighty: { name: 'Mighty', desc: '+1 damage with every weapon blow.', apply: (st, r) => { st.dmgBonus += r; } },
  sharp: { name: 'Sharp', desc: '+1 to hit.', apply: (st, r) => { st.atk += r; } },
  guarded: { name: 'Guarded', desc: '+1 AC: harder to hit.', apply: (st, r) => { st.ac += r; } },
  steady: { name: 'Steady', desc: '+1 to saves against spells, poisons and songs.', apply: (st, r) => { st.save += r; } },
  deep: { name: 'Deep Well', desc: '+20% skill points (at least 2 more).', apply: (st, r) => { st.maxSp += Math.max(2, Math.round(st.maxSp * 0.2)) * r; } },
  potent: { name: 'Potent', desc: '+1 power: spells and songs hit harder and are harder to resist.', apply: (st, r) => { st.pow += r; } },
  quick: { name: 'Quick', desc: '+1 speed: acts sooner in the round (and at speed 4, moves 4 squares).', apply: (st, r) => { st.spd += r; } }
};
G.MASTERY_ORDER = { runa: ['tough', 'mighty', 'guarded', 'sharp', 'steady', 'quick'], dask: ['sharp', 'quick', 'mighty', 'guarded', 'tough', 'steady'],
  maren: ['deep', 'steady', 'tough', 'potent', 'guarded', 'sharp'], finch: ['deep', 'quick', 'potent', 'sharp', 'steady', 'tough'] };
// What a hero is offered at a level: [skill ids, mastery id].
G.pickOffer = function (m, L) {
  const c = G.D.classes[m.id], skills = c.learn[L] || [];
  if (L <= 1 || !skills.length) return null;
  const order = G.MASTERY_ORDER[m.id] || Object.keys(G.MASTERY), before = Object.keys(c.learn).map(Number).filter(l => l > 1 && l < L).length;
  const taken = {}; for (const l in m.picks || {}) if (+l < L && String(m.picks[l]).startsWith('m:')) { const id = m.picks[l].slice(2); taken[id] = (taken[id] || 0) + 1; }
  for (let i = 0; i < order.length; i++) { const id = order[(before + i) % order.length]; if ((taken[id] || 0) < 3) return { skills, mastery: id, rank: (taken[id] || 0) + 1 }; }
  return { skills, mastery: null };
};
G.choosePick = function (m, L, pick) { m.picks = m.picks || {}; m.picks[L] = pick; G.clampParty(); };
// The choices waiting to be made (queued by level-ups), offered as soon as the party is free.
G.processPicks = async function () {
  const S = G.S; if (!S.pendingPicks || !S.pendingPicks.length) return;
  while (S.pendingPicks.length) {
    const [id, L] = S.pendingPicks.shift(), m = G.member(id), off = m && G.pickOffer(m, L);
    if (!off) continue;
    if (G.auto || G.autoPick || !off.mastery) { G.choosePick(m, L, 'skill'); continue; }
    const A = G.D.abilities, M = G.MASTERY[off.mastery], name = G.D.classes[id].name;
    const box = UI.el('div', 'win lvpick'); UI.root.appendChild(box);
    const show = v => { box.innerHTML = '<div class="lvh">' + UI.esc(name) + ' · level ' + L + '</div><div class="lvt">Choose one. The other is gone for good.</div>' +
      (v === 'skill' ? off.skills.map(a => '<div class="lvn">' + UI.esc(A[a].name) + (A[a].cost ? ' <em>(' + A[a].cost + ' ' + UI.esc(G.D.classes[id].res || 'SP') + ')</em>' : '') + '</div><div class="lvd">' + UI.esc(A[a].desc || '') + '</div>').join('')
        : '<div class="lvn">' + UI.esc(M.name) + (off.rank > 1 ? ' ' + 'I'.repeat(off.rank) : '') + '</div><div class="lvd">' + UI.esc(M.desc) + (off.rank > 1 ? ' (Taken ' + (off.rank - 1) + ' time' + (off.rank > 2 ? 's' : '') + ' already; up to three.)' : '') + '</div>'); };
    show('skill');
    const v = await UI.menu({ cls: 'lvmenu', title: 'Level ' + L, cancel: false, items: [{ label: 'Learn ' + off.skills.map(a => A[a].name).join(' & '), value: 'skill' }, { label: M.name + (off.rank > 1 ? ' ' + 'I'.repeat(off.rank) : ''), value: 'm:' + off.mastery }], onMove: it => show(it.value) });
    box.remove();
    G.choosePick(m, L, v || 'skill');
    G.audio.sfx('good');
  }
};
G.STATNAMES = { ac: 'AC', atk: 'Attack', dmgBonus: 'Damage', pow: 'Power', save: 'Save', spd: 'Speed', hp: 'HP', sp: 'SP' };
G.member = id => G.S.party.find(m => m.id === id);
G.healAll = () => G.S.party.forEach(m => { const s = G.stats(m); m.hp = s.maxHp; m.sp = s.maxSp; });
G.clampParty = () => G.S.party.forEach(m => { const s = G.stats(m); m.hp = Math.min(m.hp, s.maxHp); m.sp = Math.min(m.sp, s.maxSp); });
G.give = (id, n = 1) => { G.S.bag[id] = (G.S.bag[id] || 0) + n; if (G.S.bag[id] <= 0) delete G.S.bag[id]; };
G.has = id => G.S.bag[id] || 0;
// Levels have no chapter caps: the only ceiling is level 30. Grinding limits itself instead: every fight has a level
// (its suggested level, D.fightLevels in s_levels.js), and a party above it earns less: half per level over, so at
// three over a fight is worth an eighth. Quests always pay in full. G.xpFor gives the share a fight pays.
G.levelCap = () => G.D.xpTable.length - 1;
G.capLocked = () => false;
G.xpBank = cap => G.D.xpTable[cap - 1];
G.groupLevel = gid => ((G.D.fightLevels || {}).groups || {})[gid] || 0;
G.mapLevel = map => { const r = ((G.D.fightLevels || {}).maps || {})[map]; return r ? r[1] : 0; };
G.xpFor = lvl => !lvl || G.S.level <= lvl ? 1 : Math.pow(0.5, G.S.level - lvl);
// Adds XP and applies level-ups. G.xpGained holds what was actually added.
G.gainXp = function (n) {
  // each chapter's XP is scaled so its content pays about its six levels to a party that does everything
  n = Math.round(n * ((G.D.xpScale || {})[G.flag('chapter') || 1] || 1));
  const S = G.S, T = G.D.xpTable, out = [], cap = G.levelCap(), before = S.xp, wasCapped = S.level >= cap;
  S.xp += n;
  let leveled = false;
  while (S.level < cap && S.xp >= T[S.level]) {
    S.level++; leveled = true;
    out.push('Level up! The party is now level ' + S.level + '.');
    if (G.AC_LEVELS.includes(S.level)) out.push('Hard-won experience: everyone is a little harder to hit (+1 AC).');
    for (const m of S.party) {
      const c = G.D.classes[m.id];
      if ((c.learn[S.level] || []).length) { (S.pendingPicks = S.pendingPicks || []).push([m.id, S.level]); out.push(c.name + ' can learn ' + c.learn[S.level].map(a => G.D.abilities[a].name).join(' & ') + ', or take an improvement instead.'); }
    }
  }
  if (S.level >= cap) {
    S.xp = Math.min(S.xp, G.xpBank(cap));
    if (!wasCapped) out.push('Level ' + cap + ': as strong as anyone has ever been. Fights still leave spoils.');
  }
  G.xpGained = Math.max(0, S.xp - before);
  if (leveled) G.healAll();
  return out;
};
// Where the party stands: share of the way to the next level (capped: true only at level 30).
G.xpProgress = function () {
  const S = G.S, T = G.D.xpTable, cap = G.levelCap(), L = S.level;
  if (L >= cap) { const lo = T[cap - 1], hi = G.xpBank(cap); return { capped: true, have: S.xp - lo, need: hi - lo, pct: hi > lo ? Math.round(100 * (S.xp - lo) / (hi - lo)) : 100 }; }
  const lo = T[L - 1] || 0, hi = T[L];
  return { capped: false, have: S.xp - lo, need: hi - lo, pct: Math.round(100 * (S.xp - lo) / (hi - lo)), next: L + 1, toGo: hi - S.xp };
};


G.newGame = function () {
  const D = G.D;
  G.S = {
    v: 1, map: D.start.map, x: 0, y: 0, dir: 'up', gold: D.start.gold, xp: 0, level: 1,
    party: D.partyOrder.map(id => ({ id, hp: 1, sp: 0, gear: Object.assign({}, D.classes[id].gear) })),
    bag: Object.assign({}, D.start.bag), flags: {}, respawn: { map: D.start.map, at: D.start.at }, time: 0
  };
  G.healAll();
};

/* ---------- saving ---------- */
// Three save slots. Slot 1 keeps the old single-save key, so earlier saves turn up there. G.slot is the slot this
// game saves into (autosaves too); the last one used is remembered in the options.
G.SAVE_KEY = 'barrowcrown.save.v1';
G.SLOTS = 3;
G.slot = 1;
G.slotKey = n => n === 1 ? G.SAVE_KEY : G.SAVE_KEY + '.s' + n;
G.tutorial = () => !!(G.S && G.S.flags.tut && !G.S.flags.joined);
G.save = (n) => {
  if (G.tutorial()) return false;
  if (n) G.slot = n;
  try { G.S.savedAt = Date.now(); localStorage.setItem(G.slotKey(G.slot), JSON.stringify(G.S)); G.opts.lastSlot = G.slot; G.saveOpts(); return true; } catch (e) { return false; }
};
G.loadSlot = n => { try { const s = localStorage.getItem(G.slotKey(n)); return s ? JSON.parse(s) : null; } catch (e) { return null; } };
// The most recently saved slot (for Continue).
G.latestSlot = () => { let best = 0, t = -1; for (let n = 1; n <= G.SLOTS; n++) { const s = G.loadSlot(n); if (s && (s.savedAt || 0) > t) { t = s.savedAt || 0; best = n; } } return best; };
G.loadSave = () => { const n = G.latestSlot(); return n ? G.loadSlot(n) : null; };
// About a slot, for menus: { label: 'Slot 2 · Ch 3, Karrow Hold', right: 'Lv 15 · 3h 12m' }.
G.slotInfo = n => {
  const s = G.loadSlot(n); if (!s) return { label: 'Slot ' + n + ' · empty', right: '', empty: true };
  const m = G.D.maps[s.map], mins = Math.floor((s.time || 0) / 60000);
  return { label: 'Slot ' + n + ' · Ch ' + ((s.flags && s.flags.chapter) || 1) + ', ' + ((m && m.name) || s.map), right: 'Lv ' + s.level + ' · ' + Math.floor(mins / 60) + 'h ' + String(mins % 60).padStart(2, '0') + 'm' };
};
G.slotLine = n => { const i = G.slotInfo(n); return i.label + (i.right ? ' · ' + i.right : ''); };
// Pick a slot. mode 'save' (current slot first, asks before overwriting another), 'load' (filled slots only) or 'new'.
G.pickSlot = async function (mode, cls) {
  const items = [];
  for (let n = 1; n <= G.SLOTS; n++) {
    const i = G.slotInfo(n), s = G.loadSlot(n);
    if (cls) items.push({ label: i.label, right: i.right, value: n, disabled: mode === 'load' && i.empty });
    else items.push({ label: 'Slot ' + n + (n === G.slot ? ' ★' : ''), right: s ? 'Ch ' + ((s.flags && s.flags.chapter) || 1) : '—', value: n, disabled: mode === 'load' && i.empty });
  }
  // in the game menu, the details go in the big pane
  const show = it => { if (cls || typeof Menu === 'undefined') return; const s = G.loadSlot(it.value), i = G.slotInfo(it.value);
    Menu.pane('<div class="sumhead">Slot ' + it.value + (it.value === G.slot ? ' (this game)' : '') + '</div>' + (s ? '<div>' + UI.esc(i.label.replace(/^Slot \d+ · /, '')) + '</div><div class="dim">Level ' + s.level + ' · played ' + i.right.split(' · ')[1] + '</div><div class="dim">Saved ' + (s.savedAt ? new Date(s.savedAt).toLocaleString() : 'some time ago') + '</div>' : '<div class="dim">Empty.</div>'), true); };
  const title = { save: 'Save to which slot?', load: 'Load which slot?', new: 'Start the new game in which slot?' }[mode];
  const n = await UI.menu({ title, items, cls: cls || '', style: cls ? '' : Menu.NAV + 'width:100rem;', onMove: show, start: Math.max(0, (mode === 'save' ? G.slot : G.latestSlot() || 1) - 1) });
  if (!n) return null;
  if ((mode === 'new' || (mode === 'save' && n !== G.slot)) && G.loadSlot(n)) {
    const ok = await UI.menu({ title: 'Slot ' + n + ' already has a game in it. Overwrite it?', cls: cls || '', items: [{ label: 'Overwrite it', value: 1 }, { label: 'Go back', value: 0 }] });
    if (!ok) return null;
  }
  return n;
};
G.exportCode = () => btoa(unescape(encodeURIComponent(JSON.stringify(G.S))));
G.importCode = code => {
  try {
    const s = JSON.parse(decodeURIComponent(escape(atob(String(code).replace(/\s+/g, '')))));
    if (s && s.v === 1 && Array.isArray(s.party) && G.D.maps[s.map]) return s;
  } catch (e) { /* bad code */ }
  return null;
};
G.loadOpts = () => {
  try { Object.assign(G.opts, JSON.parse(localStorage.getItem('barrowcrown.opts') || '{}')); } catch (e) { /* defaults */ }
  // E became the main confirm / interact key (it used to be a second End-turn key). Saved bindings get it once,
  // unless the player has put E on something of their own.
  if (G.opts.keys && !G.opts.keysV) {
    const k = G.opts.keys, onE = Object.keys(k).filter(id => (k[id] || []).map(G.normKey).includes('e'));
    if (!onE.length || (onE.length === 1 && onE[0] === 'bt_end')) {
      if (k.bt_end) { k.bt_end = k.bt_end.filter(x => G.normKey(x) !== 'e'); if (!k.bt_end.length) k.bt_end = ['7', 'n']; }
      k.a = ['e'].concat((k.a || ['z', 'Enter']).filter(x => G.normKey(x) !== 'e')).slice(0, 3);
    }
  }
  // Z and C became the battle board's turn keys. Saved bindings get them once, unless the player has given them
  // to another board key.
  if (G.opts.keys && (G.opts.keysV || 0) < 3) {
    const k = G.opts.keys, onBoard = key => G.BOARD_KEYS.some(id => (k[id] || []).map(G.normKey).includes(key));
    for (const [id, key] of [['rot_l', 'z'], ['rot_r', 'c']]) if (Array.isArray(k[id]) && !onBoard(key)) k[id] = [key].concat(k[id]).slice(0, 3);
  }
  G.opts.keysV = 3;
};
// '{a}', '{b}', '{menu}' and so on in a message become the key bound to that action ('Press {a}' -> 'Press E').
G.keyText = s => String(s).replace(/\{([a-z_]+)\}/g, (m, id) => { const k = (G.bindings()[id] || [])[0]; return k ? G.keyName(k) : m; });
G.saveOpts = () => { try { localStorage.setItem('barrowcrown.opts', JSON.stringify(G.opts)); } catch (e) { /* ignore */ } };

/* ---------- input ---------- */
// Every action and its default keys (up to three each). Players rebind them in Options > Controls; the result is
// kept in G.opts.keys. Single characters are stored lower-case, so W and w are the same key.
G.ACTIONS = [
  ['up', 'Move up', ['ArrowUp', 'w']], ['down', 'Move down', ['ArrowDown', 's']], ['left', 'Move left', ['ArrowLeft', 'a']], ['right', 'Move right', ['ArrowRight', 'd']],
  ['a', 'Interact / OK', ['e', 'z', 'Enter']], ['b', 'Cancel / back', ['x', 'Escape', 'Backspace']],
  ['menu', 'Main menu', ['Tab', 'q']], ['map', 'Map', ['m']], ['items', 'Items', ['i']], ['party', 'Party & skills', ['p', 'k']],
  ['gear', 'Gear', ['g']], ['journal', 'Journal', ['j']], ['options', 'Options', ['o']], ['guide', 'Guide', ['h']], ['save', 'Quick save', ['F5']],
  ['switch', 'Switch leader', ['c']], ['ability', 'Leader ability', ['f']], ['run', 'Run (hold)', ['Shift']],
  ['bt_attack', 'Attack', ['1']], ['bt_shot', 'Shoot / throw', ['2']], ['bt_skills', 'Skills', ['3']], ['bt_items', 'Battle items', ['4']],
  ['bt_move', 'Move', ['5']], ['bt_defend', 'Defend', ['6']], ['bt_end', 'End turn / flee', ['7', 'n']],
  ['bt_undo', 'Undo move', ['u', '8']],
  ['bview', 'Flat or diamond board', ['v']], ['rot_l', 'Turn board left', ['z', '[', ',']], ['rot_r', 'Turn board right', ['c', ']', '.']], ['threat', 'Show enemy reach', ['t']]
];
// Headings for the Controls screen: the first action of each group.
G.ACTION_GROUPS = { up: 'Moving and choosing', menu: 'Menus (while exploring)', switch: 'Exploring', bt_attack: 'Battle commands', bview: 'Battle board' };
G.REQUIRED = ['up', 'down', 'left', 'right', 'a', 'b'];         // these always keep at least one key
// The battle board's keys only work in a fight, and there they come first, so they can share keys with exploring:
// Z and C turn the board in battle, while Z is still OK and C still switches leader everywhere else.
G.BOARD_KEYS = ['bview', 'rot_l', 'rot_r', 'threat'];
G.keyLayer = id => G.BOARD_KEYS.includes(id) ? 1 : 0;
G.normKey = k => (k && k.length === 1 ? k.toLowerCase() : k);
G.keyName = k => ({ Shift: 'Shift', ' ': 'Space', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Escape: 'Esc', Backspace: 'Bksp', Enter: 'Enter' }[k] || (k && k.length === 1 ? k.toUpperCase() : k) || '—');
G.defaultKeys = () => Object.fromEntries(G.ACTIONS.map(a => [a[0], a[2].slice()]));
G.bindings = () => {
  const def = G.defaultKeys(), mine = G.opts.keys || {};
  for (const id in def) if (Array.isArray(mine[id])) def[id] = mine[id].filter(Boolean).slice(0, 3);
  return def;
};
G.buildKeymap = () => {
  const b = G.bindings(); G.KEYMAP = {}; G.BKEYMAP = {};
  for (const id in b) for (const k of b[id]) (G.keyLayer(id) ? G.BKEYMAP : G.KEYMAP)[G.normKey(k)] = id;
};
// Binds key to slot n of action id; the key is taken off any other action of the same kind (battle board keys and
// the rest are kept apart). Returns the action it was taken from.
G.bindKey = (id, n, key) => {
  key = G.normKey(key); const b = G.bindings(); let took = null;
  for (const other in b) { if (G.keyLayer(other) !== G.keyLayer(id)) continue; const at = b[other].map(G.normKey).indexOf(key); if (at >= 0 && !(other === id && at === n)) { b[other].splice(at, 1); took = other; } }
  const list = b[id]; while (list.length < n) list.push(null); list[n] = key; b[id] = list.filter(Boolean).slice(0, 3);
  G.opts.keys = b; G.buildKeymap(); G.saveOpts();
  return took;
};
G.clearKey = (id, n) => {
  const b = G.bindings(); if (G.REQUIRED.includes(id) && b[id].length <= 1) return false;
  b[id].splice(n, 1); G.opts.keys = b; G.buildKeymap(); G.saveOpts(); return true;
};
G.resetKeys = id => { const b = G.bindings(), d = G.defaultKeys(); if (id) b[id] = d[id]; G.opts.keys = id ? b : undefined; if (!id) delete G.opts.keys; G.buildKeymap(); G.saveOpts(); };
G.missingKeys = () => G.REQUIRED.filter(id => !G.bindings()[id].length);
G.HOTKEYS = ['menu', 'map', 'items', 'party', 'gear', 'journal', 'options', 'save', 'guide'];
G.KEYMAP = {}; G.BKEYMAP = {};
G.keyAction = key => { key = G.normKey(key); return (G.scene === 'battle' && G.BKEYMAP[key]) || G.KEYMAP[key]; };
G.dirOrder = [];   // most recent direction last
G.press = function (btn) {
  G.audio.unlock();
  if (G.cine && btn === 'b') { G.skipPress(); return; }
  const m = G.modals[G.modals.length - 1];
  if (m) { if (m.press) m.press(btn); return; }
  if (G.scenePress) G.scenePress(btn);
};
// In a cutscene, X twice skips to its end. Choices inside still wait for the player.
G.moves = [];
G.skipPress = function () {
  const c = G.cine; if (!c || c.skip) return;
  if (c.armed && G.time - c.armed < 1800) {
    c.skip = true; G.fast = true; UI.letterbox(true, 'Skipping...');
    let m; while ((m = G.modals[G.modals.length - 1]) && m.skip) m.skip();
  } else {
    c.armed = G.time; UI.letterbox(true, 'Press {b} again to skip');
    setTimeout(() => { if (G.cine === c && !c.skip) UI.letterbox(true); }, 1800);
  }
};
G.down = function (b, repeat) {
  if (b === 'bview' || b === 'rot_l' || b === 'rot_r' || b === 'threat') {   // the battle board's view: works even mid-choice
    if (!repeat && G.scene === 'battle' && !G.keyCapture) { G.audio.unlock(); if (b === 'bview') B.toggleView(); else if (b === 'threat') B.toggleThreat(); else B.turnView(b === 'rot_l' ? -1 : 1); }
    return;
  }
  if (G.HOTKEYS.includes(b)) { if (!repeat) G.hotkey(b); return; }
  if (repeat) { if (G.modals.length && (b === 'up' || b === 'down' || b === 'left' || b === 'right')) G.press(b); return; }
  if (G.held[b]) return;
  G.held[b] = true;
  if (b === 'up' || b === 'down' || b === 'left' || b === 'right') { G.dirOrder = G.dirOrder.filter(d => d !== b); G.dirOrder.push(b); }   // only real directions (holding C or F used to crash the field)
  G.press(b);
};
// A menu hotkey works from the field; pressed again while its menu is open, it backs out.
G.hotkey = function (h) {
  G.audio.unlock();
  if (G.keyCapture) return;
  if (G.modals.length) { if (G.menu && G.menu.hot === h) G.press('b'); return; }
  if (G.scene === 'field' && G.scenePress && !G.busy && !Field.p.moving && !G.cine) Field.exec(() => G.menu.openHot(h));
};
G.up = function (b) { G.held[b] = false; G.dirOrder = G.dirOrder.filter(d => d !== b); };
G.initInput = function () {
  G.buildKeymap();
  window.addEventListener('keydown', e => {
    const t = e.target && e.target.tagName;
    if (t === 'TEXTAREA' || t === 'INPUT') return;
    if (G.keyCapture) { e.preventDefault(); e.stopPropagation(); if (!e.repeat) G.keyCapture(e.key); return; }
    const b = G.keyAction(e.key); if (!b) return;
    e.preventDefault(); G.down(b, e.repeat);
  });
  window.addEventListener('keyup', e => { const k = G.normKey(e.key); for (const b of [G.KEYMAP[k], G.BKEYMAP[k]]) if (b) G.up(b); });
  window.addEventListener('blur', () => { G.held = {}; G.dirOrder = []; });
  // touch pad
  document.querySelectorAll('[data-btn]').forEach(el => {
    const b = el.getAttribute('data-btn');
    const dn = e => { e.preventDefault(); el.classList.add('on'); G.down(b, false); };
    const up = e => { e.preventDefault(); el.classList.remove('on'); G.up(b); };
    el.addEventListener('touchstart', dn, { passive: false });
    el.addEventListener('touchend', up, { passive: false });
    el.addEventListener('touchcancel', up, { passive: false });
    el.addEventListener('mousedown', dn); el.addEventListener('mouseup', up); el.addEventListener('mouseleave', up);
  });
};

/* ---------- layout: 1rem = one logical pixel ---------- */
G.layout = function () {
  const touch = document.body.classList.contains('touch');
  const vw = window.innerWidth, vh = window.innerHeight - (touch ? 150 : 0);
  let s = Math.min(vw / G.W, vh / G.H);
  if (s >= 2) s = Math.floor(s);            // crisp integer scale on desktop
  s = Math.max(0.75, s);
  document.documentElement.style.fontSize = s + 'px';
  G.scale = s;
  if (G.scene === 'battle' && typeof B !== 'undefined' && B.fitRes) B.fitRes();   // a turned phone or a resized window: repaint the board at the new size
};

/* ---------- main loop ---------- */
G.loop = function (t) {
  const dt = Math.min(50, t - (G.last || t)); G.last = t; G.time += dt;
  if (G.S && G.scene !== 'title') G.S.time = (G.S.time || 0) + dt;
  if (G.scene === 'field') Field.update(dt);
  const c = G.ctx;
  c.imageSmoothingEnabled = false;
  if (G.scene === 'field') Field.draw(c);
  else if (G.scene === 'battle') B.draw(c);
  else if (G.scene === 'title') Title.draw(c);
  requestAnimationFrame(G.loop);
};
