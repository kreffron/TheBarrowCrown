/* Chapter 2 — The Drowned Abbey. Quests, the chronicle of choices, the cast, and the shared scripts.
   Levels 4-8 (cap 8). Main story alone ends one level below the cap; side content earns level 8.

   Decision flags set in this chapter (later chapters read them):
     chapter 2                          set when the party takes the south road
     brannoc2 1 fought | 2 paid | 3 ledger leverage | 4 left alone;  knowsRitual, treasurykey
     coll 1 exposed (Finch) | 2 run out (Runa) | 3 heard out (Maren)
     abbeyRoute 1 nave | 2 cloister
     ab.choice 1 saved the fishermen | 2 chased Veyra | 3 traded the Thane's shard
     hostagesSaved | hostagesLost;  shardTraded
     veyra2 1 plea worked (veyraDoubt) | 2 plea failed | 3 fought | 4 let go | 5 took the trade
     lampLit2, verse2, q.light, q.kettle, q.tags, camp2 1-4 */
(function () {
  const D = G.D;
  Object.assign(D.quests, {
    main2: {
      name: 'The Drowned Abbey', short: 'Drowned Abbey', ch: 2, done: 7, stages: {
        1: 'Saltmere. Find Harbourmaster Quill on the docks.',
        2: 'Quill wants his missing fishermen found and the Abbey looked into. Sister Ysolde at the chapel can chart a way across Mirefen.',
        3: "Ysolde gave you her tide chart. Take the fen gate east of town and cross Mirefen to the Drowned Abbey. The boardwalks are safest.",
        4: 'The Drowned Abbey. Find a way down into the crypt.',
        5: 'Veyra is below, and so are the missing fishermen. Something older is stirring under them both.',
        6: 'The Drowned Prior is destroyed. Return to Saltmere and tell Quill what happened.',
        7: 'Quill has settled up. Veyra is bound north, for the third shard.'
      }
    },
    light: {
      name: 'The Dark Lighthouse', short: 'Lighthouse', ch: 2, done: 3, stages: {
        1: "Keeper Bastian's lighthouse is dark. His son Pip went into the sea cave below the cliff for oil and has not come back. The cave mouth is at the east end of the beach.",
        2: 'Pip is safe and you have the oil. Bring it to Bastian.',
        3: 'The Saltmere light burns again.'
      }
    },
    kettle: {
      name: "Mother Brine's Kettle", short: "Brine's Kettle", ch: 2, done: 3, stages: {
        1: 'Mother Brine, who lives in the south-west of Mirefen, says bog lurkers took her kettle to the drowned village in the north-west.',
        2: 'You have the kettle. Mother Brine will want it back.',
        3: 'Mother Brine has her kettle, and told you about the old bell tower.'
      }
    },
    tags: {
      name: 'Names of the Drowned', short: 'Name-tags', ch: 2, done: 2, stages: {
        1: 'Sister Ysolde asks for the tin name-tags the drowned fishermen wore, so they can be buried under their own names. Bring her four.',
        2: 'Ysolde has the names. Saltmere will bury its own.'
      }
    },
    coll: {
      name: 'The Preacher on the Docks', short: 'The Preacher', ch: 2, done: 2, stages: {
        1: 'A man in Warden grey is promising Saltmere\'s grieving families that the drowned will come home.',
        2: 'Brother Coll has been dealt with, one way or another.'
      }
    }
  });

  D.chronicle = (D.chronicle || []).concat([
    ['shardAt=1&chapter>=2', 'Tobias held Brackenford temple against the Vosks, and kept the Thane\'s shard.', 2],
    ['shardAt=2&chapter>=2', 'The Pale Hand came for the Thane\'s shard on the south road.', 2],
    ['brannoc2=1', 'You beat Brannoc Vosk a second time.', 2],
    ['brannoc2=2', 'You paid Brannoc for what he knew.', 2],
    ['brannoc2=3', "You turned Brannoc's own ledger against him.", 2],
    ['brannoc2=4', 'You left Brannoc to his ale.', 2],
    ['coll=1', 'Finch showed Saltmere what Brother Coll really preached.', 2],
    ['coll=2', 'Runa ran Brother Coll out of Saltmere, and he ran straight to the Abbey.', 2],
    ['coll=3', 'Maren heard Brother Coll out, and learned what the tide was for.', 2],
    ['q.light>=3', 'The Saltmere lighthouse burns again, and Pip is home.', 2],
    ['q.kettle>=3', 'Mother Brine has her kettle back.', 2],
    ['q.tags>=2', 'Four drowned fishermen were buried under their own names.', 2],
    ['verse2', 'Finch found the second stanza of the fifth verse in the sunken bell tower.', 2],
    ['abbeyRoute=1', 'You went into the Abbey by the flooded nave.', 2],
    ['abbeyRoute=2', 'You went into the Abbey by the cloister.', 2],
    ['ab.choice=1', 'You saved the fishermen, and Veyra walked away with the second shard.', 2],
    ['ab.choice=2&veyra2=1', 'You chased Veyra, and Maren talked her into opening the sluice. The fishermen lived.', 2],
    ['ab.choice=2&hostagesLost', 'You chased Veyra, and the fishermen drowned.', 2],
    ['veyra2=2', 'Maren pleaded with Veyra, and Veyra would not hear it.', 2],
    ['veyra2=3', 'You fought Veyra under the Abbey, and she still got away.', 2],
    ['veyra2=4', 'Maren let Veyra go.', 2],
    ['ab.choice=3', "You traded the Thane's shard for the fishermen's lives. Veyra now carries two.", 2],
    ['lampLit2', "The Abbey's ward-lamp burns again.", 2],
    ['camp2=1', 'In Saltmere, Runa sat up with Dask.', 2],
    ['camp2=2', 'In Saltmere, Runa sat up with Maren.', 2],
    ['camp2=3', 'In Saltmere, Runa sat up with Finch.', 2],
    ['camp2=4', 'In Saltmere, Runa walked the docks alone.', 2]
  ]);

  Object.assign(D.speakers, {
    'Harbourmaster Quill': '#9cc4ff', 'Sister Ysolde': '#c8e4ff', 'Brother Coll': '#d6d6e4', 'Widow Ama': '#d8c8b8', Mags: '#f0a07a',
    Pettibone: '#b8e0a8', Rook: '#c8c8d4', Bastian: '#f0907a', Pip: '#f2d14a', 'Mother Brine': '#a8d890', Orrin: '#e8d080', 'Warden Hask': '#d6d6e4',
    'The Drowned Prior': '#7fd0d0', Fisherman: '#d8c8a8', Hobb: '#d8b0a0',
    Tobias: '#f2d79a', 'Old Pell': '#c8c0b0', Garrick: '#c8a070', Wenna: '#e0b8a0', Odo: '#b8d0e8', Tam: '#f0d060'
  });
  Object.assign(D.sprites, {
    quill: { skin: '#d8a070', hair: '#4a4a4a', beard: 1, top: '#2f4f6a', legs: '#2a2a3a', hat: '#2a3a4a' },
    ysolde: { skin: '#c98e62', hair: '#2a2a2a', long: 1, top: '#d8e0e8', robe: 1, trim: '#7fb0e8' },
    mags: { skin: '#e8b890', hair: '#c8572e', long: 1, top: '#8a6a4a', robe: 1 },
    pettibone: { skin: '#f0c8a0', bald: 1, beard: 1, hair: '#d8d0c0', top: '#4a7a5a', legs: '#3a3028' },
    rook: { skin: '#8a5a3a', hair: '#1a1a1a', top: '#5a5a66', legs: '#3a3028', trim: '#8a5d38' },
    coll: { skin: '#e0d0c0', hair: '#8a8a94', top: '#8a8a94', robe: 1, hood: '#70707c', trim: '#e8e8f0' },
    ama: { skin: '#d8a070', hair: '#3a2a1e', long: 1, top: '#3a3a48', robe: 1 },
    bastian: { skin: '#e0a67c', hair: '#d8d0c0', beard: 1, top: '#c8443c', legs: '#2a2a3a', hat: '#2a2a3a' },
    pip: { skin: '#f0c8a0', hair: '#e8c14a', top: '#3a6ea5', legs: '#3a3028' },
    boy: { skin: '#c98e62', hair: '#2a1a12', top: '#7a5a3a', legs: '#3a3a44' },
    fisher: { skin: '#c98e62', hair: '#3a2a1e', top: '#4a6a7a', legs: '#3a3a44', hat: '#d8b860' },
    fisher2: { skin: '#e0a67c', hair: '#6b3f2a', beard: 1, top: '#7a5a3a', legs: '#3a3a44' },
    brine: { skin: '#a9b88a', hair: '#d8d8d0', long: 1, top: '#3a4a2a', robe: 1, hood: '#2a3a1e' },
    orrin: { skin: '#f0c8a0', hair: '#d8d0c0', top: '#2a2a3a', robe: 1, trim: '#e8c14a' }
  });

  /* ---------- the Abbey choice (abbey2, at the fork) ---------- */
  D.scripts.abChoice = [
    ['quest', 'main2', 5],
    ['note', 'The stair opens on a vaulted undercroft. The water is rising. You can hear it filling the low places.'],
    ['note', 'To the west, chained in a flooding chamber: Saltmere fishermen, and a Pale Hand warden watching the water climb.'],
    ['note', 'To the east, by a dark lamp: Sister Veyra, with a crown shard in her hand.'],
    ['say', 'Veyra', 'Maren. You came. Of course you came.'],
    ['say', 'Veyra', "The Prior's tide needs souls to walk with him. The Hand chose six fishermen. I did not choose them. I am not stopping it either."],
    ['say', 'Runa', 'Then we stop it.'],
    ['say', 'Veyra', 'You can save them, or you can catch me. The water will not wait for both.'],
    ['choice', null, 'The water is rising. What does the party do?', [
      ['Save the fishermen', [['run', 'abSave']]],
      ['Chase Veyra', [['run', 'abChase']]],
      ["Offer Veyra the Thane's shard for their lives", [['run', 'abTrade']], 'shardAt=2&!shardTraded']
    ]],
    ['set', 'veyraGone'], ['set', 'ab.done'],
    ['sfx', 'lever'], ['shake', 400],
    ['note', "Behind you, the gate to the Prior's tomb grinds open. The water pours toward it, and something in the tomb drinks it in."]
  ];
  D.scripts.abSave = [
    ['say', 'Maren', 'The fishermen. Now.'],
    ['say', 'Veyra', 'Good. That is the answer I hoped you would give. I am sorry, Maren.'],
    ['note', 'Veyra steps back into the dark of the vault and is gone, and the shard with her.'],
    ['set', 'ab.choice', 1],
    ['if', 'coll=1', [['battle', 'warden_small']], [['battle', 'warden']]],
    ['remove', 'abbey2.w'],
    ['note', 'Runa breaks the chains. Dask gets the last lock.'],
    ['say', 'Fisherman', 'You came from Saltmere? For us? Lamplighter bless you, all of you.'],
    ['set', 'hostagesSaved'], ['set', 'hostagesLost', 0], ['bond', 'maren', 1], ['xp', 60]
  ];
  D.scripts.abChase = [
    ['say', 'Dask', 'The shard. If she walks away with it, all of this was for nothing.'],
    ['set', 'ab.choice', 2], ['set', 'hostagesLost'],
    ['note', 'You run east. Behind you the water closes over the western chamber.'],
    ['say', 'Veyra', 'You chose me. I did not think you would.'],
    ['choice', 'Maren', '(Veyra stands at the dark lamp, the shard in her hand.)', [
      ['Plead with her', [['check', 'maren', [16, ['veyra=1', -3], ['marenHope=1', -2], ['knowsRitual', -2], ['knowsBrother', -2], ['verse1', -1]], [
        ['say', 'Maren', 'You buried your brother and said the words and they were only words. I know. But six men are drowning behind that wall right now, Veyra, and nobody is going to say anything over them at all.'],
        ['say', 'Veyra', '...'],
        ['note', 'Veyra drives her lamp-staff into the sluice wheel and wrenches it round. Behind you, the water roars out of the western chamber.'],
        ['say', 'Veyra', 'They will live. Do not thank me. I am still going north, to the Giant\'s Cairn, and I am still taking this with me.'],
        ['set', 'hostagesLost', 0], ['set', 'hostagesSaved'], ['set', 'veyra2', 1], ['set', 'veyraDoubt'], ['set', 'knowsCairn'], ['bond', 'maren', 2], ['xp', 300]
      ], [
        ['say', 'Maren', 'Veyra, please. There are men drowning.'],
        ['say', 'Veyra', 'There are always men drowning. That is the whole point. No, Maren. Not even for you.'],
        ['note', 'Lamplight flares grey, and she is gone.'],
        ['set', 'veyra2', 2], ['xp', 180]
      ]]]],
      ['Fight her for the shard', [
        ['battle', 'veyra'],
        ['note', 'Veyra staggers against the altar. A flash of grey lamplight, and when it clears she is gone, and the shard with her.'],
        ['set', 'veyra2', 3], ['bond', 'dask', 1]
      ]],
      ['Let her go', [
        ['say', 'Maren', 'Go, then. I will find you again.'],
        ['say', 'Veyra', 'I know you will. That is what frightens me.'],
        ['set', 'veyra2', 4], ['set', 'knowsCairn'], ['xp', 180]
      ]]
    ]]
  ];
  D.scripts.abTrade = [
    ['say', 'Runa', "The Thane's shard. For their lives."],
    ['say', 'Veyra', 'You would. Of course you would.'],
    ['lose', 'shardworn'], ['set', 'shardTraded'], ['set', 'ab.choice', 3], ['set', 'veyra2', 5],
    ['note', 'Veyra takes the shard. Then she does what she said: she pulls the sluice, and the water drains from the western chamber.'],
    ['say', 'Veyra', 'Two shards. The Hand will be delighted. I find I am not.'],
    ['set', 'hostagesSaved'], ['bond', 'finch', 1], ['bond', 'dask', -1], ['xp', 300]
  ];

  /* ---------- after the Prior ---------- */
  D.scripts.priorDown = [
    ['note', 'The Drowned Prior comes apart like wet paper. The water in the undercroft stills, then begins, very slowly, to fall.'],
    ['set', 'priorDead'], ['quest', 'main2', 6],
    ['say', 'Maren', "The Abbey's lamp is still dark. Give me a moment with it before we go."],
    ['save']
  ];

  /* ---------- the night in Saltmere ---------- */
  D.scripts.camp2 = [
    ['warp', 's_inn', 'p', 'up'],
    ['note', 'The Gull and Lantern is quiet tonight. Saltmere is counting who came home.'],
    ['choice', null, 'Who does Runa sit up with?', [
      ['Dask', [
        ['say', 'Dask', 'Orrin and Sons pays the Pale Hand\'s bills. Orrin and Sons holds my paper. Every road in this business runs past the same counting-house.'],
        ['if', 'confide.dask', [['say', 'Dask', 'My sister is in Highmoor, too. If the Hand is buying the city, I want her out of it first.']]],
        ['say', 'Runa', 'Then we go to Highmoor, when it is time.'],
        ['say', 'Dask', 'When it is time. Not one day before. I have plans for being alive.'],
        ['set', 'camp2', 1], ['boon', 'dask', 'dmgBonus', 1]
      ]],
      ['Maren', [
        ['if', 'veyra2=1', [['say', 'Maren', 'She opened the sluice. For me, or for them, I do not know. But she opened it.']],
          [['if', 'veyra2=3', [['say', 'Maren', 'I struck her, Runa. My best pupil. She looked at me as if I had finally told her the truth.']],
            [['say', 'Maren', 'Every time I see her she is further away. Not on the map. In her eyes.']]]]],
        ['say', 'Runa', 'She is still in there.'],
        ['say', 'Maren', 'I know. That is the part I cannot bear.'],
        ['set', 'camp2', 2], ['boon', 'maren', 'sp', 3]
      ]],
      ['Finch', [
        ['if', 'verse2', [['say', 'Finch', 'She. The fifth Lamp was a woman, and she kept the door alone. Grandmother never once said she. Why would she hide that?']],
          [['say', 'Finch', 'Somewhere out there is the rest of my verse. I keep thinking it will tell me how this ends. I keep hoping it does not.']]],
        ['say', 'Runa', 'You will find it.'],
        ['say', 'Finch', 'I will. And then I will have to sing it, which is the frightening part.'],
        ['set', 'camp2', 3], ['boon', 'finch', 'pow', 1]
      ]],
      ['No one. Walk the docks.', [
        ['note', 'The Saltmere light sweeps the water. North, somewhere past the hills, is Karrow Hold, and a debt Runa has not paid in eleven years.'],
        ['set', 'camp2', 4], ['boon', 'runa', 'ac', 1]
      ]]
    ]],
    ['inn', 0]
  ];
})();
