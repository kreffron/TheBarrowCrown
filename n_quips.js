/* What the heroes say during a fight (src/quips.js draws the bubbles). {name} is the other hero, or foe, it is about. */
(function () {
  G.D.quips = {
    runa: {
      start: ["Axes up.", "Karrow does not run.", "Stay close. Watch the flanks.", "Here they come.", "Pick a target. Make it fall.", "Together, then.", "Ancestors, watch this."],
      boss: ["That one is mine.", "Big. Good. Easier to hit.", "Whatever you are, you end here.", "Steady. We have done worse.", "Remember why we came."],
      turn: ["My turn.", "Right.", "Where is the weak one?", "Hold the line.", "Breathe. Then swing.", "Who is next?", "Watch my back."],
      hit: ["Felt that, did you?", "Again.", "Good steel.", "That is a start.", "Hm. Sturdy.", "Stand still for the next one."],
      crit: ["For Karrow!", "THAT is an axe.", "My grandmother hit harder. Barely.", "Split clean.", "Ha! Did you see that?", "Stay down."],
      miss: ["Hold still.", "Next one lands.", "Bah.", "You are quicker than you look.", "Missed. Once.", "The axe has opinions today."],
      kill: ["One less.", "Next.", "Rest. Properly this time.", "That is done.", "Go to your ancestors.", "Who else?", "Clean."],
      hurt: ["Is that all?", "Scratch.", "I have had worse from a goat.", "Hm. That one bit.", "Still standing."],
      low: ["Not yet. Not yet.", "I need a moment. Not getting one.", "Maren. Soon would be good.", "Still standing. Barely."],
      allyDown: ["{name}! Get up!", "Nobody touches {name} again.", "Hold on, {name}. Hold on.", "You will pay for {name}."],
      revived: ["Back. Where is my axe?", "Thank you. Now, where were we?", "The ancestors sent me back. Busy, apparently."],
      healed: ["Better. Thank you, {name}.", "Good. Again later, please.", "That will do."],
      skill: ["Make room.", "Watch this.", "Old clan trick.", "Brace!"],
      win: ["Done. Everyone breathing?", "Clean up. Then onward.", "Good work. All of you.", "Karrow would be proud. Mostly.", "That was ugly. We won anyway.", "Count heads."],
      flee: ["Back! Fall back!", "Another day.", "Run. No shame in living."]
    },
    dask: {
      start: ["Lovely. More friends.", "I will be over here. Stabbing things.", "Anyone want to talk this out? No?", "Count the exits first.", "They look poor. Shame.", "Pointy end goes in them. Got it.", "This is why I charge extra."],
      boss: ["Oh good. A big one.", "I will go for the bits that wobble.", "Whatever it guards, I want it.", "Runa, you hold it. I will do the rest.", "That is a lot of teeth."],
      turn: ["My move.", "Let me see...", "Ah. An opening.", "Quietly does it.", "Nobody look at me.", "Shadows, please.", "Where is the soft bit?"],
      hit: ["Pardon me.", "Just a little cut.", "Sharp, is it not?", "In and out.", "Sorry. Not sorry.", "That will sting."],
      crit: ["Right between the ribs.", "Oh, that was pretty.", "Professional work.", "Found the soft spot.", "Did anyone see that? Pity.", "Always aim for the gaps."],
      miss: ["Hm. You moved.", "That was a warning.", "I meant to do that.", "Rude.", "Slippery.", "My hand slipped. On purpose."],
      kill: ["Check its pockets later.", "And stay there.", "Nothing personal.", "Well. That is that.", "Business concluded.", "You were in the way.", "Next customer."],
      hurt: ["Ow. Rude.", "That was my good arm.", "I bruise easily!", "Hey! Hands off.", "Ow. I am charging for that."],
      low: ["I would like to stop now.", "Maren? Maren!", "Not dying in a hole. Not today.", "Somebody distract it. Please."],
      allyDown: ["{name}! Oh, you idiot.", "Get up, {name}. You owe me money.", "Right. Now I am angry.", "{name} is down! Cover them!"],
      revived: ["Did I miss anything? Do not tell me.", "Still alive. Somebody check my purse.", "Back. Who hit me? I will remember."],
      healed: ["Thanks, {name}. Bill me.", "Much better. Like new. Ish.", "Oh, that is nice."],
      skill: ["Now you see me.", "Watch your pockets.", "Old trick. Still works.", "Trust me."],
      win: ["Right. Loot.", "Everyone still got their purses?", "We should charge for this.", "Not bad for amateurs.", "Hold on, this one has a ring.", "I would like a drink now."],
      flee: ["Running! Good plan. Me first!", "This is the part I am good at.", "Brave? No. Alive? Yes."]
    },
    maren: {
      start: ["Lamplighter, light our way.", "Stay in the light, all of you.", "Keep close. I cannot heal what I cannot reach.", "Let us be quick about this.", "I see them. Light's coming.", "Easy. Breathe.", "Into the light, then."],
      boss: ["This one has carried dark a long time.", "Lamplighter, be with us now.", "Stand together. It wants us apart.", "I am not afraid of you.", "Whatever's in you, the light will find it."],
      turn: ["Who is hurt?", "Let me look.", "Stand fast.", "My turn. Steady.", "Lamp's lit.", "Where am I needed?", "Courage."],
      hit: ["Sit down.", "Mind your manners.", "That is for my friends.", "The light bites.", "Behave.", "There."],
      crit: ["In the Lamplighter's name!", "Oh! That was a good one.", "Light take you!", "Down, and stay down.", "I did not know I could do that.", "Rest, poor thing."],
      miss: ["Hold still!", "Lamplighter, guide my arm.", "Oh, bother.", "Not quite.", "Next time, then.", "My aim is better with bandages."],
      kill: ["Rest now.", "Go to the light.", "Be at peace.", "It is over for you.", "May you sleep better.", "One more soul at rest.", "Lamplighter keep you."],
      hurt: ["Ah! That stings.", "I am all right!", "Careful, I am the healer!", "Ow. Well.", "I have had worse."],
      low: ["I need... a moment.", "Lamplighter, not yet.", "Somebody cover me!", "I cannot heal you if I am dead!"],
      allyDown: ["{name}! I am coming!", "Hold on, {name}! Stay with me!", "No. No, {name}, not you.", "Keep them off {name}!"],
      revived: ["I am back. Thank you.", "The light would not let me go.", "Oh. Oh, that was cold."],
      healed: ["Thank you, {name}. That is usually my job.", "Bless you, {name}.", "Better. Much better."],
      skill: ["Light, come.", "Lamplighter, hear me.", "Shield your eyes!", "Hold still, this will help."],
      win: ["Is everyone whole? Let me see.", "Thank the Lamplighter.", "Rest a moment, all of you.", "We did it. Together.", "Sit. Let me check those cuts.", "Now we lay them to rest properly."],
      flee: ["Go! I am behind you!", "Live now. Fight later.", "Run! Do not look back!"]
    },
    finch: {
      start: ["Ladies, gentlemen... and things!", "Tough crowd tonight.", "Strike up the band!", "This will make a good verse.", "Oh, an audience!", "Everyone look heroic. I am composing.", "From the top!"],
      boss: ["Now THIS is a ballad.", "The big finale! Places, everyone!", "Someone will write songs about this. Me.", "Rhyme for 'horrifying'? Anyone?", "That is a villain. Look at the hat."],
      turn: ["My cue!", "Second verse!", "Ahem.", "Where was I?", "A little flourish...", "Spotlight, please.", "Hm. What rhymes with this?"],
      hit: ["Ta-da!", "A sharp note.", "Bravo, me.", "Encore? No? Fine.", "That is for heckling.", "Tempo!"],
      crit: ["And the crowd goes wild!", "Did you see that? Write that down!", "Standing ovation!", "Perfect pitch!", "That is going in the chorus.", "Magnificent. Truly. Me."],
      miss: ["Rehearsal. That was rehearsal.", "Flat. Very flat.", "Missed the beat.", "We will fix it in the second verse.", "Not my best note.", "Heckler!"],
      kill: ["Exit, stage left.", "And... curtain.", "Shortest act ever.", "Thank you, you have been lovely.", "The critics have spoken.", "Fin.", "Take a bow. A long one."],
      hurt: ["Not the face!", "Ow! Bad review!", "I need these hands!", "Rude, mid-song!", "Ow, ow, ow."],
      low: ["This is not how my ballad ends.", "Help! The bard is wilting!", "Maren? Medic? Anyone?", "Tragic second act..."],
      allyDown: ["{name}! No, no, no!", "Get up, {name}! The song needs you!", "Somebody help {name}!", "I will write you a better ending, {name}. Up!"],
      revived: ["I am alive! Write that down!", "The bard returns! By popular demand!", "Did I miss my cue?"],
      healed: ["Thank you, {name}! You are my favourite.", "Oh, lovely. You are going in a song.", "Much better. Back to work!"],
      skill: ["Listen to this!", "A little tune...", "Hit it!", "One, two, three..."],
      win: ["And scene!", "Thank you, we are here all week.", "That is a verse for the tavern.", "Encore? Please, no.", "Heroes of the hour! Mostly me.", "Grandmother would love this one."],
      flee: ["Tactical exit, stage left!", "Run now, sing about it later!", "Exit, pursued by everything!"]
    }
  };
})();
