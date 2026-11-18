/* Chapter 5, expanded.
   Main story: The Ash-Ward (quest act5). Past the Barrow Knights the Hollow Barrow's gate is shut behind the Ash-Ward,
   a curtain of cinders kept burning from the ward-pyre of the Cinder Keep, north of the road. The Ash-Marshal holds
   the keep; put out the pyre and the ward falls (flag act5done). Between the Court of the Dead and the Last Door lies
   the Hall of Lamps: four Warden lamps, named for the four who kept the shards, must burn before its door opens, and
   the Lamp-eater Queen keeps the way down.
   Side quests (Ashfall's muster board): The Deserters (deserters5), The Supply Wagons (supply5), The Lost Patrol
   (patrol5), Grukk's Wager (wager5), The Warden Cache (cache5). */
(function () {
  const D = G.D, M = D.maps;
  (D.xpScale = D.xpScale || {})[5] = 0.66;
  const MAINXP = 0.3;
  Object.assign(D.speakers, { 'The Ash-Marshal': '#e0a080', 'Sergeant Mott': '#c8b8a0', 'Knight-Captain Ilsabet': '#e8d8f0' });
  Object.assign(D.sprites, {
    ashmarshal: { skin: '#b8a090', hair: '#3a3028', top: '#4a3a3a', legs: '#2a2020', trim: '#e8902a', eyes: '#ff8a3a' },
    mott: { skin: '#d8a880', hair: '#8a8a8a', top: '#6a6a70', legs: '#3a3a40', trim: '#a8a8b0' },
    ilsabet: { skin: '#e8d0c0', hair: '#f0e8d0', top: '#d8d8e8', legs: '#8a8aa0', trim: '#e8c14a' }
  });
  Object.assign(D.looks, {
    ashmarshal: { held: 'hammer', cape: '#6a2a1a', big: 1, scar: 1 },
    mott: { held: 'spear', beard: 1 },
    ilsabet: { held: 'sword', cape: '#e8e8f0', hs: 'braids' }
  });
  Object.assign(D.enemies, {
    ashmarshal: { name: 'The Ash-Marshal', sprite: 'ashmarshal', scale: 3, hp: 470, ac: 21, atk: 15, dmg: '2d10+9', pow: 12, spd: 2, save: 6, xp: 700, gold: [200, 200], tags: ['human'], immune: ['asleep'], moves: [[3, 'attack'], [1, 'stomp']] },
    lampqueen: { name: 'The Lamp-eater Queen', sprite: 'ashwraith', scale: 3, hp: 420, ac: 20, atk: 14, dmg: '2d8+8', pow: 13, spd: 5, save: 6, xp: 700, gold: [0, 0], tags: ['undead'], immune: ['asleep', 'poison'], moves: [[2, 'attack'], [2, 'frostbreath'], [1, 'gravechill']] },
    cinderbrute: { name: 'The Cinder Brute', sprite: 'ashghoul', scale: 3, hp: 480, ac: 19, atk: 15, dmg: '2d10+9', spd: 3, save: 6, xp: 650, gold: [0, 0], tags: ['undead'], immune: ['asleep'], moves: [[3, 'attack'], [1, 'stomp']] },
    ilsabet: { name: 'Knight-Captain Ilsabet', sprite: 'ilsabet', hp: 420, ac: 21, atk: 15, dmg: '2d8+9', pow: 12, spd: 3, save: 6, xp: 620, gold: [150, 150], tags: ['human'], immune: ['asleep'], moves: [[3, 'attack'], [1, 'shieldwall']] }
  });
  Object.assign(D.groups, {
    ck_gate: { xpMul: MAINXP, enemies: ['palecrusader', 'palemagus'], intro: 'Pale Crusaders on the keep gate, white armour gone grey with ash.' },
    ck_yard: { xpMul: MAINXP, enemies: ['ashghoul', 'palecrusader', 'ashghoul'], intro: 'The yard is a kennel. The dogs are ghouls.' },
    ck_magi: { xpMul: MAINXP, enemies: ['palemagus', 'ashwraith', 'palemagus'], intro: 'Magi feeding the cinder-wind with their own breath.' },
    ck_hall: { xpMul: MAINXP, enemies: ['deathknight', 'palecrusader'], waves: [['palemagus', 'ashghoul']], waveText: ['The Marshal\'s guard pours out of the hall!'], intro: 'A Barrow Knight stands with the living, which ought to be impossible.' },
    ck_stair: { xpMul: MAINXP, enemies: ['deathknight', 'ashwraith', 'deathknight'], intro: 'The stair to the pyre-roof is held by the dead.' },
    ashmarshal: { xpMul: MAINXP, enemies: ['palecrusader', 'ashmarshal', 'palemagus'], waves: [['deathknight']], waveText: ['The Marshal bellows, and a Barrow Knight climbs out of the pyre.'], boss: true, intro: 'The Ash-Marshal lifts a hammer still red from the pyre.' },
    lh_court: { xpMul: MAINXP, enemies: ['courtier', 'courtier'], intro: 'Hollow courtiers, dancing a dance nobody has played in a thousand years.' },
    lh_knights: { xpMul: MAINXP, enemies: ['deathknight', 'deathknight'], intro: 'Barrow Knights stand to either side of the nave.' },
    lh_eaters: { xpMul: MAINXP, enemies: ['ashwraith', 'ashwraith', 'ashwraith'], intro: 'Lamp-eaters, starving, coil around the dead lamps.' },
    lh_ghouls: { xpMul: MAINXP, enemies: ['ashghoul', 'courtier', 'ashghoul'], waves: [['ashghoul']], waveText: ['Another ghoul drops from the ceiling.'], intro: 'The last bay crawls.' },
    lampqueen: { xpMul: MAINXP, enemies: ['ashwraith', 'lampqueen', 'ashwraith'], waves: [['ashwraith']], waveText: ['The Queen opens her mouth, and her children answer.'], boss: true, intro: 'The Lamp-eater Queen unwinds from the empty niche. Every lamp in the hall gutters.' },
    ds_ghouls: { enemies: ['ashghoul', 'ashghoul', 'ashwraith'], intro: 'Ghouls are clawing at the chapel door. Somebody inside is praying very loudly.' },
    ds_hunters: { enemies: ['palecrusader', 'palemagus', 'palecrusader'], intro: 'The Pale Hand has come for its deserters.' },
    ilsabet: { enemies: ['palemagus', 'ilsabet', 'palecrusader'], boss: true, intro: 'Knight-Captain Ilsabet salutes, and draws.' },
    sp_wagon: { enemies: ['ashghoul', 'ashghoul'], intro: 'Ghouls among the broken crates, eating the salt pork. And the horses.' },
    pt_mouth: { enemies: ['ashwraith', 'ashghoul'], intro: 'Lamp-eaters at the cave mouth, waiting for the last lantern inside to go out.' },
    pt_deep: { enemies: ['ashghoul', 'deathknight', 'ashghoul'], intro: 'The patrol\'s rearguard, fighting for their lives.' },
    cinderbrute: { enemies: ['ashghoul', 'cinderbrute', 'ashghoul'], boss: true, intro: 'The Cinder Brute: a ghoul the size of a hay-wain, with smoke coming out of its ears.' },
    cache5: { enemies: ['deathknight', 'deathknight', 'ashwraith'], waves: [['deathknight']], waveText: ['The cache\'s last guardian stands up out of the ash.'], intro: 'Barrow Knights guard the Warden cache. They have been waiting for somebody to dig.' }
  });
  Object.assign(D.quests, {
    act5: { name: 'The Ash-Ward', short: 'Ash-Ward', ch: 5, done: 3, stages: {
      1: 'A wall of burning cinders stands across the Hollow Barrow\'s gate. It is fed from the ward-pyre of the Cinder Keep, north of the Ashen Road.',
      2: 'The Ash-Marshal is dead and the ward-pyre is out. The Ash-Ward is falling.',
      3: 'The way into the Hollow Barrow is open.' } },
    deserters5: { name: 'The Deserters', short: 'Deserters', ch: 5, done: 2, stages: {
      1: 'Pale Hand deserters are holed up in a ruined chapel in the south of the Ashen Road. Oriel wants them alive, if they will talk.',
      2: 'The deserters are safe in Ashfall, and they talked. Every word was about the King.' } },
    supply5: { name: 'The Supply Wagons', short: 'Supply Wagons', ch: 5, done: 2, stages: {
      1: 'Three supply wagons never reached Ashfall. The quartermaster wants whatever is left of them.',
      2: 'All three wagons are found. Ashfall will eat tonight.' } },
    patrol5: { name: 'The Lost Patrol', short: 'Lost Patrol', ch: 5, done: 2, stages: {
      1: "Captain Hale's scouts went into a cinder cave west of Ashfall and did not come out.",
      2: "Hale's scouts are home. All of them." } },
    wager5: { name: "Grukk's Wager", short: 'Wager', ch: 5, done: 2, stages: {
      1: 'Grukk has bet Nagra that the Wardens can kill the Cinder Brute, the biggest ghoul on the Ashen Road. Nagra has bet they cannot. The stake is a sheep.',
      2: 'The Cinder Brute is dead. Grukk has won a sheep. He has named it after you.' } },
    cache5: { name: 'The Warden Cache', short: 'Warden Cache', ch: 5, done: 2, stages: {
      1: 'Oriel says the last Wardens of the old war buried a cache of lamps and arms by the north cliffs of the Ashen Road.',
      2: 'The cache is open. The old Wardens left their best for whoever came after.' } }
  });
  Object.assign(D.items, {
    pyreheart: { name: 'Pyre-heart', type: 'charm', mods: { pow: 4, dmgBonus: 3 }, price: 1100, desc: 'A coal from the ward-pyre that never cools. Runa keeps it in an iron box.' },
    wardencloak: { name: 'Last Warden\'s Cloak', type: 'armor', for: ['maren', 'finch'], mods: { ac: 8, save: 2, hp: 10 }, price: 1500, desc: 'Grey wool and old mail, from the Warden cache.' },
    ilsabetblade: { name: "Ilsabet's Oath-blade", type: 'weapon', for: ['runa'], dmg: '2d12+1', mods: { atk: 3 }, price: 1600, desc: 'She broke her oath to the Hand. The sword did not mind.' },
    sheep: { name: 'A Sheep', type: 'key', desc: 'Grukk insists you keep it. It is called Dask.' }
  });

  /* ---------- the Ash-Ward stands across the barrow gate until the pyre is out ---------- */
  const gate = M.ashroad.things.z;
  gate.script = [['if', '!act5done', [
    ['if', '!act5', [
      ['note', 'The Hollow Barrow\'s gate is behind a curtain of burning cinders, falling from nowhere, endlessly, like a waterfall of sparks.'],
      ['say', 'Runa', 'I will go through it.'],
      ['say', 'Maren', 'You will come out the other side as ash. It is a ward. Old work, Barrow work.'],
      ['say', 'Dask', 'Wards need feeding. That smoke up on the north cliff, the keep with the fire on its roof. That is a pyre.'],
      ['say', 'Finch', 'One more castle. I can do one more castle.'],
      ['set', 'act5'], ['quest', 'act5', 1]
    ], [['note', 'The Ash-Ward still falls across the gate. Its pyre burns on the roof of the Cinder Keep, to the north.']]],
    ['end']
  ]], ['if', 'q.act5<3', [['note', 'The last cinders drift down and go out. The Hollow Barrow\'s gate stands open, and very dark.'], ['quest', 'act5', 3]]]];

  /* ---------- the Cinder Keep ---------- */
  M.cinderkeep = {
    name: 'The Cinder Keep', ground: 'ash', music: 'ashen', bg: 'ash', dark: 0.45,
    rows: [
      '############################',
      '#......#.......m......#....#',
      '#..c...#.......p......#..d.#',
      '#......#..............#....#',
      '###.########f###########.###',
      '#..........................#',
      '#..a.....,,,,,,,,,.....b...#',
      '#..........................#',
      '#####.#######e#######.######',
      '#.......#..........#.......#',
      '#..h....#....:.....#...g...#',
      '#.......#....x.....#.......#',
      '############################'
    ],
    things: {
      x: { type: 'warp', to: 'ashroad', at: '?', gfx: 'daylight', out: 'down' },
      e: { type: 'foe', sprite: 'palecrusader', dir: 'down', script: [['battle', 'ck_gate'], ['remove']] },
      a: { type: 'foe', sprite: 'ashghoul', dir: 'right', script: [['battle', 'ck_yard'], ['remove']] },
      b: { type: 'foe', sprite: 'palemagus', dir: 'left', script: [['battle', 'ck_magi'], ['remove']] },
      g: { type: 'foe', sprite: 'deathknight', dir: 'left', script: [['battle', 'ck_hall'], ['remove'],
        ['say', 'Maren', 'The dead and the living, fighting side by side. That is what the Hand wanted all along. A kingdom where it does not matter which you are.'],
        ['say', 'Runa', 'It matters to me.']] },
      f: { type: 'foe', sprite: 'deathknight', dir: 'down', script: [['battle', 'ck_stair'], ['remove']] },
      c: { type: 'chest', gold: 420, items: { elixir: 2 } },
      d: { type: 'chest', items: { elixir: 2 }, gold: 380 },
      h: { type: 'obj', gfx: 'table', script: [['if', '!ckOrders', [
        ['note', 'The Marshal\'s orders, under a hammer. "Hold the Ward until the Chancellor has the fourth shard and the King has woken. Then let them in. He wants to see their faces."'],
        ['say', 'Finch', 'He wants to see our faces. That is either very flattering or very frightening.'],
        ['say', 'Dask', 'Frightening. It is always frightening.'],
        ['set', 'ckOrders'], ['xp', 120]
      ], [['note', 'The Marshal\'s orders. You have read them. You did not enjoy them.']]]] },
      m: { type: 'foe', sprite: 'ashmarshal', dir: 'down', script: [
        ['say', 'The Ash-Marshal', 'Wardens. You are late. The King has been awake for a day and a night, and he is asking for you by name.'],
        ['say', 'Runa', 'Then he can wait one more fight.'],
        ['say', 'The Ash-Marshal', 'He does not have to wait. I am the fight.'],
        ['battle', 'ashmarshal'], ['remove'],
        ['note', 'The Marshal falls across the pyre. It hisses, smokes, and for a moment does not go out.'],
        ['set', 'marshalDone'], ['give', 'pyreheart'], ['xp', 120], ['save']
      ] },
      p: { type: 'obj', gfx: 'brazier', script: [['if', 'act5done', [['note', 'The pyre is cold ash.']], [['if', 'marshalDone', [
        ['note', 'Maren lays both hands on the edge of the pyre and speaks the oldest words she knows: not the words for lighting a lamp, but for putting one out.'],
        ['note', 'The fire goes down into the coals, and the coals go grey. Far away, across the road, the Ash-Ward falls.'],
        ['say', 'Maren', 'I have never done that before. I did not like it.'],
        ['say', 'Finch', 'You never have to do it again.'],
        ['set', 'act5done'], ['quest', 'act5', 2], ['xp', 100], ['save']
      ], [['note', 'The ward-pyre, roaring. The Ash-Marshal stands between you and it.']]]]]] }
    }
  };
  M.cinderkeep.things.x.at = D.placeNear('ashroad', null, 30, 2, { tag: 'toKeep', type: 'warp', to: 'cinderkeep', at: 'x', gfx: 'caveMouth', under: 'path', out: 'down' });

  /* ---------- the Hall of Lamps: between the Court of the Dead and the Last Door ---------- */
  M.hollow1.things.z.to = 'lamphall'; M.hollow1.things.z.at = 'x';
  M.hollow2.things.u.to = 'lamphall'; M.hollow2.things.u.at = 'z';
  function wlamp(n, name) {
    return [['if', 'wl5.' + n, [['note', 'The lamp of ' + name + ' burns.']], [
      ['note', 'A cold lamp in a niche. Under it, in letters older than the Barrow: ' + name.toUpperCase() + '.'],
      ['say', 'Maren', name + '. We remember you.'],
      ['note', 'The wick takes. It burns gold, then white.'],
      ['set', 'wl5.' + n], ['xp', 60]
    ]]];
  }
  M.lamphall = {
    name: 'The Hall of Lamps', ground: 'stone', music: 'dungeon', bg: 'throne', dark: 0.82,
    rows: [
      '##########################',
      '##########..z..n##########',
      '##########..k...##########',
      '############y#############',
      '#....#..............#....#',
      '#.1.....a........b.....2.#',
      '#....#..............#....#',
      '######..............######',
      '#....#..............#....#',
      '#.3.....d........e.....4.#',
      '#....#..............#....#',
      '######......x.......######',
      '##########################'
    ],
    things: {
      x: { type: 'warp', to: 'hollow1', at: 'z', gfx: 'stairsUp', out: 'up' },
      z: { type: 'warp', to: 'hollow2', at: 'u', gfx: 'stairsDown', out: 'down' },
      a: { type: 'foe', sprite: 'courtier', dir: 'right', script: [['run', 'lhIntro'], ['battle', 'lh_court'], ['remove']] },
      b: { type: 'foe', sprite: 'deathknight', dir: 'left', script: [['battle', 'lh_knights'], ['remove']] },
      d: { type: 'foe', sprite: 'ashwraith', dir: 'right', script: [['battle', 'lh_eaters'], ['remove']] },
      e: { type: 'foe', sprite: 'ashghoul', dir: 'left', script: [['battle', 'lh_ghouls'], ['remove']] },
      1: { type: 'obj', gfx: 'lampDead', gfxIf: ['wl5.1', 'lamp'], script: wlamp(1, 'Oswin of the Thornwood') },
      2: { type: 'obj', gfx: 'lampDead', gfxIf: ['wl5.2', 'lamp'], script: wlamp(2, 'Corran of the Salt Road') },
      3: { type: 'obj', gfx: 'lampDead', gfxIf: ['wl5.3', 'lamp'], script: wlamp(3, 'Hedda of the High Moor') },
      4: { type: 'obj', gfx: 'lampDead', gfxIf: ['wl5.4', 'lamp'], script: wlamp(4, 'Aldous of the Bridges') },
      n: { type: 'obj', gfx: 'lamp', script: [
        ['note', 'A fifth niche, with no name cut under it. Only a lamp, and the lamp is already lit. Nobody here lit it.'],
        ['say', 'Finch', 'Who is the fifth?'],
        ['say', 'Maren', 'Whoever is still carrying a lamp, I think. Come on.'],
        ['if', '!lhFifth', [['xp', 80], ['set', 'lhFifth']]]
      ] },
      y: { type: 'obj', gfx: 'kingdoor', unless: 'lh.open', script: [['if', 'wl5.1&wl5.2&wl5.3&wl5.4', [
        ['note', 'With four lamps burning, the King\'s door swings open on its own. Light runs up the nave like water.'],
        ['sfx', 'lever'], ['shake', 500], ['set', 'lh.open'], ['remove']
      ], [['note', 'A door with the King\'s face on it, eyes shut. Four empty lamp-hooks hang beside it.'],
        ['say', 'Maren', 'Four lamps, for the four who carried the shards away. Light them, and the door will remember them.']]]] },
      k: { type: 'foe', sprite: 'ashwraith', dir: 'down', script: [
        ['note', 'Something long and grey unwinds out of the dark behind the door. Where it passes, the light goes thin.'],
        ['say', 'Dask', 'That is the mother of all lamp-eaters, isn\'t it.'],
        ['say', 'Maren', 'Then she is about to eat the wrong lamp.'],
        ['battle', 'lampqueen'], ['remove'],
        ['note', 'The Queen comes apart into ash and smoke. The four Warden lamps flare at once, and stay bright.'],
        ['say', 'Runa', 'Down. The Last Door, and then the King.'],
        ['set', 'queenDone'], ['xp', 120], ['save']
      ] }
    }
  };
  D.scripts.lhIntro = [['if', '!lhIntro', [
    ['note', 'The stair from the Court comes out into a long dark nave. Lamp-niches line the walls, every one cold.'],
    ['say', 'Finch', 'They took the light out of the whole Barrow.'],
    ['say', 'Maren', 'Then we put it back. One lamp at a time. That is the only way it is ever done.'],
    ['set', 'lhIntro']
  ]]];
  D.placeNear('lamphall', null, 12, 10, { tag: 'lhCamp', type: 'obj', gfx: 'shrine', script: [['note', 'A Warden\'s camp-niche, older than anything else in the Barrow. Someone has scratched a little lamp on the wall.'], ['run', 'campsite']] });

  /* ================= side work, from Ashfall's muster board ================= */
  D.placeNear('ashfall', null, 22, 16, { tag: 'board5', type: 'sign', gfx: 'notice', script: [
    ['topics', null, 'The muster board. Orders, rosters, and a drawing of a sheep.', [
      ['"DESERTERS" (Oriel)', [['note', 'In Oriel\'s hand: PALE HAND DESERTERS IN THE OLD CHAPEL, SOUTH OF THE ROAD. BRING THEM IN ALIVE. THEY KNOW THE BARROW.'], ['if', '!q.deserters5', [['quest', 'deserters5', 1]]]], 'q.deserters5<2'],
      ['"MISSING WAGONS" (Quartermaster)', [['note', 'THREE SUPPLY WAGONS OVERDUE ON THE ASHEN ROAD. RECOVER THE LOADS. THE QUARTERMASTER IS VERY CROSS.'], ['if', '!q.supply5', [['quest', 'supply5', 1]]]], 'q.supply5<2'],
      ['"LOST PATROL" (Capt. Hale)', [['note', 'MY SCOUTS WENT INTO THE CINDER CAVE WEST OF CAMP. IF THEY ARE ALIVE, BRING THEM HOME. - HALE'], ['if', '!q.patrol5', [['quest', 'patrol5', 1]]]], 'q.patrol5<2'],
      ['"A WAGER" (Grukk)', [['note', 'In goblin, and then in very bad common: GRUKK SAYS WARDENS KILL CINDER BRUTE. NAGRA SAYS NO. LOSER GIVES SHEEP.'], ['if', '!q.wager5', [['quest', 'wager5', 1]]]], 'q.wager5<2'],
      ['"THE WARDEN CACHE" (Oriel)', [['note', 'A map, very old, with a lamp drawn by the north cliffs. Oriel has written under it: STILL THERE? PLEASE LOOK.'], ['if', '!q.cache5', [['quest', 'cache5', 1]]]], 'q.cache5<2']
    ], 'Leave the board']
  ] });

  /* ---------- the deserters ---------- */
  M.ashchapel = {
    name: 'The Ash Chapel', ground: 'stone', music: 'ashen', bg: 'crypt', dark: 0.5,
    rows: [
      '####################',
      '#....#...s......c..#',
      '#.m..#.............#',
      '#....+...b.........#',
      '#....#.............#',
      '##.###.............#',
      '#..........x.......#',
      '####################'
    ],
    things: {
      x: { type: 'warp', to: 'ashroad', at: '?', gfx: 'daylight', out: 'down' },
      b: { type: 'foe', sprite: 'ashghoul', dir: 'down', script: [['battle', 'ds_ghouls'], ['remove']] },
      m: { type: 'npc', sprite: 'mott', dir: 'down', script: [['if', 'q.deserters5=2', [['say', 'Sergeant Mott', 'We are going to Ashfall. Tell Oriel we are sorry. All of us.']], [
        ['say', 'Sergeant Mott', 'You came. Gods, you came. We left when they started feeding the prisoners to the King. We are not good men. But we stopped.'],
        ['say', 'Sergeant Mott', 'The King does not want the crown. He wants the Wardens. Every lamp-bearer who ever lived. He wants the light back in him.'],
        ['set', 'mottTold'], ['xp', 60]
      ]]] },
      s: { type: 'foe', sprite: 'ilsabet', dir: 'down', if: 'mottTold', script: [
        ['say', 'Knight-Captain Ilsabet', 'Mott. I trained you. And now I have to bury you.'],
        ['say', 'Runa', 'Not today.'],
        ['battle', 'ds_hunters'], ['battle', 'ilsabet'], ['remove'],
        ['note', 'Ilsabet kneels in the ash. She holds out her sword, hilt first.'],
        ['say', 'Knight-Captain Ilsabet', 'I swore to the Hand at fifteen. I am done swearing. Take it.'],
        ['quest', 'deserters5', 2], ['gold', 400], ['give', 'ilsabetblade'], ['xp', 900]
      ] },
      c: { type: 'chest', gold: 500, items: { elixir: 2 } }
    }
  };
  M.ashchapel.things.x.at = D.placeNear('ashroad', null, 6, 26, { tag: 'toChapel5', type: 'warp', to: 'ashchapel', at: 'x', gfx: 'doorStone', under: 'path', out: 'up', if: 'q.deserters5>=1' });

  /* ---------- the supply wagons ---------- */
  [['1', 12, 4], ['2', 34, 20], ['3', 24, 26]].forEach(([n, x, y]) => D.placeNear('ashroad', null, x, y, { tag: 'wagon' + n, type: 'obj', gfx: 'barrel', if: 'q.supply5=1&!wagon.' + n, script: [
    ['note', 'A supply wagon on its side, crates split open, and things feeding in the wreck.'],
    ['battle', 'sp_wagon'], ['set', 'wagon.' + n], ['add', 'wagonsFound'], ['xp', 120],
    ['if', 'wagonsFound=3', [['quest', 'supply5', 2], ['note', 'You mark the last wagon for the carters. The quartermaster will send oxen.'], ['gold', 450], ['give', 'elixir', 3], ['xp', 520]]],
    ['remove']
  ] }));

  /* ---------- the lost patrol ---------- */
  M.cindercave = {
    name: 'The Cinder Cave', ground: 'cave', music: 'dungeon', bg: 'cave', dark: 0.7,
    rows: [
      '######################',
      '#...c####......s######',
      '#.........b.....######',
      '#...######.......#####',
      '###.######.###########',
      '###...a....###########',
      '#########.############',
      '#########.x.##########',
      '######################'
    ],
    things: {
      x: { type: 'warp', to: 'ashfall', at: '?', gfx: 'daylight', out: 'up' },
      a: { type: 'foe', sprite: 'ashwraith', dir: 'right', script: [['battle', 'pt_mouth'], ['remove']] },
      b: { type: 'foe', sprite: 'deathknight', dir: 'down', script: [['battle', 'pt_deep'], ['remove']] },
      s: { type: 'npc', sprite: 'soldier', dir: 'down', script: [['if', 'q.patrol5=2', [['say', 'Scout', 'Home. We are going home.']], [
        ['note', 'Five scouts, back to back around one guttering lantern. When they see Maren\'s lamp, two of them start crying.'],
        ['say', 'Scout', 'We thought it was the King\'s light. Coming to get us. Then it was you.'],
        ['quest', 'patrol5', 2], ['gold', 400], ['give', 'elixir', 2], ['xp', 900]
      ]]] },
      c: { type: 'chest', gold: 450, items: { elixir: 1 } }
    }
  };
  M.cindercave.things.x.at = D.placeNear('ashfall', null, 2, 24, { tag: 'toCave5', type: 'warp', to: 'cindercave', at: 'x', gfx: 'caveMouth', under: 'path', out: 'down', if: 'q.patrol5>=1' });

  /* ---------- Grukk's wager ---------- */
  D.placeNear('ashroad', null, 44, 24, { tag: 'brute', type: 'foe', sprite: 'ashghoul', dir: 'left', if: 'q.wager5=1', script: [
    ['note', 'The Cinder Brute is eating a cart. Not what was in the cart. The cart.'],
    ['battle', 'cinderbrute'], ['quest', 'wager5', 2], ['set', 'bruteDone'], ['xp', 600], ['remove'],
    ['note', 'Back at camp, Grukk wins his sheep and gives it to you with enormous ceremony. It is called Dask.'],
    ['say', 'Dask', 'Why is it called Dask?'],
    ['say', 'Grukk', 'Because it is small and it bites.'],
    ['give', 'sheep'], ['gold', 300]
  ] });

  /* ---------- the Warden cache ---------- */
  D.placeNear('ashroad', null, 44, 4, { tag: 'cache5', type: 'obj', gfx: 'graveOpen', if: 'q.cache5=1', script: [
    ['note', 'A Warden lamp is cut into the cliff, so worn you can only see it with your fingers. Below it, the ash is loose.'],
    ['battle', 'cache5'],
    ['note', 'Under the ash: a stone box, and in it, oiled and wrapped, the arms of the last Wardens of the old war. And a note: FOR WHOEVER COMES AFTER. LIGHT THEM ALL.'],
    ['say', 'Maren', 'They knew someone would come. They just did not know it would be us.'],
    ['quest', 'cache5', 2], ['give', 'wardencloak'], ['give', 'fivelamps'], ['gold', 500], ['xp', 900], ['remove']
  ] });
})();
