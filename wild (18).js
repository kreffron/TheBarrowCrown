/* Chapter 1 — Thornwood and the Thane's Barrow. */
(function () {
  const M = G.D.maps;

  M.thornwood = {
    name: 'Thornwood', ground: 'grass', ground2: 'flowers', music: 'field', bg: 'forest',
    legend: { '|': 'web' },
    encounters: { rate: 0.14, min: 7, groups: [['wood_rats', 2], ['wood_wolves', 3], ['wood_goblins', 3], ['wood_spiders', 2], ['wood_scouts', 2]] },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT@@@@@@@TTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT@@#e#@@TTTTTT',
      'TTT..q..TTTTTTTTTTTTTTTTTTTTT.....:..h...TTT',
      'TT..m..|.TTTTTTTTTTT....TTTT......:.......TT',
      'TT.......TTTTTTTT.........TT......:......TTT',
      'TTT|....TTTTTT..............TT....k....TTTTT',
      'TTTT..|TTTTTT....TT...........m...:...TTTTTT',
      'TTTTT.TTTTTT....TTTT..............:..TTTTTTT',
      'TTTTT.TTTTT.....TTT..::::::::::::::..TTTTTTT',
      'TTTT..TTTT......TT...:..........TTTTTTTTTTTT',
      'TTTT.TTTTT..TT.......:....,.....TTTTTTTTTTTT',
      'TTTT.TTTT............:.........TTTT....TTTTT',
      'TTT..TTTT....TT......:...........o.d..TTTTTT',
      'TTT.TTTTT............:.........TTTT....TTTTT',
      'TTT..TTTTTT....TT....:......TTTTTTTTTTTTTTTT',
      'TTTT...TTTTT.........:..........TTT~~~TTTTTT',
      'TTTT....TTTT...,.....:.....,.....~~~~~~.TTTT',
      'TTT......TTT.........:..........~~~~~~~..TTT',
      'TT...w....TT....TT...:....TT....~~~c~~~.mTTT',
      'TT..g.......T........:..........~~~.~~~..TTT',
      'TT.......:::::::::::::...........~~.~~...TTT',
      'TTT.....T............:....,..............TTT',
      'TTTT...TTT....TT.....:.......TT.........zyTT',
      'TTTTTTTTTTT..........:..................TTTT',
      'TTTTTTTTTTTT...,.....:.....TTT......,..TTTTT',
      'TTTTTTTTTTTTT........:......TT........TTTTTT',
      'TTTTTTTTTTTTTT...TT..:..............TTTTTTTT',
      'TTTTTTTTTTTTTTT......:....,.......TTTTTTTTTT',
      'TTTTTTTTTTTTTTTTT...t:.........TTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTT..:..TTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTT:TTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTsTTTTTTTTTTTTTTTTTTTTTT'
    ],
    things: {
      s: { type: 'warp', to: 'brackenford', at: 'n', under: 'path', out: 'up' },
      e: { type: 'warp', to: 'barrow1', at: 'x', gfx: 'caveMouth', under: 'path', out: 'down' },
      t: { type: 'sign', text: 'THORNWOOD. Keep to the road.' },
      z: {
        type: 'obj', gfx: 'bramble', script: [
          ['note', 'A wall of old brambles, thick as a fist. Behind them, a glimpse of carved stone.'],
          ['if', 'chapelHint', [['say', 'Finch', "The Doorward's Chapel. Tobias said the brambles took it."]]],
          ['check', 'runa', 10, [['sfx', 'hit'], ['say', 'Runa', 'Stand back.'], ['note', 'Runa hacks a way through. Beyond is a stair going down into the hill.'], ['remove']],
            [['hurt', 'runa', '1d3'], ['say', 'Runa', 'They bite back. Again.']]]
        ]
      },
      y: { type: 'warp', to: 'chapel', at: 'u', gfx: 'stairsDown', under: 'grass', out: 'left' },
      q: { type: 'foe', sprite: 'spider', dir: 'down', script: [
        ['note', 'Webs hang thick between the trees. In the middle of them, something the size of a cart unfolds its legs.'],
        ['battle', 'nest'], ['remove'], ['quest', 'nest', 2],
        ['say', 'Finch', 'I am going to dream about that. Several times.']
      ] },
      m: { type: 'pickup', gfx: 'mushroom', item: 'palecap' },
      h: { type: 'obj', gfx: 'shrine', script: [['note', 'A wayshrine of the Lamplighter. Its small flame still burns.'], ['run', 'campsite']] },
      c: { type: 'chest', lock: 12, gold: 25, items: { luckycoin: 1 } },
      d: { type: 'chest', items: { wolftooth: 1, draught: 2 } },
      o: {
        type: 'obj', gfx: 'boulder', script: [
          ['note', 'A boulder is wedged between two oaks. Something glints beyond it.'],
          ['check', 'runa', 12, [['sfx', 'lever'], ['shake', 300], ['say', 'Runa', 'Move.'], ['note', 'It moves.'], ['remove']],
            [['hurt', 'runa', '1d3'], ['say', 'Runa', '...It will move. Give me a moment.']]]
        ]
      },
      w: { type: 'foe', sprite: 'alpha', dir: 'left', script: [['battle', 'wolfpack'], ['remove'], ['note', 'The last wolf slinks off into the trees.']] },
      g: {
        type: 'npc', sprite: 'garrick', unless: 'q.wood>=2', script: [['if', 'x.thornwood.w', [
          ['say', 'Garrick', 'Bless you. Two nights up that oak, and me with a bad knee.'],
          ['say', 'Garrick', 'Goblins took my cart. They are hauling old silver out of the barrow by the sackful. And they are not working alone. Somebody in grey robes was paying them.'],
          ['if', 'knowsVeyra', [['say', 'Maren', 'Grey robes. Then Tobias was right.']], [['say', 'Maren', 'Grey robes.']]],
          ['say', 'Garrick', 'I will make my own way home. Wenna will have my hide. Thank you, truly.'],
          ['set', 'knowsGrey'], ['set', 'knowsGarrick'], ['quest', 'wood', 2], ['xp', 20]
        ], [['say', 'Garrick', 'Mind the wolves! Mind the big one!']]]]
      },
      k: {
        type: 'foe', sprite: 'archer', under: 'path', script: [
          ['say', 'Goblin', 'Oi! No further! Grukk says nobody comes up the hill!'],
          ['choice', null, 'Two goblin lookouts, slings half raised. The nearer one keeps glancing back at the barrow.', [
            ['Fight', [['run', 'snikFight']]],
            ['Finch: talk him down', [['check', 'finch', 12, [
              ['say', 'Finch', 'Friend, you keep looking over your shoulder at that hill. In my experience nobody does that when things are going well up it.'],
              ['bond', 'finch', 1], ['run', 'snikTalks']
            ], [
              ['say', 'Finch', 'Friend! Let us reason together, as...'],
              ['say', 'Goblin', 'Singer! Grukk says singers first!'],
              ['run', 'snikFight']
            ]]]],
            ['Dask: buy him off (15 gold)', [
              ['gold', -15],
              ['say', 'Dask', 'Fifteen gold. That is fifteen more than Grukk pays you, and all you have to do is be somewhere else.'],
              ['bond', 'dask', 1], ['run', 'snikTalks']
            ], 'gold>=15'],
            ['Runa: scare them off', [['check', 'runa', 11, [
              ['note', 'Runa says nothing. She takes one step forward and lets the axe-head drop into her palm.'],
              ['say', 'Goblin', '...Snik just remembered. Snik left a thing. In a different forest.'],
              ['note', 'The lookouts bolt. One of them drops his pouch.'],
              ['gold', 12], ['set', 'snik', 2], ['xp', 15], ['remove']
            ], [
              ['say', 'Goblin', 'Big one is slow! Get the big one!'],
              ['run', 'snikFight']
            ]]]]
          ]]
        ]
      }
    }
  };

  M.barrow1 = {
    name: "The Thane's Barrow", ground: 'cave', music: 'dungeon', bg: 'cave', dark: 0.82,
    encounters: { rate: 0.06, min: 10, groups: [['b1_rats', 3], ['b1_bats', 2], ['b1_goblins', 3]] },
    rows: [
      '##############################',
      '###########.......############',
      '###########...z...############',
      '###########.......############',
      '###########.......############',
      '##############g###############',
      '#.....####+.i.....+####......#',
      '#.v...####.........####....c.#',
      '#...b...............p.l...d..#',
      '#.....####.........####....s.#',
      '#..%..####.........####......#',
      '##############.###############',
      '##############.###############',
      '##############.###############',
      '##############.###############',
      '#########+.........+##########',
      '####....k...........##########',
      '####.e..#.....a.....##########',
      '####....#..%........##########',
      '#########...........##########',
      '##############x###############'
    ],
    things: {
      x: { type: 'warp', to: 'thornwood', at: 'e', gfx: 'daylight', out: 'up' },
      z: { type: 'warp', to: 'barrow2', at: 'u', gfx: 'stairsDown', out: 'down' },
      a: { type: 'foe', sprite: 'goblin', dir: 'down', script: [['note', 'Three goblins look up from a sack of tarnished silver.'], ['battle', 'b1_camp'], ['remove']] },
      b: {
        type: 'foe', sprite: 'hexer', dir: 'right', script: [
          ['say', 'Hexer', "Thieves! Thieves in Grukk's hole!"], ['battle', 'b1_lever'], ['remove'],
          ['if', '!knowsGrey', [
            ['note', "Among the hexer's knucklebones is a scrap of grey cloth, stitched with a pale open hand."],
            ['say', 'Maren', "That is a Warden's travelling grey. Or it was, once."],
            ['set', 'knowsGrey']
          ]]
        ]
      },
      k: {
        type: 'obj', gfx: 'crack', script: [
          ['note', 'The wall here is cracked. Cold air breathes through the gap.'],
          ['check', 'runa', 13, [['sfx', 'lever'], ['shake', 350], ['note', 'Runa puts her shoulder through it. The wall gives way.'], ['remove']],
            [['hurt', 'runa', '1d3'], ['say', 'Runa', 'Stubborn. Good. So am I.']]]
        ]
      },
      e: { type: 'chest', gold: 30, items: { flask: 2 } },
      i: {
        type: 'obj', gfx: 'statue', script: [['if', 'oswin', [['note', '"Here lies Oswin, Thane of the Thornwood."']], [
          ['note', 'A weathered figure of a thane. Words are cut into the plinth.'],
          ['check', 'maren', 10, [
            ['say', 'Maren', '"Here lies Oswin, Thane of the Thornwood, who kept one fifth of a terrible thing and asked only to be forgotten."'],
            ['say', 'Finch', 'One fifth. I know a song with five lamps in it. I had always assumed it was about lamps.'],
            ['xp', 15]
          ], [['say', 'Maren', 'The carving is worn. "...Oswin... one fifth... forgotten." I can\'t make out the rest.']]],
          ['set', 'oswin']
        ]]]
      },
      g: { type: 'obj', gfx: 'gate', unless: 'barrowGate', script: [['note', 'An iron gate. No lock, only a chain that runs into the wall and off to the west.'], ['quest', 'main', 2]] },
      v: {
        type: 'obj', gfx: 'lever', gfxIf: ['barrowGate', 'leverOn'], script: [['if', 'barrowGate', [['note', 'The lever is thrown.']], [
          ['sfx', 'lever'], ['shake', 400], ['set', 'barrowGate'],
          ['note', 'You haul the lever down. Somewhere to the east, iron grinds on stone.'],
          ['quest', 'main', 3]
        ]]]
      },
      p: {
        type: 'trigger', script: [['check', 'dask', 12, [
          ['say', 'Dask', 'Hold. Pressure plate. ...There. A copper under the lip and it stays asleep.'], ['xp', 10]
        ], [['note', 'Darts hiss out of the wall!'], ['hurt', 'all', '1d4'], ['say', 'Dask', 'Ah. I see it now.']]]]
      },
      l: {
        type: 'obj', gfx: 'lockedDoor', script: [
          ['note', 'A banded door, locked.'],
          ['check', 'dask', 13, [['sfx', 'door'], ['say', 'Dask', 'Three hundred years old and still no match for a bent pin.'], ['remove']],
            [['hurt', 'dask', '1d3'], ['say', 'Dask', 'It bit me. The lock bit me.']]]
        ]
      },
      c: { type: 'chest', items: { barrowfang: 1 } },
      d: { type: 'chest', gold: 40, items: { tonic: 1, draught: 1 } },
      s: {
        type: 'obj', gfx: 'sack', script: [
          ['note', "A goblin sack, heavy and clinking. Candlesticks, brooches, coffin-plates, a child's christening cup. All of it old Brackenford silver, with churchyard dirt still on it."],
          ['say', 'Dask', 'Odo would give a hundred and fifty for this and forget he ever saw it.'],
          ['say', 'Maren', 'It was buried with people, Dask. It has names on it.'],
          ['say', 'Dask', 'So does everything worth having.'],
          ['say', 'Runa', 'We carry it out. We decide in town.'],
          ['give', 'silver'], ['remove']
        ]
      }
    }
  };

  M.barrow2 = {
    name: 'The Crypt of Thane Oswin', ground: 'stone', music: 'dungeon', bg: 'crypt', dark: 0.86,
    encounters: { rate: 0.06, min: 10, unless: 'lampLit', groups: [['b2_guards', 2], ['b2_mixed', 3]] },
    aura: [{ if: 'lampLit&rite', id: 'blessed', turns: 4, text: "The ward-lamp's light goes with you. The party is Blessed." }],
    onEnter: [['if', '!crypt', [
      ['say', 'Maren', 'It is cold down here. The ward-lamp is out.'],
      ['say', 'Finch', 'And something is awake that should not be.'],
      ['set', 'crypt'], ['quest', 'main', 4]
    ]]],
    rows: [
      '##############################',
      '############..u..#############',
      '############.....#############',
      '############.....#############',
      '##############.###############',
      '##############.###############',
      '####+...................+#####',
      '####c..a...I.....I...b..h#####',
      '####.....................#####',
      '####..%...d.......%......#####',
      '############r....#############',
      '############.....#############',
      '##############q###############',
      '########+...........+#########',
      '########.I.........I.#########',
      '########.............#########',
      '########......98.....#########',
      '########.I.........I.#########',
      '########...y..t......#########',
      '########.............#########',
      '##############################'
    ],
    things: {
      u: { type: 'warp', to: 'barrow1', at: 'z', gfx: 'stairsUp', out: 'down' },
      a: { type: 'foe', sprite: 'skeleton', dir: 'right', script: [['note', 'The bones in the alcove knit themselves upright.'], ['battle', 'b2_guards'], ['remove']] },
      b: { type: 'foe', sprite: 'skeleton', dir: 'left', script: [['note', 'Something in rusted mail turns its head toward you.'], ['battle', 'b2_guards'], ['remove']] },
      c: { type: 'chest', items: { wardenmace: 1 } },
      h: {
        type: 'obj', gfx: 'lampDead', gfxIf: ['lampLit', 'shrine'], script: [['if', 'lampLit', [['note', 'The ward-lamp burns steady.'], ['run', 'campsite']], [
          ['note', "The barrow's ward-lamp. The oil is full and the wick is whole. It was snuffed, not spent."],
          ['say', 'Maren', 'Stand back a little. It has been a long time since I meant these words.'],
          ['sfx', 'magic'], ['set', 'lampLit'], ['heal'],
          ['note', 'The lamp catches. Warmth rolls down the hall, and the bones in the dark go still.'],
          ['if', 'rite', [['note', 'Maren speaks all nine verses, and the light does not stay in the lamp. It comes with you. (The party begins every fight in this crypt Blessed.)']]],
          ['xp', 25]
        ]]]
      },
      r: {
        type: 'obj', gfx: 'statue', script: [['if', 'riddle', [['note', 'The statue is silent.']], [
          ['note', 'A stone figure stands by the door, one hand raised. Words are cut into its chest.'],
          ['say', 'Finch', '"Kept by the faithful, broken by the false. I cost nothing to give and everything to betray. Kings have fallen for want of me. Speak my name."'],
          ['choice', 'Finch', 'Well? What do we say?', [
            ['"A crown."', [['run', 'riddleWrong']]],
            ['"An oath."', [
              ['sfx', 'good'], ['say', 'Finch', 'An oath. Of course. Thanes did love an oath.'],
              ['note', 'The statue lowers its hand. Stone grinds, and the door swings open.'], ['set', 'riddle'], ['xp', 40]
            ]],
            ['"A secret."', [['run', 'riddleWrong']]]
          ]]
        ]]]
      },
      q: { type: 'obj', gfx: 'lockedDoor', unless: 'riddle', script: [['note', 'A stone door without a handle. The statue beside it seems to be waiting.']] },
      9: {
        type: 'foe', sprite: 'grukk', dir: 'up', script: [
          ['say', 'Grukk', "More diggers? No. Fighters. Grukk has the Thane's hat now. Grukk is Thane!"],
          ['say', 'Grukk', 'Grey lady pays silver for the shiny bit. You? You pay in blood.'],
          ['if', 'snik=1', [['say', 'Dask', '(Quietly.) There is the bone-rattler Snik warned us about. Look how he watches the chief.']],
            [['note', 'A hooded goblin hexer stands at his elbow. He is watching Grukk, not you.']]],
          ['choice', null, 'Grukk raises his spade.', [
            ['Fight', [['run', 'grukkFight']]],
            ['Finch: "The grey lady is using you."', [['check', 'finch', [15, ['knowsGarrick', -2], ['snik=1', -3]], [['run', 'grukkTurns']], [
              ['say', 'Finch', 'Great Thane, consider. When the digging is done, what does the grey lady need a digger for?'],
              ['say', 'Grukk', 'Singer has a clever mouth. Grukk will keep it in a jar.'],
              ['run', 'grukkFight']
            ]]], 'knowsGrey'],
            ['Dask: offer the grave silver to leave', [['run', 'grukkBought']], 'item.silver']
          ]]
        ]
      },
      y: { type: 'npc', sprite: 'veyra', if: 'veyraHere', alpha: 0.6, dir: 'right' },
      t: { type: 'obj', gfx: 'sarcophagus', script: [['if', 'q.main>=5', [['note', "Thane Oswin's bones lie undisturbed. Maren has closed the lid."]], [['note', 'A stone sarcophagus, its lid askew. Something large is breathing nearby.']]]] },
      8: { type: 'npc', sprite: 'hexer', dir: 'left', unless: 'x.barrow2.9', script: [['note', 'The hexer does not look at you. He is watching Grukk, the way a man watches a pot.']] },
      d: {
        type: 'npc', sprite: 'alder', unless: 'alder', dir: 'up', script: [['if', 'lampLit', [
          ['note', 'A dead man in grave-clothes lies curled at the foot of the wall, as if he had sat down to rest in the lamplight. On his finger is a tin ring.'],
          ['say', 'Maren', 'Go gently, whoever you were. Someone will be glad to have this back.'],
          ['give', 'tinring'], ['set', 'alder', 3], ['quest', 'grave', 2]
        ], [
          ['note', 'A dead man in grave-clothes stands facing the wall. His lips move. "Cold. Called. Cold. Called." On his finger is a tin ring.'],
          ['choice', null, 'He has not noticed you yet.', [
            ['Maren: sing him to rest', [['check', 'maren', [13, ['rite', -4]], [
              ['if', 'q.grave>=1', [['say', 'Maren', 'Alder Pell. Your brother dug you a good grave. Nobody is calling you now. You can stop.']],
                [['say', 'Maren', 'Whoever you are. Whoever called you had no right. You can stop now.']]],
              ['note', 'The dead man turns, and for a moment there is someone behind his eyes. Then he folds down like a coat slipping off a hook.'],
              ['give', 'tinring'], ['set', 'alder', 1], ['bond', 'maren', 1], ['xp', 30], ['quest', 'grave', 2]
            ], [
              ['say', 'Maren', 'You can stop now, you can... no. He cannot hear it. Runa!'],
              ['battle', 'alder'], ['run', 'alderFell']
            ]]]],
            ['Put him down', [['say', 'Runa', 'He is already dead. This is a kindness.'], ['battle', 'alder'], ['run', 'alderFell']]],
            ['Leave him be', []]
          ]]
        ]]]
      }
    }
  };
})();
