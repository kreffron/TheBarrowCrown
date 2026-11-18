/* Chapter 5 — Ashfall, the war camp at the head of the Ashen Road. Who is here depends on every chapter before. */
(function () {
  const M = G.D.maps;
  M.ashfall = {
    name: 'Ashfall', ground: 'ash', ground2: 'cinder', music: 'ashen', bg: 'ash',
    legend: { T: 'deadtree' },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T,.,,..,.,.,,.,..,..,..,,.,.,.......,..T',
      'T,,,.,....,....,...,.........,.....,...T',
      'T,..?,.?.......?..?..?..?,..,.,?..?....T',
      'T.,.,,..,...,,.......,..,.........,...,T',
      'T.....b.......,....o..........,.d......T',
      'T.,.?....,...,.?........?,..,......?..,T',
      'T...,...+,....,.,...+,...........,,....T',
      'T,.1....,...,..,...::,.,...,..3..,..4..T',
      'T....,........,...,::.,.,.........,..,.T',
      'T............X.....::...,.U...,........T',
      'T.,.,..,.,........,::,,................T',
      'T...,......,......,::....,,.....,......T',
      'n::::::::::::::::::::::::::::::::::::::e',
      'n::::::::::::::::::::::::::::::::::::::e',
      'T.,.....,.,..,.,....,........,.......,.T',
      'T,.,.........,..,.,,,................U.T',
      'T.......,..,q..u.,......,h.....,.,...,.T',
      'T.,..,gj.,.CCCCCC....,..?..?,..........T',
      'T.,,?,..........,,.........,...........T',
      'T,2..........,.,.,.......,.,,...vk....,T',
      'T.,..+.?..,..,,,....p......,..?.,...,.,T',
      'T...,,.,..,....,,...,,,.,..,.....,...,.T',
      'T.,?....,.......,.....i.,.........,...,T',
      'T.............,.,w...,.,......,...,f...T',
      'T.,..,...,t.,,..,.,,.....,..z..,....X,.T',
      'T.,..,...,...,......,,,........,....,,.T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    things: {
      n: { type: 'obj', gfx: 'path', under: 'path', out: 'right', script: [['choice', null, 'The road west, back into the valley.', [
        ['To Highmoor', [['warp', 'highmoor', 'n', 'up']]], ['To Brackenford', [['warp', 'brackenford', 'z', 'up']]], ['Stay at Ashfall', []]
      ]]] },
      e: { type: 'warp', to: 'ashroad', at: 's', under: 'path', out: 'left', script: [['if', 'q.main5<2', [['say', 'Maren', 'Oriel first. She will know how things stand on the road.']]]] },
      o: { type: 'npc', sprite: 'oriel', dir: 'down', script: [['if', 'q.main5>=2', [
        ['if', 'ch5done', [['say', 'High Warden Oriel', 'It is over, Maren. Go home. All of you. Go home.']], [
          ['if', 'roadLit', [['say', 'High Warden Oriel', 'The way-lamps are burning on the Ashen Road. I can see them from here. Thank you.']], [['say', 'High Warden Oriel', 'The Hollow Barrow is east, past the canyon. Light the way-lamps if you can.']]]
        ]]
      ], [['run', 'oriel5']]]] },
      h: { type: 'npc', sprite: 'healer', dir: 'down', script: [['if', 'q.main5>=2&!camp5', [
        ['choice', 'Healer', 'The healers\' tent. A cot and a hot meal for anyone going east tomorrow.', [['Rest for the night', [['run', 'camp5']]], ['Not yet', []]]]
      ], [['say', 'Healer', 'Sit, sit. You are all bruises.'], ['inn', 0]]]] },
      q: { type: 'npc', sprite: 'quartermaster', dir: 'down', script: [['say', 'Quartermaster', 'Everything the Wardens own, on one cart. Take what you need. Pay what you can.'], ['shop', 'quartermaster']] },
      u: { type: 'npc', sprite: 'sutler', unless: 'wrenFree', dir: 'down', script: [['say', 'Sutler', 'Last stop before the Ashen Road. Prices to match.'], ['shop', 'sutler']] },
      w: { type: 'npc', sprite: 'wren', if: 'wrenFree', dir: 'down', script: [['say', 'Wren', 'I keep the camp\'s books now. Someone had to. Family discount, Dask. Do not tell anyone.'], ['shop', 'sutler']] },
      p: { type: 'obj', gfx: 'brazier', script: [['run', 'papers']] },
      v: { type: 'npc', sprite: 'veyra', if: 'maren4=1', unless: 'veyraFreed', dir: 'left', script: [['run', 'veyraCustody']] },
      k: { type: 'npc', sprite: 'oriel', if: 'maren4=1', unless: 'veyraFreed', dir: 'left', script: [['say', 'Warden', 'The prisoner may speak with Sister Maren. Nobody else.']] },
      b: { type: 'npc', sprite: 'bryn', if: 'brynAlly', dir: 'down', script: [['if', 'runaOath=4', [['say', 'Bryn', 'Five winters on the Cairn, after this. I will keep the watch with you, cousin.']], [['say', 'Bryn', 'Karrow Hold keeps its oaths. All of us came. Well. Most. Someone had to mind the goats.']]]] },
      1: { type: 'npc', sprite: 'shieldmaiden', if: 'brynAlly', dir: 'right', script: [['say', 'Shieldmaiden', 'We came for the oathbreaker. Turns out she was the best of us.']] },
      d: { type: 'npc', sprite: 'captain5', if: 'dukeCured', dir: 'down', script: [['say', 'Captain Hale', 'His Grace sends his guard, and his apologies, and a great deal of language I will not repeat. We will hold the canyon flank.']] },
      3: { type: 'npc', sprite: 'cityguard', if: 'dukeCured', dir: 'down', script: [['say', 'Ducal Guard', 'Twenty years we guarded Corr\'s door. Now we get to knock on it.']] },
      4: { type: 'npc', sprite: 'cityguard', if: 'dukeCured', dir: 'down', script: [['say', 'Ducal Guard', 'Is it true the halfling read the Chancellor\'s accounts out at the feast? Legend.']] },
      g: { type: 'npc', sprite: 'grukk', if: 'grukk3>=1&grukk3<=2', dir: 'down', script: [['if', 'grukk3=1', [['say', 'Grukk', 'Grukk pays debts. Grukk brought the whole warren. And a goat. The goat is for luck.']], [['say', 'Grukk', 'Paid in advance. Grukk is very professional now. Grukk has a ledger.'], ['say', 'Dask', 'Of course he does.']]]] },
      j: { type: 'npc', sprite: 'nagra', if: 'grukk3=4', dir: 'down', script: [['say', 'Nagra', 'Grey robes owe my brother a life. I am here to collect. With interest.']] },
      2: { type: 'npc', sprite: 'goblin', if: 'grukk3>=1', unless: 'grukk3=3', dir: 'right', script: [['say', 'Goblin', 'Goat is ready. Goat has been ready for days.']] },
      f: { type: 'npc', sprite: 'fisher', if: 'hostagesSaved', dir: 'left', script: [['say', 'Jory', 'Jory Fenn, from Saltmere. You pulled me out of the Abbey. I have been waiting to pull someone out of something ever since.']] },
      i: { type: 'npc', sprite: 'ingrid', if: 'ingridAlly', dir: 'down', script: [['say', 'Ingrid', 'Mind the horseshoe. I brought the whole forge. Well, the anvil. And most of Brackenford, who followed the anvil.']] },
      t: { type: 'npc', sprite: 'tobias', if: 'tobiasFree', dir: 'right', script: [['say', 'Tobias', 'Maren. You came for me. Of course you did. Now go and finish it, and come home and tell me everything.']] },
      z: { type: 'npc', sprite: 'goblin', if: 'snik=1', dir: 'up', script: [['say', 'Snik', 'Snik brought eels. For the army. Honest eels. Half price for heroes. Three-quarters.']] }
    }
  };
})();
