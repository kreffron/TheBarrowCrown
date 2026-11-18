/* Chapter 5 — Greyhold, the Mirror Barrow, and the three floors of the Hollow Barrow. */
(function () {
  const D = G.D, M = D.maps;

  /* ---------- Greyhold (optional) ---------- */
  D.scripts.knightFight = [['note', 'The Ashen Knight rises from his chair.'], ['battle', 'ashenknight'], ['remove', 'greyhold.k']];
  M.greyhold = {
    name: 'Greyhold', ground: 'stone', music: 'dungeon', bg: 'crypt', dark: 0.55,
    legend: { B: 'bars' },
    rows: [
      '##########################',
      '##########################',
      '###....#..........#....###',
      '###.pt.#....k.....#.r..###',
      '###BBBB#..........#BBBB###',
      '##......................##',
      '##..........Q...........##',
      '##.......l......c.......##',
      '##+....................+##',
      '##......................##',
      '############g.############',
      '############..############',
      '##########......##########',
      '##########......##########',
      '##########......##########',
      '##########......##########',
      '##########......##########',
      '############u#############'
    ],
    things: {
      u: { type: 'warp', to: 'ashroad', at: 'g', gfx: 'daylight', out: 'down' },
      g: { type: 'foe', sprite: 'palecrusader', dir: 'down', script: [['note', 'Pale Crusaders guard the inner gate.'], ['battle', 'gh_guards'], ['remove']] },
      k: { type: 'foe', sprite: 'ashenknight', dir: 'down', script: [['say', 'Ashen Knight', 'The Chancellor said someone would come for the prisoners. He said they would be noble, and stupid.'], ['run', 'knightFight']] },
      l: { type: 'obj', gfx: 'lever', gfxIf: ['prisonersFreed', 'leverOn'], script: [['if', 'prisonersFreed', [['note', 'The cell lever is thrown.']], [
        ['if', '!x.greyhold.k', [['say', 'Ashen Knight', 'Touch that, and I will finish what the Chancellor started.'], ['run', 'knightFight']]],
        ['sfx', 'lever'], ['shake', 300],
        ['note', 'The cell doors grind open all along the hall. Wardens, carters, a smith from Saltmere, an old woman from Highmoor who says she will walk home herself, thank you.'],
        ['set', 'prisonersFreed'], ['if', 'shard1Stolen', [['set', 'tobiasFree']]], ['quest', 'greyhold', 2], ['xp', 500]
      ]]] },
      p: { type: 'npc', sprite: 'oriel', unless: 'prisonersFreed', dir: 'down', script: [['say', 'Prisoner', 'Wardens of the Lamp, all of us. The lever by the hall door opens the cells. If you can get past HIM.']] },
      t: { type: 'npc', sprite: 'tobias', if: 'shard1Stolen', unless: 'prisonersFreed', dir: 'down', script: [['say', 'Tobias', 'Maren! And the big one, and the singer, and the thief. Lamplighter be thanked. Get me out of here and I will never complain about my knees again.']] },
      r: { type: 'npc', sprite: 'hobb', unless: 'prisonersFreed', dir: 'down', script: [['say', 'Hobb', 'They took my cart. And my horse. And me. In that order, if you want to know their priorities.']] },
      c: { type: 'chest', gold: 450, items: { elixir: 2, fivelamps: 1 } }
    }
  };

  /* ---------- the Mirror Barrow (optional) ---------- */
  const mirrorDone = ['if', 'mr.r&mr.d&mr.n&mr.f', [['note', 'In the central hall, the great mirror has begun to shine.']]];
  M.mirror = {
    name: 'The Mirror Barrow', ground: 'stone', music: 'omen', bg: 'crypt', dark: 0.6,
    rows: [
      '############################',
      '############################',
      '##......I.########.I......##',
      '##...r....########....d...##',
      '##........########........##',
      '##........########........##',
      '##........########........##',
      '##........................##',
      '###########..m...###########',
      '###########......###########',
      '###########......###########',
      '###########......###########',
      '##........#......#........##',
      '##........#......#........##',
      '##........................##',
      '##...n....#......#....f...##',
      '##........#..h...#........##',
      '##......I.#......#.I......##',
      '###########......###########',
      '#############u##############'
    ],
    things: {
      u: { type: 'warp', to: 'ashroad', at: 'v', gfx: 'daylight', out: 'down' },
      h: { type: 'obj', gfx: 'shrine', script: [['note', 'A lamp in front of the mirror. It burns without oil.'], ['run', 'campsite']] },
      r: { type: 'npc', sprite: 'kell', unless: 'mr.r', dir: 'down', script: [
        ['say', 'Hallvard', 'Runa. You left the door.'],
        ['choice', 'Runa', '(Old Hallvard, as he was the night he died.)', [
          ['"I would do it again."', [['say', 'Hallvard', 'Good. So would I. That is why I held it.']]],
          ['"I am sorry."', [['say', 'Hallvard', 'Don\'t be, girl. You chose Bryn. I chose the door. We were both right.']]]
        ]],
        ['say', 'Hallvard', 'Here. Your mother asked me to give you this, if I ever saw you again.'],
        ['give', 'stonehand'], ['set', 'mr.r'], ['xp', 250], mirrorDone, ['remove']
      ] },
      d: { type: 'foe', sprite: 'mirrorshade', unless: 'mr.d', dir: 'down', script: [
        ['note', 'Ledgers, floor to ceiling. Every debt Dask ever owed, in his own handwriting. Two of the ledgers stand up.'],
        ['battle', 'ms_dask'],
        ['note', 'When the shades are gone, one page is left on the floor. It is blank. Nothing owed.'],
        ['say', 'Dask', 'I am keeping this one.'],
        ['give', 'clearledger'], ['set', 'mr.d'], mirrorDone, ['remove']
      ] },
      n: { type: 'npc', sprite: 'fisher2', unless: 'mr.n', dir: 'down', script: [
        ['say', 'Odric', 'You are Maren. My sister\'s teacher. She talked about you every time she wrote.'],
        ['say', 'Maren', 'Odric. She buried you. She has not stopped burying you since.'],
        ['say', 'Odric', 'Tell her it was never her fault. The fen takes who it takes. Tell her to come home, and light a lamp for me, and then stop.'],
        ['say', 'Odric', 'And take this. She would want you to have it. It was mine.'],
        ['give', 'odricslamp'], ['set', 'odricMsg'], ['set', 'mr.n'], ['xp', 250], ['bond', 'maren', 1], mirrorDone, ['remove']
      ] },
      f: { type: 'npc', sprite: 'hrolf', unless: 'mr.f', dir: 'down', script: [
        ['say', 'Grandmother', 'Finch. You got fat.'],
        ['say', 'Finch', 'Grandmother! I... that is... I have been eating well. Travelling.'],
        ['say', 'Grandmother', 'I never sang you the fifth verse because it had no ending. You know that now.'],
        ['say', 'Grandmother', 'So write one. A good one. And sing it loud, so Ennet hears it.'],
        ['give', 'grandmaharp'], ['set', 'grandmaBlessing'], ['set', 'mr.f'], ['xp', 250], ['bond', 'finch', 1], mirrorDone, ['remove']
      ] },
      m: { type: 'obj', gfx: 'mirror', script: [['if', 'q.mirror>=2', [['note', 'The mirror shows four friends, and a road.']], [
        ['if', 'mr.r&mr.d&mr.n&mr.f', [
          ['note', 'The great mirror shows the four of you, exactly as you are. Then the reflection smiles, which none of you did, and steps out.'],
          ['battle', 'hollowself'],
          ['note', 'The mirror is only a mirror again.'],
          ['quest', 'mirror', 2], ['xp', 300]
        ], [['note', 'A great mirror. It shows the hall behind you, but not you. Four side chambers open off the hall.']]]
      ]]] }
    }
  };

  /* ---------- the Hollow Barrow, 1: the Court of the Dead ---------- */
  const NAMES = ['Vael Morn', 'Morn Vael', 'Ilvane Corr', 'Oswin the Thane', 'The Barrow King'];
  M.hollow1 = {
    name: 'The Hollow Barrow', ground: 'stone', music: 'dungeon', bg: 'throne', dark: 0.7,
    legend: { '#': 'obsidian' },
    onEnter: [['if', 'q.main5<4', [['quest', 'main5', 4]]]],
    rows: [
      '##############################',
      '##############z###############',
      '##############g###############',
      '##..........................##',
      '##........I........I........##',
      '##...1..................2...##',
      '##............VV............##',
      '##............VV............##',
      '##....I................I....##',
      '#............................#',
      '#a..........................b#',
      '#.......3............4.......#',
      '##..........................##',
      '##..........................##',
      '##############n.##############',
      '##############..##############',
      '############......############',
      '############...p..############',
      '############......############',
      '############+....+############',
      '############......############',
      '##############x###############'
    ],
    things: {
      x: { type: 'warp', to: 'ashroad', at: 'z', gfx: 'daylight', out: 'up' },
      z: { type: 'warp', to: 'hollow2', at: 'u', gfx: 'stairsDown', out: 'down' },
      n: { type: 'foe', sprite: 'deathknight', dir: 'down', script: [['battle', 'court'], ['remove']] },
      p: { type: 'sign', gfx: 'notice', text: '"HERE SITS THE COURT OF THE KING WHO WOULD NOT DIE. SPEAK HIS NAME, AND HE WILL HEAR YOU."' },
      a: { type: 'obj', gfx: 'statue', script: [['note', 'A statue of a young king with a kind face, before the crown. On the plinth: VAEL.'], ['set', 'nameA']] },
      b: { type: 'obj', gfx: 'statue', script: [['note', 'A statue of an old king with no face at all, after the crown. On the plinth: MORN.'], ['if', 'nameA', [['say', 'Finch', 'Vael Morn. Mornvale. We named the whole valley after him, and forgot why.']]], ['set', 'nameB']] },
      g: { type: 'obj', gfx: 'kingdoor', script: [
        ['note', 'A door of black stone, with a mouth carved in it. "SPEAK HIS NAME."'],
        ['choice', null, 'Speak the King\'s name:', NAMES.map(n => [n, n === 'Vael Morn' ? [['sfx', 'door'], ['shake', 400], ['note', 'The mouth repeats it, very softly, and the door opens.'], ['remove'], ['xp', 200]]
          : [['sfx', 'bad'], ['note', 'The mouth screams. The cold of it knocks you back.'], ['hurt', 'all', '3d8']]]).concat([['Say nothing', []]])]
      ] },
      1: { type: 'npc', sprite: 'courtier', dir: 'right', script: [['note', 'A courtier, still bowing, three hundred years into the bow.']] },
      2: { type: 'npc', sprite: 'courtier', dir: 'left', script: [['note', 'A courtier with a goblet. The wine dried centuries ago.']] },
      3: { type: 'npc', sprite: 'courtier', dir: 'right', script: [['note', 'A courtier mid-laugh. You would rather not know at what.']] },
      4: { type: 'npc', sprite: 'courtier', dir: 'left', script: [['note', 'A courtier, whispering to nobody.']] }
    }
  };

  /* ---------- the Hollow Barrow, 2: the Door ---------- */
  M.hollow2 = {
    name: 'The Last Door', ground: 'stone', music: 'dungeon', bg: 'throne', dark: 0.72,
    legend: { '#': 'obsidian' },
    rows: [
      '############################',
      '#############u##############',
      '#############.##############',
      '#############w##############',
      '#############.##############',
      '#############.##############',
      '##...........t............##',
      '##.+....................+.##',
      '##...I...............I....##',
      '##........................##',
      '##........................##',
      '##........................##',
      '##..h.....................##',
      '##..........2.............##',
      '##.........v.c.1..........##',
      '##...I...............I....##',
      '##...........d............##',
      '##..........#z#...........##',
      '############################',
      '############################'
    ],
    things: {
      u: { type: 'warp', to: 'hollow1', at: 'z', gfx: 'stairsUp', out: 'down' },
      z: { type: 'warp', to: 'hollow3', at: 'u', gfx: 'stairsDown', out: 'up' },
      w: { type: 'foe', sprite: 'ashghoul', dir: 'up', script: [['battle', 'hw_dead'], ['remove']] },
      t: { type: 'trigger', script: [['run', 'doorScene']] },
      h: { type: 'obj', gfx: 'shrine', script: [['note', 'Somebody left a lamp here, a long time ago, and it is still burning. Ennet\'s, perhaps.'], ['run', 'campsite']] },
      d: { type: 'obj', gfx: 'kingdoor', unless: 'doorOpen', script: [['say', '???', 'Not while I keep it.']] },
      c: { type: 'npc', sprite: 'corrcrowned', unless: 'corrTaken', dir: 'up', script: [['say', 'Ilvane Corr', 'Patience, heroes.']] },
      v: { type: 'npc', sprite: 'veyra', if: 'cs.v5', dir: 'up', script: [] },
      1: { type: 'npc', sprite: 'palecrusader', unless: 'corrTaken', dir: 'up', script: [] },
      2: { type: 'npc', sprite: 'palemagus', unless: 'corrTaken', dir: 'up', script: [] }
    }
  };

  /* ---------- the Hollow Barrow, 3: the Throne ---------- */
  M.hollow3 = {
    name: 'The Throne of Vael Morn', ground: 'stone', music: 'omen', bg: 'throne', dark: 0.6,
    legend: { '#': 'obsidian', T: 'throneBack' },
    rows: [
      '########################',
      '########################',
      '##....+....T....+.....##',
      '##.........k..........##',
      '##..I.............I...##',
      '##.........o..........##',
      '##....................##',
      '##......e.....v.......##',
      '##....................##',
      '##..I.............I...##',
      '##....................##',
      '##.........t..........##',
      '###########..###########',
      '###########..###########',
      '###########u.###########',
      '########################'
    ],
    things: {
      u: { type: 'warp', to: 'hollow2', at: 'z', gfx: 'stairsUp', out: 'down' },
      t: { type: 'trigger', script: [['run', 'kingScene']] },
      k: { type: 'npc', sprite: 'king', unless: 'kingDown', dir: 'down', script: [] },
      e: { type: 'npc', sprite: 'ennet', unless: 'ending=2', dir: 'right', script: [['if', 'ch5done', [['say', 'Ennet', 'Go home, all of you. I am going to sit in the sun for about a hundred years.']], [['say', 'Ennet', 'Not yet. Not while he sits there.']]]] },
      v: { type: 'npc', sprite: 'veyra', if: 'veyraWith', unless: 'ending=3', dir: 'left', script: [['say', 'Veyra', 'I am here, Maren.']] },
      o: { type: 'obj', gfx: 'lampDead', gfxIf: ['ch5done', 'shrine'], script: [['if', 'ch5done', [['note', 'A lamp, burning white, where the crown fell.']], [['note', 'The King\'s lamp. It has never been lit.']]]] }
    }
  };
})();
