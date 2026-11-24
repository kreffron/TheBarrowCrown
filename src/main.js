/* Title screen and boot. */
const Title = G.title = { el: null };
Title.draw = function (c) {
  const R = B.RES || 1; c.setTransform(R, 0, 0, R, 0, 0); c.imageSmoothingEnabled = true;
  Scenes.paint(c, 'title', G.time);
  c.imageSmoothingEnabled = false;                     // the four of them, small, looking up at it
  ['runa', 'dask', 'maren', 'finch'].forEach((s, i) => G.gfx.drawSprite(c, s, 'up', 0, 122 + i * 20, 206, 1));
  c.setTransform(1, 0, 0, 1, 0, 0);
};
// The title paints at screen resolution, like a battle; leaving it puts the canvas back for the field.
Title.leave = () => { if (G.cv) { G.cv.width = 320; G.cv.height = 240; G.cv.classList.remove('smooth'); } };
Title.show = async function () {
  G.scene = 'title'; G.scenePress = null;
  if (Field.hudEl) Field.hud(true);                             // the leader bar belongs to the field, not the title
  G.audio.music('title');
  B.fitRes();
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
      await UI.fade(true, 300); t.remove(); Title.leave();
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
      await UI.fade(true, 300); t.remove(); Title.leave(); G.S = G.upgradeSave(s);
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
