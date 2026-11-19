/* Field: loading maps from ASCII rows, walking, things, interactions, encounters.
   Map format is documented in data/maps/README (and the design bible). */
const Field = G.field = {
  map: null, danger: 0, shakeT: 0, lastName: null,
  p: { x: 0, y: 0, tx: 0, ty: 0, dir: 'down', moving: false, t: 0, step: 0 }
};
const DV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
Field.MOVE_MS = 150;
// Running: hold the Run key (Shift), or turn on Always run in Options (then holding Run walks). Twice as quick, near enough.
Field.running = () => !!G.opts.alwaysRun !== !!G.held.run;
Field.moveMs = () => Field.running() ? Field.MOVE_MS * 0.55 : Field.MOVE_MS;

Field.load = function (id) {
  const def = G.D.maps[id]; if (!def) throw new Error('No map: ' + id);
  const L = Object.assign({}, G.D.legend, def.legend || {});
  const h = def.rows.length, w = def.rows[0].length, t = [], things = [], counts = {};
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) {
      const ch = def.rows[y][x]; let tile;
      if (ch === '.') tile = def.ground;
      else if (ch === ',') tile = def.ground2 || def.ground;
      else if (def.things && def.things[ch]) {
        const td = def.things[ch]; tile = td.under || def.ground;
        const n = counts[ch] || 0; counts[ch] = n + 1;
        things.push({ key: id + '.' + ch + (n ? '#' + n : ''), ch, def: td, x, y, hx: x, hy: y, dir: td.dir || 'down', ox: 0, oy: 0, mt: 0, wt: 800 + Math.random() * 2500 });
      }
      else if (L[ch]) tile = L[ch];
      else tile = def.ground;
      row.push(tile);
    }
    t.push(row);
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const W = t[y][x] === 'wall' ? ['wallTop', 'wallFace'] : (G.D.tiles[t[y][x]] || {}).walls;   // a wall tile becomes its top or its face
    if (!W) continue;
    const below = y + 1 < h ? t[y + 1][x] : t[y][x];
    t[y][x] = (below === t[y][x] || below === 'void' || below === W[0] || below === W[1]) ? W[0] : W[1];
  }
  Field.map = { id, def, w, h, t, things, indoor: (G.D.indoor || []).indexOf(id) >= 0 };
  Field.spawnAmbient();
  Field.map.hasPz = things.some(t => t.def.pz || t.def.hidden);
  Field.map.hasBeam = things.some(t => t.def.beam); Field.map.hasSentry = things.some(t => t.def.pz === 'sentry');
  if (Field.map.hasPz) Puzzle.place();
  if (!Field.map.indoor) for (const th of things) if (th.def.wander && th.def.type === 'npc' && (!th.def.ambient || th.def.say)) Field.makeRoute(th);
};
Field.tile = (x, y) => { const m = Field.map; return (x < 0 || y < 0 || x >= m.w || y >= m.h) ? null : m.t[y][x]; };
Field.visible = th => !G.flag('x.' + th.key) && G.cond(th.def.if) && !(th.def.unless && G.cond(th.def.unless));
Field.thingsAt = (x, y) => Field.map.things.filter(th => th.x === x && th.y === y && Field.visible(th));
// Furniture: drawn with an outline and a shadow so it stands apart from the floor. (Trees, rocks and floor scatter keep
// their plain look.) Wall pieces: drawn against the wall when the square above is a wall.
Field.FURN = {}; 'table bed shelf barrel crate pillar altar pots anvil statue brazier throne throneBack coffin stall standing well lamp waylamp waylampLit boat grave graveOpen gearwork mirror horn tent'.split(' ').forEach(k => { Field.FURN[k] = 1; });
Field.FURN_THING = {}; 'coatstand coatEmpty sack notice sign shrine lampDead wardLamp chest chestOpen boulder millstone chime wheel'.split(' ').forEach(k => { Field.FURN_THING[k] = 1; });
Field.WALLMOUNT = { shelf: 1, hearth: 1, muralSong: 1 };
Field.WALL_TILE = {}; 'timber window stonewall stonewin wallTop wallFace iceTop iceFace roof snowroof nicheFace obsidianTop obsidianFace banner niches icewall obsidian wall'.split(' ').forEach(k => { Field.WALL_TILE[k] = 1; });
Field.wallAbove = (x, y) => y > 0 && !!Field.WALL_TILE[Field.tile(x, y - 1)];
Field.isSolid = th => { const t = th.def.type; if (th.def.pz === 'beast' && G.flag('pzs.' + th.key)) return false; return (t === 'npc' || t === 'sign' || t === 'chest' || t === 'obj' || t === 'foe' || t === 'roamer') && th.def.solid !== false; };
Field.blocked = function (x, y) {
  const tile = Field.tile(x, y); if (!tile) return true;
  const here = Field.thingsAt(x, y);
  if (here.some(Field.isSolid)) return true;
  if (here.some(th => th.def.type === 'warp')) return false;
  const gap = here.find(th => th.def.pz === 'gap'); if (gap) return !Puzzle.gapOpen(gap);
  return !!G.D.tiles[tile].solid;
};
Field.findMarker = function (ch) {
  const all = Field.map.things.filter(th => th.ch === ch);
  return all.length ? all[Math.floor((all.length - 1) / 2)] : null;
};

// Runs an async piece of game logic with the field locked. Swallows G.Abort.
Field.exec = async function (fn) {
  G.busy++;
  try { await fn(); }
  catch (e) { if (!(e instanceof G.Abort)) { console.error(e); G.lastError = e; } }
  finally { G.busy--; UI.hideDlg(); }
};

// Maren's prayer places and Finch's venues (data/ch9_world/m_places.js): every one, whether it has been found (its
// map entered), and whether it is used until the next rest. Found ones show on the map screens and in the journal.
Field.places = function () {
  const out = [];
  for (const [kind, list, who] of [['pray', G.D.prayers || {}, 'maren'], ['busk', G.D.venues || {}, 'finch']])
    for (const id in list) out.push({ kind, id, who, d: list[id], noted: !!G.flag('found.' + kind + '.' + id), found: !!G.flag('found.' + kind + '.' + id) || !!(G.S.seen || {})[list[id].map], used: !!G.flag(kind + '.' + id) });
  return out;
};
Field.notePlaces = function () {
  for (const p of Field.places()) {
    if (p.noted || p.d.map !== Field.map.id) continue;
    G.setFlag('found.' + p.kind + '.' + p.id, 1);
    if (G.S.party.some(m => m.id === p.who)) UI.toast(p.d.name + ': ' + (p.kind === 'pray' ? 'Maren could pray here.' : 'Finch could play here.'));
  }
};
Field.enter = async function (mapId, at, o) {
  o = o || {};
  if (!o.noFade) await UI.fade(true, 200);
  Field.load(mapId);
  const p = Field.p; let x = null, y = null, dir = o.dir;
  if (typeof at === 'string') {
    const th = Field.findMarker(at);
    if (th) { x = th.x; y = th.y; const out = th.def.out; if (out) { x += DV[out][0]; y += DV[out][1]; dir = dir || out; } }
  } else if (at) { x = at.x; y = at.y; }
  if (x == null) { x = 1; y = 1; }
  p.x = p.tx = x; p.y = p.ty = y; p.dir = dir || p.dir || 'down'; p.moving = false; p.t = 0;
  Hunt.spawn(); Hunt.enterT = G.time;
  const S = G.S; S.map = mapId; S.x = x; S.y = y; S.dir = p.dir;
  if ((G.D.towns || {})[mapId] && !G.flag('visited.' + mapId)) {
    G.setFlag('visited.' + mapId, 1);
    // reaching a new chapter's town moves the 'retreat after a wipe' point there, until you rest at an inn
    const tw = G.D.towns[mapId]; if (tw.ch > (G.S.respawnCh || 1)) { G.S.respawn = { map: mapId, at: tw.at }; G.S.respawnCh = tw.ch; }
  }
  Field.loadSeen(); Field.reveal();
  Field.danger = 0;
  G.scene = 'field'; G.scenePress = Field.press;
  const d = Field.map.def;
  G.audio.music(d.music || null);
  if (!o.noSave) G.save();
  if (!o.noFade) await UI.fade(false, 200);
  if (d.name && Field.lastName !== d.name && !o.quiet) UI.toast(d.name);
  Field.lastName = d.name;
  Field.notePlaces();
  if (d.onEnter) await G.run(d.onEnter, {});
  Field.banter();
};
// Party banter (D.banter: { map, if, lines: [[who, text]] }): once each, the first time its map is entered with its condition met.
Field.banter = function () {
  const list = G.D.banter || [], id = Field.map.id;
  for (let i = 0; i < list.length; i++) {
    const b = list[i]; if (b.map !== id || G.flag('bt.' + b.id) || (b.if && !G.cond(b.if))) continue;
    if (b.lines.some(l => !G.S.party.some(m => G.D.classes[m.id].name === l[0]))) continue;
    G.setFlag('bt.' + b.id); UI.bark(b.lines); return;
  }
};

/* ---------- interaction ---------- */
Field.press = function (b) {
  if (G.busy) return;
  if (b === 'a') Field.interact();
  else if (b === 'b' && !Field.p.moving) Field.exec(() => Menu.open());
  else if (b === 'switch' && !Field.p.moving) Field.switchLeader();
  else if (b === 'ability' && !Field.p.moving) Field.exec(() => Field.ability());
};
// What the interact key would use right now: the thing in front of the leader (or across a counter), or null.
Field.target = function () {
  const p = Field.p; if (p.moving || !DV[p.dir]) return null;
  const d = DV[p.dir]; let x = p.x + d[0], y = p.y + d[1];
  const usable = th => th.def.type !== 'warp' && th.def.type !== 'trigger' && th.def.type !== 'pz' && (!th.def.hidden || G.flag('sp.' + th.key));
  let th = Field.thingsAt(x, y).find(usable);
  if (!th) {
    const tile = Field.tile(x, y);
    if (tile && G.D.tiles[tile].counter) th = Field.thingsAt(x + d[0], y + d[1]).find(usable);   // talk across a counter
  }
  return th || null;
};
Field.interact = function () { const th = Field.target(); if (th) Field.exec(() => Field.use(th)); };
// Whether using it does anything (a person with something to say, a sign, a chest, a pickup, a scripted object).
Field.hasUse = th => { const d = th.def;
  if (d.type === 'roamer' || d.type === 'sign' || d.type === 'pickup') return true;
  if (d.type === 'chest') return !G.flag('o.' + th.key);
  if (d.pz) return !!(d.script || d.pz === 'beast' || d.text);
  return !!d.script; };
// The prompt: a small key over whatever the interact key would use, while the party stands still with nothing open.
Field.drawPrompt = function (c, cx, cy) {
  if (G.opts.prompts === false || G.busy || G.modals.length || G.cine || Field.hideP || Field.p.moving) return;
  const th = Field.target(); if (!th || !Field.hasUse(th)) return;
  const k = G.keyName((G.bindings().a || [])[0] || 'z'), T = 16;
  const x = Math.round((th.x + th.ox * th.mt) * T - cx) + 11, y = Math.round((th.y + th.oy * th.mt) * T - cy) - 9 + (Math.floor(G.time / 400) % 2);
  c.font = 'bold 7px ui-monospace, Menlo, monospace'; const w = Math.max(7, Math.ceil(c.measureText(k).width) + 4);
  c.fillStyle = '#120c18'; c.fillRect(x - 1, y - 1, w + 2, 10);
  c.fillStyle = '#f6f0e2'; c.fillRect(x, y, w, 8);
  c.fillStyle = '#120c18'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(k, x + w / 2, y + 4.5);
  c.textBaseline = 'alphabetic';
};
Field.use = async function (th) {
  const d = th.def, p = Field.p;
  if (d.type === 'roamer') { await Hunt.fight(th); return; }
  if (d.pz === 'beast') { th.dir = OPP[p.dir]; await Puzzle.beastUse(th); return; }
  if (d.pz && !d.script) { await Puzzle.look(th); return; }
  if (d.type === 'npc') { th.dir = OPP[p.dir]; await G.run(d.script || [], { thing: th }); }
  else if (d.type === 'sign') { if (d.hidden) G.setFlag('rd.' + th.key); if (d.script) await G.run(d.script, { thing: th }); else await UI.say(null, d.text || '...'); }
  else if (d.type === 'chest') await Field.openChest(th);
  else if (d.type === 'pickup') Field.pickup(th);
  else if (d.script) await G.run(d.script, { thing: th });
};
Field.openChest = async function (th) {
  const d = th.def, k = th.key;
  if (G.flag('o.' + k)) { await UI.say(null, 'Empty.'); return; }
  if (d.lock && !G.flag('u.' + k)) {
    await UI.say(null, 'The chest is locked.');
    if (!(await G.check('dask', d.lock))) {
      const m = G.member('dask'); m.hp = Math.max(1, m.hp - G.roll('1d3')); G.audio.sfx('hit');
      await UI.say('Dask', G.pick(['Ow. Needle in the lock. Give me a moment.', 'Rusted solid. Let me try that again.', 'Almost had it.']));
      return;
    }
    G.setFlag('u.' + k); G.audio.sfx('door');
    await UI.say('Dask', G.pick(['And... there.', 'Hardly a lock at all.']));
  }
  G.setFlag('o.' + k); G.audio.sfx('chest');
  const got = [];
  if (d.gold) { G.S.gold += d.gold; got.push(d.gold + ' gold'); }
  for (const id in (d.items || {})) { G.give(id, d.items[id]); got.push(G.D.items[id].name + (d.items[id] > 1 ? ' ×' + d.items[id] : '')); }
  await UI.say(null, 'Found ' + got.join(', ') + '.');
  if (d.script) await G.run(d.script, { thing: th });
};
Field.pickup = function (th) {
  const d = th.def; G.setFlag('x.' + th.key); G.give(d.item, d.n || 1); G.audio.sfx('item');
  UI.toast('Got ' + G.D.items[d.item].name + ((d.n || 1) > 1 ? ' ×' + d.n : ''));
};
/* ---------- exploration ----------
   The squares the party has been near, per map, kept in G.S.seen as run-length strings (base 36, '.' between runs,
   starting with an unseen run). Rooms small enough to take in at a glance are seen whole on entry. */
Field.REVEAL = 5;
Field.loadSeen = function () {
  const m = Field.map, n = m.w * m.h, bits = new Uint8Array(n), rle = (G.S.seen || {})[m.id];
  if (typeof rle === 'string') { let i = 0, v = 0; for (const part of rle.split('.')) { const len = parseInt(part, 36) || 0; if (v) bits.fill(1, i, Math.min(n, i + len)); i += len; v ^= 1; } }
  Field.seenBits = bits;
};
Field.encodeSeen = function (bits) {
  const out = []; let v = 0, run = 0;
  for (let i = 0; i < bits.length; i++) { if (bits[i] === v) run++; else { out.push(run.toString(36)); v ^= 1; run = 1; } }
  out.push(run.toString(36)); return out.join('.');
};
Field.reveal = function () {
  const m = Field.map, bits = Field.seenBits, p = Field.p; if (!m || !bits) return;
  const R = m.w * m.h <= 420 ? 99 : Field.REVEAL; let changed = false;
  for (let y = Math.max(0, p.y - R); y <= Math.min(m.h - 1, p.y + R); y++) for (let x = Math.max(0, p.x - R); x <= Math.min(m.w - 1, p.x + R); x++) {
    if ((x - p.x) * (x - p.x) + (y - p.y) * (y - p.y) > R * R + 2) continue;
    const i = y * m.w + x; if (!bits[i]) { bits[i] = 1; changed = true; }
  }
  if (changed) { G.S.seen = G.S.seen || {}; G.S.seen[m.id] = Field.encodeSeen(bits); }
};
Field.arrive = function (from) {
  const p = Field.p, S = G.S; S.x = p.x; S.y = p.y; S.dir = p.dir;
  Field.reveal();
  if (Field.map.hasPz) {
    const trap = Field.thingsAt(p.x, p.y).find(t => t.def.pz === 'trap' && !G.flag('pzd.' + t.key));
    if (trap) { Field.exec(() => Puzzle.arrive(from)); return; }
    Puzzle.spot(); Puzzle.update();
    if (!G.auto) Puzzle.tips();
    if (Field.map.hasSentry) {
      Puzzle.steps = (Puzzle.steps || 0) + 1;
      for (const s of Field.map.things) if (s.def.pz === 'sentry') s.dir = Puzzle.facing(s);
      if (Puzzle.seen()) { Field.exec(() => Puzzle.watch()); return; }     // caught: no doors or triggers this step
    }
  }
  const here = Field.thingsAt(p.x, p.y);
  const warp = here.find(t => t.def.type === 'warp');
  if (warp) {
    Field.exec(async () => {
      if (warp.def.script) await G.run(warp.def.script, { thing: warp });
      if (warp.def.to) { G.audio.sfx('door'); await Field.enter(warp.def.to, warp.def.at); }
    });
    return;
  }
  const pick = here.find(t => t.def.type === 'pickup'); if (pick) Field.pickup(pick);
  const trig = here.find(t => t.def.type === 'trigger' && !(t.def.once !== false && G.flag('t.' + t.key)));
  if (trig) {
    Field.exec(async () => {
      const once = trig.def.once !== false, k = 't.' + trig.key;
      if (once) G.setFlag(k);
      try { await G.run(trig.def.script || [], { thing: trig }); }
      catch (e) { if (once && e instanceof G.Abort) G.setFlag(k, 0); throw e; }   // a lost fight inside it: the trigger stays armed
    });
    return;
  }
  for (const th of Field.map.things) {
    if (th.def.type === 'foe' && Field.visible(th) && Math.abs(th.x - p.x) + Math.abs(th.y - p.y) === 1) {
      if (!G.auto) B.nextOpening = Hunt.opening(th);
      p.dir = th.x < p.x ? 'left' : th.x > p.x ? 'right' : th.y < p.y ? 'up' : 'down';
      Field.exec(async () => { try { await Field.use(th); } finally { B.nextOpening = null; } }); return;
    }
  }
  const enc = Field.map.def.encounters;
  if (enc && !(enc.unless && G.cond(enc.unless)) && !G.D.tiles[Field.tile(p.x, p.y)].safe) {
    Field.danger++;
    // two or more levels above the area, the wildlife gives the party a wide berth: half as many random fights
    const wary = G.mapLevel(G.S.map) && G.S.level >= G.mapLevel(G.S.map) + 2 ? 0.5 : 1;
    if (Field.danger > (enc.min || 7) * (Field.map.roamers ? 1.5 : 1) && G.rand() < enc.rate * (Field.map.roamers ? 0.5 : 1) * wary) {
      Field.danger = 0;
      const g = G.wpick(enc.groups);
      Field.exec(async () => { await B.start(g, {}); });
    }
  }
};

/* ---------- update ---------- */
Field.update = function (dt) {
  const p = Field.p, m = Field.map; if (!m) return;
  if (Field.shakeT > 0) Field.shakeT -= dt;
  if (p.moving) {
    p.t += dt / (p.scripted ? Field.MOVE_MS : Field.moveMs());
    if (p.t >= 1) { const from = [p.x, p.y]; p.x = p.tx; p.y = p.ty; p.moving = false; p.t = 0; p.step++; if (p.scripted) p.scripted = false; else Field.arrive(from); }
  }
  const free = !G.busy && !G.modals.length;
  // level-up choices waiting: offer them as soon as the party is standing still and nothing else is going on
  if (!p.moving && free && !G.cine && G.scene === 'field' && G.S.pendingPicks && G.S.pendingPicks.length) { Field.exec(() => G.processPicks()); return; }
  if (!p.moving && free) {
    const dir = G.dirOrder[G.dirOrder.length - 1];
    if (dir && DV[dir] && G.held[dir]) {
      p.dir = dir;
      const nx = p.x + DV[dir][0], ny = p.y + DV[dir][1];
      if (!Field.blocked(nx, ny)) { p.tx = nx; p.ty = ny; p.moving = true; p.t = 0; }
      else if (m.hasPz) Puzzle.bump(nx, ny, dir);
    }
  }
  // townsfolk walk their rounds; animals potter about
  for (const th of m.things) {
    if (th.mt > 0) { th.mt -= dt / (th.route ? 420 : 320); if (th.mt <= 0) { th.mt = 0; th.ox = th.oy = 0; } }
    if (th.route) { if (free && th.mt <= 0 && Field.visible(th)) Field.patrol(th, dt); continue; }
    if (!th.def.wander || !free || th.mt > 0 || !Field.visible(th) || m.indoor) continue;
    th.wt -= dt; if (th.wt > 0) continue;
    th.wt = 1200 + Math.random() * 2600;
    const dir = G.pick(['up', 'down', 'left', 'right']), nx = th.x + DV[dir][0], ny = th.y + DV[dir][1];
    th.dir = dir;
    if (Math.abs(nx - th.hx) > 2 || Math.abs(ny - th.hy) > 2) continue;
    if (Field.blocked(nx, ny) || (nx === p.x && ny === p.y) || (nx === p.tx && ny === p.ty)) continue;
    if (Field.thingsAt(nx, ny).length) continue;
    th.ox = -DV[dir][0]; th.oy = -DV[dir][1]; th.x = nx; th.y = ny; th.mt = 1;
  }
  Hunt.tick(dt);
};

/* ---------- draw ---------- */
Field.thingGfx = function (th) {
  const d = th.def;
  if (d.pz) return Puzzle.gfx(th);
  if (d.type === 'chest') return G.flag('o.' + th.key) ? 'chestOpen' : 'chest';
  if (d.gfxIf) {                                         // [cond, gfx] or a list of them; the first that holds wins
    const opts = Array.isArray(d.gfxIf[0]) ? d.gfxIf : [d.gfxIf];
    for (const o of opts) if (G.cond(o[0])) return o[1];
  }
  if (d.type === 'sign') return d.gfx || 'sign';
  return d.gfx;
};
// Weather: drifting snow, ash, rain or leaves over some outdoor maps (D.weather[mapId]).
Field.weather = function (c) {
  const kind = (G.D.weather || {})[Field.map.id]; if (!kind || G.fast) return;
  const W = G.W, H = G.H, now = G.time, dt = Math.min(60, now - (Field.wxT || now)); Field.wxT = now;
  if (Field.wxKind !== kind) { Field.wxKind = kind; Field.wx = []; for (let i = 0; i < (kind === 'rain' ? 110 : kind === 'snow' ? 90 : 60); i++) Field.wx.push({ x: Math.random() * W, y: Math.random() * H, s: 0.5 + Math.random(), p: Math.random() * 6.28 }); }
  const S = { snow: [0.012, 0.03], ash: [0.008, 0.018], rain: [-0.05, 0.22], leaves: [0.02, 0.025] }[kind];
  for (const q of Field.wx) {
    q.p += dt * 0.002; q.x += (S[0] * q.s + Math.sin(q.p) * (kind === 'rain' ? 0 : 0.012)) * dt; q.y += S[1] * q.s * dt;
    if (q.y > H + 4) { q.y = -4; q.x = Math.random() * W; } if (q.x > W + 4) q.x = -4; if (q.x < -4) q.x = W + 4;
    if (kind === 'snow') { const z = q.s > 1 ? 2 : 1; c.fillStyle = 'rgba(110,130,170,.45)'; c.fillRect((q.x | 0) + 1, (q.y | 0) + 1, z, z); c.fillStyle = '#ffffff'; c.fillRect(q.x | 0, q.y | 0, z, z); }
    else if (kind === 'ash') { c.fillStyle = q.s > 1.2 ? 'rgba(255,140,60,.75)' : 'rgba(180,170,165,.6)'; c.fillRect(q.x | 0, q.y | 0, 1, 1); }
    else if (kind === 'rain') { c.strokeStyle = 'rgba(190,210,245,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(q.x - 1.5, q.y + 5); c.stroke(); }
    else { c.fillStyle = q.s > 1 ? '#c87a2a' : '#a8a03a'; const a = Math.sin(q.p * 2); c.fillRect(q.x | 0, q.y | 0, a > 0 ? 2 : 1, a > 0 ? 1 : 2); }
  }
  if (kind === 'ash' || kind === 'rain') { c.fillStyle = kind === 'ash' ? 'rgba(90,50,30,.08)' : 'rgba(30,40,70,.08)'; c.fillRect(0, 0, W, H); }
};
Field.draw = function (c) {
  const m = Field.map, p = Field.p, T = 16;
  c.fillStyle = '#0b0a10'; c.fillRect(0, 0, G.W, G.H);
  if (!m) return;
  const ppx = (p.x + (p.tx - p.x) * p.t) * T, ppy = (p.y + (p.ty - p.y) * p.t) * T;
  const mw = m.w * T, mh = m.h * T;
  let cx = mw <= G.W ? -(G.W - mw) / 2 : G.clamp(ppx + 8 - G.W / 2, 0, mw - G.W);
  let cy = mh <= G.H ? -(G.H - mh) / 2 : G.clamp(ppy + 8 - G.H / 2, 0, mh - G.H);
  if (Field.cam) {                                  // cutscene camera: frame a tile, even past the map's edge
    cx = mw <= G.W ? cx : G.clamp(Field.cam[0] * T + 8 - G.W / 2, 0, mw - G.W);
    cy = Field.cam[1] * T + 8 - G.H / 2;
  }
  cx = Math.round(cx); cy = Math.round(cy);
  if (Field.shakeT > 0) { cx += G.ri(-2, 2); cy += G.ri(-2, 2); }
  const x0 = Math.max(0, Math.floor(cx / T)), y0 = Math.max(0, Math.floor(cy / T));
  const x1 = Math.min(m.w - 1, Math.floor((cx + G.W) / T)), y1 = Math.min(m.h - 1, Math.floor((cy + G.H) / T));
  const TD = G.D.tiles, gr = m.def.ground, FURN = Field.FURN, later = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const id = m.t[y][x], d = TD[id], h = (x * 7 + y * 13) % 11;
    if (d.base) G.gfx.drawTile(c, d.base === 'ground' ? gr : d.base, x * T - cx, y * T - cy, h);
    if (FURN[id] || Field.WALLMOUNT[id]) later.push([id, x, y]); else G.gfx.drawTile(c, id, x * T - cx, y * T - cy, h);
  }
  // furniture after the floor, so its outline and shadow are not painted over by the next tile; anything that belongs
  // on a wall (shelves, fireplaces) is drawn against the wall when it stands right under one
  for (const [id, x, y] of later) {
    const sx = x * T - cx, sy = y * T - cy, onWall = Field.WALLMOUNT[id] && Field.wallAbove(x, y);
    if (!onWall) { G.gfx.drawThing(c, id, sx, sy, FURN[id] ? 'furn' : 'wall'); continue; }
    if (id === 'hearth') {                         // a chimney breast built into the wall above, with a mantel
      const wid = Field.tile(x, y - 1);
      G.gfx.drawTilePart(c, TD[wid] && /ice|obsidian/.test(wid) ? wid : 'stonewall', 0, 0, 16, 16, sx, sy - 16);
      c.fillStyle = 'rgba(18,12,24,.85)'; c.fillRect(sx - 1, sy - 14, 1, 30); c.fillRect(sx + 16, sy - 14, 1, 30);
      c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(sx + 4, sy - 16, 8, 16);
      G.gfx.drawTile(c, id, sx, sy, 0);
      c.fillStyle = '#4a2c18'; c.fillRect(sx - 1, sy - 2, 18, 3); c.fillStyle = '#8a5a34'; c.fillRect(sx - 1, sy - 2, 18, 1);
      continue;
    }
    // shelves and the like: raised so their backs stand against the wall face, with a shadow at their feet
    c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(sx + 1, sy + 10, 14, 3);
    G.gfx.drawThing(c, id, sx, sy - 6, 'wall');
  }
  const list = [];
  for (const th of m.things) {
    if (th.x < x0 - 1 || th.x > x1 + 1 || th.y < y0 - 1 || th.y > y1 + 1 || !Field.visible(th)) continue;
    if (th.def.hidden && !th.def.pz && !G.flag('sp.' + th.key)) continue;
    const d = th.def, sx = (th.x + th.ox * th.mt) * T - cx, sy = (th.y + th.oy * th.mt) * T - cy;
    if (d.type === 'npc' || d.type === 'foe') {
      if (d.sprite) list.push({ y: sy, s: d.sprite, x: sx, dir: th.dir, f: th.mt > 0 ? (th.mt > 0.5 ? 1 : 2) : 0, a: d.pz === 'beast' && G.flag('pzs.' + th.key) ? 0.7 : d.alpha, th: d.type === 'npc' && !d.ambient ? th : null, hunt: (d.type === 'roamer' || (d.type === 'foe' && !d.noHunt)) ? th : null });
    } else {
      const g = Field.thingGfx(th); if (!g) continue;
      const pop = Field.pops(th);
      const gl = Field.glintable(th) ? th : null;
      if (Field.isSolid(th) && d.type !== 'pz') list.push({ y: sy, g, x: sx, gl, th: d.type === 'sign' || d.abil ? th : null, pop, furn: !pop && (Field.FURN[g] || Field.FURN_THING[g]), wall: Field.WALLMOUNT[g] && Field.wallAbove(th.x, th.y) });
      else if (pop) G.gfx.drawThing(c, g, sx, sy); else G.gfx.drawTile(c, g, sx, sy, 0);     // floor-level: under everyone
      if (gl && !Field.isSolid(th)) Field.drawGlint(c, gl, sx, sy);
    }
  }
  if (!Field.hideP) list.push({ y: ppy - cy + 0.5, s: Field.leader(), x: ppx - cx, dir: p.dir, f: p.moving ? (p.t < 0.5 ? (p.step % 2 ? 1 : 2) : 0) : 0 });
  list.sort((a, b) => a.y - b.y);
  for (const o of list) {
    if (o.g) {
      const oy = o.wall ? o.y - 6 : o.y;
      if (o.wall) { c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(o.x + 1, o.y + 10, 14, 3); }
      if (o.pop) G.gfx.drawThing(c, o.g, o.x, oy); else if (o.furn || o.wall) G.gfx.drawThing(c, o.g, o.x, oy, o.wall ? 'wall' : 'furn'); else G.gfx.drawTile(c, o.g, o.x, oy, 0);
      if (o.th && o.th.def.abil) Field.drawAbilMark(c, o.th, o.x, oy);
      if (o.gl) Field.drawGlint(c, o.gl, o.x, oy);
    }
    else {
      if (o.hunt) {                                    // enemies: a red ring at their feet (brighter while they chase)
        const t = o.hunt, hot = t.chase, a = hot ? 0.75 + Math.sin(G.time / 90) * 0.2 : 0.5;
        c.strokeStyle = 'rgba(230,50,40,' + a + ')'; c.lineWidth = hot ? 1.5 : 1; c.beginPath(); c.ellipse(Math.round(o.x) + 8, Math.round(o.y) + 13, 7, 3, 0, 0, 6.283); c.stroke();
      }
      if (o.a) c.globalAlpha = o.a;
      G.gfx.drawSprite(c, o.s, o.dir, o.f, Math.round(o.x), Math.round(o.y) - 4);
      c.globalAlpha = 1;
    }
    if (o.th && !o.g && o.th.def.pz) Puzzle.drawExtra(c, o.th, o.x, o.y);
    if (o.th && !o.g) { const k = Field.questMark(o.th); if (k) Field.drawMark(c, k, o.x, o.y - 4); }
    else if (o.th && o.th.def.type === 'sign') { const k = Field.questMark(o.th); if (k) Field.drawMark(c, k, o.x, o.y - 4); }
  }
  Field.drawClues(c, cx, cy);
  Field.drawPrompt(c, cx, cy);
  Field.weather(c);
  Field.air(c, cx, cy);
  if (m.hasPz) { Puzzle.drawBeams(c, cx, cy); Puzzle.drawSight(c, cx, cy); }
  if (Puzzle.dark(c, cx, cy, ppx, ppy)) { /* puzzle darkness */ }
  else if (m.def.dark) {
    const lt = Field.hideP && m.def.light;
    const gx = lt ? lt[0] * T - cx + 8 : ppx - cx + 8, gy = lt ? lt[1] * T - cy + 8 : ppy - cy + 6;
    Field.drawDark(c, m, gx, gy, cx, cy);                // the dark, with holes round the party and every lamp
  }
  else if (m.indoor) Field.drawIndoor(c, m, cx, cy);   // warm light round hearths and lamps, dimmer corners
  Field.hud();
  // emote bubbles (cutscenes)
  Field.emotes = Field.emotes.filter(e => G.time - e.t < 1100);
  for (const e of Field.emotes) {
    let x, y;
    if (e.who === 'player') { x = ppx - cx; y = ppy - cy; }
    else { const th = Field.actor(e.who); if (!th) continue; x = (th.x + th.ox * th.mt) * T - cx; y = (th.y + th.oy * th.mt) * T - cy; }
    const by = Math.round(y - 17 - Math.max(0, 3 - (G.time - e.t) / 40));
    c.fillStyle = '#1a1420'; c.fillRect(x + 2, by - 1, 13, 12); c.fillRect(x + 6, by + 11, 4, 2);
    c.fillStyle = '#f4f1e6'; c.fillRect(x + 3, by, 11, 10); c.fillRect(x + 7, by + 10, 2, 2);
    c.fillStyle = '#1a1420'; c.font = 'bold 8px ui-monospace, Menlo, monospace'; c.textAlign = 'center';
    c.fillText(e.ch, x + 8.5, by + 8);
  }
};

/* ---------- cutscene helpers ---------- */
Field.emotes = [];
Field.hideP = false;
Field.cam = null;
Field.actor = ch => Field.map.things.find(t => t.ch === ch && Field.visible(t)) || Field.map.things.find(t => t.ch === ch);
const STEP = { u: [0, -1, 'up'], d: [0, 1, 'down'], l: [-1, 0, 'left'], r: [1, 0, 'right'] };
// Walks an actor along a path like 'uurrd'. Scripted moves ignore walls and people.
Field.moveActor = async function (ch, path) {
  const th = Field.actor(ch); if (!th) return;
  for (const s of path) {
    const v = STEP[s]; th.dir = v[2]; th.x += v[0]; th.y += v[1];
    if (G.fast) { th.mt = 0; th.ox = th.oy = 0; continue; }
    th.ox = -v[0]; th.oy = -v[1]; th.mt = 1;
    await G.sleep(320);
  }
  th.mt = 0; th.ox = th.oy = 0;
};
Field.walkPlayer = async function (path) {
  const p = Field.p;
  for (const s of path) {
    const v = STEP[s]; p.dir = v[2];
    if (G.fast) { p.x = p.tx = p.x + v[0]; p.y = p.ty = p.y + v[1]; continue; }
    p.tx = p.x + v[0]; p.ty = p.y + v[1]; p.t = 0; p.moving = true; p.scripted = true;
    while (p.moving) { if (G.fast) { p.x = p.tx; p.y = p.ty; p.moving = false; p.scripted = false; break; } await new Promise(r => setTimeout(r, 16)); }
  }
  G.S.x = p.x; G.S.y = p.y; G.S.dir = p.dir;
};

/* ---------- quest markers: a "!" over people and boards who have quest business for you ---------- */
// Each npc/sign's script is scanned once for ['quest', id, stage] commands, with the conditions that guard them
// (the 'if' branches, topic and choice conditions on the way, and scripts reached by 'run').
Field.questInfo = function (def) {
  if (def._quests) return def._quests;
  const out = [], seen = new Set();
  const walk = (s, conds) => {
    if (!Array.isArray(s)) return;
    if (typeof s[0] === 'string') {
      const c = s;
      if (c[0] === 'quest' && typeof c[1] === 'string') out.push({ id: c[1], stage: c[2], conds });
      else if (c[0] === 'if') { walk(c[2], conds.concat([{ c: c[1] }])); walk(c[3], conds.concat([{ c: c[1], not: 1 }])); }
      else if (c[0] === 'topics' || c[0] === 'choice') (c[3] || []).forEach(o => { if (Array.isArray(o)) walk(o[1], o[2] ? conds.concat([{ c: o[2] }]) : conds); });
      else if (c[0] === 'run' && G.D.scripts[c[1]] && !seen.has(c[1])) { seen.add(c[1]); walk(G.D.scripts[c[1]], conds); }
      return;
    }
    s.forEach(x => walk(x, conds));
  };
  walk(def.script || [], []);
  return (def._quests = out);
};
Field.MAINQ = /^(main\d*|act\d)$/;
Field.questMark = function (th) {
  const d = th.def;
  if (d.type !== 'npc' && d.type !== 'sign') return null;
  let mark = null;
  for (const q of Field.questInfo(d)) {
    const Q = G.D.quests[q.id]; if (!Q) continue;
    const cur = G.flag('q.' + q.id) || 0;
    if (cur >= (Q.done || 99) || !(q.stage > cur)) continue;
    if (!q.conds.every(k => (k.not ? !G.cond(k.c) : G.cond(k.c)))) continue;
    if (Field.MAINQ.test(q.id)) return 'main';
    mark = 'side';
  }
  return mark;
};
Field.drawMark = function (c, kind, x, y) {
  const bob = Math.round(Math.sin(G.time / 220) * 1.5), X = Math.round(x) + 6, Y = Math.round(y) - 14 + bob;
  const col = kind === 'main' ? '#ffd23a' : '#5ab8ff', dark = kind === 'main' ? '#7a4a00' : '#103a6a';
  c.fillStyle = '#120c18'; c.fillRect(X - 1, Y - 1, 5, 9); c.fillRect(X - 1, Y + 8, 5, 4);
  c.fillStyle = col; c.fillRect(X, Y, 3, 6); c.fillRect(X, Y + 8, 3, 3);
  c.fillStyle = dark; c.fillRect(X + 2, Y + 1, 1, 5); c.fillRect(X + 2, Y + 9, 1, 2);
  c.fillStyle = '#ffffff'; c.fillRect(X, Y, 1, 2);
};

/* ---------- life in the wild: animals and passers-by that come and go ---------- */
// D.ambient[mapId] = [{ sprite, n, lines, wild }]. Spawned fresh each time a map loads, never saved, never fought.
Field.spawnAmbient = function () {
  const m = Field.map, list = (G.D.ambient || {})[m.id]; if (!list) return;
  const rnd = (n) => Math.floor(Math.random() * n), occupied = new Set(m.things.map(t => t.x + ',' + t.y));
  const okTile = (x, y) => { const t = Field.tile(x, y); return t && !G.D.tiles[t].solid && t !== 'path' && t !== 'bridge' && t !== 'boardwalk' && !occupied.has(x + ',' + y); };
  const open = (x, y) => { let n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (okTile(x + dx, y + dy)) n++; return n >= 8; };
  const far = (x, y) => m.things.every(t => Math.abs(t.x - x) + Math.abs(t.y - y) > 3 || t.def.ambient);
  list.forEach((a, ai) => {
    if (a.if && !G.cond(a.if)) return;
    for (let i = 0; i < (a.n || 1); i++) {
      for (let tries = 0; tries < 60; tries++) {
        const x = 1 + rnd(m.w - 2), y = 1 + rnd(m.h - 2);
        if (!open(x, y) || !far(x, y)) continue;
        const line = a.lines[rnd(a.lines.length)];
        const def = { type: 'npc', sprite: a.sprite, wander: 1, ambient: 1, dir: G.pick(['down', 'left', 'right', 'up']),
          script: a.say ? [['say', a.say, line]] : [['note', line]] };
        m.things.push({ key: m.id + '.~' + ai + '.' + i, ch: '~' + ai, def, x, y, hx: x, hy: y, dir: def.dir, ox: 0, oy: 0, mt: 0, wt: 400 + Math.random() * 2500 });
        occupied.add(x + ',' + y); break;
      }
    }
  });
};

/* ---------- the party leader: who walks in front, and what they can do outside a fight ---------- */
Field.LEAD = {
  runa: { name: 'Smash and shove', color: '#ff8a4a', desc: 'Break cracked walls, rubble and barricades, and shove heavy blocks (walk into one).',
    none: ['Runa looks round for something to break. Nothing obliges.', 'Runa taps the wall with her axe. It is a perfectly good wall.'] },
  dask: { name: 'Pick and spot', color: '#6ad07a', desc: 'Open any lock without a fumble, spot hidden traps, plates and doors near him, disarm traps, and flick a pebble onto a plate.',
    none: ['Dask pats the stones, the floor, his own pockets. Nothing.', 'Dask sniffs. "No locks. No secrets. Sad."'] },
  maren: { name: 'Lamplight', color: '#ffd24a', desc: 'Carries the strongest light in dark places, and lights old Warden lamps. At shrines and altars (each its own), she prays: healing, skill points, or a blessing for the next fight. Fresh again after a rest.',
    none: ['Maren looks round for something to light. Nothing here is hers.'] },
  finch: { name: 'Perform', color: '#c88aff', desc: 'Win over the people who need it, ring bells and bell-stones, and sing beasts to sleep. At the places a crowd gathers (each its own), he plays: coin, sometimes a gift, sometimes the party starts the next fight Inspired. Fresh again after a rest.',
    none: ['Finch hums a few bars to nobody in particular.', 'Finch plays a jig. A crow is unimpressed.'] }
};
Field.nameOf = id => { const m = G.member(id); return (m && G.stats(m).name) || id; };
Field.leader = () => { const l = G.S.leader || 'runa'; return G.S.party.some(m => m.id === l) ? l : 'runa'; };
Field.switchLeader = function (to) {
  const ids = G.S.party.map(m => m.id);
  const cur = ids.indexOf(Field.leader());
  G.S.leader = to || ids[(cur + 1) % ids.length];
  G.audio.sfx('select');
  const L = Field.LEAD[G.S.leader];
  UI.toast(Field.nameOf(G.S.leader) + ' leads' + (L ? ': ' + L.name : ''));
  Field.hud(true);
};
Field.faced = function () {
  const p = Field.p, d = DV[p.dir], x = p.x + d[0], y = p.y + d[1];
  return Field.thingsAt(x, y).find(th => th.def.type !== 'warp' && th.def.type !== 'trigger') || null;
};
Field.ability = async function () {
  const who = Field.leader(), name = Field.nameOf(who), th = Field.faced();
  if (Field.map.hasPz && await Puzzle.ability(who, th)) { Puzzle.update(); return; }
  const NAMES = { runa: 'Runa', dask: 'Dask', maren: 'Maren', finch: 'Finch' };
  if (th && th.def.abil) {
    if (th.def.abil.who === who) { await G.run(th.def.abil.script, { thing: th }); return; }
    await UI.say(name, { runa: 'That needs breaking, and I am not the one for it. ', dask: '', maren: '', finch: '' }[who] + 'That is a job for ' + NAMES[th.def.abil.who] + '.');
    return;
  }
  if (th && th.def.type === 'chest' && th.def.lock && who === 'dask' && !G.flag('u.' + th.key) && !G.flag('o.' + th.key)) {
    G.setFlag('u.' + th.key); G.audio.sfx('door'); await UI.say('Dask', 'There. Clean as a whistle.'); await Field.openChest(th); return;
  }
  if (who === 'finch' && th && th.def.ambient && !th.def.say) { await UI.say('Finch', 'A song for you, little one.'); await UI.say(null, 'The animal listens, head on one side, then wanders off looking pleased.'); return; }
  if (who === 'maren') { await UI.say('Maren', G.pick(['Not here. The Lamplighter listens best at a shrine, an altar, an old lamp.', 'This is no place to pray. Find me a shrine.'])); return; }
  if (who === 'finch' && (G.D.towns || {})[Field.map.id]) { await UI.say('Finch', 'Nobody here will stand still for a song. A square, a common room, a dock: that is where you play.'); return; }
  await UI.say(name, G.pick(Field.LEAD[who].none));
};
// A thing waiting for one particular leader glints in that leader's colour while they are in front.
Field.drawAbilMark = function (c, th, x, y) {
  const a = th.def.abil; if (!a || a.who !== Field.leader()) return;
  const col = Field.LEAD[a.who].color, t = G.time / 260, X = Math.round(x) + 8, Y = Math.round(y) - 7 + Math.round(Math.sin(t) * 1.5);
  c.fillStyle = '#120c18'; c.beginPath(); c.moveTo(X, Y - 4); c.lineTo(X + 4, Y); c.lineTo(X, Y + 4); c.lineTo(X - 4, Y); c.fill();
  c.fillStyle = col; c.beginPath(); c.moveTo(X, Y - 3); c.lineTo(X + 3, Y); c.lineTo(X, Y + 3); c.lineTo(X - 3, Y); c.fill();
  c.fillStyle = '#ffffff'; c.fillRect(X - 1, Y - 2, 1, 1);
};
// Things you can use stand out from the ground: an outline and a soft shadow (gfx.drawThing).
Field.pops = th => { const t = th.def.type; if (th.def.pz) return Puzzle.pops(th); return (t === 'chest' && !G.flag('o.' + th.key)) || t === 'sign' || (t === 'obj' && (th.def.script || th.def.abil)) || (t === 'warp' && th.def.gfx && th.def.gfx !== 'path'); };
// The leader's portrait, and the other three: click one to bring them to the front.
Field.hud = function (force) {
  let el = Field.hudEl;
  const show = G.scene === 'field' && !G.cine && !G.modals.length && !Field.hideP && Field.map && !G.tutorial();
  if (!el) {
    el = Field.hudEl = UI.el('div', 'leadbar');
    UI.root.appendChild(el);
    el.addEventListener('click', e => { const t = e.target.closest('[data-id]'); if (t && !G.busy) Field.switchLeader(t.getAttribute('data-id')); e.stopPropagation(); });
  }
  el.style.display = show ? '' : 'none';
  const key = Field.leader() + G.S.party.length;
  if (!force && el.dataset.k === key) return;
  el.dataset.k = key;
  const lead = Field.leader(), L = Field.LEAD[lead] || {};
  el.innerHTML = G.S.party.map(m => '<span class="lchip' + (m.id === lead ? ' on' : '') + '" data-id="' + m.id + '" title="' + UI.esc(Field.nameOf(m.id)) + '"><img src="' + (B.faceURL ? B.faceURL(m.id, 0) : '') + '"></span>').join('') +
    '<span class="lname"><b>' + UI.esc(Field.nameOf(lead)) + '</b> · ' + UI.esc(L.name || '') + ' <em>' + Menu.keyHint('ability') + '</em><br><small>' + Menu.keyHint('switch') + ' to switch</small></span>';
};

/* ---------- walking rounds: outdoor folk loop through 3-5 spots near home and stop a while at each ---------- */
Field.makeRoute = function (th) {
  const m = Field.map, hx = th.x, hy = th.y, R = th.def.ambient ? 7 : 5;
  let seed = 0; for (const ch of th.key) seed = (seed * 31 + ch.charCodeAt(0)) | 0;
  const rnd = () => { seed = (seed * 1103515245 + 12345) | 0; return ((seed >>> 8) & 0xffff) / 65536; };
  const occupied = new Set(m.things.filter(t => t !== th && Field.isSolid(t)).map(t => t.x + ',' + t.y));
  const walk = (x, y) => { const t = Field.tile(x, y); return t && !G.D.tiles[t].solid && !occupied.has(x + ',' + y) && !m.things.some(o => o.x === x && o.y === y && o.def.type === 'warp'); };
  const dist = new Map([[hx + ',' + hy, 0]]), q = [[hx, hy]];
  while (q.length) {
    const [x, y] = q.shift(), d = dist.get(x + ',' + y); if (d >= R) continue;
    for (const v of Object.values(DV)) { const nx = x + v[0], ny = y + v[1], k = nx + ',' + ny; if (!dist.has(k) && walk(nx, ny)) { dist.set(k, d + 1); q.push([nx, ny]); } }
  }
  const cand = [...dist.entries()].filter(([k, d]) => d >= 2).map(([k]) => k.split(',').map(Number));
  if (cand.length < 3) return;
  const n = 3 + Math.floor(rnd() * 3), a0 = rnd() * 6.283, pts = [[hx, hy]];
  for (let i = 1; i < n; i++) {
    const ang = a0 + i * 6.283 / n;
    let best = null, bs = -1e9;
    for (const [x, y] of cand) {
      const dx = x - hx, dy = y - hy, r = Math.hypot(dx, dy), da = Math.abs(((Math.atan2(dy, dx) - ang) % 6.283 + 9.425) % 6.283 - 3.1416);
      const sc = -da * 3 + Math.min(r, R * 0.8) * 0.4 + rnd() * 0.3;
      if (sc > bs && !pts.some(p => p[0] === x && p[1] === y)) { bs = sc; best = [x, y]; }
    }
    if (best) pts.push(best);
  }
  if (pts.length < 3) return;
  th.route = pts; th.ri = 1; th.pause = 600 + rnd() * 1500;
  th.waits = pts.map(() => 1300 + Math.floor(rnd() * 2600));
};
Field.patrol = function (th, dt) {
  if (th.pause > 0) { th.pause -= dt; return; }
  const [tx, ty] = th.route[th.ri];
  if (th.x === tx && th.y === ty) { th.pause = th.waits[th.ri]; th.ri = (th.ri + 1) % th.route.length; th.path = null; return; }
  if (!th.path || !th.path.length) th.path = Field.pathTo(th.x, th.y, tx, ty, th);
  if (!th.path || !th.path.length) { th.pause = 900; th.ri = (th.ri + 1) % th.route.length; return; }
  const [nx, ny] = th.path[0], p = Field.p;
  if ((nx === p.x && ny === p.y) || (nx === p.tx && ny === p.ty) || Field.thingsAt(nx, ny).some(o => o !== th && Field.isSolid(o))) {
    th.blockT = (th.blockT || 0) + dt; if (th.blockT > 2500) { th.path = null; th.blockT = 0; th.pause = 600; }
    return;
  }
  th.blockT = 0; th.path.shift();
  const dir = nx > th.x ? 'right' : nx < th.x ? 'left' : ny > th.y ? 'down' : 'up';
  th.dir = dir; th.ox = th.x - nx; th.oy = th.y - ny; th.x = nx; th.y = ny; th.mt = 1;
};
Field.pathTo = function (x0, y0, x1, y1, self) {
  const m = Field.map, prev = new Map([[x0 + ',' + y0, null]]), q = [[x0, y0]];
  const ok = (x, y) => { const t = Field.tile(x, y); if (!t || G.D.tiles[t].solid) return false; return !m.things.some(o => o !== self && o.x === x && o.y === y && Field.visible(o) && (Field.isSolid(o) || o.def.type === 'warp')); };
  while (q.length) {
    const [x, y] = q.shift(); if (x === x1 && y === y1) break;
    if (prev.size > 400) break;
    for (const v of Object.values(DV)) { const nx = x + v[0], ny = y + v[1], k = nx + ',' + ny; if (!prev.has(k) && ok(nx, ny)) { prev.set(k, [x, y]); q.push([nx, ny]); } }
  }
  if (!prev.has(x1 + ',' + y1)) return null;
  const out = []; let c = [x1, y1];
  while (c && !(c[0] === x0 && c[1] === y0)) { out.unshift(c); c = prev.get(c[0] + ',' + c[1]); }
  return out;
};
