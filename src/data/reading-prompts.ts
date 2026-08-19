export const READING_CONFIG = {
    prompts: {
        short: `Generate a short conversational reading text in American English (3-4 paragraphs, around 150-200 words total).
Topic: Choose an interesting everyday topic like travel, food, work-life balance, technology, or social situations.
Style: Natural, conversational, and engaging for intermediate English learners, with common everyday American idioms.
Format: Return a JSON object with:
{
  "title": "Title in English (Traducción en Español)",
  "segments": [
    {
      "speaker": "Speaker Name",
      "english": "Paragraph or dialogue line in English...",
      "phonetic": "Pronunciation written phonetically for Spanish speakers (e.g. wát ar iu dú-in?)",
      "spanish": "Natural Spanish translation of this segment"
    }
  ],
  "difficultWords": [
    {"word": "word1", "definition": "Spanish definition + English explanation", "example": "example sentence"}
  ]
}`,

        long: `Generate an engaging article in American English (6-8 paragraphs, around 400-500 words).
Topic: Urban culture, modern tech, career growth, life habits, or cultural insights in cities like New York, Austin, or San Francisco.
Style: Thought-provoking, modern prose with natural flow, idioms, and useful vocabulary for intermediate to advanced learners.
Format: Return a JSON object with:
{
  "title": "Title in English (Traducción en Español)",
  "segments": [
    {
      "english": "Paragraph in English...",
      "phonetic": "Phonetic reading guide for Spanish speakers",
      "spanish": "Spanish translation of this paragraph"
    }
  ],
  "difficultWords": [
    {"word": "word1", "definition": "Spanish definition", "example": "example sentence"}
  ]
}`,

        technical: `Generate a realistic tech workplace dialogue or scenario in American English (6-8 exchanges, 300-400 words).
Topic: Software engineering, cybersecurity incident, daily standup sprint review, cloud architecture, or data analytics.
Style: Professional tech workplace English with authentic industry expressions and conversational flow.
Format: Return a JSON object with:
{
  "title": "Title in English (Traducción en Español)",
  "segments": [
    {
      "speaker": "Engineer / Tech Lead",
      "english": "Tech discussion line in English...",
      "phonetic": "Phonetic reading guide for Spanish speakers",
      "spanish": "Spanish translation"
    }
  ],
  "difficultWords": [
    {"word": "term", "definition": "Tech term definition in Spanish", "example": "short example sentence"}
  ]
}`
    }
};
