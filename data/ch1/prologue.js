/* Chapter 1 — the prologue (villains), the tavern, the exploration tutorial,
   the guided brawl, and the closing scene that hands over to the game proper.

   Flags: tut (tutorial running), cs.* (cutscene staging), tut.dask/maren/finch/talked/cask/letter,
          ingridAlly (Ingrid fought in the brawl), haldaLetter (Halda read the Vosks' orders),
          vosksGone, ingridGift. */
(function () {
  const D = G.D, M = D.maps;

  Object.assign(D.speakers, {
    'The Barrow King': '#c890f0', 'Hooded Man': '#b8b0d0', Brannoc: '#f0906a', 'Vosk Bruiser': '#d8a080', Ingrid: '#c8c8d4', Bram: '#e8d0a0'
  });
  Object.assign(D.sprites, {
    king: { skel: 1, helm: '#e8c14a' },
    hand: { skin: '#d8ccbc', hair: '#2a2a30', top: '#3a3848', robe: 1, hood: '#26242f', trim: '#d8d4e8' },
    vosk: { skin: '#e0a080', bald: 1, beard: 1, hair: '#5a3a22', top: '#8a2f2f', legs: '#3a3028' },
    bruiser: { skin: '#d89a70', hair: '#3a2a1e', top: '#6a4a2a', legs: '#3a3a44', hat: '#5a4030' }
  });

  /* ---------- prologue maps (cutscene only) ---------- */
  M.v_hollow = {
    name: 'The Hollow Barrow', ground: 'stone', music: 'omen', bg: 'crypt', dark: 0.72, light: [6, 2],
    legend: { '&': 'throneBack' },
    rows: [
      '##############',
      '#I...+&.+...I#',
      '#.....k......#',
      '#............#',
      '#I..........I#',
      '#............#',
      '#............#',
      '#.....c......#',
      '##############'
    ],
    things: {
      c: { type: 'mark' },
      k: { type: 'npc', sprite: 'king', under: 'throne', dir: 'down' }
    }
  };
  M.v_thane = {
    name: "The Thane's Barrow", ground: 'stone', music: 'omen', bg: 'crypt', dark: 0.5, light: [7, 2],
    rows: [
      '################',
      '#+....I..I....+#',
      '#......l.......#',
      '#......v.......#',
      '#..............#',
      '#..............#',
      '#.g..........s.#',
      '#b.....c.......#',
      '#..............#',
      '#######m########'
    ],
    things: {
      c: { type: 'mark' },
      l: { type: 'obj', gfx: 'shrine', gfxIf: ['cs.out', 'lampDead'] },
      v: { type: 'npc', sprite: 'veyra', dir: 'up', unless: 'cs.vgone' },
      m: { type: 'npc', sprite: 'hand', dir: 'up' },
      g: { type: 'npc', sprite: 'grukk', dir: 'right' },
      s: { type: 'npc', sprite: 'hexer', dir: 'left' },
      b: { type: 'obj', gfx: 'sack' }
    }
  };

  const HINT1 = 'Look around before the brawl. Talk to Dask, Maren and Finch.\nMove: arrows or WASD.  Talk / search: face it, press {a}.  Menu: {b}.';
  const HINT2 = "Ready? Talk to Brannoc at the bar to start the brawl.\nOptional: the cask by the hearth, Brannoc's coat by the door, Ingrid in the corner.";

  /* ---------- new game: prologue and tavern ---------- */
  D.scripts.newgame = [
    ['set', 'tut'],
    ['cutscene', [
      ['card', 'Mornvale', null, [
        'Three hundred years ago, the Barrow King bound his soul to his crown and would not die.',
        'Five heroes broke the crown in five and buried each piece under a lamp that never goes out.',
        'Wardens have kept those lamps burning ever since.',
        'Until now.'
      ]],
      // The King
      ['scene', 'v_hollow', 'c', 'up', true], ['dark', 0.8, [6, 2], 22],
      ['note', 'Far to the north, in the Hollow Barrow, the Barrow King still wears one fifth of his crown.'],
      ['wait', 500], ['sfx', 'magic'], ['emote', 'k', '...'],
      ['say', 'The Barrow King', 'One of my lamps has gone cold. I can feel the air again.'],
      ['say', 'The Barrow King', 'Bring them to me. Bring me the rest of myself.'],
      ['fade', 'out', 500],
      // The Pale Hand
      ['scene', 'v_thane', 'c', 'up', true], ['dark', 0.5, [7, 2]],
      ['note', "Nine days ago. The Thane's Barrow, in the forest north of Brackenford."],
      ['move', 'm', 'uuuuu'],
      ['say', 'Hooded Man', 'Well, Sister?'],
      ['say', 'Veyra', 'Three hundred years it has burned. It deserves a moment.'],
      ['say', 'Hooded Man', 'It deserves an ending. Like everything else.'],
      ['turn', 'v', 'down'],
      ['say', 'Veyra', 'Not everything. That is the point. No more graves. No more mothers at gravesides. If the King found a way past death, it can be found for everyone.'],
      ['say', 'Hooded Man', 'And it will be. Five lamps, five barrows, five pieces of a crown. Bring them to me, and I will see the crown on the right head.'],
      ['turn', 'v', 'up'], ['wait', 300],
      ['sfx', 'magic'], ['set', 'cs.out'], ['dark', 0.94, [7, 4], 12], ['shake', 450],
      ['note', 'The flame goes out. Somewhere in the dark, old bones begin to shift.'],
      ['move', 'g', 'rrrru'],
      ['say', 'Grukk', 'Grey lady! Grey man! Grukk dug the hole like you said. Silver now?'],
      ['turn', 'm', 'left'],
      ['say', 'Hooded Man', 'Take whatever the dead were buried with. Hold the hill until the Sister comes back for the shard, and keep everyone away.'],
      ['turn', 'm', 'right'],
      ['say', 'Hooded Man', 'Skrit stays with you. To help.'],
      ['say', 'Skrit', 'Skrit will watch him.'],
      ['say', 'Hooded Man', "Skrit will watch everyone. And I have bought men in Brackenford to keep the reeve's notice off the board."],
      ['turn', 'v', 'down'],
      ['say', 'Veyra', 'And the town? When the lamp goes cold, their dead will wake.'],
      ['turn', 'm', 'up'],
      ['say', 'Hooded Man', 'Then the town will learn what we already know. Death is a door, Sister. Someone ought to open it.'],
      ['move', 'm', 'r'], ['move', 'v', 'dddddd'], ['set', 'cs.vgone'],
      ['turn', 'm', 'up'], ['wait', 400],
      ['say', 'Hooded Man', '(Alone, to the dark lamp.) A crown is wasted on the dead.'],
      ['fade', 'out', 600],
      ['card', 'Chapter One', "The Thane's Barrow"],
      // The heroes
      ['scene', 'tavern', 'p', 'up'],
      ['note', 'Brackenford. The Crooked Lantern. Evening.'],
      ['say', 'Finch', "...and the dragon says, 'Bard, that is the worst rhyme I have ever heard,' and I say, 'Then you must hear my second verse.'"],
      ['say', 'Dask', 'You have never met a dragon.'],
      ['say', 'Finch', "I have met a dragon's tax collector, which I maintain is worse."],
      ['say', 'Maren', 'Three weeks on the road together. We have fought cellar rats, one wolf, and a goat Dask insists was possessed.'],
      ['say', 'Dask', 'It looked at me, Maren. It looked at me like it knew things.'],
      ['say', 'Finch', 'Friends. One day they will sing about us. When they do, what will the song be about? Runa?'],
      ['say', 'Runa', 'A hall in the northern hills with my name cut over the door. And an old debt paid.'],
      ['say', 'Dask', 'A vault in Highmoor, with a door that only opens for me. And not one copper owed to anybody.'],
      ['say', 'Maren', 'A lamp I lit myself, that keeps somebody safe long after I am gone.'],
      ['say', 'Finch', 'And mine is the fifth verse of the Five Lamps. Nobody alive knows how it ends. I mean to find out.'],
      ['say', 'Maren', 'The reeve posted a notice this morning. Goblins in the old barrow north of town. Real work, for once.'],
      ['say', 'Dask', 'Posted. It was on the board an hour ago, and now it is not.'],
      ['sfx', 'door'], ['set', 'cs.vosk'],
      ['place', 'v', 8, 10, 'up'], ['place', 'w', 7, 10, 'up'], ['place', 'y', 9, 10, 'up'],
      ['turn', 'j', 'down'], ['turn', 'l', 'down'], ['turn', 'k', 'right'], ['turn', 'player', 'right'],
      ['emote', 'player', '!'],
      ['move', 'v', 'uuuuuuurrru', 1], ['move', 'w', 'uuuuuuurrrrr', 1], ['move', 'y', 'uuuuuuur', 1], ['sync'],
      ['turn', 'v', 'left'], ['turn', 'w', 'left'], ['turn', 'y', 'left'],
      ['say', 'Brannoc', 'Evening, Bram. The usual, and quick.'],
      ['say', 'Bram', 'Brannoc Vosk. I thought you lot went home to Highmoor.'],
      ['say', 'Brannoc', "Got a better offer. The reeve's goblin job. Me and my brothers have taken it, and we're in no hurry to start."],
      ['note', "He waves the reeve's notice, stuffs it in a pocket, and throws his coat over the stand by the door."],
      ['turn', 'v', 'down'],
      ['say', 'Brannoc', 'You. The bird with the feather. You have been asking about that barrow all over town.'],
      ['say', 'Finch', 'I ask about everything. It is a condition.'],
      ['say', 'Brannoc', 'Then here is an answer. Finish your drinks. When my mug is empty, the four of you are out of Brackenford.'],
      ['turn', 'v', 'left'], ['turn', 'player', 'up'], ['turn', 'j', 'right'], ['turn', 'l', 'left'], ['turn', 'k', 'down'],
      ['say', 'Runa', '(Low.) We are not leaving.'],
      ['say', 'Dask', 'Obviously. But we look before we leap. Three of them, and we do not know what they are carrying.'],
      ['say', 'Maren', 'And nobody dies tonight. Fists only.']
    ]],
    ['hint', HINT1],
    ['note', 'Take a look around before the fists fly. Talk to Dask, Maren and Finch to make a plan.']
  ];

  D.scripts.tutTalked = [['add', 'tut.talked'], ['if', 'tut.talked>=3', [['hint', HINT2]]]];

  D.scripts.tutDask = [
    ['say', 'Dask', 'Rule one of any brawl: know what is in the room. Bram keeps a cask by the hearth marked FOR EMERGENCIES. This is one.'],
    ['say', 'Dask', 'And Brannoc threw his coat on the stand by the door. Coats have pockets. Get me next to it and I will see what is in them.'],
    ['if', '!tut.dask', [['set', 'tut.dask'], ['run', 'tutTalked']]]
  ];
  D.scripts.tutMaren = [
    ['say', 'Maren', 'Anything we find goes in the shared bag. Press X to open the menu and look under Items. You can drink a draught from there too.'],
    ['say', 'Maren', 'When it starts, I will keep you on your feet. Try not to be the first one on the floor.'],
    ['if', '!tut.maren', [['set', 'tut.maren'], ['run', 'tutTalked']]]
  ];
  D.scripts.tutFinch = [
    ['say', 'Finch', 'Ingrid the smith is drinking alone in the corner. She has no love for Highmoor men. She has no love for anyone, admittedly.'],
    ['say', 'Finch', 'But a friend with a hammer is worth three with opinions. If we could give her a reason to join in...'],
    ['if', '!tut.finch', [['set', 'tut.finch'], ['run', 'tutTalked']]]
  ];
  D.scripts.tutCask = [['if', 'tut.cask', [['note', 'The emergency cask is empty. Bram will notice. Bram always notices.']], [
    ['note', 'A small cask by the hearth, marked FOR EMERGENCIES. Inside, packed in straw: two Healing Draughts.'],
    ['give', 'draught', 2], ['set', 'tut.cask'],
    ['if', '!joined', [['note', 'Found items go into the shared bag. Press X and choose Items to see them.']]]
  ]]];
  D.scripts.tutCoat = [['if', 'vosksGone', [['note', 'An empty coat stand. Brannoc left in a hurry.']], [
    ['if', 'tut.letter', [['note', "Just Brannoc's coat now. Dask has been through every pocket."]], [
      ['note', "Brannoc's coat, thrown over the stand. Something papery crackles in a pocket."],
      ['say', 'Dask', 'Keep him looking at his ale. This will take a moment.'],
      ['check', 'dask', 10, [
        ['say', 'Dask', "The reeve's notice, a lucky rabbit's foot, and... a letter. That is interesting."],
        ['give', 'voskletter'], ['set', 'tut.letter'],
        ['note', "\"Vosk. Keep the reeve's notice off the board, and anyone with a sword off the Thornwood road, until the moon turns. Half now, half when the Sister is done. Nobody goes near the Thane's Barrow.\""],
        ['note', 'It is signed with a drawing of a pale, open hand.'],
        ['say', 'Maren', "A pale hand. That is no merchant's mark."],
        ['say', 'Finch', '"When the Sister is done." Done with what, I wonder.'],
        ['say', 'Runa', 'Ingrid might want to read this.'],
        ['xp', 10]
      ], [
        ['note', "Brannoc's head turns. Dask studies the ceiling beams with great interest until it turns back."],
        ['say', 'Dask', 'Too many pockets. Give me a moment and I will try again.']
      ]],
      ['if', '!tut.checkTaught', [['set', 'tut.checkTaught'], ['note', 'That was a skill check: a d20 plus the hero\'s skill bonus, against a difficulty (DC). Each hero has a skill. Some checks can be tried again.']]]
    ]]
  ]]];
  D.scripts.tutIngrid = [['if', 'ingridAlly', [['say', 'Ingrid', 'Say when.']], [
    ['if', 'tut.letter', [
      ['choice', 'Ingrid', 'What do you want?', [
        ['Show her the letter', [
          ['note', 'Ingrid reads it once, slowly. Then she reads it again.'],
          ['say', 'Ingrid', '"Nobody goes near the Thane\'s Barrow." Old Pell has been filling holes in that churchyard all week, and these louts are paid to see nobody does a thing about it.'],
          ['say', 'Ingrid', '...Hold my ale.'],
          ['set', 'ingridAlly'], ['sfx', 'quest'], ['toast', 'Ingrid will fight beside you.']
        ]],
        ['Never mind', [['say', 'Ingrid', 'Then let me drink in peace.']]]
      ]]
    ], [
      ['say', 'Ingrid', 'If you want me throwing punches at Highmoor men, the answer is no. I open the forge at dawn, and I mind my own business.'],
      ['say', 'Ingrid', 'Give me a reason it is my business, and we will talk.']
    ]]
  ]]];
  D.scripts.tutBrannoc = [
    ['choice', 'Brannoc', 'Mug is not empty yet, feather-friend. Something to say?', [
      ['Not yet', [['say', 'Brannoc', 'Then drink up. The clock is ticking.']]],
      ['Settle this', [['run', 'brawlStart']]]
    ]]
  ];

  /* ---------- the brawl ---------- */
  D.scripts.brawlStart = [
    ['hint'],
    ['say', 'Runa', 'Your mug is empty.'],
    ['say', 'Brannoc', 'It is not. But I like your nerve. Boys.'],
    ['if', 'ingridAlly', [
      ['say', 'Ingrid', 'Brannoc Vosk. You owe my forge for two horseshoes and an apology.'],
      ['say', 'Brannoc', 'The smith too? Fine. More to break.']
    ]],
    ['sfx', 'hit'], ['shake', 350], ['hurt', 'runa', '5'],
    ['note', 'Brannoc throws the first punch. It lands.'],
    ['if', 'ingridAlly', [['battle', 'brawl', { guests: ['ingrid'] }]], [['battle', 'brawl']]],
    ['run', 'brawlEnd']
  ];

  /* ---------- closing scene: into the game proper ---------- */
  D.scripts.brawlEnd = [
    ['cutscene', [
      ['note', 'The last of the Vosks goes over a table and stays there.'],
      ['say', 'Bram', 'OUT! All three of you! And you are paying for that chair!'],
      ['say', 'Brannoc', 'You have no idea who you just crossed.'],
      ['move', 'v', 'dddd', 1], ['move', 'w', 'dddd', 1], ['move', 'y', 'dddd', 1], ['sync'],
      ['fade', 'out', 300], ['sfx', 'door'], ['set', 'vosksGone'], ['placep', 8, 7, 'down'], ['heal'], ['fade', 'in', 300],
      ['wait', 300], ['sfx', 'door'], ['set', 'cs.halda'], ['move', 'h', 'uu'],
      ['say', 'Halda', 'I leave a notice on the board for one morning, and come back to find the Lantern in pieces.'],
      ['say', 'Bram', 'Your notice is in the street, Reeve. In Brannoc Vosk\'s coat.'],
      ['say', 'Halda', 'Is it. Then you four are the ones who threw him out after it.'],
      ['if', 'item.voskletter', [
        ['say', 'Runa', 'Someone paid him to keep it off the board. Read this.'],
        ['note', 'Halda reads the letter twice.'],
        ['say', 'Halda', '"Nobody goes near the Thane\'s Barrow." Then somebody very much does not want that barrow looked at.'],
        ['take', 'voskletter'], ['set', 'haldaLetter']
      ]],
      ['run', 'intro'],
      ['say', 'Finch', 'A real adventure, friends. Goblins, a barrow, a lamp gone dark. This is how every good ballad starts.'],
      ['say', 'Runa', "It's how the short ones start, too."],
      ['say', 'Dask', 'Then let us make it a long one. I have a vault to buy.'],
      ['say', 'Maren', 'And I have a lamp to light.'],
      ['fade', 'out', 500],
      ['set', 'joined'], ['set', 'tut', 0], ['quest', 'main', 1],
      ['card', '', 'The next morning'],
      ['set', 'cs.morning'],
      ['warp', 'brackenford', 'a', 'down'],
      ['say', 'Dask', "North gate is that way. The barrow is past it."],
      ['say', 'Maren', 'Temple first. Tobias will know what happened to that lamp.'],
      ['say', 'Finch', 'And the shops. One does not walk into a barrow without a spare string.'],
      ['say', 'Runa', 'All of it. Then the barrow.'],
      ['fade', 'out', 250], ['set', 'cs.morning', 0], ['fade', 'in', 250]
    ]],
    ['note', "The party travels together now. Runa leads, and the menu (X) holds everyone's gear, abilities and the Journal."],
    ['note', 'Explore Brackenford. Tobias at the temple, Odo and Ingrid are worth a visit before you take the north gate to Thornwood.'],
    ['save']
  ];
})();
