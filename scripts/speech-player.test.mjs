import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpeechPlayer } from '../src/scripts/speech-player.js';
import { normalizeAnswer, getArenaLevel, localDay, recordTrainingAction, getTrainingProgress } from '../src/scripts/training-progress.js';

function harness(options = {}) {
    const requests = [], played = [], voices = [], revoked = [], states = [];
    const env = {
        AbortController, setTimeout, clearTimeout,
        document: { visibilityState: 'visible' },
        URL: { createObjectURL: blob => `blob:${blob.name}`, revokeObjectURL: url => revoked.push(url) },
        fetch: (url, init) => new Promise((resolve, reject) => requests.push({ init, resolve, reject })),
        Audio: class {
            constructor(url) { this.url = url; }
            play() { played.push(this); return options.rejectPlay ? Promise.reject(new Error('decoder failed')) : Promise.resolve(); }
            pause() { this.paused = true; }
        },
        SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
        speechSynthesis: { getVoices: () => [], cancel: () => {}, speak: utterance => voices.push(utterance) },
    };
    const player = createSpeechPlayer(env, { timeoutMs: options.timeoutMs || 1000, cacheLimit: options.cacheLimit || 2, onState: state => states.push(state) });
    const completeRequest = async (index, name) => {
        requests[index].resolve({ ok: true, blob: async () => ({ name, size: 8 }) });
        await new Promise(resolve => setImmediate(resolve));
    };
    return { env, player, requests, played, voices, revoked, states, completeRequest };
}

test('only the latest requested word can start speaking, even when fetch ignores abort', async () => {
    const h = harness(); const first = h.player.play('first'); const second = h.player.play('second');
    assert.equal(await first, 'cancelled'); assert.equal(h.requests[0].init.signal.aborted, true);
    await h.completeRequest(1, 'second'); await h.completeRequest(0, 'first');
    assert.deepEqual(h.played.map(audio => audio.url), ['blob:second']);
    h.played[0].onended(); assert.equal(await second, 'ended'); h.player.dispose();
});
test('stop cancels an in-flight response without invoking fallback or end callbacks', async () => {
    const h = harness(); let ended = false;
    const play = h.player.play('stop me', { onEnd: () => ended = true }); h.player.stop();
    await h.completeRequest(0, 'late');
    assert.equal(await play, 'cancelled'); assert.equal(h.played.length, 0); assert.equal(h.voices.length, 0); assert.equal(ended, false);
});
test('a late audio rejection cannot restart a replaced phrase', async () => {
    const h = harness(); let reject;
    h.env.Audio = class { play() { return new Promise((resolve, fail) => reject = fail); } pause() {} };
    const first = h.player.play('old'); await h.completeRequest(0, 'old');
    const second = h.player.play('new'); reject(new Error('late failure'));
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(h.voices.length, 0); assert.equal(await first, 'cancelled'); h.player.stop(); assert.equal(await second, 'cancelled');
});
test('a slow request falls back once and ignores its eventual audio', async () => {
    const h = harness({ timeoutMs: 15 }); const play = h.player.play('slow');
    await new Promise(resolve => setTimeout(resolve, 35));
    assert.equal(h.requests[0].init.signal.aborted, true); assert.equal(h.voices.length, 1);
    await h.completeRequest(0, 'late'); assert.equal(h.played.length, 0);
    h.voices[0].onend(); assert.equal(await play, 'ended'); h.player.dispose();
});

test('grammar playback keeps the neural voice or reports an error without a robotic fallback', async () => {
    const slow = harness({ timeoutMs: 15 });
    const pending = slow.player.play('I have worked here.', { neuralOnly: true });
    assert.equal(await pending, 'error');
    assert.equal(slow.voices.length, 0);
    assert.equal(slow.requests[0].init.signal.aborted, true);

    const failedAudio = harness({ rejectPlay: true });
    const playback = failedAudio.player.play('I have worked here.', { neuralOnly: true });
    await failedAudio.completeRequest(0, 'sentence');
    assert.equal(await playback, 'error');
    assert.equal(failedAudio.voices.length, 0);
});

test('local neural speech never calls the paid TTS endpoint and ignores superseded clips', async () => {
    const h = harness();
    const posted = [];
    const worker = { postMessage: message => posted.push(message), terminate() {} };
    const player = createSpeechPlayer(h.env, { workerFactory: () => worker });
    const first = player.play('first', { provider: 'kokoro', neuralOnly: true });
    const second = player.play('second', { provider: 'kokoro', neuralOnly: true });
    assert.equal(await first, 'cancelled');
    assert.equal(h.requests.length, 0);
    worker.onmessage({ data: { id: posted[0].id, type: 'audio', blob: { name: 'old' } } });
    assert.equal(h.played.length, 0);
    worker.onmessage({ data: { id: posted[1].id, type: 'audio', blob: { name: 'new' } } });
    assert.deepEqual(h.played.map(audio => audio.url), ['blob:new']);
    h.played[0].onended();
    assert.equal(await second, 'ended');
    player.dispose();
});
test('unavailable voices do not create a delayed voiceschanged handler', async () => {
    const h = harness(); const play = h.player.play('fallback'); h.requests[0].reject(new Error('offline'));
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(h.voices[0].lang, 'en-US'); assert.equal(h.env.speechSynthesis.onvoiceschanged, undefined);
    const lateEnd = h.voices[0].onend; h.player.stop(); lateEnd(); assert.equal(await play, 'cancelled');
});
test('cache avoids duplicate requests and releases evicted audio URLs', async () => {
    const h = harness({ cacheLimit: 1 });
    const one = h.player.play('one'); await h.completeRequest(0, 'one'); h.played[0].onended(); await one;
    const again = h.player.play('one'); assert.equal(h.requests.length, 1); h.played[1].onended(); await again;
    const two = h.player.play('two'); await h.completeRequest(1, 'two');
    assert.deepEqual(h.revoked, ['blob:one']); h.player.dispose(); assert.equal(await two, 'cancelled'); assert.deepEqual(h.revoked, ['blob:one', 'blob:two']);
});
test('a hidden page cannot initiate pronunciation', async () => {
    const h = harness(); h.env.document.visibilityState = 'hidden';
    assert.equal(await h.player.play('hidden'), 'cancelled'); assert.equal(h.requests.length, 0);
});
test('dictation requires the whole sentence and tolerates casing and punctuation', () => {
    assert.equal(normalizeAnswer('  I work here! '), normalizeAnswer('I work here.'));
    assert.notEqual(normalizeAnswer('work'), normalizeAnswer('I work here.'));
    assert.notEqual(normalizeAnswer("we're ready"), normalizeAnswer('were ready'));
});
test('level thresholds are based on earned XP, with no invented leaderboard rank', () => {
    assert.equal(getArenaLevel(499).level, 1); assert.equal(getArenaLevel(500).level, 2);
    assert.equal(getArenaLevel(7000).level, 5); assert.equal(getArenaLevel(0).percentile, 'Progresión personal');
});
test('daily targets use the local calendar day', () => {
    const date = new Date(2026, 9, 13, 23, 45); assert.equal(localDay(date), '2026-10-13');
});
test('self-assessment does not inflate precision and duplicate words do not inflate the daily goal', () => {
    const storage = new Map();
    const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) } });
    Object.defineProperty(globalThis, 'document', { configurable: true, value: { dispatchEvent() {} } });
    try {
        recordTrainingAction('flashcard', undefined, 'core:work');
        assert.equal(getTrainingProgress().answers, 0);
        recordTrainingAction('quiz', true, 'core:work');
        recordTrainingAction('typing', true, 'core:work');
        recordTrainingAction('quiz', false, 'core:read');
        const progress = getTrainingProgress();
        assert.equal(progress.answers, 3); assert.equal(progress.correct, 2);
        assert.equal(progress.today.correctKeys.length, 1); assert.equal(progress.bestCombo, 2); assert.equal(progress.combo, 0);
    } finally {
        if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage); else delete globalThis.localStorage;
        if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument); else delete globalThis.document;
    }
});
