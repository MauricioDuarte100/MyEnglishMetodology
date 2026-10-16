import assert from 'node:assert/strict';
import { learningTracks, libraryPages, exerciseHref } from '../src/data/navigation.js';

const origin = process.env.CHECK_ORIGIN || 'http://localhost:4321';
const paths = ['/', '/practica', '/biblioteca', '/progreso',
  ...learningTracks.flatMap(track => [`/practica/${track.slug}`, ...track.exercises.map(exercise => exerciseHref(track, exercise))]),
  ...libraryPages.map(page => `/biblioteca/${page.slug}`),
];
const responses = await Promise.all(paths.map(async path => {
  const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(10000) });
  assert.equal(response.status, 200, `${path}: respuesta HTTP`);
  const html = await response.text();
  assert.match(html, /<h1\b/, `${path}: falta el título de la pantalla`);
  assert.match(html, /aria-label="Navegación principal"/, `${path}: falta la navegación compartida`);
  assert.equal((html.match(/<main\b/g) || []).length, 1, `${path}: debe existir un único contenido principal`);
  if (path.startsWith('/biblioteca/')) assert.match(html, /aria-label="Secciones de biblioteca"/);
  if (path.startsWith('/practica/') && path.split('/').length === 4) {
    assert.match(html, /id="practiceWorkspace"/);
    assert.match(html, /id="exerciseTitle"/);
  }
  return { path, html };
}));

// Discover actual internal destinations and catch stale links after reorganizing.
const internalPaths = new Set(responses.flatMap(({ html }) => [...html.matchAll(/href="(\/(?!\/)[^"]*)"/g)]
  .map(match => new URL(match[1].replaceAll('&amp;', '&'), origin).pathname)));
for (const path of internalPaths) {
  if (paths.includes(path)) continue;
  const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(10000) });
  assert.equal(response.status, 200, `Enlace interno roto: ${path}`);
}

const redirects = { '/methodology': '/biblioteca/metodologia', '/pronunciation': '/biblioteca/pronunciacion', '/resources': '/biblioteca/recursos', '/ai-coach': '/biblioteca/coach-ia' };
for (const [old, target] of Object.entries(redirects)) {
  const response = await fetch(new URL(old, origin), { redirect: 'manual' });
  assert.equal(response.status, 301, `${old}: preservar el enlace anterior`);
  assert.equal(response.headers.get('location'), target);
}
for (const invalid of ['/practica/no-existe', '/practica/fundamentos/no-existe']) {
  assert.equal((await fetch(new URL(invalid, origin))).status, 404, `${invalid}: ruta desconocida`);
}
console.log(`${paths.length} páginas, ${internalPaths.size} destinos internos y 4 redirecciones verificados. Rutas desconocidas: 404.`);
for (const body of [{ text: 123 }, { text: '' }, { text: '***' }, { text: 'hello', voice: 'invalid' }, { text: 'hello', rate: '+99%' }, { text: 'hello', rate: 1 }, { text: 'hello', provider: 'gemini' }, { text: 'a'.repeat(2501) }]) {
  const response = await fetch(new URL('/api/tts', origin), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  assert.equal(response.status, 400, 'La API de pronunciación debe rechazar parámetros inválidos');
}
console.log('Pronunciación: 8 casos de entrada inválida rechazados correctamente.');
