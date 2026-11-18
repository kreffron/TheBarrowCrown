/* Chapter 4 — the Catacombs under Highmoor (two floors), Orrin's vault at night, and the Cathedral undercrypt. */
(function () {
  const D = G.D, M = D.maps;

  /* ---------- the Catacombs, floor 1 ----------
     Four lamps in a row. Lighting one flips it and its neighbours. All four lit opens the stair.
     "Light the ends, and the middle will follow." */
  const flip = n => ['if', 'cl.' + n, [['set', 'cl.' + n, 0]], [['set', 'cl.' + n, 1]]];
  const lamp4 = n => ({
    type: 'obj', gfx: 'lampDead', gfxIf: ['cl.' + n, 'shrine'], script: [['if', 'cl.open', [['note', 'The lamps burn steady now.']], [
      ['sfx', 'magic'], flip(n)].concat(n > 1 ? [flip(n - 1)] : [], n < 4 ? [flip(n + 1)] : [], [
      ['note', 'The lamp flares, and so do its neighbours: the lit ones go dark, the dark ones catch.'],
      ['if', 'cl.1&cl.2&cl.3&cl.4', [['shake', 500], ['set', 'cl.open'], ['note', 'All four lamps burn together. At the north end of the ossuary, the stair gate grinds open.'], ['xp', 150]]]
    ])]]
  });
  M.catacombs1 = {
    name: 'The Catacombs', ground: 'stone', ground2: 'cave', music: 'dungeon', bg: 'crypt', dark: 0.7,
    legend: { '#': 'niches', '=': 'coffin', '&': 'skulls' },
    rows: [
      '##############################',
      '##############z###############',
      '##############g###############',
      '##&........................&##',
      '##....1....2......3....4....##',
      '##..........................##',
      '##..........................##',
      '##...........................#',
      '##..=....................=..d#',
      '#........=..........=.......##',
      '#c..........................##',
      '#...........................##',
      '##..=........&..&........=..##',
      '##..........................##',
      '##############n.##############',
      '##############..##############',
      '############......############',
      '############...p..############',
      '############......############',
      '############......############',
      '############......############',
      '##############x###############'
    ],
    things: {
      x: { type: 'warp', to: 'undercroft', at: 'a', gfx: 'daylight', out: 'up' },
      z: { type: 'warp', to: 'catacombs2', at: 'u', gfx: 'stairsDown', out: 'down' },
      g: { type: 'obj', gfx: 'gate', unless: 'cl.open', script: [['note', 'A stair gate, shut. Four dark lamps hang along the ossuary wall.']] },
      n: { type: 'foe', sprite: 'boneknight', dir: 'down', script: [['note', 'Two Bone Knights stand guard at the ossuary door. Their niches are empty.'], ['battle', 'ossuary'], ['remove']] },
      p: { type: 'sign', gfx: 'notice', text: 'Carved over the door: "FOUR LAMPS FOR FOUR WHO WENT BEFORE. LIGHT THE ENDS, AND THE MIDDLE WILL FOLLOW."' },
      1: lamp4(1), 2: lamp4(2), 3: lamp4(3), 4: lamp4(4),
      c: { type: 'chest', gold: 180, items: { elixir: 1 } },
      d: { type: 'chest', lock: 18, gold: 240, items: { silverbell: 1 } }
    }
  };

  /* ---------- the Catacombs, floor 2: the fourth tomb ---------- */
  M.catacombs2 = {
    name: 'The Fourth Tomb', ground: 'stone', music: 'dungeon', bg: 'crypt', dark: 0.72,
    legend: { '#': 'niches', '=': 'coffin' },
    rows: [
      '############################',
      '#############u##############',
      '#############.##############',
      '#############.##############',
      '#############w##############',
      '#############.##############',
      '#############.##############',
      '##...........t............##',
      '##.=....................=.##',
      '##...I......m.o......I....##',
      '##........................##',
      '##...........l............##',
      '##..v..................k..##',
      '##...........s............##',
      '##......=.........=.......##',
      '##........................##',
      '##........................##',
      '##...I...............I....##',
      '##.=.........c..........=.##',
      '##........................##',
      '#############e##############',
      '############################'
    ],
    things: {
      u: { type: 'warp', to: 'catacombs1', at: 'z', gfx: 'stairsUp', out: 'down' },
      w: { type: 'foe', sprite: 'ghoul', dir: 'up', script: [['note', 'The tomb\'s dead are awake, and hungry.'], ['battle', 'tombghouls'], ['remove']] },
      t: { type: 'trigger', script: [['run', 'unmask']] },
      l: {
        type: 'obj', gfx: 'lampDead', gfxIf: [['lampLit4', 'shrine'], ['cs.c4lit', 'shrine']], script: [['if', 'cc.done', [
          ['note', 'The Catacomb lamp burns blue-white.'],
          ['choice', null, 'Go back up to Highmoor?', [['Return to the city', [['run', 'catacombsHome']]], ['Not yet', []]]]
        ], [['note', 'The Catacomb lamp. Dark, and still warm.']]]]
      },
      s: { type: 'obj', gfx: 'sarcophagus', script: [['if', 'cc.done', [['note', 'The fourth tomb. Empty now, but for an old Warden\'s bones.']], [['note', 'A sarcophagus. Something on it glints.']]]] },
      m: { type: 'npc', sprite: 'hand', if: 'cs.c4open', dir: 'up' },
      o: { type: 'npc', sprite: 'orrin', if: 'cs.c4open', dir: 'up' },
      c: { type: 'npc', sprite: 'corr', if: 'cs.corr', dir: 'up' },
      v: { type: 'npc', sprite: 'veyra', if: 'cs.veyra4', dir: 'right' },
      k: { type: 'obj', gfx: 'skulls', unless: 'cc.done', script: [['note', 'A great heap of bones.']] },
      e: { type: 'mark' }
    }
  };

  /* ---------- Orrin's vault, at night (optional) ---------- */
  M.h_vault = {
    name: "Orrin's Vault", ground: 'marble', music: 'undercroft', bg: 'crypt', dark: 0.6,
    legend: { '=': 'papers', '&': 'coins', '>': 'gearwork' },
    rows: [
      '########################',
      '#.u....######>........>#',
      '#........g.............#',
      '#......######.....h....#',
      '#.......#####..........#',
      '#######.#####..........#',
      '#######m#########.######',
      '#######.#########l######',
      '#......................#',
      '#..===............==.c.#',
      '#......................#',
      '#.e........k...........#',
      '#......................#',
      '#.&........b.........&.#',
      '#......................#',
      '########################'
    ],
    things: {
      u: { type: 'warp', to: 'h_counting', at: 'v', gfx: 'stairsUp', out: 'down' },
      g: { type: 'foe', sprite: 'automaton', dir: 'left', script: [['note', 'Two brass automatons stand in the passage, ticking.'], ['battle', 'vaultguards'], ['remove']] },
      m: { type: 'obj', gfx: 'crack', script: [
        ['note', 'An old coal chute, bricked over badly. It runs under the guard passage.'],
        ['check', 'dask', 19, [['say', 'Dask', 'Every vault has a coal chute. Every builder forgets it.'], ['sfx', 'door'], ['remove'], ['xp', 300]],
          [['hurt', 'dask', '1d8'], ['say', 'Dask', 'Every builder forgets it. This one did not.']]]
      ] },
      h: { type: 'obj', gfx: 'table', script: [['if', 'engineHint', [['note', 'The night clerk\'s schedule.']], [
        ['note', 'The night clerk\'s desk. A schedule: "Engine winds down at the twelfth bell. Do not be in the vault when it winds up."'],
        ['say', 'Dask', 'So it has a timer. Things with timers can be late.'],
        ['set', 'engineHint'], ['xp', 40]
      ]]] },
      l: { type: 'obj', gfx: 'lockedDoor', script: [
        ['note', 'The vault door. Seven tumblers and a clockwork dial.'],
        ['check', 'dask', 18, [['sfx', 'door'], ['say', 'Dask', 'Orrin bought the best lock in Highmoor. I was in Highmoor when it was made.'], ['remove']],
          [['hurt', 'dask', '1d8'], ['say', 'Dask', 'It pinched. Locks should not pinch.']]]
      ] },
      k: { type: 'foe', sprite: 'automaton', dir: 'down', script: [
        ['note', 'In the middle of the vault, the Collector Engine wakes: a brass giant made of ledgers, scales and steam.'],
        ['if', 'engineHint', [['say', 'Dask', 'Twelfth bell. It is still warming up. Hit it now.']]],
        ['battle', 'engine'], ['remove']
      ] },
      b: {
        type: 'obj', gfx: 'brazier', script: [['if', 'heist', [['note', 'The vault brazier.']], [
          ['note', 'Every debt-paper in Highmoor, stacked to the ceiling. Wren\'s is on top. So, until tonight, was Dask\'s.'],
          ['choice', null, 'What do you do with the debt-papers of Highmoor?', [
            ['Burn them, all of them', [
              ['say', 'Dask', 'Every chain in this city. Into the fire.'],
              ['note', 'It takes an hour. The vault fills with smoke and the smell of eleven years of interest.'],
              ['set', 'heist', 1], ['xp', 300], ['bond', 'maren', 1], ['bond', 'finch', 1]
            ]],
            ['Take them', [
              ['say', 'Dask', 'Leverage. Against Corr. Every lord in Highmoor owes on one of these.'],
              ['say', 'Maren', 'That is exactly what Orrin would have said.'],
              ['give', 'debtpapers'], ['gold', 600], ['set', 'heist', 2], ['xp', 300], ['bond', 'maren', -1]
            ]]
          ]],
          ['quest', 'heist', 2]
        ]]]
      },
      c: { type: 'chest', gold: 250, items: { elixir: 2 } },
      e: { type: 'chest', gold: 120, items: { duelistring: 1 } }
    }
  };

  /* ---------- the Cathedral undercrypt (optional) ---------- */
  const ask = (q, opts, right, then) => ['choice', null, q, opts.map(o => [o, o === right ? then : [['sfx', 'bad'], ['note', 'The door groans. A cold wind knocks the party back.'], ['hurt', 'all', '2d6']]])];
  M.h_crypt = {
    name: 'The Undercrypt', ground: 'stone', music: 'dungeon', bg: 'crypt', dark: 0.65,
    legend: { '=': 'coffin' },
    rows: [
      '########################',
      '##########.k.c##########',
      '##########....##########',
      '###########r############',
      '##....................##',
      '##.=..=..........=..=.##',
      '##......p......h......##',
      '##.=................=.##',
      '##....................##',
      '###########..###########',
      '###########w.###########',
      '###########..###########',
      '###########..###########',
      '##########....##########',
      '##########....##########',
      '##########....##########',
      '##########.u..##########',
      '########################'
    ],
    things: {
      u: { type: 'warp', to: 'h_cathedral', at: 'z', gfx: 'stairsUp', out: 'left' },
      w: { type: 'foe', sprite: 'shade', dir: 'down', script: [['note', 'Shades drift between the tombs, a little cold light each.'], ['battle', 'cryptshades'], ['remove']] },
      p: { type: 'sign', gfx: 'notice', text: '"Here lie the High Wardens of the Lamp. The first of us sealed the last door, and asked to be buried by it."' },
      h: { type: 'obj', gfx: 'shrine', script: [['note', 'A small lamp by the High Wardens\' tombs. Someone still trims it.'], ['run', 'campsite']] },
      r: {
        type: 'obj', gfx: 'lockedDoor', script: [
          ['note', 'A door with a face carved in it. As you come close, the face speaks.'],
          ['if', 'verse1&verse2&verse3', [['say', 'Finch', 'Questions about the fifth verse? Oh, I know this one.']], [['say', 'Maren', 'Answer carefully. I think it knows when we guess.']]],
          ask('"What was the fifth lamp set to do?"', ['Shut the gate', 'Hold the gate', 'Burn the gate'], 'Hold the gate', [
            ask('"How did she keep the keeping?"', ['With the other four', 'With a crown', 'All alone'], 'All alone', [
              ask('"Where did she take the key?"', ['To the King', 'Into the deep', 'Up the mountain'], 'Into the deep', [
                ['sfx', 'door'], ['note', 'The face closes its eyes, and the door swings open.'], ['remove'], ['xp', 150]
              ])
            ])
          ])
        ]
      },
      k: {
        type: 'foe', sprite: 'hollowwarden', dir: 'down', script: [
          ['say', 'The Hollow Warden', 'I sealed the last door. She asked me to. She took the key into the dark and told me to wall it up behind her, and I did.'],
          ['say', 'The Hollow Warden', 'Three hundred years I have lain here, listening for her knock. It never came.'],
          ['if', 'verse3', [
            ['choice', null, 'The first High Warden raises an unlit lamp.', [
              ['Finch: sing her the third stanza', [
                ['say', 'Finch', '"And when the four had kept their sleep, she found the door would not stay shut; she took the key into the deep, and turned it, and was not seen but..."'],
                ['say', 'The Hollow Warden', '...but by the dead she kept beside. Yes. That is the rest of it. She is still holding it. I can rest now.'],
                ['note', 'The Hollow Warden lays down her lamp, and is only bones.'],
                ['xp', 900], ['bond', 'finch', 1], ['remove']
              ]],
              ['Fight', [['battle', 'hollowwarden'], ['remove']]]
            ]]
          ], [['battle', 'hollowwarden'], ['remove']]]
        ]
      },
      c: {
        type: 'chest', items: { lanternshield: 1, verse4: 1 }, script: [
          ['note', 'In the first High Warden\'s chest: her mail, with a little lamp worked into it, and a strip of vellum.'],
          ['say', 'Finch', '"...and was not seen but by the dead she kept beside; and there she holds the door, and will, until the last lamp lights her home."'],
          ['say', 'Finch', 'She is still there. The Fifth Lamp. She has been holding the door of the Hollow Barrow from the inside for three hundred years.'],
          ['say', 'Maren', 'Until the last lamp lights her home. Lamplighter. The fifth lamp is HER.'],
          ['set', 'verse4'], ['quest', 'crypt', 2], ['bond', 'finch', 1]
        ]
      }
    }
  };
})();
