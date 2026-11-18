/* The map screen (Menu > Map). Area: the current place as a mini-map of the squares explored so far, with exits.
   Region: every place found so far, laid out by the direction of the exits between them, with the roads that lead
   somewhere not yet visited drawn as dashed stubs. Exploration is tracked in src/field.js (Field.reveal). */
(function () {
  const W = 424, H = 344;
  const thingsOf = def => Object.entries(def.things || {}).flatMap(([ch, t]) => (Array.isArray(t) ? t : [t]).map(d => [ch, d]));
  const where = (def, ch) => { for (let y = 0; y < def.rows.length; y++) { const x = def.rows[y].indexOf(ch); if (x >= 0) return [x, y]; } return null; };
  const known = () => Object.keys(G.S.seen || {}).filter(id => G.D.maps[id]);
  const nameOf = id => (G.D.maps[id] && G.D.maps[id].name) || id;
  const rgb = (a, d) => 'rgb(' + a.map(v => Math.max(0, Math.min(255, v + (d || 0)))).join(',') + ')';
  // The visible exits of the current map: [{ x, y, to, edge }].
  function exits() {
    const m = Field.map, out = [];
    for (const th of m.things) {
      if (th.def.type !== 'warp' || !th.def.to || !Field.visible(th)) continue;
      const edge = th.x <= 1 || th.y <= 1 || th.x >= m.w - 2 || th.y >= m.h - 2;
      out.push({ x: th.x, y: th.y, to: th.def.to, edge });
    }
    return out;
  }
  function label(c, text, x, y, col) {
    c.font = 'bold 15px ui-monospace, Menlo, Consolas, monospace';
    const w = c.measureText(text).width + 8;
    x = Math.max(2, Math.min(W - w - 2, x - w / 2)); y = Math.max(2, Math.min(H - 20, y));
    c.fillStyle = 'rgba(10,10,24,.85)'; c.fillRect(x, y, w, 19); c.strokeStyle = col; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, w - 1, 18);
    c.fillStyle = col; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText(text, x + 4, y + 2);
  }
  Menu.drawArea = function (cv) {
    const c = cv.getContext('2d'), m = Field.map, bits = Field.seenBits || new Uint8Array(m.w * m.h);
    c.fillStyle = '#07060b'; c.fillRect(0, 0, W, H);
    const cell = Math.max(2, Math.min(Math.floor(W / m.w), Math.floor((H - 24) / m.h))), ox = Math.floor((W - cell * m.w) / 2), oy = 22 + Math.floor((H - 24 - cell * m.h) / 2);
    let seen = 0;
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      if (!bits[y * m.w + x]) continue; seen++;
      const t = m.t[y][x], td = G.D.tiles[t] || {};
      c.fillStyle = rgb(G.gfx.avgColor(t), td.solid ? -45 : 0); c.fillRect(ox + x * cell, oy + y * cell, cell, cell);
    }
    const drawn = [];                                              // one label for exits side by side that lead to the same place
    for (const e of exits()) {
      if (!bits[e.y * m.w + e.x]) continue;
      const px = ox + e.x * cell + cell / 2, py = oy + e.y * cell + cell / 2, been = !!(G.S.seen || {})[e.to];
      c.fillStyle = '#ffd24a'; c.fillRect(px - 3, py - 3, 7, 7); c.fillStyle = '#1a1420'; c.fillRect(px - 1, py - 1, 3, 3);
      if (e.edge && !drawn.some(q => q[0] === e.to && Math.abs(q[1] - e.x) + Math.abs(q[2] - e.y) <= 3)) { drawn.push([e.to, e.x, e.y]); label(c, (been ? nameOf(e.to) : '???'), px, py + (e.y >= m.h - 2 ? -24 : 7), been ? '#ffd24a' : '#9cc4ff'); }
    }
    for (const th of m.things) {                                   // prayer places (gold) and venues (rose), dim once used
      const sc = th.def.abil && th.def.abil.script && th.def.abil.script[0]; if (!sc || (sc[0] !== 'pray' && sc[0] !== 'busk') || !bits[th.y * m.w + th.x]) continue;
      const px = ox + th.x * cell + cell / 2, py = oy + th.y * cell + cell / 2, used = G.flag(sc[0] + '.' + sc[1]);
      c.globalAlpha = used ? 0.45 : 1; c.fillStyle = sc[0] === 'pray' ? '#ffe07a' : '#f08aa6';
      const r = Math.max(4.5, Math.min(11, cell * 0.42));
      c.beginPath(); c.arc(px, py, r, 0, 7); c.fill(); c.strokeStyle = '#1a1420'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#1a1420'; c.font = 'bold ' + Math.round(r * 1.7) + 'px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sc[0] === 'pray' ? '+' : '♪', px, py + 0.5);
      c.globalAlpha = 1;
    }
    const p = Field.p, blink = Math.floor(Date.now() / 300) % 2;
    c.fillStyle = blink ? '#ffffff' : '#ff5a4a'; c.fillRect(ox + p.x * cell - 1, oy + p.y * cell - 1, cell + 2, cell + 2);
    c.font = 'bold 16px ui-monospace, Menlo, Consolas, monospace'; c.fillStyle = '#e8c14a'; c.textAlign = 'left'; c.textBaseline = 'top';
    c.fillText(nameOf(m.id), 4, 2);
    c.textAlign = 'right'; c.fillStyle = '#9cc4ff'; c.fillText(Math.round(100 * seen / Math.max(1, m.w * m.h)) + '% explored', W - 4, 2);
  };
  // Lay the known places out by the direction of the exits between them.
  function layout() {
    const ids = known(); if (ids.indexOf(Field.map.id) < 0) ids.push(Field.map.id);
    const pos = {}, q = [Field.map.id]; pos[Field.map.id] = [0, 0];
    const links = [], stubs = [];
    while (q.length) {
      const a = q.shift(), def = G.D.maps[a], h = def.rows.length, w = def.rows[0].length;
      for (const [ch, d] of thingsOf(def)) {
        if (d.type !== 'warp' || !d.to || !G.D.maps[d.to]) continue;
        const at = where(def, ch) || [w / 2, h / 2];
        let vx = (at[0] + 0.5) / w - 0.5, vy = (at[1] + 0.5) / h - 0.5;
        const edge = at[0] <= 1 || at[1] <= 1 || at[0] >= w - 2 || at[1] >= h - 2, len = Math.hypot(vx, vy) || 1;
        vx /= len; vy /= len; if (!edge) { vx *= 0.45; vy = vy * 0.45 + 0.35; }
        if (ids.indexOf(d.to) < 0) { if (ids.indexOf(a) >= 0 && edge) stubs.push([a, vx, vy]); continue; }
        if (!links.some(l => (l[0] === a && l[1] === d.to) || (l[0] === d.to && l[1] === a))) links.push([a, d.to]);
        if (!pos[d.to]) { pos[d.to] = [pos[a][0] + vx * (edge ? 1.6 : 0.8), pos[a][1] + vy * (edge ? 1.6 : 0.8)]; q.push(d.to); }
      }
    }
    for (const id of ids) if (!pos[id]) pos[id] = [3 + Math.random(), 3 + Math.random()];   // somewhere the roads do not reach yet
    const list = Object.keys(pos);
    for (let it = 0; it < 80; it++) for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = pos[list[i]], b = pos[list[j]], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 0.01;
      if (d < 1.05) { const k = (1.05 - d) / 2 / d; a[0] -= dx * k; a[1] -= dy * k * 1.6; b[0] += dx * k; b[1] += dy * k * 1.6; }
    }
    return { pos, links, stubs, list };
  }
  Menu.drawRegion = function (cv) {
    const c = cv.getContext('2d'), L = layout();
    c.fillStyle = '#0d1022'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(156,196,255,.06)'; c.fillRect((i * 97) % W, (i * 53) % H, 2, 2); }
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const id of L.list) { const p = L.pos[id]; x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    const sc = Math.min((W - 130) / Math.max(1, x1 - x0), (H - 60) / Math.max(1, y1 - y0), 90);
    const at = id => [W / 2 + (L.pos[id][0] - (x0 + x1) / 2) * sc, H / 2 + 8 + (L.pos[id][1] - (y0 + y1) / 2) * sc];
    c.strokeStyle = '#c8a56a'; c.lineWidth = 3;
    for (const [a, b] of L.links) { const p = at(a), q = at(b); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); }
    c.setLineDash([5, 5]); c.strokeStyle = '#9cc4ff'; c.lineWidth = 2;
    for (const [a, vx, vy] of L.stubs) { const p = at(a); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[0] + vx * 44, p[1] + vy * 44); c.stroke(); c.fillStyle = '#9cc4ff'; c.font = 'bold 15px monospace'; c.textAlign = 'center'; c.fillText('?', p[0] + vx * 54, p[1] + vy * 54 + 5); }
    c.setLineDash([]);
    for (const id of L.list) {
      const p = at(id), here = id === Field.map.id, name = nameOf(id);
      c.font = (here ? 'bold ' : '') + '14px ui-monospace, Menlo, Consolas, monospace';
      const w = Math.min(150, c.measureText(name).width + 10);
      c.fillStyle = here ? '#4a3a10' : '#1b2148'; c.fillRect(p[0] - w / 2, p[1] - 10, w, 20);
      c.strokeStyle = here ? '#ffd24a' : '#5a6294'; c.lineWidth = here ? 2 : 1; c.strokeRect(p[0] - w / 2 + 0.5, p[1] - 9.5, w - 1, 19);
      c.fillStyle = here ? '#ffd24a' : '#f4f1e6'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(name.length > 18 ? name.slice(0, 17) + '…' : name, p[0], p[1] + 1);
      const pl = Field.places().filter(q => q.found && q.d.map === id);           // a dot per prayer place or venue: bright if ready
      pl.forEach((q, i) => { c.globalAlpha = q.used ? 0.4 : 1; c.fillStyle = q.kind === 'pray' ? '#ffe07a' : '#f08aa6'; c.beginPath(); c.arc(p[0] + w / 2 + 6 + i * 9, p[1], 3.5, 0, 7); c.fill(); c.globalAlpha = 1; });
    }
    c.font = 'bold 16px ui-monospace, Menlo, Consolas, monospace'; c.fillStyle = '#e8c14a'; c.textAlign = 'left'; c.textBaseline = 'top';
    c.fillText('Places found: ' + L.list.length, 4, 2);
  };
  // Fast travel: from a town or the open road (not underground, not mid-fight, not in the opening brawl), to any
  // town already found. Returns why it is not allowed, or null.
  // A town counts as found once visited, or if its chapter is behind you (older saves never stored visits).
  Menu.found = id => !!G.flag('visited.' + id) || (G.flag('chapter') || 1) > G.D.towns[id].ch;
  Menu.travelBlock = function () {
    const d = Field.map.def, here = G.S.map;
    if (G.tutorial && G.tutorial()) return 'Not yet. Finish the brawl first.';
    if (d.dark || d.travel === false) return 'You cannot travel from down here. Find your way back to daylight.';
    const ids = Object.keys(G.D.towns || {}).filter(id => Menu.found(id) && id !== here);
    if (!ids.length) return 'You have not found another town yet.';
    return null;
  };
  Menu.travel = async function (id) {
    const t = G.D.towns[id];
    G.audio.sfx('select');
    await Field.enter(id, t.at);
    UI.toast('You travel the roads to ' + t.name + '.');
  };
  Menu.map = async function () {
    let view = 0, timer = null;
    const show = v => {
      Menu.pane('<canvas class="mapcv" width="' + W + '" height="' + H + '"></canvas>');
      const cv = Menu.paneEl.querySelector('canvas'); (v === 0 ? Menu.drawArea : Menu.drawRegion)(cv);
      clearInterval(timer); if (v === 0) timer = setInterval(() => { if (cv.isConnected) Menu.drawArea(cv); else clearInterval(timer); }, 300);
      Menu.desc(v === 0 ? 'Gold squares: exits (??? = new). + Maren prays here, ♪ Finch plays here; faded until you rest.' : 'Places found and the roads between (dashed: new). Gold dots: shrines; rose: stages; faded until you rest.');
    };
    for (;;) {
      show(view);
      const why = Menu.travelBlock();
      const pick = await UI.menu({ style: Menu.NAV, start: view, items: [{ label: 'Area', value: 0 }, { label: 'Region', value: 1 }, { label: 'Travel', value: 3, disabled: !!why }, { label: 'Back', value: 2 }],
        onMove: it => { if (it.value < 2) show(it.value); else if (it.value === 3) Menu.desc(why || 'Walk the roads to any town you have already found.'); } });
      if (pick == null || pick === 2) { clearInterval(timer); return; }
      if (pick === 3) {
        const here = G.S.map, ids = Object.keys(G.D.towns).filter(id => Menu.found(id) && id !== here);
        const to = await UI.menu({ style: Menu.NAV, items: ids.map(id => ({ label: G.D.towns[id].name, value: id, right: 'Ch ' + G.D.towns[id].ch })).concat([{ label: 'Back', value: null }]),
          onMove: it => Menu.desc(it.value ? G.D.towns[it.value].desc : '') });
        if (to) { clearInterval(timer); return to; }
        continue;
      }
      view = pick;
    }
  };
})();
