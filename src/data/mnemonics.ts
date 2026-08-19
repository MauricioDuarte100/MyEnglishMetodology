export interface MnemonicEntry {
    word: string;
    phoneticAnchor: string;
    bizarreImage: string;
    palaceRoom: string;
    conceptualBridge: string;
}

export const MNEMONIC_DATABASE: Record<string, MnemonicEntry> = {
    "relentless": {
        word: "relentless",
        phoneticAnchor: "Reloj - Lento",
        bizarreImage: "Un reloj gigante camina lento pero te persigue sin detenerse jamas con una motosierra encendida. Implacable, sin descanso.",
        palaceRoom: "Pasillo central del Palacio Mental",
        conceptualBridge: "Sin tregua, implacable."
    },
    "flabbergasted": {
        word: "flabbergasted",
        phoneticAnchor: "Flan - Gas",
        bizarreImage: "Comes un flan que explota en gas fluorescente morado, dejandote con la boca abierta y los ojos desorbitados de absoluto asombro.",
        palaceRoom: "Comedor del Palacio Mental",
        conceptualBridge: "Anonadado, perplejo, completamente impactado."
    },
    "scrutinize": {
        word: "scrutinize",
        phoneticAnchor: "Escudo - Titanio",
        bizarreImage: "Un detective con un monóculo laser examina un escudo de titanio buscando una sola celula microscopica con pinzas de oro.",
        palaceRoom: "Laboratorio de Analisis Forense",
        conceptualBridge: "Examinar con extremo detalle y rigor."
    },
    "ubiquitous": {
        word: "ubiquitous",
        phoneticAnchor: "Ubicuo - Auto",
        bizarreImage: "Abres el refrigerador, el zapato, el cajon y en todas partes aparece exactamente el mismo volante de auto mirandote.",
        palaceRoom: "Puerta de Entrada",
        conceptualBridge: "Presente en todas partes al mismo tiempo, omnipresente."
    },
    "mitigate": {
        word: "mitigate",
        phoneticAnchor: "Miti - Gato",
        bizarreImage: "La mitad de un gato ninja con un extintor de espuma congela un servidor en llamas antes de que explote la oficina.",
        palaceRoom: "Centro de Operaciones de Seguridad (SOC)",
        conceptualBridge: "Reducir la gravedad, mitigar el impacto."
    },
    "resilience": {
        word: "resilience",
        phoneticAnchor: "Resorte - Silicio",
        bizarreImage: "Un resorte de silicio cae desde un rascacielos, choca contra el pavimento y rebota hasta la luna quedando intacto.",
        palaceRoom: "Gimnasio de Entrenamiento",
        conceptualBridge: "Capacidad de recuperarse rapido de las dificultades."
    },
    "bottleneck": {
        word: "bottleneck",
        phoneticAnchor: "Botella - Cuello",
        bizarreImage: "Mil autos miniatura intentan salir desesperadamente por el cuello estrecho de una botella de Coca-Cola gigante.",
        palaceRoom: "Sala de Servidores y Redes",
        conceptualBridge: "Cuello de botella, punto de congestion que frena todo el flujo."
    },
    "leverage": {
        word: "leverage",
        phoneticAnchor: "Leve - Rayo",
        bizarreImage: "Con una palanca de madera fina como un lapiz, levantas un contenedor de acero usando un leve rayo de luz.",
        palaceRoom: "Oficina de Finanzas y Estrategia",
        conceptualBridge: "Apalancar, aprovechar al maximo una ventaja o recurso."
    },
    "comprehensive": {
        word: "comprehensive",
        phoneticAnchor: "Comprende - Sivo",
        bizarreImage: "Un escaner que envuelve todo un rascacielos en una sabana transparente que analiza cada atomo y documento en un segundo.",
        palaceRoom: "Biblioteca y Archivo Central",
        conceptualBridge: "Completo, exhaustivo, que abarca todo."
    },
    "feasibility": {
        word: "feasibility",
        phoneticAnchor: "Fisico - Habilidad",
        bizarreImage: "Un ingeniero pesando un plano arquitectonico en una balanza para ver si flota o se hunde en un vaso con agua.",
        palaceRoom: "Mesa de Arquitectura de Software",
        conceptualBridge: "Viabilidad, factibilidad tecnica o financiera."
    },
    "vulnerability": {
        word: "vulnerability",
        phoneticAnchor: "Vulcano - Habilidad",
        bizarreImage: "Un castillo de titanio impenetrable con una sola puerta hecha de galleta de chocolate donde entra un raton con laptop.",
        palaceRoom: "Servidor DMZ y Firewall",
        conceptualBridge: "Vulnerabilidad, fallo de seguridad explotable."
    },
    "unprecedented": {
        word: "unprecedented",
        phoneticAnchor: "Un - Presidente",
        bizarreImage: "Un presidente extraterrestre de tres cabezas aterriza en la Casa Blanca bailando tango. Nadie nunca vio algo asi antes.",
        palaceRoom: "Sala de Prensa y Noticias",
        conceptualBridge: "Sin precedentes, jamas ocurrido antes."
    },
    "procrastinate": {
        word: "procrastinate",
        phoneticAnchor: "Pro - Canasta",
        bizarreImage: "Un atleta profesional encestando pelotas de nieve en una canasta mientras el reloj de arena gigante se desborda y le quema los zapatos.",
        palaceRoom: "Dormitorio y Sala de Descanso",
        conceptualBridge: "Postergar, aplazar lo importante por distraccion."
    },
    "ambiguity": {
        word: "ambiguity",
        phoneticAnchor: "Ambos - Guia",
        bizarreImage: "Un cartel en una bifurcacion que tiene dos flechas apuntando a la izquierda y a la derecha diciendo 'Por aca es y no es'.",
        palaceRoom: "Laberinto del Jardin",
        conceptualBridge: "Ambiguedad, falta de claridad que genera dudas."
    }
};

export function getMnemonicForWord(word: string, translation: string): MnemonicEntry {
    const cleanWord = word.trim().toLowerCase();
    if (MNEMONIC_DATABASE[cleanWord]) {
        return MNEMONIC_DATABASE[cleanWord];
    }

    // Dynamic heuristic mnemonic generation for vocabulary not pre-indexed
    const firstSyl = cleanWord.slice(0, Math.min(4, cleanWord.length));
    return {
        word: cleanWord,
        phoneticAnchor: `Anclaje: "${firstSyl}..."`,
        bizarreImage: `Imagina una escena absurda y brillante donde "${cleanWord}" interactua de forma exagerada con el concepto "${translation}".`,
        palaceRoom: "Sala de Adquisicion Rapida",
        conceptualBridge: translation
    };
}
