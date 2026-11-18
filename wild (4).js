/* Chapter 4 — the Undercroft, the old city under the new. Sewer channels, ghouls, and the Pale Hand's
   safehouse between Highmoor and the Catacombs. Brannoc knows its back door. */
(function () {
  const M = G.D.maps;

  M.undercroft = {
    name: 'The Undercroft', ground: 'cobble2', ground2: 'cobble', music: 'undercroft', bg: 'sewer', dark: 0.6,
    legend: { '~': 'sewer' },
    encounters: { rate: 0.1, min: 8, groups: [['uc_rats', 2], ['uc_ghouls', 2], ['uc_ooze', 1], ['uc_cult', 2]] },
    rows: [
      '##############################################',
      '#.u.......########.........###...........#####',
      '#.........########.......................#####',
      '#........................................#####',
      '#............p.............###.....d.....#####',
      '#.........########~~~~==~~~###...........#####',
      '#.........########.........###...........#####',
      '#.........########.........###.........c.#####',
      '##################.........###...........#####',
      '##################.........###################',
      '######################..######################',
      '######################..######################',
      '##.......#############..######################',
      '##.......#..,.........................########',
      '##..g....#............................########',
      '##.......#~~~~==~~~~~~~~~~~~==~~~~~...########',
      '##.......#............................########',
      '##..............v...............,.....########',
      '##.......#............................########',
      '##.......#############.#############k#########',
      '##....e..#############.#############.#########',
      '##.h.....#############q#############.#########',
      '##.......#############.#############.#########',
      '######################.#############.#########',
      '##############...............................#',
      '##############..K.............f..............#',
      '##############....A..........................#',
      '##############...U........X..................#',
      '##############.............................a.#',
      '##############...............................#',
      '##############################################',
      '##############################################'
    ],
    things: {
      u: { type: 'warp', to: 'highmoor', at: 'u', gfx: 'ladder', out: 'down' },
      a: { type: 'warp', to: 'catacombs1', at: 'x', gfx: 'doorStone', out: 'left', script: [['if', 'q.main4<4', [['quest', 'main4', 4]]]] },
      p: { type: 'foe', sprite: 'cutthroat', dir: 'left', script: [['note', 'Grey-hooded cutthroats sit on the sewer gate, dicing. They stop dicing.'], ['battle', 'sewergate'], ['remove']] },
      d: { type: 'foe', sprite: 'ghoul', dir: 'left', script: [['note', 'A ghoul den. Something is still chewing.'], ['battle', 'ghoulden'], ['remove']] },
      c: { type: 'chest', gold: 160, items: { elixir: 1 } },
      e: { type: 'chest', lock: 19, gold: 220, items: { duelistring: 1 } },
      g: { type: 'pickup', gfx: 'mushroom', item: 'ghostcap' },
      h: { type: 'obj', gfx: 'shrine', script: [['note', 'An old Warden shrine from when this was a street. Somebody has kept it lit.'], ['run', 'campsite']] },
      v: { type: 'foe', sprite: 'vosk', if: 'brannoc2=1', dir: 'right', script: [
        ['say', 'Brannoc', 'Tavern-wreckers! You broke my nose in Brackenford and my brothers in Saltmere. The Pale Hand pays double for your heads.'],
        ['battle', 'brannoc4'], ['remove'], ['set', 'brannoc4', 1],
        ['say', 'Brannoc', '...Third time. Fine. FINE. The safehouse captain answers to the Chancellery. Corr\'s seal. Go and ask him yourselves.'],
        ['set', 'knowsChancellery']
      ] },
      k: { type: 'obj', gfx: 'lockedDoor', script: [['if', 'backdoorKey', [
        ['note', "Brannoc's key turns in the lock. The back door opens onto the safehouse's cellar, behind the guards."],
        ['sfx', 'door'], ['remove'], ['xp', 400]
      ], [['note', 'A heavy iron door, locked from the far side. Pale Hand marks scratched in the frame.']]]] },
      q: { type: 'foe', sprite: 'captain', dir: 'up', script: [
        ['say', 'Captain Sarre', 'The Wardens\' pets. The Chancellor said you would come down here eventually. He is very rarely wrong.'],
        ['if', 'knowsChancellery', [['say', 'Dask', 'The Chancellor. So it is Corr.'], ['say', 'Captain Sarre', 'Did I say that? How careless.']]],
        ['battle', 'safehouse'], ['remove']
      ] },
      f: { type: 'obj', gfx: 'table', script: [['if', 'knowsChancellery', [['note', 'The safehouse desk. Orders, rosters, pay chits.']], [
        ['note', 'The safehouse desk. Pale Hand orders, pay chits, a roster. Every page is sealed with a little silver lamp.'],
        ['say', 'Maren', 'That is the Chancellery seal. The Duke\'s own office.'],
        ['set', 'knowsChancellery'], ['xp', 60]
      ]]] }
    }
  };
})();
