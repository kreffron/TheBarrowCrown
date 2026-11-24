/* The wild, filled in: shrubs, ferns, logs, reeds and stones scattered through the open country, and people out on
   the roads who have work for you. D.decorate only ever puts a blocking piece where all eight neighbours are open, so
   it can never cut a path; it keeps clear of roads and of everything you can talk to or use. */
(function () {
  const D = G.D, M = D.maps;
  Object.assign(D.legend, { 'ƒ': 'fern', 'ψ': 'tallgrass', '·': 'pebbles', '♣': 'shrub', '▬': 'log', '¡': 'cattail', '♠': 'snowshrub', '✧': 'icecrystal', '†': 'deadshrub', '☠': 'skull', '¤': 'cobweb', '∴': 'rubbleFloor', '○': 'puddle', '≋': 'moss', '▫': 'papersFloor', '❄': 'rime', '◊': 'shells' });

  function rng(seed) { let a = seed | 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const pickW = (r, list) => { let tot = 0; list.forEach(x => tot += x[1]); let v = r() * tot; for (const x of list) { v -= x[1]; if (v < 0) return x[0]; } return list[0][0]; };
  // o: { on: chars that may be decorated, soft: [[ch, weight]], solid: [[ch, weight]], pSoft, pSolid, seed, road: chars kept clear }
  D.decorate = function (id, o) {
    const m = M[id], rows = m.rows.map(r => r.split('')), h = rows.length, w = rows[0].length, r = rng(o.seed || 7);
    const L = Object.assign({}, D.legend, m.legend || {});
    const thing = (x, y) => m.things && m.things[rows[y][x]];
    const isRoad = ch => (o.road || ':=-').indexOf(ch) >= 0;
    const solidAt = (x, y) => { if (x < 0 || y < 0 || x >= w || y >= h) return true; const ch = rows[y][x]; if (thing(x, y)) return true; if (ch === '.' || ch === ',') return false; const t = L[ch]; return !t || !!(D.tiles[t] || {}).solid; };
    const near = (x, y, d, test) => { for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && xx >= 0 && yy < h && xx < w && test(xx, yy)) return true; } return false; };
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      if (o.on.indexOf(rows[y][x]) < 0) continue;
      if (near(x, y, 1, (xx, yy) => !!thing(xx, yy))) continue;
      const v = r();
      if (v < o.pSolid && o.solid && o.solid.length) {
        if (near(x, y, 2, (xx, yy) => !!thing(xx, yy) || isRoad(rows[yy][xx]))) continue;
        if (near(x, y, 1, (xx, yy) => solidAt(xx, yy))) continue;            // all eight neighbours open, so nothing is ever cut off
        rows[y][x] = pickW(r, o.solid);
      } else if (v < o.pSolid + o.pSoft && o.soft && o.soft.length) {
        if (isRoad(rows[y][x])) continue;
        rows[y][x] = pickW(r, o.soft);
      }
    }
    m.rows = rows.map(row => row.join(''));
  };
  const GREEN = { on: '.,', soft: [['ƒ', 3], ['ψ', 4], ['·', 1]], solid: [['♣', 3], ['B', 2], ['▬', 1], ['R', 1]], pSoft: 0.16, pSolid: 0.06 };
  D.decorate('thornwood', Object.assign({ seed: 11 }, GREEN));
  D.decorate('mill', Object.assign({ seed: 12 }, GREEN, { pSolid: 0.02 }));
  D.decorate('mirefen', { seed: 21, on: '",', soft: [['¡', 3], ['ψ', 2], ['`', 1]], solid: [[';', 3], ['♣', 1], ['▬', 1]], pSoft: 0.09, pSolid: 0.03, road: ':=-' });
  D.decorate('tidemill', { seed: 22, on: '"', soft: [['¡', 3], ['ψ', 1]], solid: [[';', 1]], pSoft: 0.08, pSolid: 0.015 });
  D.decorate('saltpans', { seed: 23, on: '._', soft: [['·', 3], ['ψ', 1]], solid: [['R', 1]], pSoft: 0.06, pSolid: 0.015 });
  D.decorate('wreck', { seed: 24, on: ',', soft: [['·', 3]], solid: [['R', 1], ['▬', 1]], pSoft: 0.07, pSolid: 0.02 });
  const SNOW = { on: '.,&', soft: [['(', 3], ['✧', 2], ['·', 1]], solid: [['♠', 3], ['}', 2], ['{', 1]], pSoft: 0.09, pSolid: 0.03 };
  D.decorate('frostpass', Object.assign({ seed: 31 }, SNOW));
  D.decorate('falls', Object.assign({ seed: 32 }, SNOW, { pSolid: 0.02 }));
  D.decorate('ashroad', { seed: 51, on: '.,', soft: [['☠', 1], ['·', 2], ['%', 1], [',', 3]], solid: [['†', 3], ['T', 1], ['R', 1]], pSoft: 0.08, pSolid: 0.03, road: ':=-' });

  /* ---------- quest-givers out on the roads ---------- */
  // Some side jobs now start with someone you meet in the wild, not on a notice board.
  function moveOffBoard(map, tag, labelStart) {
    const b = Object.values(M[map].things).find(t => t.tag === tag); if (!b) return;
    const list = b.script[0][3];
    for (let i = list.length - 1; i >= 0; i--) if (String(list[i][0]).indexOf(labelStart) === 0) list.splice(i, 1);
  }
  Object.assign(D.sprites, {
    alf: { skin: '#d8a070', hair: '#8a5a2a', beard: 1, top: '#6a7a3a', legs: '#4a3a2a', trim: '#c8a070' },
    ada: { skin: '#f0d0b0', hair: '#c8c0b0', top: '#d8d0e8', legs: '#8a8098', robe: 1, hood: '#b8b0c8' },
    gorm: { skin: '#c89070', hair: '#5a5040', beard: 1, top: '#4a6a5a', legs: '#3a3028', hat: '#3a4a3a', brim: 1 },
    ivar: { skin: '#e0b090', hair: '#d8b060', top: '#8a3a2a', legs: '#4a3a2a', trim: '#e8c14a', hat: '#5a3a2a' },
    signe: { skin: '#f0d0b8', hair: '#f0e0a0', top: '#4a6a9a', legs: '#3a3a4a', hs: 'braids' },
    bren: { skin: '#c8a888', hair: '#c8c8d0', beard: 1, top: '#5a6a8a', legs: '#3a3a48', robe: 1, hood: '#7a8aa8', trim: '#c8d0e8' },
    pim: { skin: '#e0b090', hair: '#6a4a2a', top: '#7a6a4a', legs: '#4a3a2a', cap: '#5a4a3a' },
    lisbet: { skin: '#e8c0a0', hair: '#8a3a2a', top: '#7a5a3a', legs: '#4a3a2a', hs: 'bun' }
  });
  Object.assign(D.looks, { alf: { held: 'axe' }, ada: { held: 'staff' }, gorm: { held: 'spear' }, ivar: { held: 'pack' }, signe: { held: 'book' }, pim: { held: 'club' }, lisbet: { held: 'pitchfork' }, bren: { held: 'lantern', gem: '#c8e0ff', mus: 1 } });
  function giver(map, x, y, def) { return D.placeNear(map, null, x, y, Object.assign({ type: 'npc', wander: 1 }, def)); }
  Object.assign(D.speakers, { 'Alf the Woodcutter': '#c8a070', Wenna: '#e0b8a0', 'Pilgrim Ada': '#d8d0e8', 'Gorm the Eel-man': '#a8c0a0',
    'Pedlar Ivar': '#d8b890', Signe: '#e8d0c0', 'Pim the Rat-catcher': '#c8b090', 'Carter Lisbet': '#d8b8a0', 'Old Warden Bren': '#c8d0e8' });

  // Chapter 1: the old tower, and Tam
  moveOffBoard('brackenford', 'board1', '"LIGHTS IN THE OLD TOWER"'); moveOffBoard('brackenford', 'board1', '"TAM IS MISSING"');
  giver('thornwood', 7, 12, { tag: 'alf', sprite: 'alf', script: [['if', '!q.oldtower', [
    ['say', 'Alf the Woodcutter', 'You four look like you can handle yourselves. There are lights in the old watchtower up the west track, at night. Nobody has lived there in twenty years.'],
    ['say', 'Alf the Woodcutter', 'I saw a man with a Vosk axe go in. I told Hobb. Hobb told me to stop drinking. I have not been drinking.'],
    ['say', 'Finch', 'Not even a little?'], ['say', 'Alf the Woodcutter', 'A little. But I saw it.'],
    ['quest', 'oldtower', 1]
  ], [['if', 'towerDone', [['say', 'Alf the Woodcutter', 'Tolan Vosk, in the old tower all along! I knew it. Here, have some kindling. It is good kindling.']], [['say', 'Alf the Woodcutter', 'West track, up past the dead oak. You cannot miss it. Unless it is dark.']]]]]] });
  giver('thornwood', 17, 28, { tag: 'wenna', sprite: 'wenna', if: '!tamHome', script: [['if', '!q.tam&joined', [
    ['say', 'Wenna', 'Have you seen a boy? Eight, freckles, a stick he calls a sword? Tam. He went into the wood after a goblin with a spade.'],
    ['say', 'Wenna', 'I have looked everywhere I dare. I do not dare very far.'],
    ['say', 'Runa', 'We will find him.'], ['quest', 'tam', 1]
  ], [['if', 'tamHome', [['say', 'Wenna', 'He is home and he is grounded until he is thirty. Thank you. Thank you.']], [['say', 'Wenna', 'Please. The deep part of the wood, south of the road. Please.']]]]]] });

  // Chapter 2: the false lights, and the Eel King
  moveOffBoard('saltmere', 'board2', '"FALSE LIGHTS ON THE FEN"'); moveOffBoard('saltmere', 'board2', '"BOUNTY: THE EEL KING"');
  giver('mirefen', 12, 9, { tag: 'ada', sprite: 'ada', script: [['if', '!q.wisps', [
    ['say', 'Pilgrim Ada', 'Oh, thank the Lamp. People. Real ones. I followed a light last night, thinking it was the Abbey. It was not the Abbey.'],
    ['say', 'Pilgrim Ada', 'There are three of them out on the fen. False lights. They lead you into the deep water and wait.'],
    ['say', 'Maren', 'Will-o\'-the-fen. They can be put out. If you know how.'], ['quest', 'wisps', 1]
  ], [['if', 'q.wisps=2', [['say', 'Pilgrim Ada', 'The fen is dark again. Ordinary dark. I never thought I would be glad of that.']], [['say', 'Pilgrim Ada', 'Three lights. North, west and south of the water. Do be careful.']]]]]] });
  giver('mirefen', 30, 10, { tag: 'gorm', sprite: 'gorm', script: [['if', '!q.eelking', [
    ['say', 'Gorm the Eel-man', 'Three boats. Three good boats, and a dog. The Eel King took them all, out of the south pools.'],
    ['say', 'Gorm the Eel-man', 'The village put up a bounty. A hundred and fifty gold. Nobody has collected. Nobody comes back to collect.'],
    ['say', 'Runa', 'We will collect.'], ['quest', 'eelking', 1]
  ], [['if', 'q.eelking=2', [['say', 'Gorm the Eel-man', 'Eel pie for a month! You are welcome at my table, any of you. Bring your own fork.']], [['say', 'Gorm the Eel-man', 'South pools. Look for bubbles. Lots of bubbles.']]]]]] });

  // Chapter 3: the troll, and the runestones
  moveOffBoard('karrow', 'board3', '"BOUNTY: FROST TROLL"'); moveOffBoard('karrow', 'board3', '"THE RUNESTONES"');
  giver('frostpass', 18, 29, { tag: 'ivar', sprite: 'ivar', script: [['if', '!q.troll3', [
    ['say', 'Pedlar Ivar', 'You are going south? Not by the ford, you are not. There is a troll at the ford. I went round. It took me two days.'],
    ['say', 'Pedlar Ivar', 'The clan has put a price on it. Three hundred. Bring an ear, they say. Trolls have very big ears.'],
    ['quest', 'troll3', 1]
  ], [['if', 'q.troll3=2', [['say', 'Pedlar Ivar', 'The ford is clear! Two days saved, every trip. I could kiss you. I will not. But I could.']], [['say', 'Pedlar Ivar', 'South ford. Look for a snowdrift with teeth.']]]]]] });
  giver('frostpass', 9, 15, { tag: 'signe', sprite: 'signe', script: [['if', '!q.runes3', [
    ['say', 'Signe', 'Grandmother Thora sent me to read the old runestones. I cannot read them. I can only read new runes. Old runes are all wiggly.'],
    ['say', 'Signe', 'There are four of them in the pass. Will you read them for her? She cannot walk so far any more.'],
    ['say', 'Finch', 'Old songs carved in stone? I would walk a lot further than that.'], ['quest', 'runes3', 1]
  ], [['if', 'q.runes3=2', [['say', 'Signe', 'You read them all? Take the rubbings to Grandmother at the Forge. She will cry. She always cries at old things.']], [['say', 'Signe', 'Four stones. One here, one by the ford, and two up the high track.']]]]]] });

  // Chapter 4: the Rat Mother
  moveOffBoard('highmoor', 'board4', '"THE RAT MOTHER"');
  giver('undercroft', 4, 3, { tag: 'pim', sprite: 'pim', script: [['if', '!q.rats4', [
    ['say', 'Pim the Rat-catcher', 'Careful! You nearly trod on Bartholomew. He is my ferret. He is very brave and very small.'],
    ['say', 'Pim the Rat-catcher', 'The guild sent me after the Rat Mother, in the east sewer. Bartholomew took one look and went back in my coat.'],
    ['say', 'Pim the Rat-catcher', 'Four hundred crowns, the guild pays. I would split it with you. I would split it with anyone.'],
    ['quest', 'rats4', 1]
  ], [['if', 'q.rats4=2', [['say', 'Pim the Rat-catcher', 'You did it! Bartholomew is so proud he has come out of my coat. Briefly.']], [['say', 'Pim the Rat-catcher', 'The east sewer. There is a crack in the street by the east wall. Follow the squeaking.']]]]]] });

  // Chapter 5: the wagons, and the cache
  moveOffBoard('ashfall', 'board5', '"MISSING WAGONS"'); moveOffBoard('ashfall', 'board5', '"THE WARDEN CACHE"');
  giver('ashroad', 9, 17, { tag: 'lisbet', sprite: 'lisbet', script: [['if', '!q.supply5', [
    ['note', 'A carter is sitting in the ash with her arm in a sling, swearing at the sky.'],
    ['say', 'Carter Lisbet', 'Three wagons. Salt pork, bandages, lamp-oil. Ghouls came out of the cinders and we ran. I ran. I am not proud of it.'],
    ['say', 'Carter Lisbet', 'Ashfall needs those loads. If anything is left. Will you look?'], ['quest', 'supply5', 1]
  ], [['if', 'q.supply5=2', [['say', 'Carter Lisbet', 'All three! The quartermaster will stop shouting at me. Probably. Thank you.']], [['say', 'Carter Lisbet', 'One by the north rocks, one past the canyon, one down south. Mind the ghouls.']]]]]] });
  giver('ashroad', 38, 5, { tag: 'bren', sprite: 'bren', alpha: 0.75, wander: 0, script: [['if', '!q.cache5', [
    ['note', 'An old man in Warden grey sits on a stone by the cliff. Ash falls through him without touching.'],
    ['say', 'Old Warden Bren', 'You carry lamps. Good. I buried our arms here, when the last line broke. Three hundred years I have waited for someone to dig.'],
    ['say', 'Old Warden Bren', 'The Knights know. They wait too. Dig anyway.'], ['quest', 'cache5', 1]
  ], [['if', 'q.cache5=2', [['say', 'Old Warden Bren', 'Light them all.'], ['note', 'And he is gone, and the stone is only a stone.']], [['say', 'Old Warden Bren', 'Below the lamp cut in the cliff. Dig.']]]]]] });
})();
