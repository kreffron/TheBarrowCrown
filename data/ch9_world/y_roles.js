/* Enemy roles: each kind of foe has its usual habits, learned in the bestiary (once one has been beaten) and by
   fighting them. A habit tips how an enemy picks its target (src/board.js, B.roleBias), it does not decide it: there
   is always a little chance in it, so a habit is a good guess, never a certainty.
   Most roles follow from what a foe is (its kind, its moves, a bow); the list below sets the ones that need it. */
(function () {
  const D = G.D;
  D.roleText = {
    pack: 'Hunts in packs: piles onto whoever its packmates are already biting, and picks off anyone standing alone.',
    brute: 'Charges the nearest hero and slugs it out. Rarely bothers with anyone further off.',
    skirmisher: 'Looks for an opening: goes after the wounded, and loves to catch someone between two blades.',
    archer: 'Hangs back and shoots whoever wears the least armour. Close in and it is in trouble.',
    caster: 'Keeps its distance and goes for your spellcasters first: Maren and Finch.',
    venom: 'Poisons someone, then moves on to a fresh victim rather than finish the job.',
    guardian: 'Holds the line: stays close to its own side and strikes whoever comes for them.',
    undead: 'Drawn to the living light: goes for Maren and her lamp before anyone else.',
    zealot: 'Fights shoulder to shoulder with the faithful: piles onto whoever its fellows are fighting.',
    healer: 'Keeps its allies on their feet: mends the wounded before it fights.',
    boss: 'Waits for heroes to bunch up, then winds up a great blow on them. Spread out.'
  };
  D.enemyRoles = {
    // beasts that hunt alone or charge
    rat: 'pack', bear: 'brute', snowbear: 'brute', crab: 'guardian', brood: 'venom', ratking: 'pack',
    // the dead that guard rather than hunt
    warden: 'guardian', bonewarden: 'guardian', skeleton: 'guardian', frostbound: 'guardian',
    boneknight: 'brute', deathknight: 'brute', drowned: 'undead', ghoul: 'undead', ashghoul: 'undead',
    // people
    bruiser: 'brute', bruiser2: 'brute', brannoc2: 'brute', brannoc4: 'brute', bryn: 'brute', nagra: 'brute',
    shieldmaiden: 'guardian', chguard: 'guardian', collector: 'skirmisher', smuggler: 'skirmisher',
    digger: 'brute', stoneguard: 'guardian', automaton: 'guardian', rimegolem: 'brute'
  };
})();
