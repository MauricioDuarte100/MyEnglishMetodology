export const READING_CONFIG = {
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
