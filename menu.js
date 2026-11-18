/* Field menu (party, items, gear, journal, save, options) and shops. */
const Menu = G.menu = {};
Menu.NAV = 'left:6rem;top:6rem;width:78rem;';
Menu.PANE = 'left:88rem;top:6rem;width:226rem;height:188rem;';
Menu.LIST = 'left:88rem;top:6rem;width:226rem;max-height:188rem;';
Menu.DESC = 'left:6rem;top:198rem;width:308rem;height:36rem;';

Menu.PANE_NARROW = 'left:112rem;top:6rem;width:202rem;height:188rem;';
Menu.PANE_OPTIONS = 'left:178rem;top:6rem;width:136rem;height:188rem;font-size:8rem;line-height:10.5rem;';   // beside the options list
Menu.PANE_JOURNAL = 'left:126rem;top:6rem;width:188rem;height:188rem;';    // beside the journal's wider list     // beside the wider journal and options lists
Menu.pane = function (html, narrow) {
  if (!Menu.paneEl) { Menu.paneEl = UI.el('div', 'win pane'); UI.root.appendChild(Menu.paneEl); }
  Menu.paneEl.style.cssText = narrow === 'options' ? Menu.PANE_OPTIONS : narrow === 'journal' ? Menu.PANE_JOURNAL : narrow ? Menu.PANE_NARROW : Menu.PANE;
  Menu.paneEl.innerHTML = html;
};
Menu.desc = function (text, html) {
  if (!Menu.descEl) { Menu.descEl = UI.el('div', 'win desc'); Menu.descEl.style.cssText = Menu.DESC; UI.root.appendChild(Menu.descEl); }
  const el = Menu.descEl; if (html) el.innerHTML = text || ''; else el.textContent = text || ''; el.style.fontSize = ''; el.style.lineHeight = '';
  // a long description (a verse, a long ability) steps its text down until it fits, rather than being cut off
  for (let fs = 8.5; el.scrollHeight > el.clientHeight + 1 && fs >= 6.5; fs -= 0.5) { el.style.fontSize = fs + 'rem'; el.style.lineHeight = (fs * 1.3).toFixed(1) + 'rem'; }
};
Menu.close = function () {
  if (Menu.paneEl) Menu.paneEl.remove(); if (Menu.descEl) Menu.descEl.remove(); if (Menu.shade) Menu.shade.remove();
  Menu.paneEl = Menu.descEl = Menu.shade = null; UI.root.classList.remove('menuopen');
};
Menu.summary = function () {
  const S = G.S, T = G.D.xpTable;
  const pr = G.xpProgress();
  let h = '<div class="sumhead">Level ' + S.level + ' ' + UI.bar(pr.have, pr.need, pr.capped ? 'bank' : 'xp') + (pr.capped ? 'cap · bank ' + pr.pct + '%' : pr.toGo + ' XP to ' + pr.next) + ' &nbsp; <span class="gold">' + S.gold + ' gold</span></div>';
  for (const m of S.party) {
    const st = G.stats(m);
    h += '<div class="sumrow"><div class="sn"><b style="color:' + G.D.speakers[st.name] + '">' + st.name + '</b> <span class="dim">' + st.cls + '</span></div>' +
      '<div class="sv">HP ' + UI.bar(m.hp, st.maxHp, 'hp') + ' ' + m.hp + '/' + st.maxHp + '</div>' +
      '<div class="sv">' + st.res + ' ' + UI.bar(m.sp, st.maxSp, 'sp') + ' ' + m.sp + '/' + st.maxSp + '</div></div>';
  }
  return h;
};
Menu.pickMember = function (title) {
  return UI.menu({
    title: title || 'Who?', style: Menu.LIST,
    items: G.S.party.map(m => { const st = G.stats(m); return { label: st.name, right: 'HP ' + m.hp + '/' + st.maxHp + '  ' + st.res + ' ' + m.sp + '/' + st.maxSp, value: m }; })
  });
};

Menu.open = async function () {
  G.audio.sfx('select');
  Menu.shade = UI.el('div', 'shade'); UI.root.appendChild(Menu.shade); UI.root.classList.add('menuopen');
  let start = 0;
  for (;;) {
    Menu.pane(Menu.summary()); Menu.desc(Field.map.def.name || '');
    const pick = await UI.menu({
      style: Menu.NAV, start,
      items: ['Party', 'Items', 'Gear', 'Journal', 'Guide', 'Map', 'Save', 'Options', 'Quit', 'Close'].map((l, i) => ({ label: l, value: [0, 1, 2, 3, 9, 7, 4, 5, 8, 6][i], right: Menu.keyHint(['party', 'items', 'gear', 'journal', 'guide', 'map', 'save', 'options', null, null][i]) })),
      onMove: it => Menu.desc({ 0: 'Abilities and stats.', 1: 'Use what you are carrying.', 2: 'Change weapons, armour and charms.', 3: 'Quests in progress.', 7: 'Where you are, and the places you have found.', 4: 'Save your progress in this browser.', 5: 'Sound, text speed, save codes, controls.', 6: 'Back to the game.', 8: 'Back to the title screen. You can save first.' , 9: 'How the game works: controls, exploring, combat rules, growing stronger, puzzles and saving.' }[it.value])
    });
    if (pick == null || pick === 6) break;
    if (pick === 7) { start = 5; const to = await Menu.map(); if (to) { Menu.close(); await Menu.travel(to); return; } continue; }
    if (pick === 8) { start = 8; if (await Menu.quitToTitle()) return; continue; }
    if (pick === 9) { start = 4; await Menu.guide(); continue; }
    start = pick < 4 ? pick : pick + 2;
    if (pick === 0) await Menu.party();
    else if (pick === 1) await Menu.items();
    else if (pick === 2) await Menu.gear();
    else if (pick === 3) await Menu.journal();
    else if (pick === 4 && G.tutorial()) { G.audio.sfx('error'); UI.toast('You can save once the brawl is over.'); }
    else if (pick === 4) { const n = await G.pickSlot('save'); if (n) { const ok = G.save(n); G.audio.sfx(ok ? 'good' : 'error'); UI.toast(ok ? 'Saved to slot ' + n + '.' : 'Could not save here. Use Options > Export save.'); } }
    else if (pick === 5) { if (await Menu.options()) break; }
  }
  Menu.close();
};

// Back to the title screen: save first (not during the opening brawl, which cannot be saved), or leave without saving.
Menu.quitToTitle = async function () {
  const tut = G.tutorial && G.tutorial();
  const opts = tut ? ['Quit', 'Stay'] : ['Save and quit', 'Quit without saving', 'Stay'];
  Menu.desc(tut ? 'The opening brawl cannot be saved: it starts over next time.' : 'Save and quit saves to slot ' + (G.slot || 1) + '. Quit without saving loses anything since your last save.');
  const i = await UI.menu({ title: 'Quit to title?', style: Menu.NAV + 'top:110rem;width:150rem;', items: opts.map((l, k) => ({ label: l, value: k })) });
  if (i == null || i === opts.length - 1) return false;
  if (!tut && i === 0) { const ok = G.save(G.slot || 1); if (!ok) { G.audio.sfx('error'); UI.toast('Could not save here. Use Options > Export save.'); return false; } UI.toast('Saved to slot ' + (G.slot || 1) + '.'); }
  Menu.close(); UI.hideDlg(); if (UI.hint) UI.hint(null); if (UI.letterbox) UI.letterbox(false);
  await UI.fade(true, 300);
  G.cine = false; Field.lastName = null;
  setTimeout(() => { G.busy = 0; UI.fade(false, 300); G.title.show(); }, 0);   // after the menu's own lock is released
  return true;
};

/* ---------- the guide ----------
   Main menu > Guide (or its key): every rule and convenience worth knowing, one short page per topic, grouped. The pages
   are in data/ch9_world/p_guide.js; keys in them are the player's own (G.keyText). */
Menu.guidePage = function (title, text) {
  const body = G.keyText(text).split('\n\n').map(par => {
    const lines = par.split('\n');
    if (lines.every(l => l.startsWith('· '))) return '<div style="margin:0 0 4rem">' + lines.map(l => '<div style="padding-left:7rem;text-indent:-7rem">· ' + UI.esc(l.slice(2)) + '</div>').join('') + '</div>';
    return '<div style="margin:0 0 4rem">' + lines.map(UI.esc).join('<br>') + '</div>';
  }).join('');
  return '<div class="sumhead">' + UI.esc(title) + '</div><div class="guide" style="font-size:8rem;line-height:10.5rem">' + body + '</div>';
};
Menu.guide = async function () {
  const items = [];
  for (const [group, pages] of G.D.guide || []) { items.push({ head: true, label: group }); for (const [title, text] of pages) items.push({ label: title, value: title, text }); }
  let start = 1;
  for (;;) {
    const pick = await UI.menu({ title: 'Guide', cls: 'journal', style: Menu.NAV + 'width:114rem;max-height:188rem;', start, items,
      onMove: it => { Menu.pane(Menu.guidePage(it.label, it.text), 'journal'); Menu.desc(''); } });
    if (pick == null) return;
    start = Math.max(1, items.findIndex(it => it.value === pick));
  }
};

/* ---------- party ---------- */
Menu.sheet = function (m) {
  const st = G.stats(m), I = G.D.items;
  const g = s => m.gear[s] ? I[m.gear[s]].name : '—';
  return '<div class="sumhead"><b style="color:' + G.D.speakers[st.name] + '">' + st.name + '</b> — ' + st.cls + ', level ' + st.level + '</div>' +
    '<div class="stats"><span>HP ' + m.hp + '/' + st.maxHp + '</span><span>' + st.res + ' ' + m.sp + '/' + st.maxSp + '</span><span>AC ' + st.ac + '</span>' +
    '<span>Attack +' + st.atk + '</span><span>Damage ' + st.dmg + '+' + st.dmgBonus + '</span><span>Power +' + st.pow + '</span>' +
    '<span>Save +' + st.save + '</span><span>Speed +' + st.spd + '</span><span>' + st.skill + ' +' + st.skillBonus + '</span></div>' +
    '<div class="dim">Weapon: ' + g('weapon') + '<br>Armour: ' + g('armor') + '<br>Charm: ' + g('charm') + '</div>' +
    (G.S.boons && G.S.boons[m.id] ? '<div class="dim gold">Boons: ' + Object.keys(G.S.boons[m.id]).map(k => (G.STATNAMES[k] || k) + ' +' + G.S.boons[m.id][k]).join(', ') + '</div>' : '') +
    (st.critMin < 20 ? '<div class="dim gold">Critical hits on ' + st.critMin + '-20' + (G.flag('smithEdge') ? " (the Smith's Edge)" : '') + '.</div>' : '') +
    (st.sneak ? '<div class="dim">Sneak Attack: +' + st.sneak + 'd6 against a foe standing next to an ally, or one that is marked, rattled, weakened, asleep or stunned.</div>' : '') +
    (st.perks.length ? '<div class="dim gold">' + st.perks.map(k => { const f = (G.D.perks || {})[k]; return f ? '<b>' + f.name + '</b>: ' + f.desc : ''; }).join('<br>') + '</div>' : '') +
    (Object.keys(st.mastery || {}).length ? '<div class="dim gold">Improvements: ' + Object.entries(st.mastery).map(([k, n]) => G.MASTERY[k].name + (n > 1 ? ' ' + 'I'.repeat(n) : '')).join(', ') + '</div>' : '') +
    Menu.bondLine(m.id);
};
// Bonds on the character sheet: for Runa, each companion's trust in her; for a companion, that and their friendships.
Menu.bondLine = function (id) {
  const N = { runa: 'Runa', dask: 'Dask', maren: 'Maren', finch: 'Finch' }, others = ['dask', 'maren', 'finch'].filter(x => x !== id);
  const parts = id === 'runa' ? others.map(o => N[o] + ' ' + G.bondTier('runa', o).toLowerCase())
    : ['Trusts Runa: ' + G.bondTier('runa', id).toLowerCase()].concat(others.map(o => 'with ' + N[o] + ': ' + G.bondTier(id, o).toLowerCase()));
  // what the bonds are doing for the party just now (bonds.js)
  const fx = [], sc = w => G.bondScale(w);
  const TRUST = { dask: ['Dask will not haggle (+5% prices)', '', 'Dask haggles (-5% prices)', 'Dask haggles hard (-10% prices)'],
    maren: ['Maren\'s prayers are weaker', '', 'Maren\'s prayers are stronger', 'Maren\'s prayers are much stronger'],
    finch: ['Finch\'s songs pay less', '', 'Finch\'s songs pay more', 'Finch\'s songs pay half again'] };
  for (const o of (id === 'runa' ? others : [id])) {
    const k = sc(o); if (TRUST[o][k + 1]) fx.push(TRUST[o][k + 1]);
    if (k >= 1) fx.push(N[o] + ' beside Runa in a fight: +1 AC both' + (k >= 2 ? ', +1 to hit' : ''));
    if (k < 0) fx.push(N[o] + ' beside Runa in a fight: -1 AC');
  }
  if (id !== 'runa') for (const o of others) { const v = G.bond(id, o);
    if (v >= 3) fx.push('beside ' + N[o] + ': +1 to hit' + (v >= 6 ? ', +1 AC' : '') + '; patch up after a win');
    if (v <= -2) fx.push('beside ' + N[o] + ': -1 to hit'); }
  return '<div class="dim">' + (id === 'runa' ? 'Trust: ' : '') + UI.esc(parts.join(' · ')) + '</div>' + (fx.length ? '<div class="dim" style="font-size:90%">' + UI.esc(fx.join(' · ')) + '</div>' : '');
};
Menu.party = async function () {
  const A = G.D.abilities;
  let mi = 0;
  for (;;) {
    const m = await UI.menu({
      title: 'Party', style: Menu.NAV, start: mi,
      items: G.S.party.map((p, i) => ({ label: G.D.classes[p.id].name, value: i })),
      onMove: it => { Menu.pane(Menu.sheet(G.S.party[it.value])); Menu.desc(''); }
    });
    if (m == null) return;
    mi = m;
    const mem = G.S.party[m];
    for (;;) {
      const st = G.stats(mem);
      Menu.pane(Menu.sheet(mem));
      const id = await UI.menu({
        title: st.name + "'s abilities", style: 'left:88rem;top:112rem;width:226rem;max-height:82rem;',
        items: st.abilities.map(a => ({ label: A[a].name, right: A[a].cost + ' ' + st.res, value: a })),
        onMove: it => Menu.desc(A[it.value].desc + (A[it.value].field ? ' Usable here.' : ''))
      });
      if (!id) break;
      const ab = A[id];
      if (!ab.field) { G.audio.sfx('error'); Menu.desc('That only works in battle.'); await G.sleep(700); continue; }
      if (mem.sp < ab.cost) { G.audio.sfx('error'); Menu.desc('Not enough ' + st.res + '.'); await G.sleep(700); continue; }
      let targets;
      if (ab.target === 'allAllies') targets = G.S.party;
      else { const t = await Menu.pickMember('Use on whom?'); if (!t) continue; targets = [t]; }
      mem.sp -= ab.cost; Menu.applyField(ab.fx, targets, st);
    }
  }
};
// Out-of-battle effects: healing and SP only.
Menu.applyField = function (fx, targets, userSt) {
  for (const e of fx) for (const t of targets) {
    const st = G.stats(t);
    if (e.t === 'heal') t.hp = Math.min(st.maxHp, t.hp + G.roll(e.dice) + (e.pow && userSt ? userSt.pow : 0));
    else if (e.t === 'sp') t.sp = Math.min(st.maxSp, t.sp + e.n);
  }
  G.audio.sfx('heal');
};

/* ---------- patching up ----------
   Tops the party up with healing draughts, spending as little as it can: again and again, the most hurt hero gets the
   cheapest draught that covers what they are missing (or the strongest there is, if none does). Nobody gets a draught
   for a scratch smaller than about half of the weakest one. plan(true) works it out on average rolls, to show first. */
Menu.patchPlan = function (real) {
  const I = G.D.items, avg = d => { const m = /(\d+)d(\d+)(?:\+(\d+))?/.exec(d || ''); return m ? m[1] * (+m[2] + 1) / 2 + (+m[3] || 0) : 0; };
  const kinds = Object.keys(G.S.bag).filter(k => I[k].field && I[k].target === 'ally' && (I[k].fx || []).length === 1 && I[k].fx[0].t === 'heal' && !I[k].fx[0].pow)
    .map(k => ({ k, heal: avg(I[k].fx[0].dice), price: I[k].price || 0 })).filter(x => x.heal > 0);
  const have = {}; kinds.forEach(x => { have[x.k] = G.S.bag[x.k]; });
  const hp = {}; G.S.party.forEach(m => { hp[m.id] = m.hp; });
  const used = {};
  if (!kinds.length) return { used, kinds: 0 };
  const least = Math.min(...kinds.map(x => x.heal));
  for (let n = 0; n < 60; n++) {
    const need = G.S.party.map(m => ({ m, d: G.stats(m).maxHp - hp[m.id] })).filter(o => o.d >= least * 0.5).sort((a, b) => b.d - a.d)[0];
    if (!need) break;
    const left = kinds.filter(x => have[x.k] > 0); if (!left.length) break;
    const covers = left.filter(x => x.heal >= need.d * 0.9).sort((a, b) => a.price - b.price || a.heal - b.heal)[0];
    const x = covers || left.sort((a, b) => b.heal - a.heal)[0];
    have[x.k]--; used[x.k] = (used[x.k] || 0) + 1;
    const max = G.stats(need.m).maxHp;
    if (real) { G.give(x.k, -1); Menu.applyField(I[x.k].fx, [need.m], null); hp[need.m.id] = need.m.hp; }
    else hp[need.m.id] = Math.min(max, hp[need.m.id] + x.heal);
  }
  return { used, kinds: kinds.length, hp };
};
Menu.patchUp = async function () {
  const I = G.D.items, plan = Menu.patchPlan(false), list = Object.entries(plan.used);
  if (!list.length) { G.audio.sfx('error'); Menu.desc(plan.kinds ? 'Nobody is hurt enough to be worth a draught.' : 'No healing draughts in the bag.'); await G.sleep(900); return; }
  const say = list.map(([k, n]) => n + ' ' + I[k].name + (n > 1 ? 's' : '')).join(', ');
  Menu.pane(Menu.summary());                                      // everyone's health as it is now, while you decide
  const ok = await UI.menu({ title: 'Patch up?', style: Menu.NAV, items: [{ label: 'Use them', value: 1 }, { label: 'Not now', value: 0 }],
    onMove: () => Menu.desc('Uses ' + say + '. Afterwards: ' + G.S.party.map(m => G.D.classes[m.id].name + ' ' + Math.round(plan.hp[m.id]) + '/' + G.stats(m).maxHp).join(', ') + ' (about; draughts roll).') });
  if (!ok) return;
  const done = Menu.patchPlan(true), got = Object.entries(done.used);
  UI.toast('Patched up: ' + got.map(([k, n]) => n + ' ' + I[k].name + (n > 1 ? 's' : '')).join(', ') + '.');
};

/* ---------- items ---------- */
Menu.items = async function () {
  const I = G.D.items;
  let start = 0;
  for (;;) {
    const hurt = G.S.party.some(m => m.hp < G.stats(m).maxHp);
    const ids = (hurt ? ['~patch'] : []).concat(Object.keys(G.S.bag));
    Menu.pane('');
    const id = await UI.menu({
      title: 'Items', style: Menu.LIST, start,
      items: ids.map(k => k === '~patch' ? { label: 'Patch up the party', right: '+', value: k } : ({ label: I[k].name, right: I[k].type === 'key' ? 'key' : '×' + G.S.bag[k], value: k })),
      onMove: it => Menu.desc(it.value === '~patch' ? 'Use as few healing draughts as it takes to bring everyone up, cheapest first. You see what it will use before it does.' : I[it.value].desc || '')
    });
    if (!id) return;
    start = ids.indexOf(id);
    if (id === '~patch') { await Menu.patchUp(); continue; }
    const it = I[id];
    if (!it.fx || !it.field) { G.audio.sfx('error'); Menu.desc(it.fx ? 'That only works in battle.' : (it.type === 'key' ? 'You should hang on to that.' : 'Equip it from the Gear menu.')); await G.sleep(800); continue; }
    const t = await Menu.pickMember('Use on whom?'); if (!t) continue;
    G.give(id, -1); Menu.applyField(it.fx, [t], null);
  }
};

/* ---------- gear ---------- */
Menu.gearLine = function (it) {
  if (!it) return '';
  const parts = [];
  if (it.dmg) parts.push('Damage ' + it.dmg);
  const names = { ac: 'AC', atk: 'Attack', dmgBonus: 'Damage', pow: 'Power', save: 'Save', spd: 'Speed', hp: 'HP', sp: 'SP' };
  for (const k in (it.mods || {})) parts.push(names[k] + ' ' + (it.mods[k] > 0 ? '+' : '') + it.mods[k]);
  return parts.join(', ') + (it.desc ? '. ' + it.desc : '');
};
/* ---------- comparing gear ----------
   What wearing an item would change for a hero, against what they wear now in that slot: every stat that moves, the
   damage dice, any power gained or lost. Returns { parts: [[text, +1|-1|0]], score } (score > 0: an upgrade). */
Menu.compare = function (mem, id) {
  const it = G.D.items[id]; if (!it || !it.type || ['weapon', 'armor', 'charm'].indexOf(it.type) < 0) return null;
  if (it.for && it.for.indexOf(mem.id) < 0) return null;
  if (mem.gear[it.type] === id) return { parts: [['wearing it', 0]], score: 0, same: true };
  const a = G.stats(mem), b = G.stats(Object.assign({}, mem, { gear: Object.assign({}, mem.gear, { [it.type]: id }) }));
  const N = { atk: 'Attack', ac: 'AC', dmgBonus: 'Damage', pow: 'Power', save: 'Save', spd: 'Speed', maxHp: 'HP', maxSp: 'SP' }, W = { atk: 2, ac: 2, dmgBonus: 2, pow: 1, save: 1, spd: 1, maxHp: 0.2, maxSp: 0.25 };
  const parts = []; let score = 0;
  for (const k in N) { const d = (b[k] || 0) - (a[k] || 0); if (d) { parts.push([N[k] + ' ' + (d > 0 ? '+' : '−') + Math.abs(d), d > 0 ? 1 : -1]); score += d * W[k]; } }
  const avg = s => { const m = /(\d+)d(\d+)(?:\+(\d+))?/.exec(s || ''); return m ? m[1] * (+m[2] + 1) / 2 + (+m[3] || 0) : 0; };
  if (a.dmg !== b.dmg) { const d = avg(b.dmg) - avg(a.dmg); parts.push(['Weapon ' + a.dmg + ' → ' + b.dmg, d > 0 ? 1 : d < 0 ? -1 : 0]); score += d * 2; }
  const P = G.D.perks || {}, pn = k => (P[k] && P[k].name) || k;
  for (const k of b.perks) if (a.perks.indexOf(k) < 0) { parts.push(['+ ' + pn(k), 1]); score += 2; }
  for (const k of a.perks) if (b.perks.indexOf(k) < 0) { parts.push(['loses ' + pn(k), -1]); score -= 2; }
  if (!parts.length) parts.push(['no change', 0]);
  return { parts, score };
};
Menu.compareHtml = function (mem, id) {
  const c = Menu.compare(mem, id); if (!c) return '';
  return c.parts.map(([t, s]) => '<span style="color:' + (s > 0 ? '#7ee08a' : s < 0 ? '#ff8a7a' : '#aab0cc') + '">' + UI.esc(t) + '</span>').join(', ');
};
Menu.equip = function (mem, id) {
  const slot = G.D.items[id].type, old = mem.gear[slot];
  mem.gear[slot] = id; G.give(id, -1); if (old) G.give(old, 1);
  G.clampParty(); G.audio.sfx('item');
};
// Just bought a piece of gear: offer to put it on, best upgrade first.
Menu.offerEquip = async function (id) {
  const who = G.S.party.map(m => ({ m, c: Menu.compare(m, id) })).filter(o => o.c && !o.c.same).sort((a, b) => b.c.score - a.c.score);
  if (!who.length) return;
  const nm = G.D.items[id].name;
  const pick = await UI.menu({ title: 'Equip ' + nm + '?', style: 'left:88rem;top:40rem;width:226rem;', items: who.map(o => ({ label: 'On ' + G.D.classes[o.m.id].name, right: o.c.score > 0 ? '▲' : o.c.score < 0 ? '▼' : '', value: o.m.id })).concat([{ label: 'Keep it in the bag', value: '~bag' }]),
    onMove: it => { const o = who.find(w => w.m.id === it.value); Menu.desc(o ? 'Instead of ' + UI.esc(o.m.gear[G.D.items[id].type] ? G.D.items[o.m.gear[G.D.items[id].type]].name : 'nothing') + ': ' + Menu.compareHtml(o.m, id) : 'Equip it later from the Gear menu.', true); } });
  if (!pick || pick === '~bag') return;
  Menu.equip(G.member(pick), id); UI.toast(G.D.classes[pick].name + ' puts on the ' + nm + '.');
};
Menu.gear = async function () {
  const I = G.D.items;
  let mi = 0;
  for (;;) {
    const m = await UI.menu({
      title: 'Gear', style: Menu.NAV, start: mi,
      items: G.S.party.map((p, i) => ({ label: G.D.classes[p.id].name, value: i })),
      onMove: it => { Menu.pane(Menu.sheet(G.S.party[it.value])); Menu.desc(''); }
    });
    if (m == null) return;
    mi = m;
    const mem = G.S.party[m];
    let si = 0;
    for (;;) {
      Menu.pane(Menu.sheet(mem));
      const slot = await UI.menu({
        title: 'Slot', style: 'left:88rem;top:124rem;width:226rem;', start: si,
        items: ['weapon', 'armor', 'charm'].map(s => ({ label: { weapon: 'Weapon', armor: 'Armour', charm: 'Charm' }[s], right: mem.gear[s] ? I[mem.gear[s]].name : '—', value: s })),
        onMove: it => Menu.desc(Menu.gearLine(I[mem.gear[it.value]]))
      });
      if (!slot) break;
      si = ['weapon', 'armor', 'charm'].indexOf(slot);
      const cands = Object.keys(G.S.bag).filter(k => I[k].type === slot && (!I[k].for || I[k].for.indexOf(mem.id) >= 0));
      if (!cands.length) { G.audio.sfx('error'); Menu.desc('Nothing else in the bag fits that slot.'); await G.sleep(800); continue; }
      const pick = await UI.menu({
        title: 'Equip', style: Menu.LIST,
        items: cands.map(k => { const c = Menu.compare(mem, k); return { label: I[k].name, right: (c && c.score > 0 ? '▲ ' : c && c.score < 0 ? '▼ ' : '') + '×' + G.S.bag[k], value: k }; }),
        onMove: it => Menu.desc(UI.esc(Menu.gearLine(I[it.value])) + '<br>Instead of ' + UI.esc(mem.gear[slot] ? I[mem.gear[slot]].name : 'nothing') + ': ' + Menu.compareHtml(mem, it.value), true)
      });
      if (!pick) continue;
      Menu.equip(mem, pick);
    }
  }
};

/* ---------- journal ---------- */
/* The journal. Open quests, grouped by region (the region of the step you are on, from D.questRegion), newest chapter
   first, story quests marked ◆ and a dot on any quest with a step you have not read. Then the records: completed
   quests (by chapter), the chronicles, the bestiary, and the prayer places and stages. A quest page ticks off the steps
   already done and shows the one you are on. */
Menu.NUM = ['', 'One', 'Two', 'Three', 'Four', 'Five'];
Menu.questStage = id => G.flag('q.' + id);
Menu.questDone = id => Menu.questStage(id) >= G.D.quests[id].done;
Menu.questRegion = function (id, stage) {
  const r = (G.D.questRegion || {})[id]; if (!r) return null;
  if (typeof r === 'string') return r;
  let best = null; for (const k of Object.keys(r).map(Number).sort((a, b) => a - b)) if (k <= stage) best = r[k];
  return best || r[Object.keys(r)[0]];
};
// the steps reached, in order: from the log kept since this version, or (older saves) every step up to this one
Menu.questSteps = function (id) {
  const q = G.D.quests[id], s = Menu.questStage(id), log = (G.S.qlog || {})[id];
  const keys = Object.keys(q.stages).map(Number).sort((a, b) => a - b);
  return (log && log.length ? keys.filter(k => log.indexOf(k) >= 0 || k === s) : keys.filter(k => k <= s)).filter(k => k <= s);
};
Menu.questNew = id => Menu.questStage(id) > ((G.S.qread || {})[id] || 0);
Menu.questPage = function (id) {
  const q = G.D.quests[id], s = Menu.questStage(id), done = Menu.questDone(id), steps = Menu.questSteps(id);
  (G.S.qread = G.S.qread || {})[id] = s;                                    // read now
  const where = Menu.questRegion(id, done ? steps[0] || 1 : s), story = (G.D.storyQuests || {})[id];
  let h = '<div class="sumhead">' + UI.esc(q.name) + (done ? ' <span class="gold">(complete)</span>' : '') + '</div>' +
    '<div class="dim" style="font-size:8rem;margin-bottom:4rem">' + (story ? 'Story · ' : '') + 'Chapter ' + Menu.NUM[q.ch || 1] + (where ? ' · ' + UI.esc(done ? where : 'Now: ' + where) : '') + '</div>';
  steps.forEach((k, i) => {
    const t = UI.esc(q.stages[k] || ''), last = i === steps.length - 1;
    if (!last) h += '<div class="qdone"><span style="color:#7ee08a">✓</span> <s>' + t + '</s></div>';
    else if (done) h += '<div style="margin-top:3rem"><span class="gold">★</span> ' + t + '</div>';
    else h += '<div style="margin-top:3rem"><span class="gold">Now:</span> ' + t + '</div>';
  });
  return h;
};
Menu.journal = async function () {
  const Q = G.D.quests, ch = id => Q[id].ch || 1, ORDER = G.D.REGIONS || [];
  const started = Object.keys(Q).filter(id => Menu.questStage(id) > 0);
  const open = started.filter(id => !Menu.questDone(id)), done = started.filter(id => Menu.questDone(id));
  const chapters = [...new Set((G.D.chronicle || []).filter(e => G.cond(e[0])).map(e => e[2] || 1))].sort((a, b) => b - a);
  const places = Field.places();
  const label = id => Q[id].short, right = id => (Menu.questNew(id) ? '•' : '') + (G.D.storyQuests[id] ? ' ◆' : '');
  // open quests: newest chapter first, then region (in map order), story quests first within a region
  const reg = id => Menu.questRegion(id, Menu.questStage(id)) || 'Elsewhere';
  open.sort((a, b) => (ch(b) - ch(a)) || (ORDER.indexOf(reg(a)) - ORDER.indexOf(reg(b))) || ((G.D.storyQuests[b] ? 1 : 0) - (G.D.storyQuests[a] ? 1 : 0)));
  const build = () => {
    const items = []; let lastHead = null, older = false; const now = Math.max(...open.map(ch), G.flag('chapter') || 1);
    for (const id of open) {
      if (ch(id) < now && !older) { items.push({ head: true, label: 'Earlier chapters' }); older = true; lastHead = null; }
      if (reg(id) !== lastHead) { items.push({ head: true, label: reg(id) }); lastHead = reg(id); }
      items.push({ label: label(id), right: right(id), value: id });
    }
    if (!open.length) items.push({ head: true, label: 'No open quests' });
    items.push({ head: true, label: 'Records' });
    if (done.length) items.push({ label: 'Completed', right: String(done.length), value: '~done' });
    for (const n of chapters) items.push({ label: 'Chronicle ' + ['', 'I', 'II', 'III', 'IV', 'V'][n], value: '~chron' + n });
    if ((G.S.dlog || []).length) items.push({ label: 'Recent conversations', value: '~talk' });
    if (Object.keys(G.S.foes || {}).length) items.push({ label: 'Bestiary', value: '~beast' });
    if (places.some(p => p.found && p.kind === 'pray')) items.push({ label: "Maren's prayers", value: '~pray' });
    if (places.some(p => p.found && p.kind === 'busk')) items.push({ label: "Finch's stages", value: '~busk' });
    return items;
  };
  const show = v => {
    if (typeof v !== 'string') return;
    if (v === '~beast') { Menu.pane('<div class="sumhead">Bestiary</div><div class="dim">Everything you have fought, what it is, and what hurts it.</div>', 'journal'); return; }
    if (v === '~talk') { Menu.pane('<div class="sumhead">Recent conversations</div><div class="dim">The last ' + G.S.dlog.length + ' lines said, newest first, and the choices you made. Open it to read back.</div>', 'journal'); return; }
    if (v === '~done') { Menu.pane('<div class="sumhead">Completed</div><div class="dim">' + done.length + ' quests done. Open the list to read them back, step by step.</div>', 'journal'); return; }
    if (v === '~pray' || v === '~busk') { Menu.pane(Menu.placesPage(v.slice(1)), 'journal'); return; }
    if (v.indexOf('~chron') === 0) {
      const n = +v.slice(6), lines = G.D.chronicle.filter(e => G.cond(e[0]) && (e[2] || 1) === n).map(e => e[1]);
      Menu.pane('<div class="sumhead">Chronicle, Chapter ' + Menu.NUM[n] + '</div><div class="chron">' + lines.map(l => '<div>· ' + UI.esc(l) + '</div>').join('') + '</div>', 'journal');
      return;
    }
    Menu.pane(Menu.questPage(v), 'journal');
  };
  let start = 0;
  for (;;) {
    const items = build();
    if (!items.some(it => !it.head)) { Menu.pane('<div class="dim">No quests yet.</div>', 'journal'); await UI.waitKey(); return; }
    const pick = await UI.menu({
      title: 'Journal', cls: 'journal', style: Menu.NAV + 'width:114rem;max-height:188rem;', start, items,
      onMove: it => { show(it.value); Menu.desc(G.D.quests[it.value] ? 'Quests are grouped by the region their current step is in. • a step you have not read yet. ◆ the main story.' : ''); }
    });
    if (pick == null) return;
    start = Math.max(0, items.findIndex(it => it.value === pick));
    if (pick === '~beast') await Menu.bestiary();
    else if (pick === '~talk') await Menu.talkLog();
    else if (pick === '~done') await Menu.completed(done);
    // picking a quest or a page leaves you where you are
  }
};
// The dialogue log, newest first: highlight a line to read it in full, with the lines around it and where it was said.
Menu.talkLog = async function () {
  const log = G.S.dlog || [], idx = log.map((_, i) => i).reverse();
  const who = e => e[3] === 'pick' ? '▸ You chose' : e[0] || '—';
  const line = (e, me) => '<div style="margin-bottom:3rem;' + (me ? '' : 'color:#8a8ea8;font-size:7.5rem;line-height:9.5rem') + '">' + (e[3] === 'pick' ? '<span class="gold">▸</span> ' : e[0] ? '<b>' + UI.esc(e[0]) + ':</b> ' : '') + UI.esc(e[1]) + '</div>';
  let start = 0;
  for (;;) {
    const pick = await UI.menu({ title: 'Recent conversations', cls: 'journal', style: Menu.NAV + 'width:114rem;max-height:188rem;', start,
      items: idx.map(i => ({ label: (log[i][3] === 'pick' ? '▸ ' : log[i][0] ? log[i][0] + ': ' : '') + log[i][1], value: i })),
      onMove: it => { const i = it.value, e = log[i];
        Menu.pane('<div class="dim" style="font-size:7.5rem;margin-bottom:3rem">' + UI.esc(e[2] || '') + '</div>' + (log[i - 1] && log[i - 1][2] === e[2] ? line(log[i - 1]) : '') + line(e, true) + (log[i + 1] && log[i + 1][2] === e[2] ? line(log[i + 1]) : ''), 'journal');
        Menu.desc(''); } });
    if (pick == null) return;
    start = Math.max(0, idx.indexOf(pick));
  }
};
// Completed quests, newest chapter first, each read back step by step.
Menu.completed = async function (done) {
  const Q = G.D.quests, ch = id => Q[id].ch || 1;
  done = done.slice().sort((a, b) => (ch(b) - ch(a)) || ((G.D.storyQuests[b] ? 1 : 0) - (G.D.storyQuests[a] ? 1 : 0)));
  const items = []; let last = null;
  for (const id of done) { if (ch(id) !== last) { items.push({ head: true, label: 'Chapter ' + Menu.NUM[ch(id)] }); last = ch(id); } items.push({ label: Q[id].short, right: G.D.storyQuests[id] ? '◆' : '', value: id }); }
  let start = 0;
  for (;;) {
    const pick = await UI.menu({ title: 'Completed', cls: 'journal', style: Menu.NAV + 'width:114rem;max-height:188rem;', start, items, onMove: it => { Menu.pane(Menu.questPage(it.value), 'journal'); Menu.desc(''); } });
    if (pick == null) return;
    start = Math.max(0, items.findIndex(it => it.value === pick));
  }
};
// Journal pages: the prayer places (kind 'pray') or venues ('busk') found, one line each: what it does, and whether
// it is ready (gold dot) or used until the next rest (grey). Maren's and Finch's trust in Runa scale the numbers.
Menu.placesPage = function (kind) {
  const ps = Field.places().filter(p => p.kind === kind), found = ps.filter(p => p.found), pm = G.prayerMul(), bm = G.buskMul(), ch = G.flag('chapter') || 1;
  let h = '<div class="sumhead">' + (kind === 'pray' ? "Maren's prayers" : "Finch's stages") + ' <span class="dim">(' + found.length + ' of ' + ps.length + ' found)</span></div>' +
    '<div class="dim" style="font-size:6.5rem;line-height:8rem;margin-bottom:3rem">' + (kind === 'pray' ? 'Lead with Maren at the shrine and use her ability.' : 'Lead with Finch where the crowd gathers and use his ability.') + ' Gold: ready. Grey: used until you rest.</div>';
  for (const p of found) {
    const d = p.d, fx = kind === 'pray'
      ? [d.heal && 'heal ' + Math.round(d.heal * pm) + '%', d.sp && 'SP ' + Math.round(d.sp * pm) + '%', d.bless && 'Blessed'].filter(Boolean)
      : [Math.round(d.gold * ch * bm) + 'g', d.give && G.D.items[d.give[0]].name, d.inspire && 'Inspired'].filter(Boolean);
    h += '<div style="display:flex;gap:4rem;font-size:6.5rem;line-height:7.6rem;white-space:nowrap' + (p.used ? ';opacity:.55' : '') + '">' +
      '<span style="color:' + (p.used ? '#777' : '#ffd24a') + '">●</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis">' + UI.esc(d.name) + '</span>' +
      '<span style="color:#9a9cb8;font-size:6.5rem">' + UI.esc(fx.join(', ')) + '</span></div>';
  }
  return h;
};
// The bestiary: every kind of enemy met, in the order you met them, with what you have learned about it.
Menu.bestiary = async function () {
  const E = G.D.enemies, A = G.D.abilities, seen = Object.keys(G.S.foes || {}).filter(id => E[id]);
  const art = {};
  const pic = id => {
    if (art[id]) return art[id];
    const cv = document.createElement('canvas'); cv.width = cv.height = 48; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
    G.gfx.drawSprite(c, E[id].sprite, 'left', 0, 0, 0, 3); return (art[id] = cv.toDataURL());
  };
  const KIND = Object.assign({ undead: 'Undead', beast: 'Beast', human: 'Human', spirit: 'Spirit', construct: 'Construct', fey: 'Fey', goblin: 'Goblin' }, G.D.kindNames || {});
  const weak = d => Object.keys(A).filter(a => (A[a].fx || []).some(e => e.vs && (d.tags || []).indexOf(e.vs) >= 0)).map(a => A[a].name);
  const learned = id => G.S.party.some(m => G.stats(m).abilities.some(a => (A[a].fx || []).some(e => e.vs && (E[id].tags || []).indexOf(e.vs) >= 0)));
  const IMM = { asleep: 'sleep', poison: 'poison', stunned: 'stuns', charmed: 'charms', weak: 'weakening', rattled: 'fear', marked: 'marking' };
  const sheet = id => {
    const d = E[id], n = G.S.foes[id], kinds = (d.tags || []).map(t => KIND[t] || t).join(', ');
    const w = weak(d), imm = (d.immune || []).map(s => IMM[s] || s);
    return '<div class="beast"><img src="' + pic(id) + '"><div><div class="sumhead">' + UI.esc(d.name) + '</div>' +
      '<div>HP ' + Math.round(d.hp * B.diff().hp) + ' · AC ' + d.ac + ' · Attack +' + d.atk + '</div><div>Hits for ' + UI.esc(String(d.dmg)) + ' · Speed ' + (d.spd || 0) + '</div></div></div>' +
      (kinds ? '<div class="dim">Kind: ' + UI.esc(kinds) + '</div>' : '') +
      (w.length ? '<div class="dim gold">Weak to: ' + UI.esc(w.join(', ')) + (learned(id) ? '' : ' (none of these learned yet)') + '</div>' : '') +
      (imm.length ? '<div class="dim">Shrugs off: ' + UI.esc(imm.join(', ')) + '</div>' : '') +
      '<div class="dim">' + (n ? 'Defeated ' + n + (n === 1 ? ' time.' : ' times.') : 'Met, not yet beaten.') + '</div>';
  };
  await UI.menu({
    title: 'Bestiary (' + seen.length + ')', style: Menu.NAV + 'width:100rem;max-height:188rem;',
    items: seen.map(id => ({ label: E[id].name, value: id })),
    onMove: it => { Menu.pane(sheet(it.value), true); Menu.desc(''); }
  });
};


/* ---------- options ---------- */
Menu.options = async function () {
  let start = 0;
  for (;;) {
    const kb = G.bindings(), ks = id => kb[id].map(G.keyName).join(', ') || '—';
    // the panel beside the list only shows when it has something to add: the keys (on Controls), or how saves work
    const side = v => {
      if (v === 5) Menu.pane('<div class="sumhead">Your keys</div><div class="dim">Move: ' + ['up', 'left', 'down', 'right'].map(d => G.keyName(kb[d][0])).join(' ') + '<br>Interact / confirm: ' + ks('a') + '<br>Cancel / menu: ' + ks('b') +
        '<br>Map ' + ks('map') + ' · Items ' + ks('items') + ' · Journal ' + ks('journal') + ' · Party ' + ks('party') + '<br>Switch leader ' + ks('switch') + ' · Ability ' + ks('ability') + '<br><br>Press ' + G.keyName(kb.a[0]) + ' to change any of them.<br><br>Tip: stay on the road to avoid random fights.</div>', 'options');
      else if (v === 3 || v === 4) Menu.pane('<div class="sumhead">Save codes</div><div class="dim">Saving stores your progress in this browser. A save code is the same game as text: copy it to keep a backup, or to carry the game to another browser or computer.</div>', 'options');
      else if (Menu.paneEl) Menu.paneEl.style.display = 'none';
    };
    const pick = await UI.menu({
      title: 'Options', style: Menu.NAV + 'width:164rem;', start,
      items: [
        { label: 'Music', right: G.opts.music ? 'On' : 'Off', value: 0 }, { label: 'Sound', right: G.opts.sfx ? 'On' : 'Off', value: 1 },
        { label: 'Text', right: G.opts.textFast ? 'Fast' : 'Normal', value: 2 }, { label: 'Difficulty', right: B.diff().name, value: 6 }, { label: 'Battle board', right: G.opts.bview === 'flat' ? 'Flat' : 'Diamond', value: 7 }, { label: 'Battle speed', right: (B.SPEEDS[G.opts.bspeed || 'fast'] || B.SPEEDS.fast).name, value: 8 }, { label: 'Party chatter', right: B.chatter().name, value: 9 }, { label: 'Always run', right: G.opts.alwaysRun ? 'On' : 'Off', value: 10 }, { label: 'Interact prompts', right: G.opts.prompts === false ? 'Off' : 'On', value: 11 }, { label: 'Controls', value: 5 }, { label: 'Export save', value: 3 }, { label: 'Import save', value: 4 }
      ],
      onMove: it => side(it.value) || Menu.desc(['Background music.', 'Sound effects.', 'How quickly text and battle messages move.', 'Show a save code you can copy.', 'Load a game from a save code.', 'See and change which keys do what.', 'Easy: enemies have a quarter less health and hit a quarter softer. Hard: a fifth more health, and they hit harder. Change it any time.', 'Diamond: the battle seen from an angle, with high ground standing up; turn it with [ and ] (or the buttons by the board). Flat: straight down. Switch any time, even mid-fight with V.', 'How quickly fights move: how long each message stays up and how fast pieces move and strike. Routine hits and misses are always quicker, since their numbers pop up over the pieces. Press to skip any message.', 'How often the party talks during a fight, in speech bubbles over their heads. The bubbles never hold up play.', 'Walk at a run without holding the Run key (Shift). With it on, holding Run walks.', 'A small key over whatever you can talk to, search or use when you face it.'][it.value])
    });
    if (pick == null) return false;
    start = pick;
    if (pick === 0) { G.opts.music = !G.opts.music; G.audio.setOpts(); }
    else if (pick === 1) G.opts.sfx = !G.opts.sfx;
    else if (pick === 2) G.opts.textFast = !G.opts.textFast;
    else if (pick === 3) await Menu.codeBox('export');
    else if (pick === 5) await Menu.controls();
    else if (pick === 10) G.opts.alwaysRun = !G.opts.alwaysRun;
    else if (pick === 11) G.opts.prompts = G.opts.prompts === false;
    else if (pick === 9) G.opts.chatter = { some: 'often', often: 'off', off: 'some' }[G.opts.chatter || 'some'];
    else if (pick === 8) G.opts.bspeed = { normal: 'fast', fast: 'swift', swift: 'normal' }[G.opts.bspeed || 'fast'];
    else if (pick === 7) G.opts.bview = G.opts.bview === 'flat' ? 'iso' : 'flat';
    else if (pick === 6) G.opts.diff = { easy: 'normal', normal: 'hard', hard: 'easy' }[G.opts.diff || 'normal'];
    else if (pick === 4) { const s = await Menu.codeBox('import'); if (s) { G.S = s; Menu.close(); await Field.enter(s.map, { x: s.x, y: s.y }, { dir: s.dir }); return true; } }
    G.saveOpts();
  }
};
/* ---------- controls: see and rebind every key ---------- */
Menu.keyHint = id => { if (!id) return ''; const k = G.bindings()[id]; return k && k.length ? G.keyName(k[0]) : ''; };
Menu.controls = async function () {
  let start = 0;
  for (;;) {
    const kb = G.bindings();
    Menu.pane('<div class="sumhead">Controls</div><div class="dim">Pick an action to change its keys. Each can have up to three; a key given to one action is taken off any other.<br><br>Menu keys work while you are walking around. Press one again to close what it opened.<br><br>The touch pad on phones is not affected.</div>','options');
    Menu.paneEl.style.cssText = 'left:178rem;top:6rem;width:136rem;height:188rem;font-size:8rem;line-height:10.5rem;';
    const items = [];
    G.ACTIONS.forEach((a, i) => {
      if (G.ACTION_GROUPS[a[0]]) items.push({ head: true, label: G.ACTION_GROUPS[a[0]] });
      items.push({ label: a[1], right: kb[a[0]].map(G.keyName).join(' ') || '—', value: i });
    });
    items.push({ head: true, label: '' }, { label: 'Reset all', value: 'reset' });
    const pick = await UI.menu({ title: 'Controls', style: 'left:6rem;top:6rem;width:166rem;max-height:188rem;', cls: 'keys', start, items,
      onMove: it => Menu.desc(it.value === 'reset' ? 'Put every key back the way it started.' : G.ACTIONS[it.value][1] + ': ' + (kb[G.ACTIONS[it.value][0]].map(G.keyName).join(', ') || 'no key') + '.') });
    if (pick == null) return;
    if (pick === 'reset') { start = items.length - 1; G.resetKeys(); G.audio.sfx('good'); UI.toast('All controls reset.'); continue; }
    start = items.findIndex(it => it.value === pick); await Menu.bindAction(G.ACTIONS[pick]);
  }
};
Menu.bindAction = async function (act) {
  const id = act[0]; let start = 0;
  for (;;) {
    const keys = G.bindings()[id], items = [];
    for (let n = 0; n < 3; n++) items.push({ label: 'Key ' + (n + 1), right: keys[n] ? G.keyName(keys[n]) : '(none)', value: 's' + n, disabled: n > keys.length });
    keys.forEach((k, n) => items.push({ label: 'Clear key ' + (n + 1), value: 'c' + n, disabled: G.REQUIRED.includes(id) && keys.length <= 1 }));
    items.push({ label: 'Reset to default', right: G.defaultKeys()[id].map(G.keyName).join(' '), value: 'r' });
    const pick = await UI.menu({ title: act[1], style: 'left:6rem;top:6rem;width:148rem;max-height:188rem;', cls: 'keys', start, items,
      onMove: it => Menu.desc(it.value[0] === 's' ? 'Choose, then press the key you want.' : it.value[0] === 'c' ? 'Remove this key.' : 'Go back to the keys this started with.') });
    if (pick == null) return;
    start = items.findIndex(it => it.value === pick);
    if (pick[0] === 's') {
      const key = await Menu.captureKey(act[1]);
      if (key == null) continue;
      const took = G.bindKey(id, +pick[1], key);
      G.audio.sfx('select');
      UI.toast(G.keyName(G.normKey(key)) + ' is now ' + act[1] + (took && took !== id ? ' (taken from ' + G.ACTIONS.find(a => a[0] === took)[1] + ')' : '') + '.');
      const lost = G.missingKeys();
      if (lost.length) { for (const l of lost) G.resetKeys(l); UI.toast(lost.map(l => G.ACTIONS.find(a => a[0] === l)[1]).join(', ') + ' had no key left, so it went back to its default.'); }
    } else if (pick[0] === 'c') { if (G.clearKey(id, +pick[1])) G.audio.sfx('select'); else G.audio.sfx('error'); }
    else if (pick === 'r') { G.resetKeys(id); G.audio.sfx('good'); }
  }
};
// Waits for the next key press; clicking the box (or waiting ten seconds) cancels.
Menu.captureKey = function (label) {
  if (G.autoPick) return Promise.resolve(null);
  return new Promise(resolve => {
    const w = UI.el('div', 'win keycap'); w.style.cssText = 'left:60rem;top:84rem;width:200rem;';
    w.innerHTML = '<div class="sumhead">' + UI.esc(label) + '</div><div>Press the key you want to use.</div><div class="dim">Click here to cancel.</div>';
    const m = { press() {} };
    let timer = null;
    const done = k => { clearTimeout(timer); G.keyCapture = null; UI.popModal(m); w.remove(); G.held = {}; G.dirOrder = []; resolve(k); };
    G.keyCapture = k => done(k);
    w.addEventListener('click', () => done(null));
    timer = setTimeout(() => done(null), 10000);
    UI.root.appendChild(w); UI.pushModal(m);
  });
};
// Opens one menu screen straight from the field (a hotkey).
Menu.openHot = async function (h) {
  if (h === 'menu') { Menu.hot = 'menu'; try { await Menu.open(); } finally { Menu.hot = null; } return; }
  if (h === 'save') {
    if (G.tutorial()) { G.audio.sfx('error'); UI.toast('You can save once the brawl is over.'); return; }
    const ok = G.save(); G.audio.sfx(ok ? 'good' : 'error'); UI.toast(ok ? 'Game saved (slot ' + G.slot + ').' : 'Could not save here. Use Options > Export save.'); return;
  }
  G.audio.sfx('select');
  Menu.shade = UI.el('div', 'shade'); UI.root.appendChild(Menu.shade); UI.root.classList.add('menuopen');
  Menu.hot = h;
  try {
    Menu.pane(Menu.summary()); Menu.desc(Field.map.def.name || '');
    if (h === 'map') await Menu.map();
    else if (h === 'items') await Menu.items();
    else if (h === 'party') await Menu.party();
    else if (h === 'gear') await Menu.gear();
    else if (h === 'journal') await Menu.journal();
    else if (h === 'options') await Menu.options();
    else if (h === 'guide') await Menu.guide();
  } finally { Menu.hot = null; Menu.close(); }
};

// Save-code dialog. Returns a loaded state for a successful import.
Menu.codeBox = function (mode) {
  return new Promise(resolve => {
    const w = UI.el('div', 'win codebox');
    w.innerHTML = '<div class="sumhead">' + (mode === 'export' ? 'Your save code' : 'Paste a save code') + '</div><textarea spellcheck="false"></textarea><div class="crow"><button class="b1"></button><button class="b2">Close</button><span class="cmsg"></span></div>';
    const ta = w.querySelector('textarea'), b1 = w.querySelector('.b1'), msg = w.querySelector('.cmsg');
    b1.textContent = mode === 'export' ? 'Copy' : 'Load';
    if (mode === 'export') { ta.value = G.exportCode(); ta.readOnly = true; }
    const m = { press(b) { if (b === 'b') done(null); } };
    function done(v) { UI.popModal(m); w.remove(); resolve(v); }
    b1.addEventListener('click', () => {
      if (mode === 'export') {
        ta.select();
        try { navigator.clipboard.writeText(ta.value).then(() => { msg.textContent = 'Copied.'; }, () => { msg.textContent = 'Select all and copy by hand.'; }); }
        catch (e) { msg.textContent = 'Select all and copy by hand.'; }
      } else { const s = G.importCode(ta.value); if (s) done(s); else msg.textContent = 'That code did not load.'; }
    });
    w.querySelector('.b2').addEventListener('click', () => done(null));
    UI.root.appendChild(w); UI.pushModal(m);
    if (mode === 'import') ta.focus();
  });
};

/* ---------- shops ---------- */
Menu.shop = async function (shopId) {
  const shop = G.D.shops[shopId], I = G.D.items;
  Menu.shade = UI.el('div', 'shade'); UI.root.appendChild(Menu.shade);
  const pct0 = shop.discount && G.cond(shop.discount[0]) ? shop.discount[1] : 100;     // discount: [condition, percent]
  const pct = Math.round(pct0 * G.shopPct() / 100);                                    // Dask haggles, if he trusts Runa (bonds.js)
  const head = () => Menu.pane('<div class="sumhead">' + UI.esc(shop.name) + ' &nbsp; <span class="gold">' + G.S.gold + ' gold</span></div><div class="dim">' + UI.esc(shop.blurb || '') + (pct0 < 100 ? ' <span class="gold">Friend\'s prices: ' + (100 - pct0) + '% off.</span>' : '') + (G.shopPct() < 100 ? ' <span class="gold">Dask haggles: ' + (100 - G.shopPct()) + '% off.</span>' : G.shopPct() > 100 ? ' <span class="dim">Dask will not haggle for you.</span>' : '') + '</div>');
  let mode = 0;
  for (;;) {
    head(); Menu.desc('');
    mode = await UI.menu({ style: Menu.NAV, start: mode || 0, items: [{ label: 'Buy', value: 0 }, { label: 'Sell', value: 1 }, { label: 'Leave', value: 2 }] });
    if (mode == null || mode === 2) break;
    let start = 0;
    for (;;) {
      head();
      const ids = mode === 0 ? shop.stock : Object.keys(G.S.bag).filter(k => I[k].price && I[k].type !== 'key');
      const base = k => I[k].chapterPrice ? Math.round(I[k].price * [1, 1.75, 2.5, 3.5, 4.5][Math.min(4, (G.S.flags.chapter || 1) - 1)] / 5) * 5 : I[k].price;
      const price = k => mode === 0 ? Math.ceil(base(k) * pct / 100) : Math.max(1, Math.floor(base(k) / 2));
      const id = await UI.menu({
        title: mode === 0 ? 'Buy' : 'Sell', style: 'left:88rem;top:40rem;width:226rem;max-height:154rem;', start,
        items: ids.map(k => ({ label: I[k].name + (mode === 0 && G.has(k) ? ' (have ' + G.has(k) + ')' : mode === 1 ? ' ×' + G.S.bag[k] : ''), right: price(k) + 'g', value: k, disabled: mode === 0 && (G.S.gold < price(k) || (I[k].max && G.has(k) >= I[k].max)) })),
        onMove: it => { const x = I[it.value], cmp = G.S.party.map(m => { const h = Menu.compareHtml(m, it.value); return h ? '<br>' + UI.esc(G.D.classes[m.id].name) + ': ' + h : ''; }).join('');
          Menu.desc(UI.esc((x.for ? 'For ' + x.for.map(p => G.D.classes[p].name).join(', ') + '. ' : '') + (x.fx ? x.desc : Menu.gearLine(x))) + cmp, true); }
      });
      if (!id) break;
      start = Math.max(0, ids.indexOf(id));
      if (mode === 0) { G.S.gold -= price(id); G.give(id, 1); } else { G.S.gold += price(id); G.give(id, -1); }
      G.audio.sfx('coin');
      if (mode === 0) await Menu.offerEquip(id);
    }
  }
  Menu.close();
};
