import { CORE_1000 } from '../data/core-1000.js';
import { ADVANCED_1000 } from '../data/advanced-1000.js';
import { TECHNICAL_VOCABULARY } from '../data/technical.js';
import { URBAN_SLANG } from '../data/urban-slang.js';
import { TONGUE_TWISTERS } from '../data/tongue-twisters.js';
import { getMnemonicForWord } from '../data/mnemonics.ts';
import { PROFESSIONAL_SCENARIOS } from '../data/professional-scenarios.ts';
import { PAST_PERFECT_LATIN_DATASET } from '../data/past-perfect-latin.ts';
import { calculateNextReview, createSRSCard, SRS_LEVEL_LABELS, estimateCEFRLevel } from '../data/spaced-repetition.ts';

// ===== Application State =====
const state = {
    currentCategory: 'core',
    currentMode: 'flashcard',
    currentSet: 1,
    itemsPerSet: 200, // 200 words per set by default
    autoPlaySpeed: 1500, // ms per flashcard flip/advance
    currentIndex: 0,
    currentWords: [],
    progress: {},      // key -> 'mastered' | 'learning'
    srsData: {},       // key -> SRSCard
    associations: {},  // key -> mental hook
    failures: {},      // key -> failure count (>= 2 is loop)
    quizScore: 0,
    quizTotal: 0,
    isFlipped: false,
    subcategoryFilters: ['it', 'cybersecurity', 'dataAnalytics', 'business', 'finance']
};

const rsvpState = {
    source: 'vocab', // 'vocab' | 'grammar' | 'custom'
    chunkMode: 2, // 1: single word, 2: 2-word thought groups (linking), 3: 3-word flow
    chunks: [],
    chunkIndex: 0,
    words: [],
    wordIndex: 0,
    wpm: 220,
    isPlaying: false,
    intervalId: null,
    currentSentence: '',
    currentPhonetic: '',
    currentMeaning: '',
    autoAdvance: true
};

const grammarState = {
    currentIndex: 0,
    categoryFilter: 'all',
    tenseFilter: 'all',
    searchQuery: '',
    filteredItems: []
};

const scenarioState = {
    scenarioIndex: 0,
    stepIndex: 0,
    score: 100,
    isCompleted: false
};

const readingState = {
    currentCategory: 'custom',
    currentText: null,
    difficultWords: [],
    isLoading: false,
    isPlayingAudio: false,
    audioSegmentIndex: 0
};

const matchingState = {
    cards: [],
    selectedCards: [],
    matchedPairs: 0,
    totalPairs: 4
};

const listeningState = {
    correct: 0,
    total: 0,
    currentWord: null,
    revealed: false
};

const sessionState = {
    active: false,
    currentPhase: 0,
    phases: ['flashcard', 'rsvp', 'grammar', 'scenario', 'quiz', 'typing', 'fillblanks', 'matching', 'listening', 'reading'],
    phaseLabels: ['Tarjetas', 'RSVP', 'Pasado/Perf.', 'Simulador', 'Quiz', 'Escribir', 'Completar', 'Parejas', 'Dictado', 'Lectura IA'],
    startTime: null,
    timerInterval: null
};

// Global Timers
let flashcardTimerInterval = null;
let flashcardTimeRemaining = 0;
let autoPlayInterval = null;
let fillBlanksCorrectAnswers = [];

// DOM Element Registry
let el = {};

// ===== Helper Functions =====
function formatPhonetic(phonetic) {
    if (!phonetic) return '';
    return phonetic.trim();
}

function normalizeWord(w, defaultCategory = 'core') {
    const wordText = (w.word || w.text || '').trim();
    const phoneticText = formatPhonetic(w.phonetic || '');
    const definitionText = w.definition || 'Práctica de fluidez y dicción';
    const trans = (w.translation || w.translation_es || '').trim();
    const ex = (w.example || w.text || `Practice sentence with ${wordText}.`).trim();

    return {
        word: wordText,
        phonetic: phoneticText,
        definition: definitionText,
        translation: trans,
        translation_es: trans,
        example: ex,
        subcategory: w.subcategory || '',
        category: w.category || defaultCategory,
        level: w.level || ''
    };
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ===== LocalStorage Persistence =====
function loadSavedData() {
    try {
        const savedProgress = localStorage.getItem('vocabProgress');
        if (savedProgress) state.progress = JSON.parse(savedProgress);

        const savedSRS = localStorage.getItem('vocabSRS');
        if (savedSRS) state.srsData = JSON.parse(savedSRS);

        const savedAssoc = localStorage.getItem('vocabAssociations');
        if (savedAssoc) state.associations = JSON.parse(savedAssoc);

        const savedFailures = localStorage.getItem('vocabFailures');
        if (savedFailures) state.failures = JSON.parse(savedFailures);
    } catch (e) {
        console.error('Error loading saved data from localStorage:', e);
    }
}

function saveProgress() {
    try {
        localStorage.setItem('vocabProgress', JSON.stringify(state.progress));
    } catch (e) { console.error(e); }
}

function saveSRS() {
    try {
        localStorage.setItem('vocabSRS', JSON.stringify(state.srsData));
    } catch (e) { console.error(e); }
}

function saveAssociations() {
    try {
        localStorage.setItem('vocabAssociations', JSON.stringify(state.associations));
    } catch (e) { console.error(e); }
}

function saveFailures() {
    try {
        localStorage.setItem('vocabFailures', JSON.stringify(state.failures));
        updateLoopBadge();
    } catch (e) { console.error(e); }
}

// ===== Loop / Failure Tracking System =====
function getWordKey(wordObj) {
    if (!wordObj) return '';
    return `${wordObj.category || state.currentCategory}:${wordObj.word}`;
}

function recordFailure(wordObj) {
    if (!wordObj || !wordObj.word) return;
    const key = getWordKey(wordObj);
    state.failures[key] = (state.failures[key] || 0) + 1;

    // Update SRS on failure
    const existingCard = state.srsData[key] || createSRSCard(wordObj.word, wordObj.category || state.currentCategory);
    state.srsData[key] = calculateNextReview(existingCard, false);
    state.progress[key] = 'learning';

    saveFailures();
    saveSRS();
    saveProgress();
}

function clearFailure(wordObj) {
    if (!wordObj || !wordObj.word) return;
    const key = getWordKey(wordObj);
    if (state.failures[key]) {
        delete state.failures[key];
        saveFailures();
    }
}

function getAllCatalogWords() {
    const list = [
        ...CORE_1000.map(w => normalizeWord(w, 'core')),
        ...ADVANCED_1000.map(w => normalizeWord(w, 'advanced')),
        ...URBAN_SLANG.map(w => normalizeWord(w, 'slang')),
        ...TONGUE_TWISTERS.map(w => normalizeWord(w, 'twisters'))
    ];

    Object.keys(TECHNICAL_VOCABULARY).forEach(sub => {
        TECHNICAL_VOCABULARY[sub].forEach(w => {
            list.push(normalizeWord({ ...w, subcategory: sub }, 'technical'));
        });
    });

    return list;
}

function getLoopWords() {
    const loopWords = [];
    const allCatalog = getAllCatalogWords();
    const catalogMap = new Map();
    allCatalog.forEach(w => catalogMap.set(getWordKey(w), w));

    for (const [key, count] of Object.entries(state.failures)) {
        if (count >= 2) {
            const found = catalogMap.get(key);
            if (found) {
                loopWords.push({
                    ...found,
                    _isLoop: true,
                    _failCount: count
                });
            }
        }
    }
    return loopWords;
}

function updateLoopBadge() {
    const loopWords = getLoopWords();
    const count = loopWords.length;

    const countLabel = document.getElementById('loopWordsCountLabel');
    if (countLabel) countLabel.textContent = `${count} ${count === 1 ? 'palabra' : 'palabras'}`;

    const loopBtn = document.getElementById('loopFilterBtn');
    if (loopBtn) {
        if (count > 0) {
            loopBtn.classList.add('has-failures');
        } else {
            loopBtn.classList.remove('has-failures');
        }
    }

    const dot = document.getElementById('loopDotIndicator');
    if (dot) {
        dot.classList.toggle('hidden', count === 0);
    }

    const statLoops = document.getElementById('statLoops');
    if (statLoops) statLoops.textContent = count;

    const profileLoopCount = document.getElementById('profileLoopCount');
    if (profileLoopCount) profileLoopCount.textContent = count;
}

// ===== Ultra-Realistic Neural Speech Audio Engine =====
let currentAudioInstance = null;
const ttsAudioCache = new Map();

function stopAudio() {
    if (currentAudioInstance) {
        currentAudioInstance.pause();
        currentAudioInstance.currentTime = 0;
        currentAudioInstance = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function speakText(text, rateOrOptions = 1.0, onEndCallback = null) {
    if (!text) return;

    let rate = 1.0;
    let voice = 'en-US-JennyNeural'; // Natural, authentic American English female voice
    let callback = onEndCallback;

    if (typeof rateOrOptions === 'number') {
        rate = rateOrOptions;
    } else if (typeof rateOrOptions === 'object' && rateOrOptions !== null) {
        if (rateOrOptions.rate) rate = rateOrOptions.rate;
        if (rateOrOptions.voice) voice = rateOrOptions.voice;
        if (rateOrOptions.onEnd) callback = rateOrOptions.onEnd;
    } else if (typeof rateOrOptions === 'function') {
        callback = rateOrOptions;
    }

    const cleanText = text.replace(/[*_#`[\]"]/g, '').trim();
    if (!cleanText) return;

    stopAudio();

    // Format rate string (e.g. 0.85 -> "-15%", 1.0 -> "+0%")
    let rateStr = '+0%';
    if (rate !== 1.0) {
        const pct = Math.round((rate - 1.0) * 100);
        rateStr = (pct >= 0 ? '+' : '') + `${pct}%`;
    }

    const cacheKey = `${voice}_${rateStr}_${cleanText}`;

    // 1. Instant Playback from In-Memory Cache
    if (ttsAudioCache.has(cacheKey)) {
        playAudioUrl(ttsAudioCache.get(cacheKey), callback, cleanText, rate);
        return;
    }

    // 2. Fetch High-Definition Neural Speech from /api/tts
    fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, voice, rate: rateStr })
    })
    .then(res => {
        if (!res.ok) throw new Error(`Neural TTS HTTP ${res.status}`);
        return res.blob();
    })
    .then(blob => {
        const audioUrl = URL.createObjectURL(blob);
        ttsAudioCache.set(cacheKey, audioUrl);
        playAudioUrl(audioUrl, callback, cleanText, rate);
    })
    .catch(err => {
        console.warn('Neural TTS fallback:', err);
        fallbackToBrowserTTS(cleanText, rate, callback);
    });
}

function playAudioUrl(url, callback, fallbackText, fallbackRate) {
    try {
        const audio = new Audio(url);
        currentAudioInstance = audio;

        audio.onended = () => {
            currentAudioInstance = null;
            if (callback) callback();
        };

        audio.onerror = () => {
            currentAudioInstance = null;
            fallbackToBrowserTTS(fallbackText, fallbackRate, callback);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.warn('Audio playback error, fallback:', e);
                fallbackToBrowserTTS(fallbackText, fallbackRate, callback);
            });
        }
    } catch (e) {
        fallbackToBrowserTTS(fallbackText, fallbackRate, callback);
    }
}

function fallbackToBrowserTTS(text, rate, onEndCallback) {
    if (!('speechSynthesis' in window)) {
        if (onEndCallback) onEndCallback();
        return;
    }

    window.speechSynthesis.cancel();
    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            executeBrowserSpeak(text, voices, rate, onEndCallback);
        };
        return;
    }
    executeBrowserSpeak(text, voices, rate, onEndCallback);
}

function executeBrowserSpeak(text, voices, rate, onEndCallback) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;

    // Prioritize natural neural browser voices
    let voice = voices.find(v => (v.lang === 'en-US' || v.lang.startsWith('en_US')) &&
        (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Ava') || v.name.includes('Jenny') || v.name.includes('Guy')));

    if (!voice) voice = voices.find(v => v.lang.toLowerCase().includes('en-us') && !v.name.includes('Desktop'));
    if (!voice) voice = voices.find(v => v.lang.toLowerCase().includes('en-us'));
    if (!voice) voice = voices.find(v => v.lang.toLowerCase().startsWith('en'));

    if (voice) utterance.voice = voice;

    if (onEndCallback) {
        utterance.onend = onEndCallback;
        utterance.onerror = onEndCallback;
    }

    window.speechSynthesis.speak(utterance);
}

// ===== Word Loading & Filtering =====
function loadWords() {
    let allWords = [];

    if (state.currentCategory === 'loop') {
        allWords = getLoopWords();
        if (allWords.length === 0) {
            allWords = CORE_1000.slice(0, 10).map(w => normalizeWord(w, 'core'));
        }
    } else {
        switch (state.currentCategory) {
            case 'core':
                allWords = CORE_1000.map(w => normalizeWord(w, 'core'));
                break;
            case 'advanced':
                allWords = ADVANCED_1000.map(w => normalizeWord(w, 'advanced'));
                break;
            case 'technical':
                state.subcategoryFilters.forEach(sub => {
                    if (TECHNICAL_VOCABULARY[sub]) {
                        allWords.push(...TECHNICAL_VOCABULARY[sub].map(w => normalizeWord({ ...w, subcategory: sub }, 'technical')));
                    }
                });
                break;
            case 'slang':
                allWords = URBAN_SLANG.map(w => normalizeWord(w, 'slang'));
                break;
            case 'twisters':
                allWords = TONGUE_TWISTERS.map(w => normalizeWord(w, 'twisters'));
                break;
            default:
                allWords = CORE_1000.map(w => normalizeWord(w, 'core'));
        }
    }

    updateSetSelector(allWords.length);

    const start = (state.currentSet - 1) * state.itemsPerSet;
    const end = Math.min(start + state.itemsPerSet, allWords.length);

    if (start >= allWords.length && allWords.length > 0) {
        state.currentSet = 1;
        state.currentWords = allWords.slice(0, Math.min(state.itemsPerSet, allWords.length));
        updateSetSelector(allWords.length);
    } else {
        state.currentWords = allWords.slice(start, end);
    }

    if (state.currentCategory !== 'loop') {
        const loopWords = getLoopWords();
        const existingKeys = new Set(state.currentWords.map(w => getWordKey(w)));
        const toInject = loopWords.filter(w => !existingKeys.has(getWordKey(w))).slice(0, 3);
        if (toInject.length > 0) {
            state.currentWords.push(...toInject);
        }
    }

    shuffleArray(state.currentWords);
    state.currentIndex = 0;
}

function updateSetSelector(totalItems) {
    const setSelect = document.getElementById('setSelect');
    if (!setSelect) return;

    const totalSets = Math.max(1, Math.ceil(totalItems / state.itemsPerSet));
    setSelect.innerHTML = '';

    for (let i = 1; i <= totalSets; i++) {
        const option = document.createElement('option');
        option.value = i;
        const start = (i - 1) * state.itemsPerSet + 1;
        const end = Math.min(i * state.itemsPerSet, totalItems);
        option.textContent = `Set ${i} (${start}-${end})`;
        if (i === state.currentSet) option.selected = true;
        setSelect.appendChild(option);
    }
}

// ===== Flashcard Mode Logic =====
function getWordRegister(word) {
    if (!word) return 'americano común';
    if (state.currentCategory === 'slang') return 'urbano USA / slang';
    if (state.currentCategory === 'technical') return `tech / ${word.subcategory || 'profesional'}`;
    if (state.currentCategory === 'advanced') return 'avanzado B2/C1';
    if (state.currentCategory === 'twisters') return 'dicción rápida';
    return 'alta frecuencia';
}

function getWordType(word) {
    if (!word) return 'palabra';
    if (state.currentCategory === 'twisters') return 'trabalenguas';
    if (state.currentCategory === 'slang') return word.word.includes(' ') ? 'frase' : 'slang';
    if (word.word.includes(' ') || word.word.includes('/')) return 'expresión';
    if (word.word.endsWith('ing')) return 'gerundio / acción';
    return 'vocabulario';
}

function updateFlashcard() {
    const word = state.currentWords[state.currentIndex];
    if (!word) return;

    const key = getWordKey(word);

    // Counter & SRS badge
    if (el.flashcardCurrentCount) el.flashcardCurrentCount.textContent = state.currentIndex + 1;
    if (el.flashcardTotalCount) el.flashcardTotalCount.textContent = state.currentWords.length;

    const srsCard = state.srsData[key];
    const srsBadge = document.getElementById('cardSrsBadge');
    if (srsBadge) {
        const levelIdx = srsCard ? srsCard.level : 0;
        srsBadge.textContent = SRS_LEVEL_LABELS[levelIdx] || 'Nuevo';
        srsBadge.className = `srs-badge level-${levelIdx}`;
    }

    // Loop Badge
    const loopBadge = document.getElementById('loopBadge');
    if (loopBadge) {
        loopBadge.classList.toggle('hidden', !word._isLoop && !(state.failures[key] >= 2));
    }

    // Word metadata
    if (el.wordType) el.wordType.textContent = getWordType(word);
    if (el.wordRegister) el.wordRegister.textContent = getWordRegister(word);

    // Front details
    if (el.currentWord) el.currentWord.textContent = word.word;
    if (el.phonetic) el.phonetic.textContent = word.phonetic ? `/${word.phonetic}/` : '';

    // Back details
    const trans = word.translation_es || word.translation;
    if (el.translationPrimary) el.translationPrimary.textContent = trans;
    if (el.definition) el.definition.textContent = word.definition;
    if (el.example) el.example.textContent = `"${word.example}"`;
    if (el.spanishCue) el.spanishCue.textContent = trans;
    if (el.soundCue) el.soundCue.textContent = word.phonetic || word.word;

    // Vivid Mnemonic Image & Spatial Palace
    const mnemonic = getMnemonicForWord(word.word, trans);
    const mAnchor = document.getElementById('mnemonicAnchor');
    const mImage = document.getElementById('mnemonicImage');
    const mPalace = document.getElementById('mnemonicPalace');

    if (mAnchor) mAnchor.textContent = `${mnemonic.phoneticAnchor} → ${mnemonic.conceptualBridge}`;
    if (mImage) mImage.textContent = mnemonic.bizarreImage;
    if (mPalace) mPalace.textContent = mnemonic.palaceRoom;

    // Mental Hook input
    const assocInput = document.getElementById('associationInput');
    if (assocInput) assocInput.value = state.associations[key] || '';

    // Flip state
    if (el.flashcard) el.flashcard.classList.toggle('flipped', state.isFlipped);
    if (el.prevBtn) el.prevBtn.disabled = state.currentIndex === 0;
    if (el.nextBtn) el.nextBtn.disabled = state.currentIndex === state.currentWords.length - 1;
}

function markWord(status) {
    const word = state.currentWords[state.currentIndex];
    if (!word) return;

    const key = getWordKey(word);
    state.progress[key] = status;

    const currentSRS = state.srsData[key] || createSRSCard(word.word, word.category || state.currentCategory);

    if (status === 'mastered') {
        state.srsData[key] = calculateNextReview(currentSRS, true);
        clearFailure(word);
    } else {
        state.srsData[key] = calculateNextReview(currentSRS, false);
        recordFailure(word);
    }

    saveProgress();
    saveSRS();
    updateProgress();

    const btn = status === 'mastered' ? el.knowBtn : el.learningBtn;
    if (btn) {
        btn.classList.add('saved-anim');
        setTimeout(() => btn.classList.remove('saved-anim'), 400);
    }

    if (state.currentIndex < state.currentWords.length - 1) {
        state.currentIndex++;
        state.isFlipped = false;
        updateDisplay();
    } else {
        updateDisplay();
    }
}

// ===== Flashcard Timer & Auto-Play =====
function toggleFlashcardTimer() {
    if (flashcardTimerInterval) {
        stopFlashcardTimer();
        return;
    }

    const minutes = parseInt(el.timerSelect.value);
    if (minutes === 0) return;

    flashcardTimeRemaining = minutes * 60;
    el.startTimerBtn.textContent = 'Detener';
    el.startTimerBtn.classList.add('stop');
    el.timerSelect.disabled = true;

    updateTimerDisplay();
    el.timerDisplay.classList.add('running');

    flashcardTimerInterval = setInterval(() => {
        flashcardTimeRemaining--;
        updateTimerDisplay();

        if (flashcardTimeRemaining <= 30) {
            el.timerDisplay.classList.add('ending');
        }

        if (flashcardTimeRemaining <= 0) {
            stopFlashcardTimer();
            alert('Tiempo cumplido. Pasemos a evaluar lo aprendido con el Quiz.');
            document.querySelector('.mode-btn[data-mode="quiz"]')?.click();
        }
    }, 1000);
}

function stopFlashcardTimer() {
    if (flashcardTimerInterval) {
        const totalMinutes = parseInt(el.timerSelect.value) || 0;
        const elapsed = (totalMinutes * 60) - flashcardTimeRemaining;
        if (elapsed > 0) recordStudyTime(elapsed);
        clearInterval(flashcardTimerInterval);
    }
    flashcardTimerInterval = null;
    el.startTimerBtn.textContent = 'Iniciar';
    el.startTimerBtn.classList.remove('stop');
    el.timerSelect.disabled = false;
    el.timerDisplay.textContent = '--:--';
    el.timerDisplay.classList.remove('running', 'ending');
}

function updateTimerDisplay() {
    const mins = Math.floor(flashcardTimeRemaining / 60);
    const secs = flashcardTimeRemaining % 60;
    el.timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function toggleAutoPlay() {
    if (!el.autoPlayFlashcardsBtn) return;

    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        el.autoPlayFlashcardsBtn.textContent = '▶ Auto-Play';
        el.autoPlayFlashcardsBtn.classList.remove('active');
    } else {
        el.autoPlayFlashcardsBtn.textContent = '⏸ Detener';
        el.autoPlayFlashcardsBtn.classList.add('active');

        const speed = state.autoPlaySpeed || 1500;

        const cycle = () => {
            if (!state.isFlipped) {
                // Flip card to reveal back and pronunciation
                state.isFlipped = true;
                el.flashcard?.classList.add('flipped');
                const word = state.currentWords[state.currentIndex];
                if (word) speakText(word.word);
            } else {
                // Advance to next card or seamlessly to next set
                if (state.currentIndex < state.currentWords.length - 1) {
                    state.currentIndex++;
                    state.isFlipped = false;
                    el.flashcard?.classList.remove('flipped');
                    updateDisplay();
                } else {
                    // Reached end of set: move to next set of 200 without freezing
                    const setSelect = document.getElementById('setSelect');
                    const totalSets = setSelect?.options?.length || 1;
                    if (state.currentSet < totalSets) {
                        state.currentSet++;
                    } else {
                        state.currentSet = 1;
                    }
                    if (setSelect) setSelect.value = state.currentSet;
                    loadWords();
                    state.currentIndex = 0;
                    state.isFlipped = false;
                    el.flashcard?.classList.remove('flipped');
                    updateDisplay();
                }
            }
        };
        autoPlayInterval = setInterval(cycle, speed);
    }
}

// ===== RSVP Speed Reader Engine (with Connected Speech & Thought Groups) =====
function calculateORPIndex(word) {
    const len = word.length;
    if (len <= 1) return 0;
    if (len <= 5) return 1;
    if (len <= 9) return 2;
    if (len <= 13) return 3;
    return 4;
}

function isConsonantVowelLink(w1, w2) {
    if (!w1 || !w2) return false;
    const clean1 = w1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const clean2 = w2.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!clean1 || !clean2) return false;

    // Do not link across strong punctuation (. ? ! ; :)
    if (/[.?!;:]/.test(w1)) return false;

    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const lastChar1 = clean1.slice(-1);
    const firstChar2 = clean2.charAt(0);

    const isLastConsonant = !vowels.includes(lastChar1);
    const isFirstVowel = vowels.includes(firstChar2);

    // 1. Classic Consonant + Vowel linking (e.g. "turn off" -> tur-noff, "worked in", "pick up", "had already")
    if (isLastConsonant && isFirstVowel) return true;

    // 2. Linking R (e.g. "for a", "here is", "there are")
    if (clean1.endsWith('r') || clean1.endsWith('re')) return true;

    // 3. Palatalization linking (e.g. "did you", "would you", "want you")
    if ((clean1.endsWith('d') || clean1.endsWith('t')) && (clean2.startsWith('y') || clean2 === 'you')) return true;

    return false;
}

function buildRSVPChunks(words, chunkSize) {
    const chunks = [];
    const size = Math.max(1, Math.min(3, chunkSize || 1));

    for (let i = 0; i < words.length; i += size) {
        const chunkWords = words.slice(i, i + size);
        const tokenIndices = chunkWords.map((_, idx) => i + idx);
        chunks.push({
            text: chunkWords.join(' '),
            words: chunkWords,
            tokenIndices
        });
    }
    return chunks;
}

function formatTenseLabel(tenseType) {
    switch (tenseType) {
        case 'past-simple': return 'Pasado Simple (Past Simple)';
        case 'present-perfect': return 'Presente Perfecto (Present Perfect)';
        case 'present-perfect-continuous': return 'Presente Perfecto Continuo';
        case 'past-perfect': return 'Pasado Perfecto (Past Perfect)';
        case 'past-perfect-continuous': return 'Pasado Perfecto Continuo';
        case 'contrast': return 'Contraste Clave: Pasado vs Perfecto';
        default: return tenseType || 'Estructura Gramatical';
    }
}

function applyGrammarFilters() {
    let items = [...PAST_PERFECT_LATIN_DATASET];

    if (grammarState.categoryFilter !== 'all') {
        items = items.filter(i => i.category === grammarState.categoryFilter);
    }

    if (grammarState.tenseFilter !== 'all') {
        items = items.filter(i => i.tenseType === grammarState.tenseFilter);
    }

    if (grammarState.searchQuery && grammarState.searchQuery.trim().length > 0) {
        const q = grammarState.searchQuery.toLowerCase().trim();
        items = items.filter(i =>
            i.english.toLowerCase().includes(q) ||
            i.spanishNeutral.toLowerCase().includes(q) ||
            i.keyVerb.base.toLowerCase().includes(q) ||
            i.keyVerb.past.toLowerCase().includes(q) ||
            i.keyVerb.pastParticiple.toLowerCase().includes(q)
        );
    }

    grammarState.filteredItems = items.length > 0 ? items : PAST_PERFECT_LATIN_DATASET.slice(0, 5);
    if (grammarState.currentIndex >= grammarState.filteredItems.length) {
        grammarState.currentIndex = 0;
    }
}

function initRSVP(keepIndex = false) {
    if (!rsvpState.isPlaying && rsvpState.intervalId) {
        clearTimeout(rsvpState.intervalId);
        rsvpState.intervalId = null;
    }

    const grammarBox = document.getElementById('rsvpGrammarBox');
    const tenseBadge = document.getElementById('rsvpTenseBadge');
    const grammarRule = document.getElementById('rsvpGrammarRule');
    const sentenceCounter = document.getElementById('rsvpSentenceCounter');

    if (rsvpState.source === 'grammar') {
        if (!grammarState.filteredItems || grammarState.filteredItems.length === 0) applyGrammarFilters();
        const totalGrammar = grammarState.filteredItems.length || 1;
        if (grammarState.currentIndex >= totalGrammar) grammarState.currentIndex = 0;
        const item = grammarState.filteredItems[grammarState.currentIndex] || PAST_PERFECT_LATIN_DATASET[0];
        if (item) {
            rsvpState.currentSentence = item.english;
            rsvpState.currentPhonetic = item.phonetic;
            rsvpState.currentMeaning = item.spanishNeutral;
        }

        if (grammarBox) grammarBox.classList.remove('hidden');
        if (tenseBadge && item) tenseBadge.textContent = formatTenseLabel(item.tenseType);
        if (grammarRule && item) {
            const trapTxt = item.latinTrap ? ` • 💡 Ojo: ${item.latinTrap}` : '';
            grammarRule.textContent = `${item.cognitiveRule}${trapTxt}`;
        }
        if (sentenceCounter) {
            sentenceCounter.textContent = `Oración ${grammarState.currentIndex + 1} / ${totalGrammar}`;
        }
    } else if (rsvpState.source === 'custom') {
        const customInput = document.getElementById('rsvpCustomTextInput');
        const txt = (customInput?.value || '').trim();
        rsvpState.currentSentence = txt || 'Please paste your English text to speed read in connected thought groups.';
        rsvpState.currentPhonetic = '[flujo de voz conectado]';
        rsvpState.currentMeaning = 'Texto personalizado enlazado';

        if (grammarBox) grammarBox.classList.add('hidden');
        if (sentenceCounter) {
            sentenceCounter.textContent = `Texto Personalizado`;
        }
    } else {
        // default vocab
        if (!state.currentWords || state.currentWords.length === 0) loadWords();
        const totalVocab = state.currentWords.length || 1;
        if (state.currentIndex >= state.currentWords.length) state.currentIndex = 0;
        const word = state.currentWords[state.currentIndex];
        if (word) {
            rsvpState.currentSentence = word.example || `${word.word} is a key concept in English.`;
            rsvpState.currentPhonetic = word.phonetic ? `[${word.phonetic}]` : `[${word.word}]`;
            rsvpState.currentMeaning = word.translation_es || word.translation;
        }

        if (grammarBox) {
            grammarBox.classList.remove('hidden');
            if (tenseBadge && word) tenseBadge.textContent = `Vocabulario: ${word.word}`;
            if (grammarRule && word) {
                grammarRule.textContent = `Categoría: ${getWordType(word)} (${getWordRegister(word)}) • Significado: ${word.translation_es || word.translation}`;
            }
        }
        if (sentenceCounter) {
            sentenceCounter.textContent = `Elemento ${state.currentIndex + 1} / ${totalVocab}`;
        }
    }

    rsvpState.words = rsvpState.currentSentence.trim().split(/\s+/).filter(w => w.length > 0);
    rsvpState.chunks = buildRSVPChunks(rsvpState.words, rsvpState.chunkMode);

    if (!keepIndex || rsvpState.chunkIndex >= rsvpState.chunks.length || rsvpState.chunkIndex < 0) {
        rsvpState.chunkIndex = 0;
    }

    renderRSVPChunk(rsvpState.chunks[rsvpState.chunkIndex]);
    renderRSVPTokens();
    updateRSVPWordProgress();

    const pText = document.getElementById('rsvpPhoneticText');
    const mText = document.getElementById('rsvpMeaningText');
    if (pText) pText.textContent = `Pronunciación (Flujo Conectado): ${rsvpState.currentPhonetic}`;
    if (mText) mText.textContent = `Significado: ${rsvpState.currentMeaning}`;

    const pbStatus = document.getElementById('rsvpPlaybackStatus');
    if (pbStatus && !rsvpState.isPlaying) pbStatus.textContent = 'Pausado';
}

function renderRSVPChunk(chunk) {
    const wordDisplay = document.querySelector('.rsvp-word-display');
    if (!wordDisplay) return;

    if (!chunk || !chunk.words || chunk.words.length === 0) {
        wordDisplay.innerHTML = `<span class="rsvp-left" id="rsvpLeft">rea</span><span class="rsvp-orp" id="rsvpOrp">d</span><span class="rsvp-right" id="rsvpRight">ing</span>`;
        return;
    }

    if (chunk.words.length === 1) {
        wordDisplay.classList.remove('chunked');
        const clean = chunk.words[0].trim();
        const orpIdx = calculateORPIndex(clean);
        const leftPart = clean.slice(0, orpIdx);
        const orpChar = clean[orpIdx] || '';
        const rightPart = clean.slice(orpIdx + 1);

        wordDisplay.innerHTML = `
            <span class="rsvp-left" id="rsvpLeft">${leftPart}</span>
            <span class="rsvp-orp" id="rsvpOrp">${orpChar}</span>
            <span class="rsvp-right" id="rsvpRight">${rightPart}</span>
        `;
    } else {
        wordDisplay.classList.add('chunked');
        let html = '';
        chunk.words.forEach((w, idx) => {
            const clean = w.trim();
            const orpIdx = calculateORPIndex(clean);
            const left = clean.slice(0, orpIdx);
            const orp = clean[orpIdx] || '';
            const right = clean.slice(orpIdx + 1);

            html += `<span class="rsvp-chunk-item"><span class="rsvp-left" style="width:auto;text-align:inherit;">${left}</span><span class="rsvp-orp">${orp}</span><span class="rsvp-right" style="width:auto;text-align:inherit;">${right}</span></span>`;

            if (idx < chunk.words.length - 1) {
                const links = isConsonantVowelLink(chunk.words[idx], chunk.words[idx + 1]);
                html += `<span class="rsvp-chunk-link" title="${links ? 'Enlace fonético natural' : 'Grupo de pensamiento continuo'}">‿</span>`;
            }
        });
        wordDisplay.innerHTML = html;
    }
}

function renderRSVPTokens() {
    const container = document.getElementById('rsvpSentenceTokens');
    if (!container) return;

    container.innerHTML = '';
    const currentChunk = rsvpState.chunks[rsvpState.chunkIndex];
    const activeIndices = currentChunk ? currentChunk.tokenIndices : [0];

    rsvpState.words.forEach((w, idx) => {
        const isCurrentActive = activeIndices.includes(idx);
        const token = document.createElement('button');
        token.type = 'button';
        token.className = `rsvp-token ${isCurrentActive ? 'active-chunk' : ''}`;
        token.dataset.index = idx.toString();
        token.textContent = w;
        token.title = `Saltar al bloque que contiene "${w}"`;
        token.addEventListener('click', () => {
            jumpToRSVPTokenIndex(idx);
        });
        container.appendChild(token);

        // Add visual linking badge if consonant-to-vowel connects to next word
        if (idx < rsvpState.words.length - 1) {
            const links = isConsonantVowelLink(w, rsvpState.words[idx + 1]);
            const linkSpan = document.createElement('span');
            linkSpan.className = 'rsvp-token-link';
            linkSpan.textContent = '‿';
            linkSpan.title = links ? `Enlace fonético: "${w}" se une con "${rsvpState.words[idx + 1]}" sin pausa` : 'Flujo continuo';
            container.appendChild(linkSpan);
        }
    });
}

function updateRSVPTokenHighlight() {
    const container = document.getElementById('rsvpSentenceTokens');
    if (!container) return;

    const currentChunk = rsvpState.chunks[rsvpState.chunkIndex];
    const activeIndices = currentChunk ? currentChunk.tokenIndices : [];

    const tokens = container.querySelectorAll('.rsvp-token');
    tokens.forEach((t, idx) => {
        const isChunkActive = activeIndices.includes(idx);
        t.classList.toggle('active-chunk', isChunkActive);
        t.classList.toggle('active', isChunkActive && idx === activeIndices[0]);
        if (isChunkActive && idx === activeIndices[0]) {
            t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
    });
    updateRSVPWordProgress();
}

function updateRSVPWordProgress() {
    const wordProgress = document.getElementById('rsvpWordProgress');
    if (wordProgress) {
        const totalChunks = rsvpState.chunks.length || 1;
        const currentChunkNum = Math.min(rsvpState.chunkIndex + 1, totalChunks);
        const modeLabel = rsvpState.chunkMode === 1 ? '1 palabra' : `${rsvpState.chunkMode} palabras`;
        wordProgress.textContent = `Bloque ${currentChunkNum} de ${totalChunks} (${modeLabel})`;
    }
}

function stepRSVPWord(direction) {
    if (rsvpState.chunks.length === 0) return;
    if (rsvpState.isPlaying) stopRSVP();

    const newIndex = rsvpState.chunkIndex + direction;
    if (newIndex >= 0 && newIndex < rsvpState.chunks.length) {
        rsvpState.chunkIndex = newIndex;
    } else if (newIndex < 0) {
        rsvpState.chunkIndex = 0;
    } else if (newIndex >= rsvpState.chunks.length) {
        rsvpState.chunkIndex = rsvpState.chunks.length - 1;
    }

    renderRSVPChunk(rsvpState.chunks[rsvpState.chunkIndex]);
    updateRSVPTokenHighlight();

    const pbStatus = document.getElementById('rsvpPlaybackStatus');
    if (pbStatus) pbStatus.textContent = 'Paso a paso';
}

function jumpToRSVPTokenIndex(tokenIdx) {
    if (rsvpState.chunks.length === 0) return;
    if (rsvpState.isPlaying) stopRSVP();

    const targetChunkIdx = rsvpState.chunks.findIndex(c => c.tokenIndices.includes(tokenIdx));
    if (targetChunkIdx !== -1) {
        rsvpState.chunkIndex = targetChunkIdx;
        renderRSVPChunk(rsvpState.chunks[rsvpState.chunkIndex]);
        updateRSVPTokenHighlight();
        const pbStatus = document.getElementById('rsvpPlaybackStatus');
        if (pbStatus) pbStatus.textContent = 'Pausado';
    }
}

function prevRSVPSentence(autoResume = false) {
    const shouldResume = autoResume || rsvpState.isPlaying;
    stopRSVP();

    if (rsvpState.source === 'grammar') {
        if (!grammarState.filteredItems || grammarState.filteredItems.length === 0) applyGrammarFilters();
        const total = grammarState.filteredItems.length || 1;
        grammarState.currentIndex = (grammarState.currentIndex - 1 + total) % total;
    } else if (rsvpState.source === 'vocab') {
        if (!state.currentWords || state.currentWords.length === 0) loadWords();
        const total = state.currentWords.length || 1;
        state.currentIndex = (state.currentIndex - 1 + total) % total;
    }

    initRSVP(false);
    if (shouldResume) startRSVP();
}

function nextRSVPSentence(autoResume = false) {
    const shouldResume = autoResume || rsvpState.isPlaying;
    stopRSVP();

    if (rsvpState.source === 'grammar') {
        if (!grammarState.filteredItems || grammarState.filteredItems.length === 0) applyGrammarFilters();
        const total = grammarState.filteredItems.length || 1;
        grammarState.currentIndex = (grammarState.currentIndex + 1) % total;
    } else if (rsvpState.source === 'vocab') {
        if (!state.currentWords || state.currentWords.length === 0) loadWords();
        const total = state.currentWords.length || 1;
        state.currentIndex = (state.currentIndex + 1) % total;
    }

    initRSVP(false);
    if (shouldResume) startRSVP();
}

function restartRSVPSentence() {
    stopRSVP();
    rsvpState.chunkIndex = 0;
    renderRSVPChunk(rsvpState.chunks[0]);
    updateRSVPTokenHighlight();
    const pbStatus = document.getElementById('rsvpPlaybackStatus');
    if (pbStatus) pbStatus.textContent = 'Reiniciado al inicio';
}

function speakRSVPSentence() {
    if (rsvpState.currentSentence) {
        speakText(rsvpState.currentSentence, { rate: 1.0 });
    }
}

function toggleRSVP() {
    if (rsvpState.isPlaying) {
        stopRSVP();
    } else {
        startRSVP();
    }
}

function startRSVP() {
    if (rsvpState.intervalId) {
        clearTimeout(rsvpState.intervalId);
        rsvpState.intervalId = null;
    }

    if (rsvpState.chunks.length === 0) initRSVP(false);
    if (rsvpState.chunkIndex >= rsvpState.chunks.length) {
        rsvpState.chunkIndex = 0;
    }
    rsvpState.isPlaying = true;

    const toggleBtn = document.getElementById('rsvpToggleBtn');
    if (toggleBtn) toggleBtn.textContent = '⏸ Pausar RSVP';

    const pbStatus = document.getElementById('rsvpPlaybackStatus');
    if (pbStatus) pbStatus.textContent = `▶ Leyendo (${rsvpState.wpm} WPM - ${rsvpState.chunkMode}p/bloque)`;

    // Calculate delay per chunk based on WPM and words in chunk
    const baseWordDelayMs = Math.max(70, Math.round(60000 / rsvpState.wpm));

    const step = () => {
        if (!rsvpState.isPlaying) return;

        if (rsvpState.chunkIndex >= rsvpState.chunks.length) {
            if (rsvpState.autoAdvance) {
                const statusEl = document.getElementById('rsvpPlaybackStatus');
                if (statusEl) statusEl.textContent = '⏳ Siguiente oración...';
                rsvpState.intervalId = setTimeout(() => {
                    if (!rsvpState.isPlaying) return;
                    nextRSVPSentence(true);
                }, 750);
            } else {
                stopRSVP();
                const statusEl = document.getElementById('rsvpPlaybackStatus');
                if (statusEl) statusEl.textContent = '✔ Oración completada';
                if (toggleBtn) toggleBtn.textContent = '▶ Repetir Oración';
            }
            return;
        }

        const currentChunk = rsvpState.chunks[rsvpState.chunkIndex];
        renderRSVPChunk(currentChunk);
        updateRSVPTokenHighlight();
        rsvpState.chunkIndex++;

        let chunkDelay = baseWordDelayMs * (currentChunk.words.length || 1);
        const lastWord = currentChunk.words[currentChunk.words.length - 1] || '';

        // Add slight extra delay for punctuation at chunk end
        if (lastWord.endsWith('.') || lastWord.endsWith('!') || lastWord.endsWith('?')) {
            chunkDelay = chunkDelay * 1.7;
        } else if (lastWord.endsWith(',') || lastWord.endsWith(';') || lastWord.endsWith(':')) {
            chunkDelay = chunkDelay * 1.35;
        }

        rsvpState.intervalId = setTimeout(step, chunkDelay);
    };

    step();
}

function stopRSVP() {
    rsvpState.isPlaying = false;
    if (rsvpState.intervalId) {
        clearTimeout(rsvpState.intervalId);
        rsvpState.intervalId = null;
    }
    const toggleBtn = document.getElementById('rsvpToggleBtn');
    if (toggleBtn) toggleBtn.textContent = '▶ Comenzar RSVP';

    const pbStatus = document.getElementById('rsvpPlaybackStatus');
    if (pbStatus && (pbStatus.textContent.startsWith('▶') || pbStatus.textContent.startsWith('⏳'))) {
        pbStatus.textContent = 'Pausado';
    }
}

// ===== Grammar Anti-Translation Engine (Past vs Perfect) =====
function updateGrammar() {
    if (!grammarState.filteredItems || grammarState.filteredItems.length === 0) {
        applyGrammarFilters();
    }

    const item = grammarState.filteredItems[grammarState.currentIndex];
    if (!item) return;

    const tenseBadge = document.getElementById('grammarTenseBadge');
    const currCount = document.getElementById('grammarCurrentCount');
    const totCount = document.getElementById('grammarTotalCount');
    const engText = document.getElementById('grammarEnglishText');
    const phonText = document.getElementById('grammarPhoneticText');
    const spanText = document.getElementById('grammarSpanishNeutral');
    const trapDesc = document.getElementById('grammarTrapDesc');
    const cogDesc = document.getElementById('grammarCognitiveDesc');
    const verbBase = document.getElementById('grammarVerbBase');
    const verbPast = document.getElementById('grammarVerbPast');
    const verbPart = document.getElementById('grammarVerbPart');
    const edBadge = document.getElementById('grammarEdBadge');

    if (tenseBadge) tenseBadge.textContent = `${item.tenseType.replace(/-/g, ' ').toUpperCase()} (${item.category === 'it-tech' ? 'IT / Tech' : 'Cotidiano'})`;
    if (currCount) currCount.textContent = grammarState.currentIndex + 1;
    if (totCount) totCount.textContent = grammarState.filteredItems.length;
    if (engText) engText.textContent = `"${item.english}"`;
    if (phonText) phonText.textContent = item.phonetic;
    if (spanText) spanText.textContent = `Equivalente Latino: "${item.spanishNeutral}"`;
    if (trapDesc) trapDesc.textContent = item.latinTrap;
    if (cogDesc) cogDesc.textContent = item.cognitiveRule;

    if (verbBase) verbBase.textContent = item.keyVerb.base;
    if (verbPast) verbPast.textContent = item.keyVerb.past;
    if (verbPart) verbPart.textContent = item.keyVerb.pastParticiple;
    if (edBadge) {
        edBadge.textContent = `Pronunciación: ${item.keyVerb.phoneticPast}`;
    }

    const prevBtn = document.getElementById('grammarPrevBtn');
    const nextBtn = document.getElementById('grammarNextBtn');
    if (prevBtn) prevBtn.disabled = grammarState.currentIndex === 0;
    if (nextBtn) nextBtn.disabled = grammarState.currentIndex === grammarState.filteredItems.length - 1;
}

// ===== Scenario Simulator Engine =====
function initScenario() {
    scenarioState.scenarioIndex = 0;
    scenarioState.stepIndex = 0;
    scenarioState.score = 100;
    scenarioState.isCompleted = false;
    renderScenarioStep();
}

function renderScenarioStep() {
    const scenario = PROFESSIONAL_SCENARIOS[scenarioState.scenarioIndex];
    if (!scenario) return;

    const step = scenario.steps[scenarioState.stepIndex];
    if (!step) {
        renderScenarioCompleted(scenario);
        return;
    }

    const scoreVal = document.getElementById('scenarioScoreValue');
    const briefingText = document.getElementById('scenarioBriefingText');
    const speakerName = document.getElementById('scenarioSpeakerName');
    const speakerContext = document.getElementById('scenarioSpeakerContext');
    const dialogueQuote = document.getElementById('scenarioDialogueQuote');
    const questionTitle = document.getElementById('scenarioQuestionTitle');
    const choicesList = document.getElementById('scenarioChoicesList');
    const feedbackBox = document.getElementById('scenarioFeedbackBox');

    if (scoreVal) scoreVal.textContent = scenarioState.score;
    if (briefingText) briefingText.textContent = scenario.briefing;
    if (speakerName) speakerName.textContent = step.speaker;
    if (speakerContext) speakerContext.textContent = step.context;
    if (dialogueQuote) dialogueQuote.textContent = `"${step.dialogue}"`;
    if (questionTitle) questionTitle.textContent = step.question;

    if (feedbackBox) feedbackBox.classList.add('hidden');

    if (choicesList) {
        choicesList.innerHTML = step.choices.map((c, i) => `
            <button type="button" class="scenario-choice-btn" data-index="${i}">
                <span class="scenario-choice-label">${c.text}</span>
                <span class="scenario-choice-draft">Draft: "${c.englishDraft}"</span>
            </button>
        `).join('');

        choicesList.querySelectorAll('.scenario-choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                handleScenarioChoice(step, idx);
            });
        });
    }
}

function handleScenarioChoice(step, choiceIdx) {
    const choice = step.choices[choiceIdx];
    if (!choice) return;

    const choicesList = document.getElementById('scenarioChoicesList');
    const buttons = choicesList.querySelectorAll('.scenario-choice-btn');
    buttons.forEach((btn, i) => {
        btn.disabled = true;
        if (i === choiceIdx) {
            btn.classList.add(choice.isOptimal ? 'selected-optimal' : 'selected-suboptimal');
        }
    });

    if (!choice.isOptimal) {
        scenarioState.score = Math.max(0, scenarioState.score - (100 - choice.score));
    }

    const scoreVal = document.getElementById('scenarioScoreValue');
    if (scoreVal) scoreVal.textContent = scenarioState.score;

    const feedbackBox = document.getElementById('scenarioFeedbackBox');
    const feedbackTitle = document.getElementById('scenarioFeedbackTitle');
    const feedbackDesc = document.getElementById('scenarioFeedbackDesc');

    if (feedbackBox && feedbackTitle && feedbackDesc) {
        feedbackBox.className = `scenario-feedback-box ${choice.isOptimal ? 'optimal' : 'suboptimal'}`;
        feedbackTitle.textContent = choice.isOptimal ? 'Decisión Óptima' : 'Oportunidad de Mejora';
        feedbackDesc.textContent = `${choice.feedback} Vocabulario clave: [${choice.vocabularyUsed.join(', ')}].`;
        feedbackBox.classList.remove('hidden');
    }

    speakText(choice.englishDraft);
}

function renderScenarioCompleted(scenario) {
    const terminal = document.querySelector('.scenario-dialogue-terminal');
    const choicesList = document.getElementById('scenarioChoicesList');
    const feedbackBox = document.getElementById('scenarioFeedbackBox');

    if (feedbackBox) feedbackBox.classList.add('hidden');
    if (terminal) {
        terminal.innerHTML = `
            <div class="scenario-speaker-name" style="color: var(--success); font-size: 1.125rem;">Escenario Finalizado</div>
            <p style="color: #ffffff; margin-top: 8px;">Has completado el escenario con una puntuación final de <strong>${scenarioState.score}/100</strong>.</p>
            <p style="color: var(--text-secondary); font-size: var(--font-size-xs); margin-top: 4px;">Habilidades evaluadas: ${scenario.targetSkills.join(', ')}.</p>
            <button type="button" class="action-btn" id="scenarioNextScenarioBtn" style="margin-top: 14px; align-self: flex-start;">Siguiente Escenario Profesional &rarr;</button>
        `;

        document.getElementById('scenarioNextScenarioBtn')?.addEventListener('click', () => {
            scenarioState.scenarioIndex = (scenarioState.scenarioIndex + 1) % PROFESSIONAL_SCENARIOS.length;
            scenarioState.stepIndex = 0;
            scenarioState.score = 100;
            renderScenarioStep();
        });
    }
    if (choicesList) choicesList.innerHTML = '';
}

// ===== Quiz Mode Logic =====
function updateQuiz() {
    const word = state.currentWords[state.currentIndex];
    if (!word) return;

    if (el.quizWord) el.quizWord.textContent = word.word;
    if (el.quizPhonetic) el.quizPhonetic.textContent = word.phonetic ? `/${word.phonetic}/` : '';

    const options = generateQuizOptions(word);
    const optionButtons = el.quizOptions.querySelectorAll('.quiz-option');

    optionButtons.forEach((btn, i) => {
        btn.textContent = options[i].text;
        btn.dataset.correct = options[i].correct;
        btn.classList.remove('correct', 'incorrect');
        btn.disabled = false;
    });

    if (el.scoreValue) el.scoreValue.textContent = state.quizScore;
    if (el.totalQuestions) el.totalQuestions.textContent = state.quizTotal;
}

function generateQuizOptions(correctWord) {
    const correctTranslation = correctWord.translation_es || correctWord.translation;
    const options = [{ text: correctTranslation, correct: true }];

    const wrongCandidates = state.currentWords
        .filter(w => (w.translation_es || w.translation) !== correctTranslation)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    wrongCandidates.forEach(w => {
        options.push({ text: w.translation_es || w.translation, correct: false });
    });

    while (options.length < 4) {
        options.push({ text: 'significado contextual secundario', correct: false });
    }

    return options.sort(() => Math.random() - 0.5);
}

function handleQuizAnswer(index) {
    const optionButtons = el.quizOptions.querySelectorAll('.quiz-option');
    const selected = optionButtons[index];
    if (!selected) return;

    const isCorrect = selected.dataset.correct === 'true';
    state.quizTotal++;

    const word = state.currentWords[state.currentIndex];

    if (isCorrect) {
        state.quizScore++;
        selected.classList.add('correct');
        el.quizFeedback.querySelector('.feedback-text').textContent = 'Correcto. Excelente retención.';
        el.quizFeedback.querySelector('.feedback-text').className = 'feedback-text correct';
        markWord('mastered');
        speakText(word.word);
    } else {
        selected.classList.add('incorrect');
        optionButtons.forEach(btn => {
            if (btn.dataset.correct === 'true') btn.classList.add('correct');
        });
        el.quizFeedback.querySelector('.feedback-text').textContent = 'Incorrecto. La respuesta correcta está resaltada en verde.';
        el.quizFeedback.querySelector('.feedback-text').className = 'feedback-text incorrect';
        recordFailure(word);
    }

    optionButtons.forEach(btn => btn.disabled = true);
    el.quizFeedback.classList.remove('hidden');

    if (el.scoreValue) el.scoreValue.textContent = state.quizScore;
    if (el.totalQuestions) el.totalQuestions.textContent = state.quizTotal;

    if (isCorrect) {
        setTimeout(() => {
            if (!el.quizFeedback.classList.contains('hidden')) {
                el.nextQuestionBtn?.click();
            }
        }, 1600);
    }
}

// ===== Typing Mode Logic =====
function updateTyping() {
    const word = state.currentWords[state.currentIndex];
    if (!word) return;

    if (el.typingDefinition) el.typingDefinition.textContent = word.translation_es || word.translation;

    const blanked = word.example.replace(new RegExp(`\\b${escapeRegExp(word.word)}\\b`, 'gi'), '_______');
    if (el.typingExample) el.typingExample.textContent = `"${blanked}"`;

    const formatLetters = word.word.split('').map(c => c === ' ' ? ' ' : '_').join(' ');
    if (el.typingFormatHint) el.typingFormatHint.textContent = `${formatLetters} (${word.word.length} letras)`;

    if (el.typingInput) {
        el.typingInput.value = '';
        el.typingInput.focus();
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function checkTypingAnswer() {
    const word = state.currentWords[state.currentIndex];
    if (!word || !el.typingInput) return;

    const userAnswer = el.typingInput.value.trim().toLowerCase();
    const correct = word.word.trim().toLowerCase();
    const feedbackText = el.typingFeedback.querySelector('.feedback-text');

    if (userAnswer === correct) {
        feedbackText.textContent = `Correcto. "${word.word}" es exacto.`;
        feedbackText.className = 'feedback-text correct';
        markWord('mastered');
        speakText(word.example);

        setTimeout(() => {
            if (!el.typingFeedback.classList.contains('hidden')) {
                el.nextWordBtn?.click();
            }
        }, 2200);
    } else {
        feedbackText.textContent = `Intenta de nuevo o presiona "Dar una Pista".`;
        feedbackText.className = 'feedback-text incorrect';
        recordFailure(word);
    }

    el.typingFeedback.classList.remove('hidden');
}

// ===== Fill in the Blanks Mode Logic =====
function initFillBlanks() {
    if (!el.fillblanksMode) return;
    el.fillblanksFeedback.classList.add('hidden');

    const candidates = [...state.currentWords];
    shuffleArray(candidates);
    const selected = candidates.slice(0, 5);

    fillBlanksCorrectAnswers = selected.map(w => w.word.toLowerCase());

    let html = '';
    selected.forEach((wordObj, index) => {
        const sentence = wordObj.example;
        const parts = sentence.split(new RegExp(`(${escapeRegExp(wordObj.word)})`, 'gi'));
        let blankedSentence = '';

        parts.forEach(part => {
            if (part.toLowerCase() === wordObj.word.toLowerCase()) {
                const optionsHtml = selected
                    .map(opt => `<option value="${opt.word.toLowerCase()}">${opt.word}</option>`)
                    .sort(() => Math.random() - 0.5)
                    .join('');
                blankedSentence += `<select class="fillblank-select" data-index="${index}" aria-label="Seleccionar palabra"><option value="" disabled selected>--- seleccionar ---</option>${optionsHtml}</select>`;
            } else {
                blankedSentence += part;
            }
        });

        html += `
        <div class="fillblank-item">
            <div class="fillblank-text-row">
                <button type="button" class="fillblank-audio-btn" data-audio="${sentence.replace(/"/g, '&quot;')}" title="Escuchar oración">Audio</button>
                <p>${blankedSentence}</p>
            </div>
            <small class="fillblank-meaning">${wordObj.translation_es || wordObj.translation}</small>
        </div>
        `;
    });

    el.fillblanksContent.innerHTML = html;

    el.fillblanksContent.querySelectorAll('.fillblank-audio-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            speakText(btn.dataset.audio);
        });
    });
}

function checkFillBlanks() {
    const selects = el.fillblanksContent.querySelectorAll('.fillblank-select');
    let score = 0;
    let total = selects.length;

    selects.forEach(select => {
        const index = parseInt(select.dataset.index);
        const answer = select.value;
        const correct = fillBlanksCorrectAnswers[index];

        if (answer === correct) {
            select.classList.remove('incorrect');
            select.classList.add('correct');
            score++;
            const wordObj = state.currentWords.find(w => w.word.toLowerCase() === correct);
            if (wordObj) markWordExplicit('mastered', wordObj);
        } else {
            select.classList.add('incorrect');
            select.classList.remove('correct');
            const wordObj = state.currentWords.find(w => w.word.toLowerCase() === correct);
            if (wordObj) recordFailure(wordObj);
        }
    });

    const feedbackText = el.fillblanksFeedback.querySelector('.feedback-text');
    if (score === total) {
        feedbackText.textContent = 'Todas las oraciones están completadas correctamente.';
        feedbackText.className = 'feedback-text correct';
    } else {
        feedbackText.textContent = `Has acertado ${score} de ${total}. Corrige los recuadros rojos.`;
        feedbackText.className = 'feedback-text incorrect';
    }
    el.fillblanksFeedback.classList.remove('hidden');
}

function markWordExplicit(status, wordObj) {
    const key = getWordKey(wordObj);
    state.progress[key] = status;
    saveProgress();
    updateProgress();
}

// ===== Matching Mode Logic =====
function initMatching() {
    const grid = document.getElementById('matchingGrid');
    const feedback = document.getElementById('matchingFeedback');
    const scoreEl = document.getElementById('matchingScore');

    if (feedback) feedback.classList.add('hidden');

    const candidates = [...state.currentWords];
    shuffleArray(candidates);
    const selected = candidates.slice(0, 4);

    const cards = [];
    selected.forEach((word, index) => {
        cards.push({
            id: `w-${index}`,
            matchId: index,
            type: 'word',
            content: word.word,
            rawWord: word.word,
            state: 'face-down'
        });
        cards.push({
            id: `t-${index}`,
            matchId: index,
            type: 'def',
            content: word.translation_es || word.translation,
            rawWord: word.word,
            state: 'face-down'
        });
    });

    shuffleArray(cards);
    matchingState.cards = cards;
    matchingState.selectedCards = [];
    matchingState.matchedPairs = 0;
    matchingState.totalPairs = selected.length;

    if (scoreEl) scoreEl.textContent = '0';
    renderMatchingGrid();
}

function renderMatchingGrid() {
    const grid = document.getElementById('matchingGrid');
    if (!grid) return;

    grid.innerHTML = '';
    matchingState.cards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = `matching-card type-${card.type} ${card.state}`;
        cardEl.textContent = card.content;
        cardEl.dataset.index = index;
        cardEl.addEventListener('click', () => handleMatchingClick(index));
        grid.appendChild(cardEl);
    });
}

function handleMatchingClick(index) {
    const card = matchingState.cards[index];
    if (card.state === 'matched' || card.state === 'selected' || card.state === 'mismatch') return;

    if (matchingState.selectedCards.length < 2) {
        card.state = 'selected';
        matchingState.selectedCards.push({ index, ...card });
        renderMatchingGrid();

        if (matchingState.selectedCards.length === 2) {
            const [c1, c2] = matchingState.selectedCards;
            if (c1.matchId === c2.matchId && c1.type !== c2.type) {
                matchingState.cards[c1.index].state = 'matched';
                matchingState.cards[c2.index].state = 'matched';
                matchingState.matchedPairs++;

                speakText(c1.type === 'word' ? c1.content : c2.content);
                matchingState.selectedCards = [];
                renderMatchingGrid();

                const scoreEl = document.getElementById('matchingScore');
                if (scoreEl) scoreEl.textContent = matchingState.matchedPairs;

                if (matchingState.matchedPairs === matchingState.totalPairs) {
                    const feedback = document.getElementById('matchingFeedback');
                    if (feedback) feedback.classList.remove('hidden');
                }
            } else {
                matchingState.cards[c1.index].state = 'mismatch';
                matchingState.cards[c2.index].state = 'mismatch';
                renderMatchingGrid();

                [c1, c2].forEach(c => {
                    const wordObj = state.currentWords.find(w => w.word === c.rawWord);
                    if (wordObj) recordFailure(wordObj);
                });

                setTimeout(() => {
                    matchingState.cards[c1.index].state = 'face-down';
                    matchingState.cards[c2.index].state = 'face-down';
                    matchingState.selectedCards = [];
                    renderMatchingGrid();
                }, 750);
            }
        }
    }
}

// ===== Listening / Dictation Mode Logic =====
function initListening() {
    listeningState.revealed = false;
    pickDictationWord();
    updateListeningStats();
}

function pickDictationWord() {
    if (state.currentWords.length === 0) return;
    const idx = Math.floor(Math.random() * state.currentWords.length);
    listeningState.currentWord = state.currentWords[idx];
    listeningState.revealed = false;

    const feedback = document.getElementById('dictFeedback');
    if (feedback) feedback.classList.add('hidden');

    const input = document.getElementById('dictInput');
    if (input) {
        input.value = '';
        input.focus();
    }
}

function speakDictation(rateOverride = null) {
    const word = listeningState.currentWord;
    if (!word) return;

    const textToSpeak = word.example ? word.example.replace(/["_]/g, '') : word.word;
    const rateEl = document.getElementById('speechRate');
    const rate = rateOverride || parseFloat(rateEl?.value || '0.8');

    speakText(textToSpeak, rate);
}

function checkDictation() {
    const word = listeningState.currentWord;
    if (!word || listeningState.revealed) return;

    const input = document.getElementById('dictInput');
    const userAnswer = (input?.value || '').trim().toLowerCase();
    const cleanWord = word.word.trim().toLowerCase();
    const cleanExample = word.example.replace(/["_]/g, '').trim().toLowerCase();

    listeningState.total++;
    listeningState.revealed = true;

    const isMatch = userAnswer === cleanWord ||
                    userAnswer === cleanExample ||
                    userAnswer === cleanWord.replace(/[^a-z0-9]/gi, '') ||
                    cleanExample.includes(userAnswer && userAnswer.length > 3 ? userAnswer : '$$$');

    if (isMatch) {
        listeningState.correct++;
        markWordExplicit('mastered', word);
    } else {
        recordFailure(word);
    }

    const feedback = document.getElementById('dictFeedback');
    const userEl = document.getElementById('dictUserAnswer');
    const correctEl = document.getElementById('dictCorrectAnswer');
    const diffEl = document.getElementById('dictDiff');

    if (feedback) feedback.classList.remove('hidden');
    if (userEl) {
        userEl.textContent = userAnswer || '(sin respuesta)';
        userEl.style.color = isMatch ? 'var(--success)' : 'var(--error)';
    }
    if (correctEl) correctEl.textContent = `${word.word} → "${word.example}"`;
    if (diffEl) {
        if (isMatch) {
            diffEl.textContent = 'Respuesta correcta.';
            diffEl.style.background = 'var(--success-bg)';
        } else {
            diffEl.textContent = `Significado: ${word.translation_es || word.translation}`;
            diffEl.style.background = 'var(--error-bg)';
        }
    }

    updateListeningStats();
}

function updateListeningStats() {
    const correctEl = document.getElementById('dictCorrect');
    const totalEl = document.getElementById('dictTotal');
    const accEl = document.getElementById('dictAccuracy');

    if (correctEl) correctEl.textContent = listeningState.correct;
    if (totalEl) totalEl.textContent = listeningState.total;
    if (accEl) {
        const acc = listeningState.total > 0 ? Math.round((listeningState.correct / listeningState.total) * 100) : 0;
        accEl.textContent = `${acc}%`;
    }
}

// ===== AI Reading & Immersion Logic =====
async function handleGenerateText() {
    if (readingState.isLoading) return;

    readingState.isLoading = true;
    showReadingLoading(true);
    hideReadingError();
    stopAudio();

    try {
        const topicInput = document.getElementById('readingTopic');
        const levelSelect = document.getElementById('readingLevel');

        const topic = topicInput?.value || 'Daily Conversation';
        const level = levelSelect?.value || 'B1-B2';

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category: 'custom',
                topic,
                level
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Error al generar diálogo con IA.');
        }

        const result = await response.json();
        readingState.currentText = result;
        readingState.difficultWords = result.difficultWords || [];

        displayReadingText(result);
    } catch (error) {
        console.error('Error generating AI text:', error);
        showReadingError(error.message);
    } finally {
        readingState.isLoading = false;
        showReadingLoading(false);
    }
}

function displayReadingText(result) {
    const textContent = document.getElementById('readingTextContent');
    const textContainer = document.getElementById('readingTextContainer');
    if (!textContent || !textContainer) return;

    let html = `<h2 class="reading-title">${result.title || 'Diálogo de Práctica'}</h2>`;

    if (result.segments && Array.isArray(result.segments)) {
        result.segments.forEach((seg, idx) => {
            html += `
            <div class="reading-segment" data-segment-index="${idx}">
                <div class="segment-header">
                    ${seg.speaker ? `<strong class="reading-speaker">${seg.speaker}</strong>` : '<span></span>'}
                    <button type="button" class="segment-audio-btn" data-text="${(seg.english || seg.text).replace(/"/g, '&quot;')}" title="Escuchar esta frase">Audio</button>
                </div>
                <p class="reading-original">${highlightDifficultWords(seg.english || seg.text, result.difficultWords)}</p>
                ${seg.phonetic ? `<p class="reading-phonetic">[Fonética]: ${seg.phonetic}</p>` : ''}
                ${seg.spanish ? `<p class="reading-spanish">${seg.spanish}</p>` : ''}
            </div>
            `;
        });
    } else if (result.text) {
        html += `<div class="reading-body">${highlightDifficultWords(result.text, result.difficultWords)}</div>`;
    }

    textContent.innerHTML = html;
    textContainer.classList.remove('hidden');

    textContent.querySelectorAll('.segment-audio-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const segIdx = parseInt(btn.closest('.reading-segment')?.dataset?.segmentIndex || '0');
            const seg = result.segments?.[segIdx];
            const isMale = (seg?.speaker && /alex|john|david|michael|tom|mark|daniel|james|robert|interviewer|boss|engineer/i.test(seg.speaker)) || (segIdx % 2 === 1);
            const voice = isMale ? 'en-US-GuyNeural' : 'en-US-JennyNeural';
            speakText(btn.dataset.text, { voice, rate: 1.0 });
        });
    });
}

function playFullDialogue() {
    if (!readingState.currentText || !readingState.currentText.segments) return;

    const segments = readingState.currentText.segments;
    let currentIdx = 0;

    function playNext() {
        if (currentIdx >= segments.length) {
            document.querySelectorAll('.reading-segment').forEach(s => s.classList.remove('playing'));
            return;
        }

        const seg = segments[currentIdx];
        const text = seg.english || seg.text;
        const isMale = (seg.speaker && /alex|john|david|michael|tom|mark|daniel|james|robert|interviewer|boss|engineer/i.test(seg.speaker)) || (currentIdx % 2 === 1);
        const segmentVoice = isMale ? 'en-US-GuyNeural' : 'en-US-JennyNeural';

        document.querySelectorAll('.reading-segment').forEach((s, idx) => {
            s.classList.toggle('playing', idx === currentIdx);
        });

        currentIdx++;
        speakText(text, { voice: segmentVoice, rate: 1.0 }, () => {
            setTimeout(playNext, 450);
        });
    }

    playNext();
}

function highlightDifficultWords(text, difficultWords) {
    if (!text || !difficultWords || difficultWords.length === 0) return text || '';

    let highlighted = text;
    difficultWords.forEach((wordObj, index) => {
        const regex = new RegExp(`\\b(${escapeRegExp(wordObj.word)})\\b`, 'gi');
        highlighted = highlighted.replace(regex, `<span class="difficult-word" data-word-index="${index}">$1</span>`);
    });
    return highlighted;
}

function showWordTooltip(targetEl, wordData) {
    const tooltip = document.getElementById('wordTooltip');
    if (!tooltip) return;

    tooltip.innerHTML = `
        <div class="tooltip-word">${wordData.word}</div>
        <div class="tooltip-definition">${wordData.definition}</div>
        ${wordData.example ? `<div class="tooltip-example">"${wordData.example}"</div>` : ''}
    `;

    const rect = targetEl.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    tooltip.style.left = `${rect.left + (rect.width / 2) + scrollLeft}px`;
    tooltip.style.top = `${rect.bottom + 8 + scrollTop}px`;
    tooltip.classList.remove('hidden');
    tooltip.classList.add('visible');
}

function hideWordTooltip() {
    const tooltip = document.getElementById('wordTooltip');
    if (tooltip) {
        tooltip.classList.add('hidden');
        tooltip.classList.remove('visible');
    }
}

function showReadingLoading(show) {
    const spinner = document.getElementById('readingLoading');
    const genBtn = document.getElementById('generateTextBtn');
    if (spinner) spinner.classList.toggle('hidden', !show);
    if (genBtn) genBtn.disabled = show;
}

function showReadingError(msg) {
    const errEl = document.getElementById('readingError');
    if (errEl) {
        errEl.textContent = msg;
        errEl.classList.remove('hidden');
    }
}

function hideReadingError() {
    const errEl = document.getElementById('readingError');
    if (errEl) errEl.classList.add('hidden');
}

// ===== Guided Session Stepper =====
function startSession() {
    sessionState.active = true;
    sessionState.currentPhase = 0;
    sessionState.startTime = Date.now();

    document.getElementById('categoryNav')?.classList.add('hidden');
    document.getElementById('modeNav')?.classList.add('hidden');
    document.getElementById('setContainer')?.classList.add('hidden');
    document.getElementById('sessionOverlay')?.classList.remove('hidden');

    if (sessionState.timerInterval) clearInterval(sessionState.timerInterval);
    sessionState.timerInterval = setInterval(() => {
        const elapsedSecs = Math.floor((Date.now() - sessionState.startTime) / 1000);
        const mins = Math.floor(elapsedSecs / 60).toString().padStart(2, '0');
        const secs = (elapsedSecs % 60).toString().padStart(2, '0');
        const timerText = document.getElementById('sessionTimerText');
        if (timerText) timerText.textContent = `${mins}:${secs}`;
    }, 1000);

    renderSessionStepper();
    goToSessionPhase(0);
}

function goToSessionPhase(phaseIndex) {
    sessionState.currentPhase = phaseIndex;
    const mode = sessionState.phases[phaseIndex];
    state.currentMode = mode;

    document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    renderSessionStepper();
    resetMode();
    updateDisplay();
}

function advanceSession() {
    if (sessionState.currentPhase < sessionState.phases.length - 1) {
        goToSessionPhase(sessionState.currentPhase + 1);
    } else {
        endSession(true);
    }
}

function endSession(completed = false) {
    if (sessionState.timerInterval) clearInterval(sessionState.timerInterval);
    const elapsed = sessionState.startTime ? Math.floor((Date.now() - sessionState.startTime) / 1000) : 0;

    recordStudyTime(elapsed, completed);
    sessionState.active = false;
    sessionState.startTime = null;

    document.getElementById('categoryNav')?.classList.remove('hidden');
    document.getElementById('modeNav')?.classList.remove('hidden');
    document.getElementById('setContainer')?.classList.remove('hidden');
    document.getElementById('sessionOverlay')?.classList.add('hidden');

    if (completed) {
        alert(`Sesión completada con éxito en ${Math.floor(elapsed / 60)}m ${elapsed % 60}s. Has ejercitado todas las habilidades.`);
    }
}

function renderSessionStepper() {
    const stepper = document.getElementById('sessionStepper');
    if (!stepper) return;

    stepper.innerHTML = sessionState.phaseLabels.map((label, i) => {
        let cls = 'phase-step';
        if (i < sessionState.currentPhase) cls += ' completed';
        if (i === sessionState.currentPhase) cls += ' active';
        return `<div class="${cls}"><span class="phase-number">${i + 1}</span><span class="phase-label">${label}</span></div>`;
    }).join('');
}

// ===== Progress & Profile System =====
function recordStudyTime(seconds, completedSession = false) {
    try {
        const profile = JSON.parse(localStorage.getItem('vocabProfile') || '{"totalTimerSeconds":0,"sessionsCompleted":0,"setHistory":[]}');
        profile.totalTimerSeconds += seconds;
        if (completedSession) profile.sessionsCompleted += 1;

        profile.setHistory.unshift({
            category: state.currentCategory,
            set: state.currentSet,
            date: new Date().toLocaleDateString('es-ES'),
            type: completedSession ? 'Sesión Guiada' : 'Práctica',
            completed: completedSession,
            durationSeconds: seconds
        });

        if (profile.setHistory.length > 30) profile.setHistory = profile.setHistory.slice(0, 30);
        localStorage.setItem('vocabProfile', JSON.stringify(profile));
    } catch (e) {
        console.error(e);
    }
}

function updateProgress() {
    let masteredCount = 0;
    let total = state.currentWords.length;

    state.currentWords.forEach(word => {
        const key = getWordKey(word);
        if (state.progress[key] === 'mastered') masteredCount++;
    });

    const percent = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
    const progressText = el.progressIndicator?.querySelector('.progress-text');
    if (progressText) progressText.textContent = `${masteredCount} / ${total} (${percent}%)`;
    if (el.progressFill) el.progressFill.style.width = `${percent}%`;
}

function updateMethodStrip() {
    const steps = document.querySelectorAll('.method-step');
    steps.forEach(step => {
        step.classList.toggle('active', step.dataset.step === state.currentCategory);
    });
}

function openProfile() {
    renderProfile();
    document.getElementById('profilePanel')?.classList.remove('hidden');
    document.getElementById('profileBackdrop')?.classList.remove('hidden');
}

function closeProfile() {
    document.getElementById('profilePanel')?.classList.add('hidden');
    document.getElementById('profileBackdrop')?.classList.add('hidden');
}

function renderProfile() {
    let mastered = 0;
    let learning = 0;

    for (const status of Object.values(state.progress)) {
        if (status === 'mastered') mastered++;
        if (status === 'learning') learning++;
    }

    const profile = JSON.parse(localStorage.getItem('vocabProfile') || '{"totalTimerSeconds":0,"sessionsCompleted":0,"setHistory":[]}');
    const totalSecs = profile.totalTimerSeconds || 0;
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    const loopCount = getLoopWords().length;
    const cefrLevel = estimateCEFRLevel(mastered);

    const statMastered = document.getElementById('statMastered');
    const statLearning = document.getElementById('statLearning');
    const statTimer = document.getElementById('statTimer');
    const statLoops = document.getElementById('statLoops');
    const statCefr = document.getElementById('statCefrLevel');
    const profileLoopCount = document.getElementById('profileLoopCount');

    if (statMastered) statMastered.textContent = mastered;
    if (statLearning) statLearning.textContent = learning;
    if (statTimer) statTimer.textContent = timeStr;
    if (statLoops) statLoops.textContent = loopCount;
    if (statCefr) statCefr.textContent = `Nivel ${cefrLevel}`;
    if (profileLoopCount) profileLoopCount.textContent = loopCount;

    const historyList = document.getElementById('profileHistory');
    if (historyList) {
        const history = profile.setHistory || [];
        if (history.length === 0) {
            historyList.innerHTML = '<li class="history-empty">Sin actividad registrada aún. ¡Comienza a practicar!</li>';
        } else {
            historyList.innerHTML = history.slice(0, 8).map(h => {
                const dur = Math.ceil((h.durationSeconds || 0) / 60);
                return `
                <li class="history-item">
                    <span class="history-icon">[OK]</span>
                    <div class="history-details">
                        <strong>${h.type} (${h.category})</strong>
                        <span class="history-date">${h.date}</span>
                    </div>
                    <span class="history-duration">${dur} min</span>
                </li>`;
            }).join('');
        }
    }
}

// ===== Reset & Switch Modes =====
function resetMode() {
    state.isFlipped = false;
    state.quizScore = 0;
    state.quizTotal = 0;
    stopAudio();
    stopRSVP();

    if (autoPlayInterval) toggleAutoPlay();
    if (el.flashcard) el.flashcard.classList.remove('flipped');
    if (el.quizFeedback) el.quizFeedback.classList.add('hidden');
    if (el.typingFeedback) el.typingFeedback.classList.add('hidden');
    if (el.typingInput) el.typingInput.value = '';
}

function updateDisplay() {
    updateMethodStrip();

    // Mode containers visibility
    el.flashcardMode?.classList.toggle('hidden', state.currentMode !== 'flashcard');
    el.rsvpMode?.classList.toggle('hidden', state.currentMode !== 'rsvp');
    el.scenarioMode?.classList.toggle('hidden', state.currentMode !== 'scenario');
    el.grammarMode?.classList.toggle('hidden', state.currentMode !== 'grammar');
    el.quizMode?.classList.toggle('hidden', state.currentMode !== 'quiz');
    el.typingMode?.classList.toggle('hidden', state.currentMode !== 'typing');
    el.fillblanksMode?.classList.toggle('hidden', state.currentMode !== 'fillblanks');
    el.matchingMode?.classList.toggle('hidden', state.currentMode !== 'matching');
    el.listeningMode?.classList.toggle('hidden', state.currentMode !== 'listening');
    el.readingSection?.classList.toggle('hidden', state.currentMode !== 'reading');

    const techSubnav = document.getElementById('techSubnav');
    if (techSubnav) {
        techSubnav.classList.toggle('hidden', state.currentCategory !== 'technical');
    }

    switch (state.currentMode) {
        case 'flashcard':
            updateFlashcard();
            break;
        case 'rsvp':
            initRSVP();
            break;
        case 'grammar':
            updateGrammar();
            break;
        case 'scenario':
            initScenario();
            break;
        case 'quiz':
            updateQuiz();
            break;
        case 'typing':
            updateTyping();
            break;
        case 'fillblanks':
            initFillBlanks();
            break;
        case 'matching':
            initMatching();
            break;
        case 'listening':
            initListening();
            break;
    }

    updateProgress();
    updateLoopBadge();
}

// ===== DOM Element Initialization & Event Listeners =====
function init() {
    el = {
        categoryNav: document.getElementById('categoryNav'),
        modeNav: document.getElementById('modeNav'),
        setContainer: document.getElementById('setContainer'),
        setSelect: document.getElementById('setSelect'),
        progressIndicator: document.getElementById('progressIndicator'),
        progressFill: document.getElementById('progressFill'),

        // Flashcard Elements
        flashcardMode: document.getElementById('flashcardMode'),
        flashcard: document.getElementById('flashcard'),
        flashcardCurrentCount: document.getElementById('flashcardCurrentCount'),
        flashcardTotalCount: document.getElementById('flashcardTotalCount'),
        currentWord: document.getElementById('currentWord'),
        phonetic: document.getElementById('phonetic'),
        wordType: document.getElementById('wordType'),
        wordRegister: document.getElementById('wordRegister'),
        translationPrimary: document.getElementById('translationPrimary'),
        definition: document.getElementById('definition'),
        example: document.getElementById('example'),
        spanishCue: document.getElementById('spanishCue'),
        soundCue: document.getElementById('soundCue'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        knowBtn: document.getElementById('knowBtn'),
        learningBtn: document.getElementById('learningBtn'),
        timerSelect: document.getElementById('timerSelect'),
        timerDisplay: document.getElementById('timerDisplay'),
        startTimerBtn: document.getElementById('startTimerBtn'),
        autoPlayFlashcardsBtn: document.getElementById('autoPlayFlashcardsBtn'),

        // RSVP Elements
        rsvpMode: document.getElementById('rsvpMode'),

        // Grammar Elements
        grammarMode: document.getElementById('grammarMode'),

        // Scenario Elements
        scenarioMode: document.getElementById('scenarioMode'),

        // Quiz Elements
        quizMode: document.getElementById('quizMode'),
        quizWord: document.getElementById('quizWord'),
        quizPhonetic: document.getElementById('quizPhonetic'),
        quizOptions: document.getElementById('quizOptions'),
        quizFeedback: document.getElementById('quizFeedback'),
        nextQuestionBtn: document.getElementById('nextQuestionBtn'),
        scoreValue: document.getElementById('scoreValue'),
        totalQuestions: document.getElementById('totalQuestions'),

        // Typing Elements
        typingMode: document.getElementById('typingMode'),
        typingDefinition: document.getElementById('typingDefinition'),
        typingExample: document.getElementById('typingExample'),
        typingFormatHint: document.getElementById('typingFormatHint'),
        typingInput: document.getElementById('typingInput'),
        typingSubmit: document.getElementById('typingSubmit'),
        typingHintBtn: document.getElementById('typingHintBtn'),
        typingListenBtn: document.getElementById('typingListenBtn'),
        typingFeedback: document.getElementById('typingFeedback'),
        nextWordBtn: document.getElementById('nextWordBtn'),

        // Fill Blanks Elements
        fillblanksMode: document.getElementById('fillblanksMode'),
        fillblanksContent: document.getElementById('fillblanksContent'),
        fillblanksSubmit: document.getElementById('fillblanksSubmit'),
        generateBlanksBtn: document.getElementById('generateBlanksBtn'),
        fillblanksFeedback: document.getElementById('fillblanksFeedback'),

        // Matching & Listening & Reading Elements
        matchingMode: document.getElementById('matchingMode'),
        listeningMode: document.getElementById('listeningMode'),
        readingSection: document.getElementById('readingSection')
    };

    loadSavedData();
    loadWords();
    setupEventListeners();
    updateDisplay();
}

function setupEventListeners() {
    // Category Navigation
    el.categoryNav?.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-btn');
        if (!btn) return;

        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        state.currentCategory = btn.dataset.category;
        state.currentSet = 1;
        loadWords();
        resetMode();
        updateDisplay();
    });

    // Technical Subcategory Checkboxes
    document.querySelectorAll('.tech-chips input').forEach(input => {
        input.addEventListener('change', () => {
            const checkedSubs = Array.from(document.querySelectorAll('.tech-chips input:checked')).map(i => i.dataset.sub);
            state.subcategoryFilters = checkedSubs.length > 0 ? checkedSubs : ['it'];
            loadWords();
            updateDisplay();
        });
    });

    // Set Selection
    el.setSelect?.addEventListener('change', (e) => {
        state.currentSet = parseInt(e.target.value);
        loadWords();
        updateDisplay();
    });

    // Mode Navigation
    el.modeNav?.addEventListener('click', (e) => {
        const btn = e.target.closest('.mode-btn');
        if (!btn) return;

        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        state.currentMode = btn.dataset.mode;
        resetMode();
        updateDisplay();
    });

    // Flashcard Interactions
    el.flashcard?.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('textarea') || e.target.closest('input')) return;
        state.isFlipped = !state.isFlipped;
        el.flashcard.classList.toggle('flipped', state.isFlipped);
    });

    el.prevBtn?.addEventListener('click', () => {
        if (state.currentIndex > 0) {
            state.currentIndex--;
            state.isFlipped = false;
            el.flashcard?.classList.remove('flipped');
            updateDisplay();
        } else if (state.currentSet > 1) {
            state.currentSet--;
            const setSelect = document.getElementById('setSelect');
            if (setSelect) setSelect.value = state.currentSet;
            loadWords();
            state.currentIndex = state.currentWords.length - 1;
            state.isFlipped = false;
            el.flashcard?.classList.remove('flipped');
            updateDisplay();
        }
    });

    el.nextBtn?.addEventListener('click', () => {
        if (state.currentIndex < state.currentWords.length - 1) {
            state.currentIndex++;
            state.isFlipped = false;
            el.flashcard?.classList.remove('flipped');
            updateDisplay();
        } else {
            const setSelect = document.getElementById('setSelect');
            const totalSets = setSelect?.options?.length || 1;
            if (state.currentSet < totalSets) {
                state.currentSet++;
            } else {
                state.currentSet = 1;
            }
            if (setSelect) setSelect.value = state.currentSet;
            loadWords();
            state.currentIndex = 0;
            state.isFlipped = false;
            el.flashcard?.classList.remove('flipped');
            updateDisplay();
        }
    });

    el.knowBtn?.addEventListener('click', () => markWord('mastered'));
    el.learningBtn?.addEventListener('click', () => markWord('learning'));

    // Batch Size and Auto-Play Speed Selectors
    const batchSizeSelect = document.getElementById('batchSizeSelect');
    batchSizeSelect?.addEventListener('change', (e) => {
        state.itemsPerSet = parseInt(e.target.value) || 200;
        state.currentSet = 1;
        loadWords();
        updateDisplay();
    });

    const autoPlaySpeedSelect = document.getElementById('autoPlaySpeedSelect');
    autoPlaySpeedSelect?.addEventListener('change', (e) => {
        state.autoPlaySpeed = parseInt(e.target.value) || 1500;
        if (autoPlayInterval) {
            toggleAutoPlay();
            toggleAutoPlay();
        }
    });

    // Audio Triggers
    const flashcardAudioBtn = document.getElementById('flashcardAudioBtn');
    flashcardAudioBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const word = state.currentWords[state.currentIndex];
        if (word) speakText(word.word);
    });

    const flashcardExampleAudioBtn = document.getElementById('flashcardExampleAudioBtn');
    flashcardExampleAudioBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const word = state.currentWords[state.currentIndex];
        if (word) speakText(word.example);
    });

    const audioShortcutBtn = document.getElementById('audioShortcutBtn');
    audioShortcutBtn?.addEventListener('click', () => {
        const word = state.currentWords[state.currentIndex];
        if (word) speakText(state.isFlipped ? word.example : word.word);
    });

    // Mental Hook Textarea
    const assocInput = document.getElementById('associationInput');
    assocInput?.addEventListener('input', (e) => {
        const word = state.currentWords[state.currentIndex];
        if (!word) return;
        const key = getWordKey(word);
        state.associations[key] = e.target.value;
        saveAssociations();
    });
    assocInput?.addEventListener('click', (e) => e.stopPropagation());

    // Timer & Auto-Play
    el.startTimerBtn?.addEventListener('click', toggleFlashcardTimer);
    el.autoPlayFlashcardsBtn?.addEventListener('click', toggleAutoPlay);

    // RSVP Engine Triggers
    document.getElementById('rsvpToggleBtn')?.addEventListener('click', toggleRSVP);
    document.getElementById('rsvpPrevSentenceBtn')?.addEventListener('click', prevRSVPSentence);
    document.getElementById('rsvpNextSentenceBtn')?.addEventListener('click', nextRSVPSentence);
    document.getElementById('rsvpPrevWordBtn')?.addEventListener('click', () => stepRSVPWord(-1));
    document.getElementById('rsvpNextWordBtn')?.addEventListener('click', () => stepRSVPWord(1));
    document.getElementById('rsvpRestartBtn')?.addEventListener('click', restartRSVPSentence);
    document.getElementById('rsvpAudioBtn')?.addEventListener('click', speakRSVPSentence);

    const rsvpSourceSelect = document.getElementById('rsvpSourceSelect');
    rsvpSourceSelect?.addEventListener('change', (e) => {
        rsvpState.source = e.target.value;
        const customBox = document.getElementById('rsvpCustomBox');
        if (customBox) {
            customBox.classList.toggle('hidden', rsvpState.source !== 'custom');
        }
        initRSVP();
    });

    const rsvpChunkSelect = document.getElementById('rsvpChunkSelect');
    rsvpChunkSelect?.addEventListener('change', (e) => {
        rsvpState.chunkMode = parseInt(e.target.value) || 2;
        initRSVP(false);
        if (rsvpState.isPlaying) {
            stopRSVP();
            startRSVP();
        }
    });

    const rsvpCustomInput = document.getElementById('rsvpCustomTextInput');
    rsvpCustomInput?.addEventListener('input', (e) => {
        const customText = (e.target.value || '').trim();
        if (customText.length > 0) {
            stopRSVP();
            rsvpState.currentSentence = customText;
            initRSVP(false);
        }
    });

    const wpmSlider = document.getElementById('rsvpWpmSlider');
    const wpmLabel = document.getElementById('rsvpWpmLabel');
    const updatePresetButtons = (wpm) => {
        document.querySelectorAll('.rsvp-preset-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.wpm) === wpm);
        });
    };

    wpmSlider?.addEventListener('input', (e) => {
        rsvpState.wpm = parseInt(e.target.value) || 220;
        if (wpmLabel) wpmLabel.textContent = `${rsvpState.wpm} WPM`;
        updatePresetButtons(rsvpState.wpm);
        if (rsvpState.isPlaying) {
            stopRSVP();
            startRSVP();
        }
    });

    document.querySelectorAll('.rsvp-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const wpm = parseInt(btn.dataset.wpm) || 220;
            rsvpState.wpm = wpm;
            if (wpmSlider) wpmSlider.value = wpm;
            if (wpmLabel) wpmLabel.textContent = `${wpm} WPM`;
            updatePresetButtons(wpm);
            if (rsvpState.isPlaying) {
                stopRSVP();
                startRSVP();
            }
        });
    });

    const autoAdvanceCheck = document.getElementById('rsvpAutoAdvanceCheck');
    if (autoAdvanceCheck) {
        autoAdvanceCheck.checked = rsvpState.autoAdvance;
        autoAdvanceCheck.addEventListener('change', (e) => {
            rsvpState.autoAdvance = e.target.checked;
        });
    }

    // Grammar Anti-Translation Engine Listeners
    // Grammar Anti-Translation Engine Listeners
    document.getElementById('grammarCategoryFilter')?.addEventListener('change', (e) => {
        grammarState.categoryFilter = e.target.value;
        grammarState.currentIndex = 0;
        applyGrammarFilters();
        updateGrammar();
    });

    document.getElementById('grammarTenseFilter')?.addEventListener('change', (e) => {
        grammarState.tenseFilter = e.target.value;
        grammarState.currentIndex = 0;
        applyGrammarFilters();
        updateGrammar();
    });

    document.getElementById('grammarSearchInput')?.addEventListener('input', (e) => {
        grammarState.searchQuery = e.target.value;
        grammarState.currentIndex = 0;
        applyGrammarFilters();
        updateGrammar();
    });

    document.getElementById('grammarPrevBtn')?.addEventListener('click', () => {
        if (grammarState.currentIndex > 0) {
            grammarState.currentIndex--;
            updateGrammar();
        }
    });

    document.getElementById('grammarNextBtn')?.addEventListener('click', () => {
        if (grammarState.currentIndex < grammarState.filteredItems.length - 1) {
            grammarState.currentIndex++;
            updateGrammar();
        }
    });

    document.getElementById('grammarAudioBtn')?.addEventListener('click', () => {
        const item = grammarState.filteredItems[grammarState.currentIndex];
        if (item) speakText(item.english);
    });

    document.getElementById('grammarAudioVerbBtn')?.addEventListener('click', () => {
        const item = grammarState.filteredItems[grammarState.currentIndex];
        if (item) speakText(`${item.keyVerb.base}. ${item.keyVerb.past}. ${item.keyVerb.pastParticiple}. ${item.keyVerb.gerund || ''}`);
    });

    // Scenario Simulator Selection & Next Step
    const scenarioSelector = document.getElementById('scenarioSelector');
    scenarioSelector?.addEventListener('change', (e) => {
        scenarioState.scenarioIndex = parseInt(e.target.value) || 0;
        scenarioState.stepIndex = 0;
        scenarioState.score = 100;
        renderScenarioStep();
    });

    document.getElementById('scenarioNextStepBtn')?.addEventListener('click', () => {
        const scenario = PROFESSIONAL_SCENARIOS[scenarioState.scenarioIndex];
        if (scenario && scenarioState.stepIndex < scenario.steps.length - 1) {
            scenarioState.stepIndex++;
            renderScenarioStep();
        } else {
            renderScenarioCompleted(scenario);
        }
    });

    // Quiz Interactions
    el.quizOptions?.addEventListener('click', (e) => {
        const btn = e.target.closest('.quiz-option');
        if (!btn || btn.disabled) return;
        handleQuizAnswer(parseInt(btn.dataset.index));
    });

    const quizAudioBtn = document.getElementById('quizAudioBtn');
    quizAudioBtn?.addEventListener('click', () => {
        const word = state.currentWords[state.currentIndex];
        if (word) speakText(word.word);
    });

    el.nextQuestionBtn?.addEventListener('click', () => {
        state.currentIndex = (state.currentIndex + 1) % state.currentWords.length;
        el.quizFeedback?.classList.add('hidden');
        updateDisplay();
    });

    // Typing Interactions
    el.typingSubmit?.addEventListener('click', checkTypingAnswer);
    el.typingInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkTypingAnswer();
    });

    el.typingHintBtn?.addEventListener('click', () => {
        const word = state.currentWords[state.currentIndex];
        if (!word || !el.typingInput) return;
        const target = word.word.toLowerCase();
        const current = el.typingInput.value.toLowerCase();

        let revealed = '';
        for (let i = 0; i < target.length; i++) {
            if (current[i] === target[i]) {
                revealed += target[i];
            } else {
                revealed += target[i];
                break;
            }
        }
        el.typingInput.value = revealed;
        el.typingInput.focus();
    });

    el.typingListenBtn?.addEventListener('click', () => {
        const word = state.currentWords[state.currentIndex];
        if (word) speakText(word.example);
    });

    el.nextWordBtn?.addEventListener('click', () => {
        state.currentIndex = (state.currentIndex + 1) % state.currentWords.length;
        el.typingFeedback?.classList.add('hidden');
        updateDisplay();
    });

    // Fill Blanks Interactions
    el.generateBlanksBtn?.addEventListener('click', initFillBlanks);
    el.fillblanksSubmit?.addEventListener('click', checkFillBlanks);

    // Matching Next Level
    document.getElementById('nextLevelBtn')?.addEventListener('click', initMatching);

    // Dictation Triggers
    document.getElementById('dictPlayBtn')?.addEventListener('click', () => speakDictation());
    document.getElementById('dictRepeatBtn')?.addEventListener('click', () => speakDictation());
    document.getElementById('dictSlowBtn')?.addEventListener('click', () => speakDictation(0.55));
    document.getElementById('dictSubmit')?.addEventListener('click', checkDictation);
    document.getElementById('dictNextBtn')?.addEventListener('click', () => {
        pickDictationWord();
        speakDictation();
    });
    document.getElementById('dictInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkDictation();
    });

    // AI Reading Controls
    document.getElementById('generateTextBtn')?.addEventListener('click', handleGenerateText);
    document.getElementById('playFullDialogueBtn')?.addEventListener('click', playFullDialogue);
    document.getElementById('stopReadingAudioBtn')?.addEventListener('click', stopAudio);

    // Topic Chips in Reading
    document.querySelectorAll('.topic-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const topicInput = document.getElementById('readingTopic');
            if (topicInput) topicInput.value = chip.dataset.topic;
            handleGenerateText();
        });
    });

    // Difficult Words Tooltip Trigger
    const textContent = document.getElementById('readingTextContent');
    textContent?.addEventListener('click', (e) => {
        const wordEl = e.target.closest('.difficult-word');
        if (wordEl) {
            e.stopPropagation();
            const idx = parseInt(wordEl.dataset.wordIndex);
            const wordData = readingState.difficultWords[idx];
            if (wordData) showWordTooltip(wordEl, wordData);
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.difficult-word') && !e.target.closest('.word-tooltip')) {
            hideWordTooltip();
        }
    });

    // Session Mode Triggers
    document.getElementById('startSessionBtn')?.addEventListener('click', startSession);
    document.getElementById('nextPhaseBtn')?.addEventListener('click', advanceSession);
    document.getElementById('exitSessionBtn')?.addEventListener('click', () => endSession(false));

    // Profile Panel Triggers
    document.getElementById('profileBtn')?.addEventListener('click', openProfile);
    document.getElementById('profileCloseBtn')?.addEventListener('click', closeProfile);
    document.getElementById('profileBackdrop')?.addEventListener('click', closeProfile);

    // Train Loop Words button in Profile
    document.getElementById('trainLoopBtn')?.addEventListener('click', () => {
        closeProfile();
        const loopBtn = document.getElementById('loopFilterBtn');
        if (loopBtn) loopBtn.click();
    });

    // Reset Progress
    document.getElementById('resetProgressBtn')?.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas restablecer todo tu progreso guardado?')) {
            localStorage.clear();
            state.progress = {};
            state.srsData = {};
            state.associations = {};
            state.failures = {};
            loadWords();
            updateDisplay();
            renderProfile();
            alert('Progreso restablecido correctamente.');
        }
    });

    // Global Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

        if (state.currentMode === 'flashcard') {
            if (e.code === 'Space') {
                e.preventDefault();
                el.flashcard?.click();
            } else if (e.key === 'ArrowLeft') {
                el.prevBtn?.click();
            } else if (e.key === 'ArrowRight') {
                el.nextBtn?.click();
            } else if (e.key === '1') {
                el.learningBtn?.click();
            } else if (e.key === '2') {
                el.knowBtn?.click();
            } else if (e.key.toLowerCase() === 'a') {
                const word = state.currentWords[state.currentIndex];
                if (word) speakText(state.isFlipped ? word.example : word.word);
            }
        } else if (state.currentMode === 'rsvp') {
            if (e.code === 'Space') {
                e.preventDefault();
                toggleRSVP();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                if (e.shiftKey) {
                    prevRSVPSentence();
                } else {
                    stepRSVPWord(-1);
                }
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                if (e.shiftKey) {
                    nextRSVPSentence();
                } else {
                    stepRSVPWord(1);
                }
            } else if (e.key.toLowerCase() === 'r') {
                restartRSVPSentence();
            } else if (e.key.toLowerCase() === 'a') {
                speakRSVPSentence();
            }
        }
    });
}

// Bootstrap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
