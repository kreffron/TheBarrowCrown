/* The journal's regions: roughly where each quest's current step happens, so open quests can be grouped by region and
   each quest page can say where to look. Broad on purpose: a region, never a spot. A quest maps to one region, or to
   { stage: region } when its steps move about (a stage with no entry uses the nearest earlier one).
   D.REGIONS lists them in the order the journal shows them. */
(function () {
  const D = G.D;
  D.REGIONS = ['Brackenford', 'Thornwood', "The Thane's Barrow", 'Saltmere', 'Mirefen', 'The Drowned Abbey', 'Karrow Hold', 'The Frost Pass', "The Giant's Cairn", 'Highmoor', 'The Undercroft', 'Ashfall', 'The Ashen Road', 'The Hollow Barrow'];
  const BR = 'Brackenford', TW = 'Thornwood', TB = "The Thane's Barrow", SM = 'Saltmere', MF = 'Mirefen', DA = 'The Drowned Abbey',
    KH = 'Karrow Hold', FP = 'The Frost Pass', GC = "The Giant's Cairn", HM = 'Highmoor', UC = 'The Undercroft', AF = 'Ashfall', AR = 'The Ashen Road', HB = 'The Hollow Barrow';
  D.questRegion = {
    // chapter 1
    main: { 1: TW, 2: TB, 5: BR }, act1: TW, wood: { 1: TW, 2: BR }, mush: TW, bounty: TW, nest: { 1: TW, 2: BR }, grave: { 1: TB, 2: BR },
    millgrain: TW, oldtower: { 1: TW, 2: BR }, tam: { 1: TW, 2: BR }, lanterns: BR, dig: { 1: TW, 2: BR }, bristle: TW, bounty1: TW,
    pz_millrace: TW, pz_barrow: TW,
    // chapter 2
    main2: { 1: SM, 3: MF, 4: DA, 6: SM }, act2: MF, light: SM, kettle: MF, tags: MF, coll: SM, marigold: SM, smugglers: MF,
    wisps: MF, eelking: MF, psalter: { 1: DA, 2: SM }, saltpans: SM, hollin: MF, quillcellar: SM, pz_chapel: MF, pz_seacaves: SM,
    // chapter 3
    main3: { 1: KH, 3: FP, 4: GC, 6: KH }, act3: FP, bear: FP, watcher: { 1: FP, 2: KH }, prisoner: KH, goblins: FP, raiders: FP,
    dogs3: { 1: FP, 2: KH }, troll3: FP, runes3: FP, whitepaw: FP, shrine3: FP, pz_icehalls: FP, pz_spire: FP,
    // chapter 4
    main4: { 1: HM, 4: UC, 6: HM }, act4: HM, duke: { 1: HM, 2: UC, 3: HM }, heist: HM, crypt: HM, brannoc: HM, rats4: UC, forger4: HM,
    watch4: HM, ghost4: HM, duel4: HM, pz_archive: HM, pz_lamps: UC,
    // chapter 5
    main5: { 1: AF, 2: AR, 3: HB }, act5: AR, lamps: AR, greyhold: AR, mirror: AR, deserters5: AR, supply5: AR, patrol5: AF, wager5: AR,
    cache5: AR, pz_smith: AF
  };
  // The story quests: the chapter's main quest and the one that opens the way.
  D.storyQuests = { main: 1, main2: 1, main3: 1, main4: 1, main5: 1, act1: 1, act2: 1, act3: 1, act4: 1, act5: 1 };
})();
