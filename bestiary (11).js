/* Chapter 2 — enemies, groups, items and shops for Saltmere, Mirefen and the Drowned Abbey.
   Balance: a chapter 2 party is level 4-8. Ordinary fights should cost 8-18% of the party's HP at the
   level the player meets them; mini-bosses 25-35%; the Drowned Prior 35-50%. */
(function () {
  const D = G.D;

  Object.assign(D.sprites, {
    acolyte: { skin: '#e0c0a0', top: '#8a8a94', robe: 1, hood: '#70707c', trim: '#e8e8f0' },
    zealot: { skin: '#d8a070', hair: '#3a2a1e', top: '#6a6a74', legs: '#3a3a44', helm: '#8a8a94', trim: '#e8e8f0' },
    drownedman: { skin: '#8aa89a', hair: '#3a4a3a', top: '#4a5a5a', legs: '#3a4a4a', eyes: '#e8f4ff' },
    prior: { skel: 1, robe: 1, hood: '#2a4a4a' },
    wraith: { skel: 1, robe: 1, hood: '#3a3448', helm: '#a8782a' },
    hask: { skin: '#c98e62', bald: 1, beard: 1, hair: '#6a6a74', top: '#5a5a66', legs: '#3a3a44', trim: '#e8e8f0' }
  });
  Object.assign(D.pix, {
    crab: { pal: { a: '#c8583c', b: '#a8442c', e: '#1a1420', w: '#f0d0b0' }, rows: [
      '................', '................', '..aa........aa..', '.a..a......a..a.', '.aa.a......a.aa.', '..aaa......aaa..',
      '....a.bbbb.a....', '.....bbbbbb.....', '...bbbbbbbbbb...', '..bbbebbbbebbb..', '..bbbbbbbbbbbb..', '...bbwwwwwwbb...',
      '..b.b.b..b.b.b..', '.b..b.b..b.b..b.', '................', '................'] },
    eel: { pal: { a: '#4a6a5a', b: '#2a4a3a', e: '#e8e05a', w: '#c8d8b8' }, rows: [
      '................', '................', '................', '................', '..........aaa...', '.........aaeaa..',
      '........aaaaab..', '..a....aaaawb...', '.aaa..aaaab.....', 'aa.aaaaaab......', 'a...aaaab.......', '.....bb.........',
      '................', '................', '................', '................'] },
    bogling: { pal: { a: '#5d4c34', b: '#3a2e22', e: '#e8e05a', g: '#6b7a3c' }, rows: [
      '................', '................', '.....ggaag......', '....aaaaaaa.....', '...aaeaaeaaa....', '..aaaaaaaaaaa...',
      '..aaabbbbaaaa...', '.aaaabbbbaaaag..', '.aaaaaaaaaaaaa..', 'gaaaaaaaaaaaaaa.', 'aa.aaaaaaaaa.aa.', 'a..aaa...aaa..a.',
      '...aa.....aa....', '................', '................', '................'] },
    marshlight: { pal: { w: '#f0ffe0', b: '#a8e07a', c: '#4a8a3a', e: '#1a1420' }, rows: [
      '................', '.......c........', '......cc........', '.....cbbc.......', '....cbwwbc......', '....bwwwwb......',
      '...cbwwwwbc.....', '...bwwwwwwb.....', '...bweweewb.....', '...bwwwwwwb.....', '....bwwwwb......', '.....bbbb.......',
      '......cc........', '.......c........', '................', '................'] }
  });

  Object.assign(D.abilities, {
    tidecall: { name: 'Tidecall', target: 'allEnemies', fx: [{ t: 'damage', dice: '2d6', pow: true, save: 'half', sfx: 'magic' }] },
    dragunder: { name: 'Drag Under', target: 'enemy', fx: [{ t: 'attack', onHit: { id: 'stunned', turns: 2, save: true } }] },
    shellguard: { name: 'Shell Guard', target: 'self', fx: [{ t: 'status', id: 'guard', turns: 2 }] },
    crush: { name: 'Crush', target: 'enemy', fx: [{ t: 'attack', bonusDice: '1d8' }] },
    tolling: { name: 'Tolling', target: 'allEnemies', fx: [{ t: 'damage', dice: '1d6', pow: true, save: 'half' }, { t: 'status', id: 'rattled', turns: 2, v: 2, save: true, quiet: 1 }] },
    chant: { name: 'Grey Chant', target: 'allAllies', fx: [{ t: 'status', id: 'blessed', turns: 3, quiet: 1 }] }
  });

  const U = ['undead'], NOSLEEP = ['asleep', 'poison'];
  Object.assign(D.enemies, {
    drowned: { name: 'Drowned Fisher', sprite: 'drownedman', hp: 42, ac: 13, atk: 7, dmg: '1d8+4', spd: 1, save: 2, xp: 60, gold: [2, 8], tags: U, immune: NOSLEEP,
      moves: [[3, 'attack'], [1, 'dragunder']], loot: [['tag', 0.5]] },
    marshlight: { name: 'Marsh Light', sprite: 'marshlight', hp: 24, ac: 15, atk: 6, dmg: '1d6+3', pow: 4, spd: 6, save: 2, xp: 45, gold: [0, 4], tags: U, immune: NOSLEEP,
      moves: [[2, 'attack'], [2, 'spark']] },
    eel: { name: 'Fen Eel', sprite: 'eel', hp: 32, ac: 14, atk: 7, dmg: '1d6+4', spd: 5, save: 1, xp: 45, gold: [0, 3], tags: ['beast'], moves: [[2, 'attack'], [2, 'venombite']] },
    bogling: { name: 'Bog Lurker', sprite: 'bogling', hp: 58, ac: 13, atk: 7, dmg: '1d10+4', spd: 1, save: 2, xp: 70, gold: [2, 8], tags: ['beast'], moves: [[3, 'attack'], [1, 'savage']] },
    acolyte: { name: 'Pale Hand Acolyte', sprite: 'acolyte', hp: 36, ac: 13, atk: 6, dmg: '1d8+3', pow: 4, spd: 2, save: 3, xp: 60, gold: [6, 14], tags: ['human'],
      moves: [[2, 'attack'], [2, 'spark'], [1, 'hex']], loot: [['greater', 0.15]] },
    zealot: { name: 'Pale Hand Zealot', sprite: 'zealot', hp: 55, ac: 15, atk: 8, dmg: '1d10+4', spd: 2, save: 3, xp: 80, gold: [10, 20], tags: ['human'], moves: [[3, 'attack'], [1, 'chant']] },
    crab: { name: 'Shore Crab', sprite: 'crab', hp: 38, ac: 16, atk: 6, dmg: '1d8+3', spd: 1, save: 2, xp: 50, gold: [0, 4], tags: ['beast'], moves: [[3, 'attack'], [1, 'shellguard']] },
    bruiser2: { name: 'Vosk Hireling', sprite: 'bruiser', hp: 40, ac: 13, atk: 6, dmg: '1d8+3', spd: 2, save: 1, xp: 40, gold: [4, 8], tags: ['human'] },
    brannoc2: { name: 'Brannoc Vosk', sprite: 'vosk', hp: 90, ac: 14, atk: 7, dmg: '1d10+4', spd: 1, save: 2, xp: 110, gold: [30, 30], tags: ['human'], moves: [[3, 'attack'], [1, 'headbutt']] },
    // mini-bosses and bosses
    snapjaw: { name: 'Old Snapjaw', sprite: 'crab', scale: 4, hp: 170, ac: 16, atk: 8, dmg: '2d6+4', spd: 1, save: 3, xp: 150, gold: [30, 40], tags: ['beast'],
      immune: ['asleep', 'stunned'], moves: [[3, 'attack'], [2, 'crush'], [1, 'shellguard']], loot: [['snapshell', 1]] },
    bellwraith: { name: 'The Bell-Wraith', sprite: 'wraith', hp: 140, ac: 15, atk: 7, dmg: '1d10+3', pow: 5, spd: 3, save: 4, xp: 180, gold: [30, 40], tags: U,
      immune: ['asleep', 'poison', 'stunned'], moves: [[2, 'attack'], [2, 'tolling'], [1, 'gravechill']] },
    hask: { name: 'Warden Hask', sprite: 'hask', hp: 150, ac: 15, atk: 8, dmg: '1d10+5', pow: 4, spd: 2, save: 4, xp: 160, gold: [40, 40], tags: ['human'],
      immune: ['asleep'], moves: [[3, 'attack'], [1, 'chant'], [1, 'headbutt']] },
    veyraboss: { name: 'Sister Veyra', sprite: 'veyra', hp: 170, ac: 15, atk: 7, dmg: '1d8+3', pow: 6, spd: 3, save: 5, xp: 190, gold: [0, 0], tags: ['human'],
      immune: ['asleep', 'stunned'], moves: [[1, 'attack'], [3, 'lampfire'], [2, 'hex']] },
    prior: { name: 'The Drowned Prior', sprite: 'prior', scale: 4, hp: 440, ac: 16, atk: 8, dmg: '2d8+3', pow: 6, spd: 2, save: 5, xp: 380, gold: [100, 100], tags: U,
      immune: ['asleep', 'poison', 'stunned'], moves: [[3, 'attack'], [2, 'tidecall'], [1, 'dragunder'], [1, 'gravechill']] }
  });

  Object.assign(D.groups, {
    roadambush: { enemies: ['acolyte', 'zealot', 'acolyte'], bg: 'forest', intro: "Grey robes rise out of the ditch. 'The Thane's shard, Wardens' pets. Hand it over.'" },
    fen_drowned: { enemies: ['drowned', 'drowned'] },
    fen_lights: { enemies: ['marshlight', 'marshlight', 'marshlight'] },
    fen_eels: { enemies: ['eel', 'eel', 'eel'] },
    fen_bog: { enemies: ['bogling', 'eel'] },
    fen_cult: { enemies: ['acolyte', 'acolyte'] },
    patrol: { enemies: ['acolyte', 'zealot', 'acolyte'], intro: 'The patrol draws grey-hilted knives.' },
    causeway: { enemies: ['zealot', 'acolyte', 'zealot'], intro: 'They have been waiting for you.' },
    causeway_big: { enemies: ['zealot', 'acolyte'], waves: [['zealot', 'acolyte']], waveText: ['Two more come running up the causeway!'], intro: "Brother Coll's warning got here first. They have been waiting for you." },
    nest2: { enemies: ['bogling', 'bogling', 'eel'], intro: 'The mud stands up.' },
    choir: { enemies: ['drowned', 'marshlight'], waves: [['drowned', 'drowned']], waveText: ['More of the drowned choir wade out of the water!'], intro: 'The Drowned Choir rises from the nave.' },
    abbey_drowned: { enemies: ['drowned', 'drowned', 'marshlight'] },
    warden: { enemies: ['acolyte', 'hask', 'acolyte'], boss: true, intro: 'Warden Hask draws a hook-bladed knife.' },
    warden_small: { enemies: ['hask', 'acolyte'], boss: true, intro: "Warden Hask draws a hook-bladed knife. With Coll exposed, half his acolytes stayed home." },
    veyra: { enemies: ['acolyte', 'veyraboss', 'acolyte'], boss: true, music: 'boss', intro: 'Veyra lifts her lamp. It burns grey.' },
    prior: { enemies: ['drowned', 'prior', 'drowned'], boss: true, intro: 'The Drowned Prior rises, and the water rises with him.' },
    brannoc2: { enemies: ['brannoc2', 'bruiser2', 'bruiser2'], bg: 'tavern', intro: 'Brannoc kicks the table over. Again.' },
    seacrabs: { enemies: ['crab', 'crab', 'crab'] },
    seadrowned: { enemies: ['drowned', 'drowned', 'eel'] },
    snapjaw: { enemies: ['snapjaw', 'crab'], boss: true, intro: 'Old Snapjaw rears up off the oil casks.' },
    belllights: { enemies: ['marshlight', 'marshlight'], waves: [['marshlight', 'marshlight']], waveText: ['The bell tolls, and two more lights answer it!'] },
    bellwraith: { enemies: ['bellwraith', 'marshlight', 'marshlight'], boss: true, intro: 'The Bell-Wraith swings its clapper like a mace.' }
  });

  Object.assign(D.items, {
    greater: { name: 'Strong Draught', price: 45, target: 'ally', field: true, desc: 'Restores 4d4+10 HP.', fx: [{ t: 'heal', dice: '4d4+10' }] },
    tag: { name: 'Name-tag', type: 'key', desc: 'A tin tag on a cord, stamped with a fisherman\'s name. Sister Ysolde wants them back.' },
    tidechart: { name: 'Tide Chart', type: 'key', desc: "Sister Ysolde's chart of the Mirefen boardwalks and the hours of the low tide." },
    oil: { name: 'Lighthouse Oil', type: 'key', desc: 'A cask of whale oil for the Saltmere lighthouse.' },
    kettle: { name: "Mother Brine's Kettle", type: 'key', desc: 'Copper, dented, and still warm somehow.' },
    treasurykey: { name: 'Abbey Treasury Key', type: 'key', desc: 'Brannoc took it off a dead acolyte. It opens the Prior\'s treasury.' },
    verse2: { name: 'The Fifth Verse, Second Stanza', type: 'key', desc: '"She held it through the longest night, and asked no crown, and took no throne; she kept the door, she kept the light, and kept the keeping all alone."' },
    // gear sold in Saltmere
    reaver: { name: "Reaver's Greataxe", type: 'weapon', for: ['runa'], dmg: '2d6', mods: { atk: 1, dmgBonus: 1 }, price: 240 },
    scalemail: { name: 'Scale Hauberk', type: 'armor', for: ['runa'], mods: { ac: 4 }, price: 220 },
    kris: { name: 'Saltmere Kris', type: 'weapon', for: ['dask'], dmg: '1d8', mods: { atk: 2 }, price: 200 },
    sharkskin: { name: 'Sharkskin Jerkin', type: 'armor', for: ['dask'], mods: { ac: 3, spd: 1 }, price: 200 },
    tidemace: { name: "Tide-warden's Mace", type: 'weapon', for: ['maren'], dmg: '1d10', mods: { pow: 1 }, price: 220 },
    chapelmail: { name: 'Chapel Mail', type: 'armor', for: ['maren'], mods: { ac: 5 }, price: 260 },
    sabre: { name: 'Corsair Sabre', type: 'weapon', for: ['finch'], dmg: '1d10', mods: { spd: 1 }, price: 210 },
    brigantine: { name: 'Brigandine Coat', type: 'armor', for: ['finch'], mods: { ac: 3 }, price: 180 },
    pearl: { name: 'Grey Pearl', type: 'charm', mods: { save: 2 }, price: 150 },
    sharktooth: { name: 'Shark-tooth Charm', type: 'charm', mods: { dmgBonus: 2 }, price: 180 },
    // found in chapter 2
    snapshell: { name: 'Snapjaw Shell', type: 'armor', for: ['runa'], mods: { ac: 5, hp: 6 }, desc: 'Old Snapjaw\'s back plate, strapped on. It still smells.' },
    keeperlens: { name: "Keeper's Lens", type: 'charm', mods: { pow: 2, save: 1 }, desc: 'A lighthouse lens the size of a coin. It never quite stops glowing.' },
    brineward: { name: "Brine's Ward", type: 'charm', mods: { save: 2, hp: 5 }, desc: 'A knot of fen-grass and fishbone. Mother Brine swears by it.' },
    bellmail: { name: 'Bell-bronze Mail', type: 'armor', for: ['maren'], mods: { ac: 6, save: 1 }, desc: 'Mail rung out of an old bell. It hums when Maren prays.' },
    drownedkris: { name: 'Drowned Kris', type: 'weapon', for: ['dask'], dmg: '1d8+1', mods: { atk: 2, spd: 1 }, desc: 'From the Prior\'s treasury. The blade is always wet.' },
    censer: { name: "Prior's Censer", type: 'charm', mods: { pow: 2, sp: 4 }, desc: 'Burned for twelve drowned monks. It still smokes, faintly, on its own.' }
  });
  Object.assign(D.shops, {
    chandler: { name: "Pettibone's Chandlery", blurb: 'Rope, salt, lamp-oil and things for the fen.', stock: ['campkit', 'draught', 'greater', 'tonic', 'bitterroot', 'salts', 'flask', 'pearl', 'sharktooth'] },
    rook: { name: "Rook's Forge", blurb: 'Sea-iron. Rusts slower than the land kind.', stock: ['reaver', 'scalemail', 'kris', 'sharkskin', 'tidemace', 'chapelmail', 'sabre', 'brigantine'] }
  });
})();
