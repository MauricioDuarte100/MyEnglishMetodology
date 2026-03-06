export { renderers } from '../../renderers.mjs';

const READING_CONFIG = {
  prompts: {
    short: `Generate a short reading text in British English (3-4 paragraphs, around 150-200 words total).
Topic: Choose an interesting everyday topic like travel, food, culture, work-life balance, or social situations.
Style: Conversational and engaging, suitable for intermediate English learners.
Include 2-3 British English idioms or expressions naturally in the text.
Format: Return ONLY the text, no titles or explanations.`,
    long: `Generate a longer reading text in British English (10 paragraphs, around 600-800 words, 5-10 minute read).
Topic: Choose from: lifestyle, society, environment, technology impact on daily life, or cultural observations.
Style: Article-style, thought-provoking, suitable for upper-intermediate learners.
Include 5-8 British English idioms and expressions.
Include some advanced vocabulary words.
Format: Return a JSON object with:
{
  "text": "the full article text",
  "difficultWords": [
    {"word": "word1", "definition": "definition1", "example": "example sentence"},
    {"word": "word2", "definition": "definition2", "example": "example sentence"}
  ]
}
Include 8-12 difficult or advanced words in the difficultWords array.`,
    technical: `Generate a technical/business news article in British English (6-8 paragraphs, around 400-500 words).
Topic: Choose from: fintech innovation, cybersecurity trends, business strategy, market analysis, or digital transformation.
Style: Professional news article, factual yet accessible, suitable for business English learners.
Include relevant technical terminology and 3-5 British business expressions.
Format: Return a JSON object with:
{
  "text": "the full article text",
  "difficultWords": [
    {"word": "word1", "definition": "definition1", "example": "example sentence"},
    {"word": "word2", "definition": "definition2", "example": "example sentence"}
  ]
}
Include 6-10 technical or business terms in the difficultWords array.`,
    // Russian Prompts - STRUCTURED JSON ONLY
    short_ru: `Generate a short Russian story (A2 level) about everyday life.
        CRITICAL: The user CANNOT read Cyrillic well. You MUST provide phonetics and translation for EACH paragraph.
        Return strictly a JSON object with this structure:
        {
            "title": "Russian Title (English Translation)",
            "segments": [
                {
                    "russian": "Russian text for paragraph 1...",
                    "phonetic": "Phonetic transcription (e.g. priv-YET kak del-A)",
                    "spanish": "Spanish translation of this paragraph"
                },
                 {
                    "russian": "Russian text for paragraph 2...",
                    "phonetic": "...",
                    "spanish": "..."
                }
            ],
             "difficultWords": [
                {"word": "RussianWord", "definition": "Spanish Definition", "example": "Short example"}
             ]
        }`,
    long_ru: `Generate a Russian article (B1 level) about culture or travel.
         CRITICAL: The user CANNOT read Cyrillic well. You MUST provide phonetics and translation for EACH paragraph.
        Return strictly a JSON object with this structure:
        {
            "title": "Russian Title (English Translation)",
             "segments": [
                {
                    "russian": "Russian text for paragraph 1...",
                    "phonetic": "Phonetic transcription (e.g. priv-YET kak del-A)",
                    "spanish": "Spanish translation of this paragraph"
                }
            ],
             "difficultWords": [
                {"word": "RussianWord", "definition": "Spanish Definition", "example": "Short example"}
             ]
        }`,
    technical_ru: `Generate a simple technical/work scenario in Russian (B1 level).
         CRITICAL: The user CANNOT read Cyrillic well. You MUST provide phonetics and translation for EACH paragraph.
        Return strictly a JSON object with this structure:
        {
            "title": "Russian Title (English Translation)",
             "segments": [
                {
                    "russian": "Russian text for paragraph 1...",
                    "phonetic": "Phonetic transcription (e.g. priv-YET kak del-A)",
                    "spanish": "Spanish translation of this paragraph"
                }
            ],
             "difficultWords": [
                {"word": "RussianWord", "definition": "Spanish Definition", "example": "Short example"}
             ]
        }`
  }
};

const KEYS = [
  "AIzaSyCQ3U3oc7rivpVwIbvWaJYTfgqFEMOnk0I",
  "AIzaSyBKK1RY90MGqX4W03PHmxIn6FGwvG5S8iQ"
].filter(Boolean);
const BASE_URLS = [
  "https://generativelanguage.googleapis.com/v1beta/models",
  "https://generativelanguage.googleapis.com/v1/models"
];
const MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash-exp",
  "gemini-pro",
  "google/gemini-pro",
  // OpenRouter model
  "google/gemini-2.0-flash-exp:free",
  // OpenRouter free model
  "deepseek/deepseek-chat"
  // OpenRouter DB
];
const OPENROUTER_KEY = "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";
{
  KEYS.push(OPENROUTER_KEY);
  BASE_URLS.push("https://openrouter.ai/api/v1/chat/completions");
}
const POST = async ({ request }) => {
  if (KEYS.length === 0) {
    return new Response(JSON.stringify({ error: "No API keys configured" }), { status: 500 });
  }
  try {
    const body = await request.json();
    const { category, language, topic, level } = body;
    let prompt = "";
    if (category === "custom") {
      if (language === "ru") {
        prompt = `Genera un diálogo simulando preguntas y respuestas detalladas en ruso (nivel ${level}) sobre el tema: "${topic || "General"}".
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
        prompt = `Genera un diálogo simulando preguntas y respuestas detalladas en inglés (nivel ${level}) sobre el tema: "${topic || "General"}".
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
      if (language === "ru") {
        promptKey = `${category}_ru`;
      }
      if (!promptKey || !READING_CONFIG.prompts[promptKey]) {
        return new Response(JSON.stringify({ error: "Invalid category or language config" }), { status: 400 });
      }
      prompt = READING_CONFIG.prompts[promptKey];
    }
    let lastError;
    let successfulResponse;
    let usedConfig = "";
    for (const key of KEYS) {
      if (successfulResponse) break;
      for (const baseUrl of BASE_URLS) {
        if (successfulResponse) break;
        for (const model of MODELS) {
          if (successfulResponse) break;
          try {
            let url, body2, isOpenRouter = false;
            if (baseUrl.includes("openrouter") || baseUrl.includes("chat/completions")) {
              isOpenRouter = true;
              url = baseUrl;
              body2 = JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }]
              });
            } else {
              url = `${baseUrl}/${model}:generateContent?key=${key}`;
              body2 = JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
              });
            }
            const headers = { "Content-Type": "application/json" };
            if (isOpenRouter) {
              headers["Authorization"] = `Bearer ${key}`;
            }
            const response = await fetch(url, {
              method: "POST",
              headers,
              body: body2
            });
            if (response.ok) {
              successfulResponse = await response.json();
              usedConfig = `${model} (${isOpenRouter ? "OpenRouter" : "Google"})`;
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
      return new Response(JSON.stringify({ error: "All models/keys/versions failed", details: lastError }), { status: 500 });
    }
    let generatedText;
    if (successfulResponse.choices && successfulResponse.choices[0]?.message?.content) {
      generatedText = successfulResponse.choices[0].message.content;
    } else if (successfulResponse.candidates && successfulResponse.candidates[0]?.content?.parts?.[0]?.text) {
      generatedText = successfulResponse.candidates[0].content.parts[0].text;
    }
    if (!generatedText) {
      return new Response(JSON.stringify({ error: "No text generated", debug: successfulResponse }), { status: 500 });
    }
    let result;
    const jsonMatch = generatedText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    try {
      let cleanContent = jsonMatch ? jsonMatch[0] : generatedText;
      const parsed = JSON.parse(cleanContent.trim());
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
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({ error: "Server error", details: String(error) }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
