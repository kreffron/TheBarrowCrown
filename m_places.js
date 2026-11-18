/* Places for Maren's prayers and Finch's songs. Maren's blessing and Finch's busking no longer work anywhere: each
   works only at its own places, and each place does its own thing. Each refreshes after a rest (inn or camp).
   D.prayers[id] = { map, at, gfx, name, look, line, after, heal: % of max HP, sp: % of max SP, bless: next fight }
   D.venues[id]  = { map, at, gfx, name, look, crowd, after, gold (times the chapter), give, inspire: next fight }
   How much a prayer heals and a song pays also depends on how far Maren and Finch trust Runa (src/bonds.js). */
(function () {
  const D = G.D;
  D.prayers = {
    temple: { map: 'temple', at: [10, 3], gfx: 'altar', name: "The Lamplighter's altar", look: "Brackenford's altar to the Lamplighter, its brass worn bright by a hundred years of hands.", line: 'Lamplighter, these three are mine to keep. Help me keep them.', after: 'The lamp on the altar flares, and every ache in the party eases.', heal: 45 },
    chapel: { map: 'chapel', at: [14, 10], gfx: 'shrine', name: "The Doorward's shrine", look: 'A little shrine on the old road, with a dish for travellers\' offerings. Somebody left a hazelnut.', line: 'For the road ahead, and everyone on it.', after: 'Maren leaves a coin beside the hazelnut. The road feels shorter.', heal: 25, bless: 1 },
    ossuary: { map: 'ossuary', at: [1, 9], gfx: 'altar', name: 'The bone-chapel', look: 'An altar made of the bones of the people who built it. They wanted to keep working.', line: 'You kept your watch. Let us keep ours.', after: 'The bones seem, somehow, to approve.', heal: 20, sp: 25 },
    s_chapel: { map: 's_chapel', at: [10, 3], gfx: 'altar', name: "The sailors' chapel", look: 'Model ships hang from the rafters, one for every boat that did not come home.', line: 'For the ones still out on the water. And for us.', after: 'The model ships turn in a draught nobody feels.', heal: 35, sp: 20 },
    belltower: { map: 'belltower', at: [2, 1], gfx: 'shrine', name: 'The drowned bell-shrine', look: 'A shrine to the drowned, at the foot of the bell-tower, its lamp crusted with salt.', line: 'Ring for us, when we need it.', after: 'Far above, the bell answers once, softly.', bless: 1 },
    abbey1: { map: 'abbey1', at: [2, 1], gfx: 'altar', name: "The abbey's broken altar", look: 'The abbey\'s first altar, split in two by the flood, still dry on top.', line: 'It is broken. So were we, once. Still standing.', after: 'Maren rests both hands on the two halves. The party breathes easier.', heal: 30, sp: 15 },
    cairn1: { map: 'cairn1', at: [16, 11], gfx: 'shrine', name: 'The ancestor-stones', look: 'Rune-stones for the Karrow dead, each with a name and a deed.', line: 'They are Runa\'s people. Let them lend us a little of what they had.', after: 'Runa touches one of the names, and does not say anything.', heal: 30, sp: 30 },
    karrow: { map: 'karrow', at: [24, 14], gfx: 'shrine', name: "Karrow's hearth-shrine", look: 'The fire that never goes out in Karrow, ringed with stones, warm as a hand.', line: 'Hearth and lamp. They are the same thing, really.', after: 'The warmth gets into your bones and stays there.', heal: 50 },
    h_cathedral: { map: 'h_cathedral', at: [12, 8], gfx: 'altar', name: "The cathedral's side-altar", look: 'A Warden altar the Duke\'s cathedral has walled half out of sight.', line: 'They forgot you. We did not.', after: 'A verger frowns at the light. It does not go out.', heal: 40, sp: 20 },
    catacombs1: { map: 'catacombs1', at: [21, 5], gfx: 'shrine', name: 'The catacomb lamp', look: 'A Warden lamp in a niche of skulls, cold for a long time.', line: 'Light for the dark below. We will need it.', after: 'The skulls catch the light and look, for a moment, almost friendly.', heal: 20, bless: 1 },
    ashfall: { map: 'ashfall', at: [17, 2], gfx: 'altar', name: "The Wardens' field altar", look: 'A camp altar of arrow-crates and a cloth, with a lamp on it that has not gone out since the war-line formed.', line: 'For everyone who will march tomorrow.', after: 'A dozen Wardens bow their heads with you. The light seems brighter for it.', heal: 50, bless: 1 },
    lamphall: { map: 'lamphall', at: [17, 1], gfx: 'shrine', name: "The Warden's tomb-lamp", look: 'A lamp on the tomb of a Warden who held this hall alone.', line: 'Warden. Lend us your watch, one more night.', after: 'The flame stands up straight, like someone coming to attention.', sp: 50 },
    ashchapel: { map: 'ashchapel', at: [16, 5], gfx: 'altar', name: 'The burnt chapel', look: 'The roof is gone and the pews are ash, but the altar stone is whole.', line: 'They burned the house. They could not burn the place.', after: 'Ash lifts off the altar in a breath of wind, and the stone underneath is clean.', heal: 30, sp: 20, bless: 1 }
  };
  D.venues = {
    tavern: { map: 'tavern', at: [16, 10], gfx: 'barrel', name: "The Lantern's common room", look: 'An upturned barrel by the fire. Every bard in Brackenford has stood on it, and most have fallen off.', crowd: 'The regulars bang their mugs for the chorus and demand it twice.', gold: 14, give: ['tonic', 1] },
    brackenford: { map: 'brackenford', at: [38, 25], gfx: 'notice', name: 'Brackenford market cross', look: 'The market cross, where the town crier stands on market days, and Finch stands on the others.', crowd: 'Farmers, a tinker, and a goat stop to listen. The goat stays longest.', gold: 18 },
    mill: { map: 'mill', at: [3, 1], gfx: 'barrel', name: "Teague's mill yard", look: 'Where the mill-hands eat their bread at noon, on sacks of flour.', crowd: 'The mill-hands throw flour instead of coins at first, then coins.', gold: 12, give: ['draught', 1] },
    saltmere: { map: 'saltmere', at: [2, 12], gfx: 'barrel', name: 'Saltmere fish docks', look: 'A crate at the end of the fish docks, with a view of every boat coming in.', crowd: 'The fishers sing the sea-chorus back at him, louder and filthier. Nobody minds.', gold: 16, inspire: 1 },
    s_inn: { map: 's_inn', at: [9, 4], gfx: 'barrel', name: "The Gull and Lantern's hearth", look: 'A bench by the inn hearth, warm and slightly singed.', crowd: 'Somebody\'s grandmother requests a love song, then corrects the words.', gold: 18 },
    saltpans: { map: 'saltpans', at: [8, 1], gfx: 'crate', name: "The salt-rakers' hut", look: 'Where the salt-rakers rest their backs at the change of shift.', crowd: 'The rakers keep time with their rakes. They pay in coin and a little salt.', gold: 14, give: ['salts', 1] },
    k_hall: { map: 'k_hall', at: [12, 4], gfx: 'barrel', name: "Karrow's long hall", look: 'The skald\'s stool in the long hall, which Finch is not allowed to sit on, and sits on.', crowd: 'The clan thumps the tables until the rafters shake. Even the old skald nods, once.', gold: 22, inspire: 1 },
    frostpass: { map: 'frostpass', at: [35, 16], gfx: 'crate', name: "The picket's fire", look: 'A clan picket\'s fire in the lee of a rock, with room for one more.', crowd: 'The pickets sing the marching verses, stamping to keep their feet warm.', gold: 16, give: ['potent', 1] },
    highmoor: { map: 'highmoor', at: [1, 9], gfx: 'notice', name: 'Highmoor fountain square', look: 'The fountain square, where Highmoor\'s street players work. Most of them are better dressed than Finch.', crowd: 'A crowd gathers, and so does a city guard, who decides he likes it.', gold: 26 },
    h_inn: { map: 'h_inn', at: [6, 2], gfx: 'barrel', name: 'The Highmoor taproom', look: 'A corner of the taproom kept clear for whoever thinks they can sing.', crowd: 'A table of clerks buys him a drink, and then another, and then sings along.', gold: 24, give: ['tonic', 1] },
    printshop: { map: 'printshop', at: [15, 7], gfx: 'crate', name: "The printers' tea-break", look: 'Where the printers drink their tea, inky to the elbows.', crowd: 'The printers set his words in type as he sings them. There will be broadsheets by morning.', gold: 20, inspire: 1 },
    ashfall: { map: 'ashfall', at: [15, 12], gfx: 'crate', name: "The war camp's cookfire", look: 'The big cookfire where the war camp eats, every face lit orange.', crowd: 'A hundred Wardens who are afraid of tomorrow forget it for a song. Then they ask for another.', gold: 30, inspire: 1 }
  };
  const HINT_M = 'A holy place. Maren could pray here. Put her in front and use her ability.', HINT_F = 'Finch could play here. Put him in front and use his ability.';
  for (const id in D.prayers) {
    const p = D.prayers[id];
    D.placeNear(p.map, null, p.at[0], p.at[1], { type: 'obj', gfx: p.gfx, name: p.name, script: [['note', p.look], ['note', HINT_M]], abil: { who: 'maren', script: [['pray', id]] } });
  }
  for (const id in D.venues) {
    const v = D.venues[id];
    D.placeNear(v.map, null, v.at[0], v.at[1], { type: 'obj', gfx: v.gfx, name: v.name, script: [['note', v.look], ['note', HINT_F]], abil: { who: 'finch', script: [['busk', id]] } });
  }
})();
