import type { APIRoute } from 'astro';
import { READING_CONFIG } from '../../data/reading-prompts';

const KEYS = [
    import.meta.env.GEMINI_API_KEY,
    import.meta.env.GEMINI_API_KEY_BACKUP
].filter(Boolean);

const BASE_URLS = [
    'https://generativelanguage.googleapis.com/v1beta/models',
    'https://generativelanguage.googleapis.com/v1/models'
];

const MODELS = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-pro',
    'google/gemini-pro', // OpenRouter model
    'google/gemini-2.0-flash-exp:free', // OpenRouter free model
    'deepseek/deepseek-chat', // OpenRouter DB
];

const OPENROUTER_KEY = import.meta.env.OPENROUTER_API_KEY;
if (OPENROUTER_KEY) {
    KEYS.push(OPENROUTER_KEY);
    BASE_URLS.push('https://openrouter.ai/api/v1/chat/completions');
}

export const POST: APIRoute = async ({ request }) => {
    if (KEYS.length === 0) {
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
                prompt = `Genera un diálogo simulando preguntas y respuestas detalladas en inglés (nivel ${level}) sobre el tema: "${topic || 'General'}".
        CRÍTICO: El diálogo debe ser extenso, con **8 a 12 intercambios** de ida y vuelta. Cada intervención debe ser **larga y detallada**, idealmente de 2 a 4 oraciones completas por turno, evitando respuestas y preguntas de una sola línea.
        CRÍTICO: NO uses el alfabeto fonético internacional (IPA). Para la fonética, debes escribir cómo se pronunciaría leyéndolo en ESPAÑOL (ejemplo: "believe" = "biliv", "hello how are you" = "jelou jau ar iu").
        Devuelve ÚNICAMENTE un objeto JSON con esta estructura exacta, sin texto adicional:
        {
            "title": "Título en Inglés (Traducción al Español)",
            "segments": [
                {
                    "speaker": "Personaje 1",
                    "english": "Hello, how are you preparing for the interview?",
                    "phonetic": "jelou, jau ar iu priperin for de interviu?",
                    "spanish": "Hola, ¿cómo te preparás para la entrevista?"
                }
            ],
            "difficultWords": [
                {"word": "Interview", "definition": "Entrevista", "example": "Job interview"}
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

        let lastError;
        let successfulResponse;
        let usedConfig = '';

        for (const key of KEYS) {
            if (successfulResponse) break;

            for (const baseUrl of BASE_URLS) {
                if (successfulResponse) break;

                for (const model of MODELS) {
                    if (successfulResponse) break;

                    try {
                        let url, body, isOpenRouter = false;

                        if (baseUrl.includes('openrouter') || baseUrl.includes('chat/completions')) {
                            isOpenRouter = true;
                            url = baseUrl; // OpenRouter uses the base URL directly
                            body = JSON.stringify({
                                model: model,
                                messages: [{ role: 'user', content: prompt }]
                            });
                        } else {
                            // Google Gemini API
                            url = `${baseUrl}/${model}:generateContent?key=${key}`;
                            body = JSON.stringify({
                                contents: [{ parts: [{ text: prompt }] }]
                            });
                        }

                        // console.log(`Attempting: ${model} on ${isOpenRouter ? 'OpenRouter' : 'Google API'}`);

                        const headers: any = { 'Content-Type': 'application/json' };
                        if (isOpenRouter) {
                            headers['Authorization'] = `Bearer ${key}`;
                            // Remove key param from URL if OpenRouter, though we built it cleanly above
                        }

                        const response = await fetch(url, {
                            method: 'POST',
                            headers: headers,
                            body: body
                        });

                        if (response.ok) {
                            successfulResponse = await response.json();
                            usedConfig = `${model} (${isOpenRouter ? 'OpenRouter' : 'Google'})`;
                            console.log(`Success with: ${usedConfig}`);
                            break;
                        } else {
                            const errorData = await response.json();
                            lastError = errorData;
                        }
                    } catch (e) {
                        lastError = e;
                    }
                }
            }
        }

        if (!successfulResponse) {
            return new Response(JSON.stringify({ error: 'All models/keys/versions failed', details: lastError }), { status: 500 });
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
