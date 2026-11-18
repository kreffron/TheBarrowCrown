/* Chapter 5 — enemies, groups, guests, items and shops for Ashfall, the Ashen Road and the Hollow Barrow.
   Balance: a chapter 5 party is level 16-20. Ordinary fights should cost 8-18% of the party's HP at the
   level the player meets them; mini-bosses 25-35%; Corr and the Barrow King 40-55%. */
(function () {
  const D = G.D;

  Object.assign(D.sprites, {
    palecrusader: { skin: '#d8a070', hair: '#3a2a1e', top: '#e8e8f0', legs: '#5a5a66', helm: '#f4f4fa', trim: '#e8c14a' },
    palemagus: { skin: '#e0d0c0', top: '#d8d4e8', robe: 1, hood: '#f4f1e6', trim: '#e8c14a' },
    ashghoul: { skin: '#8a8078', hair: '#3a3430', top: '#4a4038', legs: '#3a3430', eyes: '#ff9a2e' },
    deathknight: { skel: 1, top: '#3a2a44', helm: '#2a2034', trim: '#e8c14a' },
    courtier: { skel: 1, robe: 1, hood: '#4a2a5a', trim: '#e8c14a' },
    ashenknight: { skin: '#a89890', hair: '#2a2a2a', top: '#4a4044', legs: '#2a2224', helm: '#6a5a58', trim: '#ff9a2e' },
    corrcrowned: { skin: '#e8d0b8', hair: '#d8d8e0', top: '#2a2438', robe: 1, trim: '#e8c14a', helm: '#e8c14a' },
    ennet: { skin: '#e8d8c8', hair: '#f0e8d8', long: 1, top: '#f4f1e6', robe: 1, trim: '#ffe07a' },
    captain5: { skin: '#e0a67c', hair: '#6b3f2a', beard: 1, top: '#6a1e2a', legs: '#3a3a44', helm: '#d8dce8', trim: '#e8c14a' }
  });
  Object.assign(D.pix, {
    ashwraith: { pal: { w: '#ffe0b0', b: '#ff9a2e', c: '#8a3a1a', e: '#1a1420' }, rows: [
      '................', '.......c........', '......cc........', '.....cbbc.......', '....cbwwbc......', '....bwwwwb......',
      '...cbwwwwbc.....', '...bwwwwwwb.....', '...bweweewb.....', '...bwwwwwwb.....', '....bwwwwb......', '.....bbbb.......',
      '......cc........', '.......c........', '................', '................'] },
    mirrorshade: { pal: { w: '#e8f0ff', b: '#9aaac8', c: '#4a5a7a', e: '#1a1420' }, rows: [
      '................', '.......c........', '......cc........', '.....cbbc.......', '....cbwwbc......', '....bwwwwb......',
      '...cbwwwwbc.....', '...bwwwwwwb.....', '...bweweewb.....', '...bwwwwwwb.....', '....bwwwwb......', '.....bbbb.......',
      '......cc........', '.......c........', '................', '................'] }
  });

  Object.assign(D.abilities, {
    kingsvoice: { name: "The King's Voice", target: 'allEnemies', fx: [{ t: 'damage', dice: '2d8', pow: true, save: 'half', sfx: 'magic' }, { t: 'status', id: 'rattled', turns: 2, v: 3, save: true, quiet: 1 }] },
    ashstorm: { name: 'Ash Storm', target: 'allEnemies', fx: [{ t: 'damage', dice: '2d10', pow: true, save: 'half', sfx: 'fire' }] },
    crownguard: { name: 'Crown-guard', target: 'self', fx: [{ t: 'status', id: 'warded', turns: 3, quiet: 1 }, { t: 'status', id: 'guard', turns: 2 }] }
  });

  const U = ['undead'], NOSLEEP = ['asleep', 'poison'];
  Object.assign(D.enemies, {
    ashghoul: { name: 'Ash Ghoul', sprite: 'ashghoul', hp: 170, ac: 18, atk: 14, dmg: '2d8+8', spd: 4, save: 5, xp: 260, gold: [10, 25], tags: U, immune: NOSLEEP, moves: [[3, 'attack'], [1, 'dragunder']] },
    ashwraith: { name: 'Lamp-eater', sprite: 'ashwraith', hp: 130, ac: 20, atk: 13, dmg: '1d10+8', pow: 12, spd: 6, save: 5, xp: 250, gold: [5, 20], tags: U, immune: NOSLEEP, moves: [[1, 'attack'], [2, 'spark'], [1, 'gravechill']] },
    palecrusader: { name: 'Pale Crusader', sprite: 'palecrusader', hp: 200, ac: 20, atk: 15, dmg: '2d8+9', spd: 2, save: 6, xp: 300, gold: [25, 50], tags: ['human'], moves: [[3, 'attack'], [1, 'chant'], [1, 'maul']], loot: [['elixir', 0.12]] },
    palemagus: { name: 'Pale Magus', sprite: 'palemagus', hp: 150, ac: 18, atk: 13, dmg: '1d10+8', pow: 12, spd: 3, save: 6, xp: 280, gold: [25, 50], tags: ['human'], moves: [[1, 'attack'], [2, 'spark'], [1, 'hex'], [1, 'bonestorm']] },
    deathknight: { name: 'Barrow Knight', sprite: 'deathknight', hp: 230, ac: 21, atk: 15, dmg: '2d10+8', spd: 2, save: 6, xp: 330, gold: [20, 40], tags: U, immune: NOSLEEP, moves: [[3, 'attack'], [1, 'crush']] },
    courtier: { name: 'Hollow Courtier', sprite: 'courtier', hp: 160, ac: 19, atk: 14, dmg: '1d10+8', pow: 12, spd: 4, save: 6, xp: 270, gold: [20, 40], tags: U, immune: NOSLEEP, moves: [[1, 'attack'], [2, 'tolling'], [1, 'hex']] },
    mirrorshade: { name: 'Mirror Shade', sprite: 'mirrorshade', hp: 150, ac: 19, atk: 14, dmg: '2d6+8', pow: 11, spd: 5, save: 5, xp: 260, gold: [0, 10], tags: U, immune: NOSLEEP, moves: [[2, 'attack'], [2, 'spark']] },
    // mini-bosses and bosses
    ashenknight: { name: 'The Ashen Knight', sprite: 'ashenknight', scale: 4, hp: 620, ac: 21, atk: 15, dmg: '2d10+9', pow: 11, spd: 2, save: 6, xp: 1300, gold: [300, 300], tags: ['human'],
      immune: ['asleep', 'stunned'], moves: [[3, 'attack'], [2, 'ashstorm'], [1, 'maul'], [1, 'crownguard']], loot: [['ashenblade', 1]] },
    hollowself: { name: 'The Hollow Self', sprite: 'mirrorshade', scale: 4, hp: 800, ac: 20, atk: 15, dmg: '2d10+8', pow: 12, spd: 4, save: 6, xp: 1300, gold: [100, 100], tags: U,
      immune: ['asleep', 'poison', 'stunned'], moves: [[2, 'attack'], [2, 'tolling'], [1, 'hex'], [1, 'gravechill']] },
    corr: { name: 'Ilvane Corr, Crowned in Four', sprite: 'corrcrowned', scale: 3, hp: 300, ac: 20, atk: 14, dmg: '2d10+8', pow: 13, spd: 3, save: 7, xp: 1600, gold: [500, 500], tags: ['human'],
      immune: ['asleep', 'stunned', 'charmed'], moves: [[2, 'attack'], [2, 'kingsvoice'], [1, 'hex'], [1, 'crownguard']] },
    corrshaken: { name: 'Ilvane Corr, Crown Slipping', sprite: 'corrcrowned', scale: 3, hp: 240, ac: 19, atk: 14, dmg: '2d10+8', pow: 12, spd: 3, save: 6, xp: 1600, gold: [500, 500], tags: ['human'],
      immune: ['asleep', 'stunned', 'charmed'], moves: [[2, 'attack'], [2, 'kingsvoice'], [1, 'hex'], [1, 'crownguard']] },
    veyrafoe: { name: 'Sister Veyra', sprite: 'veyra', hp: 180, ac: 17, atk: 12, dmg: '1d8+7', pow: 13, spd: 3, save: 7, xp: 300, gold: [0, 0], tags: ['human'], immune: ['asleep', 'stunned'], moves: [[1, 'attack'], [3, 'lampfire'], [1, 'mend']] },
    king: { name: 'Vael Morn, the Barrow King', sprite: 'king', scale: 4, hp: 1390, ac: 21, atk: 15, dmg: '2d10+9', pow: 14, spd: 3, save: 8, xp: 2000, gold: [0, 0], tags: U,
      immune: ['asleep', 'poison', 'stunned', 'charmed'], moves: [[3, 'attack'], [2, 'kingsvoice'], [1, 'bonestorm'], [1, 'gravechill']] }
  });

  Object.assign(D.guests, {
    ennet: { name: 'Ennet', sprite: 'ennet', hp: 190, ac: 18, atk: 13, dmg: '1d10+8', pow: 14, spd: 4, save: 7, moves: [[2, 'lampfire'], [1, 'mend'], [1, 'blessing']], joinText: 'Ennet Tallowmere, the Fifth Lamp, fights beside you. Three hundred years, and her lamp still burns.' },
    veyra5: { name: 'Veyra', sprite: 'veyra', hp: 170, ac: 17, atk: 12, dmg: '1d8+7', pow: 13, spd: 3, save: 7, moves: [[2, 'lampfire'], [1, 'mend'], [1, 'attack']], joinText: 'Veyra fights beside you. Her lamp burns white.' },
    bryn5: { name: 'Bryn', sprite: 'bryn', hp: 180, ac: 18, atk: 15, dmg: '2d8+8', spd: 3, save: 6, moves: [[3, 'attack'], [1, 'maul']], joinText: 'Bryn Stonehand fights beside you. Karrow Hold keeps its oaths.' },
    captain5: { name: 'Captain Hale', sprite: 'captain5', hp: 170, ac: 19, atk: 14, dmg: '2d8+7', spd: 2, save: 6, moves: [[3, 'attack'], [1, 'shieldwall']], joinText: "Captain Hale of the Duke's guard fights beside you. His Grace sends his regards." }
  });

  Object.assign(D.groups, {
    outriders: { enemies: ['palecrusader', 'palemagus'], waves: [['palecrusader', 'ashghoul']], waveText: ['More outriders come over the ridge!'], bg: 'ash', intro: "Corr's outriders, white armour grey with ash, come down the road at a gallop." },
    ar_wraiths: { enemies: ['ashwraith', 'ashwraith', 'ashwraith'] },
    ar_ghouls: { enemies: ['ashghoul', 'ashghoul'] },
    ar_cult: { enemies: ['palecrusader', 'palemagus'] },
    lampeater: { enemies: ['ashwraith', 'ashwraith'], intro: 'Lamp-eaters, curled around the dead way-lamp like cats around a stove.' },
    warline: { enemies: ['palecrusader', 'palemagus', 'palecrusader'], waves: [['deathknight', 'ashghoul']], waveText: ['A Death Knight rides out of the ash with a ghoul at its stirrup!'], intro: "The Pale Hand's line holds the canyon. Behind it, the dead stand in ranks." },
    warline_small: { enemies: ['palecrusader', 'palemagus'], waves: [['ashghoul']], waveText: ['A ghoul claws its way out of the cinders behind them!'], intro: 'Your allies crash into the Pale Hand line on both flanks. Only the centre is left for you.' },
    gateguard: { enemies: ['deathknight', 'deathknight', 'ashwraith'], intro: 'The Barrow Knights at the gate draw swords three hundred years old.' },
    gh_guards: { enemies: ['palecrusader', 'palecrusader'], bg: 'crypt' },
    ashenknight: { enemies: ['palemagus', 'ashenknight', 'palemagus'], bg: 'crypt', boss: true, intro: 'The Ashen Knight rises from his chair, and the braziers flare.' },
    ms_dask: { enemies: ['mirrorshade', 'mirrorshade'], bg: 'crypt', intro: 'Two shades step out of the ledgers, wearing the faces of men Dask owed.' },
    hollowself: { enemies: ['mirrorshade', 'hollowself', 'mirrorshade'], bg: 'crypt', boss: true, intro: 'The mirror shows the four of you. Then it steps out.' },
    court: { enemies: ['deathknight', 'courtier', 'deathknight'], bg: 'throne', intro: "The King's court rises to greet its guests." },
    hw_dead: { enemies: ['ashghoul', 'ashwraith', 'ashghoul'], bg: 'throne' },
    corr: { enemies: ['palecrusader', 'corr', 'palecrusader'], bg: 'throne', boss: true, music: 'finale', intro: 'Four shards burn on Corr\'s brow, and he is smiling.' },
    corr_shaken: { enemies: ['palecrusader', 'corrshaken', 'palecrusader'], bg: 'throne', boss: true, music: 'finale', intro: 'Corr rams the circlet back onto his brow, and it does not sit straight.' },
    corrveyra: { enemies: ['veyrafoe', 'corr', 'palecrusader'], bg: 'throne', boss: true, music: 'finale', intro: 'Veyra raises her grey lamp beside Corr. Her hand is shaking.' },
    king: { enemies: ['king', 'courtier'], simGuests: ['ennet'], bg: 'throne', boss: true, music: 'finale', intro: 'Vael Morn, the Barrow King, stands up from his throne for the first time in three hundred years.' }
  });

  Object.assign(D.items, {
    // gear sold at Ashfall
    kingsbane: { name: 'Kingsbane', type: 'weapon', for: ['runa'], dmg: '2d12', mods: { atk: 2 }, price: 1600 },
    oathplate: { name: 'Oath-plate', type: 'armor', for: ['runa'], mods: { ac: 7, hp: 12 }, price: 1500 },
    debtcutter: { name: 'Debt-cutter', type: 'weapon', for: ['dask'], dmg: '1d12+2', mods: { atk: 3, spd: 1 }, price: 1450 },
    nightveil: { name: 'Nightveil', type: 'armor', for: ['dask'], mods: { ac: 6, spd: 2, save: 1 }, price: 1400 },
    lampbearer: { name: 'Lamp-bearer', type: 'weapon', for: ['maren'], dmg: '1d12+2', mods: { pow: 4 }, price: 1500 },
    wardenplate: { name: 'Warden-plate', type: 'armor', for: ['maren'], mods: { ac: 8, save: 2 }, price: 1600 },
    balladblade: { name: 'Ballad-blade', type: 'weapon', for: ['finch'], dmg: '1d12+1', mods: { pow: 3, spd: 1 }, price: 1450 },
    skaldmail: { name: "Skald's Mail", type: 'armor', for: ['finch'], mods: { ac: 6, hp: 10, save: 1 }, price: 1350 },
    fivelamps: { name: 'Charm of Five Lamps', type: 'charm', mods: { save: 5 }, price: 900 },
    dawnstone: { name: 'Dawnstone', type: 'charm', mods: { dmgBonus: 5 }, price: 950 },
    // found in chapter 5
    ashenblade: { name: 'Ashen Blade', type: 'weapon', for: ['runa'], dmg: '2d12+2', mods: { atk: 3 }, desc: "The Ashen Knight's sword. It is still warm." },
    stonehand: { name: "Mother's Stone", type: 'charm', mods: { hp: 20, ac: 2 }, desc: "A stone from Runa's mother's cairn. The mirror gave it back." },
    clearledger: { name: 'A Clean Page', type: 'charm', mods: { atk: 2, spd: 2 }, desc: 'A ledger page with nothing owed on it. Dask keeps it next to his heart.' },
    odricslamp: { name: "Odric's Lamp", type: 'charm', mods: { pow: 4, sp: 6 }, desc: "A fisherman's lamp. Veyra's brother asked Maren to carry it." },
    grandmaharp: { name: "Grandmother's Harp-string", type: 'charm', mods: { pow: 3, save: 3 }, desc: 'Strung on a cord. It hums the fifth verse when no one is listening.' }
  });
  Object.assign(D.shops, {
    quartermaster: { name: "The Wardens' Quartermaster", blurb: 'Everything the Wardens own, laid out on a cart. Pay what you can. Pay more if you can.', stock: ['campkit', 'kingsbane', 'oathplate', 'debtcutter', 'nightveil', 'lampbearer', 'wardenplate', 'balladblade', 'skaldmail'] },
    sutler: { name: 'The Sutler', blurb: 'Draughts, elixirs, charms. Last chance before the Ashen Road.', stock: ['potent', 'elixir', 'tonic', 'salts', 'bitterroot', 'fivelamps', 'dawnstone'], discount: ['wrenFree', 75] }
  });
})();
