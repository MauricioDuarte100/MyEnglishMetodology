import { learningTracks, exerciseHref } from '../data/navigation.js';
import { readStored, getTrainingProgress, getArenaLevel, phaseTargets } from './training-progress.js';

const text = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = String(value); };
const saved = readStored('vocabLastPractice');
const guided = readStored('vocabGuidedSession');
const trackSelect = document.getElementById('trainingTrackSelect');
if (trackSelect) trackSelect.value = learningTracks.find(track => track.id === (guided.track || saved.track))?.id || 'basic';

function renderCoach() {
    const track = learningTracks.find(track => track.id === trackSelect?.value) || learningTracks[0];
    const resuming = guided.track === track.id && Number.isInteger(guided.phase) && guided.phase >= 0 && guided.phase < 3;
    const phase = resuming ? guided.phase : 0;
    const steps = track.exercises.slice(0, 3);
    const current = steps[phase];
    text('coachTitle', `${resuming ? 'Retoma' : 'Comienza'}: ${current.title}`);
    text('coachDescription', current.description);
    text('coachPhase', `Fase ${phase + 1} de 3 · ${track.title}`);
    const list = document.getElementById('coachSteps');
    list?.replaceChildren(...steps.map((exercise, index) => {
        const item = document.createElement('li');
        item.className = index === phase ? 'current' : index < phase ? 'visited' : '';
        const number = document.createElement('span'); number.className = 'coach-step-number'; number.textContent = String(index + 1).padStart(2, '0');
        const detail = document.createElement('div');
        const title = document.createElement('strong'); title.textContent = exercise.title;
        const hint = document.createElement('small'); hint.textContent = `Bloque sugerido · ${phaseTargets[exercise.mode]} ${exercise.mode === 'flashcard' ? 'tarjetas' : exercise.mode === 'arcade' ? 'misión' : 'acciones'}`;
        detail.append(title, hint);
        const status = document.createElement('small'); status.textContent = index === phase ? 'SIGUIENTE PASO' : index < phase ? 'RECORRIDO' : 'DESPUÉS';
        item.append(number, detail, status); return item;
    }));
    const link = document.getElementById('startGuidedSprint');
    if (link) {
        const category = resuming && ['advanced', 'twisters', 'loop', 'review'].includes(guided.category) ? `&category=${encodeURIComponent(guided.category)}` : '';
        link.href = exerciseHref(track, current) + '?guided=1' + category;
        link.textContent = resuming ? 'Retomar sprint →' : 'Comenzar sprint guiado →';
    }
}

function renderMetrics() {
    const progress = getTrainingProgress();
    let xp = 0;
    try { xp = Math.max(0, Number(localStorage.getItem('arcade_xp')) || 0); } catch {}
    const level = getArenaLevel(xp);
    text('dashboardXP', `${xp.toLocaleString()} XP`);
    text('dashboardLevel', level.title);
    text('dashboardAccuracy', progress.answers ? `${Math.round(progress.correct / progress.answers * 100)}%` : '—');
    text('dashboardAnswers', `${progress.answers} ${progress.answers === 1 ? 'respuesta verificada' : 'respuestas verificadas'}`);
    text('dashboardCombo', `x${progress.bestCombo}`);
    const srs = readStored('vocabSRS');
    text('dashboardDue', Object.values(srs).filter(card => card.nextReview <= Date.now()).length);
    const failures = readStored('vocabFailures');
    text('dashboardErrors', `${Object.values(failures).filter(count => count >= 2).length} palabras para reforzar`);
    const correctToday = progress.today.correctKeys.length;
    text('dailyCorrect', `${correctToday} / 20`);
    text('dailyGoalMessage', correctToday >= 20 ? 'Meta alcanzada. Refuerza los errores o busca tu siguiente combo.' : `Te faltan ${20 - correctToday} aciertos en expresiones diferentes. Repetir la misma no duplica la meta.`);
    const meter = document.getElementById('dailyGoalMeter');
    if (meter) meter.value = Math.min(20, correctToday);
    const leagueMeter = document.getElementById('arenaLevelMeter');
    if (leagueMeter) leagueMeter.value = Math.min(100, Math.round((xp - level.prevXp) / (level.nextXp - level.prevXp) * 100));
    text('arenaNextLevel', `${Math.max(0, level.nextXp - xp)} XP para el siguiente objetivo`);
}

trackSelect?.addEventListener('change', renderCoach);
renderCoach();
renderMetrics();
