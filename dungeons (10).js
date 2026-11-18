/* Chapter 2 — the Drowned Abbey (two floors), the sea cave under Saltmere light, and the Mirefen bell tower. */
(function () {
  const D = G.D, M = D.maps;

  /* ---------- the Drowned Abbey, upper floor ----------
     Two ways in: the flooded nave (the Drowned Choir waits there) or the cloister garden door
     (open with abbeyHint, or Dask picks it, or Runa breaks it). The crypt gate opens when the
     outer levers are up and the middle one is down: "two lamps at his hands, none on his heart". */
  const lever = (id, name) => ({
    type: 'obj', gfx: 'lever', gfxIf: ['ab1.' + id, 'leverOn'], script: [['if', 'ab1.gate', [['note', 'The ' + name + ' lever is rusted fast now. The gate is open.']], [
      ['sfx', 'lever'],
      ['if', 'ab1.' + id, [['set', 'ab1.' + id, 0], ['note', 'You push the ' + name + ' lever back down.']], [['set', 'ab1.' + id], ['note', 'You haul the ' + name + ' lever up.']]],
      ['if', 'ab1.l&ab1.o&!ab1.m', [
        ['shake', 450], ['set', 'ab1.gate'],
        ['note', 'Chains rattle inside the walls. In the middle of the hall, the crypt gate grinds open.'],
        ['xp', 40]
      ]]
    ]]]
  });

  M.abbey1 = {
    name: 'The Drowned Abbey', ground: 'stone', ground2: 'cave', music: 'dungeon', bg: 'crypt', dark: 0.7,
    encounters: { rate: 0.05, min: 10, groups: [['abbey_drowned', 1]] },
    onEnter: [['if', 'q.main2<4', [['quest', 'main2', 4]]]],
    rows: [
      '##############################',
      '#############.z.##############',
      '##############g###############',
      '#.l.....m...........p......o.#',
      '#...................h........#',
      '#...I......I.....I.....I.....#',
      '#####.########..########.#####',
      '#.........##~~<<~~###........#',
      '#.KK....A.##~~<<~~###........#',
      '#.....%...##~~<<~~###..""""..#',
      '#.........##~~n<~~###..""""..#',
      '#####r######~~<<~~###.."<<"..#',
      '#.........##~~<<~~###.."<<"..#',
      '#....Q....##~~<<~~###.."<<"..#',
      '#.c.....d.##~~<<~~###.."<<"..#',
      '#.........##~~<<~~###.."<<"..#',
      '##########..........#..""""..#',
      '##########..h.......#..""""..#',
      '##########..........k........#',
      '##########.I......I.#........#',
      '##########..........#........#',
      '##############x###############'
    ],
    things: {
      x: { type: 'warp', to: 'mirefen', at: 'a', gfx: 'daylight', out: 'up' },
      z: { type: 'warp', to: 'abbey2', at: 'u', gfx: 'stairsDown', out: 'down' },
      n: {
        type: 'foe', sprite: 'drownedman', dir: 'down', script: [
          ['if', 'abbeyHint', [['say', 'Maren', 'Do not go in by the nave. She told us. Too late now.']]],
          ['note', 'The black water of the nave heaves. Twelve drowned monks once prayed here. Some of them are still at it.'],
          ['battle', 'choir'], ['remove'],
          ['if', '!abbeyRoute', [['set', 'abbeyRoute', 1]]]
        ]
      },
      k: {
        type: 'obj', gfx: 'lockedDoor', under: 'stone', script: [
          ['note', 'A small door, half-hidden by ivy. The cloister garden.'],
          ['if', 'abbeyHint', [
            ['say', 'Dask', 'The little garden door. Just like we were told. And look: oiled hinges. Somebody uses this a lot.'],
            ['sfx', 'door'], ['remove'], ['if', '!abbeyRoute', [['set', 'abbeyRoute', 2]]], ['xp', 60]
          ], [
            ['choice', null, 'The door is barred from the inside.', [
              ['Dask: work the bar loose', [['check', 'dask', 16, [
                ['say', 'Dask', 'A knife-blade through the crack, lift, and... there.'], ['sfx', 'door'], ['remove'], ['if', '!abbeyRoute', [['set', 'abbeyRoute', 2]]], ['xp', 60]
              ], [['hurt', 'dask', '1d4'], ['say', 'Dask', 'Splinters. In places I will not describe.']]]]],
              ['Runa: break it down', [['check', 'runa', 16, [
                ['sfx', 'hit'], ['shake', 300], ['note', 'Runa goes through the door, and most of the frame goes with her.'], ['remove'], ['if', '!abbeyRoute', [['set', 'abbeyRoute', 2]]], ['xp', 60]
              ], [['hurt', 'runa', '1d4'], ['say', 'Runa', 'Old oak. Older than me. Not for long.']]]]],
              ['Leave it', []]
            ]]
          ]]
        ]
      },
      r: {
        type: 'obj', gfx: 'lockedDoor', script: [
          ['note', 'An iron-bound door. Above it, carved in the lintel: THE PRIOR\'S TREASURY.'],
          ['if', 'item.treasurykey', [['sfx', 'door'], ['say', 'Dask', 'Brannoc\'s key. Some days the world is kind.'], ['remove']],
            [['check', 'dask', 17, [['sfx', 'door'], ['say', 'Dask', 'Monks. They always buy the expensive locks and then never oil them.'], ['remove']],
              [['hurt', 'dask', '1d4'], ['say', 'Dask', 'This one is good. Too good. Maybe there is a key somewhere.']]]]]
        ]
      },
      c: { type: 'chest', items: { drownedkris: 1, greater: 1 } },
      d: { type: 'chest', gold: 90, items: { censer: 1 } },
      l: lever('l', 'left'), m: lever('m', 'middle'), o: lever('o', 'right'),
      p: { type: 'sign', gfx: 'notice', text: '"Two lamps burned at Prior Anselm\'s hands, and none upon his heart, that the dark might keep him."' },
      h: { type: 'obj', gfx: 'shrine', script: [['note', 'An old wayshrine of the Lamplighter, its glass cracked but its wick still dry. Maren lights it, and the party gathers its breath.'], ['run', 'campsite']] },
      g: { type: 'obj', gfx: 'gate', unless: 'ab1.gate', script: [['note', 'An iron gate across the crypt stair. Chains run from it into the walls, toward three levers along the hall.']] }
    }
  };

  /* ---------- the Drowned Abbey, crypt ----------
     The fork: save the fishermen (west) or chase Veyra (east), or trade the Thane's shard if the
     party carries it. Then the tomb gate opens and the Drowned Prior rises. */
  M.abbey2 = {
    name: 'The Abbey Undercroft', ground: 'stone', music: 'dungeon', bg: 'crypt', dark: 0.75,
    rows: [
      '##########################',
      '############u#############',
      '############.#############',
      '############.#############',
      '#........###.###.........#',
      '#<<<<<<<<###.###.........#',
      '#<f<<<<<<###.###.......Q.#',
      '#<<<<<<<<...t............#',
      '#<f<<w<<<............v.l.#',
      '#<<<<<<<<................#',
      '#<f<<<<<<###.###.......h.#',
      '#<<<<<<<<###y###.........#',
      '#######...........########',
      '#######.I......%I.########',
      '#######...........########',
      '#######..M..k...c.########',
      '#######...........########',
      '##########################'
    ],
    things: {
      u: { type: 'warp', to: 'abbey1', at: 'z', gfx: 'stairsUp', out: 'down' },
      t: { type: 'trigger', script: [['run', 'abChoice']] },
      f: { type: 'npc', sprite: 'fisher', unless: 'hostagesLost', dir: 'right', script: [['if', 'ab.done', [
        ['if', 'priorDead', [['say', 'Fisherman', 'Is it over? Is it really over? Get us home. Please.']], [['say', 'Fisherman', 'Something is down there, past that gate. We heard it singing.']]]
      ], [['say', 'Fisherman', 'Help us! The water is coming in!']]]] },
      w: { type: 'npc', sprite: 'hask', unless: 'ab.done', dir: 'right', script: [['say', 'Warden Hask', 'Stay back. The tide decides.']] },
      v: { type: 'npc', sprite: 'veyra', unless: 'veyraGone', dir: 'left', script: [['say', 'Veyra', 'Choose, Maren.']] },
      h: { type: 'obj', gfx: 'altar', script: [['note', 'An altar to the Lamplighter, above the waterline. Maren kneels a moment, and the party breathes easier.'], ['run', 'campsite']] },
      y: { type: 'obj', gfx: 'gate', unless: 'ab.done', script: [['note', 'The gate to the Prior\'s tomb. It will not move.']] },
      k: {
        type: 'foe', sprite: 'prior', dir: 'up', script: [
          ['say', 'The Drowned Prior', 'Who... rings... for me?'],
          ['say', 'Maren', 'No one, Prior Anselm. We have come to put you back to sleep.'],
          ['say', 'The Drowned Prior', 'I kept the door. A hundred years I kept it, under the water, under the lamp. Now the shard is gone, and the lamp is cold, and I am so... thirsty.'],
          ['battle', 'prior'], ['remove'], ['run', 'priorDown']
        ]
      },
      c: { type: 'chest', gold: 60, items: { greater: 2 } },
      l: {
        type: 'obj', gfx: 'lampDead', gfxIf: ['lampLit2', 'shrine'], script: [['if', 'lampLit2', [
          ['note', 'The Abbey lamp burns steady and blue. The water is going down.'],
          ['choice', null, 'Head back to Saltmere?', [['Return to Saltmere', [['run', 'abbeyHome']]], ['Not yet', []]]]
        ], [['if', 'priorDead', [
          ['say', 'Maren', 'Lamplighter, who keeps the door: here is a little light for those who go.'],
          ['sfx', 'magic'], ['set', 'lampLit2'], ['heal'],
          ['note', 'The Abbey lamp catches, and burns blue-white. All through the undercroft the water sighs, and falls.'],
          ['say', 'Finch', 'For those who go. That is from the verse.'],
          ['say', 'Maren', 'It is from the old rite. I wonder now which came first.'],
          ['xp', 60],
          ['choice', null, 'The tide is falling. The fen road will be clear until dawn.', [['Return to Saltmere', [['run', 'abbeyHome']]], ['Not yet', []]]]
        ], [['note', 'The Abbey ward-lamp. Cold. Veyra\'s work.']]]]]]
      }
    }
  };
  D.scripts.abbeyHome = [
    ['fade', 'out', 500],
    ['if', 'hostagesSaved', [['note', 'You lead the fishermen back across Mirefen by the light of the falling tide.']], [['note', 'You cross Mirefen in silence.']]],
    ['warp', 'saltmere', 'u', 'up']
  ];

  /* ---------- the sea cave under the lighthouse (optional) ---------- */
  D.scripts.pipSaved = [
    ['say', 'Pip', 'You killed it! You killed Old Snapjaw! Da said nobody could.'],
    ['say', 'Runa', 'Your da is waiting for you.'],
    ['say', 'Pip', 'I got the oil. I just could not get past the crab. Here, you carry it. It is heavy.'],
    ['give', 'oil'], ['quest', 'light', 2], ['set', 'pipSafe'], ['bond', 'runa', 1]
  ];
  M.seacave = {
    name: 'Sea Cave', ground: 'mud', music: 'dungeon', bg: 'cave', dark: 0.7,
    encounters: { rate: 0.05, min: 10, groups: [['seacrabs', 1], ['seadrowned', 1]] },
    rows: [
      '##########################',
      '#``````````#`````~~~~~~~~#',
      '#`u``````X`#`````~~~~~~~~#',
      '#``````````#``U``~~~~~~~~#',
      '#`````r````#`````~~~~~~~~#',
      '#``````````#`````````````#',
      '#```%``````````````````c`#',
      '#``````````#```d`````````#',
      '#``````````#`````````````#',
      '#~~~~~~~~~```````````````#',
      '#~~~~~~~~~########b#######',
      '#~~~~~~~~~```````````````#',
      '#~~~~~~~~~``````k`````p``#',
      '#~~~~~~~~~````o``````````#',
      '#~~~~~~~~~```````````````#',
      '##########################'
    ],
    things: {
      u: { type: 'warp', to: 'saltmere', at: 'v', gfx: 'daylight', out: 'up' },
      r: { type: 'foe', sprite: 'crab', dir: 'down', script: [['note', 'Shore crabs, big as cart-wheels, sidle out of a crack in the rock.'], ['battle', 'seacrabs'], ['remove']] },
      d: { type: 'foe', sprite: 'drownedman', dir: 'left', script: [['note', 'Drowned smugglers, still guarding their casks.'], ['battle', 'seadrowned'], ['remove'], ['give', 'tag']] },
      c: { type: 'chest', gold: 45, items: { greater: 1 } },
      o: { type: 'chest', gold: 30, items: { tonic: 1 }, script: [['note', 'Smugglers\' casks. Most hold brandy. Dask approves.']] },
      b: {
        type: 'obj', gfx: 'rubble', script: [
          ['note', 'A rockfall chokes the passage. Through the gaps you can hear clicking, and a child crying.'],
          ['check', 'runa', 12, [['sfx', 'lever'], ['shake', 350], ['note', 'Runa heaves the rocks aside.'], ['remove']],
            [['hurt', 'runa', '1d4'], ['say', 'Runa', 'Hold on, child. One more go.']]]
        ]
      },
      k: { type: 'foe', sprite: 'crab', dir: 'right', script: [['run', 'snapjawFight']] },
      p: { type: 'npc', sprite: 'pip', unless: 'pipSafe', dir: 'left', script: [['if', 'x.seacave.k', [['run', 'pipSaved']], [
        ['say', 'Pip', 'Behind you! It is waking up!'], ['run', 'snapjawFight']
      ]]] }
    }
  };
  D.scripts.snapjawFight = [
    ['note', 'The heap of barnacled rock by the oil casks unfolds into a crab the size of a fishing boat.'],
    ['say', 'Dask', 'That is not a crab. That is a building with claws.'],
    ['battle', 'snapjaw'], ['remove', 'seacave.k'], ['run', 'pipSaved']
  ];

  /* ---------- the Mirefen bell tower (optional) ---------- */
  const bell = (id, n, name) => ({
    type: 'obj', gfx: 'bell', gfxIf: ['bt.n>=' + n, 'bellRung'], script: [['if', 'bt.open', [['note', 'The ' + name + ' hangs still.']], [
      ['sfx', 'bell'],
      ['if', 'bt.n=' + (n - 1), [
        ['set', 'bt.n', n], ['note', 'You ring the ' + name + '. The note hangs in the air, and does not fade.'],
        ['if', 'bt.n=4', [['shake', 500], ['set', 'bt.open'], ['note', 'All four notes ring together. Above you, the belfry hatch swings open.'], ['xp', 60]]]
      ], [
        ['set', 'bt.n', 0], ['note', 'You ring the ' + name + '. The notes jangle against each other and the tower shudders. Something cold rushes through the party.'],
        ['hurt', 'all', '1d4']
      ]]
    ]]]
  });
  M.belltower = {
    name: 'The Sunken Bell Tower', ground: 'stone', music: 'dungeon', bg: 'crypt', dark: 0.65,
    rows: [
      '##################',
      '#######k..c#######',
      '########h#########',
      '#..l..........m..#',
      '#................#',
      '#.......p........#',
      '#..o..........q..#',
      '#................#',
      '#<<<<<<<<<<<<<<<<#',
      '#<<<<<<<..<<<<<<<#',
      '#<<<<<<<w.<<<<<<<#',
      '#<<<<<<<..<<<<<<<#',
      '#<<<<<<<u.<<<<<<<#',
      '##################'
    ],
    things: {
      u: { type: 'warp', to: 'mirefen', at: 'z', gfx: 'daylight', out: 'up' },
      w: { type: 'foe', sprite: 'marshlight', dir: 'down', script: [['note', 'Marsh lights crowd the drowned stair, a dozen little green flames.'], ['battle', 'belllights'], ['remove']] },
      l: bell('l', 1, 'great bell'), m: bell('m', 2, 'sea-bell'), o: bell('o', 3, 'small bell'), q: bell('q', 4, 'cracked bell'),
      p: { type: 'sign', gfx: 'notice', script: [
        ['note', 'Words cut into the floor, under the four bells: "Speak first for the deep, where the dead lie down. Then for the sea, that took them."'],
        ['note', '"Then small, for the children who waited. Last, broken, for the one who kept the door alone."'],
        ['if', 'bellHint', [['say', 'Finch', 'Deep, sea, small, cracked. Mother Brine\'s order. The verse was here all along.']]]
      ] },
      h: { type: 'obj', gfx: 'lockedDoor', unless: 'bt.open', script: [['note', 'A hatch in the belfry ceiling, sealed fast. The four bells hang silent around you.']] },
      k: {
        type: 'foe', sprite: 'wraith', dir: 'down', script: [
          ['note', 'In the belfry, something wearing a bell for a helm turns its head.'],
          ['say', 'Finch', 'Ah. The bell-ringer.'],
          ['battle', 'bellwraith'], ['remove']
        ]
      },
      c: {
        type: 'chest', items: { bellmail: 1, verse2: 1 }, script: [
          ['note', 'Inside the bell-ringer\'s chest: mail rung out of old bronze, and a strip of vellum wrapped in oilcloth.'],
          ['say', 'Finch', '"She held it through the longest night, and asked no crown, and took no throne; she kept the door, she kept the light, and kept the keeping all alone."'],
          ['say', 'Finch', 'She. The fifth Lamp was a woman. And she kept the door alone.'],
          ['say', 'Maren', 'Kept it from which side, I wonder.'],
          ['set', 'verse2'], ['bond', 'finch', 1]
        ]
      }
    }
  };
})();
