/* Chapter 3 — The Oath of Stone. Quests, the chronicle of choices, the cast, and the shared scripts.
   Levels 8-12 (cap 12). Main story alone ends one level below the cap; side content earns level 12.

   Decision flags set in this chapter (later chapters read them):
     chapter 3                       set on the north road
     brynTalk, astaTalk              evidence for Finch's argument
     runaOath 1 trial | 2 paid | 3 argued | 4 renewed (owes five winters);  brynAlly (Bryn fights the Giant)
     prisoner 1 handed to the clan | 2 questioned (knowsCourt) | 3 set free (veyraWarned)
     grukk3 1 helped | 2 hired | 3 fought Nagra | 4 talked Nagra down;  tunnelOpen
     scouts3 1 fought | 2 bluffed | 3 bribed
     shardBearer 1 Maren | 2 Runa | 3 Dask | 4 Finch  (only if the Thane's shard is still carried);  shardWeak
     veyra3 1 allied (she asked) | 2 allied (Maren's plea) | 3 fought;  allyVeyra, veyraTurning
     giant 1 sang to sleep | 2 heart-stone taken;  lampLit3
     knowsGiant, veyraOrder, kellDead, verse3, arnSafe, camp3 1-4 */
(function () {
  const D = G.D;
  Object.assign(D.quests, {
    main3: {
      name: 'The Oath of Stone', short: 'Oath of Stone', ch: 3, done: 7, stages: {
        1: 'Karrow Hold. Chief Sigrid is waiting in the Longhall.',
        2: 'No oathbreaker may set foot on the Cairn. Runa must answer her oath before the clan. Speak to Sigrid when she is ready.',
        3: "Runa has answered. Take the north gate into the Frost Pass and climb to the Giant's Cairn. Warden Kell went up and has not come back.",
        4: "The Giant's Cairn. Find Warden Kell, and the way down.",
        5: 'Veyra is below, at the dark Cairn lamp, and the Giant is waking.',
        6: 'The Cairn shard is yours. Return to Sigrid in Karrow Hold.',
        7: 'Karrow Hold has feasted you. The road leads south, to Highmoor.'
      }
    },
    bear: {
      name: 'The White Bear', short: 'White Bear', ch: 3, done: 3, stages: {
        1: 'Eydis the huntress, whose hut is in the south-west of the Frost Pass, says a great white bear dragged her partner Arn into the ice caves under the west cliffs.',
        2: 'Arn is alive and on his way home. Tell Eydis.',
        3: 'Arn is home, and Rimeclaw is dead.'
      }
    },
    watcher: {
      name: "The Watcher's Song", short: "Watcher's Song", ch: 3, done: 3, stages: {
        1: 'Skald Hrolf says the Fifth Lamp kept a watchtower above the frozen lake in the Frost Pass, and that her song is still up there.',
        2: 'Finch has the third stanza. Skald Hrolf will want to hear it.',
        3: 'Hrolf has heard the third stanza. Karrow Hold will sing it at the feast.'
      }
    },
    prisoner: {
      name: 'The Prisoner', short: 'The Prisoner', ch: 3, done: 2, stages: {
        1: 'The clan holds a Pale Hand prisoner in the cells. Sigrid will let you decide what becomes of him.',
        2: 'The prisoner has been dealt with.'
      }
    },
    goblins: {
      name: "Grukk's Kin", short: "Grukk's Kin", ch: 3, done: 2, stages: {
        1: 'There are goblins camped in the Frost Pass, west of the trail between the ridges. They look like Grukk\'s people.',
        2: "Grukk's kin have been dealt with, and their tunnel past the Pale Hand camp is open."
      }
    }
  });

  D.chronicle = (D.chronicle || []).concat([
    ['runaOath=1', 'Runa stood the trial in the Ring of Stones, and Bryn walked out of it beside her.', 3],
    ['runaOath=2', 'Runa paid the stone-price. The clan took it and said nothing kind.', 3],
    ['runaOath=3', 'Finch argued that Runa kept her oath the night she dug Bryn out of the snow, and the clan agreed.', 3],
    ['runaOath=4', 'Runa swore the Oath of Stone again. When the crown is broken, she owes the Cairn five more winters.', 3],
    ['prisoner=1', 'You gave the Pale Hand prisoner to the clan.', 3],
    ['prisoner=2', 'You questioned the prisoner, and learned the Hand has a friend at the Duke\'s court.', 3],
    ['prisoner=3', 'Maren set the prisoner free, with a message for Veyra.', 3],
    ['grukk3=1', 'Grukk paid his debt, and showed you the tunnel past the Pale Hand camp.', 3],
    ['grukk3=2', 'You paid Grukk for his tunnel. He counted it twice.', 3],
    ['grukk3=3', "You fought Nagra for her brother's camp.", 3],
    ['grukk3=4', "Finch talked Nagra out of her brother's blood-debt.", 3],
    ['q.bear>=3', 'Rimeclaw is dead, and Arn is home with Eydis.', 3],
    ['verse3', 'Finch found the third stanza in the watchtower of the Fifth Lamp: she took the key into the deep.', 3],
    ['shardBearer=1', "The Thane's shard whispered to Maren in the Cairn. She kept it.", 3],
    ['shardBearer=2', "The Thane's shard whispered in the Cairn. Runa carries it now.", 3],
    ['shardBearer=3', "The Thane's shard whispered in the Cairn. Dask carries it now.", 3],
    ['shardBearer=4', "The Thane's shard whispered in the Cairn. Finch carries it now.", 3],
    ['veyra3=1', 'Veyra asked for your help against the Giant, and fought beside you. Then she let you take the shard.', 3],
    ['veyra3=2', 'Maren talked Veyra into fighting beside you. Then she let you take the shard.', 3],
    ['veyra3=3', 'You fought Veyra in the Cairn, and she fled wounded.', 3],
    ['giant=1', 'Finch sang Hrimgar the Sleeper back to sleep, and the Cairn lamp burns again.', 3],
    ['giant=2', "You took Hrimgar's heart-stone. The Cairn will not sleep again.", 3],
    ['camp3=1', 'In Karrow Hold, Runa sat up with Dask.', 3],
    ['camp3=2', 'In Karrow Hold, Runa sat up with Maren.', 3],
    ['camp3=3', 'In Karrow Hold, Runa sat up with Finch.', 3],
    ['camp3=4', "In Karrow Hold, Runa sat alone by her mother's cairn.", 3]
  ]);

  Object.assign(D.speakers, {
    Sigrid: '#e8c8a0', Bryn: '#e8a868', Ragna: '#f0b890', Thora: '#c8c8d4', Ulf: '#b8a888', 'Skald Hrolf': '#d8c8f0', Asta: '#d0d8e8',
    Eydis: '#a8d8c8', Arn: '#c8b898', 'Warden Kell': '#f2e3a0', Grukk: '#a8c860', Nagra: '#98c070', 'Hrimgar': '#a8c8e8',
    'Clan Guard': '#c8b8a8', 'The Barrow King': '#c8b8e8', Prisoner: '#d6d6e4', 'The Last Watcher': '#a8b8d8'
  });
  Object.assign(D.sprites, {
    sigrid: { skin: '#e0a67c', hair: '#d8d0c0', long: 1, top: '#5a2a2a', robe: 1, trim: '#e8c14a' },
    ragna: { skin: '#e8b890', hair: '#c8572e', long: 1, top: '#6a4a3a', robe: 1 },
    thora: { skin: '#c98e62', hair: '#2a1a12', top: '#4a4a54', legs: '#3a3028', trim: '#8a5d38' },
    ulf: { skin: '#e8b890', bald: 1, beard: 1, hair: '#c8a050', top: '#7a5a3a', legs: '#3a3028' },
    hrolf: { skin: '#e0a67c', hair: '#e8e8e8', beard: 1, top: '#4a3a6a', robe: 1 },
    asta: { skin: '#e0c0a0', hair: '#d8d8d0', long: 1, top: '#3a4a5a', robe: 1 },
    eydis: { skin: '#e0a67c', hair: '#3a2a1e', long: 1, top: '#5a6a4a', legs: '#3a3028' },
    arn: { skin: '#e8b890', hair: '#8a5a2a', beard: 1, top: '#6a5a4a', legs: '#3a3028' },
    kell: { skin: '#d8b090', hair: '#8a8a8a', top: '#d8d4c8', robe: 1, trim: '#e8c14a' },
    clanguard: { skin: '#e0a67c', hair: '#6b3f2a', beard: 1, top: '#5a3a2a', legs: '#3a3028', helm: '#8a8a94' },
    kid3: { skin: '#e8b890', hair: '#e8c14a', top: '#7a3a3a', legs: '#3a3028' },
    hunter3: { skin: '#c98e62', hair: '#2a1a12', beard: 1, top: '#5a4a3a', legs: '#3a3028', hat: '#7a6a5a' }
  });

  /* ---------- Runa's oath, before the clan ---------- */
  D.scripts.oath = [
    ['say', 'Sigrid', 'Then answer, Runa Stonehand. The clan is listening.'],
    ['choice', null, 'How does Runa answer her oath?', [
      ['Stand the trial in the Ring', [['run', 'oathTrial']]],
      ['Pay the stone-price (300 gold)', [
        ['gold', -300],
        ['say', 'Runa', 'Three hundred. Count it.'],
        ['say', 'Sigrid', 'The clan takes the price. The clan does not have to like it.'],
        ['set', 'runaOath', 2], ['xp', 340], ['bond', 'dask', -1]
      ], 'gold>=300'],
      ['Dask: haggle the stone-price down', [['check', 'dask', 16, [
        ['say', 'Dask', 'Three hundred for an oath sworn at sixteen, by a child, under duress, with no written terms? I would not pay that for a horse.'],
        ['say', 'Sigrid', '...Two hundred. And I will remember your face, halfling.'],
        ['gold', -200], ['set', 'runaOath', 2], ['xp', 340], ['bond', 'dask', 1]
      ], [
        ['say', 'Sigrid', 'Three hundred, halfling, or the Ring. Choose.'],
        ['run', 'oath']
      ]]], 'gold>=200'],
      ['Finch: argue that the oath was kept', [['check', 'finch', [18, ['brynTalk', -3], ['astaTalk', -3], ['knowsGiant', -1]], [
        ['say', 'Finch', 'Chief. What is the Oath of Stone for? To keep the dead in the Cairn, so the living stay living.'],
        ['say', 'Finch', 'On the night Runa left her post, the living were under the snow. She kept the oath. She just kept it in the wrong place.'],
        ['if', 'astaTalk', [['say', 'Asta', 'Hallvard said the same, the night before he died. He said the girl did right.']]],
        ['if', 'brynTalk', [['say', 'Bryn', 'I was under that snow. I say she kept it.']]],
        ['say', 'Sigrid', '...The clan has heard. The oath is answered. Welcome home, niece.'],
        ['set', 'runaOath', 3], ['set', 'brynAlly'], ['bond', 'finch', 1], ['xp', 340]
      ], [
        ['say', 'Finch', 'Chief, consider what an oath is really for...'],
        ['say', 'Sigrid', 'Pretty words, singer. The clan does not eat words. The Ring, then.'],
        ['run', 'oathTrial']
      ]]]],
      ['Runa: swear the oath again', [
        ['say', 'Runa', 'I broke the Oath of Stone. I will not buy it back and I will not argue it.'],
        ['say', 'Runa', 'I swear it again. Five winters on the Cairn, when the crown is broken for good. My word, before the clan.'],
        ['say', 'Maren', 'Runa...'],
        ['say', 'Sigrid', 'Five winters. Witnessed.'],
        ['note', 'Sigrid opens her fist. In it is a river pebble with RUNA scratched into it in a child\'s hand.'],
        ['say', 'Sigrid', 'You left this on the Cairn step the night you ran. I kept it. Carry it until you come back.'],
        ['give', 'oathstone'], ['set', 'runaOath', 4], ['set', 'brynAlly'], ['xp', 340]
      ]]
    ]],
    ['quest', 'main3', 3],
    ['say', 'Sigrid', 'Now. The Cairn. Take the north gate and climb. Find Kell, and find out who is killing my lamp.']
  ];
  D.scripts.oathTrial = [
    ['say', 'Runa', 'I will stand in the Ring.'],
    ['say', 'Sigrid', 'Bryn. You have waited eleven years for this.'],
    ['say', 'Bryn', 'I have.'],
    ['battle', 'trial'],
    ['say', 'Bryn', '...You still hit like a rockslide.'],
    ['say', 'Bryn', 'You dug me out with your hands. You left before I could thank you. That is what I was angry about. Only that.'],
    ['say', 'Sigrid', 'The clan has seen. The oath is answered.'],
    ['set', 'runaOath', 1], ['set', 'brynAlly']
  ];

  /* ---------- the whisper of the Thane's shard (only if the party still carries it) ---------- */
  D.scripts.whisper = [
    ['note', "The Thane's shard turns cold, then hot. A voice that is not a voice: \"Little Warden. Three of me, so close. Bring me home.\""],
    ['choice', 'Maren', '(The shard is whispering to Maren.)', [
      ['Maren: hold on to it, and resist', [['check', 'maren', [16, ['marenHope=1', -2], ['rite', -2], ['verse2', -1]], [
        ['say', 'Maren', 'No. I know your voice now. Be quiet.'],
        ['note', 'The shard goes still.'],
        ['set', 'shardBearer', 1], ['bond', 'maren', 1]
      ], [
        ['say', 'Maren', '...Runa. I can hear him. He sounds so tired.'],
        ['note', 'The voice fills the barrow. Every one of you hears it now. It leaves you shaking.'],
        ['set', 'shardBearer', 1], ['set', 'shardWeak']
      ]]]],
      ['Runa takes it', [['say', 'Runa', 'Give it here. He can shout at me. I have been shouted at by better.'], ['lose', 'shardworn'], ['give', 'shardworn'], ['set', 'shardBearer', 2]]],
      ['Dask takes it', [['say', 'Dask', 'I have been ignoring creditors for six years. One more voice in my head will not matter.'], ['lose', 'shardworn'], ['give', 'shardworn'], ['set', 'shardBearer', 3], ['bond', 'dask', 1]]],
      ['Finch takes it', [['say', 'Finch', 'A dead king who wants to talk? Finally, an audience.'], ['lose', 'shardworn'], ['give', 'shardworn'], ['set', 'shardBearer', 4], ['bond', 'finch', 1]]]
    ]],
    ['if', 'shardBearer>=2', [['note', 'The shard is in the bag now. Equip it from the Gear menu if you want its power.']]]
  ];

  /* ---------- the barrow: Veyra, the Giant ---------- */
  D.scripts.cairnScene = [
    ['quest', 'main3', 5],
    ['note', 'The barrow of the Giant. On a bier of blue ice lies a man the size of a cottage, and over him, a lamp that has gone dark.'],
    ['note', 'Veyra stands at the lamp with two Reavers. The Giant\'s chest is rising. Slowly. Then less slowly.'],
    ['if', 'brynAlly', [['say', 'Bryn', 'I followed you up. Somebody had to keep the Cairn with you.']]],
    ['if', 'shardAt=2&!shardTraded', [['run', 'whisper']]],
    ['if', 'veyraDoubt', [['run', 'veyraAsks']], [['if', 'prisoner=3', [['run', 'veyraAsks']], [['run', 'veyraStands']]]]],
    ['shake', 600], ['sfx', 'hit'],
    ['say', 'Hrimgar', 'WHO... PUT OUT... MY LAMP?'],
    ['if', 'allyVeyra', [['say', 'Veyra', 'Not me. I swear it, Maren. Not this one.']]],
    ['if', 'brynAlly&allyVeyra', [['battle', 'giant', { guests: ['bryn', 'veyra'] }]], [
      ['if', 'brynAlly', [['battle', 'giant', { guests: ['bryn'] }]], [
        ['if', 'allyVeyra', [['battle', 'giant', { guests: ['veyra'] }]], [['battle', 'giant']]]
      ]]
    ]],
    ['run', 'giantDown']
  ];
  D.scripts.veyraAsks = [
    ['say', 'Veyra', 'Maren. I hoped it would be you.'],
    ['if', 'prisoner=3', [['say', 'Veyra', 'Your prisoner found me. He said you sent him with a message: that you would come in peace, if I let you.']]],
    ['say', 'Veyra', 'Someone has been feeding this lamp grey oil for a year. Not me. I came for the shard, and I find I cannot let him walk.'],
    ['choice', null, 'Veyra is asking for help.', [
      ['Fight beside her', [
        ['say', 'Maren', 'Then stand with me. Like you used to.'],
        ['note', 'Veyra sends her Reavers away. They go, glancing back.'],
        ['set', 'veyra3', 1], ['set', 'allyVeyra'], ['bond', 'maren', 1], ['xp', 600]
      ]],
      ['Refuse, and take the shard from her', [
        ['say', 'Dask', 'Not a chance. You have lied to us twice.'],
        ['say', 'Veyra', 'Three times, if you count the sluice. Very well.'],
        ['run', 'veyraFight']
      ]]
    ]]
  ];
  D.scripts.veyraStands = [
    ['say', 'Veyra', 'Stay back, all of you. The shard is mine, and the Giant is not your concern.'],
    ['choice', null, 'Veyra will not move from the lamp.', [
      ['Maren: plead with her', [['check', 'maren', [17, ['veyra=1', -3], ['marenHope=1', -2], ['knowsBrother', -2], ['hostagesSaved', -1], ['verse2', -1], ['veyraOrder', -2]], [
        ['say', 'Maren', 'Look at him, Veyra. If he wakes, the Hold dies first. Odric\'s sister does not let a village die.'],
        ['say', 'Veyra', '...How do you know his name?'],
        ['say', 'Maren', 'I read it on his grave. You left flowers.'],
        ['note', 'Veyra lowers her lamp. She sends her Reavers away.'],
        ['say', 'Veyra', 'Then help me hold him down. After that, we will see.'],
        ['set', 'veyra3', 2], ['set', 'allyVeyra'], ['bond', 'maren', 2], ['xp', 600]
      ], [
        ['say', 'Maren', 'Veyra, please. Look at what is waking.'],
        ['say', 'Veyra', 'I see it. I see you, too. No.'],
        ['run', 'veyraFight']
      ]]]],
      ['Fight her', [['run', 'veyraFight']]]
    ]]
  ];
  D.scripts.veyraFight = [
    ['battle', 'veyra3'],
    ['note', 'Veyra goes down on one knee. Grey lamplight flares, and when it clears she is at the far door, bleeding.'],
    ['say', 'Veyra', 'Keep the shard, then. Keep him asleep, if you can. I could not.'],
    ['note', 'She is gone. Behind you, the ice on the bier cracks.'],
    ['say', 'Maren', 'Breathe. All of you. Quickly.'],
    ['heal'],
    ['set', 'veyra3', 3], ['set', 'veyraGone3'], ['bond', 'dask', 1]
  ];
  D.scripts.giantDown = [
    ['note', 'Hrimgar goes down on one knee, and the barrow shakes. His eyes are the grey of old ice, and very tired.'],
    ['say', 'Hrimgar', 'The Lamp of the North... sang me down... a long time ago. I liked her song. I liked the dark.'],
    ['choice', null, 'Hrimgar is beaten. What now?', [
      ['Finch: sing him back to sleep', [
        ['if', 'verse1&verse2', [
          ['say', 'Finch', 'Four lamps they lit to bar the way, and four still burn where kings lie low...'],
          ['say', 'Finch', 'She held it through the longest night, and asked no crown, and took no throne...'],
          ['say', 'Hrimgar', '...Her song. That is her song.'],
          ['bond', 'finch', 1]
        ], [['check', 'finch', [16, ['knowsGiant', -3], ['verse1', -2], ['verse2', -2]], [
          ['say', 'Finch', 'Hush now, old one. The lamps are lit and the door is kept. Sleep.'],
          ['say', 'Hrimgar', '...Not her song. But kind.']
        ], [
          ['say', 'Finch', 'Hush now... ah. I do not know her words.'],
          ['say', 'Maren', 'Then sing his, and I will say the rite under it.'],
          ['note', 'Between them, it is enough.']
        ]]]],
        ['note', 'Hrimgar lies back on the ice. He opens one great hand. In the palm is the third shard of the crown.'],
        ['give', 'shard3'],
        ['say', 'Maren', 'Lamplighter, who keeps the door: here is a little light for one who sleeps.'],
        ['sfx', 'magic'], ['set', 'lampLit3'], ['heal'],
        ['note', 'The Cairn lamp catches and burns blue-white. The Giant sleeps.'],
        ['set', 'giant', 1], ['xp', 100]
      ]],
      ["Take his heart-stone", [
        ['say', 'Dask', 'That stone in his chest. It is keeping him alive. And it is worth more than Highmoor.'],
        ['if', 'runaOath=4', [['say', 'Runa', 'I swore to keep him. ...Do it. He is suffering.']], [['say', 'Runa', 'Do it quickly.']]],
        ['note', 'Hrimgar does not fight it. He sighs, and the sigh goes on until it is only wind, and then there is only ice where he was.'],
        ['note', 'In the ice: a heart-stone the size of a fist, and the third shard.'],
        ['give', 'giantheart'], ['give', 'shard3'],
        ['say', 'Maren', 'The lamp will not take. There is nothing left here for it to keep.'],
        ['set', 'giant', 2], ['xp', 100]
      ]]
    ]],
    ['if', 'allyVeyra', [
      ['say', 'Veyra', 'Keep it. The shard. Before I change my mind.'],
      ['say', 'Maren', 'Come with us.'],
      ['say', 'Veyra', 'Not yet. I need to think, somewhere very far from Highmoor. Someone there wants all five, and I am no longer sure it is for the reason he told me.'],
      ['note', 'She goes up the stair alone.'],
      ['set', 'veyraTurning'], ['set', 'veyraGone3']
    ]],
    ['set', 'cr2.done'], ['quest', 'main3', 6], ['save']
  ];
  D.scripts.cairnHome = [
    ['fade', 'out', 500],
    ['note', 'You come down out of the Frost Pass in the blue hour, and Karrow Hold has every lamp lit to meet you.'],
    ['warp', 'karrow', 'a', 'down']
  ];

  /* ---------- the night in the Longhall ---------- */
  D.scripts.camp3 = [
    ['warp', 'k_hall', 'p', 'up'],
    ['note', 'The feast goes on until the fire is low. Then it is only the four of you, and the snow at the shutters.'],
    ['choice', null, 'Who does Runa sit up with?', [
      ['Dask', [
        ['say', 'Dask', 'Highmoor next. Orrin and Sons. My paper, my sister, and a counting-house that pays the Pale Hand\'s bills.'],
        ['if', 'daskDebt=1', [['say', 'Dask', 'You said when they come to collect, they collect from four. I am going to hold you to that, Stonehand.']],
          [['say', 'Dask', 'You told me to pay it and be free. I have the gold now. I am not sure paying is what I want any more.']]],
        ['say', 'Runa', 'We walk in together.'],
        ['say', 'Dask', 'Together. And out again. That part is important.'],
        ['set', 'camp3', 1], ['boon', 'dask', 'spd', 1]
      ]],
      ['Maren', [
        ['if', 'allyVeyra', [['say', 'Maren', 'She fought beside me, Runa. Like she used to. And then she walked away again.']],
          [['say', 'Maren', 'She bled on the Cairn stair. I keep wondering who bound it for her.']]],
        ['if', 'marenHope=1', [['say', 'Maren', 'You told me she could still be turned. I think she is turning. I think it is going to hurt her very much.']],
          [['say', 'Maren', 'You told me not to let her choice make mine. I am trying.']]],
        ['set', 'camp3', 2], ['boon', 'maren', 'save', 1]
      ]],
      ['Finch', [
        ['if', 'verse3', [['say', 'Finch', '"She took the key into the deep, and turned it, and was not seen but..." But what? The stanza stops. My grandmother stopped there too.']],
          [['say', 'Finch', 'Three shards, three barrows, and I still do not know how the song ends.']]],
        ['if', 'finchSong=1', [['say', 'Finch', 'You said we would find the ending. We are close. I can feel it in my teeth.']],
          [['say', 'Finch', 'You said some songs end badly. I am beginning to think this one ends in a door.']]],
        ['set', 'camp3', 3], ['boon', 'finch', 'save', 1]
      ]],
      ["No one. Walk to her mother's cairn.", [
        ['note', "Runa's mother is buried on the hill above the Hold, under a cairn Runa helped build at twelve. The snow has never quite covered it."],
        ['if', 'runaOath=4', [['note', 'Five more winters. Runa finds she does not mind. It is the first promise she has made in eleven years that she means to keep.']],
          [['note', 'The clan has let her come home. She is not sure yet that she is staying.']]],
        ['set', 'camp3', 4], ['boon', 'runa', 'hp', 8]
      ]]
    ]],
    ['inn', 0]
  ];
})();
