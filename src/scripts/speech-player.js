// One voice channel. Superseded requests and callbacks never regain playback.
export function createSpeechPlayer(env = globalThis, { timeoutMs = 4500, cacheLimit = 40, onState = () => {} } = {}) {
    let generation = 0;
    let controller = null;
    let audio = null;
    let utterance = null;
    let settle = null;
    let timer = null;
    const cache = new Map();
    const clearTimer = () => { if (timer !== null) env.clearTimeout(timer); timer = null; };
    const audible = () => env.document?.visibilityState !== 'hidden';

    function stop() {
        generation++;
        clearTimer();
        controller?.abort();
        controller = null;
        if (audio) { audio.onended = audio.onerror = null; audio.pause(); audio = null; }
        if (utterance) { utterance.onend = utterance.onerror = null; utterance = null; }
        env.speechSynthesis?.cancel();
        settle?.('cancelled');
        settle = null;
        onState({ status: 'idle' });
    }

    function play(text, options = {}) {
        stop();
        const clean = String(text || '').replace(/[*_#`[\]"]/g, '').trim();
        if (!clean || !audible()) return Promise.resolve('cancelled');
        const id = generation;
        const current = () => generation === id && audible();
        const rate = Math.max(0.5, Math.min(1.5, Number(options.rate) || 1));
        const voice = options.voice || 'en-US-JennyNeural';
        const percent = Math.round((rate - 1) * 100);
        const rateString = `${percent >= 0 ? '+' : ''}${percent}%`;
        const key = `${voice}|${rateString}|${clean}`;

        return new Promise(resolve => {
            let finished = false;
            function finish(result) {
                if (finished) return;
                finished = true;
                if (generation === id) {
                    clearTimer();
                    settle = null;
                    onState({ status: result === 'error' ? 'error' : 'idle' });
                }
                resolve(result);
                if (result === 'ended' && current()) options.onEnd?.();
            }
            settle = finish;
            function browserVoice() {
                if (!current() || finished) return;
                if (!env.speechSynthesis || !env.SpeechSynthesisUtterance) { finish('error'); return; }
                // Speak immediately with en-US even if voices have not loaded yet.
                // Waiting on voiceschanged used to resurrect cancelled phrases.
                utterance = new env.SpeechSynthesisUtterance(clean);
                utterance.lang = 'en-US';
                utterance.rate = rate;
                const voices = env.speechSynthesis.getVoices();
                const english = voices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith('en'));
                const selected = english.find(v => v.lang.toLowerCase().replace('_', '-') === 'en-us' && /natural|google|jenny|aria|neural/i.test(v.name))
                    || english.find(v => v.lang.toLowerCase().replace('_', '-') === 'en-us') || english[0];
                if (selected) utterance.voice = selected;
                utterance.onend = () => { if (current()) finish('ended'); };
                utterance.onerror = () => { if (current()) finish('error'); };
                onState({ status: 'playing', source: 'browser', text: clean });
                try { env.speechSynthesis.speak(utterance); } catch { finish('error'); }
            }
            function playUrl(url) {
                if (!current() || finished) return;
                let fallbackUsed = false;
                const fallback = () => {
                    if (fallbackUsed || !current() || finished) return;
                    fallbackUsed = true;
                    if (audio) { audio.onended = audio.onerror = null; audio.pause(); audio = null; }
                    browserVoice();
                };
                try {
                    audio = new env.Audio(url);
                    audio.onended = () => { if (current()) finish('ended'); };
                    audio.onerror = fallback;
                    onState({ status: 'playing', source: 'neural', text: clean });
                    Promise.resolve(audio.play()).catch(error => {
                        if (!current() || finished) return;
                        if (error.name === 'NotAllowedError') finish('error');
                        else fallback();
                    });
                } catch { fallback(); }
            }
            if (cache.has(key)) {
                const url = cache.get(key);
                cache.delete(key); cache.set(key, url);
                playUrl(url);
                return;
            }
            onState({ status: 'loading', text: clean });
            controller = new env.AbortController();
            const request = controller;
            timer = env.setTimeout(() => {
                if (!current() || finished) return;
                request.abort();
                clearTimer();
                browserVoice();
            }, timeoutMs);
            env.fetch('/api/tts', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: request.signal,
                body: JSON.stringify({ text: clean, voice, rate: rateString }),
            }).then(async response => {
                if (!response.ok) throw new Error('TTS unavailable');
                const blob = await response.blob();
                if (!current() || finished || request.signal.aborted) return;
                clearTimer();
                if (!blob.size) throw new Error('Empty audio');
                const url = env.URL.createObjectURL(blob);
                cache.set(key, url);
                if (cache.size > cacheLimit) {
                    const oldest = cache.keys().next().value;
                    env.URL.revokeObjectURL(cache.get(oldest)); cache.delete(oldest);
                }
                playUrl(url);
            }).catch(() => {
                if (!current() || finished || request.signal.aborted) return;
                clearTimer(); browserVoice();
            });
        });
    }

    function dispose() { stop(); for (const url of cache.values()) env.URL.revokeObjectURL(url); cache.clear(); }
    return { play, stop, dispose };
}

export function automaticAudioEnabled() {
    try { return localStorage.getItem('vocabAutoAudio') === 'true'; } catch { return false; }
}

export const speechPlayer = createSpeechPlayer(globalThis, { onState: detail => {
    if (typeof document !== 'undefined') document.dispatchEvent(new CustomEvent('vocab:audio', { detail }));
} });

if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => { if (document.hidden) speechPlayer.stop(); });
    window.addEventListener('pagehide', () => speechPlayer.dispose());
}
