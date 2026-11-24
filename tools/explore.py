"""Generates data/ch9_world/k_explore.js: two more places per hero per chapter where their exploring ability matters,
   outside the puzzle dungeons. Spots come from a finder that picks reachable squares against a wall, away from doors and
   people, that do not cut a map in two (tools/explore_spots.json, made by the finder in tools/explore_find.py)."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = json.load(open(os.path.join(ROOT, 'tools', 'explore_spots.json')))
def at(m, i): p = S[m]['picks'][i]; return [p[0], p[1]]
def js(v): return json.dumps(v, ensure_ascii=False)
out = []
def emit(kind, **k):
    out.append('  %s(%s);' % (kind, js(k)))

# ---------------- chapter 1 ----------------
emit('cut', ch=1, who='runa', map='thornwood', a=at('thornwood', 0), b=at('thornwood', 1), gfx='log',
     text='A fallen oak lies across an old deer-path. Beyond it, the path runs on into the trees.',
     line='Stand back.', after='Runa sets her shoulder to the trunk. It groans, rolls, and goes over. The deer-path runs clear.',
     through='The old deer-path, cleared. It cuts straight through the wood.')
emit('rescue', ch=1, map='mill', at=at('mill', 2), sprite='boy', name='Miller\'s Boy',
     plea='The cart\'s sunk to the axle and Da will skin me. I can\'t shift it. Nobody can shift it.',
     after='Runa takes hold of the wheel and lifts. The cart comes out of the mud with a sound like a boot leaving a bog.',
     offer='Here. It\'s not much. It\'s Da\'s, but he\'d want... probably.',
     take=['Take the coins', 15, 'dask', 'maren', 'Fair\'s fair. Work is work.', 'He is a boy, Runa.'],
     refuse=['Keep your coins', 'maren', 'dask', 'Good.', 'Charity. Lovely. Can we eat it?'])
emit('cache', ch=1, who='dask', map='cistern', at=at('cistern', 0), gfx='crate',
     text='A rusted grate in the floor. Something wrapped in oilcloth sits in the dark below it.',
     line='Rust is just a lock that has given up. Like this.', after='The grate lifts. Inside the oilcloth: coins, and a little carved acorn.',
     gold=40, give=['acorncharm', 1], xp=20)
emit('moral', ch=1, who='dask', map='brackenford', at=at('brackenford', 1), gfx='chest',
     text='A strongbox on the back of an untended wagon. Its owner is in the Crooked Lantern, by the sound of it.',
     line='I could have that open before he finishes his pint.',
     q='Dask has his picks out. He looks at Runa.',
     a=['Let him open it', [['gold', 60], ['say', 'Dask', 'Sixty gold for a merchant who leaves his money in the street. That is not theft. That is tuition.'], ['say', 'Maren', 'It is not ours.']], [['dask', 1], ['maren', -1], ['dask_maren', -1]]],
     b=['Put the picks away', [['say', 'Dask', 'Fine. Virtue. It pays terribly.'], ['say', 'Maren', 'Thank you.']], [['maren', 1], ['dask', -1]]])
emit('bless', ch=1, map='barrow1', at=at('barrow1', 1), gfx='lampDead', lit='lamp',
     text='A Warden lamp in a niche, cold for a hundred years.', after='The flame takes. For a moment the barrow feels less like a grave.')
emit('rest', ch=1, map='ossuary', at=at('ossuary', 0), gfx='grave', done='graveOpen',
     text='A grave that will not stay shut. The lid has been shoved aside from inside, more than once.',
     after='Maren kneels and says the old words. The lid settles, and stays settled.',
     give=['draught', 2], xp=40, pair='maren_finch', lines=[['Finch', 'That was kind.'], ['Maren', 'It was overdue.']])
emit('charm', ch=1, map='brackenford', at=at('brackenford', 2), sprite='urchin', name='Urchin',
     plea='Bet you can\'t play The Miller\'s Goose. Nobody can. It\'s got eleven verses.',
     song='Eleven verses? I know fourteen.', thanks='That\'s... that\'s all of them. Here. It\'s my lucky stone. It\'s not very lucky.',
     give=['luckycoin', 1], gold=0, xp=15, pair='dask_finch', lines=[['Dask', 'Fourteen verses. I counted every one.'], ['Finch', 'You sang the chorus.'], ['Dask', 'I did not.']])
emit('charm', ch=1, map='mill', at=at('mill', 3), sprite='farmer', name='Seed Farmer',
     plea='Seed thieves. Three this month. I sit on the sack. I do not sing. I do not dance. Move along.',
     song='A song about a farmer who sat on his seed so long it grew.', thanks='...Ha. All right. All right. Take a bag of my wife\'s tonic and stop making me laugh.',
     give=['tonic', 2], gold=20, xp=15)
# ---------------- chapter 2 ----------------
emit('cut', ch=2, who='runa', map='abbey1', a=at('abbey1', 0), b=at('abbey1', 1), gfx='rubble',
     text='A fall of masonry chokes a side cloister. You can hear water moving on the far side.',
     line='This one is mine.', after='Runa pulls the stones down one at a time, then the rest come down on their own. The cloister is open.',
     through='The side cloister, cleared. It runs through to the far end of the abbey.')
emit('cache', ch=2, who='runa', map='seacave', at=at('seacave', 1), gfx='bars',
     text='Rusted bars across a crawlway. Beyond them, a smuggler\'s stash: casks, and a box.',
     line='Rust and sea air. These bars are older than Dask.', after='Runa bends two bars apart, not quite gently.',
     gold=60, give=['greater', 2], xp=30)
emit('cache', ch=2, who='dask', map='saltpans', at=at('saltpans', 0), gfx='crate',
     text='A salt-rake hut, padlocked. Someone keeps more than rakes in there.',
     line='The padlock is new. The hut is not. That always means something.', after='Inside, under the rakes: a purse, and a shark\'s tooth on a cord.',
     gold=80, give=['sharktooth', 1], xp=30)
emit('moral', ch=2, who='dask', map='scriptorium', at=at('scriptorium', 1), gfx='chest',
     text='A locked lectern. The ledger inside is chained to it.',
     line='A chained ledger. Someone wants this read by nobody.',
     q='Dask turns the pages, and stops. "That is my name." It is a list of debts, sold on to Highmoor. His page is near the end.',
     a=['Tear out his page', [['say', 'Dask', '...There. One less copy in the world.'], ['say', 'Maren', 'That is not how debts work, Dask.'], ['say', 'Dask', 'It is how this one works today.']], [['dask', 2], ['maren', -1]]],
     b=['Leave the ledger as it is', [['say', 'Dask', 'Of course. Of course we do.'], ['say', 'Maren', 'We will deal with it properly. Together.']], [['maren', 1], ['dask', -1], ['dask_maren', 1]]])
emit('bless', ch=2, map='mirefen', at=at('mirefen', 2), gfx='waylamp', lit='waylampLit',
     text='A fen way-lamp on a leaning post, its glass green with moss.', after='The lamp catches, and the mist pulls back from it like a held breath.')
emit('rest', ch=2, map='belltower', at=at('belltower', 0), gfx='altar', done='altar',
     text='A salt-crusted altar to the Lamplighter, its lamp drowned in brine.',
     after='Maren wipes the lamp dry with her sleeve and lights it. The tower hums, very faintly.',
     give=['greater', 2], xp=50, pair='dask_maren', lines=[['Dask', '...That was nice. Do not tell anyone I said so.'], ['Maren', 'I will tell everyone.']])
emit('charm', ch=2, map='saltmere', at=at('saltmere', 1), sprite='fisher2', name='Net-mender',
     plea='I do not talk to landsmen. Landsmen talk back.',
     song='A shanty about a landsman who fell in, and was improved by it.', thanks='Hah! Fine. There is a wreck-purse I fished up last spring. No good to me. Go on.',
     give=['pearl', 1], gold=60, xp=30)
emit('choice', ch=2, who='finch', map='tidemill', at=at('tidemill', 0), sprite='lisbet', name='Miller\'s Daughter',
     text='The tide-miller\'s daughter is sawing at a fiddle. It is not going well.',
     q='Finch winces, then brightens. "Runa. An hour. Give me one hour, and she will play a reel."',
     a=['Give him his hour', [['note', 'An hour later, she plays a reel. Badly, but it is a reel. The miller feeds you all.'], ['heal']], [['finch', 2]]],
     b=['We have to keep moving', [['say', 'Finch', '...Right. Of course. The road.'], ['xp', 40]], [['finch', -1]]])
# ---------------- chapter 3 ----------------
emit('cut', ch=3, who='runa', map='cairn1', a=at('cairn1', 0), b=at('cairn1', 1), gfx='rubble',
     text='A collapsed passage between two burial halls, sealed in my grandmother\'s grandmother\'s day.',
     line='My grandmother would have hated this. Good.', after='The old stones give. Cold air moves through from the far hall.',
     through='The old passage between the burial halls.')
emit('contest', ch=3, map='karrow', at=at('karrow', 2), sprite='arn', name='Arn',
     plea='They say Runa of the Ring has gone soft in the south. Arm-wrestle me, and we will see.',
     after='It is a long minute. Then Arn is on the floor, laughing, and half the hall is cheering.',
     give=['wolfcharm', 1], xp=60, pair='dask_finch', lines=[['Dask', 'I bet against you. Sorry.'], ['Finch', 'I bet for you. He owes me eleven gold.'], ['Dask', 'Twelve. I am a man of honour.']])
emit('cache', ch=3, who='dask', map='frostpass', at=at('frostpass', 1), gfx='chest',
     text='A chest frozen into the ice at the foot of a cliff. Its lock is a lump of rime.',
     line='Ice in the lock. Patience, and a little spit.', after='The lid cracks open with a sound like a snapped bone. Inside: furs, coin, and a ward of carved bone.',
     gold=100, give=['frostward', 1], xp=50)
emit('moral', ch=3, who='dask', map='icecaves', at=at('icecaves', 0), gfx='chest',
     text='A Pale Hand dead-drop, wedged into a crack in the ice.',
     line='Pale Hand. They always use the same knot.',
     q='Letters. One names a Karrow clansman who has been selling the passes. Maren and Finch are already arguing about it.',
     a=['Tell the clan', [['say', 'Maren', 'It is the truth. They have a right to it.'], ['say', 'Finch', 'They will hang him, Maren.'], ['xp', 80]], [['maren', 1], ['finch', -1], ['maren_finch', -1]]],
     b=['Keep it quiet', [['say', 'Finch', 'Then we deal with him ourselves. Quietly.'], ['say', 'Maren', 'That is not quiet. That is hiding it.'], ['gold', 60]], [['finch', 1], ['maren', -1], ['maren_finch', -1]]])
emit('bless', ch=3, map='falls', at=at('falls', 0), gfx='waylamp', lit='waylampLit',
     text='A way-lamp on a rock above the falls, its wick frozen stiff.', after='The flame takes, and the spray around it glitters gold.')
emit('rest', ch=3, map='vault3', at=at('vault3', 1), gfx='grave', done='graveOpen',
     text='A clan grave, its rune-stone cracked by frost. Something under it is not resting well.',
     after='Maren puts her hand on the cracked stone and speaks the names on it. The cold in the air eases.',
     give=['potent', 2], xp=70, pair='runa_maren', lines=[['Runa', 'Thank you. They were my people.'], ['Maren', 'They still are.']])
emit('charm', ch=3, map='karrow', at=at('karrow', 3), sprite='shieldmaiden', name='Solveig the Skald',
     plea='A southern bard? In our hall? Sing me something true, or sit down.',
     song='The song Runa\'s mother sang at the Ring, learned from Runa, badly, on the road.', thanks='...That was her song. You sang it wrong, and it was right. Take this. She would want you to.',
     give=['potent', 1], gold=80, xp=50, pair='runa_finch', lines=[['Runa', 'You learned that? From me humming?'], ['Finch', 'You hum a lot, Runa.']])
emit('charm', ch=3, map='watchtower', at=at('watchtower', 0), sprite='clanguard', name='Frozen Sentry',
     plea='Three days on this post. Nobody comes. My feet stopped speaking to me yesterday.',
     song='A marching song, very fast, to stamp along to.', thanks='Ha! Ha! I can feel my toes. Here: the beacon-keeper\'s salts. He will not miss them.',
     give=['salts', 2], gold=60, xp=40)
# ---------------- chapter 4 ----------------
emit('cut', ch=4, who='runa', map='undercroft', a=at('undercroft', 0), b=at('undercroft', 1), gfx='gate',
     text='A rusted iron gate, chained shut. The tunnel beyond it runs toward the far end of the undercroft.',
     line='They should have used a better chain.', after='The chain holds. The hinges do not. The gate goes down with a clang that echoes for a long time.',
     through='The tunnel behind the old gate. It runs through to the far side.')
emit('cut', ch=4, who='dask', map='highmoor', a=at('highmoor', 1), b=at('highmoor', 2), gfx='lockedDoor', open='door',
     text='A locked side-gate into an alley. Highmoor\'s alleys go everywhere the streets do not.',
     line='Every city has back doors. Highmoor has more than most.', after='The lock turns. The alley beyond smells of rain and other people\'s secrets.',
     through='The alley, cutting across the city.')
emit('moral', ch=4, who='dask', map='h_counting', at=at('h_counting', 0), gfx='chest',
     text='A moneylender\'s strongbox, bolted to the floor.',
     line='I know this box. I know whose it is.',
     q='"Orvald Penn," Dask says. "He bought my debt when I was fifteen. Sold it on at twice the price." His picks are very steady.',
     a=['Empty it', [['gold', 200], ['say', 'Dask', 'There. Now it has been paid back. With interest.'], ['say', 'Maren', 'Dask. This is not the same as justice.']], [['dask', 2], ['maren', -2], ['dask_maren', -1]]],
     b=['Leave it', [['say', 'Dask', 'You do not know what he did.'], ['say', 'Runa', 'I know what you would become.'], ['say', 'Maren', 'She is right.']], [['maren', 1], ['dask', -2]]])
emit('rescue', ch=4, map='charnel', at=at('charnel', 2), sprite='acolyte', name='Trapped Acolyte',
     plea='The door! The door is jammed and they are scratching at the other side. Please.',
     after='Runa wrenches the door off its frame and holds it like a shield until the scratching stops.',
     offer='Here. The Abbot\'s elixir. I was told to save it for a miracle. You are close enough.',
     gift=['elixir', 1], pair='runa_maren', lines=[['Maren', 'I will see to his hands.'], ['Runa', 'And then we move.']])
emit('bless', ch=4, map='h_cathedral', at=at('h_cathedral', 0), gfx='lampDead', lit='lamp',
     text='A Warden lamp in a side chapel. The Duke\'s cathedral lets its old lamps die.', after='Maren lights it, and a verger glares, and does not dare put it out.')
emit('rest', ch=4, map='catacombs2', at=at('catacombs2', 1), gfx='grave', done='graveOpen',
     text='A pauper\'s grave, the name scratched off. The bones inside are restless and very tired.',
     after='Maren gives the dead a name: an ordinary one, kindly chosen. The bones lie still.',
     give=['elixir', 1], xp=90, pair='maren_finch', lines=[['Finch', 'What name did you give them?'], ['Maren', 'My mother\'s.']])
emit('choice', ch=4, who='finch', map='printshop', at=at('printshop', 0), sprite='fennick', name='Printer',
     text='The printer has Finch\'s new ballad set in type. All four names are on it, in large letters.',
     q='Dask reads it over Finch\'s shoulder. "Take my name off that. In this city, a name on a broadsheet is a name on a warrant."',
     a=['Keep all four names', [['say', 'Finch', 'It is a ballad about four people, Dask. Not three and a cough.'], ['gold', 120]], [['finch', 1], ['dask', -1], ['dask_finch', -1]]],
     b=['Take Dask\'s name off', [['say', 'Finch', '...Fine. "And one more, who would rather not be named."'], ['say', 'Dask', 'Better. Mysterious. I like it.'], ['gold', 80]], [['dask', 1], ['dask_finch', 1]]])
emit('charm', ch=4, map='highmoor', at=at('highmoor', 3), sprite='cityguard', name='Bored Guard',
     plea='Move along. Nothing to see. There is never anything to see. That is the problem.',
     song='A song about a guard who saw something, once, and regretted it.', thanks='Ha. Here: a ring from the lost-and-found. Nobody has claimed it in a year. Nobody claims anything here.',
     give=['duelistring', 1], gold=60, xp=60)
# ---------------- chapter 5 ----------------
emit('cut', ch=5, who='runa', map='hollow1', a=at('hollow1', 0), b=at('hollow1', 1), gfx='rubble',
     text='A cave-in across a side tunnel, ash still sifting down from the cracks.',
     line='Last one. Probably.', after='Runa clears the fall with her hands and the haft of her axe. The tunnel beyond is clear.',
     through='The side tunnel, cleared. It runs through the hollow.')
emit('rescue', ch=5, map='ashfall', at=at('ashfall', 2), sprite='gorm', name='Camp Smith',
     plea='The anvil came off the cart and the cart came off the road. Six of us could not lift it.',
     after='Runa lifts one end. Then the other. Then she carries it to the forge, and nobody says anything for a while.',
     offer='Take these. Elixirs from the Wardens\' stores. If anyone asks, I made them out of iron.',
     gift=['elixir', 2], pair='runa_finch', lines=[['Finch', 'Six men, Runa. Six. That is going in the ballad.'], ['Runa', 'Make it four. Nobody believes six.']])
emit('cache', ch=5, who='dask', map='ashroad', at=at('ashroad', 1), gfx='chest',
     text='A burnt wagon. Under the charred boards, an iron strongbox, warped by the heat.',
     line='Warped locks are the honest ones. They tell you exactly where to push.', after='Inside: Warden pay, and a stone that is warm to the touch.',
     gold=200, give=['dawnstone', 1], xp=120)
emit('moral', ch=5, who='dask', map='greyhold', at=at('greyhold', 0), gfx='bars',
     text='A Pale Hand deserter in chains, half-starved. "Please. I ran. That is why they chained me."',
     line='I could have those off him in a moment.',
     q='The deserter watches Dask\'s hands. Maren is already reaching for her water-skin.',
     a=['Free him', [['say', 'Maren', 'Go home. Wherever home is now.'], ['say', 'Dask', 'And if he goes home to the Pale Hand?'], ['xp', 150]], [['maren', 1], ['dask', -1]]],
     b=['Leave him for the Wardens', [['say', 'Dask', 'The Wardens can decide. That is their job, not ours.'], ['say', 'Maren', 'He will hang.'], ['gold', 100]], [['dask', 1], ['maren', -1], ['dask_maren', -1]]])
emit('bless', ch=5, map='ashroad', at=at('ashroad', 2), gfx='waylamp', lit='waylampLit',
     text='A roadside shrine-lamp, choked with ash.', after='Maren blows the ash out of the glass and lights it. On the Ashen Road, it is the only light for a mile.')
emit('rest', ch=5, map='lamphall', at=at('lamphall', 0), gfx='grave', done='graveOpen',
     text='The tomb of a Warden who died holding this hall. The lid is cracked, the lamp on it broken.',
     after='Maren mends the lamp with a strip of her own sleeve and lights it. "Rest, brother. We have it from here."',
     give=['elixir', 2], xp=160, pair='dask_maren', lines=[['Dask', 'You tore your sleeve.'], ['Maren', 'It was a good sleeve.'], ['Dask', '...I will steal you a better one.']])
emit('charm', ch=5, map='ashfall', at=at('ashfall', 3), sprite='signe', name='Sleepless Archer',
     plea='Three days. I close my eyes and I see them on the road. I cannot sleep.',
     song='A lullaby from the fens, very slow, about the tide going out.', thanks='...Oh. Oh, I can feel it pulling at me. Take these. I will not need them tonight.',
     give=['tonic', 3], gold=100, xp=100, pair='dask_finch', lines=[['Dask', 'Sing me that one, sometime.'], ['Finch', 'Any time, Dask.']])
emit('charm', ch=5, map='hollow2', at=at('hollow2', 1), sprite='herald', name='The Old Herald',
     plea='I heralded the King, once. Now I herald nobody, in the dark, forever. Do you know any verses I do not?',
     song='The fourth stanza of the Ballad of the Five Lamps, newly finished.', thanks='New words. I have not heard new words in three hundred years. Take my lamp. It is the last thing I own.',
     give=['fivelamps', 1], gold=0, xp=160)

head = '''/* GENERATED by tools/explore.py: two more places per hero per chapter, outside the puzzle dungeons, where their
   exploring ability matters (see the README, "Exploring abilities in the wider world"). Each pays out once:
   cut      Runa breaks through (or Dask unlocks) a way across a big map; both ends then work as a passage.
   cache    a hidden or locked stash: gold, an item, XP.
   moral    Dask can open it, but should he? A choice that moves the companions' trust and friendships.
   choice   the leader's moment turns into a decision the others care about.
   bless    Maren lights a way-lamp: the party starts its next fight Blessed (+2 to attack and saves for 3 rounds).
   rest     Maren lays something to rest: items, XP, and a moment between two of them.
   rescue   Runa lifts, breaks or carries what nobody else can: a gift, and a moment between two of them.
   contest  Runa is challenged by a clansman.
   charm    Finch wins someone over with a song: items, gold, XP, sometimes a moment between two of them.
   Bond names: dask, maren, finch = that companion's trust in Runa; runa_<x> = the same; dask_maren, dask_finch,
   maren_finch = how two companions get on. */
(function () {
  const D = G.D, NAME = { runa: 'Runa', dask: 'Dask', maren: 'Maren', finch: 'Finch' };
  const HINT = { runa: 'Runa could deal with this. Put her in front and use her ability.', dask: 'Dask could deal with this. Put him in front and use his ability.',
    maren: 'Maren could deal with this. Put her in front and use her ability.', finch: 'Finch could deal with this. Put him in front and use his ability.' };
  const bonds = list => (list || []).map(([who, n]) => ['bond', who.replace(/^runa_/, ''), n]);
  const lines = l => (l || []).map(([who, text]) => ['say', who, text]);
  const reward = o => [...(o.gold ? [['gold', o.gold]] : []), ...(o.give ? [['give', o.give[0], o.give[1]]] : []), ...(o.xp ? [['xp', o.xp]] : [])];
  // the first open square beside (x, y): where a passage puts you down
  function beside(map, x, y) {
    const m = D.maps[map], ok = (xx, yy) => { const c = m.rows[yy] && m.rows[yy][xx]; if (!c || (m.things || {})[c]) return false; if (c === '.' || c === ',') return true; const t = (m.legend || {})[c] || D.legend[c]; return !!(t && D.tiles[t] && !D.tiles[t].solid && !D.tiles[t].water); };
    for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) if (ok(x + dx, y + dy)) return { x: x + dx, y: y + dy };
    return { x, y: y + 1 };
  }
  const put = (map, p, def) => D.placeNear(map, null, p[0], p[1], def);
  function cut(o) {
    const f = 'ex.' + o.map + '.cut.' + o.who, who = o.who, open = o.open || 'caveMouth';
    const ia = put(o.map, o.a, { type: 'obj', gfx: o.gfx, gfxIf: [f, open], script: [] }), ib = put(o.map, o.b, { type: 'obj', gfx: open, if: f, script: [] });
    const A = D.maps[o.map].things[ia], Bt = D.maps[o.map].things[ib];
    const rowsA = D.maps[o.map].rows.findIndex(r => r.indexOf(ia) >= 0), colA = D.maps[o.map].rows[rowsA].indexOf(ia);
    const rowsB = D.maps[o.map].rows.findIndex(r => r.indexOf(ib) >= 0), colB = D.maps[o.map].rows[rowsB].indexOf(ib);
    const toB = ['warp', o.map, beside(o.map, colB, rowsB)], toA = ['warp', o.map, beside(o.map, colA, rowsA)];
    A.script = [['if', f, [['note', o.through], toB], [['note', o.text], ['note', HINT[who]]]]];
    A.abil = { who, script: [['if', f, [['note', o.through], toB], [['say', NAME[who], o.line], ['sfx', who === 'dask' ? 'door' : 'hit'], ...(who === 'dask' ? [] : [['shake', 300]]), ['note', o.after], ['set', f], ['xp', 25 * o.ch]]]] };
    Bt.script = [['note', o.through], toA];
  }
  function cache(o) {
    const f = 'ex.' + o.map + '.cache.' + o.who;
    put(o.map, o.at, { type: 'obj', gfx: o.gfx, gfxIf: [f, o.gfx === 'chest' ? 'chestOpen' : o.gfx === 'bars' ? 'rubbleFloor' : 'crate'],
      script: [['if', f, [['note', 'Empty now.']], [['note', o.text], ['note', HINT[o.who]]]]],
      abil: { who: o.who, script: [['if', f, [['say', NAME[o.who], 'Already done.']], [['say', NAME[o.who], o.line], ['sfx', o.who === 'dask' ? 'door' : 'hit'], ['note', o.after], ['set', f], ...reward(o)]]] } });
  }
  function moral(o) {
    const f = 'ex.' + o.map + '.moral';
    put(o.map, o.at, { type: 'obj', gfx: o.gfx, gfxIf: [f, o.gfx === 'chest' ? 'chestOpen' : o.gfx === 'bars' ? 'rubbleFloor' : o.gfx],
      script: [['if', f, [['note', 'Nothing more to do here.']], [['note', o.text], ['note', HINT[o.who]]]]],
      abil: { who: o.who, script: [['if', f, [['note', 'Nothing more to do here.']], [['say', NAME[o.who], o.line], ['sfx', 'door'], ['note', o.q], ['set', f],
        ['choice', null, 'What does Runa say?', [[o.a[0], [...o.a[1], ...bonds(o.a[2])]], [o.b[0], [...o.b[1], ...bonds(o.b[2])]]]], ['xp', 20 * o.ch]]]] } });
  }
  function choice(o) {
    const f = 'ex.' + o.map + '.choice';
    put(o.map, o.at, { type: 'npc', sprite: o.sprite, dir: 'down', name: o.name,
      script: [['if', f, [['note', o.name + ' waves.']], [['note', o.text], ['note', HINT[o.who]]]]],
      abil: { who: o.who, script: [['if', f, [['note', o.name + ' waves.']], [['note', o.q], ['set', f],
        ['choice', null, 'What does Runa say?', [[o.a[0], [...o.a[1], ...bonds(o.a[2])]], [o.b[0], [...o.b[1], ...bonds(o.b[2])]]]]]]] } });
  }
  function bless(o) {
    const f = 'ex.' + o.map + '.bless';
    put(o.map, o.at, { type: 'obj', gfx: o.gfx, gfxIf: [f, o.lit], script: [['if', f, [['note', 'The lamp burns, small and steady.']], [['note', o.text], ['note', HINT.maren]]]],
      abil: { who: 'maren', script: [['if', f, [['say', 'Maren', 'It is lit.']], [['say', 'Maren', 'Lamplighter, here is one of yours.'], ['sfx', 'heal'], ['note', o.after], ['set', f], ['set', 'blessNext', 1],
        ['note', 'Its light stays with you. (The party starts its next fight Blessed.)'], ['xp', 20 * o.ch]]]] } });
  }
  function rest(o) {
    const f = 'ex.' + o.map + '.rest';
    put(o.map, o.at, { type: 'obj', gfx: o.gfx, gfxIf: [f, o.done], script: [['if', f, [['note', 'It is quiet now.']], [['note', o.text], ['note', HINT.maren]]]],
      abil: { who: 'maren', script: [['if', f, [['say', 'Maren', 'It is at rest.']], [['sfx', 'heal'], ['note', o.after], ['set', f], ...reward(o), ...lines(o.lines), ...(o.pair ? [['bond', o.pair.replace(/^runa_/, ''), 1]] : [])]]] } });
  }
  function rescue(o) {
    const f = 'ex.' + o.map + '.rescue';
    put(o.map, o.at, { type: 'npc', sprite: o.sprite, dir: 'down', name: o.name, script: [['if', f, [['say', o.name, 'Thank you. Again.']], [['say', o.name, o.plea], ['note', HINT.runa]]]],
      abil: { who: 'runa', script: [['if', f, [['say', o.name, 'Thank you. Again.']], [['say', 'Runa', 'Let me.'], ['sfx', 'hit'], ['shake', 250], ['note', o.after], ['set', f], ['say', o.name, o.offer], ['xp', 30 * o.ch],
        ...(o.gift ? [['give', o.gift[0], o.gift[1]]] : []),
        ...(o.take ? [['choice', null, 'What does Runa say?', [[o.take[0], [['gold', o.take[1]], ['say', NAME[o.take[2]], o.take[4]], ['say', NAME[o.take[3]], o.take[5]], ['bond', o.take[2], 1], ['bond', o.take[3], -1]]],
          [o.refuse[0], [['say', NAME[o.refuse[1]], o.refuse[3]], ['say', NAME[o.refuse[2]], o.refuse[4]], ['bond', o.refuse[1], 1], ['bond', o.refuse[2], -1]]]]]] : []),
        ...lines(o.lines), ...(o.pair ? [['bond', o.pair.replace(/^runa_/, ''), 1]] : [])]]] } });
  }
  function contest(o) {
    const f = 'ex.' + o.map + '.contest';
    put(o.map, o.at, { type: 'npc', sprite: o.sprite, dir: 'down', name: o.name, script: [['if', f, [['say', o.name, 'Again next winter, Runa.']], [['say', o.name, o.plea], ['note', HINT.runa]]]],
      abil: { who: 'runa', script: [['if', f, [['say', o.name, 'Again next winter, Runa.']], [['say', 'Runa', 'Sit.'], ['sfx', 'hit'], ['note', o.after], ['set', f], ...reward(o), ...lines(o.lines), ...(o.pair ? [['bond', o.pair.replace(/^runa_/, ''), 1]] : [])]]] } });
  }
  function charm(o) {
    const f = 'ex.' + o.map + '.charm.' + o.sprite;
    put(o.map, o.at, { type: 'npc', sprite: o.sprite, dir: 'down', name: o.name, script: [['if', f, [['say', o.name, o.thanks]], [['say', o.name, o.plea], ['note', HINT.finch]]]],
      abil: { who: 'finch', script: [['if', f, [['say', o.name, o.thanks]], [['say', 'Finch', o.song], ['sfx', 'good'], ['note', 'Finch plays. Bit by bit, the frown comes undone.'], ['say', o.name, o.thanks], ['set', f], ...reward(o),
        ...lines(o.lines), ...(o.pair ? [['bond', o.pair.replace(/^runa_/, ''), 1]] : [])]]] } });
  }
'''
open(os.path.join(ROOT, 'data', 'ch9_world', 'k_explore.js'), 'w').write(head + '\n'.join(out) + '\n})();\n')
print(len(out), 'spots written')
