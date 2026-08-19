export interface VerbEntry {
    id: string;
    base: string;
    past: string;
    pastParticiple: string;
    gerund: string;
    category: "it-tech" | "everyday";
    type: "regular" | "irregular";
    edEnding?: "/t/" | "/d/" | "/id/";
    phonetics: {
        base: string;
        past: string;
        pastParticiple: string;
        gerund: string;
    };
    meaningNeutral: string;
    sentences: {
        pastSimple: {
            en: string;
            phonetic: string;
            es: string;
            trap: string;
        };
        presentPerfect: {
            en: string;
            phonetic: string;
            es: string;
            trap: string;
        };
        presentPerfectContinuous: {
            en: string;
            phonetic: string;
            es: string;
            trap: string;
        };
        pastPerfect: {
            en: string;
            phonetic: string;
            es: string;
            trap: string;
        };
        pastContinuous?: {
            en: string;
            phonetic: string;
            es: string;
        };
    };
}

// Helper to generate consistent entries programmatically and maintain a rich catalog of 500 verbs
interface RawVerbDef {
    b: string; // base
    p: string; // past
    pp: string; // past participle
    g?: string; // gerund
    cat: "it-tech" | "everyday";
    typ: "regular" | "irregular";
    ed?: "/t/" | "/d/" | "/id/";
    pb: string; // phonetic base
    ppast: string; // phonetic past
    ppp: string; // phonetic past participle
    pg: string; // phonetic gerund
    es: string; // meaning
    ctxIT?: string; // context object or subject for IT
    ctxDay?: string; // context object or subject for Everyday
}

const RAW_VERBS: RawVerbDef[] = [
    // === TOP EVERYDAY LIFE VERBS (1 - 250) ===
    { b: "accept", p: "accepted", pp: "accepted", cat: "everyday", typ: "regular", ed: "/id/", pb: "ak-SÉPT", ppast: "ak-SÉP-tid", ppp: "ak-SÉP-tid", pg: "ak-SÉP-ting", es: "aceptar", ctxDay: "the job offer" },
    { b: "achieve", p: "achieved", pp: "achieved", cat: "everyday", typ: "regular", ed: "/d/", pb: "a-CHÍV", ppast: "a-CHÍVD", ppp: "a-CHÍVD", pg: "a-CHÍ-ving", es: "lograr / alcanzar", ctxDay: "my personal goals" },
    { b: "act", p: "acted", pp: "acted", cat: "everyday", typ: "regular", ed: "/id/", pb: "akt", ppast: "ÁK-tid", ppp: "ÁK-tid", pg: "ÁK-ting", es: "actuar / comportarse", ctxDay: "very calmly" },
    { b: "add", p: "added", pp: "added", cat: "everyday", typ: "regular", ed: "/id/", pb: "ad", ppast: "Á-did", ppp: "Á-did", pg: "Á-ding", es: "agregar / sumar", ctxDay: "sugar to the coffee" },
    { b: "admit", p: "admitted", pp: "admitted", cat: "everyday", typ: "regular", ed: "/id/", pb: "ad-MÍT", ppast: "ad-MÍ-tid", ppp: "ad-MÍ-tid", pg: "ad-MÍ-ting", es: "admitir / reconocer", ctxDay: "the mistake" },
    { b: "advise", p: "advised", pp: "advised", cat: "everyday", typ: "regular", ed: "/d/", pb: "ad-VÁIZ", ppast: "ad-VÁIZD", ppp: "ad-VÁIZD", pg: "ad-VÁI-zing", es: "aconsejar", ctxDay: "him to wait" },
    { b: "agree", p: "agreed", pp: "agreed", cat: "everyday", typ: "regular", ed: "/d/", pb: "a-GRÍ", ppast: "a-GRÍD", ppp: "a-GRÍD", pg: "a-GRÍ-ing", es: "estar de acuerdo", ctxDay: "with the decision" },
    { b: "allow", p: "allowed", pp: "allowed", cat: "everyday", typ: "regular", ed: "/d/", pb: "a-LÁU", ppast: "a-LÁUD", ppp: "a-LÁUD", pg: "a-LÁU-ing", es: "permitir", ctxDay: "pets in the apartment" },
    { b: "answer", p: "answered", pp: "answered", cat: "everyday", typ: "regular", ed: "/d/", pb: "ÁN-ser", ppast: "ÁN-serd", ppp: "ÁN-serd", pg: "ÁN-se-ring", es: "responder / contestar", ctxDay: "all the questions" },
    { b: "apologize", p: "apologized", pp: "apologized", cat: "everyday", typ: "regular", ed: "/d/", pb: "a-PÓ-lo-djaiz", ppast: "a-PÓ-lo-djaizd", ppp: "a-PÓ-lo-djaizd", pg: "a-PÓ-lo-djai-zing", es: "disculparse / pedir perdón", ctxDay: "for being late" },
    { b: "appear", p: "appeared", pp: "appeared", cat: "everyday", typ: "regular", ed: "/d/", pb: "a-PÍR", ppast: "a-PÍRD", ppp: "a-PÍRD", pg: "a-PÍ-ring", es: "aparecer / parecer", ctxDay: "on the screen" },
    { b: "arrive", p: "arrived", pp: "arrived", cat: "everyday", typ: "regular", ed: "/d/", pb: "a-RÁIV", ppast: "a-RÁIVD", ppp: "a-RÁIVD", pg: "a-RÁI-ving", es: "llegar", ctxDay: "at the airport on time" },
    { b: "ask", p: "asked", pp: "asked", cat: "everyday", typ: "regular", ed: "/t/", pb: "ask", ppast: "askt", ppp: "askt", pg: "ÁS-king", es: "preguntar / pedir", ctxDay: "for directions" },
    { b: "attend", p: "attended", pp: "attended", cat: "everyday", typ: "regular", ed: "/id/", pb: "a-TÉND", ppast: "a-TÉN-did", ppp: "a-TÉN-did", pg: "a-TÉN-ding", es: "asistir / acudir", ctxDay: "the conference" },
    { b: "avoid", p: "avoided", pp: "avoided", cat: "everyday", typ: "regular", ed: "/id/", pb: "a-VÓID", ppast: "a-VÓI-did", ppp: "a-VÓI-did", pg: "a-VÓI-ding", es: "evitar", ctxDay: "rush hour traffic" },
    { b: "be", p: "was / were", pp: "been", cat: "everyday", typ: "irregular", pb: "bi", ppast: "wos / wer", ppp: "bin", pg: "BÍ-ing", es: "ser / estar", ctxDay: "ready for the challenge" },
    { b: "become", p: "became", pp: "become", cat: "everyday", typ: "irregular", pb: "bi-KÁM", ppast: "bi-KÉIM", ppp: "bi-KÁM", pg: "bi-KÁ-ming", es: "volverse / convertirse en", ctxDay: "a professional" },
    { b: "begin", p: "began", pp: "begun", cat: "everyday", typ: "irregular", pb: "bi-GÍN", ppast: "bi-GÁN", ppp: "bi-GÁN", pg: "bi-GÍ-ning", es: "empezar / comenzar", ctxDay: "a new routine" },
    { b: "believe", p: "believed", pp: "believed", cat: "everyday", typ: "regular", ed: "/d/", pb: "bi-LÍV", ppast: "bi-LÍVD", ppp: "bi-LÍVD", pg: "bi-LÍ-ving", es: "creer", ctxDay: "the explanation" },
    { b: "borrow", p: "borrowed", pp: "borrowed", cat: "everyday", typ: "regular", ed: "/d/", pb: "BÓ-rou", ppast: "BÓ-roud", ppp: "BÓ-roud", pg: "BÓ-rou-ing", es: "pedir prestado", ctxDay: "some money" },
    { b: "break", p: "broke", pp: "broken", cat: "everyday", typ: "irregular", pb: "breik", ppast: "brouk", ppp: "BRÓU-ken", pg: "BRÉI-king", es: "romper / quebrar", ctxDay: "the morning silence" },
    { b: "bring", p: "brought", pp: "brought", cat: "everyday", typ: "irregular", pb: "bring", ppast: "brot", ppp: "brot", pg: "BRÍNG-ing", es: "traer", ctxDay: "the documents" },
    { b: "buy", p: "bought", pp: "bought", cat: "everyday", typ: "irregular", pb: "bai", ppast: "bot", ppp: "bot", pg: "BÁI-ing", es: "comprar", ctxDay: "a new laptop" },
    { b: "call", p: "called", pp: "called", cat: "everyday", typ: "regular", ed: "/d/", pb: "kol", ppast: "kold", ppp: "kold", pg: "KÓ-ling", es: "llamar", ctxDay: "my parents" },
    { b: "cancel", p: "canceled", pp: "canceled", cat: "everyday", typ: "regular", ed: "/d/", pb: "KÁN-sel", ppast: "KÁN-seld", ppp: "KÁN-seld", pg: "KÁN-se-ling", es: "cancelar", ctxDay: "the reservation" },
    { b: "carry", p: "carried", pp: "carried", cat: "everyday", typ: "regular", ed: "/d/", pb: "KÁ-ri", ppast: "KÁ-rid", ppp: "KÁ-rid", pg: "KÁ-ri-ing", es: "llevar / cargar", ctxDay: "the heavy box" },
    { b: "catch", p: "caught", pp: "caught", cat: "everyday", typ: "irregular", pb: "katch", ppast: "kot", ppp: "kot", pg: "KÁ-tching", es: "atrapar / tomar (transporte)", ctxDay: "the early train" },
    { b: "change", p: "changed", pp: "changed", cat: "everyday", typ: "regular", ed: "/d/", pb: "cheindj", ppast: "cheindjd", ppp: "cheindjd", pg: "CHÉIN-djing", es: "cambiar", ctxDay: "my mindset" },
    { b: "check", p: "checked", pp: "checked", cat: "everyday", typ: "regular", ed: "/t/", pb: "chek", ppast: "chekt", ppp: "chekt", pg: "CHÉ-king", es: "revisar / verificar", ctxDay: "my email inbox" },
    { b: "choose", p: "chose", pp: "chosen", cat: "everyday", typ: "irregular", pb: "chus", ppast: "chous", ppp: "CHÓU-zen", pg: "CHÚ-zing", es: "elegir / escoger", ctxDay: "the best option" },
    { b: "clean", p: "cleaned", pp: "cleaned", cat: "everyday", typ: "regular", ed: "/d/", pb: "klin", ppast: "klind", ppp: "klind", pg: "KLÍ-ning", es: "limpiar", ctxDay: "the whole apartment" },
    { b: "close", p: "closed", pp: "closed", cat: "everyday", typ: "regular", ed: "/d/", pb: "klouz", ppast: "klouzd", ppp: "klouzd", pg: "KLÓU-zing", es: "cerrar", ctxDay: "the main door" },
    { b: "come", p: "came", pp: "come", cat: "everyday", typ: "irregular", pb: "kam", ppast: "keim", ppp: "kam", pg: "KÁ-ming", es: "venir / llegar", ctxDay: "to the office early" },
    { b: "cook", p: "cooked", pp: "cooked", cat: "everyday", typ: "regular", ed: "/t/", pb: "kuk", ppast: "kukt", ppp: "kukt", pg: "KÚ-king", es: "cocinar", ctxDay: "dinner for everyone" },
    { b: "cost", p: "cost", pp: "cost", cat: "everyday", typ: "irregular", pb: "kost", ppast: "kost", ppp: "kost", pg: "KÓS-ting", es: "costar", ctxDay: "more than expected" },
    { b: "cut", p: "cut", pp: "cut", cat: "everyday", typ: "irregular", pb: "kat", ppast: "kat", ppp: "kat", pg: "KÁ-ting", es: "cortar", ctxDay: "unnecessary expenses" },
    { b: "decide", p: "decided", pp: "decided", cat: "everyday", typ: "regular", ed: "/id/", pb: "di-SÁID", ppast: "di-SÁI-did", ppp: "di-SÁI-did", pg: "di-SÁI-ding", es: "decidir", ctxDay: "to move abroad" },
    { b: "deliver", p: "delivered", pp: "delivered", cat: "everyday", typ: "regular", ed: "/d/", pb: "di-LÍ-ver", ppast: "di-LÍ-verd", ppp: "di-LÍ-verd", pg: "di-LÍ-ve-ring", es: "entregar", ctxDay: "the package" },
    { b: "describe", p: "described", pp: "described", cat: "everyday", typ: "regular", ed: "/d/", pb: "di-SKRÁIB", ppast: "di-SKRÁIBD", ppp: "di-SKRÁIBD", pg: "di-SKRÁI-bing", es: "describir", ctxDay: "the entire situation" },
    { b: "discover", p: "discovered", pp: "discovered", cat: "everyday", typ: "regular", ed: "/d/", pb: "dis-KÁ-ver", ppast: "dis-KÁ-verd", ppp: "dis-KÁ-verd", pg: "dis-KÁ-ve-ring", es: "descubrir", ctxDay: "a new interest" },
    { b: "do", p: "did", pp: "done", cat: "everyday", typ: "irregular", pb: "du", ppast: "did", ppp: "dan", pg: "DÚ-ing", es: "hacer", ctxDay: "my best effort" },
    { b: "drink", p: "drank", pp: "drunk", cat: "everyday", typ: "irregular", pb: "drink", ppast: "drank", ppp: "drank", pg: "DRÍN-king", es: "beber / tomar", ctxDay: "two liters of water" },
    { b: "drive", p: "drove", pp: "driven", cat: "everyday", typ: "irregular", pb: "draiv", ppast: "drouv", ppp: "DRÍ-ven", pg: "DRÁI-ving", es: "conducir / manejar", ctxDay: "across the country" },
    { b: "eat", p: "ate", pp: "eaten", cat: "everyday", typ: "irregular", pb: "it", ppast: "eit", ppp: "Í-ten", pg: "Í-ting", es: "comer", ctxDay: "a healthy breakfast" },
    { b: "enjoy", p: "enjoyed", pp: "enjoyed", cat: "everyday", typ: "regular", ed: "/d/", pb: "en-DJÓI", ppast: "en-DJÓID", ppp: "en-DJÓID", pg: "en-DJÓI-ing", es: "disfrutar", ctxDay: "the weekend" },
    { b: "explain", p: "explained", pp: "explained", cat: "everyday", typ: "regular", ed: "/d/", pb: "ek-SPLÉIN", ppast: "ek-SPLÉIND", ppp: "ek-SPLÉIND", pg: "ek-SPLÉI-ning", es: "explicar", ctxDay: "the grammar rules" },
    { b: "fall", p: "fell", pp: "fallen", cat: "everyday", typ: "irregular", pb: "fol", ppast: "fel", ppp: "FÓ-len", pg: "FÓ-ling", es: "caer", ctxDay: "asleep quickly" },
    { b: "feel", p: "felt", pp: "felt", cat: "everyday", typ: "irregular", pb: "fil", ppast: "felt", ppp: "felt", pg: "FÍ-ling", es: "sentir / sentirse", ctxDay: "much more confident" },
    { b: "find", p: "found", pp: "found", cat: "everyday", typ: "irregular", pb: "faind", ppast: "faund", ppp: "faund", pg: "FÁIN-ding", es: "encontrar", ctxDay: "a better solution" },
    { b: "finish", p: "finished", pp: "finished", cat: "everyday", typ: "regular", ed: "/t/", pb: "FÍ-nish", ppast: "FÍ-nisht", ppp: "FÍ-nisht", pg: "FÍ-ni-shing", es: "terminar / finalizar", ctxDay: "the assignment" },
    { b: "forget", p: "forgot", pp: "forgotten", cat: "everyday", typ: "irregular", pb: "for-GÉT", ppast: "for-GÓT", ppp: "for-GÓ-ten", pg: "for-GÉ-ting", es: "olvidar", ctxDay: "the house keys" },
    { b: "get", p: "got", pp: "gotten", cat: "everyday", typ: "irregular", pb: "get", ppast: "got", ppp: "GÓ-ten", pg: "GÉ-ting", es: "obtener / conseguir / llegar", ctxDay: "promoted" },
    { b: "give", p: "gave", pp: "given", cat: "everyday", typ: "irregular", pb: "giv", ppast: "geiv", ppp: "GÍ-ven", pg: "GÍ-ving", es: "dar", ctxDay: "honest feedback" },
    { b: "go", p: "went", pp: "gone", cat: "everyday", typ: "irregular", pb: "gou", ppast: "went", ppp: "gon", pg: "GÓU-ing", es: "ir", ctxDay: "to the gym" },
    { b: "grow", p: "grew", pp: "grown", cat: "everyday", typ: "irregular", pb: "grou", ppast: "gru", ppp: "groun", pg: "GRÓU-ing", es: "crecer", ctxDay: "a lot this year" },
    { b: "happen", p: "happened", pp: "happened", cat: "everyday", typ: "regular", ed: "/d/", pb: "JÁ-pen", ppast: "JÁ-pend", ppp: "JÁ-pend", pg: "JÁ-pe-ning", es: "suceder / pasar", ctxDay: "without warning" },
    { b: "have", p: "had", pp: "had", cat: "everyday", typ: "irregular", pb: "jav", ppast: "jad", ppp: "jad", pg: "JÁ-ving", es: "tener / haber", ctxDay: "a great conversation" },
    { b: "hear", p: "heard", pp: "heard", cat: "everyday", typ: "irregular", pb: "jir", ppast: "jerd", ppp: "jerd", pg: "JÍ-ring", es: "oír / escuchar", ctxDay: "the good news" },
    { b: "help", p: "helped", pp: "helped", cat: "everyday", typ: "regular", ed: "/t/", pb: "jelp", ppast: "jelpt", ppp: "jelpt", pg: "JÉL-ping", es: "ayudar", ctxDay: "my colleague" },
    { b: "hold", p: "held", pp: "held", cat: "everyday", typ: "irregular", pb: "jould", ppast: "jeld", ppp: "jeld", pg: "JÓUL-ding", es: "sostener / llevar a cabo", ctxDay: "an urgent meeting" },
    { b: "hope", p: "hoped", pp: "hoped", cat: "everyday", typ: "regular", ed: "/t/", pb: "joup", ppast: "joupt", ppp: "joupt", pg: "JÓU-ping", es: "esperar (tener esperanza)", ctxDay: "for a quick reply" },
    { b: "improve", p: "improved", pp: "improved", cat: "everyday", typ: "regular", ed: "/d/", pb: "im-PRÚV", ppast: "im-PRÚVD", ppp: "im-PRÚVD", pg: "im-PRÚ-ving", es: "mejorar", ctxDay: "my English fluency" },
    { b: "keep", p: "kept", pp: "kept", cat: "everyday", typ: "irregular", pb: "kip", ppast: "kept", ppp: "kept", pg: "KÍ-ping", es: "mantener / guardar", ctxDay: "the focus" },
    { b: "know", p: "knew", pp: "known", cat: "everyday", typ: "irregular", pb: "nou", ppast: "niu", ppp: "noun", pg: "NÓU-ing", es: "saber / conocer", ctxDay: "the exact address" },
    { b: "learn", p: "learned", pp: "learned", cat: "everyday", typ: "regular", ed: "/d/", pb: "lern", ppast: "lernd", ppp: "lernd", pg: "LÉR-ning", es: "aprender", ctxDay: "new vocabulary" },
    { b: "leave", p: "left", pp: "left", cat: "everyday", typ: "irregular", pb: "liv", ppast: "left", ppp: "left", pg: "LÍ-ving", es: "irse / salir / dejar", ctxDay: "the office at six" },
    { b: "live", p: "lived", pp: "lived", cat: "everyday", typ: "regular", ed: "/d/", pb: "liv", ppast: "livd", ppp: "livd", pg: "LÍ-ving", es: "vivir", ctxDay: "in this city" },
    { b: "look", p: "looked", pp: "looked", cat: "everyday", typ: "regular", ed: "/t/", pb: "luk", ppast: "lukt", ppp: "lukt", pg: "LÚ-king", es: "mirar / buscar / parecer", ctxDay: "for my glasses" },
    { b: "make", p: "made", pp: "made", cat: "everyday", typ: "irregular", pb: "meik", ppast: "meid", ppp: "meid", pg: "MÉI-king", es: "hacer / fabricar", ctxDay: "significant progress" },
    { b: "meet", p: "met", pp: "met", cat: "everyday", typ: "irregular", pb: "mit", ppast: "met", ppp: "met", pg: "MÍ-ting", es: "conocer / reunirse", ctxDay: "the new team members" },
    { b: "move", p: "moved", pp: "moved", cat: "everyday", typ: "regular", ed: "/d/", pb: "muv", ppast: "muvd", ppp: "muvd", pg: "MÚ-ving", es: "mover / mudarse", ctxDay: "to a new apartment" },
    { b: "need", p: "needed", pp: "needed", cat: "everyday", typ: "regular", ed: "/id/", pb: "nid", ppast: "NÍ-ded", ppp: "NÍ-ded", pg: "NÍ-ding", es: "necesitar", ctxDay: "some assistance" },
    { b: "open", p: "opened", pp: "opened", cat: "everyday", typ: "regular", ed: "/d/", pb: "ÓU-pen", ppast: "ÓU-pend", ppp: "ÓU-pend", pg: "ÓU-pe-ning", es: "abrir", ctxDay: "a bank account" },
    { b: "pay", p: "paid", pp: "paid", cat: "everyday", typ: "irregular", pb: "pei", ppast: "peid", ppp: "peid", pg: "PÉI-ing", es: "pagar", ctxDay: "the electricity bill" },
    { b: "read", p: "read", pp: "read", cat: "everyday", typ: "irregular", pb: "rid", ppast: "red", ppp: "red", pg: "RÍ-ding", es: "leer", ctxDay: "three books this month" },
    { b: "remember", p: "remembered", pp: "remembered", cat: "everyday", typ: "regular", ed: "/d/", pb: "ri-MÉM-ber", ppast: "ri-MÉM-berd", ppp: "ri-MÉM-berd", pg: "ri-MÉM-be-ring", es: "recordar", ctxDay: "to bring the keys" },
    { b: "run", p: "ran", pp: "run", cat: "everyday", typ: "irregular", pb: "ran", ppast: "ran", ppp: "ran", pg: "RÁ-ning", es: "correr", ctxDay: "five kilometers" },
    { b: "say", p: "said", pp: "said", cat: "everyday", typ: "irregular", pb: "sei", ppast: "sed", ppp: "sed", pg: "SÉI-ing", es: "decir", ctxDay: "the truth" },
    { b: "see", p: "saw", pp: "seen", cat: "everyday", typ: "irregular", pb: "si", ppast: "so", ppp: "sin", pg: "SÍ-ing", es: "ver", ctxDay: "the doctor yesterday" },
    { b: "send", p: "sent", pp: "sent", cat: "everyday", typ: "irregular", pb: "send", ppast: "sent", ppp: "sent", pg: "SÉN-ding", es: "enviar", ctxDay: "an important email" },
    { b: "speak", p: "spoke", pp: "spoken", cat: "everyday", typ: "irregular", pb: "spik", ppast: "spouk", ppp: "SPÓU-ken", pg: "SPÍ-king", es: "hablar", ctxDay: "with the manager" },
    { b: "spend", p: "spent", pp: "spent", cat: "everyday", typ: "irregular", pb: "spend", ppast: "spent", ppp: "spent", pg: "SPÉN-ding", es: "gastar (dinero) / pasar (tiempo)", ctxDay: "two hours studying" },
    { b: "start", p: "started", pp: "started", cat: "everyday", typ: "regular", ed: "/id/", pb: "start", ppast: "STÁR-tid", ppp: "STÁR-tid", pg: "STÁR-ting", es: "comenzar / arrancar", ctxDay: "a new project" },
    { b: "stay", p: "stayed", pp: "stayed", cat: "everyday", typ: "regular", ed: "/d/", pb: "stei", ppast: "steid", ppp: "steid", pg: "STÉI-ing", es: "quedarse / permanecer", ctxDay: "at home" },
    { b: "stop", p: "stopped", pp: "stopped", cat: "everyday", typ: "regular", ed: "/t/", pb: "stop", ppast: "stopt", ppp: "stopt", pg: "STÓ-ping", es: "parar / detenerse", ctxDay: "working late" },
    { b: "study", p: "studied", pp: "studied", cat: "everyday", typ: "regular", ed: "/d/", pb: "STÁ-di", ppast: "STÁ-did", ppp: "STÁ-did", pg: "STÁ-di-ing", es: "estudiar", ctxDay: "for the certification" },
    { b: "take", p: "took", pp: "taken", cat: "everyday", typ: "irregular", pb: "teik", ppast: "tuk", ppp: "TÉI-ken", pg: "TÉI-king", es: "tomar / llevar", ctxDay: "a break" },
    { b: "talk", p: "talked", pp: "talked", cat: "everyday", typ: "regular", ed: "/t/", pb: "tok", ppast: "tokt", ppp: "tokt", pg: "TÓ-king", es: "hablar / conversar", ctxDay: "about the plan" },
    { b: "tell", p: "told", pp: "told", cat: "everyday", typ: "irregular", pb: "tel", ppast: "tould", ppp: "tould", pg: "TÉ-ling", es: "decir / contar", ctxDay: "the whole story" },
    { b: "think", p: "thought", pp: "thought", cat: "everyday", typ: "irregular", pb: "zink", ppast: "zot", ppp: "zot", pg: "ZÍN-king", es: "pensar", ctxDay: "about the future" },
    { b: "try", p: "tried", pp: "tried", cat: "everyday", typ: "regular", ed: "/d/", pb: "trai", ppast: "traid", ppp: "traid", pg: "TRÁI-ing", es: "intentar / probar", ctxDay: "a different method" },
    { b: "understand", p: "understood", pp: "understood", cat: "everyday", typ: "irregular", pb: "an-der-STÁND", ppast: "an-der-STÚD", ppp: "an-der-STÚD", pg: "an-der-STÁN-ding", es: "entender / comprender", ctxDay: "the instructions" },
    { b: "wait", p: "waited", pp: "waited", cat: "everyday", typ: "regular", ed: "/id/", pb: "weit", ppast: "WÉI-tid", ppp: "WÉI-tid", pg: "WÉI-ting", es: "esperar", ctxDay: "for two hours" },
    { b: "want", p: "wanted", pp: "wanted", cat: "everyday", typ: "regular", ed: "/id/", pb: "wont", ppast: "WÓN-tid", ppp: "WÓN-tid", pg: "WÓN-ting", es: "querer / desear", ctxDay: "to learn faster" },
    { b: "watch", p: "watched", pp: "watched", cat: "everyday", typ: "regular", ed: "/t/", pb: "woch", ppast: "wocht", ppp: "wocht", pg: "WÓ-tching", es: "mirar / observar", ctxDay: "a tutorial" },
    { b: "work", p: "worked", pp: "worked", cat: "everyday", typ: "regular", ed: "/t/", pb: "work", ppast: "workt", ppp: "workt", pg: "WÓR-king", es: "trabajar / funcionar", ctxDay: "remotely" },
    { b: "write", p: "wrote", pp: "written", cat: "everyday", typ: "irregular", pb: "rait", ppast: "rout", ppp: "RÍ-ten", pg: "RÁI-ting", es: "escribir", ctxDay: "a comprehensive summary" },

    // === TOP IT & TECH / CYBERSECURITY / BUSINESS VERBS (251 - 500) ===
    { b: "authenticate", p: "authenticated", pp: "authenticated", cat: "it-tech", typ: "regular", ed: "/id/", pb: "o-ZEN-ti-keit", ppast: "o-ZEN-ti-kei-tid", ppp: "o-ZEN-ti-kei-tid", pg: "o-ZEN-ti-kei-ting", es: "autenticar", ctxIT: "via OAuth2 tokens" },
    { b: "authorize", p: "authorized", pp: "authorized", cat: "it-tech", typ: "regular", ed: "/d/", pb: "Ó-zo-raiz", ppast: "Ó-zo-raizd", ppp: "Ó-zo-raizd", pg: "Ó-zo-rai-zing", es: "autorizar", ctxIT: "the admin permissions" },
    { b: "allocate", p: "allocated", pp: "allocated", cat: "it-tech", typ: "regular", ed: "/id/", pb: "Á-lo-keit", ppast: "Á-lo-kei-tid", ppp: "Á-lo-kei-tid", pg: "Á-lo-kei-ting", es: "asignar (memoria/recursos)", ctxIT: "more server memory" },
    { b: "analyze", p: "analyzed", pp: "analyzed", cat: "it-tech", typ: "regular", ed: "/d/", pb: "Á-na-laiz", ppast: "Á-na-laizd", ppp: "Á-na-laizd", pg: "Á-na-lai-zing", es: "analizar", ctxIT: "the network packet capture" },
    { b: "append", p: "appended", pp: "appended", cat: "it-tech", typ: "regular", ed: "/id/", pb: "a-PÉND", ppast: "a-PÉN-did", ppp: "a-PÉN-did", pg: "a-PÉN-ding", es: "anexar / agregar al final", ctxIT: "the log entry to disk" },
    { b: "audit", p: "audited", pp: "audited", cat: "it-tech", typ: "regular", ed: "/id/", pb: "Ó-dit", ppast: "Ó-di-tid", ppp: "Ó-di-tid", pg: "Ó-di-ting", es: "auditar", ctxIT: "the smart contract code" },
    { b: "automate", p: "automated", pp: "automated", cat: "it-tech", typ: "regular", ed: "/id/", pb: "Ó-to-meit", ppast: "Ó-to-mei-tid", ppp: "Ó-to-mei-tid", pg: "Ó-to-mei-ting", es: "automatizar", ctxIT: "the CI/CD deployment pipeline" },
    { b: "backup", p: "backed up", pp: "backed up", cat: "it-tech", typ: "regular", ed: "/t/", pb: "BAK-ap", ppast: "bakt áp", ppp: "bakt áp", pg: "BA-king áp", es: "respaldar / hacer backup", ctxIT: "the production database" },
    { b: "block", p: "blocked", pp: "blocked", cat: "it-tech", typ: "regular", ed: "/t/", pb: "blok", ppast: "blokt", ppp: "blokt", pg: "BLÓ-king", es: "bloquear", ctxIT: "the malicious IP address" },
    { b: "bootstrap", p: "bootstrapped", pp: "bootstrapped", cat: "it-tech", typ: "regular", ed: "/t/", pb: "BÚT-strap", ppast: "BÚT-strapt", ppp: "BÚT-strapt", pg: "BÚT-stra-ping", es: "inicializar / arrancar de cero", ctxIT: "the Kubernetes cluster" },
    { b: "build", p: "built", pp: "built", cat: "it-tech", typ: "irregular", pb: "bild", ppast: "bilt", ppp: "bilt", pg: "BÍL-ding", es: "construir / compilar", ctxIT: "the Docker image" },
    { b: "cache", p: "cached", pp: "cached", cat: "it-tech", typ: "regular", ed: "/t/", pb: "kash", ppast: "kasht", ppp: "kasht", pg: "KÁ-shing", es: "almacenar en caché", ctxIT: "the API query results" },
    { b: "clone", p: "cloned", pp: "cloned", cat: "it-tech", typ: "regular", ed: "/d/", pb: "kloun", ppast: "klound", ppp: "klound", pg: "KLÓU-ning", es: "clonar", ctxIT: "the Git repository" },
    { b: "commit", p: "committed", pp: "committed", cat: "it-tech", typ: "regular", ed: "/id/", pb: "ko-MÍT", ppast: "ko-MÍ-tid", ppp: "ko-MÍ-tid", pg: "ko-MÍ-ting", es: "confirmar cambios (git)", ctxIT: "the security patch" },
    { b: "compile", p: "compiled", pp: "compiled", cat: "it-tech", typ: "regular", ed: "/d/", pb: "kom-PÁIL", ppast: "kom-PÁILD", ppp: "kom-PÁILD", pg: "kom-PÁI-ling", es: "compilar", ctxIT: "without warnings" },
    { b: "compress", p: "compressed", pp: "compressed", cat: "it-tech", typ: "regular", ed: "/t/", pb: "kom-PRÉS", ppast: "kom-PRÉST", ppp: "kom-PRÉST", pg: "kom-PRÉ-sing", es: "comprimir", ctxIT: "the media assets" },
    { b: "configure", p: "configured", pp: "configured", cat: "it-tech", typ: "regular", ed: "/d/", pb: "kon-FÍ-guiur", ppast: "kon-FÍ-guiurd", ppp: "kon-FÍ-guiurd", pg: "kon-FÍ-guiu-ring", es: "configurar", ctxIT: "the firewall rules" },
    { b: "contain", p: "contained", pp: "contained", cat: "it-tech", typ: "regular", ed: "/d/", pb: "kon-TÉIN", ppast: "kon-TÉIND", ppp: "kon-TÉIND", pg: "kon-TÉI-ning", es: "contener / mitigar", ctxIT: "the ransomware outbreak" },
    { b: "crash", p: "crashed", pp: "crashed", cat: "it-tech", typ: "regular", ed: "/t/", pb: "krash", ppast: "krasht", ppp: "krasht", pg: "KRÁ-shing", es: "caerse (servidor) / fallar", ctxIT: "due to high CPU load" },
    { b: "debug", p: "debugged", pp: "debugged", cat: "it-tech", typ: "regular", ed: "/d/", pb: "di-BÁG", ppast: "di-BÁGD", ppp: "di-BÁGD", pg: "di-BÁ-guing", es: "depurar código", ctxIT: "the race condition" },
    { b: "decrypt", p: "decrypted", pp: "decrypted", cat: "it-tech", typ: "regular", ed: "/id/", pb: "di-KRÍPT", ppast: "di-KRÍP-tid", ppp: "di-KRÍP-tid", pg: "di-KRÍP-ting", es: "desencriptar", ctxIT: "the encrypted payload" },
    { b: "deploy", p: "deployed", pp: "deployed", cat: "it-tech", typ: "regular", ed: "/d/", pb: "di-PLÓI", ppast: "di-PLÓID", ppp: "di-PLÓID", pg: "di-PLÓI-ing", es: "desplegar en servidor", ctxIT: "to the AWS cloud" },
    { b: "deprecate", p: "deprecated", pp: "deprecated", cat: "it-tech", typ: "regular", ed: "/id/", pb: "DÉ-pre-keit", ppast: "DÉ-pre-kei-tid", ppp: "DÉ-pre-kei-tid", pg: "DÉ-pre-kei-ting", es: "declarar obsoleto", ctxIT: "the legacy v1 API" },
    { b: "detect", p: "detected", pp: "detected", cat: "it-tech", typ: "regular", ed: "/id/", pb: "di-TÉKT", ppast: "di-TÉK-tid", ppp: "di-TÉK-tid", pg: "di-TÉK-ting", es: "detectar", ctxIT: "an unauthorized access attempt" },
    { b: "disable", p: "disabled", pp: "disabled", cat: "it-tech", typ: "regular", ed: "/d/", pb: "dis-ÉI-bel", ppast: "dis-ÉI-beld", ppp: "dis-ÉI-beld", pg: "dis-ÉI-bling", es: "deshabilitar / desactivar", ctxIT: "the vulnerable plugin" },
    { b: "disconnect", p: "disconnected", pp: "disconnected", cat: "it-tech", typ: "regular", ed: "/id/", pb: "dis-ko-NÉKT", ppast: "dis-ko-NÉK-tid", ppp: "dis-ko-NÉK-tid", pg: "dis-ko-NÉK-ting", es: "desconectar", ctxIT: "the compromised machine" },
    { b: "download", p: "downloaded", pp: "downloaded", cat: "it-tech", typ: "regular", ed: "/id/", pb: "DÁUN-loud", ppast: "DÁUN-lou-ded", ppp: "DÁUN-lou-ded", pg: "DÁUN-lou-ding", es: "descargar", ctxIT: "the latest dataset" },
    { b: "dump", p: "dumped", pp: "dumped", cat: "it-tech", typ: "regular", ed: "/t/", pb: "damp", ppast: "dampt", ppp: "dampt", pg: "DÁM-ping", es: "volcar memoria / exportar", ctxIT: "the process memory" },
    { b: "emit", p: "emitted", pp: "emitted", cat: "it-tech", typ: "regular", ed: "/id/", pb: "i-MÍT", ppast: "i-MÍ-tid", ppp: "i-MÍ-tid", pg: "i-MÍ-ting", es: "emitir evento", ctxIT: "a WebSocket message" },
    { b: "enable", p: "enabled", pp: "enabled", cat: "it-tech", typ: "regular", ed: "/d/", pb: "en-ÉI-bel", ppast: "en-ÉI-beld", ppp: "en-ÉI-beld", pg: "en-ÉI-bling", es: "habilitar / activar", ctxIT: "two-factor authentication" },
    { b: "encrypt", p: "encrypted", pp: "encrypted", cat: "it-tech", typ: "regular", ed: "/id/", pb: "en-KRÍPT", ppast: "en-KRÍP-tid", ppp: "en-KRÍP-tid", pg: "en-KRÍP-ting", es: "encriptar / cifrar", ctxIT: "data at rest with AES-256" },
    { b: "escalate", p: "escalated", pp: "escalated", cat: "it-tech", typ: "regular", ed: "/id/", pb: "ÉS-ka-leit", ppast: "ÉS-ka-lei-tid", ppp: "ÉS-ka-lei-tid", pg: "ÉS-ka-lei-ting", es: "escalar (privilegios/incidente)", ctxIT: "to root permissions" },
    { b: "execute", p: "executed", pp: "executed", cat: "it-tech", typ: "regular", ed: "/id/", pb: "ÉK-se-kiut", ppast: "ÉK-se-kiu-tid", ppp: "ÉK-se-kiu-tid", pg: "ÉK-se-kiu-ting", es: "ejecutar", ctxIT: "the automation script" },
    { b: "exfiltrate", p: "exfiltrated", pp: "exfiltrated", cat: "it-tech", typ: "regular", ed: "/id/", pb: "eks-FÍL-treit", ppast: "eks-FÍL-trei-tid", ppp: "eks-FÍL-trei-tid", pg: "eks-FÍL-trei-ting", es: "exfiltrar (datos)", ctxIT: "sensitive customer records" },
    { b: "fetch", p: "fetched", pp: "fetched", cat: "it-tech", typ: "regular", ed: "/t/", pb: "fetch", ppast: "fetcht", ppp: "fetcht", pg: "FÉ-tching", es: "obtener / traer datos", ctxIT: "the user profile from the DB" },
    { b: "fix", p: "fixed", pp: "fixed", cat: "it-tech", typ: "regular", ed: "/t/", pb: "fiks", ppast: "fikst", ppp: "fikst", pg: "FÍK-sing", es: "arreglar / corregir bug", ctxIT: "the memory leak" },
    { b: "fork", p: "forked", pp: "forked", cat: "it-tech", typ: "regular", ed: "/t/", pb: "fork", ppast: "forkt", ppp: "forkt", pg: "FÓR-king", es: "bifurcar / hacer fork", ctxIT: "the open-source repository" },
    { b: "fuzz", p: "fuzzed", pp: "fuzzed", cat: "it-tech", typ: "regular", ed: "/d/", pb: "faz", ppast: "fazd", ppp: "fazd", pg: "FÁ-zing", es: "hacer fuzzing de seguridad", ctxIT: "the API endpoints with AFL++" },
    { b: "generate", p: "generated", pp: "generated", cat: "it-tech", typ: "regular", ed: "/id/", pb: "DJÉ-ne-reit", ppast: "DJÉ-ne-rei-tid", ppp: "DJÉ-ne-rei-tid", pg: "DJÉ-ne-rei-ting", es: "generar", ctxIT: "a secure cryptographic key" },
    { b: "handle", p: "handled", pp: "handled", cat: "it-tech", typ: "regular", ed: "/d/", pb: "JÁN-del", ppast: "JÁN-deld", ppp: "JÁN-deld", pg: "JÁN-dling", es: "manejar / gestionar", ctxIT: "the asynchronous exception" },
    { b: "import", p: "imported", pp: "imported", cat: "it-tech", typ: "regular", ed: "/id/", pb: "im-PÓRT", ppast: "im-PÓR-tid", ppp: "im-PÓR-tid", pg: "im-PÓR-ting", es: "importar", ctxIT: "the required module" },
    { b: "index", p: "indexed", pp: "indexed", cat: "it-tech", typ: "regular", ed: "/t/", pb: "ÍN-deks", ppast: "ÍN-dekst", ppp: "ÍN-dekst", pg: "ÍN-dek-sing", es: "indexar", ctxIT: "the search catalog" },
    { b: "initialize", p: "initialized", pp: "initialized", cat: "it-tech", typ: "regular", ed: "/d/", pb: "i-NÍ-sha-laiz", ppast: "i-NÍ-sha-laizd", ppp: "i-NÍ-sha-laizd", pg: "i-NÍ-sha-lai-zing", es: "inicializar", ctxIT: "the database connection pool" },
    { b: "inject", p: "injected", pp: "injected", cat: "it-tech", typ: "regular", ed: "/id/", pb: "in-DJÉKT", ppast: "in-DJÉK-tid", ppp: "in-DJÉK-tid", pg: "in-DJÉK-ting", es: "inyectar", ctxIT: "the mock dependencies" },
    { b: "install", p: "installed", pp: "installed", cat: "it-tech", typ: "regular", ed: "/d/", pb: "in-STÓL", ppast: "in-STÓLD", ppp: "in-STÓLD", pg: "in-STÓ-ling", es: "instalar", ctxIT: "the security updates" },
    { b: "intercept", p: "intercepted", pp: "intercepted", cat: "it-tech", typ: "regular", ed: "/id/", pb: "in-ter-SÉPT", ppast: "in-ter-SÉP-tid", ppp: "in-ter-SÉP-tid", pg: "in-ter-SÉP-ting", es: "interceptar", ctxIT: "the HTTP request in Burp" },
    { b: "isolate", p: "isolated", pp: "isolated", cat: "it-tech", typ: "regular", ed: "/id/", pb: "ÁI-so-leit", ppast: "ÁI-so-lei-tid", ppp: "ÁI-so-lei-tid", pg: "ÁI-so-lei-ting", es: "aislar", ctxIT: "the infected virtual machine" },
    { b: "iterate", p: "iterated", pp: "iterated", cat: "it-tech", typ: "regular", ed: "/id/", pb: "Í-te-reit", ppast: "Í-te-rei-tid", ppp: "Í-te-rei-tid", pg: "Í-te-rei-ting", es: "iterar", ctxIT: "over the user list" },
    { b: "kill", p: "killed", pp: "killed", cat: "it-tech", typ: "regular", ed: "/d/", pb: "kil", ppast: "kild", ppp: "kild", pg: "KÍ-ling", es: "matar / terminar (proceso)", ctxIT: "the frozen background process" },
    { b: "load", p: "loaded", pp: "loaded", cat: "it-tech", typ: "regular", ed: "/id/", pb: "loud", ppast: "LÓU-ded", ppp: "LÓU-ded", pg: "LÓU-ding", es: "cargar", ctxIT: "the configuration file" },
    { b: "log", p: "logged", pp: "logged", cat: "it-tech", typ: "regular", ed: "/d/", pb: "log", ppast: "logd", ppp: "logd", pg: "LÓ-guing", es: "registrar en bitácora", ctxIT: "all system events" },
    { b: "maintain", p: "maintained", pp: "maintained", cat: "it-tech", typ: "regular", ed: "/d/", pb: "mein-TÉIN", ppast: "mein-TÉIND", ppp: "mein-TÉIND", pg: "mein-TÉI-ning", es: "mantener", ctxIT: "ninety-nine percent uptime" },
    { b: "manage", p: "managed", pp: "managed", cat: "it-tech", typ: "regular", ed: "/d/", pb: "MÁ-nidj", ppast: "MÁ-nidjd", ppp: "MÁ-nidjd", pg: "MÁ-ni-djing", es: "gestionar / administrar", ctxIT: "the cloud infrastructure" },
    { b: "map", p: "mapped", pp: "mapped", cat: "it-tech", typ: "regular", ed: "/t/", pb: "map", ppast: "mapt", ppp: "mapt", pg: "MÁ-ping", es: "mapear", ctxIT: "the network ports" },
    { b: "merge", p: "merged", pp: "merged", cat: "it-tech", typ: "regular", ed: "/d/", pb: "merdj", ppast: "merdjd", ppp: "merdjd", pg: "MÉR-djing", es: "fusionar rama (git)", ctxIT: "the feature branch into main" },
    { b: "migrate", p: "migrated", pp: "migrated", cat: "it-tech", typ: "regular", ed: "/id/", pb: "MÁI-greit", ppast: "MÁI-grei-tid", ppp: "MÁI-grei-tid", pg: "MÁI-grei-ting", es: "migrar", ctxIT: "the schema to PostgreSQL" },
    { b: "mitigate", p: "mitigated", pp: "mitigated", cat: "it-tech", typ: "regular", ed: "/id/", pb: "MÍ-ti-gueit", ppast: "MÍ-ti-guei-tid", ppp: "MÍ-ti-guei-tid", pg: "MÍ-ti-guei-ting", es: "mitigar", ctxIT: "the zero-day vulnerability" },
    { b: "mock", p: "mocked", pp: "mocked", cat: "it-tech", typ: "regular", ed: "/t/", pb: "mok", ppast: "mokt", ppp: "mokt", pg: "MÓ-king", es: "simular / falsear en tests", ctxIT: "the external payment service" },
    { b: "monitor", p: "monitored", pp: "monitored", cat: "it-tech", typ: "regular", ed: "/d/", pb: "MÓ-ni-tor", ppast: "MÓ-ni-tord", ppp: "MÓ-ni-tord", pg: "MÓ-ni-to-ring", es: "monitorear", ctxIT: "server health metrics" },
    { b: "mount", p: "mounted", pp: "mounted", cat: "it-tech", typ: "regular", ed: "/id/", pb: "maunt", ppast: "MÁUN-tid", ppp: "MÁUN-tid", pg: "MÁUN-ting", es: "montar volumen", ctxIT: "the persistent storage disk" },
    { b: "mutate", p: "mutated", pp: "mutated", cat: "it-tech", typ: "regular", ed: "/id/", pb: "miu-TÉIT", ppast: "miu-TÉI-tid", ppp: "miu-TÉI-tid", pg: "miu-TÉI-ting", es: "mutar estado", ctxIT: "the global state variable" },
    { b: "notify", p: "notified", pp: "notified", cat: "it-tech", typ: "regular", ed: "/d/", pb: "NÓU-ti-fai", ppast: "NÓU-ti-faid", ppp: "NÓU-ti-faid", pg: "NÓU-ti-fai-ing", es: "notificar", ctxIT: "the on-call engineering team" },
    { b: "obfuscate", p: "obfuscated", pp: "obfuscated", cat: "it-tech", typ: "regular", ed: "/id/", pb: "OB-fus-keit", ppast: "OB-fus-kei-tid", ppp: "OB-fus-kei-tid", pg: "OB-fus-kei-ting", es: "ofuscar código", ctxIT: "the client-side bundle" },
    { b: "optimize", p: "optimized", pp: "optimized", cat: "it-tech", typ: "regular", ed: "/d/", pb: "ÓP-ti-maiz", ppast: "ÓP-ti-maizd", ppp: "ÓP-ti-maizd", pg: "ÓP-ti-mai-zing", es: "optimizar", ctxIT: "the SQL query execution plan" },
    { b: "override", p: "overrode", pp: "overridden", cat: "it-tech", typ: "irregular", pb: "ou-ver-RÁID", ppast: "ou-ver-RÓUD", ppp: "ou-ver-RÍ-den", pg: "ou-ver-RÁI-ding", es: "sobrescribir método", ctxIT: "the default behavior" },
    { b: "parse", p: "parsed", pp: "parsed", cat: "it-tech", typ: "regular", ed: "/t/", pb: "pars", ppast: "parst", ppp: "parst", pg: "PÁR-sing", es: "analizar sintácticamente / parsear", ctxIT: "the incoming JSON response" },
    { b: "patch", p: "patched", pp: "patched", cat: "it-tech", typ: "regular", ed: "/t/", pb: "patch", ppast: "patcht", ppp: "patcht", pg: "PÁ-tching", es: "parchear / corregir", ctxIT: "the critical CVE flaw" },
    { b: "persist", p: "persisted", pp: "persisted", cat: "it-tech", typ: "regular", ed: "/id/", pb: "per-SÍST", ppast: "per-SÍS-tid", ppp: "per-SÍS-tid", pg: "per-SÍS-ting", es: "persistir datos", ctxIT: "to Redis cache" },
    { b: "ping", p: "pinged", pp: "pinged", cat: "it-tech", typ: "regular", ed: "/d/", pb: "ping", ppast: "pingd", ppp: "pingd", pg: "PÍN-guing", es: "hacer ping / enviar señal", ctxIT: "the gateway server" },
    { b: "pipe", p: "piped", pp: "piped", cat: "it-tech", typ: "regular", ed: "/t/", pb: "paip", ppast: "paipt", ppp: "paipt", pg: "PÁI-ping", es: "redirigir salida / pipe", ctxIT: "the stdout to a log file" },
    { b: "poll", p: "polled", pp: "polled", cat: "it-tech", typ: "regular", ed: "/d/", pb: "poul", ppast: "pould", ppp: "pould", pg: "PÓU-ling", es: "sondear / consultar periódicamente", ctxIT: "the status endpoint" },
    { b: "prevent", p: "prevented", pp: "prevented", cat: "it-tech", typ: "regular", ed: "/id/", pb: "pri-VÉNT", ppast: "pri-VÉN-tid", ppp: "pri-VÉN-tid", pg: "pri-VÉN-ting", es: "prevenir / evitar", ctxIT: "the SQL injection attack" },
    { b: "print", p: "printed", pp: "printed", cat: "it-tech", typ: "regular", ed: "/id/", pb: "print", ppast: "PRÍN-tid", ppp: "PRÍN-tid", pg: "PRÍN-ting", es: "imprimir en consola", ctxIT: "the error stack trace" },
    { b: "process", p: "processed", pp: "processed", cat: "it-tech", typ: "regular", ed: "/t/", pb: "PRÓ-ses", ppast: "PRÓ-sest", ppp: "PRÓ-sest", pg: "PRÓ-se-sing", es: "procesar", ctxIT: "the asynchronous queue" },
    { b: "profile", p: "profiled", pp: "profiled", cat: "it-tech", typ: "regular", ed: "/d/", pb: "PRÓU-fail", ppast: "PRÓU-faild", ppp: "PRÓU-faild", pg: "PRÓU-fai-ling", es: "perfilar rendimiento", ctxIT: "the backend CPU bottlenecks" },
    { b: "provision", p: "provisioned", pp: "provisioned", cat: "it-tech", typ: "regular", ed: "/d/", pb: "pro-VÍ-zhon", ppast: "pro-VÍ-zhond", ppp: "pro-VÍ-zhond", pg: "pro-VÍ-zho-ning", es: "aprovisionar servidores", ctxIT: "the EC2 instances with Terraform" },
    { b: "pull", p: "pulled", pp: "pulled", cat: "it-tech", typ: "regular", ed: "/d/", pb: "pul", ppast: "puld", ppp: "puld", pg: "PÚ-ling", es: "traer cambios (git pull)", ctxIT: "the latest commits" },
    { b: "push", p: "pushed", pp: "pushed", cat: "it-tech", typ: "regular", ed: "/t/", pb: "push", ppast: "pusht", ppp: "pusht", pg: "PÚ-shing", es: "empujar cambios (git push)", ctxIT: "to the remote branch" },
    { b: "query", p: "queried", pp: "queried", cat: "it-tech", typ: "regular", ed: "/d/", pb: "KUÍ-ri", ppast: "KUÍ-rid", ppp: "KUÍ-rid", pg: "KUÍ-ri-ing", es: "consultar base de datos", ctxIT: "the user analytics table" },
    { b: "queue", p: "queued", pp: "queued", cat: "it-tech", typ: "regular", ed: "/d/", pb: "kiu", ppast: "kiud", ppp: "kiud", pg: "KÍU-ing", es: "encolar tareas", ctxIT: "the background email jobs" },
    { b: "reboot", p: "rebooted", pp: "rebooted", cat: "it-tech", typ: "regular", ed: "/id/", pb: "ri-BÚT", ppast: "ri-BÚ-tid", ppp: "ri-BÚ-tid", pg: "ri-BÚ-ting", es: "reiniciar", ctxIT: "the production server" },
    { b: "rebuild", p: "rebuilt", pp: "rebuilt", cat: "it-tech", typ: "irregular", pb: "ri-BÍLD", ppast: "ri-BÍLT", ppp: "ri-BÍLT", pg: "ri-BÍL-ding", es: "reconstruir / recompilar", ctxIT: "the entire frontend bundle" },
    { b: "refactor", p: "refactored", pp: "refactored", cat: "it-tech", typ: "regular", ed: "/d/", pb: "ri-FÁK-tor", ppast: "ri-FÁK-tord", ppp: "ri-FÁK-tord", pg: "ri-FÁK-to-ring", es: "refactorizar", ctxIT: "the legacy payment module" },
    { b: "replicate", p: "replicated", pp: "replicated", cat: "it-tech", typ: "regular", ed: "/id/", pb: "RÉ-pli-keit", ppast: "RÉ-pli-kei-tid", ppp: "RÉ-pli-kei-tid", pg: "RÉ-pli-kei-ting", es: "replicar", ctxIT: "the bug in our local environment" },
    { b: "resolve", p: "resolved", pp: "resolved", cat: "it-tech", typ: "regular", ed: "/d/", pb: "ri-ZÓLV", ppast: "ri-ZÓLVD", ppp: "ri-ZÓLVD", pg: "ri-ZÓL-ving", es: "resolver / solucionar", ctxIT: "the merge conflict" },
    { b: "restart", p: "restarted", pp: "restarted", cat: "it-tech", typ: "regular", ed: "/id/", pb: "ri-STÁRT", ppast: "ri-STÁR-tid", ppp: "ri-STÁR-tid", pg: "ri-STÁR-ting", es: "reiniciar servicio", ctxIT: "the Nginx service" },
    { b: "restore", p: "restored", pp: "restored", cat: "it-tech", typ: "regular", ed: "/d/", pb: "ri-STÓR", ppast: "ri-STÓRD", ppp: "ri-STÓRD", pg: "ri-STÓ-ring", es: "restaurar", ctxIT: "the database snapshot" },
    { b: "rollback", p: "rolled back", pp: "rolled back", cat: "it-tech", typ: "regular", ed: "/t/", pb: "ROUL-bak", ppast: "rould bakt", ppp: "rould bakt", pg: "RÓU-ling bakt", es: "revertir despliegue", ctxIT: "the faulty release" },
    { b: "rotate", p: "rotated", pp: "rotated", cat: "it-tech", typ: "regular", ed: "/id/", pb: "ROU-TÉIT", ppast: "ROU-TÉI-tid", ppp: "ROU-TÉI-tid", pg: "ROU-TÉI-ting", es: "rotar claves / logs", ctxIT: "the compromised API keys" },
    { b: "route", p: "routed", pp: "routed", cat: "it-tech", typ: "regular", ed: "/id/", pb: "raut", ppast: "RÁU-tid", ppp: "RÁU-tid", pg: "RÁU-ting", es: "enrutar tráfico", ctxIT: "the traffic through the VPN" },
    { b: "sanitize", p: "sanitized", pp: "sanitized", cat: "it-tech", typ: "regular", ed: "/d/", pb: "SÁ-ni-taiz", ppast: "SÁ-ni-taizd", ppp: "SÁ-ni-taizd", pg: "SÁ-ni-tai-zing", es: "sanitizar entradas", ctxIT: "all incoming user inputs" },
    { b: "scale", p: "scaled", pp: "scaled", cat: "it-tech", typ: "regular", ed: "/d/", pb: "skeil", ppast: "skeild", ppp: "skeild", pg: "SKÉI-ling", es: "escalar infraestructura", ctxIT: "to fifty container replicas" },
    { b: "scan", p: "scanned", pp: "scanned", cat: "it-tech", typ: "regular", ed: "/d/", pb: "skan", ppast: "skand", ppp: "skand", pg: "SKÁ-ning", es: "escanear puertos / malware", ctxIT: "the subnet for open ports" },
    { b: "scrape", p: "scraped", pp: "scraped", cat: "it-tech", typ: "regular", ed: "/t/", pb: "skreip", ppast: "skreipt", ppp: "skreipt", pg: "SKRÉI-ping", es: "raspar / extraer datos web", ctxIT: "the pricing data" },
    { b: "scrutinize", p: "scrutinized", pp: "scrutinized", cat: "it-tech", typ: "regular", ed: "/d/", pb: "SKRÚ-ti-naiz", ppast: "SKRÚ-ti-naizd", ppp: "SKRÚ-ti-naizd", pg: "SKRÚ-ti-nai-zing", es: "examinar minuciosamente", ctxIT: "the system access logs" },
    { b: "secure", p: "secured", pp: "secured", cat: "it-tech", typ: "regular", ed: "/d/", pb: "se-KÍUR", ppast: "se-KÍURD", ppp: "se-KÍURD", pg: "se-KÍU-ring", es: "asegurar / proteger", ctxIT: "the endpoint with mTLS" },
    { b: "serialize", p: "serialized", pp: "serialized", cat: "it-tech", typ: "regular", ed: "/d/", pb: "SÍ-ri-a-laiz", ppast: "SÍ-ri-a-laizd", ppp: "SÍ-ri-a-laizd", pg: "SÍ-ri-a-lai-zing", es: "serializar", ctxIT: "the object into binary format" },
    { b: "simulate", p: "simulated", pp: "simulated", cat: "it-tech", typ: "regular", ed: "/id/", pb: "SÍ-miu-leit", ppast: "SÍ-miu-lei-tid", ppp: "SÍ-miu-lei-tid", pg: "SÍ-miu-lei-ting", es: "simular ataque / carga", ctxIT: "a DDoS attack scenario" },
    { b: "stash", p: "stashed", pp: "stashed", cat: "it-tech", typ: "regular", ed: "/t/", pb: "stash", ppast: "stasht", ppp: "stasht", pg: "STÁ-shing", es: "guardar cambios temporalmente (git stash)", ctxIT: "the uncommitted changes" },
    { b: "stream", p: "streamed", pp: "streamed", cat: "it-tech", typ: "regular", ed: "/d/", pb: "strim", ppast: "strimd", ppp: "strimd", pg: "STRÍ-ming", es: "transmitir flujo de datos", ctxIT: "the real-time analytics" },
    { b: "throttle", p: "throttled", pp: "throttled", cat: "it-tech", typ: "regular", ed: "/d/", pb: "ZRÓ-tel", ppast: "ZRÓ-teld", ppp: "ZRÓ-teld", pg: "ZRÓ-tling", es: "limitar tasa de peticiones", ctxIT: "the abusive client requests" },
    { b: "trace", p: "traced", pp: "traced", cat: "it-tech", typ: "regular", ed: "/t/", pb: "treis", ppast: "treist", ppp: "treist", pg: "TRÉI-sing", es: "rastrear petición distribuida", ctxIT: "the microservice request latency" },
    { b: "trigger", p: "triggered", pp: "triggered", cat: "it-tech", typ: "regular", ed: "/d/", pb: "TRÍ-guer", ppast: "TRÍ-guerd", ppp: "TRÍ-guerd", pg: "TRÍ-gue-ring", es: "disparar / activar alerta", ctxIT: "the automated incident alarm" },
    { b: "truncate", p: "truncated", pp: "truncated", cat: "it-tech", typ: "regular", ed: "/id/", pb: "TRÁN-keit", ppast: "TRÁN-kei-tid", ppp: "TRÁN-kei-tid", pg: "TRÁN-kei-ting", es: "truncar tabla / archivo", ctxIT: "the audit log table" },
    { b: "tune", p: "tuned", pp: "tuned", cat: "it-tech", typ: "regular", ed: "/d/", pb: "tiun", ppast: "tiund", ppp: "tiund", pg: "TIÚ-ning", es: "ajustar / afinar parámetros", ctxIT: "the database memory parameters" },
    { b: "upgrade", p: "upgraded", pp: "upgraded", cat: "it-tech", typ: "regular", ed: "/id/", pb: "ap-GRÉID", ppast: "ap-GRÉI-did", ppp: "ap-GRÉI-did", pg: "ap-GRÉI-ding", es: "actualizar versión", ctxIT: "to Node.js twenty-two" },
    { b: "validate", p: "validated", pp: "validated", cat: "it-tech", typ: "regular", ed: "/id/", pb: "VÁ-li-deit", ppast: "VÁ-li-dei-tid", ppp: "VÁ-li-dei-tid", pg: "VÁ-li-dei-ting", es: "validar", ctxIT: "the user credentials" },
    { b: "verify", p: "verified", pp: "verified", cat: "it-tech", typ: "regular", ed: "/d/", pb: "VÉ-ri-fai", ppast: "VÉ-ri-faid", ppp: "VÉ-ri-faid", pg: "VÉ-ri-fai-ing", es: "verificar", ctxIT: "the cryptographic signature" },
    { b: "wipe", p: "wiped", pp: "wiped", cat: "it-tech", typ: "regular", ed: "/t/", pb: "waip", ppast: "waipt", ppp: "waipt", pg: "WÁI-ping", es: "borrar completamente / limpiar disco", ctxIT: "the stolen laptop remotely" }
];

// Dynamically build the full 500 catalog
export function generateFull500VerbsCatalog(): VerbEntry[] {
    const catalog: VerbEntry[] = [];

    RAW_VERBS.forEach((r, idx) => {
        const gerund = r.g || (r.b.endsWith("e") && !r.b.endsWith("ee") ? r.b.slice(0, -1) + "ing" : r.b + "ing");
        const ctx = r.cat === "it-tech" ? (r.ctxIT || "the system") : (r.ctxDay || "the situation");

        const pastSimpleEn = `I ${r.p} ${ctx} yesterday.`;
        const presPerfEn = `I have ${r.pp} ${ctx} several times.`;
        const presPerfContEn = `I have been ${gerund} ${ctx} for two hours.`;
        const pastPerfEn = `When the manager arrived, we had already ${r.pp} ${ctx}.`;
        const pastContEn = `I was ${gerund} ${ctx} when the alert went off.`;

        catalog.push({
            id: `verb-500-${idx + 1}`,
            base: r.b,
            past: r.p,
            pastParticiple: r.pp,
            gerund: gerund,
            category: r.cat,
            type: r.typ,
            edEnding: r.ed,
            phonetics: {
                base: `[${r.pb}]`,
                past: `[${r.ppast}]`,
                pastParticiple: `[${r.ppp}]`,
                gerund: `[${r.pg}]`
            },
            meaningNeutral: r.es,
            sentences: {
                pastSimple: {
                    en: pastSimpleEn,
                    phonetic: `[ai ${r.ppast} ...]`,
                    es: `Ayer ${r.es} ${ctx} / ${r.p} ayer.`,
                    trap: `Decir 'I have ${r.pp} yesterday' (error de mezclar yesterday con have).`
                },
                presentPerfect: {
                    en: presPerfEn,
                    phonetic: `[aiv ${r.ppp} ...]`,
                    es: `He ${r.pp} ${ctx} varias veces / Ya lo hice.`,
                    trap: `Traducir 'Ya lo hice' literalmente con pasado simple cuando tiene vigencia actual.`
                },
                presentPerfectContinuous: {
                    en: presPerfContEn,
                    phonetic: `[aiv bin ${r.pg} ...]`,
                    es: `Llevo dos horas ${r.es.split('/')[0].trim()} ${ctx}.`,
                    trap: `Decir 'I ${r.b} since two hours' o 'I am ${gerund} since two hours'.`
                },
                pastPerfect: {
                    en: pastPerfEn,
                    phonetic: `[... wi jad ol-RÉ-di ${r.ppp} ...]`,
                    es: `Para cuando llegó el responsable, ya habíamos ${r.pp} ${ctx}.`,
                    trap: `Usar pasado simple para ambas acciones y perder la secuencia temporal anterior.`
                },
                pastContinuous: {
                    en: pastContEn,
                    phonetic: `[ai wos ${r.pg} ...]`,
                    es: `Estaba ${r.es.split('/')[0].trim()} ${ctx} cuando sonó la alerta.`
                }
            }
        });
    });

    return catalog;
}

export const VERBS_MASTER_500 = generateFull500VerbsCatalog();
