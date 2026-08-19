# MyEnglishMetodology

Plataforma interactiva de aprendizaje intensivo de inglés, basada en principios de ciencia cognitiva y la metodología de [English Level Up Tips](https://github.com/byoungd/English-level-up-tips) de byoungd.

## Filosofía de Aprendizaje

> "Consistencia > Intensidad. El 75% del inglés diario se compone de las primeras 1000 palabras."

La plataforma combina:
- **Repetición espaciada real (SRS)**: Curva de Ebbinghaus (5min, 30min, 12h, 1d, 2d, 4d, 7d, 15d).
- **Loop de Refuerzo de Errores**: Detección automática y práctica aislada de términos fallados 2+ veces.
- **Producción activa sobre consumo pasivo** (Pirámide de Aprendizaje de Edgar Dale).
- **Vocabulario contextualizado**: Pronunciación fonética adaptada para hispanohablantes y ejemplos de la vida real.
- **IA como entrenador situacional**: Diálogos con audio y escenarios laborales reales (IT, Daily Standup, Entrevistas, Slang).

---

## 🎯 Módulos de Práctica

### 📇 1. Tarjetas (Flashcards)
Sistema de tarjetas con animación 3D, atajos de teclado (`Espacio` girar, `←/→` navegar, `1` repasar, `2` dominado, `A` audio), nivel SRS dinámico, hooks mentales mnemotécnicos y temporizador de estudio.

### 🧠 2. Quiz Activo
Evaluación rápida con opciones contextuales, discriminadores inteligentes, pronunciación auditiva y corrección inmediata.

### ✍️ 3. Escribir (Active Typing)
Práctica de escritura exacta con pistas progresivas letra por letra ("💡 Dar una Pista"), contador de letras y síntesis de voz de la oración completa.

### 📝 4. Completar (Fill in the Blanks)
Ejercicios tipo *Cloze* en oraciones con audio integrado por línea y retroalimentación en tiempo real.

### 🎯 5. Parejas (Matching)
Cuadrícula interactiva de 4 parejas (8 cartas) para fijar asociaciones rápidas entre el inglés y su concepto en español.

### 🎧 6. Dictado (Listening & Writing)
Entrenamiento de oído nativo con velocidades graduables (0.6x lenta, 0.8x normal, 1.0x rápida, 1.2x nativa), comparador de diferencias y repetición asistida.

### 📖 7. Lectura e Inmersión con IA
Generador de diálogos situacionales en inglés americano real con pronunciación fonética para hispanohablantes, reproducción de audio continua o por frase, y definiciones interactivas al hacer clic en palabras difíciles.

---

## 🧭 Páginas de Apoyo

- **📚 Metodología (`/methodology`)**: Principios cognitivos, pirámide de aprendizaje, niveles CEFR y plan semanal de estudio.
- **🗣️ Pronunciación (`/pronunciation`)**: Tabla fonética interactiva con audio, pares mínimos y reglas de habla conectada (*linking*, *flapping T*, *reductions*).
- **🔗 Recursos (`/resources`)**: Curaduría de canales de YouTube, podcasts, series y lecturas recomendadas por nivel.
- **🤖 IA Coach (`/ai-coach`)**: Prompts optimizados para configurar ChatGPT / Claude / Gemini como entrenadores personales.

---

## 📊 Datasets Incluidos

| Archivo | Categoría | Contenido |
|---------|-----------|-----------|
| `core-1000.js` | **1K** | Las 1000 palabras más usadas (75% del inglés diario) |
| `advanced-1000.js` | **2K** | Siguientes 1000 palabras para fluidez y precisión B2 |
| `technical.js` | **Tech & Biz** | Vocabulario de IT, Ciberseguridad, Data Analytics, Negocios y Finanzas |
| `urban-slang.js` | **Slang USA** | Contracciones cotidianas (*gonna, wanna, ain't, finna*) y modismos urbanos |
| `tongue-twisters.js` | **Twisters** | Trabalenguas y rimas para entrenar dicción, ritmo y *flow* |
| `spaced-repetition.ts` | **SRS Engine** | Algoritmo de intervalos de Ebbinghaus y estimación de niveles CEFR |
| `learning-methodology.ts` | **Framework** | Principios, loops de 4 pasos y planes semanales |

---

## 🚀 Instalación y Uso

```bash
git clone <repo>
npm install  # o bun install
cp .env.example .env  # Agrega tus claves de Gemini u OpenRouter (opcional para IA Reading)
npm run dev
```

---

## ⚙️ Variables de Entorno

```env
GEMINI_API_KEY=tu_clave_gemini
GEMINI_API_KEY_BACKUP=clave_backup
OPENROUTER_API_KEY=tu_clave_openrouter
```
