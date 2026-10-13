import { ARCADE_DATASET, ARCADE_MISSIONS } from '../data/julebu-arcade-dataset.ts';
import { speechPlayer, automaticAudioEnabled } from './speech-player.js';
import { localDay, recordTrainingAction, getArenaLevel } from './training-progress.js';
import { playSuccessSound, playErrorSound, playClickSound, playStreakSound, playVictorySound, playSpeedBonusSound, toggleSoundMute, isSoundMuted } from './sound-fx.js';

// =========================================================
// ARCADE ENGINE STATE & LOCAL STORAGE PERSISTENCE
// =========================================================

const STORAGE_KEYS = {
    XP: 'arcade_xp',
    STREAK: 'arcade_streak_data',
    DAILY_GOAL: 'arcade_daily_goal',
    COMPLETED_MISSIONS: 'arcade_completed_missions',
    MISTAKES_QUEUE: 'arcade_mistakes_queue',
    SRS_DATA: 'arcade_srs_data',
    ACHIEVEMENTS: 'arcade_achievements',
    SETTINGS: 'arcade_settings'
};

export const arcadeState = {
    active: false,
    currentMission: null,
    challenges: [],
    currentIndex: 0,
    currentChallenge: null,
    currentModeType: 'order', // 'order' | 'cloze' | 'translate' | 'listen_type' | 'listen_select' | 'speech'
    
    // Scoring & Combo
    score: 0,
    consecutiveHits: 0,
    comboMultiplier: 1,
    maxCombo: 1,
    sessionMistakes: [],
    sessionCorrectCount: 0,
    totalChallengesCount: 0,
    sessionStartTime: null,

    // Competitive Ghost Rival & Speed Bonus
    speedTimerInterval: null,
    speedTimerRemaining: 10,
    speedBonusEarned: false,
    ghostRivalProgress: 0,
    ghostRivalInterval: null,
    ghostRivalName: 'ShadowDev',
    ghostRivalSpeed: 1.0,
    ghostRivalBeat: false,
    keyboardShortcutsBound: false,

    // Word order builder state
    orderPlacedWords: [],
    orderAvailableWords: [],

    // Scaffolding hints
    hintUsed: false,
    revealedLettersCount: 0,

    // Speech recognition
    isRecording: false,
    speechRecognitionInstance: null,

    // User Profile & Gamification (Loaded from localStorage)
    xp: 0,
    level: 1,
    levelTitle: '[CADETE CYBER]',
    divisionName: 'División I',
    percentileRank: 'Progresión personal',
    dailyStreak: 0,
    bestStreak: 0,
    lastPlayDate: null,
    streakFreezeAvailable: true,
    dailyPoints: 0,
    dailyTarget: 20,
    achievements: [],
    srsData: {},
    mistakesQueue: []
};

// =========================================================
// FLOATING SCORE PARTICLES & EFFECTS
// =========================================================

export function spawnFloatingXP(points, text = '') {
    try {
        const el = document.createElement('div');
        el.className = 'floating-xp-burst';
        el.textContent = text ? `${text} +${points} XP` : `+${points} XP`;
        el.style.left = `${window.innerWidth / 2}px`;
        el.style.top = `${window.innerHeight / 2 - 40}px`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1100);
    } catch (e) {
        console.warn('Particle spawn error:', e);
    }
}

// =========================================================
// HELPER FUNCTIONS & STRING SANITIZATION
// =========================================================

function normalizeText(text) {
    if (!text) return '';
    return text
        .toLowerCase()
        .replace(/’/g, "'")
        .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'¡¿!]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Smart fuzzy comparator for English sentences (handles contractions, spacing, casing)
 */
function isFlexibleMatch(userInput, targetEnglish) {
    const normUser = normalizeText(userInput);
    const normTarget = normalizeText(targetEnglish);

    if (normUser === normTarget) return true;

    // Normalizing common English contractions
    const expandContractions = (str) => {
        return str
            .replace(/\bi've\b/g, 'i have')
            .replace(/\byou've\b/g, 'you have')
            .replace(/\bwe've\b/g, 'we have')
            .replace(/\bthey've\b/g, 'they have')
            .replace(/\bhe's\b/g, 'he is')
            .replace(/\bshe's\b/g, 'she is')
            .replace(/\bit's\b/g, 'it is')
            .replace(/\bthat's\b/g, 'that is')
            .replace(/\bdon't\b/g, 'do not')
            .replace(/\bdoesn't\b/g, 'does not')
            .replace(/\bdidn't\b/g, 'did not')
            .replace(/\bcan't\b/g, 'cannot')
            .replace(/\bcouldn't\b/g, 'could not')
            .replace(/\bwon't\b/g, 'will not')
            .replace(/\bwouldn't\b/g, 'would not')
            .replace(/\bisn't\b/g, 'is not')
            .replace(/\baren't\b/g, 'are not')
            .replace(/\bwasn't\b/g, 'was not')
            .replace(/\bweren't\b/g, 'were not')
            .replace(/\blet's\b/g, 'let us');
    };

    return expandContractions(normUser) === expandContractions(normTarget);
}

function calculateLevel(xp) {
    return getArenaLevel(xp);
}

function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

// =========================================================
// LOCAL STORAGE LOGIC
// =========================================================

export function loadArcadeUserData() {
    try {
        arcadeState.xp = parseInt(localStorage.getItem(STORAGE_KEYS.XP)) || 0;
        
        const streakData = JSON.parse(localStorage.getItem(STORAGE_KEYS.STREAK) || '{}');
        const today = localDay();
        
        if (streakData.lastPlayDate) {
            const lastDate = new Date(streakData.lastPlayDate);
            const currentDate = new Date(today);
            const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                arcadeState.dailyStreak = streakData.currentStreak || 1;
            } else if (diffDays === 1) {
                arcadeState.dailyStreak = streakData.currentStreak || 1;
            } else if (diffDays === 2 && streakData.streakFreezeAvailable) {
                // Use streak freeze wildcard
                arcadeState.dailyStreak = streakData.currentStreak || 1;
                streakData.streakFreezeAvailable = false;
            } else {
                arcadeState.dailyStreak = 0;
            }
        } else {
            arcadeState.dailyStreak = 0;
        }

        arcadeState.bestStreak = streakData.bestStreak || arcadeState.dailyStreak;
        arcadeState.lastPlayDate = streakData.lastPlayDate || null;
        arcadeState.streakFreezeAvailable = streakData.streakFreezeAvailable !== undefined ? streakData.streakFreezeAvailable : true;

        const dailyGoalData = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_GOAL) || '{}');
        if (dailyGoalData.date === today) {
            arcadeState.dailyPoints = dailyGoalData.points || 0;
        } else {
            arcadeState.dailyPoints = 0;
        }
        arcadeState.dailyTarget = dailyGoalData.target || 20;

        arcadeState.mistakesQueue = JSON.parse(localStorage.getItem(STORAGE_KEYS.MISTAKES_QUEUE) || '[]');
        arcadeState.srsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.SRS_DATA) || '{}');
        arcadeState.achievements = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS) || '[]');

        const lvlInfo = calculateLevel(arcadeState.xp);
        arcadeState.level = lvlInfo.level;
        arcadeState.levelTitle = lvlInfo.title;

    } catch (e) {
        console.error('Error loading arcade user data:', e);
    }
}

export function saveArcadeUserData() {
    try {
        localStorage.setItem(STORAGE_KEYS.XP, arcadeState.xp.toString());

        const today = localDay();
        const streakData = {
            currentStreak: arcadeState.dailyStreak,
            bestStreak: Math.max(arcadeState.bestStreak, arcadeState.dailyStreak),
            lastPlayDate: today,
            streakFreezeAvailable: arcadeState.streakFreezeAvailable
        };
        localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streakData));

        const dailyGoalData = {
            date: today,
            points: arcadeState.dailyPoints,
            target: arcadeState.dailyTarget
        };
        localStorage.setItem(STORAGE_KEYS.DAILY_GOAL, JSON.stringify(dailyGoalData));

        localStorage.setItem(STORAGE_KEYS.MISTAKES_QUEUE, JSON.stringify(arcadeState.mistakesQueue));
        localStorage.setItem(STORAGE_KEYS.SRS_DATA, JSON.stringify(arcadeState.srsData));
        localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(arcadeState.achievements));
    } catch (e) {
        console.error('Error saving arcade user data:', e);
    }
}

export function recordStreakActivity() {
    const today = localDay();
    if (arcadeState.lastPlayDate !== today) {
        arcadeState.dailyStreak += 1;
        arcadeState.lastPlayDate = today;
        if (arcadeState.dailyStreak > arcadeState.bestStreak) {
            arcadeState.bestStreak = arcadeState.dailyStreak;
        }
        saveArcadeUserData();
    }
}

// =========================================================
// TTS SPEECH HELPER
// =========================================================

export function speakArcadeSentence(text, rate = .9, automatic = false) {
    if (automatic && !automaticAudioEnabled()) return Promise.resolve('skipped');
    return speechPlayer.play(text, { rate });
}

// =========================================================
// MASCOT (BYTE) REACTION SYSTEM
// =========================================================

export function updateMascotReaction(mood, text = '') {
    const mascotEl = document.getElementById('arcadeMascot');
    const bubbleEl = document.getElementById('arcadeMascotBubble');
    if (!mascotEl) return;

    mascotEl.className = `arcade-mascot-avatar mood-${mood}`;
    
    // Mood tag mapping
    const tags = {
        idle: '[AI]',
        happy: '[OK]',
        hype: '[XP]',
        fire: '[MAX]',
        helper: '[TIP]',
        sad: '[ERR]',
        victory: '[WIN]'
    };

    const eyeEl = mascotEl.querySelector('.mascot-face-icon');
    if (eyeEl) eyeEl.textContent = tags[mood] || '[AI]';

    if (bubbleEl) {
        if (text) {
            bubbleEl.textContent = text;
            bubbleEl.classList.remove('hidden');
        } else {
            bubbleEl.classList.add('hidden');
        }
    }
}

// =========================================================
// COMPETITIVE GHOST RIVAL & SPEED BONUS ENGINES
// =========================================================

export function startSpeedBonusTimer() {
    stopSpeedBonusTimer();
    arcadeState.speedTimerRemaining = 10;
    arcadeState.speedBonusEarned = false;

    const fillEl = document.getElementById('arcadeSpeedTimerFill');
    const badgeEl = document.getElementById('arcadeSpeedBonusBadge');
    if (fillEl) {
        fillEl.style.width = '100%';
        fillEl.classList.remove('critical');
    }
    if (badgeEl) {
        badgeEl.textContent = '+50 PTS (<4s)';
    }

    arcadeState.speedTimerInterval = setInterval(() => {
        arcadeState.speedTimerRemaining -= 0.1;
        const pct = Math.max(0, (arcadeState.speedTimerRemaining / 10) * 100);
        if (fillEl) {
            fillEl.style.width = `${pct}%`;
            if (arcadeState.speedTimerRemaining < 6) {
                fillEl.classList.add('critical');
            }
        }
        if (badgeEl) {
            if (arcadeState.speedTimerRemaining >= 6) {
                badgeEl.textContent = `+50 PTS (${arcadeState.speedTimerRemaining.toFixed(1)}s)`;
            } else {
                badgeEl.textContent = 'EXPIRADO (0 PTS)';
            }
        }
        if (arcadeState.speedTimerRemaining <= 0) {
            stopSpeedBonusTimer();
        }
    }, 100);
}

export function stopSpeedBonusTimer() {
    if (arcadeState.speedTimerInterval) {
        clearInterval(arcadeState.speedTimerInterval);
        arcadeState.speedTimerInterval = null;
    }
}

export function startGhostRivalRace() {
    stopGhostRivalRace();
    arcadeState.ghostRivalProgress = 0;
    arcadeState.ghostRivalName = 'ShadowDev';
    updateRivalMeters();

    // Advance rival realistically based on total challenges
    const rivalStepPct = Math.max(8, Math.min(20, 100 / (arcadeState.totalChallengesCount || 6)));
    arcadeState.ghostRivalInterval = setInterval(() => {
        if (!arcadeState.active) {
            stopGhostRivalRace();
            return;
        }
        if (arcadeState.ghostRivalProgress < 96) {
            arcadeState.ghostRivalProgress += (rivalStepPct * (0.65 + Math.random() * 0.5));
            if (arcadeState.ghostRivalProgress > 100) arcadeState.ghostRivalProgress = 100;
            updateRivalMeters();
        }
    }, 3200);
}

export function stopGhostRivalRace() {
    if (arcadeState.ghostRivalInterval) {
        clearInterval(arcadeState.ghostRivalInterval);
        arcadeState.ghostRivalInterval = null;
    }
}

export function updateRivalMeters() {
    const userMeter = document.getElementById('arcadeUserMeter');
    const rivalMeter = document.getElementById('arcadeRivalMeter');
    const userLabel = document.getElementById('arcadeUserTrackLabel');
    const rivalLabel = document.getElementById('arcadeRivalTrackLabel');

    const total = arcadeState.totalChallengesCount || 1;
    const userPct = Math.min(100, Math.round((arcadeState.currentIndex / total) * 100));
    const rivalPct = Math.min(100, Math.round(arcadeState.ghostRivalProgress));

    if (userMeter) userMeter.style.width = `${userPct}%`;
    if (rivalMeter) rivalMeter.style.width = `${rivalPct}%`;

    if (userLabel) userLabel.textContent = `TÚ: ${userPct}%`;
    if (rivalLabel) {
        const leadText = userPct >= rivalPct ? '[LIDERAS]' : '[TE PERSIGUE]';
        rivalLabel.textContent = `RIVAL (${arcadeState.ghostRivalName}): ${rivalPct}% ${leadText}`;
    }
}

export function renderTopHeroBanner() {
    loadArcadeUserData();
    const lvlInfo = calculateLevel(arcadeState.xp);

    const divEl = document.getElementById('heroBannerDivision');
    const rankEl = document.getElementById('heroBannerPercentile');
    const streakEl = document.getElementById('heroBannerStreak');

    if (divEl) divEl.textContent = lvlInfo.division;
    if (rankEl) rankEl.textContent = lvlInfo.percentile;
    if (streakEl) streakEl.textContent = `${arcadeState.dailyStreak} Días`;
}

export function initArcadeKeyboardShortcuts() {
    if (arcadeState.keyboardShortcutsBound) return;
    arcadeState.keyboardShortcutsBound = true;

    document.addEventListener('keydown', (e) => {
        if (!arcadeState.active) return;
        const targetTag = e.target.tagName;
        if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') return;

        // Enter key to advance feedback
        if (e.key === 'Enter') {
            const nextBtn = document.getElementById('arcadeFeedbackNextBtn');
            if (nextBtn && !nextBtn.closest('.hidden')) {
                e.preventDefault();
                nextBtn.click();
                return;
            }
            if (arcadeState.currentModeType === 'order') {
                e.preventDefault();
                document.getElementById('arcadeOrderSubmitBtn')?.click();
                return;
            }
        }

        // Space key to replay audio
        if (e.code === 'Space') {
            e.preventDefault();
            if (arcadeState.currentChallenge) {
                speakArcadeSentence(arcadeState.currentChallenge.english, 0.9);
            }
            return;
        }

        // Backspace key in Word Order to undo last placed word
        if (e.key === 'Backspace' && arcadeState.currentModeType === 'order') {
            if (arcadeState.orderPlacedWords.length > 0) {
                e.preventDefault();
                const last = arcadeState.orderPlacedWords.pop();
                const found = arcadeState.orderAvailableWords.find(w => w.id === last.id);
                if (found) found.used = false;
                renderOrderChips();
                return;
            }
        }

        // Keys 1, 2, 3, 4 for Cloze and Listen Select
        if (['1', '2', '3', '4'].includes(e.key)) {
            const idx = parseInt(e.key) - 1;
            if (arcadeState.currentModeType === 'cloze') {
                const pills = document.querySelectorAll('.arcade-option-pill');
                if (pills[idx]) {
                    e.preventDefault();
                    pills[idx].click();
                }
            } else if (arcadeState.currentModeType === 'listen_select') {
                const cards = document.querySelectorAll('.arcade-listen-option-card');
                if (cards[idx]) {
                    e.preventDefault();
                    cards[idx].click();
                }
            }
        }
    });
}

// =========================================================
// COMBO & SCORE CALCULATOR
// =========================================================

function applyCorrectAnswer() {
    recordTrainingAction('arcade-answer', true, `arcade:${arcadeState.currentChallenge?.id}`);
    // Check speed bonus before stopping timer
    const isSpeedBonus = arcadeState.speedTimerRemaining >= 6;
    stopSpeedBonusTimer();

    arcadeState.consecutiveHits += 1;
    arcadeState.sessionCorrectCount += 1;
    arcadeState.dailyPoints += 1;

    // Combo Multiplier Rules:
    // 1-2: x1 | 3-4: x2 | 5-9: x3 | 10-19: x4 ("En racha") | 20+: x5 ("Cyber god")
    let newMultiplier = 1;
    if (arcadeState.consecutiveHits >= 20) newMultiplier = 5;
    else if (arcadeState.consecutiveHits >= 10) newMultiplier = 4;
    else if (arcadeState.consecutiveHits >= 5) newMultiplier = 3;
    else if (arcadeState.consecutiveHits >= 3) newMultiplier = 2;

    arcadeState.comboMultiplier = newMultiplier;
    if (arcadeState.comboMultiplier > arcadeState.maxCombo) {
        arcadeState.maxCombo = arcadeState.comboMultiplier;
    }

    // Base score 100 * multiplier + hint bonus + speed bonus
    const hintBonus = arcadeState.hintUsed ? 50 : 100;
    let gainedPoints = hintBonus * arcadeState.comboMultiplier;
    let speedBonusPts = 0;

    if (isSpeedBonus) {
        speedBonusPts = 50;
        gainedPoints += speedBonusPts;
        arcadeState.speedBonusEarned = true;
        playSpeedBonusSound();
        spawnFloatingXP(50, '[SPEED BONUS]');
    }

    arcadeState.score += gainedPoints;
    const gainedXp = Math.round(gainedPoints / 10);
    arcadeState.xp += gainedXp;
    spawnFloatingXP(gainedXp, 'XP');

    // Audio feedback
    playSuccessSound(arcadeState.comboMultiplier);

    // Mascot reaction
    if (isSpeedBonus && arcadeState.comboMultiplier >= 4) {
        playStreakSound();
        updateMascotReaction('fire', `[REFLEJO VELOZ + RACHA x${arcadeState.comboMultiplier}] Imparable.`);
    } else if (arcadeState.comboMultiplier >= 4) {
        playStreakSound();
        updateMascotReaction('fire', `[EN RACHA] x${arcadeState.comboMultiplier} (${arcadeState.consecutiveHits} seguidas)`);
    } else if (isSpeedBonus) {
        updateMascotReaction('hype', `[VELOCIDAD LUZ] +50 PTS bonus por respuesta express.`);
    } else if (arcadeState.comboMultiplier === 3) {
        updateMascotReaction('hype', `[COMBO x3] Mantén el ritmo.`);
    } else if (arcadeState.comboMultiplier === 2) {
        updateMascotReaction('happy', `¡Bien hecho! Multiplicador activo x2`);
    } else {
        updateMascotReaction('happy', `¡Correcto! +${gainedPoints} pts`);
    }

    // Update SRS for this challenge
    if (arcadeState.currentChallenge) {
        const id = arcadeState.currentChallenge.id;
        const currentLevel = arcadeState.srsData[id]?.level || 0;
        arcadeState.srsData[id] = {
            level: Math.min(currentLevel + 1, 5),
            lastReviewed: Date.now(),
            nextReview: Date.now() + (Math.pow(2, currentLevel + 1) * 24 * 60 * 60 * 1000)
        };

        // Remove from mistakes queue if answered correctly
        arcadeState.mistakesQueue = arcadeState.mistakesQueue.filter(mId => mId !== id);
    }

    saveArcadeUserData();
    renderArcadeHud();
    updateRivalMeters();
}

function applyIncorrectAnswer() {
    recordTrainingAction('arcade-answer', false, `arcade:${arcadeState.currentChallenge?.id}`);
    stopSpeedBonusTimer();

    // Soft punishment: decrease multiplier by 1 rather than resetting to zero completely!
    if (arcadeState.comboMultiplier > 1) {
        arcadeState.comboMultiplier = Math.max(1, arcadeState.comboMultiplier - 1);
        arcadeState.consecutiveHits = (arcadeState.comboMultiplier - 1) * 3;
    } else {
        arcadeState.consecutiveHits = 0;
        arcadeState.comboMultiplier = 1;
    }

    playErrorSound();

    if (arcadeState.currentChallenge) {
        const id = arcadeState.currentChallenge.id;
        if (!arcadeState.sessionMistakes.includes(id)) {
            arcadeState.sessionMistakes.push(id);
        }
        if (!arcadeState.mistakesQueue.includes(id)) {
            arcadeState.mistakesQueue.push(id);
        }

        // Reset SRS level on error
        arcadeState.srsData[id] = {
            level: 1,
            lastReviewed: Date.now(),
            nextReview: Date.now() + (2 * 60 * 60 * 1000) // Review in 2 hours
        };
    }

    updateMascotReaction('helper', '[TIP] Analiza la respuesta y memoriza la estructura.');
    saveArcadeUserData();
    renderArcadeHud();
    updateRivalMeters();
}

// =========================================================
// MISSION INITIALIZATION & FLOW
// =========================================================

export function startMission(missionId) {
    let challenges = [];
    let missionMeta = null;

    if (missionId === 'mistakes-loop') {
        // Special custom mission: Drill all recorded mistakes
        const mistakeIds = [...arcadeState.mistakesQueue];
        if (mistakeIds.length === 0) {
            alert('¡Excelente! No tienes errores pendientes por repasar en este momento.');
            return;
        }
        challenges = ARCADE_DATASET.filter(c => mistakeIds.includes(c.id));
        missionMeta = {
            id: 'mistakes-loop',
            title: 'Repaso Inteligente de Errores',
            categoryName: 'Loop de Errores',
            icon: '[REPASO]',
            level: 'B1',
            description: 'Refuerza todas las frases en las que has fallado para fijarlas en la memoria a largo plazo.',
            estimatedMinutes: Math.ceil(challenges.length * 0.5)
        };
    } else {
        missionMeta = ARCADE_MISSIONS.find(m => m.id === missionId);
        if (!missionMeta) return;
        challenges = ARCADE_DATASET.filter(c => missionMeta.challengeIds.includes(c.id));
    }

    if (challenges.length === 0) return;

    arcadeState.active = true;
    arcadeState.currentMission = missionMeta;
    arcadeState.challenges = shuffle(challenges);
    arcadeState.currentIndex = 0;
    arcadeState.score = 0;
    arcadeState.consecutiveHits = 0;
    arcadeState.comboMultiplier = 1;
    arcadeState.maxCombo = 1;
    arcadeState.sessionMistakes = [];
    arcadeState.sessionCorrectCount = 0;
    arcadeState.totalChallengesCount = challenges.length;
    arcadeState.sessionStartTime = Date.now();

    recordStreakActivity();

    document.getElementById('arcadeHubView')?.classList.add('hidden');
    document.getElementById('arcadeResultsView')?.classList.add('hidden');
    document.getElementById('arcadePlayView')?.classList.remove('hidden');

    initArcadeKeyboardShortcuts();
    startGhostRivalRace();
    loadNextChallenge();
}

export function loadNextChallenge() {
    if (arcadeState.currentIndex >= arcadeState.challenges.length) {
        showMissionResults();
        return;
    }

    const challenge = arcadeState.challenges[arcadeState.currentIndex];
    arcadeState.currentChallenge = challenge;
    arcadeState.hintUsed = false;
    arcadeState.revealedLettersCount = 0;

    // Cycle dynamically between 6 game modes for rich multimodal stimulation
    // (Word order -> Cloze -> Reverse Translation -> Listen & Type -> Auditory Discrimination -> Speech Pronunciation)
    const modeCycle = ['order', 'cloze', 'translate', 'listen_type', 'listen_select', 'speech'];
    arcadeState.currentModeType = modeCycle[arcadeState.currentIndex % modeCycle.length];

    startSpeedBonusTimer();
    renderArcadeHud();
    updateRivalMeters();
    renderChallengePlayfield();
}

// =========================================================
// HUD & PLAYFIELD RENDERING
// =========================================================

export function renderArcadeHud() {
    const missionTitleEl = document.getElementById('arcadeHudMissionTitle');
    const questionCounterEl = document.getElementById('arcadeHudQuestionCounter');
    const progressBarEl = document.getElementById('arcadeHudProgressBar');
    const comboBadgeEl = document.getElementById('arcadeHudComboBadge');
    const scoreValEl = document.getElementById('arcadeHudScore');
    const xpValEl = document.getElementById('arcadeHudXP');

    if (missionTitleEl && arcadeState.currentMission) {
        missionTitleEl.textContent = `${arcadeState.currentMission.icon} ${arcadeState.currentMission.title}`;
    }

    if (questionCounterEl) {
        questionCounterEl.textContent = `${arcadeState.currentIndex + 1} / ${arcadeState.totalChallengesCount}`;
    }

    if (progressBarEl) {
        const percent = ((arcadeState.currentIndex) / arcadeState.totalChallengesCount) * 100;
        progressBarEl.style.width = `${percent}%`;
    }

    if (comboBadgeEl) {
        comboBadgeEl.className = `arcade-combo-badge combo-x${arcadeState.comboMultiplier}`;
        comboBadgeEl.innerHTML = `
            <span class="combo-flame">${arcadeState.comboMultiplier >= 4 ? '[MAX]' : '[COMBO]'}</span>
            <span class="combo-text">COMBO x${arcadeState.comboMultiplier}</span>
        `;
    }

    if (scoreValEl) scoreValEl.textContent = arcadeState.score.toLocaleString();
    if (xpValEl) xpValEl.textContent = `+${Math.round(arcadeState.score / 10)} XP`;
}

function renderChallengePlayfield() {
    const playfieldEl = document.getElementById('arcadeChallengeStage');
    const feedbackBoxEl = document.getElementById('arcadeFeedbackBox');
    if (!playfieldEl) return;

    if (feedbackBoxEl) {
        feedbackBoxEl.classList.add('hidden');
        feedbackBoxEl.className = 'arcade-feedback-box hidden';
    }

    const c = arcadeState.currentChallenge;
    const mode = arcadeState.currentModeType;

    let modeTitle = '';
    let modeInstruction = '';
    let playfieldHtml = '';

    // Automatically speak sentence in listening / speech modes
    if (mode === 'listen_type' || mode === 'listen_select' || mode === 'speech') {
        speakArcadeSentence(c.english, 0.88, true);
    }

    switch (mode) {
        case 'order':
            modeTitle = '[ORDENAR] Ordenar Palabras (Sentence Builder)';
            modeInstruction = 'Haz clic en las palabras para construir la oración en el orden correcto:';
            
            // Clean words and add distractors
            const rawWords = c.english.split(' ').map(w => w.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '').trim());
            const allWords = shuffle([...rawWords, ...(c.distractors || []).slice(0, 2)]);
            
            arcadeState.orderAvailableWords = allWords.map((w, i) => ({ id: `word-${i}`, text: w, used: false }));
            arcadeState.orderPlacedWords = [];

            playfieldHtml = `
                <div class="arcade-spanish-prompt">
                    <span class="prompt-flag">[ES] Contexto:</span>
                    <strong class="prompt-text">${c.spanish}</strong>
                </div>

                <div class="arcade-order-dropzone" id="arcadeOrderDropzone">
                    <div class="dropzone-placeholder" id="arcadeDropzonePlaceholder">Haz clic en las palabras de abajo para formar la frase...</div>
                </div>

                <div class="arcade-word-chips-bank" id="arcadeWordChipsBank"></div>

                <div class="arcade-actions-bar">
                    <button class="arcade-btn secondary" id="arcadeOrderResetBtn">Reiniciar palabras [Back]</button>
                    <button class="arcade-btn primary" id="arcadeOrderSubmitBtn">Comprobar Oración [Enter] &rarr;</button>
                </div>
            `;
            break;

        case 'cloze':
            modeTitle = '[COMPLETAR] Completar Espacios (Cloze Mastery)';
            modeInstruction = 'Selecciona la opción técnica o cotidiana que encaja en el espacio (usa teclas 1-4):';

            const clozeSentence = c.english.replace(new RegExp(`\\b${c.blankWord}\\b`, 'i'), '__________');
            const options = c.blankOptions ? shuffle(c.blankOptions) : shuffle([c.blankWord, ...(c.distractors || []).slice(0, 3)]);

            playfieldHtml = `
                <div class="arcade-spanish-prompt">
                    <span class="prompt-flag">[ES] Contexto:</span>
                    <strong class="prompt-text">${c.spanish}</strong>
                </div>

                <div class="arcade-cloze-sentence">
                    "${clozeSentence}"
                </div>

                <div class="arcade-cloze-options" id="arcadeClozeOptions">
                    ${options.map((opt, i) => `
                        <button class="arcade-option-pill" data-option="${opt}">
                            <div class="arcade-option-left">
                                <span class="pill-letter">${String.fromCharCode(65 + i)}</span>
                                <span class="pill-text">${opt}</span>
                            </div>
                            <span class="pill-key-shortcut">[${i + 1}]</span>
                        </button>
                    `).join('')}
                </div>
            `;
            break;

        case 'translate':
            modeTitle = '[TRADUCCION] Traducción Inversa Activa (Anti-Traducción)';
            modeInstruction = 'Escribe la frase completa en inglés según el contexto profesional:';

            playfieldHtml = `
                <div class="arcade-spanish-prompt large">
                    <span class="prompt-flag">[ES] Expresa en inglés:</span>
                    <strong class="prompt-text">"${c.spanish}"</strong>
                </div>

                <div class="arcade-input-container">
                    <input type="text" id="arcadeTranslateInput" class="arcade-large-input" placeholder="Escribe la frase en inglés aquí..." autocomplete="off" spellcheck="false">
                    <button class="arcade-btn primary" id="arcadeTranslateSubmitBtn">Comprobar [Enter] &rarr;</button>
                </div>

                <div class="arcade-hint-tools">
                    <button class="arcade-btn-hint" id="arcadeTranslateHintBtn">[PISTA] Dar una pista (1ª letra)</button>
                    <button class="arcade-btn-hint" id="arcadeListenAudioHintBtn">[AUDIO] Escuchar pronunciación [Espacio]</button>
                </div>
            `;
            break;

        case 'listen_type':
            modeTitle = '[DICTADO] Dictado Activo (Blind Listening)';
            modeInstruction = 'Escucha con atención y escribe exactamente lo que oyes:';

            playfieldHtml = `
                <div class="arcade-listening-audio-box">
                    <button class="arcade-audio-play-btn" id="arcadeDictPlayBtn" title="Escuchar a velocidad normal">
                        <span class="audio-icon">[AUDIO]</span>
                        <span>Escuchar Normal (1.0x) [Espacio]</span>
                    </button>
                    <button class="arcade-audio-play-btn secondary" id="arcadeDictSlowBtn" title="Escuchar en cámara lenta">
                        <span class="audio-icon">[LENTO]</span>
                        <span>Escuchar Lento (0.7x)</span>
                    </button>
                </div>

                <div class="arcade-input-container">
                    <input type="text" id="arcadeDictInput" class="arcade-large-input" placeholder="Escribe lo que escuchaste..." autocomplete="off">
                    <button class="arcade-btn primary" id="arcadeDictSubmitBtn">Comprobar Dictado [Enter] &rarr;</button>
                </div>
            `;
            break;

        case 'listen_select':
            modeTitle = '[DISCRIMINACION] Escucha y Selección (Discriminación Auditiva)';
            modeInstruction = 'Escucha el audio y elige la opción correcta sin trampas fonéticas (usa teclas 1-4):';

            const listenOptions = shuffle(c.audioDistractors || [c.english, c.english.replace('have', 'had')]);

            playfieldHtml = `
                <div class="arcade-listening-audio-box">
                    <button class="arcade-audio-play-btn large" id="arcadeListenSelectAudioBtn">
                        <span class="audio-icon">[AUDIO]</span>
                        <span>Repetir Audio [Espacio]</span>
                    </button>
                </div>

                <div class="arcade-listen-select-grid" id="arcadeListenSelectGrid">
                    ${listenOptions.map((opt, i) => `
                        <button class="arcade-listen-option-card" data-sentence="${opt.replace(/"/g, '&quot;')}">
                            <div class="arcade-option-left">
                                <span class="card-letter">${String.fromCharCode(65 + i)}</span>
                                <span class="card-text">${opt}</span>
                            </div>
                            <span class="pill-key-shortcut">[${i + 1}]</span>
                        </button>
                    `).join('')}
                </div>
            `;
            break;

        case 'speech':
            modeTitle = '[PRONUNCIACION] Pronunciación y Habla (Voz en Alto)';
            modeInstruction = 'Escucha el modelo nativo y repite la frase en voz alta con tu micrófono:';

            playfieldHtml = `
                <div class="arcade-speech-target-box">
                    <div class="speech-target-text" id="arcadeSpeechTargetText">"${c.english}"</div>
                    <div class="speech-phonetic-text">Fonética: [${c.phonetic}]</div>
                    <div class="speech-audio-actions">
                        <button class="arcade-audio-play-btn" id="arcadeSpeechModelAudioBtn">[AUDIO] Escuchar Modelo</button>
                    </div>
                </div>

                <div class="arcade-speech-interaction-zone">
                    <button class="arcade-mic-btn" id="arcadeMicBtn">
                        <span class="mic-icon">[MIC]</span>
                        <span class="mic-status-text" id="arcadeMicStatusText">Haz clic para hablar</span>
                    </button>
                    <div class="arcade-speech-visualizer hidden" id="arcadeSpeechVisualizer">
                        <span></span><span></span><span></span><span></span><span></span>
                    </div>
                </div>

                <div class="arcade-speech-result-box hidden" id="arcadeSpeechResultBox">
                    <div class="speech-detected-row">
                        <span>Detectado:</span>
                        <div class="speech-word-chips" id="arcadeSpeechDetectedChips"></div>
                    </div>
                    <div class="speech-score-bar" id="arcadeSpeechScoreBar">Precisión: <strong>0%</strong></div>
                </div>

                <div class="arcade-actions-bar" style="justify-content: center; margin-top: 15px;">
                    <button class="arcade-btn know hidden" id="arcadeSpeechContinueBtn">Continuar &rarr;</button>
                    <button class="arcade-btn secondary" id="arcadeSpeechSkipBtn">Omitir ejercicio de voz</button>
                </div>
            `;
            break;
    }

    playfieldEl.innerHTML = `
        <div class="arcade-challenge-header">
            <span class="arcade-mode-badge">${modeTitle}</span>
            <p class="arcade-mode-instruction">${modeInstruction}</p>
        </div>
        <div class="arcade-challenge-body">
            ${playfieldHtml}
        </div>
    `;

    bindPlayfieldEvents();
}

// =========================================================
// PLAYFIELD EVENT BINDING & EVALUATION
// =========================================================

function bindPlayfieldEvents() {
    const c = arcadeState.currentChallenge;
    const mode = arcadeState.currentModeType;

    if (mode === 'order') {
        renderOrderChips();

        document.getElementById('arcadeOrderResetBtn')?.addEventListener('click', () => {
            playClickSound();
            arcadeState.orderAvailableWords.forEach(w => w.used = false);
            arcadeState.orderPlacedWords = [];
            renderOrderChips();
        });

        document.getElementById('arcadeOrderSubmitBtn')?.addEventListener('click', () => {
            const builtSentence = arcadeState.orderPlacedWords.map(w => w.text).join(' ');
            evaluateSubmission(builtSentence);
        });
    }

    if (mode === 'cloze') {
        document.querySelectorAll('.arcade-option-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                playClickSound();
                const chosen = pill.dataset.option;
                evaluateSubmission(chosen, c.blankWord);
            });
        });
    }

    if (mode === 'translate') {
        const input = document.getElementById('arcadeTranslateInput');
        const submitBtn = document.getElementById('arcadeTranslateSubmitBtn');
        const hintBtn = document.getElementById('arcadeTranslateHintBtn');
        const audioHintBtn = document.getElementById('arcadeListenAudioHintBtn');

        input?.focus();
        submitBtn?.addEventListener('click', () => evaluateSubmission(input.value));
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') evaluateSubmission(input.value);
        });

        hintBtn?.addEventListener('click', () => {
            arcadeState.hintUsed = true;
            playClickSound();
            const words = c.english.split(' ');
            let revealed = '';
            arcadeState.revealedLettersCount = Math.min(words.length, (arcadeState.revealedLettersCount || 0) + 1);
            revealed = words.slice(0, arcadeState.revealedLettersCount).join(' ') + '...';
            if (input) input.placeholder = `Pista: ${revealed}`;
        });

        audioHintBtn?.addEventListener('click', () => {
            arcadeState.hintUsed = true;
            speakArcadeSentence(c.english, 0.8);
        });
    }

    if (mode === 'listen_type') {
        const input = document.getElementById('arcadeDictInput');
        const submitBtn = document.getElementById('arcadeDictSubmitBtn');
        const playBtn = document.getElementById('arcadeDictPlayBtn');
        const slowBtn = document.getElementById('arcadeDictSlowBtn');

        input?.focus();
        playBtn?.addEventListener('click', () => speakArcadeSentence(c.english, 1.0));
        slowBtn?.addEventListener('click', () => speakArcadeSentence(c.english, 0.65));

        submitBtn?.addEventListener('click', () => evaluateSubmission(input.value));
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') evaluateSubmission(input.value);
        });
    }

    if (mode === 'listen_select') {
        document.getElementById('arcadeListenSelectAudioBtn')?.addEventListener('click', () => {
            speakArcadeSentence(c.english, 0.9);
        });

        document.querySelectorAll('.arcade-listen-option-card').forEach(card => {
            card.addEventListener('click', () => {
                playClickSound();
                const chosen = card.dataset.sentence;
                evaluateSubmission(chosen, c.english);
            });
        });
    }

    if (mode === 'speech') {
        const micBtn = document.getElementById('arcadeMicBtn');
        const statusText = document.getElementById('arcadeMicStatusText');
        const modelAudioBtn = document.getElementById('arcadeSpeechModelAudioBtn');
        const visualizer = document.getElementById('arcadeSpeechVisualizer');
        const continueBtn = document.getElementById('arcadeSpeechContinueBtn');
        const skipBtn = document.getElementById('arcadeSpeechSkipBtn');

        modelAudioBtn?.addEventListener('click', () => speakArcadeSentence(c.english, 0.85));

        micBtn?.addEventListener('click', () => {
            toggleSpeechRecognition(micBtn, statusText, visualizer, continueBtn);
        });

        continueBtn?.addEventListener('click', () => {
            applyCorrectAnswer();
            showFeedback(true, '¡Excelente pronunciación y ritmo natural!');
        });

        skipBtn?.addEventListener('click', () => {
            showFeedback(true, 'Ejercicio de voz completado.');
        });
    }
}

// Word Order UI Chip Renderer
function renderOrderChips() {
    const dropzone = document.getElementById('arcadeOrderDropzone');
    const bank = document.getElementById('arcadeWordChipsBank');
    if (!dropzone || !bank) return;

    dropzone.innerHTML = '';
    bank.innerHTML = '';

    if (arcadeState.orderPlacedWords.length === 0) {
        dropzone.innerHTML = '<div class="dropzone-placeholder">Haz clic en las palabras de abajo para formar la frase...</div>';
    } else {
        arcadeState.orderPlacedWords.forEach((wordObj, idx) => {
            const chip = document.createElement('button');
            chip.className = 'arcade-word-chip placed';
            chip.textContent = wordObj.text;
            chip.addEventListener('click', () => {
                playClickSound();
                arcadeState.orderPlacedWords.splice(idx, 1);
                const found = arcadeState.orderAvailableWords.find(w => w.id === wordObj.id);
                if (found) found.used = false;
                renderOrderChips();
            });
            dropzone.appendChild(chip);
        });
    }

    arcadeState.orderAvailableWords.forEach((wordObj) => {
        const chip = document.createElement('button');
        chip.className = `arcade-word-chip ${wordObj.used ? 'used' : ''}`;
        chip.textContent = wordObj.text;
        chip.disabled = wordObj.used;
        chip.addEventListener('click', () => {
            playClickSound();
            wordObj.used = true;
            arcadeState.orderPlacedWords.push(wordObj);
            renderOrderChips();
        });
        bank.appendChild(chip);
    });
}

// =========================================================
// SPEECH RECOGNITION (NATIVE BROWSER WEBSPEECH API)
// =========================================================

function toggleSpeechRecognition(micBtn, statusText, visualizer, continueBtn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('Tu navegador no soporta Speech Recognition nativo. Usa Chrome, Edge o Safari para esta función.');
        if (continueBtn) continueBtn.classList.remove('hidden');
        return;
    }

    if (arcadeState.isRecording) {
        if (arcadeState.speechRecognitionInstance) {
            arcadeState.speechRecognitionInstance.stop();
        }
        arcadeState.isRecording = false;
        micBtn.classList.remove('recording');
        visualizer.classList.add('hidden');
        statusText.textContent = 'Haz clic para hablar';
        return;
    }

    try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            arcadeState.isRecording = true;
            micBtn.classList.add('recording');
            visualizer.classList.remove('hidden');
            statusText.textContent = '[GRABANDO] Escuchando... ¡Habla ahora!';
        };

        recognition.onresult = (event) => {
            const spokenText = event.results[0][0].transcript;
            evaluateSpeechAccuracy(spokenText, continueBtn);
        };

        recognition.onerror = (event) => {
            console.warn('Speech recognition error:', event.error);
            statusText.textContent = 'Error al captar audio. Vuelve a intentar.';
            arcadeState.isRecording = false;
            micBtn.classList.remove('recording');
            visualizer.classList.add('hidden');
        };

        recognition.onend = () => {
            arcadeState.isRecording = false;
            micBtn.classList.remove('recording');
            visualizer.classList.add('hidden');
        };

        arcadeState.speechRecognitionInstance = recognition;
        recognition.start();
    } catch (e) {
        console.error('Error starting speech recognition:', e);
    }
}

function evaluateSpeechAccuracy(spokenText, continueBtn) {
    const target = arcadeState.currentChallenge.english;
    const targetWords = normalizeText(target).split(' ');
    const spokenWords = normalizeText(spokenText).split(' ');

    const resultBox = document.getElementById('arcadeSpeechResultBox');
    const chipsContainer = document.getElementById('arcadeSpeechDetectedChips');
    const scoreBar = document.getElementById('arcadeSpeechScoreBar');

    if (!resultBox || !chipsContainer) return;
    resultBox.classList.remove('hidden');
    chipsContainer.innerHTML = '';

    let matchedCount = 0;
    targetWords.forEach(tWord => {
        const chip = document.createElement('span');
        const isMatched = spokenWords.includes(tWord);
        if (isMatched) {
            matchedCount++;
            chip.className = 'speech-chip match';
            chip.textContent = tWord;
        } else {
            chip.className = 'speech-chip miss';
            chip.textContent = tWord;
        }
        chipsContainer.appendChild(chip);
    });

    const accuracy = Math.round((matchedCount / targetWords.length) * 100);
    scoreBar.innerHTML = `Precisión: <strong>${accuracy}%</strong> (${matchedCount}/${targetWords.length} palabras detectadas)`;

    if (accuracy >= 70) {
        if (continueBtn) {
            continueBtn.classList.remove('hidden');
            continueBtn.focus();
        }
    } else {
        const statusText = document.getElementById('arcadeMicStatusText');
        if (statusText) statusText.textContent = 'Prueba repetir una vez más para afinar la pronunciación.';
    }
}

// =========================================================
// EVALUATION & FEEDBACK RENDERING
// =========================================================

function evaluateSubmission(userText, targetOverride = null) {
    const c = arcadeState.currentChallenge;
    const target = targetOverride || c.english;
    const isCorrect = isFlexibleMatch(userText, target);

    if (isCorrect) {
        applyCorrectAnswer();
        speakArcadeSentence(c.english, 0.95, true);
        showFeedback(true, `¡Excelente! Dominio perfecto.`);
    } else {
        applyIncorrectAnswer();
        showFeedback(false, `Respuesta correcta: "${c.english}"`);
    }
}

function showFeedback(isSuccess, message) {
    const feedbackBox = document.getElementById('arcadeFeedbackBox');
    if (!feedbackBox) return;

    const c = arcadeState.currentChallenge;
    feedbackBox.className = `arcade-feedback-box ${isSuccess ? 'success' : 'error'}`;
    feedbackBox.classList.remove('hidden');

    feedbackBox.innerHTML = `
        <div class="feedback-icon-row">
            <span class="feedback-status-badge">${isSuccess ? '[CORRECTO]' : '[ATENCION]'}</span>
            <span class="feedback-msg">${message}</span>
        </div>
        ${c.grammarTip ? `
            <div class="feedback-cognitive-tip">
                <strong>[TIP] Tip Cognitivo / Anti-Traducción:</strong>
                <p>${c.grammarTip}</p>
            </div>
        ` : ''}
        <div class="feedback-action-row">
            <button class="arcade-btn know" id="arcadeFeedbackNextBtn">Continuar [Enter] &rarr;</button>
        </div>
    `;

    const nextBtn = document.getElementById('arcadeFeedbackNextBtn');
    nextBtn?.focus();
    nextBtn?.addEventListener('click', () => {
        playClickSound();
        arcadeState.currentIndex++;
        loadNextChallenge();
    });
}

// =========================================================
// MISSION RESULTS SCREEN
// =========================================================

function showMissionResults() {
    speechPlayer.stop();
    recordTrainingAction('arcade', undefined, arcadeState.currentMission?.id);
    stopGhostRivalRace();
    stopSpeedBonusTimer();
    playVictorySound();
    document.getElementById('arcadePlayView')?.classList.add('hidden');
    const resultsView = document.getElementById('arcadeResultsView');
    if (!resultsView) return;
    resultsView.classList.remove('hidden');

    const accuracy = Math.round((arcadeState.sessionCorrectCount / arcadeState.totalChallengesCount) * 100) || 0;
    const gainedXp = Math.round(arcadeState.score / 10);
    const mistakesCount = arcadeState.sessionMistakes.length;
    const lvlInfo = calculateLevel(arcadeState.xp);
    const rivalBeat = arcadeState.ghostRivalProgress < 100 || accuracy >= 80;

    updateMascotReaction('victory', `[COMPLETADA] ¡Misión Completada! Precisión del ${accuracy}%`);

    resultsView.innerHTML = `
        <div class="arcade-results-card">
            <div class="results-header-banner">
                <span class="results-trophy">[COMPLETADO]</span>
                <h2>¡Misión Completada con Éxito!</h2>
                <p>${arcadeState.currentMission.title}</p>
                <div style="margin-top: 10px;">
                    <span class="results-rival-outcome">${rivalBeat ? `[VICTORIA EN DUELO] Has superado a ${arcadeState.ghostRivalName}` : `[DUELO CONCLUIDO] Gran rendimiento contra ${arcadeState.ghostRivalName}`}</span>
                </div>
            </div>

            <div class="results-stats-grid">
                <div class="results-stat-box">
                    <span class="stat-num">${arcadeState.score.toLocaleString()}</span>
                    <span class="stat-lbl">Puntos Obtenidos</span>
                </div>
                <div class="results-stat-box">
                    <span class="stat-num">+${gainedXp} XP</span>
                    <span class="stat-lbl">Experiencia</span>
                </div>
                <div class="results-stat-box">
                    <span class="stat-num">${lvlInfo.division}</span>
                    <span class="stat-lbl">${lvlInfo.percentile}</span>
                </div>
                <div class="results-stat-box highlight">
                    <span class="stat-num">${accuracy}%</span>
                    <span class="stat-lbl">Precisión Total</span>
                </div>
            </div>

            <div class="results-actions-shelf">
                ${mistakesCount > 0 ? `
                    <button class="arcade-btn loop-btn large" id="arcadeDrillMistakesBtn">
                        [REPASO] Repasar ${mistakesCount} ${mistakesCount === 1 ? 'Error' : 'Errores'} de Esta Partida
                    </button>
                ` : `
                    <div class="flawless-badge">[PERFECTO] ¡Partida Perfecta! Sin errores cometidos.</div>
                `}
                <div class="results-secondary-actions">
                    <button class="arcade-btn primary" id="arcadeNextMissionBtn">Siguiente Misión &rarr;</button>
                    <button class="arcade-btn secondary" id="arcadeRetryMissionBtn">Reintentar para Récord</button>
                    <button class="arcade-btn outline" id="arcadeBackToHubBtn">Volver al Menú</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('arcadeDrillMistakesBtn')?.addEventListener('click', () => {
        startMission('mistakes-loop');
    });

    document.getElementById('arcadeRetryMissionBtn')?.addEventListener('click', () => {
        startMission(arcadeState.currentMission.id);
    });

    document.getElementById('arcadeNextMissionBtn')?.addEventListener('click', () => {
        const allMissions = ARCADE_MISSIONS;
        const currentIdx = allMissions.findIndex(m => m.id === arcadeState.currentMission.id);
        const nextMission = allMissions[(currentIdx + 1) % allMissions.length];
        startMission(nextMission.id);
    });

    document.getElementById('arcadeBackToHubBtn')?.addEventListener('click', () => {
        showArcadeHub();
    });
}

export function showArcadeHub() {
    speechPlayer.stop();
    arcadeState.active = false;
    stopGhostRivalRace();
    stopSpeedBonusTimer();

    document.getElementById('arcadePlayView')?.classList.add('hidden');
    document.getElementById('arcadeResultsView')?.classList.add('hidden');
    const hubView = document.getElementById('arcadeHubView');
    if (!hubView) return;
    hubView.classList.remove('hidden');

    renderArcadeHubOverview();
    renderTopHeroBanner();
}

export function renderArcadeHubOverview() {
    loadArcadeUserData();

    const streakCountEl = document.getElementById('arcadeHubStreakCount');
    const xpTotalEl = document.getElementById('arcadeHubXpTotal');
    const levelTitleEl = document.getElementById('arcadeHubLevelTitle');
    const dailyGoalProgressEl = document.getElementById('arcadeHubDailyGoalProgress');
    const dailyGoalBarEl = document.getElementById('arcadeHubDailyGoalBar');
    const mistakesBadgeCountEl = document.getElementById('arcadeHubMistakesCount');
    const missionsGridEl = document.getElementById('arcadeMissionsGrid');

    if (streakCountEl) streakCountEl.textContent = `${arcadeState.dailyStreak} Días`;
    if (xpTotalEl) xpTotalEl.textContent = `${arcadeState.xp.toLocaleString()} XP`;
    if (levelTitleEl) levelTitleEl.textContent = arcadeState.levelTitle;

    if (dailyGoalProgressEl && dailyGoalBarEl) {
        const goalPercent = Math.min(100, Math.round((arcadeState.dailyPoints / arcadeState.dailyTarget) * 100));
        dailyGoalProgressEl.textContent = `${arcadeState.dailyPoints} / ${arcadeState.dailyTarget} pts`;
        dailyGoalBarEl.style.width = `${goalPercent}%`;
    }

    if (mistakesBadgeCountEl) {
        mistakesBadgeCountEl.textContent = `${arcadeState.mistakesQueue.length}`;
    }

    if (missionsGridEl) {
        missionsGridEl.innerHTML = ARCADE_MISSIONS.map(m => `
            <div class="arcade-mission-card" data-mission-id="${m.id}">
                <div class="mission-card-top">
                    <span class="mission-icon">${m.icon}</span>
                    <span class="mission-level-pill">${m.level}</span>
                </div>
                <h3 class="mission-title">${m.title}</h3>
                <p class="mission-desc">${m.description}</p>
                <div class="mission-card-bottom">
                    <span class="mission-time">[TIEMPO] ~${m.estimatedMinutes} min</span>
                    <button class="arcade-launch-btn">Jugar Partida &rarr;</button>
                </div>
            </div>
        `).join('');

        missionsGridEl.querySelectorAll('.arcade-mission-card').forEach(card => {
            card.addEventListener('click', () => {
                playClickSound();
                startMission(card.dataset.missionId);
            });
        });
    }

    document.getElementById('arcadeHubMistakesDrillBtn')?.addEventListener('click', () => {
        playClickSound();
        startMission('mistakes-loop');
    });

    document.getElementById('arcadeSoundToggleBtn')?.addEventListener('click', () => {
        const isMuted = toggleSoundMute();
        const icon = document.getElementById('arcadeSoundToggleIcon');
        if (icon) icon.textContent = isMuted ? '[MUTE]' : '[AUDIO]';
    });
}
