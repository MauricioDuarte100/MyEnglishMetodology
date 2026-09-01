import type { APIRoute } from 'astro';
import { Communicate } from 'edge-tts-universal';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const rawText = (body.text || '').trim();
        const voice = body.voice || 'en-US-JennyNeural'; // High-definition, crystal-clear American English voice
        const rate = body.rate || '+0%';

        if (!rawText) {
            return new Response(JSON.stringify({ error: 'Text is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Clean text from Markdown or unnatural punctuation
        const cleanText = rawText.replace(/[*_#`[\]]/g, '').trim();

        const communicate = new Communicate(cleanText, {
            voice,
            rate
        });

        const chunks: Uint8Array[] = [];
        for await (const chunk of communicate.stream()) {
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

        return new Response(audioBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=604800, s-maxage=604800, immutable'
            }
        });
    } catch (error: any) {
        console.error('Edge Neural TTS error:', error);
        return new Response(JSON.stringify({ error: error.message || 'TTS generation failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
