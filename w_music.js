/* The music, composed. Every track opens with its old theme (the A section, as first written in data/rules.js) and goes
   on into new sections built here from a key, chord progressions and a seeded melody-writer: a two-bar motif, answered,
   moved onto each new chord, and brought home to the tonic at the end of every eight bars. Sections differ in what
   plays: the tune alone, the tune over a pad, a counter-line, arpeggios, a quiet stretch with no tune at all, drums
   that come and go. A track runs one to three minutes before it loops.
   Notes are written for src/audio.js: "D4:2" is D in octave 4 for two eighth notes; drums are one letter a step. */
(function () {
  const D = G.D, OLD = D.music;
  const SC = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], harm: [0, 2, 3, 5, 7, 8, 11],
    mixo: [0, 2, 4, 5, 7, 9, 10], phryg: [0, 1, 3, 5, 7, 8, 10], lydian: [0, 2, 4, 6, 7, 9, 11] };
  const PC = { C: 0, 'C#': 1, Db: 1, D: 2, Eb: 3, 'D#': 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, Ab: 8, 'G#': 8, A: 9, Bb: 10, 'A#': 10, B: 11 };
  const NM = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const name = m => NM[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const hash = s => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return h; };
  const pick = (R, a) => a[Math.floor(R() * a.length)];
  const lenOf = str => str.split(/\s+/).filter(t => t && t !== '|').reduce((n, t) => n + +(t.split(':')[1] || 1), 0);
  const rest = n => n > 0 ? '-:' + n : '';
  const join = parts => parts.filter(Boolean).join(' ');

  // A key: degree i (0 = tonic, may run past 6 or below 0) to a MIDI note, from a base octave.
  function Key(k, mode) {
    const root = PC[k], sc = SC[mode];
    const midi = (i, oct) => 12 * (oct + 1) + root + 12 * Math.floor(i / 7) + sc[((i % 7) + 7) % 7];
    const triad = d => [d, d + 2, d + 4];                          // chord on scale degree d (0-based)
    return { midi, triad };
  }
  const RHY = {
    calm: [[4, 4], [6, 2], [2, 2, 4], [3, 1, 4], [8], [2, 6], [4, 2, 2]],
    mid: [[2, 2, 2, 2], [3, 1, 2, 2], [2, 2, 4], [1, 1, 2, 4], [2, 1, 1, 4], [4, 2, 2], [3, 1, 4]],
    busy: [[1, 1, 1, 1, 2, 2], [2, 1, 1, 2, 2], [1, 1, 2, 1, 1, 2], [2, 2, 1, 1, 2], [1, 1, 1, 1, 4], [2, 1, 1, 1, 1, 2]]
  };
  const nearTone = (tones, cur, lo, hi) => { let best = null; for (let o = -21; o <= 21; o += 7) for (const t of tones) { const v = t + o; if (v < lo || v > hi) continue; if (best == null || Math.abs(v - cur) < Math.abs(best - cur) || (Math.abs(v - cur) === Math.abs(best - cur) && v > best)) best = v; } return best == null ? cur : best; };

  // One bar of tune over a chord: [{i, len}], starting near `cur`.
  function bar(R, K, chord, cur, feel, lo, hi, rhythm) {
    const rh = rhythm || pick(R, RHY[feel]), tones = K.triad(chord), out = []; let dir = R() < 0.5 ? 1 : -1;
    rh.forEach((len, n) => {
      if (n === 0 || len >= 4) cur = nearTone(tones, cur + (n === 0 ? 0 : dir), lo, hi);
      else { const step = R() < 0.68 ? 1 : 2; let nx = cur + dir * step; if (nx < lo || nx > hi || R() < 0.22) { dir = -dir; nx = cur + dir * step; } cur = Math.max(lo, Math.min(hi, nx)); }
      out.push({ i: cur, len });
    });
    return out;
  }
  const shiftTo = (notes, K, chord, lo, hi) => { const t = nearTone(K.triad(chord), notes[0].i, lo, hi), d = t - notes[0].i; return notes.map(n => ({ i: Math.max(lo, Math.min(hi, n.i + d)), len: n.len })); };
  // A whole tune for a run of bars (one chord degree a bar): motif, answer, motif moved, cadence; every 8 bars home.
  function tune(R, K, chords, feel, lo, hi) {
    const out = []; let cur = Math.round((lo + hi) / 2), motif = null;
    for (let b = 0; b < chords.length; b++) {
      const ph = b % 8, ch = chords[b], last = b === chords.length - 1 || ph === 7;
      let notes;
      if (last) {                                                  // the cadence: home to the tonic, held
        const rh = pick(R, [[2, 2, 4], [4, 4], [3, 1, 4], [6, 2]]), fin = nearTone([0], cur, lo, hi);
        notes = rh.map((len, n) => ({ i: n === rh.length - 1 ? fin : Math.max(lo, Math.min(hi, fin + (rh.length - 1 - n))), len }));
      } else if (ph === 3) {                                       // half-way: rest on a long chord tone
        notes = bar(R, K, ch, cur, 'calm', lo, hi, pick(R, [[4, 4], [2, 6], [6, 2]]));
      } else if (motif && (ph === 2 || ph === 4 || ph === 5)) notes = shiftTo(motif[ph === 5 ? 1 : 0], K, ch, lo, hi);
      else notes = bar(R, K, ch, cur, feel, lo, hi);
      if (ph === 0) motif = [notes, null]; else if (ph === 1 && motif) motif[1] = notes;
      notes = notes.filter(n => n.len > 0);
      const sum = notes.reduce((a, n) => a + n.len, 0); if (sum < 8) notes.push({ i: null, len: 8 - sum });
      out.push(...notes); cur = notes.filter(n => n.i != null).slice(-1)[0].i;
    }
    return out;
  }
  const toStr = (notes, K, oct) => notes.map(n => (n.i == null ? '-' : name(K.midi(n.i, oct))) + ':' + n.len).join(' ');

  // The parts that go under a tune, a bar at a time.
  const PART = {
    bass: (K, chords, style) => chords.map((d, b) => {
      const r = name(K.midi(d, 2)), f = name(K.midi(d + 4, 2)), o = name(K.midi(d + 7, 2));
      if (style === 'pulse') return [r, r, r, r].map(n => n + ':2').join(' ');
      if (style === 'walk') return [r + ':2', f + ':2', o + ':2', f + ':2'].join(' ');
      if (style === 'gallop') return Array(8).fill(r + ':1').join(' ');
      if (style === 'drone') return name(K.midi(0, 2)) + ':8';
      if (style === 'half') return r + ':4 ' + f + ':4';
      return r + ':8';
    }).join(' '),
    arp: (K, chords, style, oct) => chords.map(d => {
      const P = { up: [0, 2, 4, 7, 4, 2, 0, 2], broken: [0, 4, 2, 4, 0, 4, 2, 4], rise: [0, 2, 4, 7, 9, 7, 4, 2], drip: [7, null, 4, null, 9, null, 2, null], slow: [0, null, 4, null, 7, null, 4, null] }[style || 'up'];
      return P.map(k => k == null ? '-:1' : name(K.midi(d + k, oct)) + ':1').join(' ');
    }).join(' '),
    pad: (K, chords, which, oct) => {                              // one voice of the chord, held for as long as it lasts
      const out = []; let b = 0;
      while (b < chords.length) { let n = 1; while (b + n < chords.length && chords[b + n] === chords[b]) n++; out.push(name(K.midi(chords[b] + which * 2, oct)) + ':' + 8 * n); b += n; }
      return out.join(' ');
    },
    counter: (K, chords, oct) => chords.map(d => name(K.midi(d + 2, oct)) + ':4 ' + name(K.midi(d + 4, oct)) + ':4').join(' '),
    drums: (chords, style) => chords.map((d, b) => {
      const end = b === chords.length - 1;
      const P = { tribal: 'k.t.ktt.', stomp: 'K..SK.KS', soft: 'h...h...', folk: 'k.h.s.h.', march: 'k...s...', drive: 'K.hSK.hS', battle: 'KhSKKhSh', boss: 'KKSKKKSK', tom: 't.......', toms: 't...t.t.', timp: 't.......', epic: 'K.t.S.tt', jig: 'k.hk.hs.', none: '........' }[style];
      const F = { timp: 't.t.tttt', epic: 'KtKtSSSS', tribal: 'ktktttt.', stomp: 'KSKSSSSS', drive: 'K.SSs.ss', battle: 'KSSKSSss', boss: 'KSKSssss', folk: 'k.s.ssss', march: 'k.s.s.ss', jig: 'k.hk.sss' }[style];
      return end && F ? F : P;
    }).join('')
  };

  // A track: the old theme as section A, then the new sections, in the order of `form`.
  function track(id, spec) {
    const old = OLD[id], R = rng(hash(id)), K = Key(spec.key, spec.mode), bpm = spec.bpm || (old && old.bpm) || 90;
    const slots = {}, sec = {};
    const add = (sid, slot, str, len) => { (sec[sid] = sec[sid] || {})[slot] = str; sec[sid].len = len; slots[slot] = slots[slot] || spec.inst[slot] || {}; };
    if (old) {                                                    // section A: the old voices, as they were
      const len = Math.max(...old.voices.filter(v => v.notes).map(v => lenOf(v.notes)));
      old.voices.forEach((v, n) => {
        if (v.hat) { add('A', 'oldhat', Array(len).fill(0).map((x, i) => i % v.hat ? '.' : 'h').join(''), len); slots.oldhat = { drum: 1, vol: v.vol * 1.6 }; return; }
        const s = v.notes, l = lenOf(s); add('A', 'old' + n, l < len ? join([s, rest(len - l)]) : s, len);
        slots['old' + n] = Object.assign({ type: v.type || 'square', vol: v.vol || 0.1 }, n === 0 ? spec.oldLead || {} : {});
      });
      if (spec.aPad) {                                            // a soft chord under the old theme: each bar, the scale's own triad on the bass note
        const bassV = old.voices.find((v, n) => n > 0 && v.notes), toks = bassV.notes.split(/\s+/).filter(t => t && t !== '|');
        const roots = []; let t = 0;
        for (const tk of toks) { const [p, l] = tk.split(':'); for (let k = 0; k < +(l || 1); k++, t++) if (t % 8 === 0) roots.push(p === '-' ? roots[roots.length - 1] : /^([A-G][#b]?)/.exec(p)[1]); }
        const degs = roots.map(r => { const pc = ((PC[r] - PC[spec.key]) % 12 + 12) % 12, d = SC[spec.mode].indexOf(pc); return d < 0 ? 0 : d; });
        [0, 1, 2].forEach(w => add('A', 'pad' + w, PART.pad(K, degs, w, 3), len));
      }
    }
    for (const [sid, S] of Object.entries(spec.sections)) {
      if (S.lead) S.bars = lenOf(S.lead) / 8;
      const chords = []; S.prog.forEach(d => { for (let i = 0; i < (S.per || 1); i++) chords.push(d - 1); });
      while (chords.length < S.bars) chords.push(...chords.slice(0, Math.min(chords.length, S.bars - chords.length)));
      const len = S.bars * 8;
      if (S.lead) add(sid, 'lead', S.lead, len);
      else if (S.tune !== false) add(sid, 'lead', toStr(tune(R, K, chords, S.feel || spec.feel || 'mid', S.lo != null ? S.lo : 0, S.hi != null ? S.hi : 9), K, S.oct || spec.oct || 4), len);
      if (S.bass !== false) add(sid, 'bass', PART.bass(K, chords, S.bass || spec.bass || 'root'), len);
      if (S.arp) add(sid, 'arp', PART.arp(K, chords, S.arp, S.arpOct || 4), len);
      if (S.pad) [0, 1, 2].forEach(w => add(sid, 'pad' + w, PART.pad(K, chords, w, S.padOct || 3), len));
      if (S.counter) add(sid, 'counter', PART.counter(K, chords, S.counterOct || 3), len);
      if (S.drums) add(sid, 'drums', PART.drums(chords, S.drums), len);
    }
    // stitch: every slot runs through every section of the form, resting where it has nothing to play
    const voices = Object.keys(slots).map(slot => {
      const inst = slots[slot];
      if (inst.drum || slot === 'drums') return Object.assign({ vol: 0.06 }, inst, { drum: spec.form.map(f => (sec[f][slot] || '.'.repeat(sec[f].len))).join('') });
      return Object.assign({ type: 'triangle', vol: 0.12 }, inst, { notes: spec.form.map(f => sec[f][slot] || rest(sec[f].len)).join(' ') });
    });
    return { bpm, verb: spec.verb, voices };
  }
  // instrument sets
  const I = {
    pastoral: { lead: { type: 'square', vol: 0.05, vib: 0.006 }, bass: { type: 'triangle', vol: 0.2 }, arp: { type: 'triangle', vol: 0.06, pan: 0.3, gate: 0.6 }, pad0: { type: 'sine', vol: 0.035, attack: 0.4, release: 0.5, pan: -0.3 }, pad1: { type: 'sine', vol: 0.03, attack: 0.4, release: 0.5, pan: 0.3 }, pad2: { type: 'triangle', vol: 0.03, attack: 0.4, release: 0.5 }, counter: { type: 'triangle', vol: 0.07, pan: -0.25 }, drums: { vol: 0.045 } },
    soft: { lead: { type: 'triangle', vol: 0.15, vib: 0.008 }, bass: { type: 'sine', vol: 0.22 }, arp: { type: 'sine', vol: 0.06, pan: 0.35, gate: 0.5 }, pad0: { type: 'sine', vol: 0.04, attack: 0.8, release: 1 }, pad1: { type: 'sine', vol: 0.035, attack: 0.8, release: 1, pan: -0.3 }, pad2: { type: 'triangle', vol: 0.03, attack: 0.8, release: 1, pan: 0.3 }, counter: { type: 'sine', vol: 0.08, pan: -0.3 }, drums: { vol: 0.05 } },
    dark: { lead: { type: 'triangle', vol: 0.14, vib: 0.01, release: 0.3 }, bass: { type: 'sine', vol: 0.24 }, arp: { type: 'sine', vol: 0.05, pan: 0.4, gate: 0.4, decay: 0.2 }, pad0: { type: 'sawtooth', vol: 0.012, attack: 1.2, release: 1.2, detune: 7 }, pad1: { type: 'sine', vol: 0.04, attack: 1, release: 1, pan: -0.3 }, pad2: { type: 'triangle', vol: 0.03, attack: 1, release: 1, pan: 0.3 }, counter: { type: 'sine', vol: 0.07 }, drums: { vol: 0.06 } },
    bright: { lead: { type: 'square', vol: 0.055, detune: 6 }, bass: { type: 'triangle', vol: 0.21 }, arp: { type: 'square', vol: 0.025, pan: 0.3, gate: 0.5 }, pad0: { type: 'triangle', vol: 0.03, attack: 0.2, release: 0.3 }, pad1: { type: 'triangle', vol: 0.03, attack: 0.2, release: 0.3, pan: -0.3 }, pad2: { type: 'sine', vol: 0.03, attack: 0.2, release: 0.3, pan: 0.3 }, counter: { type: 'triangle', vol: 0.08, pan: -0.3 }, drums: { vol: 0.05 } },
    fight: { lead: { type: 'square', vol: 0.055, detune: 8 }, bass: { type: 'triangle', vol: 0.24 }, arp: { type: 'square', vol: 0.03, pan: 0.35, gate: 0.5 }, pad0: { type: 'sawtooth', vol: 0.014, attack: 0.1, release: 0.2, detune: 9 }, pad1: { type: 'triangle', vol: 0.03, pan: -0.3 }, pad2: { type: 'triangle', vol: 0.03, pan: 0.3 }, counter: { type: 'sawtooth', vol: 0.02, pan: -0.35 }, drums: { vol: 0.07 } },
    box: { lead: { type: 'sine', vol: 0.12, decay: 0.25, release: 0.4 }, bass: { type: 'triangle', vol: 0.18 }, arp: { type: 'sine', vol: 0.06, gate: 0.4, decay: 0.15, pan: 0.4 }, pad0: { type: 'sine', vol: 0.03, attack: 0.6, release: 0.8 }, pad1: { type: 'sine', vol: 0.03, attack: 0.6, release: 0.8, pan: -0.3 }, pad2: { type: 'triangle', vol: 0.025, attack: 0.6, release: 0.8, pan: 0.3 }, counter: { type: 'triangle', vol: 0.06 }, drums: { vol: 0.04 } }
  };
  const T = {};
  // ---- towns and roads ----
  T.town = track('town', { key: 'C', mode: 'major', inst: I.bright, aPad: 1, form: ['A', 'B', 'A', 'C', 'D', 'B'], sections: {
    B: { bars: 16, prog: [4, 5, 3, 6, 4, 5, 1, 1], per: 2, arp: 'broken', drums: 'folk', feel: 'mid' },
    C: { bars: 8, prog: [6, 4, 1, 5], per: 2, tune: false, arp: 'up', pad: 1, bass: 'half' },
    D: { bars: 16, prog: [1, 6, 2, 5, 1, 4, 5, 1], per: 2, counter: 1, drums: 'folk', feel: 'busy' } } });
  T.city = track('city', { key: 'C', mode: 'major', inst: I.bright, form: ['A', 'B', 'A', 'C', 'B', 'D'], sections: {
    B: { bars: 16, prog: [1, 3, 4, 5, 6, 4, 2, 5], per: 2, arp: 'up', drums: 'march', bass: 'walk', feel: 'mid' },
    C: { bars: 16, prog: [6, 3, 4, 1, 2, 5, 1, 1], per: 2, pad: 1, counter: 1, feel: 'calm', bass: 'half' },
    D: { bars: 8, prog: [4, 5, 6, 5], per: 2, tune: false, arp: 'rise', drums: 'soft', pad: 1 } } });
  T.harbor = track('harbor', { key: 'D', mode: 'minor', inst: I.pastoral, aPad: 1, form: ['A', 'B', 'A', 'C', 'D'], sections: {
    B: { bars: 16, prog: [6, 7, 3, 3, 4, 5, 1, 1], per: 2, arp: 'rise', drums: 'jig', feel: 'mid' },
    C: { bars: 8, prog: [1, 4, 6, 5], per: 2, tune: false, pad: 1, arp: 'slow', bass: 'half' },
    D: { bars: 16, prog: [4, 1, 6, 7, 4, 5, 1, 1], per: 2, counter: 1, drums: 'folk', feel: 'busy' } } });
  T.hold = track('hold', { key: 'E', mode: 'dorian', inst: I.pastoral, form: ['A', 'B', 'A', 'C', 'B'], sections: {
    B: { bars: 16, prog: [1, 4, 7, 1, 6, 7, 4, 1], per: 2, drums: 'march', bass: 'pulse', counter: 1, feel: 'mid' },
    C: { bars: 16, prog: [4, 1, 7, 4, 1, 7, 5, 1], per: 2, pad: 1, arp: 'broken', feel: 'calm' } } });
  T.field = track('field', { key: 'D', mode: 'dorian', inst: I.pastoral, form: ['A', 'B', 'A', 'C', 'D', 'B'], sections: {
    B: { bars: 16, prog: [1, 7, 4, 1, 6, 7, 5, 1], per: 2, arp: 'up', drums: 'folk', feel: 'mid' },
    C: { bars: 8, prog: [4, 5, 1, 1], per: 2, tune: false, pad: 1, arp: 'rise', bass: 'half', drums: 'soft' },
    D: { bars: 16, prog: [6, 4, 1, 5, 6, 4, 5, 1], per: 2, counter: 1, drums: 'folk', feel: 'busy', bass: 'walk' } } });
  T.fen = track('fen', { key: 'A', mode: 'minor', inst: I.soft, form: ['A', 'B', 'C', 'A', 'B'], verb: 0.3, sections: {
    B: { bars: 16, prog: [1, 6, 4, 5, 1, 7, 6, 5], per: 2, pad: 1, feel: 'calm', arp: 'drip' },
    C: { bars: 8, prog: [4, 1, 6, 5], per: 2, tune: false, pad: 1, arp: 'slow', bass: 'drone', drums: 'tom' } } });
  T.frost = track('frost', { key: 'B', mode: 'minor', inst: I.soft, form: ['A', 'B', 'A', 'C', 'B'], verb: 0.32, sections: {
    B: { bars: 16, prog: [6, 3, 7, 1, 4, 6, 5, 1], per: 2, pad: 1, arp: 'drip', feel: 'calm', oct: 4 },
    C: { bars: 16, prog: [1, 7, 6, 7], per: 2, tune: false, pad: 1, arp: 'rise', bass: 'half' } } });
  T.ashen = track('ashen', { key: 'A', mode: 'harm', inst: I.dark, form: ['A', 'B', 'A', 'C'], verb: 0.3, sections: {
    B: { bars: 16, prog: [1, 6, 4, 5, 1, 4, 5, 1], per: 2, pad: 1, feel: 'calm', drums: 'tom' },
    C: { bars: 16, prog: [6, 5, 4, 5], per: 2, tune: false, pad: 1, arp: 'slow', bass: 'drone', drums: 'toms' } } });
  // The title: an overture on the old theme. Timpani and strings, the theme on brass, a climb through the epic
  // progression (i VI III VII), the theme again an octave up over the full band, and a hush before it loops.
  I.epic = { lead: { type: 'sawtooth', vol: 0.034, detune: 7, attack: 0.06, release: 0.3, vib: 0.005 }, bass: { type: 'triangle', vol: 0.25 },
    arp: { type: 'triangle', vol: 0.05, pan: 0.35, gate: 0.6 }, counter: { type: 'square', vol: 0.022, detune: 5, attack: 0.05, release: 0.3, pan: -0.35 },
    pad0: { type: 'sawtooth', vol: 0.013, attack: 0.7, release: 1, detune: 10, pan: -0.35 }, pad1: { type: 'sawtooth', vol: 0.012, attack: 0.7, release: 1, detune: -9, pan: 0.35 },
    pad2: { type: 'triangle', vol: 0.03, attack: 0.7, release: 1 }, drums: { vol: 0.075 } };
  T.title = track('title', { key: 'A', mode: 'minor', bpm: 76, inst: I.epic, form: ['I', 'T', 'B', 'C', 'D', 'E'], verb: 0.42, sections: {
    I: { bars: 8, prog: [1, 1, 6, 6, 3, 3, 7, 7], per: 1, tune: false, pad: 1, bass: 'drone', drums: 'timp', arp: 'slow', arpOct: 3 },
    T: { lead: 'A3:4 E4:4 A4:6 G4:2 F4:4 C4:4 E4:8 D4:4 A4:4 G4:6 E4:2 E4:4 B3:4 A3:8', prog: [1, 1, 6, 6, 4, 3, 5, 1], per: 1, pad: 1, bass: 'half', drums: 'timp' },
    B: { lead: 'A4:4 E5:4 A5:6 G5:2 F5:4 C5:4 E5:6 -:2 D5:4 A5:4 G5:4 F5:2 E5:2 E5:3 D5:1 B4:4 A4:8', prog: [1, 1, 6, 6, 4, 3, 5, 1], per: 1, pad: 1, counter: 1, counterOct: 4, bass: 'pulse', drums: 'march' },
    C: { lead: 'F4:2 A4:2 C5:4 E5:4 D5:2 C5:2 D5:6 B4:2 C5:4 A4:4 F4:2 A4:2 C5:2 F5:2 E5:4 G5:4 G5:3 F5:1 E5:2 D5:2 D5:4 B4:2 D5:2', prog: [6, 3, 7, 1, 6, 3, 7, 7], per: 1, pad: 1, arp: 'rise', arpOct: 4, bass: 'pulse', drums: 'epic' },
    D: { lead: 'A4:2 C5:2 E5:4 A5:6 G5:2 F5:4 C5:2 F5:2 E5:8 D5:4 A5:4 G5:6 E5:2 D5:2 E5:2 G5:2 B5:2 A5:8', prog: [1, 1, 6, 6, 4, 3, 7, 1], per: 1, pad: 1, counter: 1, counterOct: 4, bass: 'gallop', drums: 'epic', arp: 'up', arpOct: 4 },
    E: { lead: 'A4:8 E5:8 F5:4 E5:4 C5:8 D5:4 B4:4 C5:4 B4:4 A4:8 -:8', prog: [1, 1, 6, 6, 7, 7, 1, 1], per: 1, pad: 1, bass: 'drone', drums: 'tom' } } });
  T.tavern = track('tavern', { key: 'G', mode: 'major', bpm: 116, inst: I.bright, form: ['B', 'C', 'B', 'D'], sections: {
    B: { bars: 16, prog: [1, 4, 5, 1, 1, 4, 5, 1], per: 1, drums: 'jig', bass: 'walk', feel: 'busy', arp: 'broken' },
    C: { bars: 16, prog: [6, 4, 5, 1, 6, 2, 5, 5], per: 2, counter: 1, drums: 'folk', feel: 'mid' },
    D: { bars: 8, prog: [4, 5, 1, 1], per: 2, tune: false, arp: 'up', drums: 'jig', bass: 'pulse' } } });
  // ---- under the ground ----
  T.dungeon = track('dungeon', { key: 'E', mode: 'minor', inst: I.dark, form: ['A', 'B', 'C', 'A', 'D'], verb: 0.35, sections: {
    B: { bars: 16, prog: [1, 6, 4, 5], per: 2, pad: 1, feel: 'calm', drums: 'tom' },
    C: { bars: 8, prog: [1, 2, 1, 7], per: 2, tune: false, arp: 'drip', bass: 'drone' },
    D: { bars: 16, prog: [4, 5, 1, 1, 6, 7, 1, 1], per: 2, pad: 1, counter: 1, feel: 'calm' } } });
  T.crypt = track('crypt', { key: 'D', mode: 'phryg', bpm: 66, inst: I.dark, form: ['B', 'C', 'B', 'D'], verb: 0.42, sections: {
    B: { bars: 16, prog: [1, 2, 1, 7, 6, 2, 1, 1], per: 2, pad: 1, feel: 'calm', drums: 'tom', oct: 4, lo: -2, hi: 7 },
    C: { bars: 8, prog: [1, 2, 7, 1], per: 2, tune: false, arp: 'slow', bass: 'drone', pad: 1 },
    D: { bars: 16, prog: [6, 7, 1, 2, 6, 2, 1, 1], per: 2, counter: 1, feel: 'calm', drums: 'toms' } } });
  T.cave = track('cave', { key: 'C', mode: 'minor', bpm: 80, inst: I.soft, form: ['B', 'C', 'B', 'D'], verb: 0.45, sections: {
    B: { bars: 16, prog: [1, 6, 7, 1, 4, 6, 5, 1], per: 2, arp: 'drip', arpOct: 5, feel: 'calm', bass: 'drone' },
    C: { bars: 8, prog: [6, 4, 5, 1], per: 2, tune: false, pad: 1, arp: 'drip', arpOct: 5 },
    D: { bars: 16, prog: [4, 1, 6, 7], per: 2, pad: 1, feel: 'mid', drums: 'tom' } } });
  T.throne = track('throne', { key: 'B', mode: 'harm', bpm: 70, inst: I.dark, form: ['B', 'C', 'B', 'D'], verb: 0.45, sections: {
    B: { bars: 16, prog: [1, 6, 4, 5, 1, 2, 5, 1], per: 2, pad: 1, feel: 'calm', drums: 'tom', counter: 1 },
    C: { bars: 8, prog: [1, 6, 1, 5], per: 2, tune: false, pad: 1, arp: 'slow', bass: 'drone', drums: 'toms' },
    D: { bars: 16, prog: [4, 5, 6, 5, 4, 2, 5, 1], per: 2, feel: 'mid', drums: 'march', bass: 'pulse' } } });
  T.undercroft = track('undercroft', { key: 'D', mode: 'harm', inst: I.dark, form: ['A', 'B', 'A', 'C'], verb: 0.4, sections: {
    B: { bars: 16, prog: [1, 6, 2, 5, 1, 4, 5, 1], per: 2, pad: 1, feel: 'calm', arp: 'drip', oct: 3 },
    C: { bars: 8, prog: [1, 7, 6, 5], per: 2, tune: false, pad: 1, bass: 'drone', drums: 'tom' } } });
  T.puzzle = track('puzzle', { key: 'F', mode: 'lydian', bpm: 92, inst: I.box, form: ['B', 'C', 'B', 'D', 'C'], verb: 0.3, sections: {
    B: { bars: 16, prog: [1, 2, 1, 5, 4, 2, 5, 1], per: 2, arp: 'broken', arpOct: 4, feel: 'mid', oct: 5, lo: -2, hi: 8 },
    C: { bars: 8, prog: [4, 5, 3, 6], per: 2, tune: false, arp: 'rise', arpOct: 5, pad: 1, bass: 'half' },
    D: { bars: 16, prog: [6, 2, 5, 1, 4, 3, 2, 5], per: 2, counter: 1, feel: 'calm', oct: 5, lo: -2, hi: 8, drums: 'soft' } } });
  T.omen = track('omen', { key: 'D', mode: 'minor', inst: I.dark, form: ['A', 'B', 'A', 'C'], verb: 0.5, sections: {
    B: { bars: 8, prog: [1, 6, 2, 1], per: 2, tune: false, pad: 1, bass: 'drone', arp: 'slow', arpOct: 3 },
    C: { bars: 8, prog: [6, 5, 1, 1], per: 2, pad: 1, feel: 'calm', oct: 3, drums: 'tom' } } });
  // ---- fights ----
  T.battle = track('battle', { key: 'A', mode: 'minor', inst: I.fight, form: ['A', 'B', 'A', 'C'], verb: 0.15, sections: {
    B: { bars: 16, prog: [1, 6, 7, 5, 1, 4, 5, 5], per: 2, drums: 'battle', bass: 'gallop', feel: 'busy', oct: 4, counter: 1 },
    C: { bars: 8, prog: [6, 7, 1, 5], per: 2, tune: false, arp: 'up', arpOct: 4, drums: 'drive', bass: 'gallop', pad: 1 } } });
  T.battle2 = track('battle2', { key: 'G', mode: 'dorian', bpm: 150, inst: I.fight, form: ['B', 'C', 'B', 'D'], verb: 0.15, sections: {
    B: { bars: 16, prog: [1, 7, 4, 1, 1, 7, 5, 1], per: 2, drums: 'battle', bass: 'gallop', feel: 'busy', arp: 'broken' },
    C: { bars: 8, prog: [4, 5, 7, 1], per: 2, drums: 'drive', bass: 'pulse', feel: 'mid', counter: 1 },
    D: { bars: 8, prog: [6, 7, 1, 1], per: 2, tune: false, arp: 'rise', drums: 'battle', bass: 'gallop', pad: 1 } } });
  T.battle3 = track('battle3', { key: 'C', mode: 'harm', bpm: 162, inst: I.fight, form: ['B', 'C', 'B', 'D'], verb: 0.15, sections: {
    B: { bars: 16, prog: [1, 6, 4, 5, 1, 6, 2, 5], per: 2, drums: 'battle', bass: 'gallop', feel: 'busy', counter: 1 },
    C: { bars: 8, prog: [6, 5, 4, 5], per: 2, drums: 'drive', bass: 'gallop', arp: 'up', feel: 'mid' },
    D: { bars: 8, prog: [1, 2, 5, 1], per: 2, tune: false, arp: 'rise', drums: 'boss', bass: 'gallop', pad: 1 } } });
  T.boss = track('boss', { key: 'E', mode: 'minor', inst: I.fight, form: ['A', 'B', 'A', 'C'], verb: 0.18, sections: {
    B: { bars: 16, prog: [1, 6, 4, 5, 1, 7, 6, 5], per: 2, drums: 'boss', bass: 'gallop', feel: 'busy', counter: 1, pad: 1 },
    C: { bars: 8, prog: [6, 7, 1, 1], per: 2, tune: false, arp: 'rise', drums: 'battle', bass: 'gallop' } } });
  T.boss2 = track('boss2', { key: 'F', mode: 'phryg', bpm: 168, inst: I.fight, form: ['B', 'C', 'B', 'D'], verb: 0.2, sections: {
    B: { bars: 16, prog: [1, 2, 1, 7, 1, 2, 6, 7], per: 2, drums: 'boss', bass: 'gallop', feel: 'busy', pad: 1 },
    C: { bars: 8, prog: [6, 7, 1, 2], per: 2, drums: 'battle', bass: 'gallop', counter: 1, feel: 'mid' },
    D: { bars: 8, prog: [1, 7, 6, 7], per: 2, tune: false, arp: 'up', drums: 'boss', bass: 'gallop' } } });
  T.finale = track('finale', { key: 'D', mode: 'minor', inst: I.fight, form: ['A', 'B', 'A', 'C', 'D'], verb: 0.22, sections: {
    B: { bars: 16, prog: [6, 7, 1, 1, 4, 5, 1, 1], per: 2, drums: 'boss', bass: 'gallop', feel: 'busy', pad: 1, counter: 1 },
    C: { bars: 8, prog: [6, 4, 1, 5], per: 2, tune: false, arp: 'rise', pad: 1, drums: 'drive', bass: 'pulse' },
    D: { bars: 16, prog: [1, 6, 3, 7, 6, 4, 5, 1], per: 2, drums: 'battle', bass: 'gallop', feel: 'mid', oct: 5, lo: -3, hi: 6 } } });
  // ---- each chapter's own battle and dungeon music ----
  I.dread = { lead: { type: 'sawtooth', vol: 0.03, detune: 9, vib: 0.006 }, bass: { type: 'triangle', vol: 0.24 }, arp: { type: 'square', vol: 0.025, pan: 0.35, gate: 0.4 }, pad0: { type: 'sawtooth', vol: 0.014, attack: 0.5, release: 0.5, detune: 8 }, pad1: { type: 'sine', vol: 0.04, attack: 0.5, release: 0.5, pan: -0.3 }, pad2: { type: 'triangle', vol: 0.03, attack: 0.5, release: 0.5, pan: 0.3 }, counter: { type: 'sine', vol: 0.08, pan: -0.3 }, drums: { vol: 0.075 } };
  I.swash = { lead: { type: 'square', vol: 0.05, vib: 0.008 }, bass: { type: 'triangle', vol: 0.22 }, arp: { type: 'triangle', vol: 0.07, pan: 0.35, gate: 0.5 }, pad0: { type: 'triangle', vol: 0.03 }, pad1: { type: 'triangle', vol: 0.03, pan: -0.3 }, pad2: { type: 'sine', vol: 0.03, pan: 0.3 }, counter: { type: 'square', vol: 0.025, pan: -0.35 }, drums: { vol: 0.065 } };
  I.arcane = { lead: { type: 'sine', vol: 0.13, decay: 0.3, release: 0.2 }, bass: { type: 'triangle', vol: 0.23 }, arp: { type: 'square', vol: 0.03, gate: 0.4, pan: 0.4 }, pad0: { type: 'sawtooth', vol: 0.012, attack: 0.4, release: 0.6, detune: 12 }, pad1: { type: 'sine', vol: 0.035, attack: 0.4, release: 0.6, pan: -0.3 }, pad2: { type: 'triangle', vol: 0.03, attack: 0.4, release: 0.6, pan: 0.3 }, counter: { type: 'triangle', vol: 0.07 }, drums: { vol: 0.07 } };
  T.battle_frost = track('battle_frost', { key: 'D', mode: 'minor', bpm: 152, inst: I.fight, form: ['B', 'C', 'B', 'D'], verb: 0.22, sections: {
    B: { bars: 16, prog: [1, 6, 7, 1, 4, 6, 5, 5], per: 2, drums: 'battle', bass: 'gallop', feel: 'busy', arp: 'rise' },
    C: { bars: 8, prog: [6, 7, 5, 1], per: 2, drums: 'stomp', bass: 'pulse', counter: 1, feel: 'mid', pad: 1 },
    D: { bars: 8, prog: [4, 5, 6, 5], per: 2, tune: false, arp: 'drip', arpOct: 5, drums: 'battle', bass: 'gallop' } } });
  T.battle_ash = track('battle_ash', { key: 'F#', mode: 'phryg', bpm: 166, inst: I.dread, form: ['B', 'C', 'B', 'D'], verb: 0.2, sections: {
    B: { bars: 16, prog: [1, 2, 7, 1, 6, 2, 7, 1], per: 2, drums: 'boss', bass: 'gallop', feel: 'busy', pad: 1 },
    C: { bars: 8, prog: [6, 7, 1, 2], per: 2, drums: 'stomp', bass: 'gallop', counter: 1, feel: 'mid' },
    D: { bars: 8, prog: [1, 2, 1, 7], per: 2, tune: false, arp: 'up', drums: 'boss', bass: 'gallop' } } });
  T.sunken = track('sunken', { key: 'G', mode: 'dorian', bpm: 68, inst: I.soft, form: ['B', 'C', 'B', 'D'], verb: 0.5, sections: {
    B: { bars: 16, prog: [1, 4, 7, 1, 6, 4, 5, 1], per: 2, pad: 1, arp: 'drip', arpOct: 5, feel: 'calm', bass: 'drone' },
    C: { bars: 8, prog: [4, 1, 7, 1], per: 2, tune: false, pad: 1, arp: 'slow', drums: 'tom' },
    D: { bars: 16, prog: [6, 7, 1, 4, 6, 5, 1, 1], per: 2, counter: 1, feel: 'calm', drums: 'tom' } } });
  T.cairn = track('cairn', { key: 'E', mode: 'phryg', bpm: 62, inst: I.dark, form: ['B', 'C', 'B', 'D'], verb: 0.55, sections: {
    B: { bars: 16, prog: [1, 2, 1, 7, 6, 7, 1, 1], per: 2, pad: 1, feel: 'calm', oct: 4, lo: -3, hi: 6, drums: 'tom' },
    C: { bars: 8, prog: [1, 7, 6, 7], per: 2, tune: false, arp: 'drip', arpOct: 5, bass: 'drone', pad: 1 },
    D: { bars: 16, prog: [4, 2, 1, 1, 6, 2, 1, 1], per: 2, counter: 1, feel: 'calm', drums: 'toms' } } });
  T.catacomb = track('catacomb', { key: 'F', mode: 'harm', bpm: 74, inst: I.dark, form: ['B', 'C', 'B', 'D'], verb: 0.45, sections: {
    B: { bars: 16, prog: [1, 4, 5, 1, 6, 2, 5, 1], per: 2, pad: 1, feel: 'mid', arp: 'slow', drums: 'tom' },
    C: { bars: 8, prog: [1, 6, 4, 5], per: 2, tune: false, pad: 1, arp: 'broken', bass: 'pulse' },
    D: { bars: 16, prog: [4, 5, 6, 5, 4, 2, 5, 1], per: 2, counter: 1, feel: 'calm', drums: 'march' } } });
  T.cinder = track('cinder', { key: 'C#', mode: 'harm', bpm: 70, inst: I.dark, form: ['B', 'C', 'B', 'D'], verb: 0.4, sections: {
    B: { bars: 16, prog: [1, 6, 2, 5, 1, 4, 5, 1], per: 2, pad: 1, feel: 'calm', drums: 'toms', bass: 'drone' },
    C: { bars: 8, prog: [6, 5, 4, 5], per: 2, tune: false, pad: 1, arp: 'rise', drums: 'tom' },
    D: { bars: 16, prog: [1, 2, 5, 1], per: 2, counter: 1, feel: 'mid', drums: 'march' } } });

  // ---- each chapter's puzzle dungeons, and the Archive's sneaking music ----
  I.pluck = { lead: { type: 'triangle', vol: 0.15, decay: 0.12, release: 0.08 }, bass: { type: 'triangle', vol: 0.2, decay: 0.15 }, arp: { type: 'sine', vol: 0.05, gate: 0.3, decay: 0.1, pan: 0.4 }, pad0: { type: 'sine', vol: 0.03, attack: 1, release: 1 }, pad1: { type: 'sine', vol: 0.025, attack: 1, release: 1, pan: -0.3 }, pad2: { type: 'sine', vol: 0.025, attack: 1, release: 1, pan: 0.3 }, counter: { type: 'triangle', vol: 0.06, decay: 0.15, pan: -0.35 }, drums: { vol: 0.035 } };
  I.glass = { lead: { type: 'sine', vol: 0.12, decay: 0.4, release: 0.6, detune: 4 }, bass: { type: 'sine', vol: 0.2 }, arp: { type: 'sine', vol: 0.055, gate: 0.4, decay: 0.2, pan: 0.45 }, pad0: { type: 'triangle', vol: 0.025, attack: 0.9, release: 1 }, pad1: { type: 'triangle', vol: 0.02, attack: 0.9, release: 1, pan: -0.35 }, pad2: { type: 'triangle', vol: 0.02, attack: 0.9, release: 1, pan: 0.35 }, counter: { type: 'sine', vol: 0.06, pan: -0.4, decay: 0.3 }, drums: { vol: 0.03 } };
  I.anvil = { lead: { type: 'square', vol: 0.05, decay: 0.3, release: 0.2, detune: 5 }, bass: { type: 'triangle', vol: 0.23 }, arp: { type: 'triangle', vol: 0.06, gate: 0.4, pan: 0.35 }, pad0: { type: 'sawtooth', vol: 0.012, attack: 0.5, release: 0.6, detune: 8 }, pad1: { type: 'sawtooth', vol: 0.01, attack: 0.5, release: 0.6, detune: -8, pan: -0.3 }, pad2: { type: 'triangle', vol: 0.02, attack: 0.5, release: 0.6, pan: 0.3 }, counter: { type: 'triangle', vol: 0.07, pan: -0.35 }, drums: { vol: 0.055 } };
  // chapter 2: bells under water (the Drowned Chapel, the Sea-Caves grotto)
  T.puzzle_tide = track('puzzle_tide', { key: 'G', mode: 'dorian', bpm: 84, inst: I.box, form: ['B', 'C', 'B', 'D', 'C'], verb: 0.5, sections: {
    B: { bars: 16, prog: [1, 4, 1, 7, 6, 4, 5, 1], per: 2, arp: 'drip', arpOct: 5, feel: 'calm', oct: 5, lo: -2, hi: 7, bass: 'half' },
    C: { bars: 8, prog: [4, 7, 1, 1], per: 2, tune: false, arp: 'slow', arpOct: 4, pad: 1, bass: 'drone' },
    D: { bars: 16, prog: [6, 7, 4, 1, 6, 4, 5, 1], per: 2, counter: 1, feel: 'mid', oct: 5, lo: -2, hi: 7, drums: 'tom' } } });
  // chapter 3: ice and mirrors (the Ice Halls, the Echo Spire): glass, high and bright
  T.puzzle_frost = track('puzzle_frost', { key: 'E', mode: 'lydian', bpm: 100, inst: I.glass, form: ['B', 'C', 'B', 'D', 'C'], verb: 0.45, sections: {
    B: { bars: 16, prog: [1, 2, 1, 5, 6, 2, 5, 1], per: 2, arp: 'rise', arpOct: 5, feel: 'mid', oct: 5, lo: -2, hi: 8, bass: 'half' },
    C: { bars: 8, prog: [4, 2, 6, 5], per: 2, tune: false, arp: 'drip', arpOct: 6, pad: 1, bass: 'drone' },
    D: { bars: 16, prog: [6, 5, 4, 1, 2, 5, 1, 1], per: 2, counter: 1, feel: 'calm', oct: 5, lo: -2, hi: 8, drums: 'soft' } } });
  // chapter 4: the Undercroft of Lamps, solemn and old (a music-box in a minor key, with a slow Warden march)
  T.puzzle_lamp = track('puzzle_lamp', { key: 'D', mode: 'harm', bpm: 80, inst: I.box, form: ['B', 'C', 'B', 'D', 'C'], verb: 0.42, sections: {
    B: { bars: 16, prog: [1, 6, 4, 5, 1, 2, 5, 1], per: 2, arp: 'broken', arpOct: 4, feel: 'calm', oct: 5, lo: -2, hi: 7, pad: 1 },
    C: { bars: 8, prog: [6, 5, 1, 1], per: 2, tune: false, arp: 'slow', arpOct: 5, bass: 'drone', drums: 'tom' },
    D: { bars: 16, prog: [4, 5, 6, 5, 4, 2, 5, 1], per: 2, counter: 1, feel: 'mid', oct: 5, lo: -2, hi: 7, drums: 'march', bass: 'pulse' } } });
  // the Inquisitor's Archive: tiptoeing past the wardens (plucked, quiet, a hand-written creeping tune)
  T.stealth = track('stealth', { key: 'A', mode: 'harm', bpm: 104, inst: I.pluck, form: ['M', 'B', 'M', 'C', 'D'], verb: 0.3, sections: {
    M: { lead: 'A4:1 -:1 C5:1 -:1 B4:1 -:1 G#4:2 A4:1 -:1 E4:1 -:1 F4:2 E4:2 A4:1 -:1 C5:1 -:1 D5:1 -:1 C5:2 B4:6 -:2 F5:1 -:1 E5:1 -:1 D5:1 -:1 C5:2 B4:1 -:1 A4:1 -:1 G#4:4 A4:1 C5:1 B4:1 A4:1 G#4:2 E4:2 A4:6 -:2', prog: [1, 6, 4, 5, 4, 5, 5, 1], per: 1, bass: 'walk', drums: 'soft' },
    B: { bars: 16, prog: [1, 4, 5, 1, 6, 4, 5, 5], per: 2, feel: 'calm', bass: 'walk', drums: 'soft', arp: 'drip', arpOct: 5 },
    C: { bars: 8, prog: [1, 7, 6, 5], per: 2, tune: false, bass: 'walk', pad: 1, drums: 'none' },
    D: { bars: 8, prog: [6, 4, 5, 1], per: 2, counter: 1, feel: 'mid', bass: 'walk', drums: 'soft' } } });
  // chapter 5: the Smith's Deep, hammer and quench
  T.puzzle_forge = track('puzzle_forge', { key: 'C', mode: 'mixo', bpm: 96, inst: I.anvil, form: ['B', 'C', 'B', 'D', 'C'], verb: 0.35, sections: {
    B: { bars: 16, prog: [1, 7, 4, 1, 1, 7, 5, 1], per: 2, arp: 'broken', arpOct: 4, feel: 'mid', drums: 'march', bass: 'pulse' },
    C: { bars: 8, prog: [4, 7, 1, 1], per: 2, tune: false, pad: 1, arp: 'up', drums: 'tom', bass: 'drone' },
    D: { bars: 16, prog: [6, 7, 1, 4, 6, 5, 1, 1], per: 2, counter: 1, feel: 'calm', drums: 'march', bass: 'half' } } });
  // ---- more places with a tune of their own ----
  I.organ = { lead: { type: 'square', vol: 0.035, attack: 0.06, release: 0.3, detune: 3 }, bass: { type: 'triangle', vol: 0.2, attack: 0.05, release: 0.3 }, arp: { type: 'sine', vol: 0.04, gate: 0.6, pan: 0.3 }, pad0: { type: 'triangle', vol: 0.035, attack: 0.5, release: 0.8 }, pad1: { type: 'triangle', vol: 0.03, attack: 0.5, release: 0.8, pan: -0.3 }, pad2: { type: 'triangle', vol: 0.03, attack: 0.5, release: 0.8, pan: 0.3 }, counter: { type: 'square', vol: 0.025, attack: 0.06, release: 0.3, pan: -0.35 }, drums: { vol: 0.03 } };
  // shops: a cheerful little counting tune, the same in every town
  T.shop = track('shop', { key: 'F', mode: 'major', bpm: 112, inst: I.bright, form: ['B', 'C', 'B', 'D'], verb: 0.15, sections: {
    B: { bars: 16, prog: [1, 6, 2, 5, 1, 6, 4, 5], per: 2, arp: 'broken', bass: 'walk', feel: 'busy', drums: 'soft' },
    C: { bars: 8, prog: [4, 5, 3, 6], per: 2, counter: 1, feel: 'mid', bass: 'walk' },
    D: { bars: 8, prog: [2, 5, 1, 1], per: 2, tune: false, arp: 'up', bass: 'pulse', drums: 'soft' } } });
  // temples and chapels: a hymn on a small organ
  T.hymn = track('hymn', { key: 'Bb', mode: 'major', bpm: 72, inst: I.organ, form: ['B', 'C', 'B', 'D'], verb: 0.55, sections: {
    B: { bars: 16, prog: [1, 4, 1, 5, 6, 4, 5, 1], per: 2, pad: 1, feel: 'calm', bass: 'half', oct: 4, lo: 0, hi: 7 },
    C: { bars: 8, prog: [4, 1, 2, 5], per: 2, tune: false, pad: 1, bass: 'half', arp: 'slow' },
    D: { bars: 16, prog: [6, 3, 4, 1, 2, 5, 1, 1], per: 2, pad: 1, counter: 1, feel: 'calm', bass: 'half', oct: 4, lo: 0, hi: 7 } } });
  // the Duke's palace and the counting-house: stately and cold
  T.court = track('court', { key: 'G', mode: 'minor', bpm: 88, inst: I.organ, form: ['B', 'C', 'B', 'D'], verb: 0.4, sections: {
    B: { bars: 16, prog: [1, 4, 7, 3, 6, 4, 5, 1], per: 2, arp: 'broken', feel: 'mid', bass: 'walk', drums: 'march' },
    C: { bars: 8, prog: [6, 7, 1, 1], per: 2, tune: false, pad: 1, arp: 'rise', bass: 'half' },
    D: { bars: 16, prog: [4, 5, 1, 6, 4, 2, 5, 1], per: 2, counter: 1, feel: 'calm', bass: 'half', drums: 'soft' } } });
  // dreams and the mirror: slow glass and a drone, never quite settling
  T.dream = track('dream', { key: 'Eb', mode: 'lydian', bpm: 64, inst: I.glass, form: ['B', 'C', 'B', 'D'], verb: 0.6, sections: {
    B: { bars: 16, prog: [1, 2, 1, 7, 6, 2, 5, 2], per: 2, pad: 1, arp: 'drip', arpOct: 5, feel: 'calm', bass: 'drone', oct: 5, lo: -2, hi: 7 },
    C: { bars: 8, prog: [2, 1, 2, 1], per: 2, tune: false, pad: 1, arp: 'slow', arpOct: 5, bass: 'drone' },
    D: { bars: 8, prog: [6, 7, 2, 1], per: 2, counter: 1, feel: 'calm', bass: 'drone', oct: 5, lo: -2, hi: 7 } } });
  // ice caves and the ice shrine: the frost's own dungeon tune
  T.frostcave = track('frostcave', { key: 'F#', mode: 'minor', bpm: 70, inst: I.glass, form: ['B', 'C', 'B', 'D'], verb: 0.55, sections: {
    B: { bars: 16, prog: [1, 6, 7, 1, 4, 6, 5, 1], per: 2, pad: 1, arp: 'drip', arpOct: 6, feel: 'calm', bass: 'drone' },
    C: { bars: 8, prog: [6, 4, 7, 1], per: 2, tune: false, pad: 1, arp: 'rise', arpOct: 5, drums: 'tom' },
    D: { bars: 16, prog: [4, 1, 6, 7, 4, 5, 1, 1], per: 2, counter: 1, feel: 'mid', drums: 'tom', bass: 'half' } } });

  // ---- a theme for every boss ----
  // Kinds set the band and the shape: brutes pound, the dead toll, beasts stampede, rogues swagger, zealots march,
  // the uncanny glitter. The great foes have a theme of their own, written out, that opens their track.
  const KIND = {
    brute: { inst: I.fight, B: { drums: 'battle', bass: 'gallop', feel: 'busy', counter: 1 }, C: { tune: false, arp: 'up', drums: 'stomp', bass: 'gallop', pad: 1 }, D: { drums: 'drive', bass: 'pulse', feel: 'mid' } },
    dead: { inst: I.dread, verb: 0.35, B: { drums: 'boss', bass: 'gallop', pad: 1, feel: 'mid' }, C: { tune: false, arp: 'slow', drums: 'toms', bass: 'drone', pad: 1 }, D: { drums: 'battle', bass: 'gallop', counter: 1, feel: 'busy' } },
    beast: { inst: I.fight, B: { drums: 'tribal', bass: 'gallop', feel: 'busy' }, C: { tune: false, arp: 'rise', drums: 'stomp', bass: 'gallop' }, D: { drums: 'tribal', bass: 'pulse', counter: 1, feel: 'mid' } },
    rogue: { inst: I.swash, B: { drums: 'drive', bass: 'walk', feel: 'busy', arp: 'broken' }, C: { drums: 'jig', bass: 'pulse', counter: 1, feel: 'mid' }, D: { tune: false, arp: 'up', drums: 'drive', bass: 'gallop' } },
    zealot: { inst: I.dread, verb: 0.3, B: { drums: 'march', bass: 'pulse', pad: 1, counter: 1, feel: 'mid' }, C: { drums: 'boss', bass: 'gallop', feel: 'busy' }, D: { tune: false, pad: 1, arp: 'slow', drums: 'march', bass: 'drone' } },
    uncanny: { inst: I.arcane, verb: 0.35, B: { drums: 'drive', bass: 'gallop', arp: 'rise', feel: 'mid' }, C: { tune: false, arp: 'broken', pad: 1, drums: 'boss', bass: 'pulse' }, D: { drums: 'battle', bass: 'gallop', counter: 1, feel: 'busy' } }
  };
  const PROGS = [[1, 6, 7, 5, 1, 4, 5, 5], [1, 4, 6, 5, 1, 7, 6, 5], [1, 2, 1, 7, 6, 7, 1, 1], [1, 6, 4, 5, 1, 6, 2, 5], [1, 7, 6, 7, 4, 5, 1, 1], [6, 7, 1, 1, 4, 5, 1, 1], [1, 5, 6, 3, 4, 1, 4, 5], [1, 3, 4, 5, 6, 4, 5, 1]];
  const SHORT_PROGS = [[6, 7, 1, 1], [4, 5, 1, 1], [6, 5, 4, 5], [1, 7, 6, 7], [2, 5, 1, 1], [6, 4, 5, 5]];
  // id: [kind, key, mode, bpm, theme (written-out opening, with its chords a bar each), groups that share it]
  const BOSS = {
    grukk: ['brute', 'G', 'minor', 150, ['G4:1 G4:1 Bb4:2 G4:1 G4:1 D5:2 | C5:2 Bb4:2 A4:4 | G4:1 G4:1 Bb4:2 G4:1 G4:1 F5:2 | D5:6 -:2 | Eb5:2 D5:2 C5:2 Bb4:2 | A4:2 Bb4:2 C5:4 | Bb4:2 A4:2 G4:2 F#4:2 | G4:8', [1, 7, 1, 5, 6, 7, 5, 1]], ['grukk_duo']],
    skrit: ['dead', 'B', 'phryg', 138],
    brawl: ['rogue', 'D', 'mixo', 172, ['D5:1 C5:1 A4:1 G4:1 A4:2 D4:2 | F#4:1 G4:1 A4:2 C5:2 A4:2 | D5:1 C5:1 A4:1 G4:1 A4:2 F#4:2 | G4:2 E4:2 D4:4 | D5:1 C5:1 A4:1 G4:1 A4:2 D4:2 | F#4:1 G4:1 A4:2 C5:2 E5:2 | D5:2 C5:2 A4:2 F#4:2 | G4:2 A4:2 D4:4', [1, 7, 1, 4, 1, 7, 5, 1]]],
    ratking: ['beast', 'C', 'minor', 168],
    abbot: ['dead', 'E', 'phryg', 120, ['E4:4 F4:4 | G4:2 F4:2 E4:4 | D4:4 E4:2 F4:2 | E4:8 | B4:4 C5:4 | D5:2 C5:2 B4:4 | A4:2 G4:2 F4:2 G4:2 | E4:8', [1, 2, 7, 1, 5, 6, 4, 1]]],
    snagtooth: ['brute', 'A', 'dorian', 156],
    tower_top: ['rogue', 'E', 'dorian', 160],
    keeper: ['dead', 'C#', 'harm', 132, ['C#5:2 E5:2 G#5:4 | F#5:2 E5:2 D#5:4 | E5:2 C#5:2 A4:2 B4:2 | C#5:8 | G#4:2 A4:2 B4:4 | C#5:2 D#5:2 E5:4 | D#5:2 C#5:2 B#4:2 G#4:2 | C#5:8', [1, 4, 6, 1, 5, 1, 5, 1]]],
    oneear: ['beast', 'A', 'minor', 164],
    rattlejack: ['rogue', 'F', 'mixo', 168],
    warden: ['zealot', 'A', 'harm', 140, ['A4:2 A4:1 A4:1 C5:2 E5:2 | D5:2 C5:2 B4:4 | A4:2 A4:1 A4:1 C5:2 E5:2 | G#4:6 -:2 | F5:2 E5:2 D5:2 C5:2 | B4:2 C5:2 D5:4 | E5:2 D5:2 C5:2 B4:2 | A4:8', [1, 4, 1, 5, 6, 4, 5, 1]], ['warden_small']],
    veyra: ['zealot', 'D', 'harm', 132, ['D5:3 C#5:1 D5:2 F5:2 | E5:4 A4:4 | Bb4:2 A4:2 G4:2 F4:2 | E4:6 A4:2 | D5:3 C#5:1 D5:2 A5:2 | G5:4 F5:2 E5:2 | F5:2 E5:2 D5:2 C#5:2 | D5:8', [1, 5, 6, 5, 1, 4, 5, 1]]],
    prior: ['dead', 'C', 'minor', 126, ['C5:6 Eb5:2 | D5:4 Bb4:4 | C5:2 G4:2 Ab4:2 G4:2 | F4:6 -:2 | Eb4:2 F4:2 G4:2 Ab4:2 | Bb4:4 G4:4 | Ab4:2 G4:2 F4:2 D4:2 | C4:8', [1, 7, 6, 4, 3, 5, 4, 1]]],
    snapjaw: ['beast', 'Bb', 'minor', 160],
    bellwraith: ['dead', 'G', 'phryg', 134],
    gannet: ['rogue', 'G', 'major', 164, ['G4:2 B4:2 D5:3 B4:1 | C5:2 E5:2 D5:4 | B4:2 G4:2 A4:2 B4:2 | A4:6 -:2 | G4:2 B4:2 D5:3 G5:1 | F#5:2 E5:2 D5:4 | C5:2 B4:2 A4:2 F#4:2 | G4:8', [1, 4, 1, 5, 1, 5, 4, 1]]],
    archivist: ['uncanny', 'Eb', 'minor', 140],
    longsal: ['rogue', 'C', 'dorian', 164],
    eelking: ['beast', 'F', 'phryg', 156],
    veyra3: ['zealot', 'D', 'harm', 140, ['D5:3 C#5:1 D5:2 F5:2 | E5:4 A4:4 | Bb4:2 A4:2 G4:2 F4:2 | E4:6 A4:2 | D5:3 C#5:1 D5:2 Bb5:2 | A5:4 G5:2 F5:2 | E5:2 F5:2 G5:2 C#5:2 | D5:8', [1, 5, 6, 5, 1, 6, 5, 1]]],
    giant: ['dead', 'D', 'minor', 108, ['D4:4 D4:2 F4:2 | E4:4 A3:4 | D4:4 F4:2 A4:2 | G4:8 | Bb4:4 A4:2 G4:2 | F4:4 E4:4 | D4:2 E4:2 F4:2 E4:2 | D4:8', [1, 5, 1, 4, 6, 3, 7, 1]]],
    rimeclaw: ['beast', 'B', 'minor', 162],
    watcher: ['dead', 'A', 'dorian', 128],
    rimemother: ['uncanny', 'F#', 'minor', 132, ['F#5:4 E5:2 C#5:2 | D5:4 A4:4 | B4:2 C#5:2 D5:2 E5:2 | C#5:8 | F#5:4 G#5:2 A5:2 | E5:4 C#5:4 | D5:2 C#5:2 B4:2 G#4:2 | F#4:8', [1, 6, 4, 5, 1, 5, 4, 1]]],
    frostbound: ['dead', 'E', 'minor', 136],
    grimtusk: ['brute', 'C', 'phryg', 158],
    troll3: ['beast', 'G', 'minor', 150],
    whitepaw: ['beast', 'E', 'dorian', 158],
    safehouse: ['zealot', 'G', 'harm', 150],
    colossus: ['dead', 'Bb', 'phryg', 118],
    engine: ['uncanny', 'D', 'lydian', 150],
    hollowwarden: ['dead', 'F', 'harm', 124],
    inquisitor: ['zealot', 'F#', 'harm', 128, ['F#4:2 A4:2 C#5:2 F#5:2 | E#5:4 C#5:4 | D5:2 C#5:2 B4:2 A4:2 | G#4:8 | A4:2 B4:2 C#5:2 D5:2 | E5:4 C#5:4 | B4:2 A4:2 G#4:2 E#4:2 | F#4:8', [1, 5, 6, 5, 3, 7, 5, 1]]],
    charnelabbot: ['dead', 'A', 'phryg', 130],
    ratmother: ['beast', 'D', 'phryg', 166],
    forger: ['rogue', 'A', 'harm', 158],
    duel4: ['rogue', 'E', 'harm', 176, ['E5:1 D#5:1 E5:1 B4:1 G5:2 E5:2 | F#5:1 E5:1 D#5:1 E5:1 B4:4 | C5:1 B4:1 A4:1 B4:1 E5:2 G4:2 | F#4:6 -:2 | E5:1 D#5:1 E5:1 B4:1 A5:2 G5:2 | F#5:1 G5:1 A5:1 F#5:1 D#5:4 | E5:2 B4:2 C5:2 F#4:2 | E4:8', [1, 5, 4, 5, 1, 5, 4, 1]]],
    ashenknight: ['zealot', 'B', 'phryg', 132],
    hollowself: ['uncanny', 'D', 'harm', 136, ['A5:3 G5:1 A5:2 F5:2 | G5:4 D5:4 | C#5:2 D5:2 E5:2 F5:2 | E5:6 D5:2 | A4:3 G4:1 A4:2 F4:2 | G4:4 D4:4 | C#4:2 E4:2 G4:2 A4:2 | D4:8', [5, 4, 5, 5, 1, 7, 5, 1]]],
    ashmarshal: ['zealot', 'C', 'phryg', 146],
    lampqueen: ['uncanny', 'A', 'minor', 138, ['E5:2 D5:1 C5:1 B4:2 A4:2 | G#4:4 E4:4 | A4:2 B4:1 C5:1 D5:2 E5:2 | F5:6 E5:2 | D5:2 C5:1 B4:1 A4:2 F4:2 | E4:4 G#4:4 | A4:2 C5:2 B4:2 G#4:2 | A4:8', [1, 5, 1, 6, 4, 5, 5, 1]]],
    ilsabet: ['zealot', 'E', 'harm', 150],
    cinderbrute: ['brute', 'F#', 'phryg', 154],
    corr: ['zealot', 'E', 'phryg', 150, ['E4:2 F4:2 E4:2 B4:2 | C5:4 B4:4 | A4:2 G4:2 F4:2 E4:2 | F4:8 | E4:2 F4:2 E4:2 C5:2 | D5:4 C5:4 | B4:2 A4:2 G4:2 F4:2 | E4:8', [1, 6, 4, 2, 1, 7, 5, 1]], ['corr_shaken', 'corrveyra']],
    king: ['dead', 'B', 'harm', 128, ['B4:4 F#5:4 | G5:4 F#5:2 E5:2 | D5:4 C#5:2 B4:2 | A#4:8 | B4:4 D5:4 | E5:4 F#5:2 G5:2 | F#5:2 E5:2 D5:2 C#5:2 | B4:8', [1, 6, 4, 5, 1, 4, 5, 1]]]
  };
  D.bossMusic = {};
  for (const [id, [kind, key, mode, bpm, theme, also]] of Object.entries(BOSS)) {
    const R = rng(hash('boss:' + id)), Kd = KIND[kind], sec = {};
    const sect = (base, bars, prog) => Object.assign({ bars, prog, per: 2 }, base);
    if (theme) sec.M = Object.assign({ lead: theme[0].replace(/\|/g, ' '), prog: theme[1], per: 1, pad: kind === 'dead' || kind === 'zealot' || kind === 'uncanny' ? 1 : 0 }, { drums: Kd.B.drums, bass: Kd.B.bass });
    sec.B = sect(Kd.B, 16, pick(R, PROGS)); sec.C = sect(Kd.C, 8, pick(R, SHORT_PROGS)); sec.D = sect(Kd.D, 8, pick(R, SHORT_PROGS));
    const tid = 'boss_' + id;
    T[tid] = track(tid, { key, mode, bpm, inst: Kd.inst, verb: Kd.verb || 0.2, form: theme ? ['M', 'B', 'M', 'C', 'D'] : ['B', 'C', 'B', 'D'], sections: sec });
    for (const g of [id].concat(also || [])) D.bossMusic[g] = tid;
  }
  D.music = Object.assign({}, OLD, T);
  // Which track a place plays: its own, or for the generic dungeon one that suits it, and inns get a tavern tune.
  // Which track a place plays. Dungeons play their chapter's own underground theme (Vael Morn's halls their own, the
  // puzzle dungeons the music-box), and inns a tavern tune.
  const DUNGEON = { cistern: 'dungeon', oldtower: 'dungeon', digsite: 'cave', chapel: 'crypt', barrow1: 'crypt', barrow2: 'crypt', ossuary: 'crypt',
    abbey1: 'sunken', abbey2: 'sunken', scriptorium: 'sunken', seacave: 'sunken', belltower: 'sunken', smugglers: 'cave',
    cairn1: 'cairn', cairn2: 'cairn', vault3: 'cairn', goblinden: 'cave',
    catacombs1: 'catacomb', catacombs2: 'catacomb', charnel: 'catacomb', h_crypt: 'catacomb',
    greyhold: 'cinder', cindercave: 'cinder', hollow1: 'throne', hollow2: 'throne', lamphall: 'throne' };
  // the puzzle dungeons: a theme per chapter (the Archive sneaks)
  const PUZZLE = { millrace: 'puzzle', hollowbarrow: 'puzzle', drownedchapel: 'puzzle_tide', seacaves: 'puzzle_tide', icehalls: 'puzzle_frost',
    echospire: 'puzzle_frost', archive: 'stealth', lampvault: 'puzzle_lamp', smithdeep: 'puzzle_forge' };
  // places with a tune of their own, whatever their map says
  const PLACE = { shop: 'shop', h_shop: 'shop', s_shop: 'shop', k_shop: 'shop', temple: 'hymn', s_chapel: 'hymn', h_cathedral: 'hymn',
    h_palace: 'court', h_counting: 'court', v_dream: 'dream', mirror: 'dream', icecaves: 'frostcave', iceshrine: 'frostcave' };
  D.musicFor = function (d) {
    const m = d.music, pid = Object.keys(PLACE).find(k => D.maps[k] === d);
    if (pid) return PLACE[pid];
    if (m === 'dungeon') {
      const id = Object.keys(D.maps).find(k => D.maps[k] === d);
      if (id && PUZZLE[id]) return PUZZLE[id];
      if (d.things && Object.values(d.things).some(t => (Array.isArray(t) ? t : [t]).some(x => x && x.pz))) return 'puzzle';
      if (id && DUNGEON[id]) return DUNGEON[id];
      if (d.bg === 'throne') return 'throne';
      if (d.bg === 'cave') return 'cave';
      if (d.bg === 'crypt') return 'crypt';
    }
    if (d.bg === 'tavern' && ['town', 'harbor', 'hold', 'city'].indexOf(m) >= 0) return 'tavern';
    return m || null;
  };
  // Each boss fight has its own theme; every other fight plays its chapter's battle music.
  const CH_BATTLE = [null, 'battle', 'battle2', 'battle_frost', 'battle3', 'battle_ash'];
  D.battleMusic = (boss, gid, grp) => {
    if (gid && D.bossMusic[gid]) return D.bossMusic[gid];
    if (grp && grp.music) return grp.music;
    const ch = Math.max(1, Math.min(5, G.flag('chapter') || 1));
    return boss ? (ch >= 4 ? 'boss2' : 'boss') : CH_BATTLE[ch];
  };
})();
