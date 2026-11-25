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
    ['Goodbye, my best pupil.', 'sad'], ['Wait. Wait. I have the whole song now.', 'happy'], ['"...and when the last lamp lit the road', 'happy']
  ];
  UI.moodFor = function (text) {
    if (!text) return null; const t = String(text);
    for (const [k, m] of L) if (k.length >= 14 ? t.startsWith(k) : t === k) return m === 'usual' ? null : m;
    return UI.mood ? UI.mood(t) : null;
  };
  UI.moodLines = L;
})();
