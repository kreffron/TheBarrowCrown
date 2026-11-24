/* Chapter 4, expanded.
   Main story: The Plague Gate (quest act4). The catacombs are shut behind the old Plague Gate, whose portcullis is
   wound from the Chancellery Bell-Tower above the city. Inquisitor Vell holds the tower; take it and raise the gate
   (flag act4done). Between the Catacombs and the Fourth Tomb lie the Charnel Galleries: three bone-saints must be
   turned to face the stair before the gallery door opens, and the Charnel Abbot keeps the way down.
   Side quests (Highmoor's notice board): The Rat Mother (rats4), The Forger (forger4), The Night Watch (watch4),
   The Belfry Ghost (ghost4), The Duelist (duel4). */
(function () {
  const D = G.D, M = D.maps;
  (D.xpScale = D.xpScale || {})[4] = 0.64;
  const MAINXP = 0.25;   // the new story fights pay a quarter, so the side jobs still carry the chapter's last three levels
  Object.assign(D.speakers, { 'Inquisitor Vell': '#d8c8f0', 'Mistress Quell': '#e0c0a0', 'Lord Ashby': '#e8d0a0', 'Watch-Sergeant Brand': '#c8d0e0' });
  Object.assign(D.sprites, {
    inquisitor: { skin: '#e8c8a8', hair: '#2a2a30', top: '#3a2a4a', legs: '#1a1a24', robe: 1, hood: '#4a3a5a', trim: '#c8c8d4', eyes: '#c8a0ff' },
    quell: { skin: '#e8c0a0', hair: '#8a3a2a', top: '#5a4a3a', legs: '#2a2a30', trim: '#e8c14a' },
    duelist: { skin: '#e8c8a8', hair: '#e8d090', top: '#8a2a3a', legs: '#2a2a3a', trim: '#e8c14a' }
  });
  Object.assign(D.looks, {
    inquisitor: { held: 'staff', cape: '#2a1a3a', goatee: 1 },
    quell: { held: 'dagger', apron: '#3a3028', specs: 1 },
    duelist: { held: 'sword', cape: '#5a1a2a', mus: 1 }
  });
  Object.assign(D.enemies, {
    chguard: { name: 'Chancellery Guard', sprite: 'cityguard', hp: 115, ac: 18, atk: 12, dmg: '1d10+6', spd: 3, save: 4, xp: 180, gold: [15, 30], tags: ['human'] },
    chbow: { name: 'Chancellery Crossbow', sprite: 'cityguard', hp: 95, ac: 17, atk: 12, dmg: '1d10+5', spd: 3, save: 4, range: 7, xp: 170, gold: [15, 30], tags: ['human'] },
    inquisitor: { name: 'Inquisitor Vell', sprite: 'inquisitor', scale: 3, hp: 380, ac: 18, atk: 12, dmg: '1d10+7', pow: 10, spd: 3, save: 6, range: 5, xp: 520, gold: [120, 120], tags: ['human'], immune: ['asleep'], moves: [[2, 'attack'], [2, 'bonestorm'], [1, 'poisonblade']] },
    charnelabbot: { name: 'The Charnel Abbot', sprite: 'boneknight', scale: 3, hp: 400, ac: 19, atk: 13, dmg: '2d8+6', pow: 9, spd: 2, save: 5, xp: 540, gold: [60, 60], tags: ['undead'], immune: ['asleep', 'poison'], moves: [[3, 'attack'], [1, 'bonestorm']] },
    ratmother: { name: 'The Rat Mother', sprite: 'rat', scale: 4, hp: 360, ac: 16, atk: 12, dmg: '2d6+6', spd: 4, save: 4, xp: 440, gold: [0, 0], tags: ['beast'], moves: [[3, 'attack'], [1, 'poisonblade']] },
    forger: { name: 'Mistress Quell', sprite: 'quell', hp: 260, ac: 17, atk: 12, dmg: '1d10+6', pow: 9, spd: 4, save: 5, xp: 380, gold: [150, 150], tags: ['human'], moves: [[3, 'attack'], [1, 'poisonblade']] },
    duelist: { name: 'Lord Ashby', sprite: 'duelist', hp: 280, ac: 19, atk: 13, dmg: '1d10+7', spd: 5, save: 5, xp: 400, gold: [0, 0], tags: ['human'], immune: ['asleep'] }
  });
  Object.assign(D.groups, {
    bt_gate: { xpMul: MAINXP, enemies: ['chguard', 'chbow', 'chguard'], intro: 'Chancellery Guards on the tower door. "The tower is closed by order of the Chancellery."' },
    bt_hall: { xpMul: MAINXP, enemies: ['hlknight', 'shadowpriest'], intro: 'A Pale Hand knight and a priest, in the tower hall, in daylight. Nobody is hiding any more.' },
    bt_bows: { xpMul: MAINXP, enemies: ['chbow', 'cutthroat', 'chbow'], intro: 'Crossbows on the gallery, and a cutthroat to keep you busy.' },
    bt_stair: { xpMul: MAINXP, enemies: ['hlknight', 'chguard'], waves: [['chguard', 'chbow']], waveText: ['More guards clatter down from the bell-loft!'], intro: 'The stair to the bell-loft is held.' },
    bt_loft: { xpMul: MAINXP, enemies: ['shade', 'shadowpriest', 'shade'], intro: 'Shades circle the bells, called up for the occasion.' },
    inquisitor: { xpMul: MAINXP, enemies: ['chguard', 'inquisitor', 'shadowpriest'], waves: [['hlknight']], waveText: ['Vell rings the small bell, and a knight answers.'], boss: true, intro: 'Inquisitor Vell closes his book of names.' },
    cg_bones: { xpMul: MAINXP, enemies: ['boneknight', 'ghoul'], intro: 'The charnel dead are stacked like firewood, and some of the firewood stands up.' },
    cg_shades: { xpMul: MAINXP, enemies: ['shade', 'shade', 'shade'], intro: 'Shades move along the bone-walls, reading the names.' },
    cg_cult: { xpMul: MAINXP, enemies: ['cutthroat', 'shadowpriest', 'cutthroat'], intro: 'Pale Hand grave-robbers, with sacks of skulls.' },
    cg_gate1: { xpMul: MAINXP, enemies: ['boneknight', 'boneknight'], intro: 'Two bone knights guard the bay of the first saint.' },
    cg_gate2: { xpMul: MAINXP, enemies: ['ghoul', 'ghoul', 'shade'], waves: [['ghoul']], waveText: ['Something crawls out from under the bones.'], intro: 'Ghouls feed in the third bay.' },
    charnelabbot: { xpMul: MAINXP, enemies: ['boneknight', 'charnelabbot', 'shade'], waves: [['boneknight']], waveText: ['The Abbot calls, and a brother answers.'], boss: true, intro: 'The Charnel Abbot rises from a throne of skulls and raises his crozier.' },
    rs_rats: { enemies: ['ratswarm', 'ratswarm'], intro: 'The sewer squeaks.' },
    rs_ooze: { enemies: ['ooze', 'ratswarm'], intro: 'A sewer ooze, full of half-eaten rats.' },
    rs_nest: { enemies: ['ratswarm', 'ratswarm', 'ratswarm'], intro: 'The nest. Thousands of eyes.' },
    ratmother: { enemies: ['ratswarm', 'ratmother', 'ratswarm'], boss: true, intro: 'The Rat Mother is as big as a dray-horse, and her children love her.' },
    ps_door: { enemies: ['cutthroat', 'collector'], intro: 'The print-shop has guards. Print-shops do not usually have guards.' },
    ps_press: { enemies: ['collector', 'cutthroat', 'collector'], intro: 'Debt-collectors, working the presses. Orrin and Sons, printing money.' },
    forger: { enemies: ['cutthroat', 'forger', 'collector'], boss: true, intro: 'Mistress Quell wipes ink from a stiletto.' },
    nw_1: { enemies: ['cutthroat', 'cutthroat'], intro: 'Two cutthroats step out of an alley with their hoods up.' },
    nw_2: { enemies: ['cutthroat', 'shadowpriest', 'cutthroat'], intro: 'The Pale Hand, working the night streets.' },
    nw_3: { enemies: ['hlknight', 'cutthroat', 'shadowpriest'], intro: 'The last ambush has a knight in it.' },
    ghost4: { enemies: ['shade', 'shade'], waves: [['shade', 'shade']], waveText: ['The bells ring by themselves, and more shades come.'], intro: 'The belfry is full of the dead, and they are all trying to ring the bells.' },
    duel4: { enemies: ['duelist'], boss: true, intro: 'Lord Ashby salutes with his rapier. He has never lost.' }
  });
  Object.assign(D.quests, {
    act4: { name: 'The Plague Gate', short: 'Plague Gate', ch: 4, done: 3, stages: {
      1: 'The catacombs lie behind the old Plague Gate, and its portcullis is down. It is wound from the Chancellery Bell-Tower in the north of the city.',
      2: 'Inquisitor Vell is dead and the winch is turned. The Plague Gate is up.',
      3: 'The way into the catacombs is open.' } },
    rats4: { name: 'The Rat Mother', short: 'Rat Mother', ch: 4, done: 2, stages: {
      1: "The rat-catchers' guild will pay for the Rat Mother, a monster rat in the old sewer under the east quarter.",
      2: "The Rat Mother is dead. The rat-catchers have made you honorary members. There is a badge." } },
    forger4: { name: 'The Forger', short: 'Forger', ch: 4, done: 2, stages: {
      1: 'Forged Ducal notes are flooding Highmoor. The Watch thinks they are printed in the old print-shop by the west wall.',
      2: 'Mistress Quell is beaten and her plates are smashed. The notes were Orrin and Sons paper.' } },
    watch4: { name: 'The Night Watch', short: 'Night Watch', ch: 4, done: 2, stages: {
      1: 'Watch-Sergeant Brand needs help: three gangs of cutthroats are working the city streets at night. Find them.',
      2: 'All three gangs are broken. The Watch owes you a drink. Several drinks.' } },
    ghost4: { name: 'The Belfry Ghost', short: 'Belfry Ghost', ch: 4, done: 2, stages: {
      1: "The cathedral bells ring at midnight with nobody in the belfry. The sexton will not go up there any more.",
      2: 'The belfry is quiet. The bells ring when they are rung, and not otherwise.' } },
    duel4: { name: 'The Duelist', short: 'Duelist', ch: 4, done: 2, stages: {
      1: 'Lord Ashby, the best blade in Highmoor, has challenged "the singer from the south" to a duel in the square. Finch has accepted. Of course he has.',
      2: 'Lord Ashby has lost a duel for the first time. He took it rather well, and paid up.' } }
  });
  Object.assign(D.items, {
    vellbook: { name: "Vell's Book of Names", type: 'charm', mods: { pow: 3, save: 2 }, price: 700, desc: "Every name the Inquisitor ever took. Maren reads it at night and says some of them aloud." },
    ratbadge: { name: "Rat-catcher's Badge", type: 'charm', mods: { spd: 1, dmgBonus: 2 }, price: 520, desc: 'An honour. Of a sort.' },
    quellstiletto: { name: "Quell's Stiletto", type: 'weapon', for: ['dask'], dmg: '1d12+1', mods: { atk: 3, spd: 1 }, price: 900, desc: 'Ink-black, and very sharp.' },
    ashbyrapier: { name: "Ashby's Rapier", type: 'weapon', for: ['finch'], dmg: '1d12+1', mods: { spd: 1, pow: 2, atk: 1 }, price: 900, desc: 'Finch has named it "Fair Point".' },
    watchmail: { name: 'Watch-Sergeant\'s Coat', type: 'armor', for: ['runa', 'maren'], mods: { ac: 6, hp: 10 }, price: 880, desc: 'Brand\'s spare. Too short in the arm for Runa, who wears it anyway.' }
  });

  /* ---------- the Plague Gate is down until the bell-tower winch is turned ---------- */
  const gate = M.undercroft.things.a;
  gate.script = [['if', '!act4done', [
    ['if', '!act4', [
      ['note', 'The catacomb door is behind a portcullis of black iron, every bar as thick as Runa\'s wrist. A chain runs up from it into the dark.'],
      ['say', 'Runa', 'Can I lift it?'],
      ['say', 'Dask', 'No. Nobody can lift it. That is the point of it.'],
      ['say', 'Maren', 'The Plague Gate. They shut the dead in, two hundred years ago. The winch is up in the Chancellery Bell-Tower. The chain runs through the walls.'],
      ['say', 'Finch', 'The Chancellery. Of course it is the Chancellery.'],
      ['set', 'act4'], ['quest', 'act4', 1]
    ], [['note', 'The Plague Gate is down. Its winch is in the Chancellery Bell-Tower.']]],
    ['end']
  ]], ['if', 'q.act4<3', [['note', 'The Plague Gate stands raised, its chain humming. Cold air breathes up from the catacombs.'], ['quest', 'act4', 3]]]];

  /* ---------- the Chancellery Bell-Tower ---------- */
  M.chtower = {
    name: 'The Chancellery Bell-Tower', ground: 'stone', music: 'city', bg: 'city', dark: 0.35,
    rows: [
      '##########################',
      '#....#......k.......#....#',
      '#.c..#......w.......#..d.#',
      '#....#..............#....#',
      '##.#######e###########.###',
      '#........................#',
      '#...a.......)).......b...#',
      '#........................#',
      '####.#######g########.####',
      '#......#....:.....#......#',
      '#..h...#....:.....#...f..#',
      '#......#....x.....#......#',
      '##########################'
    ],
    things: {
      x: { type: 'warp', to: 'highmoor', at: '?', gfx: 'door', under: 'cobble', out: 'down' },
      g: { type: 'foe', sprite: 'cityguard', dir: 'down', script: [['battle', 'bt_gate'], ['remove']] },
      a: { type: 'foe', sprite: 'hlknight', dir: 'right', script: [['battle', 'bt_hall'], ['remove'],
        ['say', 'Dask', 'Pale Hand knights, inside a Chancellery building, with the Chancellery guard. Somebody high up has stopped pretending.']] },
      b: { type: 'foe', sprite: 'cityguard', dir: 'left', script: [['battle', 'bt_bows'], ['remove']] },
      e: { type: 'foe', sprite: 'hlknight', dir: 'down', script: [['battle', 'bt_stair'], ['remove']] },
      f: { type: 'foe', sprite: 'shade', dir: 'left', script: [['battle', 'bt_loft'], ['remove']] },
      c: { type: 'chest', gold: 260, items: { elixir: 2 } },
      d: { type: 'chest', items: { elixir: 1 }, gold: 200 },
      h: { type: 'obj', gfx: 'table', script: [['if', '!btLedger', [
        ['note', 'A clerk\'s desk, ledgers stacked high. Payments to Orrin and Sons: for keys, for silver, for brandy, for a door kept frozen. Every one is signed with a little grey hand.'],
        ['say', 'Maren', 'Orrin and Sons are not the Pale Hand. They are its purse.'],
        ['say', 'Dask', 'I owed those people money for six years. I have been paying for all of this.'],
        ['set', 'btLedger'], ['xp', 60]
      ], [['note', 'The ledgers of the Chancellery. Grey hands on every page.']]]] },
      k: { type: 'foe', sprite: 'inquisitor', dir: 'down', script: [
        ['say', 'Inquisitor Vell', 'The Wardens\' errand-runners. Four shards in four bags, carried all the way to my door. How considerate.'],
        ['say', 'Runa', 'Three shards. And you are not getting them.'],
        ['say', 'Inquisitor Vell', 'Three today. My master is patient. I have written all your names in my book. I write everyone\'s.'],
        ['battle', 'inquisitor'], ['remove'],
        ['note', 'Vell\'s book falls open. The last page has four names on it, in neat, small letters: RUNA. DASK. MAREN. FINCH. Under them, a grey hand.'],
        ['say', 'Finch', 'I have been in a lot of books. This is the first one I did not want to be in.'],
        ['set', 'vellDone'], ['give', 'vellbook'], ['xp', 120], ['save']
      ] },
      w: { type: 'obj', gfx: 'wheel', script: [['if', 'act4done', [['note', 'The winch is locked, the Plague Gate raised.']], [['if', 'vellDone', [
        ['note', 'It takes all four of you on the spokes. Somewhere far below, through the walls of the city, iron grinds on iron.'],
        ['sfx', 'lever'], ['shake', 600],
        ['say', 'Runa', 'That is the gate?'],
        ['say', 'Maren', 'That is the gate. Down, then. Into the dead.'],
        ['set', 'act4done'], ['quest', 'act4', 2], ['xp', 60], ['save']
      ], [['note', 'The great winch of the Plague Gate. Vell is standing beside it, reading.']]]]]] }
    }
  };
  M.chtower.things.x.at = D.placeNear('highmoor', null, 30, 6, { tag: 'toTower4', type: 'warp', to: 'chtower', at: 'x', gfx: 'door', under: 'cobble', out: 'up' });

  /* ---------- the Charnel Galleries: between the Catacombs and the Fourth Tomb ---------- */
  M.catacombs1.things.z.to = 'charnel'; M.catacombs1.things.z.at = 'u';
  M.catacombs2.things.u.to = 'charnel'; M.catacombs2.things.u.at = 'z';
  function saint(n, text) {
    return [['if', 'saint4.' + n, [['note', 'The bone-saint faces the stair.']], [
      ['note', 'A saint built entirely of bones, facing the wall. ' + text],
      ['note', 'Runa puts her shoulder to it. It turns, grinding, until it faces the stair.'],
      ['set', 'saint4.' + n], ['xp', 30]
    ]]];
  }
  M.charnel = {
    name: 'The Charnel Galleries', ground: 'stone', music: 'dungeon', bg: 'crypt', dark: 0.75,
    rows: [
      '############################',
      '##########....z....#########',
      '##########.........#########',
      '##########....k....#########',
      '#############y##############',
      '#..........................#',
      '#..a....b.....)).....d...e.#',
      '#..........................#',
      '###.######.#######f######g##',
      '#.....#.......#.......#....#',
      '#..1..#..c....#...2...#..h.#',
      '#.....#.......#.......#.3..#',
      '#.....#...u...#.......#....#',
      '############################'
    ],
    things: {
      u: { type: 'warp', to: 'catacombs1', at: 'z', gfx: 'stairsUp', out: 'up' },
      z: { type: 'warp', to: 'catacombs2', at: 'u', gfx: 'stairsDown', out: 'down' },
      a: { type: 'foe', sprite: 'boneknight', dir: 'right', script: [['run', 'cgIntro'], ['battle', 'cg_bones'], ['remove']] },
      b: { type: 'foe', sprite: 'shade', dir: 'down', script: [['battle', 'cg_shades'], ['remove']] },
      d: { type: 'foe', sprite: 'cutthroat', dir: 'left', script: [['battle', 'cg_cult'], ['remove'],
        ['note', 'The grave-robbers\' sacks are full of skulls, every one with a name cut into the brow.'],
        ['say', 'Maren', 'Warden skulls. They are collecting the dead Wardens of Highmoor.'],
        ['say', 'Finch', 'Somebody is making a list. Somebody is always making a list.']] },
      f: { type: 'foe', sprite: 'boneknight', dir: 'up', script: [['battle', 'cg_gate1'], ['remove']] },
      g: { type: 'foe', sprite: 'ghoul', dir: 'up', script: [['battle', 'cg_gate2'], ['remove']] },
      e: { type: 'obj', gfx: 'sarcophagus', script: [
        ['note', 'A plain stone coffin under a hundred painted skulls. Carved on it: ALDOUS OF THE BRIDGES. HE KEPT THE FOURTH, AND TOLD NO ONE WHERE.'],
        ['say', 'Maren', 'The fourth Warden. Oswin, Corran, Hedda, and now Aldous.'],
        ['say', 'Runa', 'And the fifth?'],
        ['say', 'Maren', 'Nobody ever wrote the fifth down. I am starting to think that was on purpose.'],
        ['if', '!cgLore', [['xp', 60], ['set', 'cgLore']]]
      ] },
      c: { type: 'chest', gold: 240, items: { elixir: 2 } },
      h: { type: 'chest', items: { elixir: 2 }, gold: 220 },
      1: { type: 'obj', gfx: 'statue', script: saint(1, 'A plaque at its feet: SAINT ORM, WHO COUNTED THE DEAD.') },
      2: { type: 'obj', gfx: 'statue', script: saint(2, 'A plaque at its feet: SAINT BEL, WHO BURIED THEM.') },
      3: { type: 'obj', gfx: 'statue', script: saint(3, 'A plaque at its feet: SAINT HOLLIN, WHO REMEMBERED THEM.') },
      y: { type: 'obj', gfx: 'doorStone', unless: 'cg.open', script: [['if', 'saint4.1&saint4.2&saint4.3', [
        ['note', 'With three saints watching, the gallery door slides aside on its own. Bone-dust sifts down from the ceiling.'],
        ['sfx', 'lever'], ['shake', 400], ['set', 'cg.open'], ['remove']
      ], [['note', 'A door of fitted skulls. Above it: LET THE SAINTS SEE THE STAIR.'],
        ['say', 'Dask', 'Three saints in the bays, all looking at the wall. Sulking, probably.']]]] },
      k: { type: 'foe', sprite: 'boneknight', dir: 'down', script: [
        ['say', 'Finch', 'Is that a bishop made of bones?'],
        ['say', 'Maren', 'An abbot. The Charnel Abbot. He kept the galleries, when there were people to keep them for.'],
        ['note', 'The Abbot\'s jaw moves. No sound comes out, but you all hear it anyway: NO MORE LISTS.'],
        ['battle', 'charnelabbot'], ['remove'],
        ['note', 'The Abbot falls apart into a heap of very old bones and, on top, one very new grey wax seal.'],
        ['say', 'Dask', 'They had him on a leash too. Everything down here is on somebody\'s leash.'],
        ['set', 'abbotDone'], ['xp', 80], ['save']
      ] }
    }
  };
  D.scripts.cgIntro = [['if', '!cgIntro', [
    ['note', 'Below the catacombs, the galleries: long halls walled entirely with bones, stacked and patterned like brickwork.'],
    ['say', 'Runa', 'How many?'],
    ['say', 'Maren', 'All of Highmoor, for six hundred years. Every plague, every war.'],
    ['say', 'Finch', 'Somebody took a great deal of care over the patterns.'],
    ['set', 'cgIntro']
  ]]];
  D.placeNear('charnel', null, 12, 7, { tag: 'cgCamp', type: 'obj', gfx: 'shrine', script: [['note', 'A sexton\'s lamp-niche. Someone left bread, a long time ago.'], ['run', 'campsite']] });

  /* ================= side work, from Highmoor's notice board ================= */
  D.placeNear('highmoor', null, 22, 16, { tag: 'board4', type: 'sign', gfx: 'notice', script: [
    ['topics', null, 'The city notice board. Proclamations, wanted notices, lost cats.', [
      ['"THE RAT MOTHER" (Rat-catchers)', [['note', 'BY ORDER OF THE WORSHIPFUL GUILD OF RAT-CATCHERS: 400 CROWNS FOR THE RAT MOTHER. EAST SEWER. SHE IS LARGE.'], ['if', '!q.rats4', [['quest', 'rats4', 1]]]], 'q.rats4<2'],
      ['"FORGED NOTES" (the Watch)', [['note', 'FORGED DUCAL NOTES IN CIRCULATION. CHECK YOUR CHANGE. THE WATCH SUSPECTS THE OLD PRINT-SHOP BY THE WEST WALL.'], ['if', '!q.forger4', [['quest', 'forger4', 1]]]], 'q.forger4<2'],
      ['"THE NIGHT WATCH" (Sgt. Brand)', [['note', 'WANTED: STOUT HELP FOR THE NIGHT WATCH. THREE GANGS ON THE STREETS. ASK NOBODY. JUST FIND THEM. - SGT BRAND'], ['if', '!q.watch4', [['quest', 'watch4', 1]]]], 'q.watch4<2'],
      ['"THE BELFRY" (the Sexton)', [['note', 'In a shaky hand: THE CATHEDRAL BELLS RING AT MIDNIGHT AND THERE IS NO ONE UP THERE. I AM NOT GOING UP THERE AGAIN. - THE SEXTON'], ['if', '!q.ghost4', [['quest', 'ghost4', 1]]]], 'q.ghost4<2'],
      ['"A CHALLENGE" (Lord Ashby)', [['note', 'Gold ink on cream card: LORD ASHBY CHALLENGES THE SINGER FROM THE SOUTH TO SETTLE A MATTER OF HONOUR IN THE SQUARE. ANY HOUR.'], ['say', 'Finch', 'A matter of honour? I said one thing about his hat.'], ['if', '!q.duel4', [['quest', 'duel4', 1]]]], 'q.duel4<2']
    ], 'Leave the board']
  ] });

  /* ---------- the Rat Mother ---------- */
  M.sewer4 = {
    name: 'The East Sewer', ground: 'cobble2', music: 'undercroft', bg: 'sewer', dark: 0.65,
    rows: [
      '########################',
      '#..c.....~~~~~.....r...#',
      '#........~~~~~.........#',
      '#...b....=====....d....#',
      '#........~~~~~.........#',
      '####.####~~~~~####.#####',
      '#........~~~~~.........#',
      '#...a....=====.........#',
      '#.x......~~~~~.........#',
      '########################'
    ],
    things: {
      x: { type: 'warp', to: 'highmoor', at: '?', gfx: 'ladder', out: 'up' },
      a: { type: 'foe', sprite: 'rat', dir: 'right', script: [['battle', 'rs_rats'], ['remove']] },
      b: { type: 'foe', sprite: 'ooze', dir: 'right', script: [['battle', 'rs_ooze'], ['remove']] },
      d: { type: 'foe', sprite: 'rat', dir: 'left', script: [['battle', 'rs_nest'], ['remove']] },
      r: { type: 'foe', sprite: 'rat', dir: 'left', script: [['battle', 'ratmother'], ['remove'],
        ['note', 'The Rat Mother is dead. The squeaking stops all at once, everywhere in the sewer.'],
        ['quest', 'rats4', 2], ['gold', 400], ['give', 'ratbadge'], ['xp', 600]] },
      c: { type: 'chest', gold: 220, items: { elixir: 1 } }
    }
  };
  M.sewer4.things.x.at = D.placeNear('highmoor', null, 40, 22, { tag: 'toSewer4', type: 'warp', to: 'sewer4', at: 'x', gfx: 'crack', under: 'cobble', out: 'down', if: 'q.rats4>=1' });

  /* ---------- the forger ---------- */
  M.printshop = {
    name: 'The Old Print-shop', ground: 'wood', music: 'city', bg: 'tavern', dark: 0.4,
    rows: [
      '####################',
      '#..c...#.....q.....#',
      '#......#...........#',
      '#..b...+....d......#',
      '#......#...........#',
      '####.###...........#',
      '#.......a..........#',
      '#........x.........#',
      '####################'
    ],
    things: {
      x: { type: 'warp', to: 'highmoor', at: '?', gfx: 'door', under: 'wood', out: 'down' },
      a: { type: 'foe', sprite: 'cutthroat', dir: 'down', script: [['battle', 'ps_door'], ['remove']] },
      b: { type: 'foe', sprite: 'collector', dir: 'right', script: [['battle', 'ps_press'], ['remove']] },
      d: { type: 'obj', gfx: 'table', script: [['note', 'A press, still inked. Sheets of Ducal notes hang drying on strings: perfect, except for the tiny grey hand in the watermark.']] },
      q: { type: 'foe', sprite: 'quell', dir: 'down', script: [
        ['say', 'Mistress Quell', 'Dask Underbough. Your debt is on my desk. Shall I write it off?'],
        ['say', 'Dask', 'I would rather write you off.'],
        ['battle', 'forger'], ['remove'],
        ['note', 'Runa smashes the plates with the flat of her axe. Dask finds his own name in Quell\'s debt-book, and burns the page in the lamp.'],
        ['set', 'quellDone'], ['set', 'daskDebtBurned'], ['quest', 'forger4', 2], ['gold', 300], ['give', 'quellstiletto'], ['xp', 600]
      ] },
      c: { type: 'chest', gold: 380 }
    }
  };
  M.printshop.things.x.at = D.placeNear('highmoor', null, 2, 18, { tag: 'toPrint', type: 'warp', to: 'printshop', at: 'x', gfx: 'door', under: 'cobble', out: 'up', if: 'q.forger4>=1' });

  /* ---------- the night watch ---------- */
  [['1', 'nw_1', 8, 6], ['2', 'nw_2', 36, 28], ['3', 'nw_3', 14, 30]].forEach(([n, grp, x, y]) => D.placeNear('highmoor', null, x, y, { tag: 'gang' + n, type: 'foe', sprite: 'cutthroat', dir: 'down', if: 'q.watch4=1&!gang.' + n, script: [
    ['note', 'Hooded shapes in a doorway. One of them is weighing a cosh in his hand.'],
    ['battle', grp], ['set', 'gang.' + n], ['add', 'gangsDone'], ['xp', 40],
    ['if', 'gangsDone=3', [['quest', 'watch4', 2], ['note', 'A whistle in the dark: Sergeant Brand and the Watch arrive, a little late, as usual.'],
      ['say', 'Watch-Sergeant Brand', 'All three. I owe you. Here, take my spare coat. It is a good coat.'], ['gold', 250], ['give', 'watchmail'], ['xp', 540]]],
    ['remove']
  ] }));

  /* ---------- the belfry ---------- */
  D.placeNear('h_cathedral', null, 4, 2, { tag: 'belfry', type: 'obj', gfx: 'bell', if: 'q.ghost4=1', script: [
    ['note', 'The belfry stair. At the top, the bells are swinging, and nobody is pulling the ropes.'],
    ['battle', 'ghost4'],
    ['note', 'When the last shade goes, the bells stop. In the silence, Maren lights a candle on the sill.'],
    ['say', 'Maren', 'They were bell-ringers. They just wanted to finish their shift.'],
    ['quest', 'ghost4', 2], ['gold', 260], ['give', 'silverbell'], ['xp', 600], ['remove']
  ] });

  /* ---------- the duel ---------- */
  D.placeNear('highmoor', null, 20, 20, { tag: 'ashby', type: 'npc', sprite: 'duelist', dir: 'left', if: 'q.duel4=1', script: [
    ['say', 'Lord Ashby', 'The singer from the south. You called my hat "a hen that has given up".'],
    ['say', 'Finch', 'In fairness, it has.'],
    ['say', 'Lord Ashby', 'To first blood. Then to second blood, because I am still annoyed.'],
    ['battle', 'duel4'],
    ['say', 'Lord Ashby', 'Well. Well! Nobody has done that in eleven years. Take the blade. You have earned it. And the hat. I am done with the hat.'],
    ['quest', 'duel4', 2], ['gold', 200], ['give', 'ashbyrapier'], ['xp', 600], ['remove']
  ] });
})();
