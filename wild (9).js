/* Chapter 3 — the Frost Pass. The trail is safe; the snow is not. Two ridges cross the pass, and the Pale
   Hand holds the gap in each. Grukk's kin know a tunnel past the second. */
(function () {
  const M = G.D.maps;

  M.frostpass = {
    name: 'The Frost Pass', ground: 'snow', ground2: 'drift', music: 'frost', bg: 'snow',
    encounters: { rate: 0.12, min: 7, groups: [['fp_wolves', 3], ['fp_wights', 2], ['fp_spirits', 2], ['fp_cult', 2]] },
    rows: [
      '{{{{{{{{{{{{{{{{{{{{{{}}a}}{{{{{{{{{{{{{{{{{{{',
      '{{...,.,,}.,.{...}.{..,}:}..........,...,}.{,{',
      '{},..,..,,,.....,.....t.:....,.......,...{.,.{',
      '{..,{.........,....,....:.,..,.,.....},......{',
      '{}}}}}}}}}}}}}}}}}}}}}}}:}}}}}}}}}}}}}}}}}}}}{',
      '{}}}}}}}}}}}}}}}}}}}}}}}q}}}}}}}}}}}}}}}}}}}}{',
      '{,....?..........,....,,:,,.)))))))))))))}}}}{',
      '{..?....jk.{.,,..,....,.:,..)))))))))))))}.z}{',
      '{,...2.....:::::::::::::::::)))))))))))))o..}{',
      '{..?..+....,,.,.:..h{.......)))))))))))))}..}{',
      '{.u.....1.......:...,.....,,)))))))))))))}}}}{',
      '{......{....,...:....,,.....)))))))))))))}}}}{',
      '{}}}}}}}}}}}}}}}p}}}}}}}}}}}}}}}}}}}}}}}}}}}}{',
      '{}}}}}}}}}}}}}}}:}}}}}}}}}}}}}}}}}}}}}}}}}}}}{',
      '{......,}....,..:........,,.{,.,.,....,..,...{',
      '{}............,.:...}.....,.,.}{,.,,...,...{.{',
      '{v.....{,....,..:.,........,....},....,.,,.c,{',
      '{}......,,...,{,:,.,..{...,.....,.,{.{.,{....{',
      '{.......,.}.....:,,.........,,.,..,.,.}...,..{',
      '{......,,.,,....:.,........,...,,...{{},,...,{',
      '{........,.,..,}:::::::,...{..,.{.......{.,..{',
      '{.......,.....,....,}.:...,....{..{.......,..{',
      '{..,....,}..,.......,.:.,{g,....,..{..,..}.,{{',
      '{..,.......{......,..}:{.,.....,..,...{......{',
      '{.,.|||||||..,,.,,..,.:.....,.......,{....,,.{',
      '{{,.|||||||...}.......:.....{..{......,..,}..{',
      '{,,.|||||||...}{,..,..:.}{.,.......,.,.....,.{',
      '{...WNWWNWW.b,.,...,.,:....,..,..,.}....,.,..{',
      '{.,,.{.....Y:::::::::::.,.,,........{........{',
      '{.,..,.,........{,....:..,,........,,.,.....,{',
      '{...,e,...,.......{...:,},....,.d.,,....,..,{{',
      '{}.,.......,.{{.,,,...:..,,....,,..,.,,,,.{{,{',
      '{.,,....}..,},....,.}.:.,...........,.,..,,..{',
      '{{{{{{{{{{{{{{{{{{{{{{s{{{{{{{{{{{{{{{{{{{{{{{'
    ],
    things: {
      s: { type: 'warp', to: 'karrow', at: 'e', under: 'path', out: 'up' },
      a: { type: 'warp', to: 'cairn1', at: 'x', gfx: 'doorStone', under: 'snowrock', out: 'down' },
      t: { type: 'mark' },
      p: {
        type: 'foe', sprite: 'frostacolyte', dir: 'down', under: 'path', script: [
          ['say', 'Frost-priest', 'The pass is closed by order of the Sister. Turn back, or be buried up here.'],
          ['choice', null, 'Pale Hand scouts hold the gap in the ridge.', [
            ['Fight', [['battle', 'scouts'], ['remove'], ['set', 'scouts3', 1]]],
            ['Finch: bluff past them', [['check', 'finch', [17, ['knowsCourt', -3], ['knowsRitual', -1]], [
              ['say', 'Finch', 'Closed? Brother, we are from Highmoor. My lord at the Duke\'s court would like to know why his Sister is taking so long.'],
              ['say', 'Frost-priest', '...From his lordship? Pass, then. Quickly.'],
              ['xp', 305], ['remove'], ['set', 'scouts3', 2], ['bond', 'finch', 1]
            ], [
              ['say', 'Finch', 'Brother! We come from...'],
              ['say', 'Frost-priest', 'From the Hold. I can smell the peat smoke on you. Kill them.'],
              ['battle', 'scouts'], ['remove'], ['set', 'scouts3', 1]
            ]]]],
            ['Dask: pay them to look away (80 gold)', [
              ['gold', -80],
              ['say', 'Dask', 'Eighty for the toll. Buy yourselves something warm. You look frozen.'],
              ['say', 'Frost-priest', 'We are frozen. ...Go on.'],
              ['xp', 305], ['remove'], ['set', 'scouts3', 3], ['bond', 'dask', 1]
            ], 'gold>=80']
          ]]
        ]
      },
      q: {
        type: 'foe', sprite: 'frostzealot', dir: 'down', under: 'path', script: [
          ['note', 'The Pale Hand camp sits square in the gap below the Cairn door. Its Reavers are already standing up.'],
          ['battle', 'cairncamp'], ['remove'],
          ['say', 'Runa', 'The Cairn door. I have not seen it since I was sixteen.']
        ]
      },
      u: { type: 'obj', gfx: 'caveMouth', under: 'snow', script: [['if', 'tunnelOpen', [
        ['note', 'The goblin tunnel runs under the ridge, low and warm and smelling of goat. It comes out above the Pale Hand camp.'],
        ['warp', 'frostpass', 't', 'down']
      ], [['note', 'A low tunnel into the ridge. Goblin sentries squat at the mouth and look at you very hard.']]]] },
      k: {
        type: 'npc', sprite: 'grukk', unless: 'grukk=3', dir: 'down', script: [
          ['if', '!q.goblins', [['quest', 'goblins', 1]]],
          ['if', 'tunnelOpen', [['say', 'Grukk', 'Tunnel is open, big one. Mind the goat.']], [
            ['if', 'grukk=1', [
              ['say', 'Grukk', 'Big one! And the singer! Grukk remembers. You told Grukk the truth about the grey lady. Grukk owes.'],
              ['say', 'Grukk', 'Grey robes sit on the Cairn road and take goblin goats. Grukk has a tunnel under the ridge. It comes out behind them. Go free.'],
              ['give', 'potent', 2], ['set', 'grukk3', 1], ['set', 'tunnelOpen'], ['xp', 250], ['quest', 'goblins', 2]
            ], [
              ['say', 'Grukk', 'The big one, who pays. Grukk remembers. Grukk has a tunnel past the grey robes. Grukk also has expenses.'],
              ['choice', null, 'Grukk wants 120 gold for the tunnel.', [
                ['Pay him (120 gold)', [
                  ['gold', -120], ['say', 'Grukk', 'Pleasure, pleasure. Mind the goat.'],
                  ['set', 'grukk3', 2], ['set', 'tunnelOpen'], ['xp', 250], ['quest', 'goblins', 2]
                ], 'gold>=120'],
                ['Not now', [['say', 'Grukk', 'Price goes up when it snows. It is always snowing.']]]
              ]]
            ]]
          ]]
        ]
      },
      j: {
        type: 'npc', sprite: 'nagra', if: 'grukk=3', unless: 'grukk3', dir: 'down', script: [
          ['if', '!q.goblins', [['quest', 'goblins', 1]]],
          ['say', 'Nagra', 'You. The ones who killed my brother in the barrow. Grukk was a fool, but he was MY fool.'],
          ['choice', null, "Grukk's sister Nagra wants blood.", [
            ['Fight her', [
              ['battle', 'nagra'],
              ['note', 'Nagra\'s goblins scatter into the snow. Their tunnel stands open and unguarded.'],
              ['set', 'grukk3', 3], ['set', 'tunnelOpen'], ['quest', 'goblins', 2]
            ]],
            ['Finch: talk her down', [['check', 'finch', [16, ['snik=1', -2], ['knowsCourt', -1]], [
              ['say', 'Finch', 'Your brother took the Pale Hand\'s silver and the Pale Hand\'s orders, and the Pale Hand left him to die in a hole. Who do you really owe a blood-debt?'],
              ['say', 'Nagra', '...The grey robes. Who sit on our road and eat our goats.'],
              ['say', 'Nagra', 'Fine. Use the tunnel. Kill some grey robes for Grukk. Then we are even.'],
              ['set', 'grukk3', 4], ['set', 'tunnelOpen'], ['xp', 220], ['quest', 'goblins', 2], ['bond', 'finch', 1]
            ], [
              ['say', 'Nagra', 'Words! Grukk liked words too.'],
              ['battle', 'nagra'],
              ['set', 'grukk3', 3], ['set', 'tunnelOpen'], ['quest', 'goblins', 2]
            ]]]]
          ]]
        ]
      },
      1: { type: 'npc', sprite: 'goblin', unless: 'grukk3=3', dir: 'up', script: [['say', 'Goblin', 'Goat is not for sale. Goat is family.']] },
      2: { type: 'npc', sprite: 'goblin', unless: 'grukk3=3', dir: 'right', script: [['say', 'Goblin', 'Snow goblin now. Very fashionable.']] },
      b: {
        type: 'npc', sprite: 'eydis', dir: 'down', script: [['if', 'q.bear>=3', [['say', 'Eydis', 'Arn is mending. He tells the bear story every night. The bear gets bigger every time.']], [
          ['if', 'arnSafe', [
            ['say', 'Eydis', 'Arn! He walked in an hour ago, half-frozen and swearing. You killed it? The white one?'],
            ['say', 'Runa', 'It is dead.'],
            ['say', 'Eydis', 'Then take this, and do not argue. A hunter pays her debts.'],
            ['gold', 120], ['give', 'potent', 2], ['xp', 350], ['quest', 'bear', 3]
          ], [['if', 'q.bear=1', [['say', 'Eydis', 'The ice caves are under the west cliffs, below the first ridge. Please hurry.']], [
            ['say', 'Eydis', 'Hold-folk? Then listen. Three days ago a white bear the size of a hut came down off the glacier and took my partner Arn.'],
            ['say', 'Eydis', 'It dragged him into the ice caves under the west cliffs. He was alive. He was shouting. I could not follow.'],
            ['say', 'Maren', 'Then we will.'],
            ['quest', 'bear', 1]
          ]]]]
        ]]]
      },
      h: { type: 'obj', gfx: 'shrine', script: [['note', "A wayshrine half-buried in snow. Its little flame still burns."], ['run', 'campsite']] },
      g: {
        type: 'obj', gfx: 'standing', script: [['if', 'knowsGiant', [['note', '"Here Hrimgar lay down upon the third shard, and the Lamp of the North sang him to sleep."']], [
          ['note', 'A standing stone, older than the clan, carved with a giant lying down and a small figure singing beside him.'],
          ['check', 'maren', 14, [
            ['say', 'Maren', '"Here Hrimgar, last of the hill giants, lay down upon the third shard, and the Lamp of the North sang him to sleep."'],
            ['say', 'Finch', 'Sang him to sleep. Then a song might do it again.'],
            ['set', 'knowsGiant'], ['xp', 60]
          ], [['note', 'The carving is too weathered to read.']]]
        ]]]
      },
      o: {
        type: 'obj', gfx: 'boulder', under: 'snow', script: [
          ['note', 'A boulder fell across the only way to the old watchtower. It looks like it means to stay.'],
          ['check', 'runa', 15, [['sfx', 'lever'], ['shake', 350], ['say', 'Runa', 'Stand back.'], ['note', 'Runa rolls it out onto the lake ice. The ice holds. Mostly.'], ['remove']],
            [['hurt', 'runa', '1d6'], ['say', 'Runa', 'Frozen to the ground. Again.']]]
        ]
      },
      z: { type: 'warp', to: 'watchtower', at: 'u', gfx: 'doorStone', under: 'snow', out: 'down' },
      v: { type: 'warp', to: 'icecaves', at: 'u', gfx: 'caveMouth', under: 'snow', out: 'right' },
      c: { type: 'chest', lock: 17, gold: 120, items: { potent: 2 } },
      d: { type: 'chest', gold: 60, items: { tonic: 2 } },
      e: {
        type: 'obj', gfx: 'bones', under: 'snow', script: [['if', 'veyraOrder', [['note', 'The frozen courier. Someone should bury him in the spring.']], [
          ['note', 'A Pale Hand courier, frozen where he sat down to rest. His satchel is still on him.'],
          ['say', 'Dask', 'Forty gold, a draught, and orders. "By the Sister\'s word: the Giant is not to be woken. No one goes below until I arrive. V."'],
          ['say', 'Maren', 'She is trying to stop it. Whatever the Hand wants, she is trying to stop that part.'],
          ['gold', 40], ['give', 'potent'], ['set', 'veyraOrder'], ['xp', 40]
        ]]]
      }
    }
  };
})();
