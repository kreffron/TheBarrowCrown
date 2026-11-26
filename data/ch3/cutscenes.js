/* Chapter 3 — the opening (a dream of the Barrow King, the road north, Runa's story) and the close
   (Sigrid's reckoning, the night in the Longhall, and the Duke's invitation). Started from Saltmere's north
   road or Brackenford's south bridge once Chapter 2 is done. */
(function () {
  const D = G.D, M = D.maps;

  M.v_snowroad = {
    name: 'The North Road', ground: 'snow', ground2: 'drift', music: 'frost', bg: 'snow',
    rows: [
      '{{{{{{{{{{::{{{{{{{{{{',
      '{.........::,{,...,.{{',
      '{..,......::.,{{,....{',
      '{...,.....::.,,...,..{',
      '{,,{,.,.,.::,......,,{',
      '{,..{{....c:...,...,,{',
      '{...,.,..,::,,....,..{',
      '{....{..,,::...,..,..{',
      '{...{.,..,::.,..,....{',
      '{,........::..,.,.,..{',
      '{{{{{{{{{{::{{{{{{{{{{'
    ],
    things: { c: { type: 'mark', under: 'path' } }
  };
  M.v_dream = Object.assign({}, M.v_hollow, {
    name: 'A Dream',
    rows: ['##############', '#I...+&.+...I#', '#.....k......#', '#............#', '#I..........I#', '#.....v......#', '#............#', '#.....c......#', '##############'],
    things: Object.assign({}, M.v_hollow.things, { v: { type: 'npc', sprite: 'veyra', dir: 'up' } })
  });

  D.scripts.ch3road = [['if', 'chapter>=3', [['warp', 'karrow', 'n', 'up']], [['run', 'ch3start']]]];

  D.scripts.ch3start = [
    ['cutscene', [
      ['fade', 'out', 600],
      ['set', 'chapter', 3],
      ['scene', 'v_dream', 'c', 'up', true],
      ['note', 'Somewhere between sleeping and waking, Sister Veyra stands in a hall she has never seen, before a throne she knows too well.'],
      ['if', 'shardTraded', [['say', 'The Barrow King', 'Sister. You carry two of me now. I can feel you coming closer.']],
        [['say', 'The Barrow King', 'Sister. You carry one of me now. I can feel you coming closer.']]],
      ['if', 'veyraDoubt', [
        ['say', 'The Barrow King', 'You opened a sluice in the Abbey. Six fishermen. Do you think they will thank you, when they die anyway?'],
        ['say', 'Veyra', 'Some of them might.']
      ]],
      ['say', 'Veyra', 'You promised an end to graves.'],
      ['say', 'The Barrow King', 'I promised an end to dying. Graves are a different matter.'],
      ['say', 'The Barrow King', 'The third of me sleeps under a giant, in the north, behind a clan that keeps its oaths. Wake him. Bring me home.'],
      ['say', 'Veyra', 'And if I will not?'],
      ['say', 'The Barrow King', 'Then someone else will. There is always someone else, Sister. That is the one thing death has taught me.'],
      ['fade', 'out', 800],
      ['card', 'Chapter Three', 'The Oath of Stone']
    ]],
    ['quest', 'main3', 1],
    ['scene', 'v_snowroad', 'c', 'up'],
    ['note', 'The road north climbs into the hills. On the fourth day the snow starts, and does not stop.'],
    ['say', 'Runa', 'Karrow Hold is over the next ridge.'],
    ['say', 'Maren', 'Runa. Before we go in. Orrin said there is a price on your head there.'],
    ['say', 'Runa', 'At sixteen I swore the Oath of Stone. Seven winters keeping the watch on the Giant\'s Cairn.'],
    ['say', 'Runa', 'In my second winter an avalanche buried a hunting party in the pass. My cousin Bryn was in it. I left my post and dug.'],
    ['say', 'Runa', 'That night the Cairn lamp guttered and the dead came up. Old Hallvard held the door alone, and died holding it. I got Bryn out. Then I ran.'],
    ['say', 'Runa', 'The price is not gold. It is a summons. Come home and answer.'],
    ['choice', null, 'The others are quiet a moment. Then:', [
      ['Maren: "Then we stand with you."', [['say', 'Maren', 'Then you will not answer alone. We stand with you, whatever they ask.'], ['bond', 'maren', 1]]],
      ['Dask: "How much is the price, exactly?"', [['say', 'Dask', 'I only ask because I am the one who will end up paying it. Somehow it is always me.'], ['say', 'Runa', 'It is not gold, Dask.'], ['say', 'Dask', 'Everything is gold, eventually.'], ['bond', 'dask', 1]]],
      ['Finch: "Every ballad needs a homecoming."', [['say', 'Finch', 'Every ballad needs a homecoming, and most of the good ones need an apology. You are well placed for both.'], ['bond', 'finch', 1]]]
    ]],
    ['battle', 'roadwolves'],
    ['warp', 'karrow', 'n', 'up'],
    ['note', 'Karrow Hold. Stone houses under deep snow, a longhall with smoke coming out of every crack, and above it all, the dark shape of the Cairn.'],
    ['say', 'Clan Guard', 'Halt. ...Runa Stonehand. Oathbreaker. The Chief will want to see you. Straight to the Longhall.'],
    ['save']
  ];

  D.scripts.ch3end = [
    ['say', 'Sigrid', 'You came down. All of you. Kell?'],
    ['if', 'kellDead', [
      ['say', 'Maren', 'He held the Cairn to the end, Chief. He asked us to say it was kept.'],
      ['say', 'Sigrid', 'Then it was.']
    ]],
    ['if', 'giant=1', [['say', 'Sigrid', 'And the lamp is lit. I saw it from the gate, the first time this winter. The old one sleeps?'], ['say', 'Finch', 'Like a baby. A baby the size of a barn.']],
      [['say', 'Sigrid', 'The lamp is dark and the Cairn is empty. You did what you had to. The clan will remember it, one way or the other.']]],
    ['if', 'allyVeyra', [['say', 'Sigrid', 'Bryn says the grey Sister fought beside you.'], ['say', 'Maren', 'She did.'], ['say', 'Sigrid', 'Strange winter.']]],
    ['if', 'veyra3=3', [['say', 'Sigrid', 'Bryn says the grey Sister got away bleeding. She will be back. Her kind always come back.']]],
    ['if', 'prisoner=3', [['say', 'Sigrid', 'You let my prisoner walk, Warden. I hope your trust was worth more than he was.']]],
    ['if', 'prisoner=1', [['say', 'Sigrid', 'Your grey robe went south on a sledge. The snow let him live. Lucky him.']]],
    ['if', 'tunnelOpen&!grukk3=3', [['say', 'Sigrid', 'And there are goblins in my pass telling everyone you are their friends. I do not know what to do with that.']]],
    ['if', 'runaOath=4', [['say', 'Sigrid', 'Five winters, Runa. I will hold you to them. Come home when the crown is broken.']]],
    ['if', 'runaOath=2', [['say', 'Sigrid', 'The clan took your silver. Some of them will want more than silver, one day.']]],
    ['if', 'runaOath=1', [['say', 'Sigrid', 'Hallvard would have been proud of you. So would your mother.']]],
    ['if', 'runaOath=3', [['say', 'Sigrid', 'The singer was right, niece. You kept it. You only kept it in the wrong place.']]],
    ['say', 'Sigrid', 'The Hold pays its debts. Take this.'],
    ['gold', 300], ['xp', 450], ['quest', 'main3', 7],
    ['if', 'knowsCourt', [['say', 'Dask', 'A man at the Duke\'s court, paying Orrin, paying the Pale Hand. Highmoor. It is always Highmoor.']],
      [['say', 'Dask', 'Orrin and Sons keeps the Pale Hand\'s books. Highmoor next. It is always Highmoor.']]],
    ['note', 'That night Karrow Hold feasts the four of you, and the skalds sing until the fire is ash.'],
    ['run', 'camp3'],
    ['run', 'ch3stinger']
  ];

  D.scripts.ch3stinger = [
    ['cutscene', [
      ['fade', 'out', 600],
      ['set', 'cs.veyraNorth', 0],
      ['scene', 'v_highmoor', 'c', 'up', true],
      ['note', 'Highmoor. The counting-house of Orrin and Sons.'],
      ['say', 'Orrin', 'The Cairn shard is lost, my lord. The Wardens\' pets have it.'],
      ['if', 'allyVeyra', [
        ['say', 'Orrin', 'And the Sister fought beside them. Our Reavers saw it with their own eyes.'],
        ['say', 'Hooded Man', 'Then the Sister has made her choice. We will make ours.']
      ], [
        ['say', 'Orrin', 'The Sister is wounded. She has gone to ground somewhere in the hills.'],
        ['say', 'Hooded Man', 'Let her bleed. She will come back. They always come back to the light, and I am the one holding it.']
      ]],
      ['say', 'Hooded Man', 'So the Wardens\' pets carry the shards for us, through the snow, at their own expense. How thoughtful.'],
      ['say', 'Hooded Man', 'The Duke will give a feast for the heroes of Saltmere and Karrow Hold. Send them an invitation. On good paper.'],
      ['say', 'Orrin', 'And the halfling\'s debt, my lord?'],
      ['say', 'Hooded Man', 'Forgive it. Publicly. Gratitude is a leash, Master Orrin, and it costs nothing to hold.'],
      ['fade', 'out', 800],
      ['card', 'End of Chapter Three', 'The Oath of Stone'],
      ['tableEnd', 3]                 // the DM's line, his notebook of what they chose, and next time (data/ch9_world/table_ends.js)
    ]],
    ['set', 'ch3done'],
    ['warp', 'karrow', 'a', 'down'],
    ['note', 'That is the end of Chapter Three. Explore as long as you like. When you are ready, take the south road out of Karrow Hold to Highmoor to begin Chapter Four.'],
    ['save']
  ];
})();
