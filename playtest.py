#!/usr/bin/env python3
"""Automated checks in headless Chrome.
   play [route]  runs all of chapter 1 through the real scripts with the party on autopilot.
                 Routes pick different answers at every decision: fight, talk, talkfail, bribe, random.
                 With no route, all of them run.
   play2 [route] starts from a made-up Chapter 1 ending (lo: level 4 / 600 XP, mid: level 5 / 800, hi: level 6 / 1,327)
                 and runs Chapter 2 through the real scripts. Routes: main2, some2, dungeons2, full2, chase, trade, random2.
   play3 [route] starts from a made-up Chapter 2 ending (lo: level 8 / 2,940 XP, mid: level 11 / 4,350, hi: level 12 / 5,360)
                 and runs Chapter 3. Routes: main3, main3hi, some3, dungeons3, full3, talk3, pay3, swear3, random3.
   play4 [route] starts from a made-up Chapter 3 ending (lo: level 13 / 7,320 XP, mid: level 17 / 11,450, hi: level 18 / 13,255)
                 and runs Chapter 4. Routes: main4, main4hi, some4, dungeons4, full4, talk4, pay4, random4.
   play5 [route] starts from a made-up Chapter 4 ending (lo: level 18 / 14,610 XP, mid: level 23 / 22,290, hi: level 24 / 24,990)
                 and runs Chapter 5 to the end. Routes: main5, main5hi, some5, dungeons5, full5, talk5, veyra5, random5.
   sim [level]   fights every enemy group many times at a given level and reports the odds.
Usage: python3 tools/playtest.py play [route] | play2 [route] | sim [level]"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODE = sys.argv[1] if len(sys.argv) > 1 else 'play'

# Each route: the answers it prefers (first regex that matches an option wins), and whether skill checks pass.
ROUTES = {
    'fight': {'checks': True, 'prefs': ['^Settle', 'Never mind', '^Fight', 'Put him down', 'Take the job', 'no coming back', 'Carry it', 'The truth', 'Sell it', 'Say nothing', '^No one', 'Then pay it', 'made her choice', 'end badly']},
    'talk': {'checks': True, 'prefs': ['^Settle', 'Show her', 'Finch: talk', 'grey lady', 'Maren: sing', 'Come home', 'Leave it under', 'Hand it over', 'Keep it', '^Maren$', 'still be turned']},
    'talkfail': {'checks': False, 'prefs': ['^Settle', 'Show her', 'Finch: talk', 'grey lady', 'Maren: sing', 'What did the King', 'Leave it under', 'Hand it over', 'Keep it', 'kinder', '^Finch$', 'find the ending']},
    'bribe': {'checks': True, 'prefs': ['^Settle', 'Show her', 'Dask: buy', 'Dask: offer', 'Dask: ask for half', 'What did the King', 'Carry it', 'Keep it', 'Leave him be', '^Dask$', 'collect from four']},
    'random': {'checks': None, 'prefs': ['@random']},
    'main': {'checks': None, 'prefs': ['^Settle', '^Fight', 'Take the job'], 'mode': 'main'},
    'some': {'checks': None, 'prefs': ['^Settle', '^Fight', 'Take the job'], 'mode': 'some'},
    'cistern': {'checks': None, 'prefs': ['^Settle', '^Fight', 'Take the job'], 'mode': 'cistern'},
    'chapel': {'checks': None, 'prefs': ['^Settle', '^Fight', 'Take the job'], 'mode': 'chapel'},
    'dungeons': {'checks': None, 'prefs': ['^Settle', '^Fight', 'Take the job'], 'mode': 'dungeons'},
}
# Chapter 2 routes. start: which Chapter 1 ending to begin from. mode: how much side content to do.
ROUTES2 = {
    'main2':     {'start': 'lo',  'mode': 'main', 'checks': None, 'prefs': ['Settle it', 'Leave him be', '^Fight', 'Save the fishermen', '^Dask$']},
    'main2hi':   {'start': 'hi',  'mode': 'main', 'checks': None, 'prefs': ['Settle it', 'Finch: show', '^Fight', 'Save the fishermen', '^Dask$']},
    'some2':     {'start': 'lo',  'mode': 'some', 'checks': None, 'prefs': ['Settle it', 'Leave him be', '^Fight', 'Save the fishermen', '^Maren$']},
    'dungeons2': {'start': 'lo',  'mode': 'dungeons', 'checks': None, 'prefs': ['Settle it', 'Leave him be', '^Fight', 'Save the fishermen', '^Finch$']},
    'full2':     {'start': 'hi',  'mode': 'full', 'checks': True, 'prefs': ['Show him his own', 'Finch: show', '^Fight', 'Save the fishermen', '^No one']},
    'chase':     {'start': 'mid', 'mode': 'some', 'checks': True, 'prefs': ['Pay him', 'Maren: hear', 'Finch: bluff', 'Chase Veyra', 'Plead', '^Maren$']},
    'trade':     {'start': 'mid', 'mode': 'main', 'checks': False, 'prefs': ['Leave him to', 'Runa: run', 'Dask: pay', 'Offer Veyra', '^Finch$']},
    'fightv':    {'start': 'mid', 'mode': 'full', 'checks': False, 'prefs': ['Settle it', 'Leave him be', '^Fight', 'Chase Veyra', 'Fight her', '^Dask$']},
    'random2':   {'start': 'mid', 'mode': 'full', 'checks': None, 'prefs': ['@random']},
}
N3 = '^North into the hills'
ROUTES3 = {
    'main3':     {'start': 'lo',  'mode': 'main', 'checks': None, 'prefs': [N3, '^Stand the trial', '^Fight', 'Maren: plead', 'Fight beside', 'Finch: sing', '^Dask$']},
    'main3hi':   {'start': 'hi',  'mode': 'main', 'checks': None, 'prefs': [N3, '^Stand the trial', '^Fight', 'Maren: plead', 'Fight beside', 'Finch: sing', '^Maren$']},
    'some3':     {'start': 'lo',  'mode': 'some', 'checks': None, 'prefs': [N3, '^Stand the trial', '^Fight', 'Pay him', 'Maren: plead', 'Fight beside', 'Finch: sing', '^Finch$']},
    'dungeons3': {'start': 'lo',  'mode': 'dungeons', 'checks': None, 'prefs': [N3, '^Stand the trial', '^Fight', 'Maren: plead', 'Fight beside', 'Finch: sing', '^No one']},
    'full3':     {'start': 'hi',  'mode': 'full', 'checks': True, 'prefs': [N3, 'Finch: argue', 'Dask: question', 'Finch: bluff', 'Finch: talk her', 'Maren: hold', 'Fight beside', 'Finch: sing', '^No one']},
    'talk3':     {'start': 'mid', 'mode': 'some', 'checks': True, 'prefs': [N3, 'Finch: argue', 'Finch: question', 'Finch: bluff', 'Maren: hold', 'Maren: plead', 'Fight beside', 'Finch: sing', '^Maren$']},
    'pay3':      {'start': 'mid', 'mode': 'main', 'checks': False, 'prefs': [N3, '^Pay the stone', 'Dask: pay', 'Dask takes', 'Refuse', 'Fight her', 'Take his heart', '^Dask$']},
    'swear3':    {'start': 'mid', 'mode': 'some', 'checks': None, 'prefs': [N3, 'Runa: swear', 'Maren: set him free', 'Runa takes', '^Fight$', 'Fight beside', 'Maren: plead', 'Finch: sing', '^Finch$']},
    'random3':   {'start': 'mid', 'mode': 'full', 'checks': None, 'prefs': ['@random']},
}
H4 = 'to Highmoor$'
ROUTES4 = {
    'main4':     {'start': 'lo',  'mode': 'main', 'checks': None, 'prefs': [H4, 'accept, graciously', '^Keep them', '^Fight', 'Return to the city', '^Dask$']},
    'main4hi':   {'start': 'hi',  'mode': 'main', 'checks': None, 'prefs': [H4, 'accept, graciously', '^Keep them', 'Maren: tell the truth', '^Fight', '^Maren$']},
    'some4':     {'start': 'lo',  'mode': 'some', 'checks': None, 'prefs': [H4, 'walk out', '^Give them', '^Fight', 'Burn them', '^Finch$']},
    'dungeons4': {'start': 'lo',  'mode': 'dungeons', 'checks': None, 'prefs': [H4, 'accept, graciously', '^Keep them', '^Fight', 'Burn them', '^No one']},
    'full4':     {'start': 'hi',  'mode': 'full', 'checks': True, 'prefs': [H4, "read from Brannoc", '^Keep them', 'Maren: tell the truth', 'Pay him', 'Burn them', 'Finch: sing her', '^Dask$']},
    'talk4':     {'start': 'mid', 'mode': 'some', 'checks': True, 'prefs': [H4, "read from Brannoc", '^Keep them', 'Maren: tell the truth', 'Pay him', 'Take them', 'Finch: sing her', '^Maren$']},
    'pay4':      {'start': 'mid', 'mode': 'main', 'checks': False, 'prefs': [H4, 'refuse, and pay', '^Give them', 'Maren: tell her', '^Fight', '^Finch$']},
    'random4':   {'start': 'mid', 'mode': 'full', 'checks': None, 'prefs': ['@random']},
}
A5 = '^East, to Ashfall'
ROUTES5 = {
    'main5':     {'start': 'lo',  'mode': 'main', 'checks': None, 'prefs': [A5, '^Refuse him', '^Dask$', 'Maren: one last', 'Let Ennet']},
    'main5hi':   {'start': 'hi',  'mode': 'main', 'checks': None, 'prefs': [A5, 'Set her free', '^Refuse him', '^Maren$', 'Let Veyra']},
    'some5':     {'start': 'lo',  'mode': 'some', 'checks': None, 'prefs': [A5, '^Refuse him', 'Fight them both', '^Finch$', 'Let Ennet']},
    'dungeons5': {'start': 'lo',  'mode': 'dungeons', 'checks': None, 'prefs': [A5, '^Refuse him', 'Maren: one last', '^All three', 'Let Ennet']},
    'full5':     {'start': 'hi',  'mode': 'full', 'checks': True, 'prefs': [A5, 'Set her free', 'Burn them', 'Finch: play along', '^All three', 'Finch: sing the fifth']},
    'talk5':     {'start': 'mid', 'mode': 'some', 'checks': True, 'prefs': [A5, 'Burn them', 'Dask: lift', '^Dask$', 'Finch: sing the fifth', 'Let Ennet']},
    'veyra5':    {'start': 'mid', 'mode': 'main', 'checks': False, 'prefs': [A5, 'Keep them', 'Finch: play along', '^Maren$', 'Let Veyra']},
    'random5':   {'start': 'mid', 'mode': 'full', 'checks': None, 'prefs': ['@random']},
}
RAW = os.environ.get('RAW') == '1'          # RAW=1 lifts the level cap to measure where XP comes from

SETUP = r"""
G.fast = true; G.auto = true; G.opts.sfx = false; G.opts.music = false;
G.save = () => true;
window.T = { glv: {}, gmap: {}, qlv: {}, log: [], losses: 0, fights: 0, prefs: [], checks: null, picks: [], tm: { lines: 0, chars: 0, rounds: 0, maps: {}, entries: 0, choices: 0 } };
{ const _say = UI.say; UI.say = function (who, text, keep) { T.tm.lines++; T.tm.chars += String(text || '').length; return _say.apply(this, arguments); }; }
{ const _enter = Field.enter; Field.enter = async function (id) { const r = await _enter.apply(this, arguments); if (Field.map) { T.tm.entries++; T.tm.maps[id] = Field.map.w + Field.map.h; } return r; }; }
G.autoPick = o => {
  const labs = o.items.map(i => i.label), val = i => (o.items[i].value !== undefined ? o.items[i].value : i);
  if (!labs.length) return null;
  T.tm.choices++;
  if (labs.indexOf('Buy') >= 0) return 2;                         // leave shops
  if (labs.indexOf('Rest (10 gold)') >= 0) return 2;
  const oath = labs.indexOf('"An oath."'); if (oath >= 0) return val(oath);   // the barrow riddle
  const open = labs.map((l, i) => i).filter(i => !/ ✓$/.test(labs[i]));   // topics already asked are marked
  if (T.prefs[0] === '@random') { const i = open[Math.floor(Math.random() * open.length)]; T.picks.push(labs[i]); return val(labs.length > 3 && open.length > 1 && i === labs.length - 1 ? open[0] : i); }
  for (const p of T.prefs) { const i = open.find(i => new RegExp(p).test(labs[i])); if (i !== undefined) { T.picks.push(labs[i]); return val(i); } }
  return val(open[0]);
};
{ const _sf = G.setFlag; G.setFlag = function (n, v) { if (/^q\./.test(n) && !G.S.flags[n] && !(n.slice(2) in T.qlv)) T.qlv[n.slice(2)] = G.S.level; return _sf.apply(this, arguments); }; }
const _check = G.check;
G.check = async (who, dc) => { G.dc(dc); return T.checks === null ? _check(who, dc) : T.checks; };
T.levelFor = (xp, cap) => { let L = 1; while (L < cap && xp >= G.D.xpTable[L]) L++; return L; };
const _gain = G.gainXp;
G.gainXp = function (n) { const L = G.S.level, out = _gain(n); if (G.S.level > L) T.lv.push('L' + G.S.level + ' at ' + (T.where || G.S.map) + ' (' + G.S.xp + ' XP)'); if (G.S.level >= 30 && L < 30 && !G.flag('ch5mid')) T.early30 = 1; return out; };
window._start = B.start;
B.start = async function (g, o) {            // on a loss: count it, patch the party up, try again (max 6)
  if (typeof g === 'string') { T.glv[g] = Math.max(T.glv[g] || 0, G.S.level); (T.gmap[g] = T.gmap[g] || {})[G.S.map] = 1; }
  for (let i = 0; i < 6; i++) {
    T.fights++;
    const r = await _start(g, o); T.tm.rounds += B.rounds || 0;
    if (r !== 'lose') return r;
    T.losses++; T.log.push('LOST ' + g + ' at level ' + G.S.level); G.healAll();
  }
  return 'win';
};
T.equip = () => {
  const want = { runa: ['timberfall', 'studded', 'horseshoe', 'wolftooth'], dask: ['barrowfang', 'reinforced', 'luckycoin', 'gravebell'], maren: ['wardenmace', 'wardenmail', 'lampcharm', 'shardworn'], finch: ['finerapier', 'doublet', 'signet', 'vigil'] };
  for (const m of G.S.party) for (const id of want[m.id]) if (G.has(id)) { const it = G.D.items[id]; const old = m.gear[it.type]; m.gear[it.type] = id; G.give(id, -1); if (old) G.give(old, 1); }
};
T.go = async (map) => { await Field.enter(map, null, { noFade: true }); };
T.spr = async (sprite, tries) => { const th = Field.map.things.find(t => t.def.sprite === sprite && Field.visible(t)); if (!th) throw new Error('no ' + sprite + ' on ' + G.S.map); await T.use(th.ch, tries); };
T.tag = async (tag, tries) => { const th = Field.map.things.find(t => t.def.tag === tag); if (!th) throw new Error('no thing tagged ' + tag + ' on ' + G.S.map); await T.use(th.ch, tries); };
T.door = async (map, ch) => { try { await G.run(G.D.maps[map].things[ch].script || [], {}); } catch (e) { if (!(e instanceof G.Abort)) throw e; } };
T.use = async (ch, tries) => {
  for (let i = 0; i < (tries || 1); i++) {
    const ths = Field.map.things.filter(t => t.ch === ch && Field.visible(t));
    if (!ths.length) return;
    for (const th of ths) {
      try { if (th.def.type === 'trigger') await G.run(th.def.script, { thing: th }); else await Field.use(th); }
      catch (e) { if (!(e instanceof G.Abort)) throw e; }
    }
  }
};
T.wander = async (n) => { const enc = Field.map.def.encounters; for (let i = 0; i < n; i++) { try { await B.start(G.wpick(enc.groups), {}); } catch (e) { if (!(e instanceof G.Abort)) throw e; } } };
T.mark = (label) => { T.where = label; T.log.push(label + ': L' + G.S.level + ' xp ' + G.S.xp + ' gold ' + G.S.gold + ' pelts ' + G.has('pelt') + ' hp ' + G.S.party.map(m => m.hp + '/' + G.stats(m).maxHp).join(' ') + ' sp ' + G.S.party.map(m => m.sp).join(' ')); };
"""

PLAY = r"""
(async (prefs, checks, mode, raw) => {
  // mode 'full': every side quest, ~10 random fights, turn-ins before the barrow.  mode 'main': the story only.
  T.lv = []; T.log = []; T.losses = 0; T.fights = 0; T.picks = []; T.prefs = prefs; T.checks = checks; G.lastError = null;
  const full = mode === 'full', some = mode === 'some';   // some: the story plus the woodcutter and the Broodmother
  const doCistern = full || mode === 'cistern' || mode === 'dungeons', doChapel = full || mode === 'chapel' || mode === 'dungeons';
  T.cistern = async () => {                                         // the Old Cistern, under the town well
    await T.go('brackenford');
    for (let i = 0; i < 10 && G.S.map !== 'cistern'; i++) await T.use('w');   // random answers may say 'Not now'
    if (G.S.map !== 'cistern') throw new Error('the well did not lead to the cistern');
    await T.use('n'); await T.use('b'); await T.use('r'); await T.use('w', 12); await T.use('e');
    await T.use('c'); await T.use('d', 12); await T.use('k'); T.equip(); T.mark('cistern done');
  };
  T.chapel = async () => {                                          // the Doorward's Chapel, behind the brambles
    await T.go('thornwood'); await T.use('z', 12);
    await T.go('chapel'); await T.use('w'); await T.use('v');
    if (full) await T.use('l');                                     // wrong first: tests the reset
    for (const c of ['m', 'p', 'l', 'o']) for (let i = 0; i < 12 && !G.flag('chapel.lit.' + c) && !G.flag('chapel.open'); i++) {
      if (i && !G.flag('chapel.lit.m') && c !== 'm') break;   // a wrong guess reset the puzzle: start again
      await T.use(c);
    }
    for (let k = 0; k < 6 && !G.flag('chapel.open'); k++) for (const c of ['m', 'p', 'l', 'o']) for (let i = 0; i < 12 && !G.flag('chapel.lit.' + c); i++) await T.use(c);
    if (!G.flag('chapel.open')) throw new Error('the sconce puzzle did not open the door');
    await T.use('d', 12); await T.use('k'); await T.use('c'); T.equip(); T.mark('chapel done');
    await T.go('thornwood');
  };
  if (raw) G.D.levelCaps = { 1: 99 };
  G.newGame();
  await G.run(G.D.scripts.newgame);                                   // prologue cutscenes, then the tavern tutorial
  if (G.S.map !== 'tavern' || !G.flag('cs.vosk')) throw new Error('prologue did not reach the tutorial');
  await T.use('j'); await T.use('k'); await T.use('l'); await T.use('e');
  if (full) { await T.use('o', 4); await T.use('i'); await T.use('g'); }
  await T.use('f'); await T.use('b');
  await T.use('v', 12);                                               // talk to Brannoc until the brawl starts
  if (!G.flag('joined') || G.S.map !== 'brackenford') throw new Error('the brawl and closing scene did not hand over to Brackenford');
  T.mark('after brawl');
  await T.go('temple'); await T.use('w'); await T.use('h');
  await T.go('brackenford');
  for (const c of (full ? ['x', '3', '4', '5', '2', '6', 's', 'q', 'u', 'k', 'd'] : some ? ['s', 'q', 'u', '2', '4', '6'] : ['s', 'q', 'u', '2'])) await T.use(c);
  await T.go('shop'); await T.use('o');
  await T.go('smithy'); await T.use('i');
  T.equip();
  if (doCistern) await T.cistern();
  await T.go('thornwood'); await T.use('t');
  if (full) {
    await T.wander(4);
    await T.use('m'); await T.use('w'); await T.use('g'); await T.use('q');
    for (let i = 0; i < 8 && G.has('pelt') < 3; i++) await T.wander(1);
    await T.use('c', 12); await T.use('o', 12); await T.use('d'); T.equip();
    await T.use('h'); T.mark('wood: side quests done');
    await T.go('brackenford'); for (const c of ['4', '5', '6']) await T.use(c);
    await T.go('shop'); await T.use('o');
    await T.go('thornwood'); await T.use('h');
  }
  if (some) {
    await T.use('w'); await T.use('g'); await T.use('q'); T.mark('wood: two side quests');
    await T.go('brackenford'); for (const c of ['4', '6']) await T.use(c);
    await T.go('thornwood');
  }
  if (doChapel) await T.chapel();
  await T.use('k'); T.mark('wood: lookout');
  // the Toll Road: the barrow is sealed until Snagtooth at the mill is beaten
  await T.door('thornwood', 'e');
  await T.go('mill'); await T.use('d'); await T.use('a'); await T.use('b'); await T.use('h'); await T.use('z');
  if (!G.flag('act1done')) throw new Error('the mill did not give the seal-key');
  if (full) { await T.use('m'); for (const c of ['1', '2', '3', '4']) await T.use(c); await T.use('m'); await T.use('c'); await T.use('e'); }
  T.mark('mill done');
  await T.door('thornwood', 'e');                                   // the grey couriers, then the seal-key opens the barrow
  if (!G.flag('courierDone') || G.flag('q.act1') !== 3) throw new Error('the barrow door did not open after the mill');
  if (full) {
    await T.go('brackenford'); await T.tag('board1', 6);
    await T.go('thornwood'); await T.tag('alf'); await T.tag('wenna');
    await T.go('oldtower'); for (const c of ['a', 'd', 'b', 'c', 'e', 'f']) await T.use(c);
    await T.go('thornwood'); await T.tag('tam');
    await T.go('brackenford'); for (const n of ['1', '2', '3']) await T.tag('lantern' + n);
    await T.go('thornwood'); await T.tag('bristle'); await T.go('digsite');
    for (const c of ['a', 'b', 's', 'c', 'n']) await T.use(c);
    await T.go('brackenford'); await T.spr('hobb'); await T.tag('board1', 6);
    await T.go('thornwood'); await T.tag('oneear'); await T.tag('rattlejack');
    const want = { lanternsDone: 1, towerDone: 1, tamHome: 1, 'q.millgrain': 2, 'q.bristle': 2, 'q.dig': 3, 'q.bounty1': 3 };
    for (const k in want) if (G.flag(k) !== want[k]) throw new Error('side quest flag ' + k + ' is ' + G.flag(k));
    T.equip(); T.mark('new side quests done');
  }
  await T.go('barrow1'); await T.use('a');
  if (full) { await T.use('k', 12); await T.use('e'); await T.use('i'); }
  await T.use('g'); await T.wander(full ? 2 : 1);
  await T.use('b'); await T.use('v');
  if (full) {
    await T.use('p'); await T.use('l', 12);
    if (!Field.map.things.some(t => t.ch === 'l' && Field.visible(t))) { await T.use('c'); await T.use('d'); await T.use('s'); }
    await T.wander(2);
  }
  T.equip(); T.mark('b1: done');
  await T.go('ossuary');
  for (const c of ['a', 'f', '3', 'e', 'd', '1', 'c', 'b', '2']) await T.use(c);
  if (full) await T.use('h');
  await T.use('g'); await T.use('y'); if (G.has('campkit')) await T.tag('ossCamp');
  await T.use('k');
  if (!G.flag('ossGate') || !G.flag('keeperDone')) throw new Error('the ossuary was not cleared');
  T.equip(); T.mark('ossuary done');
  await T.go('barrow2'); await T.wander(1);
  if (full) { await T.use('a'); await T.use('c'); T.equip(); if (prefs.indexOf('Leave him be') < 0) await T.use('d'); }
  await T.use('b'); await T.use('h');
  if (full) await T.use('d');
  await T.use('r'); await T.use('q'); await T.use('t'); await T.use('8');
  T.mark('before the boss');
  await T.use('9'); T.mark('b2: boss resolved');
  await T.use('t');
  await T.go('tavern'); await T.use('1'); T.equip();
  await T.go('shop'); await T.use('o');
  await T.go('brackenford'); for (const c of (full ? ['4', '7', '4', '3', '3', '5', '6'] : ['7'])) await T.use(c);
  await T.go('temple'); await T.use('w');
  T.equip(); T.mark('end');
  await T.go('temple'); await T.use('w'); await T.go('tavern'); await T.use('1');
  const f = G.S.flags, pickf = ks => Object.fromEntries(ks.filter(k => f[k] !== undefined).map(k => [k, f[k]]));
  return { tm: T.tm, early30: !!T.early30, lv: T.lv, log: T.log, fights: T.fights, losses: T.losses, map: G.S.map, level: G.S.level, xp: G.S.xp,
    explored: pickf(['cistern', 'ledger', 'x.cistern.k', 'chapel.open', 'verse1', 'x.chapel.k']),
    quests: pickf(['q.main', 'q.wood', 'q.mush', 'q.grave', 'q.bounty', 'q.nest', 'ch1done', 'bridgeMended', 'cs.farewell']),
    choices: pickf(['tut.letter', 'ingridAlly', 'haldaLetter', 'ingridGift', 'deal', 'pay', 'rite', 'knowsVeyra', 'knowsGrey', 'knowsGarrick', 'snik', 'alder', 'pellTruth', 'pellLie', 'lampLit', 'riddle', 'grukk', 'silver', 'odoNo', 'veyra', 'abbeyHint', 'shardAt', 'camp', 'daskDebt', 'marenHope', 'finchSong', 'confide.dask', 'confide.maren', 'confide.finch', 'bond.dask', 'bond.maren', 'bond.finch']),
    boons: G.S.boons || {}, bag: G.S.bag, chronicle: G.D.chronicle.filter(e => G.cond(e[0])).map(e => e[1]),
    err: G.lastError ? String(G.lastError.stack) : null };
})
"""

PLAY2 = r"""
(async (prefs, checks, mode, start, raw) => {
  T.lv = []; T.log = []; T.losses = 0; T.fights = 0; T.picks = []; T.prefs = prefs; T.checks = checks; G.lastError = null;
  const full = mode === 'full', some = mode === 'some' || full, dung = mode === 'dungeons' || full;
  if (raw) G.D.levelCaps = { 1: 99, 2: 99 };
  // a made-up end of Chapter 1
  G.newGame();
  const st = { lo: { xp: 600, gold: 260, shardAt: 1 }, mid: { xp: 800, gold: 340, shardAt: 2, ledger: 1 }, hi: { xp: 1327, gold: 420, shardAt: 2, ledger: 1, abbeyHint: 1, veyra: 1, marenHope: 1, snik: 1 } }[start];
  G.S.xp = st.xp; G.S.level = T.levelFor(st.xp, 6); G.S.gold = st.gold;
  Object.assign(G.S.flags, { tut: 1, joined: 1, chapter: 1, ch1done: 1, bridgeMended: 1, 'q.main': 6, shardAt: st.shardAt, camp: 1 });
  for (const k of ['ledger', 'abbeyHint', 'veyra', 'marenHope', 'snik']) if (st[k]) G.S.flags[k] = st[k];
  const gear = { runa: { weapon: 'timberfall', armor: 'studded' }, dask: { weapon: 'barrowfang', armor: 'reinforced' }, maren: { weapon: 'wardenmace', armor: 'wardenmail', charm: 'lampcharm' }, finch: { weapon: 'finerapier', armor: 'doublet' } };
  for (const m of G.S.party) for (const k in gear[m.id]) if (G.D.items[gear[m.id][k]]) m.gear[k] = gear[m.id][k];
  if (st.shardAt === 2) G.S.party.find(m => m.id === 'maren').gear.charm = 'shardworn';
  if (st.ledger) G.give('ledger');
  G.S.bag.draught = 4; G.healAll();
  T.rest = () => { if (G.S.gold >= 25) { G.S.gold -= 25; G.healAll(); } };     // a night at the Gull and Lantern
  T.buy = () => {                                    // spend on Saltmere gear, armour first, as a player would
    for (const id of ['scalemail', 'chapelmail', 'sharkskin', 'brigantine', 'reaver', 'tidemace', 'kris', 'sabre']) {
      const it = G.D.items[id]; if (G.S.gold < it.price + 60) continue;
      const m = G.S.party.find(p => p.id === it.for[0]); G.S.gold -= it.price; m.gear[it.type] = id;
    }
  };
  T.equip2 = () => {
    const want = { runa: ['snapshell'], dask: ['drownedkris'], maren: ['bellmail', 'censer'], finch: ['keeperlens'], runa2: ['brineward'] };
    const who = { runa: 'runa', dask: 'dask', maren: 'maren', finch: 'finch', runa2: 'runa' };
    for (const k in want) for (const id of want[k]) if (G.has(id)) { const m = G.S.party.find(p => p.id === who[k]), it = G.D.items[id]; const old = m.gear[it.type]; m.gear[it.type] = id; G.give(id, -1); if (old && old !== 'shardworn') G.give(old, 1); else if (old) m.gear[it.type] = old, G.give(id, 1); }
  };
  await T.go('brackenford'); for (let i = 0; i < 10 && G.S.map !== 'saltmere'; i++) await T.use('k');
  if (G.S.map !== 'saltmere' || G.S.flags.chapter !== 2) throw new Error('the south bridge did not start chapter 2');
  T.mark('saltmere');
  T.buy();
  if (full) {                                                    // the harbour board, and the wreck of the Marigold
    await T.tag('board2', 10); T.rest();
    await T.go('wreck'); for (const c of ['a', 'b', 'c']) await T.use(c);
    await T.go('saltmere'); await T.tag('ama2'); T.mark('marigold');
    await T.go('s_inn'); await T.use('b'); await T.use('f'); T.rest();
    await T.go('saltpans'); for (const c of ['a', 'b', 'c', 'z']) await T.use(c);
    await T.go('saltmere'); T.rest(); T.mark('salt pans');
  }
  await T.use('u');                                             // Quill: main2 2
  await T.go('s_chapel'); for (let i = 0; i < 10 && !G.flag('tidechart'); i++) await T.use('w');   // Ysolde: tide chart (and the tags quest)
  if (!G.flag('tidechart')) throw new Error('no tide chart');
  await T.go('saltmere'); await T.use('r');                      // Brother Coll
  await T.go('s_inn'); await T.use('v');                         // Brannoc
  if (some) { await T.go('saltmere'); await T.use('z'); await T.use('k'); }   // Snik, Bastian
  if (dung || some) {                                            // the sea cave
    T.rest(); await T.go('seacave'); await T.use('r'); await T.use('d'); await T.use('c'); await T.use('b', 12); await T.use('k'); await T.use('o');
    if (!G.flag('pipSafe')) throw new Error('Pip was not rescued');
    await T.go('saltmere'); await T.use('k'); T.equip2(); T.mark('lighthouse lit');
  }
  T.rest(); await T.go('saltmere'); for (let i = 0; i < 10 && G.S.map !== 'mirefen'; i++) await T.use('e');   // the fen gate
  if (G.S.map !== 'mirefen') throw new Error('the fen gate did not open');
  await T.use('p');                                              // the patrol
  if (some && mode !== 'dungeons') { await T.use('b'); await T.use('k'); await T.use('b'); T.equip2(); T.mark('kettle'); }
  if (dung) {
    await T.use('o', 12); await T.go('belltower'); await T.use('w');
    if (full) await T.use('m');                                   // wrong bell first: tests the reset
    for (let k = 0; k < 4 && !G.flag('bt.open'); k++) for (const c of ['l', 'm', 'o', 'q']) await T.use(c);
    if (!G.flag('bt.open')) throw new Error('the bells did not open the hatch');
    await T.use('k'); await T.use('c'); T.equip2(); T.mark('bell tower');
    await T.go('mirefen'); await T.use('h');
  }
  if (full) {
    await T.use('g'); await T.use('h'); await T.use('e'); await T.use('d', 12); await T.use('c', 12);
    await T.wander(4); for (let i = 0; i < 6 && G.has('tag') < 4; i++) await T.wander(1);
    await T.go('s_chapel'); await T.use('w'); await T.go('mirefen'); await T.use('h'); T.mark('fen side content');
    await T.tag('ada');
    for (const n of ['1', '2', '3']) await T.tag('wisp' + n);
    T.rest(); await T.go('mirefen'); await T.tag('gorm'); await T.tag('eelking');
    T.rest(); await T.go('mirefen'); await T.tag('hollin');
    T.rest(); await T.go('smugglers'); for (const c of ['a', 'b', 's', 'c', 'd']) await T.use(c);
    await T.go('mirefen');
    await T.go('saltmere'); await T.spr('quill'); await T.go('mirefen');
    const want = { 'q.wisps': 2, 'q.eelking': 2, 'q.smugglers': 2, 'q.marigold': 2, 'q.saltpans': 2, 'q.hollin': 2, 'q.quillcellar': 2 };
    for (const k in want) if (G.flag(k) !== want[k]) throw new Error('side quest flag ' + k + ' is ' + G.flag(k));
    T.mark('new fen side quests');
  }
  await T.door('mirefen', 'a');                                  // the Sea-Gate: the causeway is flooded
  T.rest(); await T.go('tidemill'); for (const c of ['a', 'b', 'd', 'e', 'g', 'z']) await T.use(c);
  if (!G.flag('act2done')) throw new Error('the tide mill did not close the sea-gate');
  if (full) await T.use('c');
  T.equip2(); T.mark('tide mill'); T.rest();
  await T.go('mirefen'); await T.door('mirefen', 'a');
  await T.use('q');                                              // the causeway
  await T.go('abbey1'); await T.use('h');
  if (full || G.flag('abbeyHint')) await T.use('k', 12);
  if (!G.flag('abbeyRoute') || full) await T.use('n');
  if (full) { await T.use('r', 12); await T.use('c'); await T.use('d'); T.equip2(); }
  await T.wander(1);
  await T.use('m'); await T.use('m'); await T.use('l'); await T.use('o');
  if (!G.flag('ab1.gate')) throw new Error('the levers did not open the gate');
  T.mark('abbey upper floor'); await T.use('h');
  await T.go('scriptorium');
  for (const c of ['f', 'g', 'a', 'b', 'e', '1', '2', '3']) await T.use(c);
  if (full) { await T.use('c'); await T.use('d'); }
  await T.use('y'); if (G.has('campkit')) await T.tag('scCamp');
  await T.use('k');
  if (!G.flag('sc.open') || !G.flag('archivistDone')) throw new Error('the scriptorium was not cleared');
  T.equip2(); T.mark('scriptorium');
  await T.go('abbey2'); await T.use('t');
  if (!G.flag('ab.done')) throw new Error('the Abbey choice did not resolve');
  T.mark('after the choice'); await T.use('c'); await T.use('h');
  await T.use('k'); T.mark('prior');
  if (!G.flag('priorDead')) throw new Error('the Prior was not beaten');
  for (let i = 0; i < 10 && G.S.map !== 'saltmere'; i++) await T.use('l');
  if (G.S.map !== 'saltmere') throw new Error('the lamp did not lead home');
  if (full) { await T.go('s_chapel'); await T.use('w'); await T.go('saltmere'); if (G.flag('q.psalter') !== 3) throw new Error('psalter not returned'); }
  await T.use('u');                                              // Quill: the end of the chapter
  T.mark('end');
  const f = G.S.flags, pickf = ks => Object.fromEntries(ks.filter(k => f[k] !== undefined).map(k => [k, f[k]]));
  return { tm: T.tm, early30: !!T.early30, lv: T.lv, log: T.log, fights: T.fights, losses: T.losses, map: G.S.map, level: G.S.level, xp: G.S.xp,
    explored: pickf(['pipSafe', 'lightLit', 'bt.open', 'verse2', 'q.kettle', 'q.tags', 'q.light', 'ab1.gate', 'x.abbey1.n']),
    quests: pickf(['q.main2', 'ch2done', 'chapter', 'priorDead', 'lampLit2']),
    choices: pickf(['brannoc2', 'coll', 'abbeyRoute', 'ab.choice', 'veyra2', 'hostagesSaved', 'hostagesLost', 'shardTraded', 'veyraDoubt', 'knowsBrother', 'knowsRitual', 'camp2']),
    boons: G.S.boons || {}, gold: G.S.gold, chronicle: G.D.chronicle.filter(e => (e[2] || 1) === 2 && G.cond(e[0])).map(e => e[1]),
    err: G.lastError ? String(G.lastError.stack) : null };
})
"""

PLAY3 = r"""
(async (prefs, checks, mode, start, raw) => {
  T.lv = []; T.log = []; T.losses = 0; T.fights = 0; T.picks = []; T.prefs = prefs; T.checks = checks; G.lastError = null;
  const full = mode === 'full', some = mode === 'some' || full, dung = mode === 'dungeons' || full, talk = /Finch: argue/.test(prefs.join(' '));
  if (raw) G.D.levelCaps = { 1: 99, 2: 99, 3: 99 };
  G.newGame();
  const st = {
    lo: { xp: 2940, level: 8, gold: 620, f: { shardAt: 1, veyra2: 2, hostagesLost: 1, 'ab.choice': 2, coll: 2, grukk: 2, snik: 1, camp: 1, daskDebt: 1 } },
    mid: { xp: 4350, level: 11, gold: 800, f: { shardAt: 2, veyra2: 1, veyraDoubt: 1, hostagesSaved: 1, 'ab.choice': 2, coll: 3, grukk: 3, verse1: 1, camp: 2, marenHope: 1, ledger: 1 } },
    hi: { xp: 5360, level: 12, gold: 1100, f: { shardAt: 2, shardTraded: 1, veyra: 1, veyra2: 5, hostagesSaved: 1, 'ab.choice': 3, coll: 1, grukk: 1, verse1: 1, verse2: 1, knowsBrother: 1, rite: 1, camp: 3, finchSong: 1, snik: 1, ledger: 1 } }
  }[start];
  G.S.xp = st.xp; G.S.level = st.level; G.S.gold = st.gold;
  Object.assign(G.S.flags, { tut: 1, joined: 1, chapter: 2, ch1done: 1, bridgeMended: 1, 'q.main': 6, ch2done: 1, 'q.main2': 7, priorDead: 1, lampLit2: 1 }, st.f);
  const gear = { runa: { weapon: 'reaver', armor: 'scalemail' }, dask: { weapon: 'kris', armor: 'sharkskin' }, maren: { weapon: 'tidemace', armor: 'chapelmail', charm: 'lampcharm' }, finch: { weapon: 'sabre', armor: 'brigantine' } };
  for (const m of G.S.party) Object.assign(m.gear, gear[m.id]);
  if (st.f.shardAt === 2 && !st.f.shardTraded) G.S.party.find(m => m.id === 'maren').gear.charm = 'shardworn';
  if (st.f.ledger) G.give('ledger');
  G.S.bag.draught = 4; G.S.bag.greater = 3; G.healAll();
  T.rest = () => { if (G.S.gold >= 40) { G.S.gold -= 40; G.healAll(); } };
  T.buy = () => {
    for (const id of ['wolfplate', 'oathmail', 'snowcloak', 'furcoat', 'karrowaxe', 'runemace', 'icepick', 'skaldblade']) {
      const it = G.D.items[id]; if (G.S.gold < it.price + 150) continue;
      const m = G.S.party.find(p => p.id === it.for[0]); G.S.gold -= it.price; m.gear[it.type] = id;
    }
  };
  T.equip3 = () => {
    const want = [['runa', 'hallvardaxe'], ['dask', 'rimecloak'], ['finch', 'watchermail'], ['runa', 'oathstone'], ['finch', 'clanring'], ['dask', 'giantheart']];
    for (const [who, id] of want) if (G.has(id)) { const m = G.S.party.find(p => p.id === who), it = G.D.items[id]; if (it.type === 'charm' && m.gear.charm === 'shardworn') continue; const old = m.gear[it.type]; m.gear[it.type] = id; G.give(id, -1); if (old) G.give(old, 1); }
  };
  T.pick = async (ch, label) => { const old = T.prefs; T.prefs = ['^' + label + '$']; await T.use(ch); T.prefs = old; };
  for (let i = 0; i < 12 && G.S.map !== 'karrow'; i++) { await T.go('saltmere'); await T.use('n'); }
  if (G.S.map !== 'karrow' || G.S.flags.chapter !== 3) throw new Error('the north road did not start chapter 3');
  T.mark('karrow'); T.buy();
  await T.go('k_hall'); await T.use('c');
  if (G.flag('q.main3') !== 2) throw new Error('Sigrid did not give the quest');
  if (talk || full) { await T.go('karrow'); await T.use('y'); await T.use('w'); }
  if (some) { await T.go('k_cells'); for (let i = 0; i < 6 && !G.flag('prisoner'); i++) await T.use('p'); }
  if (dung) { await T.go('karrow'); await T.use('s'); }
  await T.go('k_hall'); for (let i = 0; i < 10 && !G.flag('runaOath'); i++) await T.use('c');
  if (!G.flag('runaOath')) throw new Error('the oath was never answered');
  T.mark('oath answered'); T.rest();
  await T.go('karrow'); for (let i = 0; i < 10 && G.S.map !== 'frostpass'; i++) await T.use('e');
  if (G.S.map !== 'frostpass') throw new Error('the north gate did not open');
  if (some || dung) {
    await T.use('b');
    await T.go('icecaves'); await T.use('w'); await T.use('d'); await T.use('b', 12); await T.use('e'); await T.use('c'); await T.use('q'); await T.use('k');
    if (!G.flag('arnSafe')) throw new Error('Arn was not rescued');
    await T.go('frostpass'); await T.use('b'); T.equip3(); T.mark('white bear'); T.rest();
  }
  if (full) { await T.use('g'); await T.use('e'); await T.use('c', 12); await T.use('d'); await T.wander(4); await T.use('h'); }
  await T.use('p'); T.mark('scouts'); await T.use('h');
  if (some) { await T.use('k'); await T.use('j'); for (let i = 0; i < 4 && !G.flag('tunnelOpen') && G.flag('grukk') === 2; i++) await T.use('k'); }
  if (dung) {
    await T.use('o', 12); await T.go('watchtower'); await T.use('w'); await T.use('l'); await T.use('k'); await T.use('c');
    if (!G.flag('verse3')) throw new Error('no third stanza');
    T.equip3(); T.mark('watchtower'); await T.go('frostpass'); await T.use('h');
    if (full) { await T.go('karrow'); await T.use('s'); await T.go('frostpass'); }
  }
  if (G.flag('tunnelOpen') && !full) await T.use('u'); else await T.use('q');
  T.mark('cairn door'); await T.use('h');
  // the Rime Door: the Cairn is frozen shut until the rime-altar at the Frozen Falls is broken
  await T.door('frostpass', 'a');
  T.rest(); await T.go('falls'); for (const c of ['a', 'b', 'g', 'e']) await T.use(c);
  T.rest(); await T.use('z');
  if (full) { await T.use('c'); await T.use('d'); }
  if (!G.flag('act3done')) throw new Error('the Frozen Falls did not break the rite');
  T.equip3(); T.mark('frozen falls');
  if (full) {                                                     // Karrow's notice post and its six jobs
    await T.go('karrow'); await T.tag('board3', 14); T.rest();
    await T.go('goblinden'); for (const c of ['a', 'b', 'd']) await T.use(c); T.rest(); await T.use('g'); await T.use('c');
    await T.go('frostpass'); await T.tag('dogkettle'); await T.tag('dogsnorri'); T.rest();
    await T.tag('ivar'); await T.tag('troll3'); T.rest();
    await T.tag('signe'); for (const n of ['1', '2', '3', '4']) await T.tag('rune3_' + n);
    T.rest(); await T.tag('whitepaw');
    await T.go('karrow'); await T.use('w'); await T.use('s'); await T.go('k_shop'); await T.use('r');
    await T.go('iceshrine'); for (const c of ['a', 'b', 'c', 'l']) await T.use(c);
    const want = { 'q.raiders': 2, 'q.dogs3': 3, 'q.troll3': 2, 'q.runes3': 2, 'q.whitepaw': 2, 'q.shrine3': 2 };
    for (const k in want) if (G.flag(k) !== want[k]) throw new Error('side quest flag ' + k + ' is ' + G.flag(k));
    T.equip3(); T.mark('karrow jobs done'); T.rest();
  }
  await T.door('frostpass', 'a');
  if (G.flag('q.act3') !== 3) throw new Error('the Cairn door did not open');
  await T.go('frostpass');
  await T.go('cairn1'); await T.use('h'); await T.use('n'); await T.use('p'); await T.use('k');
  await T.pick('l', 'Eagle'); await T.pick('m', 'Wolf'); await T.pick('o', 'Stone'); await T.pick('q', 'Bear');
  if (!G.flag('cr.gate')) throw new Error('the oath-stones did not open the gate');
  if (full) { await T.use('r', 12); await T.use('c'); await T.use('d'); T.equip3(); }
  await T.use('h'); T.mark('hall of oaths');
  await T.go('vault3');
  for (const c of ['f', 'g', 'a', '1', '2', 'b', 'e', '3', 'h']) await T.use(c);
  if (full) { await T.use('c'); await T.use('d'); }
  await T.use('y'); if (G.has('campkit')) await T.tag('svCamp'); else T.rest();
  await T.use('k');
  if (!G.flag('sv.open') || !G.flag('shieldDone')) throw new Error('the Sleepers\' Vault was not cleared');
  T.equip3(); T.mark('sleepers vault');
  await T.go('cairn2'); await T.use('w'); await T.use('t');
  if (!G.flag('cr2.done')) throw new Error('the Cairn scene did not finish');
  T.mark('giant'); await T.use('c');
  for (let i = 0; i < 10 && G.S.map !== 'karrow'; i++) await T.use('l');
  if (G.S.map !== 'karrow') throw new Error('the lamp did not lead home');
  await T.go('k_hall'); await T.use('c');
  T.mark('end');
  const f = G.S.flags, pickf = ks => Object.fromEntries(ks.filter(k => f[k] !== undefined).map(k => [k, f[k]]));
  return { tm: T.tm, early30: !!T.early30, lv: T.lv, log: T.log, fights: T.fights, losses: T.losses, map: G.S.map, level: G.S.level, xp: G.S.xp,
    explored: pickf(['arnSafe', 'q.bear', 'verse3', 'q.watcher', 'tunnelOpen', 'cr.gate', 'kellDead', 'knowsGiant', 'veyraOrder']),
    quests: pickf(['q.main3', 'ch3done', 'chapter', 'lampLit3']),
    choices: pickf(['runaOath', 'brynAlly', 'prisoner', 'grukk3', 'scouts3', 'shardBearer', 'shardWeak', 'veyra3', 'allyVeyra', 'giant', 'camp3']),
    picks: T.picks, boons: G.S.boons || {}, gold: G.S.gold, chronicle: G.D.chronicle.filter(e => (e[2] || 1) === 3 && G.cond(e[0])).map(e => e[1]),
    err: G.lastError ? String(G.lastError.stack) : null };
})
"""

PLAY4 = r"""
(async (prefs, checks, mode, start, raw) => {
  T.lv = []; T.log = []; T.losses = 0; T.fights = 0; T.picks = []; T.prefs = prefs; T.checks = checks; G.lastError = null;
  const full = mode === 'full', some = mode === 'some' || full, dung = mode === 'dungeons' || full;
  if (raw) G.D.levelCaps = { 1: 99, 2: 99, 3: 99, 4: 99 };
  G.newGame();
  const st = {
    lo: { xp: 7320, level: 13, gold: 950, bag: ['shard3', 'letter3'], f: { shardAt: 1, runaOath: 1, brynAlly: 1, giant: 1, veyra3: 3, brannoc2: 1, camp3: 1, daskDebt: 1 } },
    mid: { xp: 11450, level: 17, gold: 1350, bag: ['shard3', 'letter3', 'ledger'], f: { shardAt: 2, runaOath: 3, brynAlly: 1, giant: 1, veyra3: 1, allyVeyra: 1, veyraTurning: 1, veyraDoubt: 1, brannoc2: 2, camp3: 2, marenHope: 1, verse1: 1, verse2: 1, knowsCourt: 1 } },
    hi: { xp: 13255, level: 18, gold: 1750, bag: ['shard3', 'letter3', 'ledger'], f: { shardAt: 2, shardTraded: 1, runaOath: 4, brynAlly: 1, giant: 2, veyra3: 2, allyVeyra: 1, veyraTurning: 1, brannoc2: 3, camp3: 3, finchSong: 1, verse1: 1, verse2: 1, verse3: 1, knowsCourt: 1 } }
  }[start];
  G.S.xp = st.xp; G.S.level = st.level; G.S.gold = st.gold;
  Object.assign(G.S.flags, { tut: 1, joined: 1, chapter: 3, ch1done: 1, bridgeMended: 1, 'q.main': 6, ch2done: 1, 'q.main2': 7, ch3done: 1, 'q.main3': 7 }, st.f);
  st.bag.forEach(id => G.give(id));
  const gear = { runa: { weapon: 'karrowaxe', armor: 'wolfplate' }, dask: { weapon: 'icepick', armor: 'snowcloak' }, maren: { weapon: 'runemace', armor: 'oathmail', charm: 'lampcharm' }, finch: { weapon: 'skaldblade', armor: 'furcoat' } };
  for (const m of G.S.party) Object.assign(m.gear, gear[m.id]);
  if (st.f.shardAt === 2 && !st.f.shardTraded) G.S.party.find(m => m.id === 'maren').gear.charm = 'shardworn';
  G.S.bag.potent = 4; G.S.bag.greater = 3; G.healAll();
  T.rest = () => { if (G.S.gold >= 60) { G.S.gold -= 60; G.healAll(); } };
  T.buy = () => {
    for (const id of ['knightplate', 'cathedralmail', 'shadowsilk', 'velvetmail', 'ducalaxe', 'wardenstaff', 'nightblade', 'courtrapier']) {
      const it = G.D.items[id]; if (G.S.gold < it.price + 200) continue;
      const m = G.S.party.find(p => p.id === it.for[0]); G.S.gold -= it.price; m.gear[it.type] = id;
    }
  };
  T.equip4 = () => {
    const want = [['dask', 'wrenknife'], ['maren', 'lanternshield'], ['finch', 'ducalsignet'], ['runa', 'enginecore'], ['dask', 'quellstiletto'], ['finch', 'ashbyrapier'], ['runa', 'watchmail'], ['maren', 'vellbook']];
    for (const [who, id] of want) if (G.has(id)) { const m = G.S.party.find(p => p.id === who), it = G.D.items[id]; if (it.type === 'charm' && m.gear.charm === 'shardworn') continue; const old = m.gear[it.type]; m.gear[it.type] = id; G.give(id, -1); if (old) G.give(old, 1); }
  };
  T.pick = async (ch, labels) => { const old = T.prefs; T.prefs = labels.map(l => '^' + l + '$'); await T.use(ch); T.prefs = old; };
  T.pickup = ch => { const th = Field.map.things.find(t => t.ch === ch && Field.visible(t)); if (th) Field.pickup(th); };
  for (let i = 0; i < 12 && G.S.map !== 'highmoor'; i++) { await T.go('karrow'); await T.use('n'); }
  if (G.S.map !== 'highmoor' || G.S.flags.chapter !== 4) throw new Error('the road did not start chapter 4');
  T.mark('highmoor'); T.buy();
  for (let i = 0; i < 6 && G.flag('q.main4') < 2; i++) { await T.go('highmoor'); await T.use('a'); }
  if (G.flag('q.main4') !== 2) throw new Error('the feast did not happen');
  T.mark('feast');
  await T.go('h_cathedral'); await T.use('w');
  if (G.flag('q.main4') !== 3) throw new Error('Oriel did not send us down');
  if (dung) { await T.use('a'); }
  if (some) { await T.go('h_shop'); await T.use('r'); }
  if (some || dung) { await T.go('h_counting'); await T.use('w'); }
  if (full || (some && G.flag('brannoc2') >= 2)) { await T.go('h_inn'); for (let i = 0; i < 3 && !G.flag('brannoc4'); i++) await T.use('v'); }
  if (dung || some) {
    T.rest(); await T.go('h_counting'); for (let i = 0; i < 4 && G.S.map !== 'h_vault'; i++) await T.use('v');
    if (G.S.map === 'h_vault') {
      await T.use('h'); if (full) await T.use('m', 1); await T.use('g'); await T.use('l', 12); await T.use('k'); await T.use('b'); await T.use('c'); await T.use('e');
      await T.go('h_counting'); await T.use('w'); T.equip4(); T.mark('vault');
    }
  }
  if (dung) {
    T.rest(); await T.go('h_crypt'); await T.use('w'); await T.use('h');
    for (let i = 0; i < 6 && Field.map.things.some(t => t.ch === 'r' && Field.visible(t)); i++) await T.pick('r', ['Hold the gate', 'All alone', 'Into the deep']);
    await T.use('h'); await T.use('k'); await T.use('c');
    if (!G.flag('verse4')) throw new Error('no fourth stanza');
    T.equip4(); T.mark('undercrypt');
  }
  T.rest(); await T.go('undercroft'); await T.use('p'); T.mark('sewer gate');
  if (G.flag('brannoc2') === 1) await T.use('v');
  if (some) { T.pickup('g'); await T.use('h'); }
  if (full) { await T.use('d'); await T.use('c'); await T.use('e', 12); await T.wander(3); await T.use('h'); }
  if (G.flag('backdoorKey') && !full) await T.use('k'); else await T.use('q');
  await T.use('f'); T.mark('safehouse');
  // the Plague Gate: the catacombs stay shut until the bell-tower winch is turned
  await T.door('undercroft', 'a');
  T.rest(); await T.go('chtower'); for (const c of ['g', 'a', 'b', 'e', 'f']) await T.use(c);
  T.rest(); await T.use('k'); await T.use('w');
  if (full) { await T.use('h'); await T.use('c'); await T.use('d'); }
  if (!G.flag('act4done')) throw new Error('the bell-tower did not raise the Plague Gate');
  T.equip4(); T.mark('bell tower');
  if (full) {                                                     // Highmoor's notice board and its five jobs
    await T.go('highmoor'); await T.tag('board4', 12); T.rest();
    await T.go('undercroft'); await T.tag('pim'); await T.go('sewer4'); for (const c of ['a', 'b', 'd', 'c']) await T.use(c); T.rest(); await T.use('r');
    T.rest(); await T.go('printshop'); for (const c of ['a', 'b', 'd', 'c']) await T.use(c); T.rest(); await T.use('q');
    await T.go('highmoor'); for (const n of ['1', '2', '3']) { T.rest(); await T.tag('gang' + n); }
    T.rest(); await T.tag('ashby');
    T.rest(); await T.go('h_cathedral'); await T.tag('belfry');
    const want = { 'q.rats4': 2, 'q.forger4': 2, 'q.watch4': 2, 'q.ghost4': 2, 'q.duel4': 2 };
    for (const k in want) if (G.flag(k) !== want[k]) throw new Error('side quest flag ' + k + ' is ' + G.flag(k));
    T.equip4(); T.mark('highmoor jobs done');
  }
  await T.door('undercroft', 'a');
  if (G.flag('q.act4') !== 3) throw new Error('the Plague Gate did not open');
  await T.go('undercroft');
  if (some) {
    await T.go('h_shop'); await T.use('r'); await T.go('h_palace'); await T.use('d'); T.equip4();
    if (!G.flag('dukeCured')) throw new Error('the Duke was not cured');
    await T.go('undercroft');
  }
  T.rest();
  await T.go('catacombs1'); await T.use('n'); await T.use('p'); await T.use('1'); await T.use('4');
  if (!G.flag('cl.open')) throw new Error('the four lamps did not open the stair');
  if (full) { await T.use('c'); await T.use('d', 12); }
  T.mark('ossuary');
  T.rest(); await T.go('charnel');
  for (const c of ['a', 'b', 'd', '1', 'f', '2', 'g', '3', 'e']) await T.use(c);
  if (full) { await T.use('c'); await T.use('h'); }
  await T.use('y'); if (G.has('campkit')) await T.tag('cgCamp'); else T.rest();
  await T.use('k');
  if (!G.flag('cg.open') || !G.flag('abbotDone')) throw new Error('the Charnel Galleries were not cleared');
  T.equip4(); T.mark('charnel');
  await T.go('catacombs2'); await T.use('w'); T.rest(); await T.use('t');
  if (!G.flag('cc.done')) throw new Error('the tomb scene did not finish');
  T.mark('colossus');
  for (let i = 0; i < 10 && G.S.map !== 'highmoor'; i++) await T.use('l');
  if (G.S.map !== 'highmoor') throw new Error('the lamp did not lead home');
  await T.go('h_cathedral'); await T.use('w');
  T.mark('end');
  const f = G.S.flags, pickf = ks => Object.fromEntries(ks.filter(k => f[k] !== undefined).map(k => [k, f[k]]));
  return { tm: T.tm, early30: !!T.early30, lv: T.lv, log: T.log, fights: T.fights, losses: T.losses, map: G.S.map, level: G.S.level, xp: G.S.xp,
    explored: pickf(['dukeCured', 'q.duke', 'heist', 'q.heist', 'verse4', 'q.crypt', 'q.brannoc', 'cl.open', 'knowsGreyOil', 'knowsChancellery']),
    quests: pickf(['q.main4', 'ch4done', 'chapter', 'lampLit4']),
    choices: pickf(['dask4', 'orrinExposed', 'shards4', 'shard1Stolen', 'maren4', 'brannoc4', 'backdoorKey', 'wrenFree', 'veyra4', 'dukeDead', 'corrKnown', 'camp4']),
    boons: G.S.boons || {}, gold: G.S.gold, picks: T.picks, chronicle: G.D.chronicle.filter(e => (e[2] || 1) === 4 && G.cond(e[0])).map(e => e[1]),
    err: G.lastError ? String(G.lastError.stack) : null };
})
"""

PLAY5 = r"""
(async (prefs, checks, mode, start, raw) => {
  T.lv = []; T.log = []; T.losses = 0; T.fights = 0; T.picks = []; T.prefs = prefs; T.checks = checks; G.lastError = null;
  const full = mode === 'full', some = mode === 'some' || full, dung = mode === 'dungeons' || full;
  if (raw) { G.D.levelCaps = { 1: 99, 2: 99, 3: 99, 4: 99, 5: 99 }; G.D.capUnlocks = {}; }
  G.newGame();
  const st = {
    lo: { xp: 14610, level: 18, gold: 1300, bag: [], f: { shardAt: 1, shard1Stolen: 1, dask4: 1, shards4: 2, dukeDead: 1, veyra3: 3, brannoc4: 1, giant: 1, runaOath: 1, brynAlly: 1, camp4: 1, lampLit: 1, lampLit2: 1, lampLit3: 1, lampLit4: 1 } },
    mid: { xp: 22290, level: 23, gold: 1800, bag: ['debtpapers'], f: { shardAt: 2, veyraTurning: 1, veyra4: 1, maren4: 3, dukeCured: 1, dask4: 3, orrinExposed: 1, heist: 2, verse1: 1, verse2: 1, verse3: 1, grukk3: 1, hostagesSaved: 1, ingridAlly: 1, runaOath: 4, brynAlly: 1, giant: 1, veyra: 1, marenHope: 1, knowsBrother: 1, camp4: 2 } },
    hi: { xp: 24990, level: 24, gold: 2600, bag: [], f: { shardAt: 2, shardTraded: 1, veyraTurning: 1, maren4: 1, dukeCured: 1, dask4: 3, heist: 1, wrenFree: 1, verse1: 1, verse2: 1, verse3: 1, verse4: 1, grukk3: 4, hostagesSaved: 1, silver: 1, giant: 1, runaOath: 3, brynAlly: 1, knowsCourt: 1, 'confide.maren': 1, 'confide.finch': 1, snik: 1, lightLit: 1, camp4: 3 } }
  }[start];
  G.S.xp = st.xp; G.S.level = st.level; G.S.gold = st.gold;
  Object.assign(G.S.flags, { tut: 1, joined: 1, chapter: 4, ch1done: 1, bridgeMended: 1, 'q.main': 6, ch2done: 1, 'q.main2': 7, ch3done: 1, 'q.main3': 7, ch4done: 1, 'q.main4': 7, corrKnown: 1, cs: 0 }, st.f);
  st.bag.forEach(id => G.give(id));
  const gear = { runa: { weapon: 'ducalaxe', armor: 'knightplate' }, dask: { weapon: 'nightblade', armor: 'shadowsilk' }, maren: { weapon: 'wardenstaff', armor: 'cathedralmail', charm: 'lampcharm' }, finch: { weapon: 'courtrapier', armor: 'velvetmail' } };
  for (const m of G.S.party) Object.assign(m.gear, gear[m.id]);
  G.S.bag.elixir = 4; G.S.bag.potent = 4; G.healAll();
  T.rest = () => { G.healAll(); };     // the healers' tent at Ashfall is free
  T.buy = () => {
    for (const id of ['oathplate', 'wardenplate', 'nightveil', 'skaldmail', 'kingsbane', 'lampbearer', 'debtcutter', 'balladblade']) {
      const it = G.D.items[id]; if (G.S.gold < it.price + 200) continue;
      const m = G.S.party.find(p => p.id === it.for[0]); G.S.gold -= it.price; m.gear[it.type] = id;
    }
  };
  T.equip5 = () => {
    const want = [['runa', 'ashenblade'], ['runa', 'stonehand'], ['dask', 'clearledger'], ['maren', 'odricslamp'], ['finch', 'grandmaharp'], ['runa', 'ilsabetblade'], ['maren', 'wardencloak']];
    for (const [who, id] of want) if (G.has(id)) { const m = G.S.party.find(p => p.id === who), it = G.D.items[id]; const old = m.gear[it.type]; m.gear[it.type] = id; G.give(id, -1); if (old) G.give(old, 1); }
  };
  T.pick = async (ch, labels) => { const old = T.prefs; T.prefs = labels.map(l => '^' + l + '$'); await T.use(ch); T.prefs = old; };
  for (let i = 0; i < 12 && G.S.map !== 'ashfall'; i++) { await T.go('highmoor'); await T.use('n'); }
  if (G.S.map !== 'ashfall' || G.S.flags.chapter !== 5) throw new Error('the road east did not start chapter 5');
  T.mark('ashfall'); T.buy();
  await T.use('o');
  if (G.flag('q.main5') !== 2) throw new Error('Oriel did not brief us');
  await T.use('v'); await T.use('p');
  for (let i = 0; i < 4 && !G.flag('camp5'); i++) await T.use('h');
  T.mark('last night');
  await T.go('ashroad');
  if (some) {
    for (const [g, l] of [['1', 'l'], ['2', 'm'], ['3', 'o'], ['4', 'q']]) { await T.use(g); await T.use(l); }
    if (!G.flag('roadLit')) throw new Error('the road lamps did not all light');
    await T.use('h'); T.mark('road of lamps'); T.rest();
  }
  if (some || dung) {
    await T.go('greyhold'); await T.use('g'); await T.use('k'); await T.use('l'); await T.use('c');
    if (!G.flag('prisonersFreed')) throw new Error('Greyhold was not freed');
    T.equip5(); T.mark('greyhold'); T.rest();
  }
  if (dung) {
    await T.go('mirror'); for (const c of ['r', 'd', 'n', 'f']) await T.use(c); await T.use('h'); await T.use('m');
    if (G.flag('q.mirror') !== 2) throw new Error('the Mirror Barrow did not finish');
    T.equip5(); T.mark('mirror barrow'); T.rest();
  }
  if (full) { await T.go('ashroad'); await T.use('e'); await T.use('c'); await T.use('d', 12); await T.wander(3); }
  await T.go('ashroad'); await T.use('w'); T.mark('the canyon'); await T.use('h');
  await T.use('k');
  // the Ash-Ward: the barrow gate stays shut until the Cinder Keep's pyre is out
  await T.door('ashroad', 'z');
  T.rest(); await T.go('cinderkeep'); for (const c of ['e', 'a', 'b', 'g', 'f']) await T.use(c);
  T.rest(); await T.use('m'); await T.use('p');
  if (full) { await T.use('h'); await T.use('c'); await T.use('d'); }
  if (!G.flag('act5done')) throw new Error('the Cinder Keep did not put out the ward-pyre');
  T.equip5(); T.mark('cinder keep');
  if (full) {                                                     // Ashfall's muster board and its five jobs
    await T.go('ashfall'); await T.tag('board5', 12); T.rest();
    await T.go('ashchapel'); for (const c of ['b', 'm', 'c']) await T.use(c); T.rest(); await T.use('s');
    await T.go('ashroad'); await T.tag('lisbet'); for (const n of ['1', '2', '3']) { T.rest(); await T.tag('wagon' + n); }
    T.rest(); await T.tag('brute'); T.rest(); await T.tag('bren'); await T.tag('cache5');
    T.rest(); await T.go('cindercave'); for (const c of ['a', 'b', 's', 'c']) await T.use(c);
    const want = { 'q.deserters5': 2, 'q.supply5': 2, 'q.patrol5': 2, 'q.wager5': 2, 'q.cache5': 2 };
    for (const k in want) if (G.flag(k) !== want[k]) throw new Error('side quest flag ' + k + ' is ' + G.flag(k));
    T.equip5(); T.mark('ashfall jobs done');
  }
  await T.door('ashroad', 'z');
  if (G.flag('q.act5') !== 3) throw new Error('the Ash-Ward did not fall');
  T.rest(); await T.go('hollow1'); await T.use('n'); await T.use('a'); await T.use('b');
  for (let i = 0; i < 4 && Field.map.things.some(t => t.ch === 'g' && Field.visible(t)); i++) await T.pick('g', ['Vael Morn']);
  if (Field.map.things.some(t => t.ch === 'g' && Field.visible(t))) throw new Error('the name-door did not open');
  T.mark('court of the dead');
  T.rest(); await T.go('lamphall');
  for (const c of ['a', '1', '2', 'b', 'd', '3', 'e', '4', 'n']) await T.use(c);
  await T.use('y'); if (G.has('campkit')) await T.tag('lhCamp'); else T.rest();
  await T.use('k');
  if (!G.flag('lh.open') || !G.flag('queenDone')) throw new Error('the Hall of Lamps was not cleared');
  T.equip5(); T.mark('hall of lamps');
  await T.go('hollow2'); await T.use('w'); await T.use('h'); await T.use('t');
  if (!G.flag('doorOpen')) throw new Error('the last door did not open');
  T.mark('corr');
  await T.go('hollow3'); await T.use('t');
  T.mark('end');
  const f = G.S.flags, pickf = ks => Object.fromEntries(ks.filter(k => f[k] !== undefined).map(k => [k, f[k]]));
  return { tm: T.tm, early30: !!T.early30, lv: T.lv, log: T.log, fights: T.fights, losses: T.losses, map: G.S.map, level: G.S.level, xp: G.S.xp,
    explored: pickf(['roadLit', 'prisonersFreed', 'tobiasFree', 'q.mirror', 'odricMsg', 'grandmaBlessing']),
    quests: pickf(['q.main5', 'ch5done', 'chapter', 'kingDown']),
    choices: pickf(['muster', 'veyraWith', 'veyraFreed', 'veyraStays', 'veyra5', 'dask5', 'corrShaken', 'corrTaken', 'ending', 'camp5']),
    boons: G.S.boons || {}, gold: G.S.gold, picks: T.picks, chronicle: G.D.chronicle.filter(e => (e[2] || 1) === 5 && G.cond(e[0])).map(e => e[1]),
    err: G.lastError ? String(G.lastError.stack) : null };
})
"""

SIM = r"""
(async (level, N, only) => {
  const out = {}; B.randomBoard = true;
  for (const gid in G.D.groups) {
    if (only && only.indexOf(gid) < 0) continue;
    let wins = 0, rounds = 0, hpLost = 0, downs = 0, sp = 0;
    for (let i = 0; i < N; i++) {
      G.newGame(); G.S.level = level;
      const g1 = { runa: { weapon: 'timberfall', armor: 'studded' }, dask: { weapon: 'barrowfang', armor: 'reinforced' }, maren: { weapon: 'wardenmace', armor: 'wardenmail', charm: 'lampcharm' }, finch: { weapon: 'finerapier', armor: 'doublet' } };
      const g2 = { runa: { weapon: 'reaver', armor: 'scalemail' }, dask: { weapon: 'kris', armor: 'sharkskin' }, maren: { weapon: 'tidemace', armor: 'chapelmail' }, finch: { weapon: 'sabre', armor: 'brigantine' } };
      const g3 = { runa: { weapon: 'karrowaxe', armor: 'wolfplate' }, dask: { weapon: 'icepick', armor: 'snowcloak' }, maren: { weapon: 'runemace', armor: 'oathmail' }, finch: { weapon: 'skaldblade', armor: 'furcoat' } };
      const g4 = { runa: { weapon: 'ducalaxe', armor: 'knightplate' }, dask: { weapon: 'nightblade', armor: 'shadowsilk' }, maren: { weapon: 'wardenstaff', armor: 'cathedralmail' }, finch: { weapon: 'courtrapier', armor: 'velvetmail' } };
      const g5 = { runa: { weapon: 'kingsbane', armor: 'oathplate' }, dask: { weapon: 'debtcutter', armor: 'nightveil' }, maren: { weapon: 'lampbearer', armor: 'wardenplate' }, finch: { weapon: 'balladblade', armor: 'skaldmail' } };
      const P = G.power(level); for (const m of G.S.party) { if (P >= 4) Object.assign(m.gear, g1[m.id]); if (P >= 6) Object.assign(m.gear, g2[m.id]); if (P >= 10) Object.assign(m.gear, g3[m.id]); if (P >= 14) Object.assign(m.gear, g4[m.id]); if (P >= 18) Object.assign(m.gear, g5[m.id]); }
      G.healAll(); G.S.bag = { draught: 3 };
      await Field.enter('tavern', null, { noFade: true });
      const before = G.S.party.reduce((s, m) => s + m.hp, 0), spB = G.S.party.reduce((s, m) => s + m.sp, 0);
      const r = await _start(gid, G.D.groups[gid].simGuests ? { guests: G.D.groups[gid].simGuests } : {});
      if (r === 'win') { wins++; rounds += B.rounds; hpLost += (before - G.S.party.reduce((s, m) => s + m.hp, 0)) / before; sp += (spB - G.S.party.reduce((s, m) => s + m.sp, 0)) / spB; downs += G.S.party.filter(m => m.hp <= 1).length; }
    }
    out[gid] = { win: Math.round(100 * wins / N), rounds: +(rounds / Math.max(1, wins)).toFixed(1), hpLost: Math.round(100 * hpLost / Math.max(1, wins)), spUsed: Math.round(100 * sp / Math.max(1, wins)), downs: +(downs / Math.max(1, wins)).toFixed(2) };
  }
  return out;
})
"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 960, 'height': 720})
        errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        await pg.add_init_script('window.__NO_TITLE = true;')
        await pg.goto('file://' + os.path.join(ROOT, 'dist', 'index.html'))
        await pg.wait_for_timeout(300)
        await pg.evaluate(SETUP + '; void 0')
        if MODE == 'play':
            names = sys.argv[2].split(',') if len(sys.argv) > 2 else list(ROUTES)
            bad = 0
            for name in names:
                r = ROUTES[name]
                mode = r.get('mode', 'full')
                await pg.reload(); await pg.wait_for_timeout(300); await pg.evaluate(SETUP + '; void 0')
                if os.environ.get('PATCH'): await pg.evaluate(os.environ['PATCH'] + '; void 0')
                res = await pg.evaluate('(' + PLAY + ')(%s, %s, %s, %s)' % (json.dumps(r['prefs']), json.dumps(r['checks']), json.dumps(mode), json.dumps(RAW)))
                if os.environ.get('LEVELS_OUT'): open(os.environ['LEVELS_OUT'], 'a').write(json.dumps({'route': name, 'd': await pg.evaluate('({ glv: T.glv, gmap: T.gmap, qlv: T.qlv })')}) + '\n')
                done = res['quests'].get('ch1done') == 1 and res['quests'].get('q.main') == 6 and res['quests'].get('bridgeMended') == 1 and not res['quests'].get('cs.farewell') and not res['err']
                if not RAW:                       # the level rules the chapter promises: main 4, some side content 5, all of it 6
                    if res['level'] > 7: done = False; print('  LEVEL WELL PAST THE OLD CAP: %d' % res['level'])
                    if mode == 'main' and res['level'] != 4: done = False; print('  MAIN STORY ENDED AT LEVEL %d' % res['level'])
                    if mode == 'full' and res['level'] not in (6, 7): done = False; print('  FULL ROUTE ENDED AT LEVEL %d' % res['level'])
                bad += 0 if done else 1
                print('=== route %s (%s): %s — level %d, %d XP, %d fights, %d losses' % (name, mode, 'COMPLETE' if done else 'DID NOT FINISH', res['level'], res['xp'], res['fights'], res['losses']))
                print('  tm: ' + json.dumps(res.get('tm')))
                print('  level-ups: ' + ' | '.join(res['lv']))
                print('\n'.join('  ' + l for l in res['log']))
                print('  quests', res['quests']); print('  explored', res['explored']); print('  choices', res['choices']); print('  boons', res['boons'])
                print('  chronicle:', ' | '.join(res['chronicle']))
                if res['err']: print('  ERROR', res['err'])
            print('console:', errs[:10])
            await b.close()
            sys.exit(1 if bad or errs else 0)
        elif MODE == 'play5':
            names = sys.argv[2].split(',') if len(sys.argv) > 2 else list(ROUTES5)
            bad = 0
            for name in names:
                r = ROUTES5[name]
                await pg.reload(); await pg.wait_for_timeout(300); await pg.evaluate(SETUP + '; void 0')
                if os.environ.get('PATCH'): await pg.evaluate(os.environ['PATCH'] + '; void 0')
                try:
                    res = await pg.evaluate('(' + PLAY5 + ')(%s, %s, %s, %s, %s)' % (json.dumps(r['prefs']), json.dumps(r['checks']), json.dumps(r['mode']), json.dumps(r['start']), json.dumps(RAW)))
                    if os.environ.get('LEVELS_OUT'): open(os.environ['LEVELS_OUT'], 'a').write(json.dumps({'route': name, 'd': await pg.evaluate('({ glv: T.glv, gmap: T.gmap, qlv: T.qlv })')}) + '\n')
                except Exception as e:
                    print('=== route %s: CRASHED %s' % (name, str(e)[:900])); bad += 1; continue
                done = res['quests'].get('ch5done') == 1 and res['quests'].get('q.main5') == 7 and not res['err']
                if not RAW:
                    if r['mode'] == 'main' and r['start'] == 'hi' and res['level'] != 27: done = False; print('  MAIN STORY (FROM A FULL CHAPTER) ENDED AT LEVEL %d' % res['level'])
                    if r['mode'] == 'main' and res['level'] > 27: done = False; print('  MAIN STORY ENDED AT LEVEL %d' % res['level'])
                    if r['mode'] == 'full' and res['level'] != 30: done = False; print('  FULL ROUTE ENDED AT LEVEL %d' % res['level'])
                bad += 0 if done else 1
                print('=== route %s (%s from %s): %s — level %d, %d XP, %d gold, %d fights, %d losses' % (name, r['mode'], r['start'], 'COMPLETE' if done else 'DID NOT FINISH', res['level'], res['xp'], res['gold'], res['fights'], res['losses']))
                print('  tm: ' + json.dumps(res.get('tm')))
                print('  level-ups: ' + ' | '.join(res['lv']))
                print('\n'.join('  ' + l for l in res['log']))
                print('  quests', res['quests']); print('  explored', res['explored']); print('  choices', res['choices']); print('  boons', res['boons'])
                print('  chronicle:', ' | '.join(res['chronicle']))
                if res['err']: print('  ERROR', res['err'])
                if not done or os.environ.get('PICKS'): print('  picks:', ' | '.join(res['picks']))
            print('console:', errs[:10])
            await b.close()
            sys.exit(1 if bad or errs else 0)
        elif MODE == 'play4':
            names = sys.argv[2].split(',') if len(sys.argv) > 2 else list(ROUTES4)
            bad = 0
            for name in names:
                r = ROUTES4[name]
                await pg.reload(); await pg.wait_for_timeout(300); await pg.evaluate(SETUP + '; void 0')
                if os.environ.get('PATCH'): await pg.evaluate(os.environ['PATCH'] + '; void 0')
                try:
                    res = await pg.evaluate('(' + PLAY4 + ')(%s, %s, %s, %s, %s)' % (json.dumps(r['prefs']), json.dumps(r['checks']), json.dumps(r['mode']), json.dumps(r['start']), json.dumps(RAW)))
                    if os.environ.get('LEVELS_OUT'): open(os.environ['LEVELS_OUT'], 'a').write(json.dumps({'route': name, 'd': await pg.evaluate('({ glv: T.glv, gmap: T.gmap, qlv: T.qlv })')}) + '\n')
                except Exception as e:
                    print('=== route %s: CRASHED %s' % (name, str(e)[:900])); bad += 1; continue
                done = res['quests'].get('ch4done') == 1 and res['quests'].get('q.main4') == 7 and not res['err']
                if not RAW:
                    if res['level'] > 25: done = False; print('  LEVEL WELL PAST THE OLD CAP: %d' % res['level'])
                    if r['mode'] == 'main' and r['start'] == 'hi' and res['level'] != 21: done = False; print('  MAIN STORY (FROM A FULL CHAPTER) ENDED AT LEVEL %d' % res['level'])
                    if r['mode'] == 'main' and res['level'] > 21: done = False; print('  MAIN STORY ENDED AT LEVEL %d' % res['level'])
                    if r['mode'] == 'full' and res['level'] not in (24, 25): done = False; print('  FULL ROUTE ENDED AT LEVEL %d' % res['level'])
                bad += 0 if done else 1
                print('=== route %s (%s from %s): %s — level %d, %d XP, %d gold, %d fights, %d losses' % (name, r['mode'], r['start'], 'COMPLETE' if done else 'DID NOT FINISH', res['level'], res['xp'], res['gold'], res['fights'], res['losses']))
                print('  tm: ' + json.dumps(res.get('tm')))
                print('  level-ups: ' + ' | '.join(res['lv']))
                print('\n'.join('  ' + l for l in res['log']))
                print('  quests', res['quests']); print('  explored', res['explored']); print('  choices', res['choices']); print('  boons', res['boons'])
                print('  chronicle:', ' | '.join(res['chronicle']))
                if res['err']: print('  ERROR', res['err'])
                if not done or os.environ.get('PICKS'): print('  picks:', ' | '.join(res['picks']))
            print('console:', errs[:10])
            await b.close()
            sys.exit(1 if bad or errs else 0)
        elif MODE == 'play3':
            names = sys.argv[2].split(',') if len(sys.argv) > 2 else list(ROUTES3)
            bad = 0
            for name in names:
                r = ROUTES3[name]
                await pg.reload(); await pg.wait_for_timeout(300); await pg.evaluate(SETUP + '; void 0')
                if os.environ.get('PATCH'): await pg.evaluate(os.environ['PATCH'] + '; void 0')
                try:
                    res = await pg.evaluate('(' + PLAY3 + ')(%s, %s, %s, %s, %s)' % (json.dumps(r['prefs']), json.dumps(r['checks']), json.dumps(r['mode']), json.dumps(r['start']), json.dumps(RAW)))
                    if os.environ.get('LEVELS_OUT'): open(os.environ['LEVELS_OUT'], 'a').write(json.dumps({'route': name, 'd': await pg.evaluate('({ glv: T.glv, gmap: T.gmap, qlv: T.qlv })')}) + '\n')
                except Exception as e:
                    print('=== route %s: CRASHED %s' % (name, str(e)[:900])); bad += 1; continue
                done = res['quests'].get('ch3done') == 1 and res['quests'].get('q.main3') == 7 and not res['err']
                if not RAW:
                    if res['level'] > 19: done = False; print('  LEVEL WELL PAST THE OLD CAP: %d' % res['level'])
                    if r['mode'] == 'main' and r['start'] == 'hi' and res['level'] != 15: done = False; print('  MAIN STORY (FROM A FULL CHAPTER) ENDED AT LEVEL %d' % res['level'])
                    if r['mode'] == 'main' and res['level'] > 15: done = False; print('  MAIN STORY ENDED AT LEVEL %d' % res['level'])
                    if r['mode'] == 'full' and res['level'] not in (18, 19): done = False; print('  FULL ROUTE ENDED AT LEVEL %d' % res['level'])
                bad += 0 if done else 1
                print('=== route %s (%s from %s): %s — level %d, %d XP, %d gold, %d fights, %d losses' % (name, r['mode'], r['start'], 'COMPLETE' if done else 'DID NOT FINISH', res['level'], res['xp'], res['gold'], res['fights'], res['losses']))
                print('  tm: ' + json.dumps(res.get('tm')))
                print('  level-ups: ' + ' | '.join(res['lv']))
                print('\n'.join('  ' + l for l in res['log']))
                print('  quests', res['quests']); print('  explored', res['explored']); print('  choices', res['choices']); print('  boons', res['boons'])
                print('  chronicle:', ' | '.join(res['chronicle']))
                if res['err']: print('  ERROR', res['err'])
                if not done or os.environ.get('PICKS'): print('  picks:', ' | '.join(res['picks']))
            print('console:', errs[:10])
            await b.close()
            sys.exit(1 if bad or errs else 0)
        elif MODE == 'play2':
            names = sys.argv[2].split(',') if len(sys.argv) > 2 else list(ROUTES2)
            bad = 0
            for name in names:
                r = ROUTES2[name]
                await pg.reload(); await pg.wait_for_timeout(300); await pg.evaluate(SETUP + '; void 0')
                if os.environ.get('PATCH'): await pg.evaluate(os.environ['PATCH'] + '; void 0')
                try:
                    res = await pg.evaluate('(' + PLAY2 + ')(%s, %s, %s, %s, %s)' % (json.dumps(r['prefs']), json.dumps(r['checks']), json.dumps(r['mode']), json.dumps(r['start']), json.dumps(RAW)))
                    if os.environ.get('LEVELS_OUT'): open(os.environ['LEVELS_OUT'], 'a').write(json.dumps({'route': name, 'd': await pg.evaluate('({ glv: T.glv, gmap: T.gmap, qlv: T.qlv })')}) + '\n')
                except Exception as e:
                    print('=== route %s: CRASHED %s' % (name, str(e)[:600])); bad += 1; continue
                done = res['quests'].get('ch2done') == 1 and res['quests'].get('q.main2') == 7 and not res['err']
                if not RAW:
                    if res['level'] > 13: done = False; print('  LEVEL WELL PAST THE OLD CAP: %d' % res['level'])
                    if r['mode'] == 'main' and r['start'] == 'hi' and res['level'] != 9: done = False; print('  MAIN STORY (FROM A FULL CHAPTER) ENDED AT LEVEL %d' % res['level'])
                    if r['mode'] == 'main' and res['level'] > 9: done = False; print('  MAIN STORY ENDED AT LEVEL %d' % res['level'])
                    if r['mode'] == 'full' and res['level'] not in (12, 13): done = False; print('  FULL ROUTE ENDED AT LEVEL %d' % res['level'])
                bad += 0 if done else 1
                print('=== route %s (%s from %s): %s — level %d, %d XP, %d gold, %d fights, %d losses' % (name, r['mode'], r['start'], 'COMPLETE' if done else 'DID NOT FINISH', res['level'], res['xp'], res['gold'], res['fights'], res['losses']))
                print('  tm: ' + json.dumps(res.get('tm')))
                print('  level-ups: ' + ' | '.join(res['lv']))
                print('\n'.join('  ' + l for l in res['log']))
                print('  quests', res['quests']); print('  explored', res['explored']); print('  choices', res['choices']); print('  boons', res['boons'])
                print('  chronicle:', ' | '.join(res['chronicle']))
                if res['err']: print('  ERROR', res['err'])
            print('console:', errs[:10])
            await b.close()
            sys.exit(1 if bad or errs else 0)
        else:
            level = int(sys.argv[2]) if len(sys.argv) > 2 else 1
            if os.environ.get('PATCH'): await pg.evaluate(os.environ['PATCH'] + '; void 0')   # PATCH='js' tweaks the rules before a sim
            only = os.environ.get('ONLY'); r = await pg.evaluate('(' + SIM + ')(%d, %d, %s)' % (level, int(os.environ.get('N', '120')), json.dumps(only.split(',') if only else None)))
            print('level %d   win%%  rounds  hpLost%%  spUsed%%  downs' % level)
            for k, v in r.items():
                print('%-14s %4d %6.1f %7d %8d %6.2f' % (k, v['win'], v['rounds'], v['hpLost'], v['spUsed'], v['downs']))
        print('console:', errs[:10])
        await b.close()
asyncio.run(main())
