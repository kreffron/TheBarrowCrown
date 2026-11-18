/* Chapter 1 — Brackenford and its interiors. */
(function () {
  const M = G.D.maps;

  M.brackenford = {
    name: 'Brackenford', ground: 'grass', ground2: 'flowers', music: 'town', bg: 'town',
    rows: [
      'TTTTTTTTTTTTTTTTTTTnnTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTT::TTTTTTTTTTTTTTTTTTT',
      'TT.......,........5::.......,.........TT',
      'T..^^^^^^^^^.......::....^^^^^^^......,T',
      'T..^^^^^^^^^...L...::....^^^^^^^.......T',
      'T..^^^^^^^^^.......::....^^^^^^^...T...T',
      'T..WNWWaWWNW..s....::....WNWbWNW.......T',
      'T.....g:h..........::.......:..........T',
      'T,....f::::::::::::::::::::::......B...T',
      'T...........2......::..................T',
      'T...FFFFFFF........::......^^^^^^......T',
      'T...FG.G.GF....,...::......^^^^^^..,...T',
      'T...F.....F........::......WNcWNW......T',
      'T...FG.G.xF...w.q..::........:.........T',
      'T...F.....::::::::::::::::::::.........T',
      'T...FFFFFFF.3......::..................T',
      'T..................::....,.............T',
      'T.^^^^^^^..........::.......^^^^^..B...T',
      'T.^^^^^^^....,.....::.......^^^^^......T',
      'T.^^^^^^^..........::.......WNdWW......T',
      'T.SHSeSHS..........::.........:........T',
      'T....:.............::......74.:........T',
      'T....::::::::::::::::::::::::::........T',
      'T..,............rmiljop................T',
      'T..........B.......::.6.......T........T',
      'T................yuztv.................T',
      '~~~~~~~~~~~~~~~~~~~kk~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    things: {
      g: { type: 'npc', sprite: 'dask', if: 'cs.morning', dir: 'right' },
      w: {
        type: 'obj', gfx: 'well', script: [['if', 'cisternFound', [
          ['choice', null, 'The rope still hangs down the well.', [['Climb down', [['warp', 'cistern', 'u', 'down']]], ['Not now', []]]]
        ], [
          ['note', 'The town well. The rope is new, and the stones under it are scratched white, as if something heavy has been hauled up and down.'],
          ['say', 'Dask', 'Nobody hauls buckets that heavy. Someone is using this well for more than water.'],
          ['set', 'cisternFound'],
          ['choice', null, 'Climb down the rope?', [['Climb down', [['warp', 'cistern', 'u', 'down']]], ['Not now', []]]]
        ]]]
      },
      h: { type: 'npc', sprite: 'maren', if: 'cs.morning', dir: 'left' },
      f: { type: 'npc', sprite: 'finch', if: 'cs.morning', dir: 'up' },
      n: { type: 'warp', to: 'thornwood', at: 's', under: 'path', out: 'down' },
      a: { type: 'warp', to: 'tavern', at: 'x', gfx: 'door', under: 'timber', out: 'down' },
      b: { type: 'warp', to: 'shop', at: 'x', gfx: 'door', under: 'timber', out: 'down' },
      c: { type: 'warp', to: 'smithy', at: 'x', gfx: 'door', under: 'timber', out: 'down' },
      e: { type: 'warp', to: 'temple', at: 'x', gfx: 'doorStone', under: 'stonewall', out: 'down' },
      d: { type: 'sign', gfx: 'door', under: 'timber', text: "Wenna and Garrick's house. Nobody answers." },
      s: { type: 'sign', text: 'THE CROOKED LANTERN. Beds, stew, no goblins.' },
      q: { type: 'sign', gfx: 'notice', text: 'WANTED: capable folk for goblin trouble. See Reeve Halda at the Crooked Lantern. — LOST: one woodcutter. Answers to Garrick.' },
      u: { type: 'sign', script: [['if', 'bridgeMended', [['note', 'The bridge is mended. The road south leads to Saltmere.']], [['note', 'Bridge out. Road to Saltmere closed by order of the Reeve.']]]] },
      k: { type: 'obj', gfx: 'brokenBridge', gfxIf: ['bridgeMended', 'bridge'], under: 'water', script: [['if', 'ch1done&bridgeMended', [['run', 'ch2road']], [['if', 'bridgeMended', [['note', 'New planks, still pale. The road to Saltmere opens in Chapter Two.']], [['note', 'The spring floods took the middle of the bridge. Men from Highmoor are due to mend it.']]]]]] },
      z: { type: 'mark', under: 'path' },
      // the farewell at the end of Chapter One (data/ch1/epilogue.js)
      r: { type: 'npc', sprite: 'tam', if: 'cs.farewell', dir: 'down' },
      m: { type: 'npc', sprite: 'pell', if: 'cs.farewell&q.grave>=3', dir: 'down' },
      i: { type: 'npc', sprite: 'halda', if: 'cs.farewell', dir: 'down', under: 'grass' },
      l: { type: 'npc', sprite: 'tobias', if: 'cs.farewell', dir: 'down', under: 'path' },
      j: { type: 'npc', sprite: 'ingrid', if: 'cs.farewell&ingridAlly', dir: 'down', under: 'path' },
      o: { type: 'npc', sprite: 'garrick', if: 'cs.farewell&q.wood>=2', dir: 'down' },
      p: { type: 'npc', sprite: 'wenna', if: 'cs.farewell&q.wood>=2', dir: 'down' },
      y: { type: 'npc', sprite: 'finch', if: 'cs.farewell', dir: 'up' },
      t: { type: 'npc', sprite: 'dask', if: 'cs.farewell', dir: 'up', under: 'path' },
      v: { type: 'npc', sprite: 'maren', if: 'cs.farewell', dir: 'up' },
      x: {
        type: 'obj', gfx: 'graveOpen', script: [['if', 'graveSeen', [['note', 'ALDER PELL. An empty grave. The earth was pushed up from below.']], [
          ['note', 'An open grave. The headstone reads ALDER PELL. It has toppled inward.'],
          ['check', 'maren', 11, [
            ['say', 'Maren', 'No spade marks on the outside. This earth was pushed up from below. He was not dug out. He climbed.'],
            ['say', 'Dask', 'And the goblins rob whatever is left behind. Efficient.'],
            ['xp', 15]
          ], [['say', 'Maren', "The rain has muddied it. I can't tell what happened here, only that I don't like it."]]],
          ['set', 'graveSeen'], ['quest', 'grave', 1]
        ]]]
      },
      5: {
        type: 'npc', sprite: 'hobb', dir: 'down', script: [['if', 'q.bounty>=2', [['say', 'Hobb', 'Road is quieter already. Mostly.']], [
          ['if', 'q.bounty=1&item.pelt>=3', [
            ['say', 'Hobb', 'Three pelts. That is three fewer wolves sniffing at my gate. The town pays, and I pay it gladly.'],
            ['take', 'pelt', 3], ['gold', 45], ['xp', 50], ['quest', 'bounty', 2]
          ], [['if', 'q.bounty=1', [['say', 'Hobb', 'Three pelts and the bounty is yours. Wolves keep off the road, so you will have to step off it to find them.']], [
            ['say', 'Hobb', 'Thornwood is through here. Stay on the road and the wolves mostly leave you be. Step off it and, well. You look like you can handle "well".'],
            ['say', 'Hobb', 'In fact, the town pays a bounty on wolves this season. Bring me three pelts and it is yours.'],
            ['quest', 'bounty', 1]
          ]]]]
        ]]]
      },
      2: { type: 'npc', sprite: 'tam', wander: true, unless: 'cs.farewell', script: [['say', 'Tam', 'I saw a goblin! It had a spade! What does a goblin want with a spade?'], ['say', 'Tam', 'And the well talks at night. Squeaky talking. Mum says it is the wind. It is not the wind.']] },
      3: {
        type: 'npc', sprite: 'pell', dir: 'left', unless: 'cs.farewell', script: [
          ['if', 'q.grave>=3', [['say', 'Old Pell', 'I buried him again this morning. Deeper. And I sat with him a while, which I did not do the first time.']], [
            ['if', 'item.tinring', [['run', 'pellRing']], [
              ['say', 'Old Pell', 'Forty years I have dug for this town, and never once had to fill a hole in twice. Now look. Last row, by the fence.'],
              ['say', 'Old Pell', "That one is my brother Alder's. Three winters dead. I put a tin ring on his finger myself, because he had pawned the silver one."],
              ['say', 'Old Pell', 'If you see him, up there... no. Never mind an old fool. The dead do not walk.'],
              ['quest', 'grave', 1]
            ]]
          ]]
        ]
      },
      6: {
        type: 'npc', sprite: 'farmer', wander: true, script: [['if', 'q.nest>=3', [['say', 'Farmer', 'First week in a month without webs in the barn. You have my thanks.']], [
          ['if', 'q.nest=2', [
            ['say', 'Farmer', 'The big one is dead? Truly? Then here. It is not much, but it is honest.'],
            ['gold', 30], ['give', 'draught', 2], ['xp', 40], ['quest', 'nest', 3]
          ], [['if', 'q.nest=1', [['say', 'Farmer', 'North-west of the forest road, past where Garrick cuts. Follow the webs.']], [
            ['say', 'Farmer', "Bridge went in the spring floods, and now spiders in the barn. There is a mother of them in a hollow in Thornwood, north-west, past the old oaks. Big as a cart."],
            ['say', 'Farmer', 'Kill her and the little ones scatter. I would pay what I could.'],
            ['quest', 'nest', 1]
          ]]]]
        ]]]
      },
      7: { type: 'npc', sprite: 'garrick', if: 'q.wood>=2', unless: 'cs.farewell', dir: 'down', script: [['say', 'Garrick', 'Grey robes, I tell you. Paying goblins by the sackful for old silver. And one black bit of iron they wanted more than all the rest.']] },
      4: {
        type: 'npc', sprite: 'wenna', dir: 'down', unless: 'cs.farewell', script: [
          ['if', 'q.wood>=3', [['say', 'Wenna', "He's asleep with his boots on. I'm not waking him for anything short of another goblin."]], [
            ['if', 'q.wood=2', [
              ['say', 'Wenna', 'You found him! He came limping in an hour ago, talking about wolves and grey robes.'],
              ['say', 'Wenna', 'Take his old axe. Timberfall. He says it wants someone who will swing it at more than trees.'],
              ['give', 'timberfall'], ['quest', 'wood', 3]
            ], [
              ['if', 'q.wood=1', [['say', 'Wenna', 'West of the forest road, that is where he cuts. Please.']], [
                ['say', 'Wenna', 'Are you the ones the reeve hired? My Garrick went into Thornwood two days ago and never came back.'],
                ['say', 'Wenna', 'He cuts west of the forest road, where the old oaks are. If you are going that way...'],
                ['say', 'Runa', "We'll look."],
                ['quest', 'wood', 1]
              ]]
            ]]
          ]]
        ]
      }
    }
  };

  M.tavern = {
    name: 'The Crooked Lantern', ground: 'wood', music: 'town', bg: 'tavern',
    rows: [
      '##################',
      '#UU.K.b.KK...Y..e#',
      '#...CCCCCCCv.....#',
      '#.........y.w....#',
      '#.A1.........Ai..#',
      '#................#',
      '#...k............#',
      '#..jAl.......Ag..#',
      '#...p............#',
      '#.X......V..f..A.#',
      '#.U...o.hV.......#',
      '########x#########'
    ],
    things: {
      x: { type: 'warp', to: 'brackenford', at: 'a', gfx: 'mat', out: 'up', script: [['if', 'tut&!joined', [['say', 'Runa', 'Not leaving. Not tonight.'], ['walk', 'u'], ['end']]]] },
      p: { type: 'mark' },
      j: { type: 'npc', sprite: 'dask', unless: 'joined', dir: 'right', script: [['run', 'tutDask']] },
      k: { type: 'npc', sprite: 'maren', unless: 'joined', dir: 'down', script: [['run', 'tutMaren']] },
      l: { type: 'npc', sprite: 'finch', unless: 'joined', dir: 'left', script: [['run', 'tutFinch']] },
      i: { type: 'npc', sprite: 'ingrid', unless: 'joined', dir: 'left', script: [['run', 'tutIngrid']] },
      v: { type: 'npc', sprite: 'vosk', if: 'cs.vosk', unless: 'vosksGone', dir: 'left', script: [['run', 'tutBrannoc']] },
      w: { type: 'npc', sprite: 'bruiser', if: 'cs.vosk', unless: 'vosksGone', dir: 'left', script: [['say', 'Vosk Bruiser', 'Brannoc says you are leaving. So you are leaving.']] },
      y: { type: 'npc', sprite: 'bruiser', if: 'cs.vosk', unless: 'vosksGone', dir: 'left', script: [['say', 'Vosk Bruiser', '...Is that the smith in the corner? Nobody said anything about the smith.']] },
      h: { type: 'npc', sprite: 'halda', if: 'cs.halda', unless: 'joined', dir: 'up' },
      e: { type: 'obj', gfx: 'barrel', script: [['run', 'tutCask']] },
      o: { type: 'obj', gfx: 'coatstand', gfxIf: ['vosksGone', 'coatEmpty'], script: [['run', 'tutCoat']] },
            b: {
        type: 'npc', sprite: 'bram', script: [['if', 'tut&!joined', [['say', 'Bram', 'If this turns into a fight, break them, not my chairs.'], ['end']]], ['choice', 'Bram', "Welcome to the Crooked Lantern. A bed is ten gold, and the stew is free if you don't ask what's in it.", [
          ['Rest (10 gold)', [['if', 'gold>=10', [['inn', 10], ['say', 'Bram', 'Morning. You all snore, by the way.']], [['say', 'Bram', "Ten gold. I'm generous, not daft."]]]]],
          ['Any news?', [['say', 'Bram', "Old Pell swears one of his graves was dug open from the inside. I told him to lay off my ale. Trouble is, he doesn't drink my ale."]]],
          ['Nothing, thanks', []]
        ]]]
      },
            1: {
        type: 'npc', sprite: 'halda', dir: 'down', if: 'joined', script: [
          ['if', 'q.main>=6', [['say', 'Halda', "Brackenford owes you. Go and see Tobias, if you haven't. He has that look."]], [
            ['if', 'q.main=5', [
              ['if', 'grukk=3', [['say', 'Halda', 'The chief is dead? And the graves?']], [
                ['say', 'Halda', 'Gone? The whole warren, just walked out of the hills?'],
                ['say', 'Runa', 'Their chief had a change of heart.']
              ]],
              ['if', 'lampLit', [['say', 'Maren', 'The lamp is lit again. Your dead will rest.']], [['say', 'Maren', 'The barrow lamp is still dark. I mean to go back and light it before we leave.']]],
              ['if', 'item.silver', [
                ['choice', null, "The sack of grave silver is still on Dask's shoulder.", [
                  ['Hand it over to the reeve', [
                    ['say', 'Runa', 'This came out of your churchyard. It should go back in.'],
                    ['say', 'Halda', 'Every piece? ...I had written this off. So had everyone. I will see each one back in the right ground.'],
                    ['say', 'Halda', 'Odo and Ingrid will hear who brought it home. I expect their prices will remember it.'],
                    ['take', 'silver'], ['set', 'silver', 1], ['gold', 30], ['bond', 'maren', 1]
                  ]],
                  ['Say nothing', [['say', 'Dask', '(Not a word. Good. We are learning.)']]]
                ]]
              ]],
              ['if', 'silver=3', [['say', 'Halda', "And the silver went north with them. Then Brackenford's dead bought Brackenford's peace. I cannot say they would mind."]]],
              ['say', 'Halda', "Here is what I owe you, and my thanks with it. Take the ring as well. It was the Thane's, and he has no heirs to argue."],
              ['if', 'pay=90', [['gold', 90]], [['if', 'pay=30', [['gold', 30]], [['gold', 60]]]]],
              ['give', 'signet'], ['xp', 100], ['quest', 'main', 6],
              ['say', 'Halda', 'Warden Tobias asked for you. Something about that shard has him pacing.']
            ], [['say', 'Halda', 'The barrow is north through Thornwood. Keep to the road and the wolves mostly leave you be.']]]
          ]]
        ]
      },
            g: {
        type: 'npc', sprite: 'merchant', dir: 'left', script: [['if', 'merchant', [['say', 'Merchant', 'Safe roads, friend. Well. Safer.']], [
          ['say', 'Merchant', 'Saltmere silks, stuck this side of a broken bridge. I may as well drink the profit.'],
          ['choice', 'Finch', '(He has a satchel of draughts at his feet.)', [
            ['Charm him out of one', [['check', 'finch', 12, [
              ['say', 'Finch', 'A man of your taste knows an investment. Four heroes, one draught, and your name in the second verse.'],
              ['say', 'Merchant', 'The second verse? ...Oh, take two.'], ['give', 'draught', 2]
            ], [['say', 'Finch', 'Picture it: your name, in song!'], ['say', 'Merchant', 'I have heard you sing, sir. No.']]], ['set', 'merchant']]],
            ['Leave him be', []]
          ]]
        ]]]
      },
            f: { type: 'npc', sprite: 'soldier', dir: 'right', script: [['say', 'Old Soldier', 'Goblins fold if you all go for the same one. And that halfling of yours will fight dirtiest when his mark is already busy with somebody else.']] }
    }
  };

  M.shop = {
    name: "Odo's Sundries", ground: 'wood', music: 'town', bg: 'town',
    rows: [
      '##########',
      '#KK.o..UU#',
      '#.CCCC...#',
      '#........#',
      '#.X....J.#',
      '#........#',
      '#....V...#',
      '#####x####'
    ],
    things: {
      x: { type: 'warp', to: 'brackenford', at: 'b', gfx: 'mat', out: 'up' },
      o: {
        type: 'npc', sprite: 'odo', script: [
          ['if', 'q.mush=1&item.palecap>=3', [
            ['say', 'Odo', "Three palecaps! Pale as a banker's conscience. Lovely."],
            ['take', 'palecap', 3], ['give', 'draught', 2], ['gold', 20], ['quest', 'mush', 2]
          ]],
          ['if', '!q.mush', [
            ['say', 'Odo', "Before you browse: I need palecap mushrooms. They only grow on barrow soil, and nobody will go into Thornwood for them. Bring me three and I'll make it worth the walk."],
            ['quest', 'mush', 1]
          ]],
          ['if', 'item.silver&!odoNo', [
            ['say', 'Odo', 'That sack clinks like a churchyard. I could give a hundred and fifty for it, and my memory is terrible.'],
            ['choice', null, 'Sell the grave silver to Odo?', [
              ['Sell it (150 gold)', [
                ['take', 'silver'], ['gold', 150], ['set', 'silver', 2], ['bond', 'dask', 1], ['bond', 'maren', -1],
                ['say', 'Maren', 'I will remember where that christening cup went, Dask. Somebody ought to.']
              ]],
              ['Keep it', [['set', 'odoNo'], ['say', 'Odo', 'Suit yourself. The offer keeps. My conscience does not.']]]
            ]]
          ]],
          ['shop', 'odo']
        ]
      }
    }
  };

  M.smithy = {
    name: "Ingrid's Forge", ground: 'stone', music: 'town', bg: 'town',
    rows: [
      '##########',
      '#Y..i..XU#',
      '#..CCC...#',
      '#.Z......#',
      '#........#',
      '#......J.#',
      '#....V...#',
      '#####x####'
    ],
    things: {
      x: { type: 'warp', to: 'brackenford', at: 'c', gfx: 'mat', out: 'up' },
      i: { type: 'npc', sprite: 'ingrid', script: [['if', 'ingridAlly&!ingridGift', [['say', 'Ingrid', 'There you are. You took a punch meant for me last night, near enough. Take this. Luck for the road.'], ['give', 'horseshoe'], ['set', 'ingridGift']]], ['say', 'Ingrid', 'Mind the anvil. What do you need?'], ['shop', 'ingrid']] }
    }
  };

  M.temple = {
    name: 'Temple of the Lamplighter', ground: 'stone', music: 'town', bg: 'town',
    rows: [
      '############',
      '#+...QQ...+#',
      '#....w.....#',
      '#..........#',
      '#.I......I.#',
      '#....VV....#',
      '#.I..VV..I.#',
      '#....VV....#',
      '#.h..VV....#',
      '#....VV....#',
      '#####xx#####'
    ],
    things: {
      x: { type: 'warp', to: 'brackenford', at: 'e', gfx: 'mat', out: 'up' },
      h: { type: 'obj', gfx: 'shrine', script: [['note', "Brackenford's ward-lamp. It burns low and steady, the way it has for three hundred years."]] },
      w: {
        type: 'npc', sprite: 'tobias', dir: 'down', script: [
          ['if', 'q.main>=6', [
            ['if', 'ch1done', [['say', 'Tobias', 'Saltmere, when the bridge is mended. Go with the Lamp, all of you.']], [['run', 'tobiasShard']]]
          ], [
            ['if', '!tobias', [
              ['say', 'Tobias', 'A Warden, on the road? Then the chapter house got my letters after all.'],
              ['say', 'Maren', "They did. Tell me about the lamp in the Thane's Barrow."],
              ['say', 'Tobias', 'Three hundred years it has burned, and I could feel it from here, like a hand on my shoulder. Nine days ago the hand lifted.'],
              ['say', 'Tobias', 'Lamps do not go out, Maren. Somebody put it out. Take this. It was lit from that same flame.'],
              ['give', 'lampcharm'], ['set', 'tobias']
            ]],
            ['topics', 'Tobias', 'Ask what you need, child. I have had nine days to think of answers.', [
              ['The ward-lamps', [
                ['say', 'Tobias', 'Every barrow in the vale has one. The Five Lamps lit them the night the crown was broken, and Wardens have trimmed the wicks ever since.'],
                ['say', 'Tobias', 'While a lamp burns, what is buried stays buried. That is the whole of our faith, boiled down. We keep a light on.']
              ]],
              ['Relighting a lamp', [
                ['say', 'Maren', 'If it has been put out, I will need the full rite. I only ever learned the short form.'],
                ['say', 'Tobias', 'Nobody learns the long form any more. Sit. It is nine verses, and the seventh is the one that matters.'],
                ['note', 'Maren repeats the verses until the old man nods.'],
                ['say', 'Tobias', 'Said whole, the light does not stay in the lamp. It goes with you a little way. And the dead will hear you better for it.'],
                ['set', 'rite'], ['bond', 'maren', 1]
              ], '!rite'],
              ['Who put it out?', [
                ['say', 'Tobias', 'A Warden came through nine days back. Young, grey travelling robes. She said the chapter house had sent her to inspect the lamps. Sister Veyra.'],
                ['say', 'Maren', 'Veyra.'],
                ['say', 'Tobias', 'You know her.'],
                ['say', 'Maren', 'I trained her. She was the best pupil I ever had.'],
                ['set', 'knowsVeyra'], ['set', 'knowsGrey']
              ], '!knowsVeyra'],
              ['Anything else in Thornwood?', [
                ['say', 'Tobias', 'There was a hermitage, once, in the south-east of the wood past the pond. The Doorward\'s Chapel, folk called it, after the fifth of the Five Lamps. Brambles took it before my grandfather\'s time.'],
                ['say', 'Finch', 'The fifth Lamp had a chapel? Nobody ever told me the fifth Lamp had a chapel.'],
                ['set', 'chapelHint']
              ]],
              ['The Barrow King', [
                ['say', 'Tobias', "Vael Morn. He would not die, so he made a crown to keep his soul in, and ruled a hundred years as a thing with a king's voice and nothing behind it."],
                ['say', 'Finch', '"Hollow the crown and hollow the head." My grandmother sang that one to get us to sleep.'],
                ['say', 'Tobias', 'Your grandmother had a strange idea of lullabies.']
              ]]
            ], 'We should go.']
          ]]
        ]
      }
    }
  };
})();
