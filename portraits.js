/* Portraits in the dialogue box: the speaker's head and shoulders, cut from their battle figure, in a frame at the
   left of the box. The four heroes always have one; other speakers get one when the game can tell which figure is
   theirs (a person whose own script they speak first in, or whose figure shares their name). Narration has none. */
(function () {
  let map = null;
  const HEROES = { Runa: 'runa', Dask: 'dask', Maren: 'maren', Finch: 'finch' };
  function build() {
    map = Object.assign({}, HEROES);
    const votes = {}, vote = (name, sprite, w) => { const v = votes[name] || (votes[name] = {}); v[sprite] = (v[sprite] || 0) + w; };
    const firstSay = (s) => { if (!Array.isArray(s)) return null; if (s[0] === 'say' && typeof s[1] === 'string' && !HEROES[s[1]]) return s[1]; for (const x of s) { const r = firstSay(x); if (r) return r; } return null; };
    for (const id in G.D.maps) for (const k in (G.D.maps[id].things || {})) {
      const d = G.D.maps[id].things[k]; if (d.type !== 'npc' || !d.sprite || !d.script) continue;
      const nm = firstSay(d.script); if (nm) vote(nm, d.sprite, 1);
    }
    // first, names that are a figure's own name ('Veyra', 'Warden Hask'); titles never count ('Captain', 'Sister')
    const sprites = G.D.sprites || {}, names = Object.keys(Object.assign({}, votes, G.D.speakers)), claimed = new Set(Object.values(HEROES));
    const TITLES = /^(the|captain|sister|brother|mother|father|warden|old|high|lord|lady|duke|clan|city|young|elder|pilgrim|carter|pedlar|sergeant|watch|knight|skald|rime|harbourmaster|widow|inquisitor|mistress|master|long|grey|hooded|sulky|messenger|herald|noble|prisoner|debtor|healer|sutler|quartermaster|fisherman|urchin|collector|heckler|recruit)$/;
    for (const name of names) {
      if (map[name]) continue;
      const whole = name.toLowerCase().replace(/[^a-z]/g, ''), key = sprites[whole] ? whole : name.toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(w => w && !TITLES.test(w)).find(w => sprites[w]);
      if (key) { map[name] = key; claimed.add(key); }
    }
    // then the figure whose script a name speaks first in, if no one else has that figure
    for (const name of names) {
      if (map[name] || !votes[name]) continue;
      const v = votes[name], best = Object.keys(v).filter(s => !claimed.has(s)).sort((a, b) => v[b] - v[a])[0];
      if (best && (v[best] >= 2 || Object.keys(v).length === 1)) map[name] = best;
    }
  }
  UI.portraitMap = () => { if (!map) build(); return map; };
  UI.portraitOf = function (who) {
    if (!who || G.opts.portraits === false || !B.faceURL) return null;
    if (!map) build();
    const s = map[who]; if (!s) return null;
    try { return B.faceURL(s, HEROES[who] ? 0 : 2); } catch (e) { return null; }
  };
})();
