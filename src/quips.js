/* ---------- combat quips ----------
   The heroes talk during a fight: a short speech bubble over the piece. The bubbles do not stop play or wait for
   input, and they never show in fast mode. The lines are in data/ch9_world/n_quips.js:
     D.quips[hero][kind] = [lines]. A line may use {name} for the other hero it is about.
   Kinds: start, boss, turn, hit, crit, miss, kill, hurt, low, allyDown, revived, healed, skill, win, flee.
   How often they talk is the 'Party chatter' option: often, sometimes (the default), or off.
   Each hero works through their lines for a kind in a shuffled order, so nothing repeats until all have been said. */
(function () {
  // chance that an event gets a quip, at 'sometimes'; 'often' doubles it (most kinds then always speak)
  const CHANCE = { start: 0.8, boss: 1, turn: 0.12, hit: 0.15, crit: 0.7, miss: 0.3, kill: 0.45, hurt: 0.25, low: 0.7, allyDown: 0.9, revived: 0.9, healed: 0.35, skill: 0.3, win: 0.7, flee: 0.8 };
  const URGENT = { boss: 1, allyDown: 1, revived: 1, low: 1, win: 1, flee: 1, crit: 1 };   // these may talk over a bubble that is up
  const bags = {};
  B.bubbles = [];
  B.CHATTER = { often: { name: 'Often', mul: 2, gap: 1600 }, some: { name: 'Sometimes', mul: 1, gap: 3200 }, off: { name: 'Off', mul: 0, gap: 0 } };
  B.chatter = () => B.CHATTER[G.opts.chatter || 'some'] || B.CHATTER.some;
  function line(id, kind) {
    const pool = ((G.D.quips || {})[id] || {})[kind]; if (!pool || !pool.length) return null;
    const k = id + '.' + kind;
    if (!bags[k] || !bags[k].length) { bags[k] = pool.map((_, i) => i); for (let i = bags[k].length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bags[k][i], bags[k][j]] = [bags[k][j], bags[k][i]]; } }
    return pool[bags[k].pop()];
  }
  const isHero = c => c && c.side === 0 && !c.guest && G.D.quips && G.D.quips[c.id];
  // c says something about `kind`. about: the other unit it concerns (for {name}). force: skip the dice.
  B.quip = function (c, kind, about, force) {
    if (G.fast || B.brawl || !isHero(c) || (c.down && kind !== 'revived')) return false;
    const ch = B.chatter(); if (!ch.mul) return false;
    if (!force && Math.random() > Math.min(1, (CHANCE[kind] || 0.2) * ch.mul)) return false;
    const now = G.time;
    if (!URGENT[kind] && now - (B.lastQuip || -1e9) < ch.gap) return false;
    if (B.bubbles.some(b => b.c === c && now - b.t0 < 600)) return false;
    let text = line(c.id, kind); if (!text) return false;
    text = text.replace(/\{name\}/g, about && about.name ? about.name : 'them');
    B.bubbles = B.bubbles.filter(b => b.c !== c);
    B.bubbles.push({ c, text, t0: now, dur: 1500 + text.length * 45 });
    B.lastQuip = now; B.quipCount = (B.quipCount || 0) + 1;
    return true;
  };
  // someone on the hero side, other than `not`, says it (the closest to `near`, if given; otherwise any)
  B.quipAny = function (kind, not, near, about) {
    const hs = B.c.filter(x => isHero(x) && !x.down && x !== not);
    if (!hs.length) return false;
    if (near) hs.sort((a, b) => B.dist(a, near) - B.dist(b, near)); else hs.sort(() => Math.random() - 0.5);
    return B.quip(hs[0], kind, about || near);
  };
  // bubbles: a white rounded box with a tail, over the piece, wrapped to ~100px, kept on the screen
  function wrap(c, text, w) {
    const words = text.split(' '), out = []; let cur = '';
    for (const wd of words) { const t = cur ? cur + ' ' + wd : wd; if (c.measureText(t).width > w && cur) { out.push(cur); cur = wd; } else cur = t; }
    if (cur) out.push(cur); return out;
  }
  B.drawBubbles = function (c) {
    const now = G.time;
    B.bubbles = B.bubbles.filter(b => now - b.t0 < b.dur && B.c.indexOf(b.c) >= 0);
    for (const b of B.bubbles) {
      const u = b.c; if (u.px == null) continue;
      c.save(); c.font = '7px ui-monospace, Menlo, Consolas, monospace';
      const lines = wrap(c, b.text, 100), lw = Math.max(...lines.map(l => c.measureText(l).width)), w = Math.ceil(lw) + 8, h = lines.length * 8 + 5;
      const age = now - b.t0, a = age < 120 ? age / 120 : age > b.dur - 250 ? Math.max(0, (b.dur - age) / 250) : 1;
      const ax = u.px, ay = u.py - 34 * B.pieceSize(u);
      let x = Math.round(ax - w / 2), y = Math.round(ay - h - 4);
      x = Math.max(2, Math.min(318 - w, x)); y = Math.max(2, y);
      c.globalAlpha = a;
      c.fillStyle = '#f6f0e2'; c.strokeStyle = '#2a2230'; c.lineWidth = 1;
      c.beginPath(); c.roundRect ? c.roundRect(x + 0.5, y + 0.5, w, h, 3) : c.rect(x + 0.5, y + 0.5, w, h); c.fill(); c.stroke();
      const tx = Math.max(x + 4, Math.min(x + w - 4, Math.round(ax)));
      c.beginPath(); c.moveTo(tx - 3, y + h); c.lineTo(tx, y + h + 4); c.lineTo(tx + 3, y + h); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(tx - 3, y + h + 0.5); c.lineTo(tx, y + h + 4.5); c.lineTo(tx + 3, y + h + 0.5); c.stroke();
      c.fillStyle = '#2a2230'; c.textAlign = 'left'; c.textBaseline = 'top';
      lines.forEach((l, i) => c.fillText(l, x + 4, y + 3 + i * 8));
      c.restore();
    }
  };
})();
