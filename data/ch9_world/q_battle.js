/* Battle looks: what people wear and carry on the board, on top of their field look (D.sprites + D.looks). Read only
   by figures.js; the field sprites ignore it. Fields:
     armor: 'plate' | 'mail' | 'leather' | 'coat' | 'rags'   metal: armour colour
     tabard: colour   sigil: 'hand' | 'lamp' | 'skull' | 'crown' | 'flame' | 'wave' | 'snow' | 'anchor' | 'tusk'
     off: 'shield' | 'dagger' | 'book'   shield: shield colour   mask: cloth over the lower face
     glow: colour of shining eyes (undead; any skeleton glows pale blue by default)   boots: colour */
(function () {
  const PALE = '#e8e8f0', HAND = '#c8c4d8';
  G.D.battleLooks = {
    // chapter 1: goblins, Vosk's gang, the barrow dead
    goblin: { armor: 'leather' },
    archer: { armor: 'leather' },
    hexer: { glow: '#ff5a5a', sigil: 'skull' },
    skeleton: { armor: 'rags', off: 'shield', shield: '#5a4a3a' },
    sentinel: { armor: 'mail', metal: '#7a7a72', off: 'shield', shield: '#4a4a52', sigil: 'lamp', trim: '#a8a088' },
    vosk: { armor: 'leather' },
    bruiser: { armor: 'leather' },
    alder: { armor: 'rags', glow: '#c8e0b8' },
    grukk: { armor: 'leather', sigil: 'tusk' },
    abbot: { armor: 'rags', sigil: 'lamp', trim: '#8a8aa0' },
    snagtooth: { armor: 'leather', off: 'dagger' },
    cutthroat: { armor: 'leather', mask: '#2a2a34', off: 'dagger' },
    haskv: { armor: 'leather' },
    greycourier: { sigil: 'hand' },
    keeper: { robe: 1, hood: '#4a4038', held: 'lantern', gem: '#9ad0ff', armor: 'rags', top: '#5a5248' },
    // chapter 2: the drowned, the Pale Hand, smugglers
    drownedman: { armor: 'rags', glow: '#e8f4ff' },
    acolyte: { sigil: 'hand' },
    zealot: { armor: 'mail', tabard: '#d8d8e0', sigil: 'hand', trim: '#8a8aa0' },
    wraith: { glow: '#9ad0ff' },
    hask: { armor: 'leather', off: 'dagger' },
    veyra: { sigil: 'hand' },
    prior: { glow: '#5ae0d0', sigil: 'wave', trim: '#5a9a9a' },
    smuggler: { armor: 'leather' },
    gannet: { armor: 'coat', sigil: 'anchor' },
    longsal: { armor: 'coat', off: 'dagger' },
    archivist: { held: 'book', glow: '#5ae0d0' },
    // chapter 3: the north
    wight: { armor: 'mail', metal: '#8a9aaa', off: 'shield', shield: '#3a4a5a', glow: '#9ad0ff' },
    frostacolyte: { sigil: 'hand' },
    frostzealot: { armor: 'mail', metal: '#a8b0c0', tabard: '#e8eef8', sigil: 'hand', trim: '#7fb0e8' },
    shieldmaiden: { held: 'axe', off: 'shield', shield: '#7a4a2a', armor: 'mail' },
    bryn: { armor: 'leather' },
    nagra: { armor: 'leather' },
    watcher: { armor: 'plate', metal: '#7a8aa8', tabard: '#2a3a5a', sigil: 'lamp', glow: '#9ad0ff' },
    giant: { armor: 'leather' },
    rimemother: { sigil: 'snow', glow: '#8ae0ff' },
    grimtusk: { armor: 'leather', sigil: 'tusk' },
    // chapter 4: the city
    collector: { armor: 'coat' },
    shadowpriest: { sigil: 'hand', glow: '#b48cf0' },
    hlknight: { armor: 'plate', metal: '#d8dce8', tabard: PALE, sigil: 'hand', off: 'shield', shield: PALE, trim: '#8a8aa0' },
    ghoul: { armor: 'rags', glow: '#e8e05a' },
    boneknight: { armor: 'plate', metal: '#7a6a58', off: 'shield', shield: '#4a3a3a', sigil: 'skull', trim: '#c8b8a0' },
    captain: { armor: 'plate', metal: '#e0e2ea', tabard: '#2a3a6a', sigil: 'crown' },
    hollowwarden: { glow: '#ffe07a', sigil: 'lamp' },
    cityguard: { armor: 'mail', tabard: '#6a1e2a', sigil: 'crown', trim: '#e8c14a' },
    inquisitor: { sigil: 'hand' },
    quell: { armor: 'leather', off: 'dagger' },
    duelist: { armor: 'coat', off: 'dagger' },
    // chapter 5: the Barrow King's court
    ashghoul: { armor: 'rags', glow: '#ff9a2e' },
    palecrusader: { armor: 'plate', metal: '#f0f0f6', tabard: PALE, sigil: 'hand', off: 'shield', shield: PALE },
    palemagus: { sigil: 'hand' },
    deathknight: { armor: 'plate', metal: '#4a4452', tabard: '#2a1a34', sigil: 'skull', glow: '#b48cf0', off: 'shield', shield: '#2a1a34' },
    courtier: { glow: '#d8a0ff', sigil: 'crown' },
    ashenknight: { armor: 'plate', metal: '#6a5a58', tabard: '#4a2a1a', sigil: 'flame', off: 'shield', shield: '#3a2a24', glow: '#ff9a2e' },
    corrcrowned: { sigil: 'crown', glow: '#ffe07a' },
    king: { armor: 'plate', metal: '#5a5462', tabard: '#4a1a2a', sigil: 'crown', glow: '#7fd0ff' },
    ashmarshal: { armor: 'plate', metal: '#6a5a58', tabard: '#6a2a1a', sigil: 'flame' },
    ilsabet: { armor: 'plate', metal: '#e8eaf2', tabard: '#3a4a7a', sigil: 'lamp', off: 'shield', shield: '#3a4a7a' },
    // townsfolk who fight beside you now and then
    soldier: { armor: 'mail' },
    clanguard: { armor: 'leather' },
    captain5: { armor: 'plate', tabard: '#6a1e2a', sigil: 'crown' }
  };
})();
