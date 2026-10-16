import type { APIRoute } from 'astro';
import { Communicate } from 'edge-tts-universal';

const audioCache = new Map<string, { data: Uint8Array; expires: number }>();
let cacheBytes = 0;
const errorResponse = (error: string, status = 400) => new Response(JSON.stringify({ error }), { status, headers: { 'Content-Type': 'application/json' } });
const audioResponse = (data: Uint8Array) => new Response(data, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'private, max-age=300' } });

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json().catch(() => null);
        if (!body || typeof body.text !== 'string') return errorResponse('Se necesita un texto para pronunciar.');
        const rawText = body.text.trim();
        const voice = body.voice ?? 'en-US-JennyNeural';
        const rate = body.rate ?? '+0%';
        if (body.provider && body.provider !== 'edge') return errorResponse('Proveedor de voz no disponible.');
        if (rawText.length > 2500) return errorResponse('Divide el texto en frases más cortas.');
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
        const cacheKey = JSON.stringify([cleanText, voice, rate]);
        for (const [key, entry] of audioCache) {
            if (entry.expires <= Date.now()) { cacheBytes -= entry.data.byteLength; audioCache.delete(key); }
        }
        const cached = audioCache.get(cacheKey);
        if (cached) { audioCache.delete(cacheKey); audioCache.set(cacheKey, cached); return audioResponse(cached.data); }

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
            audioCache.set(cacheKey, { data: audioBuffer, expires: Date.now() + 300000 });
            cacheBytes += audioBuffer.byteLength;
        }
        return audioResponse(audioBuffer);
    } catch (error: any) {
        console.warn('Neural pronunciation unavailable:', error?.name || 'ProviderError');
        return errorResponse('La voz neural no está disponible. Usa la voz del navegador.', 503);
    }
};
