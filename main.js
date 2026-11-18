/* Title screen and boot. */
const Title = G.title = { el: null };
Title.draw = function (c) {
  const g = c.createLinearGradient(0, 0, 0, 240);
  g.addColorStop(0, '#080a1e'); g.addColorStop(0.62, '#1b2350'); g.addColorStop(1, '#3a2f55');
  c.fillStyle = g; c.fillRect(0, 0, 320, 240);
  for (let i = 0; i < 70; i++) {
    const x = (i * 97 + 13) % 320, y = (i * 53 + 7) % 140, a = 0.45 + 0.45 * Math.sin(G.time / 700 + i * 1.7);
    c.fillStyle = 'rgba(244,241,230,' + a.toFixed(2) + ')'; c.fillRect(x, y, 1, 1);
  }
  c.fillStyle = '#e9e4c8'; c.beginPath(); c.arc(262, 44, 13, 0, 7); c.fill();
  c.fillStyle = '#131a3a'; c.beginPath(); c.arc(256, 40, 12, 0, 7); c.fill();
  // far hills, then the barrow
  c.fillStyle = '#151b3a'; c.beginPath(); c.moveTo(0, 190); c.quadraticCurveTo(60, 150, 130, 186); c.quadraticCurveTo(230, 140, 320, 180); c.lineTo(320, 240); c.lineTo(0, 240); c.fill();
  c.fillStyle = '#0e1226'; c.beginPath(); c.moveTo(70, 214); c.quadraticCurveTo(160, 120, 250, 214); c.fill();
  c.fillStyle = '#2a2f4a'; c.fillRect(150, 186, 20, 4); c.fillRect(150, 190, 4, 24); c.fillRect(166, 190, 4, 24);
  c.fillStyle = '#05060c'; c.fillRect(154, 190, 12, 24);
  const glow = 0.5 + 0.5 * Math.sin(G.time / 500);
  c.fillStyle = 'rgba(232,193,74,' + (0.25 + glow * 0.5).toFixed(2) + ')'; c.fillRect(159, 200, 2, 6);
  c.fillStyle = '#0a0d1c'; c.fillRect(0, 212, 320, 28);
  ['runa', 'dask', 'maren', 'finch'].forEach((s, i) => G.gfx.drawSprite(c, s, 'up', 0, 122 + i * 20, 206, 1));
};
Title.show = async function () {
  G.scene = 'title'; G.scenePress = null;
  if (Field.hudEl) Field.hud(true);                             // the leader bar belongs to the field, not the title
  G.audio.music('title');
  const t = UI.el('div', 'title', '<div class="tname">The Barrow Crown</div><div class="tsub">A tabletop-style adventure in five chapters</div><div class="tfoot">' + G.keyText('Arrows or WASD to move · {a} to interact and confirm · {b} for the menu') + '</div>');
  UI.root.appendChild(t); Title.el = t;
  for (;;) {
    const last = G.latestSlot(), save = last ? G.loadSlot(last) : null;
    const items = [{ label: 'New Game', value: 'new' }];
    if (save) items.unshift({ label: 'Continue', value: 'cont' }, { label: 'Load Game', value: 'load' });
    items.push({ label: 'Load from code', value: 'code' });
    const pick = await UI.menu({ items, cancel: false, cls: 'tmenu' });
    if (pick === 'new') {
      let n = 1;
      if (save) { n = await G.pickSlot('new', 'tmenu wide'); if (!n) continue; }
      await UI.fade(true, 300); t.remove();
      G.newGame(); G.slot = n;
      await Field.exec(async () => {
        await G.run(G.D.scripts.newgame);
      });
      return;
    }
    let s = null;
    if (pick === 'cont') { s = save; G.slot = last; }
    else if (pick === 'load') { const n = await G.pickSlot('load', 'tmenu wide'); if (!n) continue; s = G.loadSlot(n); G.slot = n; }
    else if (pick === 'code') { s = await Menu.codeBox('import'); if (s) { const n = save ? await G.pickSlot('new', 'tmenu wide') : 1; if (!n) continue; G.slot = n; } }
    if (s) {
      await UI.fade(true, 300); t.remove(); G.S = s;
      await Field.exec(() => Field.enter(s.map, { x: s.x, y: s.y }, { dir: s.dir, noSave: true }));
      return;
    }
  }
};

window.addEventListener('load', function () {
  G.cv = document.getElementById('cv'); G.ctx = G.cv.getContext('2d');
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) document.body.classList.add('touch');
  G.loadOpts(); UI.init(); G.initInput(); G.layout();
  window.addEventListener('resize', G.layout);
  document.addEventListener('pointerdown', () => G.audio.unlock());
  G.gfx.build();
  requestAnimationFrame(G.loop);
  if (!window.__NO_TITLE) Title.show();
});
