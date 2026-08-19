/**
 * Pronunciation Guide - IPA for Spanish speakers
 * Based on: https://github.com/byoungd/English-level-up-tips (speaking chapter)
 * Reference: Teach Reading with Phonics - American English Pronunciation
 * YouTube: https://www.youtube.com/playlist?list=PL9BB1D7256440E08B
 */

export interface PhonemeEntry {
  ipa: string;
  example: string;
  spanishHint: string;
  audioExample: string;
  category: 'vowel' | 'consonant';
  difficulty: 'easy' | 'medium' | 'hard';
}

export const VOWELS: PhonemeEntry[] = [
  { ipa: 'ɑ', example: 'cop', spanishHint: 'Como decir "aaa" en el doctor', audioExample: 'cop, hot, father', category: 'vowel', difficulty: 'easy' },
  { ipa: 'ə', example: 'the', spanishHint: 'Como la "e" relajada en "de"', audioExample: 'the, about, sofa', category: 'vowel', difficulty: 'medium' },
  { ipa: 'ʌ', example: 'cup', spanishHint: 'Con la boca de [ə] pronuncia [ɑ]', audioExample: 'cup, but, love', category: 'vowel', difficulty: 'medium' },
  { ipa: 'u', example: 'boot', spanishHint: 'Como la "u" en español', audioExample: 'boot, food, blue', category: 'vowel', difficulty: 'easy' },
  { ipa: 'ʊ', example: 'book', spanishHint: 'Con la boca de [ə] pronuncia [u]', audioExample: 'book, put, good', category: 'vowel', difficulty: 'medium' },
  { ipa: 'i', example: 'beat', spanishHint: 'Como la "i" en español, pero más larga', audioExample: 'beat, see, key', category: 'vowel', difficulty: 'easy' },
  { ipa: 'ɪ', example: 'bit', spanishHint: 'Como un "ih" de sorpresa', audioExample: 'bit, sit, gym', category: 'vowel', difficulty: 'medium' },
  { ipa: 'eɪ', example: 'make', spanishHint: 'Como el "ei" al contestar el teléfono "wéi"', audioExample: 'make, day, say', category: 'vowel', difficulty: 'easy' },
  { ipa: 'ɛ', example: 'head', spanishHint: 'Como la "e" abierta en "yes"', audioExample: 'head, bed, said', category: 'vowel', difficulty: 'easy' },
  { ipa: 'æ', example: 'had', spanishHint: 'Entre "a" y "e", como la oveja "mee" alargada', audioExample: 'had, cat, man', category: 'vowel', difficulty: 'hard' },
  { ipa: 'ɔ', example: 'law', spanishHint: 'Como la "o" abierta, tipo "ao"', audioExample: 'law, all, caught', category: 'vowel', difficulty: 'medium' },
  { ipa: 'aʊ', example: 'now', spanishHint: 'Como decir "au" de dolor', audioExample: 'now, how, about', category: 'vowel', difficulty: 'easy' },
  { ipa: 'aɪ', example: 'bite', spanishHint: 'Como decir "ai" (amor en inglés)', audioExample: 'bite, my, time', category: 'vowel', difficulty: 'easy' },
  { ipa: 'ɔɪ', example: 'boy', spanishHint: 'De [ɔ] desliza a [ɪ]', audioExample: 'boy, toy, coin', category: 'vowel', difficulty: 'easy' },
  { ipa: 'əʊ', example: 'go', spanishHint: 'De [ə] desliza a [ʊ], como "ou"', audioExample: 'go, no, home', category: 'vowel', difficulty: 'medium' },
];

export const CONSONANTS: PhonemeEntry[] = [
  { ipa: 'w', example: 'web', spanishHint: 'Como la "u" rápida antes de vocal', audioExample: 'web, we, want', category: 'consonant', difficulty: 'easy' },
  { ipa: 'j', example: 'yes', spanishHint: 'Como la "i" rápida, tipo "y" en español', audioExample: 'yes, you, year', category: 'consonant', difficulty: 'easy' },
  { ipa: 'f', example: 'father', spanishHint: 'Igual que en español', audioExample: 'father, fun, five', category: 'consonant', difficulty: 'easy' },
  { ipa: 'v', example: 'very', spanishHint: 'Como [f] pero vibrando las cuerdas vocales', audioExample: 'very, love, have', category: 'consonant', difficulty: 'medium' },
  { ipa: 'r', example: 'red', spanishHint: 'Labios hacia adelante, lengua curvada hacia atrás', audioExample: 'red, right, run', category: 'consonant', difficulty: 'hard' },
  { ipa: 'l', example: 'light', spanishHint: 'Punta de lengua toca detrás de dientes superiores', audioExample: 'light, love, let', category: 'consonant', difficulty: 'easy' },
  { ipa: 'n', example: 'night', spanishHint: 'Igual que en español', audioExample: 'night, new, name', category: 'consonant', difficulty: 'easy' },
  { ipa: 'm', example: 'mom', spanishHint: 'Igual que en español, boca cerrada "mmm"', audioExample: 'mom, me, make', category: 'consonant', difficulty: 'easy' },
  { ipa: 'ŋ', example: 'sing', spanishHint: 'Como la "n" antes de "g/k" en "tengo"', audioExample: 'sing, ring, thing', category: 'consonant', difficulty: 'medium' },
  { ipa: 'dz', example: 'roads', spanishHint: 'Como "ds" juntas', audioExample: 'roads, beds, reads', category: 'consonant', difficulty: 'medium' },
  { ipa: 'ts', example: "let's", spanishHint: 'Como "ts" en "pizza"', audioExample: "let's, cats, hits", category: 'consonant', difficulty: 'easy' },
  { ipa: 's', example: 'boss', spanishHint: 'Igual que en español', audioExample: 'boss, see, sun', category: 'consonant', difficulty: 'easy' },
  { ipa: 'z', example: 'rose', spanishHint: 'Como [s] pero vibrando cuerdas vocales', audioExample: 'rose, zoo, buzz', category: 'consonant', difficulty: 'medium' },
  { ipa: 'θ', example: 'thanks', spanishHint: 'Lengua entre los dientes, sopla como [s]', audioExample: 'thanks, think, three', category: 'consonant', difficulty: 'hard' },
  { ipa: 'ð', example: 'them', spanishHint: 'Lengua entre los dientes, vibra como [z]', audioExample: 'them, the, this', category: 'consonant', difficulty: 'hard' },
  { ipa: 'dʒ', example: 'just', spanishHint: 'Como "zh" suave, tipo "y" argentina', audioExample: 'just, job, age', category: 'consonant', difficulty: 'medium' },
  { ipa: 'tʃ', example: 'check', spanishHint: 'Como "ch" en español', audioExample: 'check, church, watch', category: 'consonant', difficulty: 'easy' },
  { ipa: 'ʃ', example: 'she', spanishHint: 'Como "sh", pidiendo silencio "shhh"', audioExample: 'she, ship, sure', category: 'consonant', difficulty: 'easy' },
  { ipa: 'ʒ', example: 'Asia', spanishHint: 'Como "sh" pero vibrando', audioExample: 'Asia, vision, pleasure', category: 'consonant', difficulty: 'hard' },
  { ipa: 'tr', example: 'try', spanishHint: 'Como "chr" juntas', audioExample: 'try, tree, true', category: 'consonant', difficulty: 'medium' },
  { ipa: 'dr', example: 'dry', spanishHint: 'Como "jr" juntas', audioExample: 'dry, drink, drive', category: 'consonant', difficulty: 'medium' },
];

export const PRONUNCIATION_TIPS = [
  'La diferencia entre "ship" [ʃɪp] y "sheep" [ʃiːp] es la duración de la vocal',
  'La "th" en inglés NO existe en español. Practica poniendo la lengua entre los dientes',
  'La "v" inglesa se hace mordiendo el labio inferior (≠ "b" española)',
  'La "r" americana se hace con la lengua curvada hacia atrás, nunca vibra',
  'El sonido schwa [ə] es el más común del inglés. Aparece en sílabas no acentuadas',
  'En inglés las vocales son más variadas que en español (5 vs 15+)',
  'Las palabras de contenido (sustantivos, verbos, adjetivos) se acentúan en la oración',
  'Las palabras funcionales (a, the, of, to) se reducen y suenan débiles',
];

export const MINIMAL_PAIRS = [
  { word1: 'ship', word2: 'sheep', ipa1: '/ʃɪp/', ipa2: '/ʃiːp/', focus: 'ɪ vs iː' },
  { word1: 'bit', word2: 'beat', ipa1: '/bɪt/', ipa2: '/biːt/', focus: 'ɪ vs iː' },
  { word1: 'full', word2: 'fool', ipa1: '/fʊl/', ipa2: '/fuːl/', focus: 'ʊ vs uː' },
  { word1: 'cat', word2: 'cut', ipa1: '/kæt/', ipa2: '/kʌt/', focus: 'æ vs ʌ' },
  { word1: 'bed', word2: 'bad', ipa1: '/bɛd/', ipa2: '/bæd/', focus: 'ɛ vs æ' },
  { word1: 'thin', word2: 'tin', ipa1: '/θɪn/', ipa2: '/tɪn/', focus: 'θ vs t' },
  { word1: 'van', word2: 'ban', ipa1: '/væn/', ipa2: '/bæn/', focus: 'v vs b' },
  { word1: 'rice', word2: 'lice', ipa1: '/raɪs/', ipa2: '/laɪs/', focus: 'r vs l' },
  { word1: 'think', word2: 'sink', ipa1: '/θɪŋk/', ipa2: '/sɪŋk/', focus: 'θ vs s' },
  { word1: 'they', word2: 'day', ipa1: '/ðeɪ/', ipa2: '/deɪ/', focus: 'ð vs d' },
];

export const CONNECTED_SPEECH_RULES = [
  { rule: 'Linking (consonant + vowel)', example: 'turn off → tur-noff', explanation: 'Consonante final se une a la vocal siguiente' },
  { rule: 'Elision (consonant clusters)', example: 'next day → nex day', explanation: 'Se eliminan consonantes en grupos difíciles' },
  { rule: 'Assimilation', example: 'ten bikes → tem bikes', explanation: 'Un sonido cambia para parecerse al siguiente' },
  { rule: 'Reduction (schwa)', example: 'to, for, of → tə, fər, əv', explanation: 'Palabras funcionales se reducen en habla rápida' },
  { rule: 'Contractions', example: "gonna, wanna, gotta", explanation: 'going to, want to, got to → formas coloquiales' },
  { rule: 'Flapping (American T)', example: 'water → wader, better → bedder', explanation: 'La "t" entre vocales suena como "d" suave' },
];

export const YOUTUBE_CHANNELS = {
  pronunciation: [
    { name: 'Rachel\'s English', url: 'https://www.youtube.com/user/rachelsenglish', description: 'American pronunciation in depth' },
    { name: 'Pronunciation with Emma', url: 'https://www.youtube.com/c/mmmEnglish', description: 'Clear Australian English' },
    { name: 'AccurateEnglish', url: 'https://www.youtube.com/channel/UCMTcsanYhBtOb096XegDZQA', description: 'Phonetics focused' },
  ],
  speaking: [
    { name: 'EnglishAnyone', url: 'https://www.youtube.com/user/EnglishAnyone', description: 'Fluency training' },
    { name: 'Speak English With Vanessa', url: 'https://www.youtube.com/user/theteachervanessa', description: 'Conversational practice' },
    { name: 'A.J. Hoge', url: 'https://www.youtube.com/c/AJHogeEffortlessEnglish', description: 'Effortless English method' },
  ],
  grammar: [
    { name: 'Ronnie - engVid', url: 'https://www.youtube.com/user/EnglishLessons4U', description: 'Grammar with humor' },
    { name: 'English with Lucy', url: 'https://www.youtube.com/channel/UCz4tgANd4yy8Oe0iXCdSWfA', description: 'British English' },
  ],
  listening: [
    { name: 'TED Talks', url: 'https://www.youtube.com/channel/UCAuUUnT6oDeKwE6v1NGQxug', description: 'Ideas worth spreading' },
    { name: 'Jimmy Kimmel Live', url: 'https://www.youtube.com/channel/UCa6vGFO9ty8v5KZJXQxdhaw', description: 'Late night talk show' },
    { name: 'TheEllenShow', url: 'https://www.youtube.com/channel/UCp0hYYBW6IMayGgR-WeoCvQ', description: 'Celebrity interviews' },
  ],
  tech: [
    { name: 'Traversy Media', url: 'https://www.youtube.com/channel/UC29ju8bIPH5as8OGnQzwJyA', description: 'Web dev tutorials' },
    { name: 'The Net Ninja', url: 'https://www.youtube.com/channel/UCW5YeuERMmlnqo4oq8vwUpg', description: 'Frontend focused' },
    { name: 'Fireship', url: 'https://www.youtube.com/c/Fireship', description: 'Fast-paced tech explainers' },
  ],
};
