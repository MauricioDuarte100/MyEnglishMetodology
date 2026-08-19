import { VERBS_MASTER_500, type VerbEntry } from './verbs-master-500.ts';

export interface LatinTenseComparison {
    id: string;
    tenseType: "past-simple" | "present-perfect" | "present-perfect-continuous" | "past-perfect" | "past-perfect-continuous" | "contrast";
    category: "it-tech" | "everyday";
    english: string;
    phonetic: string;
    spanishNeutral: string;
    latinTrap: string;
    cognitiveRule: string;
    keyVerb: {
        base: string;
        past: string;
        pastParticiple: string;
        gerund?: string;
        edPronunciation?: "/t/" | "/d/" | "/id/" | "irregular";
        phoneticPast: string;
    };
}

export const INITIAL_CONTRAST_CASES: LatinTenseComparison[] = [
    {
        id: "pp-1",
        tenseType: "contrast",
        category: "everyday",
        english: "I have worked here for three years.",
        phonetic: "[aiv wórkt jír for zrí yírs]",
        spanishNeutral: "Trabajo aquí hace tres años / Llevo tres años trabajando aquí.",
        latinTrap: "Decir 'I work here since three years' o 'I worked here three years' (que significaría que ya no trabajas ahí).",
        cognitiveRule: "Si la acción empezó en el pasado y SIGUE ocurriendo hoy, el inglés exige Present Perfect (have + past participle).",
        keyVerb: {
            base: "work",
            past: "worked",
            pastParticiple: "worked",
            gerund: "working",
            edPronunciation: "/t/",
            phoneticPast: "[wórkt] (termina en sonido T seco, no digas 'uorked')"
        }
    },
    {
        id: "pp-2",
        tenseType: "contrast",
        category: "everyday",
        english: "I worked there for three years, but I quit last month.",
        phonetic: "[ai wórkt dér for zrí yírs, bat ai kuít last mánz]",
        spanishNeutral: "Trabajé allá tres años, pero renuncié el mes pasado.",
        latinTrap: "Usar Present Perfect cuando la acción ya terminó definitivamente en el pasado.",
        cognitiveRule: "Si la acción terminó por completo y el período de tiempo está cerrado, se usa Past Simple.",
        keyVerb: {
            base: "work",
            past: "worked",
            pastParticiple: "worked",
            gerund: "working",
            edPronunciation: "/t/",
            phoneticPast: "[wórkt]"
        }
    },
    {
        id: "pp-3",
        tenseType: "present-perfect",
        category: "it-tech",
        english: "I have already sent the security report to the CTO.",
        phonetic: "[aiv ol-RÉ-di sént de se-KÍU-ri-ti ri-PÓRT tu de si-ti-óu]",
        spanishNeutral: "Ya envié el reporte de seguridad al CTO / Ya mandé el informe.",
        latinTrap: "Traducir 'Ya envié' literalmente como 'Already I sent'.",
        cognitiveRule: "En inglés profesional, un hecho reciente con impacto en el presente usa 'have already + participio'.",
        keyVerb: {
            base: "send",
            past: "sent",
            pastParticiple: "sent",
            gerund: "sending",
            phoneticPast: "[sént]"
        }
    },
    {
        id: "pp-4",
        tenseType: "present-perfect-continuous",
        category: "it-tech",
        english: "I have been debugging this memory leak since morning.",
        phonetic: "[aiv bin di-BÁ-guing dis MÉ-mo-ri lik sins MÓR-ning]",
        spanishNeutral: "Llevo depurando esta fuga de memoria desde la mañana / Estoy desde la mañana con este bug.",
        latinTrap: "Decir 'I debug since morning' o 'I am debugging since morning' (error común de traducción literal del español).",
        cognitiveRule: "Para enfatizar la DURACIÓN continua de una acción que sigue activa en el momento presente, se usa 'have been + gerundio (-ing)'.",
        keyVerb: {
            base: "debug",
            past: "debugged",
            pastParticiple: "debugged",
            gerund: "debugging",
            edPronunciation: "/d/",
            phoneticPast: "[di-BÁGD]"
        }
    },
    {
        id: "pp-5",
        tenseType: "past-perfect",
        category: "it-tech",
        english: "When the server crashed, we had already backed up the database.",
        phonetic: "[wen de SÉR-ver krasht, wi jad ol-RÉ-di bakt áp de DÉI-ta-beis]",
        spanishNeutral: "Cuando el servidor se cayó, ya habíamos hecho una copia de seguridad de la base de datos.",
        latinTrap: "Usar pasado simple para las dos acciones ('When the server crashed, we backed up...') perdiendo el orden cronológico.",
        cognitiveRule: "Past Perfect (had + participio) se usa para la acción que ocurrió ANTES de otra acción pasada ('el pasado del pasado').",
        keyVerb: {
            base: "backup",
            past: "backed up",
            pastParticiple: "backed up",
            gerund: "backing up",
            edPronunciation: "/t/",
            phoneticPast: "[bakt áp]"
        }
    },
    {
        id: "pp-6",
        tenseType: "past-perfect-continuous",
        category: "it-tech",
        english: "The attackers had been scanning our firewall for hours before breaching.",
        phonetic: "[di a-TÁ-kers jad bin SKÁ-ning áu-er FÁI-er-wol for ÁU-ers bi-FÓR BRÍ-tching]",
        spanishNeutral: "Los atacantes habían estado escaneando nuestro firewall durante horas antes de vulnerarlo.",
        latinTrap: "Decir 'The attackers were scanning for hours before they breached' sin marcar que la acción continua culminó antes de la brecha.",
        cognitiveRule: "Past Perfect Continuous (had been + -ing) expresa una acción continua prolongada en el pasado antes de otro hito pasado.",
        keyVerb: {
            base: "scan",
            past: "scanned",
            pastParticiple: "scanned",
            gerund: "scanning",
            edPronunciation: "/d/",
            phoneticPast: "[skand]"
        }
    }
];

// Combine initial hand-curated contrasts with generated multi-tense cards from the 500 verbs
export function buildCompleteLatinDataset(): LatinTenseComparison[] {
    const list: LatinTenseComparison[] = [...INITIAL_CONTRAST_CASES];

    VERBS_MASTER_500.forEach((v: VerbEntry, index: number) => {
        // Add Present Perfect Continuous Card
        list.push({
            id: `v500-ppc-${index + 1}`,
            tenseType: "present-perfect-continuous",
            category: v.category,
            english: v.sentences.presentPerfectContinuous.en,
            phonetic: v.sentences.presentPerfectContinuous.phonetic,
            spanishNeutral: v.sentences.presentPerfectContinuous.es,
            latinTrap: v.sentences.presentPerfectContinuous.trap,
            cognitiveRule: "La estructura 'have/has been + -ing' es la traducción exacta de 'Llevo [tiempo] haciendo...' o 'Hace [tiempo] que hago...'.",
            keyVerb: {
                base: v.base,
                past: v.past,
                pastParticiple: v.pastParticiple,
                gerund: v.gerund,
                edPronunciation: v.edEnding,
                phoneticPast: `${v.phonetics.past} / Participle: ${v.phonetics.pastParticiple}`
            }
        });

        // Add Past Simple Card
        list.push({
            id: `v500-ps-${index + 1}`,
            tenseType: "past-simple",
            category: v.category,
            english: v.sentences.pastSimple.en,
            phonetic: v.sentences.pastSimple.phonetic,
            spanishNeutral: v.sentences.pastSimple.es,
            latinTrap: v.sentences.pastSimple.trap,
            cognitiveRule: "Con marcas de tiempo terminadas (yesterday, last week, ago), NUNCA uses 'have'. Usa siempre Past Simple.",
            keyVerb: {
                base: v.base,
                past: v.past,
                pastParticiple: v.pastParticiple,
                gerund: v.gerund,
                edPronunciation: v.edEnding,
                phoneticPast: v.phonetics.past
            }
        });

        // Add Past Perfect Card
        list.push({
            id: `v500-pp-${index + 1}`,
            tenseType: "past-perfect",
            category: v.category,
            english: v.sentences.pastPerfect.en,
            phonetic: v.sentences.pastPerfect.phonetic,
            spanishNeutral: v.sentences.pastPerfect.es,
            latinTrap: v.sentences.pastPerfect.trap,
            cognitiveRule: "Usa 'had + past participle' cuando quieras especificar que este hecho ocurrió ANTES que otro en el pasado.",
            keyVerb: {
                base: v.base,
                past: v.past,
                pastParticiple: v.pastParticiple,
                gerund: v.gerund,
                edPronunciation: v.edEnding,
                phoneticPast: v.phonetics.pastParticiple
            }
        });
    });

    return list;
}

export const PAST_PERFECT_LATIN_DATASET = buildCompleteLatinDataset();
