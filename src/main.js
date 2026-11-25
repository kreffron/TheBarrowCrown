/* Title screen and boot. */
const Title = G.title = { el: null };
Title.draw = function (c) {
  const R = B.RES || 1; c.setTransform(R, 0, 0, R, 0, 0); c.imageSmoothingEnabled = true;
  Scenes.paint(c, 'title', G.time);
  const lineup = Title.lineup();
  if (lineup) {                                          // the four of them, painted, two either side of the barrow, facing it
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    const calm = B.calm && B.calm();
    [['runa', 46, 1], ['dask', 92, 1], ['maren', 230, -1], ['finch', 276, -1]].forEach(([id, x, f], i) => {
      const cv = lineup[id], w = 46, h = 73.6, sway = calm ? 0 : Math.sin(G.time / 1900 + i * 1.9) * 0.02;
      c.save(); c.translate(x, 233); if (f < 0) c.scale(-1, 1); if (sway) c.transform(1, 0, sway, 1, 0, 0);
      c.drawImage(cv, -w / 2, -h, w, h); c.restore();
    });
  } else {
    c.imageSmoothingEnabled = false;                     // (classic figures: the four of them, small, looking up at it)
    ['runa', 'dask', 'maren', 'finch'].forEach((s, i) => G.gfx.drawSprite(c, s, 'up', 0, 122 + i * 20, 206, 1));
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
};
// the heroes for the title, painted once: moonlight from above, the barrow's lamplight on the side facing it
Title.lineup = function () {
  if (!(B.heroicOn && B.heroicOn('runa') && B.heroPainter)) return null;
  if (Title._lineup) return Title._lineup;
  const out = {}, ks = 6;
  for (const id of ['runa', 'dask', 'maren', 'finch']) {
    const cv = document.createElement('canvas'); cv.width = 40 * ks; cv.height = 64 * ks;
    const c = cv.getContext('2d'); c.scale(ks, ks); c.lineJoin = 'round'; c.lineCap = 'round';
    const after = B.heroPainter(id)(c); if (after) after(c);
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-atop';
    let g = c.createLinearGradient(0, 0, 0, cv.height); g.addColorStop(0, 'rgba(70,90,170,.30)'); g.addColorStop(1, 'rgba(20,24,60,.42)'); c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
    g = c.createLinearGradient(cv.width * 0.45, 0, cv.width, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(255,190,110,.30)'); c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
    g = c.createLinearGradient(0, 0, cv.width * 0.4, 0); g.addColorStop(0, 'rgba(170,200,255,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
    out[id] = cv;
  }
  return (Title._lineup = out);
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
