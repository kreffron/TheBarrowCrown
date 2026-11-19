/* Puzzles: the pieces the puzzle dungeons are built from. Each is a map thing with a `pz` field.
   Who leads decides what the party can do with them (Field.ability, key F):
     Runa  shoves blocks (walk into one, or F), and hauls heavy levers.
     Dask  spots hidden things near him (plates, traps, secret doors, writing), disarms traps, opens secret doors,
           and flicks a pebble along the way he faces onto a light plate up to 5 squares off.
     Maren carries the light in dark places, and lights lamps (in order, where there is an order).
     Finch strikes chimes (songs), rings bells, and sings beasts to sleep.
   Pieces (def fields):
     block  { gfx, room, slide }         pushed one square, or, on ice (or slide:1), until it hits something
     plate  { flag, light, step, latch, hidden, room }   pressed by a block; light: a pebble will do; step: a person will
     gap    { open, fill, openGfx, room } a pit or water square: walkable while `open` holds, or once a block fills it
     trap   { dmg, hidden }              hurts and throws you back unless Dask disarms it
     secret { }                          looks like wall until Dask spots it; then he opens it
     lamp   { flag, seq, order, radius, room }  lit by Maren; lamps in a seq must go in order or all go out
     chime  { note, song }               struck by Finch; map.def.songs[song] = { notes, flag, script }
     beast  { battle, sprite }           (type npc) blocks the way; Finch sings it to sleep, anyone else fights it
     lever  { flag, who, toggle, gfxOn } pulled by anyone (or only `who`); flips a flag
     reset  { room }                     puts a room back as it was
     mirror { tag, start, who }          bends a light beam ('/' or '\\'); a chime with turns: [tags] turns it, or `who` by hand
     crystal{ flag }                     lit (flag set) while a beam strikes it
     sentry { turns, range, back, every, lull }  (type npc) faces each way in `turns` in step with the party's steps;
                                         anyone it sees is marched back to `back`. Solid things block its view.
   A lamp (or an always-on `pz: 'sun'`) with `beam: dir` throws a beam while lit.
   Saved state: G.S.pzpos[key] block positions; flags pzf.<key> (gap filled), pzp.<key> (pebble on plate),
   sp.<key> (spotted), pzd.<key> (trap disarmed), pzs.<key> (beast asleep), pzl.<key> (lamp lit). */
const Puzzle = G.puzzle = { bumpT: 0, song: {} };
(function () {
  const DV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const pz = (th, k) => th.def.pz === k;
  const things = () => (Field.map ? Field.map.things : []);
  const at = (x, y, k) => things().find(t => t.x === x && t.y === y && t.def.pz === k && Field.visible(t));

  Puzzle.place = function () {                                     // on load: blocks where they were left
    const pos = G.S.pzpos || {};
    for (const th of things()) if (pz(th, 'block') && pos[th.key]) { th.x = pos[th.key][0]; th.y = pos[th.key][1]; }
    Puzzle.song = {}; Puzzle.steps = 0; Puzzle.update(true);
  };
  Puzzle.gapOpen = th => G.flag('pzf.' + th.key) || (th.def.open ? G.cond(th.def.open) : false);
  Puzzle.lit = th => !!G.flag('pzl.' + th.key);
  Puzzle.spotted = th => !th.def.hidden || !!G.flag('sp.' + th.key);
  Puzzle.asleep = th => !!G.flag('pzs.' + th.key);

  // Squares a block may move onto, and squares the party may stand on.
  Puzzle.free = function (x, y, self) {
    const t = Field.tile(x, y); if (!t) return false;
    const here = Field.thingsAt(x, y).filter(o => o !== self);
    if (here.some(o => o.def.type === 'warp' || (Field.isSolid(o) && !pz(o, 'gap')))) return false;
    const gap = here.find(o => pz(o, 'gap'));
    if (gap) return Puzzle.gapOpen(gap) ? 'floor' : (gap.def.fill ? 'fill' : false);
    if (G.D.tiles[t].solid) return false;
    const p = Field.p; if ((p.x === x && p.y === y)) return false;
    return 'floor';
  };

  // Plates: pressed while a block (or a pebble, or for step plates a person) is on them.
  Puzzle.update = function (quiet) { const a = Puzzle.plates(quiet), b = Puzzle.beams(quiet); return a || b; };
  Puzzle.plates = function (quiet) {
    let changed = false;
    for (const th of things()) {
      if (!pz(th, 'plate') || !th.def.flag) continue;
      const p = Field.p, d = th.def;
      const on = things().some(b => pz(b, 'block') && Field.visible(b) && b.x === th.x && b.y === th.y) ||
        G.flag('pzp.' + th.key) || (d.step && p.x === th.x && p.y === th.y) || (d.latch && G.flag(d.flag));
      if (!!G.flag(d.flag) !== !!on) {
        G.S.flags[d.flag] = on ? 1 : 0; changed = true;
        if (!quiet) { G.audio.sfx(on ? 'lever' : 'cancel'); if (on && d.pressText) UI.toast(d.pressText); }
      }
    }
    return changed;
  };

  /* ---------- light beams: lamps (or shafts of daylight) that throw a beam, mirrors that bend it, crystals it lights ---------- */
  const BEND = { '/': { right: 'up', up: 'right', left: 'down', down: 'left' }, '\\': { right: 'down', down: 'right', left: 'up', up: 'left' } };
  Puzzle.mirrorShape = th => ((th.def.start === '\\' ? 1 : 0) + (G.flag('pzm.' + th.key) ? 1 : 0)) % 2 ? '\\' : '/';
  Puzzle.beams = function (quiet) {
    const m = Field.map; Puzzle.segs = [];
    if (!m || !m.hasBeam) return false;
    const hit = new Set();
    for (const src of m.things) {
      const d = src.def; if (!d.beam || !Field.visible(src) || (d.pz === 'lamp' && !Puzzle.lit(src))) continue;
      let x = src.x, y = src.y, dir = d.beam; const seen = new Set();
      for (let n = 0; n < 200; n++) {
        const k = x + ',' + y + dir; if (seen.has(k)) break; seen.add(k);
        const nx = x + DV[dir][0], ny = y + DV[dir][1], t = Field.tile(nx, ny); if (!t) break;
        Puzzle.segs.push([x, y, nx, ny]); x = nx; y = ny;
        const here = Field.thingsAt(x, y);
        const mir = here.find(o => pz(o, 'mirror')); if (mir) { dir = BEND[Puzzle.mirrorShape(mir)][dir]; continue; }
        const cr = here.find(o => pz(o, 'crystal')); if (cr) { hit.add(cr); break; }
        if (here.some(o => Field.isSolid(o) && !pz(o, 'gap'))) break;
        if (G.D.tiles[t].solid && !/water|pit|chasm|void/.test(t) && !here.some(o => pz(o, 'gap'))) { Puzzle.segs[Puzzle.segs.length - 1].stop = 1; break; }
      }
    }
    let changed = false;
    for (const cr of m.things) {
      if (!pz(cr, 'crystal')) continue;
      const on = hit.has(cr) ? 1 : 0;
      if (cr.def.flag && (G.flag(cr.def.flag) ? 1 : 0) !== on && !(cr.def.latch && G.flag(cr.def.flag))) {
        G.S.flags[cr.def.flag] = on; changed = true;
        if (!quiet) { G.audio.sfx(on ? 'magic' : 'cancel'); if (on && cr.def.litText) UI.toast(cr.def.litText); }
      }
    }
    return changed;
  };
  Puzzle.turn = function (tags) {
    for (const t of things()) if (pz(t, 'mirror') && tags.indexOf(t.def.tag) >= 0) { G.setFlag('pzm.' + t.key, G.flag('pzm.' + t.key) ? 0 : 1); t.mt = 0.6; t.ox = 0; t.oy = -0.15; }
    G.audio.sfx('lever'); Puzzle.update();
  };
  Puzzle.drawBeams = function (c, cx, cy) {
    if (!Field.map.hasBeam) return;
    Puzzle.beams(false);
    const w = 0.6 + Math.sin(G.time / 90) * 0.15;
    c.save(); c.lineCap = 'round';
    for (const [lw, col] of [[5, 'rgba(255,220,120,' + (0.25 * w) + ')'], [2, 'rgba(255,245,200,' + (0.9 * w) + ')']]) {
      c.strokeStyle = col; c.lineWidth = lw; c.beginPath();
      for (const sg of Puzzle.segs) { c.moveTo(sg[0] * 16 - cx + 8, sg[1] * 16 - cy + 7); const e = sg.stop ? 0.45 : 1; c.lineTo((sg[0] + (sg[2] - sg[0]) * e) * 16 - cx + 8, (sg[1] + (sg[3] - sg[1]) * e) * 16 - cy + 7); }
      c.stroke();
    }
    c.restore();
  };

  /* ---------- sentries: turn in step with the party, and send back anyone they see ---------- */
  Puzzle.facing = (th, ahead) => { const t = th.def.turns || ['down']; const n = Math.floor(((Puzzle.steps || 0) + (ahead || 0)) / (th.def.every || 1)) + (th.def.offset || 0); return t[n % t.length]; };
  Puzzle.sight = function (th, ahead) {
    const out = []; if (Puzzle.asleep(th) || !Field.visible(th)) return out;
    const dir = Puzzle.facing(th, ahead), v = DV[dir]; let x = th.x, y = th.y;
    for (let i = 0; i < (th.def.range || 4); i++) {
      x += v[0]; y += v[1]; const t = Field.tile(x, y); if (!t || G.D.tiles[t].solid) break;
      if (Field.thingsAt(x, y).some(o => o !== th && Field.isSolid(o))) break;
      out.push([x, y]);
    }
    return out;
  };
  Puzzle.seen = () => Field.map.things.some(th => th.def.pz === 'sentry' && Puzzle.sight(th).some(q => q[0] === Field.p.x && q[1] === Field.p.y));
  Puzzle.watch = async function () {
    const m = Field.map, p = Field.p; if (!m.hasSentry) return false;
    for (const th of m.things) {
      if (!pz(th, 'sentry')) continue;
      th.dir = Puzzle.facing(th);
      if (Puzzle.sight(th).some(q => q[0] === p.x && q[1] === p.y)) {
        G.audio.sfx('bad'); Field.emotes.push({ who: th.ch, ch: '!', t: G.time });
        await UI.say(th.def.name || 'Guard', G.pick(th.def.shouts || ['You! Stop there!', 'Who goes there? Out! Back the way you came!', 'Hoy! No one in the archive after the bell!']));
        await UI.say(null, th.def.caughtText || 'You are marched back to the door and shoved through it.');
        const b = th.def.back; p.x = p.tx = b[0]; p.y = p.ty = b[1]; p.moving = false; G.S.x = p.x; G.S.y = p.y;
        Puzzle.steps = 0; for (const s2 of m.things) if (pz(s2, 'sentry')) s2.dir = Puzzle.facing(s2);
        return true;
      }
    }
    return false;
  };
  Puzzle.drawSight = function (c, cx, cy) {
    if (!Field.map.hasSentry) return;
    const dask = Field.leader() === 'dask';
    for (const th of Field.map.things) {
      if (!pz(th, 'sentry')) continue;
      c.fillStyle = 'rgba(255,70,50,.22)';
      for (const q of Puzzle.sight(th)) c.fillRect(q[0] * 16 - cx, q[1] * 16 - cy, 16, 16);
      if (dask) {                                               // Dask reads where they will look next
        c.strokeStyle = 'rgba(255,200,80,.55)'; c.lineWidth = 1;
        for (const q of Puzzle.sight(th, 1)) c.strokeRect(q[0] * 16 - cx + 2.5, q[1] * 16 - cy + 2.5, 11, 11);
      }
    }
  };

  /* ---------- Runa: shove ---------- */
  Puzzle.push = async function (th, dir) {
    if (Field.leader() !== 'runa') {
      if (G.time - Puzzle.bumpT > 1500) { Puzzle.bumpT = G.time; UI.toast('Too heavy to shift. Runa could shove it (C to switch).'); }
      return false;
    }
    const v = DV[dir]; let x = th.x, y = th.y, moved = 0, fell = null;
    const slide = th.def.slide;
    for (;;) {
      const nx = x + v[0], ny = y + v[1], f = Puzzle.free(nx, ny, th);
      if (!f) break;
      x = nx; y = ny; moved++;
      if (f === 'fill') { fell = Field.thingsAt(nx, ny).find(o => pz(o, 'gap')); break; }
      if (!(slide || Field.tile(x, y) === 'ice')) break;
      if (Field.thingsAt(x, y).some(o => pz(o, 'plate'))) break;      // a plate catches a sliding block
    }
    if (!moved) { G.audio.sfx('error'); Field.shakeT = 120; return false; }
    G.audio.sfx('hit'); Field.shakeT = 90;
    th.ox = (th.x - x); th.oy = (th.y - y); th.mt = 1; th.x = x; th.y = y;
    G.S.pzpos = G.S.pzpos || {};
    if (fell) {
      G.setFlag('pzf.' + fell.key); G.setFlag('x.' + th.key); delete G.S.pzpos[th.key];
      UI.toast(fell.def.fillText || 'It drops in with a crash. You can walk over it now.');
    } else G.S.pzpos[th.key] = [x, y];
    Puzzle.update();
    return moved;
  };
  // Walking into something while leading: Runa shoves blocks; anyone else gets a hint.
  Puzzle.bump = function (x, y, dir) {
    if (G.busy || G.time - (Puzzle.lastBump || 0) < 220) return;
    Puzzle.lastBump = G.time;
    const b = at(x, y, 'block'); if (!b) return;
    Field.exec(async () => {
      const p = Field.p, fx = b.x, fy = b.y;
      if ((await Puzzle.push(b, dir)) === 1 && !Field.blocked(fx, fy)) { p.tx = fx; p.ty = fy; p.moving = true; p.t = 0; }
    });
  };

  /* ---------- first-time tips: the first time each kind of piece is close, say what to do with it ---------- */
  const TIPS = {
    block: 'Heavy blocks: put Runa in front (C to switch) and walk into one to shove it. A red lever puts a room back the way it was.',
    trap: 'Traps: while Dask leads he spots hidden things near him. Face a trap he has spotted and press F to disarm it.',
    plate: 'A pressure plate. Something heavy will hold it down. Dask can flick a pebble onto a small one from a distance (F, facing it).',
    lamp: 'An old Warden lamp. Put Maren in front and press F beside it to light it. In the dark, her light reaches furthest.',
    chime: 'A bell-stone. Put Finch in front and press F beside it to strike it. Somewhere there will be a tune to play.',
    beast: 'A beast blocks the way. Fight it, or put Finch in front and press F to sing it to sleep.',
    mirror: 'A mirror on a pivot. Light bends off it. Find what turns it.',
    sentry: 'A sentry. The red squares are what it can see, and it turns each time you take a step. With Dask in front you can see where it will look next.',
    lever: 'A lever, or a bell. Some only answer to one of you.'
  };
  Puzzle.tips = function () {
    const p = Field.p;
    for (const th of things()) {
      const k = th.def.pz; if (!TIPS[k] || G.flag('tip.' + k) || !Field.visible(th) || !Puzzle.spotted(th)) continue;
      if (Math.abs(th.x - p.x) + Math.abs(th.y - p.y) > 3) continue;
      G.setFlag('tip.' + k); Field.exec(() => UI.say(null, '(Tip) ' + TIPS[k])); return;
    }
  };

  /* ---------- Dask: spotting ---------- */
  Puzzle.spot = function () {
    if (Field.leader() !== 'dask') return;
    const p = Field.p; let found = 0;
    for (const th of things()) {
      if (!th.def.hidden || G.flag('sp.' + th.key) || !Field.visible(th)) continue;
      if (Math.abs(th.x - p.x) + Math.abs(th.y - p.y) > (th.def.spotR || 3)) continue;
      G.setFlag('sp.' + th.key); found++;
    }
    if (found) { G.audio.sfx('good'); Field.emotes.push({ who: 'player', ch: '!', t: G.time }); }
  };
  Puzzle.pebble = async function () {
    const p = Field.p, v = DV[p.dir];
    for (let i = 1; i <= 5; i++) {
      const x = p.x + v[0] * i, y = p.y + v[1] * i, t = Field.tile(x, y); if (!t) break;
      const plate = at(x, y, 'plate');
      if (plate && Puzzle.spotted(plate)) {
        if (!plate.def.light) { await UI.say('Dask', 'That plate wants real weight on it. A pebble will not do.'); return true; }
        if (G.flag('pzp.' + plate.key)) { await UI.say('Dask', 'There is a pebble on it already.'); return true; }
        G.setFlag('pzp.' + plate.key); G.audio.sfx('select');
        await UI.say(null, 'Dask flicks a pebble. It skips once and lands square on the plate. Click.');
        Puzzle.update(); return true;
      }
      const solid = Field.thingsAt(x, y).some(o => Field.isSolid(o) && !pz(o, 'gap'));
      const ts = G.D.tiles[t];
      if (solid || (ts.solid && !/water|pit|chasm|shallows|void/.test(t) && !at(x, y, 'gap'))) break;
    }
    return false;
  };

  /* ---------- traps ---------- */
  Puzzle.arrive = async function (from) {
    const p = Field.p, trap = at(p.x, p.y, 'trap');
    Puzzle.spot();
    if (trap && !G.flag('pzd.' + trap.key)) {
      G.setFlag('sp.' + trap.key);
      G.audio.sfx('hit'); Field.shakeT = 260;
      G.S.party.forEach(m => { if (m.hp > 0) m.hp = Math.max(1, m.hp - G.roll(trap.def.dmg || '1d4')); });
      if (from) { p.x = p.tx = from[0]; p.y = p.ty = from[1]; G.S.x = p.x; G.S.y = p.y; }
      await UI.say(null, trap.def.text || 'Click. Blades snap up out of the floor. Everyone is cut, and you stagger back.');
      return true;
    }
    Puzzle.update();
    return false;
  };

  /* ---------- F: the leader's move ---------- */
  const NAME = { runa: 'Runa', dask: 'Dask', maren: 'Maren', finch: 'Finch' };
  const NEED = { block: 'runa', secret: 'dask', trap: 'dask', lamp: 'maren', chime: 'finch', beast: 'finch', sun: 'none' };
  Puzzle.ability = async function (who, th) {
    const p = Field.p;
    if (th && th.def.pz && ['plate', 'gap'].indexOf(th.def.pz) < 0 && !(th.def.pz === 'trap' && (!Puzzle.spotted(th) || G.flag('pzd.' + th.key))) && !(th.def.pz === 'secret' && !Puzzle.spotted(th))) {
      const d = th.def, k = d.pz;
      if (k === 'lever') return Puzzle.lever(th, who) || true;
      if (k === 'mirror') { if (!d.who) { await UI.say(null, 'A mirror of polished bronze, set on a pivot. Something else must turn it.'); return true; }
        if (d.who !== who) { await UI.say(Field.nameOf(who), 'That is a job for ' + NAME[d.who] + '.'); return true; }
        Puzzle.turn([d.tag]); return true; }
      if (k === 'crystal') return false;
      if (k === 'sentry') { if (!d.lull) { await UI.say(Field.nameOf(who), 'Better not.'); return true; } if (who !== 'finch') { await UI.say(Field.nameOf(who), 'That is a job for Finch.'); return true; } await Puzzle.lull(th); return true; }
      if (k === 'reset') { await Puzzle.reset(th); return true; }
      const need = d.who || NEED[k];
      if (need && need !== who) { await UI.say(Field.nameOf(who), 'That is a job for ' + NAME[need] + '.'); return true; }
      if (k === 'block') { await Puzzle.push(th, p.dir); return true; }
      if (k === 'trap') { G.setFlag('pzd.' + th.key); G.audio.sfx('door'); await UI.say('Dask', G.pick(['A wedge in the spring. Safe now.', 'Snip. That one will not bite anybody.', 'Pressure trap. Was. Is not any more.'])); return true; }
      if (k === 'secret') { G.audio.sfx('door'); Field.shakeT = 200; G.setFlag('x.' + th.key); await UI.say(null, d.text || 'Dask presses the loose stone. The wall grinds aside.'); return true; }
      if (k === 'lamp') { await Puzzle.light(th); Puzzle.update(); return true; }
      if (k === 'chime') { await Puzzle.strike(th); return true; }
      if (k === 'beast') { await Puzzle.lull(th); return true; }
      return false;
    }
    if (who === 'dask') return Puzzle.pebble();
    return false;
  };
  // A (talk/look) on a puzzle piece: what it is, and who could deal with it.
  const LOOK = {
    block: 'Heavy. It would take Runa to shift it.', lamp: 'An old Warden lamp, cold. Maren could light it.',
    chime: 'A bell-stone, tuned. Finch could make it sing.', lever: 'A lever.', reset: 'A great iron lever, marked with a circle: it puts this room back the way it was.',
    secret: 'There is a draught through the stones here.', trap: 'A pressure trap. Dask could disarm it.',
    crystal: 'A crystal the size of a fist, set in a bronze claw. It is waiting for light.', mirror: 'A bronze mirror on a pivot.', sentry: 'A guard, keeping watch. Best not to be where they are looking.', sun: 'A shaft of daylight falls through a crack far above.'
  };
  Puzzle.look = async function (th) {
    const d = th.def;
    if (d.pz === 'lamp' && Puzzle.lit(th)) { await UI.say(null, 'The lamp burns steadily.'); return; }
    if (d.pz === 'reset') { await UI.say(null, LOOK.reset); const c = await UI.choice(null, 'Pull it?', ['Pull it', 'Leave it']); if (c === 0) await Puzzle.reset(th); return; }
    if (d.pz === 'lever' && !d.who) { Puzzle.lever(th, Field.leader()); return; }
    await UI.say(null, d.text || LOOK[d.pz] || '...');
  };
  Puzzle.lever = function (th, who) {
    const d = th.def;
    if (d.who && d.who !== who) { UI.toast(d.whoText || ('That is a job for ' + NAME[d.who] + ' (C to switch).')); G.audio.sfx('error'); return true; }
    if (!d.toggle && G.flag(d.flag)) { UI.toast('It will not go back.'); return true; }
    G.setFlag(d.flag, G.flag(d.flag) ? 0 : 1); G.audio.sfx(d.sfx || 'lever'); Field.shakeT = 120;
    if (d.flipText) UI.toast(G.flag(d.flag) ? d.flipText[0] : d.flipText[1] || d.flipText[0]);
    if (d.script) Field.exec(() => G.run(d.script, { thing: th }));
    Puzzle.update();
    return true;
  };
  Puzzle.light = async function (th) {
    const d = th.def;
    if (Puzzle.lit(th)) { await UI.say('Maren', 'It is burning. Leave it be.'); return; }
    if (d.seq) {
      const group = things().filter(t => pz(t, 'lamp') && t.def.seq === d.seq), done = group.filter(Puzzle.lit).length;
      if ((d.order || 0) !== done) {
        group.forEach(t => G.setFlag('pzl.' + t.key, 0)); if (d.seqFlag) G.setFlag(d.seqFlag, 0);
        G.audio.sfx('bad'); Field.shakeT = 160;
        await UI.say(null, d.wrongText || 'The flame catches, gutters, and every lamp in the hall goes out at once. Wrong order.');
        return;
      }
      G.setFlag('pzl.' + th.key); G.audio.sfx('magic');
      if (done + 1 === group.length) { if (d.seqFlag) G.setFlag(d.seqFlag); if (d.doneText) await UI.say(null, d.doneText); }
      else UI.toast('The lamp burns. (' + (done + 1) + ' of ' + group.length + ')');
    } else { G.setFlag('pzl.' + th.key); G.audio.sfx('magic'); if (d.flag) G.setFlag(d.flag); }
    if (d.litText) await UI.say(null, d.litText);
    if (d.script) await G.run(d.script, { thing: th });
  };
  Puzzle.strike = async function (th) {
    const d = th.def, songs = Field.map.def.songs || {}, s = songs[d.song];
    G.audio.note(d.note);
    Field.emotes.push({ who: 'player', ch: '♪', t: G.time });
    if (d.turns) { Puzzle.turn(d.turns); if (d.turnText) UI.toast(d.turnText); }
    if (!s || G.flag(s.flag)) return;
    const buf = (Puzzle.song[d.song] = (Puzzle.song[d.song] || []).concat([d.note])), i = buf.length - 1;
    if (buf[i] !== s.notes[i]) {
      Puzzle.song[d.song] = buf[i] === s.notes[0] ? [buf[i]] : [];
      if (s.wrong) for (const w of s.wrong) if (G.cond(w.if || '')) { await G.run(w.script, { thing: th }); break; }
      return;
    }
    if (buf.length === s.notes.length) {
      Puzzle.song[d.song] = []; G.setFlag(s.flag);
      await G.sleep(300); G.audio.sfx('good');
      if (s.script) await G.run(s.script, { thing: th });
    }
  };
  Puzzle.lull = async function (th) {
    if (Puzzle.asleep(th)) { await UI.say('Finch', 'Shh. Let it dream.'); return; }
    G.audio.note(4); await G.sleep(160); G.audio.note(2); await G.sleep(160); G.audio.note(0);
    G.setFlag('pzs.' + th.key);
    await UI.say(null, th.def.lullText || 'Finch sings low and slow. The creature\'s eyes droop; it settles with a long sigh and sleeps, and there is room to creep past.');
  };
  // Talking to a beast: sleeping ones are let be; awake ones can be fought.
  Puzzle.beastUse = async function (th) {
    if (Puzzle.asleep(th)) { await UI.say(null, 'It is sound asleep. Better not wake it.'); return; }
    await UI.say(null, th.def.text || 'It blocks the way, and it is not going to move for asking.');
    const c = await UI.choice(null, 'Fight it?', ['Fight it', 'Leave it (Finch could sing it to sleep)']);
    if (c !== 0) return;
    if (await B.start(th.def.battle, {}) === 'win') G.setFlag('x.' + th.key);
  };
  Puzzle.reset = async function (th) {
    const room = th.def.room;
    G.audio.sfx('lever'); Field.shakeT = 220;
    G.S.pzpos = G.S.pzpos || {};
    for (const t of things()) {
      if (t.def.room !== room) continue;
      const d = t.def;
      if (pz(t, 'block')) { delete G.S.pzpos[t.key]; G.setFlag('x.' + t.key, 0); t.x = t.hx; t.y = t.hy; }
      if (pz(t, 'gap') && d.fill) G.setFlag('pzf.' + t.key, 0);
      if (pz(t, 'plate')) { G.setFlag('pzp.' + t.key, 0); if (!d.keep) G.setFlag(d.flag, 0); }
      if (pz(t, 'lamp') && !(d.seqFlag && G.flag(d.seqFlag))) G.setFlag('pzl.' + t.key, 0);
      if (pz(t, 'chime')) Puzzle.song[d.song] = [];
      if (pz(t, 'mirror')) G.setFlag('pzm.' + t.key, 0);
    }
    const p = Field.p;
    if (th.def.back) { p.x = p.tx = th.def.back[0]; p.y = p.ty = th.def.back[1]; p.moving = false; G.S.x = p.x; G.S.y = p.y; }
    Puzzle.update(true);
    await UI.say(null, th.def.text || 'Somewhere below, chains rattle. The room settles back the way it was when you came in.');
  };

  /* ---------- drawing ---------- */
  Puzzle.gfx = function (th) {
    const d = th.def;
    switch (d.pz) {
      case 'block': return d.gfx || 'boulder';
      case 'plate': return Puzzle.spotted(th) ? (G.flag(d.flag) ? 'plateDown' : 'plateUp') : null;
      case 'gap': return Puzzle.gapOpen(th) ? (G.flag('pzf.' + th.key) ? (d.filledGfx || 'filledPit') : (d.openGfx || null)) : null;
      case 'trap': return Puzzle.spotted(th) ? (G.flag('pzd.' + th.key) ? 'trapOff' : 'trap') : null;
      case 'secret': return Puzzle.spotted(th) ? 'secretDoor' : (d.wallGfx || 'wallFace');
      case 'lamp': return Puzzle.lit(th) ? (d.litGfx || 'wardLamp') : (d.gfx || 'lampDead');
      case 'chime': return d.gfx || 'chime';
      case 'lever': return G.flag(d.flag) ? (d.gfxOn || 'leverOn') : (d.gfx || 'lever');
      case 'reset': return d.gfx || 'resetLever';
      case 'mirror': return Puzzle.mirrorShape(th) === '/' ? 'mirrorA' : 'mirrorB';
      case 'crystal': return G.flag(d.flag) ? 'crystalLit' : 'crystal';
      case 'sun': return d.gfx || 'sunshaft';
      default: return d.gfx;
    }
  };
  Puzzle.pops = th => ['block', 'lamp', 'chime', 'lever', 'reset', 'mirror', 'crystal'].indexOf(th.def.pz) >= 0 || (th.def.pz === 'secret' && Puzzle.spotted(th)) || (th.def.pz === 'sign' && Puzzle.spotted(th));
  // Darkness for maps with pzDark: the leader's lamp (Maren's reaches much further) and every lit lamp cut holes in it.
  Puzzle.dark = function (c, cx, cy, ppx, ppy) {
    const m = Field.map, dk = m.def.pzDark; if (!dk) return false;
    const cv = Puzzle.cv || (Puzzle.cv = document.createElement('canvas'));
    if (cv.width !== G.W || cv.height !== G.H) { cv.width = G.W; cv.height = G.H; }
    const d = cv.getContext('2d');
    d.globalCompositeOperation = 'source-over'; d.clearRect(0, 0, G.W, G.H);
    d.fillStyle = 'rgba(6,4,12,' + (dk.alpha || 0.97) + ')'; d.fillRect(0, 0, G.W, G.H);
    d.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, flick) => {
      const R = r * 16 * (1 + (flick ? Math.sin(G.time / 140 + x) * 0.03 : 0));
      const g = d.createRadialGradient(x, y, R * 0.45, x, y, R);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      d.fillStyle = g; d.beginPath(); d.arc(x, y, R, 0, 6.283); d.fill();
    };
    const lead = Field.leader(), glow = [];
    hole(ppx - cx + 8, ppy - cy + 6, lead === 'maren' ? (dk.maren || 4.6) : (dk.r || 1.9), true);
    for (const th of m.things) {
      if (!Field.visible(th)) continue;
      if (pz(th, 'lamp') && Puzzle.lit(th)) { hole(th.x * 16 - cx + 8, th.y * 16 - cy + 6, th.def.radius || 3.5, true); glow.push({ x: th.x * 16 - cx + 8, y: th.y * 16 - cy + 6, r: (th.def.radius || 3.5) * 14, col: '255,200,120', ph: th.x }); }
      else if (th.def.glow) hole(th.x * 16 - cx + 8, th.y * 16 - cy + 8, th.def.glow, true);
    }
    c.drawImage(cv, 0, 0);
    Field.drawGlow(c, glow, 1);                             // and the warm light of every lit lamp
    return true;
  };
  Puzzle.drawExtra = function (c, th, x, y) {               // zzz over sleeping beasts
    if (pz(th, 'beast') && Puzzle.asleep(th)) {
      c.fillStyle = '#c8d8ff'; c.font = 'bold 7px ui-monospace, monospace'; c.textAlign = 'center';
      const b = Math.sin(G.time / 300) * 2; c.fillText('z', x + 12, y - 6 + b); c.fillText('z', x + 15, y - 11 + b);
    }
  };
})();
