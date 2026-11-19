/* UI: DOM windows drawn over the canvas. Everything returns a promise, so game
   logic reads top to bottom:  const i = await UI.choice(...). Sizes are in rem,
   and 1rem is one logical pixel of the 320x240 screen. */
const UI = G.ui = {};
UI.el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
UI.esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
UI.pushModal = m => { G.modals.push(m); };
UI.popModal = m => { const i = G.modals.indexOf(m); if (i >= 0) G.modals.splice(i, 1); };
UI.init = function () {
  UI.root = document.getElementById('ui');
  UI.toasts = UI.el('div', 'toasts'); UI.root.appendChild(UI.toasts);
  UI.fader = document.getElementById('fade');
};

/* ---------- list menu ----------
   o: { items:[{label, right, value, disabled, desc}], title, style, cls, cols, cancel, start, onMove, keep } */
UI.menu = function (o) {
  if (G.autoPick) return Promise.resolve(G.autoPick(o));     // test hook
  return new Promise(resolve => {
    const box = UI.el('div', 'win menu ' + (o.cls || ''));
    if (o.style) box.style.cssText = o.style;
    if (o.title) box.appendChild(UI.el('div', 'mtitle', UI.esc(o.title)));
    const list = UI.el('div', 'mlist'); box.appendChild(list);
    const cols = o.cols || 1;
    if (cols > 1) { list.classList.add('grid'); list.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)'; }
    const n = o.items.length;
    let idx = G.clamp(o.start || 0, 0, Math.max(0, n - 1));
    while (o.items[idx] && o.items[idx].head && idx < n - 1) idx++;
    if (!n) list.appendChild(UI.el('div', 'mi dis', '(nothing)'));
    const rows = o.items.map((it, i) => {
      if (it.head) { const h = UI.el('div', 'mhead', UI.esc(it.label)); list.appendChild(h); return h; }
      const r = UI.el('div', 'mi' + (it.disabled ? ' dis' : ''),
        '<span class="ml">' + UI.esc(it.label) + '</span>' + (it.right != null ? '<span class="mr">' + UI.esc(it.right) + '</span>' : ''));
      r.addEventListener('mouseenter', () => set(i));
      r.addEventListener('click', e => { e.stopPropagation(); G.audio.unlock(); set(i); choose(); });
      list.appendChild(r); return r;
    });
    function set(i) {
      idx = i; rows.forEach((r, j) => r.classList.toggle('sel', j === idx));
      if (rows[idx] && rows[idx].scrollIntoView) rows[idx].scrollIntoView({ block: 'nearest' });
      if (o.onMove && o.items[idx]) o.onMove(o.items[idx], idx);
    }
    function done(v) { UI.popModal(m); if (!o.keep) box.remove(); resolve(v); }
    function choose() {
      const it = o.items[idx]; if (!it) return;
      if (it.disabled) { G.audio.sfx('error'); return; }
      G.audio.sfx('select'); done(it.value !== undefined ? it.value : idx);
    }
    function move(d) {
      if (!n) return; let j = idx;
      for (let t = 0; t < n; t++) { j = (j + d + n * 8) % n; if (!o.items[j].head) break; }
      set(j); G.audio.sfx('move');
    }
    const m = {
      el: box,
      press(b) {
        if (b === 'up') move(-cols); else if (b === 'down') move(cols);
        else if (b === 'left') { if (cols > 1) move(-1); } else if (b === 'right') { if (cols > 1) move(1); }
        else if (b === 'a') choose();
        else if (b === 'b' && o.cancel !== false) { G.audio.sfx('cancel'); done(null); }
        else { const j = o.items.findIndex(it => it.hot === b); if (j >= 0) { set(j); choose(); } }   // a key bound straight to an entry
      }
    };
    UI.root.appendChild(box); UI.pushModal(m);
    if (n) set(idx);
  });
};

/* ---------- dialogue ---------- */
UI.dlg = null;
UI.showDlg = function (who) {
  if (!UI.dlg) {
    const d = UI.el('div', 'win dlg');
    d.innerHTML = '<div class="dport"><img></div><div class="dname"></div><div class="dtext"></div><div class="dmore">▼</div>';
    UI.root.appendChild(d); UI.dlg = d;
    d.addEventListener('click', () => { G.audio.unlock(); G.press('a'); });
  }
  const nm = UI.dlg.querySelector('.dname');
  if (who) { nm.textContent = who; nm.style.display = ''; nm.style.color = (G.D.speakers && G.D.speakers[who]) || '#9cc4ff'; }
  else nm.style.display = 'none';
  UI.dlg.classList.toggle('narr', !who);
  const url = UI.portraitOf && UI.portraitOf(who), pt = UI.dlg.querySelector('.dport');   // the speaker's face, when there is one
  UI.dlg.classList.toggle('port', !!url);
  if (url) { pt.querySelector('img').src = url; pt.style.borderColor = (G.D.speakers && G.D.speakers[who]) || '#9cc4ff'; }
  return UI.dlg;
};
UI.hideDlg = function () { if (UI.dlg) { UI.dlg.remove(); UI.dlg = null; } };
// Splits text into pages that fit the box, measured in the live element.
UI.paginate = function (box, text) {
  const words = String(text).split(' '), pages = [];
  let cur = '';
  for (const w of words) {
    const tryT = cur ? cur + ' ' + w : w;
    box.textContent = tryT;
    if (box.scrollHeight > box.clientHeight + 1 && cur) { pages.push(cur); cur = w; } else cur = tryT;
  }
  if (cur) pages.push(cur);
  box.textContent = '';
  return pages;
};
UI.type = function (box, page, more) {
  return new Promise(resolve => {
    if (G.fast) { box.textContent = page; resolve(); return; }
    let i = 0, finished = false, last = 0;
    const speed = G.opts.textFast ? 6 : 2;
    more.style.visibility = 'hidden';
    const m = {
      press(b) {
        if (b !== 'a' && b !== 'b') return;
        if (!finished) { i = page.length; box.textContent = page; fin(); }
        else { UI.popModal(m); resolve(); }
      },
      skip() { finished = true; box.textContent = page; UI.popModal(m); resolve(); }
    };
    function fin() { finished = true; more.style.visibility = 'visible'; }
    function tick(t) {
      if (finished) return;
      if (t - last > 22) {
        last = t; i = Math.min(page.length, i + speed); box.textContent = page.slice(0, i);
        if (i % 6 < speed) G.audio.sfx('text');
        if (i >= page.length) { fin(); return; }
      }
      requestAnimationFrame(tick);
    }
    UI.pushModal(m); requestAnimationFrame(tick);
  });
};
// The dialogue log: the last 80 lines said or narrated, and choices made, kept in the save (Journal > Recent conversations).
UI.logLine = function (who, text, kind) {
  if (!G.S || !text) return;
  const log = G.S.dlog = G.S.dlog || [];
  log.push([who || '', String(text), (Field.map && Field.map.def && Field.map.def.name) || '', kind || '']);
  if (log.length > 80) log.splice(0, log.length - 80);
};
UI.say = async function (who, text, keep) {
  UI.logLine(who, text);
  if (who && G.S && G.S.flags) G.S.flags['met.' + who] = 1;                    // for Journal -> Biographies
  const d = UI.showDlg(who), box = d.querySelector('.dtext'), more = d.querySelector('.dmore');
  const pages = UI.paginate(box, text);
  for (const p of pages) await UI.type(box, p, more);
  if (!keep) UI.hideDlg();
};
UI.choice = async function (who, text, labels) {
  UI.logLine(who, text);
  if (who && G.S && G.S.flags) G.S.flags['met.' + who] = 1;
  const d = UI.showDlg(who), box = d.querySelector('.dtext'), more = d.querySelector('.dmore');
  if (G.fast) box.textContent = text; else { box.textContent = text; }
  more.style.visibility = 'hidden';
  const r = await UI.menu({ items: labels.map((l, i) => ({ label: l, value: i })), cls: 'choice', cancel: false });
  if (r != null && labels[r] != null) UI.logLine('', labels[r], 'pick');
  UI.hideDlg();
  return r;
};

/* ---------- small things ---------- */
// Barks: the party talking among themselves while you explore. Shown one at a time, low on the screen, without stopping play.
UI.barkQ = [];
UI.bark = function (lines) { if (G.fast) return; UI.barkQ.push(...lines); if (!UI.barkT) UI.barkT = setTimeout(UI.nextBark, 900); };
UI.nextBark = function () {
  UI.barkT = null;
  if (!UI.barkQ.length) return;
  if (G.busy || G.cine || G.modals.length || G.scene !== 'field') { UI.barkT = setTimeout(UI.nextBark, 600); return; }
  const [who, text] = UI.barkQ.shift(), col = (G.D.speakers || {})[who] || '#f4f1e6';
  const el = UI.el('div', 'bark', '<b style="color:' + col + '">' + UI.esc(who) + '</b> ' + UI.esc(text));
  UI.root.appendChild(el);
  const ms = 2200 + text.length * 45;
  setTimeout(() => el.classList.add('out'), ms); setTimeout(() => el.remove(), ms + 450);
  UI.barkT = setTimeout(UI.nextBark, ms + 350);
};
UI.toast = function (text) {
  if (G.fast) return;
  const t = UI.el('div', 'toast', UI.esc(text));
  UI.toasts.appendChild(t);
  setTimeout(() => t.classList.add('out'), 2300);
  setTimeout(() => t.remove(), 2800);
};
UI.fade = async function (out, ms) {
  ms = ms == null ? 260 : ms;
  UI.fader.style.transition = 'opacity ' + (G.fast ? 0 : ms) + 'ms linear';
  UI.fader.style.opacity = out ? '1' : '0';
  await G.sleep(ms + 20);
};
UI.waitKey = function () {
  return new Promise(resolve => {
    if (G.fast) { resolve(); return; }
    // Z/Enter or X, or a click or tap anywhere (armed a moment later, so the click that got us here does not count)
    let done = false, armed = false;
    const finish = () => { if (done) return; done = true; document.removeEventListener('pointerdown', tap, true); UI.popModal(m); resolve(); };
    const tap = e => { if (armed && !(e.target.closest && e.target.closest('[data-btn], button'))) finish(); };
    const m = { press(b) { if (b === 'a' || b === 'b') finish(); }, skip() { finish(); } };
    UI.pushModal(m); document.addEventListener('pointerdown', tap, true); setTimeout(() => { armed = true; }, 150);
  });
};
// Full-screen title card (chapter openings and endings).
UI.card = async function (title, text, lines) {
  const body = lines ? '<div class="clines">' + lines.map(l => '<div>' + UI.esc(l) + '</div>').join('') + '</div>' : '<div class="ctext">' + UI.esc(text || '') + '</div>';
  const ch = typeof Scenes !== 'undefined' && !lines && Scenes.chapterOf(title);
  const c = UI.el('div', 'card' + (lines && lines.length > 11 ? ' dense' : '') + (ch ? ' chapter' : ''), '<div class="ctitle">' + UI.esc(title) + '</div>' + (ch ? '<div class="corn">✦</div>' : '') + body + '<div class="chint">' + G.keyText('Press {a}') + '</div>');
  UI.root.appendChild(c);
  if (ch) Scenes.mount(c, ch);                         // a chapter opens on its own painted scene
  c.addEventListener('click', () => G.press('a'));
  await G.sleep(350); await UI.waitKey(); c.remove();
};
// The visible d20 roll for skill checks. Returns true on success.
UI.rollCheck = async function (name, skill, bonus, dc) {
  const d = G.d20(), total = d + bonus, pass = d === 20 || (d !== 1 && total >= dc);
  if (G.fast) return pass;
  const w = UI.el('div', 'win dice', '<div class="dhead">' + UI.esc(name) + ' — ' + UI.esc(skill) + ' check</div><div class="dnum">?</div><div class="dres">DC ' + dc + '</div><div class="dhint">' + G.keyText('Press {a} or tap to go on') + '</div>');
  UI.root.appendChild(w);
  const num = w.querySelector('.dnum'), res = w.querySelector('.dres');
  G.audio.sfx('roll');
  for (let i = 0; i < 9; i++) { num.textContent = G.ri(1, 20); await G.sleep(55); }
  num.textContent = d; num.classList.add(pass ? 'ok' : 'no');
  res.innerHTML = d + ' + ' + bonus + ' = <b>' + total + '</b> vs DC ' + dc + ' — ' + (pass ? 'Success' : 'Failure');
  G.audio.sfx(pass ? 'good' : 'bad');
  await G.sleep(250); await UI.waitKey(); w.remove();
  return pass;
};
UI.bar = (v, max, cls) => '<span class="bar ' + cls + '"><i style="width:' + Math.round(100 * G.clamp(v / Math.max(1, max), 0, 1)) + '%"></i></span>';

/* ---------- cutscene letterbox and the tutorial hint ---------- */
UI.letterbox = function (on, label) {
  if (!UI.lb) { UI.lb = UI.el('div', 'lbox', '<i class="t"></i><i class="b"></i><span class="skip"></span>'); UI.root.appendChild(UI.lb); }
  UI.lb.classList.toggle('on', !!on);
  const s = UI.lb.querySelector('.skip');
  s.textContent = on ? G.keyText(label || '{b}: skip scene') : '';
  s.classList.toggle('armed', !!label);
};
UI.hint = function (text) {
  if (!text) { if (UI.hintEl) UI.hintEl.remove(); UI.hintEl = null; return; }
  if (!UI.hintEl) { UI.hintEl = UI.el('div', 'hintbox'); UI.root.appendChild(UI.hintEl); }
  UI.hintEl.textContent = G.keyText(text);
};
