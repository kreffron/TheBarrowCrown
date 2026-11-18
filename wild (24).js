/* Chapter 5 — the Ashen Road, from Ashfall to the gate of the Hollow Barrow. Four dead way-lamps, the
   Pale Hand's line in the canyon, and the side roads to Greyhold and the Mirror Barrow. */
(function () {
  const D = G.D, M = D.maps;
  const waylamp = id => ({
    type: 'obj', gfx: 'waylamp', gfxIf: ['rl.' + id, 'waylampLit'], script: [['if', 'rl.' + id, [['note', 'The way-lamp burns, and the ash around it is only ash.']], [
      ['note', 'A way-lamp, iron and very old, black with soot.'],
      ['say', 'Maren', 'Lamplighter, who keeps the door: here is a little light for those on the road.'],
      ['sfx', 'magic'], ['set', 'rl.' + id], ['xp', 300],
      ['if', 'rl.l&rl.m&rl.o&rl.q', [['note', 'All four way-lamps burn along the Ashen Road. From here you can see them all, a line of small fires leading east.'], ['set', 'roadLit'], ['quest', 'lamps', 2], ['xp', 400]]]
    ]]]
  });
  const eater = () => ({ type: 'foe', sprite: 'ashwraith', dir: 'left', script: [['battle', 'lampeater'], ['remove']] });
  M.ashroad = {
    name: 'The Ashen Road', ground: 'ash', ground2: 'cinder', music: 'ashen', bg: 'ash',
    legend: { T: 'deadtree', '=': 'ember' },
    encounters: { rate: 0.11, min: 7, groups: [['ar_wraiths', 2], ['ar_ghouls', 2], ['ar_cult', 2]] },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T..,,...,.......,...RRRRRRRR.,,.,,T.T..,.RRR,..T',
      'T,........RgR,,...,.RRRRRRRR.,.,,..T.....RRR,..T',
      'T.TT,...,...........RRRRRRRR.........,,.,RRR,d,T',
      'T.,.T...........,..,RRRRRRRR..,.,.,......RRR,..T',
      'T................T,.RRRRRRRR.,......,.,,.RRR,,.T',
      'T...,.,,,,.,,,......RRRRRRRR,.......=...,RRR.T.T',
      'T,.........,,...,.,.RRRRRRRR.T,..o3.,T..,RRR.,.T',
      'T.,,,,.....T.,,.....RRRRRRRR,............RRR.,.T',
      'T,..T...l1....,..,..RRRRRRRR..=..........RRR..,T',
      'T....,..........,.=.RRRRRRRR..,..,,...,,,RRR,.,T',
      'T.,..,.....,...,,.,.RRRRRRRR,=........,..RRR,,,T',
      'T.,..,......T...,...RRRRRRRRT....,,.,Ty.,RRRT..T',
      'T...,,,.=.......h...RRRRRRRR,......,.,...RRR...T',
      's::::::::::::::::::::::w:::::::::::::::::::::::z',
      's:::::::::::::::::::::::::::::::::::::::::k::::z',
      'T.......,.....,....,RRRRRRRR.......,..T.,RRR,..T',
      'T.,...,.........T,.,RRRRRRRR,,e.,T.....=,RRR...T',
      'T,.,..,.,,.,....T,..RRRRRRRR......,......RRR...T',
      'T.,.....,........T,.RRRRRRRR,...,........RRR.,.T',
      'T..,,...T..,.....=T.RRRRRRRR,...T.,......RRR..,T',
      'T......,.....2m.....RRRRRRRR...,,T......,RRR,..T',
      'T...,,.=..T=.....,..RRRRRRRR.,,..T..4q...RRR...T',
      'T...,.=,...,.....,..RRRRRRRR.,...,......,RRR...T',
      'T.......,,...,...T.,RRRRRRRR.,..........,RRR..TT',
      'T,..c...........,.T.RRRRRRRR.......,....,RRRT..T',
      'T.,..,,.....,.......RRRRRRRR,......,..T.,RRR,..T',
      'T....,.....T..T..,.,RRRRRRRR...RvR..=....RRR==,T',
      'T.....,.=..,..,.,...RRRRRRRR,.=......T,..RRR...T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    things: {
      s: { type: 'warp', to: 'ashfall', at: 'e', under: 'path', out: 'right' },
      z: { type: 'warp', to: 'hollow1', at: 'x', under: 'path', out: 'left' },
      w: { type: 'foe', sprite: 'palecrusader', dir: 'left', under: 'path', script: [
        ['run', 'muster'],
        ['if', 'muster>=4', [
          ['note', 'The Pale Hand line holds the canyon. Then horns sound behind you, and your allies come down both slopes at once.'],
          ['if', 'brynAlly', [['say', 'Bryn', 'KARROW!']]],
          ['if', 'grukk3=1', [['note', 'Somewhere on the left flank, a goat is screaming.']]],
          ['battle', 'warline_small'], ['xp', 630]
        ], [['battle', 'warline']]],
        ['remove'], ['set', 'ch5mid'], ['xp', 0], ['if', 'level>=29', [['note', 'Past the war-line, the last of the road opens. Level 30 is within reach.']]], ['say', 'Runa', 'The road is open.']
      ] },
      k: { type: 'foe', sprite: 'deathknight', dir: 'left', under: 'path', script: [
        ['note', 'The gate of the Hollow Barrow: two doors of black stone, and Barrow Knights who have stood here since before Highmoor had a name.'],
        ['battle', 'gateguard'], ['remove'], ['quest', 'main5', 3]
      ] },
      l: waylamp('l'), m: waylamp('m'), o: waylamp('o'), q: waylamp('q'),
      1: eater(), 2: eater(), 3: eater(), 4: eater(),
      g: { type: 'warp', to: 'greyhold', at: 'u', gfx: 'doorStone', under: 'rock', out: 'down' },
      v: { type: 'warp', to: 'mirror', at: 'u', gfx: 'caveMouth', under: 'rock', out: 'up', script: [['if', '!q.mirror', [
        ['say', 'Finch', 'A barrow with a mirror in it. Grandmother sang about this. "Look, and see what you have lost, and take it home."'],
        ['quest', 'mirror', 1]
      ]]] },
      y: { type: 'npc', sprite: 'veyra', if: 'veyraWith', unless: 'q.main5>=5', dir: 'left', script: [['say', 'Veyra', 'I will go in with you. I know the way to the last door. I walked it, once, on the wrong side.']] },
      e: { type: 'obj', gfx: 'bones', script: [['if', 'ashWarden', [['note', 'A Warden\'s bones, under a cairn of ash.']], [
        ['note', 'A Warden, long dead, still holding a lamp. Somebody set out from Highmoor to relight this road, a long time ago.'],
        ['say', 'Maren', 'Rest. We will finish it for you.'],
        ['set', 'ashWarden'], ['give', 'elixir'], ['xp', 100]
      ]]] },
      h: { type: 'obj', gfx: 'shrine', script: [['note', 'A wayshrine, its flame very small and very stubborn.'], ['run', 'campsite']] },
      c: { type: 'chest', gold: 400, items: { elixir: 2 } },
      d: { type: 'chest', lock: 20, gold: 600, items: { dawnstone: 1 } }
    }
  };
})();
