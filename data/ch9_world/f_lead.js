/* Things only one of the four can deal with, outside a fight. Put the right one in front (switch leader) and use
   their ability: Runa smashes, Dask picks and searches, Maren lights old lamps, Finch wins people over.
   One of each per chapter; each pays out once. */
(function () {
  const D = G.D, M = D.maps;
  const POT = { 1: 'draught', 2: 'greater', 3: 'potent', 4: 'elixir', 5: 'elixir' };
  const HINT = { runa: 'Runa could break through. Put her in front and use her ability.', dask: 'Locked, and cleverly. Dask could open it. Put him in front and use his ability.',
    maren: 'An old Warden lamp, cold. Maren could light it. Put her in front and use her ability.', finch: 'Finch might be able to help here. Put him in front and use his ability.' };

  function smash(ch, map, x, y, gfx, text, after) {
    const f = 'lead.' + map + '.runa';
    D.placeNear(map, null, x, y, { tag: 'lead_runa' + ch, type: 'obj', gfx, unless: f, script: [['note', text], ['note', HINT.runa]],
      abil: { who: 'runa', script: [['say', 'Runa', 'Stand back.'], ['sfx', 'hit'], ['shake', 300], ['note', after], ['set', f], ['gold', 50 * ch], ['give', POT[ch], 2], ['xp', 25 * ch], ['remove']] } });
  }
  function pick(ch, map, x, y, text, loot) {
    const f = 'lead.' + map + '.dask';
    D.placeNear(map, null, x, y, { tag: 'lead_dask' + ch, type: 'obj', gfx: 'chest', gfxIf: [f, 'chestOpen'], script: [['if', f, [['note', 'Empty now. Dask took everything, including the dust.']], [['note', text], ['note', HINT.dask]]]],
      abil: { who: 'dask', script: [['if', f, [['say', 'Dask', 'Already done. I do not do encores.']], [['say', 'Dask', 'Two pins, a twist, and a little patience...'], ['sfx', 'door'], ['note', 'Click.'], ['set', f], ['gold', 70 * ch], ['give', loot], ['give', POT[ch], 1], ['xp', 25 * ch]]]] } });
  }
  function lamp(ch, map, x, y, text, after) {
    const f = 'lead.' + map + '.maren';
    D.placeNear(map, null, x, y, { tag: 'lead_maren' + ch, type: 'obj', gfx: 'lampDead', gfxIf: [f, 'lamp'], script: [['if', f, [['note', 'The old lamp burns, small and steady.']], [['note', text], ['note', HINT.maren]]]],
      abil: { who: 'maren', script: [['if', f, [['say', 'Maren', 'It is lit. It will stay lit.']], [['say', 'Maren', 'Lamplighter, here is one of yours.'], ['sfx', 'heal'], ['note', after], ['set', f], ['heal', 'all'], ['xp', 40 * ch], ['gold', 30 * ch]]]] } });
  }
  function charm(ch, map, x, y, sprite, who, plea, song, thanks, loot) {
    const f = 'lead.' + map + '.finch';
    D.placeNear(map, null, x, y, { tag: 'lead_finch' + ch, type: 'npc', sprite, dir: 'down', script: [['if', f, [['say', who, thanks]], [['say', who, plea], ['note', HINT.finch]]]],
      abil: { who: 'finch', script: [['if', f, [['say', who, thanks]], [['say', 'Finch', song], ['sfx', 'good'], ['note', 'Finch plays. Bit by bit, the frown comes undone.'], ['say', who, thanks], ['set', f], ['give', loot], ['gold', 40 * ch], ['xp', 25 * ch]]]] } });
  }
  Object.assign(D.speakers, { 'Old Mags': '#d8c0a8', 'Sulky Sailor': '#a8c0d8', 'Elder Gudrun': '#d8d0e8', 'Heckler': '#e8c8a0', 'Young Recruit': '#c8d0a8' });
  Object.assign(D.sprites, {
    oldmags: { skin: '#e0b8a0', hair: '#d8d4cc', top: '#6a4a5a', legs: '#3a3038', hs: 'bun' },
    sailor: { skin: '#c89070', hair: '#3a2a20', top: '#2a3a6a', legs: '#2a2a30', cap: '#2a2a3a', stripe: '#e8e8f0' },
    gudrun: { skin: '#f0d0b8', hair: '#f0f0f4', top: '#5a3a3a', legs: '#3a2a2a', hs: 'braids', fur: '#e8e8f0' },
    heckler: { skin: '#e8c8a8', hair: '#8a5a2a', top: '#7a2a4a', legs: '#2a2a3a', hat: '#2a2a3a', feather: '#e8c14a' },
    recruit: { skin: '#e0b090', hair: '#c88a4a', top: '#6a6a70', legs: '#3a3a40', helm: '#8a8c94' }
  });
  Object.assign(D.looks, { oldmags: { held: 'ladle' }, sailor: { held: 'rod' }, gudrun: { held: 'staff' }, heckler: {}, recruit: { held: 'spear' } });

  // Chapter 1
  smash(1, 'barrow1', 6, 9, 'rubble', 'A heap of fallen stones, with a cold draught coming through the gaps.', 'The stones go over with a roar. Behind them, a Warden niche and an old offering box.');
  pick(1, 'thornwood', 37, 4, 'A woodcutter\'s strongbox under a tarp, with a good lock on it.', 'tonic');
  lamp(1, 'thornwood', 5, 27, 'A Warden lamp on a post, older than the wood around it.', 'The lamp takes. For a breath the whole wood is very quiet, and every one of you feels mended.');
  charm(1, 'brackenford', 34, 18, 'oldmags', 'Old Mags', 'Nobody sings any more. Not since my Alder. The whole village is too busy.', 'This one is for Alder Pell, and for the people who wait up.', 'Oh. Oh, that was lovely. Here, take this. It was his. He would want it to go to someone who sings.', 'luckycoin');
  // Chapter 2
  smash(2, 'abbey1', 6, 4, 'rubble', 'A fall of masonry blocks a side chapel. Something gold glints between the stones.', 'The fall shifts and slides. In the side chapel, a reliquary the sisters left behind.');
  pick(2, 'saltmere', 31, 17, 'A sea-chest on the quay, stencilled ORRIN & SONS, with a lock that cost more than the chest.', 'gannetcoat');
  lamp(2, 'mirefen', 40, 26, 'A drowned lamp on a stake in the reeds. The fishermen used to steer by it.', 'It flares green-gold over the water. Somewhere out on the fen, someone cheers.');
  charm(2, 'saltmere', 16, 12, 'sailor', 'Sulky Sailor', 'Six weeks ashore. No ship, no pay, no song worth the name in this whole town.', 'A shanty, then! Everybody: "Haul away, for Saltmere..."', 'Ha! Haul away! All right, all right, you win. Have my lucky knife. I will not need it, I am staying ashore and getting fat.', 'tonic');
  // Chapter 3
  smash(3, 'icecaves', 5, 12, 'boulder', 'A boulder of ice and stone wedged across a side passage.', 'The boulder splits down the middle. The passage behind it was a trapper\'s cache.');
  pick(3, 'frostpass', 40, 30, 'A trapper\'s cache-box, frozen and locked.', 'snowcloak');
  lamp(3, 'frostpass', 8, 6, 'A cairn-lamp on the high track, buried to its shoulders in snow.', 'The cairn-lamp burns. The wind drops, just for a moment, as if the pass were holding its breath.');
  charm(3, 'karrow', 30, 24, 'gudrun', 'Elder Gudrun', 'Southerners. In my hall. Singing, probably. Southerners always sing.', 'Then here is a northern one, Elder. About a woman who would not leave the ice.', 'Hm. You know the old words. Who taught you the old words? Take this. It kept my husband warm. It may keep you.', 'frostward');
  // Chapter 4
  smash(4, 'catacombs1', 5, 18, 'rubble', 'A bricked-up arch, the mortar crumbling. The bricks are newer than the walls.', 'The bricks come down in a cloud of dust. Somebody walled up a forgotten ossuary, with its offerings.');
  pick(4, 'highmoor', 40, 10, 'A counting-house strongbox, chained to a post in an alley. Orrin and Sons, again.', 'signet');
  lamp(4, 'undercroft', 30, 10, 'A Warden lamp in a niche of the old city, under all the new one.', 'Light runs along the old stones. The Undercroft remembers it was a street once.');
  charm(4, 'highmoor', 15, 21, 'heckler', 'Heckler', 'A minstrel? In my square? I have heard better from a cat in a sack.', 'Then you will love this one. It is about you.', 'All right! All right. That was devastating and I deserved it. Here, my tailor\'s token. Get yourself a better hat.', 'silverbell');
  // Chapter 5
  smash(5, 'ashroad', 20, 25, 'rubble', 'A barricade of burnt wagons and stones, built in a hurry and left in a worse one.', 'The barricade comes apart. Behind it, the last supplies of a patrol that never came back.');
  pick(5, 'ashfall', 8, 21, 'A quartermaster\'s locker, "NOT FOR ISSUE" painted on the lid.', 'dawnstone');
  lamp(5, 'ashroad', 30, 8, 'An old Warden waystation lamp, buried in ash.', 'The lamp burns white. For a long moment, no ash falls anywhere near it.');
  charm(5, 'ashfall', 28, 11, 'recruit', 'Young Recruit', 'I am going to die out there tomorrow. Everyone says so. Even the sheep.', 'Then here is a song about people who did not.', 'I... thank you. I think I will go and polish my spear. And maybe write home.', 'fivelamps');
})();
