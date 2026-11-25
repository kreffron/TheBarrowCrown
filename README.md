# The Barrow Crown

A top-down, turn-based fantasy RPG that runs as one web page. Complete: five chapters, levels 1-30 (six per chapter: three from the main story, three from side missions), three endings and an epilogue that reflects every major choice.

- Play: https://claude.ai/artifact/5vJH45N1PEUURrHFgjpgnA
- Design bible (world, rules, content format, status): https://claude.ai/artifact/KaJ3C4m2VEg4DbH5qgQ8et

## Layout

    src/        engine (core, gfx, audio, ui, field, puzzle, hunt, script, battle, board, terrain, pieces, iso, menu,
                worldmap, main) + style.css + page.html
    data/       all content: rules.js, items.js, bestiary.js, ch1/ (dungeons, epilogue, prologue, story, town, wild),
                ch2/ to ch5/ (bestiary, (cutscenes,) dungeons, story, town, wild)
    tools/      build.py, validate.js, playtest.py, smoke.py, shot.py
    dist/       index.html, the built game (open it in a browser)

## Working on it

    node tools/validate.js             # data checks: map shapes, references, reachability
    python3 tools/build.py             # writes dist/index.html
    python3 tools/playtest.py play     # whole chapter on autopilot: decision routes plus main-only and some-side-quests (or: play main,some)
    python3 tools/playtest.py play2    # Chapter 2 on autopilot from three made-up Chapter 1 endings (or: play2 main2,chase)
    python3 tools/playtest.py play3    # Chapter 3 the same way, from made-up Chapter 2 endings (PICKS=1 prints every choice made)
    python3 tools/playtest.py play4    # Chapter 4 the same way, from made-up Chapter 3 endings
    python3 tools/playtest.py play5    # Chapter 5 and every ending, from made-up Chapter 4 endings
    RAW=1 python3 tools/playtest.py play   # same, with the level cap lifted, to see where XP comes from
    python3 tools/playtest.py sim 3    # every enemy group x120 at party level 3 (ONLY=a,b N=60 to narrow it)
    python3 tools/smoke.py [outdir]    # real-keyboard test of the opening, tutorial and guided brawl + screenshots
    python3 tools/puzzletest.py        # solves every puzzle dungeon through the real game code (or: puzzletest.py smithdeep)
    python3 tools/placestest.py        # every prayer place and busking venue, once per rest, scaled by trust
    python3 tools/quipstest.py         # combat quips: lines for every hero and kind, bubbles in a live fight, quiet when off
    python3 tools/journaltest.py       # journal: regions for every quest, steps ticked off, completed list, unread dots
    python3 tools/texttest.py          # text fits its boxes (prompts, descriptions, battle log); quips keep the story's voice
    python3 tools/uitest.py            # real input: the tutorial skill check played with clicks only; Quit to title and Continue
    python3 tools/qoltest.py           # interact prompt, running, gear comparisons, the dialogue log, patching up
    python3 tools/monkeytest.py [seed] [steps]   # random keys and clicks at normal speed: tutorial, six places, a fight; fails on any error or a stopped game loop

The test tools need Python with Playwright and a Chrome at /usr/bin/google-chrome.

## Adding a chapter

1. Read the design bible first.
2. Create data/chN/ like data/ch2/: bestiary.js (enemies, groups, items, shops), story.js (quests with ch: N,
   chronicle lines with chapter N, scripts, sprites), map files and cutscenes.js. build.py picks up every data/ch*/ folder.
3. Start the chapter by setting the `chapter` flag (it sets the chapter's XP scale, D.xpScale; rerun tools/levels.py for the new fights' levels). End it with a recap card for that chapter.
4. Add a PLAYn walk to tools/playtest.py, starting from made-up endings of the previous chapter.
5. Validate, build, playtest, simulate, look at screenshots, then publish dist/index.html.

Content is data. Change src/ only when a chapter needs something the engine cannot do.

## Decisions

Chapter 1 sets decision flags (listed in the header of data/ch1/story.js and in the bible's
"Decisions and consequences" section). Later chapters must read them. Every new decision needs
a line in D.chronicle and a route in tools/playtest.py that exercises it.


## Levels

D.xpTable in data/rules.js runs to level 30, and every level costs more than the one before. There are no chapter caps
(G.levelCap is just level 30). Instead every fight has a level (D.fightLevels in data/ch9_world/s_levels.js, measured
by tools/levels.py from the playtest routes, run under the old caps of 6/12/18/24/30 since that is the pace the
content was built for):
- **XP falloff** (G.xpFor): a fight pays in full up to its level, then half for each level the party stands above it
  (a quarter at two over, an eighth at three). Quests always pay in full. Grinding 80 random fights in Mirefen at the
  start of chapter 2 takes the party from 6 to 11 (13 without the falloff), most of it in the first 50.
- **Initiative** (B.initBonus): the party rolls +2 per level above a fight's level (up to +6), and -2 per level below
  the lowest level any route met it at (down to -6). Ordinary progress sits between the two and gets neither. A gap
  of 4 or more is announced at the start of the fight.
- **Wary wildlife**: two or more levels above an area's top level, random encounters come half as often.
- **Spoils**: a fight that pays reduced XP (or any fight at level 30) leaves spoils half again as often.
- **Suggested levels**: each quest's (the middle of the levels the routes took it up at) shows on its journal page,
  green when the party is there, yellow one short, red further; each region heading shows the spread.
Regenerate after changing content: run the routes with LEVELS_OUT and the old-caps PATCH (see tools/levels.py).
Stats grow on a 1-20 power scale spread over the 30 levels (D.powerScale, G.power), so a level-30 hero is as strong
as the old level-20 design; HP and SP grow every level, and stepped stats use power rounded to the nearest half.
AC is the one stat that used to come only from armour; it now also steps +1 at levels 7, 13, 19 and 25 (G.AC_LEVELS),
because enemy attack climbs about +10 over the game against roughly +5 from armour, and late foes were hitting 85-95%
of the time. Chapter 5's seven regular foes also lost 15% of their health (their opening fights ran 7-11 rounds).

The rule for every chapter: the main story is worth three levels and side missions the other three. Doing everything
takes the party to about 6, 12, 18, 24 and 30 by a chapter's end (with the caps gone, the routes end there or one
above: chapter 2 at 12-13, chapter 4 at 25, since the finale now pays; a completionist reaches 30 shortly before the
end of chapter 5). From a full previous chapter, the main story alone ends
three below the cap (9, 15, 21, 27). A player who skips side missions all game ends the chapters at about 4, 8, 13, 18
and 24, and each chapter's final boss is tuned to about a 75% win rate at levels 4, 9, 13, 18 and 23
(Grukk, the Drowned Prior, Hrimgar, the Ossuary Colossus, the Barrow King), so side missions matter.

Measured with tools/playtest.py (main from a full chapter / everything):
chapter 2: level 9 (3,502 XP) / 12; chapter 3: 15 (9,740) / 18; chapter 4: 21 (19,825) / 24; chapter 5: 27 (35,880) / 30.
Main story all game: 4, 8, 13, 18, 24.

## The world pass (data/ch9_world, loaded last)

- a_critters.js: animal pixel sprites and D.ambient, the animals and passers-by each map spawns when you walk in
  (Field.spawnAmbient). They wander, say a line, are never fought and are never saved.
- b_wild.js: D.decorate scatters shrubs, ferns, logs, reeds and stones over the wild maps (a blocking piece only
  where all eight neighbours are open, so no path is ever cut), and places the quest-givers you meet on the roads.
  Some side jobs moved off the notice boards to them.
- c_towns.js: the five towns, redrawn by tools/towns.py (edit the tool). Sizes are kept, and so is the strip of
  Brackenford the farewell scene uses.
- d_dungeons.js: the dungeons, redrawn by tools/dungeons.py (edit the tool; it reads a dump made by /tmp/dump.js).
  The tool splits each old map into zones at its gates, guards and step-on triggers, lays out new rooms with loops
  for each zone, joins zones only through a corridor holding the same connector, and re-checks that every thing
  sits in the same zone behind the same connectors and that every warp lands on open floor. Not redrawn: the
  Fourth Tomb, the Throne of Vael Morn and the vision maps, whose scenes are placed by coordinates.
- e_fixes.js: any warp that would set you down on something solid steps you out onto open ground instead.

Quest markers: Field.questMark scans a person's or board's script for ['quest', id, stage] under the conditions that
guard it; a gold "!" means main story business, a blue one a side job. Fast travel: Menu > Map > Travel, to any town in
D.towns you have walked into (Menu.found), from a town or the open road but never underground.

## Leaders, rounds and the battle ribbon

- The leader (G.S.leader) walks in front; C switches (or click a face in the leader bar, top left), F uses their
  ability (Field.ability): Runa smashes, Dask picks locks and finds caches, Maren lights old Warden lamps (else a
  small heal once per place), Finch wins people over (or busks once per town). A thing with
  `abil: { who, script }` answers only that hero and glints in their colour while they lead; data/ch9_world/f_lead.js
  places one of each per chapter. Busking and blessings reset at an inn.
- Outdoor people with `wander` walk a loop of 3-5 spots near home and pause at each (Field.makeRoute / patrol);
  people in D.indoor rooms stand still; animals still potter at random.
- Usable objects (chests, signs, levers, lamps...) are drawn outlined with a shadow (gfx.drawThing) so they stand out.
- Battle figures are painted in smooth shapes at 3x (B.piece) and beasts are smoothed with Scale2x; obstacles sit on
  a marked square. The turn ribbon above the board (B.drawTurns) shows this round's order, who is up and who is next.

## Play time

Estimated by /tmp/lv/time.py from the autopilot's counts (dialogue lines and length, battle rounds at about 32 s
each, maps walked, menus). After the expansions, a player who keeps up with side content plays each chapter's main
story in about 1.5-2 hours and everything in about 3-3.5 hours (chapter 5 runs a little long: about 2 and 3.5).
Players who skipped all earlier side content arrive underlevelled and take longer.

## Rest and camping

A full rest costs a Camp Kit (carry 2, dearer each chapter) at a campsite: wild wayshrines and dungeon lamp-niches
(D.scripts.campsite, the 'camp' command). Each campsite gives one rest until the next inn stay, which clears every
campUsed.* flag. Town lamps no longer heal.

## The chapter expansions

Each chapter has data/chN/z_expansion.js, loaded last. Each one adds:
- a required story act that gates an existing door with a script ending in ['end'] until the act's flag is set
  (act1 the mill / Snagtooth, act2 the tide mill / Gannet, act3 the Frozen Falls / Hesk, act4 the Chancellery
  bell-tower / Vell, act5 the Cinder Keep / the Ash-Marshal);
- a new dungeon floor spliced between two existing ones by re-pointing their stairs (ossuary, scriptorium, vault3,
  charnel, lamphall), each with a three- or four-part door puzzle, a campsite and a mini-boss. Their plaques name the
  Wardens who carried the shards away: Oswin, Corran, Hedda, Aldous; the fifth is never named;
- a notice board in the hub town and five to eight side quests, some with small maps of their own.
D.placeNear(map, ch|null, x, y, def) drops a thing on the nearest free walkable tile and returns its map character;
new things carry a `tag` so the autopilot can find them (T.tag). Chapter XP is scaled by D.xpScale[chapter] (applied
in G.gainXp), and a group can pay less with `xpMul` (chapters 4 and 5 use it on the new story fights) so the
3-and-3 level split still holds: the main story from a full previous chapter ends 3 levels under the cap, and
everything reaches the cap exactly.

## The ending

Chapter 5 ends with a choice of who breaks the crown. Finch can sing it apart only with all four stanzas of the fifth
verse (chapters 1-4's optional dungeons) and the Road of Lamps lit; Ennet can always break it and goes home; Veyra can
break it if she is with you, and Ennet walks free. The epilogue (data/ch5/story.js, epilogue5) visits Brackenford,
Saltmere, Karrow Hold and Highmoor and reads flags from every chapter.

## Engine notes added for chapter 3

- A tile with `walls: [top, face]` becomes its top or face like `wall` does (used by icewall).
- `gfxIf` takes one `[cond, gfx]` pair or a list of them; the first that holds wins (the Cairn's oath-stones).
- Ability target `party` includes fallen allies (First Lamp). Status `unbroken` leaves its bearer at 1 HP once.
- A trigger whose script is abandoned by a lost fight (retreat) stays armed.
- Tile `bars` is solid but you can talk across it, like a counter.

## Engine notes added for chapter 4

- Effect `{t:'extra'}` (Encore) gives an ally another turn straight away.
- Status `charmed` (Counterpoint) makes an enemy attack its own side; `lampward` blocks new harmful statuses; `marked` opens a target to Sneak Attack.
- Maps can override the global legend with `legend: {...}` (Highmoor's stalls and hedges, the Catacombs' niche walls).

## Battles: the board

Every fight is played on a 12x12 board (src/board.js for the rules, src/pieces.js for the drawing). The canvas
switches to the screen's own resolution during a battle and is shown smoothed, so the pieces can be drawn as
carved figures on round bases (blue: the party, green: allies, red: enemies). The four heroes have their own
painters (src/heroes.js: Runa's fur mantle and great axe, Dask's hood, scarf and knives, Maren's robes, tabard and
glowing lantern, Finch's plumed hat, doublet and lute, each with the head drawn a size up so they read at board
size). The 20 creatures without a character spec are painted to match in src/beasts.js (wolves, spiders, wisps,
golems, the Colossus and the rest). Everyone else (enemies, guests, townsfolk) is painted in the same hand by
src/figures.js from their sprite spec, plus battle-only outfits in data/ch9_world/q_battle.js: plate, mail, leather,
coats and rags, tabards with sigils (the Pale Hand, the Warden's lamp, the crown, skulls, flames), shields, masks and
shining eyes for the dead. Faces carry an expression: foes scowl, friends smile.

- Each board is cut from the 12x12 patch of the field map around the party (B.makeBoard / B.fromMap): the floor
  takes the colour of the ground there and solid tiles become obstacles of their kind (trees, pines, reeds, water,
  rocks, pillars, standing stones, graves, walls, tables, barrels). Water, fences, tables and graves stop movement
  but not sight. Deployment columns stay clear, crowding is thinned to 18 obstacles, every open square connects.
  The balance simulator uses a random themed board instead (B.randomBoard).
- Turns: initiative (a d20 plus speed) is rolled once, at the start of a fight, and holds for the whole fight, as at the
  table; anyone who joins later rolls when they appear and takes their place. An ambush or a surprise still puts one
  side first in round 1. On its turn a piece may move once and act once, in either order.
  Choosing a target that is in reach walks the piece up to it first.
- Movement: slow 2 (Maren, bosses), regular 3 (Runa, Finch), quick 4 (Dask, wolves). Distances count like a
  chess king. Obstacles (trees, pillars, rocks, tables, by setting) block movement and line of sight; allies can be
  walked through, enemies cannot. Weakened pieces move one square less.
- Reach: weapons hit adjacent squares; bows 6; Maren's sling 5; thrown axes and knives 4; spells and songs 4-6; heals 4.
  Sweeps (Cleave, Whirlwind, Earthshaker) hit every adjacent foe; blasts (Dawnfire, Finale, Lament...) are aimed
  at a 3x3 or 5x5 area; party buffs reach allies within 3-5 squares. D.boardRules in data/rules.js sets each
  ability's range, radius and specials: dash (Headlong Charge moves 2 further), leap (Shadowstep appears beside a
  target up to 6 away) and push (Avalanche, Earthshaker, Mountain Falls, the Giant's crush knock foes back).
- Engaged and flanking: a target with one of the attacker's allies beside it is engaged. Melee attacks on an engaged
  target get +2 to hit. A ranged attack with a foe adjacent to the shooter is at -2.
- Classes: Finch fights with a shortbow (range 6, +1 to hit and damage) and a weaker rapier (-1/-2); Runa is
  strongest in melee (+2 damage) and can throw a hand-axe (range 4, -1/-2); Maren supports, with a sling for when no one can reach her (range 5, -1 damage); Dask gets +2 to hit
  and Sneak Attack against any engaged target, near or far (thrown knives, range 4), plus one more Sneak Attack die
  when he is in melee beside the ally.
- Multi-hit attacks (Twin Fangs, Thousand Cuts, Twin Axes, Gambit) move on to another foe in reach when the first falls.
- Waves walk on from the right edge. Effects (weapon strikes, missiles, blasts) are drawn over the board.
- Enemies and allies plan with B.planAI (pick a move, find the best square to use it from); the balance autopilot
  uses B.planAuto, which asks B.autoAction what it wants and finds a way to do it on the board.

## Controls

Every action has up to three keys, set in Options > Controls (G.ACTIONS in src/core.js; saved in G.opts.keys).
The Controls screen groups them under headings (G.ACTION_GROUPS): moving and choosing, menu keys that work while
exploring (main menu, map, items, party, gear, journal, options, quick save), and battle commands (1-7 by default:
attack, shoot, skills, items, move, defend, end turn). A menu entry with `hot: '<action>'` is chosen directly by
that action's key; the battle command box shows the keys beside each command. Each action can be reset alone,
or all at once.

## Battle graphics

The battle canvas is drawn at the screen's resolution, 2x to 6x (B.RES, set by B.fitRes in src/pieces.js on each fight and on resize), so text, bars and effects are sharp. Over the board:
a light layer (B.ambient by setting, darker on dark maps) with pools of light around pieces and spells; wall
torches in caves, crypts, sewers, throne rooms and taverns; low fog in fens and crypts; sunbeams outdoors. The piece
whose turn it is has a gold outline, and the piece being aimed at a red (or green) one. A boss fight opens with a
name plate, and each new round with a banner. Critical hits and knockouts give a short push in on the target.

**Reading wounds.** By default a foe's health bar shows only while you point at it or aim at it (Options > Enemy
health: On hover / Always). Otherwise its figure shows how hurt it is (B.woundStage, B.woundedPiece in
src/pieces.js): under 3/4 health the living bleed, the dead and the made crack, spirits tear and oozes cloud; under
1/2 the figure darkens; under 1/4 it trembles (spirits flicker). The marks are placed on the figure's own pixels and
clipped to it, the same on every copy, and cached per stage. Turn-order chips drop the foes' health stripe too.

## Spoils (`data/ch9_world/r_loot.js`, `B.spoils` in src/battle.js)

On top of each enemy's own loot, a won fight can leave supplies and, rarely, found gear:
- a healing draught of the chapter's strength (Healing, Strong, Potent, then Highmoor Elixir): 30% a fight, 40%
  with four or more foes, always after a boss (and a second half the time); an Ember Tonic 12% (50% after a boss);
- found gear: 4% a fight, 25% after a boss, a guaranteed find by the 20th fight without one (G.S.dry), about two
  a chapter. Each chapter has five pieces sold nowhere (one per hero and a charm), a little better than that
  chapter's shop gear or with a twist; the party never finds a piece it already has. A find gets its own message.
- At the level cap, when a fight's experience has nowhere to go, the odds are half again as good.
Brawls and fights that pay no XP find nothing.

## The map

Menu > Map (src/worldmap.js). Area: the current place as a mini-map of the squares explored so far, with exits
(names once visited, ??? before) and the party. Region: every place found, laid out by the direction of the exits
between them, with dashed stubs for roads that lead somewhere new. Exploration is kept per map in G.S.seen as
run-length strings (Field.reveal in src/field.js, radius 5; small rooms are seen whole on entry).

## Looks

data/looks.js layers details over the character sprites (hair styles, facial hair, capes, furs, aprons, scarves,
glasses, eye-patches, crowns, small folk, and a held item such as an axe, lute, lantern, spear or ledger).

## Engine notes added for chapter 5

- Effect `{t:'dispel'}` strips helpful statuses (Cut Purse). An effect with `on: 'allies'` hits the user's side (The Fifth Verse's heal).
- `['battle', group, { guestsIf: [[cond, guest], ...], max: 2 }]` brings in whichever allies the story has earned.
- A group's `simGuests` tells the balance simulator which guests that fight always has (the King always has Ennet).

## The opening

data/ch1/prologue.js holds the prologue cutscenes, the tavern tutorial, the guided brawl and the
closing scene. Cutscene and guided-battle commands are documented in the design bible's Content format
section. Saving is switched off while the tutorial runs (flag `tut` set, `joined` not yet).

## Puzzle dungeons

Nine optional dungeons, two in each of chapters 1-4 and one, the hardest, in chapter 5, each built around one hero's move with the others in
support. Each pays that hero a feat (kept for good, shown on the character sheet) or a unique item, so every hero
earns one of each. Chapter 1 puzzles use two heroes' moves, chapter 2 three, chapters 3 and 4 all four.

| Ch | Dungeon | Way in | Built around | Reward |
|---|---|---|---|---|
| 1 | The Millrace Cellars | trapdoor at Teague's Mill (after the mill is freed) | Runa shoves millstones; Dask spots hidden plates | Runa: Thick-Skinned (feat) |
| 1 | The Hollow Barrow | barrow door in the Thornwood | Dask spots and disarms traps, flicks pebbles, finds doors; Maren lights the dark | Dask: Gravesilk Gloves |
| 2 | The Drowned Chapel | stairs out in the Mirefen | Finch rings tide bells; Maren lights lamps in order for ghost walkways; Runa shoves a statue | Maren: Keeper's Grace (feat) |
| 2 | The Singing Sea-Caves | cave mouth on Saltmere beach | Finch plays bell-stone songs and lulls a crab; Dask finds hidden verses; Maren lights the wall | Finch: Siren-string |
| 3 | The Ice Halls of Karrow | cave mouth in the Frost Pass | Runa slides ice blocks (one block stops another); Dask finds plates; Maren thaws a wall; Finch blows the horn and lulls a wolf | Runa: Frostbound Mantle |
| 3 | The Echo Spire | stairs by the Falls | Finch's bell-stones turn mirrors that steer Maren's lamp beams onto crystals; Runa turns the heavy mirror and moves a crate; Dask opens the false wall and finds the song | Finch: Second Verse (feat) |
| 4 | The Inquisitor's Archive | stairs in Highmoor | Dask sneaks past wardens who turn with every step (he can see where they will look next); Runa rolls two bookcases on castors into the wardens' aisles to block their sight (ruinable); Maren lights the lamps in order; Finch can sing the porter to sleep | Dask: Opportunist (feat) |
| 4 | The Undercroft of Lamps | stairs in the Undercroft | All four: traps and secret doors, a pit filled with a boulder, a beam and mirror, and four great lamps lit in the order the walls give | Maren: Brother's Lantern |
| 5 | The Smith's Deep | warm cave mouth in the Ashfall war camp (from the start of chapter 5) | All four in every room, in the dark: hidden traps and a pushed block to open the Cinder Gate; a four-note forge-song on chimes under two sentries (one lulled, one dodged); an ice room where a block bridges a pit and another stops on a plate while Dask flicks a hidden one; then a lens beam through two mirrors to a crystal, and four lamps lit in the order of four hidden murals (bellows, tongs, hammer, anvil) | The Smith's Edge: critical hits on 19-20 for the whole party (each further source widens it by one, to 17-20 at most) |

The Smith's Deep has three hint stones (first room, Bellows Hall, Anvil room). Each gives the hint for the first
unsolved stage, wherever it is: a nudge, or a plain answer, as the player chooses (`D.scripts.pzSmithHint`).

Pieces live in `src/puzzle.js`: blocks (that slide on ice), plates, gaps (pits, water, tide floors, ghost
bridges), traps, secret doors, lamps (in order or not), chimes and songs, beasts, levers, light beams with mirrors
and crystals, sentries, reset levers, and darkness for `pzDark` maps. The first time a kind of piece is near, a tip
says what to do with it. The maps are generated by `tools/puzzles.py` into `data/ch9_world/g_puzzles.js`. Every
puzzle room has a red reset lever, so a dungeon can never get stuck. `tools/puzzletest.py` solves all nine through
the real game code and checks every gate and reward. Feats and item powers (`D.perks`) are applied in battle by
`B.perk`; the feat script command is `['feat', who, id]`.

## Difficulty, banter, bestiary and weather

- **Difficulty** (Options): Easy (enemies have 25% less health and hit 25% softer), Normal, or Hard (20% more
  health, 15% harder hits). It can be changed any time. Chapter 5's three hardest bosses (the Ashen Knight, the
  Ash-Marshal and the Lamp-eater Queen) were also softened a little.
- **Banter** (`data/ch9_world/h_banter.js`): short exchanges between the heroes the first time you enter about 30
  places, shown low on the screen without stopping play.
- **Bestiary** (Journal > Bestiary): every enemy you have met, with a picture, its stats, its kind, what it is
  weak to, what it shrugs off, and how many you have beaten.
- **Weather** (`D.weather`): falling leaves in the Thornwood and at the mill, rain in the Mirefen and Highmoor, snow
  around Karrow, and ash on the Ashfall roads.

## Enemies that react, side-boss scenes, inn evenings

- **Line of sight** (`src/hunt.js`): story foes face their way, and if you step into the three squares straight in
  front of one (nothing solid between), it shows a "!" and comes for you; the fight starts when it reaches you.
  Walking up beside one still starts it, as before. A foe you talk down without fighting leaves you be until you
  leave the area.
- **Roaming bands**: every map with random encounters now has 2-4 visible enemy groups drawn from its own encounter
  table, with a red ring at their feet. They wander near where they started, look the way they walk, and chase you
  the same way. A band you beat stays gone until you rest at an inn or camp, after which the bands return in new
  places. Random encounters on those maps are about half as frequent. Nothing hunts during cutscenes, menus or the
  tutorial. `tools/hunttest.py` checks the spawning, spotting, chasing and fighting.
- **Side-boss scenes** (`D.bossScenes` in `data/ch9_world/i_scenes.js`): a few lines before the first attempt at nine
  side-boss fights that had little lead-in (One-Ear, the Eel King, the frost troll, Old Whitepaw, the Collector
  Engine, the Rat Mother, the Ashen Knight, the Cinder Brute, the Hollow Self).
- **Inn evenings** (`D.innTalk`): each inn rest plays the next short scene the party has not had yet, newest chapter
  first (twelve in all).

## Save slots and the heroes' epilogue

- **Three save slots.** Slot 1 keeps the old single-save key, so earlier saves appear there. The title screen has
  Continue (the most recently saved slot), Load Game, and New Game (which asks for a slot, and asks before
  overwriting one). In the game, Menu > Save asks which slot to save to; the quick-save key and every autosave go
  to the slot the game is in. A save code can be loaded into any slot. `tools/slottest.py` checks it.
- **The heroes' epilogue** (`D.scripts.epilogueHeroes`, `data/ch9_world/i_scenes.js`): after the valley's epilogue,
  a card names your ending (The Fifth Stanza, Ennet Goes Home, or The Grey Lamp), then one card for each hero:
  Runa's depends on whom she sat up with on the camp nights (or whether she walked alone), and Dask's, Maren's and
  Finch's on how much they approved of you (three tiers each). A last card at the Crooked Lantern depends on the
  three approvals together. The `endtally` script command works out the camp nights and the approval total.

## Combat: terrain, openings, props, once-a-fight moves, bosses (`src/terrain.js`)

- **Terrain** is laid down from the place each fight happens (`B.makeTerrain`): **high ground** (raised squares;
  +1 to hit anyone lower, -1 hitting up at someone on it, and bows, thrown weapons and spells reach one square
  further from it), **rough ground** (brush, rubble, mud, drifts; costs 2 squares of movement), and **fire** (burns
  anyone who ends a move or starts a turn in it; the Ashfall country has some). **Cover**: a low obstacle right
  beside a target, on the side a shot comes from, gives -2 to hit from further than one square. Hovering a square
  says what the ground there does, and the hit chance and roll text include it.
- **Openings**: reach an enemy (roaming or story) from behind and you get the first round; let a chasing one
  catch you with your back to it and its side moves first, with some of them behind you. Bosses never give an
  opening.
- **Props**: powder kegs (anyone can set one off from up to 5 squares: it blasts everything next to it and sets
  other kegs off) and braziers (kick one over from beside it: fire spills three squares on, for three rounds).
  They appear under **Use** in the battle menu.
- **Once a fight, free**: Runa's **Shove** (two squares; into something solid it slams, for damage and a stun),
  Dask's **Smoke Pellet** (Hidden, and rattles everyone next to him), Maren's **Lamp Flare** (stuns undead within 2,
  dazzles the living), Finch's **Hush** (one foe falls asleep). They are at the end of each hero's Skills.
- **Bosses**: every few rounds a boss marks a 3x3 area in red and brings a great blow down there on its next turn
  (step out); at half health it is enraged (+2 damage) and, if it is nearly alone and the fight has no waves, calls
  its weakest follower (who gives no XP). **Objectives**: the Last Watcher only has to be outlasted (5 rounds), and
  the Collector Engine must be beaten within 12 rounds (14 if you found its schedule) before it reaches full steam,
  enrages and scalds everyone a little each round.
- Balance: with the autopilot, losses across the chapter 4 routes are about the same as with all of this switched
  off (`B.CLASSIC = true` turns terrain, boss blows, phases and objectives off, for comparisons).
  `tools/combattest.py` exercises terrain, props, the once-a-fight moves, openings, bosses and objectives.
- The autopilot used by the balance runs steers clear of fire and marked squares, and likes high ground.

## The diamond board (`src/iso.js`)

Battles can be shown two ways: the **diamond board** (the default: the board seen at an angle, as in tactics
games) or the original **flat board** seen straight down. Rules, squares and pieces are the same in both; only the
drawing and pointing change. Switch in Options > Battle board, with V mid-fight, or with the first of the small
buttons at the top left of the battle screen (G.opts.bview: 'iso' or 'flat').

- **Turning**: Z (or [ or ,) turns the board left, C (or ] or .) turns it right (actions rot_l / rot_r, rebindable), or use the ⟲ ⟳ buttons, which show their key. The battle board's keys (V, T, Z, C) only work in a fight and take precedence there, so in battle Z turns the board rather than confirming (E or Enter confirm) and C turns it rather than switching leader; everywhere else Z and C keep their usual jobs.
  It turns in quarter steps with a short spin (B.rot counts quarter turns; the shown angle eases toward it
  over 380 ms). Each fight opens turned so the party stands on the near side, to the right, clear of the command list.
- **Projection**: rotate (x, y) about the board's middle, then sx = 168 + (rx - ry) * 12, sy = 122 + (rx + ry) * 6 - z.
  Things are drawn back to front by rx + ry. High ground stands up 7 px as a block with lit sides; walls are 19 px
  stone blocks with brick courses; the slab shows its near sides. Other obstacles reuse the flat board's sprites.
- **Hidden pieces**: a wall, tree, pillar or other tall obstacle in front of a piece (or of the cursor) fades to a
  third, so nothing is lost behind it. A small gold marker floats over the cursor's square when no piece is on it.
- **Facing**: pieces still face left or right on screen, chosen from their last step or swing (u.fdir) and the angle.
- **Pointing**: B.isoPick finds the topmost thing under the pointer: a piece's figure, then the square's top (and a
  raised square's sides). Arrow keys move the cursor by screen direction (up = up and to the right) at every angle.
- **Speed**: the ground is painted once per fight onto a square canvas and laid onto the board with one transform;
  the slab and ground are then cached per angle, so a still diamond board costs about the same as the flat one.

## Battlefield shapes, new ground and new objects (`src/shapes.js`, `src/terrain.js`)

**Shapes.** About a third of fights are on the classic 12x12 square. The rest are on a 14x14 board cut to a shape that
suits the setting (B.SHAPES, weights per setting in shapes.js). The same spot always gives the same shape.

| Shape | Where | What it is |
|---|---|---|
| clearing | forest, fen, snow, town, beach | a rough circle: the corners fall away |
| river | forest, fen, snow | a stream with three fords (shallows); frozen in the snow (ice, with a hole or two) |
| hill | forest, cave, snow, ash | high ground across one end, held by the enemy (or, 40% of the time, by you), a broken slope below |
| chasm | cave, snow, ash | a chasm down the middle, crossed by two bridges |
| hall | crypt, throne, city, cave, sewer | eight squares deep: pillars; a water channel with two crossings in a sewer; ragged walls in a cave |
| cross | crypt, throne, city, town, sewer | two passages crossing; the corners are solid |
| pit | cave, crypt, throne, ash | a pit in the middle (its lip burning in the ash country) |
| gates | crypt, city, town | a wall across the field with two gates (a barricade of crates and barrels in a town) |
| bog | fen | pools of black water, shallows round them |
| shore | beach | the sea along one side, shallows where it comes in |

Missing squares (B.voids) are simply not part of the board: B.inside is false there, so nothing stands on, walks
through or aims at them, but sight passes over. Shoving someone off an edge into a chasm or pit is a **fall**
(2d8 + half Runa's power + 2, stunned). Every shaped board is checked (B.shapeOk): all open squares connected, at
least 10 squares for each side to deploy in; otherwise the fight falls back to the square board. Pieces are drawn
a little smaller on 14x14 boards, which keep the same size on screen. Guided fights, brawls and B.CLASSIC always use
the square. A map or group can force a shape with `board: '<shape>'`.

**New ground** (B.TERRAIN): **bridge** (the way across a chasm or channel; doesn't burn), **shallows** (2 to enter;
nothing burns), **ice** (-1 to hit when swinging from it; a shove slides on; fire melts it to shallows), **smoke**
(ash country: blocks sight through it), **hallowed** (crypts and throne rooms: undead who start a turn on it take
1d6 + level/3; the undead avoid it).

**New objects** (Use command; B.PROP and B.HANG):
- **Loose boulder** (cave, snow, ash) and **felled log** (forest, town, beach): stand beside it; it rolls away from you
  and hits the first one in its path (2d6 + level/2 + 2, knocked flat), stops and stays there; off an edge it is gone.
- **Beehive** (forest): from up to 4 squares; everyone next to it is stung and poisoned for 3 rounds.
- **Gas vent** (fen, sewer): from up to 5 squares; blows up like a keg, with fire in a plus round it.
- **Overhead**, over an open square (B.hangs): **chandelier** (crypt, throne; leaves the floor burning), **icicles**
  (snow; leave ice), **cracked ceiling** (cave; leaves rubble). From up to 5 squares: 2d6 + level/2 + 2 and stunned
  for whoever is under it, 1d6 + level/4 for anyone beside.

**Enemies use objects too** (and the autopilot): B.propChoice weighs who each usable object would hit (foes count 1,
a direct hit with a roller or a falling thing counts a little more, its own side counts -2.5) and uses the best one if
it is worth at least 1.6. So a keg beside two of your heroes is a real danger.

`tools/boardtest.py` builds every shape on every setting (6 seeds each), counts shapes per setting, checks every
object and kind of ground, the AI's choices, and plays a fight on every shape in both views.

**Boss fights stay as tuned.** Bosses were balanced by hand on the open square with the original ground (high, rough,
fire) and props (kegs, braziers). Sims of the chapter 5 bosses showed the new hazards swing them hard both ways
(smoke in the ash country took the Ashen Knight from about 50% to 9% for a rested party at level 21; hallowed ground
made the Hollow Self far easier). So in a boss fight: the board is the square, a clearing or crossing passages; only
the original ground and props appear; and only the party uses props (enemies have marked blows and phases instead).
Ordinary fights get everything; across chapters 1 and 2 they cost the party the same share of its health as before
(about 14-15% a fight for a rested party at the chapter's level).

The spark particles thrown by hits are no longer made while a fight is skipped or fast-forwarded, are capped at 800,
and are cleared at the start of every fight (before this they piled up in long fast-forwarded sessions).

## Pace, holding ground, undo, threat and preview (`src/tactics.js`)

- **Battle speed** (Options > Battle speed; G.opts.bspeed): Normal, Fast (the default) or Swift. It scales how long a
  message holds (B.msg) and how fast pieces walk and strike (B.pace). Routine hits and misses hold for about two
  thirds as long again, since their numbers pop up over the pieces. Any message can still be skipped with a press or
  a click on the log. Measured before: an ordinary fight held 25-65 messages at 1.35 s each.
- **Holding ground** (both sides): walking out of an enemy's reach (from a square beside it to one that isn't) gives it
  a free strike: a snatched blow at -2 to hit, once a round per enemy and at most one per move (the first enemy left
  behind swings). B.provokes finds it; B.walk stops for it, then carries on. A boss winding up a marked blow takes no
  free strikes, so stepping out of the red squares is always safe. (Full-strength strikes from every enemy left
  behind raised chapter 3 losses on the autopilot routes from 19 to 30; this version gives 18.) Asleep, stunned and
  charmed enemies don't strike; a hidden unit isn't seen; Dask is light-footed and never provokes; leaps, shoves and
  falls don't count. Off in B.CLASSIC, brawls and the guided tutorial fight. The AI and autopilot count a free strike
  as a cost when choosing where to stand. When moving, the log names who would get a free strike and a ! marks them;
  the attack preview does too.
- **Undo move**: after a Move, and before acting, "Undo move" (U or 8) puts the hero back, unless something happened
  on the way (a free strike, fire): B.eventSeq counts anything that can't be taken back.
- **Threat**: T or the ⚔ button (top left) shades every square an enemy could strike next turn, walking and then
  using its weapon or its spells (B.threat, cached). Deeper red where several could. Always shown while choosing a
  Move.
- **Preview**: aiming at an enemy shows the chance to hit, the damage range and whether it could knock them out, in
  the log and as a tag over the target (B.preview, B.drawPreview); spells show their damage range too.

## Exploring abilities in the wider world (`data/ch9_world/k_explore.js`, made by `tools/explore.py`)

Forty more places, two per hero per chapter, outside the puzzle dungeons (before: one per hero per chapter). Kinds:
shortcuts (Runa breaks through, or Dask unlocks a gate; both ends then work as a two-way passage across a big map),
caches, moral choices (Dask can open it; should he?), Maren's way-lamps (the party starts its next fight Blessed,
flag blessNext), laying the dead to rest, Runa's rescues and a clan arm-wrestle, and people Finch wins over. Spots
were chosen by `tools/explore_find.py`: reachable squares against a wall, away from doors and people, that do not
cut a map in two. `tools/exploretest.py` checks all 40 are reachable and that every script works (shortcuts carry you
across and back).

## Level-up choices (`src/core.js`)

Whenever a hero would learn a skill (from level 2 on), the player picks: that skill, or a lasting improvement instead
(G.MASTERY: Tough +10% health, Mighty +1 damage, Sharp +1 to hit, Guarded +1 AC, Steady +1 saves, Deep Well +20% SP,
Potent +1 power, Quick +1 speed). The one passed up is gone. Each improvement can be taken three times; which is
offered rotates through the hero's own list (G.MASTERY_ORDER). Choices queue on level-up (G.S.pendingPicks) and are
offered as soon as the party is standing free in the field. A level with no pick recorded teaches its skill, so
older saves keep everything, and the autopilot always takes the skill (so balance runs are unchanged). The
character sheet lists improvements taken.

## Bonds (`src/bonds.js`, `data/ch9_world/l_bonds.js`)

- **Trust**: each companion's trust in Runa (bond.dask / .maren / .finch): Doubting (-2 or less), Steady, Trusting
  (4+), Devoted (10+). **Friendship**: how two companions get on (bond.dask_maren / .dask_finch / .maren_finch): At
  odds (-2 or less), Easy, Friends (3+), Close (6+). ['bond', key, n] moves either; a pair key shows "X and Y grow
  closer / apart".
- **In a fight**: friends side by side +1 to hit, a pair at odds side by side -1; a companion who trusts Runa beside
  her gives both +1 AC, one who doubts her -1. Bonds move in a fight too (once a fight per pair): reviving someone or
  healing them below 30% brings two closer; catching a friend with a keg, a boulder or something dropped from
  overhead does the opposite. Changes are listed after the victory.
- **New moments, both ways**: 15 of the new exploring spots (moral choices, rescues, rests, songs), and 15 inn
  evenings (D.bondTalk, every other inn rest, alternating with D.innTalk), with choices: siding with one companion
  over another, mediating, teasing. A trust or friendship gone sour gets its own evening first, with a chance to mend
  it. The epilogue adds a card for each pair who ended up close, or never made peace. The character sheet shows trust
  and friendships.

- **What each level does** (small on purpose; the party screen lists what is active):

  | Bond | In a fight | Outside a fight |
  |---|---|---|
  | Dask's trust | Trusting/Devoted: +1 AC to both beside Runa; Devoted: +1 to hit too. Doubting: -1 AC | Shop prices -5% (Trusting), -10% (Devoted), +5% (Doubting) |
  | Maren's trust | the same | Prayers heal and restore x1.15 / x1.3, or x0.85 when Doubting |
  | Finch's trust | the same | Songs pay x1.25 / x1.5, or x0.75 when Doubting |
  | Friends (3+) | +1 to hit beside each other | after a won fight, they patch each other up: 4% health back |
  | Close (6+) | +1 to hit and +1 AC beside each other | 8% health back after a win |
  | At odds (-2) | -1 to hit beside each other | none |

  The to-hit and AC bonuses top out at +2 each. `G.bondScale`, `G.shopPct`, `G.prayerMul`, `G.buskMul`, `G.patchUp`.

`tools/tacticstest.py` and `tools/progtest.py` check all of the above.

## Maren's prayers and Finch's songs (`data/ch9_world/m_places.js`)

Maren's blessing and Finch's busking used to work anywhere (any place for Maren, any town for Finch). Now each has
its own places, and each place does its own thing. Lead with the right hero and use the ability there; each works
once, then is fresh again after a rest (inn or camp: `Hunt.rested`).

- **13 prayer places** (`D.prayers`): Brackenford's altar, the roadside shrine, the bone-chapel, the sailors' chapel,
  the drowned bell-shrine, the broken abbey altar, the Karrow ancestor-stones and hearth-shrine, the cathedral's
  forgotten side-altar, the catacomb lamp, the Wardens' field altar at Ashfall, a Warden's tomb-lamp, the burnt
  chapel. Each heals a share of health, restores skill points, or blesses the next fight, in its own mix.
- **12 venues** (`D.venues`): the Lantern's common room, the market cross, the mill yard, Saltmere's fish docks, the
  inn hearth, the salt-rakers' hut, Karrow's long hall, a picket's fire in the Frost Pass, Highmoor's fountain square
  and taproom, the printers' tea-break, the war camp's cookfire. Each pays gold (times the chapter), and some add a
  potion or tonic, or leave the party Inspired for the next fight.

A place is found when you first enter its map (a toast says so; older saves count every map already visited). Found
places show on the Area map (+ for Maren, ♪ for Finch, faded until a rest), as dots beside place names on the Region
map, and on two journal pages, "Maren's prayers" and "Finch's stages", one line each with what it does now (trust
included) and whether it is ready. `Field.places`, `Field.notePlaces`, `Menu.placesPage`.

Script commands `['pray', id]` and `['busk', id]`. `tools/placestest.py` checks them; `tools/exploretest.py` checks
each one can be reached.

## Combat quips (`src/quips.js`, `data/ch9_world/n_quips.js`)

The heroes talk in a fight: a speech bubble over the piece that never holds up play. 76 lines each (304 in all), in
15 kinds: start, boss, turn, hit, crit, miss, kill, hurt, low on health, ally down, revived, healed, skill, win, flee.
Each kind has a chance to speak and there is a gap between quips (urgent ones, like an ally going down, can talk
over it). Each hero works through a shuffled deck of lines before any repeats. Options: Party chatter, Often /
Sometimes / Off. Nothing shows in fast mode.

## The journal (`src/menu.js`, `data/ch9_world/o_journal.js`)

- **Open quests** are grouped by region: the region the current step happens in (`D.questRegion`: one region per
  quest, or `{ stage: region }` when the steps move about). Regions are broad on purpose ("Thornwood", "The Frost
  Pass"), never a spot, so the journal says where to look without pointing. The newest chapter comes first; quests left
  over from an earlier chapter sit under "Earlier chapters". ◆ marks the story quests (`D.storyQuests`); a dot marks
  a quest with a step you have not read yet.
- **A quest page** shows the chapter and region, every step already done ticked and struck through, and the current
  step under "Now:". A finished quest ends with its outcome (★). The steps reached are logged as they happen
  (`G.S.qlog`), so a step that was skipped is never shown as done; older saves show every step up to the current one.
- **Records**: Completed (finished quests by chapter, newest first, each readable step by step), the chronicles, the
  bestiary, Maren's prayers and Finch's stages.

## Writing conventions (checked by `tools/texttest.py` where it can be)

- British spelling throughout: armour, colour, honour, harbourmaster, travellers. (Internal names such as the item
  type `armor` stay as they are; only what is shown on screen is British.)
- The heroes almost never use contractions ("It is", "I do not"); Finch never does. Combat quips follow the same rule.
- Finch is he/him.
- Every named character has a name nobody else in the game shares. (Two minor clashes were renamed: Karrow's skald is
  Solveig, not a second Eydis; Brannoc's cousin in the old tower is Tolan Vosk, not a second Hask.)
- Choice prompts must fit the dialogue box (they are not split into pages); ability descriptions and battle intros
  must fit the battle log. Menu descriptions shrink a little to fit when they run long.

## Drawing the field: furniture and wall pieces (`src/field.js`, `src/gfx.js`)

- Furniture (`Field.FURN`: tables, beds, barrels, crates, shelves, pillars, altars, statues, braziers, graves, wells,
  lamps and so on) is drawn after the floor, with a dark outline and a soft shadow, so it reads as an object and not as
  part of the floor. Solid things with no script (`Field.FURN_THING`: coat stands, sacks, notice boards...) get the
  same. Things you can use keep the stronger look (outline, a light rim along the top, a shadow). Trees, rocks and floor
  scatter are left plain. `G.gfx.drawThing(c, id, x, y, style)`: style 'pop', 'furn' or 'wall'.
- Wall pieces (`Field.WALLMOUNT`: shelves, fireplaces, carved murals) stand against the wall when the square above is a
  wall (`Field.WALL_TILE`): shelves and murals are raised so their backs meet the wall face, with a shadow at the foot;
  a fireplace gets a stone chimney breast and a mantel built into the wall above it. Away from a wall they are drawn as
  free-standing furniture.

## Leaving and waiting

- Main menu > Quit to title: save and quit, quit without saving, or stay. During the opening brawl (which cannot be
  saved) it is just quit or stay.
- E is the main interact / confirm key (Z and Enter also work; End turn moved to 7 or N). Saved key settings get E
  once, unless the player put E on something else. On-screen prompts are written with the action, not the key
  (`'Press {a}'`), and `G.keyText` fills in whatever key is bound, so they stay right after rebinding.
- Options: a wider list so every setting reads in full; the panel beside it only appears on Controls (your keys) and
  the save-code items. The Controls screen is wider too.
- Only the four directions count as movement keys. (Holding C to switch leader, or F for the leader's ability, for
  longer than a frame used to crash the field and freeze the game.)
- Every "press a key to go on" moment (the dice roll of a skill check, title cards) also goes on with a click or tap
  anywhere, and the dice roll says so. (A player advancing dialogue by clicking used to get stuck at the coat stand in
  the opening inn: the roll box only took Z/Enter or X, and said nothing.)

## Conveniences

- **Interact prompt**: a small key (E) over whatever the interact key would use when you face it: a person with
  something to say, a sign, an unopened chest, a pickup, a scripted object (also across a shop counter). Nothing for
  plain scenery. It points at what is in front of you only. `Field.target`, `Field.hasUse`, `Field.drawPrompt`;
  Options > Interact prompts turns it off.
- **Running**: hold Shift (the rebindable Run action) to move about twice as fast; Options > Always run makes running
  the default (then holding Run walks), for touch players. Cutscene moves keep their pace. `Field.moveMs`.
- **Gear comparisons**: the Gear menu's Equip list marks upgrades ▲ and downgrades ▼ and shows, in green and red,
  every stat that changes against what the hero wears now (damage dice and item powers included). Shops show the same
  for every hero who can use the item, and after you buy gear offer to put it on, best upgrade first.
  `Menu.compare(member, item)`, `Menu.offerEquip`.
- **Dialogue log**: the last 80 lines said or narrated, and the choices you made, kept in the save
  (`G.S.dlog`, written by `UI.say` and `UI.choice`). Journal > Recent conversations lists them newest first; each opens
  with the lines around it and where it was said.
- **Patch up the party**: the first entry in Items when anyone is hurt. It spends as little as it can (the most hurt
  hero gets the cheapest draught that covers what they are missing, or the strongest if none does; nobody gets one for a
  scratch), shows what it will use and everyone's health after, and asks first. `Menu.patchPlan`.

## Putting the game online (GitHub Pages)

The whole game is one file. `python3 tools/build.py` writes it to `dist/index.html` and to `docs/index.html`; the
`docs` copy is there because GitHub Pages can serve a site from a repository's `docs` folder.

1. Make a new **public** repository on GitHub (Pages is free for public repositories).
2. Upload the contents of this folder (README.md, data, docs, dist, src, tools), not the zip itself: on the
   repository page, Add file > Upload files, and drag the folders in.
3. Settings > Pages > Build and deployment: Source "Deploy from a branch", Branch `main`, folder `/docs`. Save.
4. After a minute or two the game is at `https://<your-username>.github.io/<repository-name>/`.

To update it later, rebuild and upload the new `docs/index.html` (and any changed source). Saves live in each
player's own browser, tied to that address: moving the game to a new address starts everyone fresh, but save codes
(Options > Export save) carry a game across.

## The Guide (`data/ch9_world/p_guide.js`, `Menu.guide`)

Main menu > Guide, or H from anywhere while exploring: the rules and the things worth knowing, one short page per
topic in six groups (Getting started, Exploring, Combat, Growing stronger, Puzzles, Saving and settings), 22 pages in
all. Keys in the pages are written as actions (`{a}`, `{run}`, `{threat}`...) and show whatever the player has bound.
Every number in it comes from the rules in `src/`; change a rule, change its page. `tools/texttest.py` checks that
every page fits its panel and names only real keys.


## Player's Handbook

The top of the Guide (Menu → Guide) holds the **Player's Handbook**: the long read. Nine rules pages cover rolls, stats,
attacking, criticals and Sneak Attack, saves and checks, initiative and fleeing, the full XP table, improvements, feats and
conditions. There is a page for each hero with their role, starting stats and gear, ranged and melee traits, every skill
with its level and cost, their improvement order and their feats, and a **level 1–30 table** (HP, resource, Attack,
Damage, Power, Save, AC, Sneak dice for Dask, and the skill on offer). The hero numbers are computed from the game's own
data when the page opens (`src/handbook.js`), so they stay correct whenever the balance changes. Pages open in a reader
that scrolls with the arrows, the wheel or a swipe.

## Visual pass

- **Condition badges** (`src/icons.js`): each condition over a battle piece is a small drawn badge (flame for Rage, shield
  for Guard, zz for Asleep, drop for Poisoned and so on), rimmed blue when it helps and violet when it hurts.
- **Damage numbers by kind**: fire orange with a flame, holy light pale gold with a sun, poison green with a drop, songs pink
  with a note, other spells violet, frost blue; crits are big and gold with a star; heals green with a plus.
  `B.hurt(t, dmg, { kind })` sets it; `B.spellKind` picks it for skills.
- **Ground marks**: a faint glyph in the corner of high ground (▲), rough ground (pebbles), shallows (waves), ice (flake)
  and hallowed ground (sun), on both board views.
- **Dialogue portraits** (`src/portraits.js`): the speaker's face, cut from their battle figure. Heroes always; other
  speakers when their figure can be matched by name or by the person whose script they speak in (about 100 of 115).
- **Field effects** (`src/fieldfx.js`): lamps, hearths, braziers and lit crystals cut through the dark in crypts and glow
  warm indoors (`Field.LIGHTS`); each kind of place has its own air (fen fog, crypt dust, woodland pollen, ash embers,
  sea mist); unopened chests, pickups and unread hidden notes glint now and then; opened chests lose their outline; and
  faint clues mark secrets Dask has not found yet (a seam in a wall, a stain over a trap, a dusty edge round a plate),
  fading in as the party comes within a few steps.
- **Painted scenes** (`src/scenes.js`): the title screen, and a living picture behind each "Chapter ..." card (the
  Thane's Barrow under a crescent moon, the Drowned Abbey at sea, standing stones in the snow, Highmoor at night, the
  Ashen Road under the crown's ghost). Drawn in vectors at screen resolution.

## Heroic-scale heroes and Biographies

- **Heroic-scale figures** (`src/heroic.js`): the four heroes as realistic painted miniatures, real anatomy with the
  head, hands and gear a little larger than life, and width from cloaks, pose and weapons rather than bulk. Runa holds
  the great axe across her body under a wolf pelt (its head on her shoulder), with plaited braids and a woad band
  across her eyes; Dask crouches low, hood up and scarf over his mouth, a knife in each fist and his cloak flaring;
  Maren wears the Warden-blue cloak and holds her lantern out at arm's length, lighting her own robe; Finch has the
  lute across him, his cape flung back, the rapier at his hip and a wide plumed hat. One warm key light, a cool rim,
  wear and dirt. Options -> Battle figures switches every figure back to the classic style (`B.clearPieces()` repaints).
  Turn chips, dialogue portraits and biographies paint the heroes' faces at high resolution.
- **Biographies** (Journal -> Biographies; data in `data/ch9_world/t_bios.js`, page in `src/bios.js`): the party and
  43 people of note: friends, those in between, the dead met in the mirror under the Ashen Road, and foes. A person appears once they have spoken to you (`met.<speaker>`, set by every
  line of dialogue) or a story flag says you crossed paths; each paragraph has its own condition, so a biography grows
  with the story and never spoils what is ahead. A condition may use `|` for "either" (a secret can come out more
  than one way). Each choice's outcome has its own line (how Runa answered her oath, how Dask's debt was settled,
  which ending), checked against the scenes that set those flags. A • marks lines not yet read.

## Heroic style for every figure

With Options -> Battle figures on Heroic (the default), every figure on the board is painted like the heroes:
- **People** (`src/figures.js`, heroic mode via `B.paintSpec(..., H)`): the same gear and colours from each spec, on a
  realistic figure. The body is stretched taller from the feet (`bodyT`); the head is drawn at real size on a real
  neck (`headT` maps the old head's coordinates onto it, so hair, hats, helms, hoods, beards and masks still fit), with
  the heroes' realistic face, shaped hands, and folds in robes, tunics and legs.
- **Animals** (`src/beasts2.js`): new anatomy for the wolf and alpha, bear, rat and rat king, bat, spider, crab and
  eel; the colossus (a real skeleton), the golem (stacked, cracked, mossed boulders round a burning rune) and the
  automaton (a clockwork knight). Heads stay where they were, so portraits and turn chips crop the same place.
- **Spirits and the rest** keep their shapes, with smoky hollows for faces instead of cartoon eyes; the ooze has no
  face; the bogling has a wet maw instead of a grin.
- **All of them** get the heroes' finish (`B.heroicKit`, `H.finish`): their own layer, a warm key light, a cool rim,
  weave or fur grain, road dirt toward the feet, a little less saturation, a contact shadow, and the thinner outline.

## Heroic figures, second pass (`src/heroic2.js`)

The four heroes are repainted on a shared anatomy kit (`B.heroicAnatomy(H)`, made by `A.make` in heroic2.js), and
every other person uses the same kit through `B.paintSpec`:
- **The kit**: `X.limb` (tapered limbs with knees and elbows, lit from the upper left; `fill` and `edgeFrom` let an arm
  share the body's light and keep its edge shading below the elbow), `X.boot`, `X.fist`, `X.head` (one face for all:
  lids and creases, ringed irises, a soft nose, shaped lips, brows, a slim neck under the back of the skull; options for
  freckles, age lines and spots, a mole, a dimple, woad), `X.cloth`, `X.tex` (wool and linen weave, leather grain, worn
  metal, wood grain, fur, hair strands), `X.stitch`, `X.rivet`, `X.band` (embroidered borders), `X.buckle`.
- **The heroes** (`B.HEROIC2`): Runa in a wide stance with the axe across her; Dask low with two knives under his hood;
  Maren with her lantern raised; Finch en garde with the rapier, the lute on his back. The old painters stay in
  `B.HEROIC_OLD` for comparison. Their portrait crops are `FACE2` at the end of heroic2.js.
- **Everyone else** (`src/figures.js`): tapered arms that run from the base of the neck over the shoulder to the wrist,
  lit with the body's own gradient; the garment's shoulders laid over them, trimmed to the body and arms and faded
  down the arm (or, for a sleeve of another colour, a sewn seam); bare arms come out of an armhole under a strap.
  Legs with knees, real boots, rag-bound feet; textures by armour (leather, linen, wool, plate with rivets, mail
  inside the sleeves); embroidered tabards; long hair, braids and beards with strands; robed undead wear sleeves.
- **The finish** (`H.finish`): `clean` keeps the weave off faces, `pop` brightens and `grade` lightens the shadow
  corner; people, heroes and beasts all use them.
- **Portraits**: people and beasts are painted again at 7x for turn chips and dialogue (`paintHi` in pieces.js), the
  heroes at 14x. Options -> Battle figures -> Classic is untouched.

## Cosmetic pass: bosses, expressions, idle life, light, title (Nov 2026)

- **Map sprites**: the heroes' `D.sprites` and `D.looks` use the new palettes; Finch's speaker colour is rose.
- **Expressions** (`UI.mood` in portraits.js, `B.withExpr` in heroic2.js): a line's wording picks happy, angry, worried
  or sad (cautious word lists, with a `NOT` list for wry or negated phrases; about 1 line in 27 changes face). The face
  moves brows, lids, gaze and mouth. Portraits cache per mood (`B.faceURL(sprite, side, mood)`); people only, heroic only.
- **Bosses** (`src/bosslooks.js`): the boss fight's lead foe is `boss: true` and painted as side 3: crimson-and-gold
  plinth with a crown medallion, an aura in its own colour (`B.bossAura`), 10% larger. `B.bossSig[name]` adds a
  signature detail for the chief villains (King, Corr, Veyra, Vosk, Ilsabet, ash knights, Abbot, Grukk, Vell, Ashby, Hesk).
- **Idle life** (drawUnit): weight-shifting sway from the base, lantern and spirit light flicker; off under reduced motion.
- **Battlefield light** (`B.envLit`, `ENV` in pieces.js): each setting's wash and side light on the figures, cached per
  piece; a flickering warm glow near braziers and burning ground (`fireNear`).
- **Title** (`Title.lineup` in main.js): the four painted heroes in moonlight, facing the barrow; classic keeps the sprites.

## Beasts, story faces, townsfolk, slow phones (Nov 2026)

- **Beasts** (`src/beastmat.js`, beasts.js, beasts2.js): fuller eyes in the heroic style (`K.eye` with `K.real`); the bear
  rebuilt (tapered legs, paws, hump, brow); wolf paws; `B.beastMat[name]` lays a surface over each creature's own layer
  (chitin, scales, worn metal, bone, mud, ooze depth, lichen).
- **Story faces** (`src/moodlines.js`): `UI.moodFor(text)` checks a hand-picked table of 109 lines (prefix match, exact
  for short ones; 'usual' forces the normal face) before falling back to `UI.mood`.
- **Townsfolk** (`B.townSig` in bosslooks.js): one signature detail each for 13 recurring people.
- **Slow phones**: chips (turn order, party bar) use `B.faceURL(id, side, null, true)`, a crop of the battle piece; hero
  dialogue faces are painted at 10x; `B.warmFaces()` paints the party's battle figures and every mood of their faces
  ahead, in idle time, from each `Field.enter`.

## Miniature bases (Nov 2026)

In the heroic style every piece stands on a painted miniature's base (`miniBase` in pieces.js) instead of the lacquered
plinth: painted sand with stones and static grass, a soft cast shadow, and a wide rim in the team colour between gold
lines (`RIMS`: blue heroes, red foes, green guests, crimson with gold studs for a boss). Classic keeps the plinths.

## Reachability pass

`tools/reachtest.py` walks the whole game from the new-game start, through every door, stair and story move, and lists any map or thing the party can never reach. It found three sealed areas, fixed in `data/ch9_world/u_fixes.js`:

- **The Last Door (hollow2):** the arrival stairs blocked the only corridor, so the level (and the way on to hollow3) could not be entered. A floor tile beside the stairs opens it.
- **The Sleepers' Vault (vault3):** the third brazier was boxed in behind the chest, so the stone door could never open. The chest moved into the brazier's alcove.
- **The Thornwood glade:** once the old tower's stairs appear they filled the one path into the web glade. A second lane runs beside them.

Out of reach on purpose: cutscene maps (v_*), shopkeepers behind counters, prisoners in cells, and animals in pens.

## Turning, and harder puzzle dungeons

- **Turn in place.** From a standstill, a new direction only turns the leader; holding it on walks. Already walking, a change of direction steps straight off, so running round corners stays smooth. A press too quick to be seen held still turns (or, if already facing that way, steps once). `src/field.js` (Field.TURN_MS), `src/core.js` (G.tapDir).
- **Rooms you can ruin.** Every puzzle dungeon now has at least one room where a careless move leaves it unsolvable, so you have to plan, fail and start over:
  - Millrace Cellars: five rooms, two millstones and two plates each (R2's drain plates hidden for Dask).
  - Hollow Barrow vault: brittle bone-floor (each cracked square holds once) and four lamps in skull order.
  - Drowned Chapel: two toppled saints and two plates, one at the head of the tide aisle.
  - Sea-Caves grotto: the gull-song struck in order from a shelf of rotten rock.
  - Ice Halls: three rinks, two sliding blocks and two plates each.
  - Echo Spire: five mirrors, five bell-stones each turning two, struck from a rotten gallery walked once.
  - Undercroft of Lamps: two rows of pit and two boulders that must go down the same column.
  - Smith's Deep, the Quench: ice, a pit any stone fills, and a plate that only one bridge lets you reach.
  The Inquisitor's Archive (see below) was reworked later into a sneaking room you can ruin too.
- **New piece: cracked floor** (`pz: 'gap', crack: 1`): crossed once, falls in behind; a block shoved onto it drops through and fills the hole. Sprites crackFloor, rottenPlanks, thinIce.
- **Start this room over**: in the main menu while inside any puzzle room (the reset lever's `area`), as well as the red levers, so a stranded party is never stuck.
- **Solver-checked.** `tools/pzsolve.py` follows the game's rules (blocks, ice, pits, plates, cracked floor, things used in order). `tools/pzgen.py` searched for the rooms; `tools/puzzles.py` re-solves every hard room on each build and writes `tools/pz_rooms.json` (shortest solution, how ruinable), which `tools/puzzletest.py` plays through the real game.
- Old saves: a redrawn room forgets block positions saved under the old layout; a dungeon already finished stays open.

## A real region map, and longer music

- **Region map** (`src/worldmap.js`): a drawn map of the whole land instead of a graph. Sea and coast, the northern mountains with snow, the Thornwood, the fen, the High Moor, the Ashlands and their fire-mountain, two rivers, a compass. Every place has a fixed spot (`WORLD`); shops, inns and the deeper levels of a dungeon share the spot of the place you enter them from (`PARENT`). Markers: houses for towns, circles for open country, arches for dungeons, gold diamonds for puzzle dungeons; names for towns and open country (dungeons only where you stand). Roads join places you have found; dashed long roads join the regions. Each region stays under cloud until you reach it. A pulsing pin shows where you are. The drawing is cached and only redrawn when what you know changes.
- **Music** (`data/ch9_world/w_music.js`, engine in `src/audio.js`): every track now opens with its old theme and goes on into new sections (new chord progressions, a seeded melody-writer with motifs and cadences, pads, arpeggios, counter-lines, drums), looping after one to three and a half minutes instead of 15–30 seconds. New tracks: tavern (inns), crypt, cave, throne (Vael Morn's halls), puzzle (all the puzzle dungeons), battle2 and battle3 (chapters 2–3 and 4–5), boss2 (chapters 4–5). The engine gained detuned and vibrato voices, slow pads, panning, a drum kit (kick, snare, hats, tom) and a room reverb; a place's tune resumes where you left it after a fight. `D.musicFor(map)` and `D.battleMusic(boss)` choose the track.
- **A theme for every boss, and each chapter's own music.** All 49 boss fights have a theme (`D.bossMusic`: 45 tracks, a few shared by the same foe's rematches, like Grukk and his duo, Hask with and without his acolytes, and Corr's three fights). Each takes the band and shape of its kind (brutes pound, the dead toll, beasts stampede, rogues swagger, zealots march, the uncanny glitter), in its own key, mode and tempo. The great foes open with a written-out theme: Grukk, the brawl, the Hollow Abbot, the Keeper, Hask, Veyra (her theme comes back, darker, in her second fight), the Drowned Prior, Captain Gannet, Hrimgar, the Rime-Mother, Inquisitor Vell, Lord Ashby, the Hollow Self, the Lamp-eater Queen, Corr and Vael Morn. Ordinary fights play their chapter's battle music (battle, battle2, battle_frost, battle3, battle_ash), and each chapter's dungeons have their own underground theme (crypt and cave; sunken; cairn; catacomb; cinder, and throne for Vael Morn's halls).
- **Lanes on the battlefield.** An open (square) battle board always has at least four separate clear paths across, the outside rows included (`B.lanes`, a max-flow over open squares moving as units move; `B.ensureLanes` clears the loose obstacle that opens the most until there are four). Shaped boards (chasm, gates, hall, stream...) may stay tight on purpose, but must be crossable: rubble from the map no longer fills a shape's gateways, and the connection check now follows the movement rule (no squeezing diagonally between two blocks), which had let a few boards be sealed in the middle.
- **Shoot the kegs.** Powder kegs, gas vents and beehives can be shot: any attack that reaches past arm's length (Finch's bow, a thrown weapon, a shot) can be aimed at one from any square you could reach this turn (`B.propShots`, `B.shootProp`). An area spell or thrown flask that reaches one sets it off too, after its own damage (`B.areaProps`). The Use action still works as before.
- **Every item explains itself.** Moving the cursor over any item (Items, Gear, shops) shows `Menu.itemText`: its own description, what kind of thing it is and who can use it, every bonus spelled out with what it does (Saves +1: shrugs off poison, sleep, fear and spells), and any special power. The description box grows upward when the text runs long. Charms that had no words now have some.
- **The urchin's Lucky Stone** is its own charm now (Speed +1), not a Lucky Coin (Saves +1). Older saves that got a coin from the urchin have one coin turned back into the stone (`G.upgradeSave`).
- **Random fights: cover outdoors, fewer underground.** Out in the open country, random fights only start in wild cover: tall grass and ferns (Thornwood), reed-beds (Mirefen), snowdrifts (Frost Pass), cinder fields (Ashen Road). Open ground and roads are safe, so exploring is calm and grinding is a choice. `data/ch9_world/x_wild.js` paints extra patches of cover (about a quarter of each map's open ground) where there was little, and tall grass and reed-beds were redrawn to stand out. Underground, a random fight takes twice as many steps to come (half as many fights). Roaming bands are unchanged. XP is unchanged: each chapter's experience is tuned to its level cap and anyone short can grind in the cover.

## Hints, volume, and enemies who use the battlefield

- **Level tuning re-checked.** With fewer random fights, the story-only playtest routes (`tools/levels.py`, which fight only the battles the story forces plus a few wanders) still finish every chapter: chapter 1 at L4 with no losses, 2 at L8, 3 at L13, 4 at L18, 5 at L24. Experience is unchanged, so nothing needed retuning.
- **Hints for every puzzle room.** Each hard room's red lever offers *A nudge* (a hint toward the idea without the answer) and *Tell me plainly* (the whole solution, step by step with arrows: ⇒ a shove, ✦ use). The main menu shows *Hint for this room* while you stand in one. Text: `D.pzHints`, written by `tools/puzzles.py` from the solver's own solution; `Puzzle.hintFor`, `Puzzle.showHint`.
- **Separate volume.** Options has *Music volume* and *Sound volume*, 0–10 (default 7) with left/right; 0 is off. `G.opts.musicVol`/`sfxVol`, `G.volMusic()`/`G.volSfx()`, `Menu.setVol`.
- **Enemies use the battlefield.** Goblin and human foes now look at every square they could move to this turn: archers and throwers shoot a keg, gas vent or hive next to your heroes from range, and anyone can walk up and light one by hand (`B.propChoice`, now with `.path` and `.shot`). They only do it when it catches at least two heroes (or one under a falling thing) and none of their own. Beasts never do; boss fights still leave their own dangers to the boss. A keg is now a risk to manage: don't bunch up beside one with archers on the board.

## The Archive reworked, a puzzle theme per chapter, and the soundtrack page

- **The Inquisitor's Archive, the stacks (R2), is a sneaking puzzle you can ruin.** Three aisles between fixed bookcases, a warden at the west end of each, turning with every step you take; two bookcases on castors (their own sprite, `shelfCart`: pale frame, brass corners, wheels). A warden can't see through a bookcase, so Runa rolls both bookcases west along the bottom aisle and shoves them up through the gaps to close off the two upper wardens' aisles, while the bottom warden (short-sighted) is dodged by timing or by working behind a bookcase. Roll one into a corner or a dead end and the room can't be crossed until the red lever is pulled. Shortest way: 59 moves, 19 shoves, from the lever's spot; about half of all positions are dead ends. Being seen still marches you back to the door with the wardens' rounds started again; so does the lever now (`Puzzle.reset` zeroes `Puzzle.steps` in a room with wardens). Dask's trip-wires moved to the hall of records (R1). The reading room (R3: Finch lulls the porter, Maren lights the lamps in order) is unchanged.
- **Solver for wardens.** `tools/pzsolve.py` `GuardRoom` / `solve_guards`: state is (party, shelves, step count mod the wardens' whole round), with the game's exact rules (a warden faces `turns[(steps // every + offset) % n]`, sees `range` squares in a line, stopped by walls and solid things; you're checked after each step, a shove included). `tools/pzgen.py search_guards` searched library-shaped templates (`stacks4`); a room is kept only if it can't be crossed without moving a shelf, every warden matters, and it's ruinable. `tools/puzzles.py` re-checks the stacks from all twelve moments of the wardens' round on every build, and `tools/puzzletest.py archive` plays the solver's route through the real game and checks it is never seen.
- **Reset lever wording.** *Pull it: start over* is the first choice, a plain reset with no hints; *Read a nudge* and *Read the answer* are optional.
- **A puzzle theme per chapter** (`data/ch9_world/w_music.js`, `PUZZLE`): chapter 1 the music-box (`puzzle`), chapter 2 bells under water (`puzzle_tide`), chapter 3 glass and mirrors (`puzzle_frost`), chapter 4 the four lamps (`puzzle_lamp`) and, for the Archive, a plucked creeping theme (`stealth`, its opening tune written by hand), chapter 5 hammer and quench (`puzzle_forge`). New instruments: pluck, glass, anvil, organ.
- **More places with their own tune** (`PLACE`): every shop (`shop`), temples and chapels (`hymn`), the Duke's palace and counting-house (`court`), dreams and the mirror (`dream`), the ice caves and the ice shrine (`frostcave`). 84 tracks in all.
- **The soundtrack page** (`tools/playlist.py`, template `tools/playlist.html`, output `playlist/index.html`): every track played by the game's own engine, grouped (the road, story, underground, puzzle dungeons, battles, boss themes), with where each plays and its length; plays each through once then the next; Keep / Change and a note per track, saved in the browser; *My notes* gives text to paste back. Rebuild with `python3 tools/playlist.py dump` (reads the built game).
- **The build refuses a page that won't load**: `tools/build.py` syntax-checks every source file with node first.
- **An epic title theme.** The title is now an overture on the old theme (about 2½ minutes, A minor, 76 bpm): timpani and strings, the theme on detuned brass, a climb through i–VI–III–VII, the theme again an octave up over horns, a march and a galloping bass, then a hush before it loops. New instrument set `I.epic`, new drum patterns `timp` and `epic`.

## QA pass (Nov 2026)

- **Whole game played through:** every story route in all five chapters (45 routes: main story only, some side content, dungeons, everything, and random choices) reaches the end of its chapter, with no page errors. The one stop (random choices at Highmoor's south gate never picking the road east in 12 tries) was the test's luck, not the game; the test now tries 40 times.
- **Stress:** two long random-input runs (keys, clicks, menus, fights) in many places: no errors, the game never stopped.
- **Data:** `node tools/validate.js`: 84 maps, 112 enemies, 173 items, no broken references. Every suite passes, and all nine puzzle dungeons play through.
- **Visual fixes:** the party panel (top left) fades when the leader walks under it or while a toast is up (it hid the hero in the top-left corner of maps, and toasts like area names overlapped it); party chatter no longer shows over any dialog, choice or menu (`.modal` on the root while anything is open); the Options list scrolls instead of covering its description box.
- **Balance note:** the chapter-4 vault heist's Collector Engine (suggested level 19) is very hard if taken on at level 14, as one route did; the journal shows the suggested level.

## The repository (GitHub: kreffron/TheBarrowCrown)

- `index.html` at the top is the game itself, and what GitHub Pages serves. `tools/build.py` writes it, along with the same file at `docs/index.html` and `dist/index.html` (dist is not kept in git).
- `src/` the engine, `data/` the game (with a folder per chapter, `ch9_world/` for the whole-world passes), `tools/` the build, the tests and the puzzle solver, `playlist/` the soundtrack page.
- `.nojekyll` tells GitHub Pages to serve the files as they are.
- To update the game: change the source, run `python3 tools/build.py`, run the tests, commit everything (the new `index.html` included).

## Livelier battles, and combat with more to it

**Look and feel** (`src/battle.js`, `src/pieces.js`, `src/terrain.js`)
- Hits land: a jolt back from the attacker, a screen shake as heavy as the blow, a heartbeat's hit-stop (longer on a critical); bigger, bouncier numbers for heavy hits and criticals (with a CRITICAL label), kept clear of the top bars and drawn above chatter bubbles.
- Attacks: a lunge draws back first; arrows and thrown blades arc, nose first, with a trail; spells leave sparks of their kind (`B.impactParts`); kegs throw debris and leave smoke.
- Weather by place (`weather()`): snow at two depths, ash and embers, rain with splashes and a cool wash, drizzle, falling leaves. Braziers and burning ground light the dark.
- Figures: a slightly stronger idle breath, badly hurt heroes sag, a hop for a kill, and foes fall by kind (`B.deathFx`: bones fold, spirits rise away, stone crumbles, beasts bolt, others topple).
- Big moments: a boss card with the screen narrowed and the camera pushed in; the camera leans in on a boss's great blow and on the finishing blow; the party cheers and sparkles on a win, and a level-up gets a column of light.
- Particles glow on dark boards and are painted solid (with a dark edge on debris) on bright ones. A device set to reduce motion gets gentle shakes and no hit-stop (`B.calm`).

**Combat**
- **Auto-battle** (`B.autoOk`, `B.toggleAuto`; ⏩ button, key R): only in a fight the party has outgrown (no boss, not scripted, party above the fight's level). The autopilot takes the heroes' turns at the swiftest pace; pressing again hands control back, even mid-turn.
- **Weather that matters** (`B.weather`): rain (coast, fen) halves how long fires burn and stops kegs being lit by hand; snow puts shots at more than 4 squares at -2; Ashlands embers sometimes set dry scrub alight at the end of a round. The first fight in each weather says so.
- **Team-ups** (`src/bonds.js`, `B.TEAM`): a pair standing side by side who are close (Trusting Runa, or Friends) get one joint move each fight: Over the Line, Hammer and Lamp, Battle Hymn, Blind and Bleed, Look Over There, Two-Part Hymn.
- **Enemy habits** (`data/ch9_world/y_roles.js`, `B.roleFor`, `B.roleBias`): pack, brute, skirmisher, archer, caster, venom, guardian, undead, zealot, healer, boss. A habit tips who a foe goes for (with a little chance in it, so it is a good guess, never a certainty); the bestiary shows it once one has been beaten. Healers mend first, usually. Balance runs across all five chapters came out the same as before.
- **Status turns**: the turns left on each status icon over a figure.
- The handbook's battle page covers team-ups, auto-battle, weather and habits.

## Oil portraits and moods

Every character who speaks has a painted oil portrait in the dialogue box: 144 portraits (the four heroes, plus 140 of
the cast), each painted from that character's look in the game, with their own head shape. Characters whose lines
call for it also get mood faces: happy, angry, worried and sad (262 pictures in all). `src/moodlines.js` hand-tags the
mood of the story's key lines; the rest are guessed from the words. Turning off expressions in the options shows each
speaker's usual face.

The portraits are painted ahead of time, so phones never wait for them:

    python3 tools/build.py && python3 tools/portraits/render.py && python3 tools/build.py

`tools/portraits/bust.js` paints the head and shoulders (anatomy, hair, headwear, beards, clothes, moods),
`tools/portraits/styles.js` gives it the oil finish, and `render.py` writes `data/portraits_oil.js`. Anyone without an
oil portrait falls back to the old figure face.

## The opening, drawn side on

A new game opens with a drawn, side-on 2D animation instead of the old top-down scenes (`src/opening.js`, played by
the `['anim', 'opening']` script command). It has three parts. First, the history of Mornvale: the Barrow King's crown
breaks into five shards that light five lamps, the Wardens keep them through the years, and one lamp goes out. Second,
the Hollow Barrow, where the King wakes on his throne. Third, the Thane's Barrow, where Veyra puts out the lamp with
the Hooded Man, Grukk and Skrit. The dialogue uses the oil portraits. A advances a line (or hurries the picture
along), and B twice skips the whole opening, as with any cutscene. The file holds a small engine (jointed figures with
walks, blinks and poses, a camera, lighting and a timeline), then the three scenes, then the hook into the game.
