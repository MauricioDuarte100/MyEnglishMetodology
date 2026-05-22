import type { APIRoute } from 'astro';
import { READING_CONFIG } from '../../data/reading-prompts';

const GEMINI_KEYS = [
    import.meta.env.GEMINI_API_KEY,
    import.meta.env.GEMINI_API_KEY_BACKUP
].filter(Boolean);

const GEMINI_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash-latest',
];

const OPENROUTER_KEY = import.meta.env.OPENROUTER_API_KEY;
const OPENROUTER_MODELS = [
    'google/gemini-2.5-flash',
    'google/gemini-2.0-flash-001',
    'deepseek/deepseek-chat',
];

type ProviderError = {
    provider: string;
    model: string;
    status?: number;
    message: string;
};

export const POST: APIRoute = async ({ request }) => {
    if (GEMINI_KEYS.length === 0 && !OPENROUTER_KEY) {
        return new Response(JSON.stringify({ error: 'No API keys configured' }), { status: 500 });
    }

    try {
        const body = await request.json();
        const { category, language, topic, level } = body;

        let prompt = '';
        if (category === 'custom') {
            if (language === 'ru') {
                prompt = `Genera un diálogo simulando preguntas y respuestas detalladas en ruso (nivel ${level}) sobre el tema: "${topic || 'General'}".
        CRÍTICO: El diálogo debe ser extenso, con **8 a 12 intercambios** entre dos o más personajes. Las intervenciones (preguntas y respuestas) no deben ser oraciones cortas, sino **respuestas y explicaciones largas**, con al menos 2 o 3 oraciones completas por turno.
        CRÍTICO: El usuario no sabe leer cirílico bien. Debes escribir la pronunciación fonética como se leería en ESPAÑOL (ejemplo: "privet" = "priviet", "kak dela" = "kak dila"). NO USES IPA.
        Devuelve ÚNICAMENTE un objeto JSON con esta estructura exacta, sin texto adicional:
        {
            "title": "Título en Ruso (Traducción al Español)",
            "segments": [
                {
                    "speaker": "Personaje 1",
                    "russian": "Привет, как дела?",
                    "phonetic": "Priviet, kak dila?",
                    "spanish": "Hola, ¿cómo estás?"
                }
            ],
            "difficultWords": [
                {"word": "Привет", "definition": "Hola", "example": "Привет, Анна"}
            ]
        }`;
            } else {
                prompt = `Genera un diálogo de práctica en inglés americano coloquial (nivel ${level}) sobre el tema: "${topic || 'General'}".
        OBJETIVO: enseñar vocabulario frecuente, escucha real, gramática simple y pronunciación práctica para una persona hispanohablante.
        TONO: natural, juvenil y urbano de Estados Unidos, con contracciones reales como gonna, wanna, gotta, ain't, lemme, tryna, kinda, chillin'. Evita caricaturizar dialectos o glorificar violencia; usa el registro como entrenamiento de oído cotidiano.
        CRÍTICO: El diálogo debe tener 8 a 12 intercambios. Cada intervención debe tener 2 a 4 oraciones completas, mezclando frases cortas naturales con explicaciones útiles.
        CRÍTICO: NO uses IPA. La fonética debe estar escrita como se leería en ESPAÑOL, con acento americano urbano y palabras conectadas. Ejemplos: "What are you going to do?" = "wára iu góna du?", "I ain't got time" = "ai eint gat taim", "believe" = "biliv".
        CRÍTICO: La traducción al español debe sonar natural, no literal palabra por palabra.
        Devuelve ÚNICAMENTE un objeto JSON con esta estructura exacta, sin texto adicional:
        {
            "title": "Título en Inglés (Traducción al Español)",
            "segments": [
                {
                    "speaker": "Personaje 1",
                    "english": "Yo, what are you doing? I ain't got time.",
                    "phonetic": "iou, wára iu dú-in? ai eint gat taim.",
                    "spanish": "Oye, ¿qué estás haciendo? No tengo tiempo."
                }
            ],
            "difficultWords": [
                {"word": "gonna", "definition": "forma coloquial de going to / voy a", "example": "I'm gonna call you later."},
                {"word": "ain't", "definition": "negación coloquial: am not / is not / are not / have not", "example": "I ain't ready yet."}
            ]
        }`;
            }
        } else {
            let promptKey = category;
            if (language === 'ru') {
                promptKey = `${category}_ru`;
            }

            if (!promptKey || !READING_CONFIG.prompts[promptKey as keyof typeof READING_CONFIG.prompts]) {
                return new Response(JSON.stringify({ error: 'Invalid category or language config' }), { status: 400 });
            }

            prompt = READING_CONFIG.prompts[promptKey as keyof typeof READING_CONFIG.prompts];
        }

        let successfulResponse;
        let usedConfig = '';
        const errors: ProviderError[] = [];

        for (const key of GEMINI_KEYS) {
            for (const model of GEMINI_MODELS) {
                if (successfulResponse) break;

                try {
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: {
                                responseMimeType: 'application/json',
                                temperature: 0.8
                            }
                        })
                    });

                    if (response.ok) {
                        successfulResponse = await response.json();
                        usedConfig = `${model} (Google Gemini)`;
                        console.log(`Success with: ${usedConfig}`);
                        break;
                    }

                    const errorData = await safeJson(response);
                    errors.push({
                        provider: 'Google Gemini',
                        model,
                        status: response.status,
                        message: getErrorMessage(errorData)
                    });
                } catch (e) {
                    errors.push({
                        provider: 'Google Gemini',
                        model,
                        message: String(e)
                    });
                }
            }
        }

        if (!successfulResponse && OPENROUTER_KEY) {
            for (const model of OPENROUTER_MODELS) {
                if (successfulResponse) break;

                try {
                    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${OPENROUTER_KEY}`,
                            'HTTP-Referer': request.headers.get('origin') || 'http://localhost:4321',
                            'X-Title': 'VOCAB English Learning'
                        },
                        body: JSON.stringify({
                            model,
                            messages: [{ role: 'user', content: prompt }],
                            temperature: 0.8,
                            response_format: { type: 'json_object' }
                        })
                    });

                    if (response.ok) {
                        successfulResponse = await response.json();
                        usedConfig = `${model} (OpenRouter)`;
                        console.log(`Success with: ${usedConfig}`);
                        break;
                    }

                    const errorData = await safeJson(response);
                    errors.push({
                        provider: 'OpenRouter',
                        model,
                        status: response.status,
                        message: getErrorMessage(errorData)
                    });
                } catch (e) {
                    errors.push({
                        provider: 'OpenRouter',
                        model,
                        message: String(e)
                    });
                }
            }
        }

        if (!successfulResponse) {
            return new Response(JSON.stringify({
                error: 'No se pudo generar el texto con las API keys configuradas',
                details: errors.slice(-6)
            }), { status: 500 });
        }

        let generatedText;
        // Handle different response formats
        if (successfulResponse.choices && successfulResponse.choices[0]?.message?.content) {
            // OpenRouter / OpenAI format
            generatedText = successfulResponse.choices[0].message.content;
        } else if (successfulResponse.candidates && successfulResponse.candidates[0]?.content?.parts?.[0]?.text) {
            // Google Gemini format
            generatedText = successfulResponse.candidates[0].content.parts[0].text;
        }

        if (!generatedText) {
            return new Response(JSON.stringify({ error: 'No text generated', debug: successfulResponse }), { status: 500 });
        }

        // Process output
        let result;
        const jsonMatch = generatedText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);

        try {
            let cleanContent = jsonMatch ? jsonMatch[0] : generatedText;
            const parsed = JSON.parse(cleanContent.trim());

            // Handle both legacy (text) and new (segments) formats
            if (parsed.segments) {
                result = parsed;
            } else {
                result = {
                    text: parsed.text,
                    difficultWords: parsed.difficultWords || []
                };
            }
        } catch (e) {
            result = { text: generatedText.trim(), difficultWords: [] };
        }

        return new Response(JSON.stringify({ ...result, _debug_config: usedConfig }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Server error:', error);
        return new Response(JSON.stringify({ error: 'Server error', details: String(error) }), { status: 500 });
    }
}

async function safeJson(response: Response) {
    try {
        return await response.json();
    } catch {
        return { error: await response.text() };
    }
}

function getErrorMessage(errorData: any) {
    return errorData?.error?.message || errorData?.message || JSON.stringify(errorData);
}
