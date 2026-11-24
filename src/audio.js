/* Audio: synthesized sound effects, and the music (G.D.music, composed in data/ch9_world/w_music.js).
   A track is a set of voices that loop together. A voice is notes ("D4:2 F4:2 -:4", lengths in eighth notes) played
   by an instrument (osc type, volume, attack, release, detune, vibrato, pan), or a drum line ("k.h.s.h.": kick,
   snare, hat, open hat, tom; K and S add a hat). Music runs through a little room reverb. A track you leave picks up
   where it left off when you come back (battle music always starts fresh).
   Nothing plays until the first key or tap, as browsers require. */
G.audio = (function () {
  let ac = null, master = null, mGain = null, sGain = null, mBus = null, verb = null, wet = null;
  const resumeAt = {};
  let cur = null, wanted = null, timer = null, voices = [], loopLen = 0, startT = 0, stepDur = 0, schedTo = 0;
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  // Volumes: G.opts.musicVol and G.opts.sfxVol, 0-10 (Options; 0 is off). Older settings had only on and off.
  const vol = (on, v, d) => !on ? 0 : v == null ? d : Math.max(0, Math.min(10, v));
  G.volMusic = () => vol(G.opts.music, G.opts.musicVol, 7);
  G.volSfx = () => vol(G.opts.sfx, G.opts.sfxVol, 7);
  const musicLevel = () => 0.32 * Math.pow(G.volMusic() / 7, 1.6);   // 7 is where the music always sat
  const sfxLevel = () => 0.55 * Math.pow(G.volSfx() / 7, 1.6);
  function unlock() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
      mGain = ac.createGain(); mGain.gain.value = musicLevel(); mGain.connect(master);
      mBus = ac.createGain(); mBus.connect(mGain);
      try {                                                        // a small stone room: two seconds of decaying noise
        verb = ac.createConvolver(); const len = ac.sampleRate * 2.2, ir = ac.createBuffer(2, len, ac.sampleRate);
        for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
        verb.buffer = ir; wet = ac.createGain(); wet.gain.value = 0.2; mBus.connect(verb); verb.connect(wet); wet.connect(mGain);
      } catch (e) { verb = null; }
      sGain = ac.createGain(); sGain.gain.value = sfxLevel(); sGain.connect(master);
      if (wanted) { const w = wanted; wanted = null; cur = null; music(w); }
    } catch (e) { ac = null; }
  }
  function freq(n) {
    const m = /^([A-G])([#b]?)(\d)$/.exec(n); if (!m) return 0;
    const semi = NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (+m[3] + 1) * 12;
    return 440 * Math.pow(2, (semi - 69) / 12);
  }
  function tone(f, t0, dur, type, vol, dest, slide) {
    if (!ac || !f) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.008);
    g.gain.setValueAtTime(vol, t0 + Math.max(0.01, dur * 0.6)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  // One note of a music voice: one or two oscillators (detuned), an attack and release, vibrato, pan.
  function play(v, f, t0, dur) {
    if (!ac || !f) return;
    const g = ac.createGain(), atk = Math.min(v.attack || 0.008, dur * 0.8), rel = v.release || 0;
    let out = g;
    if (v.pan && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = v.pan; g.connect(p); out = p; }
    out.connect(mBus || mGain);
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v.vol, t0 + atk);
    if (v.decay) g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v.vol * 0.25), t0 + atk + v.decay);
    else g.gain.setValueAtTime(v.vol, t0 + Math.max(atk, dur * 0.6));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + rel);
    const oscs = [f].concat(v.detune ? [f * Math.pow(2, v.detune / 1200)] : []);
    for (const fq of oscs) {
      const o = ac.createOscillator(); o.type = v.type; o.frequency.setValueAtTime(fq, t0);
      if (v.vib && dur > 0.35) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 5.2; lg.gain.setValueAtTime(0, t0); lg.gain.linearRampToValueAtTime(fq * v.vib, t0 + Math.min(0.5, dur)); l.connect(lg); lg.connect(o.frequency); l.start(t0); l.stop(t0 + dur + rel + 0.05); }
      const og = ac.createGain(); og.gain.value = oscs.length > 1 ? 0.6 : 1; o.connect(og); og.connect(g);
      o.start(t0); o.stop(t0 + dur + rel + 0.05);
    }
  }
  function drum(ch, t0, vol) {
    const d = mBus || mGain;
    if (ch === 'k' || ch === 'K') { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(130, t0); o.frequency.exponentialRampToValueAtTime(42, t0 + 0.16); g.gain.setValueAtTime(vol * 2.4, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22); o.connect(g); g.connect(d); o.start(t0); o.stop(t0 + 0.25); }
    if (ch === 's' || ch === 'S') { noise(t0, 0.13, vol * 1.3, d, 1500); tone(190, t0, 0.07, 'triangle', vol * 0.9, d); }
    if (ch === 't') { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(150, t0); o.frequency.exponentialRampToValueAtTime(80, t0 + 0.3); g.gain.setValueAtTime(vol * 2, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4); o.connect(g); g.connect(d); o.start(t0); o.stop(t0 + 0.45); }
    if (ch === 'h' || ch === 'K' || ch === 'S') noise(t0, 0.035, vol * 0.55, d, 6500);
    if (ch === 'o') noise(t0, 0.16, vol * 0.5, d, 5500);
  }
  let nbuf = null;
  function noise(t0, dur, vol, dest, hp) {
    if (!ac) return;
    if (!nbuf) { nbuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate); const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = ac.createBufferSource(); s.buffer = nbuf;
    const f = ac.createBiquadFilter(); f.type = hp ? 'highpass' : 'lowpass'; f.frequency.value = hp || 1200;
    const g = ac.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t0); s.stop(t0 + dur + 0.02);
  }
  function sfx(name) {
    if (!ac || !G.opts.sfx || G.fast) return;
    const t = ac.currentTime, d = sGain, q = (f, at, len, type, v, sl) => tone(f, t + at, len, type || 'square', v || 0.18, d, sl);
    switch (name) {
      case 'move': q(660, 0, 0.04, 'square', 0.08); break;
      case 'select': q(880, 0, 0.06); q(1320, 0.05, 0.08); break;
      case 'cancel': q(440, 0, 0.07); q(330, 0.05, 0.09); break;
      case 'error': q(160, 0, 0.14, 'sawtooth', 0.14); break;
      case 'text': q(520, 0, 0.02, 'square', 0.04); break;
      case 'hit': noise(t, 0.12, 0.5, d); q(180, 0, 0.1, 'square', 0.16, 60); break;
      case 'crit': noise(t, 0.2, 0.7, d); q(300, 0, 0.18, 'sawtooth', 0.2, 50); q(900, 0.02, 0.12, 'square', 0.12, 300); break;
      case 'miss': noise(t, 0.09, 0.15, d, 3000); break;
      case 'heal': q(523, 0, 0.1, 'sine', 0.2); q(659, 0.08, 0.1, 'sine', 0.2); q(784, 0.16, 0.18, 'sine', 0.2); break;
      case 'buff': q(392, 0, 0.08, 'triangle', 0.22); q(587, 0.07, 0.14, 'triangle', 0.22); break;
      case 'debuff': q(392, 0, 0.1, 'triangle', 0.22); q(277, 0.08, 0.18, 'triangle', 0.22); break;
      case 'magic': q(700, 0, 0.25, 'sine', 0.2, 1400); noise(t, 0.2, 0.12, d, 4000); break;
      case 'fire': noise(t, 0.35, 0.5, d); q(120, 0, 0.3, 'sawtooth', 0.14, 50); break;
      case 'down': q(300, 0, 0.3, 'square', 0.16, 70); break;
      case 'chest': q(523, 0, 0.07); q(659, 0.07, 0.07); q(784, 0.14, 0.07); q(1046, 0.21, 0.16); break;
      case 'item': q(784, 0, 0.06); q(1046, 0.06, 0.12); break;
      case 'coin': q(1318, 0, 0.05); q(1760, 0.05, 0.12); break;
      case 'quest': q(587, 0, 0.1, 'triangle', 0.24); q(784, 0.1, 0.1, 'triangle', 0.24); q(988, 0.2, 0.22, 'triangle', 0.24); break;
      case 'door': noise(t, 0.12, 0.3, d); q(110, 0, 0.12, 'square', 0.1); break;
      case 'lever': q(140, 0, 0.08, 'square', 0.18); noise(t + 0.1, 0.5, 0.35, d); break;
      case 'roll': for (let i = 0; i < 6; i++) q(300 + Math.random() * 500, i * 0.06, 0.04, 'square', 0.07); break;
      case 'good': q(659, 0, 0.09); q(880, 0.09, 0.18); break;
      case 'bad': q(220, 0, 0.12, 'sawtooth', 0.14); q(165, 0.12, 0.22, 'sawtooth', 0.14); break;
      case 'encounter': for (let i = 0; i < 5; i++) q(220 + i * 110, i * 0.05, 0.06, 'sawtooth', 0.14); break;
      case 'level': [523, 659, 784, 1046, 1318].forEach((f, i) => q(f, i * 0.09, 0.16, 'square', 0.16)); break;
      case 'win': [392, 523, 659, 784, 659, 1046].forEach((f, i) => q(f, i * 0.11, i === 5 ? 0.45 : 0.12, 'square', 0.16)); break;
      case 'lose': [392, 349, 311, 262].forEach((f, i) => q(f, i * 0.22, 0.3, 'triangle', 0.24)); break;
      case 'bell': q(196, 0, 1.4, 'sine', 0.22); q(392, 0, 1.0, 'sine', 0.1); q(587, 0.01, 0.6, 'triangle', 0.05); break;
      case 'rest': [330, 392, 523, 659, 587, 523].forEach((f, i) => q(f, i * 0.2, i === 5 ? 0.6 : 0.22, 'triangle', 0.24)); break;
    }
  }
  // "C4:2 E4:2 -:4" -> [{f, len}] in steps (eighth notes); "|" is ignored.
  function parse(str) {
    const out = [];
    str.split(/\s+/).forEach(tok => {
      if (!tok || tok === '|') return;
      const p = tok.split(':'); out.push({ f: p[0] === '-' ? 0 : freq(p[0]), len: +(p[1] || 1) });
    });
    return out;
  }
  function schedule() {
    if (!ac || !cur) return;
    const until = ac.currentTime + 0.35;
    while (schedTo < until) {
      const step = Math.round((schedTo - startT) / stepDur), pos = ((step % loopLen) + loopLen) % loopLen;
      for (const v of voices) {
        if (v.drum) { const ch = v.drum[pos % v.drum.length]; if (ch && ch !== '.') drum(ch, schedTo, v.vol); continue; }
        const n = v.at[pos];
        if (n && n.f) play(v, n.f, schedTo, Math.max(0.05, n.len * stepDur * (v.gate || 0.9)));
        if (v.hat && pos % v.hat === 0) noise(schedTo, 0.04, v.vol, mBus || mGain, 5000);
      }
      schedTo += stepDur;
    }
  }
  function music(name) {
    if (name === cur) return;
    if (!ac) { wanted = name; return; }
    if (timer) { clearInterval(timer); timer = null; }
    if (cur && loopLen && stepDur && !/^(battle|boss|finale)/.test(cur)) {      // remember where we were, to the bar
      const step = Math.max(0, Math.round((ac.currentTime - startT) / stepDur)); resumeAt[cur] = Math.floor((step % loopLen) / 8) * 8;
    }
    cur = name;
    const trk = name && G.D.music[name]; if (!trk) { cur = name; return; }
    stepDur = 30 / trk.bpm; voices = []; loopLen = 0;
    for (const v of trk.voices) {
      const at = {}; let pos = 0;
      if (v.drum) { const pat = v.drum.replace(/[\s|]/g, ''); loopLen = Math.max(loopLen, pat.length); voices.push({ drum: pat, vol: v.vol || 0.1 }); continue; }
      if (v.notes) parse(v.notes).forEach(n => { at[pos] = n; pos += n.len; });
      loopLen = Math.max(loopLen, pos);
      voices.push(Object.assign({}, v, { at, type: v.type || 'square', vol: v.vol || 0.1 }));
    }
    if (!loopLen) return;
    if (wet) wet.gain.value = trk.verb != null ? trk.verb : 0.2;
    const from = resumeAt[name] || 0;
    startT = ac.currentTime + 0.06 - from * stepDur; schedTo = ac.currentTime + 0.06;
    schedule(); timer = setInterval(schedule, 110);
  }
  // A tuned bell-stone: scale steps 0-7 of a pentatonic scale, struck soft and left to ring.
  function note(i) {
    if (!ac || !G.opts.sfx || G.fast) return;
    const st = [0, 2, 4, 7, 9, 12, 14, 16][Math.max(0, Math.min(7, i | 0))], f = 523.25 * Math.pow(2, st / 12), t = ac.currentTime;
    tone(f, t, 0.9, 'triangle', 0.22, sGain); tone(f * 2, t, 0.35, 'sine', 0.06, sGain);
  }
  function setOpts() { if (mGain) mGain.gain.value = musicLevel(); if (sGain) sGain.gain.value = sfxLevel(); }
  return { unlock, sfx, note, music, setOpts, current: () => cur || wanted };
})();
