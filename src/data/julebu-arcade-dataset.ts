export interface ArcadeChallenge {
    id: string;
    missionId: string;
    category: 'cybersecurity' | 'webdev' | 'businessIntelligence' | 'devops' | 'everydayLife' | 'coreHighFrequency';
    categoryLabel: string;
    level: 'A2' | 'B1' | 'B2' | 'C1';
    english: string;
    spanish: string;
    phonetic: string;
    keyTerms: string[];
    distractors: string[]; // Distractor words for word ordering mode
    blankWord: string;     // Target word to remove for cloze / fill in the blanks
    blankOptions?: string[]; // Multiple choice options for cloze mode
    audioDistractors: string[]; // 3 tricky phonetic/grammatical options for listening selection
    grammarTip?: string;   // Cognitive explanation / anti-translation note
}

export interface ArcadeMission {
    id: string;
    title: string;
    category: 'cybersecurity' | 'webdev' | 'businessIntelligence' | 'devops' | 'everydayLife' | 'coreHighFrequency';
    categoryName: string;
    icon: string;
    level: 'A2' | 'B1' | 'B2' | 'C1';
    description: string;
    estimatedMinutes: number;
    challengeIds: string[];
}

export const ARCADE_DATASET: ArcadeChallenge[] = [
    // ==========================================
    // 1. CYBERSECURITY & SOC INCIDENT TRIAGE
    // ==========================================
    {
        id: "cyber-1",
        missionId: "mission-cyber-incident",
        category: "cybersecurity",
        categoryLabel: "Ciberseguridad & SOC",
        level: "B2",
        english: "The security team isolated the compromised database to contain the breach immediately.",
        spanish: "El equipo de seguridad aisló la base de datos comprometida para contener la brecha de inmediato.",
        phonetic: "de sekiúriti tim áisoleited de cómpromaisd déirabeis tu contein de brich imídiatli",
        keyTerms: ["isolated", "compromised database", "contain the breach", "immediately"],
        distractors: ["deleted", "encrypted", "attacked", "slowly"],
        blankWord: "contain",
        blankOptions: ["contain", "ignore", "expand", "publish"],
        audioDistractors: [
            "The security team isolated the compromised database to contain the breach immediately.",
            "The security team deleted the compromised database to expand the breach immediately.",
            "The security team is isolating the promised database for contain a bridge immediately."
        ],
        grammarTip: "Usamos 'to contain' (infinitivo de propósito) para expresar la finalidad de la acción: 'para contener'."
    },
    {
        id: "cyber-2",
        missionId: "mission-cyber-incident",
        category: "cybersecurity",
        categoryLabel: "Ciberseguridad & SOC",
        level: "B2",
        english: "We noticed anomalous outbound traffic heading towards an unverified external IP address.",
        spanish: "Notamos tráfico saliente anómalo que se dirigía hacia una dirección IP externa no verificada.",
        phonetic: "ui nóutist anómalos áutbaund tráfik jédin tuórds an ánverifaid ekstérnal ai-pi adrés",
        keyTerms: ["anomalous", "outbound traffic", "unverified", "external IP address"],
        distractors: ["inbound", "normal", "static", "firewall"],
        blankWord: "outbound",
        blankOptions: ["outbound", "outcast", "downlink", "inward"],
        audioDistractors: [
            "We noticed anomalous outbound traffic heading towards an unverified external IP address.",
            "We noticed anonymous outbound traffic heading towards an unverified internal IP address.",
            "We have notice anomalous inbound traffic heading to an verified external IP address."
        ],
        grammarTip: "'Heading towards' expresa dirección física o lógica ('dirigiéndose hacia')."
    },
    {
        id: "cyber-3",
        missionId: "mission-cyber-incident",
        category: "cybersecurity",
        categoryLabel: "Ciberseguridad & SOC",
        level: "B2",
        english: "The attacker attempted to bypass authentication by exploiting a blind SQL injection vulnerability.",
        spanish: "El atacante intentó evadir la autenticación explotando una vulnerabilidad de inyección SQL a ciegas.",
        phonetic: "de atáker atémted tu báipas ozenrikéishon bai eksplóitin a bláind es-kiu-el inyékshon volnerabíliri",
        keyTerms: ["bypass authentication", "exploiting", "blind SQL injection", "vulnerability"],
        distractors: ["password", "protecting", "fixing", "phishing"],
        blankWord: "bypass",
        blankOptions: ["bypass", "passby", "breakin", "override"],
        audioDistractors: [
            "The attacker attempted to bypass authentication by exploiting a blind SQL injection vulnerability.",
            "The attacker attempted to pass authentication by exploiting a blind SQL injection variable.",
            "The attacker has attempt to bypass authentication with exploit a blind SQL injection vulnerability."
        ],
        grammarTip: "Después de preposiciones como 'by' el verbo siempre va en gerundio: 'by exploiting' (mediante la explotación)."
    },
    {
        id: "cyber-4",
        missionId: "mission-cyber-incident",
        category: "cybersecurity",
        categoryLabel: "Ciberseguridad & SOC",
        level: "B2",
        english: "We must rotate all API keys and invalidate active session tokens without downtime.",
        spanish: "Debemos rotar todas las claves de API e invalidar los tokens de sesión activos sin tiempo de inactividad.",
        phonetic: "ui mast róuteit ol ei-pi-ái kis and inválideit áktiv séshon tóukens uizáut dáuntaim",
        keyTerms: ["rotate", "API keys", "invalidate", "session tokens", "downtime"],
        distractors: ["delete", "refresh", "passwords", "latency"],
        blankWord: "invalidate",
        blankOptions: ["invalidate", "destroy", "revalidate", "postpone"],
        audioDistractors: [
            "We must rotate all API keys and invalidate active session tokens without downtime.",
            "We must rotate all API keys and validate active session tokens with downtime.",
            "We need rotate all API keys and invalidate activity session tokens without downtime."
        ],
        grammarTip: "'Must' es un modal fuerte de obligación técnica. No lleva 'to': 'We must rotate' (y no 'We must to rotate')."
    },
    {
        id: "cyber-5",
        missionId: "mission-cyber-incident",
        category: "cybersecurity",
        categoryLabel: "Ciberseguridad & SOC",
        level: "C1",
        english: "The malware leveraged a zero-day exploit to escalate privileges across the internal network.",
        spanish: "El malware aprovechó un exploit de día cero para escalar privilegios a través de la red interna.",
        phonetic: "de máluer léverecht a zírou-dei éksploit tu éskaleit prívilyes akrós de intérnal nétuork",
        keyTerms: ["leveraged", "zero-day exploit", "escalate privileges", "internal network"],
        distractors: ["utilized", "decreased", "external", "patch"],
        blankWord: "escalate",
        blankOptions: ["escalate", "elevate", "reduce", "mitigate"],
        audioDistractors: [
            "The malware leveraged a zero-day exploit to escalate privileges across the internal network.",
            "The malware leveraged a zero-day exploit to evaluate privileges across the internet network.",
            "The malware was leverage a zero-day exploit for escalate privileges across the internal network."
        ],
        grammarTip: "'Leverage' en inglés técnico significa 'aprovechar al máximo / utilizar como palanca'."
    },
    {
        id: "cyber-6",
        missionId: "mission-cyber-incident",
        category: "cybersecurity",
        categoryLabel: "Ciberseguridad & SOC",
        level: "B2",
        english: "All sensitive customer data is strongly encrypted at rest using AES-256 standards.",
        spanish: "Todos los datos sensibles de clientes están fuertemente cifrados en reposo usando estándares AES-256.",
        phonetic: "ol sénsitiv kástomer déira is stróngli enkrípted at rest iúsin ei-i-es tu-fífti-siks stándards",
        keyTerms: ["sensitive data", "encrypted at rest", "AES-256", "standards"],
        distractors: ["in transit", "unlocked", "plain text", "stored"],
        blankWord: "encrypted",
        blankOptions: ["encrypted", "encoded", "hashed", "compressed"],
        audioDistractors: [
            "All sensitive customer data is strongly encrypted at rest using AES-256 standards.",
            "All sensitive customer data is strongly encrypted in transit using AES-256 standards.",
            "All sensible customer data is strongly encrypted at rest using AES-256 standards."
        ],
        grammarTip: "'Sensitive' significa sensible o confidencial. 'Sensible' en inglés es un falso amigo y significa 'sensato / razonable'."
    },
    {
        id: "cyber-7",
        missionId: "mission-cyber-incident",
        category: "cybersecurity",
        categoryLabel: "Ciberseguridad & SOC",
        level: "C1",
        english: "Our forensic analysis determined that the threat actor gained initial access through spear phishing.",
        spanish: "Nuestro análisis forense determinó que el actor de amenaza obtuvo acceso inicial mediante phishing dirigido.",
        phonetic: "áur forénsik análisis dirérmind dat de zret áktor gueind iníshal ákses zru spir físhin",
        keyTerms: ["forensic analysis", "threat actor", "initial access", "spear phishing"],
        distractors: ["firewall", "brute force", "malware", "terminal"],
        blankWord: "spear",
        blankOptions: ["spear", "whale", "bait", "hook"],
        audioDistractors: [
            "Our forensic analysis determined that the threat actor gained initial access through spear phishing.",
            "Our forensic analysis determined that the threat actor gained initial access through spam fishing.",
            "Our forensic analyse determined that the threat actor gain initial access through spear phishing."
        ],
        grammarTip: "'Threat actor' es el término estándar para referirse al atacante o grupo cibernético."
    },
    {
        id: "cyber-8",
        missionId: "mission-cyber-incident",
        category: "cybersecurity",
        categoryLabel: "Ciberseguridad & SOC",
        level: "B2",
        english: "We need to enforce multi-factor authentication for all remote administrative endpoints.",
        spanish: "Necesitamos exigir autenticación multifactor para todos los endpoints administrativos remotos.",
        phonetic: "ui nid tu enfórs málti-fáktor ozenrikéishon for ol rimóut admínistretiv éndpoints",
        keyTerms: ["enforce", "multi-factor authentication", "remote", "administrative endpoints"],
        distractors: ["disable", "optional", "passwords", "local"],
        blankWord: "enforce",
        blankOptions: ["enforce", "reinforce", "suggest", "permit"],
        audioDistractors: [
            "We need to enforce multi-factor authentication for all remote administrative endpoints.",
            "We need to enhance multi-factor authentication for all remote administrative entry points.",
            "We need enforce multi-factor authentication for all remote administrative endpoints."
        ],
        grammarTip: "'Enforce' significa aplicar obligatoriamente una política o regla de seguridad."
    },

    // ==========================================
    // 2. WEB DEVELOPMENT & FULL STACK ARCHITECTURE
    // ==========================================
    {
        id: "web-1",
        missionId: "mission-webdev-architecture",
        category: "webdev",
        categoryLabel: "Desarrollo Web & Cloud",
        level: "B1",
        english: "We implemented client-side caching to reduce latency and improve initial page load times.",
        spanish: "Implementamos almacenamiento en caché del lado del cliente para reducir la latencia y mejorar los tiempos de carga inicial.",
        phonetic: "ui ímplemented kláient-sáid káshin tu ridiús léirensi and imprúv iníshal péich loud táims",
        keyTerms: ["implemented", "client-side caching", "reduce latency", "page load times"],
        distractors: ["server-side", "increase", "bandwidth", "database"],
        blankWord: "latency",
        blankOptions: ["latency", "bandwidth", "redundancy", "throughput"],
        audioDistractors: [
            "We implemented client-side caching to reduce latency and improve initial page load times.",
            "We implemented client-side caching to reduce memory and improve initial page load times.",
            "We have implement client-side cache to reduce latency and improve initial page load times."
        ],
        grammarTip: "'Client-side' vs 'server-side': se usan como adjetivos compuestos antes del sustantivo."
    },
    {
        id: "web-2",
        missionId: "mission-webdev-architecture",
        category: "webdev",
        categoryLabel: "Desarrollo Web & Cloud",
        level: "B2",
        english: "The backend server threw a CORS error because the preflight OPTIONS request was rejected.",
        spanish: "El servidor backend arrojó un error de CORS porque la solicitud preliminar OPTIONS fue rechazada.",
        phonetic: "de bákend sérver zru a kors érror bikós de príflait ópshons rikuést uás riyékted",
        keyTerms: ["backend server", "CORS error", "preflight request", "OPTIONS", "rejected"],
        distractors: ["accepted", "status 200", "payload", "frontend"],
        blankWord: "preflight",
        blankOptions: ["preflight", "preliminary", "preview", "postflight"],
        audioDistractors: [
            "The backend server threw a CORS error because the preflight OPTIONS request was rejected.",
            "The backend server drew a CORS error because the flight OPTIONS request was rejected.",
            "The backend server threw an CORE error because the preflight OPTIONS request were rejected."
        ],
        grammarTip: "'Threw' es el pasado simple irregular de 'throw' (throw -> threw -> thrown). En programación: 'threw an error'."
    },
    {
        id: "web-3",
        missionId: "mission-webdev-architecture",
        category: "webdev",
        categoryLabel: "Desarrollo Web & Cloud",
        level: "B2",
        english: "We need to optimize the database query by creating a composite index on frequently filtered columns.",
        spanish: "Necesitamos optimizar la consulta a la base de datos creando un índice compuesto en las columnas frecuentemente filtradas.",
        phonetic: "ui nid tu óptimaiz de déirabeis kuíri bai kriéitin a compósit índeks on fríkuentli fílterd kóloms",
        keyTerms: ["optimize", "database query", "composite index", "filtered columns"],
        distractors: ["primary key", "foreign key", "deleting", "table"],
        blankWord: "composite",
        blankOptions: ["composite", "compound", "combined", "clustered"],
        audioDistractors: [
            "We need to optimize the database query by creating a composite index on frequently filtered columns.",
            "We need to optimize the database query by creating a complex index on frequently filtered columns.",
            "We need to optimize the database query with create a composite index on frequent filtered columns."
        ],
        grammarTip: "'Composite index' es un índice que abarca múltiples columnas en SQL."
    },
    {
        id: "web-4",
        missionId: "mission-webdev-architecture",
        category: "webdev",
        categoryLabel: "Desarrollo Web & Cloud",
        level: "B2",
        english: "Server-side rendering significantly boosts SEO performance and ensures faster First Contentful Paint.",
        spanish: "El renderizado del lado del servidor impulsa significativamente el rendimiento SEO y asegura un Primer Despliegue de Contenido más rápido.",
        phonetic: "sérver-sáid rénderin signífikantli busts es-i-ou perfórmans and enshúrs fáster ferst konténtful peint",
        keyTerms: ["server-side rendering", "boosts", "SEO performance", "First Contentful Paint"],
        distractors: ["slows down", "hydration", "client-side", "bundle"],
        blankWord: "boosts",
        blankOptions: ["boosts", "drops", "hinders", "bypasses"],
        audioDistractors: [
            "Server-side rendering significantly boosts SEO performance and ensures faster First Contentful Paint.",
            "Server-side rendering significantly pushes SEO performance and ensures faster First Content Paint.",
            "Server-side render significantly boost SEO performance and ensure faster First Contentful Paint."
        ],
        grammarTip: "'Boost' significa impulsar, aumentar con energía (sinónimo de enhance o elevate)."
    },
    {
        id: "web-5",
        missionId: "mission-webdev-architecture",
        category: "webdev",
        categoryLabel: "Desarrollo Web & Cloud",
        level: "B2",
        english: "We should apply rate limiting to prevent brute force attacks and throttle excessive API requests.",
        spanish: "Deberíamos aplicar limitación de tasa para prevenir ataques de fuerza bruta y regular solicitudes excesivas de API.",
        phonetic: "ui shud aplái reit límirin tu privént brut fors atáks and zrórol eksésiv ei-pi-ái rikuésts",
        keyTerms: ["rate limiting", "brute force", "throttle", "excessive requests"],
        distractors: ["speed up", "unlimited", "authentication", "bandwidth"],
        blankWord: "throttle",
        blankOptions: ["throttle", "accelerate", "dispatch", "bottleneck"],
        audioDistractors: [
            "We should apply rate limiting to prevent brute force attacks and throttle excessive API requests.",
            "We should apply rate limiting to prevent brute force attacks and bottle excessive API requests.",
            "We should apply rate limits to prevent brute force attacks and throttle excess API request."
        ],
        grammarTip: "'Throttle' en ingeniería de software significa estrangular o limitar deliberadamente el flujo de peticiones."
    },
    {
        id: "web-6",
        missionId: "mission-webdev-architecture",
        category: "webdev",
        categoryLabel: "Desarrollo Web & Cloud",
        level: "C1",
        english: "The application relies on Redis for distributed session management and pub/sub messaging across microservices.",
        spanish: "La aplicación se apoya en Redis para la gestión de sesiones distribuidas y mensajería pub/sub entre microservicios.",
        phonetic: "de aplikéishon riláis on rédis for distríbiured séshon mánayment and pab-sab mésayin akrós máikrou-sérvises",
        keyTerms: ["relies on", "Redis", "distributed session", "pub/sub messaging", "microservices"],
        distractors: ["monolith", "SQL", "hardcoded", "cookies"],
        blankWord: "relies",
        blankOptions: ["relies", "depends", "focuses", "insists"],
        audioDistractors: [
            "The application relies on Redis for distributed session management and pub/sub messaging across microservices.",
            "The application replies on Redis for distributed session management and pub/sub messaging across microservices.",
            "The application rely on Redis for distributed session management and pub/sub messaging across microservices."
        ],
        grammarTip: "'Rely on' es un phrasal verb indispensable que significa 'depender de / confiar en'."
    },

    // ==========================================
    // 3. BUSINESS INTELLIGENCE & DATA ENGINEERING
    // ==========================================
    {
        id: "bi-1",
        missionId: "mission-bi-data-pipelines",
        category: "businessIntelligence",
        categoryLabel: "Business Intelligence & Data",
        level: "B2",
        english: "The scheduled ETL pipeline failed during the transformation stage due to a schema mismatch.",
        spanish: "El pipeline ETL programado falló durante la etapa de transformación debido a una discrepancia de esquema.",
        phonetic: "de skédyuld i-ti-el páiplain feild diúrin de transforméishon stéich diu tu a skíma mísmach",
        keyTerms: ["scheduled", "ETL pipeline", "transformation stage", "schema mismatch"],
        distractors: ["extraction", "loading", "successful", "warehouse"],
        blankWord: "mismatch",
        blankOptions: ["mismatch", "match", "collision", "overload"],
        audioDistractors: [
            "The scheduled ETL pipeline failed during the transformation stage due to a schema mismatch.",
            "The scheduled ETL pipeline failed during the transmission stage due to a schema mismatch.",
            "The schedule ETL pipeline fail during the transformation stage due to a schema mismatch."
        ],
        grammarTip: "'Due to' se traduce como 'debido a'. Siempre va seguido de un sustantivo o frase nominal ('due to a schema mismatch')."
    },
    {
        id: "bi-2",
        missionId: "mission-bi-data-pipelines",
        category: "businessIntelligence",
        categoryLabel: "Business Intelligence & Data",
        level: "B2",
        english: "We created calculated DAX measures to aggregate monthly recurring revenue by customer segment.",
        spanish: "Creamos medidas calculadas en DAX para agregar los ingresos recurrentes mensuales por segmento de clientes.",
        phonetic: "ui kriéited kálkiuleited daks méshurs tu ágregueit mánzli rikérrin réveniu bai kástomer ségment",
        keyTerms: ["calculated measures", "DAX", "aggregate", "recurring revenue", "customer segment"],
        distractors: ["tables", "columns", "churn", "subtract"],
        blankWord: "aggregate",
        blankOptions: ["aggregate", "disperse", "separate", "filter"],
        audioDistractors: [
            "We created calculated DAX measures to aggregate monthly recurring revenue by customer segment.",
            "We created calculate DAX measures to appreciate monthly recurring revenue by customer segment.",
            "We have create calculated DAX measures for aggregate monthly recurring revenue by customer segment."
        ],
        grammarTip: "'Aggregate' como verbo significa consolidar/sumarizar datos de múltiples filas."
    },
    {
        id: "bi-3",
        missionId: "mission-bi-data-pipelines",
        category: "businessIntelligence",
        categoryLabel: "Business Intelligence & Data",
        level: "B2",
        english: "Our data warehouse uses a star schema architecture with dedicated fact and dimension tables.",
        spanish: "Nuestro almacén de datos utiliza una arquitectura de esquema en estrella con tablas de hechos y dimensiones dedicadas.",
        phonetic: "áur déira uérjaus iúses a star skíma árkitekcher uiz dédikeited fakt and diménshon téibols",
        keyTerms: ["data warehouse", "star schema", "fact tables", "dimension tables"],
        distractors: ["snowflake", "unstructured", "lakehouse", "relational"],
        blankWord: "fact",
        blankOptions: ["fact", "truth", "event", "metric"],
        audioDistractors: [
            "Our data warehouse uses a star schema architecture with dedicated fact and dimension tables.",
            "Our data warehouse uses a start schema architecture with dedicated fast and dimension tables.",
            "Our data warehouse use an star schema architecture with dedicated fact and dimension tables."
        ],
        grammarTip: "En modelado dimensional, 'fact tables' contienen métricas numéricas y 'dimension tables' los atributos de contexto."
    },
    {
        id: "bi-4",
        missionId: "mission-bi-data-pipelines",
        category: "businessIntelligence",
        categoryLabel: "Business Intelligence & Data",
        level: "B2",
        english: "We must clean the raw dataset and eliminate statistical outliers before training the model.",
        spanish: "Debemos limpiar el conjunto de datos crudo y eliminar valores atípicos estadísticos antes de entrenar el modelo.",
        phonetic: "ui mast klin de ro déiraset and ilímineit statístikal áutlaiers bifór tréinin de mórel",
        keyTerms: ["raw dataset", "eliminate", "statistical outliers", "training the model"],
        distractors: ["impute", "averages", "overfitting", "test"],
        blankWord: "outliers",
        blankOptions: ["outliers", "averages", "medians", "inliers"],
        audioDistractors: [
            "We must clean the raw dataset and eliminate statistical outliers before training the model.",
            "We must clean the raw data set and illuminate statistical outlines before training the model.",
            "We must clean the row dataset and eliminate statistical outliers before train the model."
        ],
        grammarTip: "'Outliers' son datos atípicos que se desvían de la norma estadística."
    },
    {
        id: "bi-5",
        missionId: "mission-bi-data-pipelines",
        category: "businessIntelligence",
        categoryLabel: "Business Intelligence & Data",
        level: "C1",
        english: "The executive dashboard allows stakeholders to drill down into regional sales performance in real time.",
        spanish: "El panel ejecutivo permite a los directivos profundizar en el rendimiento de ventas regional en tiempo real.",
        phonetic: "de egzékiutiv dáshbord aláus stéikjoulders tu dril daun íntu ríyonal seils perfórmans in rial taim",
        keyTerms: ["executive dashboard", "stakeholders", "drill down", "sales performance", "real time"],
        distractors: ["zoom out", "aggregate", "static", "export"],
        blankWord: "drill down",
        blankOptions: ["drill down", "roll up", "skim through", "cut off"],
        audioDistractors: [
            "The executive dashboard allows stakeholders to drill down into regional sales performance in real time.",
            "The executive dashboard allows shareholders to draw down into regional sales performance in real time.",
            "The executive dashboard allow stakeholders for drill down into regional sales performance in real time."
        ],
        grammarTip: "'Drill down' es el término universal en BI para pasar de un resumen a un nivel más granular de detalle."
    },

    // ==========================================
    // 4. DEVOPS, CI/CD & CLOUD INFRASTRUCTURE
    // ==========================================
    {
        id: "devops-1",
        missionId: "mission-devops-cloud",
        category: "devops",
        categoryLabel: "DevOps & Cloud Infra",
        level: "B2",
        english: "The deployment pipeline triggered an automatic rollback because the health check failed three consecutive times.",
        spanish: "El pipeline de despliegue activó una reversión automática porque la comprobación de estado falló tres veces consecutivas.",
        phonetic: "de diplóiment páiplain tríguerd an otomátik róulbak bikós de jelz chek feild zri konsékiutiv táims",
        keyTerms: ["deployment pipeline", "triggered", "automatic rollback", "health check", "consecutive"],
        distractors: ["forward", "succeeded", "restart", "cluster"],
        blankWord: "rollback",
        blankOptions: ["rollback", "rollout", "pullback", "fallback"],
        audioDistractors: [
            "The deployment pipeline triggered an automatic rollback because the health check failed three consecutive times.",
            "The deployment pipeline triggered an automatic roll-out because the health check failed three consecutive times.",
            "The deployment pipeline trigger an automatic rollback because the health check was fail three consecutive times."
        ],
        grammarTip: "'Trigger' significa disparar / activar automáticamente como resultado de una condición previa."
    },
    {
        id: "devops-2",
        missionId: "mission-devops-cloud",
        category: "devops",
        categoryLabel: "DevOps & Cloud Infra",
        level: "B2",
        english: "Several Kubernetes pods are stuck in CrashLoopBackOff due to missing environment variables.",
        spanish: "Varios pods de Kubernetes están atascados en CrashLoopBackOff debido a variables de entorno faltantes.",
        phonetic: "séveral kiubernériz pods ar stak in krash-lup-bak-of diu tu mísin enváironment vériabols",
        keyTerms: ["Kubernetes pods", "stuck", "CrashLoopBackOff", "environment variables"],
        distractors: ["running", "healthy", "deployed", "scaled"],
        blankWord: "stuck",
        blankOptions: ["stuck", "fixed", "locked", "frozen"],
        audioDistractors: [
            "Several Kubernetes pods are stuck in CrashLoopBackOff due to missing environment variables.",
            "Several Kubernetes pods are stack in CrashLoopBackOff due to missing environment variables.",
            "Several Kubernetes pods is stuck in CrashLoopBackOff due to missed environment variables."
        ],
        grammarTip: "'Stuck' es el participio de 'stick' (quedar atascado o trabado en un bucle)."
    },
    {
        id: "devops-3",
        missionId: "mission-devops-cloud",
        category: "devops",
        categoryLabel: "DevOps & Cloud Infra",
        level: "C1",
        english: "We discovered infrastructure drift between our Terraform state file and the active cloud resources.",
        spanish: "Descubrimos desviación de infraestructura entre nuestro archivo de estado de Terraform y los recursos activos en la nube.",
        phonetic: "ui diskáverrd ínfrastrákcher drift bituín áur térraform steit fáil and de áktiv klaud risórses",
        keyTerms: ["infrastructure drift", "Terraform state", "cloud resources", "discovered"],
        distractors: ["alignment", "deleted", "pipeline", "docker"],
        blankWord: "drift",
        blankOptions: ["drift", "shift", "split", "gap"],
        audioDistractors: [
            "We discovered infrastructure drift between our Terraform state file and the active cloud resources.",
            "We discovered infrastructure draft between our Terraform state file and the active cloud resources.",
            "We have discover infrastructure drift between our Terraform state file and the active cloud resources."
        ],
        grammarTip: "'Drift' se refiere a la diferencia o divergencia no deseada que ocurre con el tiempo."
    },

    // ==========================================
    // 5. EVERYDAY REAL-LIFE IMMERSION (Alex Rawlings Method)
    // ==========================================
    {
        id: "everyday-1",
        missionId: "mission-daily-immersion",
        category: "everydayLife",
        categoryLabel: "Vida Cotidiana & Inmersión",
        level: "A2",
        english: "Could I get a medium oat milk latte and a warm croissant to go, please?",
        spanish: "¿Podrías darme un latte mediano con leche de avena y un croissant caliente para llevar, por favor?",
        phonetic: "kud ai get a mídium out milk látei and a uorm kruasán tu gou pliz",
        keyTerms: ["medium", "oat milk latte", "warm croissant", "to go"],
        distractors: ["for here", "cold", "sugar", "table"],
        blankWord: "to go",
        blankOptions: ["to go", "for here", "on the way", "take in"],
        audioDistractors: [
            "Could I get a medium oat milk latte and a warm croissant to go, please?",
            "Could I get a medium hot milk latte and a warm croissant for go, please?",
            "Can I to get a medium oat milk latte and an warm croissant to go, please?"
        ],
        grammarTip: "'Could I get...?' es la forma más natural y cortés en inglés americano para pedir en cafeterías y restaurantes."
    },
    {
        id: "everyday-2",
        missionId: "mission-daily-immersion",
        category: "everydayLife",
        categoryLabel: "Vida Cotidiana & Inmersión",
        level: "B1",
        english: "I have had a throbbing headache and a mild fever for the past two days.",
        spanish: "He tenido un dolor de cabeza pulsante y fiebre leve durante los últimos dos días.",
        phonetic: "ai jav jad a zróbin jédeik and a máild fíver for de past tu deis",
        keyTerms: ["throbbing headache", "mild fever", "past two days", "have had"],
        distractors: ["sharp", "cold", "since", "yesterday"],
        blankWord: "throbbing",
        blankOptions: ["throbbing", "beating", "pulsing", "hitting"],
        audioDistractors: [
            "I have had a throbbing headache and a mild fever for the past two days.",
            "I had a throwing headache and a mild fever for the past two days.",
            "I have have a throbbing headache and an mild fever since the past two days."
        ],
        grammarTip: "Usamos 'have had' (Present Perfect) porque el síntoma comenzó en el pasado y continúa hasta el momento de hablar con el médico."
    },
    {
        id: "everyday-3",
        missionId: "mission-daily-immersion",
        category: "everydayLife",
        categoryLabel: "Vida Cotidiana & Inmersión",
        level: "B1",
        english: "Do I need a prescription for these pain relievers, or are they available over the counter?",
        spanish: "¿Necesito una receta para estos analgésicos o están disponibles sin receta?",
        phonetic: "du ai nid a priskrípshon for diz pein rilívers or ar dei avéilabol óuver de káunter",
        keyTerms: ["prescription", "pain relievers", "over the counter", "available"],
        distractors: ["antibiotics", "doctor", "under the table", "free"],
        blankWord: "over the counter",
        blankOptions: ["over the counter", "under the counter", "off the shelf", "out of bounds"],
        audioDistractors: [
            "Do I need a prescription for these pain relievers, or are they available over the counter?",
            "Do I need a description for these pain relievers, or are they available over the counter?",
            "Does I need a prescription for this pain relievers, or are they available over the counter?"
        ],
        grammarTip: "'Over the counter' (OTC) es la expresión clave en países angloparlantes para medicamentos de venta libre."
    },
    {
        id: "everyday-4",
        missionId: "mission-daily-immersion",
        category: "everydayLife",
        categoryLabel: "Vida Cotidiana & Inmersión",
        level: "B1",
        english: "Excuse me, where is the baggage claim area for international arriving flights?",
        spanish: "Disculpe, ¿dónde está la zona de reclamo de equipaje para los vuelos internacionales que llegan?",
        phonetic: "ekskiús mi uer is de báguech kleim éria for internáshonal arráivin flaits",
        keyTerms: ["baggage claim", "international", "arriving flights", "excuse me"],
        distractors: ["boarding gate", "departures", "customs", "ticket"],
        blankWord: "baggage claim",
        blankOptions: ["baggage claim", "luggage check", "cargo drop", "suit area"],
        audioDistractors: [
            "Excuse me, where is the baggage claim area for international arriving flights?",
            "Excuse me, where is the package claim area for international arriving flights?",
            "Excuse me, where are the baggage claim area for international arriving flights?"
        ],
        grammarTip: "'Baggage claim' es el término estándar americano. En inglés británico se suele decir 'luggage reclaim'."
    },
    {
        id: "everyday-5",
        missionId: "mission-daily-immersion",
        category: "everydayLife",
        categoryLabel: "Vida Cotidiana & Inmersión",
        level: "A2",
        english: "Do you have this shirt in a larger size, or is this the last one in stock?",
        spanish: "¿Tienes esta camisa en una talla más grande, o es la última que queda en inventario?",
        phonetic: "du iu jav dis shert in a láryer sais or is dis de last uan in stok",
        keyTerms: ["larger size", "last one", "in stock", "shirt"],
        distractors: ["smaller", "color", "sold out", "discount"],
        blankWord: "in stock",
        blankOptions: ["in stock", "on store", "at hand", "in supply"],
        audioDistractors: [
            "Do you have this shirt in a larger size, or is this the last one in stock?",
            "Do you have this shirt in a longer size, or is this the last one on stock?",
            "Do you has this shirt in an larger size, or is this the last one in stock?"
        ],
        grammarTip: "'In stock' (disponible para venta) vs 'Out of stock' (agotado)."
    },
    {
        id: "everyday-6",
        missionId: "mission-daily-immersion",
        category: "everydayLife",
        categoryLabel: "Vida Cotidiana & Inmersión",
        level: "B2",
        english: "It was a pleasure meeting you; let's connect on LinkedIn to stay in touch regarding future projects.",
        spanish: "Fue un placer conocerte; conectemos en LinkedIn para mantenernos en contacto sobre futuros proyectos.",
        phonetic: "it uás a plésher mítin iu lets konékt on línkt-in tu stei in tach rigárdin fiúcher próyekts",
        keyTerms: ["pleasure meeting you", "connect", "stay in touch", "future projects"],
        distractors: ["see you", "call", "disconnect", "contract"],
        blankWord: "stay in touch",
        blankOptions: ["stay in touch", "keep in hand", "hold in mind", "put in place"],
        audioDistractors: [
            "It was a pleasure meeting you; let's connect on LinkedIn to stay in touch regarding future projects.",
            "It was a pleasure meeting you; let's connect on LinkedIn to stand in touch regarding future projects.",
            "It was pleasure to meet you; let's connect in LinkedIn for stay in touch regarding future projects."
        ],
        grammarTip: "'Nice meeting you' o 'Pleasure meeting you' se dice al DESPEDIRSE de alguien que acabas de conocer. Al inicio se dice 'Nice to meet you'."
    },

    // ==========================================
    // 6. CORE 1000 HIGH FREQUENCY COLOCATIONS (75% Del Inglés)
    // ==========================================
    {
        id: "core-1",
        missionId: "mission-core-frequency",
        category: "coreHighFrequency",
        categoryLabel: "Core 1000 en Contexto",
        level: "A2",
        english: "She has been working at this tech startup since early last year.",
        spanish: "Ella ha estado trabajando en esta startup tecnológica desde principios del año pasado.",
        phonetic: "shi jas bin uórkin at dis tek stártap sins érli last yir",
        keyTerms: ["has been working", "startup", "since", "early last year"],
        distractors: ["for", "worked", "from", "during"],
        blankWord: "since",
        blankOptions: ["since", "for", "during", "from"],
        audioDistractors: [
            "She has been working at this tech startup since early last year.",
            "She has been working at this tech startup for early last year.",
            "She was working at this tech startup since early last year."
        ],
        grammarTip: "Usamos 'since' con un punto específico de inicio en el tiempo (since 2020, since last year) y 'for' con duración (for 3 years)."
    },
    {
        id: "core-2",
        missionId: "mission-core-frequency",
        category: "coreHighFrequency",
        categoryLabel: "Core 1000 en Contexto",
        level: "A2",
        english: "I have been living in this apartment for almost three years now.",
        spanish: "He estado viviendo en este apartamento durante casi tres años.",
        phonetic: "ai jav bin lívin in dis apártment for ólmoust zri yirs nau",
        keyTerms: ["have been living", "apartment", "for", "almost three years"],
        distractors: ["since", "lived", "during", "ago"],
        blankWord: "for",
        blankOptions: ["for", "since", "during", "from"],
        audioDistractors: [
            "I have been living in this apartment for almost three years now.",
            "I have been living in this apartment since almost three years now.",
            "I am living in this apartment for almost three years now."
        ],
        grammarTip: "Trampa común de hispanohablantes: decir 'I live here since 3 years' (incorrecto). Lo natural es: 'I have been living here for 3 years'."
    },
    {
        id: "core-3",
        missionId: "mission-core-frequency",
        category: "coreHighFrequency",
        categoryLabel: "Core 1000 en Contexto",
        level: "B1",
        english: "We decided to postpone the team sync because several key members were unavailable.",
        spanish: "Decidimos posponer la sincronización de equipo porque varios miembros clave no estaban disponibles.",
        phonetic: "ui disáired tu postpóun de tim sink bikós séveral ki mémbers uer anavéilabol",
        keyTerms: ["postpone", "team sync", "several key members", "unavailable"],
        distractors: ["cancel", "attend", "available", "advance"],
        blankWord: "postpone",
        blankOptions: ["postpone", "put off", "advance", "suspend"],
        audioDistractors: [
            "We decided to postpone the team sync because several key members were unavailable.",
            "We decided to propose the team sync because several key members were unavailable.",
            "We have decide to postpone the team sync because several key members was unavailable."
        ],
        grammarTip: "'Postpone' (o el phrasal verb 'put off') significa aplazar o posponer una reunión a una fecha posterior."
    },
    {
        id: "core-4",
        missionId: "mission-core-frequency",
        category: "coreHighFrequency",
        categoryLabel: "Core 1000 en Contexto",
        level: "B1",
        english: "Could you please clarify what specific requirements are expected for this deliverable?",
        spanish: "¿Podrías aclarar qué requisitos específicos se esperan para este entregable?",
        phonetic: "kud iu pliz klárifai uat spesífik rikuáirments ar ekspékted for dis dilíverebol",
        keyTerms: ["clarify", "specific requirements", "expected", "deliverable"],
        distractors: ["explain", "ignore", "wanted", "deadline"],
        blankWord: "clarify",
        blankOptions: ["clarify", "confuse", "purify", "justify"],
        audioDistractors: [
            "Could you please clarify what specific requirements are expected for this deliverable?",
            "Could you please classify what specific requirements are expected for this deliverable?",
            "Can you please to clarify what specific requirements are expect for this deliverable?"
        ],
        grammarTip: "'Clarify' es mucho más formal y profesional que 'tell me again'."
    },
    {
        id: "core-5",
        missionId: "mission-core-frequency",
        category: "coreHighFrequency",
        categoryLabel: "Core 1000 en Contexto",
        level: "B1",
        english: "I look forward to hearing your feedback on the proposed architecture changes.",
        spanish: "Espero con entusiasmo escuchar sus comentarios sobre los cambios de arquitectura propuestos.",
        phonetic: "ai luk fór-uard tu jírin iur fíd-bak on de propóust árkitekcher chéinyis",
        keyTerms: ["look forward to", "hearing", "feedback", "proposed changes"],
        distractors: ["hear", "listen", "waiting", "review"],
        blankWord: "hearing",
        blankOptions: ["hearing", "hear", "listen", "listening"],
        audioDistractors: [
            "I look forward to hearing your feedback on the proposed architecture changes.",
            "I look forward to hear your feedback on the proposed architecture changes.",
            "I look forward for hearing your feedback on the proposed architecture changes."
        ],
        grammarTip: "¡Regla de oro!: En 'look forward to', 'to' es una preposición, por lo que el verbo que sigue SIEMPRE lleva -ing: 'look forward to hearing'."
    }
];

export const ARCADE_MISSIONS: ArcadeMission[] = [
    {
        id: "mission-cyber-incident",
        title: "Reporte de Incidente Crítico & SOC Triage",
        category: "cybersecurity",
        categoryName: "Ciberseguridad",
        icon: "SEC",
        level: "B2",
        description: "Domina las frases precisas para reportar brechas, aislar bases de datos, rotar tokens y responder ante incidentes de severidad 1.",
        estimatedMinutes: 4,
        challengeIds: ["cyber-1", "cyber-2", "cyber-3", "cyber-4", "cyber-5", "cyber-6", "cyber-7", "cyber-8"]
    },
    {
        id: "mission-webdev-architecture",
        title: "Arquitectura Web & Rendimiento Cloud",
        category: "webdev",
        categoryName: "Desarrollo Web",
        icon: "WEB",
        level: "B2",
        description: "Explica errores CORS, optimización de consultas SQL compuestas, SSR, limitación de tasa (rate limiting) y caching distribuido.",
        estimatedMinutes: 4,
        challengeIds: ["web-1", "web-2", "web-3", "web-4", "web-5", "web-6"]
    },
    {
        id: "mission-bi-data-pipelines",
        title: "Pipelines de Datos, ETL & BI Dashboards",
        category: "businessIntelligence",
        categoryName: "Business Intelligence",
        icon: "DATA",
        level: "B2",
        description: "Comunica fallos de pipelines ETL, medidas DAX avanzadas, esquemas en estrella y análisis de valores atípicos (outliers).",
        estimatedMinutes: 3,
        challengeIds: ["bi-1", "bi-2", "bi-3", "bi-4", "bi-5"]
    },
    {
        id: "mission-devops-cloud",
        title: "DevOps: Kubernetes & Despliegues Cloud",
        category: "devops",
        categoryName: "DevOps & Cloud",
        icon: "OPS",
        level: "B2",
        description: "Resuelve caídas de pods en CrashLoopBackOff, ejecución de rollbacks automatizados y detección de Terraform drift.",
        estimatedMinutes: 3,
        challengeIds: ["devops-1", "devops-2", "devops-3"]
    },
    {
        id: "mission-daily-immersion",
        title: "Vida Cotidiana: Cafetería, Médico & Aeropuerto",
        category: "everydayLife",
        categoryName: "Vida Cotidiana",
        icon: "LIFE",
        level: "B1",
        description: "Inmersión activa del Método Alex Rawlings: pide café con leche de avena, describe síntomas al doctor y navega el aeropuerto.",
        estimatedMinutes: 4,
        challengeIds: ["everyday-1", "everyday-2", "everyday-3", "everyday-4", "everyday-5", "everyday-6"]
    },
    {
        id: "mission-core-frequency",
        title: "Core 1000: Las Frases que Usarás el 75% del Tiempo",
        category: "coreHighFrequency",
        categoryName: "Core 1000",
        icon: "CORE",
        level: "A2",
        description: "Domina el uso exacto de 'since' vs 'for', Present Perfect Continuous y expresiones profesionales de alta frecuencia sin traducir.",
        estimatedMinutes: 3,
        challengeIds: ["core-1", "core-2", "core-3", "core-4", "core-5"]
    }
];
