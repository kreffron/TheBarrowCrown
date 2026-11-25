/* Bosses: how a boss looks on the board. Every boss fight's lead foe is marked (B.bossUnit.boss) and painted as side 3:
   a crimson-and-gold lacquered plinth with a medallion, an aura behind it in its own colour, a slightly larger
   figure (B.pieceSize), and, for the story's chief villains, a signature detail painted on the figure itself
   (B.bossSig, by figure; these show in their portraits too). */
(function () {
  const { shade, alpha } = B.fig;
  // the aura's colour: spirits of ash burn, frost things glitter, the dead glow cold, the shard-bearers go violet
  const ASH = /^ash|cinder/, FROST = /^(rime|frost)|^(giant|bear|grimtusk|wight)$/, VIOLET = { corrcrowned: 1, veyra: 1, mirrorshade: 1 };
  B.bossAura = function (name) {
    const sp = G.D.sprites[name] || {};
    if (VIOLET[name]) return '176,128,255';
    if (ASH.test(name)) return '255,140,60';
    if (FROST.test(name)) return '168,224,255';
    if (sp.skel || { wraith: 1, prior: 1, archivist: 1, keeper: 1, watcher: 1, hollowwarden: 1, boneknight: 1, king: 1, abbot: 1, colossus: 1, shade: 1 }[name]) return '127,224,208';
    return '255,80,96';
  };
  // the aura and motes behind and round the finished piece (cv: the 40x64 layout at HD)
  B.bossDress = function (cv, name, HD) {
    const col = B.bossAura(name), c = cv.getContext('2d');
    let seed = 3; for (const ch of name) seed = (seed * 31 + ch.charCodeAt(0)) % 2147483000;
    const rr = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    c.save(); c.scale(HD, HD);
    c.globalCompositeOperation = 'destination-over';                     // behind the figure and its base
    const g = c.createRadialGradient(20, 30, 2, 20, 30, 22); g.addColorStop(0, 'rgba(' + col + ',.42)'); g.addColorStop(0.55, 'rgba(' + col + ',.16)'); g.addColorStop(1, 'rgba(' + col + ',0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(20, 30, 17, 24, 0, 0, 6.283); c.fill();
    // a few soft motes drifting up round it, behind the figure
    for (let i = 0; i < 7; i++) { const x = 5 + rr() * 30, y = 4 + rr() * 38, r = 0.25 + rr() * 0.3; const mg = c.createRadialGradient(x, y, 0, x, y, r * 3); mg.addColorStop(0, 'rgba(' + col + ',.6)'); mg.addColorStop(1, 'rgba(' + col + ',0)'); c.fillStyle = mg; c.beginPath(); c.arc(x, y, r * 3, 0, 6.283); c.fill(); }
    c.restore();
  };
  // the plinth's medallion and studs (drawn over the base, before the figure)
  B.bossBase = function (c) {
    for (let i = 0; i < 9; i++) { const a = 0.35 + i * (2.44 / 8), x = 20 + Math.cos(a) * 14.4, y = 57 + Math.sin(a) * 3.8; c.fillStyle = '#f4d27a'; c.beginPath(); c.arc(x, y, 0.42, 0, 6.283); c.fill(); c.fillStyle = 'rgba(80,40,0,.6)'; c.beginPath(); c.arc(x + 0.12, y + 0.12, 0.2, 0, 6.283); c.fill(); }
    const g = c.createRadialGradient(19.4, 57.6, 0.2, 20, 58.4, 2.2); g.addColorStop(0, '#fff2b8'); g.addColorStop(0.5, '#e0b040'); g.addColorStop(1, '#7a4a10');
    c.fillStyle = g; c.beginPath(); c.ellipse(20, 58.6, 2.1, 1.5, 0, 0, 6.283); c.fill();
    c.fillStyle = '#5a1020'; c.beginPath(); c.moveTo(18.9, 59.1); c.lineTo(18.9, 58.0); c.lineTo(19.45, 58.5); c.lineTo(20, 57.7); c.lineTo(20.55, 58.5); c.lineTo(21.1, 58.0); c.lineTo(21.1, 59.1); c.closePath(); c.fill();   // a crown
  };

  /* ---------- signature details, in the 40x64 layout (the face near (19.9, 10.7), shoulders y 15-17, belt y 29) ---------- */
  const S = {};
  const glow = (K, x, y, r, col, a) => K.ell(x, y, r, r, K.rad(x, y, 0, r, [[0, 'rgba(' + col + ',' + a + ')'], [1, 'rgba(' + col + ',0)']]));
  const gem = (K, x, y, r, col) => { K.ell(x, y, r, r * 1.15, K.rad(x - r * 0.3, y - r * 0.4, 0.02, r * 1.2, [[0, '#ffffff'], [0.35, col], [1, shade(col, -60)]])); };
  // the Barrow King: an ermine mantle on his shoulders, a chain of office, his crown alight
  S.king = (K, c, H) => {
    const m = K.shape(q => { q.moveTo(10.6, 17.6); q.quadraticCurveTo(12.4, 14.4, 16.6, 14.6); q.quadraticCurveTo(20, 15.6, 23.4, 14.6); q.quadraticCurveTo(27.6, 14.4, 29.4, 17.6); q.quadraticCurveTo(26, 18.6, 23.6, 17.4); q.quadraticCurveTo(20, 18.8, 16.4, 17.4); q.quadraticCurveTo(14, 18.6, 10.6, 17.6); q.closePath(); },
      K.lin(10, 14, 30, 18, [[0, '#ffffff'], [0.6, '#ece6da'], [1, '#a8a294']]));
    K.clip(m, () => { for (let i = 0; i < 70; i++) { const x = 10.6 + H.rr() * 18.8, y = 14.4 + H.rr() * 4.2; K.line([x, y, x + 0.1, y + 0.5], 0.06, 'rgba(120,110,100,.35)'); } });
    for (const [x, y] of [[12.6, 16.8], [15.2, 16.2], [18.2, 16.8], [21.8, 16.8], [24.8, 16.2], [27.4, 16.8]]) { K.poly([x - 0.25, y - 0.4, x + 0.25, y - 0.4, x + 0.1, y + 0.5, x - 0.1, y + 0.5], '#141016'); }
    for (let i = 0; i <= 12; i++) { const t = i / 12, x = 15.2 + t * 9.6, y = 17.6 + Math.sin(t * Math.PI) * 4.4; K.ell(x, y, 0.34, 0.24, i % 2 ? '#f4d27a' : '#c89a36'); }
    gem(K, 20, 22.6, 0.9, '#c02838'); K.ell(20, 22.6, 1.25, 1.35, 'rgba(0,0,0,0)');
    glow(K, 20, 5.2, 5.2, '255,220,120', 0.35); for (const [x, y, col] of [[17.6, 6.6, '#5ab0e8'], [20.1, 5.6, '#c8443c'], [22.6, 6.6, '#5ab0e8']]) glow(K, x, y, 1.1, col === '#c8443c' ? '255,90,80' : '120,200,255', 0.8);
  };
  // Ilvane Corr, crowned: the four shards rising from his crown, each burning its own colour
  S.corrcrowned = (K) => {
    const sh = [[17.4, 4.6, '120,230,255', '#7ae6ff'], [19.2, 3.4, '255,210,110', '#ffd26e'], [20.9, 3.4, '255,110,110', '#ff6e6e'], [22.7, 4.6, '140,255,160', '#8cffa0']];
    for (const [x, y, rgb] of sh) glow(K, x, y, 2.4, rgb, 0.5);
    for (const [x, y, , col] of sh) { K.poly([x, y - 1.8, x + 0.6, y, x, y + 0.9, x - 0.6, y], K.lin(x - 0.6, y - 1.8, x + 0.6, y + 0.9, [[0, '#ffffff'], [0.4, col], [1, shade(col, -50)]])); K.line([x - 0.15, y - 1.3, x - 0.25, y + 0.3], 0.08, 'rgba(255,255,255,.8)'); }
  };
  // Sister Veyra: the stolen shard on a cord at her breast
  S.veyra = (K) => { K.curve([17.6, 14.8, 18.6, 17.8, 20, 18.6], 0.1, '#3a3040'); K.curve([22.4, 14.8, 21.4, 17.8, 20, 18.6], 0.1, '#3a3040'); glow(K, 20, 19.6, 3.2, '190,140,255', 0.55); K.poly([20, 18.4, 20.6, 19.6, 20, 21.0, 19.4, 19.6], K.lin(19.4, 18.4, 20.6, 21, [[0, '#ffffff'], [0.45, '#c8a0ff'], [1, '#5a2a9a']])); };
  // Brannoc Vosk: a fat gold chain and rings on his fists
  S.vosk = (K) => { for (let i = 0; i <= 14; i++) { const t = i / 14, x = 14.2 + t * 11.6, y = 16.4 + Math.sin(t * Math.PI) * 4.6; K.ell(x, y, 0.42, 0.3, i % 2 ? '#f4d27a' : '#c89a36'); } K.ell(20, 21.6, 1.1, 1.1, K.rad(19.6, 21.2, 0.1, 1.2, [[0, '#fff2b8'], [1, '#9a6a14']])); for (const [x, y] of [[11.9, 28.6], [29.3, 27.1]]) K.ell(x, y, 0.55, 0.35, '#f4d27a'); };
  // Knight-Captain Ilsabet: a gilt laurel round her brow
  S.ilsabet = (K) => { for (let i = 0; i < 9; i++) { const t = i / 8, x = 16.4 + t * 7.2, y = 7.5 - Math.sin(t * Math.PI) * 0.9; K.ell(x, y, 0.55, 0.28, '#e8c14a'); K.ell(x - 0.15, y - 0.08, 0.22, 0.1, '#fff2b8'); } };
  // the ash knights: embers in the cracks of their armour, and sparks
  const ember = (K, c, H) => {
    for (let i = 0; i < 9; i++) { let x = 13.6 + H.rr() * 12.8, y = 16 + H.rr() * 16; const pts = [x, y]; for (let k = 0; k < 4; k++) { x += (H.rr() - 0.5) * 1.6; y += 0.5 + H.rr() * 0.9; pts.push(x, y); }
      H.soft(0.25, () => K.line(pts, 0.5, 'rgba(255,120,40,.55)')); K.line(pts, 0.14, '#ffd27a'); }
    for (let i = 0; i < 10; i++) { const x = 12 + H.rr() * 16, y = 2 + H.rr() * 14; glow(K, x, y, 0.8, '255,150,60', 0.9); }
  };
  S.ashmarshal = ember; S.ashenknight = ember; S.ashghoul = ember;
  // the Hollow Abbot: a tall mitre over his hood
  S.abbot = (K) => { const mt = K.shape(q => { q.moveTo(17.3, 6.6); q.quadraticCurveTo(17.6, 2.6, 20, 0.6); q.quadraticCurveTo(22.4, 2.6, 22.7, 6.6); q.closePath(); }, K.lin(17.3, 0, 22.7, 0, [[0, '#ffffff'], [0.6, '#e0dccc'], [1, '#8a8678']])); K.clip(mt, () => { K.R(19.5, 0, 1, 7, '#c8a040', 0); K.R(17, 3.4, 6, 0.8, '#c8a040', 0); }); };
  // Grukk: a necklace of teeth and bones, and war paint
  S.grukk = (K) => { for (let i = 0; i <= 10; i++) { const t = i / 10, x = 15.6 + t * 8.8, y = 16.6 + Math.sin(t * Math.PI) * 2.6; K.poly([x - 0.25, y, x + 0.25, y, x, y + 0.9], i % 3 ? '#f0e8d0' : '#c8b890'); } K.curve([15.6, 16.6, 20, 19.4, 24.4, 16.6], 0.08, '#4a3020'); for (const x of [17.6, 18.3, 21.6, 22.3]) K.line([x, 11.4, x - 0.2, 13.2], 0.22, 'rgba(180,30,30,.85)'); };
  // Inquisitor Vell: a scarlet sash, and the silver hand pinned to it
  S.inquisitor = (K) => { K.shape(q => { q.moveTo(13.8, 15.6); q.lineTo(15.6, 15.2); q.lineTo(26.6, 28.4); q.lineTo(24.6, 29.2); q.closePath(); }, K.lin(13, 15, 27, 29, [[0, '#d83040'], [1, '#701020']])); K.ell(17.4, 18.6, 0.9, 0.9, K.rad(17.1, 18.3, 0.05, 1, [[0, '#ffffff'], [1, '#8a90a0']])); };
  // Lord Ashby: a lace cravat at his throat
  S.duelist = (K) => { for (let i = 0; i < 4; i++) K.ell(20, 15.2 + i * 0.8, 1.3 - i * 0.18, 0.5, i % 2 ? '#f4efe4' : '#ffffff'); K.ell(20, 15.6, 0.32, 0.32, '#c02838'); };
  // Rime-Mother Hesk: a crown of icicles
  S.rimemother = (K) => { for (let i = 0; i < 7; i++) { const x = 16.6 + i * 1.15, h = 2 + (i % 2 ? 0.8 : 1.8); K.poly([x - 0.45, 6.6, x, 6.6 - h, x + 0.45, 6.6], K.lin(x, 6.6 - h, x, 6.6, [[0, '#ffffff'], [1, '#8ad0f0']])); } };
  B.bossSig = S;
})();
