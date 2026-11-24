/* The Player's Handbook: the rules in full, and a page for each hero, opened from the top of the Guide.
   The Guide is the quick reference; the Handbook is the long read. Every number on the hero pages (the level table,
   starting stats, skills and improvements) is worked out from the game's own data when the page opens, so it can
   never fall out of step with the game. Pages open in a reader that scrolls (arrows, the wheel, or a swipe). */
(function () {
  const esc = s => UI.esc(String(s));
  const h = t => '<h3>' + esc(t) + '</h3>';
  const p = t => '<p>' + t + '</p>';

  // A hero's numbers at a level, with no gear, improvements, gifts or feats: the hero's own growth.
  function bare(id, L) {
    const S = G.S; G.S = { level: L, flags: {}, feats: {}, boons: {}, party: [] };
    try { return G.stats({ id, gear: {}, picks: {} }); } finally { G.S = S; }
  }
  const sign = n => (n >= 0 ? '+' : '−') + Math.abs(n);

  /* ---------- the rules ---------- */
  const RULES = [
    ['How a roll works', () =>
      p('Almost everything is a roll of a twenty-sided die (a d20) plus a bonus, against a number to beat. Meet or beat it and you succeed. Each roll is shown in the battle log and under the message, for example <i>d20: 14 + 6 = 20 vs AC 15</i>.') +
      p('A natural 20 (the die itself shows 20) always hits and is a <b>critical hit</b>. A natural 1 always misses. On a save, a natural 20 always resists and a natural 1 always fails.') +
      h('Dice shorthand') +
      p('<b>2d6+3</b> means: roll two six-sided dice, add them, add 3. A weapon\'s dice are its damage before bonuses.')],
    ['Your stats', () =>
      '<table><tr><th>Stat</th><th>What it does</th></tr>' +
      [['HP', 'Health. At 0 a hero falls; a fallen hero can be raised in the fight (Rekindle, Smelling Salts) and gets up with 1 HP when it ends.'],
       ['SP', 'Skill points, under each hero\'s own name (Fury, Cunning, Faith, Verve). Skills cost SP. Defending gives 1 back; rest and items restore more.'],
       ['Attack', 'Added to every attack roll.'], ['Damage', 'Added to every weapon hit.'],
       ['Power', 'Drives skills and songs: added to healing and to skill damage, and sets how hard they are to resist (10 + Power).'],
       ['Save', 'Added to your roll to resist spells, poisons, songs and fear.'], ['AC', 'Armour Class: what an attack must reach to hit you.'],
       ['Speed', 'Added to initiative. At 4 or more a hero moves 4 squares; at 0 or less, 2; otherwise 3.']].map(r => '<tr><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td></tr>').join('') + '</table>' +
      p('Stats grow with level (see each hero\'s table) and with gear, improvements, gifts from people you help, and feats.')],
    ['Attacking', () =>
      h('To hit') + p('d20 + Attack + modifiers, against the target\'s AC. The modifiers:') +
      '<table><tr><td>Flanking: an ally is on the far side of the target</td><td>+2</td></tr><tr><td>The target is asleep or stunned</td><td>+4</td></tr>' +
      '<tr><td>Shooting with an enemy right beside you</td><td>−2</td></tr><tr><td>Lamplight (Blessed)</td><td>+2</td></tr><tr><td>Rattled (Dirty Trick)</td><td>−4</td></tr>' +
      '<tr><td>Higher ground, cover, shallows and the rest</td><td>see Ground and objects</td></tr><tr><td>A bonded friend fighting beside you</td><td>see Bonds</td></tr></table>' +
      h('Damage') + p('Weapon dice + Damage, plus the hero\'s own way of fighting: Runa +2 up close; Finch\'s bow +1 and his rapier −2; Dask\'s and Runa\'s throws −1 and −2; Maren\'s sling −1. A hit always does at least 1.') +
      h('Critical hits') + p('A natural 20 (or 19-20 and so on, once the Smith\'s Edge is earned: never wider than 17-20) hits whatever the AC and rolls every damage die twice, Sneak Attack dice included.') +
      h('Sneak Attack') + p('Dask adds extra d6s to a hit when the target is already fighting one of his friends, rattled, asleep, stunned, or caught in an ambush. He gets one more die in melee against a target a friend is fighting. His number of dice grows with level (see his table).')],
    ['Skills, saves and checks', () =>
      h('Skills') + p('A skill costs SP and either hits automatically or calls for an attack roll, as its description says. Healing restores its dice + Power.') +
      h('Saves') + p('When a skill or song tries to put a condition on someone, they roll d20 + Save against 10 + the user\'s Power. Make it and they shrug it off. Some foes ignore some conditions entirely: the bestiary lists them.') +
      h('Checks out of battle') + p('Talking, searching and climbing call for checks: d20 + the leader\'s skill bonus against a difficulty. The skill bonus is 3 + half the hero\'s growth (+3 at level 1, about +12 at level 30), and each hero has their own skill: Runa Athletics, Dask Thievery, Maren Lore, Finch Persuasion. Choose the right leader.')],
    ['Turns, moving and fleeing', () =>
      h('Initiative') + p('At the start of a fight everyone rolls d20 + Speed, once. That order holds all fight; anyone who joins later rolls on arrival. An ambush puts your side first in round 1; being surprised puts theirs first.') +
      p('Level counts too: the party gets +2 for every level it stands above the fight\'s level (up to +6), and −2 for every level below the lowest level it is ever met at (down to −6).') +
      h('A turn') + p('Move and act once each, in either order. You can undo a move before acting. Rough ground and shallows cost 2 squares to enter.') +
      h('Free strikes') + p('Stepping away from an enemy beside you gives it one free attack at −2. Dask and anyone hidden never provoke.') +
      h('Defend') + p('+4 AC until your next turn, and 1 SP back.') +
      h('Fleeing') + p('d20 + the party\'s best Speed against 8 + the enemies\' best Speed. You cannot flee from bosses. Losing a fight lets you try again, or retreat for a tenth of your gold.') +
      h('Team-ups') + p('Two heroes who are close (a companion Trusting Runa, or two companions who are Friends) and standing side by side can pull off a joint move, once per pair each fight, for the action of whoever calls it. Runa and Dask: Over the Line. Runa and Maren: Hammer and Lamp. Runa and Finch: Battle Hymn. Dask and Maren: Blind and Bleed. Dask and Finch: Look Over There. Maren and Finch: Two-Part Hymn, a heal for everyone near them.') +
      h('Auto-battle') + p('In a fight the party has outgrown (no boss, and the party above the fight\'s level), the ⏩ button (' + (Menu.keyHint ? Menu.keyHint('bauto') || 'R' : 'R') + ') lets the heroes fight on their own, quickly. Press it again to take back control.') +
      h('Weather') + p('Rain (the coast, the fen): fires burn out fast, and a powder keg is too damp to light by hand. Snow: shots at more than 4 squares are at −2. The Ashlands: embers on the wind can set the dry scrub burning.') +
      h('Enemy habits') + p('Each kind of foe has a usual habit: pack hunters pile onto one hero, archers pick on the least armoured, the dead are drawn to Maren\'s lamp, and so on. Beat one to see its habit in the bestiary. A habit is a good guess, never a promise.')],
    ['Levels and experience', () => {
      const T = G.D.xpTable; let rows = '';
      for (let L = 1; L <= 30; L++) rows += '<tr><td>' + L + '</td><td>' + (L === 1 ? '0' : T[L - 1].toLocaleString()) + '</td><td>' + (L === 1 ? '' : (T[L - 1] - T[L - 2]).toLocaleString()) + '</td><td>' + (G.AC_LEVELS.includes(L) ? '+1 AC for everyone' : '') + '</td></tr>';
      return p('Fights and quests give experience (XP); level 30 is the most anyone can reach. The whole party shares one level and every level heals everyone.') +
        p('Every fight has a level, the level the game expects you to meet it at. Beyond it, a fight pays less: half for each level you stand above it, so grinding gets you a level or two ahead and no further. Quests always pay in full. The journal shows a suggested level for each quest.') +
        p('Doing everything in a chapter takes the party to about level 6, 12, 18, 24 and 30. The main story alone leaves you about three levels lower.') +
        '<table><tr><th>Level</th><th>Total XP</th><th>This level</th><th></th></tr>' + rows + '</table>';
    }],
    ['Skills or improvements', () =>
      p('Whenever a hero would learn a skill at a level up, you choose: that skill, or a lasting improvement instead. The one you pass up is gone. Each improvement can be taken up to three times. Which improvement is offered rotates through the hero\'s own list, so the same pair never comes up twice in a row.') +
      '<table><tr><th>Improvement</th><th>Effect</th></tr>' + Object.keys(G.MASTERY).map(k => '<tr><td><b>' + esc(G.MASTERY[k].name) + '</b></td><td>' + esc(G.MASTERY[k].desc) + '</td></tr>').join('') + '</table>' +
      p('Each hero\'s page lists the order their improvements are offered in.')],
    ['Feats and gifts', () =>
      p('Feats are earned in the puzzle dungeons and kept for good. Some unique gear carries one too.') +
      '<table><tr><th>Feat</th><th>Effect</th></tr>' + Object.keys(G.D.perks).map(k => '<tr><td><b>' + esc(G.D.perks[k].name) + '</b></td><td>' + esc(G.D.perks[k].desc) + '</td></tr>').join('') + '</table>' +
      p('The Smith\'s Edge, from the deepest of the puzzle dungeons, widens every hero\'s critical range by one. People you help sometimes give a hero a lasting gift: a point of a stat that shows on their sheet.')],
    ['Conditions', () =>
      '<table><tr><th>Condition</th><th>Effect</th></tr>' + Object.keys(G.D.statuses).filter(k => G.D.statuses[k].desc).map(k => { const s = G.D.statuses[k]; return '<tr><td><b style="color:' + (s.good ? '#8ab4ff' : '#d49cf0') + '">' + esc(s.name) + '</b></td><td>' + esc(s.desc) + '</td></tr>'; }).join('') + '</table>' +
      p('Blue conditions help; violet ones hurt. Small badges over a piece show what it carries, each with its own picture; tap or click it for its card.')]
  ];

  /* ---------- the heroes ---------- */
  const BLURB = {
    runa: 'The party\'s wall and its axe. Runa has the most health by far and hits hardest up close (+2 damage in melee). Fury fuels her skills: Rage blunts every blow she takes, War Cry pulls enemies onto her, and Cleave and Whirlwind cut through crowds. She can throw a hand-axe when she cannot close.',
    dask: 'Quick, hard to pin down, and deadly when a friend has the enemy busy. Dask moves first more often than anyone (Speed 5), never provokes free strikes, and gets +2 to hit and his Sneak Attack dice against anyone an ally is already fighting, at any range. Cunning fuels tricks that rattle, poison, hide and strike twice.',
    maren: 'The lamp that keeps the party standing. Maren heals one or all, raises the fallen, blesses the party\'s aim, and burns the dead with Lampfire and Rebuke. Faith fuels it all, and she has the deepest well of it. She wears the heaviest armour after Runa, swings a mace, and carries a sling for when no one is near.',
    finch: 'A bowman who fights with songs. Finch\'s shortbow reaches 6 squares and is his best weapon; his rapier is a poor second. His songs put foes to sleep, inspire friends, drain enemy resolve and, later, turn the whole fight. Verve fuels them, and Power makes them harder to shrug off.'
  };
  const FEATS = { runa: ['thick'], dask: ['firstsneak', 'opportunist'], maren: ['grace', 'lantern'], finch: ['sirenshot', 'secondverse'] };
  function heroPage(id) {
    const c = G.D.classes[id], A = G.D.abilities, I = G.D.items, s1 = bare(id, 1);
    const gear = ['weapon', 'armor'].map(sl => c.gear[sl] && I[c.gear[sl]] ? I[c.gear[sl]].name + (I[c.gear[sl]].dmg ? ' (' + I[c.gear[sl]].dmg + ')' : I[c.gear[sl]].mods && I[c.gear[sl]].mods.ac ? ' (AC +' + I[c.gear[sl]].mods.ac + ')' : '') : null).filter(Boolean).join(', ');
    let face = ''; try { face = B.faceURL ? B.faceURL(id, 0) : ''; } catch (e) { face = ''; }      // the same face as the turn chips and dialogue
    let out = '<div class="hb-hero" style="border-color:' + G.D.speakers[c.name] + '">' + (face ? '<img src="' + face + '" style="border-color:' + G.D.speakers[c.name] + '">' : '') + '<span><b style="color:' + G.D.speakers[c.name] + '">' + esc(c.name) + '</b> · ' + esc(c.cls) + '<br><small>' + esc(c.res) + ' · ' + esc(c.skill) + '</small></span></div>' + p(esc(BLURB[id]));
    out += h('At level 1') + '<table><tr><th>HP</th><th>' + esc(c.res) + '</th><th>Attack</th><th>Damage</th><th>Power</th><th>Save</th><th>AC</th><th>Speed</th></tr><tr>' +
      [s1.maxHp, s1.maxSp, sign(s1.atk), sign(s1.dmgBonus), s1.pow, sign(s1.save), s1.ac, s1.spd].map(v => '<td>' + v + '</td>').join('') + '</tr></table>' +
      p('AC before armour; the starting armour adds to it. Starting gear: ' + esc(gear) + '.') +
      p('Ranged: ' + esc(c.shot.name) + ', reach ' + c.shot.range + (c.shot.atk ? ', ' + sign(c.shot.atk) + ' to hit' : '') + (c.shot.dmg ? ', ' + sign(c.shot.dmg) + ' damage' : '') + '.' + (c.melee ? ' Up close: ' + (c.melee.atk ? sign(c.melee.atk) + ' to hit, ' : '') + sign(c.melee.dmg) + ' damage.' : '') + (c.sneak ? ' Sneak Attack (see the table).' : ''));
    // the table, level by level
    let rows = '', prev = null;
    for (let L = 1; L <= 30; L++) {
      const s = bare(id, L), learns = (c.learn[L] || []).map(a => A[a].name).join(', ');
      const cell = (v, k, fmt) => { const up = prev && v !== prev[k]; return '<td' + (up ? ' class="up"' : '') + '>' + (fmt ? fmt(v) : v) + '</td>'; };
      rows += '<tr><td>' + L + '</td>' + cell(s.maxHp, 'maxHp') + cell(s.maxSp, 'maxSp') + cell(s.atk, 'atk', sign) + cell(s.dmgBonus, 'dmgBonus', sign) + cell(s.pow, 'pow') + cell(s.save, 'save', sign) + cell(s.ac, 'ac') +
        (c.sneak ? cell(s.sneak, 'sneak', v => v + 'd6') : '') + '<td class="learn">' + esc(learns) + (L > 1 && learns ? ' <span class="dim">or an improvement</span>' : '') + '</td></tr>';
      prev = s;
    }
    out += h('Level by level') + p('The hero\'s own growth, without gear. Gold marks a stat that rose that level.') +
      '<table class="hb-lv"><tr><th>Lv</th><th>HP</th><th>' + esc(c.res.slice(0, 4)) + '</th><th>Atk</th><th>Dmg</th><th>Pow</th><th>Save</th><th>AC</th>' + (c.sneak ? '<th>Sneak</th>' : '') + '<th>New skill</th></tr>' + rows + '</table>';
    // the skills
    out += h('Skills') + '<table><tr><th>Lv</th><th>Skill</th><th>Cost</th><th>What it does</th></tr>' +
      Object.keys(c.learn).map(Number).sort((a, b) => a - b).map(L => c.learn[L].map(a => '<tr><td>' + L + '</td><td><b>' + esc(A[a].name) + '</b></td><td>' + A[a].cost + '</td><td>' + esc(A[a].desc) + '</td></tr>').join('')).join('') + '</table>';
    out += h('Improvements, in the order offered') + p((G.MASTERY_ORDER[id] || []).map(k => '<b>' + esc(G.MASTERY[k].name) + '</b> (' + esc(G.MASTERY[k].desc.replace(/\.$/, '')) + ')').join(' · '));
    const ft = (FEATS[id] || []).filter(k => G.D.perks[k]);
    if (ft.length) out += h('Feats to find') + p(ft.map(k => '<b>' + esc(G.D.perks[k].name) + '</b>: ' + esc(G.D.perks[k].desc)).join('<br>'));
    return out;
  }

  Menu.handbook = () => RULES.map(([t, f]) => ({ title: t, html: f })).concat(['runa', 'dask', 'maren', 'finch'].map(id => ({ title: G.D.classes[id].name + ', the ' + G.D.classes[id].cls, html: () => heroPage(id), hero: id })));

  // A page that scrolls: ↑/↓ a line, ←/→ a screen, OK or Back to close. The wheel and a swipe work too.
  Menu.read = function (title, html) {
    return new Promise(resolve => {
      const el = UI.el('div', 'win hb', '<div class="hb-title">' + esc(title) + '<span class="dim"> · ↑↓ scroll · ' + esc(G.keyName((G.bindings().b || [])[0])) + ' close</span></div><div class="hb-body">' + html + '</div>');
      const shade = UI.el('div', 'shade'); UI.root.appendChild(shade); UI.root.appendChild(el);
      const body = el.querySelector('.hb-body'), step = () => body.clientHeight;
      const m = { press(b) {
        if (b === 'up') body.scrollTop -= 30 * G.scale; else if (b === 'down') body.scrollTop += 30 * G.scale;
        else if (b === 'left') body.scrollTop -= step() * 0.9; else if (b === 'right') body.scrollTop += step() * 0.9;
        else if (b === 'a' || b === 'b') { UI.popModal(m); el.remove(); shade.remove(); G.audio.sfx('cancel'); resolve(); }
      } };
      UI.pushModal(m);
    });
  };
})();
