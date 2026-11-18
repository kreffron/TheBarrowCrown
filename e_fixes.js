/* Small repairs: a warp or well that dropped you onto something solid now steps you out onto open ground. */
(function () {
  const D = G.D, DV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const targets = new Set();
  const scan = x => { if (Array.isArray(x)) { if (x[0] === 'warp' && typeof x[1] === 'string') targets.add(x[1] + '|' + x[2]); x.forEach(scan); } else if (x && typeof x === 'object') Object.values(x).forEach(scan); };
  for (const m of Object.values(D.maps)) for (const t of Object.values(m.things || {})) { if (t.type === 'warp') targets.add(t.to + '|' + t.at); scan(t.script); }
  Object.values(D.scripts).forEach(scan);
  for (const k of targets) {
    const [mid, ch] = k.split('|'), m = D.maps[mid]; if (!m || !m.things[ch]) continue;
    const t = m.things[ch]; if (t.type !== 'warp' && t.type !== 'obj') continue;
    const L = Object.assign({}, D.legend, m.legend || {});
    const pos = []; m.rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === ch) pos.push([x, y]); });
    if (!pos.length) continue;
    const [x, y] = pos[Math.floor((pos.length - 1) / 2)];
    const open = (xx, yy) => { const c = (m.rows[yy] || '')[xx]; if (c === undefined) return false; if (c === '.' || c === ',') return true; if (m.things[c]) return ['warp', 'mark', 'trigger', 'pickup'].includes(m.things[c].type); const tl = D.tiles[L[c]]; return !!tl && !tl.solid; };
    const d = t.out && DV[t.out];
    if (d && open(x + d[0], y + d[1])) continue;
    const ok = ['down', 'up', 'left', 'right'].find(o => open(x + DV[o][0], y + DV[o][1]));
    if (ok) t.out = ok;
  }
})();
