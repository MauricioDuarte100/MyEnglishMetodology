import type { APIRoute } from 'astro';
import { Communicate } from 'edge-tts-universal';

const audioCache = new Map<string, { data: Uint8Array; mime: string; expires: number }>();
let cacheBytes = 0;
const errorResponse = (error: string, status = 400) => new Response(JSON.stringify({ error }), { status, headers: { 'Content-Type': 'application/json' } });
const audioResponse = (data: Uint8Array, mime = 'audio/mpeg') => new Response(data, { headers: { 'Content-Type': mime, 'Cache-Control': 'private, max-age=300' } });

async function generateNaturalAudio(text: string, signal: AbortSignal): Promise<Uint8Array> {
    const keys = [import.meta.env.GEMINI_API_KEY, import.meta.env.GEMINI_API_KEY_BACKUP].filter(Boolean);
    if (!keys.length) throw new Error('Gemini key unavailable');
    for (const key of keys) {
        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-lite-tts:generateContent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
                signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]),
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text, speech_metadata: { style: 'warm, clear, conversational American English' } }] }],
                    generationConfig: {
                        responseModalities: ['AUDIO'],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Sulafat' } } },
                    },
                }),
            });
            if (!response.ok) throw new Error(`Gemini TTS status ${response.status}`);
            const result = await response.json();
            const audio = result.candidates?.[0]?.content?.parts?.find((part: { inlineData?: { mimeType?: string; data?: string } }) => part.inlineData?.data)?.inlineData;
            if (audio?.mimeType !== 'audio/wav' || !audio.data) throw new Error('Gemini TTS returned no WAV audio');
            return Uint8Array.from(Buffer.from(audio.data, 'base64'));
        } catch (error) {
            if (signal.aborted) throw error;
        }
    }
    throw new Error('Gemini TTS unavailable');
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json().catch(() => null);
        if (!body || typeof body.text !== 'string') return errorResponse('Se necesita un texto para pronunciar.');
        const rawText = body.text.trim();
        const voice = body.voice ?? 'en-US-JennyNeural';
        const rate = body.rate ?? '+0%';
        const provider = body.provider ?? 'edge';
        if (rawText.length > 2500) return errorResponse('Divide el texto en frases más cortas.');
        if (!['edge', 'gemini'].includes(provider)) return errorResponse('Proveedor de voz no disponible.');
        if (provider === 'gemini' && rawText.length > 320) return errorResponse('Divide el texto en frases más cortas.');
        if (!['en-US-JennyNeural', 'en-US-GuyNeural'].includes(voice)) return errorResponse('Voz no disponible.');
        if (typeof rate !== 'string' || !/^[+-]\d{1,2}%$/.test(rate) || Math.abs(parseInt(rate)) > 50) return errorResponse('Velocidad no válida.');

        if (!rawText) {
            return new Response(JSON.stringify({ error: 'Text is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Clean text from Markdown or unnatural punctuation
        const cleanText = rawText.replace(/[*_#`[\]]/g, '').trim();
        if (!cleanText) return errorResponse('Se necesita un texto para pronunciar.');
        const cacheKey = JSON.stringify([cleanText, voice, rate, provider]);
        for (const [key, entry] of audioCache) {
            if (entry.expires <= Date.now()) { cacheBytes -= entry.data.byteLength; audioCache.delete(key); }
        }
        const cached = audioCache.get(cacheKey);
        if (cached) { audioCache.delete(cacheKey); audioCache.set(cacheKey, cached); return audioResponse(cached.data, cached.mime); }

        if (provider === 'gemini') {
            const audio = await generateNaturalAudio(cleanText, request.signal);
            if (audio.byteLength <= 3 * 1024 * 1024) {
                while (audioCache.size && (cacheBytes + audio.byteLength > 3 * 1024 * 1024 || audioCache.size >= 40)) {
                    const oldest = audioCache.keys().next().value!;
                    cacheBytes -= audioCache.get(oldest)!.data.byteLength; audioCache.delete(oldest);
                }
                audioCache.set(cacheKey, { data: audio, mime: 'audio/wav', expires: Date.now() + 300000 });
                cacheBytes += audio.byteLength;
            }
            return audioResponse(audio, 'audio/wav');
        }

        const communicate = new Communicate(cleanText, {
            voice,
            rate,
            connectionTimeout: 3000,
        });

        const chunks: Uint8Array[] = [];
        for await (const chunk of communicate.stream()) {
            if (request.signal.aborted) return new Response(null, { status: 499 });
            if (chunk.type === 'audio' && chunk.data) {
                chunks.push(chunk.data);
            }
        }

        if (chunks.length === 0) {
            return new Response(JSON.stringify({ error: 'No audio data received from neural synthesizer' }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const audioBuffer = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            audioBuffer.set(chunk, offset);
            offset += chunk.length;
        }

        if (audioBuffer.byteLength <= 3 * 1024 * 1024) {
            const previous = audioCache.get(cacheKey);
            if (previous) { cacheBytes -= previous.data.byteLength; audioCache.delete(cacheKey); }
            while (audioCache.size && (cacheBytes + audioBuffer.byteLength > 3 * 1024 * 1024 || audioCache.size >= 40)) {
                const oldest = audioCache.keys().next().value!;
                cacheBytes -= audioCache.get(oldest)!.data.byteLength; audioCache.delete(oldest);
            }
            audioCache.set(cacheKey, { data: audioBuffer, mime: 'audio/mpeg', expires: Date.now() + 300000 });
            cacheBytes += audioBuffer.byteLength;
        }
        return audioResponse(audioBuffer);
    } catch (error: any) {
        console.warn('Neural pronunciation unavailable:', error?.name || 'ProviderError');
        return errorResponse('La voz neural no está disponible. Usa la voz del navegador.', 503);
    }
};
