/* The Guide (Main menu > Guide, or its key): the rules and the things worth knowing, one short page each.
   D.guide = [[group, [[title, text], ...]], ...]. Text is plain, with blank lines between paragraphs and lines that
   start with "· " drawn as a list. {a}, {b}, {map} and the like become the player's own keys (G.keyText).
   Every number here comes from the rules in src/ (battle.js, tactics.js, terrain.js, core.js, bonds.js, hunt.js):
   change a rule, change its page. tools/texttest.py checks each page fits. */
(function () {
  G.D.guide = [
    ['Getting started', [
      ['Controls',
        '· Move: arrows or WASD. Hold {run} to run.\n· Talk, search, confirm: {a}. Back, or the menu: {b}.\n· Switch leader: {switch}. Leader ability: {ability}.\n· Map {map} · Items {items} · Journal {journal} · Party {party} · Gear {gear} · Guide {guide} · Quick save {save}\n\nClick or tap menus, dialogue and the board; in a fight, tap anyone for their card. 📜 {blog} log · 🔍 {bzoom} zoom. Keys: Options > Controls.'],
      ['The party',
        'Four heroes travel together; the one in front is the leader.\n\n· Runa, Barbarian: Athletics, Fury.\n· Dask, Rogue: Thievery, Cunning.\n· Maren, Cleric: Lore, Faith.\n· Finch, Bard: Persuasion, Verve.\n\nThe first is the hero\'s skill for checks. Fury, Cunning, Faith and Verve are skill points, spent on skills in a fight and restored by rest.']
    ]],
    ['Exploring', [
      ['Leader gifts',
        'The leader uses their gift with {ability}. A small diamond marks something they can use.\n\n· Runa: breaks cracked walls and barricades; shoves heavy blocks.\n· Dask: opens locks; spots and disarms traps, hidden plates and doors.\n· Maren: the best light in the dark; lights Warden lamps; prays at shrines.\n· Finch: wins people over, rings bell-stones, sings beasts to sleep, plays for a crowd.'],
      ['Talking and checks',
        'Face something and press {a}. A small {a} appears over anything that will answer.\n\nSome things call for a skill check: a d20 plus the hero\'s skill bonus, against a difficulty (DC). Meet or beat it to succeed. A natural 20 always succeeds; a natural 1 always fails. Some checks can be tried again.'],
      ['Enemies on the map',
        'Enemies you can see have a red ring at their feet.\n\n· Story foes face one way. Step into the three squares in front of one and it comes for you.\n· Roaming bands wander and give chase. Beaten, they stay gone until you rest.\n· Reach an enemy from behind: an ambush, and your side moves first. Caught from behind: you are surprised.\n\nRandom fights happen off the road; roads, paths and bridges are safe.'],
      ['Running and travel',
        'Hold {run} to run, about twice as fast. Options > Always run makes running the default (then holding {run} walks).\n\nMap > Travel takes you to any town you have already found, from a town or the open road (not from underground).']
    ]],
    ['Combat', [
      ['Turns and moving',
        'At the start of a fight, everyone rolls a d20 plus speed (the party gets +2 a level when it outclasses the foes, -2 when outclassed). The order holds all fight; latecomers roll on arrival.\n\nOn your turn, move and act once each, in either order. Changed your mind? Undo the move ({bt_undo}) before you act.\n\nHow far you move: speed 4 or more, 4 squares; speed 0 or less, 2; otherwise 3. Rough ground and shallows cost 2 squares to enter.'],
      ['Attacking',
        'An attack is a d20 plus your attack bonus, against the target\'s AC. Aiming shows the hit chance and damage first.\n\n· A natural 20 is a critical hit: damage dice are doubled. A natural 1 always misses.\n· Flanking: if an ally already stands beside the target, melee gets +2. Dask gets it at any range, with Sneak Attack.\n· Shooting with an enemy right beside you: -2.'],
      ['Holding ground',
        'Stepping away from an enemy beside you gives it a free strike at -2 to hit: one a round per enemy, at most one per move.\n\nDask and anyone hidden never provoke. Enemies asleep, stunned or turned do not strike. Shoves, leaps and falls never provoke. Enemies follow the same rule.\n\nPress {threat} to shade every square the enemy can reach next turn.'],
      ['Ground and objects',
        '· High ground: +1 to hit anyone lower, -1 hitting up; bows and spells reach one square further.\n· Rough ground and shallows: 2 squares to enter.\n· Fire burns anyone ending a move or starting a turn in it. Ice: -1 to hit from it.\n· Cover: a low obstacle beside a target gives -2 to shots from further than one square.\n· Kegs, braziers, boulders, logs, hives, gas vents and things overhead: Use them.'],
      ['Defend and flee',
        'Defend: +4 AC until your next turn, and 1 skill point back.\n\nOnce a fight, free: Runa\'s Shove, Dask\'s Smoke Pellet, Maren\'s Lamp Flare, Finch\'s Hush.\n\nFlee: a d20 plus your party\'s best speed, against 8 plus the enemies\' best speed.\n\nBosses wind up big blows, marked in red: step out of them. At half health a boss is enraged and calls for help.'],
      ['Status effects',
        'Good: Blessed (+2 to hit and saves), Inspired (next attack +1d6 to hit and damage), Rage (+2 damage, hits taken -2), Warded (hits taken -3), Hidden (cannot be targeted; next attack is a critical), Regen, Lamp-ward, Taunt.\n\nBad: Rattled (worse to hit), Weakened (-2 to hit and AC), Marked (-3 AC, open to Sneak Attack), Poisoned, Asleep (damage wakes them), Stunned, Turned (attacks its own side).\n\nSaves resist many of them.'],
      ['If the party falls',
        'You choose: try the fight again from the start, or retreat to your last rest, fully healed but a tenth of your gold poorer.']
    ]],
    ['Growing stronger', [
      ['Levels and choices',
        'Fights and quests give XP, up to level 30. The journal suggests a level for each quest. A fight below the party pays less: half for each level over it. At levels 7, 13, 19 and 25 everyone also gains +1 AC.\n\nWhenever a hero would learn a skill, you choose: that skill, or a lasting improvement instead (Tough, Mighty, Sharp, Guarded, Steady, Deep Well, Potent or Quick; each up to three times). The one you pass up is gone.'],
      ['Gear',
        'Each hero wears a weapon, armour and a charm (Gear menu). In the Gear menu and shops, ▲ marks an upgrade and ▼ a downgrade, with changed stats in green or red. After you buy gear, the shop offers to put it on; Sell outgrown sells spare gear nobody would wear.\n\nWon fights may leave draughts and tonics, and rarely gear you can only find (about two a chapter); more often from fights below you.\n\nIf Dask trusts Runa, he haggles: shop prices drop.'],
      ['Rest and healing',
        '· Inns: a bed for a few gold restores everyone. Roaming bands come back, and prayer places and stages are fresh again.\n· Campsites: a Camp Kit (shops sell them; you can carry two) restores everyone too, once per campsite until your next inn.\n· Items > Patch up the party uses as few healing draughts as it takes, cheapest first, and shows you first.'],
      ['Bonds',
        'Trust in Runa: Doubting, Steady, Trusting, Devoted. Friendship between two companions: At odds, Easy, Friends, Close. Your choices move both; the Party screen shows where they stand.\n\n· Trusting, beside Runa: +1 AC to both. Devoted: +1 to hit too.\n· Friends side by side: +1 to hit (Close: +1 AC too), and they patch each other up after a win.\n· Trust also makes Dask haggle, and Maren\'s prayers and Finch\'s songs stronger.'],
      ['Prayers and songs',
        'Lead with Maren at a shrine or altar and use her gift: she prays, and each place heals, restores skill points, or blesses your next fight in its own way.\n\nLead with Finch where a crowd gathers: he plays for coin, sometimes a gift, sometimes your next fight starts Inspired.\n\nEach works once, then again after a rest. Journal > Maren\'s prayers and Finch\'s stages list the ones you have found.']
    ]],
    ['Puzzles', [
      ['Puzzle dungeons',
        'Nine dungeons built around the heroes\' gifts: switch leaders to solve them. Tips explain each new kind of piece.\n\n· Walk into a block to shove it (Runa). On ice it slides until stopped.\n· Plates, lamps, bell-stones, mirrors and beasts each have a hero for them.\n· Every room has a red reset lever: nothing can get stuck.\n· The Smith\'s Deep has hint stones: a nudge or a plain answer.']
    ]],
    ['Saving and settings', [
      ['Saving',
        'The game saves itself to your slot whenever you enter a new place and when you rest. Menu > Save picks a slot; {save} quick-saves. The opening brawl cannot be saved.\n\nSaves live in this browser. Options > Export save gives a code you can keep or carry to another browser, and the title screen loads it.\n\nMenu > Quit to title can save first.'],
      ['Journal and map',
        'The journal groups open quests by region. A dot marks a new step; ◆ marks the story. Each quest ticks off the steps done and shows what is next. Completed quests, the chronicles, Biographies (who you have met, growing as the story does), the bestiary, Recent conversations and The last fight are there too.\n\nThe map shows where you have been. + marks a place Maren can pray, ♪ a place Finch can play.'],
      ['Options',
        '· Difficulty. Easy: foes have a quarter less health and hit softer. Hard: more health, harder hits.\n· Battle board: diamond or flat ({bview} switches mid-fight; {rot_l} and {rot_r} turn the diamond).\n· Enemy health: bars only when you point or aim (else read wounds), or always.\n· Hero figures: heroic or classic.\n· Battle zoom (phones zoom in), battle and text speed, chatter, always run, interact prompt.']
    ]]
  ];
})();
