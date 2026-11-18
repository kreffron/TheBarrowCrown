/* Chapter 2, expanded.
   Main story: The Sea-Gate (quest act2). The Pale Hand have opened the old abbey sea-gate and the last stretch of the
   causeway is under the tide. Captain Gannet's smugglers hold the tide mill that works the gate; take it and close
   the sluice (flag act2done). Then, under the abbey, the Flooded Scriptorium lies between the upper floor and the
   undercroft: three tide-ledgers name the Warden who came here, and the Drowned Archivist keeps the stair.
   Side quests: The Wreck of the Marigold (marigold), Long Sal's Hole (smugglers), Will-o'-the-Fen (wisps),
   The Eel King (eelking), Ysolde's Psalter (psalter). */
(function () {
  const D = G.D, M = D.maps;
  (D.xpScale = D.xpScale || {})[2] = 0.5;
  Object.assign(D.speakers, { 'Captain Gannet': '#c8a070', 'Long Sal': '#d89a70', 'The Archivist': '#a8d0c8', Ysolde: '#d8d8f0' });
  Object.assign(D.sprites, {
    gannet: { skin: '#c98e62', hair: '#2a2a30', beard: 1, top: '#2a3a5a', legs: '#3a2a22', hat: '#1a1a24', trim: '#e8c14a' },
    smuggler: { skin: '#d8a070', hair: '#6b3f2a', top: '#3a4a5a', legs: '#3a3028', trim: '#c8c8d4' },
    longsal: { skin: '#e0b090', hair: '#a83a2a', top: '#5a2a3a', legs: '#2a2a30', trim: '#e8c14a' },
    archivist: { skel: 1, robe: 1, hood: '#2a5a5a' }
  });
  Object.assign(D.looks, {
    gannet: { held: 'sword', cape: '#1a2a4a', scar: 1, big: 1 },
    smuggler: { held: 'dagger', scarf: '#8a2a2a' },
    longsal: { held: 'sword', scarf: '#2a2a34' }
  });
  Object.assign(D.enemies, {
    smuggler: { name: 'Smuggler', sprite: 'smuggler', hp: 36, ac: 13, atk: 6, dmg: '1d8+3', spd: 3, save: 1, xp: 42, gold: [6, 14], tags: ['human'] },
    smuggbow: { name: 'Smuggler Bowman', sprite: 'smuggler', hp: 30, ac: 12, atk: 6, dmg: '1d8+2', spd: 3, save: 1, range: 6, xp: 40, gold: [6, 12], tags: ['human'] },
    gannet: { name: 'Captain Gannet', sprite: 'gannet', scale: 3, hp: 120, ac: 15, atk: 7, dmg: '1d10+4', spd: 2, save: 3, xp: 140, gold: [60, 60], tags: ['human'], moves: [[3, 'attack'], [1, 'headbutt']] },
    longsal: { name: 'Long Sal', sprite: 'longsal', hp: 110, ac: 15, atk: 8, dmg: '1d8+5', spd: 4, save: 3, xp: 110, gold: [50, 50], tags: ['human'], moves: [[3, 'attack'], [1, 'headbutt']] },
    inkwraith: { name: 'Ink Wraith', sprite: 'wraith', hp: 40, ac: 14, atk: 6, dmg: '1d6+3', pow: 4, spd: 3, save: 2, xp: 50, gold: [0, 6], tags: ['undead'], immune: ['asleep', 'poison'], moves: [[2, 'attack'], [2, 'tolling']] },
    archivist: { name: 'The Drowned Archivist', sprite: 'archivist', scale: 3, hp: 170, ac: 15, atk: 7, dmg: '1d10+3', pow: 5, spd: 2, save: 4, xp: 160, gold: [40, 40], tags: ['undead'], immune: ['asleep', 'poison'], moves: [[3, 'attack'], [1, 'tidecall'], [1, 'dragunder']] },
    eelking: { name: 'The Eel King', sprite: 'eel', scale: 3, hp: 140, ac: 14, atk: 8, dmg: '1d10+4', spd: 4, save: 3, xp: 130, gold: [20, 30], tags: ['beast'], moves: [[2, 'attack'], [2, 'venombite'], [1, 'dragunder']] }
  });
  Object.assign(D.groups, {
    tm_crabs: { enemies: ['crab', 'crab'], intro: 'Shore crabs the size of cartwheels are picking over the slipway.' },
    tm_shore: { enemies: ['smuggler', 'smuggbow', 'smuggler'], intro: 'Smugglers in tarred coats, sitting on stolen barrels. They stand up.' },
    tm_race: { enemies: ['eel', 'smuggler', 'eel'], intro: 'The mill race is full of eels, and someone has been feeding them.' },
    tm_grey: { enemies: ['acolyte', 'zealot', 'acolyte'], intro: 'Grey robes guard the mill door. Gannet has paying customers.' },
    gannet: { enemies: ['smuggbow', 'gannet', 'smuggler'], waves: [['smuggler', 'bruiser2']], waveText: ['Gannet whistles, and his boat crew comes up the ladder.'], boss: true, intro: 'Captain Gannet draws a sabre with a great deal of brass on it.' },
    sc_drowned: { enemies: ['drowned', 'drowned'], intro: 'Monks in rotted habits rise from the reading desks, still holding their pens.' },
    sc_lights: { enemies: ['marshlight', 'inkwraith', 'marshlight'], intro: 'Lights drift between the shelves. One of them has a face made of ink.' },
    sc_grey: { enemies: ['acolyte', 'zealot'], waves: [['acolyte', 'acolyte']], waveText: ['More grey robes come down the stairs behind you.'], intro: 'The Pale Hand are burning books by the armful.' },
    sc_eels: { enemies: ['eel', 'eel', 'eel'], intro: 'The flooded aisle boils.' },
    sc_wraiths: { enemies: ['inkwraith', 'drowned', 'inkwraith'], intro: 'The copyists were never told they could stop.' },
    archivist: { enemies: ['inkwraith', 'archivist', 'drowned'], waves: [['inkwraith']], waveText: ['The Archivist turns a page, and another copyist climbs out of it.'], boss: true, intro: 'The Archivist closes a book the size of a door. "OVERDUE."' },
    wreck_crabs: { enemies: ['crab', 'crab', 'eel'], intro: 'Crabs swarm out of the hull.' },
    wreck_hold: { enemies: ['drowned', 'drowned'], waves: [['drowned']], waveText: ['Another of the Marigold\'s crew stands up in the water.'], intro: "The Marigold's crew never left her." },
    sm_door: { enemies: ['smuggler', 'smuggler'], intro: '"Password?"' },
    sm_hold: { enemies: ['smuggbow', 'bruiser2', 'smuggbow'], intro: 'The cave widens into a hold full of brandy, silk and stolen church plate.' },
    longsal: { enemies: ['smuggler', 'longsal', 'smuggbow'], boss: true, intro: 'Long Sal puts down her ledger and picks up her sabre.' },
    wisps: { enemies: ['marshlight', 'marshlight'], intro: 'The light you snuffed was not alone.' },
    wisps_last: { enemies: ['marshlight', 'bogling', 'marshlight'], intro: 'The last light flares, and the mud underneath it gets up.' },
    eelking: { enemies: ['eel', 'eelking', 'eel'], boss: true, intro: 'The water lifts. The Eel King is as long as a boat and twice as ugly.' }
  });
  Object.assign(D.quests, {
    act2: { name: 'The Sea-Gate', short: 'Sea-Gate', ch: 2, done: 3, stages: {
      1: "The causeway's last stretch is under the sea. Somebody has opened the abbey's old sea-gate. It is worked from the tide mill on the south shore of Mirefen.",
      2: 'Gannet is beaten and the sluice is shut. The causeway is draining.',
      3: 'The causeway is clear to the Abbey.' } },
    marigold: { name: 'The Wreck of the Marigold', short: 'Marigold', ch: 2, done: 2, stages: {
      1: "Ama's husband went down with the Marigold, wrecked on the rocks west of the harbour. She wants his ring back, if anyone can bear to look.",
      2: "Ama has her husband's ring. She says it is enough." } },
    smugglers: { name: "Long Sal's Hole", short: "Sal's Hole", ch: 2, done: 2, stages: {
      1: "Quill's notice: smugglers are landing stolen church plate somewhere in west Mirefen. A cave, he thinks. Find it.",
      2: "Long Sal is beaten and the church plate is going home." } },
    wisps: { name: "Will-o'-the-Fen", short: 'Fen Lights', ch: 2, done: 2, stages: {
      1: 'Three false lights burn on Mirefen at night and lead travellers into the deep water. Snuff them.',
      2: 'The false lights are out.' } },
    eelking: { name: 'The Eel King', short: 'Eel King', ch: 2, done: 2, stages: {
      1: 'A bounty from the fishermen: the Eel King, a monster eel in the fen pools, has taken three boats. 150 gold.',
      2: 'The Eel King is dead. The fishermen will be eating eel pie for a month.' } },
    psalter: { name: "Ysolde's Psalter", short: 'Psalter', ch: 2, done: 3, stages: {
      1: "Sister Ysolde's old psalter was left in the abbey scriptorium when the sisters fled. She would give a great deal to have it back.",
      2: 'You have the psalter. Take it to Ysolde.',
      3: 'Ysolde has her psalter. She read you her favourite psalm. It was about the sea, and it was very long.' } }
  });
  Object.assign(D.items, {
    psalter: { name: "Ysolde's Psalter", type: 'key', desc: 'A small salt-stained prayer book.' },
    ring2: { name: "Tam Rook's Ring", type: 'key', desc: 'A plain iron ring with a gull scratched on it.' },
    gannetcoat: { name: "Gannet's Coat", type: 'armor', for: ['dask', 'finch'], mods: { ac: 5, hp: 4 }, price: 260, desc: 'A sea-captain\'s tarred coat, lined with mail.' },
    tideglass: { name: 'Tide-glass', type: 'charm', mods: { pow: 2 }, price: 220, desc: 'A sea-worn lens from the scriptorium. Spells come clearer through it.' },
    eeltooth: { name: 'Eel King Tooth', type: 'charm', mods: { dmgBonus: 2 }, price: 240, desc: 'As long as a dagger. Runa wears it on a cord.' }
  });

  /* ---------- the causeway is flooded until the sluice is shut ---------- */
  const gate = M.mirefen.things.a;
  gate.script = [['if', '!act2done', [
    ['if', '!act2', [
      ['note', 'The causeway runs on into the sea and simply stops. The last two hundred yards are under green water.'],
      ['say', 'Finch', 'Ysolde said the tide was out at noon. It is noon.'],
      ['say', 'Maren', 'This is not the tide. Listen. Somewhere there is a gate open, and the sea is coming through it.'],
      ['say', 'Dask', 'The old tide mill on the south shore. The monks used it to work their sea-gate. I saw smoke there this morning.'],
      ['set', 'act2'], ['quest', 'act2', 1]
    ], [['note', 'The causeway is still under the sea. The tide mill is on the south shore of the fen.']]],
    ['end']
  ]], ['if', 'q.act2<3', [['note', 'The causeway stands clear of the water, streaming. The Abbey waits at the end of it.'], ['quest', 'act2', 3]]]];

  /* ---------- the tide mill ---------- */
  M.tidemill = {
    name: 'The Tide Mill', ground: 'marsh', music: 'fen', bg: 'fen',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T"""""""""~~~~~~~~^^^^^^^^~~~T',
      'T""a""""""~~~~~~~~^^^^^^^^~~~T',
      'T"""""""""~~~~~~~~WNWWNWWW~~~T',
      'T"""""""b""~~~~~~~""g"z""~~~~T',
      'T""""""""""~~~~~~~"""""""~~~~T',
      'T"""c""""""~~~~~~~~--e--~~~~~T',
      'T""""""""""~~~~~~~~~-~~~~~~~~T',
      'T""""""""""-------d--~~~~~~~~T',
      'T""""""""""~~~~~~~~~~~~~~~~~~T',
      'Tw"""""""""~~~~~~~~~~~~~~~~~~T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    things: {
      w: { type: 'warp', to: 'mirefen', at: '?', gfx: 'path', under: 'path', out: 'right' },
      a: { type: 'foe', sprite: 'crab', dir: 'down', script: [['battle', 'tm_crabs'], ['remove']] },
      b: { type: 'foe', sprite: 'smuggler', dir: 'left', script: [['battle', 'tm_shore'], ['remove'],
        ['note', 'The barrels are stamped with a grey open hand, and a merchant mark: ORRIN & SONS, HIGHMOOR.'],
        ['say', 'Dask', 'Orrin and Sons again. They ship goblin keys, grave silver, and now brandy. Busy people.']] },
      c: { type: 'chest', gold: 60, items: { greater: 2 } },
      d: { type: 'foe', sprite: 'eel', dir: 'left', script: [['battle', 'tm_race'], ['remove']] },
      e: { type: 'foe', sprite: 'acolyte', dir: 'down', script: [['battle', 'tm_grey'], ['remove']] },
      g: { type: 'foe', sprite: 'gannet', dir: 'down', script: [
        ['say', 'Captain Gannet', 'You are the Wardens\' pets. The grey people said you would come. They paid extra for that.'],
        ['say', 'Runa', 'Then they paid for a beating. Shut the gate.'],
        ['say', 'Captain Gannet', 'Shut it yourself. If you can reach the wheel.'],
        ['battle', 'gannet'], ['remove'],
        ['note', "In Gannet's coat, a letter: 'Keep the gate open until the third night. The Prior must not be disturbed before the rite. - V.'"],
        ['say', 'Maren', 'V.'],
        ['say', 'Finch', 'There are a lot of names beginning with V.'],
        ['say', 'Maren', 'Not many who would sign a letter like that.'],
        ['set', 'gannetDone'], ['give', 'gannetcoat'], ['xp', 60]
      ] },
      z: { type: 'obj', gfx: 'wheel', script: [['if', 'act2done', [['note', 'The sluice wheel is locked shut.']], [['if', 'gannetDone', [
        ['note', 'Runa and Dask throw their weight on the wheel. It groans, turns, and out in the bay the sea-gate grinds shut.'],
        ['sfx', 'lever'], ['shake', 500],
        ['say', 'Finch', 'And the causeway?'],
        ['say', 'Maren', 'Give it an hour. Then we walk to the Abbey.'],
        ['set', 'act2done'], ['quest', 'act2', 2], ['xp', 40], ['save']
      ], [['note', 'The great sluice wheel. Gannet is standing in the way.']]]]]] }
    }
  };
  M.tidemill.things.w.at = D.placeNear('mirefen', null, 40, 27, { tag: 'toMill2', type: 'warp', to: 'tidemill', at: 'w', gfx: 'path', under: 'path', out: 'left' });

  /* ---------- the Flooded Scriptorium: between the abbey's upper floor and the undercroft ---------- */
  M.abbey1.things.z.to = 'scriptorium'; M.abbey1.things.z.at = 'u';
  M.abbey2.things.u.to = 'scriptorium'; M.abbey2.things.u.at = 'z';
  function ledger(n, text) {
    return [['if', 'ledger2.' + n, [['note', 'The tide-ledger lies open where you left it.']], [
      ['note', 'A tide-ledger on a lectern, its pages stuck togtonic with salt. ' + text],
      ['set', 'ledger2.' + n], ['xp', 15]
    ]]];
  }
  M.scriptorium = {
    name: 'The Flooded Scriptorium', ground: 'stone', music: 'dungeon', bg: 'crypt', dark: 0.8,
    rows: [
      '########################',
      '#......#........#......#',
      '#..1...#...z....#...2..#',
      '#......#........#......#',
      '#......#...k....#......#',
      '###.#######y#######.####',
      '#......................#',
      '#..a......~~~~......b..#',
      '#.........~~~~.........#',
      '#..c......~~~~......d..#',
      '###.####.......####.####',
      '#......#...e...#.......#',
      '#...3..f.......g.......#',
      '#......#...u...#.......#',
      '########################'
    ],
    things: {
      u: { type: 'warp', to: 'abbey1', at: 'z', gfx: 'stairsUp', out: 'up' },
      z: { type: 'warp', to: 'abbey2', at: 'u', gfx: 'stairsDown', out: 'down' },
      f: { type: 'foe', sprite: 'drownedman', dir: 'left', script: [['run', 'scIntro'], ['battle', 'sc_drowned'], ['remove']] },
      g: { type: 'foe', sprite: 'acolyte', dir: 'right', script: [['run', 'scIntro'], ['battle', 'sc_grey'], ['remove'],
        ['say', 'Dask', 'They are not stealing the books. They are burning them.'],
        ['say', 'Finch', 'Whatever is written here, somebody does not want it read.']] },
      a: { type: 'foe', sprite: 'marshlight', dir: 'right', script: [['battle', 'sc_lights'], ['remove']] },
      b: { type: 'foe', sprite: 'eel', dir: 'left', script: [['battle', 'sc_eels'], ['remove']] },
      e: { type: 'foe', sprite: 'wraith', dir: 'down', script: [['battle', 'sc_wraiths'], ['remove']] },
      c: { type: 'chest', gold: 70, items: { greater: 2, tonic: 1 } },
      d: { type: 'chest', items: { tideglass: 1 }, script: [['if', 'q.psalter=1', [['note', 'Under the glass is a small salt-stained prayer book with YSOLDE written inside the cover.'], ['give', 'psalter'], ['quest', 'psalter', 2]]]] },
      3: { type: 'obj', gfx: 'altar', script: ledger(3, 'The last entry: "Corran of the Salt Road is dead. His piece is given to the sea, under the Abbey, where the Prior keeps it. God forgive us."') },
      1: { type: 'obj', gfx: 'altar', script: ledger(1, 'An entry from two hundred years ago: "A Warden came by the salt road tonight, very tired, carrying something wrapped in sailcloth. His name is Corran."') },
      2: { type: 'obj', gfx: 'altar', script: ledger(2, 'Later: "Corran asks that the thing he carries be kept below, in the sea-crypt. The Prior has agreed. Corran says the Prior is a good man."') },
      y: { type: 'obj', gfx: 'doorStone', unless: 'sc.open', script: [['if', 'ledger2.1&ledger2.2&ledger2.3', [
        ['note', 'Maren reads the three entries aloud to the door, in order. On the last, the stone sighs and rolls aside.'],
        ['say', 'Maren', 'The Prior was a good man. That is the worst part.'],
        ['sfx', 'lever'], ['set', 'sc.open'], ['remove']
      ], [['note', 'A reading-room door, sealed. Carved above it: READ, AND REMEMBER.'],
        ['say', 'Finch', 'A library door that wants you to have done the reading. Every student\'s nightmare.']]]] },
      k: { type: 'foe', sprite: 'archivist', dir: 'down', script: [
        ['say', 'The Archivist', 'SILENCE IN THE READING ROOM.'],
        ['say', 'Finch', 'We have been very quiet. Mostly.'],
        ['say', 'The Archivist', 'THE PRIOR IS NOT TO BE DISTURBED. THE BOOK IS CLOSED.'],
        ['battle', 'archivist'], ['remove'],
        ['note', 'The Archivist folds down into a heap of wet vellum. The stair beyond goes down into the dark and the sound of the sea.'],
        ['say', 'Runa', 'Below us. The Prior, the fishermen, and whatever Corran left.'],
        ['set', 'archivistDone'], ['xp', 40], ['save']
      ] }
    }
  };
  D.scripts.scIntro = [['if', '!scIntro', [
    ['note', 'The stair comes down into a long room of desks and shelves, half under the sea. Pages float on the water like lily pads.'],
    ['say', 'Maren', 'The scriptorium. The sisters copied the tide-tables here, and everything else besides.'],
    ['say', 'Dask', 'And somebody has had a fire. Recently.'],
    ['set', 'scIntro']
  ]]];
  D.placeNear('scriptorium', null, 5, 6, { tag: 'scCamp', type: 'obj', gfx: 'shrine', script: [['note', 'A reading-lamp niche, still dry. The sisters kept a kettle here.'], ['run', 'campsite']] });

  /* ================= side work ================= */
  const smBoard = D.placeNear('saltmere', null, 26, 10, { tag: 'board2', type: 'sign', gfx: 'notice', script: [
    ['topics', null, 'The harbour notice board, crusted with salt. Most of it is about tides.', [
      ['"THE MARIGOLD" (Ama)', [['note', "In a careful hand: IF ANYONE GOES OUT TO THE WRECK OF THE MARIGOLD, PLEASE BRING BACK MY HUSBAND'S RING. HE NEVER TOOK IT OFF. - AMA"], ['if', '!q.marigold', [['quest', 'marigold', 1]]]], 'q.marigold<2'],
      ['"STOLEN PLATE" (Quill)', [['note', "Harbourmaster's notice: CHURCH PLATE STOLEN FROM THREE PARISHES. SMUGGLERS LANDING IN WEST MIREFEN. REWARD FOR THE CULPRITS."], ['if', '!q.smugglers', [['quest', 'smugglers', 1]]]], 'q.smugglers<2'],
      ['"FALSE LIGHTS ON THE FEN"', [['note', 'Scrawled: THREE LIGHTS ON THE FEN AT NIGHT. THEY ARE NOT LANTERNS. DO NOT FOLLOW THEM. SOMEONE PUT THEM OUT, FOR PITY\'S SAKE.'], ['if', '!q.wisps', [['quest', 'wisps', 1]]]], 'q.wisps<2'],
      ['"BOUNTY: THE EEL KING"', [['note', 'A drawing of something with too many teeth. BOUNTY 150 GOLD. FROM THE FISHERMEN OF SALTMERE.'], ['if', '!q.eelking', [['quest', 'eelking', 1]]]], 'q.eelking<2'],
      ['"LOST: A PSALTER" (Ysolde)', [['note', 'In a neat convent hand: MY PSALTER WAS LEFT IN THE ABBEY SCRIPTORIUM. IT IS OF NO VALUE TO ANYONE BUT ME. - SR. YSOLDE'], ['if', '!q.psalter', [['quest', 'psalter', 1]]]], '!q.psalter']
    ], 'Leave the board']
  ] });

  /* ---------- the wreck of the Marigold ---------- */
  M.wreck = {
    name: 'The Wreck of the Marigold', ground: 'sand', music: 'fen', bg: 'beach',
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~WWWWWWWW~~~~~~~~',
      '~~~~~~W..c...W~~~~~~~~',
      '~~~~~~W...b..W~~~~~~~~',
      '~~~~~~WWW.WWWW~~~~~~~~',
      '~~,,,,,,,,,,,,,,,~~~~~',
      ',,,,,a,,,,,,,,,,,,,~~~',
      ',,,,,,,,,,,,,,,,,,,,,~',
      ',,,,,,,,,x,,,,,,,,,,,,',
      '~~~~~~~~~~~~~~~~~~~~~~'
    ],
    things: {
      x: { type: 'warp', to: 'saltmere', at: '?', gfx: 'path', under: 'sand', out: 'up' },
      a: { type: 'foe', sprite: 'crab', dir: 'right', script: [['battle', 'wreck_crabs'], ['remove']] },
      b: { type: 'foe', sprite: 'drownedman', dir: 'down', script: [['battle', 'wreck_hold'], ['remove'],
        ['note', 'The last of the drowned crew sinks down. On his hand, a plain iron ring with a gull scratched on it.'],
        ['say', 'Maren', 'Rest now, Tam Rook. Ama sent us.'],
        ['give', 'ring2'], ['xp', 30]] },
      c: { type: 'chest', gold: 80, items: { greater: 2 } }
    }
  };
  M.wreck.things.x.at = D.placeNear('saltmere', null, 3, 21, { tag: 'toWreck', type: 'warp', to: 'wreck', at: 'x', gfx: 'path', under: 'path', out: 'down', if: 'q.marigold>=1' });
  const ama = Object.values(M.saltmere.things).find(t => t.sprite === 'ama' && t.script);
  ama.tag = 'ama2';
  ama.script = [['if', 'q.marigold=1&item.ring2', [
    ['note', 'Ama turns the ring over and over in her fingers.'],
    ['say', 'Ama', 'He scratched that gull on it himself, the night we married. He said it would always bring him home.'],
    ['say', 'Ama', 'Well. It did, in the end. Thank you.'],
    ['take', 'ring2'], ['gold', 60], ['give', 'greater', 2], ['xp', 140], ['quest', 'marigold', 2], ['end']
  ]]].concat(ama.script);

  /* ---------- Long Sal's hole ---------- */
  M.smugglers = {
    name: "Long Sal's Hole", ground: 'cave', music: 'dungeon', bg: 'cave', dark: 0.7,
    rows: [
      '######################',
      '#...c####.......######',
      '#........s.....d######',
      '#...######.......#####',
      '###.######.###########',
      '###...b....###########',
      '#########.############',
      '#########.a.##########',
      '#########.x.##########',
      '######################'
    ],
    things: {
      x: { type: 'warp', to: 'mirefen', at: '?', gfx: 'daylight', out: 'up' },
      a: { type: 'foe', sprite: 'smuggler', dir: 'down', script: [['say', 'Smuggler', 'Password?'], ['say', 'Runa', 'Axe.'], ['battle', 'sm_door'], ['remove']] },
      b: { type: 'foe', sprite: 'smuggler', dir: 'right', script: [['battle', 'sm_hold'], ['remove']] },
      s: { type: 'foe', sprite: 'longsal', dir: 'down', script: [
        ['say', 'Long Sal', 'Quill sent you? Quill buys my brandy, you know. Ask him where his cellar came from.'],
        ['say', 'Dask', 'We will. After.'],
        ['battle', 'longsal'], ['remove'],
        ['note', "Sal's ledger lists every parish she robbed, and every buyer. The biggest buyer, by far, is a grey-sealed account in Highmoor."],
        ['set', 'salDone'], ['quest', 'smugglers', 2], ['gold', 120], ['xp', 150]
      ] },
      c: { type: 'chest', gold: 90, items: { tonic: 2 } },
      d: { type: 'chest', items: { greater: 3 }, gold: 50 }
    }
  };
  M.smugglers.things.x.at = D.placeNear('mirefen', null, 2, 22, { tag: 'toSal', type: 'warp', to: 'smugglers', at: 'x', gfx: 'caveMouth', under: 'path', out: 'down', if: 'q.smugglers>=1' });

  /* ---------- the false lights ---------- */
  [['1', 8, 24], ['2', 22, 2], ['3', 34, 22]].forEach(([n, x, y]) => D.placeNear('mirefen', null, x, y, { tag: 'wisp' + n, type: 'obj', gfx: 'brazier', if: 'q.wisps=1&!wisp.' + n, script: [
    ['note', 'A pale light hangs over the water, the height of a lantern. There is no lantern.'],
    ['say', 'Maren', 'Lamplighter, take back what is not yours.'],
    ['set', 'wisp.' + n], ['add', 'wispsOut'],
    ['if', 'wispsOut<3', [['battle', 'wisps']], [['battle', 'wisps_last'], ['quest', 'wisps', 2], ['gold', 90], ['xp', 150], ['note', 'The fen goes properly dark, the ordinary dark of mud and frogs.']]],
    ['remove']
  ] }));

  /* ---------- the Eel King ---------- */
  D.placeNear('mirefen', null, 18, 21, { tag: 'eelking', type: 'foe', sprite: 'eel', dir: 'down', if: 'q.eelking=1', script: [
    ['note', 'Bubbles. A lot of bubbles. Then the pool stands up.'],
    ['battle', 'eelking'], ['quest', 'eelking', 2], ['gold', 150], ['give', 'eeltooth'], ['xp', 140], ['remove']
  ] });

  /* ---------- Ysolde's psalter ---------- */
  const ysolde = M.s_chapel.things.w;
  ysolde.script = [['if', 'q.psalter=2', [
    ['say', 'Ysolde', 'My psalter! I learned my letters from this. Sit, sit. Let me read you something.'],
    ['note', 'She reads you a psalm about the sea. It is very beautiful and very long.'],
    ['take', 'psalter'], ['give', 'tonic', 2], ['gold', 50], ['xp', 140], ['quest', 'psalter', 3], ['end']
  ]]].concat(ysolde.script);

  /* ---------- the salt pans ---------- */
  Object.assign(D.groups, {
    pans_grey: { enemies: ['acolyte', 'acolyte', 'smuggbow'], intro: 'Grey robes are breaking up the salt-pan walls with crowbars.' },
    pans_bog: { enemies: ['bogling', 'eel'], intro: 'They have dug too deep. Something in the old sluice did not like it.' },
    pans_zealot: { enemies: ['zealot', 'acolyte', 'zealot'], intro: 'Their leader has found what they came for: an old waystone with a name on it.' },
    stilts_1: { enemies: ['bogling', 'eel', 'eel'], intro: 'Bog lurkers are climbing the stilts.' },
    stilts_2: { enemies: ['bogling', 'marshlight'], waves: [['bogling']], waveText: ['The water heaves, and another lurker comes up under the house.'], intro: 'More of them. A lot more.' }
  });
  Object.assign(D.quests, {
    saltpans: { name: 'The Salt Road Stone', short: 'Salt Pans', ch: 2, done: 2, stages: {
      1: "Old Mags at the Gull and Lantern says grey robes are smashing up the salt pans east of town, looking for 'the road-stone'.",
      2: "The road-stone is safe. It bears Corran's name, and an arrow pointing out to sea." } },
    hollin: { name: "Hollin's Stilt-house", short: 'Stilt-house', ch: 2, done: 2, stages: {
      1: "Hollin the eel-catcher hasn't been seen in Saltmere for a week. His stilt-house is in south-west Mirefen.",
      2: 'Hollin is alive, furious and very grateful, in that order.' } },
    quillcellar: { name: "Quill's Cellar", short: "Quill's Cellar", ch: 2, done: 2, stages: {
      1: "Long Sal said Harbourmaster Quill bought her brandy. Ask him about it.",
      2: 'Quill has promised to return what he bought. You believe about half of it.' } }
  });
  M.saltpans = {
    name: 'The Salt Pans', ground: 'sand', music: 'fen', bg: 'beach',
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~',
      '~,,,,,,,,,,,,,,,,,,,,,~~',
      '~,~~~,~~~,~~~,~~~,~~~,~~',
      '~,~~~,~~~,~~~,~~~,~~~,,~',
      '~,,,a,,,,,,,,,b,,,,,,,,~',
      '~,~~~,~~~,~~~,~~~,~~~,,~',
      '~,~~~,~~~,~~~,~~~,~~~,,~',
      '~,,,,,,,,c,,,,,,,,,z,,,~',
      ',,,,,,,,,,,,,,,,,,,,,,,~',
      'x,,,,,,,,,,,,,,,,,,,,,,~',
      '~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    things: {
      x: { type: 'warp', to: 'saltmere', at: '?', gfx: 'path', under: 'sand', out: 'right' },
      a: { type: 'foe', sprite: 'acolyte', dir: 'right', script: [['battle', 'pans_grey'], ['remove']] },
      b: { type: 'foe', sprite: 'bogling', dir: 'down', script: [['battle', 'pans_bog'], ['remove']] },
      c: { type: 'chest', gold: 70, items: { greater: 2 } },
      z: { type: 'foe', sprite: 'zealot', dir: 'left', script: [
        ['say', 'Zealot', 'Corran of the Salt Road. We have his name. That is all the Open Hand needs.'],
        ['say', 'Maren', 'You will not have his name. Not from this stone.'],
        ['battle', 'pans_zealot'], ['remove'],
        ['note', "The waystone is old and salt-eaten. CORRAN, it says, and under the name, an arrow cut deep, pointing at the sea. At the Abbey."],
        ['say', 'Finch', 'They are collecting the five names. Oswin, Corran... who else?'],
        ['say', 'Maren', 'Hedda. And two I never learned. I think I am going to have to.'],
        ['quest', 'saltpans', 2], ['gold', 100], ['xp', 140], ['set', 'knowsCorran']
      ] }
    }
  };
  M.saltpans.things.x.at = D.placeNear('saltmere', null, 37, 18, { tag: 'toPans', type: 'warp', to: 'saltpans', at: 'x', gfx: 'path', under: 'path', out: 'left', if: 'q.saltpans>=1' });
  const mags = M.s_inn.things.b;
  mags.script = [['if', '!q.saltpans', [
    ['say', 'Mags', 'You lot again. Listen. Grey robes out at the salt pans east of town, breaking up the walls. Looking for "the road-stone", they said.'],
    ['say', 'Mags', 'My father built those pans. Go and break some grey heads for me, would you?'],
    ['quest', 'saltpans', 1], ['end']
  ]]].concat(mags.script || []);

  /* ---------- Hollin's stilt-house ---------- */
  D.placeNear('mirefen', null, 10, 28, { tag: 'hollin', type: 'npc', sprite: 'fisher', dir: 'down', if: 'q.hollin=1', script: [
    ['note', 'A stilt-house on the edge of the deep water, with a lot of claw marks on the stilts. Someone inside is shouting.'],
    ['say', 'Hollin', 'Are you real? Kill them! They have been at the stilts for a week!'],
    ['battle', 'stilts_1'], ['battle', 'stilts_2'],
    ['say', 'Hollin', 'A week. A week of eating raw eel. Tell Mags I want a pie. Tell her I want six.'],
    ['quest', 'hollin', 2], ['gold', 80], ['give', 'greater', 2], ['xp', 140], ['remove']
  ] });
  Object.assign(D.speakers, { Hollin: '#c8b890', Mags: '#e0a890' });
  const fisherInn = M.s_inn.things.f;
  fisherInn.script = [['if', '!q.hollin', [['say', 'Fisher', "Hollin's not been in for his pie all week. That is not like Hollin. His stilt-house is out in south-west Mirefen."], ['quest', 'hollin', 1], ['end']]]].concat(fisherInn.script || []);

  /* ---------- Quill's cellar ---------- */
  const quill = Object.values(M.saltmere.things).find(t => t.sprite === 'quill');
  quill.script = [['if', 'salDone&!q.quillcellar', [
    ['say', 'Dask', 'Harbourmaster. Long Sal sends her regards. And her ledger.'],
    ['say', 'Harbourmaster Quill', 'Ah. That. Every harbourmaster on this coast buys a little brandy, you understand...'],
    ['choice', null, 'What do you do about Quill?', [
      ['Make him pay it back', [['say', 'Harbourmaster Quill', 'Fine! Fine. Every barrel goes back, and I will pay for the plate myself.'], ['gold', 100], ['set', 'quillPaid']]],
      ['Let it go, quietly', [['say', 'Harbourmaster Quill', 'You are gentlefolk. I will not forget it.'], ['set', 'quillOwes'], ['give', 'greater', 3]]]
    ]],
    ['quest', 'quillcellar', 2], ['xp', 80], ['end']
  ]]].concat(quill.script);
})();
