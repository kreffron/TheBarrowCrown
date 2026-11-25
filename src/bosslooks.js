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
/* Recurring townsfolk: one small signature detail each, in the 40x64 layout (eyes near y 10.5 at x 18.9 and 21.4,
   the mouth near (20.4, 12.7), the near ear near (17.1, 11.1), the collar near y 14.5). */
(function () {
  const T = {}, { shade, alpha } = B.fig;
  const ring = (c, x, y, rx, ry, w, col) => { c.save(); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 6.283); c.stroke(); c.restore(); };
  const quillPen = (K, x0, y0, x1, y1, col) => { K.line([x0, y0, x1, y1], 0.12, '#3a2a20'); const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a);
    K.shape(q => { q.moveTo(x0 + (x1 - x0) * 0.25, y0 + (y1 - y0) * 0.25); q.quadraticCurveTo(x1 + nx * 0.9, y1 + ny * 0.9, x1 + (x1 - x0) * 0.15, y1 + (y1 - y0) * 0.15); q.quadraticCurveTo(x1 - nx * 0.5, y1 - ny * 0.5, x0 + (x1 - x0) * 0.25, y0 + (y1 - y0) * 0.25); q.closePath(); }, col || '#f2ece0'); };
  // Reeve Halda: the reeve's brass badge, and a quill behind her ear
  T.halda = (K, c) => { quillPen(K, 17.8, 10.4, 15.0, 6.6); K.shape(q => { q.moveTo(15.4, 17.6); q.lineTo(17.8, 17.6); q.lineTo(17.8, 19.4); q.quadraticCurveTo(16.6, 20.6, 16.6, 20.6); q.quadraticCurveTo(15.4, 19.4, 15.4, 19.4); q.closePath(); }, K.lin(15.4, 17.6, 17.8, 20.6, [[0, '#fff0b0'], [0.5, '#d8a840'], [1, '#7a5214']])); K.ell(16.6, 18.8, 0.35, 0.35, '#7a5214'); };
  // Tobias: round spectacles
  T.tobias = (K, c) => { ring(c, 18.9, 10.55, 0.85, 0.72, 0.1, '#5a4a30'); ring(c, 21.4, 10.55, 0.74, 0.66, 0.1, '#5a4a30'); K.curve([19.75, 10.4, 20.15, 10.15, 20.66, 10.4], 0.09, '#5a4a30'); K.line([18.05, 10.4, 17.4, 10.8], 0.09, '#5a4a30');
    K.ell(18.6, 10.25, 0.25, 0.15, 'rgba(255,255,255,.55)'); K.ell(21.15, 10.25, 0.22, 0.13, 'rgba(255,255,255,.5)'); };
  // Old Pell: a long clay pipe, and a curl of smoke
  T.pell = (K, c, H) => { K.line([20.9, 12.9, 23.6, 14.2], 0.22, '#e8e0d0'); K.shape(q => { q.moveTo(23.2, 13.6); q.lineTo(24.4, 13.4); q.lineTo(24.2, 14.8); q.quadraticCurveTo(23.6, 15.2, 23.3, 14.6); q.closePath(); }, '#d8cebe'); K.ell(23.8, 13.5, 0.5, 0.18, '#3a2a24'); K.ell(23.8, 13.45, 0.25, 0.1, '#ff9a40');
    H.soft(0.25, () => K.curve([23.8, 13.2, 23.2, 11.6, 24.4, 10.2, 23.6, 8.4], 0.4, 'rgba(240,240,240,.35)')); };
  // Garrick: a stalk of wheat in the corner of his mouth
  T.garrick = (K) => { K.line([20.9, 12.85, 24.8, 11.6], 0.1, '#d8b860'); for (let i = 0; i < 5; i++) { const t = 0.72 + i * 0.06, x = 20.9 + 3.9 * t, y = 12.85 - 1.25 * t; K.ell(x, y - 0.18, 0.22, 0.12, '#e8c870'); K.ell(x, y + 0.18, 0.22, 0.12, '#c8a850'); } };
  // Wenna: a flower tucked in her hair
  T.wenna = (K) => { const x = 17.2, y = 7.4; for (let i = 0; i < 5; i++) { const a = i * 1.257; K.ell(x + Math.cos(a) * 0.55, y + Math.sin(a) * 0.55, 0.42, 0.42, i % 2 ? '#f8f0f4' : '#f0e0ea'); } K.ell(x, y, 0.32, 0.32, '#f0c040'); K.ell(x + 1, y + 0.6, 0.5, 0.2, '#5a8a3a'); };
  // Odo: a bright feather in his hatband, and a gold ring on show
  T.odo = (K) => { K.shape(q => { q.moveTo(17.2, 6.2); q.quadraticCurveTo(14.4, 3.2, 13.0, 1.2); q.quadraticCurveTo(15.6, 2.8, 17.8, 5.8); q.closePath(); }, K.lin(13, 1, 17.8, 6.2, [[0, '#f0d060'], [0.5, '#d84030'], [1, '#801818']])); K.line([17.4, 6.0, 13.4, 1.6], 0.06, 'rgba(255,240,220,.6)'); };
  // Harbourmaster Quill: a brass spyglass at his hip, a gold earring
  T.quill = (K, c) => { const sp = K.shape(q => { q.moveTo(23.2, 25.2); q.lineTo(27.6, 30.4); q.lineTo(26.8, 31.0); q.lineTo(22.6, 25.8); q.closePath(); }, K.lin(22.6, 25.2, 27.6, 31, [[0, '#fff0b0'], [0.5, '#c89a40'], [1, '#6a4a14']])); for (const t of [0.3, 0.6]) K.line([23.2 + 4.4 * t - 0.4, 25.2 + 5.2 * t + 0.3, 23.2 + 4.4 * t + 0.3, 25.2 + 5.2 * t - 0.3], 0.14, '#5a3a10'); ring(c, 17.1, 12.3, 0.32, 0.38, 0.12, '#e8c050'); };
  // Mags: gold hoop earrings
  T.mags = (K, c) => { ring(c, 17.1, 12.4, 0.42, 0.5, 0.14, '#e8c050'); K.ell(16.8, 12.1, 0.12, 0.1, '#fff4c8'); };
  // Chief Sigrid: a gold torc at her throat
  T.sigrid = (K) => { K.curve([18.2, 14.4, 20.2, 15.6, 22.2, 14.4], 0.42, '#c8962e'); K.curve([18.2, 14.3, 20.2, 15.4, 22.2, 14.3], 0.14, '#fff0b8'); K.ell(18.1, 14.3, 0.5, 0.5, '#e0b040'); K.ell(22.3, 14.3, 0.5, 0.5, '#c8962e'); };
  // High Warden Oriel: the Warden's lamp on a chain at her breast
  T.oriel = (K) => { K.curve([18.4, 14.6, 20, 17.6, 21.6, 14.6], 0.08, '#d8b040'); K.R(19.4, 17.6, 1.2, 1.6, K.rad(20, 18.4, 0.1, 1, [[0, '#fff6c8'], [1, '#ffb040']]), 0.2); K.R(19.25, 17.4, 1.5, 0.35, '#c8962e', 0.1); K.R(19.25, 19.1, 1.5, 0.35, '#c8962e', 0.1); };
  // Wren: a clerk's quill behind her ear, and ink on her cheek
  T.wren = (K, c, H) => { quillPen(K, 17.8, 10.4, 15.2, 7.0, '#e8e4dc'); H.soft(0.08, () => K.line([18.2, 13.3, 19.0, 13.5], 0.16, 'rgba(30,40,90,.45)')); };
  // Bram: a bar towel over his shoulder
  T.bram = (K, c, H) => { const tw = K.shape(q => { q.moveTo(24.4, 15.2); q.quadraticCurveTo(26.2, 14.8, 27.4, 16); q.lineTo(28, 21.6); q.lineTo(26.2, 21.8); q.lineTo(25.4, 17); q.closePath(); }, K.lin(24.4, 0, 28, 0, [[0, '#f4ece0'], [1, '#c8bca8']])); K.clip(tw, () => { for (const y of [19.4, 20.2]) K.line([25, y, 28.4, y - 0.2], 0.2, 'rgba(180,60,50,.6)'); }); };
  // Ingrid: soot on her cheek and brow from the forge
  T.ingrid = (K, c, H) => { H.soft(0.15, () => K.curve([18.6, 8.7, 20.2, 8.4, 22.0, 8.8], 0.32, 'rgba(40,32,28,.3)')); };   // soot where she wiped her brow
  B.townSig = T;
})();
