/* Hand-picked expressions for the story's big moments. A line whose text begins with one of these (or equals it, for
   short ones) shows that face; 'usual' keeps the speaker's normal face where the word-guess in UI.mood would be wrong.
   Lines not listed here still fall back to UI.mood. */
(function () {
  const L = [
    // the brawl and the barrow
    ['OUT! All three of you!', 'angry'], ['You have no idea who you just crossed.', 'angry'], ['I leave a notice on the board for one morning', 'angry'],
    ['A real adventure, friends.', 'happy'], ['The road to Saltmere is open.', 'happy'], ['If you are ever back this way, there is a stool', 'happy'],
    ['Are you going to fight a dragon?', 'happy'], ['I asked her to come home. I meant it.', 'sad'], ['I told her there was no coming back.', 'sad'],
    ['Chapter one of the ballad, done.', 'happy'], ['She asked me to come home.', 'sad'],
    // Veyra at Brackenford
    ['Veyra. I hoped Tobias was wrong.', 'sad'], ['Veyra. It was you. You put out the lamp.', 'angry'], ['I put out a lie.', 'angry'],
    ["...Don't. Don't be kind to me.", 'sad'], ['You put out a ward-lamp, and the dead', 'angry'], ['No more graves, Maren. Not one.', 'sad'],
    ['(Under his breath.) More than one.', 'worried'], ['Well. Every ballad needs a villain', 'happy'],
    // the first camp
    ["...That is terrible arithmetic, Stonehand. I'll take it.", 'happy'], ['I keep trying to remember the day she changed', 'sad'],
    ['I taught her that death is a door', 'sad'], ['I want to believe that more than is wise', 'worried'],
    ['I have been trying to rhyme "Gravepicker"', 'happy'], ['"We." Oh, that is going in.', 'happy'],
    // Saltmere
    ["Jory Fenn walked into his mother's kitchen", 'happy'], ['...All six. I see.', 'sad'], ['You stopped it, though. No more will go.', 'sad'],
    ['Whatever you paid for them, I will not ask.', 'sad'], ['And the Abbey lamp is burning.', 'happy'],
    ['I struck her, Runa.', 'sad'], ['Every time I see her she is further away.', 'sad'], ['I know. That is the part I cannot bear.', 'sad'],
    ['I will. And then I will have to sing it', 'worried'], ['You killed it! You killed Old Snapjaw!', 'happy'],
    // the oath and the Cairn
    ['The clan takes the price. The clan does not have to like it.', 'angry'], ['...Two hundred. And I will remember your face', 'angry'],
    ['...The clan has heard. The oath is answered. Welcome home, niece.', 'happy'], ['Pretty words, singer.', 'angry'],
    ['I broke the Oath of Stone.', 'sad'], ['Runa...', 'worried'], ['You... you killed it. Lamplighter.', 'happy'],
    ['Stay back, all of you. The shard is mine', 'angry'], ['Veyra, please. Look at what is waking.', 'worried'], ['I see it. I see you, too. No.', 'angry'],
    ['...Her song. That is her song.', 'happy'], ['Hush now, old one.', 'sad'], ['...Not her song. But kind.', 'sad'],
    ['Hush now... ah. I do not know her words.', 'sad'], ['I swore to keep him. ...Do it. He is suffering.', 'sad'], ['Do it quickly.', 'sad'],
    ['The lamp will not take.', 'sad'], ['He held the Cairn to the end, Chief.', 'sad'], ['Then it was.', 'sad'],
    ['Like a baby. A baby the size of a barn.', 'happy'], ['You let my prisoner walk, Warden.', 'angry'],
    ["A man at the Duke's court, paying Orrin", 'angry'], ["Orrin and Sons keeps the Pale Hand's books.", 'angry'],
    ['You told me she could still be turned.', 'worried'], ['You said we would find the ending.', 'happy'], ['You said some songs end badly.', 'worried'],
    ['Together. And out again.', 'happy'],
    // Highmoor
    ['Master Orrin. I am... speechless.', 'happy'], ['My lord? My lord, you cannot...', 'worried'], ["(Quietly, to Runa.) Look at the Duke's lips.", 'worried'],
    ['Your Grace! Riders from Brackenford.', 'worried'], ['Tobias...', 'worried'], ['I owe you a knife.', 'angry'], ['You want it for yourself.', 'angry'],
    ['Corr!', 'angry'], ['Corr. The Chancellor himself.', 'angry'], ['Duke Aldric rose from his bed', 'happy'],
    ['And somebody burned every debt-paper', 'happy'], ['And every debt-paper in Highmoor has vanished.', 'worried'],
    ['Go, Maren. Do not look back at me. Win.', 'sad'], ['Veyra. I told them where you were. It was the law.', 'sad'],
    ['I know. You always did keep your vows.', 'sad'], ['Then I will be here. Come back, Maren.', 'sad'],
    ['Wren hugged me.', 'happy'], ['Wren will not speak to me.', 'sad'], ['I told the Wardens where she was.', 'sad'],
    ['She came, Runa. She came down that stair', 'happy'], ['Twenty years of grey oil. Every lamp I ever trimmed.', 'angry'],
    ['That would make a very good last verse.', 'happy'],
    // the door and the end
    ['Corr. You told me it would end graves. You lied.', 'angry'], ['Debt collected.', 'happy'], ['My lord! A song for the new king', 'happy'],
    ['You know what I keep thinking? Five years ago', 'happy'], ['Wren wrote. She says if I die', 'happy'],
    ['Twenty years I have kept lamps. Tomorrow', 'worried'], ['I keep looking for her at the fires.', 'sad'], ['Four stanzas. Five lamps. One door.', 'worried'],
    ['You made it. Good. Look around you, Maren.', 'happy'], ['And... goblins. They say Grukk owes you.', 'happy'], ['Saltmere sent its fishermen.', 'happy'],
    ['Brackenford sent its militia.', 'happy'], ['It is only the Wardens. We will have to be enough.', 'sad'], ['One of them is Tobias of Brackenford.', 'worried'],
    ['You came. Three hundred years, and somebody came.', 'happy'], ["Ennet Tallowmere. And you have my sister's face.", 'happy'],
    ['Tallowmere. My grandmother.', 'sad'], ['Ennet. You let them in.', 'angry'], ['Let me. I am tired', 'sad'],
    ['No. She has held it for three hundred years.', 'sad'], ['Veyra...', 'sad'], ['I put out two lamps, Maren. Let me light one.', 'sad'],
    ['Goodbye, my best pupil.', 'sad'], ['Wait. Wait. I have the whole song now.', 'happy'], ['"...and when the last lamp lit the road', 'happy'],
    // the villains: smug, angry, and once at the very end, sad
    ['(Alone, to the dark lamp.) A crown is wasted', 'happy'], ['Sentiment. The most reliable currency', 'happy'], ['Let her bleed. She will come back.', 'happy'],
    ["So the Wardens' pets carry the shards for us", 'happy'], ['Forgive it. Publicly. Gratitude is a leash', 'happy'], ['Good. Three shards in their packs', 'happy'],
    ['Guards. Take Master Orrin to the cells.', 'angry'], ['Thank you. I could never open the inner seal', 'happy'], ['Ilvane Corr, Chancellor of Highmoor. The Pale Hand', 'happy'],
    ['You cost me a good banker, Master Underbough.', 'angry'], ['Your shards are already in my vault.', 'happy'], ['Everyone wants it for themselves, Stonehand.', 'happy'],
    ['Four shards, Lamp. Four.', 'angry'], ['It is always no with you, Stonehand.', 'angry'], ['Spare me the ballad, singer.', 'angry'],
    ['Hands off the crown, thief.', 'angry'], ['It should have been me. It should have been somebody', 'sad'],
    ['One of my lamps has gone cold.', 'happy'], ['You opened a sluice in the Abbey.', 'angry'], ['You mean to wear my crown.', 'angry'],
    ['Then come and take the last of it from my brow.', 'angry'], ['Then let them see what they came for. Five of me', 'happy'],
    ['Grukk is THANE! Nobody is done with Grukk!', 'angry'], ['Grey lady pays silver for the shiny bit.', 'angry'], ['Singer has a clever mouth.', 'angry'],
    ['More diggers? No. Fighters.', 'angry'], ['Grey lady! Grey man! Grukk dug the hole', 'happy'], ['Big one! And the singer! Grukk remembers.', 'happy'],
    ['Pleasure, pleasure. Mind the goat.', 'happy'], ['Grukk pays debts. Grukk brought the whole warren.', 'happy'], ['Paid in advance. Grukk is very professional', 'happy'],
    ['Then here is an answer. Finish your drinks.', 'angry'], ['It is not. But I like your nerve. Boys.', 'happy'], ['The smith too? Fine. More to break.', 'happy'],
    ['Fine. FINE. They are taking fishermen', 'angry'], ['...Where did you get that.', 'worried'], ['All right. All right. Six fishermen', 'worried'],
    ['You left me alone in Saltmere.', 'usual'], ['Tavern-wreckers! You broke my nose', 'angry'], ['...Third time. Fine. FINE.', 'angry'],
    ['Well, well. The tavern-wreckers. Sit down', 'happy'],
    // Veyra, Sigrid and Oriel
    ['Maren. Of all the Wardens they might have sent.', 'sad'], ['Then we are done being teacher and pupil.', 'angry'], ['Maren struck me. I did not think', 'sad'],
    ['Maren. You came. Of course you came.', 'sad'], ['You chose me. I did not think you would.', 'worried'], ['There are always men drowning.', 'angry'],
    ['I know you will. That is what frightens me.', 'worried'], ['Two shards. The Hand will be delighted.', 'sad'], ['Not me. I swear it, Maren.', 'worried'],
    ['Maren. I hoped it would be you.', 'sad'], ['...How do you know his name?', 'worried'], ['He took my shard three nights ago.', 'sad'],
    ['He means to wear it, Maren.', 'angry'], ['Turn back, Maren. Please.', 'worried'], ['...I am so tired of graves, Maren.', 'sad'],
    ['Still breathing. Of course. You always did pull', 'happy'], ['Stay back.', 'angry'], ['Choose, Maren.', 'angry'],
    ['Runa Stonehand. Eleven years.', 'angry'], ['Chief, in this hall. And you walk in with', 'angry'], ['Three hundred, halfling, or the Ring.', 'angry'],
    ['Five winters, Runa. I will hold you to them.', 'happy'], ['The Hold is yours whenever you need it.', 'happy'], ['And there are goblins in my pass', 'worried'],
    ['You came down. All of you. Kell?', 'worried'],
    ['Every ward-lamp in the valley is failing.', 'worried'], ['...Grey oil. Maren. The Chancellery', 'worried'], ['Ilvane Corr.', 'angry'],
    ['Then the Wardens will be close too. Thank you, Maren.', 'sad'], ['The Wardens took Sister Veyra at the city gate', 'sad'],
    ['It is over, Maren. Go home.', 'happy'], ['The way-lamps are burning on the Ashen Road.', 'happy'],
    // the towns
    ["No haggling? Then you're the first sellswords", 'happy'], ['...Ninety. And not one verse about how I haggled.', 'angry'],
    ['Graves robbed in the churchyard. Sheep gone.', 'worried'], ['Every piece? ...I had written this off.', 'happy'],
    ['Lamps do not go out, Maren. Somebody put it out.', 'worried'], ['Three hundred years it has burned, and I could feel it', 'worried'], ['You know her.', 'sad'],
    ['Maren! And the big one, and the singer, and the thief.', 'happy'], ['Maren. You came for me. Of course you did.', 'happy'],
    ['Your grandmother had a strange idea of lullabies.', 'happy'],
    ['Strangers, at a time like this?', 'worried'], ['Saltmere is drowning by inches.', 'worried'], ['Six of my fishermen are gone.', 'worried'],
    ['Fine! Fine. Every barrel goes back', 'worried'], ['Saltmere owes you. If you are ever back this way', 'happy'], ['You are gentlefolk. I will not forget it.', 'happy'],
    ['Two lights on the water now.', 'happy'],
    ['Go home, all of you. I am going to sit in the sun', 'happy'], ['Not yet. Not while he sits there.', 'angry'], ['Thank you. Truly.', 'happy'],
    ['Eleven years I have wanted to hit you for that.', 'angry'], ['...You still hit like a rockslide.', 'happy'], ['You dug me out with your hands.', 'sad'],
    ['KARROW!', 'angry'], ['Karrow Hold keeps its oaths. All of us came.', 'happy'],
    ['That is... that is his ring.', 'sad'], ["...Quick. Well. He'd have wanted quick.", 'sad'], ['Peaceful. Aye. That sounds like him.', 'sad'],
    ['Not alone. No. Well. That is more than I managed', 'sad'], ['I buried him again this morning.', 'sad'], ["That one is my brother Alder's.", 'sad'],
    ['If you see him, up there... no.', 'sad'], ['Forty years I have dug for this town', 'worried'],
    ['Have you seen a boy? Eight, freckles', 'worried'], ['I have looked everywhere I dare.', 'worried'], ['He is home and he is grounded until', 'happy'],
    ['You found him! He came limping in', 'happy'], ['Please. The deep part of the wood', 'worried'], ['West of the forest road, that is where he cuts.', 'worried'],
    ['You burned them. All of them. Mine, and the baker', 'sad'], ['...Dask?', 'worried'], ['You took them. You took every chain in Highmoor', 'angry'],
    ["I keep the camp's books now.", 'happy'], ['I only kept the books. I only ever kept the books.', 'worried'], ['Master Underbough. Debt-free.', 'happy'],
    ['Brannoc Vosk. You owe my forge', 'angry'], ['...Hold my ale.', 'angry'], ['There you are. You took a punch meant for me', 'happy'],
    ['They took my cart. And my horse. And me.', 'angry'], ['Three pelts. That is three fewer wolves', 'happy'],
    ['North-west, dearies, in the drowned village.', 'usual']
  ];
  UI.moodFor = function (text) {
    if (!text) return null; const t = String(text);
    for (const [k, m] of L) if (k.length >= 14 ? t.startsWith(k) : t === k) return m === 'usual' ? null : m;
    return UI.mood ? UI.mood(t) : null;
  };
  UI.moodLines = L;
})();
