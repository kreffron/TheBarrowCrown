/* Combat additions: each hero's exploring move, usable once a fight (no cost), and objectives for two fights. */
(function () {
  const D = G.D;
  Object.assign(D.abilities, {
    shove: { name: 'Shove', cost: 0, once: 1, target: 'enemy', range: 1, desc: 'Once a fight: shove a foe two squares. Into something solid, it is hurt and stunned. Big foes will not budge.', fx: [{ t: 'shove', n: 2 }] },
    pellet: { name: 'Smoke Pellet', cost: 0, once: 1, target: 'self', desc: 'Once a fight: vanish in smoke (Hidden, so the next attack is a critical hit) and rattle every foe next to you.', fx: [{ t: 'pellet' }] },
    flare: { name: 'Lamp Flare', cost: 0, once: 1, target: 'self', desc: 'Once a fight: a flash of lamplight. Undead within 2 squares are stunned for a turn; the living are dazzled (rattled).', fx: [{ t: 'flare' }] },
    hush: { name: 'Hush', cost: 0, once: 1, target: 'enemy', range: 4, desc: 'Once a fight: sing one foe to sleep for two turns (it may resist). Damage wakes it.', fx: [{ t: 'status', id: 'asleep', turns: 2, save: true }] }
  });
  D.statuses.enraged = { name: 'Enraged', good: 1, mods: { dmg: 2 }, desc: '+2 damage.' };
  // The Last Watcher only has to be outlasted; the Collector Engine has to be beaten before it reaches full steam.
  if (D.groups.watcher) D.groups.watcher.objective = { type: 'survive', rounds: 5, text: 'His watch ends at first light: survive 5 rounds, or beat him.', done: 'Grey light comes through the arrow-slits. The Last Watcher lowers his sword. "The watch is ended."' };
  if (D.groups.engine) D.groups.engine.objective = { type: 'deadline', rounds: 12, more: { if: 'engineHint', rounds: 2 }, text: 'At the twelfth bell it reaches full steam: beat it within 12 rounds (14 if you know its schedule).', late: 'The Engine shrieks: full steam! Scalding vapour fills the vault.', dmg: '1d4' };
})();
