/* Journal -> Biographies: the heroes and the people met along the way (data: ch9_world/t_bios.js). The list shows
   who you have met, grouped (the party, friends, those in between, the dead, foes); the pane beside it shows a face and the opening
   lines; pick one to read it all in the scrolling reader. A • marks a biography with lines you have not read yet. */
(function () {
  // a condition as G.cond reads it, plus '|' for "either": a secret can come out more than one way
  const cond = c => !c || String(c).split('|').some(t => G.cond(t));
  Menu.bioCond = cond;
  const pick = v => Array.isArray(v) ? ((v.find(([c]) => cond(c)) || v[v.length - 1])[1]) : v;
  Menu.bioVisible = e => !(e.hide && cond(e.hide)) && (e.always || (e.meet || []).some(n => G.flag('met.' + n)) || (!!e.seen && cond(e.seen)));
  Menu.bioParas = e => e.paras.filter(([c]) => cond(c)).map(p => p[1]);
  Menu.bioNew = e => Menu.bioParas(e).length > G.flag('bio.' + e.id);
  Menu.bioFace = e => {
    const s = e.sprite || (UI.portraitMap && UI.portraitMap()[(e.meet || [])[0]]);
    if (!s || !B.faceURL) return '';
    try { return B.faceURL(s, ['runa', 'dask', 'maren', 'finch'].includes(s) ? 0 : 2); } catch (err) { return ''; }
  };
  Menu.bioCount = () => (G.D.bios || []).filter(Menu.bioVisible).length;
  const head = (e, big) => { const f = Menu.bioFace(e);
    return '<div class="biohead' + (big ? ' big' : '') + '">' + (f ? '<img src="' + f + '">' : '') + '<div><div class="sumhead">' + UI.esc(pick(e.name)) + '</div><div class="dim">' + UI.esc(pick(e.title) || '') + '</div></div></div>'; };
  Menu.bios = async function () {
    const list = (G.D.bios || []).filter(Menu.bioVisible), items = []; let last = null;
    for (const e of list) { if (e.group !== last) { items.push({ head: true, label: e.group }); last = e.group; } items.push({ label: pick(e.name), right: Menu.bioNew(e) ? '•' : '', value: e.id }); }
    let start = 1;
    for (;;) {
      const p = await UI.menu({ title: 'Biographies (' + list.length + ')', cls: 'journal', style: Menu.NAV + 'width:110rem;max-height:188rem;', start, items,
        onMove: it => { const e = list.find(x => x.id === it.value); if (!e) return; const ps = Menu.bioParas(e);
          Menu.pane(head(e) + '<div class="biotext">' + UI.esc(ps[0] || '') + '</div><div class="dim">' + (ps.length > 1 ? 'Press ' + UI.esc(G.keyName((G.bindings().a || [])[0])) + ' or tap to read on.' : '') + '</div>', 'journal'); Menu.desc(''); } });
      if (p == null) return;
      start = items.findIndex(it => it.value === p);
      const e = list.find(x => x.id === p), ps = Menu.bioParas(e);
      G.setFlag('bio.' + e.id, ps.length); const it = items[start]; if (it) it.right = '';
      await Menu.read('Biography', head(e, true) + ps.map(t => '<p>' + UI.esc(t) + '</p>').join(''));
    }
  };
})();
