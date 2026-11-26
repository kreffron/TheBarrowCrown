/* Chapter 4 — the opening (the fourth lamp goes out; Orrin's collectors on the road), High Warden Oriel,
   and the close (the city wakes to Corr's betrayal, the night at the Silver Lantern, the Hollow Barrow).
   Started from any road out of Karrow Hold, Saltmere or Brackenford once Chapter 3 is done. */
(function () {
  const D = G.D, M = D.maps;

  M.v_hollow2 = Object.assign({}, M.v_hollow, {
    name: 'The Hollow Barrow',
    rows: ['##############', '#I...+&.+...I#', '#.....k......#', '#............#', '#I..........I#', '#.....r......#', '#............#', '#.....c......#', '##############'],
    things: Object.assign({}, M.v_hollow.things, { r: { type: 'npc', sprite: 'corr', dir: 'up' } })
  });

  D.scripts.ch4road = [['if', 'chapter>=4', [['warp', 'highmoor', 'n', 'up']], [['run', 'ch4start']]]];

  D.scripts.ch4start = [
    ['cutscene', [
      ['fade', 'out', 600],
      ['set', 'chapter', 4], ['set', 'cs.c4open'], ['set', 'cs.c4lit'],
      ['scene', 'catacombs2', 'e', 'up', true], ['cam', 13, 11],
      ['note', 'Under the city of Highmoor. The fourth tomb.'],
      ['say', 'Orrin', 'The Wardens\' pets are coming, my lord. The invitations went out on the best paper.'],
      ['say', 'Hooded Man', 'Good. Three shards in their packs, and the fourth under my feet. They will carry the others right to it.'],
      ['say', 'Orrin', 'And the lamp?'],
      ['say', 'Hooded Man', 'Three hundred years my office has trimmed this lamp. It seems a shame. Still.'],
      ['wait', 300], ['sfx', 'magic'], ['set', 'cs.c4lit', 0], ['dark', 0.94, [13, 11], 12], ['shake', 450],
      ['note', 'The fourth lamp goes out. All through the Catacombs, something dry and patient begins to stir.'],
      ['say', 'Hooded Man', 'There. Let the city\'s dead stretch a little. It will make the heroes feel useful.'],
      ['fade', 'out', 800],
      ['set', 'cs.c4open', 0],
      ['card', 'Chapter Four', 'The Pale Hand']
    ]],
    ['quest', 'main4', 1],
    ['scene', 'v_road', 'c', 'down'],
    ['note', 'The Duke\'s invitation came by rider, on paper so thick it could stop an arrow. The road to Highmoor is good, and lined with lamps.'],
    ['say', 'Finch', '"To the heroes of Saltmere and Karrow Hold, a feast in their honour." Heroes! I have been waiting my whole life to be invited somewhere on purpose.'],
    ['say', 'Dask', 'Orrin and Sons is in Highmoor. Everything I owe is in Highmoor.'],
    ['say', 'Runa', 'Then we walk in together.'],
    ['note', 'Half a day out, three men in good coats step into the road.'],
    ['say', 'Collector', 'Dask Underbough? Orrin and Sons sends its regards. We were told to collect before the master changes his mind.'],
    ['say', 'Dask', 'Changes his mind about what?'],
    ['say', 'Collector', 'Nobody tells us anything. That is why we hit people.'],
    ['battle', 'collectors'],
    ['warp', 'highmoor', 'n', 'up'],
    ['note', 'Highmoor. Stone walls, lamps on every corner, and the Duke\'s palace at the top of the avenue like a wedding cake.'],
    ['say', 'Herald', "The heroes of Saltmere and Karrow Hold! Welcome! Rooms at the Silver Lantern are paid for, and the Duke's feast is tonight, at the palace."],
    ['save']
  ];

  D.scripts.oriel = [
    ['say', 'High Warden Oriel', 'Maren. Sit. We have known each other twenty years, so I will not waste your time.'],
    ['say', 'High Warden Oriel', 'Every ward-lamp in the valley is failing. Ours too. And three nights ago the Catacomb lamp under this city went dark. The dead are stirring in the Undercroft.'],
    ['if', 'item.letter3', [
      ['say', 'Maren', 'Warden Kell\'s last report, from the Giant\'s Cairn. "The lamp is failing from inside. Someone has fed it grey oil for a year."'],
      ['say', 'High Warden Oriel', '...Grey oil. Maren. The Chancellery has supplied the oil for every ward-lamp in the valley for twenty years. It was the Duke\'s gift to the Wardens.'],
      ['say', 'Dask', 'And who runs the Chancellery?'],
      ['say', 'High Warden Oriel', 'Ilvane Corr.'],
      ['take', 'letter3'], ['set', 'knowsGreyOil'], ['xp', 200]
    ], [
      ['say', 'High Warden Oriel', 'They are failing from inside, as if the oil itself were bad. I do not know how. I mean to find out.'],
      ['xp', 200]
    ]],
    ['if', 'veyraTurning', [
      ['say', 'High Warden Oriel', 'One more thing. The Wardens hold a warrant for Sister Veyra. If you know where she is, Maren, you are bound by your vows to tell me.'],
      ['choice', 'Maren', '(Maren knows Veyra is following the shards.)', [
        ['Maren: tell her', [
          ['say', 'Maren', 'She is following the shards. Wherever they go, she will be close. She fought beside us at the Cairn.'],
          ['say', 'High Warden Oriel', 'Then the Wardens will be close too. Thank you, Maren. I know what that cost.'],
          ['set', 'maren4', 1]
        ]],
        ['Maren: say nothing', [
          ['say', 'Maren', 'I do not know where she is, High Warden.'],
          ['note', 'It is the first lie Maren has told a High Warden in twenty years. Oriel looks at her a long moment, and lets it pass.'],
          ['set', 'maren4', 2], ['bond', 'maren', -1]
        ]],
        ['Maren: tell the truth, and ask for mercy', [
          ['say', 'Maren', 'She is turning, Oriel. She fought a giant beside us and gave us the shard. Let me bring her in myself, when this is done.'],
          ['say', 'High Warden Oriel', 'If she comes in by your hand, she will be judged by mine. And I am not a hard judge. Bring her home.'],
          ['set', 'maren4', 3], ['bond', 'maren', 1]
        ]]
      ]]
    ]],
    ['say', 'High Warden Oriel', 'The Catacomb lamp. The old way down is through the Undercroft, by the grate in the south-west alley. I will send word to the watch.'],
    ['quest', 'main4', 3]
  ];

  D.scripts.ch4end = [
    ['say', 'High Warden Oriel', 'Corr. The Chancellor himself. Twenty years at the Duke\'s right hand, poisoning our lamps one wick at a time.'],
    ['if', 'dukeCured', [
      ['say', 'High Warden Oriel', 'Duke Aldric rose from his bed this morning for the first time in a year, and he is very, very angry. Corr is named traitor. The Duke\'s guard will ride with you to the Hollow Barrow.']
    ], [
      ['say', 'High Warden Oriel', 'Duke Aldric died in the night. Corr\'s seal is already on the regency papers. Half the city guard still takes his orders.'],
      ['set', 'dukeDead']
    ]],
    ['if', 'orrinExposed', [['say', 'High Warden Oriel', 'Orrin talked, in the cells. Corr\'s agents, his accounts, his safehouses. Most of the Pale Hand in Highmoor was in irons by dawn.']]],
    ['if', 'heist=1', [['say', 'High Warden Oriel', 'And somebody burned every debt-paper under Orrin and Sons. Half of Highmoor is drunk with relief. I have decided not to ask who.']]],
    ['if', 'heist=2', [['say', 'High Warden Oriel', 'And every debt-paper in Highmoor has vanished. Whoever holds them now holds the city by the throat. I hope they are better than Orrin.']]],
    ['if', 'maren4=1', [['say', 'High Warden Oriel', 'The Wardens took Sister Veyra at the city gate this morning. She did not fight. She asked for you, Maren.']]],
    ['if', 'shard1Stolen', [['say', 'Maren', 'The Thane\'s shard from Brackenford, the Abbey shard from Veyra, the Cairn shard, and the fourth. He has four.']],
      [['say', 'Maren', 'He has four shards now. The fifth is on the King\'s brow.']]],
    ['if', 'verse4', [['say', 'Finch', 'And the Fifth Lamp is in there with him. She has been holding the door for three hundred years.']]],
    ['say', 'High Warden Oriel', 'Rest tonight. Tomorrow, the Ashen Road. The Wardens will give you everything we have.'],
    ['gold', 500], ['xp', 600], ['quest', 'main4', 7],
    ['run', 'camp4'],
    ['run', 'ch4stinger']
  ];

  D.scripts.ch4stinger = [
    ['cutscene', [
      ['fade', 'out', 600],
      ['scene', 'v_hollow2', 'c', 'up', true],
      ['note', 'The Hollow Barrow, at the end of the Ashen Road.'],
      ['say', 'The Barrow King', 'Four of me. You took your time, Chancellor.'],
      ['say', 'Ilvane Corr', 'Three hundred years you have waited. You can wait a little longer, while I decide what to do with them.'],
      ['say', 'The Barrow King', 'You mean to wear my crown.'],
      ['say', 'Ilvane Corr', 'I mean to wear a crown. Yours happens to be the one that never dies.'],
      ['say', 'The Barrow King', 'Then come and take the last of it from my brow. If the door lets you.'],
      ['wait', 400],
      ['note', 'Somewhere deeper in the barrow, behind a door no one has opened in three hundred years, a woman\'s voice. Very tired, and very steady.'],
      ['say', '???', 'Not while I keep it.'],
      ['fade', 'out', 900],
      ['card', 'End of Chapter Four', 'The Pale Hand'],
      ['tableEnd', 4]                 // the DM's line, his notebook of what they chose, and next time (data/ch9_world/table_ends.js)
    ]],
    ['set', 'ch4done'],
    ['warp', 'highmoor', 'c', 'down'],
    ['note', 'That is the end of Chapter Four. Explore as long as you like. When you are ready, take the south gate of Highmoor east to Ashfall to begin Chapter Five.'],
    ['save']
  ];
})();
