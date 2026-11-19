/* Biographies (Journal -> Biographies): the four heroes, and the people of note met along the way, friend and foe.
   A person appears once you have met them: they have spoken to you (the flag met.<speaker>, set by every line of
   dialogue), or a story flag in `seen` says you have crossed paths. Each paragraph is [condition, text], and shows
   only once its condition holds, so a biography grows as the story does and never gives away what is still ahead.
   `name` can be a list of [condition, name] (the first that holds wins); `hide` takes an entry out (when two turn out
   to be the same person). `sprite` is the figure the portrait is cut from. */
(function () {
  const D = G.D;
  D.bios = [
    /* ---------- the party ---------- */
    { id: 'runa', group: 'The party', name: 'Runa Stonehand', title: 'Barbarian, of the northern hill clans', sprite: 'runa', always: true, paras: [
      ['', 'A woman of the hill clans of the far north, who walks the valley with a woodcutter\'s axe and very few words. Blunt, dry and loyal, she would sooner shift a boulder than argue about it, and she stands at the front of every fight so the others do not have to.'],
      ['', 'What she wants: a hall in the northern hills with her name cut over the door. And an old debt paid.'],
      ['chapter>=3', 'At sixteen she swore the Oath of Stone: seven winters keeping the watch on the Giant\'s Cairn above Karrow Hold. In her second winter an avalanche buried a hunting party in the Frost Pass, her cousin Bryn among them, and Runa left her post to dig them out. That night the Cairn lamp guttered, the Cairn\'s dead walked, and old Warden Hallvard died holding the door. She saved Bryn, broke her oath, and was gone before the clan could name the price.'],
      ['runaOath', 'Eleven years later she went home, and answered for it before her clan.'],
      ['runaOath=1', 'She stood in the Ring against Bryn, who had waited eleven years for it. Afterwards Bryn told her the only anger had ever been that she left before anyone could thank her.'],
      ['runaOath=2', 'The clan took the stone-price for the broken oath, in gold. It did not have to like it.'],
      ['runaOath=3', 'Finch argued her case: she had kept the oath that night, only in the wrong place. The clan agreed, and called her niece again.'],
      ['runaOath=4', 'She swore the oath again: five winters on the Cairn once the crown is broken for good. Sigrid gave her back the pebble she left on the Cairn step the night she ran.'],
    ] },
    { id: 'dask', group: 'The party', name: 'Dask Underbough', title: 'Rogue, a halfling of Highmoor', sprite: 'dask', always: true, paras: [
      ['', 'A halfling with quick hands, a wry mouth and a running total in his head of what everything costs. He walks soft, never stands where a blow is coming, and is at his deadliest when a friend already has the enemy busy. Locks, traps and pockets are all much the same to him.'],
      ['', 'What he wants: a vault in Highmoor with a door that only opens for him. And not one copper owed to anybody.'],
      ['daskDebt|chapter>=4', 'He owes money to the wrong people in Highmoor: the counting-house of Orrin and Sons, which does not forget a debt and does not forgive one either.'],
      ['confide.dask|met.Wren', 'It was never his debt to start with. It was his sister Wren\'s, and he signed it over to himself so she could get clear of it.'],
      ['dask4=1', 'In Highmoor, Orrin forgave the debt in front of the whole court, and Dask took the gift.'],
      ['dask4=2', 'In Highmoor, Orrin offered to forgive the debt in front of the whole court. Dask paid it himself instead, every copper, so that nobody would own the forgiving.'],
      ['dask4=3', 'In Highmoor, Orrin offered to forgive the debt in front of the whole court. Dask read Orrin\'s own ledger aloud to the court instead.'],
      ['dask4=4', 'In Highmoor, Orrin offered to forgive the debt in front of the whole court. Dask walked out.'],
      ['wrenFree', 'He burned the counting-house\'s debt-papers, his own and everyone else\'s.'],
    ] },
    { id: 'maren', group: 'The party', name: 'Maren Vale', title: 'Cleric, a Warden of the Lamp', sprite: 'maren', always: true, paras: [
      ['', 'A Warden of the Lamp, older than the rest of the party and twice as patient. She heals, she blesses, and she burns the restless dead, and she carries a lantern she has never once let go out. The chapter house sent her down the valley to learn why the ward-lamps are failing.'],
      ['', 'What she wants: a lamp she lit herself, that keeps somebody safe long after she is gone.'],
      ['met.Veyra', 'Sister Veyra, who leads the Pale Hand\'s diggers, was her pupil, the best she ever taught. Maren blames herself.'],
      ['veyra5=1&!ending=3', 'In the end, Veyra came back to the Lamp. Maren was there when she did.'],
      ['ending=3', 'In the end, Veyra broke the crown herself, and was gone in the light. Maren called her the best of them.'],
      ['veyra5=2|veyra5=3', 'Maren has promised to speak at Veyra\'s judgement. Every word.'],
    ] },
    { id: 'finch', group: 'The party', name: 'Finch Tallowmere', title: 'Bard', sprite: 'finch', always: true, paras: [
      ['', 'A bard with a plumed hat, a shortbow and a lute, theatrical and generous and never quite serious. He fights with songs: songs to sleep, songs to courage, songs that drain the fight out of an enemy. He knows every old ballad in the valley, and most of the rude ones.'],
      ['', 'What he wants: the fifth verse of the Five Lamps. Nobody alive knows how the old song ends. He means to find out.'],
      ['verse1', 'He has been gathering the lost stanzas of the ballad from the places the old Wardens hid them, one a chapter.'],
      ['met.Ennet', 'At the bottom of the Hollow Barrow he learned why the song had always mattered to him. The Fifth Lamp, who held the King\'s last door for three hundred years, was Ennet Tallowmere: his own family, his grandmother\'s great-aunt.'],
      ['ending=1', 'He sang the fifth stanza himself, in the lamplight, and the crown came apart.'],
      ['ending=2', 'He finished the song for her.'],
    ] },

    /* ---------- friends ---------- */
    { id: 'halda', group: 'Friends', name: 'Reeve Halda', title: 'Reeve of Brackenford', meet: ['Halda'], seen: 'chapter>=2', paras: [
      ['', 'The reeve of Brackenford, the river town at the head of Mornvale. Practical, short of money and shorter of patience, she hired the party to deal with the goblins robbing graves out of the Thane\'s Barrow, and paid what she had agreed, which in Brackenford counts as a kindness.'],
    ] },
    { id: 'tobias', group: 'Friends', name: 'Warden Tobias', title: 'Warden of Brackenford', meet: ['Tobias'], seen: 'chapter>=2', paras: [
      ['', 'Brackenford\'s Warden, keeper of its temple and its lamp. He felt the Thane\'s lamp go out from across the valley, like a hand lifting from his shoulder, and wrote to the chapter house for help. Maren was the answer to his letters.'],
      ['shardAt=1', 'The party left the Thane\'s shard in his keeping, under Brackenford\'s lamp.'],
      ['shard1Stolen', 'The Pale Hand came for it, and took it.'],
    ] },
    { id: 'ingrid', group: 'Friends', name: 'Ingrid', title: 'Smith of Brackenford', meet: ['Ingrid'], paras: [
      ['', 'Brackenford\'s smith: broad in the shoulder, short in speech, and handy with a hammer in more ways than one. The party took a punch meant for her the night they arrived, and she has not forgotten it.'],
    ] },
    { id: 'quill', group: 'Friends', name: 'Harbourmaster Quill', title: 'Harbourmaster of Saltmere', meet: ['Harbourmaster Quill'], paras: [
      ['', 'Saltmere\'s harbourmaster: anxious, fussy, and fond of a brandy that may not have paid its duty. He hired the party to cross the Mirefen and learn what is happening at the Drowned Abbey, where the fishermen have been disappearing.'],
    ] },
    { id: 'ysolde', group: 'Friends', name: 'Sister Ysolde', title: 'Warden of Saltmere', meet: ['Sister Ysolde', 'Ysolde'], paras: [
      ['', 'The Warden of Saltmere\'s little chapel, who keeps the names of the drowned. Veyra knelt in that chapel eleven days before the party came, and Ysolde did not see what she was until she was gone.'],
    ] },
    { id: 'brine', group: 'Friends', name: 'Mother Brine', title: 'Of the Mirefen', meet: ['Mother Brine'], paras: [
      ['', 'A marsh-witch, or a very old woman who lives alone in the drowned village with a great many frogs. Tea is always on. She knows the fen\'s secrets, and trades them for kindness, or for the return of a stolen kettle.'],
    ] },
    { id: 'sigrid', group: 'Friends', name: 'Chief Sigrid Stonehand', title: 'Chief of Karrow Hold, Runa\'s aunt', meet: ['Sigrid'], paras: [
      ['', 'Chief of Karrow Hold, where Runa\'s clan keeps the Giant\'s Cairn, and Runa\'s aunt. Hard as the Hold\'s own walls, and fair with it. The clan waited eleven years for Runa to come home and answer, and Sigrid was the one who kept them waiting.'],
    ] },
    { id: 'bryn', group: 'Friends', name: 'Bryn', title: 'Hunter of Karrow Hold, Runa\'s cousin', meet: ['Bryn'], paras: [
      ['', 'Runa\'s cousin, a hunter of Karrow Hold. Eleven years ago an avalanche buried Bryn\'s hunting party in the Frost Pass, and Runa broke her oath to dig them out.'],
      ['brynAlly', 'When the party went up to the Cairn, Bryn came too, and did not take no for an answer.'],
    ] },
    { id: 'kell', group: 'Friends', name: 'Warden Kell', title: 'Warden of the Giant\'s Cairn', meet: ['Warden Kell'], paras: [
      ['', 'The Warden of the Giant\'s Cairn, who went up the pass to learn why the Cairn lamp was failing and did not come back.'],
      ['kellDead', 'The party found him dying in the Hall of Oaths. Someone with a key to the Cairn had fed its lamp grey oil for a year, a little at a time. His last report went to the Wardens in the party\'s hands. The Cairn was kept.'],
    ] },
    { id: 'eydis', group: 'Friends', name: 'Eydis', title: 'Huntress of the Frost Pass', meet: ['Eydis'], paras: [
      ['', 'A huntress of the Frost Pass, who pays her debts and expects others to. She knows the pass, its caves and its white bear better than anyone living.'],
    ] },
    { id: 'aldric', group: 'Friends', name: 'Duke Aldric', title: 'Duke of Highmoor', meet: ['Duke Aldric'], paras: [
      ['', 'Duke of Highmoor, and lord of the whole valley: frail, gracious, and a little greyer at the lips every day. He feasted the party as heroes.'],
      ['dukeCured', 'Grey oil, in his breakfast, every morning for years, served by his own chancellor\'s hand. Cured, he rode to war with the party.'],
      ['dukeDead', 'He did not live to see his chancellor answer for it.'],
    ] },
    { id: 'oriel', group: 'Friends', name: 'High Warden Oriel', title: 'High Warden of the Lamp', meet: ['High Warden Oriel'], paras: [
      ['', 'The head of the Wardens of the Lamp, in Highmoor\'s cathedral, and the one person in the order Maren has never once been able to surprise.'],
      ['knowsChancellery', 'With Kell\'s report in hand, she saw it: the Chancellery supplies the oil for every ward-lamp in the valley.'],
      ['muster', 'She led the Wardens to Ashfall, and sent the party down the Ashen Road to bring them all home.'],
    ] },
    { id: 'wren', group: 'Friends', name: 'Wren', title: 'Dask\'s sister, a clerk at Orrin and Sons', meet: ['Wren'], paras: [
      ['', 'Dask\'s sister, who clerks at Orrin and Sons, the counting-house that holds half of Highmoor\'s debts, and once held hers. She knows where the vault keys hang.'],
      ['wrenFree', 'When the debt-papers burned, hers went up with the rest. She keeps waking up and not owing anybody anything, and finds she likes it.'],
      ['wrenFree&chapter>=5', 'She went with the Wardens to Ashfall, and keeps the camp\'s books. Family discount, for Dask. Nobody is to know.'],
    ] },
    { id: 'ennet', group: 'Friends', name: [['met.Ennet', 'Ennet Tallowmere'], ['', 'The Fifth Lamp']], title: 'The Fifth Lamp', meet: ['Ennet'], paras: [
      ['', 'The fifth of the Five Lamps, whose name the old songs never kept. When the others carried the shards away, someone had to stay and hold the King\'s last door. She has held it for three hundred years.'],
      ['ending=1', 'Finch sang the fifth stanza, the crown came apart in the light, and nobody burned. She walked out into the morning, not alone.'],
      ['ending=2', 'She broke the crown herself, and went home at last.'],
      ['ending=3', 'Veyra broke the crown in her place. Ennet walked out of the Barrow into the sun, and wept.'],
    ] },

    { id: 'asta', group: 'Friends', name: 'Asta', title: 'Dog-handler of Karrow Hold', sprite: 'asta', meet: ['Asta'], paras: [
      ['', 'Karrow Hold\'s keeper of sled-dogs, who was there the winter Runa ran, and who was the first to open her door when Runa came back.'],
      ['astaTalk', 'Old Warden Hallvard told her, the night before he died, that the girl did right. She has been waiting eleven years to say so.'],
      ['grimDone', 'Her stolen dog harnesses came home from Grimtusk\'s den, with the party.'],
    ] },
    { id: 'hale', group: 'Friends', name: 'Captain Hale', title: 'Captain of the Ducal Guard', sprite: 'captain5', meet: ['Captain Hale'], paras: [
      ['', 'Captain of Duke Aldric\'s guard, who brought it down the Ashen Road with the Duke\'s apologies and a great deal of language he would not repeat, and held the canyon flank at Ashfall.'],
    ] },

    /* ---------- neither, or both ---------- */
    { id: 'grukk', group: 'In between', name: 'Grukk Gravepicker', title: 'Goblin chief', sprite: 'grukk', meet: ['Grukk'], seen: 'grukk', paras: [
      ['', 'Chief of the goblin warren that moved into the Thane\'s Barrow, wearing the old Thane\'s helm, and robbing graves for someone in grey who paid him well.'],
      ['grukk=1', 'Told the truth about the grey lady, he turned on her and led his warren out of the hills.'],
      ['grukk=2', 'Paid to go, he went, warren and all.'],
      ['grukk=3', 'He died in the barrow.'],
      ['grukk=3&met.Nagra', 'His sister Nagra has not forgotten.'],
      ['grukk3=1', 'In the north, his goblins opened a tunnel under the ridge for the party, and owed nothing after.'],
    ] },
    { id: 'snik', group: 'In between', name: 'Snik', title: [['snikMet', 'Goblin, eel-seller'], ['', 'Goblin lookout']], meet: ['Snik'], paras: [
      ['', 'One of Grukk\'s goblins, small even for a goblin, and much keener on living than on fighting.'],
      ['snik=1', 'The party let him go, and he told them what he knew of the barrow on his way out.'],
      ['snikMet', 'He went south, like they told him, and sells eels on the Saltmere boardwalk now. Honest work. Mostly. He paid them back with what he had seen in the fen.'],
    ] },
    { id: 'nagra', group: 'In between', name: 'Nagra', title: 'Goblin chief, Grukk\'s sister', meet: ['Nagra'], paras: [
      ['', 'Grukk\'s sister, and chief of the warren after him. She holds the hills under the Cairn road, and she remembers who killed her brother.'],
    ] },
    { id: 'orrin', group: 'In between', name: 'Orrin', title: 'Of Orrin and Sons, bankers', meet: ['Orrin'], paras: [
      ['', 'The head of Orrin and Sons, Highmoor\'s great counting-house, which lends to everyone and is owed by most. Dask among them.'],
      ['corrKnown', 'The counting-house was the Pale Hand\'s purse all along: a receipt for the barrow key, stamped brandy barrels, a letter to the rime-priests, the Chancellery\'s ledgers. Orrin says he only kept the books.'],
    ] },
    { id: 'brannoc', group: 'In between', name: 'Brannoc Vosk', title: 'Head of the Vosks', meet: ['Brannoc'], paras: [
      ['', 'The head of the Vosks, a family of hard men who will do most things for money and the rest for more. The Pale Hand pays well, and Brannoc does not ask why.'],
    ] },

    /* ---------- the dead ---------- */
    { id: 'watcher', group: 'The dead', name: 'The Last Watcher', title: 'Of the Watchtower of the Fifth Lamp', sprite: 'watcher', meet: ['The Last Watcher'], paras: [
      ['', 'A Warden of the old north watchtower, still standing his watch three hundred years after the Lamp he served went down to keep the King\'s door. Nobody ever came to relieve him.'],
      ['verse2', 'Finch sang him her stanza, and he knew his watch was done.'],
    ] },
    { id: 'hollowwarden', group: 'The dead', name: 'The Hollow Warden', title: 'The first High Warden', sprite: 'hollowwarden', meet: ['The Hollow Warden'], paras: [
      ['', 'The first High Warden of the Lamp, laid in the tombs under Highmoor. Three hundred years ago the fifth Lamp took the key into the dark and asked him to wall up the last door behind her, and he did. He has lain listening for her knock ever since.'],
      ['verse3', 'When Finch sang him the third stanza, he learned she was holding it still, and could rest.'],
    ] },
    { id: 'hallvard', group: 'The dead', name: 'Hallvard', title: 'Warden of the Giant\'s Cairn, long ago', sprite: 'kell', meet: ['Hallvard'], paras: [
      ['', 'The old Warden of the Giant\'s Cairn, who held its door the night Runa left her post, and died holding it. In the mirror under the Ashen Road he was as he had been that night, and did not blame her. He chose the door; she chose Bryn; they were both right.'],
    ] },
    { id: 'odric', group: 'The dead', name: 'Odric', title: 'Veyra\'s brother', sprite: 'fisher2', meet: ['Odric'], paras: [
      ['', 'Sister Veyra\'s brother, drowned in the Mirefen. In the mirror under the Ashen Road he found Maren, his sister\'s teacher, and gave her his lamp and a message: it was never Veyra\'s fault. Come home. Light a lamp for him, and then stop.'],
    ] },
    { id: 'grandmother', group: 'The dead', name: 'Finch\'s grandmother', title: 'Who taught him the Five Lamps', sprite: 'hrolf', meet: ['Grandmother'], paras: [
      ['', 'The woman who first sang Finch the ballad of the Five Lamps, and never sang him the fifth verse, because it had no ending. In the mirror under the Ashen Road she told him to write one. A good one. And to sing it loud, so Ennet hears it.'],
    ] },

    /* ---------- foes ---------- */
    { id: 'veyra', group: 'Foes', name: 'Sister Veyra', title: 'The Ashen Sister', meet: ['Veyra'], paras: [
      ['', 'Once a Warden of the Lamp and Maren\'s best pupil; now the Ashen Sister, the face of the Pale Hand. Sincere, tired of burying people, and certain she is right. The Hand believes that when the Barrow King returns, death itself will end.'],
      ['knowsBrother', 'Her brother Odric drowned in the Mirefen. His grave is there.'],
      ['veyraDoubt', 'For the first time, at the Drowned Abbey, she began to doubt.'],
      ['veyraTurning', 'At the Giant\'s Cairn she stood with the party against what she had woken.'],
      ['veyra5=1&!ending=3', 'In the end she came back to the Lamp, and stood with Maren at the last door.'],
      ['ending=3', 'In the end she lifted the crown herself and broke it, and was gone in the light: one lamp lit, after two put out.'],
      ['veyra5=2', 'In the end she stayed behind with the Wardens, to face judgement when it was over.'],
      ['veyra5=3', 'In the end she stood with Corr at the last door, and fell with him. She lived, and the Wardens took her home to face judgement.'],
    ] },
    { id: 'hooded', group: 'Foes', name: 'The Hooded Man', title: 'Of the Pale Hand', meet: ['Hooded Man'], hide: 'corrKnown', paras: [
      ['', 'The man behind Veyra: a voice in a grey hood that gives the Pale Hand its orders. Nobody the party has met will say who he is.'],
    ] },
    { id: 'corr', group: 'Foes', name: 'Chancellor Ilvane Corr', title: [['corrKnown', 'The Pale Hand'], ['', 'Chancellor of Highmoor']], sprite: 'corr', meet: ['Ilvane Corr'], paras: [
      ['', 'The Duke\'s chancellor, who keeps Highmoor\'s accounts and its Duke\'s confidence: charming, patient, and always the most reasonable man in the room.'],
      ['corrKnown', 'He was the Hooded Man, and the Pale Hand\'s true master. He fed the Duke grey oil, bought the Wardens\' lamp-oil and poisoned it, and paid for every shard the Hand dug up. He never wanted death to end. He wanted the crown.'],
      ['corrTaken', 'He was taken in chains at the last door.'],
    ] },
    { id: 'king', group: 'Foes', name: [['doorOpen|met.Vael Morn', 'Vael Morn, the Barrow King'], ['', 'The Barrow King']], title: 'The deathless king', sprite: 'king', always: true, paras: [
      ['', 'Three hundred years ago a king of the valley bound his soul to his crown so that he would never die, and ruled on as a hollow, deathless thing. The Five Lamps broke his crown into five shards and buried them under ward-lamps that never go out. He still wears the fifth.'],
      ['doorOpen|met.Vael Morn', 'His name was Vael Morn. The valley of Mornvale still carries it.'],
      ['kingDown', 'He rose one last time in the Hollow Barrow, and fell.'],
    ] },
    { id: 'hask', group: 'Foes', name: 'Warden Hask', title: 'A Warden gone over to the Hand', meet: ['Warden Hask'], paras: [
      ['', 'A Warden of the Lamp who went over to the Pale Hand, and kept the drowned fishermen of Saltmere tied in the Abbey for the rising tide.'],
    ] },
    { id: 'coll', group: 'Foes', name: 'Brother Coll', title: 'Preacher of the Pale Hand', meet: ['Brother Coll'], paras: [
      ['', 'A preacher of the Pale Hand who works Saltmere\'s grieving: the sea gives back what it takes, he tells them, and the drowned will all come home.'],
    ] },
    { id: 'prior', group: 'Foes', name: 'The Drowned Prior', title: 'Keeper of the Abbey', meet: ['The Drowned Prior'], paras: [
      ['', 'He kept the Abbey\'s tomb door for a hundred years, under the water and under the lamp. When the shard was taken and the lamp went cold, he rose, and he was so very thirsty.'],
    ] },
    { id: 'hesk', group: 'Foes', name: 'Rime-Mother Hesk', title: 'Of the rime-priests', meet: ['Rime-Mother Hesk'], paras: [
      ['', 'A rime-priest of the north, in league with the Pale Hand. She knew Veyra, and liked to tell Maren so.'],
    ] },
    { id: 'hrimgar', group: 'Foes', name: 'Hrimgar', title: 'The Sleeping Giant', seen: 'giant', paras: [
      ['', 'The giant laid to rest under the Giant\'s Cairn, who woke when the Cairn lamp died.'],
      ['giant=1', 'Finch sang him the old words and Maren said the rite under them, and he gave up the shard and slept. The Cairn lamp burns again.'],
      ['giant=2', 'The party took the heart-stone that kept him alive. He did not fight it.'],
    ] },
    { id: 'marshal', group: 'Foes', name: 'The Ash-Marshal', title: 'Of the Pale Hand\'s host', meet: ['The Ash-Marshal'], paras: [
      ['', 'Commander of the Pale Hand\'s host on the Ashen Road, who held the way to the Hollow Barrow, and would sooner fight than wait.'],
    ] },
    { id: 'skrit', group: 'Foes', name: 'Skrit', title: 'Goblin hexer', sprite: 'hexer', meet: ['Skrit'], paras: [
      ['', 'A goblin hexer in a grey hood, set at Grukk\'s elbow by the grey lady to keep an eye on him and his diggers. He never dug.'],
      ['grukk=1|grukk=2', 'Under the hood he wore a collar of grey cloth stitched with a pale open hand. He did not leave the barrow.'],
    ] },
    { id: 'snagtooth', group: 'Foes', name: 'Snagtooth', title: 'Goblin toll-taker', sprite: 'snagtooth', meet: ['Snagtooth'], paras: [
      ['', 'A goblin who set himself up on the Thane\'s road taking tolls for the road, the bridge and breathing, and took Teague\'s mill, dog and good hat while he was at it.'],
      ['millReceipt', 'He held the Thane\'s seal-key, sold to him by someone in Highmoor for forty marks. The receipt was stamped Orrin and Sons.'],
    ] },
    { id: 'longsal', group: 'Foes', name: 'Long Sal', title: 'Smuggler of the Mirefen', sprite: 'longsal', meet: ['Long Sal'], paras: [
      ['', 'Queen of the Mirefen smugglers, who robbed the fen parishes and sold what she took, brandy included. Harbourmaster Quill, she said, was one of her buyers.'],
      ['salDone', 'Her ledger named every buyer. The biggest by far was a grey-sealed account in Highmoor.'],
    ] },
    { id: 'grimtusk', group: 'Foes', name: 'Grimtusk', title: 'Goblin raider of the Frost Pass', sprite: 'grimtusk', meet: ['Grimtusk'], paras: [
      ['', 'A goblin raider who sat on a throne of stolen sledges in a den off the Frost Pass, stacked with Karrow\'s furs, fish and iron. Nagra\'s friend, and as he said himself, Nagra talks too much.'],
    ] },
    { id: 'quell', group: 'Foes', name: 'Mistress Quell', title: 'Forger of Highmoor', sprite: 'quell', meet: ['Mistress Quell'], paras: [
      ['', 'A forger with a press in Highmoor, printing Ducal notes that were perfect except for a tiny grey hand in the watermark. She kept a debt-book, and Dask\'s name was in it.'],
      ['daskDebtBurned', 'Runa smashed her plates. Dask burned his page in the lamp.'],
    ] },
    { id: 'vell', group: 'Foes', name: 'Inquisitor Vell', title: 'Of the Pale Hand', sprite: 'inquisitor', meet: ['Inquisitor Vell'], paras: [
      ['', 'An inquisitor of the Pale Hand who kept a book of names and wrote everyone\'s in it, and served a master he called patient. He waited for the party in the Chancellery.'],
      ['vellDone', 'The last page of his book had four names on it, in neat small letters: RUNA. DASK. MAREN. FINCH. Under them, a grey hand.'],
    ] },
    { id: 'ilsabet', group: 'Foes', name: 'Knight-Captain Ilsabet', title: 'Of the Pale Hand\'s host', sprite: 'ilsabet', meet: ['Knight-Captain Ilsabet'], paras: [
      ['', 'A knight-captain of the Pale Hand\'s host on the Ashen Road, sworn to the Hand at fifteen. She trained Sergeant Mott, and hunted him when he deserted.'],
      ['q.deserters5>=2', 'Beaten, she knelt in the ash and gave up her sword. She was done swearing.'],
    ] },
  ];
})();
