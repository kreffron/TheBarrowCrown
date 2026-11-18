/* Chapter 2 — Mirefen. Boardwalks are safe; the marsh is not. */
(function () {
  const M = G.D.maps;

  M.mirefen = {
    name: 'Mirefen', ground: 'mud', ground2: 'marsh', music: 'fen', bg: 'fen',
    encounters: { rate: 0.13, min: 6, groups: [['fen_drowned', 3], ['fen_lights', 2], ['fen_eels', 2], ['fen_bog', 1], ['fen_cult', 2]] },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T"""""";"""",";"""""""""";""~~~~~~~~~~"""""",T',
      'T"W*W.,.*WW""""""""","""""";~~~~~~~~~~~~~~~~~T',
      'T""""""""""""""""""";""","",~~~""""~~~~~~~~~~T',
      'T"*...k.,.*,"""h""";""""""""~~~"z""~~~~~~~~~~T',
      'T"""""""O""""""";"""""""""""~~~""""~~~~~~~~~~T',
      'T,WW.*..W.W";"";,""""","""""~~~""""~~~~~~~~~~T',
      'T"""""""""""""";",""""""""""~~~~o~~~~~~~~~~~~T',
      'T""""""""""",";,;"";,,"""","~~~~=~~~~~~~~~~~~T',
      'T,"""",""""------p-------,"","""-""""""""""""T',
      'T",""""""""-","""""g""""-""";""";""";""""""";T',
      'T""""""";";-"""""";"",""-""";""""""""""""""""T',
      'T",""""""""-""~~~~~~~";"-";""""""""""";;;;;;;T',
      'T""""""""""-""~~~~~~~"""-"""";"""""""----q---a',
      'T""""""""""-,"~~~~~~~;""-""""""""""""-;;;;;;;T',
      's-----------",~~~~~~~"""-,"""""""""""-"""""""T',
      'T""""""",""","~~~~~~~"""-"""""";","""-"""""""T',
      'T",",""""","""""";"";d,"-",";,"""",""-","""""T',
      'T,,""""";"","""";"""""""-""",""""""""-"""""""T',
      'T""""","""""""""",""""""--------------"""""""T',
      'T""";""";"";""",,"""~~~~~~~~","",,""""","";""T',
      'T"""""""",""""",""~~~~~~~~~~~~";";";","",""""T',
      'T~,"""""""";","~~~~~;""";"""~~~~~~"""""""",""T',
      'T~~~"";,"""""~~~~~"",,""""""""~~~~~~""""""""~T',
      'T""""""""~~~~~~""","""""",""";"",,~~~~~~~"~~~T',
      'T""^^^^^""~~~""""""""""""""""","""""~~~""""""T',
      'T""^^^^^"""""""""""";"""""";;;"""",""""""c"""T',
      'T""WNWNW"""""""";,"",""";""e;""""""""""""""""T',
      'T""""b"""""""""""""""""";"","""""""",,"""""""T',
      'T""""""Y""""""""""""""""""";"""""";""""""""""T',
      'T""""""""""""""""";;";;""""",,"""";",""""",""T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    things: {
      s: { type: 'warp', to: 'saltmere', at: 'e', under: 'boardwalk', out: 'right' },
      a: { type: 'warp', to: 'abbey1', at: 'x', under: 'boardwalk', out: 'left' },
      p: {
        type: 'foe', sprite: 'acolyte', dir: 'left', under: 'boardwalk', script: [
          ['say', 'Acolyte', 'Halt. The boardwalk is closed by order of the Abbey. Turn back.'],
          ['choice', null, 'Three grey-robed acolytes block the boardwalk.', [
            ['Fight', [['battle', 'patrol'], ['remove']]],
            ['Finch: bluff past them', [['check', 'finch', [14, ['knowsRitual', -2]], [
              ['say', 'Finch', 'Closed? Brother, we are the relief. The Sister wants six more for the tide, and we were told to bring them. Unless you would rather explain to her why we are late?'],
              ['say', 'Acolyte', '...Six more? Lamplighter. Go on, then.'],
              ['bond', 'finch', 1], ['xp', 190], ['remove']
            ], [
              ['say', 'Finch', 'Brother! We are the relief, sent by...'],
              ['say', 'Acolyte', 'The Sister sends nobody. Take them.'],
              ['battle', 'patrol'], ['remove']
            ]]]],
            ['Dask: pay the toll (40 gold)', [
              ['gold', -40],
              ['say', 'Dask', 'Forty for the toll. Plus a little extra for your sore feet. Nobody needs to know we walked past.'],
              ['say', 'Acolyte', 'Nobody needs to know anything.'],
              ['bond', 'dask', 1], ['xp', 190], ['remove']
            ], 'gold>=40']
          ]]
        ]
      },
      q: {
        type: 'foe', sprite: 'zealot', dir: 'left', under: 'boardwalk', script: [
          ['note', 'Where the boardwalk meets the Abbey causeway, grey-robed zealots wait with drawn knives.'],
          ['if', 'coll=2', [['battle', 'causeway_big']], [['battle', 'causeway']]],
          ['remove'], ['quest', 'main2', 4],
          ['say', 'Maren', 'The Abbey. Lamplighter, look at it. The sea has had it a hundred years.']
        ]
      },
      k: {
        type: 'foe', sprite: 'bogling', dir: 'down', script: [
          ['note', 'The drowned village. In the old well-yard, a heap of stolen pots and pans, and on top of it, something that is mostly mud and teeth.'],
          ['battle', 'nest2'], ['remove'],
          ['note', 'In the middle of the hoard: a dented copper kettle, still warm somehow.'],
          ['give', 'kettle'], ['if', 'q.kettle=1', [['quest', 'kettle', 2]]]
        ]
      },
      b: {
        type: 'npc', sprite: 'brine', dir: 'down', script: [['if', 'q.kettle>=3', [['say', 'Mother Brine', 'Tea is on, dearies. Mind the frogs.']], [
          ['if', 'item.kettle', [
            ['say', 'Mother Brine', 'My kettle! Oh, you lovely great louts. Come here.'],
            ['take', 'kettle'], ['give', 'brineward'], ['xp', 140], ['quest', 'kettle', 3], ['set', 'bellHint'],
            ['say', 'Mother Brine', 'Now listen, since you are the kind who goes looking. North-east, on the island, the old bell tower still stands. The monks rang it for their dead.'],
            ['say', 'Mother Brine', 'Ring the bells in the right order and the tower opens. Deep first, then the sea, then the small one, then the cracked one. My mam taught me that, and hers taught her.'],
            ['say', 'Finch', 'An old order of bells. Is there a verse with it, by any chance?'],
            ['say', 'Mother Brine', 'There is always a verse, singer. Nobody remembers it.']
          ], [['if', 'q.kettle=1', [['say', 'Mother Brine', 'North-west, dearies, in the drowned village. Big muddy thing. Can\'t miss it. It will not miss you.']], [
            ['say', 'Mother Brine', 'Visitors! Proper ones, with boots. You will forgive me if I do not offer tea. I have no kettle.'],
            ['say', 'Mother Brine', 'Bog lurkers took it. They take anything shiny back to the drowned village up north-west. Bring it back and I will make it worth your while.'],
            ['say', 'Mother Brine', 'And keep to the boardwalks when you can. The marsh is full of the restless tonight.'],
            ['quest', 'kettle', 1]
          ]]]]
        ]]]
      },
      h: { type: 'obj', gfx: 'shrine', under: 'marsh', script: [['note', 'A wayshrine on a hummock, its little flame burning green in the marsh-air.'], ['run', 'campsite']] },
      g: {
        type: 'obj', gfx: 'grave', script: [['if', 'oldGrave', [['note', '"ODRIC, FISHER, OF SALTMERE. HIS SISTER SAID THE WORDS."']], [
          ['note', 'A grave marker, half-sunk in the marsh. Someone has scraped the moss off it recently.'],
          ['check', 'maren', 12, [
            ['say', 'Maren', '"Odric, fisher, of Saltmere. The fen kept him nine days. His sister said the words."'],
            ['say', 'Maren', 'Nine days. She told me she had a brother. She never told me where.'],
            ['say', 'Dask', 'Veyra?'],
            ['say', 'Maren', 'Fresh flowers on a grave nobody has visited in years. Yes. Veyra.'],
            ['set', 'knowsBrother'], ['bond', 'maren', 1], ['xp', 60]
          ], [['note', 'The letters are too worn to read in this light.']]],
          ['set', 'oldGrave']
        ]]]
      },
      o: {
        type: 'obj', gfx: 'stump', under: 'bridge', script: [
          ['note', 'A drowned log lies across the old footbridge to the island. Beyond it, a bell tower leans over the water.'],
          ['check', 'runa', 13, [['sfx', 'lever'], ['shake', 300], ['note', 'Runa rolls the log into the water. It goes in with a sound like a sigh.'], ['remove']],
            [['hurt', 'runa', '1d4'], ['say', 'Runa', 'Waterlogged. Heavier than it looks. Again.']]]
        ]
      },
      z: { type: 'warp', to: 'belltower', at: 'u', gfx: 'doorStone', under: 'marsh', out: 'down', script: [['if', '!bellHint', [['note', 'The door of the bell tower stands open. Water laps over the threshold.']]]] },
      d: { type: 'chest', lock: 14, gold: 50, items: { greater: 2 }, script: [['say', 'Dask', 'Smugglers\' cache. Someone weighted it down in the reeds and forgot about it. Or died.']] },
      c: { type: 'chest', lock: 15, gold: 60, items: { pearl: 1 } },
      e: {
        type: 'foe', sprite: 'drownedman', dir: 'up', script: [
          ['note', 'A drowned fisherman stands in the reeds, swaying. A tin tag still hangs at its throat.'],
          ['battle', 'fen_drowned'], ['remove'], ['give', 'tag'],
          ['say', 'Maren', 'Rest now. Someone will say your name.']
        ]
      }
    }
  };
})();
