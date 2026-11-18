/* Chapter 3 — Karrow Hold and its buildings. */
(function () {
  const M = G.D.maps;

  M.karrow = {
    name: 'Karrow Hold', ground: 'snow', ground2: 'drift', music: 'hold', bg: 'snow',
    rows: [
      '{{{{{{{{{{{{{{{{{{{ee{{{{{{{{{{{{{{{{{{{',
      '{......,..,,......7::....,............,{',
      '{..||||||||||||||,.::,.,....,.,...,....{',
      '{.,|||||||||||||L,.::,,....].....].....{',
      '{.,||||||||||||||..::...,..............{',
      '{..||||||||||||||..::..,,..............{',
      '{..||||||||||||||..::::::]....h.,.,]...{',
      '{.,||||||||||||||,,::..................{',
      '{..WNWWNWaNWWNWWN..::.....s..,.........{',
      '{....,...:..,.....,::..,..,].....].....{',
      '{,.......::::::::::::.,.....,y.,..3.,,,{',
      '{.U.,,,....4,.,....::,.,..............,{',
      '{.,..,............,::.,L,.........,.XX.{',
      '{..||||||||||..O...::.,,...||||||||,..,{',
      '{,,||||||||||,.....::..,..,||||||||....{',
      '{..||||||||||......::,,....||||||||....{',
      '{..||||||||||Z.,,..::.,,..,||||||||.,,,{',
      '{..WNWWbWWNWW.U....::......WNWWjWWN....{',
      '{.,..,.:,.....,....::......,..,:...,...{',
      '{......:::::::::::::::::::::::::..,.,..{',
      '{.,,...,....,.1...,::.....,.,,,.,,.....{',
      '{,.....,.......,.,.::,...||||||||,FF...{',
      '{.,||||||||.FFF,...::,...||||||||.,..,.{',
      '{..||||||||.......,::.2.,||||||||......{',
      '{..||||||||,....,..::....WNWWNWWN......{',
      '{..WNWWNWWN.....L..::.,...,..w,...,.,..{',
      '{,,...........,,...::..L..,..,......}..{',
      '{.}.,.............5::6...,,..,.,.......{',
      '{..,.,....,.......,::.,.,.......,..,..,{',
      '{{{{{{{{{{{{{{{{{{{nn{{{{{{{{{{{{{{{{{{{'
    ],
    things: {
      e: { type: 'obj', gfx: 'path', under: 'path', out: 'down', script: [['if', 'q.main3>=3', [
        ['choice', null, 'The north gate. Beyond it, the Frost Pass climbs toward the Cairn.', [['Go up into the pass', [['warp', 'frostpass', 's', 'up']]], ['Not yet', []]]]
      ], [['say', 'Clan Guard', 'Nobody goes up to the Cairn until the Chief says so. Oathbreakers least of all.']]]] },
      n: { type: 'obj', gfx: 'path', under: 'path', out: 'up', script: [['choice', null, 'The south road, out of the hills.', [
        ['South to Saltmere', [['warp', 'saltmere', 'n', 'down']]],
        ['South-west to Brackenford', [['warp', 'brackenford', 'z', 'up']]],
        ['South-east, to Highmoor', [['run', 'ch4road']], 'ch3done'],
        ['Stay in Karrow Hold', []]
      ]]] },
      a: { type: 'warp', to: 'k_hall', at: 'x', gfx: 'door', under: 'timber', out: 'down' },
      b: { type: 'warp', to: 'k_shop', at: 'x', gfx: 'door', under: 'timber', out: 'down' },
      j: { type: 'warp', to: 'k_cells', at: 'x', gfx: 'door', under: 'timber', out: 'down' },
      h: { type: 'obj', gfx: 'shrine', script: [['note', 'A ward-lamp in the middle of the Ring of Stones, sheltered from the wind. It is good to stand near. For real rest there is the inn.']] },
      5: { type: 'npc', sprite: 'clanguard', dir: 'up', script: [['if', 'runaOath', [
        ['if', 'runaOath=2', [['say', 'Clan Guard', 'Paid, I heard. Coin is coin.']], [['say', 'Clan Guard', 'Welcome home, Cairnwarden.']]]
      ], [['say', 'Clan Guard', 'Oathbreaker. The Chief is in the Longhall. Go straight there.']]]] },
      6: { type: 'npc', sprite: 'clanguard', dir: 'up', script: [['say', 'Clan Guard', 'Grey robes came through in the autumn, asking about the Cairn. We sent them away. They did not go far.']] },
      7: { type: 'npc', sprite: 'clanguard', dir: 'down', script: [['if', 'q.main3>=3', [['say', 'Clan Guard', 'Mind the ridges. The Pale Hand holds the gaps.']], [['say', 'Clan Guard', 'The north gate stays shut until the Chief says otherwise.']]]] },
      y: {
        type: 'npc', sprite: 'bryn', dir: 'left', script: [['if', 'runaOath', [
          ['if', 'brynAlly', [['say', 'Bryn', 'When you go up to the Cairn, I am coming. Do not argue.']], [['say', 'Bryn', 'You paid. Fine. It does not change what you did for me. It just does not say it either.']]]
        ], [['if', 'brynTalk', [['say', 'Bryn', 'Go and answer, cousin. I will be watching.']], [
          ['say', 'Bryn', 'Runa.'],
          ['say', 'Runa', 'Bryn. You look well.'],
          ['say', 'Bryn', 'I am alive. You saw to that. You dug for four hours with your hands. Then you were gone before I could stand up.'],
          ['say', 'Bryn', 'Eleven years I have wanted to hit you for that. And thank you for the rest. I have not decided which first.'],
          ['say', 'Finch', '(Quietly, writing.) Oh, that is going in.'],
          ['set', 'brynTalk'], ['bond', 'finch', 1]
        ]]]]]
      },
      w: {
        type: 'npc', sprite: 'asta', dir: 'down', script: [['if', 'astaTalk', [['say', 'Asta', 'Go on up, girl. Hallvard would have liked to see you climb it.']], [
          ['say', 'Asta', 'Runa Stonehand. I wondered if you would knock.'],
          ['say', 'Runa', 'Asta. I left the door. Hallvard died holding it. I am sorry.'],
          ['say', 'Asta', 'He chose the door. You chose Bryn. You both chose right, and only one of you has been punishing herself for eleven years.'],
          ['say', 'Asta', 'Hallvard said so himself, the night before. "The girl did right." Tell Sigrid I said it, if she makes you answer.'],
          ['set', 'astaTalk'], ['bond', 'maren', 1]
        ]]]
      },
      s: {
        type: 'npc', sprite: 'hrolf', dir: 'down', script: [['if', 'q.watcher>=3', [['say', 'Skald Hrolf', 'They will sing your third stanza in this hall for a hundred years. Badly, but they will sing it.']], [
          ['if', 'item.verse3', [
            ['say', 'Finch', '"And when the four had kept their sleep, she found the door would not stay shut; she took the key into the deep, and turned it, and was not seen but..."'],
            ['say', 'Skald Hrolf', '...But. It ends on "but". Of course it does. The Fifth Lamp went down into the dark, and the song does not say whether she came up.'],
            ['say', 'Skald Hrolf', 'Take this for it. A skald pays for a song.'],
            ['gold', 100], ['give', 'potent', 2], ['xp', 300], ['quest', 'watcher', 3]
          ], [['if', 'q.watcher=1', [['say', 'Skald Hrolf', 'The watchtower is above the frozen lake, past the ridge. A rockfall closes the way. Bring a strong back.']], [
            ['say', 'Skald Hrolf', 'A singer. I can always tell. You stand like you are waiting for a pause.'],
            ['say', 'Finch', 'I am looking for the fifth verse of the Ballad of the Five Lamps. I have two stanzas.'],
            ['say', 'Skald Hrolf', 'Then you are further than any skald in the north. The Lamp of the North kept a watchtower above the pass. If any of her song is left, it is up there.'],
            ['quest', 'watcher', 1]
          ]]]]
        ]]]
      },
      1: { type: 'npc', sprite: 'kid3', wander: true, script: [['say', 'Girl', 'Are you the oathbreaker? You do not look like an oathbreaker. You look like a bear in a coat.']] },
      2: { type: 'npc', sprite: 'asta', wander: true, script: [['say', 'Weaver', 'The Cairn lamp used to be the first thing you saw coming home. It has been dim all autumn.']] },
      3: { type: 'npc', sprite: 'hunter3', dir: 'left', script: [['say', 'Hunter', 'Eydis lost her man to a white bear in the pass. Big as a house, she says. Nobody believes her. I do.']] },
      4: { type: 'npc', sprite: 'hunter3', dir: 'down', script: [['say', 'Old Trapper', 'Goblins in the pass this winter. Polite ones, if you can believe it. They paid for a sledge.']] }
    }
  };

  M.k_hall = {
    name: 'The Longhall', ground: 'wood', music: 'hold', bg: 'tavern',
    rows: [
      '####################',
      '#KKKKKKKK..KKKKKKKK#',
      '#........c.........#',
      '#...............3..#',
      '#..AAA........AAA..#',
      '#...1..YYYYYY......#',
      '#..............2...#',
      '#..AAA........AAA..#',
      '#.........p........#',
      '#CCC....VVVV.4.....#',
      '#.r.....VVVV.......#',
      '#########x##########'
    ],
    things: {
      x: { type: 'warp', to: 'karrow', at: 'a', gfx: 'mat', out: 'up' },
      p: { type: 'mark' },
      c: {
        type: 'npc', sprite: 'sigrid', dir: 'down', script: [
          ['if', 'q.main3>=7', [['say', 'Sigrid', 'The Hold is yours whenever you need it. All four of you. Even the singer.']], [
            ['if', 'q.main3=6', [['run', 'ch3end']], [
              ['if', 'q.main3=2', [
                ['choice', 'Sigrid', 'Are you ready to answer, Runa?', [['Answer the oath now', [['run', 'oath']]], ['Not yet', [['say', 'Sigrid', 'The clan can wait a little longer. It has waited eleven years.']]]]]
              ], [['if', 'q.main3>=3', [['say', 'Sigrid', 'The Cairn, Runa. Find Kell. Find out who is killing my lamp.']], [
                ['say', 'Sigrid', 'Runa Stonehand. Eleven years.'],
                ['say', 'Runa', 'Aunt.'],
                ['say', 'Sigrid', 'Chief, in this hall. And you walk in with a Warden, a thief and a singer. Interesting company for an oathbreaker.'],
                ['say', 'Maren', 'Maren Vale, of the Wardens of the Lamp. We have come about the Cairn.'],
                ['say', 'Sigrid', 'Then you are welcome, Warden. The Cairn lamp has been guttering all autumn. Warden Kell went up nine days ago, and he has not come down.'],
                ['say', 'Sigrid', 'Grey robes camp below the Cairn door. There are goblins in the pass. And the ground has been shaking at night, as if something big were turning over.'],
                ['say', 'Sigrid', 'But hear the first law of this Hold, older than me: no oathbreaker sets foot on the Cairn. Runa must answer her oath before the clan, and then you may climb.'],
                ['say', 'Sigrid', 'Talk to whoever you need to. When you are ready, come back to me.'],
                ['say', 'Sigrid', 'One more thing, Warden. We caught one of the grey robes. He is in the cells. You know their kind better than we do. Decide what becomes of him.'],
                ['quest', 'main3', 2], ['quest', 'prisoner', 1]
              ]]]]
            ]]
          ]]
        ]
      },
      r: {
        type: 'npc', sprite: 'ragna', dir: 'up', script: [['choice', 'Ragna', 'The Longhall feeds anyone the Chief feeds. A bed by the fire is forty, mead included.', [
          ['Rest (40 gold)', [['if', 'q.main3>=7', [['inn', 0], ['say', 'Ragna', 'No charge. Not for you lot. Not ever.']], [['if', 'gold>=40', [['inn', 40], ['say', 'Ragna', 'Up you get. The porridge is already burnt.']], [['say', 'Ragna', 'Forty, love. Snow does not shovel itself.']]]]]]],
          ['Any news?', [['say', 'Ragna', 'Bryn has been in the Ring every morning since word came you were on the road. Mind your jaw.']]],
          ['Nothing, thanks', []]
        ]]]
      },
      1: { type: 'npc', sprite: 'shieldmaiden', dir: 'right', script: [['say', 'Shieldmaiden', 'The last Cairnwarden. Hallvard. He had a voice like a rockslide. We still sing his songs.']] },
      2: { type: 'npc', sprite: 'clanguard', dir: 'left', script: [['say', 'Clansman', 'Highmoor sent a man in the summer to buy the Cairn. Buy it! Sigrid threw him in the river.']] },
      3: { type: 'npc', sprite: 'hunter3', dir: 'down', script: [['say', 'Clansman', 'Eleven winters the oathbreaker was gone. She looks smaller than I remember. Or I am bigger.']] },
      4: { type: 'npc', sprite: 'kid3', dir: 'left', script: [['say', 'Boy', 'Is it true the halfling stole a crown?'], ['say', 'Dask', 'A third of one. Allegedly.']] }
    }
  };

  M.k_shop = {
    name: 'Forge and Furs', ground: 'wood', music: 'hold', bg: 'town',
    rows: [
      '##############',
      '#..o....Y.r.Z#',
      '#CCCCCC.CCCCC#',
      '#............#',
      '#............#',
      '#K...........#',
      '#U..........X#',
      '#............#',
      '######x#######'
    ],
    things: {
      x: { type: 'warp', to: 'karrow', at: 'b', gfx: 'mat', out: 'up' },
      o: { type: 'npc', sprite: 'ulf', script: [['say', 'Ulf', 'Furs, salves, draughts. Everything you need to come back down alive.'], ['shop', 'ulf']] },
      r: { type: 'npc', sprite: 'thora', script: [['if', 'runaOath', [['say', 'Thora', 'Cold-forged hill-iron. It does not shatter in the frost. Neither, it seems, do you.']], [['say', 'Thora', 'I sell to oathbreakers. Their coin rings the same.']]], ['shop', 'thora']] }
    }
  };

  M.k_cells = {
    name: 'The Cells', ground: 'stone', music: 'hold', bg: 'town', legend: { B: 'bars' },
    rows: [
      '##########',
      '#%......U#',
      '#...p....#',
      '#BBBBBBBB#',
      '#......g.#',
      '#........#',
      '####x#####'
    ],
    things: {
      x: { type: 'warp', to: 'karrow', at: 'j', gfx: 'mat', out: 'up' },
      g: { type: 'npc', sprite: 'clanguard', dir: 'up', script: [['say', 'Clan Guard', 'He has not said a word since we caught him. Eats like a wolf, though.']] },
      p: {
        type: 'npc', sprite: 'coll', unless: 'prisoner', dir: 'down', script: [
          ['if', 'coll=2', [
            ['say', 'Prisoner', 'You. The big one. You ran me out of Saltmere, and I ran all the way to the Abbey, and the Abbey sent me here.'],
            ['say', 'Finch', 'Brother Coll! The world is small and full of preachers.']
          ], [['say', 'Prisoner', 'Wardens. I will tell you nothing. The Hand will come for me.']]],
          ['if', '!q.prisoner', [['quest', 'prisoner', 1]]],
          ['choice', null, 'What becomes of the prisoner?', [
            ['Hand him to the clan', [
              ['say', 'Clan Guard', 'Clan justice, then. A sledge, a day of food, and the long road south. If the snow lets him live, he lives.'],
              ['set', 'prisoner', 1], ['xp', 150], ['quest', 'prisoner', 2]
            ]],
            ['Dask: question him', [['check', 'dask', [15, ['knowsRitual', -2], ['ledger', -2]], [
              ['say', 'Dask', 'You are a long way from your counting-house, friend. Who signs your pay? Orrin and Sons? Or someone above Orrin?'],
              ['say', 'Prisoner', '...Above. A man at the Duke\'s court. I never saw his face. Orrin calls him "my lord".'],
              ['say', 'Prisoner', 'And there is a goblin tunnel past our camp below the Cairn. The goblins would not sell it to us. Maybe they will sell it to you.'],
              ['set', 'prisoner', 2], ['set', 'knowsCourt'], ['xp', 150], ['quest', 'prisoner', 2], ['bond', 'dask', 1]
            ], [['say', 'Prisoner', 'Do your worst, halfling.'], ['say', 'Dask', 'This IS my worst. I am out of practice.']]]]],
            ['Finch: question him', [['check', 'finch', [15, ['knowsRitual', -2], ['coll=2', -2]], [
              ['say', 'Finch', 'Here is the thing. When this is all over, someone will write the song. Do you want to be the villain in it, or the fellow who told the truth in the second verse?'],
              ['say', 'Prisoner', '...There is a man at the Duke\'s court. Orrin answers to him. I never saw his face.'],
              ['say', 'Prisoner', 'And the goblins in the pass have a tunnel past our camp. They would not sell it to us.'],
              ['set', 'prisoner', 2], ['set', 'knowsCourt'], ['xp', 150], ['quest', 'prisoner', 2], ['bond', 'finch', 1]
            ], [['say', 'Prisoner', 'I have heard better speeches from gulls.']]]]],
            ['Maren: set him free, with a message for Veyra', [
              ['say', 'Maren', 'Go up to the Cairn. Find Sister Veyra. Tell her Maren is coming, and is coming in peace, if she will let me.'],
              ['say', 'Prisoner', '...Why would you trust me with that?'],
              ['say', 'Maren', 'Because I would like, very much, to be wrong about at least one of you.'],
              ['set', 'prisoner', 3], ['set', 'veyraWarned'], ['xp', 150], ['quest', 'prisoner', 2], ['bond', 'maren', 1], ['bond', 'dask', -1]
            ]],
            ['Leave him for now', []]
          ]]
        ]
      }
    }
  };
})();
