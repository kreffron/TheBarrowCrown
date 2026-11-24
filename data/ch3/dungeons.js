/* Chapter 3 — the Giant's Cairn (two floors), the ice caves under the west cliffs, and the watchtower of the Fifth Lamp. */
(function () {
  const D = G.D, M = D.maps;

  /* ---------- the Giant's Cairn, floor 1: the Hall of Oaths ----------
     Four oath-stones, each facing a quarter. Set each to the beast the Oath of Stone names for it:
     eagle over the mountain (north), wolf upon the pass (west), stone to keep the hold (east), bear beneath the deep (south). */
  const FACES = [['Bear', 1, 'runeBear'], ['Wolf', 2, 'runeWolf'], ['Eagle', 3, 'runeEagle'], ['Stone', 4, 'runeStone']];
  const rune = (id, where) => ({
    type: 'obj', gfx: 'runeBlank', gfxIf: FACES.map(f => ['rs.' + id + '=' + f[1], f[2]]), script: [['if', 'cr.gate', [['note', 'The ' + where + ' stone is set. It will not turn again.']], [
      ['note', 'The ' + where + ' oath-stone turns on a pivot. Its four faces are carved with a bear, a wolf, an eagle and a plain stone.'],
      ['choice', null, 'Turn the ' + where + ' stone to show:', FACES.map(f => [f[0], [['set', 'rs.' + id, f[1]], ['sfx', 'lever']]]).concat([['Leave it', []]])],
      ['run', 'runeCheck']
    ]]]
  });
  D.scripts.runeCheck = [['if', 'rs.l=3&rs.m=2&rs.o=4&rs.q=1', [
    ['shake', 500], ['set', 'cr.gate'],
    ['note', 'All four stones grind into place together. At the north end of the hall, the gate to the barrow stair rises.'],
    ['say', 'Runa', 'Eagle, wolf, stone, bear. I said it every night for two winters. I did not know I still knew it.'],
    ['xp', 100]
  ]]];

  M.cairn1 = {
    name: "The Giant's Cairn", ground: 'stone', music: 'dungeon', bg: 'crypt', dark: 0.65,
    onEnter: [['if', 'q.main3<4', [['quest', 'main3', 4]]]],
    rows: [
      '##############################',
      '##############z###############',
      '##############g###############',
      '##.......M..........M.......##',
      '##............l.............##',
      '##....I................I....##',
      '##..........................##',
      '##..........................##',
      '##.m......................o.r#',
      '#..........................#.#',
      '#k.........................#.#',
      '#.....I................I...#.#',
      '##.................q.......#.#',
      '##.........................#.#',
      '##############n.############.#',
      '##############..#######......#',
      '##########.h........###.c....#',
      '##########.....p....###....d.#',
      '##########.%........###..K...#',
      '##########........+.##########',
      '##########..........##########',
      '##############x###############'
    ],
    things: {
      x: { type: 'warp', to: 'frostpass', at: 'a', gfx: 'daylight', out: 'up' },
      z: { type: 'warp', to: 'cairn2', at: 'u', gfx: 'stairsDown', out: 'down' },
      g: { type: 'obj', gfx: 'gate', unless: 'cr.gate', script: [['note', 'A stone gate across the barrow stair. Four oath-stones stand around the hall, each facing a different way.']] },
      h: { type: 'obj', gfx: 'shrine', script: [['note', "The Cairnwardens' own ward-lamp, by the inner door. Kell kept it burning."], ['run', 'campsite']] },
      n: { type: 'foe', sprite: 'golem', dir: 'down', script: [['note', 'Two stone guardians stand either side of the inner door. As you come close, their eyes kindle blue.'], ['battle', 'guardians'], ['remove']] },
      p: { type: 'sign', gfx: 'notice', script: [
        ['note', 'Words cut into the wall by the door, most of them worn away: "...over the mountain, ...upon the pass, stone to keep the hold, ...beneath the deep."'],
        ['say', 'Runa', 'Eagle over the mountain. Wolf upon the pass. Stone to keep the hold. Bear beneath the deep. The Oath of Stone. I swore it at sixteen.'],
        ['set', 'oathRecited']
      ] },
      l: rune('l', 'north'), m: rune('m', 'west'), o: rune('o', 'east'), q: rune('q', 'south'),
      k: {
        type: 'npc', sprite: 'kell', unless: 'kellDead', dir: 'right', script: [
          ['say', 'Warden Kell', 'Runa? Hallvard\'s girl? ...You came back. Good. Somebody had to.'],
          ['say', 'Maren', 'Warden. Let me see the wound.'],
          ['say', 'Warden Kell', 'Too late for that, Sister. Listen. The lamp is failing from inside. Someone has fed it grey oil for a year, a little at a time. Someone with a key to this Cairn.'],
          ['say', 'Warden Kell', 'Then the Sister came down, three days ago. Veyra. She went below with her Reavers. And the Giant began to move.'],
          ['say', 'Warden Kell', 'My report. I never sent it. Take it to the Wardens. Tell them the Cairn was kept.'],
          ['give', 'letter3'],
          ['note', 'Maren says the short rite over him. Runa closes his eyes.'],
          ['set', 'kellDead'], ['xp', 60]
        ]
      },
      r: {
        type: 'obj', gfx: 'lockedDoor', script: [
          ['note', 'A door carved with the clan\'s mark: THE OATH-VAULT. Only Cairnwardens know its word.'],
          ['if', 'runaOath=4', [['say', 'Runa', '"Kept." That is the word. It was always the word.'], ['sfx', 'door'], ['remove']],
            [['check', 'dask', 18, [['sfx', 'door'], ['say', 'Dask', 'A word-lock. Charming. Also, the hinges are on the outside.'], ['remove']],
              [['hurt', 'dask', '1d6'], ['say', 'Dask', 'It did not like that word.']]]]]
        ]
      },
      c: { type: 'chest', items: { hallvardaxe: 1 }, script: [['say', 'Runa', 'Hallvard\'s axe. He had it the night he held the door.']] },
      d: { type: 'chest', gold: 100, items: { clanring: 1 } }
    }
  };

  /* ---------- the Giant's Cairn, floor 2: the barrow ---------- */
  M.cairn2 = {
    name: 'The Barrow of Hrimgar', ground: 'stone', music: 'dungeon', bg: 'crypt', dark: 0.7,
    aura: [{ if: 'shardWeak', id: 'weak', turns: 2, text: "The King's voice is still ringing in your ears." }],
    rows: [
      '##########################',
      '############u#############',
      '############.#############',
      '############.#############',
      '############w#############',
      '############.#############',
      '############.#############',
      '##..........t...........##',
      '##+...................+.##',
      '##...I.....v.......I....##',
      '##........1.l.2.........##',
      '##......................##',
      '##......................##',
      '##...............%......##',
      '##......%...............##',
      '##..........k...........##',
      '##...I.............I....##',
      '##.c....................##',
      '##......................##',
      '##########################'
    ],
    things: {
      u: { type: 'warp', to: 'cairn1', at: 'z', gfx: 'stairsUp', out: 'down' },
      w: { type: 'foe', sprite: 'wight', dir: 'up', script: [['note', 'The barrow\'s dead are awake. They come up the stair to meet you.'], ['battle', 'cairnwights'], ['remove']] },
      t: { type: 'trigger', script: [['run', 'cairnScene']] },
      v: { type: 'npc', sprite: 'veyra', unless: 'veyraGone3', dir: 'down', script: [['if', 'allyVeyra', [['say', 'Veyra', 'Not yet, Maren.']], [['say', 'Veyra', 'Stay back.']]]] },
      1: { type: 'npc', sprite: 'frostzealot', unless: 'veyra3', dir: 'down', script: [['say', 'Reaver', '...']] },
      2: { type: 'npc', sprite: 'frostzealot', unless: 'veyra3', dir: 'down', script: [['say', 'Reaver', '...']] },
      k: { type: 'npc', sprite: 'giant', unless: 'giant=2', dir: 'up', script: [['if', 'giant=1', [['note', 'Hrimgar sleeps under the lamp, and snores like distant thunder.']], [['note', 'A giant on a bier of ice, the size of a cottage. He is breathing.']]]] },
      l: {
        type: 'obj', gfx: 'lampDead', gfxIf: ['lampLit3', 'shrine'], script: [['if', 'cr2.done', [
          ['if', 'lampLit3', [['note', 'The Cairn lamp burns blue-white over the sleeping Giant.']], [['note', 'The Cairn lamp is cold. There is nothing left here for it to keep.']]],
          ['choice', null, 'Go back down to Karrow Hold?', [['Return to Karrow Hold', [['run', 'cairnHome']]], ['Not yet', []]]]
        ], [['note', 'The Cairn lamp. Dark, and smelling of grey oil.']]]]
      },
      c: { type: 'chest', gold: 120, items: { potent: 2 } }
    }
  };

  /* ---------- the ice caves under the west cliffs (optional) ---------- */
  D.scripts.arnSaved = [
    ['say', 'Arn', 'You... you killed it. Lamplighter. I thought I was its supper. I thought I was its winter supply.'],
    ['say', 'Runa', 'Eydis is waiting. Can you walk?'],
    ['say', 'Arn', 'For Eydis I can run. Slowly.'],
    ['set', 'arnSafe'], ['quest', 'bear', 2], ['bond', 'runa', 1]
  ];
  D.scripts.rimeFight = [
    ['note', 'A heap of snow at the back of the den gets up. It is a bear. It keeps getting up.'],
    ['say', 'Dask', 'That is not a bear. That is weather with teeth.'],
    ['battle', 'rimeclaw'], ['remove', 'icecaves.k'], ['run', 'arnSaved']
  ];
  M.icecaves = {
    name: 'The Ice Caves', ground: 'ice', ground2: 'snow', music: 'frost', bg: 'cave', dark: 0.55,
    encounters: { rate: 0.05, min: 10, groups: [['ic_wolves', 1], ['ic_wights', 1]] },
    rows: [
      '[[[[[[[[[[[[[[[[[[[[[[[[[[[[',
      '[.u......[[[[......[[[.....[',
      '[........[[[[...,..[[[..e..[',
      '[..,...............[[[.....[',
      '[..................b.......[',
      '[........[[[[......[[[.....[',
      '[........[[[[..d...[[[.....[',
      '[[[[..[[[[[[[......[[[...c.[',
      '[[[[..[[[[[[[......[[[.....[',
      '[[[[..[[[[[[[.[[[[[[[[[[[[[[',
      '[.............[[[[[[[[[[[[[[',
      '[......,...................[',
      '[.....w..%.............,...[',
      '[................%.........[',
      '[.q.......,.........k......[',
      '[...............,........r.[',
      '[[[[[[[[[[[[[..............[',
      '[[[[[[[[[[[[[[[[[[[[[[[[[[[['
    ],
    things: {
      u: { type: 'warp', to: 'frostpass', at: 'v', gfx: 'daylight', out: 'down' },
      w: { type: 'foe', sprite: 'wolf', dir: 'right', script: [['note', 'Frost wolves, gnawing on something you decide not to look at.'], ['battle', 'ic_wolves'], ['remove']] },
      d: { type: 'foe', sprite: 'wight', dir: 'left', script: [['note', 'Ice wights in old clan mail. Hunters, once.'], ['battle', 'ic_wights'], ['remove']] },
      b: {
        type: 'obj', gfx: 'iceFace', script: [
          ['note', 'A wall of clear ice. On the far side, blurred, you can see a hunter\'s pack and a glint of gold.'],
          ['check', 'runa', 14, [['sfx', 'hit'], ['shake', 300], ['note', 'Runa puts her axe through it. The wall comes down in a shower of glass.'], ['remove']],
            [['hurt', 'runa', '1d6'], ['say', 'Runa', 'Thick. Thicker than it looks.']]]
        ]
      },
      e: { type: 'chest', gold: 60, items: { potent: 1 }, script: [['note', "A trapper's cache, frozen into the ice."]] },
      c: { type: 'chest', gold: 80, items: { wolfcharm: 1 } },
      q: { type: 'chest', items: { tonic: 2 } },
      k: { type: 'foe', sprite: 'bear', dir: 'left', script: [['run', 'rimeFight']] },
      r: { type: 'npc', sprite: 'arn', unless: 'arnSafe', dir: 'left', script: [['if', 'x.icecaves.k', [['run', 'arnSaved']], [
        ['say', 'Arn', 'Quiet! Quiet. It sleeps right there. If it wakes...'],
        ['run', 'rimeFight']
      ]]] }
    }
  };

  /* ---------- the watchtower of the Fifth Lamp (optional) ---------- */
  M.watchtower = {
    name: 'The Watchtower of the Fifth Lamp', ground: 'stone', music: 'frost', bg: 'crypt', dark: 0.5,
    rows: [
      '##################',
      '#................#',
      '#.K.....k.....c..#',
      '#................#',
      '#..M.........M...#',
      '#................#',
      '########.#########',
      '########g#########',
      '########.#########',
      '#....p...........#',
      '#................#',
      '#...w........l...#',
      '#................#',
      '#.I............I.#',
      '#................#',
      '########u#########'
    ],
    things: {
      u: { type: 'warp', to: 'frostpass', at: 'z', gfx: 'daylight', out: 'up' },
      w: { type: 'foe', sprite: 'frostspirit', dir: 'right', script: [['note', 'Frost spirits whirl in the empty hall, a dozen little blue flames.'], ['battle', 'wt_spirits'], ['remove']] },
      l: {
        type: 'obj', gfx: 'beacon', gfxIf: ['wt.lit', 'beaconLit'], script: [['if', 'wt.lit', [['note', 'The beacon burns. Down in the valley, someone will see it.']], [
          ['note', 'The old beacon. Its iron basket is full of dry pine, and has been for a very long time.'],
          ['say', 'Maren', 'Lamplighter, who keeps the door: here is a little light for those who watch.'],
          ['sfx', 'magic'], ['set', 'wt.lit'],
          ['note', 'The beacon roars up. Above it, the stair gate swings open on its own.'],
          ['xp', 60]
        ]]]
      },
      g: { type: 'obj', gfx: 'gate', unless: 'wt.lit', script: [['note', 'A gate across the stair, cold and shut. The beacon in the hall below is dark.']] },
      p: { type: 'sign', gfx: 'notice', text: '"Here the Lamp of the North kept her watch, and when the watch was done, she went down to keep the door."' },
      k: {
        type: 'foe', sprite: 'watcher', dir: 'down', script: [
          ['say', 'The Last Watcher', 'Who climbs? The Lamp is gone. The Lamp is gone, and I am still watching.'],
          ['if', 'verse2', [
            ['choice', null, 'The Last Watcher draws a sword made mostly of frost.', [
              ['Finch: sing her stanza to him', [
                ['say', 'Finch', '"She held it through the longest night, and asked no crown, and took no throne; she kept the door, she kept the light, and kept the keeping all alone."'],
                ['say', 'The Last Watcher', '...She kept it. She kept it all alone. Then my watch is done.'],
                ['note', 'The Last Watcher lays his sword on the floor and is not there any more.'],
                ['xp', 360], ['bond', 'finch', 1], ['remove']
              ]],
              ['Fight', [['battle', 'watcher'], ['remove']]]
            ]]
          ], [['battle', 'watcher'], ['remove']]]
        ]
      },
      c: {
        type: 'chest', items: { watchermail: 1, verse3: 1 }, script: [
          ['note', 'Inside the Watcher\'s chest: a coat of fine mail that rings like a bell, and a strip of vellum in oilcloth.'],
          ['say', 'Finch', '"And when the four had kept their sleep, she found the door would not stay shut; she took the key into the deep, and turned it, and was not seen but..."'],
          ['say', 'Finch', 'But. It stops at "but". Grandmother, you were a cruel woman.'],
          ['say', 'Maren', 'She took the key into the deep. The Hollow Barrow. She went to the King herself.'],
          ['set', 'verse3'], ['quest', 'watcher', 2], ['bond', 'finch', 1]
        ]
      }
    }
  };
})();
