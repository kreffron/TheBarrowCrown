/* Chapter 4 — Highmoor and its buildings. */
(function () {
  const M = G.D.maps;

  M.highmoor = {
    name: 'Highmoor', ground: 'cobble', ground2: 'cobble2', music: 'city', bg: 'city',
    legend: { D: 'stall', '>': 'fountain', '/': 'hedge' },
    rows: [
      'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
      'S...,..,.,.,^^^^^^^^^^^^^^^^^^^^......,,...S',
      'S,....,.....^^^^^^^^^^^^^^^^^^^^...,...,...S',
      'S...........^^^^^^^^^^^^^^^^^^^^.,.........S',
      'S...,.,.....^^^^^^^^^^^^^^^^^^^^...,..,....S',
      'S....,..,...^^^^^^^^^^^^^^^^^^^^...........S',
      'S....,.....,^^^^^^^^^^^^^^^^^^^^....,......S',
      'S...,.......SHHSHHSHSaaSSHHSHHSH......,..,.S',
      'S...,..,......,..,..7::8,........,....,....S',
      'S.,,....,....////////::////////^^^^^^^^^^^.S',
      'S..^^^^^^^^^./.,...,.::......./^^^^^^^^^^^.S',
      'S..^^^^^^^^^./......L::L.....,/^^^^^^^^^^^.S',
      'S..^^^^^^^^^./.....,.::..,,,../^^^^^^^^^^^.S',
      'S..^^^^^^^^^....U....::........^^^^^^^^^^^.S',
      'S,.^^^^^^^^^..................,^^^^^^^^^^^.S',
      'S..SHSSbSSHS..,...1............SHSSHcSHSSH.S',
      'S::::::::::::::::::::::::::::::::::::::::::S',
      'S:::::::::::L::::::::::::::::::L:::::::::::S',
      'S..........................2..,............S',
      'S..,.DDDDD,DDDDD..,..::........,.,........,S',
      'S..........3...,....L::L..>..,,.......4...,S',
      'S.,..................::..........,,...,..,.S',
      'S.,.,DDDDD,DDDDD.....::...,,,..............S',
      'S,.,.....,..,.....,,.::...,...^^^^^^^^^^...S',
      'S..^^^^^^^^^......,,.::,......^^^^^^^^^^...S',
      'S..^^^^^^^^^.........::,.,.,..^^^^^^^^^^...S',
      'S..^^^^^^^^^........L::L..,,,.^^^^^^^^^^...S',
      'S..^^^^^^^^^.........::...,..,^^^^^^^^^^..,S',
      'S..WNWWdWWNW,X.....,.::....,..WNWWiWWNWW...S',
      'S..,...:.........,...::..........,:.....,..S',
      'S,,,,,,..,....,..,...::::::::::::::...,.XU.S',
      'S,u,,z,.,......,,..,.::h,...,....,.,.......S',
      'S,,,,,,,......,.....5::6....,......,.......S',
      'SSSSSSSSSSSSSSSSSSSSSnnSSSSSSSSSSSSSSSSSSSSS'
    ],
    things: {
      n: { type: 'obj', gfx: 'path', under: 'path', out: 'up', script: [['choice', null, 'The south gate of Highmoor.', [
        ['The road to Brackenford', [['warp', 'brackenford', 'z', 'up']]],
        ['The road to Saltmere', [['warp', 'saltmere', 'n', 'down']]],
        ['The road north, to Karrow Hold', [['warp', 'karrow', 'n', 'up']]],
        ['East, to Ashfall and the Ashen Road', [['run', 'ch5road']], 'ch4done'],
        ['Stay in Highmoor', []]
      ]]] },
      a: { type: 'obj', gfx: 'door', under: 'stonewall', out: 'down', script: [['if', 'q.main4=1', [['run', 'feast']], [
        ['if', 'cc.done&!dukeCured', [['say', 'City Guard', 'The palace is closed. By order of the regency.']], [['warp', 'h_palace', 'x', 'up']]]
      ]]] },
      b: { type: 'warp', to: 'h_counting', at: 'x', gfx: 'door', under: 'stonewall', out: 'down' },
      c: { type: 'warp', to: 'h_cathedral', at: 'x', gfx: 'doorStone', under: 'stonewall', out: 'down' },
      d: { type: 'warp', to: 'h_shop', at: 'x', gfx: 'door', under: 'timber', out: 'down' },
      i: { type: 'warp', to: 'h_inn', at: 'x', gfx: 'door', under: 'timber', out: 'down' },
      u: { type: 'obj', gfx: 'crack', under: 'cobble2', out: 'right', script: [['if', 'q.main4>=3', [
        ['choice', null, 'An iron grate over the old city. The air coming up it is cold and smells of the river.', [['Climb down into the Undercroft', [['warp', 'undercroft', 'u', 'down']]], ['Not yet', []]]]
      ], [['note', 'An iron grate, locked. Beneath it, the old city that Highmoor was built on top of.']]]] },
      h: { type: 'npc', sprite: 'herald', dir: 'down', script: [['if', 'q.main4>=7', [['say', 'Herald', 'Hear ye! The Chancellor is a traitor! ...I have been saying it all day. I am rather enjoying it.']], [
        ['if', 'q.main4=1', [['say', 'Herald', "The heroes of Saltmere and Karrow Hold! Rooms at the Silver Lantern are paid for, and the Duke's feast is tonight, at the palace. Up the avenue. You cannot miss it. It is the big one."]],
          [['say', 'Herald', 'News, news! The Duke is unwell, the Chancellor is busy, and the Cathedral has rung its bells three nights running.']]]
      ]]] },
      5: { type: 'npc', sprite: 'cityguard', dir: 'up', script: [['say', 'City Guard', 'Welcome to Highmoor. Mind your purses. Mind your step. Mind the Chancellor\'s men.']] },
      6: { type: 'npc', sprite: 'cityguard', dir: 'up', script: [['say', 'City Guard', 'Funny thing. The Catacomb bells rang last night and nobody was pulling the ropes.']] },
      7: { type: 'npc', sprite: 'cityguard', dir: 'down', script: [['say', 'City Guard', 'The palace. His Grace receives guests at the Chancellor\'s discretion.']] },
      8: { type: 'npc', sprite: 'cityguard', dir: 'down', script: [['if', 'corrKnown', [['say', 'City Guard', 'The Chancellor. The CHANCELLOR. I took his coin for nine years.']], [['say', 'City Guard', 'The Chancellor works later than anyone in Highmoor. Lamp burning in his window every night.']]]] },
      1: { type: 'npc', sprite: 'noble', wander: true, script: [['say', 'Noble', 'Adventurers. How quaint. Do you do parties?']] },
      2: { type: 'npc', sprite: 'noble2', wander: true, script: [['say', 'Merchant', 'The Chancellery sells the lamp-oil for the whole valley. Clever man, Corr. He thinks of everything.']] },
      3: { type: 'npc', sprite: 'urchin', wander: true, script: [['say', 'Urchin', 'You lot going down the Undercroft? Mind the ghouls. And the rats. And the other rats, the ones in grey.']] },
      4: { type: 'npc', sprite: 'olwen', wander: true, script: [['say', 'Washerwoman', 'Half this city owes money to Orrin and Sons. The other half owes it to somebody who owes it to Orrin.']] },
      z: { type: 'npc', sprite: 'urchin', dir: 'right', script: [['if', 'q.main4>=3', [['say', 'Urchin', 'The ghostcaps grow in the old cave, west of the market street down there. Glow like little lamps. Do not eat them.']], [['say', 'Urchin', 'That grate? Watch keeps it locked. Unless the Wardens say so.']]]] }
    }
  };

  M.h_inn = {
    name: 'The Silver Lantern', ground: 'wood', music: 'city', bg: 'tavern',
    rows: [
      '################',
      '#K.k.K........Y#',
      '#CCCCC.........#',
      '#.......A1.A...#',
      '#..............#',
      '#..............#',
      '#.3....2A..Av..#',
      '#..............#',
      '#......p.......#',
      '#######x########'
    ],
    things: {
      x: { type: 'warp', to: 'highmoor', at: 'i', gfx: 'mat', out: 'up' },
      p: { type: 'mark' },
      k: { type: 'npc', sprite: 'olwen', script: [['choice', 'Olwen', 'The Silver Lantern. A bed is sixty a night, unless the Duke is paying.', [
        ['Rest', [['if', 'q.main4<=2', [['inn', 0], ['say', 'Olwen', 'Paid for. The Chancellery sent a note.']], [['if', 'q.main4>=7', [['inn', 0], ['say', 'Olwen', 'On the house. You found out what he was. That is worth a bed.']], [['if', 'gold>=60', [['inn', 60], ['say', 'Olwen', 'Morning. The bells are still going.']], [['say', 'Olwen', 'Sixty, dearie.']]]]]]]]],
        ['Any news?', [['say', 'Olwen', 'Brannoc Vosk has been drinking in my corner for a week. Says he is "between employers". Mind him.']]],
        ['Nothing, thanks', []]
      ]]] },
      v: {
        type: 'npc', sprite: 'vosk', if: 'brannoc2>=2', unless: 'brannoc4', dir: 'left', script: [
          ['if', '!q.brannoc', [['quest', 'brannoc', 1]]],
          ['say', 'Brannoc', 'Well, well. The tavern-wreckers, in Highmoor. Sit. I am not working for anyone tonight.'],
          ['if', 'brannoc2=2', [
            ['say', 'Brannoc', 'The Pale Hand keep a safehouse in the Undercroft, between you and the Catacombs. There is a back door. I have the key. You know how this works.'],
            ['choice', null, 'Brannoc wants 100 gold for the back door.', [
              ['Pay him (100 gold)', [['gold', -100], ['give', 'chancelleryorders'], ['say', 'Brannoc', 'Pleasure, as ever. And take these. Orders, under the Chancellery seal. I never could read them.'], ['set', 'backdoorKey'], ['set', 'brannoc4', 2], ['xp', 300], ['quest', 'brannoc', 2]], 'gold>=100'],
              ['Not now', []]
            ]]
          ]],
          ['if', 'brannoc2=3', [
            ['say', 'Brannoc', 'Underbough. You still have my book. Here: the back door to the Pale Hand safehouse in the Undercroft, and some orders under the Chancellery seal. Free. Now forget my handwriting.'],
            ['give', 'chancelleryorders'], ['set', 'backdoorKey'], ['set', 'brannoc4', 3], ['xp', 300], ['quest', 'brannoc', 2]
          ]],
          ['if', 'brannoc2=4', [
            ['say', 'Brannoc', 'You left me alone in Saltmere. Nobody ever leaves me alone. Buy me a drink and I will tell you something for it.'],
            ['say', 'Brannoc', 'The grey swords the Pale Hand carry? The Chancellery pays the smith. I delivered the invoices myself. Corr\'s seal on every one.'],
            ['set', 'knowsCourt'], ['set', 'knowsChancellery'], ['set', 'brannoc4', 4], ['xp', 300], ['quest', 'brannoc', 2]
          ]]
        ]
      },
      1: { type: 'npc', sprite: 'noble2', dir: 'down', script: [['say', 'Clerk', 'I owe Orrin and Sons more than I earn in a year. Everybody does. It is how Highmoor works.']] },
      2: { type: 'npc', sprite: 'cityguard', dir: 'right', script: [['say', 'Off-duty Guard', 'The Duke used to ride out every morning. Now the Chancellor brings him his breakfast. Personally.']] },
      3: { type: 'npc', sprite: 'urchin', dir: 'up', script: [['say', 'Pot-boy', 'Are you the ones who killed a giant? A real one? Was it big?'], ['say', 'Finch', 'We sang it to sleep. It was very big.']] }
    }
  };

  M.h_shop = {
    name: 'The Market Hall', ground: 'wood', music: 'city', bg: 'town',
    rows: [
      '################',
      '#Z.o..K..J.r..K#',
      '#CCCCCC..CCCCCC#',
      '#..............#',
      '#..............#',
      '#..............#',
      '#U............X#',
      '#..............#',
      '#######x########'
    ],
    things: {
      x: { type: 'warp', to: 'highmoor', at: 'd', gfx: 'mat', out: 'up' },
      o: { type: 'npc', sprite: 'dace', script: [['say', 'Dace', "Highmoor steel. The Duke's guard used to buy here, before the Chancellery's budget."], ['shop', 'dace']] },
      r: {
        type: 'npc', sprite: 'lysa', script: [
          ['if', 'q.duke=1', [
            ['say', 'Maren', 'Lysa. Grey lips, grey under the nails, a tiredness that will not lift. What would do that?'],
            ['say', 'Lysa', 'Grey-oil sickness. Lamplighters get it, trimming bad wicks. You would need to breathe it every day for years.'],
            ['say', 'Lysa', 'Or drink it. A little, every morning, in your breakfast. ...Lamplighter. You mean the Duke.'],
            ['say', 'Lysa', 'I can brew a cure, but I need ghostcap. It grows in the Undercroft, in the old cave west of the market street. Bring me a handful.'],
            ['quest', 'duke', 2]
          ]],
          ['if', 'q.duke=2&item.ghostcap', [
            ['say', 'Lysa', 'Ghostcap. Good. Give me a moment, and do not touch anything.'],
            ['take', 'ghostcap'], ['give', 'cure'], ['quest', 'duke', 3],
            ['say', 'Lysa', 'There. A spoonful in water, and keep the Chancellor out of the room while he takes it.']
          ]],
          ['shop', 'lysa']
        ]
      }
    }
  };

  M.h_cathedral = {
    name: 'The Cathedral of the First Lamp', ground: 'stone', music: 'city', bg: 'crypt',
    rows: [
      '####################',
      '#.K.....QQQQ.......#',
      '#..a.....w....h....#',
      '#I.......VV.......I#',
      '#........VV........#',
      '#..AAAAA.VV.AAAAA..#',
      '#........VV........#',
      '#..AAAAA.VV.AAAAA..#',
      '#........VV........#',
      '#..AAAAA.VV.AAAAA..#',
      '#I.......VV.......I#',
      '#........VV........#',
      '#........VV......z.#',
      '#########x##########'
    ],
    things: {
      x: { type: 'warp', to: 'highmoor', at: 'c', gfx: 'mat', out: 'up' },
      h: { type: 'obj', gfx: 'shrine', script: [['note', 'The First Lamp of the Wardens, burning in a glass the size of a well. It is good to stand near. For real rest there is the inn.']] },
      z: { type: 'obj', gfx: 'stairsDown', out: 'left', script: [['if', 'q.crypt>=1', [['warp', 'h_crypt', 'u', 'up']], [['note', 'A stair down to the undercrypt, behind a rope and a sign: ARCHIVIST\'S PERMISSION.']]]] },
      a: {
        type: 'npc', sprite: 'fennick', dir: 'down', script: [['if', 'q.crypt>=1', [['say', 'Brother Fennick', 'The undercrypt stair is open to you. Mind the shades. They are mostly harmless. Mostly.']], [
          ['say', 'Brother Fennick', 'You are the singer who collects old verses? I keep the Cathedral archive. Thirty years. Nobody ever asks me anything.'],
          ['say', 'Finch', 'The Ballad of the Five Lamps. The fifth verse. I have three stanzas.'],
          ['say', 'Brother Fennick', 'Three! Then you will want the fourth. The first High Warden is buried under this floor. She knew the Fifth Lamp. Some say she sealed her in.'],
          ['say', 'Brother Fennick', 'The undercrypt stair, in the corner. The door down there asks questions. I never knew the answers.'],
          ['quest', 'crypt', 1]
        ]]]
      },
      w: {
        type: 'npc', sprite: 'oriel', dir: 'down', script: [
          ['if', 'q.main4>=7', [['say', 'High Warden Oriel', 'Go to the Hollow Barrow, Maren. Bring them all home. The Fifth Lamp too, if she can be brought.']], [
            ['if', 'q.main4=6', [['run', 'ch4end']], [
              ['if', 'q.main4=2', [['run', 'oriel']], [['say', 'High Warden Oriel', 'The Undercroft grate is open to you, by the Wardens\' order. The Catacomb lamp, Maren. Quickly.']]]
            ]]
          ]]
        ]
      }
    }
  };

  M.h_counting = {
    name: 'Orrin and Sons', ground: 'wood', music: 'city', bg: 'town',
    rows: [
      '##################',
      '#KKKKKKKKKKKKKKKK#',
      '#...............v#',
      '#...w..c.....o...#',
      '#CCCCCCCC..CCCCCC#',
      '#................#',
      '#................#',
      '#..A..A.....A....#',
      '#.........1......#',
      '#U..............X#',
      '#................#',
      '########x#########'
    ],
    things: {
      x: { type: 'warp', to: 'highmoor', at: 'b', gfx: 'mat', out: 'up' },
      v: { type: 'obj', gfx: 'lockedDoor', out: 'down', script: [['if', 'q.heist=1', [
        ['choice', null, "The door to Orrin's vault. Wren can let you in after dark.", [['Wait for dark, and go in', [['note', 'Wren slips you the night key at the eleventh bell. The counting-house is dark and ticking.'], ['warp', 'h_vault', 'u', 'down']]], ['Not yet', []]]]
      ], [['note', 'A heavy iron door behind the counter, marked PRIVATE in four languages.']]]] },
      w: {
        type: 'npc', sprite: 'wren', dir: 'down', script: [
          ['if', 'q.heist>=3', [['if', 'heist=1', [['say', 'Wren', 'I keep waking up and not owing anybody anything. It is very strange. I like it.']], [['say', 'Wren', '...']]]], [
            ['if', 'q.heist=2', [
              ['if', 'heist=1', [
                ['say', 'Wren', 'You burned them. All of them. Mine, and the baker\'s, and the whole of Tanner\'s Row. Dask...'],
                ['note', 'Wren hugs her brother. Dask pretends this is not happening, badly.'],
                ['say', 'Wren', 'Take this. I opened Orrin\'s letters with it for six years. I want it to cut something better.'],
                ['give', 'wrenknife'], ['set', 'wrenFree'], ['xp', 300], ['bond', 'dask', 2]
              ], [
                ['say', 'Wren', 'You took them. You took every chain in Highmoor and put it in your own pocket.'],
                ['say', 'Dask', 'Leverage, Wren. Against Corr.'],
                ['say', 'Wren', 'That is what Orrin used to say.'],
                ['note', 'She goes back to her ledgers, and does not look up again.'],
                ['bond', 'dask', -2], ['xp', 300]
              ]],
              ['quest', 'heist', 3]
            ], [
              ['if', 'q.heist=1', [['say', 'Wren', 'Eleventh bell. The vault door behind Orrin\'s counter. I will leave the key where you can find it.']], [
                ['say', 'Wren', '...Dask?'],
                ['say', 'Dask', 'Wren. You are still here. I signed that paper so you could LEAVE.'],
                ['say', 'Wren', 'And Orrin bought it back and gave me a desk. Where else would I go? Every debt in Highmoor is on paper, Dask, and every paper is in his vault.'],
                ['say', 'Wren', 'Mine is in there. Yours was, until tonight. If somebody went in after dark, they could do something about that.'],
                ['say', 'Finch', 'A heist. At last, a heist.'],
                ['set', 'wrenMet'], ['quest', 'heist', 1]
              ]]
            ]]
          ]]
        ]
      },
      c: { type: 'npc', sprite: 'noble2', dir: 'down', script: [['say', 'Clerk', 'Interest is calculated daily. Compounded hourly. Forgiven never. Usually.']] },
      o: { type: 'npc', sprite: 'orrin', unless: 'orrinExposed', dir: 'down', script: [['if', 'corrKnown', [['say', 'Orrin', 'I only kept the books. I only ever kept the books.']], [['say', 'Orrin', 'Master Underbough. Debt-free. How does it feel? Light, I imagine. Very light.']]]] },
      1: { type: 'npc', sprite: 'olwen', dir: 'up', script: [['say', 'Widow', 'I came to pay the interest. Just the interest. I have been paying the interest for eleven years.']] }
    }
  };

  M.h_palace = {
    name: "The Duke's Palace", ground: 'marble', music: 'city', bg: 'city',
    legend: { '>': 'banner' },
    rows: [
      '###>###>########>###>###',
      '#.I.......VVVV.......I.#',
      '#..........dc..........#',
      '#........o....w........#',
      '#......................#',
      '#...1..............2...#',
      '#....AAAAAAAAAAAAAA....#',
      '#....AAAAAAAAAAAAAA....#',
      '#...3.....VVVV.....4...#',
      '#.......7.VVVV.8.......#',
      '#.........VpVV.........#',
      '#.........VVVV.........#',
      '#.I.......VVVV.......I.#',
      '###########x############'
    ],
    things: {
      x: { type: 'warp', to: 'highmoor', at: 'a', gfx: 'mat', out: 'up' },
      p: { type: 'mark' },
      d: {
        type: 'npc', sprite: 'duke', unless: 'dukeDead', dir: 'down', script: [
          ['if', 'dukeCured', [['say', 'Duke Aldric', 'Twenty years I let that man bring me my breakfast. Go. Find him. Highmoor rides with you.']], [
            ['if', 'item.cure', [
              ['say', 'Maren', 'Your Grace. Drink this. Do not ask the Chancellor first.'],
              ['say', 'Duke Aldric', '...It tastes of rain.'],
              ['note', 'The grey drains out of the old man\'s lips as you watch. He sits up straighter than he has in a year.'],
              ['say', 'Duke Aldric', 'Grey oil. In my breakfast. Every morning, served by his own hand.'],
              ['say', 'Duke Aldric', 'Take my signet. Every door in Highmoor will open for it.'],
              ['take', 'cure'], ['give', 'ducalsignet'], ['set', 'dukeCured'], ['xp', 500], ['quest', 'duke', 4]
            ], [['say', 'Duke Aldric', 'Heroes... forgive me. I am so very tired.']]]
          ]]
        ]
      },
      c: { type: 'npc', sprite: 'corr', unless: 'corrKnown', dir: 'down', script: [['say', 'Ilvane Corr', 'Heroes. Highmoor is grateful, and I am the one who keeps its accounts. Ask me for anything.']] },
      o: { type: 'npc', sprite: 'orrin', if: 'cs.feast', dir: 'down', script: [] },
      w: { type: 'npc', sprite: 'oriel', if: 'cs.feast', dir: 'down', script: [] },
      1: { type: 'npc', sprite: 'noble', dir: 'right', script: [['say', 'Noble', 'Is it true you carry pieces of a dead king about with you? How thrilling. Do they talk?']] },
      2: { type: 'npc', sprite: 'noble2', dir: 'left', script: [['say', 'Noble', 'The Chancellor runs everything now. Very efficiently. I find it rather restful.']] },
      3: { type: 'npc', sprite: 'noble', if: 'cs.feast', dir: 'right', script: [] },
      4: { type: 'npc', sprite: 'noble2', if: 'cs.feast', dir: 'left', script: [] },
      7: { type: 'npc', sprite: 'cityguard', dir: 'up', script: [['say', 'City Guard', 'His Grace is not to be tired.']] },
      8: { type: 'npc', sprite: 'cityguard', dir: 'up', script: [['say', 'City Guard', '...']] }
    }
  };
})();
