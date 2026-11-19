/* Chapter 1, expanded.
   Main story: The Toll Road (quest act1). The Thane's Barrow is sealed with a stone wheel and a goblin padlock; the
   key is with Snagtooth, who has taken Teague's mill east of the forest road and charges the valley a toll in
   Pale Hand silver. Clearing the mill opens the barrow (flag act1done).
   Side quests: Teague's Grain (millgrain), Hobb's Old Tower (oldtower), Where Is Tam? (tam), Pell's Lanterns (lanterns).
   Flags: act1, act1done, millFree, teagueHome, grain.<n>, towerDone, tamFound, tamHome, lantern.<n>, lanternsDone. */
(function () {
  const D = G.D, M = D.maps;
  (D.xpScale = D.xpScale || {})[1] = 0.41;
  Object.assign(D.speakers, { Teague: '#d8c090', Snagtooth: '#9ad04a', 'Tolan Vosk': '#c8a070', Tam: '#f0c8a0' });
  Object.assign(D.sprites, {
    snagtooth: { skin: '#6a9a3a', bald: 1, ears: 1, eyes: '#ffe14a', top: '#5a3a2a', legs: '#3a2a22', trim: '#c8c8d4' },
    teague: { skin: '#e0b090', hair: '#d8d0c0', top: '#8a7a5a', legs: '#4a3b2e' },
    haskv: { skin: '#d89a70', hair: '#6b3f2a', top: '#5a2a2a', legs: '#2a2a30' }
  });
  Object.assign(D.looks, {
    snagtooth: { short: 1, held: 'club', fur: '#6a4a2a', scar: 1 },
    teague: { apron: '#e8e0cc', mus: 1, cap: '#8a5a3a', big: 1 },
    haskv: { held: 'axe', goatee: 1, scar: 1, belt: '#2a2a30' }
  });
  Object.assign(D.enemies, {
    snagtooth: { name: 'Snagtooth the Toll-Keeper', sprite: 'snagtooth', hp: 58, ac: 13, atk: 5, dmg: '1d8+2', spd: 2, save: 2, xp: 60, gold: [20, 20], tags: ['goblin'], moves: [[3, 'attack'], [1, 'savage']] },
    cutthroat1: { name: 'Vosk Cutthroat', sprite: 'cutthroat', hp: 18, ac: 12, atk: 4, dmg: '1d6+2', spd: 3, save: 1, xp: 15, gold: [4, 9], tags: ['human'] },
    haskv: { name: 'Tolan Vosk', sprite: 'haskv', hp: 55, ac: 13, atk: 5, dmg: '1d8+2', spd: 1, save: 2, xp: 45, gold: [25, 25], tags: ['human'], moves: [[3, 'attack'], [1, 'headbutt']] },
    churchdead: { name: 'Restless Dead', sprite: 'skeleton', hp: 22, ac: 12, atk: 4, dmg: '1d6+2', spd: 1, save: 1, xp: 18, gold: [0, 3], tags: ['undead'], immune: ['asleep', 'poison'] }
  });
  Object.assign(D.groups, {
    mill_gate: { enemies: ['goblin', 'archer'], intro: 'Two goblins at the toll-rope: "Pay or play!"' },
    mill_yard: { enemies: ['goblin', 'goblin', 'archer'], intro: 'The yard goblins drop their dice and grab their spears.' },
    mill_dogs: { enemies: ['wolf', 'goblin', 'wolf'], intro: 'Goblin wolf-handlers slip their leashes.' },
    mill_hex: { enemies: ['hexer', 'goblin'], waves: [['archer', 'goblin']], waveText: ['More goblins pour out of the grain store!'], intro: 'A hexer is counting silver at a table. She does not like being interrupted.' },
    snagtooth: { enemies: ['archer', 'snagtooth', 'goblin'], waves: [['goblin']], waveText: ['Snagtooth bellows, and another goblin comes running from the wheel-house.'], boss: true, intro: 'Snagtooth hefts a club studded with toll-coins.' },
    tower_low: { enemies: ['cutthroat1', 'cutthroat1'], intro: 'Two Vosk cousins look up from a dice game.' },
    tower_mid: { enemies: ['cutthroat1', 'bruiser', 'cutthroat1'], intro: '"Tolan! Company!"' },
    tower_top: { enemies: ['cutthroat1', 'haskv'], boss: true, intro: 'Tolan Vosk, Brannoc\'s cousin, kicks over his chair.' },
    tam_wolves: { enemies: ['wolf', 'wolf'], intro: 'Two wolves have the boy treed. They turn.' },
    church_dead: { enemies: ['churchdead', 'churchdead'], intro: 'The graves stir. Without the lanterns, the dead do not stay down.' },
    church_last: { enemies: ['churchdead', 'revenant', 'churchdead'], intro: 'Something heavier pushes up through the earth by the old yew.' }
  });
  Object.assign(D.quests, {
    act1: { name: 'The Toll Road', short: 'Toll Road', done: 3, stages: {
      1: "The Thane's Barrow is sealed: a stone wheel with a goblin padlock through it. The goblins who hold the old mill east of Thornwood's road will have the key.",
      2: "Snagtooth is beaten and the key is yours. The barrow door can be opened.",
      3: "The barrow is open." } },
    millgrain: { name: "Teague's Grain", short: "Teague's Grain", done: 2, stages: {
      1: 'Teague the miller wants his four sacks of seed-grain back from around the mill before the goblins eat them.',
      2: 'Teague has his seed-grain. Brackenford will have bread next winter.' } },
    oldtower: { name: "Hobb's Old Tower", short: 'Old Tower', done: 2, stages: {
      1: "Hobb says lights burn at night in the old watchtower in north-west Thornwood, and it has been empty for twenty years. He suspects Vosks.",
      2: 'Tolan Vosk is done hiding in the old tower. Hobb will want to know.' } },
    tam: { name: 'Where Is Tam?', short: 'Where Is Tam?', done: 3, stages: {
      1: "Tam's mother says he has gone into Thornwood to find 'the goblin with a spade'. He is eight.",
      2: 'Tam is safe, if muddy. Walk him home to Brackenford.',
      3: 'Tam is home, and has promised never to do it again. Twice.' } },
    lanterns: { name: "Pell's Lanterns", short: 'Lanterns', done: 2, stages: {
      1: "Old Pell says the three grave-lanterns in Brackenford's churchyard have gone out, and the dead are restless without them. Relight them.",
      2: 'The churchyard lanterns burn again.' } }
  });

  /* ---------- the barrow is sealed until the mill is cleared ---------- */
  const door = M.thornwood.things.e;
  door.script = [['if', '!act1done', [
    ['if', '!act1', [
      ['note', "The barrow mouth is shut with a round stone the size of a cart wheel. Someone has bolted it with a new iron hasp and a heavy goblin padlock."],
      ['say', 'Dask', 'I could pick that. In about a week. That lock is mostly rust and spite.'],
      ['say', 'Runa', 'The goblins locked it. So the goblins have the key.'],
      ['say', 'Maren', 'Hobb said they have taken the old mill east of the road and charge a toll. Grey silver, he said.'],
      ['set', 'act1'], ['quest', 'act1', 1]
    ], [['note', "The goblin padlock holds. The key is at the mill, east of the forest road."]]],
    ['end']
  ]]];

  /* ---------- Teague's mill ---------- */
  M.mill = {
    name: "Teague's Mill", ground: 'grass', ground2: 'flowers', music: 'field', bg: 'forest',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TT.......FFFFFFFFFFF..~~...TTTTT',
      'T........F.?...?...F..~~....TTTT',
      'T...,....F.........F..~~.....TTT',
      'T........F.........F..==......TT',
      'w:::::d:::::a::::::b:::==::::.TT',
      'T........F.........F..~~......TT',
      'T...c....F.U.X.....F..~~.^^^^^.T',
      'T........FFFF.:FFFFF..~~.^^^^^.T',
      'TT............:.......~~hWWNWW.T',
      'TT............:.......~~.WWWWW.T',
      'TT............:...g...~~..m.e..T',
      'TTT.....?.....:.......~~.......T',
      'TT...U..X.....:.......~~...z...T',
      'TT............:...,...~~.......T',
      'TTT....1......:.......~~.U.X.2.T',
      'TTTT..........:...3...~~......TT',
      'TTTTTT.......4:.......~~.....TTT',
      'TTTTTTTTT.....:.......~~..TTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    things: {
      w: { type: 'warp', to: 'thornwood', at: '?', gfx: 'path', under: 'path', out: 'right' },
      a: { type: 'foe', sprite: 'goblin', dir: 'down', script: [['battle', 'mill_gate'], ['remove']] },
      b: { type: 'foe', sprite: 'archer', dir: 'left', script: [['battle', 'mill_yard'], ['remove']] },
      d: { type: 'foe', sprite: 'wolf', dir: 'right', script: [['battle', 'mill_dogs'], ['remove']] },
      h: { type: 'foe', sprite: 'hexer', dir: 'down', script: [
        ['battle', 'mill_hex'], ['remove'],
        ['note', 'On the hexer\'s table: a heap of grey silver, and a slip of paper in a clerk\'s neat hand.'],
        ['say', 'Finch', '"Received of the bearer, for passage of the Thane\'s road and the key to the same: forty marks. Orrin and Sons, Highmoor."'],
        ['say', 'Dask', 'Orrin and Sons. Of course it is Orrin and Sons.'],
        ['gold', 40], ['set', 'millReceipt']
      ] },
      c: { type: 'chest', items: { draught: 2 }, gold: 15 },
      g: { type: 'npc', sprite: 'goblin', dir: 'down', if: '!millFree', script: [['note', 'A goblin is asleep against the grain store, snoring like a saw. He wakes, sees four faces, and goes back to sleep on purpose.'], ['say', 'Finch', 'Leave him. Professional courtesy.']] },
      m: { type: 'npc', sprite: 'teague', dir: 'down', script: [['if', 'millFree', [
        ['if', 'q.millgrain=1', [['if', 'item.seedgrain>=4', [
          ['say', 'Teague', 'All four! You have saved more than a mill. You have saved next year.'], ['take', 'seedgrain', 4], ['gold', 30], ['give', 'draught', 2], ['xp', 40], ['quest', 'millgrain', 2]
        ], [['say', 'Teague', 'Four sacks, marked with a T. The goblins dragged them all over the yard.']]]], [
          ['if', '!q.millgrain', [
            ['say', 'Teague', 'My seed-grain. Four sacks of it, scattered about the place. If the goblins eat it there is no planting in spring.'],
            ['quest', 'millgrain', 1]
          ], [['say', 'Teague', 'Thank you again. Bread for the valley, and the wheel turning. That is a good day.']]]
        ]]
      ], [
        ['note', 'A big man with flour in his beard is tied to the mill wheel\'s axle, very angry about it.'],
        ['say', 'Teague', 'Snagtooth has the key you want. He also has my mill, my dog and my good hat. Get them back. Not necessarily in that order.']
      ]]] },
      z: { type: 'foe', sprite: 'snagtooth', dir: 'left', script: [
        ['say', 'Snagtooth', 'Toll! Toll for the road, toll for the bridge, toll for breathing. Big toll for four.'],
        ['say', 'Runa', 'We will pay in full.'],
        ['battle', 'snagtooth'], ['remove'],
        ['note', 'Snagtooth drops a ring of keys, one heavy and old, the bow shaped like a little stone wheel.'],
        ['say', 'Maren', "The Thane's seal-key. The Wardens made these, long ago. How did a goblin come to have it?"],
        ['if', 'millReceipt', [['say', 'Dask', 'Somebody in Highmoor sold it to him. Forty marks. We have the receipt.']], [['say', 'Dask', 'Somebody gave it to him. Goblins do not find things like that. They are given them.']]],
        ['note', 'You cut Teague loose. He is a big man and stands up all at once.'],
        ['say', 'Teague', 'My mill. My hat! Good. Go on to your barrow. If you are back this way, I will have work for you, and bread.'],
        ['set', 'millFree'], ['set', 'act1done'], ['quest', 'act1', 2], ['give', 'sealkey'], ['xp', 60], ['save']
      ] },
      e: { type: 'chest', items: { acorncharm: 1 }, if: 'millFree' },
      1: { type: 'obj', gfx: 'sack', script: [['run', 'grainSack']] },
      2: { type: 'obj', gfx: 'sack', script: [['run', 'grainSack']] },
      3: { type: 'obj', gfx: 'sack', script: [['run', 'grainSack']] },
      4: { type: 'obj', gfx: 'sack', script: [['run', 'grainSack']] }
    }
  };
  D.scripts.grainSack = [['if', 'q.millgrain=1', [['note', 'A sack of seed-grain, marked with a T. You heave it onto your shoulder.'], ['give', 'seedgrain'], ['remove']],
    [['note', 'A heavy sack of grain, marked with a T. Not yours.']]]];
  M.mill.things.w.at = D.placeNear('thornwood', null, 41, 12, { tag: 'toMill', type: 'warp', to: 'mill', at: 'w', gfx: 'path', under: 'path', out: 'left' });
  D.carve('thornwood', 31, 11, 34, 11);                 // the mill road: through the trees from the forest track to the mill gate
  D.placeNear('thornwood', null, 40, 9, { type: 'sign', gfx: 'notice', text: "EAST TO TEAGUE'S MILL. Underneath, in charcoal: TOLL. PAY GOBLINS. NO REFUND." });
  // the barrow opens once the key is in hand
  D.scripts.openBarrow = [['quest', 'act1', 3]];

  /* ---------- Hobb's old watchtower ---------- */
  M.oldtower = {
    name: 'The Old Watchtower', ground: 'stone', music: 'dungeon', bg: 'city', dark: 0.55,
    rows: [
      '##################',
      '#....#.......#...#',
      '#.a..#...b...#.c.#',
      '#....#.......#...#',
      '##.###.......##.##',
      '#.......A..A.....#',
      '#..U.........X...#',
      '#.......d........#',
      '##.###...+...###.#',
      '#....#.......#...#',
      '#.e..#...u...#.f.#',
      '#....#.......#...#',
      '##################'
    ],
    things: {
      u: { type: 'warp', to: 'thornwood', at: '?', gfx: 'stairsDown', out: 'up' },
      a: { type: 'foe', sprite: 'cutthroat', dir: 'down', script: [['battle', 'tower_low'], ['remove']] },
      d: { type: 'foe', sprite: 'bruiser', dir: 'up', script: [['battle', 'tower_mid'], ['remove']] },
      b: { type: 'foe', sprite: 'haskv', dir: 'down', script: [
        ['say', 'Tolan Vosk', "Brannoc's errand-runners. He said you would come sniffing. He said bring him your heads."],
        ['say', 'Finch', 'Everyone wants our heads. It is very flattering.'],
        ['battle', 'tower_top'], ['remove'],
        ['note', "Tolan's table is covered in stolen post. Among it, a letter in grey wax for Brannoc: the Thane's barrow, the shard, and a price."],
        ['set', 'towerDone'], ['quest', 'oldtower', 2], ['xp', 40], ['gold', 35]
      ] },
      c: { type: 'chest', items: { hunterscloak: 1 } },
      e: { type: 'chest', items: { tonic: 2 }, gold: 20 },
      f: { type: 'chest', items: { draught: 2 } }
    }
  };
  M.oldtower.things.u.at = D.placeNear('thornwood', null, 6, 9, { tag: 'toTower', type: 'warp', to: 'oldtower', at: 'u', gfx: 'stairsUp', under: 'path', out: 'down', if: 'q.oldtower>=1' });

  /* ---------- Tam ---------- */
  D.placeNear('thornwood', null, 28, 20, { tag: 'tam', type: 'npc', sprite: 'tam', dir: 'up', if: 'q.tam=1', script: [
    ['note', 'A small boy is up an oak, very pleased with himself, while wolves circle underneath.'],
    ['say', 'Tam', 'I found the goblin with the spade! Well, his footprints. Then the dogs found me.'],
    ['battle', 'tam_wolves'],
    ['say', 'Tam', 'Are you real heroes? Mum says heroes are mostly a tax.'],
    ['say', 'Maren', 'Your mum is a wise woman. Home, now.'],
    ['note', 'You walk Tam home. Wenna cries, scolds him, and cries again, in that order.'],
    ['set', 'tamFound'], ['remove'], ['xp', 25], ['run', 'tamHome']
  ] });

  /* ---------- the churchyard lanterns ---------- */
  [['1', 6], ['2', 9], ['3', 12]].forEach(([n, x]) => D.placeNear('brackenford', null, x, 23, { tag: 'lantern' + n,
    type: 'obj', gfx: 'lampDead', gfxIf: ['lantern.' + n, 'lamp'], script: [['if', 'lantern.' + n, [['note', 'The grave-lantern burns.']], [
      ['if', 'q.lanterns>=1', [
        ['note', 'Maren cups the wick and speaks the old words. The flame takes.'],
        ['set', 'lantern.' + n], ['add', 'lanternsLit'],
        ['if', 'lanternsLit=2', [['battle', 'church_dead']]],
        ['if', 'lanternsLit=3', [['battle', 'church_last'], ['set', 'lanternsDone'], ['quest', 'lanterns', 2], ['xp', 45], ['gold', 30], ['give', 'lampcharm'], ['say', 'Maren', 'There. Sleep, all of you. We will keep the light.']]]
      ], [['note', 'A grave-lantern, cold and dark.']]]
    ]]]
  }));

  /* ---------- the notice board in Brackenford: where the side jobs start ---------- */
  D.placeNear('brackenford', null, 20, 14, { tag: 'board1', type: 'sign', gfx: 'notice', script: [
    ['topics', null, 'The village notice board. Most of it is about a lost goat.', [
      ['"LIGHTS IN THE OLD TOWER" (Hobb)', [['note', "In Hobb's square capitals: LIGHTS AT NIGHT IN THE OLD WATCHTOWER, NORTH-WEST WOOD. NOBODY LIVES THERE. I SUSPECT VOSKS. REWARD."], ['if', '!q.oldtower', [['quest', 'oldtower', 1]]]], '!towerDone'],
      ['"TAM IS MISSING" (Wenna)', [['note', "In a hurried hand: TAM HAS GONE INTO THE WOOD AFTER A GOBLIN WITH A SPADE. HE IS EIGHT. PLEASE. - WENNA"], ['if', '!q.tam', [['quest', 'tam', 1]]]], '!tamFound&joined'],
      ['"THE CHURCHYARD LANTERNS" (Pell)', [['note', "Old Pell's spidery writing: THE THREE GRAVE-LANTERNS ARE OUT. THE DEAD ARE RESTLESS WITHOUT THEM. A WARDEN COULD LIGHT THEM. I CANNOT, ANY MORE."], ['if', '!q.lanterns', [['quest', 'lanterns', 1]]]], '!lanternsDone&joined']
    ], 'Leave the board']
  ] });
  // Tam goes home with you
  D.scripts.tamHome = [['quest', 'tam', 3], ['set', 'tamHome'], ['give', 'luckycoin'], ['gold', 15]];

  Object.assign(D.items, {
    seedgrain: { name: 'Seed-grain', type: 'key', desc: "A sack of Teague's seed-grain, marked with a T." },
    sealkey: { name: "Thane's Seal-key", type: 'key', desc: 'An old Warden key, its bow shaped like a little stone wheel. It opens the Thane\'s Barrow.' },
    acorncharm: { name: 'Oak-heart Charm', type: 'charm', mods: { hp: 6 }, price: 60, desc: "Teague's lucky acorn, carved by his grandmother. +6 HP." },
    hunterscloak: { name: "Hunter's Cloak", type: 'armor', for: ['dask', 'finch'], mods: { ac: 3 }, price: 70, desc: 'A green cloak that smells of the wood. Taken from the Vosks.' }
  });

  /* ================= more of the main story ================= */
  Object.assign(D.speakers, { 'Grey Courier': '#b8bcc8', 'The Keeper': '#c8d0e0', Nubbin: '#8ac04a', Wenna: '#e0b8a0' });
  Object.assign(D.sprites, {
    greycourier: { skin: '#e0b090', hair: '#3a3028', top: '#8a8c94', legs: '#4a4c54', robe: 1, hood: '#9a9ca4', trim: '#e8e8f0' },
    keeper: { skel: 1 },
    nubbin: { skin: '#7ab85a', bald: 1, ears: 1, eyes: '#ffe14a', top: '#6a5030', legs: '#3a3028', hat: '#8a6a3a' }
  });
  Object.assign(D.looks, { greycourier: { held: 'staff', cape: '#7a7c84' }, nubbin: { held: 'spade', short: 1 } });
  Object.assign(D.enemies, {
    greycourier: { name: 'Grey Courier', sprite: 'greycourier', hp: 24, ac: 12, atk: 4, dmg: '1d6+2', pow: 3, spd: 3, save: 2, range: 5, xp: 22, gold: [8, 14], tags: ['human'], moves: [[2, 'attack'], [2, 'spark'], [1, 'hex']], loot: [['tonic', 0.3]] },
    bonewarden: { name: 'Bone Warden', sprite: 'skeleton', hp: 30, ac: 14, atk: 5, dmg: '1d8+2', spd: 1, save: 2, xp: 26, gold: [0, 4], tags: ['undead'], immune: ['asleep', 'poison'], moves: [[3, 'attack'], [1, 'headbutt']] },
    digger: { name: 'Goblin Digger', sprite: 'goblin', hp: 15, ac: 11, atk: 4, dmg: '1d6+1', spd: 2, save: 0, xp: 11, gold: [3, 8], tags: ['goblin'] },
    keeper: { name: 'The Ossuary Keeper', sprite: 'keeper', scale: 3, hp: 58, ac: 13, atk: 5, dmg: '1d8+2', pow: 3, spd: 1, save: 3, xp: 70, gold: [30, 30], tags: ['undead'], immune: ['asleep', 'poison'], moves: [[3, 'attack'], [1, 'headbutt'], [1, 'hex']] },
    oneear: { name: 'Old One-Ear', sprite: 'alpha', hp: 60, ac: 13, atk: 6, dmg: '1d8+3', spd: 4, save: 2, xp: 50, gold: [0, 0], tags: ['beast'], moves: [[3, 'attack'], [2, 'savage']], loot: [['pelt', 1]] },
    rattlejack: { name: 'Rattle Jack', sprite: 'haskv', hp: 50, ac: 13, atk: 5, dmg: '1d8+2', spd: 3, save: 2, xp: 45, gold: [40, 40], tags: ['human'], moves: [[3, 'attack'], [1, 'headbutt']] }
  });
  Object.assign(D.groups, {
    courier: { enemies: ['greycourier', 'cutthroat1', 'cutthroat1'], waves: [['greycourier', 'bruiser']], waveText: ['A second grey cloak steps out of the trees.'], intro: 'Grey cloaks step out from behind the barrow stones.' },
    oss_door: { enemies: ['skeleton', 'skeleton'], intro: 'The dead at the door rise to ask their question. They do not wait for an answer.' },
    oss_spiders: { enemies: ['spider', 'spider', 'spider'], intro: 'The niches are full of webs, and the webs are full of legs.' },
    oss_diggers: { enemies: ['digger', 'hexer', 'digger'], waves: [['digger', 'archer']], waveText: ['More diggers scramble up out of their trench.'], intro: 'Goblins with spades and sacks are digging up the floor of the dead.' },
    oss_wardens: { enemies: ['bonewarden', 'bonewarden'], waves: [['skeleton']], waveText: ['A third alcove grinds open.'], intro: 'Two armoured dead step out of their alcoves and raise their swords in salute. Then they attack.' },
    oss_hall: { enemies: ['skeleton', 'spider', 'bonewarden'], intro: 'The last chamber is not empty.' },
    oss_courier: { enemies: ['digger', 'greycourier', 'digger'], intro: 'The grey courier who ran has found another way down. He has brought help.' },
    keeper: { enemies: ['bonewarden', 'keeper', 'skeleton'], waves: [['bonewarden']], waveText: ['The Keeper raises its lantern, and another Warden answers.'], boss: true, intro: 'The Keeper lifts a lantern of green fire and a sword as long as a door.' },
    dig_mouth: { enemies: ['digger', 'digger', 'archer'], intro: 'Goblins in hard hats of upturned pots. They look very busy.' },
    dig_deep: { enemies: ['spider', 'digger', 'spider'], intro: 'The tunnel has broken into a spider nest. The goblins are losing.' },
    bristle: { enemies: ['wolf', 'wolf'], waves: [['alpha']], waveText: ['A bigger shape pushes out of the den.'], intro: 'Wolves round the den. Somewhere inside, a dog is barking itself hoarse.' },
    oneear: { enemies: ['wolf', 'oneear', 'wolf'], boss: true, intro: 'Old One-Ear: grey, scarred and as big as a pony. The bounty is ten years old.' },
    rattlejack: { enemies: ['cutthroat1', 'rattlejack', 'bruiser'], boss: true, intro: '"Rattle Jack!" he shouts, as if you had asked.' }
  });
  Object.assign(D.quests, {
    dig: { name: 'The Goblin with the Spade', short: 'Goblin Dig', done: 3, stages: {
      1: "Tam's 'goblin with a spade' is real. His tracks lead to a fresh dig in the hillside south of the Thornwood road.",
      2: 'Nubbin the digger has been paid to dig for Warden stones. He knows who paid him. Tell Hobb.',
      3: 'Hobb has the name of the buyer: a grey cloak with a Highmoor accent.' } },
    bristle: { name: 'Bristle', short: 'Bristle', done: 2, stages: {
      1: "Teague's dog Bristle was dragged off by wolves to a den in the south-east of Thornwood.",
      2: 'Bristle is home, and has eaten an entire loaf as a reward.' } },
    bounty1: { name: 'The Brackenford Bounties', short: 'Bounties', done: 3, stages: {
      1: 'Two old bounties on the notice board: Old One-Ear, a wolf, and Rattle Jack, a bandit. Both somewhere in Thornwood.',
      2: 'One bounty down, one to go.',
      3: 'Both bounties are paid. Hobb has run out of drawing pins.' } }
  });

  /* ---------- the grey couriers: they want the seal-key ---------- */
  door.script = [['if', 'act1done&!courierDone', [
    ['note', 'At the barrow mouth, someone is waiting. Three someones, in travelling grey.'],
    ['say', 'Grey Courier', 'The key, please. It was bought and paid for. Forty marks. We have a receipt.'],
    ['if', 'millReceipt', [['say', 'Finch', 'So do we. We found it on a goblin. Shall we compare?']], [['say', 'Finch', 'Bought from whom? The goblins were very vague about it. Mainly because they were unconscious.']]],
    ['say', 'Grey Courier', 'The Open Hand does not argue with tradesmen. It collects.'],
    ['say', 'Maren', "You wear the Warden grey. You have no right to it."],
    ['say', 'Grey Courier', 'Neither do you, little lamp-girl. The Wardens are dead. We are what came after them.'],
    ['battle', 'courier'],
    ['note', 'The last courier drops his staff and is gone into the trees, faster than a man in a long coat has any right to be.'],
    ['say', 'Runa', '"What came after." Maren, who are they?'],
    ['say', 'Maren', 'I do not know. But they know the grey, and they know the old words. Please. Open the door.'],
    ['set', 'courierDone'], ['set', 'knowsGrey'], ['xp', 30]
  ]]].concat(door.script);
  door.script.push(['if', 'q.act1<3', [['note', 'The seal-key turns with a sound like a millstone. The stone wheel rolls aside.'], ['run', 'openBarrow']]]);

  /* ---------- the Warden Ossuary: between the two barrow levels ---------- */
  M.barrow1.things.z.to = 'ossuary'; M.barrow1.things.z.at = 'u';
  M.barrow2.things.u.to = 'ossuary'; M.barrow2.things.u.at = 'z';
  function plaque(n, name, line) {
    return [['if', 'plaque.' + n, [['note', name + '.']], [
      ['note', 'A name-plaque, half hidden under dust: ' + name + '. ' + line],
      ['say', 'Maren', 'I will remember it.'], ['set', 'plaque.' + n], ['xp', 10]
    ]]];
  }
  M.ossuary = {
    name: 'The Warden Ossuary', ground: 'stone', music: 'dungeon', bg: 'crypt', dark: 0.84,
    rows: [
      '##########################',
      '#########.........########',
      '#########....z....########',
      '#########.........########',
      '#########....k....########',
      '###########..y..##########',
      '#############g############',
      '#......###.......###.....#',
      '#..1...###...c...###..2..#',
      '#..........d.........b...#',
      '#......###.......###.....#',
      '#########.........########',
      '###########..e..##########',
      '#....####.........####...#',
      '#..3...f.....a.......h...#',
      '#....####.........####...#',
      '#############u############',
      '##########################'
    ],
    things: {
      u: { type: 'warp', to: 'barrow1', at: 'z', gfx: 'stairsUp', out: 'up' },
      z: { type: 'warp', to: 'barrow2', at: 'u', gfx: 'stairsDown', out: 'down' },
      a: { type: 'foe', sprite: 'skeleton', dir: 'down', script: [['battle', 'oss_door'], ['remove'], ['run', 'ossIntro']] },
      f: { type: 'foe', sprite: 'spider', dir: 'right', script: [['battle', 'oss_spiders'], ['remove']] },
      d: { type: 'foe', sprite: 'goblin', dir: 'down', script: [['battle', 'oss_diggers'], ['remove'],
        ['note', 'The diggers have been prising name-stones out of the walls and stacking them in sacks. Each sack has a grey wax seal.'],
        ['say', 'Dask', 'Somebody is buying dead Wardens by the sackful.'],
        ['say', 'Maren', 'Not the dead. Their names. You cannot open a Warden door without the names.']] },
      c: { type: 'foe', sprite: 'skeleton', dir: 'down', script: [['battle', 'oss_wardens'], ['remove']] },
      b: { type: 'foe', sprite: 'skeleton', dir: 'left', script: [['battle', 'oss_hall'], ['remove']] },
      e: { type: 'obj', gfx: 'statue', script: [
        ['note', 'A Warden in stone, holding a lantern in one hand and a closed fist in the other.'],
        ['say', 'Maren', '"When the King under the Hill was broken, his crown was broken with him, in five pieces. Five Wardens took one each, and went five ways, and were not to speak of it again."'],
        ['say', 'Finch', 'And then one of them wrote it on a statue.'],
        ['say', 'Maren', 'Wardens were never very good at secrets. Only at keeping things.'],
        ['if', '!ossLore', [['xp', 15], ['set', 'ossLore']]]
      ] },
      1: { type: 'obj', gfx: 'runeBlank', gfxIf: ['plaque.1', 'grave'], script: plaque(1, 'HEDDA OF THE HIGH MOOR', 'She carried the second piece north and was never seen again.') },
      2: { type: 'obj', gfx: 'runeBlank', gfxIf: ['plaque.2', 'grave'], script: plaque(2, 'CORRAN OF THE SALT ROAD', 'He took his piece to the sea, and the sea kept it.') },
      3: { type: 'obj', gfx: 'runeBlank', gfxIf: ['plaque.3', 'grave'], script: plaque(3, 'OSWIN OF THE THORNWOOD', 'He came home, and lay down here, and asked to be forgotten.') },
      h: { type: 'chest', gold: 40, items: { tonic: 2, flask: 1 } },
      g: { type: 'obj', gfx: 'doorStone', unless: 'ossGate', script: [['if', 'plaque.1&plaque.2&plaque.3', [
        ['note', 'Maren lays her palm on the door and says the three names in order: Hedda. Corran. Oswin.'],
        ['sfx', 'lever'], ['shake', 400], ['note', 'The stone door sinks into the floor.'], ['set', 'ossGate'], ['remove']
      ], [['note', 'A door with no handle. Three name-shapes are cut into it, and they are empty.'],
        ['say', 'Maren', 'It wants the names of the Wardens laid here. They will be written somewhere in the ossuary.']]]] },
      y: { type: 'foe', sprite: 'greycourier', dir: 'down', script: [
        ['say', 'Grey Courier', 'You again. You do not even know what you are carrying, do you?'],
        ['say', 'Maren', 'A fifth of a crown. And a reason to keep it from people like you.'],
        ['say', 'Grey Courier', 'People like me. Lamp-girl, there is no one like us. Not yet.'],
        ['battle', 'oss_courier'], ['remove'],
        ['note', 'The courier is dead. In his coat: a list of five places in a clerk\'s hand. The Thornwood is crossed out. Highmoor is next.'],
        ['say', 'Dask', 'Highmoor again. Orrin and Sons, the grey silver, the names. It all goes north.'],
        ['say', 'Runa', 'Then so do we. After this.'],
        ['set', 'courierList'], ['xp', 20]
      ] },
      k: { type: 'foe', sprite: 'keeper', dir: 'down', script: [
        ['say', 'The Keeper', 'WHO COMES WITH THE NAMES OF THE DEAD IN THEIR MOUTH?'],
        ['say', 'Maren', "Maren of Brackenford. A Warden's daughter, come to keep Oswin's piece safe."],
        ['say', 'The Keeper', 'THEN PROVE YOU CAN KEEP IT.'],
        ['battle', 'keeper'], ['remove'],
        ['note', 'The green lantern rolls across the floor and goes out. In the dark, something like a sigh.'],
        ['say', 'Runa', 'It was a test. It wanted to lose.'],
        ['say', 'Maren', 'It wanted to rest. Now it can. Down, then. Oswin is waiting.'],
        ['set', 'keeperDone'], ['xp', 40], ['save']
      ] }
    }
  };
  D.placeNear('ossuary', null, 13, 10, { tag: 'ossCamp', type: 'obj', gfx: 'shrine', script: [['note', "A Warden's lamp-niche, swept clean. Somebody kept it ready for travellers, a very long time ago."], ['run', 'campsite']] });
  D.scripts.ossIntro = [['if', '!ossIntro', [
    ['note', 'The stair opens into a long hall of niches. Every niche holds bones, and every set of bones has a name cut above it.'],
    ['say', 'Finch', 'How many Wardens were there?'],
    ['say', 'Maren', 'Hundreds, once. This is where the Thornwood ones came home.'],
    ['say', 'Dask', 'And somebody has been in here with a crowbar. Look at the walls.'],
    ['set', 'ossIntro']
  ]]];

  /* ================= more side work ================= */
  // Tam is out in the wood while he is missing
  const tamNpc = M.brackenford.things['2']; tamNpc.if = (tamNpc.if ? tamNpc.if + '&' : '') + '!q.tam=1';

  /* ---------- the goblin with the spade ---------- */
  M.digsite = {
    name: "Nubbin's Dig", ground: 'cave', music: 'dungeon', bg: 'cave', dark: 0.7,
    rows: [
      '######################',
      '#....#####......######',
      '#.c..#####..n...######',
      '#.......b.......######',
      '###.#######.##########',
      '###.#######.......####',
      '###...a.......s...####',
      '#########.....########',
      '#########..x..########',
      '######################'
    ],
    things: {
      x: { type: 'warp', to: 'thornwood', at: '?', gfx: 'daylight', out: 'up' },
      a: { type: 'foe', sprite: 'goblin', dir: 'down', script: [['battle', 'dig_mouth'], ['remove']] },
      b: { type: 'foe', sprite: 'spider', dir: 'down', script: [['battle', 'dig_deep'], ['remove']] },
      s: { type: 'obj', gfx: 'rubble', script: [['note', 'A heap of spoil, and in it, a broken Warden name-stone.'], ['say', 'Maren', 'They are digging up the old waystones. Every one with a name on it.']] },
      c: { type: 'chest', gold: 25, items: { draught: 2, flask: 1 } },
      n: { type: 'npc', sprite: 'nubbin', dir: 'down', script: [['if', 'q.dig>=2', [['say', 'Nubbin', 'Nubbin is retired now. Nubbin will dig potatoes.']], [
        ['note', 'A goblin in a pot-helmet is digging very fast with a very small spade. He does not stop when you arrive.'],
        ['say', 'Nubbin', 'Busy busy. Paid by the stone. Grey man pays a silver each, two if it has a name.'],
        ['say', 'Dask', 'What does the grey man look like?'],
        ['say', 'Nubbin', 'Grey. Talks like a counting-house. Smells of ink. Said Orrin a lot. Orrin this, Orrin that.'],
        ['choice', null, 'What do you do with Nubbin?', [
          ['Pay him to stop (20 gold)', [['if', 'gold>=20', [['gold', -20], ['say', 'Nubbin', 'Paid to not dig? This is the best job.'], ['set', 'nubbinPaid']], [['say', 'Nubbin', 'No gold, no stopping. Busy busy.'], ['battle', 'dig_mouth']]]]],
          ['Scare him off', [['say', 'Runa', 'BOO.'], ['note', 'Nubbin leaves at speed, still holding the spade.']]]
        ]],
        ['quest', 'dig', 2], ['xp', 30]
      ]]] }
    }
  };
  M.digsite.things.x.at = D.placeNear('thornwood', null, 22, 27, { tag: 'toDig', type: 'warp', to: 'digsite', at: 'x', gfx: 'caveMouth', under: 'path', out: 'down', if: 'q.dig>=1' });

  /* ---------- Bristle ---------- */
  D.placeNear('thornwood', null, 38, 26, { tag: 'bristle', type: 'obj', gfx: 'bones', if: 'q.bristle=1', script: [
    ['note', 'A wolf den under a fallen oak. Bones outside, and a lot of barking inside.'],
    ['battle', 'bristle'],
    ['note', 'A shaggy brown dog bursts out of the den, licks every face in reach, and sets off for the mill at a gallop.'],
    ['say', 'Finch', 'No thanks, then. Typical.'],
    ['quest', 'bristle', 2], ['xp', 30], ['remove']
  ] });

  /* ---------- the bounties ---------- */
  D.placeNear('thornwood', null, 12, 24, { tag: 'oneear', type: 'foe', sprite: 'alpha', dir: 'right', if: 'q.bounty1>=1', script: [
    ['note', 'A grey wolf the size of a pony, with half of one ear. He has been waiting for you for ten years.'],
    ['battle', 'oneear'], ['set', 'b1.oneear'], ['run', 'bountyDone'], ['remove']
  ] });
  D.placeNear('thornwood', null, 30, 4, { tag: 'rattlejack', type: 'foe', sprite: 'haskv', dir: 'down', if: 'q.bounty1>=1', script: [
    ['say', 'Rattle Jack', 'Rattle Jack! Scourge of the Thornwood! Terror of the road!'],
    ['say', 'Dask', 'You are on a poster. A small one. Next to a goat.'],
    ['battle', 'rattlejack'], ['set', 'b1.jack'], ['run', 'bountyDone'], ['remove']
  ] });
  D.scripts.bountyDone = [['if', 'b1.oneear&b1.jack', [['quest', 'bounty1', 3], ['gold', 80], ['give', 'wolftooth'], ['xp', 40], ['note', 'Both bounties are done. Hobb will pay out at the notice board... he says. You find the money pinned to it already.']], [['quest', 'bounty1', 2], ['xp', 20]]]];

  // the side jobs that start in town
  const board = Object.values(M.brackenford.things).find(t => t.tag === 'board1');
  board.script[0][3].push(
    ['"BOUNTIES: OLD ONE-EAR, RATTLE JACK"', [['note', 'Two faded posters: a wolf with half an ear, and a man drawn mostly as a beard. REWARD FROM THE VILLAGE PURSE.'], ['if', '!q.bounty1', [['quest', 'bounty1', 1]]]], 'q.bounty1<3&joined']
  );
  // Teague's dog, and the goblin dig, once the mill is free
  const teague = M.mill.things.m;
  teague.script = [['if', 'millFree&!q.bristle', [['say', 'Teague', 'One more thing. The wolves took Bristle, my dog, the night the goblins came. There is a den in the south-east of the wood. If she is alive...'], ['quest', 'bristle', 1]]]].concat(teague.script);
  D.scripts.tamHome.push(['say', 'Tam', 'The goblin with the spade is real, you know. He is digging a hole south of the road. A big one.'], ['if', '!q.dig', [['quest', 'dig', 1]]]);
  // Hobb takes the news about the dig
  const hobb = Object.values(M.brackenford.things).find(t => t.sprite === 'hobb');
  if (hobb) hobb.script = [['if', 'q.dig=2', [
    ['say', 'Hobb', 'A grey man buying Warden stones, paying goblins in silver, and saying Orrin every other breath. Orrin and Sons is a counting-house in Highmoor.'],
    ['say', 'Hobb', 'I will write to the reeve there. For all the good it will do.'],
    ['quest', 'dig', 3], ['gold', 40], ['xp', 25]
  ]]].concat(hobb.script || []);
})();
