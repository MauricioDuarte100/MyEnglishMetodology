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
        return new Response(JSON.stringify({ error: 'No hay claves de API configuradas en el servidor.' }), { status: 500 });
    }

    try {
        const body = await request.json();
        const { category, topic, level } = body;

        let prompt = '';
        if (category === 'custom' || !category) {
            prompt = `Genera un diálogo interactivo de práctica en inglés americano coloquial y natural (nivel CEFR ${level || 'intermedio B1-B2'}) sobre el tema: "${topic || 'Situación cotidiana o laboral'}".
OBJETIVO PEDAGÓGICO: Desarrollar oído real, vocabulario de alta frecuencia, expresiones idiomáticas y soltura conversacional para hispanohablantes.
ESTILO Y TONO: Inglés americano auténtico y moderno, con contracciones naturales como gonna, wanna, gotta, kinda, chillin', I mean, you know, no problem, got it.

REQUISITOS OBLIGATORIOS:
1. El diálogo debe tener entre 6 y 10 intervenciones alternadas entre dos o más personajes.
2. Cada intervención debe tener 1 a 3 oraciones completas y realistas.
3. La pronunciación fonética ("phonetic") debe estar escrita como se pronunciaría en ESPAÑOL latino (NO uses símbolos IPA complejos). Ejemplos: "What are you up to?" -> "wát ar iu áp tu?", "I'm gonna grab some coffee" -> "aim góna grab sam cófi".
4. La traducción al español ("spanish") debe sonar natural y conversacional, no robótica palabra por palabra.
5. Incluye una lista de 4 a 8 palabras o modismos clave ("difficultWords") con su explicación en español y ejemplo.

Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta, sin bloques markdown de texto alrededor:
{
    "title": "Título en Inglés (Traducción en Español)",
    "segments": [
        {
            "speaker": "Nombre / Rol",
            "english": "Oración en inglés real...",
            "phonetic": "Guía de pronunciación fonética en español...",
            "spanish": "Traducción natural al español..."
        }
    ],
    "difficultWords": [
        {
            "word": "expresión/palabra",
            "definition": "Significado y uso en español",
            "example": "Ejemplo corto en inglés"
        }
    ]
}`;
        } else {
            const promptKey = category as keyof typeof READING_CONFIG.prompts;
            if (!READING_CONFIG.prompts[promptKey]) {
                return new Response(JSON.stringify({ error: 'Categoría de lectura no válida' }), { status: 400 });
            }
            prompt = READING_CONFIG.prompts[promptKey];
        }

        let successfulResponse;
        let usedConfig = '';
        const errors: ProviderError[] = [];

        // 1. Try Gemini Keys
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
                                temperature: 0.75
                            }
                        })
                    });

                    if (response.ok) {
                        successfulResponse = await response.json();
                        usedConfig = `${model} (Google Gemini)`;
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

        // 2. Try OpenRouter Fallback
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
                            temperature: 0.75,
                            response_format: { type: 'json_object' }
                        })
                    });

                    if (response.ok) {
                        successfulResponse = await response.json();
                        usedConfig = `${model} (OpenRouter)`;
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
                error: 'No se pudo generar el contenido con las API keys disponibles.',
                details: errors.slice(-4)
            }), { status: 500 });
        }

        let generatedText = '';
        if (successfulResponse.choices && successfulResponse.choices[0]?.message?.content) {
            generatedText = successfulResponse.choices[0].message.content;
        } else if (successfulResponse.candidates && successfulResponse.candidates[0]?.content?.parts?.[0]?.text) {
            generatedText = successfulResponse.candidates[0].content.parts[0].text;
        }

        if (!generatedText) {
            return new Response(JSON.stringify({ error: 'Respuesta vacía del modelo de IA.' }), { status: 500 });
        }

        // Parse JSON output safely
        let result;
        const jsonMatch = generatedText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);

        try {
            const cleanContent = jsonMatch ? jsonMatch[0] : generatedText;
            const parsed = JSON.parse(cleanContent.trim());

            if (parsed.segments) {
                result = parsed;
            } else if (parsed.text) {
                result = {
                    title: parsed.title || 'Practice Reading',
                    text: parsed.text,
                    difficultWords: parsed.difficultWords || []
                };
            } else {
                result = parsed;
            }
        } catch (e) {
            result = {
                title: 'Dialogue Practice',
                text: generatedText.trim(),
                difficultWords: []
            };
        }

        return new Response(JSON.stringify({ ...result, _model: usedConfig }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Server error in /api/generate:', error);
        return new Response(JSON.stringify({ error: 'Error interno en el servidor', details: String(error) }), { status: 500 });
    }
};

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
