/* Spoils: what a won fight can leave behind, on top of each enemy's own loot (bosses' fixed drops, pelts and so on).
   - Supplies: a healing draught of the chapter's strength (30% a fight, 40% when there are four or more foes,
     always after a boss), now and then an Ember Tonic (12%).
   - Found gear: rare (4% a fight, 25% after a boss), never a piece the party already has. A long dry spell is broken:
     by the 20th fight without a find, one turns up. Over a chapter's 40-odd fights that is about two finds. Each chapter has five pieces that can only be found this way:
     one for each hero and a charm, a little better than that chapter's shop gear or with a twist of their own.
   - When a fight pays reduced experience (the party is above its level) or the party is level 30, spoils come half again
     as often.
   Fights that pay nothing (brawls, rehearsals) find nothing. B.spoils in battle.js rolls them. */
(function () {
  const D = G.D;
  Object.assign(D.items, {
    // chapter 1: Brackenford and the barrows
    huscarlaxe: { name: "Old Huscarl's Axe", type: 'weapon', for: ['runa'], dmg: '1d12', mods: { atk: 1, save: 1 }, price: 140, found: 1, desc: 'Bearded, notched, and lucky. Someone carved a little bear on the haft.' },
    poacherjerkin: { name: "Poacher's Jerkin", type: 'armor', for: ['dask'], mods: { ac: 2, spd: 1 }, price: 90, found: 1, desc: 'Soft leather, dark-dyed, with a pocket for everything.' },
    wayfarermail: { name: "Wayfarer's Mail", type: 'armor', for: ['maren'], mods: { ac: 4, save: 1 }, price: 120, found: 1, desc: 'A pilgrim\'s hauberk, mended a hundred times by a hundred hands.' },
    minstrelblade: { name: "Minstrel's Blade", type: 'weapon', for: ['finch'], dmg: '1d8', mods: { atk: 1, pow: 1 }, price: 90, found: 1, desc: 'A slim sword with a little tuning-fork for a pommel.' },
    hedgeknot: { name: 'Hedge-witch Knot', type: 'charm', mods: { hp: 4, save: 1 }, price: 60, found: 1, desc: 'Rowan, red thread and a tooth of something. Keep it dry.' },
    // chapter 2: Saltmere and the fen
    sentryscale: { name: "Drowned Sentry's Scale", type: 'armor', for: ['runa'], mods: { ac: 4, hp: 5 }, price: 260, found: 1, desc: 'Green with sea-rot outside. Inside, the scales are bright as the day they were forged.' },
    hookknife: { name: "Smuggler's Hook-knife", type: 'weapon', for: ['dask'], dmg: '1d8', mods: { atk: 2, dmgBonus: 1 }, price: 240, found: 1, desc: 'For cutting nets, ropes, and the occasional excise man.' },
    clappermace: { name: 'Bell-clapper Mace', type: 'weapon', for: ['maren'], dmg: '1d10', mods: { pow: 1, save: 1 }, price: 240, found: 1, desc: 'The clapper of a drowned chapel bell, on a haft of ship\'s oak. It hums when it strikes.' },
    gullcloak: { name: 'Gull-feather Cloak', type: 'armor', for: ['finch'], mods: { ac: 3, spd: 1 }, price: 220, found: 1, desc: 'Grey and white, light as the bird. Finch claims he plucked them himself.' },
    salteye: { name: 'Salt-eye Pendant', type: 'charm', mods: { save: 1, sp: 3 }, price: 160, found: 1, desc: 'A sea-glass eye on a cord. It is always watching the tide.' },
    // chapter 3: the north
    cairnbreaker: { name: 'Cairn-breaker', type: 'weapon', for: ['runa'], dmg: '2d8', mods: { atk: 1, dmgBonus: 1 }, price: 520, found: 1, desc: 'A Karrow war-axe with a hammer on the back, for doors and other arguments.' },
    whitewolfjerkin: { name: 'Whitewolf Jerkin', type: 'armor', for: ['dask'], mods: { ac: 4, spd: 1, hp: 4 }, price: 480, found: 1, desc: 'Snow-pale fur over oiled leather. You do not hear it move.' },
    rimeward: { name: 'Rimeward Hauberk', type: 'armor', for: ['maren'], mods: { ac: 6, save: 1, hp: 4 }, price: 560, found: 1, desc: 'Rings of rime-iron, blessed at a cairn whose name no one remembers.' },
    howlsaber: { name: 'Howling Saber', type: 'weapon', for: ['finch'], dmg: '1d12', mods: { spd: 1, atk: 1 }, price: 500, found: 1, desc: 'Holes in the blade make it sing when it swings. Finch harmonises.' },
    frostrune: { name: 'Frost-cracked Rune', type: 'charm', mods: { pow: 2, save: 1 }, price: 320, found: 1, desc: 'A rune-stone split by a hard winter. The magic leaked into the crack.' },
    // chapter 4: Highmoor
    gateplate: { name: "Gatewarden's Plate", type: 'armor', for: ['runa'], mods: { ac: 6, hp: 10, save: 1 }, price: 900, found: 1, desc: 'Highmoor steel with the city\'s gate stamped on the breast. The last owner did not need it.' },
    pickstiletto: { name: "Pickpocket's Stiletto", type: 'weapon', for: ['dask'], dmg: '1d12', mods: { atk: 2, spd: 1, dmgBonus: 1 }, price: 880, found: 1, desc: 'Thin enough to slip between ribs, purse-strings and lies.' },
    vigilstaff: { name: 'Vigil-staff', type: 'weapon', for: ['maren'], dmg: '1d12', mods: { pow: 3, sp: 4 }, price: 880, found: 1, desc: 'A watchman\'s lamp-pole, its lantern relit with a Warden\'s prayer.' },
    masquerbrig: { name: "Masquer's Brigandine", type: 'armor', for: ['finch'], mods: { ac: 5, hp: 6, spd: 1 }, price: 820, found: 1, desc: 'Velvet over steel plates, cut for the Duke\'s masked balls. It still smells of oranges.' },
    guttermedal: { name: 'Gutter-saint Medal', type: 'charm', mods: { ac: 1, save: 2 }, price: 520, found: 1, desc: 'Stamped tin, worn by the city\'s poor. The saint on it has no name and keeps no accounts.' },
    // chapter 5: the Ashen Road and the Hollow Barrow
    barrowreaver: { name: 'Barrow-reaver', type: 'weapon', for: ['runa'], dmg: '2d12', mods: { atk: 2, dmgBonus: 1 }, price: 1400, found: 1, desc: 'Black iron, cold to the touch. It was forged to kill a king, and it remembers.' },
    ashleathers: { name: "Ashwalker's Leathers", type: 'armor', for: ['dask'], mods: { ac: 6, spd: 2, hp: 6 }, price: 1300, found: 1, desc: 'Grey with ash that will not brush off. The road\'s own colours.' },
    lastlamp: { name: 'Last Lamp Hauberk', type: 'armor', for: ['maren'], mods: { ac: 8, save: 2, hp: 6 }, price: 1450, found: 1, desc: 'The mail of the last Warden to hold the road. A lamp is worked into every ring.' },
    emberblade: { name: 'Ember-strung Blade', type: 'weapon', for: ['finch'], dmg: '1d12+1', mods: { pow: 3, spd: 1, atk: 1 }, price: 1350, found: 1, desc: 'A sword with a lute-string for a grip-wrap. Sparks fly from it in time with the song.' },
    ashknuckle: { name: "Ash-saint's Knucklebone", type: 'charm', mods: { dmgBonus: 2, save: 2 }, price: 700, found: 1, desc: 'Nobody remembers the saint. The knucklebone remembers everything.' }
  });
  D.spoils = {
    heal: { 1: 'draught', 2: 'greater', 3: 'potent', 4: 'elixir', 5: 'elixir' },
    found: {
      1: ['huscarlaxe', 'poacherjerkin', 'wayfarermail', 'minstrelblade', 'hedgeknot'],
      2: ['sentryscale', 'hookknife', 'clappermace', 'gullcloak', 'salteye'],
      3: ['cairnbreaker', 'whitewolfjerkin', 'rimeward', 'howlsaber', 'frostrune'],
      4: ['gateplate', 'pickstiletto', 'vigilstaff', 'masquerbrig', 'guttermedal'],
      5: ['barrowreaver', 'ashleathers', 'lastlamp', 'emberblade', 'ashknuckle']
    },
    healP: 0.3, healBig: 0.4, tonicP: 0.12, gearP: 0.04, gearBoss: 0.25, dry: 20, capMul: 1.5
  };
})();
