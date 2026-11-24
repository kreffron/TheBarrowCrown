/* Chapter 3, expanded.
   Main story: The Rime Door (quest act3). The Cairn's door has been frozen shut by a Pale Hand rite worked from an
   altar at the Frozen Falls, east of the pass. Rime-Mother Hesk keeps the altar; break it and the ice lets go
   (flag act3done). Between the Hall of Oaths and Hrimgar's barrow lies the Sleepers' Vault: three cold braziers
   must be lit before the vault door opens, and Hedda of the High Moor's shield-man still keeps her tomb.
   Side quests (Karrow's notice board): Grimtusk's Raiders (raiders), Asta's Dogs (dogs3), The Bridge Troll
   (troll3), The Pass Runestones (runes3), Old Whitepaw (whitepaw), The Frozen Shrine (shrine3). */
(function () {
  const D = G.D, M = D.maps;
  (D.xpScale = D.xpScale || {})[3] = 0.52;
  Object.assign(D.speakers, { 'Rime-Mother Hesk': '#b8e0f0', Grimtusk: '#9ad04a', 'Hedda\'s Shield': '#c8d8f0' });
  Object.assign(D.sprites, {
    rimemother: { skin: '#d8e0f0', hair: '#f0f4ff', top: '#5a7a9a', legs: '#3a4a6a', robe: 1, hood: '#8ab0d0', trim: '#e8f4ff', eyes: '#8ae0ff' },
    grimtusk: { skin: '#6a8a4a', bald: 1, ears: 1, eyes: '#ffe14a', top: '#e8e8f0', legs: '#4a3a2a', trim: '#c8c8d4' }
  });
  Object.assign(D.looks, { rimemother: { held: 'staff', cape: '#c8e0f0' }, grimtusk: { held: 'axe', fur: '#e8e8f0', scar: 1, big: 1 } });
  Object.assign(D.enemies, {
    rimemother: { name: 'Rime-Mother Hesk', sprite: 'rimemother', scale: 3, hp: 200, ac: 16, atk: 9, dmg: '1d10+5', pow: 8, spd: 3, save: 5, range: 5, xp: 300, gold: [80, 80], tags: ['human'], moves: [[2, 'attack'], [2, 'frostbreath'], [1, 'gravechill']] },
    rimegolem: { name: 'Rime Golem', sprite: 'golem', hp: 95, ac: 17, atk: 9, dmg: '2d6+5', spd: 1, save: 4, xp: 140, gold: [0, 0], tags: ['construct'], immune: ['asleep', 'poison'], moves: [[3, 'attack'], [1, 'stomp']] },
    frostbound: { name: "Hedda's Shield", sprite: 'wight', scale: 3, hp: 270, ac: 18, atk: 10, dmg: '1d10+6', pow: 6, spd: 2, save: 5, xp: 320, gold: [40, 40], tags: ['undead'], immune: ['asleep', 'poison'], moves: [[3, 'attack'], [1, 'shieldwall'], [1, 'gravechill']] },
    raider: { name: 'Hill Goblin Raider', sprite: 'goblin', hp: 50, ac: 15, atk: 8, dmg: '1d8+4', spd: 4, save: 2, xp: 62, gold: [6, 14], tags: ['goblin'] },
    raiderbow: { name: 'Hill Goblin Slinger', sprite: 'archer', hp: 40, ac: 14, atk: 8, dmg: '1d8+3', spd: 4, save: 2, range: 6, xp: 58, gold: [6, 12], tags: ['goblin'] },
    grimtusk: { name: 'Grimtusk', sprite: 'grimtusk', hp: 190, ac: 16, atk: 10, dmg: '2d6+5', spd: 3, save: 4, xp: 230, gold: [90, 90], tags: ['goblin'], immune: ['asleep'], moves: [[3, 'attack'], [1, 'maul']] },
    frosttroll: { name: 'Frost Troll', sprite: 'giant', scale: 2, hp: 220, ac: 15, atk: 10, dmg: '2d8+5', spd: 2, save: 4, xp: 240, gold: [30, 50], tags: ['giant'], moves: [[3, 'attack'], [1, 'stomp']] },
    whitepaw: { name: 'Old Whitepaw', sprite: 'bear', scale: 3, hp: 240, ac: 15, atk: 10, dmg: '2d6+6', spd: 3, save: 4, xp: 240, gold: [0, 0], tags: ['beast'], moves: [[3, 'attack'], [1, 'maul']] },
    snowbear: { name: 'Snow Bear', sprite: 'bear', hp: 90, ac: 14, atk: 9, dmg: '1d10+5', spd: 3, save: 3, xp: 110, gold: [0, 0], tags: ['beast'] }
  });
  Object.assign(D.groups, {
    fl_wolves: { enemies: ['frostwolf', 'frostwolf', 'frostwolf'], intro: 'Wolves on the falls path. Someone has fed them: there are grey scraps in the snow.' },
    fl_picket: { enemies: ['hlacolyte', 'hlzealot', 'hlacolyte'], intro: 'Frost-priests on picket, chanting into the wind.' },
    fl_golems: { enemies: ['rimegolem', 'rimegolem'], intro: 'Two shapes of packed ice and stone heave up out of the drifts.' },
    fl_reavers: { enemies: ['hlzealot', 'hlzealot'], waves: [['hlacolyte', 'hlzealot']], waveText: ['More grey cloaks come down the ice-steps!'], intro: 'Reavers bar the steps to the altar.' },
    rimemother: { enemies: ['frostspirit', 'rimemother', 'rimegolem'], waves: [['frostspirit', 'frostspirit']], waveText: ['Hesk lifts her staff, and the falls give up two more spirits.'], boss: true, intro: 'The Rime-Mother turns from her altar. Her breath does not steam. It snows.' },
    sv_wights: { enemies: ['icewight', 'icewight'], intro: 'The Cairnwardens of Karrow are still at their posts.' },
    sv_spirits: { enemies: ['frostspirit', 'frostspirit', 'frostspirit'], intro: 'The cold in here has a shape, and it moves.' },
    sv_diggers: { enemies: ['hlacolyte', 'snowgoblin', 'hlacolyte'], waves: [['snowgoblin', 'snowgoblin']], waveText: ['Goblin diggers scramble out of a fresh tunnel.'], intro: 'The Pale Hand have got in by a back way, and they are prising open the tombs.' },
    sv_golems: { enemies: ['rimegolem', 'icewight'], intro: 'A tomb-guardian of ice and an armoured dead man step together into your path.' },
    sv_hall: { enemies: ['icewight', 'frostspirit', 'rimegolem'], intro: 'The last tomb-hall is guarded.' },
    frostbound: { enemies: ['icewight', 'frostbound', 'icewight'], waves: [['frostspirit']], waveText: ['Hedda\'s Shield strikes the floor, and the cold answers.'], boss: true, intro: "Hedda's Shield lowers his visor." },
    gd_door: { enemies: ['raider', 'raider', 'raiderbow'], intro: 'Raiders at the den mouth, gnawing on somebody\'s mutton.' },
    gd_pens: { enemies: ['raider', 'snowbear', 'raider'], intro: 'They have a bear on a chain. They let it off the chain.' },
    gd_hall: { enemies: ['raiderbow', 'raider', 'raiderbow'], waves: [['raider', 'raider']], waveText: ['Grimtusk bangs a pot, and more raiders come running.'], intro: 'The den is full of stolen Karrow goods, and goblins.' },
    grimtusk: { enemies: ['raider', 'grimtusk', 'raiderbow'], boss: true, intro: 'Grimtusk stands up from a throne of sledges.' },
    dogs_a: { enemies: ['frostwolf', 'frostwolf'], intro: 'Frost wolves have a sled-dog cornered under a rock.' },
    dogs_b: { enemies: ['frostwolf', 'frostwolf', 'frostwolf'], intro: 'Three wolves. One very angry sled-dog.' },
    troll3: { enemies: ['frosttroll', 'frostwolf'], boss: true, intro: 'The Frost Troll stands up from under the snow, which was him all along.' },
    runes3: { enemies: ['frostspirit', 'icewight', 'frostspirit'], intro: 'The last runestone does not want to be read.' },
    whitepaw: { enemies: ['snowbear', 'whitepaw'], boss: true, intro: 'Old Whitepaw. Hrolf was right. He is the size of a house.' },
    is_spirits: { enemies: ['frostspirit', 'frostspirit'], intro: 'Spirits whirl about the frozen shrine.' },
    is_keeper: { enemies: ['icewight', 'frostspirit', 'icewight'], intro: 'The shrine\'s keepers rise from the ice.' }
  });
  Object.assign(D.quests, {
    act3: { name: 'The Rime Door', short: 'Rime Door', ch: 3, done: 3, stages: {
      1: "The Cairn's door is frozen under a yard of grey ice that will not melt. Eydis says the Pale Hand built a rime-altar at the Frozen Falls, east of the pass.",
      2: 'The rime-altar is broken and Hesk is dead. The ice on the Cairn door is letting go.',
      3: 'The Cairn door is open.' } },
    raiders: { name: "Grimtusk's Raiders", short: 'Raiders', ch: 3, done: 2, stages: {
      1: "Hill goblins under a chief called Grimtusk have been raiding Karrow's outlying farms. Their den is in the western pass.",
      2: 'Grimtusk is beaten and the stolen goods are going home.' } },
    dogs3: { name: "Asta's Dogs", short: "Asta's Dogs", ch: 3, done: 3, stages: {
      1: "Two of Asta's sled-dogs, Kettle and Snorri, ran off in a storm and did not come home. Somewhere in the pass.",
      2: 'Both dogs are found. Tell Asta.',
      3: 'Kettle and Snorri are home, and very pleased with themselves.' } },
    troll3: { name: 'The Bridge Troll', short: 'Bridge Troll', ch: 3, done: 2, stages: {
      1: "Bounty: a Frost Troll has been taking travellers by the ford in the south of the pass. 300 gold from the clan.",
      2: 'The Frost Troll is dead. The ford is safe.' } },
    runes3: { name: 'The Pass Runestones', short: 'Runestones', ch: 3, done: 2, stages: {
      1: 'Old Thora says four runestones in the pass tell how the Cairn was raised. Nobody has read them in a hundred years.',
      2: 'You have read all four runestones. Thora will want to hear.' } },
    whitepaw: { name: 'Old Whitepaw', short: 'Whitepaw', ch: 3, done: 2, stages: {
      1: 'Hrolf wants the pelt of Old Whitepaw, the great snow bear of the north pass, which killed his father.',
      2: 'Old Whitepaw is dead. Hrolf did not say thank you, but he did cry a bit.' } },
    shrine3: { name: 'The Frozen Shrine', short: 'Frozen Shrine', ch: 3, done: 2, stages: {
      1: "A shrine of the old Wardens lies frozen in a cleft north of the falls. Its lamp went out when Kell's did.",
      2: 'The frozen shrine burns again.' } }
  });
  Object.assign(D.items, {
    rimestaff: { name: 'Rime-Mother\'s Charm', type: 'charm', mods: { pow: 3, save: 1 }, price: 420, desc: 'A shard of altar-ice that never melts. Maren hates it, and wears it anyway.' },
    grimaxe: { name: "Grimtusk's Cleaver", type: 'weapon', for: ['runa'], dmg: '2d8+1', mods: { atk: 1, spd: -1 }, price: 520, desc: 'Ugly, heavy, and very sharp.' },
    trollhide: { name: 'Troll-hide Vest', type: 'armor', for: ['finch', 'dask'], mods: { ac: 5, hp: 8 }, price: 520, desc: 'It smells. It also stops axes.' },
    whitepelt: { name: "Whitepaw's Pelt", type: 'key', desc: 'Enormous, white and heavy. For Hrolf.' },
    shrinelamp: { name: 'Shrine Lamp-glass', type: 'charm', mods: { hp: 10, save: 2 }, price: 380, desc: 'A Warden lamp-glass from the Frozen Shrine. It is always faintly warm.' },
    runestone3: { name: 'Runestone Rubbings', type: 'key', desc: 'Four charcoal rubbings of the pass runestones, for Thora.' }
  });

  /* ---------- the Cairn door is frozen until the rime-altar is broken ---------- */
  const door = M.frostpass.things.a;
  door.script = [['if', '!act3done', [
    ['if', '!act3', [
      ['note', 'The Cairn door is gone under a yard of grey ice. It is not snow-ice. It is smooth, and it hums.'],
      ['say', 'Runa', 'I can break ice.'],
      ['note', 'Runa swings. The axe rings off and the ice is unmarked.'],
      ['say', 'Maren', 'Not this ice. It is a rite. Somebody is working it, now, from somewhere close.'],
      ['say', 'Dask', 'There is smoke over the Frozen Falls, east of here. Nobody lives at the falls.'],
      ['set', 'act3'], ['quest', 'act3', 1]
    ], [['note', 'The grey ice holds. The rite is worked from the Frozen Falls, east of the pass.']]],
    ['end']
  ]], ['if', 'q.act3<3', [['note', 'The grey ice has cracked through and fallen away in plates. The Cairn door stands open.'], ['quest', 'act3', 3]]]];

  /* ---------- the Frozen Falls ---------- */
  M.falls = {
    name: 'The Frozen Falls', ground: 'snow', music: 'frost', bg: 'snow',
    rows: [
      '{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{',
      '{}}}}}}}}}}}}))))))}}}}}}}}}}{',
      '{}.....}}}}}))z)))}}}}.....c}{',
      '{}..a...}}}}))).)))}}}.......{',
      '{}........}}}...e...}........{',
      '{}}.........................}{',
      '{.......b.......:...........}{',
      '{........::::::::....g.....d}{',
      '{w:::::::::.................}{',
      '{...........................}{',
      '{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{'
    ],
    things: {
      w: { type: 'warp', to: 'frostpass', at: '?', gfx: 'path', under: 'path', out: 'right' },
      a: { type: 'foe', sprite: 'wolf', dir: 'right', script: [['battle', 'fl_wolves'], ['remove']] },
      b: { type: 'foe', sprite: 'frostacolyte', dir: 'left', script: [['battle', 'fl_picket'], ['remove'],
        ['note', 'One of the priests has a letter in his sleeve, in the same clerk\'s hand as the Orrin and Sons receipt.'],
        ['say', 'Finch', '"Keep the door shut until the Sister has gone down. Payment as agreed. O. & S."'],
        ['say', 'Runa', '"Until the Sister has gone down." Veyra is already inside the Cairn.'],
        ['say', 'Maren', 'Then we are late. Again.']] },
      g: { type: 'foe', sprite: 'golem', dir: 'left', script: [['battle', 'fl_golems'], ['remove']] },
      e: { type: 'foe', sprite: 'frostzealot', dir: 'down', script: [['battle', 'fl_reavers'], ['remove']] },
      c: { type: 'chest', gold: 160, items: { potent: 2 } },
      d: { type: 'chest', items: { potent: 1, greater: 2 }, gold: 90 },
      z: { type: 'foe', sprite: 'rimemother', dir: 'down', script: [
        ['say', 'Rime-Mother Hesk', 'Lamp-girl. The Sister said you would follow her like a dog. She was sorry about it.'],
        ['say', 'Maren', 'Veyra is not sorry about anything.'],
        ['say', 'Rime-Mother Hesk', 'You do not know her at all, do you? Ah. Then you will not mind if I keep you out here in the cold.'],
        ['battle', 'rimemother'], ['remove'],
        ['note', 'Runa brings her axe down on the rime-altar. It splits with a sound like a frozen lake breaking, and the falls start to run.'],
        ['say', 'Dask', 'Listen. Water. Real water.'],
        ['say', 'Maren', 'And the Cairn door with it. Come on.'],
        ['set', 'act3done'], ['quest', 'act3', 2], ['give', 'rimestaff'], ['xp', 120], ['save']
      ] }
    }
  };
  M.falls.things.w.at = D.placeNear('frostpass', null, 43, 18, { tag: 'toFalls', type: 'warp', to: 'falls', at: 'w', gfx: 'path', under: 'path', out: 'left' });

  /* ---------- the Sleepers' Vault: between the Hall of Oaths and Hrimgar's barrow ---------- */
  M.cairn1.things.z.to = 'vault3'; M.cairn1.things.z.at = 'u';
  M.cairn2.things.u.to = 'vault3'; M.cairn2.things.u.at = 'z';
  function brazier(n, text) {
    return [['if', 'brz3.' + n, [['note', 'The brazier burns steady.']], [
      ['note', 'A Warden brazier, cold for a hundred years. ' + text],
      ['say', 'Maren', 'Lamplighter, lend me your fire.'],
      ['note', 'The coals catch, white, then gold.'],
      ['set', 'brz3.' + n], ['xp', 25]
    ]]];
  }
  M.vault3 = {
    name: "The Sleepers' Vault", ground: 'stone', music: 'dungeon', bg: 'crypt', dark: 0.8,
    rows: [
      '########################',
      '#....#......z.....#....#',
      '#.1..#............#..2.#',
      '#....#......k.....#....#',
      '#....#######y######....#',
      '##.####.........####.###',
      '#......................#',
      '#..a.....)))))....b....#',
      '#........)))))....e....#',
      '#..c.....)))))........d#',
      '###.####.......####.####',
      '#......#.......#.......#',
      '#...3..f.......g...h...#',
      '#......#...u...#.......#',
      '########################'
    ],
    things: {
      u: { type: 'warp', to: 'cairn1', at: 'z', gfx: 'stairsUp', out: 'up' },
      z: { type: 'warp', to: 'cairn2', at: 'u', gfx: 'stairsDown', out: 'down' },
      f: { type: 'foe', sprite: 'wight', dir: 'left', script: [['run', 'svIntro'], ['battle', 'sv_wights'], ['remove']] },
      g: { type: 'foe', sprite: 'frostacolyte', dir: 'right', script: [['run', 'svIntro'], ['battle', 'sv_diggers'], ['remove'],
        ['note', 'The diggers had a map. It shows the Cairn, the vault, and a door below them all marked with a grey hand.'],
        ['say', 'Dask', 'They are not here for the giant. They are here for whatever he is lying on.']] },
      a: { type: 'foe', sprite: 'frostspirit', dir: 'right', script: [['battle', 'sv_spirits'], ['remove']] },
      b: { type: 'foe', sprite: 'golem', dir: 'left', script: [['battle', 'sv_golems'], ['remove']] },
      e: { type: 'foe', sprite: 'wight', dir: 'left', script: [['battle', 'sv_hall'], ['remove']] },
      c: { type: 'chest', gold: 140, items: { potent: 2 } },
      d: { type: 'chest', items: { potent: 2, greater: 2 }, gold: 160 },
      h: { type: 'obj', gfx: 'statue', script: [
        ['note', 'A tomb with a woman carved on the lid, a lamp at her feet and a shield over her heart. HEDDA OF THE HIGH MOOR.'],
        ['say', 'Maren', 'Hedda. The second Warden. The plaque in the Thornwood said she went north and was never seen again.'],
        ['say', 'Runa', 'She came to Karrow. The clan kept her. It is what we do.'],
        ['note', 'Cut into the side of the tomb: SHE GAVE HER PIECE TO THE SLEEPER, THAT HE MIGHT SLEEP SOUNDER. HER SHIELD STAYS TO WATCH.'],
        ['if', '!svLore', [['xp', 40], ['set', 'svLore']]]
      ] },
      1: { type: 'obj', gfx: 'brazier', script: brazier(1, 'Carved on the bowl: EAGLE, WHO SEES.') },
      2: { type: 'obj', gfx: 'brazier', script: brazier(2, 'Carved on the bowl: WOLF, WHO KEEPS THE PACK.') },
      3: { type: 'obj', gfx: 'brazier', script: brazier(3, 'Carved on the bowl: BEAR, WHO SLEEPS.') },
      y: { type: 'obj', gfx: 'doorStone', unless: 'sv.open', script: [['if', 'brz3.1&brz3.2&brz3.3', [
        ['note', 'With three fires lit, the frost on the vault door runs like tears. It grinds open.'],
        ['sfx', 'lever'], ['shake', 400], ['set', 'sv.open'], ['remove']
      ], [['note', 'A door of black stone, furred white with frost. Three empty fire-marks are cut above it.'],
        ['say', 'Maren', 'Light the vault, and the vault will open. Wardens liked things simple.'],
        ['say', 'Dask', 'Wardens liked things very, very complicated and then called them simple.']]]] },
      k: { type: 'foe', sprite: 'wight', dir: 'down', script: [
        ['say', "Hedda's Shield", 'THE SLEEPER SLEEPS. THE LADY SLEEPS. GO BACK.'],
        ['say', 'Runa', 'A Pale Hand priest went past you to wake him. We are here to stop her.'],
        ['say', "Hedda's Shield", 'THEN SHOW ME YOU ARE STRONGER THAN SHE WAS.'],
        ['battle', 'frostbound'], ['remove'],
        ['note', "The Shield goes down on one knee and stays there. In the frost on his helm, a word appears and fades: THANKS."],
        ['say', 'Maren', 'He let her past. Veyra. He could not stop her, and he has been ashamed for a day and a night.'],
        ['say', 'Runa', 'Then we finish it for him.'],
        ['set', 'shieldDone'], ['xp', 80], ['save']
      ] }
    }
  };
  D.scripts.svIntro = [['if', '!svIntro', [
    ['note', 'Below the Hall of Oaths the Cairn opens into a long vault of tombs, cold enough to hurt the teeth.'],
    ['say', 'Runa', 'The Sleepers\' Vault. Every Cairnwarden of Karrow lies here. My grandmother told me about it when I was small.'],
    ['say', 'Finch', 'A bedtime story about a tomb.'],
    ['say', 'Runa', 'We are a cheerful people.'],
    ['set', 'svIntro']
  ]]];
  D.placeNear('vault3', null, 6, 6, { tag: 'svCamp', type: 'obj', gfx: 'shrine', script: [['note', 'A lamp-niche where the Cairnwardens rested between watches. Somebody left dry kindling.'], ['run', 'campsite']] });

  /* ================= side work, from Karrow's notice board ================= */
  D.placeNear('karrow', null, 20, 14, { tag: 'board3', type: 'sign', gfx: 'notice', script: [
    ['topics', null, 'The clan notice post, a pine trunk studded with nails and notes.', [
      ['"GOBLIN RAIDERS" (the clan)', [['note', 'Carved, not written: GRIMTUSK. HILL GOBLINS. WEST PASS. KILL OR DRIVE OFF. THE CLAN PAYS.'], ['if', '!q.raiders', [['quest', 'raiders', 1]]]], 'q.raiders<2'],
      ['"LOST DOGS" (Asta)', [['note', "In a child's hand: KETTLE AND SNORRI ARE LOST IN THE PASS. KETTLE IS BROWN. SNORRI IS GREY AND BITES. PLEASE FIND THEM. - ASTA"], ['if', '!q.dogs3', [['quest', 'dogs3', 1]]]], 'q.dogs3<2'],
      ['"BOUNTY: FROST TROLL"', [['note', 'BOUNTY. FROST TROLL AT THE SOUTH FORD. 300 GOLD. BRING AN EAR. TROLLS HAVE BIG EARS.'], ['if', '!q.troll3', [['quest', 'troll3', 1]]]], 'q.troll3<2'],
      ['"THE RUNESTONES" (Thora)', [['note', 'A neat old hand: FOUR STONES IN THE PASS TELL HOW THE CAIRN WAS RAISED. I CAN NO LONGER WALK SO FAR. WILL SOMEONE READ THEM FOR ME? - THORA'], ['if', '!q.runes3', [['quest', 'runes3', 1]]]], 'q.runes3<2'],
      ['"OLD WHITEPAW" (Hrolf)', [['note', 'WHITEPAW KILLED MY FATHER. I WANT HIS PELT. I WILL PAY. - HROLF'], ['if', '!q.whitepaw', [['quest', 'whitepaw', 1]]]], 'q.whitepaw<2'],
      ['"THE FROZEN SHRINE" (Eydis)', [['note', "Eydis's runes: THE WARDEN SHRINE NORTH OF THE FALLS HAS GONE DARK. A LAMP-BEARER SHOULD SEE TO IT."], ['if', '!q.shrine3', [['quest', 'shrine3', 1]]]], 'q.shrine3<2']
    ], 'Leave the post']
  ] });

  /* ---------- Grimtusk's den ---------- */
  M.goblinden = {
    name: "Grimtusk's Den", ground: 'cave', music: 'dungeon', bg: 'cave', dark: 0.65,
    rows: [
      '########################',
      '#...c####........#######',
      '#.........g......#######',
      '#...#####.........######',
      '###.#####..d....########',
      '###...b.....############',
      '#########.##############',
      '#########.a.############',
      '#########.x.############',
      '########################'
    ],
    things: {
      x: { type: 'warp', to: 'frostpass', at: '?', gfx: 'daylight', out: 'up' },
      a: { type: 'foe', sprite: 'goblin', dir: 'down', script: [['battle', 'gd_door'], ['remove']] },
      b: { type: 'foe', sprite: 'goblin', dir: 'right', script: [['battle', 'gd_pens'], ['remove']] },
      d: { type: 'foe', sprite: 'archer', dir: 'down', script: [['battle', 'gd_hall'], ['remove']] },
      g: { type: 'foe', sprite: 'grimtusk', dir: 'down', script: [
        ['say', 'Grimtusk', 'Nagra said you were coming. Nagra said you killed her brother. Nagra talks too much.'],
        ['say', 'Dask', 'Everyone talks too much about us. It is getting embarrassing.'],
        ['battle', 'grimtusk'], ['remove'],
        ['note', "Grimtusk's throne of sledges is stacked with Karrow goods: furs, salt fish, iron, and three of Asta's dog harnesses."],
        ['set', 'grimDone'], ['quest', 'raiders', 2], ['gold', 220], ['give', 'grimaxe'], ['xp', 180]
      ] },
      c: { type: 'chest', gold: 180, items: { potent: 2 } }
    }
  };
  M.goblinden.things.x.at = D.placeNear('frostpass', null, 3, 17, { tag: 'toDen', type: 'warp', to: 'goblinden', at: 'x', gfx: 'caveMouth', under: 'path', out: 'down', if: 'q.raiders>=1' });

  /* ---------- Asta's dogs ---------- */
  [['kettle', 'Kettle', 'brown', 'dogs_a', 10, 21], ['snorri', 'Snorri', 'grey', 'dogs_b', 34, 2]].forEach(([id, name, col, grp, x, y]) =>
    D.placeNear('frostpass', null, x, y, { tag: 'dog' + id, type: 'obj', gfx: 'bones', if: 'q.dogs3=1&!dog.' + id, script: [
      ['note', 'Paw-prints, a lot of growling, and a ' + col + ' sled-dog backed up against a rock.'],
      ['battle', grp],
      ['note', name + ' licks every face in reach and falls in at Runa\'s heel.'],
      ['set', 'dog.' + id], ['xp', 30],
      ['if', 'dog.kettle&dog.snorri', [['quest', 'dogs3', 2]]], ['remove']
    ] }));
  const asta = M.karrow.things.w;
  asta.script = [['if', 'q.dogs3=2', [
    ['note', 'Two dogs hit Asta at once and knock her flat in the snow.'],
    ['say', 'Asta', 'KETTLE! SNORRI! You bad dogs, you terrible dogs, you best dogs!'],
    ['gold', 120], ['give', 'potent', 2], ['xp', 160], ['quest', 'dogs3', 3], ['end']
  ]]].concat(asta.script || []);

  /* ---------- the bridge troll ---------- */
  D.placeNear('frostpass', null, 12, 26, { tag: 'troll3', type: 'foe', sprite: 'giant', dir: 'right', if: 'q.troll3=1', script: [
    ['note', 'A snowdrift by the ford, about the size of a cart. It has teeth.'],
    ['battle', 'troll3'], ['quest', 'troll3', 2], ['gold', 300], ['give', 'trollhide'], ['xp', 160], ['remove']
  ] });

  /* ---------- the runestones ---------- */
  const RUNES = [
    ['1', 6, 15, 'The first stone: a giant lying down, and many small figures building over him.'],
    ['2', 30, 15, 'The second: the small figures setting a lamp on top of the mound, and the giant smiling in his sleep.'],
    ['3', 40, 3, 'The third: a woman with a shield and a lamp, giving the giant something small and bright to hold.'],
    ['4', 28, 31, 'The fourth: the lamp gone out, and a grey hand reaching down into the mound.']
  ];
  RUNES.forEach(([n, x, y, text]) => D.placeNear('frostpass', null, x, y, { tag: 'rune3_' + n, type: 'obj', gfx: 'standing', if: 'q.runes3=1', script: [
    ['if', 'rune3.' + n, [['note', 'You have read this stone.']], [
      ['note', 'A runestone, half buried. ' + text],
      ['set', 'rune3.' + n], ['add', 'runes3Read'], ['xp', 20],
      ['if', 'runes3Read=3', [['say', 'Maren', 'The Wardens knew. They knew someone would come for it.']]],
      ['if', 'runes3Read=4', [['battle', 'runes3'], ['give', 'runestone3'], ['quest', 'runes3', 2], ['say', 'Finch', 'Thora will want these. I will want a song out of them.']]]
    ]]
  ] }));
  const thora = M.k_shop.things.r;
  thora.script = [['if', 'item.runestone3', [
    ['say', 'Thora', 'The grey hand. Of course. My grandmother used to say the Cairn had a lid, and the lid had a thief.'],
    ['take', 'runestone3'], ['gold', 150], ['give', 'frostward'], ['xp', 160], ['end']
  ]]].concat(thora.script || []);

  /* ---------- Old Whitepaw ---------- */
  D.placeNear('frostpass', null, 38, 21, { tag: 'whitepaw', type: 'foe', sprite: 'bear', dir: 'left', if: 'q.whitepaw=1', script: [
    ['note', 'The snow moves. It has a scar across one eye and it is the size of a house.'],
    ['battle', 'whitepaw'], ['give', 'whitepelt'], ['xp', 40], ['remove']
  ] });
  const hrolf = M.karrow.things.s;
  hrolf.script = [['if', 'q.whitepaw=1&item.whitepelt', [
    ['note', 'Hrolf runs his hand over the pelt for a long time without saying anything.'],
    ['say', 'Hrolf', 'Hm. Bigger than I remembered. Here. My father\'s charm. He would want it to go to someone who did what he could not.'],
    ['take', 'whitepelt'], ['give', 'wolfcharm'], ['gold', 160], ['xp', 160], ['quest', 'whitepaw', 2], ['end']
  ]]].concat(hrolf.script || []);

  /* ---------- the Frozen Shrine ---------- */
  M.iceshrine = {
    name: 'The Frozen Shrine', ground: 'ice', music: 'frost', bg: 'cave', dark: 0.5,
    rows: [
      '[[[[[[[[[[[[[[[[[[',
      '[[[[[[....l..[[[[[',
      '[[[[[........[[[[[',
      '[[[[[..b.....[[[[[',
      '[[[[[[.......[[[[[',
      '[[[c.....a...[[[[[',
      '[[[......[[[[[[[[[',
      '[[[[[[.x.[[[[[[[[[',
      '[[[[[[[[[[[[[[[[[['
    ],
    things: {
      x: { type: 'warp', to: 'falls', at: '?', gfx: 'daylight', out: 'up' },
      a: { type: 'foe', sprite: 'frostspirit', dir: 'down', script: [['battle', 'is_spirits'], ['remove']] },
      b: { type: 'foe', sprite: 'wight', dir: 'down', script: [['battle', 'is_keeper'], ['remove']] },
      c: { type: 'chest', gold: 120, items: { potent: 1 } },
      l: { type: 'obj', gfx: 'lampDead', gfxIf: ['shrine3Lit', 'lamp'], script: [['if', 'shrine3Lit', [['note', 'The shrine lamp burns.']], [
        ['note', 'The shrine lamp, frozen solid. Maren breathes on the glass and speaks the words, and the ice runs off it like water.'],
        ['say', 'Maren', 'Kell kept this one. I will keep it now.'],
        ['set', 'shrine3Lit'], ['quest', 'shrine3', 2], ['give', 'shrinelamp'], ['gold', 100], ['xp', 180]
      ]]] }
    }
  };
  M.iceshrine.things.x.at = D.placeNear('falls', null, 26, 4, { tag: 'toShrine', type: 'warp', to: 'iceshrine', at: 'x', gfx: 'caveMouth', under: 'path', out: 'down', if: 'q.shrine3>=1' });
})();
