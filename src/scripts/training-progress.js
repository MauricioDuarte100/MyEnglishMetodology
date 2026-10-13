export function localDay(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function readStored(key, fallback = {}) {
    try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return value && typeof value === 'object' ? value : fallback; } catch { return fallback; }
}

export function getTrainingProgress() {
    const saved = readStored('vocabTraining');
    const today = saved.today?.date === localDay() ? saved.today : {};
    return { answers: Math.max(0, Number(saved.answers) || 0), correct: Math.max(0, Number(saved.correct) || 0), bestCombo: Math.max(0, Number(saved.bestCombo) || 0), combo: Math.max(0, Number(saved.combo) || 0),
        today: { date: localDay(), correctKeys: Array.isArray(today.correctKeys) ? today.correctKeys : [], actions: today.actions && typeof today.actions === 'object' ? today.actions : {} } };
}

export function getArenaLevel(xp) {
    const levels = [
        { title: 'Cadete', min: 0, max: 500 }, { title: 'Especialista', min: 500, max: 1500 },
        { title: 'Elite', min: 1500, max: 3500 }, { title: 'Maestro', min: 3500, max: 7000 },
        { title: 'Challenger', min: 7000, max: 15000 },
    ];
    const index = Math.max(0, levels.findLastIndex(level => xp >= level.min));
    const level = levels[index];
    return { level: index + 1, title: level.title, division: `División ${['I', 'II', 'III', 'IV', 'V'][index]}`, percentile: 'Progresión personal', nextXp: level.max, prevXp: level.min };
}

export function recordTrainingAction(mode, correct, key) {
    const progress = getTrainingProgress();
    progress.today.actions[mode] = (progress.today.actions[mode] || 0) + 1;
    // Flashcards are self-assessment; precision measures checked answers only.
    if (mode !== 'flashcard' && typeof correct === 'boolean') {
        progress.answers++;
        if (correct) {
            progress.correct++;
            progress.combo++;
            progress.bestCombo = Math.max(progress.bestCombo, progress.combo);
            if (!progress.today.correctKeys.includes(key)) progress.today.correctKeys.push(key);
        } else progress.combo = 0;
    }
    try { localStorage.setItem('vocabTraining', JSON.stringify(progress)); } catch {}
    document.dispatchEvent(new CustomEvent('vocab:training', { detail: { progress, mode, correct } }));
    return progress;
}

export function normalizeAnswer(value) {
    return String(value || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[.,!?;:"“”]/g, '').replace(/\s+/g, ' ').trim();
}

export function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

export const phaseTargets = { flashcard: 10, quiz: 8, listening: 3, arcade: 1, typing: 8, scenario: 1, rsvp: 3, matching: 4, reading: 1 };
