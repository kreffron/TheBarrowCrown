/* Tiny drawn icons for the battle board: a glyph per condition over each piece, and a glyph beside damage numbers
   that says what kind of harm it was (fire, holy light, poison, a song). Drawn as vectors at board scale, so they
   stay crisp at any screen size. Every glyph is drawn in a box from -1 to 1 and scaled to the radius asked for. */
(function () {
  // What each condition looks like: the glyph, and its colour.
  B.STATUS_ICON = {
    rage: ['flame', '#ff7a3a'], enraged: ['flame', '#ff7a3a'], guard: ['shield', '#8ab4ff'], blessed: ['sun', '#ffe07a'],
    inspired: ['note', '#7ee08a'], taunt: ['bang', '#ffb04a'], regen: ['plus', '#7ee08a'], hidden: ['eye', '#b8c4e8'],
    reckless: ['crack', '#ff8a6a'], rattled: ['swirl', '#d49cf0'], weak: ['down', '#d49cf0'], asleep: ['zz', '#9ad0ff'],
    stunned: ['star', '#fff2b0'], poison: ['drop', '#8ee05a'], warded: ['shield', '#ffe07a'], lampward: ['lamp', '#ffe07a'],
    marked: ['target', '#ff6a6a'], charmed: ['heart', '#f08aa6'], unbroken: ['gem', '#ffd24a']
  };
  // The colour and glyph of a damage number, by the kind of harm.
  B.DMG_KIND = {
    hit: ['#ff8a7a', null], crit: ['#ffd24a', 'star'], fire: ['#ffa24a', 'flame'], holy: ['#fff2b8', 'sun'],
    poison: ['#8ee05a', 'drop'], song: ['#f49ac0', 'note'], magic: ['#c79cff', 'spark'], frost: ['#9ad0ff', 'flake'], heal: ['#7ee08a', 'plus']
  };
  const P = {
    flame(c) { c.beginPath(); c.moveTo(0, 1); c.bezierCurveTo(-0.9, 0.9, -0.8, -0.1, -0.2, -0.5); c.quadraticCurveTo(-0.1, -0.1, 0.15, 0); c.quadraticCurveTo(0.05, -0.6, 0.3, -1); c.bezierCurveTo(0.9, -0.4, 0.9, 0.9, 0, 1); c.fill(); },
    shield(c) { c.beginPath(); c.moveTo(0, -0.95); c.lineTo(0.8, -0.65); c.quadraticCurveTo(0.8, 0.5, 0, 1); c.quadraticCurveTo(-0.8, 0.5, -0.8, -0.65); c.closePath(); c.fill(); },
    sun(c) { c.beginPath(); c.arc(0, 0, 0.42, 0, 7); c.fill(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.fillRect(Math.cos(a) * 0.72 - 0.11, Math.sin(a) * 0.72 - 0.11, 0.22, 0.22); } },
    note(c) { c.beginPath(); c.ellipse(-0.3, 0.55, 0.36, 0.27, -0.4, 0, 7); c.fill(); c.fillRect(-0.02, -0.9, 0.2, 1.45); c.beginPath(); c.moveTo(0.18, -0.9); c.quadraticCurveTo(0.8, -0.6, 0.6, -0.1); c.lineTo(0.18, -0.45); c.fill(); },
    bang(c) { c.beginPath(); c.moveTo(-0.22, -0.95); c.lineTo(0.22, -0.95); c.lineTo(0.1, 0.3); c.lineTo(-0.1, 0.3); c.fill(); c.beginPath(); c.arc(0, 0.7, 0.2, 0, 7); c.fill(); },
    plus(c) { c.fillRect(-0.22, -0.8, 0.44, 1.6); c.fillRect(-0.8, -0.22, 1.6, 0.44); },
    eye(c) { c.beginPath(); c.moveTo(-0.95, 0); c.quadraticCurveTo(0, -0.85, 0.95, 0); c.quadraticCurveTo(0, 0.85, -0.95, 0); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(0, 0, 0.28, 0, 7); c.fill(); c.globalCompositeOperation = 'source-over'; },
    crack(c) { P.shield(c); c.globalCompositeOperation = 'destination-out'; c.lineWidth = 0.26; c.beginPath(); c.moveTo(0.1, -1); c.lineTo(-0.2, -0.2); c.lineTo(0.2, 0.2); c.lineTo(-0.05, 1); c.stroke(); c.globalCompositeOperation = 'source-over'; },
    swirl(c) { c.lineWidth = 0.26; c.beginPath(); for (let i = 0; i <= 30; i++) { const a = i * 0.42, r = 0.08 + i * 0.028; i ? c.lineTo(Math.cos(a) * r, Math.sin(a) * r) : c.moveTo(Math.cos(a) * r, Math.sin(a) * r); } c.stroke(); },
    down(c) { c.beginPath(); c.moveTo(-0.8, 0); c.lineTo(0, 0.95); c.lineTo(0.8, 0); c.lineTo(0.28, 0); c.lineTo(0.28, -0.9); c.lineTo(-0.28, -0.9); c.lineTo(-0.28, 0); c.closePath(); c.fill(); },
    zz(c) { c.lineWidth = 0.22; c.lineJoin = 'round'; const z = (x, y, s) => { c.beginPath(); c.moveTo(x - s, y - s); c.lineTo(x + s, y - s); c.lineTo(x - s, y + s); c.lineTo(x + s, y + s); c.stroke(); }; z(-0.3, 0.35, 0.45); z(0.45, -0.45, 0.3); },
    star(c) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.42 : 1; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); },
    drop(c) { c.beginPath(); c.moveTo(0, -1); c.bezierCurveTo(0.35, -0.4, 0.75, 0, 0.7, 0.35); c.arc(0, 0.35, 0.7, 0, Math.PI); c.bezierCurveTo(-0.75, 0, -0.35, -0.4, 0, -1); c.fill(); },
    lamp(c) { c.fillRect(-0.15, -1, 0.3, 0.25); c.beginPath(); c.moveTo(-0.55, -0.7); c.lineTo(0.55, -0.7); c.lineTo(0.45, 0.6); c.lineTo(-0.45, 0.6); c.closePath(); c.fill(); c.fillRect(-0.65, 0.6, 1.3, 0.3); },
    target(c) { c.lineWidth = 0.22; c.beginPath(); c.arc(0, 0, 0.75, 0, 7); c.stroke(); c.beginPath(); c.arc(0, 0, 0.3, 0, 7); c.fill(); c.fillRect(-1, -0.08, 0.4, 0.16); c.fillRect(0.6, -0.08, 0.4, 0.16); c.fillRect(-0.08, -1, 0.16, 0.4); c.fillRect(-0.08, 0.6, 0.16, 0.4); },
    heart(c) { c.beginPath(); c.moveTo(0, 0.95); c.bezierCurveTo(-1.1, 0.1, -0.8, -1, 0, -0.45); c.bezierCurveTo(0.8, -1, 1.1, 0.1, 0, 0.95); c.fill(); },
    gem(c) { c.beginPath(); c.moveTo(0, -1); c.lineTo(0.75, -0.25); c.lineTo(0, 1); c.lineTo(-0.75, -0.25); c.closePath(); c.fill(); },
    spark(c) { c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 0.25 : 1; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); },
    pebbles(c) { for (const [x, y, r] of [[-0.45, 0.25, 0.42], [0.4, 0.4, 0.36], [0.05, -0.4, 0.4]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } },
    wave(c) { c.lineWidth = 0.28; c.lineCap = 'round'; for (const y of [-0.35, 0.35]) { c.beginPath(); c.moveTo(-0.95, y); c.quadraticCurveTo(-0.5, y - 0.4, 0, y); c.quadraticCurveTo(0.5, y + 0.4, 0.95, y); c.stroke(); } },
    up(c) { c.beginPath(); c.moveTo(-0.9, 0.35); c.lineTo(0, -0.6); c.lineTo(0.9, 0.35); c.lineTo(0.5, 0.35); c.lineTo(0, -0.12); c.lineTo(-0.5, 0.35); c.closePath(); c.fill(); c.fillRect(-0.9, 0.62, 1.8, 0.3); },
    flake(c) { c.lineWidth = 0.2; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; c.beginPath(); c.moveTo(Math.cos(a) * 0.95, Math.sin(a) * 0.95); c.lineTo(-Math.cos(a) * 0.95, -Math.sin(a) * 0.95); c.stroke(); } }
  };
  // A bare glyph, centred on (x, y), radius r.
  B.glyph = function (c, name, x, y, r, color) {
    if (!P[name]) return;
    c.save(); c.translate(x, y); c.scale(r, r); c.fillStyle = c.strokeStyle = color; P[name](c); c.restore();
  };
  // A condition badge: a dark disc rimmed blue (helps) or violet (hurts), the glyph inside, and a count of turns
  // left as small ticks under it when the condition runs out soon.
  B.statusBadge = function (c, id, x, y, r) {
    const sd = G.D.statuses[id] || {}, ic = B.STATUS_ICON[id] || ['spark', sd.good ? '#8ab4ff' : '#d49cf0'];
    c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = 'rgba(14,10,22,.9)'; c.fill();
    c.lineWidth = 0.6; c.strokeStyle = sd.good ? '#6a94e8' : '#a46ad0'; c.stroke();
    B.glyph(c, ic[0], x, y, r * 0.66, ic[1]);
  };
  // The small mark on a square that says what kind of ground it is, faint, so the board reads at a glance.
  B.TER_GLYPH = { high: ['up', '255,236,190'], rough: ['pebbles', '230,205,160'], shallows: ['wave', '180,215,255'], ice: ['flake', '220,240,255'], hallowed: ['sun', '255,226,140'] };
  B.terrainMark = function (c, kind, x, y) {
    const g = B.TER_GLYPH[kind]; if (!g || G.opts.terMarks === false) return;
    c.save(); c.globalAlpha = 0.6; B.glyph(c, g[0], x + 0.5, y + 0.5, 2.7, 'rgba(10,8,16,.8)'); c.globalAlpha = 0.85; B.glyph(c, g[0], x, y, 2.7, 'rgb(' + g[1] + ')'); c.restore();
  };
  // The badges over a piece, centred above it.
  B.statusRow = function (c, o, cx, y) {
    const list = o.statuses.filter(s => G.D.statuses[s.id]).slice(0, 4), r = 2.7, gap = 6.2;
    const x0 = cx - (list.length - 1) * gap / 2;
    list.forEach((st, i) => {
      B.statusBadge(c, st.id, x0 + i * gap, y, r);
      // how many turns it has left, small at the badge's corner (nothing for the ones that last the fight)
      const n = st.turns; if (n == null || n <= 0 || n >= 9) return;
      const x = x0 + i * gap + r * 0.95, yy = y + r * 0.95;
      c.save(); c.font = 'bold 3.6px ui-monospace, Menlo, Consolas, monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
      c.strokeStyle = '#120c18'; c.lineWidth = 1.3; c.strokeText(String(n), x, yy); c.fillStyle = '#ffffff'; c.fillText(String(n), x, yy); c.restore();
    });
  };
})();
