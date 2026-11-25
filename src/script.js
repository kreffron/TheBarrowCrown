/* Script interpreter. A script is a list of commands; a command is an array
   whose first item is its name. The full list is in the design bible. */
G.run = async function (cmds, ctx) { for (const c of (cmds || [])) await G.cmd(c, ctx || {}); };

// A DC is a number, or [base, [condition, change], ...] so that what the party
// has learned or done can make a check easier.
G.dc = function (spec) {
  if (typeof spec === 'number') return spec;
  let n = spec[0];
  for (let i = 1; i < spec.length; i++) if (G.cond(spec[i][0])) n += spec[i][1];
  return n;
};
G.check = async function (who, dc) {
  const st = G.stats(G.member(who));
  return UI.rollCheck(st.name, st.skill, st.skillBonus, G.dc(dc));
};

G.cmd = async function (c, ctx) {
  const S = G.S, I = G.D.items;
  switch (c[0]) {
    case 'say': await UI.say(c[1], c[2]); break;                       // ['say', 'Runa', 'Text']
    case 'note': await UI.say(null, c[1]); break;                      // narration
    case 'toast': UI.toast(c[1]); break;
    case 'set': G.setFlag(c[1], c[2] === undefined ? 1 : c[2]); break; // ['set', 'flag', value?]
    case 'add': G.setFlag(c[1], G.flag(c[1]) + (c[2] === undefined ? 1 : c[2])); break;
    case 'if': await G.run(G.cond(c[1]) ? c[2] : c[3], ctx); break;    // ['if', cond, then, else?]
    case 'choice': {                                                   // ['choice', who, text, [[label, cmds], ...]]
      const opts = c[3].filter(o => !o[2] || G.cond(o[2]));
      const i = await UI.choice(c[1], c[2], opts.map(o => o[0]));
      if (i != null && opts[i]) await G.run(opts[i][1], ctx);
      break;
    }
    case 'topics': {                                                   // ['topics', who, text, [[label, cmds, cond?], ...], leaveLabel?]
      const asked = {};                                                // a hub the player can ask around in until they leave
      for (;;) {
        const opts = c[3].filter(o => !o[2] || G.cond(o[2]));
        const labels = opts.map(o => o[0] + (asked[o[0]] ? ' ✓' : ''));
        labels.push(c[4] || 'That is all.');
        const i = await UI.choice(c[1], c[2], labels);
        if (i == null || i >= opts.length) break;
        asked[opts[i][0]] = 1;
        await G.run(opts[i][1], ctx);
      }
      break;
    }
    case 'bond': {                                                     // ['bond', member, n?]  companion approval
      G.bondAdd(c[1], c[2] === undefined ? 1 : c[2]);                  // a companion's trust in Runa, or a pair ('dask_maren')
      break;
    }
    case 'boon': {                                                     // ['boon', member, stat, n]  permanent bonus
      const all = S.boons = S.boons || {}, b = all[c[1]] = all[c[1]] || {};
      b[c[2]] = (b[c[2]] || 0) + c[3];
      G.audio.sfx('level');
      UI.toast(G.D.classes[c[1]].name + ': ' + (G.STATNAMES[c[2]] || c[2]) + ' +' + c[3]);
      break;
    }
    case 'recap': {                                                    // ['recap', title, chapter?]  the choices made (in that chapter)
      await UI.card(c[1], '', G.D.chronicle.filter(e => G.cond(e[0]) && (!c[2] || (e[2] || 1) === c[2])).map(e => e[1]));
      break;
    }
    case 'give': {                                                     // ['give', item, n?]
      const n = c[2] || 1; G.give(c[1], n); G.audio.sfx('item');
      UI.toast('Got ' + I[c[1]].name + (n > 1 ? ' ×' + n : '')); break;
    }
    case 'take': G.give(c[1], -(c[2] || 1)); break;
    case 'lose': {                                                     // ['lose', item]  from the bag, or unequipped from whoever wears it
      if (G.has(c[1])) G.give(c[1], -1);
      else S.party.forEach(m => { for (const k in m.gear) if (m.gear[k] === c[1]) m.gear[k] = null; });
      G.clampParty(); break;
    }
    case 'gold': S.gold = Math.max(0, S.gold + c[1]); if (c[1] > 0) { G.audio.sfx('coin'); UI.toast('+' + c[1] + ' gold'); } break;
    case 'xp': {
      const lines = G.gainXp(c[1]);
      if (G.xpGained) UI.toast('+' + G.xpGained + ' XP');
      for (const line of lines) { G.audio.sfx('level'); await UI.say(null, line); }
      break;
    }
    case 'quest': {                                                    // ['quest', id, stage]
      const q = G.D.quests[c[1]], prev = G.flag('q.' + c[1]);
      if (c[2] > prev) {
        G.setFlag('q.' + c[1], c[2]); G.audio.sfx('quest');
        const log = (S.qlog = S.qlog || {})[c[1]] = S.qlog[c[1]] || (prev ? [prev] : []); if (log.indexOf(c[2]) < 0) log.push(c[2]);   // the steps reached, for the journal
        UI.toast((c[2] >= q.done ? 'Quest complete: ' : prev ? 'Quest updated: ' : 'New quest: ') + q.name);
      }
      break;
    }
    case 'battle': {                                                   // ['battle', group, {guests?, guestsIf?: [[cond, id], ...], max?}]
      let o = c[2] || {};
      if (o.guestsIf) o = Object.assign({}, o, { guests: (o.guests || []).concat(o.guestsIf.filter(g => G.cond(g[0])).map(g => g[1])).slice(0, o.max || 2) });
      const r = await B.start(c[1], o); if (r !== 'win') throw new G.Abort(); break;
    }
    case 'check': await G.run((await G.check(c[1], c[2])) ? c[3] : c[4], ctx); break;   // ['check', who, dc, pass, fail?]
    case 'hurt': {                                                     // ['hurt', who|'all', dice]
      S.party.forEach(m => { if (c[1] === 'all' || c[1] === m.id) m.hp = Math.max(1, m.hp - G.roll(c[2])); });
      G.audio.sfx('hit'); Field.shakeT = 250; break;
    }
    case 'heal': G.healAll(); G.audio.sfx('heal'); break;
    case 'pray': {                                                     // ['pray', id]  Maren at one of D.prayers (m_places.js)
      const d = G.D.prayers[c[1]], f = 'pray.' + c[1];
      if (G.flag(f)) { await UI.say('Maren', 'We have prayed here. After a rest, we can again.'); break; }
      G.setFlag(f); G.audio.sfx('heal');
      await UI.say('Maren', d.line); await UI.say(null, d.after);
      const mul = G.prayerMul(), bits = [];
      for (const m of S.party) { const st = G.stats(m);
        if (d.heal) m.hp = Math.min(st.maxHp, m.hp + Math.ceil(st.maxHp * d.heal * mul / 100));
        if (d.sp) m.sp = Math.min(st.maxSp, m.sp + Math.ceil(st.maxSp * d.sp * mul / 100)); }
      if (d.heal) bits.push('each of you heals ' + Math.round(d.heal * mul) + '% of your health');
      if (d.sp) bits.push('recovers ' + Math.round(d.sp * mul) + '% of your skill points');
      if (d.bless) { G.setFlag('blessNext', 1); bits.push('the party starts its next fight Blessed'); }
      await UI.say(null, '(' + bits.join(', ').replace(/^./, ch => ch.toUpperCase()) + '.' + (mul > 1 ? ' Maren\'s trust in Runa makes it stronger.' : mul < 1 ? ' Maren\'s heart is not quite in it.' : '') + ')');
      break;
    }
    case 'busk': {                                                     // ['busk', id]  Finch at one of D.venues (m_places.js)
      const d = G.D.venues[c[1]], f = 'busk.' + c[1];
      if (G.flag(f)) { await UI.say('Finch', 'They have heard me once today. Twice is a concert, and concerts need posters.'); break; }
      G.setFlag(f); G.audio.sfx('good');
      const gold = Math.round(d.gold * (G.flag('chapter') || 1) * G.buskMul());
      await UI.say(null, 'Finch plays. ' + d.crowd);
      S.gold += gold; const bits = [gold + ' gold'];
      if (d.give) { G.give(d.give[0], d.give[1]); bits.push(G.D.items[d.give[0]].name); }
      if (d.inspire) { G.setFlag('inspireNext', 1); bits.push('everyone starts the next fight Inspired'); }
      await UI.say(null, '(' + bits.join(', ') + '.' + (G.buskMul() > 1 ? ' Finch plays his heart out for Runa.' : G.buskMul() < 1 ? ' Finch is not really trying.' : '') + ')');
      break;
    }
    case 'endtally': {                                                 // for the epilogue: camp nights with each hero, and approval in all
      const F = S.flags, who = { 1: 'dask', 2: 'maren', 3: 'finch' }, n = { dask: 0, maren: 0, finch: 0, alone: 0 };
      for (const k of ['camp2', 'camp3', 'camp4', 'camp5']) { const v = F[k]; if (v === 4) { if (k === 'camp5') { n.dask++; n.maren++; n.finch++; } else n.alone++; } else if (who[v]) n[who[v]]++; }
      for (const k in n) F['end.camp.' + k] = n[k];
      F['end.bonds'] = (F['bond.dask'] || 0) + (F['bond.maren'] || 0) + (F['bond.finch'] || 0);
      break;
    }
    case 'spotall':                                                    // every hidden puzzle piece on this map shows
      Field.map.things.forEach(t => { if (t.def.hidden) G.setFlag('sp.' + t.key); }); break;
    case 'feat': {                                                     // ['feat', who, id]: a feat, kept for good
      const S2 = G.S; S2.feats = S2.feats || {}; const list = S2.feats[c[1]] = S2.feats[c[1]] || [];
      if (list.indexOf(c[2]) < 0) list.push(c[2]);
      const f = G.D.perks[c[2]]; G.audio.sfx('level');
      await UI.card('New feat: ' + f.name, null, [Field.nameOf(c[1]) + ' has learned something new.', f.desc]); break;
    }
    case 'camp': {                                                     // ['camp'] at a campsite: costs a Camp Kit, once per inn rest
      const k = 'campUsed.' + ((ctx.thing && ctx.thing.key) || S.map);
      if (G.flag(k)) { await UI.say(null, 'The ashes of your last camp are still here. You will not get another good night out of this spot until you have slept at an inn.'); break; }
      if (!G.has('campkit')) { await UI.say(null, 'A good place to make camp, if you had a Camp Kit. Shops sell them; you can carry two.'); break; }
      const i = await UI.choice(null, 'Make camp here? It uses a Camp Kit (you have ' + G.has('campkit') + ') and restores everyone fully.', ['Make camp', 'Not now']);
      if (i !== 0) break;
      G.give('campkit', -1); G.setFlag(k, 1); Hunt.rested();
      await UI.fade(true, 400); G.healAll(); G.audio.sfx('rest'); await G.sleep(1200); G.save(); await UI.fade(false, 400);
      const lines = G.D.campTalk || [], pool = lines.filter(l => !l[0] || G.cond(l[0]));
      if (pool.length) { const l = G.pick(pool); await UI.say(l[1], l[2]); }
      UI.toast('Rested. HP and abilities restored.');
      break;
    }
    case 'inn': {                                                      // ['inn', cost]
      S.gold = Math.max(0, S.gold - (c[1] || 0));
      for (const f of Object.keys(S.flags)) if (f.startsWith('campUsed.') || f.startsWith('busk.')) delete S.flags[f];   // campsites can be used again
      Hunt.rested();
      await UI.fade(true, 400); G.healAll();
      S.respawn = { map: S.map, x: S.x, y: S.y }; S.respawnCh = Math.max(S.respawnCh || 1, G.flag('chapter') || 1);
      G.audio.sfx('rest'); await G.sleep(1400); G.save(); await UI.fade(false, 400);
      await G.innTalk();
      break;
    }
    case 'shop': await Menu.shop(c[1]); break;
    case 'warp': await Field.enter(c[1], c[2], { dir: c[3] }); break;  // ['warp', map, marker, dir?]
    case 'remove': G.setFlag('x.' + (c[1] || (ctx.thing && ctx.thing.key))); break;
    case 'sfx': G.audio.sfx(c[1]); break;
    case 'music': G.audio.music(c[1]); break;
    case 'wait': await G.sleep(c[1]); break;
    case 'fade': await UI.fade(c[1] === 'out', c[2]); break;
    case 'shake': Field.shakeT = c[1] || 300; break;
    case 'face': Field.p.dir = c[1]; break;
    case 'card': await UI.card(c[1], c[2], c[3]); break;
    case 'anim': await G.playAnim(c[1]); break;
    case 'epilogue': await G.playEpilogue(); break;                    // the painted epilogue: the valley, the hall of windows, the Crooked Lantern (src/epilogue.js)                         // ['anim', 'opening']  a drawn, side-on cutscene (src/opening.js)              // ['card', title, text, [lines]?]
    case 'cutscene': {                                                 // ['cutscene', [cmds]]  letterboxed, X twice skips
      G.cine = { prevFast: G.fast }; UI.letterbox(true);
      try { await G.run(c[1], ctx); }
      finally { G.fast = G.cine.prevFast; G.cine = null; UI.letterbox(false); Field.hideP = false; Field.cam = null; await Promise.all(G.moves.splice(0)); }
      break;
    }
    case 'scene': Field.hideP = !!c[4]; Field.cam = null; await Field.enter(c[1], c[2], { noSave: true, quiet: true, dir: c[3] }); break;   // ['scene', map, marker, dir, hidePlayer]
    case 'move': { const p = Field.moveActor(c[1], c[2]); if (c[3]) G.moves.push(p); else await p; break; }               // ['move', thingChar, 'uurd', together?]
    case 'sync': await Promise.all(G.moves.splice(0)); break;
    case 'place': { const th = Field.actor(c[1]); if (th) { th.x = c[2]; th.y = c[3]; th.mt = 0; if (c[4]) th.dir = c[4]; } break; }
    case 'placep': { const p = Field.p; p.x = p.tx = c[1]; p.y = p.ty = c[2]; p.moving = false; if (c[3]) p.dir = c[3]; S.x = p.x; S.y = p.y; break; }
    case 'walk': await Field.walkPlayer(c[1]); break;                  // ['walk', 'uul']  the player
    case 'turn': if (c[1] === 'player') Field.p.dir = c[2]; else { const th = Field.actor(c[1]); if (th) th.dir = c[2]; } break;
    case 'emote': Field.emotes.push({ who: c[1], ch: c[2], t: G.time }); G.audio.sfx('select'); await G.sleep(750); break;
    case 'cam': Field.cam = c[1] == null ? null : [c[1], c[2]]; break;   // ['cam', x, y] frames a tile; ['cam'] follows the player again
    case 'dark': { const d = Field.map.def; d.dark = c[1]; if (c[2]) d.light = c[2]; d.lightInner = c[3] || null; break; }
    case 'hint': UI.hint(c[1]); break;
    case 'run': await G.run(G.D.scripts[c[1]], ctx); break;
    case 'save': G.save(); break;
    case 'end': throw new G.Abort();
    default: console.warn('Unknown script command', c[0]);
  }
};

// An evening at the inn: the next scene the party has not had yet, newest chapter first (D.innTalk).
// An evening at the inn: the quieter talks (D.innTalk) and the companions' arguments and makings-up (D.bondTalk,
// with choices that move bonds) take turns. A bond gone sour is listed first in D.bondTalk, so it comes up soon.
G.innTalk = async function () {
  if (G.auto) return;
  const next = list => (list || []).find(e => !G.flag('inn.' + e.id) && (!e.if || G.cond(e.if)));
  const lore = next(G.D.innTalk), bond = next(G.D.bondTalk), wantBond = !!G.flag('inn.turn');
  const t = (wantBond ? bond || lore : lore || bond); if (!t) return;
  G.setFlag('inn.' + t.id); G.setFlag('inn.turn', t === bond ? 0 : 1);
  await UI.say(null, G.pick(['That night, in the common room...', 'Later, by the fire...', 'Before sleep, over the last of the ale...']));
  if (t.script) await G.run(t.script); else for (const [who, text] of t.lines) await UI.say(who || null, text);
};
