/* Chapter 4 — enemies, groups, guests, items and shops for Highmoor, the Undercroft and the Catacombs.
   Balance: a chapter 4 party is level 12-16. Ordinary fights should cost 8-18% of the party's HP at the
   level the player meets them; mini-bosses 25-35%; the Ossuary Colossus 35-50%. */
(function () {
  const D = G.D;

  Object.assign(D.sprites, {
    cutthroat: { skin: '#d8a070', hair: '#1a1a1a', top: '#2a2a34', legs: '#1a1a22', hood: '#2a2a34', trim: '#8a8a94' },
    shadowpriest: { skin: '#c8b8a8', top: '#3a3448', robe: 1, hood: '#2a2438', trim: '#d8d4e8' },
    hlknight: { skin: '#d8a070', hair: '#3a2a1e', top: '#5a5a66', legs: '#3a3a44', helm: '#d8dce8', trim: '#d8d4e8' },
    ghoul: { skin: '#a8b0a0', hair: '#3a3a30', top: '#4a4a3a', legs: '#3a3a30', eyes: '#e8e05a' },
    boneknight: { skel: 1, top: '#4a3a3a', helm: '#6a5a4a' },
    collector: { skin: '#e0a67c', hair: '#3a2a1e', beard: 1, top: '#2f4f3a', legs: '#2a2a2a', hat: '#2a2a2a' },
    captain: { skin: '#e0b090', hair: '#c8c8d0', top: '#4a4a58', legs: '#2a2a34', helm: '#e8e8f0', trim: '#e8c14a' },
    hollowwarden: { skel: 1, robe: 1, hood: '#d8d4c8', trim: '#e8c14a' }
  });
  Object.assign(D.pix, {
    ooze: { pal: { a: '#6a8a4a', b: '#4a6a3a', c: '#8aaa6a', e: '#1a1420' }, rows: [
      '................', '................', '................', '................', '.......cc.......', '.....caaaac.....',
      '....caaeeaab....', '...caaaaaaaab...', '...aaaaaaaaab...', '..caaaaaaaaaab..', '..aaaabaaaaaab..', '.caaaaaaaaaaaab.',
      '.aaaaaaaaaaaaab.', '..bbbbbbbbbbbb..', '................', '................'] },
    automaton: { pal: { a: '#a8783a', b: '#7a5a2a', c: '#e8c14a', e: '#7fd0ff', k: '#3a3440' }, rows: [
      '................', '.....kkkkkk.....', '.....kaeaeak....', '.....kaaaaak....', '..kkk.kaak.kkk..', '.kaaakaccaakaak.',
      '.kaabaaaaaabaak.', '.kab.aaccaa.bak.', '.ka..aaaaaa..ak.', '.kk..abbbba..kk.', '.....aa..aa.....', '.....aa..aa.....',
      '....kaa..aak....', '....kkk..kkk....', '................', '................'] },
    colossus: { pal: { a: '#e6e0cc', b: '#b9b29b', k: '#1a1420', e: '#7fd0ff' }, rows: [
      '................', '.....aaaaaa.....', '....aakaakaa....', '....aaaaaaaa....', '.....akkkka.....', '..aaa.aaaa.aaa..',
      '.abababababababa', '.a.aaaaaaaaaa.a.', '.a.abababababa.a', '.b.aaaaaaaaaa.b.', '...ab.aaaa.ba...', '...aa.a..a.aa...',
      '..baa.a..a.aab..', '..bb..b..b..bb..', '................', '................'] },
    shade: { pal: { w: '#e8e0ff', b: '#a898d8', c: '#5a4a8a', e: '#1a1420' }, rows: [
      '................', '.......c........', '......cc........', '.....cbbc.......', '....cbwwbc......', '....bwwwwb......',
      '...cbwwwwbc.....', '...bwwwwwwb.....', '...bweweewb.....', '...bwwwwwwb.....', '....bwwwwb......', '.....bbbb.......',
      '......cc........', '.......c........', '................', '................'] }
  });

  Object.assign(D.abilities, {
    steamburst: { name: 'Steam Burst', target: 'allEnemies', fx: [{ t: 'damage', dice: '3d6', pow: true, save: 'half', sfx: 'magic' }] },
    bonestorm: { name: 'Bone Storm', target: 'allEnemies', fx: [{ t: 'damage', dice: '2d8', pow: true, save: 'half' }, { t: 'status', id: 'weak', turns: 2, save: true, quiet: 1 }] },
    poisonblade: { name: 'Poisoned Blade', target: 'enemy', fx: [{ t: 'attack', onHit: { id: 'poison', turns: 3, v: 6 } }] }
  });

  const U = ['undead'], NOSLEEP = ['asleep', 'poison'];
  Object.assign(D.enemies, {
    collector: { name: 'Debt-collector', sprite: 'collector', hp: 95, ac: 16, atk: 11, dmg: '1d10+6', spd: 3, save: 4, xp: 170, gold: [15, 30], tags: ['human'] },
    cutthroat: { name: 'Pale Hand Cutthroat', sprite: 'cutthroat', hp: 100, ac: 17, atk: 12, dmg: '1d10+7', spd: 5, save: 4, xp: 180, gold: [15, 30], tags: ['human'], moves: [[3, 'attack'], [1, 'poisonblade']], loot: [['elixir', 0.1]] },
    shadowpriest: { name: 'Pale Hand Shadow-priest', sprite: 'shadowpriest', hp: 90, ac: 17, atk: 11, dmg: '1d8+6', pow: 9, spd: 3, save: 5, xp: 190, gold: [15, 30], tags: ['human'], moves: [[1, 'attack'], [2, 'spark'], [1, 'hex'], [1, 'gravechill']] },
    hlknight: { name: 'Pale Hand Knight', sprite: 'hlknight', hp: 150, ac: 19, atk: 12, dmg: '2d6+7', spd: 2, save: 5, xp: 240, gold: [20, 40], tags: ['human'], moves: [[3, 'attack'], [1, 'chant']] },
    ghoul: { name: 'Undercroft Ghoul', sprite: 'ghoul', hp: 110, ac: 16, atk: 12, dmg: '1d10+7', spd: 4, save: 4, xp: 190, gold: [4, 12], tags: U, immune: NOSLEEP, moves: [[3, 'attack'], [1, 'dragunder']] },
    ooze: { name: 'Sewer Ooze', sprite: 'ooze', hp: 150, ac: 14, atk: 11, dmg: '2d6+6', spd: 0, save: 3, xp: 180, gold: [0, 10], tags: ['beast'], immune: ['asleep', 'stunned'], moves: [[3, 'attack'], [1, 'venombite']] },
    ratswarm: { name: 'Rat Swarm', sprite: 'rat', scale: 2, hp: 70, ac: 16, atk: 11, dmg: '1d8+6', spd: 6, save: 2, xp: 120, gold: [0, 4], tags: ['beast'], moves: [[3, 'attack'], [1, 'venombite']] },
    boneknight: { name: 'Bone Knight', sprite: 'boneknight', hp: 160, ac: 19, atk: 13, dmg: '2d8+6', spd: 2, save: 5, xp: 260, gold: [10, 20], tags: U, immune: NOSLEEP, moves: [[3, 'attack'], [1, 'crush']] },
    automaton: { name: 'Vault Automaton', sprite: 'automaton', hp: 160, ac: 20, atk: 12, dmg: '2d6+7', spd: 1, save: 5, xp: 250, gold: [0, 0], tags: ['construct'], immune: ['asleep', 'poison', 'stunned'], moves: [[3, 'attack'], [1, 'shellguard']] },
    shade: { name: 'Crypt Shade', sprite: 'shade', hp: 70, ac: 18, atk: 11, dmg: '1d8+6', pow: 9, spd: 6, save: 4, xp: 140, gold: [0, 8], tags: U, immune: NOSLEEP, moves: [[2, 'attack'], [2, 'spark']] },
    // mini-bosses and bosses
    brannoc4: { name: 'Brannoc Vosk', sprite: 'vosk', hp: 240, ac: 17, atk: 12, dmg: '2d6+7', spd: 2, save: 4, xp: 420, gold: [60, 60], tags: ['human'], immune: ['asleep'], moves: [[3, 'attack'], [1, 'headbutt'], [1, 'maul']] },
    captain: { name: 'Captain Sarre', sprite: 'captain', hp: 300, ac: 19, atk: 13, dmg: '2d8+7', spd: 3, save: 5, xp: 520, gold: [80, 80], tags: ['human'], immune: ['asleep'], moves: [[3, 'attack'], [1, 'chant'], [1, 'maul']] },
    engine: { name: 'The Collector Engine', sprite: 'automaton', scale: 4, hp: 730, ac: 20, atk: 13, dmg: '2d10+7', pow: 9, spd: 1, save: 5, xp: 900, gold: [200, 200], tags: ['construct'],
      immune: ['asleep', 'poison', 'stunned'], moves: [[3, 'attack'], [2, 'steamburst'], [1, 'crush']], loot: [['enginecore', 1]] },
    hollowwarden: { name: 'The Hollow Warden', sprite: 'hollowwarden', hp: 560, ac: 18, atk: 12, dmg: '2d8+6', pow: 10, spd: 3, save: 6, xp: 900, gold: [80, 120], tags: U,
      immune: ['asleep', 'poison', 'stunned'], moves: [[2, 'attack'], [2, 'tolling'], [1, 'gravechill']] },
    colossus: { name: 'The Ossuary Colossus', sprite: 'colossus', scale: 4, hp: 880, ac: 18, atk: 13, dmg: '3d8+7', pow: 9, spd: 1, save: 6, xp: 1500, gold: [250, 250], tags: U,
      immune: ['asleep', 'poison', 'stunned'], moves: [[3, 'attack'], [2, 'bonestorm'], [1, 'crush'], [1, 'gravechill']] }
  });

  Object.assign(D.guests, {
    veyra4: { name: 'Veyra', sprite: 'veyra', hp: 130, ac: 16, atk: 10, dmg: '1d8+6', pow: 10, spd: 3, save: 6, moves: [[2, 'lampfire'], [1, 'mend'], [1, 'attack']], joinText: 'Veyra fights beside you. Her lamp burns white.' }
  });

  Object.assign(D.groups, {
    collectors: { enemies: ['collector', 'collector', 'collector'], bg: 'forest', intro: '"Dask Underbough? Orrin and Sons sends its regards. And its invoice."' },
    uc_rats: { enemies: ['ratswarm', 'ratswarm', 'ratswarm'] },
    uc_ghouls: { enemies: ['ghoul', 'ghoul'] },
    uc_ooze: { enemies: ['ooze', 'ratswarm'] },
    uc_cult: { enemies: ['cutthroat', 'shadowpriest'] },
    sewergate: { enemies: ['cutthroat', 'shadowpriest', 'cutthroat'], intro: 'Pale Hand cutthroats guard the sewer gate.' },
    ghoulden: { enemies: ['ghoul', 'ghoul', 'ghoul'] },
    brannoc4: { enemies: ['cutthroat', 'brannoc4', 'cutthroat'], intro: '"Remember me, tavern-wreckers? Third time pays for all."' },
    safehouse: { enemies: ['hlknight', 'captain', 'shadowpriest'], boss: true, intro: 'Captain Sarre of the Pale Hand draws a sword with a Chancellery seal on the pommel.' },
    ossuary: { enemies: ['boneknight', 'boneknight'], bg: 'crypt', intro: 'Two Bone Knights step out of their niches.' },
    tombghouls: { enemies: ['ghoul', 'boneknight', 'ghoul'], bg: 'crypt' },
    colossus: { enemies: ['colossus', 'ghoul'], bg: 'crypt', boss: true, intro: 'Every bone in the Catacombs gets up at once, and they all get up together.' },
    vaultguards: { enemies: ['automaton', 'automaton'], bg: 'crypt', intro: 'Two brass automatons tick into life.' },
    engine: { enemies: ['engine', 'automaton'], bg: 'crypt', boss: true, intro: 'The Collector Engine unfolds, all brass and ledgers and steam.' },
    cryptshades: { enemies: ['shade', 'shade', 'shade'], bg: 'crypt' },
    hollowwarden: { enemies: ['shade', 'hollowwarden', 'shade'], bg: 'crypt', boss: true, intro: 'The Hollow Warden raises a lamp that has not been lit for three hundred years.' }
  });

  Object.assign(D.items, {
    elixir: { name: 'Highmoor Elixir', price: 150, target: 'ally', field: true, desc: 'Restores 8d4+30 HP.', fx: [{ t: 'heal', dice: '8d4+30' }] },
    // gear sold in Highmoor
    ducalaxe: { name: 'Ducal Greataxe', type: 'weapon', for: ['runa'], dmg: '2d10', mods: { atk: 1 }, price: 900 },
    knightplate: { name: "Knight's Plate", type: 'armor', for: ['runa'], mods: { ac: 6, hp: 8 }, price: 860 },
    nightblade: { name: 'Nightblade', type: 'weapon', for: ['dask'], dmg: '1d12', mods: { atk: 2, spd: 1 }, price: 820 },
    shadowsilk: { name: 'Shadowsilk', type: 'armor', for: ['dask'], mods: { ac: 5, spd: 1, save: 1 }, price: 780 },
    wardenstaff: { name: "Warden's Lamp-staff", type: 'weapon', for: ['maren'], dmg: '1d12', mods: { pow: 3 }, price: 860 },
    cathedralmail: { name: 'Cathedral Mail', type: 'armor', for: ['maren'], mods: { ac: 7, save: 1 }, price: 900 },
    courtrapier: { name: 'Court Rapier', type: 'weapon', for: ['finch'], dmg: '1d12', mods: { spd: 1, pow: 2 }, price: 820 },
    velvetmail: { name: 'Velvet Brigandine', type: 'armor', for: ['finch'], mods: { ac: 5, hp: 6 }, price: 760 },
    silverbell: { name: 'Silver Bell', type: 'charm', mods: { save: 4 }, price: 520 },
    duelistring: { name: "Duelist's Ring", type: 'charm', mods: { dmgBonus: 4 }, price: 560 },
    // found in chapter 4
    ghostcap: { name: 'Ghostcap', type: 'key', desc: 'A pale mushroom from the Undercroft. It glows faintly, and smells of rain.' },
    cure: { name: 'Grey-oil Cure', type: 'key', desc: "Lysa's cure for grey-oil poisoning. For the Duke." },
    ducalsignet: { name: 'Ducal Signet', type: 'charm', mods: { atk: 1, ac: 1, save: 2 }, desc: "Duke Aldric's own signet. Doors open for whoever wears it." },
    enginecore: { name: 'Engine Core', type: 'charm', mods: { pow: 3, sp: 4 }, desc: "The Collector Engine's heart. It ticks." },
    wrenknife: { name: "Wren's Letter-knife", type: 'weapon', for: ['dask'], dmg: '1d12+2', mods: { atk: 3, spd: 1 }, desc: 'Wren used it to open Orrin\'s mail for six years. Now it is Dask\'s.' },
    lanternshield: { name: 'Lantern Mail', type: 'armor', for: ['maren'], mods: { ac: 7, save: 2, hp: 6 }, desc: 'The first High Warden\'s mail. A little lamp is worked into the breastplate.' },
    debtpapers: { name: 'Debt-papers of Highmoor', type: 'key', desc: 'Every debt in Highmoor, on paper. A great deal of power, in a sack.' },
    verse4: { name: 'The Fifth Verse, Fourth Stanza', type: 'key', desc: '"...and was not seen but by the dead she kept beside; and there she holds the door, and will, until the last lamp lights her home."' },
    chancelleryorders: { name: 'Chancellery Orders', type: 'key', desc: 'Pale Hand orders under the Chancellery seal. Proof, if anyone wants it.' }
  });
  Object.assign(D.shops, {
    dace: { name: "Dace's Armoury", blurb: "Highmoor steel. The Duke's own guard buys here. Bought here. Before the Chancellor's budget.", stock: ['ducalaxe', 'knightplate', 'nightblade', 'shadowsilk', 'wardenstaff', 'cathedralmail', 'courtrapier', 'velvetmail'] },
    lysa: { name: "Lysa's Apothecary", blurb: 'Remedies, tinctures and very small bells.', stock: ['campkit', 'greater', 'potent', 'elixir', 'tonic', 'salts', 'bitterroot', 'silverbell', 'duelistring'] }
  });
})();
