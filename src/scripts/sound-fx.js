// Web Audio API Arcade Sound Synthesizer (Zero external dependencies)
let audioCtx = null;
let soundMuted = false;

try {
    const savedMute = localStorage.getItem('arcadeSoundMuted');
    if (savedMute !== null) {
        soundMuted = JSON.parse(savedMute);
    }
} catch (e) {
    console.error('Error loading sound mute state:', e);
}

function getAudioContext() {
    if (!audioCtx) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (AudioCtxClass) {
            audioCtx = new AudioCtxClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

export function isSoundMuted() {
    return soundMuted;
}

export function toggleSoundMute() {
    soundMuted = !soundMuted;
    try {
        localStorage.setItem('arcadeSoundMuted', JSON.stringify(soundMuted));
    } catch (e) {
        console.error(e);
    }
    return soundMuted;
}

export function setSoundMuted(val) {
    soundMuted = !!val;
    try {
        localStorage.setItem('arcadeSoundMuted', JSON.stringify(soundMuted));
    } catch (e) {
        console.error(e);
    }
}

/**
 * Play a synthesized tactile click sound
 */
export function playClickSound() {
    if (soundMuted) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
        console.warn('Audio play error:', e);
    }
}

/**
 * Play harmonic chord success based on current combo multiplier
 * @param {number} combo 1, 2, 3, 4, 5+
 */
export function playSuccessSound(combo = 1) {
    if (soundMuted) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;

        // Frequencies for C Major / Polyglot Chords
        const chordNotes = {
            1: [523.25, 659.25],            // C5, E5
            2: [523.25, 659.25, 783.99],     // C5, E5, G5
            3: [659.25, 783.99, 1046.50],    // E5, G5, C6
            4: [523.25, 659.25, 783.99, 1046.50, 1318.51], // C5, E5, G5, C6, E6
            5: [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98] // Epic 6-note Cyber Fanfare
        };

        const notes = chordNotes[Math.min(combo, 5)] || chordNotes[1];
        const isHyper = combo >= 4;

        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = isHyper ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, now + (idx * 0.04));

            const startTime = now + (idx * 0.04);
            const duration = 0.28 + (idx * 0.03);

            gain.gain.setValueAtTime(0.001, startTime);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
        });
    } catch (e) {
        console.warn('Audio play error:', e);
    }
}

/**
 * Play soft gentle error buzz (constructive feedback)
 */
export function playErrorSound() {
    if (soundMuted) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.22);

        // Low-pass filter for smooth, warm thud
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.22);
    } catch (e) {
        console.warn('Audio play error:', e);
    }
}

/**
 * Play flame whoosh for streaks
 */
export function playStreakSound() {
    if (soundMuted) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        // Ascending harmonic swell
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);

            gain.gain.setValueAtTime(0.001, now + idx * 0.05);
            gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.05 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + idx * 0.05);
            osc.stop(now + 0.45);
        });
    } catch (e) {
        console.warn('Audio play error:', e);
    }
}

/**
 * Play victory fanfare when mission is completed
 */
export function playVictorySound() {
    if (soundMuted) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6

        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.09);

            const start = now + idx * 0.09;
            gain.gain.setValueAtTime(0.001, start);
            gain.gain.linearRampToValueAtTime(0.18, start + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.7);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(start);
            osc.stop(start + 0.7);
        });
    } catch (e) {
        console.warn('Audio play error:', e);
    }
}

/**
 * Play speed bonus laser chime for ultra-fast response (< 4s)
 */
export function playSpeedBonusSound() {
    if (soundMuted) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        [1046.50, 1318.51, 1567.98].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.03);

            gain.gain.setValueAtTime(0.001, now + idx * 0.03);
            gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.03 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + idx * 0.03);
            osc.stop(now + 0.25);
        });
    } catch (e) {
        console.warn('Audio play error:', e);
    }
}

