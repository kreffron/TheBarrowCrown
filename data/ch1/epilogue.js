/* Chapter 1 — the closing cutscene. Runs after the shard decision and the night at the inn.
   1. A week later: Brackenford sees the party off at the mended south bridge. Who comes, and what
      they say, follows the choices made in the chapter.
   2. The same night, far south: Veyra and the Hooded Man at the Drowned Abbey. Their talk follows
      what became of Grukk, the shard and Maren's words to Veyra, and the second lamp goes out.
   3. End cards: End of Chapter One, the recap of choices, and what comes next.
   Flags: bridgeMended (the south bridge is fixed from here on), cs.farewell, cs.out2 (staging). */
(function () {
  const D = G.D, M = D.maps;

  M.v_abbey = {
    name: 'The Drowned Abbey', ground: 'stone', music: 'omen', bg: 'crypt', dark: 0.6, light: [7, 2],
    rows: [
      '################',
      '#~~+..I..I..+~~#',
      '#~~....l.....~~#',
      '#~~....v.....~~#',
      '#~~..........~~#',
      '#~~~........~~~#',
      '#~~~...c....~~~#',
      '#~~~~..m...~~~~#',
      '#~~~~......~~~~#',
      '################'
    ],
    things: {
      c: { type: 'mark' },
      l: { type: 'obj', gfx: 'shrine', gfxIf: ['cs.out2', 'lampDead'] },
      v: { type: 'npc', sprite: 'veyra', dir: 'up' },
      m: { type: 'npc', sprite: 'hand', dir: 'up' }
    }
  };

  D.scripts.epilogue = [
    ['cutscene', [
      ['fade', 'out', 600],
      ['card', '', 'A week later'],
      ['set', 'bridgeMended'], ['set', 'cs.farewell'],
      ['scene', 'brackenford', 't', 'up'], ['placep', 19, 25, 'up'], ['cam', 20, 26],
      ['note', 'The Highmoor carpenters set the last plank in the south bridge at dawn. Half of Brackenford turns out to see the four of you off.'],

      ['say', 'Halda', "The road to Saltmere is open. I would say come back soon, but every time you four come back, something is on fire."],
      ['if', 'haldaLetter', [['say', 'Halda', 'And if you find whoever signs with a pale hand, give them my regards. Preferably with the axe.']]],
      ['if', 'silver=1', [['say', 'Halda', 'Every piece of that grave silver is back in the ground where it belongs. Old Pell wept. Do not tell him I told you.']]],
      ['if', 'silver=2', [
        ['say', 'Halda', 'Odo is selling candlesticks that look very like the ones we buried. You would not know anything about that.'],
        ['say', 'Dask', 'Never seen a candlestick in my life.']
      ]],
      ['if', 'grukk=1', [['say', 'Halda', 'Hobb says a whole warren of goblins went over the north ridge, walking, not raiding. Your doing?'], ['say', 'Runa', 'Something like that.']]],
      ['if', 'grukk=2', [['say', 'Halda', 'Hobb saw goblins on the north ridge, every one of them clinking. I will not ask with what.']]],

      ['if', 'shardAt=1', [['say', 'Tobias', 'The shard sleeps under my lamp. I will sit up with it every night until you come back for it.']],
        [['say', 'Tobias', 'Keep that shard close, and never alone. If it ever starts to sound sensible, tell Maren at once.']]],
      ['if', 'ingridAlly', [['say', 'Ingrid', 'Mind the horseshoe. And the Vosks. Word is Brannoc went south too.']]],
      ['if', 'q.grave>=3', [['if', 'pellLie', [['say', 'Old Pell', 'I sat with Alder a while yesterday and told him how peaceful you found him. He always did like a good story.']],
        [['say', 'Old Pell', 'I sat with Alder a while yesterday. Told him about you. He would have liked you.']]]]],
      ['if', 'q.wood>=2', [
        ['say', 'Garrick', 'If you are ever back this way, there is a stool by our fire with your name on it. Well. Four stools.'],
        ['say', 'Wenna', 'He has built them already. It is all he has done all week.']
      ]],
      ['say', 'Tam', 'Are you going to fight a dragon? Fight a dragon!'],
      ['say', 'Dask', 'Only if it owes me money.'],

      ['turn', 'player', 'right'], ['turn', 't', 'left'], ['turn', 'v', 'left'], ['turn', 'y', 'right'],
      ['if', 'ledger', [['say', 'Dask', 'Orrin and Sons, Highmoor. I have a feeling the road to that crown runs straight past my creditors.']],
        [['say', 'Dask', 'Saltmere has a market. Markets have purses. I am only saying.']]],
      ['if', 'veyra=1', [['say', 'Maren', 'I asked her to come home. I meant it. I mean to find her before she puts out another lamp, and ask again.']],
        [['if', 'veyra=2', [['say', 'Maren', 'I told her there was no coming back. I hope I was wrong. I do not think I was.']],
          [['say', 'Maren', 'She wants an end to graves. So do I. We only disagree about the price.']]]]],
      ['if', 'verse1', [['say', 'Finch', 'Four lamps to bar the way, the fifth to hold the gate. Two lines of my grandmother\'s verse. Only a ballad\'s worth to go.']],
        [['say', 'Finch', 'Chapter one of the ballad, done. I have a rhyme for Gravepicker now. It is terrible.']]],
      ['turn', 'player', 'down'],
      ['say', 'Runa', 'South, then.'],
      ['move', 't', 'dd', 1], ['move', 'v', 'ldd', 1], ['move', 'y', 'rrdd', 1], ['walk', 'dd'], ['sync'],
      ['wait', 300], ['fade', 'out', 800],

      // The same night, at the Drowned Abbey
      ['scene', 'v_abbey', 'c', 'up', true], ['dark', 0.6, [7, 2]], ['set', 'cs.out2', 0],
      ['note', 'The same night. The Drowned Abbey, in the fens past Saltmere.'],
      ['move', 'm', 'uuu'],
      ['say', 'Hooded Man', "The Thane's shard?"],
      ['turn', 'v', 'down'],
      ['say', 'Veyra', 'Taken. A barbarian, a halfling, a singer, and my old teacher.'],
      ['if', 'grukk=3', [['say', 'Hooded Man', 'And the goblin?'], ['say', 'Veyra', 'Dead.'], ['say', 'Hooded Man', 'Economical.']],
        [['say', 'Veyra', 'Grukk has gone north with his people. Skrit is dead.'], ['say', 'Hooded Man', 'Skrit was a loan. Someone will repay it.']]],
      ['if', 'shardAt=2', [['say', 'Hooded Man', 'Then let them carry it. Shards want to be together. Sooner or later, they will bring it to us.']],
        [['say', 'Hooded Man', 'Under a lamp, with one old man to watch it. Brackenford will have visitors before the month is out.']]],
      ['if', 'veyra=1', [['say', 'Veyra', 'She asked me to come home.'], ['say', 'Hooded Man', 'And yet here you are.']],
        [['if', 'veyra=2', [['say', 'Veyra', 'She has made up her mind about me. It makes things simpler.'], ['say', 'Hooded Man', 'It usually does.']],
          [['say', 'Veyra', 'She asked what you promised me. I told her the truth. I am not sure she believed it.'], ['say', 'Hooded Man', 'Truth rarely convinces anyone, Sister. Results do.']]]]],
      ['turn', 'v', 'up'],
      ['say', 'Veyra', 'The tide is out. If I am going to do this, it is now.'],
      ['wait', 300], ['sfx', 'magic'], ['set', 'cs.out2'], ['dark', 0.94, [7, 4], 12], ['shake', 450],
      ['note', 'The second lamp goes dark. Under the black water of the nave, something turns over in its sleep.'],
      ['say', 'Hooded Man', '(Softly.) One shard lost. One lamp cold. The year is young.'],
      ['fade', 'out', 800],

      ['card', 'End of Chapter One', "The Thane's Barrow"],
      ['tableEnd', 1]                 // the DM's line, his notebook of what they chose, and next time (data/ch9_world/table_ends.js)
    ]],
    ['set', 'cs.farewell', 0],
    ['warp', 'brackenford', 'a', 'down'],
    ['note', 'That is the end of Chapter One. Explore as long as you like. When you are ready, cross the mended south bridge to begin Chapter Two.'],
    ['save']
  ];
})();
