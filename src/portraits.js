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
  // The mood of a line, for the speaker's expression: happy, angry, worried, sad, or null (their usual face).
  // Word lists and punctuation, weighed; a line has to lean clearly one way to change the face.
  const MOODS = {
    happy: /\b(i like (it|that)( very much)?|ha! ha|glad|good news|wonderful|splendid|marvellous|lovely|laugh\w*|cheers|hooray|huzzah|welcome back|delight\w*|excellent|perfect|at last|we did it|we won|victory|well done|beautiful|brilliant|proud of|best day|grin\w*)\b/i,
    angry: /\b(curse\w*|you fools?|how dare|get out|liar|coward\w*|hate|filth|scum|wretch\w*|swine|vermin|you'll pay|pay for this|out of my way|back off|i'll break|never forgive|enough of|damn\w*)\b/i,
    worried: /\b(careful|hush|afraid|fear\w*|danger\w*|trap\w*|i don'?t like|uneasy|worr\w*|watch out|look out|what was that|did you hear|too quiet|nervous|something is wrong|something's wrong|not right|stay close)\b/i,
    sad: /\b(sorry|died|grief|griev\w*|miss (him|her|them|you)|mourn\w*|tears|all alone|left me alone|forgive me|too late|never came back|farewell|wept|weep\w*|lonely|regret\w*|i failed|my fault|lost (him|her|them|everything))\b/i
  };
  // phrases that look like a mood and are not one (wry, polite, or negated)
  const NOT = /\b(not alone|never alone|not proud|forgive me if|sorry to say|old fool|can'?t miss|not sorry|is not sorry|not too late)\b/gi;
  UI.mood = function (text) {
    if (!text) return null; const t = String(text).replace(NOT, ' '), sc = {};
    for (const m in MOODS) sc[m] = (t.match(new RegExp(MOODS[m].source, 'gi')) || []).length * 2;
    const bang = (t.match(/!/g) || []).length;
    if (bang) { if (sc.angry) sc.angry += bang; else if (sc.happy) sc.happy += bang; }
    if (/\?/.test(t) && sc.worried) sc.worried += 1;
    if (/\.\.\.|…/.test(t)) { if (sc.sad) sc.sad += 1; else if (sc.worried) sc.worried += 1; }
    if (/\b(ha(ha)+|hah|heh)\b/i.test(t)) sc.happy += 3;
    let best = null, bs = 1;
    for (const m in sc) if (sc[m] > bs || (sc[m] === bs && best && false)) { best = m; bs = sc[m]; }
    const second = Math.max(...Object.keys(sc).filter(m => m !== best).map(m => sc[m]));
    return best && bs >= 2 && bs > second ? best : null;
  };
  UI.portraitOf = function (who, mood) {
    if (!who || G.opts.portraits === false || !B.faceURL) return null;
    if (!map) build();
    const s = map[who]; if (!s) return null;
    try { return B.faceURL(s, HEROES[who] ? 0 : 2, G.opts.expressions === false ? null : mood); } catch (e) { return null; }
  };
})();
