/* Chapter 5 — The Barrow King. Quests, the chronicle of choices, the cast, and the shared scripts.
   Levels 16-20 (cap 20). Main story alone ends at level 19; side content reaches 20.

   What this chapter reads from earlier ones:
     the muster at Ashfall: dukeCured, brynAlly, grukk3, hostagesSaved, ingridAlly/silver, heist=1, prisonersFreed
     Veyra: veyra4 (waiting at the gate) | maren4=1 (in Wardens' custody) | neither (stands with Corr)
     Dask: dask4, heist (debtpapers to burn), wrenFree.  Maren: marenHope, knowsBrother, odricMsg.
     Finch: verse1-4 and the Road of Lamps decide whether the song can end it.  Runa: runaOath (five winters).
   Flags set here: muster, veyraWith, veyraFreed, veyraStays, veyra5 1 redeemed | 2 in custody | 3 fell with Corr,
     dask5, roadLit, prisonersFreed, tobiasFree, corrShaken, corrTaken, doorOpen, kingDown, ending 1 song | 2 Ennet | 3 Veyra,
     camp5, ch5done */
(function () {
  const D = G.D;
  Object.assign(D.quests, {
    main5: {
      name: 'The Barrow King', short: 'The Barrow King', ch: 5, done: 7, stages: {
        1: 'Ashfall, the war camp at the head of the Ashen Road. High Warden Oriel is waiting in the Wardens\' pavilion, at the north end of camp.',
        2: 'Take the Ashen Road east to the Hollow Barrow. The Pale Hand holds the canyon.',
        3: 'The Barrow gate is open. Go in.',
        4: 'The Court of the Dead. The way down is sealed with the King\'s own name.',
        5: 'Corr is at the last door, and the Fifth Lamp is holding it.',
        6: 'The door is open. The King is waiting on his throne.',
        7: 'It is over.'
      }
    },
    lamps: {
      name: 'The Road of Lamps', short: 'Road of Lamps', ch: 5, done: 2, stages: {
        1: 'Four way-lamps stand dark along the Ashen Road, each one guarded by lamp-eaters. Oriel asks Maren to light them again, for the dead of the road and for whatever comes after.',
        2: 'All four way-lamps on the Ashen Road are burning.'
      }
    },
    greyhold: {
      name: 'Greyhold', short: 'Greyhold', ch: 5, done: 2, stages: {
        1: 'The Pale Hand holds prisoners in Greyhold, a fort north of the Ashen Road. Wardens, carters, and anyone who would not bow.',
        2: 'The prisoners of Greyhold are free.'
      }
    },
    mirror: {
      name: 'The Mirror Barrow', short: 'Mirror Barrow', ch: 5, done: 2, stages: {
        1: 'A small barrow south of the Ashen Road, with a mirror at its heart. Finch says his grandmother sang about it. Each of you will find something in there.',
        2: 'The Mirror Barrow has given back what it was keeping.'
      }
    }
  });

  D.chronicle = (D.chronicle || []).concat([
    ['muster>=5', 'Half the valley marched with you to the Ashen Road.', 5],
    ['muster>=2&muster<=4', 'Friends from across the valley marched with you to the Ashen Road.', 5],
    ['muster=1', 'Only the Wardens marched with you to the Ashen Road.', 5],
    ['veyraFreed', 'Maren set Veyra free from the Wardens\' cells at Ashfall.', 5],
    ['veyraStays', 'Maren left Veyra to the Wardens\' judgement.', 5],
    ['dask5=1', 'Dask burned the debt-papers of Highmoor at Ashfall, every one.', 5],
    ['dask5=2', 'Dask kept the debt-papers of Highmoor.', 5],
    ['roadLit', 'Maren lit the four way-lamps of the Ashen Road.', 5],
    ['prisonersFreed', 'You freed the prisoners of Greyhold.', 5],
    ['tobiasFree', 'Warden Tobias walked out of Greyhold.', 5],
    ['q.mirror>=2', 'The Mirror Barrow gave each of you back something you had lost.', 5],
    ['corrShaken', "Corr's crown slipped before the fight began.", 5],
    ['veyra5=1', 'Veyra stood with Maren at the end.', 5],
    ['veyra5=3', 'Veyra stood with Corr at the last door, and fell with him.', 5],
    ['ending=1', 'Finch sang the fifth stanza, and the crown broke in the light of every lamp.', 5],
    ['ending=2', 'Ennet Tallowmere broke the crown, and went home.', 5],
    ['ending=3', 'Veyra broke the crown, and Ennet walked out into the daylight.', 5],
    ['camp5=1', 'On the last night, Runa sat up with Dask.', 5],
    ['camp5=2', 'On the last night, Runa sat up with Maren.', 5],
    ['camp5=3', 'On the last night, Runa sat up with Finch.', 5],
    ['camp5=4', 'On the last night, Runa sat up with all three of them.', 5]
  ]);

  Object.assign(D.speakers, {
    Ennet: '#ffe8a0', 'Vael Morn': '#c8b8e8', Hallvard: '#e8c8a0', Odric: '#a8c8d8', Grandmother: '#d8c8f0', 'Ashen Knight': '#e8a878', '???': '#ffe8a0', 'Captain Hale': '#e8a8a8', Jory: '#d8c8a8', Debtor: '#c8d8a8', Sutler: '#c8c0a8', Quartermaster: '#c8c8d4', Healer: '#d8f0d8', Prisoner: '#d6d6e4'
  });
  Object.assign(D.sprites, {
    sutler: { skin: '#e0a67c', hair: '#3a2a1e', beard: 1, top: '#6a5a3a', legs: '#3a3028', hat: '#5a4a3a' },
    quartermaster: { skin: '#d8b090', hair: '#8a8a8a', top: '#d8d4c8', robe: 1, trim: '#e8c14a' },
    healer: { skin: '#c98e62', hair: '#2a2a2a', long: 1, top: '#e8f0e0', robe: 1, trim: '#7ec87e' }
  });

  /* ---------- the opening ---------- */
  D.scripts.ch5road = [['if', 'chapter>=5', [['warp', 'ashfall', 'n', 'right']], [['run', 'ch5start']]]];
  D.scripts.ch5start = [
    ['cutscene', [
      ['fade', 'out', 600],
      ['set', 'chapter', 5],
      ['scene', 'v_hollow2', 'c', 'up', true],
      ['note', 'The Hollow Barrow, at the end of the Ashen Road. Three days since the fourth lamp went out.'],
      ['say', 'Ilvane Corr', 'Open.'],
      ['shake', 500],
      ['say', '???', 'No.'],
      ['say', 'Ilvane Corr', 'Four shards, Lamp. Four. You are one tired woman behind a door.'],
      ['say', '???', 'I have been one tired woman behind a door for three hundred years. You will find I am very good at it.'],
      ['say', 'The Barrow King', 'She is, Chancellor. Believe me. I have tried.'],
      ['say', 'Ilvane Corr', 'Then I will wait. Everyone tires eventually.'],
      ['fade', 'out', 900],
      ['card', 'Chapter Five', 'The Barrow King']
    ]],
    ['if', 'veyra4', [['set', 'veyraWith']]],
    ['quest', 'main5', 1],
    ['scene', 'v_road', 'c', 'down'],
    ['note', 'The east road out of Highmoor. The lamps along it are lit for the first mile, then dark, then gone. On the third day the grass turns grey.'],
    ['say', 'Finch', 'Four stanzas. A barrow, an abbey, a cairn and a cathedral. The fifth one is at the end of this road, and I still do not know how it ends.'],
    ['say', 'Dask', 'Badly, usually. In your songs everyone dies at the end.'],
    ['say', 'Finch', 'Not everyone. Somebody has to live to sing it.'],
    ['say', 'Runa', 'Then we walk in together, and we walk out together. That is the whole plan.'],
    ['if', 'veyraWith', [['say', 'Maren', 'Veyra is waiting at Ashfall. She says she knows the Barrow. She says she is sorry. I believe one of those.']],
      [['say', 'Maren', 'Somewhere ahead of us is Veyra, and Corr, and four shards. We have one lamp left. It will have to be enough.']]],
    ['warp', 'ashfall', 'n', 'right'],
    ['note', 'Ashfall: a war camp at the head of the Ashen Road, where the grass gives up and the ash begins. Tents, braziers, and more banners than you expected.'],
    ['note', 'You have barely reached the first tents when horns sound from the east.'],
    ['say', 'Runa', 'Outriders. Corr knows we are here.'],
    ['battle', 'outriders'],
    ['say', 'Maren', 'Find Oriel. The Wardens\' pavilion, at the north end of camp.'],
    ['save']
  ];

  /* ---------- High Warden Oriel at Ashfall ---------- */
  D.scripts.muster = [
    ['set', 'muster', 1],
    ['if', 'dukeCured', [['add', 'muster']]],
    ['if', 'brynAlly', [['add', 'muster']]],
    ['if', 'grukk3=1', [['add', 'muster']]], ['if', 'grukk3=2', [['add', 'muster']]], ['if', 'grukk3=4', [['add', 'muster']]],
    ['if', 'hostagesSaved', [['add', 'muster']]],
    ['if', 'ingridAlly', [['add', 'muster']], [['if', 'silver=1', [['add', 'muster']]]]],
    ['if', 'heist=1', [['add', 'muster']]],
    ['if', 'prisonersFreed', [['add', 'muster']]]
  ];
  D.scripts.oriel5 = [
    ['run', 'muster'],
    ['say', 'High Warden Oriel', 'You made it. Good. Look around you, Maren. Look who came.'],
    ['if', 'dukeCured', [['say', 'High Warden Oriel', "The Duke's own guard, under Captain Hale. Aldric sent them with his blessing, and a great deal of swearing."]],
      [['say', 'High Warden Oriel', 'Highmoor sent nobody. The regency council is still arguing over whether Corr is a traitor or a regent.']]],
    ['if', 'brynAlly', [['say', 'High Warden Oriel', 'Karrow Hold, under Bryn Stonehand. She says the clan keeps its oaths.']]],
    ['if', 'grukk3=1', [['say', 'High Warden Oriel', 'And... goblins. They say Grukk owes you. They have brought a goat.']]],
    ['if', 'grukk3=2', [['say', 'High Warden Oriel', 'And goblins, who say they have been paid in advance. They have brought an invoice.']]],
    ['if', 'grukk3=4', [['say', 'High Warden Oriel', "And goblins, under one Nagra, who says she is here to kill grey robes for her brother. I have not argued."]]],
    ['if', 'hostagesSaved', [['say', 'High Warden Oriel', "Saltmere sent its fishermen. Six of them asked for you by name. The ones you pulled out of the Abbey."]]],
    ['if', 'ingridAlly', [['say', 'High Warden Oriel', 'Brackenford sent its smith, and the smith brought the town.']],
      [['if', 'silver=1', [['say', 'High Warden Oriel', 'Brackenford sent its militia. They said you gave them back their dead.']]]]],
    ['if', 'heist=1', [['say', 'High Warden Oriel', 'And half of Tanner\'s Row from Highmoor, with pitchforks. They say somebody burned their debts.']]],
    ['if', 'muster=1', [['say', 'High Warden Oriel', 'It is only the Wardens. We will have to be enough.']]],
    ['say', 'High Warden Oriel', 'Corr holds the Hollow Barrow with four shards and a road full of dead men. The Ashen Road runs east from the camp. The Pale Hand holds the canyon halfway along.'],
    ['say', 'High Warden Oriel', 'Two more things, if you have the time. The four way-lamps on the Ashen Road are dark. Light them, Maren, for the dead of the road.'],
    ['say', 'High Warden Oriel', 'And Corr keeps prisoners at Greyhold, north of the road. Wardens. Carters. Anyone who would not bow.'],
    ['if', 'shard1Stolen', [['say', 'High Warden Oriel', 'One of them is Tobias of Brackenford.'], ['say', 'Maren', 'Tobias...']]],
    ['quest', 'main5', 2], ['quest', 'lamps', 1], ['quest', 'greyhold', 1], ['xp', 200]
  ];

  /* ---------- the last night (the healers' tent) ---------- */
  D.scripts.camp5 = [
    ['note', 'The last night before the Hollow Barrow. Nobody in Ashfall sleeps much.'],
    ['choice', null, 'Who does Runa sit up with?', [
      ['Dask', [
        ['say', 'Dask', 'You know what I keep thinking? Five years ago I was a thief with a debt. Now I am a thief with friends. The debt was easier.'],
        ['if', 'wrenFree', [['say', 'Dask', 'Wren wrote. She says if I die she will be furious. She underlined furious.']]],
        ['say', 'Runa', 'Then do not die.'],
        ['say', 'Dask', 'That was my plan. It has always been my plan.'],
        ['set', 'camp5', 1], ['boon', 'dask', 'dmgBonus', 2]
      ]],
      ['Maren', [
        ['say', 'Maren', 'Twenty years I have kept lamps. Tomorrow I find out what they were for.'],
        ['if', 'confide.maren', [['say', 'Maren', 'Do you remember what I told you, in Brackenford? That I told her grief was a lamp too? I think I was wrong about the lamp. Not about the grief.']]],
        ['if', 'veyraWith', [['say', 'Maren', 'And she is here. Whatever happens tomorrow, she is here.']], [['say', 'Maren', 'I keep looking for her at the fires. As if she might just walk in.']]],
        ['set', 'camp5', 2], ['boon', 'maren', 'pow', 2]
      ]],
      ['Finch', [
        ['say', 'Finch', 'Four stanzas. Five lamps. One door. I have rewritten the ending eleven times tonight.'],
        ['if', 'confide.finch', [['say', 'Finch', '"And the fifth lamp was the one who held the door." Grandmother said that to me once, when she thought I was asleep. I think she was telling me where to look.']]],
        ['say', 'Runa', 'And?'],
        ['say', 'Finch', 'And I think it is not mine to write. I think we just have to go and see.'],
        ['set', 'camp5', 3], ['boon', 'finch', 'pow', 2]
      ]],
      ['All three of them', [
        ['note', 'In the end Runa does not choose. She drags a bench to the fire, and the four of them sit up together, saying very little, until the sky goes grey.'],
        ['set', 'camp5', 4], ['boon', 'runa', 'hp', 10]
      ]]
    ]],
    ['inn', 0]
  ];

  /* ---------- Veyra at Ashfall, if Maren told the Wardens where she was ---------- */
  D.scripts.veyraCustody = [
    ['if', 'veyraFreed', [['say', 'Veyra', 'I will be at the Barrow gate. Go on. I know the way.']], [['if', 'veyraStays', [['say', 'Veyra', 'Go, Maren. Do not look back at me. Win.']], [
      ['say', 'Veyra', 'Maren.'],
      ['say', 'Maren', 'Veyra. I told them where you were. It was the law.'],
      ['say', 'Veyra', 'I know. You always did keep your vows. It is why I believed you, the first time.'],
      ['choice', 'Maren', '(The Warden on guard is looking the other way. Carefully.)', [
        ['Set her free', [
          ['say', 'Maren', 'Then here is a new vow. Come with us. Bring the light back with your own hands.'],
          ['note', 'Maren takes the key from the guard\'s belt. The guard keeps looking at the sky.'],
          ['say', 'Veyra', 'I will meet you at the Barrow gate.'],
          ['set', 'veyraFreed'], ['set', 'veyraWith'], ['bond', 'maren', 2]
        ]],
        ['Leave her with the Wardens', [
          ['say', 'Maren', 'No. Not this time. When it is over, I will speak for you at your judgement. I promise.'],
          ['say', 'Veyra', 'Then I will be here. Come back, Maren.'],
          ['set', 'veyraStays'], ['set', 'veyra5', 2]
        ]]
      ]]
    ]]]]
  ];

  /* ---------- Dask and Highmoor's debt-papers ---------- */
  D.scripts.papers = [
    ['if', 'dask5', [['note', 'A brazier.']], [
      ['if', 'item.debtpapers', [
        ['note', 'Dask stands at the brazier with the sack of Highmoor\'s debt-papers. He has been standing there a while.'],
        ['choice', 'Dask', '(Every debt in Highmoor, in a sack.)', [
          ['Burn them', [
            ['say', 'Dask', 'Wren was right. It was always going to be this or Orrin.'],
            ['take', 'debtpapers'], ['note', 'It burns for an hour. Half of Ashfall comes to watch.'],
            ['set', 'dask5', 1], ['bond', 'dask', 2], ['bond', 'maren', 1], ['xp', 300]
          ]],
          ['Keep them', [['say', 'Dask', 'Not yet. After. Maybe.'], ['set', 'dask5', 2]]]
        ]]
      ], [['note', 'A brazier. Somebody is roasting chestnuts on it, which feels like defiance.']]]
    ]]
  ];

  /* ---------- the last door ---------- */
  D.scripts.doorScene = [
    ['quest', 'main5', 5],
    ['note', 'The last door of the Hollow Barrow. Corr stands before it with four shards burning on a circlet, and the door is shaking in its frame.'],
    ['say', '???', 'Not while I keep it.'],
    ['say', 'Ilvane Corr', 'Ah. The heroes. Three days I have knocked, and she will not open. Perhaps she will open for you.'],
    ['if', 'veyraWith', [
      ['say', 'Veyra', 'Corr. You told me it would end graves. You lied.'],
      ['say', 'Ilvane Corr', 'I told you what you needed, Sister. Everyone gets what they need from me. That is what a chancellor is for.']
    ], [['if', 'veyraStays', [], [['set', 'cs.v5'], ['run', 'veyraAtDoor']]]]],
    ['if', 'dask4=1', [['say', 'Ilvane Corr', 'Master Underbough. Still in my debt, I think.']]],
    ['say', 'Ilvane Corr', 'A last offer, before we are tiresome. Stand aside, and I will remember who stood aside. A crown that never dies has a long memory.'],
    ['choice', null, 'Corr waits for an answer.', [
      ['Refuse him', [['say', 'Runa', 'No.'], ['say', 'Ilvane Corr', 'It is always no with you, Stonehand. Very well.']]],
      ['Finch: play along, then break his concentration', [['check', 'finch', [20, ['verse4', -2], ['grandmaBlessing', -3], ['knowsCourt', -1]], [
        ['say', 'Finch', 'My lord! A song for the new king, then. "Four shards upon a borrowed brow, and none of them his own..."'],
        ['note', 'Corr\'s smile slips. So does the circlet. One shard cracks against the stone floor, and he snatches it back with a hiss.'],
        ['set', 'corrShaken'], ['bond', 'finch', 1]
      ], [['say', 'Ilvane Corr', 'Spare me the ballad, singer. I have read your grandmother\'s.']]]]],
      ['Dask: lift a shard off his brow mid-speech', [['check', 'dask', [21, ['wrenFree', -2], ['dask4=3', -2], ['dask5=1', -2]], [
        ['note', 'Dask is beside Corr before anyone sees him move. When he steps back, there is a shard in his hand, and a gap in the circlet.'],
        ['say', 'Dask', 'Debt collected.'],
        ['note', 'Corr tears it back out of the air with the King\'s voice. But it costs him, and you can all see it.'],
        ['set', 'corrShaken'], ['bond', 'dask', 1]
      ], [['say', 'Ilvane Corr', 'Hands off the crown, thief. Your fingers are not as quiet as they were.']]]]]
    ]],
    ['run', 'corrFight']
  ];
  D.scripts.veyraAtDoor = [
    ['note', 'Veyra steps out of the shadow by the door, her lamp burning grey. She stands at Corr\'s shoulder.'],
    ['say', 'Veyra', 'Turn back, Maren. Please.'],
    ['choice', 'Maren', '(Veyra stands with Corr.)', [
      ['Maren: one last plea', [['check', 'maren', [20, ['veyra=1', -3], ['marenHope=1', -2], ['knowsBrother', -2], ['odricMsg', -4], ['hostagesSaved', -1], ['verse4', -1], ['veyraDoubt', -2]], [
        ['if', 'odricMsg', [['say', 'Maren', 'I met Odric, Veyra. In the Mirror Barrow. He said it was never your fault. He said come home.']],
          [['say', 'Maren', 'You said the words over your brother and they were only words. These are not. Come home, Veyra.']]],
        ['note', 'Veyra\'s lamp flickers grey, and then, slowly, white.'],
        ['say', 'Veyra', '...I am so tired of graves, Maren.'],
        ['say', 'Maren', 'I know. So am I. Stand with us, and we will close this one together.'],
        ['note', 'Veyra crosses the floor and stands beside Maren.'],
        ['set', 'cs.v5', 0], ['set', 'veyraWith'], ['set', 'veyraTurning'], ['bond', 'maren', 2]
      ], [
        ['say', 'Maren', 'Veyra, please...'],
        ['say', 'Veyra', 'It is too late for me, Maren. It has been too late since the Thane\'s barrow.']
      ]]]],
      ['Fight them both', [['say', 'Runa', 'Then she chooses.']]]
    ]]
  ];
  D.scripts.corrFight = [
    ['if', 'cs.v5', [['battle', 'corrveyra', { guestsIf: [['brynAlly', 'bryn5'], ['dukeCured', 'captain5']] }]], [
      ['if', 'corrShaken', [['battle', 'corr_shaken', { guestsIf: [['veyraWith', 'veyra5'], ['brynAlly', 'bryn5'], ['dukeCured', 'captain5']] }]],
        [['battle', 'corr', { guestsIf: [['veyraWith', 'veyra5'], ['brynAlly', 'bryn5'], ['dukeCured', 'captain5']] }]]]
    ]],
    ['note', 'Corr goes down on one knee. The circlet slides from his head and rings on the stone, and the four shards go dark.'],
    ['say', 'Ilvane Corr', 'It should have been me. It should have been somebody who knew what to do with it.'],
    ['if', 'dask4=1', [['say', 'Dask', 'You forgave my debt. I am returning the favour. Consider us even, Chancellor. In irons.']]],
    ['if', 'cs.v5', [
      ['note', 'Veyra lies by the door, her grey lamp broken. Maren kneels beside her.'],
      ['say', 'Veyra', 'Still breathing. Of course. You always did pull your blows.'],
      ['say', 'Maren', 'The Wardens will take you home. I will speak at your judgement. Every word.'],
      ['set', 'veyra5', 3], ['set', 'cs.v5', 0]
    ]],
    ['note', 'The Wardens who followed you in take Corr in chains, and take up the four dark shards in a lead-lined box.'],
    ['set', 'corrTaken'],
    ['shake', 400], ['sfx', 'door'],
    ['note', 'Behind you, the last door of the Hollow Barrow swings open on its own.'],
    ['say', '???', 'Come in. Quickly. I am not sure how long I can hold him once he knows it is open.'],
    ['set', 'doorOpen'], ['quest', 'main5', 6], ['xp', 300], ['save']
  ];

  /* ---------- the throne ---------- */
  D.scripts.kingScene = [
    ['note', 'The throne room of the Hollow Barrow. On a throne of black stone sits what is left of Vael Morn, the fifth shard dull on his brow.'],
    ['note', 'Between him and the door stands a woman in a Warden\'s white, with a lamp in her hand. She has been standing there a long time.'],
    ['say', 'Ennet', 'You came. Three hundred years, and somebody came.'],
    ['say', 'Finch', 'You are... the Fifth Lamp.'],
    ['say', 'Ennet', 'Ennet Tallowmere. And you have my sister\'s face. Her nose too, I am sorry to say.'],
    ['say', 'Finch', 'Tallowmere. My grandmother. Her grandmother. All the way back to... she never said. She never sang the end because she did not know it.'],
    ['if', 'verse4', [
      ['say', 'Finch', '"And there she holds the door, and will, until the last lamp lights her home."'],
      ['say', 'Ennet', 'Is that how it goes? I never heard the end. I was busy.']
    ]],
    ['say', 'Vael Morn', 'Ennet. You let them in.'],
    ['say', 'Ennet', 'I let them in, Vael. That was always the point of a door.'],
    ['say', 'Vael Morn', 'Then let them see what they came for. Five of me in one room, for the first time in three hundred years.'],
    ['note', 'The four dark shards in the Wardens\' box flare, and fly to his brow. The King stands.'],
    ['if', 'roadLit', [['note', 'Far behind you, down the Ashen Road, four way-lamps burn. You can feel them at your back like a hand.']]],
    ['battle', 'king', { guestsIf: [['doorOpen', 'ennet'], ['veyraWith', 'veyra5']] }],
    ['set', 'kingDown'],
    ['note', 'Vael Morn falls back onto his throne, and does not rise. The crown slides from his head: five shards, whole for the first time in three hundred years.'],
    ['say', 'Ennet', 'It has to be broken in lamplight, and somebody has to hold it while it breaks. It burns whoever holds it. That was always the price.'],
    ['say', 'Ennet', 'Let me. I am tired, and I would like very much to go home.'],
    ['run', 'ending']
  ];
  D.scripts.ending = [
    ['if', 'verse1&verse2&verse3&verse4&roadLit', [
      ['say', 'Finch', 'Wait. Wait. I have the whole song now. Four stanzas, and every lamp on the road is lit behind us. I think the fifth is not for holding. I think it is for singing.']
    ], [
      ['if', 'verse1&verse2&verse3&verse4', [['say', 'Finch', 'I have the whole verse, but the road behind us is dark. The song needs every lamp to carry it.']],
        [['say', 'Finch', 'If I had the whole song... I only have pieces of it. I am sorry, Ennet.']]]
    ]],
    ['choice', null, 'Who breaks the crown?', [
      ['Finch: sing the fifth stanza', [['run', 'endSong']], 'verse1&verse2&verse3&verse4&roadLit'],
      ['Let Ennet break it', [['run', 'endEnnet']]],
      ['Let Veyra break it', [['run', 'endVeyra']], 'veyraWith']
    ]]
  ];
  D.scripts.endSong = [
    ['say', 'Finch', 'Four lamps they lit to bar the way, and four still burn where kings lie low...'],
    ['note', 'Finch sings the four stanzas he gathered across the valley. Then, for the first time in three hundred years, somebody sings a fifth.'],
    ['say', 'Finch', '"...and when the last lamp lit the road, and four friends brought the singing home, she set it down, the heavy load, and walked out into the morning, and was not alone."'],
    ['note', 'The crown does not burn anyone. It simply comes apart in the light, five pieces into five hundred, into dust, into nothing.'],
    ['say', 'Ennet', '...Not alone. I like that ending. I like it very much.'],
    ['set', 'ending', 1], ['bond', 'finch', 2], ['run', 'finale']
  ];
  D.scripts.endEnnet = [
    ['say', 'Ennet', 'Thank you. Truly.'],
    ['note', 'Ennet lifts the crown in both hands, and her lamp flares white, and the crown breaks. The light is so bright that for a while none of you can see.'],
    ['note', 'When you can see again, there is only her lamp on the floor, still burning, and the dust of a crown.'],
    ['say', 'Finch', '"...until the last lamp lights her home." Goodbye, great-great-aunt. I will finish the song for you.'],
    ['set', 'ending', 2], ['run', 'finale']
  ];
  D.scripts.endVeyra = [
    ['say', 'Veyra', 'No. She has held it for three hundred years. Let her go home on her own feet.'],
    ['say', 'Maren', 'Veyra...'],
    ['say', 'Veyra', 'I put out two lamps, Maren. Let me light one. Just one thing in my life that is not a grave.'],
    ['note', 'Veyra lifts the crown, and her lamp burns white, whiter than any of you has ever seen, and the crown breaks.'],
    ['note', 'When the light fades, Veyra is gone, and Ennet Tallowmere is standing in a doorway with the sun coming in behind her, crying.'],
    ['say', 'Maren', 'Goodbye, my best pupil. You were always the best of us.'],
    ['set', 'ending', 3], ['set', 'veyra5', 1], ['run', 'finale']
  ];
  D.scripts.finale = [
    ['if', 'veyraWith&!ending=3', [['set', 'veyra5', 1]]],
    ['set', 'ch5done'], ['quest', 'main5', 7], ['xp', 500],
    ['run', 'epilogue5']
  ];

  /* ---------- the epilogue ---------- */
  // What became of the valley: one painted scene for each place (src/epilogue.js), with the lines it earned.
  D.epilogueValley = [
    ['brackenford', [
        ['note', 'Brackenford. The Crooked Lantern is louder than it has ever been, which is saying a good deal.'],
        ['if', 'tobiasFree', [['note', 'Warden Tobias is back under his temple lamp, a little thinner, telling everyone about Greyhold whether they ask or not.']],
          [['if', 'shard1Stolen', [['note', 'Warden Tobias never came home from Greyhold. The town lit a lamp for him in the temple window, and keeps it lit.']],
            [['note', 'Warden Tobias keeps his lamp, and his stories, and sits up late with whoever needs him.']]]]],
        ['if', 'silver=1', [['note', 'The grave silver stays where it belongs. Old Pell visits Alder on Sundays.']]],
        ['if', 'ingridAlly', [['note', 'Ingrid the smith hangs a horseshoe over the tavern door. Nobody is allowed to ask why.']]]
    ]],
    ['saltmere', [
        ['if', 'hostagesSaved', [['note', 'Saltmere. Six fishermen who should have drowned go out with the boats every morning, and come back every night.']],
          [['note', 'Saltmere. Six names are painted on the chapel board. The town keeps the lamps lit in the windows for them.']]],
        ['if', 'lightLit', [['note', 'The Saltmere light sweeps the water. Pip has been made assistant keeper, and is unbearable about it.']]]
    ]],
    ['karrow', [
        ['if', 'giant=1', [['note', 'Karrow Hold. Hrimgar sleeps under a lamp that never gutters now. The children leave him songs on the Cairn step.']],
          [['note', 'Karrow Hold. The Cairn is empty and cold, and the clan keeps it anyway, because an oath is an oath.']]],
        ['if', 'runaOath=4', [['note', 'Runa Stonehand goes home in the spring to keep her five winters on the Cairn. She finds that she does not mind at all.']],
          [['if', 'runaOath=2', [['note', 'Runa Stonehand pays one more visit to Karrow Hold, and stays a week, and nobody mentions silver once.']],
            [['note', 'Runa Stonehand goes home to Karrow Hold whenever she likes now. Bryn meets her at the gate every time.']]]]]
    ]],
    ['highmoor', [
        ['if', 'dukeCured', [['note', 'Highmoor. Duke Aldric rides out every morning again, and has had every lamp in the city re-trimmed with clean oil.']],
          [['note', 'Highmoor. With the Duke gone and the Chancellor in chains, the city learns to govern itself. Badly, at first. Then less badly.']]],
        ['if', 'wrenFree', [['note', 'Dask Underbough and his sister Wren open a small counting-house of their own. It lends money at no interest at all, and is somehow still in business.']],
          [['if', 'dask5=1', [['note', 'Dask Underbough burned every debt in Highmoor, and tells anyone who asks that it was the best money he never made.']],
            [['note', 'Dask Underbough owes nobody anything, for the first time in his life. He finds it takes some getting used to.']]]]]
    ]],
    ['wardens', [
        ['if', 'veyra5=1', [
          ['if', 'ending=3', [['note', 'Maren Vale becomes a High Warden. She keeps a white lamp on her desk that she never lets anyone trim but herself.']],
            [['note', 'Maren Vale and Sister Veyra walk the valley together, relighting every ward-lamp the grey oil poisoned. It takes them three years.']]]
        ], [['if', 'veyra5=2', [['note', 'Maren Vale speaks at Veyra\'s judgement for a whole day. The Wardens give Veyra a lamp and a road, and tell her to light every lamp on it.']],
          [['if', 'veyra5=3', [['note', 'Maren Vale visits Veyra in the Wardens\' house every week. One spring, Veyra asks for a lamp of her own to trim.']],
            [['note', 'Maren Vale becomes a High Warden, and teaches her pupils what to do when someone they love is on the other side of the door.']]]]]]]
    ]],
    ['ballad', [
        ['if', 'ending=1', [['note', 'Finch Tallowmere finishes the Ballad of the Five Lamps, and sings it in every tavern in the valley. Ennet Tallowmere sits in the front row and corrects him.']],
          [['if', 'ending=2', [['note', 'Finch Tallowmere finishes the Ballad of the Five Lamps. He sings the last verse only once a year, on the night the crown broke.']],
            [['note', 'Finch Tallowmere finishes the Ballad of the Five Lamps, with a sixth verse nobody asked for, about a Warden in grey who lit one last lamp.']]]]]
    ]],
    ['goblins', [
        ['if', 'grukk3=1', [['note', 'Grukk\'s goblins settle in the north hills, and trade goats with Karrow Hold. Both sides cheat. Both sides seem happy.']]]
    ]],
    ['snik', [
        ['if', 'snik=1', [['note', 'Snik sells eels in Saltmere. Honest eels. Mostly.']]]
    ]]
  ];
  D.scripts.epilogue5 = [
    ['cutscene', [
      ['fade', 'out', 900],
      ['endtally'],
      ['epilogue'],                     // the valley, the hall of windows and the Crooked Lantern, painted (src/epilogue.js)
      ['recap', 'The last chapter', 5],
      ['card', 'Thank you for playing', '', ['Runa, Dask, Maren and Finch', 'will be at the Crooked Lantern,', 'should you ever need them again.']]
    ]],
    ['warp', 'brackenford', 'z', 'up'],
    ['note', 'The Barrow Crown is over. You can keep exploring the valley for as long as you like.'],
    ['save']
  ];

})();
