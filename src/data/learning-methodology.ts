/**
 * Learning Methodology based on English-level-up-tips
 * https://github.com/byoungd/English-level-up-tips
 * 
 * Core principles:
 * - Active output > passive input (Learning Pyramid)
 * - Spaced repetition (Ebbinghaus curve)
 * - Context-based vocabulary (not isolated words)
 * - Interest-driven content selection
 * - AI as training coach, not answer generator
 */

export const LEARNING_PRINCIPLES = [
  {
    id: 'active-output',
    title: 'Producción activa > Entrada pasiva',
    description: 'Hablar, escribir y usar el idioma retiene ~90% vs solo leer/escuchar ~20%',
    icon: 'OUT',
    source: 'Learning Pyramid - Edgar Dale',
  },
  {
    id: 'spaced-repetition',
    title: 'Repetición espaciada',
    description: 'Revisar en intervalos crecientes (5min, 30min, 12h, 1d, 2d, 4d, 7d, 15d)',
    icon: 'SRS',
    source: 'Ebbinghaus Forgetting Curve',
  },
  {
    id: 'context-learning',
    title: 'Vocabulario en contexto',
    description: 'Las palabras se aprenden mejor dentro de oraciones y situaciones reales',
    icon: 'CTX',
    source: 'Webster\'s Vocabulary Builder approach',
  },
  {
    id: 'interest-driven',
    title: 'Impulsado por intereses',
    description: 'Usa materiales que te gusten: series, podcasts, artículos técnicos, música',
    icon: 'INT',
    source: 'Motivation-based learning',
  },
  {
    id: 'ai-coach',
    title: 'IA como entrenador, no como respuesta',
    description: 'Deja que la IA te pregunte, corrija y desafíe. No dejes que aprenda por ti.',
    icon: 'AI',
    source: 'AI Learning chapter 2026',
  },
  {
    id: 'minimal-loop',
    title: 'Ciclos mínimos de práctica',
    description: 'Habla 2-3 min → corrige 1-2 errores → repite mejorado. Mejor que recibir 10 correcciones de golpe.',
    icon: 'LOOP',
    source: 'Speaking minimal loop',
  },
];

/**
 * AI Training Loops from the repo
 * These are the structured practice patterns recommended
 */
export const AI_TRAINING_LOOPS = {
  input4Steps: {
    name: 'Método de 4 pasos para input',
    steps: [
      'Lee/Escucha primero sin traducir',
      'Pide a la IA que explique dificultades y haga preguntas',
      'Responde o resume en inglés',
      'La IA corrige tu output y hace preguntas de seguimiento',
    ],
  },
  writing3Stages: {
    name: 'Escritura en 3 etapas',
    steps: [
      'Escribe tu primer borrador',
      'La IA marca los 3-5 problemas más importantes',
      'Reescribe tú mismo, luego compara con la versión mejorada de la IA',
    ],
  },
  speakingMiniLoop: {
    name: 'Loop mínimo de speaking',
    steps: [
      'Habla 2-3 minutos sobre un tema',
      'Recibe 1-2 correcciones clave',
      'Repite inmediatamente la versión corregida',
    ],
  },
  vocabAbsorption: {
    name: 'Ciclo de absorción de vocabulario',
    steps: [
      'Aprende nuevas expresiones hoy',
      'Crea oraciones con ellas el mismo día',
      'En 2-3 días la IA te examina',
      'En 1 semana las usas en un nuevo contexto',
    ],
  },
  materialReuse: {
    name: 'Reutilización de material',
    description: 'Un artículo/video no se usa solo una vez. El mismo material sirve para:',
    steps: [
      'Comprensión lectora',
      'Extracción de vocabulario',
      'Dictado',
      'Resumen oral',
      'Imitación en escritura',
    ],
  },
};

/**
 * AI Prompt templates for different skills
 * Based on the repo's AI chapter (2026 version)
 */
export const AI_PROMPTS = {
  speakingCoach: `Act as my speaking coach. We will have a natural English conversation for 15 minutes. Keep your turns short. After every 3 rounds, give me brief feedback on grammar, word choice, and pronunciation priorities.`,
  
  workplaceSpeaking: `Let's simulate a weekly sync meeting in English. You are my teammate. Ask me one question at a time about project progress, blockers, next steps, and risks. After each answer, tell me how to make it sound more natural and concise.`,
  
  listeningQuiz: `Create a quiz about this material. Start with 5 easy comprehension questions, then 5 harder inference questions. After each answer, explain why.`,
  
  vocabFlashcards: `Create flashcards about this material. Focus on high-frequency vocabulary, collocations, and sentence patterns that are useful in real conversations, not just rare difficult words.`,
  
  readingGuided: `Help me study this article with Guided Learning. Do not translate everything directly. First ask me what I think the main idea is. Then guide me paragraph by paragraph, explain key expressions, and quiz me on the logic.`,
  
  writingFeedback: `Here is my draft. Do not rewrite everything immediately. First identify the most important mistakes and weak sentences. Explain why they are weak. Then ask me to revise them myself. After I revise, show me a stronger version for comparison.`,
  
  synonymComparison: `Explain the difference between these words in Spanish and English. Give me common collocations, natural examples, and 5 short exercises.`,
  
  ieltsSpoken: `Act as an IELTS speaking examiner. Ask me one question at a time in Part 1, Part 2, and Part 3 order. After each answer, give me short feedback on fluency, grammar, vocabulary, and how to sound more natural.`,
  
  techInterview: `Act as an interviewer for an international tech company. Ask me common behavioral and role-specific questions one by one. Challenge vague answers and ask follow-up questions. After each round, tell me how to make my answer clearer and more convincing.`,
};

/**
 * Recommended resources from the repo
 */
export const RECOMMENDED_RESOURCES = {
  books: [
    { title: 'Animal Farm', author: 'George Orwell', level: 'A2-B1', description: 'Political satire, short and powerful' },
    { title: 'The Curious Incident of the Dog in the Night-time', author: 'Mark Haddon', level: 'B1', description: 'Unique narrative voice, logical reasoning' },
    { title: 'The Diary of a Young Girl', author: 'Anne Frank', level: 'B1-B2', description: 'Expressive writing, historical context' },
    { title: 'Harry Potter series', author: 'J.K. Rowling', level: 'B1-B2', description: 'Engaging story, progressive difficulty' },
    { title: 'The Kite Runner', author: 'Khaled Hosseini', level: 'B2', description: 'Emotional, well-written contemporary fiction' },
    { title: 'On Writing Well', author: 'William Zinsser', level: 'B2-C1', description: 'Writing craft manual, excellent prose' },
    { title: "Merriam-Webster's Vocabulary Builder", author: 'Various', level: 'B2-C1', description: 'Context-based vocabulary with exercises' },
  ],
  websites: [
    { name: 'Medium', url: 'https://www.medium.com', category: 'reading', description: 'High quality articles on any topic' },
    { name: 'Quora', url: 'https://www.quora.com', category: 'reading', description: 'Q&A community, often emotional answers' },
    { name: 'Reddit', url: 'https://www.reddit.com', category: 'reading', description: 'Internet front page, casual English' },
    { name: 'Hacker News', url: 'https://news.ycombinator.com', category: 'tech-reading', description: 'Tech news and discussions' },
    { name: 'Stack Overflow', url: 'https://www.stackoverflow.com', category: 'tech-reading', description: 'Technical Q&A' },
  ],
  podcasts: [
    { name: 'All Ears English', level: 'B1-B2', description: 'American English, conversational' },
    { name: '6 Minute English (BBC)', level: 'B1', description: 'Short British English topics' },
    { name: 'TED Radio Hour', level: 'B2-C1', description: 'Ideas and deep conversations' },
  ],
  tvShows: [
    { title: 'Friends', level: 'B1-B2', description: 'Classic, slow-paced, humor' },
    { title: 'Modern Family', level: 'B1-B2', description: 'Emmy-winning comedy, excellent scripts' },
    { title: 'Better Call Saul', level: 'B2-C1', description: 'Complex dialogue, higher difficulty' },
  ],
};

/**
 * CEFR Level descriptions
 */
export const CEFR_LEVELS = [
  { level: 'A1', name: 'Beginner', vocabRange: '0-500', description: 'Can understand and use familiar everyday expressions' },
  { level: 'A2', name: 'Elementary', vocabRange: '500-1000', description: 'Can communicate in simple and routine tasks' },
  { level: 'B1', name: 'Intermediate', vocabRange: '1000-2500', description: 'Can deal with most situations while travelling' },
  { level: 'B2', name: 'Upper Intermediate', vocabRange: '2500-5000', description: 'Can interact with fluency and spontaneity' },
  { level: 'C1', name: 'Advanced', vocabRange: '5000-8000', description: 'Can use language flexibly for social, academic and professional purposes' },
  { level: 'C2', name: 'Mastery', vocabRange: '8000+', description: 'Can understand virtually everything heard or read' },
];
