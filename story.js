/* Chapter 1 — quests, the chronicle of choices, shared scripts and the cast's sprites.

   Decision flags set in this chapter (later chapters read them):
     pay 90|30, deal 1          how the fee was settled
     rite, knowsVeyra           what Tobias taught the party
     knowsGrey, knowsGarrick    evidence that someone in grey is paying the goblins
     snik 1 spared and talked | 2 scared off | 3 killed
     alder 1 sung to rest | 2 cut down | 3 found at peace;  pellTruth | pellLie
     silver 1 returned | 2 sold to Odo | 3 given to Grukk
     grukk 1 turned on Skrit and left | 2 bought off | 3 killed
     veyra 1 mercy | 2 judgment | 3 curiosity;  abbeyHint, knowsBrother
     shardAt 1 under Brackenford's lamp | 2 carried
     camp 1 Dask | 2 Maren | 3 Finch | 4 alone;  daskDebt, marenHope, finchSong 1|2;  confide.<name>
     bond.<name>                companion approval, raised and lowered by choices
     Opening (data/ch1/prologue.js): tut.letter, ingridAlly, haldaLetter, vosksGone, ingridGift */
(function () {
  const D = G.D;
  D.quests = Object.assign(D.quests || {}, {
    main: {
      name: "The Thane's Barrow", short: "Thane's Barrow", done: 6, stages: {
        1: "Reeve Halda wants the goblins driven out of the Thane's Barrow. Take the north gate out of Brackenford and follow the road through Thornwood.",
        2: 'An iron gate blocks the way deeper into the barrow. Its chain runs off to the west. There must be a lever.',
        3: 'The gate is open. Find the stairs down.',
        4: 'The ward-lamp is out and the dead are walking. Find the goblin chief in the crypt.',
        5: 'The barrow is quiet and the crown shard is yours. Return to Reeve Halda at the Crooked Lantern.',
        6: 'Halda has settled up. Warden Tobias wants to see the shard.'
      }
    },
    wood: {
      name: 'The Missing Woodcutter', short: 'Woodcutter', done: 3, stages: {
        1: "Wenna's husband Garrick went into Thornwood two days ago. He cuts west of the forest road.",
        2: 'Garrick is safe and limping home. Tell Wenna in Brackenford.',
        3: "Wenna gave you Garrick's old axe, Timberfall."
      }
    },
    mush: {
      name: 'Palecaps for Odo', short: 'Palecaps', done: 2, stages: {
        1: 'Odo wants three palecap mushrooms from Thornwood. They grow off the road, in the quiet corners.',
        2: 'Odo paid in draughts and coin.'
      }
    },
    bounty: {
      name: 'Wolf Bounty', short: 'Wolf Bounty', done: 2, stages: {
        1: 'Hobb at the north gate pays a bounty on Thornwood wolves. Bring him three Wolf Pelts. Wolves keep off the forest road.',
        2: 'Hobb paid the bounty. Extra pelts still sell at the shops.'
      }
    },
    nest: {
      name: 'The Broodmother', short: 'Broodmother', done: 3, stages: {
        1: 'A farmer in Brackenford says a spider as big as a cart nests in a hollow in north-west Thornwood, past the old oaks where Garrick cuts.',
        2: 'The Broodmother is dead. The farmer in Brackenford will want to know.',
        3: 'The farmer paid what he could.'
      }
    },
    grave: {
      name: 'The Empty Grave', short: 'Empty Grave', done: 3, stages: {
        1: "A grave in Brackenford's churchyard was opened from the inside. Old Pell says it was his brother Alder's. Whatever called him, it called from the barrow.",
        2: 'The dead man from the crypt will not walk again. Old Pell, by the churchyard in Brackenford, should see the tin ring he wore.',
        3: "Old Pell has his brother's ring."
      }
    }
  });

  /* Shown in the journal and on the end-of-chapter card: [condition, line]. */
  D.chronicle = [
    ['tut.letter', "Dask lifted the Vosks' orders, signed with a pale hand."],
    ['ingridAlly', 'Ingrid the smith fought beside you in the Crooked Lantern.'],
    ['joined&!ingridAlly', 'You threw the Vosk brothers out of the Crooked Lantern on your own.'],
    ['deal=1', 'You took the reeve\'s job without haggling.'],
    ['pay=90', 'Finch talked the fee up to ninety gold.'],
    ['pay=30', 'Dask took half the fee up front.'],
    ['rite', 'Maren learned the full lamp-rite from Tobias.'],
    ['q.wood>=2', 'Garrick the woodcutter came home alive.'],
    ['snik=1', 'Snik the lookout was let go, and talked.'],
    ['snik=2', 'The goblin lookouts were frightened off.'],
    ['snik=3', 'The goblin lookouts were cut down.'],
    ['alder=1', 'Maren sang Alder Pell back to rest.'],
    ['alder=2', 'Alder Pell was put down by force.'],
    ['alder=3', 'Alder Pell was found at peace under the relit lamp.'],
    ['pellTruth', 'Old Pell was told the truth about his brother.'],
    ['pellLie', 'Old Pell was told a kinder story about his brother.'],
    ['lampLit', "The barrow's ward-lamp burns again."],
    ['grukk=1', 'Grukk Gravepicker turned on the Pale Hand and led his goblins north.'],
    ['grukk=2', 'Grukk was bought off with the grave silver.'],
    ['grukk=3', "Grukk Gravepicker died in the Thane's crypt."],
    ['silver=1', "The grave silver went back to Brackenford's churchyard."],
    ['silver=2', 'The grave silver was sold to Odo.'],
    ['veyra=1', 'Maren asked Veyra to come home.'],
    ['veyra=2', 'Maren told Veyra there is no coming back.'],
    ['veyra=3', 'Maren asked Veyra what the King had promised her.'],
    ['shardAt=1', "The crown shard rests under Brackenford's ward-lamp."],
    ['shardAt=2', 'The crown shard travels with the party.'],
    ['camp=1', 'Runa sat up late with Dask.'],
    ['camp=2', 'Runa sat up late with Maren.'],
    ['camp=3', 'Runa sat up late with Finch.'],
    ['camp=4', 'Runa kept her own company.']
  ].concat(D.chronicle || []);

  Object.assign(D.speakers, { Grukk: '#9bd06a', Snik: '#9bd06a', Skrit: '#c59be8', Veyra: '#d6d6e4', Halda: '#9cc4ff' });
  Object.assign(D.sprites, {
    halda: { skin: '#e2b088', hair: '#6b3f2a', long: 1, top: '#2f4f7a', legs: '#2a2a3a', trim: '#e8c14a' },
    bram: { skin: '#e8b890', bald: 1, beard: 1, hair: '#8a5a3a', top: '#c9b890', legs: '#4a3b2e' },
    odo: { skin: '#d8a070', hair: '#2a2a2a', top: '#c8a040', legs: '#3a3028', hat: '#3a7a4a' },
    ingrid: { skin: '#e8b890', hair: '#d8d0c0', top: '#5a5a66', legs: '#3a3028', trim: '#8a5d38' },
    tobias: { skin: '#d8a880', hair: '#f0f0f0', beard: 1, top: '#d8cfae', robe: 1, trim: '#e8c14a' },
    pell: { skin: '#d0a078', hair: '#8a8a8a', top: '#5a5048', legs: '#3a342e', hat: '#4a4038' },
    tam: { skin: '#f0c8a0', hair: '#a8672e', top: '#d86a3a', legs: '#3a4a6a' },
    wenna: { skin: '#e8b890', hair: '#a8672e', long: 1, top: '#7a9a5a', robe: 1 },
    hobb: { skin: '#e0a67c', hair: '#3a2a1e', top: '#8a2f2f', legs: '#3a3a44', helm: '#70747f' },
    farmer: { skin: '#d8a070', hair: '#6b4a2b', top: '#6a8a4a', legs: '#5a4a3a', hat: '#d8b860' },
    merchant: { skin: '#f0c8a0', hair: '#2a2a2a', beard: 1, top: '#4a7a8a', legs: '#2a2a3a', hat: '#8a2f4a' },
    soldier: { skin: '#c98e62', hair: '#b0b0b0', beard: 1, top: '#6a6a50', legs: '#3a3a30' },
    garrick: { skin: '#e0a67c', hair: '#6b3f2a', beard: 1, top: '#8a3a2a', legs: '#4a3b2e' },
    veyra: { skin: '#e8dcd0', hair: '#8a8a94', top: '#8a8a94', robe: 1, hood: '#70707c' },
    alder: { skin: '#a9b8a2', hair: '#6a6a60', top: '#8a8676', robe: 1 }
  });

  /* ---------- opening ---------- */
  D.scripts.intro = [                       // Halda's offer, played inside the closing scene of the tutorial
    ['say', 'Halda', "I'm Halda, reeve of Brackenford. I have a job, and it seems the only sellswords in town are now lying in the street."],
    ['say', 'Halda', "Graves robbed in the churchyard. Sheep gone. And now Garrick the woodcutter hasn't come home."],
    ['say', 'Runa', 'Goblins?'],
    ['say', 'Halda', "The tracks say so. They've holed up in the old Thane's Barrow, north through Thornwood."],
    ['say', 'Dask', 'And the pay?'],
    ['say', 'Halda', "Sixty gold when it's done, and whatever you find up there that wasn't ours to begin with."],
    ['choice', null, 'Sixty gold, for a barrow full of goblins. How does the party answer?', [
      ['Take the job as offered', [
        ['say', 'Runa', "Sixty is fair. We'll take it."],
        ['say', 'Halda', "No haggling? Then you're the first sellswords I've liked all year. Here. For the road."],
        ['give', 'draught', 2], ['set', 'deal', 1], ['bond', 'maren', 1]
      ]],
      ['Finch: talk the price up', [['check', 'finch', 12, [
        ['say', 'Finch', 'Sixty for the goblins, certainly. But the woodcutter, the graves, the sheep? That is four jobs, reeve, and I have only counted the verses once.'],
        ['say', 'Halda', '...Ninety. And not one verse about how I haggled.'],
        ['set', 'pay', 90], ['bond', 'dask', 1]
      ], [
        ['say', 'Finch', 'Surely Brackenford values its dead more highly than sixty...'],
        ['say', 'Halda', 'Brackenford values its dead. It values its treasury too. Sixty.']
      ]]]],
      ['Dask: ask for half up front', [
        ['say', 'Dask', "Half now. Dead adventurers don't collect, and I've a superstition about being one."],
        ['say', 'Halda', 'Thirty now, thirty after. And if you run, I know what a halfling looks like.'],
        ['gold', 30], ['set', 'pay', 30], ['bond', 'dask', 1]
      ]]
    ]],
    ['say', 'Maren', "The barrow's ward-lamp. Is it still lit?"],
    ['say', 'Halda', 'Ask Warden Tobias at the temple. He frets over it daily, and he will talk as long as you let him.'],
    ['if', 'ingridAlly', [['say', 'Ingrid', "Come by the forge before you go up that hill. I'll see you're not walking into a barrow in rags."]]],
    ['say', 'Halda', 'Rest here tonight. Odo and Ingrid will take your coin in the morning, and the north gate leads to Thornwood.']
  ];

  /* ---------- the goblin lookout ---------- */
  D.scripts.snikFight = [
    ['battle', 'lookout'], ['set', 'snik', 3], ['remove', 'thornwood.k'],
    ['say', 'Dask', '"Grukk says." So there is a Grukk. Good to know who to bill.']
  ];
  D.scripts.snikTalks = [
    ['say', 'Snik', '...Snik will say. Then Snik goes, and nobody tells Grukk.'],
    ['say', 'Snik', "Grukk was good chief. Then grey lady comes, pays silver for digging. Grukk digs up dead Thane, puts on dead Thane's hat. Now Grukk says he IS Thane. Talks to the walls."],
    ['say', 'Snik', 'And the bone-rattler, Skrit. Skrit is not ours. Skrit came with the grey lady and stayed. Skrit watches Grukk like Snik watches stew.'],
    ['say', 'Maren', 'This grey lady. Did she do something to a lamp, deep inside?'],
    ['say', 'Snik', 'Blew it out, like a candle. Then the dead ones started getting up. Snik asked for lookout duty that same day.'],
    ['say', 'Snik', 'Gate inside is chained. Lever is west. Snik is going now.'],
    ['set', 'snik', 1], ['set', 'knowsGrey'], ['xp', 25], ['remove', 'thornwood.k'],
    ['say', 'Finch', 'He will be telling that story in a different forest by nightfall.']
  ];

  /* ---------- Alder Pell ---------- */
  D.scripts.alderFell = [
    ['note', "What is left of him is very small. The tin ring rolls to a stop against Maren's boot."],
    ['give', 'tinring'], ['set', 'alder', 2], ['quest', 'grave', 2]
  ];
  D.scripts.pellRing = [
    ['say', 'Old Pell', 'That is... that is his ring. Where did you get that?'],
    ['if', 'alder=2', [
      ['choice', null, 'Alder came at you, and you cut him down. What do you tell his brother?', [
        ['The truth', [
          ['say', 'Runa', 'He was up and walking. He came at us. We ended it quick.'],
          ['say', 'Old Pell', "...Quick. Well. He'd have wanted quick. Thank you for not dressing it up."],
          ['set', 'pellTruth'], ['bond', 'maren', 1]
        ]],
        ['A kinder story', [
          ['say', 'Finch', 'He was lying by the lamp when we found him, peaceful as a Sunday. He only needed someone to bring him home.'],
          ['say', 'Old Pell', 'Peaceful. Aye. That sounds like him. He never did anything in a hurry.'],
          ['set', 'pellLie'], ['bond', 'finch', 1], ['bond', 'maren', -1]
        ]]
      ]]
    ], [
      ['say', 'Maren', 'He is at rest, Pell. Properly, this time. He was not alone at the end.'],
      ['say', 'Old Pell', 'Not alone. No. Well. That is more than I managed for him.']
    ]],
    ['say', 'Old Pell', 'Take the bell. I rang it for every one of them, so they would know somebody was coming. You will have more use for it than I will.'],
    ['take', 'tinring'], ['give', 'gravebell'], ['gold', 25], ['xp', 40], ['quest', 'grave', 3]
  ];

  /* ---------- Grukk ---------- */
  D.scripts.grukkFight = [
    ['if', 'snik=1', [
      ['note', 'Grukk bellows for his guards. Nobody comes. Word from the lookouts has got around.'],
      ['battle', 'grukk_duo']
    ], [['battle', 'grukk']]],
    ['set', 'grukk', 3], ['remove', 'barrow2.9'], ['run', 'shardScene']
  ];
  D.scripts.grukkTurns = [
    ['say', 'Finch', 'Great Thane. When the digging is done, what does the grey lady need a digger for? She did not leave her own creature at your elbow to keep you company.'],
    ['say', 'Grukk', '...Skrit. Why does Skrit never dig?'],
    ['say', 'Skrit', 'Lady said the diggers are done when the digging is done. Lady said it would be soon.'],
    ['note', 'The hexer throws back his hood. Under it he wears a collar of grey cloth, stitched with a pale open hand.'],
    ['say', 'Grukk', 'Grukk is THANE! Nobody is done with Grukk!'],
    ['note', 'Grukk swings. Skrit is already gone from under the spade, rattling his knucklebones, and the alcoves answer.'],
    ['battle', 'skrit'],
    ['note', "Skrit's bones scatter across the flagstones. Grukk looks at them for a long moment. Then he lifts the Thane's helm off his own head."],
    ['say', 'Grukk', 'Hat made Grukk hear things. Dead-king things. Take it. Take the shiny bit. Grukk takes his people north, where nobody pays silver for anything.'],
    ['say', 'Runa', 'Go, then. If I see you south of the hills, we finish this.'],
    ['say', 'Grukk', 'Fair.'],
    ['set', 'grukk', 1], ['xp', 70], ['bond', 'finch', 1], ['remove', 'barrow2.9'], ['run', 'shardScene']
  ];
  D.scripts.grukkBought = [
    ['say', 'Dask', "Chief. Thane. Whatever the hat says. This is every scrap of silver your lot dug up. Take it, take your people and go, and nobody has to bleed on the Thane's nice floor."],
    ['say', 'Maren', 'Dask. That is not ours to give.'],
    ['say', 'Dask', 'No. But it is ours to spend.'],
    ['say', 'Grukk', '...All the silver. And Grukk keeps the hat?'],
    ['say', 'Runa', 'The hat stays.'],
    ['say', 'Grukk', 'Hat was heavy anyway.'],
    ['say', 'Skrit', 'No. NO. Lady said the diggers hold the hill until she comes back for the last of it!'],
    ['note', 'The hexer throws back his hood. Under it, a collar of grey cloth stitched with a pale open hand. Grukk is already walking. Skrit rattles his knucklebones, and the alcoves answer.'],
    ['battle', 'skrit'],
    ['take', 'silver'], ['set', 'silver', 3], ['set', 'grukk', 2], ['xp', 40],
    ['bond', 'dask', 1], ['bond', 'maren', -1], ['remove', 'barrow2.9'], ['run', 'shardScene']
  ];

  /* ---------- the shard and Veyra ---------- */
  D.scripts.shardScene = [
    ['if', 'grukk=3', [['note', "Grukk topples. The Thane's helm rolls off and rings on the flagstones."]],
      [['note', "The goblins go out past you in a long quiet file, carrying their young. The Thane's helm sits on the flagstones where Grukk left it."]]],
    ['note', "In the sarcophagus, folded in the Thane's dead hands, lies a sliver of black iron. It hums."],
    ['give', 'shard'],
    ['sfx', 'magic'], ['set', 'veyraHere'], ['wait', 600],
    ['say', 'Veyra', 'Maren. Of all the Wardens they might have sent.'],
    ['if', 'knowsVeyra', [['say', 'Maren', 'Veyra. I hoped Tobias was wrong.']], [['say', 'Maren', 'Veyra. It was you. You put out the lamp.']]],
    ['say', 'Veyra', 'I put out a lie. Three hundred years of burying people and calling it mercy. The King found a door out of death, and we bricked it shut.'],
    ['say', 'Runa', 'From here it looks like a door in.'],
    ['choice', 'Maren', '(She was the best pupil you ever had. What do you say to her?)', [
      ['"Come home, Veyra."', [
        ['say', 'Maren', 'You were the best of us. You still could be. Come home, and we will find another way to grieve.'],
        ['say', 'Veyra', "...Don't. Don't be kind to me. I had it all so clear."],
        ['say', 'Veyra', 'The Abbey floods at dusk. Do not go in by the nave. That is all the kindness I have left.'],
        ['set', 'veyra', 1], ['set', 'abbeyHint'], ['bond', 'maren', 1]
      ]],
      ['"There is no coming back from this."', [
        ['say', 'Maren', 'You put out a ward-lamp, and the dead of Brackenford got up out of the ground. There is no door back from that.'],
        ['say', 'Veyra', 'Then we are done being teacher and pupil. Good. That will make it easier.'],
        ['set', 'veyra', 2], ['bond', 'dask', 1]
      ]],
      ['"What did the King promise you?"', [
        ['say', 'Maren', 'Not the sermon. Tell me what he promised you.'],
        ['say', 'Veyra', 'No more graves, Maren. Not one. I buried my brother with my own hands and said your words over him, and they were only words.'],
        ['say', 'Veyra', 'The crown holds a soul past death. One soul, so far. I mean to find out whether it can hold more.'],
        ['say', 'Finch', '(Under his breath.) More than one. Lamplighter keep us.'],
        ['set', 'veyra', 3], ['set', 'knowsBrother'], ['bond', 'finch', 1], ['xp', 30]
      ]]
    ]],
    ['say', 'Veyra', 'Keep the shard, for now. Carry it carefully. There are four more, and I am already on the road to Saltmere.'],
    ['set', 'veyraHere', 0], ['sfx', 'magic'], ['wait', 400],
    ['say', 'Finch', 'Well. Every ballad needs a villain with a point.'],
    ['say', 'Dask', "Every ballad needs a payday. Let's see the reeve."],
    ['quest', 'main', 5], ['save']
  ];

  D.scripts.tobiasShard = [
    ['say', 'Tobias', 'Let me hold it. ...Yes. Cold as the day it was buried.'],
    ['say', 'Tobias', "The Barrow King bound his soul into his crown. The Five Lamps broke it in five and buried each piece under a ward-lamp. Oswin's barrow was the least of them."],
    ['say', 'Maren', 'Veyra knows where the other four lie. I taught her the old maps myself.'],
    ['say', 'Tobias', 'Then you know where she is going. The Drowned Abbey, in the fens past Saltmere.'],
    ['say', 'Tobias', 'Which leaves this. It cannot go back in the barrow. Leave it here under my lamp, or carry it with you.'],
    ['say', 'Maren', 'Under a lamp is where it belongs.'],
    ['say', 'Dask', 'Under a lamp is where she found the last one. I say it stays where we can see it.'],
    ['say', 'Runa', 'If they come for it, I would rather they came to me than to an old man.'],
    ['say', 'Finch', 'For the record, it has been humming in my pack all day, and I do not care for the tune.'],
    ['choice', null, 'What becomes of the crown shard?', [
      ["Leave it under Brackenford's lamp", [
        ['take', 'shard'], ['set', 'shardAt', 1],
        ['say', 'Tobias', 'Then I will sit up with it. I do not sleep much anyway. Take this in trade. It was lit from the lamp, and it does not blow out.'],
        ['give', 'vigil'], ['bond', 'maren', 1]
      ]],
      ['Carry it with you', [
        ['take', 'shard'], ['set', 'shardAt', 2],
        ['say', 'Tobias', 'Then carry it close, and never carry it alone. It will make itself useful to whoever holds it. That is how it starts.'],
        ['give', 'shardworn'], ['bond', 'dask', 1]
      ]]
    ]],
    ['say', 'Tobias', 'The Highmoor carpenters say the south bridge will be mended within the week. Rest tonight. You have earned one quiet evening.'],
    ['run', 'campfire'],
    ['set', 'ch1done'],
    ['run', 'epilogue']
  ];

  /* ---------- the night at the Crooked Lantern ---------- */
  D.scripts.campfire = [
    ['warp', 'tavern', 'p', 'up'],
    ['note', 'That night the Crooked Lantern is loud with a town that has decided to stop being afraid. The four of you get the table by the fire.'],
    ['choice', null, 'It is late, and the room is thinning out. Who does Runa sit up with?', [
      ['Dask', [
        ['say', 'Dask', "You're staring. I counted it twice. Your share's right."],
        ['say', 'Runa', 'You count everything.'],
        ['say', 'Dask', 'I owe everything. There is a counting-house in Highmoor that holds paper on me, and it does not forgive round numbers.'],
        ['if', 'bond.dask>=2', [
          ['say', 'Dask', "You've not once looked at my purse, so I'll tell you the rest. It wasn't my debt to start with. It was my sister's. I signed it over so she could leave the city."],
          ['set', 'confide.dask']
        ]],
        ['choice', 'Runa', '(What do you tell him?)', [
          ['"When they come to collect, they collect from four."', [['say', 'Dask', "...That is terrible arithmetic, Stonehand. I'll take it."], ['set', 'daskDebt', 1]]],
          ['"Then pay it, and be free of them."', [['say', 'Dask', "That's the plan. That has been the plan for six years."], ['set', 'daskDebt', 2]]]
        ]],
        ['set', 'camp', 1], ['boon', 'dask', 'atk', 1]
      ]],
      ['Maren', [
        ['say', 'Maren', "I keep trying to remember the day she changed, and there isn't one. She only asked better questions every year."],
        ['say', 'Runa', 'You blame yourself.'],
        ['say', 'Maren', 'I taught her that death is a door we hold shut for everyone. I never taught her what to do when someone she loved was on the other side of it.'],
        ['if', 'bond.maren>=2', [
          ['say', 'Maren', 'Her brother died the winter before she left us. I told her grief was a lamp, too. I think that may be the most foolish thing I have ever said to anyone.'],
          ['set', 'confide.maren']
        ]],
        ['choice', 'Runa', '(What do you tell her?)', [
          ['"She can still be turned."', [['say', 'Maren', 'I want to believe that more than is wise. Hold me to it.'], ['set', 'marenHope', 1]]],
          ['"She made her choice. Don\'t let it make yours."', [['say', 'Maren', 'No. You are right. You are right, and I hate it.'], ['set', 'marenHope', 2]]]
        ]],
        ['set', 'camp', 2], ['boon', 'maren', 'pow', 1]
      ]],
      ['Finch', [
        ['say', 'Finch', 'I have been trying to rhyme "Gravepicker" for an hour. I believe the goblin did it on purpose.'],
        ['say', 'Runa', 'Why are you really here, singer?'],
        ['say', 'Finch', 'There is a ballad of the Five Lamps. Everyone knows four verses. My grandmother knew a fifth, and would never sing it, and died not singing it. I should like to know how it ends.'],
        ['if', 'bond.finch>=2', [
          ['say', 'Finch', 'She did say one line of it, once, when she thought I was asleep. "And the fifth lamp was the one who held the door." Held it, Runa. Not shut it.'],
          ['set', 'confide.finch']
        ]],
        ['choice', 'Runa', '(What do you tell him?)', [
          ['"Then we will find the ending."', [['say', 'Finch', '"We." Oh, that is going in.'], ['set', 'finchSong', 1]]],
          ['"Some songs end badly."', [['say', 'Finch', 'The good ones usually do. One sings them anyway.'], ['set', 'finchSong', 2]]]
        ]],
        ['set', 'camp', 3], ['boon', 'finch', 'sp', 2]
      ]],
      ['No one. Sharpen the axe.', [
        ['note', "Runa takes her axe out to the yard. The whetstone says what she doesn't. Home is north, and she owes it something."],
        ['note', 'Some time past midnight, somebody leaves a mug of something hot on the fence post and does not mention it.'],
        ['set', 'camp', 4], ['boon', 'runa', 'hp', 4]
      ]]
    ]],
    ['inn', 0]
  ];

  D.scripts.riddleWrong = [
    ['sfx', 'bad'],
    ['note', "The statue's eyes kindle. On either side of the hall, the armoured dead step out of their alcoves."],
    ['battle', 'b2_sentinels'],
    ['note', 'With the sentinels broken, the door swings open on its own.'],
    ['set', 'riddle']
  ];
})();
