/* Life in the world: small animals and passers-by that wander the towns and the wild. They are never fought.
   Pixel beasts face right (the engine flips them); D.ambient lists what each map spawns when you walk in. */
(function () {
  const D = G.D;
  const shape = {
    deer: ['................', '............b.b.', '............bb..', '...........aaa..', '...........aeak.', '..........aaaa..', '.w.......aaa....', '.waaaaaaaaaa....',
      '..aaaaaaaaaa....', '..aaacccccaa....', '..aa......aa....', '..a.a.....a.a...', '..a.a.....a.a...', '..a.a.....a.a...', '..k.k.....k.k...', '................'],
    rabbit: ['................', '................', '................', '................', '................', '..........a.a...', '..........a.a...', '..........aaa...',
      '..........aeak..', '....aaaaaaaaa...', '..waaaaaaaaa....', '..waaaaaaaa.....', '...aaccccaa.....', '...a.....aa.....', '................', '................'],
    fox: ['................', '................', '................', '................', '...........a.a..', '...........aaa..', '...........aeaak', '..b.......aaaa..',
      '.bba.aaaaaaaw...', '.bbaaaaaaaaa....', '..waaaaaaaaa....', '....aaawwwaa....', '....a.a...a.a...', '....k.k...k.k...', '................', '................'],
    bird: ['................', '................', '................', '................', '................', '................', '..........aa....', '.........aeak...',
      '....aaaaaaaa....', '...aaaaaaaaa....', '..aabbbbaaa.....', '.aa..aaaaa......', '.......k.k......', '.......k.k......', '................', '................'],
    frog: ['................', '................', '................', '................', '................', '................', '................', '.......ee.ee....',
      '......aeaaeaa...', '.....aaaaaaaaa..', '....aaacccccaa..', '...aa.aaaaaa.aa.', '..aa..a....a..aa', '................', '................', '................'],
    heron: ['................', '.........aa.....', '........aeakk...', '.........a......', '.........a......', '........aa......', '....bbbaaa......', '...bbbaaaa......',
      '..b..aaaaa......', '......aaa.......', '.......k........', '.......k........', '.......k........', '......k.k.......', '................', '................'],
    goat: ['................', '..........bb....', '.........b..b...', '..........aaa...', '..........aeak..', '.........aaaa...', '.........aak....', '.aaaaaaaaaa.....',
      '.aaaaaaaaaa.....', '.aacccccaaa.....', '.aa......aa.....', '.a.a.....a.a....', '.a.a.....a.a....', '.k.k.....k.k....', '................', '................'],
    sheep: ['................', '................', '................', '................', '................', '................', '....wwwwwww.....', '...wwwwwwwwwkk..',
      '..wwwwwwwwwwkek.', '..wwwwwwwwwwkk..', '...wwwwwwwww....', '....k.k..k.k....', '....k.k..k.k....', '................', '................', '................'],
    hen: ['................', '................', '................', '................', '................', '...........r....', '..........aar...', '.........aeak...',
      '...aaaaaaaa.....', '..aaaaaaaaa.....', '..aabbbbaa......', '...aaaaaa.......', '.....k.k........', '.....k.k........', '................', '................'],
    dog: ['................', '................', '................', '................', '...........b.b..', '...........bb.b.', '..........aaaaa.', 'b.........aaeaak',
      '.b.......aaaaa..', '..aaaaaaaaaa....', '..aaaaaaaaaa....', '..aaccccccaa....', '..aa......aa....', '..a.a.....a.a...', '..k.k.....k.k...', '................'],
    moth: ['................', '................', '................', '................', '....w.....w.....', '...waw...waw....', '..waaaw.waaaw...', '..waaaabaaaaw...',
      '...waaabaaaw....', '....waabaaw.....', '.....w.b.w......', '.......b........', '................', '................', '................', '................'],
    lizard: ['................', '................', '................', '................', '................', '................', '................', '................',
      '...........aa...', '..b.aaaaaaaaea..', '.b.aaaaaaaaaaa..', 'b...a.a....a.a..', '................', '................', '................', '................']
  };
  const ink = '#1a1420';
  const pal = {
    deer: ['deer', { a: '#9a6a3a', b: '#d8c8a0', c: '#c89a6a', e: ink, k: '#3a2a1a', w: '#f0ece0' }],
    rabbit: ['rabbit', { a: '#8a7a6a', c: '#c8b8a0', e: ink, k: '#e8a0a0', w: '#f0ece0' }],
    hare: ['rabbit', { a: '#f0f2f8', c: '#d8dce8', e: ink, k: '#e8a0a0', w: '#ffffff' }],
    fox: ['fox', { a: '#d8702a', b: '#c8601a', w: '#f0ece0', e: ink, k: '#2a1a10' }],
    crow: ['bird', { a: '#2a2a34', b: '#4a4a5a', e: '#e8e8e8', k: '#c8a03a' }],
    pigeon: ['bird', { a: '#8a8ea0', b: '#6a6e80', e: ink, k: '#d87a6a' }],
    ptarmigan: ['bird', { a: '#f4f6fa', b: '#d8dce8', e: ink, k: '#8a7a6a' }],
    gull: ['bird', { a: '#f0f0f4', b: '#8a8ea0', e: ink, k: '#e8b03a' }],
    raven: ['bird', { a: '#1e1e26', b: '#3a3448', e: '#ff9a3a', k: '#5a5a6a' }],
    frog: ['frog', { a: '#5a9a3a', c: '#c8d88a', e: ink }],
    heron: ['heron', { a: '#c8ccd8', b: '#8a8ea0', e: ink, k: '#d8b03a' }],
    goat: ['goat', { a: '#d8d4c8', b: '#8a7a60', c: '#b8b4a8', e: ink, k: '#4a3a2a' }],
    sheep: ['sheep', { w: '#f0ece0', k: '#3a3038', e: '#f0ece0' }],
    hen: ['hen', { a: '#e8dcc8', b: '#c8b8a0', r: '#d83a2a', e: ink, k: '#e8b03a' }],
    dog: ['dog', { a: '#8a5a3a', b: '#6a4028', c: '#c8a080', e: ink, k: '#2a1a10' }],
    moth: ['moth', { a: '#ff9a3a', w: '#ffe0a0', b: '#3a2a20' }],
    lizard: ['lizard', { a: '#6a4a3a', b: '#ff7a2a', e: '#ffd23a' }]
  };
  for (const id in pal) D.pix[id] = { pal: pal[id][1], rows: shape[pal[id][0]] };

  const A = {
    deer: ['A deer lifts its head, considers you, and goes back to eating.', 'A doe and her fawn. They watch you pass.', 'The deer bolts, white tail flashing.'],
    rabbit: ['A rabbit freezes, decides you are a tree, and goes on chewing.', 'A rabbit thumps its foot at you, deeply offended.'],
    hare: ['A white hare, almost invisible in the snow until it moves.', 'The hare sits up, ears high, and stares at Runa.'],
    fox: ['A fox trots past with something in its mouth. It does not share.', 'The fox gives you a long, knowing look.'],
    crow: ['A crow caws at you. Finch caws back. Neither wins.', 'The crow is very interested in Dask\'s pockets.'],
    pigeon: ['A city pigeon, fat on market crumbs.', 'The pigeon refuses to move. It has seen worse than you.'],
    ptarmigan: ['A ptarmigan, white on white, waddles away.', 'The bird puffs up against the cold.'],
    gull: ['A gull eyes your pack with naked greed.', 'The gull screams. Gulls always scream.'],
    raven: ['A raven watches from the ash, ember-eyed.', 'The raven says something that sounds like a word. Probably not.'],
    frog: ['A frog says "brup" and means it.', 'The frog plops into the mud and is gone.'],
    heron: ['A heron stands on one leg, perfectly still, ignoring you completely.', 'The heron spears a fish and swallows it whole.'],
    goat: ['A mountain goat stands on a rock where no goat should be able to stand.', 'The goat tries to eat Finch\'s sleeve.'],
    sheep: ['A sheep. It says baa. That is all it has to say.', 'The sheep leans against Runa, warm and woolly.'],
    hen: ['A hen, very busy with nothing.', 'The hen pecks at your boot, decides it is not food, and wanders off.'],
    dog: ['A dog wags its whole back end at you.', 'The dog brings Runa a stick. Runa throws it. The dog is overjoyed.'],
    moth: ['An ash-moth, glowing faintly like a coal with wings.', 'The moth circles Maren\'s lamp, and Maren lets it.'],
    lizard: ['A cinder-lizard basks on a warm stone, its tail glowing.', 'The lizard flicks its tongue at you and goes back to its nap.']
  };
  const a = (sprite, n, extra) => Object.assign({ sprite, n, lines: A[sprite] }, extra || {});
  // People passing through, with a word for anyone who stops them.
  const pass = (sprite, say, lines, n) => ({ sprite, n: n || 1, say, lines });
  D.ambient = {
    brackenford: [a('hen', 3), a('dog', 1), a('crow', 1)],
    thornwood: [a('deer', 2), a('rabbit', 3), a('fox', 1), a('crow', 2),
      pass('farmer', 'Traveller', ['Mind the wolves past the old oak. And the goblins. And the other wolves.', 'Lovely day for it. For what, I could not say.', 'If you see a goat, it is mine. Probably.'], 2)],
    mill: [a('hen', 2, { if: 'millFree' }), a('crow', 2), a('rabbit', 1)],
    saltmere: [a('gull', 4), a('dog', 1)],
    mirefen: [a('frog', 4), a('heron', 2), a('crow', 1),
      pass('fisher2', 'Eel-man', ['Eels are biting. So are the midges.', 'Keep to the boardwalks. The fen keeps what it takes.', 'Saw a light out on the water last night. Did not follow it. Not a fool.'], 2)],
    tidemill: [a('gull', 2), a('heron', 1)],
    wreck: [a('gull', 3)],
    saltpans: [a('gull', 2), a('heron', 1)],
    karrow: [a('goat', 2), a('dog', 2), a('raven', 1)],
    frostpass: [a('goat', 2), a('hare', 3), a('ptarmigan', 2),
      pass('hunter3', 'Trapper', ['The pass eats the careless. Wear two of everything.', 'Wolves are thin this winter. Thin wolves are bold wolves.', 'You walk like southerners. Except the big one.'], 2)],
    falls: [a('ptarmigan', 2), a('hare', 1)],
    highmoor: [a('pigeon', 4), a('dog', 1)],
    ashfall: [a('raven', 2), a('moth', 2), a('dog', 1)],
    ashroad: [a('moth', 3), a('lizard', 3), a('raven', 2),
      pass('soldier', 'Muster soldier', ['Keep moving. Standing still out here, the ash gets in your teeth.', 'Saw a Barrow Knight by the cliffs. Just standing. Waiting.', 'If I make it home I am going to grow cabbages and never look at a lamp again.'], 2)]
  };
})();
