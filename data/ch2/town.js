/* Chapter 2 — Saltmere and its buildings. */
(function () {
  const M = G.D.maps;

  M.saltmere = {
    name: 'Saltmere', ground: 'sand', ground2: 'marsh', music: 'harbor', bg: 'town',
    rows: [
      'TTTTTTTTTTTTTTTTTTTnnTTTTTTTTTTTTTTTTTTT',
      'T;;___________"__"_::____________"___;;T',
      'T__^^^^^^^^^^"___L_::_L_""^^^^^^^^^^___T',
      'T_"^^^^^^^^^^_"_"""::"__"_^^^^^^^^^^__"T',
      'T"_^^^^^^^^^^"_____::_____^^^^^^^^^^___T',
      'T__^^^^^^^^^^____"_::_____^^^^^^^^^^_""T',
      'T__WNWWaWWNWW__"___::_____SHSScSSHSS___T',
      'T"_____:___________::_____""_":"___"__"T',
      'T______:_"______"__::_m"___"_":_"____"_T',
      'T::::::::::::::::::::::::::::::::::::::e',
      'T___"___:_____U__X_::"__""_:_____"_:___T',
      'T____"__:__"_"_r"__::______:"__4___:_"_T',
      'T__^^^^^^^^^^^w_O__::__^^^^^^^^____:RRRT',
      'T__^^^^^^^^^^^____U::__^^^^^^^^____:RRRT',
      'T__^^^^^^^^^^X___"_::__^^^^^^^^_""_:_RRT',
      'T__^^^^^^^^^^^____"::__^^^^^^^^""_pk_lRT',
      'T_"WNWWNbWNWWN___"_::__WNWWqWWN_""___RRT',
      'T______":________"_::__"___""_____"_RRRT',
      'T______________________________________T',
      'T___$_______3____1_______$_____________T',
      'T_______________________2______$______vT',
      '__________--_______--_______-___________',
      '~~~~~~~~~~--~~~~~~~--~~~~~~~-~~~~~~~~~~~',
      '~~~~~~~~~~--~~~~~~~-u~~~~~~~-!~~~~~~~~~~',
      '~~~~~~~~~~--!~~~~~~--!~~~~~~-~~~~~~~~~~~',
      '~~~~~!~~~~-z~~~~~~~--~~~~~~~-~~~~~~~~~~~',
      '~~~~~~~~~~--~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    things: {
      n: { type: 'obj', gfx: 'path', under: 'path', out: 'down', script: [['choice', null, 'The north road.', [['Back to Brackenford', [['warp', 'brackenford', 'z', 'up']]], ['North into the hills, to Karrow Hold', [['run', 'ch3road']], 'ch2done'], ['The road to Highmoor', [['run', 'ch4road']], 'ch3done'], ['Stay in Saltmere', []]]]] },
      e: { type: 'obj', gfx: 'fence', under: 'path', out: 'left', script: [['if', 'tidechart', [
        ['choice', null, 'The fen gate. Beyond it, the boardwalks run out into Mirefen.', [['Go into the fen', [['warp', 'mirefen', 's', 'right']]], ['Not yet', []]]]
      ], [
        ['say', 'Fen Warden', 'Nobody crosses the fen without a tide chart. The water comes in faster than a man can run. Sister Ysolde at the chapel has one.']
      ]]] },
      a: { type: 'warp', to: 's_inn', at: 'x', gfx: 'door', under: 'timber', out: 'down' },
      b: { type: 'warp', to: 's_shop', at: 'x', gfx: 'door', under: 'timber', out: 'down' },
      c: { type: 'warp', to: 's_chapel', at: 'x', gfx: 'doorStone', under: 'stonewall', out: 'down' },
      q: { type: 'sign', gfx: 'door', under: 'timber', text: 'HARBOUR OFFICE. The Harbourmaster is on the docks.' },
      m: { type: 'sign', gfx: 'notice', text: 'MISSING from the Saltmere boats: Jory Fenn, Wat Tolly, the Ames brothers, Old Cobb, and young Hal. Word to Harbourmaster Quill. — FEN GATE CLOSED to all without a tide chart.' },
      v: { type: 'warp', to: 'seacave', at: 'u', gfx: 'caveMouth', under: 'sand', out: 'left', script: [['if', '!q.light', [['note', 'A cave mouth at the foot of the lighthouse cliff. The tide is out, for now.']]]] },
      l: { type: 'obj', gfx: 'lighthouse', gfxIf: ['lightLit', 'lighthouseLit'], under: 'sand', script: [['if', 'lightLit', [['note', 'The Saltmere light sweeps the water.']], [['note', 'The lighthouse is dark. Ships have been running aground on the bar.']]]] },
      k: {
        type: 'npc', sprite: 'bastian', dir: 'left', script: [['if', 'q.light>=3', [['say', 'Bastian', 'Pip has not stopped talking about you. Or the crab. Mostly the crab.']], [
          ['if', 'q.light=2&item.oil', [
            ['say', 'Bastian', 'Pip! And the oil! Up the stairs with you, boy, and light her.'],
            ['take', 'oil'], ['set', 'lightLit'], ['sfx', 'magic'], ['note', 'Up on the cliff, the Saltmere light catches and turns.'],
            ['say', 'Bastian', 'Take this. The old lens from the first lamp up there. It never did stop glowing.'],
            ['give', 'keeperlens'], ['gold', 80], ['xp', 110], ['quest', 'light', 3]
          ], [['if', 'q.light=1', [['say', 'Bastian', 'The cave is under the cliff, east end of the beach. Please. He is only eleven.']], [
            ['say', 'Bastian', 'You are fighters? Then for the love of the Lamplighter, help me. My boy Pip went down to the sea cave for oil two days ago. Smugglers keep casks there.'],
            ['say', 'Bastian', 'The tide has been in twice since. And something big lives down there now. I hear it clicking at night.'],
            ['quest', 'light', 1]
          ]]]]
        ]]]
      },
      r: {
        type: 'npc', sprite: 'coll', unless: 'coll', dir: 'down', script: [
          ['say', 'Brother Coll', '...and the sea gives back what it takes, friends! The drowned will come home, every one of them. The Hand has promised it, and the Hand keeps its promises.'],
          ['say', 'Widow Ama', 'My Jory went out with the boats three weeks ago. Brother Coll says I will see him again.'],
          ['quest', 'coll', 1],
          ['choice', null, 'A man in Warden grey is preaching the Pale Hand to the grieving of Saltmere.', [
            ['Finch: show the crowd what he is', [['check', 'finch', [14, ['tut.letter', -2], ['ledger', -2]], [
              ['say', 'Finch', 'Friends! A question for Brother Coll. If the Hand brings the drowned home, why do its acolytes carry fishermen INTO the fen, tied hand and foot? I have seen the knots.'],
              ['note', 'The crowd goes quiet. Then someone throws a fish.'],
              ['say', 'Widow Ama', 'Into the fen? Then where is Jory? WHERE IS JORY?'],
              ['note', 'Brother Coll runs for the fen gate with half of Saltmere behind him.'],
              ['set', 'coll', 1], ['set', 'knowsRitual'], ['bond', 'finch', 1], ['xp', 60]
            ], [
              ['say', 'Brother Coll', 'A singer! Of course the Wardens send a singer. They always did prefer pretty words to real hope.'],
              ['note', 'The crowd stays with him. Finch has lost an audience, which he takes personally.']
            ]]]],
            ['Runa: run him out of town', [['check', 'runa', 12, [
              ['note', 'Runa walks up to the preaching-box and stands there until Brother Coll runs out of sermon.'],
              ['say', 'Brother Coll', 'You will regret this. The Abbey will know you are coming.'],
              ['note', 'He goes, fast, toward the fen gate.'],
              ['set', 'coll', 2], ['xp', 40]
            ], [['say', 'Brother Coll', 'Violence! Do you see, friends? This is what the Wardens send.'], ['note', 'The crowd closes around him. Not today.']]]]],
            ['Maren: hear him out', [
              ['say', 'Maren', 'Tell me what the Hand has promised. All of it. I am a Warden; I will not interrupt.'],
              ['say', 'Brother Coll', 'The Prior of the Drowned Abbey drowned with his monks, and his lamp kept them down. Now the lamp is out. At the next low tide he walks, and the souls that drown with him walk too.'],
              ['say', 'Brother Coll', 'Six good men will drown with him, by their own consent, and come home. The Sister herself has blessed it.'],
              ['say', 'Maren', 'By their own consent. Did anyone ask them?'],
              ['note', 'Brother Coll does not answer that. Neither does Widow Ama, who has gone very pale.'],
              ['set', 'coll', 3], ['set', 'knowsRitual'], ['bond', 'maren', 1], ['xp', 60]
            ]],
            ['Leave him be', []]
          ]],
          ['if', 'coll', [['quest', 'coll', 2]]]
        ]
      },
      w: { type: 'npc', sprite: 'ama', dir: 'up', script: [['if', 'hostagesSaved', [['say', 'Widow Ama', 'Jory is home. He does not remember the Abbey. I am glad.']], [
        ['if', 'hostagesLost', [['say', 'Widow Ama', '...'], ['note', 'She does not look up.']], [['say', 'Widow Ama', 'Jory went out with the boats three weeks ago. I keep the lamp in the window lit, like the Wardens say.']]]
      ]]] },
      u: {
        type: 'npc', sprite: 'quill', dir: 'down', under: 'boardwalk', script: [
          ['if', 'q.main2>=7', [['say', 'Harbourmaster Quill', 'Saltmere owes you. If you are ever back this way, the Gull and Lantern will not charge you a copper.']], [
            ['if', 'q.main2=6', [['run', 'ch2end']], [
              ['if', 'q.main2>=2', [['say', 'Harbourmaster Quill', 'Sister Ysolde, at the chapel. She has the only tide chart of the fen worth the paper.']], [
                ['say', 'Harbourmaster Quill', 'Strangers, at a time like this? Then you are either fools or sellswords, and I can use either.'],
                ['say', 'Harbourmaster Quill', 'Saltmere is drowning by inches. Eleven days ago a Warden in grey came asking for my tide tables. Since then the Abbey bell rings at every low tide, and the fen-dead walk.'],
                ['say', 'Maren', 'A Warden in grey. Veyra.'],
                ['say', 'Harbourmaster Quill', 'Six of my fishermen are gone. Not drowned. Gone. Find them, find out what is happening at that Abbey, and Saltmere will pay two hundred.'],
                ['say', 'Harbourmaster Quill', 'You will need a way across Mirefen. Sister Ysolde at the chapel keeps the only tide chart worth having.'],
                ['quest', 'main2', 2]
              ]]
            ]]
          ]]
        ]
      },
      z: { type: 'npc', sprite: 'goblin', if: 'snik=1', dir: 'right', under: 'boardwalk', script: [['if', 'snikMet', [['say', 'Snik', 'Eels! Fresh eels! For heroes, half price. Three-quarters.']], [
        ['say', 'Snik', 'Big one! And the singer! Snik remembers. Snik went south like you said. Snik sells eels now. Honest work. Mostly.'],
        ['say', 'Snik', 'Snik tells you something for free, because you let Snik go. Grey ones carry fishermen through the fen at night, tied up. To the Abbey. Snik hid in the reeds.'],
        ['say', 'Snik', 'And grey ones never go in the Abbey front door. Side door. Little garden door.'],
        ['set', 'snikMet'], ['set', 'knowsRitual'], ['set', 'abbeyHint'], ['give', 'greater', 2]
      ]]] },
      1: { type: 'npc', sprite: 'fisher2', dir: 'down', script: [['say', 'Fisherman', 'The fen-dead come up at low tide. Each one still wears his name-tag, poor soul. The Sister at the chapel would want those.']] },
      2: { type: 'npc', sprite: 'fisher', wander: true, script: [['say', 'Fisherwife', "The lighthouse has been dark three nights. Bastian's boy went for oil and never came back. Bastian has not slept since."]] },
      3: { type: 'npc', sprite: 'boy', wander: true, script: [['say', 'Boy', 'Brother Coll says my da will come home from the sea. Mam says not to listen to Brother Coll.']] },
      p: { type: 'npc', sprite: 'pip', if: 'pipSafe', dir: 'right', script: [['say', 'Pip', 'Da says I am not allowed in caves until I am forty. I said what about crabs. He said especially crabs.']] },
      4: { type: 'npc', sprite: 'ama', wander: true, script: [['say', 'Old Woman', 'There is a witch in the fen. Mother Brine. She is fair, if you are fair with her, and she knows every path in Mirefen.']] }
    }
  };

  M.s_inn = {
    name: 'The Gull and Lantern', ground: 'wood', music: 'harbor', bg: 'tavern',
    rows: [
      '##############',
      '#UU.K.b..K..Y#',
      '#..CCCCC.....#',
      '#............#',
      '#.A.v.....A..#',
      '#.A.w.y...A.g#',
      '#.....p......#',
      '#..A.......f.#',
      '#.....V......#',
      '######x#######'
    ],
    things: {
      x: { type: 'warp', to: 'saltmere', at: 'a', gfx: 'mat', out: 'up' },
      p: { type: 'mark' },
      b: {
        type: 'npc', sprite: 'mags', script: [['choice', 'Mags', 'Welcome to the Gull and Lantern. A bed is twenty-five, and the chowder is whatever came up in the nets.', [
          ['Rest (25 gold)', [['if', 'q.main2>=7', [['inn', 0], ['say', 'Mags', 'On the house. Quill said so, and I would have anyway.']], [['if', 'gold>=25', [['inn', 25], ['say', 'Mags', 'Morning. The fog lifted, for once.']], [['say', 'Mags', 'Twenty-five, love. The fish do not pay for themselves.']]]]]]],
          ['Any news?', [['say', 'Mags', 'Brannoc Vosk has been drinking here a week on grey money. Do not start anything. I have only just fixed the chairs from the last lot.']]],
          ['Nothing, thanks', []]
        ]]]
      },
      v: {
        type: 'npc', sprite: 'vosk', unless: 'brannoc2>=1&brannoc2<=3', dir: 'down', script: [['if', 'brannoc2=4', [['say', 'Brannoc', 'Still here. Still drinking. Still not your problem.']], [
          ['say', 'Brannoc', 'Well, well. The tavern-wreckers. Sit down before you fall down.'],
          ['if', 'shardAt=1', [['say', 'Brannoc', "My brothers went back north for the old man's shard. They came back without eyebrows. That Warden of yours has a lamp like a forge."]]],
          ['say', 'Brannoc', 'I work for the Hand now. Steady pay, and nobody posts notices about it.'],
          ['choice', null, 'Brannoc Vosk, in Pale Hand pay, three tables from you.', [
            ['Settle it again', [
              ['battle', 'brannoc2'],
              ['say', 'Brannoc', 'Fine. FINE. They are taking fishermen to the Abbey. Six of them. For the Prior\'s tide, whatever that is. That is all I know.'],
              ['set', 'brannoc2', 1], ['set', 'knowsRitual']
            ]],
            ['Pay him for what he knows (60 gold)', [
              ['gold', -60],
              ['say', 'Brannoc', 'Now that is the language of reasonable men. Six fishermen, taken to the Abbey for something they call the Prior\'s tide. And the Sister never goes in by the nave. Cloister door, every time.'],
              ['set', 'brannoc2', 2], ['set', 'knowsRitual'], ['set', 'abbeyHint']
            ], 'gold>=60'],
            ['Show him his own ledger', [
              ['say', 'Dask', '"Grave silver, sent on to Orrin and Sons, paid in full by the Hand." In your handwriting, Brannoc. I wonder what Orrin and Sons pay couriers who keep diaries.'],
              ['say', 'Brannoc', '...Where did you get that.'],
              ['say', 'Brannoc', 'All right. All right. Six fishermen, for the Prior\'s tide. The Sister goes in by the cloister, never the nave.'],
              ['say', 'Brannoc', 'And here. I took this off an acolyte who will not be needing it. Treasury key. Now give me that book.'],
              ['say', 'Dask', 'Not a chance. But I will forget I read it.'],
              ['give', 'treasurykey'], ['set', 'brannoc2', 3], ['set', 'knowsRitual'], ['set', 'abbeyHint'], ['bond', 'dask', 1]
            ], 'item.ledger'],
            ['Leave him to his ale', [['set', 'brannoc2', 4]]]
          ]]
        ]]]
      },
      w: { type: 'npc', sprite: 'bruiser', unless: 'brannoc2>=1&brannoc2<=3', dir: 'up', script: [['say', 'Vosk Hireling', 'Brannoc does the talking.']] },
      y: { type: 'npc', sprite: 'bruiser', unless: 'brannoc2>=1&brannoc2<=3', dir: 'left', script: [['say', 'Vosk Hireling', 'We are on our break.']] },
      f: { type: 'npc', sprite: 'fisher', dir: 'left', script: [['say', 'Sailor', 'The Abbey bell rings at low tide now, and nobody rings it. I have stopped going out at dusk.']] },
      g: { type: 'npc', sprite: 'merchant', dir: 'left', script: [['if', 'merchant', [['say', 'Merchant', 'The heroes of Brackenford! I am owed a second verse, you know. I have been telling people.']], [['say', 'Merchant', 'The bridge is mended, and here I am, selling Saltmere silk back to Saltmere. Business is a circle.']]]] }
    }
  };

  M.s_shop = {
    name: 'Brine and Rook', ground: 'wood', music: 'harbor', bg: 'town',
    rows: [
      '##############',
      '#KK.o.UU.Y..r#',
      '#.CCCC....CCC#',
      '#............#',
      '#.X..J...Z...#',
      '#............#',
      '#.....V......#',
      '#............#',
      '######x#######'
    ],
    things: {
      x: { type: 'warp', to: 'saltmere', at: 'b', gfx: 'mat', out: 'up' },
      o: { type: 'npc', sprite: 'pettibone', script: [['say', 'Pettibone', 'Rope, salt, lamp-oil, draughts. Nothing that bites, I promise.'], ['shop', 'chandler']] },
      r: { type: 'npc', sprite: 'rook', script: [['say', 'Rook', 'Sea-iron. Costs more. Lives longer. Like you will.'], ['shop', 'rook']] }
    }
  };

  M.s_chapel = {
    name: 'Chapel of the Tide-Lamp', ground: 'stone', music: 'harbor', bg: 'town',
    rows: [
      '############',
      '#+...QQ...+#',
      '#....w.....#',
      '#..........#',
      '#.I......I.#',
      '#....VV....#',
      '#.I..VV..I.#',
      '#....VV....#',
      '#.h..VV..d.#',
      '#....VV....#',
      '#####xx#####'
    ],
    things: {
      x: { type: 'warp', to: 'saltmere', at: 'c', gfx: 'mat', out: 'up' },
      h: { type: 'obj', gfx: 'shrine', script: [['note', "Saltmere's ward-lamp, burning blue-white behind its glass. It is good to stand near. For real rest there is the inn."]] },
      d: { type: 'sign', gfx: 'notice', script: [['note', 'A board of names, painted one under another: every Saltmere soul the sea has kept. The newest are only chalk.'],
        ['if', 'q.tags>=2', [['note', 'Four of the chalk names have been painted over properly now.']]]] },
      w: {
        type: 'npc', sprite: 'ysolde', dir: 'down', script: [
          ['if', '!ysoldeMet', [
            ['say', 'Sister Ysolde', 'A Warden, and from the chapter house by your mantle. Then you have come about the Abbey. Or about her.'],
            ['say', 'Maren', 'Both. I am Maren. She was my pupil.'],
            ['say', 'Sister Ysolde', 'Then I am sorry, Sister. She knelt in this chapel eleven days ago, and I did not see what she was until she was gone.'],
            ['set', 'ysoldeMet']
          ]],
          ['if', 'q.tags=1&item.tag>=4', [
            ['say', 'Sister Ysolde', 'Four names. Davey Pike. Bennet Shaw. Old Sorrel. Ned Cray. They will go in the ground under their own names. Thank you.'],
            ['take', 'tag', 4], ['give', 'greater', 2], ['gold', 60], ['xp', 120], ['quest', 'tags', 2]
          ]],
          ['topics', 'Sister Ysolde', 'What do you need to know?', [
            ['Crossing Mirefen', [
              ['say', 'Sister Ysolde', 'The fen is safe on the boardwalks, and nowhere else. At low tide the dead walk the mud. Here: my tide chart. Show it at the fen gate.'],
              ['give', 'tidechart'], ['set', 'tidechart'], ['quest', 'main2', 3]
            ], '!tidechart'],
            ['The Drowned Abbey', [
              ['say', 'Sister Ysolde', 'A hundred years ago the sea broke the dykes in one night. Prior Anselm and twelve monks drowned at their prayers. The Abbey lamp was lit over them, to keep them down.'],
              ['say', 'Sister Ysolde', 'Under that lamp lies the second shard of the crown. The Prior was its keeper. I think he still is.']
            ]],
            ['What did Veyra want here?', [
              ['say', 'Sister Ysolde', 'The hour of the low tide, and the way into the Abbey crypt. She asked if the drowned remember their names.'],
              ['say', 'Maren', 'What did you tell her?'],
              ['say', 'Sister Ysolde', 'That we remember them for them. She cried, a little. Then she left.']
            ]],
            ['The drowned dead', [
              ['say', 'Sister Ysolde', 'Every Saltmere fisher wears a tin tag with his name, so the sea cannot keep him nameless. The fen-dead still wear theirs.'],
              ['say', 'Sister Ysolde', 'Bring me four, and I will see them buried properly. It is the least we can do for them.'],
              ['if', '!q.tags', [['quest', 'tags', 1]]]
            ]]
          ], 'Thank you, Sister.']
        ]
      }
    }
  };
})();
