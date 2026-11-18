/* Chapter 2 — the opening (the Highmoor counting-house, the south road) and the close
   (Quill's reckoning, the night at the Gull and Lantern, and Veyra's return to Highmoor).
   Started from the mended south bridge in Brackenford once Chapter 1 is done. */
(function () {
  const D = G.D, M = D.maps;

  M.v_highmoor = {
    name: 'Highmoor', ground: 'wood', music: 'omen', bg: 'town', dark: 0.45, light: [6, 4],
    rows: [
      '##############',
      '#KK..KK..KK.Y#',
      '#............#',
      '#......o.....#',
      '#.....AA.....#',
      '#.....m......#',
      '#...VVVVVV...#',
      '#.....c..v...#',
      '##############'
    ],
    things: {
      c: { type: 'mark' },
      m: { type: 'npc', sprite: 'hand', dir: 'up' },
      o: { type: 'npc', sprite: 'orrin', dir: 'down' },
      v: { type: 'npc', sprite: 'veyra', if: 'cs.veyraNorth', dir: 'up' }
    }
  };

  // the south road, two days out of Brackenford: only ever seen through ['scene', ...], never saved on
  M.v_road = {
    name: 'The South Road', ground: 'grass', ground2: 'flowers', music: 'field', bg: 'forest',
    rows: [
      'TTTTTTTTTT::TTTTTTTTTT',
      'TTTB..,...::.....BTTTT',
      'TT....R...::...,....TT',
      'TT.B......::.....R..TT',
      'T.....,...::..B......T',
      'T..R......c:.........T',
      'T.........::...,..B..T',
      'TT..B.....::.........T',
      'TT....,...::..R.....TT',
      'TTTT......::.....BTTTT',
      'TTTTTTTTTT::TTTTTTTTTT'
    ],
    things: { c: { type: 'mark', under: 'path' } }
  };

  Object.assign(D.groups, {
    roadscouts: { enemies: ['acolyte', 'zealot', 'acolyte'], bg: 'forest', intro: 'Grey robes on the road north, and they know your faces.' }
  });

  D.scripts.ch2road = [['choice', null, 'The mended bridge. The south road runs on to Saltmere and the fens.', [
    ['Take the road south', [['if', 'chapter>=2', [['warp', 'saltmere', 'n', 'down']], [['run', 'ch2start']]]]],
    ['North into the hills, to Karrow Hold', [['run', 'ch3road']], 'ch2done'],
    ['The road to Highmoor', [['run', 'ch4road']], 'ch3done'],
    ['East, to Ashfall and the Ashen Road', [['run', 'ch5road']], 'ch4done'],
    ['Not yet', []]
  ]]];

  D.scripts.ch2start = [
    ['cutscene', [
      ['fade', 'out', 600],
      ['set', 'chapter', 2],
      ['scene', 'v_highmoor', 'c', 'up', true],
      ['note', 'Highmoor. The counting-house of Orrin and Sons, long after the clerks have gone home.'],
      ['say', 'Orrin', 'The Thornwood account, my lord. Closed, at a loss.'],
      ['say', 'Hooded Man', 'Losses are a cost of doing business, Master Orrin. You taught me that.'],
      ['if', 'shardAt=2', [
        ['say', 'Orrin', "They carry the Thane's shard with them, south, toward Saltmere."],
        ['say', 'Hooded Man', 'Then the road will collect it for us. Send the grey ones to meet them.']
      ], [
        ['say', 'Orrin', "The Thane's shard stays in Brackenford, under the old priest's lamp."],
        ['say', 'Hooded Man', 'Then the Vosks will fetch it. Old men sleep eventually.']
      ]],
      ['if', 'ledger', [
        ['say', 'Orrin', 'There is a further matter. They have one of my ledgers. And one of them owes this house a great deal of money. A halfling, Dask.'],
        ['say', 'Hooded Man', 'Then he is ours already, in a small way. Keep his paper close.']
      ]],
      ['say', 'Orrin', 'The Saltmere tide tables, as the Sister asked. Low water falls in four days.'],
      ['say', 'Hooded Man', 'Then in four days the Prior walks, and the second shard comes home to us. Veyra will see to it.'],
      ['say', 'Orrin', "And the Wardens' pets?"],
      ['say', 'Hooded Man', 'Let them come. The fen is very large, and very hungry.'],
      ['fade', 'out', 800],
      ['card', 'Chapter Two', 'The Drowned Abbey']
    ]],
    ['quest', 'main2', 1],
    ['scene', 'v_road', 'c', 'down'],
    ['if', 'shardAt=2', [
      ['note', 'Two days down the south road, in the hills above the fens, the ditch stands up.'],
      ['battle', 'roadambush'],
      ['say', 'Dask', 'They knew exactly what we were carrying. Somebody is keeping very good books on us.'],
      ['say', 'Maren', "Keep the shard close. Closer than that."]
    ], [
      ['note', 'Two days down the south road, you meet Hobb the carter heading north.'],
      ['say', 'Hobb', 'You heard? The Vosks came back for the old priest\'s shard. Tobias met them on the temple steps with his lamp held up, and they ran off with their beards smoking.'],
      ['say', 'Hobb', 'And there are grey robes on this road, heading north. Mind yourselves.'],
      ['note', 'That afternoon, you meet them.'],
      ['battle', 'roadscouts'],
      ['say', 'Runa', 'Heading for Brackenford. For the shard.'],
      ['say', 'Maren', 'Tobias held off the Vosks. He will not hold off the Hand forever. We finish this quickly.']
    ]],
    ['warp', 'saltmere', 'n', 'down'],
    ['note', 'Saltmere. Salt on the wind, nets drying on the sand, and on the point, a lighthouse with no light in it.'],
    ['save']
  ];

  D.scripts.ch2end = [
    ['say', 'Harbourmaster Quill', 'You are back. And the Abbey bell has stopped. Tell me.'],
    ['if', 'hostagesSaved', [
      ['say', 'Harbourmaster Quill', "Jory Fenn walked into his mother's kitchen an hour ago, wet to the neck and asking for soup. Six men home. Six."]
    ], [
      ['say', 'Harbourmaster Quill', '...All six. I see.'],
      ['note', 'Quill takes off his hat and holds it a while.'],
      ['say', 'Harbourmaster Quill', 'You stopped it, though. No more will go. It will have to be enough.']
    ]],
    ['if', 'ab.choice=3', [['say', 'Harbourmaster Quill', 'Whatever you paid for them, I will not ask. I can see on your faces it was dear.']]],
    ['if', 'lampLit2', [['say', 'Harbourmaster Quill', 'And the Abbey lamp is burning. I saw it from the harbour wall. First time in my life.']]],
    ['if', 'lightLit', [['say', 'Harbourmaster Quill', 'Two lights on the water now. The boats go out at dawn.']]],
    ['if', 'coll=1', [['say', 'Harbourmaster Quill', 'Brother Coll is in my cells, by the by. The widows put him there. I only turned the key.']]],
    ['if', 'coll=2', [['say', 'Harbourmaster Quill', 'No sign of that Brother Coll. Gone to the Abbey and not come back. Good riddance.']]],
    ['if', 'coll=3', [['say', 'Harbourmaster Quill', 'Brother Coll came to the chapel this morning, white as a sheet, and confessed the lot to Sister Ysolde. She is keeping him busy.']]],
    ['say', 'Harbourmaster Quill', 'Two hundred, as promised. Saltmere pays its debts.'],
    ['gold', 200], ['xp', 200], ['quest', 'main2', 7],
    ['if', 'knowsCairn', [['say', 'Maren', "Veyra said she was going north, to the Giant's Cairn. The third lamp."]],
      [['say', 'Maren', 'Veyra has two lamps out and the shards to show for it. She will go for the third next. Wherever it is.']]],
    ['run', 'camp2'],
    ['run', 'ch2stinger']
  ];

  D.scripts.ch2stinger = [
    ['cutscene', [
      ['fade', 'out', 600],
      ['set', 'cs.veyraNorth'],
      ['scene', 'v_highmoor', 'c', 'up', true],
      ['note', 'Highmoor. The counting-house of Orrin and Sons.'],
      ['move', 'v', 'uu'], ['turn', 'v', 'left'], ['turn', 'm', 'right'],
      ['say', 'Hooded Man', 'Sister.'],
      ['if', 'ab.choice=3', [
        ['say', 'Veyra', "Two shards. The Abbey's, and the Thane's. They paid for six fishermen with it."],
        ['say', 'Hooded Man', 'Sentiment. The most reliable currency there is.']
      ], [
        ['say', 'Veyra', "The Abbey shard."],
        ['say', 'Hooded Man', "And the Wardens' pets?"],
        ['say', 'Veyra', 'Alive. They put the Prior back to sleep and lit the lamp again.']
      ]],
      ['if', 'veyraDoubt', [
        ['say', 'Veyra', 'I opened the sluice. Six men lived who were meant to drown. I wanted you to hear it from me.'],
        ['say', 'Hooded Man', 'You are tired, Sister. Tired people are kind. It passes.'],
        ['say', 'Veyra', 'Does it.']
      ]],
      ['if', 'veyra2=3', [
        ['say', 'Hooded Man', 'You are hurt.'],
        ['say', 'Veyra', 'Maren struck me. I did not think she had it in her.']
      ]],
      ['say', 'Hooded Man', "The third lamp burns in the Giant's Cairn, under the mountains past Karrow Hold."],
      ['say', 'Orrin', 'Karrow Hold, my lord. The barbarian woman is from Karrow Hold. They still have a price on her head there.'],
      ['say', 'Hooded Man', 'Then the road north will be crowded. Good. I am tired of waiting.'],
      ['fade', 'out', 800],
      ['card', 'End of Chapter Two', 'The Drowned Abbey'],
      ['recap', 'What you chose', 2],
      ['card', 'Coming next', 'Chapter Three: The Oath of Stone']
    ]],
    ['set', 'cs.veyraNorth', 0], ['set', 'ch2done'],
    ['warp', 'saltmere', 'u', 'up'],
    ['note', 'That is the end of Chapter Two. Explore as long as you like. When you are ready, take the north road out of Saltmere to begin Chapter Three.'],
    ['save']
  ];
})();
