/* Chapter 3 — enemies, groups, guests, items and shops for Karrow Hold, the Frost Pass and the Giant's Cairn.
   Balance: a chapter 3 party is level 8-12. Ordinary fights should cost 8-18% of the party's HP at the level
   the player meets them; mini-bosses 25-35%; Hrimgar 35-50%. */
(function () {
  const D = G.D;

  Object.assign(D.sprites, {
    frostacolyte: { skin: '#e0c0a0', top: '#9a9aa8', robe: 1, hood: '#d8dce8', trim: '#7fb0e8' },
    frostzealot: { skin: '#d8a070', hair: '#3a2a1e', top: '#7a7a88', legs: '#3a3a44', helm: '#c8ccd8', trim: '#7fb0e8' },
    wight: { skel: 1, top: '#5a6a7a', helm: '#8a9aaa' },
    watcher: { skel: 1, robe: 1, hood: '#4a5a7a', trim: '#e8c14a' },
    nagra: { skin: '#7a9a4a', hair: '#3a2a1e', long: 1, top: '#6a4a2a', legs: '#3a3028', trim: '#c8c8d4' },
    giant: { skin: '#a8b8c8', hair: '#e8eef4', beard: 1, top: '#4a5a6a', legs: '#2a3a4a', helm: '#8a7a5a' },
    bryn: { skin: '#e0a67c', hair: '#c8a050', long: 1, top: '#6a3a2a', legs: '#3a3028', trim: '#c8c8d4' },
    shieldmaiden: { skin: '#e8b890', hair: '#8a5a2a', long: 1, top: '#4a5a3a', legs: '#3a3028', helm: '#8a8a94' }
  });
  Object.assign(D.pix, {
    bear: { pal: { a: '#e8eef4', b: '#b8c4d0', e: '#1a1420', n: '#3a3440' }, rows: [
      '................', '................', '...bb......bb...', '..baab....baab..', '..baaaaaaaaaab..', '..aaaeaaaaeaaa..',
      '..aaaaannaaaaa..', '...aaaaaaaaaa...', '..aaaaaaaaaaaa..', '.aaaaaaaaaaaaaa.', '.aaaaaaaaaaaaaa.', '.aabaaaaaaaabaa.',
      '.aab.aaaaaa.baa.', '.bb..bb..bb..bb.', '................', '................'] },
    golem: { pal: { a: '#8d8f9c', b: '#666876', c: '#a9abb8', e: '#7fd0ff' }, rows: [
      '................', '.....cccccc.....', '.....caeaeab....', '.....aaaaaab....', '..ccc.aaaa.ccc..', '.caaaaaaaaaaaab.',
      '.caabaaaaaabaab.', '.aab.aaaaaa.baa.', '.aa..aaccaa..aa.', '.bb..aaaaaa..bb.', '.....aa..aa.....', '.....aa..aa.....',
      '....caa..aac....', '....bbb..bbb....', '................', '................'] },
    frostspirit: { pal: { w: '#ffffff', b: '#a8d8ff', c: '#4a7ab8', e: '#1a1420' }, rows: [
      '................', '.......c........', '......cc........', '.....cbbc.......', '....cbwwbc......', '....bwwwwb......',
      '...cbwwwwbc.....', '...bwwwwwwb.....', '...bweweewb.....', '...bwwwwwwb.....', '....bwwwwb......', '.....bbbb.......',
      '......cc........', '.......c........', '................', '................'] }
  });

  Object.assign(D.abilities, {
    stomp: { name: 'Stomp', target: 'allEnemies', fx: [{ t: 'damage', dice: '2d6', pow: true, save: 'half' }, { t: 'status', id: 'stunned', turns: 2, save: true, quiet: 1 }] },
    frostbreath: { name: 'Frost Breath', target: 'allEnemies', fx: [{ t: 'damage', dice: '2d6', pow: true, save: 'half', sfx: 'magic' }] },
    maul: { name: 'Maul', target: 'enemy', fx: [{ t: 'attack', times: 2, atkMod: -1 }] },
    shieldwall: { name: 'Shield Wall', target: 'allAllies', fx: [{ t: 'status', id: 'guard', turns: 2, quiet: 1 }] }
  });

  const U = ['undead'], NOSLEEP = ['asleep', 'poison'];
  Object.assign(D.enemies, {
    frostwolf: { name: 'Frost Wolf', sprite: 'wolf', hp: 60, ac: 15, atk: 9, dmg: '1d10+5', spd: 5, save: 3, xp: 95, gold: [0, 6], tags: ['beast'], moves: [[3, 'attack'], [1, 'savage']] },
    icewight: { name: 'Ice Wight', sprite: 'wight', hp: 80, ac: 16, atk: 9, dmg: '1d10+6', pow: 5, spd: 2, save: 4, xp: 120, gold: [6, 16], tags: U, immune: NOSLEEP, moves: [[3, 'attack'], [1, 'gravechill']] },
    frostspirit: { name: 'Frost Spirit', sprite: 'frostspirit', hp: 42, ac: 17, atk: 9, dmg: '1d8+5', pow: 6, spd: 6, save: 3, xp: 80, gold: [0, 6], tags: U, immune: NOSLEEP, moves: [[2, 'attack'], [2, 'spark']] },
    hlacolyte: { name: 'Pale Hand Frost-priest', sprite: 'frostacolyte', hp: 60, ac: 15, atk: 8, dmg: '1d8+5', pow: 6, spd: 3, save: 4, xp: 90, gold: [10, 20], tags: ['human'], moves: [[2, 'attack'], [2, 'spark'], [1, 'hex']], loot: [['potent', 0.15]] },
    hlzealot: { name: 'Pale Hand Reaver', sprite: 'frostzealot', hp: 90, ac: 17, atk: 10, dmg: '1d10+6', spd: 2, save: 4, xp: 125, gold: [14, 26], tags: ['human'], moves: [[3, 'attack'], [1, 'chant']] },
    snowgoblin: { name: 'Hill Goblin', sprite: 'goblin', hp: 45, ac: 15, atk: 8, dmg: '1d8+4', spd: 4, save: 2, xp: 60, gold: [4, 10], tags: ['goblin'] },
    stoneguard: { name: 'Cairn Guardian', sprite: 'golem', hp: 130, ac: 18, atk: 10, dmg: '2d6+6', spd: 0, save: 5, xp: 170, gold: [0, 0], tags: ['construct'],
      immune: ['asleep', 'poison', 'stunned'], moves: [[3, 'attack'], [1, 'crush'], [1, 'shellguard']] },
    shieldmaiden: { name: 'Karrow Shieldmaiden', sprite: 'shieldmaiden', hp: 70, ac: 16, atk: 9, dmg: '1d8+5', spd: 2, save: 3, xp: 80, gold: [0, 0], tags: ['human'], moves: [[3, 'attack'], [1, 'shieldwall']] },
    bryn: { name: 'Bryn Stonehand', sprite: 'bryn', hp: 150, ac: 16, atk: 10, dmg: '1d10+5', spd: 3, save: 4, xp: 180, gold: [0, 0], tags: ['human'], immune: ['asleep'], moves: [[3, 'attack'], [1, 'maul']] },
    // mini-bosses and bosses
    nagra: { name: 'Nagra Grukk-sister', sprite: 'nagra', hp: 160, ac: 16, atk: 10, dmg: '2d6+5', spd: 3, save: 3, xp: 220, gold: [40, 60], tags: ['goblin'], immune: ['asleep'], moves: [[3, 'attack'], [1, 'maul'], [1, 'bellow']] },
    rimeclaw: { name: 'Rimeclaw', sprite: 'bear', scale: 4, hp: 360, ac: 16, atk: 11, dmg: '2d8+6', spd: 2, save: 4, xp: 420, gold: [0, 0], tags: ['beast'],
      immune: ['asleep', 'stunned'], moves: [[3, 'attack'], [2, 'maul'], [1, 'bellow']], loot: [['rimecloak', 1]] },
    watcher: { name: 'The Last Watcher', sprite: 'watcher', hp: 250, ac: 17, atk: 10, dmg: '1d10+6', pow: 7, spd: 3, save: 5, xp: 360, gold: [40, 60], tags: U,
      immune: ['asleep', 'poison', 'stunned'], moves: [[2, 'attack'], [2, 'tolling'], [1, 'gravechill']] },
    veyra3: { name: 'Sister Veyra', sprite: 'veyra', hp: 260, ac: 16, atk: 9, dmg: '1d8+5', pow: 8, spd: 3, save: 6, xp: 380, gold: [0, 0], tags: ['human'],
      immune: ['asleep', 'stunned'], moves: [[1, 'attack'], [3, 'lampfire'], [2, 'hex'], [1, 'mend']] },
    giant: { name: 'Hrimgar the Sleeper', sprite: 'giant', scale: 4, hp: 550, ac: 17, atk: 10, dmg: '2d8+6', pow: 6, spd: 1, save: 6, xp: 900, gold: [150, 150], tags: ['giant'],
      immune: ['asleep', 'poison', 'stunned'], moves: [[3, 'attack'], [2, 'stomp'], [1, 'frostbreath'], [1, 'crush']] }
  });

  Object.assign(D.guests, {
    bryn: { name: 'Bryn', sprite: 'bryn', hp: 110, ac: 16, atk: 10, dmg: '1d10+5', spd: 3, save: 4, moves: [[3, 'attack'], [1, 'maul']], joinText: 'Bryn Stonehand fights beside you. She acts on her own.' },
    veyra: { name: 'Veyra', sprite: 'veyra', hp: 95, ac: 15, atk: 8, dmg: '1d8+4', pow: 8, spd: 3, save: 5, moves: [[2, 'lampfire'], [1, 'mend'], [1, 'attack']], joinText: 'Veyra fights beside you. Her lamp burns white again.' }
  });

  Object.assign(D.groups, {
    roadwolves: { enemies: ['frostwolf', 'frostwolf', 'frostwolf'], bg: 'snow', intro: 'Frost wolves come down off the ridge, three of them, and they are hungry.' },
    trial: { enemies: ['shieldmaiden', 'bryn', 'shieldmaiden'], bg: 'snow', brawl: true, retryOnly: true, retryText: 'Bryn hauls you up by the collar. "Again. The clan is watching."', intro: 'Bryn and two shieldmaidens step into the ring. Fists and shield-rims only.' },
    fp_wolves: { enemies: ['frostwolf', 'frostwolf', 'frostwolf'] },
    fp_wights: { enemies: ['icewight', 'icewight'] },
    fp_spirits: { enemies: ['frostspirit', 'frostspirit', 'frostspirit'] },
    fp_cult: { enemies: ['hlacolyte', 'hlzealot'] },
    scouts: { enemies: ['hlacolyte', 'hlzealot', 'hlacolyte'], intro: 'Pale Hand scouts hold the gap in the ridge.' },
    cairncamp: { enemies: ['hlzealot', 'hlacolyte'], waves: [['hlzealot', 'hlacolyte']], waveText: ['Their friends come out of the tents!'], intro: "The Pale Hand's camp below the Cairn turns out to meet you." },
    nagra: { enemies: ['snowgoblin', 'nagra', 'snowgoblin'], intro: 'Nagra hefts her brother\'s cleaver.' },
    guardians: { enemies: ['stoneguard', 'stoneguard'], bg: 'crypt', intro: 'The Cairn Guardians lift their heads.' },
    cairnwights: { enemies: ['icewight', 'frostspirit', 'icewight'], bg: 'crypt' },
    veyra3: { enemies: ['hlzealot', 'veyra3', 'hlzealot'], bg: 'crypt', boss: true, music: 'boss', intro: 'Veyra raises her lamp. It burns grey, and her hand is shaking.' },
    giant: { enemies: ['giant', 'icewight'], bg: 'crypt', boss: true, intro: 'Hrimgar the Sleeper stands up, and up, and up.' },
    ic_wolves: { enemies: ['frostwolf', 'frostwolf', 'frostwolf'] },
    ic_wights: { enemies: ['icewight', 'icewight', 'frostspirit'] },
    rimeclaw: { enemies: ['rimeclaw', 'frostwolf'], boss: true, intro: 'Rimeclaw rears up, white as the cave and twice as cold.' },
    wt_spirits: { enemies: ['frostspirit', 'frostspirit'], waves: [['frostspirit', 'frostspirit']], waveText: ['The wind howls, and two more spirits take shape!'] },
    watcher: { enemies: ['frostspirit', 'watcher', 'frostspirit'], boss: true, intro: 'The Last Watcher draws a sword that is mostly frost.' }
  });

  Object.assign(D.items, {
    potent: { name: 'Potent Draught', price: 90, target: 'ally', field: true, desc: 'Restores 6d4+20 HP.', fx: [{ t: 'heal', dice: '6d4+20' }] },
    // gear sold in Karrow Hold
    karrowaxe: { name: 'Karrow Greataxe', type: 'weapon', for: ['runa'], dmg: '2d8', mods: { atk: 1 }, price: 520 },
    wolfplate: { name: 'Wolfhide Plate', type: 'armor', for: ['runa'], mods: { ac: 5, hp: 5 }, price: 480 },
    icepick: { name: 'Icepick Stiletto', type: 'weapon', for: ['dask'], dmg: '1d10', mods: { atk: 2, spd: 1 }, price: 460 },
    snowcloak: { name: 'Snowcloak', type: 'armor', for: ['dask'], mods: { ac: 4, spd: 1 }, price: 420 },
    runemace: { name: 'Rune Mace', type: 'weapon', for: ['maren'], dmg: '1d12', mods: { pow: 2 }, price: 480 },
    oathmail: { name: 'Oath-mail', type: 'armor', for: ['maren'], mods: { ac: 6, save: 1 }, price: 520 },
    skaldblade: { name: "Skald's Blade", type: 'weapon', for: ['finch'], dmg: '1d12', mods: { spd: 1, pow: 1 }, price: 460 },
    furcoat: { name: 'Bear-fur Coat', type: 'armor', for: ['finch'], mods: { ac: 4, hp: 4 }, price: 400 },
    frostward: { name: 'Frost-ward Amulet', type: 'charm', mods: { save: 3 }, price: 300 },
    wolfcharm: { name: 'Wolf-fang Charm', type: 'charm', mods: { dmgBonus: 3 }, price: 340 },
    // found in chapter 3
    oathstone: { name: 'Oathstone', type: 'charm', mods: { ac: 2, save: 1 }, desc: 'A river pebble with Runa\'s name scratched in it at sixteen. Sigrid kept it.' },
    rimecloak: { name: "Rimeclaw's Pelt", type: 'armor', for: ['dask'], mods: { ac: 5, spd: 1, hp: 5 }, desc: 'Warm, white, and enormous. Dask wears about a third of it.' },
    watchermail: { name: "Watcher's Mail", type: 'armor', for: ['finch'], mods: { ac: 5, save: 2 }, desc: 'Mail from the watchtower of the Fifth Lamp. It rings faintly when Finch sings.' },
    hallvardaxe: { name: "Hallvard's Axe", type: 'weapon', for: ['runa'], dmg: '2d8+1', mods: { atk: 2 }, desc: 'Old Warden Hallvard\'s axe, from the Oath-Vault. It was at the Cairn door the night he died.' },
    clanring: { name: 'Clan Ring of Karrow', type: 'charm', mods: { hp: 8, dmgBonus: 1 }, desc: 'Bronze, worn smooth. Every Cairnwarden wore one.' },
    giantheart: { name: "Hrimgar's Heart-stone", type: 'charm', mods: { pow: 3, dmgBonus: 2, hp: 10 }, desc: 'Cold as the deep of winter, and heavy with a giant\'s strength. The Cairn will not sleep without it.' },
    shard3: { name: 'The Cairn Shard', type: 'key', desc: 'The third shard of the Barrow King\'s crown. It is cold enough to burn.' },
    verse3: { name: 'The Fifth Verse, Third Stanza', type: 'key', desc: '"And when the four had kept their sleep, she found the door would not stay shut; she took the key into the deep, and turned it, and was not seen but..."' },
    letter3: { name: "Kell's Letter", type: 'key', desc: 'Warden Kell\'s last report to the Wardens, unsent: the Cairn lamp is failing from inside, not from out.' }
  });
  Object.assign(D.shops, {
    thora: { name: "Thora's Forge", blurb: 'Hill-iron, cold-forged. It does not shatter in the frost.', stock: ['karrowaxe', 'wolfplate', 'icepick', 'snowcloak', 'runemace', 'oathmail', 'skaldblade', 'furcoat'] },
    ulf: { name: "Ulf's Furs and Sundries", blurb: 'Furs, salves, and anything that keeps you breathing up there.', stock: ['campkit', 'draught', 'greater', 'potent', 'tonic', 'salts', 'bitterroot', 'frostward', 'wolfcharm'] }
  });
})();
