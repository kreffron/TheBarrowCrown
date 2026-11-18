/* Items, gear and shops.
   Consumables carry fx (same effect list as abilities). field: usable from the menu.
   Gear: type weapon | armor | charm, for: who can wear it, dmg (weapons), mods. */
(function () {
  const D = G.D;
  D.items = {
    // consumables
    campkit: { name: 'Camp Kit', price: 40, type: 'supply', max: 2, chapterPrice: true, desc: 'Bedrolls, kindling and a pot of stew. Make camp at a campsite to restore the whole party. You can carry 2; the price rises as the road gets longer.' },
    draught: { name: 'Healing Draught', price: 15, target: 'ally', field: true, desc: 'Restores 2d4+4 HP.', fx: [{ t: 'heal', dice: '2d4+4' }] },
    tonic: { name: 'Ember Tonic', price: 25, target: 'ally', field: true, desc: 'Restores 8 SP.', fx: [{ t: 'sp', n: 8 }] },
    salts: { name: 'Smelling Salts', price: 40, target: 'downAlly', desc: 'Revives a fallen ally at 30% HP. Battle only.', fx: [{ t: 'revive', pct: 30 }] },
    bitterroot: { name: 'Bitterroot', price: 8, target: 'ally', desc: 'Cures poison. Battle only.', fx: [{ t: 'cure', id: 'poison' }] },
    flask: { name: 'Fire Flask', price: 30, target: 'allEnemies', desc: '2d6 fire damage to every enemy. A save halves it.', fx: [{ t: 'damage', dice: '2d6', save: 'half', dc: 13, sfx: 'fire' }] },
    // key items
    pelt: { name: 'Wolf Pelt', type: 'loot', price: 8, desc: 'Proof of a dead wolf. Hobb at the north gate pays a bounty for three.' },
    palecap: { name: 'Palecap', type: 'key', desc: 'A pale mushroom that grows on barrow soil. Odo wants three.' },
    shard: { name: 'Crown Shard', type: 'key', desc: 'A sliver of black iron. It hums against the hand.' },
    silver: { name: 'Grave Silver', type: 'key', desc: "A sack of burial silver from Brackenford's churchyard. It belongs to the dead, or to whoever is holding it." },
    voskletter: { name: "Vosk's Letter", type: 'key', desc: "Orders for the Vosk brothers: keep everyone away from the Thane's Barrow. Signed with a pale, open hand." },
    tinring: { name: 'Tin Ring', type: 'key', desc: 'A cheap ring, worn thin. Someone was buried in it.' },
    // weapons
    woodaxe: { name: "Woodcutter's Axe", type: 'weapon', for: ['runa'], dmg: '1d10', price: 20 },
    timberfall: { name: 'Timberfall', type: 'weapon', for: ['runa'], dmg: '1d12', mods: { atk: 1 }, price: 120, desc: "Garrick's old felling axe." },
    dagger: { name: 'Dagger', type: 'weapon', for: ['dask'], dmg: '1d6', price: 10 },
    barrowfang: { name: 'Barrow Fang', type: 'weapon', for: ['dask'], dmg: '1d6+1', mods: { atk: 1 }, price: 110, desc: 'An old bronze blade, still keen.' },
    mace: { name: 'Mace', type: 'weapon', for: ['maren'], dmg: '1d6', price: 12 },
    wardenmace: { name: "Warden's Mace", type: 'weapon', for: ['maren'], dmg: '1d8', mods: { pow: 1 }, price: 110, desc: 'Its head is a lantern cage.' },
    rapier: { name: 'Rapier', type: 'weapon', for: ['finch'], dmg: '1d6', price: 14 },
    finerapier: { name: 'Balanced Rapier', type: 'weapon', for: ['finch'], dmg: '1d8', price: 55 },
    // armor
    hide: { name: 'Hide Armour', type: 'armor', for: ['runa'], mods: { ac: 2 }, price: 20 },
    studded: { name: 'Studded Hide', type: 'armor', for: ['runa'], mods: { ac: 3 }, price: 60 },
    leather: { name: 'Leather Jerkin', type: 'armor', for: ['dask'], mods: { ac: 1 }, price: 16 },
    reinforced: { name: 'Reinforced Jerkin', type: 'armor', for: ['dask'], mods: { ac: 2 }, price: 50 },
    pilgrim: { name: "Pilgrim's Mail", type: 'armor', for: ['maren'], mods: { ac: 3 }, price: 30 },
    wardenmail: { name: "Warden's Mail", type: 'armor', for: ['maren'], mods: { ac: 4 }, price: 80 },
    coat: { name: 'Travelling Coat', type: 'armor', for: ['finch'], mods: { ac: 1 }, price: 14 },
    doublet: { name: 'Padded Doublet', type: 'armor', for: ['finch'], mods: { ac: 2 }, price: 45 },
    // charms (anyone)
    luckycoin: { name: 'Lucky Coin', type: 'charm', mods: { save: 1 }, price: 40 },
    wolftooth: { name: 'Wolf-tooth Cord', type: 'charm', mods: { dmgBonus: 1 }, price: 50 },
    lampcharm: { name: 'Ward-lamp Charm', type: 'charm', mods: { pow: 1 }, price: 60 },
    signet: { name: "Thane's Signet", type: 'charm', mods: { ac: 1, save: 1 }, price: 150 },
    horseshoe: { name: "Ingrid's Horseshoe", type: 'charm', mods: { ac: 1 }, desc: 'Forged for luck. Ingrid swears it works.' },
    gravebell: { name: 'Grave-bell', type: 'charm', mods: { spd: 2 }, desc: "Old Pell's. Rung so the dead know someone is coming." },
    vigil: { name: 'Vigil Candle', type: 'charm', mods: { save: 2 }, desc: "Lit from Brackenford's ward-lamp. It does not blow out." },
    shadowgloves: { name: 'Gravesilk Gloves', type: 'charm', for: ['dask'], mods: { atk: 1 }, perk: 'firstsneak', desc: 'Black silk, grave-cold. The first strike always finds a gap.' },
    sirenstring: { name: 'Siren-string', type: 'charm', for: ['finch'], mods: { atk: 1 }, perk: 'sirenshot', desc: 'A bowstring of sea-gut that hums the gull-song when drawn.' },
    frostmantle: { name: 'Frostbound Mantle', type: 'armor', for: ['runa'], mods: { ac: 6, hp: 6 }, perk: 'frostbound', desc: 'A Karrow war-cloak sewn with plates of rime-iron.' },
    brotherslantern: { name: "Brother's Lantern", type: 'charm', for: ['maren'], mods: { pow: 2 }, perk: 'lantern', desc: 'The lamp the first Wardens carried under Highmoor. It still remembers how to burn.' },
    shardworn: { name: 'Crown Shard', type: 'charm', mods: { pow: 2, save: -2 }, desc: 'Worn close, it sharpens every spell. It also whispers.' }
  };
  D.shops = {
    odo: { name: "Odo's Sundries", blurb: 'Draughts, tonics and things that burn.', discount: ['silver=1', 80], stock: ['draught', 'tonic', 'bitterroot', 'salts', 'flask', 'campkit'] },
    ingrid: { name: "Ingrid's Forge", blurb: 'Honest iron. No refunds.', discount: ['silver=1', 80], stock: ['studded', 'reinforced', 'wardenmail', 'doublet', 'finerapier'] }
  };
  D.start = { map: 'tavern', at: 'p', gold: 30, bag: { draught: 1, tonic: 1, campkit: 1 } };
})();
