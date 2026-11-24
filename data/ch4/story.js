/* Chapter 4 — The Pale Hand. Quests, the chronicle of choices, the cast, and the shared scripts.
   Levels 12-16 (cap 16). Main story alone ends one level below the cap; side content earns level 16.

   Decision flags set in this chapter (chapter 5 reads them):
     chapter 4                      set on the road to Highmoor
     dask4 1 accepted the forgiveness | 2 paid it himself | 3 read the ledger to the court (orrinExposed) | 4 walked out
     shards4 1 gave the shards to the Duke's vault | 2 kept them;  shard1Stolen (Tobias's shard taken from Brackenford)
     maren4 1 told the Wardens where Veyra is | 2 protected her | 3 told the truth and asked mercy (only if veyraTurning)
     knowsGreyOil, knowsChancellery, brannoc4 1 fought | 2 sold the back door | 3 gave it | 4 a drink and a warning;  backdoorKey
     heist 1 burned the debt-papers (wrenFree) | 2 took them;  wrenMet
     dukeCured (else dukeDead at the end), verse4, corrKnown, veyra4 (fought the Colossus beside you), lampLit4, camp4 1-4 */
(function () {
  const D = G.D;
  Object.assign(D.quests, {
    main4: {
      name: 'The Pale Hand', short: 'The Pale Hand', ch: 4, done: 7, stages: {
        1: 'Highmoor. The Duke\'s feast is tonight, at the palace at the top of the avenue.',
        2: 'The feast is over. High Warden Oriel wants Maren at the Cathedral, on the east side of the city.',
        3: 'The Catacomb lamp under Highmoor is out, and the city\'s dead are stirring. The way down is the Undercroft grate, in the south-west alley.',
        4: 'The Catacombs. Find the fourth tomb, and its lamp.',
        5: 'Chancellor Ilvane Corr is the Pale Hand.',
        6: 'Corr is gone with the shards. Go back up to High Warden Oriel at the Cathedral.',
        7: 'Highmoor knows what Corr is. He has gone to the Hollow Barrow, and the King.'
      }
    },
    duke: {
      name: "The Duke's Grey Lips", short: "Duke's Illness", ch: 4, done: 4, stages: {
        1: 'Maren saw grey on Duke Aldric\'s lips at the feast, the colour of a poisoned lamp-wick. Lysa the apothecary, in the market hall, may know more.',
        2: 'Lysa can brew a cure for grey-oil poisoning, but she needs ghostcap. It grows in the Undercroft, in a cave west of the old market street.',
        3: 'Lysa has brewed the cure. Take it to the Duke in the palace before it is too late.',
        4: 'Duke Aldric is cured, and very angry.'
      }
    },
    heist: {
      name: 'The Ledger of Debts', short: 'Ledger of Debts', ch: 4, done: 3, stages: {
        1: 'Wren, Dask\'s sister, clerks at Orrin and Sons. Every debt-paper in Highmoor is in Orrin\'s vault, through the door behind his counter. She can let you in after dark.',
        2: 'The vault is done with. Tell Wren.',
        3: 'Wren knows what you did with the debt-papers of Highmoor.'
      }
    },
    crypt: {
      name: "The First Warden's Tomb", short: "First Warden's Tomb", ch: 4, done: 2, stages: {
        1: 'Brother Fennick, the Cathedral archivist, says the first High Warden is buried in the undercrypt, and that she knew the Fifth Lamp. The stair is in the south-east corner of the Cathedral.',
        2: 'Finch has the fourth stanza of the fifth verse.'
      }
    },
    brannoc: {
      name: "Brannoc's Bargain", short: "Brannoc's Bargain", ch: 4, done: 2, stages: {
        1: 'Brannoc Vosk is drinking at the Silver Lantern, and he knows something about the Undercroft.',
        2: 'You have settled with Brannoc, one last time.'
      }
    }
  });

  D.chronicle = (D.chronicle || []).concat([
    ['dask4=1', "Dask let Orrin forgive his debt in front of the Duke's court.", 4],
    ['dask4=2', "Dask paid his debt to Orrin and Sons, every copper, in front of the court.", 4],
    ['dask4=3', "Dask read Brannoc's ledger aloud at the Duke's feast, and Orrin was dragged out in chains.", 4],
    ['dask4=4', "Dask walked out of the Duke's feast rather than be forgiven.", 4],
    ['shards4=1', "You gave the shards to the Duke's vault, where the Chancellor kept the key.", 4],
    ['shards4=2', 'You kept the shards, and Corr had to take them out of your hands.', 4],
    ['shard1Stolen', "Brackenford's temple was robbed, and the Thane's shard went to the Pale Hand.", 4],
    ['maren4=1', 'Maren told the Wardens where to find Veyra.', 4],
    ['maren4=2', 'Maren kept Veyra\'s secret from the Wardens.', 4],
    ['maren4=3', 'Maren told the High Warden the truth about Veyra, and asked for mercy.', 4],
    ['brannoc4=1', 'Brannoc came for you in the Undercroft, and lost a third time.', 4],
    ['brannoc4=2', "You bought Brannoc's back door into the Pale Hand safehouse.", 4],
    ['brannoc4=3', "Brannoc gave you the back door for nothing, and asked you to forget his handwriting.", 4],
    ['brannoc4=4', 'You bought Brannoc a drink, and he told you who was buying the Pale Hand\'s swords.', 4],
    ['heist=1', 'You burned every debt-paper in Highmoor. Wren is free, and so is half the city.', 4],
    ['heist=2', "You took Highmoor's debt-papers for yourselves. Wren will not speak to Dask.", 4],
    ['dukeCured', 'Maren cured Duke Aldric of grey-oil poisoning.', 4],
    ['verse4', 'In the first High Warden\'s tomb, Finch found the fourth stanza: the Fifth Lamp still holds the door.', 4],
    ['veyra4', 'Veyra fought the Ossuary Colossus beside you.', 4],
    ['camp4=1', 'In Highmoor, Runa sat up with Dask.', 4],
    ['camp4=2', 'In Highmoor, Runa sat up with Maren.', 4],
    ['camp4=3', 'In Highmoor, Runa sat up with Finch.', 4],
    ['camp4=4', 'In Highmoor, Runa walked the city wall alone.', 4]
  ]);

  Object.assign(D.speakers, {
    'Duke Aldric': '#e8d8a0', 'Ilvane Corr': '#e0e0f0', 'High Warden Oriel': '#fff0c0', Wren: '#a8e0b0', Lysa: '#c8e8b0', Dace: '#c8c8d4',
    Olwen: '#f0b890', Herald: '#e8c14a', 'Brother Fennick': '#d8d0b8', 'City Guard': '#b8c0d0', 'Captain Sarre': '#d0d0e0', 'The Hollow Warden': '#e8e0c0',
    Messenger: '#d8c8a8', Collector: '#b8d0a8', Urchin: '#e8c8a0', Noble: '#d8b8e8'
  });
  Object.assign(D.sprites, {
    corr: { skin: '#e8d0b8', hair: '#d8d8e0', top: '#2a2438', robe: 1, trim: '#d8d4e8' },
    duke: { skin: '#d8c8b8', hair: '#e8e8e8', beard: 1, top: '#6a1e2a', robe: 1, trim: '#e8c14a', helm: '#e8c14a' },
    oriel: { skin: '#c98e62', hair: '#e8e8e8', long: 1, top: '#f4f1e6', robe: 1, trim: '#e8c14a' },
    wren: { skin: '#e8b890', hair: '#6b3f2a', long: 1, top: '#4a6a5a', legs: '#3a3028' },
    lysa: { skin: '#e0b090', hair: '#2a4a2a', long: 1, top: '#5a7a4a', robe: 1 },
    dace: { skin: '#a87a5a', bald: 1, beard: 1, hair: '#3a2a1e', top: '#5a5a66', legs: '#2a2a34' },
    olwen: { skin: '#e8c0a0', hair: '#d8d0c0', long: 1, top: '#7a3a3a', robe: 1 },
    herald: { skin: '#e0a67c', hair: '#3a2a1e', top: '#6a1e2a', legs: '#e8c14a', hat: '#6a1e2a' },
    cityguard: { skin: '#e0a67c', hair: '#3a2a1e', top: '#6a1e2a', legs: '#3a3a44', helm: '#a8aab4' },
    noble: { skin: '#f0d0b0', hair: '#c8a050', long: 1, top: '#5a3a7a', robe: 1, trim: '#e8c14a' },
    noble2: { skin: '#e0b090', hair: '#3a3a3a', top: '#2a4a6a', legs: '#2a2a3a', trim: '#e8c14a' },
    fennick: { skin: '#e8d0b8', bald: 1, hair: '#c8c8c8', top: '#d8d4c8', robe: 1 },
    urchin: { skin: '#e0a67c', hair: '#6b3f2a', top: '#5a4a3a', legs: '#3a3028' }
  });

  /* ---------- the Duke's feast ---------- */
  D.scripts.feast = [
    ['set', 'cs.feast'],
    ['scene', 'h_palace', 'p', 'up'],
    ['note', "The Duke's hall is all candles and silk and people who have never been inside a barrow."],
    ['say', 'Herald', 'The heroes of Saltmere and Karrow Hold!'],
    ['say', 'Duke Aldric', 'Welcome. Welcome. Forgive me if I do not rise. I am... tired, this year.'],
    ['say', 'Ilvane Corr', "His Grace tires easily. I am Ilvane Corr, his chancellor. Highmoor is in your debt, all four of you."],
    ['say', 'High Warden Oriel', 'Maren Vale. The Wardens hear you have been busy. Come to the Cathedral tomorrow. We should talk.'],
    ['say', 'Orrin', 'And a small gift, from the house of Orrin and Sons. Master Dask Underbough: your debt to this house is forgiven. Every copper.'],
    ['note', 'The hall applauds. Dask goes very still.'],
    ['choice', 'Dask', '(Everyone is looking at Dask.)', [
      ['Dask: accept, graciously', [
        ['say', 'Dask', 'Master Orrin. I am... speechless. Which, as my friends will tell you, is rare.'],
        ['say', 'Ilvane Corr', 'Gratitude suits you, Master Underbough.'],
        ['set', 'dask4', 1], ['xp', 300]
      ]],
      ['Dask: refuse, and pay it himself (800 gold)', [
        ['gold', -800],
        ['say', 'Dask', 'Kind. Very kind. But I pay my debts, Master Orrin. All of them. Here. Count it.'],
        ['note', 'Orrin counts it. His hands are not quite steady.'],
        ['set', 'dask4', 2], ['bond', 'dask', 1], ['xp', 300]
      ], 'gold>=800'],
      ["Dask: read from Brannoc's ledger, aloud", [
        ['say', 'Dask', 'Before I accept, a reading. From the accounts of Brannoc Vosk. "Grave silver, bought from the barrow diggers. Sent on to Orrin and Sons. Paid in full, by the Hand."'],
        ['note', 'The hall goes silent.'],
        ['say', 'Ilvane Corr', 'Guards. Take Master Orrin to the cells. His Grace will not have grave-robbers at his table.'],
        ['say', 'Orrin', 'My lord? My lord, you cannot...'],
        ['note', 'Orrin is dragged out. Corr does not watch him go. He watches Dask.'],
        ['set', 'dask4', 3], ['set', 'orrinExposed'], ['bond', 'dask', 1], ['xp', 300]
      ], 'item.ledger'],
      ['Dask: walk out', [
        ['say', 'Dask', 'No.'],
        ['note', 'Dask walks out of the Duke\'s hall. After a moment, the music starts again, a little too loudly.'],
        ['set', 'dask4', 4], ['xp', 300]
      ]]
    ]],
    ['say', 'Ilvane Corr', 'One more matter. You carry pieces of the Barrow King\'s crown. The Duke\'s vault is the safest room in the valley, and I keep its only key. Let us keep them for you, until the Wardens decide.'],
    ['choice', null, 'The Chancellor holds out his hand for the shards.', [
      ["Give them to the Duke's vault", [
        ['say', 'Maren', 'They have been heavy. Thank you, Chancellor.'],
        ['lose', 'shard3'], ['if', 'shardAt=2&!shardTraded', [['lose', 'shardworn']]],
        ['say', 'Ilvane Corr', 'Thank you. They could not be safer.'],
        ['set', 'shards4', 1], ['xp', 200]
      ]],
      ['Keep them', [
        ['say', 'Runa', 'We keep them.'],
        ['say', 'Ilvane Corr', 'Of course. Heroes should keep their trophies close.'],
        ['set', 'shards4', 2], ['xp', 200]
      ]]
    ]],
    ['say', 'Maren', '(Quietly, to Runa.) Look at the Duke\'s lips. Grey. I have seen that colour before. On the Cairn lamp\'s wick.'],
    ['quest', 'duke', 1],
    ['if', 'shardAt=1', [
      ['say', 'Messenger', 'Your Grace! Riders from Brackenford. The temple there was robbed three nights ago. Warden Tobias is hurt, and the crown shard he kept is gone.'],
      ['say', 'Maren', 'Tobias...'],
      ['say', 'Ilvane Corr', 'Terrible. The roads are not what they were.'],
      ['set', 'shard1Stolen']
    ]],
    ['set', 'cs.feast', 0],
    ['note', 'The feast runs on until the candles gutter. You walk back to the Silver Lantern through streets that smell of rain and lamp-oil.'],
    ['quest', 'main4', 2],
    ['warp', 'highmoor', 'a', 'down']
  ];

  /* ---------- the fourth tomb: Corr unmasked ---------- */
  D.scripts.unmask = [
    ['note', 'The fourth tomb. On the sarcophagus lies the fourth shard of the crown. The lamp above it is dark, and still warm.'],
    ['say', 'Maren', 'Someone put this lamp out from inside. With a key.'],
    ['set', 'cs.corr'], ['sfx', 'door'],
    ['note', 'Footsteps on the stair behind you. Reavers in grey file into the tomb, and between them, a silver-haired man in a dark hood.'],
    ['say', 'Ilvane Corr', 'Thank you. I could never open the inner seal alone. The shards call to each other, you see. They needed to be close.'],
    ['if', 'knowsGreyOil', [['say', 'Maren', 'The Chancellery supplies every ward-lamp\'s oil in the valley. Twenty years of grey oil. It was you.']]],
    ['if', 'knowsCourt', [['say', 'Dask', 'The man at the Duke\'s court. Orrin\'s "my lord". Of course it was.']]],
    ['note', 'He lowers his hood.'],
    ['say', 'Ilvane Corr', 'Ilvane Corr, Chancellor of Highmoor. The Pale Hand, if you like. I have grown fond of the name.'],
    ['set', 'corrKnown'], ['quest', 'main4', 5],
    ['if', 'dask4=1', [['say', 'Ilvane Corr', 'And Master Underbough. I forgave your debt. I do think you owe me.'], ['say', 'Dask', 'I owe you a knife. I will deliver it personally.']]],
    ['if', 'dask4=3', [['say', 'Ilvane Corr', 'You cost me a good banker, Master Underbough. Orrin was very good with numbers.']]],
    ['if', 'shards4=1', [
      ['say', 'Ilvane Corr', 'Your shards are already in my vault. You put them there yourselves. I want you to remember that part.']
    ], [
      ['say', 'Ilvane Corr', 'Now. The shards, please.'],
      ['note', 'He lifts one hand. The shards in your packs burn cold, and a voice that is not a voice fills the tomb. Every one of you goes to your knees.'],
      ['hurt', 'all', '4d8'],
      ['lose', 'shard3'], ['if', 'shardAt=2&!shardTraded', [['lose', 'shardworn']]],
      ['note', 'When you can stand again, the shards are in his hand.']
    ]],
    ['note', 'Corr lifts the fourth shard from the sarcophagus.'],
    ['say', 'Ilvane Corr', 'Four. The fifth is on the King\'s brow, where it has always been. He has been waiting three hundred years to have it back.'],
    ['say', 'Ilvane Corr', 'He will have to wait a little longer. Forever, in fact. A crown that never dies should be worn by someone who knows what to do with it.'],
    ['say', 'Runa', 'You want it for yourself.'],
    ['say', 'Ilvane Corr', 'Everyone wants it for themselves, Stonehand. I am only the first to be honest about it.'],
    ['if', 'veyraTurning&!maren4=1', [
      ['set', 'cs.veyra4'],
      ['say', 'Veyra', 'Corr!'],
      ['note', 'Veyra comes down the far stair with her lamp burning white.'],
      ['say', 'Ilvane Corr', 'Sister. Late, as ever. You will forgive me if I do not stay to argue theology.']
    ]],
    ['say', 'Ilvane Corr', 'The dead of Highmoor have been very patient with this city. Let them stretch.'],
    ['note', 'He walks out through the far door. Behind you, every bone in the Catacombs begins to move.'],
    ['set', 'cs.corr', 0],
    ['shake', 600],
    ['if', 'cs.veyra4', [['battle', 'colossus', { guests: ['veyra4'] }], ['set', 'veyra4']], [['battle', 'colossus']]],
    ['run', 'colossusDown']
  ];
  D.scripts.colossusDown = [
    ['note', 'The Ossuary Colossus comes apart, bone by bone, and the Catacombs are quiet.'],
    ['if', 'veyra4', [
      ['say', 'Veyra', 'He took my shard three nights ago. He said I was tired, and tired people are kind. Then he took it out of my hands.'],
      ['say', 'Veyra', 'He means to wear it, Maren. Not to end death. To own it.'],
      ['say', 'Maren', 'Then help us stop him.'],
      ['say', 'Veyra', 'I am going to the Hollow Barrow. If you are going too, I will be there when you arrive.'],
      ['note', 'She goes after Corr, alone.'],
      ['set', 'cs.veyra4', 0]
    ]],
    ['say', 'Maren', 'Lamplighter, who keeps the door: here is a little light for those who sleep under the city.'],
    ['sfx', 'magic'], ['set', 'lampLit4'], ['heal'],
    ['note', 'The Catacomb lamp catches and burns blue-white.'],
    ['set', 'cc.done'], ['quest', 'main4', 6], ['xp', 200], ['save']
  ];
  D.scripts.catacombsHome = [
    ['fade', 'out', 500],
    ['note', 'You climb up through the Undercroft as the bells of Highmoor ring the alarm.'],
    ['warp', 'highmoor', 'c', 'down']
  ];

  /* ---------- the night at the Silver Lantern ---------- */
  D.scripts.camp4 = [
    ['warp', 'h_inn', 'p', 'up'],
    ['note', 'Highmoor does not sleep tonight. The four of you sit up in the corner of the Silver Lantern while the city argues outside the windows.'],
    ['choice', null, 'Who does Runa sit up with?', [
      ['Dask', [
        ['if', 'heist=1', [['say', 'Dask', 'Wren hugged me. She has not done that since she was nine. She also told me I smell of sewer, which is fair.']],
          [['if', 'heist=2', [['say', 'Dask', 'Wren will not speak to me. I took a sack of other people\'s chains and called it leverage. She is right not to.']],
            [['say', 'Dask', 'Wren is still in Highmoor. Still clerking for a house with no master. I will get her out. After.']]]]],
        ['if', 'dask4=1', [['say', 'Dask', 'And I let him forgive me. In front of everyone. I keep feeling the leash.']]],
        ['say', 'Runa', 'Then we cut it.'],
        ['say', 'Dask', 'At the Hollow Barrow. Yes. I would like that very much.'],
        ['set', 'camp4', 1], ['boon', 'dask', 'atk', 1]
      ]],
      ['Maren', [
        ['if', 'maren4=1', [['say', 'Maren', 'I told the Wardens where she was. It was the law. I keep telling myself it was the law.']],
          [['if', 'veyra4', [['say', 'Maren', 'She came, Runa. She came down that stair with her lamp burning white.']],
            [['say', 'Maren', 'Twenty years of grey oil. Every lamp I ever trimmed. He poisoned all of them, and I never smelled it.']]]]],
        ['say', 'Runa', 'You are smelling it now.'],
        ['say', 'Maren', 'Yes. Too late for the lamps. Not too late for him.'],
        ['set', 'camp4', 2], ['boon', 'maren', 'pow', 1]
      ]],
      ['Finch', [
        ['if', 'verse4', [['say', 'Finch', '"And there she holds the door, and will, until the last lamp lights her home." She is still in there, Runa. Three hundred years. The Fifth Lamp is still holding the door.']],
          [['say', 'Finch', 'Four stanzas. No. Three. I keep miscounting. I think the song does not want me to finish it.']]],
        ['say', 'Runa', 'Then we go and bring her home.'],
        ['say', 'Finch', 'That would make a very good last verse.'],
        ['set', 'camp4', 3], ['boon', 'finch', 'sp', 3]
      ]],
      ['No one. Walk the city wall.', [
        ['note', 'From the wall you can see the whole valley: the Thornwood, the fens, the far white line of the hills. And east, past the Ashen Road, a darkness that is not a cloud.'],
        ['if', 'runaOath=4', [['note', 'Five winters on the Cairn, after. Runa finds she is counting on there being an after.']]],
        ['set', 'camp4', 4], ['boon', 'runa', 'ac', 1]
      ]]
    ]],
    ['inn', 0]
  ];
})();
