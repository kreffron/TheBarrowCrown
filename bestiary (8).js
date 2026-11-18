/* Enemies and the groups they appear in.
   moves: [[weight, 'attack' | abilityId], ...].  tags: 'undead', 'beast', 'goblin'.
   immune: status ids that never stick.  loot: [[itemId, chance], ...].
   Balance target: a normal group costs a fresh party about a quarter of its HP. */
(function () {
  const D = G.D;
  D.enemies = {
    rat: { name: 'Giant Rat', sprite: 'rat', hp: 8, ac: 11, atk: 3, dmg: '1d4+1', spd: 3, save: 0, xp: 5, gold: [0, 2], tags: ['beast'] },
    bat: { name: 'Cave Bat', sprite: 'bat', hp: 8, ac: 13, atk: 4, dmg: '1d4+1', spd: 6, save: 1, xp: 6, gold: [0, 1], tags: ['beast'] },
    wolf: { name: 'Wolf', plural: 'Wolves', sprite: 'wolf', hp: 16, ac: 12, atk: 5, dmg: '1d6+2', spd: 4, save: 1, xp: 14, gold: [0, 2], tags: ['beast'], loot: [['pelt', 0.6]] },
    alpha: { name: 'Grey Alpha', sprite: 'alpha', hp: 40, ac: 13, atk: 6, dmg: '1d8+3', spd: 4, save: 2, xp: 36, gold: [4, 8], tags: ['beast'], moves: [[3, 'attack'], [2, 'savage']], loot: [['pelt', 1]] },
    spider: { name: 'Web Spider', sprite: 'spider', hp: 13, ac: 12, atk: 5, dmg: '1d4+2', spd: 4, save: 1, xp: 12, gold: [0, 2], tags: ['beast'], moves: [[2, 'attack'], [2, 'venombite']], loot: [['bitterroot', 0.25]] },
    goblin: { name: 'Goblin', sprite: 'goblin', hp: 13, ac: 12, atk: 4, dmg: '1d6+1', spd: 2, save: 0, xp: 10, gold: [3, 7], tags: ['goblin'] },
    archer: { name: 'Goblin Slinger', sprite: 'archer', hp: 11, ac: 12, atk: 5, dmg: '1d6+2', spd: 3, save: 0, xp: 12, gold: [3, 8], tags: ['goblin'] },
    hexer: { name: 'Goblin Hexer', sprite: 'hexer', hp: 18, ac: 12, atk: 3, dmg: '1d4+1', pow: 3, spd: 2, save: 2, xp: 20, gold: [6, 12], tags: ['goblin'], moves: [[1, 'attack'], [3, 'spark'], [2, 'hex']], loot: [['tonic', 0.3]] },
    skeleton: { name: 'Barrow Guard', sprite: 'skeleton', hp: 26, ac: 13, atk: 5, dmg: '1d8+2', spd: 1, save: 1, xp: 24, gold: [2, 6], tags: ['undead'], immune: ['asleep', 'poison'] },
    warden: { name: 'Crypt Sentinel', sprite: 'sentinel', hp: 40, ac: 15, atk: 6, dmg: '1d10+2', spd: 1, save: 2, xp: 34, gold: [5, 10], tags: ['undead'], immune: ['asleep', 'poison'] },
    brood: {
      name: 'Broodmother', sprite: 'spider', scale: 4, hp: 64, ac: 13, atk: 6, dmg: '1d8+2', pow: 3, spd: 3, save: 2, xp: 70, gold: [12, 18], tags: ['beast'],
      immune: ['asleep'], moves: [[3, 'attack'], [2, 'venombite'], [1, 'webspray']], loot: [['bitterroot', 1]]
    },
    brannoc: { name: 'Brannoc Vosk', sprite: 'vosk', hp: 34, ac: 12, atk: 3, dmg: '1d6+1', spd: 1, save: 1, xp: 20, gold: [10, 10], tags: ['human'], moves: [[3, 'attack'], [1, 'headbutt']] },
    bruiser: { name: 'Vosk Bruiser', sprite: 'bruiser', hp: 12, ac: 11, atk: 2, dmg: '1d4+1', spd: 2, save: 0, xp: 8, gold: [2, 4], tags: ['human'] },
    revenant: { name: 'Restless Dead', sprite: 'alder', hp: 52, ac: 12, atk: 6, dmg: '1d10+2', spd: 1, save: 1, xp: 30, gold: [0, 0], tags: ['undead'], immune: ['asleep', 'poison'] },
    bonecaller: {
      name: 'Skrit the Bonecaller', sprite: 'hexer', hp: 72, ac: 13, atk: 4, dmg: '1d6+2', pow: 4, spd: 3, save: 3, xp: 110, gold: [30, 30], tags: ['goblin'],
      immune: ['asleep'], moves: [[1, 'attack'], [3, 'spark'], [2, 'hex'], [2, 'gravechill']], loot: [['tonic', 1]]
    },
    grukk: {
      name: 'Grukk Gravepicker', sprite: 'grukk', scale: 4, hp: 290, ac: 15, atk: 7, dmg: '1d10+4', pow: 4, spd: 2, save: 3, xp: 160, gold: [60, 60], tags: ['goblin'],
      immune: ['asleep', 'stunned'], moves: [[4, 'attack'], [2, 'sweep'], [1, 'bellow']]
    }
  };
  /* Guests fight on the party's side, controlled by the game: B.start(group, { guests: ['ingrid'] }). */
  D.guests = {
    ingrid: { name: 'Ingrid', sprite: 'ingrid', hp: 22, ac: 13, atk: 4, dmg: '1d8+2', spd: 1, save: 2, moves: [[3, 'attack'], [1, 'hammerblow']], joinText: 'Ingrid fights beside you. She acts on her own.' }
  };
  D.groups = {
    // Thornwood
    wood_rats: { enemies: ['rat', 'rat', 'rat', 'rat'] },
    wood_wolves: { enemies: ['wolf', 'wolf'] },
    wood_goblins: { enemies: ['goblin', 'goblin'] },
    wood_spiders: { enemies: ['spider', 'spider'] },
    wood_scouts: { enemies: ['goblin', 'archer'] },
    wolfpack: { enemies: ['wolf', 'alpha', 'wolf'], intro: 'The pack turns from the tree, hackles up.' },
    nest: { enemies: ['spider', 'brood', 'spider'], intro: 'The webs shiver. Something the size of a cart comes down from the canopy.' },
    lookout: { enemies: ['goblin', 'archer'], intro: 'The lookouts scramble for their slings!' },
    // Barrow, floor 1
    b1_rats: { enemies: ['rat', 'rat', 'bat', 'bat'] },
    b1_bats: { enemies: ['bat', 'bat', 'bat', 'bat'] },
    b1_goblins: { enemies: ['goblin', 'archer', 'goblin'] },
    b1_camp: { enemies: ['goblin', 'goblin', 'goblin'], intro: 'The goblins drop their loot and grab their knives!' },
    b1_lever: { enemies: ['goblin', 'hexer', 'archer'], intro: 'A hexer rattles a fistful of knucklebones.' },
    // Barrow, floor 2
    b2_guards: { enemies: ['skeleton', 'skeleton'], intro: 'Bones knit themselves upright.' },
    b2_mixed: { enemies: ['skeleton', 'bat', 'bat', 'bat'] },
    b2_sentinels: { enemies: ['warden', 'warden'], intro: 'The armoured dead raise their blades.' },
    grukk: { enemies: ['hexer', 'grukk', 'goblin'], boss: true, intro: 'Grukk Gravepicker hefts his spade!' },
    grukk_duo: { enemies: ['hexer', 'grukk'], boss: true, intro: 'Grukk Gravepicker hefts his spade!' },
    skrit: { enemies: ['skeleton', 'bonecaller', 'skeleton'], boss: true, intro: 'Skrit rattles his knucklebones, and the dead stand up.' },
    // The tutorial brawl. The first four party turns are guided; see B.guided in src/battle.js.
    brawl: {
      enemies: ['brannoc', 'bruiser', 'bruiser'], boss: true, brawl: true, retryOnly: true, music: 'battle', bg: 'tavern',
      intro: 'Chairs scrape back. It is a brawl!', retryText: 'Runa spits out a tooth and climbs back up. Round two.',
      guideIntro: ['The fight is played on a board: your party on the left, the Vosks on the right.', 'On a turn each piece can move and act once. HP and ability points are in the strip below.'],
      guide: [
        { who: 'runa', cmd: 'attack', enemy: 'brannoc', rig: 14, text: "Runa's turn. Choose Attack, then Brannoc.", sub: 'She walks up to him on her own. {a} confirms; only the highlighted choice is open for now.',
          after: ['That blue line was the roll: d20 + Attack vs AC.', "Beat the target's Armour Class (AC) to hit. A natural 20 is a critical hit."] },
        { who: 'dask', cmd: 'attack', enemy: 'brannoc', rig: 13, text: "Dask's turn. Attack Brannoc as well.", sub: 'Dask is quick: 4 squares. Against a foe an ally is already fighting he gets +2 and Sneak Attack.',
          after: ['Sneak Attack! Gang up on one enemy: anyone fighting beside an ally gets +2 to hit.', 'Dask also sneak-attacks foes that are asleep, stunned or rattled, even with thrown knives.'] },
        { who: 'maren', cmd: 'ab', ab: 'mend', ally: 'runa', text: "Maren's turn. Open Abilities, choose Mend.", sub: 'Abilities cost points from the blue bar. Maren spends Faith.', targetSub: 'Heal Runa. She took that first punch.',
          after: ['Each hero has a pool: Fury, Cunning, Faith or Verve.', 'Defending gives 1 back. Inns and shrines refill it.'] },
        { who: 'finch', cmd: 'ab', ab: 'barbed', enemy: 'bruiser', text: "Finch's turn. Use Barbed Verse on a bruiser.", sub: 'It deals damage, and the target is worse at hitting for a turn.',
          after: ["That's the basics. The rest of the brawl is yours.", 'Move lets you reposition; Finch shoots from afar, Runa can throw an axe. Defend gives +4 AC. Now the Vosks act.'] }
      ]
    },
    alder: { enemies: ['revenant'], intro: 'The dead man turns. There is nothing behind his eyes.' }
  };
  /* Enemy sprites: humanoids use the character builder, beasts are 16x16 pixel strings facing right. */
  Object.assign(D.sprites, {
    goblin: { skin: '#6fae4a', bald: 1, ears: 1, eyes: '#b0202a', top: '#6b5a3a', legs: '#4a3b2e' },
    archer: { skin: '#6fae4a', bald: 1, ears: 1, eyes: '#b0202a', top: '#4a6a3a', legs: '#3a3028', hat: '#5a4030' },
    hexer: { skin: '#7ab85a', ears: 1, eyes: '#b0202a', top: '#5a3a7a', robe: 1, hood: '#4a2f66', trim: '#e8c14a' },
    grukk: { skin: '#5a9a3a', bald: 1, ears: 1, eyes: '#ffe14a', top: '#7a2f2f', legs: '#3a2a22', helm: '#e8c14a', horns: 1, trim: '#b58a2a' },
    skeleton: { skel: 1 },
    sentinel: { skel: 1, helm: '#70747f' }
  });
  D.pix = {
    wolf: { pal: { a: '#7b7f8a', b: '#4a4d57', c: '#c9ccd6', e: '#ffe14a', k: '#1a1420' }, rows: [
      '................', '................', '...........b..b.', '...........ab.ab', '..........aaaaaa', 'b.........aaeaaa',
      'ab.......aaaaaak', '.ab.aaaaaaaaacc.', '..aaaaaaaaaaac..', '..aaaaaaaaaaa...', '..aaccccccaaa...', '..aa.....baa....',
      '..ab.....b.a....', '..a.b....b.a....', '..a.b....b.a....', '.bb.bb..bb.bb...'] },
    alpha: { pal: { a: '#b9bcc6', b: '#6a6d78', c: '#f0f0f4', e: '#ff5a4a', k: '#1a1420' }, rows: [
      '................', '...........b..b.', '...........ab.ab', '..........aaaaaa', 'b.........aaeaaa', 'ab.......aaaaaak',
      '.ab.aaaaaaaaaacc', '.aaaaaaaaaaaaac.', '..aaaaaaaaaaaa..', '..aaaaaaaaaaa...', '..aaccccccaaa...', '..aa.....baa....',
      '..ab.....b.a....', '..a.b....b.a....', '..a.b....b.a....', '.bb.bb..bb.bb...'] },
    rat: { pal: { a: '#8a6f5a', b: '#5e493a', p: '#e8a0a0', e: '#1a1420' }, rows: [
      '................', '................', '................', '................', '................', '................',
      '..........pp....', '.........apaa...', '....aaaaaaaaea..', '...aaaaaaaaaaaap', '..aaaaaaaaaaaa..', 'p.aaaaaaaaaaa...',
      '.paaba...abaa...', '..p.b.b...b.b...', '................', '................'] },
    spider: { pal: { a: '#4a3a5a', b: '#2a2035', c: '#7a6a8a', e: '#ff5a4a' }, rows: [
      '................', '................', '................', '..b..........b..', '...b...aa...b...', 'b...b.aaaa.b...b',
      '.b...aaccaa...b.', '..bbaaccccaabb..', '....aaaaaaaa....', '..bbaeaaaaeabb..', '.b..aaaaaaaa..b.', 'b...b.aaaa.b...b',
      '...b...bb...b...', '..b..........b..', '................', '................'] },
    bat: { pal: { a: '#5a4a6a', b: '#2a2035', e: '#ffe14a' }, rows: [
      '................', '................', '................', 'b..............b', 'bb...b....b...bb', 'bab..ba..ab..bab',
      'baab.aaaaaa.baab', 'baaabaeaaeabaaab', '.baaaaaaaaaaaab.', '..baaaaaaaaaab..', '...ba.aaaa.ab...', '....b..aa..b....',
      '................', '................', '................', '................'] }
  };
})();
