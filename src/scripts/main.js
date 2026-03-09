import { CORE_1000 } from '../data/core-1000.js';
import { ADVANCED_1000 } from '../data/advanced-1000.js';
import { TECHNICAL_VOCABULARY } from '../data/technical.js';
import { RUSSIAN_CORE } from '../data/russian-core.js';
import { RUSSIAN_B1_TRAVEL, RUSSIAN_B1_TECH, RUSSIAN_B1_WORK } from '../data/russian-b1-intensive.js';
import { RUSSIAN_B2 } from '../data/russian-b2.js';
import { URBAN_SLANG } from '../data/urban-slang.js';
import { TONGUE_TWISTERS } from '../data/tongue-twisters.js';

// ===== State Management =====
const state = {
    currentLanguage: 'en',
    currentCategory: 'core',
    currentMode: 'flashcard',
    currentSet: 1,
    itemsPerSet: 50,
    currentIndex: 0,
    currentWords: [],
    progress: {},
    associations: {},
    quizScore: 0,
    quizTotal: 0,
    isFlipped: false,
    subcategoryFilters: ['business', 'marketing', 'it', 'cybersecurity', 'dataAnalytics', 'finance']
};

const readingState = {
    currentCategory: 'custom',
    currentText: null,
    difficultWords: [],
    isLoading: false
};

// ===== DOM Elements =====
let elements = {};
let readingElements = {};
let matchingElements = {};

const matchingState = {
    cards: [],
    selectedCards: [],
    matchedPairs: 0,
    totalPairs: 4,
    timer: 0,
    interval: null
};

// ===== Timer State =====
let flashcardTimerInterval = null;
let flashcardTimeRemaining = 0;
let autoPlayInterval = null;

// ===== Initialization =====
function init() {
    // Initialize elements
    elements = {
        languageSelect: document.getElementById('languageSelect'),
        categoryNav: document.getElementById('categoryNav'),
        modeNav: document.getElementById('modeNav'),
        flashcardMode: document.getElementById('flashcardMode'),
        quizMode: document.getElementById('quizMode'),
        typingMode: document.getElementById('typingMode'),
        typingDefinition: document.getElementById('typingDefinition'),
        flashcard: document.getElementById('flashcard'),
        currentWord: document.getElementById('currentWord'),
        wordTop: document.getElementById('wordTop'),
        phoneticFront: document.getElementById('phoneticFront'),
        phonetic: document.getElementById('phonetic'),
        definition: document.getElementById('definition'),
        example: document.getElementById('example'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        knowBtn: document.getElementById('knowBtn'),
        learningBtn: document.getElementById('learningBtn'),
        progressFill: document.getElementById('progressFill'),
        translationPrimary: document.getElementById('translationPrimary'),
        translationSecondary: document.getElementById('translationSecondary'),
        progressIndicator: document.getElementById('progressIndicator'),
        quizWord: document.getElementById('quizWord'),
        quizPhonetic: document.getElementById('quizPhonetic'),
        quizOptions: document.getElementById('quizOptions'),
        quizFeedback: document.getElementById('quizFeedback'),
        nextQuestionBtn: document.getElementById('nextQuestionBtn'),
        scoreValue: document.getElementById('scoreValue'),
        totalQuestions: document.getElementById('totalQuestions'),
        typingExample: document.getElementById('typingExample'),
        typingFormatHint: document.getElementById('typingFormatHint'),
        typingInput: document.getElementById('typingInput'),
        typingHintBtn: document.getElementById('typingHintBtn'),
        typingSubmit: document.getElementById('typingSubmit'),
        typingFeedback: document.getElementById('typingFeedback'),
        nextWordBtn: document.getElementById('nextWordBtn'),
        fillblanksMode: document.getElementById('fillblanksMode'),
        fillblanksContent: document.getElementById('fillblanksContent'),
        fillblanksSubmit: document.getElementById('fillblanksSubmit'),
        generateBlanksBtn: document.getElementById('generateBlanksBtn'),
        fillblanksFeedback: document.getElementById('fillblanksFeedback'),
        readingSection: document.getElementById('readingSection'),
        flashcardCurrentCount: document.getElementById('flashcardCurrentCount'),
        flashcardTotalCount: document.getElementById('flashcardTotalCount'),
        timerSelect: document.getElementById('timerSelect'),
        timerDisplay: document.getElementById('timerDisplay'),
        startTimerBtn: document.getElementById('startTimerBtn'),
        autoPlayFlashcardsBtn: document.getElementById('autoPlayFlashcardsBtn'),
        typingListenBtn: document.getElementById('typingListenBtn')
    };

    readingElements = {
        section: document.getElementById('readingSection'),
        topicInput: document.getElementById('readingTopic'),
        levelSelect: document.getElementById('readingLevel'),
        generateBtn: document.getElementById('generateTextBtn'),
        textContainer: document.getElementById('readingTextContainer'),
        textContent: document.getElementById('readingTextContent'),
        loadingSpinner: document.getElementById('readingLoading'),
        wordTooltip: document.getElementById('wordTooltip'),
        errorMessage: document.getElementById('readingError')
    };

    loadProgress();
    loadAssociations();
    loadWords();
    setupEventListeners();
    initReading();

    matchingElements = {
        section: document.getElementById('matchingMode'),
        grid: document.getElementById('matchingGrid'),
        score: document.getElementById('matchingScore'),
        feedback: document.getElementById('matchingFeedback'),
        nextBtn: document.getElementById('nextLevelBtn')
    };

    if (matchingElements.nextBtn) {
        matchingElements.nextBtn.addEventListener('click', initMatching);
    }

    updateDisplay();
}

function loadProgress() {
    const saved = localStorage.getItem('vocabProgress');
    if (saved) {
        state.progress = JSON.parse(saved);
    }
}

function updateCategoryNav() {
    const nav = elements.categoryNav;
    if (!nav) return;

    if (state.currentLanguage === 'en') {
        nav.innerHTML = `
        <button class="category-btn ${state.currentCategory === 'core' ? 'active' : ''}" data-category="core">
          <span class="category-icon">1K</span>
          <span class="category-label">Core 1000</span>
        </button>
        <button class="category-btn ${state.currentCategory === 'advanced' ? 'active' : ''}" data-category="advanced">
          <span class="category-icon">2K</span>
          <span class="category-label">Advanced</span>
        </button>
        <button class="category-btn ${state.currentCategory === 'technical' ? 'active' : ''}" data-category="technical">
          <span class="category-icon">T</span>
          <span class="category-label">Technical</span>
        </button>
        <button class="category-btn ${state.currentCategory === 'slang' ? 'active' : ''}" data-category="slang">
          <span class="category-icon">🔥</span>
          <span class="category-label">Urban Slang</span>
        </button>
        <button class="category-btn ${state.currentCategory === 'twisters' ? 'active' : ''}" data-category="twisters">
          <span class="category-icon">👅</span>
          <span class="category-label">Twisters</span>
        </button>
        `;
    } else {
        nav.innerHTML = `
        <button class="category-btn ${state.currentCategory === 'core' ? 'active' : ''}" data-category="core">
          <span class="category-icon">A1</span>
          <span class="category-label">A1/A2 Core</span>
        </button>
        <button class="category-btn ${state.currentCategory === 'b1-intensive' ? 'active' : ''}" data-category="b1-intensive">
          <span class="category-icon">B1</span>
          <span class="category-label">B1 Intensive</span>
        </button>
        <button class="category-btn ${state.currentCategory === 'b2' ? 'active' : ''}" data-category="b2">
          <span class="category-icon">B2</span>
          <span class="category-label">B2 Advanced</span>
        </button>
        `;
    }
}

function saveProgress() {
    localStorage.setItem('vocabProgress', JSON.stringify(state.progress));
}

function speakText(text) {
    if (!text) return;
    window.speechSynthesis.cancel();

    // Ensure voices are loaded
    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            doSpeak(text, voices);
        };
        return;
    }
    doSpeak(text, voices);
}

function doSpeak(text, voices) {
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = state.currentLanguage === 'ru' ? 'ru' : 'en';

    utterance.lang = targetLang === 'ru' ? 'ru-RU' : 'en-US';

    // Find best voice
    let voice;
    if (targetLang === 'ru') {
        voice = voices.find(v => v.lang.toLowerCase().startsWith('ru') && v.name.includes('Google'));
        if (!voice) voice = voices.find(v => v.lang.toLowerCase().startsWith('ru'));
    } else {
        voice = voices.find(v => v.lang.toLowerCase().startsWith('en') && v.name.includes('Google'));
        if (!voice) voice = voices.find(v => v.lang.toLowerCase().includes('en-us') || v.lang.toLowerCase().includes('en-gb'));
        if (!voice) voice = voices.find(v => v.lang.toLowerCase().startsWith('en'));
    }

    if (voice) {
        utterance.voice = voice;
    }

    utterance.rate = 0.8;
    console.log(`Speaking '${text}' with voice: ${voice ? voice.name : 'default'} (${utterance.lang})`);
    window.speechSynthesis.speak(utterance);
}


function loadAssociations() {
    const saved = localStorage.getItem('vocabAssociations');
    if (saved) {
        state.associations = JSON.parse(saved);
    }
}

function saveAssociations() {
    localStorage.setItem('vocabAssociations', JSON.stringify(state.associations));
}

function formatPhonetic(phonetic) {
    if (!phonetic || /[A-Z]/.test(phonetic)) return phonetic || '';

    const syllables = phonetic.match(/[^aeiouáéíóúü\s]*[aeiouáéíóúü]+(?:[^aeiouáéíóúü\s](?![aeiouáéíóúü\s]))?/gi);
    if (!syllables) return phonetic;

    return syllables.map(syl => {
        if (/[áéíóú]/.test(syl)) {
            return syl.toUpperCase();
        }
        return syl;
    }).join('·');
}

function loadWords() {
    let allWords = [];
    switch (state.currentCategory) {
        case 'core':
            if (state.currentLanguage === 'ru') {
                allWords = RUSSIAN_CORE.map(w => ({ ...w, phonetic: w.phonetic })); // No formatting needed yet for transliteration
            } else {
                allWords = CORE_1000.map(w => ({ ...w, phonetic: formatPhonetic(w.phonetic) }));
            }
            break;
        case 'advanced':
            // English exclusive
            allWords = ADVANCED_1000.map(w => ({ ...w, phonetic: formatPhonetic(w.phonetic) }));
            break;
        case 'technical':
            // English exclusive
            state.subcategoryFilters.forEach(sub => {
                if (TECHNICAL_VOCABULARY[sub]) {
                    allWords.push(...TECHNICAL_VOCABULARY[sub].map(w => ({ ...w, subcategory: sub, phonetic: formatPhonetic(w.phonetic) })));
                }
            });
            break;
        case 'slang':
            allWords = URBAN_SLANG.map(w => ({ ...w, phonetic: formatPhonetic(w.phonetic) }));
            break;
        case 'twisters':
            allWords = TONGUE_TWISTERS.map(w => ({ ...w, word: w.text, phonetic: formatPhonetic(w.phonetic) }));
            break;
        case 'b1-intensive':
            // Russian exclusive
            // Combining all B1 topics for now
            const b1Words = [
                ...RUSSIAN_B1_TRAVEL.map(w => ({ ...w, subcategory: 'travel' })),
                ...RUSSIAN_B1_TECH.map(w => ({ ...w, subcategory: 'tech' })),
                ...RUSSIAN_B1_WORK.map(w => ({ ...w, subcategory: 'work' }))
            ];
            allWords = b1Words.map(w => ({ ...w, phonetic: w.phonetic }));
            break;
        case 'b2':
            // Russian exclusive
            allWords = RUSSIAN_B2.map(w => ({ ...w, phonetic: w.phonetic }));
            break;
    }

    updateSetSelector(allWords.length);

    const start = (state.currentSet - 1) * state.itemsPerSet;
    const end = Math.min(start + state.itemsPerSet, allWords.length);

    if (start >= allWords.length && allWords.length > 0) {
        state.currentSet = 1;
        const resetEnd = Math.min(state.itemsPerSet, allWords.length);
        state.currentWords = allWords.slice(0, resetEnd);
        updateSetSelector(allWords.length);
    } else {
        state.currentWords = allWords.slice(start, end);
    }

    shuffleArray(state.currentWords);
    state.currentIndex = 0;
}

function updateSetSelector(totalItems) {
    const setSelect = document.getElementById('setSelect');
    if (!setSelect) return;

    const totalSets = Math.ceil(totalItems / state.itemsPerSet);
    setSelect.innerHTML = '';

    for (let i = 1; i <= totalSets; i++) {
        const option = document.createElement('option');
        option.value = i;
        const start = (i - 1) * state.itemsPerSet + 1;
        const end = Math.min(i * state.itemsPerSet, totalItems);
        option.textContent = `Set ${i} (${start}-${end})`;
        if (i == state.currentSet) {
            option.selected = true;
        }
        setSelect.appendChild(option);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Category navigation
    const setSelect = document.getElementById('setSelect');
    if (setSelect) {
        setSelect.addEventListener('change', (e) => {
            state.currentSet = parseInt(e.target.value);
            loadWords();
            updateDisplay();
        });
    }

    if (elements.languageSelect) {
        elements.languageSelect.addEventListener('change', (e) => {
            state.currentLanguage = e.target.value;
            // Reset category to default (Core) when switching language
            state.currentCategory = 'core';
            updateCategoryNav();
            loadWords();
            updateDisplay();
        });
    }

    const associationInput = document.getElementById('associationInput');
    if (associationInput) {
        associationInput.addEventListener('input', (e) => {
            if (!state.currentWords[state.currentIndex]) return;
            const word = state.currentWords[state.currentIndex];
            const key = `${state.currentCategory}:${word.word}`;
            state.associations[key] = e.target.value;
            saveAssociations();
        });
        associationInput.addEventListener('click', (e) => e.stopPropagation());
    }

    const flashcardAudioBtn = document.getElementById('flashcardAudioBtn');
    if (flashcardAudioBtn) {
        flashcardAudioBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const word = state.currentWords[state.currentIndex];
            if (word) speakText(word.word);
        });
    }

    const quizAudioBtn = document.getElementById('quizAudioBtn');
    if (quizAudioBtn) {
        quizAudioBtn.addEventListener('click', () => {
            const word = state.currentWords[state.currentIndex];
            if (word) speakText(word.word);
        });
    }

    elements.categoryNav.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-btn');
        if (!btn) return;

        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        state.currentCategory = btn.dataset.category;
        loadWords();
        resetMode();
        updateDisplay();
    });

    // Mode navigation
    elements.modeNav.addEventListener('click', (e) => {
        const btn = e.target.closest('.mode-btn');
        if (!btn) return;

        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        state.currentMode = btn.dataset.mode;
        resetMode();
        updateDisplay();
    });

    // Flashcard interactions
    if (elements.flashcard) {
        elements.flashcard.addEventListener('click', () => {
            state.isFlipped = !state.isFlipped;
            elements.flashcard.classList.toggle('flipped', state.isFlipped);
        });
    }

    if (elements.prevBtn) {
        elements.prevBtn.addEventListener('click', () => {
            if (state.currentIndex > 0) {
                state.currentIndex--;
                state.isFlipped = false;
                updateDisplay();
            }
        });
    }

    if (elements.nextBtn) {
        elements.nextBtn.addEventListener('click', () => {
            if (state.currentIndex < state.currentWords.length - 1) {
                state.currentIndex++;
                state.isFlipped = false;
                updateDisplay();
            }
        });
    }

    if (elements.knowBtn) elements.knowBtn.addEventListener('click', () => markWord('mastered'));
    if (elements.learningBtn) elements.learningBtn.addEventListener('click', () => markWord('learning'));

    if (elements.startTimerBtn) {
        elements.startTimerBtn.addEventListener('click', toggleFlashcardTimer);
    }
    if (elements.autoPlayFlashcardsBtn) {
        elements.autoPlayFlashcardsBtn.addEventListener('click', toggleAutoPlay);
    }
    if (elements.typingListenBtn) {
        elements.typingListenBtn.addEventListener('click', () => {
            const word = state.currentWords[state.currentIndex];
            if (word) speakText(word.example);
        });
    }

    // Quiz interactions
    if (elements.quizOptions) {
        elements.quizOptions.addEventListener('click', (e) => {
            const option = e.target.closest('.quiz-option');
            if (!option || option.disabled) return;
            handleQuizAnswer(parseInt(option.dataset.index));
        });
    }

    if (elements.nextQuestionBtn) {
        elements.nextQuestionBtn.addEventListener('click', () => {
            state.currentIndex++;
            if (state.currentIndex >= state.currentWords.length) {
                state.currentIndex = 0;
                shuffleArray(state.currentWords);
            }
            elements.quizFeedback.classList.add('hidden');
            updateDisplay();
        });
    }

    // Typing interactions
    if (elements.typingSubmit) elements.typingSubmit.addEventListener('click', checkTypingAnswer);

    if (elements.typingInput) {
        elements.typingInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkTypingAnswer();
        });
    }

    if (elements.typingHintBtn) {
        elements.typingHintBtn.addEventListener('click', () => {
            const word = state.currentWords[state.currentIndex];
            if (!word) return;
            const correctWord = word.word.toLowerCase();
            const currentVal = elements.typingInput.value.toLowerCase();

            // Reval next letter
            let newHint = '';
            for (let i = 0; i < correctWord.length; i++) {
                if (currentVal[i] === correctWord[i]) {
                    newHint += correctWord[i];
                } else {
                    newHint += correctWord[i];
                    break;
                }
            }
            elements.typingInput.value = newHint;
            elements.typingInput.focus();
        });
    }

    if (elements.nextWordBtn) {
        elements.nextWordBtn.addEventListener('click', () => {
            state.currentIndex++;
            if (state.currentIndex >= state.currentWords.length) {
                state.currentIndex = 0;
                shuffleArray(state.currentWords);
            }
            elements.typingFeedback.classList.add('hidden');
            if (elements.typingInput) elements.typingInput.value = "";
            updateDisplay();
        });
    }

    // Fill Blanks Interactions
    if (elements.generateBlanksBtn) elements.generateBlanksBtn.addEventListener('click', () => {
        initFillBlanks();
    });

    if (elements.fillblanksSubmit) elements.fillblanksSubmit.addEventListener('click', checkFillBlanks);


    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (state.currentMode === 'flashcard') {
            if (e.key === 'ArrowLeft') elements.prevBtn.click();
            if (e.key === 'ArrowRight') elements.nextBtn.click();
            if (e.key === ' ') {
                e.preventDefault();
                elements.flashcard.click();
            }
            if (e.key === '1') elements.learningBtn.click();
            if (e.key === '2') elements.knowBtn.click();
        }
    });

    // Reading Mode Listeners

    if (readingElements.generateBtn) readingElements.generateBtn.addEventListener('click', handleGenerateText);

    // Use event delegation for tooltip, as word elements are dynamic
    if (readingElements.textContent) {
        readingElements.textContent.addEventListener('click', (e) => {
            const wordElement = e.target.closest('.difficult-word');
            if (wordElement) handleWordClick(e, wordElement);
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.difficult-word') && !e.target.closest('.word-tooltip')) {
            hideWordTooltip();
        }
    });
}

function initReading() {
    // Initial setup if needed
}

function resetMode() {
    state.isFlipped = false;
    state.quizScore = 0;
    state.quizTotal = 0;
    if (autoPlayInterval) toggleAutoPlay();
    if (elements.flashcard) elements.flashcard.classList.remove('flipped');
    if (elements.quizFeedback) elements.quizFeedback.classList.add('hidden');
    if (elements.typingFeedback) elements.typingFeedback.classList.add('hidden');
    if (elements.typingInput) elements.typingInput.value = '';
    if (matchingElements.section) matchingElements.section.classList.add('hidden');
}

// ===== Word Progress =====
function markWord(status) {
    const word = state.currentWords[state.currentIndex];
    if (!word) return;
    const key = `${state.currentCategory}:${word.word}`;
    state.progress[key] = status;
    saveProgress();

    if (state.currentMode === 'flashcard') {
        if (state.currentIndex < state.currentWords.length - 1) {
            state.currentIndex++;
        }
        state.isFlipped = false;

        // Visual Feedback for Saving
        const btn = status === 'mastered' ? elements.knowBtn : elements.learningBtn;
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = "¡Guardado!";
            btn.classList.add('saved-anim');

            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('saved-anim');
                updateDisplay();
            }, 600);
        } else {
            updateDisplay();
        }
    }
}

// Helper to show progress help logic
function showProgressHelp() {
    // Check if we haven't shown it recently or just alert for now
    // Or better, update UI to hint (not implemented here, but logic ready)
}

function getWordStatus(word) {
    const key = `${state.currentCategory}:${word.word}`;
    return state.progress[key] || 'new';
}

// ===== Display Updates =====
function updateDisplay() {
    // Hide all modes
    elements.flashcardMode.classList.add('hidden');
    elements.quizMode.classList.add('hidden');
    elements.typingMode.classList.add('hidden');
    if (elements.fillblanksMode) elements.fillblanksMode.classList.add('hidden');
    if (elements.readingSection) elements.readingSection.classList.add('hidden');
    if (matchingElements.section) matchingElements.section.classList.add('hidden');

    const categoryNav = document.getElementById('categoryNav');
    const progressIndicator = document.getElementById('progressIndicator');

    if (state.currentMode === 'reading') {
        categoryNav.classList.add('hidden');
        progressIndicator.classList.add('hidden');
    } else {
        categoryNav.classList.remove('hidden');
        progressIndicator.classList.remove('hidden');
    }

    switch (state.currentMode) {
        case 'flashcard':
            elements.flashcardMode.classList.remove('hidden');
            updateFlashcard();
            break;
        case 'quiz':
            elements.quizMode.classList.remove('hidden');
            updateQuiz();
            break;
        case 'typing':
            elements.typingMode.classList.remove('hidden');
            updateTyping();
            break;
        case 'fillblanks':
            if (elements.fillblanksMode) elements.fillblanksMode.classList.remove('hidden');
            initFillBlanks();
            break;
        case 'reading':
            if (elements.readingSection) elements.readingSection.classList.remove('hidden');
            break;
        case 'matching':
            if (matchingElements.section) matchingElements.section.classList.remove('hidden');
            initMatching();
            break;
    }

    if (state.currentMode !== 'reading') {
        updateProgress();
    }
}

// Timer Logic
function toggleAutoPlay() {
    if (!elements.autoPlayFlashcardsBtn) return;
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        elements.autoPlayFlashcardsBtn.textContent = '⏱️ Test Rápido (3s)';
        elements.autoPlayFlashcardsBtn.classList.remove('active');
    } else {
        elements.autoPlayFlashcardsBtn.textContent = '⏹️ Detener Test';
        elements.autoPlayFlashcardsBtn.classList.add('active');

        const cycle = () => {
            if (state.currentIndex >= state.currentWords.length - 1 && state.isFlipped) {
                toggleAutoPlay();
                return;
            }
            if (!state.isFlipped) {
                elements.flashcard.click();
                if (document.getElementById('flashcardAudioBtn')) {
                    const word = state.currentWords[state.currentIndex];
                    if (word && state.currentMode === 'flashcard') speakText(word.word);
                }
            } else {
                elements.nextBtn.click();
            }
        };
        autoPlayInterval = setInterval(cycle, 1500);
    }
}

function toggleFlashcardTimer() {
    if (flashcardTimerInterval) {
        stopFlashcardTimer();
        return;
    }

    const minutes = parseInt(elements.timerSelect.value);
    if (minutes === 0) return; // Sin límite

    flashcardTimeRemaining = minutes * 60;
    elements.startTimerBtn.textContent = "Detener";
    elements.startTimerBtn.classList.add('stop');
    elements.timerSelect.disabled = true;

    updateTimerDisplay();
    elements.timerDisplay.classList.add('running');
    elements.timerDisplay.classList.remove('ending');

    flashcardTimerInterval = setInterval(() => {
        flashcardTimeRemaining--;
        updateTimerDisplay();

        if (flashcardTimeRemaining <= 60) {
            elements.timerDisplay.classList.add('ending');
        }

        if (flashcardTimeRemaining <= 0) {
            stopFlashcardTimer();
            alert("¡Tiempo terminado! Buen trabajo. Pasaremos a la sección Quiz para evaluar lo aprendido.");
            // Auto switch to quiz
            document.querySelector('.mode-btn[data-mode="quiz"]')?.click();
        }
    }, 1000);
}

function stopFlashcardTimer() {
    if (flashcardTimerInterval) clearInterval(flashcardTimerInterval);
    flashcardTimerInterval = null;
    elements.startTimerBtn.textContent = "Iniciar";
    elements.startTimerBtn.classList.remove('stop');
    elements.timerSelect.disabled = false;
    elements.timerDisplay.textContent = "--:--";
    elements.timerDisplay.classList.remove('running', 'ending');
}

function updateTimerDisplay() {
    const mins = Math.floor(flashcardTimeRemaining / 60);
    const secs = flashcardTimeRemaining % 60;
    elements.timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateFlashcard() {
    const word = state.currentWords[state.currentIndex];
    if (!word) return;

    if (elements.flashcardCurrentCount && elements.flashcardTotalCount) {
        elements.flashcardCurrentCount.textContent = state.currentIndex + 1;
        elements.flashcardTotalCount.textContent = state.currentWords.length;
    }

    const ruWordMain = document.getElementById('ruWordMain');
    const ruLetterBreakdown = document.getElementById('ruLetterBreakdown');
    const ruMeaning = document.getElementById('ruMeaning');
    const ruPhonetic = document.getElementById('ruPhonetic');

    const cyrMap = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'ye', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': "'", 'э': 'e', 'ю': 'yu', 'я': 'ya' };

    if (state.currentLanguage === 'ru' && word.translation_es) {
        if (ruWordMain) { ruWordMain.textContent = word.word; ruWordMain.classList.remove('hidden'); }
        if (ruLetterBreakdown) { ruLetterBreakdown.innerHTML = word.word.split('').map(c => `<span>${c}=${cyrMap[c.toLowerCase()] || c}</span>`).join(''); ruLetterBreakdown.classList.remove('hidden'); }
        if (ruMeaning) { ruMeaning.textContent = word.translation_es; ruMeaning.classList.remove('hidden'); }
        if (ruPhonetic) { ruPhonetic.textContent = `/${word.phonetic || word.word}/`; ruPhonetic.classList.remove('hidden'); }
        elements.currentWord.classList.add('hidden');
        elements.phonetic.classList.add('hidden');
        elements.definition.textContent = word.definition;
        elements.example.textContent = '"' + word.example + '"';
        elements.translationPrimary.textContent = word.translation_en || '';
        elements.translationSecondary.classList.add('hidden');
    } else {
        if (ruWordMain) ruWordMain.classList.add('hidden');
        if (ruLetterBreakdown) ruLetterBreakdown.classList.add('hidden');
        if (ruMeaning) ruMeaning.classList.add('hidden');
        if (ruPhonetic) ruPhonetic.classList.add('hidden');
        elements.currentWord.classList.remove('hidden');
        elements.phonetic.classList.remove('hidden');
        elements.currentWord.textContent = word.word;
        elements.phonetic.textContent = `/${word.phonetic || word.word}/`;
        if (word.translation_es) {
            elements.translationPrimary.textContent = word.translation_es;
            elements.translationSecondary.textContent = word.translation_en ? `(${word.translation_en})` : '';
            elements.translationSecondary.classList.remove('hidden');
        } else {
            elements.translationPrimary.textContent = word.translation;
            elements.translationSecondary.textContent = '';
            elements.translationSecondary.classList.add('hidden');
        }
        elements.definition.textContent = word.definition;
        elements.example.textContent = '"' + word.example + '"';
    }

    const assocInput = document.getElementById('associationInput');
    if (assocInput) { const key = `${state.currentCategory}:${word.word}`; assocInput.value = state.associations[key] || ''; }

    elements.flashcard.classList.toggle('flipped', state.isFlipped);
    elements.prevBtn.disabled = state.currentIndex === 0;
    elements.nextBtn.disabled = state.currentIndex === state.currentWords.length - 1;
}

function updateQuiz() {
    const word = state.currentWords[state.currentIndex];
    if (!word) return;

    elements.quizWord.textContent = word.word;
    elements.quizPhonetic.textContent = `/${word.phonetic || word.word}/`;

    const options = generateQuizOptions(word);
    const optionButtons = elements.quizOptions.querySelectorAll('.quiz-option');

    optionButtons.forEach((btn, i) => {
        btn.textContent = options[i].definition;
        btn.dataset.correct = options[i].correct;
        btn.classList.remove('correct', 'incorrect');
        btn.disabled = false;
    });

    elements.scoreValue.textContent = state.quizScore;
    elements.totalQuestions.textContent = state.quizTotal;
}

function generateQuizOptions(correctWord) {
    // Use Spanish translation as the answer key for better understanding
    const correctDef = correctWord.translation_es || correctWord.translation;
    const options = [{ definition: correctDef, correct: true }];

    const wrongWords = state.currentWords
        .filter(w => w.word !== correctWord.word)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    wrongWords.forEach(w => {
        // Use Spanish definition/translation for options if available to help user
        const def = w.translation_es || w.translation;
        options.push({ definition: def, correct: false });
    });

    return options.sort(() => Math.random() - 0.5);
}

function handleQuizAnswer(index) {
    const optionButtons = elements.quizOptions.querySelectorAll('.quiz-option');
    const selected = optionButtons[index];
    const isCorrect = selected.dataset.correct === 'true';

    state.quizTotal++;

    if (isCorrect) {
        state.quizScore++;
        selected.classList.add('correct');
        elements.quizFeedback.querySelector('.feedback-text').textContent = '¡Correcto!';
        elements.quizFeedback.querySelector('.feedback-text').className = 'feedback-text correct';
        markWord('mastered');
    } else {
        selected.classList.add('incorrect');
        optionButtons.forEach(btn => {
            if (btn.dataset.correct === 'true') {
                btn.classList.add('correct');
            }
        });
        elements.quizFeedback.querySelector('.feedback-text').textContent = 'Incorrecto. Mira la respuesta correcta arriba.';
        elements.quizFeedback.querySelector('.feedback-text').className = 'feedback-text incorrect';
    }

    optionButtons.forEach(btn => btn.disabled = true);
    elements.quizFeedback.classList.remove('hidden');
    elements.scoreValue.textContent = state.quizScore;
    elements.totalQuestions.textContent = state.quizTotal;

    // Auto-advance with longer delay
    if (isCorrect) {
        setTimeout(() => {
            elements.nextQuestionBtn.click();
        }, 2000); // 2 seconds delay
    }
}

function updateTyping() {
    const word = state.currentWords[state.currentIndex];
    if (!word) return;

    elements.typingDefinition.textContent = word.translation_es || word.translation || word.definition;

    const blankExample = word.example.replace(
        new RegExp(word.word, 'gi'),
        '_______'
    );
    elements.typingExample.textContent = `"${blankExample}"`;

    // Format hint (e.g., _ _ _ _ for 4 letters)
    const formatLetters = word.word.split('').map(c => c === ' ' ? ' ' : '_').join(' ');
    elements.typingFormatHint.textContent = `Formato: ${formatLetters} (${word.word.length} letras)`;

    elements.typingInput.value = '';
    elements.typingInput.focus();
}

function checkTypingAnswer() {
    const word = state.currentWords[state.currentIndex];
    const userAnswer = elements.typingInput.value.trim().toLowerCase();
    const correct = word.word.toLowerCase();

    const feedbackText = elements.typingFeedback.querySelector('.feedback-text');

    if (userAnswer === correct) {
        feedbackText.textContent = `¡Correcto! La palabra es "${word.word}"`;
        feedbackText.className = 'feedback-text correct';
        markWord('mastered');

        elements.typingExample.textContent = '"' + word.example + '"';
        speakText(word.example);
        setTimeout(() => { elements.nextWordBtn.click(); }, 3000);
    } else {
        feedbackText.textContent = `Incorrecto. Sigues intentándolo o presiona 'Pista'.`;
        feedbackText.className = 'feedback-text incorrect';
    }

    elements.typingFeedback.classList.remove('hidden');
}

// ===== Fill In Blanks Logic =====

let fillBlanksCorrectAnswers = [];

function initFillBlanks() {
    if (!elements.fillblanksMode) return;
    elements.fillblanksFeedback.classList.add('hidden');

    const candidates = [...state.currentWords];
    shuffleArray(candidates);
    const selected = candidates.slice(0, 5); // 5 sentences max

    fillBlanksCorrectAnswers = selected.map(w => w.word.toLowerCase());

    let html = ``;

    selected.forEach((wordObj, index) => {
        const sentenceParts = wordObj.example.split(new RegExp(`(${wordObj.word})`, 'gi'));
        let blankedSentence = '';

        sentenceParts.forEach(part => {
            if (part.toLowerCase() === wordObj.word.toLowerCase()) {
                const optionsHtml = selected.map(opt => `<option value="${opt.word.toLowerCase()}">${opt.word}</option>`).sort(() => Math.random() - 0.5).join('');
                blankedSentence += `<select class="fillblank-select" data-index="${index}"><option value="" disabled selected>---</option>${optionsHtml}</select>`;
            } else {
                blankedSentence += part;
            }
        });

        html += `
        <div class="fillblank-item">
            <p>${blankedSentence}</p>
        </div>
        `;
    });

    elements.fillblanksContent.innerHTML = html;
}

function checkFillBlanks() {
    const selects = elements.fillblanksContent.querySelectorAll('.fillblank-select');
    let allCorrect = true;
    let score = 0;

    selects.forEach((select) => {
        const index = parseInt(select.dataset.index);
        const answer = select.value;
        const correct = fillBlanksCorrectAnswers[index];

        if (answer === correct) {
            select.classList.remove('incorrect');
            select.classList.add('correct');
            score++;

            // Mark this associated word as learned visually
            const originalWord = state.currentWords.find(w => w.word.toLowerCase() === correct);
            if (originalWord) markWordExplicit('mastered', originalWord);

        } else {
            select.classList.add('incorrect');
            select.classList.remove('correct');
            allCorrect = false;
        }
    });

    const feedbackText = elements.fillblanksFeedback.querySelector('.feedback-text');

    if (allCorrect) {
        feedbackText.textContent = `¡Perfecto! Has completado todas las oraciones correctamente.`;
        feedbackText.className = 'feedback-text correct';
    } else {
        feedbackText.textContent = `Has acertado ${score} de ${selects.length}. Corrige los recuadros rojos.`;
        feedbackText.className = 'feedback-text incorrect';
    }

    elements.fillblanksFeedback.classList.remove('hidden');
}

function markWordExplicit(status, wordObj) {
    const key = `${state.currentCategory}:${wordObj.word}`;
    state.progress[key] = status;
    saveProgress();
    updateProgress();
}

function updateProgress() {
    let score = 0;
    let total = state.currentWords.length;

    state.currentWords.forEach(word => {
        const status = getWordStatus(word);
        if (status === 'mastered') {
            score += 1;
        } else if (status === 'learning') {
            score += 0.5; // Represents partial progress
        }
    });

    const percentage = total > 0 ? (score / total) * 100 : 0;
    // Just visually display rounded score
    elements.progressIndicator.querySelector('.progress-text').textContent = `${Math.floor(score)} / ${total}`;
    elements.progressFill.style.width = `${percentage}%`;

    // Completion check
    if (score === total && total > 0 && !state.completionShown) {
        state.completionShown = true; // Flag to prevent spam
        setTimeout(() => alert("¡Felicidades! Has completado este set. ¡Pasa al siguiente!"), 500);
    } else if (score < total) {
        state.completionShown = false;
    }
}

// ===== Reading Functions =====

async function handleGenerateText() {
    if (readingState.isLoading) return;

    readingState.isLoading = true;
    showReadingLoading(true);
    hideReadingError();

    try {
        const topic = readingElements.topicInput ? readingElements.topicInput.value || 'General' : 'General';
        const level = readingElements.levelSelect ? readingElements.levelSelect.value : 'intermediate';

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category: readingState.currentCategory,
                topic: topic,
                level: level,
                language: state.currentLanguage
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to generate text');
        }

        const result = await response.json();

        if (result.segments) {
            // New Structured Format
            readingState.currentText = result; // Store whole object
        } else {
            // Legacy Text Format
            readingState.currentText = result.text;
        }
        readingState.difficultWords = result.difficultWords;

        displayReadingText(result);
    } catch (error) {
        console.error('Error generating text:', error);
        showReadingError(error.message);
    } finally {
        readingState.isLoading = false;
        showReadingLoading(false);
    }
}

function displayReadingText(result) {
    // Check if it's the structured Russian format (with segments)
    if (result.segments) {
        let html = `<h2 class="reading-title">${result.title || 'История'}</h2>`;

        result.segments.forEach(seg => {
            html += `
            <div class="reading-segment">
                ${seg.speaker ? `<p class="reading-speaker" style="color: var(--accent); margin-bottom: 0.2rem;"><strong>${seg.speaker}:</strong></p>` : ''}
                <p class="reading-original">${highlightDifficultWords(seg.english || seg.russian || seg.text, result.difficultWords)}</p>
                <p class="reading-phonetic">${seg.phonetic}</p>
                <p class="reading-spanish">${seg.spanish}</p>
            </div>
            `;
        });

        readingElements.textContent.innerHTML = html;
    } else {
        // Standard English Text
        let formattedText = formatTextWithParagraphs(result.text);

        if (result.difficultWords && result.difficultWords.length > 0) {
            formattedText = highlightDifficultWords(formattedText, result.difficultWords);
        }

        readingElements.textContent.innerHTML = formattedText;
    }

    readingElements.textContainer.classList.remove('hidden');
}

function handleWordClick(e, wordElement) {
    e.stopPropagation();

    const wordIndex = parseInt(wordElement.dataset.wordIndex);
    const wordData = readingState.difficultWords[wordIndex];

    if (wordData) {
        showWordTooltip(wordElement, wordData);
    }
}

function showWordTooltip(element, wordData) {
    const tooltip = readingElements.wordTooltip;

    tooltip.innerHTML = `
     <div class="tooltip-word">${wordData.word}</div>
     <div class="tooltip-definition">${wordData.definition}</div>
     ${wordData.example ? `<div class="tooltip-example">"${wordData.example}"</div>` : ''}
   `;

    // Position tooltip
    const rect = element.getBoundingClientRect();
    // Adjust for scrolling if needed, but 'fixed' or 'absolute' depends on CSS. 
    // Assuming CSS handles it relative to viewport or body. index.css had it absolute.

    // We need to calculate position relative to the document or common parent if absolute
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    tooltip.style.left = `${rect.left + (rect.width / 2) + scrollLeft}px`;
    tooltip.style.top = `${rect.bottom + 8 + scrollTop}px`;
    tooltip.classList.remove('hidden');
    tooltip.classList.add('visible');
}

function hideWordTooltip() {
    readingElements.wordTooltip.classList.add('hidden');
    readingElements.wordTooltip.classList.remove('visible');
}

function showReadingLoading(show) {
    if (show) {
        readingElements.loadingSpinner.classList.remove('hidden');
        readingElements.generateBtn.disabled = true;
        readingElements.generateBtn.textContent = 'Generating...';
    } else {
        readingElements.loadingSpinner.classList.add('hidden');
        readingElements.generateBtn.disabled = false;
        readingElements.generateBtn.textContent = 'Generate New Text';
    }
}

function showReadingError(message) {
    readingElements.errorMessage.textContent = message;
    readingElements.errorMessage.classList.remove('hidden');
}

function hideReadingError() {
    readingElements.errorMessage.classList.add('hidden');
}

function highlightDifficultWords(text, difficultWords) {
    if (!difficultWords || difficultWords.length === 0) {
        return text;
    }

    let highlightedText = text;

    difficultWords.forEach((wordObj, index) => {
        const regex = new RegExp(`\\b(${wordObj.word})\\b`, 'gi');
        highlightedText = highlightedText.replace(regex,
            `<span class="difficult-word" data-word-index="${index}">$1</span>`
        );
    });

    return highlightedText;
}

function formatTextWithParagraphs(text) {
    const paragraphs = text.split(/\n\n|\n/).filter(p => p.trim());
    return paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
}

// ===== Matching Mode Functions =====
function initMatching() {
    if (matchingElements.feedback) matchingElements.feedback.classList.add('hidden');

    // Select 4 random pairs from current set
    const candidates = [...state.currentWords];
    shuffleArray(candidates);
    const selected = candidates.slice(0, 4);

    // Create 8 cards
    const cards = [];
    selected.forEach((word, index) => {
        // Card 1: The Word
        cards.push({
            id: `word-${index}`,
            matchId: index,
            type: 'word',
            content: word.word,
            state: 'face-down'
        });

        // Card 2: The Translation (easier than definition)
        // Use Spanish translation if available
        const matchContent = word.translation_es || word.translation;
        cards.push({
            id: `def-${index}`,
            matchId: index,
            type: 'def',
            content: matchContent,
            state: 'face-down'
        });
    });

    shuffleArray(cards);
    matchingState.cards = cards;
    matchingState.selectedCards = [];
    matchingState.matchedPairs = 0;

    renderMatchingGrid();

    if (matchingElements.score) matchingElements.score.textContent = '0';
}

function renderMatchingGrid() {
    if (!matchingElements.grid) return;
    matchingElements.grid.innerHTML = '';

    // FORCE GRID STYLES (User reported vertical issue)
    Object.assign(matchingElements.grid.style, {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        width: '100%',
        maxWidth: '600px',
        justifyContent: 'center'
    });

    matchingState.cards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = `matching-card type-${card.type} ${card.state}`;
        cardEl.textContent = card.content;
        cardEl.dataset.index = index;
        cardEl.addEventListener('click', () => handleMatchingCardClick(index));
        matchingElements.grid.appendChild(cardEl);
    });
}

function handleMatchingCardClick(index) {
    const card = matchingState.cards[index];

    // Ignore if already matched or selected or mismatch animation
    if (card.state === 'matched' || card.state === 'selected' || card.state === 'mismatch') return;

    // Determine action
    if (matchingState.selectedCards.length < 2) {
        // Select logic
        card.state = 'selected';
        matchingState.selectedCards.push({ index, ...card });
        renderMatchingGrid();

        if (matchingState.selectedCards.length === 2) {
            // Check match
            const [c1, c2] = matchingState.selectedCards;
            if (c1.matchId === c2.matchId) {
                // Match!
                matchingState.cards[c1.index].state = 'matched';
                matchingState.cards[c2.index].state = 'matched';
                // Success Audio
                speakText(c1.type === 'word' ? c1.content : c2.content);

                matchingState.matchedPairs++;
                matchingState.selectedCards = [];
                renderMatchingGrid();

                if (matchingElements.score) matchingElements.score.textContent = matchingState.matchedPairs;

                // Win condition
                if (matchingState.matchedPairs === matchingState.totalPairs) {
                    if (matchingElements.feedback) matchingElements.feedback.classList.remove('hidden');
                }
            } else {
                // Mismatch
                matchingState.cards[c1.index].state = 'mismatch';
                matchingState.cards[c2.index].state = 'mismatch';
                renderMatchingGrid();

                setTimeout(() => {
                    matchingState.cards[c1.index].state = 'face-down';
                    matchingState.cards[c2.index].state = 'face-down';
                    matchingState.selectedCards = [];
                    renderMatchingGrid();
                }, 800);
            }
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
