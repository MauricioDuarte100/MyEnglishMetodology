import { KokoroTTS } from 'kokoro-js';

let modelPromise;
let latestId = 0;
let queue = Promise.resolve();

async function synthesize({ id, text, rate }) {
    try {
        modelPromise ??= KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
            dtype: 'q8',
            device: 'wasm',
            progress_callback: progress => {
                if (id === latestId && progress.status === 'progress') {
                    self.postMessage({ id, type: 'progress', progress: progress.progress });
                }
            },
        });
        const tts = await modelPromise;
        if (id !== latestId) return;
        const audio = await tts.generate(text, { voice: 'af_heart', speed: rate });
        if (id === latestId) self.postMessage({ id, type: 'audio', blob: audio.toBlob() });
    } catch {
        modelPromise = undefined;
        if (id === latestId) self.postMessage({ id, type: 'error' });
    }
}

self.onmessage = ({ data }) => {
    latestId = data.id;
    queue = queue.then(() => synthesize(data));
};
