(function () {
  const St = {};
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h || w; return c; };
  let sd = 7; const rr = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
  const base = (id, N, o, bg) => { o = o || {}; const cv = mk(N), c = cv.getContext('2d'); if (bg) { c.fillStyle = bg; c.fillRect(0, 0, N, N); } c.save(); const z = o.zoom || [0, 0, 100]; c.scale(N / z[2], N / z[2]); c.translate(-z[0], -z[1]); const rec = Bust.paint(c, N / z[2], id, o); c.restore(); rec.z = z; return { cv, rec }; };
  const zt = (c, z, N) => { c.scale(N / z[2], N / z[2]); c.translate(-z[0], -z[1]); };
  const px = cv => cv.getContext('2d').getImageData(0, 0, cv.width, cv.height);

  // ink or lead the recorded shapes in paint order: each later filled shape wipes the ink it covers
  function inkLayer(b, N, pick) { const L = mk(N), c = L.getContext('2d'); zt(c, b.rec.z, N); c.lineJoin = 'round'; c.lineCap = 'round';
    for (const r of b.rec) { const closed = r.role !== 'line' && r.role !== 'eyeline'; if (closed && r.col) { c.save(); c.globalCompositeOperation = 'destination-out'; c.fill(r.p); c.restore(); }
      const st = pick(r); if (st) { c.strokeStyle = st[1]; c.lineWidth = st[0]; c.stroke(r.p); } }
    return L; }
  function figMask(b, N, roles) { const m = mk(N), c = m.getContext('2d'); zt(c, b.rec.z, N); c.fillStyle = '#000'; for (const r of b.rec) if (r.col && (!roles || roles.includes(r.role))) c.fill(r.p); return m; }
  /* ---------------- oil on canvas ---------------- */
  St.oil = function (id, N, extra) {
    const g = mk(N), c = g.getContext('2d');
    let gr = c.createRadialGradient(N * 0.32, N * 0.3, 0, N * 0.45, N * 0.45, N * 0.85); gr.addColorStop(0, '#5a4630'); gr.addColorStop(0.45, '#2e2216'); gr.addColorStop(1, '#0e0a06'); c.fillStyle = gr; c.fillRect(0, 0, N, N);
    const sp = extra && extra.spec, tall = id === 'finch' || (sp && (sp.hat || sp.horns || sp.crown || (sp.hs === 'mohawk'))); const ex = Object.assign({}, extra || {}); if (!ex.zoom) delete ex.zoom; const b = base(id, N, Object.assign({ zoom: tall ? [10, 1, 84] : [12, 6, 82] }, ex));
    c.drawImage(b.cv, 0, 0);
    // chiaroscuro: the far side falls into shadow, a warm key from the upper left
    c.save(); c.globalCompositeOperation = 'multiply'; gr = c.createLinearGradient(N * 0.25, N * 0.2, N * 0.85, N * 0.75); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, '#eee0cc'); gr.addColorStop(1, '#7a6250'); c.fillStyle = gr; c.fillRect(0, 0, N, N);
    gr = c.createLinearGradient(0, N * 0.7, 0, N); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#b8a290'); c.fillStyle = gr; c.fillRect(0, 0, N, N); c.restore();
    if (id === 'maren') { c.save(); c.globalCompositeOperation = 'screen'; gr = c.createRadialGradient(N * 0.2, N * 0.8, 0, N * 0.2, N * 0.8, N * 0.5); gr.addColorStop(0, 'rgba(255,190,90,.55)'); gr.addColorStop(1, 'rgba(255,150,50,0)'); c.fillStyle = gr; c.fillRect(0, 0, N, N); c.restore(); }
    // brushwork: strokes that sample the painting beneath and follow its form; the face keeps fine strokes, cloth and ground get loose ones
    const src = px(g), d = src.data, face = mk(N), fc = face.getContext('2d'); zt(fc, b.rec.z, N); fc.fillStyle = '#fff'; for (const r of b.rec) if (r.role === 'skin' || r.role === 'eye' || r.role === 'feature' || r.role === 'lip') fc.fill(r.p); const fm = px(face).data;
    const at = (x, y) => { x = Math.max(0, Math.min(N - 1, x | 0)); y = Math.max(0, Math.min(N - 1, y | 0)); const i = (y * N + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
    const lum = (x, y) => { const p = at(x, y); return p[0] * 0.3 + p[1] * 0.59 + p[2] * 0.11; };
    for (const [n, size, onFace] of [[5200, 0.03, false], [9000, 0.016, false], [6000, 0.008, true]]) for (let i = 0; i < n; i++) {
      const x = rr() * N, y = rr() * N, inF = fm[((y | 0) * N + (x | 0)) * 4 + 3] > 0; if (inF !== onFace) continue;
      const gx = lum(x + 2, y) - lum(x - 2, y), gy = lum(x, y + 2) - lum(x, y - 2), a = Math.atan2(gy, gx) + Math.PI / 2 + (rr() - 0.5) * 0.4, L = N * size * (0.6 + rr()), p = at(x, y);
      c.strokeStyle = 'rgba(' + p[0] + ',' + p[1] + ',' + p[2] + ',' + (onFace ? 0.35 : 0.75) + ')'; c.lineWidth = L * (onFace ? 0.35 : 0.32); c.lineCap = 'round';
      c.beginPath(); c.moveTo(x - Math.cos(a) * L / 2, y - Math.sin(a) * L / 2); c.quadraticCurveTo(x + Math.cos(a + 1.57) * L * 0.08, y + Math.sin(a + 1.57) * L * 0.08, x + Math.cos(a) * L / 2, y + Math.sin(a) * L / 2); c.stroke();
      if (!onFace && rr() < 0.3) { c.strokeStyle = 'rgba(255,240,215,.12)'; c.lineWidth = L * 0.06; c.stroke(); }
    }
    if (id === 'maren') { lantern(c, N, b.rec.z); }
    // glazes kept the face soft; put back the crisp features through a soft mask
    const sharp = mk(N), sc = sharp.getContext('2d'); sc.drawImage(g, 0, 0); // placeholder for order
    c.save(); c.globalAlpha = 0.55; c.filter = 'blur(' + N * 0.0012 + 'px)'; const fmask = mk(N), mc = fmask.getContext('2d'); mc.drawImage(b.cv, 0, 0); mc.globalCompositeOperation = 'destination-in'; mc.filter = 'blur(' + N * 0.01 + 'px)'; mc.drawImage(face, 0, 0); c.globalCompositeOperation = 'multiply'; c.restore();
    c.save(); c.globalAlpha = 0.6; c.drawImage(fmask, 0, 0); c.restore();
    // a varnish: amber glaze and a soft warm bloom in the lights
    c.save(); c.globalCompositeOperation = 'soft-light'; c.fillStyle = 'rgba(200,140,60,.45)'; c.fillRect(0, 0, N, N); c.restore();
    // the weave of the canvas and a fine craquelure
    const t = mk(N), tc = t.getContext('2d'); const im = tc.createImageData(N, N); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const v = 128 + 26 * Math.sin(x * 1.9) * Math.sin(y * 1.9 + Math.sin(x * 0.11)) + (rr() - 0.5) * 30, i = (y * N + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } tc.putImageData(im, 0, 0);
    c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = 0.22; c.drawImage(t, 0, 0); c.restore();
    c.save(); c.strokeStyle = 'rgba(20,10,4,.08)'; c.lineWidth = Math.max(0.5, N * 0.0008); for (let k = 0; k < 90; k++) { let x = rr() * N, y = rr() * N; c.beginPath(); c.moveTo(x, y); for (let j = 0; j < 4; j++) { x += (rr() - 0.5) * N * 0.025; y += (rr() - 0.5) * N * 0.025; c.lineTo(x, y); } c.stroke(); } c.restore();
    // a vignette
    c.save(); gr = c.createRadialGradient(N * 0.45, N * 0.42, N * 0.3, N * 0.5, N * 0.5, N * 0.75); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(10,5,0,.55)'); c.fillStyle = gr; c.fillRect(0, 0, N, N); c.restore();
    return extra && extra.noFrame ? g : frame(g, 'gilt');
  };
  function lantern(c, N, z) { c.save(); zt(c, z, N); c.translate(4, -4);
    let g = c.createRadialGradient(18, 82, 0, 18, 82, 20); g.addColorStop(0, 'rgba(255,220,140,.9)'); g.addColorStop(0.3, 'rgba(255,170,70,.35)'); g.addColorStop(1, 'rgba(255,140,40,0)'); c.fillStyle = g; c.fillRect(0, 60, 40, 40);
    c.fillStyle = '#3a2a18'; c.fillRect(11, 72, 14, 2); c.fillRect(11, 92, 14, 2.4); c.beginPath(); c.moveTo(13, 72); c.lineTo(18, 66); c.lineTo(23, 72); c.fill(); c.strokeStyle = '#3a2a18'; c.lineWidth = 0.8; c.beginPath(); c.arc(18, 64.4, 2.4, Math.PI, 0); c.stroke();
    g = c.createRadialGradient(18, 83, 0, 18, 83, 7); g.addColorStop(0, '#fffbe0'); g.addColorStop(0.4, '#ffd070'); g.addColorStop(1, '#c86a1a'); c.fillStyle = g; c.fillRect(12, 74, 12, 18);
    c.fillStyle = '#3a2a18'; for (const x of [11.4, 17.4, 23.4]) c.fillRect(x, 74, 1.2, 18); c.restore(); }

  /* ---------------- floating head ---------------- */
  St.head = function (id, N) {
    const g = mk(N), c = g.getContext('2d');
    let gr = c.createRadialGradient(N * 0.5, N * 0.45, 0, N * 0.5, N * 0.5, N * 0.75); gr.addColorStop(0, '#16203a'); gr.addColorStop(0.6, '#070a16'); gr.addColorStop(1, '#020208'); c.fillStyle = gr; c.fillRect(0, 0, N, N);
    for (let i = 0; i < 260; i++) { const x = rr() * N, y = rr() * N, r = rr() * rr() * N * 0.003 + 0.4; c.fillStyle = 'rgba(' + (200 + rr() * 55 | 0) + ',' + (210 + rr() * 45 | 0) + ',255,' + (0.2 + rr() * 0.6) + ')'; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
    c.save(); c.globalCompositeOperation = 'screen'; for (const [x, y, r, col] of [[0.2, 0.3, 0.3, 'rgba(60,90,200,.18)'], [0.8, 0.75, 0.35, 'rgba(120,40,160,.14)']]) { gr = c.createRadialGradient(N * x, N * y, 0, N * x, N * y, N * r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, N, N); } c.restore();
    const b = base(id, N, { light: 'void', body: false, zoom: [10, -2, 84] }), hc = b.cv.getContext('2d');
    // the neck dissolves into the void
    hc.save(); hc.globalCompositeOperation = 'destination-out'; gr = hc.createLinearGradient(0, N * 0.79, 0, N * 0.92); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); hc.fillStyle = gr; hc.fillRect(0, 0, N, N); hc.restore();
    // cool key: lift contrast, cool the shadows, a lit-from-within glow
    const head = mk(N), h2 = head.getContext('2d'); h2.drawImage(b.cv, 0, 0);
    h2.save(); h2.globalCompositeOperation = 'source-atop'; gr = h2.createLinearGradient(N * 0.3, 0, N * 0.72, 0); gr.addColorStop(0, 'rgba(255,240,225,.10)'); gr.addColorStop(0.6, 'rgba(40,40,90,.0)'); gr.addColorStop(1, 'rgba(30,40,110,.5)'); h2.fillStyle = gr; h2.fillRect(0, 0, N, N); h2.restore();
    h2.save(); h2.globalCompositeOperation = 'multiply'; gr = h2.createLinearGradient(N * 0.3, N * 0.25, N * 0.75, N * 0.85); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.45, '#e4e0ea'); gr.addColorStop(1, '#4a4a78'); h2.fillStyle = gr; h2.fillRect(0, 0, N, N); h2.restore();
    h2.save(); h2.globalCompositeOperation = 'destination-in'; h2.drawImage(b.cv, 0, 0); h2.restore();
    // reflection on a glassy floor
    const ty = N * 0.9; c.save(); c.translate(0, ty * 2 - N * 0.04); c.scale(1, -1); c.globalAlpha = 0.18; c.filter = 'blur(' + N * 0.004 + 'px)'; c.drawImage(head, 0, 0); c.restore();
    c.save(); gr = c.createLinearGradient(0, ty, 0, N); gr.addColorStop(0, 'rgba(2,2,8,0)'); gr.addColorStop(1, 'rgba(2,2,8,1)'); c.fillStyle = gr; c.fillRect(0, ty, N, N - ty); c.restore();
    c.save(); c.strokeStyle = 'rgba(127,214,255,.25)'; c.lineWidth = N * 0.002; c.beginPath(); c.ellipse(N * 0.5, ty, N * 0.3, N * 0.02, 0, 0, 6.283); c.stroke(); c.restore();
    // a halo of light behind, then the head, then a soft bloom
    c.save(); c.globalCompositeOperation = 'screen'; gr = c.createRadialGradient(N * 0.5, N * 0.42, N * 0.1, N * 0.5, N * 0.42, N * 0.42); gr.addColorStop(0, 'rgba(90,170,255,.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, N, N); c.restore();
    c.save(); c.filter = 'blur(' + N * 0.01 + 'px)'; c.globalAlpha = 0.22; c.globalCompositeOperation = 'screen'; c.drawImage(head, 0, 0); c.restore();
    c.save(); c.shadowColor = 'rgba(127,214,255,.6)'; c.shadowBlur = N * 0.02; c.drawImage(head, 0, 0); c.restore();
    // faint scan of a projector
    c.save(); c.globalAlpha = 0.05; c.fillStyle = '#9fe0ff'; for (let y = 0; y < N; y += 3) c.fillRect(0, y, N, 1); c.restore();
    return frame(g, 'void');
  };

  /* ---------------- pixel art ---------------- */
  St.pixel = function (id, N) {
    const M = 64, PAL = { runa: '#2c1f2a', dask: '#1c2420', maren: '#1e2238', finch: '#2a1a28' }, BG = { runa: '#7a9a8a', dask: '#8a9a6a', maren: '#8a9ac8', finch: '#c89aa8' };
    const big = base(id, 512, { zoom: [14, 6, 78] }, BG[id]).cv, sm = mk(M), c = sm.getContext('2d'); c.imageSmoothingQuality = 'high'; const half = mk(128), hc2 = half.getContext('2d'); hc2.imageSmoothingQuality = 'high'; hc2.filter = 'contrast(1.12) saturate(1.2)'; hc2.drawImage(big, 0, 0, 128, 128); c.drawImage(half, 0, 0, M, M);
    const im = c.getImageData(0, 0, M, M), d = im.data;
    // a palette of sixteen colours for this hero by k-means, then every pixel snaps to it
    let cs = []; for (let i = 0; i < 16; i++) { const k = ((rr() * M * M) | 0) * 4; cs.push([d[k], d[k + 1], d[k + 2]]); }
    const asg = new Int32Array(M * M);
    for (let it = 0; it < 12; it++) { const sum = cs.map(() => [0, 0, 0, 0]); for (let i = 0; i < M * M; i++) { let best = 0, bd = 1e9; for (let k = 0; k < 16; k++) { const dr = d[i * 4] - cs[k][0], dg = d[i * 4 + 1] - cs[k][1], db = d[i * 4 + 2] - cs[k][2], dd = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11; if (dd < bd) { bd = dd; best = k; } } asg[i] = best; const s = sum[best]; s[0] += d[i * 4]; s[1] += d[i * 4 + 1]; s[2] += d[i * 4 + 2]; s[3]++; } cs = cs.map((col, k) => sum[k][3] ? [sum[k][0] / sum[k][3], sum[k][1] / sum[k][3], sum[k][2] / sum[k][3]] : [rr() * 255, rr() * 255, rr() * 255]); }
    for (let pass = 0; pass < 2; pass++) { const nx = new Int32Array(asg); for (let y = 1; y < M - 1; y++) for (let x = 1; x < M - 1; x++) { const cnt = {}; let best = asg[y * M + x], bc = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const k = asg[(y + dy) * M + x + dx]; cnt[k] = (cnt[k] || 0) + 1; if (cnt[k] > bc) { bc = cnt[k]; best = k; } } if (bc >= 5) nx[y * M + x] = best; } asg.set(nx); }
    // push the palette a little brighter and more saturated, the way a cosy farm game likes it
    cs = cs.map(([r, g, b]) => { const m = (r + g + b) / 3; return [r + (r - m) * 0.35, g + (g - m) * 0.35, b + (b - m) * 0.35].map(v => Math.max(0, Math.min(255, v * 1.06 + 4))); });
    for (let i = 0; i < M * M; i++) { const col = cs[asg[i]]; d[i * 4] = col[0]; d[i * 4 + 1] = col[1]; d[i * 4 + 2] = col[2]; }
    // an outline: one dark pixel where figure meets background
    const bgc = asg[0], ol = [...PAL[id].match(/\w\w/g)].map(h => parseInt(h, 16));
    const isBg = i => asg[i] === bgc; const out = new Uint8Array(M * M);
    for (let y = 0; y < M; y++) for (let x = 0; x < M; x++) { const i = y * M + x; if (!isBg(i)) continue; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < M && Y < M && !isBg(Y * M + X)) out[i] = 1; } }
    for (let i = 0; i < M * M; i++) if (out[i]) { d[i * 4] = ol[0]; d[i * 4 + 1] = ol[1]; d[i * 4 + 2] = ol[2]; }
    // a flat, cosy backdrop with a lighter band
    const bgv = [...BG[id].match(/\w\w/g)].map(h => parseInt(h, 16));
    for (let y = 0; y < M; y++) for (let x = 0; x < M; x++) { const i = y * M + x; if (isBg(i) && !out[i]) { const f = (y > 8 && y < 46 && ((x + y) >> 2) % 9 === 0) ? 1.1 : 1; d[i * 4] = bgv[0] * f; d[i * 4 + 1] = bgv[1] * f; d[i * 4 + 2] = bgv[2] * f; } }
    // the eyes, placed by hand: pupil, iris, one white glint
    const Hh = Bust.HEROES[id], ec = [...Hh.eye.match(/\w\w/g)].map(h => parseInt(h, 16)), put = (x, y, col) => { const i = (y * M + x) * 4; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; };
    const toP = (x, y) => [Math.round((x - 14) / 78 * M - 0.5), Math.round((y - 6) / 78 * M - 0.5)], dk = ec.map(v => Math.max(0, v - 70));
    for (const [ex0, ey0, near] of [[43.4, 40.8, 1], [58.7, 40.6, 0]]) { const [ex, ey] = toP(ex0, ey0);
      put(ex - 1, ey, [236, 228, 220]); if (near) put(ex - 2, ey, [214, 196, 186]); put(ex + 1, ey, [214, 200, 190]);
      put(ex, ey, dk); put(ex, ey + 1, ec); put(ex + 1, ey + 1, [200, 186, 176]); put(ex - 1, ey + 1, [220, 200, 190]); put(ex, ey, [24, 16, 20]); put(ex + (near ? 0 : 0), ey - 1, [40, 24, 20]);
      for (let k = -2 + (near ? 0 : 1); k <= 2; k++) put(ex + k, ey - 1, [40, 24, 20]);
      put(ex, ey, dk); put(ex - 1 + (near ? 1 : 1), ey, [24, 16, 20]); put(ex, ey, [255, 255, 255]); put(ex + 1, ey, [24, 16, 20]); put(ex + 1, ey + 1, ec); }
    c.putImageData(im, 0, 0);
    const g = mk(N), gc = g.getContext('2d'); gc.imageSmoothingEnabled = false; gc.drawImage(sm, 0, 0, N, N);
    return frame(g, 'pixel');
  };

  /* ---------------- ink and watercolour ---------------- */
  St.water = function (id, N) {
    const g = mk(N), c = g.getContext('2d');
    const paper = mk(N), pc = paper.getContext('2d'), im = pc.createImageData(N, N); for (let i = 0; i < N * N; i++) { const v = 238 + (rr() - 0.5) * 26; im.data[i * 4] = v; im.data[i * 4 + 1] = v - 4; im.data[i * 4 + 2] = v - 14; im.data[i * 4 + 3] = 255; } pc.putImageData(im, 0, 0);
    c.filter = 'blur(0.7px)'; c.drawImage(paper, 0, 0); c.filter = 'none';
    const b = base(id, N, { zoom: [10, 6, 84] }), fig = figMask(b, N);
    // a loose wash behind the figure, kept off it
    const bgw = mk(N), bc = bgw.getContext('2d'), col = { runa: [110, 170, 150], dask: [150, 175, 110], maren: [130, 160, 220], finch: [230, 160, 160] }[id];
    for (let i = 0; i < 7; i++) { const x = N * (0.25 + rr() * 0.5), y = N * (0.2 + rr() * 0.5), gr = bc.createRadialGradient(x, y, 0, x, y, N * (0.22 + rr() * 0.2)); gr.addColorStop(0, 'rgba(' + col + ',.45)'); gr.addColorStop(0.8, 'rgba(' + col + ',.2)'); gr.addColorStop(1, 'rgba(' + col + ',0)'); bc.fillStyle = gr; bc.fillRect(0, 0, N, N); }
    bc.globalCompositeOperation = 'destination-out'; bc.filter = 'blur(' + N * 0.004 + 'px)'; bc.drawImage(fig, 0, 0);
    c.save(); c.globalCompositeOperation = 'multiply'; c.drawImage(bgw, 0, 0); c.restore();
    // the figure as transparent washes: lightened, value-flattened, edges pooling darker
    const w = mk(N), wc = w.getContext('2d'); wc.filter = 'blur(' + N * 0.0025 + 'px) saturate(1.2) contrast(0.8) brightness(1.22)'; wc.drawImage(b.cv, 0, 0);
    c.save(); c.globalCompositeOperation = 'multiply'; c.drawImage(w, 0, 0); c.restore();
    const edge = inkLayer(b, N, r => r.col && r.role !== 'eye' && r.role !== 'line' && r.role !== 'eyeline' ? [0.9, shade(r.col, -0.3, 0.35)] : null);
    c.save(); c.globalCompositeOperation = 'multiply'; c.filter = 'blur(' + N * 0.0025 + 'px)'; c.drawImage(edge, 0, 0); c.restore();
    // blooms where a wet wash dried
    c.save(); c.globalCompositeOperation = 'multiply'; for (let i = 0; i < 12; i++) { const x = N * (0.15 + rr() * 0.7), y = N * (0.6 + rr() * 0.35), r = N * (0.015 + rr() * 0.03); c.strokeStyle = 'rgba(120,80,60,.12)'; c.lineWidth = N * 0.003; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.stroke(); } c.restore();
    // sepia ink: firm outlines, finer feature lines, nothing that a later shape hides
    const ink = inkLayer(b, N, r => r.role === 'eye' || r.role === 'paint' || r.role === 'neck' ? null : r.role === 'feature' ? [0.3, 'rgba(58,34,22,.9)'] : r.role === 'line' ? [0.26, 'rgba(58,34,22,.75)'] : r.role === 'eyeline' ? null : r.role === 'lip' ? [0.18, 'rgba(110,50,40,.6)'] : [0.34, 'rgba(58,34,22,.85)']);
    c.drawImage(ink, 0, 0);
    // a little hatching down the shadow side of the face
    c.save(); zt(c, b.rec.z, N); c.strokeStyle = 'rgba(70,40,26,.35)'; c.lineWidth = 0.13; const hd = b.rec.filter(r => r.role === 'skin')[0];
    if (hd) { c.save(); c.clip(hd.p); for (let x = 60; x < 70; x += 0.9) { c.beginPath(); c.moveTo(x + 2.4, 44); c.lineTo(x - 1.6, 68); c.stroke(); } c.restore(); }
    c.restore();
    doodle(c, id, N);
    return frame(g, 'paper');
  };
  function shade(h, k, a) { const n = parseInt(h.slice(1), 16), f = v => Math.round(v * (1 + k)); return 'rgba(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ',' + a + ')'; }
  function doodle(c, id, N) { const s = N / 100; c.save(); c.scale(s, s); c.translate(84, 10); c.strokeStyle = 'rgba(58,34,22,.8)'; c.fillStyle = 'rgba(58,34,22,.1)'; c.lineWidth = 0.35; c.lineCap = 'round';
    const p = d => { c.beginPath(); d(); c.stroke(); };
    if (id === 'runa') { p(() => c.ellipse(0, 2, 3, 2.4, 0, 0, 6.283)); for (const [x, y] of [[-3, -2], [-1, -3.6], [1.4, -3.6], [3.4, -2]]) p(() => c.ellipse(x, y, 1, 1.3, 0, 0, 6.283)); }
    if (id === 'dask') { p(() => { c.moveTo(-1, 5); c.lineTo(-1, -6); c.lineTo(0, -8); c.lineTo(1, -6); c.lineTo(1, 5); }); p(() => { c.moveTo(-3, 5); c.lineTo(3, 5); }); p(() => { c.moveTo(0, 5); c.lineTo(0, 8); }); }
    if (id === 'maren') { p(() => { c.rect(-2.4, -3, 4.8, 7); }); p(() => { c.moveTo(-3, -3); c.lineTo(0, -6); c.lineTo(3, -3); }); p(() => c.arc(0, -6.6, 1.2, Math.PI, 0)); c.fillStyle = 'rgba(240,180,60,.5)'; c.beginPath(); c.ellipse(0, 0.5, 1.3, 2, 0, 0, 6.283); c.fill(); }
    if (id === 'finch') { p(() => c.ellipse(0, 3, 3.4, 4, 0, 0, 6.283)); p(() => c.arc(0, 3, 1, 0, 6.283)); p(() => { c.moveTo(0, -1); c.lineTo(0.6, -8); }); p(() => { c.moveTo(-0.4, -8); c.lineTo(1.8, -8.6); }); }
    c.restore(); }

  /* ---------------- stained glass ---------------- */
  St.glass = function (id, N, ex) {
    const g = mk(N), c = g.getContext('2d'), s = N / 100, panel = ex && ex.panel;
    const arch = new Path2D(); if (panel) arch.rect(0, 0, 100, 100); else { arch.moveTo(8, 100); arch.lineTo(8, 34); arch.arc(50, 34, 42, Math.PI, 0); arch.lineTo(92, 100); arch.closePath(); }
    c.fillStyle = '#1a1612'; c.fillRect(0, 0, N, N);
    c.save(); c.scale(s, s); c.clip(arch);
    // background panes: deep blue with ruby and gold borders, cut into cells
    const PAL = { runa: ['#1e4a8a', '#2a5aa0', '#16386e'], dask: ['#1e5a3a', '#2a7048', '#164628'], maren: ['#1e3a8a', '#2a4ea8', '#142c6e'], finch: ['#5a1e6a', '#702a84', '#441656'] }[id];
    const cells = []; for (let i = 0; i < 70; i++) cells.push([rr() * 100, rr() * 100]);
    const cellPaths = voronoi(cells);
    cellPaths.forEach((p, i) => { const col = PAL[i % 3]; const gr = c.createRadialGradient(cells[i][0] - 2, cells[i][1] - 2, 0, cells[i][0], cells[i][1], 14); gr.addColorStop(0, shade(col, 0.5, 1)); gr.addColorStop(1, col); c.fillStyle = gr; c.fill(p); });
    // a halo or lamp of gold behind the head
    const halo = new Path2D(); halo.arc(50, 40, 26, 0, 6.283); let gr = c.createRadialGradient(50, 40, 6, 50, 40, 26); gr.addColorStop(0, '#fff3b0'); gr.addColorStop(0.6, '#f0c040'); gr.addColorStop(1, '#c08010'); c.fillStyle = gr; c.fill(halo);
    c.restore();
    // the figure: cloth and hair as saturated glass, the face painted in grisaille on pale glass
    const b = base(id, N, { zoom: (ex && ex.zoom) || [4, 2, 96] });
    const glassFig = mk(N), fc = glassFig.getContext('2d'); zt(fc, b.rec.z, N);
    for (const r of b.rec) { if (!r.col) continue; const isSkin = r.role === 'skin' || r.role === 'neck', col = isSkin ? '#f4e2c4' : sat(r.col);
      if (r.role === 'eye' || r.role === 'line' || r.role === 'feature' || r.role === 'lip' || r.role === 'paint') continue;
      const gx = fc.createLinearGradient(30, 20, 70, 90); gx.addColorStop(0, shade(col, 0.35, 1)); gx.addColorStop(0.6, col); gx.addColorStop(1, shade(col, -0.3, 1)); fc.fillStyle = gx; fc.fill(r.p); }
    // grisaille: the painted modelling, desaturated and laid onto the glass with multiply
    const gri = mk(N), gc = gri.getContext('2d'); gc.filter = 'grayscale(1) sepia(0.6) contrast(1.7) brightness(0.92)'; gc.drawImage(b.cv, 0, 0);
    gc.globalCompositeOperation = 'destination-in'; gc.filter = 'none'; zt(gc, b.rec.z, N); gc.fillStyle = '#000'; for (const r of b.rec) if (r.role === 'skin' || r.role === 'neck' || r.role === 'eye' || r.role === 'feature' || r.role === 'lip') gc.fill(r.p);
    fc.setTransform(1, 0, 0, 1, 0, 0); fc.globalCompositeOperation = 'multiply'; fc.drawImage(gri, 0, 0);
    // matte paint on the coloured glass: the folds and hair locks come through as dark trace
    const tr = mk(N), tc = tr.getContext('2d'); tc.filter = 'grayscale(1) contrast(1.6) brightness(1.15)'; tc.drawImage(b.cv, 0, 0); fc.globalAlpha = 0.55; fc.drawImage(tr, 0, 0); fc.globalAlpha = 1; fc.globalCompositeOperation = 'source-over';
    c.save(); c.scale(s, s); c.clip(arch); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(glassFig, 0, 0); c.restore();
    // leads: thick cames around every piece of the figure, and between background panes only where the figure isn't
    const figM = figMask(b, N, ['cloth', 'hair', 'hat', 'skin', 'neck', 'trim']);
    const bgL = mk(N), bl = bgL.getContext('2d'); bl.scale(s, s); bl.lineJoin = 'round';
    const lead = (ctx, p, w) => { ctx.strokeStyle = '#141210'; ctx.lineWidth = w; ctx.stroke(p); ctx.strokeStyle = 'rgba(170,160,150,.35)'; ctx.lineWidth = w * 0.22; ctx.stroke(p); };
    cellPaths.forEach(p => lead(bl, p, 0.9)); lead(bl, halo, 1.2); for (const a of [-2.9, -2.3, -1.57, -0.85, -0.25, 0.4, 2.7]) { const sp = new Path2D(); sp.moveTo(50 + Math.cos(a) * 26, 40 + Math.sin(a) * 26); sp.lineTo(50 + Math.cos(a) * 34, 40 + Math.sin(a) * 34); lead(bl, sp, 0.9); }
    bl.setTransform(1, 0, 0, 1, 0, 0); bl.globalCompositeOperation = 'destination-out'; bl.drawImage(figM, 0, 0);
    const fl = inkLayer(b, N, r => r.role === 'cloth' || r.role === 'hair' || r.role === 'hat' || r.role === 'trim' ? [1.3, '#141210'] : r.role === 'skin' ? [1.1, '#141210'] : r.role === 'feature' ? [0.35, 'rgba(30,20,16,.85)'] : r.role === 'line' ? [0.3, 'rgba(30,20,16,.7)'] : null);
    const cuts = mk(N), cc = cuts.getContext('2d'); zt(cc, b.rec.z, N); for (let i = 0; i < 12; i++) { const sp = new Path2D(), x = 4 + rr() * 92, y = 74 + rr() * 22; sp.moveTo(x, y); sp.lineTo(x + (rr() - 0.5) * 24, y + 8 + rr() * 12); lead(cc, sp, 1); } cc.setTransform(1, 0, 0, 1, 0, 0); cc.globalCompositeOperation = 'destination-in'; cc.drawImage(figMask(b, N, ['cloth']), 0, 0);
    c.save(); c.scale(s, s); c.clip(arch); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(bgL, 0, 0); c.drawImage(cuts, 0, 0); c.drawImage(fl, 0, 0); c.scale(s, s); if (!panel) lead(c, arch, 2.6); c.restore();
    // light through the glass
    c.save(); c.globalCompositeOperation = 'screen'; gr = c.createRadialGradient(N * 0.35, N * 0.25, 0, N * 0.35, N * 0.25, N * 0.7); gr.addColorStop(0, 'rgba(255,245,220,.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, N, N); c.restore();
    return panel ? g : frame(g, 'stone');
  };
  function sat(h) { const n = parseInt(h.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const m = (r + g + b) / 3; [r, g, b] = [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(m + (v - m) * 1.7)))); return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join(''); }
  function voronoi(pts) { // each cell as the polygon of a 100 x 100 square cut by the bisectors with every other point
    return pts.map((p, i) => { let poly = [[0, 0], [100, 0], [100, 100], [0, 100]];
      for (let j = 0; j < pts.length; j++) { if (j === i) continue; const q = pts[j], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, nx = q[0] - p[0], ny = q[1] - p[1], side = v => (v[0] - mx) * nx + (v[1] - my) * ny, out = [];
        for (let k = 0; k < poly.length; k++) { const A = poly[k], B = poly[(k + 1) % poly.length], sa = side(A), sb = side(B); if (sa <= 0) out.push(A); if (sa * sb < 0) { const t = sa / (sa - sb); out.push([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t]); } } poly = out; if (!poly.length) break; }
      const path = new Path2D(); poly.forEach((v, k) => k ? path.lineTo(v[0], v[1]) : path.moveTo(v[0], v[1])); path.closePath(); return path; });
  }

  /* ---------------- frames ---------------- */
  function frame(art, kind) {
    const N = art.width, F = Math.round(N * 0.06), out = mk(N + F * 2), c = out.getContext('2d'), W = N + F * 2;
    if (kind === 'gilt') { let g = c.createLinearGradient(0, 0, W, W); g.addColorStop(0, '#f6d77e'); g.addColorStop(0.3, '#a8761e'); g.addColorStop(0.55, '#f0c860'); g.addColorStop(0.8, '#7a5010'); g.addColorStop(1, '#e8c060'); c.fillStyle = g; c.fillRect(0, 0, W, W);
      for (let k = 0; k < 4; k++) { c.strokeStyle = k % 2 ? 'rgba(80,50,10,.6)' : 'rgba(255,240,190,.5)'; c.lineWidth = F * 0.08; c.strokeRect(F * (0.15 + k * 0.2), F * (0.15 + k * 0.2), W - F * (0.3 + k * 0.4), W - F * (0.3 + k * 0.4)); }
      for (let i = 0; i < 60; i++) { const t = i / 60; for (const [x, y] of [[t * W, F * 0.5], [t * W, W - F * 0.5], [F * 0.5, t * W], [W - F * 0.5, t * W]]) { c.fillStyle = 'rgba(255,240,180,.45)'; c.beginPath(); c.arc(x, y, F * 0.1, 0, 6.283); c.fill(); } } }
    else if (kind === 'void') { c.fillStyle = '#05060c'; c.fillRect(0, 0, W, W); c.strokeStyle = 'rgba(127,214,255,.45)'; c.lineWidth = 2; c.strokeRect(F * 0.6, F * 0.6, W - F * 1.2, W - F * 1.2); }
    else if (kind === 'pixel') { c.fillStyle = '#5a3a22'; c.fillRect(0, 0, W, W); c.fillStyle = '#8a5a32'; c.fillRect(F * 0.25, F * 0.25, W - F * 0.5, W - F * 0.5); c.fillStyle = '#c88a4a'; c.fillRect(F * 0.45, F * 0.45, W - F * 0.9, W - F * 0.9); c.fillStyle = '#3a2416'; c.fillRect(F * 0.8, F * 0.8, W - F * 1.6, W - F * 1.6); }
    else if (kind === 'paper') { c.fillStyle = '#efe6d2'; c.fillRect(0, 0, W, W); c.strokeStyle = 'rgba(58,34,22,.6)'; c.lineWidth = 1.5; c.strokeRect(F * 0.7, F * 0.7, W - F * 1.4, W - F * 1.4); }
    else if (kind === 'stone') { c.fillStyle = '#6a645a'; c.fillRect(0, 0, W, W); for (let i = 0; i < 2000; i++) { c.fillStyle = 'rgba(' + (rr() > 0.5 ? '255,250,240' : '0,0,0') + ',.06)'; c.fillRect(rr() * W, rr() * W, 2, 2); } }
    c.drawImage(art, F, F); return out;
  }
  window.Styles = St;
})();
