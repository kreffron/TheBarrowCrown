#!/usr/bin/env node
/* Checks all game data without a browser: map shapes, unknown characters, broken
   references (items, enemies, quests, sprites, warps), and unreachable things.
   Run:  node tools/validate.js   — exits 1 if anything is wrong. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.dirname(__dirname);
const G = { D: { maps: {}, scripts: {} } };
const ctx = vm.createContext({ G, console });
const files = ['data/rules.js', 'data/items.js', 'data/bestiary.js', 'data/looks.js'];
fs.readdirSync(path.join(ROOT, 'data')).filter(d => /^ch\d+/.test(d)).sort().forEach(d =>
  fs.readdirSync(path.join(ROOT, 'data', d)).filter(f => f.endsWith('.js')).sort().forEach(f => files.push('data/' + d + '/' + f)));
files.forEach(f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }));

const D = G.D, errs = [], warns = [];
const err = m => errs.push(m), warn = m => warns.push(m);
const CMDS = ['feat', 'spotall', 'pray', 'busk', 'endtally', 'say', 'note', 'toast', 'set', 'add', 'if', 'choice', 'give', 'take', 'gold', 'xp', 'quest', 'battle', 'check', 'hurt', 'heal', 'camp',
  'inn', 'shop', 'warp', 'remove', 'sfx', 'music', 'wait', 'fade', 'shake', 'face', 'card', 'run', 'save', 'end', 'topics', 'bond', 'boon', 'recap', 'cutscene', 'scene', 'move', 'sync', 'place', 'placep', 'walk', 'turn', 'emote', 'dark', 'hint', 'cam', 'lose'];

function checkScript(cmds, where) {
  if (cmds == null) return;
  if (!Array.isArray(cmds)) { err(where + ': script is not a list'); return; }
  cmds.forEach((c, i) => {
    const w = where + '[' + i + ']';
    if (!Array.isArray(c)) { err(w + ': command is not an array'); return; }
    if (CMDS.indexOf(c[0]) < 0) err(w + ': unknown command "' + c[0] + '"');
    switch (c[0]) {
      case 'say': if (typeof c[2] !== 'string') err(w + ': say needs [say, speaker, text]'); break;
      case 'if': checkScript(c[2], w + '.then'); checkScript(c[3], w + '.else'); break;
      case 'choice': (c[3] || []).forEach((o, j) => checkScript(o[1], w + '.opt' + j)); if (!Array.isArray(c[3])) err(w + ': choice needs options'); break;
      case 'cutscene': checkScript(c[1], w + '.cutscene'); break;
      case 'scene': if (!D.maps[c[1]]) err(w + ': scene on unknown map ' + c[1]); else if (!(D.maps[c[1]].things || {})[c[2]]) err(w + ': scene marker ' + c[2] + ' not on ' + c[1]); break;
      case 'move': case 'walk': if (!/^[udlr]+$/.test(c[c[0] === 'move' ? 2 : 1] || '')) err(w + ': bad path'); break;
      case 'topics': if (!Array.isArray(c[3])) err(w + ': topics needs options'); else c[3].forEach((o, j) => checkScript(o[1], w + '.topic' + j)); break;
      case 'bond': if (!D.classes[c[1]]) err(w + ': bond with unknown member ' + c[1]); break;
      case 'boon': if (!D.classes[c[1]] || ['ac', 'atk', 'dmgBonus', 'pow', 'save', 'spd', 'hp', 'sp'].indexOf(c[2]) < 0 || typeof c[3] !== 'number') err(w + ': bad boon'); break;
      case 'recap': if (!Array.isArray(D.chronicle)) err(w + ': no D.chronicle'); if (c[2] && !D.chronicle.some(e => (e[2] || 1) === c[2])) err(w + ': no chronicle lines for chapter ' + c[2]); break;
      case 'check': if (!D.classes[c[1]]) err(w + ': check on unknown member ' + c[1]); checkScript(c[3], w + '.pass'); checkScript(c[4], w + '.fail'); break;
      case 'give': case 'take': case 'lose': if (!D.items[c[1]]) err(w + ': unknown item ' + c[1]); break;
      case 'quest': if (!D.quests[c[1]]) err(w + ': unknown quest ' + c[1]); else if (!D.quests[c[1]].stages[c[2]]) err(w + ': quest ' + c[1] + ' has no stage ' + c[2]); break;
      case 'battle': if (!D.groups[c[1]]) err(w + ': unknown group ' + c[1]); ((c[2] || {}).guests || []).concat(((c[2] || {}).guestsIf || []).map(g => g[1])).forEach(g => { if (!(D.guests || {})[g]) err(w + ': unknown guest ' + g); }); break;
      case 'shop': if (!D.shops[c[1]]) err(w + ': unknown shop ' + c[1]); break;
      case 'run': if (!D.scripts[c[1]]) err(w + ': unknown script ' + c[1]); break;
      case 'warp': if (!D.maps[c[1]]) err(w + ': unknown map ' + c[1]); break;
      case 'music': if (c[1] && !D.music[c[1]]) err(w + ': unknown music ' + c[1]); break;
      case 'hurt': if (c[1] !== 'all' && !D.classes[c[1]]) err(w + ': hurt unknown member ' + c[1]); break;
    }
  });
}
function checkFx(fx, where) {
  (fx || []).forEach(e => {
    if (['attack', 'damage', 'heal', 'sp', 'revive', 'cure', 'status', 'extra', 'dispel', 'shove', 'pellet', 'flare'].indexOf(e.t) < 0) err(where + ': unknown effect ' + e.t);
    if (e.t === 'status' && !D.statuses[e.id]) err(where + ': unknown status ' + e.id);
    if (e.onHit && !D.statuses[e.onHit.id]) err(where + ': unknown status ' + e.onHit.id);
  });
}
const hasSprite = s => !!(D.sprites[s] || D.pix[s]);

// rules
for (const ch in D.legend) if (!D.tiles[D.legend[ch]]) err('legend ' + ch + ' -> unknown tile ' + D.legend[ch]);
for (const id in D.abilities) checkFx(D.abilities[id].fx, 'ability ' + id);
for (const id in D.items) { checkFx(D.items[id].fx, 'item ' + id); (D.items[id].for || []).forEach(p => { if (!D.classes[p]) err('item ' + id + ' for unknown ' + p); }); }
for (const id in D.classes) {
  const c = D.classes[id];
  if (!hasSprite(c.sprite)) err('class ' + id + ': no sprite');
  for (const l in c.learn) c.learn[l].forEach(a => { if (!D.abilities[a]) err('class ' + id + ' learns unknown ' + a); });
  for (const s in c.gear) if (c.gear[s] && !D.items[c.gear[s]]) err('class ' + id + ' starts with unknown ' + c.gear[s]);
}
for (const id in D.shops) D.shops[id].stock.forEach(i => { if (!D.items[i] || !D.items[i].price) err('shop ' + id + ': bad stock ' + i); });
for (const id in D.enemies) {
  const e = D.enemies[id];
  if (!hasSprite(e.sprite)) err('enemy ' + id + ': no sprite ' + e.sprite);
  (e.moves || []).forEach(m => { if (m[1] !== 'attack' && !D.abilities[m[1]]) err('enemy ' + id + ': unknown move ' + m[1]); });
  (e.loot || []).forEach(l => { if (!D.items[l[0]]) err('enemy ' + id + ': unknown loot ' + l[0]); });
  (e.immune || []).forEach(s => { if (!D.statuses[s]) err('enemy ' + id + ': unknown immunity ' + s); });
}
for (const id in D.groups) (D.groups[id].guide || []).forEach((s, i) => {
  const w = 'group ' + id + ' guide ' + i;
  if (!D.classes[s.who]) err(w + ': unknown member ' + s.who);
  if (['attack', 'ab'].indexOf(s.cmd) < 0) err(w + ': cmd must be attack or ab');
  if (s.cmd === 'ab' && (!D.abilities[s.ab] || !(D.classes[s.who] && D.classes[s.who].learn[1].indexOf(s.ab) >= 0))) err(w + ': ' + s.who + ' has no level-1 ability ' + s.ab);
  if (s.enemy && D.groups[id].enemies.indexOf(s.enemy) < 0) err(w + ': enemy ' + s.enemy + ' not in group');
  if (s.ally && !D.classes[s.ally]) err(w + ': unknown ally ' + s.ally);
});
for (const id in (D.guests || {})) { const g = D.guests[id]; if (!hasSprite(g.sprite)) err('guest ' + id + ': no sprite'); (g.moves || []).forEach(m => { if (m[1] !== 'attack' && !D.abilities[m[1]]) err('guest ' + id + ': unknown move ' + m[1]); }); }
const HELD = ['axe', 'dagger', 'sword', 'mace', 'hammer', 'spade', 'staff', 'spear', 'bow', 'lute', 'lantern', 'book', 'pack', 'rod', 'pitchfork', 'club', 'shield', 'scroll', 'ladle'];
for (const id in D.looks || {}) { if (!D.sprites[id]) err('looks: no sprite ' + id); const l = D.looks[id]; if (l.held && HELD.indexOf(l.held) < 0) err('looks.' + id + ': unknown held item ' + l.held); if (l.hs && ['pony', 'bun', 'braids', 'spiky', 'mohawk', 'curly'].indexOf(l.hs) < 0) err('looks.' + id + ': unknown hair style ' + l.hs); }
for (const id in D.groups) { const g = D.groups[id]; [g.enemies].concat(g.waves || []).forEach(w => { if (w.length > 5) err('group ' + id + ': more than 5 enemies in a wave'); w.forEach(e => { if (!D.enemies[e]) err('group ' + id + ': unknown enemy ' + e); }); }); }
for (const id in D.pix) { const p = D.pix[id]; if (p.rows.length !== 16) err('pix ' + id + ': needs 16 rows'); p.rows.forEach((r, i) => { if (r.length !== 16) err('pix ' + id + ' row ' + i + ': length ' + r.length); }); }
for (const id in D.scripts) checkScript(D.scripts[id], 'script ' + id);
for (const id in D.music) { const lens = D.music[id].voices.filter(v => v.notes).map(v => v.notes.split(/\s+/).filter(t => t && t !== '|').reduce((s, t) => s + (+t.split(':')[1] || 1), 0)); if (new Set(lens).size > 1) warn('music ' + id + ': voices differ in length ' + lens.join('/')); }
if (!D.maps[D.start.map]) err('start map missing');

// maps
for (const id in D.maps) {
  const m = D.maps[id], L = Object.assign({}, D.legend, m.legend || {}), things = m.things || {};
  const w = m.rows[0].length, h = m.rows.length, used = {};
  if (!D.tiles[m.ground]) err('map ' + id + ': unknown ground ' + m.ground);
  if (m.music && !D.music[m.music]) err('map ' + id + ': unknown music ' + m.music);
  m.rows.forEach((r, y) => {
    if (r.length !== w) err('map ' + id + ' row ' + y + ': length ' + r.length + ', expected ' + w);
    for (const ch of r) { if (things[ch]) used[ch] = 1; else if (ch !== '.' && ch !== ',' && !L[ch]) err('map ' + id + ' row ' + y + ': unknown character "' + ch + '"'); }
  });
  for (const ch in things) {
    const t = things[ch], where = 'map ' + id + ' thing ' + ch;
    if (!used[ch]) err(where + ': defined but not placed in rows');
    if (/[^a-z0-9]/.test(ch) && (D.legend[ch] || (m.legend || {})[ch])) err(where + ': thing key ' + ch + ' clashes with a map legend character');
    if (['npc', 'sign', 'chest', 'obj', 'foe', 'warp', 'trigger', 'pickup', 'mark', 'pz'].indexOf(t.type) < 0) err(where + ': unknown type ' + t.type);
    if (t.under && !D.tiles[t.under]) err(where + ': unknown under tile ' + t.under);
    if (t.gfx && !D.tiles[t.gfx]) err(where + ': unknown gfx ' + t.gfx);
    if (t.gfxIf) (Array.isArray(t.gfxIf[0]) ? t.gfxIf : [t.gfxIf]).forEach(o => { if (!D.tiles[o[1]]) err(where + ': unknown gfx ' + o[1]); });
    if ((t.type === 'npc' || t.type === 'foe') && !hasSprite(t.sprite)) err(where + ': unknown sprite ' + t.sprite);
    if (t.type === 'warp' && t.to) {
      const dest = D.maps[t.to];
      if (!dest) err(where + ': warp to unknown map ' + t.to);
      else if (!dest.rows.some(r => r.indexOf(t.at) >= 0) || !(dest.things || {})[t.at]) err(where + ': warp target ' + t.to + '.' + t.at + ' not found');
    }
    if (t.type === 'chest') for (const it in (t.items || {})) if (!D.items[it]) err(where + ': unknown item ' + it);
    if (t.type === 'pickup' && !D.items[t.item]) err(where + ': unknown item ' + t.item);
    checkScript(t.script, where);
  }
  checkScript(m.onEnter, 'map ' + id + ' onEnter');
  (m.aura || []).forEach(a => { if (!D.statuses[a.id]) err('map ' + id + ': aura with unknown status ' + a.id); });
  if (m.encounters) m.encounters.groups.forEach(g => { if (!D.groups[g[0]]) err('map ' + id + ': unknown encounter group ' + g[0]); });

  // reachability: flood from the first warp's arrival cell, walking through things
  const solid = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return true;
    const ch = m.rows[y][x];
    if (things[ch]) return false;
    const tile = ch === '.' ? m.ground : ch === ',' ? (m.ground2 || m.ground) : L[ch];
    return !D.tiles[tile] || !!D.tiles[tile].solid;
  };
  let start = null;
  m.rows.forEach((r, y) => { for (let x = 0; x < w; x++) { const t = things[r[x]]; if (!start && t && (t.type === 'warp' || t.type === 'mark')) start = [x, y]; } });
  if (!start) { warn('map ' + id + ': no warp or mark to start a reachability check from'); continue; }
  const seen = new Set([start.join()]), q = [start];
  while (q.length) { const [x, y] = q.pop(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const k = (x + dx) + ',' + (y + dy); if (!seen.has(k) && !solid(x + dx, y + dy)) { seen.add(k); q.push([x + dx, y + dy]); } }); }
  // someone behind a shop counter counts as reachable if you can stand across the counter from them
  const acrossCounter = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
    const r = m.rows[y + dy], ch = r && r[x + dx];
    return ch && L[ch] && D.tiles[L[ch]].counter && seen.has((x + 2 * dx) + ',' + (y + 2 * dy));
  });
  m.rows.forEach((r, y) => { for (let x = 0; x < w; x++) if (things[r[x]] && things[r[x]].type !== 'pz' && !seen.has(x + ',' + y) && !acrossCounter(x, y)) err('map ' + id + ': thing ' + r[x] + ' at ' + x + ',' + y + ' cannot be reached'); });
}

warns.forEach(w => console.log('warn: ' + w));
errs.forEach(e => console.log('ERROR: ' + e));
console.log(Object.keys(D.maps).length + ' maps, ' + Object.keys(D.enemies).length + ' enemies, ' + Object.keys(D.items).length + ' items: ' + errs.length + ' errors, ' + warns.length + ' warnings');
process.exit(errs.length ? 1 : 0);
