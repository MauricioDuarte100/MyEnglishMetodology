export const learningTracks = [
  { slug: 'fundamentos', id: 'basic', title: 'Fundamentos', tag: '01 · CONSTRUIR UNA BASE', description: 'Aprende vocabulario cotidiano y consolida lo que sabes, a tu ritmo.', category: 'core', duration: '15 min', start: 'tarjetas', exercises: [
    { slug: 'tarjetas', mode: 'flashcard', title: 'Tarjetas', description: 'Descubre palabras, escucha cómo suenan y repasa su significado.' },
    { slug: 'quiz', mode: 'quiz', title: 'Quiz', description: 'Comprueba lo aprendido con preguntas de opción múltiple.' },
    { slug: 'dictado', mode: 'listening', title: 'Dictado', description: 'Entrena el oído escribiendo lo que escuchas.' },
    { slug: 'gramatica', mode: 'grammar', title: 'Gramática', description: 'Entiende el pasado y el perfecto con ejemplos en contexto.' },
  ] },
  { slug: 'profesional', id: 'intensive', title: 'Inglés profesional', tag: '02 · LLEVARLO AL TRABAJO', description: 'Practica inglés técnico y toma decisiones en situaciones de trabajo.', category: 'technical', duration: '10 min', start: 'arena', exercises: [
    { slug: 'arena', mode: 'arcade', title: 'Arena', description: 'Resuelve misiones cortas y desafíos contra reloj.' },
    { slug: 'escribir', mode: 'typing', title: 'Escribir', description: 'Produce vocabulario técnico con pistas cuando las necesites.' },
    { slug: 'simulador', mode: 'scenario', title: 'Simulador', description: 'Responde a escenarios profesionales paso a paso.' },
    { slug: 'completar', mode: 'fillblanks', title: 'Completar', description: 'Usa las palabras correctas dentro de una oración.' },
  ] },
  { slug: 'inmersion', id: 'chill', title: 'Inmersión', tag: '03 · GANAR FLUIDEZ', description: 'Conecta palabras, sigue el ritmo de una lectura y explora diálogos reales.', category: 'slang', duration: '10 min', start: 'lectura', exercises: [
    { slug: 'lectura', mode: 'rsvp', title: 'Lectura fluida', description: 'Lee grupos de palabras a una velocidad que puedas seguir.' },
    { slug: 'parejas', mode: 'matching', title: 'Parejas', description: 'Relaciona palabras y significados sin presión.' },
    { slug: 'dialogos', mode: 'reading', title: 'Diálogos con IA', description: 'Genera conversaciones según tu nivel y el tema que quieras practicar.' },
  ] },
];

export const libraryPages = [
  { slug: 'metodologia', title: 'Metodología', description: 'Organiza tu rutina y entiende cómo estudiar con repetición espaciada.' },
  { slug: 'pronunciacion', title: 'Pronunciación', description: 'Escucha sonidos, compara pares de palabras y practica el habla conectada.' },
  { slug: 'recursos', title: 'Recursos', description: 'Encuentra materiales de escucha, lectura y vocabulario por nivel.' },
  { slug: 'coach-ia', title: 'Coach de IA', description: 'Usa prompts preparados para practicar con tu asistente favorito.' },
];

export function exerciseHref(track, exercise) {
  return `/practica/${track.slug}/${exercise.slug}`;
}
