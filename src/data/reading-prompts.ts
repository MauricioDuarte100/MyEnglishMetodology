export const READING_CONFIG = {
    prompts: {
        short: `Generate a short reading text in American English (3-4 paragraphs, around 150-200 words total).
Topic: Choose an interesting everyday topic like travel, food, culture, work-life balance, or social situations.
Style: Conversational and engaging, suitable for intermediate English learners, with an urban/street vibe.
Include 2-3 American urban English idioms or rap/trap slang naturally in the text.
Format: Return ONLY the text, no titles or explanations.`,

        long: `Generate a longer reading text in American English (10 paragraphs, around 600-800 words, 5-10 minute read).
Topic: Choose from: urban lifestyle, society, music (rap/hip-hop culture), street fashion, or cultural observations in cities like New York or Chicago.
Style: Article-style, thought-provoking, suitable for upper-intermediate learners with a focus on flow and rhythm.
Include 5-8 American urban expressions and slang.
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

        technical: `Generate a technical/lifestyle text in American English (6-8 paragraphs, around 400-500 words).
Topic: Choose from: music production, streetwear business, urban culture trends, or hustle/grind mentality.
Style: Professional but authentic streetwear/music business article, suitable for real-world English learners.
Include relevant industry terminology and 3-5 common American slang abbreviations (e.g. gonna, wanna, clout, drip).
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
