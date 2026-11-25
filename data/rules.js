/* Rules data: tiles, statuses, classes, abilities, music. No chapter content here. */
(function () {
  const D = G.D;

  /* ---------- tiles ----------
     solid: blocks walking.  base: drawn underneath ('ground' = the map's ground tile).
     anim: frames.  v: random variants.  safe: no random encounters.  counter: talk across it. */
  D.tiles = {
    cobweb: { base: 'ground' }, rubbleFloor: { base: 'ground' }, puddle: { base: 'ground', anim: 2 }, moss: { base: 'ground' }, papersFloor: { base: 'ground' }, rime: { base: 'ground' }, shells: { base: 'ground' },
    fern: { base: 'ground' }, tallgrass: { base: 'ground' }, pebbles: { base: 'ground' }, cattail: { base: 'ground' }, icecrystal: { base: 'ground' }, skull: { base: 'ground' },
    shrub: { solid: true, base: 'ground' }, log: { solid: true, base: 'ground' }, snowshrub: { solid: true, base: 'ground' }, deadshrub: { solid: true, base: 'ground' },
    grass: { v: 3 }, flowers: { v: 2 }, path: { v: 2, safe: true }, water: { solid: true, anim: 2 },
    bridge: { safe: true }, brokenBridge: { solid: true, anim: 2 },
    tree: { solid: true, base: 'grass', v: 2 }, pine: { solid: true, base: 'grass' }, bush: { solid: true, base: 'ground' },
    rock: { solid: true, base: 'ground' }, stump: { solid: true, base: 'ground' }, mound: { solid: true, v: 2 },
    roof: { solid: true }, timber: { solid: true }, window: { solid: true }, stonewall: { solid: true }, stonewin: { solid: true },
    door: {}, doorStone: {}, fence: { solid: true, base: 'ground' }, grave: { solid: true, base: 'ground' }, graveOpen: { base: 'ground' },
    well: { solid: true, base: 'ground' }, lamp: { solid: true, base: 'ground', anim: 2 },
    wall: { solid: true }, wallTop: { solid: true, v: 2 }, wallFace: { solid: true }, void: { solid: true },
    wood: { safe: true }, stone: {}, cave: { v: 3 },
    table: { solid: true, base: 'ground' }, counter: { solid: true, counter: true }, bed: { solid: true, base: 'ground' },
    shelf: { solid: true, base: 'ground' }, barrel: { solid: true, base: 'ground' }, crate: { solid: true, base: 'ground' },
    pillar: { solid: true, base: 'ground' }, altar: { solid: true, base: 'ground' }, rug: {}, hearth: { solid: true, anim: 2 },
    pots: { solid: true, base: 'ground' }, anvil: { solid: true, base: 'ground' }, statue: { solid: true, base: 'ground' },
    brazier: { solid: true, base: 'ground', anim: 2 }, bones: { base: 'ground' }, rubble: { solid: true, base: 'ground' },
    // used by things (gfx)
    mat: {}, daylight: {}, stairsDown: {}, stairsUp: {}, chest: {}, chestOpen: {}, sign: {}, notice: {},
    lever: {}, leverOn: {}, gate: {}, lockedDoor: {}, sarcophagus: {}, mushroom: {}, boulder: {},
    shrine: { anim: 2 }, lampDead: {}, crack: {}, caveMouth: {}, sack: {}, throne: { base: 'ground' }, throneBack: { solid: true, base: 'ground' }, coatstand: {}, coatEmpty: {}, web: { base: 'ground' }, ladder: {}, wheel: {}, bramble: {},
    // puzzle pieces (things, and the pit floor)
    plateUp: {}, plateDown: {}, pit: { solid: true }, filledPit: {}, crackFloor: {}, shelfCart: {}, rottenPlanks: {}, thinIce: {}, trap: {}, trapOff: {}, secretDoor: {}, wardLamp: { anim: 2 }, chime: {},
    resetLever: {}, millstone: {}, iceblock: {}, ghostBridge: { anim: 2 }, muralSong: {}, sluice: {}, tideFloor: { v: 2 },
    mirrorA: {}, mirrorB: {}, crystal: {}, crystalLit: { anim: 2 }, sunshaft: { anim: 2 }, sentryPost: {},
    // chapter 2
    sand: { v: 2 }, marsh: { v: 3 }, mud: { v: 2 }, reeds: { solid: true, base: 'ground', v: 2 }, boardwalk: { safe: true },
    shallows: { anim: 2 }, boat: { solid: true, base: 'water' }, net: { base: 'ground' }, lighthouse: {}, lighthouseLit: { anim: 2 }, bell: {}, bellRung: {}, drowned: { base: 'ground' },
    // chapter 3
    snow: { v: 3 }, drift: { v: 3 }, ice: { v: 2 }, frostpine: { solid: true, base: 'ground' }, snowrock: { solid: true, base: 'ground' },
    icewall: { solid: true, walls: ['iceTop', 'iceFace'] }, iceTop: { solid: true, v: 2 }, iceFace: { solid: true, v: 2 },
    standing: { solid: true, base: 'ground' }, snowroof: { solid: true }, tent: { solid: true, base: 'ground' },
    runeBlank: {}, runeBear: {}, runeWolf: {}, runeEagle: {}, runeStone: {}, beacon: {}, beaconLit: { anim: 2 }, horn: { base: 'ground' }, bars: { solid: true, counter: true, base: 'ground' },
    // chapter 4 (placed through map-local legends)
    cobble: { v: 3 }, cobble2: { v: 3 }, marble: { v: 2 }, fountain: { solid: true, anim: 2 }, stall: { solid: true, base: 'ground' },
    sewer: { solid: true, anim: 2 }, niches: { solid: true, walls: ['wallTop', 'nicheFace'] }, nicheFace: { solid: true, v: 2 },
    skulls: { solid: true, base: 'ground' }, coffin: { solid: true, base: 'ground' }, coins: { solid: true, base: 'ground' }, papers: { solid: true, base: 'ground' },
    hedge: { solid: true, base: 'ground' }, banner: { solid: true }, gearwork: { solid: true, base: 'ground', anim: 2 },
    // chapter 5
    ash: { v: 3 }, cinder: { v: 3 }, ember: { anim: 2 }, deadtree: { solid: true, base: 'ground', v: 2 }, waylamp: { solid: true, base: 'ground' }, waylampLit: { solid: true, base: 'ground', anim: 2 },
    obsidian: { solid: true, walls: ['obsidianTop', 'obsidianFace'] }, obsidianTop: { solid: true, v: 2 }, obsidianFace: { solid: true, v: 2 }, kingdoor: { solid: true }, mirror: { solid: true, base: 'ground', anim: 2 }
  };
  /* Map characters. '.' is the map's ground and ',' its second ground; lowercase
     letters and digits are reserved for each map's own things. */
  D.legend = {
    ':': 'path', '~': 'water', '=': 'bridge', 'T': 'tree', 'P': 'pine', 'B': 'bush', 'R': 'rock',
    '^': 'roof', 'W': 'timber', 'N': 'window', 'S': 'stonewall', 'H': 'stonewin', 'F': 'fence', 'G': 'grave', 'O': 'well', 'L': 'lamp',
    '#': 'wall', ' ': 'void', 'A': 'table', 'C': 'counter', 'E': 'bed', 'K': 'shelf', 'U': 'barrel', 'X': 'crate',
    'I': 'pillar', 'Q': 'altar', 'V': 'rug', 'Y': 'hearth', 'J': 'pots', 'Z': 'anvil', 'M': 'statue',
    '+': 'brazier', '%': 'bones', '*': 'rubble', '@': 'mound',
    '_': 'sand', '"': 'marsh', '`': 'mud', ';': 'reeds', '-': 'boardwalk', '<': 'shallows', '!': 'boat', '$': 'net',
    '&': 'snow', '(': 'drift', ')': 'ice', '{': 'frostpine', '}': 'snowrock', '[': 'icewall', ']': 'standing', '|': 'snowroof', '?': 'tent'
  };

  /* ---------- statuses ----------
     turns count down at the start of the bearer's own turn. mods add to atk/ac/dmg/save/dr;
     vmods are multiplied by the status value. exposed: opens the target to Sneak Attack. */
  D.statuses = {
    rage: { name: 'Rage', good: 1, mods: { dmg: 2, dr: 2 }, desc: '+2 damage, and every hit taken is reduced by 2.' },
    guard: { name: 'Guard', good: 1, mods: { ac: 4 } },
    blessed: { name: 'Blessed', good: 1, mods: { atk: 2, save: 2 }, desc: '+2 to attack rolls and saves.' },
    inspired: { name: 'Inspired', good: 1, desc: 'The next attack gets +1d6 to hit and damage.' },
    taunt: { name: 'Taunt', good: 1, mods: { ac: 2 }, desc: 'Enemies must attack this target. +2 AC.' },
    regen: { name: 'Regen', good: 1, desc: 'Recovers HP at the start of each turn.' },
    hidden: { name: 'Hidden', good: 1, desc: 'Cannot be targeted. The next attack is a critical hit.' },
    reckless: { name: 'Reckless', mods: { ac: -4 } },
    rattled: { name: 'Rattled', vmods: { atk: -1 }, exposed: 1, desc: 'Penalty to attack rolls.' },
    weak: { name: 'Weakened', mods: { atk: -2, ac: -2 }, exposed: 1, desc: '-2 to attack rolls and AC.' },
    asleep: { name: 'Asleep', exposed: 1, desc: 'Cannot act. Damage wakes them.' },
    stunned: { name: 'Stunned', exposed: 1, desc: 'Cannot act.' },
    poison: { name: 'Poisoned', desc: 'Takes damage at the start of each turn.' },
    warded: { name: 'Warded', good: 1, mods: { dr: 3 }, desc: 'Every hit taken is reduced by 3.' },
    lampward: { name: 'Lamp-ward', good: 1, desc: 'Cannot be given any new harmful status.' },
    marked: { name: 'Marked', exposed: 1, mods: { ac: -3 }, desc: '-3 AC, and always open to Sneak Attack.' },
    charmed: { name: 'Turned', desc: 'Attacks its own side.' },
    unbroken: { name: 'Unbroken', good: 1, desc: 'The next blow that would drop her leaves her standing at 1 HP.' }
  };

  /* ---------- party ----------
     hp/sp: [at level 1, per power step]. Stats grow on a 1-20 power scale spread across the 30 levels
     (power = 1 + (level - 1) * 19/29): Attack and Power rise by 1 every 2 steps, save and damage every 3. */
  D.partyOrder = ['runa', 'dask', 'maren', 'finch'];
  // Thirty levels, about six per chapter: the main story is worth three of them and side missions the other three
  // (chapter 1 starts at level 1, so it has three and two). Doing everything takes the party to about 6, 12, 18, 24
  // and 30 at the chapters' ends. There are no chapter caps: fights above the party's level pay less instead
  // (G.xpFor, D.fightLevels), so grinding gets a party a level or two ahead and no further.
  D.powerScale = 19 / 29;
  // [L] = total XP to reach level L+1. Each level costs more than the one before, and each chapter's foes give more XP.
  // Chapter 1 spans 0-1,180, chapter 2 to 5,050, chapter 3 to 12,790, chapter 4 to 24,250, chapter 5 to 42,460.
  D.xpTable = [0, 40, 130, 280, 700, 1180, 1770, 2370, 2980, 3660, 4350, 5050, 6290, 7550, 8830, 10130, 11450, 12790,
    14650, 16530, 18430, 20350, 22290, 24250, 27210, 30200, 33220, 36270, 39350, 42460, 99999999];
  D.classes = {
    runa: {
      name: 'Runa', cls: 'Barbarian', sprite: 'runa', res: 'Fury', skill: 'Athletics',
      hp: [16, 8], sp: [4, 1], ac: 11, atk: 4, dmgBonus: 3, pow: 1, save: 2, spd: 1,
      gear: { weapon: 'woodaxe', armor: 'hide', charm: null },
      // on the board: strongest up close (+2 damage in melee), and can throw a hand-axe
      melee: { atk: 0, dmg: 2 }, shot: { name: 'Throw axe', range: 4, atk: -1, dmg: -2, style: 'hatchet' },
      learn: { 1: ['rage'], 2: ['cleave'], 4: ['warcry'], 6: ['charge'], 7: ['reckless'], 9: ['secondwind'], 11: ['bearhide'], 12: ['whirlwind'], 14: ['wolfhowl'], 15: ['unbroken'], 17: ['sunder'], 18: ['avalanche'], 20: ['twinaxes'], 21: ['earthshaker'], 23: ['warsong'], 24: ['oathkeeper'], 26: ['mountainfalls'], 28: ['bloodfury'], 30: ['laststand'] }
    },
    dask: {
      name: 'Dask', cls: 'Rogue', sprite: 'dask', res: 'Cunning', skill: 'Thievery', sneak: true,
      hp: [11, 5], sp: [5, 1], ac: 13, atk: 5, dmgBonus: 3, pow: 2, save: 3, spd: 5,
      gear: { weapon: 'dagger', armor: 'leather', charm: null },
      // on the board: +2 to hit and Sneak Attack against anyone an ally is already fighting, near or far
      engage: true, shot: { name: 'Throw knives', range: 4, atk: 0, dmg: -1, style: 'knife' },
      learn: { 1: ['dirtytrick'], 2: ['pilfer'], 4: ['twinfangs'], 5: ['venom'], 7: ['vanish'], 9: ['hamstring'], 11: ['feint'], 12: ['shadowstep'], 14: ['knifefan'], 15: ['assassinate'], 17: ['bleed'], 18: ['thousandcuts'], 20: ['bladeflurry'], 21: ['smokebomb'], 23: ['poisoner'], 24: ['markdeath'], 26: ['gambit'], 28: ['cutpurse'], 30: ['debtpaid'] }
    },
    maren: {
      name: 'Maren', cls: 'Cleric', sprite: 'maren', res: 'Faith', skill: 'Lore',
      hp: [12, 6], sp: [8, 2], ac: 11, atk: 3, dmgBonus: 1, pow: 3, save: 4, spd: 0,
      gear: { weapon: 'mace', armor: 'pilgrim', charm: null },
      // on the board: a sling for when nobody can reach her and she has no one to mend (range 5, -1 damage)
      shot: { name: 'Sling', range: 5, atk: 0, dmg: -1, style: 'stone' },
      learn: { 1: ['mend', 'lampfire'], 2: ['blessing'], 4: ['rebuke'], 5: ['revive'], 7: ['circle'], 9: ['smite'], 11: ['shieldfaith'], 12: ['sanctuary'], 14: ['cleansing'], 15: ['dawnfire'], 17: ['greatermend'], 18: ['firstlamp'], 20: ['searing'], 21: ['wardoflamps'], 23: ['vigil'], 24: ['keeperslight'], 26: ['brotherslamp'], 28: ['lanternrite'], 30: ['lightforthose'] }
    },
    finch: {
      name: 'Finch', cls: 'Bard', sprite: 'finch', res: 'Verve', skill: 'Persuasion',
      hp: [10, 5], sp: [8, 2], ac: 11, atk: 3, dmgBonus: 1, pow: 3, save: 3, spd: 3,
      gear: { weapon: 'rapier', armor: 'coat', charm: null },
      // on the board: a shortbow is his main weapon; the rapier is a weaker fallback up close
      melee: { atk: -1, dmg: -2 }, shot: { name: 'Shortbow', range: 6, atk: 1, dmg: 1, style: 'arrow', prefer: true },
      learn: { 1: ['barbed', 'rousing'], 2: ['lullaby'], 4: ['hearthsong'], 5: ['dirge'], 7: ['crescendo'], 9: ['anthem'], 11: ['mocking'], 12: ['dissonance'], 14: ['reel'], 15: ['ballad'], 17: ['shanty'], 18: ['finale'], 20: ['discord'], 21: ['encore'], 23: ['sleepsong'], 24: ['counterpoint'], 26: ['lament'], 28: ['grandmother'], 30: ['fifthverse'] }
    }
  };
  // Feats (earned in the puzzle dungeons, kept for good) and the special powers of a few unique items.
  D.perks = {
    thick: { name: 'Thick-Skinned', desc: 'The first hit Runa takes in each fight does half damage.' },
    frostbound: { name: 'Frostbound', desc: 'Every weapon hit on the wearer does 1 less damage.' },
    firstsneak: { name: 'Gravesilk', desc: "Dask's first attack in each fight is always a Sneak Attack, with one extra die." },
    opportunist: { name: 'Opportunist', desc: 'Sneak Attack also works on any enemy below half health.' },
    grace: { name: "Keeper's Grace", desc: "Maren's healing restores extra health equal to her Power." },
    lantern: { name: "Brother's Lantern", desc: 'The whole party starts every fight Blessed.' },
    sirenshot: { name: 'Siren-string', desc: "+1 bow range, and Finch's first bow hit in each fight Inspires the nearest ally." },
    secondverse: { name: 'Second Verse', desc: "Finch's first song in each fight costs no Verve." }
  };
  D.speakers = { Runa: '#f08a5a', Dask: '#7ad08a', Maren: '#f2e3a0', Finch: '#f0a0b4' };
  D.sprites = {
    runa: { skin: '#eebf9c', hair: '#d2582a', long: 1, top: '#7a4e30', legs: '#8a7058', trim: '#c8a050' },
    dask: { skin: '#d6a07c', hair: '#2a1e18', top: '#5a4434', legs: '#4e4844', hood: '#3a7050' },
    maren: { skin: '#e6b498', hair: '#f0eee8', long: 1, top: '#ece2c8', robe: 1, trim: '#a83444' },
    finch: { skin: '#e8b896', hair: '#f0c868', top: '#9a3046', legs: '#4c4a66', hat: '#5c3456', feather: '#f4ead4' }
  };

  /* ---------- abilities ----------
     target: enemy | allEnemies | ally | allAllies | self | downAlly.  fx: see B.fx in battle.js.
     field: usable from the menu outside battle (healing only). */
  D.abilities = {
    // Runa
    rage: { name: 'Rage', cost: 2, target: 'self', desc: 'For 3 rounds: +2 damage, and every hit you take is reduced by 2.', fx: [{ t: 'status', id: 'rage', turns: 4 }] },
    cleave: { name: 'Cleave', cost: 3, target: 'allEnemies', desc: 'Swing at every enemy, at -2 to hit.', fx: [{ t: 'attack', atkMod: -2 }] },
    warcry: { name: 'War Cry', cost: 2, target: 'self', desc: 'For 2 rounds enemies must attack Runa, and she gains +2 AC.', fx: [{ t: 'status', id: 'taunt', turns: 3 }] },
    reckless: { name: 'Reckless Blow', cost: 3, target: 'enemy', desc: '+4 to hit and +2d6 damage, but -4 AC until your next turn.', fx: [{ t: 'attack', atkMod: 4, bonusDice: '2d6' }, { t: 'status', id: 'reckless', turns: 1, on: 'self', quiet: 1 }] },
    // Dask
    dirtytrick: { name: 'Dirty Trick', cost: 2, target: 'enemy', desc: 'Sand in the eyes: -4 to hit for 2 rounds unless they save. Rattled foes are open to Sneak Attack.', fx: [{ t: 'status', id: 'rattled', turns: 3, v: 4, save: true }] },
    pilfer: { name: 'Pilfer', cost: 1, target: 'enemy', desc: 'Attack, and lift some coin if it lands.', fx: [{ t: 'attack', steal: true }] },
    twinfangs: { name: 'Twin Fangs', cost: 3, target: 'enemy', desc: 'Two quick attacks.', fx: [{ t: 'attack', times: 2 }] },
    venom: { name: 'Venom Edge', cost: 3, target: 'enemy', desc: 'Attack. On a hit the target is poisoned for 3 rounds.', fx: [{ t: 'attack', onHit: { id: 'poison', turns: 3, v: 3 } }] },
    vanish: { name: 'Vanish', cost: 3, target: 'self', desc: 'Cannot be targeted until your next turn. Your next attack is a critical hit.', fx: [{ t: 'status', id: 'hidden', turns: 1 }] },
    // Maren
    mend: { name: 'Mend', cost: 2, target: 'ally', field: true, desc: 'Restore 1d8 + Power HP to one ally.', fx: [{ t: 'heal', dice: '1d8', pow: true }] },
    lampfire: { name: 'Lampfire', cost: 1, target: 'enemy', desc: '1d8 + Power radiant damage. Half again as much against undead.', fx: [{ t: 'damage', dice: '1d8', pow: true, vs: 'undead' }] },
    blessing: { name: 'Lamplight', cost: 3, target: 'allAllies', desc: 'The party gains +2 to attack rolls and saves for 3 rounds.', fx: [{ t: 'status', id: 'blessed', turns: 4, quiet: 1 }] },
    rebuke: { name: 'Rebuke the Dead', cost: 3, target: 'allEnemies', desc: 'Undead take 1d6 + Power damage and must save or be stunned for 2 rounds.', fx: [{ t: 'damage', dice: '1d6', pow: true, tag: 'undead' }, { t: 'status', id: 'stunned', turns: 2, save: true, tag: 'undead' }] },
    revive: { name: 'Rekindle', cost: 5, target: 'downAlly', desc: 'Raise a fallen ally with 30% HP.', fx: [{ t: 'revive', pct: 30 }] },
    circle: { name: 'Circle of Mending', cost: 5, target: 'allAllies', field: true, desc: 'Restore 1d8 + Power HP to the whole party.', fx: [{ t: 'heal', dice: '1d8', pow: true }] },
    // Finch
    barbed: { name: 'Barbed Verse', cost: 1, target: 'enemy', desc: '1d6 + Power damage, and the target has -2 to hit on its next turn.', fx: [{ t: 'damage', dice: '1d6', pow: true }, { t: 'status', id: 'rattled', turns: 2, v: 2, quiet: 1 }] },
    rousing: { name: 'Rousing Tune', cost: 2, target: 'ally', desc: "An ally's next attack gets +1d6 to hit and damage.", fx: [{ t: 'status', id: 'inspired', turns: 9 }] },
    lullaby: { name: 'Lullaby', cost: 3, target: 'allEnemies', desc: 'Each enemy must save or sleep for 2 rounds. Damage wakes them. No effect on undead.', fx: [{ t: 'status', id: 'asleep', turns: 2, save: true, notTag: 'undead' }] },
    hearthsong: { name: 'Hearthsong', cost: 3, target: 'allAllies', desc: 'The party recovers 3 HP at the start of each turn for 3 rounds.', fx: [{ t: 'status', id: 'regen', turns: 3, v: 3, quiet: 1 }] },
    dirge: { name: 'Dirge', cost: 4, target: 'allEnemies', desc: 'Every enemy has -2 to hit and -2 AC for 3 rounds.', fx: [{ t: 'status', id: 'weak', turns: 4, quiet: 1 }] },
    crescendo: { name: 'Crescendo', cost: 5, target: 'allEnemies', desc: '2d6 + Power thunder damage to every enemy. A save halves it.', fx: [{ t: 'damage', dice: '2d6', pow: true, save: 'half' }] },
    // level 6 and 8
    secondwind: { name: 'Second Wind', cost: 3, target: 'self', desc: 'Runa catches her breath: restore 2d8 + Power HP to herself.', fx: [{ t: 'heal', dice: '2d8', pow: true }] },
    whirlwind: { name: 'Whirlwind', cost: 5, target: 'allEnemies', desc: 'A full swing at every enemy, at no penalty.', fx: [{ t: 'attack' }] },
    hamstring: { name: 'Hamstring', cost: 4, target: 'enemy', desc: 'Attack. On a hit the target must save or lose its next turn.', fx: [{ t: 'attack', onHit: { id: 'stunned', turns: 2, save: true } }] },
    shadowstep: { name: 'Shadowstep', cost: 5, target: 'enemy', desc: 'Attack, then vanish: untargetable until your next turn, and that attack is a critical hit.', fx: [{ t: 'attack' }, { t: 'status', id: 'hidden', turns: 1, on: 'self', quiet: 1 }] },
    smite: { name: 'Smite', cost: 4, target: 'enemy', desc: 'An attack with +1d8 damage. Undead also take 1d6 + Power radiant damage, half again as much.', fx: [{ t: 'attack', bonusDice: '1d8' }, { t: 'damage', dice: '1d6', pow: true, vs: 'undead', tag: 'undead' }] },
    sanctuary: { name: 'Sanctuary', cost: 6, target: 'allAllies', desc: 'For 3 rounds, every hit on the party is reduced by 3.', fx: [{ t: 'status', id: 'warded', turns: 4, quiet: 1 }] },
    anthem: { name: 'Anthem', cost: 4, target: 'allAllies', desc: "Everyone's next attack gets +1d6 to hit and damage.", fx: [{ t: 'status', id: 'inspired', turns: 9, quiet: 1 }] },
    dissonance: { name: 'Dissonance', cost: 6, target: 'allEnemies', desc: 'A chord no throat should make. Each enemy must save or lose its next turn.', fx: [{ t: 'status', id: 'stunned', turns: 2, save: true }] },
    unbroken: { name: 'Unbroken', cost: 4, target: 'self', desc: 'For the rest of the fight, the next blow that would drop Runa leaves her at 1 HP instead. Also +2 AC for 2 rounds.', fx: [{ t: 'status', id: 'unbroken', turns: 99, quiet: 1 }, { t: 'status', id: 'guard', turns: 2 }] },
    avalanche: { name: 'Avalanche', cost: 6, target: 'enemy', desc: 'One enormous blow: +2 to hit and +3d8 damage.', fx: [{ t: 'attack', atkMod: 2, bonusDice: '3d8' }] },
    assassinate: { name: 'Assassinate', cost: 5, target: 'enemy', desc: 'A patient killing strike: +2 to hit and +3d6 damage, on top of Sneak Attack.', fx: [{ t: 'attack', atkMod: 2, bonusDice: '3d6' }] },
    thousandcuts: { name: 'Thousand Cuts', cost: 6, target: 'enemy', desc: 'Four quick attacks at -2 to hit.', fx: [{ t: 'attack', times: 4, atkMod: -2 }] },
    dawnfire: { name: 'Dawnfire', cost: 7, target: 'allEnemies', desc: '3d6 + Power radiant damage to every enemy, half again against undead. A save halves it.', fx: [{ t: 'damage', dice: '3d6', pow: true, save: 'half', vs: 'undead', sfx: 'fire' }] },
    firstlamp: { name: 'First Lamp', cost: 10, target: 'party', desc: 'Heal the whole party 2d8 + Power and raise every fallen ally at half HP.', fx: [{ t: 'heal', dice: '2d8', pow: true }, { t: 'revive', pct: 50 }] },
    ballad: { name: 'Ballad of the Five', cost: 7, target: 'allAllies', desc: 'The whole party is Blessed for 3 rounds, and every next attack gets +1d6.', fx: [{ t: 'status', id: 'blessed', turns: 4, quiet: 1 }, { t: 'status', id: 'inspired', turns: 9, quiet: 1 }] },
    finale: { name: 'Finale', cost: 8, target: 'allEnemies', desc: '3d8 + Power thunder damage to every enemy (a save halves it), and each must save or lose its next turn.', fx: [{ t: 'damage', dice: '3d8', pow: true, save: 'half' }, { t: 'status', id: 'stunned', turns: 2, save: true, quiet: 1 }] },
    earthshaker: { name: 'Earthshaker', cost: 7, target: 'allEnemies', desc: 'A blow that shakes the floor: attack every enemy, and each one hit must save or lose its next turn.', fx: [{ t: 'attack', onHit: { id: 'stunned', turns: 2, save: true } }] },
    oathkeeper: { name: 'Oathkeeper', cost: 6, target: 'self', desc: 'Runa plants her feet: enemies must attack her for 3 rounds, and she regains 10 HP each turn.', fx: [{ t: 'status', id: 'taunt', turns: 4, quiet: 1 }, { t: 'status', id: 'regen', turns: 4, v: 10 }] },
    smokebomb: { name: 'Smoke Bomb', cost: 5, target: 'allEnemies', desc: 'Every enemy must save or be blinded: -4 to hit for 2 rounds, and open to Sneak Attack.', fx: [{ t: 'status', id: 'rattled', turns: 3, v: 4, save: true }] },
    markdeath: { name: 'Marked for Death', cost: 4, target: 'enemy', desc: 'Mark one enemy for 3 rounds: -3 AC, and always open to Sneak Attack. No save.', fx: [{ t: 'status', id: 'marked', turns: 4 }] },
    wardoflamps: { name: 'Ward of Lamps', cost: 8, target: 'allAllies', desc: 'For 3 rounds, no harmful status can touch the party. Also cures poison.', fx: [{ t: 'cure', id: 'poison' }, { t: 'status', id: 'lampward', turns: 4 }] },
    keeperslight: { name: "Keeper's Light", cost: 9, target: 'allAllies', desc: 'The party is Blessed and regains 8 HP each turn, for 3 rounds.', fx: [{ t: 'status', id: 'blessed', turns: 4, quiet: 1 }, { t: 'status', id: 'regen', turns: 4, v: 8 }] },
    encore: { name: 'Encore', cost: 6, target: 'ally', desc: 'Another ally takes an extra turn, right now.', fx: [{ t: 'extra' }] },
    counterpoint: { name: 'Counterpoint', cost: 7, target: 'enemy', desc: 'A melody that turns one enemy against its friends for 2 rounds. A save resists.', fx: [{ t: 'status', id: 'charmed', turns: 3, save: true }] },
    bloodfury: { name: 'Blood Fury', cost: 7, target: 'self', desc: 'Rage, and Runa regains 12 HP at the start of each turn for 3 rounds.', fx: [{ t: 'status', id: 'rage', turns: 4, quiet: 1 }, { t: 'status', id: 'regen', turns: 4, v: 12 }] },
    laststand: { name: 'Last Stand of Karrow', cost: 10, target: 'allEnemies', desc: 'Every enemy takes a full swing at +2 to hit and +3d8 damage.', fx: [{ t: 'attack', atkMod: 2, bonusDice: '3d8' }] },
    cutpurse: { name: 'Cut Purse', cost: 5, target: 'enemy', desc: 'Strip every helpful status off an enemy, then attack and steal gold.', fx: [{ t: 'dispel' }, { t: 'attack', steal: true }] },
    debtpaid: { name: 'Debt Paid', cost: 9, target: 'enemy', desc: 'Everything owed, collected at once: +4 to hit and +6d6 damage.', fx: [{ t: 'attack', atkMod: 4, bonusDice: '6d6' }] },
    lanternrite: { name: 'Lantern Rite', cost: 8, target: 'allEnemies', desc: 'Undead take 6d8 + Power radiant damage (a save halves it). The living are untouched.', fx: [{ t: 'damage', dice: '6d8', pow: true, save: 'half', tag: 'undead', sfx: 'fire' }] },
    lightforthose: { name: 'Light for Those Who Go', cost: 14, target: 'party', desc: 'Raise every fallen ally at full HP, heal the party 4d8 + Power, and ward them for 3 rounds.', fx: [{ t: 'revive', pct: 100 }, { t: 'heal', dice: '4d8', pow: true }, { t: 'status', id: 'warded', turns: 4, quiet: 1 }] },
    grandmother: { name: "Grandmother's Verse", cost: 9, target: 'allAllies', desc: 'The whole party is Blessed, Inspired and Warded for 3 rounds.', fx: [{ t: 'status', id: 'blessed', turns: 4, quiet: 1 }, { t: 'status', id: 'inspired', turns: 9, quiet: 1 }, { t: 'status', id: 'warded', turns: 4 }] },
    fifthverse: { name: 'The Fifth Verse', cost: 12, target: 'allEnemies', desc: '4d8 + Power to every enemy (a save halves it), each must save or lose a turn, and the party recovers 2d8 HP.', fx: [{ t: 'damage', dice: '4d8', pow: true, save: 'half' }, { t: 'status', id: 'stunned', turns: 2, save: true, quiet: 1 }, { t: 'heal', dice: '2d8', on: 'allies' }] },
    // new with the 30-level curve (levels 6 to 26)
    charge: { name: 'Headlong Charge', cost: 3, target: 'enemy', desc: 'Attack with +1d6 damage. On a hit the target must save or be Weakened for 2 rounds.', fx: [{ t: 'attack', bonusDice: '1d6', onHit: { id: 'weak', turns: 3, save: true } }] },
    bearhide: { name: 'Bear Hide', cost: 4, target: 'self', desc: 'For 3 rounds every hit on Runa is reduced by 3, and she has +4 AC until her next turn.', fx: [{ t: 'status', id: 'warded', turns: 4, quiet: 1 }, { t: 'status', id: 'guard', turns: 1 }] },
    wolfhowl: { name: 'Wolf-Howl', cost: 5, target: 'allEnemies', desc: 'Every enemy must save or be Rattled (-3 to hit) for 2 rounds, and Runa flies into a Rage.', fx: [{ t: 'status', id: 'rattled', turns: 3, v: 3, save: true }, { t: 'status', id: 'rage', turns: 4, on: 'self', quiet: 1 }] },
    sunder: { name: 'Sunder', cost: 5, target: 'enemy', desc: 'Attack with +2d8 damage. On a hit the target is Weakened for 2 rounds. No save.', fx: [{ t: 'attack', bonusDice: '2d8', onHit: { id: 'weak', turns: 3 } }] },
    twinaxes: { name: 'Twin Axes', cost: 6, target: 'enemy', desc: 'Two full swings, each with +1d8 damage.', fx: [{ t: 'attack', times: 2, bonusDice: '1d8' }] },
    warsong: { name: 'Karrow War-Song', cost: 7, target: 'allAllies', desc: 'The whole party Rages for 3 rounds: +2 damage, and every hit taken is reduced by 2.', fx: [{ t: 'status', id: 'rage', turns: 4 }] },
    mountainfalls: { name: 'The Mountain Falls', cost: 9, target: 'allEnemies', desc: 'Attack every enemy with +2d8 damage; each one hit must save or be Weakened.', fx: [{ t: 'attack', bonusDice: '2d8', onHit: { id: 'weak', turns: 3, save: true } }] },
    feint: { name: 'Feint', cost: 3, target: 'enemy', desc: 'Attack at +4 to hit. The target is Rattled (-2 to hit) for a round and open to Sneak Attack.', fx: [{ t: 'status', id: 'rattled', turns: 2, v: 2, quiet: 1 }, { t: 'attack', atkMod: 4 }] },
    knifefan: { name: 'Fan of Knives', cost: 5, target: 'allEnemies', desc: 'A thrown knife at every enemy, at -1 to hit.', fx: [{ t: 'attack', atkMod: -1 }] },
    bleed: { name: 'Bleed Them', cost: 6, target: 'enemy', desc: 'Two attacks. Each hit poisons the target for 3 rounds.', fx: [{ t: 'attack', times: 2, onHit: { id: 'poison', turns: 3, v: 6 } }] },
    bladeflurry: { name: 'Blade Flurry', cost: 7, target: 'allEnemies', desc: 'Two attacks on every enemy, at -3 to hit.', fx: [{ t: 'attack', times: 2, atkMod: -3 }] },
    poisoner: { name: "Poisoner's Kit", cost: 6, target: 'allEnemies', desc: 'Every enemy is poisoned for 3 rounds unless it saves. Heavy doses.', fx: [{ t: 'status', id: 'poison', turns: 3, v: 10, save: true }] },
    gambit: { name: "Thief's Gambit", cost: 8, target: 'enemy', desc: 'Three attacks at +2 to hit. Every hit lifts some gold.', fx: [{ t: 'attack', times: 3, atkMod: 2, steal: true }] },
    shieldfaith: { name: 'Shield of Faith', cost: 4, target: 'ally', desc: 'One ally is Blessed and Warded for 3 rounds.', fx: [{ t: 'status', id: 'blessed', turns: 4, quiet: 1 }, { t: 'status', id: 'warded', turns: 4 }] },
    cleansing: { name: 'Cleansing Light', cost: 5, target: 'allAllies', field: true, desc: 'Cure poison, sleep, weakness and fear on the whole party, and heal 1d8 + Power.', fx: [{ t: 'cure', id: 'poison' }, { t: 'cure', id: 'asleep' }, { t: 'cure', id: 'weak' }, { t: 'cure', id: 'rattled' }, { t: 'heal', dice: '1d8', pow: true }] },
    greatermend: { name: 'Greater Mend', cost: 5, target: 'ally', field: true, desc: 'Restore 4d8 + Power HP to one ally.', fx: [{ t: 'heal', dice: '4d8', pow: true }] },
    searing: { name: 'Searing Lamp', cost: 6, target: 'enemy', desc: '4d8 + Power radiant damage, half again against undead, and the target must save or be Weakened.', fx: [{ t: 'damage', dice: '4d8', pow: true, vs: 'undead', sfx: 'fire' }, { t: 'status', id: 'weak', turns: 3, save: true, quiet: 1 }] },
    vigil: { name: 'Vigil', cost: 8, target: 'allAllies', field: true, desc: 'Heal the whole party 3d8 + Power, and they regain 6 HP each turn for 3 rounds.', fx: [{ t: 'heal', dice: '3d8', pow: true }, { t: 'status', id: 'regen', turns: 4, v: 6, quiet: 1 }] },
    brotherslamp: { name: "Odric's Lamp", cost: 10, target: 'allEnemies', desc: '5d8 + Power radiant damage to every enemy (a save halves it, half again against undead), and the party is Blessed.', fx: [{ t: 'damage', dice: '5d8', pow: true, save: 'half', vs: 'undead', sfx: 'fire' }, { t: 'status', id: 'blessed', turns: 4, on: 'allies', quiet: 1 }] },
    mocking: { name: 'Mocking Tune', cost: 3, target: 'enemy', desc: '2d6 + Power damage, and the target is Rattled (-3 to hit) for 2 rounds unless it saves.', fx: [{ t: 'damage', dice: '2d6', pow: true }, { t: 'status', id: 'rattled', turns: 3, v: 3, save: true, quiet: 1 }] },
    reel: { name: 'Quickstep Reel', cost: 5, target: 'allAllies', desc: "Everyone's next attack gets +1d6, and the party has +4 AC until Finch's next turn.", fx: [{ t: 'status', id: 'inspired', turns: 9, quiet: 1 }, { t: 'status', id: 'guard', turns: 1 }] },
    shanty: { name: 'Saltmere Shanty', cost: 6, target: 'allAllies', desc: 'The party shakes off poison and regains 6 HP each turn for 3 rounds.', fx: [{ t: 'cure', id: 'poison' }, { t: 'status', id: 'regen', turns: 4, v: 6 }] },
    discord: { name: 'Discord', cost: 7, target: 'allEnemies', desc: '3d6 + Power damage to every enemy (a save halves it), and each must save or be Weakened.', fx: [{ t: 'damage', dice: '3d6', pow: true, save: 'half' }, { t: 'status', id: 'weak', turns: 3, save: true, quiet: 1 }] },
    sleepsong: { name: 'Sleepsong', cost: 7, target: 'allEnemies', desc: 'A lullaby old enough to work on the dead: every enemy must save or sleep for 2 rounds.', fx: [{ t: 'status', id: 'asleep', turns: 2, save: true }] },
    lament: { name: 'Lament for the Lost', cost: 9, target: 'allEnemies', desc: '5d6 + Power to every enemy (a save halves it), and each must save or be Rattled (-4 to hit).', fx: [{ t: 'damage', dice: '5d6', pow: true, save: 'half' }, { t: 'status', id: 'rattled', turns: 3, v: 4, save: true, quiet: 1 }] },
    // enemies
    hex: { name: 'Hex', target: 'enemy', fx: [{ t: 'status', id: 'rattled', turns: 3, v: 2, save: true }] },
    spark: { name: 'Grave Spark', target: 'enemy', fx: [{ t: 'damage', dice: '1d6', pow: true, save: 'half' }] },
    venombite: { name: 'Venom Bite', target: 'enemy', fx: [{ t: 'attack', onHit: { id: 'poison', turns: 3, v: 2, save: true } }] },
    savage: { name: 'Savage Bite', target: 'enemy', fx: [{ t: 'attack', bonusDice: '1d6' }] },
    webspray: { name: 'Web Spray', target: 'allEnemies', fx: [{ t: 'status', id: 'rattled', turns: 2, v: 2, save: true }] },
    headbutt: { name: 'Headbutt', target: 'enemy', fx: [{ t: 'attack', bonusDice: '1d4', onHit: { id: 'rattled', turns: 2, v: 2, save: true } }] },
    hammerblow: { name: 'Hammer Blow', target: 'enemy', fx: [{ t: 'attack', bonusDice: '1d6' }] },
    gravechill: { name: 'Grave Chill', target: 'allEnemies', fx: [{ t: 'damage', dice: '1d4', pow: true, save: 'half' }] },
    sweep: { name: 'Spade Sweep', target: 'allEnemies', fx: [{ t: 'attack', atkMod: -2 }] },
    bellow: { name: 'Bellow', target: 'allAllies', fx: [{ t: 'status', id: 'blessed', turns: 3, quiet: 1 }] }
  };

  /* ---------- music ----------
     Notes are "pitch:length" in eighth notes; "-" is a rest. Every voice loops over the longest. */
  const rep = (s, n) => Array(n).fill(s).join(' ');
  D.music = {
    harbor: { bpm: 96, voices: [
      { type: 'triangle', vol: 0.2, notes: 'D4:3 F4:1 A4:4 | G4:2 F4:2 E4:4 | D4:3 F4:1 A4:2 C5:2 | Bb4:4 A4:4 | G4:3 Bb4:1 D5:4 | C5:2 A4:2 F4:4 | E4:2 G4:2 F4:2 E4:2 | D4:8' },
      { type: 'sine', vol: 0.22, notes: 'D3:8 | C3:8 | D3:8 | G2:8 | G2:8 | F2:8 | A2:8 | D3:8' }
    ] },
    fen: { bpm: 84, voices: [
      { type: 'square', vol: 0.05, notes: 'A3:2 C4:2 E4:4 | D4:2 C4:2 B3:4 | A3:2 C4:2 F4:4 | E4:6 -:2 | A3:2 C4:2 E4:4 | G4:2 F4:2 E4:4 | D4:2 B3:2 C4:2 A3:2 | A3:6 -:2' },
      { type: 'triangle', vol: 0.2, notes: 'A2:8 | G2:8 | F2:8 | E2:8 | A2:8 | C3:8 | E2:8 | A2:8' },
      { hat: 8, vol: 0.03 }
    ] },
    hold: { bpm: 88, voices: [
      { type: 'triangle', vol: 0.2, notes: 'E4:2 G4:2 A4:4 | B4:2 A4:2 G4:2 E4:2 | D4:2 E4:2 G4:4 | A4:6 -:2 | E4:2 G4:2 A4:4 | B4:2 D5:2 B4:4 | A4:2 G4:2 E4:2 D4:2 | E4:8' },
      { type: 'sine', vol: 0.24, notes: 'E2:8 | E2:8 | D2:8 | A2:8 | E2:8 | G2:8 | D2:8 | E2:8' },
      { hat: 4, vol: 0.025 }
    ] },
    frost: { bpm: 72, voices: [
      { type: 'sine', vol: 0.16, notes: 'B4:4 -:2 F#4:2 | G4:4 E4:4 | D4:4 -:2 E4:2 | F#4:8 | B4:4 -:2 A4:2 | G4:4 F#4:4 | E4:4 D4:2 C#4:2 | B3:8' },
      { type: 'triangle', vol: 0.18, notes: 'B2:8 | E2:8 | G2:8 | F#2:8 | B2:8 | E2:8 | A2:8 | B2:8' }
    ] },
    city: { bpm: 100, voices: [
      { type: 'square', vol: 0.05, notes: 'C5:2 G4:2 E4:2 G4:2 | A4:2 F4:2 C5:4 | B4:2 G4:2 D5:2 B4:2 | C5:6 -:2 | E5:2 D5:2 C5:2 B4:2 | A4:2 C5:2 F4:4 | G4:2 A4:2 B4:2 D5:2 | C5:8' },
      { type: 'triangle', vol: 0.2, notes: 'C3:4 G2:4 | F2:4 A2:4 | G2:4 D3:4 | C3:4 G2:4 | A2:4 E2:4 | F2:4 C3:4 | G2:4 G2:4 | C3:8' },
      { hat: 4, vol: 0.02 }
    ] },
    undercroft: { bpm: 66, voices: [
      { type: 'triangle', vol: 0.18, notes: 'D3:4 -:2 F3:2 | E3:4 C#3:4 | D3:4 -:2 A3:2 | G#3:8 | D3:4 -:2 F3:2 | E3:4 G3:4 | F3:2 E3:2 D3:2 C#3:2 | D3:8' },
      { type: 'sine', vol: 0.2, notes: 'D2:8 | A1:8 | D2:8 | E2:8 | D2:8 | C2:8 | Bb1:8 | A1:8' }
    ] },
    ashen: { bpm: 60, voices: [
      { type: 'triangle', vol: 0.18, notes: 'A3:4 -:2 C4:2 | B3:4 G#3:4 | A3:4 -:2 E4:2 | D4:8 | C4:4 -:2 B3:2 | A3:4 F3:4 | E3:4 G#3:4 | A3:8' },
      { type: 'sine', vol: 0.22, notes: 'A1:8 | E2:8 | A1:8 | D2:8 | A1:8 | F1:8 | E2:8 | A1:8' }
    ] },
    finale: { bpm: 132, voices: [
      { type: 'square', vol: 0.06, notes: 'D5:2 A4:2 D5:2 F5:2 | E5:2 C5:2 A4:4 | Bb4:2 D5:2 F5:2 A5:2 | G5:4 E5:4 | F5:2 D5:2 A4:2 D5:2 | C5:2 E5:2 G5:4 | A5:2 G5:2 F5:2 E5:2 | D5:8' },
      { type: 'triangle', vol: 0.22, notes: 'D3:2 D3:2 D3:2 D3:2 | C3:2 C3:2 C3:2 C3:2 | Bb2:2 Bb2:2 Bb2:2 Bb2:2 | C3:2 C3:2 C3:2 C3:2 | D3:2 D3:2 D3:2 D3:2 | C3:2 C3:2 C3:2 C3:2 | A2:2 A2:2 A2:2 A2:2 | D3:8' },
      { hat: 2, vol: 0.035 }
    ] },
    omen: { bpm: 56, voices: [
      { type: 'sine', vol: 0.26, notes: 'D2:8 C#2:8 | D2:8 Bb1:8' },
      { type: 'triangle', vol: 0.11, notes: '-:4 A3:4 -:4 G#3:4 | -:4 A3:4 -:2 F3:6' }
    ] },
    title: { bpm: 84, voices: [
      { type: 'triangle', vol: 0.2, notes: 'A3:4 E4:4 A4:6 G4:2 | F4:4 C4:4 E4:8 | D4:4 A4:4 G4:6 E4:2 | E4:4 B3:4 A3:8' },
      { type: 'sine', vol: 0.22, notes: 'A2:16 | F2:16 | D2:16 | E2:8 A2:8' }
    ] },
    town: { bpm: 104, voices: [
      { type: 'square', vol: 0.07, notes: 'E4:2 G4:2 C5:4 | B4:2 G4:2 A4:4 | F4:2 A4:2 G4:2 E4:2 | D4:4 G4:4 | E4:2 G4:2 C5:4 | D5:2 C5:2 A4:4 | G4:2 E4:2 F4:2 D4:2 | C4:6 -:2' },
      { type: 'triangle', vol: 0.2, notes: 'C3:4 E3:4 | G2:4 A2:4 | F2:4 C3:4 | G2:4 B2:4 | C3:4 E3:4 | F2:4 A2:4 | G2:4 B2:4 | C3:8' }
    ] },
    field: { bpm: 118, voices: [
      { type: 'square', vol: 0.07, notes: 'D4:2 F4:2 A4:2 D5:2 | C5:3 A4:1 G4:4 | F4:2 G4:2 A4:2 F4:2 | E4:4 A3:4 | D4:2 F4:2 A4:2 D5:2 | E5:3 D5:1 C5:4 | A4:2 C5:2 G4:2 E4:2 | D4:6 -:2' },
      { type: 'triangle', vol: 0.2, notes: 'D3:4 A2:4 | F2:4 C3:4 | Bb2:4 F2:4 | A2:8 | D3:4 A2:4 | C3:4 G2:4 | F2:4 C3:4 | D3:8' },
      { hat: 4, vol: 0.05 }
    ] },
    dungeon: { bpm: 76, voices: [
      { type: 'triangle', vol: 0.18, notes: 'E4:4 -:2 G4:2 | F#4:6 -:2 | E4:4 -:2 B3:2 | C4:6 -:2 | E4:4 -:2 G4:2 | A4:4 B4:4 | G4:4 F#4:2 D4:2 | E4:6 -:2' },
      { type: 'sine', vol: 0.24, notes: 'E2:8 | D2:8 | C2:8 | B1:8 | E2:8 | A1:8 | B1:8 | E2:8' }
    ] },
    battle: { bpm: 156, voices: [
      { type: 'square', vol: 0.065, notes: rep('A4:1 C5:1 E5:1 C5:1', 2) + ' ' + rep('G4:1 B4:1 D5:1 B4:1', 2) + ' ' + rep('F4:1 A4:1 C5:1 A4:1', 2) + ' E5:2 D5:2 C5:2 B4:2 ' + rep('A4:1 C5:1 E5:1 A5:1', 2) + ' ' + rep('G4:1 B4:1 D5:1 G5:1', 2) + ' F5:2 E5:2 D5:2 C5:2 B4:2 G#4:2 E4:4' },
      { type: 'triangle', vol: 0.22, notes: rep('A2:1 A2:1', 4) + ' ' + rep('G2:1 G2:1', 4) + ' ' + rep('F2:1 F2:1', 4) + ' ' + rep('E2:1 E2:1', 4) + ' ' + rep('A2:1 A2:1', 4) + ' ' + rep('G2:1 G2:1', 4) + ' ' + rep('F2:1 F2:1', 4) + ' ' + rep('E2:1 E2:1', 4) },
      { hat: 2, vol: 0.06 }
    ] },
    boss: { bpm: 164, voices: [
      { type: 'sawtooth', vol: 0.05, notes: rep('E4:1 E4:1 G4:1 E4:1 B4:1 E4:1 G4:1 E4:1', 2) + ' ' + rep('C4:1 C4:1 E4:1 C4:1 G4:1 C4:1 E4:1 C4:1', 2) + ' ' + rep('D4:1 D4:1 F#4:1 D4:1 A4:1 D4:1 F#4:1 D4:1', 2) + ' B4:2 A4:2 G4:2 F#4:2 E4:4 B3:4' },
      { type: 'triangle', vol: 0.24, notes: rep('E2:1 E2:1', 8) + ' ' + rep('C2:1 C2:1', 8) + ' ' + rep('D2:1 D2:1', 8) + ' ' + rep('B1:1 B1:1', 8) },
      { hat: 2, vol: 0.07 }
    ] }
  };
  /* On the board (src/board.js): range in squares, radius of an area, around = an area centred on the user,
     burst = an area aimed at a square, leap = jump beside a target up to that far, dash = extra squares to move
     for this action, push = knock the target back that many squares. Unlisted abilities use the defaults in B.spec. */
  D.boardRules = {
    cleave: { around: 1 }, whirlwind: { around: 1 }, earthshaker: { around: 1, push: 1 }, laststand: { around: 2 }, mountainfalls: { around: 1, push: 1 },
    bladeflurry: { around: 1 }, knifefan: { radius: 3 }, rebuke: { around: 2 }, wolfhowl: { around: 3 }, sweep: { around: 1 }, tolling: { around: 3 },
    stomp: { around: 2 }, steamburst: { around: 2 },
    lullaby: { radius: 1, range: 5 }, dirge: { radius: 2, range: 5 }, crescendo: { radius: 1, range: 5 }, dissonance: { radius: 1, range: 5 },
    dawnfire: { radius: 2, range: 6 }, finale: { radius: 2, range: 5 }, smokebomb: { radius: 1, range: 4 }, poisoner: { radius: 1, range: 4 },
    discord: { radius: 1, range: 5 }, sleepsong: { radius: 2, range: 5 }, lament: { radius: 2, range: 6 }, lanternrite: { radius: 2, range: 6 },
    brotherslamp: { radius: 2, range: 6 }, fifthverse: { radius: 3, range: 6 },
    webspray: { radius: 1, range: 4 }, gravechill: { radius: 1, range: 5 }, tidecall: { radius: 1, range: 5 }, frostbreath: { radius: 1, range: 3 },
    bonestorm: { radius: 1, range: 5 }, kingsvoice: { radius: 2, range: 6 }, ashstorm: { radius: 2, range: 6 },
    blessing: { radius: 3 }, circle: { radius: 3 }, hearthsong: { radius: 3 }, anthem: { radius: 3 }, sanctuary: { radius: 3 }, ballad: { radius: 4 },
    wardoflamps: { radius: 3 }, keeperslight: { radius: 4 }, grandmother: { radius: 4 }, warsong: { radius: 3 }, cleansing: { radius: 3 }, vigil: { radius: 3 },
    reel: { radius: 3 }, shanty: { radius: 3 }, bellow: { radius: 3 }, chant: { radius: 3 }, shieldwall: { radius: 3 }, firstlamp: { radius: 4 }, lightforthose: { radius: 5 },
    lampfire: { range: 6 }, barbed: { range: 5 }, mocking: { range: 5 }, dirtytrick: { range: 3 }, markdeath: { range: 6 }, counterpoint: { range: 5 }, searing: { range: 6 },
    hex: { range: 5 }, spark: { range: 5 }, mend: { range: 4 }, greatermend: { range: 4 }, shieldfaith: { range: 4 }, rousing: { range: 5 }, encore: { range: 5, notSelf: true }, revive: { range: 2 },
    charge: { dash: 2 }, shadowstep: { leap: 6 }, avalanche: { push: 2 }, headbutt: { push: 1 }, crush: { push: 1 }
  };
  for (const id in D.boardRules) if (D.abilities[id]) Object.assign(D.abilities[id], D.boardRules[id]);
  // knock-back rides on the attack effect
  for (const id in D.boardRules) if (D.boardRules[id].push && D.abilities[id]) D.abilities[id].fx.forEach(e => { if (e.t === 'attack') e.push = D.boardRules[id].push; });
  /* Camping (src/script.js, 'camp'): a campsite restores the party for one Camp Kit, once per inn rest. */
  D.scripts = D.scripts || {};
  D.scripts.campsite = [['camp']];
  D.campTalk = [
    [null, 'Finch', 'Somebody has to say it. This stew is mostly bark.'],
    [null, 'Dask', 'I will take first watch. And second. I do not sleep well near the dead.'],
    [null, 'Runa', 'In Karrow we sing at a campfire. Badly, and on purpose. It keeps the cold back.'],
    [null, 'Maren', 'Sleep. I will keep the lamp lit. That is what it is for.'],
    [null, 'Finch', 'If anyone needs me, I am rhyming "barrow" with something. "Marrow." No. Too grim.'],
    [null, 'Dask', 'Four bedrolls, one fire, no debts. I could get used to this.'],
    ['chapter>=3', 'Runa', 'Hallvard used to say: eat while you can, sleep while you can, and never trust a quiet pass.'],
    ['chapter>=4', 'Maren', 'Three lamps out. Two left burning. We will rest, and then we will walk.'],
    ['chapter>=5', 'Finch', 'Last fire before the end of the song. Make it a good one.']
  ];
  /* Expansion helper: puts a new thing on an existing map, on the open ground nearest (x, y). */
  // ch may be null: a free character is picked. Returns the character used.
  // Towns, for fast travel (Menu > Map > Travel). A town is found the first time you walk into it.
  D.towns = {
    brackenford: { name: 'Brackenford', ch: 1, at: 'n', desc: 'The village by the river, and the Crooked Lantern.' },
    saltmere: { name: 'Saltmere', ch: 2, at: 'n', desc: 'The harbour town on the edge of the fens.' },
    karrow: { name: 'Karrow Hold', ch: 3, at: 'n', desc: "Runa's clan hold, in the snow." },
    highmoor: { name: 'Highmoor', ch: 4, at: 'n', desc: 'The city of the Duke, and of the Chancellery.' },
    ashfall: { name: 'Ashfall', ch: 5, at: 'n', desc: "The Wardens' war camp at the edge of the ash." }
  };
  // Rooms indoors: people in them stay put rather than walking rounds.
  D.indoor = ['tavern', 'shop', 'smithy', 'temple', 's_inn', 's_shop', 's_chapel', 'k_hall', 'k_shop', 'k_cells', 'h_inn', 'h_shop', 'h_cathedral', 'h_counting', 'h_palace', 'printshop'];
  D.placeNear = function (mapId, ch, x, y, def) {
    const m = D.maps[mapId]; if (!m) throw new Error('placeNear: no map ' + mapId);
    const used = new Set(Object.keys(m.things || {}).concat(Object.keys(D.legend), Object.keys(m.legend || {}), ['.', ',']));
    m.rows.forEach(r => { for (const c of r) used.add(c); });
    if (!ch) ch = [...'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZäöüéèñçøåæðþàâêîôûëïÿœ'].find(c => !used.has(c) && !Object.prototype.hasOwnProperty.call(D.legend, c));
    if (!ch || (m.things || {})[ch]) throw new Error('placeNear: ' + mapId + ' cannot use ' + ch);
    const rows = m.rows.map(r => r.split(''));
    for (let r = 0; r < 14; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const yy = y + dy, xx = x + dx;
      const c0 = rows[yy] && rows[yy][xx], tn = c0 && ((m.legend || {})[c0] || D.legend[c0]);
          if (!c0 || !(c0 === '.' || c0 === ',' || (tn && D.tiles[tn] && !D.tiles[tn].solid && !D.tiles[tn].water && tn !== 'void'))) continue;
      rows[yy][xx] = ch; m.rows = rows.map(row => row.join('')); (m.things = m.things || {})[ch] = def; return ch;
    }
    throw new Error('placeNear: no room on ' + mapId);
  };
  // Lay a path across a run of tiles (trees, rock), so something placed in a pocket can be walked to.
  D.carve = function (mapId, x0, y0, x1, y1, ch) {
    const m = D.maps[mapId], rows = m.rows.map(r => r.split(''));
    for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) if (rows[y] && rows[y][x] && !(m.things || {})[rows[y][x]]) rows[y][x] = ch || ':';
    m.rows = rows.map(r => r.join(''));
  };
})();
