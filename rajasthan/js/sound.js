/* Ambient soundscape, synthesised with the Web Audio API (no audio files).
   Desert wind (filtered noise), a tanpura-style drone on Sa and Pa, and a rare morchang (jaw harp) twang.
   Nothing plays until the reader presses the sound button. */
(function () {
  'use strict';
  let ac = null, master = null, on = false, timer = 0, pluckT = 0, voices = [];

  function build() {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
    const comp = ac.createDynamicsCompressor(); comp.connect(master);

    // wind: brown-ish noise through a wandering band-pass
    const len = ac.sampleRate * 4, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.2; }
    const noise = ac.createBufferSource(); noise.buffer = buf; noise.loop = true;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = 0.7;
    const wg = ac.createGain(); wg.gain.value = 0.32;
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.07; const lfoG = ac.createGain(); lfoG.gain.value = 260;
    lfo.connect(lfoG).connect(bp.frequency);
    const lfo2 = ac.createOscillator(); lfo2.frequency.value = 0.11; const lfo2G = ac.createGain(); lfo2G.gain.value = 0.14;
    lfo2.connect(lfo2G).connect(wg.gain);
    noise.connect(bp).connect(wg).connect(comp);
    noise.start(); lfo.start(); lfo2.start();

    // drone: Sa (D2) and Pa (A2) with soft upper partials, slow breathing
    const droneG = ac.createGain(); droneG.gain.value = 0.11;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 0.4;
    droneG.connect(lp).connect(comp);
    voices = [[73.42, 0], [110.0, 0.35], [146.83, 0.2], [73.42 * 1.003, 0.6]].map(([f, ph]) => {
      const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
      const g = ac.createGain(); g.gain.value = 0.0001;
      o.connect(g).connect(droneG); o.start();
      return { g, ph };
    });
  }

  // morchang: a short, bending, resonant twang
  function twang() {
    if (!ac || !on) return;
    const t = ac.currentTime;
    const o = ac.createOscillator(); o.type = 'square'; o.frequency.value = 146.83;
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 9;
    f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(1800, t + 0.18); f.frequency.exponentialRampToValueAtTime(700, t + 0.5);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    o.connect(f).connect(g).connect(master); o.start(t); o.stop(t + 0.75);
  }
  // tanpura-like plucked swell every 4.2 s, scheduled a cycle ahead
  function pluck() {
    if (!ac || !on) return;
    const t = ac.currentTime + 0.05;
    for (const v of voices) {
      const s = t + v.ph; v.g.gain.setValueAtTime(0.0001, s);
      v.g.gain.exponentialRampToValueAtTime(0.32, s + 0.08); v.g.gain.exponentialRampToValueAtTime(0.06, s + 3.9);
    }
  }
  function nextTwang() { clearTimeout(timer); timer = setTimeout(() => { twang(); setTimeout(twang, 260); nextTwang(); }, 7000 + Math.random() * 9000); }
  function start() { clearInterval(pluckT); pluck(); pluckT = setInterval(pluck, 4200); nextTwang(); }
  function stop() { clearTimeout(timer); clearInterval(pluckT); }

  window.SND = {
    toggle() {
      try {
        if (!ac) build();
        on = !on;
        if (ac.state === 'suspended') ac.resume();
        const t = ac.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t);
        master.gain.linearRampToValueAtTime(on ? 0.8 : 0, t + 1.2);
        if (on) start(); else stop();
      } catch (e) { on = false; }
      return on;
    },
    suspend() { if (ac && on) ac.suspend(); },
    resume() { if (ac && on) ac.resume(); },
    get on() { return on; },
  };
})();
