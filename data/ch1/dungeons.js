/* Chapter 1 — two optional mini-dungeons that reward explorers.
   They give fixed fights only (no random encounters), so their XP is predictable:
     The Old Cistern (under Brackenford's well), levels 1-2, about 125 XP.
     The Doorward's Chapel (south-east Thornwood, behind brambles), levels 2-3, about 145 XP.
   Main story + one dungeon stays at level 3; main story + both reaches level 4.
   Rewards lean on gear and lore rather than XP.

   Flags: cisternFound, sluice, cistern (stash found), ledger (Orrin & Sons, Highmoor, banks for the Hand),
          chapelHint, chapel.step, chapel.lit.<n>, chapel.open, verse1 (first lines of the fifth verse). */
(function () {
  const D = G.D, M = D.maps;

  Object.assign(D.speakers, { 'The Hollow Abbot': '#a8b8d8' });
  Object.assign(D.sprites, {
    abbot: { skel: 1, robe: 1, hood: '#3a3448' }
  });
  Object.assign(D.pix, {
    ratking: { pal: { a: '#6a5a6a', b: '#433846', p: '#e8a0a0', e: '#ff4a3a', g: '#e8c14a' }, rows: [
      '................', '................', '................', '................', '.........g.g.g..', '.........ggggg..',
      '..........pp....', '.........apaa...', '....aaaaaaaaea..', '...aaaaaaaaaaaap', '..aaaaaaaaaaaa..', 'p.aaaaaaaaaaa...',
      '.paaba...abaa...', '..p.b.b...b.b...', '................', '................'] },
    wisp: { pal: { w: '#eef8ff', b: '#8ac0f0', c: '#3a6fb8', e: '#1a1420' }, rows: [
      '................', '.......c........', '......cc........', '.....cbbc.......', '....cbwwbc......', '....bwwwwb......',
      '...cbwwwwbc.....', '...bwwwwwwb.....', '...bweweewb.....', '...bwwwwwwb.....', '....bwwwwb......', '.....bbbb.......',
      '......cc........', '.......c........', '................', '................'] }
  });

  /* ---------- the Old Cistern ---------- */
  M.cistern = {
    name: 'The Old Cistern', ground: 'stone', music: 'dungeon', bg: 'cave', dark: 0.8,
    rows: [
      '########################',
      '#u...#.......~~........#',
      '#.........b..~~...r....#',
      '#.n..#.......==........#',
      '##.###.......~~...######',
      '#....#.......~~...#c..d#',
      '#.w..........~~...g....#',
      '#....#.......~~...#..X.#',
      '######.......==...######',
      '#.....#......~~........#',
      '#..k.........~~..e.....#',
      '#.....#......~~........#',
      '#..%..#......~~....%...#',
      '########################'
    ],
    things: {
      u: { type: 'warp', to: 'brackenford', at: 'w', gfx: 'ladder', out: 'down' },
      n: { type: 'sign', gfx: 'notice', text: 'Chalk on the wall, in a heavy hand: SLUICE OPENS THE STASH. TELL NOBODY. - B.' },
      b: { type: 'foe', sprite: 'bat', dir: 'right', script: [['note', 'The ceiling moves. It is not the ceiling.'], ['battle', 'b1_bats'], ['remove']] },
      r: { type: 'foe', sprite: 'rat', dir: 'left', script: [['note', 'A tide of rats pours out of a drain.'], ['battle', 'wood_rats'], ['remove']] },
      w: {
        type: 'obj', gfx: 'wheel', script: [['if', 'sluice', [['note', 'The sluice wheel is turned. Water gurgles away east.']], [
          ['note', 'A rusted sluice wheel. A chain runs from it into the wall, heading east.'],
          ['check', 'runa', 12, [
            ['sfx', 'lever'], ['shake', 400], ['say', 'Runa', 'Turn.'],
            ['note', 'It turns. Somewhere east, water drains away and iron grinds upward.'],
            ['set', 'sluice'], ['xp', 10]
          ], [['hurt', 'runa', '1d3'], ['say', 'Runa', 'Rusted solid. Again.']]]
        ]]]
      },
      g: { type: 'obj', gfx: 'gate', unless: 'sluice', script: [['note', 'An iron grate across the passage, half under water. Its chain runs off to the west.']] },
      c: {
        type: 'chest', gold: 40, items: { ledger: 1, draught: 2 }, script: [
          ['note', 'Under an oilcloth: Brackenford candlesticks, a bolt of Saltmere silk, and a ledger in a cramped hand.'],
          ['say', 'Dask', 'Brannoc Vosk keeps accounts. Of course he does. "Grave silver, bought from the barrow diggers. Sent on to Orrin and Sons, Highmoor. Paid in full, by the Hand."'],
          ['say', 'Dask', 'Orrin and Sons. That is the counting-house that holds my paper.'],
          ['say', 'Maren', 'Then whoever signs with a pale hand banks where your debts are kept.'],
          ['say', 'Runa', 'Small world.'],
          ['set', 'ledger'], ['set', 'cistern'], ['xp', 15]
        ]
      },
      d: { type: 'chest', lock: 13, items: { silks: 1 } },
      e: { type: 'chest', items: { tonic: 1, bitterroot: 2 } },
      k: {
        type: 'foe', sprite: 'ratking', dir: 'right', script: [
          ['note', 'On a throne of broken casks sits a rat the size of a dog, wearing a tin crown.'],
          ['say', 'Finch', 'Friends, I believe we have found the true ruler of Brackenford.'],
          ['battle', 'ratking'], ['remove'],
          ['say', 'Dask', "Long live the king. Briefly."]
        ]
      }
    }
  };

  /* ---------- the Doorward's Chapel ---------- */
  // Light the sconces in the order of the verse: Dawn (m), Road (p), Hearth (l), Door (o).
  const sconce = (n, carving, step) => ({
    type: 'obj', gfx: 'lampDead', gfxIf: ['chapel.lit.' + n, 'shrine'], script: [['if', 'chapel.lit.' + n, [['note', 'The ' + carving + ' sconce burns steady.']], [
      ['note', 'A cold lamp-sconce, carved with ' + ({ dawn: 'a rising sun', road: 'a walking boot', hearth: 'a hearth fire', door: 'an open door' })[carving] + '.'],
      ['choice', null, 'Light it?', [
        ['Light it', [['if', 'chapel.step=' + step, [
          ['sfx', 'magic'], ['set', 'chapel.lit.' + n], ['add', 'chapel.step'],
          ['note', 'The flame takes, and holds.'],
          ['if', 'chapel.step=4', [
            ['shake', 400], ['sfx', 'lever'], ['set', 'chapel.open'],
            ['note', 'All four flames lean north at once. At the head of the nave, stone grinds against stone.'],
            ['xp', 25]
          ]]
        ], [
          ['sfx', 'bad'], ['note', 'The flame flares white and lashes out. Every sconce in the chapel gutters dark.'],
          ['hurt', 'all', '1d4'], ['run', 'chapelReset'],
          ['say', 'Maren', 'Wrong order. The verse on the plaque by the door will say which comes first.']
        ]]]],
        ['Leave it', []]
      ]]
    ]]]
  });
  D.scripts.chapelReset = [['set', 'chapel.step', 0], ['set', 'chapel.lit.l', 0], ['set', 'chapel.lit.m', 0], ['set', 'chapel.lit.o', 0], ['set', 'chapel.lit.p', 0]];

  M.chapel = {
    name: "The Doorward's Chapel", ground: 'stone', music: 'dungeon', bg: 'crypt', dark: 0.75,
    rows: [
      '##################',
      '#######..c..######',
      '#######Q.k.Q######',
      '#######.....######',
      '#########q########',
      '#l..I.......I...m#',
      '#...............d#',
      '#...I.......I....#',
      '#........w.......#',
      '#o..I.......I...p#',
      '#.......v........#',
      '#........u.......#',
      '##################'
    ],
    things: {
      u: { type: 'warp', to: 'thornwood', at: 'y', gfx: 'stairsUp', out: 'up' },
      v: {
        type: 'sign', gfx: 'notice', script: [
          ['note', 'A brass plaque, green with age, in the old script.'],
          ['check', 'maren', 10, [['say', 'Maren', 'It is a prayer, and an instruction. Listen.']],
            [['say', 'Maren', 'The old script is beyond me... Finch?'], ['say', 'Finch', 'It scans. I know the rhythm, if not the words. Let me try.']]],
          ['note', '"First the dawn that wakes the vale, then the road the brave must walk, then the hearth that waits at home, and last the door the fifth one kept."'],
          ['say', 'Finch', 'Dawn, road, hearth, door. The fifth one kept the door. That is my grandmother\'s line. Nearly.']
        ]
      },
      l: sconce('l', 'hearth', 2),
      m: sconce('m', 'dawn', 0),
      o: sconce('o', 'door', 3),
      p: sconce('p', 'road', 1),
      w: { type: 'foe', sprite: 'wisp', dir: 'down', script: [['note', 'Pale lights drift up out of the pews and turn toward you.'], ['battle', 'wisps'], ['remove']] },
      d: { type: 'chest', lock: 12, gold: 35, items: { tonic: 2 } },
      q: { type: 'obj', gfx: 'lockedDoor', unless: 'chapel.open', script: [['note', 'A stone door carved with a flame shaped like a keyhole. It does not move. The four cold sconces in the nave seem to be waiting for something.']] },
      k: {
        type: 'foe', sprite: 'abbot', dir: 'down', script: [
          ['note', 'Before the reliquary stands a figure in a rotted habit, a lamp-key still hanging at its belt.'],
          ['say', 'The Hollow Abbot', 'None pass. The Doorward sleeps. None pass.'],
          ['say', 'Maren', 'He kept his post after his own lamp went out. Gently, if we can.'],
          ['battle', 'abbot'], ['remove'],
          ['note', 'Maren closes what is left of his hands around the lamp-key, and says the short rite over him.']
        ]
      },
      c: {
        type: 'chest', items: { doorward: 1, verse: 1 }, script: [
          ['note', 'Inside the reliquary: a slim rapier with a lantern-cage guard, and a strip of vellum.'],
          ['say', 'Finch', '...Listen. "Four lamps they lit to bar the way, and four still burn where kings lie low. The fifth was set to hold the gate for those who come, and those who go."'],
          ['say', 'Finch', 'Hold the gate. Not shut it. That is the fifth verse, or the start of it. My grandmother knew this.'],
          ['say', 'Maren', 'For those who come and those who go. That is not a lamp for keeping the dead in.'],
          ['say', 'Runa', 'Then what is it for?'],
          ['say', 'Finch', 'I do not know yet. But I know where to keep looking.'],
          ['set', 'verse1'], ['bond', 'finch', 1]
        ]
      }
    }
  };

  /* ---------- enemies, groups, items ---------- */
  Object.assign(D.enemies, {
    ratking: { name: 'The Rat King', sprite: 'ratking', scale: 4, hp: 58, ac: 12, atk: 5, dmg: '1d8+2', spd: 3, save: 1, xp: 45, gold: [15, 25], tags: ['beast'],
      immune: ['asleep'], moves: [[3, 'attack'], [2, 'venombite'], [1, 'savage']], loot: [['ratcrown', 1]] },
    wisp: { name: 'Gloom Wisp', sprite: 'wisp', hp: 12, ac: 14, atk: 4, dmg: '1d4+2', pow: 2, spd: 5, save: 1, xp: 12, gold: [0, 3], tags: ['undead'],
      immune: ['asleep', 'poison'], moves: [[2, 'attack'], [1, 'spark']] },
    abbot: { name: 'The Hollow Abbot', sprite: 'abbot', hp: 60, ac: 13, atk: 5, dmg: '1d8+2', pow: 3, spd: 1, save: 2, xp: 60, gold: [20, 30], tags: ['undead'],
      immune: ['asleep', 'poison'], moves: [[3, 'attack'], [2, 'gravechill'], [1, 'hex']] }
  });
  Object.assign(D.groups, {
    ratking: { enemies: ['rat', 'rat'], waves: [['ratking', 'rat']], waveText: ['The Rat King himself scuttles out of the dark!'], boss: true, intro: 'Rats boil out of the walls. Something bigger squeals behind them.' },
    wisps: { enemies: ['wisp', 'wisp', 'wisp'] },
    abbot: { enemies: ['wisp', 'abbot', 'wisp'], boss: true, intro: 'The Hollow Abbot raises his lamp-key, and the dark answers.' }
  });
  Object.assign(D.items, {
    ledger: { name: 'Vosk Ledger', type: 'key', desc: 'Brannoc Vosk\'s accounts. Grave silver, fenced through Orrin and Sons of Highmoor, "paid in full, by the Hand."' },
    verse: { name: 'The Fifth Verse', type: 'key', desc: '"Four lamps they lit to bar the way, and four still burn where kings lie low. The fifth was set to hold the gate for those who come, and those who go."' },
    ratcrown: { name: "Rat King's Crown", type: 'charm', mods: { hp: 4, save: 1 }, desc: 'Tin, bent, and slightly chewed. Surprisingly lucky.' },
    silks: { name: "Smuggler's Silks", type: 'armor', for: ['dask'], mods: { ac: 2, spd: 2 }, desc: 'Dark, quiet, and cut for someone who would rather not be seen.' },
    doorward: { name: "Doorward's Rapier", type: 'weapon', for: ['finch'], dmg: '1d8', mods: { pow: 1, spd: 1 }, desc: 'A slim blade with a lantern-cage guard, from the chapel of the fifth Lamp.' }
  });

  D.chronicle = (D.chronicle || []).concat(
    [['cistern', "You found the Vosks' stash in the old cistern, and a ledger that leads to Highmoor."],
    ['x.cistern.k', 'The Rat King of Brackenford is no more.'],
    ['verse1', "Finch found the first lines of the fifth verse in the Doorward's Chapel."]
  ]);
})();
